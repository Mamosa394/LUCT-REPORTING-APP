// src/config/theme.js

import { DefaultTheme } from 'react-native-paper';

// Color palette based on black and vibrant silver theme
export const COLORS = {
  // Primary colors
  primary: '#C0C0C0', // Vibrant silver
  primaryDark: '#A0A0A0', // Darker silver for hover/pressed states
  primaryLight: '#E0E0E0', // Lighter silver for accents
  
  // Background colors
  background: '#000000', // Pure black background
  backgroundDark: '#000000', // Same as background
  backgroundLight: '#0A0A0A', // Slightly lighter black for cards/surfaces
  
  // Surface colors (cards, modals, etc.)
  surface: '#0A0A0A', // Dark surface with slight variation from background
  surfaceLight: '#1A1A1A', // Lighter surface for elevated elements
  
  // Text colors
  text: '#FFFFFF', // White text on dark backgrounds
  textSecondary: '#C0C0C0', // Silver for secondary text
  textDisabled: '#6C6C6C', // Darker silver for disabled text
  
  // Border and divider colors
  border: '#2A2A2A', // Dark gray border
  divider: '#1A1A1A', // Divider color
  
  // Status colors
  success: '#4CAF50', // Green for success states
  error: '#F44336', // Red for error states
  warning: '#FFC107', // Amber for warnings
  info: '#2196F3', // Blue for informational messages
  
  // Additional UI colors
  placeholder: '#6C6C6C', // Placeholder text color
  backdrop: 'rgba(0, 0, 0, 0.8)', // Backdrop for modals
  notification: '#C0C0C0', // Notification badge color
  
  // Button specific colors
  buttonPrimary: '#C0C0C0', // Silver buttons
  buttonPrimaryText: '#000000', // Black text on silver buttons
  buttonSecondary: '#2A2A2A', // Dark gray secondary buttons
  buttonSecondaryText: '#C0C0C0', // Silver text on dark buttons
  
  // Input field colors
  inputBackground: '#0A0A0A', // Dark input background
  inputBorder: '#2A2A2A', // Input border color
  inputFocusBorder: '#C0C0C0', // Focus state border
  
  // Tab bar and navigation
  tabBarBackground: '#000000', // Black tab bar
  tabBarActive: '#C0C0C0', // Active tab icon/text
  tabBarInactive: '#6C6C6C', // Inactive tab icon/text
  
  // Header colors
  headerBackground: '#000000', // Black header
  headerText: '#FFFFFF', // White header text
  headerBorder: '#2A2A2A', // Header border
  
  // Card colors
  cardBackground: '#0A0A0A', // Card background
  cardBorder: '#2A2A2A', // Card border
  
  // Status bar
  statusBar: '#000000', // Black status bar
};

// React Native Paper theme configuration
export const paperTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    primaryDark: COLORS.primaryDark,
    accent: COLORS.primaryLight,
    background: COLORS.background,
    surface: COLORS.surface,
    text: COLORS.text,
    disabled: COLORS.textDisabled,
    placeholder: COLORS.placeholder,
    backdrop: COLORS.backdrop,
    notification: COLORS.notification,
    error: COLORS.error,
    success: COLORS.success,
    warning: COLORS.warning,
    info: COLORS.info,
    border: COLORS.border,
    card: COLORS.cardBackground,
  },
  roundness: 8, // Border radius for components
  animation: {
    scale: 1.0,
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: 'bold',
    },
  },
};

// Additional theme utilities
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
    color: COLORS.text,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: 'normal',
    color: COLORS.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal',
    color: COLORS.textSecondary,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.buttonPrimaryText,
  },
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.35,
    shadowRadius: 6.68,
    elevation: 8,
  },
};

// Helper function to create style objects with theme colors
export const createThemedStyles = (styles) => {
  return (theme = paperTheme) => {
    const styleObject = typeof styles === 'function' ? styles(theme) : styles;
    return styleObject;
  };
};

export default {
  COLORS,
  paperTheme,
  spacing,
  typography,
  shadows,
  createThemedStyles,
};