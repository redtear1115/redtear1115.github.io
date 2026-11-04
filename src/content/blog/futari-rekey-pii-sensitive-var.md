---
title: "七筆車牌和地址鎖得好好的，只是用錯了鑰匙，而對的那把我拿不出來"
pubDate: "2026-11-04"
tags: ["futari", "devlog", "security"]
draft: false
---
Futari 是給兩個人一起記生活帳的家計簿。除了每天的支出，它還有一頁記家裡一起照顧的東西，車和房子也在裡面，所以會存到車牌和地址。5 月 29 日深夜，我把這兩樣改成加密存放，畫面上預設遮住，要看的人自己點一下才顯示。

新存的資料，由網站自己加密。已經存在的舊資料，我寫了一支小程式，從自己的電腦連上正式的資料庫，一筆一筆補上加密的那一份。跑完之後檢查，還沒加密的筆數是零。隔天下午，我把舊的明文欄位刪掉，這段我在[〈車牌和地址加密之後，我隔天才敢刪掉舊的那一欄明文〉](https://southern-light.dev/blog/futari-drop-plaintext-columns/)寫過。

5 月 31 日下午，在正式的網站上點開一台車的車牌，跳錯。同樣的動作在我的開發環境一直都沒問題。

錯誤訊息只有一句「伺服器在畫這一頁時出了錯」，網站上線之後，為了不把內部細節露給外人看，訊息會被換成這種什麼都沒說的版本。三點五十五分，我先加了一段，把真正的錯誤送到我看得到的記錄裡。這次看到的意思是：解不開，這把鑰匙對不上當初上鎖的那把。

接著我拿開發環境的鑰匙去試正式資料庫裡的資料，車牌和地址解得開，一共 6 個車牌、1 個地址；孩子的姓名、身分證那幾欄反而解不開。正式網站自己的鑰匙剛好相反。

這樣就清楚了。孩子那幾欄是使用者透過網站存的，用的是網站的鑰匙。車牌和地址的舊資料，是我那支小程式從自己電腦補的，而我電腦上放的是開發環境的鑰匙。小程式很盡責地把七筆資料都鎖上了，用的卻是另一把鑰匙。

刪欄位之前那個「還沒加密的筆數是零」的檢查，問的是「鎖上了沒」，沒有問「我們自己的鑰匙打不打得開」。七筆資料都鎖得好好的，所以它通過了。

修法聽起來很單純：用開發的鑰匙打開，再用正式的鑰匙鎖回去。四點十八分，修復用的小程式寫好，原本的打算是從雲端把正式的鑰匙下載到本機，兩把一起用。

十七分鐘後，計畫改了。正式的鑰匙在 Vercel（我放網站的那家雲端平台）上設成了「敏感」，這種設定存進去之後，連我自己都看不到、也下載不了。當初選這個，就是怕哪天手滑把鑰匙外流，結果這一天，它把我也擋在外面。

繞過去的辦法，是讓修復在拿得到鑰匙的地方跑。我寫了一個只用一次的後台入口，放進一個測試用的部署版本裡。這個版本連的是同一個正式資料庫，帶的也是同一把正式鑰匙，所以修復在雲端上跑，鑰匙從頭到尾沒有離開過那裡。

這個入口能改寫加密資料，所以我加了幾道關卡。要帶一組只有我知道的通行碼才進得去。動手之前，先用網站的鑰匙打開一筆使用者自己存的資料，打得開才證明手上真的是正式的鑰匙，打不開就整個停下來，一筆都不寫。預設只演練、不寫入，要明確說「這次是真的」才會動手。

四點五十八分，第一次打過去，被網站的登入牆彈回登入頁。整個網站的入口都要先登入，伺服器之間的呼叫沒有登入這回事，請求連修復的程式都沒碰到。我把這個入口加進不用登入的名單，反正它自己有通行碼守著。

先演練一次，七筆全部認得出來，兩把鑰匙都打不開的是零筆。再真的跑一次，七筆全部換好鎖。打開 App 點那台車的車牌，出來了。

五點零九分，我把那個後台入口和登入牆的例外一起刪掉。一個能改寫車牌和地址的入口，就算有通行碼，也沒有理由一直留在網站上。修復用的小程式留了下來，跟當初補加密的那支放在一起，一支惹了麻煩，一支收拾麻煩。

那天下午卡最久的，是那把下載不了的鑰匙，可是出錯的地方，兩天前的深夜就埋下了：一支從我自己電腦跑的程式，用了我電腦上的那把鑰匙，而檢查它的，也是同一台電腦。

想替家裡的車或房子建一筆，可以到[作品集](https://southern-light.dev/works/)找到 Futari，程式碼放在 [GitHub](https://github.com/redtear1115/oikos)。

先不說了，我得去把那組通行碼也從雲端的設定裡刪掉。

*這段 code 寫於 2026 年 5 月 29 日到 31 日，文章整理於 2026 年 10 月。*

<!-- source: oikos | last_sha: 380c10c -->
<!-- commits（台北時間）:
3797c8e 2026-05-29 23:52 feat(assets): #826 phase 3 — UI mask + reveal for plate/address; backfill script
6f38754 2026-05-30 00:39 fix(scripts): encrypt-existing-pii reads DATABASE_URL（`node --env-file=.env.local`；"Discovered while running step 2 of the prod migration checklist"）
b80b808 2026-05-30 15:30 Merge PR: chore/drop-legacy-asset-columns（9d7d549：drop CarDetails.plate + HouseDetails.address，migration 0053 標為 pending prod migration）
be15080 2026-05-31 15:55 debug(assets): capture revealCarPlate error to Sentry（"revealCarPlate fails in prod but not dev"）
5f7b8e5 2026-05-31 16:18 fix(assets): add PII re-key repair script（dev key 解得開 6 plates + 1 address、解不開 app-written 欄位；原計畫 `vercel env pull` 取 prod key）
07d9392 2026-05-31 16:35 feat(admin): one-off in-runtime PII re-key endpoint（prod ENCRYPTION_KEY 是 Vercel Sensitive var，拉不出來；preview deployment 連同一個 prod DB、帶同一把 key；REKEY_ADMIN_TOKEN timing-safe；pre-flight 解 app-written row；dryRun 預設 true）
6f9fa10 2026-05-31 16:58 fix(proxy): let the re-key endpoint bypass the auth wall（307 到 /sign-in）
380c10c 2026-05-31 17:09 chore(assets): remove one-off re-key route + proxy bypass（7 rows: 6 plates + 1 address, totalBroken=0；"Remember to delete the REKEY_ADMIN_TOKEN env var from the Vercel Preview scope"）
5ba0230 2026-05-31 17:10 Merge PR: fix/reveal-car-plate
-->
<!-- 改寫補充：與另一篇舊稿（同一件事，slug blog-2026-05-31-pii-wrong-key-backfill）重複，這篇合併兩篇的事實，舊稿建議跳過。原稿「這段 code 寫於 5 月」保留，改為 5/29～5/31。舊稿寫「5/31 早上發現」，commit 最早是下午 15:17／15:55，正文寫「下午」。「還沒加密的筆數是零」沿用已發佈那篇的描述。 -->

