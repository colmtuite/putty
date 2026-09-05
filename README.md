# putty

Zero-runtime, zero-config CSS-in-JS. Write CSS as a typed object; ship atomic classes and no JavaScript.

```tsx
import { cx } from 'puttycss';

<button
  {...cx({
    display: 'inline-flex',
    gap: 8,
    padding: '8px 16px',
    color: 'var(--gray-12)',
    '&:hover': { backgroundColor: 'var(--gray-4)' },
    '@media (min-width: 768px)': { padding: '12px 24px' },
  })}
/>
```

At build time this becomes

```tsx
<button {...{ className: "p1h8cdyu p4e729l pj2ma0x p15lx4rp pdj23pi p1u5ukp2" }} />
```

and the matching CSS is generated into your stylesheet. Nothing from `puttycss` is in your bundle: no `cx` function, no style injection, no provider. It works in Server Components because there is nothing to run.

- **Zero runtime.** `cx()` calls are compiled to string literals. The `puttycss` import is removed.
- **Zero config.** No theme file, no tokens. Design values are plain CSS custom properties.
- **Atomic.** One class per declaration, deduplicated across your whole app, deterministic order.
- **Typed.** CSS properties are typed; typos are compile errors.
- **Any bundler.** Vite, Next.js (Turbopack and webpack), or anything that runs PostCSS.

## Install

```sh
npm install -D puttycss
```

`typescript` is a peer dependency (it's used to parse your source files at build time).

## Setup

Two pieces: a transform for your bundler that compiles `cx()` away, and a PostCSS plugin that generates the stylesheet.

### 1. Add the `@putty;` directive to your global CSS

```css
/* globals.css */
:root {
  --gray-4: #ededed;
  --gray-12: #171717;
}

@putty;
```

Every `cx()` call in your project compiles into that line.

### 2. Configure your bundler

**Vite**

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { putty } from 'puttycss/vite';

export default defineConfig({
  plugins: [putty(), react()],
});
```

If you don't have a PostCSS config, that's it; the plugin registers `puttycss/postcss` for you. If you do have one (e.g. for Tailwind or autoprefixer), add `'puttycss/postcss'` to it as shown below.

**Next.js** (Turbopack or webpack)

```ts
// next.config.ts
import { withPutty } from 'puttycss/next';

export default withPutty({
  /* your config */
});
```

```js
// postcss.config.mjs
export default {
  plugins: {
    'puttycss/postcss': { content: ['app', 'components'] },
  },
};
```

**webpack**

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      { test: /\.[jt]sx?$/, exclude: /node_modules/, enforce: 'pre', use: 'puttycss/webpack' },
      // ...your CSS rule with postcss-loader
    ],
  },
};
```

**Anything else with PostCSS**

Add `puttycss/postcss` to your PostCSS config for the stylesheet, and use `transformSource(code, fileName)` from `puttycss/core` to compile `cx()` calls in whatever transform hook your tool provides. Open an issue if you'd like a first-party integration.

## Writing styles

```tsx
cx({
  // camelCase CSS properties
  display: 'flex',
  // numbers get px (except unitless properties such as lineHeight, opacity, zIndex, flex, fontWeight)
  gap: 16,
  lineHeight: 1.5,
  // custom properties
  '--card-padding': '16px',
  // nested selectors; & is the element
  '&:hover': { opacity: 0.8 },
  '&[data-state="open"]': { color: 'red' },
  '& > svg': { fill: 'currentColor' },
  // at-rules, nestable with selectors in either order
  '@media (min-width: 768px)': {
    gap: 24,
    '&:hover': { opacity: 1 },
  },
  '@container (min-width: 400px)': { display: 'grid' },
  '@supports (backdrop-filter: blur(1px))': { backdropFilter: 'blur(8px)' },
});
```

### Everything must be static

Because `cx()` is compiled away, its argument has to be an object literal made of literal strings, numbers and nested object literals. These are build errors, reported with file, line and column:

```tsx
cx({ color: theme.red });               // variable
cx({ color: dark ? 'white' : 'black' }); // conditional
cx({ ...base, color: 'red' });          // spread
cx(styles);                              // not a literal
```

For values that change at runtime, use a CSS custom property:

```tsx
<div style={{ '--x': `${offset}px` }} {...cx({ transform: 'translateX(var(--x))' })} />
```

For variants, call `cx()` once per variant and pick a result:

```tsx
const primary = cx({ backgroundColor: 'blue' });
const secondary = cx({ backgroundColor: 'gray' });
<button {...(isPrimary ? primary : secondary)} />
```

Since `cx()` returns `{ className }`, combining with other classes is just string concatenation:

```tsx
<div className={`${cx({ display: 'flex' }).className} ${props.className ?? ''}`} />
```

## Options

`puttycss/postcss` (and `puttycss/vite`, which forwards them):

| Option    | Default                              | Description                                                             |
| --------- | ------------------------------------ | ----------------------------------------------------------------------- |
| `content` | `['.']`                              | Files or directories to scan for `cx()` calls, relative to `cwd`.       |
| `exclude` | `node_modules`, `.git`, `dist`, `.next`, … | Directory names skipped anywhere in the tree.                   |
| `cwd`     | `process.cwd()`                      | Base directory.                                                         |

`puttycss/vite` also accepts `postcss: false` to opt out of auto-registering the PostCSS plugin.

## How it works

Class names are a hash of the declaration (`property:value:selector:at-rules`), so they're deterministic and need no shared state. That lets the two halves run independently: the bundler transform rewrites each file on its own, and the PostCSS plugin scans your source tree, extracts the same declarations, and renders the stylesheet. They agree by construction.

Rules are emitted in a fixed order (shorthands before longhands, base before pseudo-classes, media queries mobile-first), so `padding` vs `paddingLeft` conflicts resolve the same way no matter which file introduced them.

## License

MIT
