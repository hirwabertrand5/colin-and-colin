import { Save, Mail, Database, Shield, Bell } from 'lucide-react';

export default function Settings() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">System Settings</h1>
        <p className="text-gray-600">Configure system-wide settings and integrations</p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Shield className="w-5 h-5 text-gray-700 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Firm Name
              </label>
              <input
                type="text"
                defaultValue="Colin & Colin Legal Solutions Ltd"
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Firm Address
              </label>
              <input
                type="text"
                defaultValue="EDC Plaza, Adjacent to Swiss Embassy, KN 4 Avenue, Kigali"
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  defaultValue="+250 788 883 311"
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue="info@colinandcolin.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Email Integration */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Mail className="w-5 h-5 text-gray-700 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Email Integration</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300" defaultChecked />
                <span className="text-sm text-gray-900">Enable email notifications</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Server
              </label>
              <input
                type="text"
                placeholder="smtp.colinandcolin.com"
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Port
                </label>
                <input
                  type="text"
                  placeholder="587"
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Email
                </label>
                <input
                  type="email"
                  placeholder="notifications@colinandcolin.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
            </div>

            <button className="text-sm text-blue-600 hover:text-blue-700">
              Test email connection
            </button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Bell className="w-5 h-5 text-gray-700 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3">
              <input type="checkbox" className="mt-0.5 w-4 h-4 rounded border-gray-300" defaultChecked />
              <div>
                <p className="text-sm font-medium text-gray-900">Deadline Reminders</p>
                <p className="text-xs text-gray-500">Get email reminders for court hearings or client deadlines</p>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input type="checkbox" className="mt-0.5 w-4 h-4 rounded border-gray-300" defaultChecked />
              <div>
                <p className="text-sm font-medium text-gray-900">Task Assignments</p>
                <p className="text-xs text-gray-500">Notify staff when a new legal task is assigned</p>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input type="checkbox" className="mt-0.5 w-4 h-4 rounded border-gray-300" defaultChecked />
              <div>
                <p className="text-sm font-medium text-gray-900">Payment Updates</p>
                <p className="text-xs text-gray-500">Invoice payments and billing status updates</p>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input type="checkbox" className="mt-0.5 w-4 h-4 rounded border-gray-300" />
              <div>
                <p className="text-sm font-medium text-gray-900">Daily Summary</p>
                <p className="text-xs text-gray-500">End-of-day summary of performance and tasks</p>
              </div>
            </label>
          </div>
        </div>

        {/* Data Backup */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Database className="w-5 h-5 text-gray-700 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Data & Backup</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 mb-3">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300" defaultChecked />
                <span className="text-sm text-gray-900">Enable automatic backups</span>
              </label>

              <div className="ml-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backup Frequency
                </label>
                <select className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400">
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">Last backup: Jan 30, 2026 at 02:00 AM</p>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
                  Backup Now
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
                  View Backup History
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Shield className="w-5 h-5 text-gray-700 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3">
              <input type="checkbox" className="mt-0.5 w-4 h-4 rounded border-gray-300" defaultChecked />
              <div>
                <p className="text-sm font-medium text-gray-900">Require Strong Passwords</p>
                <p className="text-xs text-gray-500">Enforce secure password policies firm-wide</p>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input type="checkbox" className="mt-0.5 w-4 h-4 rounded border-gray-300" defaultChecked />
              <div>
                <p className="text-sm font-medium text-gray-900">Two-Factor Authentication (2FA)</p>
                <p className="text-xs text-gray-500">Enforce 2FA for all legal team members</p>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input type="checkbox" className="mt-0.5 w-4 h-4 rounded border-gray-300" />
              <div>
                <p className="text-sm font-medium text-gray-900">Session Timeout</p>
                <p className="text-xs text-gray-500">Auto logout after 30 min of inactivity</p>
              </div>
            </label>

            <div className="pt-4 border-t border-gray-200">
              <button className="text-sm text-blue-600 hover:text-blue-700">
                View audit log
              </button>
            </div>
          </div>
        </div>

        {/* Save / Cancel */}
        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}