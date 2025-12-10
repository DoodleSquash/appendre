/**
 * Quiz API - Mock/Placeholder Functions
 * Frontend-only implementation for development
 * Replace with real API calls when backend is ready
 */

// Mock quiz data
const mockQuizzes = [
  {
    id: '1',
    title: 'General Knowledge Quiz',
    description: 'Test your general knowledge across various topics',
    category: 'general',
    difficulty: 'easy',
    questions: [
      {
        id: 'q1',
        question: 'What is the capital of France?',
        type: 'multiple_choice',
        options: ['London', 'Paris', 'Berlin', 'Madrid'],
        correct_answer: 1,
        time_limit: 20,
        points: 1000
      },
      {
        id: 'q2',
        question: 'What is 2 + 2?',
        type: 'multiple_choice',
        options: ['3', '4', '5', '6'],
        correct_answer: 1,
        time_limit: 15,
        points: 800
      }
    ],
    cover_image: null,
    time_per_question: 20,
    is_public: true,
    play_count: 42,
    source_type: 'manual',
    created_date: '2025-01-01T00:00:00Z',
    created_by: 'user@example.com'
  },
  {
    id: '2',
    title: 'Science Challenge',
    description: 'Test your science knowledge',
    category: 'science',
    difficulty: 'medium',
    questions: [
      {
        id: 'q1',
        question: 'What is the chemical symbol for water?',
        type: 'multiple_choice',
        options: ['H2O', 'CO2', 'O2', 'N2'],
        correct_answer: 0,
        time_limit: 20,
        points: 1000
      }
    ],
    cover_image: null,
    time_per_question: 25,
    is_public: true,
    play_count: 28,
    source_type: 'manual',
    created_date: '2025-01-02T00:00:00Z',
    created_by: 'user@example.com'
  }
];

/**
 * Fetch all quizzes
 * @returns {Promise<Array>}
 */
export async function fetchQuizzes() {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...mockQuizzes];
}

/**
 * Fetch quiz by ID
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function fetchQuizById(id) {
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockQuizzes.find(q => q.id === id) || null;
}

/**
 * Create new quiz
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function createQuiz(data) {
  await new Promise(resolve => setTimeout(resolve, 300));
  const newQuiz = {
    id: `quiz_${Date.now()}`,
    ...data,
    play_count: 0,
    created_date: new Date().toISOString(),
    created_by: 'user@example.com'
  };
  mockQuizzes.push(newQuiz);
  return newQuiz;
}

/**
 * Update quiz
 * @param {string} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateQuiz(id, data) {
  await new Promise(resolve => setTimeout(resolve, 300));
  const index = mockQuizzes.findIndex(q => q.id === id);
  if (index !== -1) {
    mockQuizzes[index] = { ...mockQuizzes[index], ...data };
    return mockQuizzes[index];
  }
  return { id, ...data };
}

/**
 * Delete quiz
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteQuiz(id) {
  await new Promise(resolve => setTimeout(resolve, 200));
  const index = mockQuizzes.findIndex(q => q.id === id);
  if (index !== -1) {
    mockQuizzes.splice(index, 1);
  }
  return true;
}

/**
 * Generate quiz with AI
 * @param {Object} params
 * @returns {Promise<Object>}
 */
export async function generateQuizWithAI(params) {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return {
    id: `ai_quiz_${Date.now()}`,
    title: params.topic || 'AI Generated Quiz',
    description: `A quiz about ${params.topic}`,
    category: params.category || 'general',
    difficulty: params.difficulty || 'medium',
    questions: [
      {
        id: 'q1',
        question: 'Sample AI generated question?',
        type: 'multiple_choice',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct_answer: 0,
        time_limit: 20,
        points: 1000
      }
    ],
    cover_image: null,
    time_per_question: 20,
    is_public: false,
    play_count: 0,
    source_type: 'ai',
    created_date: new Date().toISOString(),
    created_by: 'user@example.com'
  };
}
