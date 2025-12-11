// src/services/firebaseAuth.js
// Firebase Authentication helpers - Direct Firebase Auth without backend API

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '@/firebase';

/**
 * Create user profile in Firestore
 * @private
 */
async function createUserProfile(uid, userData) {
    const userRef = doc(firestore, 'users', uid);
    await setDoc(userRef, {
        uid,
        email: userData.email,
        full_name: userData.full_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    });
}

/**
 * Sign up a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} displayName - Optional display name
 * @returns {Promise<Object>} User object with uid, email, full_name, token
 */
export async function signup(email, password, displayName = '') {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Update profile with display name if provided
        if (displayName) {
            await updateProfile(userCredential.user, { displayName });
        }

        const token = await userCredential.user.getIdToken();
        const userData = {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            full_name: displayName || userCredential.user.email?.split('@')[0],
            token
        };

        // Create Firestore user profile (non-blocking - don't wait for it)
        createUserProfile(userData.uid, userData).catch(err => {
            console.error('Failed to create Firestore profile:', err);
            // Profile creation failed but user is still created in Firebase Auth
        });

        return userData;
    } catch (error) {
        console.error('Signup error:', error);
        throw error; // Throw original error to preserve error codes
    }
}

/**
 * Log in an existing user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object with uid, email, full_name, token
 */
export async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();

        return {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            full_name: userCredential.user.displayName || userCredential.user.email?.split('@')[0],
            token
        };
    } catch (error) {
        console.error('Login error:', error);
        throw new Error(error.message || 'Failed to log in');
    }
}

/**
 * Log out the current user
 * @returns {Promise<void>}
 */
export async function logout() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Logout error:', error);
        throw new Error(error.message || 'Failed to log out');
    }
}

/**
 * Observe authentication state changes
 * @param {Function} callback - Callback function that receives the user object or null
 * @returns {Function} Unsubscribe function
 */
export function observeAuthState(callback) {
    return onAuthStateChanged(auth, (user) => {
        if (user) {
            callback({
                uid: user.uid,
                email: user.email,
                full_name: user.displayName || user.email?.split('@')[0]
            });
        } else {
            callback(null);
        }
    });
}

/**
 * Get the current authenticated user
 * @returns {Object|null} User object or null if not authenticated
 */
export function getCurrentAuthUser() {
    const user = auth.currentUser;
    if (!user) return null;

    return {
        uid: user.uid,
        email: user.email,
        full_name: user.displayName || user.email?.split('@')[0]
    };
}

/**
 * Get user profile from Firestore
 * @param {string} uid - User ID
 * @returns {Promise<Object|null>} User profile object or null if not found
 */
export async function getUserProfile(uid) {
    try {
        const userRef = doc(firestore, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return null;
        }

        return {
            uid: userSnap.id,
            ...userSnap.data()
        };
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw new Error(error.message || 'Failed to fetch user profile');
    }
}
