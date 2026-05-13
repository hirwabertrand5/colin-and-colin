"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setStepFeeAmount = exports.toggleStepAction = exports.extendStepDeadline = exports.reopenStep = exports.completeStep = exports.attachOutputDocument = exports.initWorkflowForCase = exports.getWorkflowForCase = exports.deleteTemplate = exports.updateTemplate = exports.createTemplate = exports.getTemplateById = exports.listAllTemplates = exports.listActiveTemplates = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const workflowTemplateModel_1 = __importDefault(require("../models/workflowTemplateModel"));
const workflowInstanceModel_1 = __importDefault(require("../models/workflowInstanceModel"));
const caseModel_1 = __importDefault(require("../models/caseModel"));
const documentModel_1 = __importDefault(require("../models/documentModel"));
const taskModel_1 = __importDefault(require("../models/taskModel"));
const auditService_1 = require("../services/auditService");
const workflowCompute_1 = require("../utils/workflowCompute");
const isAdmin = (role) => role === 'managing_director' || role === 'executive_assistant';
const isAssociateLike = (role) => role === 'associate' || role === 'junior_associate' || role === 'lawyer' || role === 'intern';
const actorFromReq = (req) => ({
    actorName: req.user?.name || 'System',
    actorUserId: req.user?.id,
});
const computeWorkflowMoney = (inst) => {
    const plannedAmount = (inst.steps || []).reduce((sum, s) => sum + (typeof s.feeAmount === 'number' ? s.feeAmount : 0), 0);
    const completedAmount = (inst.steps || []).reduce((sum, s) => sum + (s.status === 'Completed' && typeof s.feeAmount === 'number' ? s.feeAmount : 0), 0);
    const currency = (inst.steps || []).map((s) => s.feeCurrency).find(Boolean);
    return { plannedAmount, completedAmount, currency };
};
const computeNextDueAt = (inst) => {
    const pending = (inst.steps || [])
        .filter((s) => s.status !== 'Completed')
        .slice()
        .sort((a, b) => (a.order || 0) - (b.order || 0))[0];
    return pending?.dueAt;
};
const updateCaseWorkflowProgress = async (c, inst) => {
    const completedCount = (inst.steps || []).filter((s) => s.status === 'Completed').length;
    const total = inst.steps.length || 1;
    const percent = Math.round((completedCount / total) * 100);
    const { plannedAmount, completedAmount, currency } = computeWorkflowMoney(inst);
    const nextDueAt = computeNextDueAt(inst);
    c.workflowProgress = {
        status: inst.status === 'Completed' ? 'Completed' : 'In Progress',
        currentStepKey: inst.currentStepKey,
        currentStepTitle: (() => {
            if (!inst.currentStepKey)
                return undefined;
            const ref = (inst.steps || []).find((s) => s.stepKey === inst.currentStepKey);
            return ref?.title;
        })(),
        currentStepStartAt: (() => {
            if (!inst.currentStepKey)
                return undefined;
            const ref = (inst.steps || []).find((s) => s.stepKey === inst.currentStepKey);
            return ref?.startAt;
        })(),
        currentStepDueAt: (() => {
            if (!inst.currentStepKey)
                return undefined;
            const ref = (inst.steps || []).find((s) => s.stepKey === inst.currentStepKey);
            return ref?.dueAt;
        })(),
        percent,
        nextDueAt,
        plannedValue: { amount: plannedAmount || undefined, currency },
        completedValue: { amount: completedAmount || undefined, currency },
    };
    await c.save();
};
const completeStepInternal = async (req, c, inst, stepKey) => {
    const step = (inst.steps || []).find((s) => s.stepKey === stepKey);
    if (!step)
        throw new Error('Step not found.');
    if (step.feeInputRequired && typeof step.feeAmount !== 'number') {
        const err = new Error('Cannot complete step. Fee is required.');
        err.statusCode = 400;
        throw err;
    }
    // Enforce checklist completion if actions exist
    const actions = Array.isArray(step.actions) ? step.actions : [];
    const hasActions = actions.length > 0;
    const allActionsDone = !hasActions || actions.every((a) => a?.done === true);
    if (!allActionsDone) {
        const remaining = actions.filter((a) => !a?.done).map((a) => a?.text).filter(Boolean);
        const err = new Error('Cannot complete step. Pending key actions.');
        err.statusCode = 400;
        err.remainingActions = remaining;
        throw err;
    }
    step.status = 'Completed';
    step.completedAt = new Date();
    const sorted = (inst.steps || []).slice().sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((x) => x.stepKey === stepKey);
    const next = sorted[idx + 1];
    if (next) {
        inst.currentStepKey = next.stepKey;
        const nextRef = inst.steps.find((x) => x.stepKey === next.stepKey);
        if (nextRef && nextRef.status === 'Not Started')
            nextRef.status = 'In Progress';
    }
    else {
        inst.status = 'Completed';
    }
    await inst.save();
    await updateCaseWorkflowProgress(c, inst);
    // Update billing buckets based on payment mode
    const paymentMode = String(c.billingSettings?.paymentMode || 'postpaid');
    if (paymentMode === 'prepaid') {
        const remaining = Number(c.billingSettings?.prepaidRemaining) || 0;
        const nextRemaining = Math.max(0, remaining - (typeof step.feeAmount === 'number' ? step.feeAmount : 0));
        c.billingSettings = {
            ...c.billingSettings,
            prepaidRemaining: nextRemaining,
        };
        await c.save();
    }
    else {
        const accrued = Number(c.billingSettings?.accruedUnbilled) || 0;
        const nextAccrued = accrued + (typeof step.feeAmount === 'number' ? step.feeAmount : 0);
        c.billingSettings = {
            ...c.billingSettings,
            paymentMode: 'postpaid',
            accruedUnbilled: nextAccrued,
        };
        await c.save();
    }
    const actor = actorFromReq(req);
    await (0, auditService_1.writeAudit)({
        caseId: String(c._id),
        actorName: actor.actorName,
        ...(actor.actorUserId ? { actorUserId: actor.actorUserId } : {}),
        action: 'WORKFLOW_STEP_COMPLETED',
        message: 'Completed workflow step',
        detail: `${stepKey} • ${step.title}`,
    });
    return inst;
};
const canAssociateLikeAccessCase = async (req, foundCase) => {
    if (!isAssociateLike(req.user?.role))
        return false;
    const me = (req.user?.name || '').trim();
    if (!me)
        return false;
    const assignedTo = String(foundCase.assignedTo || '').trim();
    if (assignedTo && assignedTo === me)
        return true;
    const hasTask = await taskModel_1.default.exists({ caseId: foundCase._id, assignee: me });
    return Boolean(hasTask);
};
// ---------- Templates ----------
const listActiveTemplates = async (req, res) => {
    try {
        const templates = await workflowTemplateModel_1.default.find({ active: true })
            .sort({ matterType: 1, version: -1 })
            .lean();
        res.json(templates);
    }
    catch {
        res.status(500).json({ message: 'Failed to load workflow templates.' });
    }
};
exports.listActiveTemplates = listActiveTemplates;
const listAllTemplates = async (req, res) => {
    try {
        if (!isAdmin(req.user?.role))
            return res.status(403).json({ message: 'Forbidden.' });
        const templates = await workflowTemplateModel_1.default.find({}).sort({ updatedAt: -1 }).lean();
        res.json(templates);
    }
    catch {
        res.status(500).json({ message: 'Failed to load workflow templates.' });
    }
};
exports.listAllTemplates = listAllTemplates;
const getTemplateById = async (req, res) => {
    try {
        const { templateId } = req.params;
        const t = await workflowTemplateModel_1.default.findById(templateId);
        if (!t)
            return res.status(404).json({ message: 'Template not found.' });
        res.json(t);
    }
    catch {
        res.status(500).json({ message: 'Failed to load template.' });
    }
};
exports.getTemplateById = getTemplateById;
const createTemplate = async (req, res) => {
    try {
        if (!isAdmin(req.user?.role))
            return res.status(403).json({ message: 'Forbidden.' });
        const created = await workflowTemplateModel_1.default.create(req.body);
        // NOTE: We avoid writing audit here because your audit log requires a caseId.
        res.status(201).json(created);
    }
    catch (e) {
        res.status(500).json({ message: e?.message || 'Failed to create template.' });
    }
};
exports.createTemplate = createTemplate;
const updateTemplate = async (req, res) => {
    try {
        if (!isAdmin(req.user?.role))
            return res.status(403).json({ message: 'Forbidden.' });
        const { templateId } = req.params;
        const updated = await workflowTemplateModel_1.default.findByIdAndUpdate(templateId, req.body, { new: true });
        if (!updated)
            return res.status(404).json({ message: 'Template not found.' });
        res.json(updated);
    }
    catch {
        res.status(500).json({ message: 'Failed to update template.' });
    }
};
exports.updateTemplate = updateTemplate;
const deleteTemplate = async (req, res) => {
    try {
        if (!isAdmin(req.user?.role))
            return res.status(403).json({ message: 'Forbidden.' });
        const { templateId } = req.params;
        const deleted = await workflowTemplateModel_1.default.findByIdAndDelete(templateId);
        if (!deleted)
            return res.status(404).json({ message: 'Template not found.' });
        res.json({ message: 'Template deleted.' });
    }
    catch {
        res.status(500).json({ message: 'Failed to delete template.' });
    }
};
exports.deleteTemplate = deleteTemplate;
// ---------- Instances ----------
const getWorkflowForCase = async (req, res) => {
    try {
        const { caseId } = req.params;
        const c = await caseModel_1.default.findById(caseId);
        if (!c)
            return res.status(404).json({ message: 'Case not found.' });
        if (!isAdmin(req.user?.role)) {
            const allowed = await canAssociateLikeAccessCase(req, c);
            if (!allowed)
                return res.status(403).json({ message: 'Forbidden.' });
        }
        const inst = await workflowInstanceModel_1.default.findOne({ caseId: new mongoose_1.default.Types.ObjectId(caseId) });
        if (!inst)
            return res.status(404).json({ message: 'No workflow instance for this case.' });
        // Backfill step actions from template if missing (safe for older instances)
        try {
            const t = await workflowTemplateModel_1.default.findById(inst.templateId).lean();
            let changed = false;
            for (const step of inst.steps || []) {
                const hasActions = Array.isArray(step.actions) && step.actions.length > 0;
                if (hasActions)
                    continue;
                const templateStep = (t?.steps || []).find((x) => x.key === step.stepKey);
                const actions = (templateStep?.actions || []).map((text) => ({ text: String(text || '').trim(), done: false }));
                if (actions.length) {
                    step.actions = actions;
                    changed = true;
                }
            }
            if (changed)
                await inst.save();
        }
        catch {
            // ignore backfill failures
        }
        res.json(inst.toObject());
    }
    catch {
        res.status(500).json({ message: 'Failed to load workflow.' });
    }
};
exports.getWorkflowForCase = getWorkflowForCase;
// Admin endpoint (rarely needed if case creation already initializes)
const initWorkflowForCase = async (req, res) => {
    try {
        if (!isAdmin(req.user?.role))
            return res.status(403).json({ message: 'Forbidden.' });
        const { caseId } = req.params;
        const { templateId } = req.body || {};
        const c = await caseModel_1.default.findById(caseId);
        if (!c)
            return res.status(404).json({ message: 'Case not found.' });
        const exists = await workflowInstanceModel_1.default.findOne({ caseId: c._id });
        if (exists)
            return res.status(400).json({ message: 'Workflow already exists for this case.' });
        const tId = templateId || c.workflowTemplateId;
        if (!tId)
            return res.status(400).json({ message: 'Missing templateId.' });
        const template = await workflowTemplateModel_1.default.findById(tId).lean();
        if (!template)
            return res.status(404).json({ message: 'Template not found.' });
        const wfStart = c.workflowStartDate || c.createdAt || new Date();
        const steps = (0, workflowCompute_1.buildInstanceSteps)(template, wfStart);
        const inst = await workflowInstanceModel_1.default.create({
            caseId: c._id,
            templateId: template._id,
            status: 'Active',
            currentStepKey: steps[0]?.stepKey,
            steps,
        });
        c.workflowTemplateId = template._id;
        c.workflowInstanceId = inst._id;
        c.matterType = template.matterType;
        await updateCaseWorkflowProgress(c, inst);
        const actor = actorFromReq(req);
        await (0, auditService_1.writeAudit)({
            caseId: String(c._id),
            actorName: actor.actorName,
            ...(actor.actorUserId ? { actorUserId: actor.actorUserId } : {}),
            action: 'WORKFLOW_INSTANCE_CREATED',
            message: 'Workflow initialized from template',
            detail: `${template.name} v${template.version}`,
        });
        res.status(201).json(inst);
    }
    catch (e) {
        res.status(500).json({ message: e?.message || 'Failed to initialize workflow.' });
    }
};
exports.initWorkflowForCase = initWorkflowForCase;
// Attach a document to a specific output slot (any case-access user can do this)
const attachOutputDocument = async (req, res) => {
    try {
        const { caseId, stepKey, outputKey } = req.params;
        const { documentId } = req.body || {};
        if (!documentId)
            return res.status(400).json({ message: 'Missing documentId' });
        const c = await caseModel_1.default.findById(caseId);
        if (!c)
            return res.status(404).json({ message: 'Case not found.' });
        if (!isAdmin(req.user?.role)) {
            const allowed = await canAssociateLikeAccessCase(req, c);
            if (!allowed)
                return res.status(403).json({ message: 'Forbidden.' });
        }
        const inst = await workflowInstanceModel_1.default.findOne({ caseId: c._id });
        if (!inst)
            return res.status(404).json({ message: 'Workflow instance not found.' });
        const step = (inst.steps || []).find((s) => s.stepKey === stepKey);
        if (!step)
            return res.status(404).json({ message: 'Step not found.' });
        const out = (step.outputs || []).find((o) => o.key === outputKey);
        if (!out)
            return res.status(404).json({ message: 'Output not found.' });
        const doc = await documentModel_1.default.findById(documentId);
        if (!doc)
            return res.status(404).json({ message: 'Document not found.' });
        out.documentId = doc._id;
        out.uploadedAt = new Date();
        doc.workflowInstanceId = inst._id;
        doc.stepKey = stepKey;
        doc.outputKey = outputKey;
        await doc.save();
        await inst.save();
        const actor = actorFromReq(req);
        await (0, auditService_1.writeAudit)({
            caseId: String(c._id),
            actorName: actor.actorName,
            ...(actor.actorUserId ? { actorUserId: actor.actorUserId } : {}),
            action: 'WORKFLOW_OUTPUT_UPLOADED',
            message: 'Attached deliverable to workflow output',
            detail: `${stepKey} • ${outputKey} • ${doc.name || 'Document'}`,
        });
        res.json(inst);
    }
    catch {
        res.status(500).json({ message: 'Failed to attach output document.' });
    }
};
exports.attachOutputDocument = attachOutputDocument;
// Complete a step (admin only)
const completeStep = async (req, res) => {
    try {
        const { caseId, stepKey } = req.params;
        const c = await caseModel_1.default.findById(caseId);
        if (!c)
            return res.status(404).json({ message: 'Case not found.' });
        const inst = await workflowInstanceModel_1.default.findOne({ caseId: c._id });
        if (!inst)
            return res.status(404).json({ message: 'Workflow instance not found.' });
        const updated = await completeStepInternal(req, c, inst, stepKey);
        res.json(updated);
    }
    catch (e) {
        const status = typeof e?.statusCode === 'number' ? e.statusCode : 500;
        res.status(status).json({
            message: e?.message || 'Failed to complete step.',
            ...(Array.isArray(e?.remainingActions) ? { remainingActions: e.remainingActions } : {}),
        });
    }
};
exports.completeStep = completeStep;
// Reopen a completed step (admin only)
const reopenStep = async (req, res) => {
    try {
        if (!isAdmin(req.user?.role))
            return res.status(403).json({ message: 'Forbidden.' });
        const { caseId, stepKey } = req.params;
        const c = await caseModel_1.default.findById(caseId);
        if (!c)
            return res.status(404).json({ message: 'Case not found.' });
        const inst = await workflowInstanceModel_1.default.findOne({ caseId: c._id });
        if (!inst)
            return res.status(404).json({ message: 'Workflow instance not found.' });
        const step = (inst.steps || []).find((s) => s.stepKey === stepKey);
        if (!step)
            return res.status(404).json({ message: 'Step not found.' });
        if (step.status !== 'Completed')
            return res.status(400).json({ message: 'Step is not completed.' });
        // Reopen the step
        step.status = 'In Progress';
        step.completedAt = undefined;
        // Update current step to this one
        inst.currentStepKey = stepKey;
        // If workflow was completed, set it back to Active
        if (inst.status === 'Completed') {
            inst.status = 'Active';
        }
        await inst.save();
        const completedCount = inst.steps.filter((s) => s.status === 'Completed').length;
        const total = inst.steps.length || 1;
        const percent = Math.round((completedCount / total) * 100);
        const plannedAmount = (inst.steps || []).reduce((sum, s) => sum + (typeof s.feeAmount === 'number' ? s.feeAmount : 0), 0);
        const completedAmount = (inst.steps || []).reduce((sum, s) => sum + (s.status === 'Completed' && typeof s.feeAmount === 'number' ? s.feeAmount : 0), 0);
        const currency = (inst.steps || []).map((s) => s.feeCurrency).find(Boolean);
        const nextDueAt = (() => {
            const pending = (inst.steps || [])
                .filter((s) => s.status !== 'Completed')
                .slice()
                .sort((a, b) => (a.order || 0) - (b.order || 0))[0];
            return pending?.dueAt;
        })();
        c.workflowProgress = {
            status: 'In Progress',
            currentStepKey: inst.currentStepKey,
            currentStepTitle: step.title,
            currentStepStartAt: step.startAt,
            currentStepDueAt: step.dueAt,
            percent,
            nextDueAt,
            plannedValue: { amount: plannedAmount || undefined, currency },
            completedValue: { amount: completedAmount || undefined, currency },
        };
        await c.save();
        const actor = actorFromReq(req);
        await (0, auditService_1.writeAudit)({
            caseId: String(c._id),
            actorName: actor.actorName,
            ...(actor.actorUserId ? { actorUserId: actor.actorUserId } : {}),
            action: 'WORKFLOW_STEP_REOPENED',
            message: 'Reopened workflow step',
            detail: `${stepKey} • ${step.title}`,
        });
        res.json(inst);
    }
    catch {
        res.status(500).json({ message: 'Failed to reopen step.' });
    }
};
exports.reopenStep = reopenStep;
// Extend a workflow step deadline (admin only)
const extendStepDeadline = async (req, res) => {
    try {
        if (!isAdmin(req.user?.role))
            return res.status(403).json({ message: 'Forbidden.' });
        const { caseId, stepKey } = req.params;
        const { extendDays, reason } = req.body || {};
        const days = Number(extendDays);
        if (!Number.isFinite(days) || days <= 0 || days > 365) {
            return res.status(400).json({ message: 'extendDays must be a number between 1 and 365.' });
        }
        const c = await caseModel_1.default.findById(caseId);
        if (!c)
            return res.status(404).json({ message: 'Case not found.' });
        const inst = await workflowInstanceModel_1.default.findOne({ caseId: c._id });
        if (!inst)
            return res.status(404).json({ message: 'Workflow instance not found.' });
        const step = (inst.steps || []).find((s) => s.stepKey === stepKey);
        if (!step)
            return res.status(404).json({ message: 'Step not found.' });
        if (!step.dueAt)
            return res.status(400).json({ message: 'Step has no due date to extend.' });
        if (step.status === 'Completed')
            return res.status(400).json({ message: 'Cannot extend a completed step.' });
        const oldDue = new Date(step.dueAt);
        const newDue = new Date(oldDue.getTime() + days * 24 * 60 * 60 * 1000);
        step.dueAt = newDue;
        await inst.save();
        // Update case nextDueAt if this step is now the nearest pending
        const nextDueAt = (() => {
            const pending = (inst.steps || [])
                .filter((s) => s.status !== 'Completed')
                .slice()
                .sort((a, b) => new Date(a.dueAt || 0).getTime() - new Date(b.dueAt || 0).getTime())[0];
            return pending?.dueAt;
        })();
        c.workflowProgress = {
            ...(c.workflowProgress || {}),
            nextDueAt,
        };
        await c.save();
        const actor = actorFromReq(req);
        await (0, auditService_1.writeAudit)({
            caseId: String(c._id),
            actorName: actor.actorName,
            ...(actor.actorUserId ? { actorUserId: actor.actorUserId } : {}),
            action: 'WORKFLOW_STEP_DEADLINE_EXTENDED',
            message: 'Extended workflow step deadline',
            detail: `${stepKey} • +${days}d${reason ? ` • ${String(reason).trim()}` : ''}`,
        });
        res.json(inst);
    }
    catch (e) {
        res.status(500).json({ message: e?.message || 'Failed to extend deadline.' });
    }
};
exports.extendStepDeadline = extendStepDeadline;
// Toggle a key action checkbox (admin only)
const toggleStepAction = async (req, res) => {
    try {
        if (!isAdmin(req.user?.role))
            return res.status(403).json({ message: 'Forbidden.' });
        const { caseId, stepKey, index } = req.params;
        const actionIndex = Number(index);
        if (!Number.isInteger(actionIndex) || actionIndex < 0) {
            return res.status(400).json({ message: 'Invalid action index.' });
        }
        const c = await caseModel_1.default.findById(caseId);
        if (!c)
            return res.status(404).json({ message: 'Case not found.' });
        const inst = await workflowInstanceModel_1.default.findOne({ caseId: c._id });
        if (!inst)
            return res.status(404).json({ message: 'Workflow instance not found.' });
        const step = (inst.steps || []).find((s) => s.stepKey === stepKey);
        if (!step)
            return res.status(404).json({ message: 'Step not found.' });
        // Backfill actions from template if needed
        if (!Array.isArray(step.actions) || step.actions.length === 0) {
            const t = await workflowTemplateModel_1.default.findById(inst.templateId).lean();
            const templateStep = (t?.steps || []).find((x) => x.key === stepKey);
            step.actions = (templateStep?.actions || []).map((text) => ({ text: String(text || '').trim(), done: false }));
        }
        const actions = Array.isArray(step.actions) ? step.actions : [];
        const target = actions[actionIndex];
        if (!target)
            return res.status(404).json({ message: 'Action not found.' });
        const nextDone = !Boolean(target.done);
        target.done = nextDone;
        target.doneAt = nextDone ? new Date() : undefined;
        if (step.status === 'Not Started')
            step.status = 'In Progress';
        const actor = actorFromReq(req);
        await (0, auditService_1.writeAudit)({
            caseId: String(c._id),
            actorName: actor.actorName,
            ...(actor.actorUserId ? { actorUserId: actor.actorUserId } : {}),
            action: 'WORKFLOW_STEP_ACTION_TOGGLED',
            message: 'Updated workflow key action',
            detail: `${stepKey} • ${target.text} • ${nextDone ? 'done' : 'not done'}`,
        });
        // If all key actions are done, auto-complete the step (and update case progress/billing)
        const allDone = actions.length === 0 || actions.every((a) => a?.done === true);
        if (allDone && step.status !== 'Completed') {
            const updated = await completeStepInternal(req, c, inst, stepKey);
            return res.json(updated);
        }
        await inst.save();
        res.json(inst);
    }
    catch (e) {
        const status = typeof e?.statusCode === 'number' ? e.statusCode : 500;
        res.status(status).json({
            message: e?.message || 'Failed to update key action.',
            ...(Array.isArray(e?.remainingActions) ? { remainingActions: e.remainingActions } : {}),
        });
    }
};
exports.toggleStepAction = toggleStepAction;
// Set a specific fee for a step (admin only; used for fee ranges)
const setStepFeeAmount = async (req, res) => {
    try {
        if (!isAdmin(req.user?.role))
            return res.status(403).json({ message: 'Forbidden.' });
        const { caseId, stepKey } = req.params;
        const { amount, currency } = req.body || {};
        const feeAmount = Number(amount);
        if (!Number.isFinite(feeAmount) || feeAmount < 0) {
            return res.status(400).json({ message: 'amount must be a non-negative number.' });
        }
        const c = await caseModel_1.default.findById(caseId);
        if (!c)
            return res.status(404).json({ message: 'Case not found.' });
        const inst = await workflowInstanceModel_1.default.findOne({ caseId: c._id });
        if (!inst)
            return res.status(404).json({ message: 'Workflow instance not found.' });
        const step = (inst.steps || []).find((s) => s.stepKey === stepKey);
        if (!step)
            return res.status(404).json({ message: 'Step not found.' });
        if (step.status === 'Completed')
            return res.status(400).json({ message: 'Cannot change fee for a completed step.' });
        step.feeAmount = feeAmount;
        step.feeSetByUser = true;
        if (typeof currency === 'string' && currency.trim())
            step.feeCurrency = currency.trim().toUpperCase();
        await inst.save();
        await updateCaseWorkflowProgress(c, inst);
        const actor = actorFromReq(req);
        await (0, auditService_1.writeAudit)({
            caseId: String(c._id),
            actorName: actor.actorName,
            ...(actor.actorUserId ? { actorUserId: actor.actorUserId } : {}),
            action: 'WORKFLOW_STEP_FEE_SET',
            message: 'Set workflow step fee',
            detail: `${stepKey} • ${step.feeCurrency || ''} ${feeAmount}`,
        });
        res.json(inst);
    }
    catch (e) {
        res.status(500).json({ message: e?.message || 'Failed to set step fee.' });
    }
};
exports.setStepFeeAmount = setStepFeeAmount;
//# sourceMappingURL=workflowController.js.map