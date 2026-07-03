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
- **程式碼區塊一定要標語言**（`` ```ts ``、`` ```bash ``、`` ```json `` …），不要用裸 `` ``` ``。Shiki 用 Nord 主題上色，沒標語言會被當 `plaintext` 顯示成單色，跟其他文章的彩色 code 不一致。語言標記對就會自動套上冷色系高亮，樣式不用改。

## 標籤詞彙（受控清單）

標籤雲要維持技術部落格的樣子，**只用下面這 30 個全小寫 kebab-case 英文標籤**，每篇 2–5 個。不要發明新標籤、不要用中文；真的需要新增類別再回頭擴充這份清單（並同步 `TagCloud.astro` 的字級級距）。

- **Projects**：`futari` · `wildcard` · `vanishwhisper`
- **Stack**：`typescript` · `react` · `nextjs` · `tailwind` · `phaser` · `capacitor` · `firebase` · `supabase` · `google-cloud`
- **Topics**：`ai` · `architecture` · `refactoring` · `design-system` · `accessibility` · `performance` · `seo` · `i18n` · `security` · `database` · `observability` · `testing` · `gamedev` · `indie-dev`
- **Type**：`devlog` · `postmortem` · `retrospective` · `notes`

常見合併原則（避免同義詞爆炸）：`claude-code`/`LLM`/`gemini`/`harness…` → `ai`；`翻車記`/`prod-bug`/`debug` → `postmortem`；`release`/`feature`/`day-summary` → `devlog`；`encryption`/`rls`/`oauth`/`PII` → `security`；`design-tokens`/`ux`/`a11y` 拆到 `design-system` 或 `accessibility`。

- issue-to-post 的標籤取自 issue frontmatter 的 `tags:`，沒寫才用 `tag:` label。發文前先確認這些標籤都在上面清單內。
