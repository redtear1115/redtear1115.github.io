---
title: "把 Claude 當包工頭、Gemini 當小工，居然真的有用"
pubDate: "2026-05-28"
tags: ["ai", "devlog"]
draft: false
---
你有沒有過那種，明明手上有一把刀，卻硬要拿榔頭去切牛排的時刻？

先講一句：之前說好今天要測地端模型，抱歉啦，先 hold 一下——手上這幾條協作流程的工作跑完再回頭弄。今天的主角不是地端，是雲端兩隻模型的分工。

昨天我就是那個拿榔頭的人。前天為了想在地端跑模型沒搞成，我退而求其次——拿了一把 Vertex AI 的 key，靠 LiteLLM 在中間偽裝成 Anthropic 的 endpoint，把 Gemini 包成「Opus」餵給 Claude Code 用。理論上很美：superpowers 那套 skill 還能照跑，agent 流程不用動，模型直接抽換。

實際上呢？滿慘的。

跑是能跑啦，但體感像在跟一個喝醉的同事 pair programming——他會回應你，但每次回應品質都掉一截，而且很慢。我下一個指令，他想很久，然後給我一個「方向對但細節錯」的東西，我得再追問一輪、再修一輪、再 review 一輪。superpowers 那套設計本來是讓 Claude 自己跟自己對話、自己 plan、自己驗證，結果換了模型之後變成我得介入每一步——**等於 superpowers 沒在 work，只是有在跑**。

跑了一個下午，我大概產出了零點五個能用的東西。

---

今天起床洗完臉，我換了個策略。既然「讓 Gemini 假裝 Claude」效果這麼差，那不如**讓他們各做各的拿手事**。

Claude 我留著，只做兩件事：跟我討論、寫 plan。

superpowers 開著，我把今天想動的範圍丟給他，請他開 brainstorming 模式跟我來回幾輪。這部分 Claude 真的很穩——他會反問「你這個情境下其實 X 跟 Y 是兩件事，要不要拆開？」、會主動指出我沒想到的 edge case。討論完，我請他直接把每個結論寫成可執行的 plan：要動哪些檔案、預期的行為改變、怎麼驗證、跟誰相依。

然後重點來了——我把這些 plan 用 `glab` 一個一個開成 issue，plan 的內文整坨貼進 issue description。一個下午下來，**Claude 幫我產出了 12 個 issue**，每個都有完整的實作描述、驗收條件、跟相關 file path。

接著我開 Gemini，把 issue 丟給他。

「照這個 issue 做。」

就這樣。

---

Gemini 的角色從「假裝是 Claude」降級成「就是 Gemini」之後，反而做得比較好。他不用揣摩 superpowers 的 prompt 結構、不用模仿 Claude 的工作節奏、不用扛 plan 的策略決策——他只要看著一個寫得清清楚楚的 issue，把 code 改出來。

像是去工地給師傅一張畫好的施工圖，跟給他一句「啊你看著辦」的差別。

到下班前，**Gemini 修好了 2 個 issue**——其中一個是新功能的小切片，另一個是設定面的調整。還有 1 個比較大的 feature 正在改，估計明天能收尾。剩下的 9 個排在 backlog 等著被處理。

聽起來不多對吧？12 個開出來只完成 2 個。但對比昨天用 LiteLLM 那條路——一整天連一個有信心 merge 的 commit 都生不出來——這個數字其實滿感人的。

---

寫到這裡我才意識到，這件事的教訓不是「Gemini 比較爛」或「Claude 比較強」，而是**「不要讓模型去演他不會演的角色」**。

LiteLLM 偽裝那條路的問題不在於工具本身——LiteLLM 做為 proxy 沒什麼好挑剔的——而在於我預設「換 endpoint 就好，行為應該一致」。但 superpowers 的 prompt 是針對 Claude 的長 context、針對 Anthropic 的 tool use 行為、針對特定的 reasoning 風格寫的。把另一個模型塞進去，等於拿著錯的劇本上台。

換成今天這個分工——Claude 當包工頭（discuss + plan），Gemini 當小工（implement single issue），各自做擅長的事——速度跟品質都立刻上來。中間用 `glab` issue 當交接介面，順便還拿到了一個免費的 audit log，之後想知道「這段 code 為什麼長這樣」直接翻 issue 就好。

我猜這個 pattern 之後會變我的預設。模型協作的關鍵不是「找一個最強的模型用到底」，而是**「想清楚每個模型的 sweet spot，然後拿介面把他們黏起來」**。介面可以是 issue、可以是 markdown、可以是 spec file——重點是它得能被另一個模型沒有歧義地讀懂。

---

雖然講得很順，但老實說今天還是有點慢慢地啦。Claude 寫 plan 我等了不少時間、Gemini 跑 issue 也不是秒回——這套流程我是晚上 9 點開始跑的，弄到快 12 點才收工，三個小時換 2 個 issue 收尾、1 個還在路上，比直接讓人類寫還久。但至少**真的有東西被修好**，而不是像昨天那樣一整晚在跟模型對抗。能修好東西這件事，最近真的變成一種小確幸了。

先不說了，我得回去看 Gemini 那個大 feature 改到哪了——希望他沒有又跑去重構不相關的檔案。

*這些實驗進行於 2026 年 5 月 29 日晚上，文章也是當晚順手整理的。*
