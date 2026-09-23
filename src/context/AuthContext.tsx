import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, DEFAULT_ADMIN_EMAIL } from '../lib/firebase';

const isAuthorizedAdmin = (user: User | null, adminClaim: boolean): boolean => {
  const email = user?.email?.toLowerCase().trim();
  const configuredEmail = DEFAULT_ADMIN_EMAIL.toLowerCase().trim();

  return Boolean(adminClaim || (email && configuredEmail && email === configuredEmail));
};

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const token = await nextUser.getIdTokenResult();
        setIsAdmin(isAuthorizedAdmin(nextUser, token.claims.admin === true));
      } catch {
        setIsAdmin(isAuthorizedAdmin(nextUser, false));
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    isAdmin,
    signInWithPassword: async (password) => {
      if (!DEFAULT_ADMIN_EMAIL) {
        throw new Error('Admin email is not configured. Set VITE_ADMIN_EMAIL in Vercel.');
      }
      await signInWithEmailAndPassword(auth, DEFAULT_ADMIN_EMAIL, password);
    },
    sendAdminPasswordReset: async () => {
      if (!DEFAULT_ADMIN_EMAIL) {
        throw new Error('Admin email is not configured. Set VITE_ADMIN_EMAIL in Vercel.');
      }
      await sendPasswordResetEmail(auth, DEFAULT_ADMIN_EMAIL);
    },
    logout: async () => {
      await signOut(auth);
    },
  }), [isAdmin, loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
