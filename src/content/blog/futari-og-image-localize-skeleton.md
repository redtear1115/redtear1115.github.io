---
title: "英文版的連結貼出去，預覽圖還寫著「兩個人，一本帳」"
pubDate: "2026-06-01"
tags: ["futari", "devlog"]
draft: false
---
Futari 是給兩個人一起記生活帳的家計簿，網頁版有繁體中文、簡體中文、英文、日文四種語言。

把網址貼進聊天室或社群貼文，下面會自動長出一張預覽卡，有標題、一句說明，還有一張圖。點不點進去，很多人就看這張圖決定。

Futari 這張圖，原本四種語言共用同一張，上面的大字是「兩個人，一本帳。」所以英文版或日文版的連結貼出去，說明文字是英文或日文，圖上卻是中文。看得懂中文的人沒差，其他人看到，大概會以為貼錯了。

這件事在我的待辦清單上放了很久，一直覺得不急。5 月 20 日晚上十一點半，先換上一張重新設計的預覽圖，玫瑰色和鼠尾草綠的光點，角落放一個日文的「二人」。十幾分鐘後又多了兩個語言版本：英文寫「Two people, one ledger.」，日文寫「ふたり、ひとつの家計。」繁中和簡中繼續用中文那張。

做法不複雜。三張圖從同一份版型產生，換一個語言參數，版型就換上那個語言的句子，再輸出成圖片。網站這邊看現在是哪個語言，就把對應的圖交給預覽卡。首頁、登入頁、隱私權政策、服務條款這些公開頁面，總共七頁，一頁一頁改過去。

比較意外的是日文。同一個版型，日文那句放進去會超出畫面，字級得另外調小。三種語言講的是同一句話，排出來的長度卻不一樣，沒辦法共用一個字級。

這不是什麼大功能，用 Futari 記帳的人大概一輩子不會注意到它。可是預覽卡常常是一個人第一次看到 Futari 的地方，那時對方還沒打開過 App，我也沒機會解釋。

如果你習慣用英文或日文，可以到[作品集](https://southern-light.dev/works/)找到 Futari 的網址，貼進聊天室看看那張卡長什麼樣子。

先不說了，我得去 LINE 上把三種語言的連結各貼一次，看預覽卡有沒有換對。

*這段 code 寫於 2026 年 5 月 20 日，文章整理於 2026 年 10 月。*

<!-- source: oikos | last_sha: 9020d9b486c54537c0fb2f1da521c7837d60980e -->
<!-- commits:
ad895971542b0f608c58ec32ddf8b6cf710e409d refactor: migrate remaining raw primitives to DS components (#695)
539110b3930cccdfbdf391e974b0807c99768242 chore: SEO fixes — JSON-LD @id graph, en description length, HowTo anchors
dfd1e544cca7a8c5568124b53f195bfb116ad189 design: new Futari social share OG image (1200×630)
4523095b6d98811e0d43f0aca1da31b64daa0998 feat(seo): localize OG images for en / ja (#702)
9020d9b486c54537c0fb2f1da521c7837d60980e feat: skeleton loading for dashboard tabs
-->

