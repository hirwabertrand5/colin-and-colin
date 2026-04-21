"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeAudit = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const auditLogModel_1 = __importDefault(require("../models/auditLogModel"));
const writeAudit = async (params) => {
    const doc = {
        caseId: new mongoose_1.default.Types.ObjectId(params.caseId),
        actorName: params.actorName,
        action: params.action,
        message: params.message,
    };
    if (params.detail)
        doc.detail = params.detail;
    if (params.actorUserId) {
        doc.actorUserId = new mongoose_1.default.Types.ObjectId(params.actorUserId);
    }
    await auditLogModel_1.default.create(doc);
};
exports.writeAudit = writeAudit;
//# sourceMappingURL=auditService.js.map