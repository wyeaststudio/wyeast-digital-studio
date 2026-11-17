# 002 — Site shell: Spec

**Status:** Approved (2026-11-16) · **Owner:** Wy'east Digital Studio · **Figma:** [navbar-header (desktop)](https://www.figma.com/design/uLqdLLfDDSL83X11ea41Wt/Wy-east-Digital-Studio?node-id=21-58), [mobile-navbar](https://www.figma.com/design/uLqdLLfDDSL83X11ea41Wt/Wy-east-Digital-Studio?node-id=36-99), [Footer](https://www.figma.com/design/uLqdLLfDDSL83X11ea41Wt/Wy-east-Digital-Studio?node-id=68-620)

## Summary

Every page needs the same frame: a header with the brand, navigation, a booking call to action, and the theme switch; a footer with contact details and links; a skip link; and friendly 404 and error pages. This feature builds that frame once, so every later page (004–010) gets it for free. Editors manage the navigation, contact details, and social links in Sanity through two singleton documents. The shell supports lead generation (constitution §1.1) because the "Book Appointment" CTA is on every page, and it demonstrates craft and accessibility (§1.2) because the navigation is the most-used interactive part of the site.

## Users and scenarios

- **Site visitor (mouse or touch):** finds Services, About, and Contact from any page, books a call from the header CTA, and switches between light, system, and dark themes.
- **Keyboard or screen-reader visitor:** skips straight to the content, moves through the menu and the Services submenu with the keyboard, hears which page is current, and is never trapped or hidden behind the sticky header.
- **Mobile visitor (375 px):** opens the menu from the hamburger button, follows a link, and the menu closes.
- **Visitor who hits a broken link or an error:** sees an on-brand page that explains what happened and offers a way forward instead of a dead end.
- **Content editor:** changes a nav label, adds a Services submenu item, or updates the contact email in `/studio`, publishes it, and sees the change on the live site on the next request.

## Requirements (EARS)

### Layout and landmarks

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| SHELL-R1 | THE SYSTEM SHALL render every public page inside one shared shell: a `header` (banner) landmark, one `main` landmark with `id="main-content"`, and a `footer` (contentinfo) landmark. Pages SHALL NOT render their own `main`. | - Playwright: `/` and the 404 page each have exactly one `banner`, one `main`, and one `contentinfo`<br>- The home page no longer renders `main` or the temporary theme toggle |
| SHELL-R2 | THE SYSTEM SHALL provide a "Skip to content" link as the first focusable element on every page. It SHALL be visually hidden until focused, and WHEN activated it SHALL move focus to `main`. | - Playwright: the first Tab focuses the skip link, which is visible<br>- Pressing Enter moves focus to `#main-content` |

