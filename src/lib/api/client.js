import { auth } from '@/firebase';

const DEFAULT_BASE_URL =
  import.meta.env.VITE_FUNCTIONS_URL ||
  'https://us-central1-apprendre-61151.cloudfunctions.net/api';

async function getIdToken(forceRefresh = false) {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(forceRefresh);
}

async function fetchWithAuth(path, { method = 'GET', body, headers = {}, requireAuth = true } = {}) {
  let token = null;
  if (requireAuth) {
    token = await getIdToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
  }

  const res = await fetch(`${DEFAULT_BASE_URL}${path}`, {
    method,
    headers: {
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

/**
 * Usage examples:
 * const token = await getIdToken();
 * const data = await fetchWithAuth('/quizzes', { method: 'GET' });
 */

export { fetchWithAuth, getIdToken, DEFAULT_BASE_URL };




