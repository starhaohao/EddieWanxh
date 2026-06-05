# TRIIIPLE Email Automations — Shopify Setup Guide

This guide walks you through configuring all 9 email automations in Shopify.

## Email Categories

### Built-in Notifications (Auto-triggered, no setup needed)
These are Shopify default notifications — you just customize the template code:

| Email | Setting Path | Trigger | Action |
|---|---|---|---|
| **06** Shipping | Settings → Notifications → Shipping confirmation | Order fulfilled | Auto-sent when tracking added |
| **07** Account Welcome | Settings → Notifications → Customer account welcome | Account created | Auto-sent when customer creates account |
| **09** Password Reset | Settings → Notifications → Customer password reset | Reset requested | Auto-sent when customer resets password |

### Manual Automations (You set up the trigger)
These require automation workflows:

| Email | Type | Trigger | Action |
|---|---|---|---|
| **01** Thank You | Order automation | 1st order placed | Send email immediately |
| **02** Welcome Back | Order automation | 2nd order placed | Send email immediately |
| **03** Abandoned Cart | Cart automation | Cart abandoned 48h | Send recovery email |
| **04** Welcome Subscriber | Subscriber automation | Customer subscribes | Send welcome + codes |
| **05** Marketing Confirmation | Shopify setting | Opt-in confirmation | Double opt-in flow |
| **08** Account Invite | Manual trigger | When you invite | Manual or app-triggered |

---

## Setup Steps

### PART 1: Built-in Notifications (3 emails)

No automation setup needed — just paste the template code into each notification.

#### **Email 06: Shipping Confirmation**
1. Go to **Settings → Notifications**
2. Find **"Shipping confirmation"**
3. Click **"Edit code"**
4. Replace all code with `emails/email-06-shippingconfirmation.liquid`
5. Replace social icon placeholders with your Shopify Files URLs
6. Click **Save**
7. Test: Go to an order → mark as fulfilled → check your email

#### **Email 07: Account Welcome**
1. Go to **Settings → Notifications**
2. Find **"Customer account welcome"**
3. Click **"Edit code"**
4. Replace all code with `emails/email-07-accountwelcome.liquid`
5. Replace social icon placeholders
6. Click **Save**
7. Test: Create a new customer account → check email

#### **Email 09: Password Reset**
1. Go to **Settings → Notifications**
2. Find **"Customer account password reset"**
3. Click **"Edit code"**
4. Replace all code with `emails/email-09-passwordreset.liquid`
5. Replace social icon placeholders
6. Click **Save**
7. Test: Go to login → "Forgot password" → enter email → check inbox

---

### PART 2: Order Automations (Emails 01 & 02)

#### **Email 01: Thank You (First Order)**

