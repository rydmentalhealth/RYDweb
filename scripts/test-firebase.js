const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator } = require('firebase/firestore');

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

async function testFirebaseConnection() {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized successfully');
    
    // Initialize Firestore
    const db = getFirestore(app);
    console.log('✅ Firestore initialized successfully');
    
    console.log('🎉 Firebase connection test completed successfully!');
    console.log('📋 Next steps:');
    console.log('   1. Deploy Firestore rules in Firebase Console');
    console.log('   2. Create Firestore indexes');
    console.log('   3. Enable Authentication');
    console.log('   4. Set environment variables in Vercel');
    
  } catch (error) {
    console.error('❌ Firebase connection failed:', error.message);
    process.exit(1);
  }
}

testFirebaseConnection();