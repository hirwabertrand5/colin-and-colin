"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startReminderScheduler = exports.runReminderScan = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const mongoose_1 = __importDefault(require("mongoose"));
const taskModel_1 = __importDefault(require("../models/taskModel"));
const eventModel_1 = __importDefault(require("../models/eventModel"));
const caseModel_1 = __importDefault(require("../models/caseModel"));
const notifyService_1 = require("../services/notifyService");
const isoDate = (d) => d.toISOString().slice(0, 10);
const parseEventDateTime = (dateStr, timeStr) => {
    // date: YYYY-MM-DD, time: HH:mm
    // Treat as local time.
    const [y, m, d] = dateStr.split('-').map(Number);
    const [hh, mm] = timeStr.split(':').map(Number);
    return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
};
const hoursBetween = (a, b) => (b.getTime() - a.getTime()) / (1000 * 60 * 60);
const uniq = (arr) => Array.from(new Set(arr));
/**
 * Runs reminder scans and creates notifications/emails.
 * Safe to call repeatedly because notifyService uses dedupeKey.
 */
const runReminderScan = async () => {
    const now = new Date();
    // -----------------------------
    // Task due reminders (24h before due date)
    // Task.dueDate is YYYY-MM-DD
    // -----------------------------
    const tomorrowISO = isoDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
    // Only remind not completed
    const tasksDueTomorrow = await taskModel_1.default.find({
        status: { $ne: 'Completed' },
        dueDate: tomorrowISO,
    })
        .select('_id title dueDate assignee caseId')
        .lean();
    for (const t of tasksDueTomorrow) {
        const assignee = String(t.assignee || '').trim();
        if (!assignee)
            continue;
        const user = await (0, notifyService_1.findUserByAssigneeString)(assignee);
        if (!user?._id || user.isActive === false)
            continue;
        const dedupeKey = `TASK_DUE_24H:${String(t._id)}:${String(user._id)}:${tomorrowISO}`;
        await (0, notifyService_1.notifyUsersById)({
            userIds: [String(user._id)],
            category: 'deadlines',
            notification: {
                type: 'TASK_DUE_REMINDER',
                title: 'Task due tomorrow',
                message: `${t.title || 'Task'} is due on ${t.dueDate}.`,
                severity: 'warning',
                caseId: String(t.caseId),
                taskId: String(t._id),
                link: `/tasks/${t._id}`,
                dedupeKey,
            },
            email: {
                subject: `Reminder: Task due tomorrow — ${t.title || 'Task'}`,
                html: `<div style="font-family: Arial, sans-serif">
                <p>This is a reminder that a task is due tomorrow.</p>
                <p><b>${t.title || 'Task'}</b></p>
                <p>Due date: ${t.dueDate}</p>
              </div>`,
            },
        });
    }
    // -----------------------------
    // Event reminders (24h + 2h) for:
    //  C) both A and B:
    //   - Case.assignedTo user (by name/email mapping)
    //   - MD + Executive Assistant (roles)
    // -----------------------------
    // We look ahead 25h to include slight cron jitter, and dedupe.
    const eventsUpcoming = await eventModel_1.default.find({
        // naive range: today -> tomorrow + 1 day
        date: { $gte: isoDate(now), $lte: isoDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2)) },
    })
        .select('_id caseId title type date time')
        .lean();
    // Pull preferences for “eventReminderHours” is per user, but you requested fixed 24h + 2h.
    // We’ll still honor per-user prefs when sending email (deadlinesEnabled).
    const reminderHours = [24, 2];
    for (const e of eventsUpcoming) {
        const eventAt = parseEventDateTime(String(e.date), String(e.time));
        const hoursTo = hoursBetween(now, eventAt);
        // Only trigger near those windows (±0.25h)
        for (const h of reminderHours) {
            if (hoursTo < h - 0.25 || hoursTo > h + 0.25)
                continue;
            // Get case to find assignedTo
            const c = await caseModel_1.default.findById(e.caseId).select('assignedTo caseNo parties').lean();
            const caseLabel = c?.caseNo || c?.parties || '';
            // A) Case assignedTo
            const assignedTo = String(c?.assignedTo || '').trim();
            if (assignedTo) {
                const u = await (0, notifyService_1.findUserByAssigneeString)(assignedTo);
                if (u?._id && u.isActive !== false) {
                    const dedupeKey = `EVENT_${h}H:${String(e._id)}:${String(u._id)}`;
                    await (0, notifyService_1.notifyUsersById)({
                        userIds: [String(u._id)],
                        category: 'deadlines',
                        notification: {
                            type: 'EVENT_REMINDER',
                            title: `Event reminder (${h}h)`,
                            message: `${e.title || 'Event'} — ${caseLabel} at ${e.date} ${e.time}`,
                            severity: h <= 2 ? 'critical' : 'warning',
                            caseId: String(e.caseId),
                            eventId: String(e._id),
                            link: `/cases/${e.caseId}`, // you can adjust to a dedicated event view later
                            dedupeKey,
                        },
                        email: {
                            subject: `Reminder: ${e.title || 'Event'} in ${h} hours`,
                            html: `<div style="font-family: Arial, sans-serif">
                      <p>Reminder: <b>${e.title || 'Event'}</b> is scheduled in ${h} hours.</p>
                      <p><b>Case:</b> ${caseLabel}</p>
                      <p><b>When:</b> ${e.date} ${e.time}</p>
                    </div>`,
                        },
                    });
                }
            }
            // B) MD + Exec assistant roles
            const dedupeRoleKey = `EVENT_${h}H:ROLE:${String(e._id)}:${String(e.caseId)}`;
            await (0, notifyService_1.notifyRoles)({
                roles: ['managing_director', 'executive_assistant'],
                category: 'deadlines',
                notification: {
                    type: 'EVENT_REMINDER',
                    title: `Event reminder (${h}h)`,
                    message: `${e.title || 'Event'} — ${caseLabel} at ${e.date} ${e.time}`,
                    severity: h <= 2 ? 'critical' : 'warning',
                    caseId: String(e.caseId),
                    eventId: String(e._id),
                    link: `/cases/${e.caseId}`,
                    dedupeKey: dedupeRoleKey,
                },
                email: {
                    subject: `Reminder: ${e.title || 'Event'} in ${h} hours`,
                    html: `<div style="font-family: Arial, sans-serif">
                  <p>Reminder: <b>${e.title || 'Event'}</b> is scheduled in ${h} hours.</p>
                  <p><b>Case:</b> ${caseLabel}</p>
                  <p><b>When:</b> ${e.date} ${e.time}</p>
                </div>`,
                },
            });
        }
    }
};
exports.runReminderScan = runReminderScan;
/**
 * Starts the cron job.
 * Schedule: every 10 minutes.
 */
const startReminderScheduler = () => {
    // every 10 minutes
    node_cron_1.default.schedule('*/10 * * * *', async () => {
        try {
            // If DB disconnected, skip
            if (mongoose_1.default.connection.readyState !== 1)
                return;
            await (0, exports.runReminderScan)();
        }
        catch (e) {
            console.error('[reminderScheduler] error:', e?.message || e);
        }
    });
    console.log('[reminderScheduler] started (every 10 minutes)');
};
exports.startReminderScheduler = startReminderScheduler;
//# sourceMappingURL=reminderScheduler.js.map