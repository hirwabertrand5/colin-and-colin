import mongoose, { Document } from 'mongoose';
export type ClientReportStatus = 'Draft' | 'Sent' | 'Failed';
export type ClientReportTrigger = 'manual' | 'weekly' | 'monthly' | 'update';
export interface IClientReportRecipient {
    name?: string;
    email?: string;
    phone?: string;
    isPrimary?: boolean;
}
export interface IClientReport extends Document {
    caseId: mongoose.Types.ObjectId;
    trigger: ClientReportTrigger;
    status: ClientReportStatus;
    periodStart: Date;
    periodEnd: Date;
    subject: string;
    recipients: IClientReportRecipient[];
    contentHtml: string;
    generatedBy?: string;
    generatedByUserId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IClientReport, {}, {}, {}, mongoose.Document<unknown, {}, IClientReport, {}, mongoose.DefaultSchemaOptions> & IClientReport & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IClientReport>;
export default _default;
//# sourceMappingURL=clientReportModel.d.ts.map