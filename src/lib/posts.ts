import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/** All published posts, newest first. */
export async function allPosts(): Promise<Post[]> {
  return (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** The four projects the blog is about (controlled tag list in CLAUDE.md). */
export const PROJECT_TAGS = ['futari', 'wildcard', 'vanishwhisper', 'marsdawn'] as const;

export interface Station {
  tag: string;
  count: number;
  latest: Date;
  latestTitle: string;
  latestSlug: string;
}

export function stations(posts: Post[]): Station[] {
  return PROJECT_TAGS.flatMap((tag) => {
    const mine = posts.filter((p) => p.data.tags.includes(tag));
    if (!mine.length) return [];
    const latest = mine[0];
    return [{ tag, count: mine.length, latest: latest.data.pubDate, latestTitle: latest.data.title, latestSlug: latest.slug }];
  }).sort((a, b) => b.latest.valueOf() - a.latest.valueOf());
}

/**
 * Aurora forecasts use the Kp index (0-9). Same idea for writing, on a fixed scale
 * anyone can read: every 4 posts in a window is one level, capped at 9.
 */
export function kpScale(count: number): number {
  if (count <= 0) return 0;
  return Math.min(9, Math.ceil(count / 4));
}

const DAY = 86_400_000;

/** Posts in the 30 days up to the newest post (a quiet build still has a baseline). */
export function recentActivity(posts: Post[]) {
  const newest = posts[0]?.data.pubDate.valueOf() ?? 0;
  const count = posts.filter((p) => p.data.pubDate.valueOf() > newest - 30 * DAY).length;
  return { count, kp: kpScale(count) };
}

/** Related posts: most shared tags first, project tags weigh double, newest breaks ties. */
export function related(current: Post, posts: Post[], limit = 3): Post[] {
  const mine = new Set(current.data.tags);
  return posts
    .filter((p) => p.slug !== current.slug)
    .map((p) => ({
      p,
      score: p.data.tags.reduce((s, t) => s + (mine.has(t) ? ((PROJECT_TAGS as readonly string[]).includes(t) ? 2 : 1) : 0), 0),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.p.data.pubDate.valueOf() - a.p.data.pubDate.valueOf())
    .slice(0, limit)
    .map((x) => x.p);
}

/** First readable paragraph of a post body, for one-line excerpts. */
export function excerpt(body: string, max = 110, keep = max - 1): string {
  const cleaned = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/^#{1,6}\s+.+$/gm, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_]{1,3}([^*_\n]+)[*_]{1,3}/g, '$1')
    .replace(/^[-*+>]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '');
  const first = cleaned.split(/\n\n+/).map((p) => p.trim().replace(/\n/g, ' ')).find((p) => p.length > 10) ?? '';
  return first.length > max ? first.slice(0, keep) + '…' : first;
}
