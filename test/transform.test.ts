import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transformSource, extract, ExtractError } from '../src/core/index.ts';

const tsx = (code: string) => transformSource(code, 'App.tsx');

test('rewrites cx() to a className object and removes the import', () => {
  const { code, rules, changed } = tsx(`
import React from 'react';
import { cx } from 'puttycss';

export const App = () => <div {...cx({ display: 'flex', gap: 16 })} />;
`);
  assert.equal(changed, true);
  assert.doesNotMatch(code, /puttycss/);
  assert.match(code, /<div \{\.\.\.\{ className: "p\w+ p\w+" \}\} \/>/);
  assert.equal(rules.length, 2);
});

test('keeps line numbers stable after multi-line replacements', () => {
  const src = `import { cx } from 'puttycss';
const a = cx({
  display: 'flex',
  color: 'red',
});
const marker = 1;`;
  const { code } = tsx(src);
  assert.equal(code.split('\n').length, src.split('\n').length);
  assert.equal(code.split('\n')[5], 'const marker = 1;');
});

test('leaves files without a putty import untouched', () => {
  const src = `import cx from 'clsx'; const c = cx({ active: true });`;
  const r = tsx(src);
  assert.equal(r.changed, false);
  assert.equal(r.code, src);
});

test('supports aliased imports and keeps sibling specifiers', () => {
  const { code } = tsx(`import { cx as css, type StyleObject } from 'puttycss';
const s: StyleObject = {};
const c = css({ color: 'red' });`);
  assert.match(code, /import \{ type StyleObject \} from 'puttycss';/);
  assert.match(code, /const c = \{ className: "p\w+" \};/);
});

test('handles JSX, .ts, satisfies/as wrappers, negative numbers, computed literal keys', () => {
  const r = transformSource(
    `import { cx } from 'puttycss';
export const s = cx(({ marginTop: -4, ['@media (min-width: 768px)']: { gap: 2 } }) as const);`,
    'styles.ts',
  );
  assert.equal(r.rules.length, 2);
  assert.equal(r.rules[0].value, '-4px');
  assert.deepEqual(r.rules[1].atRules, ['@media (min-width: 768px)']);
});

test('dedupes identical declarations within a call', () => {
  const { code } = tsx(`import { cx } from 'puttycss'; const a = cx({ color: 'red', '&:hover': { color: 'red' } });`);
  const classes = /className: "([^"]*)"/.exec(code)![1].split(' ');
  assert.equal(classes.length, 2); // different selector => different class
});

const failing: Array<[string, string, RegExp]> = [
  ['variable value', `cx({ color: theme })`, /is a variable/],
  ['ternary', `cx({ color: dark ? 'a' : 'b' })`, /Conditional/],
  ['spread', `cx({ ...base })`, /Spread is not allowed/],
  ['shorthand prop', `cx({ color })`, /Shorthand property/],
  ['template expr', 'cx({ width: `${w}px` })', /Template literals/],
  ['member access', `cx({ color: theme.red })`, /literal strings or numbers/],
  ['computed key variable', `cx({ [md]: { color: 'red' } })`, /Computed keys/],
  ['object on plain property', `cx({ padding: { xs: 4 } })`, /Nested objects are only allowed/],
  ['string on selector key', `cx({ '&:hover': 'red' })`, /must map to a style object/],
  ['non-object argument', `cx(styles)`, /must be given an object literal/],
  ['passed as value', `const f = cx;`, /must be called directly/],
  ['wrong arity', `cx({}, {})`, /exactly one argument/],
];

for (const [name, snippet, re] of failing) {
  test(`errors clearly: ${name}`, () => {
    assert.throws(
      () => tsx(`import { cx } from 'puttycss';\nconst x = ${snippet};`),
      (e: unknown) => e instanceof ExtractError && re.test(e.message) && e.line === 2 && e.column > 0,
    );
  });
}

test('comments inside cx() are fine', () => {
  const r = tsx(`import { cx } from 'puttycss';
const a = cx({
  // layout
  display: 'flex', /* inline */ gap: 4,
});`);
  assert.equal(r.rules.length, 2);
});

test('ignores cx as a property name or JSX attribute', () => {
  const r = tsx(`import { cx } from 'puttycss';
const o = { cx: 1 }; foo.cx(); <div cx="x" />;
const a = cx({ color: 'red' });`);
  assert.equal(r.rules.length, 1);
});

test('extract reports no import when putty is only referenced in a string', () => {
  const r = extract(`const s = 'puttycss';`, 'a.ts');
  assert.equal(r.import, null);
});
