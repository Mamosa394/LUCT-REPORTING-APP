// src/utils/helpers.js
import { Platform } from 'react-native';
import { VALIDATION_PATTERNS, DATE_FORMATS } from '../../src/utils/constants';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Share } from 'react-native';

// Format date to display format
export const formatDate = (date, format = DATE_FORMATS.DISPLAY) => {
  if (!date) return '';
  const momentDate = moment(date);
  if (!momentDate.isValid()) return '';
  return momentDate.format(format);
};

// Format time
export const formatTime = (time) => {
  if (!time) return '';
  return moment(time).format(DATE_FORMATS.TIME);
};

// Get relative time (e.g., "2 hours ago")
export const getRelativeTime = (date) => {
  if (!date) return '';
  return moment(date).fromNow();
};

// Capitalize first letter
export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Validate email
export const isValidEmail = (email) => {
  return VALIDATION_PATTERNS.EMAIL.test(email);
};

// Validate password
export const isValidPassword = (password) => {
  return VALIDATION_PATTERNS.PASSWORD.test(password);
};

// Validate student ID
export const isValidStudentId = (studentId) => {
  return VALIDATION_PATTERNS.STUDENT_ID.test(studentId);
};

// Validate employee ID
export const isValidEmployeeId = (employeeId) => {
  return VALIDATION_PATTERNS.EMPLOYEE_ID.test(employeeId);
};

// Get attendance percentage color
export const getAttendanceColor = (percentage) => {
  if (percentage >= 75) return '#4CAF50'; // Green
  if (percentage >= 50) return '#FFC107'; // Yellow
  return '#F44336'; // Red
};

// Calculate attendance percentage
export const calculateAttendancePercentage = (present, total) => {
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
};

// Group array by key
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

// Sort array by key
export const sortBy = (array, key, ascending = true) => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (ascending) {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });
};

// Filter array by search term
export const filterBySearch = (array, searchTerm, keys) => {
  if (!searchTerm) return array;
  const term = searchTerm.toLowerCase();
  return array.filter(item => {
    return keys.some(key => {
      const value = item[key];
      if (value) {
        return value.toString().toLowerCase().includes(term);
      }
      return false;
    });
  });
};

// Debounce function
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Generate random ID
export const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get IP address of the device/user
export const getIpAddress = async () => {
  try {
    // Try multiple IP services for redundancy
    const services = [
      'https://api.ipify.org?format=json',
      'https://api.my-ip.io/ip.json',
      'https://ipapi.co/json/'
    ];
    
    for (const service of services) {
      try {
        const response = await fetch(service);
        const data = await response.json();
        
        // Different services return different formats
        if (data.ip) return data.ip;
        if (data.ip_address) return data.ip_address;
        if (data.ipAddress) return data.ipAddress;
        if (typeof data === 'string') return data;
      } catch (err) {
        console.log(`Failed to fetch IP from ${service}:`, err);
        continue;
      }
    }
    
    // Fallback - try to get from network info if available
    try {
      // For React Native with network info
      const NetworkInfo = require('react-native-network-info').NetworkInfo;
      const ip = await NetworkInfo.getIPAddress();
      if (ip && ip !== '0.0.0.0') return ip;
    } catch (err) {
      console.log('Failed to get IP from network info:', err);
    }
    
    return 'Unknown';
  } catch (error) {
    console.error('Failed to get IP address:', error);
    return 'Unknown';
  }
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if object is empty
export const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0;
};

// Get file extension
export const getFileExtension = (filename) => {
  return filename.split('.').pop();
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get platform-specific styles
export const platformStyles = (iosStyles, androidStyles) => {
  return Platform.select({
    ios: iosStyles,
    android: androidStyles,
  });
};

// Get status bar height
export const getStatusBarHeight = () => {
  return Platform.select({
    ios: 44,
    android: 0,
  });
};

// Format phone number
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Get random color
export const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Parse error message
export const parseErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message) return error.message;
  return 'An unexpected error occurred';
};

// Save to AsyncStorage
export const saveToStorage = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error saving to storage:', error);
    return false;
  }
};

// Get from AsyncStorage
export const getFromStorage = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error getting from storage:', error);
    return null;
  }
};

// Remove from AsyncStorage
export const removeFromStorage = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from storage:', error);
    return false;
  }
};

// Download file
export const downloadFile = async (url, filename) => {
  try {
    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      FileSystem.documentDirectory + filename
    );
    const { uri } = await downloadResumable.downloadAsync();
    return uri;
  } catch (error) {
    console.error('Error downloading file:', error);
    return null;
  }
};

// Share content
export const shareContent = async (title, message, url) => {
  try {
    await Share.share({
      title,
      message: url ? `${message}\n${url}` : message,
    });
    return true;
  } catch (error) {
    console.error('Error sharing content:', error);
    return false;
  }
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Calculate age from date of birth
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Get academic year
export const getAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  // Academic year starts in September
  return month >= 8 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

// Get semester from date
export const getCurrentSemester = () => {
  const now = new Date();
  const month = now.getMonth();
  if (month >= 0 && month <= 4) return 'Semester 2';
  if (month >= 5 && month <= 7) return 'Summer Semester';
  return 'Semester 1';
};

// Check if date is within range
export const isDateInRange = (date, startDate, endDate) => {
  const checkDate = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return checkDate >= start && checkDate <= end;
};

// Convert object to query string
export const toQueryString = (params) => {
  return Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
};

// Parse query string to object
export const parseQueryString = (queryString) => {
  const params = {};
  const query = queryString.replace(/^\?/, '');
  if (!query) return params;
  query.split('&').forEach(pair => {
    const [key, value] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
  });
  return params;
};

// Sleep/delay function
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Retry function
export const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await sleep(delay);
    return retry(fn, retries - 1, delay);
  }
};

// Get platform
export const getPlatform = () => {
  return Platform.OS;
};

// Check if iOS
export const isIOS = () => {
  return Platform.OS === 'ios';
};

// Check if Android
export const isAndroid = () => {
  return Platform.OS === 'android';
};