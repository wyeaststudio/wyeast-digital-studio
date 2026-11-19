# 004 — Page builder: Plan

**Status:** Approved (2026-11-18) · **Spec:** [spec.md](./spec.md)

## Approach

1. **Content model.** Replace the placeholder `page` type with a real `page` document, and add a `homePage` singleton and a `testimonial` document. Eight block object types share two common fields (`anchor`, `surface`) through a helper. A shared `pageSections` array type lists the blocks, so `page` and `homePage` use the same builder and validation (hero first and only once, unique anchors).
2. **One projection, one query per route.** A `SECTIONS_PROJECTION` constant expands references (FAQs, testimonials) and image metadata once. `PAGE_QUERY`, `HOME_PAGE_QUERY`, and `PAGE_SLUGS_QUERY` interpolate it, so TypeGen produces one discriminated-union type for all sections (TypeGen evaluates interpolated constants; confirmed in 003 T2).
3. **Presentational blocks, one renderer.** Each block is a server component in `src/components/sections/` that takes the TypeGen-derived props. `PageSections` maps `_type` to component, skips unknown or incomplete sections (PB-R8), wraps each in `Section` (landmark, surface classes, anchor id, Visual Editing data attribute), and decides the `h1` fallback (PB-R9).
4. **Routes.** `(web)/page.tsx` renders `homePage`; a new `(web)/[slug]/page.tsx` renders `page` documents with `generateStaticParams`, `generateMetadata` (003 `buildMetadata`), and `FAQPage` JSON-LD. The route registry gains `page: '/'` for the sitemap, `llms.txt`, and social cards. Crawler outputs also read published Home SEO to respect its visibility.
5. **Visual Editing.** Presentation gets `resolve.mainDocuments` and `resolve.locations`. String fields are click-to-edit through stega; each section element carries a `data-sanity` attribute for its array item, so the overlays can reorder sections. No client component is needed: the existing `<VisualEditing />` refreshes the page after each patch.
6. **Seed and docs.** Seed the Home page (Figma copy, placeholder hero image), a noindex demo page with every block, and one example testimonial. Amend the constitution (§4, version 2.0.0) and update the roadmap (005).

### Docs consulted

Owner-approved PR review clarification (2026-11-18): prose retains the authored `h3`/`h4` styles and their visual classes, but renders contextual semantic levels. Without a section heading, authored `h3` maps to `h2` and following `h4` to `h3`; with a section heading they remain `h3`/`h4`. Leading `h4` headings render at the body's starting level until an authored `h3` establishes a parent, so consecutive leading headings stay siblings. FAQ remains paragraph-only. No schema or stored content changes are required.

Owner-approved adjustments (2026-11-18, Phase D):

- Preserve PB-R23 noindex. Mobile/desktop Lighthouse `assertMatrix` rules keep Home at four-category 100; the demo requires the other three categories at 100 plus every other applicable automated SEO audit passing. Only its necessarily failing `is-crawlable` audit and SEO category are warnings; no audit is skipped. Browser tests enforce noindex and sitemap/llms exclusion. Both routes explicitly assert LCP ≤ 2.5 s and CLS ≤ 0.1. This supersedes four-category-100 references for the demo and is recorded in constitution v3.0.0.
- A new live-image check found that generated document cards intentionally reject noindex pages, leaving the demo's `og:image` at a 404 URL. Without a page/site image upload, `buildMetadata` now uses the valid site-wide card and matching image alt/version while preserving page-specific titles/canonical/noindex. Uploaded images and indexable-page cards are unchanged; published-only OG restrictions remain intact.
- A cold Lighthouse run exposed speculative Next.js prefetches to future seeded `/contact` and `/about` routes, producing console 404s and failing Best Practices. The owner approved `prefetch={false}` in the shared CMS-driven `SiteLink`; client-side navigation still runs on click, and external link behavior is unchanged. This avoids background requests to unpublished destinations without fake pages, error suppression, or weakening the audit. Known Home logo links keep their existing behavior. A browser regression checks initial/hover requests and subsequent successful navigation.

