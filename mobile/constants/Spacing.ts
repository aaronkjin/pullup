export const SPACING = {
  xxs: 2, 
  xs: 4,  
  s: 8,   
  m: 16,  
  l: 24,  
  xl: 32, 
  xxl: 48, 
  
  // Semantic spacing
  pagePadding: 16,    
  sectionSpacing: 24, 
  itemSpacing: 8,     
  componentMargin: 16, 
  buttonPadding: 12,  
  inputHeight: 48,    
  
  // Grid system
  gridGutter: 16,     
  gridMargin: 16,     
  
  // Element-specific spacing
  cardPadding: 16,    
  cardMargin: 8,      
  iconMargin: 8,      
  
  // Responsive breakpoints 
  breakpointSm: 576,  
  breakpointMd: 768,  
  breakpointLg: 992,  
  breakpointXl: 1200, 
};

// Helper function to calculate spacing in a responsive way
export function spacing(size: keyof typeof SPACING, factor: number = 1): number {
  return SPACING[size] * factor;
} 