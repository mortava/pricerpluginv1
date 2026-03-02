# OpenBroker Labs — Brand & Design System

> **CRITICAL: This file MUST be injected into every AI-generated application to maintain brand consistency across the OpenBroker Labs ecosystem. All UI decisions MUST reference this document. Do not deviate from these rules under any circumstances.**

---

## 1. Brand Identity

### Parent Company
- **Name:** OpenBroker Labs
- **Tagline:** Mortgage Technology, Open by Design
- **Brand Text Color:** Always render "OpenBroker Labs" in medium slate `#71717A` — never pure black, never light gray, never any other color

### Product Ecosystem

| Product | Full Name | Description | Icon |
|---------|-----------|-------------|------|
| OpenPrice | OpenBroker Labs · OpenPrice | Mortgage Pricing Engine | Bold letter "P" |
| VeriQual | OpenBroker Labs · VeriQual | AVM / AUS Platform | Double V chevron with apex dot |
| OpenBroker LOS | OpenBroker Labs · OpenBroker LOS | Loan Origination System | Folder with pipeline nodes |
| Marketing Mgr | OpenBroker Labs · Marketing Mgr | Campaign & Content Hub | Megaphone with signal waves |

### Naming Convention
- All new products under OpenBroker Labs follow the pattern: `OpenBroker Labs · [ProductName]`
- Product names should be short (1-2 words), clear about function, and avoid jargon
- The "Open" prefix is reserved for core platform products (OpenPrice, OpenBroker LOS)

---

## 2. Color System

### Core Palette

```css
:root {
  /* Backgrounds */
  --color-bg:           #FFFFFF;  /* Primary background — pure white */
  --color-surface:      #FAFAFA;  /* Cards, hover states, secondary surfaces */

  /* Text */
  --color-primary:      #000000;  /* Headings, body text, primary actions */
  --color-secondary:    #A1A1AA;  /* Descriptions, placeholders, muted text */
  --color-brand-text:   #71717A;  /* "OpenBroker Labs" name — ALWAYS this color */

  /* Borders & Dividers */
  --color-border:       #27272A;  /* Use at 15-30% opacity for subtle borders */
  --color-divider:      #27272A12; /* Section dividers */

  /* Status */
  --color-success:      #22C55E;  /* Confirmations, completed states, positive */
  --color-error:        #EF4444;  /* Errors, destructive actions, alerts */
  --color-warning:      #F59E0B;  /* Warnings, pending states */

  /* Interactive */
  --color-hover-bg:     #F4F4F5;  /* Button/card hover background */
  --color-focus-ring:   #000000;  /* Input focus border */
}
```

### Usage Rules

1. **NO accent colors.** The brand is black, white, and gray. Color only appears in status indicators (success, error, warning).
2. **Borders are always subtle.** Use `--color-border` at `15%` opacity for cards, `30%` for hover states. Never full-opacity borders.
3. **"OpenBroker Labs" text** is always `--color-brand-text` (`#71717A`). This applies everywhere — navbars, footers, headings, login screens.
4. **Dark mode** is not currently supported. All applications use the white background system.
5. **Never use blue, indigo, teal, or any other hue** as a brand or accent color. The aesthetic is strictly monochrome.

---

## 3. Typography

### Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
```

- **Preferred font:** Inter (load from Google Fonts if available)
- **Fallback:** System font stack
- **Never use:** Serif fonts, decorative fonts, monospace for UI text

### Scale

| Element | Size | Weight | Letter Spacing | Color |
|---------|------|--------|----------------|-------|
| Page Title (h1) | 28px | 700 | -0.04em | `#000000` |
| Section Title (h2) | 22px | 700 | -0.03em | `#000000` |
| Subsection (h3) | 18px | 600 | -0.02em | `#000000` |
| Body Text | 14-15px | 400 | -0.01em | `#000000` |
| Description / Muted | 13-14px | 400 | 0 | `#A1A1AA` |
| Label | 13px | 500 | 0 | `#000000` |
| Tag / Badge | 11px | 500 | 0.02em | `#A1A1AA` |
| Uppercase Label | 11px | 600 | 0.08em | `#71717A` |
| Footer / Legal | 12px | 400 | 0 | `#A1A1AA` |

