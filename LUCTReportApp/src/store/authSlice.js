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

const setSessionStart = async () => {
  await AsyncStorage.setItem(SESSION_STORAGE_KEY, Date.now().toString());
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log('🔵 [auth] Login attempt for:', email);
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
      console.log('✅ [auth] Login successful for:', email);
      return { ...result, user: userWithPhone };
    } catch (error) {
      console.error('❌ [auth] Login failed:', error.message);
      await logLoginAttempt(email, null, false, error.message);
      return rejectWithValue(error.message);
    }
  }
);

// RECOMMENDED FIX: Create an async logout thunk
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      console.log('🔵 [auth] Executing async logout cleanup');
      await AsyncStorage.multiRemove(['token', 'user', SESSION_STORAGE_KEY]);
      dispatch(logout()); // Clear the synchronous state
      console.log('✅ [auth] Async logout successful');
      return true;
    } catch (error) {
      console.error('❌ [auth] Logout storage cleanup failed:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('🔵 [auth] Register attempt for:', userData.email);
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
        return { token, user };
      }
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
  },
  reducers: {
    // Pure reducer for state synchronization
    logout: (state) => {
      console.log('🔵 [auth] Reseting auth state');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.isLoading = true; state.error = null; })
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
      .addCase(loadStoredUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        if (action.payload && action.payload.user) {
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
      })
      .addCase(loadStoredUser.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;