# 006 — Services: Plan

**Status:** Approved · **Spec:** [spec.md](./spec.md)

## Approach

Use the existing page-builder `page` document for the `/services` overview and the already-planned `service` route type for nested detail URLs. The 004 plan explicitly deferred nested paths until 006 and the SEO route helpers already cover `service: '/services/'`. Use one uniform service document and detail renderer; do not create six bespoke routes or duplicate the page-builder renderer.

The working detail route is `src/app/(web)/services/[slug]/page.tsx`; `/services` remains a top-level page-builder document served by the existing `[slug]` route. `generateStaticParams` and asynchronous `params` behavior must follow the installed Next.js 16 documentation, not older routing examples. The project enables Cache Components, so dynamic route generation must preserve its non-empty-params build requirement and its existing missing-document/404 behavior.

Docs consulted: [Layouts and Pages](../../node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md), [page.js](../../node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md), [generateStaticParams](../../node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-static-params.md), and [Migrating to Cache Components](../../node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md). Sanity client mutations are not planned.

## Confirmed decisions and remaining launch gates

- **Confirmed by owner:** 006 includes the Accessibility service detail and 010 owns a separate audit-request page/form; use existing page-builder patterns and design tokens without dedicated Services Figma frames; use a uniform structured detail template with an introduction, scope/deliverables, process, optional service-specific FAQs, and CTA; use structured breadcrumbs without visible breadcrumb UI.
- **Confirmed by existing project decisions:** Services overview is a page-builder page; service detail routes are nested under `/services/`; the route registry maps a `service` document to `/services/`; all public content uses the shared shell and SEO pipeline.
- The six service slugs in the existing navigation fixture remain the working inventory. Final inventory and copy approval remain launch gates.

Final copy approval and all UX testing are deferred to 011 by owner direction; this feature may be implemented with clearly provisional content and remains not Done until the deferred launch gates pass.

## Constitution check

| Principle | How this plan complies |
| --- | --- |
| §2 Brand and mobile-first | Use the existing page-builder patterns and design tokens, with mobile-first section patterns. There are no dedicated Services Figma frames in scope. |
| §3 Technology | Use the installed Next.js 16, Sanity v6, TypeScript, and existing dependencies. Read the relevant bundled docs before implementation. |
| §3.1 Presentational components | Keep detail rendering presentational and derive props from TypeGen query results; data loading and route decisions remain in server-side loaders/routes. |
| §4 Content model | Use the page builder for `/services` and one reusable `service` collection type with the approved uniform structured template. Keep SEO fields, slugs, and editor preview in Sanity. |
| §5 Accessibility | One `h1`, semantic headings/links, keyboard operability, focus visibility, target sizing, reduced motion, and axe checks in both themes. |
| §6 Performance | Server-render service content and structured data, use the existing Sanity cache/tag patterns, and meet the indexable-route Lighthouse and Core Web Vitals gates. |
| §7 SEO/GEO/AEO | Register `service` once in the route registry; generate canonical metadata, sitemap/`llms.txt` records, `Service` JSON-LD, and breadcrumb structured data from published visible content. |
| §8 Security and privacy | No forms or new origins. 009/010 retain ownership of booking, contact data, privacy, spam protection, and related CSP changes. |
| §9 Definition of Done | Run non-UX checks during implementation. Per owner direction, defer all browser/UX tests, axe, Lighthouse, visual/manual review, final copy approval, and owner sign-off to 011. No production code is written before the tasks are Approved. |

## Approved Sanity schema

T1 implements the approved `service` document fields:

- `title` and unique one-segment `slug`;
- short summary for overview cards and metadata;
- introduction, scope/deliverables, process, optional service-specific FAQ references, and CTA;
- the existing `seo` object;

The Services overview remains a `page` with slug `services`. Avoid duplicating `page` fields or creating a second SEO model.

## GROQ queries

- Add a typed query for one published service by slug and a query for published service slugs, following `PAGE_QUERY` and `PAGE_SLUGS_QUERY`.
- Project only the fields required by the uniform detail template.
- Reuse the existing FAQ projection and references when a service has FAQs.
- Add service queries in `src/sanity/queries.ts`; run TypeGen after schema/query changes.

## Routes, metadata, and structured data

- Add `service: '/services/'` to `src/lib/seo/routes.ts`; preserve `page: '/'`, so the `/services` overview resolves as the page slug `services` and `/services/{slug}` resolves as a `service`.
- Add a server route at `src/app/(web)/services/[slug]/page.tsx` with metadata, published content loading, and `notFound()` for unknown slugs.
- Add service slugs to `generateStaticParams`; retain a safe placeholder path only if required for fresh-dataset builds under Cache Components.
- Extend the existing registry-backed metadata, sitemap, `llms.txt`, and OG flows rather than adding parallel systems.
- Add a typed `Service` JSON-LD builder using visible service data and the existing ProfessionalService provider identity. Do not emit unapproved offers, prices, ratings, or reviews.
- Use the existing `BreadcrumbList` builder; do not add visible breadcrumb UI.

## Seed and content updates

- Add non-destructive `service` fixtures for the working inventory and a `/services` overview page fixture.
- Keep interim copy explicitly provisional; remove unsupported guarantees and speculative claims.
- Update Home capability-card links only after each destination exists. Preserve the existing nav labels/slugs unless the owner approves a revised inventory.
- Do not use full-document `--replace` for existing editor content. Any existing-dataset changes must be field-scoped and preserve unrelated editor fields.

## Dependencies

None planned. Any runtime dependency requires a justified plan update and owner approval.

## Environment variables

None planned. 009 and 010 own form and booking configuration.

## Testing strategy

Tests reference `SERVICES-R*` IDs.

- **Vitest:** slug validation, route resolution for `/services` and `/services/{slug}`, service loader/error/cache tags, metadata and `Service` JSON-LD, breadcrumbs, and fixtures for the uniform detail renderer.
- **Interim implementation checks:** validate service schema/query types, route and metadata helpers with Vitest, fixture/document shape, and build behavior. Run lint, typecheck, and Vitest. These checks do not substitute for browser or UX acceptance.
- **Browser and functional regression:** defer Playwright checks for route rendering, links, metadata, structured data, Visual Editing/publish refresh, and safe CMS updates until 011 (`SERVICES-R1`–`R10`).
- **Pre-launch accessibility and UX:** defer axe in both themes, keyboard/VoiceOver/reduced-motion/zoom/reflow checks, design-system screenshot review, Lighthouse, and owner UX sign-off until 011, with approved final content (`SERVICES-R3`, `R9`).

## Risks and alternatives considered

- **One-off page for every service:** rejected in the draft plan because it duplicates route and rendering logic; reconsider only if the owner requires materially different layouts.
- **Service pages as root `page` documents:** rejected because 004 explicitly deferred nested routes and the SEO registry already anticipates a `service` type.
- **Accessibility detail versus 010 audit request:** 006 owns the service detail and 010 owns a separate request page/form; keep form, privacy, and spam-protection behavior in 010.
- **Service copy and visuals:** use provisional copy and existing design patterns during implementation; final copy approval and all UX testing remain deferred to 011.
