"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const adminEmailController_1 = require("../controllers/adminEmailController");
const router = express_1.default.Router();
router.post('/admin/email/test', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(['managing_director']), adminEmailController_1.sendTestEmail);
exports.default = router;
//# sourceMappingURL=adminEmail.js.map