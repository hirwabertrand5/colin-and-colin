const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';
export interface Invoice {
  _id?: string;
  caseId: string;
  invoiceNo: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending';
  proofUrl?: string;
  notes?: string;
}

const getToken = () => localStorage.getItem('token');

export const getInvoicesForCase = async (caseId: string): Promise<Invoice[]> => {
  const res = await fetch(`${API_URL}/cases/${caseId}/invoices`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch invoices');
  return res.json();
};

export const addInvoiceToCase = async (
  caseId: string,
  invoice: { date: string; amount: number; notes?: string }
): Promise<Invoice> => {
  const res = await fetch(`${API_URL}/cases/${caseId}/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(invoice),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to create invoice');
  return res.json();
};

export const uploadProof = async (invoiceId: string, file: File): Promise<Invoice> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_URL}/invoices/${invoiceId}/proof`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to upload proof');
  return res.json();
};