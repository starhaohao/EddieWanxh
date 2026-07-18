# Meta Pixel Migration — Situation & Handoff

**Store:** wfnvkf-y1.myshopify.com (triiiplestudio.com)
**Brand:** TRIIIPLE Studio / First Layer (Singapore premium menswear)
**Theme:** FABRIC V2 — `gid://shopify/OnlineStoreTheme/175004155927`
**Date:** 2026-07-09
**Status:** Investigation complete. No code change needed in this repo — cutover is UI-only in Shopify + Meta admin.

---

## TL;DR

We're moving Meta tracking **off** the manual GTM setup (`GTM-NV5RPLDT`) **onto** Shopify's native
Meta & Instagram sales channel, to fix AddToCart events that drop `value`/`currency` ~27% of the time
(in both Pixel and Conversions API).

**The key finding:** there is **no Meta Pixel / GTM / `fbq` / `dataLayer` code anywhere in the theme repo.**
The manual pixel fires entirely from Shopify's **admin/app layer** (injected at runtime via
`{{ content_for_header }}`), not from theme files. So there is nothing to comment out or deploy here —
the migration is done in the Shopify + Meta UI, in a specific order, and is fully reversible.

**The one rule that makes or breaks it:** the native channel must fire into pixel **`639397552556252`**
(the one our ad campaigns already optimize on), and there must be **exactly one** AddToCart per add.
Verify native works *before* switching GTM off — never after.

---

## Root problem

- ~27% of `AddToCart` events are missing `value` and `currency`.
- Classic GTM symptom: the hand-built `dataLayer` doesn't reliably have price populated at the instant
  AddToCart fires (quick-add buttons, variant race conditions).
- **Why native fixes it:** Shopify's native Customer Events pulls `value` + `currency` straight from
  Shopify's own cart event payload, so the data is structurally always present — no dataLayer race.

---

## Code findings (verified against this repo)

Searched the entire tree — `layout/`, `snippets/`, `sections/`, `assets/*.js`, `templates/`, `config/` — for:
`fbq(`, `connect.facebook.net`, `googletagmanager.com`, `GTM-`, `NV5RPLDT`, `dataLayer` / `dataLayer.push`,
`fbevents`, web-pixel `analytics.subscribe` / `customerPrivacy`, GTM `<noscript>` iframes,
`custom_liquid` blocks, and a legacy `checkout.liquid`.

**Result: zero tracking hits.** No `fbq()`, no GTM container, no `NV5RPLDT`, no `dataLayer` pushes,
no `connect.facebook.net`, no `googletagmanager.com`, no custom-liquid injection, no `checkout.liquid`.

The only Meta/Facebook-related items in the code are **non-tracking — leave them all alone:**

| File | Line | What it is | Action |
|---|---|---|---|
| `layout/theme.liquid` | 6 | `<meta name="facebook-domain-verification" content="hfy3mzkap4l02r5trn9fl53u6awt7s">` | **KEEP** — native channel needs domain verification too |
| `layout/theme.liquid` | 9 | `{{ content_for_header }}` | This is Shopify's runtime injection point — where the pixel/app scripts actually load |
| `config/settings_data.json` | 72 | `facebook_link` (footer social link) | KEEP — social icon, not tracking |
| `snippets/icon-facebook.liquid`, `social-icon*.liquid` | — | Facebook social-share icons | KEEP |
| `assets/photoswipe.js` | ~5 | PhotoSwipe "Share on Facebook" button | KEEP |
| `layout/theme.liquid` | 428–429 | Klaviyo onsite tracking | KEEP — not Meta |

> **Note / open item:** This repo identifies itself as **Broadcast Theme V8.1.1** (`snippets/head.liquid:13`),
> while the live theme is named **FABRIC V2**. If FABRIC V2 is a *different* published theme, it's possible
> GTM is hardcoded there instead of in the admin layer. To rule this out, pull the live theme
> (`shopify theme pull --theme=175004155927`) and re-run the same searches. If GTM code is found there,
> the fix becomes a commented-out (not deleted) diff in that theme, reviewed before any `shopify theme push`.

---

## Pixel inventory (the critical part)

There are **two** pixels on this account:

| Pixel name | Pixel ID | Status | Role |
|---|---|---|---|
| **TRIIIPLE Studio's pixel** | **`639397552556252`** | ✅ Active, fires daily | **KEEP** — Conversion campaign optimizes on this |
| Shopify_Triiiple_online | `1441438253353263` | ⚠️ Stale (last fired 2026-06-02) | RETIRE — not used |

