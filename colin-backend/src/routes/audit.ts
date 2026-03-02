import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { getAuditForCase } from '../controllers/auditController';

const router = express.Router();
router.get('/cases/:caseId/audit', authenticate, getAuditForCase);

export default router;