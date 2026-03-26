import { Response } from 'express';
import Case from '../models/caseModel';
import Task from '../models/taskModel';
import { writeAudit } from '../services/auditService';
import { AuthRequest } from '../middleware/authMiddleware';

const actorFromReq = (req: AuthRequest) => ({
  actorName: req.user?.name || 'System',
  actorUserId: req.user?.id as string | undefined,
});

const isAdminCaseRole = (role?: string) =>
  role === 'managing_director' || role === 'executive_assistant';

/**
 * Professional associate-case access:
 * Associate can access a case if:
 * - Case.assignedTo === associate name
 *   OR
 * - Associate has at least one Task under that case assigned to them
 *
 * (This keeps your restriction "associates can't browse unrelated cases"
 * while allowing them to work on their assigned tasks.)
 */
const canAssociateAccessCase = async (req: AuthRequest, foundCase: any) => {
  if (req.user?.role !== 'associate') return false;

  const me = (req.user?.name || '').trim();
  if (!me) return false;

  // Rule 1: directly assigned on the case
  const assignedTo = String(foundCase.assignedTo || '').trim();
  if (assignedTo && assignedTo === me) return true;

  // Rule 2: has at least one task in this case
  const hasTask = await Task.exists({
    caseId: foundCase._id, // ObjectId match
    assignee: me,
  });

  return Boolean(hasTask);
};

// Get all cases
export const getAllCases = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;

    // ✅ MD + Exec: see all
    if (isAdminCaseRole(role)) {
      const cases = await Case.find().sort({ updatedAt: -1 });
      return res.json(cases);
    }

    // ✅ Associate: see cases they can access:
    // - directly assigned
    // - OR has tasks in the case
    if (role === 'associate') {
      const me = (req.user?.name || '').trim();
      if (!me) return res.json([]);

      const assignedCases = await Case.find({ assignedTo: me }).sort({ updatedAt: -1 });

      const taskCaseIds = await Task.distinct('caseId', { assignee: me });
      const taskCases = await Case.find({ _id: { $in: taskCaseIds } }).sort({ updatedAt: -1 });

      // merge unique
      const map = new Map<string, any>();
      [...assignedCases, ...taskCases].forEach((c: any) => map.set(String(c._id), c));

      return res.json(Array.from(map.values()));
    }

    return res.status(403).json({ message: 'Forbidden.' });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to fetch cases.' });
  }
};

// Create new case (MD/Exec only)
export const createCase = async (req: AuthRequest, res: Response) => {
  try {
    if (!isAdminCaseRole(req.user?.role)) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const newCase = new Case(req.body);
    await newCase.save();

    const actor = actorFromReq(req);

    await writeAudit({
      caseId: String(newCase._id),
      actorName: actor.actorName,
      ...(actor.actorUserId ? { actorUserId: actor.actorUserId } : {}),
      action: 'CASE_CREATED',
      message: 'Created case',
      detail: `${newCase.caseNo || ''} • ${newCase.parties || ''}`.trim(),
    });

    return res.status(201).json(newCase);
  } catch {
    return res.status(500).json({ message: 'Failed to create case.' });
  }
};

// Get single case by ID
export const getCaseById = async (req: AuthRequest, res: Response) => {
  try {
    const foundCase: any = await Case.findById(req.params.id);
    if (!foundCase) return res.status(404).json({ message: 'Case not found.' });

    // ✅ Admin roles can view all
    if (isAdminCaseRole(req.user?.role)) {
      return res.json(foundCase);
    }

    // ✅ Associate: allow if assigned OR has tasks in this case
    if (req.user?.role === 'associate') {
      const allowed = await canAssociateAccessCase(req, foundCase);
      if (allowed) return res.json(foundCase);
    }

    return res.status(403).json({ message: 'Forbidden.' });
  } catch {
    return res.status(500).json({ message: 'Failed to fetch case.' });
  }
};

// Update case (MD/Exec only)
export const updateCase = async (req: AuthRequest, res: Response) => {
  try {
    if (!isAdminCaseRole(req.user?.role)) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const before: any = await Case.findById(req.params.id);
    const updated: any = await Case.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updated) return res.status(404).json({ message: 'Case not found.' });

    const changes: string[] = [];
    if (before) {
      if (req.body.status && req.body.status !== before.status)
        changes.push(`Status: ${before.status} → ${req.body.status}`);
      if (req.body.priority && req.body.priority !== before.priority)
        changes.push(`Priority: ${before.priority} → ${req.body.priority}`);
      if (req.body.assignedTo && req.body.assignedTo !== before.assignedTo)
        changes.push(`Assigned: ${before.assignedTo || '-'} → ${req.body.assignedTo}`);
      if (req.body.budget && String(req.body.budget) !== String(before.budget))
        changes.push(`Budget: ${before.budget || '-'} → ${req.body.budget}`);
      if (req.body.caseNo && req.body.caseNo !== before.caseNo) changes.push(`Case No changed`);
      if (req.body.parties && req.body.parties !== before.parties) changes.push(`Parties changed`);
      if (req.body.caseType && req.body.caseType !== before.caseType) changes.push(`Case type changed`);
    }

    const actor = actorFromReq(req);

    await writeAudit({
      caseId: String(updated._id),
      actorName: actor.actorName,
      ...(actor.actorUserId ? { actorUserId: actor.actorUserId } : {}),
      action: 'CASE_UPDATED',
      message: 'Updated case',
      detail: changes.length ? changes.join(' • ') : `${updated.caseNo || ''}`.trim(),
    });

    return res.json(updated);
  } catch {
    return res.status(500).json({ message: 'Failed to update case.' });
  }
};

// Delete case (MD only)
export const deleteCase = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'managing_director') {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const deleted = await Case.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Case not found.' });

    return res.json({ message: 'Case deleted.' });
  } catch {
    return res.status(500).json({ message: 'Failed to delete case.' });
  }
};