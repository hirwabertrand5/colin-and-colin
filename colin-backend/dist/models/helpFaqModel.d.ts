import mongoose, { Document } from 'mongoose';
export interface IHelpFaq extends Document {
    question: string;
    answer: string;
    order: number;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IHelpFaq, {}, {}, {}, mongoose.Document<unknown, {}, IHelpFaq, {}, mongoose.DefaultSchemaOptions> & IHelpFaq & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IHelpFaq>;
export default _default;
//# sourceMappingURL=helpFaqModel.d.ts.map