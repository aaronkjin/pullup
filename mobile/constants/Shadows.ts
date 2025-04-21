/**
 * Generated via Cursor rules.
 * ------------------------------------------------------------------------------------------------
 * Standardized shadow styles for use throughout the app.
 * These provide consistent elevation effects for components.
 * ------------------------------------------------------------------------------------------------
 */

import { Platform } from 'react-native';

// Type definitions for shadow styles
type IOSShadow = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
};

type AndroidShadow = {
  elevation: number;
};

type ShadowSizes = 'none' | 'xs' | 's' | 'm' | 'l' | 'xl';

// Shadow definitions for iOS
const iosShadows: Record<ShadowSizes, IOSShadow> = {
  // No shadow
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  
  // Subtle shadow for subtle elevation
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  
  // Light shadow for cards and surfaces
  s: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  // Medium shadow for floating elements
  m: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  
  // Large shadow for modals and popups
  l: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  
  // Extra large shadow for prominent UI elements
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
};

// Shadow definitions for Android (using elevation)
const androidShadows: Record<ShadowSizes, AndroidShadow> = {
  none: { elevation: 0 },
  xs: { elevation: 1 },
  s: { elevation: 2 },
  m: { elevation: 4 },
  l: { elevation: 8 },
  xl: { elevation: 16 },
};

// Create a type that can be either iOS or Android shadows
type PlatformShadows = Record<ShadowSizes, IOSShadow | AndroidShadow>;

// Export platform-specific shadow objects
export const SHADOWS: PlatformShadows = Platform.OS === 'ios' 
  ? iosShadows 
  : androidShadows;

/**
 * Helper function to get shadow styles based on elevation level
 * @param size - Shadow size from 'none', 'xs', 's', 'm', 'l', 'xl'
 * @returns Platform-specific shadow styles
 */
export function getShadow(size: ShadowSizes): IOSShadow | AndroidShadow {
  return SHADOWS[size] || SHADOWS.none;
}

/**
 * Predefined shadow styles for common components
 */
export const COMPONENT_SHADOWS = {
  card: getShadow('s'),
  modal: getShadow('l'),
  button: getShadow('xs'),
  floatingButton: getShadow('m'),
  header: getShadow('s'),
  dropdown: getShadow('m'),
}; 