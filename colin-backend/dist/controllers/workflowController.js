"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeStep = exports.attachOutputDocument = exports.initWorkflowForCase = exports.getWorkflowForCase = exports.deleteTemplate = exports.updateTemplate = exports.createTemplate = exports.getTemplateById = exports.listAllTemplates = exports.listActiveTemplates = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const workflowTemplateModel_1 = __importDefault(require("../models/workflowTemplateModel"));
const workflowInstanceModel_1 = __importDefault(require("../models/workflowInstanceModel"));
const caseModel_1 = __importDefault(require("../models/caseModel"));
const documentModel_1 = __importDefault(require("../models/documentModel"));
const taskModel_1 = __importDefault(require("../models/taskModel"));
const auditService_1 = require("../services/auditService");
const isAdmin = (role) => role === 'managing_director' || role === 'executive_assistant';
const isAssociateLike = (role) => role === 'associate' || role === 'junior_associate' || role === 'lawyer' || role === 'intern';
const actorFromReq = (req) => ({
    actorName: req.user?.name || 'System',
    actorUserId: req.user?.id,
});
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
        const inst = await workflowInstanceModel_1.default.findOne({ caseId: new mongoose_1.default.Types.ObjectId(caseId) }).lean();
        if (!inst)
            return res.status(404).json({ message: 'No workflow instance for this case.' });
        res.json(inst);
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
        const steps = (template.steps || [])
            .slice()
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((s, idx) => ({
            stepKey: s.key,
            title: s.title,
            stageKey: s.stageKey,
            order: s.order,
            status: idx === 0 ? 'In Progress' : 'Not Started',
            outputs: (s.outputs || []).map((o) => ({
                key: o.key,
                name: o.name,
                required: Boolean(o.required),
                category: o.category,
            })),
        }));
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
        c.workflowProgress = { status: 'In Progress', currentStepKey: inst.currentStepKey, percent: 0 };
        await c.save();
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
        const missing = (step.outputs || []).filter((o) => o.required && !o.documentId);
        if (missing.length) {
            return res.status(400).json({
                message: 'Cannot complete step. Missing required outputs.',
                missingOutputs: missing.map((m) => ({ key: m.key, name: m.name })),
            });
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
        const completedCount = inst.steps.filter((s) => s.status === 'Completed').length;
        const total = inst.steps.length || 1;
        const percent = Math.round((completedCount / total) * 100);
        c.workflowProgress = {
            status: inst.status === 'Completed' ? 'Completed' : 'In Progress',
            currentStepKey: inst.currentStepKey,
            percent,
        };
        await c.save();
        const actor = actorFromReq(req);
        await (0, auditService_1.writeAudit)({
            caseId: String(c._id),
            actorName: actor.actorName,
            ...(actor.actorUserId ? { actorUserId: actor.actorUserId } : {}),
            action: 'WORKFLOW_STEP_COMPLETED',
            message: 'Completed workflow step',
            detail: `${stepKey} • ${step.title}`,
        });
        res.json(inst);
    }
    catch {
        res.status(500).json({ message: 'Failed to complete step.' });
    }
};
exports.completeStep = completeStep;
//# sourceMappingURL=workflowController.js.map