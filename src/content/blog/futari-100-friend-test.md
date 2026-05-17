---
title: "Futari 1.0.0 上線了——順便聊聊我在 friend test 收尾那天幹了什麼"
pubDate: "2026-05-17"
tags: []
draft: false
---
---
title: Futari 1.0.0 上線了——順便聊聊我在 friend test 收尾那天幹了什麼
date: 2026-05-17
tags:
  - Futari
  - release
  - friend-test
  - i18n
  - locale-url-prefix
  - rls
  - supabase
  - postgres
  - security
  - performance
  - next.js
  - cdn-cache
  - refactor
  - sheet-primitives
  - server-action
  - branding
  - copy-guidelines
  - retrospective
summary: friend test 收尾那天從 v1.0.0 連發到 v1.0.4，105 個 commits——i18n 補完 + locale URL prefix、RLS 補洞、perf 三連發、sheet primitives 抽共用，外加一個被 CDN cache 凍住 30 分鐘的 hero copy。
---
friend test 一開始我以為會是「拿到反饋、改幾個 bug、發版」這種純粹的事。結果反饋進來、自己再點一遍 app，發現問題不是 bug——是**整個 sign-in 頁長得像一個 2019 年沒人維護的 side project**。然後是 i18n 沒做完、RLS 有洞、prod log 飆紅、CDN 拿 1 小時的 cache 蓋掉了我臨時改的 hero copy。一天之內從 v1.0.0 連發到 v1.0.4，105 個 commits，我覺得我可以寫一篇了。

## 先說最丟臉的：i18n 其實沒做完

Futari 號稱支援 zh-TW / zh-CN / en / ja 四語。聽起來很 fancy 對吧？實際上是——zh-CN 有一堆 key 直接 fallback 到 zh-TW，ja 整段 untranslated，public pages（landing / sign-in）裡有一堆**hardcode 的中文字串**。我自己用 zh-TW 在開發，當然看不出來。

修法很無聊但必要：把 hardcode 中文字串全部抽成 i18n key、補上 zh-CN / ja 的翻譯、再讓 `useTranslations` 在所有 client component 都拿得到。順手做了個更大的決定——**locale 從 cookie-only 升級成 URL prefix**（`/zh-CN/sign-in` 這種）。理由很簡單，SEO 看不懂 cookie，Google 不會幫你 index 四個語言版本的 landing。順便加了 per-locale metadata、canonical、hreflang、sitemap 列出所有語言版本，robots.txt 放行 locale-prefixed paths。

中間踩了一個我覺得很有趣的坑：sign-out 之後 redirect 回 `/`，locale 就被洗掉了。OAuth 失敗也是。Invite link 也是。一個 `localizedHref` helper 處理掉這三條路徑——說穿了就是「**任何 server-side redirect 都要記得帶 locale**」，但在 cookie-only 時代這事根本不存在，遷到 URL prefix 才浮出來。

## RLS 的洞——「為什麼 friend test 沒人撞到」我也想知道

prod 上的 Supabase advisor 一掃，跳出來一排紅字：

- `CurrencyRates` / `PetDetails` / `PlantDetails` / `TripExpenses` / `Trips` **沒有 RLS policy**（理論上 anon role 都能查，幸好 advisor 警告比我用戶先發現）
- 所有 SELECT policy 裡的 `auth.uid()` **沒有 wrap 在 subquery 裡**，每 row 都會重算一次（Supabase 官方推薦寫法是 `(SELECT auth.uid())`，讓 planner cache 住）
- 多個 permissive SELECT policy 疊在同一張表上，policy evaluator 要 OR 一遍——consolidate 成單一 policy
- `compute_next_occurrence` / `compute_monthly_review_snapshot` 兩個 function **沒設 `search_path`**——這是 Postgres SECURITY DEFINER 的經典坑，不固定 search_path 就可能被惡意 schema 攔截
- `rls_auto_enable` function 對 anon / authenticated 沒 REVOKE execute——這個我本來以為 default 是不給的，結果不是

每一條都是 5 分鐘改完的 migration，但全部加起來就是「**friend test 用戶其實是在一個半開的門後面記帳**」，想想還是挺後怕的。1.0.3 整版就是收這個。

## Performance：我給用戶的不是 PWA，是 50MB 的 icon

friend test 有個朋友說「第一次載很慢」。我打開 DevTools 一看——**單一 PNG icon 跑到 800KB**。我那組 asset icon 是早期 export 的，6 個 type、每個都肥得像中世紀城牆。一輪 compress + 額外輸出 WebP variant，整組 -78%。

另外兩個 perf 改動更隱形但更舒服：

- **`next.config` 加 cache header**——static assets 給長 cache、`/sign-in` 從 1 小時砍到 5 分鐘（因為 hero copy 真的會改，1 小時太硬）
- **Avatar lazy-load + guardian chunk gate by UA**——首屏不需要的 chunk 不要塞進 critical path。Guardian 模組只有 desktop 用得到（mobile 還沒做完），那就 UA-check 一下別 ship 給手機用戶

## Refactor #512：sheet 的孿生兄弟們

這是技術債清單裡躺最久的一條。Futari 有 6 種愛物（car / house / child / pet / plant / insurance），每種都有自己的 SheetBody——**6 個 component 80% 一樣，剩 20% 各搞各的**。Add / Income sheet 也是，DateField 在 dashboard 和 asset sheet 兩邊各寫一份。

整理方式很傳統：

- `useAssetSheetCommon` hook——把 6 個 SheetBody 共用的 form state / submit / close 邏輯抽出來
- `useSheetMutation` hook——AddSheet 和 IncomeSheet 的 server action 呼叫 + error handling 共用
- `DateField` unify——dashboard 那份直接刪、所有 sheet 用同一個
- `assertMember` / `assertAssetInGroup`——actions/ 底下重複的 auth guard 收進 `lib/auth`
- 還順手把 `MonthlyStatsView` 拆了、`EndTripSheet` 從 `TripDetailClient` 抽出來、insurance 的 date helper 搬到 `lib/local-date`

沒有 behavior change，但接下來新增第 7 種愛物時——就是抄一份 SheetBody、把 20% 差異填進去就好。**少 1000 行重複的程式碼比多 1000 行新功能值錢。**

## 一個小插曲：CDN 把我的 hero copy 凍結了

上線當天我發現 `/sign-in` 的 hero 違反了自己寫的品牌文案準則（**禁用「追蹤」「管理」、不放感嘆號、hero 不列功能**——對，我自己違規）。改完 push，重新整理頁面——**還是舊的 copy**。F5、清 cache、無痕視窗——都是舊的。

原因：Vercel `Cache-Control` 給 `/sign-in` 1 小時 max-age。我前一晚剛加的。改完 deploy 是 deploy 了，但 CDN edge 那層還在用 1 小時前的 HTML。砍到 5 分鐘之後就解決了，但那 30 分鐘我以為自己改錯檔案，git diff 看了五遍。

教訓：**CDN cache 設定要跟著「這個頁面多久會改」走**，不是「越久越快」。Landing 確定下來之前都不該超過 10 分鐘。

## 收尾

1.0.0 → 1.0.4 一天四個 hotfix 聽起來很慘，但其實是「**friend test 真的有人在用，所以每個 issue 都被找出來了**」。比起 prod 上沒人發現的 silent bug，這種一邊上線一邊修的節奏我覺得反而健康。Futari 現在算是真的能給人用了——雖然我等等就要去開 v2.0.0 milestone 了。

這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。
