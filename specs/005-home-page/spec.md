# 005 -- Home page: Spec

**Status:** Approved (2026-11-19) | **Owner:** Wy'east Digital Studio | **Figma:** [Mobile light](https://www.figma.com/design/uLqdLLfDDSL83X11ea41Wt/Wy-east-Digital-Studio?node-id=10-10), [Mobile dark](https://www.figma.com/design/uLqdLLfDDSL83X11ea41Wt/Wy-east-Digital-Studio?node-id=10-11), [Desktop light](https://www.figma.com/design/uLqdLLfDDSL83X11ea41Wt/Wy-east-Digital-Studio?node-id=10-13), [Desktop dark](https://www.figma.com/design/uLqdLLfDDSL83X11ea41Wt/Wy-east-Digital-Studio?node-id=10-12)

## Summary

Turn the seeded Home page into the studio's introduction and lead-generation page using realistic interim copy, the existing gradient, and a copy-only booking placeholder while implementation proceeds. Before launch, replace them with owner-approved copy, an owner-supplied licensed hero photo, and the real booking section from 009. Small-business visitors in Portland and the Pacific Northwest should understand what the studio offers, why accessibility and performance matter, and how to start a conversation.

004 supplies the Home singleton, reusable sections, routing, metadata, FAQ structured data, and Visual Editing. 005 uses that foundation rather than building another Home template. It serves constitution section 1: inquiries and booked calls, demonstrated craft, and discoverability.

The owner approved this specification, plan, and task list on 2026-11-19. Realistic placeholder copy and the gradient are approved for interim use; final copy, business claims, and image treatment remain a pre-launch approval gate.

## Dependencies and delivery gate

- **004 Page builder:** Phases A-D and the end-to-end/performance gate are complete. The owner has deferred all feature UX testing, including 004's remaining UX sign-off, until pre-launch readiness.
- **009 Contact:** deliver the reusable booking section, its real Google Workspace scheduling configuration, accessible fallback, privacy behavior, and lazy-loading/CSP integration. Until then, 005 may use a copy-only `richTextSection` at `#booking`; it provides no contact form, scheduler, or availability.
- **Owner inputs:** final copy, business claims, a licensed hero photo, image treatment, metadata, and CTA destinations are approved before launch readiness, not before implementation.
- **Owner decision (2026-11-18):** 005 originally waited for 009 and would not recreate booking inside 005.
- **Owner decision (2026-11-19):** realistic placeholder copy and the gradient may be used until pre-launch readiness; defer all UX testing and final copy/photo approval until then.
- **Owner decision (2026-11-19):** proceed with 005 before 009 by adding a temporary copy-only booking placeholder using the existing rich-text block. The real 009 booking implementation replaces it when ready; do not build contact or scheduling functionality in 005. Approved tasks precede production code or CMS mutation.

### Relationship to 011

005 owns Home-visible copy, referenced FAQ answers, the Home title/description, and the licensed Home photo. Realistic placeholders and the gradient may remain during implementation. The owner approval of final copy and image treatment, replacement of the gradient, and all UX testing are deferred to the 011 pre-launch readiness stage. 011 retains responsibility for global business details, other pages' placeholders, the example demo testimonial, and the final site-wide audit.

## Users and scenarios

- **Small-business owner:** lands on `/`, understands the offer without needing to know terms such as AEO or GEO, scans relevant capabilities, and books a discovery call.
- **Visitor researching fit:** reads the process and FAQs for useful, accurate answers without unsupported promises about price, timelines, rankings, or compliance.
- **Keyboard or screen-reader user:** reads a logical heading outline, opens FAQs, follows meaningful service links, and reaches booking or its accessible fallback without a trap.
- **Visitor on a slow phone:** reads the page before any booking embed is needed; the hero is appropriately cropped and does not shift the layout.
- **Content editor:** changes Home content and its image in Studio, previews the actual page, and publishes without overwriting unrelated settings or referenced content.

