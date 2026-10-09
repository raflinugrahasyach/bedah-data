# DESIGN_SYSTEM.md

## 1. Project overview

- **Website / product name:** Bedah Data
- **Website type:** Academic data analysis productized service & intake workflow
- **Surface profile:** Landing / Marketing (`references/surface-rules.md §B1`) and Dashboard / Admin (`references/surface-rules.md §B2`)
- **Platform:** Web (Next.js 16 App Router, React 19, Tailwind CSS v4)
- **Target users:** S1/S2/S3 students, academic researchers, lecturers, and data analysts needing reproducible data processing, syntax script auditing, and thesis methodology guidance.
- **Main design goal:** Deliver an honest, rigorous, human-designed interface that communicates academic accountability, methodology precision, and clean data workflows without generic AI visual slop.

## 2. Brand direction

- **Visual style:** Methodological, restrained, clear, academic-grade.
- **Mood & tone:** Trustworthy, transparent, rigorous, accountable, calm.
- **Design personality:** Corporate-clean / academic methods section.
- **Design concept (one sentence — the Step 2.7 commitment):** "A reproducible statistical workbench designed like an academic methods section — tabular numerals for every metric, solid slate surfaces with restrained teal accents, clear hierarchy, and syntax-first deliverables."
- **Adversarial-review verdict:** Passed. Covering the brand name still distinguishes Bedah Data from generic SaaS templates because the interface is built around verifiable deliverables (Data Bersih .sav, Syntax Skrip .sps/.R, Laporan PDF), tabular audit trails, and strict anti-slop rules (no decorative sparkles, no floating glassmorphism, no dramatic 24px box shadows).
- **Reference style used:** Linear (clean density, solid borders, 1px separation), GitHub / Raycast (monochrome icons, tabular data, keyboard-friendly), Stripe Docs (clear typography, high-contrast readable prose).
- **Voice & UX copy:** Direct, functional, academic integrity-focused. Clear distinction between research assistance/mentoring and ghostwriting. Honest pricing breakdown, no fake inflated statistics.

## 3. Color system

Palette: "Frost Bright" (from `no-slop-ui/references/colour-palettes.md`).

| Role | Color Name | Hex | Usage |
|---|---|---|---|
| 60% — Dominant | Background (`--bg`) | `#f1f5f9` | Page base background |
| 30% — Secondary | Surface (`--surface`) | `#f8fafc` | Raised cards, panels, sidebar |
| 30% — Secondary | Field (`--field`) | `#fcfdfe` | Form controls, code blocks, card inners |
| 10% — Accent | Primary (`--primary`) | `#0f766e` | Action buttons, active badges, key focus rings |
| Hover | Primary Hover (`--primary-hover`) | `#115e59` | Interactive button hover |
| Tint | Primary Tint (`--primary-tint`) | `#d9ece9` | Selected states, badge backgrounds |
| Deep Text | Primary Ink (`--primary-ink`) | `#0b4f4a` | Text on tinted accent badges |
| Contrast Text | On-Primary (`--on-primary`) | `#f8fafc` | Text inside solid primary buttons |
| Neutral Text | Ink (`--ink`) | `#0f172a` | Primary text and headings (WCAG AA > 16:1) |
| Muted Text | Ink Muted (`--ink-muted`) | `#475569` | Secondary captions and supporting copy (WCAG AA > 6.9:1) |
| Border | Border (`--border`) | `#d5dde7` | Card and section 1px dividers |
| Strong Border | Border Strong (`--border-strong`) | `#7c8ba0` | Input borders, interactive dividers |
| Status Success | Success (`--success`) | `#166534` | Success icons, paid status, delivered state |
| Status Danger | Danger (`--danger`) | `#be123c` | Errors, delete actions, required warnings |
| Status Warning | Warn (`--warn`) | `#92400e` | Unpaid invoices, pending items |

**Separation rules:**
- Background contrast + subtle 1px border. No floating glow, no heavy shadows.
- Elevation shadows: `0 1px 2px rgba(15, 23, 42, 0.06), 0 2px 8px rgba(15, 23, 42, 0.06)` max.
- High-contrast text verified by WCAG formula (`scripts/contrast-check.mjs`, all > 4.5:1).

## 4. Typography system

