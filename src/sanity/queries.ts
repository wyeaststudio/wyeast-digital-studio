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
