import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaFRSfeZGvQFaaE8KzhPFsvag2hkIO6Ck",
  authDomain: "rydadmin-hub.firebaseapp.com",
  projectId: "rydadmin-hub",
  storageBucket: "rydadmin-hub.firebasestorage.app",
  messagingSenderId: "20289389765",
  appId: "1:20289389765:web:89e94da7bf396fc946dcac",
  measurementId: "G-B69WZL3B7Y"
};

// Initialize Firebase only on client side
let app: any = null;
let auth: any = null;
let db: any = null;

if (typeof window !== 'undefined') {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // Connect to emulators in development
    if (process.env.NODE_ENV === 'development') {
      try {
        connectAuthEmulator(auth, "http://localhost:9099");
        connectFirestoreEmulator(db, 'localhost', 8080);
      } catch (error) {
        // Emulators might already be connected
        console.log('Firebase emulators already connected or not available');
      }
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

export { auth, db };
export default app;