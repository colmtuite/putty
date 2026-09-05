import { createRequire } from 'node:module';

const LOADER = 'puttycss/webpack';
const SOURCE_GLOBS = ['*.ts', '*.tsx', '*.js', '*.jsx', '*.mjs', '*.cjs', '*.mts', '*.cts'];

/**
 * The parts of `NextConfig` we touch. Kept structural (and deliberately loose) so
 * `next` isn't a dependency and any `NextConfig` version is assignable.
 */
interface NextConfigLike {
  turbopack?: { rules?: Record<string, unknown> | undefined } | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webpack?: ((config: any, context: any) => any) | null | undefined;
}

interface WebpackConfigLike {
  module?: { rules?: unknown[] };
}

/**
 * Wrap your Next.js config so `cx()` calls are compiled away, under both
 * Turbopack and webpack.
 *
 * ```ts
 * // next.config.ts
 * import { withPutty } from 'puttycss/next';
 * export default withPutty({ reactStrictMode: true });
 * ```
 *
 * You still need `puttycss/postcss` in `postcss.config.js` and `@putty;` in
 * your global stylesheet. Next.js runs PostCSS for you in both bundlers.
 */
export function withPutty<T extends NextConfigLike>(nextConfig: T = {} as T): T {
  const loaderPath = resolveLoader();

  const rules: Record<string, unknown> = { ...(nextConfig.turbopack?.rules ?? {}) };
  for (const glob of SOURCE_GLOBS) {
    const existing = rules[glob];
    const loaders = existing && typeof existing === 'object' && Array.isArray((existing as { loaders?: unknown }).loaders)
      ? [...((existing as { loaders: unknown[] }).loaders)]
      : [];
    if (!loaders.includes(loaderPath)) loaders.push(loaderPath);
    rules[glob] = { ...(typeof existing === 'object' ? existing : {}), loaders };
  }

  const userWebpack = nextConfig.webpack;

  return {
    ...nextConfig,
    turbopack: { ...nextConfig.turbopack, rules },
    webpack(config: WebpackConfigLike, context: unknown) {
      config.module ??= {};
      config.module.rules ??= [];
      config.module.rules.push({
        test: /\.[cm]?[jt]sx?$/,
        exclude: /node_modules/,
        enforce: 'pre',
        use: [{ loader: loaderPath }],
      });
      return typeof userWebpack === 'function' ? userWebpack(config, context) : config;
    },
  } as T;
}

function resolveLoader(): string {
  try {
    return createRequire(import.meta.url).resolve(LOADER);
  } catch {
    // Fallback for unusual setups (e.g. this file running from source): let the bundler resolve it.
    return LOADER;
  }
}

export default withPutty;
