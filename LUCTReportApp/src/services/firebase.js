import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, addDoc, query, orderBy, getDocs, limit } from 'firebase/firestore';

// Your Firebase configuration
// IMPORTANT: Replace this with your actual Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDrv_30LrrF5RfJrforMXJZzAeYEMR8Mfg",
  authDomain: "luct-reporting-database.firebaseapp.com",
  projectId: "luct-reporting-database",
  storageBucket: "luct-reporting-database.firebasestorage.app",
  messagingSenderId: "612676312585",
  appId: "1:612676312585:android:ff638b819b70950285e2d8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

console.log('🔥 [Firebase] Firebase initialized successfully');

// Helper function to register user with role
const registerUser = async (userData) => {
  try {
    console.log('🔵 [Firebase] Registering user:', userData.email);
    
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userData.email, 
      userData.password
    );
    
    const user = userCredential.user;
    console.log('✅ [Firebase] User created in Auth:', user.uid);
    
    // Update profile with display name
    await updateProfile(user, {
      displayName: userData.name
    });
    
    // Prepare user data for Firestore
    const userFirestoreData = {
      uid: user.uid,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      department: userData.department,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Add role-specific fields
    if (userData.role === 'student') {
      userFirestoreData.studentId = userData.studentId;
    } else if (['lecturer', 'prl', 'pl'].includes(userData.role)) {
      userFirestoreData.employeeId = userData.employeeId;
    }
    
    if (userData.role === 'prl') {
      userFirestoreData.stream = userData.stream;
    }
    
    // Save user data to Firestore
    await setDoc(doc(db, 'users', user.uid), userFirestoreData);
    console.log('✅ [Firebase] User data saved to Firestore');
    
    // Return formatted user data
    return {
      token: await user.getIdToken(),
      user: {
        uid: user.uid,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        department: userData.department,
        studentId: userData.studentId,
        employeeId: userData.employeeId,
        stream: userData.stream,
      }
    };
  } catch (error) {
    console.error('❌ [Firebase] Registration error:', error.code, error.message);
    throw error;
  }
};

// Helper function to login user
const loginUser = async (email, password) => {
  try {
    console.log('🔵 [Firebase] Logging in user:', email);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User data not found in database');
    }
    
    const userData = userDoc.data();
    console.log('✅ [Firebase] User logged in successfully:', user.uid);
    
    return {
      token: await user.getIdToken(),
      user: {
        uid: user.uid,
        name: userData.name,
        email: user.email,
        role: userData.role,
        department: userData.department,
        studentId: userData.studentId,
        employeeId: userData.employeeId,
        stream: userData.stream,
      }
    };
  } catch (error) {
    console.error('❌ [Firebase] Login error:', error.code, error.message);
    throw error;
  }
};

// Helper function to log registration attempt
const logRegistrationAttempt = async (userData, success, errorMessage = null) => {
  try {
    const logData = {
      timestamp: new Date().toISOString(),
      email: userData.email,
      role: userData.role,
      name: userData.name,
      success: success,
      errorMessage: errorMessage,
    };
    
    await addDoc(collection(db, 'registration_logs'), logData);
    console.log('📝 [Firebase] Registration logged:', { email: userData.email, success });
  } catch (err) {
    console.error('❌ [Firebase] Failed to log registration:', err);
  }
};

// Helper function to log login attempt
const logLoginAttempt = async (email, role, success, errorMessage = null) => {
  try {
    const logData = {
      timestamp: new Date().toISOString(),
      email: email,
      role: role || 'unknown',
      success: success,
      errorMessage: errorMessage,
    };
    
    await addDoc(collection(db, 'login_logs'), logData);
    console.log('📝 [Firebase] Login logged:', { email, success });
  } catch (err) {
    console.error('❌ [Firebase] Failed to log login:', err);
  }
};

// Helper function to get recent registrations (for admin)
const getRecentRegistrations = async (limitCount = 10) => {
  try {
    const q = query(
      collection(db, 'registration_logs'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('❌ [Firebase] Failed to get registrations:', error);
    return [];
  }
};

// Helper function to get recent logins (for admin)
const getRecentLogins = async (limitCount = 10) => {
  try {
    const q = query(
      collection(db, 'login_logs'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('❌ [Firebase] Failed to get logins:', error);
    return [];
  }
};

// Helper function to get all users (for admin)
const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('❌ [Firebase] Failed to get users:', error);
    return [];
  }
};

// Helper function to send password reset email
const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('✅ [Firebase] Password reset email sent to:', email);
    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    console.error('❌ [Firebase] Password reset error:', error.code, error.message);
    throw error;
  }
};

export {
  auth,
  db,
  registerUser,
  loginUser,
  logRegistrationAttempt,
  logLoginAttempt,
  getRecentRegistrations,
  getRecentLogins,
  getAllUsers,
  resetPassword,
};