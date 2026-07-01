---
title: "從 64 種暱稱卡到 900 種，順便偷學 vercel-labs 的 skills 規矩"
pubDate: "2026-05-08"
tags: ["wildcard", "ai", "notes"]
draft: false
---
說真的，我之前的 random nickname pool 只有 8×8 = 64 種組合，玩個幾局就會撞到一樣的「靜謐石頭」、「微涼樹枝」——不是說重複很糟啦，但 Wildcard 野地對戰本來就是「帶你的石頭來」這種 vibe，結果系統幫你取的名字比石頭還少，畫面有點微妙。

所以我把池子整個翻了一輪。形容詞拆成**時刻**（7 個）、**氣候/節氣**（12 個）、**地景**（11 個），名詞照卡牌主題分**岩石**（12）、**樹枝**（9）、**雲朵**（9）。30×30，900 種組合——剪刀石頭布版的雲，總算有點生態系的感覺。整個邏輯其實就藏在 `functions/index.js` 裡的 `ensureScore` Cloud Function——首次登入觸發、寫進 `scores/{uid}`，一次到位。

順手做的另一件事比較硬：把 agent skills（`.agents/` 跟 `.claude/`）從 git 裡拔掉，改用 `skills-lock.json` 鎖版本。這套 convention 是從 vercel-labs/skills 偷學的——把 skill 當 npm package 看，lock 檔進 git，實體檔當 `node_modules` ignore 掉，clone 完跑一行 `npx skills experimental_install` 就還原。一次砍掉 90 多個檔案的快感（誰不愛刪 code 呢），repo 也乾淨很多。

說起來有個小坑：當初塞 `.agents/` 進 repo 是因為「這樣同事 clone 下來就能直接用」——結果就是每次 skill 更新都伴隨幾十個 file 的 diff，PR 看起來像災難現場。Lock file 才是正解，這道理 npm 二十年前就講完了，我就是繞了一圈才想通。

900 個 nickname、一個乾淨的 repo——這禮拜的 chore 算值得。

*這段 code 寫於 2026 年 4 月，文章整理於 2026 年 5 月。*

---

<!-- source: wildcard | last_sha: aeccd7d66d49672a235a7b5b8a2e842cc1bc620d -->
<!-- commits:
  - 8820395242 chore: gitignore agent skills, restore via npx skills
  - 36cf6a1b4f docs: list gitignored folders + restore commands in folder structure
  - aeccd7d66d feat: expand random nickname pool (8×8 → 30×30, 64 → 900 combos)
-->
