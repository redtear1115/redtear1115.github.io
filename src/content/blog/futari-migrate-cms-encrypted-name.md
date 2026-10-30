---
title: "七頁搬家說明併成一頁的那天下午，簡單記帳那頁少了它最重要的一段"
pubDate: "2026-10-30"
tags: ["futari", "devlog"]
draft: false
---
Futari 是給兩個人一起記生活帳的家計簿。想換過來的人，多半已經在別的記帳 app 裡記了好幾年，所以網站上有一排「從某某 app 搬過來」的說明頁，一個 app 一頁：先講 Futari 跟它差在哪，再教怎麼把舊帳匯出、匯進來，最後是幾題常見問題。

5 月 30 日早上八點半，這排頁面多了 Moneybook、AndroMoney、Mobills 三頁，九點二十分再加上 Manebo，一共七頁。每一頁是一個獨立的檔案，長得幾乎一樣，差的是 app 的名字和那張比較表。光是那三頁，四種語言的文字檔加起來就多了一千多行。

同一個早上，另一條線在做比較難的事。有些記帳 app 根本沒有匯出功能，舊帳只能一頁一頁截圖。九點二十七分，「簡單記帳」那頁先試做：教人把截圖丟給 ChatGPT，請它整理成固定格式的表格，再匯進 Futari。頁面上有一段分步驟的教學，附一段可以一鍵複製的提示詞。Futari 這邊也學會認這種表格，看開頭那排欄位名稱，就知道它是照這套方法做出來的。

下午一點二十五分，我寫下一份設計文件，裡面算了一筆帳。每多一個 app，要改四個語言檔，合計八百到一千兩百行；有五處型別定義要記得補，漏一處，整個網站就建不起來；最後還要再開一個頁面檔。行數最多的是比較表。Futari 有沒有雙人分帳、對方有沒有，這種事不會因為讀的人用中文還是日文而不同，卻用四種語言各寫了一遍。

一點四十七分到兩點零九分，整個搬完。所有 app 的事實集中到一份清單，一百一十九行。四個語言檔刪掉八百六十九行比較表。七個頁面檔刪掉，換成一個一百七十二行的共用頁面，照著清單長出每一頁。網站地圖、頁面之間的互相連結，也改成讀這份清單。設計文件替這次搬家定的目標，是頁面看起來跟搬之前一模一樣。

兩點十五分，簡單記帳那條線先合進了主線，帶著它自己的頁面檔。搬家這條線要合進來時，兩邊撞在一起。簡單記帳也是一個 app，照新規矩該進清單、用共用頁面，它自己的頁面檔就刪掉了。兩點四十一分的合併紀錄寫得很完整：清單加了一筆，四種語言的文字補齊，截圖教學的元件也搬了過來，四十一個跟頁面和搜尋設定有關的測試全過。三點二十三分，這些一起進了主線。

少掉的東西，在那份紀錄裡看不出來。截圖教學那一段，原本是寫在簡單記帳自己的頁面檔裡叫出來的。頁面檔刪了，元件還在，共用頁面卻沒有任何一行去叫它。所以主線上的簡單記帳頁，比較表、步驟、常見問題都在，偏偏少了「怎麼把截圖變成表格」那一段，而這一頁會存在，就是為了那一段。

另一處少的是 Futari 認表格的規則。合併時只留下「有這種表格」這個名字，用來辨認它的那排欄位名稱沒跟過來，照教學做出來的表格，會被當成一般的表格，沒辦法自動對上。

四十一個測試全過是真的，它們檢查的是頁面和搜尋設定。管匯入的測試裡，有兩個在合併之後是紅的。

發現的是下一批工作。三點四十八分，要補上另外五個同樣不能匯出的 app：記帳城市、CashMan、1Money、iCost、隨手記。這是新做法第一次真的被拿來用：清單多五筆，共用頁面多五行，截圖教學接回共用頁面，只在清單標了「這個 app 要走截圖」的那幾頁出現。欄位名稱的規則也補了回去，那兩個紅掉的測試轉綠。三點五十七分合進主線，離少掉那段進主線，三十四分鐘。

