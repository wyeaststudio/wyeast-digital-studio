# 002 — Site shell: Plan

**Status:** Approved (2026-11-16) · **Spec:** [spec.md](./spec.md)

## Approach

Build the shell in five layers, each verifiable on its own:

1. **Content:** a `link` object, `siteSettings` and `navigation` singleton schemas, Studio structure, one `SHELL_QUERY`, a fault-tolerant loader, and seed data.
2. **Presentational shell:** `SiteHeader`, `SiteFooter`, `BrandLogo`, `ThemeSwitch`, and `StatusPage`, all rendered from typed props with fixtures in Vitest.
3. **Interactive islands:** the header visibility wrapper (hide on scroll down, show on scroll up), the desktop submenu, the mobile sheet, and the theme switch container. These are the only client components.
4. **Layout wiring:** `(web)/layout.tsx` owns the skip link, `header`, `main`, and `footer`; the home page drops its own `main` and the temporary toggle.
5. **404 and error pages:** `not-found.tsx`, a catch-all route that calls `notFound()`, `error.tsx`, and `app/global-error.tsx`.

Docs consulted (bundled Next 16.2): `01-app/03-api-reference/03-file-conventions/not-found.md` (root `not-found` handles unmatched URLs only when there's a single root layout; with multiple root layouts, `global-not-found` is the experimental option; non-streamed `notFound()` responses return 404 and are auto-`noindex`), `error.md` (error boundaries are client components; use `unstable_retry()` to re-fetch and re-render; `error.js` doesn't wrap the layout in the same segment; `global-error.js` must render its own `<html>`/`<body>` and can't export `metadata`, so it uses React's `<title>`). Sanity: Structure Builder singleton pattern (`S.document().schemaType().documentId()`), filtering `schema.templates` and `document.actions` — confirm against the current v6 docs when implementing T2.

## Constitution check

| Principle | How this plan complies |
| --- | --- |
| §2 Brand, mobile-first | Base styles target 375 px (logo + hamburger); `lg:` adds the inline nav. Only tokens are used; the one Figma deviation (header surface opacity) is justified below and covered by a test. |
| §3 Stack | **No new runtime dependencies.** `sheet`, `navigation-menu`, and `toggle-group` are shadcn `base-nova` components backed by the installed `@base-ui/react`. |
| §3.1 Presentational components | `SiteHeader`, `SiteFooter`, `ThemeSwitch`, `StatusPage`, `DesktopNav`, and `MobileMenu` take typed props derived from `SHELL_QUERY_RESULT`. Containers own `usePathname`, `useTheme`, scroll state, and data fetching. |
| §4 Content model | Two singletons with fixed IDs, a shared `link` type with validation, `defineQuery` in `queries.ts`, TypeGen types, and Visual Editing through stega on string fields. |
| §5 Accessibility | Landmarks, a skip link, `aria-current`, a disclosure submenu, a modal sheet with focus trap and return, 44 px targets, Focus Not Obscured (2.4.11) through `scroll-padding-top`, AAA contrast on the translucent header and the footer, and reduced motion. |
| §6 Performance | Server-rendered links and footer; client JS only for four small islands; the logo is an inline SVG (no request); the shell data is cached with `cacheLife('max')` and tag revalidation. |
| §7 SEO/GEO/AEO | All nav and footer content is in the server HTML. The 404 page returns a real 404 status and `noindex`. |
| §8 Security | Link validation rejects anything except `/…` and `https://…` (no `javascript:`). External links get `rel="noopener noreferrer"`. No new origins, so no CSP change. |
| §10 Cost | Reuses `Button`, `sanityFetch`, the revalidate route, the axe helper, and `tokens.test.ts`. Small, file-scoped tasks follow in `tasks.md` after this plan is approved. |

## Sanity schema

