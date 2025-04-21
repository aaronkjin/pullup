# Pullup App Design System

This directory contains the design system constants used throughout the Pullup app. These constants help maintain visual consistency, improve developer productivity, and make the app easier to maintain.

## Usage

Import constants using the index file:

```typescript
import { COLORS, SPACING, FONT } from "../constants";

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    padding: SPACING.m,
  },
  title: {
    fontSize: FONT.sizes.xl,
    fontWeight: FONT.weights.bold,
    color: COLORS.text,
  },
});
```

## Available Constants

### Colors (`Colors.ts`)

The color system includes both light and dark mode colors, with a single `COLORS` object that can be updated based on the current theme.

- **Base Colors**: `primary`, `secondary`, `text`, `background`, etc.
- **Semantic Colors**: `success`, `error`, `warning`, `info`
- **Helper Functions**: `updateColors(colorScheme)` to update colors based on theme

### Spacing (`Spacing.ts`)

Consistent spacing throughout the app maintains visual rhythm and hierarchy.

- **Scale**: `xxs` (2px), `xs` (4px), `s` (8px), `m` (16px), `l` (24px), `xl` (32px), `xxl` (48px)
- **Semantic Spacing**: `pagePadding`, `sectionSpacing`, `itemSpacing`, etc.
- **Helper Functions**: `spacing(size, factor)` to calculate spacing values

### Typography (`Typography.ts`)

Typography constants ensure consistent text styling across the app.

- **Font Sizes**: `xs` through `xxl`
- **Font Weights**: `thin`, `light`, `regular`, `medium`, `semiBold`, `bold`, `heavy`
- **Text Styles**: `h1`, `h2`, `h3`, `h4`, `body`, `bodySmall`, `caption`, `button`
- **Helper Functions**: `getTextStyle(style, color)` to get complete text styles

### Shadows (`Shadows.ts`)

Shadow styles provide consistent elevation effects for components.

- **Shadow Sizes**: `none`, `xs`, `s`, `m`, `l`, `xl`
- **Component Shadows**: `card`, `modal`, `button`, `floatingButton`, `header`
- **Helper Functions**: `getShadow(size)` to get platform-specific shadow styles

### Additional Constants

- **APP_CONFIG**: App-wide configuration values
- **SCREEN**: Screen dimensions and device info
- **Z_INDEX**: Consistent z-index values for stacking elements
- **ANIMATION**: Animation timing presets
- **HIT_SLOPS**: Common hit slop values for touchable areas

## Best Practices

1. **Always use constants** instead of hard-coded values
2. **Update the design system** as needed, rather than creating one-off styles
3. **Use helper functions** for consistent implementation
4. **Document any additions** to maintain the design system's integrity
5. **Consider accessibility** when selecting colors, fonts, and spacing
