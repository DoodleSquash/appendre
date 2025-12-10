/**
 * User API - Mock/Placeholder Functions
 * Frontend-only implementation for development
 * Replace with real API calls when backend is ready
 */

let currentUser = null;

/**
 * Check authentication status
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  await new Promise(resolve => setTimeout(resolve, 100));
  const token = localStorage.getItem('auth_token');
  return !!token;
}

/**
 * Get current user
 * @returns {Promise<Object>}
 */
export async function getCurrentUser() {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  if (currentUser) {
    return currentUser;
  }
  
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
    return currentUser;
  }
  
  throw new Error('Not authenticated');
}

/**
 * Login user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */
export async function loginUser(email, password) {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const user = {
    id: `user_${Date.now()}`,
    email,
    full_name: email.split('@')[0],
    created_date: new Date().toISOString()
  };
  
  const token = `mock_token_${Date.now()}`;
  localStorage.setItem('auth_token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  currentUser = user;
  return user;
}

/**
 * Logout user
 * @returns {Promise<void>}
 */
export async function logoutUser() {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  currentUser = null;
}

/**
 * Redirect to login page
 * @param {string} redirectPath
 */
export function redirectToLogin(redirectPath = '') {
  const loginUrl = redirectPath 
    ? `/login?redirect=${encodeURIComponent(redirectPath)}` 
    : '/login';
  window.location.href = loginUrl;
}
