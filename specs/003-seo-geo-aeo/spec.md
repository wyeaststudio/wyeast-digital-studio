# 003 — SEO, GEO, and AEO system: Spec

**Status:** Approved (2026-11-17) · **Owner:** Wy'east Digital Studio · **Figma:** [FAQ section (desktop)](https://www.figma.com/design/uLqdLLfDDSL83X11ea41Wt/Wy-east-Digital-Studio?node-id=81-269), [FAQ Section Mobile](https://www.figma.com/design/uLqdLLfDDSL83X11ea41Wt/Wy-east-Digital-Studio?node-id=79-423)

## Summary

The site has to be found before it can convert. Search engines (SEO), generative engines such as ChatGPT and Perplexity (GEO), and answer engines and AI overviews (AEO) all rely on the same signals:
- accurate per-page metadata;
- structured data that describes the business;
- a sitemap;
- a clear crawler policy;
- `llms.txt`;
- content written as direct answers to real questions.

This feature builds that system once, as editor-controlled content and pure, tested builders. Every page from 004 to 010 then gets correct metadata, social cards, structured data, and a sitemap entry by registering itself. It also adds the FAQ block from the Figma Home page, which is the site's main AEO content pattern. The feature serves constitution §1.3 (discoverability) directly and §1.2 (demonstrating craft), because it is the kind of work the studio sells.

Today the site still carries template defaults ("Agency Template" social cards, environment-variable titles and keywords, and a robots allowlist that has no effect). This feature replaces them.

## Users and scenarios

- **Searcher:** finds the studio on Google or Bing for "accessible web design Portland". The result shows a page-specific title and description, and links to the canonical URL.
- **AI assistant user:** asks ChatGPT, Perplexity, or Claude "who builds accessible websites for small businesses in Oregon?". The assistant's search crawler has read the site, `llms.txt`, and the structured data, so it can describe and cite the studio accurately.
- **Person sharing a link:** pastes a page URL into LinkedIn, Slack, or iMessage and sees a branded card with the page title.
- **Visitor with a question:** reads the FAQ on the home page. They expand a question with mouse, keyboard, or screen reader and get a short, plain-language answer.
- **Content editor:**
  - sets a page's SEO title, description, social image, and "hide from search engines";
  - edits the site-wide SEO defaults and business details;
  - writes an FAQ once and reuses it on several pages.
  Changes appear on the live site, in the sitemap, and in `llms.txt` after publishing.

## Requirements (EARS)

### Site defaults and page metadata

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| SEO-R1 | THE SYSTEM SHALL take site-wide SEO defaults from the `siteSettings` singleton: the home page title, the default meta description, and the business details used in structured data. IF a value is missing or Sanity is unreachable, THEN THE SYSTEM SHALL fall back to Wy'east Digital Studio defaults defined in code. No "Agency Template" text SHALL remain anywhere in the site. | - Vitest: the defaults builder returns the Wy'east fallbacks when given `null` settings<br>- A repo search finds no "Agency Template" in `src/`, `env.example`, or the generated HTML of `/` |
| SEO-R2 | THE SYSTEM SHALL give every page metadata built by one shared, pure builder:<br>- a title in the form "{page title} \| {site name}" (the home page uses its full title on its own);<br>- a meta description;<br>- an absolute canonical URL from `NEXT_PUBLIC_SITE_URL` and the page path, with no query string or trailing slash;<br>- complete Open Graph tags (title, description, url, site name, `en_US` locale, type, and a 1200×630 image with alt text);<br>- a Twitter `summary_large_image` card. | - Vitest: given fixtures, the builder returns each field and absolute URLs<br>- Playwright on `/`: `title`, `meta[name=description]`, `link[rel=canonical]`, `og:title`, `og:image`, `og:image:alt`, and `twitter:card` are present and correct |
| SEO-R3 | Because Next.js merges metadata between segments shallowly, THE SYSTEM SHALL always output whole `openGraph`, `twitter`, and `robots` objects for a page, never partial ones that would drop inherited fields. | - Vitest: page-level output contains `openGraph.siteName`, `openGraph.locale`, and `openGraph.images`, even when the page sets only a title |
| SEO-R4 | WHERE a document's "Hide from search engines" (`seo.noindex`) is on, THE SYSTEM SHALL render `noindex, follow` for that page and SHALL leave it out of the sitemap and `llms.txt`. | - Vitest: the builder sets `robots.index=false`; the sitemap and `llms.txt` builders skip the document |
| SEO-R5 | WHILE the site runs on a non-production Vercel deployment (`VERCEL_ENV` is `preview` or `development`), THE SYSTEM SHALL mark every page `noindex` and SHALL serve a `robots.txt` that disallows all crawling. Local builds (no `VERCEL_ENV`) behave like production so that Lighthouse SEO can be measured. | - Vitest: `robots()` and the metadata builder with `VERCEL_ENV=preview` disallow and noindex everything; with `production` or unset, they don't |
| SEO-R6 | THE SYSTEM SHALL strip Sanity stega (Visual Editing) encoding from every value used in metadata, JSON-LD, the sitemap, `llms.txt`, and social images, so draft mode can never leak invisible characters into them. | - Vitest: each builder, given stega-encoded fixture strings, outputs clean strings |
| SEO-R7 | THE SYSTEM SHALL provide a reusable `seo` field group for routable documents (title, description, social image, hide from search engines), with editor guidance: a warning when the title is over 60 characters or the description is outside 70–160 characters, and required alt text on the social image. | - Vitest: the length-check helpers return warnings at the boundaries<br>- Manual: warnings show in the Studio |

