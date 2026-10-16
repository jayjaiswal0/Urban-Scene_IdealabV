---
name: Urban Mobility Coordination Platform
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#ca8100'
  on-tertiary-container: '#3e2400'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: '0'
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.005em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-xs:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system delivers an authoritative, high-clarity command-and-control visual language tailored for municipal transit authorities, traffic control centers, and multimodal urban operations. The experience channels a refined technical elegance: deep obsidian and midnight navy substrates paired with illuminated luminous telemetry cues. 

The aesthetic is built upon a hybrid of **Precision Glassmorphism** and **Technical Utility**. Interface elements prioritize situational awareness, low-friction scanning, and rapid decision-making across complex geo-spatial grids, route bottlenecks, and dynamic sensor streams. The target atmosphere evokes the stillness and precision of an advanced municipal telemetry operations center: focused, distraction-free, mission-critical, and strictly WCAG 2.1 AAA contrast-compliant.

## Colors

The palette is engineered specifically for prolonged, fatigue-free night-shift and dark-room operations while preserving strict AAA contrast ratios on critical data readouts.

### Primary Accents (Civic Command & Focus)
- **Primary Base (`#3b82f6`)**: Electric civic blue used for key navigation anchors, focus outlines, and primary system actions.
- **Primary Bright (`#60a5fa`)**: High-contrast interactive hover states and metric highlighting against deep substrates.
- **Primary Wash (`rgba(59, 130, 246, 0.12)`)**: Low-intensity backing for active list selections and map overlays.

### Status & Telemetry
- **Operational / Live (`#10b981`)**: Resonant emerald denoting synchronized routes, active fleets, and healthy signal infrastructure.
- **Warning / Hazard (`#f59e0b`)**: Amber warning for congestion spikes, queue buildups, and impending SLA breaches.
- **Critical / Interruption (`#ef4444`)**: High-saturation crimson reserved strictly for track disruptions, emergency response dispatches, and hard service failures.

### Canvas & Surface Architecture
- **Base Canvas (`#0b1120`)**: Deep void foundation for the macro layout.
- **Surface Layer 1 (`#0f172a`)**: Primary structural panels, rail navigation, and contextual toolbars.
- **Surface Layer 2 (`#1e293b`)**: Elevated card containers, modals, and metric pods.
- **Surface Hairline Border (`#334155`)**: Crisp boundary lines delineating data cells and high-density panels.

### Typography & Readout Contrast
- **Text Highest Contrast (`#f8fafc`)**: Primary metrics, modal titles, and urgent alerts.
- **Text Medium Contrast (`#cbd5e1`)**: Field labels, secondary telemetry, and table column data.
- **Text Low Contrast (`#94a3b8`)**: Micro-annotations, unit indicators, and inactive states.

## Typography

Typography relies entirely on **Plus Jakarta Sans**, offering a balance between geometric precision and contemporary clarity. Figures and numerical metrics inherit tabular figures (`tnum`) to maintain columnar alignment across operational telemetry grids, sensor monitors, and real-time clock sequences.

- **Headlines & Metric Numbers:** Rendered with confident, tight tracking (`-0.02em`) to condense information without sacrificing readability across multi-monitor control arrays.
- **Labels & Micro-Telemetries:** Capitalized or tracking-spaced (`0.02em` to `0.06em`) with medium to semi-bold weights to avoid stroke blurring against dark backdrops.
- **Readability Rules:** All small text (`<14px`) must never use font weights lighter than `500` against dark backdrops to maintain legibility under high-glare control-room conditions.

## Layout & Spacing

The interface deploys an adaptive 12-column dynamic grid designed to host both expansive geospatial views and ultra-dense analytical sidecars simultaneously.

- **Desktop Operations (>1440px):** 12-column grid with `gutter-desktop` (1.5rem) and `margin-desktop` (2rem). Supports a persistent 320px telemetry drawer, an interactive map viewport spanning flexible columns, and an analytical telemetry rail.
- **Tablet / Secondary Screen (768px – 1439px):** 8-column layout with 1rem gutters and 1.5rem margins. Telemetry panels collapse into slide-out glass sheets to maximize screen area for the central map.
- **Mobile Handheld (<768px):** 4-column layout with 1rem outer canvas margin. Metrics transform into horizontal snapping carousels; map tools dock to bottom sheets with safe-area offsets.
- **Rhythm Principle:** Internal data components strictly adhere to an 8px grid foundation, using `space-xs` (4px) and `space-sm` (8px) for high-density sensor grids, and `space-lg` (24px) for dashboard module segmentation.

## Elevation & Depth

Visual hierarchy is maintained through disciplined tonal layering, structural hair-thin borders, and frosted translucent glass panels rather than aggressive drop shadows.

