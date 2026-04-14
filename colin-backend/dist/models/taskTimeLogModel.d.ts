import mongoose, { Document } from 'mongoose';
export interface ITaskTimeLog extends Document {
    taskId: mongoose.Types.ObjectId;
    caseId: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
    userName: string;
    hours: number;
    note?: string;
    loggedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ITaskTimeLog, {}, {}, {}, mongoose.Document<unknown, {}, ITaskTimeLog, {}, mongoose.DefaultSchemaOptions> & ITaskTimeLog & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ITaskTimeLog>;
export default _default;
//# sourceMappingURL=taskTimeLogModel.d.ts.map