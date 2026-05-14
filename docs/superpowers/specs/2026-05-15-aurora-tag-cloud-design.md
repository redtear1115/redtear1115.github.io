# Aurora Tag Cloud & Theme Redesign

**Date:** 2026-05-15
**Status:** Approved

## Overview

Add a sticky right-sidebar tag cloud to the blog, and layer an Aurora Australis (南極光) visual theme across the entire site — combining ice-ocean atmosphere with a sci-fi/tech aesthetic.

---

## Design Decisions

| Question | Decision |
|---|---|
| Sidebar scope | All pages (home, blog list, post pages) |
| Tag cloud style | Glow chips (發光膠囊) — pill-shaped with blue neon glow |
| Background | Ice crystal texture + animated aurora bands |
| Layout width | 920px total: ~680px main content + 200px sidebar |

---

## Layout Architecture

### Current → Target

```
Current:  [    main 720px    ]

Target:   [  main ~680px  ] [sidebar 200px]
           ←────── 920px total ──────────→
```

- `--max-width` changes from `720px` → `920px`
- New CSS variable `--sidebar-width: 200px`
- A `.page-layout` wrapper uses `display: flex; gap: 2.5rem; align-items: flex-start`
- Sidebar uses `position: sticky; top: 2rem`
- On mobile (`< 768px`): sidebar hidden via `display: none`

### Pages affected

All pages use `BaseLayout.astro` → modify layout there to include `<TagCloud>` sidebar on all routes.

---

## Components

### `TagCloud.astro` (new)

- Fetches all non-draft posts via `getCollection('blog')`
- Counts tag frequency across posts
- Renders chips sized by frequency:
  - `size-xl`: ≥ 5 posts
  - `size-lg`: 3–4 posts
  - `size-md`: 2 posts
  - `size-sm`: 1 post
- Each chip links to `/tags/[tag]`

### `BaseLayout.astro` (modified)

- Wraps existing `<slot />` in a `.page-layout` flex container
- Adds `<TagCloud />` as `<aside class="page-sidebar">`

---

## Visual Theme

### Background (applied to `body` via `global.css`)

Three layers stacked via `::before` / `::after` pseudo-elements + aurora wrapper:

1. **Ice ocean gradient** (`body::before`): radial gradients in deep teal/navy creating depth
2. **Ice crystal lines** (`body::after`): `repeating-linear-gradient` at −55° with `ice-shimmer` animation (7s ease-in-out, opacity 0.03–0.07)
3. **Aurora bands** (`.aurora-wrap` fixed element in `BaseLayout`): two `<div>` bands
   - Green band: `#00d4a0` → `#00b8d4`, `aurora-drift` animation 10s
   - Purple band: `#6040c0` → `#4060c0`, `aurora-drift2` animation 14s

### Color palette additions to `:root`

```css
--aurora-green:  #00d4a0;
--aurora-teal:   #00b8d4;
--aurora-purple: #6040c0;
```

Existing accent (`--accent: #5ba3d9`) is retained as primary interactive color.

### Tag chip styles (4 tiers)

| Class | Font size | Color | Border | Background | Shadow |
|---|---|---|---|---|---|
| `.size-xl` | 0.78rem | `#7dc0f0` | `#5ba3d9` | `#5ba3d912` | `0 0 8px #5ba3d935` + pulse animation |
| `.size-lg` | 0.70rem | `#5ba3d9` | `#2a4060` | `#5ba3d908` | `0 0 5px #5ba3d920` |
| `.size-md` | 0.65rem | `#4a7a9b` | `#1e2d4a` | transparent | none |
| `.size-sm` | 0.60rem | `#2a4a65` | `#162030` | transparent | none |

All chips: `hover` state lifts to accent-hover color + stronger glow.

`.size-xl` chips have a `chip-pulse` keyframe animation (3s, alternates glow intensity).

### Sidebar panel

- `background: linear-gradient(145deg, #0d1522cc, #0a111e99)`
- `backdrop-filter: blur(6px)`
- Top edge: 1px gradient line `transparent → #00d4a030 → #00b8d430 → transparent`
- Title: `// tags` in `var(--aurora-teal)`, monospace, uppercase

### Site name

`southern_light` — the `_light` suffix rendered in `var(--aurora-teal)` with `text-shadow: 0 0 10px #00b8d440`. The `southern` prefix stays `var(--text)`.

---

## CSS Animations

| Name | Duration | Effect |
|---|---|---|
| `aurora-drift` | 10s | Green band: translateX ±4% + scaleX, opacity 0.22–0.32 |
| `aurora-drift2` | 14s | Purple band: translateX ±3% + scaleX, opacity 0.10–0.18 |
| `ice-shimmer` | 7s | Ice lines opacity 0.03–0.07 |
| `chip-pulse` | 3s | xl chip box-shadow intensity alternates |

All animations use `ease-in-out infinite`.

---

## Responsive Behaviour

- `>= 768px`: full layout with sidebar visible
- `< 768px`: sidebar hidden (`display: none`), main content returns to full width

---

## Files to Change

| File | Change |
|---|---|
| `src/styles/global.css` | Add aurora/ice background, animation keyframes, sidebar + chip styles, update `--max-width` |
| `src/layouts/BaseLayout.astro` | Add aurora bands markup, `.page-layout` flex wrapper, `<TagCloud />` import |
| `src/components/TagCloud.astro` | New component — fetch tags, count frequency, render chips |
| `src/pages/index.astro` | Inherits layout change automatically |
| `src/pages/blog/index.astro` | Inherits layout change automatically |
| `src/pages/tags/[tag].astro` | Inherits layout change automatically |
| `src/layouts/PostLayout.astro` | Inherits layout change via BaseLayout |
