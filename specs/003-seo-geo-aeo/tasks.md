# 003 — SEO, GEO, and AEO system: Tasks

**Status:** Approved (2026-11-17) · **Plan:** [plan.md](./plan.md)

Run the tasks in order. Each is small and independently verifiable, and each lists the requirements it covers and how to verify it. While working, run only the task's own check. Run the full Definition of Done (constitution §9) once, in T14. Tasks marked _(lightweight model)_ are routine generation that can go to a cheaper model (constitution §10).

## Phase A — Content

- [x] **T1 — Validation helpers and schema types** _(lightweight model)_
  Extend `src/sanity/validation.ts` and `validation.test.ts` with:
  - `seoTitleWarning` (over 60 characters);
  - `seoDescriptionWarning` (missing, or outside 70–160 characters);
  - `uniqueRefs` (duplicate `_ref`s).

  Add these schema types and register them in `schemas/index.ts`:
  - `objects/seo.ts`;
  - `objects/faq-answer.ts`: `normal` style; bullet and number lists; `strong` and `em`; a `link` annotation whose `href` uses `isValidHref` and `HREF_ERROR`;
  - `objects/faq-section.ts`;
  - `documents/faq.ts`, including the question "?" warning.

  Add the "SEO and business" group and fields to `singletons/site-settings.ts`, and put the existing fields in a "General" group. Add an "FAQs" list item after the singletons in `structure.ts`.
  _Covers:_ SEO-R7, R19, R21 · _Verify:_ `npm run test -- validation && npx sanity schema validate`
  - Task log: the Studio structure filters `faq` out of the auto-generated list so it appears once, under "FAQs".

- [x] **T2 — Dependencies, queries, TypeGen, and loaders**
  Run `npm install @portabletext/react@^6.2.0 @sanity/image-url@^2.1.1`. Confirm that the lockfile versions are unchanged, apart from the direct-dependency entries.

  Add these to `queries.ts`:
  - `SITE_SEO_QUERY`
  - `ROUTABLE_DOCS_QUERY`
  - `OG_DOC_QUERY`
  - `HOME_FAQS_QUERY`
  - the `FAQ_PROJECTION` constant. If TypeGen can't type an interpolated constant, inline the fields and record that in the plan.

  Run `npm run typegen`. Add `src/lib/seo/routes.ts` (an empty `ROUTES` registry, `routableTypes`, `pathFor`, and `resolvePath`) and its tests. Add `src/sanity/loaders/seo.ts`:
  - `getSiteSeo`, `getRoutableDocs`, `getOgTitle`, and `getHomeFaqs`;
  - the cache tags from the plan's table;
  - `stegaClean` on every loader except the FAQ one;
  - `null` or `[]` on error.

  Add `seo.test.ts`, which mocks `sanityFetch` to reject and resolve, and includes a stega fixture.
  _Covers:_ SEO-R6, R14 (registry), R15, R18 · _Verify:_ `npm run typegen && npm run typecheck && npm run test -- seo routes`
  - Task log: `npm install` bumped `@sanity/image-url` to 2.2.0, so it was pinned back to the existing 2.1.1; the lockfile diff is the two root entries only. TypeGen types the interpolated `FAQ_PROJECTION`. The registry maps `_type` → URL prefix (plan updated). `ROUTABLE_DOCS_QUERY` types as `never[]` until a routable type exists, so `RoutableDoc` is declared by hand. A shared `src/test-utils/stega.ts` (`@vercel/stega`, already installed) produces stega fixtures.

- [x] **T3 — Seed content and README** _(lightweight model)_
  Create `sanity/seed/seo.json`:
  - six `faq` documents with the Figma questions and answers that start with "Placeholder:";
  - the new `siteSettings` values. The home title and business description are the placeholders from spec Q9 and Q10. The seed also sets Portland, OR, and the areas served.

  Apply missing documents with `npx sanity documents create sanity/seed/seo.json --missing`. Enter existing `siteSettings` values in Studio; never replace the full seed, which also overwrites FAQ edits. Add the seed steps to the README's Sanity setup section, and note that the copy is placeholder content to be replaced in 011.
  _Covers:_ SEO-R1, R23 (content) · _Verify:_ `npx sanity documents query '*[_type=="faq"]{question}'` returns six; the Studio shows the new fields filled
  - Task log: the live `siteSettings` matched `shell.json`, so the merged seed was applied with `--replace` (no Studio edits lost). FAQ ids are `faq-01-…`–`faq-06-…`, and `HOME_FAQS_QUERY` orders by `_createdAt, _id`, because seeded documents share a creation time. The Q9 wording wasn't recorded, so new placeholder text was written (prefixed "Placeholder:").

