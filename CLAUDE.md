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

## 發文流程（issue-to-post）

- 在 GitHub issue 貼 `published` label → `.github/workflows/issue-to-post.yml` 把 issue 轉成 `src/content/blog/<slug>.md`、commit 進 master，並**在同一個 run 內**用剛 build 好的 `dist/` 直接部署到 GitHub Pages（`upload-pages-artifact` + `deploy-pages`）。
- slug 取自 issue frontmatter 的 `slug:`，沒寫才用標題推導。
- ⚠️ **不要改回「push 完再 `gh workflow run deploy.yml` dispatch 部署」的做法**。那會踩 ref 傳播 race：dispatch 時 `master` 可能還指向前一個 commit，導致部署到舊版、新文章 404（issue #97 就是這個 bug）。發文一定要 commit 與部署在同一個 run、用同一份 build artifact。
- `deploy.yml` 仍保留，負責「直接 push 到 master」與手動 `workflow_dispatch` 的部署。
