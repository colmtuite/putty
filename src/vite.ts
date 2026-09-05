import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { transformSource, lineIdentityMap, mayContainCx, ExtractError } from './core/index.ts';
import puttyPostcss, { type PuttyPostcssOptions } from './postcss.ts';

export interface PuttyViteOptions extends PuttyPostcssOptions {
  /**
   * Register the `puttycss/postcss` plugin automatically when the project has no
   * PostCSS config of its own. If you have a `postcss.config.*` file, add
   * `puttycss/postcss` to it instead; Vite ignores its config file when inline
   * PostCSS options are present, so we never override yours.
   * @default true
   */
  postcss?: boolean;
}

const SOURCE_RE = /\.[cm]?[jt]sx?$/;
const POSTCSS_CONFIG_FILES = [
  'postcss.config.js', 'postcss.config.cjs', 'postcss.config.mjs', 'postcss.config.ts',
  'postcss.config.mts', 'postcss.config.cts', '.postcssrc', '.postcssrc.json', '.postcssrc.yaml',
  '.postcssrc.yml', '.postcssrc.js', '.postcssrc.cjs', '.postcssrc.mjs', '.postcssrc.ts',
];

/**
 * Vite plugin: compiles `cx()` calls away. The stylesheet is produced by the
 * `@putty;` directive through PostCSS.
 *
 * ```ts
 * import { putty } from 'puttycss/vite';
 * export default defineConfig({ plugins: [putty(), react()] });
 * ```
 */
export function putty(options: PuttyViteOptions = {}): Plugin {
  const { postcss: autoPostcss = true, ...scanOptions } = options;

  return {
    name: 'puttycss',

    config(userConfig) {
      if (!autoPostcss) return;
      if (userConfig.css?.postcss) return; // inline PostCSS config already present
      const root = path.resolve(userConfig.root ?? process.cwd());
      if (hasPostcssConfigFile(root)) return; // Vite will load it; user adds puttycss/postcss there
      return {
        css: {
          postcss: {
            plugins: [puttyPostcss({ cwd: root, ...scanOptions })],
          },
        },
      };
    },

    transform(code, id) {
      const file = id.split('?')[0];
      if (!SOURCE_RE.test(file) || file.includes('/node_modules/')) return null;
      if (!mayContainCx(code)) return null;

      try {
        const result = transformSource(code, file);
        if (!result.changed) return null;
        return { code: result.code, map: lineIdentityMap(code, file) };
      } catch (e) {
        if (e instanceof ExtractError) {
          this.error({ message: e.message, pos: e.pos });
        }
        throw e;
      }
    },
  };
}

function hasPostcssConfigFile(root: string): boolean {
  for (const name of POSTCSS_CONFIG_FILES) {
    if (fs.existsSync(path.join(root, name))) return true;
  }
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    if (pkg && typeof pkg === 'object' && 'postcss' in pkg) return true;
  } catch {
    // no package.json
  }
  return false;
}

export default putty;
