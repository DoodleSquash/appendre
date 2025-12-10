/**
 * Game Session API - Mock/Placeholder Functions
 * Frontend-only implementation for development
 * Replace with real API calls when backend is ready
 */

// Mock sessions storage
const mockSessions = {};

/**
 * Generate unique game code
 * @returns {string}
 */
function generateGameCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Create game session
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function createGameSession(data) {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const gameCode = generateGameCode();
  const session = {
    id: `session_${Date.now()}`,
    quiz_id: data.quiz_id,
    host_email: data.host_email || 'user@example.com',
    game_code: gameCode,
    status: 'waiting',
    current_question_index: 0,
    question_start_time: null,
    players: [],
    settings: data.settings || {
      show_answers: true,
      shuffle_questions: false,
      shuffle_options: true
    },
    created_date: new Date().toISOString()
  };
  
  mockSessions[session.id] = session;
  mockSessions[gameCode] = session;
  
  return session;
}

/**
 * Fetch game session by ID or code
 * @param {string} idOrCode
 * @returns {Promise<Object|null>}
 */
export async function fetchGameSession(idOrCode) {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockSessions[idOrCode] || null;
}

/**
 * Join game session
 * @param {string} gameCode
 * @param {Object} playerData
 * @returns {Promise<Object>}
 */
export async function joinGameSession(gameCode, playerData) {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const session = mockSessions[gameCode];
  if (!session) {
    throw new Error('Game session not found');
  }
  
  const player = {
    id: `player_${Date.now()}_${Math.random()}`,
    name: playerData.name,
    email: playerData.email || null,
    score: 0,
    answers: [],
    joined_at: new Date().toISOString()
  };
  
  session.players.push(player);
  return { session, player };
}

/**
 * Update game session
 * @param {string} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateGameSession(id, data) {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const session = mockSessions[id];
  if (session) {
    Object.assign(session, data);
    return session;
  }
  
  return { id, ...data };
}

/**
 * Submit answer
 * @param {string} sessionId
 * @param {string} playerId
 * @param {Object} answerData
 * @returns {Promise<Object>}
 */
export async function submitAnswer(sessionId, playerId, answerData) {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const session = mockSessions[sessionId];
  if (session) {
    const player = session.players.find(p => p.id === playerId);
    if (player) {
      const isCorrect = true; // Mock: always correct
      const points = 1000;
      
      player.answers.push({
        ...answerData,
        is_correct: isCorrect,
        points
      });
      
      player.score += points;
      
      return { is_correct: isCorrect, points, player_score: player.score };
    }
  }
  
  return { is_correct: true, points: 1000, player_score: 1000 };
}

/**
 * Get leaderboard
 * @param {string} sessionId
 * @returns {Promise<Array>}
 */
export async function fetchLeaderboard(sessionId) {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const session = mockSessions[sessionId];
  if (session && session.players) {
    return [...session.players].sort((a, b) => b.score - a.score);
  }
  
  return [];
}
