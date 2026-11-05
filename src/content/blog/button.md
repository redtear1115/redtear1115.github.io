---
title: "工作單上寫著「設計師簽字之前不准往下」，三分鐘後下一步就寫好了"
pubDate: "2026-11-05"
tags: ["futari", "design-system", "agentic", "devlog"]
draft: false
---
Futari 是給兩個人一起記生活帳的家計簿。記一筆、看誰欠誰、月底一起回顧，畫面上大部分的動作都是按一顆按鈕：存檔、取消、刪除、結清。

5 月 19 日晚上八點，我讓 agent 把 Futari 的前端從頭看了一遍。八點零二分到零三分之間，它開出十七張整理工作單，一張接一張，間隔四、五秒。其中一張講按鈕。

那張單子先列了它查到的東西。全站的按鈕，圓角有十一種寫法，樣式的組合有九種。輸入框有三種寫法，背景色直接寫死成白色。從下方滑出來的面板，左右留白有三種，底部留白也有三種。二十七個檔案各自決定按鈕停用時要淡到什麼程度。整個專案裡真正共用的元件只有一個開關。

這些都是一次一次「先這樣」留下的。每加一個功能，就多一種按鈕。

單子後半是計畫，分五個階段。第零階段是先把尺寸、間距、焦點框這些基本數值定下來，旁邊註明「不寫 code，設計師簽字」。底下還有一行加了粗的：第零階段沒有設計師簽字，不進第一階段。

九點十七分，第零階段的數值寫進去了。九點二十分，第一階段的按鈕元件寫好了，四種樣式、三種大小。中間隔了三分鐘。

那三分鐘裡沒有簽字。Futari 沒有設計師，那天晚上能簽的人只有我，而紀錄裡看不出我有停下來看過。

接下來的速度一樣快。九點二十五分寫好輸入框，九點二十七分寫好面板的上中下三段，九點三十一分拿安裝說明那一頁試著換上新元件。九點三十三分，一份設計文件進了專案，開頭寫著「已上線，首次出現在 1.1.2 版」。那時 1.1.2 還沒發，要等到十一點十八分。九點四十七分，那張工作單關掉了。十點二十四分到二十八分，記帳、記收入、結清、定期支出四個面板依序換成新的按鈕。

那份設計文件裡，已經沒有設計師這個角色了。它寫的是：任何工程師做新功能，都必須用這幾個元件。

我想了一下那一行粗體字是從哪裡來的。agent 寫計畫的時候，參考的是有設計師、有工程師、有人負責簽字的那種團隊。在那種團隊裡，這一關很合理，數值定了，元件才不會一直改。放到一個人的專案，它還在單子上，卻找不到人來守。沒有人說要拿掉它，它只是在三分鐘裡自己不見了。

那三分鐘裡還發生了一件小事。按鈕元件寫好三分鐘後，又改了一次：按鈕在讀取中的時候，原本畫面上只剩三個點，給視障使用者用的報讀軟體會念不出這顆按鈕叫什麼。修法是在三個點旁邊藏一個字，只給報讀軟體念。藏進去的字是英文的 Loading。Futari 的主要語言是繁體中文，這個字到今天還是英文。

三分鐘就修好一個無障礙問題，換成我自己動手，大概還想不到這一層。只是快到這個程度，中間沒有空檔讓人問一句：念給誰聽？

按鈕元件那一次修改裡，另外附了一頁樣品，把四種樣式、三種大小排在同一個畫面上。如果那天晚上有人要簽字，看的應該就是那一頁。我有沒有打開過，紀錄裡沒有寫。

計畫上寫給別人守的關卡，到了一個人的專案裡，要嘛自己真的停下來守，要嘛乾脆從計畫上劃掉。那天晚上兩樣都沒做。

Futari 在[作品集](https://southern-light.dev/works/)裡，網頁和 iPhone 都能試，程式碼放在 [GitHub](https://github.com/redtear1115/oikos)。

先不說了，我得去打開那頁按鈕樣品，補簽那一個晚上欠的字。

*這段 code 寫於 2026 年 5 月 19 日，文章整理於 2026 年 10 月。*

<!-- source: oikos | last_sha: 6287208 -->
<!-- 工作單（台北時間）:
#616～#632 共 17 張，2026-05-19 20:02:40～20:03:57 開立；#629 Button / Input / Sheet primitive 元件 20:03:44 開立、21:47 關閉
#629 內文：圓角 11 種、9 個獨立 className 組合；Input 3 種 pattern、bg-white 寫死；Sheet px-4／px-5／px-6、pb-6／pb-8／pb-12；既有 primitive 只有 Switch.tsx；27 個檔案 disabled:opacity-50；「Phase 0 — Token 凍結（不寫 code，設計師簽字）」「Phase 0 沒設計師簽字不進 Phase 1。」
-->
<!-- commits（台北時間）:
bf67755 2026-05-19 21:17 feat: add control-height / sheet-spacing / focus-ring tokens (design system phase 0, issue #629)
99045d3 2026-05-19 21:20 feat: Button primitive — 4 variant × 3 size + focus ring（含 app/(dashboard)/dev/design-system/page.tsx；Co-Authored-By: Claude Sonnet 4.6）
48a2184 2026-05-19 21:23 fix: Button a11y — aria-busy on loading state + preserve accessible name（加 <span className="sr-only">Loading</span>；2026-10-31 HEAD 仍是英文）
003b9cc 2026-05-19 21:25 feat: TextInput primitive
bec70a8 2026-05-19 21:27 feat: SheetHeader / SheetBody / SheetFooter with safe-area footer
242f5e8 2026-05-19 21:31 refactor: pilot-migrate InstallGuide to Button+Sheet primitives
1e3f298 2026-05-19 21:33 docs: add design-system-primitives spec（front matter status: shipped、first_shipped_in: v1.1.2；「Any engineer building new features must use…」）
9f18ba0／15ad9e5／299d04e／6287208 2026-05-19 22:26～22:28 SettlementSheet、IncomeSheet、RecurringRuleSheet、AddSheet 換成 primitives
27ba91b 2026-05-19 23:18 chore: release v1.1.2
-->
<!-- 改寫補充：原稿「grep 出 20 個 match」「八種 Button」查不到，改用工作單裡的稽核數字（圓角 11 種、組合 9 種）。原稿「v1.1.2 整版就是為了這顆 meta tag」不符：v1.1.2（23:18）包含整套 design system、FAQ JSON-LD 等，GSC meta tag 只是其中一筆。原稿「SVG icon 被 template 傳染、30 個 icon」不符：#630 只改了 AssetIcon 一個檔案（PlusIcon、TabIcons 本來就沒有 "use client"），那段拿掉。原稿 SEO、CSV／OFX／QIF、30 個小重構依一篇一個故事拿掉。 -->

