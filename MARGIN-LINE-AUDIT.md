# MARGIN LINE AUDIT REPORT
## TRIIIPLE Studio Theme - About Us Page & Site-wide Analysis

**Audit Date:** July 7, 2026  
**Branch:** `claude/margin-line-audit-m6diwx`  
**Scope:** Horizontal margin/padding consistency ("margin lines") across the TRIIIPLE Studio Shopify theme

---

## Executive Summary

This audit examined horizontal margin/padding consistency across all sections in the TRIIIPLE Studio theme, with particular focus on the About Us page (`pages/about-us`). The audit revealed:

- **✅ Desktop (>989px):** Mostly consistent at **40px** horizontal margins
- **⚠️ Tablet (750-989px):** Mixed padding values (16px, 24px, variable)
- **✅ Mobile (≤749px):** Consistent at **16px** horizontal margins
- **🔴 Critical:** No tablet breakpoint in `sale-collection-grid.liquid` used on About Us page
- **🔴 Critical:** Inconsistent use of `--outer` variable vs. hardcoded values

---

## Part 1: About Us Page Specific Audit

### Page Template Structure
**File:** `templates/page.about-us.json`

The About Us page uses 2 main sections:
1. `page-about-us` - Main content section (hero, principles, manifesto, closing)
2. `sale-collection-grid` - Product category grid (4 tiles)

### Section-by-Section Analysis

#### Section 1: Sale Collection Grid
**File:** `sections/sale-collection-grid.liquid`

```
Current CSS:
.scg {
  padding: 64px 40px;  /* Desktop: 40px L/R */
}

@media (max-width: 749px) {
  .scg { padding: 40px 16px; }  /* Mobile: 16px L/R */
}
```

| Breakpoint | Horizontal Padding | Status |
|---|---|---|
| Desktop (>989px) | **40px** | ✅ Standard |
| Tablet (750-989px) | **16px** (mobile fallback) | ⚠️ Inconsistent |
| Mobile (≤749px) | **16px** | ✅ Standard |

**Issue:** No explicit tablet breakpoint. Falls back to mobile padding (16px) between 750-989px.

#### Section 2: Landing Collections Grid (Reference)
**File:** `sections/landing-collections-grid.liquid`

```
Current CSS:
.lcg {
  padding: 64px 40px;  /* Desktop: 40px L/R */
}

@media (max-width: 1000px) {
  .lcg { padding: 48px 24px; }  /* Tablet: 24px L/R */
}

@media (max-width: 749px) {
  .lcg { padding: 40px 16px; }  /* Mobile: 16px L/R */
}
```

| Breakpoint | Horizontal Padding | Status |
|---|---|---|
| Desktop (>989px) | **40px** | ✅ Standard |
| Tablet (750-1000px) | **24px** | ✅ Mid-point |
| Mobile (≤749px) | **16px** | ✅ Standard |

**Status:** This is the reference implementation with proper tablet breakpoint.

---

## Part 2: Site-Wide Horizontal Padding Audit

### Summary of All Sections with Padding Rules

#### Desktop Standard Padding (>989px)

| Section | Horizontal Padding | Status |
|---|---|---|
| sale-collection-grid | **40px** | ✅ Standard |
| landing-collections-grid | **40px** | ✅ Standard |
| landing-testimonials | **40px** | ✅ Standard |
| blog.liquid | `var(--outer, 16px)` | ⚠️ Variable |
| edm-signup | `var(--page-margin)` | ⚠️ Variable |
| collection-product-focus-hero | `var(--outer)` | ⚠️ Variable |

#### Problematic Sections (Inconsistent or Missing Breakpoints)

1. **sale-collection-grid.liquid** - No tablet breakpoint
2. **blog.liquid** - Uses `--outer` variable (no consistency check)
3. **edm-signup.liquid** - Uses `--page-margin` variable
4. **collection-product-focus-hero.liquid** - Uses `--outer` variable

#### CSS Custom Properties Used

- `--outer` - Appears to be outer margin/padding
- `--page-margin` - Full page margin
- Default fallbacks: typically `16px` or `24px`

---

## Part 3: Standardization Recommendations

### Recommended Standard Margin Template

All sections should follow this pattern:

```css
.section-class {
  padding: 64px 40px;  /* Desktop: 40px L/R */
}

@media (max-width: 989px) {
  .section-class {
    padding: 48px 24px;  /* Tablet: 24px L/R */
  }
}

@media (max-width: 749px) {
  .section-class {
    padding: 40px 16px;  /* Mobile: 16px L/R */
  }
}
```

### Standard Breakpoints & Margins

| Device | Breakpoint | Horizontal Margin | Vertical Padding |
|---|---|---|---|
| Desktop | > 989px | **40px** | **64px** |
| Tablet | 750-989px | **24px** | **48px** |
| Mobile | ≤ 749px | **16px** | **40px** |

### Migration Path

1. ✅ **Phase 1:** Add tablet breakpoint to `sale-collection-grid.liquid`
2. ✅ **Phase 2:** Audit and update all `section-*.liquid` files
3. ⚠️ **Phase 3:** Standardize CSS variable usage (--outer, --page-margin, etc.)
4. 📋 **Phase 4:** Document in CLAUDE.md

---

## Part 4: Critical Issues

### 🔴 Issue #1: Sale Collection Grid Missing Tablet Breakpoint
**Severity:** HIGH  
**File:** `sections/sale-collection-grid.liquid`  
**Impact:** About Us page shows 16px margins on tablets when 24px is expected

