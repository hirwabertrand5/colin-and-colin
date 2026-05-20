"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirmReports = void 0;
const caseModel_1 = __importDefault(require("../models/caseModel"));
const taskModel_1 = __importDefault(require("../models/taskModel"));
const invoiceModel_1 = __importDefault(require("../models/invoiceModel"));
const taskTimeLogModel_1 = __importDefault(require("../models/taskTimeLogModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const iso = (d) => d.toISOString().slice(0, 10);
function computeRange(range) {
    const to = new Date();
    to.setHours(23, 59, 59, 999);
    const from = new Date(to);
    const r = String(range || 'monthly').toLowerCase();
    if (r === 'weekly')
        from.setDate(from.getDate() - 7);
    else if (r === 'quarterly')
        from.setMonth(from.getMonth() - 3);
    else if (r === 'yearly')
        from.setFullYear(from.getFullYear() - 1);
    else
        from.setMonth(from.getMonth() - 1); // monthly default
    from.setHours(0, 0, 0, 0);
    return { from, to };
}
const monthKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
};
const selectedPathLabel = (c) => {
    const path = Array.isArray(c?.legalServicePath) ? c.legalServicePath : [];
    const selected = path
        .map((item) => String(item?.label || '').trim())
        .filter(Boolean);
    return selected.length
        ? selected.join(' / ')
        : String(c?.matterType || c?.workflow || c?.caseType || 'Unclassified');
};
const getPerformanceZone = (task) => {
    if (!task?.createdAt || !task?.completedAt || !task?.dueDate)
        return null;
    const assignedAt = new Date(task.createdAt);
    const completedAt = new Date(task.completedAt);
    const dueAt = new Date(`${task.dueDate}T23:59:59.999`);
    const totalMs = dueAt.getTime() - assignedAt.getTime();
    const usedMs = completedAt.getTime() - assignedAt.getTime();
    if (!Number.isFinite(totalMs) || !Number.isFinite(usedMs) || totalMs <= 0)
        return null;
    const usedRatio = Math.max(0, usedMs / totalMs);
    const usedPercent = Math.round(usedRatio * 1000) / 10;
    if (usedRatio <= 0.25)
        return { zone: 'excellent', usedPercent };
    if (usedRatio <= 0.55)
        return { zone: 'good', usedPercent };
    if (usedRatio <= 0.85)
        return { zone: 'delayed', usedPercent };
    return { zone: 'risk', usedPercent };
};
// GET /api/reports/firm?range=weekly|monthly|quarterly|yearly&from=YYYY-MM-DD&to=YYYY-MM-DD
const getFirmReports = async (req, res) => {
    try {
        // Safety (route also has authorize)
        if (req.user?.role !== 'managing_director') {
            return res.status(403).json({ message: 'Forbidden.' });
        }
        const { range, from, to } = req.query;
        let fromDate;
        let toDate;
        if (from && to) {
            fromDate = new Date(String(from));
            toDate = new Date(String(to));
            if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
                return res.status(400).json({ message: 'Invalid from/to date.' });
            }
            fromDate.setHours(0, 0, 0, 0);
            toDate.setHours(23, 59, 59, 999);
        }
        else {
            ({ from: fromDate, to: toDate } = computeRange(range));
        }
        const fromISO = iso(fromDate);
        const toISO = iso(toDate);
        // -----------------------------
        // KPIs
        // -----------------------------
        // "Active" = anything not explicitly Closed
        const activeCases = await caseModel_1.default.countDocuments({ status: { $ne: 'Closed' } });
        // Invoice date is stored as YYYY-MM-DD string, so string range works
        const invoicesInRange = await invoiceModel_1.default.find({
            date: { $gte: fromISO, $lte: toISO },
        })
            .select('amount status date caseId')
            .lean();
        const billed = invoicesInRange.reduce((s, i) => s + (Number(i.amount) || 0), 0);
        const collected = invoicesInRange
            .filter((i) => i.status === 'Paid')
            .reduce((s, i) => s + (Number(i.amount) || 0), 0);
        const outstanding = Math.max(0, billed - collected);
        const hoursAgg = await taskTimeLogModel_1.default.aggregate([
            { $match: { loggedAt: { $gte: fromDate, $lte: toDate } } },
            { $group: { _id: null, totalHours: { $sum: '$hours' } } },
        ]);
        const billableHours = Math.round(((hoursAgg?.[0]?.totalHours || 0) * 10)) / 10;
        // -----------------------------
        // Team table (best-effort based on name strings)
        // -----------------------------
        const [casesAll, tasksCompleted, timeLogs, users] = await Promise.all([
            caseModel_1.default.find().select('assignedTo status').lean(),
            taskModel_1.default.find({
                status: 'Completed',
                completedAt: { $gte: fromDate, $lte: toDate },
            })
                .select('assignee completedAt dueDate caseId createdAt')
                .lean(),
            taskTimeLogModel_1.default.find({
                loggedAt: { $gte: fromDate, $lte: toDate },
            })
                .select('userName hours')
                .lean(),
            userModel_1.default.find({ isActive: { $ne: false } }).select('name role').lean(),
        ]);
        const activeByName = new Map();
        for (const c of casesAll) {
            const isActive = String(c.status || '').toLowerCase() !== 'closed';
            if (!isActive)
                continue;
            const name = String(c.assignedTo || '—').trim();
            activeByName.set(name, (activeByName.get(name) || 0) + 1);
        }
        const completedTasksByName = new Map();
        const earlyByName = new Map();
        const onTimeByName = new Map();
        const lateByName = new Map();
        const excellentByName = new Map();
        const goodByName = new Map();
        const delayedByName = new Map();
        const riskByName = new Map();
        const usedPercentByName = new Map();
        const completedCaseIds = Array.from(new Set(tasksCompleted.map((t) => String(t.caseId)).filter(Boolean)));
        const completedCases = await caseModel_1.default.find({ _id: { $in: completedCaseIds } })
            .select('_id workflowProgress.completedValue')
            .lean();
        const caseEarnedById = new Map(completedCases.map((c) => [String(c._id), Number(c.workflowProgress?.completedValue?.amount) || 0]));
        const completedTaskCountByCase = new Map();
        for (const t of tasksCompleted) {
            const caseId = String(t.caseId || '');
            if (!caseId)
                continue;
            completedTaskCountByCase.set(caseId, (completedTaskCountByCase.get(caseId) || 0) + 1);
        }
        const earnedByName = new Map();
        for (const t of tasksCompleted) {
            const name = String(t.assignee || '—').trim();
            completedTasksByName.set(name, (completedTasksByName.get(name) || 0) + 1);
            const due = new Date(`${t.dueDate}T23:59:59.999`);
            const completed = t.completedAt ? new Date(t.completedAt) : undefined;
            if (completed && Number.isFinite(due.getTime())) {
                const diffHours = (due.getTime() - completed.getTime()) / (1000 * 60 * 60);
                if (diffHours >= 24)
                    earlyByName.set(name, (earlyByName.get(name) || 0) + 1);
                else if (diffHours >= 0)
                    onTimeByName.set(name, (onTimeByName.get(name) || 0) + 1);
                else
                    lateByName.set(name, (lateByName.get(name) || 0) + 1);
            }
            const perf = getPerformanceZone(t);
            if (perf) {
                if (perf.zone === 'excellent')
                    excellentByName.set(name, (excellentByName.get(name) || 0) + 1);
                if (perf.zone === 'good')
                    goodByName.set(name, (goodByName.get(name) || 0) + 1);
                if (perf.zone === 'delayed')
                    delayedByName.set(name, (delayedByName.get(name) || 0) + 1);
                if (perf.zone === 'risk')
                    riskByName.set(name, (riskByName.get(name) || 0) + 1);
                usedPercentByName.set(name, [...(usedPercentByName.get(name) || []), perf.usedPercent]);
            }
            const caseId = String(t.caseId || '');
            const taskShare = (caseEarnedById.get(caseId) || 0) / Math.max(1, completedTaskCountByCase.get(caseId) || 1);
            earnedByName.set(name, (earnedByName.get(name) || 0) + taskShare);
        }
        const overdueTasks = await taskModel_1.default.find({
            status: { $ne: 'Completed' },
            dueDate: { $lt: iso(new Date()) },
        })
            .select('assignee')
            .lean();
        const overdueByName = new Map();
        for (const t of overdueTasks) {
            const name = String(t.assignee || '—').trim();
            overdueByName.set(name, (overdueByName.get(name) || 0) + 1);
        }
        const hoursByName = new Map();
        for (const l of timeLogs) {
            const name = String(l.userName || '—').trim();
            hoursByName.set(name, (hoursByName.get(name) || 0) + (Number(l.hours) || 0));
        }
        const team = users
            .map((u) => {
            const name = String(u.name || '—').trim();
            return {
                name,
                role: u.role,
                activeCases: activeByName.get(name) || 0,
                tasksCompleted: completedTasksByName.get(name) || 0,
                billableHours: Math.round(((hoursByName.get(name) || 0) * 10)) / 10,
                earnedFees: Math.round((earnedByName.get(name) || 0) * 100) / 100,
                earlyTasks: earlyByName.get(name) || 0,
                onTimeTasks: onTimeByName.get(name) || 0,
                lateTasks: lateByName.get(name) || 0,
                overdueTasks: overdueByName.get(name) || 0,
                excellentTasks: excellentByName.get(name) || 0,
                goodTasks: goodByName.get(name) || 0,
                delayedTasks: delayedByName.get(name) || 0,
                riskTasks: riskByName.get(name) || 0,
                averageTimeUsedPercent: (() => {
                    const values = usedPercentByName.get(name) || [];
                    if (!values.length)
                        return null;
                    return Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10;
                })(),
            };
        })
            .sort((a, b) => b.activeCases - a.activeCases);
        // -----------------------------
        // Case analytics by type + revenue by type (in range)
        // -----------------------------
        const casesForAnalytics = await caseModel_1.default.find()
            .select('caseType matterType workflow legalServicePath status updatedAt createdAt')
            .lean();
        const caseAnalyticsByPath = new Map();
        for (const c of casesForAnalytics) {
            const type = selectedPathLabel(c);
            const current = caseAnalyticsByPath.get(type) || {
                type,
                active: 0,
                closed: 0,
                durationTotal: 0,
                durationCount: 0,
            };
            const closed = String(c.status || '').toLowerCase() === 'closed';
            if (closed) {
                current.closed += 1;
                const duration = (new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24);
                if (Number.isFinite(duration)) {
                    current.durationTotal += duration;
                    current.durationCount += 1;
                }
            }
            else {
                current.active += 1;
            }
            caseAnalyticsByPath.set(type, current);
        }
        const caseIds = Array.from(new Set(invoicesInRange.map((i) => String(i.caseId)).filter(Boolean)));
        const casesForInvoices = await caseModel_1.default.find({ _id: { $in: caseIds } })
            .select('_id caseType matterType workflow legalServicePath')
            .lean();
        const caseTypeById = new Map(casesForInvoices.map((c) => [String(c._id), selectedPathLabel(c)]));
        const revenueByType = new Map();
        for (const inv of invoicesInRange) {
            const ct = caseTypeById.get(String(inv.caseId)) || 'Unknown';
            revenueByType.set(ct, (revenueByType.get(ct) || 0) + (Number(inv.amount) || 0));
        }
        const caseTypes = Array.from(caseAnalyticsByPath.values()).map((row) => ({
            type: row.type,
            active: row.active,
            closed: row.closed,
            avgDurationDays: row.durationCount > 0 ? Math.round(row.durationTotal / row.durationCount) : null,
            revenueBilled: Math.round((revenueByType.get(row.type) || 0) * 100) / 100,
        })).sort((a, b) => a.type.localeCompare(b.type));
        // Billing trend by month
        const monthsMap = new Map();
        for (const inv of invoicesInRange) {
            const dt = new Date(inv.date);
            const key = monthKey(dt);
            const item = monthsMap.get(key) || { month: key, billed: 0, collected: 0 };
            item.billed += Number(inv.amount) || 0;
            if (inv.status === 'Paid')
                item.collected += Number(inv.amount) || 0;
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
    }
    catch (e) {
        return res.status(500).json({ message: e?.message || 'Failed to load firm reports.' });
    }
};
exports.getFirmReports = getFirmReports;
//# sourceMappingURL=firmReportsController.js.map