---
name: Civic Mobility Platform
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#005a89'
  on-tertiary: '#ffffff'
  tertiary-container: '#0073ae'
  on-tertiary-container: '#e7f2ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#cce5ff'
  tertiary-fixed-dim: '#93ccff'
  on-tertiary-fixed: '#001d31'
  on-tertiary-fixed-variant: '#004b73'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  surface-canvas: '#F8FAFC'
  surface-card: '#FFFFFF'
  border-subtle: '#EDF2F7'
  border-default: '#E2E8F0'
  status-active: '#10B981'
  status-pending: '#F59E0B'
  status-urgent: '#EF4444'
  status-info: '#0284C7'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 3.5rem
    fontWeight: '700'
    lineHeight: 4.25rem
    letterSpacing: -0.025em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 2rem
    fontWeight: '600'
    lineHeight: 2.5rem
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.9375rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.25rem
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.6875rem
    fontWeight: '600'
    lineHeight: 0.875rem
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system establishes a civic-grade, approachable, and highly legible interface for the Urban Mobility Coordination Platform (UMCP). The platform serves municipal planners, transit coordinators, field operators, and general public citizens seeking transit transparency and municipal updates. 

The aesthetic is built upon modern civic minimalism: crisp white surfaces, generous atmospheric whitespace, disciplined slate typography, and authoritative yet friendly indigo-navy primaries. The interface deliberately avoids dystopian cyberpunk tropes, high-density tactical grids, or aggressive surveillance aesthetics. Instead, it prioritizes civic trust, institutional clarity, calm ergonomics, and frictionless legibility across high-consequence mobility dashboards and public transit service portals.

## Colors

The palette balances administrative authority with intuitive public signage standards. 

- **Primary (`#2563EB`)**: Used for primary action buttons, focused states, interactive transit paths, and navigational anchors.
- **Secondary (`#0F172A`)**: Deep slate navy providing high-contrast textual grounding, primary headings, top-level navigation headers, and core metrics.
- **Tertiary (`#0284C7`)**: Atmospheric civic sky blue for informational indicators, sub-navigation tabs, and secondary route highlights.
- **Neutral (`#64748B`)**: Balanced slate grey ensuring balanced low-contrast supporting copy, metadata timestamps, and divider elements without visual mud.

### Functional Status Tokens
- **`status-active` (`#10B981`)**: Signals resolved incidents, operational routes, and normal transit flows.
- **`status-pending` (`#F59E0B`)**: Signals maintenance schedules, conditional warnings, and service reviews.
- **`status-urgent` (`#EF4444`)**: Signals road blockages, critical equipment failures, emergency detours, and priority dispatch notices.
- **`status-info` (`#0284C7`)**: Signals scheduled modifications, route announcements, and civic notices.

## Typography

The typography uses Plus Jakarta Sans across all tiers to deliver clean geometry, warm open counters, and high legibility at micro sizes on dense status tables and transit mapping layers.

- **Headings & Key Metrics**: Rendered in weight `600` or `700` in secondary deep slate (`#0F172A`) with slight negative letter tracking to reinforce stability and structure.
- **Body Copy**: Standardized at weight `400` in neutral slate (`#475569` to `#64748B`) to keep prolonged reading comfortable without visual glare.
- **Labels, Badges, and Metadata**: Employs weight `600` with slight positive tracking to ensure fast scanning of live incident tags, departure times, and alert categories.

## Layout & Spacing

The layout utilizes a structured 12-column fluid grid system across desktop viewpoints, transitioning to an 8-column layout on tablet (`768px - 1024px`) and a 4-column flow on mobile screens (`< 768px`).

