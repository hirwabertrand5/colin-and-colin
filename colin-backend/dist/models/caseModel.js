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
const ClientContactSchema = new mongoose_1.Schema({
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    isPrimary: { type: Boolean, default: false },
}, { _id: false });
const CaseSchema = new mongoose_1.Schema({
    caseNo: { type: String, required: true, trim: true },
    parties: { type: String, required: true, trim: true },
    caseType: {
        type: String,
        enum: ['Transactional Cases', 'Litigation Cases', 'Labor Cases'],
        required: true,
        trim: true,
    },
    status: { type: String, default: 'On Boarding', trim: true },
    priority: { type: String, default: 'Medium', trim: true },
    assignedTo: { type: String, required: true, trim: true },
    description: { type: String },
    workflow: { type: String },
    estimatedDuration: { type: String },
    budget: { type: String },
    // ✅ SOP linkage
    matterType: { type: String, trim: true },
    workflowTemplateId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'WorkflowTemplate' },
    workflowInstanceId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'WorkflowInstance' },
    onboarding: {
        type: {
            engagementLetterSignedAt: { type: Date },
            conflictCheckStatus: {
                type: String,
                enum: ['Pending', 'Cleared', 'Flagged'],
                default: 'Pending',
            },
            conflictCheckedAt: { type: Date },
        },
        default: {},
    },
    workflowProgress: {
        type: {
            status: {
                type: String,
                enum: ['Not Started', 'In Progress', 'Completed'],
                default: 'Not Started',
            },
            currentStepKey: { type: String },
            percent: { type: Number, min: 0, max: 100, default: 0 },
        },
        default: {},
    },
    clientContacts: { type: [ClientContactSchema], default: [] },
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
}, { timestamps: true });
exports.default = mongoose_1.default.model('Case', CaseSchema);
//# sourceMappingURL=caseModel.js.map