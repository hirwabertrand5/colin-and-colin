import mongoose, { Document } from 'mongoose';
export interface IPettyCashExpense extends Document {
    fundId: mongoose.Types.ObjectId;
    date: string;
    title: string;
    category?: string;
    vendor?: string;
    amount: number;
    note?: string;
    receiptUrl?: string;
    createdByUserId?: mongoose.Types.ObjectId;
    createdByName: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IPettyCashExpense, {}, {}, {}, mongoose.Document<unknown, {}, IPettyCashExpense, {}, mongoose.DefaultSchemaOptions> & IPettyCashExpense & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IPettyCashExpense>;
export default _default;
//# sourceMappingURL=pettyCashExpenseModel.d.ts.map