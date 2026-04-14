"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_js_1 = require("../controllers/userController.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const router = express_1.default.Router();
// ✅ Full access for Managing Director + Executive Assistant (as you requested)
const USER_ADMIN_ROLES = ['managing_director', 'executive_assistant'];
// ✅ Staff list for case assignment dropdown
// allow admin + associate to read staff list
router.get('/staff', authMiddleware_js_1.authenticate, (0, authMiddleware_js_1.authorize)(['managing_director', 'executive_assistant', 'associate']), userController_js_1.getStaffUsers);
router.get('/', authMiddleware_js_1.authenticate, (0, authMiddleware_js_1.authorize)(USER_ADMIN_ROLES), userController_js_1.getAllUsers);
router.post('/', authMiddleware_js_1.authenticate, (0, authMiddleware_js_1.authorize)(USER_ADMIN_ROLES), userController_js_1.addUser);
router.post('/reset-password', authMiddleware_js_1.authenticate, (0, authMiddleware_js_1.authorize)(USER_ADMIN_ROLES), userController_js_1.resetUserPassword);
router.post('/set-active', authMiddleware_js_1.authenticate, (0, authMiddleware_js_1.authorize)(USER_ADMIN_ROLES), userController_js_1.setUserActiveStatus);
router.put('/:id', authMiddleware_js_1.authenticate, (0, authMiddleware_js_1.authorize)(USER_ADMIN_ROLES), userController_js_1.updateUser);
router.delete('/:id', authMiddleware_js_1.authenticate, (0, authMiddleware_js_1.authorize)(USER_ADMIN_ROLES), userController_js_1.deleteUser);
exports.default = router;
//# sourceMappingURL=user.js.map