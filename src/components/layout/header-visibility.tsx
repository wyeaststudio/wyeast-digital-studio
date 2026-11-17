'use client';

import { useState, type ReactNode } from 'react';
import { useHeaderHidden } from './use-header-visibility';

/** The `header` landmark; hides on scroll down and returns on scroll up, but never while it holds focus (SHELL-R8). */
export function HeaderVisibility({ children }: { children: ReactNode }) {
  const scrolledAway = useHeaderHidden();
  const [focusWithin, setFocusWithin] = useState(false);

  return (
    <header
      data-hidden={scrolledAway && !focusWithin}
      onFocus={() => setFocusWithin(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocusWithin(false);
      }}
      className="site-header fixed inset-x-0 top-(--header-offset) z-50 px-4"
    >
      {children}
    </header>
  );
}
