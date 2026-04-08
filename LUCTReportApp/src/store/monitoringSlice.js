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

const monitoringSlice = createSlice({
  name: 'monitoring',
  initialState: {
    records: [],
    observations: [],
    systemStats: null,
    stats: {}, // Added to match Dashboard expected property
    ratings: [], // NEW: Store user's ratings
    averages: {}, // NEW: Store rating averages
    loading: false,
    isLoading: false, // Added to match Dashboard expected property
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearRatings: (state) => { state.ratings = []; },
    clearAverages: (state) => { state.averages = {}; },
  },
  extraReducers: (builder) => {
    builder
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
      // NEW: Handle fetchRatings
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
      // NEW: Handle submitRating
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
      // NEW: Handle fetchRatingAverages
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
      });
  },
});

export const { clearError, clearRatings, clearAverages } = monitoringSlice.actions;
export const selectMonitoringRecords = (state) => state.monitoring.records;
export const selectSystemStats = (state) => state.monitoring.systemStats;
export const selectRatings = (state) => state.monitoring.ratings;
export const selectRatingAverages = (state) => state.monitoring.averages;
export default monitoringSlice.reducer;