---
title: "瀏覽器分頁上還是一道紫色閃電，所以我讓石頭、葉子和樹枝拼成一張壞笑的臉"
pubDate: "2026-11-03"
tags: ["wildcard", "devlog"]
draft: false
---
Wildcard 是我自己在做的一款叫人出門撿東西的對戰遊戲。拍下一顆石頭、一片葉子或一根樹枝，系統認出那是哪一種，再拿去跟別人比。

5 月 2 日早上九點多，遊戲的畫面才剛整個換成一本野地手帳：紙的底色、墨線、淡淡的水彩，牌面上的 emoji 也換成手繪的石頭和葉子，[那次改版](https://southern-light.dev/blog/wildcard-emoji-is-not-a-stone/)另外寫過。換完之後，它在瀏覽器分頁上的小圖示，還是一道紫色的閃電。那是建專案時工具送的預設圖示，跟石頭、葉子都沒有關係。分頁上的標題是全小寫的 wildcard。把網址貼給別人，預覽也沒有圖，因為網頁裡根本沒寫要給什麼圖。

那天早上十一點，我跟 Claude 一起寫了一份品牌圖示的設計文件，範圍是三樣東西：分頁小圖示、貼連結時跳出來的預覽圖、遊戲自己的標誌。

標誌的想法寫在最前面。左眼是一顆石頭，圓圓的、放鬆的，有幾道石紋和一點青苔。右眼是一片葉子，往左歪 12 度，像挑起一邊眉毛。嘴巴是一根樹枝，從左下斜斜往右上翹，像嘴角在壞笑。

文件裡說，這張臉要讓人看兩眼。第一眼看到的是三樣自然的東西拼在一起，對應遊戲裡石頭、葉子、樹枝三種出牌；第二眼才讀出那是一張臉，而且在壞笑。文件說，這樣標誌才有個性，配得上一個對戰遊戲。

沒選的方向也寫下來了，各附一句原因。提燈太接近母品牌，會把這個遊戲自己的玩心壓下去。一堆石頭加一道光，比賽的意思有了，個性不夠。圖章、紋章，像收藏家蓋的印，太正經，跟在野地裡打架的氣氛不合。扁平、粗實的圖示在手機桌面上最好認，但會跟遊戲裡那本手帳脫節。

畫法沿用手帳的墨線加水彩。細節不少：石紋三道、葉脈一條主脈加四條側脈、樹枝上六個分岔、四個芽點、一個樹節，樹皮用兩種棕色疊著畫。文件裡也寫了，縮到 16 像素，這些細節會糊成輪廓，輪廓本身還要認得出是一張臉。

下午兩點開始照著文件做。兩點零六分，分頁上的紫色閃電換成了這張臉。接下來一個小時，標誌做成可以重複使用的元件，分淺色、深色兩種底；再做出標誌加上名字的橫排、直排兩種組合，並且標好讓讀螢幕軟體的人知道這是一張組合圖；然後是 1200×630 的預覽圖，和 iPhone 加到主畫面時用的 180×180 小圖示。iPhone 主畫面不吃向量圖，所以又寫了一支小程式，把這兩張圖轉成 PNG。

轉出來的第一張預覽圖，名字最後一個字母不見了。

文件裡寫的是：英文名字從畫布正中間開始寫，字級 160。1200 寬的畫布，從 640 的位置開始，160 的斜體字排到第八個字母時，已經超出右邊界，那個 d 被裁掉一半。一分鐘後改成 130，右邊留出大約 40 像素。三分鐘後，連設計文件也一起改掉，160 劃掉換成 130，後面加了一句原因：免得以後有人照著文件重做，又把同一個字母裁掉。

寫文件的時候看的是版面比例，名字大一點比較有氣勢；字真的排上畫布，才知道 160 放不下。如果只改程式、不改文件，下一次照文件重做的人會在同一個字母上再踩一次。

兩點五十二分，最後一筆把東西接上去：分頁標題改成英文名字加「野地對戰」，網頁的描述寫的是「拍下自然，分出勝負。樹枝、石頭、葉子，一場野地對戰。」貼連結時的預覽圖、iPhone 的主畫面圖示，都指向剛剛做好的那幾張。

從早上那份文件到下午這一筆，畫面裡的遊戲規則一行都沒動。動的是它被別人第一次看到的那幾個地方：分頁上的 16 像素、聊天室裡的一張預覽圖、手機桌面上的一個方塊。這些地方以前都是工具送的預設值，看起來像一個還沒決定要不要繼續做的專案。

其他作品在[作品集](https://southern-light.dev/works/)。

先不說了，我得去把分頁縮到最小，再看一次那張臉還笑不笑得出來。

*這段 code 寫於 2026 年 5 月 2 日，文章整理於 2026 年 10 月。*

<!-- source: wildcard（私有 repo） | last_sha: 1240582 -->
<!-- commits（台北時間）:
640cf58 2026-05-02 09:33 feat(design): add fieldbook design tokens（4342877 09:57 合併 feat/fieldbook-design）
9616d54 2026-05-02 11:06 docs: add brand assets design spec (favicon/og-image/app logo)（Mark：左眼石頭、右眼葉子傾斜 -12°、嘴巴樹枝斜切；雙層解讀；不採用：提燈（太貼近母品牌）、石堆+光、圖章/紋章印、扁平堅實風；細節層：石紋 3、葉脈主脈+4 側脈、分支 6、芽點 4、樹節 1、樹皮雙色疊筆；16px 退化成輪廓）
2a00646 2026-05-02 14:00 docs: add implementation plan for brand assets
616b58a 2026-05-02 14:06 feat(brand): replace favicon with trio smirk mark（原 favicon.svg 為 Vite 預設紫色閃電）
21ac4cb 2026-05-02 14:14 feat(brand): add Mark component with light/dark themes
fe63369 2026-05-02 14:19 feat(brand): add AppLogo lockup component (horizontal/stacked, light/dark)
f15b9e0 2026-05-02 14:22 feat(brand): label AppLogo as composite image for assistive tech
5ee7947 2026-05-02 14:24 feat(brand): add OG image SVG source (1200x630)
5691abe 2026-05-02 14:43 feat(brand): add Apple touch icon SVG source (180x180)
f40fe6d 2026-05-02 14:47 feat(brand): add image generation script and emit PNG outputs（sharp）
857efe1 2026-05-02 14:48 fix(brand): shrink OG wordmark to fit within 1200px canvas
087acbd 2026-05-02 14:51 docs(spec): note OG wordmark font-size adjusted from 160 to 130（"at 160px ... overflows the 1200px canvas from x=640, clipping the trailing d"；~40px 右邊距）
f714ccb 2026-05-02 14:52 feat(brand): wire title, description, og: meta, and apple-touch-icon（舊 title 為小寫英文名，原本沒有任何 og: meta）
1240582 2026-05-02 15:00 docs(spec): use absolute URLs for og:image/twitter:image
-->
<!-- 改寫補充：原稿說連結預覽是「Vite 的閃電 logo，藍底白閃」：查到 Vite 預設圖示是紫色閃電，而且當時網頁沒有 og: meta，預覽根本沒有圖，已改。原稿 wordmark「縮到 96px」不符，實際是 160→130。原稿「改了半天 viewBox、又查 sharp 文件」：轉 PNG（14:47）到修正（14:48）只隔一分鐘，拿掉。原稿「葉子傾角各改了四五個版本」「每個元件先寫 test 再寫實作」「丟進 Discord」commit 無法查證，拿掉。「母品牌」照設計文件原文，沒有展開是哪個品牌。 -->

