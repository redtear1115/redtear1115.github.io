# Southern Light Blog — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `redtear1115.github.io` as a minimal, dark, technical blog ("Southern Light") served at `southern-light.dev`, statically built with Astro 4 and deployed via GitHub Actions, with GitHub Issues acting as a CMS.

**Architecture:** Static-only Astro site with a single `blog` content collection. Posts live under `src/content/blog/*.md(x)`. A second workflow turns labelled GitHub Issues into committed markdown files, which then trigger the deploy workflow. CSS is hand-written (no Tailwind) using a small set of CSS variables for the polar/cold palette. No client-side JS beyond what Astro emits by default (which is none, for our pages).

**Tech Stack:** Astro 4.16, `@astrojs/mdx`, `@astrojs/sitemap`, TypeScript strict, GitHub Actions, peaceiris/actions-gh-pages, GitHub Pages on a custom domain.

**Notes for the executor:**
- This is a static site rebuild: traditional unit-test TDD doesn't apply. "Verification" for each task is a **typecheck + build + dist inspection** loop instead of `pytest`. Every task that produces user-visible output ends with `npx astro check` and (where the page exists) `npm run build` to confirm nothing broke.
- Run all commands from the repo root: `/Users/ray-lee/Projects/js/redtear1115.github.io`.
- Commit after every task. Use Conventional Commits (`feat:`, `chore:`, `style:`, `ci:`).
- Do **not** install Tailwind, typography plugins, or any UI framework. Hand-written CSS only.

---

## File Structure

What gets created and what each file is responsible for:

```
.github/workflows/
  deploy.yml             # build + push dist/ to gh-pages on every push to main
  issue-to-post.yml      # on issue labelled "published": write src/content/blog/<slug>.md, commit, push
public/
  CNAME                  # moved from repo root; Astro copies to dist/
  favicon.svg            # ice-blue geometric mark
src/
  components/
    BaseHead.astro       # <head>: meta, OG, fonts, global.css
    Header.astro         # site header (name + nav)
    Footer.astro         # bottom bar (year, links)
    PostCard.astro       # one row in the post list
  layouts/
    BaseLayout.astro     # <html><body><Header/><main/><Footer/></body></html>
    PostLayout.astro     # BaseLayout + .prose article wrapper + post header
  pages/
    index.astro          # hero intro + recent posts
    about.astro          # static about page
    blog/index.astro     # full post list
    blog/[...slug].astro # one post, uses PostLayout
  content/
    config.ts            # blog collection schema (title, pubDate, tags, draft)
    blog/
      hello-world.md     # seed post used to verify the build before real content
  styles/
    global.css           # CSS variables + base + .prose + component styles
astro.config.mjs         # site, output:'static', mdx + sitemap integrations
tsconfig.json            # extends astro/tsconfigs/strict
```

`HANDOFF.md`, `CNAME` (after move), `package.json`, `.git/` are the only things that survive cleanup.

---

## Task 1: Clean up old static-site artefacts

The repo currently contains a previous Gridea-generated site. Strip it down to the four things we keep, and move `CNAME` into `public/` so Astro emits it to `dist/`.

**Files:**
- Delete: `archives/`, `atom.xml`, `favicon.ico`, `images/`, `index.html`, `media/`, `post/`, `post-images/`, `styles/`, `tag/`, `tags/`, `.DS_Store`, `post/.DS_Store`, `tag/.DS_Store`
- Move: `CNAME` → `public/CNAME`
- Keep untouched: `.git/`, `HANDOFF.md`, `package.json`, `docs/`

- [ ] **Step 1: Verify what's there**

```bash
ls -la
```

Expected output includes the directories listed above plus the keepers.

- [ ] **Step 2: Create `public/` and move `CNAME` into it**

```bash
mkdir -p public
git mv CNAME public/CNAME
```

- [ ] **Step 3: Delete old static artefacts**

```bash
git rm -r archives atom.xml favicon.ico images index.html media post post-images styles tag tags
find . -name '.DS_Store' -not -path './.git/*' -delete
```

