import mongoose, { Document } from 'mongoose';
export type TaskApprovalStatus = 'Not Required' | 'Draft' | 'Pending' | 'Approved' | 'Rejected';
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
    assignee: string;
    dueDate: string;
    description?: string;
    requiresApproval: boolean;
    approvalStatus: TaskApprovalStatus;
    submittedAt?: Date;
    approvedAt?: Date;
    rejectedAt?: Date;
    completedAt?: Date;
    approvedBy?: string;
    approvalComment?: string;
    estimatedHours?: number;
    checklist: ITaskChecklistItem[];
    assignedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ITask, {}, {}, {}, mongoose.Document<unknown, {}, ITask, {}, mongoose.DefaultSchemaOptions> & ITask & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ITask>;
export default _default;
//# sourceMappingURL=taskModel.d.ts.map