import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { GoogleAuthProvider, User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebaseClient';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  firebaseConfigured: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
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

  const value = useMemo(() => ({
    user,
    loading,
    firebaseConfigured: isFirebaseConfigured,
    loginWithGoogle,
    logout
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
