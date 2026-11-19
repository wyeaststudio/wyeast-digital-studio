# 004 — Page builder: Spec

**Status:** Approved (2026-11-18) · **Owner:** Wy'east Digital Studio · **Figma:** [Home, desktop light](https://www.figma.com/design/uLqdLLfDDSL83X11ea41Wt/Wy-east-Digital-Studio?node-id=10-13), [Home, mobile light](https://www.figma.com/design/uLqdLLfDDSL83X11ea41Wt/Wy-east-Digital-Studio?node-id=10-10), [Home, desktop dark](https://www.figma.com/design/uLqdLLfDDSL83X11ea41Wt/Wy-east-Digital-Studio?node-id=10-12), [Home, mobile dark](https://www.figma.com/design/uLqdLLfDDSL83X11ea41Wt/Wy-east-Digital-Studio?node-id=10-11)

## Summary

The studio needs to publish pages without a developer: the home page, service and about pages, and landing pages for campaigns. This feature adds a **page builder**: editors build a page from an ordered list of reusable, on-brand section blocks, and every page gets correct metadata, structured data, a sitemap entry, and a social card through the 003 SEO system.

Owner decision Q-A: **every page is built with the page builder**, including the core pages (Home, Services overview, About, Process, Contact). This replaces the constitution's hybrid model (fixed templates for core pages), so this spec includes a constitution amendment. Pages stay on-brand through guardrails in code: a fixed block library, Studio validation, and design tokens.

The block library comes from the Figma Home page, which is the only page with a design so far: hero, trust bar, feature grid, call-to-action banner, process steps, and FAQ. Rich text and testimonial blocks are added from the roadmap; they have no Figma design yet and are designed from the existing tokens, then reviewed. The feature serves constitution §1.1 (conversion: every page can carry calls to action), §1.2 (craft: fast, accessible blocks), and §1.3 (discoverability: every page is registered with the SEO system).

## Users and scenarios

- **Content editor:** creates a landing page, adds a hero, a feature grid, an FAQ, and a call to action, previews it in the Presentation tool, clicks a heading to edit it, reorders sections, and publishes. The page appears at `/{slug}`, in the sitemap, and in `llms.txt`.
- **Content editor (home):** edits the home page's sections in the "Home page" document; changes appear at `/` after publishing.
- **Visitor:** lands on a page from search or a shared link, reads a clear hero, scans the services, and books a consultation. Every block works with keyboard, screen reader, zoom to 400 %, and reduced motion.
- **Visitor on a slow phone:** the page is readable quickly (LCP ≤ 2.5 s) because blocks are server-rendered with no client JavaScript and the hero image is optimised.

## Requirements (EARS)

### Pages and routing

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| PB-R1 | THE SYSTEM SHALL provide a `page` document type with a title, a unique slug, the 003 SEO field group, and a `sections` array of page-builder blocks. It replaces the placeholder `page` type from 001. | - Vitest: slug validation helpers<br>- Manual: Studio lists "Pages"; a page can be created, filled with sections, and published |
| PB-R2 | THE SYSTEM SHALL serve each published page at `/{slug}`. Slugs SHALL be one lowercase, hyphenated path segment and unique across pages. IF a slug is reserved by the app (for example `studio`, `api`, `og`, `sitemap.xml`, `robots.txt`, `llms.txt`), THEN the Studio SHALL reject it. | - Vitest: reserved and malformed slugs fail validation<br>- Playwright: the seeded demo page returns `200` at its slug |
| PB-R3 | IF a request matches no published page, THEN THE SYSTEM SHALL return the 002 "Page not found" page with status `404` and `noindex`. | - Playwright: `/no-such-page` returns `404` with the not-found heading |
| PB-R4 | THE SYSTEM SHALL provide a **Home page** singleton with the same `sections` and SEO fields, served at `/`. It replaces the temporary home page and the 003 temporary FAQ wiring (SEO-R23). | - Playwright: `/` renders the Home page sections in order<br>- Manual: Studio shows "Home page" with the singletons |
| PB-R5 | THE SYSTEM SHALL register `page` with the 003 route registry, so each indexable page gets metadata, a canonical URL, a social card, a sitemap entry, and an `llms.txt` entry, and `seo.noindex` pages are excluded (SEO-R4, R14, R17). The home page uses the Home page SEO fields, falling back to the site settings defaults. | - Vitest: registry entry and `resolvePath` for a page slug; published Home visibility hides and restores its entry in both crawler outputs<br>- Playwright: the demo page has its own `<title>`, canonical, and `og:image`; a noindex page is absent from `/sitemap.xml` |
| PB-R6 | THE SYSTEM SHALL prerender published pages at build time and refresh them on publish through the existing cache tags: `page`, `page:{slug}`, and `homePage`, plus `faq` and `testimonial` for referenced content. | - Build output lists the page route as prerendered<br>- Vitest: loader cache tags |
| PB-R7 | WHERE draft mode is enabled, THE SYSTEM SHALL render draft content, and the Presentation tool SHALL open a page or the home page at its URL. Every text field in every block SHALL be click-to-edit, and sections SHALL be reorderable from the preview. | - Manual: Presentation opens `/` and the demo page from their documents; clicking a block heading focuses its field; dragging a section reorders it |