1. Go to **Settings → Automations**
2. Click **"Create automation"**
3. Select **"Order created"** as the trigger
4. Add condition: **"Order number" → "is" → "1"**
   - (This fires only on the customer's first order)
5. Add action: **"Send email"**
6. Paste the code from `emails/email-01-thankyou.liquid` into **Custom Liquid** section
7. Replace social icon & image placeholders
8. Name the automation: **"Order #1 — Thank You"**
9. Click **Save**
10. Test: Place an order with a new customer account → check email immediately

#### **Email 02: Welcome Back (Repeat Customer)**

1. Go to **Settings → Automations**
2. Click **"Create automation"**
3. Select **"Order created"** as the trigger
4. Add condition: **"Order number" → "is" → "2"**
   - (Fires only on the customer's second order)
5. Add action: **"Send email"**
6. Paste `emails/email-02-welcomeback.liquid`
7. Replace placeholders with your product image URLs from Shopify Files
8. Update product URLs if your product handles differ:
   - `p1_url`: TSU1003 product page
   - `p2_url`: TSU1001 (black)
   - `p3_url`: TSU1001 (white)
9. Name: **"Order #2 — Welcome Back"**
10. Click **Save**
11. Test: Place two orders with the same customer → second order triggers email

---

### PART 3: Cart Abandonment (Email 03)

#### **Email 03: Abandoned Cart**

1. Go to **Settings → Automations**
2. Click **"Create automation"**
3. Select **"Cart abandoned"** as the trigger
4. Set delay: **"48 hours"** (or your preference)
5. Add action: **"Send email"**
6. Paste `emails/email-03-abandonedcart.liquid`
7. Replace social icon placeholders
8. **Important:** Check free-shipping threshold:
   - Look for `assign threshold = 13000` (in cents = S$130)
   - Change if your threshold differs
9. Name: **"Abandoned Cart Recovery"**
10. Click **Save**
11. Test: Add items to cart → leave site → wait 48h (or trigger manually in test)

---

### PART 4: Subscriber Opt-in (Emails 04 & 05)

#### **Email 04: Welcome Subscriber**

1. Go to **Settings → Notifications**
2. Find **"Customer subscribes"** (under Marketing notifications)
3. Click **"Edit code"**
4. Paste `emails/email-04-welcomesubscriber.liquid`
5. Replace social icon placeholders
6. **Keep the Klaviyo form ID** if you have one (or leave as is)
7. Click **Save**
8. Test: Subscribe to the newsletter → check email

#### **Email 05: Marketing Confirmation (Double Opt-in)**

This is Shopify's **Customer marketing confirmation** — the confirmation email for double opt-in flow.

1. Go to **Settings → Notifications**
2. Find **"Customer marketing confirmation"**
3. Click **"Edit code"**
4. Replace all code with `emails/email-05-marketingconfirmation.liquid`
5. Replace social icon placeholders
6. **CRITICAL:** Keep the button link as `{{ customer.email_marketing_subscribe_url }}`
   - This is how Shopify verifies double opt-in
7. Click **Save**

**To enable double opt-in in Shopify:**
1. Go to **Settings → Customer accounts**
2. Find **"Email marketing"** section
3. Set to **"Require verification email"** (if not already)
4. This makes Shopify auto-send Email 05 when someone subscribes

9. Test: Subscribe → check email for confirmation button → click → verify subscription confirmed

---

### PART 5: Account Invitation (Email 08 — Optional Manual)

#### **Email 08: Account Invite**

This email is sent **when you manually invite a customer** to create an account.

1. Go to **Settings → Notifications**
2. Find **"Customer account invite"**
3. Click **"Edit code"**
4. Replace all code with `emails/email-08-accountinvite.liquid`
5. Replace social icon placeholders
6. Click **Save**

**How to use:**
- Go to **Customers** → select a customer → **Account** → **Create account** → **Send invite**
- Shopify sends Email 08 automatically
- Customer clicks link to activate account

---

## Summary: What to Do First

### Immediate (5–10 min)

- [ ] Upload social icon images to **Settings → Files**
- [ ] Update all 9 emails with correct social icon URLs from Shopify Files

### Part 1: Built-in Notifications (5 min)

- [ ] Email 06 (Shipping) → paste code, test
- [ ] Email 07 (Account Welcome) → paste code, test
- [ ] Email 09 (Password Reset) → paste code, test

### Part 2: Automations (10 min)

- [ ] Email 01 (Thank You / Order #1) → create automation
- [ ] Email 02 (Welcome Back / Order #2) → create automation + update product URLs
- [ ] Email 03 (Abandoned Cart) → create automation + check threshold
- [ ] Email 04 (Welcome Subscriber) → paste code
- [ ] Email 05 (Marketing Confirmation) → paste code + enable double opt-in
- [ ] Email 08 (Account Invite) → paste code

### Testing (10 min)

- [ ] Place a test order → verify Email 01
- [ ] Place a second order same customer → verify Email 02
- [ ] Subscribe to newsletter → verify Email 04 + 05
- [ ] Add to cart, abandon → wait or trigger Email 03
- [ ] Create customer account → verify Email 07
- [ ] Ship an order → verify Email 06
- [ ] Request password reset → verify Email 09

---

## Troubleshooting

**"The email isn't sending"**
- Check that the automation is **enabled** (toggle is on)
- Verify the condition is correct (e.g., "Order number is 1")
- Check that you're using the right trigger

**"Images don't load in the email"**
- Verify URLs are from Shopify Files (Settings → Files → copy full URL)
- Make sure URLs are `https://`, not `http://`
- Test in multiple email clients

**"Variable shows as literal text (e.g., `{{ order.name }}`)"**
- You pasted into the wrong section (should be "Custom Liquid" or "Edit code")
- For notification templates, must replace ALL code (not add Custom Liquid section)

**"Product images in Email 02 show broken"**
- Replace `p1_img`, `p2_img`, `p3_img` with actual Shopify Files URLs
- Product handles in `p1_url`, `p2_url`, `p3_url` must match your catalog

---

## Files Reference

| Email | File Path | Type | Setup Location |
|---|---|---|---|
| 01 | `emails/email-01-thankyou.liquid` | Custom Liquid | Automation: Order #1 |
| 02 | `emails/email-02-welcomeback.liquid` | Custom Liquid | Automation: Order #2 |
| 03 | `emails/email-03-abandonedcart.liquid` | Custom Liquid | Automation: Cart abandoned |
| 04 | `emails/email-04-welcomesubscriber.liquid` | Custom Liquid | Notification: Customer subscribes |
| 05 | `emails/email-05-marketingconfirmation.liquid` | Full code | Notification: Customer marketing confirmation |
| 06 | `emails/email-06-shippingconfirmation.liquid` | Full code | Notification: Shipping confirmation |
| 07 | `emails/email-07-accountwelcome.liquid` | Full code | Notification: Customer account welcome |
| 08 | `emails/email-08-accountinvite.liquid` | Full code | Notification: Customer account invite |
| 09 | `emails/email-09-passwordreset.liquid` | Full code | Notification: Customer password reset |

---

Ready to go. Follow the steps above and reach out if you hit any snags.
