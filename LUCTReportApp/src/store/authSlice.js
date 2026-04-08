// app/store/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  registerUser, 
  loginUser, 
  logRegistrationAttempt, 
  logLoginAttempt,
  resetPassword 
} from '../../src/services/firebase';

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

// Helper to store session start time
const setSessionStart = async () => {
  await AsyncStorage.setItem(SESSION_STORAGE_KEY, Date.now().toString());
};

// Helper to clear session
const clearSession = async () => {
  await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log('🔵 [auth] Login attempt for:', email);
      
      // Log attempt before login
      await logLoginAttempt(email, null, false);
      
      const result = await loginUser(email, password);
      
      // Ensure phone number is included in the user object
      const userWithPhone = {
        ...result.user,
        phone: result.user?.phone || '',
      };
      
      // Store in AsyncStorage
      await AsyncStorage.setItem('token', result.token);
      await AsyncStorage.setItem('user', JSON.stringify(userWithPhone));
      await setSessionStart(); // Set session start time
      
      // Log successful login
      await logLoginAttempt(email, result.user.role, true);
      
      console.log('✅ [auth] Login successful for:', email);
      return { ...result, user: userWithPhone };
    } catch (error) {
      console.error('❌ [auth] Login failed:', error.message);
      
      // Log failed login attempt
      await logLoginAttempt(email, null, false, error.message);
      
      return rejectWithValue(error.message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('🔵 [auth] Register attempt for:', userData.email);
      
      // Validate required fields (keep existing validation)
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
      await setSessionStart(); // Set session start time on registration as well
      
      await logRegistrationAttempt(userData, true);
      
      console.log('✅ [auth] Registration successful for:', userData.email);
      return { ...result, user: userWithPhone };
    } catch (error) {
      console.error('❌ [auth] Registration failed:', error.message);
      await logRegistrationAttempt(userData, false, error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      console.log('🔵 [auth] Forgot password attempt for:', email);
      const result = await resetPassword(email);
      console.log('✅ [auth] Password reset email sent');
      return result;
    } catch (error) {
      console.error('❌ [auth] Forgot password failed:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const resetPasswordThunk = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      console.log('🔵 [auth] Reset password attempt');
      return { success: true, message: 'Password reset via email link' };
    } catch (error) {
      console.error('❌ [auth] Reset password failed:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const loadStoredUser = createAsyncThunk(
  'auth/loadStoredUser',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      console.log('🔵 [auth] Loading stored user');
      
      // Check if session is still valid
      const validSession = await isSessionValid();
      
      if (!validSession) {
        console.log('⚠️ [auth] Session expired, clearing stored data');
        await AsyncStorage.multiRemove(['token', 'user', SESSION_STORAGE_KEY]);
        return null;
      }
      
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        console.log('✅ [auth] Stored user loaded:', user?.email);
        console.log('📞 [auth] Loaded phone number:', user?.phone);
        return { token, user };
      }
      
      console.log('ℹ️ [auth] No stored user found');
      return null;
    } catch (error) {
      console.error('❌ [auth] Failed to load stored user:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { getState, rejectWithValue }) => {
    try {
      console.log('🔵 [auth] Updating user profile:', profileData);
      
      const { auth } = getState();
      const currentUser = auth.user;
      
      const updatedUser = {
        ...currentUser,
        ...profileData,
        phone: profileData.phone || currentUser?.phone || '',
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      console.log('✅ [auth] Profile updated successfully');
      return updatedUser;
    } catch (error) {
      console.error('❌ [auth] Profile update failed:', error.message);
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
        console.log('⏰ [auth] Session timeout, logging out');
        dispatch(logout());
        return true; // Session expired
      }
    }
    return false; // Session still valid
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
  },
  reducers: {
    logout: (state) => {
      console.log('🔵 [auth] Logging out user:', state.user?.email);
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      // Clear AsyncStorage including session
      AsyncStorage.multiRemove(['token', 'user', SESSION_STORAGE_KEY]);
      console.log('✅ [auth] Logout successful');
    },
    clearError: (state) => {
      console.log('🔵 [auth] Clearing error');
      state.error = null;
    },
    setUser: (state, action) => {
      console.log('🔵 [auth] Setting user manually:', action.payload?.email);
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        console.log('🔄 [auth] Login pending');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log('✅ [auth] Login fulfilled');
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        console.log('❌ [auth] Login rejected:', action.payload);
        state.isLoading = false;
        state.error = action.payload;
      })
    
    // Register
    builder
      .addCase(register.pending, (state) => {
        console.log('🔄 [auth] Register pending');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        console.log('✅ [auth] Register fulfilled');
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        console.log('❌ [auth] Register rejected:', action.payload);
        state.isLoading = false;
        state.error = action.payload;
      })
    
    // Forgot Password
    builder
      .addCase(forgotPassword.pending, (state) => {
        console.log('🔄 [auth] Forgot password pending');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        console.log('✅ [auth] Forgot password fulfilled');
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        console.log('❌ [auth] Forgot password rejected:', action.payload);
        state.isLoading = false;
        state.error = action.payload;
      })
    
    // Reset Password
    builder
      .addCase(resetPasswordThunk.pending, (state) => {
        console.log('🔄 [auth] Reset password pending');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPasswordThunk.fulfilled, (state) => {
        console.log('✅ [auth] Reset password fulfilled');
        state.isLoading = false;
      })
      .addCase(resetPasswordThunk.rejected, (state, action) => {
        console.log('❌ [auth] Reset password rejected:', action.payload);
        state.isLoading = false;
        state.error = action.payload;
      })
    
    // Load Stored User - MODIFIED to NOT auto-authenticate
    builder
      .addCase(loadStoredUser.pending, (state) => {
        console.log('🔄 [auth] Load stored user pending');
        state.isLoading = true;
      })
      .addCase(loadStoredUser.fulfilled, (state, action) => {
        console.log('✅ [auth] Load stored user fulfilled');
        state.isLoading = false;
        state.isInitialized = true;
        // ONLY load user if session is valid AND we're not forcing login screen
        // But we'll handle the actual navigation in AppNavigator
        if (action.payload && action.payload.user) {
          // Store but don't set isAuthenticated yet
          // This allows the login screen to show first
          state.user = action.payload.user;
          state.token = action.payload.token;
          // We'll let the AppNavigator decide whether to auto-login
          // For now, keep isAuthenticated false to show login screen
          // state.isAuthenticated = false; // <- THIS IS KEY
        }
      })
      .addCase(loadStoredUser.rejected, (state) => {
        console.log('❌ [auth] Load stored user rejected');
        state.isLoading = false;
        state.isInitialized = true;
      })
    
    // Update User Profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        console.log('🔄 [auth] Update profile pending');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        console.log('✅ [auth] Update profile fulfilled');
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        console.log('❌ [auth] Update profile rejected:', action.payload);
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;