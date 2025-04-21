/**
 * Generated via Cursor rules.
 * ------------------------------------------------------------------------------------------------ 
 * Typography constants used throughout the app.
 * These values ensure consistent text styles and font usage.
 * ------------------------------------------------------------------------------------------------
 */

export const FONT = {
  // Font families
  primary: 'System',  // Default system font
  secondary: 'System',  // Secondary font
  monospace: 'Courier', // For code or technical content
  
  // Font weight aliases for semantic usage
  weights: {
    thin: '200',
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    heavy: '800',
  },
  
  // Font sizes
  sizes: {
    xs: 12,  // Extra small text (captions, footnotes)
    s: 14,   // Small text (secondary information)
    m: 16,   // Medium text (body text, main content)
    l: 18,   // Large text (important content, section titles)
    xl: 24,  // Extra large (screen titles, major headings)
    xxl: 32, // Extra extra large (hero text, prominent display)
  },
  
  // Line heights
  lineHeights: {
    tight: 1.2,    // Compact line spacing
    normal: 1.5,   // Standard line spacing
    relaxed: 1.8,  // More spacious line spacing
  },
  
  // Text styles for common use cases
  styles: {
    h1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 1.4,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 1.4,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.6,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 1.4,
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 1.4,
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 1.4,
    },
  },
};

/**
 * Helper function to get a complete text style
 * @param style - Style name from FONT.styles
 * @param color - Optional text color 
 * @returns Text style object with font properties
 */
export function getTextStyle(style: keyof typeof FONT.styles, color?: string): object {
  const baseStyle = FONT.styles[style];
  return {
    ...baseStyle,
    color: color,
  };
} 