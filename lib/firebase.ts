import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration with proper validation
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCaFRSfeZGvQFaaE8KzhPFsvag2hkIO6Ck",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "rydadmin-hub.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "rydadmin-hub",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "rydadmin-hub.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "20289389765",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:20289389765:web:89e94da7bf396fc946dcac",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-B69WZL3B7Y"
};

// Validate required configuration - don't fail during build
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn('Firebase configuration is missing required fields, using fallback values');
  // Don't throw during build, just use fallback values
}

// Initialize Firebase only if no apps exist
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

// Initialize Firebase services with error handling
let db, auth;
try {
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error('Firebase services initialization error:', error);
  throw error;
}

export { db, auth };
export default app;