import { defineQuery } from 'next-sanity';

// Probe query proving TypeGen wiring; replaced by real page queries in later features.
export const PAGES_QUERY = defineQuery(`*[_type == "page" && defined(title)]{ _id, title }`);

export const SHELL_QUERY = defineQuery(`{
  "settings": *[_type == "siteSettings" && _id == "siteSettings"][0]{
    siteName,
    email,
    phone,
    serviceArea,
    socialLinks[]{ _key, platform, url }
  },
  "navigation": *[_type == "navigation" && _id == "navigation"][0]{
    headerLinks[]{ _key, label, "href": link.href, children[]{ _key, label, "href": link.href } },
    headerCta{ label, "href": link.href },
    footerLinks[]{ _key, label, "href": link.href }
  }
}`);

// SEO defaults, business details, and social links for metadata, JSON-LD, and llms.txt (003).
export const SITE_SEO_QUERY = defineQuery(`*[_type == "siteSettings" && _id == "siteSettings"][0]{
  _updatedAt,
  siteName,
  email,
  phone,
  homeTitle,
  defaultDescription,
  businessDescription,
  addressLocality,
  addressRegion,
  areaServed,
  serviceArea,
  "defaultOgImage": defaultOgImage{ asset, hotspot, crop, alt },
  socialLinks[]{ platform, url }
}`);

// Every published, indexable routable document (SEO-R14, R17). $types comes from the route registry.
export const ROUTABLE_DOCS_QUERY = defineQuery(`*[_type in $types && defined(slug.current) && seo.noindex != true]{
  _type,
  "slug": slug.current,
  _updatedAt,
  "title": coalesce(seo.title, title),
  "description": seo.description
}`);

// Social card lookup for one path (SEO-R9).
export const OG_DOC_QUERY = defineQuery(`*[_type == $type && slug.current == $slug && seo.noindex != true][0]{
  "title": coalesce(seo.title, title)
}`);

// Shared FAQ projection; 004's page-builder query reuses it.
export const FAQ_PROJECTION = `_id, question, answer`;

// Temporary home FAQ source until 005 (SEO-R23).
export const HOME_FAQS_QUERY = defineQuery(
  `*[_type == "faq" && defined(question)] | order(_createdAt asc, _id asc)[0...12]{ ${FAQ_PROJECTION} }`,
);
