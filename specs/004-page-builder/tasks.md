# 004 — Page builder: Tasks

**Status:** Approved (2026-11-18) · **Plan:** [plan.md](./plan.md)

Run the tasks in order. Each is small and independently verifiable, and each lists the requirements it covers and how to verify it. While working, run only the task's own check. Run the full Definition of Done (constitution §9) once, in T15. Tasks marked _(lightweight model)_ are routine generation that can go to a cheaper model (constitution §10).

## Phase A — Content

- [x] **T1 — Validation helpers** _(lightweight model)_
  Extend `src/sanity/validation.ts` and `validation.test.ts` with:
  - `RESERVED_SLUGS` (with a comment) and `isValidPageSlug` (lowercase letters, digits, single hyphens; 1–60 characters; not reserved);
  - `isValidAnchor` (lowercase, digits, hyphens; max 40);
  - `pageSectionsRule` (a hero only first and only once; unique anchors), returning `true` or a message;
  - `altOrDecorative` (alt text required unless `decorative` is on).

  _Covers:_ PB-R1, R2, R9, R11, R13 · _Verify:_ `npm run test -- validation`
  - Task log (2026-11-18): added the reserved-path list, slug and anchor validators, hero-position and unique-anchor rules, and alt-text/decorative-image validation. Optional unset values are left to schema-required rules. All 89 validation tests pass, including length boundaries, malformed paths, repeated heroes/anchors, and whitespace-only alt text.
  - Definition of Done: `PORT=3100 npm run check` passed lint, typecheck, 282 unit tests, build, 189 end-to-end tests across all four browser projects (including axe), and Lighthouse 100 in all four categories on mobile and desktop. No page rendering or schema wiring changes in T1.

- [x] **T2 — Schema types and Studio structure** _(lightweight model)_
  Following the plan's schema section, add:
  - `src/sanity/schemas/icon-names.ts` (`ICON_NAMES`) and an `iconName` string type;
  - `objects/define-block.ts` (`defineBlock` adds `anchor` and `surface`);
  - the block types: `heroSection`, `trustBarSection`, `featureGridSection`, `ctaBannerSection`, `processStepsSection`, `richTextSection` (with `richTextBody`), and `testimonialsSection`; re-declare the 003 `faqSection` through `defineBlock`;
  - `objects/page-sections.ts` (the array type with `pageSectionsRule`, max 20);
  - `documents/page.ts` (replaces the placeholder), `documents/testimonial.ts`, and `singletons/home-page.ts` (added to `SINGLETON_TYPES`).

  Register everything in `schemas/index.ts`. Add "Pages" and "Testimonials" to `structure.ts` after "FAQs", and list "Home page" with the singletons. Give each block a preview (type label plus heading).
  _Covers:_ PB-R1, R4, R10, R11, R12, R21 · _Verify:_ `npx sanity schema validate && npm run typecheck`
  - Task log (2026-11-18): registered all eight blocks, shared anchors/surfaces, curated icons, accessible image fields, Home singleton, Page, and Testimonial; updated the Studio structure without duplicate lists. Schema validation reports zero errors and warnings; typecheck passes.
  - Validation regression: field-level Home array rules initially replaced the inherited hero/anchor validator. Home now explicitly composes it, while Page inherits the shared array rules. Eight compiled-schema tests cover valid sections, repeated/misplaced heroes, and duplicate anchors for both document types. CLI validation rejects all four negative fixtures (duplicate hero, duplicate anchor, unknown icon, and missing permission).

- [x] **T3 — Queries, TypeGen, loaders, and registry**
  Add `SECTIONS_PROJECTION`, `HOME_PAGE_QUERY`, `PAGE_QUERY`, and `PAGE_SLUGS_QUERY` to `queries.ts`. Move the `fetch.test.ts` type check from `PAGES_QUERY` to `PAGE_SLUGS_QUERY` and delete `PAGES_QUERY`. Run `npm run typegen` and confirm the sections type is a discriminated union on `_type`; if not, use the plan's fallback and record it in the plan.

  Add `src/sanity/loaders/pages.ts` (`getHomePage`, `getPage`, `getPageSlugs`) with the plan's cache tags and `pages.test.ts`. Add `page: '/'` to `ROUTES`, update the `routes.ts` comment and `routes.test.ts` examples from `landingPage` to `page`.
  _Covers:_ PB-R5, R6, R21 · _Verify:_ `npm run typegen && npm run typecheck && npm run test -- pages routes fetch`
  - Task log (2026-11-18): added the shared sections projection, three queries, draft-preserving loaders with reference cache tags and logged failures, and the Page route registration. TypeGen generates eight queries and 37 schema types, including matching eight-block discriminated unions; no projection fallback is needed. The SEO loader now uses generated routable-document types, with nullable slugs handled by dependent builders.
  - Verification: TypeGen and typecheck pass; 171 affected tests across 13 files pass. In-memory evaluation of both content queries confirms denied, unconfirmed, and broken testimonial references cannot render; loader tests cover cache tags, slug parameters, stega preservation, and failures.

