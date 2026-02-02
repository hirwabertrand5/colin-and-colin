import { useState } from 'react';
import { useParams, useNavigate, Link, Routes, Route, Navigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckSquare, Calendar as CalendarIcon, DollarSign, Clock, Upload } from 'lucide-react';
import { UserRole } from '../../App';

interface CaseWorkspaceProps {
  userRole: UserRole;
}

export default function CaseWorkspace({ userRole }: CaseWorkspaceProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock case data
  const caseData = {
  id: id,
  name: 'Uwase Jeanne vs Kigali Holdings',
  caseNumber: 'RWA-2026-CIV-0147',
  client: 'Uwase Jeanne',
  type: 'Civil (Land Dispute)',
  stage: 'Discovery & Site Inspection',
  priority: 'High',
  status: 'Active',
  supervisingPartner: 'Gatete Colin',
  assignedTo: 'Jean Karangwa',
  createdDate: '2026-01-03',
  description: 'Land dispute over boundary encroachment by Kigali Holdings in Bugesera District. Plaintiff seeks restraining order and compensation.',
  progress: 65,
};

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: 8 },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'documents', label: 'Documents', icon: Upload },
    { id: 'billing', label: 'Billing', icon: DollarSign },
    { id: 'audit', label: 'Audit Log', icon: Clock },
  ];

  const stages = [
  { name: 'Engagement & Onboarding', status: 'completed' },
  { name: 'Discovery & Site Inspection', status: 'active' },
  { name: 'Drafting Submissions', status: 'pending' },
  { name: 'Court Attendance', status: 'pending' },
  { name: 'Judgment Review', status: 'pending' },
];

  const tasks = [
  { id: '1', title: 'Draft Letter of Notice', assignee: 'Jean Karangwa', status: 'In Progress', dueDate: '2026-02-02', priority: 'High' },
  { id: '2', title: 'Review Land Registry File', assignee: 'Jean Karangwa', status: 'Not Started', dueDate: '2026-02-04', priority: 'Medium' },
  { id: '3', title: 'Draft Submissions', assignee: 'Gatete Colin', status: 'Completed', dueDate: '2026-01-28', priority: 'High' },
];

  const documents = [
  { id: '1', name: 'Power of Attorney.pdf', category: 'Court Filings', uploadedBy: 'Emma Uwizeye', uploadedDate: '2026-01-03', size: '230 KB' },
  { id: '2', name: 'Land Registry Extract.pdf', category: 'Evidence', uploadedBy: 'Jean Karangwa', uploadedDate: '2026-01-12', size: '1.4 MB' },
  { id: '3', name: 'Engagement Letter - Uwase.pdf', category: 'Client Docs', uploadedBy: 'Gatete Colin', uploadedDate: '2026-01-05', size: '786 KB' },
];

  const events = [
  { id: '1', title: 'Filing Deadline – Notice of Claim', date: '2026-02-05', time: '5:00 PM', type: 'Deadline' },
  { id: '2', title: 'Bugesera High Court Hearing', date: '2026-02-08', time: '10:00 AM', type: 'Court' },
  { id: '3', title: 'Client Site Visit (Bugesera)', date: '2026-01-31', time: '2:00 PM', type: 'Meeting' },
];

  const billingData = {
  totalBilled: 4580000,
  totalPaid: 3820000,
  outstanding: 760000,
  invoices: [
    { id: '1', invoiceNumber: 'RWF-2026-0147-01', amount: 1250000, status: 'Paid', date: '2026-01-10' },
    { id: '2', invoiceNumber: 'RWF-2026-0147-02', amount: 1530000, status: 'Paid', date: '2026-01-20' },
    { id: '3', invoiceNumber: 'RWF-2026-0147-03', amount: 1800000, status: 'Pending', date: '2026-01-28' },
  ],
};

  const auditLog = [
    { id: '1', user: 'Michael Chen', action: 'Updated task status', detail: 'Draft Motion to Dismiss: In Progress', timestamp: '2026-01-29 14:32' },
    { id: '2', user: 'Emma Davis', action: 'Uploaded document', detail: 'Discovery Request.docx', timestamp: '2026-01-29 11:15' },
    { id: '3', user: 'Sarah Mitchell', action: 'Approved task', detail: 'Client Deposition Prep', timestamp: '2026-01-28 16:45' },
    { id: '4', user: 'Michael Chen', action: 'Added calendar event', detail: 'Discovery Deadline - 2026-02-05', timestamp: '2026-01-27 09:20' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'active': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/cases')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Cases
        </button>

        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-semibold text-gray-900">{caseData.name}</h1>
              <span className={`px-2 py-1 text-xs rounded RWF {getPriorityColor(caseData.priority)}`}>
                {caseData.priority}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                {caseData.status}
              </span>
            </div>
            <p className="text-sm text-gray-600">{caseData.caseNumber} • {caseData.type}</p>
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
            Edit Case
          </button>
        </div>

        {/* Key Info Bar */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Client</p>
              <p className="text-sm font-medium text-gray-900">{caseData.client}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Supervising Partner</p>
              <p className="text-sm font-medium text-gray-900">{caseData.supervisingPartner}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Assigned To</p>
              <p className="text-sm font-medium text-gray-900">{caseData.assignedTo}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Created</p>
              <p className="text-sm font-medium text-gray-900">{caseData.createdDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center px-1 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                  RWF {activeTab === tab.id 
                    ? 'border-gray-900 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
                {tab.badge && (
                  <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Progress & Stage */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Case Progress</h2>
              
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Overall Progress</span>
                  <span className="font-medium">{caseData.progress}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gray-800 transition-all" 
                    style={{ width: `RWF {caseData.progress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {stages.map((stage, index) => (
                  <div key={stage.name} className="flex items-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                      RWF {stage.status === 'completed' ? 'bg-green-600 text-white' : 
                        stage.status === 'active' ? 'bg-blue-600 text-white' : 
                        'bg-gray-200 text-gray-600'}
                    `}>
                      {index + 1}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className={`text-sm font-medium RWF {
                        stage.status === 'pending' ? 'text-gray-500' : 'text-gray-900'
                      }`}>
                        {stage.name}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded RWF {getStatusColor(stage.status)}`}>
                      {stage.status === 'completed' ? 'Completed' :
                       stage.status === 'active' ? 'In Progress' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Case Description</h2>
              <p className="text-sm text-gray-600">{caseData.description}</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <CheckSquare className="w-5 h-5 text-gray-600" />
                </div>
                <div className="text-2xl font-semibold text-gray-900 mb-1">8</div>
                <div className="text-sm text-gray-600">Active Tasks</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <Upload className="w-5 h-5 text-gray-600" />
                </div>
                <div className="text-2xl font-semibold text-gray-900 mb-1">27</div>
                <div className="text-sm text-gray-600">Documents</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-5 h-5 text-gray-600" />
                </div>
              <div className="text-2xl font-semibold text-gray-900">
  RWF {(billingData.totalBilled / 1000).toFixed(1)}K
</div>
                <div className="text-sm text-gray-600">Total Billed</div>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Case Tasks</h2>
                <button className="px-3 py-1 text-sm bg-gray-800 text-white rounded hover:bg-gray-700">
                  + Add Task
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <div key={task.id} className="px-5 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs rounded RWF {getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-600">{task.status}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">{task.title}</p>
                      <p className="text-xs text-gray-500">Assigned to: {task.assignee}</p>
                    </div>
                    <button className="ml-4 px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">
                      View
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">Due: {task.dueDate}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Case Events & Deadlines</h2>
                <button className="px-3 py-1 text-sm bg-gray-800 text-white rounded hover:bg-gray-700">
                  + Add Event
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {events.map((event) => (
                <div key={event.id} className="px-5 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                          {event.type}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">{event.title}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        {event.date} at {event.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Case Documents</h2>
                <button className="px-3 py-1 text-sm bg-gray-800 text-white rounded hover:bg-gray-700">
                  <Upload className="w-4 h-4 inline mr-1" />
                  Upload
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <div key={doc.id} className="px-5 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                          {doc.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Uploaded by {doc.uploadedBy} on {doc.uploadedDate} • {doc.size}
                      </p>
                    </div>
                    <button className="ml-4 text-xs text-gray-700 hover:text-gray-900">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="text-sm text-gray-600 mb-1">Total Billed</div>
                <div className="text-2xl font-semibold text-gray-900">RWF {(billingData.totalBilled / 1000).toFixed(1)}K</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="text-sm text-gray-600 mb-1">Total Paid</div>
                <div className="text-2xl font-semibold text-green-600">RWF {(billingData.totalPaid / 1000).toFixed(1)}K</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="text-sm text-gray-600 mb-1">Outstanding</div>
                <div className="text-2xl font-semibold text-yellow-600">RWF {(billingData.outstanding / 1000).toFixed(1)}K</div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-5 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Invoices</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {billingData.invoices.map((invoice) => (
                  <div key={invoice.id} className="px-5 py-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-gray-500">Date: {invoice.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          RWF {invoice.amount.toLocaleString()}
                        </p>
                        <span className={`px-2 py-0.5 text-xs rounded RWF {
                          invoice.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit' && (
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Activity History</h2>
              <p className="text-xs text-gray-500 mt-1">Non-editable audit trail of all case activities</p>
            </div>
            <div className="divide-y divide-gray-200">
              {auditLog.map((entry) => (
                <div key={entry.id} className="px-5 py-4">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 mr-3" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{entry.user}</span>{' '}
                        <span className="text-gray-600">{entry.action}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{entry.detail}</p>
                      <p className="text-xs text-gray-400 mt-1">{entry.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
