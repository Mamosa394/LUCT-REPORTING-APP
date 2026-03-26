import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { register, clearError, clearSuccessMessage } from '../../src/store/slices/authSlice';
import { useAuth } from '../../src/utils/hooks/useAuth';
import { registerSchema } from '../../src/utils/validators/validators';
import Input from '../../src/components/common/Input';
import Button from '../../src/components/common/Button';
import { COLORS } from '../../src/styles/colors';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../src/styles/typography';
import { ROLE_LABELS, DEPARTMENTS } from '../../src/utils/constants/roles';

const ROLES = ['student', 'lecturer', 'prl', 'pl'];

export default function RegisterScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoading, error, successMessage } = useAuth();
  const [selectedRole, setSelectedRole] = useState('student');

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '', email: '', password: '', confirmPassword: '',
      role: 'student', department: '', studentId: '', employeeId: '',
      program: '', stream: '',
    },
  });

  useEffect(() => {
    if (error) Alert.alert('Registration Failed', error, [{ text: 'OK', onPress: () => dispatch(clearError()) }]);
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      Alert.alert('Success!', successMessage, [
        { text: 'Go to Login', onPress: () => { dispatch(clearSuccessMessage()); router.replace('/(auth)/login'); } },
      ]);
    }
  }, [successMessage]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const onSubmit = (data) => dispatch(register(data));

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
        </View>

        <View style={styles.card}>
          {/* Role Selection */}
          <Text style={styles.sectionLabel}>Select Your Role</Text>
          <View style={styles.rolesGrid}>
            {ROLES.map((role) => (
              <TouchableOpacity
                key={role}
                style={[styles.roleChip, selectedRole === role && styles.roleChipActive]}
                onPress={() => handleRoleSelect(role)}
              >
                <Text style={[styles.roleChipText, selectedRole === role && styles.roleChipTextActive]}>
                  {ROLE_LABELS[role]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Controller control={control} name="fullName"
            render={({ field: { onChange, value } }) => (
              <Input label="Full Name" value={value} onChangeText={onChange}
                placeholder="John Doe" error={errors.fullName?.message} autoCapitalize="words" />
            )} />

          <Controller control={control} name="email"
            render={({ field: { onChange, value } }) => (
              <Input label="Email Address" value={value} onChangeText={onChange}
                placeholder="you@university.edu" keyboardType="email-address" error={errors.email?.message} />
            )} />

          <Controller control={control} name="password"
            render={({ field: { onChange, value } }) => (
              <Input label="Password" value={value} onChangeText={onChange}
                placeholder="Min. 8 chars, uppercase, number, special" secureTextEntry error={errors.password?.message} />
            )} />

          <Controller control={control} name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <Input label="Confirm Password" value={value} onChangeText={onChange}
                placeholder="Re-enter password" secureTextEntry error={errors.confirmPassword?.message} />
            )} />

          <Controller control={control} name="department"
            render={({ field: { onChange, value } }) => (
              <Input label="Department" value={value} onChangeText={onChange}
                placeholder="e.g. Computer Science" error={errors.department?.message} autoCapitalize="words" />
            )} />

          {selectedRole === 'student' && (
            <>
              <Controller control={control} name="studentId"
                render={({ field: { onChange, value } }) => (
                  <Input label="Student ID" value={value} onChangeText={onChange} placeholder="e.g. STU2024001" />
                )} />
              <Controller control={control} name="program"
                render={({ field: { onChange, value } }) => (
                  <Input label="Program" value={value} onChangeText={onChange} placeholder="e.g. BSc Computer Science" autoCapitalize="words" />
                )} />
            </>
          )}

          {['lecturer', 'prl'].includes(selectedRole) && (
            <>
              <Controller control={control} name="employeeId"
                render={({ field: { onChange, value } }) => (
                  <Input label="Employee ID" value={value} onChangeText={onChange} placeholder="e.g. EMP2024001" />
                )} />
              <Controller control={control} name="stream"
                render={({ field: { onChange, value } }) => (
                  <Input label="Stream / Specialization" value={value} onChangeText={onChange} placeholder="e.g. Software Engineering" autoCapitalize="words" />
                )} />
            </>
          )}

          {selectedRole === 'pl' && (
            <Controller control={control} name="employeeId"
              render={({ field: { onChange, value } }) => (
                <Input label="Employee ID" value={value} onChangeText={onChange} placeholder="e.g. EMP2024001" />
              )} />
          )}

          <Button title="Create Account" onPress={handleSubmit(onSubmit)}
            loading={isLoading} fullWidth size="lg" style={{ marginTop: SPACING.md }} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: COLORS.primary, padding: SPACING.lg, paddingBottom: SPACING.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: SPACING.xl, marginBottom: SPACING.lg },
  backBtn: { marginRight: SPACING.md },
  backText: { color: COLORS.white, fontSize: 16 },
  headerTitle: { ...TYPOGRAPHY.h4, color: COLORS.white },
  card: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xxl, padding: SPACING.xl },
  sectionLabel: { ...TYPOGRAPHY.label, marginBottom: SPACING.sm },
  rolesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  roleChip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full, borderWidth: 1.5, borderColor: COLORS.border,
  },
  roleChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleChipText: { ...TYPOGRAPHY.body2, color: COLORS.textSecondary },
  roleChipTextActive: { color: COLORS.white, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl },
  footerText: { color: 'rgba(255,255,255,0.8)', fontSize: 15 },
  footerLink: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});