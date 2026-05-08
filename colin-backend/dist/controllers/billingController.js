"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBillingSummary = void 0;
const invoiceModel_1 = __importDefault(require("../models/invoiceModel"));
const toISODate = (d) => d.toISOString().slice(0, 10);
const monthKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
};
// GET /api/billing/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
const getBillingSummary = async (req, res) => {
    try {
        const { from, to } = req.query;
        const toDate = to ? new Date(String(to)) : new Date();
        const fromDate = from ? new Date(String(from)) : new Date(new Date(toDate).setMonth(toDate.getMonth() - 5));
        if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
            return res.status(400).json({ message: 'Invalid from/to date.' });
        }
        // Your invoice.date is stored as YYYY-MM-DD string, so string range works.
        const fromStr = toISODate(fromDate);
        const toStr = toISODate(toDate);
        const invoices = await invoiceModel_1.default.find({ date: { $gte: fromStr, $lte: toStr } })
            .sort({ date: 1 })
            .lean();
        const billed = invoices.reduce((s, i) => s + (Number(i.amount) || 0), 0);
        const collected = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + (Number(i.amount) || 0), 0);
        const outstanding = Math.max(0, billed - collected);
        const collectionRate = billed > 0 ? Math.round((collected / billed) * 100) : 0;
        // monthly trend
        const map = new Map();
        for (const inv of invoices) {
            const dt = new Date(inv.date);
            const key = monthKey(dt);
            const item = map.get(key) || { month: key, billed: 0, collected: 0 };
            item.billed += Number(inv.amount) || 0;
            if (inv.status === 'Paid')
                item.collected += Number(inv.amount) || 0;
            map.set(key, item);
        }
        const months = Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
        res.json({ from: fromStr, to: toStr, billed, collected, outstanding, collectionRate, months });
    }
    catch {
        res.status(500).json({ message: 'Failed to fetch billing summary.' });
    }
};
exports.getBillingSummary = getBillingSummary;
//# sourceMappingURL=billingController.js.map