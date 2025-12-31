import type { ThemeConfig } from './types';
import { findCxCalls } from './parser';
import {
  parseStyleObject,
  generateRule,
  StyleDeclaration,
  CSSRule,
} from './generator';

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
export class CSSCollector {
  private rules: Map<string, CSSRule> = new Map();
  private theme: ThemeConfig;

  constructor(theme: ThemeConfig) {
    this.theme = theme;
  }

  /**
   * Add rules and deduplicate
   */
  addRules(newRules: CSSRule[]): void {
    for (const rule of newRules) {
      const key = `${rule.className}:${rule.breakpoint || 'base'}`;
      if (!this.rules.has(key)) {
        this.rules.set(key, rule);
      }
    }
  }

  /**
   * Get all unique rules
   */
  getRules(): CSSRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Clear all rules
   */
  clear(): void {
    this.rules.clear();
  }
}

/**
 * Transform a source file
 * - Find all cx() calls
 * - Parse style objects
 * - Generate CSS rules
 * - Replace cx() calls with { className: '...' }
 */
export function transform(
  source: string,
  theme: ThemeConfig
): TransformResult {
  const cxCalls = findCxCalls(source);
  const allRules: CSSRule[] = [];
  const classNames: Map<string, string[]> = new Map();

  // Process in reverse order to maintain correct positions when replacing
  const sortedCalls = [...cxCalls].sort((a, b) => b.start - a.start);

  let transformedCode = source;

  for (const call of sortedCalls) {
    // Parse the style object into declarations
    const declarations = parseStyleObject(call.styles, theme);

    // Generate CSS rules for each declaration
    const callRules: CSSRule[] = [];
    const callClassNames: string[] = [];

    for (const decl of declarations) {
      const rule = generateRule(decl, theme);
      callRules.push(rule);
      if (!callClassNames.includes(rule.className)) {
        callClassNames.push(rule.className);
      }
    }

    allRules.push(...callRules);

    // Replace the cx() call with { className: '...' }
    const classNameStr = callClassNames.join(' ');
    const replacement = `{ className: "${classNameStr}" }`;

    transformedCode =
      transformedCode.slice(0, call.start) +
      replacement +
      transformedCode.slice(call.end);

    classNames.set(call.raw, callClassNames);
  }

  return {
    code: transformedCode,
    rules: allRules,
    classNames,
  };
}

/**
 * Check if a file should be transformed
 */
export function shouldTransform(id: string): boolean {
  // Transform .tsx, .jsx, .ts, .js files
  return /\.(tsx?|jsx?)$/.test(id) && !id.includes('node_modules');
}

