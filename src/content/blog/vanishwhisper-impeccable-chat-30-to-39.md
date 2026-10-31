---
title: "第一則訊息消失的時候，新來的人會以為是自己按壞了"
pubDate: "2026-10-31"
tags: ["vanishwhisper", "devlog", "design"]
draft: false
---
VanishWhisper 是一個不用登入的悄悄話網頁。產生一條邀請連結，用自己習慣的管道傳給對方，對方點開就能聊，訊息在對方讀過之後自己消失，內容從頭到尾加密，伺服器看不懂。

5 月 29 日晚上，我請一個 AI 設計評審看聊天頁。它會照十條常見的易用性原則各給零到四分，再挑出最該修的地方。九點十分，第一份報告出來：四十分拿三十分，三個要優先處理的問題。

分數高的那幾項，畫面本身。對方讀了訊息，小標籤從紫色翻成薄荷綠；剩下的時間寫成「大約還有五分鐘」，不是一串倒數的秒數；最具破壞性的「雙方都刪除」，要兩個人都同意才會執行。分數低的是另外兩項：出錯了怎麼辦，一分拿兩分；說明和引導，零到四分裡拿一分。

報告的總評是一句話，翻成中文大概是：看起來很成熟，出事的時候卻像個原型。

三個優先問題裡，第一個我讀了很久。它設想一個第一次來的人，對方傳來的第一則訊息讀完就消失了，他會以為東西壞了，或是自己按錯了什麼。訊息消失時有一段動畫，動畫確實在教人「這裡的話會消失」，只是要等它發生的那一刻才教，對第一則訊息來說已經太晚。

這件事我自己永遠碰不到。我知道訊息會消失，這是我想做這個網頁的原因。我每次打開聊天頁，都是帶著這個前提進去的，所以第一則訊息消失時，我從來沒有懷疑過任何東西。

另外兩個問題也是同一種盲點。傳送失敗時，畫面上跳的是一行英文的系統錯誤，意思是「權限不足」，沒有重試的按鈕，剛打的字得整段重來。選照片時手一滑選錯了，按下去就直接送出，沒有預覽；等想到要收回，對方可能已經讀完，照片也跟著消失了。這是一個只說一次、說完就沒有的網頁，貼錯照片的代價，比多按一下確認高很多。

那天晚上的修改，是照著報告一條一條做的。

第一次打開聊天頁，會先跳一個小提示，講清楚這裡的訊息讀完就會消失，送出第一則之後提示自己收起來，之後不再出現。標示「端對端加密」的小徽章原本只是一個標籤，現在點得下去，會用白話說明誰看得到訊息、伺服器又看得到什麼。選單裡的「隱藏訊息」和「請求刪除」，各多一行字說明按下去會怎樣。被消失的那則訊息，在回覆裡原本顯示成冷冰冰的「訊息已消失」，換成口氣比較軟的「這則已經消失了」。

錯誤訊息改成看得懂的話，旁邊多一顆重試，按下去送的是當初失敗的那一則，就算在出錯的空檔裡又繼續打字，也不會送錯。有些錯誤重試幾次都沒用，例如權限不足，那顆按鈕就不出現，不假裝還有救。打到一半的字會先存著，切去別的 app 再回來，字還在。選完照片會先放大預覽，標著檔案多大，送出和取消兩顆按鈕都放在拇指搆得到的地方。

還有一個顏色。所有輸入框裡的提示字、訊息旁的時間，用的是同一個暗紫色，跟背景的對比只有二點八五比一，連最基本的易讀標準都沒過。顏色維持同一族紫，調亮一點，變成五點二三比一。

九點二十分，第二份報告出來，三十九分，沒有任何需要優先處理的問題。說明和引導從一分升到四分，出錯怎麼辦從兩分升到四分。

兩份報告相隔十分鐘，都是同一個評審。第一份報告裡寫著，它沒有打開瀏覽器去看畫面，因為聊天頁要先有一段對話才進得去，那時候也沒有開測試用的伺服器，它是讀程式碼打的分。第二份報告也沒有提到打開過畫面。三十九分說的是：照它讀到的程式碼，一個第一次來的人應該不會再以為東西壞了。

這句「應該」，還是要有一個真的第一次來的人才能確認。我能做的，是把那個人會怎麼想先寫下來。那天晚上我也替這個網頁補了兩份文件，一份寫它是給誰用的，一份寫畫面上的規矩，下次再請評審來看，它不用從顏色和程式碼去猜我想做什麼。

第二份報告最後還列了三個小問題，其中一個是：那個只出現一次的提示，關掉之後就再也叫不出來了，忘記的人沒有地方再看一次。

VanishWhisper 為什麼不要登入頁，我在[這篇](https://southern-light.dev/blog/vanishwhisper-no-login/)寫過。它的程式碼放在 [GitHub](https://github.com/redtear1115/vanishwhisper)，我其他的作品在[作品集](https://southern-light.dev/works/)。

先不說了，我得去替那則只出現一次的提示，找個能再叫出來的地方。

*這段 code 寫於 2026 年 5 月 29 日，文章整理於 2026 年 10 月。*

<!-- source: vanishwhisper | last_sha: a55dff3 -->
<!-- commits（台北時間）:
d6b4f92 2026-05-29 21:31 set up impeccable design context — PRODUCT.md / DESIGN.md / live config
0dd2d79 2026-05-29 21:32 design tokens — lift --vw-text3 to AA（#6B4D8A 2.85:1 vs bg → #9676BB 5.23:1；hue 約 264°）, z-layer scale, 44px hit areas
bbc3545 2026-05-29 21:32 touch / viewport / voice sweep across home, profile, secondary, session row
a9793fc 2026-05-29 21:32 chat surface design pass — vanish onboarding（first-time tooltip，第一則送出後自動收起，seen-flag 存 localStorage）/ E2E badge 改成可點的說明 / menu 說明 / [message vanished] → (this one vanished) / errorMessage.ts（permission-denied 等不可重試）/ Retry 以 closure 保留原 payload / draft persistence / image preview（Send / Cancel、檔案大小、safe-area）
a55dff3 2026-05-29 21:33 archive impeccable critique snapshots — chat surface 30 → 39
critique 快照 1：2026-05-29T13-10-08Z（台北 21:10）total 30、P1 ×3；Help and Documentation 1、Error Recovery 2；「Looks mature; recovers like a prototype.」；「Visual: Browser viz skipped (chat requires auth + session, no dev server up)」；P1「First message vanishes; Jordan thinks it's broken or they did something wrong」
critique 快照 2：2026-05-29T13-20-28Z（台北 21:20）total 39、P1 ×0；Help 1→4、Error Recovery 2→4；「Detector: Not re-run」；P3「Vanish onboarding can't be replayed」
-->
<!-- 改寫補充：另一篇舊稿（slug vanishwhisper-impeccable-30-to-39，同一件事）事實併入本篇，建議跳過。原稿「我用了一百次都沒事，因為我每次都是 A」與 commit 無關，拿掉。那篇「送出鈕視覺只有 36px」查不到依據，未採用。快照時間是 UTC，已換成台北時間；修改是在兩份報告之間做的，commit 集中在 21:31–21:33。 -->

