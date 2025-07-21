'use client';

import { auth, db } from '@/lib/firebase';
import {
  OAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
  type UserCredential,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

// Clean up broken/duplicated interface and function code

type AuthContextType = {
  user: import('firebase/auth').User | null;
  loading: boolean;
  logout: () => Promise<void>;
  signInWithMicrosoft: () => Promise<UserCredential>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signInWithMicrosoft = async (): Promise<UserCredential> => {
    setLoading(true);
    try {
      const provider = new OAuthProvider('microsoft.com');
      // Optionally add scopes or custom params here
      const result = await signInWithPopup(auth, provider);
      return result;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Create or update user document in Firestore
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // Create new user document
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            display_name: user.displayName,
            role: 'clinician', // Default role
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
          });
        } else {
          // Update last login time
          await setDoc(
            userRef,
            {
              lastLoginAt: serverTimestamp(),
            },
            { merge: true }
          );
        }
      }
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await signOut(auth);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    logout,
    signInWithMicrosoft,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
