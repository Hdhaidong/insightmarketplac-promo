// linkedin-gen.js — 为每个平台工作台生成 LinkedIn 介绍文案（EN + CN）
// 输入: platforms.json（美国 10）+ europe/*.json（欧洲 20 国 × 10）
// 输出: linkedin/{slug}.md（每产品一篇 EN + 一篇 CN）+ linkedin/index.json（一句话简介索引）
// 零依赖：node linkedin-gen.js
const fs = require('fs');
const path = require('path');

const GEN = __dirname;
const OUT = path.join(GEN, 'linkedin');
fs.mkdirSync(OUT, { recursive: true });

const MODULES_EN = ['product launch workflow', 'listing & catalog management', 'multi-marketplace publishing', 'competitor price tracking', 'ad campaign planning', 'AI ops assistant', 'data maintenance', 'inbox', 'training academy', 'help center'];
const MODULES_CN = ['上新工作流', '刊登与目录管理', '多平台一键刊登', '竞品价格追踪', '广告投放规划', 'AI 运营助手', '数据维护', '消息中心', '培训学院', '帮助中心'];

const COUNTRY_EN = {
  '英国': 'the UK', '德国': 'Germany', '法国': 'France', '意大利': 'Italy',
  '西班牙': 'Spain', '荷兰': 'the Netherlands', '波兰': 'Poland', '瑞典': 'Sweden',
  '比利时': 'Belgium', '奥地利': 'Austria', '瑞士': 'Switzerland', '爱尔兰': 'Ireland',
  '葡萄牙': 'Portugal', '丹麦': 'Denmark', '芬兰': 'Finland', '挪威': 'Norway',
  '捷克': 'Czechia', '匈牙利': 'Hungary', '罗马尼亚': 'Romania', '希腊': 'Greece',
};

function products() {
  const list = [];
  // 美国 10
  const us = JSON.parse(fs.readFileSync(path.join(GEN, 'platforms.json'), 'utf8'));
  for (const p of us.platforms) {
    list.push({
      slug: p.slug, name: p.name, cn: p.cn || p.name,
      country: '美国', countryEn: 'the US',
      note: '', type: '',
    });
  }
  // 欧洲 200
  const euDir = path.join(GEN, 'europe');
  for (const f of fs.readdirSync(euDir)) {
    if (!f.endsWith('.json') || f === 'INDEX.md') continue;
    const c = JSON.parse(fs.readFileSync(path.join(euDir, f), 'utf8'));
    for (const p of c.platforms) {
      list.push({
        slug: p.slug, name: p.name, cn: p.cn || p.name,
        country: c.country, countryEn: COUNTRY_EN[c.country] || c.country,
        note: p.note || '', type: p.type || '',
      });
    }
  }
  return list;
}

function enPost(p) {
  const region = p.countryEn === 'the US' ? 'US' : p.countryEn;
  return `🚀 FREE DOWNLOAD: ${p.name} Seller Ops Workbench (${region})

Selling on ${p.name} in ${p.countryEn}? We built a free desktop + web workbench just for ${p.name} sellers.

What's inside (${MODULES_EN.length} modules):
${MODULES_EN.map(m => `✅ ${m}`).join('\n')}

💯 Free forever. No subscription, no signup walls — download and run your ${p.name} operation like a pro.

📥 Download: [DOWNLOAD_URL]

#ecommerce #${p.name.replace(/[^A-Za-z]/g, '')} #marketplace #sellertools #freesoftware #crossborder`;
}

function cnPost(p) {
  const marketLine = p.note ? `${p.note}。` : '';
  return `🚀 免费下载：${p.cn}卖家运营工作台（${p.country}）

在${p.country}做${p.cn}？${marketLine}我们给${p.cn}卖家做了一套免费的桌面 + 网页运营工作台。

11 大模块，一套搞定：
${MODULES_CN.map(m => `✅ ${m}`).join('\n')}

💯 永久免费，不用订阅、不用注册，下载即用。

📥 下载：[DOWNLOAD_URL]

#跨境电商 #${p.cn} #免费软件 #电商运营`;
}

function oneLiner(p, lang) {
  return lang === 'en'
    ? `Free ${p.name} (${p.countryEn}) seller ops workbench: 11 modules for listing, pricing, ads & AI-assisted operations.`
    : `免费${p.cn}（${p.country}）卖家运营工作台：11 大模块覆盖上新、刊登、价格、广告与 AI 运营。`;
}

const list = products();
const index = [];
for (const p of list) {
  const md = `# ${p.name} / ${p.cn} — ${p.country}\n`
    + `slug: \`${p.slug}\` · download: [DOWNLOAD_URL]\n\n`
    + `---\n\n## LinkedIn Post (EN)\n\n${enPost(p)}\n\n---\n\n## LinkedIn Post (CN)\n\n${cnPost(p)}\n`;
  fs.writeFileSync(path.join(OUT, `${p.slug}.md`), md);
  index.push({ slug: p.slug, platform: p.name, platformCn: p.cn, country: p.country, en: oneLiner(p, 'en'), cn: oneLiner(p, 'cn') });
}
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 2));
console.log(`done: ${index.length} products -> linkedin/`);
