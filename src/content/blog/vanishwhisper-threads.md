---
title: "VanishWhisper 在 Threads 裡開，會把使用者的身分整個吃掉"
pubDate: "2026-05-10"
tags: ["vanishwhisper", "devlog", "notes"]
draft: false
---

原因是這樣：Threads / Instagram / Facebook / LINE / WeChat / TikTok / X 這些 app 都用自己的 sandboxed webview 開外部連結。在那個 webview 裡寫進 IndexedDB 的東西——你的 RSA private key、所有 session、所有 contact——通通只活在那個 sandbox 裡，使用者下次在 Safari 或 Chrome 開同一個網址時，**完全拿不回來**。對一個訊息會消失的 app 來說，這體驗太黑色幽默了：連身分都會跟著消失。

所以我加了一個 in-app browser banner，用 UA allow-list 偵測（不用「沒 Safari token 就是 in-app」反推，因為這樣會把每個裝了 PWA 的使用者全打成偽陽性，要再用 `navigator.standalone` 跟 `display-mode: standalone` 把 PWA 排除掉）。Banner 直接釘在 `.app-shell` 頂端，第一個 paint 就看得到，附一個「複製連結」按鈕讓使用者貼到真正的瀏覽器——比起跟每個 app 的「在外部開啟」子選單搏鬥，這樣快很多。

順便做了一輪 Vue component 抽取——popover、secondary page、avatar、invite share button 全部抽成 shared utilities，CSS bundle 從 41.29 縮到 37.82 kB（-8%），ProfileView 少 30% 的行數，CreateSessionView 直接砍了 57%。然後我終於把那隻吉祥物 watermark 的 opacity 從 5% 拉到 12%，因為 5% 在 radial gradient + grain 的底層上面根本看不見——有人回報說「mascot 在哪？」我才發現我是把它畫了個寂寞。

身分會消失沒關係，吉祥物要看得見。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。*

---

<!-- source: vanishwhisper | last_sha: b43b493c7e73ff792bdbb4a924830f1ea3b42af5 -->
<!-- commits:
- b4d4eb750aff2830ac7463be5331700f43569ff0 2026-05-01 bump gutter mascot watermark opacity 0.05 → 0.12
- 4b28bd5b81bde30d0ca0e16b44c37f2b57267f22 2026-05-01 extract popover / secondary-page / avatar / invite-share into shared utilities
- de7bbbe005574f99d478d03c4c3e99e9d3d223be 2026-05-01 warn when loaded inside an in-app browser
- b43b493c7e73ff792bdbb4a924830f1ea3b42af5 2026-05-01 gitignore .claude/ (per-developer Claude Code state)
-->
