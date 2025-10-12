import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  role?: string;
  status?: string;
}

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    
    return {
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        role: userData?.role || 'STAFF',
        status: userData?.status || 'ACTIVE'
      }
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Create user with email and password
export const createUserWithEmail = async (
  email: string, 
  password: string, 
  displayName: string,
  role: string = 'STAFF',
  status: string = 'ACTIVE'
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the user's display name
    await updateProfile(user, {
      displayName: displayName
    });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName: displayName,
      role: role,
      status: status,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return {
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        role: role,
        status: status
      }
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Get additional user data from Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          role: userData?.role || 'STAFF',
          status: userData?.status || 'ACTIVE'
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          role: 'STAFF',
          status: 'ACTIVE'
        });
      }
    } else {
      callback(null);
    }
  });
};

// Send password reset email
export const sendPasswordReset = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Send email verification
export const sendEmailVerificationToUser = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      await sendEmailVerification(user);
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Update user profile in Firestore
export const updateUserProfile = async (uid: string, data: Partial<FirebaseUser>) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: new Date()
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};