### Header

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| SHELL-R3 | THE SYSTEM SHALL show a floating header that matches the Figma `navbar-header`: the brand logo linking to `/` (accessible name "Wy'east Digital Studio, home"), the primary navigation, the CTA button, and the theme switch, at 64 px tall on desktop and 56 px on mobile. | - Visual match in the UX review at 1280 and 1920 px<br>- Vitest: the logo link has the accessible name above |
| SHELL-R4 | THE SYSTEM SHALL render the primary navigation from the `navigation` singleton as a `nav` landmark labelled "Main", in the order the editor set. | - Vitest with fixture props: links render in order inside `nav[aria-label="Main"]` |
| SHELL-R5 | WHEN the current URL path matches a nav link, THE SYSTEM SHALL mark that link with `aria-current="page"` and the Figma active style (bold). For a nav item with children, the parent SHALL be marked when the path matches one of its children. | - Vitest: given `currentPath="/about"`, only the About link has `aria-current="page"`<br>- Playwright: on `/`, Home has `aria-current="page"` |
| SHELL-R6 | WHERE a nav item has children, THE SYSTEM SHALL render it as a disclosure button (`aria-expanded`) that opens a submenu of links. Enter, Space, and click SHALL open it; Escape SHALL close it and return focus to the button; and clicking outside SHALL close it. One level of children is supported. | - Vitest: keyboard and pointer open and close, `aria-expanded` updates, and Escape returns focus<br>- Playwright on desktop: the Services submenu opens with the keyboard |
| SHELL-R7 | THE SYSTEM SHALL show the header CTA ("Book Appointment" in Figma) from the `navigation` singleton, styled as the Figma teal button, with a target of at least 44×44 px. | - Vitest: renders the CTA label and href<br>- Playwright: CTA bounding box ≥ 44×44 |
| SHELL-R8 | WHEN a visitor scrolls down past the header height, THE SYSTEM SHALL hide the header, and WHEN they scroll up, it SHALL show it again. WHILE the page is scrolled to within one header height of the top, focus is inside the header, the mobile menu is open, or a submenu is open, THE SYSTEM SHALL keep the header visible. | - Playwright: scroll down 600 px → header is translated out of view; scroll up 50 px → it is visible<br>- Playwright: Tab into the header while it's hidden → it becomes visible |
| SHELL-R9 | THE SYSTEM SHALL prevent the sticky header from hiding focused content (WCAG 2.4.11 *Focus Not Obscured*) and in-page anchor targets, by reserving scroll padding equal to the header's height plus its offset. | - Playwright: after jumping to `#main-content` or tabbing to a lower element, the focused element's top is below the header's bottom |
| SHELL-R10 | THE SYSTEM SHALL keep foreground text on the translucent header surface at **≥ 7:1** contrast against the worst-case content that can scroll beneath it, in both themes. Where Figma's 45% opacity can't meet this, the opacity SHALL be raised and the deviation recorded in the plan. | - A unit test blends the header surface over the darkest and lightest surface tokens and asserts ≥ 7:1 for `foreground` |

