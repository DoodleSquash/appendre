import { fetchWithAuth } from './client';

export async function fetchQuizzes(params = {}) {
  const search = new URLSearchParams(params).toString();
  const data = await fetchWithAuth(`/quizzes${search ? `?${search}` : ''}`, { method: 'GET' });
  // Normalize to { items, total }
  if (Array.isArray(data)) {
    return { items: data, total: data.length };
  }
  return { items: data.items || [], total: data.total ?? data.items?.length ?? 0 };
}

export async function fetchQuizById(id) {
  return fetchWithAuth(`/quizzes/${id}`, { method: 'GET' });
}

export async function createQuiz(data) {
  return fetchWithAuth('/quizzes', { method: 'POST', body: data });
}

export async function updateQuiz(id, data) {
  return fetchWithAuth(`/quizzes/${id}`, { method: 'PATCH', body: data });
}

export async function deleteQuiz(id) {
  return fetchWithAuth(`/quizzes/${id}`, { method: 'DELETE' });
}

export async function generateQuizWithAI(params) {
  // AI is optional; will return server response or throw if not configured.
  return fetchWithAuth(`/quizzes/${params.quizId || 'ai'}/ai-generate`, { method: 'POST', body: params });
}

/**
 * Usage:
 * const list = await fetchQuizzes({ public: 1 });
 * const quiz = await fetchQuizById('abc');
 * await createQuiz({ title, questions: [...] });
 * await updateQuiz('abc', { title: 'New' });
 * await deleteQuiz('abc');
 */
