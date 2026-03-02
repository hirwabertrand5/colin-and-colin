import express from 'express';
import {
  getAllCases,
  createCase,
  getCaseById,
  updateCase,
  deleteCase,
} from '../controllers/caseController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, getAllCases);
router.post('/', authenticate, createCase);
router.get('/:id', authenticate, getCaseById);
router.put('/:id', authenticate, updateCase);     
router.delete('/:id', authenticate, deleteCase);

export default router;