## Requirements (EARS)

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| HOME-R1 | THE SYSTEM SHALL compose `/` from the existing Home singleton and reusable page-builder sections, in this order: hero, trust bar, feature grid, CTA banner, process steps, FAQ, and a final booking section. Until 009 is ready, the final section SHALL be a copy-only placeholder using the existing rich-text block; it SHALL be replaced by 009's section when available. | - Playwright: the seven sections appear in order with exactly one h1.<br>- Before 009: the last section is the copy-only placeholder with the unique `booking` anchor; after 009: it is the real 009 section.<br>- Review: there is no separate hard-coded Home template or duplicate booking implementation. |
| HOME-R2 | WHEN the Home page is prepared for production launch, THE SYSTEM SHALL show owner-approved, plain-language copy in the studio's approachable Pacific Northwest voice. Claims SHALL reflect the actual service and SHALL NOT promise universal compliance, guaranteed search placement, or guaranteed AI citations. | - Owner signs off the final copy inventory before production launch.<br>- Pre-launch review: no `Placeholder:` copy remains in Home's visible content, Home-specific metadata, or its FAQPage data; no sample testimonial appears on Home.<br>- Unconfirmed timelines, prices, care plans, and service guarantees are removed or explicitly approved. |
| HOME-R3 | WHEN the Home page is prepared for production launch, THE SYSTEM SHALL use an owner-supplied photo licensed for the site's use in the hero, replacing the gradient without using the watermarked Figma stock preview. The image SHALL have an approved hotspot/crop and either descriptive alt text or an explicit decorative designation. | - Owner confirms the photo's permitted use and any attribution obligations; source and attribution requirements are documented without storing purchase credentials.<br>- Before launch, Studio and rendered HTML use the approved asset, not the gradient or stock preview.<br>- Pre-launch mobile/desktop and light/dark review confirms the subject is not obscured or misleadingly cropped, text contrast is at least 4.5:1 (7:1 target), and required image attribution is present. |
| HOME-R4 | WHEN a visitor activates the Home hero or CTA-banner booking link, THE SYSTEM SHALL take them to the unique `/#booking` section. Before 009 is ready, that section SHALL clearly say scheduling is coming soon; after 009 is ready, it SHALL provide the real booking experience and accessible fallback. | - Each CTA has a clear accessible name and resolves to the unique anchor without being hidden behind the header.<br>- Before 009: the placeholder makes no claim that a visitor can book or contact the studio through it.<br>- After 009: keyboard/manual checks confirm booking and its fallback are operable without a pointer; no control points to a mock calendar. |
| HOME-R5 | THE SYSTEM SHALL present the six seeded capabilities with concise explanations: accessibility, performance, answer-engine optimization, generative-engine optimization, search-engine optimization, and local-business websites. WHERE a card has a link, its destination SHALL exist and its accessible name SHALL include the capability title. | - Before launch: owner approves the six cards and their final destinations.<br>- Playwright: each rendered internal card link returns 200, has a meaningful name, and has a target at least 44 px tall.<br>- If a destination from 006 or 010 is not ready, the approved content omits that optional link rather than shipping a broken link; omissions are recorded in the content sign-off. |
| HOME-R6 | THE SYSTEM SHALL show the four-step process and six referenced FAQs with approved descriptions and answers that accurately describe the studio's work. The FAQPage data SHALL match the displayed FAQ content. | - Before launch, owner verifies process, commercial statements, and FAQ answers.<br>- Playwright: FAQ interaction remains keyboard-operable and exactly one FAQPage contains the visible questions in order.<br>- Pre-launch review: updates to a shared FAQ are checked on other pages that reference it, including the demo. |
| HOME-R7 | WHEN 009 is available, THE SYSTEM SHALL reuse its real booking section, including its loading, unavailable/error, fallback, and privacy behavior, rather than copying Figma's illustrative dates, time zone, or available times. Until then, Home SHALL render only the copy-only placeholder. | - Before 009: no booking scripts, mock calendar, invented availability, or contact form is added by 005.<br>- After 009: integration review identifies the 009 block/configuration; initial, loaded, and unavailable states follow its approved criteria; scheduling resources load only under its approved lazy-load behavior. |
| HOME-R8 | THE SYSTEM SHALL use the approved Home title from Site settings and the approved Home description/social-image settings through the existing SEO system, preserving canonical URLs, deployment indexing rules, and visible-content-only structured data. | - Pre-launch Playwright: Home has the approved title/description, canonical root URL, complete Open Graph/Twitter tags, and matching FAQPage.<br>- Existing SEO regression tests still pass, including preview noindex and the noindex demo's exclusion from crawler files.<br>- Before launch, Home SEO copy contains no placeholder text; global business-description replacement remains a separately tracked 011 responsibility. |
| HOME-R9 | WHEN an editor previews or publishes Home copy, its photo, or a referenced FAQ, THE SYSTEM SHALL preserve the existing builder editing and publish-refresh behavior. | - Authenticated Presentation: Home opens at `/`; changed text and hotspot/crop appear in draft preview; click-to-edit and section reordering work.<br>- Manual publish check: approved changes reach the public page through existing cache invalidation without a redeploy.<br>- Public responses do not include draft-only Visual Editing tools. |
| HOME-R10 | THE SYSTEM SHALL preserve accessibility and performance with the actual final copy, licensed photo, and integrated booking section, not just placeholder fixtures. | - Before launch readiness, full Definition of Done passes: lint, types, relevant Vitest/Playwright tests, axe with zero violations in both themes, build, and Lighthouse 100 in all four categories on mobile/desktop.<br>- Pre-launch lab checks on `/`: LCP at most 2.5 s (target 2.0 s), CLS at most 0.1, and no hero/booking-induced layout shift beyond that budget.<br>- Pre-launch manual keyboard, VoiceOver, 400% zoom, 320 px reflow, and reduced-motion checks pass; production INP remains subject to field measurement after sufficient traffic. |
| HOME-R11 | WHEN final content is applied to Sanity or setup fixtures are refreshed, THE SYSTEM SHALL preserve unrelated editor content and settings. Existing seed commands SHALL remain non-destructive and final reusable content SHALL be reproducible for a fresh dataset. | - The approved plan identifies precisely which Home fields, FAQ documents, Site settings fields, and assets may change.<br>- Verification on an isolated fixture/dataset confirms rerunning setup does not overwrite existing edits or duplicate assets/sections.<br>- Final content is previewed and approved before production launch; no full-document replacement of shared Site settings or FAQs is used. |

