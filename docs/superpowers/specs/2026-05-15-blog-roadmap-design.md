# Blog Roadmap Design: v0.2.0 → v0.4.0

**Date:** 2026-05-15
**Current version:** 0.1.0
**Stack:** Astro, static site, TypeScript, dark theme

---

## Context

Personal dev blog (southern-light). Posts are Markdown files in `src/content/blog/` with frontmatter fields: `title`, `pubDate`, `tags[]`, `draft`. Listing at `/blog`, individual posts at `/blog/[slug]`.

Reference: ruanyifeng.com/blog — analyzed for feature inspiration. Selected features prioritized by reader utility over complexity.

---

## v0.2.0 — Post Navigation

**Goal:** Readers can move to the previous or next post without going back to the listing.

### What changes

**`src/pages/blog/[...slug].astro`**
- After getting all non-draft posts sorted by `pubDate` descending, find the index of the current post.
- Derive `prev` (older, index + 1) and `next` (newer, index - 1) as `{ slug: string, title: string } | undefined`.
- Pass both as props to `PostLayout`.

**`src/layouts/PostLayout.astro`**
- Add `prev` and `next` to the `Props` interface (both optional).
- Render a `<nav class="post-nav">` block below `.prose`, only when at least one of `prev` / `next` exists.
- Left column: `← prev.title` linking to `/blog/prev.slug` (empty if no prev).
- Right column: `next.title →` linking to `/blog/next.slug` (empty if no next).

**`src/styles/global.css`**
- Add `.post-nav` styles: `display: flex; justify-content: space-between`, top border using `var(--border)`, link colors using `var(--accent)` / `var(--text-muted)` for the label arrows.

### Constraints
- Fully static, no JavaScript.
- "Previous" = older post (lower pubDate); "Next" = newer post (higher pubDate). Consistent with blog convention.
- No change to content schema or other pages.

---

## v0.3.0 — Tag Pages

**Goal:** Clicking a `#tag` on any post navigates to a filtered list of all posts with that tag.

### What changes

**`src/pages/tags/[tag].astro`** (new file)
- `getStaticPaths`: collect all unique tags from non-draft posts, return one path per tag with its matching posts as props.
- Page renders a heading `#tag` and a `<ul class="post-list">` reusing `PostCard`.
- Reuses `BaseLayout`.

**`src/layouts/PostLayout.astro`**
- Tag `<span class="tag">` elements in `.meta` become `<a href="/tags/{tag}" class="tag">`.

**`src/pages/blog/index.astro`**
- Same tag → link change in `PostCard`, or handled inside `PostCard.astro` directly.

**`src/components/PostCard.astro`**
- Tag spans become tag links `<a href="/tags/{tag}">`.

### Constraints
- Tag slugs use the raw tag string as-is (already lowercase with no spaces by convention).
- No new schema fields needed.
- No tag index page (`/tags`) needed in this milestone — can be added later.

---

## v0.4.0 — RSS Feed + Reading Time

**Goal:** Readers can subscribe via RSS; post pages show estimated reading time.

### RSS Feed

**Install:** `@astrojs/rss` (official Astro plugin).

**`src/pages/rss.xml.ts`** (new file)
- Use `@astrojs/rss` `rss()` helper with all non-draft posts sorted by `pubDate` descending.
- Fields: `title`, `pubDate`, `description` (from frontmatter `description` if present, else empty).

**`src/components/BaseHead.astro`**
- Add `<link rel="alternate" type="application/rss+xml" title="Southern Light" href="/rss.xml">`.

**`src/components/Header.astro`**
- Add a small `rss` nav link pointing to `/rss.xml`.

### Reading Time

**`src/pages/blog/[...slug].astro`**
- After rendering, estimate reading time from `post.body` (raw markdown string):
  - Count CJK characters + English words separately.
  - Formula: `Math.ceil((cjkCount + wordCount) / 300)` minutes (300 chars/words per minute).
- Pass `readingTime: number` to `PostLayout`.

**`src/layouts/PostLayout.astro`**
- Add `readingTime` to `Props` (optional).
- Display in `.meta` row as `~{readingTime} min read`.

### Constraints
- No external reading-time library; inline estimation is sufficient.
- RSS feed includes only public (non-draft) posts.
- `description` field remains optional in schema — RSS falls back to empty string.

---

## Out of scope (not in these milestones)

- Search
- Comment system
- Archive by year
- Tag index page (`/tags`)
- Sidebar
