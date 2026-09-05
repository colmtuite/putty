import { hash } from './hash.ts';

/**
 * A style object after static extraction: string/number leaves, nested objects
 * under `&...` selector keys and `@...` at-rule keys.
 */
export interface StyleTree {
  [key: string]: string | number | StyleTree;
}

/**
 * One CSS declaration with its full context. `selector` uses `&` for the element.
 */
export interface Declaration {
  /** camelCase property name, or `--custom-property` */
  property: string;
  /** normalized CSS value */
  value: string;
  /** e.g. `&:hover`, `& > svg`, `&:hover .icon`; null for the element itself */
  selector: string | null;
  /** enclosing at-rules from outermost to innermost, e.g. ['@media (min-width: 768px)'] */
  atRules: string[];
}

export interface Rule extends Declaration {
  className: string;
}

export class PuttyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PuttyError';
  }
}

// ---------------------------------------------------------------------------
// Values
// ---------------------------------------------------------------------------

/**
 * Properties whose numeric values must not get a `px` suffix. Same list React uses
 * for the `style` prop, plus a few newer ones.
 */
const UNITLESS = new Set([
  'animationIterationCount', 'aspectRatio', 'borderImageOutset', 'borderImageSlice',
  'borderImageWidth', 'boxFlex', 'boxFlexGroup', 'boxOrdinalGroup', 'columnCount',
  'columns', 'flex', 'flexGrow', 'flexPositive', 'flexShrink', 'flexNegative',
  'flexOrder', 'gridArea', 'gridRow', 'gridRowEnd', 'gridRowSpan', 'gridRowStart',
  'gridColumn', 'gridColumnEnd', 'gridColumnSpan', 'gridColumnStart', 'fontWeight',
  'lineClamp', 'lineHeight', 'opacity', 'order', 'orphans', 'scale', 'tabSize',
  'widows', 'zIndex', 'zoom', 'fillOpacity', 'floodOpacity', 'stopOpacity',
  'strokeDasharray', 'strokeDashoffset', 'strokeMiterlimit', 'strokeOpacity',
  'strokeWidth', 'MozBoxFlex', 'WebkitBoxFlex', 'WebkitLineClamp',
]);

export function normalizeValue(property: string, value: string | number): string {
  if (typeof value === 'number') {
    if (value === 0 || UNITLESS.has(property) || property.startsWith('--')) {
      return String(value);
    }
    return `${value}px`;
  }
  return value.trim();
}

export function toKebabCase(property: string): string {
  if (property.startsWith('--')) return property;
  // `WebkitFoo` -> `-webkit-foo`, `msFoo` -> `-ms-foo`
  const kebab = property.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
  return /^(webkit|moz|ms|o)-/.test(kebab) ? `-${kebab}` : kebab;
}

// ---------------------------------------------------------------------------
// Flatten
// ---------------------------------------------------------------------------

/**
 * Flatten a style tree into declarations. Later keys win over earlier duplicates,
 * matching JavaScript object semantics.
 */
export function flatten(
  styles: StyleTree,
  selector: string | null = null,
  atRules: string[] = [],
): Declaration[] {
  const byKey = new Map<string, Declaration>();

  for (const [key, value] of Object.entries(styles)) {
    if (value === undefined || value === null) continue;

    if (key.startsWith('&')) {
      if (typeof value !== 'object') {
        throw new PuttyError(`Selector "${key}" must map to a style object.`);
      }
      // Nested `&` refers to the parent selector (or the element when at the top).
      const nested = selector ? key.replaceAll('&', selector) : key;
      for (const d of flatten(value, nested, atRules)) byKey.set(declKey(d), d);
      continue;
    }

    if (key.startsWith('@')) {
      if (typeof value !== 'object') {
        throw new PuttyError(`At-rule "${key}" must map to a style object.`);
      }
      for (const d of flatten(value, selector, [...atRules, key])) byKey.set(declKey(d), d);
      continue;
    }

    if (typeof value === 'object') {
      throw new PuttyError(
        `Property "${key}" has an object value. Nested objects are only allowed under ` +
          `selector keys ("&:hover") or at-rule keys ("@media ...").`,
      );
    }

    const d: Declaration = { property: key, value: normalizeValue(key, value), selector, atRules };
    byKey.set(declKey(d), d);
  }

  return [...byKey.values()];
}

