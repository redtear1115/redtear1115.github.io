import { loadDefaultTraditionalChineseParser } from 'budoux';

const parser = loadDefaultTraditionalChineseParser();

// BudouX cuts inside Latin tokens ("ru|n", "0|/40", ".|.."): never break between two ASCII token chars.
const TOKEN = /[A-Za-z0-9./_\-+#@%'`]/;
// Dashes and ellipses may break on either side by default (UAX #14), and our <wbr> adds more
// opportunities, so a line could start with "——" or "...". U+2060 (word joiner) forbids the
// break and renders nothing; only the dash run is glued, the word after it stays breakable.
const LEADING_MARK = /^(?:[—–…⋯]+|\.{2,})/;
const MARK_AFTER_CHAR = /(?<=[^\s\u2060—–…⋯.])([—–…⋯]+|\.{2,})/g;
const WJ = '⁠';

/** Split a CJK string into phrases a line may break between (BudouX, zh-hant). */
export function phrases(text: string): string[] {
  const out: string[] = [];
  for (const part of parser.parse(text)) {
    const prev = out[out.length - 1];
    if (!prev) {
      out.push(part);
      continue;
    }
    if (TOKEN.test(prev.slice(-1)) && TOKEN.test(part[0])) {
      out[out.length - 1] = prev + part;
      continue;
    }
    const mark = part.match(LEADING_MARK)?.[0];
    if (mark) {
      out[out.length - 1] = prev + WJ + mark;
      const rest = part.slice(mark.length);
      if (rest) out.push(rest);
      continue;
    }
    out.push(part);
  }
  // dashes inside a phrase, e.g. "30/40——VanishWhisper": no break before them either
  return out.map((p) => p.replace(MARK_AFTER_CHAR, WJ + "$1"));
}
