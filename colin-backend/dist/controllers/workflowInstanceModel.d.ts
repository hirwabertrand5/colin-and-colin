import mongoose, { Document } from 'mongoose';
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
    dueAt?: Date;
    completedAt?: Date;
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
declare const _default: mongoose.Model<IWorkflowInstance, {}, {}, {}, mongoose.Document<unknown, {}, IWorkflowInstance, {}, mongoose.DefaultSchemaOptions> & IWorkflowInstance & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IWorkflowInstance>;
export default _default;
//# sourceMappingURL=workflowInstanceModel.d.ts.map