### Rules
- **Negative letter-spacing** on all headings (tighter = more modern)
- **Never bold body text** unless it's a label or inline emphasis
- **All caps** only for small category labels (11px, `letter-spacing: 0.08em`)

---

## 4. Spacing & Layout

### Spacing Scale (base-4)

```
4px   — tight spacing (between icon and text)
8px   — compact (between related elements)
12px  — default inner padding
16px  — standard gap between elements
20px  — card inner padding
24px  — section padding
32px  — between major sections
48px  — page section separation
60px  — top padding on centered layouts
```

### Layout Principles
- **Max content width:** 520px for login/selector flows, 1200px for dashboards
- **Center-aligned** for auth screens and product selectors
- **Left-aligned** for dashboards and data-heavy screens
- **Page padding:** 24px horizontal on mobile, 40px on desktop
- **Navbar height:** ~56px (16px vertical padding)

---

## 5. Components

### Buttons

**Primary (filled)**
```css
background: #000000;
color: #FFFFFF;
border: none;
border-radius: 8px;
padding: 11px 24px;
font-size: 14px;
font-weight: 600;
letter-spacing: -0.01em;
cursor: pointer;
transition: opacity 0.15s;
/* Hover: opacity 0.85 */
```

**Secondary (outlined)**
```css
background: #FFFFFF;
color: #000000;
border: 1px solid rgba(39, 39, 42, 0.25);
border-radius: 8px;
padding: 11px 24px;
font-size: 14px;
font-weight: 500;
cursor: pointer;
transition: background 0.15s;
/* Hover: background #FAFAFA */
```

**Destructive**
```css
background: #EF4444;
color: #FFFFFF;
border: none;
border-radius: 8px;
/* Same padding/font as primary */
```

### Inputs

```css
width: 100%;
padding: 10px 12px;
font-size: 14px;
border: 1px solid rgba(39, 39, 42, 0.3);
border-radius: 8px;
background: #FFFFFF;
color: #000000;
outline: none;
transition: border-color 0.15s;
/* Focus: border-color #000000 */
/* Placeholder color: #A1A1AA */
```

### Cards / Product Tiles

```css
display: flex;
align-items: center;
gap: 16px;
padding: 18px 20px;
background: #FFFFFF;
border: 1px solid rgba(39, 39, 42, 0.15);
border-radius: 12px;
cursor: pointer;
transition: all 0.2s ease;
/* Hover: background #FAFAFA, border-color rgba(39, 39, 42, 0.3) */
/* Selected: background rgba(34, 197, 94, 0.08), border-color rgba(34, 197, 94, 0.4) */
```

### Icon Containers

```css
width: 48px;
height: 48px;
display: flex;
align-items: center;
justify-content: center;
background: #FAFAFA;
border-radius: 10px;
/* Hover: background rgba(0, 0, 0, 0.08) */
```

### Tags / Badges

```css
font-size: 11px;
font-weight: 500;
color: #A1A1AA;
background: #FAFAFA;
padding: 3px 8px;
border-radius: 4px;
letter-spacing: 0.02em;
```

---

## 6. Status Indicators

Status indicators are the ONLY place color is used in the UI outside of monochrome.
They communicate system feedback: something succeeded, failed, or needs attention.
Every status indicator uses three coordinated layers of the SAME base color at different opacities.

### The Three-Layer Pattern

Each status state uses its base color at three intensity levels:

| Layer | Opacity | Purpose |
|-------|---------|---------|
| Background | 8% (`0.08`) | Barely-visible tint behind the message. Keeps it subtle, doesn't break the monochrome layout. |
| Border | 20% (`0.2`) | Slightly stronger outline to give the banner/container definition without being loud. |
| Text | 100% (full) | The actual message text at full color strength so it's readable. |