- [x] **T4 — Seed content and README** _(lightweight model)_
  Generate `sanity/seed/hero-placeholder.jpg` (2400×1350, a soft gradient in the brand palette, under 150 KB) and add `scripts/seed-hero-image.ts` (uploads it with `client.assets.upload` and patches `homePage` and the demo page hero). Create `sanity/seed/pages.json`:
  - `homePage` with the Figma Home sections and copy (hero, trust bar, feature grid, CTA banner, process steps, FAQ referencing the six 003 FAQs);
  - the `page-builder-demo` page (`seo.noindex: true`) with all eight blocks on varied surfaces, two anchors, and a rich text section with `h3`, lists, and a link;
  - one `testimonial` ("Placeholder:" copy, `permission: true`).

  Apply with `npx sanity documents create sanity/seed/pages.json --missing`, then run the image script. Add the steps to the README's Sanity setup section, and note the placeholder hero image and testimonial are replaced in 011.
  _Covers:_ PB-R22, R23 · _Verify:_ `npx sanity documents query '*[_id in ["homePage"] || _type == "page"]{_id, "n": count(sections)}'` lists the home and demo pages with their section counts
  - Task log (2026-11-18): seeded the Figma Home copy and six sections, the noindex eight-block demo (two anchors and varied surfaces), and a clearly marked example testimonial. The decorative brand-gradient JPEG is 2400×1350 and 32,349 bytes. README documents safe setup, future service links, and replacement of placeholders in 011.
  - Live verification: `--missing` created the three documents; the image script set both hero assets. Its second run performed no upload or mutation. Published Home and demo section counts are six and eight, demo noindex is true, and all three exported documents validate with zero errors and warnings.
  - Phase A regression gate: `PORT=3100 npm run check` passed lint, typecheck, 301 unit tests, production build, and 189 end-to-end tests across four browser projects (23 existing conditional skips), including axe in both themes. Lighthouse scored 100 in all four categories on mobile and desktop. Phase A is complete; section components, route rendering, and feature-level UX review remain in later phases.

## Phase B — Components (presentational, with fixtures)

- [x] **T5 — Section shell, icons, and image helper**
  Add:
  - `src/lib/sanity-image.ts` (`urlForImage`, `sanityImageLoader` for `next/image` with hotspot crop and `auto=format`); switch `og.ts` to use `urlForImage`;
  - `src/components/sections/section.tsx` (landmark, `aria-labelledby`, anchor `id`, surface classes, padding and max width, optional `data-sanity`);
  - `page-header.tsx` (the fallback `h1`);
  - `icons.tsx` (`ICONS` keyed by `ICON_NAMES`, `Icon` returns `null` for an unknown name, always `aria-hidden`).

  Extend `tokens.test.ts` so the focus ring (`primary-foreground` on `primary`, `ring` on `card`) is at least 3:1 on every surface. Add tests for `Section`, `Icon`, and the loader URL.
  _Covers:_ PB-R8, R10, R11, R12 · _Verify:_ `npm run test -- section icons sanity-image og tokens`
  - Task log (2026-11-18): added the typed surface/landmark shell, fallback page heading, curated decorative icons, and shared image builder/loader; OG output is unchanged. The loader preserves editor crop/hotspot rectangles and aspect ratios across responsive widths. All 93 selected tests and typecheck pass, including focus contrast on every surface in both themes.

- [x] **T6 — Hero block**
  Add `hero-section.tsx` and its test: `getImageProps` from `next/image` with `fill`, explicit responsive preload, `fetchPriority="high"`, `sizes="100vw"`, the Sanity loader, an LQIP CSS background, and `alt` (empty when decorative); the gradient scrim; the optional `BrandLockup`; the `h1`; and up to two CTAs with `buttonVariants`. This server-only image approach was approved by the owner on 2026-11-18; see the plan. Match Figma `35:256` and `45:4` at 375 and 1280 px. Read the bundled `image.md` first.
  _Covers:_ PB-R9, R13 · _Verify:_ `npm run test -- hero-section`
  - Task log (2026-11-18): implemented the hero from the desktop/mobile Figma context, reusing BrandLockup and button variants. Server-only art-directed image source sets preserve hotspot crops, with explicit media-specific preload, high priority, reserved layout space, and an LQIP background. Three fixture tests and typecheck pass. Figma's stock preview remains replaced by the approved gradient; final rendered-page comparison follows route wiring and UX review.

