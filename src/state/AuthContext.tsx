import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { GoogleAuthProvider, User, deleteUser, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { deleteDoc, doc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebaseClient';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  firebaseConfigured: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, nextUser => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsub;
  }, []);

  const loginWithGoogle = async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
  };

  const deleteAccount = async (): Promise<void> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const timerDocRef = doc(db, 'users', currentUser.uid, 'timer', 'main');
    const userDocRef = doc(db, 'users', currentUser.uid);

    await Promise.allSettled([
      deleteDoc(timerDocRef),
      deleteDoc(userDocRef)
    ]);
    await deleteUser(currentUser);
  };

  const value = useMemo(() => ({
    user,
    loading,
    firebaseConfigured: isFirebaseConfigured,
    loginWithGoogle,
    logout,
    deleteAccount
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
