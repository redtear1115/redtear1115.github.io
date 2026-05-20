---
title: "Agent 看不懂的 codebase，就是壞掉的 codebase——agentic 時代的易讀性筆記"
pubDate: "2026-05-18"
tags: ["claude-code", "architecture", "refactor", "murmur"]
draft: false
---
前陣子我讓 Claude 在 Futari 的 codebase 裡加一個小功能——「在 trip detail 頁加一個 end trip 按鈕」。結果它跑去翻了 `TripDetailClient.tsx`、然後翻了 `EndTripSheet`、然後翻了 `useSheetMutation`、然後翻了 `assertMember`、然後翻了 `lib/balance.ts`——花了我大概 40k tokens 才開始動工。我看著 token meter 跳，心裡只有一個念頭：**這個 codebase 不是寫給 agent 看的，是寫給「有兩年 onboarding 時間的工程師」看的。**

然後我突然意識到一件事——這就是新時代的 WTF 指數。

## Clean Code 的 WTF 指數還活著，只是讀者換了

Robert Martin 那句經典——「衡量 code 品質的唯一標準是 code review 時每分鐘喊出 WTF 的次數」——以前是給人類用的。一段命名混亂、邏輯跳躍、沒 comment、隱式依賴一堆的 code，人看了會皺眉。我們花了二十年想各種辦法降這個指數：clean code、code review、style guide、linter、formatter、static analyzer。

現在多了一個讀者：**agent**。

而 agent 的「WTF 反應」不是皺眉——是**多翻 5 個檔案、多燒 30k tokens、然後給你一個猜錯依賴的 patch**。WTF 指數的單位從「次數」變成「美金」——這比皺眉嚴重多了，至少皺眉不會出現在你信用卡帳單上。

## 順手複習一下 Google Code Review 五原則

