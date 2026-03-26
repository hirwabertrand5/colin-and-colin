import { Response } from 'express';
import mongoose from 'mongoose';
import Task from '../models/taskModel';
import Case from '../models/caseModel';
import { AuthRequest } from '../middleware/authMiddleware';
import { writeAudit } from '../services/auditService';
import TaskTimeLog from '../models/taskTimeLogModel';

const actorFromReq = (req: AuthRequest) => ({
  actorName: req.user?.name || 'System',
  actorUserId: req.user?.id as string | undefined,
});

const withActor = (req: AuthRequest) => {
  const actor = actorFromReq(req);
  return {
    actorName: actor.actorName,
    ...(actor.actorUserId ? { actorUserId: actor.actorUserId } : {}),
  };
};

const isAdminCaseRole = (role?: string) =>
  role === 'managing_director' || role === 'executive_assistant';

// Approved tasks become read-only for everyone
const isApprovedLocked = (task: any) =>
  task?.requiresApproval && String(task.approvalStatus) === 'Approved';

/**
 * Professional case access:
 * - MD/Exec: access any case
 * - Associate: access case if:
 *    a) Case.assignedTo === req.user.name
 *    OR
 *    b) Associate has at least one task in this case
 */
const canAccessCaseId = async (req: AuthRequest, caseId: string) => {
  const role = req.user?.role;

  if (isAdminCaseRole(role)) return true;

  if (role === 'associate') {
    const me = (req.user?.name || '').trim();
    if (!me) return false;

    const c: any = await Case.findById(caseId).select('assignedTo');
    if (!c) return false;

    // rule 1: case assigned to associate
    if (String(c.assignedTo || '').trim() === me) return true;

    // rule 2: associate has at least one task in this case
    const hasTask = await Task.exists({ caseId, assignee: me });
    return Boolean(hasTask);
  }

  return false;
};

// --------------------
// Case Tasks
// --------------------

// Get all tasks for a case
export const getTasksForCase = async (req: AuthRequest, res: Response) => {
  try {
    let caseId: any = req.params.caseId;
    if (Array.isArray(caseId)) caseId = caseId[0];
    if (!caseId) return res.status(400).json({ message: 'Missing caseId' });

    // ✅ Guard
    if (!(await canAccessCaseId(req, String(caseId)))) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const tasks = await Task.find({
      caseId: new mongoose.Types.ObjectId(caseId),
    }).sort({ dueDate: 1 });

    res.json(tasks);
  } catch {
    res.status(500).json({ message: 'Failed to fetch tasks.' });
  }
};

// Add a task to a case
export const addTaskToCase = async (req: AuthRequest, res: Response) => {
  try {
    let caseId: any = req.params.caseId;
    if (Array.isArray(caseId)) caseId = caseId[0];
    if (!caseId) return res.status(400).json({ message: 'Missing caseId' });

    // ✅ Guard (even though associates are blocked by route)
    if (!(await canAccessCaseId(req, String(caseId)))) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const requiresApproval = Boolean(req.body.requiresApproval);
    const approvalStatus = requiresApproval ? 'Draft' : 'Not Required';

    const newTask = new Task({
      ...req.body,
      caseId: new mongoose.Types.ObjectId(caseId),
      requiresApproval,
      approvalStatus,
      assignedBy: req.user?.name || 'System',
      submittedAt: undefined,
      approvedAt: undefined,
      rejectedAt: undefined,
      completedAt: undefined,
    });

    await newTask.save();

    await writeAudit({
      caseId,
      ...withActor(req),
      action: 'TASK_CREATED',
      message: 'Created task',
      detail: `${newTask.title || 'Untitled'} • Assignee: ${newTask.assignee || '-'} • Due: ${
        newTask.dueDate || '-'
      }`,
    });

    res.status(201).json(newTask);
  } catch {
    res.status(500).json({ message: 'Failed to create task.' });
  }
};

// --------------------
// Global Tasks
// --------------------

