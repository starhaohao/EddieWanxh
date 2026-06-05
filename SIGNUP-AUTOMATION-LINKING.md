# Signup Banner → Email Automation Linkage

The **Sale Klaviyo Signup** banner can be connected to automations in 2 ways:

## Option 1: Shopify Native Newsletter (Recommended)

**Best for:** Email 04 (Welcome Subscriber) + Email 05 (Marketing Confirmation)

**How it works:**
- Form submits email to Shopify's marketing consent list
- Triggers "Customer subscribes" notification → Email 04 sent
- Triggers double opt-in → Email 05 sent (if double opt-in enabled)
- No Klaviyo code needed

**Setup:**

1. **Update the section** to use Shopify's native form:
   - Replace custom form with `<form method="post" action="/account/contact">`
   - Use `<input name="contact[email]" type="email">`
   - Add Shopify's newsletter checkbox

2. **In Shopify Settings:**
   - Go to **Settings → Customer accounts → Email marketing**
   - Set to **"Allow customers to opt in"** or **"Require verification email"** (for double opt-in)

3. **Automations trigger automatically:**
   - Email 04 fires when customer subscribes
   - Email 05 fires for confirmation (if double opt-in enabled)

---

## Option 2: Klaviyo Form Embed

**Best for:** Full Klaviyo control over automations

**How it works:**
- Embed Klaviyo form directly in the section
- Form submits to Klaviyo
- Klaviyo automations take over (separate from Email 04/05)

**Setup:**

1. **Get your Klaviyo form ID:**
   - Go to Klaviyo → Forms
   - Create or select your signup form
   - Copy the **form ID** (e.g., `V3iqKn`)

2. **Replace section with Klaviyo form:**
   ```liquid
   <klaviyo-form form-id="YOUR_FORM_ID"></klaviyo-form>
   ```

3. **Create automations in Klaviyo:**
   - Set up welcome email, follow-up sequences, etc.

**Tradeoff:** Bypasses Shopify's "Customer subscribes" automation, so Email 04 & 05 won't trigger. Use if you want Klaviyo to fully manage marketing emails.

---

## Option 3: Hybrid (Shopify + Klaviyo)

**Best for:** Using both Shopify transactional emails + Klaviyo marketing sequences

**How it works:**
1. Form submits to both Shopify AND Klaviyo
2. Shopify sends Email 04 (Welcome)
3. Klaviyo sends its own follow-up sequences

**Setup:**
- Use JavaScript to submit to both endpoints
- More complex but gives you both systems' automations

---

## Recommended Setup for TRIIIPLE

**Use Option 1 (Shopify Native):**

✅ Email 04 (Welcome Subscriber) triggers via "Customer subscribes"  
✅ Email 05 (Marketing Confirmation) handles double opt-in  
✅ Simple, native to Shopify, no additional API calls  
✅ Klaviyo still gets synced subscriber data  

**Then in Shopify:**
1. Keep Klaviyo integration enabled (Settings → Apps → Klaviyo)
2. Klaviyo syncs subscriber list from Shopify automatically
3. You can use Klaviyo for segmentation/reporting, but Shopify sends the emails

---

## What to Change

**Current section** (sale-klaviyo.liquid):
- Has custom HTML form with no submit logic
- Email input goes nowhere
- Not connected to any automation

**To fix:**
1. Add hidden field: `<input type="hidden" name="contact[tags]" value="newsletter">`
2. Update form action to Shopify endpoint
3. Add submit handler to post to `/account/contact`
4. Optional: Also submit to Klaviyo via JS

**Or** replace entire section with Klaviyo form embed if you prefer Klaviyo automation control.

---

## Files to Update

- `sections/sale-klaviyo.liquid` — Add form submit logic or embed Klaviyo form
- Email 04 & 05 templates — Already set up, no changes needed
- Shopify automations — Email 04 will fire automatically on "Customer subscribes"

---

## Test the Flow

1. Add email to signup banner
2. Check customer was added to **Customers → Email marketing**
3. Verify Email 04 lands in inbox
4. Click confirmation in Email 05 → subscription confirmed
5. Check Klaviyo has the subscriber synced

---

Which option would you like? I can update the section code accordingly.
