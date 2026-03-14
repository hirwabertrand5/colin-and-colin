import { useState } from 'react';
import { Search, Plus, Download } from 'lucide-react';
import { UserRole } from '../../App';

interface InvoiceManagementProps {
  userRole: UserRole;
}

export default function InvoiceManagement({ userRole }: InvoiceManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // ✅ Localized invoice examples
  const invoices = [
    {
      id: '1',
      invoiceNumber: 'RWF-2026-0145',
      case: 'Uwase vs Kigali Holdings',
      client: 'Jane Uwase',
      amount: 1800000,
      status: 'Pending',
      dueDate: '2026-02-15',
      sentDate: '2026-01-15',
      approvedBy: 'Gatete Colin',
    },
    {
      id: '2',
      invoiceNumber: 'RWF-2026-0144',
      case: 'Twagirayezu Labour Dispute',
      client: 'Alexis Twagirayezu',
      amount: 1250000,
      status: 'Paid',
      dueDate: '2026-02-10',
      sentDate: '2026-01-10',
      paidDate: '2026-01-28',
      approvedBy: 'Gatete Colin',
    },
    {
      id: '3',
      invoiceNumber: 'RWF-2026-0143',
      case: 'Nirere Land Claim',
      client: 'Aline Nirere',
      amount: 2200000,
      status: 'Overdue',
      dueDate: '2026-01-25',
      sentDate: '2025-12-25',
      approvedBy: 'Gatete Colin',
    },
    {
      id: '4',
      invoiceNumber: 'RWF-2026-0142',
      case: 'KABUYE vs KIBUYE Ltd',
      client: 'Jean Kabuye',
      amount: 1530000,
      status: 'Pending Approval',
      dueDate: '2026-02-08',
      sentDate: null,
      approvedBy: null,
    },
    {
      id: '5',
      invoiceNumber: 'RWF-2026-0141',
      case: 'Estate of Mugisha',
      client: 'Mugisha Family',
      amount: 850000,
      status: 'Paid',
      dueDate: '2026-01-20',
      sentDate: '2025-12-20',
      paidDate: '2026-01-18',
      approvedBy: 'Gatete Colin',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Overdue': return 'bg-red-100 text-red-700';
      case 'Pending Approval': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.case.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || invoice.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = filteredInvoices.filter(i => i.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = filteredInvoices.filter(i => i.status === 'Pending' || i.status === 'Pending Approval').reduce((sum, inv) => sum + inv.amount, 0);
  const overdueAmount = filteredInvoices.filter(i => i.status === 'Overdue').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Invoice Management</h1>
            <p className="text-gray-600">Manage all client billing and financial records</p>
          </div>
          {userRole === 'managing_partner' && (
            <button className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </button>
          )}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by invoice, client or case"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="all">All Status</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Total Amount</div>
          <div className="text-2xl font-semibold text-gray-900">
            RWF {(totalAmount / 1000).toFixed(1)}K
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Paid</div>
          <div className="text-2xl font-semibold text-green-600">
            RWF {(paidAmount / 1000).toFixed(1)}K
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Pending</div>
          <div className="text-2xl font-semibold text-yellow-600">
            RWF {(pendingAmount / 1000).toFixed(1)}K
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Overdue</div>
          <div className="text-2xl font-semibold text-red-600">
            RWF {(overdueAmount / 1000).toFixed(1)}K
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase">Invoice</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase">Case / Client</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase">Due Date</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-900">{inv.invoiceNumber}</p>
                    {inv.sentDate && (
                      <p className="text-xs text-gray-500">Sent: {inv.sentDate}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-gray-900">{inv.case}</p>
                    <p className="text-xs text-gray-500">{inv.client}</p>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                    RWF {inv.amount.toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-gray-900">{inv.dueDate}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {inv.status === 'Pending Approval' && userRole === 'managing_partner' && (
                        <button className="text-xs text-green-600 hover:text-green-700 font-medium">
                          Approve
                        </button>
                      )}
                      <button className="text-xs text-gray-600 hover:text-gray-900">View</button>
                      <button className="text-xs text-gray-600 hover:text-gray-900">Download</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredInvoices.length} invoices
        </p>
        <div className="flex gap-2">
          <button disabled className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Previous
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}