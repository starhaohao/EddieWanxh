# Meta Ads Daily Check — TRIIIPLE Studio

Use this skill when the user wants to do a daily/weekly ad check, review performance, or ask what to change.

## The 5-Minute Morning Routine

Run the daily metrics script below, then check these numbers in order:

### 1. Is it spending?
- If spend is 0 or very low → campaign may be paused, rejected, or in learning
- Expected: Conversion ~$15/day, Awareness ~$5/day

### 2. CTR (Click-Through Rate)
| Campaign | Healthy | Warning | Action needed |
|---|---|---|---|
| Conversion | > 2.0% | 1–2% | < 1% |
| Awareness | > 0.8% | 0.4–0.8% | < 0.4% |

### 3. CPM (Cost per 1,000 impressions)
- SG normal range: $8–$18
- > $20 = expensive, audience too small or high competition
- < $6 = suspiciously cheap, check placement quality

### 4. Frequency
- < 2.0 = fine, fresh audience
- 2.0–3.0 = monitor
- > 3.0 = ad fatigue, **change creative or expand audience**

### 5. Purchases (Conversion campaign only)
- Check `actions` for `purchase` count
- If 0 purchases after $30+ spend in a sprint → something wrong (pixel? landing page? price?)
- Target: CPA (cost per purchase) under $25

---

## Daily Metrics Script

Paste in Chrome DevTools console on any Meta Business Manager page.

```javascript
const TOKEN = "PASTE_FRESH_TOKEN";
const adsets = [
  { id: "52537734326322", label: "Awareness" },
  { id: "52538438026322", label: "Conversion" }
];

Promise.all(adsets.map(a =>
  fetch(`https://graph.facebook.com/v20.0/${a.id}/insights?fields=impressions,reach,spend,inline_link_clicks,ctr,cpm,frequency,actions,cost_per_action_type&date_preset=last_7d&access_token=${TOKEN}`)
    .then(r => r.json())
    .then(r => ({ label: a.label, data: r.data?.[0] }))
)).then(results => {
  results.forEach(({ label, data }) => {
    if (!data) return console.log(`\n📊 ${label}: No data`);
    const purchases = data.actions?.find(a => a.action_type === "purchase");
    const cpa = data.cost_per_action_type?.find(a => a.action_type === "purchase");
    console.log(`\n📊 ${label}`);
    console.log(`  Spend:      $${parseFloat(data.spend).toFixed(2)}`);
    console.log(`  Impressions: ${data.impressions}`);
    console.log(`  Reach:       ${data.reach}`);
    console.log(`  CTR:         ${parseFloat(data.ctr).toFixed(2)}%`);
    console.log(`  CPM:         $${parseFloat(data.cpm).toFixed(2)}`);
    console.log(`  Frequency:   ${parseFloat(data.frequency).toFixed(2)}`);
    if (purchases) {
      console.log(`  Purchases:   ${purchases.value}`);
      console.log(`  CPA:         $${parseFloat(cpa?.value || 0).toFixed(2)}`);
    } else {
      console.log(`  Purchases:   0`);
    }
  });
});
```

---

## When to Change Targeting

### Change NOW if:
- Frequency > 3 for 3+ consecutive days → add new creative or widen age range
- Zero purchases after $50 cumulative spend → check pixel firing in Event Manager
- CPM > $22 consistently → audience too narrow, consider relaxing locales

### Change after 7+ days of data:
- CTR < 1% on Conversion → try removing locale targeting (widen audience)
- All spend going to one age group → check if it's actually converting or just clicking

### Do NOT change if:
- Numbers look bad on day 1–2 of a new sprint (learning phase, wait 3 days)
- One day anomaly (holiday, Meta outage)
- Frequency just hit 2.5 (not 3 yet)

---

## Targeting Change Scripts

### Option A — Remove locales (widen Conversion audience)
Use if CTR < 1% or CPM > $20 for 5+ days.
```javascript
const TOKEN = "PASTE_TOKEN";
const body = new URLSearchParams({
  access_token: TOKEN,
  targeting: JSON.stringify({
    age_min: 18, age_max: 65, genders: [1],
    geo_locations: { countries: ["SG"], location_types: ["home","recent"] },
    brand_safety_content_filter_levels: ["FACEBOOK_RELAXED","AN_RELAXED"],
    targeting_automation: { advantage_audience: 0 }
  })
});
fetch(`https://graph.facebook.com/v20.0/52538438026322`, { method: "POST", body })
  .then(r => r.json()).then(r => console.log(r.success ? "✅ Locales removed" : "❌", r));
```

### Option B — Focus Conversion on 25–44 only
Use if 18–24 and 45+ are burning budget with no purchases after 2+ weeks.
```javascript
const TOKEN = "PASTE_TOKEN";
const body = new URLSearchParams({
  access_token: TOKEN,
  targeting: JSON.stringify({
    age_min: 25, age_max: 44, genders: [1],
    geo_locations: { countries: ["SG"], location_types: ["home","recent"] },
    locales: [7, 28, 2],
    brand_safety_content_filter_levels: ["FACEBOOK_RELAXED","AN_RELAXED"],
    targeting_automation: { advantage_audience: 0 }
  })
});
fetch(`https://graph.facebook.com/v20.0/52538438026322`, { method: "POST", body })
  .then(r => r.json()).then(r => console.log(r.success ? "✅ Age tightened to 25–44" : "❌", r));
```

### Option C — Re-enable Traffic campaigns (when budget hits $50+/day)
```javascript
const TOKEN = "PASTE_TOKEN";
const body = new URLSearchParams({ access_token: TOKEN, status: "ACTIVE" });
fetch(`https://graph.facebook.com/v20.0/52537484163322`, { method: "POST", body })
  .then(r => r.json()).then(r => console.log(r.success ? "✅ Traffic campaign reactivated" : "❌", r));
```

---

## Weekly Review Questions (ask Claude with /meta-daily)

1. Paste the 7-day metrics output → I'll flag what needs changing
2. "CTR dropped this week" → I'll suggest creative refresh or audience tweak
3. "No purchases this sprint" → I'll help debug pixel or landing page
4. "Should I increase budget?" → I'll check frequency and CPM first

---

## Benchmarks for TRIIIPLE (SG menswear, ~$20/day)

| Metric | Good | OK | Investigate |
|---|---|---|---|
| CPC | < $0.50 | $0.50–$1.00 | > $1.00 |
| CTR (Conversion) | > 2.5% | 1.5–2.5% | < 1.5% |
| CPM | $8–$15 | $15–$20 | > $20 |
| Frequency | < 2.5 | 2.5–3.5 | > 3.5 |
| CPA (purchase) | < $15 | $15–$25 | > $25 |
| ROAS | > 3× | 2–3× | < 2× |
