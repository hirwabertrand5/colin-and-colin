const API_URL =
  import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';

export interface CaseEvent {
  _id?: string;
  caseId: string;
  title: string;
  type: string;
  date: string;
  time: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

const getToken = () => localStorage.getItem('token');

export const getEventsForCase = async (caseId: string): Promise<CaseEvent[]> => {
  const res = await fetch(`${API_URL}/cases/${caseId}/events`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch events');
  return res.json();
};

export const addEventToCase = async (caseId: string, event: CaseEvent): Promise<CaseEvent> => {
  const res = await fetch(`${API_URL}/cases/${caseId}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(event),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to create event');
  return res.json();
};

export const updateEvent = async (eventId: string, updates: Partial<CaseEvent>): Promise<CaseEvent> => {
  const res = await fetch(`${API_URL}/events/${eventId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to update event');
  return res.json();
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  const res = await fetch(`${API_URL}/events/${eventId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete event');
};