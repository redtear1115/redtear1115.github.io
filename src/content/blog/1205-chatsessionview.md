---
title: "聊天頁的程式我一天拆了三次，睡前最後二十二分鐘，它又長回七十二行"
pubDate: "2026-11-06"
tags: ["vanishwhisper", "devlog", "refactoring"]
draft: false
---
VanishWhisper 是一個不用登入的悄悄話網頁。產生一條邀請連結，用自己習慣的管道傳給對方，對方點開就能聊，訊息在對方讀過之後自己消失，內容從頭到尾加密，伺服器看不懂。

聊天頁是這個網頁最主要的一頁。訊息一則一則往上長，對方讀了以後開始倒數、時間到就消失，貼圖、表情回應、點開大圖、兩個人都同意才刪掉整段對話，全部擠在同一頁。4 月 27 日晚上第一版加密聊天做好，這一頁的程式就開始長，到 5 月 1 日早上，負責這一頁的那個檔案已經 1796 行。

行數本身不會讓東西壞掉。麻煩的是所有東西擠在一起、互相牽著，想調一下貼圖面板，得先確定沒碰到大圖的關閉；關大圖的那一段，又跟選單、表情面板共用同一套「點旁邊就收起來」的寫法。加一個小功能之前，要先讀很久。

5 月 1 日那天，我跟 agent 把它拆了三次。

早上九點三十九分是第一刀，把「一則訊息」整個搬出去：泡泡、引用、表情、時間，還有讀過之後倒數、時間到自己消失的那段計算。這一刀切掉五百行，剩 1295 行。

傍晚六點半第二刀，拆的理由換成重複。聊天頁裡「點外面就收起來」的那套寫法，對話列表每一列的小選單裡又寫了一次，那邊的註解還老實寫著：照聊天頁的選單抄的。兩份合成一份，改對話名稱的那一塊也搬了出去，剩 1149 行。

晚上八點五十四分，我轉去做設計。全站換了字體，背景加一層紫色的霧和細細的顆粒，圖示從 emoji 換成自己畫的線條。聊天頁也分到一些：頁首多了對方名字縮寫的頭像，消失倒數的那條線尾巴淡出、帶一點薄荷綠的光。這一輪做完，檔案回到 1232 行。九點半再抽掉幾個各頁共用的小元件，1205 行。

十一點三十六分第三刀，一次搬走四塊：雙方刪除的確認橫幅、貼圖面板、判斷要不要自動捲到最底的那段、點開大圖。這次的說明寫得很細，每一塊搬去哪裡、哪些故意留在原地都交代了，像貼圖按鈕留在輸入列，只把面板搬走，因為面板什麼時候收起來，還是要由聊天頁統一管。說明最後一行寫著：1205 變 1037，行為沒有任何改變。

二十二分鐘後，十一點五十八分，我又動了聊天頁一次，這次是幾個設計小修。對話頁底部加一圈從下往上暈開的紫光，跟頁面頂端那圈「月光」反過來，像打字的那一頭點了一根蠟燭。空白的對話原本寫著「No messages yet — say hi.」，換成一張比著噓的吉祥物貼圖，配一句斜體的「Say something — it'll vanish soon enough.」，意思是說點什麼吧，反正很快就會消失。全站還加了一條規則，手機設成減少動態效果的人，動畫一律關掉，只留滑過按鈕時那一點顏色變化，那算手感，不會讓人頭暈。

這幾個小修讓聊天頁回到 1109 行，多了 72 行。

那天我一邊在拆，一邊在加，當成兩件不相干的事在做。放進同一天的修改紀錄裡看，是同一個檔案被推過來又推過去。拆的時候搬走的是本來就在裡面的東西；設計加進來的頭像、光暈、空白頁，都直接寫回聊天頁本身，沒有放進剛拆出來的那些小盒子裡。三刀切得乾淨，下一次加東西的時候，沒有人先問一句：這個該放在哪一格。我沒有問，agent 也沒有。

這個網頁的修改紀錄目前停在 5 月 29 日。那天晚上我照一份設計評審的報告，把聊天頁整理了一輪：第一次來的人會看到的提示、傳送失敗時的重試、選完照片先預覽，那個故事寫在[〈第一則訊息消失的時候，新來的人會以為是自己按壞了〉](https://southern-light.dev/blog/vanishwhisper-impeccable-chat-30-to-39/)。那一次改完，聊天頁的檔案是 1911 行，比 5 月 1 日早上拆之前還多了一百多行。

VanishWhisper 為什麼不要登入頁，我在[這篇](https://southern-light.dev/blog/vanishwhisper-no-login/)寫過。它的程式碼放在 [GitHub](https://github.com/redtear1115/vanishwhisper)，我其他的作品在[作品集](https://southern-light.dev/works/)。

先不說了，我得去翻翻那 1911 行，看哪幾塊早就該有自己的檔案。

*這段 code 寫於 2026 年 5 月 1 日，文章整理於 2026 年 11 月。*

<!-- source: vanishwhisper | last_sha: 41d781b -->
<!-- commits（台北時間），括號內為該 commit 後 src/views/ChatSessionView.vue 行數（git show <sha>:path | wc -l）:
86303d1 2026-04-27 21:40 phase 1 step 4: end-to-end encrypted 1-on-1 chat（此檔第一個 commit）
71e7446 2026-05-01 09:39 split ChatSessionView into bubble component + vanish composable（1796 → 1295）
b281edc 2026-05-01 18:32 extract ChatRenamePanel component + useDocumentDismiss composable（→ 1149；SessionRow 的註解寫 "mirroring the chat header menu pattern"）
2d68b23 2026-05-01 20:54 frontend design pass — typography, atmosphere, brand assets（→ 1232；Fraunces／Figtree 自架字體、紫色霧＋顆粒、AppIcon 取代 emoji 圖示、頁首縮寫頭像、倒數線 fade＋mint glow）
4b28bd5 2026-05-01 21:31 extract popover / secondary-page / avatar / invite-share into shared utilities（→ 1205）
de7bbbe 2026-05-01 23:29 warn when loaded inside an in-app browser（另一篇已發佈：vanishwhisper-trace-vanishes-too-soon）
223abd4 2026-05-01 23:36 extract delete-banner / sticker-picker / scroll / lightbox out of ChatSessionView（→ 1037；"No behaviour change."）
41d781b 2026-05-01 23:58 design polish — reduced-motion / hero card / chat atmosphere / empty state（→ 1109；"candlelight from where you're typing"；空狀態 "No messages yet — say hi." → shh sticker + "Say something — it'll vanish soon enough."；transitions 保留，"tactile feedback, not motion"）
a9793fc 2026-05-29 21:32 chat surface design pass（→ 1911；本機 repo 最後一個 commit 為 a55dff3 2026-05-29 21:33）
-->
<!-- 改寫補充：原稿只寫 1205 → 1037 那一次，其實當天從 09:39 起拆了三次，檔案早上是 1796 行；原稿沒提 23:58 的設計修改讓檔案回到 1109 行。原稿「每次想加功能都要深呼吸三次」等誇飾拿掉。 -->

