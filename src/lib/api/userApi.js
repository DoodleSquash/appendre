import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/firebase';
import { fetchWithAuth, getIdToken } from './client';

export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const token = await cred.user.getIdToken();
  return {
    uid: cred.user.uid,
    email: cred.user.email,
    full_name: cred.user.displayName || cred.user.email?.split('@')[0],
    token
  };
}

export async function signupUser(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  const token = await cred.user.getIdToken();
  return {
    uid: cred.user.uid,
    email: cred.user.email,
    full_name: displayName || cred.user.email?.split('@')[0],
    token
  };
}

export async function logoutUser() {
  await signOut(auth);
}

export async function getCurrentUser() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  await user.reload();
  return {
    uid: user.uid,
    email: user.email,
    full_name: user.displayName || user.email?.split('@')[0]
  };
}

export async function getIdTokenCached(forceRefresh = false) {
  return getIdToken(forceRefresh);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function fetchProfile() {
  return fetchWithAuth('/auth/profile', { method: 'POST' });
}

export function isAuthenticated() {
  return auth.currentUser !== null;
}

export function redirectToLogin(redirectPath = '') {
  const loginUrl = redirectPath
    ? `/login?redirect=${encodeURIComponent(redirectPath)}`
    : '/login';
  window.location.href = loginUrl;
}

/**
 * Usage:
 * await signupUser('a@b.com','pass','Name');
 * await loginUser('a@b.com','pass');
 * const profile = await fetchProfile();
 * const token = await getIdTokenCached();
 * await logoutUser();
 */

