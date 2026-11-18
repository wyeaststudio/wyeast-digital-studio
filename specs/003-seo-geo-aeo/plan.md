# 003 — SEO, GEO, and AEO system: Plan

**Status:** Approved (2026-11-17) · **Spec:** [spec.md](./spec.md)

## Approach

Build the system as **pure builders fed by typed loaders**, so almost everything can be unit-tested without Next.js or Sanity:

1. **Content:**
   - a `seo` object;
   - SEO and business fields on `siteSettings`;
   - a `faq` document and an `faqSection` object, with a limited `faqAnswer` rich-text type;
   - queries;
   - fault-tolerant loaders that strip stega and return `null` on error;
   - seed data.
2. **Builders** (`src/lib/seo/`): plain functions from content to output.
   - `buildMetadata()` returns a Next `Metadata` object.
   - `json-ld.ts` builds the `@graph` and the `BreadcrumbList` and `FAQPage` nodes.
   - `buildSitemap()` builds `MetadataRoute.Sitemap`.
   - `buildRobots()` builds `MetadataRoute.Robots`.
   - `buildLlmsTxt()` returns a string.
   - `resolveOgImage()` returns a URL, size, and alt text.

   One **routable type registry** (`routes.ts`) maps document types to paths. The sitemap, `llms.txt`, and the social card route all use it.
3. **Route wiring:** `generateMetadata` in the root layout and the home page; a `JsonLd` component in the layout; `sitemap.ts` and `robots.ts` rewritten as thin wrappers; and new `llms.txt` and social card route handlers.
4. **FAQ UI:** a presentational `FaqSection` with native `<details>`/`<summary>` and a shared `RichText` (Portable Text) component, shown on the temporary home page with `FAQPage` JSON-LD.
5. **Cleanup:** remove `site-config.ts`, `structured-data.tsx`, the placeholder OG and Twitter images, and the template env variables.

### Docs consulted

**Bundled Next 16.2:**
- `04-functions/generate-metadata.md`:
  - metadata is merged **shallowly**, so nested objects such as `openGraph` are replaced whole (SEO-R3);
  - file-based metadata has priority over `generateMetadata`. That is why per-page social images are **not** `opengraph-image.tsx` files: an uploaded override could never win.
  - With `cacheComponents`, metadata that depends on external data must come from cached functions. `sanityFetch` already uses `'use cache'`.
- `03-file-conventions/01-metadata/sitemap.md`: `sitemap.js` is a cached route handler; `generateSitemaps` exists for over 50,000 URLs (not needed).
- `robots.md`.
- `04-functions/image-response.md`:
  - only `ttf`, `otf`, and `woff` fonts are supported, loaded with `readFile`;
  - there is a 500 KB bundle limit;
  - Satori supports flexbox only.
- `02-guides/json-ld.md`: render a native `<script type="application/ld+json">`, and escape `<` as `\u003c`.

**Sanity:**
- `stegaClean` is exported from `next-sanity`.
- Portable Text annotations; `@sanity/image-url` for hotspot crops.

Both will be confirmed against the current v6 docs during implementation.

## Constitution check

| Principle | How this plan complies |
| --- | --- |
| §2 Brand, tokens | The FAQ uses `bg-primary`, `text-primary-foreground`, and the existing type tokens. The social card is the one place raw colors are needed, because Satori can't read CSS variables. Its palette is a small constant, and a unit test asserts it equals the light-theme `--primary`/`--primary-foreground` values in `globals.css`. |
| §3 Stack | No new packages enter the lockfile. Two existing transitive packages become direct dependencies (see Dependencies). Everything else is server output, and the FAQ uses native HTML (no client JS). |
| §3.1 Presentational components | `FaqSection`, `RichText`, and `JsonLd` take typed props derived from TypeGen query results. Loaders and builders hold the logic. |
| §4 Content model | A reusable `seo` object, FAQ documents, singleton fields, `defineQuery`, TypeGen types, and stega (Visual Editing) on FAQ and settings strings. |
| §5 Accessibility | Native disclosure, 44 px summaries, a focus ring visible on `primary`, one `h2` per section, plain-language answers, reduced motion, and link purpose rules reused from 002. |
| §6 Performance | No added client JS. Social cards are separate cached requests that the page never loads. JSON-LD is a few hundred bytes. |
| §7 SEO/GEO/AEO | This feature is the implementation of §7. |
| §8 Security | Escaped JSON-LD; the social card text comes from content looked up by path, never from the request; links are validated in answers; no new origins, so no CSP change (Sanity CDN images already match `img-src https:`). |
| §10 Cost | Reuses `sanityFetch`, `isValidHref`, `siteLink`'s validation message, the axe helper, `tokens.test.ts`, and the seed workflow. Builders are small pure modules, cheap to test. |