- [x] **T7 — Trust bar, CTA banner, and process steps** _(lightweight model)_
  Add `trust-bar-section.tsx` (a list; dividers from `lg`), `cta-banner-section.tsx` (rounded panel, `h2`, one button), and `process-steps-section.tsx` (`ol`, "Step 01" labels, `aria-hidden` arrows; a row from `lg`), each with fixture tests. Match Figma `47:3`, `61:256` (panel), and `66:253`.
  _Covers:_ PB-R14, R16, R17 · _Verify:_ `npm run test -- trust-bar cta-banner process-steps`
  - Task log (2026-11-18): added the stacked/desktop-row trust list, rounded CTA panel, and ordered process cards with automatic step labels and decorative arrows. Reused the surface shell, icons, link/button primitives and a shared heading layout. All four fixture tests and typecheck pass.

- [x] **T8 — Feature grid** _(lightweight model)_
  Add `feature-grid-section.tsx` and its test: an optional eyebrow badge, `h2`, intro, and a 1/2/3-column grid of cards (icon tile, badge, `h3`, description, optional link with an `ArrowUpRight` icon). The link's accessible name includes the card title (a visually hidden suffix), and its target is at least 44 px tall. Match Figma `61:256`.
  _Covers:_ PB-R15 · _Verify:_ `npm run test -- feature-grid`
  - Task log (2026-11-18): added responsive 1/2/3-column cards from the Figma context, optional eyebrow/badges, decorative icons, and links named with their card titles. Links reserve a 44px minimum height. Both fixture tests and typecheck pass.

- [x] **T9 — Rich text and testimonials** _(lightweight model)_
  Give `RichText` a `variant` prop: `faq` (003, unchanged) and `prose` (adds `h3` and `h4`). Add `rich-text-section.tsx` (optional `h2`, prose at about 65 characters wide) and `testimonials-section.tsx` (`figure` > `blockquote` + `figcaption`, optional photo through `getImageProps` with the Sanity loader per the approved server-only adjustment, a 1/2/3-column grid of cards), each with fixture tests.
  _Covers:_ PB-R19, R20 · _Verify:_ `npm run test -- rich-text testimonials`
  - Task log (2026-11-18): added the prose variant, readable-width section and semantic testimonial cards with optional lazy square photos using server-only image props. Portable Text's default heading renderers required an explicit block renderer to keep FAQ content paragraph-only and restrict prose to h3/h4. All 15 selected tests and typecheck pass.

- [x] **T10 — Page sections renderer and FAQ block**
  Adapt `faq-section.tsx` to render inside `Section` (surface and anchor props; keep its 003 tests passing). Add `faqPageForSections(sections)` to `json-ld.ts` (collects the FAQ items from every FAQ section, in order) with tests. Add `page-sections.tsx` and its test:
  - maps `_type` to block and passes `data-sanity` attributes for each array item (`createDataAttribute`);
  - skips unknown and incomplete sections;
  - renders `PageHeader` with the page title when the first section isn't a hero;
  - keeps order and heading levels.

  _Covers:_ PB-R7, R8, R9, R18 · _Verify:_ `npm run test -- page-sections faq-section json-ld`
  - Task log (2026-11-18): all eight blocks render through the shared shell with keyed Visual Editing attributes. Incomplete/unknown/misplaced blocks are skipped with a warning; a missing or invalid first hero gets the page-title h1. FAQ surfaces and anchors preserve the 003 disclosures; shared filtering keeps visible questions and the combined FAQPage JSON-LD aligned.
  - Phase B verification: lint, typecheck, 145 focused tests across 19 files, and production build pass. All 24 existing FAQ browser tests pass across Chromium, Firefox, WebKit and mobile Chromium, including axe in both themes. Isolated Home/demo fixtures using production CSS/fonts pass axe in light/dark at 320, 375 and 1280px (12 cases), with one h1, no horizontal overflow, loaded hero images, and 44px feature links. Screenshots were inspected at mobile/desktop sizes. Browser checks caught a dark CTA-button contrast issue; merging button variants with `cn` and using an opaque token background fixed it. Public route wiring, route-level performance/CLS, Presentation checks and formal UX review remain in later phases.

## Phase C — Wiring