Owner-approved adjustment (2026-11-18, Phase B): use `getImageProps` from `next/image` with native server-rendered images instead of the `Image` component. A custom loader prop cannot cross its client boundary without client code, contrary to PB-R12. The hero explicitly preloads its responsive source set and uses an LQIP CSS background underneath the loaded image (not `placeholder="blur"`, which `getImageProps` cannot remove). Testimonials use the same server-only path. `sanityImageLoader` resizes pre-cropped URLs while preserving their hotspot rectangle and aspect ratio. This supersedes `Image` component references below; sections add no client image code.

Phase B implementation: Home and Page components derive their data from the generated shared section union. A shared completeness guard handles unfinished drafts, and FAQ filtering is reused by rendering and JSON-LD. Hero source sets have mobile/desktop crops with matching media-specific preloads; a 90–95% token-background scrim keeps foreground text above 7:1 even over black or white images in either theme. CTA buttons use an opaque background and an inset current-color focus outline so every panel surface remains accessible. The strong scrim intentionally prioritizes the contrast requirement over Figma's lighter photo treatment; the licensed photo still needs the launch UX review.

- Bundled Next.js 16 docs: `generate-static-params.md` (with Cache Components, an empty array is a build error, so the route returns a placeholder param when there are no pages and calls `notFound()` for it), `dynamic-routes.md`, `image.md` (`preload` replaces the deprecated `priority`; custom `loader`), `not-found.md`, and `generate-metadata.md`.
- Sanity: `sanity/presentation` (`defineDocuments`, `defineLocations`), `createDataAttribute` from `next-sanity`, array validation, and `@sanity/image-url` (already a direct dependency from 003).

## Constitution check

| Principle | How the plan complies |
| --- | --- |
| §2 Mobile-first, tokens only | Blocks are styled mobile-first with Tailwind token classes. Surfaces map to existing token pairs (`background`/`foreground`, `card`/`card-foreground`, `primary`/`primary-foreground`). The hero scrim uses `foreground`/`background` with opacity, checked by axe over the image. |
| §3.1 Presentational components | Blocks receive typed props from TypeGen results and never fetch. Routes and loaders fetch. |
| §4 Content model | Amended to "page builder for every page" (PB-R24, below). Every image has alt text or a decorative flag; every routable document has the SEO object and a unique slug; Visual Editing works on both routes. |
| §5 Accessibility | One `h1` per page, logical headings, a landmark per section, link names that include the card title, 44 px targets, focus indicators per surface, no motion. |
| §6 Performance | No client JavaScript from blocks. One raster image (the hero), served from the Sanity CDN at the right size with `preload`. Icons are inline SVG from `lucide-react` (already a dependency, tree-shaken). |
| §7 SEO | Pages register with the 003 registry; FAQ blocks feed one `FAQPage` per page. |
| §9 Definition of done | Vitest for schema helpers, the renderer, and each block; Playwright and axe on `/` and the demo page; Lighthouse on both. |
| §10 Cost | Schema, seed, and the simpler blocks are routine and marked for a lightweight model in `tasks.md`. |

### Constitution amendment (PB-R24)

Replace the first bullet of §4 with:

> - **Page builder for every page.** Every page, including Home, Services overview, About, Process, and Contact, is composed in Sanity from an ordered array of reusable section blocks. The block library, Studio validation, and design tokens keep pages on-brand; new layouts are added as new blocks, not as one-off templates. Collection item pages (for example a service detail page) may use structured fields when their content is uniform.

Bump the version to **2.0.0** (a principle is redefined) and record the amendment date.

## Sanity schema

### `page` (document, replaces the 001 placeholder)

| Field | Type | Validation |
| --- | --- | --- |
| `title` | `string` | Required, max 80. Used for the page header `h1` when there is no hero, the SEO title fallback, and the Studio list. |
| `slug` | `slug` from `title` | Required, unique, `isValidPageSlug` (lowercase letters, digits, and single hyphens; 1–60 characters), and not in `RESERVED_SLUGS` |
| `seo` | `seo` (003) | — |
| `sections` | `pageSections` | Max 20 |

