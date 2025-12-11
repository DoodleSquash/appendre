// src/services/quizService.js
// Firebase Firestore quiz operations

import {
    collection,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { auth, firestore } from '@/firebase';

/**
 * Validate quiz data before saving
 */
function validateQuizData(data) {
    if (!data.title || data.title.trim() === '') {
        throw new Error('Quiz title is required');
    }

    if (!data.questions || data.questions.length === 0) {
        throw new Error('Quiz must have at least one question');
    }

    // Validate each question
    data.questions.forEach((q, index) => {
        if (!q.question || q.question.trim() === '') {
            throw new Error(`Question ${index + 1} text is required`);
        }

        if (!q.options || q.options.length < 2) {
            throw new Error(`Question ${index + 1} must have at least 2 options`);
        }

        if (q.correct_answer === undefined || q.correct_answer < 0 || q.correct_answer >= q.options.length) {
            throw new Error(`Question ${index + 1} has invalid correct answer index`);
        }
    });

    return true;
}

/**
 * Create a new quiz in Firestore
 * @param {Object} quizData - Quiz data
 * @returns {Promise<Object>} Created quiz with ID
 */
export async function createQuiz(quizData) {
    // Check authentication
    const user = auth.currentUser;
    if (!user) {
        throw new Error('You must be logged in to create a quiz');
    }

    // Validate quiz data
    validateQuizData(quizData);

    try {
        const quizzesRef = collection(firestore, 'quizzes');

        const quizToSave = {
            title: quizData.title,
            description: quizData.description || '',
            difficulty: quizData.difficulty || 'medium',
            category: quizData.category || 'general',
            createdBy: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            is_public: quizData.is_public !== undefined ? quizData.is_public : false,
            time_per_question: quizData.time_per_question || 20,
            questions: quizData.questions.map((q, index) => ({
                id: q.id || `q_${index + 1}`,
                text: q.question,
                options: q.options,
                correctIndex: q.correct_answer,
            }))
        };

        const docRef = await addDoc(quizzesRef, quizToSave);

        return {
            id: docRef.id,
            ...quizToSave
        };
    } catch (error) {
        console.error('Error creating quiz:', error);
        throw new Error(error.message || 'Failed to create quiz');
    }
}

/**
 * Get all quizzes for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of quizzes
 */
export async function getUserQuizzes(userId) {
    try {
        const quizzesRef = collection(firestore, 'quizzes');
        // Avoid composite index requirement by removing server-side orderBy
        // We'll sort client-side by createdAt desc
        const q = query(
            quizzesRef,
            where('createdBy', '==', userId)
        );

        const querySnapshot = await getDocs(q);
        const quizzes = [];

        querySnapshot.forEach((docSnap) => {
            quizzes.push({
                id: docSnap.id,
                ...docSnap.data()
            });
        });

        // Sort by createdAt desc on the client
        quizzes.sort((a, b) => {
            const ams = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const bms = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return bms - ams;
        });

        return quizzes;
    } catch (error) {
        console.error('Error fetching user quizzes:', error);
        throw new Error('Failed to fetch quizzes');
    }
}

/**
 * Get a quiz by ID
 * @param {string} quizId - Quiz ID
 * @returns {Promise<Object>} Quiz data
 */
export async function getQuizById(quizId) {
    try {
        const quizRef = doc(firestore, 'quizzes', quizId);
        const quizSnap = await getDoc(quizRef);

        if (!quizSnap.exists()) {
            throw new Error('Quiz not found');
        }

        const data = quizSnap.data();
        
        // Map Firestore storage format back to UI format for CreateQuiz editor
        return {
            id: quizSnap.id,
            title: data.title || '',
            description: data.description || '',
            difficulty: data.difficulty || 'medium',
            category: data.category || 'general',
            is_public: data.is_public || false,
            time_per_question: data.time_per_question || 20,
            questions: (data.questions || []).map((q) => ({
                id: q.id,
                question: q.text || q.question || '',
                type: q.type || 'multiple_choice',
                options: q.options || [],
                correct_answer: typeof q.correctIndex === 'number' ? q.correctIndex : (q.correct_answer || 0),
                time_limit: q.time_limit || data.time_per_question || 20,
                points: q.points || 1000
            }))
        };
    } catch (error) {
        console.error('Error fetching quiz:', error);
        throw new Error(error.message || 'Failed to fetch quiz');
    }
}

/**
 * Update an existing quiz
 * @param {string} quizId - Quiz ID
 * @param {Object} quizData - Updated quiz data
 * @returns {Promise<Object>} Updated quiz
 */
export async function updateQuiz(quizId, quizData) {
    // Check authentication
    const user = auth.currentUser;
    if (!user) {
        throw new Error('You must be logged in to update a quiz');
    }

    // Validate quiz data
    validateQuizData(quizData);

    try {
        const quizRef = doc(firestore, 'quizzes', quizId);

        // Check if quiz exists and user owns it
        const quizSnap = await getDoc(quizRef);
        if (!quizSnap.exists()) {
            throw new Error('Quiz not found');
        }

        if (quizSnap.data().createdBy !== user.uid) {
            throw new Error('You do not have permission to update this quiz');
        }

        const updateData = {
            title: quizData.title,
            description: quizData.description || '',
            difficulty: quizData.difficulty || 'medium',
            category: quizData.category || 'general',
            updatedAt: serverTimestamp(),
            is_public: quizData.is_public !== undefined ? quizData.is_public : false,
            time_per_question: quizData.time_per_question || 20,
            questions: quizData.questions.map((q, index) => ({
                id: q.id || `q_${index + 1}`,
                text: q.question,
                options: q.options,
                correctIndex: q.correct_answer,
            }))
        };

        await updateDoc(quizRef, updateData);

        return {
            id: quizId,
            ...updateData
        };
    } catch (error) {
        console.error('Error updating quiz:', error);
        throw new Error(error.message || 'Failed to update quiz');
    }
}

/**
 * Delete a quiz
 * @param {string} quizId - Quiz ID
 * @returns {Promise<void>}
 */
export async function deleteQuiz(quizId) {
    // Check authentication
    const user = auth.currentUser;
    if (!user) {
        throw new Error('You must be logged in to delete a quiz');
    }

    try {
        const quizRef = doc(firestore, 'quizzes', quizId);

        // Check if quiz exists and user owns it
        const quizSnap = await getDoc(quizRef);
        if (!quizSnap.exists()) {
            throw new Error('Quiz not found');
        }

        if (quizSnap.data().createdBy !== user.uid) {
            throw new Error('You do not have permission to delete this quiz');
        }

        await deleteDoc(quizRef);
    } catch (error) {
        console.error('Error deleting quiz:', error);
        throw new Error(error.message || 'Failed to delete quiz');
    }
}

/**
 * Get all public quizzes
 * @returns {Promise<Array>} Array of public quizzes
 */
export async function getPublicQuizzes() {
    try {
        const quizzesRef = collection(firestore, 'quizzes');
        // Avoid composite index requirement by removing server-side orderBy
        const q = query(
            quizzesRef,
            where('is_public', '==', true)
        );

        const querySnapshot = await getDocs(q);
        const quizzes = [];

        querySnapshot.forEach((doc) => {
            quizzes.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Sort by createdAt desc on the client
        quizzes.sort((a, b) => {
            const ams = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const bms = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return bms - ams;
        });

        return quizzes;
    } catch (error) {
        console.error('Error fetching public quizzes:', error);
        throw new Error('Failed to fetch public quizzes');
    }
}
