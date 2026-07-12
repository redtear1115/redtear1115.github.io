---
title: "那把錯的 key 鎖死了 prod 的車牌，而正確的 key 我「拿不出來」"
pubDate: "2026-06-10"
tags: ["futari", "devlog", "security"]
draft: false
---
你有沒有過那種，bug 的根因你早就猜到了，但「修它」這件事本身卡在一個你完全沒料到的地方？我這次就是——我知道 prod 的車牌是用錯的 key 加密的，但我發現我**根本拿不到那把對的 key**。

事情是這樣。`revealCarPlate` 在 prod 一點就炸，dev 卻一路正常。錯誤訊息還是 Next.js 在 production 自動消毒過的那種沒營養版本——「An error occurred in the Server Components render」，等於什麼都沒說。我先補了一段 `Sentry.captureException` 把真正的 error 撈出來，才看到真面目：`Unsupported state or unable to authenticate data`。AES-GCM 解不開，典型的 key 對不上。

接著是這次最關鍵的一步診斷：我拿 **dev key** 去解 prod 資料，發現它**解得開車牌跟地址**（6 個車牌、1 個地址），但解不開小孩姓名、身分證那些欄位；prod 的 runtime key 剛好相反。一翻兩瞪眼——車牌跟地址是當初那支 backfill script 用 dev key 寫進去的，其他欄位走正常 app path 用 runtime key，所以只有那兩欄壞掉。

根因清楚了，麻煩才開始。要把那兩欄 re-key（dev key 解開 → prod key 重加密），我得**同時拿到兩把 key**。但 prod 的 `ENCRYPTION_KEY` 在 Vercel 是 Sensitive var——設下去就再也拉不出來，本機 script 拿不到。

繞法滿邪門的，但很乾淨：我寫了一個一次性的 admin endpoint，讓 re-key **在一個帶著那把 key 的 deployment 裡面跑**。preview deployment 連的是同一個 prod DB、也帶同一把 key，所以我從一個 preview URL 打這支 endpoint，key 從頭到尾沒離開過 runtime。再加上 `REKEY_ADMIN_TOKEN` timing-safe 比對、dryRun 預設 true、還有 pre-flight 先驗 runtime key 真的解得開一筆 app 寫的資料才動手——不對就直接 abort，絕不亂寫。

教訓很簡單但很貴：**「無法匯出」對 secret 是優點，對你要修資料的那天是惡夢**。Sensitive var 救了我不會手滑外洩 key，也逼我把修復邏輯搬進 runtime——結果反而是更安全的修法。

先不說了，我得去把那支 endpoint 砍掉了——一次性的東西留在 codebase 裡，遲早會變成下一篇翻車記的主角啦。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 6 月。*
