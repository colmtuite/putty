import type { ThemeConfig } from './types';
/**
 * Resolve a token value to CSS custom property or literal value
 */
export declare function resolveValue(value: string | number, property: string, theme: ThemeConfig): string;
/**
 * Parsed style declaration
 */
export interface StyleDeclaration {
    property: string;
    value: string;
    breakpoint?: string;
    selector?: string;
}
/**
 * CSS rule with class name
 */
export interface CSSRule {
    className: string;
    css: string;
    breakpoint?: string;
}
/**
 * Generate a CSS rule for a style declaration
 */
export declare function generateRule(decl: StyleDeclaration, theme: ThemeConfig): CSSRule;
/**
 * Parse a style object into declarations
 */
export declare function parseStyleObject(styles: Record<string, unknown>, theme: ThemeConfig, parentSelector?: string): StyleDeclaration[];
/**
 * Group rules by breakpoint and generate final CSS
 */
export declare function generateCSS(rules: CSSRule[], theme: ThemeConfig): string;
/**
 * Generate CSS custom properties from theme tokens
 */
export declare function generateTokenCSS(theme: ThemeConfig): string;
//# sourceMappingURL=generator.d.ts.map