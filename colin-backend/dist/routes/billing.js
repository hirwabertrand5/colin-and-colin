"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const billingController_1 = require("../controllers/billingController");
const router = express_1.default.Router();
router.get('/billing/summary', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['managing_director', 'executive_assistant']), billingController_1.getBillingSummary);
exports.default = router;
//# sourceMappingURL=billing.js.map