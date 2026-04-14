"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const actorFromReq = (req) => {
    var _a, _b;
    return ({
        actorName: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.name) || 'System',
        actorUserId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
    });
};
const isAdminCaseRole = (role) => role === 'managing_director' || role === 'executive_assistant';
const isAssociateLikeRole = (role) => role === 'associate' || role === 'lawyer' || role === 'intern';
const canAssociateLikeAccessCase = (req, foundCase) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (!isAssociateLikeRole((_a = req.user) === null || _a === void 0 ? void 0 : _a.role))
        return false;
    const me = (((_b = req.user) === null || _b === void 0 ? void 0 : _b.name) || '').trim();
    if (!me)
        return false;
    const assignedTo = String(foundCase.assignedTo || '').trim();
    if (assignedTo && assignedTo === me)
        return true;
    const hasTask = yield taskModel_1.default.exists({
        caseId: foundCase._id,
        assignee: me,
    });
    return Boolean(hasTask);
});
const getAllCases = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const role = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        if (isAdminCaseRole(role)) {
            const cases = yield caseModel_1.default.find().sort({ updatedAt: -1 });
            return res.json(cases);
        }
        if (isAssociateLikeRole(role)) {
            const me = (((_b = req.user) === null || _b === void 0 ? void 0 : _b.name) || '').trim();
            if (!me)
                return res.json([]);
            const assignedCases = yield caseModel_1.default.find({ assignedTo: me }).sort({ updatedAt: -1 });
            const taskCaseIds = yield taskModel_1.default.distinct('caseId', { assignee: me });
            const taskCases = yield caseModel_1.default.find({ _id: { $in: taskCaseIds } }).sort({ updatedAt: -1 });
            const map = new Map();
            [...assignedCases, ...taskCases].forEach((c) => map.set(String(c._id), c));
            return res.json(Array.from(map.values()));
        }
        return res.status(403).json({ message: 'Forbidden.' });
    }
    catch (_c) {
        return res.status(500).json({ message: 'Failed to fetch cases.' });
    }
});
exports.getAllCases = getAllCases;
const createCase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        if (!isAdminCaseRole((_a = req.user) === null || _a === void 0 ? void 0 : _a.role)) {
            return res.status(403).json({ message: 'Forbidden.' });
        }
        const newCase = new caseModel_1.default(req.body);
        yield newCase.save();
        // ✅ Initialize workflow instance if workflowTemplateId provided
        const workflowTemplateId = (_b = req.body) === null || _b === void 0 ? void 0 : _b.workflowTemplateId;
        if (workflowTemplateId) {
            const template = yield workflowTemplateModel_1.default.findById(workflowTemplateId).lean();
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
                const inst = yield workflowInstanceModel_1.default.create({
                    caseId: newCase._id,
                    templateId: template._id,
                    status: 'Active',
                    currentStepKey: (_c = steps[0]) === null || _c === void 0 ? void 0 : _c.stepKey,
                    steps,
                });
                newCase.workflowTemplateId = template._id;
                newCase.workflowInstanceId = inst._id;
                newCase.matterType = template.matterType;
                newCase.workflowProgress = {
                    status: 'In Progress',
                    currentStepKey: inst.currentStepKey,
                    percent: 0,
                };
                yield newCase.save();
                const actor = actorFromReq(req);
                yield (0, auditService_1.writeAudit)(Object.assign(Object.assign({ caseId: String(newCase._id), actorName: actor.actorName }, (actor.actorUserId ? { actorUserId: actor.actorUserId } : {})), { action: 'WORKFLOW_INSTANCE_CREATED', message: 'Workflow initialized from template', detail: `${template.name} v${template.version}` }));
            }
        }
        const actor = actorFromReq(req);
        yield (0, auditService_1.writeAudit)(Object.assign(Object.assign({ caseId: String(newCase._id), actorName: actor.actorName }, (actor.actorUserId ? { actorUserId: actor.actorUserId } : {})), { action: 'CASE_CREATED', message: 'Created case', detail: `${newCase.caseNo || ''} • ${newCase.parties || ''}`.trim() }));
        return res.status(201).json(newCase);
    }
    catch (_d) {
        return res.status(500).json({ message: 'Failed to create case.' });
    }
});
exports.createCase = createCase;
const getCaseById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const foundCase = yield caseModel_1.default.findById(req.params.id);
        if (!foundCase)
            return res.status(404).json({ message: 'Case not found.' });
        if (isAdminCaseRole((_a = req.user) === null || _a === void 0 ? void 0 : _a.role)) {
            return res.json(foundCase);
        }
        if (isAssociateLikeRole((_b = req.user) === null || _b === void 0 ? void 0 : _b.role)) {
            const allowed = yield canAssociateLikeAccessCase(req, foundCase);
            if (allowed)
                return res.json(foundCase);
        }
        return res.status(403).json({ message: 'Forbidden.' });
    }
    catch (_c) {
        return res.status(500).json({ message: 'Failed to fetch case.' });
    }
});
exports.getCaseById = getCaseById;
const updateCase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!isAdminCaseRole((_a = req.user) === null || _a === void 0 ? void 0 : _a.role)) {
            return res.status(403).json({ message: 'Forbidden.' });
        }
        const before = yield caseModel_1.default.findById(req.params.id);
        const updated = yield caseModel_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
        }
        const actor = actorFromReq(req);
        yield (0, auditService_1.writeAudit)(Object.assign(Object.assign({ caseId: String(updated._id), actorName: actor.actorName }, (actor.actorUserId ? { actorUserId: actor.actorUserId } : {})), { action: 'CASE_UPDATED', message: 'Updated case', detail: changes.length ? changes.join(' • ') : `${updated.caseNo || ''}`.trim() }));
        return res.json(updated);
    }
    catch (_b) {
        return res.status(500).json({ message: 'Failed to update case.' });
    }
});
exports.updateCase = updateCase;
const deleteCase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'managing_director') {
            return res.status(403).json({ message: 'Forbidden.' });
        }
        const deleted = yield caseModel_1.default.findByIdAndDelete(req.params.id);
        if (!deleted)
            return res.status(404).json({ message: 'Case not found.' });
        return res.json({ message: 'Case deleted.' });
    }
    catch (_b) {
        return res.status(500).json({ message: 'Failed to delete case.' });
    }
});
exports.deleteCase = deleteCase;
//# sourceMappingURL=caseController.js.map