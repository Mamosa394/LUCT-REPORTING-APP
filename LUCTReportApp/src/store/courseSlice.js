import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../src/services/api';

export const fetchCourses = createAsyncThunk(
  'courses/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      console.log('📚 Fetching courses with filters:', filters);
      
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
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  'courses/fetchById',
  async (courseId, { rejectWithValue }) => {
    try {
      console.log('📚 Fetching course by ID:', courseId);
      const response = await api.getDocument('courses', courseId);
      return response.data.course;
    } catch (error) {
      console.error('❌ Error fetching course:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const createCourse = createAsyncThunk(
  'courses/create',
  async (courseData, { rejectWithValue }) => {
    try {
      console.log('📚 Creating course:', courseData.name);
      
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
      };
      
      const response = await api.postDocument('courses', newCourse);
      console.log('✅ Course created successfully:', courseData.code);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating course:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateCourse = createAsyncThunk(
  'courses/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      console.log('📚 Updating course:', id);
      
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
      };
      
      const response = await api.updateDocument('courses', id, updateData);
      console.log('✅ Course updated successfully');
      return { id, ...response.data };
    } catch (error) {
      console.error('❌ Error updating course:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/delete',
  async (courseId, { rejectWithValue }) => {
    try {
      console.log('📚 Deleting course:', courseId);
      await api.deleteDocument('courses', courseId);
      console.log('✅ Course deleted successfully');
      return courseId;
    } catch (error) {
      console.error('❌ Error deleting course:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Optional: Fetch courses by lecturer (convenience method)
export const fetchCoursesByLecturer = createAsyncThunk(
  'courses/fetchByLecturer',
  async (lecturerId, { rejectWithValue }) => {
    try {
      console.log('📚 Fetching courses for lecturer:', lecturerId);
      const response = await api.getCollection('courses', {
        where: [{ field: 'lecturerId', operator: '==', value: lecturerId }],
        orderBy: 'createdAt',
        order: 'desc'
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching lecturer courses:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Optional: Fetch courses by stream
export const fetchCoursesByStream = createAsyncThunk(
  'courses/fetchByStream',
  async (stream, { rejectWithValue }) => {
    try {
      console.log('📚 Fetching courses for stream:', stream);
      const response = await api.getCollection('courses', {
        where: [{ field: 'stream', operator: '==', value: stream }],
        orderBy: 'createdAt',
        order: 'desc'
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching stream courses:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Module-related actions (if you have modules collection)
export const fetchModules = createAsyncThunk(
  'courses/fetchModules',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('📚 Fetching modules with params:', params);
      
      const queryParams = {};
      if (params.courseId) {
        queryParams.where = [{ field: 'courseId', operator: '==', value: params.courseId }];
      }
      if (params.orderBy) {
        queryParams.orderBy = params.orderBy;
        queryParams.order = params.order || 'asc';
      }
      
      const response = await api.getCollection('modules', queryParams);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching modules:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const createModule = createAsyncThunk(
  'courses/createModule',
  async (moduleData, { rejectWithValue }) => {
    try {
      console.log('📚 Creating module:', moduleData.name);
      
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
      };
      
      const response = await api.postDocument('modules', newModule);
      console.log('✅ Module created successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error creating module:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const assignLecturer = createAsyncThunk(
  'courses/assignLecturer',
  async ({ moduleId, lecturerId, lecturerName, lecturerEmail }, { rejectWithValue }) => {
    try {
      console.log('📚 Assigning lecturer to module:', moduleId);
      
      const updateData = {
        lecturerId,
        lecturerName,
        lecturerEmail,
        assignedAt: new Date().toISOString(),
      };
      
      const response = await api.updateDocument('modules', moduleId, updateData);
      console.log('✅ Lecturer assigned successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error assigning lecturer:', error);
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
        console.log(`✅ Courses loaded: ${state.courses.length} courses`);
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false; 
        state.error = action.payload;
        console.error('❌ Courses fetch rejected:', action.payload);
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
        console.log('✅ Course added to state');
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
        console.log('✅ Course updated in state');
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
        console.log('✅ Course deleted from state');
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