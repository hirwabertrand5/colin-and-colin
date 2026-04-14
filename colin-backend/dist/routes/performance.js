"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const performanceController_1 = require("../controllers/performanceController");
const router = express_1.default.Router();
router.get('/performance/me', authMiddleware_1.authenticate, performanceController_1.getMyPerformance);
router.get('/performance/team', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['managing_director']), performanceController_1.getTeamPerformance);
exports.default = router;
//# sourceMappingURL=performance.js.map