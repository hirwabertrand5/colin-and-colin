"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMyNotificationPreferences = exports.getMyNotificationPreferences = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const notificationPreferencesModel_1 = __importDefault(require("../models/notificationPreferencesModel"));
const isAllowed = (role) => role === 'managing_director' || role === 'executive_assistant' || role === 'associate' || role === 'lawyer';
const getMyNotificationPreferences = async (req, res) => {
    try {
        if (!req.user?.id || !isAllowed(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden.' });
        }
        const userId = new mongoose_1.default.Types.ObjectId(req.user.id);
        const pref = (await notificationPreferencesModel_1.default.findOne({ userId }).lean()) ||
            (await notificationPreferencesModel_1.default.create({ userId })).toObject();
        res.json(pref);
    }
    catch (e) {
        res.status(500).json({ message: e?.message || 'Failed to load notification preferences.' });
    }
};
exports.getMyNotificationPreferences = getMyNotificationPreferences;
const updateMyNotificationPreferences = async (req, res) => {
    try {
        if (!req.user?.id || !isAllowed(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden.' });
        }
        const userId = new mongoose_1.default.Types.ObjectId(req.user.id);
        const allowedFields = [
            'emailEnabled',
            'deadlinesEnabled',
            'taskAssignmentsEnabled',
            'approvalsEnabled',
            'pettyCashLowEnabled',
            'taskDueReminderHours',
            'eventReminderHours',
        ];
        const updates = {};
        for (const k of allowedFields) {
            if (k in req.body)
                updates[k] = req.body[k];
        }
        // normalize
        if (Array.isArray(updates.eventReminderHours)) {
            updates.eventReminderHours = updates.eventReminderHours
                .map((n) => Number(n))
                .filter((n) => Number.isFinite(n) && n > 0 && n <= 168);
            if (updates.eventReminderHours.length === 0)
                updates.eventReminderHours = [24, 2];
        }
        const pref = await notificationPreferencesModel_1.default.findOneAndUpdate({ userId }, { $set: updates }, { new: true, upsert: true }).lean();
        res.json(pref);
    }
    catch (e) {
        res.status(500).json({ message: e?.message || 'Failed to save notification preferences.' });
    }
};
exports.updateMyNotificationPreferences = updateMyNotificationPreferences;
//# sourceMappingURL=notificationPreferencesController.js.map