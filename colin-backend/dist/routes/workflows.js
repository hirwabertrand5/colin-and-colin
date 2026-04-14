"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const workflowController_1 = require("../controllers/workflowController");
const router = express_1.default.Router();
const ADMIN_ROLES = ['managing_director', 'executive_assistant'];
// Templates
router.get('/templates/active', authMiddleware_1.authenticate, workflowController_1.listActiveTemplates);
router.get('/templates', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(ADMIN_ROLES), workflowController_1.listAllTemplates);
router.get('/templates/:templateId', authMiddleware_1.authenticate, workflowController_1.getTemplateById);
router.post('/templates', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(ADMIN_ROLES), workflowController_1.createTemplate);
router.put('/templates/:templateId', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(ADMIN_ROLES), workflowController_1.updateTemplate);
router.delete('/templates/:templateId', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(ADMIN_ROLES), workflowController_1.deleteTemplate);
// Instances
router.get('/cases/:caseId', authMiddleware_1.authenticate, workflowController_1.getWorkflowForCase);
router.post('/cases/:caseId/init', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(ADMIN_ROLES), workflowController_1.initWorkflowForCase);
// Outputs
router.post('/cases/:caseId/steps/:stepKey/outputs/:outputKey/attach', authMiddleware_1.authenticate, workflowController_1.attachOutputDocument);
// Step completion (admin only)
router.post('/cases/:caseId/steps/:stepKey/complete', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(ADMIN_ROLES), workflowController_1.completeStep);
exports.default = router;
//# sourceMappingURL=workflows.js.map