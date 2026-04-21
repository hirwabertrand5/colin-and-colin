"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExecutiveAssistantDashboard = void 0;
const caseModel_1 = __importDefault(require("../models/caseModel"));
const taskModel_1 = __importDefault(require("../models/taskModel"));
const eventModel_1 = __importDefault(require("../models/eventModel"));
const documentModel_1 = __importDefault(require("../models/documentModel"));
const isoToday = () => new Date().toISOString().slice(0, 10);
const startOfMonthISO = () => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
};
const startOfMonthDate = () => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
};
const toISODate = (d) => d.toISOString().slice(0, 10);
const getExecutiveAssistantDashboard = async (req, res) => {
    try {
        const role = req.user?.role;
        if (role !== 'managing_director' && role !== 'executive_assistant') {
            return res.status(403).json({ message: 'Forbidden.' });
        }
        const todayISO = isoToday();
        const monthStartISO = startOfMonthISO();
        const monthStartDate = startOfMonthDate();
        // ----------------------------
        // Stats (MTD)
        // ----------------------------
        const [casesCreatedMTD, documentsUploadedMTD, scheduledEventsMTD, tasksCoordinatedMTD] = await Promise.all([
            caseModel_1.default.countDocuments({ createdAt: { $gte: monthStartDate } }),
            documentModel_1.default.countDocuments({ createdAt: { $gte: monthStartDate } }),
            eventModel_1.default.countDocuments({ date: { $gte: monthStartISO, $lte: todayISO } }),
            taskModel_1.default.countDocuments({ createdAt: { $gte: monthStartDate } }),
        ]);
        // ----------------------------
        // Today schedule (events today)
        // ----------------------------
        const todayEvents = await eventModel_1.default.find({ date: todayISO })
            .sort({ time: 1 })
            .limit(20)
            .lean();
        // Attach case labels to events
        const todayCaseIds = Array.from(new Set(todayEvents.map((e) => String(e.caseId)).filter(Boolean)));
        const todayCases = await caseModel_1.default.find({ _id: { $in: todayCaseIds } }).select('_id caseNo parties').lean();
        const caseMap = new Map(todayCases.map((c) => [String(c._id), c]));
        const todaySchedule = todayEvents.map((e) => {
            const c = caseMap.get(String(e.caseId));
            const caseLabel = c ? c.caseNo || c.parties : '';
            return {
                id: String(e._id),
                time: e.time || '—',
                title: caseLabel ? `${e.title} — ${caseLabel}` : e.title,
                type: e.type,
                description: e.description || '',
            };
        });
        // ----------------------------
        // Pending follow-up (tasks)
        // - show tasks not completed, soonest due first
        // ----------------------------
        const pendingTasks = await taskModel_1.default.find({ status: { $ne: 'Completed' } })
            .sort({ dueDate: 1, priority: 1 })
            .limit(10)
            .lean();
        // attach case labels to tasks
        const pendingCaseIds = Array.from(new Set(pendingTasks.map((t) => String(t.caseId)).filter(Boolean)));
        const pendingCases = await caseModel_1.default.find({ _id: { $in: pendingCaseIds } }).select('_id caseNo parties').lean();
        const pendingCaseMap = new Map(pendingCases.map((c) => [String(c._id), c]));
        const pendingFollowUp = pendingTasks.map((t) => {
            const c = pendingCaseMap.get(String(t.caseId));
            const caseLabel = c ? c.caseNo || c.parties : '';
            return {
                id: String(t._id),
                type: t.requiresApproval && t.approvalStatus === 'Pending' ? 'Approval' : 'Task',
                title: caseLabel ? `${t.title} — ${caseLabel}` : t.title,
                assignedTo: t.assignee || '—',
                status: t.status,
                dueDate: t.dueDate || '—',
                priority: t.priority || 'Medium',
            };
        });
        // ----------------------------
        // Recent cases (last 5)
        // ----------------------------
        const recent = await caseModel_1.default.find().sort({ createdAt: -1 }).limit(5).lean();
        const recentCases = recent.map((c) => ({
            id: String(c._id),
            name: c.caseNo || c.parties || '—',
            status: c.status || '—',
            client: c.parties || '—',
            createdDate: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '',
        }));
        // ----------------------------
        // Response
        // ----------------------------
        res.json({
            stats: {
                casesCreatedMTD,
                documentsUploadedMTD,
                scheduledEventsMTD,
                tasksCoordinatedMTD,
            },
            today: {
                dateISO: todayISO,
                label: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
            },
            todaySchedule,
            pendingFollowUp,
            recentCases,
        });
    }
    catch (e) {
        res.status(500).json({ message: e?.message || 'Failed to load executive assistant dashboard.' });
    }
};
exports.getExecutiveAssistantDashboard = getExecutiveAssistantDashboard;
//# sourceMappingURL=dashboardController.js.map