---
title: "搜尋引擎來敲 Futari 的門，拿到的也是一張登入頁"
pubDate: "2026-11-08"
tags: ["futari", "seo", "devlog"]
draft: false
---
Futari 是給兩個人一起記生活帳的家計簿，有 iPhone App 也有網頁版。帳本只給那兩個人看，所以網頁版從一開始就在門口放了一道檢查：沒登入的人，不管要去哪一頁，一律先送到登入頁。

這道檢查是 5 月 2 日晚上九點寫好的。它的規矩很簡單，網址在例外清單上的直接放行，其他一律先問「登入了沒」。例外清單一開始只有網站自己運作要用的東西，像程式檔，還有網站分頁上那個小圖示。

第二天下午四點，清單第一次加長。手機瀏覽器會去拿一份說明檔，裡面寫著這個網站加到主畫面時叫什麼、圖示長怎樣。沒登入的瀏覽器去拿，被送到登入頁，拿回來的是一整頁登入畫面。瀏覽器把那頁當成說明檔來讀，報出語法錯誤，圖示也一起破掉。那次把說明檔和各種圖片加進例外清單，旁邊留了一段註解，寫明不加會怎樣。

5 月 8 日晚上，我和 agent 對網站做了一輪搜尋引擎的檢查。結果的第一句是：首頁、robots.txt、sitemap.xml，三個全被轉去登入頁。

後面那兩個檔案是寫給搜尋引擎看的。robots.txt 說哪些頁面可以看、哪些不用看，sitemap.xml 列出網站有哪些頁面，搜尋引擎的爬蟲來到一個網站，通常先拿這兩份。其實那天晚上之前，這兩份都還沒寫。就算寫了，門口那道檢查也不認得它們，看到沒登入的訪客，照規矩送去登入頁，爬蟲拿回去的會是一張登入畫面。

所以那晚的修法分兩半。一半是把這兩份檔案寫出來，另一半是在例外清單上多加兩個名字。

同一輪檢查還列了幾件事。網站的說明文字裡，想讓人搜得到的十九個關鍵字只出現三個；登入頁上那個大大的「Futari」，在程式裡只是一般文字，搜尋引擎看不出它是標題；網頁裡也沒有任何一段資料告訴搜尋引擎「這是一個 App」。這些當晚都補上了，網頁標題改成「Futari · 兩個人的家計簿｜伴侶／夫妻共享記帳」，品牌名換成真正的標題，畫面上看起來一模一樣。

改完在自己電腦上把網站跑起來，robots.txt 和 sitemap.xml 都拿得到內容，登入頁的原始碼裡，標題、說明、四種語言的對應網址都在。十一點五十九分發了 0.11.3 版。例外清單旁邊那段註解也改寫了，多了一句：robots.txt 和 sitemap.xml 也會被轉走，搜尋引擎那邊就白做了。

六天後，5 月 14 日晚上十點四十分，清單第三次加長。這次是 Google 自己的檢測工具說畫不出這個網頁。被攔下的換成另一批：讓網站斷線也能開的那支小程式、新格式的說明檔、字型檔。那支小程式四天前才上線，沒登入的人去拿它，同樣拿到登入頁，結果安裝失敗，而且沒有任何地方報錯。

5 月 18 日晚上十一點，第四次。Futari 有一頁是給從別的記帳 App 搬過來的人看的，頁面上最主要的一顆按鈕，是下載一份整理帳目用的試算表範本。這一頁和範本是當天晚上九點半才加上去的，範本的副檔名是 xlsx，例外清單裡的圖片、字型格式都列了，就是沒有 xlsx。沒登入的人按下那顆按鈕，下載到的是登入頁。一個半小時後的那筆修正，說明裡寫著：跟 14 日那次是同一類問題。

四次的原因都一樣。門口那道檢查的寫法是「清單上的放行，其餘全擋」，每多一種要給外人拿的檔案，就得有人記得去清單上加一個名字。四次都是東西出了狀況才發現，沒有一次是在加新檔案的時候想到門口。