### Status Definitions

**Success — `#22C55E` (Muted Green)**
Use for: Confirmations, completed actions, positive outcomes.

```css
/* Success Banner */
.status-success {
  background: rgba(34, 197, 94, 0.08);    /* barely-there green tint */
  border: 1px solid rgba(34, 197, 94, 0.2); /* subtle green outline */
  color: #22C55E;                            /* full green text */
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
}
```

Real-world examples in OpenBroker Labs apps:
- OpenPrice: "Pricing scenario saved successfully"
- OpenPrice: "Rate lock confirmed — expires 03/15/2026"
- VeriQual: "Borrower meets all eligibility requirements"
- VeriQual: "AUS approval received — DU Approve/Eligible"
- OpenBroker LOS: "Loan file submitted to underwriting"
- OpenBroker LOS: "Document package uploaded (12 files)"
- Marketing Mgr: "Campaign published to 2,400 contacts"
- Marketing Mgr: "Email template saved"

**Error — `#EF4444` (Soft Red)**
Use for: Failures, destructive actions, validation errors, system problems.

```css
/* Error Banner */
.status-error {
  background: rgba(239, 68, 68, 0.08);    /* barely-there red tint */
  border: 1px solid rgba(239, 68, 68, 0.2); /* subtle red outline */
  color: #EF4444;                            /* full red text */
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
}
```

Real-world examples:
- OpenPrice: "Unable to retrieve investor pricing — connection timeout"
- OpenPrice: "LTV exceeds maximum for this product (95% max)"
- VeriQual: "Credit score below minimum threshold (620)"
- VeriQual: "AVM confidence score too low — manual appraisal required"
- OpenBroker LOS: "Missing required documents: W-2, bank statements"
- OpenBroker LOS: "Loan file rejected — see conditions"
- Marketing Mgr: "Email delivery failed — 38 bounced addresses"
- Login: "Please enter your credentials"
- Login: "Invalid email or password"

**Warning — `#F59E0B` (Amber)**
Use for: Pending states, items needing attention, non-critical issues.

```css
/* Warning Banner */
.status-warning {
  background: rgba(245, 158, 11, 0.08);    /* barely-there amber tint */
  border: 1px solid rgba(245, 158, 11, 0.2); /* subtle amber outline */
  color: #F59E0B;                             /* full amber text */
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
}
```

Real-world examples:
- OpenPrice: "Rate lock expiring in 3 days — action required"
- OpenPrice: "Pricing data is 24+ hours old — refresh recommended"
- VeriQual: "DTI at 48.5% — close to maximum threshold (50%)"
- VeriQual: "Property in flood zone — additional insurance may be required"
- OpenBroker LOS: "Loan in suspended status — awaiting borrower documentation"
- OpenBroker LOS: "Closing date is within 5 business days — conditions still outstanding"
- Marketing Mgr: "Campaign scheduled but no audience selected"
- Marketing Mgr: "3 contacts have unsubscribed since last send"

### Status Indicator Variants

**Inline Status (inside tables/lists)**
```css
/* Small dot + text for table rows */
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
}
.status-dot--success { background: #22C55E; }
.status-dot--error   { background: #EF4444; }
.status-dot--warning { background: #F59E0B; }
.status-dot--neutral { background: #A1A1AA; }
```

Use in: Loan pipeline tables, pricing status columns, document checklists.

Example table row:
```
● Active    |  Loan #20260301  |  John Smith  |  $425,000  |  Submitted
● Suspended |  Loan #20260228  |  Jane Doe    |  $680,000  |  Awaiting Docs
● Denied    |  Loan #20260225  |  Bob Lee     |  $310,000  |  Credit Issue
```

**Toast Notifications (temporary pop-up messages)**
```css
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  animation: fadeIn 0.15s ease;
  /* Auto-dismiss after 4 seconds */
  /* Use same background/border/text pattern as banners above */
}
```

