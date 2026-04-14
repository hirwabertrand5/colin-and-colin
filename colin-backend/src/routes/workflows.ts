import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import {
  listActiveTemplates,
  listAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getWorkflowForCase,
  initWorkflowForCase,
  attachOutputDocument,
  completeStep,
} from '../controllers/workflowController';

const router = express.Router();
const ADMIN_ROLES = ['managing_director', 'executive_assistant'];

// Templates
router.get('/templates/active', authenticate, listActiveTemplates);
router.get('/templates', authenticate, authorize(ADMIN_ROLES), listAllTemplates);
router.get('/templates/:templateId', authenticate, getTemplateById);
router.post('/templates', authenticate, authorize(ADMIN_ROLES), createTemplate);
router.put('/templates/:templateId', authenticate, authorize(ADMIN_ROLES), updateTemplate);
router.delete('/templates/:templateId', authenticate, authorize(ADMIN_ROLES), deleteTemplate);

// Instances
router.get('/cases/:caseId', authenticate, getWorkflowForCase);
router.post('/cases/:caseId/init', authenticate, authorize(ADMIN_ROLES), initWorkflowForCase);

// Outputs
router.post(
  '/cases/:caseId/steps/:stepKey/outputs/:outputKey/attach',
  authenticate,
  attachOutputDocument
);

// Step completion (admin only)
router.post(
  '/cases/:caseId/steps/:stepKey/complete',
  authenticate,
  authorize(ADMIN_ROLES),
  completeStep
);

export default router;