import mongoose, { Document } from 'mongoose';
export type PettyCashFundStatus = 'active' | 'closed';
export interface IPettyCashFund extends Document {
    name: string;
    description?: string;
    currency: string;
    initialAmount: number;
    spentAmount: number;
    remainingAmount: number;
    status: PettyCashFundStatus;
    lowBalancePercent: number;
    lowBalanceNotifiedAt?: Date | null;
    createdByUserId?: mongoose.Types.ObjectId;
    createdByName: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IPettyCashFund, {}, {}, {}, mongoose.Document<unknown, {}, IPettyCashFund, {}, mongoose.DefaultSchemaOptions> & IPettyCashFund & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IPettyCashFund>;
export default _default;
//# sourceMappingURL=pettyCashFundModel.d.ts.map