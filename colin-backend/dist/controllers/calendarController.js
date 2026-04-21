"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalendarTasks = exports.getFirmEvents = void 0;
const eventModel_1 = __importDefault(require("../models/eventModel"));
const caseModel_1 = __importDefault(require("../models/caseModel"));
const taskModel_1 = __importDefault(require("../models/taskModel"));
const getFirmEvents = async (req, res) => {
    try {
        const { from, to, type = 'all', q = '' } = req.query;
        if (!from || !to) {
            return res.status(400).json({ message: 'from and to are required (YYYY-MM-DD)' });
        }
        const eventFilter = {
            date: { $gte: String(from), $lte: String(to) },
        };
        if (type && type !== 'all')
            eventFilter.type = type;
        if (q && String(q).trim()) {
            const regex = new RegExp(String(q).trim(), 'i');
            eventFilter.$or = [{ title: regex }, { description: regex }];
        }
        const role = req.user?.role;
        const userName = req.user?.name;
        if (role !== 'managing_director' && role !== 'executive_assistant') {
            if (!userName)
                return res.status(401).json({ message: 'Unauthorized (missing user name).' });
            const allowedCases = await caseModel_1.default.find({ assignedTo: userName }).select('_id');
            const allowedIds = allowedCases.map((c) => c._id);
            eventFilter.caseId = { $in: allowedIds };
        }
        const events = await eventModel_1.default.find(eventFilter).sort({ date: 1, time: 1 });
        const caseIds = Array.from(new Set(events.map((e) => String(e.caseId))));
        const cases = await caseModel_1.default.find({ _id: { $in: caseIds } }).select('_id caseNo parties');
        const caseMap = new Map(cases.map((c) => [String(c._id), c]));
        const result = events.map((e) => {
            const c = caseMap.get(String(e.caseId));
            return {
                ...e.toObject(),
                case: c ? { _id: String(c._id), caseNo: c.caseNo, parties: c.parties } : null,
            };
        });
        res.json(result);
    }
    catch {
        res.status(500).json({ message: 'Failed to fetch firm calendar events.' });
    }
};
exports.getFirmEvents = getFirmEvents;
// Task due overlay: returns tasks due in date range (same role rules)
const getCalendarTasks = async (req, res) => {
    try {
        const { from, to, q = '' } = req.query;
        if (!from || !to) {
            return res.status(400).json({ message: 'from and to are required (YYYY-MM-DD)' });
        }
        const taskFilter = {
            dueDate: { $gte: String(from), $lte: String(to) },
        };
        if (q && String(q).trim()) {
            const regex = new RegExp(String(q).trim(), 'i');
            taskFilter.$or = [{ title: regex }, { assignee: regex }];
        }
        const role = req.user?.role;
        const userName = req.user?.name;
        if (role !== 'managing_director' && role !== 'executive_assistant') {
            if (!userName)
                return res.status(401).json({ message: 'Unauthorized (missing user name).' });
            const allowedCases = await caseModel_1.default.find({ assignedTo: userName }).select('_id');
            const allowedIds = allowedCases.map((c) => c._id);
            taskFilter.caseId = { $in: allowedIds };
        }
        const tasks = await taskModel_1.default.find(taskFilter).sort({ dueDate: 1 });
        // attach case info
        const caseIds = Array.from(new Set(tasks.map((t) => String(t.caseId))));
        const cases = await caseModel_1.default.find({ _id: { $in: caseIds } }).select('_id caseNo parties');
        const caseMap = new Map(cases.map((c) => [String(c._id), c]));
        const result = tasks.map((t) => {
            const c = caseMap.get(String(t.caseId));
            return {
                ...t.toObject(),
                case: c ? { _id: String(c._id), caseNo: c.caseNo, parties: c.parties } : null,
            };
        });
        res.json(result);
    }
    catch {
        res.status(500).json({ message: 'Failed to fetch calendar tasks.' });
    }
};
exports.getCalendarTasks = getCalendarTasks;
//# sourceMappingURL=calendarController.js.map