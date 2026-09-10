import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import postcss from 'postcss';
import putty from '../src/postcss.ts';
import { transformSource } from '../src/core/index.ts';

function fixture(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'putty-'));
  for (const [name, content] of Object.entries(files)) {
    const full = path.join(dir, name);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  return dir;
}

test('replaces @putty with rules from every scanned file and reports dependencies', async () => {
  const dir = fixture({
    'src/A.tsx': `import { cx } from 'puttycss'; export const a = cx({ display: 'flex', '&:hover': { color: 'red' } });`,
    'src/nested/B.ts': `import { cx } from 'puttycss'; export const b = cx({ display: 'flex', '@media (min-width: 768px)': { gap: 8 } });`,
    'src/C.tsx': `export const c = 1; // no putty here`,
    'node_modules/pkg/index.js': `import { cx } from 'puttycss'; cx({ color: 'ignored' });`,
  });

  const result = await postcss([putty({ cwd: dir })]).process(`body { margin: 0 }\n@putty;\n.after { color: blue }`, {
    from: path.join(dir, 'globals.css'),
  });

  const css = result.css;
  assert.ok(css.indexOf('body { margin: 0 }') < css.indexOf('display: flex'));
  assert.ok(css.indexOf('display: flex') < css.indexOf('.after'));
  assert.equal((css.match(/display: flex/g) ?? []).length, 1, 'shared rule is deduplicated');
  assert.match(css, /:hover \{ color: red; \}/);
  assert.match(css, /@media \(min-width: 768px\) \{\n {2}\.p\w+ \{ gap: 8px; \}\n\}/);
  assert.doesNotMatch(css, /ignored/);

  const deps = result.messages.filter((m) => m.type === 'dependency').map((m) => m.file as string);
  assert.ok(deps.includes(path.join(dir, 'src/A.tsx')));
  assert.ok(deps.includes(path.join(dir, 'src/C.tsx')), 'files without cx() are still dependencies so adding cx() later is picked up');
  assert.ok(result.messages.some((m) => m.type === 'dir-dependency'));
});

test('class names in the stylesheet match what the transform emits', async () => {
  const source = `import { cx } from 'puttycss'; export const a = cx({ padding: 16, '&:focus-visible': { outline: '2px solid' } });`;
  const dir = fixture({ 'A.tsx': source });

  const { css } = await postcss([putty({ cwd: dir })]).process('@putty;', { from: undefined });
  const { code } = transformSource(source, 'A.tsx');
  const classes = /className: "([^"]+)"/.exec(code)![1].split(' ');
  for (const c of classes) assert.ok(css.includes(`.${c}`), `${c} present in stylesheet`);
});

test('content option limits the scan and errors carry file locations', async () => {
  const dir = fixture({
    'app/ok.tsx': `import { cx } from 'puttycss'; cx({ color: 'red' });`,
    'other/bad.tsx': `import { cx } from 'puttycss';\ncx({ color: dynamic });`,
  });

  const ok = await postcss([putty({ cwd: dir, content: ['app'] })]).process('@putty;', { from: undefined });
  assert.match(ok.css, /color: red/);

  await assert.rejects(
    postcss([putty({ cwd: dir })]).process('@putty;', { from: undefined }),
    (e: Error) => /other\/bad\.tsx:2:\d+: "dynamic" is a variable/.test(e.message),
  );
});

test('exclude option adds to the defaults instead of replacing them', async () => {
  const dir = fixture({
    'src/A.tsx': `import { cx } from 'puttycss'; cx({ color: 'red' });`,
    'src/fixtures/F.tsx': `import { cx } from 'puttycss'; cx({ color: 'green' });`,
    'node_modules/pkg/index.js': `import { cx } from 'puttycss'; cx({ color: 'blue' });`,
  });

  const { css } = await postcss([putty({ cwd: dir, exclude: ['fixtures'] })]).process('@putty;', { from: undefined });
  assert.match(css, /color: red/);
  assert.doesNotMatch(css, /color: green/, 'user exclude is applied');
  assert.doesNotMatch(css, /color: blue/, 'node_modules is still excluded');
});

test('picks up edits between runs (mtime cache invalidation)', async () => {
  const dir = fixture({ 'A.tsx': `import { cx } from 'puttycss'; cx({ color: 'red' });` });
  const run = () => postcss([putty({ cwd: dir })]).process('@putty;', { from: undefined }).then((r) => r.css);

  assert.match(await run(), /color: red/);
  const file = path.join(dir, 'A.tsx');
  fs.writeFileSync(file, `import { cx } from 'puttycss'; cx({ color: 'blue' });`);
  fs.utimesSync(file, new Date(), new Date(Date.now() + 5000));
  const after = await run();
  assert.match(after, /color: blue/);
  assert.doesNotMatch(after, /color: red/);
});