- [x] **T11 — Home and page routes**
  Rewrite `(web)/page.tsx`: `generateMetadata` with the Home page SEO, `PageSections` from `getHomePage()`, and `FAQPage` JSON-LD from `faqPageForSections`; remove the temporary home content and the 003 FAQ wiring. Add `(web)/[slug]/page.tsx` with `generateStaticParams` (a `__placeholder__` param when empty), `notFound()` for unknown slugs, `generateMetadata`, `PageSections`, and `FAQPage` JSON-LD. Read the bundled `generate-static-params.md`, `dynamic-routes.md`, and `not-found.md` first.
  _Covers:_ PB-R2, R3, R4, R5, R6, R18 · _Verify:_ `rm -rf .next/cache && npm run build` lists `/[slug]` as prerendered; on `npm run start`, `curl` `/`, `/page-builder-demo`, `/no-such-page`, and `/sitemap.xml`
  - Task log (2026-11-18): replaced temporary Home content with the singleton's sections and aggregated FAQPage; added the single-segment Page route, metadata, missing-document handling, and empty-dataset build placeholder. Home keeps the site-settings title while accepting Home SEO overrides. Six route regression tests and the production build pass; build output includes prerendered `/page-builder-demo`. Production HTTP checks return 200 for Home/demo/sitemap and 404/noindex for an unknown slug; both pages have one h1 and one FAQPage, and the noindex demo is absent from the sitemap. The build succeeded without clearing its cache.

- [x] **T12 — Presentation and Visual Editing**
  Add `resolve.mainDocuments` and `resolve.locations` to `presentationTool` in `sanity.config.ts` (`homePage` → `/`, `page` → `/{slug}`). Confirm in Presentation that clicking a block heading focuses its field and that dragging a section reorders it; if reordering doesn't work without optimistic state, add the draft-mode-only client wrapper described in the plan's risks. Extend `draft-mode.spec.ts` so draft mode renders the demo page.
  _Covers:_ PB-R7 · _Verify:_ `npm run test:e2e -- draft-mode`; manual check in Presentation
  - Task log (2026-11-18): configured current Sanity `defineDocuments` and `defineLocations` resolvers for Home and single-segment Pages, with no location for an unslugged document. All 20 draft-mode browser checks pass across four projects, including demo HTML, keyed section edit attributes, Visual Editing, and exit behavior; typecheck/build pass. Studio was opened on the existing CORS-approved `http://localhost:3333` origin (3100 is not approved). Authentication is required; the owner explicitly deferred authenticated document navigation, click-to-edit and drag-to-reorder checks. Those manual checks remain unchecked in the UX review below; no optimistic client wrapper was added without evidence it is needed. A pre-existing CSP warning blocks Sanity's optional `core.sanity-cdn.com/bridge.js`; CSP was not broadened.

- [x] **T13 — Update the 003 end-to-end tests**
  `faq.spec.ts` and `seo.spec.ts` target the FAQ on `/`. Point them at the seeded home FAQ section (now rendered through `PageSections`) and keep their assertions. Add the demo page to the `FAQPage` check.
  _Covers:_ PB-R18, SEO-R13 · _Verify:_ `npm run test:e2e -- faq seo`
  - Task log (2026-11-18): Home FAQ tests now target the keyed builder section; structured-data checks verify exactly one FAQPage with questions matching rendered disclosures on both Home and demo. Home, theme and shell regressions now target the real hero CTA instead of the removed temporary Studio link. Across four browser projects, 165 affected FAQ/SEO/Home/shell/theme tests pass (23 existing conditional skips), including axe in both themes; the 20 draft-mode checks also pass. Lint, typecheck, 63 focused unit tests across eight files, the production build and `git diff --check` pass. Phase C implementation is complete; authenticated Presentation checks are explicitly owner-deferred, and Phase D/full Lighthouse gate and feature UX review remain pending.

## Phase D — End to end

- [ ] **T14 — Page builder end-to-end tests**
  Add `e2e/pages.spec.ts`:
  - `/` and the demo page: sections render in order; one `h1`; no skipped heading levels;
  - the demo page: its own `<title>`, canonical, and `og:image`; absent from `/sitemap.xml`; the anchor link scrolls to its section;
  - `/no-such-page`: 404 and noindex;
  - the hero causes no layout shift (CLS via `PerformanceObserver`);
  - feature-grid link targets are at least 44 px tall;
  - axe on `/` and the demo page in light and dark.

  Add the demo page URL to `lighthouserc.json` and `lighthouserc.desktop.json`.
  _Covers:_ PB-R2–R5, R9, R10, R11, R13, R15, R23 · _Verify:_ `npm run test:e2e -- pages`

- [ ] **T15 — Definition of Done**
  Run `npm run check` (lint, typecheck, unit tests, build, e2e, and Lighthouse on mobile and desktop at 100 for `/` and the demo page). Update the task logs and the roadmap.
  _Covers:_ all · _Verify:_ `npm run check`

## UX review

- [ ] AI review agent: `npm run build && npm run start`, then `npm run ux:screens 004-page-builder / /page-builder-demo`. Compare to the spec checklist and the Figma Home frames, and write the results to `review/findings.md`.
- [ ] Manual: keyboard and VoiceOver on `/` and the demo page; zoom to 400 % and a 320 px viewport; Studio page creation and validation; Presentation click-to-edit and reordering.
- [ ] Review the rich text and testimonial blocks (no Figma design)
- [ ] Fix blocking findings
- [ ] Owner sign-off
