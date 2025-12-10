/**
 * Create a page URL for navigation
 */
export function createPageUrl(path) {
  // Convert PascalCase page names to lowercase routes
  // e.g., "CreateQuiz" -> "/create-quiz", "Dashboard" -> "/dashboard"
  const routePath = path
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
  
  return `/${routePath}`;
}

/**
 * Generate a 6-digit game code
 */
export function generateGameCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Format seconds to MM:SS format
 */
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate score percentage
 */
export function calculateScore(correct, total) {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

/**
 * Combine class names (simple version)
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Validate email format
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate game code format (6 characters alphanumeric)
 */
export function validateGameCode(code) {
  return /^[A-Z0-9]{6}$/.test(code.toUpperCase());
}

/**
 * Debounce function
 */
export function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Get initials from name
 */
export function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
