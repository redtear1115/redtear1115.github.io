---
title: "當「樹葉、石頭、剪刀」變成多人戰場——一段 Firestore 跟 Vision API 的纏鬥"
pubDate: "2026-05-11"
tags: ["wildcard", "firebase", "google-cloud", "feature"]
draft: false
---
原本 wildcard 是個我自己玩開心的小東西——拍一張石頭、剪刀、或樹葉的照片（對，原本是雲朵，但你能想像在台北市區到底要去哪拍雲），丟給 Google Vision API 辨識類型，然後跟系統比一場猜拳。問題來了：朋友想加入。「給我一個 link 我也玩」——好啊，能多難。

結果一個「分享連結」改了我兩天。

---

第一個踩雷是 **iOS Safari**——`<input capture>` 只要寫了就強制開相機，連選相簿都不給。最後只好放兩個 hidden input（一個帶 capture，一個不帶），加上一個 segmented toggle 讓使用者切換。三行 HTML 解決一個讓我懷疑人生的問題。

接著是真正麻煩的——把 1v1 改成「一條 link 最多三個朋友來戰」。我的解法是把 challenge 拆成三個 sibling docs（id 是 `${challengeId}_{1|2|3}`），A 端用 `writeBatch` 一次寫三筆，B 端跑一個 `runTransaction` loop 依序 1→2→3 試 slot，撞到別人就退去下一個。三個都滿了，前端跳 modal 說「滿了 sorry」。Race-safe，沒動到 rules、沒動到 indexes，挺爽。

直到我發現一個漏洞——B 點進去看 result 後，可以**直接拿著對手的出招回頭再 claim slot 2 跟 3**。這還玩什麼。Server-side rule 沒辦法看 sibling docs（Firestore rules 的限制），只能 client side 在 transaction 裡讀完三個 slot、檢查 uid 有沒有出現過再決定要不要 claim。不完美，但對一個娛樂 side project 夠了。

---

最玄的一坑藏在 Firestore rules——舊的 create rule 無條件拒絕含 `playerB` 的寫入，但「跟系統打」這條路是 A 自己一次寫好 `playerB.uid = 'system'`。Rule 直接擋掉，前端 `handleSubmit` 又**沒寫 try/catch**，submit 按鈕就這樣卡在 `submitting=true` 永世不得超生。修法是把 create rule 拆成兩個 mutex 分支（pending 或 system battle done），順手補上 catch——一個 bug 兩個層級的鍋，經典。

順便把類型從「雲朵」換成「樹葉」，Vision label 還新增了 `leaves` 跟 `frond`，並把 `tree`、`plant` 這種模糊詞砍掉——之前一根帶葉子的樹枝會被 `tree` 抓走，分類錯到天荒地老。

收工。下次想做「分享連結」之前，我會先深呼吸。

*這段 code 寫於 2026 年 4 月，文章整理於 2026 年 5 月。*

---

<!-- source: wildcard | last_sha: 6e36d81e64d3285303d8d8a302661c7d031b9dad -->
<!-- commits:
- 501faf90bf 2026-04-26T12:53:06Z feat: camera/gallery toggle on Battle page
- aeb1cf64c4 2026-04-26T16:08:11Z fix: system battle creation blocked by rules + silent submit failure
- 5fe9d3ec37 2026-04-27T02:20:20Z feat: leaf type + auth-time nickname + link-error modal + result opponent
- f2a2495ed0 2026-04-27T03:33:10Z feat: shareable battle link supports up to 3 applicants
- 4814d31d60 2026-04-27T03:52:47Z fix: enforce one applicant per user per challenge
- 1bdb9301c9 2026-04-27T04:03:48Z feat: add home link to Battle page header
- 6e36d81e64 2026-04-27T08:04:12Z feat: improve type detection + surface vision labels on miss
-->
