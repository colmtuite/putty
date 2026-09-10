import { transformSource, lineIdentityMap, mayContainCx, ExtractError } from './core/index.ts';
import { state, missingDirectiveWarning } from './core/state.ts';

/**
 * Minimal slice of webpack's LoaderContext so we don't need `webpack` as a dependency.
 * Turbopack implements the same surface for its webpack-loader compatibility layer.
 */
interface LoaderContext {
  resourcePath: string;
  callback: (err: Error | null, content?: string, sourceMap?: unknown) => void;
  cacheable?: (flag?: boolean) => void;
  /** Present under webpack; absent under Turbopack. */
  _compiler?: Compiler;
}

interface Compiler {
  name?: string;
  hooks: { done: { tap: (name: string, fn: () => void) => void } };
}

const checkedCompilers = new WeakSet<Compiler>();

/**
 * Warn at the end of a compilation if cx() was compiled but no CSS was generated.
 * Next.js runs several compilers; only the client one processes CSS, so the
 * others are skipped to avoid false alarms.
 */
function checkOnDone(compiler: Compiler | undefined): void {
  if (!compiler || checkedCompilers.has(compiler)) return;
  if (compiler.name && compiler.name !== 'client') return;
  checkedCompilers.add(compiler);
  compiler.hooks.done.tap('puttycss', () => {
    const message = missingDirectiveWarning();
    if (message) console.warn(message);
  });
}

/**
 * webpack loader (also runs under Turbopack): compiles `cx()` calls away.
 *
 * ```js
 * // webpack.config.js
 * { test: /\.[jt]sx?$/, exclude: /node_modules/, enforce: 'pre', use: 'puttycss/webpack' }
 * ```
 *
 * For Next.js use `withPutty()` from `puttycss/next`, which registers this for
 * both webpack and Turbopack.
 */
function puttyLoader(this: LoaderContext, source: string): void {
  this.cacheable?.(true);

  if (!mayContainCx(source)) {
    this.callback(null, source);
    return;
  }

  try {
    const result = transformSource(source, this.resourcePath);
    if (!result.changed) {
      this.callback(null, source);
      return;
    }
    state.filesCompiled.add(this.resourcePath);
    checkOnDone(this._compiler);
    this.callback(null, result.code, lineIdentityMap(source, this.resourcePath));
  } catch (e) {
    if (e instanceof ExtractError) {
      // Message already contains file:line:column.
      this.callback(new Error(`[putty] ${e.message}`));
      return;
    }
    this.callback(e instanceof Error ? e : new Error(String(e)));
  }
}

export default puttyLoader;
// Lets webpack's and Turbopack's `require()`-based loader runners get the function directly.
export { puttyLoader as 'module.exports' };
