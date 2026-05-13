import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

// 简单的 XML 转义，防止 URL/字符串里出现特殊字符破坏 feed
function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(context) {
  const articles = await getCollection('docs', ({ id }) => id.startsWith('articles/'));

  // 按 date 降序排列（不用 updated，避免老文章小改置顶破坏订阅体验）
  // 没有 date 的排到最后
  const sorted = articles.sort((a, b) => {
    const dateA = a.data.date ? new Date(a.data.date) : new Date(0);
    const dateB = b.data.date ? new Date(b.data.date) : new Date(0);
    return dateB - dateA;
  });

  // Feed 顶层 lastBuildDate 取所有文章 updated（缺省回退到 date）的最大值
  let lastBuild = new Date(0);
  for (const a of articles) {
    const u = a.data.updated ? new Date(a.data.updated) : a.data.date ? new Date(a.data.date) : null;
    if (u && u > lastBuild) lastBuild = u;
  }
  if (lastBuild.getTime() === 0) lastBuild = new Date();

  // 自引用 URL（atom:link rel="self"），用于符合 RSS 2.0 最佳实践
  const selfHref = new URL('/rss.xml', context.site).toString();

  const channelCustomData =
    `<language>zh-cn</language>` +
    `<lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>` +
    `<atom:link href="${escapeXml(selfHref)}" rel="self" type="application/rss+xml" />`;

  return rss({
    title: "NTLx's Blog",
    description: '技术洞察与实践笔记 — AI、系统运维、生物信息学',
    site: context.site,
    xmlns: {
      atom: 'http://www.w3.org/2005/Atom',
    },
    items: sorted.map((article) => {
      const pub = article.data.date ? new Date(article.data.date) : undefined;
      const upd = article.data.updated
        ? new Date(article.data.updated)
        : pub;
      // 注入 atom:updated 作为细粒度更新时间戳
      const itemCustomData = upd
        ? `<atom:updated>${upd.toISOString()}</atom:updated>`
        : undefined;
      return {
        title: article.data.title,
        pubDate: pub,
        description: article.data.description,
        link: `/${article.id}/`,
        ...(itemCustomData ? { customData: itemCustomData } : {}),
      };
    }),
    customData: channelCustomData,
  });
}