```
src/sanity/schemas/
  index.ts                      # + link, navItem, socialLink, siteSettings, navigation
  objects/link.ts               # { href } with isValidHref validation
  objects/nav-item.ts           # { label, link?, children?: link-items[] }
  objects/social-link.ts        # { platform, url }
  singletons/site-settings.ts
  singletons/navigation.ts
  singletons/index.ts           # export const SINGLETON_TYPES = ['siteSettings', 'navigation']
src/sanity/validation.ts        # isValidHref(): pure, unit-tested (SHELL-R21)
src/sanity/structure.ts         # Structure Builder: singletons first, then other types
```

### `siteLink` (object)

> Implementation note (T1): named `siteLink` instead of `link` because `link` is Portable Text's default annotation name and would collide once 004 adds rich text. A `labelledLink` object (`{ label, link: siteLink }`) is shared by nav children, the header CTA, and footer links.

| Field | Type | Validation |
| --- | --- | --- |
| `href` | `string` | Required. `isValidHref`: matches `^/(?!/)` (internal path, not protocol-relative) or `^https://` followed by a parseable URL. Rejects `http:`, `javascript:`, `mailto:`, and bare words. |

`isValidHref` lives in `src/sanity/validation.ts` so Vitest can test it without Sanity.

### `navItem` (object)

| Field | Type | Validation |
| --- | --- | --- |
| `label` | `string` | Required, max 24 characters |
| `link` | `link` | Required unless `children` has items |
| `children` | `array` of an inline `{ label, link }` object (no `children` field, so nesting stops at one level) | Max 8 |

Preview: the label plus "(n items)" when it has children.

### `socialLink` (object)

| Field | Type | Validation |
| --- | --- | --- |
| `platform` | `string`, options list: LinkedIn, Instagram, Facebook, GitHub, YouTube, Bluesky, X | Required |
| `url` | `url` | Required, `https` scheme only |

### `siteSettings` (document, ID `siteSettings`)

| Field | Type | Validation |
| --- | --- | --- |
| `siteName` | `string` | Required. Used in the copyright line and social link names. |
| `email` | `string` | Optional, `Rule.email()` |
| `phone` | `string` | Optional. Display text; the `tel:` href strips everything but `+` and digits. Regex `^\+?[\d\s().-]{7,20}$`. |
| `serviceArea` | `string` | Optional, max 120 characters |
| `socialLinks` | `array` of `socialLink` | Max 8, unique platforms |

003 will add SEO-default fields to this same document.

### `navigation` (document, ID `navigation`)

| Field | Type | Validation |
| --- | --- | --- |
| `headerLinks` | `array` of `navItem` | Max 6 |
| `headerCta` | `{ label: string (max 24), link: link }` | Optional object; both fields are required if it's set |
| `footerLinks` | `array` of `{ label, link }` | Max 8 |

### Studio structure (SHELL-R20)

`sanity.config.ts`:

- `structureTool({ structure })` from `src/sanity/structure.ts`: "Site settings" and "Navigation" list items that open `S.document().schemaType(t).documentId(t)`, a divider, then `S.documentTypeListItems()` filtered to exclude the singleton types.
- `schema.templates`: filter out templates whose `schemaType` is a singleton (removes them from "Create new").
- `document.actions`: for singleton types, keep only `publish`, `discardChanges`, and `restore` (removes delete, duplicate, and unpublish).

### Seed data

`sanity/seed/shell.json` contains both singletons with the content agreed in spec Q7 (Home, Services with children from the Figma service cards, About, Contact, CTA "Book Appointment" → `/contact`). It's applied with:

```sh
npx sanity documents create sanity/seed/shell.json --missing
```

`--missing` never overwrites existing documents. The README documents this command.

## GROQ queries

In `src/sanity/queries.ts`:

```ts
export const SHELL_QUERY = defineQuery(`{
  "settings": *[_id == "siteSettings"][0]{ siteName, email, phone, serviceArea, socialLinks[]{ _key, platform, url } },
  "navigation": *[_id == "navigation"][0]{
    headerLinks[]{ _key, label, "href": link.href, children[]{ _key, label, "href": link.href } },
    headerCta{ label, "href": link.href },
    footerLinks[]{ _key, label, "href": link.href }
  }
}`);
```

