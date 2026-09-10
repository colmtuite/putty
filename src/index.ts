export type { StyleObject, ClassNames, CxResult } from './types.ts';
export type { CSSProperties } from './css-properties.ts';

import type { StyleObject, ClassNames, CxResult } from './types.ts';

/**
 * Compile a style object to atomic class names, optionally combined with
 * existing class names.
 *
 * This function never runs. Every `cx(...)` call is replaced at build time
 * with a literal `{ className: '...' }` object and the generated CSS is emitted
 * through the `@putty;` PostCSS directive. If you see the error below, the
 * putty transform is not configured for the bundler that processed this file.
 *
 * @example
 * ```tsx
 * import { cx } from 'puttycss';
 *
 * <div {...cx({ display: 'flex', gap: 16, '&:hover': { opacity: 0.8 } })} />
 * <button {...cx('button secondary', { marginTop: 16 })} />
 * ```
 */
export function cx(styles: StyleObject): CxResult;
export function cx(classNames: ClassNames, styles: StyleObject): CxResult;
export function cx(): CxResult {
  throw new Error(
    '[putty] cx() was called at runtime. The putty transform is not set up ' +
      'for this file. Add the plugin for your bundler (puttycss/vite, puttycss/next ' +
      'or puttycss/webpack) so cx() calls are compiled away.',
  );
}
