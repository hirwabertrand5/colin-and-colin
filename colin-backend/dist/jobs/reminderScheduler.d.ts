/**
 * Runs reminder scans and creates notifications/emails.
 * Safe to call repeatedly because notifyService uses dedupeKey.
 */
export declare const runReminderScan: () => Promise<void>;
/**
 * Starts the cron job.
 * Schedule: every 10 minutes.
 */
export declare const startReminderScheduler: () => void;
//# sourceMappingURL=reminderScheduler.d.ts.map