**Fix:**
```css
@media (max-width: 989px) {
  .scg { padding: 48px 24px; }
}
@media (max-width: 749px) {
  .scg { padding: 40px 16px; }
}
```

### 🔴 Issue #2: Inconsistent CSS Variable Usage
**Severity:** MEDIUM  
**Files:** 
- `sections/blog.liquid` - `var(--outer, 16px)`
- `sections/edm-signup.liquid` - `var(--page-margin)`
- `sections/collection-product-focus-hero.liquid` - `var(--outer)`

**Impact:** Inconsistent horizontal margins across the site depending on CSS variable availability

### 🟡 Issue #3: No Tablet-Specific Breakpoint in Some Sections
**Severity:** MEDIUM  
**Files:** Multiple sections jump directly from desktop 40px to mobile 16px without tablet transition

---

## Part 5: Visual Margin Comparison

### Current State (About Us Page)

```
DESKTOP (>989px)                    TABLET (750-989px)                 MOBILE (≤749px)
┌─────────────────────────────┐    ┌──────────────────────┐           ┌──────────────┐
│◄─ 40px ─►content◄─ 40px ─►│    │◄─ 16px ─►content◄─ 16px ─►│       │◄─ 16px ─►content│
│ ┌──────────────────────┐   │    │ ┌──────────────────┐ │       │ ┌──────────────┐│
│ │   Product Grid       │   │    │ │ Product Grid     │ │       │ │ Product Grid ││
│ │ (sale-collection)    │   │    │ │ (shifts to mobile│ │       │ │ (stacked)    ││
│ │ 2 columns, 16px gap  │   │    │ │  padding - issue)│ │       │ │ 1 column     ││
│ └──────────────────────┘   │    │ └──────────────────┘ │       │ └──────────────┘│
└─────────────────────────────┘    └──────────────────────┘           └──────────────┘
          ✅ Correct                       ⚠️ Inconsistent               ✅ Correct
```

### Recommended State (After Fix)

```
DESKTOP (>989px)                    TABLET (750-989px)                 MOBILE (≤749px)
┌─────────────────────────────┐    ┌──────────────────────┐           ┌──────────────┐
│◄─ 40px ─►content◄─ 40px ─►│    │◄─ 24px ─►content◄─ 24px ─►│      │◄─ 16px ─►content│
│ ┌──────────────────────┐   │    │ ┌────────────────┐  │       │ ┌──────────────┐│
│ │   Product Grid       │   │    │ │ Product Grid   │  │       │ │ Product Grid ││
│ │ (2 columns)          │   │    │ │ (2 columns)    │  │       │ │ (stacked)    ││
│ │ 16px gap             │   │    │ │ 16px gap       │  │       │ │ 1 column     ││
│ └──────────────────────┘   │    │ └────────────────┘  │       │ └──────────────┘│
└─────────────────────────────┘    └──────────────────────┘           └──────────────┘
          ✅ 40px                         ✅ 24px                    ✅ 16px
```

---

## Part 6: Sections Requiring Updates

### Priority 1 (Critical for About Us Page)

| File | Current Desktop | Current Tablet | Current Mobile | Recommended |
|---|---|---|---|---|
| `sale-collection-grid.liquid` | 40px | 16px ❌ | 16px | 40px / **24px** / 16px |

### Priority 2 (Top-Level Sections)

| File | Issue | Fix |
|---|---|---|
| `landing-collections-grid.liquid` | Reference implementation | No change needed ✅ |
| `landing-testimonials.liquid` | 64px 40px only | Add tablet: 48px 24px |
| `section-rich-text.liquid` | Check implementation | Verify breakpoints |
| `section-hero.liquid` | Check implementation | Verify breakpoints |

### Priority 3 (CSS Variable Standardization)

Files using `--outer` or `--page-margin`:
- `sections/blog.liquid`
- `sections/edm-signup.liquid`
- `sections/collection-product-focus-hero.liquid`
- Others using `var(--outer, 16px)`

---

## Audit Checklist

- [x] Identify all sections used on About Us page
- [x] Analyze current margin/padding values
- [x] Compare against theme standards from CLAUDE.md
- [x] Document inconsistencies
- [x] Create recommended standard
- [ ] **TODO:** Implement fixes in `sale-collection-grid.liquid`
- [ ] **TODO:** Audit all other sections
- [ ] **TODO:** Test on actual devices/responsive view
- [ ] **TODO:** Update CLAUDE.md with standards
- [ ] **TODO:** Commit changes and create PR

---

## Related Files

- `/templates/page.about-us.json` - About Us page template
- `/sections/sale-collection-grid.liquid` - Grid section (needs update)
- `/sections/landing-collections-grid.liquid` - Reference implementation
- `/CLAUDE.md` - Theme documentation (needs update with standards)
- `/layout/theme.liquid` - Global CSS variables and theming

---

## Testing Recommendations

1. **Visual Inspection:**
   - Desktop (1920px+)
   - Tablet (750px-989px)
   - Mobile (375px)

2. **Browser DevTools:**
   - Inspect computed padding values
   - Verify media query activation
   - Check CSS variable inheritance

3. **Real Devices:**
   - iPhone (375px)
   - iPad (768px, 1024px)
   - Desktop browsers (Chrome, Safari, Firefox)

---

## Conclusion

The About Us page has an **inconsistent tablet experience** due to missing tablet breakpoint in the `sale-collection-grid` section. This is the primary issue identified in this audit. Implementing the recommended standard across all sections will ensure consistent, professional horizontal alignment ("margin lines") across all devices.

**Recommended Next Step:** Update `sale-collection-grid.liquid` to add tablet breakpoint with 24px horizontal padding.
