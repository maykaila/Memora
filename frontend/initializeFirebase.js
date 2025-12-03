// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
// import { getAnalytics } from "firebase/analytics"; // Uncomment if you need analytics

// --- 1. We ONLY import from "firebase/auth" ---
// We remove getFirestore, setDoc, and doc.
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

// needed for flashcards
import { getFirestore } from "firebase/firestore";

export const API_BASE_URL = "https://memora-api.dcism.org";

// Your web app's Firebase configuration (remains the same)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// changed to prevent multiple app initializations
// const analytics = getAnalytics(app);

// --- 2. We ONLY initialize auth ---
const auth = getAuth(app);
const db = getFirestore(app);

// --- 3. The custom 'signUp' function is REMOVED ---
// Why? Because your SignUpPage now has to do two things:
// 1. Create the user in Firebase Auth (client-side)
// 2. Call your ASP.NET backend to create the user profile (server-side)

// --- 4. We export the raw auth functions ---
// Your components will use these directly.
export { 
  app,
  auth,
  db, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  API_BASE_URL
};