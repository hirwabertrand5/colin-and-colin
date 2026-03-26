import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType = 'PETTY_CASH_LOW' | 'PETTY_CASH_CREATED' | 'PETTY_CASH_EXPENSE';

export interface INotification extends Document {
  type: NotificationType;
  title: string;
  message: string;

  // optional linking
  fundId?: mongoose.Types.ObjectId;
  expenseId?: mongoose.Types.ObjectId;
  caseId?: mongoose.Types.ObjectId;

  severity: 'info' | 'warning' | 'critical';
  audienceRoles: string[]; // e.g. ['managing_director','executive_assistant']

  isReadBy: mongoose.Types.ObjectId[]; // userIds who read
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },

    fundId: { type: Schema.Types.ObjectId, ref: 'PettyCashFund' },
    expenseId: { type: Schema.Types.ObjectId, ref: 'PettyCashExpense' },
    caseId: { type: Schema.Types.ObjectId, ref: 'Case' },

    severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
    audienceRoles: { type: [String], default: [] },

    isReadBy: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
  },
  { timestamps: true }
);

NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);