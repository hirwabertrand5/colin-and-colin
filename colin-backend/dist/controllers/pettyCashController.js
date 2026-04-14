"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpense = exports.createExpense = exports.listExpensesForFund = exports.closeActiveFund = exports.createFund = exports.listFunds = exports.getActiveFund = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const pettyCashFundModel_1 = __importDefault(require("../models/pettyCashFundModel"));
const pettyCashExpenseModel_1 = __importDefault(require("../models/pettyCashExpenseModel"));
const notifyService_1 = require("../services/notifyService");
const ALLOWED_ROLES = ['managing_director', 'executive_assistant'];
const actorFromReq = (req) => {
    var _a, _b;
    return ({
        actorName: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.name) || 'System',
        actorUserId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
    });
};
const lowBalanceReached = (fund) => {
    const threshold = (Number(fund.initialAmount) || 0) * ((Number(fund.lowBalancePercent) || 20) / 100);
    return (Number(fund.remainingAmount) || 0) <= threshold;
};
// --------------------
// Funds
// --------------------
const getActiveFund = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fund = yield pettyCashFundModel_1.default.findOne({ status: 'active' }).sort({ createdAt: -1 });
        res.json(fund);
    }
    catch (_a) {
        res.status(500).json({ message: 'Failed to load active fund.' });
    }
});
exports.getActiveFund = getActiveFund;
const listFunds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const funds = yield pettyCashFundModel_1.default.find().sort({ createdAt: -1 }).limit(100);
        res.json(funds);
    }
    catch (_a) {
        res.status(500).json({ message: 'Failed to fetch funds.' });
    }
});
exports.listFunds = listFunds;
const createFund = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, initialAmount } = req.body || {};
        const num = Number(initialAmount);
        if (!name || !Number.isFinite(num) || num <= 0) {
            return res.status(400).json({ message: 'name and initialAmount (>0) are required.' });
        }
        const existingActive = yield pettyCashFundModel_1.default.findOne({ status: 'active' });
        if (existingActive) {
            return res.status(400).json({
                message: 'An active petty cash fund already exists. Close it before creating a new one.',
            });
        }
        const actor = actorFromReq(req);
        const fund = yield pettyCashFundModel_1.default.create({
            name: String(name).trim(),
            description: description ? String(description).trim() : '',
            initialAmount: num,
            spentAmount: 0,
            remainingAmount: num,
            status: 'active',
            lowBalancePercent: 20,
            lowBalanceNotifiedAt: null,
            createdByUserId: actor.actorUserId ? new mongoose_1.default.Types.ObjectId(actor.actorUserId) : undefined,
            createdByName: actor.actorName,
        });
        // in-app notification (no email for created)
        yield (0, notifyService_1.notifyRoles)({
            roles: ALLOWED_ROLES,
            category: 'pettyCashLow',
            notification: {
                type: 'PETTY_CASH_CREATED',
                title: 'Petty Cash Fund Created',
                message: `New petty cash fund created: ${fund.name} (RWF ${Number(fund.initialAmount).toLocaleString()}).`,
                fundId: String(fund._id),
                severity: 'info',
                link: '/petty-cash',
            },
        });
        res.status(201).json(fund);
    }
    catch (e) {
        res.status(500).json({ message: (e === null || e === void 0 ? void 0 : e.message) || 'Failed to create fund.' });
    }
});
exports.createFund = createFund;
const closeActiveFund = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fund = yield pettyCashFundModel_1.default.findOne({ status: 'active' });
        if (!fund)
            return res.status(404).json({ message: 'No active fund found.' });
        fund.status = 'closed';
        yield fund.save();
        res.json({ message: 'Fund closed.', fund });
    }
    catch (_a) {
        res.status(500).json({ message: 'Failed to close fund.' });
    }
});
exports.closeActiveFund = closeActiveFund;
// --------------------
// Expenses
// --------------------
const listExpensesForFund = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fundId } = req.params;
        const expenses = yield pettyCashExpenseModel_1.default.find({ fundId: new mongoose_1.default.Types.ObjectId(fundId) })
            .sort({ date: -1, createdAt: -1 })
            .limit(500);
        res.json(expenses);
    }
    catch (_a) {
        res.status(500).json({ message: 'Failed to fetch expenses.' });
    }
});
exports.listExpensesForFund = listExpensesForFund;
const createExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    try {
        const { fundId } = req.params;
        const { date, title, amount, category, vendor, note } = req.body || {};
        const amt = Number(amount);
        if (!date || !title || !Number.isFinite(amt) || amt <= 0) {
            return res.status(400).json({ message: 'date, title, amount (>0) are required.' });
        }
        let didTriggerLowBalance = false;
        yield session.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const fund = yield pettyCashFundModel_1.default.findById(fundId).session(session);
            if (!fund)
                throw new Error('FUND_NOT_FOUND');
            if (fund.status !== 'active')
                throw new Error('FUND_NOT_ACTIVE');
            if (amt > fund.remainingAmount)
                throw new Error('INSUFFICIENT_FUNDS');
            const actor = actorFromReq(req);
            const receiptUrl = ((_a = req.file) === null || _a === void 0 ? void 0 : _a.filename) ? `/uploads/${req.file.filename}` : undefined;
            const expense = yield pettyCashExpenseModel_1.default.create([
                {
                    fundId: fund._id,
                    date: String(date),
                    title: String(title).trim(),
                    category: category ? String(category).trim() : undefined,
                    vendor: vendor ? String(vendor).trim() : undefined,
                    amount: amt,
                    note: note ? String(note).trim() : undefined,
                    receiptUrl,
                    createdByUserId: actor.actorUserId ? new mongoose_1.default.Types.ObjectId(actor.actorUserId) : undefined,
                    createdByName: actor.actorName,
                },
            ], { session });
            fund.spentAmount = Number(fund.spentAmount) + amt;
            fund.remainingAmount = Number(fund.remainingAmount) - amt;
            yield fund.save({ session });
            // in-app notification (no email by policy)
            yield (0, notifyService_1.notifyRoles)({
                roles: ALLOWED_ROLES,
                category: 'pettyCashLow',
                notification: {
                    type: 'PETTY_CASH_EXPENSE',
                    title: 'Petty Cash Expense Recorded',
                    message: `${actor.actorName} recorded an expense of RWF ${amt.toLocaleString()} (${String(title).trim()}).`,
                    fundId: String(fund._id),
                    expenseId: String(expense[0]._id),
                    severity: 'info',
                    link: '/petty-cash',
                },
            });
            const isLow = lowBalanceReached(fund);
            const alreadyNotified = Boolean(fund.lowBalanceNotifiedAt);
            if (isLow && !alreadyNotified) {
                fund.lowBalanceNotifiedAt = new Date();
                yield fund.save({ session });
                didTriggerLowBalance = true;
            }
        }));
        // After commit: if low balance triggered first time -> notify + email
        if (didTriggerLowBalance) {
            const updatedFund = yield pettyCashFundModel_1.default.findById(fundId).lean();
            if (updatedFund) {
                yield (0, notifyService_1.notifyRoles)({
                    roles: ALLOWED_ROLES,
                    category: 'pettyCashLow',
                    notification: {
                        type: 'PETTY_CASH_LOW',
                        title: 'Petty Cash Low Balance',
                        message: `Petty cash is low. Remaining: RWF ${Number(updatedFund.remainingAmount).toLocaleString()} (Fund: ${updatedFund.name}).`,
                        fundId: String(updatedFund._id),
                        severity: 'warning',
                        link: '/petty-cash',
                    },
                    email: {
                        subject: `Petty Cash Low Balance: ${updatedFund.name}`,
                        html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.5;">
                <h2>Petty Cash Low Balance</h2>
                <p><strong>Fund:</strong> ${updatedFund.name}</p>
                <p><strong>Initial:</strong> RWF ${Number(updatedFund.initialAmount).toLocaleString()}</p>
                <p><strong>Spent:</strong> RWF ${Number(updatedFund.spentAmount).toLocaleString()}</p>
                <p><strong>Remaining:</strong> RWF ${Number(updatedFund.remainingAmount).toLocaleString()}</p>
                <p>Remaining is at or below <strong>${updatedFund.lowBalancePercent}%</strong> threshold.</p>
                <p>Please top up or close and create a new petty cash fund.</p>
              </div>
            `,
                    },
                });
            }
        }
        res.status(201).json({ message: 'Expense recorded successfully.' });
    }
    catch (err) {
        const msg = String((err === null || err === void 0 ? void 0 : err.message) || '');
        if (msg === 'FUND_NOT_FOUND')
            return res.status(404).json({ message: 'Fund not found.' });
        if (msg === 'FUND_NOT_ACTIVE')
            return res.status(400).json({ message: 'Fund is not active.' });
        if (msg === 'INSUFFICIENT_FUNDS')
            return res.status(400).json({ message: 'Insufficient petty cash balance for this expense.' });
        res.status(500).json({ message: 'Failed to create expense.' });
    }
    finally {
        session.endSession();
    }
});
exports.createExpense = createExpense;
const deleteExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    try {
        const { expenseId } = req.params;
        yield session.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
            const expense = yield pettyCashExpenseModel_1.default.findById(expenseId).session(session);
            if (!expense)
                throw new Error('EXPENSE_NOT_FOUND');
            const fund = yield pettyCashFundModel_1.default.findById(expense.fundId).session(session);
            if (!fund)
                throw new Error('FUND_NOT_FOUND');
            const amt = Number(expense.amount) || 0;
            yield pettyCashExpenseModel_1.default.findByIdAndDelete(expenseId).session(session);
            fund.spentAmount = Math.max(0, Number(fund.spentAmount) - amt);
            fund.remainingAmount = Number(fund.remainingAmount) + amt;
            yield fund.save({ session });
            const actor = actorFromReq(req);
            yield (0, notifyService_1.notifyRoles)({
                roles: ALLOWED_ROLES,
                category: 'pettyCashLow',
                notification: {
                    type: 'PETTY_CASH_EXPENSE',
                    title: 'Petty Cash Expense Deleted',
                    message: `${actor.actorName} deleted an expense of RWF ${amt.toLocaleString()} (${expense.title}).`,
                    fundId: String(fund._id),
                    severity: 'info',
                    link: '/petty-cash',
                },
            });
        }));
        res.json({ message: 'Expense deleted.' });
    }
    catch (err) {
        const msg = String((err === null || err === void 0 ? void 0 : err.message) || '');
        if (msg === 'EXPENSE_NOT_FOUND')
            return res.status(404).json({ message: 'Expense not found.' });
        if (msg === 'FUND_NOT_FOUND')
            return res.status(404).json({ message: 'Fund not found.' });
        res.status(500).json({ message: 'Failed to delete expense.' });
    }
    finally {
        session.endSession();
    }
});
exports.deleteExpense = deleteExpense;
//# sourceMappingURL=pettyCashController.js.map