const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');

export type AuditLogItem = {
  _id: string;
  caseId: string;
  actorName: string;
  action: string;
  message: string;
  detail?: string;
  createdAt: string;
};

export const getAuditForCase = async (caseId: string): Promise<AuditLogItem[]> => {
  const res = await fetch(`${API_URL}/cases/${caseId}/audit`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to load audit log');
  return res.json();
};