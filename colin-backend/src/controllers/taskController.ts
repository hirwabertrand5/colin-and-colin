import { Response } from 'express';
import mongoose from 'mongoose';
import Task from '../models/taskModel';
import { writeAudit } from '../services/auditService';
import { AuthRequest } from '../middleware/authMiddleware';

const actorFromReq = (req: AuthRequest) => ({
  actorName: req.user?.name || 'System',
  actorUserId: req.user?.id as string | undefined,
});

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

    const newTask = new Task({ ...req.body, caseId: new mongoose.Types.ObjectId(caseId) });
    await newTask.save();

    const actor = actorFromReq(req);

    await writeAudit({
      caseId,
      actorName: actor.actorName,
      ...(actor.actorUserId ? { actorUserId: actor.actorUserId } : {}),
      action: 'TASK_CREATED',
      message: 'Created task',
      detail: `${newTask.title || 'Untitled'} • Due: ${newTask.dueDate || '-'} • Assignee: ${newTask.assignee || '-'}`,
    });

    res.status(201).json(newTask);
  } catch {
    res.status(500).json({ message: 'Failed to create task.' });
  }
};

// Update task
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

    const actor = actorFromReq(req);

    await writeAudit({
      caseId: String(updated.caseId),
      actorName: actor.actorName,
      ...(actor.actorUserId ? { actorUserId: actor.actorUserId } : {}),
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

    const actor = actorFromReq(req);

    await writeAudit({
      caseId: String(deleted.caseId),
      actorName: actor.actorName,
      ...(actor.actorUserId ? { actorUserId: actor.actorUserId } : {}),
      action: 'TASK_DELETED',
      message: 'Deleted task',
      detail: deleted.title || 'Untitled',
    });

    res.json({ message: 'Task deleted.' });
  } catch {
    res.status(500).json({ message: 'Failed to delete task.' });
  }
};