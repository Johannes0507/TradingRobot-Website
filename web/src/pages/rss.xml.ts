/**
 * Top-level RSS feed combining blog + guides.
 * Available at /rss.xml — link this in Layout <head> for autodiscovery.
 */
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  return rss({
    title: 'wen control Blog',
    description: 'Bitfinex 自動放貸策略、市場觀察、產品開發紀錄。',
    site: context.site!,
    items: posts
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        link: `/blog/${post.id}/`,
      })),
    customData: '<language>zh-TW</language>',
  });
}
