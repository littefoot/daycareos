---
version: "2.0"
name: "All Child Care Solutions Inc."
description: "Sovereign design system and brand contract extracted from https://allchildcaresolutions.com/ (Licensed Home Child Care Agency in Ontario, Canada)."

colors:
  primary: "#ff6900"            # Tangerine Sun Orange (Primary Brand Identity)
  primary-hover: "#ea580c"      # Deep Tangerine
  primary-active: "#c2410c"     # Burnt Amber
  primary-light: "#fff7ed"      # Soft Cream Peach
  accent-gold: "#fcb900"        # Sunshine Amber Gold
  accent-mint: "#10b981"        # CWELCC / Subsidy Mint Emerald
  accent-teal: "#0d9488"        # Trust Ocean Teal
  accent-coral: "#f43f5e"       # Playful Coral Red
  
  # Semantic Surfaces & Borders
  canvas: "#fdfbf7"             # Warm Linen / Sand Canvas
  surface-card: "#ffffff"       # Crisp Pure White
  surface-soft: "#f8fafc"       # Soft Cool Neutral
  surface-dark: "#1e293b"       # Deep Slate Charcoal
  
  # High Contrast Typography
  ink: "#0f172a"                # Deep Inky Black / Slate 900
  body: "#1e293b"               # Slate 800 (WCAG AA Compliant)
  muted: "#64748b"              # Slate 500
  hairline: "#e2e8f0"           # Light Border
  border-strong: "#0f172a"      # Playful 2px/3px Neo-Brutalist Border

  # Status Indicators
  success: "#16a34a"            # Approved / Active Placements
  warning: "#ca8a04"            # Expiring Documents / Approaching Ratio
  error: "#dc2626"              # Missing Health Card / Capacity Violation
  info: "#0284c7"               # Screening Scheduled

assets:
  logoUrl: "https://allchildcaresolutions.com/wp-content/uploads/2024/12/All-Child-Care-Solutions-Logo-1x1-1.png"
  faviconUrl: "https://allchildcaresolutions.com/wp-content/uploads/2024/12/Asset-2ACCS-Logo-Favicon-Orange_002-300x300.png"
  socialShareUrl: "https://allchildcaresolutions.com/wp-content/uploads/2024/12/All-Child-Care-Solutions-Social-Share.png"

typography:
  fontFamily: "'Plus Jakarta Sans', 'Karla', sans-serif"
  fontHandwritten: "'Dancing Script', cursive"
  display-2xl:
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.025em
  display-xl:
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.02em
  title-lg:
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.015em
  body-md:
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0

rounded:
  sm: 6px
  md: 12px
  lg: 16px
  xl: 24px
  full: 9999px

shadows:
  card: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)"
  neo: "3px 3px 0px 0px #0f172a"
  neo-hover: "5px 5px 0px 0px #0f172a"
  neo-active: "1px 1px 0px 0px #0f172a"

components:
  button:
    paddingX: 20px
    paddingY: 10px
    borderRadius: "12px"
    borderWidth: "2px"
    borderColor: "#0f172a"
    fontWeight: 600
    shadow: "3px 3px 0px 0px #0f172a"
---

# All Child Care Solutions — Brand Aesthetic & Design DNA

## 1. Visual Atmosphere & Philosophy
All Child Care Solutions balances **warm, welcoming parental trust** with **crisp, regulatory authority** (Ministry of Education & CCEYA compliance).
- **Aesthetic Tone**: Warm sunshine orange (`#ff6900`), crisp white cards, rich slate text (`#1e293b`), and playful rounded neo-brutalist buttons with subtle 2px solid borders and playful offset shadow blocks.
- **Zero Raw Emojis**: Always use crisp inline SVG vector icons (Lucide React) for navigation, medical shields, calendars, attendance badges, and document status indicators.

## 2. Color Hierarchy & Usage Rules
1. **Primary Accent (Tangerine Orange `#ff6900`)**: Used for primary action buttons, active intake steps, key CTA badges, and active portal role switchers.
2. **Warm Sand Canvas (`#fdfbf7`)**: Main page backdrop providing a warm, non-sterile atmosphere for home daycare families.
3. **Card White (`#ffffff`) with Slate Border (`#0f172a` 2px)**: Used for child profile cards, provider vacancy monitors, and document upload wells.
4. **Mint Emerald (`#10b981`)**: Dedicated to CWELCC ($10/day daycare) badges and verified document tags.

## 3. Typography Scale & Hierarchy
- **Primary Font**: `Plus Jakarta Sans` for clean, modern readability across forms, dashboards, and mobile views.
- **Support Font**: `Karla` for dense table data, timesheets, and ratio statistics.
- **Accent Font**: `Dancing Script` sparingly for friendly notes or welcome accents.
- **Headings**: Always use Title Case with medium/semibold weights (`font-semibold` / `font-bold`), never washed-out thin fonts.

## 4. Component Rules
- **Interactive Buttons**: Rounded `rounded-xl`, 2px solid dark slate border, subtle neo-brutalist offset shadow `shadow-[3px_3px_0px_#0f172a]`, with a tactile active press transition.
- **Badges**: Pill-shaped `rounded-full`, uppercase tracking-wider, high-contrast text on pastel backgrounds.
- **Form Fields**: Clean white inputs, 2px slate borders, clear helper text, and real-time validation badges.
