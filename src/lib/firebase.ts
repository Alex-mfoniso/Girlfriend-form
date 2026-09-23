import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Database ID (either custom Firestore database or default '(default)')
const configuredFirestoreDatabaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID?.trim();

// A Firestore database ID is normally '(default)' or a deliberately-created database name.
// Google Analytics measurement IDs begin with G- and must never be passed to getFirestore.
export const FIRESTORE_DATABASE_ID =
  configuredFirestoreDatabaseId && !/^G-[A-Z0-9]+$/i.test(configuredFirestoreDatabaseId)
    ? configuredFirestoreDatabaseId
    : '(default)';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Cloud Firestore using the designated database
export const db = FIRESTORE_DATABASE_ID && FIRESTORE_DATABASE_ID !== '(default)'
  ? getFirestore(app, FIRESTORE_DATABASE_ID)
  : getFirestore(app);

// Admin Configuration
export const DEFAULT_ADMIN_EMAIL =
  import.meta.env.VITE_ADMIN_EMAIL?.trim() || '';

export function getAuthorizedAdminEmails(): string[] {
  const envEmail = (import.meta.env.VITE_ADMIN_EMAIL as string | undefined)?.toLowerCase().trim();
  const storedEmails = localStorage.getItem('girlfriend_app_admin_emails');
  
  const emails = new Set<string>();
  if (DEFAULT_ADMIN_EMAIL) emails.add(DEFAULT_ADMIN_EMAIL.toLowerCase().trim());
  if (envEmail) emails.add(envEmail);
  
  if (storedEmails) {
    try {
      const parsed = JSON.parse(storedEmails);
      if (Array.isArray(parsed)) {
        parsed.forEach((e) => {
          if (typeof e === 'string' && e.trim()) {
            emails.add(e.toLowerCase().trim());
          }
        });
      }
    } catch {
      // ignore parsing error
    }
  }

  return Array.from(emails);
}

export function addAuthorizedAdminEmail(email: string): void {
  const current = getAuthorizedAdminEmails();
  const normalized = email.toLowerCase().trim();
  if (!current.includes(normalized)) {
    const updated = [...current, normalized];
    localStorage.setItem('girlfriend_app_admin_emails', JSON.stringify(updated));
  }
}
