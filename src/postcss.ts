import type { PluginCreator } from 'postcss';
import { scan, SOURCE_GLOB, type ScanOptions } from './core/scan.ts';

export interface PuttyPostcssOptions extends ScanOptions {}

const PLUGIN_NAME = 'puttycss';
/** The at-rule users write: `@putty;` */
const DIRECTIVE = 'putty';

/**
 * PostCSS plugin that replaces `@putty;` with the stylesheet generated from
 * every `cx()` call in your source files.
 *
 * ```js
 * // postcss.config.js
 * export default { plugins: { 'puttycss/postcss': { content: ['src'] } } };
 * ```
 * ```css
 * /* globals.css *\/
 * @putty;
 * ```
 */
const putty: PluginCreator<PuttyPostcssOptions> = (options = {}) => ({
  postcssPlugin: PLUGIN_NAME,
  AtRule: {
    [DIRECTIVE]: (atRule, { result, postcss }) => {
      const from = result.opts.from;
      const { css, files, dirs } = scan(options);

      // Tell the bundler which files feed this stylesheet so edits trigger a rebuild.
      // Vite, webpack's postcss-loader and Turbopack all read `dir` from `dir-dependency`
      // (they disagree about `context-dependency`, so we don't emit that one).
      for (const dir of dirs) {
        result.messages.push({ type: 'dir-dependency', plugin: PLUGIN_NAME, dir, glob: SOURCE_GLOB, parent: from });
      }
      for (const file of files) {
        result.messages.push({ type: 'dependency', plugin: PLUGIN_NAME, file, parent: from });
      }

      const generated = postcss.parse(css || '/* putty: no cx() calls found */', { from });
      for (const node of generated.nodes) node.source = atRule.source;
      atRule.replaceWith(generated.nodes);
    },
  },
});

putty.postcss = true;

export default putty;
// Lets `require('puttycss/postcss')` return the plugin itself (Node's require(esm)
// honours this export name), which is how Next.js and postcss-load-config load plugins.
export { putty as 'module.exports' };
