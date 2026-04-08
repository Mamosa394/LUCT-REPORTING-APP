import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../src/store/authSlice';
import attendanceReducer from '../../src/store/attendanceSlice';
import coursesReducer from '../../src/store/courseSlice';
import monitoringReducer from '../../src/store/monitoringSlice';

// Removed the conflicting local auth slice

const store = configureStore({
  reducer: {
    auth: authReducer,           // Handles authentication
    attendance: attendanceReducer, // Handles attendance records and stats
    courses: coursesReducer,      // Handles courses and modules
    monitoring: monitoringReducer, // Handles monitoring data and stats
  },
});

export default store;