- [ ] **Step 4: Add `.DS_Store` and `node_modules` to `.gitignore`**

Create `.gitignore` with:

```gitignore
node_modules
dist
.astro
.DS_Store
*.log
.env
.env.*
!.env.example
```

- [ ] **Step 5: Verify final state**

```bash
ls -la
```

Expected: `.git/`, `.gitignore`, `HANDOFF.md`, `docs/`, `package.json`, `public/`. Nothing else.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: remove legacy static site, move CNAME into public/"
```

---

## Task 2: Bootstrap Astro config + TypeScript + install deps

`package.json` already lists Astro, mdx, sitemap. We need a config file, a TS config, and a lockfile.

**Files:**
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create (via npm install): `package-lock.json`, `node_modules/` (gitignored)

- [ ] **Step 1: Create `astro.config.mjs`**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://southern-light.dev',
  output: 'static',
  trailingSlash: 'never',
  integrations: [mdx(), sitemap()],
  build: {
    format: 'directory',
  },
});
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules"]
}
```

- [ ] **Step 3: Install dependencies**

```bash
npm install
```

Expected: creates `package-lock.json`, downloads `node_modules/`. No errors.

- [ ] **Step 4: Verify Astro is callable**

```bash
npx astro --version
```

Expected: `4.16.x` (or whatever resolved within the `^4.16.0` range).

- [ ] **Step 5: Commit**

```bash
git add astro.config.mjs tsconfig.json package-lock.json
git commit -m "feat: bootstrap Astro 4 + TypeScript strict config"
```

---

## Task 3: Define the blog content collection

Set up the schema Astro uses to type-check post frontmatter, and make sure the directory exists so `astro check` doesn't complain.

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/blog/.gitkeep` (placeholder; replaced by real seed post in Task 12)

- [ ] **Step 1: Create the schema**

`src/content/config.ts`:

```ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

- [ ] **Step 2: Create the empty content directory**

```bash
mkdir -p src/content/blog
touch src/content/blog/.gitkeep
```

- [ ] **Step 3: Run typecheck**

```bash
npx astro sync && npx astro check
```

Expected: `astro sync` generates `.astro/` types. `astro check` reports `0 errors, 0 warnings`. (It's normal to see hints.)

- [ ] **Step 4: Commit**

```bash
git add src/content/config.ts src/content/blog/.gitkeep
git commit -m "feat: define blog content collection schema"
```

---

## Task 4: Global stylesheet (palette, base, prose)

This file owns every visual decision: the CSS-variable palette from the handoff, base reset, layout containers, and `.prose` rules for article bodies. Hand-written; no plugins.

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Create `src/styles/global.css`**

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

  --font-body: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  --max-width: 720px;
  --radius: 4px;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
}

html {
  background: var(--bg);
  color: var(--text);
}

body {
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

a {
  color: var(--accent);
  text-decoration: none;
  transition: color 0.15s ease;
}
a:hover {
  color: var(--accent-hover);
}

::selection {
  background: var(--accent);
  color: var(--bg);
}

img {
  max-width: 100%;
  height: auto;
}

main {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 4rem 1.5rem;
}

/* ----- Header ----- */
.site-header {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 2rem 1.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.site-header .site-name {
  font-family: var(--font-mono);
  font-size: 1rem;
  color: var(--text);
  letter-spacing: 0.02em;
}
.site-header nav a {
  margin-left: 1.5rem;
  color: var(--text-muted);
  font-size: 0.95rem;
}
.site-header nav a:hover {
  color: var(--accent);
}

/* ----- Footer ----- */
.site-footer {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
  border-top: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 0.85rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-mono);
}

/* ----- Hero (home intro) ----- */
.hero {
  margin-bottom: 4rem;
}
.hero h1 {
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0 0 0.75rem;
  letter-spacing: -0.01em;
}
.hero p {
  color: var(--text-muted);
  margin: 0.4rem 0;
}
.hero .links {
  margin-top: 1.5rem;
  font-family: var(--font-mono);
  font-size: 0.9rem;
}
.hero .links a {
  margin-right: 1.5rem;
}

/* ----- Section labels (e.g., "Recent posts") ----- */
.section-title {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin: 0 0 1.25rem;
}

/* ----- Post list ----- */
.post-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.post-card {
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--border);
}
.post-card:last-child {
  border-bottom: none;
}
.post-card h2 {
  font-size: 1.2rem;
  font-weight: 500;
  margin: 0 0 0.35rem;
  letter-spacing: -0.005em;
}
.post-card h2 a {
  color: var(--text);
}
.post-card h2 a:hover {
  color: var(--accent);
}
.post-card .meta {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--text-muted);
}
.post-card .meta .tag {
  margin-left: 0.75rem;
}

