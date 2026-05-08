import mongoose, { Document } from 'mongoose';
export interface IHelpArticle extends Document {
    title: string;
    description: string;
    category: string;
    type: 'Guide' | 'Tutorial' | 'Policy';
    contentMd: string;
    isPublished: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IHelpArticle, {}, {}, {}, mongoose.Document<unknown, {}, IHelpArticle, {}, mongoose.DefaultSchemaOptions> & IHelpArticle & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IHelpArticle>;
export default _default;
//# sourceMappingURL=helpArticleModel.d.ts.map