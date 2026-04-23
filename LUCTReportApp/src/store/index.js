// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import attendanceReducer from './attendanceSlice';
import coursesReducer from './courseSlice';
import monitoringReducer from './monitoringSlice';
import ratingsReducer from './Ratingsslice';  

const store = configureStore({
  reducer: {
    auth: authReducer,           // Handles authentication
    attendance: attendanceReducer, // Handles attendance records and stats
    courses: coursesReducer,      // Handles courses and modules
    monitoring: monitoringReducer, // Handles monitoring data and stats
    ratings: ratingsReducer,      // ✅ Handles ratings and analytics
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: [
          'auth/fetchUsers/fulfilled',
          'auth/fetchLecturers/fulfilled',
          'ratings/fetchRatings/fulfilled',
          'ratings/submitRating/fulfilled',
          'attendance/markAttendance/fulfilled',
        ],
        // Ignore these field paths in state
        ignoredPaths: [
          'auth.users',
          'auth.lecturers',
          'ratings.ratings',
          'attendance.records',
        ],
      },
    }),
});

export default store;