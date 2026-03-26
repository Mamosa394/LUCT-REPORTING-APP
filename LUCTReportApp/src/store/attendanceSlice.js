import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

export const fetchAttendance = createAsyncThunk(
  'attendance/fetch',
  async ({ moduleId, studentId, month, year }, { rejectWithValue }) => {
    try {
      const response = await api.get('/attendance', {
        params: { moduleId, studentId, month, year },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAttendance = createAsyncThunk(
  'attendance/mark',
  async (attendanceData, { rejectWithValue }) => {
    try {
      const response = await api.post('/attendance/mark', attendanceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateAttendanceRecord = createAsyncThunk(
  'attendance/update',
  async ({ recordId, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/attendance/${recordId}`, { status });
      return response.data.record;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAttendanceStats = createAsyncThunk(
  'attendance/stats',
  async ({ moduleId, studentId }, { rejectWithValue }) => {
    try {
      const response = await api.get('/attendance/stats', {
        params: { moduleId, studentId },
      });
      return response.data.stats;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    records: [],
    stats: null,
    calendarData: {},
    loading: false,
    marking: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    buildCalendarData: (state) => {
      const data = {};
      state.records.forEach((record) => {
        const date = record.date;
        const colorMap = {
          present: '#2E7D32',
          absent: '#C62828',
          late: '#F57F17',
          excused: '#01579B',
        };
        data[date] = {
          marked: true,
          dotColor: colorMap[record.status] || '#9E9E9E',
          customStyles: {
            container: { backgroundColor: colorMap[record.status] + '22' },
            text: { color: '#000' },
          },
        };
      });
      state.calendarData = data;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendance.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload.records;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })

      .addCase(markAttendance.pending, (state) => { state.marking = true; })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.marking = false;
        if (action.payload.records) {
          state.records = [...state.records, ...action.payload.records];
        }
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.marking = false; state.error = action.payload;
      })

      .addCase(updateAttendanceRecord.fulfilled, (state, action) => {
        const idx = state.records.findIndex(r => r.id === action.payload.id);
        if (idx !== -1) state.records[idx] = action.payload;
      })

      .addCase(fetchAttendanceStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearError, buildCalendarData } = attendanceSlice.actions;
export const selectAttendanceRecords = (state) => state.attendance.records;
export const selectAttendanceStats = (state) => state.attendance.stats;
export const selectCalendarData = (state) => state.attendance.calendarData;
export const selectAttendanceLoading = (state) => state.attendance.loading;
export default attendanceSlice.reducer;