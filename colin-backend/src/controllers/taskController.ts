import { Response } from 'express';
import mongoose from 'mongoose';
import Task from '../models/taskModel';
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

// Get all tasks for a case
export const getTasksForCase = async (req: AuthRequest, res: Response) => {
  try {
    let caseId: any = req.params.caseId;
    if (Array.isArray(caseId)) caseId = caseId[0];
    if (!caseId) return res.status(400).json({ message: 'Missing caseId' });

    const tasks = await Task.find({ caseId: new mongoose.Types.ObjectId(caseId) }).sort({ dueDate: 1 });
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

    // Enforce approvalStatus based on requiresApproval
    const requiresApproval = Boolean(req.body.requiresApproval);
    const approvalStatus = requiresApproval ? 'Pending' : 'Not Required';

    const newTask = new Task({
      ...req.body,
      caseId: new mongoose.Types.ObjectId(caseId),
      requiresApproval,
      approvalStatus,
      assignedBy: req.user?.name || 'System',
      submittedAt: requiresApproval ? new Date() : undefined,
    });

    await newTask.save();

    await writeAudit({
      caseId,
      ...withActor(req),
      action: 'TASK_CREATED',
      message: 'Created task',
      detail: `${newTask.title || 'Untitled'} • Assignee: ${newTask.assignee || '-'} • Due: ${newTask.dueDate || '-'}`,
    });

    res.status(201).json(newTask);
  } catch {
    res.status(500).json({ message: 'Failed to create task.' });
  }
};

// Update task (normal edits)
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    let taskId: any = req.params.taskId;
    if (Array.isArray(taskId)) taskId = taskId[0];
    if (!taskId) return res.status(400).json({ message: 'Missing taskId' });

    const before = await Task.findById(taskId);
    const updated = await Task.findByIdAndUpdate(taskId, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Task not found.' });

    const changes: string[] = [];
    if (before) {
      if (req.body.status && req.body.status !== before.status) changes.push(`Status: ${before.status} → ${req.body.status}`);
      if (req.body.assignee && req.body.assignee !== before.assignee) changes.push(`Assignee: ${before.assignee || '-'} → ${req.body.assignee}`);
      if (req.body.dueDate && req.body.dueDate !== before.dueDate) changes.push(`Due: ${before.dueDate || '-'} → ${req.body.dueDate}`);
      if (req.body.title && req.body.title !== before.title) changes.push(`Title changed`);
    }

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
      caseId: String(deleted.caseId),
      ...withActor(req),
      action: 'TASK_DELETED',
      message: 'Deleted task',
      detail: deleted.title || 'Untitled',
    });

    res.json({ message: 'Task deleted.' });
  } catch {
    res.status(500).json({ message: 'Failed to delete task.' });
  }
};

// --------------------
// Approval workflow
// --------------------

// Submit for approval (Associate/Assistant typically)
export const submitTaskForApproval = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params as any;
    if (!taskId) return res.status(400).json({ message: 'Missing taskId' });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (!task.requiresApproval) {
      return res.status(400).json({ message: 'This task does not require approval.' });
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

// Approve (Managing Director)
export const approveTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params as any;
    const { comment } = req.body || {};
    if (!taskId) return res.status(400).json({ message: 'Missing taskId' });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (!task.requiresApproval) {
      return res.status(400).json({ message: 'This task does not require approval.' });
    }

    task.approvalStatus = 'Approved';
    task.approvedAt = new Date();
    task.approvedBy = req.user?.name || 'System';
    task.approvalComment = comment || '';
    await task.save();

    await writeAudit({
      caseId: String(task.caseId),
      ...withActor(req),
      action: 'TASK_UPDATED',
      message: 'Approved task',
      detail: task.title || 'Untitled',
    });

    res.json(task);
  } catch {
    res.status(500).json({ message: 'Failed to approve task.' });
  }
};

