// src/store/ratingsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import firebaseApi from '../../src/services/api';

// Submit rating to Firestore
export const submitRating = createAsyncThunk(
  'ratings/submit',
  async (ratingData, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const currentUser = state.auth.user;
      
      if (!currentUser) {
        throw new Error('You must be logged in to rate');
      }

      // Prepare rating data with student info
      const ratingToSave = {
        ...ratingData,
        studentId: currentUser.uid || currentUser.id,
        studentName: currentUser.name || currentUser.displayName || 'Student',
        studentEmail: currentUser.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Rating fields
        rating: ratingData.rating, // 1-5 stars
        comment: ratingData.comment || '',
        aspects: ratingData.aspects || {}, // e.g., { teaching: 5, communication: 4 }
        semester: getCurrentSemester(),
        academicYear: getAcademicYear(),
      };

      // Use FirebaseApi to save to Firestore
      const response = await firebaseApi.post('/ratings', ratingToSave);
      
      console.log('✅ Rating submitted successfully:', response.data);
      
      return {
        id: response.data.id,
        ...ratingToSave,
      };
    } catch (error) {
      console.error('❌ Failed to submit rating:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch ratings from Firestore
export const fetchRatings = createAsyncThunk(
  'ratings/fetchAll',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const currentUser = state.auth.user;
      
      // Build query parameters
      const queryParams = {
        where: []
      };
      
      // For students, only show their own ratings
      if (currentUser?.role === 'student') {
        queryParams.where.push({
          field: 'studentId',
          operator: '==',
          value: currentUser.uid || currentUser.id
        });
      }
      
      // Filter by lecturer if provided
      if (params.ratedUserId) {
        queryParams.where.push({
          field: 'ratedUserId',
          operator: '==',
          value: params.ratedUserId
        });
      }
      
      // Filter by course if provided
      if (params.courseId) {
        queryParams.where.push({
          field: 'courseId',
          operator: '==',
          value: params.courseId
        });
      }
      
      // Add ordering
      queryParams.orderBy = 'createdAt';
      queryParams.order = 'desc';
      
      // Fetch from Firestore using FirebaseApi
      const response = await firebaseApi.get('/ratings', { params: queryParams });
      
      const ratings = response.data.ratings || [];
      console.log(`✅ Fetched ${ratings.length} ratings`);
      
      return { ratings };
    } catch (error) {
      console.error('❌ Failed to fetch ratings:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch lecturer ratings analytics
export const fetchRatingsAnalytics = createAsyncThunk(
  'ratings/analytics',
  async (lecturerId, { rejectWithValue }) => {
    try {
      // Fetch all ratings for this lecturer
      const response = await firebaseApi.get('/ratings', {
        params: {
          where: [{
            field: 'ratedUserId',
            operator: '==',
            value: lecturerId
          }]
        }
      });
      
      const ratings = response.data.ratings || [];
      
      // Calculate analytics
      const totalRatings = ratings.length;
      const avgRating = totalRatings > 0 
        ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / totalRatings 
        : 0;
      
      // Calculate rating distribution
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratings.forEach(r => {
        const rating = Math.round(r.rating || 0);
        if (rating >= 1 && rating <= 5) {
          distribution[rating]++;
        }
      });
      
      // Calculate aspect averages if available
      const aspectAverages = {};
      if (ratings.length > 0 && ratings[0].aspects) {
        const aspects = Object.keys(ratings[0].aspects);
        aspects.forEach(aspect => {
          const sum = ratings.reduce((acc, r) => acc + (r.aspects?.[aspect] || 0), 0);
          aspectAverages[aspect] = sum / totalRatings;
        });
      }
      
      const analytics = {
        totalRatings,
        averageRating: parseFloat(avgRating.toFixed(1)),
        ratingDistribution: distribution,
        aspectAverages,
        recentRatings: ratings.slice(0, 5) // Last 5 ratings
      };
      
      console.log(`✅ Analytics calculated for lecturer ${lecturerId}`);
      
      return { analytics };
    } catch (error) {
      console.error('❌ Failed to fetch analytics:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch lecturer's courses with ratings
export const fetchLecturerCoursesWithRatings = createAsyncThunk(
  'ratings/fetchLecturerCourses',
  async (lecturerId, { rejectWithValue }) => {
    try {
      // Fetch courses for this lecturer
      const coursesResponse = await firebaseApi.get('/courses', {
        params: {
          where: [{
            field: 'lecturerId',
            operator: '==',
            value: lecturerId
          }]
        }
      });
      
      const courses = coursesResponse.data.courses || [];
      
      // For each course, fetch its ratings
      const coursesWithRatings = await Promise.all(
        courses.map(async (course) => {
          const ratingsResponse = await firebaseApi.get('/ratings', {
            params: {
              where: [{
                field: 'courseId',
                operator: '==',
                value: course.id
              }]
            }
          });
          
          const ratings = ratingsResponse.data.ratings || [];
          const avgRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : 0;
          
          return {
            ...course,
            ratingsCount: ratings.length,
            averageRating: parseFloat(avgRating.toFixed(1)),
            ratings
          };
        })
      );
      
      return { courses: coursesWithRatings };
    } catch (error) {
      console.error('❌ Failed to fetch lecturer courses:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Helper functions
const getCurrentSemester = () => {
  const month = new Date().getMonth() + 1;
  return month <= 6 ? 2 : 1; // 1 = First semester, 2 = Second semester
};

const getAcademicYear = () => {
  return new Date().getFullYear();
};

const ratingsSlice = createSlice({
  name: 'ratings',
  initialState: {
    ratings: [],
    analytics: null,
    lecturerCourses: [],
    loading: false,
    submitting: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRatings: (state) => {
      state.ratings = [];
      state.analytics = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Ratings
      .addCase(fetchRatings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRatings.fulfilled, (state, action) => {
        state.loading = false;
        state.ratings = action.payload.ratings;
      })
      .addCase(fetchRatings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Submit Rating
      .addCase(submitRating.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitRating.fulfilled, (state, action) => {
        state.submitting = false;
        state.ratings.unshift(action.payload);
      })
      .addCase(submitRating.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      
      // Fetch Analytics
      .addCase(fetchRatingsAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRatingsAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload.analytics;
      })
      .addCase(fetchRatingsAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Lecturer Courses with Ratings
      .addCase(fetchLecturerCoursesWithRatings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLecturerCoursesWithRatings.fulfilled, (state, action) => {
        state.loading = false;
        state.lecturerCourses = action.payload.courses;
      })
      .addCase(fetchLecturerCoursesWithRatings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and selectors
export const { clearError, clearRatings } = ratingsSlice.actions;

export const selectRatings = (state) => state.ratings?.ratings || [];
export const selectRatingsAnalytics = (state) => state.ratings?.analytics || null;
export const selectLecturerCourses = (state) => state.ratings?.lecturerCourses || [];
export const selectRatingsLoading = (state) => state.ratings?.loading || false;
export const selectRatingsSubmitting = (state) => state.ratings?.submitting || false;
export const selectRatingsError = (state) => state.ratings?.error || null;

export default ratingsSlice.reducer;