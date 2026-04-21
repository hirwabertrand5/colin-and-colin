import { Response } from 'express';
import mongoose from 'mongoose';
import PettyCashFund from '../models/pettyCashFundModel';
import PettyCashExpense from '../models/pettyCashExpenseModel';
import { AuthRequest } from '../middleware/authMiddleware';
import { notifyRoles } from '../services/notifyService';

const ALLOWED_ROLES = ['managing_director', 'executive_assistant'];

const actorFromReq = (req: AuthRequest) => ({
  actorName: req.user?.name || 'System',
  actorUserId: req.user?.id,
});

const lowBalanceReached = (fund: any) => {
  const threshold =
    (Number(fund.initialAmount) || 0) * ((Number(fund.lowBalancePercent) || 20) / 100);
  return (Number(fund.remainingAmount) || 0) <= threshold;
};

// --------------------
// Funds
// --------------------
export const getActiveFund = async (req: AuthRequest, res: Response) => {
  try {
    const fund = await PettyCashFund.findOne({ status: 'active' }).sort({ createdAt: -1 });
    res.json(fund);
  } catch {
    res.status(500).json({ message: 'Failed to load active fund.' });
  }
};

export const listFunds = async (req: AuthRequest, res: Response) => {
  try {
    const funds = await PettyCashFund.find().sort({ createdAt: -1 }).limit(100);
    res.json(funds);
  } catch {
    res.status(500).json({ message: 'Failed to fetch funds.' });
  }
};

export const createFund = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, initialAmount } = req.body || {};
    const num = Number(initialAmount);

    if (!name || !Number.isFinite(num) || num <= 0) {
      return res.status(400).json({ message: 'name and initialAmount (>0) are required.' });
    }

    const existingActive = await PettyCashFund.findOne({ status: 'active' });
    if (existingActive) {
      return res.status(400).json({
        message: 'An active petty cash fund already exists. Close it before creating a new one.',
      });
    }

    const actor = actorFromReq(req);

    const fundPayload: any = {
      name: String(name).trim(),
      description: description ? String(description).trim() : '',
      initialAmount: num,
      spentAmount: 0,
      remainingAmount: num,
      status: 'active',
      lowBalancePercent: 20,
      lowBalanceNotifiedAt: null,
      createdByName: actor.actorName,
    };
    if (actor.actorUserId) {
      fundPayload.createdByUserId = new mongoose.Types.ObjectId(actor.actorUserId);
    }

    const fund = await PettyCashFund.create(fundPayload);

    // in-app notification (no email for created)
    await notifyRoles({
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
  } catch (e: any) {
    res.status(500).json({ message: e?.message || 'Failed to create fund.' });
  }
};

export const closeActiveFund = async (req: AuthRequest, res: Response) => {
  try {
    const fund = await PettyCashFund.findOne({ status: 'active' });
    if (!fund) return res.status(404).json({ message: 'No active fund found.' });

    fund.status = 'closed';
    await fund.save();

    res.json({ message: 'Fund closed.', fund });
  } catch {
    res.status(500).json({ message: 'Failed to close fund.' });
  }
};

// --------------------
// Expenses
// --------------------
export const listExpensesForFund = async (req: AuthRequest, res: Response) => {
  try {
    const fundId = Array.isArray(req.params.fundId) ? req.params.fundId[0] : req.params.fundId;
    if (!fundId) return res.status(400).json({ message: 'Missing fundId.' });

    const expenses = await PettyCashExpense.find({ fundId: new mongoose.Types.ObjectId(fundId) })
      .sort({ date: -1, createdAt: -1 })
      .limit(500);

    res.json(expenses);
  } catch {
    res.status(500).json({ message: 'Failed to fetch expenses.' });
  }
};

