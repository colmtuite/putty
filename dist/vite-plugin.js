import { transform, CSSCollector } from './transform';
import { generateCSS, generateTokenCSS } from './generator';
/**
 * Virtual module IDs
 */
const VIRTUAL_CX_ID = 'virtual:zero-css';
const RESOLVED_VIRTUAL_CX_ID = '\0' + VIRTUAL_CX_ID;
const VIRTUAL_CSS_ID = 'virtual:zero-css.css';
const RESOLVED_VIRTUAL_CSS_ID = '\0' + VIRTUAL_CSS_ID;
/**
 * Vite plugin for zero-css
 */
export function zeroCSSPlugin(options) {
    const { theme } = options;
    const outputPath = options.output || 'zero-css.css';
    const includeTokens = options.includeTokens !== false;
    const collector = new CSSCollector(theme);
    return {
        name: 'zero-css',
        enforce: 'pre',
        resolveId(id) {
            if (id === VIRTUAL_CX_ID) {
                return RESOLVED_VIRTUAL_CX_ID;
            }
            if (id === VIRTUAL_CSS_ID || id === outputPath || id === `/${outputPath}`) {
                return RESOLVED_VIRTUAL_CSS_ID;
            }
        },
        load(id) {
            if (id === RESOLVED_VIRTUAL_CX_ID) {
                // Provide a typed no-op cx function for development
                // This gets replaced at build time
                return `
          export function cx(styles) {
            // This function is replaced at build time
            // If you see this at runtime, the plugin is not working correctly
            console.warn('[zero-css] cx() was called at runtime - this should not happen');
            return { className: '' };
          }
        `;
            }
            if (id === RESOLVED_VIRTUAL_CSS_ID) {
                // Generate CSS on demand
                const rules = collector.getRules();
                let css = '';
                if (includeTokens) {
                    css += generateTokenCSS(theme) + '\n\n';
                }
                css += generateCSS(rules, theme);
                return css;
            }
        },
        transform(code, id) {
            // Skip non-transformable files
            if (!id.match(/\.(tsx?|jsx?)$/) || id.includes('node_modules')) {
                return null;
            }
            // Skip if no cx() calls
            if (!code.includes('cx(')) {
                return null;
            }
            try {
                const result = transform(code, theme);
                // Collect the rules
                collector.addRules(result.rules);
                return {
                    code: result.code,
                    map: null, // TODO: generate source map
                };
            }
            catch (e) {
                console.error(`[zero-css] Error transforming ${id}:`, e);
                return null;
            }
        },
        buildStart() {
            // Clear collected rules at build start
            collector.clear();
        },
        generateBundle() {
            // Generate and emit CSS file
            const rules = collector.getRules();
            let css = '';
            if (includeTokens) {
                css += generateTokenCSS(theme) + '\n\n';
            }
            css += generateCSS(rules, theme);
            this.emitFile({
                type: 'asset',
                fileName: outputPath,
                source: css,
            });
        },
        // For development mode, serve CSS via middleware
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                if (req.url === `/${outputPath}`) {
                    const rules = collector.getRules();
                    let css = '';
                    if (includeTokens) {
                        css += generateTokenCSS(theme) + '\n\n';
                    }
                    css += generateCSS(rules, theme);
                    res.setHeader('Content-Type', 'text/css');
                    res.end(css);
                    return;
                }
                next();
            });
            // Send HMR update when files change
            server.watcher.on('change', async (file) => {
                if (file.match(/\.(tsx?|jsx?)$/)) {
                    // Trigger a full reload to get new CSS
                    server.ws.send({ type: 'full-reload' });
                }
            });
        },
    };
}
export default zeroCSSPlugin;
//# sourceMappingURL=vite-plugin.js.map