import { useState } from 'react';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  FileText,
  Settings
} from 'lucide-react';

export default function NotificationCenter() {
  const [filter, setFilter] = useState('all');

  const notifications = [
    {
      id: '1',
      type: 'deadline',
      icon: AlertTriangle,
      title: 'Submission Deadline Approaching',
      message: 'Evidence submission for Uwase vs Kigali Holdings is due in 3 days',
      time: 'Today, 10:30 AM',
      read: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'approval',
      icon: CheckCircle,
      title: 'Approval Needed',
      message: 'A. Nirere submitted “Draft Submissions – Dereva Case” for partner review',
      time: '1 hour ago',
      read: false,
      priority: 'medium'
    },
    {
      id: '3',
      type: 'payment',
      icon: DollarSign,
      title: 'Payment Received',
      message: 'Invoice INV-RWA-2211 paid – RWF 3,200,000 from Dereva Ltd',
      time: '2 hours ago',
      read: false,
      priority: 'low'
    },
    {
      id: '4',
      type: 'calendar',
      icon: Calendar,
      title: 'Upcoming Hearing',
      message: 'High Court Mention (Twagirayezu Case) – 10:00 AM Tomorrow',
      time: 'Yesterday',
      read: true,
      priority: 'medium'
    },
    {
      id: '5',
      type: 'document',
      icon: FileText,
      title: 'New Document Uploaded',
      message: 'Jean Karangwa uploaded "Land Registry Extract.pdf" for Karangwa Estate',
      time: '2 days ago',
      read: true,
      priority: 'low'
    },
    {
      id: '6',
      type: 'deadline',
      icon: AlertTriangle,
      title: 'Task Overdue',
      message: 'Client Interview Preparation still marked as incomplete',
      time: '3 days ago',
      read: true,
      priority: 'high'
    },
    {
      id: '7',
      type: 'system',
      icon: Settings,
      title: 'System Update',
      message: 'Workflow library updated: 2 new templates available',
      time: '5 days ago',
      read: true,
      priority: 'low'
    }
  ];

  const getIconColor = (priority: string, read: boolean) => {
    if (read) return 'text-gray-400 bg-gray-100';
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Notification Center</h1>
            <p className="text-gray-600">
              All platform alerts related to your tasks, documents, calendaring, and progress
            </p>
          </div>
          {unreadCount > 0 && (
            <button className="text-sm text-gray-600 hover:text-gray-900">
              Mark all as read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: `Unread ${unreadCount > 0 ? `(${unreadCount})` : ''}` },
            { id: 'deadline', label: 'Deadlines' },
            { id: 'approval', label: 'Approvals' },
            { id: 'payment', label: 'Payments' },
            { id: 'calendar', label: 'Calendar' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`px-3 py-1 text-sm rounded ${
                filter === btn.id ? 'bg-gray-800 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                className={`px-5 py-4 transition-colors ${
                  !notification.read ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(
                      notification.priority,
                      notification.read
                    )}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 flex-shrink-0" title="New" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">{notification.time}</p>
                      <button className="text-xs text-gray-600 hover:text-gray-900">
                        Open →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No notifications found.</p>
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
        <div className="space-y-4">
          {[
            {
              id: 'notif-email',
              label: 'Email Alerts',
              sub: 'Get important notifications by email',
              defaultChecked: true,
            },
            {
              id: 'notif-deadline',
              label: 'Deadline Reminders',
              sub: 'Be alerted about legal deadlines & expirations',
              defaultChecked: true,
            },
            {
              id: 'notif-approval',
              label: 'Approval Requests',
              sub: 'Get notified when your review is requested',
              defaultChecked: true,
            },
            {
              id: 'notif-payment',
              label: 'Invoice & Payment Updates',
              sub: 'Alert when payment is received or due',
              defaultChecked: false,
            },
          ].map((pref) => (
            <label key={pref.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{pref.label}</p>
                <p className="text-xs text-gray-500">{pref.sub}</p>
              </div>
              <input
                id={pref.id}
                type="checkbox"
                className="w-5 h-5 rounded border-gray-300"
                defaultChecked={pref.defaultChecked}
              />
            </label>
          ))}
        </div>
        <button className="mt-4 px-4 py-2 bg-gray-800 text-white rounded text-sm hover:bg-gray-700 transition">
          Save Preferences
        </button>
      </div>
    </div>
  );
}