### Section rendering (all blocks)

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| PB-R8 | THE SYSTEM SHALL render a page's sections in order, each as a `section` landmark labelled by its heading when it has one. IF a section has an unknown type or is missing required content, THEN THE SYSTEM SHALL skip it rather than fail the page. | - Vitest: the renderer skips unknown and incomplete sections and keeps order |
| PB-R9 | Each page SHALL have exactly one `h1`: the hero heading, or, IF the page has no hero, the page title in a simple page header. Block headings SHALL be `h2`, and card or item titles SHALL be `h3`. A hero SHALL only be allowed as the first section, at most once. | - Vitest: heading levels per block<br>- Vitest: the Studio validation rejects a hero that isn't first or appears twice<br>- Playwright: each test page has one `h1` and no skipped heading levels |
| PB-R10 | WHERE an editor chooses a section **surface** (background, card, or primary), THE SYSTEM SHALL render the block on that surface with its matching foreground colours. Each block has a default surface that matches Figma. Text SHALL meet 7:1 and focus indicators 3:1 on every surface in both themes. | - Vitest: the token contrast tests cover each surface pair<br>- Playwright: axe passes on the demo page (all blocks on varied surfaces) in light and dark |
| PB-R11 | WHERE an editor sets an optional **anchor** on a section, THE SYSTEM SHALL render it as the section `id` so links like `/#booking` work. Anchors SHALL be unique on a page and URL-safe. | - Vitest: anchor validation<br>- Playwright: a link to the demo page's anchor scrolls to the section |
| PB-R12 | Blocks SHALL be server-rendered presentational components with no client JavaScript of their own, and SHALL use only design tokens. Icons SHALL come from a fixed, curated list that editors pick by name; they are decorative and hidden from assistive technology. | - Build: no new client chunks from section components<br>- Vitest: an unknown icon name renders nothing |

