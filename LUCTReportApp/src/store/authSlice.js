//authSlice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  registerUser, 
  loginUser, 
  logRegistrationAttempt, 
  logLoginAttempt,
  resetPassword 
} from '../../src/services/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
const SESSION_STORAGE_KEY = '@session_start_time';

// Helper function to check session validity
const isSessionValid = async () => {
  try {
    const sessionStart = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionStart) return false;
    
    const now = Date.now();
    const sessionAge = now - parseInt(sessionStart);
    return sessionAge < SESSION_TIMEOUT;
  } catch (error) {
    console.error('Session check failed:', error);
    return false;
  }
};

const setSessionStart = async () => {
  await AsyncStorage.setItem(SESSION_STORAGE_KEY, Date.now().toString());
};

// Fetch users from Firestore
export const fetchUsers = createAsyncThunk(
  'auth/fetchUsers',
  async (filters = {}, { rejectWithValue }) => {
    try {
      
      const usersRef = collection(db, 'users');
      let q = query(usersRef);
      
      // Apply filters
      if (filters.role) {
        q = query(usersRef, where('role', '==', filters.role));
      }
      if (filters.department) {
        q = query(usersRef, where('department', '==', filters.department));
      }
      if (filters.stream) {
        q = query(usersRef, where('stream', '==', filters.stream));
      }
      if (filters.employeeId) {
        q = query(usersRef, where('employeeId', '==', filters.employeeId));
      }
      
      const snapshot = await getDocs(q);
      const users = [];
      snapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });
      
      return users;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch single user by ID
export const fetchUserById = createAsyncThunk(
  'auth/fetchUserById',
  async (userId, { rejectWithValue }) => {
    try {
      
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('uid', '==', userId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Try by employeeId 
        const q2 = query(usersRef, where('employeeId', '==', userId));
        const snapshot2 = await getDocs(q2);
        
        if (snapshot2.empty) {
          throw new Error('User not found');
        }
        
        const userDoc = snapshot2.docs[0];
        return { id: userDoc.id, ...userDoc.data() };
      }
      
      const userDoc = snapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//Fetch lecturers (users with role='lecturer')
export const fetchLecturers = createAsyncThunk(
  'auth/fetchLecturers',
  async (filters = {}, { rejectWithValue }) => {
    try {
      
      const usersRef = collection(db, 'users');
      const constraints = [where('role', '==', 'lecturer')];
      
      if (filters.department) {
        constraints.push(where('department', '==', filters.department));
      }
      if (filters.stream) {
        constraints.push(where('stream', '==', filters.stream));
      }
      if (filters.faculty) {
        constraints.push(where('faculty', '==', filters.faculty));
      }
      
      const q = query(usersRef, ...constraints);
      const snapshot = await getDocs(q);
      const lecturers = [];
      snapshot.forEach(doc => {
        lecturers.push({ id: doc.id, ...doc.data() });
      });
      return lecturers;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchStudentsCount = createAsyncThunk(
  'auth/fetchStudentsCount',
  async (_, { rejectWithValue }) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'student'));
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      await logLoginAttempt(email, null, false);
      const result = await loginUser(email, password);
      
      const userWithPhone = {
        ...result.user,
        phone: result.user?.phone || '',
      };
      
      await AsyncStorage.setItem('token', result.token);
      await AsyncStorage.setItem('user', JSON.stringify(userWithPhone));
      await setSessionStart();
      
      await logLoginAttempt(email, result.user.role, true);
      return { ...result, user: userWithPhone };
    } catch (error) {
      await logLoginAttempt(email, null, false, error.message);
      return rejectWithValue(error.message);
    }
  }
);

//async logout thunk
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await AsyncStorage.multiRemove(['token', 'user', SESSION_STORAGE_KEY]);
      dispatch(logout()); // Clear the synchronous state
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      if (!userData.name) throw new Error('Name is required');
      if (!userData.email) throw new Error('Email is required');
      if (!userData.password) throw new Error('Password is required');
      if (userData.password !== userData.confirmPassword) throw new Error('Passwords do not match');
      if (!userData.department) throw new Error('Department is required');
      
      if (userData.role === 'student' && !userData.studentId) {
        throw new Error('Student ID is required for student accounts');
      }
      if ((userData.role === 'lecturer' || userData.role === 'prl' || userData.role === 'pl') && !userData.employeeId) {
        throw new Error('Employee ID is required for staff accounts');
      }
      if (userData.role === 'prl' && !userData.stream) {
        throw new Error('Stream/Department is required for Principal Lecturers');
      }
      
      await logRegistrationAttempt(userData, false);
      const result = await registerUser(userData);
      
      const userWithPhone = {
        ...result.user,
        phone: userData.phone || '',
      };
      
      await AsyncStorage.setItem('token', result.token);
      await AsyncStorage.setItem('user', JSON.stringify(userWithPhone));
      await setSessionStart();
      
      await logRegistrationAttempt(userData, true);
      return { ...result, user: userWithPhone };
    } catch (error) {
      await logRegistrationAttempt(userData, false, error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const result = await resetPassword(email);
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resetPasswordThunk = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      return { success: true, message: 'Password reset via email link' };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadStoredUser = createAsyncThunk(
  'auth/loadStoredUser',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const validSession = await isSessionValid();
      
      if (!validSession) {
        await AsyncStorage.multiRemove(['token', 'user', SESSION_STORAGE_KEY]);
        return null;
      }
      
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        return { token, user };
      }
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const currentUser = auth.user;
      
      const updatedUser = {
        ...currentUser,
        ...profileData,
        phone: profileData.phone || currentUser?.phone || '',
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkSessionTimeout = createAsyncThunk(
  'auth/checkSessionTimeout',
  async (_, { getState, dispatch }) => {
    const { auth } = getState();
    if (auth.isAuthenticated && auth.user) {
      const isValid = await isSessionValid();
      if (!isValid) {
        dispatch(logoutUser()); // Use the thunk here too
        return true;
      }
    }
    return false;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    isInitialized: false,

    users: [],
    lecturers: [],
    selectedUser: null,
    usersLoading: false,
  },
  reducers: {
    // Pure reducer for state synchronization
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.users = [];
      state.lecturers = [];
      state.selectedUser = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    // Clear selected user
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => { 
        state.isLoading = true; 
        state.error = null; 
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Load Stored User
      .addCase(loadStoredUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadStoredUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        if (action.payload && action.payload.user) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      })
      .addCase(loadStoredUser.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
      })
      
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      //Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
      })
      
      // Fetch User By ID
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Lecturers
      .addCase(fetchLecturers.pending, (state) => {
        state.usersLoading = true;
      })
      .addCase(fetchLecturers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.lecturers = action.payload;
      })
      .addCase(fetchLecturers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
      })
      
      // Logout User
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

// Export actions
export const { logout, clearError, setUser, clearSelectedUser } = authSlice.actions;

// Selectors
export const selectUsers = (state) => state.auth?.users || [];
export const selectLecturers = (state) => state.auth?.lecturers || [];
export const selectSelectedUser = (state) => state.auth?.selectedUser || null;
export const selectUsersLoading = (state) => state.auth?.usersLoading || false;
export const selectIsAuthenticated = (state) => state.auth?.isAuthenticated || false;
export const selectCurrentUser = (state) => state.auth?.user || null;

export default authSlice.reducer;