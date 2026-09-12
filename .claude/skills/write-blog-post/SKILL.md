---
name: write-blog-post
description: 撰寫、改寫或發佈 Southern Light（southern-light.dev，repo redtear1115.github.io）這個 Astro 部落格的繁體中文技術文章時使用。涵蓋選題判斷、大綱、Ray 慣用的文章骨架、受控標籤清單、繁中排版與台灣用語、去 AI 味檢查表、front matter 與 issue-to-post 發佈流程。Use when the user asks to write, draft, revise, outline, or publish a blog post / 技術文章 / 部落格文章 / 心得筆記 for this site.
---

# 寫一篇 Southern Light 的技術文章

這個 skill 讓你用 Ray 的語氣、在這個 Astro 站台的既有慣例下，寫出**讀起來是人寫的**繁體中文技術文章。

站台事實（別再去猜）：Astro content collection，文章放 `src/content/blog/<slug>.md`，
schema 在 `src/content/config.ts`。程式碼用 Shiki + Nord 主題上色，站內搜尋用 Pagefind，
首頁有 TagCloud，`lang` 預設 `zh-TW`（`src/layouts/BaseLayout.astro`）。
線上網址是 `https://southern-light.dev/blog/<slug>`。

> 這個 repo 是 2026 年從舊的 Jekyll 站台搬過來的。舊站的 `## 前言` / `## 環境` / `## 小結` / `bash>` prompt 前綴
> **在這裡沒有人用**（77 篇裡 0 篇）。看到舊文範例不要跟著抄。

## 動工前：先確認這三件事

1. **這篇是什麼型**（決定標籤與篇幅）：
   - `devlog` — 這週做了什麼、發了什麼版。這個站的主力，55 篇。
   - `postmortem` — 從一個真實的錯誤訊息或翻車現場出發，查到根因。
   - `notes` — 讀了什麼、試了什麼工具的筆記。
   - `retrospective` — 一段時間之後回頭看的判斷，要有立場。
2. **有沒有真實情境**。開頭第一段要寫「我當時遇到什麼」。**沒有真實情境就別編**，
   老實寫成「X 的筆記」，不要假裝有個故事。
3. **選題值不值得寫**。三個問題任一個是 yes 就寫：
   - 一年前的我會需要這篇嗎？上禮拜的我會需要嗎？
   - 網路上現有的資料是不是過時或錯的？
   - 這是我自己實際做出來、驗證過的流程嗎？

   新手心得**特別**值得寫 — 資深的人會跳過「常識」，新手不會，那些細節才是別人卡住的地方。

## 流程

### 1. 讀場地

動筆前先看過 `src/content/blog/` 最近 2–3 篇，抓出當下的篇幅、標題、程式碼呈現與標籤用法。
**既有文章定義語氣，不是這份文件。** 這個 skill 寫的是原則，衝突時以實際文章為準。

### 2. 列大綱，先寫最有把握的段落

3–5 個主段落起手，每段一個動作。**開頭跟結尾最後寫** — 先寫完主體才知道自己到底講了什麼。
寫不下去通常不是文筆問題，是觀念沒清楚或大綱錯了，回去補研究或重排大綱。

### 3. 骨架

```
（開場）      ← 不下標題，直接一到兩句鉤子 + 一句「我這次踩到的是什麼」
## <動作／現象一>   ← 一個 ## 一件事，標題要能單獨看懂
## <動作／現象二>
## 收尾        ← 結論、還沒解的問題、下一步。不要重述上面講過的話
```

- **收尾那節就叫 `## 收尾`。** 這是這個站的固定用字（77 篇裡 65 篇），不要寫成「小結」「結論」「總結」。
- **開場不要題目導覽。** 現有文章的慣用開法是一句共感式的鉤子，接著馬上落地到自己身上：
  「你有沒有過那種，寫了一堆很驕傲的 commit、跑過幾百個測試、覺得自己這版很穩，
  結果交到真實使用者手上三分鐘就被打回原形的經驗？／我有。」
  這個開法好用，但 77 篇裡已經有 28 篇這樣開，**會膩** — 不要每篇都套同一句型，
  也可以直接從錯誤訊息、從一個數字、從一行 code 開場。
