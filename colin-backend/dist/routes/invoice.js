"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const invoiceController_1 = require("../controllers/invoiceController");
const documentController_1 = require("../controllers/documentController");
const invoiceQueryController_1 = require("../controllers/invoiceQueryController");
const router = express_1.default.Router();
const FINANCE_ROLES = ['managing_director', 'executive_assistant'];
// Case-specific
router.get('/cases/:caseId/invoices', authMiddleware_1.authenticate, invoiceController_1.getInvoicesForCase);
router.post('/cases/:caseId/invoices', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(FINANCE_ROLES), invoiceController_1.addInvoiceToCase);
// Proof of payment (marks Paid)
router.post('/invoices/:invoiceId/proof', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(FINANCE_ROLES), documentController_1.upload.single('file'), invoiceController_1.uploadProof);
// ✅ NEW: Upload invoice file (does NOT mark paid)
router.post('/invoices/:invoiceId/file', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(FINANCE_ROLES), documentController_1.upload.single('file'), invoiceController_1.uploadInvoiceFile);
// ✅ NEW: Delete invoice
router.delete('/invoices/:invoiceId', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(FINANCE_ROLES), invoiceController_1.deleteInvoice);
// Firm-wide invoice queries
router.get('/invoices', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(FINANCE_ROLES), invoiceQueryController_1.listInvoices);
router.get('/invoices/recent', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(FINANCE_ROLES), invoiceQueryController_1.getRecentInvoices);
exports.default = router;
//# sourceMappingURL=invoice.js.map