## Sanity schema

```
src/sanity/schemas/
  objects/seo.ts               # seo object (SEO-R7)
  objects/faq-answer.ts        # limited Portable Text array type (SEO-R21)
  objects/faq-section.ts       # eyebrow, heading, intro, faqs[] -> faq (SEO-R19)
  documents/faq.ts             # question, answer (SEO-R19)
  singletons/site-settings.ts  # + groups and SEO/business fields (SEO-R1, R10)
src/sanity/validation.ts       # + seoTitleWarning, seoDescriptionWarning, uniqueRefs
src/sanity/structure.ts        # + "FAQs" list item
```

### `seo` (object)

| Field | Type | Validation |
| --- | --- | --- |
| `title` | `string` | Optional; falls back to the document title. Warning when over 60 characters. |
| `description` | `string` (text, 3 rows) | Warning when missing or outside 70–160 characters |
| `ogImage` | `image` with `hotspot: true` and an `alt` string field | `alt` is required when an image is set |
| `noindex` | `boolean`, title "Hide from search engines" | Initial value `false` |

The warnings come from pure helpers in `validation.ts`, so they can be unit-tested. Every routable type from 004 adds `defineField({ name: 'seo', type: 'seo', group: 'seo' })`.

### `siteSettings` additions

Fields are grouped as **General** (existing fields) and **SEO and business**:

| Field | Type | Validation |
| --- | --- | --- |
| `homeTitle` | `string` | Required; warning when over 60 characters |
| `defaultDescription` | `text` | Required; warning outside 70–160 characters |
| `defaultOgImage` | `image` with hotspot and `alt` | Optional; `alt` is required when an image is set |
| `businessDescription` | `text` | Required, max 300 characters. Used for the `ProfessionalService.description` and the `llms.txt` blockquote. |
| `addressLocality` | `string` | Optional (seed: "Portland") |
| `addressRegion` | `string` | Optional, two letters (seed: "OR") |
| `areaServed` | `array` of `string` | Max 6 (seed: "Portland, Oregon", "Pacific Northwest") |

The site name, email, phone, and social links already exist and are reused. The country is fixed to `US` in code.

### `faq` (document)

| Field | Type | Validation |
| --- | --- | --- |
| `question` | `string` | Required, max 120 characters, must end with "?" (warning) |
| `answer` | `faqAnswer` | Required |

Preview: the question. The Studio structure adds an "FAQs" list after the singletons. FAQs are not routable: no slug and no SEO object.

### `faqAnswer` (array type)

A Portable Text `block` limited to:
- styles: `normal` only;
- lists: `bullet` and `number`;
- decorators: `strong` and `em`;
- one annotation, `link` (`href` string validated with `isValidHref` and `HREF_ERROR`).

No images or custom blocks. The annotation can be named `link` here because it is local to this array type and doesn't clash with `siteLink`.

### `faqSection` (object)

| Field | Type | Validation |
| --- | --- | --- |
| `eyebrow` | `string` | Optional, max 24 characters (Figma: "FAQ") |
| `heading` | `string` | Required, max 80 characters |
| `intro` | `text` | Optional, max 240 characters |
| `faqs` | `array` of `reference` → `faq` | 1–12 items, unique references (`uniqueRefs` helper) |

004 adds `faqSection` to the page builder. In 003 it is registered in the schema but used only by the temporary home page wiring, which uses its projection shape.

### Seed data

`sanity/seed/seo.json` contains:
- the six FAQ documents, using the Figma questions and placeholder answers (spec Q8). Each answer starts with "Placeholder:" so it can't be mistaken for final copy;
- a `siteSettings` **patch** for the new fields.

