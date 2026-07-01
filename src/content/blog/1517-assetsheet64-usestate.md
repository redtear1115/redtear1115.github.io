---
title: "一個 1517 行的 AssetSheet、64 個 useState、跟一條走丟的章節線"
pubDate: "2026-05-12"
tags: ["futari", "react", "refactoring", "notes"]
draft: false
---
說真的——昨天才剛 ship `GroupEpochs`、把「關係章節」這個概念寫進 schema，結果**今天打開自己的 `/past-times` 頁面，看到的不是完整的人生**。`#138` 上線之後，從 X 邀請別人組 group 的角度看歷史是 ok 的：X 的過去章節、X 的現在章節，都在。**但 Y 的角度——那個被留下後又拿到新 solo group 的人——看到的是空白頁**。

為什麼？因為 `listEpochs(groupId)` 只看一個 group 的 epoch list。Y 走的時候我幫他開了新 solo group，他在「舊 group 跟 X 的那段日子」的 epoch row 還躺在原 group 裡——他**已經不是那個 group 的成員了**，自己的 `/past-times` 完全看不到。**一個剛上線一天的「跨段關係 ledger」設計，自己漏掉了「跨 group」這條軸**。荒謬。

然後翻 `components/AssetSheet.tsx` 想改個保險欄位、發現這個檔**1517 行、64 個 `useState` call、union prop interface 60 個欄位**——每加一個愛物 type 就要動全檔，**每次改一個 type 都要怕碰到另外 5 個**。今天就一口氣把這兩件事都修了，順便發 v0.15.1。55 個 commit、一天結束。

## past-times 跨 group：寫一條 `listEpochsForViewer`

新增 `listEpochsForViewer(viewerId)`——cross-group query、按 viewer membership filter，把 `groupId` + partner names inline 進 row。`/past-times` 從原本的 `listEpochs(groupId)` 切到這條，**現在 Y 終於看得到「我跟 X 那段」、跟「我現在 solo」兩個 epoch 並列**。

但這帶出第二個更難的問題：**如果 viewer pin 了某個 past epoch、那個 epoch 在另一個 group 上，dashboard / records / stats 要 render 哪個 group 的資料**？

答案是 **pin 跟著走**——新增 `resolveViewerEpochContext(userId)`，一次 resolve `(group, epochWindow)`，pin-aware across groups。當 cookie 裡的 past-epoch pin 指向 viewer 曾經是成員的 chapter（即使是另一個 OikosGroups row），整個 dashboard 都會 follow 過去。pin stale、被竄改、或指向別人的 chapter——**fall through safely**，不會炸頁。

migration 那一段比較痛——`dashboard layout / dashboard / records page / MonthlyStatsSection / assets list / asset detail / review/[month]` 通通要切到新的 helper，因為它們都會「拿 epoch window 去 filter aggregate」。**任何漏掉一個就會出現「dashboard 顯示 X 的章節、但 records 還在 Y 的章節」的混亂**——viewer 看到的應該是 single coherent timeline，不能 split。

## AssetSheet 重構：1517 → 6 個 SheetBody

`AssetSheet/index.tsx` 變成 **≤ 60 行的 router**——只管 `selectedType`、把 props 路由到對應的 `*SheetBody`。然後 `CarSheetBody` / `ChildSheetBody` / `PetSheetBody` / `PlantSheetBody` / `HouseSheetBody` / `InsuranceSheetBody` 各自獨立——own 自己的 form state、自己的 validation、自己的 UI。**每個 body 不認識其他 type**——這就是重點。

這條 refactor 在 1517 行的時候我看過一次就放棄、過了一個月才回來收。為什麼這次敢動？因為**已經沒有「再加一個愛物 type 不會痛」的明天**。哪天要加第七種愛物（比如 `vehicle` 把車跟摩托車分開），那條 union prop interface 會再長出 10 個欄位，64 個 useState 會變 80 個——**債只會利滾利**。

順手做的兩條 refactor 同 batch ship：

**SQL predicate helpers（#188）**——`epochClause` / `dateRangeClause` / `assetIdsClause` / `statusClause` / `splitTypeClause` / `categoryInClause` / `cursorClause` 等等抽到 `lib/db/queries/_predicates.ts`。原本 7+ 個 query 各自 inline，每次加新 filter dimension 就要去**七個地方各改一次**——多 copy 一份就是多一個漂移點。`listTransactionsPaged` / `listFeedAllPaged` 也順手從 positional args 改成 `ListPagedOptions` object——signature drift 一個月內已經有兩次差點 break 既有 caller。

**Auth / group 樣板統一（#190）**——14 個 server action 開頭都長一樣的 4 行：「拿 user、找 group、不存在就丟 error」。抽成 `requireViewer` / `requireViewerGroup`（server action 用，丟 Unauthorized）跟 `requireViewerOrRedirect` / `requireViewerGroupOrRedirect`（server page 用，redirect 到 `/sign-in` / `/setup`）。**這條規矩寫成 helper 才能強制：「server action 一律 throw、server page 一律 redirect」**——之前手刻就常常兩種混著用。

## PartnerQuiz：雙人異步問答（#163）

延續上週的雙人月度回顧主題——新增一個小儀式。兩張表：`PartnerQuizSessions`（UNIQUE `group_id`）+ `PartnerQuizAnswers`（UNIQUE `session_id, member_id, question_key`）。6 題池抽 3，兩人**各自獨立作答**，6 列 answer 到齊之後 `revealed_at` 在**同一個 transaction** 寫入解鎖揭曉。

