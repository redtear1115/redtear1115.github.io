---
title: "我把一張裝著六種愛物的表單拆成六張，五天後發現每一張都抄著同一段"
pubDate: "2026-11-07"
tags: ["futari", "devlog", "refactoring"]
draft: false
---
Futari 是給兩個人一起記生活帳的家計簿。帳本旁邊有一頁叫「愛物」，記家裡一起照顧的東西：車、房子、孩子、寵物、植物，那時候保單也放在這裡，每一筆花費都能掛在對應的那一樣底下。這個名字怎麼來的，我在[〈Futari 裡記孩子、寵物和植物的那一頁，我一開始叫它「資產」〉](https://southern-light.dev/blog/futari-1/)寫過。

在愛物頁新增或修改一樣東西，畫面下方會拉出一張表單。車要填車牌和油種，孩子要填生日，保單要填保費、要保人和被保人，房子要填地址。六種愛物，一開始共用同一張表單，程式也寫在同一個檔案裡。

這個檔案是 5 月 5 日清晨六點寫的，那時候只能新增車。接下來一週，其他幾種一樣一樣加進來，每加一種，就在同一個檔案裡多開幾個欄位。到 5 月 12 日早上，它有 1517 行，裡面要記住的狀態有 49 個，從外面傳進來的參數有六十多個，大部分只有其中一種愛物用得到。改一種愛物，得先看懂另外五種，怕碰到哪個大家共用的東西。

那天晚上八點十一分，我開了一張單子，寫要把它按愛物種類拆開。計畫寫得很清楚：外面留一個很薄的殼，只負責決定現在該顯示哪一種；車、孩子、寵物、植物、房子、保險各自一張，自己管自己的欄位，自己存檔；兩種以上會用到的零件，放進一個共用的資料夾。這次只搬家，不改行為，也不改畫面。

二十三分鐘後，八點三十四分，拆好合併。外殼只剩 58 行，六張表單各自獨立，共用資料夾裡放著名稱欄、日期欄、備註欄、刪除前的確認這幾樣。拆之前那個檔案在下午又長了一點，變成 1583 行；拆完，所有檔案加起來是兩千一百多行。程式總量變多了，但我那時候覺得很值得，每一張表單只認識自己那一種，下次要加第七種愛物，不用再擔心碰壞另外六種。

五天後，5 月 17 日晚上八點多，一份掃過整個前端的程式碼健檢報告出來。裡面列了十六條，其中一條就是這六張表單：每一張都各自記著名稱、備註、有沒有送出這些狀態，各自重寫了一遍同樣的版面和同樣的流程。

那一段在六張表單裡幾乎一模一樣。表單一打開，先把名稱、備註和錯誤訊息清空，等 0.35 秒，再把游標放進名稱欄；按下存檔，先讓按鈕轉圈，出錯了就把錯誤翻成看得懂的話顯示出來；刪除也是同一套。每一張大約三十五行，抄了六份。

拆的那天，共用資料夾裡放的，都是看得見的零件，名稱欄長什麼樣、日期欄長什麼樣。看不見的那一段，打開時要清什麼、要等多久、存檔失敗怎麼辦，沒有被當成零件，就跟著每一張表單各複製了一份。單子上寫得很明白，兩種以上會用到的放進共用，這一段六種全都用到，只是它不長在畫面上，拆的時候誰也沒把它挑出來。

六張表單分開才五天，有幾張已經長大了。保單那一張拆的時候四百多行，報告出來時是 517 行。

當天晚上九點四十二分，這一段抽成一個共用的小工具。六張表單各自只留自己的欄位，車留車牌，房子留地址，打開、存檔、刪除的那套流程交給共用的那一份。六張加起來少了 152 行，新的小工具 128 行，淨省 24 行。省下來的行數沒多少，換到的是以後要改「打開表單等多久」，只要改一個地方。

同一次修改裡還留了一件沒處理的事。報告建議另外做一個把標題、輸入框和錯誤訊息包在一起的欄位零件，查了才發現它早就在共用資料夾裡了，只是房子那一張沒用它，自己用了另一種圓角的樣式。要不要統一，修改紀錄寫著交給設計師決定。

如果家裡也有幾樣一起照顧的東西，想跟生活帳放在一起記，可以到[作品集](https://southern-light.dev/works/)找到 Futari 試試看。它的程式碼放在 [GitHub](https://github.com/redtear1115/oikos)。

先不說了，我得去看看還有哪一段看不見的流程，在好幾個地方各抄了一份。

*這段 code 寫於 2026 年 5 月 12 日至 17 日，文章整理於 2026 年 11 月。*

<!-- source: oikos | last_sha: bde5fd1 -->
<!-- commits／issues（台北時間）:
7c04023 2026-05-05 06:00 feat(ui): AssetSheet bottom sheet for car create/edit/delete（AssetSheet.tsx 第一個 commit）
3bc61a3 2026-05-12 08:55 fix(add-sheet): UX polish（此時 AssetSheet.tsx 1517 行；useState( 49 處、useEffect( 1 處）
oikos issue #189 2026-05-12 20:11 開立「[refactor] AssetSheet.tsx 按愛物類型拆 body component」（1517 行、64 個 useState／useEffect、prop interface 60+ optional 欄位；shared/ 放 2 種以上 body 出現的 UI 原子；純結構搬移）
90ca92f 2026-05-12 17:27、32f5a66 18:48 保險相關合併（AssetSheet.tsx → 1583 行）
54c7d51 2026-05-12 20:34 Merge PR #191 refactor/asset-sheet-split（+2128／−1583；index.tsx 58 行；shared/ DateField、DeleteConfirmFlow、Field、NameField、NotesField、SheetShell；InsuranceSheetBody 414 行）
oikos issue #512 2026-05-17 20:39 開立「refactor: frontend code review findings (v1.0.4)」第 6 條 "Asset sheet bodies share boilerplate but no extracted primitives"（InsuranceSheetBody 517 LOC 等）；23:05 關閉
bde5fd1 2026-05-17 21:42 refactor(ui): extract useAssetSheetCommon for all 6 SheetBodies (#512)（"~35 LOC scaffolding … Six near-identical copies"；350ms focus timeout；−152 LOC bodies，+128 hook，−24 net；FormField 已存在為 shared/Field.tsx，HouseSheetBody 用 rounded-xl 另一種樣式，"left to the designer"）
-->
<!-- 改寫補充：原稿「1517 行看過一次就放棄、過了一個月才回來收」不符：AssetSheet 5/5 才建立，拆檔是一週後。原稿「64 個 useState call」：issue 寫的是 useState／useEffect 合計 64，實際 useState( 呼叫 49 處，正文用 49。原稿另寫的 past-times 跨群組、SQL 條件 helper、auth 樣板、PartnerQuiz、v0.15.1 iOS Safari 修補依一篇一個故事拿掉；past-times 那段與已發佈的「分開以後」系列題材重疊。5/13～5/17 健檢與抽共用工具是事後的事，原稿沒有，依 commit 補進。 -->

