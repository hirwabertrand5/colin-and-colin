const API_URL =
  import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';

export interface CaseData {
  _id?: string;
  caseNo: string;
  parties: string;
  caseType: string;
  status: string;
  priority: string;
  assignedTo: string;
  description?: string;
  workflow?: string;
  estimatedDuration?: string;
  budget?: string;
  createdAt?: string;
  updatedAt?: string;
}

const getToken = () => localStorage.getItem('token');

export const getAllCases = async (): Promise<CaseData[]> => {
  const res = await fetch(`${API_URL}/cases`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch cases');
  return res.json();
};

export const createCase = async (caseData: CaseData): Promise<CaseData> => {
  const res = await fetch(`${API_URL}/cases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(caseData),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to create case');
  return res.json();
};

export const getCaseById = async (id: string): Promise<CaseData> => {
  const res = await fetch(`${API_URL}/cases/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch case');
  return res.json();
};

export const updateCase = async (caseId: string, updates: Partial<CaseData>): Promise<CaseData> => {
  const res = await fetch(`${API_URL}/cases/${caseId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to update case');
  return res.json();
};