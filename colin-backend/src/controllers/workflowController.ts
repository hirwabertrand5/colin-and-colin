import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authMiddleware';
import WorkflowTemplate from '../models/workflowTemplateModel';
import WorkflowInstance from '../models/workflowInstanceModel';
import Case from '../models/caseModel';
import Document from '../models/documentModel';
import Task from '../models/taskModel';
import { writeAudit } from '../services/auditService';

const isAdmin = (role?: string) => role === 'managing_director' || role === 'executive_assistant';
const isAssociateLike = (role?: string) => role === 'associate' || role === 'lawyer' || role === 'intern';

const actorFromReq = (req: AuthRequest) => ({
  actorName: req.user?.name || 'System',
  actorUserId: req.user?.id as string | undefined,
});

const canAssociateLikeAccessCase = async (req: AuthRequest, foundCase: any) => {
  if (!isAssociateLike(req.user?.role)) return false;

  const me = (req.user?.name || '').trim();
  if (!me) return false;

  const assignedTo = String(foundCase.assignedTo || '').trim();
  if (assignedTo && assignedTo === me) return true;

  const hasTask = await Task.exists({ caseId: foundCase._id, assignee: me });
  return Boolean(hasTask);
};

// ---------- Templates ----------
export const listActiveTemplates = async (req: AuthRequest, res: Response) => {
  try {
    const templates = await WorkflowTemplate.find({ active: true })
      .sort({ matterType: 1, version: -1 })
      .lean();
    res.json(templates);
  } catch {
    res.status(500).json({ message: 'Failed to load workflow templates.' });
  }
};

export const listAllTemplates = async (req: AuthRequest, res: Response) => {
  try {
    if (!isAdmin(req.user?.role)) return res.status(403).json({ message: 'Forbidden.' });
    const templates = await WorkflowTemplate.find({}).sort({ updatedAt: -1 }).lean();
    res.json(templates);
  } catch {
    res.status(500).json({ message: 'Failed to load workflow templates.' });
  }
};

export const getTemplateById = async (req: AuthRequest, res: Response) => {
  try {
    const { templateId } = req.params as any;
    const t = await WorkflowTemplate.findById(templateId);
    if (!t) return res.status(404).json({ message: 'Template not found.' });
    res.json(t);
  } catch {
    res.status(500).json({ message: 'Failed to load template.' });
  }
};

export const createTemplate = async (req: AuthRequest, res: Response) => {
  try {
    if (!isAdmin(req.user?.role)) return res.status(403).json({ message: 'Forbidden.' });

    const created = await WorkflowTemplate.create(req.body);

    // NOTE: We avoid writing audit here because your audit log requires a caseId.
    res.status(201).json(created);
  } catch (e: any) {
    res.status(500).json({ message: e?.message || 'Failed to create template.' });
  }
};

export const updateTemplate = async (req: AuthRequest, res: Response) => {
  try {
    if (!isAdmin(req.user?.role)) return res.status(403).json({ message: 'Forbidden.' });

    const { templateId } = req.params as any;
    const updated = await WorkflowTemplate.findByIdAndUpdate(templateId, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Template not found.' });

    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Failed to update template.' });
  }
};

export const deleteTemplate = async (req: AuthRequest, res: Response) => {
  try {
    if (!isAdmin(req.user?.role)) return res.status(403).json({ message: 'Forbidden.' });
    const { templateId } = req.params as any;

    const deleted = await WorkflowTemplate.findByIdAndDelete(templateId);
    if (!deleted) return res.status(404).json({ message: 'Template not found.' });

    res.json({ message: 'Template deleted.' });
  } catch {
    res.status(500).json({ message: 'Failed to delete template.' });
  }
};

// ---------- Instances ----------
export const getWorkflowForCase = async (req: AuthRequest, res: Response) => {
  try {
    const { caseId } = req.params as any;
    const c: any = await Case.findById(caseId);
    if (!c) return res.status(404).json({ message: 'Case not found.' });

    if (!isAdmin(req.user?.role)) {
      const allowed = await canAssociateLikeAccessCase(req, c);
      if (!allowed) return res.status(403).json({ message: 'Forbidden.' });
    }

    const inst = await WorkflowInstance.findOne({ caseId: new mongoose.Types.ObjectId(caseId) }).lean();
    if (!inst) return res.status(404).json({ message: 'No workflow instance for this case.' });

    res.json(inst);
  } catch {
    res.status(500).json({ message: 'Failed to load workflow.' });
  }
};

// Admin endpoint (rarely needed if case creation already initializes)
export const initWorkflowForCase = async (req: AuthRequest, res: Response) => {
  try {
    if (!isAdmin(req.user?.role)) return res.status(403).json({ message: 'Forbidden.' });

    const { caseId } = req.params as any;
    const { templateId } = req.body || {};

    const c: any = await Case.findById(caseId);
    if (!c) return res.status(404).json({ message: 'Case not found.' });

    const exists = await WorkflowInstance.findOne({ caseId: c._id });
    if (exists) return res.status(400).json({ message: 'Workflow already exists for this case.' });

    const tId = templateId || c.workflowTemplateId;
    if (!tId) return res.status(400).json({ message: 'Missing templateId.' });

    const template: any = await WorkflowTemplate.findById(tId).lean();
    if (!template) return res.status(404).json({ message: 'Template not found.' });

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
      caseId: c._id,
      templateId: template._id,
      status: 'Active',
      currentStepKey: steps[0]?.stepKey,
      steps,
    });

    c.workflowTemplateId = template._id;
    c.workflowInstanceId = inst._id;
    c.matterType = template.matterType;
    c.workflowProgress = { status: 'In Progress', currentStepKey: inst.currentStepKey, percent: 0 };
    await c.save();

    const actor = actorFromReq(req);
    await writeAudit({
      caseId: String(c._id),
      actorName: actor.actorName,
      ...(actor.actorUserId ? { actorUserId: actor.actorUserId } : {}),
      action: 'WORKFLOW_INSTANCE_CREATED',
      message: 'Workflow initialized from template',
      detail: `${template.name} v${template.version}`,
    });

    res.status(201).json(inst);
  } catch (e: any) {
    res.status(500).json({ message: e?.message || 'Failed to initialize workflow.' });
  }
};

