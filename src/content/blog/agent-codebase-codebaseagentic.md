---
title: "「資產」改名「愛物」那天，有一句錯誤訊息沒跟上，到今天還在"
pubDate: "2026-11-05"
tags: ["futari", "agentic", "refactoring", "devlog"]
draft: false
---
Futari 是給兩個人一起記生活帳的家計簿。除了每一筆花費，也可以記家裡一起照顧的東西：車、房子、孩子、寵物、植物。這一頁叫「愛物」。

它一開始叫「資產」。[那頁一開始叫資產](https://southern-light.dev/blog/futari-1/)那篇寫過改名的經過：5 月 5 日晚上八點四十四分，全站畫面上的「資產」換成「愛物」，程式裡的命名一個都沒動。畫面上的字給人讀，程式裡的名字換了只會多出錯的機會。

這條界線畫得很清楚。漏掉的是介於兩者之間的東西：寫在程式裡、但最後會出現在畫面上的字。錯誤訊息就是這種。

記一筆花費時，可以順便選這筆錢是花在哪個愛物上，例如這次加油算在哪台車。存檔前程式會檢查一下：這台車還在不在這本帳裡？是不是已經被刪了？不對的話，就回一句話給畫面。這句話寫在程式裡。

那天凌晨十二點四十分，記花費的程式寫好，檢查的那句話是「關聯資產不在家計簿內」。那天晚上七點五十六分到八點零五分，加油紀錄的程式寫好，同樣的檢查照抄了三份，同樣寫著「資產」。四十分鐘後，畫面改名。這幾句話都在程式裡，不在改名的範圍。

隔天寫記收入，同樣的檢查又寫了一份，這次寫的是「關聯愛物」。之後定期支出也是「愛物」。於是同一個檢查，在不同的地方各寫一份，有的說資產，有的說愛物。

5 月 17 日晚上，agent 把整個前端掃過一遍，第一條就是這件事：三個記帳的程式各自抄了一份同樣的檢查，用字已經漂掉了，一份寫資產，一份寫愛物。九點二十六分，agent 把這幾份收成一份共用的檢查，統一寫「愛物」，修改說明和更新紀錄都寫著：照命名規則，把「關聯資產」統一成「關聯愛物」。

它清的是那張清單上列的檔案。加油紀錄的那三份不在清單上，沒有被動到，還是寫著資產。

到了 9 月 12 日，加油紀錄的編輯被查出少了一道檢查。補上的時候，照著同一個檔案旁邊的寫法，又多抄了一份「關聯資產」，連測試都寫成要看到這四個字。

9 月 14 日，Futari 把所有錯誤訊息改成代號，交給翻譯表去顯示，這樣英文和日文的使用者才不會看到一句繁體中文。原本的中文句子，一字不改搬進翻譯表。同一個檢查只能有一個代號，搬進去的那一句，是加油紀錄的「關聯資產不在家計簿內」。

那張翻譯表現在是這樣：英文寫 aibutsu，日文寫愛物，繁體中文和簡體中文寫資產。

5 月統一好的那份共用檢查也還在，裡面寫的仍然是「關聯愛物」，只是那句話已經不會出現在畫面上。會出現的是翻譯表那一句。一般人很少碰得到：得剛好在記一筆加油時選了一台車，而另一個人在那幾秒裡把車刪掉，畫面才會說「關聯資產已刪除」。

改名只改畫面，是刻意的；agent 照清單收拾，收得很乾淨；九月那次照著旁邊的程式抄，本來也是好習慣。每一步都說得通，只是每一步都只看到眼前那一段。

一段程式在專案裡被抄成好幾份，這件事人讀起來會皺眉，agent 讀起來不會。它會照它看到的那幾份去學，也照它被指到的那幾份去修。清單寫三個檔案，它就修三個檔案。第四份長得一模一樣，只是沒被點到名。

改名那天我只畫了「改哪裡」，沒去找「這個字還藏在哪裡」。同一句話在程式裡只寫一次，下次改名才找得齊。

Futari 在[作品集](https://southern-light.dev/works/)裡，網頁和 iPhone 都能試，程式碼放在 [GitHub](https://github.com/redtear1115/oikos)。

先不說了，我得去翻一下那張翻譯表，看「資產」這兩個字還躲在哪幾行。

*這段 code 寫於 2026 年 5 月 17 日，文章整理於 2026 年 10 月。*

<!-- source: oikos | last_sha: 16115e6 -->
<!-- commits（台北時間）:
1d1c4a1 2026-05-05 00:40 feat(transaction): accept assetId on create/edit + zombie keep exemption（「關聯資產不在家計簿內」「關聯資產已刪除」首次出現）
ded9cee 2026-05-05 19:56 feat(actions): createFuelLog／aa98328 20:02 editFuelLog／0899aac 20:05 softDeleteFuelLog（同一句照抄）
97430a8 2026-05-05 20:44 feat(ui): rename 資產→愛物 across all UI display layer
160e207 2026-05-06 11:50 feat(income): server actions（「關聯愛物不在家計簿內」首次出現）；f90a42f 2026-05-09 17:22 recurring-expense 同為「愛物」
#512 frontend code review findings（2026-05-17 20:39 開立）：「Three action files each inline their own asset ownership + soft-delete check, with drifted error messages ('關聯資產不在家計簿內' vs '關聯愛物不在家計簿內')」，列 actions/transaction.ts、income.ts、tripExpense.ts，未列 fuelLog.ts
faf0e9b 2026-05-17 21:26 refactor(actions): extract assertMember/AssetInGroup to lib/auth (#512)（「actions/transaction.ts had inline asset checks using the drifted error phrase「關聯資產」instead of the canonical「關聯愛物」」；Co-Authored-By: Claude Opus 4.7；此 commit 後 actions/fuelLog.ts 仍有 5 行「關聯資產」）
474ac26 2026-09-12 19:04 fix(fuelLog): editFuelLog 補上被編輯列的 group 約束 (closes #1032)（新增一處「關聯資產不在家計簿內」與對應測試）
8c48d18 2026-09-14 22:37 fix(i18n): server action errors throw codes, describeError localizes them (#1156)（「zh-TW sentences are unchanged word for word」；linked_asset_not_in_group：zh-TW「關聯資產不在家計簿內」、zh-CN「关联资产不在家计簿内」、en「The linked aibutsu isn't in this ledger」、ja「関連する愛物がこの家計簿にありません」；lib/auth/asset.ts 未改）
16115e6（2026-10-31 HEAD）：lib/i18n/locales/zh-TW.ts 仍為「關聯資產…」；lib/auth/asset.ts assertAssetInGroup 仍 throw「關聯愛物不在家計簿內」「關聯愛物已刪除」
-->
<!-- 改寫補充：原稿是觀點文（Clean Code WTF 指數、Google Code Review 五原則、七條原則），「40k tokens」「少掉差不多 1000 行」查不到出處，改寫成 #512 那次整理裡一個查得到的故事。原稿「Refactor #512」本身屬實（5/17 21:26～21:54 共 7 筆）。faf0e9b 實際 diff 為 7 個檔案 +64／−84。 -->

