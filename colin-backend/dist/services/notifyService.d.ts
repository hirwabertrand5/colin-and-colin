import mongoose from 'mongoose';
type PrefCategory = 'deadlines' | 'taskAssignments' | 'approvals' | 'pettyCashLow';
export declare const createNotification: (payload: {
    type: string;
    title: string;
    message: string;
    severity?: "info" | "warning" | "critical";
    audienceUserIds?: string[];
    audienceRoles?: string[];
    link?: string;
    dedupeKey?: string;
    caseId?: string;
    taskId?: string;
    eventId?: string;
    fundId?: string;
    expenseId?: string;
}) => Promise<any>;
export declare const notifyUsersById: (opts: {
    userIds: string[];
    category: PrefCategory;
    notification: Omit<Parameters<typeof createNotification>[0], "audienceUserIds" | "audienceRoles">;
    email?: {
        subject: string;
        html: string;
    };
}) => Promise<void>;
export declare const notifyRoles: (opts: {
    roles: string[];
    category: PrefCategory;
    notification: Omit<Parameters<typeof createNotification>[0], "audienceUserIds" | "audienceRoles">;
    email?: {
        subject: string;
        html: string;
    };
}) => Promise<void>;
export declare const findUserByAssigneeString: (assignee: string) => Promise<(import("../models/userModel").IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export {};
//# sourceMappingURL=notifyService.d.ts.map