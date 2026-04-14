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
exports.writeAudit = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const auditLogModel_1 = __importDefault(require("../models/auditLogModel"));
const writeAudit = (params) => __awaiter(void 0, void 0, void 0, function* () {
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
    yield auditLogModel_1.default.create(doc);
});
exports.writeAudit = writeAudit;
//# sourceMappingURL=auditService.js.map