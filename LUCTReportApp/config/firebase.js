// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';

// Firebase configuration from your Android client JSON
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

// Auth instance
export const auth = getAuth(app);

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