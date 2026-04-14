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
exports.markOneAsRead = exports.markAllAsRead = exports.listMyNotifications = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const notificationModel_1 = __importDefault(require("../models/notificationModel"));
const listMyNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id))
            return res.status(401).json({ message: 'Unauthorized.' });
        const { filter = 'all' } = req.query;
        const me = new mongoose_1.default.Types.ObjectId(req.user.id);
        const q = {
            $or: [{ audienceUserIds: me }, { audienceRoles: req.user.role }],
        };
        if (filter === 'unread') {
            q.isReadBy = { $ne: me };
        }
        if (filter && filter !== 'all' && filter !== 'unread') {
            q.type = String(filter);
        }
        const items = yield notificationModel_1.default.find(q).sort({ createdAt: -1 }).limit(200).lean();
        res.json(items);
    }
    catch (e) {
        res.status(500).json({ message: (e === null || e === void 0 ? void 0 : e.message) || 'Failed to fetch notifications.' });
    }
});
exports.listMyNotifications = listMyNotifications;
const markAllAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id))
            return res.status(401).json({ message: 'Unauthorized.' });
        const me = new mongoose_1.default.Types.ObjectId(req.user.id);
        yield notificationModel_1.default.updateMany({
            $or: [{ audienceUserIds: me }, { audienceRoles: req.user.role }],
            isReadBy: { $ne: me },
        }, { $addToSet: { isReadBy: me } });
        res.json({ message: 'Marked all as read.' });
    }
    catch (e) {
        res.status(500).json({ message: (e === null || e === void 0 ? void 0 : e.message) || 'Failed to mark all as read.' });
    }
});
exports.markAllAsRead = markAllAsRead;
const markOneAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id))
            return res.status(401).json({ message: 'Unauthorized.' });
        const { id } = req.params;
        const me = new mongoose_1.default.Types.ObjectId(req.user.id);
        const updated = yield notificationModel_1.default.findByIdAndUpdate(id, { $addToSet: { isReadBy: me } }, { new: true }).lean();
        if (!updated)
            return res.status(404).json({ message: 'Notification not found.' });
        res.json(updated);
    }
    catch (e) {
        res.status(500).json({ message: (e === null || e === void 0 ? void 0 : e.message) || 'Failed to mark notification as read.' });
    }
});
exports.markOneAsRead = markOneAsRead;
//# sourceMappingURL=notificationController.js.map