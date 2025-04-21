/**
 * Generated via Cursor rules.
 * ------------------------------------------------------------------------------------------------
 * Standardized spacing values used throughout the app.
 * These values ensure consistent margins, paddings, and layout spacings.
 * ------------------------------------------------------------------------------------------------
 */

export const SPACING = {
  // Basic spacing scale
  xxs: 2, // Extra extra small
  xs: 4,  // Extra small
  s: 8,   // Small
  m: 16,  // Medium
  l: 24,  // Large
  xl: 32, // Extra large
  xxl: 48, // Extra extra large
  
  // Semantic spacing
  pagePadding: 16,    // Standard padding for screens
  sectionSpacing: 24, // Space between major sections
  itemSpacing: 8,     // Space between list items or related elements
  componentMargin: 16, // Margin around components
  buttonPadding: 12,  // Standard padding for buttons
  inputHeight: 48,    // Height for input fields
  
  // Grid system
  gridGutter: 16,     // Space between grid columns
  gridMargin: 16,     // Margin for grid container
  
  // Element-specific spacing
  cardPadding: 16,    // Internal padding for cards
  cardMargin: 8,      // External margin for cards
  iconMargin: 8,      // Standard margin around icons
  
  // Responsive breakpoints (for reference)
  breakpointSm: 576,  // Small screen breakpoint
  breakpointMd: 768,  // Medium screen breakpoint
  breakpointLg: 992,  // Large screen breakpoint
  breakpointXl: 1200, // Extra large screen breakpoint
};

/**
 * Helper function to calculate spacing in a responsive way
 * @param size - Base spacing size
 * @param factor - Multiplication factor (default: 1)
 * @returns Calculated spacing value
 */
export function spacing(size: keyof typeof SPACING, factor: number = 1): number {
  return SPACING[size] * factor;
} 