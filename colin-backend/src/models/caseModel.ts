import mongoose, { Schema, Document } from 'mongoose';

export interface ICase extends Document {
  caseNo: string;
  parties: string;
  caseType: string;
  status: string;
  priority: string;
  assignedTo: string;
  description?: string;
  workflow?: string;
  estimatedDuration?: string;
  budget?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CaseSchema = new Schema<ICase>(
  {
    caseNo: { type: String, required: true, trim: true },
    parties: { type: String, required: true, trim: true },
    caseType: { type: String, required: true, trim: true },
    status: { type: String, default: 'On Boarding', trim: true },
    priority: { type: String, default: 'Medium', trim: true },

    // ✅ Important: use trimmed names to reduce mismatch issues
    assignedTo: { type: String, required: true, trim: true },

    description: { type: String },
    workflow: { type: String },
    estimatedDuration: { type: String },
    budget: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ICase>('Case', CaseSchema);