"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditForCase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const auditLogModel_1 = __importDefault(require("../models/auditLogModel"));
const getAuditForCase = async (req, res) => {
    try {
        let caseId = req.params.caseId;
        if (Array.isArray(caseId))
            caseId = caseId[0];
        if (!caseId)
            return res.status(400).json({ message: 'Missing caseId' });
        // validate ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(caseId)) {
            return res.status(400).json({ message: 'Invalid caseId' });
        }
        const logs = await auditLogModel_1.default.find({
            caseId: new mongoose_1.default.Types.ObjectId(caseId),
        })
            .sort({ createdAt: -1 })
            .limit(200);
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch audit logs.' });
    }
};
exports.getAuditForCase = getAuditForCase;
//# sourceMappingURL=auditController.js.map