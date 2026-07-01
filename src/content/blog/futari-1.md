---
title: "Futari 開發日誌 1：從零開始，到定期收入落地"
pubDate: "2026-05-14"
tags: ["futari", "indie-dev", "devlog"]
draft: false
---
### 2026-05-02 — 2026-05-07 · v0.0.0 → v0.8.0

---

五月二號，我坐下來開始動手。

其實這個想法在腦子裡轉了很久了。我跟太太一直找不到一個真的適合我們兩個人用的記帳工具——不是功能不夠，而是那些 app 的設計假設都不太對。Honeydue 看起來最接近，但介面老了，帳戶能見度分級的設計讓我很不舒服，好像預設兩個人之間有什麼需要防備的。MOZE、CWMoney 做得很好，但那是一個人的記帳工具，硬塞進兩個人只會彆扭。

所以我決定自己做。叫 Futari，日文「兩個人」的意思。codebase 叫 Oikos，希臘文「家」。

第一天我做了很多很多事，但其實那一天嚴格說起來算 v0.0.0，只是 scaffold——Next.js、Supabase、Drizzle、Vitest 全部架好，Google OAuth 接上，middleware 保護 dashboard 路由，PWA manifest 寫好，schema 定義出來，balance 計算的核心數學也寫了。我把那天所有的 commit 都往 main 推，感覺有點亂，但我當時只想先讓整個骨架站起來。

重要的設計決定有幾個在那天就定下來了：金額只存台幣整數，不搞小數；balance 計算每次寫入後全量重算，cache 在 `GroupBalance`，不做增量；「編輯」等於 soft delete 加上 insert，DB 層不提供 UPDATE——這個決定後來省掉我很多麻煩，因為所有的 audit trail 都自然保留了下來。

---

然後是連續兩天的高密度開發，把 Phase 1 的東西一層一層往上疊。

登入流程、setup 流程、邀請對方的 token 機制，這些都要做對，因為這是兩個人才能用的工具。solo 模式也要支援——在對方還沒加入之前，你一個人也要能記帳。這個設計花了一些時間想清楚：`member_b` nullable 就代表 solo 模式，`isSolo` 這個 flag 從 member context 推導出來，整個 UI 的分攤邏輯、payer toggle、篩選器都根據這個 flag 分叉。

Records 頁、dashboard 頁、filter sheet、settlement 流程，都在 5/3 那幾天完成。settlement 的符號慣例踩了一個坑：`GroupBalance.balance` 是「member_a 欠 member_b 的金額」，正數 A 欠 B，負數 B 欠 A，站在不同人的角度看數字的方向不一樣，這個 viewer-flipped perspective 的計算要寫對才不會顯示錯誤。realtime 也在那時候接上了——Supabase postgres_changes subscribe，TransactionFeed 在 INSERT 時 prepend highlight，soft-delete 時 fade out，balance hero cross-fade 在 partner mutation 時觸發。

看著 realtime 第一次在兩個瀏覽器分頁之間同步的時候，我覺得這個東西真的活了。

---

5/4，設計師交付了素材，我把 icon、favicon、OG image 全部換上去。這算是 v0.1.0——第一個「有樣子」的版本。

然後馬上開始做 v0.2.0 的東西：Phase 2 第一個 slice，車輛。

我一開始沒預期「愛物」這個概念會變得這麼複雜。原本想的是就做一個資產清單，讓帳目可以跟資產關聯。但當我開始想「兩個人養的貓怎麼記？一棵植物呢？孩子的奶粉錢要怎麼跟這個孩子連在一起？」的時候，我意識到這個東西的語意跟一般的「資產管理」完全不同。

所以我把它叫做愛物（aibutsu）。

愛物有一個 base table `Assets`，`type` enum 分 `car` / `house` / `child` / `pet` / `plant` / `insurance`，各自有 1:1 的子表存細節。車有 `CarDetails`，裡面放品牌、車色、年份、初始里程；孩子有 `ChildDetails`，有些欄位存 PII，後來 v0.10.0 做了 AES-256-GCM 加密；保險有 `InsuranceDetails`，可以 FK 回車輛或孩子當被保標的。

5/5 到 5/6 是連續兩天在疊愛物的功能。加油紀錄要雙寫——`FuelLogs` 跟 `CashTransactions` 透過 `fuel_log_id` 關聯，刪掉一筆加油紀錄要原子地刪掉兩邊。車主切換影響預設 paidBy 跟 splitType。植物要記澆水頻率，寵物的性別有三種（加了「不明」）。每一個愛物類型都有自己的 detail page，header 的顏色跟愛物的色票對應，list 頁用左側 accent stripe 加色點識別。

愛物清單的分群顯示也是在這時候定下來的：財產（車、房）、生命體（孩子、寵物、植物）、保障（保險）。不只是分類，也是一種價值觀的表達——這些東西對我們而言的意義是不一樣的。

v0.3.0 在 5/6 發布，引入了完整的愛物概念。

---

然後進帳功能接著來。這個在設計上跟支出是不同的東西——進帳不影響 balance，它是「某個人拿到了一筆錢」，跟「我們共同花了多少」是分開的。IncomeTransactions 有自己的 schema、自己的分類色票（薄荷綠系），dashboard 有 mode toggle 切換支出／進帳視角，records 頁有 tab bar 切換全部／支出／進帳。

月度統計也在這時候加上去：月 section header 顯示「進帳 − 支出」的月淨額。

v0.4.0 加油紀錄，v0.5.0 孩子寵物植物，v0.6.0 房屋保險，v0.7.0 進帳——這幾個版本跑得很快，因為骨架都已經在了，每次加新的愛物類型或功能就是把 pattern 複製一遍，調整細節。

---

5/7 是個大日子。v0.8.0，定期收入。

定期收入（RecurringIncomeRules）的設計是：你設一條規則，說「每個月 5 號我會收到薪水 X 元」，然後 pg_cron 每天跑，把到期的規則轉成 `PendingIncomeOccurrences`。你看到 pending stack 之後，可以直接確認（落地成真實 income transaction），也可以「改一下」（調整金額或日期再確認），或是跳過這次。

這個流程設計起來比我想的複雜很多。`computeNextOccurrence` 要處理月份邊界（31 號的規則在 2 月要 snap 到哪？），`snapToFuture` 要確保 resume 一條暫停的規則時下次觸發日不會在過去。pending 的 realtime 事件要拆成兩種——新增跟更新——不然 IncomeSheet 在 race condition 下會有問題。

DayPicker 是個小元件，讓你選每個月第幾號觸發，我做了一個 3×10+2 的視覺格子，觸控寬度要夠，每個格子有 aria-pressed 跟 aria-label。

v0.8.0 在 5/7 落地的時候，我坐在那邊看著第一條定期收入規則跑起來，pending card 出現在 dashboard 上，我點確認，它消失、income transaction 出現、月淨額更新——感覺很對。

這個工具的輪廓，在這一週裡逐漸清楚了。