// Attach a document to a specific output slot (any case-access user can do this)
export const attachOutputDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { caseId, stepKey, outputKey } = req.params as any;
    const { documentId } = req.body || {};
    if (!documentId) return res.status(400).json({ message: 'Missing documentId' });

    const c: any = await Case.findById(caseId);
    if (!c) return res.status(404).json({ message: 'Case not found.' });

    if (!isAdmin(req.user?.role)) {
      const allowed = await canAssociateLikeAccessCase(req, c);
      if (!allowed) return res.status(403).json({ message: 'Forbidden.' });
    }

    const inst: any = await WorkflowInstance.findOne({ caseId: c._id });
    if (!inst) return res.status(404).json({ message: 'Workflow instance not found.' });

    const step = (inst.steps || []).find((s: any) => s.stepKey === stepKey);
    if (!step) return res.status(404).json({ message: 'Step not found.' });

    const out = (step.outputs || []).find((o: any) => o.key === outputKey);
    if (!out) return res.status(404).json({ message: 'Output not found.' });

    const doc: any = await Document.findById(documentId);
    if (!doc) return res.status(404).json({ message: 'Document not found.' });

    out.documentId = doc._id;
    out.uploadedAt = new Date();

    doc.workflowInstanceId = inst._id;
    doc.stepKey = stepKey;
    doc.outputKey = outputKey;
    await doc.save();

    await inst.save();

    const actor = actorFromReq(req);
    await writeAudit({
      caseId: String(c._id),
      actorName: actor.actorName,
      ...(actor.actorUserId ? { actorUserId: actor.actorUserId } : {}),
      action: 'WORKFLOW_OUTPUT_UPLOADED',
      message: 'Attached deliverable to workflow output',
      detail: `${stepKey} • ${outputKey} • ${doc.name || 'Document'}`,
    });

    res.json(inst);
  } catch {
    res.status(500).json({ message: 'Failed to attach output document.' });
  }
};

// Complete a step (admin only)
export const completeStep = async (req: AuthRequest, res: Response) => {
  try {
    if (!isAdmin(req.user?.role)) return res.status(403).json({ message: 'Forbidden.' });

    const { caseId, stepKey } = req.params as any;

    const c: any = await Case.findById(caseId);
    if (!c) return res.status(404).json({ message: 'Case not found.' });

    const inst: any = await WorkflowInstance.findOne({ caseId: c._id });
    if (!inst) return res.status(404).json({ message: 'Workflow instance not found.' });

    const step = (inst.steps || []).find((s: any) => s.stepKey === stepKey);
    if (!step) return res.status(404).json({ message: 'Step not found.' });

    const missing = (step.outputs || []).filter((o: any) => o.required && !o.documentId);
    if (missing.length) {
      return res.status(400).json({
        message: 'Cannot complete step. Missing required outputs.',
        missingOutputs: missing.map((m: any) => ({ key: m.key, name: m.name })),
      });
    }

    step.status = 'Completed';
    step.completedAt = new Date();

    const sorted = (inst.steps || []).slice().sort((a: any, b: any) => a.order - b.order);
    const idx = sorted.findIndex((x: any) => x.stepKey === stepKey);
    const next = sorted[idx + 1];

    if (next) {
      inst.currentStepKey = next.stepKey;
      const nextRef = inst.steps.find((x: any) => x.stepKey === next.stepKey);
      if (nextRef && nextRef.status === 'Not Started') nextRef.status = 'In Progress';
    } else {
      inst.status = 'Completed';
    }

    await inst.save();

    const completedCount = inst.steps.filter((s: any) => s.status === 'Completed').length;
    const total = inst.steps.length || 1;
    const percent = Math.round((completedCount / total) * 100);

    c.workflowProgress = {
      status: inst.status === 'Completed' ? 'Completed' : 'In Progress',
      currentStepKey: inst.currentStepKey,
      percent,
    };
    await c.save();

    const actor = actorFromReq(req);
    await writeAudit({
      caseId: String(c._id),
      actorName: actor.actorName,
      ...(actor.actorUserId ? { actorUserId: actor.actorUserId } : {}),
      action: 'WORKFLOW_STEP_COMPLETED',
      message: 'Completed workflow step',
      detail: `${stepKey} • ${step.title}`,
    });

    res.json(inst);
  } catch {
    res.status(500).json({ message: 'Failed to complete step.' });
  }
};