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
    caseNo: { type: String, required: true },
    parties: { type: String, required: true },
    caseType: { type: String, required: true },
    status: { type: String, default: 'On Boarding' },
    priority: { type: String, default: 'Medium' },
    assignedTo: { type: String, required: true },
    description: String,
    workflow: String,
    estimatedDuration: String,
    budget: String,
  },
  { timestamps: true }
);

export default mongoose.model<ICase>('Case', CaseSchema);