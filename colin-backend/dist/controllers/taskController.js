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
exports.addTimeLogToTask = exports.getTimeLogsForTask = exports.deleteChecklistItem = exports.toggleChecklistItem = exports.addChecklistItem = exports.rejectTask = exports.approveTask = exports.submitTaskForApproval = exports.deleteTask = exports.updateTask = exports.getTaskById = exports.getAllTasks = exports.addTaskToCase = exports.getTasksForCase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const taskModel_1 = __importDefault(require("../models/taskModel"));
const caseModel_1 = __importDefault(require("../models/caseModel"));
const auditService_1 = require("../services/auditService");
const taskTimeLogModel_1 = __importDefault(require("../models/taskTimeLogModel"));
const notifyService_1 = require("../services/notifyService");
const isAssociateLikeRole = (role) => role === 'associate' || role === 'lawyer' || role === 'intern';
const actorFromReq = (req) => {
    var _a, _b;
    return ({
        actorName: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.name) || 'System',
        actorUserId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
    });
};
const withActor = (req) => {
    const actor = actorFromReq(req);
    return Object.assign({ actorName: actor.actorName }, (actor.actorUserId ? { actorUserId: actor.actorUserId } : {}));
};
const isAdminCaseRole = (role) => role === 'managing_director' || role === 'executive_assistant';
// Approved tasks become read-only for everyone
const isApprovedLocked = (task) => (task === null || task === void 0 ? void 0 : task.requiresApproval) && String(task.approvalStatus) === 'Approved';
/**
 * Professional case access:
 * - MD/Exec: access any case
 * - Associate: access case if:
 *    a) Case.assignedTo === req.user.name
 *    OR
 *    b) Associate has at least one task in this case
 */