function declKey(d: Declaration): string {
  return `${d.atRules.join('|')}\0${d.selector ?? ''}\0${d.property}`;
}

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

export function toRule(d: Declaration): Rule {
  const id = `${d.property}:${d.value}:${d.selector ?? ''}:${d.atRules.join('|')}`;
  return { ...d, className: `p${hash(id)}` };
}

export function rulesFor(styles: StyleTree): Rule[] {
  return flatten(styles).map(toRule);
}

// ---------------------------------------------------------------------------
// Ordering
// ---------------------------------------------------------------------------

/**
 * Shorthands must be emitted before the longhands they can be overridden by,
 * regardless of which file introduced them. Lower rank = earlier in the sheet.
 */
const SHORTHAND_RANK: Record<string, number> = {
  all: 0,
  // full shorthands
  animation: 1, background: 1, border: 1, borderImage: 1, borderRadius: 1, columnRule: 1,
  columns: 1, containIntrinsicSize: 1, flex: 1, flexFlow: 1, font: 1, gap: 1, grid: 1,
  gridArea: 1, gridTemplate: 1, inset: 1, listStyle: 1, margin: 1, mask: 1, offset: 1,
  outline: 1, overflow: 1, overscrollBehavior: 1, padding: 1, placeContent: 1, placeItems: 1,
  placeSelf: 1, scrollMargin: 1, scrollPadding: 1, textDecoration: 1, textEmphasis: 1,
  transition: 1, borderWidth: 1, borderStyle: 1, borderColor: 1,
  // partial shorthands
  borderTop: 2, borderRight: 2, borderBottom: 2, borderLeft: 2, borderInline: 2, borderBlock: 2,
  borderInlineStart: 2, borderInlineEnd: 2, borderBlockStart: 2, borderBlockEnd: 2,
  marginInline: 2, marginBlock: 2, paddingInline: 2, paddingBlock: 2, insetInline: 2,
  insetBlock: 2, gridRow: 2, gridColumn: 2, scrollMarginInline: 2, scrollMarginBlock: 2,
  scrollPaddingInline: 2, scrollPaddingBlock: 2, overflowInline: 2, overflowBlock: 2,
};

function propertyRank(property: string): number {
  return SHORTHAND_RANK[property] ?? 3;
}

/**
 * Pseudo-classes that must appear in a specific order for the cascade to behave
 * (link → visited → hover → focus → active). Everything else sorts after them.
 */
const PSEUDO_ORDER = [
  ':link', ':visited', ':focus-within', ':hover', ':focus', ':focus-visible', ':active', ':disabled',
];

function selectorRank(selector: string | null): [number, string] {
  if (selector === null) return [0, ''];
  for (let i = 0; i < PSEUDO_ORDER.length; i++) {
    if (selector.includes(PSEUDO_ORDER[i])) return [1 + i, selector];
  }
  return [1 + PSEUDO_ORDER.length, selector];
}

/** Parse a length in px/em/rem to a comparable px number. */
function toPx(value: string): number {
  const m = /^([\d.]+)\s*(px|em|rem)?$/.exec(value.trim());
  if (!m) return Number.NaN;
  const n = Number.parseFloat(m[1]);
  return m[2] === 'em' || m[2] === 'rem' ? n * 16 : n;
}

/**
 * Sort key for a single at-rule. Mobile-first: min-width ascending, then
 * max-width descending, then everything else alphabetically.
 */
