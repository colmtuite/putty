// Theme utilities
export { defineTheme } from './theme';
// Re-export plugin for convenience
export { zeroCSSPlugin } from './vite-plugin';
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
export function createCx() {
    // This function body is replaced at build time
    // If you see this at runtime, the plugin is not configured correctly
    if (process.env.NODE_ENV !== 'production') {
        console.warn('[zero-css] cx() was called at runtime. ' +
            'Make sure the Vite plugin is configured correctly.');
    }
    return ((styles) => ({ className: '' }));
}
//# sourceMappingURL=index.js.map