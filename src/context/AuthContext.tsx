import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

const ADMIN_EMAIL = 'alexandermfoniso18@gmail.com';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithPassword: (password: string) => Promise<void>;
  sendAdminPasswordReset: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    isAdmin: user?.email?.toLowerCase() === ADMIN_EMAIL,
    signInWithPassword: async (password) => {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
    },
    sendAdminPasswordReset: async () => {
      await sendPasswordResetEmail(auth, ADMIN_EMAIL);
    },
    logout: async () => {
      await signOut(auth);
    },
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