/* ----- Post header ----- */
.post-header {
  margin-bottom: 3rem;
}
.post-header h1 {
  font-size: 2rem;
  font-weight: 600;
  line-height: 1.25;
  margin: 0 0 0.75rem;
  letter-spacing: -0.015em;
}
.post-header .meta {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--text-muted);
}
.post-header .meta .tag {
  margin-left: 0.75rem;
}

/* ----- Prose / article body ----- */
.prose {
  color: var(--text);
}
.prose > :first-child {
  margin-top: 0;
}
.prose h1,
.prose h2,
.prose h3,
.prose h4 {
  color: var(--text);
  font-weight: 600;
  letter-spacing: -0.01em;
}
.prose h2 {
  font-size: 1.4rem;
  margin: 2.5rem 0 1rem;
}
.prose h3 {
  font-size: 1.15rem;
  margin: 2rem 0 0.75rem;
}
.prose h4 {
  font-size: 1rem;
  margin: 1.75rem 0 0.5rem;
}
.prose p {
  margin: 1.25rem 0;
}
.prose ul,
.prose ol {
  margin: 1.25rem 0;
  padding-left: 1.5rem;
}
.prose li {
  margin: 0.4rem 0;
}
.prose blockquote {
  margin: 1.75rem 0;
  padding: 0.25rem 1.25rem;
  border-left: 2px solid var(--accent);
  color: var(--text-muted);
  font-style: italic;
}
.prose code {
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: var(--code-bg);
  padding: 0.15em 0.4em;
  border-radius: 3px;
  color: var(--accent);
}
.prose pre {
  background: var(--code-bg);
  padding: 1rem 1.25rem;
  overflow-x: auto;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  font-size: 0.85rem;
  line-height: 1.6;
}
.prose pre code {
  background: transparent;
  padding: 0;
  color: var(--text);
  font-size: 1em;
}
.prose hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 3rem 0;
}
.prose img {
  border-radius: var(--radius);
  margin: 1.5rem 0;
}
.prose a {
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
  text-decoration-color: var(--border);
}
.prose a:hover {
  text-decoration-color: var(--accent-hover);
}
.prose table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  font-size: 0.92rem;
}
.prose th,
.prose td {
  text-align: left;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--border);
}
.prose th {
  color: var(--text-muted);
  font-weight: 500;
  font-family: var(--font-mono);
  font-size: 0.85em;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "style: global stylesheet with polar palette and prose rules"
```

---

## Task 5: `BaseHead` component

Owns `<head>`: title, description, canonical, OG, RSS-style meta, font preloads, and the import of `global.css`.

**Files:**
- Create: `src/components/BaseHead.astro`

- [ ] **Step 1: Create `src/components/BaseHead.astro`**

```astro
---
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
}

const { title, description = 'Notes on systems, tools, and side projects.' } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="generator" content={Astro.generator} />
<meta name="color-scheme" content="dark" />

<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonicalURL} />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="sitemap" href="/sitemap-index.xml" />

