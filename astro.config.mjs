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
			description: 'AI Agent、AI Native 工程与真实系统实践',
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
			// 博客展示层覆盖：保留 Starlight 内容/搜索能力，文章使用博客化导航与元数据。
			components: {
				Head: './src/components/Head.astro',
				Header: './src/components/Header.astro',
				Sidebar: './src/components/Sidebar.astro',
				PageTitle: './src/components/PageTitle.astro',
				Pagination: './src/components/Pagination.astro',
				Footer: './src/components/Footer.astro',
			},
			sidebar: [
				{
					label: '开始',
					items: [
						{ label: '专题', slug: 'topics' },
						{ label: '技术笔记', slug: 'notes' },
						{ slug: 'about' },
					],
				},
				{
					label: '博客',
					collapsed: true,
					items: [
						{ label: '全部文章', slug: 'archive' },
						{ label: 'AI 编程实践', slug: 'articles/ai-coding' },
						{ label: 'Agent 与工具链', slug: 'articles/ai-agents' },
						{ label: 'AI 行业洞察', slug: 'articles/ai-industry' },
						{ label: '模型与研究', slug: 'articles/ai-models' },
						{ label: '安全', slug: 'articles/security' },
						{ label: '工程案例', slug: 'articles/engineering' },
					],
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