這四次修改，每一筆都是我跟 agent 一起寫的。斷線用的那支小程式、搬家頁的範本，也都是我們一起加上去的。加的時候，門口那份清單不在當下要改的檔案裡，agent 沒有繞過去看，我也沒有。清單旁邊的註解倒是每出一次事就多一句。

Futari 在[作品集](https://southern-light.dev/works/)裡，iPhone 和網頁都能直接試，程式碼放在 [GitHub](https://github.com/redtear1115/oikos)。英文版連結貼出去時，預覽圖還是中文的那件事，我在[這篇](https://southern-light.dev/blog/futari-og-image-localize-skeleton/)寫過。

先不說了，我得去看看網站上現在放的每一種檔案，門口那份清單是不是都認得。

*這段 code 寫於 2026 年 5 月 2 日到 18 日，文章整理於 2026 年 11 月。*

<!-- source: oikos | last_sha: 3a3294b -->
<!-- commits（台北時間）:
e3414fa 2026-05-02 21:03 feat: add auth middleware and dashboard placeholder
9e177c0 2026-05-03 16:12 fix(middleware): skip auth check for manifest.json + static image assets（註解："manifest.json and image files would otherwise be redirected to /sign-in … 'Manifest: Line 1 Syntax error' / broken icons"）
13232f9 2026-05-08 23:34 feat(seo): v0.11.3 — robots.txt + sitemap.xml + keyword-rich metadata + JSON-LD（"Audit found /, /robots.txt, /sitemap.xml all 307'd to /sign-in (middleware matcher missed the SEO files), description hit only 3/19 target keywords, brand 'Futari' was a <div> not <h1>, and no structured data existed."；app/robots.ts、app/sitemap.ts 為新檔；title「Futari · 兩個人的家計簿｜伴侶／夫妻共享記帳」；"Verified by running next start locally"）
4c7360a 2026-05-08 23:59 chore: release v0.11.3
578a428 2026-05-14 22:40 fix(seo): GSC LHR failed to render — sitemap × canonical × middleware × cache 訊號矛盾收斂（matcher 加 sw.js、service-worker.js、manifest.webmanifest、gif、woff/woff2；註解 "/sw.js + /manifest.* get 307'd to /sign-in (PWA registration silently fails, MIME mismatch)"）
012c6b5 2026-05-18 21:31 feat: /migrate landing pages（含 public/cwmoney-template.xlsx）
3a3294b 2026-05-18 23:01 fix: serve /cwmoney-template.xlsx without auth redirect（"the primary CTA on /migrate/cwmoney — got 307'd to /sign-in for anonymous visitors. Same class of bug as #305/#306."）
離線 service worker 上線：v0.14.0（2026-05-10），見 9d1d692 等 SW 修補。
-->
<!-- 改寫補充：原稿標題「一天 72 個 commit」，git rev-list v0.8.1..v0.11.3 是 65 個，且 v0.8.1（5/8 00:58）到 v0.11.3（5/8 23:59）橫跨同一天；正文不寫數字。原稿「連 /robots.txt 都被踢去 /sign-in」：13232f9 之前 robots.ts／sitemap.ts 還不存在，正文改寫為「那天晚上之前還沒寫，就算寫了也會被轉走」。原稿「description 塞了 22 個長尾關鍵字」：22 個是 keywords[]，description 原本命中 3/19；正文只寫 3/19。孩子身分證加密（ba34712）、getSession 效能、定期支出、i18n、advisor 警告依一篇一個故事拿掉；加密題材已有多篇。5/14、5/18 兩次為同一類問題，補進來當同一個故事。搬家頁的範本是別家 App 的匯入範本，正文不寫對方名字。2026-11-02 Ray 確認 5/8 那輪 SEO 檢查是他和 agent 一起做的。 -->