Google 那本 [[Code Review Developer Guide](https://google.github.io/eng-practices/review/)](https://google.github.io/eng-practices/review/) 我覺得在 agentic 時代反而更重要——核心就五條：

**基於事實與數據**——「我覺得這樣比較好」不是 review comment，是抒情。改用「benchmark 顯示 X」「style guide 第幾條」「這會違反 invariant Y」。

**嚴守風格指南**——風格爭論用 style guide 結案，不要在 PR 裡吵 tab 還 space。

**優雅的溝通態度**——要求修改要說「為什麼」；對方的設計如果只是「不是你會寫的方式」但沒實質問題，**就放過**。

**持續改進而非完美**——review 的標準是「這個 patch 讓系統變好了嗎」，不是「這個 patch 完美嗎」。完美主義會卡死進度。

**權責與可讀性**——Google 內部有 Readability Certification 機制，核心模組的 owner 要有那個語言的「可讀性認證」才能 approve。為的就是 codebase 不會因為每個人各寫各的而崩壞。

這五條在人類團隊已經很重要——在你跟 agent 共事的時候，**更重要**。因為 agent 不會跟你吵 tab/space，但它會默默把你 codebase 裡兩種風格全學起來、然後產出第三種混合版。

## 大 codebase 的真實腐壞速度

我做 Futari 之前在公司寫過上萬行的後端系統——複雜度增長是**等比級數**，不是線性。第一年加一個功能 2 天，第三年加同樣大小的功能 2 週，第五年沒人敢動。這不是工程師變懶——是因為**任何兩個模組之間都可能有隱式依賴**，n 個模組就有 n² 種交互。

人類面對這個的辦法是——資深工程師花時間建立心智模型，遇事問他。agent 沒有那個心智模型——它每次都是冷啟動，每次都要把那 n² 重新讀一遍。

所以新問題來了：**怎麼讓 agent 不要每次都把整個 codebase 重讀一遍？**

## 七條我自己在跑的原則

### 1. Token 是有價格的，codebase 越小越好

以前我們說「code is liability, not asset」，那時候講的是維護成本。現在這句話有了字面意義——**每行 code 都會被讀進 context window，每個 token 都算錢**。

Refactor #512 我們做了一輪——6 個 asset sheet 共用的 `useAssetSheetCommon`、`useSheetMutation`、`DateField` 統一、`assertMember` 抽出來——少掉差不多 1000 行重複。**這不只是工程美學，是省錢**。下次 agent 改 sheet，少讀 1000 行就是少燒幾 k tokens。

### 2. 從「不重複造輪子」到「不引用不需要的部分」

DRY 原則大家都會背。但 agentic 時代有個新煩惱——**有時候你引用一個 utility，agent 為了搞懂它會把整個 module 讀一遍**。

所以現在我寫 helper 的時候會想——這個 function 是不是 self-contained？dependency 鏈拉多長？一個 5 行的 utility 引到 3 層深的 chain，agent 看它要燒 5k tokens——還不如 inline。

「不引用不需要的部分」聽起來反 OOP——其實是反「為了結構而結構」。

### 3. CLAUDE.md / README.md / skills 是 codebase 的索引

Futari 的 `CLAUDE.md` 我把它當成「給 agent 的 30 秒 onboarding」來寫——架構速查、domain model、entity 關係、worktree 工作流、品牌文案準則、部署流程。**任何 agent 進來，先讀這份**。

意義是——agent 不用為了搞懂「balance 怎麼算」去翻 `lib/balance.ts` + `lib/db/queries/balance.ts` + `schema.ts` 三個檔案。`CLAUDE.md` 一段話講完核心邏輯，agent 只在真的要動 balance 邏輯時才會去翻細節。

skills 也一樣——`git-develop:release` / `git-develop:deploy` / `doc-keeper` 這幾個是把「重複的高階流程」打包成 agent 可以直接呼叫的模組。**重複的事不要每次都讓 agent 重學一遍**。

### 4. Repo 裡放 product / design / UX 文件

這個我以前不太這樣做——product spec 在 Notion、design 在 Figma、UX guideline 在 Google Doc。結果 agent 寫 UI 寫得很 generic、寫 copy 違反品牌準則（friend test 那天我自己 hero copy 違規的事下次再講）。

現在 `docs/superpowers/specs/` 裡放 feature spec、`CLAUDE.md` 裡放品牌文案準則、`.claude/` 裡放 design artifacts。**讓 agent 跟設計師站在同一份文件前面**——出來的東西才不會精神分裂。

### 5. 隨時更新 document（不是「事後補」）

doc 最大的問題不是沒寫——是**寫完就過期**。spec 裡寫的還是上一版 schema、CLAUDE.md 還在講已經刪掉的 feature——這比沒有 doc 更糟，因為 agent 會**相信錯的東西**然後 confidently 寫錯。

我現在的 rule 是：**改 schema 就一起改 CLAUDE.md 的 domain model 段、改 server action 就一起改 spec、release 前跑 doc-keeper 掃一遍**。doc 不更新的 PR 不能 merge。

這聽起來像在加負擔，實際上是把負擔挪到對的位置——**寫 code 的當下你最懂，事後補要重新理解一次，成本更高**。

### 6. TDD 守則：測試是 agent 的安全網

TDD 在人類時代有點宗教戰爭——有人覺得 essential、有人覺得 overkill。agentic 時代我覺得是**剛性需求**。

理由：agent 寫完 code 你要驗證它對不對。靠肉眼看 diff？看不出來 edge case。靠手動測？慢。**靠測試**——agent 寫完跑一遍 test、紅了自己改、綠了才丟給你看。

Futari 的測試覆蓋還不夠（誠實說），但 balance 計算、validators、server actions 這些核心都有測。每次 agent 動到這幾塊，test 是第一道防線——比 code review 更早抓到問題。

### 7. 定時重構——或更精確地說，隨時重構

技術債的可怕之處不是有債，是**債滾利**。一個 anti-pattern 寫進去，下次有人 copy 那段、再下次又 copy——三個月後你的 codebase 有 20 個地方在重複同樣的爛 pattern。

agentic 時代這個問題會放大——**agent 學的是 codebase 的現狀**。你 codebase 裡有壞 pattern，它就會學會這個壞 pattern、然後把它複製到第 21 個地方。

所以「定時」重構不夠——要**隨時**。看到一個小重複就抽出來、看到一個奇怪命名就改掉、看到一個 dead code 就刪。Refactor #512 那種「一次清 1000 行」的大重構很爽——但**真正在維持 codebase 健康的是 100 次「順手清 10 行」**。

副作用是——codebase 變小、agent 讀得快、token 燒得少。看吧——又繞回第一條了。

## 一個我踩過的小坑

Futari 早期我 CLAUDE.md 寫得超詳細——把 schema 每個欄位都列出來、每個 server action 簽名都貼上。聽起來很 thorough 對吧？結果 agent 進來——`CLAUDE.md` 本身就 3000 行，光讀它就燒掉一半 context window，**還沒開始工作**。

後來砍掉一半——只留「架構速查 + entity 是什麼 + 怎麼接」，細節讓 agent 自己去翻 `schema.ts`。token 用量直接砍半，response 品質還變好——因為 agent 把省下的 context 拿去讀真正相關的 code。

**doc 的目標是「快速 onboarding」，不是「完整 reference」**——reference 在 code 裡。doc 是地圖，不是地形。

## 收尾

agentic 時代寫 code 我最大的體悟是——你寫的不只是給人類同事看，也不只是給未來的自己看，**現在還要給一個按 token 計費的同事看**。WTF 指數從「次數」變成「美金」，readability 從「軟需求」變成「直接影響你信用卡帳單」。

當然，我寫這篇文章的時候 agent 在背景跑了 5 個 task——半小時燒了 4 美金。看來我的 CLAUDE.md 還有得改。

這段思考整理於 2026 年 5 月。
