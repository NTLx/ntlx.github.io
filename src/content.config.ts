import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				// 发布日期：用于 RSS pubDate 与文章排序。
				date: z.coerce.date().optional(),
				// 修订日期：追加后用于 RSS 顶层 lastBuildDate 与 item 级 atom:updated。
				updated: z.coerce.date().optional(),
				// 文章分类：6 选 1，索引页基于此动态生成。
				category: z
					.enum([
						'ai-coding',
						'ai-agents',
						'ai-industry',
						'ai-models',
						'security',
						'engineering',
					])
					.optional(),
				// 标签：未来可用于 tag 索引或 SEO，本期 schema 仅声明，不强制使用。
				tags: z.array(z.string()).optional(),
			}),
		}),
	}),
};
