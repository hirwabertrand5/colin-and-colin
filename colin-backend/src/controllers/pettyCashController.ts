import { Response } from 'express';
import mongoose from 'mongoose';
import PettyCashFund from '../models/pettyCashFundModel';
import PettyCashExpense from '../models/pettyCashExpenseModel';
import Notification from '../models/notificationModel';
import User from '../models/userModel';
import { AuthRequest } from '../middleware/authMiddleware';
import { sendEmail } from '../services/emailService';

const ALLOWED_ROLES = ['managing_director', 'executive_assistant'];

const actorFromReq = (req: AuthRequest) => ({
  actorName: req.user?.name || 'System',
  actorUserId: req.user?.id,
});

const lowBalanceReached = (fund: any) => {
  const threshold = (Number(fund.initialAmount) || 0) * ((Number(fund.lowBalancePercent) || 20) / 100);
  return (Number(fund.remainingAmount) || 0) <= threshold;
};

const getAlertRecipients = async (): Promise<string[]> => {
  const users = await User.find(
    { isActive: true, role: { $in: ALLOWED_ROLES } },
    'email'
  );
  return users.map(u => u.email).filter(Boolean);
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

    const fund = await PettyCashFund.create({
      name: String(name).trim(),
      description: description ? String(description).trim() : '',
      initialAmount: num,
      spentAmount: 0,
      remainingAmount: num,
      status: 'active',
      lowBalancePercent: 20,
      lowBalanceNotifiedAt: null,
      createdByUserId: actor.actorUserId ? new mongoose.Types.ObjectId(actor.actorUserId) : undefined,
      createdByName: actor.actorName,
    });

    // in-app notification
    await Notification.create({
      type: 'PETTY_CASH_CREATED',
      title: 'Petty Cash Fund Created',
      message: `New petty cash fund created: ${fund.name} (RWF ${fund.initialAmount.toLocaleString()}).`,
      fundId: fund._id,
      severity: 'info',
      audienceRoles: ALLOWED_ROLES,
    });

    res.status(201).json(fund);
  } catch {
    res.status(500).json({ message: 'Failed to create fund.' });
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
    const { fundId } = req.params;
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
    const { fundId } = req.params;
    const { date, title, amount, category, vendor, note } = req.body || {};

    const amt = Number(amount);
    if (!date || !title || !Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({ message: 'date, title, amount (>0) are required.' });
    }

    await session.withTransaction(async () => {
      const fund = await PettyCashFund.findById(fundId).session(session);
      if (!fund) throw new Error('FUND_NOT_FOUND');
      if (fund.status !== 'active') throw new Error('FUND_NOT_ACTIVE');

      // ✅ block overspending
      if (amt > fund.remainingAmount) throw new Error('INSUFFICIENT_FUNDS');

      const actor = actorFromReq(req);

      const receiptUrl = (req as any).file?.filename ? `/uploads/${(req as any).file.filename}` : undefined;

      const expense = await PettyCashExpense.create(
        [
          {
            fundId: fund._id,
            date: String(date),
            title: String(title).trim(),
            category: category ? String(category).trim() : undefined,
            vendor: vendor ? String(vendor).trim() : undefined,
            amount: amt,
            note: note ? String(note).trim() : undefined,
            receiptUrl,
            createdByUserId: actor.actorUserId ? new mongoose.Types.ObjectId(actor.actorUserId) : undefined,
            createdByName: actor.actorName,
          },
        ],
        { session }
      );

      // update totals atomically
      fund.spentAmount = Number(fund.spentAmount) + amt;
      fund.remainingAmount = Number(fund.remainingAmount) - amt;
      await fund.save({ session });

      // in-app notification for expense (optional)
      await Notification.create(
        [
          {
            type: 'PETTY_CASH_EXPENSE',
            title: 'Petty Cash Expense Recorded',
            message: `${actor.actorName} recorded an expense of RWF ${amt.toLocaleString()} (${String(title).trim()}).`,
            fundId: fund._id,
            expenseId: expense[0]._id,
            severity: 'info',
            audienceRoles: ALLOWED_ROLES,
          },
        ],
        { session }
      );

      // low balance notification (once per fund)
      const isLow = lowBalanceReached(fund);
      const alreadyNotified = Boolean(fund.lowBalanceNotifiedAt);

      if (isLow && !alreadyNotified) {
        fund.lowBalanceNotifiedAt = new Date();
        await fund.save({ session });

        await Notification.create(
          [
            {
              type: 'PETTY_CASH_LOW',
              title: 'Petty Cash Low Balance',
              message: `Petty cash is low. Remaining: RWF ${Number(fund.remainingAmount).toLocaleString()} (Fund: ${fund.name}).`,
              fundId: fund._id,
              severity: 'warning',
              audienceRoles: ALLOWED_ROLES,
            },
          ],
          { session }
        );

        // email (outside transaction is also fine, but here we do it after commit)
      }
    });

    // After transaction commit, if low balance reached and first time -> email
    const updatedFund = await PettyCashFund.findById(fundId);
    if (updatedFund && updatedFund.lowBalanceNotifiedAt && lowBalanceReached(updatedFund)) {
      const recipients = await getAlertRecipients();
      if (recipients.length) {
        await sendEmail(
          recipients,
          `Petty Cash Low Balance: ${updatedFund.name}`,
          `
            <div style="font-family: Arial, sans-serif; line-height: 1.5;">
              <h2>Petty Cash Low Balance</h2>
              <p><strong>Fund:</strong> ${updatedFund.name}</p>
              <p><strong>Initial:</strong> RWF ${Number(updatedFund.initialAmount).toLocaleString()}</p>
              <p><strong>Spent:</strong> RWF ${Number(updatedFund.spentAmount).toLocaleString()}</p>
              <p><strong>Remaining:</strong> RWF ${Number(updatedFund.remainingAmount).toLocaleString()}</p>
              <p>Remaining is at or below <strong>${updatedFund.lowBalancePercent}%</strong> threshold.</p>
              <p>Please top up or close and create a new petty cash fund.</p>
            </div>
          `
        );
      }
    }

    res.status(201).json({ message: 'Expense recorded successfully.' });
  } catch (err: any) {
    // map known errors to messages
    const msg = String(err?.message || '');

    if (msg === 'FUND_NOT_FOUND') return res.status(404).json({ message: 'Fund not found.' });
    if (msg === 'FUND_NOT_ACTIVE') return res.status(400).json({ message: 'Fund is not active.' });
    if (msg === 'INSUFFICIENT_FUNDS')
      return res.status(400).json({ message: 'Insufficient petty cash balance for this expense.' });

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

      // rollback totals
      fund.spentAmount = Math.max(0, Number(fund.spentAmount) - amt);
      fund.remainingAmount = Number(fund.remainingAmount) + amt;
      await fund.save({ session });

      const actor = actorFromReq(req);

      await Notification.create(
        [
          {
            type: 'PETTY_CASH_EXPENSE',
            title: 'Petty Cash Expense Deleted',
            message: `${actor.actorName} deleted an expense of RWF ${amt.toLocaleString()} (${expense.title}).`,
            fundId: fund._id,
            severity: 'info',
            audienceRoles: ALLOWED_ROLES,
          },
        ],
        { session }
      );
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