export const getAllTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { q, status, priority, approvalStatus } = req.query as any;

    const filter: any = {};

    // Visibility: non-MD sees only own tasks (MVP using name)
    if (req.user?.role !== 'managing_director') {
      filter.assignee = req.user?.name;
    }

    if (status && status !== 'all') filter.status = status;
    if (priority && priority !== 'all') filter.priority = priority;
    if (approvalStatus && approvalStatus !== 'all') filter.approvalStatus = approvalStatus;

    if (q && String(q).trim()) {
      const regex = new RegExp(String(q).trim(), 'i');
      filter.$or = [{ title: regex }, { assignee: regex }];
    }

    const tasks = await Task.find(filter).sort({ dueDate: 1, createdAt: -1 });
    res.json(tasks);
  } catch {
    res.status(500).json({ message: 'Failed to fetch tasks.' });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    let taskId: any = req.params.taskId;
    if (Array.isArray(taskId)) taskId = taskId[0];
    if (!taskId) return res.status(400).json({ message: 'Missing taskId' });

    const task: any = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    // Visibility rule:
    if (req.user?.role !== 'managing_director' && task.assignee !== req.user?.name) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    res.json(task);
  } catch {
    res.status(500).json({ message: 'Failed to fetch task.' });
  }
};

// Update task (normal edits)
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    let taskId: any = req.params.taskId;
    if (Array.isArray(taskId)) taskId = taskId[0];
    if (!taskId) return res.status(400).json({ message: 'Missing taskId' });

    const before: any = await Task.findById(taskId);
    if (!before) return res.status(404).json({ message: 'Task not found.' });

    if (isApprovedLocked(before)) {
      return res.status(403).json({ message: 'This task is approved and locked (read-only).' });
    }

    // ✅ Maintain completedAt properly when status changes
    const nextStatus = req.body?.status;

    // if moving into Completed, set completedAt
    if (nextStatus && nextStatus === 'Completed' && before.status !== 'Completed') {
      req.body.completedAt = new Date();
    }

    // if moving away from Completed, clear completedAt
    if (nextStatus && nextStatus !== 'Completed' && before.status === 'Completed') {
      req.body.completedAt = undefined;
    }

    // If approvalStatus changes manually (not recommended), protect consistency a bit:
    const nextApprovalStatus = req.body?.approvalStatus;
    if (nextApprovalStatus && nextApprovalStatus !== before.approvalStatus) {
      if (nextApprovalStatus === 'Rejected') {
        req.body.rejectedAt = new Date();
        req.body.approvedAt = undefined;
        req.body.completedAt = undefined;
      }
      if (nextApprovalStatus === 'Approved') {
        const now = new Date();
        req.body.approvedAt = now;
        req.body.rejectedAt = undefined;
        // approved implies completed for your workflow
        req.body.status = 'Completed';
        req.body.completedAt = now;
      }
    }

    const updated: any = await Task.findByIdAndUpdate(taskId, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Task not found.' });

    const changes: string[] = [];
    if (req.body.status && req.body.status !== before.status) changes.push(`Status: ${before.status} → ${req.body.status}`);
    if (req.body.assignee && req.body.assignee !== before.assignee) changes.push(`Assignee: ${before.assignee || '-'} → ${req.body.assignee}`);
    if (req.body.dueDate && req.body.dueDate !== before.dueDate) changes.push(`Due: ${before.dueDate || '-'} → ${req.body.dueDate}`);
    if (req.body.title && req.body.title !== before.title) changes.push(`Title changed`);

    await writeAudit({
      caseId: String(updated.caseId),
      ...withActor(req),
      action: 'TASK_UPDATED',
      message: 'Updated task',
      detail: `${updated.title || 'Untitled'}${changes.length ? ' • ' + changes.join(' • ') : ''}`,
    });

    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Failed to update task.' });
  }
};

// Delete task
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    let taskId: any = req.params.taskId;
    if (Array.isArray(taskId)) taskId = taskId[0];
    if (!taskId) return res.status(400).json({ message: 'Missing taskId' });

    const deleted = await Task.findByIdAndDelete(taskId);
    if (!deleted) return res.status(404).json({ message: 'Task not found.' });

    await writeAudit({
      caseId: String((deleted as any).caseId),
      ...withActor(req),
      action: 'TASK_DELETED',
      message: 'Deleted task',
      detail: (deleted as any).title || 'Untitled',
    });

    res.json({ message: 'Task deleted.' });
  } catch {
    res.status(500).json({ message: 'Failed to delete task.' });
  }
};

// --------------------
// Approval workflow
// --------------------

