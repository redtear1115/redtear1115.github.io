# Award-review overlay — southern-light.dev (rubric v2)

Owner answers 2026-10-03.

## Scoped pages (production-like: `npm run build` + `astro preview` on :4321)
- `/` home
- `/blog` archive
- one post page — fixture: the newest post at base commit e8b0d00 (`/blog/<slug>`, slug recorded in the round-1 sheet)
- `/about`

Out of scope: `/tags/*`, `/search`, `/rss.xml`.

## Fixture
Static content, no clock-driven state. Score against `src/content/blog` as of base commit e8b0d00. Viewports: 390×844 at DPR 3, and 1440×900.

## Primary task (U1)
A reader finds and reads a whole article: from the home page the newest post is unmistakable and one tap away, and the post page is comfortable to read to the end.

## Concept (C-checks)
Southern Light = 南極光 / ice-ocean. Aurora and ice crystal are the world. Signature moments should come from it (light, sky, ice), not from a generic dev-blog template.

## Must NOT be penalised / must not change (owner decisions)
- The aurora / ice-ocean theme and the Nord code palette.
- Article content, tags and the 31-tag controlled list (CLAUDE.md). Only presentation changes.

Allowed to change (owner chose "large: rework home and layout"): home page structure, page layout and sidebar structure, header/footer, card design, typography, motion. The Ko-fi widget and GA stay functional (third-party; not designed away).

## Check wording
- D5 imagery: the site has no photos; judged on the aurora / ice generative art and any SVG/CSS art.
- T4 media: no post media required; judged on code blocks and tables inside posts.

## Rounds
| Round | Weighted | D | U | C | T | Result |
|---|---|---|---|---|---|---|
| 1 | 7.13 | 7.08 | 7.58 | 6.83 | 6.50 | FAIL (C, T < 7.0) |
| 2 | 7.56 | 7.58 | 7.83 | 7.33 | 7.13 | PASS (narrow: T margin 0.13) |

Round 2 was scored on the build before the small bug-fix batch (Kp scale, sidebar cap, CJK breaks, 404, aria-live). Those fixes were verified by gates and a 101-post title scan, not re-scored.
Gates at the end: G1 perf 98 / a11y 100 / BP 100 / SEO 100, LCP 2.36-2.39s, CLS 0; G2-G5 pass; text contrast >= 4.5 over the brightest aurora and horizon states.

## Settled calls (do not flip-flop)
- Ice/ocean may be drawn (horizon, facets, crest) — consistent with the owner's theme decision.
- Fonts: Instrument Serif (Latin display only) + JetBrains Mono 400, self-hosted; body is the system stack. Inter was dropped for LCP (web-font bytes on the critical path).
- Aurora peak brightness is set at build time from Kp (1 level per 4 posts in the last 30 days, cap 9) and capped at the contrast-tested maximum (0.55 / 0.42).
- Aurora and horizon dim over the first 35vh of scroll so text beside the sky always keeps >= 4.5:1.
- Home tag cloud is capped at 12; /blog shows all tags. Post and About pages use a single reading column; no tag sidebar there.
- Ko-fi widget stays, loaded after `load`; its iframe gets a title.

## Remaining gaps (ranked) / owner questions
1. D5 / D1: the ice reads as a ridge line, not a shelf — fills and rim light are very low contrast. Needs a drawn flat-topped shelf with crevasse facets.
2. D4: posts without a table of contents (<3 `##`) are still one centred column on desktop.
3. C3: the sky never looks different at different times (build-time only).
4. Owner question: Ko-fi pill covers content on every mobile fold. Move/offset it, or show it only after the first scroll?
5. Owner question: the tag list on /blog shows tags outside the 31-tag controlled list (系統設計, 業務規則, 資安, 提權, 內部威脅, shipping, infra, release, feature-interaction). Content, untouched.
6. Owner question: About body is English while posts are Chinese. Rewrite in Chinese (needs the owner's words)?
7. Owner question: keep Instrument Serif? The design hook flags it as a common choice.
