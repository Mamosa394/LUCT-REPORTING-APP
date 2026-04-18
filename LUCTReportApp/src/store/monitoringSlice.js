// src/store/monitoringSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../src/services/api';

export const fetchMonitoringData = createAsyncThunk(
  'monitoring/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/monitoring', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createObservation = createAsyncThunk(
  'monitoring/createObservation',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/monitoring/observations', data);
      return response.data.observation;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSystemStats = createAsyncThunk(
  'monitoring/systemStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/monitoring/stats');
      return response.data.stats;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Alias to match the function name called in StudentDashboard.js
export const fetchDashboardStats = fetchSystemStats;

// NEW: Fetch course-specific monitoring data
export const fetchCourseMonitoring = createAsyncThunk(
  'monitoring/fetchCourseMonitoring',
  async ({ courseId, studentId, period = 'week' }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/monitoring/course/${courseId}/student/${studentId}`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch course monitoring data');
    }
  }
);

// NEW: Fetch course progress metrics
export const fetchCourseProgress = createAsyncThunk(
  'monitoring/fetchCourseProgress',
  async ({ courseId, studentId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/monitoring/course/${courseId}/progress/${studentId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch course progress');
    }
  }
);

// NEW: Fetch student activities for a course
export const fetchCourseActivities = createAsyncThunk(
  'monitoring/fetchCourseActivities',
  async ({ courseId, studentId, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/monitoring/course/${courseId}/activities/${studentId}`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch course activities');
    }
  }
);

// NEW: Fetch attendance analytics for a course
export const fetchCourseAttendanceAnalytics = createAsyncThunk(
  'monitoring/fetchCourseAttendanceAnalytics',
  async ({ courseId, studentId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/monitoring/course/${courseId}/attendance/${studentId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch attendance analytics');
    }
  }
);

// NEW: Fetch ratings for a student
export const fetchRatings = createAsyncThunk(
  'monitoring/fetchRatings',
  async ({ studentId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/ratings/student/${studentId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// NEW: Submit a rating
export const submitRating = createAsyncThunk(
  'monitoring/submitRating',
  async (ratingData, { rejectWithValue }) => {
    try {
      const response = await api.post('/ratings', ratingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// NEW: Fetch average ratings by lecturer/course
export const fetchRatingAverages = createAsyncThunk(
  'monitoring/fetchRatingAverages',
  async ({ courseId, lecturerId }, { rejectWithValue }) => {
    try {
      const params = {};
      if (courseId) params.courseId = courseId;
      if (lecturerId) params.lecturerId = lecturerId;
      const response = await api.get('/ratings/averages', { params });
      return response.data.averages;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// NEW: Track course engagement metrics
export const trackCourseEngagement = createAsyncThunk(
  'monitoring/trackCourseEngagement',
  async ({ courseId, studentId, engagementType, metadata = {} }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/monitoring/course/${courseId}/engagement`, {
        studentId,
        engagementType,
        metadata,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to track engagement');
    }
  }
);

const monitoringSlice = createSlice({
  name: 'monitoring',
  initialState: {
    records: [],
    observations: [],
    systemStats: null,
    stats: {}, // Added to match Dashboard expected property
    ratings: [], // Store user's ratings
    averages: {}, // Store rating averages
    
    // NEW: Course monitoring specific state
    courseMonitoring: null, // Current course monitoring data
    courseProgress: null, // Course progress data
    courseActivities: [], // Recent course activities
    courseAttendanceAnalytics: null, // Attendance analytics
    selectedPeriod: 'week', // Default period for monitoring data
    
    loading: false,
    isLoading: false, // Added to match Dashboard expected property
    error: null,
  },
  reducers: {
    clearError: (state) => { 
      state.error = null; 
    },
    clearRatings: (state) => { 
      state.ratings = []; 
    },
    clearAverages: (state) => { 
      state.averages = {}; 
    },
    // NEW: Clear course monitoring data
    clearCourseMonitoring: (state) => {
      state.courseMonitoring = null;
      state.courseProgress = null;
      state.courseActivities = [];
      state.courseAttendanceAnalytics = null;
    },
    // NEW: Set selected period for monitoring
    setSelectedPeriod: (state, action) => {
      state.selectedPeriod = action.payload;
    },
    // NEW: Update course monitoring locally (for optimistic updates)
    updateCourseMonitoringLocally: (state, action) => {
      if (state.courseMonitoring) {
        state.courseMonitoring = {
          ...state.courseMonitoring,
          ...action.payload
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Existing cases
      .addCase(fetchMonitoringData.pending, (state) => { 
        state.loading = true; 
        state.isLoading = true; 
      })
      .addCase(fetchMonitoringData.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.records = action.payload.records;
        state.observations = action.payload.observations || [];
      })
      .addCase(fetchMonitoringData.rejected, (state, action) => {
        state.loading = false; 
        state.isLoading = false; 
        state.error = action.payload;
      })
      .addCase(createObservation.fulfilled, (state, action) => {
        state.observations.unshift(action.payload);
      })
      .addCase(fetchSystemStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSystemStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.systemStats = action.payload;
        state.stats = action.payload; // Sync both properties
      })
      .addCase(fetchSystemStats.rejected, (state) => {
        state.isLoading = false;
      })
      
      // NEW: Course monitoring cases
      .addCase(fetchCourseMonitoring.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCourseMonitoring.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courseMonitoring = action.payload;
      })
      .addCase(fetchCourseMonitoring.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // NEW: Course progress cases
      .addCase(fetchCourseProgress.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCourseProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.courseProgress = action.payload;
      })
      .addCase(fetchCourseProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // NEW: Course activities cases
      .addCase(fetchCourseActivities.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCourseActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.courseActivities = action.payload.activities || [];
      })
      .addCase(fetchCourseActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // NEW: Course attendance analytics cases
      .addCase(fetchCourseAttendanceAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCourseAttendanceAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.courseAttendanceAnalytics = action.payload;
      })
      .addCase(fetchCourseAttendanceAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Existing rating cases
      .addCase(fetchRatings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRatings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ratings = action.payload.ratings || [];
      })
      .addCase(fetchRatings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(submitRating.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitRating.fulfilled, (state, action) => {
        state.loading = false;
        state.ratings.unshift(action.payload.rating);
      })
      .addCase(submitRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRatingAverages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRatingAverages.fulfilled, (state, action) => {
        state.loading = false;
        state.averages = action.payload;
      })
      .addCase(fetchRatingAverages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // NEW: Track engagement cases
      .addCase(trackCourseEngagement.pending, (state) => {
        // Don't set loading to avoid UI flicker
      })
      .addCase(trackCourseEngagement.fulfilled, (state, action) => {
        // Update local monitoring data with new engagement
        if (state.courseMonitoring && action.payload) {
          state.courseMonitoring = {
            ...state.courseMonitoring,
            lastEngagement: new Date().toISOString(),
            engagementMetrics: action.payload.metrics
          };
        }
      })
      .addCase(trackCourseEngagement.rejected, (state, action) => {
        console.error('Failed to track engagement:', action.payload);
        // Don't set error state to avoid disrupting UX
      });
  },
});

// Export actions
export const { 
  clearError, 
  clearRatings, 
  clearAverages,
  clearCourseMonitoring,
  setSelectedPeriod,
  updateCourseMonitoringLocally
} = monitoringSlice.actions;

// Selectors
export const selectMonitoringRecords = (state) => state.monitoring.records;
export const selectSystemStats = (state) => state.monitoring.systemStats;
export const selectRatings = (state) => state.monitoring.ratings;
export const selectRatingAverages = (state) => state.monitoring.averages;

// NEW: Course monitoring selectors
export const selectCourseMonitoring = (state) => state.monitoring.courseMonitoring;
export const selectCourseProgress = (state) => state.monitoring.courseProgress;
export const selectCourseActivities = (state) => state.monitoring.courseActivities;
export const selectCourseAttendanceAnalytics = (state) => state.monitoring.courseAttendanceAnalytics;
export const selectSelectedPeriod = (state) => state.monitoring.selectedPeriod;

// NEW: Computed selectors
export const selectCourseAttendanceRate = (state) => {
  const monitoring = state.monitoring.courseMonitoring;
  return monitoring?.attendance || monitoring?.attendanceRate || 0;
};

export const selectCourseOverallProgress = (state) => {
  const monitoring = state.monitoring.courseMonitoring;
  return monitoring?.overallProgress || monitoring?.progress || 0;
};

export const selectCoursePerformanceMetrics = (state) => {
  const monitoring = state.monitoring.courseMonitoring;
  return {
    attendance: monitoring?.attendance || 0,
    assignments: monitoring?.assignments || 0,
    participation: monitoring?.participation || 0,
    quizzes: monitoring?.quizzes || 0,
    overallProgress: monitoring?.overallProgress || 0
  };
};

export default monitoringSlice.reducer;