**Form Validation (inline field errors)**
```css
/* Input in error state */
.input--error {
  border-color: rgba(239, 68, 68, 0.5);
}
/* Error message below input */
.input-error-text {
  font-size: 12px;
  color: #EF4444;
  margin-top: 4px;
}
```

Example:
```
Email
[                           ]  ← border turns red
  Please enter a valid email address    ← red text below
```

### Rules
- Status colors are the ONLY non-monochrome colors allowed in the entire UI
- Never use status colors for branding, accents, backgrounds, or decorative purposes
- Always use all three layers together (background + border + text) for banner-style indicators
- Dot indicators are acceptable in tables and lists where space is limited
- Toast notifications auto-dismiss after 4 seconds and use the same three-layer pattern
- Never stack more than one toast at a time

---

## 7. Navigation Pattern

The navigation is the single most important element for ecosystem consistency.
Every app MUST use the exact same nav structure so users feel like they're
moving between rooms in the same building, not visiting different websites.

### Top Navbar (all apps)

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo] OpenBroker Labs · OpenPrice          jay@oaktree.com  [↗]  │
└─────────────────────────────────────────────────────────────────────┘
```

```css
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 40px;
  border-bottom: 1px solid rgba(39, 39, 42, 0.15);
  background: #FFFFFF;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.navbar-brand-text {
  font-size: 15px;
  font-weight: 600;
  color: #71717A;           /* ALWAYS medium slate — never black */
  letter-spacing: -0.02em;
}

.navbar-user {
  font-size: 13px;
  color: #A1A1AA;           /* Muted until hover */
  cursor: pointer;
  transition: color 0.15s;
}
.navbar-user:hover {
  color: #000000;           /* Reveal on hover */
}
```

### Navbar Rules
- Logo icon (product-specific) + "OpenBroker Labs" or "OpenBroker Labs · [Product]" ALWAYS left-aligned
- "OpenBroker Labs" text is ALWAYS `#71717A` — never black, never white
- User actions (profile, sign out, settings) ALWAYS right-aligned
- User action text starts muted (`#A1A1AA`) and shifts to black on hover
- Bottom border is always `1px solid rgba(39, 39, 42, 0.15)` — never darker
- Navbar background is always `#FFFFFF` — never transparent, never colored
- Padding: `16px 40px` on desktop, `16px 16px` on mobile
- No dropdown menus in the navbar — use a separate settings page

### Navbar Variations by App

```
OpenPrice:     [P]  OpenBroker Labs · OpenPrice
VeriQual:      [V]  OpenBroker Labs · VeriQual
OpenBroker LOS:[📁] OpenBroker Labs · OpenBroker LOS
Marketing Mgr: [📢] OpenBroker Labs · Marketing Mgr
Hub/Login:     [⊕]  OpenBroker Labs
```

The hub/login page shows ONLY "OpenBroker Labs" without a product suffix.
Individual apps always include the ` · ProductName` suffix.

### Footer (all apps)

```
─────────────────────────────────────────────────────────────────────
© 2026 OpenBroker Labs                       Privacy  Terms  Support
```

```css
.footer {
  padding: 12px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  border-top: 1px solid rgba(39, 39, 42, 0.1);
  background: #FFFFFF;
}

.footer-copyright {
  color: #71717A;        /* Brand text color for company name */
}

.footer-links a {
  color: #A1A1AA;        /* Muted links */
  text-decoration: none;
  margin-left: 20px;
}
.footer-links a:hover {
  color: #000000;
}
```

### Footer Rules
- "OpenBroker Labs" in the copyright is ALWAYS `#71717A`
- Links are muted `#A1A1AA`, hover to `#000000`
- Position: fixed to viewport bottom on short pages, flows with content on long pages
- Always include: Privacy, Terms, Support
- Never add social media icons, marketing text, or product logos to the footer
- Same footer on every app — no variations

---

## 8. Motion & Transitions

Motion in OpenBroker Labs apps is functional, not decorative.
Every transition exists to confirm an action happened — never to entertain.
The apps should feel FAST. Mortgage professionals don't have time for animations.

