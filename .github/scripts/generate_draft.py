"""Generate a blog draft from a batch of side-project commits via the Claude API.

Invoked by .github/workflows/daily-blog-draft.yml. Reads its inputs from
environment variables and writes `title` / `body` to $GITHUB_OUTPUT.

Kept as a standalone file (not an inline `run: |` heredoc) because the prompt
strings contain lines that start at column 0, which terminate a YAML block
scalar and make the whole workflow file fail to parse.
"""
import json
import os
import urllib.request
import urllib.error

system_prompt = """你是一個工程師部落客小編，替 Ray 寫技術 blog。

Ray 是 Staff Backend Engineer，同時在做幾個 side project：
- **Futari (oikos)**：給伴侶記帳的 PWA（Next.js + Supabase + Drizzle ORM，mobile-first）
- **VanishWhisper (vanishwhisper)**：端對端加密的閱後即焚聊天 app（Firebase + Vue）
- **wildcard / nebula**：其他 side project

### 寫作人設：Cassidy Williams 風格
- **先吐槽現況，再說修了什麼**：開頭點出「之前哪裡荒謬或不對勁」，讓讀者先點頭或笑，再說這次怎麼解決
- 輕鬆但不失專業，笑點藏在技術細節裡
- 多用破折號和括號插話，像在現場說話
- 帶到後端概念（db transaction、server action、validator、RLS 等），但不貼完整 code，用一兩行說明核心邏輯就好
- **中文夾英文技術詞**（API、commit、transaction、server action、type、schema 等保留英文）
- 第一人稱「我」
- 不要用「今天」「昨天」「最近」等模糊時間詞

### 文章結構
1. 開頭吐槽（1-2 句，點出問題或荒謬的起點）
2. 這次做了什麼（2-3 段，帶到技術細節但說人話）
3. 一個有趣的小插曲、踩坑、或設計決策（讓文章有個性）
4. 結尾一句話收（簡短，帶點幽默或自嘲）

### 長度
300-500 字（中文字數）

### 輸出格式
第一行：標題（純文字，不加 # 或引號）
空一行
正文（純 markdown，段落間用空行，可用 --- 分隔區塊，不要 frontmatter）"""

commits = os.environ.get('COMMITS', '')
diff_stat = os.environ.get('DIFF_STAT', '')
last_msg = os.environ.get('LAST_MSG', '')
repo = os.environ.get('CHOSEN_REPO', '')
existing = os.environ.get('EXISTING_TITLES', '')

user_content = f"""請根據以下 {repo} 的 commits 寫一篇文章。

## Repo
{repo}

## Commits（時間序，舊 → 新）
{commits}

## Changed files summary
{diff_stat}

## 最後一個 commit 的完整訊息
{last_msg}

## 已存在的文章標題（請避免重複題材）
{existing}"""

payload = {
    "model": "claude-opus-4-8",
    "max_tokens": 2048,
    "system": system_prompt,
    "messages": [{"role": "user", "content": user_content}],
}

req = urllib.request.Request(
    'https://api.anthropic.com/v1/messages',
    data=json.dumps(payload).encode(),
    headers={
        'x-api-key': os.environ['ANTHROPIC_API_KEY'],
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
    },
)

with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read())

text = data['content'][0]['text'].strip()
lines = text.split('\n')
title = lines[0].strip().lstrip('#').strip()
body = '\n'.join(lines[2:]).strip() if len(lines) > 2 else ''

with open(os.environ['GITHUB_OUTPUT'], 'a') as f:
    f.write("title<<EOF\n")
    f.write(title + "\n")
    f.write("EOF\n")
    f.write("body<<EOF\n")
    f.write(body + "\n")
    f.write("EOF\n")

print(f"Generated: {title}")
