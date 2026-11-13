---
title: "只多列兩個檔名，agent 每次開工的固定開銷翻了一倍多，這筆帳卻是假的"
pubDate: "2026-11-13"
tags: ["ai", "devlog", "performance", "architecture"]
draft: false
---
[docgrad](https://github.com/redtear1115/docgrad) 是我寫給 Claude Code 用的小工具，替一個 repo 的文件打分數。它把文件當成 agent 開工要讀的東西來看：寫得全不全、跟程式碼對不對得上，還有一項叫經濟性，量 agent 每次開工都會自動讀進去的文件有多長。長度用 token 算，那是 agent 讀文字的計量單位。超過 20,000 就是最低的一顆星。

這項是 9 月 13 日凌晨將近一點才加進去的。一個小時後，agent 在 Futari 的 repo 開了一張票：根目錄有兩份文件，PRODUCT.md 和 DESIGN.md，動 UI 之前規定要先讀，加起來 49KB，docgrad 從來沒檢查過它們。設定檔只收 docs 資料夾，這兩份站在外面。

要收進來應該很簡單。

先試把這兩個檔名寫進收資料夾的欄位，當場報錯，它只吃資料夾。改成把整個根目錄當資料夾收，docs 底下的東西會被算兩次，根目錄還躺著 agent 開工用的暫存資料夾，換一台電腦分數就不一樣。

最後列進 `entry_files`，也就是「每次開工都會讀」的那一欄。收得到，分數也跑得出來，什麼錯都沒報。可是固定開銷從 9,037 跳到 21,474，經濟性從三顆星掉到一顆星。

多出來的 12,437 個 token 剛好是那兩份文件的長度，而 agent 平常根本不會讀它們。這兩份只有動 UI 才要看，修一個記帳的 bug 不會碰到。設定檔說每次都讀，實際上不讀，工具就照設定檔算了一筆沒發生過的開銷。docgrad 自己的稽核規則還寫著，列出來的檔案要真的每次都載入，對不上要扣分。走這條路，等於用一個灌水的數字換一個永久扣分。

三條路都試過，才看出缺的是一個欄位。docgrad 只分得出「每次都讀」和「在資料夾裡」，沒有「不在資料夾裡，偶爾才讀」。

差別在什麼時候載入，跟文件重不重要沒有關係。PRODUCT.md 很重要，Futari 動 UI 之前一定要讀，可是它不該算進固定開銷。

v1.4.0 加了 `docs_files`，凌晨三點四十分 commit。放進去的單檔算一般文件，收進評分，不算固定開銷。拿 Futari 實跑，收進來的文件從 46 份變 48 份，固定開銷停在 9,037。上午 11 點合併，十分鐘後 Futari 那邊就用上了，標了日期的文件比例掉了將近四個百分點，兩份新文件都沒標日期，這筆是真的。

兩個欄位都收得到檔，填錯不會報錯，只會讓那個數字悄悄歪掉。所以這條判準寫進了 `init` 的問卷，不讓人靠猜。

PR 的說明最後列了「已知但未處理」，其中一條是：如果有人把 `docs_files: PRODUCT.md` 少寫了方括號，程式會把這串字一個字元一個字元當成路徑去找，每個都找不到，一個檔都沒收，也沒有錯誤訊息。症狀只有數字不動。

agent 寫這段的時候，還留了判斷：單獨替新欄位加檢查，會跟其他欄位不一致，整批留到下一版。PR 就這樣合併了。半小時後，這條變成一張票，理由是另一個 session 讓 agent 手寫設定檔，少方括號是很自然的錯。12 點 10 分修好，所有列表欄位寫錯都會當場報錯。

那天做 `docs_files` 就是為了對付一個不報錯的數字，同一個欄位的另一種寫法，也是一個不報錯的數字。它被抓到，因為 agent 把沒修的事寫下來了。

Futari 後來幾天的文件收斂，寫在[另一篇](https://southern-light.dev/blog/futari-docs-audit-three-more-rounds/)。其他作品在[作品集](https://southern-light.dev/works/)。

先不說了，我得去看看其他 repo 的 `entry_files`，裡面列的檔案是不是真的每次都讀。

*這段 code 寫於 2026 年 9 月 13 日，文章整理於 2026 年 11 月。*

<!-- source: docgrad（redtear1115/docgrad）、oikos（FREEDOMPJ2025/futari），台北時間 | last_sha: 48f3d1a -->
<!-- commits:
9cb4f08 2026-09-13 00:54 feat!: 新增第六維「經濟性」（#29 00:57 合併）
961f335 2026-09-13 03:40 feat: 新增 .docgrad.yml 欄位 docs_files
da16592 2026-09-13 03:40 chore(release): v1.4.0
48f3d1a 2026-09-13 11:00 Merge PR #34（03:44 開）
84c3390 2026-09-13 12:10 fix(lib): list and boolean config fields fail loudly（#38）
oikos f9a8074 01:07 docgrad init；b3f237b 11:10 用 docs_files 納入 PRODUCT.md／DESIGN.md，新鮮度 93.48%→89.58%
-->
<!-- oikos issue #1087 2026-09-13 01:57 開，11:33 關；docgrad issue #38 11:30 開，19:15 關 -->
<!-- 數字：CHANGELOG 1.4.0、PR #34。PRODUCT.md 4,378、DESIGN.md 8,059 tokens；9,037→21,474；files 46→48。oikos commit 當時量到 entry_cost 9,209（CLAUDE.md 改過），正文用 docgrad 實測的 9,037 -->
<!-- 改寫說明：原稿開場的 scorecard 盯著看三十秒、repo 另外幾個過 10,000 的預感查不到，拿掉；五支腳本、星等全表、安裝教學、測試數拿掉；#1087 另有 Impeccable 整檔重寫與 loop 撞車的議題，不屬於這個故事，未寫。入口成本題材與已發佈 #110 不同：那篇是畢業門檻沒人裝，這篇是 schema 少一個欄位。 -->

<!-- Ray 11/06 核准。 -->
<!-- Co-authored-by: Claude <claude@southern-light.dev> -->

