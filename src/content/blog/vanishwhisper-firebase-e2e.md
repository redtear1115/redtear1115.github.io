---
title: "VanishWhisper 的訊息從「被讀過」那一刻開始倒數，那一刻只准收件人寫下"
pubDate: "2026-11-10"
tags: ["vanishwhisper", "firebase", "security", "devlog"]
draft: false
---
VanishWhisper 是我做的網頁聊天室。不用註冊，打開就能跟人說話，訊息被讀過以後，過一段時間就不見。它的 repo 開在 2023 年 12 月 28 日傍晚，兩分鐘內進了兩個 commit，一個空殼，一份網站託管的設定，然後就停了。

下一個 commit 是 2026 年 4 月 27 日晚上九點零二分，中間隔了兩年四個月。那天晚上我和 agent 一層一層往上蓋。九點零二分，匿名登入，每個人的瀏覽器在本機產生一組 RSA 鑰匙。九點十五分，邀請流程，每段對話配一把 AES 鑰匙，用兩個人各自的公鑰包起來。九點四十分，加密的一對一聊天能用了。九點四十六分那一步，叫「讀了就消失」。

產品的名字就掛在這一步上。

消失要有個起點。我們定的起點，是收件人第一次在聊天畫面看到這則訊息的時間，存成一個欄位叫 ReadAt。倒數多久由收件人自己的設定決定，預設六十分鐘。時間到了，收件人那一端再寫一個 DeletedAt，表示這則訊息沒了。

這一步除了倒數，還得決定另一件事：誰可以寫這兩個欄位。

寄件人如果能寫 ReadAt，就能替對方宣布「已讀」，讓訊息在對方還沒看到之前開始倒數。所以資料庫的規則把兩個欄位都釘給收件人：寫的人必須在這段對話裡，而且不能是這則訊息的寄件人。一次只准改一個欄位。DeletedAt 要等 ReadAt 已經存在才能寫。

規則裡還有一條。寫進去的時間，必須等於伺服器收到這次寫入的那一刻。少了這條，收件人可以把 ReadAt 填成一小時前，寄件人的畫面一算，時間早過了，訊息當場消失。畫面上看起來像對方讀完、等滿了六十分鐘，其實對方一秒都沒等。commit 說明裡把這種情況寫成要擋下的攻擊：收件人重播一個舊的時間，讓寄件人那邊的訊息瞬間消失。

收件人看到一半就關掉分頁呢？DeletedAt 是收件人的瀏覽器在倒數結束時寫的，人走了就沒人寫。所以兩邊的畫面都不等這個欄位，各自拿 ReadAt 加上收件人設定的分鐘數，算出該消失的時間，到了就先藏起來。資料庫裡那份文件可能還留著，兩個人的畫面上都已經沒有了。這個取捨當晚就寫進了說明。

十九分鐘後，晚上十點零五分，寄件人也能收回自己的訊息了，用的是同一個 DeletedAt 欄位。規則替他另外開了一條路，只有寄件人本人能走，不必等對方讀過。同一個欄位，兩條路，各自的前提互不干擾。收件人不能替寄件人收回，寄件人也不能替收件人宣布讀過。

從九點零二分到九點四十六分，四十四分鐘，加密和消失都能用了。「已讀」這兩個字只有收件人能說，是那四十四分鐘的最後六分鐘定下來的。

VanishWhisper 為什麼沒有登入頁，我在[這篇](https://southern-light.dev/blog/vanishwhisper-no-login/)寫過。程式碼在 [GitHub](https://github.com/redtear1115/vanishwhisper)，其他作品在[作品集](https://southern-light.dev/works/)。

先不說了，我得去開一則訊息、讀完就關掉分頁，看它有沒有準時不見。

*這段 code 寫於 2026 年 4 月 27 日，文章整理於 2026 年 11 月。*

<!-- source: vanishwhisper | last_sha: 65601df -->
<!-- commits（台北時間）:
89ad807 2023-12-28 18:43 initial commit
9bddd88 2023-12-28 18:45 add hosting configs
9626dc4 2026-04-27 21:02 scaffold vue+ts toolchain, anonymous auth + rsa keypair（RSA-OAEP 2048，存 IndexedDB）
ca962bb 2026-04-27 21:15 phase 1 step 2: invitation flow + per-session aes key wrapping
2f29f90 2026-04-27 21:21 phase 1 step 3: realtime session list on home view
86303d1 2026-04-27 21:40 phase 1 step 4: end-to-end encrypted 1-on-1 chat
e00c07c 2026-04-27 21:46 phase 1 step 5: read & vanish（ReadAt／DeletedAt recipient-only；request.auth.uid != resource.data.UserID；affectedKeys().hasOnly 單一欄位；值必須 == request.time，防 replay 舊時間戳讓寄件人畫面瞬間消失；DeletedInMinutes 預設 60；兩端各自以 ReadAt + 收件人分鐘數算 vanishAt 先隱藏，收件人離線時文件會留著）
65601df 2026-04-27 22:05 phase 2 steps 1+2: sender unsend + emoji reactions（unsend 寫同一個 DeletedAt，rule case (c) 限寄件人、不需 ReadAt）
-->
<!-- 改寫補充：原稿說「某個週日下午」，實際是 4/27 週一晚上 21:02～22:05；原稿斜體日期「寫於 2023 年 12 月」改為 2026 年 4 月 27 日（2023-12 只有空殼）。兩個 onSnapshot 合併、本機暱稱兩段依一篇一個故事拿掉（本機暱稱已寫在 vanishwhisper-names-cross-devices）。 -->

