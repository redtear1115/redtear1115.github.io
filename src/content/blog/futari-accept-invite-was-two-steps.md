---
title: "兩個人同時按接受，群組可能會滿出來"
pubDate: "2026-05-07"
tags: ["futari", "security", "database"]
draft: false
---
5 月 2 日，我把 Futari 的底層一次搭完。記帳本身還沒開始。要先分得清誰可以看哪一筆。

Drizzle 的第一支 migration 檔名叫 `0000_curly_tarantula.sql`。連線寫在 `lib/db/client.ts`，接到 Supabase。我要看得到的 SQL，不想讓工具替我生出讀不懂的查詢。

Google 登入和 callback 當天進。第一版沒有檢查導回的網址從哪來。code 不見，交換失敗，也沒有明講。當天補上：導回網址要驗，缺 code 要擋，交換失敗要有去處。這種流程拖到後來補，登入會在最糟的時候壞。

middleware 也是那天。沒登入的人進不了帳本那一區。

邀請是兩個人的產品才有的。產生 token、檢查 token、接受邀請，分開寫。acceptInvite 一開始是先查群組滿了沒有，再把人加進去。兩步。兩個人同時按接受，有機會超過人數上限。改成一個帶條件的更新，檢查和寫入在同一個 SQL 裡。再補第二個成員的測試，確認這條路走得通。

最後是資料庫的列權限，還有新使用者進來時的 trigger，名叫 handle_new_user。客戶端就算寫錯查詢，資料庫也只吐這個人該看的列。政策要自己寫。用了 Supabase，政策不會自己出現。

圖示的 manifest 也在那天。purpose 先寫在同一個項目裡，Chrome 不收。拆成 any 和 maskable 兩個才過。

先不說了啦，我得去對一下那個同時按接受的測試，還在不在。

*這段 code 寫於 2026 年 5 月 2 日，文章整理於 2026 年 10 月。*

## 同主題的文章

- [信任這件事，我拒絕把它寫成說明書](https://southern-light.dev/blog/futari-trust-not-a-whitepaper/)
- [離開之後還走得回來，那段關係就沒有分成兩章](https://southern-light.dev/blog/futari-leave-must-stay-left/)

<!--
source: oikos | last_sha: b327a79e2bf8f82d7e34970ef12c69312fe4b792
改寫自 issue 14。正文不列 commit。
-->

