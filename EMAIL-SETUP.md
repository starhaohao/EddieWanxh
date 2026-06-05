# TRIIIPLE Email Suite — Setup Guide

This folder contains **9 production-ready Shopify email templates** for TRIIIPLE Studio. All emails follow the brand voice and use pure Liquid.

## Architecture

**Shopify owns email consent & sending. Klaviyo syncs data only.**

- **Emails 01–04, 09**: Pasted into Shopify Settings → Notifications as "Custom Liquid"
- **Emails 05–08**: Full notification templates (replace entire email code in Shopify)
- **Klaviyo role**: Subscriber list sync via API only — no email sending, no Klaviyo code in templates

## Email Breakdown

| # | Name | Type | Trigger | Paste Into |
|---|---|---|---|---|
| 01 | Thank You | Transactional | 1st order placed | Order confirmation → Custom Liquid |
| 02 | Welcome Back | Transactional | 2nd order placed | Order confirmation → Custom Liquid |
| 03 | Abandoned Cart | Transactional | Cart abandoned (48h) | Abandoned checkout → Custom Liquid |
| 04 | Welcome Subscriber | Marketing | Customer subscribes | Customer subscribes → Custom Liquid |
| 05 | Marketing Confirmation | Marketing | Opt-in confirmation | Customer marketing confirmation (full code) |
| 06 | Shipping Confirmation | Transactional | Order fulfilled | Shipping confirmation (full code) |
| 07 | Account Welcome | Transactional | Account created | Customer account welcome (full code) |
| 08 | Account Invite | Transactional | Account invitation sent | Customer account invite (full code) |
| 09 | Password Reset | Transactional | Reset requested | Customer password reset (full code) |

## Setup Steps

### 1. Upload Assets to Shopify

Go to **Settings → Files** and upload these images. Copy the URLs:

| Asset | File | Variable |
|---|---|---|
| Logo | `triiiple-logo-white.png` | `logo_url` (pre-filled) |
| Hero banner | `email-banner-crop.jpg` | `banner_url` (pre-filled) |
| Facebook icon | `social-facebook.png` | `ic_facebook` |
| Instagram icon | `social-instagram.png` | `ic_instagram` |
| Pinterest icon | `social-pinterest.png` | `ic_pinterest` |
| Product image 1 | `tsu1003-front.jpg` | `p1_img` (Email 02 only) |
| Product image 2 | `tsu1001-blk-1.jpg` | `p2_img` (Email 02 only) |
| Product image 3 | `tsu1001-wht-1.jpg` | `p3_img` (Email 02 only) |

### 2. Configure Each Email

For each email file, go to the notification in Shopify and:

**Custom Liquid emails (01, 02, 03, 04):**
1. Paste the entire Liquid code into the "Custom Liquid" section
2. Find the placeholder URLs at the top (e.g., `PASTE_FACEBOOK_ICON_URL`)
3. Replace with your asset URLs from Shopify Files

**Full-code emails (05, 06, 07, 08, 09):**
1. Go to Settings → Notifications → [Notification name]
2. Click "Edit code"
3. Replace ALL code with the entire email file
4. Replace placeholders with your asset URLs

### 3. Fill in Placeholders

Every email has these placeholders — replace with your Shopify Files URLs:

```
{%- assign ic_facebook  = "PASTE_FACEBOOK_ICON_URL" -%}
{%- assign ic_instagram = "PASTE_INSTAGRAM_ICON_URL" -%}
{%- assign ic_pinterest = "PASTE_PINTEREST_ICON_URL" -%}
```

**Email 02 (Welcome Back) also has product images:**
```
{%- assign p1_img = "PASTE_TSU1003_IMG" -%}
{%- assign p2_img = "PASTE_TSU1001_BLK_IMG" -%}
{%- assign p3_img = "PASTE_TSU1001_WHT_IMG" -%}
```

And product URLs (update these to match your actual product handles):
```
{%- assign p1_url = "/products/tsu1003-transdry-brief" -%}
{%- assign p2_url = "/products/tsu1001-v-brief" -%}
{%- assign p3_url = "/products/tsu1001-v-brief" -%}
```

### 4. Test Each Email

