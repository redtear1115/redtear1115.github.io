---
title: "Futari 終於記得錢「進來」也是一筆 transaction：IncomeTransactions 上線"
pubDate: "2026-05-17"
tags: ["futari", "supabase", "security", "database", "devlog"]
draft: false
---
Futari 之前只記得錢「出去」——進帳？哦，那只是「balance 自己變大」這個結果

我的家庭帳本 Futari 一直有個尷尬：它只懂 expense。發薪水那天你只能假裝那是「負支出」，或者乾脆手動敲 balance 框。對，就是那麼荒謬。所以這次我把 **IncomeTransactions** 整條 stack 從 migration 一路鋪到 IncomeSheet UI。

---

後端先動：新開一張 `IncomeTransactions` table，附 **RLS**（group 成員才看得到）、**realtime** publication 開好，再順手把 `pg_cron` 的 retention cleanup 一起加。結果第一刀太重，把舊的 FuelLogs cleanup 也覆蓋掉了（regressed by 0012，自己的 migration 自己打臉），下一個 commit 就是把它補回來——migration 是 append-only 的世界觀，但 function body 不是，我又踩了一次。

接著是 schema、`validateIncomeInput`、server action 三件套（create / edit / softDelete）。最有趣的是 `editIncome`：soft-delete 跟 update 我都包在同一個 **transaction** 裡，用 `RETURNING` 加 row-count check——回來的列數不是 1 就整個 rollback。這樣 RLS 即使偷偷把 row 過濾掉，也不會出現「以為改成功了、其實打到空氣」的灰色狀態。

---

最頭痛的是 feed。Records 那頁要同時顯示支出 + 進帳、照時間排序、還支援 paging，所以寫了一個 `listFeedAllPaged` 用 **UNION** 把兩張表黏在一起。cursor 用 `(transactedAt, id)` 複合鍵，避免同一秒兩筆在頁邊界跳來跳去。後來 `listIncomesPaged` 還 refactor 過一次，把 base predicate 用 spread-conditions pattern 攤平——原本版本，加新 filter 要在三個地方同步改 where clause，誰受得了。

進帳終於是一等公民了。下一個受害者大概是我的 dashboard——它的 mode toggle 還在嫌兩張 hero card 太擠。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。*

---

<!-- source: oikos | last_sha: b862c3bb5e3832a444f98043e61ce97fbff0dc4a -->
<!-- commits:
- ef93b1dbf8 2026-05-06T03:44:40Z migrate: IncomeTransactions table + RLS + realtime + pg_cron cleanup
- 11c9d32fc4 2026-05-06T03:45:24Z feat(income): IncomeTransactions schema + categories rewrite to spec + mint palette token
- 24394ab00f 2026-05-06T03:46:27Z feat(validators): validateIncomeInput
- 2b02a422b1 2026-05-06T03:48:02Z feat(income): listIncomesPaged + listFeedAllPaged UNION query
- 160e20775e 2026-05-06T03:50:37Z feat(income): server actions create/edit/softDelete + loadMoreIncomes
- 06b1253b60 2026-05-06T03:59:35Z fix(migrate): restore FuelLogs cleanup in pg_cron body (regressed by 0012)
- 35e65dd125 2026-05-06T04:00:07Z fix(income): editIncome soft-delete inside tx with returning + length check (mirror editTransaction)
- f43d03efb7 2026-05-06T04:00:33Z refactor(income): listIncomesPaged uses spread-conditions pattern to avoid base-predicate duplication
- 6775383ce2 2026-05-06T04:36:11Z ui(assets): fix AssetSheet height — switch from maxHeight to fixed height
- b862c3bb5e 2026-05-06T04:43:48Z ui(assets): collapse 房子/保險 under 「更多」 + add house icon
-->