設計關鍵：「同 transaction 寫 reveal」這條。如果先寫 answer、再單獨 `UPDATE session SET revealed_at = now()`，**會有 race**——B 剛 submit 完答案、A 同時 race 進來 submit 第 6 列、兩個 connection 都看到「6 列齊了」、兩邊都 update reveal——這個分支沒實際傷害但會讓 audit log 亂掉。把 reveal 跟最後一個 answer 包進同一個 transaction、用 row count 判定誰是「補上第 6 列那個人」，**單一 writer 寫 reveal**。

`/review/[YYYY-MM]/quiz` 一頁三狀態切版（作答 / 等待 / 揭曉），`PartnerQuizCard` 在月度回顧頂部依 `derivePartnerQuizStatus` 的 5 種 status 切版。Solo mode 不渲染、第一次還沒做完月度回顧（`snapshot` 為 null）也不渲染——**這個 timing 我糾結過：不要讓使用者打開 app 第一週就被一個揭曉儀式嚇到**。

## v0.15.1 dashboard UX sweep + iOS Safari 連環 polish

v0.15.0 完成「離開群組」之後，當天就有一堆使用者反饋小不順——這天把它們收成 v0.15.1：

- **dashboard semantic colours**：把 hardcoded 顏色改成 semantic token（`success` / `warning` / `danger` / `accent`）—— theme switch 才會一致
- **records stats card + recurring entry polish**
- **split-ratio slider snap 10%**（#162）—— 滑到 23% 跟 25% 那種「沒人想要的精度」直接 snap 掉
- **balance toggle settled vs include-pending**（#164）—— pending 紀錄上線之後使用者想要「我先看看含 pending 的長怎樣」
- **保險 Phase B**：`account_value` 欄位給投資型 / 帳戶價值型保單記月度餘額；保險被保人關聯 Child 愛物（`insured_child_id`）—— 一張卡同時看到「保誰、保多少、目前帳戶值」
- **愛物頁加 tab**：「愛物 / 守護」兩個 tab，保險併入「守護」（#178）—— 保險視覺上跟「擁有」的車、房、寵物本來就不是同一類

然後就是**那一串 iOS Safari polish**——15 個 fix commit，幾乎每個都不到 50 行但都很煩：

- **SplitTypeSelector slider wrapper 沒設 `w-full`**——它在 `<button>` flex-col 裡面、原本靠 cross-axis stretch 拿寬度，iOS Safari 某版的 button flex 不會 stretch、整條 slider 縮成 0 寬。pin `w-full` 修掉。
- **SheetBackdrop pointer-event capture 在 close animation 期間被釋放**——使用者在 sheet 即將關閉的那 200ms 點到底下的 list，會「touch through」誤觸。改成 pointer-event capture 保持到 close animation 完整跑完。
- **amount input synchronously focus** 才能在 sheet 打開的瞬間彈出 iOS 鍵盤——`requestAnimationFrame` 包一層、async focus 都會被 iOS 認為「不是 user gesture 觸發」、鍵盤跳不出來。**iOS 對 user gesture 的判定嚴格到神經質**。
- chip row 加 edge fade mask、scroll-aware 那種——加完之後使用者才意識到「右邊還有東西」
- 每次 save / edit / delete 跳 transient toast——之前沒有任何視覺回饋，使用者按完還要再次確認「剛剛真的存了嗎」

每一個都不大、加起來把 v0.15.0 那種「主幹通了但細節還粗糙」修成 v0.15.1 那種「拿在手上順順的」。

## 順手 ship 的：past-times 跨 group integration test、color token 收斂

寫了一條 `leaveGroup` integration test 涵蓋「離開時沒有任何愛物」這個 edge case（#139）——之前所有測試都假設兩邊各有東西要分，但**完全沒共同資產的伴侶**這個 path 沒被 cover，要是 query 寫 `WHERE asset_id IN (...)` 帶空 array 又沒 guard 會直接炸。

`refactor(colors)`：把 category 跟 asset tint 都收斂成 single primary color token——之前每個 category 自帶 `color` 跟 `tint` 兩個 hex（手挑、容易漂移），現在只挑 `primary color`、`tint` 用 `lightenHex(hex, 0.35)` deterministic 推得。**chip 跟 donut slice 屬於同一 hue family 這件事是 enforced 的、不是 reviewer 看出來的**——這是設計系統最起碼的紀律。

## 收尾

55 個 commit、v0.15.1、一個跨 group 的章節歷史、一個被剝成 6 片的 AssetSheet、一個 PartnerQuiz、一連串 iOS Safari 的小修補。

回頭看——最爽的不是 PartnerQuiz、不是 v0.15.1 的 polish，而是 `AssetSheet` 從 1517 行縮到 60 行 router + 6 個獨立 body 的那一刻。**沒有新功能、沒有 user-visible 變化、沒有 release note 講得清楚**——但下次加新愛物 type 的我會在心裡謝今天的我。技術債的還款不會有 Twitter 慶祝，但它是「下一週還想繼續寫這個 codebase」的全部理由。

至於那個 `listEpochsForViewer` 的 cross-group query？我寫完它之後在 commit message 裡寫「Y 終於從空白頁裡回來了」。對著 git log 自言自語的程度。剛好。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。*
