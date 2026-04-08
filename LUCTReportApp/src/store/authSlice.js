import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  registerUser, 
  loginUser, 
  logRegistrationAttempt, 
  logLoginAttempt,
  resetPassword 
} from '../../src/services/firebase';

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
        phone: result.user?.phone || '', // Add phone field if missing
      };
      
      // Store in AsyncStorage
      await AsyncStorage.setItem('token', result.token);
      await AsyncStorage.setItem('user', JSON.stringify(userWithPhone));
      
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
      console.log('📦 [auth] Register data:', { 
        ...userData, 
        password: '***',
        confirmPassword: '***'
      });
      
      // Validate required fields
      if (!userData.name) {
        throw new Error('Name is required');
      }
      if (!userData.email) {
        throw new Error('Email is required');
      }
      if (!userData.password) {
        throw new Error('Password is required');
      }
      if (userData.password !== userData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (!userData.department) {
        throw new Error('Department is required');
      }
      
      // Role-specific validation
      if (userData.role === 'student' && !userData.studentId) {
        throw new Error('Student ID is required for student accounts');
      }
      if ((userData.role === 'lecturer' || userData.role === 'prl' || userData.role === 'pl') && !userData.employeeId) {
        throw new Error('Employee ID is required for staff accounts');
      }
      if (userData.role === 'prl' && !userData.stream) {
        throw new Error('Stream/Department is required for Principal Lecturers');
      }
      
      // Log attempt before registration
      await logRegistrationAttempt(userData, false);
      
      const result = await registerUser(userData);
      
      // Ensure phone number is included in the user object from registration data
      const userWithPhone = {
        ...result.user,
        phone: userData.phone || '', // Include phone from registration form
      };
      
      // Store in AsyncStorage
      await AsyncStorage.setItem('token', result.token);
      await AsyncStorage.setItem('user', JSON.stringify(userWithPhone));
      
      // Log successful registration
      await logRegistrationAttempt(userData, true);
      
      console.log('✅ [auth] Registration successful for:', userData.email);
      return { ...result, user: userWithPhone };
    } catch (error) {
      console.error('❌ [auth] Registration failed:', error.message);
      
      // Log failed registration
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
      // Note: Firebase handles password reset via email link, not token
      // This is handled through the resetPassword function above
      console.log('✅ [auth] Password reset should be handled via email link');
      return { success: true, message: 'Password reset via email link' };
    } catch (error) {
      console.error('❌ [auth] Reset password failed:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const loadStoredUser = createAsyncThunk(
  'auth/loadStoredUser',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔵 [auth] Loading stored user');
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

// Update user profile (including phone number)
export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { getState, rejectWithValue }) => {
    try {
      console.log('🔵 [auth] Updating user profile:', profileData);
      
      const { auth } = getState();
      const currentUser = auth.user;
      
      // Merge current user data with updates
      const updatedUser = {
        ...currentUser,
        ...profileData,
        phone: profileData.phone || currentUser?.phone || '', // Ensure phone is included
      };
      
      // Store the updated user in AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      console.log('✅ [auth] Profile updated successfully');
      console.log('📞 [auth] New phone number:', updatedUser.phone);
      
      return updatedUser;
    } catch (error) {
      console.error('❌ [auth] Profile update failed:', error.message);
      return rejectWithValue(error.message);
    }
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
      // Clear AsyncStorage
      AsyncStorage.multiRemove(['token', 'user']);
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
        console.log('📞 [auth] User phone after login:', state.user?.phone);
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
        console.log('✅ [auth] Register fulfilled for:', action.payload.user?.email);
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        console.log('📞 [auth] User phone after registration:', state.user?.phone);
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
    
    // Load Stored User
    builder
      .addCase(loadStoredUser.pending, (state) => {
        console.log('🔄 [auth] Load stored user pending');
        state.isLoading = true;
      })
      .addCase(loadStoredUser.fulfilled, (state, action) => {
        console.log('✅ [auth] Load stored user fulfilled');
        state.isLoading = false;
        state.isInitialized = true;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          console.log('📞 [auth] Loaded user phone:', state.user?.phone);
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
        console.log('📞 [auth] Updated user phone:', state.user?.phone);
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