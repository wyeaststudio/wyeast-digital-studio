# 001 — Foundation: Spec

**Status:** Approved (amended 2026-11-16: R1 AAA colors, R14 same-origin framing, R24 added; T3 color nudges, semantic darkened, sidebar excluded. Owner approved.) · **Owner:** Wy'east Digital Studio · **Figma:** [Desktop - 1440px - Light](https://www.figma.com/design/uLqdLLfDDSL83X11ea41Wt/Wy-east-Digital-Studio?node-id=10-13)

## Summary

Before any page is built, set up the design system, theming, content tooling, and quality gates that every later feature relies on. When this is done, an agent can build any page with the brand tokens and fonts, edit it visually in Sanity, and prove it meets the constitution (§5, §6, §9) with automated checks.

## Users and scenarios

- **Developer or AI agent:** runs one command to verify a task meets the Definition of Done.
- **Content editor:** opens `/studio`, uses the Presentation tool, clicks an element on a draft page, and edits it.
- **Site visitor:** sees the site in their OS color scheme, can switch themes, and gets readable brand typography with no layout shift or theme flash.

## Requirements (EARS)

### Design tokens and typography

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| FOUND-R1 | THE SYSTEM SHALL use the Figma values for light-mode `foreground` (#2E2924) and `muted` (#D9D6CC), adjust these colors so every text/background token pair reaches **≥ 7:1 (AAA)**, and keep every other color from the Wy'east tokens. Adjusted colors (final, with a rounding margin, T3): `primary` light #434945, `primary`/`ring` dark #D1AF43, `accent` (both modes) and `ring` light #2A4D50, `muted-foreground` light #3D4042 and dark #CDCBC4, `destructive` light #733429 and dark #73352C, `semantic-background` light #585756. Opaque hover tokens (PR #1 review): `primary-hover` light #343936 and dark #D8BB60, `destructive-hover` light #5C2A21 and dark #5D2B24. Filled button variants must use opaque token pairs (no translucent `bg-*/NN` fills) so the 7:1 test covers them. Sidebar tokens are excluded because the site has no sidebar. | - `globals.css` contains the OKLCH equivalents with hex comments<br>- An automated contrast test (FOUND-R24) passes |
| FOUND-R2 | THE SYSTEM SHALL expose these Figma variables as Tailwind tokens: `border-accent` (#626D65 at 50%), shadow scale `shadow-sm` (0 1 3 0 / 10%), `shadow` (0 4 16 0 / 12%), and `shadow-lg` (0 8 32 −4 / 8%), `--navbar-height` (64 px), and backdrop blur (24 px). | - Classes `border-border-accent`, `shadow-sm`/`shadow`/`shadow-lg`, `h-(--navbar-height)`, and `backdrop-blur-(--blur-backdrop)` compile<br>- Vitest snapshot or a CSS assertion confirms the values |
| FOUND-R3 | THE SYSTEM SHALL load **Montserrat Alternates** (400, 500, 700) as `font-sans` and **Playfair Display** (400, 700) as `font-serif`/`font-heading` with `next/font`, self-hosted, Latin subset. | - Headings render in Playfair Display and body text in Montserrat Alternates<br>- No request goes to `fonts.googleapis.com` at runtime<br>- CLS is 0 from font loading |
| FOUND-R4 | THE SYSTEM SHALL provide a type scale that matches the Figma text styles (xs 12/16, sm 14/20, base 16/24, lg 18/28, xl 20/28, 4xl 36/40) through Tailwind defaults, adding custom utilities only where Figma differs. | - Each Figma text style maps to a documented utility combination in the plan |
| FOUND-R5 | THE SYSTEM SHALL use radius values only from the token scale (xs 2, sm 6, md 8, lg 10, xl 14, 2xl 18, 3xl 22, 4xl 26, full). The Figma `radius/sm` and `radius/lg` variables are treated as legacy. | - No arbitrary `rounded-[…]` values appear in components |

### Theming

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| FOUND-R6 | WHEN a visitor first arrives, THE SYSTEM SHALL use the theme that matches their OS `prefers-color-scheme`. | - Playwright with `colorScheme: 'dark'` renders `html.dark`, and with `'light'` it does not |
| FOUND-R7 | WHEN a visitor activates the theme toggle, THE SYSTEM SHALL switch between light and dark, persist the choice, and apply it on later visits with no flash of the wrong theme. | - The choice survives a reload<br>- No flash of the wrong theme occurs (an inline script sets the class before paint) |
| FOUND-R8 | THE SYSTEM SHALL provide a presentational `ThemeToggle` component with an accessible name that reflects the current state, a 44×44 px target, and a visible focus ring. Header placement belongs to spec 002. | - axe passes<br>- It works with Enter and Space<br>- The screen reader announces e.g. "Switch to dark theme" |
| FOUND-R9 | WHILE the user prefers reduced motion, THE SYSTEM SHALL turn off non-essential transitions and animations globally. | - Under `reducedMotion: 'reduce'` in Playwright, computed `transition-duration` and `animation-duration` are ≈ 0 |

### Sanity content tooling

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| FOUND-R10 | THE SYSTEM SHALL organize schema types under `src/sanity/schemas/` with an index export, replacing the inline schema in `sanity.config.ts`. | - Studio loads with no schema errors |
| FOUND-R11 | THE SYSTEM SHALL generate TypeScript types for the schema and all `defineQuery` queries with Sanity TypeGen through `npm run typegen`. | - `npm run typegen` produces `sanity.types.ts`<br>- A sample query result type is used in a page with no `any` |
| FOUND-R12 | WHERE draft mode is enabled, THE SYSTEM SHALL render draft content with stega-encoded click-to-edit overlays (Visual Editing). | - Opening a page in the Studio Presentation tool shows overlays, and clicking one focuses the field |
| FOUND-R13 | THE SYSTEM SHALL provide draft-mode enable and disable routes that are secured with Sanity's preview-URL secret validation. | - Requests without a valid secret return 401 or a redirect<br>- The disable route clears draft mode |
| FOUND-R14 | THE SYSTEM SHALL allow framing only by the same origin (`X-Frame-Options: SAMEORIGIN`, `frame-ancestors 'self'`) so the embedded Studio's Presentation tool can preview the site, and SHALL block framing by any other origin. | - The Presentation tool iframe loads<br>- Responses send SAMEORIGIN and `frame-ancestors 'self'` |
| FOUND-R15 | IF Sanity environment variables are missing in production, THEN THE SYSTEM SHALL fail the build with a clear error message. | - The existing `assertValue` behavior is kept and extended to the read-token variable |

### Quality toolchain

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| FOUND-R16 | THE SYSTEM SHALL run unit and component tests with **Vitest** and React Testing Library through `npm run test`. | - A sample test for `ThemeToggle` passes |
| FOUND-R17 | THE SYSTEM SHALL run end-to-end tests with **Playwright** (Chromium, WebKit, and Firefox, plus mobile viewport 375 px) through `npm run test:e2e`, against a production build. | - The theme tests pass in all browsers |
| FOUND-R18 | THE SYSTEM SHALL provide an axe helper (`@axe-core/playwright`, tags `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`) that every e2e page test calls in light and dark mode. | - The home page has 0 violations in both modes |
| FOUND-R19 | THE SYSTEM SHALL run **Lighthouse CI** against a production build through `npm run test:lh`, asserting a score of 100 in Performance, Accessibility, Best Practices, and SEO on mobile and desktop. | - The command fails if any category is below 100 |
| FOUND-R20 | THE SYSTEM SHALL provide `npm run typecheck` and `npm run check`, which runs lint, typecheck, unit tests, build, e2e, and Lighthouse in order. | - `npm run check` passes on a clean checkout |
| FOUND-R21 | THE SYSTEM SHALL provide a UX review script that captures full-page screenshots of the given routes at 375, 768, 1280, and 1920 px in light and dark mode into `specs/<feature>/review/screenshots/`. | - The script outputs 8 PNGs per route |
| FOUND-R22 | WHEN a pull request is opened or updated, THE SYSTEM SHALL run `npm run check` in GitHub Actions and block merging if it fails. | - The workflow is in `.github/workflows/check.yml`<br>- A failing test marks the PR check red |


### Content freshness

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| FOUND-R23 | THE SYSTEM SHALL fetch published content with cache tags, and WHEN Sanity sends a signed webhook on publish or unpublish, THE SYSTEM SHALL revalidate the affected tags. | - A route at `/api/revalidate` validates the webhook signature (`SANITY_REVALIDATE_SECRET`)<br>- An invalid signature returns 401<br>- After publishing, the change appears on the next request |
| FOUND-R24 | THE SYSTEM SHALL verify in a unit test that every `*-foreground`/surface token pair in both themes has a contrast ratio of at least 7:1. | - The test reads the token values from `globals.css` and fails if any pair is below 7:1 |

## Content model (Sanity)

No editor-facing content is added in this feature. Moving the placeholder `page` type into `schemas/` is just a restructure, and spec 004 replaces it.

## Non-functional requirements

- The constitution applies in full. Reaching Lighthouse 100 on the existing placeholder home page is the baseline for this feature.
- Toolchain packages are dev-only, except `next-themes` (already installed) and the Sanity Visual Editing packages bundled with `next-sanity`.

## UX review checklist

- [ ] Home placeholder renders in both fonts at 375, 768, 1280, and 1920 px
- [ ] Light and dark modes match the Figma colors and look correct on a quick visual check
- [ ] Theme toggle: keyboard-operable, visible focus, accessible name updates
- [ ] No theme flash on reload (tested with throttled CPU)
- [ ] Presentation tool: overlays appear and click-to-edit works

## Out of scope

- Header, footer, and navigation (002)
- SEO object and structured data from Sanity (003)
- Page-builder blocks (004)
- Zustand: added only when a feature first needs shared client state
- Analytics (011)

## Open questions

- [x] **Q1** Dark mode: keep the dark values from the tokens JSON.
- [x] **Q2** Use GitHub Actions to run `npm run check` on every PR (FOUND-R22).
- [x] **Q3** Use fetch plus on-demand revalidation through a Sanity webhook, not the Live Content API (FOUND-R23).
- [x] **Q4** Commit `sanity.types.ts` to git.
- [x] **Q5** Run Lighthouse CI against local production builds only.
