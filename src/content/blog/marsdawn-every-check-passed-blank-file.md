---
title: "每一道檢查都說沒問題，存出來的檔案卻是空白的"
pubDate: "2026-09-25"
tags: ["marsdawn", "devlog", "ai", "testing"]
draft: false
---
9 月 19 日上午 11:49，負責驗收的 AI agent 回報：在付費牆鎖住的視窗裡按「另存新檔」，存出來的檔案是 0 bytes，一個字都沒有。原本的檔案還在，38 bytes 完好，畫面上也沒有任何錯誤訊息。它重開 app 再做一遍，結果一樣。

這是 [MarsDawn](https://marsdawn.southern-light.dev) 開發的第三天。MarsDawn 是我在做的 macOS 上的 Markdown 編輯器（Markdown 是一種用簡單符號排版的純文字格式）。這天的主菜是收費：免費下載、試用 14 天、$4.99 一次買斷，這套模式第一天就定了，付款的程式卻一行都還沒寫。

規則是我定的：試用到第 15 天就結束，打開 app 就直接請使用者付錢；但快速預覽和另存新檔不鎖，文件內容會被付費畫面蓋住，看不到也不能編輯。我也把這句話定成一條硬規定：另存新檔是整個鎖定狀態裡唯一不能壞的東西，使用者在試用期間打的字，要靠它帶走。

寫程式和測試的是一個 AI agent，驗收的是另一個。專案裡有一份寫給 agent 看的工作守則，其中一條是每一包修改在併進正式程式碼之前，都要由沒寫過它的 agent 工作階段實際跑過，測試通過不算驗證。這天驗收的 agent 把 app 的內部測試版真的打開，透過螢幕閱讀器那類輔助工具的介面去點選單、填檔名、按儲存，再去看硬碟上的檔案有多大。

在存出空白檔之前，這個出口還先出過一個問題：寫程式的 agent 寫付費畫面文案時發現，選單裡根本沒有「另存新檔」。底層程式早就放行，也有測試證明，就是沒有地方按得到。

選單補好，驗收一走，就是開頭那個空白檔。

凌晨更新的試用設計文件就提醒過：app 會自動存檔，如果鎖住時藏起內容、讓編輯器回報內容是空的，自動存檔就會拿空白蓋掉使用者的檔案。早上的修改照著這個提醒去防：存檔時先問編輯器內容，編輯器「沒有答案」的話，就改用文件自己保存的那份文字，也附了測試。

漏洞出在測試裡的假資料。那顆測試沒接真的視窗，用一段假回應代替編輯器，給的是「沒有答案」。真正的 app 裡，視窗一打開就被鎖住，編輯器從來沒被填進文字，它回答的是「有，內容是空的」。程式只在「沒有答案」時才改用文件自己那份，空白就這樣寫進了新檔案。一般存檔和自動存檔在鎖住時本來就被擋住，只有另存新檔刻意放行，空白只能從這條路寫出去。

把這一天的檢查排開來，擋在使用者和空白檔之間的至少有三道，每一道都顯示通過。早上那顆測試，驗的是真實世界不會給的答案。寫程式的 agent 為選單附上的證明，是四個測試在拿掉選單項目後都會失敗；驗收 agent 後來指出，這證明的是選單項目在，另存新檔寫出了什麼，四個測試都沒有看。驗收的 agent 自己也漏過一次。它先前驗收早上那個防護時，是讀程式推論鎖住的情況已被擋住，偏偏漏了刻意放行的另存新檔。這次它在回報裡把舊結論一併更正了。它形容這個失敗很安靜，而且看起來像成功。最後抓到問題的，是真的在鎖住的視窗裡存一次檔，再去看那個檔案有幾個 bytes。

寫程式的 agent 寫了一組新測試，這次接上真的視窗、直接檢查存出來的檔案，先在還沒修的程式上跑出空白檔。兩分鐘後的修正換了判斷方式：編輯器要真的被填進過文件內容，才能代表文件回答。所以使用者自己把文件刪到一個字都不剩，照樣可以存成空檔。

驗收的 agent 中午重新驗收，同樣的步驟做了兩次，存出來都是 38 bytes，跟原檔逐位元組比對完全相同。這包修改隨後併進了正式程式碼。付費牆當時只在開了內部開關的測試版裡出現，一般使用者碰不到。

晚上驗收的 agent 又抓到一個相近的地方。當晚寫好的日文介面把清單上的「Remove」翻成「削除」，字串都在，意思卻不對：這個字看起來像要把資料夾從硬碟上刪掉，那顆按鈕只是把它從 MarsDawn 的清單裡拿掉。後來改成「取り除く」，真正會刪東西的 Delete 才留著「削除」。

這件事之後，我會問自己幾個問題。agent 說「做好了、測試都過了」的時候，有沒有人把成品打開來看過？這次測試全過，存出來的還是空白檔。測試裡的假資料，跟真實世界給的一樣嗎？假回應說「沒有答案」，真的編輯器說「有，內容是空的」。

我也會問，我們檢查的是「有沒有報錯」，還是「結果對不對」？存檔時沒有報錯，檔案也真的在硬碟上，只是裡面沒有字。驗收確認的是功能在不在，還是按下去有沒有做到該做的事？那四個選單測試只確認了選單項目在。[第一天](https://southern-light.dev/blog/marsdawn-one-day-security-holes/)那顆拿掉關鍵程式還照樣通過的測試，也是同一類問題。

到這天結束，購買流程只在 Apple 開發工具模擬的商店裡測過。我另外定了一條：送審前要用 Apple 的測試帳號，在真正發給測試者的版本上把整套流程跑一遍。

先不說了啦，我得去用測試帳號，在真正的測試版上把付款流程從頭走一遍。

*這段 code 寫於 2026 年 9 月 19 日，文章整理於 2026 年 9 月 25 日。*

---

<!-- source: mars-dawn | last_sha: 70afe123e9 -->
<!-- source: mars-dawn-kit | last_sha: 725fb6a7f9 -->
<!-- source: marsdawn-mcp | last_sha: 77ea3499c6 -->
<!-- commits:
afba6bf018 2026-09-18T18:28:32Z Make free-trial-plan.md the design of record for #46
b3dd4dae3f 2026-09-18T23:17:07Z Give a file back the byte order mark it came with
ac55296ff0 2026-09-18T23:17:39Z Correct the product IDs: App Store Connect rejects hyphens
99a5db854f 2026-09-19T00:14:07Z Say what LocalizationTests actually checks
e50aed4ec2 2026-09-19T01:10:17Z Merge #57: dim front matter in the editor, and handle a byte order mark
6fd569b476 2026-09-19T01:22:25Z S2a: the write invariant, so a locked document cannot lose work
7c7ae43702 2026-09-19T03:18:52Z S3 plan: every paywall screen, with draft copy for the owner to review
9c0b83a9e9 2026-09-19T03:30:56Z Add Save As... to the File menu, the one way out of a locked window
695ef1ffc4 2026-09-19T03:52:05Z Tests for what Save As... writes, committed before the fix
07aa343330 2026-09-19T03:54:02Z Save As... from a window opened locked wrote an empty file; fix it
c544788c66 2026-09-19T04:38:04Z Test Save As... from a locked window on a file with a byte order mark
7b942c85a1 2026-09-19T05:17:22Z Keep what was shown as a version before any external change, then apply it undoably (#40, option C)
46e7ae0355 2026-09-19T05:17:38Z Merge pull request #74 from redtear1115/s2-save-as
12ac59afba 2026-09-19T05:31:48Z Start marsdawn-mcp: licence, README and ignore file
6c0c7a3931 2026-09-19T05:37:00Z Export Markdown to PDF over MCP by running the marsdawn CLI
4c4931ba81 2026-09-19T05:56:50Z Lock the HTML viewer with the rest of the app (#46, S2b)
083555e2d9 2026-09-19T06:37:50Z Take an external change to a locked file quietly, with no checkpoint and no alert (#40, #78)
ad3993486a 2026-09-19T07:52:25Z Leave an edited document alone when its file has become locked (#40, #78)
906caa5a32 2026-09-19T08:22:54Z Stop a locked page with a request, not a nil-base HTML load (#46, S2b)
95f9f6d721 2026-09-19T08:44:15Z Take a nil base in PreviewWKWebView's data load, so loadHTMLString(_:baseURL: nil) no longer traps (#41)
8c3ed7ed02 2026-09-19T08:59:16Z Merge pull request #42 from redtear1115/fix-optional-baseurl
4c4e85c206 2026-09-19T11:37:36Z Check every source string for a translation, not a hand-written list (#62)
9697011103 2026-09-19T13:42:55Z Test that a clean locked document keeps what it showed before an external change (#40)
f5a65b7e99 2026-09-19T13:50:21Z Keep a checkpoint before a clean locked document takes an external change (#40)
01148cef81 2026-09-19T13:50:30Z Record that both in-app purchases are Ready to Submit (owner, 2026-09-19)
2b41e49861 2026-09-19T13:56:25Z Read the lock from the disk too, so an autosaved document can't miss it (#40)
3966606401 2026-09-19T14:27:56Z Merge pull request #85 from redtear1115/s2b-html-lock
769568fa97 2026-09-19T15:31:36Z Drop the eight allow-list entries the source no longer has
9ff8928e69 2026-09-19T15:47:10Z ja: 取り除く for Remove, ファミリー管理者, and two P4 wordings
70afe123e9 2026-09-19T15:55:02Z Export with automatic signing instead of pinned profiles (#13)
-->

