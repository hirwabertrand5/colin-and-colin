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
exports.deleteInvoice = exports.uploadInvoiceFile = exports.uploadProof = exports.addInvoiceToCase = exports.getInvoicesForCase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const invoiceModel_1 = __importDefault(require("../models/invoiceModel"));
const counterModel_1 = __importDefault(require("../models/counterModel"));
const auditService_1 = require("../services/auditService");
// Get all invoices for a case
const getInvoicesForCase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let caseId = req.params.caseId;
        if (Array.isArray(caseId))
            caseId = caseId[0];
        if (!caseId)
            return res.status(400).json({ message: 'Missing caseId' });
        const invoices = yield invoiceModel_1.default.find({
            caseId: new mongoose_1.default.Types.ObjectId(caseId),
        }).sort({ date: 1 });
        res.json(invoices);
    }
    catch (_a) {
        res.status(500).json({ message: 'Failed to fetch invoices.' });
    }
});
exports.getInvoicesForCase = getInvoicesForCase;
// Add a new invoice (invoiceNo generated automatically)
const addInvoiceToCase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let caseId = req.params.caseId;
        if (Array.isArray(caseId))
            caseId = caseId[0];
        if (!caseId)
            return res.status(400).json({ message: 'Missing caseId' });
        const { date, amount, notes } = req.body;
        if (!date || amount === undefined) {
            return res.status(400).json({ message: 'date and amount are required' });
        }
        const year = new Date().getFullYear();
        // Atomic global yearly sequence
        const counterKey = `invoice:${year}`;
        const counter = yield counterModel_1.default.findOneAndUpdate({ key: counterKey }, { $inc: { seq: 1 } }, { new: true, upsert: true });
        const seqYear = counter.seq;
        // Per-case sequence
        const seqCase = (yield invoiceModel_1.default.countDocuments({ caseId: new mongoose_1.default.Types.ObjectId(caseId) })) + 1;
        // Format: INV-2026-1047-01
        const invoiceNo = `INV-${year}-${seqYear}-${String(seqCase).padStart(2, '0')}`;
        const invoice = new invoiceModel_1.default({
            caseId: new mongoose_1.default.Types.ObjectId(caseId),
            invoiceNo,
            year,
            seqYear,
            seqCase,
            date,
            amount,
            status: 'Pending',
            notes,
        });
        yield invoice.save();
        // --- AUDIT LOG ---
        const actorName = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.name) || 'System';
        const actorUserId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        yield (0, auditService_1.writeAudit)({
            caseId,
            actorName,
            actorUserId,
            action: 'INVOICE_CREATED',
            message: 'Created invoice',
            detail: `${invoiceNo} • RWF ${Number(amount).toLocaleString()}`,
        });
        res.status(201).json(invoice);
    }
    catch (_c) {
        res.status(500).json({ message: 'Failed to create invoice.' });
    }
});
exports.addInvoiceToCase = addInvoiceToCase;
// Mark invoice as paid + upload proof
const uploadProof = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const invoiceId = req.params.invoiceId;
        if (!req.file)
            return res.status(400).json({ message: 'No file uploaded' });
        // First get invoice (to know caseId + invoiceNo for audit)
        const existing = yield invoiceModel_1.default.findById(invoiceId);
        if (!existing)
            return res.status(404).json({ message: 'Invoice not found.' });
        const invoice = yield invoiceModel_1.default.findByIdAndUpdate(invoiceId, { status: 'Paid', proofUrl: `/uploads/${req.file.filename}` }, { new: true });
        if (!invoice)
            return res.status(404).json({ message: 'Invoice not found.' });
        // --- AUDIT LOG ---
        const actorName = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.name) || 'System';
        const actorUserId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        yield (0, auditService_1.writeAudit)({
            caseId: String(existing.caseId),
            actorName,
            actorUserId,
            action: 'INVOICE_PAID',
            message: 'Uploaded proof (invoice marked Paid)',
            detail: existing.invoiceNo,
        });
        res.json(invoice);
    }
    catch (_c) {
        res.status(500).json({ message: 'Failed to upload proof.' });
    }
});
exports.uploadProof = uploadProof;
// ✅ NEW: upload invoice file (separate from proof)
const uploadInvoiceFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const invoiceId = req.params.invoiceId;
        if (!req.file)
            return res.status(400).json({ message: 'No file uploaded' });
        const existing = yield invoiceModel_1.default.findById(invoiceId);
        if (!existing)
            return res.status(404).json({ message: 'Invoice not found.' });
        const updated = yield invoiceModel_1.default.findByIdAndUpdate(invoiceId, { invoiceFileUrl: `/uploads/${req.file.filename}` }, { new: true });
        const actorName = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.name) || 'System';
        const actorUserId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        yield (0, auditService_1.writeAudit)({
            caseId: String(existing.caseId),
            actorName,
            actorUserId,
            action: 'INVOICE_UPDATED',
            message: 'Uploaded invoice file',
            detail: existing.invoiceNo,
        });
        res.json(updated);
    }
    catch (_c) {
        res.status(500).json({ message: 'Failed to upload invoice file.' });
    }
});
exports.uploadInvoiceFile = uploadInvoiceFile;
// ✅ NEW: delete invoice
const deleteInvoice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const invoiceId = req.params.invoiceId;
        const existing = yield invoiceModel_1.default.findById(invoiceId);
        if (!existing)
            return res.status(404).json({ message: 'Invoice not found.' });
        yield invoiceModel_1.default.findByIdAndDelete(invoiceId);
        const actorName = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.name) || 'System';
        const actorUserId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        yield (0, auditService_1.writeAudit)({
            caseId: String(existing.caseId),
            actorName,
            actorUserId,
            action: 'INVOICE_DELETED',
            message: 'Deleted invoice',
            detail: existing.invoiceNo,
        });
        res.json({ message: 'Invoice deleted.' });
    }
    catch (_c) {
        res.status(500).json({ message: 'Failed to delete invoice.' });
    }
});
exports.deleteInvoice = deleteInvoice;
//# sourceMappingURL=invoiceController.js.map