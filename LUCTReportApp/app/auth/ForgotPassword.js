// ForgotPassword
import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, 
  Platform, Alert, TouchableOpacity
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { forgotPassword, clearError } from '../../src/store/authSlice';
import { forgotPasswordSchema } from '../../src/utils/validators';
import { Input, Button } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';

export default function ForgotPasswordScreen({ navigation }) {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.auth);
  const [successMessage, setSuccessMessage] = React.useState(null);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) },
      ]);
    }
  }, [error, dispatch]);

  const onSubmit = async ({ email }) => {
    try {
      await dispatch(forgotPassword(email)).unwrap();
      setSuccessMessage(true);
      Alert.alert(
        'Email Sent',
        'Password reset link has been sent to your email address.',
        [
          { 
            text: 'Back to Login', 
            onPress: () => navigation.navigate('Login') 
          },
        ]
      );
    } catch (err) {
      // Error handled by useEffect
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.iconBox}>
            <Ionicons name="lock-open-outline" size={64} color={COLORS.primary} />
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
                placeholder="you@luct.edu"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email?.message}
                leftIcon={<Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />}
              />
            )}
          />

          <Button
            title="Send Reset Link"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            fullWidth
            size="lg"
            style={styles.resetButton}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
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
    alignItems: 'center',
  },
  iconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: COLORS.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  resetButton: {
    marginTop: spacing.md,
  },
});