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
