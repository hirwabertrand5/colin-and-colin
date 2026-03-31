const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');

const handleAuth = (res: Response) => {
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }
};

export type HelpCategory = { id: string; label: string };

export type HelpArticleListItem = {
  _id: string;
  title: string;
  description: string;
  category: string;
  type: 'Guide' | 'Tutorial' | 'Policy';
  updatedAt?: string;
};

export type HelpArticle = HelpArticleListItem & {
  contentMd: string;
};

export type HelpFaq = {
  _id: string;
  question: string;
  answer: string;
};

export const getHelpCategories = async (): Promise<HelpCategory[]> => {
  const res = await fetch(`${API_URL}/help/categories`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  handleAuth(res);
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to load categories');
  return res.json();
};

export const listHelpArticles = async (params?: { category?: string; q?: string }): Promise<HelpArticleListItem[]> => {
  const qs = new URLSearchParams();
  if (params?.category) qs.set('category', params.category);
  if (params?.q) qs.set('q', params.q);

  const res = await fetch(`${API_URL}/help/articles?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  handleAuth(res);
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to load articles');
  return res.json();
};

export const getHelpArticleById = async (id: string): Promise<HelpArticle> => {
  const res = await fetch(`${API_URL}/help/articles/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  handleAuth(res);
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to load article');
  return res.json();
};

export const listHelpFaqs = async (): Promise<HelpFaq[]> => {
  const res = await fetch(`${API_URL}/help/faqs`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  handleAuth(res);
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to load FAQs');
  return res.json();
};