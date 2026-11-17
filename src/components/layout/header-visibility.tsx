'use client';

import type { ReactNode } from 'react';
import { useHeaderHidden } from './use-header-visibility';

/** The `header` landmark; hides on scroll down and returns on scroll up. Focus and open menus keep it visible (see globals.css). */
export function HeaderVisibility({ children }: { children: ReactNode }) {
  const hidden = useHeaderHidden();
  return (
    <header data-hidden={hidden} className="site-header fixed inset-x-0 top-(--header-offset) z-50 px-4">
      {children}
    </header>
  );
}