### Social share images

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| SEO-R8 | THE SYSTEM SHALL serve an auto-generated 1200×630 PNG social card for every indexable page. It shows the page title and the site name in the brand fonts and colors. WHERE an editor uploads a social image for the page (or a default in site settings), THE SYSTEM SHALL use it instead, cropped to 1200×630 from its hotspot. | - Playwright: the `og:image` URL for `/` returns `200`, `image/png`, and 1200×630<br>- Vitest: the builder picks the upload over the generated card, and its alt text over the generated "{title}, {site name}" alt |
| SEO-R9 | THE SYSTEM SHALL resolve social card text only from published content for a known path, never from query strings or other request input. IF the path isn't a known indexable page, THEN the card route SHALL return 404. | - Playwright: `?title=anything` is ignored; an unknown path returns 404 |

### Structured data (JSON-LD)

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| SEO-R10 | THE SYSTEM SHALL output on every page one JSON-LD `@graph` with:<br>- a `ProfessionalService` node for the studio: name, URL, logo, description, email, telephone, address with locality and region only (Portland, OR, US; no street), `areaServed`, and `sameAs` social URLs;<br>- a `WebSite` node that references the business as its publisher.<br>Both are built from `siteSettings`, empty properties are omitted, and the nodes cross-reference each other by `@id`. | - Vitest: the builder output matches the fixture, and empty fields are omitted<br>- Playwright on `/`: the script parses as JSON and contains both types<br>- Manual: the Schema Markup Validator reports no errors |
| SEO-R11 | THE SYSTEM SHALL provide pure, typed JSON-LD builders for `BreadcrumbList` and `FAQPage` that later features can use. | - Vitest: each builder's output for fixtures, with absolute URLs |
| SEO-R12 | THE SYSTEM SHALL serialize JSON-LD safely: `<` is escaped as `\u003c`, so content can't close the script element. | - Vitest: a name containing `</script>` is serialized without a literal `<` |
| SEO-R13 | THE SYSTEM SHALL output structured data only for content that is visible on the page. In particular, `FAQPage` lists exactly the questions and answers rendered in that page's FAQ section. | - Playwright on `/`: the `FAQPage` question names equal the visible FAQ questions |

### Sitemap and robots

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| SEO-R14 | THE SYSTEM SHALL generate `/sitemap.xml` from content: the home page plus every published, indexable routable document, each with its absolute URL and `lastModified` from its last update. Routable types SHALL be registered in one place, so that adding a type in 004–010 means adding one entry. | - Vitest: fixture documents map to the right URLs; noindex documents are skipped<br>- Playwright: `GET /sitemap.xml` returns `200` XML containing the home URL |
| SEO-R15 | WHEN an editor publishes, changes, or unpublishes a routable document, an FAQ, or the site settings, THE SYSTEM SHALL refresh the affected pages' metadata, the sitemap, `llms.txt`, and social cards through the existing webhook's cache tags (FOUND-R23), with no redeploy. | - The plan maps each output to its cache tags<br>- Manual: publish a change and see it in `/sitemap.xml` and `/llms.txt` |
| SEO-R16 | THE SYSTEM SHALL serve a `robots.txt` that follows an explicit, documented policy (owner decision Q6):<br>- search engines and AI search or answer crawlers are allowed;<br>- crawlers used only to train AI models are disallowed;<br>- `/studio` and `/api/` are disallowed for everyone;<br>- the file links to the sitemap.<br>The crawler lists SHALL have no duplicates. | - Vitest: `robots()` output matches the policy (for example, `OAI-SearchBot` is allowed and `GPTBot` is disallowed), with no duplicate agents<br>- Playwright: `GET /robots.txt` returns `200` and lists the sitemap URL |

