import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  User as UserIcon,
  Briefcase,
} from 'lucide-react';
import { UserRole } from '../../App';

import { getTaskById, TaskData, submitTaskForApproval, approveTask, rejectTask } from '../../services/taskService';
import { getCaseById, CaseData } from '../../services/caseService';
import { getDocumentsForCase, CaseDocument } from '../../services/documentService';
import { getAuditForCase, AuditLogItem } from '../../services/auditService';
import {
  getTimeLogsForTask,
  addTimeLogToTask,
  TimeLog,
} from '../../services/taskService';
import {
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
} from '../../services/taskService';

interface TaskDetailProps {
  userRole: UserRole;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function TaskDetail({ userRole }: TaskDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState<TaskData | null>(null);
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [totalHours, setTotalHours] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Approval modal
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
  const [comments, setComments] = useState('');
  const [approvalLoading, setApprovalLoading] = useState(false);

  // Log hours modal
  const [showLogHours, setShowLogHours] = useState(false);
  const [hoursValue, setHoursValue] = useState<string>('');
  const [hoursNote, setHoursNote] = useState<string>('');
  const [hoursLoading, setHoursLoading] = useState(false);

  // Checklist add item
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [checklistLoading, setChecklistLoading] = useState(false);

  const isManagingDirector = userRole === 'managing_director';

  const canWorkOnTask = useMemo(() => {
    // Backend already enforces, but UI should be safe
    if (!task) return false;
    if (isManagingDirector) return true;
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    return currentUser?.name && task.assignee === currentUser.name;
  }, [task, isManagingDirector]);

  const relatedCaseLabel = useMemo(() => {
    if (!caseData) return '—';
    return caseData.parties || caseData.caseNo || '—';
  }, [caseData]);

  const showSubmitForApproval =
    !!task?.requiresApproval &&
    !isManagingDirector &&
    task.approvalStatus !== 'Pending' &&
    task.approvalStatus !== 'Approved';

  const showApproveReject =
    !!task?.requiresApproval &&
    isManagingDirector &&
    task.approvalStatus === 'Pending';

  const completionPercentage = useMemo(() => {
    const list = task?.checklist || [];
    if (!list.length) return 0;
    const done = list.filter((c) => c.completed).length;
    return Math.round((done / list.length) * 100);
  }, [task?.checklist]);

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
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const loadAll = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const t = await getTaskById(id);
      setTask(t);

      const [c, docs, audit, time] = await Promise.all([
        getCaseById(t.caseId),
        getDocumentsForCase(t.caseId),
        getAuditForCase(t.caseId),
        getTimeLogsForTask(id),
      ]);

      setCaseData(c);
      setDocuments(docs);
      setAuditLogs(audit);
      setTimeLogs(time.logs);
      setTotalHours(time.totalHours);
    } catch (err: any) {
      setError(err.message || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const openApproval = (action: 'approve' | 'reject') => {
    setApprovalAction(action);
    setComments('');
    setShowApprovalModal(true);
  };

  const confirmApproval = async () => {
    if (!task?._id || !approvalAction) return;
    try {
      setApprovalLoading(true);
      if (approvalAction === 'approve') {
        await approveTask(task._id, comments);
      } else {
        await rejectTask(task._id, comments);
      }
      setShowApprovalModal(false);
      await loadAll();
    } catch (err: any) {
      setError(err.message || 'Approval action failed');
    } finally {
      setApprovalLoading(false);
    }
  };

  const submitForApproval = async () => {
    if (!task?._id) return;
    try {
      setApprovalLoading(true);
      await submitTaskForApproval(task._id);
      await loadAll();
    } catch (err: any) {
      setError(err.message || 'Failed to submit for approval');
    } finally {
      setApprovalLoading(false);
    }
  };

  const onToggleChecklist = async (itemId: string) => {
    if (!task?._id) return;
    try {
      setChecklistLoading(true);
      const updated = await toggleChecklistItem(task._id, itemId);
      setTask(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to update checklist');
    } finally {
      setChecklistLoading(false);
    }
  };

  const onAddChecklistItem = async () => {
    if (!task?._id) return;
    if (!newChecklistItem.trim()) return;
    try {
      setChecklistLoading(true);
      const updated = await addChecklistItem(task._id, newChecklistItem.trim());
      setTask(updated);
      setNewChecklistItem('');
    } catch (err: any) {
      setError(err.message || 'Failed to add checklist item');
    } finally {
      setChecklistLoading(false);
    }
  };

  const onDeleteChecklistItem = async (itemId: string) => {
    if (!task?._id) return;
    if (!confirm('Delete this checklist item?')) return;
    try {
      setChecklistLoading(true);
      const updated = await deleteChecklistItem(task._id, itemId);
      setTask(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to delete checklist item');
    } finally {
      setChecklistLoading(false);
    }
  };

  const openLogHours = () => {
    setHoursValue('');
    setHoursNote('');
    setShowLogHours(true);
  };

  const submitHours = async () => {
    if (!task?._id) return;
    const num = Number(hoursValue);
    if (!Number.isFinite(num) || num <= 0) {
      setError('Hours must be a positive number.');
      return;
    }

    try {
      setHoursLoading(true);
      await addTimeLogToTask(task._id, { hours: num, note: hoursNote });
      setShowLogHours(false);
      await loadAll();
    } catch (err: any) {
      setError(err.message || 'Failed to log hours');
    } finally {
      setHoursLoading(false);
    }
  };

  if (loading) return <div className="py-12 text-center text-gray-500">Loading task...</div>;
  if (error) return <div className="py-12 text-center text-red-600">{error}</div>;
  if (!task) return <div className="py-12 text-center text-gray-500">Task not found.</div>;

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
              {task.requiresApproval && task.approvalStatus === 'Pending' && (
                <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-700">
                  Approval Pending
                </span>
              )}
            </div>

            <p className="text-sm text-gray-600">
              Related to: <span className="text-gray-900 font-medium">{relatedCaseLabel}</span>
            </p>
          </div>

          {showApproveReject && (
            <div className="flex gap-2">
              <button
                onClick={() => openApproval('approve')}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </button>
              <button
                onClick={() => openApproval('reject')}
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
              <UserIcon className="w-4 h-4 mr-2" />
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
            <p className="text-sm font-medium text-gray-900">
              {task.estimatedHours ? `${task.estimatedHours}h` : '—'}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center text-gray-600 mb-1">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-xs">Actual Hours</span>
            </div>
            <p className="text-sm font-medium text-gray-900">{totalHours.toFixed(1)}h</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line">{task.description || '—'}</p>
          </div>

          {/* Checklist */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Task Checklist</h2>
              <span className="text-sm text-gray-600">{completionPercentage}% Complete</span>
            </div>

            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-gray-800 transition-all" style={{ width: `${completionPercentage}%` }} />
            </div>

            <div className="flex gap-2 mb-4">
              <input
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                placeholder="Add checklist item..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
                disabled={!canWorkOnTask || checklistLoading}
              />
              <button
                type="button"
                onClick={onAddChecklistItem}
                disabled={!canWorkOnTask || checklistLoading || !newChecklistItem.trim()}
                className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-60"
              >
                Add
              </button>
            </div>

            <div className="space-y-2">
              {(task.checklist || []).length === 0 ? (
                <div className="text-sm text-gray-500">No checklist items yet.</div>
              ) : (
                task.checklist!.map((item) => (
                  <div key={item._id} className="flex items-center gap-3 py-2 hover:bg-gray-50 rounded px-2">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => onToggleChecklist(item._id)}
                      disabled={!canWorkOnTask || checklistLoading}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className={`text-sm flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {item.item}
                    </span>
                    {canWorkOnTask && (
                      <button
                        type="button"
                        onClick={() => onDeleteChecklistItem(item._id)}
                        className="text-xs text-red-600 hover:text-red-800"
                        disabled={checklistLoading}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Attachments (case documents) */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Attachments</h2>
              <button
                className="text-sm text-gray-600 hover:text-gray-900"
                onClick={() => navigate(`/cases/${task.caseId}`)}
                type="button"
              >
                Upload in Case Documents →
              </button>
            </div>

            <div className="space-y-2">
              {documents.length === 0 ? (
                <div className="text-sm text-gray-500">No documents uploaded for this case yet.</div>
              ) : (
                documents.map((doc) => (
                  <div key={doc._id} className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        {doc.category} • {doc.size} • {doc.uploadedDate}
                      </p>
                    </div>
                    <a
                      href={BACKEND_URL + doc.url}
                      className="text-xs text-gray-600 hover:text-gray-900"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </a>
                  </div>
                ))
              )}
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
                <p className="font-medium text-gray-900">
                  {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '—'}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Assigned By:</span>
                <p className="font-medium text-gray-900">{task.assignedBy || '—'}</p>
              </div>
              <div>
                <span className="text-gray-600">Requires Approval:</span>
                <p className="font-medium text-gray-900">{task.requiresApproval ? 'Yes' : 'No'}</p>
              </div>
              {task.requiresApproval && (
                <div>
                  <span className="text-gray-600">Approval Status:</span>
                  <p className="font-medium text-gray-900">{task.approvalStatus || 'Pending'}</p>
                </div>
              )}
              {task.approvedBy && (
                <div>
                  <span className="text-gray-600">Decision By:</span>
                  <p className="font-medium text-gray-900">{task.approvedBy}</p>
                </div>
              )}
              {task.approvalComment && (
                <div>
                  <span className="text-gray-600">Comment:</span>
                  <p className="font-medium text-gray-900">{task.approvalComment}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">
              <button
                className="w-full px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => navigate(`/cases/${task.caseId}`)}
                type="button"
              >
                View Case Details
              </button>

              <button
                className="w-full px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                onClick={openLogHours}
                type="button"
                disabled={!canWorkOnTask}
              >
                Log Hours
              </button>

              {showSubmitForApproval && (
                <button
                  className="w-full px-4 py-2 bg-gray-900 text-white rounded text-sm hover:bg-gray-800 disabled:opacity-60"
                  onClick={submitForApproval}
                  disabled={approvalLoading}
                  type="button"
                >
                  {approvalLoading ? 'Submitting...' : 'Submit for Approval'}
                </button>
              )}
            </div>
          </div>

          {/* Activity History (audit log) */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Activity History</h3>
            <div className="space-y-3">
              {auditLogs.length === 0 ? (
                <div className="text-sm text-gray-500">No activity yet.</div>
              ) : (
                auditLogs.slice(0, 12).map((entry) => (
                  <div key={entry._id} className="text-sm">
                    <p className="font-medium text-gray-900">{entry.actorName}</p>
                    <p className="text-gray-600">{entry.message}</p>
                    {entry.detail ? <p className="text-gray-500">{entry.detail}</p> : null}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Time logs list */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Time Logs</h3>
            <div className="space-y-3">
              {timeLogs.length === 0 ? (
                <div className="text-sm text-gray-500">No hours logged yet.</div>
              ) : (
                timeLogs.slice(0, 8).map((log) => (
                  <div key={log._id} className="text-sm">
                    <p className="font-medium text-gray-900">{log.userName}</p>
                    <p className="text-gray-600">Logged {log.hours} hours</p>
                    {log.note ? <p className="text-gray-500">{log.note}</p> : null}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(log.loggedAt || log.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
                type="button"
              >
                Cancel
              </button>

              <button
                onClick={confirmApproval}
                disabled={approvalLoading}
                className={`flex-1 px-4 py-2 rounded text-white disabled:opacity-60 ${
                  approvalAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                type="button"
              >
                {approvalLoading ? 'Working...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Hours Modal */}
      {showLogHours && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Log Hours</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hours *</label>
                <input
                  value={hoursValue}
                  onChange={(e) => setHoursValue(e.target.value)}
                  placeholder="e.g. 2.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  inputMode="decimal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
                <textarea
                  value={hoursNote}
                  onChange={(e) => setHoursNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogHours(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={submitHours}
                  disabled={hoursLoading}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-60"
                >
                  {hoursLoading ? 'Saving...' : 'Log Hours'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}