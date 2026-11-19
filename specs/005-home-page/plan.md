# 005 — Home page: Plan

**Status:** Approved (2026-11-19) · **Spec:** [spec.md](./spec.md)

## Approach

Use the existing `homePage` singleton, page-builder sections, route, SEO pipeline, and FAQ references delivered by 004. Do not add a separate Home template, duplicate section renderer, custom calendar, or booking implementation. A copy-only interim section can precede 009: use the existing `richTextSection` with the unique `booking` anchor and no form, scheduler, or availability. When 009 is complete, replace the placeholder with its approved section and configuration rather than reproducing Figma's illustrative calendar.

The existing Home seed contains exaggerated performance/accessibility claims, jargon, and `/contact` CTAs. Replace those with the realistic **working-draft** copy below. The owner approved this draft for interim use; do not present it as final business claims. Keep the existing gradient hero until pre-launch readiness; do not use the watermarked Figma preview or an unlicensed image. Final copy, photo license, attribution, crop, and alt/decorative treatment are pre-launch gates and do not block 005 implementation.

Preserve 004's server-rendered, TypeGen-derived section props and server-only Sanity image handling. Reuse 009's booking implementation and its accessibility, privacy, loading, unavailable, fallback, lazy-loading, and CSP behavior. If 009's integration contract requires a new page-builder block or query projection, implement only the agreed contract and regenerate TypeGen; do not guess at the shape before 009 is ready.

## Provisional copy for development and review

All wording below is approved as interim placeholder content, not as a confirmed business commitment. Before launch readiness, the owner must approve or revise the complete inventory, including referenced FAQs, metadata, destinations, and booking introduction. Avoid absolute compliance, ranking, citation, or performance promises.

| Area | Working draft |
| --- | --- |
| Hero heading | Thoughtful websites. Built to help your business grow. |
| Hero body | Bespoke websites for small businesses in Portland and the Pacific Northwest. Clear design, accessible experiences, and a fast foundation that helps people find you. |
| Hero CTA | Booking details coming soon (temporary copy-only CTA until 009 is ready) |
| Trust bar | Accessibility considered early · Performance built into the process · Clear paths to get in touch |
| Capabilities heading | A better website starts with a strong foundation. |
| Capabilities intro | Give your customers a clear path from finding your business to getting in touch. We bring design, accessibility, performance, and discoverability together. |
| CTA banner | Have a project in mind? Tell us what you want your website to do. Let's talk about your goals and the next step for your business. |
| Process | Discover and plan; Design and build; Test and refine; Launch and hand over. Descriptions focus on agreeing scope, clear content, accessibility checks, and handover without promising timelines or ongoing services. |
| Interim booking placeholder | Heading: Booking is coming soon. Body: We're preparing our scheduling details. Please check back soon for booking information. This is informational copy only, not a way to contact or schedule. |
| 009 booking introduction | Let's talk about your website. Share what you have in mind and choose a time for a discovery call. Use only after 009 supplies the real booking section and its approved behavior. |
| Home title | Accessible Web Design in Portland \| Wy'east Digital Studio |
| Home description | Bespoke websites for small businesses in Portland and the Pacific Northwest. Built with accessible design, fast performance, and clear paths to get in touch. |

Use six capability cards for accessible websites, fast-loading websites, clear answers for search tools, content AI search can understand, search-friendly foundations, and websites for local businesses. Explain each in plain language. Links are optional: include only destinations that exist and are approved; do not ship links to future 006/010 routes.

The six shared FAQ documents retain their topics but use cautious interim answers: project timing depends on scope and content readiness; proposals explain agreed scope and cost; the site uses Next.js, React, TypeScript, and Sanity; accessibility is addressed through design and testing without guaranteeing universal compliance; search foundations help tools understand content but cannot guarantee rankings or citations; handover and any support are discussed before launch. Confirm every operational claim with the owner before production launch. Keep the displayed FAQ and `FAQPage` data aligned.

## Constitution check

| Principle | How this plan complies |
| --- | --- |
| §2 Brand and mobile-first | Use the Figma frames as visual direction, existing design tokens, and mobile-first layouts; defer visual comparisons at 375, 768, 1280, and 1920 px in both themes until 011 pre-launch readiness. |
| §3.1 Presentational components | Reuse 004's typed, presentational section components. Data loading stays in the existing route/loaders; no new client component is planned. |
| §4 Content model | Keep the Home singleton and reusable sections. Reuse the six FAQ references; do not create inline duplicate FAQ content or a second Home document. Apply only targeted changes to Home-related content and settings. |
| §5 Accessibility | Preserve one `h1`, heading order, semantic sections, 44 px link targets, keyboard access, visible focus, and reduced-motion behavior. Defer axe and manual keyboard, VoiceOver, 400% zoom, and 320 px reflow checks until 011 pre-launch readiness. |
| §6 Performance | Retain the current prioritized, dimensionally stable hero image path. Keep booking resources lazy per 009. Verify Home's four Lighthouse categories and the LCP/CLS thresholds with final content and image. |
| §7 SEO/GEO/AEO | Use the existing metadata and JSON-LD pipeline. Update only Home's title/description and approved Home social-image setting; preserve canonical, indexing, and published-content behavior. |
| §8 Security and privacy | Reuse 009's privacy and CSP decisions. No new third-party origin, tracking, or data collection is introduced by this plan. |
| §9 Definition of Done | Run focused functional regression checks during implementation. The owner deferred final axe/Lighthouse, manual UX checks, visual review, and feature sign-off until pre-launch readiness with final content and photo. |

## Sanity content and schema

