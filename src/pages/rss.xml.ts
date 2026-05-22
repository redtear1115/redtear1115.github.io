import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

function extractDescription(body: string): string {
  const cleaned = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/^#{1,6}\s+.+$/gm, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_]{1,3}([^*_\n]+)[*_]{1,3}/g, '$1')
    .replace(/^[-*+>]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '');

  const first = cleaned.split(/\n\n+/).map(p => p.trim().replace(/\n/g, ' ')).find(p => p.length > 10) ?? '';
  return first.length > 160 ? first.slice(0, 157) + '…' : first;
}

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: 'Southern Light',
    description: 'Notes on systems, tools, and side projects.',
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description ?? extractDescription(post.body),
      link: `/blog/${post.slug}`,
    })),
  });
}