export const submitTaskForApproval = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params as any;
    if (!taskId) return res.status(400).json({ message: 'Missing taskId' });

    const task: any = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (!task.requiresApproval) {
      return res.status(400).json({ message: 'This task does not require approval.' });
    }

    if (!['Draft', 'Rejected'].includes(String(task.approvalStatus))) {
      return res.status(400).json({ message: `Cannot submit when status is ${task.approvalStatus}.` });
    }

    task.approvalStatus = 'Pending';
    task.submittedAt = new Date();
    await task.save();

    await writeAudit({
      caseId: String(task.caseId),
      ...withActor(req),
      action: 'TASK_UPDATED',
      message: 'Submitted task for approval',
      detail: task.title || 'Untitled',
    });

    res.json(task);
  } catch {
    res.status(500).json({ message: 'Failed to submit task for approval.' });
  }
};

// Approve (MD only via route middleware)
export const approveTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params as any;
    const { comment } = req.body || {};
    if (!taskId) return res.status(400).json({ message: 'Missing taskId' });

    const task: any = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (!task.requiresApproval) {
      return res.status(400).json({ message: 'This task does not require approval.' });
    }

    if (task.approvalStatus !== 'Pending') {
      return res.status(400).json({ message: 'Task is not pending approval.' });
    }

    const now = new Date();

    task.approvalStatus = 'Approved';
    task.status = 'Completed';

    task.approvedAt = now;
    task.rejectedAt = undefined;

    task.completedAt = now; // ✅ important for on-time KPI
    task.approvedBy = req.user?.name || 'System';
    task.approvalComment = String(comment || '').trim();

    await task.save();

    await writeAudit({
      caseId: String(task.caseId),
      ...withActor(req),
      action: 'TASK_UPDATED',
      message: 'Approved task',
      detail: `${task.title || 'Untitled'} • Marked Completed`,
    });

    res.json(task);
  } catch {
    res.status(500).json({ message: 'Failed to approve task.' });
  }
};

// Reject (MD only via route middleware)
export const rejectTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params as any;
    const { comment } = req.body || {};
    if (!taskId) return res.status(400).json({ message: 'Missing taskId' });

    const task: any = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (!task.requiresApproval) {
      return res.status(400).json({ message: 'This task does not require approval.' });
    }

    if (task.approvalStatus !== 'Pending') {
      return res.status(400).json({ message: 'Task is not pending approval.' });
    }

    const now = new Date();

    task.approvalStatus = 'Rejected';
    task.rejectedAt = now;

    // keep approvedAt empty when rejected
    task.approvedAt = undefined;

    // If it was completed earlier (shouldn't happen in normal flow), clear completion.
    if (task.status === 'Completed') {
      task.status = 'In Progress';
    }
    task.completedAt = undefined;

    task.approvedBy = req.user?.name || 'System';
    task.approvalComment = String(comment || '').trim();

    await task.save();

    await writeAudit({
      caseId: String(task.caseId),
      ...withActor(req),
      action: 'TASK_UPDATED',
      message: 'Rejected task',
      detail: `${task.title || 'Untitled'}${task.approvalComment ? ' • ' + task.approvalComment : ''}`,
    });

    res.json(task);
  } catch {
    res.status(500).json({ message: 'Failed to reject task.' });
  }
};

// --------------------
// Checklist (locked after Approved)
// --------------------

export const addChecklistItem = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params as any;
    const { item } = req.body;

    if (!taskId) return res.status(400).json({ message: 'Missing taskId' });
    if (!item || !String(item).trim()) return res.status(400).json({ message: 'Checklist item is required' });

    const task: any = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (isApprovedLocked(task)) return res.status(403).json({ message: 'Task is approved and locked.' });

    // Permissions: MD or assignee only
    if (req.user?.role !== 'managing_director' && task.assignee !== req.user?.name) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    task.checklist = task.checklist || [];
    task.checklist.push({ item: String(item).trim(), completed: false } as any);
    await task.save();

    await writeAudit({
      caseId: String(task.caseId),
      ...withActor(req),
      action: 'TASK_UPDATED',
      message: 'Added checklist item',
      detail: `${task.title || 'Task'} • ${String(item).trim()}`,
    });

    res.json(task);
  } catch {
    res.status(500).json({ message: 'Failed to add checklist item.' });
  }
};

