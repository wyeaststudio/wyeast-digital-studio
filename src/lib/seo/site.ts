import { stegaClean } from 'next-sanity';
import type { SiteSeo } from '@/sanity/loaders/seo';

/** Canonical origin, without a trailing slash. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://wyeast.studio').replace(/\/+$/, '');

export const SITE_LOCALE = 'en_US';

/** Wy'east fallbacks for when siteSettings is empty or Sanity is unreachable (SEO-R1). */
export const SITE_DEFAULTS = {
  siteName: "Wy'east Digital Studio",
  homeTitle: "Wy'east Digital Studio | Accessible Websites in Portland, OR",
  description:
    "Wy'east Digital Studio designs and builds fast, accessible websites for Portland and Pacific Northwest businesses.",
  businessDescription:
    "Wy'east Digital Studio is a Portland, Oregon web studio that designs and builds fast, accessible websites, with search, answer engine, and generative engine optimization built in.",
  addressLocality: 'Portland',
  addressRegion: 'OR',
  addressCountry: 'US',
  areaServed: ['Portland, Oregon', 'Pacific Northwest'],
} as const;

export type SocialLink = { platform: string; url: string };

/** Site settings with every SEO value filled from `SITE_DEFAULTS` and stega removed. */
export type ResolvedSite = {
  siteName: string;
  homeTitle: string;
  description: string;
  businessDescription: string;
  email: string | null;
  phone: string | null;
  serviceArea: string | null;
  addressLocality: string;
  addressRegion: string;
  addressCountry: string;
  areaServed: string[];
  socialLinks: SocialLink[];
  defaultOgImage: SiteSeo['defaultOgImage'];
  updatedAt: string | null;
};

const text = (value: string | null | undefined): string | null => {
  const clean = stegaClean(value)?.trim();
  return clean ? clean : null;
};

export function resolveSite(settings: SiteSeo | null | undefined): ResolvedSite {
  const s = settings ?? null;
  const areaServed = (s?.areaServed ?? []).map((area) => text(area)).filter((area): area is string => Boolean(area));
  const socialLinks = (s?.socialLinks ?? []).flatMap((link) => {
    const platform = text(link.platform);
    const url = text(link.url);
    return platform && url ? [{ platform, url }] : [];
  });

  return {
    siteName: text(s?.siteName) ?? SITE_DEFAULTS.siteName,
    homeTitle: text(s?.homeTitle) ?? SITE_DEFAULTS.homeTitle,
    description: text(s?.defaultDescription) ?? SITE_DEFAULTS.description,
    businessDescription: text(s?.businessDescription) ?? SITE_DEFAULTS.businessDescription,
    email: text(s?.email),
    phone: text(s?.phone),
    serviceArea: text(s?.serviceArea),
    addressLocality: text(s?.addressLocality) ?? SITE_DEFAULTS.addressLocality,
    addressRegion: text(s?.addressRegion)?.toUpperCase() ?? SITE_DEFAULTS.addressRegion,
    addressCountry: SITE_DEFAULTS.addressCountry,
    areaServed: areaServed.length > 0 ? areaServed : [...SITE_DEFAULTS.areaServed],
    socialLinks,
    defaultOgImage: s?.defaultOgImage?.asset ? stegaClean(s.defaultOgImage) : null,
    updatedAt: s?._updatedAt ?? null,
  };
}

/** Absolute URL on the canonical origin for a site path, with no query string or trailing slash. */
export function absoluteUrl(path = '/'): string {
  const bare = path.split(/[?#]/)[0] || '/';
  const withSlash = bare.startsWith('/') ? bare : `/${bare}`;
  const trimmed = withSlash.replace(/\/+$/, '');
  return trimmed ? `${SITE_URL}${trimmed}` : SITE_URL;
}

/** False only on Vercel preview and development deployments; local builds count as production (SEO-R5). */
export function isIndexableDeployment(vercelEnv: string | undefined = process.env.VERCEL_ENV): boolean {
  return vercelEnv !== 'preview' && vercelEnv !== 'development';
}
