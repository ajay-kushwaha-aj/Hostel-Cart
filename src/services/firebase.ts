import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator, Functions } from 'firebase/functions';

// Read configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

// Check if valid credentials are provided
export const isDummyKey =
  !firebaseConfig.apiKey ||
  firebaseConfig.apiKey.includes('DummyKey') ||
  firebaseConfig.projectId.includes('hostelcart-pilot');

export const isFirebaseConfigured = !isDummyKey;

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let functions: Functions;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  auth = getAuth(app);
  db = getFirestore(app);
  functions = getFunctions(app, 'asia-south1'); // Standard region for India

  // Connect to Firebase Emulators if configured
  if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
    const authHost = import.meta.env.VITE_EMULATOR_AUTH_HOST || 'localhost';
    const authPort = Number(import.meta.env.VITE_EMULATOR_AUTH_PORT) || 9099;
    connectAuthEmulator(auth, `http://${authHost}:${authPort}`, { disableWarnings: true });

    const fsHost = import.meta.env.VITE_EMULATOR_FIRESTORE_HOST || 'localhost';
    const fsPort = Number(import.meta.env.VITE_EMULATOR_FIRESTORE_PORT) || 8080;
    connectFirestoreEmulator(db, fsHost, fsPort);

    const fnHost = import.meta.env.VITE_EMULATOR_FUNCTIONS_HOST || 'localhost';
    const fnPort = Number(import.meta.env.VITE_EMULATOR_FUNCTIONS_PORT) || 5001;
    connectFunctionsEmulator(functions, fnHost, fnPort);

    console.info('Connected to Firebase Emulators');
  }
} catch (error) {
  console.warn('Firebase initialization note:', error);
}

export { app, auth, db, functions };

