import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { Suspense } from 'react';
import { HeaderVisibility } from '@/components/layout/header-visibility';
import { toShellProps } from '@/components/layout/shell-props';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { JsonLd } from '@/components/seo/json-ld';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { montserratAlternates, playfairDisplay } from '@/app/fonts';
import { getCopyrightYear } from '@/lib/copyright-year';
import { siteGraph } from '@/lib/seo/json-ld';
import { buildMetadata } from '@/lib/seo/metadata';
import { isIndexableDeployment, resolveSite } from '@/lib/seo/site';
import { getSiteSeo } from '@/sanity/loaders/seo';
import { getShell } from '@/sanity/loaders/shell';
import './globals.css';

// Site-wide defaults; pages override them with their own buildMetadata() output (SEO-R1, R2).
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ site: resolveSite(await getSiteSeo()), path: '/', indexable: isIndexableDeployment() });
}

async function DraftModeTools() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;
  // Dynamic import keeps the Visual Editing bundle (~1.2 MB) out of public pages.
  const { VisualEditing } = await import('next-sanity/visual-editing');
  return <VisualEditing />;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [shell, year, seo] = await Promise.all([getShell(), getCopyrightYear(), getSiteSeo()]);
  const { siteName, navItems, cta, footerLinks, contact, socialLinks } = toShellProps(shell);

  return (
    <html
      lang="en"
      className={`${montserratAlternates.variable} ${playfairDisplay.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-60 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:ring-2 focus:ring-ring"
        >
          Skip to content
        </a>
        <JsonLd data={siteGraph(resolveSite(seo))} />
        <ThemeProvider>
          <HeaderVisibility>
            <SiteHeader siteName={siteName} navItems={navItems} cta={cta} />
          </HeaderVisibility>
          <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <SiteFooter
            siteName={siteName}
            footerLinks={footerLinks}
            contact={contact}
            socialLinks={socialLinks}
            year={year}
          />
        </ThemeProvider>
        <Suspense fallback={null}>
          <DraftModeTools />
        </Suspense>
      </body>
    </html>
  );
}
