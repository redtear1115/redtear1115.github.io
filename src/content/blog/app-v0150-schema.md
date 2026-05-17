---
title: "「如果有一天你們分開了，這個 app 會怎樣？」——v0.15.0 把這題寫進 schema"
pubDate: "2026-05-11"
tags: ["futari", "devlog", "release", "feature"]
draft: false
---
老實說我以前刻意不去想這題。Futari 是給兩個人用的家計簿——伴侶、夫妻——可是**伴侶會分開**啊。我之前的設計裡，「離開群組」這個 action **根本不存在**：你不能離開、不能把對方踢掉、不能換 partner。要嘛繼續用、要嘛兩個人各自把帳號棄掉。**這對「兩個人的信任」這個 pitch 來說，是個很尷尬的盲點**——你說你們是兩個人的家計簿，結果只支援「永遠在一起」這一種狀態？

更荒謬的是，我自己的 onboarding 雙向確認儀式才剛 ship 沒幾天（v0.13.0 那個「○○ 已經承諾了這些 → 我也是」）——承諾儀式做了，分手協議沒做。**婚禮辦了沒寫遺囑**。

所以這趟把 `#79 leave group` 拆成四個 PR、一口氣 ship 完，同時順手把 `#49 pending 紀錄`、`#50 結構化篩選器`、保險強化跟分紅生存金都收進來。一個 27 commit 的星期一。

## PR 1/4：swap + leave 的 server actions

最底層是兩個 server action：`confirmSwap` 跟 `leaveGroup`——配上一張 migration `0028`，幫 `OikosGroups` 加了 `pending_swap_proposed_by` / `pending_swap_expires_at` / `current_epoch_started_at`，外加兩個 CHECK constraint（proposer 必須是 member、pending 欄位要嘛全 NULL 要嘛全有值）。**CHECK constraint 是這種 multi-column invariant 最後一道防線**——business logic 在 server action 寫得再嚴，總有一天會有人從別條路徑（pgAdmin、未來的 batch job、自己寫 SQL 修 bug）動到這欄。DB 自己會擋。

`confirmSwap` 是 atomic transaction：原子地 `swap member_a / member_b`、把所有 weighted transaction 跟 recurring rule 的 `split_ratio_a` 從 `x` 翻成 `100 - x`、`recalcGroupBalance`（這欄是 signed，從 `member_a` 視角，所以人換了正負號就要翻）。**這條 swap 不會切割 epoch**——因為 swap 只是「重新貼標籤」，不是新章節。

`leaveGroup` 才是真正的拆分手術。`member_b` 離開時 balance 必須是 0（**有未結算的錢不准走**——這條規則寫在 server action 最前面），然後把整個 ledger 按 ownership 切兩半：

- **Cash / income / settlement / rules / pending / monthly review messages** → partition by owner
- **Assets**：`house` / `car` / `insurance` 按 owner 切；`child` / `pet` / `plant` 留在原 group（你不會「拿走小孩」）
- **Invoice credentials** → 跟著走
- 留下來那邊**指向被拿走 assets 的 `asset_id` 全 clear 成 NULL**
- 兩邊都 bump `current_epoch_started_at`
- pending invites 一律 revoke

這條 transaction 大概是我寫過最緊張的 server action——**一個 commit 解體一段關係**。寫完跑了 7 個整合測試（雙向 leave、leave 時還有未結 balance、leave 後 invite 別人、leave 後又 leave……）才敢 merge。

## PR 2/4：danger zone UI 跟 4-card flow

Settings 加了一塊 **danger zone**（紅底、跟其他 setting 視覺隔開——這是 GitHub 那個 pattern 抄來的，但**用在感情關係上有種奇怪的合適**）。點「離開帳本」會進 4-card flow：

1. **這會發生什麼**（你的資料怎麼分、什麼留下、什麼跟你走）
2. **餘額確認**（如果 balance != 0，這頁直接擋）
3. **打字確認**（要打對方的 display name 才能繼續——**比 checkbox 嚴**，因為這動作不可逆）
4. **最後一頁**（一個按鈕、warm 文案、不要把它寫得像辦離婚）

`swap` 邀請也有自己的 banner——「○○ 想跟你交換身份」+ 接受 / 拒絕 / 7 天自動過期。這個 7 天是寫在 `pending_swap_expires_at` 欄、靠 pg_cron 跑 cleanup，**而不是靠 client 算「現在時間 vs 過期時間」**。client 時鐘不可信，這條規則做過幾次了。

## PR 3/4：epoch slicing——「我們的關係章節」

這版最 fundamental 的設計決策——一個 ledger 可能會活過好幾段關係：`a+b → b 離開 → a solo → a 邀請 c → a+c`。新增 `GroupEpochs` 表，每一段都記成一個 row（`started_at` / `ended_at` / `member_a_id` / `member_b_id`）。