<meta property="og:type" content="website" />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonicalURL} />
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
/>
```

- [ ] **Step 2: Typecheck**

```bash
npx astro check
```

Expected: `0 errors`.

- [ ] **Step 3: Commit**

```bash
git add src/components/BaseHead.astro
git commit -m "feat: BaseHead component with meta + Google Fonts"
```

---

## Task 6: `Header` component

Site name on the left (links home), nav on the right.

**Files:**
- Create: `src/components/Header.astro`

- [ ] **Step 1: Create `src/components/Header.astro`**

```astro
---
---
<header class="site-header">
  <a href="/" class="site-name">southern-light</a>
  <nav>
    <a href="/blog">blog</a>
    <a href="/about">about</a>
  </nav>
</header>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: Header component"
```

---

## Task 7: `Footer` component

Year + small set of links. Static, no JS.

**Files:**
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Create `src/components/Footer.astro`**

```astro
---
const year = new Date().getFullYear();
---
<footer class="site-footer">
  <span>© {year} Ray Lee</span>
  <span>
    <a href="https://github.com/redtear1115">github</a>
  </span>
</footer>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat: Footer component"
```

---

## Task 8: `PostCard` component

A single row in the post list: title (link), pubDate, tags. Used by both home and `/blog`.

**Files:**
- Create: `src/components/PostCard.astro`

- [ ] **Step 1: Create `src/components/PostCard.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  post: CollectionEntry<'blog'>;
}

