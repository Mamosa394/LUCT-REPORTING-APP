// firebase
import { initializeApp } from 'firebase/app';
import { 
  initializeAuth, 
  getAuth,
  memoryPersistence,
  inMemoryPersistence 
} from 'firebase/auth'; 
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrv_30LrrF5RfJrforMXJZzAeYEMR8Mfg",
  authDomain: "luct-reporting-database.firebaseapp.com",
  projectId: "luct-reporting-database",
  storageBucket: "luct-reporting-database.firebasestorage.app",
  messagingSenderId: "612676312585",
  appId: "1:612676312585:android:ff638b819b70950285e2d8",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Safe Auth initialization - prevents "already-initialized" error
let auth;
try {
  // Try to initialize with memory persistence
  auth = initializeAuth(app, {
    persistence: memoryPersistence
  });
} catch (error) {
  if (error.code === 'auth/already-initialized') {
    // Auth already initialized, use the existing instance
    auth = getAuth(app);
  } else {
    throw error; // Re-throw if it's a different error
  }
}

export { auth };

// Firestore instance
export const db = getFirestore(app);

// Storage instance
export const storage = getStorage(app);

// Messaging (for push notifications)
export const getMessagingInstance = async () => {
  const supported = await isSupported();
  if (supported) {
    return getMessaging(app);
  }
  return null;
};

export default app;