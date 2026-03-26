import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

export const fetchCourses = createAsyncThunk(
  'courses/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/courses', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  'courses/fetchById',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/courses/${courseId}`);
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
      const response = await api.post('/courses', courseData);
      return response.data.course;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCourse = createAsyncThunk(
  'courses/update',
  async ({ courseId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/courses/${courseId}`, data);
      return response.data.course;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/delete',
  async (courseId, { rejectWithValue }) => {
    try {
      await api.delete(`/courses/${courseId}`);
      return courseId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchModules = createAsyncThunk(
  'courses/fetchModules',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/modules', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createModule = createAsyncThunk(
  'courses/createModule',
  async (moduleData, { rejectWithValue }) => {
    try {
      const response = await api.post('/modules', moduleData);
      return response.data.module;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const assignLecturer = createAsyncThunk(
  'courses/assignLecturer',
  async ({ moduleId, lecturerId }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/modules/${moduleId}/assign`, { lecturerId });
      return response.data.module;
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
    clearError: (state) => { state.error = null; },
    setSelectedCourse: (state, action) => { state.selectedCourse = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.courses;
        state.totalCourses = action.payload.total;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })

      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.selectedCourse = action.payload;
      })

      .addCase(createCourse.fulfilled, (state, action) => {
        state.courses.unshift(action.payload);
        state.totalCourses += 1;
      })

      .addCase(updateCourse.fulfilled, (state, action) => {
        const idx = state.courses.findIndex(c => c.id === action.payload.id);
        if (idx !== -1) state.courses[idx] = action.payload;
      })

      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.courses = state.courses.filter(c => c.id !== action.payload);
        state.totalCourses -= 1;
      })

      .addCase(fetchModules.pending, (state) => { state.modulesLoading = true; })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.modulesLoading = false;
        state.modules = action.payload.modules;
        state.totalModules = action.payload.total;
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.modulesLoading = false; state.error = action.payload;
      })

      .addCase(createModule.fulfilled, (state, action) => {
        state.modules.unshift(action.payload);
        state.totalModules += 1;
      })

      .addCase(assignLecturer.fulfilled, (state, action) => {
        const idx = state.modules.findIndex(m => m.id === action.payload.id);
        if (idx !== -1) state.modules[idx] = action.payload;
      });
  },
});

export const { clearError, setSelectedCourse } = coursesSlice.actions;
export const selectCourses = (state) => state.courses.courses;
export const selectModules = (state) => state.courses.modules;
export const selectCoursesLoading = (state) => state.courses.loading;
export const selectSelectedCourse = (state) => state.courses.selectedCourse;
export default coursesSlice.reducer;