const { post } = Astro.props;
const { title, pubDate, tags } = post.data;
const dateStr = pubDate.toISOString().slice(0, 10);
---
<li class="post-card">
  <h2><a href={`/blog/${post.slug}`}>{title}</a></h2>
  <div class="meta">
    <time datetime={dateStr}>{dateStr}</time>
    {tags.map((tag) => <span class="tag">#{tag}</span>)}
  </div>
</li>
```

- [ ] **Step 2: Typecheck**

```bash
npx astro check
```

Expected: `0 errors`.

- [ ] **Step 3: Commit**

```bash
git add src/components/PostCard.astro
git commit -m "feat: PostCard component"
```

---

## Task 9: `BaseLayout`

The skeleton every page shares.

**Files:**
- Create: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Create `src/layouts/BaseLayout.astro`**

```astro
---
import BaseHead from '../components/BaseHead.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';

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
    <Header />
    <main>
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: BaseLayout"
```

---

## Task 10: `PostLayout`

Wraps a post with the standard chrome plus a post header (title + meta) and a `.prose` article container.

**Files:**
- Create: `src/layouts/PostLayout.astro`

- [ ] **Step 1: Create `src/layouts/PostLayout.astro`**

```astro
---
import BaseLayout from './BaseLayout.astro';

interface Props {
  title: string;
  description?: string;
  pubDate: Date;
  tags: string[];
}

const { title, description, pubDate, tags } = Astro.props;
const dateStr = pubDate.toISOString().slice(0, 10);
---
<BaseLayout title={title} description={description}>
  <article>
    <header class="post-header">
      <h1>{title}</h1>
      <div class="meta">
        <time datetime={dateStr}>{dateStr}</time>
        {tags.map((tag) => <span class="tag">#{tag}</span>)}
      </div>
    </header>
    <div class="prose">
      <slot />
    </div>
  </article>
</BaseLayout>
```

- [ ] **Step 2: Typecheck**

```bash
npx astro check
```

Expected: `0 errors`.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/PostLayout.astro
git commit -m "feat: PostLayout"
```

---

## Task 11: Home page (`/`)

Hero with the bio + social links, then "Recent posts" (5 most recent non-drafts).

**Files:**
- Create: `src/pages/index.astro`

- [ ] **Step 1: Create `src/pages/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import PostCard from '../components/PostCard.astro';

const posts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
  .slice(0, 5);
---
<BaseLayout title="Southern Light" description="Ray Lee — backend engineer at KDAN. Notes on systems, tools, and side projects.">
  <section class="hero">
    <h1>Ray Lee</h1>
    <p>Backend Engineer at KDAN.</p>
    <p>Building things with Ruby, occasionally JavaScript.</p>
    <p>Writing about systems, tools, and side projects.</p>
    <div class="links">
      <a href="https://github.com/redtear1115">GitHub</a>
      <a href="mailto:vfgcees@gmail.com">Email</a>
    </div>
  </section>

  <section>
    <h2 class="section-title">Recent posts</h2>
    <ul class="post-list">
      {posts.map((post) => <PostCard post={post} />)}
    </ul>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: home page"
```

---

## Task 12: Seed post + about page + remove `.gitkeep`

Add a real post so the build has something to render and pagination logic gets exercised. Also add the about page since it's referenced from the header.

**Files:**
- Create: `src/content/blog/hello-world.md`
- Create: `src/pages/about.astro`
- Delete: `src/content/blog/.gitkeep`

- [ ] **Step 1: Write the seed post**

`src/content/blog/hello-world.md`:

```markdown
---
title: "Hello, world"
pubDate: "2026-05-03"
tags: ["meta"]
draft: false
---

This is the first post on Southern Light. The site is built with Astro,
served from GitHub Pages, and writes posts via labelled GitHub Issues.

## Why a new blog?

Because the old one was Gridea-generated and I wanted something I could
keep alive with the same workflow I already use: open an issue, label it,
done.

## What's next?

Posts about backend systems, Ruby, occasional JavaScript, and the small
tools I build along the way.
```

- [ ] **Step 2: Write the about page**

`src/pages/about.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="About — Southern Light" description="About Ray Lee.">
  <article class="prose">
    <h1>About</h1>
    <p>
      Ray Lee. Backend engineer at <a href="https://kdanmobile.com">KDAN</a>.
      Mostly Ruby, occasionally JavaScript. Based in Taiwan.
    </p>
    <p>
      This site is for notes on systems, tools, and side projects — the kind
      of writing that helps me think more clearly and might be useful to
      someone else later.
    </p>
    <h2>Contact</h2>
    <ul>
      <li>GitHub: <a href="https://github.com/redtear1115">redtear1115</a></li>
      <li>Email: <a href="mailto:vfgcees@gmail.com">vfgcees@gmail.com</a></li>
    </ul>
  </article>
</BaseLayout>
```

- [ ] **Step 3: Drop the placeholder**

```bash
git rm src/content/blog/.gitkeep
```

- [ ] **Step 4: Commit**

```bash
git add src/content/blog/hello-world.md src/pages/about.astro
git commit -m "feat: seed post + about page"
```

---

## Task 13: Blog list page (`/blog`)

All non-draft posts, sorted newest first.

**Files:**
- Create: `src/pages/blog/index.astro`

- [ ] **Step 1: Create `src/pages/blog/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostCard from '../../components/PostCard.astro';

const posts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---
<BaseLayout title="Blog — Southern Light" description="All posts.">
  <h2 class="section-title">All posts</h2>
  <ul class="post-list">
    {posts.map((post) => <PostCard post={post} />)}
  </ul>
</BaseLayout>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/blog/index.astro
git commit -m "feat: blog list page"
```

---

## Task 14: Single post page (`/blog/[...slug]`)

Standard Astro content-collection routing pattern.

**Files:**
- Create: `src/pages/blog/[...slug].astro`

- [ ] **Step 1: Create `src/pages/blog/[...slug].astro`**

```astro
---
import { getCollection, type CollectionEntry } from 'astro:content';
import PostLayout from '../../layouts/PostLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

interface Props {
  post: CollectionEntry<'blog'>;
}

const { post } = Astro.props;
const { Content } = await post.render();
const { title, pubDate, tags } = post.data;
---
<PostLayout title={`${title} — Southern Light`} pubDate={pubDate} tags={tags}>
  <Content />
</PostLayout>
```

- [ ] **Step 2: Typecheck**

```bash
npx astro check
```

Expected: `0 errors`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/blog/[...slug].astro
git commit -m "feat: single post page"
```

---

## Task 15: Favicon

Ice-blue geometric mark — a simple downward triangle (south, light) on the dark background.

**Files:**
- Create: `public/favicon.svg`

- [ ] **Step 1: Create `public/favicon.svg`**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#0a0e1a"/>
  <path d="M16 7 L25 24 L7 24 Z" fill="none" stroke="#5ba3d9" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="16" cy="19" r="1.5" fill="#5ba3d9"/>
</svg>
```

- [ ] **Step 2: Commit**

```bash
git add public/favicon.svg
git commit -m "feat: ice-blue favicon"
```

---

## Task 16: Local end-to-end verification

Make sure the whole thing builds, the expected files land in `dist/`, and a quick `astro preview` smoke test works.

**Files:** none modified.

- [ ] **Step 1: Full typecheck**

```bash
npx astro check
```

Expected: `0 errors, 0 warnings`.

- [ ] **Step 2: Production build**

```bash
npm run build
```

Expected: build succeeds, no errors. Output mentions pages: `/`, `/about`, `/blog`, `/blog/hello-world`, plus `sitemap-index.xml`.

- [ ] **Step 3: Inspect `dist/`**

```bash
ls dist/
ls dist/blog/
test -f dist/CNAME && echo "CNAME present"
test -f dist/favicon.svg && echo "favicon present"
test -f dist/sitemap-index.xml && echo "sitemap present"
```

Expected: `CNAME present`, `favicon present`, `sitemap present`. `dist/` contains `index.html`, `about/index.html`, `blog/index.html`, `blog/hello-world/index.html`.

- [ ] **Step 4: Preview locally**

```bash
npm run preview &
sleep 2
curl -s http://localhost:4321/ | grep -q "Ray Lee" && echo "home OK"
curl -s http://localhost:4321/blog | grep -q "Hello, world" && echo "blog list OK"
curl -s http://localhost:4321/blog/hello-world | grep -q "Hello, world" && echo "post OK"
kill %1 2>/dev/null || true
```

Expected: `home OK`, `blog list OK`, `post OK`.

- [ ] **Step 5: Commit (no-op if nothing changed; otherwise capture any tweaks made above)**

If you needed to fix anything during verification, commit it now with a descriptive message.

---

## Task 17: Deploy workflow (`deploy.yml`)

Push to `main` → build → publish `dist/` to `gh-pages`. Pages serves from `gh-pages`.

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to gh-pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          publish_branch: gh-pages
          user_name: github-actions[bot]
          user_email: github-actions[bot]@users.noreply.github.com
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: deploy workflow (build + push to gh-pages)"
```

> **Note for the human after the plan completes:** in the GitHub repo settings, set Pages → Source to **Deploy from a branch** → `gh-pages` → `/ (root)`. The CNAME is in `public/CNAME` so GitHub Pages will pick up the custom domain automatically on the first publish.

---

## Task 18: Issue-to-post workflow (`issue-to-post.yml`)

When an issue gets the `published` label, materialise it as `src/content/blog/<slug>.md` and push to `main` — which then triggers the deploy workflow above. Uses a PAT (`GH_PAT`) so the resulting push **does** trigger downstream workflows (`GITHUB_TOKEN` would not).

**Files:**
- Create: `.github/workflows/issue-to-post.yml`

- [ ] **Step 1: Create `.github/workflows/issue-to-post.yml`**

```yaml
name: Issue to Post

on:
  issues:
    types: [labeled]

jobs:
  publish:
    if: github.event.label.name == 'published'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GH_PAT }}

      - name: Build post file
        id: build
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const path = require('path');

            const issue = context.payload.issue;
            const title = (issue.title || '').trim();
            const body = (issue.body || '').replace(/\r\n/g, '\n');
            const createdAt = new Date(issue.created_at);
            const pubDate = createdAt.toISOString().slice(0, 10);

            const tags = (issue.labels || [])
              .map((l) => (typeof l === 'string' ? l : l.name))
              .filter((n) => typeof n === 'string' && n.startsWith('tag:'))
              .map((n) => n.slice(4));

            const slug = title
              .toLowerCase()
              .normalize('NFKD')
              .replace(/[̀-ͯ]/g, '')
              .replace(/[^a-z0-9\s-]/g, '')
              .trim()
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-');

            if (!slug) {
              core.setFailed(`Could not derive a slug from title: "${title}"`);
              return;
            }

            const yamlString = (s) => JSON.stringify(s);
            const yamlArray = (arr) =>
              `[${arr.map((t) => JSON.stringify(t)).join(', ')}]`;

            const frontmatter = [
              '---',
              `title: ${yamlString(title)}`,
              `pubDate: ${yamlString(pubDate)}`,
              `tags: ${yamlArray(tags)}`,
              `draft: false`,
              '---',
              '',
            ].join('\n');

            const dir = 'src/content/blog';
            fs.mkdirSync(dir, { recursive: true });
            const filePath = path.join(dir, `${slug}.md`);
            fs.writeFileSync(filePath, frontmatter + body + '\n');

            core.setOutput('slug', slug);
            core.setOutput('title', title);
            core.setOutput('file', filePath);

      - name: Commit and push
        env:
          POST_TITLE: ${{ steps.build.outputs.title }}
          POST_FILE: ${{ steps.build.outputs.file }}
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add "$POST_FILE"
          if git diff --cached --quiet; then
            echo "No changes to commit"
            exit 0
          fi
          git commit -m "post: $POST_TITLE"
          git push origin HEAD:main

      - name: Comment on issue
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GH_PAT }}
          script: |
            const file = '${{ steps.build.outputs.file }}';
            const slug = '${{ steps.build.outputs.slug }}';
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.payload.issue.number,
              body: `Published: \`${file}\` → https://southern-light.dev/blog/${slug}`,
            });
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/issue-to-post.yml
git commit -m "ci: issue-to-post workflow (issue + 'published' label → committed markdown)"
```

> **Note for the human after the plan completes:**
> 1. Create a Personal Access Token (classic, scope: `repo`) and add it as a repo secret named `GH_PAT`.
> 2. Create a label named `published` on the repo.
> 3. (Optional) Create labels `tag:devlog`, `tag:ruby`, `tag:js`, etc., to populate post tags.

---

## Task 19: Push and verify deploy

Final integration check: push the branch, watch GitHub Actions, confirm the site comes up.

- [ ] **Step 1: Sanity-check the working tree is clean**

```bash
git status
```

Expected: `nothing to commit, working tree clean`.

- [ ] **Step 2: Push to `main`**

```bash
git push origin master:main
```

(If the default branch on GitHub is `master` and the deploy workflow expects `main`, either rename the branch on GitHub or update `deploy.yml` `branches: [main]` to match. The handoff says `main` — pick one and stick with it.)

- [ ] **Step 3: Watch the workflow**

```bash
gh run watch
```

Expected: deploy workflow succeeds; `gh-pages` branch gets updated.

- [ ] **Step 4: Confirm GitHub Pages settings**

In the repo settings: Pages → Source → `gh-pages` branch / `/ (root)`. Verify the custom domain shows `southern-light.dev` (picked up from `public/CNAME` → `dist/CNAME`).

- [ ] **Step 5: Smoke-test the live site**

```bash
curl -sIL https://southern-light.dev/ | grep -i 'HTTP/'
curl -s https://southern-light.dev/blog | grep -q 'Hello, world' && echo "live blog OK"
```

Expected: 200 OK; `live blog OK`.

---

## Self-review checklist (already applied to this plan)

- [x] Spec coverage: cleanup, palette, fonts, all four pages, content collection, both workflows, CNAME handling, GH_PAT note, "no Tailwind / no toggle / no search / no pagination" all addressed.
- [x] No placeholders — every step contains the actual code or command.
- [x] Type consistency — `pubDate: Date`, `tags: string[]`, `draft: boolean` flow through `config.ts`, `PostCard`, `PostLayout`, `[...slug].astro` consistently.
- [x] File paths are exact (relative to repo root).
- [x] Commits are frequent (one per task).
