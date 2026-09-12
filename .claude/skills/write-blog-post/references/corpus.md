# 語料統計

量測對象：`src/content/blog/` 全部 83 篇（2026-05 ～ 2026-09）。
**這些數字是 skill 所有規則的依據。** 文章長多了、風格漂移了，回來重跑一次再更新這份。

重跑指令在本檔最後。

## 篇幅

| 指標 | 值 |
|---|---|
| 內文行數最短 | 13 |
| p25 | 30 |
| **中位數** | **45** |
| p75 | 64 |
| 最長 | 132 |

## 結構

| 分節方式 | 篇數 |
|---|---|
| 只用 `##` 標題 | 28 |
| 只用 `---` 水平線 | 25 |
| 完全不分節 | 23 |
| `##` 與 `---` 混用 | 7 |

- `##` 總數 185、`###` 總數 14、`####` **0**
- `## 收尾` 作為結尾節標題：19 篇
- 有 `##` 的 35 篇中，`##` 數量多落在 3–8 個

## 開場（無標題，83 篇全部沒有 `## 前言`）

| 家族 | 約略篇數 | 樣本 |
|---|---|---|
| 「你有沒有過那種…？」共感鉤子 | 28 | 「你有沒有過那種，code 一行都沒錯、測試全綠、release 也發了，結果功能照樣炸？」 |
| 「說真的／老實說／說來有點…——」自白 | ~20 | 「說來尷尬——我自己在 Futari 上新增了一張保險，填完才發現『咦怎麼沒有編輯按鈕』。」 |
| 直接丟現場（數字／指令／commit message） | ~15 | 「`grep -r "rounded-full px-4 py-2 bg-" app/` ——20 個 match。」 |

## 收尾

| 元素 | 篇數 |
|---|---|
| 斜體時間戳 `*這段 code 寫於…，文章整理於…*` | 68 |
| 「先不說了，我得去…」自嘲轉身 | 30 |
| `<!-- source: … -->` + `<!-- commits: … -->` provenance footer | 35 |

provenance footer 一律在檔案最末，前面隔一條 `---`。repo 代號用過 `oikos`（= futari）、
`wildcard`、`vanishwhisper`。

## 長文敘事骨架

有 code fence 又有 `##` 的 14 篇，節標題高度重複同一套敘事：

- 「先講…」開頭的節：15 篇文章用過
- 「誤診」字樣：6 篇；「真相」字樣：9 篇
- 實例（`android-supabase.md`）：
  先講前情：5/30 晚上的衝動 → 然後它開始怪怪的 → 當一日 Android 工程師 →
  真相：兩個 project、兩個星號 → 我學到的三件事

## 行內標記與排版

| 元素 | 篇數 / 83 |
|---|---|
| 破折號 `——` | 82 |
| 直角引號「」 | 82 |
| 行內 `` `code` `` | 75 |
| 粗體 `**` | 66 |
| 條列 `- ` | 27 |
| **code fence** | **16** |
| 引用 `> ` | 2 |
| 外部連結 `[](http…)` | 2 |
| **markdown 表格** | **0** |

code fence 的 16 篇中，14 篇同時有 `##`（長文），2 篇沒有。

## 標籤

全站用過的標籤全部落在 `CLAUDE.md` 的 30 個受控清單內，沒有例外。使用次數前段：

```
devlog 55 · futari 37 · ai 14 · postmortem 12 · wildcard 11 · security 11
architecture 11 · notes 10 · indie-dev 8 · gamedev 8 · vanishwhisper 7
firebase 7 · design-system 7 · database 7 · refactoring 6 · nextjs 5
```

每篇標籤數分布：2 個（28 篇）> 3 個（18）> 4 個（17）> 5 個（8）。

## 重跑統計

```bash
cd src/content/blog
# 結構分布
python3 -c "
import pathlib,re,collections
d=collections.Counter()
for f in pathlib.Path('.').glob('*.md'):
    b=re.sub(r'^---\n.*?\n---\n','',f.read_text(encoding='utf-8'),flags=re.S)
    b=re.split(r'\n---\n\n<!-- source:',b)[0]
    d[(bool(re.search(r'^## ',b,re.M)), any(l.strip()=='---' for l in b.split('\n')))]+=1
print(d)"
# 各元素篇數
for p in '——' '「' '**' '\`\`\`'; do printf '%s %s\n' "$p" "$(grep -lF "$p" *.md | wc -l)"; done
# 內文行數分布
for f in *.md; do echo $(( $(wc -l < "$f") - 6 )); done | sort -n | \
  awk '{a[NR]=$1} END {print "min",a[1],"p25",a[int(NR*.25)],"med",a[int(NR/2)],"p75",a[int(NR*.75)],"max",a[NR]}'
```
