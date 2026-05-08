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
const NotificationSchema = new mongoose_1.Schema({
    type: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
    audienceUserIds: { type: [mongoose_1.Schema.Types.ObjectId], ref: 'User', default: [], index: true },
    audienceRoles: { type: [String], default: [], index: true },
    link: { type: String },
    dedupeKey: { type: String, index: true },
    caseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Case' },
    taskId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Task' },
    eventId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Event' },
    fundId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'PettyCashFund' },
    expenseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'PettyCashExpense' },
    isReadBy: { type: [mongoose_1.Schema.Types.ObjectId], ref: 'User', default: [] },
}, { timestamps: true });
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
exports.default = mongoose_1.default.model('Notification', NotificationSchema);
//# sourceMappingURL=notificationModel.js.map