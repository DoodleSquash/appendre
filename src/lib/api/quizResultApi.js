import { fetchWithAuth } from './client';

export async function saveQuizResult(quizId, data) {
  return fetchWithAuth(`/quizzes/${quizId}/results`, { method: 'POST', body: data });
}

export async function fetchQuizResults(quizId) {
  return fetchWithAuth(`/quizzes/${quizId}/results`, { method: 'GET' });
}

export async function fetchUserResults(userUid) {
  return fetchWithAuth(`/users/${userUid}/results`, { method: 'GET' });
}

/**
 * Usage:
 * await saveQuizResult(quizId, payload);
 * const quizResults = await fetchQuizResults(quizId);
 * const myResults = await fetchUserResults(auth.currentUser.uid);
 */