那五個 app，四種語言的文字加起來還是寫了一千多行。設計文件說，以後加一個 app 只剩「清單一筆，加上翻譯」，可翻譯那一半沒有變少，每一頁的開場、步驟和問答，還是得用四種語言各寫一次。真正省掉的，是比較表、頁面檔，和那五處很容易漏的型別。

那天下午兩條線各自都做對了。一條把七頁併成一頁，一條教人從截圖搬家。出事是在兩條線交會的那一下：一個元件被搬進了新家，新家裡卻沒有人叫它出來，而當時跑的測試，沒有一條會去看那一頁上有沒有它。

Futari 在[作品集](https://southern-light.dev/works/)裡，網頁和 iPhone 都能試，程式碼放在 [GitHub](https://github.com/redtear1115/oikos)。

先不說了，我得去把清單裡那幾頁標著「等母語者校對」的英文和日文看一遍。

*這段 code 寫於 2026 年 5 月 30 日，文章整理於 2026 年 10 月。*

<!-- source: oikos | last_sha: 05fada0 -->
<!-- commits（台北時間）:
a98cd55 2026-05-30 08:31 feat(migrate): #839 P1 — Taiwan export-CSV migrate pages (Moneybook/AndroMoney/Mobills)（三個 page.tsx 各 96 行；四語 locale +1,051 行）
0ae3f2e 2026-05-30 09:20 feat(seo): add /migrate/manebo page + structured data improvements
3b87ab5 2026-05-30 09:27 feat(migrate): #839 P2a — futari_generic ChatGPT-CSV parser + 簡單記帳 pilot（MigrateChatgptWorkflow：分步驟＋一鍵複製 prompt；detector 以 `kind` 欄位的 header signature 辨認）
7b83173 2026-05-30 13:25 docs: add migrate CMS architecture spec（「4 locale files (~800–1200 lines total), 5 TypeScript union type definitions, and a new page file」；「pages render identically after refactor」）
4e16e3e 2026-05-30 13:47 feat: add lib/migrate/sources.ts（+119）
1bdc306 2026-05-30 13:54 refactor: strip comparison data from all locale files（−869）
16882ef 2026-05-30 14:03 feat: add dynamic migrate/[source]/page.tsx（+172）
7142a0b 2026-05-30 14:05 refactor: derive migrate paths + detector types from MIGRATE_SOURCES（sitemap）
0bc71e7 2026-05-30 14:09 refactor: delete 7 individual migrate page files（−750；andromoney/cwmoney/honeydue/manebo/mobills/moneybook/spendee）
352476a 2026-05-30 14:15 Merge PR: feat/migrate-chatgpt-csv（簡單記帳 pilot 進主線）
d8e544e 2026-05-30 14:41 chore: resolve merge conflicts — integrate simple-daily-money into CMS architecture（刪 simple-daily-money/page.tsx；「All 41 i18n-seo tests pass」）
581843a 2026-05-30 15:23 Merge PR: feat/seo-1.3.2（含 d8e544e，CMS 重構進主線）
f554f58 2026-05-30 15:48 feat(migrate): #839 P2b — 5 screenshot-workflow apps + fix unwired workflow & detector（「MigrateChatgptWorkflow was added but never rendered — so simple-daily-money shipped WITHOUT the screenshot workflow」；「futari_generic header signature was dropped (only the type survived)」；「Both merged-but-failing csvImport tests now pass」；`screenshotWorkflow` flag；sources.ts +75、page +5、四語 locale 約 +1,054；en/ja「TODO pending native review」）
8fc7566 2026-05-30 15:57 Merge PR: feat/migrate-tw-screenshot-pages
05fada0 2026-05-30 16:16 chore: release v1.3.2
-->
<!-- 改寫補充：原稿前半「孩子全名加密」與已發佈的加密系列、待審的 PII 鑰匙那篇重疊，依一篇一個故事拿掉。另一篇舊稿（slug blog-2026-05-30-migrate-use-case-data-driven，同一件事的設計說明）事實併入本篇，建議跳過。那篇的 sources.ts 範例（features／weaknessKey／csvExportPath）與實際 spec 不符，實際是每列帶中文標籤的 comparison rows；「新增一個頁面只要 15–20 行加幾句翻譯」也不符，下午五個 app 的翻譯仍有一千多行。「主線」指 main 分支；main 是否在 15:23–15:57 之間已部署到正式站，未查證，正文不寫「上線」。 -->