- **Home singleton:** update its existing ordered `sections` and `seo.description`/optional social image only as approved. Do not create another Home document.
- **Sections:** retain the hero, trust bar, feature grid, CTA banner, process, and FAQ blocks in order. Until 009 is ready, append an existing `richTextSection` after FAQ with `anchor: "booking"` and copy stating scheduling is coming soon. This reuses the existing schema, renderer, and section styles. Replace that block with 009's booking section after its contract is delivered; do not add a temporary schema type.
- **FAQ documents:** update only the six referenced FAQ records in `sanity/seed/seo.json` and the corresponding intended CMS records. The demo also references two of them; verify the shared-content effect and do not duplicate the answers.
- **Site settings:** `homeTitle` is the Home title source in the existing metadata flow. Set only that field to the approved interim title. Do not rewrite `defaultDescription`, `businessDescription`, contact details, social links, or the full singleton as a side effect.
- **Hero image:** retain the gradient fixture until an owner-supplied/licensed asset is approved before launch. Record its source, permission, attribution obligations, hotspot/crop, and alt text or decorative designation. Never store purchase credentials.
- **Seed safety:** `sanity/seed/pages.json` and `sanity/seed/seo.json` are fixtures, not a license to replace live documents. Preserve the existing non-destructive `--missing` setup behavior; update live content through targeted edits/patches and verify reruns do not overwrite editor changes or duplicate assets/sections.
- Use generated `HOME_PAGE_QUERY_RESULT` and existing generated section types. No hand-written content types are permitted.

## GROQ queries

Reuse `HOME_PAGE_QUERY`, `SECTIONS_PROJECTION`, and `FAQ_PROJECTION` in `src/sanity/queries.ts`. Add or modify a projection only if 009's approved booking integration requires it. If the schema/query changes, run TypeGen and use its generated result types; do not hand-author a parallel query type.

## Routes and components

| File | Server/Client | Purpose |
| --- | --- | --- |
| `src/app/(web)/page.tsx` | Server | Continue rendering the Home singleton, metadata, sections, and FAQPage through existing helpers. Change only if required to connect 009's agreed section. |
| `src/components/sections/page-sections.tsx` | Server | Keep the shared block renderer; register an agreed 009 block only if 009 provides it through the page builder. |
| `src/components/sections/*` | Server | Reuse existing section components and 009's booking component; no duplicate Home-only blocks. |
| `src/sanity/queries.ts` | Server | Extend the existing projection only for fields required by the approved 009 integration. |
| `sanity/seed/pages.json` | Fixture | Keep realistic provisional Home content, the temporary gradient, and the copy-only `booking` section reproducible. |
| `sanity/seed/seo.json` | Fixture | Hold provisional FAQ and Home-related SEO values without changing unrelated global business defaults. |
| `e2e/home.spec.ts`, `e2e/faq.spec.ts`, `e2e/seo.spec.ts`, `e2e/pages.spec.ts` | Tests | Extend existing Home, FAQ, metadata, section, CTA, and booking coverage as needed. |
| `specs/004-page-builder/plan.md`, `README.md` | Documentation | Reconcile stale statements that defer Home content/photo replacement to 011 once the 005/011 ownership decision is confirmed. |

No separate route or new Home template is planned.

## Dependencies

None planned. Use the existing Sanity, Next.js, Playwright, Vitest, axe, and Lighthouse tooling. Any new runtime package requires a justified plan update and owner approval.

## Environment variables

None planned. 009 owns any booking configuration and third-party origin requirements.

## Testing strategy

Tests reference the requirement IDs they verify.

- **Interim implementation checks:** parse both seed files; verify the seven section types/order, one unique `booking` anchor, six referenced FAQ IDs, six capability cards, four process steps, and the two `/#booking` targets. Run lint, typecheck, and Vitest. These checks do not substitute for browser or UX acceptance.
- **Browser and functional regression:** defer Playwright checks for section rendering/order, CTA navigation, FAQ/FAQPage parity, metadata, Visual Editing/publish refresh, and safe CMS updates until 011 (`HOME-R1`, `R4`–`R9`, `R11`). The actual 009 booking states are tested only after its integration is available (`HOME-R7`).
- **Pre-launch accessibility and UX:** defer axe in both themes, keyboard/VoiceOver/reduced-motion/zoom/reflow checks, Figma screenshot review, and owner UX sign-off until 011, with the approved copy and licensed photo (`HOME-R3`, `R10`).
- **Pre-launch performance:** defer final-image contrast, mobile/desktop Lighthouse, LCP ≤ 2.5 s (target 2.0 s), and CLS ≤ 0.1 verification until 011 (`HOME-R3`, `R7`, `R10`).
- **Final gate:** run focused functional checks during implementation. Before launch readiness, run `npm run check`, complete the deferred UX review, and verify no interim placeholder, gradient, or sample testimonial remains on Home (`HOME-R2`, `R3`, `R10`).

## Risks and decisions to carry into task execution

- **009 integration contract:** the actual section type, configuration, fallback, privacy, and load behavior must come from 009. The temporary rich-text placeholder has no contact or booking behavior and is replaced when 009 is complete.
- **004 and 011 scope:** 005 owns interim Home copy, referenced FAQ answers, and the Home title/description. 011 owns final copy/photo approval and replacement, global business details, other pages' placeholders, and the site-wide audit.
- **Copy is provisional:** the owner approved the draft for interim use. Final claims, FAQs, title/description, CTA labels, and destinations require pre-launch approval.
- **Photo is pending:** no licensed photo is selected. The gradient remains a temporary fixture until a permitted asset and its treatment are approved before launch.
- **UX review is deferred:** no feature-level UX testing or final performance/accessibility audit is due before the 011 pre-launch readiness stage.
- **Shared FAQ references:** FAQ updates may change the page-builder demo. Test that effect and avoid full-document replacement.
- **Future links:** omit optional capability links until their routes exist; do not create placeholder routes or suppress 404s.
