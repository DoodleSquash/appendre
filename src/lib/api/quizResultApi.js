/**
 * Quiz Result API - Mock/Placeholder Functions
 * Frontend-only implementation for development
 * Replace with real API calls when backend is ready
 */

// Mock results storage
const mockResults = [];

/**
 * Save quiz result
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function saveQuizResult(data) {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const result = {
    id: `result_${Date.now()}`,
    ...data,
    created_date: new Date().toISOString()
  };
  
  mockResults.push(result);
  return result;
}

/**
 * Fetch quiz results
 * @param {string} quizId
 * @returns {Promise<Array>}
 */
export async function fetchQuizResults(quizId) {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  if (quizId) {
    return mockResults.filter(r => r.quiz_id === quizId);
  }
  
  return [...mockResults];
}

/**
 * Fetch user results
 * @param {string} userEmail
 * @returns {Promise<Array>}
 */
export async function fetchUserResults(userEmail) {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockResults.filter(r => r.player_email === userEmail);
}

/**
 * Update quiz result
 * @param {string} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateQuizResult(id, data) {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const index = mockResults.findIndex(r => r.id === id);
  if (index !== -1) {
    mockResults[index] = { ...mockResults[index], ...data };
    return mockResults[index];
  }
  
  return { id, ...data };
}
