import mongoose, { Document } from 'mongoose';
export interface INotificationPreferences extends Document {
    userId: mongoose.Types.ObjectId;
    emailEnabled: boolean;
    deadlinesEnabled: boolean;
    taskAssignmentsEnabled: boolean;
    approvalsEnabled: boolean;
    pettyCashLowEnabled: boolean;
    taskDueReminderHours: number;
    eventReminderHours: number[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<INotificationPreferences, {}, {}, {}, mongoose.Document<unknown, {}, INotificationPreferences, {}, mongoose.DefaultSchemaOptions> & INotificationPreferences & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, INotificationPreferences>;
export default _default;
//# sourceMappingURL=notificationPreferencesModel.d.ts.map