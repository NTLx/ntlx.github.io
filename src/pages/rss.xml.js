import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const articles = await getCollection('docs', ({ id }) => id.startsWith('articles/'));
  // 按日期降序排列，没有日期的排到最后
  const sorted = articles.sort((a, b) => {
    const dateA = a.data.date ? new Date(a.data.date) : new Date(0);
    const dateB = b.data.date ? new Date(b.data.date) : new Date(0);
    return dateB - dateA;
  });

  return rss({
    title: "NTLx's Blog",
    description: '技术洞察与实践笔记 — AI、系统运维、生物信息学',
    site: context.site,
    items: sorted.map((article) => ({
      title: article.data.title,
      pubDate: article.data.date ? new Date(article.data.date) : undefined,
      description: article.data.description,
      link: `/${article.id}/`,
    })),
    customData: `<language>zh-cn</language>`,
  });
}
