import { AuditAction } from '../models/auditLogModel';
export declare const writeAudit: (params: {
    caseId: string;
    actorUserId?: string;
    actorName: string;
    action: AuditAction;
    message: string;
    detail?: string;
}) => Promise<void>;
//# sourceMappingURL=auditService.d.ts.map