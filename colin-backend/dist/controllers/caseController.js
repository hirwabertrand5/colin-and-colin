"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCase = exports.updateCase = exports.getCaseById = exports.createCase = exports.getAllCases = void 0;
const caseModel_1 = __importDefault(require("../models/caseModel"));
const taskModel_1 = __importDefault(require("../models/taskModel"));
const auditService_1 = require("../services/auditService");
const workflowTemplateModel_1 = __importDefault(require("../models/workflowTemplateModel"));
const workflowInstanceModel_1 = __importDefault(require("../models/workflowInstanceModel"));
const actorFromReq = (req) => ({
    actorName: req.user?.name || 'System',
    actorUserId: req.user?.id,
});
const isAdminCaseRole = (role) => role === 'managing_director' || role === 'executive_assistant';
const isAssociateLikeRole = (role) => role === 'associate' || role === 'junior_associate' || role === 'lawyer' || role === 'intern';
const canAssociateLikeAccessCase = async (req, foundCase) => {
    if (!isAssociateLikeRole(req.user?.role))
        return false;
    const me = (req.user?.name || '').trim();
    if (!me)
        return false;
    const assignedTo = String(foundCase.assignedTo || '').trim();
    if (assignedTo && assignedTo === me)
        return true;
    const hasTask = await taskModel_1.default.exists({
        caseId: foundCase._id,
        assignee: me,
    });
    return Boolean(hasTask);
};
const getAllCases = async (req, res) => {
    try {
        const role = req.user?.role;
        if (isAdminCaseRole(role)) {
            const cases = await caseModel_1.default.find().sort({ updatedAt: -1 });
            return res.json(cases);
        }
        if (isAssociateLikeRole(role)) {
            const me = (req.user?.name || '').trim();
            if (!me)
                return res.json([]);
            const assignedCases = await caseModel_1.default.find({ assignedTo: me }).sort({ updatedAt: -1 });
            const taskCaseIds = await taskModel_1.default.distinct('caseId', { assignee: me });
            const taskCases = await caseModel_1.default.find({ _id: { $in: taskCaseIds } }).sort({ updatedAt: -1 });
            const map = new Map();
            [...assignedCases, ...taskCases].forEach((c) => map.set(String(c._id), c));
            return res.json(Array.from(map.values()));
        }
        return res.status(403).json({ message: 'Forbidden.' });
    }
    catch {
        return res.status(500).json({ message: 'Failed to fetch cases.' });
    }
};
exports.getAllCases = getAllCases;
const createCase = async (req, res) => {
    try {
        if (!isAdminCaseRole(req.user?.role)) {
            return res.status(403).json({ message: 'Forbidden.' });
        }
        const newCase = new caseModel_1.default(req.body);
        await newCase.save();
        // ✅ Initialize workflow instance if workflowTemplateId provided
        const workflowTemplateId = req.body?.workflowTemplateId;
        if (workflowTemplateId) {
            const template = await workflowTemplateModel_1.default.findById(workflowTemplateId).lean();
            if (template) {
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
                    caseId: newCase._id,
                    templateId: template._id,
                    status: 'Active',
                    currentStepKey: steps[0]?.stepKey,
                    steps,
                });
                newCase.workflowTemplateId = template._id;
                newCase.workflowInstanceId = inst._id;
                newCase.matterType = template.matterType;
                newCase.workflowProgress = {
                    status: 'In Progress',
                    percent: 0,
                    ...(inst.currentStepKey ? { currentStepKey: inst.currentStepKey } : {}),
                };
                await newCase.save();
                const actor = actorFromReq(req);
                await (0, auditService_1.writeAudit)({
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
        await (0, auditService_1.writeAudit)({
            caseId: String(newCase._id),
            actorName: actor.actorName,
            ...(actor.actorUserId ? { actorUserId: actor.actorUserId } : {}),
            action: 'CASE_CREATED',
            message: 'Created case',
            detail: `${newCase.caseNo || ''} • ${newCase.parties || ''}`.trim(),
        });
        return res.status(201).json(newCase);
    }
    catch {
        return res.status(500).json({ message: 'Failed to create case.' });
    }
};
exports.createCase = createCase;
const getCaseById = async (req, res) => {
    try {
        const foundCase = await caseModel_1.default.findById(req.params.id);
        if (!foundCase)
            return res.status(404).json({ message: 'Case not found.' });
        if (isAdminCaseRole(req.user?.role)) {
            return res.json(foundCase);
        }
        if (isAssociateLikeRole(req.user?.role)) {
            const allowed = await canAssociateLikeAccessCase(req, foundCase);
            if (allowed)
                return res.json(foundCase);
        }
        return res.status(403).json({ message: 'Forbidden.' });
    }
    catch {
        return res.status(500).json({ message: 'Failed to fetch case.' });
    }
};
exports.getCaseById = getCaseById;
const updateCase = async (req, res) => {
    try {
        if (!isAdminCaseRole(req.user?.role)) {
            return res.status(403).json({ message: 'Forbidden.' });
        }
        const before = await caseModel_1.default.findById(req.params.id);
        const updated = await caseModel_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated)
            return res.status(404).json({ message: 'Case not found.' });
        const changes = [];
        if (before) {
            if (req.body.status && req.body.status !== before.status)
                changes.push(`Status: ${before.status} → ${req.body.status}`);
            if (req.body.priority && req.body.priority !== before.priority)
                changes.push(`Priority: ${before.priority} → ${req.body.priority}`);
            if (req.body.assignedTo && req.body.assignedTo !== before.assignedTo)
                changes.push(`Assigned: ${before.assignedTo || '-'} → ${req.body.assignedTo}`);
            if (req.body.budget && String(req.body.budget) !== String(before.budget))
                changes.push(`Budget: ${before.budget || '-'} → ${req.body.budget}`);
            if (req.body.caseNo && req.body.caseNo !== before.caseNo)
                changes.push(`Case No changed`);
            if (req.body.parties && req.body.parties !== before.parties)
                changes.push(`Parties changed`);
            if (req.body.caseType && req.body.caseType !== before.caseType)
                changes.push(`Case type changed`);
            if (req.body.matterType && req.body.matterType !== before.matterType)
                changes.push(`Matter type changed`);
            if (req.body.legalServicePath)
                changes.push(`Legal service classification updated`);
        }
        const actor = actorFromReq(req);
        await (0, auditService_1.writeAudit)({
            caseId: String(updated._id),
            actorName: actor.actorName,
            ...(actor.actorUserId ? { actorUserId: actor.actorUserId } : {}),
            action: 'CASE_UPDATED',
            message: 'Updated case',
            detail: changes.length ? changes.join(' • ') : `${updated.caseNo || ''}`.trim(),
        });
        return res.json(updated);
    }
    catch {
        return res.status(500).json({ message: 'Failed to update case.' });
    }
};
exports.updateCase = updateCase;
const deleteCase = async (req, res) => {
    try {
        if (req.user?.role !== 'managing_director') {
            return res.status(403).json({ message: 'Forbidden.' });
        }
        const deleted = await caseModel_1.default.findByIdAndDelete(req.params.id);
        if (!deleted)
            return res.status(404).json({ message: 'Case not found.' });
        return res.json({ message: 'Case deleted.' });
    }
    catch {
        return res.status(500).json({ message: 'Failed to delete case.' });
    }
};
exports.deleteCase = deleteCase;
//# sourceMappingURL=caseController.js.map