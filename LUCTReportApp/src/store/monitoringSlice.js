// src/store/monitoringSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';

// ============================================
// REPORT THUNKS (Firebase Firestore)
// ============================================

// Fetch reports from Firestore
export const fetchReports = createAsyncThunk(
  'monitoring/fetchReports',
  async (params = {}, { rejectWithValue }) => {
    try {
      const reportsRef = collection(db, 'reports');
      let q = reportsRef;
      
      // Apply filters
      if (params.submittedBy) {
        q = query(q, where('submittedBy', '==', params.submittedBy));
      }
      if (params.courseId) {
        q = query(q, where('courseId', '==', params.courseId));
      }
      if (params.status) {
        q = query(q, where('status', '==', params.status));
      }
      
      // Order by createdAt descending
      q = query(q, orderBy('createdAt', 'desc'));
      
      const snapshot = await getDocs(q);
      const reports = [];
      snapshot.forEach(doc => {
        reports.push({ id: doc.id, ...doc.data() });
      });
      
      return { reports, total: reports.length };
    } catch (error) {
      console.error('❌ Error fetching reports:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Submit report to Firestore
export const submitReport = createAsyncThunk(
  'monitoring/submitReport',
  async (reportData, { rejectWithValue }) => {
    try {
      console.log('📝 Submitting report to Firestore:', reportData);
      
      // Prepare report data for Firestore
      const firestoreData = {
        // Faculty & Course Info
        facultyName: reportData.facultyName || '',
        className: reportData.className || '',
        courseName: reportData.courseName || '',
        courseCode: reportData.courseCode || '',
        lecturerName: reportData.lecturerName || '',
        
        // Schedule Info
        weekOfReporting: reportData.weekOfReporting || '',
        dateOfLecture: reportData.dateOfLecture || new Date().toISOString(),
        scheduledLectureTime: reportData.scheduledLectureTime || new Date().toISOString(),
        venue: reportData.venue || '',
        
        // Attendance Info
        totalRegisteredStudents: reportData.totalRegisteredStudents || 0,
        actualStudentsPresent: reportData.actualStudentsPresent || 0,
        attendanceRate: reportData.attendanceRate || 
          ((reportData.actualStudentsPresent / reportData.totalRegisteredStudents) * 100).toFixed(1),
        
        // Teaching Content
        topicTaught: reportData.topicTaught || '',
        learningOutcomes: reportData.learningOutcomes || '',
        lecturerRecommendations: reportData.lecturerRecommendations || '',
        
        // Metadata
        submittedBy: reportData.submittedBy || '',
        type: reportData.type || 'lecturer_weekly_report',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'reports'), firestoreData);
      console.log('✅ Report saved to Firestore with ID:', docRef.id);
      
      const savedReport = {
        id: docRef.id,
        ...firestoreData
      };
      
      return {
        report: savedReport,
        message: 'Report submitted successfully',
        success: true
      };
    } catch (error) {
      console.error('❌ Error submitting report:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Update report status in Firestore
export const updateReportStatus = createAsyncThunk(
  'monitoring/updateReportStatus',
  async ({ reportId, status, feedback }, { rejectWithValue }) => {
    try {
      const reportRef = doc(db, 'reports', reportId);
      
      await updateDoc(reportRef, {
        status,
        feedback: feedback || '',
        reviewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Get updated report
      const updatedDoc = await getDoc(reportRef);
      const updatedReport = { id: updatedDoc.id, ...updatedDoc.data() };
      
      return {
        report: updatedReport,
        message: 'Report status updated',
        success: true
      };
    } catch (error) {
      console.error('❌ Error updating report status:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch single report by ID
export const fetchReportById = createAsyncThunk(
  'monitoring/fetchReportById',
  async (reportId, { rejectWithValue }) => {
    try {
      const reportRef = doc(db, 'reports', reportId);
      const reportDoc = await getDoc(reportRef);
      
      if (!reportDoc.exists()) {
        throw new Error('Report not found');
      }
      
      return {
        report: { id: reportDoc.id, ...reportDoc.data() }
      };
    } catch (error) {
      console.error('❌ Error fetching report:', error);
      return rejectWithValue(error.message);
    }
  }
);

// ============================================
// MONITORING THUNKS (Firebase Firestore)
// ============================================

export const fetchMonitoringData = createAsyncThunk(
  'monitoring/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const monitoringRef = collection(db, 'monitoring');
      let q = monitoringRef;
      
      if (params?.courseId) {
        q = query(q, where('courseId', '==', params.courseId));
      }
      if (params?.studentId) {
        q = query(q, where('studentId', '==', params.studentId));
      }
      
      const snapshot = await getDocs(q);
      const records = [];
      snapshot.forEach(doc => {
        records.push({ id: doc.id, ...doc.data() });
      });
      
      return { records, observations: [] };
    } catch (error) {
      console.error('❌ Error fetching monitoring data:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const createObservation = createAsyncThunk(
  'monitoring/createObservation',
  async (data, { rejectWithValue }) => {
    try {
      const docRef = await addDoc(collection(db, 'observations'), {
        ...data,
        createdAt: new Date().toISOString()
      });
      
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('❌ Error creating observation:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSystemStats = createAsyncThunk(
  'monitoring/systemStats',
  async (_, { rejectWithValue }) => {
    try {
      // Get stats from various collections
      const reportsSnapshot = await getDocs(collection(db, 'reports'));
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      
      return {
        totalReports: reportsSnapshot.size,
        totalUsers: usersSnapshot.size,
        totalCourses: coursesSnapshot.size,
        totalRatings: 0,
      };
    } catch (error) {
      console.error('❌ Error fetching system stats:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDashboardStats = fetchSystemStats;

export const fetchCourseMonitoring = createAsyncThunk(
  'monitoring/fetchCourseMonitoring',
  async ({ courseId, studentId, period = 'week' }, { rejectWithValue }) => {
    try {
      const monitoringRef = collection(db, 'courseMonitoring');
      const q = query(
        monitoringRef,
        where('courseId', '==', courseId),
        where('studentId', '==', studentId),
        where('period', '==', period)
      );
      
      const snapshot = await getDocs(q);
      let data = null;
      snapshot.forEach(doc => {
        data = { id: doc.id, ...doc.data() };
      });
      
      return data || {
        attendance: 75,
        assignments: 80,
        participation: 70,
        overallProgress: 72,
      };
    } catch (error) {
      console.error('❌ Error fetching course monitoring:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCourseProgress = createAsyncThunk(
  'monitoring/fetchCourseProgress',
  async ({ courseId, studentId }, { rejectWithValue }) => {
    try {
      const progressRef = collection(db, 'courseProgress');
      const q = query(
        progressRef,
        where('courseId', '==', courseId),
        where('studentId', '==', studentId)
      );
      
      const snapshot = await getDocs(q);
      let data = null;
      snapshot.forEach(doc => {
        data = { id: doc.id, ...doc.data() };
      });
      
      return data || { overallProgress: 60, attendanceRate: 75 };
    } catch (error) {
      console.error('❌ Error fetching course progress:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCourseActivities = createAsyncThunk(
  'monitoring/fetchCourseActivities',
  async ({ courseId, studentId, limit = 10 }, { rejectWithValue }) => {
    try {
      const activitiesRef = collection(db, 'activities');
      const q = query(
        activitiesRef,
        where('courseId', '==', courseId),
        where('studentId', '==', studentId),
        orderBy('date', 'desc'),
        limit(limit)
      );
      
      const snapshot = await getDocs(q);
      const activities = [];
      snapshot.forEach(doc => {
        activities.push({ id: doc.id, ...doc.data() });
      });
      
      return { activities };
    } catch (error) {
      console.error('❌ Error fetching course activities:', error);
      return { activities: [] };
    }
  }
);

export const fetchCourseAttendanceAnalytics = createAsyncThunk(
  'monitoring/fetchCourseAttendanceAnalytics',
  async ({ courseId, studentId }, { rejectWithValue }) => {
    try {
      const analyticsRef = collection(db, 'attendanceAnalytics');
      const q = query(
        analyticsRef,
        where('courseId', '==', courseId),
        where('studentId', '==', studentId)
      );
      
      const snapshot = await getDocs(q);
      let data = null;
      snapshot.forEach(doc => {
        data = { id: doc.id, ...doc.data() };
      });
      
      return data || { attendance: 75, present: 15, total: 20 };
    } catch (error) {
      console.error('❌ Error fetching attendance analytics:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRatings = createAsyncThunk(
  'monitoring/fetchRatings',
  async ({ studentId, lecturerId, courseId }, { rejectWithValue }) => {
    try {
      const ratingsRef = collection(db, 'ratings');
      let q = ratingsRef;
      
      if (studentId) {
        q = query(q, where('studentId', '==', studentId));
      }
      if (lecturerId) {
        q = query(q, where('lecturerId', '==', lecturerId));
      }
      if (courseId) {
        q = query(q, where('courseId', '==', courseId));
      }
      
      q = query(q, orderBy('createdAt', 'desc'));
      
      const snapshot = await getDocs(q);
      const ratings = [];
      snapshot.forEach(doc => {
        ratings.push({ id: doc.id, ...doc.data() });
      });
      
      return { ratings };
    } catch (error) {
      console.error('❌ Error fetching ratings:', error);
      return { ratings: [] };
    }
  }
);

export const submitRating = createAsyncThunk(
  'monitoring/submitRating',
  async (ratingData, { rejectWithValue }) => {
    try {
      const docRef = await addDoc(collection(db, 'ratings'), {
        ...ratingData,
        createdAt: new Date().toISOString()
      });
      
      return {
        rating: { id: docRef.id, ...ratingData }
      };
    } catch (error) {
      console.error('❌ Error submitting rating:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRatingAverages = createAsyncThunk(
  'monitoring/fetchRatingAverages',
  async ({ courseId, lecturerId }, { rejectWithValue }) => {
    try {
      const ratingsRef = collection(db, 'ratings');
      let q = ratingsRef;
      
      if (courseId) {
        q = query(q, where('courseId', '==', courseId));
      }
      if (lecturerId) {
        q = query(q, where('lecturerId', '==', lecturerId));
      }
      
      const snapshot = await getDocs(q);
      const ratings = [];
      snapshot.forEach(doc => {
        ratings.push(doc.data());
      });
      
      // Calculate averages
      const averages = {
        overall: 0,
        teaching: 0,
        communication: 0,
        punctuality: 0,
        material: 0,
        support: 0,
      };
      
      if (ratings.length > 0) {
        ratings.forEach(r => {
          averages.overall += r.overall || 0;
          averages.teaching += r.teaching || 0;
          averages.communication += r.communication || 0;
          averages.punctuality += r.punctuality || 0;
          averages.material += r.material || 0;
          averages.support += r.support || 0;
        });
        
        Object.keys(averages).forEach(key => {
          averages[key] = (averages[key] / ratings.length).toFixed(1);
        });
      }
      
      return averages;
    } catch (error) {
      console.error('❌ Error fetching rating averages:', error);
      return {};
    }
  }
);

export const trackCourseEngagement = createAsyncThunk(
  'monitoring/trackCourseEngagement',
  async ({ courseId, studentId, engagementType, metadata = {} }, { rejectWithValue }) => {
    try {
      await addDoc(collection(db, 'engagement'), {
        courseId,
        studentId,
        engagementType,
        metadata,
        timestamp: new Date().toISOString()
      });
      
      return { metrics: {} };
    } catch (error) {
      console.error('❌ Error tracking engagement:', error);
      return rejectWithValue(error.message);
    }
  }
);

// ============================================
// SLICE
// ============================================

const monitoringSlice = createSlice({
  name: 'monitoring',
  initialState: {
    records: [],
    observations: [],
    systemStats: null,
    stats: {},
    ratings: [],
    averages: {},
    courseMonitoring: null,
    courseProgress: null,
    courseActivities: [],
    courseAttendanceAnalytics: null,
    selectedPeriod: 'week',
    
    // Reports state
    reports: [],
    selectedReport: null,
    reportsLoading: false,
    
    loading: false,
    isLoading: false,
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
    clearCourseMonitoring: (state) => {
      state.courseMonitoring = null;
      state.courseProgress = null;
      state.courseActivities = [];
      state.courseAttendanceAnalytics = null;
    },
    setSelectedPeriod: (state, action) => {
      state.selectedPeriod = action.payload;
    },
    updateCourseMonitoringLocally: (state, action) => {
      if (state.courseMonitoring) {
        state.courseMonitoring = {
          ...state.courseMonitoring,
          ...action.payload
        };
      }
    },
    clearSelectedReport: (state) => {
      state.selectedReport = null;
    },
    setSelectedReport: (state, action) => {
      state.selectedReport = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchMonitoringData
      .addCase(fetchMonitoringData.pending, (state) => { 
        state.loading = true; 
        state.isLoading = true; 
      })
      .addCase(fetchMonitoringData.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoading = false;
        state.records = action.payload.records || [];
        state.observations = action.payload.observations || [];
      })
      .addCase(fetchMonitoringData.rejected, (state, action) => {
        state.loading = false; 
        state.isLoading = false; 
        state.error = action.payload;
      })
      
      // createObservation
      .addCase(createObservation.fulfilled, (state, action) => {
        state.observations.unshift(action.payload);
      })
      
      // fetchSystemStats
      .addCase(fetchSystemStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSystemStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.systemStats = action.payload;
        state.stats = action.payload;
      })
      .addCase(fetchSystemStats.rejected, (state) => {
        state.isLoading = false;
      })
      
      // fetchCourseMonitoring
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
      
      // fetchCourseProgress
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
      
      // fetchCourseActivities
      .addCase(fetchCourseActivities.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCourseActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.courseActivities = action.payload.activities || [];
      })
      .addCase(fetchCourseActivities.rejected, (state) => {
        state.loading = false;
      })
      
      // fetchCourseAttendanceAnalytics
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
      
      // fetchRatings
      .addCase(fetchRatings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRatings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ratings = action.payload.ratings || [];
      })
      .addCase(fetchRatings.rejected, (state) => {
        state.isLoading = false;
      })
      
      // submitRating
      .addCase(submitRating.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitRating.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.rating) {
          state.ratings.unshift(action.payload.rating);
        }
      })
      .addCase(submitRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchRatingAverages
      .addCase(fetchRatingAverages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRatingAverages.fulfilled, (state, action) => {
        state.loading = false;
        state.averages = action.payload;
      })
      .addCase(fetchRatingAverages.rejected, (state) => {
        state.loading = false;
      })
      
      // trackCourseEngagement
      .addCase(trackCourseEngagement.fulfilled, (state, action) => {
        if (state.courseMonitoring && action.payload) {
          state.courseMonitoring = {
            ...state.courseMonitoring,
            lastEngagement: new Date().toISOString(),
          };
        }
      })
      
      // ============================================
      // REPORT CASES
      // ============================================
      
      // fetchReports
      .addCase(fetchReports.pending, (state) => {
        state.reportsLoading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.reportsLoading = false;
        state.reports = action.payload.reports || [];
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.reportsLoading = false;
        state.error = action.payload;
      })
      
      // submitReport
      .addCase(submitReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitReport.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.report) {
          state.reports.unshift(action.payload.report);
        }
      })
      .addCase(submitReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // updateReportStatus
      .addCase(updateReportStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateReportStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.reports.findIndex(r => r.id === action.payload.report?.id);
        if (index !== -1 && action.payload.report) {
          state.reports[index] = action.payload.report;
        }
        if (state.selectedReport?.id === action.payload.report?.id) {
          state.selectedReport = action.payload.report;
        }
      })
      .addCase(updateReportStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // fetchReportById
      .addCase(fetchReportById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchReportById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedReport = action.payload.report;
      })
      .addCase(fetchReportById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// ============================================
// EXPORT ACTIONS
// ============================================

export const { 
  clearError, 
  clearRatings, 
  clearAverages,
  clearCourseMonitoring,
  setSelectedPeriod,
  updateCourseMonitoringLocally,
  clearSelectedReport,
  setSelectedReport,
} = monitoringSlice.actions;

// ============================================
// SELECTORS
// ============================================

export const selectMonitoringRecords = (state) => state.monitoring?.records || [];
export const selectSystemStats = (state) => state.monitoring?.systemStats || null;
export const selectRatings = (state) => state.monitoring?.ratings || [];
export const selectRatingAverages = (state) => state.monitoring?.averages || {};
export const selectCourseMonitoring = (state) => state.monitoring?.courseMonitoring || null;
export const selectCourseProgress = (state) => state.monitoring?.courseProgress || null;
export const selectCourseActivities = (state) => state.monitoring?.courseActivities || [];
export const selectCourseAttendanceAnalytics = (state) => state.monitoring?.courseAttendanceAnalytics || null;
export const selectSelectedPeriod = (state) => state.monitoring?.selectedPeriod || 'week';

// Report selectors
export const selectReports = (state) => state.monitoring?.reports || [];
export const selectSelectedReport = (state) => state.monitoring?.selectedReport || null;
export const selectReportsLoading = (state) => state.monitoring?.reportsLoading || false;

// Computed selectors
export const selectCourseAttendanceRate = (state) => {
  const monitoring = state.monitoring?.courseMonitoring;
  return monitoring?.attendance || monitoring?.attendanceRate || 0;
};

export const selectCourseOverallProgress = (state) => {
  const monitoring = state.monitoring?.courseMonitoring;
  return monitoring?.overallProgress || monitoring?.progress || 0;
};

export const selectCoursePerformanceMetrics = (state) => {
  const monitoring = state.monitoring?.courseMonitoring;
  return {
    attendance: monitoring?.attendance || 0,
    assignments: monitoring?.assignments || 0,
    participation: monitoring?.participation || 0,
    quizzes: monitoring?.quizzes || 0,
    overallProgress: monitoring?.overallProgress || 0
  };
};

export const selectMonitoringLoading = (state) => state.monitoring?.isLoading || false;
export const selectMonitoringError = (state) => state.monitoring?.error || null;

export default monitoringSlice.reducer;