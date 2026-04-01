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

const ROLES = ['student', 'lecturer'];

export default function RegisterScreen({ navigation }) {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.auth);
  const [selectedRole, setSelectedRole] = useState('student');

  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '', email: '', password: '', confirmPassword: '',
      role: 'student', department: '', studentId: '', employeeId: '',
    },
  });

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
  };

  const onSubmit = async (data) => {
    try {
      await dispatch(register(data)).unwrap();
      Alert.alert('Success!', 'Account created successfully. Please login.', [
        { text: 'Go to Login', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (err) {
      // Error is handled by the useEffect above
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

          {/* Role Selection */}
          <Text style={styles.sectionLabel}>Select Your Role</Text>
          <View style={styles.rolesContainer}>
            {ROLES.map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleChip,
                  selectedRole === role && styles.roleChipActive,
                ]}
                onPress={() => handleRoleSelect(role)}
              >
                <Text style={[
                  styles.roleChipText,
                  selectedRole === role && styles.roleChipTextActive,
                ]}>
                  {role === 'student' ? 'Student' : 'Lecturer'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

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
                placeholder="e.g., Computer Science"
                error={errors.department?.message}
                leftIcon={<Ionicons name="business-outline" size={20} color={COLORS.textSecondary} />}
              />
            )}
          />

          {selectedRole === 'student' && (
            <Controller
              control={control}
              name="studentId"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Student ID"
                  value={value}
                  onChangeText={onChange}
                  placeholder="e.g., CS123456"
                  error={errors.studentId?.message}
                  leftIcon={<Ionicons name="card-outline" size={20} color={COLORS.textSecondary} />}
                />
              )}
            />
          )}

          {selectedRole === 'lecturer' && (
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
                  leftIcon={<Ionicons name="badge-outline" size={20} color={COLORS.textSecondary} />}
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
    marginBottom: spacing.sm,
  },
  rolesContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  roleChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleChipText: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
  },
  roleChipTextActive: {
    color: COLORS.buttonPrimaryText,
    fontWeight: '600',
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