import type { Metadata } from 'next';
import { stegaClean } from 'next-sanity';
import { resolveOgImage } from './og';
import { absoluteUrl, SITE_LOCALE, SITE_URL, type ResolvedSite } from './site';

export type SeoImageInput = {
  asset?: { _ref: string } | null;
  hotspot?: unknown;
  crop?: unknown;
  alt?: string | null;
} | null;

/** The `seo` object of a routable document (004+). */
export type PageSeoInput = {
  title?: string | null;
  description?: string | null;
  noindex?: boolean | null;
  ogImage?: SeoImageInput;
} | null;

export type BuildMetadataInput = {
  site: ResolvedSite;
  /** Site path of the page, e.g. `/` or `/services/web-design`. */
  path: string;
  /** The document's own title, used when `seo.title` is empty. Ignored on the home page. */
  title?: string | null;
  seo?: PageSeoInput;
  indexable: boolean;
};

export type OgImage = { url: string; width: number; height: number; alt: string };

const clean = (value: string | null | undefined): string | null => {
  const text = stegaClean(value)?.trim();
  return text ? text : null;
};

/** `@handle` from an X or Twitter profile URL. */
export function xHandle(site: ResolvedSite): string | undefined {
  const link = site.socialLinks.find((item) => item.platform === 'x');
  const match = link?.url.match(/^https?:\/\/(?:www\.)?(?:x|twitter)\.com\/@?([A-Za-z0-9_]{1,15})\/?$/);
  return match ? `@${match[1]}` : undefined;
}

/**
 * Complete metadata for one page (SEO-R2). Next.js merges metadata shallowly, so `openGraph`, `twitter`, and
 * `robots` are always whole objects (SEO-R3).
 */
export function buildMetadata({ site, path, title, seo, indexable }: BuildMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const isHome = canonical === SITE_URL;
  const pageTitle = isHome ? site.homeTitle : (clean(seo?.title) ?? clean(title) ?? site.siteName);
  const fullTitle = isHome || pageTitle === site.siteName ? pageTitle : `${pageTitle} | ${site.siteName}`;
  const description = clean(seo?.description) ?? site.description;
  const image = resolveOgImage({
    title: pageTitle,
    siteName: site.siteName,
    path: isHome ? '/' : new URL(canonical).pathname,
    seoImage: seo?.ogImage,
    defaultImage: site.defaultOgImage,
  });
  const index = indexable && seo?.noindex !== true;

  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: fullTitle, template: `%s | ${site.siteName}` },
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      locale: SITE_LOCALE,
      siteName: site.siteName,
      url: canonical,
      title: pageTitle,
      description,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      site: xHandle(site),
      title: pageTitle,
      description,
      images: [{ url: image.url, alt: image.alt }],
    },
    robots: index
      ? {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
        }
      : { index: false, follow: true, googleBot: { index: false, follow: true } },
  };
}
