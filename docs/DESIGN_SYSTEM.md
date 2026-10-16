# Stitch Urban Mobility Coordination Platform (UMCP) — Design System & Theme Reconciler

## 1. Overview & Dual-Theme Architecture

The UMCP platform integrates two distinct design specifications extracted from Stitch:
1. **Light Mode**: `civic_mobility_platform/DESIGN.md` (Civic Minimalism, clean white card containers, deep navy text, primary civic cobalt `#004ac6` / `#2563eb`).
2. **Dark Mode**: `urban_mobility_coordination_platform/DESIGN.md` (Obsidian Mission-Control, deep slate canvas `#0b1326`, glowing glassmorphic panels `#171f33`, high-visibility electric cobalt `#4d8eff` / `#adc6ff`, neon telemetry accents).

The implementation exposes these tokens as CSS custom properties on `:root` and `.dark` / `.light` selectors, allowing instantaneous, flicker-free switching and respecting OS `prefers-color-scheme` settings.

---

## 2. Core Color Token Mapping

| CSS Variable Token | Light Mode Value (Civic Minimalism) | Dark Mode Value (Obsidian Telemetry) | Functional Role |
|---|---|---|---|
| `--color-canvas` | `#f8f9ff` (`#F8FAFC`) | `#0b1326` | Master page viewport background |
| `--color-surface` | `#ffffff` | `#131b2e` | Primary card and content containers |
| `--color-surface-subtle` | `#eff4ff` | `#171f33` | Secondary panels, drawer trays, sidebars |
| `--color-surface-hover` | `#e5eeff` | `#222a3d` | Hovered rows, menu items, table strips |
| `--color-surface-active` | `#dce9ff` | `#2d3449` | Active tabs, pressed buttons, selected cards |
| `--color-primary` | `#004ac6` (`#2563eb`) | `#4d8eff` (`#adc6ff`) | Main brand accent, key action buttons |
| `--color-primary-hover` | `#003da6` | `#3b82f6` | Hover state for primary CTAs |
| `--color-primary-subtle` | `#dbe1ff` | `#00285d` | Primary badges, pill highlights |
| `--color-text-main` | `#0b1c30` | `#dae2fd` | High-contrast body, titles, table content |
| `--color-text-muted` | `#434655` | `#c2c6d6` | Secondary labels, descriptions, timestamps |
| `--color-text-faint` | `#737686` | `#8c909f` | Placeholder text, deactivated controls |
| `--color-border-subtle` | `#EDF2F7` (`#eff4ff`) | `#222a3d` | Delicate dividers and card outlines |
| `--color-border-default` | `#c3c6d7` (`#E2E8F0`) | `#424754` | Form inputs, table borders, panel separators |
| `--color-status-success` | `#10B981` | `#4edea3` | Resolved, verified, green corridors, slots open |
| `--color-status-warning` | `#F59E0B` | `#ffb95f` | Under review, moderate traffic, pending triage |
| `--color-status-danger` | `#EF4444` | `#ffb4ab` | High hazard, road closure, critical emergency |
| `--color-status-info` | `#0284C7` | `#4d8eff` | Informational announcements, transit feeds |

---

## 3. Typography Specification

The platform utilizes **Plus Jakarta Sans** as the primary typographic family, complemented by system UI fallbacks (`Inter`, `system-ui`, `sans-serif`).
All metric counters, SLA timers, coordinates, and telemetry readings strictly apply tabular figures (`font-variant-numeric: tabular-nums; font-feature-settings: 'tnum' 1;`).

| Style Token | Font Size | Font Weight | Line Height | Letter Spacing | Responsive Mobile |
|---|---|---|---|---|---|
| `display-lg` | 40px / 2.5rem | 700 (Bold) | 48px / 1.2 | -0.02em | 30px / 38px |
| `headline-xl` | 32px / 2.0rem | 600 (SemiBold) | 40px / 1.25 | -0.02em | 24px / 32px |
| `headline-md` | 24px / 1.5rem | 600 (SemiBold) | 32px / 1.33 | -0.01em | 20px / 28px |
| `headline-sm` | 20px / 1.25rem | 600 (SemiBold) | 28px / 1.4 | 0 | 18px / 24px |
| `title-md` | 16px / 1.0rem | 600 (SemiBold) | 24px / 1.5 | 0.005em | 16px / 24px |
| `body-lg` | 16px / 1.0rem | 400 (Regular) | 24px / 1.5 | 0 | 15px / 22px |
| `body-md` | 14px / 0.875rem | 400 (Regular) | 20px / 1.43 | 0 | 14px / 20px |
| `caption-sm` | 12px / 0.75rem | 500 (Medium) | 16px / 1.33 | 0.01em | 12px / 16px |
| `telemetry-mono` | 13px / 0.8125rem | 600 (SemiBold) | 16px / 1.23 | 0.02em | Tabular numbers |

---

## 4. Component Standards

### 4.1 Buttons & Action Controls
- **Primary CTA**: Solid fill (`--color-primary`), contrasting text (`#ffffff` or `#001a42`), 8px border radius, subtle hover elevation, active scale down (0.98).
- **Secondary / Ghost Button**: Bordered with `--color-border-default`, subtle surface hover highlight, crisp iconography.
- **Urgent / Hazard Action**: Pulsing aura for critical emergencies (`rgba(239, 68, 68, 0.4)`), deep red contrast.
- **Focus Rings**: Strict 2px ring with 2px offset matching `--color-primary` for WCAG AAA accessibility.

### 4.2 Status Badges & Pills
- `SUBMITTED`: Neutral slate / blue border (`#dbe1ff` / `#131b2e`), text `--color-text-muted`.
- `UNDER_REVIEW`: Amber container, warning icon (`#F59E0B` / `#ca8100`).
- `VERIFIED`: Cyan / Electric blue container, check shield icon (`#0284C7` / `#0073ae`).
- `ASSIGNED` / `IN_PROGRESS`: Indigo / Violet container, spinning work icon (`#2563eb` / `#4d8eff`).
- `RESOLVED`: Emerald container, double checkmark (`#10B981` / `#00a572`).
- `REJECTED`: Crimson container, cross icon (`#EF4444` / `#93000a`).

### 4.3 Form Controls & Validation States
- Form input backgrounds: White in light mode, `#171f33` in dark mode.
- Default border: `--color-border-default` with 8px radius.
- Active/Focused input: `--color-primary` 2px border + 3px soft outer glow.
- Error state: Red-500 border with instant helper text below input.
- Success state: Emerald-500 indicator icon right-aligned inside input.

### 4.4 Glassmorphism & Elevation Tokens
- **Elevation Low (Cards)**: `box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);` (Light) / `border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(23, 31, 51, 0.75); backdrop-filter: blur(12px);` (Dark).
- **Elevation High (Modals, Overlays)**: `box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04);` (Light) / `border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6); backdrop-filter: blur(20px);` (Dark).
