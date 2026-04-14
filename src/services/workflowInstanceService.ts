const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');

export type WorkflowInstance = {
  _id: string;
  caseId: string;
  templateId: string;
  status: 'Active' | 'Completed';
  currentStepKey?: string;
  steps: Array<{
    stepKey: string;
    title: string;
    stageKey: string;
    order: number;
    status: 'Not Started' | 'In Progress' | 'Completed';
    dueAt?: string;
    completedAt?: string;
    outputs: Array<{
      key: string;
      name: string;
      required: boolean;
      category?: string;
      documentId?: string;
      uploadedAt?: string;
    }>;
  }>;
};

export const getWorkflowForCase = async (caseId: string): Promise<WorkflowInstance> => {
  const res = await fetch(`${API_URL}/workflows/cases/${caseId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to load workflow');
  return res.json();
};

export const completeWorkflowStep = async (caseId: string, stepKey: string): Promise<WorkflowInstance> => {
  const res = await fetch(`${API_URL}/workflows/cases/${caseId}/steps/${stepKey}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to complete step');
  return res.json();
};