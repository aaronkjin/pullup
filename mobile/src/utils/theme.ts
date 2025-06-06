import { DefaultTheme } from 'react-native-paper';

export const COLORS = {
  primary: '#007AFF',
  secondary: '#5E5CE6', 
  background: '#F2F2F7', 
  card: '#FFFFFF', 
  text: '#000000', 
  secondaryText: '#8E8E93', 
  border: '#E5E5EA', 
  notification: '#FF3B30', 
  success: '#34C759', 
  warning: '#FF9500', 
  error: '#FF3B30', 
  disabled: '#D1D1D6', 
  disabledText: '#C7C7CC', 
  lightBlue: '#EBF5FF', 
  lightRed: '#FFE4E4', 
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