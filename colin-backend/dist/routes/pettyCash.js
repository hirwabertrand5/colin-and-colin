"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const pettyCashController_1 = require("../controllers/pettyCashController");
const documentController_1 = require("../controllers/documentController");
const router = express_1.default.Router();
const ROLES = ['managing_director', 'executive_assistant'];
// Funds
router.get('/funds/active', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(ROLES), pettyCashController_1.getActiveFund);
router.get('/funds', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(ROLES), pettyCashController_1.listFunds);
router.post('/funds', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(ROLES), pettyCashController_1.createFund);
router.post('/funds/close', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(ROLES), pettyCashController_1.closeActiveFund);
// Expenses
router.get('/funds/:fundId/expenses', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(ROLES), pettyCashController_1.listExpensesForFund);
// Optional receipt upload: multipart/form-data with "file"
router.post('/funds/:fundId/expenses', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(ROLES), documentController_1.upload.single('file'), pettyCashController_1.createExpense);
router.delete('/expenses/:expenseId', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)(ROLES), pettyCashController_1.deleteExpense);
exports.default = router;
//# sourceMappingURL=pettyCash.js.map