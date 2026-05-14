---
title: "# 一天 72 個 commit 的後遺症：把 Futari 從 0.8.1 推到 0.11.3"
pubDate: "2026-05-08"
tags: []
draft: false
---
說來有點荒謬——我寫了好幾個月的 Futari，結果連 `/robots.txt` 都被自己的 middleware 一腳踢去 `/sign-in`。對，**整站 SEO 等於零**。Google bot 來敲門，被我 307 redirect 到登入頁，看一眼就走了，連 sitemap 都沒機會吃到。一個對外行銷靠 organic 的 PWA，這真的不行。

更荒謬的是，把 children 的身分證／健保卡寫進 DB 時，我居然**忘了呼叫 `encrypt()`**——欄位早就規劃好要做端到端加密，schema 也設計成 ciphertext-only，結果 server action 那邊一路 plaintext 灌進去。讀的時候更妙：直接把 plaintext 丟回 client，前端拿來 render `●●●` 假裝有遮蔽。typeof 安全劇場。被自己的 RLS 救下來（至少不是其他 group 的人能看），但那不是重點，重點是這條路徑根本就不該 plaintext 出現在 wire 上。

所以這趟把這兩件事都修了——順便把累積快兩個 sprint 的東西全清掉。

## 加密這條路徑——從寫入到讀取通通重做

寫入端最直接：`createChild` / `editChild` 兩個 server action 在 insert 之前先過 `encrypt()`，把身分證、健保卡欄位變 ciphertext 才寫 DB。原本兩個 Supabase project（dev / prod）裡的 plaintext 我先 wipe 成 NULL，所以這個 PR 不用 backfill migration——對，**手動清資料比寫 migration 快**，這種事情我不會否認。

讀取端比較有趣。原本 `getChildDetails` 直接回 plaintext，現在改成只回 `hasIdNumber: boolean`、`hasNhiCard: boolean` 這種 metadata。要看真正的明碼？再呼叫一次新增的 `revealChildPii` server action，那支會做 group membership 檢查、解密、然後才回 plaintext——而且不 cache。Client 端就是 `●●●` mask + 顯示／隱藏 toggle，按一下才打 server，等於把「敏感資料」做成 on-demand 動作而不是 page payload 的一部分。

順便補一個 edit 行為的歧義：保留欄位空白 = 不變更、按清除按鈕 = 寫 NULL、輸入新值 = encrypt 後覆寫。這三條路在 validator 裡分得很乾淨，不然「使用者沒打字」跟「使用者要清空」會混在一起，那是另一個 bug 的開始。

## SEO：middleware matcher 漏掉 metadata routes

修這個只需要改幾行 config，但找到原因花的時間比改它久。Next 16 的 metadata routes（`app/robots.ts`、`app/sitemap.ts`）會 serve 在 `/robots.txt` 跟 `/sitemap.xml` 這兩個 path——但我的 `middleware.ts` 把所有 path 都丟進 auth gate，這兩個路徑也被 redirect 到 `/sign-in`。

所以做了這幾件事：middleware matcher 把 `/robots.txt` 跟 `/sitemap.xml` 排除；新增 `app/robots.ts` 把 `/sign-in`、`/terms`、`/privacy` 設成 Allow，其它需要登入的 path 全 Disallow；`app/sitemap.ts` 把 `/sign-in` 設 priority 1.0，附 4 語 hreflang alternates（zh-TW、zh-CN、ja、en，透過 `?lang=` query 區分）。

`app/layout.tsx` 的 metadata 也整個重寫——title 從以前那個只有「Futari」變成「Futari · 兩個人的家計簿｜伴侶／夫妻共享記帳」、description 塞了 22 個長尾關鍵字（伴侶、夫妻、共享、AA、分攤、油耗、保險、PWA…）、canonical 指 `/sign-in`、og:url 也修掉（之前指 `/`，但 `/` 會 307）。最後加一段 `SoftwareApplication` 的 JSON-LD 在 `/sign-in`，把 featureList、offers、inLanguage 這些都鋪好。順手把那個被當 `<div>` 用的「Futari」換成 `<h1>`，視覺一樣，但 crawler 看得到 heading hierarchy 了。

## 這次最有料的踩坑——getSession vs getUser

中間有一段 perf 工作把 page / layout 的 `auth.getUser()` 換成 `getSession()`，省掉每個 server-rendered request 200–400ms 的 Supabase Auth API 往返。聽起來爽，但**這裡有 trust boundary**：`getSession()` 只讀本地 cookie 不驗 JWT，`getUser()` 才真的打 Supabase 驗。

我的解法是：middleware 仍然 `getUser()`——session cookie 在進 page 之前一定被驗過一次；page / layout 用 `getSession()`，因為它們只讀；server actions 一律 `getUser()`，因為它們會 mutate state，每次都得重新驗。這條規則寫成 helper（`getCurrentUser()`）強制下去，避免哪天有人在 page 裡偷 mutate 然後跳過驗證——那種 bug 會在 prod 等你三個月才現身，我不想賭。

## 還有什麼

定期支出（v0.12.0）的 foundation 也鋪了——`RecurringExpenseRules` + `PendingExpenseOccurrences` 兩張表、daily cron 生 pending、RLS scoped to group members、validator 也寫好了，但 UI／action 還沒接，下一個 PR 才動。i18n 從 2 語擴到 4 語（zh-TW / zh-CN / ja / en），date helper 改用 `Intl.DateTimeFormat`——這樣就不用自己維護日期格式字串。Supabase advisor 跑出來的 security warning 也清了：`profiles_select` 的 `auth.uid()` 包進 `(select auth.uid())` 讓 InitPlan 一次算完不要 per-row、`handle_new_user` 釘住 `search_path = public, pg_temp` 防 search_path injection、REVOKE PUBLIC EXECUTE 不讓 SECURITY DEFINER trigger 從 `/rest/v1/rpc` 被叫到。assets 列表把 N×`getAssetSummary` 縮成一條 `SUM ... GROUP BY asset_id`，5–8 個 assets 的 friend test 可以省 120–560ms。

## 收尾

72 個 commit 一天清完。SEO 修好之後我去看 `next start` 出來的 `/sign-in` HTML——title、description、keywords、canonical、4 個 hreflang、JSON-LD 全部就位，那一刻有種**「啊原來這才是別人 default 的樣子」**的感覺。早知道就不要讓 middleware 一開始就把 `/robots.txt` 也吃掉了。
