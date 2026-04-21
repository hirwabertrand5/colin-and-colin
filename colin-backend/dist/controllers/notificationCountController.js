"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadNotificationCount = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const notificationModel_1 = __importDefault(require("../models/notificationModel"));
const getUnreadNotificationCount = async (req, res) => {
    try {
        if (!req.user?.id)
            return res.status(401).json({ message: 'Unauthorized.' });
        const me = new mongoose_1.default.Types.ObjectId(req.user.id);
        const count = await notificationModel_1.default.countDocuments({
            $or: [{ audienceUserIds: me }, { audienceRoles: req.user.role }],
            isReadBy: { $ne: me },
        });
        res.json({ unread: count });
    }
    catch (e) {
        res.status(500).json({ message: e?.message || 'Failed to load unread count.' });
    }
};
exports.getUnreadNotificationCount = getUnreadNotificationCount;
//# sourceMappingURL=notificationCountController.js.map