// Reject (Managing Director)
export const rejectTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params as any;
    const { comment } = req.body || {};
    if (!taskId) return res.status(400).json({ message: 'Missing taskId' });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (!task.requiresApproval) {
      return res.status(400).json({ message: 'This task does not require approval.' });
    }

    task.approvalStatus = 'Rejected';
    task.approvedAt = new Date();
    task.approvedBy = req.user?.name || 'System';
    task.approvalComment = comment || '';
    await task.save();

    await writeAudit({
      caseId: String(task.caseId),
      ...withActor(req),
      action: 'TASK_UPDATED',
      message: 'Rejected task',
      detail: task.title || 'Untitled',
    });

    res.json(task);
  } catch {
    res.status(500).json({ message: 'Failed to reject task.' });
  }
};

// Get all tasks (firm-wide board)
export const getAllTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { q, status, priority, approvalStatus } = req.query as any;

    const filter: any = {};

    // Role-based visibility (MVP using assignee name)
    if (req.user?.role !== 'managing_director') {
      filter.assignee = req.user?.name;
    }

    if (status && status !== 'all') filter.status = status;
    if (priority && priority !== 'all') filter.priority = priority;

    // For pending approval column
    if (approvalStatus && approvalStatus !== 'all') {
      filter.approvalStatus = approvalStatus;
    }

    // Search by title or assignee
    if (q && String(q).trim()) {
      const regex = new RegExp(String(q).trim(), 'i');
      filter.$or = [{ title: regex }, { assignee: regex }];
    }

    const tasks = await Task.find(filter).sort({ dueDate: 1, createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks.' });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    let taskId: any = req.params.taskId;
    if (Array.isArray(taskId)) taskId = taskId[0];
    if (!taskId) return res.status(400).json({ message: 'Missing taskId' });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    // MVP visibility rule:
    // - Managing Director: can view all
    // - Others: only if assigned to them
    if (req.user?.role !== 'managing_director' && task.assignee !== req.user?.name) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    res.json(task);
  } catch {
    res.status(500).json({ message: 'Failed to fetch task.' });
  }
};
// --------------------
// Checklist
// --------------------

// Add checklist item
export const addChecklistItem = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params as any;
    const { item } = req.body;

    if (!taskId) return res.status(400).json({ message: 'Missing taskId' });
    if (!item || !String(item).trim()) return res.status(400).json({ message: 'Checklist item is required' });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    // Permissions (MVP): MD or assignee only
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

// Toggle checklist item completed
export const toggleChecklistItem = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, itemId } = req.params as any;

    if (!taskId) return res.status(400).json({ message: 'Missing taskId' });
    if (!itemId) return res.status(400).json({ message: 'Missing itemId' });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    // Permissions (MVP): MD or assignee only
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

// Delete checklist item
export const deleteChecklistItem = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, itemId } = req.params as any;

    if (!taskId) return res.status(400).json({ message: 'Missing taskId' });
    if (!itemId) return res.status(400).json({ message: 'Missing itemId' });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    // Permissions (MVP): MD or assignee only
    if (req.user?.role !== 'managing_director' && task.assignee !== req.user?.name) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const item = task.checklist?.find((i: any) => String(i._id) === String(itemId));
if (!item) return res.status(404).json({ message: 'Checklist item not found.' });

const deletedText = item.item;

// remove item
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

export const getTimeLogsForTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params as any;
    if (!taskId) return res.status(400).json({ message: 'Missing taskId' });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    // visibility: MD or assignee only (MVP)
    if (req.user?.role !== 'managing_director' && task.assignee !== req.user?.name) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const logs = await TaskTimeLog.find({ taskId: new mongoose.Types.ObjectId(taskId) })
      .sort({ loggedAt: -1 });

    const totalHours = logs.reduce((sum, l) => sum + (Number(l.hours) || 0), 0);

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

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    // visibility/action: MD or assignee only (MVP)
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

if (req.user?.id) {
  payload.userId = new mongoose.Types.ObjectId(req.user.id);
}

if (note && String(note).trim()) {
  payload.note = String(note).trim();
}

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
