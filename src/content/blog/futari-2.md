---
title: "不是每筆帳都該對半分，所以我把「各半」換成了一條滑桿"
pubDate: "2026-05-14"
tags: ["futari", "devlog"]
draft: false
---
Futari 是給兩個人一起記生活帳的家計簿。房租、買菜、小孩的花費，誰付的、該誰出，兩個人記在同一本帳上，隨時看得到現在誰欠誰多少。

最早的版本，一筆帳怎麼分只有三種選法：我全付、對方全付、兩個人各半。

這三種用起來很順，直到我想到一件很普通的事：很多家裡，兩個人的收入本來就不一樣。一個賺得多一點、一個賺得少一點，房租和水電卻硬是對半，帳是算清楚了，心裡不一定舒服。各半看起來最公平，其實只對收入差不多的兩個人公平。

所以 5 月 10 日晚上，我替 Futari 加了照比例分攤。

做法分兩層。第一層在設定頁，兩個人先講好一個平常的比例，比如六比四，用滑桿拉，一格是十個百分點。第二層在每一筆帳，新記的帳先套這個比例，遇到不想照平常比例分的那一筆，再單獨拉一下就好。

原本「各半」那個選項，我直接拿掉，換成這條滑桿。對半沒有消失，它只是滑桿上的一個位置。畫面上少了一個按鈕，能表達的分法反而多了。

改起來比我想的多。比例要存進每一筆帳，算誰欠誰的那段要多一種算法，清單上每一筆旁邊的小圖示要照比例填色，篩選紀錄時要挑得出照比例分的帳。連定期支出也得跟著吃這個比例，像房租這種每個月固定的支出，不接上的話，每個月自動長出來的那一筆又會變回各半。

這些在 5 月 10 日晚上一口氣接完，隔天凌晨十二點多發了新版。

做完我最大的感想是，這個功能寫的其實是兩個人怎麼過日子。不是每件事都五五開，Futari 該做的，是讓兩個人照自己講好的方式分。什麼叫公平，他們自己最清楚。

當然，比例這東西後來也讓我吃了苦頭：同一個六比四，在另一個人的手機上曾經整個反過來，那段寫在〈[我自己用一百次都對，因為我永遠站在帳本的同一邊](https://southern-light.dev/blog/bug-a/)〉。

如果你們家也是兩個人一起負擔生活，收入又不太一樣，可以到[作品集](https://southern-light.dev/works/)找 Futari，把平常的比例設進去試試看。

先不說了，我得去想想，除了錢，家裡還有哪些事其實也不是五五開。

*這段 code 寫於 2026 年 5 月 10 日，文章整理於 2026 年 10 月。*

<!-- source: oikos | last_sha: 843f4f2a41 -->
<!-- commits:
09454d623c 2026-05-10T15:04:11Z feat(schema): add weighted split_type + split_ratio_a columns
d21c7fb1b2 2026-05-10T15:04:11Z feat(balance): add weighted split type with splitRatioA
334f51a597 2026-05-10T15:04:11Z feat(balance): add weighted case to recalcGroupBalance SQL
28cb508048 2026-05-10T15:04:11Z feat(ui): SplitTypeSelector replaces half with weighted slider
443323fce7 2026-05-10T15:04:11Z feat(ui): SplitGlyph supports weighted kind with dynamic ratioA fill
682d8669c6 2026-05-10T15:04:11Z feat(ui): RecurringRuleSheet supports weighted split with slider
c9748a88ae 2026-05-10T15:04:11Z feat(ui): add weighted split filter option and i18n key
843f4f2a41 2026-05-10T16:07:13Z chore: release v0.14.1
-->

