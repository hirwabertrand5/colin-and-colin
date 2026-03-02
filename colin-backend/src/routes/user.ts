import express from 'express';
import {
  getAllUsers,
  addUser,
  resetUserPassword,
  setUserActiveStatus,
  updateUser,
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { deleteUser } from '../controllers/userController.js';

const router = express.Router();

// All routes require authentication and managing_partner role
router.get(
  '/',
  authenticate,
  authorize(['managing_director']),
  getAllUsers
);

router.post(
  '/',
  authenticate,
  authorize(['managing_director']),
  addUser
);

router.post(
  '/reset-password',
  authenticate,
  authorize(['managing_director']),
  resetUserPassword
);

router.post(
  '/set-active',
  authenticate,
  authorize(['managing_director']),
  setUserActiveStatus
);

router.put('/:id', authenticate, authorize(['managing_director']), updateUser);
export default router;

router.delete('/:id', authenticate, authorize(['managing_director']), deleteUser);