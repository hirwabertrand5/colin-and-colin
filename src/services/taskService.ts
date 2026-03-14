const API_URL =
  import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';

export interface TaskData {
  _id?: string;
  caseId: string;
  title: string;
  priority: string;
  status: string;
  assignee: string;
  dueDate: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;

  // Approval workflow
  requiresApproval?: boolean;
  approvalStatus?: 'Not Required' | 'Pending' | 'Approved' | 'Rejected';
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  approvalComment?: string;

  // Time tracking (later)
  estimatedHours?: number;

  // Audit-ish snapshot
  assignedBy?: string;
}

const getToken = () => localStorage.getItem('token');

export const getTasksForCase = async (caseId: string): Promise<TaskData[]> => {
  const res = await fetch(`${API_URL}/cases/${caseId}/tasks`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch tasks');
  return res.json();
};

export const addTaskToCase = async (caseId: string, task: TaskData): Promise<TaskData> => {
  const res = await fetch(`${API_URL}/cases/${caseId}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to create task');
  return res.json();
};

export const updateTask = async (taskId: string, updates: Partial<TaskData>): Promise<TaskData> => {
  const res = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to update task');
  return res.json();
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const res = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete task');
};

// NOTE: only keep this if you actually implement this backend endpoint
export const getPendingApprovalsCount = async () => {
  const res = await fetch(`${API_URL}/tasks/stats/pending-approvals`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch pending approvals count');
  return res.json();
};

export const submitTaskForApproval = async (taskId: string): Promise<TaskData> => {
  const res = await fetch(`${API_URL}/tasks/${taskId}/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to submit task');
  return res.json();
};

export const approveTask = async (taskId: string, comment?: string): Promise<TaskData> => {
  const res = await fetch(`${API_URL}/tasks/${taskId}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ comment: comment || '' }),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to approve task');
  return res.json();
};

export const rejectTask = async (taskId: string, comment?: string): Promise<TaskData> => {
  const res = await fetch(`${API_URL}/tasks/${taskId}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ comment: comment || '' }),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to reject task');
  return res.json();
};

export const getAllTasks = async (params?: {
  q?: string;
  status?: string;
  priority?: string;
  approvalStatus?: string;
}): Promise<TaskData[]> => {
  const qs = new URLSearchParams();
  if (params?.q) qs.set('q', params.q);
  if (params?.status) qs.set('status', params.status);
  if (params?.priority) qs.set('priority', params.priority);
  if (params?.approvalStatus) qs.set('approvalStatus', params.approvalStatus);

  const res = await fetch(`${API_URL}/tasks?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch tasks');
  return res.json();
};

export const getTaskById = async (taskId: string): Promise<TaskData> => {
  const res = await fetch(`${API_URL}/tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch task');
  return res.json();
};

export const addChecklistItem = async (taskId: string, item: string): Promise<TaskData> => {
  const res = await fetch(`${API_URL}/tasks/${taskId}/checklist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ item }),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to add checklist item');
  return res.json();
};

export const toggleChecklistItem = async (taskId: string, itemId: string): Promise<TaskData> => {
  const res = await fetch(`${API_URL}/tasks/${taskId}/checklist/${itemId}/toggle`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to update checklist item');
  return res.json();
};

export const deleteChecklistItem = async (taskId: string, itemId: string): Promise<TaskData> => {
  const res = await fetch(`${API_URL}/tasks/${taskId}/checklist/${itemId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete checklist item');
  return res.json();
};

export type TimeLog = {
  _id: string;
  taskId: string;
  caseId: string;
  userName: string;
  hours: number;
  note?: string;
  loggedAt: string;
  createdAt: string;
};

export const getTimeLogsForTask = async (taskId: string): Promise<{ logs: TimeLog[]; totalHours: number }> => {
  const res = await fetch(`${API_URL}/tasks/${taskId}/time-logs`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch time logs');
  return res.json();
};

export const addTimeLogToTask = async (taskId: string, payload: { hours: number; note?: string; loggedAt?: string }) => {
  const res = await fetch(`${API_URL}/tasks/${taskId}/time-logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to log hours');
  return res.json();
};

export type TaskChecklistItem = {
  _id: string;
  item: string;
  completed: boolean;
};

export interface TaskData {
  _id?: string;
  caseId: string;
  title: string;
  priority: string;
  status: string;
  assignee: string;
  dueDate: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;

  requiresApproval?: boolean;
  approvalStatus?: 'Not Required' | 'Pending' | 'Approved' | 'Rejected';
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  approvalComment?: string;
  estimatedHours?: number;
  assignedBy?: string;

  
  checklist?: TaskChecklistItem[];
}