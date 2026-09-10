import type * as CSS from 'csstype';

/**
 * CSS properties accepted by `cx()`: every standard, vendor-prefixed and SVG
 * property, from the same `csstype` definitions React uses for the `style` prop.
 *
 * Bare numbers are treated like React's `style` prop: they get a `px` suffix
 * except on unitless properties (`lineHeight`, `opacity`, `zIndex`, `flex`, ...).
 *
 * Custom properties (`--foo`) are always allowed.
 */
export interface CSSProperties extends CSS.Properties<string | number> {
  [customProperty: `--${string}`]: string | number;
}
