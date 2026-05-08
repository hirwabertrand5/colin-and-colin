import mongoose, { Document } from 'mongoose';
export interface ICaseDocument extends Document {
    caseId: mongoose.Types.ObjectId;
    name: string;
    category?: string;
    workflowInstanceId?: mongoose.Types.ObjectId;
    stepKey?: string;
    outputKey?: string;
    uploadedBy: string;
    uploadedDate: string;
    size: string;
    url: string;
}
declare const _default: mongoose.Model<ICaseDocument, {}, {}, {}, mongoose.Document<unknown, {}, ICaseDocument, {}, mongoose.DefaultSchemaOptions> & ICaseDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICaseDocument>;
export default _default;
//# sourceMappingURL=documentModel.d.ts.map