## Phase B — Builders (pure, unit-tested)

- [x] **T4 — Site defaults and metadata builder**
  Add `src/lib/seo/site.ts` (`SITE_URL`, `SITE_DEFAULTS`, `absoluteUrl`, and `isIndexableDeployment`) and `metadata.ts` (`buildMetadata`), with `metadata.test.ts` covering:
  - `null` settings use the Wy'east defaults;
  - the title template, and the absolute home title;
  - the canonical URL has no query string or trailing slash;
  - full `openGraph`, `twitter`, and `robots` objects when only a title is given;
  - `seo.noindex`;
  - `VERCEL_ENV` set to `preview`, `development`, `production`, or unset;
  - `twitter.site` comes from the X social link;
  - stega input produces clean output.

  The OG image comes from a stub until T7.
  _Covers:_ SEO-R1, R2, R3, R4, R5, R6 · _Verify:_ `npm run test -- metadata`
  - Task log: `resolveSite()` merges `siteSettings` with `SITE_DEFAULTS` and strips stega once for all builders. Titles use Next's `{ absolute, template }`, so the layout and home share one builder call.

- [x] **T5 — JSON-LD builders, component, and logo** _(lightweight model)_
  Add `src/lib/seo/json-ld.ts`:
  - `siteGraph`, `breadcrumbList`, `faqPage`, and `serializeJsonLd`;
  - minimal types and a `compact()` helper;
  - `@id` cross-references.

  Add `json-ld.test.ts` covering omitted empty fields, the address having no street, plain-text FAQ answers, the `</script>` escape, and stega input. Add `src/components/seo/json-ld.tsx` and a small test. Export the brand lockup from Figma as a 512×512 PNG to `public/brand/logo.png`.
  _Covers:_ SEO-R10, R11, R12, R6 · _Verify:_ `npm run test -- json-ld`
  - Task log: the 512×512 `logo.png` is rendered from the same Figma-exported lockup paths as `brand-logo.tsx` (on `primary`), not a separate export.

- [x] **T6 — Sitemap, robots, and `llms.txt` builders** _(lightweight model)_
  Add `src/lib/seo/sitemap.ts`, `robots.ts` (`AI_TRAINING_AGENTS`, checked against current vendor docs, with a policy comment), and `llms-txt.ts`, with tests. `robots.test.ts` includes the small specific-group-wins matcher, which checks that:
  - `GPTBot` is blocked;
  - `OAI-SearchBot`, `PerplexityBot`, and `Googlebot` are allowed;
  - `/studio` is blocked for everyone;
  - there are no duplicate agents;
  - the non-indexable deployment output disallows all.

  The sitemap and `llms.txt` tests cover the home-only case (`null` settings, no docs) and skipping noindex documents.
  _Covers:_ SEO-R4, R5, R14, R16, R17, R18 · _Verify:_ `npm run test -- sitemap robots llms`

- [x] **T7 — Social image resolver, fonts, and palette**
  Add `src/lib/seo/og.ts`:
  - `resolveOgImage`;
  - `OG_SIZE` and `OG_PALETTE`;
  - an FNV-1a version hash;
  - for uploads, a `@sanity/image-url` 1200×630 hotspot crop.

  Add `og.test.ts`: the upload wins; alt text falls back to "{title}, {siteName}"; the hash changes with the title. Add the Playfair Display Regular and Montserrat Alternates Medium Latin-subset TTFs and the OFL licence to `src/app/og/fonts/`. Extend `tokens.test.ts` so `OG_PALETTE` equals the light-theme `--primary` and `--primary-foreground`. Replace the T4 stub with `resolveOgImage`.
  _Covers:_ SEO-R8 · _Verify:_ `npm run test -- og tokens metadata`
  - Task log: Vitest now sets placeholder `NEXT_PUBLIC_SANITY_*` env values (`vitest.config.ts`), so modules importing `src/sanity/env` load in tests. Fonts are subset with fonttools (Latin-1 plus typographic punctuation): 80 KB in total. `cardTitle()` strips a leading or trailing "{siteName} |" from the card text and alt, so the home card doesn't repeat the name.

