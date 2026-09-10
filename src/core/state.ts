/**
 * Per-process bookkeeping shared between the bundler transform and the PostCSS
 * plugin, so the bundler can warn when `cx()` calls were compiled but the
 * `@putty;` directive never produced any CSS.
 */
export const state = {
  /** Files in which `cx()` calls were compiled away. */
  filesCompiled: new Set<string>(),
  /** How many times the `@putty;` directive was processed. */
  directiveRuns: 0,
};

/** Message to show when styles were compiled but no stylesheet was generated, or null. */
export function missingDirectiveWarning(): string | null {
  const n = state.filesCompiled.size;
  if (n === 0 || state.directiveRuns > 0) return null;
  return (
    `[putty] cx() was compiled in ${n} file${n === 1 ? '' : 's'} but the @putty; directive never ran, ` +
    `so no CSS was generated. Add \`@putty;\` to your global stylesheet and make sure ` +
    `puttycss/postcss is in your PostCSS config.`
  );
}

/** For tests. */
export function resetState(): void {
  state.filesCompiled.clear();
  state.directiveRuns = 0;
}