- **版本資訊寫進正文，不要開一節 `## 環境`。** 會影響重現的版本（框架、runtime、有問題的那個套件）
  就在相關段落順手交代；沒影響的不用列。沒版本的效能數字等於沒條件的 benchmark。
- 巢狀用 `###`，**不要有 `####`**（現有文章 `##` 157 個、`###` 14 個、`####` 0 個）。
- 段落**深度依照有趣程度分配**，不要每節等長：讓你卡住三小時的那節值得五倍篇幅，
  `npm install` 那節一行就夠。
- 讀者多半是用掃的，他們找的是標題和程式碼區塊。
- 篇幅參考：現有文章平均約 55 行。長文可以，但長是因為那件事真的複雜，不是因為湊。

### 4. 程式碼

- **每個 fenced code block 一定要標語言**（`ts`、`tsx`、`bash`、`yaml`、`json`、`sql`、`css`…）。
  Shiki 用 Nord 主題上色，**沒標語言會被當 `plaintext` 顯示成單色**，跟其他文章的彩色 code 不一致。
  這是 repo 根目錄 `CLAUDE.md` 明文寫的規則，不是建議。
- 指令不加 prompt 前綴（不寫 `$`、不寫 `bash>`），直接寫指令本身。
- **每段程式碼都必須是實際跑過的**。沒跑過就明講「這段沒測過，是示意」。
- 路徑、檔名、設定鍵、錯誤碼用 `` ` `` 包起來。粗體留給真正的強調。
- 佔位符用大寫方括號：`[PATH_TO_PROJECT]`、`YOUR_PASSWORD`。

### 5. 語氣

寫給一個坐在旁邊的同事聽，不是寫手冊。細則見 `references/voice-and-typography.md`，
動筆前掃一次，交稿前再掃一次。

### 6. 交稿前檢查

跑 `references/ai-smell-checklist.md`。**一項一項跑**，合在一起跑會漏。
外加基本功：錯字、贅字、專有名詞大小寫（是 PostgreSQL 不是 Postgresql、是 Astro 不是 astro
除非在 code 裡）、句子通順。發佈後用手機再看一次排版。

## 標籤

**只用受控清單裡的 30 個全小寫 kebab-case 英文標籤，每篇 2–5 個。**
正本在 repo 根目錄的 `CLAUDE.md`，**動筆前去讀那份，不要憑記憶**。
不要發明新標籤、不要用中文。真的需要新類別，先問過，改 `CLAUDE.md` 並同步 `TagCloud.astro` 的字級級距。

常見合併原則（避免同義詞爆炸）：

| 你想寫的 | 實際用 |
|---|---|
| `claude-code` / `LLM` / `gemini` / `harness` | `ai` |
| `analytics` / `posthog` / `logging` | `observability` |
| `drizzle` / `prisma` / `postgres` / `rls`（schema 面） | `database` |
| `encryption` / `oauth` / `PII` / `rls`（權限面） | `security` |
| `翻車記` / `prod-bug` / `debug` | `postmortem` |
| `release` / `feature` / `day-summary` | `devlog` |
| `design-tokens` / `ux` | `design-system` |
| `a11y` | `accessibility` |
| `css` / `safe-area` / `ios` | 用所屬 stack（`tailwind` / `capacitor`）或型別標籤 |

專案標籤（`futari`、`wildcard`、`vanishwhisper`）只要文章在講那個專案就加。
**Oikos 是 futari 的 codebase 名稱**，寫 Oikos 的文章標 `futari`。

## 發佈

正常流程是 **issue-to-post**，不是手動 commit：

1. 開一個 GitHub issue，body 最上面放 frontmatter：

   ```yaml
   ---
   slug: futari-safe-area-guard
   tags: [futari, capacitor, testing, postmortem]
   ---
   ```

   frontmatter 後面接正文（不要再寫一次 `title`，標題就是 issue title）。
2. 貼 `published` label。
3. `.github/workflows/issue-to-post.yml` 會在**同一個 run 內**產生
   `src/content/blog/<slug>.md`、commit 進 master、build、直接用那份 `dist/` 部署到 GitHub Pages，
   最後回一則留言附上網址。

幾個會咬人的細節：

- **`pubDate` 取自 issue 的 `created_at`，不是你寫的日期。** 想控制發佈日期就控制開 issue 的時間。
- `slug` 沒寫的話會從標題推導 —— 中文標題推出來是空字串，會 fallback 成 `post-<issue 編號>`。
  **一定要自己寫 `slug`**，英文小寫連字號。同專案的文章沿用前綴（`futari-`、`wildcard-`…）。
- `tags` 沒寫才會退回去讀 `tag:` 開頭的 label。寫 frontmatter 比較好控。
- workflow 只寫 `title` / `pubDate` / `tags` / `draft`。`description` 與 `image` 是 schema 的選填欄位，
  現有 77 篇都沒用，需要的話得手動補。
- build 失敗就不會發佈，workflow 會在 issue 留言告訴你。

直接 push 到 master 也會部署（`deploy.yml`），但**不要**改回「push 完再 dispatch `deploy.yml`」
那套發文流程 —— 會踩 ref 傳播 race，部署到舊 commit、新文章 404（issue #97）。

手動寫檔時的 front matter 長這樣：

```yaml
---
title: "文章標題"
pubDate: "2026-09-12"
tags: ["futari", "postmortem"]
draft: false
---
```

本地預覽：

```bash
npm run dev
```

## 什麼時候該直接發佈

**還在不滿意的時候就發佈。** 另一個選項是一個裝滿草稿的資料夾。
短文完全可以 — 500 字以下的文章一樣有價值，而且比較容易寫完。
不必是專家，不必原創，不必寫完整，甚至不必全對 — 說明白你不確定的地方，
會有人來告訴你答案。

## 跟 sepia 的關係

如果 sepia plugin 在，第 6 步可以改成呼叫 `sepia:sepia-review`（診斷）或
`sepia:sepia-refactor`（原地修），它的 `tech-articles` domain 比這份清單完整。
這個 skill 的清單是精簡自用版，沒裝 sepia 也能單獨運作。

**永遠不要 sepia 跟這份清單各跑一次然後兩份都改** — 過度修正本身就是一種指紋。

## 這份 skill 的來源

骨架與程式碼慣例抽自 `src/content/blog/` 的既有文章。寫作原則參考：

- [Huli — 寫技術部落格不需要那麼大費周章](https://life.huli.tw/2020/01/28/tech-blog-coderbridge-to-the-rescue-2ba5b52d8bcd/)、[每一篇心得都有價值](https://medium.com/hulis-blog/why-blogging-ab77fd8c6ffa)
- [Hiraku — 寫十年部落格和技術文章的心得](https://hiraku.dev/2021/08/6584/)
- [ALPHA Camp — 技術寫作六步驟](https://tw.alphacamp.co/blog/2018-06-14-18352)
- [iT 邦幫忙 — 鐵人賽寫作攻略](https://ithelp.ithome.com.tw/articles/10368955)
- [Julia Evans — advice for aspiring tech bloggers](https://jvns.ca/blog/2016/05/22/how-do-you-write-blog-posts/)
- [Simon Willison — What to blog about](https://simonwillison.net/2022/Nov/6/what-to-blog-about/)
- sepia plugin 的 `professional-pass` / `tech-articles` / `style-pass`（去 AI 味檢查表的來源）
