# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A custom Shopify theme extension for **First Layer / TRIIIPLE Studio**, a Singapore-based premium menswear brand selling underwear and basics. The repo contains only the custom sections and templates that extend a base Shopify theme — it does not contain the full theme.

## Development Workflow

There is no build system, package manager, or test suite. Development is done by editing Liquid/JSON files and deploying to Shopify via the Shopify CLI:

```bash
# Authenticate (one-time)
shopify auth login

# Pull the live theme to local
shopify theme pull --store=<store-handle>.myshopify.com

# Push changes and hot-reload in a browser
shopify theme dev --store=<store-handle>.myshopify.com

# Deploy to production
shopify theme push --store=<store-handle>.myshopify.com
```

There are no lint or test commands — visual inspection in `theme dev` is the primary feedback loop.

## Architecture

### Directory Layout

```
layout/theme.liquid     ← Root HTML shell, injected for every page
sections/               ← Custom section components (21 files)
templates/              ← JSON page blueprints (16 files)
```

### How Pages Are Assembled

Shopify's rendering pipeline works like this:

1. **`layout/theme.liquid`** provides the outer HTML shell (`<html>`, `<head>`, header/footer section groups, social sticky bar, Klaviyo tracking, scroll-to-top logic).
2. A **template JSON** (e.g., `templates/page.sale.json`) declares which sections appear on a page and in what order, along with default block/settings values.
3. Each **section Liquid file** in `sections/` renders its own HTML, scoped CSS (inline `<style>` block), and declares a JSON schema that drives the Shopify admin UI.

### Section Anatomy

Every section file follows this structure:

```liquid
{%- liquid
  assign some_var = section.settings.some_setting
-%}

<section class="prefix" style="--prefix-var: {{ some_var }};">
  {%- for block in section.blocks -%}
    <!-- block rendering -->
  {%- endfor -%}
</section>

<style>
  .prefix { /* all scoped styles for this section */ }
  @media screen and (max-width: 749px) { /* mobile overrides */ }
</style>

{% schema %}
{
  "name": "Section Display Name",
  "settings": [ ... ],
  "blocks": [ { "type": "...", "name": "...", "settings": [...] } ],
  "presets": [ { "name": "Section Display Name" } ]
}
{% endschema %}
```

Key conventions:
- **CSS scoping via short class prefixes** — e.g., `sale-hero` uses `.sh`, `sale-pillars` uses `.sp`, `story-salon` uses `.ss`. Always pick a short 2–3 letter prefix unique to the section.
- **CSS custom properties bridge Liquid to CSS** — section settings are passed as inline CSS variables (`style="--sh-h: {{ hero_height }}vh;"`) rather than interpolated directly into style rules.
- **Responsive breakpoints**: mobile ≤ 749px, tablet ≤ 989px, desktop > 989px. Follow existing sections for breakpoint conventions.
- **No JavaScript frameworks** — interactivity is vanilla JS only.

### Section Families

| Prefix | Files | Purpose |
|---|---|---|
| `sale-*` | 8 sections | Sales campaign page (ticker, hero, tiers, grid, pillars, reviews, Klaviyo, brand story) |
| `lookbook-*` | 5 sections | Editorial lookbook gallery |
| `story-salon*` | 3 sections | Artist/editorial storytelling pages |
| `section-*` | 2 sections | Reusable cross-page utilities (filter bar, dual banner) |
| `product-*` | 1 section | Product page feature (multi-pack offer) |
| `blog` | 1 section | Blog listing |

### Template Families

| Template | Page URL | Sections Used |
|---|---|---|
| `index.json` | `/` | 9 sections including sale sections |
| `page.sale.json` | `/pages/sale` | 8 sale-* sections |
| `page.lookbook.json` | `/pages/lookbook` | 5 lookbook-* sections |
| `page.story-salon.json` | `/pages/story-salon` | Campaign banner + custom content |
| `page.story-salon-*.json` | `/pages/story-salon-*` | Individual artist pages (10 artists) |
| `blog.json` | `/blogs/*` | Blog section |

### theme.liquid Responsibilities

- Renders `{% section_group 'header-group' %}` and `{% section_group 'footer-group' %}` (managed in Shopify admin, not in this repo)
- Social sticky bar: fixed bottom nav that docks/undocks based on an Intersection Observer watching a sentinel `div.scroll-trigger` at the top of the page
- Injects Klaviyo onsite tracking script
- Contains mobile header overrides via `<style>` in `<head>` (using the theme's `--outer` CSS variable for gutters)

## Key Conventions

- **All styles are inline within the section file** — there are no separate CSS files in this repo. When editing a section, its styles live in the `<style>` block at the bottom of the same file.
- **Section settings ≠ Metafields** — all configurable values come from `section.settings` defined in the `{% schema %}` block. Default values live in the template JSON, not in the schema `"default"` field.
- **Block order is explicit** — template JSON files list both `"blocks": {}` (the block definitions) and `"block_order": []` (the render sequence). Both must be updated when adding blocks.
- **Images use Shopify's CDN filter**: `{{ image | image_url: width: 2400 }}` — never hardcode image URLs.
- **Klaviyo forms** are embedded via `klaviyo-form` custom element with a `data-id` attribute matching the Klaviyo form ID configured in the Shopify admin.
