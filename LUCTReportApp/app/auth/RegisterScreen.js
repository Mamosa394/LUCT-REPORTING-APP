// app/auth/RegisterScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { register, clearError } from '../../src/store/authSlice';
import { registerSchema } from '../../src/utils/validators';
import { Input, Button } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';

// Roles - Admin removed, Program Leader gets admin privileges
const ROLES = [
  { id: 'student', label: 'Student', icon: 'school-outline' },
  { id: 'lecturer', label: 'Lecturer', icon: 'people-outline' },
  { id: 'prl', label: 'Principal Lecturer', icon: 'star-outline' },
  { id: 'pl', label: 'Program Leader', icon: 'flag-outline' },
];

export default function RegisterScreen({ navigation }) {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.auth);
  const [selectedRole, setSelectedRole] = useState('student');

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '', 
      email: '', 
      password: '', 
      confirmPassword: '',
      role: 'student', 
      department: '', 
      studentId: '', 
      employeeId: '',
      stream: '',
    },
  });

  // Watch the role field to conditionally show/hide fields
  const watchRole = watch('role');

  useEffect(() => {
    if (error) {
      Alert.alert('Registration Failed', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) },
      ]);
    }
  }, [error, dispatch]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setValue('role', role);
    
    // Clear role-specific fields when switching roles
    setValue('studentId', '');
    setValue('employeeId', '');
    setValue('stream', '');
  };

  const onSubmit = async (data) => {
    console.log('🔵 [RegisterScreen] Form submitted with data:', { ...data, password: '***' });
    
    // Validate role-specific fields before submission
    if (data.role === 'student' && !data.studentId) {
      console.log('❌ [RegisterScreen] Student ID missing');
      Alert.alert('Validation Error', 'Student ID is required for student accounts');
      return;
    }
    
    if ((data.role === 'lecturer' || data.role === 'prl' || data.role === 'pl') && !data.employeeId) {
      console.log('❌ [RegisterScreen] Employee ID missing for role:', data.role);
      Alert.alert('Validation Error', 'Employee ID is required for staff accounts');
      return;
    }
    
    if (data.role === 'prl' && !data.stream) {
      console.log('❌ [RegisterScreen] Stream missing for PRL');
      Alert.alert('Validation Error', 'Stream/Department is required for Principal Lecturers');
      return;
    }
    
    if (!data.department) {
      console.log('❌ [RegisterScreen] Department missing');
      Alert.alert('Validation Error', 'Department is required for all accounts');
      return;
    }

    if (!data.name) {
      console.log('❌ [RegisterScreen] Name missing');
      Alert.alert('Validation Error', 'Full name is required');
      return;
    }

    if (!data.email) {
      console.log('❌ [RegisterScreen] Email missing');
      Alert.alert('Validation Error', 'Email is required');
      return;
    }

    if (!data.password) {
      console.log('❌ [RegisterScreen] Password missing');
      Alert.alert('Validation Error', 'Password is required');
      return;
    }

    if (data.password !== data.confirmPassword) {
      console.log('❌ [RegisterScreen] Passwords do not match');
      Alert.alert('Validation Error', 'Passwords do not match');
      return;
    }

    console.log('✅ [RegisterScreen] Validation passed, dispatching register action...');
    
    try {
      const result = await dispatch(register(data)).unwrap();
      console.log('✅ [RegisterScreen] Registration successful:', result);
      
      let successMessage = `Account created successfully as ${ROLES.find(r => r.id === data.role)?.label}. Please login.`;
      if (data.role === 'pl') {
        successMessage = `Account created successfully as Program Leader. You have full administrative privileges. Please login.`;
      }
      
      Alert.alert(
        'Success!', 
        successMessage,
        [
          { 
            text: 'Go to Login', 
            onPress: () => navigation.navigate('Login') 
          },
        ]
      );
    } catch (err) {
      console.error('❌ [RegisterScreen] Registration failed:', err);
      Alert.alert('Registration Error', err.message || 'Failed to create account. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the LUCT Reporting System</Text>

          {/* Role Selection - Professional Stack Layout */}
          <Text style={styles.sectionLabel}>Select Your Role</Text>
          <View style={styles.rolesStack}>
            {ROLES.map((role) => (
              <TouchableOpacity
                key={role.id}
                style={[
                  styles.roleItem,
                  selectedRole === role.id && styles.roleItemActive,
                ]}
                onPress={() => handleRoleSelect(role.id)}
              >
                <View style={[
                  styles.roleIconContainer,
                  selectedRole === role.id && styles.roleIconContainerActive
                ]}>
                  <Ionicons 
                    name={role.icon} 
                    size={22} 
                    color={selectedRole === role.id ? COLORS.buttonPrimaryText : COLORS.primary} 
                  />
                </View>
                <Text style={[
                  styles.roleLabel,
                  selectedRole === role.id && styles.roleLabelActive,
                ]}>
                  {role.label}
                </Text>
                {selectedRole === role.id && (
                  <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} style={styles.roleCheckmark} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Program Leader Note - Admin privileges info */}
          {watchRole === 'pl' && (
            <View style={styles.programLeaderNote}>
              <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
              <Text style={styles.programLeaderNoteText}>
                Program Leaders have full administrative access to monitor registrations, logins, and all system data.
              </Text>
            </View>
          )}

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Full Name"
                value={value}
                onChangeText={onChange}
                placeholder="Enter your full name"
                error={errors.name?.message}
                leftIcon={<Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Email Address"
                value={value}
                onChangeText={onChange}
                placeholder="you@luct.edu"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email?.message}
                leftIcon={<Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Password"
                value={value}
                onChangeText={onChange}
                placeholder="Create a password (min. 6 characters)"
                secureTextEntry
                error={errors.password?.message}
                leftIcon={<Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Confirm Password"
                value={value}
                onChangeText={onChange}
                placeholder="Confirm your password"
                secureTextEntry
                error={errors.confirmPassword?.message}
                leftIcon={<Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />}
              />
            )}
          />

          <Controller
            control={control}
            name="department"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Department"
                value={value}
                onChangeText={onChange}
                placeholder="e.g.FICT"
                error={errors.department?.message}
                leftIcon={<Ionicons name="business-outline" size={20} color={COLORS.textSecondary} />}
              />
            )}
          />

          {/* Student-specific fields */}
          {watchRole === 'student' && (
            <Controller
              control={control}
              name="studentId"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Student ID"
                  value={value}
                  onChangeText={onChange}
                  placeholder="e.g., 901017000"
                  error={errors.studentId?.message}
                  leftIcon={<Ionicons name="card-outline" size={20} color={COLORS.textSecondary} />}
                />
              )}
            />
          )}

          {/* Lecturer, PRL, and PL-specific fields */}
          {(watchRole === 'lecturer' || watchRole === 'prl' || watchRole === 'pl') && (
            <Controller
              control={control}
              name="employeeId"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Employee ID"
                  value={value}
                  onChangeText={onChange}
                  placeholder="e.g., LCT00123"
                  error={errors.employeeId?.message}
                  leftIcon={<Ionicons name="id-card-outline" size={20} color={COLORS.textSecondary} />}
                />
              )}
            />
          )}

          {/* PRL-specific fields */}
          {watchRole === 'prl' && (
            <Controller
              control={control}
              name="stream"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Department Managed"
                  value={value}
                  onChangeText={onChange}
                  placeholder="e.g., FICT"
                  error={errors.stream?.message}
                  leftIcon={<Ionicons name="git-branch-outline" size={20} color={COLORS.textSecondary} />}
                />
              )}
            />
          )}

          <Button
            title="Create Account"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            fullWidth
            size="lg"
            style={styles.registerButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  backText: {
    ...typography.body,
    color: COLORS.primary,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    ...typography.h2,
    color: COLORS.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  rolesStack: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  roleItemActive: {
    backgroundColor: COLORS.primary + '08',
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  roleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  roleIconContainerActive: {
    backgroundColor: COLORS.primary,
  },
  roleLabel: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
  },
  roleLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  roleCheckmark: {
    marginLeft: spacing.sm,
  },
  programLeaderNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  programLeaderNoteText: {
    ...typography.caption,
    color: COLORS.primary,
    flex: 1,
    fontWeight: '500',
  },
  registerButton: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.body,
    color: COLORS.textSecondary,
  },
  footerLink: {
    ...typography.body,
    color: COLORS.primary,
    fontWeight: '700',
  },
});