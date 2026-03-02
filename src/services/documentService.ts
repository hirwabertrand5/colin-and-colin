const API_URL = 'http://localhost:5000/api';

export interface CaseDocument {
  _id?: string;
  caseId: string;
  name: string;
  category: string;
  uploadedBy: string;
  uploadedDate: string;
  size: string;
  url: string;
}

const getToken = () => localStorage.getItem('token');

export const getDocumentsForCase = async (caseId: string): Promise<CaseDocument[]> => {
  const res = await fetch(`${API_URL}/cases/${caseId}/documents`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch documents');
  return res.json();
};

export const addDocumentToCase = async (
  caseId: string,
  doc: { name: string; category: string; file: File }
): Promise<CaseDocument> => {
  const formData = new FormData();
  formData.append('name', doc.name);
  formData.append('category', doc.category);
  formData.append('file', doc.file);

  const res = await fetch(`${API_URL}/cases/${caseId}/documents`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to create document');
  return res.json();
};

export const deleteDocument = async (docId: string): Promise<void> => {
  const res = await fetch(`${API_URL}/documents/${docId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete document');
};