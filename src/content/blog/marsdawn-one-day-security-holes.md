---
title: "一天生出一個 App，順便修了自己埋的三個資安洞"
pubDate: "2026-09-20"
tags: ["marsdawn", "security", "devlog", "ai"]
draft: false
---

你有沒有過那種凌晨兩點還在敲鍵盤、覺得自己是全世界最聰明的工程師，隔天回頭看 git log 卻發現自己根本是嫌疑犯的經驗?我最近經歷了一次，而且整段劇情壓縮在同一天——早上是天才，晚上抓到自己捅的資安洞。

那是 9 月 17 日。我從半夜 00:01 開始，一路敲到晚上 23:50，57 個 commits，把 MarsDawn——一個 macOS 原生的 Markdown 編輯器——從零生到能送 App Store 審。即時預覽、分割視窗、主題系統、Siri／Shortcuts／Spotlight、PDF 匯出、一個 command-line tool、拖放貼圖、Quick Look 預覽，還順手把整個上架流程和支援網站都弄出來了。聽起來滿猛的對吧，我自己那天晚上也這樣覺得。

而且不是介面堆一堆按鈕那種猛。編輯器是 TextKit 2 寫的原生 `NSTextView`，連 Markdown 語法標色都做成只重繪有改到的段落，不是整份重來;預覽是一個私有 URL scheme 底下、掛著嚴格 CSP 的 `WKWebView`，靠 keyed DOM diffing 更新，沒改到的 Mermaid 圖表不會重畫。這些渲染邏輯我抽成一個叫 `MarsDawnKit` 的 package，當天稍晚直接搬去獨立的 public repo，連支援網站也搬走，各自留自己的 CI。心血來潮還把 app 跟 kit／CLI 的最低系統需求拆開——app 要 macOS 26，kit 跟 CLI 只要 15，讓更多人能裝 CLI。CLI 本身也不是玩具，`marsdawn export` 可以在沒裝 app 的機器上生 PDF，回傳穩定的 exit code 跟 JSON。寫的時候我腦中想的其實是「以後會有別的 LLM agent 直接呼叫這支工具」，現在想想那句話滿有預言感的。商業模式也是那天定案的:免費下載、14 天試用、$4.99 一次性解鎖，不訂閱——雖然扣款的 code 一行都還沒寫，先把 StoreKit 2 的流程跟 Guideline 3.1.1 的眉角記下來。連整套 UI 的繁體中文在地化都是那天做完的，順便把 copyright 欄位設對。

問題是隔沒幾個小時，我就開始抓到自己埋的坑，而且一個比一個有梗。

第一個是遠端圖片。Markdown 裡塞一張 https 圖片，理論上你一打開文件它就會發 request 出去——如果作者夠壞，甚至能靠 inline CSS 玩出「猜你電腦上有哪些本機檔案」的把戲。發現之後我把預覽的 CSP img-src 預設拿掉 https，圖片變成安靜的 placeholder，加一條「Load Images」的 bar 讓你自己選要不要載，Settings 裡也加了個開關，預設關。

想說這樣應該夠了吧。結果沒有。過沒多久我發現只擋圖片根本不夠啊——Markdown 預覽視窗和 Quick Look 用的 webview，自己就能發別的網路請求，跟圖片沒半毛關係。這個洞大到我直接開了一條叫 H0 的 hotfix 線去堵:每次 load 前先掛 content rule list 封鎖網路，還加了一個 generation token，專門丟掉被後來的 load 或使用者切換設定蓋過的舊請求。

真正好笑的在後面。我幫這個 race condition 寫了測試，結果沒多久發現——把 generation check 整段拿掉，那顆測試照樣是綠燈。也就是說我寫了一顆會說謊的測試，它根本沒驗到自己宣稱在驗的東西，超諷刺的。後來重寫，用一個可以抽換的 rule list provider，故意卡住「允許」那條路徑的 compile，等「封鎖」那條先開始跑了，再檢查有沒有東西偷偷把封鎖結果蓋掉。這次才算是真的測到了。

