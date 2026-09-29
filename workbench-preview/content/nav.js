/* coach-studio 共享导航条 · 全局平台选择器
 * 用法：在每个页面的 <div class="wrap"> 后第一行放
 *   <div id="coachNav" data-page="home|courses|content|breakdown|workbench|students"></div>
 * 并先引入 content/store.js（根目录页用 content/store.js，content/ 子页用 store.js），
 * 再引入本文件。平台切换会写入 Store（coach:platform）并广播 coach:platform 事件，
 * 各页面可监听该事件同步自己的平台相关链接。纯静态，无后端 API。 */
(function (w) {
  'use strict';

  var PAGES = [
    { id: 'home', href: '/', label: '🏠 首页' },
    { id: 'courses', href: '/courses.html', label: '📚 课程打造' },
    { id: 'content', href: '/content.html', label: '✍️ 内容打造' },
    { id: 'breakdown', href: '/breakdown.html', label: '🔍 四拆解' },
    { id: 'workbench', href: '/workbench.html', label: '🛠️ 运营工作台' },
    { id: 'students', href: '/students.html', label: '👥 学员与订阅' }
  ];

  var CSS =
    '.coachnav{background:#fff;border:1px solid #e3e8ef;border-radius:12px;' +
    'padding:10px 16px;margin-bottom:18px;display:flex;align-items:center;' +
    'justify-content:space-between;gap:12px;flex-wrap:wrap}' +
    '.coachnav .links{display:flex;gap:4px;flex-wrap:wrap;align-items:center}' +
    '.coachnav .links a{font-size:14px;color:#555;text-decoration:none;' +
    'padding:7px 12px;border-radius:8px;white-space:nowrap}' +
    '.coachnav .links a:hover{background:#f0f6ff;color:#1a73e8}' +
    '.coachnav .links a.on{background:#1a73e8;color:#fff;font-weight:600}' +
    '.coachnav .brand{font-size:14px;font-weight:700;color:#222;margin-right:6px;white-space:nowrap}' +
    '.coachnav .plat{display:flex;align-items:center;gap:8px;font-size:13px;color:#666}' +
    '.coachnav .plat select{font-size:13px;padding:6px 10px;border:1px solid #c9d2de;border-radius:6px;background:#fff}';

  function injectCss() {
    var s = document.createElement('style');
    s.type = 'text/css';
    s.appendChild(document.createTextNode(CSS));
    document.head.appendChild(s);
  }

  function optionsHtml() {
    var cur = Store.platform();
    return Object.keys(Store.PLATS).map(function (k) {
      var sel = k === cur ? ' selected' : '';
      return '<option value="' + k + '"' + sel + '>' + Store.esc(Store.PLATS[k]) + '</option>';
    }).join('');
  }

  function render() {
    var mount = document.getElementById('coachNav');
    if (!mount || typeof Store === 'undefined') return;
    var cur = mount.getAttribute('data-page') || '';
    var links = PAGES.map(function (p) {
      var on = p.id === cur ? ' class="on"' : '';
      return '<a href="' + p.href + '"' + on + '>' + p.label + '</a>';
    }).join('');
    mount.innerHTML =
      '<div class="coachnav">' +
      '<div class="links"><span class="brand">🎓 教练工作台</span>' + links + '</div>' +
      '<div class="plat"><span>目标平台</span>' +
      '<select id="coachNavPlat">' + optionsHtml() + '</select></div>' +
      '</div>';
    var sel = document.getElementById('coachNavPlat');
    sel.addEventListener('change', function () {
      setPlatform(sel.value);
    });
    // 页面切换回来后若别处改了平台，保持同步
    document.addEventListener('coach:platform', function (e) {
      var s = document.getElementById('coachNavPlat');
      if (s && s.value !== e.detail) s.value = e.detail;
    });
  }

  function setPlatform(p) {
    Store.setPlatform(p);
    var ev;
    try {
      ev = new CustomEvent('coach:platform', { detail: p });
    } catch (e) {
      ev = document.createEvent('CustomEvent');
      ev.initCustomEvent('coach:platform', false, false, p);
    }
    document.dispatchEvent(ev);
  }

  function onChange(fn) {
    document.addEventListener('coach:platform', function (e) { fn(e.detail); });
  }

  w.CoachNav = { render: render, setPlatform: setPlatform, onChange: onChange };

  injectCss();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})(window);