## Interim Home copy -- approved for placeholders, pending pre-launch final approval

This realistic, plain-language copy is approved for interim use, not as confirmed service terms. It replaces jargon and absolute outcome claims while retaining the existing six-capability/four-step structure. Final wording may change after the owner confirms the business facts and 009's booking flow during pre-launch readiness.

### Hero and trust bar

| Field | Proposed copy |
| --- | --- |
| Hero heading | Thoughtful websites. Built to help your business grow. |
| Hero body | Bespoke websites for small businesses in Portland and the Pacific Northwest. Clear design, accessible experiences, and a fast foundation that helps people find you. |
| Hero primary CTA | "Booking details coming soon" until 009 is ready; the final booking CTA is confirmed with 009 |
| Trust statement 1 | Accessibility from the start |
| Trust statement 2 | Fast, focused websites |
| Trust statement 3 | Built around your business |

Retain the existing brand lockup. A secondary hero CTA is not proposed. The final image, its decorative/informative status, and any alt text remain owner inputs.

### Capabilities

**Heading:** A better website starts with a strong foundation.

**Intro:** Give your customers a clear path from finding your business to getting in touch. We bring design, accessibility, performance, and discoverability together.

| Capability title | Proposed description |
| --- | --- |
| Accessible websites | Help more people use your website. We build with clear structure, keyboard access, and WCAG accessibility standards in mind. |
| Fast-loading websites | Keep the path to your business quick and straightforward, with focused pages and carefully sized images. |
| Clear answers for search tools | Make common questions easy to answer, with useful content and structured information that search and answer tools can understand. |
| Content AI search can understand | Give AI-powered search tools clear, consistent information about what you do and who you help. |
| Search-friendly foundations | Help search engines understand your pages through meaningful content, clear page titles, and sound technical foundations. |
| Websites for local businesses | Show nearby customers what you offer, where you work, and how to reach you. |

The third, fourth, and fifth cards correspond to AEO, GEO, and SEO respectively. Technical abbreviations may remain as existing short badges, but the descriptions must make sense without them. Final link labels and destinations are reviewed together; no new service URLs are invented here.

### CTA banner

- **Heading:** Have a project in mind?
- **Body:** Tell us what you want your website to do. Let's talk about your goals and the next step for your business.
- **Button:** "Booking details coming soon" until 009 is ready; use a final booking label only with 009's real section

### Process

**Heading:** From first conversation to launch.

**Intro:** A clear process keeps the work focused and helps you know what comes next.

