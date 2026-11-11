---
title: "What's New 每句都驗過了，App Store 擋下的是一對角括號"
pubDate: "2026-11-11"
tags: ["marsdawn", "release", "ai", "devlog"]
draft: false
---
[MarsDawn](https://marsdawn.southern-light.dev) 是我做的 Mac 版 Markdown 編輯器，左邊寫、右邊看預覽，寫完可以匯出 PDF。10 月 27 日早上要送審 1.2.0，送審前最後一步，是把「新功能」那段說明，也就是 App Store 上的 What's New，用腳本一次寫進十個語系。

腳本收到的回覆是一個 409，原文是英文，意思是：德文版的 What's New 不能包含標記語言，例如 HTML 標籤。

我第一個反應是去找德文哪裡寫錯了。德文沒寫錯。最後一行寫的是字數統計不再算進收合起來的 `<details>` 區塊。`<details>` 是 Markdown 裡可以收合一段內容的寫法，MarsDawn 從上一版開始支援，這一版修了它的字數。對寫 Markdown 的人來說，這就是那個功能的名字。對 App Store Connect 來說，角括號包著一個英文字，就是 HTML 標籤。

被點名的只有德文，可是十個語系的最後一行都寫著同一個 `<details>`。好在那一次什麼都沒寫進去，重跑試算，十個語系都還在等著更新。

這份 What's New 前一天才做完，經手的人不少。我在 GitHub 開票請 Grok 寫，Grok 寫了英文和繁中，其他語系是機器翻譯。我核准兩件事：一個 `\n` 的範例在 Grok 的回覆裡變成了真的換行，十個語系都要改回來；Grok 多寫的一行換行設定說明可以留著。Claude 把它整份用程式讀進檔案，不重打，再交給另一個 agent 驗證。第一輪驗證抓到一句錯的：原文寫按 ⌘E 會搜尋選取的文字，其實 ⌘E 只是把選取的字放進搜尋欄，不會開始搜尋。改完第二輪通過。每個語系的字數也算過，最長的法文 3,463 字，離上限 4,000 還有距離。

清晨五點的發版檢查也是綠的，兩台機器把一千四百多顆測試跑過一遍，What's New 寫到的功能，在要送審的那個 build 上實際點過。

查了這麼多，查的都是「這句話對不對」：選單名稱跟 App 裡的字一樣嗎，快捷鍵真的會做那件事嗎。沒有人問過商店收不收角括號。這條規則不在我們任何一份文件裡，它在 App Store Connect 那邊，要真的送過去才會知道。

上一版 1.1.1 介紹同一個功能時，寫的是「可收合的 details 區塊」，沒有括號，所以送得過。那是寫的人剛好沒加，跟任何檢查都沒有關係。

七點三十八分，Claude 把十個語系的 `<details>` 換成不加括號的 details，用腳本換，並確認剛好換了十處，再在檔案開頭的註解寫明為什麼。我回了「好 可以」，七點五十三分合併。

同一分鐘它還開了一張新票：之後試算的時候就先擋下來，What's New、商店描述、宣傳文字裡只要出現角括號後面接英文字母、斜線或驚嘆號，就不准送。試算和發版腳本的測試這次都沒抓到它，那張票要補的就是這個缺口。今天早上這張票還開著，檢查還沒寫。

八點十二分，1.2.0 合進主線。八點四十六分，帶著十個語系的 What's New 送審。

驗證能擋下的，是我們知道要查的東西。這條規則寫在別人的系統裡，這次得送過去一次才看得到。

MarsDawn 在[作品集](https://southern-light.dev/works/)裡。

先不說了，我得去看那張票什麼時候有人接。

*這段 code 寫於 2026 年 10 月 27 日，文章整理於 2026 年 11 月。*

<!-- source: redtear1115/mars-dawn（台北時間） -->
<!-- issue #484（2026-10-26 16:37 開）Mac 1.2.0 What's New，請 Grok 寫；Grok 回覆 17:00 -->
<!-- 57c8350 2026-10-26 22:48 docs: What's New for Mac 1.2.0 (#484, #299)；d195fa0 22:56 ⌘E sets the search text, it doesn't search (#486 verify)；PR #486 23:06 合併，round 2 CONFIRMED；Ray 核准「1. 你修吧 2. 保留」；字數 en-US 3019、fr-FR 3463（上限 4000） -->
<!-- issue #489 2026-10-27 05:01 Release gate 1.2.0 CONFIRMED（MBA offscreen 1479/1502、Mini screen 20） -->
<!-- PR #494 2026-10-27 07:38 開、07:53 合併：asc.py whats-new 1.2.0 --apply → HTTP 409（German must not contain markup language），10 個語系最後一行 <details>；nothing was written；Ray「好 可以」；5ee9a10 07:38 -->
<!-- issue #495 2026-10-27 07:39 開：dry run 與 release-script tests 沒抓到，要在 dry run 擋 < 接字母、/、!（之後由 PR #535 於 10/30 18:33 合併，屬事後，正文不寫） -->
<!-- PR #493 Release 1.2.0 2026-10-27 08:12 合併（f0b0192，tag 1.2.0）；#489 comment 08:46 送審 build 12，What's New 10 locales (#486, #494) -->
<!-- docs/release-notes/1.1.1.md 寫「Collapsible details sections」，無角括號 -->

<!-- Co-authored-by: Claude <claude@southern-light.dev> -->

