import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Clock, User, Briefcase } from 'lucide-react';
import { UserRole } from '../../App';

interface TaskDetailProps {
  userRole: UserRole;
}

export default function TaskDetail({ userRole }: TaskDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
  const [comments, setComments] = useState('');

  // Mock task data
  const task = {
    id: id,
    title: 'Draft Motion to Dismiss',
    case: 'Henderson vs State',
    caseId: '1',
    description: 'Prepare comprehensive motion to dismiss based on lack of subject matter jurisdiction. Include relevant case law citations and procedural requirements per local court rules.',
    assignee: 'Iradukunda Alex',
    assignedBy: 'Niyonsaba Grace',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2026-01-31',
    createdDate: '2026-01-15',
    requiresApproval: true,
    estimatedHours: 8,
    actualHours: 5.5,
    attachments: [
      { id: '1', name: 'Case Research.pdf', size: '1.2 MB', uploadedDate: '2026-01-28' },
      { id: '2', name: 'Draft Motion v1.docx', size: '456 KB', uploadedDate: '2026-01-29' },
    ],
    checklist: [
      { id: '1', item: 'Review case files', completed: true },
      { id: '2', item: 'Research applicable case law', completed: true },
      { id: '3', item: 'Draft motion outline', completed: true },
      { id: '4', item: 'Complete first draft', completed: true },
      { id: '5', item: 'Internal review and edits', completed: false },
      { id: '6', item: 'Submit for partner approval', completed: false },
    ],
    history: [
      { id: '1', user: 'Iradukunda Alex', action: 'Updated status to In Progress', timestamp: '2026-01-28 09:15' },
      { id: '2', user: 'Iradukunda Alex', action: 'Uploaded Draft Motion v1.docx', timestamp: '2026-01-29 14:30' },
      { id: '3', user: 'Iradukunda Alex', action: 'Logged 3.5 hours', timestamp: '2026-01-29 17:00' },
    ],
  };

  const handleApproval = (action: 'approve' | 'reject') => {
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const submitApproval = () => {
    console.log(`Task ${approvalAction}d with comments:`, comments);
    setShowApprovalModal(false);
    navigate('/tasks');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Not Started': return 'bg-gray-100 text-gray-600';
      case 'Pending Approval': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const completionPercentage = Math.round((task.checklist.filter(c => c.completed).length / task.checklist.length) * 100);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/tasks')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Tasks
        </button>

        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-semibold text-gray-900">{task.title}</h1>
              <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              <span className={`px-2 py-1 text-xs rounded ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Related to: <span className="text-gray-900 font-medium">{task.case}</span>
            </p>
          </div>
          
          {userRole === 'managing_partner' && task.requiresApproval && task.status === 'Pending Approval' && (
            <div className="flex gap-2">
              <button
                onClick={() => handleApproval('approve')}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </button>
              <button
                onClick={() => handleApproval('reject')}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </button>
            </div>
          )}
        </div>

        {/* Key Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center text-gray-600 mb-1">
              <User className="w-4 h-4 mr-2" />
              <span className="text-xs">Assigned To</span>
            </div>
            <p className="text-sm font-medium text-gray-900">{task.assignee}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center text-gray-600 mb-1">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-xs">Due Date</span>
            </div>
            <p className="text-sm font-medium text-gray-900">{task.dueDate}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center text-gray-600 mb-1">
              <Briefcase className="w-4 h-4 mr-2" />
              <span className="text-xs">Estimated Hours</span>
            </div>
            <p className="text-sm font-medium text-gray-900">{task.estimatedHours}h</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center text-gray-600 mb-1">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-xs">Actual Hours</span>
            </div>
            <p className="text-sm font-medium text-gray-900">{task.actualHours}h</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-sm text-gray-600">{task.description}</p>
          </div>

          {/* Checklist */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Task Checklist</h2>
              <span className="text-sm text-gray-600">{completionPercentage}% Complete</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-gray-800 transition-all" 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="space-y-2">
              {task.checklist.map((item) => (
                <label key={item.id} className="flex items-center gap-3 py-2 hover:bg-gray-50 rounded px-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => {}}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className={`text-sm flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {item.item}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Attachments</h2>
              <button className="text-sm text-gray-600 hover:text-gray-900">
                + Add File
              </button>
            </div>
            <div className="space-y-2">
              {task.attachments.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.size} • {file.uploadedDate}</p>
                    </div>
                  </div>
                  <button className="text-xs text-gray-600 hover:text-gray-900">
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Task Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Task Information</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Created:</span>
                <p className="font-medium text-gray-900">{task.createdDate}</p>
              </div>
              <div>
                <span className="text-gray-600">Assigned By:</span>
                <p className="font-medium text-gray-900">{task.assignedBy}</p>
              </div>
              <div>
                <span className="text-gray-600">Requires Approval:</span>
                <p className="font-medium text-gray-900">{task.requiresApproval ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
                View Case Details
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
                Log Hours
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
                Update Status
              </button>
              {task.requiresApproval && (
                <button className="w-full px-4 py-2 bg-gray-800 text-white rounded text-sm hover:bg-gray-700">
                  Submit for Approval
                </button>
              )}
            </div>
          </div>

          {/* Activity History */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Activity History</h3>
            <div className="space-y-3">
              {task.history.map((entry) => (
                <div key={entry.id} className="text-sm">
                  <p className="font-medium text-gray-900">{entry.user}</p>
                  <p className="text-gray-600">{entry.action}</p>
                  <p className="text-xs text-gray-400 mt-1">{entry.timestamp}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {approvalAction === 'approve' ? 'Approve Task' : 'Reject Task'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {approvalAction === 'approve' 
                ? 'Confirm approval of this task. You can add optional comments below.'
                : 'Please provide feedback on why this task is being rejected.'}
            </p>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add comments (optional)..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitApproval}
                className={`flex-1 px-4 py-2 rounded text-white ${
                  approvalAction === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
