/**
 * Colors used in-app for light/dark mode
 * Styling: https://www.nativewind.dev/, https://tamagui.dev/, https://reactnativeunistyles.vercel.app
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: '#0a7ea4',
    secondary: '#50a0c0',
    card: '#FFFFFF',
    border: '#E0E0E0',
    secondaryText: '#687076',
    success: '#22C55E',
    error: '#FF3B30',
    warning: '#FFAA33',
    info: '#3498DB',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: '#50a0c0',
    secondary: '#0a7ea4',
    card: '#202124',
    border: '#303030',
    secondaryText: '#9BA1A6',
    success: '#22C55E',
    error: '#FF3B30',
    warning: '#FFAA33',
    info: '#3498DB',
  },
};

// Common in-app color constants
export const COLORS = {
  text: Colors.light.text,
  background: Colors.light.background,
  primary: Colors.light.primary,
  secondary: Colors.light.secondary,
  card: Colors.light.card,
  border: Colors.light.border,
  secondaryText: Colors.light.secondaryText,
  success: Colors.light.success,
  error: Colors.light.error,
  warning: Colors.light.warning,
  info: Colors.light.info,
};

// TODO: Update constant below to include dark mode colors (for theme switching)
export function updateColors(colorScheme: 'light' | 'dark') {
  const colors = Colors[colorScheme];
  
  Object.keys(colors).forEach(key => {
    // @ts-ignore
    COLORS[key] = colors[key];
  });
}
