import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  caseId: mongoose.Types.ObjectId;
  title: string;
  priority: string;
  status: string;
  assignee: string;
  dueDate: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
    title: { type: String, required: true },
    priority: { type: String, default: 'Medium' },
    status: { type: String, default: 'Not Started' },
    assignee: { type: String, required: true },
    dueDate: { type: String, required: true },
    description: String,
  },
  { timestamps: true }
);

export default mongoose.model<ITask>('Task', TaskSchema);