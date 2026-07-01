---
title: "Futari 的 dashboard 只會哭窮——直到我幫它加了一個「進帳」模式"
pubDate: "2026-05-21"
tags: ["futari", "devlog"]
draft: false
---
說來好笑，我做了一個記帳 app，結果它只會記你「花了多少」。打開 Futari 的 dashboard，BalanceHero 上永遠是一個往下掉的數字——彷彿在提醒你「你又窮了一點」。但人不是只會花錢的（至少帳面上要假裝不是），薪水、轉帳、那筆久違的退款，總得有地方安放吧？所以這次我幫 dashboard 長出了第二個人格。

---

核心是一個 **ModeToggle**。切到「進帳」，BalanceHero 就讓位給 **IncomeHero**，FAB 打開的也從支出 sheet 換成 **IncomeSheet**。Records 頁那排 tab bar 也跟著多了「全部 / 支出 / 進帳」——同一份 list，靠一個 filter 切視角，而不是另外開一個頁面。為了讓進帳那一列在視覺上跟支出區隔，我給它加了一抹 mint glow，順手把 CompactRow 擴成能吃 `kind=income`，省得到處硬轉 type。

比較有意思的是 realtime 這塊。原本 RealtimeProvider 只訂閱支出交易，現在我讓它也 subscribe **IncomeTransactions**，insert 或 update 一進來就 refresh。換句話說——你老婆在另一支手機上補登了一筆薪水，你這邊的數字會自己跳，不用下拉重整。後端的 server action 維持單一真相，前端只是被推著走。

---

踩到的坑是「空狀態」。進帳模式剛開的人帳上一筆都沒有，總不能丟一張白畫面叫人尷尬。於是我做了個 **IncomeEmptyState**——星座加光暈的小動畫，與其說是 UI，不如說是替「還沒有收入」這件事找一個比較體面的講法。畢竟「你目前零收入」這句話，怎麼寫都很傷人。

到頭來這件事的本質很單純：同一個 dashboard，多了一個願意說你好話的模式。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。*

---

<!-- source: oikos | last_sha: 5d52b1761ae3a88d819121644096a68b8f7f591a -->
<!-- commits:
5eab5039 feat(income): Dashboard mode toggle + income hero card — wire ModeToggle, IncomeHero, IncomeSheet open from FAB
4c421864 feat(income): Records tab bar 全部/支出/進帳 + income row mint glow styling
90b3924d fix(records): extend CompactRow to accept kind=income, remove stale cast
d2fa53b8 feat(income): realtime income events — subscribe IncomeTransactions, refresh on insert/update
2a943248 feat(income): constellation+halo empty state for income mode
e488ad1c docs(specs): add aibutsu onboarding hint spec (Phase 2.5)
5d52b176 feat(insurance): vehicleId FK on InsuranceDetails — insurance↔vehicle bidirectional link, UI on both detail pages
-->
