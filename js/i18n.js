/* 中英双语切换：元素使用 data-zh / data-en；占位符用 data-zh-ph / data-en-ph */
(function () {
  'use strict';
  var KEY = 'ar-lang';
  var lang = 'zh';
  try { lang = localStorage.getItem(KEY) || 'zh'; } catch (e) {}

  function apply(l) {
    lang = l;
    try { localStorage.setItem(KEY, l); } catch (e) {}
    document.documentElement.lang = l === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-zh]').forEach(function (el) {
      var v = el.getAttribute(l === 'zh' ? 'data-zh' : 'data-en');
      if (v !== null) el.textContent = v;
    });
    document.querySelectorAll('[data-zh-ph]').forEach(function (el) {
      var v = el.getAttribute(l === 'zh' ? 'data-zh-ph' : 'data-en-ph');
      if (v !== null) el.setAttribute('placeholder', v);
    });
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      b.textContent = l === 'zh' ? 'EN' : '中文';
    });
    // 移动端菜单关闭
    var nav = document.querySelector('.nav');
    if (nav) nav.classList.remove('open');
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      b.addEventListener('click', function () { apply(lang === 'zh' ? 'en' : 'zh'); });
    });
    var burger = document.querySelector('.burger');
    if (burger) {
      burger.addEventListener('click', function () {
        document.querySelector('.nav').classList.toggle('open');
      });
    }
    // 当前导航高亮
    var path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav a[data-page]').forEach(function (a) {
      if (a.getAttribute('data-page') === path) a.classList.add('active');
    });
    apply(lang);

    // 联系表单：本地演示用，阻止真实提交并提示
    var form = document.getElementById('contact-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var tip = document.getElementById('form-tip');
        if (tip) {
          tip.style.display = 'block';
          tip.textContent = lang === 'zh'
            ? '已收到您的留言（演示模式，未实际发送）。请通过邮箱 contact@adventureretail.com 与我们联系。'
            : 'Message received (demo mode, not actually sent). Please contact us at contact@adventureretail.com.';
        }
        form.reset();
      });
    }
  });
})();
