import { cx } from 'puttycss';
import { Counter } from './Counter';

// A Server Component: cx() is compiled away, so there is nothing to run on the server either.
export default function Page() {
  return (
    <main
      {...cx({
        maxWidth: 720,
        margin: '0 auto',
        paddingBlock: 80,
        paddingInline: 16,
      })}
    >
      <h1
        {...cx({
          fontSize: 36,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          '@media (min-width: 768px)': { fontSize: 48 },
        })}
      >
        putty in Next.js
      </h1>
      <p {...cx({ marginTop: 12, fontSize: 18, lineHeight: 1.5, color: 'var(--gray-11)' })}>
        Same output under Turbopack and webpack. Server and client components alike.
      </p>
      <div {...cx({ marginTop: 32 })}>
        <Counter />
      </div>
    </main>
  );
}
