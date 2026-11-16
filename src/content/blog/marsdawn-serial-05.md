---
title: "MarsDawn 連載（五）測試住進了我家"
pubDate: "2026-11-16"
tags: ["marsdawn", "serial", "ai"]
draft: false
---
*MarsDawn 連載第五回。上一回：[（四）拿掉檢查，還是綠的](https://southern-light.dev/blog/marsdawn-serial-04/)*

9 月 18 日晚上，負責驗收的 agent 在看別的功能時，打開了我自己每天在用的那份 MarsDawn。設定資料夾裡躺著 235 個不屬於它的檔案。每跑一輪測試，大約再多 15 個。連那份真正的設定檔，當天也被改過。

原因很短。Mac 用一個叫 bundle id 的身分，決定一個 App 的設定放在哪裡。測試一直借用正式 App 的身分在跑，所以測試和我每晚打開的那份，住在同一個資料夾。

驗收的 agent 自己很小心，動 App 之前會先複製一份、換個身分。統籌的 agent 沒有。它當晚用比較省事的方式跑完整套測試，真的寫進了我的設定檔。

我第一個想法是，讓每個測試跑完把自己清乾淨。查下去才知道清不掉。macOS 有個專門管設定檔的背景程式，測試刪掉一份，它過幾秒又寫回來。

只好換個方向。晚上九點五十六分起，測試改用自己的身分，跟正式 App 分家。需要設定的測試，只在記憶體裡放一份，不寫進硬碟。每跑完一輪，再去比對我那份正式的設定資料夾，多一個、少一個、改一個，整輪都算失敗。

剩下的垃圾檔要刪。agent 停下來問我，沒有自己動手。我點了頭，刪掉檔名完全對得上的那 310 個。

上一回是綠燈說謊。這一回，測試走錯了門。

先不說了，我得去看今天的測試，有沒有又在我家留下新檔名。

*這段 code 寫於 2026 年 9 月 18 日，文章整理於 2026 年 11 月。*

<!-- source: 出自已上線 marsdawn-tests-lived-in-the-real-app（235 個、每輪約 15 個、cfprefsd、統籌 agent 是源頭、刪 244＋66 個由 Ray 點頭）。私有 repo git log：27698fd 09-18 21:56 Run the tests under their own bundle id；f9e0569 23:27 S2 tests: use ScratchDefaults。 -->

<!-- Co-authored-by: Claude <claude@southern-light.dev> -->

