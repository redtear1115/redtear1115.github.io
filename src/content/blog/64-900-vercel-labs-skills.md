---
title: "Wildcard 幫玩家取的名字裡有九種雲，第二天早上，雲就不能出牌了"
pubDate: "2026-11-09"
tags: ["wildcard", "gamedev", "devlog"]
draft: false
---
Wildcard 是我自己在做的一款叫人出門撿東西的對戰遊戲。拍下一樣東西，系統認出是哪一種，再拿去跟別人比。三種東西互相剋，跟剪刀石頭布一樣。4 月底的時候，這三種是石頭、樹枝和雲朵。

玩家不用自己取名字。4 月 25 日晚上九點多，我讓系統在玩家打完第一場、要記進排行榜的那一刻，隨手給他一個。名字是兩半拼起來的：前面一個形容詞，從八個裡挑，像「迷霧中的」「雨後的」「清晨的」；後面一個名詞，也是八個，「石頭」「樹枝」「雲朵」「苔蘚」「松果」之類。拼起來就是「雨後的苔蘚」「清晨的松果」，一共六十四種。

四十分鐘後，排行榜多了一塊對戰紀錄，列出每一場的對手是誰。對手還沒有名字的時候，畫面寫「神秘挑戰者」；跟系統打的那幾場，寫「野地系統」。

六十四個名字不算多，玩的人一多，一定會有兩個人叫同一個名字。第二天上午十一點半，名字後面多了一小段灰色的字，一個井字號加四個字元，取自每個帳號編號的前四碼。「雨後的苔蘚」可以有好幾個，靠後面那四碼分開。

那天晚上八點半，名字的池子整個換過。形容詞從八個變成三十個，分成三組：一天裡的時候，像「黃昏的」「星空下的」；天氣和節氣，像「颱風後的」「霜降的」「芒種的」；還有地方，像「斷崖的」「潮間帶的」「峽灣的」。名詞也變成三十個，這次照著三種牌分組：岩石十二個，從「玄武岩」到「黑曜石」；樹枝九個，「相思木枝」「木麻黃枝」「茄苳枝」都在裡面；雲朵也是九個，「積雲」「卷雲」「夜光雲」。三十乘三十，九百種。「霜降的黑曜石」「潮間帶的木麻黃枝」「星空下的夜光雲」，每個人拿到的名字，都屬於三種牌的其中一種。

隔天早上十點二十分，雲朵不再是一種牌了。

修改紀錄沒寫為什麼要換。原因在我：之前討論第三種牌該是什麼，最後的結論我記錯了，雲朵是照著我記錯的版本做出來的，前一晚的名字池也跟著它分了組。

那天的修改把第三種牌換成樹葉。認圖的那份字詞表，原本對照雲的那些字換成對照葉子的；檢查的順序也調過，先認葉子再認樹枝，免得一張拍葉子的照片，因為裡面有「樹」，被算成樹枝。牌上的圖示從一朵雲換成一片葉子。程式內部替這種牌取的代號沒動，還是英文的 paper，剪刀石頭布裡的布。

同一筆修改裡，名字池的九朵雲也換掉了，換成「楓葉」「銀杏葉」「蕨葉」「竹葉」「松針」「茶葉」「桂葉」「桑葉」「油桐葉」。名字是照著牌分組的，牌換了，名字跟著換，九百種還是九百種。

這次修改還做了另一件跟名字有關的事。名字原本要等打完第一場才給，這一天改成第一次登入就給。修改說明裡寫了原因：不想再讓人看到「神秘挑戰者」。剛加入、還沒打過的人被別人挑戰，結果頁上的對手欄現在也會寫出他的名字和那四碼。

換掉的只有池子。名字只在第一次產生時從池子裡挑，之後就存著，玩家也能在首頁自己改。從 25 日晚上到 27 日早上，拿到「雲朵」或某一種雲當名字的人，名字會一直留著，「星空下的夜光雲」還是會出現在排行榜上，只是遊戲裡已經沒有雲這種牌了。這段時間裡有沒有人真的拿到雲的名字，修改紀錄看不出來。

這幾筆修改都是我跟 agent 一起寫的。名字照著牌分組，是擴池子那晚定的；第二天換牌，名字池也在同一筆修改裡換掉。只有已經發出去的那些名字，沒有人去動。

Wildcard 的牌面為什麼是 emoji，我在[這篇](https://southern-light.dev/blog/wildcard-emoji-is-not-a-stone/)寫過。其他作品在[作品集](https://southern-light.dev/works/)。

先不說了，我得去排行榜上找找看，還有沒有人叫做某某雲。

*這段 code 寫於 2026 年 4 月 25 日到 27 日，文章整理於 2026 年 11 月。*

<!-- source: wildcard（私有 repo） | last_sha: 5fe9d3e -->
<!-- commits（台北時間）:
ed0f277 2026-04-25 21:39 feat: move Vision API to Cloud Function, add security rules, region asia-east1（首次出現 randomNickname，ADJECTIVES 8 × NOUNS 8；onBattleComplete 建 scores 文件時才產生 nickname）
d83f403 2026-04-25 22:20 feat: battle history in leaderboard, opponent nickname, saveBattleId（對手無名字 fallback「神秘挑戰者」、系統對戰「野地系統」）
e76a20b 2026-04-26 11:27 feat: nickname#xxxx display（DisplayName：#{uid.slice(0, 4)}，灰色等寬字）
aeccd7d 2026-04-26 20:36 feat: expand random nickname pool (8×8 → 30×30, 64 → 900 combos)（ADJECTIVES 時刻 7＋氣候/節氣 12＋地景 11；NOUNS 依牌型 岩石 12＋樹枝 9＋雲朵 9）
5fe9d3e 2026-04-27 10:20 feat: leaf type + auth-time nickname + link-error modal + result opponent（Type swap: 雲朵 → 樹葉；vision-check order reordered so leaf-y photos aren't caught by 'tree' in scissor words；NOUNS 雲朵 subset replaced with leaf names；Internal type id stays 'paper'；ensureScore callable 首次登入建 scores＋隨機名字 "avoids 神秘挑戰者 fallback"；Result 顯示對手 DisplayName）
Home.jsx：玩家可改 nickname（updateDoc scores/{uid}）。
-->
<!-- 改寫補充：原稿說名字邏輯「藏在 ensureScore」，ensureScore 是 4/27 才加的；4/26 擴池時名字仍在 onBattleComplete 產生。原稿「剪刀石頭布版的雲」那時確實是牌型之一，隔天就換成樹葉，改當主線。gitignore agent skills／skills-lock.json（8820395、36cf6a1，4/26 11:43～11:44）依一篇一個故事拿掉。舊的 8×8 名詞池也有「雲朵」，所以帶雲的名字從 4/25 21:39 起就可能產生；有沒有玩家真的拿到，repo 查不到（在 Firestore）。2026-11-02 Ray 補充：換成樹葉的起因是他記錯了討論的最後結論。 -->

