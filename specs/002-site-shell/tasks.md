# 002 — Site shell: Tasks

**Status:** Approved (2026-11-16) · **Plan:** [plan.md](./plan.md)

Run the tasks in order. Each is small and independently verifiable, and each lists the requirements it covers and how to verify it. While working, run only the task's own check. Run the full Definition of Done (constitution §9) once, in T14. Tasks marked _(lightweight model)_ are routine generation that can go to a cheaper model (constitution §10).

## Phase A — Content

- [x] **T1 — Link validation and object types** _(lightweight model)_
  Add `src/sanity/validation.ts` with `isValidHref()` (accepts `/path` and `https://…`; rejects bare words, `//host`, `http:`, `mailto:`, `javascript:`) and `src/sanity/validation.test.ts`. Add `schemas/objects/link.ts`, `nav-item.ts` (children are an inline `{ label, link }` object, so nesting stops at one level), and `social-link.ts`, with the validation from the plan.
  _Covers:_ SHELL-R21 · _Verify:_ `npm run test -- validation`

- [x] **T2 — Singletons and Studio structure**
  Add `schemas/singletons/site-settings.ts`, `navigation.ts`, and `index.ts` (`SINGLETON_TYPES`), and register every new type in `schemas/index.ts`. Add `src/sanity/structure.ts` (singletons first, then a divider, then other types without the singletons). In `sanity.config.ts`, pass the structure to `structureTool`, filter singleton templates out of `schema.templates`, and limit singleton `document.actions` to publish, discard changes, and restore. Check the v6 Structure Builder API in the current Sanity docs first.
  _Covers:_ SHELL-R20, R21 · _Verify:_ `npm run build`; in `npm run dev`, `/studio` shows "Site settings" and "Navigation" with no create, delete, or duplicate actions

- [x] **T3 — Shell query, TypeGen, and loader**
  Add `SHELL_QUERY` to `src/sanity/queries.ts` and run `npm run typegen` (commit `sanity.types.ts`). Add `src/sanity/loaders/shell.ts` (`getShell()` with the tags `siteSettings` and `navigation`; returns `null` and logs on error) and `shell.test.ts`, which mocks `sanityFetch` to reject and resolve.
  _Covers:_ SHELL-R22, R23 · _Verify:_ `npm run typegen && npm run typecheck && npm run test -- shell`
  - Task log: the query filters on `_type` as well as `_id` so TypeGen produces a single non-union result type. `@sanity/icons` v5 only exposes per-icon subpaths (`@sanity/icons/Cog`). `sanity schema validate` reports 0 errors and 0 warnings. The Studio's singleton UI is checked manually in the UX review.

## Phase B — Design system additions

