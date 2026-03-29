import mongoose, { Schema, Document } from 'mongoose';

export type CaseType = 'Transactional Cases' | 'Litigation Cases' | 'Labor Cases';

export interface IClientContact {
  name?: string;
  email?: string;
  phone?: string;
  isPrimary?: boolean;
}

export interface ICaseReportingSettings {
  weeklyEnabled?: boolean;
  monthlyEnabled?: boolean;
  onUpdateEnabled?: boolean;
  lastGeneratedAt?: Date;
  lastSentAt?: Date;
}

export interface ICase extends Document {
  caseNo: string;
  parties: string;
  caseType: CaseType;

  status: string;
  priority: string;
  assignedTo: string;

  description?: string;
  workflow?: string;
  estimatedDuration?: string;
  budget?: string;

  clientContacts: IClientContact[];
  reporting?: ICaseReportingSettings;

  createdAt: Date;
  updatedAt: Date;
}

const ClientContactSchema = new Schema<IClientContact>(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const CaseSchema = new Schema<ICase>(
  {
    caseNo: { type: String, required: true, trim: true },
    parties: { type: String, required: true, trim: true },

    // ✅ Enforce your 3 options exactly (matches your dropdown)
    caseType: {
      type: String,
      enum: ['Transactional Cases', 'Litigation Cases', 'Labor Cases'],
      required: true,
      trim: true,
    },

    status: { type: String, default: 'On Boarding', trim: true },
    priority: { type: String, default: 'Medium', trim: true },

    // ✅ Important: use trimmed names to reduce mismatch issues
    assignedTo: { type: String, required: true, trim: true },

    description: { type: String },
    workflow: { type: String },
    estimatedDuration: { type: String },
    budget: { type: String },

    // ✅ NEW: client contacts
    clientContacts: { type: [ClientContactSchema], default: [] },

    // ✅ NEW: reporting settings
    reporting: {
      type: {
        weeklyEnabled: { type: Boolean, default: false },
        monthlyEnabled: { type: Boolean, default: true },
        onUpdateEnabled: { type: Boolean, default: true },
        lastGeneratedAt: { type: Date },
        lastSentAt: { type: Date },
      },
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICase>('Case', CaseSchema);