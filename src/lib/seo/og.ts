import { stegaClean } from 'next-sanity';
import { urlForImage } from '@/lib/sanity-image';
import type { OgImage, SeoImageInput } from './metadata';
import { absoluteUrl } from './site';

export const OG_SIZE = { width: 1200, height: 630 } as const;

/** Light-theme `--primary` / `--primary-foreground` as hex; ImageResponse can't read CSS variables. Guarded by tokens.test.ts. */
export const OG_PALETTE = { background: '#434945', foreground: '#E5E2D9' } as const;

/** Short FNV-1a hash, used to version generated card URLs so caches pick up title changes. */
export function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

export function ogCardPath(path: string): string {
  return path === '/' ? '/og' : `/og${path}`;
}

/** The title without a leading or trailing "{siteName} |", since the card and alt text already name the site. */
export function cardTitle(title: string, siteName: string): string {
  const text = stegaClean(title).trim();
  const name = stegaClean(siteName).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const stripped = text
    .replace(new RegExp(`^${name}\\s*[|:–—-]\\s*`), '')
    .replace(new RegExp(`\\s*[|:–—-]\\s*${name}$`), '')
    .trim();
  return stripped || text;
}

type ResolveOgImageInput = {
  title: string;
  siteName: string;
  /** Normalized site path of the page. */
  path: string;
  seoImage?: SeoImageInput;
  defaultImage?: SeoImageInput;
};

/** The page upload, else the site default upload, else the generated branded card (SEO-R8). */
export function resolveOgImage({ title, siteName, path, seoImage, defaultImage }: ResolveOgImageInput): OgImage {
  const cleanSiteName = stegaClean(siteName);
  const cleanTitle = cardTitle(title, cleanSiteName);
  const fallbackAlt = `${cleanTitle}, ${cleanSiteName}`;
  const upload = [seoImage, defaultImage].find((image) => image?.asset?._ref);

  if (upload) {
    const url = urlForImage(upload as Parameters<typeof urlForImage>[0])
      .width(OG_SIZE.width)
      .height(OG_SIZE.height)
      .fit('crop')
      .format('jpg')
      .quality(85)
      .url();
    return { url, ...OG_SIZE, alt: stegaClean(upload.alt)?.trim() || fallbackAlt };
  }

  const version = fnv1a(`${cleanTitle}\u0000${cleanSiteName}`);
  return { url: `${absoluteUrl(ogCardPath(path))}?v=${version}`, ...OG_SIZE, alt: fallbackAlt };
}
