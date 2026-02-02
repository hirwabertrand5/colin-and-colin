import { Link } from 'react-router-dom';
import {
  Briefcase,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Plus,
  FileText
} from 'lucide-react';

export default function ManagingPartnerDashboard() {
  const stats = [
    {
      label: 'Active Cases',
      value: '52',
      icon: Briefcase,
      change: '+5 this month',
    },
    {
      label: 'Pending Approvals',
      value: '9',
      icon: AlertCircle,
      change: '6 urgent',
    },
    {
      label: 'Total Billable',
      value: 'RWF 284M',
      icon: DollarSign,
      change: '+12% vs last month',
    },
    {
      label: 'Collection Rate',
      value: '94%',
      icon: TrendingUp,
      change: '+2% vs last month',
    },
  ];

  const pendingApprovals = [
    {
      id: '1',
      type: 'Invoice',
      title: 'February Retainer Invoice – Dereva Ltd',
      case: 'Corporate Advisory – Dereva Ltd',
      urgency: 'High',
      dueDate: '2026-02-05',
    },
    {
      id: '2',
      type: 'Task',
      title: 'Client Intake – Uwase vs Kigali Holdings',
      case: 'Litigation – Land Dispute',
      urgency: 'Medium',
      dueDate: '2026-02-03',
    },
    {
      id: '3',
      type: 'Task',
      title: 'Settlement Proposal Review',
      case: 'Twagirayezu Employment Matter',
      urgency: 'High',
      dueDate: '2026-02-02',
    },
  ];

  const upcomingDeadlines = [
    {
      id: '1',
      title: 'Evidence Submission Deadline',
      case: 'Uwase vs Kigali Holdings',
      date: '2026-02-05',
      time: '5:00 PM',
    },
    {
      id: '2',
      title: 'High Court Mention: Employment Appeal',
      case: 'Twagirayezu Matter',
      date: '2026-02-08',
      time: '10:00 AM',
    },
    {
      id: '3',
      title: 'Submission of Expert Report',
      case: 'Karangwa Succession',
      date: '2026-02-15',
      time: 'EOD',
    },
  ];

  const recentActivity = [
    {
      user: 'Jean Karangwa',
      action: 'submitted task for review',
      item: 'Request for Injunction – Uwase case',
      time: '2 hours ago',
    },
    {
      user: 'Emma Uwizeye',
      action: 'created new client case',
      item: 'Karangwa Estate Matter',
      time: '4 hours ago',
    },
    {
      user: 'Aline Nirere',
      action: 'completed',
      item: 'Client Meeting Follow-up Email',
      time: '6 hours ago',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Managing Partner Dashboard</h1>
        <p className="text-gray-600">Firm performance, approvals and billing insights</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          to="/cases/new"
          className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Case
        </Link>
        <Link
          to="/reports"
          className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded hover:bg-gray-50 transition-colors"
        >
          <FileText className="w-4 h-4 mr-2" />
          View Reports
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-700" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
              <div className="text-xs text-gray-500">{stat.change}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Pending Approvals</h2>
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
              {pendingApprovals.length} pending
            </span>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingApprovals.map((item) => (
              <div key={item.id} className="px-5 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">{item.type}</span>
                      {item.urgency === 'High' && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Urgent</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.case}</p>
                  </div>
                  <button className="ml-4 px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">
                    Review
                  </button>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  Due {item.dueDate}
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-gray-200">
            <Link to="/tasks" className="text-sm text-gray-600 hover:text-gray-900">
              View all approvals →
            </Link>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Upcoming Deadlines</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className="px-5 py-4 hover:bg-gray-50">
                <p className="text-sm font-medium text-gray-900 mb-1">{deadline.title}</p>
                <p className="text-xs text-gray-500 mb-2">{deadline.case}</p>
                <div className="flex items-center text-xs text-gray-600">
                  <Clock className="w-3 h-3 mr-1" />
                  {deadline.date} at {deadline.time}
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-gray-200">
            <Link to="/calendar" className="text-sm text-gray-600 hover:text-gray-900">
              View firm calendar →
            </Link>
          </div>
        </div>

        {/* Billing Summary */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Billing Overview</h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Billed (Jan)</span>
                <span className="font-medium text-gray-900">RWF 284,500,000</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gray-700" style={{ width: '85%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Collected</span>
                <span className="font-medium text-gray-900">RWF 267,400,000</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-600" style={{ width: '94%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Outstanding</span>
                <span className="font-medium text-gray-900">RWF 17,100,000</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: '6%' }} />
              </div>
            </div>
          </div>
          <div className="px-5 py-3 border-t border-gray-200">
            <Link to="/billing" className="text-sm text-gray-600 hover:text-gray-900">
              Go to billing →
            </Link>
          </div>
        </div>

        {/* Recent Team Activity */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Team Activity</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivity.map((activity, index) => (
              <div key={index} className="px-5 py-4">
                <p className="text-sm text-gray-900 mb-1">
                  <span className="font-medium">{activity.user}</span>{' '}
                  <span className="text-gray-600">{activity.action}</span>
                </p>
                <p className="text-xs text-gray-500">{activity.item}</p>
                <p className="text-xs text-gray-400">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}