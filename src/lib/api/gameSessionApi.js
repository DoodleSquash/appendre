import { fetchWithAuth } from './client';
import { db } from '@/firebase';
import { doc, collection, onSnapshot, orderBy, query } from 'firebase/firestore';

export async function createGameSession(data) {
  return fetchWithAuth('/sessions', { method: 'POST', body: data });
}

export async function fetchGameSession(idOrCode) {
  return fetchWithAuth(`/sessions/${idOrCode}`, { method: 'GET' });
}

export async function joinGameSession(gameCode, playerData) {
  return fetchWithAuth(`/sessions/code/${gameCode}/join`, { method: 'POST', body: playerData });
}

export async function updateGameSession(id, data) {
  return fetchWithAuth(`/sessions/${id}`, { method: 'PATCH', body: data });
}

export async function submitAnswer(sessionId, answerData) {
  return fetchWithAuth(`/sessions/${sessionId}/answer`, { method: 'POST', body: answerData });
}

export async function fetchLeaderboard(sessionId) {
  return fetchWithAuth(`/sessions/${sessionId}/leaderboard`, { method: 'GET' });
}

export function onSessionSnapshot(sessionId, callback) {
  const ref = doc(db, 'sessions', sessionId);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    callback({ id: snap.id, ...snap.data() });
  });
}

export function onLeaderboardSnapshot(sessionId, callback) {
  const ref = collection(db, 'sessions', sessionId, 'players');
  const q = query(ref, orderBy('score', 'desc'));
  return onSnapshot(q, (snap) => {
    const players = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(players);
  });
}

/**
 * Usage:
 * const session = await createGameSession({ quiz_id });
 * await joinGameSession('ABC123', { name, email });
 * const s = await fetchGameSession(session.id);
 * await submitAnswer(session.id, { player_email, selected_answer, question_index, correct_answer, time_limit, time_left, base_points });
 * const lb = await fetchLeaderboard(session.id);
 * const unsub = onSessionSnapshot(session.id, (data) => console.log(data));
 * const unsubLb = onLeaderboardSnapshot(session.id, (players) => console.log(players));
 */