| Step | Proposed title | Proposed description |
| --- | --- | --- |
| 01 | Discover and plan | Talk through your goals, your customers, and what your website needs to do. Agree on the scope before we build. |
| 02 | Design and build | Shape a website around your brand, with clear content and accessibility considered throughout. |
| 03 | Test and refine | Check the details across screen sizes, keyboards, and assistive technology, then refine performance and usability. |
| 04 | Launch and hand over | Bring the site online with guidance for managing content and a clear agreement on any ongoing support. |

### FAQs

Keep the six existing question topics and reusable FAQ references. Proposed answers:

| Topic | Proposed answer |
| --- | --- |
| Timeline | The schedule depends on the size of your site and how ready your content is. We'll agree on the stages and timing before work begins. |
| Pricing and scope | Your proposal will set out the work, cost, and what's included. If your needs change, we'll discuss the impact before adding work. |
| Technology | We build with Next.js, React, TypeScript, and Sanity. That gives you a custom website and a dedicated place to manage your content. |
| Accessibility | We work toward WCAG 2.2 AA through accessible design, semantic code, automated checks, and keyboard and screen-reader testing. Accessibility is part of the process, not a one-off score. |
| Search and AI discoverability | We include clear page information, structured data, and technical search foundations. These help search and AI tools understand your business, but no one can guarantee rankings or citations. |
| Ongoing support | We'll discuss handover and any ongoing support before launch, so you know who handles updates and what is included. |

The owner must confirm these operating practices; no answer is published on the strength of this draft alone. The six existing question wordings also remain subject to the same plain-language review.

### Home metadata and booking introduction

- **Proposed Home title:** Accessible Web Design in Portland | Wy'east Digital Studio
- **Proposed Home description:** Bespoke websites for small businesses in Portland and the Pacific Northwest. Built with accessible design, fast performance, and clear paths to get in touch.
- **Interim booking placeholder:** "Booking is coming soon." / "We're preparing our scheduling details. Please check back soon for booking information." This is copy only; it does not offer a contact method or claim that scheduling is available.
- **Proposed 009 booking heading:** Let's talk about your website.
- **Proposed 009 booking introduction:** Share what you have in mind and choose a time for a discovery call. Use only with the real 009 section after it is ready.

Booking duration, price, availability, time zone display, scheduling URL, response promises, privacy text, and fallback wording come from the approved 009 specification and owner configuration, not from this draft or Figma's example widget.

## Content model (Sanity)

Reuse the existing editor-owned content:

- **Home page singleton:** the ordered sections, Home SEO description, optional social image, and indexing setting. Do not introduce a second Home document.
- **Hero section:** heading, body, primary labelled link, brand-lockup choice, licensed image, hotspot/crop, and explicit alt/decorative fields.
- **Trust bar:** three short, truthful statements and existing curated icons.
- **Feature grid:** heading, intro, six cards, optional badges, and only valid optional links.
- **CTA banner:** heading, body, and booking link.
- **Process section:** heading, intro, and four steps.
- **FAQ section:** the existing six reusable FAQ documents; do not duplicate them as inline Home-only answers.
- **Booking section:** until 009 is ready, use the existing `richTextSection` with the unique `booking` anchor and copy only. Replace that block with the reusable booking section supplied by 009; do not add a new schema type for the temporary copy.
- **Site settings:** Home title; change only explicitly approved Home-related values. Global business and contact details are not rewritten as a side effect.

The plan must use the generated content types and identify any schema gap before implementation. This spec does not pre-approve a new runtime dependency, client wrapper, or alternative booking provider.

## Non-functional requirements

- The constitution applies in full. Retain the site shell, design tokens, mobile-first layouts, accessible section surfaces, and reduced-motion behavior.
- Figma provides the visual direction, not approved business claims or a working calendar. Mobile light/dark frames are the first review targets. Their source width is 420 px and the desktop light frame is 1440 px; verify fluid layouts at the constitution's required widths rather than assuming those source frames prove 375 px behavior.
- Reuse 004's owner-approved server-only image approach. The final photo must still be responsive, prioritized as the LCP candidate, hotspot-aware, and dimensionally stable; do not introduce image-specific client JavaScript.
- Keep the scrim sufficient for the actual photo in both themes. Any change to its strong existing treatment must be justified by contrast measurements and owner-reviewed screenshots, not appearance alone.
- Booking loading must not delay the hero or block reading the rest of the page. 009 owns new third-party origins, CSP, embed privacy, and recovery behavior.
- Do not add analytics, tracking, cookies, or lead capture beyond 009's approved behavior.

## UX review checklist

