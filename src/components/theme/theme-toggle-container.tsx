'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { ThemeToggle, type ResolvedTheme } from './theme-toggle';

const noopSubscribe = () => () => {};

export function ThemeToggleContainer() {
  const { resolvedTheme, setTheme } = useTheme();
  // The server can't know the theme; render the placeholder until hydration finishes to avoid a mismatch.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const theme: ResolvedTheme | undefined =
    hydrated && (resolvedTheme === 'dark' || resolvedTheme === 'light') ? resolvedTheme : undefined;

  return (
    <ThemeToggle
      resolvedTheme={theme}
      onToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    />
  );
}
