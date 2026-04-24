// attendanceSlice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../src/services/api';

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

// fetchStudentAttendanceSummary  import
export const fetchStudentAttendanceSummary = createAsyncThunk(
  'attendance/studentSummary',
  async ({ studentId, moduleId, month, year }, { rejectWithValue }) => {
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

//  Fetch students from attendance records for a course
export const fetchStudentsByCourse = createAsyncThunk(
  'attendance/fetchStudentsByCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      
      // Fetch all attendance records for this course
      const attendanceResponse = await api.get('/attendance', {
        params: {
          where: [{ field: 'courseId', operator: '==', value: courseId }]
        }
      });
      
      const attendanceRecords = attendanceResponse.data?.records || [];
      
      // Extract unique students from attendance records
      const studentMap = new Map();
      
      attendanceRecords.forEach(record => {
        const studentId = record.studentId;
        if (studentId && !studentMap.has(studentId)) {
          studentMap.set(studentId, {
            id: studentId,
            name: record.studentName || 'Unknown Student',
            studentId: record.studentId,
            email: record.studentEmail || '',
          });
        }
      });
      
      const students = Array.from(studentMap.values());
      
      if (students.length > 0) {
      }
      
      return { students, courseId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//Fetch attendance records by course
export const fetchAttendanceByCourse = createAsyncThunk(
  'attendance/fetchByCourse',
  async ({ courseId, date }, { rejectWithValue }) => {
    try {
      
      const params = {
        where: [{ field: 'courseId', operator: '==', value: courseId }]
      };
      
      if (date) {
        params.where.push({ field: 'dateString', operator: '==', value: date });
      }
      
      params.orderBy = 'date';
      params.order = 'desc';
      
      const response = await api.get('/attendance', { params });
      
      return { 
        records: response.data?.records || [], 
        courseId,
        date 
      };
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
    courseStudents: {}, 
    attendanceByCourse: {}, 
    loading: false,
    marking: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { 
      state.error = null; 
    },
    clearCourseStudents: (state, action) => {
      const courseId = action.payload;
      if (courseId) {
        delete state.courseStudents[courseId];
      } else {
        state.courseStudents = {};
      }
    },
    clearAttendanceByCourse: (state, action) => {
      const courseId = action.payload;
      if (courseId) {
        delete state.attendanceByCourse[courseId];
      } else {
        state.attendanceByCourse = {};
      }
    },
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
      // Fetch Attendance
      .addCase(fetchAttendance.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload.records;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = false; 
        state.error = action.payload;
      })

      // Mark Attendance
      .addCase(markAttendance.pending, (state) => { 
        state.marking = true; 
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.marking = false;
        if (action.payload.records) {
          state.records = [...state.records, ...action.payload.records];
        }
        if (action.payload.record) {
          state.records.push(action.payload.record);
        }
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.marking = false; 
        state.error = action.payload;
      })

      // Update Attendance Record
      .addCase(updateAttendanceRecord.fulfilled, (state, action) => {
        const idx = state.records.findIndex(r => r.id === action.payload.id);
        if (idx !== -1) state.records[idx] = action.payload;
      })

      // Fetch Attendance Stats
      .addCase(fetchAttendanceStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      
      // Fetch Student Attendance Summary
      .addCase(fetchStudentAttendanceSummary.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
      })
      .addCase(fetchStudentAttendanceSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchStudentAttendanceSummary.rejected, (state, action) => {
        state.loading = false; 
        state.error = action.payload;
      })

      //  Fetch Students By Course
      .addCase(fetchStudentsByCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentsByCourse.fulfilled, (state, action) => {
        state.loading = false;
        const { students, courseId } = action.payload;
        state.courseStudents[courseId] = students;
      })
      .addCase(fetchStudentsByCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Attendance By Course
      .addCase(fetchAttendanceByCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAttendanceByCourse.fulfilled, (state, action) => {
        state.loading = false;
        const { records, courseId } = action.payload;
        state.attendanceByCourse[courseId] = records;
      })
      .addCase(fetchAttendanceByCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { 
  clearError, 
  clearCourseStudents, 
  clearAttendanceByCourse, 
  buildCalendarData 
} = attendanceSlice.actions;

// Selectors
export const selectAttendanceRecords = (state) => state.attendance.records;
export const selectAttendanceStats = (state) => state.attendance.stats;
export const selectCalendarData = (state) => state.attendance.calendarData;
export const selectAttendanceLoading = (state) => state.attendance.loading;
export const selectAttendanceMarking = (state) => state.attendance.marking;
export const selectCourseStudents = (state, courseId) => state.attendance.courseStudents[courseId] || [];
export const selectAttendanceByCourse = (state, courseId) => state.attendance.attendanceByCourse[courseId] || [];

export default attendanceSlice.reducer;