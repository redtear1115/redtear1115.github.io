---
title: "為什麼旅行不能用主帳本記？——一條 sub-ledger 在 7 版內長出來的全紀錄"
pubDate: "2026-05-16"
tags: ["futari", "devlog", "release"]
draft: false
---

老實說，「旅行」這題我一開始想當鴕鳥。Futari 是個記帳工具，旅行支出**理論上**就是普通 transaction、加個 tag 不就好了？兩週前我還這樣覺得。

直到有一天兩個測試使用者一句話打醒我：「**我們下個月去東京，每筆心算 ÷ 4.5 寫成台幣嗎**？」**對啊。然後回國一個月後想看「那趟北海道花了多少」，要對著日期區間在 records feed 滑半天 + 翻計算機**。再認真的伴侶過兩個月都會放棄、退回 Excel。我本來想直接用「分類 = 旅行」+ 「日期 filter」，但這條 quick fix 卡在一個 schema-level 的事實：**主帳本是台幣 integer**，外幣根本進不去。

所以這條 issue 在 backlog 躺了一個月——我知道做下去會痛、但卡在那也痛。直到上週一個 brainstorm 撞出一個結論：**多幣別 (#68) 跟旅行帳本 (#42) 不該分開做**。旅行 99% 用外幣、外幣 95% 場景是旅行——schema 跟 form 共用同一片地皮，**分兩次做等於把 migration window 開兩次、痛兩次**。決定 bundle 起來、一個 sprint 寫穿。

接下來 7 個版本（v0.17.0 → v0.17.6）的故事。

## v0.17.0：架構先行 bundle

第一條動作不是寫 code、是寫 spec——`docs/superpowers/specs/multi-currency-trip-design.md`、342 行，鎖了 5 個架構決策：

1. **Snapshot rate semantics** —— `CashTransactions` / `TripExpenses` 寫入時 freeze 當下匯率到 `rate_snapshot`，**未來改匯率不會回頭重算歷史 record**。這條是整套設計的承重牆——「我們去東京那週 1 JPY = 0.22 TWD」這件事就是歷史事實、跟現在匯率多少完全無關。
2. **Trip 強制單一 epoch** —— `Trips.epoch_id` FK to `GroupEpochs`、`start_date >= currentEpochStartedAt`、進行中 trip **阻止 epoch 結束**（`leaveGroup` 偵測到 active trip 直接 reject）。**Trip 不能跨章節**——「2023 那段關係的東京之旅」跟「2024 這段關係」是兩件事、不能混。
3. **Settlement base-only** —— 結算永遠用主幣別、避免「我給你 100 USD 還 350 TWD」這種事務局面。
4. **Trip 結束時 fold-back 主帳本** —— 這是 sub-ledger 的核心保證，後面講。
5. **Income multi-currency schema 加、UI 暫不接** —— 留架構缺口避免 sprint 撐爆。

Schema migration 0038 一條打掉：`currency_code` enum、`trip_status` enum、`CurrencyRates`（per-group 心理匯率、只存當前不存歷史）、`Trips`、`CashTransactions` 加三欄 `original_currency` / `original_amount` / `rate_snapshot` + `trip_id` FK、CHECK constraint 強制 `original_*` 三欄 all-or-nothing。**additive only**——既有資料一行不動、backfill 邏輯藏在 `formatAmount` helper 看到 NULL 就 fall back base，DB 不動。

接著 7 個 phase：currency lib（`formatAmount` / `convertAmount` / `currencyPrecision`，cent-aware——日圓無小數、美金兩位、台幣整數，每種幣別 rounding 規則寫死在 helper、callsite 不用知道）、`/settings/currency` 頁、Trip CRUD（4 個 server actions、290 行測試先寫）、AddSheet wire currency + trip selector、records dual-currency display、E2E golden path test。

v0.17.0 23:31 release。一切看起來很美好。**14 小時後我自己 dogfood 把它收一半回來**。

## v0.17.1 → v0.17.2：把 trip-end fold-back 寫穿

凌晨 ship 完 v0.17.1 polish——隔天中午記第一筆主帳本，**第一個動作**是「我幹嘛在記帳的時候要選幣別？我又不出國」。每筆 transaction 多一個 picker、就算 default 是 base currency 也要看著它**意識到自己可以選**——這個認知負擔對日常記帳是純粹的噪音。**為了 5% 出國場景，把 95% 日常變吵**——不划算。

於是 v0.17.2 同一天分兩個 phase：

**Phase 1 收 UI**——AddSheet 的 `CurrencySelector` **只在 `tripId` set 的時候 render**。主帳本完全看不到 picker、amount hero 直接顯示 baseCurrency 符號、零決策。「**不該決定的時候不要假裝給你決定權**」——這條 UX 原則寫起來簡單、做起來常常違反。

順手寫了一條 docs commit 把這個取捨用一句話鎖死：「**Complexity at the boundary, simplicity in daily use**」——產品外圍接 reality 的地方該複雜就複雜（多幣別、跨章節歷史、leave/swap），但使用者**每天碰**的入口必須認知負擔極低。把這條哲學寫進 spec 的價值在於——**將來再有「為什麼不在主帳本也加 picker」這種建議時、這條 spec 是擋下來的理由**。

**Phase 2 寫 sub-ledger fold-back**——這條才是整個 sub-ledger 的核心保證。

旅行進行中 `TripExpenses` 表自己玩自己的——多幣別、`splitRatioA` 可以每筆不同、**完全不影響 GroupBalance**。但旅行結束的瞬間，**這趟旅行的「淨額」必須回到主帳本**——不然 balance 永遠對不齊。怎麼 fold？

答：**最多兩條 `CashTransactions`**（每個 paying member 一條），代表「整趟旅行的綜合結果」。實作 `lib/tripSummary.ts` 的 `buildTripSummaries()`：

1. 對每個 paying member 算 `out-of-pocket total` + `A-share total`
2. **暴力搜尋 integer `splitRatioA`**——逐一試 0..100、看哪個比例下 `lib/balance.ts` 算出的 delta 最接近真正的 per-expense exact delta
3. 邊界 collapse：0% → `all_theirs`、100% → `all_mine`、其他用 `weighted`
4. 回 0–2 rows

為什麼暴力搜尋 ratio？因為旅行裡 100 筆 transaction 每筆都可能用不同 splitRatioA、不同幣別、不同 paying member。**真實的「平均」是無理數**、但 `splitRatioA` 在 schema 是 0–100 integer——**整數空間只有 101 個、暴力搜尋比寫精算公式快寫又好懂**。誤差吸進那條 summary 的 amount。

`endTrip` 寫成 atomic transaction：

```
UPDATE Trips SET status='ended' WHERE status='active'  -- conditional, idempotent
↓ (若 0 rows updated → throw '找不到進行中的旅行')
SELECT live TripExpenses
↓
INSERT 0-2 summary CashTransactions
↓
COMMIT → trigger recalcGroupBalance
```

第一行的 `WHERE status='active'` 是 idempotent guard——同一個 trip 被 race condition 連續 `endTrip` 兩次、第二次 affected rows = 0、throw error、後面 select / insert 完全不會跑。**單一 SQL conditional 取代分布式鎖、DB row update 本身就是 atomic**。

## v0.17.3：心理匯率搬家

v0.17.2 release 完繼續 dogfood，**又**發現一個錯誤——**「心理匯率」這顆 Settings Row 在每個 user 面前都存在、但 99% 人從不碰**。匯率只在記旅行帳的時候有意義、平常它出現在 Settings top-level 是純噪音。

改動：`/settings/currency` 整個頁面保留（onboarding 還需要設 base currency）、但**心理匯率編輯**從 Settings top-level 拔掉、改成 TripDetailClient 加一條 tertiary link「**調整心理匯率**」、放在 edit/end-trip CTA 下面。**使用者剛好想著「這趟旅行的匯率合不合理」的瞬間、入口就在那**——這是 v0.15.2 那種「contextual surfacing」哲學的延續。

順手又補：**dashboard 加 `ActiveTripBanner`**——之前 dashboard 已經 SSR-fetch `activeTrips` 給 AddSheet 的 TripSelector 用、但**沒有任何視覺 surface**。要知道哪趟旅行進行中只能去 Settings 翻。banner 補上、點進去直接 trip detail。**這就是「資料已經在 client 上、只是沒有對應 UI」的典型 leftover**——v0.17.0 衝架構先行的代價、第三天回來收。

## v0.17.4：trip-scoped self-serve currencies

到這版 trip 表上的 currency 還鎖死在 enum——`currency_code` 只有 4 個值（TWD/CNY/USD/JPY）。然後測試使用者問：「**我們要去越南、VND 怎麼辦**？」**靠**。

這條改動把整套 currency model 從 enum 翻成 free-text + per-trip snapshot：

`Trips.rate_snapshot` 從 legacy `${FROM}_${TO}` shape **升級成 jsonb**：

```json
{
  "default": "TWD",
  "entries": [{ "code": "VND", "label": "越南盾", "rate": 0.00121 }]
}
```

- Trip 相關 currency columns 從 `currency_code` enum 改成 free-text、**user-defined codes 全開**（VND、EUR、CHF、想塞 BTC 也行）
- **主帳本 stays enum-bound**——維持「主帳本 = 限定幣別、trip = 自由幣別」的分層
- Migration 0040 in-place 轉換既有 `rate_snapshot` rows、uppercases column values（不要 `usd` 跟 `USD` 同時存在那種精神分裂）
- `lib/trip-currency.ts` 統一 parse / validate / build helpers、**兩種 shape read-tolerant、writes 一律走 `validate()`**——這條 read-tolerant write-strict 是 schema migration 期間最好的妥協

UI 端 trip 自己挑要用哪些幣別——TripSheet 開幾筆 entries 就只能用幾筆、不會跳出 4 種預設幣別在那干擾。AddSheet currency dropdown 接 trip 的 `entries` 列表 limit options、conversion preview 從 deprecated group-wide `CurrencyRates` 切到 `convertViaSnapshot(amount, from, base, trip.rate_snapshot)`——**展示給使用者看的數字 = 真的會落 DB 的數字**。

## v0.17.4 fu：兩條 user feedback follow-up

ship 完 self-serve currencies 不到 2 小時，使用者撞出兩個事：

**1. 「為什麼 trip 還要選 default currency？」**—— 對。trip 結束 fold 永遠是 base、`rate_snapshot.default` 為什麼還要選？拔掉。`rate_snapshot.default` 一律 = group 的 `base_currency`、trip 表面再也不問這個問題。**一個 picker 拔掉等於一條決策樹砍掉**。

**2. 「為什麼匯率不能改？」**—— 之前 lock：rate 一旦被任何 TripExpense 用過就不能改。我以為這條保護的是「歷史 record 不被改變」——**結果根本不是**。`TripExpenses.amount` 是 base integer 寫入時就 freeze、lock 保護的是空氣、只擋住使用者「估錯匯率」的合理修正。

改成：**rate 隨時可改、舊 TripExpenses 完全不變、只有未來新增的 record 用新 rate**。UI 不再 disable controls、改顯示 soft hint「{n} 筆；改匯率不影響舊紀錄」。**這就是 snapshot semantics 的力量**——歷史是歷史、現在改現在的、兩者完全 decoupled。

## v0.17.5 / v0.17.6：收尾的小東西

剩下兩版偏 polish：

- **trip detail 重排**——fold preview 拉到頂部、per-currency × per-member breakdown 放下面。原本 layout 把「最關鍵的『這趟結果如何』」埋在第三屏，使用者要 scroll 才看到——**最重要的數字應該在最上面**，這是個我以為自己懂、但仍然會犯錯的設計常識。
- **router.back() 修正**——trip detail 用 `router.back()` 取代 hardcoded `/trips`，從 dashboard banner 點進去再 back 不會回到 list、會回 dashboard。**back navigation 應該回到使用者來的地方、不是程式設計師覺得「合理」的地方**。
- **TripSheet a11y/touch pass**——所有 strings i18n hoisted、tap targets 統一 44px+、rate direction 文案再清楚（「1 JPY = ? TWD」vs 反向、之前要看半秒才確定）
- **end-trip destructive flow**——edit 按鈕從 sheet bottom 搬去 header 鉛筆 icon、end-trip 改 destructive 紅色配 confirmation step。**「結束旅行」是不可逆 + 會寫 0-2 條主帳本 transaction、值得一個 destructive UI 等級**。

## 一個有趣的踩坑：snapshot semantics 我自己也搞混過

整套 sub-ledger 最反直覺的地方是 v0.17.4 fu 那個 rate lock 解開——**我自己第一版實作就把 lock 寫上去了**、commit message 還寫「protect historical records」。直到使用者問「為什麼不能改」，我去 git blame 自己、看到那條 `TripExpenses.amount` 是 base integer 寫入時 freeze、**lock 在保護一個本來就 immutable 的欄位**——保護空氣。

這就是 schema 設計足夠嚴謹之後的副作用：**舊邏輯會自己過時、但 code 不會自己知道**。如果不是使用者撞到、那條 lock 大概會一直留著、繼續擋著合理的修正。**「審視自己的程式碼」這件事最難的不是讀懂、是相信它原本的假設可能已經不成立**——而我寫的那個假設只有兩個版本前才成立過。

## 收尾

7 個版本、一條 sub-ledger 從 schema-first bundle 寫穿、UI 收了再放兩次、心理匯率搬了家、currency model 從 enum 升級到 free-text snapshot、自己撞自己的 rate lock。

回頭看 v0.17.0 那條 migration——**那 342 行 spec 跟 migration SQL 沒有一行需要 rollback**。UI 大改三次、entry point 搬三次、currency picker 進出兩次、rate lock 砍掉——schema 通通沒動。**這就是 architecture-first 的真實價值：schema 是承重牆，UI 是裝潢**。

至於那個暴力搜尋 splitRatioA 的 `buildTripSummaries`？我每次想到「在 0..100 之間挑誤差最小的整數」這種土法煉鋼的解法竟然是對的，就覺得有點好笑——精算系畢業的人看了大概會崩潰。但 it works、it's readable、it's fast。**這趟旅行的綜合結果**最後落到主帳本就是 0–2 條整數 transaction、誤差吸進 1 元的精度——剛剛好。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。*