Preview: title and `/{slug}`. Studio structure: "Pages" after "FAQs". The 001 probe query `PAGES_QUERY` and its `fetch.test.ts` type check move to `PAGE_SLUGS_QUERY`.

`RESERVED_SLUGS` (in `validation.ts`): `studio`, `api`, `og`, `sitemap.xml`, `robots.txt`, `llms.txt`, `favicon.ico`, `brand`, and `_next`. `services`, `about`, `process`, and `contact` are **not** reserved, because those overview pages are page-builder pages. The list is unit-tested and commented.

### `homePage` (singleton)

| Field | Type | Validation |
| --- | --- | --- |
| `sections` | `pageSections` | Min 1, max 20 |
| `seo` | `seo` | The SEO title is ignored at `/` (the home title comes from `siteSettings.homeTitle`); the description and image override the site defaults. The field description says so. |

Added to `SINGLETON_TYPES`, so it gets the singleton list item and actions.

### `testimonial` (document)

| Field | Type | Validation |
| --- | --- | --- |
| `quote` | `text` | Required, max 400 |
| `name` | `string` | Required, max 60 |
| `role` | `string` | Max 60 |
| `company` | `string` | Max 60 |
| `photo` | `image` with hotspot and `alt` | Optional; `alt` required when set |
| `permission` | `boolean` "I have permission to publish this testimonial" | Must be `true` to publish (error) |

Queries also filter `permission == true` (PB-R21), so a testimonial can't render even if validation is bypassed.

### `pageSections` (array type) and shared block fields

`pageSections` is an `array` of the eight block types. Array-level validation (`pageSectionsRule`, unit-tested):
- a `hero` may only be the first item and only once;
- `anchor` values are unique.

`defineBlock({ name, title, icon, defaultSurface, surfaces, fields, preview })` adds two fields to every block:
- `anchor`: `string`, optional, `isValidAnchor` (lowercase, digits, hyphens; max 40);
- `surface`: `string` list from `surfaces` (radio), `initialValue: defaultSurface`.

| Block (`_type`) | Fields | Surfaces (default first) | Figma |
| --- | --- | --- | --- |
| `heroSection` | `eyebrow` (max 40), `heading` (required, max 80), `body` (max 240), `primaryCta` and `secondaryCta` (`labelledLink` from 002, optional), `showLockup` (boolean), `image` (required; hotspot; `alt` or `decorative`) | Image only (no surface field) | `35:256`, `45:4` |
| `trustBarSection` | `items`: 2–4 × { `icon` (`iconName`), `text` (required, max 60) } | primary, background, card | `47:3` |
| `featureGridSection` | `eyebrow`, `heading` (required, max 80), `intro` (max 240), `cards`: 2–9 × { `icon`, `badge` (max 12), `title` (required, max 60), `description` (required, max 240), `link` (`labelledLink`, optional) } | background, card, primary | `61:256` |
| `ctaBannerSection` | `heading` (required, max 80), `body` (max 240), `cta` (`labelledLink`, required) | primary, card, background | `61:256` panel |
| `processStepsSection` | `heading` (required), `intro`, `steps`: 2–6 × { `icon`, `title` (required, max 40), `description` (required, max 200) } | background, card, primary | `66:253` |
| `faqSection` (003) | Unchanged, plus the shared fields | primary, background, card | `81:269`, `79:423` |
| `richTextSection` | `heading` (max 80), `body` (`richTextBody`: `normal`, `h3`, `h4`, bullet and number lists, `strong`, `em`, `link`; required) | background, card | — |
| `testimonialsSection` | `heading` (max 80), `items`: 1–3 unique references to `testimonial` (`uniqueRefs`, filtered to `permission == true`) | card, background, primary | — |

