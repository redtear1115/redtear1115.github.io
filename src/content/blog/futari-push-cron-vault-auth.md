---
title: "我的每日推播 cron 安靜地跑了好幾天——用一個空的 Bearer token"
pubDate: "2026-06-10"
tags: ["futari", "devlog", "supabase"]
draft: false
---
你有沒有過那種 bug——它不會噴錯、不會紅、CI 全綠，它只是「什麼都沒發生」？這種最陰險，因為你根本不知道要去哪裡看。我這次的主角是一個每天該發推播、卻安靜地什麼都沒發的 cron job。

先講背景。我幫 Futari 加了 iOS 推播：APNs device token 在 app 啟動時註冊、一張 `PushTokens` 表存著、一個 `send-recurring-push` 的 Supabase Edge Function 負責用 APNs JWT 把通知推出去，再用 `pg_cron` 每天定時呼叫它。一條看起來很乾淨的鏈。

結果上線後，定期交易該提醒的時間到了——沒動靜。Edge Function 的 log 一看，每一通呼叫都被自己擋下來：401。但 function 本身明明會驗 service role key 啊，我也設了。

卡了一陣子才挖到根因，而且根因不在我的 code 裡。`pg_cron` 那邊的 SQL 是用 `ALTER DATABASE ... SET app.settings.xxx` 把 service role key 塞進 DB 設定，cron 再讀出來當 `Authorization: Bearer`。問題是——**Supabase 在 2024 就把終端使用者 `ALTER DATABASE SET app.*` 的權限收掉了**。所以那行 setup SQL 從頭到尾沒生效，cron 每天拿到的是一個空字串，打出去就是 `Bearer `（後面真的什麼都沒有），Edge Function 當然每通都拒。

誤診的部分老實招：我一開始以為是 APNs 憑證或 JWT 簽錯，盯著 Edge Function 看半天，因為「被拒」的直覺就是想到認證憑證。完全沒想到問題在更上游——**送進來的 token 根本是空的**，function 做的事一點問題都沒有。

修法是改用 **Supabase Vault**：新的 migration 把壞掉的 job unschedule、用同樣的 payload 重排，但 bearer token 改從 `vault.decrypted_secrets` 讀。operator 每個 project 跑一次 `vault.create_secret(...)` 把 key 存進去，取代原本那行根本沒權限執行的 `ALTER DATABASE`。

可遷移的教訓：**當一條鏈「靜默失效」時，先去驗最上游餵進來的值是不是你以為的那個**，不要從最下游的元件開始猜。一個空字串 token 騙過了我好幾層——因為每一層單獨看都「沒壞」。

先不說了，我得去確認其他幾個 cron 是不是也踩到同一個 `ALTER DATABASE` 的雷——這種事從來不會只發生一次啦。

*這段 code 寫於 2026 年 5 月底到 6 月初，文章整理於 2026 年 6 月。*
