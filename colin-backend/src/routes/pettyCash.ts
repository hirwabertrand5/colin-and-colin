import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import {
  getActiveFund,
  listFunds,
  createFund,
  closeActiveFund,
  listExpensesForFund,
  createExpense,
  deleteExpense,
} from '../controllers/pettyCashController';
import { upload } from '../controllers/documentController';

const router = express.Router();

const ROLES = ['managing_director', 'executive_assistant'];

// Funds
router.get('/funds/active', authenticate, authorize(ROLES), getActiveFund);
router.get('/funds', authenticate, authorize(ROLES), listFunds);
router.post('/funds', authenticate, authorize(ROLES), createFund);
router.post('/funds/close', authenticate, authorize(ROLES), closeActiveFund);

// Expenses
router.get('/funds/:fundId/expenses', authenticate, authorize(ROLES), listExpensesForFund);

// Optional receipt upload: multipart/form-data with "file"
router.post(
  '/funds/:fundId/expenses',
  authenticate,
  authorize(ROLES),
  upload.single('file'),
  createExpense
);

router.delete('/expenses/:expenseId', authenticate, authorize(ROLES), deleteExpense);

export default router;