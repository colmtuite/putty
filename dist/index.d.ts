export type { ThemeConfig, StyleObject, CxResult, CxFunction, PropertyToScale, ResponsiveValue, PropertyValue, TokensForScale, } from './types';
export type { CSSProperties } from './css-properties';
export { defineTheme } from './theme';
export { zeroCSSPlugin } from './vite-plugin';
export type { ZeroCSSPluginOptions } from './vite-plugin';
/**
 * Create a typed cx function for your theme
 *
 * @example
 * ```tsx
 * // styles.ts
 * import { defineTheme, createCx } from 'zero-css';
 *
 * export const theme = defineTheme({
 *   tokens: {
 *     colors: { primary: '#007bff' },
 *     spacing: { 1: '4px', 2: '8px' },
 *   },
 *   breakpoints: { sm: '640px', md: '768px' },
 * });
 *
 * export const cx = createCx<typeof theme>();
 * ```
 *
 * Then in components:
 * ```tsx
 * import { cx } from './styles';
 *
 * <div {...cx({ display: 'flex', gap: '$1' })} />
 * ```
 */
export declare function createCx<T extends import('./types').ThemeConfig>(): import('./types').CxFunction<T>;
//# sourceMappingURL=index.d.ts.map