import type { CSSProperties } from './css-properties.ts';

/**
 * A style object accepted by `cx()`.
 *
 * - Plain CSS properties in camelCase: `{ display: 'flex', gap: 16 }`
 * - Nested selectors, where `&` is the element: `{ '&:hover': { ... }, '& > svg': { ... } }`
 * - Nested at-rules: `{ '@media (min-width: 768px)': { ... }, '@container (...)': { ... } }`
 *
 * Selectors and at-rules can be nested inside each other to any depth.
 * Every value must be a literal string or number; the object is compiled away at build time.
 */
export type StyleObject = {
  [P in keyof CSSProperties]?: CSSProperties[P];
} & {
  [selector: `&${string}`]: StyleObject | undefined;
  [atRule: `@${string}`]: StyleObject | undefined;
};

/**
 * What `cx()` compiles to.
 */
export interface CxResult {
  className: string;
}
