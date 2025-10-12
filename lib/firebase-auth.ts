import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { prisma } from '@/lib/db';
import { UserRole, UserStatus } from '@/lib/generated/prisma';

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
let auth, db;
try {
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase services initialization error:', error);
  throw error;
}

export { auth, db };

// Firebase Auth helper functions
export async function signInWithFirebase(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check if user exists in our database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        role: true,
        status: true,
      }
    });

    if (!dbUser) {
      throw new Error('User not found in database');
    }

    return {
      firebaseUser: user,
      dbUser: dbUser
    };
  } catch (error) {
    console.error('Firebase sign in error:', error);
    throw error;
  }
}

export async function createUserWithFirebase(
  email: string, 
  password: string, 
  firstName: string, 
  lastName: string,
  role: UserRole = 'USER'
) {
  try {
    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Create user in our database
    const dbUser = await prisma.user.create({
      data: {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        role,
        status: 'PENDING',
        password: null, // We don't store password in our DB when using Firebase
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        role: true,
        status: true,
      }
    });

    // Create user document in Firestore
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      email: firebaseUser.email,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      role,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      firebaseUser,
      dbUser
    };
  } catch (error) {
    console.error('Firebase user creation error:', error);
    throw error;
  }
}

export async function signOutFirebase() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Firebase sign out error:', error);
    throw error;
  }
}

// Create test accounts
export async function createTestAccounts() {
  const testAccounts = [
    {
      email: 'superadmin@rydadmin.com',
      password: 'SuperAdmin123!',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN' as UserRole,
      status: 'ACTIVE' as UserStatus
    },
    {
      email: 'admin@rydadmin.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN' as UserRole,
      status: 'ACTIVE' as UserStatus
    },
    {
      email: 'manager@rydadmin.com',
      password: 'Manager123!',
      firstName: 'Manager',
      lastName: 'User',
      role: 'MANAGER' as UserRole,
      status: 'ACTIVE' as UserStatus
    },
    {
      email: 'staff@rydadmin.com',
      password: 'Staff123!',
      firstName: 'Staff',
      lastName: 'User',
      role: 'STAFF' as UserRole,
      status: 'ACTIVE' as UserStatus
    },
    {
      email: 'pending@rydadmin.com',
      password: 'Pending123!',
      firstName: 'Pending',
      lastName: 'User',
      role: 'USER' as UserRole,
      status: 'PENDING' as UserStatus
    }
  ];

  const results = [];

  for (const account of testAccounts) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: account.email }
      });

      if (existingUser) {
        console.log(`User ${account.email} already exists, skipping...`);
        results.push({
          email: account.email,
          status: 'exists',
          message: 'User already exists'
        });
        continue;
      }

      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, account.email, account.password);
      const firebaseUser = userCredential.user;

      // Create user in our database
      const dbUser = await prisma.user.create({
        data: {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          firstName: account.firstName,
          lastName: account.lastName,
          name: `${account.firstName} ${account.lastName}`.trim(),
          role: account.role,
          status: account.status,
          password: null,
        }
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        email: firebaseUser.email,
        firstName: account.firstName,
        lastName: account.lastName,
        name: `${account.firstName} ${account.lastName}`.trim(),
        role: account.role,
        status: account.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      results.push({
        email: account.email,
        status: 'created',
        message: 'User created successfully',
        role: account.role,
        password: account.password
      });

      console.log(`Created test account: ${account.email} with role: ${account.role}`);
    } catch (error) {
      console.error(`Error creating account ${account.email}:`, error);
      results.push({
        email: account.email,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
}

export default app;