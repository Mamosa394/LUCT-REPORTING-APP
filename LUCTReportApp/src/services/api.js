import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Base RTK Query API slice used for cache-enabled queries
 */
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api`,
    prepareHeaders: async (headers) => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['User', 'Course', 'Module', 'Attendance', 'Report', 'Rating', 'Notification', 'Monitoring'],
  endpoints: (builder) => ({
    // ── Users ──────────────────────────────────────────
    getUser: builder.query({
      query: (userId) => `/users/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),
    getLecturers: builder.query({
      query: () => '/users?role=lecturer',
      providesTags: ['User'],
    }),
    getStudents: builder.query({
      query: (moduleId) => `/users?role=student&moduleId=${moduleId}`,
      providesTags: ['User'],
    }),

    // ── Courses ────────────────────────────────────────
    getCourses: builder.query({
      query: (params) => ({ url: '/courses', params }),
      providesTags: ['Course'],
    }),
    getModulesByLecturer: builder.query({
      query: (lecturerId) => `/modules?lecturerId=${lecturerId}`,
      providesTags: ['Module'],
    }),

    // ── Attendance ─────────────────────────────────────
    getAttendanceSummary: builder.query({
      query: ({ moduleId, studentId }) =>
        `/attendance/summary?moduleId=${moduleId}&studentId=${studentId}`,
      providesTags: ['Attendance'],
    }),

    // ── Notifications ──────────────────────────────────
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notification'],
    }),

    // ── Ratings ────────────────────────────────────────
    getRatingsForModule: builder.query({
      query: (moduleId) => `/ratings?moduleId=${moduleId}`,
      providesTags: ['Rating'],
    }),
  }),
});

export const {
  useGetUserQuery,
  useGetLecturersQuery,
  useGetStudentsQuery,
  useGetCoursesQuery,
  useGetModulesByLecturerQuery,
  useGetAttendanceSummaryQuery,
  useGetNotificationsQuery,
  useGetRatingsForModuleQuery,
} = apiSlice;