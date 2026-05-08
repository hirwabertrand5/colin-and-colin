"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const clientReportController_1 = require("../controllers/clientReportController");
const router = express_1.default.Router();
const ROLES = ['managing_director', 'executive_assistant'];
router.get('/cases/:caseId/reports', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(ROLES), clientReportController_1.listReportsForCase);
router.post('/cases/:caseId/reports/generate', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(ROLES), clientReportController_1.generateReportForCase);
router.get('/reports/:reportId', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(ROLES), clientReportController_1.getReportById);
// ✅ NEW: PDF download
router.get('/reports/:reportId/pdf', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(ROLES), clientReportController_1.downloadReportPdf);
exports.default = router;
//# sourceMappingURL=clientReports.js.map