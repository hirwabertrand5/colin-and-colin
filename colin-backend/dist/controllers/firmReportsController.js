"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
// GET /api/reports/firm?range=weekly|monthly|quarterly|yearly&from=YYYY-MM-DD&to=YYYY-MM-DD
const getFirmReports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Safety (route also has authorize)
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'managing_director') {
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
        const activeCases = yield caseModel_1.default.countDocuments({ status: { $ne: 'Closed' } });
        // Invoice date is stored as YYYY-MM-DD string, so string range works
        const invoicesInRange = yield invoiceModel_1.default.find({
            date: { $gte: fromISO, $lte: toISO },
        })
            .select('amount status date caseId')
            .lean();
        const billed = invoicesInRange.reduce((s, i) => s + (Number(i.amount) || 0), 0);
        const collected = invoicesInRange
            .filter((i) => i.status === 'Paid')
            .reduce((s, i) => s + (Number(i.amount) || 0), 0);
        const outstanding = Math.max(0, billed - collected);
        const hoursAgg = yield taskTimeLogModel_1.default.aggregate([
            { $match: { loggedAt: { $gte: fromDate, $lte: toDate } } },
            { $group: { _id: null, totalHours: { $sum: '$hours' } } },
        ]);
        const billableHours = Math.round(((((_b = hoursAgg === null || hoursAgg === void 0 ? void 0 : hoursAgg[0]) === null || _b === void 0 ? void 0 : _b.totalHours) || 0) * 10)) / 10;
        // -----------------------------
        // Team table (best-effort based on name strings)
        // -----------------------------
        const [casesAll, tasksCompleted, timeLogs, users] = yield Promise.all([
            caseModel_1.default.find().select('assignedTo status').lean(),
            taskModel_1.default.find({
                status: 'Completed',
                completedAt: { $gte: fromDate, $lte: toDate },
            })
                .select('assignee completedAt')
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
        for (const t of tasksCompleted) {
            const name = String(t.assignee || '—').trim();
            completedTasksByName.set(name, (completedTasksByName.get(name) || 0) + 1);
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
            };
        })
            .sort((a, b) => b.activeCases - a.activeCases);
        // -----------------------------
        // Case analytics by type + revenue by type (in range)
        // -----------------------------
        const caseTypeAgg = yield caseModel_1.default.aggregate([
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
        const caseIds = Array.from(new Set(invoicesInRange.map((i) => String(i.caseId)).filter(Boolean)));
        const casesForInvoices = yield caseModel_1.default.find({ _id: { $in: caseIds } })
            .select('_id caseType')
            .lean();
        const caseTypeById = new Map(casesForInvoices.map((c) => [String(c._id), c.caseType]));
        const revenueByType = new Map();
        for (const inv of invoicesInRange) {
            const ct = caseTypeById.get(String(inv.caseId)) || 'Unknown';
            revenueByType.set(ct, (revenueByType.get(ct) || 0) + (Number(inv.amount) || 0));
        }
        const caseTypes = caseTypeAgg.map((row) => (Object.assign(Object.assign({}, row), { avgDurationDays: row.avgDurationDays ? Math.round(row.avgDurationDays) : null, revenueBilled: Math.round((revenueByType.get(row.type) || 0) * 100) / 100 })));
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
        return res.status(500).json({ message: (e === null || e === void 0 ? void 0 : e.message) || 'Failed to load firm reports.' });
    }
});
exports.getFirmReports = getFirmReports;
//# sourceMappingURL=firmReportsController.js.map