export const createExpense = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  try {
    const fundId = Array.isArray(req.params.fundId) ? req.params.fundId[0] : req.params.fundId;
    const { date, title, amount, category, vendor, note } = req.body || {};
    if (!fundId) return res.status(400).json({ message: 'Missing fundId.' });

    const amt = Number(amount);
    if (!date || !title || !Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({ message: 'date, title, amount (>0) are required.' });
    }

    let didTriggerLowBalance = false;

    await session.withTransaction(async () => {
      const fund = await PettyCashFund.findById(fundId).session(session);
      if (!fund) throw new Error('FUND_NOT_FOUND');
      if (fund.status !== 'active') throw new Error('FUND_NOT_ACTIVE');

      if (amt > fund.remainingAmount) throw new Error('INSUFFICIENT_FUNDS');

      const actor = actorFromReq(req);

      const receiptUrl = (req as any).file?.filename ? `/uploads/${(req as any).file.filename}` : undefined;

      const expensePayload: any = {
        fundId: fund._id,
        date: String(date),
        title: String(title).trim(),
        amount: amt,
        createdByName: actor.actorName,
      };
      if (category) expensePayload.category = String(category).trim();
      if (vendor) expensePayload.vendor = String(vendor).trim();
      if (note) expensePayload.note = String(note).trim();
      if (receiptUrl) expensePayload.receiptUrl = receiptUrl;
      if (actor.actorUserId) {
        expensePayload.createdByUserId = new mongoose.Types.ObjectId(actor.actorUserId);
      }

      const createdExpenses = await PettyCashExpense.create([expensePayload], { session });
      const expense = createdExpenses[0];
      if (!expense) throw new Error('EXPENSE_CREATE_FAILED');

      fund.spentAmount = Number(fund.spentAmount) + amt;
      fund.remainingAmount = Number(fund.remainingAmount) - amt;
      await fund.save({ session });

      // in-app notification (no email by policy)
      await notifyRoles({
        roles: ALLOWED_ROLES,
        category: 'pettyCashLow',
        notification: {
          type: 'PETTY_CASH_EXPENSE',
          title: 'Petty Cash Expense Recorded',
          message: `${actor.actorName} recorded an expense of RWF ${amt.toLocaleString()} (${String(title).trim()}).`,
          fundId: String(fund._id),
          expenseId: String(expense._id),
          severity: 'info',
          link: '/petty-cash',
        },
      });

      const isLow = lowBalanceReached(fund);
      const alreadyNotified = Boolean(fund.lowBalanceNotifiedAt);

      if (isLow && !alreadyNotified) {
        fund.lowBalanceNotifiedAt = new Date();
        await fund.save({ session });
        didTriggerLowBalance = true;
      }
    });

    // After commit: if low balance triggered first time -> notify + email
    if (didTriggerLowBalance) {
      const updatedFund = await PettyCashFund.findById(fundId).lean();
      if (updatedFund) {
        await notifyRoles({
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
  } catch (err: any) {
    const msg = String(err?.message || '');

    if (msg === 'FUND_NOT_FOUND') return res.status(404).json({ message: 'Fund not found.' });
    if (msg === 'FUND_NOT_ACTIVE') return res.status(400).json({ message: 'Fund is not active.' });
    if (msg === 'INSUFFICIENT_FUNDS')
      return res.status(400).json({ message: 'Insufficient petty cash balance for this expense.' });
    if (msg === 'EXPENSE_CREATE_FAILED')
      return res.status(500).json({ message: 'Failed to create expense.' });

    res.status(500).json({ message: 'Failed to create expense.' });
  } finally {
    session.endSession();
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  try {
    const { expenseId } = req.params;

    await session.withTransaction(async () => {
      const expense = await PettyCashExpense.findById(expenseId).session(session);
      if (!expense) throw new Error('EXPENSE_NOT_FOUND');

      const fund = await PettyCashFund.findById(expense.fundId).session(session);
      if (!fund) throw new Error('FUND_NOT_FOUND');

      const amt = Number(expense.amount) || 0;

      await PettyCashExpense.findByIdAndDelete(expenseId).session(session);

      fund.spentAmount = Math.max(0, Number(fund.spentAmount) - amt);
      fund.remainingAmount = Number(fund.remainingAmount) + amt;
      await fund.save({ session });

      const actor = actorFromReq(req);

      await notifyRoles({
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
    });

    res.json({ message: 'Expense deleted.' });
  } catch (err: any) {
    const msg = String(err?.message || '');
    if (msg === 'EXPENSE_NOT_FOUND') return res.status(404).json({ message: 'Expense not found.' });
    if (msg === 'FUND_NOT_FOUND') return res.status(404).json({ message: 'Fund not found.' });

    res.status(500).json({ message: 'Failed to delete expense.' });
  } finally {
    session.endSession();
  }
};