### Theme switch (supersedes FOUND-R8)

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| SHELL-R11 | THE SYSTEM SHALL replace the 001 two-state `ThemeToggle` with a presentational three-option theme switch (Light, System, Dark) that matches the Figma `Theme Toggle Group` in style, labelled "Theme", with each option at least **44×44 px** (owner decision: wider than Figma's 28 px to meet AAA 2.5.5). | - Vitest: three options with accessible names "Light theme", "System theme", and "Dark theme"; the selected option is exposed as pressed or checked; each is ≥ 44 px<br>- The old `ThemeToggle` and its temporary home-page placement are removed |
| SHELL-R12 | WHEN a visitor chooses an option, THE SYSTEM SHALL apply it, persist it, and restore it on later visits with no flash of the wrong theme. "System" SHALL follow the OS preference live. Until the theme is known after hydration, the switch SHALL reserve its space without layout shift. | - Playwright: choose Dark → `html.dark`, which survives a reload; choose System with `colorScheme: 'dark'` → `html.dark`<br>- The existing FOUND-R6/R7 tests are updated to use the new switch and pass |

### Mobile menu

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| SHELL-R13 | WHILE the viewport is narrower than the desktop breakpoint, THE SYSTEM SHALL show the logo and a 44×44 px menu button ("Open menu", `aria-expanded`) instead of the inline navigation, CTA, and theme switch. | - Playwright at 375 px: the inline nav is hidden and the menu button is visible |
| SHELL-R14 | WHEN the menu button is activated, THE SYSTEM SHALL open a side sheet as a modal dialog (labelled "Menu") that contains the full navigation with children shown as nested lists, the CTA, and the theme switch. Focus SHALL move into the sheet and stay trapped there, page scroll SHALL lock, and a "Close menu" button SHALL be present. | - Vitest: the dialog role, its label, and its content render from fixture props<br>- Playwright at 375 px: open → focus is inside the dialog; Tab cycles within it |
| SHELL-R15 | WHEN the sheet is open and the visitor presses Escape, activates "Close menu", clicks the backdrop, or follows a link, THE SYSTEM SHALL close it and return focus to the menu button (or move to the new page's content after navigation). | - Playwright: each close path works, and focus returns to "Open menu" |
| SHELL-R16 | WHILE the visitor prefers reduced motion, THE SYSTEM SHALL open and close the sheet, submenu, and header hide/show without sliding animations. | - Covered by the global FOUND-R9 rule; Playwright under `reducedMotion: 'reduce'` checks the sheet's computed `transition-duration` ≈ 0 |

### Footer

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| SHELL-R17 | THE SYSTEM SHALL render a footer that matches the Figma footer style (the `primary` surface with the centered logo lockup) and adds, from Sanity: a `nav` labelled "Footer" with the footer links, the contact details (email as a `mailto:` link, phone as a `tel:` link, and the service area) inside an `address` element, and the social links. | - Vitest with fixtures: each part renders, and empty sections render nothing (no empty headings or lists) |
| SHELL-R18 | THE SYSTEM SHALL show "© {current year} {site name}. All rights reserved." in the footer, with the year kept current without a redeploy. | - Vitest: the copyright text uses the given year and name<br>- The plan documents how the year stays current |
| SHELL-R19 | THE SYSTEM SHALL give every footer link, including social links, an accessible name that describes its destination on its own (AAA 2.4.9), for example "Wy'east Digital Studio on LinkedIn", and a focus indicator with ≥ 3:1 contrast against the `primary` surface. | - Vitest: social link names include the platform<br>- Playwright: axe passes on the footer in both themes |

### Content (Sanity)

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| SHELL-R20 | THE SYSTEM SHALL provide `siteSettings` and `navigation` as **singleton** documents: each appears once in the Studio structure, can't be created again or deleted, and can't be duplicated. | - Manual: the Studio shows "Site settings" and "Navigation" as single items, with no "create new" entry for either |
| SHELL-R21 | THE SYSTEM SHALL validate editor input: nav and footer labels are required and short; each link is either an internal path that starts with `/` or an `https://` URL; nav items have at most one level of children; and the email and social URLs are well formed. | - Vitest: the link validation rule accepts `/about` and `https://x.com/a` and rejects `about`, `http://x.com`, and `javascript:alert(1)` |
| SHELL-R22 | THE SYSTEM SHALL fetch the shell content with the cache tags `siteSettings` and `navigation`, so the existing webhook (FOUND-R23) refreshes it on publish, and WHERE draft mode is enabled, the header and footer text SHALL be click-to-edit in the Presentation tool. | - A single TypeGen-typed query is used<br>- Manual: in Presentation, clicking a nav label focuses that field |
| SHELL-R23 | IF either singleton is missing or Sanity is unreachable, THEN THE SYSTEM SHALL still render a working shell: the logo, the theme switch, and the copyright with the default site name, with no navigation, CTA, or contact sections, and no error page. | - Vitest: the shell renders with `null` content<br>- The data loader catches fetch errors and returns `null` (unit test) |

### 404 and error pages

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| SHELL-R24 | WHEN a visitor requests a URL that doesn't exist, or a page calls `notFound()`, THE SYSTEM SHALL return HTTP **404** and render an on-brand "Page not found" page inside the shell with one `h1`, a short plain-language explanation, and links to the home page and the CTA destination. The page SHALL be `noindex`. | - Playwright: `GET /this-does-not-exist` returns 404, has `h1` "Page not found", the header and footer, and `meta[name=robots]` containing `noindex`<br>- axe passes in both themes |
| SHELL-R25 | IF a page throws an unexpected error while rendering, THEN THE SYSTEM SHALL render an on-brand error page inside the shell with one `h1` ("Something went wrong"), a "Try again" button that retries rendering, and a link home, and SHALL NOT show the error message or stack to visitors. | - Vitest: renders the heading, "Try again" calls the retry callback, and the error message isn't rendered |
| SHELL-R26 | IF the root layout itself fails, THEN THE SYSTEM SHALL render a minimal standalone error page with the brand fonts and theme tokens, the same heading and actions, and a document title. | - Vitest: the global error component renders the heading and the retry button |

## Content model (Sanity)

The plan defines the schema; editors need:

- **Site settings** (singleton): site name; contact email; phone (optional); service area (for example "Portland, Oregon and the Pacific Northwest"); social links (platform and URL).
- **Navigation** (singleton): header links (label, link, and optional child links); header CTA (label and link); footer links (label and link).
- A reusable **link** field: an internal path (`/about`) or an external `https://` URL.

SEO defaults (title template, description, OG image) are **not** part of this feature; 003 adds them to `siteSettings`.

## Non-functional requirements

- The constitution applies in full: WCAG 2.2 AA with the listed AAA criteria, Lighthouse 100 on mobile and desktop for `/` and the 404 page, and axe with zero violations in both themes.
- Client JavaScript is limited to the interactive islands (the header visibility wrapper, the Services submenu, the mobile sheet, and the theme switch). The logo, links, and footer render on the server.
- No new runtime dependencies. Interactive primitives come from the installed `@base-ui/react` through shadcn components.
- Nav labels and footer content must be server-rendered and crawlable (constitution §7).

## UX review checklist

- [ ] The header matches the Figma `navbar-header` at 1280 and 1920 px, and `mobile-navbar` at 375 px, in light and dark
- [ ] 768 px: the layout is not cramped (the hamburger is used below the desktop breakpoint)
- [ ] The footer matches the Figma style, and the extra contact and link content looks intentional at all four widths
- [ ] Header hides on scroll down, reappears on scroll up, and never covers a focused element
- [ ] Keyboard-only walkthrough: skip link → nav → Services submenu → CTA → theme switch → main content → footer, all with visible focus
- [ ] Mobile sheet: opens, traps focus, closes with Escape, "Close menu", the backdrop, and a link click, and returns focus
- [ ] Screen reader (VoiceOver on macOS and iOS): landmarks are announced; the current page is announced; the submenu's expanded state and the theme switch's selected option are announced; the sheet is announced as a dialog named "Menu"
- [ ] 404 and error pages read well, follow the brand voice, and offer a way forward
- [ ] Presentation tool: clicking a nav label or the footer email focuses the field

## Out of scope

- SEO defaults, Organization/`ProfessionalService` JSON-LD built from `siteSettings` contact details and social links, and breadcrumbs (003)
- The content of pages that nav links point to (005–010). Seeded links to those pages return 404 until each feature ships; the site isn't public until 011.
- References from nav items to Sanity documents. Links are paths or URLs for now; 004 can add document references once routable types exist.
- Mega menus, more than one level of children, and search
- Editor-managed 404 and error copy, which is written in code
- An editable logo; the brand logo is a fixed SVG asset
- Newsletter signup and a privacy notice link (009 adds the privacy notice when forms collect data)

## Open questions

- [x] **Q1** Theme control: three options (Light, System, Dark), each 44 px, which is wider than Figma, to meet AAA. (Owner, 2026-11-16)
- [x] **Q2** Services dropdown: nav items can have one level of editable children, and a dropdown shows only when children exist. (Owner)
- [x] **Q3** Footer: the Figma look plus footer links, contact email and phone, the PNW service area, and social links, all from Sanity. (Owner)
- [x] **Q4** Header scroll: hide on scroll down, show on scroll up. (Owner)
- [x] **Q5** Mobile menu: a full-height side sheet (modal dialog). (Owner)
- [x] **Q6** Social links use small hand-drawn inline SVG icons with visually hidden names (no icon package). (Owner)
- [x] **Q7** Seed the proposed nav (Home, Services with the six Figma service children at `/services/<slug>`, About, Contact; footer links Services, About, Contact) and CTA "Book Appointment" → `/contact`. Contact: kelly.gibbens@wyeast.studio, (503) 583-2805, "Portland, Oregon and the Pacific Northwest". No social URLs yet. (Owner)
