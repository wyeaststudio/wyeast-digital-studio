import { toPlainText } from '@portabletext/react';
import { stegaClean } from 'next-sanity';
import type { HomeFaq } from '@/sanity/loaders/seo';
import type { PageSection } from '@/components/sections/types';
import { isRenderableSection, visibleFaqs } from '@/lib/page-sections';
import { absoluteUrl, SITE_URL, type ResolvedSite } from './site';

export const SCHEMA_CONTEXT = 'https://schema.org';

export type JsonLdRef = { '@id': string };

export type JsonLdPlace = { '@type': 'Place'; name: string };

export type JsonLdPostalAddress = {
  '@type': 'PostalAddress';
  addressLocality: string;
  addressRegion: string;
  addressCountry: string;
};

export type ProfessionalServiceNode = {
  '@type': 'ProfessionalService';
  '@id': string;
  name: string;
  url: string;
  logo: string;
  image: string;
  description: string;
  email: string | null;
  telephone: string | null;
  address: JsonLdPostalAddress;
  areaServed: JsonLdPlace[];
  sameAs: string[];
};

export type WebSiteNode = {
  '@type': 'WebSite';
  '@id': string;
  url: string;
  name: string;
  description: string;
  inLanguage: string;
  publisher: JsonLdRef;
};

export type SiteGraph = {
  '@context': typeof SCHEMA_CONTEXT;
  '@graph': [ProfessionalServiceNode, WebSiteNode];
};

export type BreadcrumbItem = { name: string; path: string };

export type BreadcrumbListNode = {
  '@context': typeof SCHEMA_CONTEXT;
  '@type': 'BreadcrumbList';
  itemListElement: {
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }[];
};

export type FaqPageNode = {
  '@context': typeof SCHEMA_CONTEXT;
  '@type': 'FAQPage';
  mainEntity: {
    '@type': 'Question';
    name: string;
    acceptedAnswer: { '@type': 'Answer'; text: string };
  }[];
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isEmpty = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0) ||
  (isPlainObject(value) && Object.keys(value).length === 0);

const compactValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => compactValue(item)).filter((item) => !isEmpty(item));
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, item]) => [key, compactValue(item)] as const)
        .filter(([, item]) => !isEmpty(item)),
    );
  }
  return value;
};

/** Recursively removes undefined, null, empty-string, empty-array, and empty-object values. */
export function compact<T>(value: T): T {
  return compactValue(value) as T;
}

const clean = (value: string): string => stegaClean(value).trim();

/** Organization and website graph for every page (SEO-R10). Empty fields are omitted. */
export function siteGraph(site: ResolvedSite): SiteGraph {
  const businessId = `${SITE_URL}/#business`;
  const logo = absoluteUrl('/brand/logo.png');

  const business: ProfessionalServiceNode = {
    '@type': 'ProfessionalService',
    '@id': businessId,
    name: clean(site.siteName),
    url: absoluteUrl('/'),
    logo,
    image: logo,
    description: clean(site.businessDescription),
    email: site.email ? clean(site.email) : null,
    telephone: site.phone ? clean(site.phone) : null,
    address: {
      '@type': 'PostalAddress',
      addressLocality: clean(site.addressLocality),
      addressRegion: clean(site.addressRegion),
      addressCountry: clean(site.addressCountry),
    },
    areaServed: site.areaServed.map((name) => ({ '@type': 'Place', name: clean(name) })),
    sameAs: site.socialLinks.map((link) => clean(link.url)),
  };

  const website: WebSiteNode = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: absoluteUrl('/'),
    name: clean(site.siteName),
    description: clean(site.description),
    inLanguage: 'en-US',
    publisher: { '@id': businessId },
  };

  return compact({ '@context': SCHEMA_CONTEXT, '@graph': [business, website] });
}

/** Breadcrumb trail with absolute item URLs (SEO-R11). Returns null when no item has a name. */
export function breadcrumbList(items: BreadcrumbItem[]): BreadcrumbListNode | null {
  const named = items.flatMap((item) => {
    const name = clean(item.name);
    return name ? [{ name, path: item.path }] : [];
  });
  if (named.length === 0) return null;

  return compact({
    '@context': SCHEMA_CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: named.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  });
}

/**
 * FAQ page for the questions and answers rendered in the FAQ section (SEO-R13).
 * Answers are reduced to plain text. Returns null when no FAQ has both a question and an answer.
 */
export function faqPage(faqs: HomeFaq[]): FaqPageNode | null {
  const entries = faqs.flatMap((faq) => {
    const name = clean(faq.question ?? '');
    const text = stegaClean(toPlainText(faq.answer ?? []))
      .replace(/\s+/g, ' ')
      .trim();
    return name && text ? [{ name, text }] : [];
  });
  if (entries.length === 0) return null;

  return compact({
    '@context': SCHEMA_CONTEXT,
    '@type': 'FAQPage',
    mainEntity: entries.map(({ name, text }) => ({
      '@type': 'Question',
      name,
      acceptedAnswer: { '@type': 'Answer', text },
    })),
  });
}

export function faqPageForSections(sections: readonly PageSection[] | null | undefined): FaqPageNode | null {
  return faqPage((sections ?? []).flatMap((section) =>
    section?._type === 'faqSection' && isRenderableSection(section) ? visibleFaqs(section.items) : [],
  ));
}

/** JSON for an inline script. Escaping `<` keeps content from closing the script element (SEO-R12). */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
