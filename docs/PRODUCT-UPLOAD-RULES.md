# TRIIIPLE Studio — Product Upload Rules (FABRIC V2)

The theme derives all names, materials, and badges from the fields below.
Fill them exactly as specified for every product.

## 1. Display Name — `custom.display_name` (single-line text)
- Clean product name only — **no material, no colour**.
  Examples: `X Brief`, `W Boxer Trunk`, `ED Sleeveless Top`, `L Socks`.
- Colour lives in the variant selector, never in the name. All colours share one Display Name.
- If empty, theme falls back to `custom.product_content.display_name`, then the raw title. Always fill it.

## 2. Material — `theme.cutline` (single-line text)
- Enter the fabric, e.g. `TransDRY` or `Cotton Spandex`.
- Normalization is automatic and identical everywhere:
  - value containing `transdry` (any case) → renders exactly `TransDRY®`
  - anything else → UPPERCASE, e.g. `Cotton Spandex` → `COTTON SPANDEX`
- A cutline naming **both** fabrics (e.g. `Cotton Spandex & TransDRY®`) splits into **two separate badges**: `COTTON SPANDEX` + `TransDRY®`.
- Where material shows:
  - Collection card: second text line under the product name (single) — no badge.
  - Product page: second line under the title (single) **and** material badge(s) on the right of the image (all products).
- Empty cutline = no material line and no material badge.

## 3. Single vs Bundle
A product is a **bundle** if title/handle/type/tag contains `bundle`.
- **Single** → Line 2 = the Material (from `theme.cutline`).
- **Bundle** → Line 2 = included products' Display Names joined by ` · ` (e.g. `Y Brief · X Boxer Trunk`).
  Do NOT type a material for the bundle's Line 2. Link included products via `theme.bundle` (single) and/or `theme.bundle_list` (list); ensure each child has its own `custom.display_name`.
  A bundle still shows its material badge(s) if `theme.cutline` is set.

## 4. Badges
| Badge | How it's set |
|---|---|
| **Category** (left) | Automatic from Type/handle/title/tags: bundle→Bundle, boxer/trunk→Boxer Trunks, brief→Brief, sock→Socks, t-shirt/tshirt/tee→T-Shirt, sleeveless/top→Top. Set **Type** to be safe. |
| **Material** (right) | Automatic from `theme.cutline`. All products. Splits into two badges if both fabrics named. |
| **Sale %** | Automatic when a variant has a higher Compare-at price. **Percentage only** (e.g. `25%`) — never the word "Sale". Shows on collection card and product-page image. |
| **Custom** (`XL/2XL Only`, etc.) | `theme.badge` (single-line text) **or** tag `_badge_Your_Text` (underscores → spaces). Hidden if identical to category. |
| **Pre-order** | `theme.preorder = true` **or** tag `_preorder`. |
| **New** | Automatic within N days of creation (global setting). |
| **Sold out** | Automatic when unavailable. |

## 5. Per-product checklist
- [ ] `custom.display_name` = clean name (no material/colour)
- [ ] `theme.cutline` = fabric (drives Line 2 + material badge)
- [ ] product Type set (drives category badge)
- [ ] Compare-at price set if on sale (drives % badge — percentage only)
- [ ] Bundles: `theme.bundle` / `theme.bundle_list` linked, each child has `display_name`
- [ ] Optional: `theme.badge` / `_badge_` tag, `theme.preorder` / `_preorder` tag
