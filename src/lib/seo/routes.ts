/**
 * Registry of routable document types: `_type` → URL prefix. A document's path is `prefix + slug`.
 * Empty in 003; features 004–010 add entries such as `landingPage: '/'` or `service: '/services/'`.
 */
export type RouteRegistry = Readonly<Record<string, string>>;

export const ROUTES: RouteRegistry = {};

export type ResolvedPath = { kind: 'home' } | { kind: 'document'; type: string; slug: string };

export function routableTypes(routes: RouteRegistry = ROUTES): string[] {
  return Object.keys(routes);
}

export function pathFor(type: string, slug: string, routes: RouteRegistry = ROUTES): string | null {
  const prefix = routes[type];
  return prefix === undefined || !slug ? null : `${prefix}${slug}`;
}

/** Normalizes a request path: drops the query, hash, and trailing slash. */
export function normalizePath(path: string): string {
  const bare = path.split(/[?#]/)[0] || '/';
  const withSlash = bare.startsWith('/') ? bare : `/${bare}`;
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') || '/' : withSlash;
}

/** Reverses a path to the home page or a `{ type, slug }` pair. The most specific prefix wins. */
export function resolvePath(path: string, routes: RouteRegistry = ROUTES): ResolvedPath | null {
  const normalized = normalizePath(path);
  if (normalized === '/') return { kind: 'home' };

  const candidates = Object.entries(routes).sort(([, a], [, b]) => b.length - a.length);
  for (const [type, prefix] of candidates) {
    if (!normalized.startsWith(prefix)) continue;
    const slug = normalized.slice(prefix.length);
    if (slug && !slug.includes('/')) return { kind: 'document', type, slug };
  }
  return null;
}