**Owner decision (2026-11-19): defer every item below until immediately before launch readiness in 011.** These checks are a launch gate, not a prerequisite for implementing 005. Automated functional regression tests may run during implementation; final axe/Lighthouse, manual accessibility/usability, visual comparison, and owner sign-off happen with the approved copy and photo.

- [ ] Compare the final photo/copy/layout at 375, 768, 1280, and 1920 px in light and dark modes against the Figma Home frames
- [ ] Owner approves the copy inventory, commercial statements, metadata, licensed photo, crop, alt/decorative treatment, and all CTA/card destinations
- [ ] No gradient, watermarked stock photo, visible placeholder text, sample testimonial, or fake booking availability remains on Home
- [ ] Hero, trust bar, capabilities, CTA, process, FAQ, and booking follow the intended reading order
- [ ] Exactly one h1; logical h2/h3 hierarchy; meaningful landmarks, card links, and CTA names
- [ ] Every rendered capability link resolves to a real page; omitted links are explicitly recorded
- [ ] Keyboard-only: visible focus, working FAQs, reachable booking anchor, usable scheduler/fallback, and no focus trap
- [ ] VoiceOver: image treatment, section labels, FAQs, booking loading/unavailable messages, and fallback links make sense
- [ ] 400% zoom and 320 px viewport: no horizontal overflow or clipped content; controls remain at least 44 by 44 px where practical
- [ ] Reduced motion is respected, including navigation to booking
- [ ] Booking's lazy, loaded, and unavailable states meet 009's approved requirements without layout shifts or misleading availability
- [ ] Final-photo contrast and mobile/desktop Lighthouse/axe budgets pass
- [ ] Authenticated Presentation: edit text/image, follow click-to-edit, reorder sections, preview drafts, and publish-refresh successfully
- [ ] AI UX review findings are recorded in `review/`, blockers are fixed, and the owner signs off

## Out of scope

- Implementing contact, scheduling, or booking functionality before 009 is complete
- Rebuilding the page builder, shell, metadata engine, FAQ renderer, or booking infrastructure
- A custom calendar, hard-coded appointment slots, a second inquiry form, or a new scheduling provider
- Creating the service-detail pages in 006 or the accessibility/audit page in 010
- Unapproved new guarantees, fixed prices, delivery timelines, support plans, customer quotes, or performance claims
- Global business-details cleanup, other pages' final copy, demo-testimonial replacement, and the final site-wide launch audit owned by 011
- Buying or downloading unlicensed stock assets, decorative patterns, animation, or new section types without an approved plan

## Open questions and owner decisions

- [x] **Q-A -- Delivery:** 005 may proceed before 009 with a copy-only placeholder section; the real booking functionality remains owned by 009 and replaces the placeholder when ready. (Owner, 2026-11-19; supersedes 2026-11-18)
- [x] **Q-B -- Editorial direction:** use realistic, plain-language placeholders during implementation; final wording and business claims require owner approval before launch. (Owner, 2026-11-19)
- [x] **Q-C -- Image source:** retain the gradient until a licensed photo is supplied and approved before launch; do not use the watermarked Figma preview. (Owner, 2026-11-19)
- [x] **Q-D -- Scope reconciliation:** 005 owns Home copy, referenced FAQ answers, Home title/description, and hero photo; final approval and UX testing are deferred to 011. (Owner, 2026-11-19)
- [x] **Q-E -- Final copy and business facts:** use the approved realistic draft as interim content; approve final wording, claims, and FAQ questions/answers before launch readiness. (Owner, 2026-11-19)
- [x] **Q-F -- Booking contract:** Home hero and CTA-banner CTAs use `/#booking`. Until 009, the anchor contains copy only and no booking/contact control. The real section, fallback, loading, privacy, and third-party behavior come from 009. The existing global header CTA is unchanged by 005. (Owner, 2026-11-19)
- [x] **Q-G -- Capability destinations:** link only to approved, existing routes; omit optional links to 006/010 until those routes exist. (Owner, 2026-11-19)
- [x] **Q-H -- Photo and social image:** defer licensed source, attribution, alt/decorative status, crop, and final social-image decision until pre-launch readiness; retain the gradient in the interim. (Owner, 2026-11-19)
- [x] **Q-I -- Spec approval:** owner approved the spec, plan, and tasks for implementation subject to the 009 dependency; final copy, image, and UX approval remain pre-launch gates. (Owner, 2026-11-19)
