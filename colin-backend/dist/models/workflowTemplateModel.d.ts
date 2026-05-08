import mongoose, { Document } from 'mongoose';
export type FeeType = 'fixed' | 'range' | 'percentage' | 'text' | 'included';
export interface IFeeSpec {
    type: FeeType;
    currency?: string;
    min?: number;
    max?: number;
    percentage?: number;
    text?: string;
}
export interface ISlaSpec {
    unit: 'hours' | 'days' | 'weeks';
    min?: number;
    max?: number;
    text?: string;
}
export interface ILegalBasisRef {
    text: string;
}
export interface IOutputRequirement {
    key: string;
    name: string;
    required: boolean;
    category?: string;
}
export interface IWorkflowStepTemplate {
    key: string;
    order: number;
    title: string;
    stageKey: string;
    actions: string[];
    outputs: IOutputRequirement[];
    legalBasis: ILegalBasisRef[];
    fee?: IFeeSpec;
    sla?: ISlaSpec;
}
export interface IWorkflowStageTemplate {
    key: string;
    order: number;
    title: string;
    description?: string;
}
export interface IWorkflowTemplate extends Document {
    name: string;
    matterType: string;
    caseType: 'Transactional Cases' | 'Litigation Cases' | 'Labor Cases';
    version: number;
    active: boolean;
    stages: IWorkflowStageTemplate[];
    steps: IWorkflowStepTemplate[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IWorkflowTemplate, {}, {}, {}, mongoose.Document<unknown, {}, IWorkflowTemplate, {}, mongoose.DefaultSchemaOptions> & IWorkflowTemplate & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IWorkflowTemplate>;
export default _default;
//# sourceMappingURL=workflowTemplateModel.d.ts.map