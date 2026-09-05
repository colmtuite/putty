import React from 'react';
import { cx } from 'puttycss';
import { PopoverDemo } from './Popover';

export function App() {
  return (
    <div
      {...cx({
        margin: '0 auto',
        maxWidth: 960,
        paddingBlock: 100,
        paddingInline: 16,
      })}
    >
      <h1
        {...cx({
          fontSize: 40,
          fontWeight: 600,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          '@media (min-width: 768px)': { fontSize: 60 },
        })}
      >
        CSS for components. Putty for everything else.
      </h1>

      <p
        {...cx({
          marginTop: 16,
          fontSize: 20,
          lineHeight: 1.5,
          color: 'var(--gray-11)',
        })}
      >
        Write CSS as a typed object. Ship atomic classes and no JavaScript.
      </p>

      <div
        {...cx({
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'center',
          marginTop: 24,
        })}
      >
        <PopoverDemo />

        <a
          href="https://www.npmjs.com/package/puttycss"
          {...cx({
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 40,
            paddingInline: 16,
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 600,
            lineHeight: 1,
            textDecoration: 'none',
            color: 'white',
            backgroundImage: 'linear-gradient(to bottom, #008cff, #0073ff)',
            '&:hover': { backgroundImage: 'linear-gradient(to bottom, #0073ff, #005ce6)' },
          })}
        >
          Primary Button
        </a>

        <a
          href="https://www.npmjs.com/package/puttycss"
          {...cx({
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 40,
            paddingInline: 16,
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 600,
            lineHeight: 1,
            textDecoration: 'none',
            color: 'black',
            backgroundImage: 'linear-gradient(to bottom, #ededed, #e0e0e0)',
          })}
        >
          Secondary Button
        </a>
      </div>

      <div
        {...cx({
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 16,
          marginTop: 48,
          '@media (min-width: 768px)': { gridTemplateColumns: '1fr 1fr' },
        })}
      >
        <Feature title="Zero runtime">
          Every <code>cx()</code> call is replaced with a string at build time. Nothing from putty ships to the browser.
        </Feature>
        <Feature title="Zero config">
          No theme file, no tokens. Use CSS custom properties for design values, exactly like you would in a stylesheet.
        </Feature>
        <Feature title="Nesting">
          <code>&amp;:hover</code>, <code>&amp; &gt; svg</code>, <code>@media</code>, <code>@container</code> — nest them however you like.
        </Feature>
        <Feature title="Works everywhere">
          Vite, Next.js (webpack and Turbopack), or anything with PostCSS. Same output in all of them.
        </Feature>
      </div>
    </div>
  );
}

function Feature({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      {...cx({
        padding: 20,
        borderRadius: 12,
        backgroundColor: 'var(--gray-1)',
        border: '1px solid var(--gray-4)',
      })}
    >
      <h2 {...cx({ fontSize: 18, fontWeight: 600 })}>{title}</h2>
      <p {...cx({ marginTop: 8, fontSize: 14, lineHeight: 1.5, color: 'var(--gray-11)' })}>{children}</p>
    </div>
  );
}