`iconName` is a `string` with a fixed `options.list` from `ICONS` (below). Image `alt`/`decorative`: an `imageWithAlt` helper validates "alt text required unless decorative".

`faqSection` keeps its 003 name and fields; it gains the shared fields by being re-declared through `defineBlock` (no data migration: the fields are optional).

Implementation note (Phase A): Sanity field-level validation replaces the named array type's validation. `page.sections` inherits the shared rules unchanged; `homePage.sections` repeats `pageSectionsRule` alongside its required/min/max rules. Compiled-schema regression tests verify both document types reject duplicate heroes, misplaced heroes, and duplicate anchors.

### Icons (`src/components/sections/icons.tsx`)

`ICONS` maps a name to a `lucide-react` component: `accessibility`, `activity`, `bar-chart`, `code`, `cpu`, `map-pin`, `message-square`, `rocket`, `search`, `shapes`, `target`, `zap`, `shield-check`, `gauge`, `sparkles`, `layout`. The schema imports only the names (`ICON_NAMES`, from a tiny `icon-names.ts`) so the Studio bundle doesn't pull the components. `Icon` renders nothing for an unknown name and always sets `aria-hidden="true"`.

### Seed data

`sanity/seed/pages.json`:
- `homePage` with the 005 interim Home content: hero with the booking-placeholder CTA and lockup, trust bar (three items), six unlinked capability cards, CTA banner, four process steps, the 003 FAQ section referencing the six seeded FAQs, and a copy-only booking placeholder after the FAQ. Final copy/photo approval and replacement are deferred to 011; the booking placeholder is replaced by 009's section when available;
- a `page` `page-builder-demo` (`seo.noindex: true`) with all eight blocks on varied surfaces and anchors;
- one `testimonial` with "Placeholder:" copy and `permission: true`, used only on the demo page;
- a placeholder hero image: a 2400×1350 JPEG soft gradient in the brand palette (no photo), committed at `sanity/seed/hero-placeholder.jpg`. A small script (`npx sanity exec scripts/seed-hero-image.ts --with-user-token`) uploads it once and sets it on the home hero. The README documents replacing it with the licensed photo.

## GROQ queries

```ts
// Expands references and image data once for every section type.
export const SECTIONS_PROJECTION = `
  _key, _type, anchor, surface,
  _type == "heroSection" => { eyebrow, heading, body, showLockup,
    primaryCta{ label, "href": link.href }, secondaryCta{ label, "href": link.href },
    image{ asset, hotspot, crop, alt, decorative, "lqip": asset->metadata.lqip, "dimensions": asset->metadata.dimensions } },
  _type == "trustBarSection" => { items[]{ _key, icon, text } },
  _type == "featureGridSection" => { eyebrow, heading, intro, cards[]{ _key, icon, badge, title, description, link{ label, "href": link.href } } },
  _type == "ctaBannerSection" => { heading, body, cta{ label, "href": link.href } },
  _type == "processStepsSection" => { heading, intro, steps[]{ _key, icon, title, description } },
  _type == "faqSection" => { eyebrow, heading, intro, "items": faqs[]->{ ${FAQ_PROJECTION} } },
  _type == "richTextSection" => { heading, body },
  _type == "testimonialsSection" => { heading, "items": items[@->permission == true]->{ _id, quote, name, role, company, photo{ asset, hotspot, crop, alt } } }
`;

export const HOME_PAGE_QUERY = defineQuery(`*[_id == "homePage"][0]{ _id, _type, seo, sections[]{ ${SECTIONS_PROJECTION} } }`);
export const PAGE_QUERY = defineQuery(`*[_type == "page" && slug.current == $slug][0]{ _id, _type, title, "slug": slug.current, seo, sections[]{ ${SECTIONS_PROJECTION} } }`);
export const PAGE_SLUGS_QUERY = defineQuery(`*[_type == "page" && defined(slug.current)].slug.current`);
```

If TypeGen can't narrow the conditional projections into a discriminated union, the fallback is one projection per block type joined with `select()`.

