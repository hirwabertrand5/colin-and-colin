import mongoose, { Schema, Document } from 'mongoose';

export interface IPettyCashExpense extends Document {
  fundId: mongoose.Types.ObjectId;

  date: string; // YYYY-MM-DD (consistent with your app)
  title: string;
  category?: string;
  vendor?: string;

  amount: number;
  note?: string;

  receiptUrl?: string; // optional upload

  createdByUserId?: mongoose.Types.ObjectId;
  createdByName: string;

  createdAt: Date;
  updatedAt: Date;
}

const PettyCashExpenseSchema = new Schema<IPettyCashExpense>(
  {
    fundId: { type: Schema.Types.ObjectId, ref: 'PettyCashFund', required: true, index: true },

    date: { type: String, required: true },
    title: { type: String, required: true, trim: true },

    category: { type: String },
    vendor: { type: String },

    amount: { type: Number, required: true, min: 0.01 },
    note: { type: String },

    receiptUrl: { type: String },

    createdByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    createdByName: { type: String, required: true },
  },
  { timestamps: true }
);

PettyCashExpenseSchema.index({ fundId: 1, date: -1, createdAt: -1 });

export default mongoose.model<IPettyCashExpense>('PettyCashExpense', PettyCashExpenseSchema);