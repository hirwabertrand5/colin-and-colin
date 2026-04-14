import { useEffect, useState } from 'react';
import { Save, Mail, Database, Shield, Bell } from 'lucide-react';
import { sendTestEmail } from '../../services/adminEmailService';
import usePageTitle from '../../hooks/usePageTitle';
import {
  getMyNotificationPreferences,
  updateMyNotificationPreferences,
  NotificationPreferences,
} from '../../services/notificationPreferencesService';

import WorkflowTemplates from './WorkflowTemplates';

export default function Settings() {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  usePageTitle('Settings');
  const [testSending, setTestSending] = useState(false);
  const [testTo, setTestTo] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const p = await getMyNotificationPreferences();
        if (!mounted) return;
        setPrefs(p);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message || 'Failed to load settings');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onSave = async () => {
    if (!prefs) return;
    try {
      setSaving(true);
      setErr('');
      setMsg('');
      const saved = await updateMyNotificationPreferences(prefs);
      setPrefs(saved);
      setMsg('Saved.');
      setTimeout(() => setMsg(''), 2000);
    } catch (e: any) {
      setErr(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const onTestEmail = async () => {
    try {
      setTestSending(true);
      setErr('');
      setMsg('');
      const resp = await sendTestEmail(testTo || undefined);
      setMsg(resp.message || 'Test email triggered.');
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setErr(e?.message || 'Failed to send test email');
    } finally {
      setTestSending(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">System Settings</h1>
        <p className="text-gray-600">Configure system-wide settings and integrations</p>
      </div>

      {err && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-700 rounded">
          {err}
        </div>
      )}
      {msg && (
        <div className="mb-6 p-4 border border-green-200 bg-green-50 text-green-700 rounded">
          {msg}
        </div>
      )}

      <div className="space-y-6">
        {/* General Settings (still static for now) */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Shield className="w-5 h-5 text-gray-700 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Firm Name</label>
              <input
                type="text"
                defaultValue="Colin & Colin Legal Solutions Ltd"
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Firm Address</label>
              <input
                type="text"
                defaultValue="EDC Plaza, Adjacent to Swiss Embassy, KN 4 Avenue, Kigali"
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          </div>
        </div>

        {/* ✅ Workflow templates editor */}
        <WorkflowTemplates />

        {/* Email Integration */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Mail className="w-5 h-5 text-gray-700 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Email Integration</h2>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-sm text-gray-500">Loading…</div>
            ) : !prefs ? (
              <div className="text-sm text-gray-500">No preferences loaded.</div>
            ) : (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300"
                  checked={prefs.emailEnabled}
                  onChange={(e) => setPrefs((p) => (p ? { ...p, emailEnabled: e.target.checked } : p))}
                />
                <span className="text-sm text-gray-900">Enable email notifications</span>
              </label>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Test send to (optional)</label>
                <input
                  type="email"
                  value={testTo}
                  onChange={(e) => setTestTo(e.target.value)}
                  placeholder="example@domain.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>

              <button
                type="button"
                onClick={onTestEmail}
                disabled={testSending}
                className="h-10 px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                {testSending ? 'Sending…' : 'Test email connection'}
              </button>
            </div>

            <p className="text-xs text-gray-500">
              SMTP credentials are read from backend environment variables.
            </p>
          </div>
        </div>

        {/* Notification Preferences (dynamic) */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Bell className="w-5 h-5 text-gray-700 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
          </div>

          {loading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : !prefs ? (
            <div className="text-sm text-gray-500">No preferences loaded.</div>
          ) : (
            <div className="space-y-3">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 rounded border-gray-300"
                  checked={prefs.deadlinesEnabled}
                  onChange={(e) => setPrefs((p) => (p ? { ...p, deadlinesEnabled: e.target.checked } : p))}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Deadline Reminders</p>
                  <p className="text-xs text-gray-500">Tasks due (24h) and hearings (24h + 2h).</p>
                </div>
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 rounded border-gray-300"
                  checked={prefs.taskAssignmentsEnabled}
                  onChange={(e) =>
                    setPrefs((p) => (p ? { ...p, taskAssignmentsEnabled: e.target.checked } : p))
                  }
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Task Assignments</p>
                  <p className="text-xs text-gray-500">Notify when a new task is assigned.</p>
                </div>
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 rounded border-gray-300"
                  checked={prefs.approvalsEnabled}
                  onChange={(e) => setPrefs((p) => (p ? { ...p, approvalsEnabled: e.target.checked } : p))}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Deadlines & Approvals</p>
                  <p className="text-xs text-gray-500">Approval requests and status updates.</p>
                </div>
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 rounded border-gray-300"
                  checked={prefs.pettyCashLowEnabled}
                  onChange={(e) =>
                    setPrefs((p) => (p ? { ...p, pettyCashLowEnabled: e.target.checked } : p))
                  }
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Petty Cash Low</p>
                  <p className="text-xs text-gray-500">Critical low balance alerts.</p>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Save */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onSave}
            disabled={!prefs || saving}
            className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-60"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 opacity-70">
          <div className="flex items-center mb-4">
            <Database className="w-5 h-5 text-gray-700 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Data & Backup</h2>
          </div>
          <p className="text-sm text-gray-600">Backup configuration UI can be wired later.</p>
        </div>
      </div>
    </div>
  );
}