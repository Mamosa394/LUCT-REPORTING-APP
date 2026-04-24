// LoginScreen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { login, clearError } from '../../src/store/authSlice';
import { loginSchema } from '../../src/utils/validators';
import { COLORS, spacing, typography } from '../../config/theme';
// Dynamic import for UI components with error handling
let Input, Button;
try {
  const UI = require('../../src/components/UI');
  Input = UI.Input;
  Button = UI.Button;
} catch (error) {
  console.error(' LoginScreen Failed to load UI components:', error.message);
}
// Role-specific dashboard routes 
const getDashboardRoute = (role) => {
  switch (role) {
    case 'student':
      return 'StudentDashboard';
    case 'lecturer':
      return 'LecturerDashboard';
    case 'prl':
      return 'PRLDashboard';
    case 'pl':
      return 'PLDashboard'; 
    default:
      return 'StudentDashboard';
  }
};

// Get role display name
const getRoleName = (role) => {
  switch (role) {
    case 'student':
      return 'Student';
    case 'lecturer':
      return 'Lecturer';
    case 'prl':
      return 'Principal Lecturer';
    case 'pl':
      return 'Program Leader';
    default:
      return 'User';
  }
};

// Get role-specific welcome message
const getWelcomeMessage = (role, name) => {
  const baseMessage = `Welcome back, ${name || 'User'}!\n\nYou are logged in as: ${getRoleName(role)}`;
  
  switch (role) {
    case 'pl':
      return `${baseMessage}\n\nYou have full administrative access to monitor registrations, logins, and system data.`;
    case 'prl':
      return `${baseMessage}\n\nYou can view courses, reports, monitoring, and ratings.`;
    case 'lecturer':
      return `${baseMessage}\n\nYou can manage classes, reports, and monitoring.`;
    case 'student':
      return `${baseMessage}\n\nYou can view classes, attendance, and ratings.`;
    default:
      return baseMessage;
  }
};

export default function LoginScreen({ navigation }) {
  
  const dispatch = useDispatch();
  const authState = useSelector(state => {
    return state.auth;
  });
  
  const { isLoading, error, user } = authState || { isLoading: false, error: null, user: null };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (error) {
      Alert.alert('Login Failed', error, [
        { text: 'OK', onPress: () => {
          dispatch(clearError());
        }},
      ]);
    }
  }, [error, dispatch]);

  // Check if user is already logged in
  useEffect(() => {
    if (user && user.role) {
    }
  }, [user]);

  const onSubmit = async (data) => {
    
    try {
      const result = await dispatch(login(data)).unwrap();
      
      const userRole = result.user?.role || result.role;
      
      const validRoles = ['student', 'lecturer', 'prl', 'pl'];
      if (!validRoles.includes(userRole)) {
        Alert.alert('Error', 'Invalid user role. Please contact support.');
        return;
      }
      
      const welcomeMessage = getWelcomeMessage(userRole, result.user?.name);
      Alert.alert(
        'Welcome!',
        welcomeMessage,
        [
          {
            text: 'Continue',
            onPress: () => {
            }
          }
        ]
      );
    } catch (err) {
      console.error('LoginScreen Login failed:', err);
    }
  };

  // if components aren't loaded, show error
  if (!Input || !Button) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Error: UI Components failed to load</Text>
        <Text style={styles.errorSubtext}>Check console for details</Text>
      </View>
    );
  }

  // Safety check for theme
  if (!COLORS || !spacing || !typography) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Error: Theme configuration missing</Text>
        <Text style={styles.errorSubtext}>Check config/theme.js exports</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.scrollContent}>
        {/* Logo and App Name */}
        <View style={styles.logoContainer}>
           <Image 
    source={require('../../assets/LimkokwingUniversity.png')} 
    style={styles.logo}
    resizeMode="contain"
  />
          <Text style={styles.appName}>LUCT Reporting</Text>
          <Text style={styles.tagline}>Academic Management System</Text>
        </View>

        {/* Login Form Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {/* Email Input */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => {
              return (
                <Input
                  label="Email Address"
                  value={value}
                  onChangeText={onChange}
                  placeholder="email@gmail.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email?.message}
                  leftIcon={
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={COLORS.textSecondary}
                    />
                  }
                />
              );
            }}
          />

          {/* Password Input */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => {
              return (
                <Input
                  label="Password"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter your password"
                  secureTextEntry
                  error={errors.password?.message}
                  leftIcon={
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={COLORS.textSecondary}
                    />
                  }
                />
              );
            }}
          />

          {/* Forgot Password Link */}
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('ForgotPassword');
            }}
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <Button
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            fullWidth
            size="lg"
            style={styles.loginButton}
          />
        </View>

        {/* Register Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity 
            onPress={() => {
              navigation.navigate('Register');
            }}
          >
            <Text style={styles.footerLink}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS?.background || '#000000',
  },
  scrollContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing?.lg || 20,
    paddingVertical: spacing?.xl || 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing?.xl || 32,
  },
  appName: {
    ...(typography?.h1 || { fontSize: 28, fontWeight: 'bold' }),
    color: COLORS?.primary || '#C0C0C0',
    marginTop: spacing?.md || 16,
    fontSize: 28,
    fontWeight: 'bold',
  },
  tagline: {
    ...(typography?.bodySmall || { fontSize: 14 }),
    color: COLORS?.textSecondary || '#C0C0C0',
    marginTop: spacing?.xs || 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS?.cardBackground || '#0A0A0A',
    borderRadius: 20,
    padding: spacing?.xl || 24,
    borderWidth: 1,
    borderColor: COLORS?.border || '#2A2A2A',
  },
  title: {
    ...(typography?.h2 || { fontSize: 24, fontWeight: 'bold' }),
    color: COLORS?.text || '#FFFFFF',
    marginBottom: spacing?.xs || 4,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    ...(typography?.body || { fontSize: 16 }),
    color: COLORS?.textSecondary || '#C0C0C0',
    marginBottom: spacing?.lg || 24,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginVertical: spacing?.md || 16,
  },
  forgotPasswordText: {
    ...(typography?.bodySmall || { fontSize: 14 }),
    color: COLORS?.primary || '#C0C0C0',
  },
  loginButton: {
    marginTop: spacing?.sm || 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing?.xl || 32,
  },
  footerText: {
    ...(typography?.body || { fontSize: 16 }),
    color: COLORS?.textSecondary || '#C0C0C0',
  },
  footerLink: {
    ...(typography?.body || { fontSize: 16 }),
    color: COLORS?.primary || '#C0C0C0',
    fontWeight: '700',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorSubtext: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  logo: {
  width: 100,
  height: 100,
  marginBottom: spacing?.md || 16,
},
});