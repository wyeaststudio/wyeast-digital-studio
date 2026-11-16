import type { Metadata } from 'next';
import { StructuredData } from '@/components/seo/structured-data';
import { montserratAlternates, playfairDisplay } from '@/app/fonts';
import { createMetadata } from '@/lib/site-config';
import './globals.css';

export const metadata: Metadata = createMetadata({
  title: {
    default: "Wy'east Digital Studio",
    template: "%s | Wy'east Digital Studio",
  },
});

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
        {children}
      </body>
    </html>
  );
}
