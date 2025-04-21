/**
 * Generated via Cursor rules.
 * ------------------------------------------------------------------------------------------------
 * This file exports all constants from the constants directory.
 * It provides a convenient way to import multiple constants using a single import statement.
 * 
 * Usage:
 * import { COLORS, SPACING, FONT, SHADOWS } from '../constants';
 * ------------------------------------------------------------------------------------------------
 */

export { Colors, COLORS, updateColors } from './Colors';
export { SPACING, spacing } from './Spacing';
export { FONT, getTextStyle } from './Typography';
export { SHADOWS, getShadow, COMPONENT_SHADOWS } from './Shadows';

// Export additional constants or configuration values
export const APP_CONFIG = {
  APP_NAME: 'Pullup',
  VERSION: '1.0.0',
  MIN_PASSWORD_LENGTH: 8,
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB in bytes
  API_TIMEOUT: 30000, // 30 seconds
  ANIMATION_DURATION: 300, // ms
  DEFAULT_AVATAR: 'https://via.placeholder.com/150',
};

// Screen dimensions (can be updated on app start or orientation change)
import { Dimensions } from 'react-native';
export const SCREEN = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
  isSmallDevice: Dimensions.get('window').width < 375,
};

// Z-index values for consistent stacking
export const Z_INDEX = {
  base: 0,
  card: 10,
  header: 20,
  modal: 30,
  toast: 40,
  tooltip: 50,
  overlay: 1000,
};

// Animation timing presets
export const ANIMATION = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// Common hit slop values for touchable areas
export const HIT_SLOPS = {
  small: { top: 5, left: 5, bottom: 5, right: 5 },
  medium: { top: 10, left: 10, bottom: 10, right: 10 },
  large: { top: 20, left: 20, bottom: 20, right: 20 },
}; 