### Blocks

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| PB-R13 | **Hero.** THE SYSTEM SHALL render a hero with an optional eyebrow, a heading (`h1`), a short body, up to two calls to action (primary and secondary), an optional brand lockup, and a background image with alt text (or marked decorative) cropped from its hotspot. Text over the image SHALL keep at least 4.5:1 contrast (7:1 target) through a scrim, and the image SHALL be the page's LCP candidate: prioritised, responsive, and without layout shift. Matches Figma `35:256` and `45:4`. | - Vitest: fixtures render the heading, CTAs, and image `alt`<br>- Playwright: no CLS from the hero; axe colour contrast passes over the image<br>- Lighthouse: LCP within budget |
| PB-R14 | **Trust bar.** THE SYSTEM SHALL render two to four short statements, each with an icon, as a list, separated by dividers on wide screens and stacked on narrow ones. Matches Figma `47:3`. | - Vitest: renders a list with the items in order |
| PB-R15 | **Feature grid.** THE SYSTEM SHALL render an optional eyebrow, a heading, an intro, and two to nine cards. Each card has an icon, an optional short badge, a title (`h3`), a description, and an optional link. A link's accessible name SHALL include the card title, so "Learn about this capability" is meaningful out of context (WCAG 2.4.9). The grid is one column on mobile, two on tablet, and three on desktop. Matches Figma `61:256`. | - Vitest: cards, badges, link names include the title<br>- Playwright: link targets are at least 44 px tall |
| PB-R16 | **Call-to-action banner.** THE SYSTEM SHALL render a heading, a short body, and one call-to-action button in a rounded panel. Matches the "Have a project in mind?" panel in Figma `61:256`. | - Vitest: heading level and button link |
| PB-R17 | **Process steps.** THE SYSTEM SHALL render a heading, an intro, and two to six steps as an ordered list. Each step has an icon, a title (`h3`), a description, and an automatic "Step 01" label. Decorative arrows between steps are hidden from assistive technology. Steps are a row on desktop and a column on mobile. Matches Figma `66:253`. | - Vitest: an `ol` with numbered labels in order; arrows are `aria-hidden` |
| PB-R18 | **FAQ.** THE SYSTEM SHALL offer the 003 FAQ section as a block. WHERE a page has FAQ blocks, THE SYSTEM SHALL output one `FAQPage` JSON-LD for all the FAQs visible on that page (SEO-R13). | - Playwright: the demo page's `FAQPage` names equal its visible questions |
| PB-R19 | **Rich text.** THE SYSTEM SHALL render an optional heading and Portable Text body limited to paragraphs, authored `h3` and `h4` subheadings, bullet and numbered lists, bold, italic, and links (through `SiteLink`), at a readable line length (about 65 characters). Semantic body heading levels SHALL be contextual: start at `h2` without a section heading or `h3` with one, and never skip a level; authored content and visual styles are preserved (owner-approved PR review clarification, 2026-11-18). There is no Figma design; the block uses the type scale and is reviewed in UX review. | - Vitest: fixtures for each mark and style; unknown types are dropped<br>- Vitest: editor-created leading `h3`/`h4` sequences with and without a section heading preserve a logical outline |
| PB-R20 | **Testimonials.** THE SYSTEM SHALL render an optional heading and one to three testimonials picked from reusable testimonial documents. Each is a `figure` with a `blockquote` and a `figcaption` (name, role, and company), with an optional photo with alt text. There is no carousel and no motion. There is no Figma design; the block uses the card surface and is reviewed in UX review. | - Vitest: semantic `figure`/`blockquote`/`figcaption`, photo alt |
| PB-R21 | THE SYSTEM SHALL provide reusable **testimonial** documents (quote, name, role, company, optional photo with alt text) and SHALL require the editor to confirm the person gave permission to publish. Testimonials without that confirmation SHALL NOT render. | - Vitest: the loader or renderer filters unconfirmed testimonials<br>- Manual: Studio validation requires the confirmation |

### Content and verification

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| PB-R22 | THE SYSTEM SHALL seed the Home page singleton with the Figma Home sections (hero, trust bar, feature grid, call-to-action banner, process steps, and the 003 FAQ) using the Figma copy, and a placeholder hero image that the owner replaces with a licensed photo. The booking section is part of 009. | - Playwright: `/` shows the seeded sections and one `h1`<br>- Manual: the seed applies with `npx sanity documents create … --missing` |
| PB-R23 | THE SYSTEM SHALL seed a **demo page** (`seo.noindex` on) that uses every block on varied surfaces, including a placeholder testimonial that is clearly marked as an example. It is used by the end-to-end and Lighthouse tests and is excluded from the sitemap and `llms.txt`. | - Playwright and Lighthouse run against the demo page<br>- `/sitemap.xml` does not list it |
| PB-R24 | THE SYSTEM SHALL amend the constitution §4 content model from "fixed templates for core pages and a page builder for landing pages" to "the page builder for every page", bumping the constitution to version 2.0.0 (owner decision Q-A). | - `constitution.md` shows the amended §4 and version 2.0.0, approved by the owner |

## Content model (Sanity)

The plan defines the schema. Editors need:

- **Page** (document): title; slug; SEO; sections.
- **Home page** (singleton): sections; SEO. The home page title stays in Site settings (003).
- **Testimonial** (document): quote; name; role; company; photo (with alt text); "Permission to publish" confirmation.
- **Section blocks** (each with an optional anchor and a surface choice):
  - **Hero:** eyebrow; heading; body; primary and secondary call to action (label and link); show brand lockup; background image (hotspot, alt text or decorative).
  - **Trust bar:** two to four items (icon, text).
  - **Feature grid:** eyebrow; heading; intro; two to nine cards (icon, badge, title, description, optional link with label).
  - **Call-to-action banner:** heading; body; call to action (label and link).
  - **Process steps:** heading; intro; two to six steps (icon, title, description).
  - **FAQ:** the 003 FAQ section (eyebrow, heading, intro, FAQ references).
  - **Rich text:** heading; body (limited Portable Text).
  - **Testimonials:** heading; one to three testimonial references.
