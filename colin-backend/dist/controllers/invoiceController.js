"use strict";
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
const getInvoicesForCase = async (req, res) => {
    try {
        let caseId = req.params.caseId;
        if (Array.isArray(caseId))
            caseId = caseId[0];
        if (!caseId)
            return res.status(400).json({ message: 'Missing caseId' });
        const invoices = await invoiceModel_1.default.find({
            caseId: new mongoose_1.default.Types.ObjectId(caseId),
        }).sort({ date: 1 });
        res.json(invoices);
    }
    catch {
        res.status(500).json({ message: 'Failed to fetch invoices.' });
    }
};
exports.getInvoicesForCase = getInvoicesForCase;
// Add a new invoice (invoiceNo generated automatically)
const addInvoiceToCase = async (req, res) => {
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
        const counter = await counterModel_1.default.findOneAndUpdate({ key: counterKey }, { $inc: { seq: 1 } }, { new: true, upsert: true });
        const seqYear = counter.seq;
        // Per-case sequence
        const seqCase = (await invoiceModel_1.default.countDocuments({ caseId: new mongoose_1.default.Types.ObjectId(caseId) })) + 1;
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
        await invoice.save();
        // --- AUDIT LOG ---
        const actorName = req.user?.name || 'System';
        const actorUserId = req.user?.id;
        await (0, auditService_1.writeAudit)({
            caseId,
            actorName,
            actorUserId,
            action: 'INVOICE_CREATED',
            message: 'Created invoice',
            detail: `${invoiceNo} • RWF ${Number(amount).toLocaleString()}`,
        });
        res.status(201).json(invoice);
    }
    catch {
        res.status(500).json({ message: 'Failed to create invoice.' });
    }
};
exports.addInvoiceToCase = addInvoiceToCase;
// Mark invoice as paid + upload proof
const uploadProof = async (req, res) => {
    try {
        const invoiceId = req.params.invoiceId;
        if (!req.file)
            return res.status(400).json({ message: 'No file uploaded' });
        // First get invoice (to know caseId + invoiceNo for audit)
        const existing = await invoiceModel_1.default.findById(invoiceId);
        if (!existing)
            return res.status(404).json({ message: 'Invoice not found.' });
        const invoice = await invoiceModel_1.default.findByIdAndUpdate(invoiceId, { status: 'Paid', proofUrl: `/uploads/${req.file.filename}` }, { new: true });
        if (!invoice)
            return res.status(404).json({ message: 'Invoice not found.' });
        // --- AUDIT LOG ---
        const actorName = req.user?.name || 'System';
        const actorUserId = req.user?.id;
        await (0, auditService_1.writeAudit)({
            caseId: String(existing.caseId),
            actorName,
            actorUserId,
            action: 'INVOICE_PAID',
            message: 'Uploaded proof (invoice marked Paid)',
            detail: existing.invoiceNo,
        });
        res.json(invoice);
    }
    catch {
        res.status(500).json({ message: 'Failed to upload proof.' });
    }
};
exports.uploadProof = uploadProof;
// ✅ NEW: upload invoice file (separate from proof)
const uploadInvoiceFile = async (req, res) => {
    try {
        const invoiceId = req.params.invoiceId;
        if (!req.file)
            return res.status(400).json({ message: 'No file uploaded' });
        const existing = await invoiceModel_1.default.findById(invoiceId);
        if (!existing)
            return res.status(404).json({ message: 'Invoice not found.' });
        const updated = await invoiceModel_1.default.findByIdAndUpdate(invoiceId, { invoiceFileUrl: `/uploads/${req.file.filename}` }, { new: true });
        const actorName = req.user?.name || 'System';
        const actorUserId = req.user?.id;
        await (0, auditService_1.writeAudit)({
            caseId: String(existing.caseId),
            actorName,
            actorUserId,
            action: 'INVOICE_UPDATED',
            message: 'Uploaded invoice file',
            detail: existing.invoiceNo,
        });
        res.json(updated);
    }
    catch {
        res.status(500).json({ message: 'Failed to upload invoice file.' });
    }
};
exports.uploadInvoiceFile = uploadInvoiceFile;
// ✅ NEW: delete invoice
const deleteInvoice = async (req, res) => {
    try {
        const invoiceId = req.params.invoiceId;
        const existing = await invoiceModel_1.default.findById(invoiceId);
        if (!existing)
            return res.status(404).json({ message: 'Invoice not found.' });
        await invoiceModel_1.default.findByIdAndDelete(invoiceId);
        const actorName = req.user?.name || 'System';
        const actorUserId = req.user?.id;
        await (0, auditService_1.writeAudit)({
            caseId: String(existing.caseId),
            actorName,
            actorUserId,
            action: 'INVOICE_DELETED',
            message: 'Deleted invoice',
            detail: existing.invoiceNo,
        });
        res.json({ message: 'Invoice deleted.' });
    }
    catch {
        res.status(500).json({ message: 'Failed to delete invoice.' });
    }
};
exports.deleteInvoice = deleteInvoice;
//# sourceMappingURL=invoiceController.js.map