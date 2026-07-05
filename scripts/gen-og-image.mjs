// 生成站点默认 og-image (1200×630 PNG)
// 用法: node scripts/gen-og-image.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

// 复用 favicon 的 "N" 字路径，放大作为视觉锚点
const N_PATH = '<path d="M32 96V32h16l32 40V32h16v64H80L48 56v40H32z"/>';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b0a14"/>
      <stop offset="1" stop-color="#1b1830"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <!-- 左侧 N monogram 圆角块 -->
  <g transform="translate(140,215)">
    <rect width="200" height="200" rx="32" fill="#9499ff"/>
    <g fill="#0b0a14" transform="scale(1.5625) translate(0,0)">${N_PATH}</g>
  </g>
  <!-- 标题 -->
  <text x="400" y="300" fill="#ffffff" font-family="'Noto Sans CJK SC','Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif" font-size="76" font-weight="700">NTLx's Blog</text>
  <text x="400" y="370" fill="#9499ff" font-family="'Noto Sans CJK SC','Noto Sans SC',sans-serif" font-size="34" font-weight="500">技术洞察与实践笔记</text>
  <text x="400" y="420" fill="#8a8aa3" font-family="'Noto Sans CJK SC','Noto Sans SC',sans-serif" font-size="26" font-weight="400">AI · 系统运维 · 生物信息学</text>
  <text x="400" y="470" fill="#5a5a78" font-family="sans-serif" font-size="22">ntlx.github.io</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/og-image.png');
console.log('生成: public/og-image.png');
