import { stegaClean } from 'next-sanity';
import type { RoutableDoc } from '@/sanity/loaders/seo';
import { absoluteUrl, type ResolvedSite } from './site';
import { pathFor, ROUTES, type RouteRegistry } from './routes';

/** Escapes the Markdown characters that would break a link title. */
const escapeMarkdown = (text: string): string => text.replace(/[\\[\]*_`]/g, '\\$&');

export function buildLlmsTxt({
  site,
  docs,
  routes = ROUTES,
  homeNoindex = false,
}: {
  site: ResolvedSite;
  docs: RoutableDoc[];
  routes?: RouteRegistry;
  homeNoindex?: boolean;
}): string {
  const area = site.serviceArea ?? site.areaServed.join(', ');
  const contact = [site.email, site.phone].filter((value): value is string => Boolean(value));
  const details = [`Service area: ${area}.`, contact.length > 0 ? `Contact: ${contact.join(', ')}.` : null];

  const pages = homeNoindex ? [] : [`- [Home](${absoluteUrl('/')}): ${site.description}`];
  for (const doc of docs) {
    const slug = stegaClean(doc.slug);
    if (!slug) continue;
    const path = pathFor(stegaClean(doc._type), slug, routes);
    if (path === null) continue;
    const title = escapeMarkdown(stegaClean(doc.title) || slug);
    const description = stegaClean(doc.description);
    pages.push(`- [${title}](${absoluteUrl(path)})${description ? `: ${description}` : ''}`);
  }

  return [
    `# ${site.siteName}`,
    '',
    `> ${site.businessDescription}`,
    '',
    details.filter(Boolean).join(' '),
    '',
    '## Pages',
    '',
    ...pages,
    '',
  ].join('\n');
}
