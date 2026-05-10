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
			description: '个人知识库 - 系统管理、软件使用、生物信息学',
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/NTLx/ntlx.github.io',
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
			],
			// 编辑此页链接
			editLink: {
				baseUrl: 'https://github.com/NTLx/ntlx.github.io/edit/main/',
			},
			// Favicon
			favicon: '/favicon.ico',
			// 自定义 CSS(可选)
			// customCss: ['./src/styles/custom.css'],
			// 显示最后更新时间
			lastUpdated: true,
			sidebar: [
				{
					label: '开始',
					items: [
						{ label: '关于', slug: 'index' },
					],
				},
				{
					label: 'AI 辅助编程',
					collapsed: true,
					items: [
						{ label: 'Google Antigravity 最佳实践', slug: 'ai-tools/antigravity-best-practices' },
						{ label: 'Antigravity Tools 最佳实践', slug: 'ai-tools/antigravity-proxy-best-practices' },
						{ label: 'CLI 工具一键安装', slug: 'ai-tools/install-cli-tools' },
						{ label: 'Claude Code 自定义配置', slug: 'ai-tools/claude-code-config' },
						{ label: 'Oh My OpenCode 插件', slug: 'ai-tools/oh-my-opencode' },
						{ label: 'Playwright MCP 配置指南', slug: 'ai-tools/playwright-mcp-setup' },
						{ label: 'OpenClaw Installation', slug: 'ai-tools/openclaw-installation' },
						{ label: '微信公众号写作养成记', slug: 'ai-tools/wechat-article-ability-building' },
					{ label: 'AI Agent 赋能生物医学发现：Cell 论文解读', slug: 'ai-tools/biomedical-ai-agents' },
					],
				},
				{
					label: '操作系统',
					collapsed: true,
					items: [
						{
							label: 'Linux 发行版',
							collapsed: true,
							items: [
								{ label: 'Arch Linux', slug: 'operating-systems/linux/arch-linux' },
								{ label: 'CentOS 7.6', slug: 'operating-systems/linux/centos-7-6' },
								{ label: 'CentOS 8', slug: 'operating-systems/linux/centos-8' },
								{ label: 'Manjaro', slug: 'operating-systems/linux/manjaro' },
								{ label: 'Ubuntu 配置指南', slug: 'operating-systems/linux/ubuntu-guide' },
							],
						},
						{
							label: 'NAS 与虚拟化',
							collapsed: true,
							items: [
								{ label: 'UNRAID', slug: 'operating-systems/nas-virtualization/unraid' },
								{ label: 'VMWare', slug: 'operating-systems/nas-virtualization/vmware' },
								{ label: '黑群晖 DSM', slug: 'operating-systems/nas-virtualization/black-dsm' },
							],
						},
						{
							label: '嵌入式与其他',
							collapsed: true,
							items: [
								{ label: 'Raspberry Pi 4', slug: 'operating-systems/embedded/raspberry-pi-4' },
								{ label: 'MacOS', slug: 'operating-systems/embedded/macos' },
							],
						},
					],
				},
				{
					label: 'HPC 与集群',
					collapsed: true,
					items: [
						{ label: '安装 Slurm & OpenMPI', slug: 'hpc-cluster/install-slurm-openmpi' },
						{ label: '使用 Slurm & OpenMPI', slug: 'hpc-cluster/usage-slurm-openmpi' },
					],
				},
				{
					label: '网络与代理',
					collapsed: true,
					items: [
						{ label: 'Shadowsocks', slug: 'network-proxy/shadowsocks' },
						{ label: 'Privoxy', slug: 'network-proxy/privoxy' },
						{ label: 'Proxychains', slug: 'network-proxy/proxychains' },
						{ label: 'ZeroTier', slug: 'network-proxy/zerotier' },
						{ label: 'mDNS', slug: 'network-proxy/mdns' },
					],
				},
				{
					label: 'DevOps 与工具',
					collapsed: true,
					items: [
						{
							label: '开发环境',
							collapsed: true,
							items: [
								{ label: '使用 nvm 安装 Node.js', slug: 'devops/nodejs-nvm' },
							],
						},
						{
							label: 'Shell 与终端',
							collapsed: true,
							items: [
								{ label: 'Bash', slug: 'devops/shell-terminal/bash' },
								{ label: 'ZSH', slug: 'devops/shell-terminal/zsh' },
								{ label: 'Tmux', slug: 'devops/shell-terminal/tmux' },
								{ label: 'CLI 工具', slug: 'devops/shell-terminal/cli' },
							],
						},
						{
							label: '编辑器',
							collapsed: true,
							items: [
								{ label: 'VIM 使用指南', slug: 'devops/editors/vim-guide' },
								{ label: 'EditorConfig', slug: 'devops/editors/editorconfig' },
							],
						},
						{
							label: '版本控制',
							collapsed: true,
							items: [
								{ label: 'Git', slug: 'devops/version-control/git' },
							],
						},
						{
							label: '服务',
							collapsed: true,
							items: [
								{ label: 'n8n (Docker)', slug: 'devops/services/n8n-docker' },
								{ label: 'KMS 激活', slug: 'devops/services/kms-activation' },
								{ label: 'LLMs API', slug: 'devops/services/llms-api' },
							],
						},
					],
				},
				{
					label: '生物信息学',
					collapsed: true,
					items: [
						{ label: 'Snakemake 性能分析', slug: 'bioinformatics/snakemake-benchmark' },
					],
				},
				{
					label: '指南',
					collapsed: true,
					items: [
						{ label: '博客文章质量标准', slug: 'guides/blog-quality-standards' },
					],
				},
				{
					label: '文章',
					collapsed: true,
					items: [
					{ label: '1930年的AI不知道互联网，但能写代码', slug: 'articles/1930-ai-model-solves-modern-engineering' },
					{ label: '让 AI 写代码不再翻车：一个 TypeScript 巫师的 5 个 Agent Skills', slug: 'articles/5-agent-skills-for-ai-coding' },
					{ label: 'AI评测正在烧成一个新的算力黑洞', slug: 'articles/ai-eval-costs-bottleneck' },
					{ label: 'AI 不是你的聪明朋友', slug: 'articles/claudepersonalguidance' },
					{ label: 'AI 什么都做不了，除非你让它做', slug: 'articles/connecting-llms-to-the-real-world-t' },
					{ label: 'MCP 和 Skills：给 AI 装手还是装脑子', slug: 'articles/mcpvsskillsclearlyexplained' },
					{ label: 'AI 的规模之痛：当模型变强时，系统却在偷偷出错', slug: 'articles/scalingpainofcodingagent' },
					{ label: '当法律开始定义什么是"应用商店"，开源社区坐不住了', slug: 'articles/age-assurance-laws' },
					{ label: 'AI 写的代码，谁来审？', slug: 'articles/agent-pr-review' },
					{ label: 'AI在斯德哥尔摩开了家咖啡馆，然后被现实暴打了一顿', slug: 'articles/ai-cafe-stockholm' },
					{ label: '当你的 AI 同事开始用 HTML 跟你说话', slug: 'articles/ai-colleague-speaks-html' },
					{ label: 'AI 的账，算不清', slug: 'articles/ai-economics-doesnt-work' },
					{ label: '产品可以抄，但公司的形状抄不走', slug: 'articles/ai-era-company-moat' },
					{ label: '当AI开始设计运行自己的芯片：AlphaEvolve一周年回顾', slug: 'articles/alphaevolve-impact' },
					{ label: '当编程变成管理 Agent，非科班程序员的窗口才真正打开了', slug: 'articles/andrej-karpathy-agentic-engineering' },
					{ label: 'AI 时代最稀缺的能力：干就完了', slug: 'articles/anthropic-product-team-ships-fast' },
					{ label: '代码越来越便宜，品味越来越贵', slug: 'articles/code-cheaper-taste-pricier' },
					{ label: '编程没有被解决，只是被解决的那部分恰好最不重要', slug: 'articles/coding-not-solved-least-important-part' },
					{ label: '安全防守方不需要最大的模型——CyberSecQwen-4B 让我想通了一件事', slug: 'articles/cybersecqwen-4b' },
					{ label: '诺奖得主 Hassabis 的 50%：为什么造出 AlphaGo 的人对 AGI 不敢打包票', slug: 'articles/demis-hassabis-agents-agi' },
					{ label: 'EMO：MoE 的专家原来在给「的」和「了」打工', slug: 'articles/emo' },
					{ label: 'Firefox 默默修了 423 个安全漏洞，而我还在用 Chrome', slug: 'articles/firefox-ai-hardening' },
					{ label: '代码不过海关：GitHub如何变成国家竞争力的新标尺', slug: 'articles/github-as-national-competitiveness' },
					{ label: '我们都理解错了《Good Luck, Have Fun, Don\'t Die》——它是另一个版本的《黑客帝国》', slug: 'articles/good-luck-have-fun-dont-die-review' },
					{ label: 'GPT-5.5 网络能力评估：第二个了，这才是最可怕的', slug: 'articles/gpt55-cybersecurity-evaluation' },
					{ label: '8B 干翻了 32B：Granite 4.1 告诉我，大力不一定出奇迹', slug: 'articles/granite41-deep-dive' },
					{ label: '我读了 Hermes 的记忆系统，发现 AI 记性好不是好事', slug: 'articles/hermes-memory-system' },
					{ label: 'Elasticsearch 到 pgvector：Instacart 如何用 Postgres 干掉一堆专业搜索引擎', slug: 'articles/instacart-search-infrastructure-on-postgres' },
					{ label: '给你的 AI 编程工具装上「眼睛」：LSP 语言服务器完全安装指南', slug: 'articles/lsp-language-server-setup-guide' },
					{ label: '当写代码不再需要写代码', slug: 'articles/martin-fowler-fragments-april-2026' },
					{ label: '更强的模型只会让你陷得更快', slug: 'articles/martin-fowler-may-fragments' },
					{ label: '你的公司连自己在干啥都说不清，还指望用 AI？', slug: 'articles/most-companies-arent-ready-for-ai' },
					{ label: 'AI 给肿瘤病人开处方，谁来兜底？', slug: 'articles/oncoagent-ai-oncology-decisions' },
					{ label: '刷榜不是道德问题——从 Open ASR Leaderboard 的私有数据说起', slug: 'articles/open-asr-private-data' },
					{ label: '别管 AI 能不能写代码了，你管理任务的方式才是问题', slug: 'articles/openai-symphony-linear-ai-conductor' },
					{ label: 'pip 26.1 终于有了锁文件，但 Python 包管理的仗还没打完', slug: 'articles/pip261-lockfile-dependency-cooldown' },
					{ label: '开源社区最硬的 AI 禁令：代码再完美，也不收', slug: 'articles/simon-willison' },
					{ label: 'Stripe 的 100 毫秒', slug: 'articles/stripe-radar-fraud-detection' },
					{ label: '用了三年 AI 编程工具后，我发现瓶颈从来不是工具', slug: 'articles/structured-prompt-driven-development' },
					{ label: 'Agentic Workflow 烧掉的钱去哪了？GitHub 用 Agent 优化 Agent 的实战复盘', slug: 'articles/token-efficiency' },
					{ label: 'Agent 没挂，是你的测试挂了', slug: 'articles/validating-agentic-behavior' },
					{ label: '当 vibe coding 和 agentic engineering 开始模糊，我感到一阵不安', slug: 'articles/vibe-coding-agentic-engineering' },
					{ label: '当 90% 代码由 AI 生成，经验还剩什么？', slug: 'articles/when-90-pct-code-by-ai' },
					{ label: '读了Wise 2025技术栈，我发现真正厉害的公司都在做减法', slug: 'articles/wise-tech-stack-2025' },
					{ label: '当「为了人类」不包括孟菲斯的黑人社区', slug: 'articles/xai-anthropic' }
					],
				},
			],
		}),
	],
});