關鍵 invariant：**每個 group 同時只能有一個 open epoch**——用 partial unique index `WHERE ended_at IS NULL` 守。`acceptInvite` 跟 `leaveGroup` 兩個 server action 都要 hook 進去（close 舊的、open 新的）。`confirmSwap` 不動這張表——swap 只是 relabel，不是新章節。

然後是 `resolveViewerEpochWindow(groupId)`——這個 helper 是所有「viewer-facing 聚合」的入口：dashboard balance、records feed、stats、月度回顧通通要先過它，預設只看當前 epoch 的資料。為什麼？因為**前任在帳本裡的支出，不應該預設 surface 給現任看**——這不只是 UX，這是基本的關係界線。

要看過去？有一個 `/past-times` 頁面（這個命名我糾結蠻久——`/history` 太 cold、`/archive` 太檔案夾——`/past-times` 帶點懷舊但不沉重），列出歷史 epochs、點進去 read-only 看那段時間的資料。

## PR 4/4：兩張過渡卡

純 UI 收尾、沒新 schema：

- **PartnerLeftCard**（留下的人看到）—— SSR 偵測「currently solo + 最近 closed epoch 有 memberB」就 surface，「⟂ ○○ 已離開」+ 一段 brand-tone 文案。dismiss 寫 `localStorage` key 帶 epoch_id——下次再有人離開（新 epoch），卡片會重新跳。
- **WelcomeSoloCard**（離開的人看到）—— pure client，靠 `LeaveGroupFlow` 在 server action 回傳新 group id 後寫的 `futari_just_left_${groupId}` flag 觸發。dismiss 時同時清 marker 跟寫 `*_dismissed_*`，避免將來 flag reset 重跳。

兩張卡都用 realtime 既有 channel 自動 refresh，**不寫新的 subscription**——能不開新 connection 就不開，PWA 行動裝置的 socket 維護成本不便宜。

## 順手清的：pending / settled、結構化篩選器、保險強化

**`#49 pending / settled` 紀錄狀態**——新增 `record_status` enum + `CashTransactions.status` 欄、預設 `settled`、`pending` 不算進 `GroupBalance`。場景：信用卡刷卡待結帳、預授權、IOU。狀態轉換沿用既有 edit path（**soft-delete + insert 而非 UPDATE**——這是 Futari 從 day 1 的 immutable row 哲學，每次「編輯」都是新 row、舊 row 標 deleted）。realtime publication 因為是 `FOR ALL COLUMNS` 自動吃到新欄位，**這條免費的**。

**`#50 結構化篩選器`**——`/records` 加上 date range × 愛物 × 誰付的 × 分攤 × 分類，state 全部 URL-encode。對方手機點同一條 link 看到一樣的 filter，**「我們一起在看同一份東西」這個 mental model 比技術上的 query string 更重要**。直接回應 CWMoney 那個丟搜尋功能的用戶反饋。後來下午又補了一輪：收入分類 multi-select + cross-kind cut rules（從支出切到收入時哪些 filter 要 reset）、header reorganize（篩選 next to tabs、`⚙ 定期` popover）、stats card 也跟著 filter 走。

**保險強化（#127）+ 分紅生存金（#132）**——`AssetCard` 對保險類型有 type-specific 行為（壽險 / 醫療 / 儲蓄分流顯示），分紅與生存金可以記為「已拿回」並從未來投入扣除——**儲蓄險的真實 IRR 才看得出來**。配 contract progress bar 視覺化（後來踩到一個 hydration mismatch 用 `suppressHydrationWarning` + 確保 SSR / CSR 都用相同 Asia/Taipei 時區算寬度才修掉）。

**`#126 PWA 離線回前景 auto refresh`**——使用者把 app 切到背景一段時間再回來，原本要手動下拉 refresh。改成監聽 `online` + `visibilitychange` event、auto `router.refresh()`。**這個 bug 看起來小但其實是 PWA 體感差距的關鍵**——「為什麼資料看起來舊舊的」就是 churn 起點。

## 收尾

27 個 commit、一個關係章節系統、一份分手協議、一個我幾天前還說「不打算做」的功能。寫完 `leaveGroup` 的 atomic transaction 之後我有個奇怪的感觸——**這是我唯一一個寫的時候希望它永遠不會被 user 觸發的 server action**。但它必須存在。一個聲稱「兩個人的信任」的產品，**不該假設這份信任永遠不變**——能離開、能離開乾淨、能離開之後還想得起這段時光，這才是完整的信任。

至於那張 `GroupEpochs` 表，我自己默默叫它「**關係的 git log**」。每個 epoch 是一個 commit，每段關係是一段歷史，never overwritten——很適合一個用 immutable row 哲學寫的 ledger。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。*
