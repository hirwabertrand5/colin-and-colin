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
exports.listInvoices = exports.getRecentInvoices = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const invoiceModel_1 = __importDefault(require("../models/invoiceModel"));
const caseModel_1 = __importDefault(require("../models/caseModel"));
const attachCaseInfo = (invoices) => __awaiter(void 0, void 0, void 0, function* () {
    const caseIds = Array.from(new Set(invoices.map((i) => String(i.caseId))));
    const cases = yield caseModel_1.default.find({ _id: { $in: caseIds } }).select('_id caseNo parties').lean();
    const caseMap = new Map(cases.map((c) => [String(c._id), c]));
    return invoices.map((inv) => (Object.assign(Object.assign({}, inv), { case: caseMap.get(String(inv.caseId)) || null })));
});
// GET /api/invoices/recent?limit=10
const getRecentInvoices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = Math.min(Number(req.query.limit) || 10, 50);
        const invoices = yield invoiceModel_1.default.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
        res.json(yield attachCaseInfo(invoices));
    }
    catch (_a) {
        res.status(500).json({ message: 'Failed to fetch recent invoices.' });
    }
});
exports.getRecentInvoices = getRecentInvoices;
// GET /api/invoices?status=Paid|Pending&q=...&caseId=...&from=...&to=...
const listInvoices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, q, caseId, from, to } = req.query;
        const filter = {};
        if (status && ['Paid', 'Pending'].includes(String(status)))
            filter.status = String(status);
        if (caseId) {
            if (!mongoose_1.default.Types.ObjectId.isValid(String(caseId))) {
                return res.status(400).json({ message: 'Invalid caseId.' });
            }
            filter.caseId = new mongoose_1.default.Types.ObjectId(String(caseId));
        }
        if (from || to) {
            filter.date = {};
            if (from)
                filter.date.$gte = String(from);
            if (to)
                filter.date.$lte = String(to);
        }
        if (q && String(q).trim()) {
            const regex = new RegExp(String(q).trim(), 'i');
            filter.$or = [{ invoiceNo: regex }, { notes: regex }];
        }
        const invoices = yield invoiceModel_1.default.find(filter).sort({ date: -1, createdAt: -1 }).lean();
        res.json(yield attachCaseInfo(invoices));
    }
    catch (_a) {
        res.status(500).json({ message: 'Failed to list invoices.' });
    }
});
exports.listInvoices = listInvoices;
//# sourceMappingURL=invoiceQueryController.js.map