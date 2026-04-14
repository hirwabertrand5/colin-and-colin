import mongoose, { Document } from 'mongoose';
export type NotificationType = 'PETTY_CASH_LOW' | 'PETTY_CASH_CREATED' | 'PETTY_CASH_EXPENSE' | 'TASK_ASSIGNED' | 'TASK_APPROVAL_REQUESTED' | 'TASK_DUE_REMINDER' | 'EVENT_REMINDER';
export interface INotification extends Document {
    type: NotificationType;
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'critical';
    audienceUserIds: mongoose.Types.ObjectId[];
    audienceRoles: string[];
    link?: string;
    dedupeKey?: string;
    caseId?: mongoose.Types.ObjectId;
    taskId?: mongoose.Types.ObjectId;
    eventId?: mongoose.Types.ObjectId;
    fundId?: mongoose.Types.ObjectId;
    expenseId?: mongoose.Types.ObjectId;
    isReadBy: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, mongoose.DefaultSchemaOptions> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, INotification>;
export default _default;
//# sourceMappingURL=notificationModel.d.ts.map