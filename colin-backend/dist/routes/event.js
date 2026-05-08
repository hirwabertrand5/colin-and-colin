"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const eventController_js_1 = require("../controllers/eventController.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const router = express_1.default.Router();
// Events for a case
router.get('/cases/:caseId/events', authMiddleware_js_1.authenticate, eventController_js_1.getEventsForCase);
router.post('/cases/:caseId/events', authMiddleware_js_1.authenticate, eventController_js_1.addEventToCase);
// Single event
router.get('/events/:eventId', authMiddleware_js_1.authenticate, eventController_js_1.getEventById);
router.put('/events/:eventId', authMiddleware_js_1.authenticate, eventController_js_1.updateEvent);
router.delete('/events/:eventId', authMiddleware_js_1.authenticate, eventController_js_1.deleteEvent);
exports.default = router;
//# sourceMappingURL=event.js.map