// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	// site 将由 GitHub Actions 在构建时设置，这里设置默认值以启用 sitemap
	site: 'https://ntlx.github.io',
	integrations: [
		starlight({
			title: "NTLx's Blog",
			description: '技术洞察与实践笔记 — AI、系统运维、生物信息学',
			defaultLocale: 'root',
			locales: {
				root: {
					label: '简体中文',
					lang: 'zh-CN',
				},
			},
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/NTLx/ntlx.github.io',
				},
				{
					icon: 'rss',
					label: 'RSS 订阅',
					href: '/rss.xml',
				},
			],
			// SEO 优化
			head: [
				// Google Analytics (gtag.js)
				{
					tag: 'script',
					attrs: {
						async: true,
						src: 'https://www.googletagmanager.com/gtag/js?id=G-9G66JC6HXW',
					},
				},
				{
					tag: 'script',
					content: `
						window.dataLayer = window.dataLayer || [];
						function gtag(){dataLayer.push(arguments);}
						gtag('js', new Date());
						gtag('config', 'G-9G66JC6HXW');
					`,
				},
				{
					tag: 'meta',
					attrs: {
						property: 'og:image',
						content: 'https://ntlx.github.io/og-image.png',
					},
				},
				// RSS Autodiscovery
				{
					tag: 'link',
					attrs: {
						rel: 'alternate',
						type: 'application/rss+xml',
						title: "NTLx's Blog RSS Feed",
						href: '/rss.xml',
					},
				},
			],
			// 编辑此页链接
			editLink: {
				baseUrl: 'https://github.com/NTLx/ntlx.github.io/edit/main/',
			},
			// Favicon
			favicon: '/favicon.svg',
			// 404.md in docs is the custom 404 page; avoid a duplicate injected route.
			disable404Route: true,
			// 自定义 CSS：引入霞鹜文楷 Screen，仅作用于文章正文
			customCss: ['./src/styles/fonts.css'],
			// 显示最后更新时间
			lastUpdated: true,
			// 覆盖 Head 组件：按页注入 og:image（文章取正文首图）+ BlogPosting JSON-LD
			components: {
				Head: './src/components/Head.astro',
			},
			sidebar: [
				{
					label: '开始',
					items: [
						{ slug: 'about' },
					],
				},
				{
					label: '文章',
					collapsed: true,
					items: [{ autogenerate: { directory: 'articles' } }],
				},
				{
					label: 'AI 辅助编程',
					collapsed: true,
					items: [{ autogenerate: { directory: 'ai-tools' } }],
				},
				{
					label: '操作系统',
					collapsed: true,
					items: [{ autogenerate: { directory: 'operating-systems', collapsed: true } }],
				},
				{
					label: 'HPC 与集群',
					collapsed: true,
					items: [{ autogenerate: { directory: 'hpc-cluster' } }],
				},
				{
					label: '网络与代理',
					collapsed: true,
					items: [{ autogenerate: { directory: 'network-proxy' } }],
				},
				{
					label: 'DevOps 与工具',
					collapsed: true,
					items: [{ autogenerate: { directory: 'devops', collapsed: true } }],
				},
				{
					label: '生物信息学',
					collapsed: true,
					items: [{ autogenerate: { directory: 'bioinformatics' } }],
				},
				{
					label: '指南',
					collapsed: true,
					items: [{ autogenerate: { directory: 'guides' } }],
				},
			],
		}),
	],
});
