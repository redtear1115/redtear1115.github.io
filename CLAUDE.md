# CLAUDE.md

這是一個個人技術部落格 repo（Astro）。只有我一個人在維護。

## 開發流程

- **單分支**：直接在 `master` 上 commit，不需要開 branch、不需要 PR。
- 做完任何變更直接 `git add` → `git commit` → `git push`。
- 不用問「要不要開 PR」或「要不要開 branch」。

## 專案結構

- `src/content/blog/` — 部落格文章（Markdown）
- `src/content/config.ts` — Astro content collection schema
- `src/pages/` — Astro 頁面與路由
- `.github/blog-state.json` — 記錄各 side project repo 已處理到的 commit sha
