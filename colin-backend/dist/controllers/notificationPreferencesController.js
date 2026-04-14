"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMyNotificationPreferences = exports.getMyNotificationPreferences = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const notificationPreferencesModel_1 = __importDefault(require("../models/notificationPreferencesModel"));
const isAllowed = (role) => role === 'managing_director' || role === 'executive_assistant' || role === 'associate' || role === 'lawyer';
const getMyNotificationPreferences = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || !isAllowed(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden.' });
        }
        const userId = new mongoose_1.default.Types.ObjectId(req.user.id);
        const pref = (yield notificationPreferencesModel_1.default.findOne({ userId }).lean()) ||
            (yield notificationPreferencesModel_1.default.create({ userId })).toObject();
        res.json(pref);
    }
    catch (e) {
        res.status(500).json({ message: (e === null || e === void 0 ? void 0 : e.message) || 'Failed to load notification preferences.' });
    }
});
exports.getMyNotificationPreferences = getMyNotificationPreferences;
const updateMyNotificationPreferences = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || !isAllowed(req.user.role)) {
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
        const pref = yield notificationPreferencesModel_1.default.findOneAndUpdate({ userId }, { $set: updates }, { new: true, upsert: true }).lean();
        res.json(pref);
    }
    catch (e) {
        res.status(500).json({ message: (e === null || e === void 0 ? void 0 : e.message) || 'Failed to save notification preferences.' });
    }
});
exports.updateMyNotificationPreferences = updateMyNotificationPreferences;
//# sourceMappingURL=notificationPreferencesController.js.map