- **Canvas Background**: The primary viewport canvas sits on `#F8FAFC`, creating a gentle differentiation against pure `#FFFFFF` cards and surfaces.
- **Gutters & Padding**: Desktop grids maintain a `1.5rem` (24px) gutter with outer viewport margins of `2rem` (32px). Handheld devices collapse outer canvas padding to `1rem` (16px) to maximize real estate for data tables, transit timetables, and interactive maps.
- **Rhythm**: Component interiors standardize on `1.5rem` internal card padding, using `0.5rem` to `1rem` for nested controls and filter bars.

## Elevation & Depth

Visual hierarchy relies on crisp, light-toned containment pairing faint borders with ambient drop shadows:

- **Surface Level 0 (Canvas)**: Non-elevated flat plane (`#F8FAFC`).
- **Surface Level 1 (Default Cards & Panels)**: Pure white (`#FFFFFF`) with a `1px` continuous border in `#EDF2F7` and a soft ambient shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
- **Surface Level 2 (Interactive Hover & Elevated Modules)**: Lifted state for cards, dropdown menus, and search palettes: `0 10px 15px -3px rgba(15, 23, 42, 0.05), 0 4px 6px -4px rgba(15, 23, 42, 0.03)` with border `#E2E8F0`.
- **Surface Level 3 (Dialogs & Critical Overlays)**: Modal windows and drawer overlays: `0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`.

## Shapes

The design system adopts a balanced roundedness model (`2`), setting default interactive elements (buttons, inputs, select menus) to `0.5rem` (8px). 

Main content containers, analytics panels, and transit data cards use `rounded-xl` (1rem / 16px) or `rounded-2xl` (1.5rem / 24px) to soften technical data and create an open, contemporary portal feeling. Pill geometry (`rounded-full`) is strictly reserved for live transit status chips, filter tags, and operational badges.

## Components

### Buttons
- **Primary**: Solid `#2563EB` background with white text, `0.5rem` border radius, `0.625rem 1.25rem` padding. Subtle brightness shift and `0 4px 12px rgba(37, 99, 235, 0.2)` shadow on hover.
- **Secondary / Outlined**: White background with `1px` border in `#E2E8F0`, slate navy text (`#0F172A`). On hover, transitions to canvas tint `#F8FAFC` with border `#CBD5E1`.
- **Subtle / Ghost**: Transparent surface with `#475569` text, transitioning to `#F1F5F9` on hover. Used for secondary toolbar toggles and export controls.

### Status Chips & Badges
- Constructed with pill geometry (`rounded-full`) using soft pastel background fills and high-contrast, darkened text:
  - **Resolved / Active**: `#ECFDF5` surface, `#047857` text, with a `#10B981` leading 6px circular dot indicator.
  - **Under Review / Warning**: `#FFFBEB` surface, `#B45309` text, with a `#F59E0B` leading dot.
  - **Urgent / Hazard**: `#FEF2F2` surface, `#B91C1C` text, with a pulsating `#EF4444` leading dot.
  - **Informational / Transit Route**: `#F0F9FF` surface, `#0369A1` text.

### Cards & Data Panels
- Built on pure white `#FFFFFF` surfaces with `rounded-xl` or `rounded-2xl` border radii, bound by a crisp `1px solid #EDF2F7` stroke.
- Header bands separate title zones and action slots with a faint divider line, maintaining consistent `1.5rem` internal padding.

### Input Fields & Controls
- **Text Inputs & Dropdowns**: Height `2.625rem` (42px) with `0.5rem` radius, white background, `1px solid #E2E8F0` border, and text in `#0F172A`. Focused state displays a `2px` focus ring in `#2563EB` offset by `1px` white spacing.
- **Checkboxes & Radios**: `1rem` size with `#E2E8F0` unchecked borders; checked state fills with `#2563EB` housing a crisp white geometric checkmark or dot.

### Lists & Data Tables
- Header rows display uppercase `label-md` typography in `#64748B` with a `#F8FAFC` background.
- Row items use clean horizontal dividers (`#EDF2F7`), subtle `#F8FAFC` hover transitions, and fixed row heights of `3.25rem` (52px) for effortless touch and mouse target interaction.