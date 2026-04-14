import mongoose, { Document } from 'mongoose';
export type CaseType = 'Transactional Cases' | 'Litigation Cases' | 'Labor Cases';
export interface IClientContact {
    name?: string;
    email?: string;
    phone?: string;
    isPrimary?: boolean;
}
export interface ICaseReportingSettings {
    weeklyEnabled?: boolean;
    monthlyEnabled?: boolean;
    onUpdateEnabled?: boolean;
    lastGeneratedAt?: Date;
    lastSentAt?: Date;
}
export interface ICase extends Document {
    caseNo: string;
    parties: string;
    caseType: CaseType;
    status: string;
    priority: string;
    assignedTo: string;
    description?: string;
    workflow?: string;
    estimatedDuration?: string;
    budget?: string;
    matterType?: string;
    workflowTemplateId?: mongoose.Types.ObjectId;
    workflowInstanceId?: mongoose.Types.ObjectId;
    onboarding?: {
        engagementLetterSignedAt?: Date;
        conflictCheckStatus?: 'Pending' | 'Cleared' | 'Flagged';
        conflictCheckedAt?: Date;
    };
    workflowProgress?: {
        status?: 'Not Started' | 'In Progress' | 'Completed';
        currentStepKey?: string;
        percent?: number;
    };
    clientContacts: IClientContact[];
    reporting?: ICaseReportingSettings;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ICase, {}, {}, {}, mongoose.Document<unknown, {}, ICase, {}, mongoose.DefaultSchemaOptions> & ICase & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICase>;
export default _default;
//# sourceMappingURL=caseModel.d.ts.map