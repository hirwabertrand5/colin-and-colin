import { useEffect, useMemo, useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import {
  Plus,
  Trash2,
  Wallet,
  AlertTriangle,
  X,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
} from 'lucide-react';

import {
  addExpenseToFund,
  closeActivePettyCashFund,
  createPettyCashFund,
  deleteExpense,
  getActivePettyCashFund,
  listExpensesForFund,
  PettyCashExpense,
  PettyCashFund,
} from '../../services/pettyCashService';

const API_URL = import.meta.env.VITE_API_URL;
const BACKEND_URL = API_URL ? API_URL.replace(/\/api\/?$/, '') : '';

const formatRwf = (n: number) => `RWF ${Math.round(n).toLocaleString('en-US')}`;

export default function PettyCashDashboard() {
  const [fund, setFund] = useState<PettyCashFund | null>(null);
  const [expenses, setExpenses] = useState<PettyCashExpense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  usePageTitle('Petty Cash');
  // Create fund modal
  const [showCreateFund, setShowCreateFund] = useState(false);
  const [fundForm, setFundForm] = useState({ name: '', description: '', initialAmount: '' });

  // Add expense modal
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    date: '',
    title: '',
    category: '',
    vendor: '',
    amount: '',
    note: '',
    receiptFile: null as File | null,
  });

  const lowThreshold = useMemo(() => {
    if (!fund) return 0;
    return (fund.initialAmount || 0) * ((fund.lowBalancePercent || 20) / 100);
  }, [fund]);

  const isLow = useMemo(() => {
    if (!fund) return false;
    return (fund.remainingAmount || 0) <= lowThreshold;
  }, [fund, lowThreshold]);

  const spentPercent = useMemo(() => {
    if (!fund || !fund.initialAmount) return 0;
    const pct = (fund.spentAmount / fund.initialAmount) * 100;
    return Math.max(0, Math.min(100, pct));
  }, [fund]);

  const remainingPercent = useMemo(() => {
    if (!fund || !fund.initialAmount) return 0;
    const pct = (fund.remainingAmount / fund.initialAmount) * 100;
    return Math.max(0, Math.min(100, pct));
  }, [fund]);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const active = await getActivePettyCashFund();
      setFund(active);

      if (active?._id) {
        const ex = await listExpensesForFund(active._id);
        setExpenses(ex);
      } else {
        setExpenses([]);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load petty cash');
      setFund(null);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateFund = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const initialAmount = Number(String(fundForm.initialAmount).replace(/[^\d.]/g, ''));

      if (!fundForm.name.trim() || !Number.isFinite(initialAmount) || initialAmount <= 0) {
        setError('Provide fund name and a valid initial amount.');
        return;
      }

      await createPettyCashFund({
        name: fundForm.name.trim(),
        description: fundForm.description.trim(),
        initialAmount,
      });

      setShowCreateFund(false);
      setFundForm({ name: '', description: '', initialAmount: '' });
      await load();
    } catch (e: any) {
      setError(e.message || 'Failed to create fund');
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fund?._id) return;

    try {
      setError('');
      const amount = Number(String(expenseForm.amount).replace(/[^\d.]/g, ''));

      if (!expenseForm.date || !expenseForm.title.trim() || !Number.isFinite(amount) || amount <= 0) {
        setError('Provide date, title and a valid amount.');
        return;
      }

      await addExpenseToFund(fund._id, {
        date: expenseForm.date,
        title: expenseForm.title.trim(),
        amount,
        category: expenseForm.category.trim() || undefined,
        vendor: expenseForm.vendor.trim() || undefined,
        note: expenseForm.note.trim() || undefined,
        receiptFile: expenseForm.receiptFile,
      });

      setShowAddExpense(false);
      setExpenseForm({
        date: '',
        title: '',
        category: '',
        vendor: '',
        amount: '',
        note: '',
        receiptFile: null,
      });

      await load();
    } catch (e: any) {
      setError(e.message || 'Failed to add expense');
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      setError('');
      await deleteExpense(expenseId);
      await load();
    } catch (e: any) {
      setError(e.message || 'Failed to delete expense');
    }
  };

  const handleCloseFund = async () => {
    if (!window.confirm('Close the active petty cash fund?')) return;
    try {
      setError('');
      await closeActivePettyCashFund();
      await load();
    } catch (e: any) {
      setError(e.message || 'Failed to close fund');
    }
  };

  // Stats (match BillingDashboard card style)
  const stats = useMemo(() => {
    const initial = fund?.initialAmount ?? 0;
    const spent = fund?.spentAmount ?? 0;
    const remaining = fund?.remainingAmount ?? 0;

    return [
      { label: 'Initial Amount', value: formatRwf(initial), trend: 'up' as const, icon: DollarSign },
      { label: 'Spent', value: formatRwf(spent), trend: 'up' as const, icon: TrendingUp },
      {
        label: 'Remaining',
        value: formatRwf(remaining),
        trend: isLow ? ('down' as const) : ('up' as const),
        icon: Wallet,
      },
      {
        label: 'Remaining Rate',
        value: `${Math.round(remainingPercent)}%`,
        trend: isLow ? ('down' as const) : ('up' as const),
        icon: TrendingDown,
      },
    ];
  }, [fund, isLow, remainingPercent]);

  const getTrendColor = (trend: 'up' | 'down') => (trend === 'up' ? 'text-green-600' : 'text-red-600');

  const getCardAccent = (label: string) => {
    if (label === 'Remaining' && isLow) return 'border-red-200 bg-red-50/30';
    return '';
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Petty Cash</h1>
            <p className="text-gray-600">Track petty cash allocations and expenses</p>
            {fund?.name ? (
              <p className="text-xs text-gray-500 mt-2">
                Active Fund: <span className="font-medium text-gray-700">{fund.name}</span>
              </p>
            ) : null}
          </div>

          <div className="flex gap-2">
            {!fund && (
              <button
                onClick={() => setShowCreateFund(true)}
                className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
              >
                Create Fund
              </button>
            )}

            {fund && (
              <>
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Expense
                </button>

                <button
                  onClick={handleCloseFund}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Close Fund
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-500">Loading…</div>
      ) : !fund ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6 text-gray-700" />
            <div>
              <div className="font-semibold text-gray-900">No active petty cash fund</div>
              <div className="text-sm text-gray-500">Create a fund to start recording expenses.</div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Stats (BillingDashboard style) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;

              return (
                <div
                  key={stat.label}
                  className={`bg-white border border-gray-200 rounded-lg p-5 ${getCardAccent(stat.label)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-700" />
                    </div>
                    <div className={`flex items-center text-xs ${getTrendColor(stat.trend)}`}>
                      <TrendIcon className="w-3 h-3 mr-1" />
                      —
                    </div>
                  </div>

                  <div className="text-2xl font-semibold text-gray-900 mb-1">
                    {loading ? '…' : stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>

                  {/* Progress bar only on Remaining */}
                  {stat.label === 'Remaining' && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>Remaining</span>
                        <span className="font-medium text-gray-700">{Math.round(remainingPercent)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${isLow ? 'bg-red-500' : 'bg-green-600'} transition-all`}
                          style={{ width: `${remainingPercent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                        <span>Spent: {Math.round(spentPercent)}%</span>
                        <span>
                          {formatRwf(fund.spentAmount)} / {formatRwf(fund.initialAmount)}
                        </span>
                      </div>

                      {isLow && (
                        <div className="mt-2 text-xs text-red-700 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Low balance (≤ {fund.lowBalancePercent}%)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Expenses panel */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                Expenses <span className="text-gray-500 font-medium">({expenses.length})</span>
              </h2>
              <Receipt className="w-5 h-5 text-gray-500" />
            </div>

            {expenses.length === 0 ? (
              <div className="px-5 py-10 text-gray-500">No expenses recorded yet.</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {expenses.map((ex, idx) => (
                  <div key={ex._id} className="px-5 py-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs text-gray-400">{idx + 1}.</span>
                          <p className="text-sm font-medium text-gray-900">{ex.title}</p>

                          {ex.category ? (
                            <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700">
                              {ex.category}
                            </span>
                          ) : null}
                        </div>

                        <p className="text-xs text-gray-500 mb-1">
                          {ex.date} • By {ex.createdByName}
                          {ex.vendor ? ` • Vendor: ${ex.vendor}` : ''}
                        </p>

                        {ex.note ? <p className="text-xs text-gray-600 mt-1">{ex.note}</p> : null}

                        <div className="mt-2 text-xs">
                          {ex.receiptUrl ? (
                            <a
                              href={BACKEND_URL + ex.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline font-medium"
                            >
                              View Receipt
                            </a>
                          ) : (
                            <span className="text-gray-400">No receipt</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900 mb-1">
                            {formatRwf(ex.amount)}
                          </p>
                        </div>

                        <button
                          onClick={() => handleDeleteExpense(ex._id)}
                          className="p-2 text-red-700 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="px-5 py-3 border-t border-gray-200">
              <span className="text-sm text-gray-600">Receipts are optional.</span>
            </div>
          </div>
        </>
      )}

      {/* Create Fund Modal (kept simple, consistent) */}
      {showCreateFund && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create Petty Cash Fund</h3>
              <button onClick={() => setShowCreateFund(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFund} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fund Name *</label>
                <input
                  value={fundForm.name}
                  onChange={(e) => setFundForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  placeholder="Office Petty Cash - April"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Amount (RWF) *</label>
                <input
                  inputMode="numeric"
                  value={fundForm.initialAmount}
                  onChange={(e) => setFundForm((p) => ({ ...p, initialAmount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  placeholder="500000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={fundForm.description}
                  onChange={(e) => setFundForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateFund(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal (Task modal reference) */}
      {showAddExpense && fund && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full flex flex-col" style={{ maxHeight: '90vh' }}>
            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add Expense</h3>
              <button
                type="button"
                onClick={() => setShowAddExpense(false)}
                className="text-gray-500 hover:text-gray-700"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="flex-1 overflow-y-auto space-y-4 p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, date: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  placeholder="Printer paper"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (RWF) *</label>
                  <input
                    inputMode="numeric"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm((p) => ({ ...p, amount: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    placeholder="45000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    placeholder="Supplies"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <input
                  value={expenseForm.vendor}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, vendor: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  placeholder="Stationery shop"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <textarea
                  value={expenseForm.note}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, note: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receipt (optional)</label>
                <input
                  type="file"
                  onChange={(e) => setExpenseForm((p) => ({ ...p, receiptFile: e.target.files?.[0] || null }))}
                  className="w-full"
                />
              </div>

              {/* Footer */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button type="submit" className="flex-1 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">
                  Add Expense
                </button>
              </div>

              <p className="text-xs text-gray-500">
                Note: Expenses exceeding the remaining balance will be blocked automatically.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}