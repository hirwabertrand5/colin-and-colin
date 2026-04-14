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
exports.getUnreadNotificationCount = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const notificationModel_1 = __importDefault(require("../models/notificationModel"));
const getUnreadNotificationCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id))
            return res.status(401).json({ message: 'Unauthorized.' });
        const me = new mongoose_1.default.Types.ObjectId(req.user.id);
        const count = yield notificationModel_1.default.countDocuments({
            $or: [{ audienceUserIds: me }, { audienceRoles: req.user.role }],
            isReadBy: { $ne: me },
        });
        res.json({ unread: count });
    }
    catch (e) {
        res.status(500).json({ message: (e === null || e === void 0 ? void 0 : e.message) || 'Failed to load unread count.' });
    }
});
exports.getUnreadNotificationCount = getUnreadNotificationCount;
//# sourceMappingURL=notificationCountController.js.map