/* 客服聊天组件 · Customer Service Widget
 * 纯前端：FAQ 快捷回复 + 离线留言（localStorage），无后端依赖。
 * 双语：沿用站内 data-zh / data-en 约定，与 js/i18n.js 兼容。
 * 脚本在 </body> 前同步执行，DOM 在 i18n 的 DOMContentLoaded 之前建好，
 * 因此 i18n 的初始化与语言切换会自动覆盖本组件内的 [data-zh] 元素。
 */
(function () {
  'use strict';

  var STORE_KEY = 'ar-cs-messages';
  var LANG_KEY = 'ar-lang';

  function lang() {
    try { return localStorage.getItem(LANG_KEY) || 'zh'; } catch (e) { return 'zh'; }
  }
  function t(zh, en) { return lang() === 'zh' ? zh : en; }

  /* ---------- FAQ 知识库 ---------- */
  var FAQS = [
    {
      id: 'about',
      labelZh: '公司介绍', labelEn: 'About us',
      q: ['公司', '介绍', '你们是', '是谁', 'about', 'company', 'who'],
      aZh: '嘉兴砥石科技（商业品牌 Adventure Retail）是一家工业品出海服务公司：十五年工厂与外贸一线经验，叠加 AI Agent 技术，为工厂、品牌和渠道伙伴提供从选品、营销到分销的全链路支持。',
      aEn: 'Jiaxing Dishi Technology (trading as Adventure Retail) is an industrial export services company: 15 years of hands-on factory and foreign-trade experience, combined with AI agent technology, supporting factories, brands and channel partners across sourcing, marketing and distribution.'
    },
    {
      id: 'business',
      labelZh: '业务领域', labelEn: 'Business',
      q: ['业务', '做什么', '服务', '产品', 'business', 'service', 'product'],
      aZh: '我们的业务包括：工业品外贸服务、AI Agent 定制开发、北美零售渠道分销。详情可查看「业务领域」页面。',
      aEn: 'Our business covers: industrial foreign-trade services, custom AI agent development, and North American retail channel distribution. See the Business page for details.',
      link: { zh: '业务领域 →', en: 'Business →', href: 'business.html' }
    },
    {
      id: 'partner',
      labelZh: '如何合作', labelEn: 'Partnership',
      q: ['合作', '入驻', '代理', '加盟', 'partner', 'cooperat', 'join', 'agent'],
      aZh: '欢迎工厂（想出海）、品牌方、渠道商/销售代理与我们合作。请发邮件到 contact@adventureretail.com，简单介绍你的产品或合作想法，我们会尽快回复。',
      aEn: 'Factories (going global), brand owners and channel/sales partners are all welcome. Email us at contact@adventureretail.com with a brief intro of your products or partnership idea, and we will get back to you soon.'
    },
    {
      id: 'contact',
      labelZh: '联系方式', labelEn: 'Contact',
      q: ['联系', '邮箱', '电话', '微信', 'contact', 'email', 'phone', 'wechat'],
      aZh: '邮箱：contact@adventureretail.com；微信：添加请备注「合作 + 公司名」（微信号可通过邮件索取）。也可以直接在「联系我们」页面留言。',
      aEn: 'Email: contact@adventureretail.com; WeChat: add with note "partnership + company name" (WeChat ID available via email). You can also leave a message on the Contact page.',
      link: { zh: '联系我们 →', en: 'Contact us →', href: 'contact.html' }
    },
    {
      id: 'booking',
      labelZh: '预约会议', labelEn: 'Book a Meeting',
      q: ['预约', '会议', '见面', '约时间', 'book', 'meeting', 'appointment', 'schedule', 'demo'],
      aZh: '可以在线预约商业洞察会议：商业洞察咨询 / 产品演示 / 合作洽谈，45 分钟免费。选好日期和时间，提交后会生成预约确认号。',
      aEn: 'You can book a business insight meeting online: consultation, product demo or partnership talk — 45 minutes, free. Pick a date and time, and you will receive a booking reference.',
      link: { zh: '预约会议 →', en: 'Book now →', href: 'booking.html' }
    }
  ];

  var FALLBACK_ZH = '抱歉，我暂时只能回答常见问题。你可以点击上方快捷问题，或留下联系方式，我们看到后会回复你。';
  var FALLBACK_EN = 'Sorry, I can only answer common questions for now. Tap a quick question above, or leave your contact info and we will reply when we are back.';

  /* ---------- 构建 DOM ---------- */
  function el(tag, cls, html) {
    var d = document.createElement(tag);
    if (cls) d.className = cls;
    if (html !== undefined) d.innerHTML = html;
    return d;
  }

  var fab = el('button', 'ar-cs-fab', '💬<span class="ar-cs-dot"></span>');
  fab.setAttribute('aria-label', '客服');
  fab.setAttribute('data-zh', '在线客服');
  fab.setAttribute('data-en', 'Support');

  var panel = el('div', 'ar-cs-panel');
  panel.innerHTML =
    '<div class="ar-cs-head">' +
      '<div><div class="t" data-zh="在线客服" data-en="Support">在线客服</div>' +
      '<div class="s" data-zh="工作日 9:00–18:00（北京时间）" data-en="Weekdays 9:00–18:00 (Beijing time)">工作日 9:00–18:00（北京时间）</div></div>' +
      '<button class="ar-cs-close" aria-label="关闭">×</button>' +
    '</div>' +
    '<div class="ar-cs-msgs"></div>' +
    '<div class="ar-cs-chips"></div>' +
    '<div class="ar-cs-form">' +
      '<input type="text" class="f-name" data-zh-ph="您的姓名" data-en-ph="Your name" placeholder="您的姓名">' +
      '<input type="email" class="f-email" data-zh-ph="您的邮箱" data-en-ph="Your email" placeholder="您的邮箱">' +
      '<textarea class="f-msg" data-zh-ph="请描述你的问题或需求…" data-en-ph="Describe your question or needs…" placeholder="请描述你的问题或需求…"></textarea>' +
      '<p class="ar-cs-ok" data-zh="已收到留言，我们会尽快回复！" data-en="Message received — we will reply soon!">已收到留言，我们会尽快回复！</p>' +
      '<div class="row">' +
        '<button class="ar-cs-submit" data-zh="提交留言" data-en="Submit">提交留言</button>' +
        '<button class="ar-cs-cancel" data-zh="取消" data-en="Cancel">取消</button>' +
      '</div>' +
    '</div>' +
    '<div class="ar-cs-inputbar">' +
      '<input type="text" class="in" data-zh-ph="输入问题…" data-en-ph="Type your question…" placeholder="输入问题…">' +
      '<button class="send" data-zh="发送" data-en="Send">发送</button>' +
      '<button class="leave" data-zh="留言" data-en="Leave a message">留言</button>' +
    '</div>' +
    '<div class="ar-cs-foot" data-zh="留言仅保存在本机浏览器" data-en="Messages are stored in this browser only">留言仅保存在本机浏览器</div>';

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  var msgs = panel.querySelector('.ar-cs-msgs');
  var chips = panel.querySelector('.ar-cs-chips');
  var input = panel.querySelector('.ar-cs-inputbar .in');
  var form = panel.querySelector('.ar-cs-form');

  function scrollDown() { msgs.scrollTop = msgs.scrollHeight; }

  function addMsg(text, who, asHtml) {
    var m = el('div', 'ar-cs-msg ' + who);
    if (asHtml) m.innerHTML = text; else m.textContent = text;
    msgs.appendChild(m);
    scrollDown();
    return m;
  }

  function faqAnswer(f) {
    var html = '<span class="q">' + (lang() === 'zh' ? f.labelZh : f.labelEn) + '</span>' +
      (lang() === 'zh' ? f.aZh : f.aEn);
    if (f.link) {
      html += '<br><a href="' + f.link.href + '">' + (lang() === 'zh' ? f.link.zh : f.link.en) + '</a>';
    }
    return html;
  }

  function matchFaq(text) {
    var s = (text || '').toLowerCase();
    for (var i = 0; i < FAQS.length; i++) {
      var f = FAQS[i];
      for (var j = 0; j < f.q.length; j++) {
        if (s.indexOf(f.q[j].toLowerCase()) !== -1) return f;
      }
    }
    return null;
  }

  function botReply(userText) {
    var f = matchFaq(userText);
    if (f) { addMsg(faqAnswer(f), 'bot', true); return; }
    addMsg(t(FALLBACK_ZH, FALLBACK_EN), 'bot');
    openForm();
  }

  /* 快捷问题 chips */
  FAQS.forEach(function (f) {
    var c = el('button', 'ar-cs-chip');
    c.setAttribute('data-zh', f.labelZh);
    c.setAttribute('data-en', f.labelEn);
    c.textContent = lang() === 'zh' ? f.labelZh : f.labelEn;
    c.addEventListener('click', function () {
      addMsg(c.textContent, 'user');
      addMsg(faqAnswer(f), 'bot', true);
    });
    chips.appendChild(c);
  });

  /* 欢迎语（首次打开时） */
  var greeted = false;
  function greet() {
    if (greeted) return;
    greeted = true;
    addMsg(t('你好！我是 Adventure Retail 的在线客服小助手，有什么可以帮你？',
             'Hi! I am the Adventure Retail support assistant. How can I help?'), 'bot');
  }

  /* 打开 / 关闭 */
  function toggle(open) {
    var willOpen = open === undefined ? !panel.classList.contains('open') : open;
    panel.classList.toggle('open', willOpen);
    if (willOpen) greet();
  }
  fab.addEventListener('click', function () { toggle(); });
  panel.querySelector('.ar-cs-close').addEventListener('click', function () { toggle(false); });

  /* 发送 */
  function send() {
    var v = input.value.trim();
    if (!v) return;
    input.value = '';
    addMsg(v, 'user');
    setTimeout(function () { botReply(v); }, 350);
  }
  panel.querySelector('.ar-cs-inputbar .send').addEventListener('click', send);
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });

  /* 离线留言 */
  function openForm() { form.classList.add('open'); }
  function closeForm() {
    form.classList.remove('open');
    form.querySelector('.ar-cs-ok').style.display = 'none';
  }
  panel.querySelector('.ar-cs-inputbar .leave').addEventListener('click', function () {
    form.classList.contains('open') ? closeForm() : openForm();
  });
  panel.querySelector('.ar-cs-cancel').addEventListener('click', closeForm);

  function readStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); }
    catch (e) { return []; }
  }
  panel.querySelector('.ar-cs-submit').addEventListener('click', function () {
    var name = form.querySelector('.f-name').value.trim();
    var email = form.querySelector('.f-email').value.trim();
    var msg = form.querySelector('.f-msg').value.trim();
    if (!name || !email || !msg) {
      addMsg(t('请填写姓名、邮箱和问题描述。', 'Please fill in your name, email and message.'), 'bot');
      return;
    }
    var list = readStore();
    list.push({ name: name, email: email, msg: msg, at: new Date().toISOString(), lang: lang() });
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (e) {}
    form.querySelector('.ar-cs-ok').style.display = 'block';
    form.querySelector('.f-name').value = '';
    form.querySelector('.f-email').value = '';
    form.querySelector('.f-msg').value = '';
    addMsg(t('已收到你的留言（' + name + '），我们会尽快通过邮箱回复。',
             'Message received (' + name + ') — we will reply by email soon.'), 'bot');
  });

  /* 语言切换时刷新 chips 文案（i18n.js 只处理 data-zh 属性，chips 已带属性；
     这里补一次 textContent 以防时序问题） */
  document.addEventListener('click', function (e) {
    if (e.target && e.target.classList && e.target.classList.contains('lang-btn')) {
      setTimeout(function () {
        var cs = chips.querySelectorAll('.ar-cs-chip');
        cs.forEach(function (c, i) {
          var v = c.getAttribute(lang() === 'zh' ? 'data-zh' : 'data-en');
          if (v) c.textContent = v;
        });
      }, 0);
    }
  });
})();
