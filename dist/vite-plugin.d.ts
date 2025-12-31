import type { Plugin } from 'vite';
import type { ThemeConfig } from './types';
export interface ZeroCSSPluginOptions {
    /**
     * Theme configuration (required)
     */
    theme: ThemeConfig;
    /**
     * Output path for the generated CSS file
     * @default 'zero-css.css'
     */
    output?: string;
    /**
     * Include CSS custom properties for tokens
     * @default true
     */
    includeTokens?: boolean;
}
/**
 * Vite plugin for zero-css
 */
export declare function zeroCSSPlugin(options: ZeroCSSPluginOptions): Plugin;
export default zeroCSSPlugin;
//# sourceMappingURL=vite-plugin.d.ts.map