import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../src/services/api';

export const submitRating = createAsyncThunk(
  'ratings/submit',
  async (ratingData, { rejectWithValue }) => {
    try {
      const response = await api.post('/ratings', ratingData);
      return response.data.rating;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRatings = createAsyncThunk(
  'ratings/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/ratings', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRatingsAnalytics = createAsyncThunk(
  'ratings/analytics',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/ratings/analytics', { params });
      return response.data.analytics;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const ratingsSlice = createSlice({
  name: 'ratings',
  initialState: {
    ratings: [],
    analytics: null,
    loading: false,
    submitting: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRatings.pending, (state) => { state.loading = true; })
      .addCase(fetchRatings.fulfilled, (state, action) => {
        state.loading = false;
        state.ratings = action.payload.ratings;
      })
      .addCase(fetchRatings.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })
      .addCase(submitRating.pending, (state) => { state.submitting = true; })
      .addCase(submitRating.fulfilled, (state, action) => {
        state.submitting = false;
        state.ratings.unshift(action.payload);
      })
      .addCase(submitRating.rejected, (state, action) => {
        state.submitting = false; state.error = action.payload;
      })
      .addCase(fetchRatingsAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      });
  },
});

export const { clearError } = ratingsSlice.actions;
export const selectRatings = (state) => state.ratings.ratings;
export const selectRatingsAnalytics = (state) => state.ratings.analytics;
export default ratingsSlice.reducer;