### Timing Rules

```css
/* Standard — buttons, links, inputs, small elements */
transition: all 0.15s ease;

/* Cards and larger containers */
transition: all 0.2s ease;

/* Absolute maximum for any transition */
/* NEVER exceed 0.3s for anything */
```

### Hover Behaviors by Element

**Primary Buttons (black filled)**
```css
/* Default */
background: #000000;
opacity: 1;

/* Hover — subtle dim, not a color change */
opacity: 0.85;
```
Why: The button stays black. It just dims slightly to confirm the cursor is there. No color shifts, no shadows appearing, no scale changes.

**Secondary Buttons (outlined)**
```css
/* Default */
background: #FFFFFF;
border: 1px solid rgba(39, 39, 42, 0.25);

/* Hover — fill shifts to surface gray */
background: #FAFAFA;
```

**Cards / Product Tiles**
```css
/* Default */
background: #FFFFFF;
border: 1px solid rgba(39, 39, 42, 0.15);

/* Hover — background tints AND border strengthens */
background: #FAFAFA;
border-color: rgba(39, 39, 42, 0.3);
```
Why: Two things change together — the fill gets slightly gray and the border gets slightly more visible. This makes the card feel "lifted" without using box-shadows.

**Links and Text Buttons**
```css
/* Default */
color: #A1A1AA;

/* Hover — shift from muted to primary */
color: #000000;
```
Why: Text "wakes up" when you hover. Goes from background element to foreground. Simple and effective.

**Icon Containers**
```css
/* Default */
background: #FAFAFA;

/* Hover — slightly darker */
background: rgba(0, 0, 0, 0.08);
```

**Table Rows**
```css
/* Default */
background: transparent;

/* Hover — barely-there highlight */
background: #FAFAFA;
```

### What NEVER to Use

```css
/* ❌ BANNED — Bounce/elastic effects */
transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* ❌ BANNED — Scale transforms on hover */
transform: scale(1.02);

/* ❌ BANNED — Box shadow appearing on hover */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

/* ❌ BANNED — Color transitions to non-monochrome */
background: #4F46E5; /* No. Never. */

/* ❌ BANNED — Slow transitions */
transition: all 0.5s ease;

/* ❌ BANNED — Loading spinners */
/* Use skeleton screens instead (gray placeholder blocks that pulse) */

/* ❌ BANNED — Fade-in on page load */
/* Content should appear instantly */

/* ❌ BANNED — Parallax scrolling */
/* ❌ BANNED — Scroll-triggered animations */
/* ❌ BANNED — Typewriter text effects */
```

### Loading States

Instead of spinners, use skeleton screens:

