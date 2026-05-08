import mongoose, { Schema, Document } from 'mongoose';

export type PettyCashFundStatus = 'active' | 'closed';

export interface IPettyCashFund extends Document {
  name: string;
  description?: string;

  currency: string; // default RWF

  initialAmount: number;
  spentAmount: number;
  remainingAmount: number;

  status: PettyCashFundStatus;

  lowBalancePercent: number; // fixed 20 for now
  lowBalanceNotifiedAt?: Date | null;

  createdByUserId?: mongoose.Types.ObjectId;
  createdByName: string;

  createdAt: Date;
  updatedAt: Date;
}

const PettyCashFundSchema = new Schema<IPettyCashFund>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },

    currency: { type: String, default: 'RWF' },

    initialAmount: { type: Number, required: true, min: 0 },
    spentAmount: { type: Number, required: true, default: 0, min: 0 },
    remainingAmount: { type: Number, required: true, default: 0, min: 0 },

    status: { type: String, enum: ['active', 'closed'], default: 'active', index: true },

    lowBalancePercent: { type: Number, default: 20 },
    lowBalanceNotifiedAt: { type: Date, default: null },

    createdByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    createdByName: { type: String, required: true },
  },
  { timestamps: true }
);

// ensure quick “active fund” lookup
PettyCashFundSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IPettyCashFund>('PettyCashFund', PettyCashFundSchema);