export const toggleChecklistItem = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, itemId } = req.params as any;

    if (!taskId) return res.status(400).json({ message: 'Missing taskId' });
    if (!itemId) return res.status(400).json({ message: 'Missing itemId' });

    const task: any = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (isApprovedLocked(task)) return res.status(403).json({ message: 'Task is approved and locked.' });

    // Permissions: MD or assignee only
    if (req.user?.role !== 'managing_director' && task.assignee !== req.user?.name) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const item = task.checklist?.find((i: any) => String(i._id) === String(itemId));
    if (!item) return res.status(404).json({ message: 'Checklist item not found.' });

    item.completed = !item.completed;
    await task.save();

    await writeAudit({
      caseId: String(task.caseId),
      ...withActor(req),
      action: 'TASK_UPDATED',
      message: 'Updated checklist item',
      detail: `${task.title || 'Task'} • ${item.item} • ${item.completed ? 'Completed' : 'Pending'}`,
    });

    res.json(task);
  } catch {
    res.status(500).json({ message: 'Failed to update checklist item.' });
  }
};

export const deleteChecklistItem = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, itemId } = req.params as any;

    if (!taskId) return res.status(400).json({ message: 'Missing taskId' });
    if (!itemId) return res.status(400).json({ message: 'Missing itemId' });

    const task: any = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (isApprovedLocked(task)) return res.status(403).json({ message: 'Task is approved and locked.' });

    // Permissions: MD or assignee only
    if (req.user?.role !== 'managing_director' && task.assignee !== req.user?.name) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const item = task.checklist?.find((i: any) => String(i._id) === String(itemId));
    if (!item) return res.status(404).json({ message: 'Checklist item not found.' });

    const deletedText = item.item;

    task.checklist = (task.checklist || []).filter((i: any) => String(i._id) !== String(itemId)) as any;
    await task.save();

    await writeAudit({
      caseId: String(task.caseId),
      ...withActor(req),
      action: 'TASK_UPDATED',
      message: 'Deleted checklist item',
      detail: `${task.title || 'Task'} • ${deletedText}`,
    });

    res.json(task);
  } catch {
    res.status(500).json({ message: 'Failed to delete checklist item.' });
  }
};

// --------------------
// Time Logs (locked after Approved)
// --------------------

export const getTimeLogsForTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params as any;
    if (!taskId) return res.status(400).json({ message: 'Missing taskId' });

    const task: any = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    // visibility: MD or assignee only
    if (req.user?.role !== 'managing_director' && task.assignee !== req.user?.name) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const logs = await TaskTimeLog.find({ taskId: new mongoose.Types.ObjectId(taskId) }).sort({ loggedAt: -1 });
    const totalHours = logs.reduce((sum, l) => sum + (Number((l as any).hours) || 0), 0);

    res.json({ logs, totalHours });
  } catch {
    res.status(500).json({ message: 'Failed to fetch time logs.' });
  }
};

export const addTimeLogToTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params as any;
    const { hours, note, loggedAt } = req.body || {};

    if (!taskId) return res.status(400).json({ message: 'Missing taskId' });

    const numHours = Number(hours);
    if (!Number.isFinite(numHours) || numHours <= 0) {
      return res.status(400).json({ message: 'hours must be a positive number' });
    }

    const task: any = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (isApprovedLocked(task)) return res.status(403).json({ message: 'Task is approved and locked.' });

    // visibility/action: MD or assignee only
    if (req.user?.role !== 'managing_director' && task.assignee !== req.user?.name) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const payload: any = {
      taskId: new mongoose.Types.ObjectId(taskId),
      caseId: task.caseId,
      userName: req.user?.name || 'System',
      hours: numHours,
      loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
    };

    if (req.user?.id) payload.userId = new mongoose.Types.ObjectId(req.user.id);
    if (note && String(note).trim()) payload.note = String(note).trim();

    const log = await TaskTimeLog.create(payload);

    await writeAudit({
      caseId: String(task.caseId),
      ...withActor(req),
      action: 'TASK_UPDATED',
      message: 'Logged hours',
      detail: `${task.title || 'Task'} • ${numHours}h`,
    });

    res.status(201).json(log);
  } catch {
    res.status(500).json({ message: 'Failed to log hours.' });
  }
};