## Phase C — Wiring

- [x] **T8 — Layout, home metadata, JSON-LD, sitemap, robots, and `llms.txt` routes**
  - **Layout:** `(web)/layout.tsx` uses `generateMetadata()` with `getSiteSeo()` and renders `<JsonLd data={siteGraph(…)} />`.
  - **Home:** add `generateMetadata()` to `(web)/page.tsx`.
  - **Rewrites:** rewrite `src/app/sitemap.ts` and `robots.ts` as thin wrappers.
  - **New route:** add `src/app/llms.txt/route.ts`.
  - **Deletions:** delete `src/lib/site-config.ts` and `src/components/seo/structured-data.tsx`.

  Read the bundled `generate-metadata.md` (with `cacheComponents`) and `route.md` first. Confirm that the 404 page keeps `noindex`.
  _Covers:_ SEO-R1, R2, R5, R10, R14, R16, R17, R18 · _Verify:_ `npm run build`; `curl` `/`, `/sitemap.xml`, `/robots.txt`, `/llms.txt`, and `/this-does-not-exist` on `npm run start`

- [x] **T9 — Social card route**
  Add `src/app/og/[[...path]]/route.tsx`:
  - **Resolution:** the path goes through `resolvePath`; the home page uses `homeTitle`; an unknown or noindex path returns 404; query strings are ignored.
  - **Rendering:** `ImageResponse` at 1200×630 with the brand mark, title, and site name, using the T7 fonts and palette.
  - **Caching:** the immutable `Cache-Control` header from the plan.

  Delete `(web)/opengraph-image.tsx` and `twitter-image.tsx`. Read the bundled `image-response.md` and `route.md` first.
  _Covers:_ SEO-R8, R9 · _Verify:_ `npm run build`; on `npm run start`, `curl -I /og` returns `200 image/png`, `/og/nope` returns 404, and the PNG is 1200×630
  - Task log: the card reuses the exported `ARROW` and `MOUNTAIN` paths from `brand-logo.tsx`. Production `curl`: `/og` 200 `image/png` 1200×630 with the immutable `Cache-Control`; `?title=` ignored; `/og/nope` 404.

- [x] **T10 — Template config cleanup** _(lightweight model)_
  Remove these from `env.example`, the README, and any remaining code:
  - `NEXT_PUBLIC_SITE_NAME`, `_TITLE`, `_DESCRIPTION`, and `_KEYWORDS`;
  - `NEXT_PUBLIC_TWITTER_HANDLE` and `NEXT_PUBLIC_LINKEDIN_URL`.

  Set the `NEXT_PUBLIC_SITE_URL` example to `https://wyeast.studio`, with a comment, and add the `VERCEL_ENV` comment. Search the repo for "Agency Template" and `keywords`.
  _Covers:_ SEO-R1, R25 · _Verify:_ `grep -rn "Agency Template" src env.example README.md` finds nothing; `npm run typecheck && npm run build` pass with those variables unset

## Phase D — FAQ

- [x] **T11 — Rich text component** _(lightweight model)_
  Add `src/components/rich-text/rich-text.tsx`, a `PortableText` renderer that supports only paragraphs, bullet and numbered lists, `strong`, `em`, and `link` through `SiteLink`. Unknown types render nothing. Add `rich-text.test.tsx` with fixtures, including an external link `rel` and a dropped unknown mark.
  _Covers:_ SEO-R21 · _Verify:_ `npm run test -- rich-text`

