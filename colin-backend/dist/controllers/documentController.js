"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDocument = exports.addDocumentToCase = exports.getDocumentsForCase = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const documentModel_1 = __importDefault(require("../models/documentModel"));
const auditService_1 = require("../services/auditService");
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
exports.upload = (0, multer_1.default)({ storage });
const actorFromReq = (req) => ({
    actorName: req.user?.name || 'System',
    actorUserId: req.user?.id,
});
const getDocumentsForCase = async (req, res) => {
    try {
        let caseId = req.params.caseId;
        if (Array.isArray(caseId))
            caseId = caseId[0];
        if (!caseId)
            return res.status(400).json({ message: 'Missing caseId' });
        const documents = await documentModel_1.default.find({
            caseId: new mongoose_1.default.Types.ObjectId(caseId),
        }).sort({ uploadedDate: -1 });
        res.json(documents);
    }
    catch {
        res.status(500).json({ message: 'Failed to fetch documents.' });
    }
};
exports.getDocumentsForCase = getDocumentsForCase;
const addDocumentToCase = async (req, res) => {
    try {
        let caseId = req.params.caseId;
        if (Array.isArray(caseId))
            caseId = caseId[0];
        if (!caseId)
            return res.status(400).json({ message: 'Missing caseId' });
        if (!req.file)
            return res.status(400).json({ message: 'No file uploaded' });
        const userName = req.user?.name || 'Unknown';
        const newDoc = new documentModel_1.default({
            caseId: new mongoose_1.default.Types.ObjectId(caseId),
            name: req.body.name,
            category: req.body.category || undefined,
            workflowInstanceId: req.body.workflowInstanceId
                ? new mongoose_1.default.Types.ObjectId(req.body.workflowInstanceId)
                : undefined,
            stepKey: req.body.stepKey || undefined,
            outputKey: req.body.outputKey || undefined,
            uploadedBy: userName,
            uploadedDate: new Date().toISOString().slice(0, 10),
            size: (req.file.size / 1024 / 1024).toFixed(2) + ' MB',
            url: `/uploads/${req.file.filename}`,
        });
        await newDoc.save();
        const actor = actorFromReq(req);
        await (0, auditService_1.writeAudit)({
            caseId,
            actorName: actor.actorName,
            ...(actor.actorUserId ? { actorUserId: actor.actorUserId } : {}),
            action: 'DOCUMENT_UPLOADED',
            message: 'Uploaded document',
            detail: `${newDoc.name || 'Untitled'}${newDoc.stepKey ? ` • Step: ${newDoc.stepKey}` : ''}${newDoc.outputKey ? ` • Output: ${newDoc.outputKey}` : ''}`,
        });
        res.status(201).json(newDoc);
    }
    catch {
        res.status(500).json({ message: 'Failed to create document.' });
    }
};
exports.addDocumentToCase = addDocumentToCase;
const deleteDocument = async (req, res) => {
    try {
        let docId = req.params.docId;
        if (Array.isArray(docId))
            docId = docId[0];
        if (!docId)
            return res.status(400).json({ message: 'Missing docId' });
        const deleted = await documentModel_1.default.findByIdAndDelete(docId);
        if (!deleted)
            return res.status(404).json({ message: 'Document not found.' });
        const actor = actorFromReq(req);
        await (0, auditService_1.writeAudit)({
            caseId: String(deleted.caseId),
            actorName: actor.actorName,
            ...(actor.actorUserId ? { actorUserId: actor.actorUserId } : {}),
            action: 'DOCUMENT_DELETED',
            message: 'Deleted document',
            detail: `${deleted.name || 'Untitled'}`,
        });
        res.json({ message: 'Document deleted.' });
    }
    catch {
        res.status(500).json({ message: 'Failed to delete document.' });
    }
};
exports.deleteDocument = deleteDocument;
//# sourceMappingURL=documentController.js.map