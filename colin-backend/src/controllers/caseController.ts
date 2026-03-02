import { Response } from 'express';
import Case from '../models/caseModel';
import { writeAudit } from '../services/auditService';
import { AuthRequest } from '../middleware/authMiddleware';

const actorFromReq = (req: AuthRequest) => ({
  actorName: req.user?.name || 'System',
  actorUserId: req.user?.id as string | undefined,
});

// Get all cases
export const getAllCases = async (req: AuthRequest, res: Response) => {
  try {
    const cases = await Case.find().sort({ updatedAt: -1 });
    res.json(cases);
  } catch {
    res.status(500).json({ message: 'Failed to fetch cases.' });
  }
};

// Create new case
export const createCase = async (req: AuthRequest, res: Response) => {
  try {
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

    res.status(201).json(newCase);
  } catch {
    res.status(500).json({ message: 'Failed to create case.' });
  }
};

// Get single case by ID
export const getCaseById = async (req: AuthRequest, res: Response) => {
  try {
    const foundCase = await Case.findById(req.params.id);
    if (!foundCase) return res.status(404).json({ message: 'Case not found.' });
    res.json(foundCase);
  } catch {
    res.status(500).json({ message: 'Failed to fetch case.' });
  }
};

// Update case
export const updateCase = async (req: AuthRequest, res: Response) => {
  try {
    const before = await Case.findById(req.params.id);
    const updated = await Case.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updated) return res.status(404).json({ message: 'Case not found.' });

    const changes: string[] = [];
    if (before) {
      if (req.body.status && req.body.status !== before.status) changes.push(`Status: ${before.status} → ${req.body.status}`);
      if (req.body.priority && req.body.priority !== before.priority) changes.push(`Priority: ${before.priority} → ${req.body.priority}`);
      if (req.body.assignedTo && req.body.assignedTo !== before.assignedTo) changes.push(`Assigned: ${before.assignedTo || '-'} → ${req.body.assignedTo}`);
      if (req.body.budget && String(req.body.budget) !== String(before.budget)) changes.push(`Budget: ${before.budget || '-'} → ${req.body.budget}`);
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

    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Failed to update case.' });
  }
};

// (Optional) Delete case
export const deleteCase = async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await Case.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Case not found.' });
    res.json({ message: 'Case deleted.' });
  } catch {
    res.status(500).json({ message: 'Failed to delete case.' });
  }
};