同一天還有一堆小的。主題生態系的 index URL 一開始寫死沒版本號，想到以後要推不相容格式會直接打破舊版 app，緊急補了個 /themes/v1/ 前綴。唯讀模式的狀態設定順序也寫反了——window controller 在 AppKit 把 document 掛上視窗「之前」就先設 mode，導致唯讀視窗的選擇會漏到下一個視窗上。順手把我自己加的「強制顯示 tab bar」也撤了，因為單一文件視窗硬擠出一條佔滿寬度、只顯示重複標題的 bar，根本是自作聰明。

還有一個不算資安、但一樣是我自己捅出來的洞:預覽讀取失敗的時候，畫面就是整片空白，什麼提示都沒有——不管是 rule list compile 失敗、載入被拒絕，還是 web content process 自己掛掉，通通長得一樣，使用者只會覺得這個 app 壞了。更糟的是，唯一能補救的「Load Images」跟「Grant Folder Access」按鈕，都藏在預覽頁面自己畫的 HTML 裡，用鍵盤操作的人幾乎摸不到。後來補了一個原生的錯誤提示加重新整理按鈕，又把這些動作搬到 View 選單裡，連 Reload Preview 都給了 ⌘R——一個可用性的洞，一樣是自己種自己拔。

版控這邊也有兩次差點翻車。上架 runbook 裡寫了我自己的 keychain 路徑、密鑰磁碟映像位置、測試帳號 email，發現後趕快把它移出版控，順手把憑證、provisioning profile、API key、.env 全部補進 .gitignore。下一顆 commit 更離譜——不小心把另一個 feature 分支的整包 worktree 目錄 commit 了進去，馬上又補一顆撤掉，還好抓得快。

最後一個最刺激。`MarsDawnKit` 裡把 Markdown 轉 HTML 的 escaping，原本是照 Swift 的 Character 算的，結果一個 Unicode 的 Prepend 字元可以在 grapheme 邊界計算的縫隙裡，把一個沒被跳脫的 "<" 偷渡過去——等於一條沒鎖好的 XSS 路徑，改成照 byte 算才真的堵住。同一顆 commit 還順手抓到兩個小缺陷:唯讀視窗的 toolbar 按鈕沒真的被 disable，點了畫面會亂跳;「Load Web Images」按鈕有時候點了沒反應，因為它依賴一個不保證會觸發的 JS callback。

那天也不是只有補洞而已，有些細節根本沒人會逼我做，是自己手癢加的。側邊欄會顯示這個檔案目前的 git checkout 狀態，還有一段文字專門記錄「授權讀取這個資料夾的權限會持續多久」，讓使用者清楚知道自己給出去的存取權什麼時候會過期——這種東西不修也不會有人在 review 裡抓到你，純粹是自己過不去。這些「多做的」跟前面那些「漏做的」剛好是一體兩面:同一種在意細節的個性，一半時間拿去把使用者體驗磨亮，一半時間拿去發現自己前幾小時埋的雷。

還有一件事我後來才意識到:那天幾乎每顆 commit 的訊息最後都掛著「Co-Authored-By: Claude Opus 5」，有幾顆甚至留了 session 連結。也就是說這整篇文章講的「我」，有一大半時間其實是在跟一個 AI 來回對話、互相 review，不是一個人埋頭猛敲鍵盤。這可能也解釋了為什麼一天 57 個 commit 聽起來誇張、做起來卻沒有想像中那麼神——速度是真的快，但 AI 頂多幫你把「生出一個 app」這件事的門檻拉低，不會順便幫你把「這個 app 有沒有洞」這件事也一起解決掉。

回頭看這整天，我覺得最諷刺的不是坑很多，是坑的密度剛好印證了一件我後來才寫進規範裡的事:別相信最後一行摘要，要真的去讀數字。那顆會說謊的測試就是最好的示範——它是綠燈，但綠燈不等於測到東西。先踩雷、後立規矩，順序永遠是這樣跑的。

先不說了啦，我得去確認今天有沒有又埋了什麼新坑。

*這段 code 寫於 2026 年 9 月 17 日，文章整理於 2026 年 9 月 20 日。*
