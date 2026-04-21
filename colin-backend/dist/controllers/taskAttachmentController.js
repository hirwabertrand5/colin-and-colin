"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTaskAttachment = exports.uploadAttachmentToTask = exports.listAttachmentsForTask = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const taskModel_1 = __importDefault(require("../models/taskModel"));
const taskAttachmentModel_1 = __importDefault(require("../models/taskAttachmentModel"));
const documentModel_1 = __importDefault(require("../models/documentModel"));
const auditService_1 = require("../services/auditService");
const actorFromReq = (req) => ({
    actorName: req.user?.name || 'System',
    actorUserId: req.user?.id,
});
const canAccessTask = (req, task) => {
    if (req.user?.role === 'managing_director')
        return true;
    return task.assignee === req.user?.name;
};
const listAttachmentsForTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await taskModel_1.default.findById(taskId);
        if (!task)
            return res.status(404).json({ message: 'Task not found.' });
        if (!canAccessTask(req, task))
            return res.status(403).json({ message: 'Forbidden.' });
        const items = await taskAttachmentModel_1.default.find({ taskId: new mongoose_1.default.Types.ObjectId(taskId) })
            .sort({ createdAt: -1 })
            .limit(200);
        res.json(items);
    }
    catch {
        res.status(500).json({ message: 'Failed to fetch task attachments.' });
    }
};
exports.listAttachmentsForTask = listAttachmentsForTask;
const uploadAttachmentToTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { name, note } = req.body || {};
        if (!req.file)
            return res.status(400).json({ message: 'No file uploaded.' });
        const task = await taskModel_1.default.findById(taskId);
        if (!task)
            return res.status(404).json({ message: 'Task not found.' });
        if (!canAccessTask(req, task))
            return res.status(403).json({ message: 'Forbidden.' });
        const actor = actorFromReq(req);
        const displayName = String(name || req.file.originalname).trim();
        const url = `/uploads/${req.file.filename}`;
        // 1) Save TaskAttachment
        const attachment = await taskAttachmentModel_1.default.create({
            taskId: new mongoose_1.default.Types.ObjectId(taskId),
            caseId: task.caseId,
            name: displayName,
            originalName: req.file.originalname,
            uploadedBy: actor.actorName,
            uploadedDate: new Date().toISOString().slice(0, 10),
            size: (req.file.size / 1024 / 1024).toFixed(2) + ' MB',
            url,
            note: note ? String(note).trim() : undefined,
        });
        // 2) Also create Case Document (so visible in Case Documents tab)
        const caseDocName = `Task: ${task.title} — ${displayName}`;
        await documentModel_1.default.create({
            caseId: task.caseId,
            name: caseDocName,
            uploadedBy: actor.actorName,
            uploadedDate: new Date().toISOString().slice(0, 10),
            size: (req.file.size / 1024 / 1024).toFixed(2) + ' MB',
            url,
        });
        // 3) Audit
        await (0, auditService_1.writeAudit)({
            caseId: String(task.caseId),
            actorName: actor.actorName,
            ...(actor.actorUserId ? { actorUserId: actor.actorUserId } : {}),
            action: 'TASK_UPDATED',
            message: 'Uploaded task attachment',
            detail: `${task.title} • ${displayName}`,
        });
        res.status(201).json(attachment);
    }
    catch {
        res.status(500).json({ message: 'Failed to upload task attachment.' });
    }
};
exports.uploadAttachmentToTask = uploadAttachmentToTask;
const deleteTaskAttachment = async (req, res) => {
    try {
        const { attachmentId } = req.params;
        const att = await taskAttachmentModel_1.default.findById(attachmentId);
        if (!att)
            return res.status(404).json({ message: 'Attachment not found.' });
        const task = await taskModel_1.default.findById(att.taskId);
        if (!task)
            return res.status(404).json({ message: 'Task not found.' });
        if (!canAccessTask(req, task))
            return res.status(403).json({ message: 'Forbidden.' });
        await taskAttachmentModel_1.default.findByIdAndDelete(attachmentId);
        const actor = actorFromReq(req);
        await (0, auditService_1.writeAudit)({
            caseId: String(task.caseId),
            actorName: actor.actorName,
            ...(actor.actorUserId ? { actorUserId: actor.actorUserId } : {}),
            action: 'TASK_UPDATED',
            message: 'Deleted task attachment',
            detail: `${task.title} • ${att.name}`,
        });
        res.json({ message: 'Attachment deleted.' });
    }
    catch {
        res.status(500).json({ message: 'Failed to delete attachment.' });
    }
};
exports.deleteTaskAttachment = deleteTaskAttachment;
//# sourceMappingURL=taskAttachmentController.js.map