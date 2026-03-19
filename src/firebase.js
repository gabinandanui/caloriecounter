// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_APIKEY,
  authDomain: import.meta.env.VITE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_PROJECTID,
  storageBucket: import.meta.env.VITE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_APPID,
  measurementId: import.meta.env.VITE_MEASUREMENTID
};

// Initialize Firebase variables
let auth = null;
let googleProvider = null;

try {
  // Only initialize if we have a valid projectId and it's not the placeholder
  if (firebaseConfig.projectId && firebaseConfig.projectId !== "your_firebase_projectid_here") {
    const app = initializeApp(firebaseConfig);
    getAnalytics(app); // We don't necessarily need to export this
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    console.log("Firebase initialized successfully.");
  } else {
    console.warn("Firebase configuration is missing or incomplete. Some features will be disabled.");
    // Mocking auth behavior for local development/testing without keys
    auth = {
      onAuthStateChanged: (callback) => {
        // Option 1: Unlogged user (default)
        callback(null);
        
        // Option 2: AUTO-LOGIN MOCK USER (Uncomment next line to bypass login)
        // callback({ uid: 'mock-user-123', displayName: 'Mock Developer' });
        
        return () => {}; // return cleanup function
      }
    };
  }
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export { auth, googleProvider };