import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../src/services/api';

export const fetchReports = createAsyncThunk(
  'reports/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createReport = createAsyncThunk(
  'reports/create',
  async (reportData, { rejectWithValue }) => {
    try {
      const response = await api.post('/reports', reportData);
      return response.data.report;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateReport = createAsyncThunk(
  'reports/update',
  async ({ reportId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/reports/${reportId}`, data);
      return response.data.report;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitReport = createAsyncThunk(
  'reports/submit',
  async (reportId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/reports/${reportId}/submit`);
      return response.data.report;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const reviewReport = createAsyncThunk(
  'reports/review',
  async ({ reportId, feedback, rating }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/reports/${reportId}/review`, { feedback, rating });
      return response.data.report;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState: {
    reports: [],
    selectedReport: null,
    loading: false,
    submitting: false,
    error: null,
    total: 0,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    setSelectedReport: (state, action) => { state.selectedReport = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload.reports;
        state.total = action.payload.total;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.reports.unshift(action.payload);
      })
      .addCase(updateReport.fulfilled, (state, action) => {
        const idx = state.reports.findIndex(r => r.id === action.payload.id);
        if (idx !== -1) state.reports[idx] = action.payload;
        if (state.selectedReport?.id === action.payload.id) state.selectedReport = action.payload;
      })
      .addCase(submitReport.fulfilled, (state, action) => {
        const idx = state.reports.findIndex(r => r.id === action.payload.id);
        if (idx !== -1) state.reports[idx] = action.payload;
      })
      .addCase(reviewReport.fulfilled, (state, action) => {
        const idx = state.reports.findIndex(r => r.id === action.payload.id);
        if (idx !== -1) state.reports[idx] = action.payload;
      });
  },
});

export const { clearError, setSelectedReport } = reportsSlice.actions;
export const selectReports = (state) => state.reports.reports;
export const selectReportsLoading = (state) => state.reports.loading;
export const selectSelectedReport = (state) => state.reports.selectedReport;
export default reportsSlice.reducer;