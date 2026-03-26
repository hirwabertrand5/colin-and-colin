import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  FileText,
  Settings,
} from 'lucide-react';

import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  AppNotification,
} from '../../services/notificationService';

const getUserId = () => {
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    return u.id || u._id;
  } catch {
    return undefined;
  }
};

const iconForType = (type: string) => {
  switch (type) {
    case 'PETTY_CASH_LOW':
      return AlertTriangle;
    case 'PETTY_CASH_CREATED':
      return DollarSign;
    case 'PETTY_CASH_EXPENSE':
      return FileText;
    default:
      return Settings;
  }
};

const priorityForType = (type: string, severity?: string) => {
  if (severity === 'critical') return 'high';
  if (severity === 'warning') return 'high';
  if (type === 'PETTY_CASH_LOW') return 'high';
  return 'low';
};

export default function NotificationCenter() {
  const [filter, setFilter] = useState<string>('all');
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const userId = getUserId();

  const load = async (f = filter) => {
    try {
      setLoading(true);
      setError('');
      const data = await listNotifications(f);
      setItems(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load notifications');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const isRead = (n: AppNotification) => {
    if (!userId) return false;
    return (n.isReadBy || []).some((id) => String(id) === String(userId));
  };

  const unreadCount = useMemo(() => items.filter((n) => !isRead(n)).length, [items]);

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

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      await load(filter);
    } catch (e: any) {
      setError(e.message || 'Failed to mark all as read');
    }
  };

  const handleOpen = async (n: AppNotification) => {
    // mark as read then navigate later (when we add petty cash UI)
    try {
      await markNotificationRead(n._id);
      await load(filter);
      // future: navigate to petty cash page if n.fundId exists
      // e.g. navigate(`/petty-cash`)
    } catch (e: any) {
      setError(e.message || 'Failed to mark as read');
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Notification Center</h1>
            <p className="text-gray-600">All platform alerts and reminders</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAll} className="text-sm text-gray-600 hover:text-gray-900">
              Mark all as read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: `Unread ${unreadCount > 0 ? `(${unreadCount})` : ''}` },

            // Petty cash filters (backend types)
            { id: 'PETTY_CASH_LOW', label: 'Petty Cash Low' },
            { id: 'PETTY_CASH_CREATED', label: 'Petty Cash Created' },
            { id: 'PETTY_CASH_EXPENSE', label: 'Petty Cash Expenses' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`px-3 py-1 text-sm rounded ${
                filter === btn.id
                  ? 'bg-gray-800 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading notifications...</div>
        ) : items.length > 0 ? (
          items.map((n) => {
            const Icon = iconForType(n.type);
            const read = isRead(n);
            const priority = priorityForType(n.type, n.severity);

            const time = new Date(n.createdAt).toLocaleString();

            return (
              <div
                key={n._id}
                className={`px-5 py-4 transition-colors ${
                  !read ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(
                      priority,
                      read
                    )}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      {!read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 flex-shrink-0" title="New" />
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{n.message}</p>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">{time}</p>
                      <button
                        onClick={() => handleOpen(n)}
                        className="text-xs text-gray-600 hover:text-gray-900"
                      >
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

      {/* Preferences (still UI-only) */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
        <p className="text-sm text-gray-500">
          Preferences saving will be implemented after petty cash UI is completed.
        </p>
      </div>
    </div>
  );
}