import { useEffect, useMemo, useState } from 'react';
import { Save, Mail, Database, Shield, Bell, GitBranch, ChevronDown } from 'lucide-react';
import { sendTestEmail } from '../../services/adminEmailService';
import usePageTitle from '../../hooks/usePageTitle';
import {
  getMyNotificationPreferences,
  updateMyNotificationPreferences,
  NotificationPreferences,
} from '../../services/notificationPreferencesService';

import WorkflowTemplates from './WorkflowTemplates';

type WorkflowRow = {
  stage: string;
  keyActions: string;
  output: string;
  legalBasis: string;
  legalFees: string;
  timeline: string;
};

type WorkflowDoc = {
  id: string;
  title: string;
  rows: WorkflowRow[];
};

function CellList({ text }: { text: string }) {
  const lines = useMemo(() => {
    if (!text) return [];
    // split on newlines OR when "1. " appears (keeps your numbered items readable)
    return text
      .split(/\n|(?=\d+\.\s)/g)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [text]);

  if (lines.length <= 1) return <span className="whitespace-pre-wrap">{text}</span>;

  return (
    <ul className="list-disc pl-5 space-y-1">
      {lines.map((l, i) => (
        <li key={i} className="whitespace-pre-wrap">
          {l}
        </li>
      ))}
    </ul>
  );
}

function WorkflowTable({ rows }: { rows: WorkflowRow[] }) {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-[1100px] w-full text-sm">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            <th className="text-left p-3 border-b">Stage</th>
            <th className="text-left p-3 border-b">Key Actions</th>
            <th className="text-left p-3 border-b">Output</th>
            <th className="text-left p-3 border-b">Legal Basis</th>
            <th className="text-left p-3 border-b">Legal Fees</th>
            <th className="text-left p-3 border-b">Timeline</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {rows.map((r, idx) => (
            <tr key={idx} className="align-top">
              <td className="p-3 border-b font-medium text-gray-900 whitespace-pre-wrap">{r.stage}</td>
              <td className="p-3 border-b text-gray-700">
                <CellList text={r.keyActions} />
              </td>
              <td className="p-3 border-b text-gray-700 whitespace-pre-wrap">{r.output}</td>
              <td className="p-3 border-b text-gray-700 whitespace-pre-wrap">{r.legalBasis}</td>
              <td className="p-3 border-b text-gray-700 whitespace-pre-wrap">{r.legalFees}</td>
              <td className="p-3 border-b text-gray-700 whitespace-pre-wrap">{r.timeline}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Settings() {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  usePageTitle('Settings');
  const [testSending, setTestSending] = useState(false);
  const [testTo, setTestTo] = useState('');

  // Workflows UI state
  const [openWorkflowId, setOpenWorkflowId] = useState<string>('tontine');

  const workflows: WorkflowDoc[] = useMemo(
    () => [
      {
        id: 'tontine',
        title: 'Tontine Registration Workflow',
        rows: [
          {
            stage: 'SECTION 1: INITIAL CLIENT INTAKE & PRE-REGISTRATION\n1. Client onboarding & conflict check',
            keyActions:
              '1. Conduct conflict check\n2. Discussions with the client to understand needs/goals/facts\n3. Sign engagement/retainer',
            output: '1. Engagement letter\n2. Conflict of Interest declaration',
            legalBasis: 'Article 139 of the internal rules and regulations of the RBA',
            legalFees: '30,000 RWF (Opening file - Art. 21 of RBA regulation n01/2014)',
            timeline: '4–8 hours',
          },
          {
            stage: '2. Pre-registration file assessment',
            keyActions:
              '1. Conduct comprehensive analysis on requirements\n2. Identify required documents\n3. Identify appropriate procedure',
            output: 'Legal opinion',
            legalBasis:
              '1. Ministerial order n° 001/24/10/tc of 21/08/2024 governing tontines\n2. Ministerial Instructions n° 001/25/10/TC of 21/01/2025 (template of rules of procedure)',
            legalFees: '100,000 – 300,000 RWF (Art. 22[1] of RBA regulation n01/2014)',
            timeline: 'Within 24–72 hours of instruction',
          },
          {
            stage: 'SECTION 2: FILING THE APPLICATION FOR REGISTRATION OF TONTINE\n3. Drafting rules of procedure',
            keyActions: '1. Coordinate with client needs\n2. Advise on governance structure',
            output: 'Rules of procedure',
            legalBasis:
              '1. Article 27 of Ministerial order n° 001/24/10/tc\n2. Ministerial Instructions n° 001/25/10/TC',
            legalFees: '500,000 – 2,000,000 RWF (Art. 23[IV.b] of RBA regulation n01/2014)',
            timeline: '48–72 hours',
          },
          {
            stage: '4. Application for registration of Tontine',
            keyActions: '1. Gather/draft required documents\n2. Apply for tontine registration',
            output: 'Complete application file',
            legalBasis: 'Article 13 of Ministerial order n° 001/24/10/tc',
            legalFees: 'Included above',
            timeline: '24–48 hours',
          },
          {
            stage: 'SECTION 3: POST REGISTRATION – ONGOING COMPLIANCE\n1. Issuance of registration certificate',
            keyActions: 'Notifying the client the issuance of registration certificate',
            output: '1. Notification letter\n2. Registration certificate',
            legalBasis: 'N/A',
            legalFees: 'N/A',
            timeline: 'Immediately upon issuance',
          },
          {
            stage: '2. Compliance obligations',
            keyActions:
              '1. Ensure compliance with internal control mechanisms\n2. Open bank account for the tontine (if required)',
            output: '1. Internal control mechanisms\n2. Bank account',
            legalBasis: 'Article 271 & 23 of Ministerial order n° 001/24/10/tc',
            legalFees: '100,000 – 300,000 RWF (Art. 22[1] of RBA regulation n01/2014)',
            timeline: '24–48 hours',
          },
        ],
      },

      {
        id: 'dpp',
        title: 'Workflow for Data Protection Licenses',
        rows: [
          {
            stage: 'SECTION 1: DATA CONTROLLER/PROCESSOR REGISTRATION\n1. Client onboarding and conflict check',
            keyActions:
              '1. Conduct conflict search\n2. Discuss needs/objectives/requirements\n3. Sign engagement/retainer agreement',
            output: 'Engagement/retainer agreement\nClient file',
            legalBasis: '1. Art 139 internal rules of RBA\n2. DPO registration guide',
            legalFees: '30,000 RWF (Opening file - Art. 21 RBA regulation)',
            timeline: 'Within 4–8 hrs of first contact',
          },
          {
            stage: '3. Pre-registration file assessment',
            keyActions:
              '1. Legal analysis to determine controller/processor/both\n2. Confirm Rwanda nexus\n3. Identify cross-border transfer/storage',
            output: 'Legal opinion',
            legalBasis: 'Arts. 29 & 30 of DPP Law; DPO guidance',
            legalFees: '100,000 – 300,000 RWF (Art. 22(1) RBA)',
            timeline: '24–72 hrs after instruction',
          },
          {
            stage: '3. Registration file preparation',
            keyActions:
              '1. Fill registration form (full details, processing, recipients, transfers, risks)\n2. Identify data subjects/types/purposes\n3. Identify recipients/transfer countries/security gaps\n4. Identify risks/safeguards\n5. Draft data processing contracts (if needed)\n6. Application letter to CEO NCSA\n7. Local representative agreement (if needed)\n8. Draft/review additional documents (privacy notice, policies, DPIA, breach docs, etc.)',
            output:
              'Signed registration application\nData processing contracts\nApplication letter\nConsent/withdrawal forms\nPolicies (privacy, cookie, PDP, retention)\nDPIA register\nBreach response docs',
            legalBasis:
              'Articles 6–9, 17, 30, 38, 42, 46–47, 52; Articles 43–45 of DPP Law; DPO registration guide',
            legalFees: '2,000,000 – 15,000,000 FRW (art. 23[VII])',
            timeline: '3 to 7 days (matter-specific)',
          },
          {
            stage: '4. Filing Application and follow-up',
            keyActions:
              '1. Submit application to supervisory authority (NCSA), track acknowledgement\n2. Respond to queries/deficiency notices',
            output: 'Filed application and proof of submission',
            legalBasis: 'Art. 29 of DPP Law',
            legalFees: '500,000 – 3,000,000 FRW (art. 34)',
            timeline: 'Same day filing; follow-up as needed',
          },
          {
            stage: '6. Certificate issuance and handover',
            keyActions: 'Follow up until certificate is issued; store in file; alert client of obligations',
            output: 'Registration certificate (controller/processor)',
            legalBasis: 'Art. 31 of DPP Law',
            legalFees: 'Included above',
            timeline: 'Within 30 working days where requirements are met',
          },
        ],
      },

      {
        id: 'ngo',
        title: 'NGO Registration Workflow',
        rows: [
          {
            stage: '1. Client onboarding & conflict check',
            keyActions: '1. Receive client instructions\n2. Conduct conflict check\n3. Open client file',
            output: 'Client file created\nConflict clearance confirmation',
            legalBasis: 'N/A',
            legalFees: '50,000 – 200,000 RWF',
            timeline: '4–8 hours',
          },
          {
            stage: '2. Initial Setup',
            keyActions: '1. Draft statutes\n2. Notarize founding documents',
            output:
              'Notarized statutes (local NGO)\nNotarized minutes of meeting\nNotarized statutes + authorization (international NGO)',
            legalBasis: 'Art 20(1)(b,c) Law N° 058/2024 (NGOs)',
            legalFees: '500,000 – 3,000,000 RWF',
            timeline: 'Same day',
          },
          {
            stage: '4. Vetting Leadership',
            keyActions: '1. Identify legal representatives\n2. Submit credentials',
            output:
              'IDs/particulars\nCriminal records & acceptance declarations (local)\nPassports/IDs (international)',
            legalBasis: 'Art 20(1)(e,f) and Art 29(d) Law N° 058/2024',
            legalFees: 'N/A',
            timeline: '4–8 hours',
          },
          {
            stage: '6. Strategic Planning',
            keyActions: '1. Prepare action plan\n2. Develop budget\n3. Identify funding sources',
            output:
              'Annual action plan\nBudget & funding source (local)\nDonor proof + aligned plan (international)',
            legalBasis: 'Art 20(1)(h) and Art 29(g) Law N° 058/2024',
            legalFees: '100,000 – 300,000 RWF',
            timeline: '24–72 hrs',
          },
          {
            stage: '8. Final Filing',
            keyActions: '1. Submit application\n2. Pay required fees',
            output: 'Electronic submission confirmation\nProof of non-refundable fee payment',
            legalBasis: 'Art 6(1) Law N° 058/2024',
            legalFees: '500,000 – 2,000,000 RWF',
            timeline: '24 hrs',
          },
        ],
      },

      {
        id: 'immigration',
        title: 'Immigration Workflow',
        rows: [
          {
            stage: 'SECTION 1: CLIENT INTAKE & IMMIGRATION ASSESSMENT\n1.1 Initial Consultation',
            keyActions:
              'Receive client; intake interview\nIdentify immigration goal\nExplain procedure/rights\nConflict check\nSign engagement/retainer letter',
            output:
              'Client intake form\nConflict-of-interest declaration\nSigned engagement letter\nImmigration case file opened',
            legalBasis: 'Ministerial Order N°06/01 (immigration & emigration)',
            legalFees: 'RWF 30,000 (Opening file) – Art. 21 RBA',
            timeline: 'Within 4–8 hrs of first contact',
          },
          {
            stage: '1.2 Legal Assessment',
            keyActions:
              'Advise on options\nAnalyze visa/permit category\nPrepare written legal opinion\nIdentify required documentation',
            output: 'Written legal opinion note\nPathway analysis\nDocument checklist',
            legalBasis: 'Arts. 3, 10–12, 13, 20 (Ministerial Order N°06/01)',
            legalFees: 'RWF 100,000 – 300,000 (Art. 22(1) RBA)',
            timeline: '24–72 hrs after instruction',
          },
          {
            stage: 'SECTION 2: VISA APPLICATIONS\n2.2 Visitor Visa',
            keyActions:
              'Confirm criteria\nPrepare dossier: passport/photos/return ticket/accommodation/financials\nSubmit to DGIE/Embassy\nFollow up',
            output: 'Complete visa dossier\nSubmission acknowledgement\nVisa sticker/e-visa',
            legalBasis: 'Art. 12 (Visitor visa), Art. 3 (entry), Art. 24 (waiver)',
            legalFees: 'RWF 100,000 – 300,000',
            timeline: 'Prep: 2–5 days; Decision: 5–15 business days',
          },
          {
            stage: 'SECTION 3: RESIDENCE PERMITS\n3.1 Temporary Residence Permit',
            keyActions:
              'Identify correct class\nCompile dossier\nSubmit via IREMBO/DGIE\nMonitor decision and collect permit\nAdvise obligations',
            output:
              'Complete application dossier\nDGIE receipt\nTemporary Residence Permit card\nClient obligations note',
            legalBasis: 'Arts. 13–18',
            legalFees: 'RWF 200,000 – 600,000',
            timeline: 'Prep: 3–7 days; Decision: 15–30 days',
          },
        ],
      },
    ],
    []
  );

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

        {/* ✅ Workflow templates editor (your existing component) */}
        <WorkflowTemplates />

        {/* ✅ NEW: Workflows section (like the others) */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <GitBranch className="w-5 h-5 text-gray-700 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Workflows</h2>
          </div>

          <div className="space-y-3">
            {workflows.map((wf) => {
              const open = openWorkflowId === wf.id;
              return (
                <div key={wf.id} className="border border-gray-200 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setOpenWorkflowId((cur) => (cur === wf.id ? '' : wf.id))}
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                  >
                    <span className="text-sm font-medium text-gray-900">{wf.title}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform ${
                        open ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {open && (
                    <div className="px-4 pb-4">
                      <WorkflowTable rows={wf.rows} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-3 text-xs text-gray-500">
            These are fixed reference workflows (display only). Editing can be added later if needed.
          </p>
        </div>

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

            <p className="text-xs text-gray-500">SMTP credentials are read from backend environment variables.</p>
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