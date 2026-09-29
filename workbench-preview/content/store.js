/* coach-studio 内容打造 · 本地存储小助手
 * 所有教练工作数据（选题库、脚本草稿、分镜、清单等）仅保存在浏览器 localStorage，
 * 不调用任何后端 API，不上传任何数据。键名前缀统一为 coach: */
(function (w) {
  'use strict';
  var P = 'coach:';
  function get(k, d) {
    try {
      var v = localStorage.getItem(P + k);
      return v == null ? d : JSON.parse(v);
    } catch (e) { return d; }
  }
  function set(k, v) {
    try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {}
  }
  function uid() {
    return 'x' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  var PLATS = {
    wayfair: 'Wayfair', walmart: 'Walmart', whatnot: 'Whatnot',
    amazon: 'Amazon', tiktok: 'TikTok', xiaohongshu: '小红书'
  };
  function platform() { return get('platform', 'wayfair'); }
  function setPlatform(p) { set('platform', p); }
  function agentUrl(card) {
    return 'http://127.0.0.1:3220/p/' + platform() + '/agent/' + card;
  }
  function today() {
    var d = new Date();
    function z(n) { return String(n).padStart(2, '0'); }
    return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
  }
  /* 把多行文本按空行切成段落数组 */
  function paras(t) {
    return String(t || '').split(/\n\s*\n/).map(function (s) { return s.trim(); }).filter(Boolean);
  }
  w.Store = {
    get: get, set: set, uid: uid, esc: esc, paras: paras,
    PLATS: PLATS, platform: platform, setPlatform: setPlatform,
    agentUrl: agentUrl, today: today
  };
})(window);
