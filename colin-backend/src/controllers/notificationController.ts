import { Response } from 'express';
import mongoose from 'mongoose';
import Notification from '../models/notificationModel';
import { AuthRequest } from '../middleware/authMiddleware';

const isRoleAllowed = (role?: string) =>
  role === 'managing_director' || role === 'executive_assistant';

export const listMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !isRoleAllowed(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const { filter = 'all' } = req.query as any;

    const q: any = {
      audienceRoles: req.user.role, // role-based audience
    };

    // unread filter
    if (filter === 'unread') {
      q.isReadBy = { $ne: new mongoose.Types.ObjectId(req.user.id) };
    }

    // type filter: e.g. PETTY_CASH_LOW
    if (filter && filter !== 'all' && filter !== 'unread') {
      q.type = String(filter);
    }

    const items = await Notification.find(q).sort({ createdAt: -1 }).limit(200);

    res.json(items);
  } catch {
    res.status(500).json({ message: 'Failed to fetch notifications.' });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !isRoleAllowed(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);

    await Notification.updateMany(
      {
        audienceRoles: req.user.role,
        isReadBy: { $ne: userId },
      },
      { $addToSet: { isReadBy: userId } }
    );

    res.json({ message: 'Marked all as read.' });
  } catch {
    res.status(500).json({ message: 'Failed to mark all as read.' });
  }
};

export const markOneAsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !isRoleAllowed(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const { id } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const updated = await Notification.findByIdAndUpdate(
      id,
      { $addToSet: { isReadBy: userId } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Notification not found.' });

    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Failed to mark notification as read.' });
  }
};