function atRuleRank(atRule: string): [number, number, string] {
  const min = /min-width:\s*([^)]+)\)/.exec(atRule);
  if (min) {
    const px = toPx(min[1]);
    if (!Number.isNaN(px)) return [0, px, atRule];
  }
  const max = /max-width:\s*([^)]+)\)/.exec(atRule);
  if (max) {
    const px = toPx(max[1]);
    if (!Number.isNaN(px)) return [1, -px, atRule];
  }
  return [2, 0, atRule];
}

function compareAtRules(a: string[], b: string[]): number {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const ra = atRuleRank(a[i]);
    const rb = atRuleRank(b[i]);
    if (ra[0] !== rb[0]) return ra[0] - rb[0];
    if (ra[1] !== rb[1]) return ra[1] - rb[1];
    if (ra[2] !== rb[2]) return ra[2] < rb[2] ? -1 : 1;
  }
  return a.length - b.length;
}

export function compareRules(a: Rule, b: Rule): number {
  const at = compareAtRules(a.atRules, b.atRules);
  if (at !== 0) return at;

  const pr = propertyRank(a.property) - propertyRank(b.property);
  if (pr !== 0) return pr;

  const [sa, sas] = selectorRank(a.selector);
  const [sb, sbs] = selectorRank(b.selector);
  if (sa !== sb) return sa - sb;
  if (sas !== sbs) return sas < sbs ? -1 : 1;

  if (a.property !== b.property) return a.property < b.property ? -1 : 1;
  if (a.value !== b.value) return a.value < b.value ? -1 : 1;
  return 0;
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

function renderRule(rule: Rule, indent: string): string {
  const selector = rule.selector
    ? rule.selector.replaceAll('&', `.${rule.className}`)
    : `.${rule.className}`;
  return `${indent}${selector} { ${toKebabCase(rule.property)}: ${rule.value}; }`;
}

/**
 * Render rules to a stylesheet. Input order is irrelevant; output is fully
 * deterministic and grouped by at-rule.
 */
export function renderCSS(rules: Iterable<Rule>): string {
  const sorted = [...rules].sort(compareRules);
  const out: string[] = [];
  let open: string[] = [];

  const closeTo = (depth: number) => {
    while (open.length > depth) {
      open.pop();
      out.push(`${'  '.repeat(open.length)}}`);
    }
  };

  for (const rule of sorted) {
    // Find the common prefix between the currently open at-rules and this rule's.
    let common = 0;
    while (common < open.length && common < rule.atRules.length && open[common] === rule.atRules[common]) {
      common++;
    }
    closeTo(common);
    for (let i = common; i < rule.atRules.length; i++) {
      out.push(`${'  '.repeat(i)}${rule.atRules[i]} {`);
      open.push(rule.atRules[i]);
    }
    out.push(renderRule(rule, '  '.repeat(open.length)));
  }
  closeTo(0);

  return out.join('\n');
}

// ---------------------------------------------------------------------------
// Collector
// ---------------------------------------------------------------------------

/**
 * Deduplicating set of rules across many files. Detects hash collisions.
 */
export class RuleSet {
  private rules = new Map<string, Rule>();

  add(rules: Iterable<Rule>): void {
    for (const rule of rules) {
      const existing = this.rules.get(rule.className);
      if (!existing) {
        this.rules.set(rule.className, rule);
      } else if (!sameDeclaration(existing, rule)) {
        throw new PuttyError(
          `Class name collision on .${rule.className}: ` +
            `"${describe(existing)}" vs "${describe(rule)}". Please report this.`,
        );
      }
    }
  }

  get size(): number {
    return this.rules.size;
  }

  values(): Rule[] {
    return [...this.rules.values()];
  }

  toCSS(): string {
    return renderCSS(this.rules.values());
  }
}

function sameDeclaration(a: Rule, b: Rule): boolean {
  return (
    a.property === b.property &&
    a.value === b.value &&
    a.selector === b.selector &&
    a.atRules.join('|') === b.atRules.join('|')
  );
}

function describe(r: Rule): string {
  return [...r.atRules, r.selector ?? '&', `${r.property}: ${r.value}`].join(' ');
}
