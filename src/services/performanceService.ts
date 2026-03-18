// src/services/performanceService.ts
const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');

export type Task = {
  _id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Not Started' | 'In Progress' | 'Completed';
  dueDate: string; // YYYY-MM-DD
  createdAt?: string;
  updatedAt?: string;

  requiresApproval?: boolean;
  approvalStatus?: 'Not Required' | 'Pending' | 'Approved' | 'Rejected';

  estimatedHours?: number;
};

export type TimeLog = {
  _id: string;
  taskId: string;
  hours: number;
  loggedAt: string;
};

export type PerformanceSummary = {
  range: { from: string; to: string };
  tasksCompleted: number;
  tasksTotal: number;

  billableHours: number;

  onTimeCompletionPct: number; // 0-100

  monthly: { month: string; tasksCompleted: number; hours: number }[];

  byStatus: { label: string; completed: number; total: number; hours: number }[];
  byPriority: { label: string; completed: number; total: number; hours: number }[];
};

const apiGet = async <T>(path: string): Promise<T> => {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || 'Request failed');
  return data as T;
};

const monthKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export const getMyPerformance = async (params?: { from?: string; to?: string }): Promise<PerformanceSummary> => {
  // Default range: last 6 months
  const to = params?.to || new Date().toISOString().slice(0, 10);
  const from =
    params?.from ||
    (() => {
      const d = new Date();
      d.setMonth(d.getMonth() - 5);
      return d.toISOString().slice(0, 10);
    })();

  // 1) Get tasks visible to this user (backend already filters for non-MD)
  const tasks = await apiGet<Task[]>(`/tasks`);

  // 2) Filter to date range using dueDate (best available stable field)
  const inRangeTasks = tasks.filter((t) => t.dueDate >= from && t.dueDate <= to);

  // 3) Fetch time logs per task (MVP approach)
  const timeLogsByTask = new Map<string, number>();
  await Promise.all(
    inRangeTasks.map(async (t) => {
      try {
        const resp = await apiGet<{ logs: TimeLog[]; totalHours: number }>(`/tasks/${t._id}/time-logs`);
        timeLogsByTask.set(t._id, Number(resp.totalHours) || 0);
      } catch {
        // If no permission or error, treat as 0h
        timeLogsByTask.set(t._id, 0);
      }
    })
  );

  const hoursForTask = (taskId: string) => Number(timeLogsByTask.get(taskId) || 0);

  // 4) Completed tasks
  const completed = inRangeTasks.filter((t) => t.status === 'Completed');

  // 5) On-time completion (approx)
  // NOTE: You do NOT have completedAt in DB; we approximate completion date with updatedAt.
  const onTimeCount = completed.filter((t) => {
    const completionDate = (t.updatedAt || '').slice(0, 10);
    if (!completionDate) return false;
    return completionDate <= t.dueDate;
  }).length;

  const onTimePct = completed.length > 0 ? Math.round((onTimeCount / completed.length) * 100) : 0;

  // 6) Monthly aggregates (based on dueDate month)
  const monthlyMap = new Map<string, { month: string; tasksCompleted: number; hours: number }>();
  for (const t of inRangeTasks) {
    const dt = new Date(t.dueDate);
    const key = monthKey(dt);
    const row = monthlyMap.get(key) || { month: key, tasksCompleted: 0, hours: 0 };
    if (t.status === 'Completed') row.tasksCompleted += 1;
    row.hours += hoursForTask(t._id);
    monthlyMap.set(key, row);
  }
  const monthly = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));

  // 7) Breakdowns
  const byStatusLabels: Array<Task['status']> = ['Not Started', 'In Progress', 'Completed'];
  const byPriorityLabels: Array<Task['priority']> = ['High', 'Medium', 'Low'];

  const byStatus = byStatusLabels.map((label) => {
    const items = inRangeTasks.filter((t) => t.status === label);
    const completedItems = items.filter((t) => t.status === 'Completed').length; // will be 0 except Completed
    const hours = items.reduce((s, t) => s + hoursForTask(t._id), 0);
    return { label, completed: completedItems, total: items.length, hours: Math.round(hours * 10) / 10 };
  });

  const byPriority = byPriorityLabels.map((label) => {
    const items = inRangeTasks.filter((t) => t.priority === label);
    const completedItems = items.filter((t) => t.status === 'Completed').length;
    const hours = items.reduce((s, t) => s + hoursForTask(t._id), 0);
    return { label, completed: completedItems, total: items.length, hours: Math.round(hours * 10) / 10 };
  });

  const billableHours = inRangeTasks.reduce((s, t) => s + hoursForTask(t._id), 0);

  return {
    range: { from, to },
    tasksCompleted: completed.length,
    tasksTotal: inRangeTasks.length,
    billableHours: Math.round(billableHours * 10) / 10,
    onTimeCompletionPct: clamp(onTimePct, 0, 100),
    monthly,
    byStatus,
    byPriority,
  };
};