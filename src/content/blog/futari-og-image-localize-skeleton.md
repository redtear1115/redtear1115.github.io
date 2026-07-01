---
title: "五個 commit、一個下午——Futari 的 OG image 終於會說三種語言了"
pubDate: "2026-06-01"
tags: ["futari", "devlog"]
draft: false
---
你有沒有過那種，覺得某件事「之後再做就好」，然後某天突然手癢，三個小時就把它全部清掉的感覺？5月20日下午就是那種日子。

那天我連著 commit 了五件一直擱在清單裡的事，但其中最讓我有點點成就感的，是 OG image 的本地化——這件事我拖了蠻久的啊。

Futari 支援中文、英文、日文三個語系。之前三個語系全共用同一張 OG image，上面寫的是中文 tagline「兩個人的帳本」。這代表什麼？代表有人在 Twitter 分享英文版連結，preview 卡出來的圖寫的是中文，看起來超不搭。

修法其實不複雜：設計三張圖（`og-image.png`、`og-image-en.png`、`og-image-ja.png`），然後在 `lib/i18n/seo.ts` 裡依 locale 切換，再把全站所有用到 OG image 的頁面（sign-in、privacy、terms、migrate 的各個子頁）都補上。改了13個檔案——不難，但就是要一頁一頁過，沒什麼捷徑。

同一個下午還順手做了幾件小事：把 AssetSheet 裡最後 8 個裸 `<input>` / `<select>` / `<textarea>` 換成 DS 元件（終於把 #671 開始的掃尾工作收完啦）、修了一輪 JSON-LD graph 的 `@id` 連結問題、還有一件視覺上蠻有感的——把 dashboard 四個 tab 的 loading 從全黑 overlay 換成 per-tab skeleton screen。

那個黑 overlay 一直讓我很不舒服。切 tab 的時候整個畫面就黑一下，完全不知道在等什麼。換成 skeleton 之後，至少讓人感覺「欸，東西在 loading」而不是「欸，app 是不是壞了」。

五個 commit，最早的在14:59，最晚的在17:28，兩個半小時搞定。有時候就是有那種把清單掃空的日子吧。

先不說了，我去看看 OG image 在 LINE 預覽裡是不是還是壞的。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 6 月。*

---

<!-- source: oikos | last_sha: 9020d9b486c54537c0fb2f1da521c7837d60980e -->
<!-- commits:
ad895971542b0f608c58ec32ddf8b6cf710e409d refactor: migrate remaining raw primitives to DS components (#695)
539110b3930cccdfbdf391e974b0807c99768242 chore: SEO fixes — JSON-LD @id graph, en description length, HowTo anchors
dfd1e544cca7a8c5568124b53f195bfb116ad189 design: new Futari social share OG image (1200×630)
4523095b6d98811e0d43f0aca1da31b64daa0998 feat(seo): localize OG images for en / ja (#702)
9020d9b486c54537c0fb2f1da521c7837d60980e feat: skeleton loading for dashboard tabs
-->
