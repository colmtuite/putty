import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import postcss from 'postcss';
import { state, missingDirectiveWarning, resetState } from '../src/core/state.ts';
import putty from '../src/postcss.ts';
import { putty as vitePutty } from '../src/vite.ts';
import webpackLoader from '../src/webpack.ts';

const SRC = `import { cx } from 'puttycss'; export const a = cx({ color: 'red' });`;

beforeEach(resetState);

test('state: warns only when cx() was compiled and the directive never ran', () => {
  assert.equal(missingDirectiveWarning(), null, 'nothing compiled: quiet');

  state.filesCompiled.add('/app/A.tsx');
  assert.match(missingDirectiveWarning()!, /compiled in 1 file but the @putty; directive never ran/);

  state.filesCompiled.add('/app/B.tsx');
  assert.match(missingDirectiveWarning()!, /2 files/);

  state.directiveRuns = 1;
  assert.equal(missingDirectiveWarning(), null, 'directive ran: quiet');
});

test('postcss: processing @putty; records a directive run', async () => {
  await postcss([putty({ cwd: process.cwd(), content: ['test'] })]).process('@putty;', { from: undefined });
  assert.equal(state.directiveRuns, 1);
});

test('vite: build warns at buildEnd when no stylesheet was generated, and not otherwise', async () => {
  const plugin = vitePutty() as any;
  const warnings: string[] = [];
  plugin.configResolved({ command: 'build', logger: { warn: (m: string) => warnings.push(m) } });

  const transformed = plugin.transform.call({ error: (e: unknown) => { throw e; } }, SRC, '/app/A.tsx');
  assert.ok(transformed?.code.includes('className'));

  plugin.buildEnd.call({ warn: (m: string) => warnings.push(m) });
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /@putty; directive never ran/);

  // Same build, but the stylesheet is processed too: no warning.
  resetState();
  warnings.length = 0;
  plugin.transform.call({ error: (e: unknown) => { throw e; } }, SRC, '/app/A.tsx');
  await postcss([putty({ cwd: process.cwd(), content: ['test'] })]).process('@putty;', { from: undefined });
  plugin.buildEnd.call({ warn: (m: string) => warnings.push(m) });
  assert.deepEqual(warnings, []);
});

test('webpack: warns on the compiler done hook, skips non-client Next.js compilers', () => {
  const warnings: string[] = [];
  const original = console.warn;
  console.warn = (m: string) => warnings.push(m);
  try {
    const run = (name: string | undefined) => {
      const done: Array<() => void> = [];
      const compiler = { name, hooks: { done: { tap: (_: string, fn: () => void) => done.push(fn) } } };
      webpackLoader.call(
        { resourcePath: '/app/A.tsx', callback: () => {}, _compiler: compiler } as any,
        SRC,
      );
      return done;
    };

    // Plain webpack (unnamed compiler): hook registered and fires the warning.
    let done = run(undefined);
    assert.equal(done.length, 1);
    done[0]();
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /@putty; directive never ran/);

    // Next.js server compiler: no hook, no warning.
    resetState();
    warnings.length = 0;
    done = run('server');
    assert.equal(done.length, 0);

    // Next.js client compiler: hook registered.
    resetState();
    done = run('client');
    assert.equal(done.length, 1);
  } finally {
    console.warn = original;
  }
});
