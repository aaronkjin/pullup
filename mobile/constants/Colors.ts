/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
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

// Common color constants used throughout the app
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

// Update this constant to include dark mode colors when implementing theme switching
export function updateColors(colorScheme: 'light' | 'dark') {
  const colors = Colors[colorScheme];
  
  Object.keys(colors).forEach(key => {
    // @ts-ignore
    COLORS[key] = colors[key];
  });
}
