export type UrgencyColor = 'green' | 'yellow' | 'red' | 'gray';

export const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export const getDueRemainingRatio = (startAt?: Date | string, dueAt?: Date | string, now = new Date()) => {
  if (!startAt || !dueAt) return undefined;
  const s = startAt instanceof Date ? startAt : new Date(startAt);
  const d = dueAt instanceof Date ? dueAt : new Date(dueAt);
  const startMs = s.getTime();
  const dueMs = d.getTime();
  const nowMs = now.getTime();
  if (!Number.isFinite(startMs) || !Number.isFinite(dueMs)) return undefined;
  const total = Math.max(0, dueMs - startMs);
  if (total === 0) return nowMs <= dueMs ? 1 : 0;
  const remaining = dueMs - nowMs;
  return clamp01(remaining / total);
};

export const getUrgencyColorFromRatio = (ratio: number | undefined): UrgencyColor => {
  if (ratio === undefined) return 'gray';
  if (ratio > 0.5) return 'green';
  if (ratio > 0.25) return 'yellow';
  return 'red';
};

export const getUrgencyClass = (color: UrgencyColor) => {
  // Solid pills with white text for consistent emphasis
  if (color === 'green') return 'bg-green-600 text-white border-green-700';
  if (color === 'yellow') return 'bg-yellow-500 text-white border-yellow-600';
  if (color === 'red') return 'bg-red-600 text-white border-red-700';
  return 'bg-gray-500 text-white border-gray-600';
};

export const formatDueCountdown = (dueAt?: Date | string) => {
  if (!dueAt) return 'No deadline';
  const d = dueAt instanceof Date ? dueAt : new Date(dueAt);
  const ms = d.getTime();
  if (!Number.isFinite(ms)) return 'No deadline';
  const days = Math.ceil((ms - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days}d`;
};
