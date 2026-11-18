const INTERNAL_PATH = /^\/(?!\/)[^\s\\]*$/;

/** True for an internal path (`/about`) or an absolute `https://` URL. */
export function isValidHref(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0) return false;
  if (INTERNAL_PATH.test(value)) return true;
  if (!value.startsWith('https://')) return false;
  try {
    return new URL(value).hostname.length > 0;
  } catch {
    return false;
  }
}

export const HREF_ERROR = 'Use an internal path that starts with "/" (like /about) or a full https:// URL.';

const SEO_TITLE_MAX = 60;
const SEO_DESCRIPTION_MIN = 70;
const SEO_DESCRIPTION_MAX = 160;

/** Warning text when an SEO title is longer than search engines usually display. */
export function seoTitleWarning(value: unknown): true | string {
  if (typeof value !== 'string' || value.length <= SEO_TITLE_MAX) return true;
  return `Titles over ${SEO_TITLE_MAX} characters may be cut off in search results (${value.length} now).`;
}

/** Warning text when an SEO description is missing or outside the 70–160 character range. */
export function seoDescriptionWarning(value: unknown): true | string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return `Add a description of ${SEO_DESCRIPTION_MIN}–${SEO_DESCRIPTION_MAX} characters.`;
  }
  if (value.length < SEO_DESCRIPTION_MIN || value.length > SEO_DESCRIPTION_MAX) {
    return `Descriptions work best between ${SEO_DESCRIPTION_MIN} and ${SEO_DESCRIPTION_MAX} characters (${value.length} now).`;
  }
  return true;
}

/** Error text when the same document is referenced more than once in an array. */
export function uniqueRefs(value: unknown): true | string {
  if (!Array.isArray(value)) return true;
  const refs = value.map((item) => (item as { _ref?: unknown } | undefined)?._ref).filter(Boolean);
  return new Set(refs).size === refs.length ? true : 'Each item can only be added once.';
}

// App routes and public assets own these paths; core overview pages stay available to the page builder.
export const RESERVED_SLUGS: readonly string[] = [
  'studio',
  'api',
  'og',
  'sitemap.xml',
  'robots.txt',
  'llms.txt',
  'favicon.ico',
  'brand',
  '_next',
];

const INVALID_SEGMENT_CHARACTER = /[^a-z0-9-]/;

export function isValidPageSlug(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= 60 &&
    !INVALID_SEGMENT_CHARACTER.test(value) &&
    !/(^-|-$|--)/.test(value) &&
    !RESERVED_SLUGS.includes(value)
  );
}

export function isValidAnchor(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= 40 &&
    !INVALID_SEGMENT_CHARACTER.test(value)
  );
}

export function pageSectionsRule(value: unknown): true | string {
  if (!Array.isArray(value)) return true;
  const sections: unknown[] = value;
  const anchors = new Set<string>();

  for (const [index, section] of sections.entries()) {
    if (typeof section !== 'object' || section === null) continue;
    if ('_type' in section && section._type === 'heroSection' && index !== 0) {
      return 'A hero can only appear once, as the first section.';
    }
    if (!('anchor' in section) || typeof section.anchor !== 'string' || section.anchor.length === 0) continue;
    if (anchors.has(section.anchor)) return `Each section anchor must be unique ("${section.anchor}" is repeated).`;
    anchors.add(section.anchor);
  }

  return true;
}

export function altOrDecorative(value: unknown): true | string {
  if (value === undefined || value === null) return true;
  if (typeof value === 'object') {
    if ('decorative' in value && value.decorative === true) return true;
    if ('alt' in value && typeof value.alt === 'string' && value.alt.trim().length > 0) return true;
  }
  return 'Add alt text or mark the image as decorative.';
}
