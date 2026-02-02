import { Link } from 'react-router-dom';
import {
  Plus,
  Calendar as CalendarIcon,
  FileUp,
  CheckSquare,
  Briefcase,
  Clock,
  Users
} from 'lucide-react';

export default function ExecutiveAssistantDashboard() {
  const stats = [
    { label: 'Cases Created (MTD)', value: '18', icon: Briefcase },
    { label: 'Documents Uploaded', value: '72', icon: FileUp },
    { label: 'Scheduled Events', value: '31', icon: CalendarIcon },
    { label: 'Tasks Coordinated', value: '59', icon: CheckSquare },
  ];

  const quickActions = [
    {
      icon: Plus,
      label: 'Create New Case',
      href: '/cases/new',
      color: 'bg-gray-800 text-white hover:bg-gray-700',
    },
    {
      icon: FileUp,
      label: 'Upload Documents',
      href: '/documents',
      color: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    },
    {
      icon: CalendarIcon,
      label: 'Schedule Event',
      href: '/calendar',
      color: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    },
    {
      icon: CheckSquare,
      label: 'Create Task',
      href: '/tasks',
      color: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    },
  ];

  const todaySchedule = [
    {
      id: '1',
      time: '9:00 AM',
      title: 'Registrar Filing – Uwase Case',
      attendees: 'Jean K., Assistant',
      location: 'Kigali Main Registry',
    },
    {
      id: '2',
      time: '10:30 AM',
      title: 'Partner Briefing – Monthly Summary',
      attendees: 'G. Colin, Team Leads',
      location: 'Boardroom A',
    },
    {
      id: '3',
      time: '2:00 PM',
      title: 'Client Coordination – Dereva Ltd',
      attendees: 'E. Uwizeye, Client',
      location: 'Zoom (Link Shared)',
    },
    {
      id: '4',
      time: '4:00 PM',
      title: 'Document Review – Contract Drafts',
      attendees: 'A. Nirere',
      location: 'Office 5',
    },
  ];

  const pendingCoordination = [
    {
      id: '1',
      type: 'Filing',
      title: 'Court Notice – Uwase vs Kigali Holdings',
      assignedTo: 'Jean Karangwa',
      status: 'Awaiting Upload',
      dueDate: '2026-02-01',
    },
    {
      id: '2',
      type: 'Meeting',
      title: 'Client Intake Follow-up – Twagirayezu',
      assignedTo: 'A. Nirere',
      status: 'Needs Scheduling',
      dueDate: '2026-02-02',
    },
    {
      id: '3',
      type: 'Form',
      title: 'Budget Approval – Dereva Ltd',
      assignedTo: 'G. Colin',
      status: 'Pending Review',
      dueDate: '2026-02-03',
    },
  ];

  const recentCases = [
    {
      id: '1',
      name: 'Uwase vs Kigali Holdings',
      client: 'Uwase Jeanne',
      createdDate: '2026-01-29',
      status: 'Active',
    },
    {
      id: '2',
      name: 'Twagirayezu Employment Matter',
      client: 'Twagirayezu Ltd',
      createdDate: '2026-01-27',
      status: 'Active',
    },
    {
      id: '3',
      name: 'Dereva Corporate Compliance',
      client: 'Dereva Ltd',
      createdDate: '2026-01-25',
      status: 'Active',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Awaiting Upload':
        return 'text-yellow-600';
      case 'Needs Scheduling':
        return 'text-red-600';
      case 'Pending Review':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Executive Assistant Dashboard</h1>
        <p className="text-gray-600">
          Overview of scheduling, coordination, and case handling tasks
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                to={action.href}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors ${action.color}`}
              >
                <Icon className="w-6 h-6 mb-2" />
                <span className="text-sm text-center">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-gray-700" />
                </div>
              </div>
              <div className="text-xl font-semibold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today’s Schedule */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Today’s Schedule</h2>
            <span className="text-xs text-gray-500">Friday, January 30</span>
          </div>
          <div className="divide-y divide-gray-200">
            {todaySchedule.map((event) => (
              <div key={event.id} className="px-5 py-4 hover:bg-gray-50 transition">
                <div className="flex items-start gap-3">
                  <div className="w-16 text-sm font-medium text-gray-900">{event.time}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 mb-1">{event.title}</p>
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <Users className="w-3 h-3 mr-1" />
                      {event.attendees}
                    </div>
                    <div className="text-xs text-gray-500">{event.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-gray-200">
            <Link to="/calendar" className="text-sm text-gray-600 hover:text-gray-900">
              View calendar →
            </Link>
          </div>
        </div>

        {/* Pending Coordination */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Pending Follow-up</h2>
            <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">
              {pendingCoordination.length} items
            </span>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingCoordination.map((item) => (
              <div key={item.id} className="px-5 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">{item.type}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">{item.title}</p>
                    <p className="text-xs text-gray-500 mb-1">Assigned to: {item.assignedTo}</p>
                    <p className={`text-xs font-medium ${getStatusColor(item.status)}`}>{item.status}</p>
                  </div>
                  <button className="ml-4 px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">
                    Follow Up
                  </button>
                </div>
                <div className="text-xs text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Due {item.dueDate}
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-gray-200">
            <Link to="/tasks" className="text-sm text-gray-600 hover:text-gray-900">
              See all coordination →
            </Link>
          </div>
        </div>

        {/* Recent Cases */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Recently Created Cases</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentCases.map((caseItem) => (
              <div key={caseItem.id} className="px-5 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900">{caseItem.name}</h3>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                        {caseItem.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Client: {caseItem.client}</p>
                    <p className="text-xs text-gray-500">Created: {caseItem.createdDate}</p>
                  </div>
                  <button className="ml-4 px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-gray-200">
            <Link to="/cases" className="text-sm text-gray-600 hover:text-gray-900">
              View all cases →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}