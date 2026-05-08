"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_js_1 = require("../controllers/authController.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const router = express_1.default.Router();
// Public route
router.post('/login', authController_js_1.login);
// Protected route: Only 'managing_partner' can register new users
router.post('/register', authMiddleware_js_1.authenticate, (0, authMiddleware_js_1.authorize)(['managing_director']), authController_js_1.registerUser);
exports.default = router;
//# sourceMappingURL=auth.js.map