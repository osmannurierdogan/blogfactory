# create-blogfactory

Reusable, config-driven brand website template (blog/content + newsletter + landing),
scaffolded via a CLI. First brand built on it:
[themodernstoic.co](https://themodernstoic.co).

Stack: Astro + TypeScript + Tailwind CSS, Notion-as-CMS via the Astro Content Layer API,
Vue 3 islands with shadcn-vue, Netlify hosting, Beehiiv newsletter.

## Scaffolding a new brand site

```sh
npx create-blogfactory
```

This asks for the brand name, tagline, domain, store URL, language, theme colors, and
fonts, then generates a new project directory with `src/config/brand.config.ts` and
`.env` pre-filled from your answers (everything else — Notion IDs, analytics IDs,
Beehiiv IDs — stays blank for you to fill in later). It optionally runs `git init` and
`pnpm install` for you.

Alternatively, run it from a local checkout of this repo without installing globally:

```sh
pnpm install
pnpm create   # runs bin/create-blogfactory.mjs directly
```

## Working on this repo directly (the reference site)

This repo is also a working Astro site on its own — that's how `themodernstoic.co` is
built and run. To develop it directly (rather than scaffolding a new project from it):

```sh
pnpm install
cp .env.example .env   # fill in PUBLIC_SITE_URL at minimum
pnpm dev
```

`PUBLIC_SITE_URL` is required — the build fails fast with a clear error if it's missing,
since canonical URLs, the sitemap, RSS feed, and `robots.txt`/`llms.txt` all depend on it.
All other `.env` values (Notion, analytics, Beehiiv) can stay empty — the `posts` and
`pages` collections just stay empty until their Notion databases are connected (see
`src/content.config.ts`). With `pages` empty, every route it would have generated
(`/about`, `/privacy-policy`, etc.) simply doesn't exist yet — there's no placeholder
fallback, since Notion is the single source of truth for these pages.

## Project structure

```text
bin/                       create-blogfactory CLI (scaffolds new projects from this template)
src/
  config/brand.config.ts   Single source of truth for brand values (colors, fonts, IDs)
  content.config.ts        Notion-as-CMS content collections: posts (blog) + pages (site pages)
  components/              Header, Footer, SEO, Analytics, NewsletterForm, CookieConsent
  layouts/BaseLayout.astro Shared page shell — injects brand theme + SEO + analytics
  lib/pages.ts             Reads the "pages" collection; getNavPages() powers Header/Footer
  pages/                   Routes: /, /blog, /blog/[slug], /newsletter (fixed) +
                           /[slug] (one per "pages" DB row, fully dynamic)
                           robots.txt.ts and llms.txt.ts are generated from brand.config.ts,
                           not static files
```

### Content model — Notion CMS schema

Two Notion databases feed the site, both read via `NOTION_API_KEY`. When setting up a new
brand, create both databases with **exactly these property names and types** — the loader
in `src/content.config.ts` matches Notion properties by name.

#### 1. Blog Posts (`NOTION_BLOG_POSTS_DATABASE_ID`)

Main content source for essays/blog posts.

| Property      | Type         | Options / Notes                                                                |
| :------------ | :----------- | :------------------------------------------------------------------------------ |
| `Title`       | Title        | Essay title                                                                      |
| `Slug`        | Text         | URL slug (e.g. `what-is-stoicism`) → route at `/blog/{Slug}`                     |
| `Status`      | Select       | `Draft`, `Review`, `Published` — only `Published` rows are fetched              |
| `PublishDate` | Date         | Publish date, used for sort order and `PublishedAt` metadata                     |
| `Excerpt`     | Text         | Short summary, also used as meta description                                    |
| `CoverImage`  | Files        | Cover image                                                                      |
| `Tags`        | Multi-select | Free-form (e.g. `Foundations`, `Virtues`, `Practices`, `Philosophers`, ...) — powers the `/blog?tag=` filter |
| *Content*     | Page body    | The essay itself (native Notion content)                                        |

To get the database ID: open the database as a full page in Notion, copy the ID from its
URL (`https://www.notion.so/<workspace>/<DATABASE_ID>?v=...`), and set it as
`NOTION_BLOG_POSTS_DATABASE_ID` in `.env`.

#### 2. Site Pages (`NOTION_SITE_PAGES_DATABASE_ID`)

Standalone pages (About, Privacy Policy, Cookie Policy, etc.) — a separate content source
so non-essay pages don't pollute the blog. Each `Published` row becomes a route at
`/{Slug}` (see `src/pages/[slug].astro`).

| Property          | Type      | Options / Notes                                                        |
| :---------------- | :-------- | :------------------------------------------------------------------------ |
| `Title`           | Title     | Page title                                                                 |
| `Slug`            | Text      | URL slug (e.g. `privacy-policy`) → route at `/privacy-policy`             |
| `Status`          | Select    | `Draft`, `Published` — only `Published` rows are fetched                 |
| `MetaDescription` | Text      | SEO meta description (optional)                                          |
| `Location`        | Select    | `Top Bar`, `Footer`, `Standalone` — where the page is linked from (optional) |
| *Content*         | Page body | The page itself (native Notion content)                                   |

`Location` decides where the page shows up in navigation (matched loosely — case and
wording variants like `Topbar`/`Top Bar` or `Direct Link`/`Standalone` all work, see
`src/lib/pages.ts`):

- **`Top Bar`** → shown in the header nav (`Header.astro`)
- **`Footer`** → shown in the footer nav (`Footer.astro`)
- **`Standalone`** (or left empty) → not linked from any nav, only reachable by URL
  (e.g. a `coming-soon` or custom `404` page)

Both collections fall back to an empty, non-crashing loader when their database ID/API
key isn't set yet. On `pages`, `MetaDescription` and `Location` are optional so a row
missing either one doesn't break the sync — but `Title` and `Slug` are always required.

## Brand-agnostic by design

No brand name, domain, or color is hardcoded anywhere in `src/` or `astro.config.mjs` —
every brand-specific value flows from exactly two places:

1. **`src/config/brand.config.ts`** — brand name, tagline, domain, theme colors/fonts,
   logo/favicon paths, social links, SEO defaults.
2. **`.env`** — secrets and per-environment values: `PUBLIC_SITE_URL`, Notion API
   key/database ID, analytics IDs (GA4/GTM/Meta Pixel), Beehiiv IDs.

Everything else — page copy structure, `robots.txt`, `llms.txt`, the sitemap, RSS feed,
JSON-LD, the Notion content schema — reads from those two sources at build time. To spin
up a new brand:

1. Run `npx create-blogfactory` (fills in `src/config/brand.config.ts` and `PUBLIC_SITE_URL`
   from your prompts) — or duplicate this repo manually and edit `brand.config.ts` yourself.
2. Create both Notion databases with the exact schema (see "Content model" above).
3. Fill in `.env` with the new brand's Notion, analytics, and Beehiiv IDs.
4. Deploy to Netlify and connect the domain.

No other files need to change.

## Commands

| Command             | Action                                                  |
| :------------------ | :------------------------------------------------------- |
| `pnpm dev`           | Start local dev server                                    |
| `pnpm build`         | Build production site to `./dist/`                        |
| `pnpm preview`       | Preview the production build locally                      |
| `pnpm astro check`   | Type-check `.astro` files and content config               |
| `pnpm create`        | Run the scaffolding CLI from this checkout (see above)     |
