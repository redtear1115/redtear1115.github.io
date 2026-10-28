---
title: "把 Futari 包成 Android App 的那晚，每次登入完都被送回首頁"
pubDate: "2026-10-28"
tags: ["futari", "android", "postmortem"]
draft: false
---
Futari 是給兩個人一起記生活帳的家計簿。它一開始是網頁版，手機上用瀏覽器打開、加到主畫面就能用。5 月 30 日晚上，我想試試看能不能把它包成一個 Android App，就動手了。

做法很單純：App 本身只是一層殼，打開之後直接載入線上的 Futari。比較麻煩的是登入。Google 不允許在這種包在 App 裡的網頁畫面裡登入，所以按下登入時，要先跳到手機的瀏覽器去完成 Google 授權，授權完再自動跳回 App。當天晚上八點多，我發了 1.4.0。

那個晚上我覺得自己很厲害，這個感覺沒維持多久。

一試登入，流程是這樣：按登入，跳去瀏覽器授權，跳回 App，然後被送回首頁。再按一次登入、再授權一次，才進得去。感覺外面那層殼根本沒登入到。

我跟 agent 一起看，發現跳回 App 的那個網址，路徑被接了兩次，同一段重複出現。網址錯了，找不到頁面，被送回首頁很合理。我們改掉那段重複，整套發版流程跑一遍，十點半發了 1.4.1。理論很漂亮，我又覺得自己很厲害了。

要驗證就得用真的機器跑。我拿出手邊一台 Lenovo 平板，開始我的 Android 開發初體驗。要打開開發者選項，網路上都說對著版本號碼點七下。我對著「Android 版本」那一欄猛點，跳出一個在轉的小圖案，那是彩蛋。要點的是下面的「版本號碼」，差了一欄。接著想用 Wi-Fi 連線偵錯，開發工具給我一個 QR code，我拿相機掃，平板問我要不要儲存網路，然後怎樣都連不上。後來才搞懂，那個 QR code 不是 Wi-Fi，要從「無線偵錯」裡面專用的掃描器掃。最後改用配對碼才接上。

App 裝上去，重測登入，還是被送回首頁。昨晚那一版等於白發。

冷靜下來，我們沒有再猜，先去撈正式環境的登入紀錄，也在平板上接開發工具確認 App 的殼真的有載起來。這時候才看到關鍵：網頁版和 Android 版登入完要回去的地址不一樣。網頁版回到 Futari 的網址，Android 版回到一個只有這個 App 認得的專屬地址，這樣手機才知道要把人帶回 App。

Futari 用的登入服務，後台有一份允許清單，只有在清單上的地址，登入完才會被送回去。地址對不上的時候，它不會報錯，而是安靜地把人送到網站首頁。清單上 Android 那一筆，只寫到專屬地址的開頭，後面那段路徑沒有寫進去，所以永遠對不上，每一次都被安靜地送回首頁。

我在那一筆後面加了一個星號，想說這樣後面接什麼都算。還是不行。這份清單裡，一個星號只認一層路徑，我的回程地址後面有兩層，要寫兩個星號才算數。開發和正式兩個環境都改成兩個星號，再測一次，授權完直接跳回 App，進到帳本裡。

問題根本不在 code 裡，我那晚卻憑猜測改了 code、發了一版。我現在的看法是，這種要跨好幾個服務才走得完的流程，先拿到證據再動手。最難抓的錯，是那種出錯時不吭聲、直接把你帶去一個看起來很正常的地方的。症狀長得像程式寫錯，真正的原因卻在一個平常不會打開的設定頁裡。

我把這整段寫成[一份說明](https://github.com/redtear1115/oikos/blob/main/docs/superpowers/specs/native-auth-design.md)放進專案裡，尤其是兩個星號那一條，免得下次換環境的人再踩一次。那個人很可能就是我自己。

Futari 現在有 iPhone App 和網頁版，都在[作品集](https://southern-light.dev/works/)裡，原始碼放在 [GitHub](https://github.com/redtear1115/oikos)。你們用過的服務裡，有沒有那種出了錯也不說，直接把你送回首頁的？

先不說了，我得去把那個 Android 彩蛋再點出來看一次，畢竟它是那兩天唯一一次就成功的東西。

*這段 code 寫於 2026 年 5 月 30 日到 31 日，文章整理於 2026 年 10 月。*

<!-- source: oikos | last_sha: 217b3ed04c -->
<!-- commits:
67c48bb745 (2026-05-30) feat(android): install Capacitor + add config pointing to prod URL
ca62b2b016 (2026-05-30) feat(android): fix OAuth redirect via Capacitor Browser + deep link scheme
9f6be1fa45 (2026-05-30) chore: release v1.4.0
c502ac084a (2026-05-30) fix(android): fix doubled /auth/callback path in Capacitor deep link handler
1307ca7754 (2026-05-30) chore: release v1.4.1
217b3ed04c (2026-05-31) docs: add native-auth spec (Capacitor Google OAuth)
-->
<!-- 改寫補充：原稿無來源註解，commit 依 oikos 查得補上（日期為台北時間）；原稿說「隔天」才發現彈回首頁並發 1.4.1，但 1.4.1 在 5/30 晚上十點半就發了，改為當晚；Supabase 後台改成 /** 屬設定變更，沒有 commit，依原稿與 spec 說明；Android 版未確認是否上架，正文不提。 -->

