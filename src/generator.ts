import type { ThemeConfig } from './types';
import { toKebabCase } from './css-properties';
import { generateClassName } from './hash';

/**
 * Property to token scale mapping
 */
const propertyToScale: Record<string, string> = {
  // Colors
  color: 'colors',
  backgroundColor: 'colors',
  borderColor: 'colors',
  borderTopColor: 'colors',
  borderRightColor: 'colors',
  borderBottomColor: 'colors',
  borderLeftColor: 'colors',
  outlineColor: 'colors',
  fill: 'colors',
  stroke: 'colors',
  caretColor: 'colors',
  accentColor: 'colors',

  // Spacing
  padding: 'spacing',
  paddingTop: 'spacing',
  paddingRight: 'spacing',
  paddingBottom: 'spacing',
  paddingLeft: 'spacing',
  paddingInline: 'spacing',
  paddingBlock: 'spacing',
  margin: 'spacing',
  marginTop: 'spacing',
  marginRight: 'spacing',
  marginBottom: 'spacing',
  marginLeft: 'spacing',
  marginInline: 'spacing',
  marginBlock: 'spacing',
  gap: 'spacing',
  rowGap: 'spacing',
  columnGap: 'spacing',
  top: 'spacing',
  right: 'spacing',
  bottom: 'spacing',
  left: 'spacing',
  inset: 'spacing',

  // Sizes
  width: 'sizes',
  height: 'sizes',
  minWidth: 'sizes',
  minHeight: 'sizes',
  maxWidth: 'sizes',
  maxHeight: 'sizes',
  flexBasis: 'sizes',

  // Typography
  fontFamily: 'fonts',
  fontSize: 'fontSizes',
  fontWeight: 'fontWeights',
  lineHeight: 'lineHeights',
  letterSpacing: 'letterSpacings',

  // Borders
  borderRadius: 'radii',
  borderTopLeftRadius: 'radii',
  borderTopRightRadius: 'radii',
  borderBottomLeftRadius: 'radii',
  borderBottomRightRadius: 'radii',
  border: 'borders',
  borderTop: 'borders',
  borderRight: 'borders',
  borderBottom: 'borders',
  borderLeft: 'borders',

  // Effects
  boxShadow: 'shadows',
  textShadow: 'shadows',

  // Other
  zIndex: 'zIndices',
  transition: 'transitions',
};

/**
 * Resolve a token value to CSS custom property or literal value
 */
export function resolveValue(
  value: string | number,
  property: string,
  theme: ThemeConfig
): string {
  if (typeof value === 'number') {
    return String(value);
  }

  // Check if it's a token reference
  if (value.startsWith('$')) {
    const tokenName = value.slice(1);
    const scale = propertyToScale[property];

    if (scale && theme.tokens[scale as keyof typeof theme.tokens]) {
      const scaleTokens = theme.tokens[scale as keyof typeof theme.tokens] as Record<string, unknown>;
      if (scaleTokens && tokenName in scaleTokens) {
        // Return CSS custom property
        return `var(--jui-${scale}-${tokenName})`;
      }
    }

    // Try to find the token in any scale
    for (const [scaleName, tokens] of Object.entries(theme.tokens)) {
      if (tokens && typeof tokens === 'object' && tokenName in tokens) {
        return `var(--jui-${scaleName}-${tokenName})`;
      }
    }

    // Token not found - return as-is but warn
    console.warn(`[zero-css] Unknown token: ${value}`);
    return value;
  }

  return value;
}

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
export function generateRule(
  decl: StyleDeclaration,
  theme: ThemeConfig
): CSSRule {
  const { property, value, breakpoint, selector } = decl;
  const resolvedValue = resolveValue(value, property, theme);
  const cssProperty = toKebabCase(property);
  const className = generateClassName(property, value, breakpoint, selector);

  let css: string;

  if (selector) {
    // Handle pseudo-classes, pseudo-elements, and nested selectors
    const fullSelector = selector.replace('&', `.${className}`);
    css = `${fullSelector} { ${cssProperty}: ${resolvedValue}; }`;
  } else {
    css = `.${className} { ${cssProperty}: ${resolvedValue}; }`;
  }

  return { className, css, breakpoint };
}

/**
 * Parse a style object into declarations
 */
export function parseStyleObject(
  styles: Record<string, unknown>,
  theme: ThemeConfig,
  parentSelector?: string
): StyleDeclaration[] {
  const declarations: StyleDeclaration[] = [];
  const breakpointNames = Object.keys(theme.breakpoints);

  for (const [key, value] of Object.entries(styles)) {
    if (value === undefined || value === null) continue;

    // Check if it's a nested selector (starts with &)
    if (key.startsWith('&')) {
      const nestedStyles = value as Record<string, unknown>;
      const nestedDecls = parseStyleObject(nestedStyles, theme, key);
      declarations.push(...nestedDecls);
      continue;
    }

    // Check if value is a responsive object
    if (
      typeof value === 'object' &&
      !Array.isArray(value) &&
      value !== null
    ) {
      const responsiveValue = value as Record<string, string | number>;
      for (const [bp, bpValue] of Object.entries(responsiveValue)) {
        if (breakpointNames.includes(bp)) {
          declarations.push({
            property: key,
            value: String(bpValue),
            breakpoint: bp,
            selector: parentSelector,
          });
        }
      }
      continue;
    }

    // Regular value
    declarations.push({
      property: key,
      value: String(value),
      breakpoint: undefined,
      selector: parentSelector,
    });
  }

  return declarations;
}

/**
 * Group rules by breakpoint and generate final CSS
 */
export function generateCSS(
  rules: CSSRule[],
  theme: ThemeConfig
): string {
  // Group by breakpoint
  const baseRules: string[] = [];
  const breakpointRules: Map<string, string[]> = new Map();

  for (const rule of rules) {
    if (rule.breakpoint) {
      if (!breakpointRules.has(rule.breakpoint)) {
        breakpointRules.set(rule.breakpoint, []);
      }
      breakpointRules.get(rule.breakpoint)!.push(rule.css);
    } else {
      baseRules.push(rule.css);
    }
  }

  // Build CSS output
  let css = baseRules.join('\n');

  // Sort breakpoints by min-width value
  const sortedBreakpoints = Object.entries(theme.breakpoints)
    .map(([name, value]) => ({
      name,
      value: parseInt(value.replace('px', ''), 10) || 0,
    }))
    .sort((a, b) => a.value - b.value);

  for (const { name, value } of sortedBreakpoints) {
    const bpRules = breakpointRules.get(name);
    if (bpRules && bpRules.length > 0) {
      if (value > 0) {
        css += `\n@media (min-width: ${value}px) {\n${bpRules.join('\n')}\n}`;
      } else {
        // xs breakpoint (0px) - no media query needed
        css = bpRules.join('\n') + '\n' + css;
      }
    }
  }

  return css;
}

/**
 * Generate CSS custom properties from theme tokens
 */
export function generateTokenCSS(theme: ThemeConfig): string {
  const vars: string[] = [];

  for (const [scaleName, tokens] of Object.entries(theme.tokens)) {
    if (!tokens || typeof tokens !== 'object') continue;
    for (const [tokenName, tokenValue] of Object.entries(tokens)) {
      vars.push(`  --jui-${scaleName}-${tokenName}: ${tokenValue};`);
    }
  }

  return `:root {\n${vars.join('\n')}\n}`;
}

