import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flatten, normalizeValue, toKebabCase, rulesFor, renderCSS, RuleSet, PuttyError } from '../src/core/index.ts';

test('normalizeValue: numbers get px except unitless properties and zero', () => {
  assert.equal(normalizeValue('width', 40), '40px');
  assert.equal(normalizeValue('fontSize', 16), '16px');
  assert.equal(normalizeValue('padding', 0), '0');
  assert.equal(normalizeValue('lineHeight', 1.5), '1.5');
  assert.equal(normalizeValue('opacity', 0.5), '0.5');
  assert.equal(normalizeValue('zIndex', 10), '10');
  assert.equal(normalizeValue('flex', 1), '1');
  assert.equal(normalizeValue('fontWeight', 600), '600');
  assert.equal(normalizeValue('--gap', 4), '4');
  assert.equal(normalizeValue('margin', -8), '-8px');
  assert.equal(normalizeValue('color', '  red '), 'red');
});

test('toKebabCase handles vendor prefixes and custom properties', () => {
  assert.equal(toKebabCase('backgroundColor'), 'background-color');
  assert.equal(toKebabCase('WebkitLineClamp'), '-webkit-line-clamp');
  assert.equal(toKebabCase('--my-var'), '--my-var');
});

test('flatten: plain, selectors, at-rules, and nesting in both directions', () => {
  const decls = flatten({
    display: 'flex',
    '&:hover': {
      color: 'red',
      '@media (min-width: 768px)': { color: 'blue' },
    },
    '@media (min-width: 768px)': {
      gap: 24,
      '&:focus-visible': { outline: '2px solid' },
      '@supports (display: grid)': { display: 'grid' },
    },
    '& > svg': { '&:hover': { fill: 'red' } },
  });

  assert.deepEqual(decls, [
    { property: 'display', value: 'flex', selector: null, atRules: [] },
    { property: 'color', value: 'red', selector: '&:hover', atRules: [] },
    { property: 'color', value: 'blue', selector: '&:hover', atRules: ['@media (min-width: 768px)'] },
    { property: 'gap', value: '24px', selector: null, atRules: ['@media (min-width: 768px)'] },
    { property: 'outline', value: '2px solid', selector: '&:focus-visible', atRules: ['@media (min-width: 768px)'] },
    { property: 'display', value: 'grid', selector: null, atRules: ['@media (min-width: 768px)', '@supports (display: grid)'] },
    { property: 'fill', value: 'red', selector: '& > svg:hover', atRules: [] },
  ]);
});

test('flatten: later duplicate keys win, like JS objects', () => {
  const decls = flatten({ color: 'red', '&:hover': { color: 'blue' } });
  assert.equal(decls.length, 2);
  const again = flatten({ color: 'red', display: 'flex', '@media (min-width: 1px)': { color: 'green' } });
  assert.equal(again.filter((d) => d.property === 'color').length, 2); // different at-rule => different decl
});

test('flatten: rejects object values on plain properties', () => {
  assert.throws(() => flatten({ padding: { xs: 4 } as never }), PuttyError);
  assert.throws(() => flatten({ '&:hover': 'red' as never }), PuttyError);
});

test('class names are deterministic and independent of declaration order', () => {
  const a = rulesFor({ display: 'flex', gap: 16 });
  const b = rulesFor({ gap: '16px', display: 'flex' });
  assert.deepEqual(new Set(a.map((r) => r.className)), new Set(b.map((r) => r.className)));
  assert.match(a[0].className, /^p[a-z0-9]{1,7}$/);
});

test('renderCSS: deterministic order, shorthands before longhands, mobile-first media', () => {
  // Two "files" introducing the same rules in opposite order must render identically.
  const fileA = rulesFor({ paddingLeft: 8, padding: 16, '@media (min-width: 1024px)': { gap: 1 }, '@media (min-width: 640px)': { gap: 2 } });
  const fileB = rulesFor({ '@media (min-width: 640px)': { gap: 2 }, '@media (min-width: 1024px)': { gap: 1 }, padding: 16, paddingLeft: 8 });

  const cssA = renderCSS(fileA);
  const cssB = renderCSS(fileB);
  assert.equal(cssA, cssB);

  const lines = cssA.split('\n');
  assert.ok(lines.findIndex((l) => l.includes('padding: 16px')) < lines.findIndex((l) => l.includes('padding-left: 8px')));
  assert.ok(cssA.indexOf('min-width: 640px') < cssA.indexOf('min-width: 1024px'));
  assert.ok(cssA.indexOf('padding-left') < cssA.indexOf('@media'));
});

test('renderCSS: em/rem breakpoints keep their unit and sort correctly', () => {
  const css = renderCSS(rulesFor({
    '@media (min-width: 80em)': { color: 'a' },
    '@media (min-width: 400px)': { color: 'b' },
    '@media (min-width: 40rem)': { color: 'c' },
  }));
  assert.ok(css.indexOf('400px') < css.indexOf('40rem'));
  assert.ok(css.indexOf('40rem') < css.indexOf('80em'));
  assert.doesNotMatch(css, /40rempx/);
});

test('renderCSS: nested at-rules and selectors render correctly', () => {
  const css = renderCSS(rulesFor({
    color: 'red',
    '&:hover': { color: 'blue' },
    '& .icon': { fill: 'currentColor' },
    '@media (min-width: 768px)': {
      color: 'green',
      '@supports (display: grid)': { display: 'grid' },
    },
  }));
  const [red, blue, icon, green, grid] = ['color: red;', 'color: blue;', 'fill: currentColor;', 'color: green;', 'display: grid;']
    .map((s) => css.split('\n').find((l) => l.includes(s))!);
  assert.match(red, /^\.p\w+ \{ color: red; \}$/);
  assert.match(blue, /^\.p\w+:hover \{ color: blue; \}$/);
  assert.match(icon, /^\.p\w+ \.icon \{ fill: currentColor; \}$/);
  assert.match(green, /^ {2}\.p\w+ \{ color: green; \}$/);
  assert.match(grid, /^ {4}\.p\w+ \{ display: grid; \}$/);
  assert.match(css, /@media \(min-width: 768px\) \{\n {2}\.p\w+ \{ color: green; \}\n {2}@supports \(display: grid\) \{\n {4}\.p\w+ \{ display: grid; \}\n {2}\}\n\}/);
});

test('renderCSS: pseudo-class order is link, visited, hover, focus, active', () => {
  const css = renderCSS(rulesFor({
    '&:active': { color: 'a' },
    '&:hover': { color: 'h' },
    '&:focus': { color: 'f' },
    '&:visited': { color: 'v' },
  }));
  const idx = (s: string) => css.indexOf(s);
  assert.ok(idx(':visited') < idx(':hover') && idx(':hover') < idx(':focus') && idx(':focus') < idx(':active'));
});

test('RuleSet dedupes across files and detects collisions', () => {
  const set = new RuleSet();
  set.add(rulesFor({ display: 'flex' }));
  set.add(rulesFor({ display: 'flex', gap: 4 }));
  assert.equal(set.size, 2);

  const [rule] = rulesFor({ color: 'red' });
  set.add([rule]);
  set.add([rule]); // identical rule again is fine
  assert.throws(() => set.add([{ ...rule, value: 'blue' }]), /collision/);
});
