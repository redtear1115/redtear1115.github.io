---
title: "朋友問能不能記收入，我答應了，但收入不算進兩個人誰欠誰"
pubDate: "2026-05-17"
tags: ["futari", "devlog"]
draft: false
---
Futari 是給兩個人一起記生活帳的家計簿。它一開始只會記支出：誰付了房租、誰買了菜、這筆要怎麼分，最後算出兩個人之間誰欠誰多少。

5 月初找朋友試用，有一位問我：「能不能記收入？」

最省事的做法，是在原本記支出的表單上加一個「支出／收入」切換，同一張表單、同一套欄位，切過去就變成進帳。這個做法在三輪設計討論裡被刪掉了。

卡住的地方在於 Futari 的帳本本來就是為了算「兩個人之間」而存在的。支出有付款人、有分攤比例，每一筆都會動到兩個人的結餘。薪水不一樣，我的薪水進來，另一半並沒有因此欠我什麼；紅包、退稅、保險理賠也是。收入如果跟支出共用一張表單，就得回答「這筆要怎麼分」，而這題對收入來說根本不該出現。

所以最後收入另外記在一本帳裡，完全不參與兩個人的結算。每一筆記的是錢進了誰的口袋、什麼類別、哪一天，備註寫不寫隨意。首頁上方多一個「支出／進帳」的切換，切到進帳，主色換成薄荷綠，按加號開的是另一張專門記收入的表單。也討論過長按加號叫出收入表單，可是隱藏功能得教，沒人教的話誰會想到要長按？就沒做。

類別名稱改過一次。5 月 5 日晚上，程式裡第一次有收入類別，寫的是勞務、投資、租金、利息、補助、售產、借貸、業務、其他，讀起來像報稅單。兩個人過日子，很少有人會說「這個月勞務收入多少」吧。隔天中午照設計文件換成薪水、獎金、滿期還本、保險理賠、紅包禮金、退稅、副業、其他，八個都是家裡會講的話。滿期還本和保險理賠是刻意放進去的，儲蓄險到期那天一定會有一筆錢進來，選這兩類時，表單會問要不要連到哪一張保單，之後保單頁就能看到繳了多少、拿回多少。

記完一筆收入，那一列會淡淡亮一下薄荷色再退掉。設計文件裡寫明了不要撒彩帶、不要彈跳。收入是兩個人生活裡開心的時候，可是 Futari 的個性比較收斂，亮一下就夠了。

5 月 6 日中午，後端那半邊在十幾分鐘內接連進了好幾個改動，下午三點半左右，收入表單上了畫面。動手那天這麼快，是因為最難的那題在前面幾輪討論裡就決定了。收入不算進誰欠誰，這件事一定下來，後面每個畫面該長什麼樣子都跟著清楚了。

如果你們家也想把薪水、紅包和支出記在同一個地方，可以到[作品集](https://southern-light.dev/works/)找 Futari，首頁切到進帳試試看。

先不說了，我得去處理設計文件裡還掛著的那一條：「記帳」「紀錄」「進帳」三個詞，到現在還在混用。

*這段 code 寫於 2026 年 5 月 6 日，文章整理於 2026 年 10 月。*

<!-- source: oikos | last_sha: b862c3bb5e3832a444f98043e61ce97fbff0dc4a -->
<!-- commits:
- ef93b1dbf8 2026-05-06T03:44:40Z migrate: IncomeTransactions table + RLS + realtime + pg_cron cleanup
- 11c9d32fc4 2026-05-06T03:45:24Z feat(income): IncomeTransactions schema + categories rewrite to spec + mint palette token
- 24394ab00f 2026-05-06T03:46:27Z feat(validators): validateIncomeInput
- 2b02a422b1 2026-05-06T03:48:02Z feat(income): listIncomesPaged + listFeedAllPaged UNION query
- 160e20775e 2026-05-06T03:50:37Z feat(income): server actions create/edit/softDelete + loadMoreIncomes
- 06b1253b60 2026-05-06T03:59:35Z fix(migrate): restore FuelLogs cleanup in pg_cron body (regressed by 0012)
- 35e65dd125 2026-05-06T04:00:07Z fix(income): editIncome soft-delete inside tx with returning + length check (mirror editTransaction)
- f43d03efb7 2026-05-06T04:00:33Z refactor(income): listIncomesPaged uses spread-conditions pattern to avoid base-predicate duplication
- 6775383ce2 2026-05-06T04:36:11Z ui(assets): fix AssetSheet height — switch from maxHeight to fixed height
- b862c3bb5e 2026-05-06T04:43:48Z ui(assets): collapse 房子/保險 under 「更多」 + add house icon
-->

