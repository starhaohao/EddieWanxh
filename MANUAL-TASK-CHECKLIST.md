# TRIIIPLE Manual Task Checklist

Complete these tasks in Shopify to launch emails & automations.

---

## PART 1: Upload Assets (Settings → Files)

Upload these images and copy the URLs to replace placeholders:

### Required Images
- [ ] `triiiple-logo-white.png` → Copy URL
- [ ] `email-banner-crop.jpg` → Copy URL
- [ ] `social-facebook.png` → Copy URL
- [ ] `social-instagram.png` → Copy URL
- [ ] `social-pinterest.png` → Copy URL

### Email 02 Product Images (if using)
- [ ] `tsu1003-front.jpg` → Copy URL
- [ ] `tsu1001-blk-1.jpg` → Copy URL
- [ ] `tsu1001-wht-1.jpg` → Copy URL

**Status:** ☐ Not started ☐ In progress ☐ Done

---

## PART 2: Paste Email Templates (Settings → Notifications)

### Built-in Notifications (Edit code)
- [ ] **Email 06: Shipping Confirmation**
  - Path: Settings → Notifications → "Shipping confirmation"
  - Paste: `emails/email-06-shippingconfirmation.liquid`
  - Replace: Social icon URLs

- [ ] **Email 07: Account Welcome**
  - Path: Settings → Notifications → "Customer account welcome"
  - Paste: `emails/email-07-accountwelcome.liquid`
  - Replace: Social icon URLs

- [ ] **Email 09: Password Reset**
  - Path: Settings → Notifications → "Customer account password reset"
  - Paste: `emails/email-09-passwordreset.liquid`
  - Replace: Social icon URLs

### Marketing Notifications (Custom Liquid)
- [ ] **Email 04: Welcome Subscriber**
  - Path: Settings → Notifications → "Customer subscribes"
  - Paste: `emails/email-04-welcomesubscriber.liquid` (in Custom Liquid section)
  - Replace: Social icon URLs

- [ ] **Email 05: Marketing Confirmation**
  - Path: Settings → Notifications → "Customer marketing confirmation"
  - Paste: `emails/email-05-marketingconfirmation.liquid` (full code)
  - Replace: Social icon URLs

- [ ] **Email 08: Account Invite**
  - Path: Settings → Notifications → "Customer account invite"
  - Paste: `emails/email-08-accountinvite.liquid` (full code)
  - Replace: Social icon URLs

**Status:** ☐ Not started ☐ In progress ☐ Done

---

## PART 3: Create Automations (Settings → Automations)

### Order Automations
- [ ] **Email 01: Thank You (First Order)**
  - Create automation: "Order created"
  - Condition: "Order number" → "is" → "1"
  - Action: Send email (paste Email 01 code)
  - Replace: Social icon + banner URLs
  - Name: "Order #1 — Thank You"

- [ ] **Email 02: Welcome Back (Repeat Customer)**
  - Create automation: "Order created"
  - Condition: "Order number" → "is" → "2"
  - Action: Send email (paste Email 02 code)
  - Replace: Social icon + product image URLs
  - Update product handles if different from default
  - Name: "Order #2 — Welcome Back"

### Cart Automation
- [ ] **Email 03: Abandoned Cart**
  - Create automation: "Cart abandoned"
  - Delay: 48 hours
  - Action: Send email (paste Email 03 code)
  - Replace: Social icon URLs
  - Check free-shipping threshold (default: S$130)
  - Name: "Abandoned Cart Recovery"

**Status:** ☐ Not started ☐ In progress ☐ Done

---

## PART 4: Shopify Settings Configuration

### Email Marketing
- [ ] Go to **Settings → Customer accounts**
- [ ] Find **"Email marketing"** section
- [ ] Select: **"Require verification email"** (for double opt-in)
- [ ] Click **Save**

**Status:** ☐ Not started ☐ Done

### Checkout Configuration
- [ ] Go to **Settings → Checkout**
- [ ] Find **"Marketing opt-in"** section
- [ ] Email: Select **"Checkout only"**
- [ ] Label: **"Email me with news and offers"**
- [ ] Click **Save**

**Status:** ☐ Not started ☐ Done

---

## PART 5: Testing

### Email 01 & 02 (Order emails)
- [ ] Create test order (1st order) → Check inbox for Email 01
- [ ] Create 2nd order (same customer) → Check inbox for Email 02
- [ ] Verify product images load in Email 02

### Email 03 (Abandoned Cart)
- [ ] Add items to cart → Abandon checkout
- [ ] Wait 48h or manually trigger → Check inbox for Email 03
- [ ] Verify free-shipping progress bar shows correctly

### Email 04 & 05 (Signup emails)
- [ ] Sign up via banner → Check inbox for Email 04
- [ ] Click confirmation link in Email 04 or Email 05
- [ ] Verify subscription confirmed in Shopify (Customers → Email marketing)

### Email 06 (Shipping)
- [ ] Create order → Mark as fulfilled → Check inbox for Email 06
- [ ] Verify tracking number shows (if available)

### Email 07 (Account Welcome)
- [ ] Create customer account → Check inbox for Email 07

### Email 09 (Password Reset)
- [ ] Go to login → "Forgot password" → Enter email → Check inbox for Email 09
- [ ] Verify reset link works

### Checkout Opt-in
- [ ] Go through checkout
- [ ] Check "Email me with news and offers"
- [ ] Complete order
- [ ] Verify Email 04 sent automatically

**Status:** ☐ Not started ☐ In progress ☐ Done

---

## PART 6: Klaviyo Sync Verification

- [ ] Go to **Settings → Apps and channels → Klaviyo**
- [ ] Verify connection is active
- [ ] Check that test subscriber appears in Klaviyo list

**Status:** ☐ Not started ☐ Done

---

## Summary Progress

| Part | Task | Status |
|---|---|---|
| 1 | Upload assets | ☐ |
| 2 | Paste email templates | ☐ |
| 3 | Create automations | ☐ |
| 4 | Shopify settings | ☐ |
| 5 | Testing | ☐ |
| 6 | Klaviyo sync | ☐ |

---

## Quick Reference

**Files to reference:**
- EMAIL-SETUP.md — Email template details
- SHOPIFY-AUTOMATION-SETUP.md — Automation configuration
- SHOPIFY-SETTINGS-FOR-SIGNUP.md — Checkout & settings
- SIGNUP-AUTOMATION-LINKING.md — Banner to automation link

**Questions?** Check the docs above or ask!
