# Aurora Tag Cloud Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a sticky right-sidebar tag cloud to all pages and apply an Aurora Australis / ice-ocean visual theme to the entire blog.

**Architecture:** All visual changes live in `global.css` (CSS variables, animations, background, layout, chip styles). A new `TagCloud.astro` component fetches post tags at build time and renders glow chips. `BaseLayout.astro` gains aurora HTML bands and a flex wrapper that places `<TagCloud>` as a sticky aside on every page.

**Tech Stack:** Astro 4, CSS animations (no JS runtime), `astro:content` collection API

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/styles/global.css` | Modify | CSS variables, keyframes, body background, layout, chip styles |
| `src/components/TagCloud.astro` | Create | Fetch tags, count frequency, render glow chips |
| `src/layouts/BaseLayout.astro` | Modify | Aurora bands HTML, flex page layout, TagCloud import |
| `src/components/Header.astro` | Modify | Colorize `_light` suffix in aurora teal |

---

## Task 1: CSS — Variables, Keyframes, Body Background

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add aurora color variables and update max-width**

In `src/styles/global.css`, update the `:root` block:

```css
:root {
  --bg: #0a0e1a;
  --surface: #0f1629;
  --border: #1e2d4a;
  --text: #e8eef7;
  --text-muted: #8aa0bc;
  --accent: #5ba3d9;
  --accent-hover: #7dc0f0;
  --code-bg: #0d1522;

  /* aurora additions */
  --aurora-green:  #00d4a0;
  --aurora-teal:   #00b8d4;
  --aurora-purple: #6040c0;

  --font-body: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  --max-width: 920px;       /* was 720px */
  --sidebar-width: 200px;
  --radius: 4px;
}
```

- [ ] **Step 2: Add keyframe animations** after the `:root` block

```css
@keyframes aurora-drift {
  0%   { transform: translateX(-4%) scaleX(1);    opacity: 0.22; }
  50%  { transform: translateX(4%)  scaleX(1.06); opacity: 0.32; }
  100% { transform: translateX(-4%) scaleX(1);    opacity: 0.22; }
}
@keyframes aurora-drift2 {
  0%   { transform: translateX(3%)  scaleX(1.08); opacity: 0.10; }
  55%  { transform: translateX(-3%) scaleX(0.94); opacity: 0.18; }
  100% { transform: translateX(3%)  scaleX(1.08); opacity: 0.10; }
}
@keyframes ice-shimmer {
  0%, 100% { opacity: 0.03; }
  50%      { opacity: 0.07; }
}
@keyframes chip-pulse {
  0%, 100% { box-shadow: 0 0 6px #5ba3d930, inset 0 0 6px #5ba3d910; }
  50%      { box-shadow: 0 0 12px #5ba3d950, inset 0 0 10px #5ba3d920; }
}
```

- [ ] **Step 3: Add body background pseudo-elements** (after the existing `body { … }` rule)

```css
/* ice ocean gradient */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 200% 50% at 50% -5%, #00a8e018 0%, transparent 55%),
    radial-gradient(ellipse 120% 70% at 5%  60%, #004a9010 0%, transparent 55%),
    linear-gradient(160deg, #060a14 0%, #0a0e1a 45%, #070b17 100%);
  pointer-events: none;
  z-index: 0;
}

/* ice crystal lines */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: repeating-linear-gradient(
    -55deg,
    transparent 0px, transparent 70px,
    #ffffff05 70px, #ffffff05 71px
  );
  pointer-events: none;
  z-index: 0;
  animation: ice-shimmer 7s ease-in-out infinite;
}
```

- [ ] **Step 4: Make `main` and layout wrappers appear above background**

Append `position: relative; z-index: 1;` to the existing `main` rule:

```css
main {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 4rem 1.5rem;
  position: relative;
  z-index: 1;
}
```

Also update `.site-header` and `.site-footer` to add `position: relative; z-index: 1;` so they render above the fixed background.

- [ ] **Step 5: Build check**

```bash
npm run build
```

Expected: build succeeds with no errors. The background will not be visible yet (aurora bands HTML not added).

- [ ] **Step 6: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add aurora CSS variables, keyframes, and ice background"
```

---

## Task 2: CSS — Page Layout (Sidebar Flex)

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add page layout styles** at the end of `global.css`

```css
/* ----- Page layout (main + sidebar) ----- */
.page-layout {
  display: flex;
  gap: 2.5rem;
  align-items: flex-start;
  padding: 3.5rem 0 5rem;
}

.page-main {
  flex: 1;
  min-width: 0;
}

.page-sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  position: sticky;
  top: 2rem;
}

/* hide sidebar on mobile */
@media (max-width: 767px) {
  .page-sidebar { display: none; }
  .page-layout { padding: 2.5rem 0 4rem; }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add page layout flex styles for sidebar"
```

---

## Task 3: CSS — Sidebar Panel & Tag Chip Styles

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add sidebar panel styles** at the end of `global.css`

```css
/* ----- Sidebar panel ----- */
.sidebar-panel {
  background: linear-gradient(145deg, #0d1522cc, #0a111e99);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 1.1rem 1rem;
  backdrop-filter: blur(6px);
  position: relative;
  overflow: hidden;
}

.sidebar-panel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00d4a030 40%, #00b8d430 60%, transparent);
}

.sidebar-title {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--aurora-teal);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  margin-bottom: 0.9rem;
  opacity: 0.85;
}
```

- [ ] **Step 2: Add tag cloud and chip styles**

```css
/* ----- Tag cloud chips ----- */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag-chip {
  display: inline-block;
  font-family: var(--font-mono);
  padding: 3px 9px;
  border-radius: 12px;
  border: 1px solid;
  text-decoration: none;
  transition: all 0.2s;
  line-height: 1.4;
}

.tag-chip.size-xl {
  font-size: 0.78rem;
  color: var(--accent-hover);
  border-color: var(--accent);
  background: #5ba3d912;
  box-shadow: 0 0 8px #5ba3d935, inset 0 0 8px #5ba3d910;
  animation: chip-pulse 3s ease-in-out infinite;
}

.tag-chip.size-lg {
  font-size: 0.70rem;
  color: var(--accent);
  border-color: #2a4060;
  background: #5ba3d908;
  box-shadow: 0 0 5px #5ba3d920;
}

.tag-chip.size-md {
  font-size: 0.65rem;
  color: #4a7a9b;
  border-color: #1e2d4a;
  background: transparent;
}

.tag-chip.size-sm {
  font-size: 0.60rem;
  color: #2a4a65;
  border-color: #162030;
  background: transparent;
}

.tag-chip:hover {
  color: var(--accent-hover) !important;
  border-color: var(--accent) !important;
  background: #5ba3d915 !important;
  box-shadow: 0 0 10px #5ba3d940 !important;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add sidebar panel and tag chip styles"
```

---

## Task 4: Create TagCloud.astro Component

**Files:**
- Create: `src/components/TagCloud.astro`

- [ ] **Step 1: Create the component**

Create `src/components/TagCloud.astro`:

```astro
---
import { getCollection } from 'astro:content';

const posts = await getCollection('blog', ({ data }) => !data.draft);

const counts = new Map<string, number>();
for (const post of posts) {
  for (const tag of post.data.tags) {
    counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
}

function sizeClass(count: number): string {
  if (count >= 5) return 'size-xl';
  if (count >= 3) return 'size-lg';
  if (count >= 2) return 'size-md';
  return 'size-sm';
}

const tags = [...counts.entries()].sort((a, b) => b[1] - a[1]);
---

<aside class="page-sidebar">
  <div class="sidebar-panel">
    <div class="sidebar-title">// tags</div>
    <div class="tag-cloud">
      {tags.map(([tag, count]) => (
        <a class={`tag-chip ${sizeClass(count)}`} href={`/tags/${tag}`}>
          {tag}
        </a>
      ))}
    </div>
  </div>
</aside>
```

- [ ] **Step 2: Build check to verify no TypeScript errors**

```bash
npm run build
```

Expected: build succeeds. TagCloud is not rendered anywhere yet so no visual change.

- [ ] **Step 3: Commit**

```bash
git add src/components/TagCloud.astro
git commit -m "feat: add TagCloud component with frequency-based chip sizing"
```

---

## Task 5: Update BaseLayout.astro

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Update BaseLayout to add aurora bands and page layout wrapper**

Replace the entire content of `src/layouts/BaseLayout.astro`:

```astro
---
import BaseHead from '../components/BaseHead.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import TagCloud from '../components/TagCloud.astro';

interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <BaseHead title={title} description={description} />
  </head>
  <body>
    <!-- Aurora bands (fixed, behind content) -->
    <div class="aurora-wrap" aria-hidden="true">
      <div class="aurora-band aurora-green"></div>
      <div class="aurora-band aurora-purple"></div>
    </div>

    <Header />
    <div class="site-wrapper">
      <div class="page-layout">
        <main class="page-main">
          <slot />
        </main>
        <TagCloud />
      </div>
    </div>
    <Footer />
  </body>
</html>
```

- [ ] **Step 2: Add aurora band CSS at the end of `global.css`**

```css
/* ----- Aurora bands (fixed overlay) ----- */
.aurora-wrap {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 300px;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.aurora-band {
  position: absolute;
  left: -15%; right: -15%;
  height: 200px;
  border-radius: 50%;
}

.aurora-band.aurora-green {
  top: -70px;
  background: linear-gradient(180deg,
    transparent 0%,
    #00d4a015 30%,
    #00c8b825 55%,
    #00b8d415 75%,
    transparent 100%
  );
  animation: aurora-drift 10s ease-in-out infinite;
}

.aurora-band.aurora-purple {
  top: -20px;
  background: linear-gradient(180deg,
    transparent 0%,
    #6040c012 25%,
    #4060c020 55%,
    transparent 100%
  );
  animation: aurora-drift2 14s ease-in-out infinite;
}
```

- [ ] **Step 3: Add `.site-wrapper` centering styles at the end of `global.css`**

```css
.site-wrapper {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 1.5rem;
  position: relative;
  z-index: 1;
}
```

Also update `.site-header` and `.site-footer` in global.css to use `max-width: var(--max-width)` (they already do — verify they still display correctly).

- [ ] **Step 4: Remove the old `main` padding-top since `.page-layout` handles vertical spacing**

In `global.css`, update the `main` rule:

```css
main {
  max-width: unset;   /* width now controlled by .page-main flex child */
  margin: 0;
  padding: 0;
  position: relative;
  z-index: 1;
}
```

- [ ] **Step 5: Build and visually verify**

```bash
npm run build && npm run preview
```

Open `http://localhost:4321` (or the port shown). Check:
- [ ] Aurora bands visible at top of page (faint green/purple glow)
- [ ] Ice crystal lines shimmer subtly in background
- [ ] Tag cloud appears in right sidebar on all pages
- [ ] Chips are sized correctly (astro/typescript biggest, rare tags smallest)
- [ ] Clicking a chip navigates to `/tags/[tag]`
- [ ] On a narrow window (< 768px) sidebar disappears and content fills full width

- [ ] **Step 6: Commit**

```bash
git add src/layouts/BaseLayout.astro src/styles/global.css
git commit -m "feat: integrate aurora bands and tag cloud sidebar into BaseLayout"
```

---

## Task 6: Update Header — Colorize `_light` Suffix

**Files:**
- Modify: `src/components/Header.astro`

- [ ] **Step 1: Update site name markup**

Replace `src/components/Header.astro`:

```astro
---
---
<header class="site-header">
  <a href="/" class="site-name">southern<span class="site-name-accent">_light</span></a>
  <nav>
    <a href="/blog">blog</a>
    <a href="/about">about</a>
    <a href="/rss.xml">rss</a>
  </nav>
</header>
```

- [ ] **Step 2: Add `.site-name-accent` style to `global.css`**

In the `/* ----- Header ----- */` section of `global.css`, append:

```css
.site-name-accent {
  color: var(--aurora-teal);
  text-shadow: 0 0 10px #00b8d440;
}
```

- [ ] **Step 3: Build check**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.astro src/styles/global.css
git commit -m "feat: colorize _light suffix in header with aurora teal"
```

---

## Task 7: Final Verification

- [ ] **Step 1: Full build**

```bash
npm run build
```

Expected: exits 0, no TypeScript errors, no missing file errors.

- [ ] **Step 2: Visual smoke test** (`npm run preview`, open browser)

Check each page type:
- [ ] `/` — home page: aurora bands, ice background, sidebar with tag cloud
- [ ] `/blog` — post list: sidebar visible, all tags present
- [ ] `/blog/hello-world` (or any post) — post page: sidebar visible, content width unchanged
- [ ] `/tags/astro` — tag page: sidebar visible
- [ ] Resize to < 768px: sidebar disappears cleanly

- [ ] **Step 3: Commit if any CSS tweaks were needed**

```bash
git add -p
git commit -m "fix: visual polish after full integration"
```
