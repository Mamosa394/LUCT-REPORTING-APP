//courseSlice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../src/services/api';

export const fetchCourses = createAsyncThunk(
  'courses/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      
      // Build query parameters for the API
      const params = {};
      
      if (filters.stream || filters.lecturerId || filters.employeeId || filters.isActive !== undefined) {
        params.where = [];
        
        if (filters.stream) {
          params.where.push({ field: 'stream', operator: '==', value: filters.stream });
        }
        if (filters.lecturerId) {
          params.where.push({ field: 'lecturerId', operator: '==', value: filters.lecturerId });
        }
        if (filters.employeeId) {
          params.where.push({ field: 'employeeId', operator: '==', value: filters.employeeId });
        }
        if (filters.isActive !== undefined) {
          params.where.push({ field: 'isActive', operator: '==', value: filters.isActive });
        }
      }
      
      // Add ordering
      params.orderBy = 'createdAt';
      params.order = 'desc';
      
      const response = await api.getCollection('courses', params);
      
      // Return consistent structure
      return {
        courses: response.data.courses || [],
        total: response.data.total || response.data.courses?.length || 0
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  'courses/fetchById',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await api.getDocument('courses', courseId);
      return response.data.course;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCourse = createAsyncThunk(
  'courses/create',
  async (courseData, { rejectWithValue }) => {
    try {
      
      // Prepare course data for Firestore
      const newCourse = {
        name: courseData.name,
        code: courseData.code.toUpperCase(),
        department: courseData.department || '',
        semester: courseData.semester || '',
        year: courseData.year || '',
        credits: parseInt(courseData.credits) || 0,
        lecturerId: courseData.lecturerId || '',
        lecturerName: courseData.lecturerName || '',
        lecturerEmail: courseData.lecturerEmail || '',
        employeeId: courseData.employeeId || '',
        stream: courseData.stream || '',
        createdBy: courseData.createdBy || '',
        isActive: true,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const response = await api.postDocument('courses', newCourse);
      console.log('Course created successfully:', courseData.code);
      return response.data;
    } catch (error) {
      console.error('Error creating course:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateCourse = createAsyncThunk(
  'courses/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      
      // Prepare update data
      const updateData = {
        name: data.name,
        code: data.code.toUpperCase(),
        department: data.department || '',
        semester: data.semester || '',
        year: data.year || '',
        credits: parseInt(data.credits) || 0,
        lecturerId: data.lecturerId || '',
        lecturerName: data.lecturerName || '',
        lecturerEmail: data.lecturerEmail || '',
        employeeId: data.employeeId || '',
        stream: data.stream || '',
        updatedBy: data.updatedBy || '',
        isActive: data.isActive !== undefined ? data.isActive : true,
        status: data.status || 'active',
        updatedAt: new Date().toISOString(),
      };
      
      const response = await api.updateDocument('courses', id, updateData);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/delete',
  async (courseId, { rejectWithValue }) => {
    try {
      console.log(' Deleting course:', courseId);
      await api.deleteDocument('courses', courseId);
      console.log(' Course deleted successfully');
      return courseId;
    } catch (error) {
      console.error(' Error deleting course:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch courses by lecturer using employeeId
export const fetchCoursesByLecturer = createAsyncThunk(
  'courses/fetchByLecturer',
  async (employeeId, { rejectWithValue }) => {
    try {
      
      // Use employeeId instead of lecturerId
      const response = await api.getCollection('courses', {
        where: [{ field: 'employeeId', operator: '==', value: employeeId }],
        orderBy: 'createdAt',
        order: 'desc'
      });
      
      const courses = response.data?.courses || [];
      const total = response.data?.total || courses.length;
      
      console.log(`Found ${courses.length} courses for employeeId: ${employeeId}`);
      
      if (courses.length > 0) {
        console.log('Courses found:', courses.map(c => `${c.code}: ${c.name}`));
      }
      
      return {
        courses: courses,
        total: total
      };
    } catch (error) {
      console.error(' Error fetching lecturer courses:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch courses by stream
export const fetchCoursesByStream = createAsyncThunk(
  'courses/fetchByStream',
  async (stream, { rejectWithValue }) => {
    try {
      const response = await api.getCollection('courses', {
        where: [{ field: 'stream', operator: '==', value: stream }],
        orderBy: 'createdAt',
        order: 'desc'
      });
      
      // Return consistent structure
      return {
        courses: response.data.courses || [],
        total: response.data.total || response.data.courses?.length || 0
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Module-related actions
export const fetchModules = createAsyncThunk(
  'courses/fetchModules',
  async (params = {}, { rejectWithValue }) => {
    try {
      
      const queryParams = {};
      if (params.courseId) {
        queryParams.where = [{ field: 'courseId', operator: '==', value: params.courseId }];
      }
      if (params.orderBy) {
        queryParams.orderBy = params.orderBy;
        queryParams.order = params.order || 'asc';
      }
      
      const response = await api.getCollection('modules', queryParams);
      
      //  Return consistent structure
      return {
        modules: response.data.modules || [],
        total: response.data.total || response.data.modules?.length || 0
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createModule = createAsyncThunk(
  'courses/createModule',
  async (moduleData, { rejectWithValue }) => {
    try {
      
      const newModule = {
        name: moduleData.name,
        code: moduleData.code,
        courseId: moduleData.courseId,
        description: moduleData.description || '',
        lecturerId: moduleData.lecturerId || '',
        lecturerName: moduleData.lecturerName || '',
        semester: moduleData.semester || '',
        credits: parseInt(moduleData.credits) || 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const response = await api.postDocument('modules', newModule);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const assignLecturer = createAsyncThunk(
  'courses/assignLecturer',
  async ({ moduleId, lecturerId, lecturerName, lecturerEmail }, { rejectWithValue }) => {
    try {
      
      const updateData = {
        lecturerId,
        lecturerName,
        lecturerEmail,
        assignedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const response = await api.updateDocument('modules', moduleId, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const coursesSlice = createSlice({
  name: 'courses',
  initialState: {
    courses: [],
    modules: [],
    selectedCourse: null,
    loading: false,
    modulesLoading: false,
    error: null,
    totalCourses: 0,
    totalModules: 0,
  },
  reducers: {
    clearError: (state) => { 
      state.error = null; 
    },
    setSelectedCourse: (state, action) => { 
      state.selectedCourse = action.payload; 
    },
    clearCourses: (state) => {
      state.courses = [];
      state.totalCourses = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Courses
      .addCase(fetchCourses.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.courses || [];
        state.totalCourses = action.payload.total || 0;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false; 
        state.error = action.payload;
      })

      // Fetch Course By ID
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Course
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses.unshift(action.payload);
        state.totalCourses += 1;
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Course
      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.courses.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
        if (state.selectedCourse?.id === action.payload.id) {
          state.selectedCourse = action.payload;
        }
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Course
      .addCase(deleteCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = state.courses.filter(c => c.id !== action.payload);
        state.totalCourses -= 1;
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Courses by Lecturer
      .addCase(fetchCoursesByLecturer.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCoursesByLecturer.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.courses || [];
        state.totalCourses = action.payload.total || 0;
      })
      .addCase(fetchCoursesByLecturer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Courses by Stream
      .addCase(fetchCoursesByStream.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCoursesByStream.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.courses || [];
        state.totalCourses = action.payload.total || 0;
      })
      .addCase(fetchCoursesByStream.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Modules
      .addCase(fetchModules.pending, (state) => { 
        state.modulesLoading = true; 
      })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.modulesLoading = false;
        state.modules = action.payload.modules || [];
        state.totalModules = action.payload.total || 0;
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.modulesLoading = false; 
        state.error = action.payload;
      })

      // Create Module
      .addCase(createModule.fulfilled, (state, action) => {
        state.modules.unshift(action.payload);
        state.totalModules += 1;
      })

      // Assign Lecturer to Module
      .addCase(assignLecturer.fulfilled, (state, action) => {
        const index = state.modules.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.modules[index] = action.payload;
        }
      });
  },
});

export const { clearError, setSelectedCourse, clearCourses } = coursesSlice.actions;

// Selectors
export const selectCourses = (state) => state.courses.courses;
export const selectModules = (state) => state.courses.modules;
export const selectCoursesLoading = (state) => state.courses.loading;
export const selectSelectedCourse = (state) => state.courses.selectedCourse;
export const selectTotalCourses = (state) => state.courses.totalCourses;
export const selectCoursesError = (state) => state.courses.error;

export default coursesSlice.reducer;