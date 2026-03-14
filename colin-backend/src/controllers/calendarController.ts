import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authMiddleware';
import Event from '../models/eventModel';
import Case from '../models/caseModel';
import Task from '../models/taskModel';

export const getFirmEvents = async (req: AuthRequest, res: Response) => {
  try {
    const { from, to, type = 'all', q = '' } = req.query as any;

    if (!from || !to) {
      return res.status(400).json({ message: 'from and to are required (YYYY-MM-DD)' });
    }

    const eventFilter: any = {
      date: { $gte: String(from), $lte: String(to) },
    };

    if (type && type !== 'all') eventFilter.type = type;

    if (q && String(q).trim()) {
      const regex = new RegExp(String(q).trim(), 'i');
      eventFilter.$or = [{ title: regex }, { description: regex }];
    }

    const role = req.user?.role;
    const userName = req.user?.name;

    if (role !== 'managing_director' && role !== 'executive_assistant') {
      if (!userName) return res.status(401).json({ message: 'Unauthorized (missing user name).' });

      const allowedCases = await Case.find({ assignedTo: userName }).select('_id');
      const allowedIds = allowedCases.map((c: any) => c._id);
      eventFilter.caseId = { $in: allowedIds };
    }

    const events = await Event.find(eventFilter).sort({ date: 1, time: 1 });

    const caseIds = Array.from(new Set(events.map((e: any) => String(e.caseId))));
    const cases = await Case.find({ _id: { $in: caseIds } }).select('_id caseNo parties');
    const caseMap = new Map(cases.map((c: any) => [String(c._id), c]));

    const result = events.map((e: any) => {
      const c = caseMap.get(String(e.caseId));
      return {
        ...e.toObject(),
        case: c ? { _id: String(c._id), caseNo: c.caseNo, parties: c.parties } : null,
      };
    });

    res.json(result);
  } catch {
    res.status(500).json({ message: 'Failed to fetch firm calendar events.' });
  }
};

// Task due overlay: returns tasks due in date range (same role rules)
export const getCalendarTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { from, to, q = '' } = req.query as any;

    if (!from || !to) {
      return res.status(400).json({ message: 'from and to are required (YYYY-MM-DD)' });
    }

    const taskFilter: any = {
      dueDate: { $gte: String(from), $lte: String(to) },
    };

    if (q && String(q).trim()) {
      const regex = new RegExp(String(q).trim(), 'i');
      taskFilter.$or = [{ title: regex }, { assignee: regex }];
    }

    const role = req.user?.role;
    const userName = req.user?.name;

    if (role !== 'managing_director' && role !== 'executive_assistant') {
      if (!userName) return res.status(401).json({ message: 'Unauthorized (missing user name).' });

      const allowedCases = await Case.find({ assignedTo: userName }).select('_id');
      const allowedIds = allowedCases.map((c: any) => c._id);
      taskFilter.caseId = { $in: allowedIds };
    }

    const tasks = await Task.find(taskFilter).sort({ dueDate: 1 });

    // attach case info
    const caseIds = Array.from(new Set(tasks.map((t: any) => String(t.caseId))));
    const cases = await Case.find({ _id: { $in: caseIds } }).select('_id caseNo parties');
    const caseMap = new Map(cases.map((c: any) => [String(c._id), c]));

    const result = tasks.map((t: any) => {
      const c = caseMap.get(String(t.caseId));
      return {
        ...t.toObject(),
        case: c ? { _id: String(c._id), caseNo: c.caseNo, parties: c.parties } : null,
      };
    });

    res.json(result);
  } catch {
    res.status(500).json({ message: 'Failed to fetch calendar tasks.' });
  }
};