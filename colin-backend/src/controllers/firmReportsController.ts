import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';

import Case from '../models/caseModel';
import Task from '../models/taskModel';
import Invoice from '../models/invoiceModel';
import TaskTimeLog from '../models/taskTimeLogModel';
import User from '../models/userModel';

const iso = (d: Date) => d.toISOString().slice(0, 10);

function computeRange(range?: string) {
  const to = new Date();
  to.setHours(23, 59, 59, 999);

  const from = new Date(to);
  const r = String(range || 'monthly').toLowerCase();

  if (r === 'weekly') from.setDate(from.getDate() - 7);
  else if (r === 'quarterly') from.setMonth(from.getMonth() - 3);
  else if (r === 'yearly') from.setFullYear(from.getFullYear() - 1);
  else from.setMonth(from.getMonth() - 1); // monthly default

  from.setHours(0, 0, 0, 0);
  return { from, to };
}

const monthKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

// GET /api/reports/firm?range=weekly|monthly|quarterly|yearly&from=YYYY-MM-DD&to=YYYY-MM-DD
export const getFirmReports = async (req: AuthRequest, res: Response) => {
  try {
    // Safety (route also has authorize)
    if (req.user?.role !== 'managing_director') {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const { range, from, to } = req.query as any;

    let fromDate: Date;
    let toDate: Date;

    if (from && to) {
      fromDate = new Date(String(from));
      toDate = new Date(String(to));
      if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
        return res.status(400).json({ message: 'Invalid from/to date.' });
      }
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);
    } else {
      ({ from: fromDate, to: toDate } = computeRange(range));
    }

    const fromISO = iso(fromDate);
    const toISO = iso(toDate);

    // -----------------------------
    // KPIs
    // -----------------------------
    // "Active" = anything not explicitly Closed
    const activeCases = await Case.countDocuments({ status: { $ne: 'Closed' } });

    // Invoice date is stored as YYYY-MM-DD string, so string range works
    const invoicesInRange = await Invoice.find({
      date: { $gte: fromISO, $lte: toISO },
    })
      .select('amount status date caseId')
      .lean();

    const billed = invoicesInRange.reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);
    const collected = invoicesInRange
      .filter((i: any) => i.status === 'Paid')
      .reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);
    const outstanding = Math.max(0, billed - collected);

    const hoursAgg = await TaskTimeLog.aggregate([
      { $match: { loggedAt: { $gte: fromDate, $lte: toDate } } },
      { $group: { _id: null, totalHours: { $sum: '$hours' } } },
    ]);
    const billableHours = Math.round((((hoursAgg?.[0]?.totalHours as number) || 0) * 10)) / 10;

    // -----------------------------
    // Team table (best-effort based on name strings)
    // -----------------------------
    const [casesAll, tasksCompleted, timeLogs, users] = await Promise.all([
      Case.find().select('assignedTo status').lean(),
      Task.find({
        status: 'Completed',
        completedAt: { $gte: fromDate, $lte: toDate },
      })
        .select('assignee completedAt')
        .lean(),
      TaskTimeLog.find({
        loggedAt: { $gte: fromDate, $lte: toDate },
      })
        .select('userName hours')
        .lean(),
      User.find({ isActive: { $ne: false } }).select('name role').lean(),
    ]);

    const activeByName = new Map<string, number>();
    for (const c of casesAll as any[]) {
      const isActive = String(c.status || '').toLowerCase() !== 'closed';
      if (!isActive) continue;
      const name = String(c.assignedTo || '—').trim();
      activeByName.set(name, (activeByName.get(name) || 0) + 1);
    }

    const completedTasksByName = new Map<string, number>();
    for (const t of tasksCompleted as any[]) {
      const name = String(t.assignee || '—').trim();
      completedTasksByName.set(name, (completedTasksByName.get(name) || 0) + 1);
    }

    const hoursByName = new Map<string, number>();
    for (const l of timeLogs as any[]) {
      const name = String(l.userName || '—').trim();
      hoursByName.set(name, (hoursByName.get(name) || 0) + (Number(l.hours) || 0));
    }

    const team = (users as any[])
      .map((u) => {
        const name = String(u.name || '—').trim();
        return {
          name,
          role: u.role,
          activeCases: activeByName.get(name) || 0,
          tasksCompleted: completedTasksByName.get(name) || 0,
          billableHours: Math.round(((hoursByName.get(name) || 0) * 10)) / 10,
        };
      })
      .sort((a, b) => b.activeCases - a.activeCases);

    // -----------------------------
    // Case analytics by type + revenue by type (in range)
    // -----------------------------
    const caseTypeAgg = await Case.aggregate([
      {
        $group: {
          _id: '$caseType',
          active: { $sum: { $cond: [{ $ne: ['$status', 'Closed'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] } },
          avgDurationDays: {
            $avg: {
              $cond: [
                { $eq: ['$status', 'Closed'] },
                { $divide: [{ $subtract: ['$updatedAt', '$createdAt'] }, 1000 * 60 * 60 * 24] },
                null,
              ],
            },
          },
        },
      },
      { $project: { type: '$_id', active: 1, closed: 1, avgDurationDays: 1, _id: 0 } },
      { $sort: { type: 1 } },
    ]);

    const caseIds = Array.from(
      new Set((invoicesInRange as any[]).map((i) => String(i.caseId)).filter(Boolean))
    );

    const casesForInvoices = await Case.find({ _id: { $in: caseIds } })
      .select('_id caseType')
      .lean();

    const caseTypeById = new Map((casesForInvoices as any[]).map((c) => [String(c._id), c.caseType]));

    const revenueByType = new Map<string, number>();
    for (const inv of invoicesInRange as any[]) {
      const ct = caseTypeById.get(String(inv.caseId)) || 'Unknown';
      revenueByType.set(ct, (revenueByType.get(ct) || 0) + (Number(inv.amount) || 0));
    }

    const caseTypes = (caseTypeAgg as any[]).map((row) => ({
      ...row,
      avgDurationDays: row.avgDurationDays ? Math.round(row.avgDurationDays) : null,
      revenueBilled: Math.round((revenueByType.get(row.type) || 0) * 100) / 100,
    }));

    // Billing trend by month
    const monthsMap = new Map<string, { month: string; billed: number; collected: number }>();
    for (const inv of invoicesInRange as any[]) {
      const dt = new Date(inv.date);
      const key = monthKey(dt);
      const item = monthsMap.get(key) || { month: key, billed: 0, collected: 0 };
      item.billed += Number(inv.amount) || 0;
      if (inv.status === 'Paid') item.collected += Number(inv.amount) || 0;
      monthsMap.set(key, item);
    }
    const months = Array.from(monthsMap.values()).sort((a, b) => a.month.localeCompare(b.month));

    return res.json({
      range: { from: fromISO, to: toISO },
      kpis: { activeCases, billed, collected, outstanding, billableHours },
      team,
      caseTypes,
      months,
    });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || 'Failed to load firm reports.' });
  }
};