One request covers both documents. Types come from `SHELL_QUERY_RESULT` (TypeGen).

### Loader (`src/sanity/loaders/shell.ts`) — SHELL-R22, SHELL-R23

```ts
export async function getShell(): Promise<SHELL_QUERY_RESULT | null> {
  try {
    return await sanityFetch({ query: SHELL_QUERY, tags: ['siteSettings', 'navigation'] });
  } catch (error) {
    console.error('Failed to load the site shell', error);
    return null;
  }
}
```

The existing webhook already revalidates by `_type`, so publishing either singleton refreshes the shell with no route changes.

**Stega and hrefs:** in draft mode, stega encodes strings for click-to-edit. Each `href` (and `url`, `email`, and `phone` when used in an `href`) passes through `stegaClean()` from `next-sanity` before it's used in an attribute, so links never contain invisible characters. Visible text keeps its stega encoding so overlays work.

## Routes and components

| File | Server/Client | Purpose |
| --- | --- | --- |
| `src/app/(web)/layout.tsx` | Server | Calls `getShell()`; renders the skip link, `<HeaderVisibility><SiteHeader …/></HeaderVisibility>`, `<main id="main-content" tabIndex={-1}>`, and `<SiteFooter …/>` |
| `src/app/(web)/page.tsx` | Server | Drops its `main` wrapper and the temporary `ThemeToggleContainer` |
| `src/app/(web)/not-found.tsx` | Server | `StatusPage` "Page not found" with links to `/` and the CTA href; `metadata` with `title: 'Page not found'` and `robots: { index: false }` |
| `src/app/(web)/[...notFound]/page.tsx` | Server | Calls `notFound()`, so unmatched URLs render `(web)/not-found.tsx` inside the shell. Static segments (`/studio`, `/api/*`) and future `[slug]` routes take precedence over a catch-all. |
| `src/app/(web)/error.tsx` | Client (required) | `StatusPage` "Something went wrong" with a "Try again" button (`unstable_retry`) and a home link. It never renders `error.message`. |
| `src/app/global-error.tsx` | Client (required) | Its own `<html>`/`<body>`, `globals.css`, the font variables, `ThemeProvider`, React `<title>`, and the same `StatusPage` content. No Sanity data. |
| `src/components/layout/site-header.tsx` | Server (presentational) | The pill: `BrandLogo` link, `DesktopNav`, CTA, `ThemeSwitchContainer`, and `MobileMenu`. Props: `{ navigation, siteName }`. |
| `src/components/layout/header-visibility.tsx` | Client | Wraps the header (children slot). Uses `useHeaderVisibility()` and sets `data-hidden`; a `.site-header[data-hidden="true"]` rule in `globals.css` applies `translate: 0 calc(-100% - var(--header-offset))` (kept in CSS to avoid an arbitrary-value class). Shows the header while `:focus-within`, while a descendant has `aria-expanded="true"`, or near the top. |
| `src/components/layout/use-header-visibility.ts` | Client hook | A passive `scroll` listener with `requestAnimationFrame`. Hides after scrolling down past `--spacing-navbar` with a delta > 8 px; shows on any upward delta > 8 px. Pure `nextVisibility(prevY, y, threshold)` is unit-tested. |
| `src/components/layout/desktop-nav.tsx` | Client | `nav[aria-label="Main"]`, hidden below `lg`. Uses shadcn `NavigationMenu` (Base UI): a plain link for items without children and a trigger plus a panel for items with children. Props: `{ items, currentPath }`. |
| `src/components/layout/desktop-nav-container.tsx` | Client | `usePathname()` → `currentPath` |
| `src/components/layout/mobile-menu.tsx` | Client | shadcn `Sheet` (Base UI `Dialog`) from the right. Trigger "Open menu" (44 px, `Menu` icon); `SheetTitle` "Menu"; nested link lists; CTA; `ThemeSwitchContainer`; "Close menu". Closes on link click. Props: `{ items, cta, currentPath, open, onOpenChange }`. |
| `src/components/layout/mobile-menu-container.tsx` | Client | Owns `open` with `useState` and closes it on `usePathname()` change |
| `src/components/layout/site-footer.tsx` | Server (presentational) | `bg-primary text-primary-foreground`: the logo lockup, `nav[aria-label="Footer"]`, `<address>` with `mailto:`/`tel:` and the service area, social links as inline SVG icons (`social-icons.tsx`, spec Q6) with an `sr-only` name "Wy'east Digital Studio on LinkedIn", and the copyright line. Sections without data render nothing. Props: `{ settings, links, year }`. |
| `src/components/layout/brand-logo.tsx` | Server | Inline SVG components `BrandMark` (header) and `BrandLockup` (footer), exported from the Figma `Brand Logo` (31:5) and `footer-logo` (73:118) nodes with text outlined, using `currentColor` so the tokens drive them in both themes. `aria-hidden`; the parent link carries the name. |
| `src/components/layout/is-current-path.ts` | Shared | Pure `isCurrentPath(href, currentPath)` and `itemIsCurrent(item, currentPath)`. Exact match for `/`; segment-prefix match otherwise. |
| `src/components/layout/status-page.tsx` | Server-safe (presentational) | Shared 404 and error layout: `h1`, body, and an actions slot. Top padding clears the floating header. |
| `src/components/theme/theme-switch.tsx` | Client (presentational) | Replaces `theme-toggle.tsx`. shadcn `ToggleGroup` (single select, `aria-label="Theme"`), items `Sun`/`Monitor`/`Moon` at `size-11`, each with `aria-label` "Light theme", "System theme", and "Dark theme", and `aria-pressed` on the selected item. Props: `{ value?: 'light' \| 'system' \| 'dark'; onChange }`. Renders a same-size placeholder while `value` is undefined. |
| `src/components/theme/theme-switch-container.tsx` | Client | Replaces `theme-toggle-container.tsx`: `useTheme()` → `theme` (not `resolvedTheme`) with the same hydration guard |
| `src/components/ui/{sheet,navigation-menu,toggle,toggle-group}.tsx` | Client | Generated by `npx shadcn add sheet navigation-menu toggle-group`. **Do not overwrite `button.tsx`** (001 customized it): answer "no" to the overwrite prompt, then check `git diff src/components/ui/button.tsx` is empty. |

