"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const auditFeedController_1 = require("../controllers/auditFeedController");
const router = express_1.default.Router();
router.get('/audit/recent', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['managing_director']), auditFeedController_1.getRecentAuditFeed);
exports.default = router;
//# sourceMappingURL=auditFeed.js.map