### `llms.txt`

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| SEO-R17 | THE SYSTEM SHALL serve `/llms.txt` as Markdown following the [llmstxt.org](https://llmstxt.org) format:<br>- an `h1` with the site name;<br>- a blockquote summary;<br>- a short paragraph with the service area and contact details;<br>- a "Pages" section listing each indexable page as `[title](absolute URL): description`.<br>It is built from the same content and registry as the sitemap. | - Vitest: the builder output for fixtures<br>- Playwright: `GET /llms.txt` returns `200`, `text/plain; charset=utf-8`, and starts with `# ` |
| SEO-R18 | IF Sanity is unreachable, THEN THE SYSTEM SHALL still serve the sitemap, `robots.txt`, `llms.txt`, page metadata, and the site JSON-LD using the code defaults (home page only), and SHALL NOT return a 5xx error. | - Vitest: each loader returns `null` on fetch error, and each builder handles `null` |

### FAQ

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| SEO-R19 | THE SYSTEM SHALL provide reusable `faq` documents (a question, plus an answer in limited rich text) and an FAQ section field group (an optional eyebrow, a required heading, an optional intro, and 1–12 unique references to FAQs). Editors write a question once and reuse it on several pages. | - Vitest: the schema validation helpers (question length and unique references)<br>- Manual: the Studio lists "FAQs", and a section picks FAQs by reference |
| SEO-R20 | THE SYSTEM SHALL render the FAQ section to match the Figma FAQ frames on the `primary` surface:<br>- eyebrow badge, `h2` heading, and intro;<br>- the questions as collapsible items (one column on mobile, two columns from the desktop breakpoint);<br>- every item collapsed by default.<br>Each question SHALL be a native disclosure that works with Enter and Space, announces its expanded state, has a target at least 44 px tall, and has a focus indicator with at least 3:1 contrast against the surface. Answers SHALL be in the server-rendered HTML. | - Vitest with fixtures: heading, intro, and items render in order; items are collapsed; answers are in the markup<br>- Playwright: a question opens with the keyboard; axe passes in light and dark; each summary is ≥ 44 px tall |
| SEO-R21 | THE SYSTEM SHALL render answers from limited rich text: paragraphs, bold, italic, bullet and numbered lists, and links. Links use the existing link validation (`/path` or `https://`), and external links open with `rel="noopener noreferrer"`. The `FAQPage` JSON-LD SHALL use the plain-text version of each answer. | - Vitest: rich text renders with the allowed marks only; the JSON-LD answer is plain text; an invalid link href is rejected by validation |
| SEO-R22 | WHILE the visitor prefers reduced motion, THE SYSTEM SHALL open and close FAQ items without animation. | - Covered by the global FOUND-R9 rule; Playwright under `reducedMotion: 'reduce'` checks the computed `transition-duration` ≈ 0 for any animated part |
| SEO-R23 | THE SYSTEM SHALL show an FAQ section on the temporary home page, filled from the seeded FAQ documents, with `FAQPage` JSON-LD, so the block can be tested end to end before 004 and 005 place it properly (owner decision Q3). 005 replaces this wiring. | - Playwright on `/`: an `h2` "Frequently Asked Questions" and the seeded questions are visible; one question opens; JSON-LD contains `FAQPage` |
| SEO-R24 | WHERE draft mode is enabled, THE SYSTEM SHALL make FAQ questions, answers, the section heading, and the site SEO defaults click-to-edit in the Presentation tool. | - Manual: in Presentation, clicking a question focuses its field in the FAQ document |

### Cleanup

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| SEO-R25 | THE SYSTEM SHALL remove the template SEO configuration that Sanity now replaces:<br>- the `NEXT_PUBLIC_SITE_NAME`, `_TITLE`, `_DESCRIPTION`, `_KEYWORDS`, `NEXT_PUBLIC_TWITTER_HANDLE`, and `NEXT_PUBLIC_LINKEDIN_URL` variables;<br>- the `keywords` meta tag, which search engines ignore;<br>- the placeholder `opengraph-image.tsx` and `twitter-image.tsx` files.<br>`NEXT_PUBLIC_SITE_URL` stays as the canonical origin. | - `env.example` and the README list only the variables still used<br>- `tsc` and the build pass with the variables unset |

## Content model (Sanity)

The plan defines the schema. Editors need:

- **SEO** (a reusable field group for every routable document from 004 onward): SEO title, meta description, social image (with alt text), and "Hide from search engines".
- **Site settings → SEO and business** (added to the existing singleton):
  - home page title;
  - default meta description;
  - default social image (optional);
  - business description, for structured data and `llms.txt`;
  - locality (Portland) and region (OR);
  - areas served, for example "Portland, Oregon" and "Pacific Northwest".

  The existing email, phone, service area, and social links are reused.
- **FAQ** (document): question; answer (limited rich text).
- **FAQ section** (field group used by pages and, in 004, the page builder): eyebrow, heading, intro, and a list of FAQ references.

## Non-functional requirements

- The constitution applies in full. Lighthouse 100 in all four categories (mobile and desktop) on `/` with the FAQ section, and axe with zero violations in both themes.
- **No client JavaScript is added.** Metadata, JSON-LD, the sitemap, `robots.txt`, and `llms.txt` are server output, and the FAQ disclosure uses native HTML.
- Social card generation must not affect page performance. Cards are generated per request to the card URL, cached, and never fetched by the page itself.
- Structured data must validate in the Schema Markup Validator and Google's Rich Results Test with no errors. Google now shows FAQ rich results only for a small set of authoritative sites, so `FAQPage` is kept for answer and generative engines rather than for Google rich snippets.

## UX review checklist

- [ ] The FAQ section matches the Figma FAQ frames at 375, 768, 1280, and 1920 px, in light (sage) and dark (mustard) modes
- [ ] Keyboard-only: Tab reaches each question; Enter and Space toggle it; the focus indicator is clearly visible on the `primary` surface
- [ ] Screen reader (VoiceOver on macOS and iOS): the section heading is announced as level 2; each question is announced as collapsed or expanded; links in answers have meaningful names
- [ ] FAQ answers read as short, direct, plain-language answers in the brand voice
- [ ] Pasting the home URL into a link-preview tool (LinkedIn Post Inspector or opengraph.xyz) shows the branded card, title, and description
- [ ] The social card is legible and on-brand at thumbnail size
- [ ] `/robots.txt`, `/sitemap.xml`, and `/llms.txt` read correctly
- [ ] The Schema Markup Validator and the Rich Results Test show no errors for `/`
- [ ] Studio: the SEO fields show length warnings; FAQs can be created and picked in a section; site settings show the SEO and business fields
- [ ] Presentation tool: clicking an FAQ question focuses its field

## Out of scope

- `Service` and `Person` JSON-LD builders, which arrive with the content they describe (006 Services and 008 About)
- Visible breadcrumb navigation. 003 ships only the `BreadcrumbList` builder; 006 decides whether to show breadcrumbs.
- Adding the FAQ section to the page builder (004) and placing it on the real home page (005)
- `llms-full.txt` (owner decision Q7); it can be added once there is real page content
- Search Console and Bing Webmaster verification, analytics, and redirects (011)
- Editor tools such as SERP previews or SEO scoring plugins
- Internationalisation and `hreflang` (the site is English only)
- More than one social card design

## Open questions

- [x] **Q1** FAQs are reusable `faq` documents that sections reference, rather than inline items. (Owner, 2026-11-17)
- [x] **Q2** FAQ answers use limited rich text: paragraphs, bold and italic, links, and bullet and numbered lists. (Owner)
- [x] **Q3** 003 shows the seeded FAQs on the temporary home page so they can be tested end to end. (Owner)
- [x] **Q4** Structured data gives the locality and region (Portland, OR) plus areas served, with no street address. (Owner)
- [x] **Q5** Social cards are auto-generated per page and branded, with an optional uploaded override per page and a site-wide default. (Owner)
- [x] **Q6** Crawler policy: allow search engines and AI search and answer bots; block AI training-only bots. (Owner)
- [x] **Q7** Publish `llms.txt` only, not `llms-full.txt`. (Owner)
- [x] **Q8** FAQ copy hasn't been decided yet, so the seed uses **placeholder** answers for the six Figma questions. Each answer is marked as a placeholder in its text. (Owner, 2026-11-17)
- [x] **Q9** The business description is a placeholder for now, using the proposed wording. (Owner)
- [x] **Q10** The home page title is a placeholder for now: "Wy'east Digital Studio | Accessible Websites in Portland, OR". (Owner)

All placeholder copy is listed in `sanity/seed/seo.json` and must be replaced before launch (checked in 011).
