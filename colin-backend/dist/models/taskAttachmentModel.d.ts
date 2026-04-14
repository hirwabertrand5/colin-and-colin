import mongoose, { Document } from 'mongoose';
export interface ITaskAttachment extends Document {
    taskId: mongoose.Types.ObjectId;
    caseId: mongoose.Types.ObjectId;
    name: string;
    originalName: string;
    uploadedBy: string;
    uploadedDate: string;
    size: string;
    url: string;
    note?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ITaskAttachment, {}, {}, {}, mongoose.Document<unknown, {}, ITaskAttachment, {}, mongoose.DefaultSchemaOptions> & ITaskAttachment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ITaskAttachment>;
export default _default;
//# sourceMappingURL=taskAttachmentModel.d.ts.map