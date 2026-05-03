# Southern Light — 交接文件

## 專案目標

把 `redtear1115.github.io` 翻新成一個技術部落格，domain 為 `southern-light.dev`（CNAME 已設定好）。

## 技術棧

- **框架**：Astro 4.x（blog template 為基礎，但主題完全客製）
- **語言**：TypeScript（strict mode）
- **部署**：GitHub Pages，透過 GitHub Actions 自動 build & deploy

## 設計方向

**極地冷色調 + 科技感，極簡風格。**

參考色盤：
- 背景：`#0a0e1a`（深海藍黑）
- 表面：`#0f1629`
- 邊框 / 分隔線：`#1e2d4a`
- 主要文字：`#e8eef7`（接近白的冷灰）
- 次要文字：`#8aa0bc`
- Accent（冰藍）：`#5ba3d9`
- Accent hover：`#7dc0f0`
- Code block 背景：`#0d1522`

字型：
- 內文：`Inter` 或系統字型堆疊
- Code / monospace accent：`JetBrains Mono` 或 `Fira Code`（從 Google Fonts 載入）

整體風格：大量留白、細線條、無多餘裝飾。

## 頁面結構

```
/              首頁：簡短自介（2–3 行）+ 最新文章列表
/blog          文章列表頁（所有文章，按時間排序）
/blog/[slug]   文章頁
/about         關於我
```

### 首頁自介內容（暫定，Ray 可以自行改）

```
Ray Lee
Backend Engineer at KDAN.
Building things with Ruby, occasionally JavaScript.
Writing about systems, tools, and side projects.
```

社群連結（放在自介下方，icon + text）：
- GitHub: `https://github.com/redtear1115`
- Email: `vfgcees@gmail.com`

## 目錄結構

```
redtear1115.github.io/
├── .github/
│   └── workflows/
│       ├── deploy.yml          # build & deploy to Pages
│       └── issue-to-post.yml   # Issue published label → 轉成 .md → commit
├── src/
│   ├── components/
│   │   ├── BaseHead.astro      # <head> meta tags, fonts
│   │   ├── Header.astro        # site header / nav
│   │   ├── Footer.astro        # footer
│   │   └── PostCard.astro      # 文章列表卡片
│   ├── layouts/
│   │   ├── BaseLayout.astro    # 所有頁面共用 wrapper
│   │   └── PostLayout.astro    # 文章頁 layout（含 prose 樣式）
│   ├── pages/
│   │   ├── index.astro         # 首頁
│   │   ├── about.astro         # 關於我
│   │   └── blog/
│   │       ├── index.astro     # 文章列表
│   │       └── [...slug].astro # 文章頁
│   ├── content/
│   │   ├── config.ts           # content collection 設定
│   │   └── blog/               # .md / .mdx 文章放這裡
│   └── styles/
│       └── global.css          # 全域樣式、CSS variables
├── public/
│   └── favicon.svg             # 極地主題 favicon（建議用冰藍色幾何圖形）
├── astro.config.mjs
├── tsconfig.json
├── package.json
└── CNAME                       # 已存在，內容為 southern-light.dev
```

## GitHub Actions 說明

### 1. `deploy.yml` — 自動 build & deploy

觸發條件：push 到 `main` branch。

流程：
1. Checkout repo
2. Install Node 22 + npm install
3. `astro build`（output 到 `dist/`）
4. Deploy `dist/` 到 `gh-pages` branch（用 `peaceiris/actions-gh-pages`）

### 2. `issue-to-post.yml` — Issue as CMS

**觸發條件**：Issue 被加上 `published` label。

流程：
1. 取得 Issue 的 title、body、created_at、labels
2. 從 labels 中篩出 `tag:*` 格式的 label 作為文章 tags（例如 label `tag:devlog` → tag `devlog`）
3. 將 Issue body（markdown）加上 frontmatter，存成 `src/content/blog/{slug}.md`
   - slug 從 issue title 轉換（lowercase、空白換 `-`、去掉特殊字元）
   - frontmatter 格式：
     ```yaml
     ---
     title: "Issue 的 title"
     pubDate: "2026-05-03"
     tags: ["devlog"]
     draft: false
     ---
     ```
4. Commit 並 push 到 `main`
5. 這個 push 會觸發 `deploy.yml` 自動 build

所需 secret：
- `GH_PAT`：有 `repo` 權限的 Personal Access Token（用來 commit & push）

> **注意**：`GITHUB_TOKEN` 預設不能觸發後續 workflow，所以必須用 PAT。

## Content Collection 設定

`src/content/config.ts`：

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

## 舊檔案清理

repo 裡目前還有舊的靜態站殘留（`post/`、`archives/`、`tag/`、`styles/`、`images/` 等），這些都是舊內容，全部刪除。只保留：
- `.git/`
- `CNAME`
- `package.json`（已建立）
- 新建的所有檔案

## 注意事項

- Astro build output 設定為 `output: 'static'`
- `site` 設定為 `https://southern-light.dev`
- 文章頁的 prose 樣式自己寫 CSS，不用 `@tailwindcss/typography`（保持依賴簡單）
- 不需要搜尋功能、留言功能、分頁（文章量少）
- 不需要 dark/light toggle（永遠深色）
