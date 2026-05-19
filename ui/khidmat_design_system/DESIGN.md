---
name: Khidmat Design System
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#41493e'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#717a6d'
  outline-variant: '#c0c9bb'
  surface-tint: '#2a6b2c'
  primary: '#00450d'
  on-primary: '#ffffff'
  primary-container: '#1b5e20'
  on-primary-container: '#90d689'
  inverse-primary: '#91d78a'
  secondary: '#006e1c'
  on-secondary: '#ffffff'
  secondary-container: '#91f78e'
  on-secondary-container: '#00731e'
  tertiary: '#533400'
  on-tertiary: '#ffffff'
  tertiary-container: '#724900'
  on-tertiary-container: '#ffb751'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#acf4a4'
  primary-fixed-dim: '#91d78a'
  on-primary-fixed: '#002203'
  on-primary-fixed-variant: '#0c5216'
  secondary-fixed: '#94f990'
  secondary-fixed-dim: '#78dc77'
  on-secondary-fixed: '#002204'
  on-secondary-fixed-variant: '#005313'
  tertiary-fixed: '#ffddb5'
  tertiary-fixed-dim: '#ffb957'
  on-tertiary-fixed: '#2a1800'
  on-tertiary-fixed-variant: '#643f00'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 16px
  card-gap: 12px
---

## Brand & Style

The design system is engineered for **Khidmat**, a platform bridging the gap between Pakistan’s informal service sector and high-tech AI orchestration. The brand personality is **Sturdy, Transparent, and Empathetic**. It prioritizes high-trust interactions by combining a professional "Pakistan Green" palette with a clean, minimalist structural framework.

The visual style is **Corporate / Modern** with a focus on **Information Utility**. It leverages a card-based architecture to organize complex AI reasoning into digestible, mobile-first modules. The UI must feel authoritative yet accessible to a wide demographic, ensuring that the "AI" aspect feels like a helpful assistant rather than an opaque machine.

**Key Principles:**
- **Clarity over Ornament:** Every element must serve a functional purpose in the service fulfillment lifecycle.
- **Localized Trust:** Use of familiar cultural color cues (Deep Green) to instill immediate institutional credibility.
- **Evidence-Based Design:** Showing "how" the AI arrived at a conclusion through visual traces and badges.

## Colors

The palette is rooted in **Deep Forest Green (#1B5E20)**, symbolizing growth, stability, and national identity. This is used for primary actions, headers, and brand-critical touchpoints.

- **Primary (Forest Green):** Represents the "Official" nature of the service. Used for main buttons and navigation.
- **Secondary (Mint Green):** Used for "Success" states, active status indicators, and accenting primary actions to keep the UI feeling fresh.
- **Tertiary (Trust Gold):** Reserved exclusively for social proof—ratings, rankings, and "Top Pro" verification badges.
- **Neutrals:** A range of cool grays provides the scaffolding for the card-based layout, ensuring high legibility against the vibrant green accents.
- **Surface Strategy:** Use white backgrounds for primary content cards and a very light neutral (#F8F9FA) for the application background to create subtle depth.

## Typography

The design system utilizes **Inter** for its exceptional legibility and systematic feel. For Urdu script support, the system defaults to a compatible Noto Sans Arabic (or similar system-native humanist font) to maintain visual harmony.

- **Scale:** A tight typographic scale ensures that data-heavy screens (like price breakdowns) remain readable on small mobile devices.
- **Weight:** Bold (700) is used sparingly for primary headings. Semi-bold (600) is preferred for card titles and "AI Reasoning" headers to provide emphasis without visual noise.
- **Line Height:** Generous line heights are maintained (1.5x for body text) to assist users who may be scanning quickly in high-stress service-seeking situations.
- **Case:** Use sentence case for all headings and labels to maintain an approachable, conversational tone.

## Layout & Spacing

The system follows a **Fluid Grid** model optimized for a 375pt-420pt mobile viewport. 

- **Grid:** A standard 8px baseline grid governs all spatial decisions.
- **Margins:** Side margins are fixed at **16px** to maximize real estate for service details while maintaining a "safe" touch area.
- **Vertical Rhythm:** Content modules (cards) are separated by **12px** to create a dense but organized list view.
- **Safe Areas:** Ensure bottom-sheet components account for mobile home-indicators, especially for the "Book Now" CTA bars.

## Elevation & Depth

This design system uses **Tonal Layers** supplemented by very soft **Ambient Shadows** to define hierarchy.

- **Level 0 (Background):** Neutral light gray (#F8F9FA).
- **Level 1 (Cards):** Pure white surface with a 1px border (#E0E0E0) and a subtle 4px blur shadow at 5% opacity. This makes service cards feel "tangible" and clickable.
- **Level 2 (Active/Floating):** Used for AI Agent Trace timelines or active bottom sheets. These use a more pronounced shadow (12px blur at 10% opacity) to indicate they are temporary layers.
- **The "AI Insight" Layer:** Elements generated by AI reasoning should use a subtle Mint Green tint (#E8F5E9) background rather than a shadow to indicate "intelligence" without adding physical height.

## Shapes

The shape language is **Rounded**, strike a balance between the precision of a professional tool and the friendliness of a community service.

- **Buttons & Cards:** Use a **0.5rem (8px)** radius. This creates a modern, mobile-native feel that fits within the palm of a hand.
- **Service Pills:** Use a fully circular radius (Pill-shaped) for quick-select categories to distinguish them from actionable service cards.
- **Input Fields:** Match the 8px radius of cards for consistency.
- **Badges:** Small "AI Reasoning" badges use a tighter **4px** radius to indicate they are secondary meta-information.

## Components

### Service Quick-Select Pills
Horizontally scrollable chips with a white background and a 1px Forest Green border. Active states switch to a solid Forest Green fill with white text.

### Provider Cards
The central unit of the UI.
- **Top Section:** Provider photo, name, and Trust Gold star rating.
- **AI Reasoning Badge:** A small, Mint Green-tinted box labeled "Khidmat AI Match," explaining why this provider was chosen (e.g., "Closest to your location + specialized in plumbing").
- **Footer:** Clear price estimate in bold Forest Green.

### Visual Agent Trace
A vertical timeline component used when the AI is "working" or "orchestrating."
- **Line:** Thin dashed Forest Green.
- **Nodes:** Small Mint Green circles for completed steps, pulsating for active steps.
- **Context:** Brief labels next to each node (e.g., "Contacting nearby electricians," "Verifying availability").

### Price Breakdown Visualization
Instead of just a table, use a stacked bar chart showing Labor vs. Materials vs. Platform Fee, using shades of Green and Gold to maintain brand consistency.

### Input Fields & Controls
- **Urdu-Ready Fields:** Ensure height and padding account for the taller descenders and ascenders of the Urdu script.
- **Action Buttons:** Large, 56px tall primary buttons in Forest Green for high visibility in outdoor lighting conditions.