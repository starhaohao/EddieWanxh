# Meta Ads Management — TRIIIPLE Studio

Use this skill whenever the user asks about Meta (Facebook/Instagram) ads, campaigns, targeting, budgets, or performance for the TRIIIPLE Studio / First Layer brand.

## Account Overview

- **Brand**: First Layer / TRIIIPLE Studio (Singapore premium menswear)
- **Ad Account ID**: 188848207 (act_188848207)
- **Budget**: ~$20/day (5-day sprints ~$100)
- **Strategy**: SG-primary, conversion-focused

## Campaign & Adset Registry

| Campaign Name | Campaign ID | Status | Objective |
|---|---|---|---|
| Meta — Awareness — Broad | 52537734325922 | ACTIVE | OUTCOME_AWARENESS |
| Meta — Conversion — Sales | 52538438026122 | ACTIVE | OUTCOME_SALES |
| Meta — Traffic — Website | 52537484163322 | PAUSED | OUTCOME_TRAFFIC |
| Meta — Retargeting — Wins | 6995211007718 | ARCHIVED | OUTCOME_SALES |

| Adset Name | Adset ID | Campaign | Status |
|---|---|---|---|
| Meta — Awareness — Broad — All Ages | 52537734326322 | Awareness | ACTIVE |
| Meta — Conversion — Sales — Broad | 52538438026322 | Conversion | ACTIVE |
| Meta — Traffic — Website — 40+ | 52548432971522 | Traffic | PAUSED |
| Meta — Traffic — Website — Broad | 52537484163722 | Traffic | PAUSED |

## Current Active Targeting (as of 2026-06-18)

Both active adsets target:
- **Geo**: Singapore only
- **Age**: 18–65
- **Gender**: Male (1)
- **Locales**: 7 (zh_CN), 28 (zh_TW), 2 (ms_MY)
- **Advantage Audience**: ON
- **Brand Safety**: FACEBOOK_RELAXED, AN_RELAXED

## Naming Convention

```
Meta — [Funnel] — [Geo] — [Detail]

Funnels: Awareness | Traffic | Conversion | Retargeting
Geo: SG | Regional | (omit if obvious)
Detail: Broad | 40+ | All Ages | etc.
```

## Token Instructions

Never hardcode tokens. Ask the user to:
1. Go to Meta Business Settings → System Users → their system user
2. Click "Generate New Token" → select the ad account → grant `ads_management` permission
3. Copy the token and paste it when prompted

Token lifetime: ~60 days. If a script fails with `#190` (token expired), ask for a fresh token.

## Console Script Templates

All scripts run in Chrome DevTools console on any Meta Business Manager page.

### Fetch campaign/adset status
```javascript
const TOKEN = "PASTE_TOKEN";
const ids = ["52537734325922","52538438026122","52537484163322"];
Promise.all(ids.map(id =>
  fetch(`https://graph.facebook.com/v20.0/${id}?fields=name,status,effective_status&access_token=${TOKEN}`)
    .then(r => r.json())
)).then(r => r.forEach(x => console.log(x.status, x.name)));
```

### Fetch adset targeting
```javascript
const TOKEN = "PASTE_TOKEN";
const ids = ["52537734326322","52538438026322"];
Promise.all(ids.map(id =>
  fetch(`https://graph.facebook.com/v20.0/${id}?fields=name,targeting&access_token=${TOKEN}`)
    .then(r => r.json())
)).then(r => r.forEach(x => { console.log("\n📂", x.name); console.log(JSON.stringify(x.targeting, null,2)); }));
```

### Update adset targeting
```javascript
const TOKEN = "PASTE_TOKEN";
const body = new URLSearchParams({
  access_token: TOKEN,
  targeting: JSON.stringify({ /* targeting object */ })
});
fetch(`https://graph.facebook.com/v20.0/ADSET_ID`, { method: "POST", body })
  .then(r => r.json()).then(console.log);
```

### Pause / activate a campaign or adset
```javascript
const TOKEN = "PASTE_TOKEN";
const body = new URLSearchParams({ access_token: TOKEN, status: "PAUSED" }); // or "ACTIVE"
fetch(`https://graph.facebook.com/v20.0/CAMPAIGN_OR_ADSET_ID`, { method: "POST", body })
  .then(r => r.json()).then(console.log);
```

### Get audience demographics (last 30 days)
```javascript
const TOKEN = "PASTE_TOKEN";
const ids = ["52537734326322","52538438026322"];
Promise.all(ids.map(id =>
  fetch(`https://graph.facebook.com/v20.0/${id}/insights?fields=impressions,reach,spend,clicks,actions&breakdowns=age,gender&date_preset=last_30d&access_token=${TOKEN}`)
    .then(r => r.json())
)).then(results => {
  results.forEach((r, i) => { console.log("\n📊", ids[i]); console.log(JSON.stringify(r.data, null, 2)); });
});
```

### Get pixel / Event Manager info
```javascript
const TOKEN = "PASTE_TOKEN";
// First get ad account ID from an adset
fetch(`https://graph.facebook.com/v20.0/52537734326322?fields=account_id&access_token=${TOKEN}`)
  .then(r => r.json())
  .then(({ account_id }) =>
    fetch(`https://graph.facebook.com/v20.0/act_${account_id}/adspixels?fields=name,id,last_fired_time,code&access_token=${TOKEN}`)
      .then(r => r.json())
  ).then(data => console.log(JSON.stringify(data, null, 2)));
```

## Pixels

| Pixel Name | Pixel ID | Status | Used By |
|---|---|---|---|
| TRIIIPLE Studio's pixel | 639397552556252 | ✅ Active (fires daily) | Conversion campaign |
| Shopify_Triiiple_online | 1441438253353263 | ⚠️ Stale (last fired 2026-06-02) | Not used — investigate in Shopify Admin |

**Conversion campaign setup:**
- optimization_goal: OFFSITE_CONVERSIONS → PURCHASE
- product_set_id: 27080259148325878 (Shopify catalog connected)
- variation: PRODUCT_SET_AND_WEBSITE

**Awareness campaign setup:**
- optimization_goal: AD_RECALL_LIFT
- promoted_object: page_id 624009770796180 (Facebook Page only, no pixel needed)

## Locale Targeting Reference

Meta locale targeting hits people whose **Facebook app language** is set to that locale — not ethnicity.

| Locale ID | Language | Notes |
|---|---|---|
| 7 | Simplified Chinese (zh_CN) | Mainland Chinese + some SG Chinese |
| 28 | Traditional Chinese (zh_TW) | Hong Kong, Taiwan, some SG |
| 2 | Malay (ms_MY) | Malay-speaking users in SG/MY |

**Important**: Many Chinese/Malay Singaporeans use English-language Facebook. Locale targeting reduces audience size. With Advantage Audience ON, Meta will find the right people anyway — consider removing locales to widen reach.

## Budget Rules of Thumb

| Daily Budget | Recommended Structure |
|---|---|
| < $20/day | 2 campaigns max (Awareness + Conversion), SG only |
| $20–50/day | Add Regional campaign (KR, JP, HK, MY) |
| $50+/day | Separate SG vs Regional, add Traffic campaigns back |

## Custom Audiences on File

| ID | Used In |
|---|---|
| 52534833733322 | Awareness adset |
| 6939794899718 | Traffic 40+ (paused) |
| 52534833733522 | Traffic 40+ (paused) |