The new documents are applied with `npx sanity documents create sanity/seed/seo.json --missing`. Because `siteSettings` already exists, its new fields are entered in Studio. Never apply the full seed with `--replace`, which would overwrite edited FAQs as well as site settings.

## GROQ queries

In `src/sanity/queries.ts`:

```ts
export const SITE_SEO_QUERY = defineQuery(`*[_type == "siteSettings" && _id == "siteSettings"][0]{
  _updatedAt, siteName, email, phone, homeTitle, defaultDescription, businessDescription,
  addressLocality, addressRegion, areaServed, serviceArea,
  "defaultOgImage": defaultOgImage{ asset, hotspot, crop, alt },
  socialLinks[]{ platform, url }
}`);

// Every published, indexable routable document (SEO-R14, R17). $types comes from the registry.
export const ROUTABLE_DOCS_QUERY = defineQuery(`*[_type in $types && defined(slug.current) && seo.noindex != true]{
  _type, "slug": slug.current, _updatedAt,
  "title": coalesce(seo.title, title), "description": seo.description
}`);

// Social card lookup for one path (SEO-R9).
export const OG_DOC_QUERY = defineQuery(`*[_type == $type && slug.current == $slug && seo.noindex != true][0]{
  "title": coalesce(seo.title, title)
}`);

// Shared projection that 004's page-builder query will reuse.
export const FAQ_PROJECTION = `_id, question, answer`;

// Temporary until 005 (SEO-R23).
export const HOME_FAQS_QUERY = defineQuery(`*[_type == "faq" && defined(question)] | order(_createdAt asc)[0...12]{ _id, question, answer }`);
```

TypeGen can't type a string fragment, so `FAQ_PROJECTION` is interpolated as a constant inside each `defineQuery` template, which TypeGen supports. Confirmed in T2: TypeGen evaluates the interpolated constant and types `HOME_FAQS_QUERY` correctly.

### Loaders (`src/sanity/loaders/seo.ts`)

| Loader | Query | Cache tags | On error |
| --- | --- | --- | --- |
| `getSiteSeo({ publishedOnly? })` | `SITE_SEO_QUERY` | `siteSettings` | `null` and log |
| `getRoutableDocs()` | `ROUTABLE_DOCS_QUERY` with `types = routableTypes()` | `siteSettings`, plus each registered type | `[]` and log |
| `getOgTitle(type, slug)` | `OG_DOC_QUERY` | `type`, `type:slug` | `null` |
| `getHomeFaqs()` | `HOME_FAQS_QUERY` | `faq` | `[]` |

Each loader runs `stegaClean` over its result before returning it (SEO-R6). The FAQ loader is the exception: the FAQ **component** receives stega strings so Visual Editing works, and only the **JSON-LD builder** cleans them.

For SEO-R9, the social card route calls `getSiteSeo({ publishedOnly: true })`, and `getOgTitle` always uses `sanityFetchPublished`. This helper caches the published client's results with the same tags and lifetime, without reading draft mode or using an authenticated draft client. Other settings callers and FAQ previews remain draft-aware. If settings are missing or unavailable, fallback cards use `Cache-Control: no-store` so recovery cannot leave fallback artwork cached at a published title's versioned URL.

**Cache-tag map (SEO-R15).** The webhook revalidates `<_type>` and `<_type>:<slug>`.

| Output | Refreshed by tags |
| --- | --- |
| Page metadata | `siteSettings`, plus the page's type and slug |
| Site JSON-LD | `siteSettings` |
| Sitemap and `llms.txt` | `siteSettings` and every registered type |
| Social card URL in metadata | Same as page metadata; the URL carries a content hash (below) |
| Home FAQ section and `FAQPage` | `faq` |

## Builders (`src/lib/seo/`)

