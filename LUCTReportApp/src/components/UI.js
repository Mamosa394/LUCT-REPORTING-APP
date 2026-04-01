// src/components/UI.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ActivityIndicator, 
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/theme';
import { spacing, typography, shadows } from '../config/theme';

const { width } = Dimensions.get('window');

// Button Variants
const BUTTON_VARIANTS = {
  primary: { bg: COLORS.primary, text: COLORS.buttonPrimaryText, border: COLORS.primary },
  secondary: { bg: COLORS.buttonSecondary, text: COLORS.buttonSecondaryText, border: COLORS.border },
  outline: { bg: 'transparent', text: COLORS.primary, border: COLORS.primary },
  ghost: { bg: 'transparent', text: COLORS.textSecondary, border: 'transparent' },
  danger: { bg: COLORS.error, text: '#FFFFFF', border: COLORS.error },
  success: { bg: COLORS.success, text: '#FFFFFF', border: COLORS.success },
};

const BUTTON_SIZES = {
  sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, fontSize: 13 },
  md: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, fontSize: 14 },
  lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, fontSize: 16 },
};

// Card Component
export function Card({ children, style, onPress }) {
  if (onPress) {
    return (
      <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.85}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

// Button Component
export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
  textStyle
}) {
  const v = BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary;
  const s = BUTTON_SIZES[size] || BUTTON_SIZES.md;
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.btnBase,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
          opacity: isDisabled ? 0.6 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        variant === 'primary' && shadows.small,
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <View style={styles.btnContent}>
          {icon && <View style={styles.btnIcon}>{icon}</View>}
          <Text style={[styles.btnText, { color: v.text, fontSize: s.fontSize }, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Input Component
export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  multiline,
  numberOfLines,
  keyboardType,
  autoCapitalize = 'none',
  editable = true,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPassword = secureTextEntry;

  return (
    <View style={[styles.inputContainer, style]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <View style={[
        styles.inputWrapper,
        isFocused && styles.inputFocused,
        error && styles.inputErrorBorder,
        !editable && styles.inputDisabled,
      ]}>
        {leftIcon && <View style={styles.inputLeftIcon}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.inputField,
            multiline && styles.inputMultiline,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.placeholder}
          secureTextEntry={isPassword && !showPassword}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity style={styles.inputRightIcon} onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && (
          <TouchableOpacity style={styles.inputRightIcon} onPress={onRightIconPress}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.inputErrorText}>{error}</Text>}
    </View>
  );
}

// Modal Component
export function AppModal({ visible, onClose, title, children, style }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, style]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

// Loading Spinner
export function LoadingSpinner({ message = 'Loading...', fullScreen = false }) {
  const containerStyle = fullScreen ? styles.fullScreenLoader : styles.inlineLoader;
  return (
    <View style={containerStyle}>
      <ActivityIndicator size={fullScreen ? "large" : "small"} color={COLORS.primary} />
      {message && <Text style={styles.loadingText}>{message}</Text>}
    </View>
  );
}

// Status Badge
export function StatusBadge({ status, size = 'sm' }) {
  const colorMap = {
    present: COLORS.success,
    absent: COLORS.error,
    late: COLORS.warning,
    excused: COLORS.info,
    draft: COLORS.textDisabled,
    submitted: COLORS.primary,
    reviewed: COLORS.warning,
    feedback_given: COLORS.success,
    pending: COLORS.warning,
    active: COLORS.success,
    inactive: COLORS.error,
    approved: COLORS.success,
    rejected: COLORS.error,
  };
  const bg = colorMap[status] || COLORS.primary;
  return (
    <View style={[styles.badge, { backgroundColor: bg + '20' }]}>
      <Text style={[styles.badgeText, { color: bg, fontSize: size === 'sm' ? 11 : 13 }]}>
        {status?.replace(/_/g, ' ').toUpperCase()}
      </Text>
    </View>
  );
}

// Empty State
export function EmptyState({ icon, title, message, buttonText, onButtonPress }) {
  return (
    <View style={styles.emptyStateContainer}>
      <Ionicons name={icon || 'folder-outline'} size={64} color={COLORS.textDisabled} />
      <Text style={styles.emptyStateTitle}>{title || 'No Data'}</Text>
      <Text style={styles.emptyStateMessage}>{message || 'No items to display'}</Text>
      {buttonText && (
        <Button
          title={buttonText}
          onPress={onButtonPress}
          variant="primary"
          size="sm"
          style={styles.emptyStateButton}
        />
      )}
    </View>
  );
}

// Divider
export function Divider({ style }) {
  return <View style={[styles.divider, style]} />;
}

// Screen Container
export function ScreenContainer({ children, scrollable = true, style }) {
  if (scrollable) {
    return (
      <ScrollView 
        style={[styles.container, style]} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {children}
      </ScrollView>
    );
  }
  return <View style={[styles.container, style]}>{children}</View>;
}

// Stats Card
export function StatsCard({ title, value, icon, trend, trendValue, color }) {
  return (
    <View style={[styles.statsCard, { borderTopColor: color || COLORS.primary }]}>
      <View style={styles.statsHeader}>
        <Text style={styles.statsTitle}>{title}</Text>
        {icon && <View style={styles.statsIcon}>{icon}</View>}
      </View>
      <Text style={[styles.statsValue, { color: color || COLORS.text }]}>{value}</Text>
      {trend && (
        <View style={styles.trendContainer}>
          <Ionicons 
            name={trend === 'up' ? 'trending-up' : 'trending-down'} 
            size={14} 
            color={trend === 'up' ? COLORS.success : COLORS.error} 
          />
          <Text style={[styles.trendText, { color: trend === 'up' ? COLORS.success : COLORS.error }]}>
            {trendValue}
          </Text>
          <Text style={styles.trendLabel}>vs last month</Text>
        </View>
      )}
    </View>
  );
}

// Avatar
export function Avatar({ name, size = 40, imageUrl, style }) {
  const initials = name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }, style]}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.avatarImage} />
      ) : (
        <Text style={[styles.avatarText, { fontSize: size / 2.5 }]}>{initials}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnBase: {
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  btnContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  btnIcon: { 
    marginRight: spacing.xs 
  },
  btnText: { 
    fontWeight: '600', 
    letterSpacing: 0.3 
  },
  inputContainer: { 
    marginBottom: spacing.md 
  },
  inputLabel: { 
    ...typography.body, 
    marginBottom: spacing.xs, 
    color: COLORS.textSecondary 
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: spacing.md,
  },
  inputFocused: { 
    borderColor: COLORS.primary 
  },
  inputErrorBorder: { 
    borderColor: COLORS.error 
  },
  inputDisabled: { 
    opacity: 0.6 
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  inputMultiline: { 
    minHeight: 100, 
    textAlignVertical: 'top', 
    paddingTop: spacing.sm 
  },
  inputLeftIcon: { 
    marginRight: spacing.sm 
  },
  inputRightIcon: { 
    marginLeft: spacing.sm 
  },
  inputErrorText: { 
    ...typography.caption, 
    color: COLORS.error, 
    marginTop: spacing.xs 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: COLORS.backdrop, 
    justifyContent: 'flex-end' 
  },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: spacing.lg 
  },
  modalTitle: { 
    ...typography.h3, 
    color: COLORS.text 
  },
  fullScreenLoader: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: COLORS.background 
  },
  inlineLoader: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: spacing.lg 
  },
  loadingText: { 
    ...typography.body, 
    color: COLORS.textSecondary, 
    marginTop: spacing.sm 
  },
  badge: { 
    paddingHorizontal: spacing.sm, 
    paddingVertical: spacing.xs, 
    borderRadius: 12, 
    alignSelf: 'flex-start' 
  },
  badgeText: { 
    fontWeight: '700', 
    textTransform: 'capitalize' 
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyStateTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginTop: spacing.md,
  },
  emptyStateMessage: {
    ...typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  emptyStateButton: {
    marginTop: spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: spacing.md,
  },
  statsCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: spacing.md,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.md,
    flex: 1,
    borderTopWidth: 3,
    ...shadows.small,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statsTitle: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
  },
  statsIcon: {
    opacity: 0.7,
  },
  statsValue: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    ...typography.caption,
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
  },
  trendLabel: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  avatar: {
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
});

export default {
  Card,
  Button,
  Input,
  AppModal,
  LoadingSpinner,
  StatusBadge,
  EmptyState,
  Divider,
  ScreenContainer,
  StatsCard,
  Avatar,
};