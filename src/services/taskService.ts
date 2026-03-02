const API_URL = 'http://localhost:5000/api';

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