- **Brand personality:** Corporate-clean / Academic grotesque.
- **Font family:** Geist Sans (`--font-sans`) paired with Geist Mono (`--font-mono`).
- **Why these fonts fit:** Geist delivers the neutral, crisp precision of an international research publication; Geist Mono ensures numbers, prices, order codes, and file sizes align in tables and badges without layout wobble.
- **Type scale:**
  - `display`: `clamp(2.25rem, 1.4rem + 3.4vw, 4rem)` (line-height: 1.06)
  - `h1`: `clamp(1.75rem, 1.4rem + 1.4vw, 2.5rem)` (line-height: 1.15)
  - `h2`: `clamp(1.375rem, 1.2rem + 0.8vw, 1.875rem)` (line-height: 1.25)
  - `h3`: `1.125rem` (line-height: 1.4)
  - `body-lg`: `1.125rem` (line-height: 1.6)
  - `body`: `1rem` (line-height: 1.55)
  - `body-sm`: `0.875rem` (line-height: 1.5)
  - `caption`: `0.8125rem` (line-height: 1.4)
  - `button`: `0.9375rem` (line-height: 1.25)
- **Rules:** Body text is never below 16px on prose; captions are 13–14px; tabular numerals (`.num`) for prices and counts.

## 5. Layout system

- **Container max-widths:** `max-w-6xl` (1152px) for pages; `max-w-5xl` for hero; `max-w-2xl` for chat center.
- **Section spacing:** Consistent 48–64px padding; consistent 24–32px card padding.
- **Hero composition:** Centered editorial composition. Fits within `100svh` on standard laptop displays (~700–800px). Headline is 2 lines on desktop; supporting copy is 16 words.
- **Admin layout:** 240px fixed solid sidebar, 1px border-right, standard page header (h1 + subtitle only, strictly no dashboard hero).

## 6. Component system

- **Base library:** Headless Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-slot`) themed strictly to project tokens.
- **Buttons (`components/ui/button.tsx`):** Solid primary teal (`bg-primary`), outline secondary (`bg-field border-border-strong`), ghost, danger. 6px border-radius (`rounded-control`). No pill buttons, no gradients.
- **Badges (`components/ui/badge.tsx`):** Rounded 6px, paired with text and icon, tone-tinted background.
- **Form Fields (`components/ui/field.tsx`):** Labels positioned strictly above fields, helper text, accessible announced errors below fields (`aria-describedby`, `role="alert"`).
- **Dialogs (`components/ui/dialog.tsx`):** Centered modal with opacity fade, focus trapped and restored via Radix.
- **Toaster (`components/ui/toaster.tsx`):** Sonner themed to project tokens with text label and status icon.

## 7. Card & section style

- **Radius:** 8px (`rounded-card`) for content cards; 6px (`rounded-control`) for buttons and inputs; 10px (`rounded-dialog`) for modals.
- **Borders:** 1px solid `var(--border)` or `var(--border-strong)`.
- **Shadows:** Max `0 2px 8px rgba(15, 23, 42, 0.08)`. No colored halos or blur spreads > 8px.
- **No nested cards:** Clear depth hierarchy: Page Base (`#f1f5f9`) -> Raised Surface (`#f8fafc`) -> Control/Inner Field (`#fcfdfe`).

## 8. Icon system

- **Library:** Phosphor Icons (`@phosphor-icons/react`), weight: Regular.
- **Sizing:** 16px to 20px. Monochrome or primary tint; no decorative backgrounds.
- **Accessible labels:** All icon-only buttons include `aria-label`.

## 9. Animation & interaction system

- **Transitions:** Fast, subtle: 120ms to 160ms ease-out. Opacity or color transitions only. No spring bounces, no card scale-up transforms on hover.
- **Focus visible:** `:focus-visible` with 2px solid teal ring and 2px offset.
- **Accessibility:** `prefers-reduced-motion` suppresses all animations.

## 10. Anti-AI-slop compliance checklist

- [x] No floating glassmorphism panels
- [x] No gradient backgrounds or gradient text (`background-clip:text`)
- [x] No pill buttons
- [x] No hero sections inside internal dashboard
- [x] No generic filler copy ("Elevate your data / Next-gen solution")
- [x] No decorative sparkle / ✨ / ✦ icons in badges
- [x] No 50/50 templated split hero
- [x] All contrast ratios verified (>4.5:1 for body copy)
- [x] Tabular numerals applied to money and counts

## 11. Future page instructions

Every future page, route, and component must reuse the tokens, fonts, spacing, components, and rules documented above. Do not introduce raw arbitrary hex codes or default UI kits without updating this file.
