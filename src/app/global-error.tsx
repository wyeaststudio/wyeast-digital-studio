'use client';

import { ErrorContent } from '@/components/layout/error-content';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { montserratAlternates, playfairDisplay } from './fonts';
import './(web)/globals.css';

/** Replaces the root layout when it fails, so it brings its own html, styles, fonts, and theme (SHELL-R26). */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html
      lang="en"
      className={`${montserratAlternates.variable} ${playfairDisplay.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <title>Something went wrong | Wy&apos;east Digital Studio</title>
        <ThemeProvider>
          <main id="main-content">
            <ErrorContent onRetry={unstable_retry} digest={error.digest} className="pt-24" />
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