- [x] **T12 — FAQ section component**
  Add `src/components/sections/faq-section.tsx`, with `faq-section.test.tsx` and fixtures:
  - **Structure:** `section[aria-labelledby]`, an outlined eyebrow badge, an `h2`, and an intro.
  - **Columns:** the items split into two DOM-ordered columns (`lg:grid-cols-2`).
  - **Items:** each is `details > summary` (`min-h-11`, no marker, `ChevronDown` that rotates with `motion-safe:`) followed by a `RichText` answer.
  - **Styling:** a `primary` surface and a focus ring visible on it. Match Figma `81:269` and `79:423` at 375 px and 1280 px.

  The tests check the heading level, the order, that items are collapsed, that answers are in the markup, and that empty `items` renders nothing.
  _Covers:_ SEO-R20, R22 · _Verify:_ `npm run test -- faq-section`
  - Task log: Figma's 80% opacity on the intro is dropped, because it would take `primary-foreground` on `primary` below 7:1 in both themes. The mobile heading uses `text-3xl` (Figma 28 px) to stay on the type scale. The decorative background pattern is left for the UX review. Summaries measure 52 px tall.

- [x] **T13 — Temporary home FAQ wiring**
  In `(web)/page.tsx`, render `FaqSection` from `getHomeFaqs()` with the Figma eyebrow, heading, and intro hard-coded, and add `<JsonLd data={faqPage(faqs)} />` only when there are FAQs. Add a comment saying 005 replaces this wiring. Check click-to-edit for a question in Presentation.
  _Covers:_ SEO-R13, R23, R24 · _Verify:_ `npm run build && npm run start`; `/` shows six questions, and its JSON-LD has six `FAQPage` entries

## Phase E — End to end

- [x] **T14 — End-to-end tests and Definition of Done**
  Add `e2e/seo.spec.ts`:
  - the head tags on `/`, and no "Agency Template";
  - the `og:image` fetch is 1200×630 PNG; `?title=` is ignored; `/og/nope` returns 404;
  - JSON-LD parses, `FAQPage` names equal the visible summaries, and the 404 page is noindex;
  - `/sitemap.xml`, `/robots.txt`, and `/llms.txt` return the right status, content type, and key lines.

  Add `e2e/faq.spec.ts`:
  - keyboard toggle;
  - summaries ≥ 44 px;
  - axe on `/` in light and dark;
  - reduced motion.

  Run `npm run check` (lint, typecheck, unit tests, build, e2e, and Lighthouse on mobile and desktop at 100). Update the task logs.
  _Covers:_ SEO-R2, R8, R9, R10, R13, R14, R16, R17, R20, R22, R23 · _Verify:_ `npm run check`
  - Task log: `PORT=3100 npm run check` passed: lint, typecheck, 212 unit tests, build, 185 e2e tests (Chromium, Firefox, WebKit, mobile Chromium), and Lighthouse 100 on `/` for mobile and desktop.

### PR #3 review follow-up (2026-11-18)

- Published-only cached fetching now supplies social card settings and document titles; page previews remain draft-aware (SEO-R9, R15).
- Missing or unavailable settings produce fallback artwork with `Cache-Control: no-store`; successful settings retain the existing immutable policy (SEO-R1, R18).
- Generated PNG dimensions and query-string handling are tested directly at `/og`, independently of uploaded metadata images; draft-cookie requests must return the same card (SEO-R8, R9).
- Seed instructions use `--missing` and Studio edits only, and warn that full-seed replacement overwrites edited FAQs as well as site settings.
- Verification: `PORT=3100 npm run check` passed lint, typecheck, 218 unit tests, build, 189 end-to-end tests across all four browser projects (including axe), and Lighthouse 100 in all four categories on mobile and desktop.

## UX review

- [ ] AI review agent: `npm run build && npm run start`, then `npm run ux:screens 003-seo-geo-aeo /`. Compare to the spec checklist and Figma `81:269` and `79:423`, and write the results to `review/findings.md`.
- [ ] Manual: keyboard and VoiceOver on the FAQ; a link-preview tool on the social card; the Schema Markup Validator and the Rich Results Test; Studio SEO warnings; Presentation click-to-edit on a question.
- [ ] Fix blocking findings
- [ ] Owner sign-off
