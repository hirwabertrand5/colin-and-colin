"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const FeeSpecSchema = new mongoose_1.Schema({
    type: { type: String, enum: ['fixed', 'range', 'percentage', 'text', 'included'], required: true },
    currency: { type: String },
    min: { type: Number },
    max: { type: Number },
    percentage: { type: Number },
    text: { type: String },
}, { _id: false });
const SlaSpecSchema = new mongoose_1.Schema({
    unit: { type: String, enum: ['hours', 'days', 'weeks'], required: true },
    min: { type: Number },
    max: { type: Number },
    text: { type: String },
}, { _id: false });
const LegalBasisSchema = new mongoose_1.Schema({ text: { type: String, required: true } }, { _id: false });
const OutputReqSchema = new mongoose_1.Schema({
    key: { type: String, required: true },
    name: { type: String, required: true },
    required: { type: Boolean, default: true },
    category: { type: String },
}, { _id: false });
const StepSchema = new mongoose_1.Schema({
    key: { type: String, required: true },
    order: { type: Number, required: true },
    title: { type: String, required: true },
    stageKey: { type: String, required: true },
    actions: { type: [String], default: [] },
    outputs: { type: [OutputReqSchema], default: [] },
    legalBasis: { type: [LegalBasisSchema], default: [] },
    fee: { type: FeeSpecSchema, required: false },
    sla: { type: SlaSpecSchema, required: false },
}, { _id: false });
const StageSchema = new mongoose_1.Schema({
    key: { type: String, required: true },
    order: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String },
}, { _id: false });
const WorkflowTemplateSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    matterType: { type: String, required: true, trim: true },
    caseType: {
        type: String,
        enum: ['Transactional Cases', 'Litigation Cases', 'Labor Cases'],
        required: true,
    },
    version: { type: Number, default: 1 },
    active: { type: Boolean, default: true },
    stages: { type: [StageSchema], default: [] },
    steps: { type: [StepSchema], default: [] },
}, { timestamps: true });
WorkflowTemplateSchema.index({ active: 1, matterType: 1 });
WorkflowTemplateSchema.index({ name: 1, version: 1 }, { unique: true });
exports.default = mongoose_1.default.model('WorkflowTemplate', WorkflowTemplateSchema);
//# sourceMappingURL=workflowTemplateModel.js.map