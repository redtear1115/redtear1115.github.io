---
title: "為了讓收起來的卡片不再閃一下，我改了一行，Futari 一打開就開始報錯"
pubDate: "2026-11-04"
tags: ["futari", "react", "nextjs", "devlog"]
draft: false
---
Futari 是給兩個人一起記生活帳的家計簿。首頁最上面是一張大卡片，寫著兩個人現在誰欠誰多少；紀錄頁有一塊每月統計，把這個月花在哪裡畫成長條。這兩塊都可以收起來。天天打開的人，看過一次就不需要它一直佔著半個畫面。

收起來這件事，Futari 會記住，下次打開還是收著。問題是記住的方式。

5 月 21 日晚上，那兩塊的寫法是這樣：畫面先照預設，整塊展開畫出來，畫完之後，再去手機瀏覽器裡翻上次存的設定，發現是收著的，才把它收起來。所以每次進那一頁，都會先看到它展開一下，再啪一聲收回去。很短，可是天天看得到。

晚上八點半，我跟 Claude 改了一個地方：不要等畫完再去翻，畫第一次的時候就先讀那個設定，一開始就畫成收著的。八點五十二分合進主線，十點零二分發了 1.1.7 版。

問題在於，Futari 的畫面不是手機自己從零畫出來的。

使用者打開 Futari，伺服器會先把整頁畫好，送到手機上，讓人一打開就看得到東西，不必對著一片空白等。手機收到之後，再接手，讓按鈕按得下去。接手的時候，手機會自己再畫一遍，拿來跟伺服器送來的那一份對照，兩份要一模一樣才接得上。

收合的設定，存在手機瀏覽器自己的小抽屜裡。這個抽屜，伺服器看不到。

所以伺服器畫的那份，一律照預設：展開。手機接手時畫的那份，讀了抽屜：收著。兩份對不上。React 是 Futari 用來畫畫面的那套工具，它發現對不上，就在主控台裡報一個 418 號錯誤，意思是伺服器給的和手機畫的不一致。

只要收過一次卡片的人，每次打開 Futari 都會碰到。我想修的是那一下閃動，結果換來一個每次都會出現的錯誤。

晚上十點三十九分，第二次修改。這一次把收合的設定，從手機的小抽屜搬進 cookie。

cookie 也是存在瀏覽器裡的一小段資料，差別在於它每次都會跟著請求一起送到伺服器。伺服器在畫頁面之前就讀得到，先照使用者上次的設定畫：收著就畫收著。手機接手時讀的也是同一個 cookie，兩邊畫出來一樣，對得上，不報錯，也不會先展開再收回去。只有使用者自己按下收合或展開的那一刻，才把新的設定寫回 cookie。

這次一起搬過去的，不只那兩塊。首頁那張大卡片的收合、卡片上「要不要把還在等對方確認的轉帳也算進去」那個切換、另一半離開群組後跳出來那條提示有沒有被關掉、旅行帳本那一列有沒有收起來，全部換成 cookie，共用同一組讀寫的方法。

代價寫在修改說明的最後一行：原本存在小抽屜裡的設定，會被重設一次。換版之後第一次打開，之前收起來的卡片會全部展開，使用者要再收一次，之後就記得住了。

十點五十六分合進主線，十一點零二分發了 1.1.8 版。會報錯的 1.1.7，在外面待了大約一個小時。

第一次的修改其實沒有錯。畫第一次就讀設定，是讓畫面不閃的正確想法，只是它假設畫第一次的人是手機。在 Futari，畫第一次的是伺服器，而伺服器看不見手機的抽屜。設定要放在誰都看得到的地方，兩邊才能畫出同一個畫面。

那天晚上這兩次修改中間，Futari 也接上了錯誤回報，之後出錯會自己送回來，不用等人跟我說「欸這個怪怪的」。

Futari 在[作品集](https://southern-light.dev/works/)裡，網頁和 iPhone 都能試，程式碼放在 [GitHub](https://github.com/redtear1115/oikos)。

先不說了，我得去把首頁那張卡片收起來，重新整理一次，看它是不是乖乖待著。

*這段 code 寫於 2026 年 5 月 21 日，文章整理於 2026 年 10 月。*

<!-- source: oikos | last_sha: aba79cd -->
<!-- commits（台北時間）:
1772fde 2026-05-21 20:34 fix: eliminate localStorage collapse flash in BalanceHero and MonthlyStatsView（原本 useState(false) + useEffect 讀 localStorage，hydration 後才讀，每次進頁面先畫展開再收；改成 lazy useState initializer）
a34f24e 2026-05-21 20:52 Merge PR #726
20317b7 2026-05-21 21:02 feat: integrate Sentry error tracking（0291a98 21:33 合併）
v1.1.7 2026-05-21 22:02（包含 1772fde）
aba79cd 2026-05-21 22:39 fix: persist collapse prefs in cookies to stop hydration mismatch (#418)（server 看不到 localStorage，SSR 畫展開、client 第一次 render 讀到收合，React #418；改成 server component 讀 cookie 當初始 prop；涵蓋 MonthlyStatsView、BalanceHero（收合 + include-pending）、ContextStrip（partner-left dismissed + trip collapsed）；新增 lib/uiPrefsCookie.ts；"existing users' localStorage values for these prefs reset once"）
d038b27 2026-05-21 22:56 Merge PR #731
v1.1.8 2026-05-21 23:02
-->
<!-- 改寫補充：原稿副線 Esc 關閉 sheet 的 history 問題（53d491a 同日 20:52 合併）、PostHog 本機事件送進正式專案（1d3d300 22:50）依一篇一個故事拿掉，PostHog 那段也和已發佈的〈我自己測試時點的那幾下…〉重疊。原稿「hydration mismatch 會讓 React 整棵樹丟掉重畫、造成更大的 flash」沒有出處，正文不寫。原稿「React #418 被抓到是運氣」：commit 沒有記錄 #418 是怎麼被發現的（Sentry 21:02 接上、1.1.7 22:02 發出），待 Ray 確認。原稿說使用者是「我老婆」，沒有素材依據，拿掉。 -->

