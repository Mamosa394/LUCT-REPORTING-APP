import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

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

const monitoringSlice = createSlice({
  name: 'monitoring',
  initialState: {
    records: [],
    observations: [],
    systemStats: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonitoringData.pending, (state) => { state.loading = true; })
      .addCase(fetchMonitoringData.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload.records;
        state.observations = action.payload.observations || [];
      })
      .addCase(fetchMonitoringData.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })
      .addCase(createObservation.fulfilled, (state, action) => {
        state.observations.unshift(action.payload);
      })
      .addCase(fetchSystemStats.fulfilled, (state, action) => {
        state.systemStats = action.payload;
      });
  },
});

export const { clearError } = monitoringSlice.actions;
export const selectMonitoringRecords = (state) => state.monitoring.records;
export const selectSystemStats = (state) => state.monitoring.systemStats;
export default monitoringSlice.reducer;