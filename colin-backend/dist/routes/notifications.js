"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const notificationController_1 = require("../controllers/notificationController");
const notificationPreferencesController_1 = require("../controllers/notificationPreferencesController");
const notificationCountController_1 = require("../controllers/notificationCountController");
const router = express_1.default.Router();
router.get('/', authMiddleware_1.authenticate, notificationController_1.listMyNotifications);
router.get('/unread-count', authMiddleware_1.authenticate, notificationCountController_1.getUnreadNotificationCount);
router.post('/read-all', authMiddleware_1.authenticate, notificationController_1.markAllAsRead);
router.post('/:id/read', authMiddleware_1.authenticate, notificationController_1.markOneAsRead);
// preferences
router.get('/preferences/me', authMiddleware_1.authenticate, notificationPreferencesController_1.getMyNotificationPreferences);
router.put('/preferences/me', authMiddleware_1.authenticate, notificationPreferencesController_1.updateMyNotificationPreferences);
exports.default = router;
//# sourceMappingURL=notifications.js.map