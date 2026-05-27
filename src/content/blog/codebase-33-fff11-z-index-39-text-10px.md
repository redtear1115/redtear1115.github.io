---
title: "我的 codebase 裡有 33 個寫死的 `#fff`、11 種隨手敲的 z-index，跟 39 個 `text-[10px]` 等級的魔術數字"
pubDate: "2026-05-27"
tags: ["devlog", "futari", "release"]
draft: false
---
說真的，我以前都假裝沒看到這些東西。一個白色字 `'#fff'`、一個彈窗 `z-[100]`、一個小標籤 `text-[12px]`——每個單獨看都很合理，合在一起就是一鍋沒人敢動的湯。直到我想做 dark mode，發現要改前景色得手動 grep 33 個檔案，我才認清：這不是設計，這是技術債穿了件設計的外套。

所以這次我把它們全收進 token。先加一個 `--on-fill: #fff`——所有填色控制項（`--ink`、`--accent`、`--destructive` 當背景時）的前景色都指向它，未來要做高對比模式，改一個變數全站跟著動。原本散落的 button text token 也通通改成從 `--on-fill` 衍生。然後是 z-index：我把 11 個亂數收成一套 9 層的語意系統，從 `z-nav`（80）一路排到 `z-top-toast`（120），用 Tailwind 4 的 `@utility` 定義（試過放 `@theme` 結果 utility 沒生出來——別問，我問過了）。typography 也補了 `--text-mini`、`--text-caption`、`--text-meta` 三個尺寸，把 39 個 callsite 收編。

順手做了 a11y 掃描。原來那些 toggle chip 在切「選中／沒選中」時，螢幕報讀器完全聽不出差別——加上 `aria-pressed`，狀態才終於被講出來。還有 7 個純裝飾的 SVG（盾牌、空狀態圖示、編輯小鉛筆）被報讀器當成內容念出來，補上 `aria-hidden="true"` 讓它們安靜。

最後一件事最微妙：我去翻了 Futari 的研究文件，發現上面還寫「只支援台幣整數」「全資料庫加密」——兩個都過時了。實際上早就多幣別（TWD/CNY/USD/JPY），加密也是欄位級 AES-256-GCM，不是整顆 DB。文件比 code 還會說謊，這點我得認。

魔術數字最可怕的地方，是它們長得太像有人想過。其實沒有，那個人就是當時趕進度的我。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。*

---

<!-- source: oikos | last_sha: 0d47c76d056c79260d8f6740e3f873bbcca776b6 -->
<!-- commits:
6522aa5d53a8c1a8c5c20295744dd0a2cf96346e refactor: audit #670 tokens — on-fill / z-layers / text scale
cdd5536f64fc9b956c0f59aab3b71eea4900be74 refactor: audit #670 a11y — aria-pressed on toggles, aria-hidden on decorative SVGs
0d47c76d056c79260d8f6740e3f873bbcca776b6 docs: audit and update research docs (#667)
-->
