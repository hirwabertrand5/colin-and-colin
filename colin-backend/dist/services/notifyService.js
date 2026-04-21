"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByAssigneeString = exports.notifyRoles = exports.notifyUsersById = exports.createNotification = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const notificationModel_1 = __importDefault(require("../models/notificationModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const notificationPreferencesModel_1 = __importDefault(require("../models/notificationPreferencesModel"));
const emailResendService_1 = require("./emailResendService");
const prefAllows = (prefs, category) => {
    if (!prefs)
        return false;
    if (!prefs.emailEnabled)
        return false;
    if (category === 'deadlines')
        return Boolean(prefs.deadlinesEnabled);
    if (category === 'taskAssignments')
        return Boolean(prefs.taskAssignmentsEnabled);
    if (category === 'approvals')
        return Boolean(prefs.approvalsEnabled);
    if (category === 'pettyCashLow')
        return Boolean(prefs.pettyCashLowEnabled);
    return false;
};
const createNotification = async (payload) => {
    if (payload.dedupeKey) {
        const exists = await notificationModel_1.default.exists({ dedupeKey: payload.dedupeKey });
        if (exists)
            return null;
    }
    const doc = await notificationModel_1.default.create({
        type: payload.type,
        title: payload.title,
        message: payload.message,
        severity: payload.severity || 'info',
        audienceUserIds: (payload.audienceUserIds || []).map((id) => new mongoose_1.default.Types.ObjectId(id)),
        audienceRoles: payload.audienceRoles || [],
        link: payload.link,
        dedupeKey: payload.dedupeKey,
        caseId: payload.caseId ? new mongoose_1.default.Types.ObjectId(payload.caseId) : undefined,
        taskId: payload.taskId ? new mongoose_1.default.Types.ObjectId(payload.taskId) : undefined,
        eventId: payload.eventId ? new mongoose_1.default.Types.ObjectId(payload.eventId) : undefined,
        fundId: payload.fundId ? new mongoose_1.default.Types.ObjectId(payload.fundId) : undefined,
        expenseId: payload.expenseId ? new mongoose_1.default.Types.ObjectId(payload.expenseId) : undefined,
    });
    return doc.toObject();
};
exports.createNotification = createNotification;
const ensurePrefsExist = async (userIds) => {
    const unique = Array.from(new Set(userIds.map(String)));
    const existing = await notificationPreferencesModel_1.default.find({ userId: { $in: unique } }).select('userId').lean();
    const existingSet = new Set(existing.map((d) => String(d.userId)));
    const missing = unique.filter((id) => !existingSet.has(String(id)));
    if (missing.length) {
        await notificationPreferencesModel_1.default.insertMany(missing.map((id) => ({ userId: new mongoose_1.default.Types.ObjectId(id) })), { ordered: false }).catch(() => { });
    }
};
const notifyUsersById = async (opts) => {
    const ids = Array.from(new Set(opts.userIds.filter(Boolean).map(String)));
    if (!ids.length)
        return;
    await (0, exports.createNotification)({
        ...opts.notification,
        audienceUserIds: ids,
    });
    if (!opts.email)
        return;
    await ensurePrefsExist(ids);
    const users = await userModel_1.default.find({ _id: { $in: ids }, isActive: { $ne: false } }).select('_id email').lean();
    const prefs = await notificationPreferencesModel_1.default.find({ userId: { $in: ids } }).lean();
    const prefMap = new Map(prefs.map((p) => [String(p.userId), p]));
    const recipients = users
        .filter((u) => prefAllows(prefMap.get(String(u._id)), opts.category))
        .map((u) => u.email)
        .filter(Boolean);
    if (!recipients.length)
        return;
    await (0, emailResendService_1.sendEmailResend)(recipients, opts.email.subject, opts.email.html);
};
exports.notifyUsersById = notifyUsersById;
const notifyRoles = async (opts) => {
    const roles = Array.from(new Set(opts.roles.filter(Boolean)));
    if (!roles.length)
        return;
    // broadcast notification
    await (0, exports.createNotification)({
        ...opts.notification,
        audienceRoles: roles,
    });
    // email to all users in those roles (respect prefs)
    if (!opts.email)
        return;
    const users = await userModel_1.default.find({ role: { $in: roles }, isActive: { $ne: false } }).select('_id email').lean();
    const userIds = users.map((u) => String(u._id));
    if (!userIds.length)
        return;
    await ensurePrefsExist(userIds);
    const prefs = await notificationPreferencesModel_1.default.find({ userId: { $in: userIds } }).lean();
    const prefMap = new Map(prefs.map((p) => [String(p.userId), p]));
    const recipients = users
        .filter((u) => prefAllows(prefMap.get(String(u._id)), opts.category))
        .map((u) => u.email)
        .filter(Boolean);
    if (!recipients.length)
        return;
    await (0, emailResendService_1.sendEmailResend)(recipients, opts.email.subject, opts.email.html);
};
exports.notifyRoles = notifyRoles;
// helper: resolve user by assignee string (name or email)
const findUserByAssigneeString = async (assignee) => {
    const v = String(assignee || '').trim();
    if (!v)
        return null;
    // if looks like email
    if (v.includes('@')) {
        return userModel_1.default.findOne({ email: v.toLowerCase() }).select('_id name email role isActive').lean();
    }
    // else by exact name
    return userModel_1.default.findOne({ name: v }).select('_id name email role isActive').lean();
};
exports.findUserByAssigneeString = findUserByAssigneeString;
//# sourceMappingURL=notifyService.js.map