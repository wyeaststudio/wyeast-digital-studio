'use client';

import { useTheme } from 'next-themes';
import { ThemeToggle, type ResolvedTheme } from './theme-toggle';

export function ThemeToggleContainer() {
  const { resolvedTheme, setTheme } = useTheme();
  const theme: ResolvedTheme | undefined =
    resolvedTheme === 'dark' || resolvedTheme === 'light' ? resolvedTheme : undefined;

  return (
    <ThemeToggle
      resolvedTheme={theme}
      onToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    />
  );
}
