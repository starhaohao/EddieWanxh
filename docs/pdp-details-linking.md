# Linking Size & Fit, Material & Care, and Why This Works to product content

The **Product detail story** section already has hooks for both merchant-typed richtext and product metafields. This guide walks the two paths and when to pick each.

Section file: `sections/product-detail-story.liquid`
Template using it: `templates/product.json` (and any custom product templates)

## Anatomy of the section

The section renders three sub-areas on every product page:

| Sub-area | DOM id | Block type used |
|---|---|---|
| Product Details (accordions) | `#product-details` | `detail` (repeatable) |
| Why This Works (feature grid) | `#product-why` | `feature` (repeatable) |
| Find Your Size (size table) | `#product-size-guide` | `size_row` (repeatable) |

The anchor nav (`sections/pdp-anchor-nav.liquid`) scrolls to those ids.

Each `detail` block has three ways to source its body content (`use_product_description` wins → metafield wins → richtext falls through):

```liquid
{%- assign detail_content = block.settings.content -%}
{% if block.settings.use_product_description %}
  {%- assign detail_content = product.description -%}
{% endif %}
{% if block.settings.metafield_namespace != blank
   and block.settings.metafield_key != blank %}
  {%- assign detail_metafield =
       product.metafields[block.settings.metafield_namespace][block.settings.metafield_key] -%}
{% endif %}
```

## Path A — bind the accordions to product metafields (recommended)

Use this when the content is per-product and you want to edit it in the product editor, not the theme editor.

### 1. Create the metafields

In Shopify admin → **Settings → Custom data → Products → Add definition**, create two rich-text metafields:

| Namespace | Key | Type | Label |
|---|---|---|---|
| `custom` | `size_fit` | Rich text | Size & Fit |
| `custom` | `material_care` | Rich text | Material & Care |

(These namespaces + keys match the section's default preset — no code change needed.)

### 2. Populate them per product

On each product's edit page, scroll to the **Metafields** panel and paste the copy into "Size & Fit" and "Material & Care". Rich text supports headings, bullets, links, etc.

### 3. Bind the section blocks (already done in the default preset)

In Online Store → Themes → Customize → open a product page. In the **Product detail story** section:

- Open the **Size & Fit** accordion block:
  - `Metafield namespace` = `custom`
  - `Metafield key` = `size_fit`
  - `Use product description` = OFF
- Open the **Material & Care** accordion block:
  - `Metafield namespace` = `custom`
  - `Metafield key` = `material_care`
  - `Use product description` = OFF
- The `Content` richtext field on the block acts as a fallback — leave the placeholder or blank; the metafield takes priority when populated.

That's it — every product with the metafields populated now shows its own copy in these accordions. Products without the metafield fall back to the block's `Content` richtext.

## Path B — bind to the product's description or hand-typed richtext

Use this when the same paragraph should appear on every product using this template (marketing copy, warranty terms, etc.).

- **Description block**: check `Use product description` on the block. The section reads `product.description` at render time. Edit copy on the product's Description field.
- **Static block**: leave both the metafield fields and `Use product description` blank; type directly into the block's `Content` richtext in the theme editor. The same copy renders for every product on this template.

## Why This Works — how the 4 feature cells work

The 4 dark-box tiles (Moves with you / Breathes easier / etc.) are `feature` blocks in the same section. Each has:

| Setting | Notes |
|---|---|
| `symbol` | The `/  ~  -  o` glyph shown top-left |
| `heading` | Cell title |
| `text` | One-sentence benefit |

To customise per product, either:

**Simple path** — edit the feature blocks in the theme editor once. Every product on this template gets the same four cells (the pattern the site currently ships).

**Per-product path** — extend the section to read from a `list.rich_text` or `list.metaobject_reference` metafield:

1. Define a metaobject `product_feature` with fields `symbol`, `heading`, `text`.
2. Add a metafield on Product: namespace `custom`, key `features`, type `List of metaobject references → product_feature`.
3. In `sections/product-detail-story.liquid`, above the current `{% for block in section.blocks %}` inside the `__why` block, add a fallback loop:

   ```liquid
   {%- assign product_features = product.metafields.custom.features.value -%}
   {%- if product_features and product_features.size > 0 -%}
     {%- for f in product_features -%}
       <article>
         <span aria-hidden="true">{{ f.symbol }}</span>
         <h3>{{ f.heading }}</h3>
         <p>{{ f.text }}</p>
       </article>
     {%- endfor -%}
   {%- else -%}
     {%- for block in section.blocks -%}
       {%- if block.type == 'feature' -%}
         <article {{ block.shopify_attributes }}>
           <span aria-hidden="true">{{ block.settings.symbol }}</span>
           <h3>{{ block.settings.heading }}</h3>
           <p>{{ block.settings.text }}</p>
         </article>
       {%- endif -%}
     {%- endfor -%}
   {%- endif -%}
   ```

Per-product beats template-level any time you want the feature list to differ across products; template-level is faster to set up if the cells are shared across the whole catalogue.

## Anchor targets (in case you rename or add sections)

The nav links in `sections/pdp-anchor-nav.liquid` scroll to id attributes on the story sub-areas:

- `#product-details` — top of the accordions
- `#product-why` — top of the black feature grid
- `#product-size-guide` — top of the size table

If you rename an area or add a new one, add its id to the sub-area's wrapper `<div>` in `sections/product-detail-story.liquid` and add a matching `link` block in the anchor-nav section preset.

## Cheat sheet

| I want to change... | Where |
|---|---|
| Description text of one product | Product edit page → **Description** |
| Size & Fit copy of one product | Product edit page → **Metafields → Size & Fit** |
| Material & Care copy of one product | Product edit page → **Metafields → Material & Care** |
| Which metafield an accordion reads | Theme editor → Product detail story → block → `Metafield namespace` + `Metafield key` |
| The 4 Why This Works cells | Theme editor → Product detail story → `feature` blocks |
| Anchor nav labels | Theme editor → PDP anchor nav → block → `Label` |
