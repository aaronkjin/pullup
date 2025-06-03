export const FONT = {
  primary: 'System',  
  secondary: 'System',  
  monospace: 'Courier', 
  
  // Font weight aliases
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
    xs: 12, 
    s: 14,  
    m: 16,  
    l: 18,  
    xl: 24, 
    xxl: 32, 
  },
  
  // Line heights
  lineHeights: {
    tight: 1.2,    
    normal: 1.5,   
    relaxed: 1.8,  
  },
  
  // Text styles
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

// Helper function to get a complete text style
export function getTextStyle(style: keyof typeof FONT.styles, color?: string): object {
  const baseStyle = FONT.styles[style];
  return {
    ...baseStyle,
    color: color,
  };
} 