// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	// site 将由 GitHub Actions 在构建时设置，这里设置默认值以启用 sitemap
	site: 'https://ntlx.github.io',
	integrations: [
		starlight({
			title: "NTL's Blog",
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
						{ label: 'CLI 工具一键安装', slug: 'ai-tools/install-cli-tools' },
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
								{ label: 'Ubuntu Server', slug: 'operating-systems/linux/ubuntu-server' },
								{ label: 'Ubuntu 静态 IP', slug: 'operating-systems/linux/ubuntu-static-ip' },
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
						{ label: 'Shadowsocks 服务端', slug: 'network-proxy/shadowsocks-server' },
						{ label: 'Shadowsocks 客户端', slug: 'network-proxy/shadowsocks-client' },
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
								{ label: 'VIM 默认配置', slug: 'devops/editors/vim-default-conf' },
								{ label: 'VIM 美化', slug: 'devops/editors/vim-beautify' },
								{ label: 'VIM 插件', slug: 'devops/editors/vim-plugins' },
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
			],
		}),
	],
});
