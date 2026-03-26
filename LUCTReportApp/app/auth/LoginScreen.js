import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, Image,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { Link, useRouter } from 'expo-router';
import { login, clearError } from '../../src/store/slices/authSlice';
import { useAuth } from '../../src/utils/hooks/useAuth';
import { loginSchema } from '../../src/utils/validators/validators';
import Input from '../../src/components/common/Input';
import Button from '../../src/components/common/Button';
import { COLORS } from '../../src/styles/colors';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../src/styles/typography';

export default function LoginScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoading, error } = useAuth();

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (error) {
      Alert.alert('Login Failed', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) },
      ]);
    }
  }, [error]);

  const onSubmit = async (data) => {
    dispatch(login(data));
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>ET</Text>
          </View>
          <Text style={styles.appName}>EduTrack</Text>
          <Text style={styles.tagline}>University Management System</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Email Address"
                value={value}
                onChangeText={onChange}
                placeholder="you@university.edu"
                keyboardType="email-address"
                error={errors.email?.message}
                autoCapitalize="none"
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
                placeholder="Enter your password"
                secureTextEntry
                error={errors.password?.message}
              />
            )}
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.forgotLink}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            fullWidth
            size="lg"
            style={{ marginTop: SPACING.sm }}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.footerLink}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  header: { alignItems: 'center', paddingTop: SPACING.xxl, paddingBottom: SPACING.xl },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  logoText: { fontSize: 28, fontWeight: '900', color: COLORS.primary },
  appName: { fontSize: 28, fontWeight: '800', color: COLORS.white },
  tagline: { ...TYPOGRAPHY.body2, color: 'rgba(255,255,255,0.75)', marginTop: SPACING.xs },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
  },
  title: { ...TYPOGRAPHY.h3, marginBottom: SPACING.xs },
  subtitle: { ...TYPOGRAPHY.body2, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  forgotLink: { alignSelf: 'flex-end', marginTop: -SPACING.sm, marginBottom: SPACING.sm },
  forgotText: { ...TYPOGRAPHY.body2, color: COLORS.primary, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  footerText: { color: 'rgba(255,255,255,0.8)', fontSize: 15 },
  footerLink: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});