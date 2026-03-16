import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, TrendingDown, Receipt } from 'lucide-react';
import { UserRole } from '../../App';
import { getBillingSummary, BillingSummary } from '../../services/billingService';
import { getRecentInvoices, InvoiceWithCase } from '../../services/invoiceService';

interface BillingDashboardProps {
  userRole: UserRole;
}

const formatRwf = (n: number) => `RWF ${Math.round(n).toLocaleString('en-US')}`;

const canAccessBilling = (role: UserRole) =>
  role === 'managing_director' || role === 'executive_assistant';

export default function BillingDashboard({ userRole }: BillingDashboardProps) {
  const navigate = useNavigate();

  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [recent, setRecent] = useState<InvoiceWithCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!canAccessBilling(userRole)) {
      navigate('/dashboard');
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');

        // Overall summary: do NOT pass from/to; backend defaults to last 6 months
        const [s, r] = await Promise.all([getBillingSummary(), getRecentInvoices(5)]);

        if (!mounted) return;
        setSummary(s);
        setRecent(r);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load billing dashboard.');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userRole, navigate]);

  const stats = useMemo(() => {
    const billed = summary?.billed ?? 0;
    const collected = summary?.collected ?? 0;
    const outstanding = summary?.outstanding ?? Math.max(0, billed - collected);
    const collectionRate =
      summary?.collectionRate ??
      (billed > 0 ? Math.round((collected / billed) * 100) : 0);

    return [
      { label: 'Total Billed', value: formatRwf(billed), change: '', trend: 'up' as const, icon: DollarSign },
      { label: 'Collected', value: formatRwf(collected), change: '', trend: 'up' as const, icon: TrendingUp },
      { label: 'Outstanding', value: formatRwf(outstanding), change: '', trend: outstanding > 0 ? ('down' as const) : ('up' as const), icon: TrendingDown },
      { label: 'Collection Rate', value: `${collectionRate}%`, change: '', trend: 'up' as const, icon: DollarSign },
    ];
  }, [summary]);

  const maxValue = useMemo(() => {
    const months = summary?.months || [];
    const max = months.reduce((m, x) => Math.max(m, x.billed, x.collected), 0);
    return Math.max(1, Math.ceil(max * 1.1));
  }, [summary?.months]);

  const getStatusChip = (status: 'Paid' | 'Pending') =>
    status === 'Paid'
      ? 'bg-green-100 text-green-700'
      : 'bg-yellow-100 text-yellow-700';

  if (!canAccessBilling(userRole)) return null;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Billing & Finance</h1>
            <p className="text-gray-600">Track billing, invoices, and payments</p>
          </div>
          <Link
            to="/billing/invoices"
            className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            View All Invoices
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;

          return (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-700" />
                </div>
                <div className={`flex items-center text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendIcon className="w-3 h-3 mr-1" />
                  {stat.change || '—'}
                </div>
              </div>
              <div className="text-2xl font-semibold text-gray-900 mb-1">
                {loading ? '…' : stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Bottom Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent invoices (latest 5) */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Invoices</h2>
            <Receipt className="w-5 h-5 text-gray-500" />
          </div>

          {loading ? (
            <div className="px-5 py-10 text-gray-500">Loading invoices…</div>
          ) : recent.length === 0 ? (
            <div className="px-5 py-10 text-gray-500">No invoices found.</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recent.slice(0, 5).map((invoice) => (
                <div key={invoice._id} className="px-5 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900">{invoice.invoiceNo}</p>
                        <span className={`px-2 py-0.5 text-xs rounded ${getStatusChip(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mb-1">
                        Case: {invoice.case ? `${invoice.case.caseNo} • ${invoice.case.parties}` : '—'}
                      </p>

                      <p className="text-xs text-gray-500">Date: {invoice.date}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        {formatRwf(Number(invoice.amount) || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="px-5 py-3 border-t border-gray-200">
            <Link to="/billing/invoices" className="text-sm text-gray-600 hover:text-gray-900">
              View all invoices →
            </Link>
          </div>
        </div>

        {/* Monthly Summary (last 6 months from backend summary response) */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Monthly Summary</h2>
          </div>

          {loading ? (
            <div className="px-5 py-10 text-gray-500">Loading summary…</div>
          ) : (summary?.months?.length || 0) === 0 ? (
            <div className="px-5 py-10 text-gray-500">No data available.</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {(summary?.months || []).slice(-6).reverse().map((m) => (
                <div key={m.month} className="px-5 py-4 hover:bg-gray-50">
                  <p className="text-sm font-medium text-gray-900 mb-2">{m.month}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Billed:</span>
                      <span className="ml-1 font-medium text-gray-900">{formatRwf(m.billed)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Collected:</span>
                      <span className="ml-1 font-medium text-green-700">{formatRwf(m.collected)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trend chart (based on the same backend summary months) */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Billing Trend (Last 6 Months)</h2>

          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-500">Loading chart…</div>
          ) : (summary?.months?.length || 0) === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">No chart data.</div>
          ) : (
            <>
              <div className="h-64 flex items-end gap-4">
                {(summary?.months || []).slice(-6).map((data) => {
                  const billedHeight = (data.billed / maxValue) * 100;
                  const collectedHeight = (data.collected / maxValue) * 100;

                  return (
                    <div key={data.month} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex gap-1 mb-2" style={{ height: '200px' }}>
                        <div
                          className="flex-1 bg-gray-300 rounded-t"
                          style={{ height: `${billedHeight}%`, alignSelf: 'flex-end' }}
                          title={`Billed: ${formatRwf(data.billed)}`}
                        />
                        <div
                          className="flex-1 bg-green-600 rounded-t"
                          style={{ height: `${collectedHeight}%`, alignSelf: 'flex-end' }}
                          title={`Collected: ${formatRwf(data.collected)}`}
                        />
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{data.month.slice(5)}</div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded" />
                  <span className="text-sm text-gray-600">Billed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-600 rounded" />
                  <span className="text-sm text-gray-600">Collected</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}