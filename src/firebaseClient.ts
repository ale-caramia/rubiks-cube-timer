import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey
  && firebaseConfig.authDomain
  && firebaseConfig.projectId
  && firebaseConfig.appId
);

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

let firestoreDb;
const enableAutoLongPolling = import.meta.env.VITE_FIRESTORE_AUTO_LONG_POLLING === 'true';

try {
  // Long polling can trigger blocked requests with ad blockers; keep it opt-in.
  firestoreDb = initializeFirestore(firebaseApp, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    experimentalAutoDetectLongPolling: enableAutoLongPolling
  });
} catch {
  firestoreDb = getFirestore(firebaseApp);
}

export const db = firestoreDb;
