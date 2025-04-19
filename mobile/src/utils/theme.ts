import { DefaultTheme } from 'react-native-paper';

export const COLORS = {
  primary: '#007AFF', // Main blue
  secondary: '#5E5CE6', // Secondary purple
  background: '#F2F2F7', // Light gray bg
  card: '#FFFFFF', // White card bg
  text: '#000000', // Black text
  secondaryText: '#8E8E93', // Gray text
  border: '#E5E5EA', // Light border
  notification: '#FF3B30', // Red for notifs
  success: '#34C759', // Green for success
  warning: '#FF9500', // Orange for warnings
  error: '#FF3B30', // Red for errors
};

export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const FONT = {
  regular: {
    fontFamily: 'System',
    fontWeight: '400',
  },
  medium: {
    fontFamily: 'System',
    fontWeight: '500',
  },
  bold: {
    fontFamily: 'System',
    fontWeight: '700',
  },
  sizes: {
    xs: 12,
    s: 14,
    m: 16,
    l: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
};

export const theme = {
  ...DefaultTheme,
  dark: false,
  roundness: 12,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    accent: COLORS.secondary,
    background: COLORS.background,
    text: COLORS.text,
    placeholder: COLORS.secondaryText,
    surface: COLORS.card,
    border: COLORS.border,
    notification: COLORS.notification,
    error: COLORS.error,
  },
}; 