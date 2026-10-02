/* 邮箱登录门 - 全站私有化组件
   用法：在页面 <head> 引入 assets/email-gate.css，
   在 </body> 前引入本文件即可。
   授权邮箱：HDhaidong@gmail.com（不区分大小写）
   登录状态存 sessionStorage，当前标签页有效，关闭即失效。
   注意：GitHub Pages 纯静态，此为前端门，防君子不防小人。 */
(function () {
  'use strict';
  var ALLOWED = 'hdhaidong@gmail.com';
  var KEY = 'ar-site-auth'; // 全站通用 key，一次登录全站有效

  // 已登录则直接返回
  try {
    if (sessionStorage.getItem(KEY) === '1') return;
  } catch (e) {}

  function isZh() {
    return (document.documentElement.lang || 'zh-CN').indexOf('zh') === 0;
  }

  // 动态构建遮罩 DOM
  var gate = document.createElement('div');
  gate.id = 'email-gate';
  var zh = isZh();
  gate.innerHTML =
    '<div class="gate-box">' +
      '<h2>' + (zh ? '内部页面' : 'Internal Page') + '</h2>' +
      '<p>' + (zh ? '本站为内部资料，请输入授权邮箱继续访问。' : 'This is an internal site. Please enter your authorized email to continue.') + '</p>' +
      '<input type="email" id="gate-email" placeholder="you@example.com" autocomplete="email">' +
      '<div class="gate-error" id="gate-error"></div>' +
      '<button class="gate-submit" id="gate-submit">' + (zh ? '进入' : 'Enter') + '</button>' +
    '</div>';

  // 页面加载完成后插入，确保 body 已存在
  function insert() {
    if (document.body) {
      document.body.appendChild(gate);
      bindEvents();
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        document.body.appendChild(gate);
        bindEvents();
      });
    }
  }

  function bindEvents() {
    var input = document.getElementById('gate-email');
    var err = document.getElementById('gate-error');
    var btn = document.getElementById('gate-submit');
    function check() {
      var v = (input.value || '').trim().toLowerCase();
      if (v === ALLOWED) {
        try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
        gate.classList.add('hidden');
      } else {
        err.textContent = isZh()
          ? '邮箱未授权，请使用授权邮箱访问。'
          : 'Email not authorized. Please use an authorized email.';
      }
    }
    btn.addEventListener('click', check);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
    // 自动聚焦
    setTimeout(function () { try { input.focus(); } catch (e) {} }, 100);
  }

  insert();
})();
