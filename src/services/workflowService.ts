const API_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem('token');

export type WorkflowTemplate = {
  _id: string;
  name: string;
  matterType: string;
  caseType: 'Transactional Cases' | 'Litigation Cases' | 'Labor Cases';
  version: number;
  active: boolean;
  stages: any[];
  steps: any[];
};

export const listActiveWorkflowTemplates = async (): Promise<WorkflowTemplate[]> => {
  const res = await fetch(`${API_URL}/workflows/templates/active`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to load workflow templates');
  return res.json();
};

export const listAllWorkflowTemplates = async (): Promise<WorkflowTemplate[]> => {
  const res = await fetch(`${API_URL}/workflows/templates`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to load workflow templates');
  return res.json();
};

export const createWorkflowTemplate = async (payload: Partial<WorkflowTemplate>): Promise<WorkflowTemplate> => {
  const res = await fetch(`${API_URL}/workflows/templates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to create template');
  return res.json();
};

export const updateWorkflowTemplate = async (templateId: string, payload: any): Promise<WorkflowTemplate> => {
  const res = await fetch(`${API_URL}/workflows/templates/${templateId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to update template');
  return res.json();
};

export const deleteWorkflowTemplate = async (templateId: string): Promise<void> => {
  const res = await fetch(`${API_URL}/workflows/templates/${templateId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete template');
};