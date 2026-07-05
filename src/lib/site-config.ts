import type { Metadata } from 'next';

const defaultUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';
const defaultName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Agency Template';
const defaultTitle = process.env.NEXT_PUBLIC_SITE_TITLE ?? defaultName;
const defaultDescription =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ??
  'A launch-ready Next.js and Sanity starter with accessible structure, SEO defaults, and configurable metadata for GEO and AEO.';
const defaultKeywords =
  process.env.NEXT_PUBLIC_SITE_KEYWORDS ??
  'agency website, next.js, sanity, seo, accessibility, geo, aeo';

export const siteConfig = {
  name: defaultName,
  title: defaultTitle,
  description: defaultDescription,
  url: defaultUrl.replace(/\/$/, ''),
  locale: 'en_US',
  keywords: defaultKeywords
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
  social: {
    twitter: process.env.NEXT_PUBLIC_TWITTER_HANDLE
      ? `https://x.com/${process.env.NEXT_PUBLIC_TWITTER_HANDLE.replace(/^@/, '')}`
      : undefined,
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL,
  },
};

export function createMetadata(overrides: Metadata = {}): Metadata {
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.title,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: siteConfig.title,
      description: siteConfig.description,
      url: siteConfig.url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: siteConfig.title,
      description: siteConfig.description,
      creator: process.env.NEXT_PUBLIC_TWITTER_HANDLE ?? undefined,
      site: process.env.NEXT_PUBLIC_TWITTER_HANDLE ?? undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    ...overrides,
  };
}
