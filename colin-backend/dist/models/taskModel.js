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
const TaskChecklistItemSchema = new mongoose_1.Schema({
    item: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
}, { _id: true });
const TaskSchema = new mongoose_1.Schema({
    caseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
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
    dueDate: { type: String, required: true },
    description: { type: String },
    requiresApproval: { type: Boolean, default: false },
    approvalStatus: {
        type: String,
        enum: ['Not Required', 'Draft', 'Pending', 'Approved', 'Rejected'],
        default: 'Not Required',
        index: true,
    },
    submittedAt: { type: Date },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    completedAt: { type: Date },
    approvedBy: { type: String },
    approvalComment: { type: String },
    estimatedHours: { type: Number, min: 0 },
    checklist: { type: [TaskChecklistItemSchema], default: [] },
    assignedBy: { type: String },
}, { timestamps: true });
exports.default = mongoose_1.default.model('Task', TaskSchema);
//# sourceMappingURL=taskModel.js.map