Implementation note (T3): direct conditional projections generate matching eight-member `_type`-discriminated section unions for Home and Page; no fallback is needed. Testimonials are filtered on reference targets before dereferencing, so denied, unconfirmed, and broken references are omitted; both queries have in-memory GROQ regression tests. The SEO loader now derives `RoutableDoc` from `ROUTABLE_DOCS_QUERY_RESULT`, and downstream path/title builders explicitly handle its nullable slug.

### Loaders (`src/sanity/loaders/pages.ts`)

| Loader | Query | Cache tags | On error |
| --- | --- | --- | --- |
| `getHomePage({ publishedOnly? })` | `HOME_PAGE_QUERY` | `homePage`, `faq`, `testimonial` | `null` and log |
| `getPage(slug)` | `PAGE_QUERY` | `page`, `page:{slug}`, `faq`, `testimonial` | `null` and log |
| `getPageSlugs()` | `PAGE_SLUGS_QUERY` | `page` | `[]` and log |

Loaders keep stega (blocks need it for click-to-edit). Metadata and JSON-LD go through the 003 builders, which already clean stega. `ROUTES` gains `page: '/'`, so `getRoutableDocs()` and `OG_DOC_QUERY` include pages automatically.

The sitemap and `llms.txt` also read `getHomePage({ publishedOnly: true })` and omit Home when its published SEO sets `noindex`. This reuses the Home query's published cache entry and `homePage` dependency, so publishing visibility changes refreshes both crawler outputs; drafts do not alter Home's crawler visibility.

## Routes and components

| File | Server/Client | Purpose |
| --- | --- | --- |
| `src/app/(web)/page.tsx` | Server | `generateMetadata` → `buildMetadata({ path: '/', seo: home.seo })`; renders `PageSections` from `getHomePage()` and `FAQPage` JSON-LD from its FAQ sections. Replaces the temporary home and the 003 FAQ wiring. |
| `src/app/(web)/[slug]/page.tsx` | Server | `generateStaticParams` from `getPageSlugs()` (a `__placeholder__` param when empty); `notFound()` when `getPage()` is null; `generateMetadata` with the page title and SEO; renders `PageSections` and `FAQPage` JSON-LD. Coexists with `[...notFound]` (one segment matches `[slug]` first). |
| `src/components/sections/page-sections.tsx` | Server | Maps `_type` to block; skips unknown or incomplete sections; renders the page header `h1` when the first section isn't a hero (PB-R8, R9); passes `documentId`/`documentType` for data attributes. |
| `src/components/sections/section.tsx` | Server | `<section id={anchor} aria-labelledby={headingId} data-sanity={…} className={surfaceClasses[surface]}>`. Owns padding and the max width. |
| `src/components/sections/page-header.tsx` | Server | The fallback `h1` header. |
| `src/components/sections/hero-section.tsx` | Server | `next/image` with `fill`, `preload`, `fetchPriority="high"`, `sizes="100vw"`, the `sanityImageLoader` (hotspot crop, `auto=format`), and the LQIP as `blurDataURL`; a gradient scrim from `background`; optional `BrandLockup`; CTAs with `buttonVariants`. |
| `src/components/sections/trust-bar-section.tsx`, `feature-grid-section.tsx`, `cta-banner-section.tsx`, `process-steps-section.tsx`, `rich-text-section.tsx`, `testimonials-section.tsx` | Server | One block each; `faq-section.tsx` (003) gains the surface and anchor props through `Section`. |
| `src/components/sections/icons.tsx`, `src/sanity/schemas/icon-names.ts` | Server / shared | Curated icons. |
| `src/components/rich-text/rich-text.tsx` | Server | Gains a `prose` variant for authored `h3`/`h4` styles with contextual semantic levels; the FAQ keeps its limited set. |
| `src/lib/sanity-image.ts` | Shared | `sanityImageLoader` and `urlForImage` (uses `@sanity/image-url`; shared with `og.ts`). |
| `src/lib/seo/json-ld.ts` | Shared | `faqPage` gains a helper that collects FAQ items from all FAQ sections on a page. |
| `sanity.config.ts` | Studio | `presentationTool({ resolve: { mainDocuments, locations } })` for `homePage` → `/` and `page` → `/{slug}`. |
| `src/sanity/structure.ts` | Studio | "Pages" and "Testimonials" list items. |

