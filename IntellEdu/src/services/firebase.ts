const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

export const firebaseAuthConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

export async function getFirebaseAuth() {
  if (!firebaseAuthConfigured) {
    throw new Error('Firebase Auth is not configured. Set the VITE_FIREBASE_* values in the frontend environment.');
  }

  const [firebaseApp, firebaseAuth] = await Promise.all([
    import('@firebase/app'),
    import('@firebase/auth'),
  ]);
  const app = firebaseApp.getApps()[0] ?? firebaseApp.initializeApp(firebaseConfig);
  return firebaseAuth.getAuth(app);
}
