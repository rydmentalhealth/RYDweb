import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { prisma } from '@/lib/db';
import { UserRole, UserStatus } from '@/lib/generated/prisma';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

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