- [x] **T4 — Tokens, header surface, and button accent variant**
  In `globals.css`, add `--accent-hover` (light and dark), `--header-surface-alpha`, `--header-offset` (1 rem, and 1.375 rem at `lg`), `--spacing-navbar-mobile` (3.5 rem), `html { scroll-padding-top: … }`, and the `.site-header[data-hidden="true"]` translate rule. Add the `accent` variant to `button.tsx`. Extend `tokens.test.ts` with: `accent-foreground` on `accent-hover` ≥ 7:1; `primary-foreground` vs `primary` ≥ 3:1; and `foreground` on the header surface blended over `background`, `card`, `muted`, `primary`, `accent`, and `foreground` ≥ 7:1 in both themes. Start the alpha at 90%, set it to the lowest value the test allows, and record that value in the plan.
  _Covers:_ SHELL-R7, R9, R10, R19 · _Verify:_ `npm run test -- tokens`
  - Task log: header alpha is 85% (light needs 80%, dark 85%; Figma's 45% fails). `--accent-hover` is #223F42 (8.73:1). The `primary-foreground` vs `primary` ring pair was already covered at 7:1, so no duplicate case. `button.test.ts` now covers the `accent` variant. 57/57 tests pass.

- [x] **T5 — Generated primitives and brand logo** _(lightweight model)_
  Run `npx shadcn add sheet navigation-menu toggle-group` and **decline** the `button.tsx` overwrite; confirm `git diff src/components/ui/button.tsx` shows only the T4 change. Export the Figma `Brand Logo` (31:5) and `footer-logo` (73:118) nodes as SVG with outlined text, and create `src/components/layout/brand-logo.tsx` (`BrandMark` and `BrandLockup`, using `currentColor` and `aria-hidden`).
  _Covers:_ SHELL-R3, R17 (assets) · _Verify:_ `npm run lint && npm run typecheck`
  - Task log: the `base-nova` registry installed an unrelated npm package named `cn` and imported from it. It was uninstalled and the imports were pointed at `@/lib/utils`, so `package.json` is unchanged. `button.tsx` was kept. The Figma header mark (31:5) is a raster image, so `BrandMark` reuses the lockup's vector arrow and mountain with a cropped viewBox. Path checksums match the Figma export.

## Phase C — Components (presentational first, with fixtures)

- [x] **T6 — Theme switch (replaces the 001 toggle)**
  Create `theme/theme-switch.tsx` (shadcn `ToggleGroup`, `aria-label="Theme"`, three `size-11` items named "Light theme", "System theme", and "Dark theme", plus a same-size placeholder while `value` is undefined) and `theme-switch-container.tsx` (`useTheme().theme` with the existing hydration guard). Delete `theme-toggle.tsx`, `theme-toggle-container.tsx`, and `theme-toggle.test.tsx`, and add `theme-switch.test.tsx`. Temporarily place `ThemeSwitchContainer` on the home page where the old toggle was, so the e2e tests keep working until T12. Rewrite the toggle cases in `e2e/theme.spec.ts` (choose Dark → persists after reload; System follows `colorScheme`; keyboard; no flash). Add an amendment note to the 001 spec status line saying FOUND-R8 is superseded by SHELL-R11.
  _Covers:_ SHELL-R11, R12 · _Verify:_ `npm run test -- theme-switch && npm run test:e2e -- theme`
  - Task log: before hydration, the switch renders the same three options disabled (rather than an empty placeholder), so the space is reserved and nothing shifts. Re-pressing the selected option is ignored, since Base UI would otherwise empty the group. The e2e helper opens the mobile menu when present, so the theme tests keep working after T12. 5/5 unit tests pass; e2e theme and home pass 26/26 (chromium, mobile-chromium).

- [ ] **T7 — Current-path helper, desktop nav, and header**
  Add `layout/is-current-path.ts` and its test (`/` exact match; segment prefix otherwise; parent marked when a child matches). Create `desktop-nav.tsx` (shadcn `NavigationMenu`, `nav[aria-label="Main"]`, hidden below `lg`, `aria-current`, a trigger plus a panel for items with children), `desktop-nav-container.tsx` (`usePathname`), and the presentational `site-header.tsx` (logo link named "Wy'east Digital Studio, home", the nav, the CTA as `buttonVariants({ variant: 'accent' })` at ≥ 44 px, a divider, and the theme switch). Pass every `href` through `stegaClean`. Add `site-header.test.tsx` and `desktop-nav.test.tsx` with fixtures, including `null` content.
  _Covers:_ SHELL-R3, R4, R5, R6, R7, R23 · _Verify:_ `npm run test -- is-current-path site-header desktop-nav`

- [ ] **T8 — Mobile menu**
  Create `layout/mobile-menu.tsx` (shadcn `Sheet` from the right; "Open menu" trigger at 44 px, visible below `lg`; `SheetTitle` "Menu"; nested link lists; the CTA; the theme switch; "Close menu"; calls `onOpenChange(false)` when a link is clicked) and `mobile-menu-container.tsx` (owns `open` and closes it when the pathname changes). Add it to `site-header.tsx`. Add `mobile-menu.test.tsx`.
  _Covers:_ SHELL-R13, R14, R15, R16 · _Verify:_ `npm run test -- mobile-menu`

- [ ] **T9 — Header visibility (hide on scroll down, show on scroll up)**
  Create `layout/use-header-visibility.ts` with a pure `nextVisibility(prevY, y, threshold)` and a passive, `requestAnimationFrame`-throttled scroll listener, and `header-visibility.tsx` (a client wrapper that sets `data-hidden` and keeps the header visible near the top, while `:focus-within`, and while a descendant has `aria-expanded="true"`). Add `use-header-visibility.test.ts` for the pure function.
  _Covers:_ SHELL-R8, R16 · _Verify:_ `npm run test -- use-header-visibility`

- [ ] **T10 — Footer and copyright year**
  Create `src/lib/copyright-year.ts` (`'use cache'`, `cacheLife('days')`) and the presentational `layout/site-footer.tsx`: `bg-primary text-primary-foreground`, `BrandLockup` linking home, `nav[aria-label="Footer"]`, an `<address>` with `mailto:`/`tel:` and the service area, social links as text with an `sr-only` "{site name} on" prefix, the copyright line, `focus-visible:outline-primary-foreground`, and nothing rendered for empty sections. Use `stegaClean` on hrefs. Add `site-footer.test.tsx`, including `null` content. Social links use small inline SVG icons (spec Q6) in `layout/social-icons.tsx`, `aria-hidden`, with the `sr-only` name carrying the link text.
  _Covers:_ SHELL-R17, R18, R19, R23 · _Verify:_ `npm run test -- site-footer`

## Phase D — Wiring and status pages

- [ ] **T11 — Status page, 404, and errors**
  Create `layout/status-page.tsx` (one `h1`, body, actions slot, top padding that clears the header). Add `(web)/not-found.tsx` (title "Page not found", `robots: { index: false }`, links to `/` and the CTA href, from `getShell()`), `(web)/[...notFound]/page.tsx` (calls `notFound()`), `(web)/error.tsx` ("Something went wrong", "Try again" → `unstable_retry`, home link, never renders `error.message`), and `src/app/global-error.tsx` (its own `html`/`body`, `globals.css`, fonts, `ThemeProvider`, React `<title>`). Add `error.test.tsx` and `global-error.test.tsx`.
  _Covers:_ SHELL-R24, R25, R26 · _Verify:_ `npm run test -- error && npm run build` (the build output lists the catch-all route)

- [ ] **T12 — Layout wiring and home page cleanup**
  In `(web)/layout.tsx`, call `getShell()` and `getCopyrightYear()`, then render the skip link (`focus:z-60`), `<HeaderVisibility><SiteHeader/></HeaderVisibility>`, `<main id="main-content" tabIndex={-1}>`, and `<SiteFooter/>`. Remove the `main` wrapper and the temporary `ThemeSwitchContainer` from `(web)/page.tsx`. Update `e2e/home.spec.ts` if it targets the old `main`.
  _Covers:_ SHELL-R1, R2, R22 · _Verify:_ `npm run build && npm run test:e2e -- home theme`

- [ ] **T13 — Shell end-to-end tests**
  Add `e2e/shell.spec.ts`: landmarks on `/` and `/this-does-not-exist`; the skip link is first and moves focus; `aria-current` on Home; the CTA is ≥ 44×44; the Services submenu works from the keyboard (desktop projects; skipped if the seed has no children); the header hides on scroll down, shows on scroll up, and shows when you Tab into it; focus isn't obscured after the skip link and on a footer link; the mobile sheet (375 px project) opens, traps focus, closes in all four ways, and returns focus; the sheet's transition under `reducedMotion: 'reduce'`; the 404 status, `h1`, and `noindex`; and `expectNoA11yViolations` on `/` and the 404 page in both themes, with the sheet open and with the submenu open.
  _Covers:_ SHELL-R1, R2, R5–R9, R13–R16, R19, R24 · _Verify:_ `npm run test:e2e -- shell`

- [ ] **T14 — Seed content and Definition of Done**
  Create `sanity/seed/shell.json` with the content confirmed in Q7, document `npx sanity documents create sanity/seed/shell.json --missing` in the README, and run it. Then run `npm run check` (lint, typecheck, unit, build, e2e, Lighthouse 100 on `/` for mobile and desktop).
  _Covers:_ all · _Verify:_ `npm run check` passes

## UX review

- [ ] AI review agent: `npm run build && npm run start`, then `npm run ux:screens 002-site-shell / /this-does-not-exist`; compare to the spec checklist and the Figma frames (`21:58`, `36:99`, `68:620`) → `review/findings.md`
- [ ] Manual: keyboard walkthrough, VoiceOver on macOS and iOS, 200% zoom with hide-on-scroll, and Presentation click-to-edit on a nav label and the footer email
- [ ] Fix blocking findings
- [ ] Owner sign-off
