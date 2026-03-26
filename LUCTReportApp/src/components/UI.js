import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ActivityIndicator, 
  TextInput 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../styles/colors';
import { SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../styles/typography';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const BUTTON_VARIANTS = {
  primary: { bg: COLORS.primary, text: COLORS.white, border: COLORS.primary },
  secondary: { bg: COLORS.secondary, text: COLORS.white, border: COLORS.secondary },
  outline: { bg: 'transparent', text: COLORS.primary, border: COLORS.primary },
  ghost: { bg: 'transparent', text: COLORS.primary, border: 'transparent' },
  danger: { bg: COLORS.error, text: COLORS.white, border: COLORS.error },
  success: { bg: COLORS.success, text: COLORS.white, border: COLORS.success },
};

const BUTTON_SIZES = {
  sm: { paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md, fontSize: 13 },
  md: { paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.lg, fontSize: 14 },
  lg: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, fontSize: 16 },
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

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

export function Button({
  title, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, fullWidth = false,
  icon, style, textStyle
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
        variant === 'primary' && SHADOWS.sm,
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

export function Input({
  label, value, onChangeText, placeholder, secureTextEntry,
  error, multiline, numberOfLines, keyboardType,
  autoCapitalize = 'none', editable = true, leftIcon,
  rightIcon, onRightIconPress, style, inputStyle, ...props
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
          style={[styles.inputField, multiline && styles.inputMultiline, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          secureTextEntry={isPassword && !showPassword}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity style={styles.inputRightIcon} onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.gray500} />
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

export function AppModal({ visible, onClose, title, children, style }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, style]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.gray600} />
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

export function LoadingSpinner({ message = 'Loading...', fullScreen = false }) {
  const containerStyle = fullScreen ? styles.fullScreenLoader : styles.inlineLoader;
  return (
    <View style={containerStyle}>
      <ActivityIndicator size={fullScreen ? "large" : "small"} color={COLORS.primary} />
      {message && <Text style={styles.loadingText}>{message}</Text>}
    </View>
  );
}

export function StatusBadge({ status, size = 'sm' }) {
  const colorMap = {
    present: COLORS.success, absent: COLORS.error, late: COLORS.warning,
    excused: COLORS.info, draft: COLORS.gray500, submitted: COLORS.primary,
    reviewed: COLORS.warning, feedback_given: COLORS.success, pending: COLORS.warning,
    active: COLORS.success, inactive: COLORS.error,
  };
  const bg = colorMap[status] || COLORS.gray500;
  return (
    <View style={[styles.badge, { backgroundColor: bg + '22' }]}>
      <Text style={[styles.badgeText, { color: bg, fontSize: size === 'sm' ? 11 : 13 }]}>
        {status?.replace(/_/g, ' ').toUpperCase()}
      </Text>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  btnBase: {
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  btnContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  btnIcon: { marginRight: SPACING.xs },
  btnText: { fontWeight: '600', letterSpacing: 0.3 },
  inputContainer: { marginBottom: SPACING.md },
  inputLabel: { ...TYPOGRAPHY.h6, marginBottom: SPACING.xs, color: COLORS.text },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1.5,
    borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.md,
  },
  inputFocused: { borderColor: COLORS.primary },
  inputErrorBorder: { borderColor: COLORS.error },
  inputDisabled: { backgroundColor: COLORS.gray100 },
  inputField: { flex: 1, fontSize: 15, color: COLORS.text, paddingVertical: SPACING.sm + 2, minHeight: 48 },
  inputMultiline: { minHeight: 100, textAlignVertical: 'top', paddingTop: SPACING.sm },
  inputLeftIcon: { marginRight: SPACING.sm },
  inputRightIcon: { marginLeft: SPACING.sm },
  inputErrorText: { ...TYPOGRAPHY.caption, color: COLORS.error, marginTop: SPACING.xs },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.white, borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl, padding: SPACING.lg, maxHeight: '90%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitle: { ...TYPOGRAPHY.h4 },
  fullScreenLoader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  inlineLoader: { alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
  loadingText: { ...TYPOGRAPHY.body2, color: COLORS.textSecondary, marginTop: SPACING.sm },
  badge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: BORDER_RADIUS.full, alignSelf: 'flex-start' },
  badgeText: { fontWeight: '700', textTransform: 'capitalize' },
});