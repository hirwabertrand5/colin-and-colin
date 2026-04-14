"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const createNotification = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload.dedupeKey) {
        const exists = yield notificationModel_1.default.exists({ dedupeKey: payload.dedupeKey });
        if (exists)
            return null;
    }
    const doc = yield notificationModel_1.default.create({
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
});
exports.createNotification = createNotification;
const ensurePrefsExist = (userIds) => __awaiter(void 0, void 0, void 0, function* () {
    const unique = Array.from(new Set(userIds.map(String)));
    const existing = yield notificationPreferencesModel_1.default.find({ userId: { $in: unique } }).select('userId').lean();
    const existingSet = new Set(existing.map((d) => String(d.userId)));
    const missing = unique.filter((id) => !existingSet.has(String(id)));
    if (missing.length) {
        yield notificationPreferencesModel_1.default.insertMany(missing.map((id) => ({ userId: new mongoose_1.default.Types.ObjectId(id) })), { ordered: false }).catch(() => { });
    }
});
const notifyUsersById = (opts) => __awaiter(void 0, void 0, void 0, function* () {
    const ids = Array.from(new Set(opts.userIds.filter(Boolean).map(String)));
    if (!ids.length)
        return;
    yield (0, exports.createNotification)(Object.assign(Object.assign({}, opts.notification), { audienceUserIds: ids }));
    if (!opts.email)
        return;
    yield ensurePrefsExist(ids);
    const users = yield userModel_1.default.find({ _id: { $in: ids }, isActive: { $ne: false } }).select('_id email').lean();
    const prefs = yield notificationPreferencesModel_1.default.find({ userId: { $in: ids } }).lean();
    const prefMap = new Map(prefs.map((p) => [String(p.userId), p]));
    const recipients = users
        .filter((u) => prefAllows(prefMap.get(String(u._id)), opts.category))
        .map((u) => u.email)
        .filter(Boolean);
    if (!recipients.length)
        return;
    yield (0, emailResendService_1.sendEmailResend)(recipients, opts.email.subject, opts.email.html);
});
exports.notifyUsersById = notifyUsersById;
const notifyRoles = (opts) => __awaiter(void 0, void 0, void 0, function* () {
    const roles = Array.from(new Set(opts.roles.filter(Boolean)));
    if (!roles.length)
        return;
    // broadcast notification
    yield (0, exports.createNotification)(Object.assign(Object.assign({}, opts.notification), { audienceRoles: roles }));
    // email to all users in those roles (respect prefs)
    if (!opts.email)
        return;
    const users = yield userModel_1.default.find({ role: { $in: roles }, isActive: { $ne: false } }).select('_id email').lean();
    const userIds = users.map((u) => String(u._id));
    if (!userIds.length)
        return;
    yield ensurePrefsExist(userIds);
    const prefs = yield notificationPreferencesModel_1.default.find({ userId: { $in: userIds } }).lean();
    const prefMap = new Map(prefs.map((p) => [String(p.userId), p]));
    const recipients = users
        .filter((u) => prefAllows(prefMap.get(String(u._id)), opts.category))
        .map((u) => u.email)
        .filter(Boolean);
    if (!recipients.length)
        return;
    yield (0, emailResendService_1.sendEmailResend)(recipients, opts.email.subject, opts.email.html);
});
exports.notifyRoles = notifyRoles;
// helper: resolve user by assignee string (name or email)
const findUserByAssigneeString = (assignee) => __awaiter(void 0, void 0, void 0, function* () {
    const v = String(assignee || '').trim();
    if (!v)
        return null;
    // if looks like email
    if (v.includes('@')) {
        return userModel_1.default.findOne({ email: v.toLowerCase() }).select('_id name email role isActive').lean();
    }
    // else by exact name
    return userModel_1.default.findOne({ name: v }).select('_id name email role isActive').lean();
});
exports.findUserByAssigneeString = findUserByAssigneeString;
//# sourceMappingURL=notifyService.js.map