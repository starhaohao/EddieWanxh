# Product Upload Rule — Display Name, Material & Badges

How to enter product data so the storefront renders names, materials, and badges
correctly. The theme reads the metafields below and derives everything else
automatically — fill them consistently for every product.

Every product name shows on **two lines**:

- **Line 1** = Display Name
- **Line 2** = Material (or, for bundles, the included products)

---

## 1. Display Name → metafield `custom.display_name`

- Clean name, **no material, no colour**: `X Brief`, `W Boxer Trunk`,
  `ED Sleeveless Top`, `L Socks`.
- Colour lives in the **variant selector** — all colours of one product share the
  same Display Name.
- If left empty, the theme falls back to `custom.product_content → display_name`,
  then to the raw Shopify product title. **Always fill it.**

---

## 2. Material → metafield `theme.cutline`

- Type the fabric; the theme normalizes it automatically:
  - Contains **"transdry"** (any casing) → renders exactly **`TransDRY®`**
    (correct casing + registered symbol, always).
  - Anything else → **UPPERCASE** (e.g. `Cotton Spandex` → `COTTON SPANDEX`).
- Drives **both** the name's second line **and** the right-hand material badge on
  the product page.
- Empty cutline = no material line and no material badge.

---

## 3. Bundles (title / handle / type / tag contains `bundle`)

- Name Line 2 is **not** the material — it's the included products' Display Names
  joined by ` · ` (e.g. `Y Brief · X Boxer Trunk`).
- Link included products via metafields `theme.bundle` (single product) and/or
  `theme.bundle_list` (list of products).
- Fill each included product's own `custom.display_name` correctly and the bundle
  line composes itself.

---

## 4. Badges

| Badge | How it's set |
|---|---|
| **Category** (Brief / Boxer Trunks / Socks / T-Shirt / Top / Bundle) — *left* | Automatic from keywords in product **Type / handle / title / tags**. Set **Type** to the garment to be safe. First match wins. |
| **Material** (COTTON SPANDEX / TransDRY®) — *right* | Automatic from `theme.cutline`. Shows on **all** products. Empty cutline = no badge. |
| **Custom** (`XL/2XL Only`, `Limited`) | Metafield `theme.badge` (single-line text) **or** tag `_badge_XL_2XL_Only` (underscores become spaces). Hidden if identical to the category badge. |
| **Sale %** | Automatic when a variant has a higher **Compare-at price**. |
| **Pre-order** | Metafield `theme.preorder = true` (boolean) **or** tag `_preorder`. |
| **New** | Automatic, within N days of creation (N set globally in Theme settings → badges). |
| **Sold out** | Automatic when the product is unavailable. |

### Category badge keyword map

| If Type/handle/title/tags contains… | Badge |
|---|---|
| `bundle` | Bundle |
| `boxer` or `trunk` | Boxer Trunks |
| `brief` | Brief |
| `sock` | Socks |
| `t-shirt` / `tshirt` / `tee` | T-Shirt |
| `sleeveless` / `top` | Top |

---

## Examples

| Admin `custom.display_name` | Admin `theme.cutline` | Shows on site (Line 1 / Line 2) |
|---|---|---|
| `X Brief` | `TransDRY` | **X Brief** / TransDRY® |
| `W Boxer Trunk` | `Cotton Spandex` | **W Boxer Trunk** / COTTON SPANDEX |
| `L Socks` | `Cotton Spandex` | **L Socks** / COTTON SPANDEX |
| `TransDRY® Upgrade Bundle` | *(blank; link bundle products)* | **TransDRY® Upgrade Bundle** / Y Brief · X Boxer Trunk |

---

## Quick reference — per product

- Set **`custom.display_name`** → clean name (no material/colour)
- Set **`theme.cutline`** → fabric (drives name Line 2 **and** the material badge)
- Set product **Type** → drives the category badge
- Optional: **`theme.badge`** / `_badge_…` tag, **Compare-at price**,
  **`theme.preorder`**

### Notes

- Line 2 and the material badge only appear when `theme.cutline` is set — there is
  no keyword guessing, so cards, product page, and badges stay in lockstep.
- Colour variants use the same two-line name; colour stays in the selector.
