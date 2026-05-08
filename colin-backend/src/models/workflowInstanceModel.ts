import mongoose, { Schema, Document } from 'mongoose';

export type StepStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface IInstanceOutput {
  key: string;
  name: string;
  required: boolean;
  category?: string;

  documentId?: mongoose.Types.ObjectId;
  uploadedAt?: Date;
}

export interface IInstanceStep {
  stepKey: string;
  title: string;
  stageKey: string;
  order: number;

  status: StepStatus;
  startAt?: Date;
  dueAt?: Date;
  completedAt?: Date;

  feeAmount?: number;
  feeCurrency?: string;
  feeText?: string;

  slaMinutes?: number;
  slaText?: string;

  responsibleRole?: string;

  outputs: IInstanceOutput[];
}

export interface IWorkflowInstance extends Document {
  caseId: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;

  status: 'Active' | 'Completed';
  currentStepKey?: string;

  steps: IInstanceStep[];

  createdAt: Date;
  updatedAt: Date;
}

const InstanceOutputSchema = new Schema<IInstanceOutput>(
  {
    key: { type: String, required: true },
    name: { type: String, required: true },
    required: { type: Boolean, default: true },
    category: { type: String },

    documentId: { type: Schema.Types.ObjectId, ref: 'Document' },
    uploadedAt: { type: Date },
  },
  { _id: false }
);

const InstanceStepSchema = new Schema<IInstanceStep>(
  {
    stepKey: { type: String, required: true },
    title: { type: String, required: true },
    stageKey: { type: String, required: true },
    order: { type: Number, required: true },

    status: { type: String, enum: ['Not Started', 'In Progress', 'Completed'], default: 'Not Started' },
    startAt: { type: Date },
    dueAt: { type: Date },
    completedAt: { type: Date },

    feeAmount: { type: Number, min: 0 },
    feeCurrency: { type: String, trim: true },
    feeText: { type: String },

    slaMinutes: { type: Number, min: 0 },
    slaText: { type: String },

    responsibleRole: { type: String, trim: true },

    outputs: { type: [InstanceOutputSchema], default: [] },
  },
  { _id: false }
);

const WorkflowInstanceSchema = new Schema<IWorkflowInstance>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true, unique: true, index: true },
    templateId: { type: Schema.Types.ObjectId, ref: 'WorkflowTemplate', required: true, index: true },

    status: { type: String, enum: ['Active', 'Completed'], default: 'Active' },
    currentStepKey: { type: String },

    steps: { type: [InstanceStepSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<IWorkflowInstance>('WorkflowInstance', WorkflowInstanceSchema);
