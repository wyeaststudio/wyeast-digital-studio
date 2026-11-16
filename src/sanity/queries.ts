import { defineQuery } from 'next-sanity';

// Probe query proving TypeGen wiring; replaced by real page queries in later features.
export const PAGES_QUERY = defineQuery(`*[_type == "page" && defined(title)]{ _id, title }`);
