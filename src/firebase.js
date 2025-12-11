// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCC69cfN4lwZTwBJNe7ytrK0vM5qKP3UIc",
  authDomain: "apprendre-61151.firebaseapp.com",
  projectId: "apprendre-61151",
  storageBucket: "apprendre-61151.firebasestorage.app",
  messagingSenderId: "108276468722",
  appId: "1:108276468722:web:9111255fc097208c38b96b",
  measurementId: "G-XF8SPBE0YG",
  databaseURL: "https://apprendre-61151-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services for frontend
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const realtimeDB = getDatabase(app);
export const storage = getStorage(app);

export default app;
