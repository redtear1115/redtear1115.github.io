---
title: "兩份文件放錯一個欄位，agent 每次任務多繳 12,437 個 token——而且那筆帳是假的"
pubDate: "2026-09-13"
tags: ["ai", "devlog", "performance", "architecture"]
draft: false
---
我對著 scorecard 上那行「經濟性 ★1」看了大概三十秒，第一個念頭是「這不可能」。

上一輪明明還是 ★3。中間我沒有寫任何新文件，一個字都沒加，程式碼也沒動——我只是在設定檔裡多列了兩個檔名。而那兩個檔名，讓 agent 每次任務的固定成本從 9,037 個 token 跳到 21,474。

多出來的 12,437 個 token，一個都沒有真的被載入過。

## 先講 docgrad 在幹嘛

[docgrad](https://github.com/redtear1115/docgrad) 是我寫的一個 Claude Code skill，一句話講完：**它把一個 repo 的文件當成「AI agent 的 context 來源」來打分數，然後逐輪把它修到達標。**

跟一般的文件 linter 不一樣的地方在動機。lychee 幫你抓死鏈、markdownlint 幫你抓格式、Vale 幫你抓文風——這些都是寫給人看的文件在意的事。但你的 `CLAUDE.md` 現在主要的讀者不是人，是 agent，而且它是**每一次任務**都會被整份塞進 context 的。文件寫得好不好是一回事，agent 為了讀它付了多少錢是另一回事，而後者幾乎沒有工具在管。

所以 docgrad 打六個維度，每維 ★1–★5：完整性、正確性、新鮮度、連結度、一致性，還有第六維——經濟性。前五維是文件品質，第六維是帳單。

底層是五支零相依的 Node 腳本（`inventory` / `links` / `freshness` / `coverage` / `retrieval`）跑機械訊號，LLM 只負責那些真的需要判斷的維度（正確性、一致性、完整性），而且必須對著 `reference/rubric.md` 裡凍結的錨點文字打分，不准自己發明標準。這樣不同輪的分數才能比。

## 經濟性是刻意用來跟完整性作對的

`inventory.mjs` 算兩個數：**固定成本**（`entry_files` 的 token 總量，也就是 agent 每次任務都要先吞下去的那一份）和**污染面**（語料裡對 agent 沒用的檔案佔比）。星等錨點是硬的：

- 固定成本超過 20,000 → ★1
- 10,001 到 20,000 → ★2
- 5,001 到 10,000 → ★3
- 5,000 以下且污染面低於 10% → ★4
- 3,000 以下、污染面低於 10%，而且有 CI gate 擋著 → ★5

這一維存在的理由，是因為其他五維全部都往同一個方向拉：多寫一點、補齊一點、每個模組都有文件。聽起來很對吧？我當時也這麼覺得——直到你發現「文件更完整」跟「agent 更貴」是同一件事的兩種說法。經濟性就是那個煞車，它在 tie-break 順序裡故意排最後一個，所以打平時內容維度先動，loop 不會在「多寫一點」跟「刪掉一點」之間來回震盪。

順帶一提，docgrad 自己也要付這筆錢。`claude plugin details docgrad` 印出來是常駐約 227 tokens、被叫起來那一次約 1.8k——一個在算別人 context 成本的工具，自己的帳單應該要攤開來讓人查。

## 誤診：我以為那兩份檔本來就該放 entry_files

回到開頭那個 ★1。

起因很單純：oikos（futari 的 codebase）的 repo root 有兩份文件，`PRODUCT.md` 4,378 tokens、`DESIGN.md` 8,059 tokens，裡面有 15 條可驗證的事實陳述，但它們一直沒有被納入評分——因為它們不在 `docs/` 底下，而 `.docgrad.yml` 的語料收集只吃兩種東西：目錄（`docs_dirs`）跟單檔入口（`entry_files` / `index_file`）。

我先試了最直覺的：把單檔塞進 `docs_dirs`。當場炸掉——`ENOTDIR: not a directory, scandir '…/PRODUCT.md'`。寫成 `PRODUCT.md/` 也沒用，`path.join` 會把尾斜線正規化掉。

好，那放 `entry_files` 總行了吧？它收得到檔，分數也跑出來了。我那時候覺得這問題解得挺乾淨的（你看出問題了吧）。

## 真相：判準是「什麼時候載入」，不是「有多重要」

`inventory.mjs › fileType()` 看到 `entry_files` 裡的檔案，就會把它標成 `entry`，直接計進固定成本。9,037 + 4,378 + 8,059 = 21,474，跨過 20,000 那條線，★3 當場變 ★1。

但真正讓我坐不住的不是掉兩顆星，是**那筆成本根本是假的**。這兩份在 oikos 是條件式載入——入口檔寫的是「UI／視覺工作開始前」才去讀，一般任務根本不會碰到它們。而 `reference/init.md` 對 `entry_files` 的判準寫得很清楚：agent 每次任務都會自動載入的才算。

更難看的是，`reference/audit.md` 的經濟性那節還明訂：稽核者查到 `entry_cost.files` 跟現實不符要記失分點。所以這條路的代價是——拿一個灌水的固定成本，換一個永久扣分。

我還試過第三條路，`docs_dirs: [docs/, ./]`。這個更糟：`collectFiles` 對 `docs_dirs` 不去重（去重只在單檔那一圈），整棵 `docs/` 會被算兩次；repo root 底下還躺著 `.claude/worktrees/` 這種會浮動的目錄，分數會變成機器相依、換台電腦就不一樣。

三條路都走不通，這時候我才看懂：schema 缺的不是一個 workaround，是一個欄位。`entry_files` 跟一般文件的差別從來不是「重不重要」，是「什麼時候被載入」。

## v1.4.0：多了一個 docs_files

所以 v1.4.0 加了 `docs_files`，把 `docs_dirs` 之外的單一 markdown 檔以**一般文件**的身分收進語料：

```yaml
docs_files:
  - PRODUCT.md
  - DESIGN.md
```

規則一句話：always-loaded 的放 `entry_files`，計固定成本；條件式載入的放 `docs_files`，不計。兩邊都收得到檔，**選錯不會報錯，只會讓經濟性失真**——往上灌水，或往下低報，方向剛好相反。所以這個判準跟選錯的代價都被寫進 `init` 問卷裡了，不要靠使用者自己猜。

oikos 實跑的結果：`files_total` 46 → 48、`claims_total` 317 → 332、語料總量 134,253 → 146,690 tokens，而 `entry_cost.tokens_est` 維持 9,037。多收了 12,437 tokens 的文件進來評分，agent 每次任務要付的錢一毛沒變——這正是這個欄位的重點。

順手也把單檔入口指到目錄時的錯誤訊息修了——原本要拖到讀檔才爆一句看不出哪個欄位寫錯的 `EISDIR`，現在當場告訴你該改放 `docs_dirs`。測試從 66 條長到 71 條。

有一個要提醒的：**只影響實際設了 `docs_files` 的 repo**。新收進來的檔案會同時動到新鮮度的分母、孤兒與可達率的母體，那個 repo 跨 1.4.0 的分數不能直接比，基準要從導入這個欄位的那一輪重算。沒設這個欄位的 repo 輸出完全不變，不必重跑 `init`。

## 你可以怎麼試

安裝一次，全域可用：

```bash
/plugin marketplace add redtear1115/docgrad
/plugin install docgrad@docgrad
```

重開之後在你想評的 repo 裡跑 `/docgrad init`（掃描＋問卷，寫出 `.docgrad.yml`），然後 `/docgrad audit`——純報告，不動任何檔案。

如果你只想知道「我的 agent 每次任務到底先吞了多少 token」，其實不用跑完整輪：

```bash
/docgrad audit --dim economy
```

它會告訴你哪幾份檔被算進固定成本、加起來幾個 token、落在哪一個星等（`entry_cost` 還會把 symlink 別名折疊掉，`CLAUDE.md -> AGENTS.md` 這種只算一份）。我建議每個有 `CLAUDE.md` 或 `AGENTS.md` 的 repo 都跑一次這行，因為這個數字很容易失控——入口檔是那種「每次都只加三行」然後某天變成 15,000 tokens 的東西，而且沒有任何工具會提醒你。

至於「少載入一點會不會比較快」——固定成本降下來，每次任務前置要讀的東西確實少了，體感上第一個動作來得比較早。但我沒有做過嚴謹的延遲量測，這句只能當體感，不要當 benchmark 看。真正確定的只有 token 數，那個是機械量出來的。

## 收尾

這個 bug 的形狀我還蠻喜歡的：它不是程式寫錯，是 schema 少了一個概念。`entry_files` 跟 `docs_files` 在程式碼裡做的事幾乎一模一樣——都是讀一個檔、丟進語料——差別只在那個 `type` 標成什麼。但少了這個區分，使用者就只能在「檔案收不進來」跟「帳單灌水」之間二選一，而且兩個選項都不會報錯。

最安靜的設計缺陷就是這種：沒有 exception、沒有紅字，只有一個悄悄變得不對的數字。

先不說了，我得去把自己另外幾個 repo 的 `entry_files` 也掃一遍，我有預感其中至少一份早就過 10,000 了。

*這版發於 2026 年 9 月 13 日，文章整理於同日上午。*

---

<!-- source: docgrad | last_sha: 48f3d1a -->
<!-- commits:
48f3d1a (2026-09-13) Merge pull request #34 from redtear1115/feat/docs-files
da16592 (2026-09-13) chore(release): v1.4.0
961f335 (2026-09-13) feat: 新增 .docgrad.yml 欄位 docs_files（docs_dirs 之外的單檔當一般文件收）
-->

