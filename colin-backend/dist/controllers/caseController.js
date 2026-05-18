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
const workflowCompute_1 = require("../utils/workflowCompute");
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
const parseMoney = (value) => {
    if (typeof value === 'number')
        return Number.isFinite(value) && value > 0 ? value : 0;
    const n = Number(String(value || '').replace(/[^\d.]/g, ''));
    return Number.isFinite(n) && n > 0 ? n : 0;
};
const calculateActionProgress = (steps, plannedAmount) => {
    const actions = (steps || []).flatMap((step) => (Array.isArray(step.actions) ? step.actions : []));
    const checked = actions.filter((action) => Boolean(action?.done)).length;
    const total = actions.length;
    const percent = total > 0 ? Math.round((checked / total) * 100) : 0;
    return { percent, completedAmount: Math.round((plannedAmount * percent) / 100) };
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
        // Normalize billing settings if provided
        const bs = req.body?.billingSettings;
        if (bs && typeof bs === 'object') {
            const paymentMode = String(bs.paymentMode || 'postpaid') === 'prepaid' ? 'prepaid' : 'postpaid';
            const currency = String(bs.currency || 'RWF').trim().toUpperCase() || 'RWF';
            const prepaidTotal = Number(bs.prepaidTotal);
            const normalizedPrepaidTotal = Number.isFinite(prepaidTotal) && prepaidTotal > 0 ? prepaidTotal : 0;
            newCase.billingSettings = {
                paymentMode,
                currency,
                prepaidTotal: normalizedPrepaidTotal,
                prepaidRemaining: paymentMode === 'prepaid'
                    ? Number.isFinite(Number(bs.prepaidRemaining))
                        ? Math.max(0, Number(bs.prepaidRemaining))
                        : normalizedPrepaidTotal
                    : 0,
                accruedUnbilled: Math.max(0, Number(bs.accruedUnbilled) || 0),
            };
        }
        await newCase.save();
        // ✅ Initialize workflow instance if workflowTemplateId provided
        const workflowTemplateId = req.body?.workflowTemplateId;
        if (workflowTemplateId) {
            const template = await workflowTemplateModel_1.default.findById(workflowTemplateId).lean();
            if (template) {
                const wfStart = newCase.workflowStartDate || newCase.createdAt || new Date();
                const steps = (0, workflowCompute_1.buildInstanceSteps)(template, wfStart);
                const initialWorkflowActions = req.body?.initialWorkflowActions || {};
                for (const step of steps) {
                    const indexes = Array.isArray(initialWorkflowActions?.[step.stepKey])
                        ? initialWorkflowActions[step.stepKey]
                        : [];
                    for (const idx of indexes) {
                        const action = Array.isArray(step.actions) ? step.actions[Number(idx)] : undefined;
                        if (action) {
                            action.done = true;
                            action.doneAt = new Date();
                        }
                    }
                }
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
                const templatePlannedAmount = steps.reduce((sum, s) => sum + (typeof s.feeAmount === 'number' ? s.feeAmount : 0), 0);
                const requestedPlannedAmount = parseMoney(req.body?.workflowProgress?.plannedValue?.amount) || parseMoney(req.body?.budget);
                const plannedAmount = requestedPlannedAmount || templatePlannedAmount;
                const plannedCurrency = req.body?.workflowProgress?.plannedValue?.currency ||
                    steps.map((s) => s.feeCurrency).find(Boolean) ||
                    newCase.billingSettings?.currency ||
                    'RWF';
                const actionProgress = calculateActionProgress(steps, plannedAmount);
                newCase.workflowProgress = {
                    status: 'In Progress',
                    percent: actionProgress.percent,
                    ...(inst.currentStepKey ? { currentStepKey: inst.currentStepKey } : {}),
                    ...(steps[0]?.title ? { currentStepTitle: steps[0].title } : {}),
                    ...(steps[0]?.startAt ? { currentStepStartAt: steps[0].startAt } : {}),
                    ...(steps[0]?.dueAt ? { currentStepDueAt: steps[0].dueAt } : {}),
                    nextDueAt: steps[0]?.dueAt,
                    plannedValue: { amount: plannedAmount || undefined, currency: plannedCurrency },
                    completedValue: { amount: actionProgress.completedAmount, currency: plannedCurrency },
                };
                newCase.billingSettings = {
                    ...(newCase.billingSettings || {}),
                    currency: plannedCurrency,
                    prepaidTotal: 0,
                    prepaidRemaining: 0,
                    accruedUnbilled: actionProgress.completedAmount,
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
        // If workflow template was changed, re-initialize the workflow instance and progress
        const beforeTemplateId = before?.workflowTemplateId ? String(before.workflowTemplateId) : '';
        const nextTemplateId = req.body?.workflowTemplateId ? String(req.body.workflowTemplateId) : '';
        const didChangeTemplate = Boolean(nextTemplateId && nextTemplateId !== beforeTemplateId);
        const beforeStart = before?.workflowStartDate ? new Date(before.workflowStartDate).toISOString().slice(0, 10) : '';
        const nextStart = req.body?.workflowStartDate
            ? new Date(req.body.workflowStartDate).toISOString().slice(0, 10)
            : '';
        const didChangeStartDate = Boolean(nextStart && nextStart !== beforeStart);
        if (didChangeTemplate || didChangeStartDate) {
            const templateIdToUse = nextTemplateId || beforeTemplateId;
            if (templateIdToUse) {
                const template = await workflowTemplateModel_1.default.findById(templateIdToUse).lean();
                if (template) {
                    const wfStartRaw = req.body?.workflowStartDate || updated.workflowStartDate || updated.createdAt || new Date();
                    const wfStart = wfStartRaw instanceof Date ? wfStartRaw : new Date(wfStartRaw);
                    const steps = (0, workflowCompute_1.buildInstanceSteps)(template, wfStart);
                    let inst = await workflowInstanceModel_1.default.findOne({ caseId: updated._id });
                    if (!inst) {
                        inst = await workflowInstanceModel_1.default.create({
                            caseId: updated._id,
                            templateId: template._id,
                            status: 'Active',
                            currentStepKey: steps[0]?.stepKey,
                            steps,
                        });
                    }
                    else {
                        inst.templateId = template._id;
                        inst.status = 'Active';
                        inst.currentStepKey = steps[0]?.stepKey;
                        inst.steps = steps;
                        await inst.save();
                    }
                    updated.workflowTemplateId = template._id;
                    updated.workflowInstanceId = inst._id;
                    updated.matterType = template.matterType;
                    updated.workflowStartDate = wfStart;
                    const templatePlannedAmount = steps.reduce((sum, s) => sum + (typeof s.feeAmount === 'number' ? s.feeAmount : 0), 0);
                    const requestedPlannedAmount = parseMoney(req.body?.workflowProgress?.plannedValue?.amount) ||
                        parseMoney(req.body?.budget) ||
                        parseMoney(updated.workflowProgress?.plannedValue?.amount);
                    const plannedAmount = requestedPlannedAmount || templatePlannedAmount;
                    const plannedCurrency = req.body?.workflowProgress?.plannedValue?.currency ||
                        steps.map((s) => s.feeCurrency).find(Boolean) ||
                        updated.billingSettings?.currency ||
                        'RWF';
                    const actionProgress = calculateActionProgress(steps, plannedAmount);
                    updated.workflowProgress = {
                        status: 'In Progress',
                        percent: actionProgress.percent,
                        ...(inst.currentStepKey ? { currentStepKey: inst.currentStepKey } : {}),
                        ...(steps[0]?.title ? { currentStepTitle: steps[0].title } : {}),
                        ...(steps[0]?.startAt ? { currentStepStartAt: steps[0].startAt } : {}),
                        ...(steps[0]?.dueAt ? { currentStepDueAt: steps[0].dueAt } : {}),
                        nextDueAt: steps[0]?.dueAt,
                        plannedValue: { amount: plannedAmount || undefined, currency: plannedCurrency },
                        completedValue: { amount: actionProgress.completedAmount, currency: plannedCurrency },
                    };
                    updated.billingSettings = {
                        ...(updated.billingSettings || {}),
                        currency: plannedCurrency,
                        prepaidTotal: 0,
                        prepaidRemaining: 0,
                        accruedUnbilled: actionProgress.completedAmount,
                    };
                    await updated.save();
                }
            }
        }
        if (!didChangeTemplate && !didChangeStartDate && req.body?.workflowProgress?.plannedValue) {
            const plannedAmount = parseMoney(req.body.workflowProgress.plannedValue.amount);
            if (plannedAmount > 0) {
                const plannedCurrency = req.body.workflowProgress.plannedValue.currency || updated.billingSettings?.currency || 'RWF';
                const inst = await workflowInstanceModel_1.default.findOne({ caseId: updated._id }).lean();
                const actionProgress = calculateActionProgress(inst?.steps || [], plannedAmount);
                updated.workflowProgress = {
                    ...(updated.workflowProgress || {}),
                    plannedValue: { amount: plannedAmount, currency: plannedCurrency },
                    percent: actionProgress.percent,
                    completedValue: { amount: actionProgress.completedAmount, currency: plannedCurrency },
                };
                updated.billingSettings = {
                    ...(updated.billingSettings || {}),
                    currency: plannedCurrency,
                    prepaidTotal: 0,
                    prepaidRemaining: 0,
                    accruedUnbilled: actionProgress.completedAmount,
                };
                await updated.save();
            }
        }
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
            if (req.body?.workflowTemplateId && String(req.body.workflowTemplateId) !== beforeTemplateId)
                changes.push(`Workflow template updated`);
            if (req.body?.workflowStartDate)
                changes.push(`Workflow start date updated`);
            if (req.body?.billingSettings)
                changes.push(`Billing settings updated`);
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