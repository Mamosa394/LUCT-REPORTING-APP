import React, { useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { sendPasswordReset, clearError, clearSuccessMessage } from '../../src/store/slices/authSlice';
import { useAuth } from '../../src/utils/hooks/useAuth';
import { forgotPasswordSchema } from '../../src/utils/validators/validators';
import Input from '../../src/components/common/Input';
import Button from '../../src/components/common/Button';
import { COLORS } from '../../src/styles/colors';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../src/styles/typography';

export default function ForgotPasswordScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoading, error, successMessage } = useAuth();

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  useEffect(() => {
    if (error) Alert.alert('Error', error, [{ text: 'OK', onPress: () => dispatch(clearError()) }]);
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      Alert.alert('Email Sent', successMessage, [
        { text: 'Back to Login', onPress: () => { dispatch(clearSuccessMessage()); router.replace('/(auth)/login'); } },
      ]);
    }
  }, [successMessage]);

  const onSubmit = ({ email }) => dispatch(sendPasswordReset(email));

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back to Login</Text>
        </TouchableOpacity>

        <View style={styles.iconBox}>
          <Text style={styles.iconEmoji}>🔐</Text>
        </View>

        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your registered email address and we'll send you a link to reset your password.
        </Text>

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
            />
          )}
        />

        <Button
          title="Send Reset Link"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          fullWidth
          size="lg"
          style={{ marginTop: SPACING.md }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: SPACING.xl, paddingTop: SPACING.xxl },
  backBtn: { marginBottom: SPACING.xl },
  backText: { color: COLORS.primary, fontWeight: '600', fontSize: 15 },
  iconBox: { alignItems: 'center', marginBottom: SPACING.lg },
  iconEmoji: { fontSize: 64 },
  title: { ...TYPOGRAPHY.h2, marginBottom: SPACING.sm },
  subtitle: { ...TYPOGRAPHY.body1, color: COLORS.textSecondary, marginBottom: SPACING.xl, lineHeight: 24 },
});