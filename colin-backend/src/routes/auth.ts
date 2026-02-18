import express from 'express';
import { login, registerUser } from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route
router.post('/login', login);

// Protected route: Only 'managing_partner' can register new users
router.post(
  '/register',
  authenticate,
  authorize(['managing_partner']),
  registerUser
);

export default router;
