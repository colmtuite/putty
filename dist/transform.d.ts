import type { ThemeConfig } from './types';
import { CSSRule } from './generator';
/**
 * Transform result
 */
export interface TransformResult {
    code: string;
    rules: CSSRule[];
    classNames: Map<string, string[]>;
}
/**
 * Collected CSS rules across all files
 */
export declare class CSSCollector {
    private rules;
    private theme;
    constructor(theme: ThemeConfig);
    /**
     * Add rules and deduplicate
     */
    addRules(newRules: CSSRule[]): void;
    /**
     * Get all unique rules
     */
    getRules(): CSSRule[];
    /**
     * Clear all rules
     */
    clear(): void;
}
/**
 * Transform a source file
 * - Find all cx() calls
 * - Parse style objects
 * - Generate CSS rules
 * - Replace cx() calls with { className: '...' }
 */
export declare function transform(source: string, theme: ThemeConfig): TransformResult;
/**
 * Check if a file should be transformed
 */
export declare function shouldTransform(id: string): boolean;
//# sourceMappingURL=transform.d.ts.map