### Styles and tokens (`globals.css`)

| Addition | Value | Why |
| --- | --- | --- |
| `--header-offset` | `1rem` (mobile), `1.375rem` at `lg` (Figma y = 22) | The pill floats below the viewport edge |
| `--spacing-navbar-mobile` | `3.5rem` (56 px) | Figma `mobile-navbar` height |
| `html { scroll-padding-top: calc(var(--spacing-navbar) + var(--header-offset) + 1rem) }` | — | SHELL-R9 (Focus Not Obscured, anchor targets) |
| `--accent-hover` | Light and dark values derived from `--accent` (#2A4D50), darkened until `accent-foreground` stays ≥ 7:1; added to `tokens.test.ts` pairs | The teal CTA needs an opaque hover state (FOUND-R1 rule) |
| Button `accent` variant | `bg-accent text-accent-foreground hover:bg-accent-hover` | The Figma "Book Appointment" teal. Added to `button.tsx` with a one-line change. |

**Header surface (SHELL-R10, Figma deviation):** Figma uses `background` at 45% with a 24 px blur. With dark content (for example the `primary` footer or a dark hero image) beneath it, 45% can't hold 7:1 for `foreground` text. The plan uses `bg-background/(--header-surface-alpha)` with `backdrop-blur-backdrop`, `border-border-accent`, `shadow-lg`, and `rounded-2xl` (16 px → the 18 px token, the nearest on the scale). `--header-surface-alpha` starts at 90%. A new case in `tokens.test.ts` alpha-blends `--background` over each surface token in both themes (`background`, `card`, `muted`, `primary`, `accent`, `foreground`) and asserts `foreground` ≥ 7:1, lowering the alpha only as far as the test allows. The final value is recorded here when T4 completes.

**Footer focus ring (SHELL-R19):** the `ring` token (#2A4D50 light) is too close to `primary` (#434945) to reach 3:1, so footer links use `focus-visible:outline-primary-foreground`. `tokens.test.ts` adds the pair `primary-foreground` vs `primary` ≥ 3:1 for non-text (it's already 7:1 for text).

### Breakpoints

| Width | Header | Footer |
| --- | --- | --- |
| < 1024 (`lg`) | Logo + "Open menu" button; 56 px; `mx-4` | Stacked, centered |
| ≥ 1024 | Logo, nav, CTA, divider, theme switch; 64 px; `max-w-300` (1200 px) centered | Centered logo; links, contact, and social in a row; copyright below |

The 768 px tablet uses the mobile header because the desktop row (four links, CTA, and three 44 px theme options) is about 720 px and doesn't fit with padding.

### Copyright year (SHELL-R18)

`getCopyrightYear()` in `src/lib/copyright-year.ts` is a `'use cache'` function with `cacheLife('days')`, so `new Date()` is allowed under `cacheComponents` and the year rolls over within a day of New Year without a redeploy. The layout passes `year` to `SiteFooter`.

### Effect on 001

- FOUND-R8 (`ThemeToggle`) is superseded by SHELL-R11. Delete `theme-toggle.tsx`, `theme-toggle-container.tsx`, and `theme-toggle.test.tsx`, and rewrite the FOUND-R6/R7/R8 cases in `e2e/theme.spec.ts` to use the switch ("Dark theme" etc.). Add an amendment note to the 001 spec status line.
- The existing skip link moves into the shell unchanged except for `focus:z-60` so it sits above the header.

## Dependencies

None. The shadcn components are generated source files that use the installed `@base-ui/react`, `lucide-react`, and `cn`.

## Environment variables

None.

## Testing strategy

| Requirement | Test |
| --- | --- |
| R1 | Playwright `e2e/shell.spec.ts`: one each of `banner`, `main`, and `contentinfo` on `/` and on `/this-does-not-exist` |
| R2 | Playwright: the first Tab focuses "Skip to content", it's visible, and Enter focuses `#main-content` |
| R3, R4, R5, R7 | Vitest `site-header.test.tsx` with fixtures: logo name, link order in `nav[aria-label="Main"]`, `aria-current`, CTA. `is-current-path.test.ts` covers `/` exact match, nested paths, and parents with children. Playwright: CTA ≥ 44×44. |
| R6 | Vitest `desktop-nav.test.tsx`: Enter/Space/click open, Escape closes and returns focus, `aria-expanded`. Playwright (desktop project): keyboard opens Services. |
| R8 | Vitest: `nextVisibility()` cases. Playwright: scroll down 600 → `data-hidden="true"`; scroll up → visible; Tab into the hidden header → visible. |
| R9 | Playwright: after skip-link activation and after tabbing to a footer link, the focused element's `top` ≥ the header's `bottom` |
| R10, R19 (ring) | `tokens.test.ts`: header-surface blend ≥ 7:1, `accent-foreground` on `accent-hover` ≥ 7:1, and `primary-foreground` vs `primary` ≥ 3:1 |
| R11 | Vitest `theme-switch.test.tsx`: three named options, the selected one has `aria-pressed="true"`, `onChange` value, placeholder size, ≥ 44 px classes |
| R12 | Playwright `e2e/theme.spec.ts` (rewritten): choose Dark → persists after reload; System follows `colorScheme`; no flash (existing DOMContentLoaded check) |
| R13–R16 | Vitest `mobile-menu.test.tsx`: dialog name, nested children, close callbacks. Playwright (375 px project): open → focus inside; Tab stays inside; Escape, "Close menu", the backdrop, and a link click each close it, and focus returns to "Open menu"; `reducedMotion: 'reduce'` → `transition-duration` ≈ 0 |
| R17–R19 | Vitest `site-footer.test.tsx`: the `address` contents, `mailto:`/`tel:` hrefs, social names, copyright text, and empty sections omitted |
| R20 | Manual (UX review): the Studio shows the singletons with no create, delete, or duplicate actions |
| R21 | Vitest `validation.test.ts`: `isValidHref` accepts `/about` and `https://x.com/a`; rejects `about`, `//evil.com`, `http://x.com`, `mailto:a@b.c`, and `javascript:alert(1)` |
| R22 | `npm run typegen` produces `SHELL_QUERY_RESULT`, used with no `any`. Manual: Presentation click-to-edit on a nav label. |
| R23 | Vitest `shell.test.ts`: `getShell()` returns `null` when `sanityFetch` rejects (mocked). `site-header`/`site-footer` tests render with `null` content. |
| R24 | Playwright: `GET /this-does-not-exist` → status 404, `h1` "Page not found", `meta[name=robots]` contains `noindex`, axe passes in light and dark. Lighthouse stays on `/` only, because it penalizes 404 responses by design (the shell itself is measured there). |
| R25, R26 | Vitest `error.test.tsx` and `global-error.test.tsx`: the heading, "Try again" calls `unstable_retry`, and a given `error.message` isn't in the output. The shared `StatusPage` layout is axe-checked through the 404 page. |
| All pages | `expectNoA11yViolations` on `/` and the 404 page, in both themes, at 375 px and desktop, plus once with the mobile sheet open and once with the Services submenu open |

UX review: `npm run ux:screens 002-site-shell / /this-does-not-exist`.

## Risks and alternatives considered

- **Catch-all 404 vs. `global-not-found`.** The app has two root layouts (`(web)` and `studio`), so a top-level `app/not-found.tsx` can't catch unmatched URLs. The catch-all `[...notFound]` route renders the 404 inside the shell with the cached header and footer. The risk is that a streamed response returns 200 instead of 404; the Playwright status check guards this. If it fails, fall back to `experimental.globalNotFound` with `app/global-not-found.tsx`, which must re-create the shell outside the `(web)` layout.
- **Header opacity differs from Figma (45% → ~90%).** This is required for 7:1 (SHELL-R10). The blur still gives the frosted look. Figma should be updated to match; the UX review will flag it.
- **The theme switch is wider than Figma** (three 44 px options, owner decision Q1). The pill's right side grows by about 50 px.
- **Hide-on-scroll can disorient** some users and screen-magnifier users. Mitigations: it always shows on focus, near the top, and with any upward scroll, and it doesn't slide under reduced motion. The UX review checks it with keyboard and zoom at 200%.
- **`NavigationMenu` opens on hover by default.** Hover-open with a close delay is fine for pointer users, but the trigger must still toggle on click and keyboard. If Base UI's hover behavior causes flicker in tests, set it to click-only.
- **Shadcn generation overwriting `button.tsx`** would drop the 001 AAA hover tokens. The task explicitly declines the overwrite and checks the diff.
- **Stega in hrefs** would break links in draft mode; `stegaClean` on every attribute value prevents it.
- **Social icons** are hand-drawn inline SVGs (spec Q6), so there's no icon package. Only the platforms in the `socialLink` options list get an icon.
- **Links to unbuilt pages** (Services, About, Contact) return 404 until 005–010 ship. That's acceptable before launch (011).
- **Alternative considered:** a single `siteSettings` document that also holds navigation. Rejected because the roadmap names two singletons, and keeping navigation separate keeps each editor form short and lets 003 grow `siteSettings` with SEO fields.
