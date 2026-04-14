"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const timeLogController_1 = require("../controllers/timeLogController");
const router = express_1.default.Router();
router.get('/summary', authMiddleware_1.authenticate, timeLogController_1.getMyTimeLogSummary);
exports.default = router;
//# sourceMappingURL=timeLogs.js.map