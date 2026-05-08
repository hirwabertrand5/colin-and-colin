import mongoose, { Document } from 'mongoose';
export interface IEvent extends Document {
    caseId: mongoose.Types.ObjectId;
    title: string;
    type: string;
    date: string;
    time: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IEvent, {}, {}, {}, mongoose.Document<unknown, {}, IEvent, {}, mongoose.DefaultSchemaOptions> & IEvent & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IEvent>;
export default _default;
//# sourceMappingURL=eventModel.d.ts.map