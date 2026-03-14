import mongoose, { Schema, Document } from 'mongoose';

export type TaskApprovalStatus = 'Not Required' | 'Pending' | 'Approved' | 'Rejected';

// You can later align these to the client's exact workflow:
// Assigned -> In Progress -> Submitted for Review -> Approved/Returned
export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface ITaskChecklistItem {
  _id?: mongoose.Types.ObjectId;
  item: string;
  completed: boolean;
}

export interface ITask extends Document {
  caseId: mongoose.Types.ObjectId;

  title: string;
  priority: 'High' | 'Medium' | 'Low';
  status: TaskStatus;

  assignee: string; // MVP: name string (later userId)
  dueDate: string;  // YYYY-MM-DD
  description?: string;

  // Approval workflow
  requiresApproval: boolean;
  approvalStatus: TaskApprovalStatus;
  submittedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string; // name snapshot for MVP
  approvalComment?: string;

  // Time tracking
  estimatedHours?: number;

  // Checklist
  checklist: ITaskChecklistItem[];

  // Audit info
  assignedBy?: string; // name snapshot for MVP

  createdAt: Date;
  updatedAt: Date;
}

const TaskChecklistItemSchema = new Schema<ITaskChecklistItem>(
  {
    item: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
  },
  { _id: true }
);

const TaskSchema = new Schema<ITask>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true, index: true },

    title: { type: String, required: true, trim: true },

    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },

    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed'],
      default: 'Not Started',
      index: true,
    },

    assignee: { type: String, required: true, trim: true },
    dueDate: { type: String, required: true }, // keep string for now
    description: { type: String },

    // Approval workflow
    requiresApproval: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ['Not Required', 'Pending', 'Approved', 'Rejected'],
      default: 'Not Required',
      index: true,
    },
    submittedAt: { type: Date },
    approvedAt: { type: Date },
    approvedBy: { type: String },
    approvalComment: { type: String },

    // Time tracking
    estimatedHours: { type: Number, min: 0 },

    // Checklist
    checklist: { type: [TaskChecklistItemSchema], default: [] },

    // Assigned by
    assignedBy: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ITask>('Task', TaskSchema);