# AGENTS.md

Guidance for AI coding agents (Codex, Claude Code, others) working in this repository.
Read this first, then `docs/CHANGELOG.md` for the full history of what has been built.

## What this is

The Shopify theme for **TRIIIPLE Studio / First Layer**, a Singapore premium menswear brand
(underwear and basics). The base theme is **Broadcast**. Everything custom is layered on top of it.

| | |
|---|---|
| Store | `wfnvkf-y1.myshopify.com` (primary domain `www.triiiplestudio.com`) |
| Repo | `starhaohao/EddieWanxh` |
| Default branch | `claude/shopify-lookbook-mobile-pqCEU`. This is the main branch despite its name. Every PR merges here. |
| Shopify sync | This branch is connected to a Shopify theme through the Shopify GitHub integration. Commits by `shopify[bot]` titled "Update from Shopify for theme …" are edits made in the Theme Editor and synced back. |

`.github/workflows/shopify-theme-deploy.yml` runs `shopify theme push` only on pushes to `main`/`master`, not the
default branch. Don't push theme files to those branches unless the owner wants a deploy.

Theme IDs at the time of writing. Theme IDs change, so verify them in Shopify Admin → Online Store → Themes.
- Live theme: **"Live + editorial sections (review)"**, `177247682583`
- Review draft, unpublished: **"Homepage split + editorial banners (review)"**, `177251713047`

## Hard rules

1. **Never publish a theme.** Work on unpublished or draft themes only. The owner publishes.
2. **Do not change global typography or global CSS.** Reuse the theme's type classes and tokens (below).
3. **Do not modify product or collection templates** unless the owner explicitly asks.
4. **Do not alter the bilingual product-description functionality.**
5. **Preserve existing homepage sections** unless explicitly told otherwise.
6. **Build new features as independent sections** so they can be added, edited and reordered in the Theme Editor.
7. **One agent per branch.** Create your own branch per task and merge via PR. Never push to a branch another agent is working on.
8. Never hardcode image URLs. Use `{{ image | image_url: width: … | image_tag }}`.

## Repo layout

```
layout/theme.liquid   Root HTML shell (header/footer groups, social sticky bar, Klaviyo, scroll logic)
sections/             Section components (Liquid + scoped <style> + {% schema %})
blocks/               Theme blocks
snippets/             Shared partials
templates/            JSON page templates (index.json = homepage)
config/               settings_schema.json, settings_data.json, markets.json
locales/              Translations (no comment headers allowed in these JSON files)
assets/               theme.css, JS, images
emails/               Shopify notification email templates
hydrogen-starter/     Hydrogen / React Router storefront (Oxygen deploy), separate from the Liquid theme
tiktok-sync/          Shopify → TikTok Shop product sync script
scripts/              Utility scripts (e.g. product image renaming)
docs/                 Handoff docs, rules, CHANGELOG
```

## Section conventions

```liquid
<section class="xx section-padding color-{{ section.settings.color_scheme }}"
         style="--PT: {{ s.padding_top }}px; --PB: {{ s.padding_bottom }}px;">
  …
</section>
<style>
  #Section--{{ section.id }} .xx__thing { … }        /* scope every rule */
  @media only screen and (max-width: 749px) { … }    /* mobile */
</style>
{% schema %} … {% endschema %}
```

- **Short unique class prefix** per section (e.g. `bde`, `etb`, `teh`), and scope styles to `#…--{{ section.id }}`.
- **Pass settings to CSS as custom properties** on the element, not interpolated into rules.
- **Breakpoints:** mobile ≤ 749px, tablet 750–989px, desktop ≥ 990px.
- **Vanilla JS only.**
- **Template JSON** needs both `blocks` and `block_order` updated when adding blocks.

### Theme tokens to reuse (do not invent new fonts or sizes)

| Purpose | Use |
|---|---|
| Page margins | `var(--outer)`: 32px desktop / 22px tablet / 20px mobile |
| Gutter | `var(--gutter)`: 32 / 22 / 16px |
| Full-bleed inside a padded section | `margin: 0 var(--outer-offset)` |
| Vertical spacing | `.section-padding` + `--PT` / `--PB` / `--PT-MOBILE` (mobile scales ×0.6) |
| Labels / eyebrows | `.subheading` |
| Headings | `.hero__title` + `heading-x-small`/`heading-small`/`heading-medium`/`heading-large` |
| Body text | `.hero__rte` + `body-x-small`/`body-small`/`body-medium`/`body-large` |
| Colours | `.color-{scheme}` gives `--text`, `--bg`, `--bg-accent` |

### Shopify schema gotchas (each one has broken an upload before)

- Section `name` and preset `name` must be **≤ 25 characters**.
- Keep select option **labels short**. Long labels were silently rejected.
- **No duplicate setting IDs.** For example, `b2_text` used as both a text setting and a colour setting broke a section.
- Don't `assign block = …` inside sections. Use another variable name (e.g. `panel`).
- `{{ }}` inside a filter argument string does not interpolate. Build the string with `assign … | append:` first.
- Liquid evaluates mixed `and`/`or` **right to left** with no parentheses. Compute a boolean in a `{%- liquid -%}` block instead.
- A container query does not apply to the element that declares the container. Put `container-type` on the parent.
- `themeFilesUpsert` with a **URL** body fails *silently* on validation errors (job returns, file never appears). Use a **TEXT** body to get the error message back.

## Development workflow

There is no build step or test suite for the Liquid theme.

```bash
shopify theme dev  --store=wfnvkf-y1.myshopify.com     # local preview with hot reload
shopify theme push --store=wfnvkf-y1.myshopify.com --unpublished   # push to a new draft, never --live
shopify theme check                                     # lint (schema, img dims, unused vars)
```

1. Branch from `claude/shopify-lookbook-mobile-pqCEU`.
2. Edit, preview at 375 / 390 / 430 / 768 / 1440 / 1920px, and check there is no horizontal scroll.
3. Upload to an **unpublished** theme for owner review.
4. Open a PR into `claude/shopify-lookbook-mobile-pqCEU`. Record notable changes in `docs/CHANGELOG.md`.

## Current homepage (draft theme `177251713047`, `templates/index.json`)

1. `triiiple_editorial_home`, Show part = Top (category blocks)
2. `editorial_two_banners` (Briefs / Boxer Trunks, collection pickers)
3. `triiiple_editorial_home_bottom`, Show part = Bottom
4. `triiiple_newsletter`

`brand-definition-editorial` ("Brand definition banner") is installed but not yet placed. The owner adds it via
Theme Editor → Add section.

## Other docs

- `docs/CHANGELOG.md`: everything built so far, by date and PR
- `CLAUDE.md`: original architecture notes
- `docs/PRODUCT-UPLOAD-RULES.md`, `docs/pdp-details-linking.md`, `docs/metaobject-mutations.graphql`: product data and metaobjects
- `MARGIN-LINE-AUDIT.md`, `META-PIXEL-MIGRATION.md`, `EMAIL-SETUP.md`, `SHOPIFY-AUTOMATION-SETUP.md`: topic handoffs
