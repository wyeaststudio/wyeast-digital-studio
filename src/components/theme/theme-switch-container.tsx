'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { ThemeSwitch, type ThemeChoice } from './theme-switch';

const noopSubscribe = () => () => {};

export function ThemeSwitchContainer({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  // The server can't know the theme; render the disabled switch until hydration finishes to avoid a mismatch.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const value: ThemeChoice | undefined =
    hydrated && (theme === 'light' || theme === 'system' || theme === 'dark') ? theme : undefined;

  return <ThemeSwitch value={value} onChange={setTheme} className={className} />;
}