## Dependencies

None. `lucide-react`, `@portabletext/react`, `@sanity/image-url`, and `next-sanity` are already direct dependencies.

## Testing strategy

| Requirement | Vitest | Playwright |
| --- | --- | --- |
| R1, R2, R11, R21 | `validation.test.ts`: `isValidPageSlug`, `RESERVED_SLUGS`, `isValidAnchor`, `pageSectionsRule` (hero position and count, unique anchors), testimonial permission | — |
| R3 | — | `pages.spec.ts`: `/no-such-page` is 404 and noindex |
| R4, R22 | `page-sections.test.tsx` with a home fixture | `pages.spec.ts`: `/` renders the seeded sections in order with one `h1` |
| R5 | `routes.test.ts`: the `page` entry; `metadata.test.ts` unchanged | `pages.spec.ts`: the demo page title, canonical, and `og:image`; the demo page is absent from the sitemap |
| R6 | `pages.test.ts`: loader cache tags and `null`/`[]` on error | Build output lists `/[slug]` as prerendered |
| R7 | — | Manual (UX review); `draft-mode.spec.ts` checks draft mode renders the demo page |
| R8, R9 | `page-sections.test.tsx`: order, skipping, page header fallback, heading levels | `pages.spec.ts`: one `h1` and no skipped levels on `/` and the demo page |
| R10 | `tokens.test.ts`: the `card` and `primary` pairs already at 7:1; focus ring per surface | `pages.spec.ts`: axe on the demo page in light and dark |
| R12 | `icons.test.tsx`: unknown name renders nothing; `aria-hidden` | — |
| R13–R20 | One `*.test.tsx` per block with fixtures (headings, lists, link names, `figure`/`blockquote`, image `alt`) | `pages.spec.ts`: the hero has no layout shift; feature-grid links ≥ 44 px; the demo page `FAQPage` names equal its visible questions |
| R23 | — | Lighthouse CI adds the demo page URL to both configs |
| R24 | — | Owner approval |

## Risks and alternatives considered

- **Fixed templates for core pages (the constitution's original model).** *Rejected by the owner (Q-A)*: the page builder gives editors more control, and the block library plus validation keep pages on-brand.
- **One `[slug]` route with nested paths.** *Deferred*: one segment keeps routing, reserved slugs, and the registry simple; 006 adds `/services/{slug}` as its own type.
- **TypeGen and conditional projections.** Confirmed in T3: direct conditional projections produce the required discriminated union; `select()` is unnecessary.
- **Empty `generateStaticParams` with Cache Components** is a build error; the placeholder param plus `notFound()` keeps fresh datasets building.
- **Drag-to-reorder in Presentation.** Relies on Sanity overlays reading `data-sanity` array-item attributes and the existing refresh. If reordering is unreliable without optimistic state, the fallback is a small draft-mode-only client wrapper using `useOptimistic` from `next-sanity`, loaded the same way as `<VisualEditing />` so public pages stay JavaScript-free.
- **Hero image size.** Sanity CDN resizing (`w`, `q`, `auto=format`) through a custom `next/image` loader avoids the Next image optimiser and its cost on Vercel. If LCP misses the budget, add `srcset` widths tuned to Figma breakpoints and a smaller `q`.
- **Text over photos.** Contrast depends on the image. The scrim is strong enough for the brand photo; axe checks the seeded image, and the UX review checks the licensed photo when it arrives.
- **Testimonials without permission.** The permission field plus the query filter prevent publishing quotes by accident; placeholder testimonials appear only on the noindex demo page.
