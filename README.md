# putty

Zero-runtime, zero-config CSS-in-JS. Plain CSS for component styles. Putty for layout, overrides, app styles, one-off styles etc.

```tsx
import { cx } from 'puttycss';

<div {...cx({ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: 16 })}>
  <button {...cx('button', { fontFamily: 'monospace', color: 'var(--gray-12)' })}>Save</button>
</div>
```

At build time this becomes

```tsx
<div {...{ className: "pxocrn6 p7t0jil p4e729l p1vnpodd" }}>
  <button {...{ className: "button p2momd9 p15lx4rp" }}>Save</button>
</div>
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

## Setup

Two pieces: a transform for your bundler that compiles `cx()` away, and a PostCSS plugin that generates the stylesheet.

### 1. Add the `@putty;` directive to the end of your global CSS

```css
/* globals.css */
@import './tokens.css' layer(tokens);
@import './components.css' layer(components);


@putty;
```

Every `cx()` call in your project compiles into that line. Import your component CSS into a `@layer` so `cx()` overrides always win.

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

Values are literal strings and numbers. You never need to pass a runtime value through `cx()`, and it's a terrible idea in 100% of cases:

```tsx
// Never do this
<div style={{ '--x': `${offset}px` }} {...cx({ transform: 'translateX(var(--x))' })} />
```

Runtime values are the component's job. It writes them to the element as an inline `style` or a `data-` attribute, and plain CSS reads them.

### One `cx()` per element

Style components with plain CSS. Use one `cx()` per element for layout and overrides. Pass existing class names as the first argument:

```tsx
<button {...cx('button secondary', { fontFamily: 'monospace', color: 'var(--gray-12)' })} />
```

### CSS Modules

Pass the module class as the first argument, and wrap module files in the `components` layer:

```tsx
import styles from './Button.module.css';

<button {...cx(styles.button, { marginTop: 16 })} />
```

```css
/* Button.module.css */
@layer components {
  .button {
    padding: 8px 16px;
    border-radius: 6px;
  }
}
```

## Options

`puttycss/postcss` (and `puttycss/vite`, which forwards them):

| Option    | Default                              | Description                                                             |
| --------- | ------------------------------------ | ----------------------------------------------------------------------- |
| `content` | `['.']`                              | Files or directories to scan for `cx()` calls, relative to `cwd`.       |
| `exclude` | `node_modules`, `.git`, `dist`, `.next`, … | Directory names skipped anywhere in the tree.                   |
| `cwd`     | `process.cwd()`                      | Base directory.                                                         |

`puttycss/vite` also accepts `postcss: false` to opt out of auto-registering the PostCSS plugin.

## Author

Colm Tuite

## License

MIT