Source: `.claude/commands/meta-ads.md` (Pixels table). `639397552556252` does **not** appear in any theme
file — consistent with the "no pixel code in theme" finding.

**The risk:** Shopify's native channel often defaults to the auto-created `1441438253353263`
("Shopify_Triiiple_online") pixel. If native fires into `1441438253353263` while campaigns still optimize
on `639397552556252`, conversions land on the wrong pixel → optimization silently breaks, and we've *also*
lost the old GTM firing. **Must confirm native points at `639397552556252` before disabling GTM.**

Related campaign context (from `.claude/commands/meta-ads.md`):
- Conversion campaign: `OFFSITE_CONVERSIONS → PURCHASE`, product_set `27080259148325878`, `PRODUCT_SET_AND_WEBSITE`.
- Awareness campaign: `AD_RECALL_LIFT`, page_id `624009770796180` (no pixel needed).

---

## Cutover plan (ordered — order is the whole point)

**Phase 0 — Pre-flight (change nothing):**
- Meta & Instagram sales channel installed and shows **Connected**.
- **Conversions API** enabled in the channel's data-sharing settings.
- Domain `triiiplestudio.com` verified in Events Manager → Settings → Brand Safety (meta tag already in theme).

**Phase 1 — Make the pixel match (highest risk):**
- Shopify admin → Sales channels → Meta → Settings → Data sharing → read the connected **Pixel ID**.
- If it reads **`639397552556252`** → MATCH, proceed.
- If it reads **`1441438253353263`** (or anything else) → **STOP.** Change the native channel's pixel to
  `639397552556252` (keeps campaign learning/history). Do not proceed until it reads `639397552556252`.

**Phase 2 — Verify native fires BEFORE touching GTM (intentional overlap):**
- Events Manager → pixel `639397552556252` → **Test Events**. Enter `triiiplestudio.com`, add a product to cart.
- Confirm AddToCart lands on `639397552556252` with populated `value` and `currency = SGD`.
- Confirm both **Browser + Server** for the one action, deduped by shared `event_id` (Shopify auto-handles).
- Expect a **second** (GTM) AddToCart right now — that's fine, it's why we verify first.

**Phase 3 — Disable the manual Meta firing (Meta-only, reversible):**
- If Meta fires via GTM (`GTM-NV5RPLDT`): **pause only the Meta tags** — Pixel base, AddToCart, Purchase,
  ViewContent, PageView — and their Meta-specific triggers.
- **Leave Google Ads / GA4 / all non-Meta tags published and untouched.** Submit a new container version
  with a clear name (e.g. "Pause Meta tags — native migration").
- If Meta instead fires via a **Custom Pixel** (Settings → Customer events) that only carries Meta →
  Disconnect/pause it. If that pixel also carries Google tags, don't — use the GTM route above.
- No Shopify CLI push needed. The `facebook-domain-verification` tag stays.

**Phase 4 — Confirm one clean firing:**
- Test Events: one add-to-cart = **one** AddToCart (Browser+Server deduped), no second event missing value.
- Meta Pixel Helper (Chrome) on a product page: `639397552556252` fires, `1441438253353263` does **not**.
- Events Manager → Overview: no "duplicate events" / "multiple pixels" warning.

**Phase 5 — Validate over 24–48h:**
- AddToCart value coverage climbs toward 100%; missing-value rate → ~0%.
- Event Match Quality holds or improves; no event-volume drop vs. baseline.
- Once confirmed unused, deprecate stale pixel `1441438253353263` (optional).

---

## Rollback (one move, no data loss)

- **Republish the previous GTM version** → manual Meta tags fire again exactly as before.
- If a Custom Pixel was paused instead, **re-enable it**.
- Native channel and theme are untouched. Everything was *paused*, not deleted → instant recovery.

---

## Flagged — human decisions, not to be automated

- Installing / activating the Meta & Instagram sales channel app.
- Any Meta Business Manager / Events Manager configuration, including changing the connected pixel.
- Domain verification for `triiiplestudio.com`, if not already green.

---

## For the next agent / Codex

- **Do not** search the theme for `fbq`/GTM again expecting to find and edit it — it's not there; it's admin-injected.
- The actionable code work only exists **if** the live FABRIC V2 theme differs from this repo and hardcodes GTM
  (see the open item above). Pull `--theme=175004155927` and re-search to confirm.
- If code work does appear: **comment out, do not delete**; leave all non-Meta tags intact; **show a diff before
  any `shopify theme push`** (do not deploy directly).
