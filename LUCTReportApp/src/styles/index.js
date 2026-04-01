// src/styles/index.js
import { COLORS, paperTheme, spacing, typography, shadows, createThemedStyles } from '../config/theme';

// Export all theme-related styles
export const theme = {
  colors: COLORS,
  spacing,
  typography,
  shadows,
  paperTheme,
};

// Common style objects that can be reused across components
export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: spacing.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: spacing.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
  },
  successText: {
    color: COLORS.success,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
  },
};

// Helper function to create dynamic styles
export const createStyles = (stylesFn) => {
  return (props) => {
    const styles = stylesFn(props);
    return styles;
  };
};

export { COLORS, spacing, typography, shadows, createThemedStyles };
export default theme;