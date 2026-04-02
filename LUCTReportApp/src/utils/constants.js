// src/utils/constants.js
import { COLORS } from '../../config/theme';

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  LECTURER: 'lecturer',
  PRL: 'prl', // Programme Leader
  PL: 'pl',   // Principal Lecturer
  ADMIN: 'admin',
};

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
};

// Report Status
export const REPORT_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FEEDBACK_GIVEN: 'feedback_given',
};

// Report Types
export const REPORT_TYPES = {
  MONTHLY: 'monthly',
  WEEKLY: 'weekly',
  INCIDENT: 'incident',
  ASSESSMENT: 'assessment',
  PROGRESS: 'progress',
  FINAL: 'final',
};

// Course Types
export const COURSE_TYPES = {
  LECTURE: 'lecture',
  LAB: 'lab',
  TUTORIAL: 'tutorial',
  SEMINAR: 'seminar',
  PROJECT: 'project',
};

// Rating Criteria
export const RATING_CRITERIA = [
  'teachingQuality',
  'communication',
  'punctuality',
  'material',
  'support',
  'overall',
];

// Rating Labels
export const RATING_LABELS = {
  teachingQuality: 'Teaching Quality',
  communication: 'Communication Skills',
  punctuality: 'Punctuality',
  material: 'Course Material',
  support: 'Student Support',
  overall: 'Overall Rating',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  ATTENDANCE: 'attendance',
  REPORT: 'report',
  RATING: 'rating',
  COURSE: 'course',
  ALERT: 'alert',
  REMINDER: 'reminder',
  SYSTEM: 'system',
};

// Semester Options
export const SEMESTERS = [
  { label: 'Semester 1', value: '1' },
  { label: 'Semester 2', value: '2' },
  { label: 'Summer Semester', value: 'summer' },
];

// Department Options
export const DEPARTMENTS = [
  { label: 'Computer Science', value: 'cs' },
  { label: 'Information Technology', value: 'it' },
  { label: 'Software Engineering', value: 'se' },
  { label: 'Data Science', value: 'ds' },
  { label: 'Cyber Security', value: 'cyber' },
  { label: 'Business Information Systems', value: 'bis' },
];

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
  },
  COURSES: {
    LIST: '/courses',
    DETAIL: (id) => `/courses/${id}`,
    CREATE: '/courses',
    UPDATE: (id) => `/courses/${id}`,
    DELETE: (id) => `/courses/${id}`,
    ENROLL: (id) => `/courses/${id}/enroll`,
  },
  ATTENDANCE: {
    MARK: '/attendance',
    BY_COURSE: (courseId) => `/attendance/course/${courseId}`,
    STUDENT_SUMMARY: (studentId) => `/attendance/student/${studentId}/summary`,
    UPDATE: (id) => `/attendance/${id}`,
  },
  REPORTS: {
    LIST: '/reports',
    CREATE: '/reports',
    DETAIL: (id) => `/reports/${id}`,
    UPDATE: (id) => `/reports/${id}`,
    UPDATE_STATUS: (id) => `/reports/${id}/status`,
  },
  RATINGS: {
    LIST: '/ratings',
    CREATE: '/ratings',
    BY_LECTURER: (lecturerId) => `/ratings/lecturer/${lecturerId}`,
    BY_COURSE: (courseId) => `/ratings/course/${courseId}`,
  },
  MONITORING: {
    STATS: '/monitoring/stats',
    LOGS: '/monitoring/logs',
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },
};

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: '@luct_token',
  USER: '@luct_user',
  THEME: '@luct_theme',
  NOTIFICATIONS: '@luct_notifications',
  LAST_SYNC: '@luct_last_sync',
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_FULL: 'YYYY-MM-DDTHH:mm:ssZ',
  TIME: 'HH:mm',
  DAY_MONTH: 'DD MMM',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [5, 10, 20, 50],
};

// Chart Colors
export const CHART_COLORS = {
  present: COLORS.success,
  absent: COLORS.error,
  late: COLORS.warning,
  excused: COLORS.info,
  default: COLORS.primary,
};

// Attendance Percentage Thresholds
export const ATTENDANCE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 75,
  SATISFACTORY: 60,
  POOR: 40,
};

// Validation Patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
  PHONE: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
  STUDENT_ID: /^[A-Z]{2}\d{6}$/,
  EMPLOYEE_ID: /^[A-Z]{3}\d{5}$/,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION: 'Please check your input and try again.',
  EMAIL_EXISTS: 'Email already registered.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  WEAK_PASSWORD: 'Password must be at least 6 characters with letters and numbers.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  REGISTER: 'Registration successful!',
  LOGOUT: 'Logged out successfully.',
  PROFILE_UPDATE: 'Profile updated successfully!',
  PASSWORD_CHANGE: 'Password changed successfully!',
  REPORT_SUBMITTED: 'Report submitted successfully!',
  REPORT_UPDATED: 'Report updated successfully!',
  RATING_SUBMITTED: 'Rating submitted successfully!',
  ATTENDANCE_MARKED: 'Attendance marked successfully!',
  NOTIFICATIONS_CLEARED: 'All notifications cleared!',
};

// Confirmation Messages
export const CONFIRM_MESSAGES = {
  LOGOUT: 'Are you sure you want to logout?',
  DELETE_COURSE: 'Are you sure you want to delete this course?',
  DELETE_REPORT: 'Are you sure you want to delete this report?',
  CLEAR_NOTIFICATIONS: 'Are you sure you want to clear all notifications?',
  SUBMIT_REPORT: 'Are you sure you want to submit this report?',
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'LUCT Reporting App',
  APP_VERSION: '1.0.0',
  MIN_SUPPORTED_VERSION: '1.0.0',
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  SYNC_INTERVAL: 30 * 60 * 1000, // 30 minutes
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  SUPPORTED_DOC_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};