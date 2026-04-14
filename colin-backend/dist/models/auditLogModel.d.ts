import mongoose, { Document } from 'mongoose';
export type AuditAction = 'CASE_CREATED' | 'CASE_UPDATED' | 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_DELETED' | 'EVENT_CREATED' | 'EVENT_UPDATED' | 'EVENT_DELETED' | 'DOCUMENT_UPLOADED' | 'DOCUMENT_DELETED' | 'INVOICE_CREATED' | 'INVOICE_PAID' | 'INVOICE_UPDATED' | 'INVOICE_DELETED' | 'WORKFLOW_TEMPLATE_CREATED' | 'WORKFLOW_TEMPLATE_UPDATED' | 'WORKFLOW_TEMPLATE_DELETED' | 'WORKFLOW_INSTANCE_CREATED' | 'WORKFLOW_OUTPUT_UPLOADED' | 'WORKFLOW_STEP_COMPLETED';
export interface IAuditLog extends Document {
    caseId: mongoose.Types.ObjectId;
    actorUserId?: mongoose.Types.ObjectId;
    actorName: string;
    action: AuditAction;
    message: string;
    detail?: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<IAuditLog, {}, {}, {}, mongoose.Document<unknown, {}, IAuditLog, {}, mongoose.DefaultSchemaOptions> & IAuditLog & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAuditLog>;
export default _default;
//# sourceMappingURL=auditLogModel.d.ts.map