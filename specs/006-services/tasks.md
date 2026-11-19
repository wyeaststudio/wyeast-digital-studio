# 006 — Services: Tasks

**Status:** Approved · **Plan:** [plan.md](./plan.md)

Implementation is approved to proceed one task at a time. Do not mark a task complete until its Definition of Done passes.

## Phase A — Content model and routes

- [ ] **T1 — Add the service document schema and validation** · _Covers:_ SERVICES-R2, SERVICES-R3 · _Blocked by:_ none · _Verify:_ one `service` document type has the approved uniform fields, one-segment unique slugs, helpful Studio validation, and no duplicate page/SEO model.
- [ ] **T2 — Add service queries, loader, and generated types** · _Covers:_ SERVICES-R2, SERVICES-R5, SERVICES-R8 · _Blocked by:_ T1 · _Verify:_ typed queries return published services and slugs; missing or failed fetches use repository-standard behavior; cache tags cover service documents and the service collection.
- [ ] **T3 — Register and serve nested service routes** · _Covers:_ SERVICES-R2, SERVICES-R5, SERVICES-R8 · _Blocked by:_ T2 · _Verify:_ `/services/{slug}` resolves to the `service` type; `/services` remains the page-builder overview; unknown and over-nested paths return 404/noindex; build output remains valid with Cache Components.
- [ ] **T4 — Build the consistent service detail renderer** · _Covers:_ SERVICES-R3, SERVICES-R4, SERVICES-R9 · _Blocked by:_ T1 and T3 · _Verify:_ each service renders an introduction, scope/deliverables, process, optional service-specific FAQs, and CTA in order, with exactly one `h1`, semantic sections, and no unconfirmed claims or form behavior.

## Phase B — Overview, discovery, and SEO

- [ ] **T5 — Add the Services overview page and service fixtures** · _Covers:_ SERVICES-R1, SERVICES-R2, SERVICES-R7 · _Blocked by:_ T1 and T4 · _Verify:_ `/services` uses the page builder and links to every published in-scope service with a meaningful accessible name; any interim copy is clearly provisional.
- [ ] **T6 — Add service metadata and structured data** · _Covers:_ SERVICES-R5, SERVICES-R6 · _Blocked by:_ T2, T3, T4 · _Verify:_ canonical/social metadata, sitemap/`llms.txt`, `Service` JSON-LD, and breadcrumb data match published visible content; no invented commercial properties are emitted.
- [ ] **T7 — Connect navigation and Home capability links** · _Covers:_ SERVICES-R4, SERVICES-R7 · _Blocked by:_ T3, T5 · _Verify:_ existing navigation paths and Home capability links resolve to the approved service inventory; unavailable 009 behavior uses only the Home placeholder.

## Phase C — Validation and readiness

- [ ] **T8 — Verify service fixtures and non-UX regressions** · _Covers:_ SERVICES-R1–R8 · _Blocked by:_ T1–T7 · _Verify:_ focused Vitest for schema helpers, route/metadata/structured-data builders, fixture shapes, lint, typecheck, and build pass. Do not run browser, axe, Lighthouse, visual, or manual UX checks before 011.
- [ ] **T9 — Complete deferred UX and launch-readiness review** · _Covers:_ SERVICES-R1–R10 · _Blocked by:_ T8 and final content/design approval · _Verify in 011:_ Playwright, axe in both themes, Lighthouse budgets, manual keyboard/screen-reader/zoom/reflow checks, design-system comparison, fix blockers, and obtain owner sign-off before marking 006 Done.

## UX review

- [ ] Capture screenshots at 375, 768, 1280, and 1920 px in light and dark modes and review against the existing design system.
- [ ] Fix blocking findings and record them in `review/findings.md`.
- [ ] Obtain owner sign-off before marking 006 Done.
