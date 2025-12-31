import type { CSSProperties } from './css-properties';

/**
 * Theme configuration type
 */
export interface ThemeConfig {
  tokens: {
    colors?: Record<string, string>;
    spacing?: Record<string, string>;
    fonts?: Record<string, string>;
    fontSizes?: Record<string, string>;
    fontWeights?: Record<string, string | number>;
    lineHeights?: Record<string, string | number>;
    letterSpacings?: Record<string, string>;
    radii?: Record<string, string>;
    shadows?: Record<string, string>;
    borders?: Record<string, string>;
    zIndices?: Record<string, string | number>;
    sizes?: Record<string, string>;
    transitions?: Record<string, string>;
  };
  breakpoints: Record<string, string>;
}

/**
 * Maps CSS properties to their corresponding token scales
 */
export interface PropertyToScale {
  // Colors
  color: 'colors';
  backgroundColor: 'colors';
  borderColor: 'colors';
  borderTopColor: 'colors';
  borderRightColor: 'colors';
  borderBottomColor: 'colors';
  borderLeftColor: 'colors';
  outlineColor: 'colors';
  fill: 'colors';
  stroke: 'colors';
  caretColor: 'colors';
  accentColor: 'colors';

  // Spacing
  padding: 'spacing';
  paddingTop: 'spacing';
  paddingRight: 'spacing';
  paddingBottom: 'spacing';
  paddingLeft: 'spacing';
  paddingInline: 'spacing';
  paddingBlock: 'spacing';
  margin: 'spacing';
  marginTop: 'spacing';
  marginRight: 'spacing';
  marginBottom: 'spacing';
  marginLeft: 'spacing';
  marginInline: 'spacing';
  marginBlock: 'spacing';
  gap: 'spacing';
  rowGap: 'spacing';
  columnGap: 'spacing';
  top: 'spacing';
  right: 'spacing';
  bottom: 'spacing';
  left: 'spacing';
  inset: 'spacing';

  // Sizes
  width: 'sizes';
  height: 'sizes';
  minWidth: 'sizes';
  minHeight: 'sizes';
  maxWidth: 'sizes';
  maxHeight: 'sizes';
  flexBasis: 'sizes';

  // Typography
  fontFamily: 'fonts';
  fontSize: 'fontSizes';
  fontWeight: 'fontWeights';
  lineHeight: 'lineHeights';
  letterSpacing: 'letterSpacings';

  // Borders
  borderRadius: 'radii';
  borderTopLeftRadius: 'radii';
  borderTopRightRadius: 'radii';
  borderBottomLeftRadius: 'radii';
  borderBottomRightRadius: 'radii';
  border: 'borders';
  borderTop: 'borders';
  borderRight: 'borders';
  borderBottom: 'borders';
  borderLeft: 'borders';

  // Effects
  boxShadow: 'shadows';
  textShadow: 'shadows';

  // Other
  zIndex: 'zIndices';
  transition: 'transitions';
}

/**
 * Get token names for a specific scale
 */
export type TokensForScale<
  T extends ThemeConfig,
  Scale extends keyof T['tokens']
> = T['tokens'][Scale] extends Record<string, unknown>
  ? `$${string & keyof T['tokens'][Scale]}`
  : never;

/**
 * Get the allowed value type for a CSS property
 */
export type PropertyValue<
  T extends ThemeConfig,
  P extends keyof CSSProperties
> = P extends keyof PropertyToScale
  ? PropertyToScale[P] extends keyof T['tokens']
    ? TokensForScale<T, PropertyToScale[P]> | CSSProperties[P]
    : CSSProperties[P]
  : CSSProperties[P];

/**
 * Responsive value - either a plain value or an object with breakpoint keys
 */
export type ResponsiveValue<T extends ThemeConfig, V> =
  | V
  | { [K in keyof T['breakpoints']]?: V };

/**
 * Style object with token support and responsive values
 */
export type StyleObject<T extends ThemeConfig> = {
  [P in keyof CSSProperties]?: ResponsiveValue<T, PropertyValue<T, P>>;
} & {
  // Pseudo-classes
  '&:hover'?: StyleObject<T>;
  '&:focus'?: StyleObject<T>;
  '&:active'?: StyleObject<T>;
  '&:disabled'?: StyleObject<T>;
  '&:first-child'?: StyleObject<T>;
  '&:last-child'?: StyleObject<T>;
  '&:focus-visible'?: StyleObject<T>;
  '&:focus-within'?: StyleObject<T>;

  // Pseudo-elements
  '&::before'?: StyleObject<T>;
  '&::after'?: StyleObject<T>;
  '&::placeholder'?: StyleObject<T>;

  // Arbitrary nested selectors
  [selector: `& ${string}`]: StyleObject<T> | undefined;
  [selector: `&:${string}`]: StyleObject<T> | undefined;
  [selector: `&::${string}`]: StyleObject<T> | undefined;
  [selector: `&[${string}`]: StyleObject<T> | undefined;
};

/**
 * The return type of cx() - just className for React spread
 */
export interface CxResult {
  className: string;
}

/**
 * The cx function type
 */
export type CxFunction<T extends ThemeConfig> = (
  styles: StyleObject<T>
) => CxResult;

