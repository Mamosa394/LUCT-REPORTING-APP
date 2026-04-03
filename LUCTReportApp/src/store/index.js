import { configureStore, createSlice } from '@reduxjs/toolkit';
import authReducer from '../../src/store/authSlice'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    role: null, 
    isAuthenticated: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, logout } = authSlice.actions;

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
});

export default store;