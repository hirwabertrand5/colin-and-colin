import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import {
  listMyNotifications,
  markAllAsRead,
  markOneAsRead,
} from '../controllers/notificationController';

const router = express.Router();

const ROLES = ['managing_director', 'executive_assistant'];

router.get('/', authenticate, authorize(ROLES), listMyNotifications);
router.post('/read-all', authenticate, authorize(ROLES), markAllAsRead);
router.post('/:id/read', authenticate, authorize(ROLES), markOneAsRead);

export default router;