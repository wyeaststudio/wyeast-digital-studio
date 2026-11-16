import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { Suspense } from 'react';
import { StructuredData } from '@/components/seo/structured-data';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { montserratAlternates, playfairDisplay } from '@/app/fonts';
import { createMetadata } from '@/lib/site-config';
import './globals.css';

export const metadata: Metadata = createMetadata({
  title: {
    default: "Wy'east Digital Studio",
    template: "%s | Wy'east Digital Studio",
  },
});

async function DraftModeTools() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;
  // Dynamic import keeps the Visual Editing bundle (~1.2 MB) out of public pages.
  const { VisualEditing } = await import('next-sanity/visual-editing');
  return <VisualEditing />;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserratAlternates.variable} ${playfairDisplay.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:ring-2 focus:ring-ring"
        >
          Skip to content
        </a>
        <StructuredData />
        <ThemeProvider>{children}</ThemeProvider>
        <Suspense fallback={null}>
          <DraftModeTools />
        </Suspense>
      </body>
    </html>
  );
}