1. Go to the notification in Shopify
2. Click "Send a test email"
3. Enter your email address
4. Check that:
   - Logo and images display correctly
   - Text formatting is consistent
   - Links work (use placeholder `#` in tests)
   - Colors match the brand

## Font Notes

- **Galdeano** (display): May not load in many email clients → falls back to Helvetica
- **Helvetica Neue** (body): Universal fallback
- **Courier New** (code/UI): Monospace for discount codes and labels
- No web fonts are required; all emails render correctly without them

## Variables Reference

### Global (all emails)
- `{{ logo_url }}` — TRIIIPLE logo
- `{{ ic_facebook }}`, `{{ ic_instagram }}`, `{{ ic_pinterest }}` — social icons
- `{{ shop.url }}` — your store domain

### Order emails (01, 02)
- `{{ order.name }}` — order number (e.g., "#1042")

### Abandoned cart (03)
- `{{ checkout.line_items }}` — cart items
- `{{ checkout.subtotal_price | money }}` — cart total
- `{{ checkout.abandoned_checkout_url }}` — recovery link

### Subscription (04)
- Auto-triggered on "Customer subscribes" automation

### Marketing confirmation (05)
- `{{ customer.email_marketing_subscribe_url }}` — confirmation button link (DO NOT CHANGE)
- `{{ unsubscribe_link }}` — Shopify-managed unsubscribe

### Shipping (06)
- `{{ name }}` — order number (top-level in notification templates)
- `{{ fulfillment.tracking_numbers }}` — tracking number
- `{{ fulfillment.tracking_urls }}` — tracking link
- `{{ fulfillment.fulfillment_line_items }}` — items in this shipment

### Account emails (07, 08, 09)
- `{{ shop.url }}` — links to store
- `{{ customer.account_activation_url }}` — account activation link (08)
- `{{ customer.reset_password_url }}` — password reset link (09)

## Shopify Setup Checklist

- [ ] Assets uploaded to Settings → Files (logo, banner, social icons)
- [ ] Email 01 pasted into Settings → Notifications → Order confirmation → Custom Liquid
- [ ] Email 02 pasted into Settings → Notifications → Order confirmation → Custom Liquid
- [ ] Email 03 pasted into Settings → Notifications → Abandoned checkout → Custom Liquid
- [ ] Email 04 pasted into Settings → Notifications → Customer subscribes → Custom Liquid
- [ ] Email 05 pasted as full code into Settings → Notifications → Customer marketing confirmation
- [ ] Email 06 pasted as full code into Settings → Notifications → Shipping confirmation
- [ ] Email 07 pasted as full code into Settings → Notifications → Customer account welcome
- [ ] Email 08 pasted as full code into Settings → Notifications → Customer account invite
- [ ] Email 09 pasted as full code into Settings → Notifications → Customer password reset
- [ ] All placeholder URLs replaced with actual Shopify Files URLs
- [ ] Product handles in Email 02 updated to match your catalog
- [ ] Test emails sent to verify rendering and links

## Klaviyo Integration

**No setup required in Klaviyo.** Shopify will:
1. Send transactional emails automatically
2. Sync subscriber data to Klaviyo via Settings → Apps and channels → Klaviyo
3. Keep lists in sync (no emails sent by Klaviyo)

You can use Klaviyo for segmentation and reporting only.

## Troubleshooting

**Images don't load:**
- Check that URLs in Shopify Files are correct (copy full CDN URL)
- Verify URLs are `https://`, not `http://`
- Test in multiple email clients (Gmail, Outlook, Apple Mail, mobile)

**Text formatting broken:**
- Email clients strip some CSS. The templates use inline styles + fallback fonts.
- Use Litmus or Email on Acid to preview across clients before sending

**Variables not rendering (e.g., `{{ order.name }}` appears as literal text):**
- In notification templates, top-level fields are used: `{{ name }}` not `{{ order.name }}`
- Email 01–04 use order/customer variables correctly
- Check that you pasted into the right section (Custom Liquid vs. full code)

**Unsubscribe link missing:**
- All marketing emails (04, 05) have `{{ unsubscribe_link }}`
- Shopify injects this automatically — don't edit it

---

**Questions?** Reach the TRIIIPLE team at [info@triiiplestudio.com](mailto:info@triiiplestudio.com).
