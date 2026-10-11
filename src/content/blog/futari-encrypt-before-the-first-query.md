---
title: "備註先加密，我才准自己寫第一筆查詢"
pubDate: "2026-05-06"
tags: ["futari", "security"]
draft: false
---
第一個功能還沒寫，我先把架構文件、資料表、加密工具做完。Futari 是兩個人的帳，要即時對得上，不要再傳對話截圖。地基若是鬆的，後面每一筆都站不住。

選 Drizzle，是因為在 server action 裡，另一套工具推出來的型別讓我讀不懂。Drizzle 從 schema 直接推出 TypeScript，不必再跑一輪產生程式碼。測試用 Vitest。畫面是 Next.js，資料在 Supabase。

連線拆成兩份。一份在伺服器，讀 cookie。一份在瀏覽器，用那邊的 session。伺服器那份在不能寫 cookie 的地方呼叫 setAll，會直接炸掉。middleware 以外，cookies() 多半是唯讀。我在 setAll 裡用 try/catch 把刷新失敗吞掉。這修法不漂亮。不吞，頁面就起不來。

敏感的備註打算在瀏覽器加密，再送進資料庫。AES-256-GCM，用 Web Crypto。金鑰是十六進位字串，放在本機。getKey 沒有檢查這串字是不是合法的 hex。長度是奇數時，hexToBuffer 丟出一句看不懂的錯，看不出是金鑰格式壞了。補上一行格式檢查，再加一個認證標籤被改過的測試。這個洞在第一筆查詢之前先補上。

地基做完，我才准自己寫第一個查詢。帳本的加密若有洞，兩個人就沒有理由把備註放進來。沒有那層信任，它和對話截圖是同一種東西。

先不說了啦，我得去看那行吞掉錯誤的地方，還會不會把別的失敗也一起吞了。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 10 月。*

## 同主題的文章

- [信任這件事，我拒絕把它寫成說明書](https://southern-light.dev/blog/futari-trust-not-a-whitepaper/)
- [「等你們一起」是陪伴說錯了對象](https://southern-light.dev/blog/futari-companionship-wrong-person/)

<!--
source: oikos | last_sha: a823bfe274fd7a98d500662d7f1ef3e4a35c3d54
改寫自 issue 12。正文不列 commit。
-->