- **Icons:** a curated list of names from the existing icon set (Lucide), for example accessibility, zap, message-square, cpu, search, map-pin, target, shapes, bar-chart, rocket, activity, and code. The plan fixes the list.

## Non-functional requirements

- The constitution applies in full. Lighthouse 100 in all four categories (mobile and desktop) on `/`; the noindex demo follows the narrowly scoped constitution §6 exception approved by the owner on 2026-11-18: 100 in the other three categories, every other applicable automated SEO audit passing, and only the expected crawlability/SEO-category warnings. No audit is disabled. Axe reports zero violations in both themes.
- **No client JavaScript** from blocks. The only image is the hero's, served through `next/image` from the Sanity CDN with explicit sizes; other icons are inline SVG.
- Studio validation keeps pages on-brand: field length limits (headings, badges, trust items), item counts per block, alt text on every image, and the hero position rule.
- Placeholder copy (hero image, testimonial, and any text not taken from Figma) is marked as a placeholder and listed for replacement in 011.

## UX review checklist

- [ ] The home page matches the Figma Home frames at 375, 768, 1280, and 1920 px, in light and dark modes (the booking section comes in 009)
- [ ] Each block on the demo page looks on-brand on every surface it allows, in both themes
- [ ] The rich text and testimonial blocks (no Figma design) read well and fit the visual language
- [ ] Keyboard-only: every link and button is reachable in order, with a visible focus indicator on every surface
- [ ] Screen reader (VoiceOver): one `h1`, a logical heading outline, landmarks per section, meaningful link names in the feature grid, and testimonials announced as quotes with attribution
- [ ] Zoom to 400 % and a 320 px viewport: no horizontal scrolling or clipped text
- [ ] Reduced motion: nothing animates
- [ ] Studio: creating a page, adding and reordering sections, picking icons, surfaces, FAQs, and testimonials is clear; validation messages are helpful
- [ ] Presentation: click-to-edit works on every block's text, and sections can be reordered from the preview

## Out of scope

- The booking section and the contact form (009)
- Service detail pages and their structured data (006)
- Nested page URLs (for example `/services/web-design`); pages are one segment deep in 004
- Decorative background patterns from Figma on primary surfaces (revisit during UX review)
- Images inside rich text, video, galleries, and carousels
- Per-section animation
- Page templates or duplication tooling in the Studio
- Final copy and the licensed hero photo (011)

## Roadmap impact

- **005 Home page** becomes final home content and copy on the page builder (the singleton and seeded sections arrive in 004), plus the booking section once 009 is ready.
- **006, 007, 008, and 010** build their overview pages with the page builder and add blocks only when a design needs one.

## Open questions

- [x] **Q-A** Core pages are built with the page builder too, which needs a constitution amendment (PB-R24). (Owner, 2026-11-18)
- [x] **Q-B** The block library includes all eight blocks: hero, trust bar, feature grid, call-to-action banner, process steps, FAQ, rich text, and testimonials. (Owner)
- [x] **Q-C** Pages are served at the top level, `/{slug}`, with reserved slugs blocked. (Owner)
- [x] **Q-D** Editors choose a surface per section: background, card, or primary. (Owner)
- [x] **Q-E** The Figma hero uses a watermarked stock preview, so the seed uses a placeholder image and the owner uploads a licensed photo later (011). (Owner)
- [x] **Q-F** A noindex demo page using every block is seeded for tests. (Owner)
- [x] **Q-G** The home page is a "Home page" singleton served at `/`. (Owner)
- [x] **Q-H** Testimonials are reusable documents picked by reference. (Owner)
- [x] **Q-I** A page without a hero shows its title as a simple page header `h1`. (Owner)
- [x] **Q-J** The constitution amendment (PB-R24) and the roadmap change to 005 are approved. (Owner, 2026-11-18)
- [x] **Q-K** Keep the demo noindex and apply the narrowly scoped Lighthouse exception in constitution §6; Home still requires 100 in all four categories. (Owner, 2026-11-18)
- [x] **Q-L** Preserve the SEO system's restriction on generated noindex-document cards. When a noindex page has neither a page upload nor a site-default upload, use the valid site-wide card instead of a document-card URL that returns 404; retain page-specific text metadata and uploaded images. (Owner, 2026-11-18)
- [x] **Q-M** Disable speculative prefetch for CMS-driven `SiteLink` paths while retaining client-side navigation on click, avoiding background 404 requests to seeded destinations owned by later features. (Owner, 2026-11-18)
