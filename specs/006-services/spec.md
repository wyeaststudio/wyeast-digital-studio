# 006 — Services: Spec

**Status:** Approved · **Owner:** Wy'east Digital Studio · **Design:** Use existing page-builder patterns and design tokens; no dedicated service-page Figma frames

## Summary

Create a Services overview and a consistent set of service detail pages so small businesses can understand what the studio offers and choose a relevant next step. Use the existing page-builder patterns and design tokens. 006 includes the Accessibility service detail; 010 will provide a separate audit-request page and form.

## Users and scenarios

- **Prospective client:** opens Services, compares the offerings, reads a relevant detail page, and follows a clear next step.
- **Search visitor:** lands directly on a service detail page and can understand its scope, canonical URL, and relationship to Wy'east Digital Studio.
- **Content editor:** updates the Services overview and individual service content in Sanity, previews changes, and publishes without a code release.

## Requirements (EARS)

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| SERVICES-R1 | THE SYSTEM SHALL provide a Services overview at `/services`, using the existing page-builder page type and shared site shell. | - The `page` document with slug `services` renders at `/services`.<br>- The page has exactly one `h1` and presents a useful summary and link to each in-scope service detail page.<br>- Unknown service links do not appear as dead destinations. |
| SERVICES-R2 | THE SYSTEM SHALL provide a unique published service detail page for each service approved in the final inventory, at `/services/{slug}`. | - Each service has a unique, valid slug and resolves to its own page.<br>- Unknown slugs and paths deeper than one service segment return the site's 404 with `noindex`.<br>- The initial candidate inventory, drawn from the existing navigation fixture, is accessibility, high performance, answer engine optimization, generative engine optimization, search engine optimization, and local business websites. |
| SERVICES-R3 | THE SYSTEM SHALL render service details through a consistent editor-managed structure that explains the service in plain language and provides an appropriate next step. | - Each published service has one `h1`, an introduction, scope/deliverables, a process section, optional service-specific FAQs, and a CTA.<br>- No service promises an unconfirmed price, timeline, outcome, compliance result, search ranking, or AI citation. |
| SERVICES-R4 | WHEN 009 is not available, THE SYSTEM SHALL use the approved copy-only Home booking placeholder as the service call-to-action destination; it SHALL NOT add a form, scheduler, or invented availability. WHEN 009 is available, the destination SHALL be updated to its approved booking/contact experience. | - Before 009, every service CTA has a clear label and resolves to `/#booking`.<br>- No service page contains a nonfunctional form, mock calendar, or claim that booking is available.<br>- After 009, the CTA uses its real approved behavior and fallback. |
| SERVICES-R5 | THE SYSTEM SHALL provide page-specific metadata for `/services` and each service detail page through the existing SEO system. | - Each route has a unique title, description, canonical URL, Open Graph/Twitter metadata, and the correct index/noindex behavior.<br>- Published indexable services appear in the sitemap and `llms.txt`; unpublished, missing, or noindex documents do not. |
| SERVICES-R6 | THE SYSTEM SHALL provide visible service content in structured data only when the corresponding information is visible on the page. | - Each service detail page emits one valid `Service` JSON-LD node using its visible name and description and the existing business provider identity.<br>- No invented price, rating, offer, review, or service guarantee is emitted.<br>- Breadcrumb structured data uses the existing builder; detail pages do not show a visible breadcrumb. |
| SERVICES-R7 | THE SYSTEM SHALL keep service navigation and capability links aligned with published routes. | - Every service link resolves to a published detail page and has an accessible name that identifies the service.<br>- The six Home capability cards link to their matching detail pages once those routes are published; no card links to an unimplemented path.<br>- The existing navigation labels and paths remain consistent with the final service inventory. |
| SERVICES-R8 | WHEN an editor previews or publishes a Services page or service document, THE SYSTEM SHALL preserve Visual Editing and refresh the affected routes, metadata, structured data, sitemap, and `llms.txt` through existing cache invalidation. | - Presentation opens the overview and detail pages at their public routes and supports click-to-edit for their content.<br>- A publish/unpublish updates the relevant outputs without a redeploy.<br>- Draft-only editing data is absent from public responses. |
| SERVICES-R9 | THE SYSTEM SHALL render all indexable Services content server-side and meet the constitution's accessibility, responsive-layout, performance, and SEO requirements. | - Each page has one `h1`, a logical outline, semantic landmarks, keyboard access, visible focus, and working reduced-motion behavior.<br>- Playwright/axe pass for affected routes in light and dark themes.<br>- Lighthouse meets the indexable-page budgets and Core Web Vitals thresholds in the constitution. |
| SERVICES-R10 | THE SYSTEM SHALL keep the 006 Accessibility service detail distinct from 010's accessibility audit-request workflow. | - 006 provides the Accessibility service detail page; 010 provides a separate audit-request page and form.<br>- 006 does not implement 010's form, data collection, spam protection, or privacy behavior. |

