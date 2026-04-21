import { Response } from 'express';
import Case from '../models/caseModel';
import Task from '../models/taskModel';
import { writeAudit } from '../services/auditService';
import { AuthRequest } from '../middleware/authMiddleware';

import WorkflowTemplate from '../models/workflowTemplateModel';
import WorkflowInstance from '../models/workflowInstanceModel';

const actorFromReq = (req: AuthRequest) => ({
  actorName: req.user?.name || 'System',
  actorUserId: req.user?.id as string | undefined,
});

const isAdminCaseRole = (role?: string) =>
  role === 'managing_director' || role === 'executive_assistant';

const isAssociateLikeRole = (role?: string) =>
  role === 'associate' || role === 'junior_associate' || role === 'lawyer' || role === 'intern';

const canAssociateLikeAccessCase = async (req: AuthRequest, foundCase: any) => {
  if (!isAssociateLikeRole(req.user?.role)) return false;

  const me = (req.user?.name || '').trim();
  if (!me) return false;

  const assignedTo = String(foundCase.assignedTo || '').trim();
  if (assignedTo && assignedTo === me) return true;

  const hasTask = await Task.exists({
    caseId: foundCase._id,
    assignee: me,
  });

  return Boolean(hasTask);
};

export const getAllCases = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;

    if (isAdminCaseRole(role)) {
      const cases = await Case.find().sort({ updatedAt: -1 });
      return res.json(cases);
    }

    if (isAssociateLikeRole(role)) {
      const me = (req.user?.name || '').trim();
      if (!me) return res.json([]);

      const assignedCases = await Case.find({ assignedTo: me }).sort({ updatedAt: -1 });
      const taskCaseIds = await Task.distinct('caseId', { assignee: me });
      const taskCases = await Case.find({ _id: { $in: taskCaseIds } }).sort({ updatedAt: -1 });

      const map = new Map<string, any>();
      [...assignedCases, ...taskCases].forEach((c: any) => map.set(String(c._id), c));
      return res.json(Array.from(map.values()));
    }

    return res.status(403).json({ message: 'Forbidden.' });
  } catch {
    return res.status(500).json({ message: 'Failed to fetch cases.' });
  }
};

export const createCase = async (req: AuthRequest, res: Response) => {
  try {
    if (!isAdminCaseRole(req.user?.role)) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const newCase = new Case(req.body);
    await newCase.save();

    // ✅ Initialize workflow instance if workflowTemplateId provided
    const workflowTemplateId = (req.body as any)?.workflowTemplateId;
    if (workflowTemplateId) {
      const template: any = await WorkflowTemplate.findById(workflowTemplateId).lean();
      if (template) {
        const steps = (template.steps || [])
          .slice()
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
          .map((s: any, idx: number) => ({
            stepKey: s.key,
            title: s.title,
            stageKey: s.stageKey,
            order: s.order,
            status: idx === 0 ? 'In Progress' : 'Not Started',
            outputs: (s.outputs || []).map((o: any) => ({
              key: o.key,
              name: o.name,
              required: Boolean(o.required),
              category: o.category,
            })),
          }));

        const inst = await WorkflowInstance.create({
          caseId: newCase._id,
          templateId: template._id,
          status: 'Active',
          currentStepKey: steps[0]?.stepKey,
          steps,
        });

        newCase.workflowTemplateId = template._id as any;
        newCase.workflowInstanceId = inst._id as any;
        newCase.matterType = template.matterType;
        newCase.workflowProgress = {
          status: 'In Progress',
          percent: 0,
          ...(inst.currentStepKey ? { currentStepKey: inst.currentStepKey } : {}),
        };

        await newCase.save();

        const actor = actorFromReq(req);
        await writeAudit({
          caseId: String(newCase._id),
          actorName: actor.actorName,
          ...(actor.actorUserId ? { actorUserId: actor.actorUserId } : {}),
          action: 'WORKFLOW_INSTANCE_CREATED',
          message: 'Workflow initialized from template',
          detail: `${template.name} v${template.version}`,
        });
      }
    }

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

export const getCaseById = async (req: AuthRequest, res: Response) => {
  try {
    const foundCase: any = await Case.findById(req.params.id);
    if (!foundCase) return res.status(404).json({ message: 'Case not found.' });

    if (isAdminCaseRole(req.user?.role)) {
      return res.json(foundCase);
    }

    if (isAssociateLikeRole(req.user?.role)) {
      const allowed = await canAssociateLikeAccessCase(req, foundCase);
      if (allowed) return res.json(foundCase);
    }

    return res.status(403).json({ message: 'Forbidden.' });
  } catch {
    return res.status(500).json({ message: 'Failed to fetch case.' });
  }
};

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
      if (req.body.matterType && req.body.matterType !== before.matterType) changes.push(`Matter type changed`);
      if (req.body.legalServicePath) changes.push(`Legal service classification updated`);
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
