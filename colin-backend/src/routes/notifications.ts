import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { listMyNotifications, markAllAsRead, markOneAsRead } from '../controllers/notificationController';
import { getMyNotificationPreferences, updateMyNotificationPreferences } from '../controllers/notificationPreferencesController';

const router = express.Router();

router.get('/', authenticate, listMyNotifications);
router.post('/read-all', authenticate, markAllAsRead);
router.post('/:id/read', authenticate, markOneAsRead);

// preferences
router.get('/preferences/me', authenticate, getMyNotificationPreferences);
router.put('/preferences/me', authenticate, updateMyNotificationPreferences);

export default router;