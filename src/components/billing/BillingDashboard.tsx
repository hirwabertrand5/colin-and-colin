import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { UserRole } from '../../App';

interface BillingDashboardProps {
  userRole: UserRole;
}

export default function BillingDashboard({ userRole }: BillingDashboardProps) {
  const stats = [
    { label: 'Billed – Jan', value: 'RWF 284,500', change: '+12%', trend: 'up', icon: DollarSign },
    { label: 'Collected', value: 'RWF 267,400', change: '+8%', trend: 'up', icon: TrendingUp },
    { label: 'Outstanding', value: 'RWF 17,100', change: '-15%', trend: 'down', icon: TrendingDown },
    { label: 'Collection Rate', value: '94%', change: '+2%', trend: 'up', icon: DollarSign },
  ];

  const recentInvoices = [
    {
      id: '1',
      invoiceNumber: 'RWF-2026-1015',
      case: 'Twagirayezu Contract Review',
      client: 'Alexis Twagirayezu',
      amount: 1800000,
      status: 'Pending',
      dueDate: '2026-02-15',
      sentDate: '2026-01-15',
    },
    {
      id: '2',
      invoiceNumber: 'RWF-2026-1014',
      case: 'UWASE Land Dispute',
      client: 'Jane Uwase',
      amount: 1250000,
      status: 'Paid',
      dueDate: '2026-02-10',
      sentDate: '2026-01-10',
    },
    {
      id: '3',
      invoiceNumber: 'RWF-2026-1013',
      case: 'IRADUKUNDA vs Contractor',
      client: 'Claude Iradukunda',
      amount: 2200000,
      status: 'Overdue',
      dueDate: '2026-01-25',
      sentDate: '2025-12-25',
    },
  ];

  const casesBilling = [
    {
      case: 'Twagirayezu Contract Review',
      billed: 4580000,
      collected: 3820000,
      outstanding: 760000,
      hours: 142,
    },
    {
      case: 'UWASE Land Dispute',
      billed: 3850000,
      collected: 3850000,
      outstanding: 0,
      hours: 118,
    },
    {
      case: 'IRADUKUNDA vs Contractor',
      billed: 5200000,
      collected: 4800000,
      outstanding: 400000,
      hours: 165,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Overdue':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Billing & Finance</h1>
            <p className="text-gray-600">Track invoices, payments, and collection from cases</p>
          </div>
          <Link
            to="/billing/invoices"
            className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            View All Invoices
          </Link>
        </div>
      </div>

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
                <div
                  className={`flex items-center text-xs ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  <TrendIcon className="w-3 h-3 mr-1" />
                  {stat.change}
                </div>
              </div>
              <div className="text-2xl font-semibold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Bottom Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoices */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Recent Invoices</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentInvoices.map((invoice) => (
              <div key={invoice.id} className="px-5 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p>
                      <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{invoice.case}</p>
                    <p className="text-xs text-gray-500">Client: {invoice.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      RWF {invoice.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Due {invoice.dueDate}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-gray-200">
            <Link to="/billing/invoices" className="text-sm text-gray-600 hover:text-gray-900">
              View all invoices →
            </Link>
          </div>
        </div>

        {/* Per Case Summary */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Top Cases by Billing</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {casesBilling.map((item, index) => (
              <div key={index} className="px-5 py-4 hover:bg-gray-50">
                <p className="text-sm font-medium text-gray-900 mb-3">{item.case}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Billed:</span>
                    <span className="ml-1 font-medium text-gray-900">RWF {(item.billed / 1000).toFixed(0)}K</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Collected:</span>
                    <span className="ml-1 font-medium text-green-600">RWF {(item.collected / 1000).toFixed(0)}K</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Outstanding:</span>
                    <span className="ml-1 font-medium text-yellow-600">RWF {(item.outstanding / 1000).toFixed(0)}K</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Billable Hours:</span>
                    <span className="ml-1 font-medium text-gray-900">{item.hours}h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Billing Trend (Last 6 Months)</h2>
          <div className="h-64 flex items-end gap-4">
            {[
              { month: 'Aug', billed: 2450000, collected: 2320000 },
              { month: 'Sep', billed: 2680000, collected: 2510000 },
              { month: 'Oct', billed: 2590000, collected: 2430000 },
              { month: 'Nov', billed: 2750000, collected: 2610000 },
              { month: 'Dec', billed: 2540000, collected: 2450000 },
              { month: 'Jan', billed: 2845000, collected: 2674000 },
            ].map((data, index) => {
              const maxValue = 3000000;
              const billedHeight = (data.billed / maxValue) * 100;
              const collectedHeight = (data.collected / maxValue) * 100;

              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex gap-1 mb-2" style={{ height: '200px' }}>
                    <div className="flex-1 bg-gray-300 rounded-t relative" style={{ height: `${billedHeight}%`, alignSelf: 'flex-end' }}>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-600">
                        RWF {(data.billed / 1000).toFixed(0)}K
                      </div>
                    </div>
                    <div className="flex-1 bg-green-600 rounded-t relative" style={{ height: `${collectedHeight}%`, alignSelf: 'flex-end' }}>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white">
                        RWF {(data.collected / 1000).toFixed(0)}K
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{data.month}</div>
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
        </div>
      </div>
    </div>
  );
}