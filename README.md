# Southern Light

Personal technical blog at [southern-light.dev](https://southern-light.dev).

**Stack:** Astro 4 (static-only, no client JS), TypeScript strict, hand-written CSS, GitHub Pages

## Dev Commands

```bash
npm install
npm run dev      # localhost:4321
npm run build    # typecheck + build to dist/
npx astro check  # type-check only
```

## Writing Posts

Posts live in `src/content/blog/*.md`. Schema: [`src/content/config.ts`](src/content/config.ts).

**Via GitHub Issues (preferred):** Write the post body as markdown in an issue, add a `published` label → `issue-to-post.yml` commits the file to `master` and triggers deploy automatically.

**Manually:** Create `src/content/blog/<slug>.md` with correct frontmatter, commit and push to `master`.

## CI/CD

- [`deploy.yml`](.github/workflows/deploy.yml) — push to `master` → build → deploy to `gh-pages` branch
- [`issue-to-post.yml`](.github/workflows/issue-to-post.yml) — `published` label → write markdown → commit → triggers deploy

Required secret: `GH_PAT` (classic PAT, `repo` scope). `GITHUB_TOKEN` cannot trigger downstream workflows, hence the PAT.

Tags on posts come from issue labels in `tag:*` format (e.g. label `tag:ruby` → frontmatter tag `ruby`).

## 注意事項

- Astro build output 設定為 `output: 'static'`
- `site` 設定為 `https://southern-light.dev`
- 文章頁的 prose 樣式自己寫 CSS，不用 `@tailwindcss/typography`（保持依賴簡單）
- 不需要搜尋功能、留言功能、分頁（文章量少）
- 不需要 dark/light toggle（永遠深色）