- **Substrate (Z-0):** `#0b1120` canvas floor, strictly non-reflective.
- **Glass Panel (Z-1):** Layered above the background or map overlay. Implemented using `rgba(15, 23, 42, 0.75)` with a `16px` backdrop blur (`backdrop-filter: blur(16px)`) and a `1px` continuous border in `rgba(51, 65, 85, 0.6)`.
- **Active Card / Float (Z-2):** Surface layer `#1e293b` elevated with a discreet ambient halo: `0 8px 32px -4px rgba(0, 0, 0, 0.5)`. Border uses `#334155` to frame the element against complex spatial geometry.
- **Overlay & Modal (Z-3):** Solid `#0f172a` backing with an accent hairline top border `rgba(96, 165, 250, 0.3)` and a deep directional shadow `0 24px 48px -12px rgba(0, 0, 0, 0.75)`.
- **Glow Highlights:** Urgent indicators employ an inner glow (`box-shadow: inset 0 0 12px rgba(239, 68, 68, 0.2)`) to indicate hazardous status without obscuring neighboring coordinates.

## Shapes

The shape system adopts a **Soft (Level 1)** geometric standard. This keeps components compact, structured, and spatial-efficient for data-dense control panels while avoiding severe industrial right angles.

- **Interactive Components (Buttons, Inputs, Metric Badges):** Standardized at `0.25rem` (4px) corner radius.
- **Containers & Glass Panels:** Scaled up to `rounded-lg` (`0.5rem` / 8px) to soften the perimeter while staying cohesive with underlying data rows.
- **Modals & Flyouts:** Scaled to `rounded-xl` (`0.75rem` / 12px) for separation from underlying structural grids.
- **Status Indicators & Pulse Nodes:** Completely circular (`rounded-full`) to contrast against rectilinearly organized tables and panels.

## Components

### Buttons
- **Primary Action:** Solid electric civic blue (`#3b82f6`) fill, text `#ffffff`, with a subtle inset top-edge highlight `rgba(255, 255, 255, 0.2)`. Focus rings display a 2px offset outline of `#60a5fa`.
- **Secondary / Glass:** Background `rgba(30, 41, 59, 0.6)` with backdrop blur, 1px border in `#334155`, text `#f8fafc`. On hover, border shifts to `#60a5fa` and background brightness increases by 10%.
- **Critical Interruption:** Fill `rgba(239, 68, 68, 0.15)`, text `#ef4444`, border `1px solid #ef4444`. Hover elevates fill to solid `#ef4444` with white text.

### Chips & Status Badges
- **Live / Normal:** Background `rgba(16, 185, 129, 0.12)`, text `#10b981`, border `1px solid rgba(16, 185, 129, 0.3)`. Accompanied by a 6px pulsing emerald node.
- **Hazard / SLA Warning:** Background `rgba(245, 158, 11, 0.12)`, text `#f59e0b`, border `1px solid rgba(245, 158, 11, 0.3)`.
- **Telemetry Counter Chips:** Monospaced numerical values, background `#1e293b`, text `#cbd5e1`, 4px padding-x, 2px padding-y.

### Cards & Glass Surfaces
- Glass containers utilize background `rgba(15, 23, 42, 0.75)`, a `1px` continuous border in `#334155`, and 16px padding.
- Card headers feature an integrated lower hairline separator in `rgba(51, 65, 85, 0.5)` with 12px bottom margin to cleanly decouple controls from the data body.

### Inputs & Select Fields
- Default state: Background `#0b1120`, border `1px solid #334155`, typography `body-md` in `#f8fafc`, placeholder text in `#94a3b8`.
- Focus state: Border transitions to `#3b82f6` with a soft outer ring glow `0 0 0 2px rgba(59, 130, 246, 0.25)`.

### Lists & Data Grids
- Alternating row styling is avoided; rows are separated by single hairline horizontal rules (`rgba(51, 65, 85, 0.4)`).
- Hover state across rows triggers background fill `rgba(30, 41, 59, 0.5)`.
- Selected row activates a 3px vertical accent indicator along the left boundary in electric civic blue (`#3b82f6`).

### Checkboxes & Radio Controls
- Base: 16x16px frame with a `1px solid #334155` border on background `#0b1120`.
- Checked state: `#3b82f6` fill with crisp white internal icon checks. 

### Telemetry Timelines & Event Logs
- Chronological feeds employ a 1px vertical trace line in `#334155`.
- Micro-nodes on the timeline use color-coded status points (emerald, amber, crimson) surrounded by a 2px stroke matching the base background canvas to produce clean gaps across line intersections.