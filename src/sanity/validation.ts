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