const canAccessCaseId = (req, caseId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const role = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
    if (isAdminCaseRole(role))
        return true;
    if (isAssociateLikeRole(role)) {
        const me = (((_b = req.user) === null || _b === void 0 ? void 0 : _b.name) || '').trim();
        if (!me)
            return false;
        const c = yield caseModel_1.default.findById(caseId).select('assignedTo');
        if (!c)
            return false;
        // rule 1: case assigned to associate
        if (String(c.assignedTo || '').trim() === me)
            return true;
        // rule 2: associate has at least one task in this case
        const hasTask = yield taskModel_1.default.exists({ caseId, assignee: me });
        return Boolean(hasTask);
    }
    return false;
});
// --------------------
// Case Tasks
// --------------------
// Get all tasks for a case
const getTasksForCase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let caseId = req.params.caseId;
        if (Array.isArray(caseId))
            caseId = caseId[0];
        if (!caseId)
            return res.status(400).json({ message: 'Missing caseId' });
        // ✅ Guard
        if (!(yield canAccessCaseId(req, String(caseId)))) {
            return res.status(403).json({ message: 'Forbidden.' });
        }
        const tasks = yield taskModel_1.default.find({
            caseId: new mongoose_1.default.Types.ObjectId(caseId),
        }).sort({ dueDate: 1 });
        res.json(tasks);
    }
    catch (_a) {
        res.status(500).json({ message: 'Failed to fetch tasks.' });
    }
});
exports.getTasksForCase = getTasksForCase;
// Add a task to a case
const addTaskToCase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let caseId = req.params.caseId;
        if (Array.isArray(caseId))
            caseId = caseId[0];
        if (!caseId)
            return res.status(400).json({ message: 'Missing caseId' });
        // ✅ Guard (even though associates are blocked by route)
        if (!(yield canAccessCaseId(req, String(caseId)))) {
            return res.status(403).json({ message: 'Forbidden.' });
        }
        const requiresApproval = Boolean(req.body.requiresApproval);
        const approvalStatus = requiresApproval ? 'Draft' : 'Not Required';
        const newTask = new taskModel_1.default(Object.assign(Object.assign({}, req.body), { caseId: new mongoose_1.default.Types.ObjectId(caseId), requiresApproval,
            approvalStatus, assignedBy: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.name) || 'System', submittedAt: undefined, approvedAt: undefined, rejectedAt: undefined, completedAt: undefined }));
        yield newTask.save();
        yield (0, auditService_1.writeAudit)(Object.assign(Object.assign({ caseId }, withActor(req)), { action: 'TASK_CREATED', message: 'Created task', detail: `${newTask.title || 'Untitled'} • Assignee: ${newTask.assignee || '-'} • Due: ${newTask.dueDate || '-'}` }));
        // ✅ Notify assignee (customized per-user)
        const assigneeValue = String(newTask.assignee || '').trim();
        if (assigneeValue) {
            const assigneeUser = yield (0, notifyService_1.findUserByAssigneeString)(assigneeValue);
            if ((assigneeUser === null || assigneeUser === void 0 ? void 0 : assigneeUser._id) && assigneeUser.isActive !== false) {
                yield (0, notifyService_1.notifyUsersById)({
                    userIds: [String(assigneeUser._id)],
                    category: 'taskAssignments',
                    notification: {
                        type: 'TASK_ASSIGNED',
                        title: 'New task assigned',
                        message: `${newTask.title || 'Task'} (Due: ${newTask.dueDate || '-'})`,
                        severity: 'info',
                        caseId: String(caseId),
                        taskId: String(newTask._id),
                        link: `/tasks/${newTask._id}`,
                    },
                    email: {
                        subject: `Task assigned: ${newTask.title || 'Task'}`,
                        html: `<div style="font-family: Arial, sans-serif">
                    <p>A new task has been assigned to you.</p>
                    <p><b>${newTask.title || 'Task'}</b></p>
                    <p>Due: ${newTask.dueDate || '-'}</p>
                  </div>`,
                    },
                });
            }
            else {
                // Helpful server-side hint for misconfigured assignee strings
                console.warn('Task created but no matching active user found for assignee:', assigneeValue);
            }
        }
        res.status(201).json(newTask);
    }
    catch (e) {
        res.status(500).json({ message: (e === null || e === void 0 ? void 0 : e.message) || 'Failed to create task.' });
    }
});
exports.addTaskToCase = addTaskToCase;
// --------------------
// Global Tasks
// --------------------
const getAllTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { q, status, priority, approvalStatus } = req.query;
        const filter = {};
        // Visibility: non-MD sees only own tasks (MVP using name)
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'managing_director') {
            filter.assignee = (_b = req.user) === null || _b === void 0 ? void 0 : _b.name;
        }
        if (status && status !== 'all')
            filter.status = status;
        if (priority && priority !== 'all')
            filter.priority = priority;
        if (approvalStatus && approvalStatus !== 'all')
            filter.approvalStatus = approvalStatus;
        if (q && String(q).trim()) {
            const regex = new RegExp(String(q).trim(), 'i');
            filter.$or = [{ title: regex }, { assignee: regex }];
        }
        const tasks = yield taskModel_1.default.find(filter).sort({ dueDate: 1, createdAt: -1 });
        res.json(tasks);
    }
    catch (_c) {
        res.status(500).json({ message: 'Failed to fetch tasks.' });
    }
});
exports.getAllTasks = getAllTasks;
const getTaskById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let taskId = req.params.taskId;
        if (Array.isArray(taskId))
            taskId = taskId[0];
        if (!taskId)
            return res.status(400).json({ message: 'Missing taskId' });
        const task = yield taskModel_1.default.findById(taskId);
        if (!task)
            return res.status(404).json({ message: 'Task not found.' });
        // Visibility rule:
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'managing_director' && task.assignee !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b.name)) {
            return res.status(403).json({ message: 'Forbidden.' });
        }
        res.json(task);
    }
    catch (_c) {
        res.status(500).json({ message: 'Failed to fetch task.' });
    }
});
exports.getTaskById = getTaskById;
// Update task (normal edits)
const updateTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let taskId = req.params.taskId;
        if (Array.isArray(taskId))
            taskId = taskId[0];
        if (!taskId)
            return res.status(400).json({ message: 'Missing taskId' });
        const before = yield taskModel_1.default.findById(taskId);
        if (!before)
            return res.status(404).json({ message: 'Task not found.' });
        if (isApprovedLocked(before)) {
            return res.status(403).json({ message: 'This task is approved and locked (read-only).' });
        }
        // ✅ Maintain completedAt properly when status changes
        const nextStatus = (_a = req.body) === null || _a === void 0 ? void 0 : _a.status;
        // if moving into Completed, set completedAt
        if (nextStatus && nextStatus === 'Completed' && before.status !== 'Completed') {
            req.body.completedAt = new Date();
        }
        // if moving away from Completed, clear completedAt
        if (nextStatus && nextStatus !== 'Completed' && before.status === 'Completed') {
            req.body.completedAt = undefined;
        }
        // If approvalStatus changes manually (not recommended), protect consistency a bit:
        const nextApprovalStatus = (_b = req.body) === null || _b === void 0 ? void 0 : _b.approvalStatus;
        if (nextApprovalStatus && nextApprovalStatus !== before.approvalStatus) {
            if (nextApprovalStatus === 'Rejected') {
                req.body.rejectedAt = new Date();
                req.body.approvedAt = undefined;
                req.body.completedAt = undefined;
            }
            if (nextApprovalStatus === 'Approved') {
                const now = new Date();
                req.body.approvedAt = now;
                req.body.rejectedAt = undefined;
                // approved implies completed for your workflow
                req.body.status = 'Completed';
                req.body.completedAt = now;
            }
        }
        const updated = yield taskModel_1.default.findByIdAndUpdate(taskId, req.body, { new: true });
        if (!updated)
            return res.status(404).json({ message: 'Task not found.' });
        const changes = [];
        if (req.body.status && req.body.status !== before.status)
            changes.push(`Status: ${before.status} → ${req.body.status}`);
        if (req.body.assignee && req.body.assignee !== before.assignee)
            changes.push(`Assignee: ${before.assignee || '-'} → ${req.body.assignee}`);
        if (req.body.dueDate && req.body.dueDate !== before.dueDate)
            changes.push(`Due: ${before.dueDate || '-'} → ${req.body.dueDate}`);
        if (req.body.title && req.body.title !== before.title)
            changes.push(`Title changed`);
        yield (0, auditService_1.writeAudit)(Object.assign(Object.assign({ caseId: String(updated.caseId) }, withActor(req)), { action: 'TASK_UPDATED', message: 'Updated task', detail: `${updated.title || 'Untitled'}${changes.length ? ' • ' + changes.join(' • ') : ''}` }));
        res.json(updated);
    }
    catch (_c) {
        res.status(500).json({ message: 'Failed to update task.' });
    }
});
exports.updateTask = updateTask;
// Delete task
const deleteTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let taskId = req.params.taskId;
        if (Array.isArray(taskId))
            taskId = taskId[0];
        if (!taskId)
            return res.status(400).json({ message: 'Missing taskId' });
        const deleted = yield taskModel_1.default.findByIdAndDelete(taskId);
        if (!deleted)
            return res.status(404).json({ message: 'Task not found.' });
        yield (0, auditService_1.writeAudit)(Object.assign(Object.assign({ caseId: String(deleted.caseId) }, withActor(req)), { action: 'TASK_DELETED', message: 'Deleted task', detail: deleted.title || 'Untitled' }));
        res.json({ message: 'Task deleted.' });
    }
    catch (_a) {
        res.status(500).json({ message: 'Failed to delete task.' });
    }
});
exports.deleteTask = deleteTask;
// --------------------
// Approval workflow
// --------------------
const submitTaskForApproval = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { taskId } = req.params;
        if (!taskId)
            return res.status(400).json({ message: 'Missing taskId' });
        const task = yield taskModel_1.default.findById(taskId);
        if (!task)
            return res.status(404).json({ message: 'Task not found.' });
        if (!task.requiresApproval) {
            return res.status(400).json({ message: 'This task does not require approval.' });
        }
        if (!['Draft', 'Rejected'].includes(String(task.approvalStatus))) {
            return res.status(400).json({ message: `Cannot submit when status is ${task.approvalStatus}.` });
        }
        task.approvalStatus = 'Pending';
        task.submittedAt = new Date();
        yield task.save();
        yield (0, auditService_1.writeAudit)(Object.assign(Object.assign({ caseId: String(task.caseId) }, withActor(req)), { action: 'TASK_UPDATED', message: 'Submitted task for approval', detail: task.title || 'Untitled' }));
        // ✅ Notify Managing Director for approvals (broadcast to MD role)
        yield (0, notifyService_1.notifyRoles)({
            roles: ['managing_director'],
            category: 'approvals',
            notification: {
                type: 'TASK_APPROVAL_REQUESTED',
                title: 'Task approval requested',
                message: `${task.title || 'Task'} is pending approval.`,
                severity: 'warning',
                caseId: String(task.caseId),
                taskId: String(task._id),
                link: `/tasks/${task._id}`,
            },
            email: {
                subject: `Approval needed: ${task.title || 'Task'}`,
                html: `<div style="font-family: Arial, sans-serif">
                <p>A task has been submitted for approval.</p>
                <p><b>${task.title || 'Task'}</b></p>
              </div>`,
            },
        });
        res.json(task);
    }
    catch (_a) {
        res.status(500).json({ message: 'Failed to submit task for approval.' });
    }
});
exports.submitTaskForApproval = submitTaskForApproval;
// Approve (MD only via route middleware)
const approveTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { taskId } = req.params;
        const { comment } = req.body || {};
        if (!taskId)
            return res.status(400).json({ message: 'Missing taskId' });
        const task = yield taskModel_1.default.findById(taskId);
        if (!task)
            return res.status(404).json({ message: 'Task not found.' });
        if (!task.requiresApproval) {
            return res.status(400).json({ message: 'This task does not require approval.' });
        }
        if (task.approvalStatus !== 'Pending') {
            return res.status(400).json({ message: 'Task is not pending approval.' });
        }
        const now = new Date();
        task.approvalStatus = 'Approved';
        task.status = 'Completed';
        task.approvedAt = now;
        task.rejectedAt = undefined;
        task.completedAt = now;
        task.approvedBy = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.name) || 'System';
        task.approvalComment = String(comment || '').trim();
        yield task.save();
        yield (0, auditService_1.writeAudit)(Object.assign(Object.assign({ caseId: String(task.caseId) }, withActor(req)), { action: 'TASK_UPDATED', message: 'Approved task', detail: `${task.title || 'Untitled'} • Marked Completed` }));
        res.json(task);
    }
    catch (_b) {
        res.status(500).json({ message: 'Failed to approve task.' });
    }
});
exports.approveTask = approveTask;
// Reject (MD only via route middleware)
const rejectTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { taskId } = req.params;
        const { comment } = req.body || {};
        if (!taskId)
            return res.status(400).json({ message: 'Missing taskId' });
        const task = yield taskModel_1.default.findById(taskId);
        if (!task)
            return res.status(404).json({ message: 'Task not found.' });
        if (!task.requiresApproval) {
            return res.status(400).json({ message: 'This task does not require approval.' });
        }
        if (task.approvalStatus !== 'Pending') {
            return res.status(400).json({ message: 'Task is not pending approval.' });
        }
        const now = new Date();
        task.approvalStatus = 'Rejected';
        task.rejectedAt = now;
        task.approvedAt = undefined;
        if (task.status === 'Completed') {
            task.status = 'In Progress';
        }
        task.completedAt = undefined;
        task.approvedBy = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.name) || 'System';
        task.approvalComment = String(comment || '').trim();
        yield task.save();
        yield (0, auditService_1.writeAudit)(Object.assign(Object.assign({ caseId: String(task.caseId) }, withActor(req)), { action: 'TASK_UPDATED', message: 'Rejected task', detail: `${task.title || 'Untitled'}${task.approvalComment ? ' • ' + task.approvalComment : ''}` }));
        res.json(task);
    }
    catch (_b) {
        res.status(500).json({ message: 'Failed to reject task.' });
    }
});
exports.rejectTask = rejectTask;
// --------------------
// Checklist (locked after Approved)
// --------------------
const addChecklistItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { taskId } = req.params;
        const { item } = req.body;
        if (!taskId)
            return res.status(400).json({ message: 'Missing taskId' });
        if (!item || !String(item).trim())
            return res.status(400).json({ message: 'Checklist item is required' });
        const task = yield taskModel_1.default.findById(taskId);
        if (!task)
            return res.status(404).json({ message: 'Task not found.' });
        if (isApprovedLocked(task))
            return res.status(403).json({ message: 'Task is approved and locked.' });
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'managing_director' && task.assignee !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b.name)) {
            return res.status(403).json({ message: 'Forbidden.' });
        }
        task.checklist = task.checklist || [];
        task.checklist.push({ item: String(item).trim(), completed: false });
        yield task.save();
        yield (0, auditService_1.writeAudit)(Object.assign(Object.assign({ caseId: String(task.caseId) }, withActor(req)), { action: 'TASK_UPDATED', message: 'Added checklist item', detail: `${task.title || 'Task'} • ${String(item).trim()}` }));
        res.json(task);
    }
    catch (_c) {
        res.status(500).json({ message: 'Failed to add checklist item.' });
    }
});
exports.addChecklistItem = addChecklistItem;
const toggleChecklistItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { taskId, itemId } = req.params;
        if (!taskId)
            return res.status(400).json({ message: 'Missing taskId' });
        if (!itemId)
            return res.status(400).json({ message: 'Missing itemId' });
        const task = yield taskModel_1.default.findById(taskId);
        if (!task)
            return res.status(404).json({ message: 'Task not found.' });
        if (isApprovedLocked(task))
            return res.status(403).json({ message: 'Task is approved and locked.' });
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'managing_director' && task.assignee !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b.name)) {
            return res.status(403).json({ message: 'Forbidden.' });
        }
        const item = (_c = task.checklist) === null || _c === void 0 ? void 0 : _c.find((i) => String(i._id) === String(itemId));
        if (!item)
            return res.status(404).json({ message: 'Checklist item not found.' });
        item.completed = !item.completed;
        yield task.save();
        yield (0, auditService_1.writeAudit)(Object.assign(Object.assign({ caseId: String(task.caseId) }, withActor(req)), { action: 'TASK_UPDATED', message: 'Updated checklist item', detail: `${task.title || 'Task'} • ${item.item} • ${item.completed ? 'Completed' : 'Pending'}` }));
        res.json(task);
    }
    catch (_d) {
        res.status(500).json({ message: 'Failed to update checklist item.' });
    }
});
exports.toggleChecklistItem = toggleChecklistItem;
const deleteChecklistItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { taskId, itemId } = req.params;
        if (!taskId)
            return res.status(400).json({ message: 'Missing taskId' });
        if (!itemId)
            return res.status(400).json({ message: 'Missing itemId' });
        const task = yield taskModel_1.default.findById(taskId);
        if (!task)
            return res.status(404).json({ message: 'Task not found.' });
        if (isApprovedLocked(task))
            return res.status(403).json({ message: 'Task is approved and locked.' });
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'managing_director' && task.assignee !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b.name)) {
            return res.status(403).json({ message: 'Forbidden.' });
        }
        const item = (_c = task.checklist) === null || _c === void 0 ? void 0 : _c.find((i) => String(i._id) === String(itemId));
        if (!item)
            return res.status(404).json({ message: 'Checklist item not found.' });
        const deletedText = item.item;
        task.checklist = (task.checklist || []).filter((i) => String(i._id) !== String(itemId));
        yield task.save();
        yield (0, auditService_1.writeAudit)(Object.assign(Object.assign({ caseId: String(task.caseId) }, withActor(req)), { action: 'TASK_UPDATED', message: 'Deleted checklist item', detail: `${task.title || 'Task'} • ${deletedText}` }));
        res.json(task);
    }
    catch (_d) {
        res.status(500).json({ message: 'Failed to delete checklist item.' });
    }
});
exports.deleteChecklistItem = deleteChecklistItem;
// --------------------
// Time Logs (locked after Approved)
// --------------------
const getTimeLogsForTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { taskId } = req.params;
        if (!taskId)
            return res.status(400).json({ message: 'Missing taskId' });
        const task = yield taskModel_1.default.findById(taskId);
        if (!task)
            return res.status(404).json({ message: 'Task not found.' });
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'managing_director' && task.assignee !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b.name)) {
            return res.status(403).json({ message: 'Forbidden.' });
        }
        const logs = yield taskTimeLogModel_1.default.find({ taskId: new mongoose_1.default.Types.ObjectId(taskId) }).sort({ loggedAt: -1 });
        const totalHours = logs.reduce((sum, l) => sum + (Number(l.hours) || 0), 0);
        res.json({ logs, totalHours });
    }
    catch (_c) {
        res.status(500).json({ message: 'Failed to fetch time logs.' });
    }
});
exports.getTimeLogsForTask = getTimeLogsForTask;
const addTimeLogToTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { taskId } = req.params;
        const { hours, note, loggedAt } = req.body || {};
        if (!taskId)
            return res.status(400).json({ message: 'Missing taskId' });
        const numHours = Number(hours);
        if (!Number.isFinite(numHours) || numHours <= 0) {
            return res.status(400).json({ message: 'hours must be a positive number' });
        }
        const task = yield taskModel_1.default.findById(taskId);
        if (!task)
            return res.status(404).json({ message: 'Task not found.' });
        if (isApprovedLocked(task))
            return res.status(403).json({ message: 'Task is approved and locked.' });
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'managing_director' && task.assignee !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b.name)) {
            return res.status(403).json({ message: 'Forbidden.' });
        }
        const payload = {
            taskId: new mongoose_1.default.Types.ObjectId(taskId),
            caseId: task.caseId,
            userName: ((_c = req.user) === null || _c === void 0 ? void 0 : _c.name) || 'System',
            hours: numHours,
            loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
        };
        if ((_d = req.user) === null || _d === void 0 ? void 0 : _d.id)
            payload.userId = new mongoose_1.default.Types.ObjectId(req.user.id);
        if (note && String(note).trim())
            payload.note = String(note).trim();
        const log = yield taskTimeLogModel_1.default.create(payload);
        yield (0, auditService_1.writeAudit)(Object.assign(Object.assign({ caseId: String(task.caseId) }, withActor(req)), { action: 'TASK_UPDATED', message: 'Logged hours', detail: `${task.title || 'Task'} • ${numHours}h` }));
        res.status(201).json(log);
    }
    catch (_e) {
        res.status(500).json({ message: 'Failed to log hours.' });
    }
});
exports.addTimeLogToTask = addTimeLogToTask;
//# sourceMappingURL=taskController.js.map