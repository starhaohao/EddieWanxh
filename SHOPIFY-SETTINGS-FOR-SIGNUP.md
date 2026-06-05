# Shopify Settings to Enable Signup Banner Automation

The signup banner form now submits to Shopify's native `/contact` endpoint. To trigger **Email 04 (Welcome Subscriber)** and **Email 05 (Marketing Confirmation)**, configure these Shopify settings:

## Step 1: Enable Email Marketing Opt-in

1. Go to **Settings → Customer accounts**
2. Scroll to **"Email marketing"** section
3. Select one of these options:
   - **"Allow customers to opt in"** — single opt-in (Email 04 only)
   - **"Require verification email"** — double opt-in (Email 04 → Email 05 confirmation)

**Recommendation:** Choose **"Require verification email"** to use both Email 04 & 05.

## Step 2: Verify Email 04 & 05 Configuration

Go to **Settings → Notifications** and confirm:

- ✅ **"Customer subscribes"** → Has Email 04 code pasted
- ✅ **"Customer marketing confirmation"** → Has Email 05 code pasted

## Step 3: Test the Flow

1. **Add an email** via the signup banner
2. **Check your inbox** for Email 04 (Welcome Subscriber with 10% code)
3. **Click the confirmation link** in the email
4. **Verify** in Shopify: Customers → find the email → check "Subscribed to email marketing"

## Step 4: Verify Klaviyo Sync (Optional)

If Klaviyo is connected:

1. Go to **Settings → Apps and channels → Klaviyo**
2. Verify sync is enabled
3. The subscriber will appear in Klaviyo automatically

---

## What Happens Now

**When someone signs up via the banner:**

1. Form submits to `/contact` (Shopify)
2. Email added to **Customers → Email marketing**
3. Triggers **"Customer subscribes"** automation
4. Email 04 sent immediately (Welcome Subscriber)
5. If double opt-in enabled: Email 05 sent (confirmation email)
6. Customer clicks confirmation link → subscription confirmed
7. Klaviyo gets synced automatically (if connected)

---

## Current Banner Settings

**Section:** Sale Klaviyo Signup  
**Form:** Email signup (no SMS yet)  
**Action:** Posts to `/contact`  
**Trigger:** Email 04 & 05 via "Customer subscribes" automation

---

**Ready to test?** Go to Shopify Settings → Customer accounts and enable email marketing opt-in. Then test by signing up via the banner!
