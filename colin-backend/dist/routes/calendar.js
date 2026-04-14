"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const calendarController_1 = require("../controllers/calendarController");
const router = express_1.default.Router();
router.get('/calendar/events', authMiddleware_1.authenticate, calendarController_1.getFirmEvents);
router.get('/calendar/tasks', authMiddleware_1.authenticate, calendarController_1.getCalendarTasks);
exports.default = router;
//# sourceMappingURL=calendar.js.map