| File | Exports | Notes |
| --- | --- | --- |
| `site.ts` | `SITE_URL`, `SITE_DEFAULTS`, `absoluteUrl(path)`, `isIndexableDeployment()` | `SITE_URL` comes from `NEXT_PUBLIC_SITE_URL` with the trailing slash removed. The defaults hold the Wy'east name, home title, description, and business description (SEO-R1). `isIndexableDeployment()` is false only for `VERCEL_ENV` `preview` or `development` (SEO-R5). |
| `routes.ts` | `ROUTES`, `routableTypes()`, `pathFor(type, slug)`, `resolvePath(path)` | The registry maps each `_type` to a URL prefix (path = prefix + slug). It is an empty object in 003, and 004 to 010 add entries such as `landingPage: '/'` or `service: '/services/'`; the most specific prefix wins when resolving. `resolvePath` reverses a path to `{ type, slug }`, or to `home`, for the social card route. |
| `metadata.ts` | `buildMetadata({ settings, page, path, indexable })` | Returns a complete `Metadata` with `metadataBase`, title (absolute on the home page, otherwise `{title} \| {siteName}`), description, `alternates.canonical`, full `openGraph`, full `twitter` (with `site` from the X social link if there is one), and `robots` (noindex if `page.seo.noindex` or the deployment isn't indexable). |
| `og.ts` | `resolveOgImage({ title, siteName, path, seoImage, defaultImage })`, `OG_SIZE`, `OG_PALETTE` | For an upload, it returns a `@sanity/image-url` URL cropped to 1200×630 from the hotspot, `fm=png` or `jpg`, with the editor's alt text. Otherwise it returns `/og{path}?v={hash}`, where `hash` is a short FNV-1a hash of the title and site name, so link previews and the CDN pick up title changes. The alt text is "{title}, {siteName}". |
| `json-ld.ts` | `siteGraph(settings)`, `breadcrumbList(items)`, `faqPage(faqs)`, `serializeJsonLd(data)` | Minimal hand-written types (no `schema-dts` dependency). The `@id` values are `{SITE_URL}/#business` and `{SITE_URL}/#website`. A `compact()` helper removes empty values. `faqPage` uses `toPlainText(answer)` and `stegaClean`. `serializeJsonLd` uses `JSON.stringify` and replaces `<` with `\u003c` (SEO-R12). |
| `sitemap.ts` | `buildSitemap(docs, settingsUpdatedAt)` | The home page first (priority 1), then the documents through `pathFor`. |
| `robots.ts` | `AI_TRAINING_AGENTS`, `buildRobots({ indexable })` | See the robots policy below. |
| `llms-txt.ts` | `buildLlmsTxt({ settings, docs })` | The format follows spec SEO-R17. Markdown special characters in titles are escaped. |

### Robots policy (SEO-R16, Q6)

```
User-agent: GPTBot, Google-Extended, Applebot-Extended, ClaudeBot, anthropic-ai,
            CCBot, Bytespider, meta-externalagent, cohere-training-data-crawler
Disallow: /

User-agent: *
Allow: /
Disallow: /studio
Disallow: /api/

Sitemap: {SITE_URL}/sitemap.xml
```

**How the two groups work:**
- A crawler obeys only the most specific group that matches it.
- Search engines (Googlebot, Bingbot, DuckDuckBot, Applebot) and AI search and answer agents (OAI-SearchBot, ChatGPT-User, PerplexityBot, Perplexity-User, Claude-SearchBot, Claude-User) fall through to `*`, so they are allowed. Listing them separately would add nothing except the risk of forgetting the `/studio` disallow.
- `AI_TRAINING_AGENTS` is the single source of truth. A short comment in `robots.ts` explains the policy and notes that blocking `Google-Extended` does **not** affect Google Search or AI Overviews.
- On a non-indexable deployment, the output is `User-agent: *` / `Disallow: /`.
- The agent list is checked against current vendor docs during implementation.

## Routes and components

| File | Server/Client | Purpose |
| --- | --- | --- |
| `src/app/(web)/layout.tsx` | Server | Replaces the static `metadata` with `generateMetadata()` → `buildMetadata({ path: '/' … })` for the site defaults, and swaps `StructuredData` for `<JsonLd data={siteGraph(settings)} />` |
| `src/app/(web)/page.tsx` | Server | Gets `generateMetadata()` (home: absolute title, canonical `/`); renders `FaqSection` from `getHomeFaqs()` with the Figma heading and intro hard-coded (temporary, SEO-R23) and `<JsonLd data={faqPage(faqs)} />` when there are FAQs |
| `src/app/(web)/not-found.tsx` | Server | Unchanged apart from inheriting the new defaults; it keeps `noindex` |
| `src/app/sitemap.ts` | Server | `buildSitemap(await getRoutableDocs(), …)` |
| `src/app/robots.ts` | Server | `buildRobots({ indexable: isIndexableDeployment() })` |
| `src/app/llms.txt/route.ts` | Server (route handler) | `GET` returns `buildLlmsTxt()` with `Content-Type: text/plain; charset=utf-8` |
| `src/app/og/[[...path]]/route.tsx` | Server (route handler, Node runtime) | Resolves the path through the registry using published content only (home uses `homeTitle`); returns 404 for unknown or noindex paths; renders `ImageResponse` 1200×630 with the brand mark, title, and site name; sets `Cache-Control: public, max-age=86400, s-maxage=31536000, immutable` for loaded settings and `no-store` for fallback artwork |
| `src/app/og/fonts/*.ttf` | Asset | Playfair Display Regular and Montserrat Alternates Medium (OFL 1.1, licence file included), Latin subset, under 200 KB in total |
| `src/components/seo/json-ld.tsx` | Server | `<JsonLd data />` renders the script using `serializeJsonLd` |
| `src/components/sections/faq-section.tsx` | Server | Presentational. Splits the items into two columns in DOM order: the first half, then the second, which matches Figma and keeps the reading order. Each item is `details > summary + div`. The summary has `min-h-11`, a `list-none` marker, and a `ChevronDown` that rotates with `motion-safe:transition-transform` on `[open]`. The section has `aria-labelledby` pointing to its heading. |
| `src/components/rich-text/rich-text.tsx` | Server | Portable Text renderer with the limited marks; links go through `SiteLink` from 002, so external `rel` handling is reused. 004 will reuse it. |
| `src/components/seo/structured-data.tsx`, `src/lib/site-config.ts`, `src/app/(web)/opengraph-image.tsx`, `src/app/(web)/twitter-image.tsx` | — | Deleted (SEO-R25) |
| `public/brand/logo.png` | Asset | A 512×512 raster export of the brand lockup from Figma, used as the `ProfessionalService` logo, because Google's logo guidelines expect a raster image of at least 112 px |

**The FAQ uses native `<details>`/`<summary>` and not the Base UI Accordion:**
- it adds zero client JS;
- answers are always in the HTML;
- browsers support find-in-page opening;
- assistive technology announces the expanded state natively;
- in 002, Base UI focus guards failed axe.

The trade-off is that questions aren't headings, because a heading inside `summary` is unreliable in assistive technology. Each section still has its `h2`, and `FAQPage` JSON-LD carries the question semantics for engines.

## Dependencies

Approved by the owner (2026-11-17). No new packages enter the lockfile. Two packages that are already installed as `next-sanity` dependencies become **direct** dependencies, because importing transitive packages is fragile:

| Package | Version (already locked) | Why |
| --- | --- | --- |
| `@portabletext/react` | ^6.2.0 | Renders FAQ answers (`PortableText`) and supplies `toPlainText` for JSON-LD. `next-sanity` v13 no longer re-exports `PortableText`. 004's rich-text block reuses it. |
| `@sanity/image-url` | ^2.1.1 | Builds hotspot-cropped 1200×630 URLs for uploaded social images. `next-sanity/image` exposes only the `Image` component and loader, not a URL builder. 004+ needs it for section images. |

## Environment variables

**Removed** (SEO-R25, approved by the owner on 2026-11-17), from `env.example`, the README, and the code:
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_SITE_TITLE`
- `NEXT_PUBLIC_SITE_DESCRIPTION`
- `NEXT_PUBLIC_SITE_KEYWORDS`
- `NEXT_PUBLIC_TWITTER_HANDLE`
- `NEXT_PUBLIC_LINKEDIN_URL`

**Read but not added:** `VERCEL_ENV` is set automatically by Vercel. `env.example` gets a comment explaining that preview deployments are `noindex`.

**Kept:** `NEXT_PUBLIC_SITE_URL`. Its example value becomes `https://wyeast.studio` and its comment notes that it is the canonical origin. The production value is confirmed in 011.

## Testing strategy

| Requirement | Vitest | Playwright |
| --- | --- | --- |
| R1, R2, R3, R4, R5 | `metadata.test.ts`: fallbacks with `null` settings, the title template, an absolute canonical URL, complete OG and Twitter objects, the noindex paths, and the env matrix | `seo.spec.ts`: head tags on `/`; no "Agency Template" in the HTML |
| R6 | Each builder test includes a stega-encoded fixture (made with `stegaEncodeSourceMap`, or with the zero-width characters directly) | — |
| R7, R19, R21 | `validation.test.ts`: the length warnings at their boundaries, `uniqueRefs`, and the `faqAnswer` link href | — |
| R8, R9 | `og.test.ts`: upload vs. generated, the alt text, and the hash changes with the title; a palette-to-token equality test in `tokens.test.ts`; fetch/loader/route regressions for published-only data and uncached fallback artwork | `seo.spec.ts`: `/og` returns 1200×630 PNG independently of an uploaded metadata image; `?title=x` is ignored; `/og/nope` returns 404; `draft-mode.spec.ts`: preview cookies do not change social cards |
| R10, R11, R12, R13 | `json-ld.test.ts`: the graph, omitted empty fields, the breadcrumb, the FAQ page with plain-text answers, and `</script>` escaping | `seo.spec.ts`: parse every `ld+json` script on `/`; `FAQPage` names equal the visible summaries |
| R14, R16, R17, R18 | `sitemap.test.ts`, `robots.test.ts` (with a ~15-line matcher that applies the specific-group-wins rule to check that `OAI-SearchBot` and `Googlebot` are allowed and `GPTBot` is disallowed), `llms-txt.test.ts`, and loader tests (`null` or `[]` on a rejected fetch) | `seo.spec.ts`: `/sitemap.xml`, `/robots.txt`, `/llms.txt` (status, content type, key lines) |
| R20, R22, R23 | `faq-section.test.tsx` and `rich-text.test.tsx` with fixtures | `faq.spec.ts`: keyboard toggle, 44 px summaries, axe on `/` in light and dark, reduced motion |
| R15, R24 | — | Manual (UX review) |
| R25 | — | The build and `tsc` pass with the variables unset; the existing e2e tests still pass |

Lighthouse CI already runs against `/`, and the FAQ section is now part of `/`, so the existing budgets cover it.

## Risks and alternatives considered

- **`FAQPage` rich results.** Google restricted FAQ rich results to authoritative government and health sites in 2023. It is kept for GEO and AEO and because Bing still uses it; the spec records this so nobody expects Google snippets.
- **Native `details` vs. the APG accordion (heading plus button).**
  - *Rejected:* the APG pattern needs a client island and `hidden="until-found"` handling.
  - *Revisit if:* VoiceOver testing in the UX review shows the native disclosure falls short.
- **Social cards as `opengraph-image.tsx` files.**
  - *Rejected:* file-based metadata overrides `generateMetadata`, so an uploaded image could never win (Q5). It would also need one file per route template.
- **Social card route with `?title=` text.**
  - *Rejected:* anyone could mint branded images with arbitrary text (SEO-R9). The path lookup costs one cached query.
- **CDN caching of cards.** The URL carries a content hash, so the CDN can cache forever and title changes produce a new URL. Social platforms cache by URL anyway.
- **`ImageResponse` with `cacheComponents`.** If the route handler can't be prerendered or cached as described, it falls back to dynamic rendering with the same `Cache-Control` header. That is acceptable because the CDN absorbs repeat requests.
- **Raw colors in the social card.** This is a justified exception to §2; it is limited to `og.ts` and guarded by a token-equality test.
- **Seeding `siteSettings` fields.** `documents create --missing` won't touch an existing document. The README directs editors to Studio for existing settings and warns that full-seed replacement also overwrites FAQ edits.
- **Crawler names change over time.** The training-bot list is one constant, tested and commented with its sources, and 011 re-checks it before launch.
