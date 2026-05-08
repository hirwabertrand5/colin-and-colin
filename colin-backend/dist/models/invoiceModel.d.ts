import mongoose, { Document } from 'mongoose';
export interface IInvoice extends Document {
    caseId: mongoose.Types.ObjectId;
    invoiceNo: string;
    year: number;
    seqYear: number;
    seqCase: number;
    date: string;
    amount: number;
    status: 'Paid' | 'Pending';
    proofUrl?: string;
    invoiceFileUrl?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IInvoice, {}, {}, {}, mongoose.Document<unknown, {}, IInvoice, {}, mongoose.DefaultSchemaOptions> & IInvoice & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IInvoice>;
export default _default;
//# sourceMappingURL=invoiceModel.d.ts.map