```css
.skeleton {
  background: linear-gradient(90deg, #FAFAFA 25%, #F4F4F5 50%, #FAFAFA 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

Use skeleton blocks that match the shape of the content being loaded:
- Text line: `height: 14px; width: 60%; margin-bottom: 8px;`
- Card: `height: 72px; width: 100%; border-radius: 12px;`
- Table row: `height: 48px; width: 100%;`

---

## 9. Iconography

Icons are visual shorthand. In a fast-paced mortgage workflow, a broker should
understand what a button does from the icon alone before reading the label.

### Style Rules

```
Style:        Stroke-based outlines only (never filled/solid)
Stroke Width: 2px for standard, 2.5px for emphasis
Corners:      Round caps and round joins (strokeLinecap="round" strokeLinejoin="round")
Color:        #000000 default, #A1A1AA for muted/disabled states
Source:       Lucide Icons (preferred), custom SVG when needed
```

### Size Scale

| Context | Size | Example Usage |
|---------|------|---------------|
| Inline (next to text) | 16px | Button icons, nav items, table actions |
| Container (inside a box) | 22-28px | Product tiles, sidebar nav, card headers |
| Hero (standalone focal point) | 48-56px | Login screen logo, empty states, onboarding |

### Icon Usage Examples

```
Action          → Icon (Lucide name)
───────────────────────────────
Save            → Save (floppy disk)
Delete          → Trash2
Edit            → Pencil
Search          → Search
Filter          → SlidersHorizontal
Download        → Download
Upload          → Upload
Settings        → Settings
User/Profile    → User
Sign Out        → LogOut
Back/Navigate   → ChevronLeft
Forward/Next    → ChevronRight
Expand          → ChevronDown
Close/Dismiss   → X
Add/Create      → Plus
Success Check   → Check (in #22C55E)
Error/Alert     → AlertCircle (in #EF4444)
Warning         → AlertTriangle (in #F59E0B)
Info            → Info
Refresh         → RefreshCw
Copy            → Copy
External Link   → ExternalLink
Calendar/Date   → Calendar
Document/File   → FileText
Folder          → Folder
Lock/Rate Lock  → Lock
Dollar/Pricing  → DollarSign
Home/Property   → Home
```

### What NEVER to Use
- ❌ Filled/solid icon variants (always use stroke/outline)
- ❌ Emoji as functional UI icons (🏠 ❌ — use Lucide `Home` instead)
- ❌ Colored icons outside of status indicators
- ❌ Icon-only buttons without tooltips (always add `title` attribute)
- ❌ Animated icons (no spinning, pulsing, or bouncing icons)
- ❌ Icons larger than 56px (that's a logo, not an icon)
- ❌ Font Awesome, Material Icons, or other icon sets (Lucide only for consistency)

---

## 10. Data & Tables

Mortgage apps are data-heavy. Tables appear in loan pipelines, pricing grids,
document checklists, rate comparisons, and contact lists. Every table across
every OpenBroker Labs app must look identical.

### Table Structure

```css
/* Table Container */
.table-container {
  width: 100%;
  overflow-x: auto;              /* Horizontal scroll on mobile */
  border: 1px solid rgba(39, 39, 42, 0.12);
  border-radius: 12px;
}

/* Header Row */
.table-header th {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #71717A;                /* Brand slate — not black, not light gray */
  border-bottom: 1px solid rgba(39, 39, 42, 0.15);
  padding: 10px 16px;
  text-align: left;
  white-space: nowrap;
}

/* Data Rows */
.table-row td {
  font-size: 14px;
  color: #000000;
  border-bottom: 1px solid rgba(39, 39, 42, 0.08);
  padding: 12px 16px;
}

/* Row Hover */
.table-row:hover td {
  background: #FAFAFA;
}

/* Last Row — no bottom border */
.table-row:last-child td {
  border-bottom: none;
}
```

### Real-World Table Example (OpenPrice)

```
┌────────────────────────────────────────────────────────────────────┐
│  INVESTOR     PRODUCT        RATE    PRICE    LLPA     STATUS     │
├────────────────────────────────────────────────────────────────────┤
│  UWM          Conv 30yr      6.375   100.25   -0.50    ● Active   │
│  Rocket       Conv 30yr      6.500   100.00   -0.25    ● Active   │
│  PennyMac     FHA 30yr       5.875   101.00   -0.75    ● Stale    │
│  AmeriHome    VA 30yr        5.750   100.50    0.00    ● Active   │
└────────────────────────────────────────────────────────────────────┘
```

Header row: 11px, uppercase, slate, wide letter-spacing.
Data rows: 14px, black, normal weight.
Status column: Uses dot indicator (●) with color.
Hover: Entire row gets `#FAFAFA` background.

### Real-World Table Example (OpenBroker LOS Pipeline)

```
┌────────────────────────────────────────────────────────────────────┐
│  LOAN #        BORROWER       AMOUNT       STAGE        UPDATED   │
├────────────────────────────────────────────────────────────────────┤
│  OBL-20260301  John Smith     $425,000     Processing   2h ago    │
│  OBL-20260228  Jane Doe       $680,000     Underwriting 1d ago    │
│  OBL-20260225  Bob Lee        $310,000     Closing      3d ago    │
└────────────────────────────────────────────────────────────────────┘
```

### Empty States

When a table or list has no data, never show a blank screen. Show a centered message:

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-state-icon {
  /* Lucide stroke icon, 48px, color #A1A1AA */
  margin-bottom: 16px;
}

.empty-state-title {
  font-size: 15px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 4px;
}

.empty-state-description {
  font-size: 13px;
  color: #A1A1AA;
  margin-bottom: 20px;
  max-width: 300px;
}

.empty-state-cta {
  /* Use primary button style */
}
```

Real-world empty state examples:
- OpenPrice: Icon `DollarSign` → "No pricing scenarios yet" → "Create your first scenario"
- VeriQual: Icon `FileText` → "No borrower files" → "Start a new qualification"
- OpenBroker LOS: Icon `Folder` → "Your pipeline is empty" → "Import a loan file"
- Marketing Mgr: Icon `Mail` → "No campaigns created" → "Build your first campaign"

---

## 11. Do's and Don'ts

These are non-negotiable rules. AI code generators and human developers MUST follow
these without exception. If any rule conflicts with a design "improvement" idea,
the rule wins.

### DO ✅

- ✅ Keep everything monochrome — black, white, grays only
- ✅ Use subtle borders and shadows (if any shadow, use `0 1px 3px rgba(0,0,0,0.04)`)
- ✅ Render "OpenBroker Labs" in `#71717A` everywhere — navbar, footer, headings, splash screens
- ✅ Use negative letter-spacing on all headings (`-0.02em` to `-0.04em`)
- ✅ Keep interactions fast (`0.15s` for small elements, `0.2s` for cards)
- ✅ Use `border-radius: 8px` for inputs and buttons, `12px` for cards and containers
- ✅ Maintain tight, consistent spacing using the base-4 scale (4, 8, 12, 16, 20, 24, 32, 48, 60)
- ✅ Use opacity-based borders (`rgba(39, 39, 42, 0.15)`) not solid gray borders
- ✅ Use Lucide Icons exclusively — stroke style only
- ✅ Include loading skeleton screens for any async data
- ✅ Show empty states with icon + message + CTA for all empty lists/tables
- ✅ Use the three-layer status pattern (background 8% + border 20% + text 100%) for all alerts
- ✅ Make all tables horizontally scrollable on mobile
- ✅ Keep the navbar and footer identical across every app in the ecosystem

### DON'T ❌

- ❌ Add any brand/accent color (no blue, no teal, no indigo, no purple, no gradients)
- ❌ Use shadows heavier than `0 1px 3px rgba(0,0,0,0.04)` — if you think you need a bigger shadow, you don't
- ❌ Use rounded-full buttons (pill shape) — always `border-radius: 8px`
- ❌ Use serif or decorative fonts — Inter and system fonts only
- ❌ Add animations longer than `0.3s` or use bouncy/elastic/spring easing curves
- ❌ Use emoji as functional icons — use Lucide stroke icons
- ❌ Put "OpenBroker Labs" in black (`#000000`) or white (`#FFFFFF`) — always `#71717A`
- ❌ Use filled/solid icon styles — stroke outlines only
- ❌ Add colored backgrounds to page sections — everything is white (`#FFFFFF`) or near-white (`#FAFAFA`)
- ❌ Use horizontal rules (`<hr>`) or heavy dividers — use `1px solid rgba(39,39,42, 0.1)` borders
- ❌ Use loading spinners — use skeleton shimmer screens
- ❌ Add parallax scrolling, scroll-triggered animations, or typewriter effects
- ❌ Use any icon library other than Lucide
- ❌ Make the navbar transparent or give it a background color
- ❌ Add social media icons or marketing copy to the footer
- ❌ Scale font sizes down on mobile — only layouts change, text sizes stay the same
- ❌ Use `transform: scale()` on hover for any element
- ❌ Create custom color variables outside of the defined palette
- ❌ Use `box-shadow` on hover states — use background/border changes instead

---

## 12. Responsive Breakpoints

```css
/* Mobile — 640px and below */
@media (max-width: 640px) {
  /* Stack ALL layouts vertically */
  /* Reduce page padding to 16px */
  /* Navbar padding: 16px 16px */
  /* Cards go full-width */
  /* Tables scroll horizontally */
  /* Font sizes DO NOT CHANGE — same as desktop */
  /* Hide non-essential columns in tables */
  /* Product tiles stack vertically */
}

/* Tablet — 641px to 1024px */
@media (min-width: 641px) and (max-width: 1024px) {
  /* 2-column grids where applicable */
  /* Page padding: 24px */
  /* Navbar padding: 16px 24px */
  /* Tables may need horizontal scroll for 5+ columns */
}

/* Desktop — 1025px and above */
@media (min-width: 1025px) {
  /* Full layout with sidebar if applicable */
  /* Page padding: 40px */
  /* Navbar padding: 16px 40px */
  /* Max content width constraints apply */
  /* Auth/selector screens max-width: 520px centered */
  /* Dashboard screens max-width: 1200px */
}
```

### Key Responsive Rules
- **Font sizes NEVER scale down on mobile.** A 14px body text on desktop is 14px on mobile. Readability is non-negotiable.
- **Cards and tiles stack vertically** on mobile — never shrink them side-by-side.
- **Tables get horizontal scroll** — never hide columns by default on mobile. Let the user scroll to see all data.
- **The navbar structure never changes** — logo left, actions right, on every screen size. Only padding changes.
- **Touch targets on mobile** must be at least 44px × 44px for all interactive elements.

---

## 13. File / Asset Naming Convention

```
openbroker-labs-logo.svg
openprice-icon.svg
veriqual-icon.svg
openbroker-los-icon.svg
marketing-mgr-icon.svg
```

### Rules
- All lowercase, hyphen-separated — no underscores, no camelCase, no spaces
- Product names match exact product naming (openprice not open-price)
- Use `.svg` for all icons and logos — vector only
- Use `.png` only for raster exports: favicons, social cards, email headers
- Never append version numbers to filenames (`logo-v2.svg` ❌) — use git versioning
- Component files follow the same convention: `pricing-table.tsx`, `loan-card.tsx`, `status-banner.tsx`

---

## 14. Tailwind CSS Token Reference

If the project uses Tailwind CSS, use these exact utility classes to match the brand system:

```javascript
// tailwind.config.js (extend)
module.exports = {
  theme: {
    extend: {
      colors: {
        'obl-bg':        '#FFFFFF',
        'obl-surface':   '#FAFAFA',
        'obl-primary':   '#000000',
        'obl-secondary': '#A1A1AA',
        'obl-brand':     '#71717A',
        'obl-border':    '#27272A',
        'obl-success':   '#22C55E',
        'obl-error':     '#EF4444',
        'obl-warning':   '#F59E0B',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'obl-button': '8px',
        'obl-card':   '12px',
        'obl-input':  '8px',
      },
    },
  },
}
```

### Common Tailwind Class Mappings

```
Brand text:     text-obl-brand (always for "OpenBroker Labs")
Headings:       text-obl-primary font-bold tracking-tighter
Body:           text-obl-primary text-sm
Muted:          text-obl-secondary text-sm
Card:           bg-obl-bg border border-obl-border/15 rounded-obl-card
Card hover:     hover:bg-obl-surface hover:border-obl-border/30
Primary btn:    bg-obl-primary text-white rounded-obl-button hover:opacity-85
Secondary btn:  bg-obl-bg text-obl-primary border border-obl-border/25 rounded-obl-button hover:bg-obl-surface
Input:          bg-obl-bg text-obl-primary border border-obl-border/30 rounded-obl-input focus:border-obl-primary
```

---

**End of Brand System Document**

*This document MUST be included in the root of every project repository and injected as context into any AI code generation tool (Cursor, v0, Bolt, Claude, Lovable, Replit, etc.) to maintain visual and brand consistency across all OpenBroker Labs applications. No deviations are permitted.*