## Candidate service inventory

The existing [navigation fixture](../../sanity/seed/shell.json) contains the following labels and slugs. Treat this as the working inventory, not as final approval of service scope or copy:

| Navigation label | Candidate slug |
| --- | --- |
| Accessibility | `accessibility` |
| High Performance | `high-performance` |
| Answer Engine Optimization | `answer-engine-optimization` |
| Generative Engine Optimization | `generative-engine-optimization` |
| Search Engine Optimization | `search-engine-optimization` |
| Local Business Websites | `local-business-websites` |

## Content model (Sanity)

- **Services overview:** existing `page` document with slug `services`, composed from existing page-builder blocks.
- **Service details:** `service` document type with a unique slug, title, summary, introduction, scope/deliverables, process, optional FAQ references, and the existing SEO field group. Use one uniform structured detail template.
- **References:** overview cards and optional service-specific FAQs use existing references/content patterns; do not duplicate reusable FAQ content.
- **Calls to action:** use the Home booking placeholder until 009 supplies its real destination. No 006 form or booking implementation.

## Non-functional requirements

- The constitution applies in full. Service pages are mobile-first, token-based, server-rendered, and accessible in light and dark themes.
- No new runtime dependency or third-party origin is proposed.
- Per owner direction, interim copy may be used during implementation; final copy approval and all UX testing are deferred to 011. No production launch may use unapproved copy.
- Avoid unverified business claims and invented pricing, guarantees, or outcomes.
- The final photo, if any, must be owner-supplied and licensed; no watermarked Figma stock preview.

## UX review checklist

- [ ] Services overview and detail pages follow the existing page-builder patterns and design tokens
- [ ] 375, 768, 1280, and 1920 px in light and dark modes
- [ ] Keyboard-only walkthrough, visible focus, and working service CTAs
- [ ] Screen reader announces one `h1`, logical section headings, and meaningful service links
- [ ] 400% zoom, 320 px reflow, and reduced-motion behavior
- [ ] Metadata, `Service` JSON-LD, sitemap, and `llms.txt` represent visible published content only
- [ ] Owner approves the final service inventory and copy before launch

## Out of scope

- 009's inquiry form, booking provider, privacy notice, and booking availability.
- 010's accessibility audit-request form, its data collection, and spam/privacy infrastructure.
- New global site-shell behavior, a second Services navigation system, or unapproved third-party services.
- Final launch copy, unlicensed imagery, pricing, testimonials, or performance/compliance guarantees.

## Resolved owner decisions

- 006 includes the Accessibility service detail; 010 owns a separate audit-request page and form.
- No dedicated Services Figma frames are in scope. Use existing page-builder patterns and design tokens.
- Use one uniform structured service-detail template: introduction, scope/deliverables, process, optional service-specific FAQs, and CTA.
- Use the existing `BreadcrumbList` structured data without visible breadcrumbs.
