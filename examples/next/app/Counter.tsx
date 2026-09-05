'use client';

import { useState } from 'react';
import { cx } from 'puttycss';

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button
      type="button"
      onClick={() => setCount((c) => c + 1)}
      {...cx({
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        height: 40,
        paddingInline: 16,
        borderRadius: 8,
        border: '1px solid var(--gray-4)',
        backgroundColor: 'var(--gray-1)',
        fontSize: 16,
        cursor: 'pointer',
        '&:hover': { backgroundColor: 'var(--gray-4)' },
        '&:focus-visible': { outline: '2px solid var(--blue-9)', outlineOffset: 2 },
      })}
    >
      Clicked {count} times
    </button>
  );
}
