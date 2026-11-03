---
title: "Futari 的房子頁上線那天中午，我收到的回饋是：不知道房子要記什麼"
pubDate: "2026-11-03"
tags: ["futari", "devlog", "design"]
draft: false
---
Futari 是給兩個人一起記生活帳的家計簿。除了每天的支出，它還有一頁記家裡一起照顧的東西，叫「愛物」：車、孩子、寵物、植物、房子，每一筆花費都可以掛在對應的那一個底下，點進去就看得到這個月和到目前為止，在它身上花了多少。

房子其實是最早進來的。5 月 2 日晚上，Futari 的第一版資料表就留了四種：車、房子、孩子、保險。寵物和植物是 5 月 5 日晚上才加的，卻比房子先有自己的畫面。那天晚上做完孩子、寵物、植物的詳細頁，房子還只是選單裡排不上的一格，圖示是一個灰色小方塊。

5 月 6 日早上八點十分，我開始補房子。先寫讀資料的那一段，再寫檢查輸入的規則和測試，接著是新增和編輯，然後是詳細頁頂端那條淡淡的底色，車是灰藍，房子給了木頭色。八點四十一分，最後一步把詳細頁接上。從頭到尾三十一分鐘。

會這麼快，是因為前一天已經把同一套流程走過三遍，房子只是照著再走一次。表單上有四格：名字、地址、購入日期、購入金額。名字的提示寫「例：我們家」。購入金額有填的話，存檔時會自動記下一筆「購入」的支出，掛在這間房子底下。詳細頁上面是本月和累計的金額，中間一行地址，下面是近期花費，沒有花費的時候只寫一句「還沒有任何花費」。

中午十二點四十三分，我把房子和保險收進選單的「更多」裡，給房子畫了一個真的圖示，屋頂、牆、一扇門。四分鐘後，設計文件多了一段，記下房子上線後的第一個回饋：

「房子有點空泛，我一時之間也沒有想到房子有什麼需要紀錄／照護的東西。」

打開房子的頁面，看到的是一格地址、一個購入日期、一行「還沒有任何花費」。車有加油紀錄可以填，寵物有出生日，植物有幾天澆一次水，房子什麼都沒有。表單做完了，該有的欄位都在，卻沒有告訴人這一頁拿來做什麼。

可是房子身上的錢一直都在花。每兩個月一張電費單，每年五月繳房屋稅，有房貸的話每個月一筆，大樓還有管理費。這些錢兩個人通常都會分。Futari 要記房子，記的就是這些，地址和購入日期只是讓人認得出是哪一間。

那段文件裡，我替每一種愛物都列了一排可能的花費。房子那一排最長：房貸、水電、管理費、房屋稅、第四台和網路、維修、裝潢、清潔費。文件也寫了該怎麼做：不要再加欄位，資料表已經夠了，缺的是讓人第一次點進來時就知道可以記什麼；一次只提示一件事，記了第一筆就自己消失；口氣要像給靈感，不要像教人用 app。原本打算排到保險做完之後再做。

結果下午四點十五分就做好了。房子、孩子、寵物、植物的詳細頁，在還沒有任何花費的時候，原本那一行字換成一張虛線框的小卡，標題是「可以記什麼？」，下面一排常見的花費，再一顆「記第一筆」。按下去，記帳的畫面會打開，而且已經掛好這間房子。只要記了一筆，小卡就不見了，沒有關閉的按鈕，也不用記住誰看過。

房子那張卡最後列了六樣：房貸、水電、管理費、維修、裝潢、清潔。設計文件裡那排的房屋稅和第四台、網路，沒有放進去。

早上那三十一分鐘，每一步都有測試可以跑。中午那句「不知道要記什麼」，沒有哪一條測試跑得出來，得有人真的點進去才會說。

這一頁為什麼叫「愛物」，我在[這篇](https://southern-light.dev/blog/futari-1/)寫過。Futari 在[作品集](https://southern-light.dev/works/)裡，網頁和 iPhone 都能試，程式碼放在 [GitHub](https://github.com/redtear1115/oikos)。

先不說了，我得去把這期的電費單掛到房子底下。

*這段 code 寫於 2026 年 5 月 6 日，文章整理於 2026 年 10 月。*

<!-- source: oikos | last_sha: aa7539e -->
<!-- commits（台北時間）:
59b84ff 2026-05-02 20:08 feat: define Drizzle schema for all tables（asset_type enum: car, house, child, insurance；HouseDetails: address / purchased_at …）
6ee04ca 2026-05-05 20:28 feat(schema): add pet + plant to asset_type enum (Slice 3)
b5d7f94 2026-05-05 23:40 feat(plant): PlantDetailClient + page.tsx routing（孩子／寵物詳細頁 22:51）
212b8ac 2026-05-06 08:10 feat(house): add getHouseDetails query
43151db 2026-05-06 08:23 feat(house): add validateHouseInput + tests
cd9bedc 2026-05-06 08:25 feat(house): add createHouse + editHouse server actions（purchasePrice > 0 → 自動新增 category housing、「購入 · 名稱」的支出）
7e10343 2026-05-06 08:27 test(house): add createHouse + editHouse action tests
d297530 2026-05-06 08:28 feat(house): add house tint to AibutsuHeader
c948a2f 2026-05-06 08:38 feat(house): add house tab + form fields to AssetSheet（名稱「例：我們家」、地址、購入日期、購入金額）
1d95a79 2026-05-06 08:40 feat(house): add HouseDetailClient page component（本月／累計、地址、近期花費、「還沒有任何花費」）
9593464 2026-05-06 08:41 feat(house): wire up house branch in asset detail page
68e9e5a 2026-05-06 10:36 feat(assets): unlock insurance CRUD via /assets type picker
b862c3b 2026-05-06 12:43 ui(assets): collapse 房子/保險 under 「更多」 + add house icon（「房子之前共用占位方塊，沒有真的 icon」）
c0f8583 2026-05-06 12:47 docs(aibutsu): note 愛物 onboarding tip as Phase 2.5 candidate（「user 反應：房子有點空泛…」；房子開銷情境：房貸、水電、管理費、房屋稅、第四台／網路、維修、裝潢、清潔費；何時做：等 Slice 5 保險 + IncomeSheet 完成後）
e88463a 2026-05-06 16:15 feat(aibutsu): wire onboarding hint into HouseDetailClient
aa7539e 2026-05-06 16:19 feat(aibutsu): add onboarding hint card to pet/child/plant/house detail pages（house: 房貸 · 水電 · 管理費 · 維修 · 裝潢 · 清潔；「記第一筆 →」；有交易後自動消失，無手動關閉）
-->
<!-- 改寫補充：原稿「房子 tile 在 TypePicker 冷板凳坐了快兩個版本」「第七種愛物（物品）先它一步落地」與 commit 不符：房子 5/2 就在資料表裡，畫面是 5/6 早上補的，前一晚先做的是孩子、寵物、植物，保險同一天 10:36 才開放，當時沒有「物品」這一種。原稿結尾「要不要做 onboarding hint？不要」也不符：同一天 16:15 就做了。保險圖示和空狀態文案那段依一篇一個故事拿掉。電費、房屋稅的例子依 Ray 10/26 補充；「每兩個月一張電費單、每年五月繳房屋稅」是台灣一般情況，非 commit 內容。 -->

