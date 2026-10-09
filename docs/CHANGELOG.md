# Changelog: TRIIIPLE Studio theme

Everything merged into `claude/shopify-lookbook-mobile-pqCEU`, newest first. PR numbers link to
`github.com/starhaohao/EddieWanxh/pull/<n>`. Theme Editor edits synced by `shopify[bot]` are not listed
individually.

---

## Oct 2026: Editorial homepage

| PR | Change |
|---|---|
| #171 | **Brand definition banner**: bold-heading option (section-scoped), heading/description spacing, 9:10 desktop images, overlay set lower |
| #170 | **New section `brand-definition-editorial.liquid` ("Brand definition banner")**. Desktop: label row (brand / category / website), centred heading + text, three equal edge-to-edge images with optional number/title overlay and corner text. Mobile: text beside image 1, images 2 + 3 below. Schema name cut to Shopify's 25-character limit |
| #169 | Homepage action buttons: labels left-aligned, arrows pinned right |
| #168 | `triiiple-editorial-home` added to the repo as it exists live, plus a **"Show part" (All / Top / Bottom)** setting so the homepage can be split around other sections |
| #167 | Editorial two banners: featured collection picker on both banners (falls back to manual link) |
| #166 | `brand-definition.liquid`: first three-image brand definition banner |
| #165 | Product page mobile slider: 1px gap between product images (`layout/theme.liquid`) |
| #164 | **New section `editorial-two-banners.liquid`**: two-banner editorial composition from Figma, using theme typography and grid |
| #163 | Gateway hero title no longer blends into light images |

## Aug 2026: Mobile polish and social proof

| PR | Change |
|---|---|
| #162 | Homepage hero gets more breathing room, social video badges fixed |
| #161 | Mobile menu drawer no longer covered by sticky header after scrolling |
| #160 | Mobile Safari horizontal overflow fixed (`overflow-x: clip` on body) |
| n/a | Social videos: corner badges, per-tile links, badge style controls, no mobile gap, plain play icon |
| n/a | **Klaviyo Reviews section** (styled like Social videos) added to homepage, with carousel height control |
| n/a | Header text, links, icons and logo stay white at top and after scroll |
| n/a | Collection filter/sort bar shrunk, no longer overlaps sticky header |
| #159 | Mobile menu backdrop grey instead of black |
| #158 | Gateway hero caption shadow removed, true full-bleed on hero and social sections |
| #157 | Landing page fixes: brand story contrast, dead sections removed, duplicate hero, colour schemes |

## Jul 2026: Product page and collection redesign

| PR | Change |
|---|---|
| #156 | Mobile menu drawer above the header bar |
| #155 | Sale badge + final-sale row wraps instead of overlapping |
| #154 | Homepage newsletter banner: photo background + scrim |
| #153 | Header glass more transparent, simpler sticky cart-bar CTA |
| #152 | Mobile floating widgets no longer overlap |
| #151 | Product card price sizing, "Why This Works" dividers |
| #150 | PDP product reel mapping |
| #149 | PDP anchor nav accepts video or image |
| #148 | "Why This Works" desktop dividers aligned, heading ghosting masked |
| #147 | GitHub Pages Jekyll build no longer chokes on Liquid |
| #140–#145 | **PDP "Below Add to Cart" details accordion** (singles + bundles), quantity stepper, social share, anchor nav, Recently Viewed text colour, compact mobile EDM signup |
| #139 | Zoom banner typography/margins matched to theme tokens |
| #138 | Theme Check schema fix |
| #128–#137 | **Collection page redesign** (Figma design system): fixed image heights, bundle collections on their own template, sold-out badge removed, bundle sale badge, type-switcher and filter/sort typography. Shop by Fabric built from material metaobjects |
| #127 | Client-side type filtering on Shop by Design / Shop by Fabric |
| #126 | Homepage + product page sizing and spacing normalised |
| #125 | **Explore styles** section: 4-up carousel from `style_card` metaobject |
| #120–#124 | **Liquid-glass header and bottom sticky bar** (merchant transparency control), GASKA-inspired product page, 50% taller bottom bar |
| #119 | Collection grid edge spacing, filter/sort translations |
| #115, #117 | Two-line product name + material on cards and PDP, sale percentage badge on PDP |
| #114 | Collection badges restyled, Material label |
| #110–#112 | Tops product template + size chart, PDP name/material and grid subtitle from product-content metaobject / Material Family |
| #109 | Meta Pixel migration handoff doc, Oxygen deploy scoped |
| #108 | Material badge orange, full-bleed mobile product photos |
| #106, #107 | Justified text on the Sale Hero banner |
| #103 | Price-range colour `#E01907` |
| #104 | Header overlap fix + scroll-based header transparency |
| #102 | Margin line audit (about-us and site-wide) |
| #95–#100 | Homepage bottom-half redesign, iOS liquid-glass mobile header, Story Salon hub link cleanup, homepage → `/pages/sale` redirect removed, missing collection locale keys |
| #89 | Final Clearance / "Buy 5 Get 1 Free" messaging across theme, `collection.dead-stock-clearance.json` |
| #76–#93 | Locale files fixed (illegal comment header), per-category collection templates (Briefs / Boxer Trunks / Tops), EDM signup refined, page templates (First Layer CRM, Shop by Design, Size Guide, Amos story), CDLP nav restored, transparent collection header off, `settings_data.json` colour schemes restored |
| #65–#73 | Fabric/CDLP brand palette + typography, product-content metaobject naming, percentage sale badge, reusable Story Salon renderer, accurate material claims, EDM signup section, CDLP left-slide menu, landing page finish |
| #57, #58, #52 | Product card wired to `triiiple_product_content` metaobject, landing hero video from Shopify content, product-framework section |

## Jun 2026: Foundations

| PR | Change |
|---|---|
| #50 | Product card section: 3 editorial card styles |
| #53, #55, #56 | Hydrogen SaleHero wired to a metaobject, metaobject definitions (`docs/metaobject-mutations.graphql`) |
| #22, #27–#49, #61 | **Hydrogen / Oxygen storefront** in `hydrogen-starter/` (cart + checkout, deploy workflow fixes) |
| #36 | New landing, collection and product templates (`*.triiiple.studio.json`) |
| #25 | Google Fonts knowledge doc |
| #24 | Product image renaming script (`scripts/rename_for_shopify.py`) |
| #23 | Last Rotation campaign page |
| #21 | Shopify → TikTok Shop sync (`tiktok-sync/sync.py`) |
| #19 | Daddy's Day EDM (A/B) + freesocks26 journey section |
| #16, #17 | Lookbook filter / cards (reverted, reworked in #93) |
| #14, #15 | 9 production email templates (`emails/`) + automation setup guide |
| #12 | `CLAUDE.md` architecture guide |
| #7–#13, #18, #26 | **Multi-pack offer tier selector** for product pages |
| #1–#6 | **Story Salon**: artist landing pages (Daphne Tan, Sonia Seraphina, Jocelyn Leow, …), hub links, filter tabs |

---

## Known open items

- Homepage: "Brand definition banner" is installed in draft theme `177251713047` but not yet placed on the page.
- Figma transfer of the landing, collection and product page layouts did not happen. The Figma MCP tool-call limit was reached, and the account has a View seat. The alternative is the html.to.design plugin.
- Full-page screenshots of the live site need `triiiplestudio.com` allowed in the agent environment's network settings.
