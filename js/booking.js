/* 商业洞察会议预约 · Meeting Booking — 纯前端，localStorage 本地存储 */
(function () {
  'use strict';

  var BOOK_KEY = 'ar-bookings';
  // 每天可约时段（北京时间 UTC+8）
  var SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  var STR = {
    zh: {
      weekdays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
      dateFmt: function (d) { return (d.getMonth() + 1) + '月' + d.getDate() + '日'; },
      beijingNote: '北京时间 (UTC+8)，每次约 45 分钟',
      pickDateFirst: '请先选择日期',
      needDate: '请选择预约日期',
      needSlot: '请选择预约时间',
      needName: '请填写姓名',
      needEmail: '请填写有效的邮箱地址',
      needPhone: '请填写联系电话',
      bookedOk: '预约成功！我们将在 24 小时内通过邮件与您确认。',
      myBookings: '我的预约',
      noBookings: '暂无预约记录。',
      cancel: '取消',
      cancelDone: '已取消该预约。',
      typeNames: { insight: '商业洞察咨询', demo: '产品演示', partner: '合作洽谈' }
    },
    en: {
      weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      dateFmt: function (d) {
        var m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return m[d.getMonth()] + ' ' + d.getDate();
      },
      beijingNote: 'Beijing time (UTC+8), 45 minutes per session',
      pickDateFirst: 'Please pick a date first',
      needDate: 'Please pick a date',
      needSlot: 'Please pick a time slot',
      needName: 'Please enter your name',
      needEmail: 'Please enter a valid email address',
      needPhone: 'Please enter your phone number',
      bookedOk: 'Booked! We will confirm by email within 24 hours.',
      myBookings: 'My Bookings',
      noBookings: 'No bookings yet.',
      cancel: 'Cancel',
      cancelDone: 'Booking cancelled.',
      typeNames: { insight: 'Business Insight Consultation', demo: 'Product Demo', partner: 'Partnership Talk' }
    }
  };

  function lang() {
    try { return localStorage.getItem('ar-lang') || 'zh'; } catch (e) { return 'zh'; }
  }
  function T() { return STR[lang()] || STR.zh; }

  /* 未来 30 个工作日（跳过周六日），从明天开始 */
  function nextWorkdays(n) {
    var days = [];
    var d = new Date();
    d.setDate(d.getDate() + 1);
    while (days.length < n) {
      var wd = d.getDay();
      if (wd !== 0 && wd !== 6) days.push(new Date(d.getTime()));
      d.setDate(d.getDate() + 1);
    }
    return days;
  }

  function ymd(d) {
    function p(x) { return (x < 10 ? '0' : '') + x; }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }

  function confirmationNo(dateStr) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var s = '';
    for (var i = 0; i < 4; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
    return 'AR-' + dateStr.replace(/-/g, '') + '-' + s;
  }

  function loadBookings() {
    try { return JSON.parse(localStorage.getItem(BOOK_KEY) || '[]'); } catch (e) { return []; }
  }
  function saveBookings(list) {
    try { localStorage.setItem(BOOK_KEY, JSON.stringify(list)); } catch (e) {}
  }

  /* ---- 渲染：日期 ---- */
  var selDate = null, selSlot = null, workdays = nextWorkdays(30);

  function renderDates() {
    var t = T();
    var grid = document.getElementById('date-grid');
    if (!grid) return;
    grid.innerHTML = '';
    workdays.forEach(function (d) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'date-btn' + (selDate && ymd(d) === ymd(selDate) ? ' sel' : '');
      b.innerHTML = '<span class="d">' + t.dateFmt(d) + '</span><span class="w">' + t.weekdays[d.getDay()] + '</span>';
      b.addEventListener('click', function () {
        selDate = d; selSlot = null;
        renderDates(); renderSlots();
      });
      grid.appendChild(b);
    });
  }

  /* ---- 渲染：时段 ---- */
  function renderSlots() {
    var t = T();
    var grid = document.getElementById('slot-grid');
    var note = document.getElementById('slot-note');
    if (!grid) return;
    grid.innerHTML = '';
    if (!selDate) {
      if (note) note.textContent = t.pickDateFirst;
      return;
    }
    if (note) note.textContent = t.beijingNote;
    SLOTS.forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'slot-btn' + (selSlot === s ? ' sel' : '');
      b.textContent = s;
      b.addEventListener('click', function () {
        selSlot = s;
        renderSlots();
      });
      grid.appendChild(b);
    });
  }

  /* ---- 渲染：我的预约 ---- */
  function renderMyBookings() {
    var t = T();
    var box = document.getElementById('my-bookings');
    if (!box) return;
    var list = loadBookings();
    var html = '<h3>' + t.myBookings + '</h3>';
    if (!list.length) {
      html += '<p class="form-note">' + t.noBookings + '</p>';
    } else {
      html += '<ul class="booking-list">';
      list.forEach(function (b, i) {
        html += '<li class="booking-item"><div><strong>' + escapeHtml(b.no) + '</strong><br>' +
          '<span>' + escapeHtml(t.typeNames[b.mtype] || b.mtype) + ' · ' + escapeHtml(b.date) + ' ' + escapeHtml(b.slot) + '</span></div>' +
          '<button type="button" class="btn-cancel" data-i="' + i + '">' + t.cancel + '</button></li>';
      });
      html += '</ul>';
    }
    box.innerHTML = html;
    box.querySelectorAll('.btn-cancel').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var l = loadBookings();
        l.splice(parseInt(btn.getAttribute('data-i'), 10), 1);
        saveBookings(l);
        renderMyBookings();
        var tip = document.getElementById('my-tip');
        if (tip) { tip.style.display = 'block'; tip.textContent = T().cancelDone; }
      });
    });
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---- 提交 ---- */
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('booking-form');
    if (!form) return;

    renderDates(); renderSlots(); renderMyBookings();

    // 语言切换后重渲染动态内容（i18n.js 先注册，先执行）
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        setTimeout(function () { renderDates(); renderSlots(); renderMyBookings(); }, 0);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var t = T();
      var tip = document.getElementById('booking-tip');
      function fail(msg) { tip.style.display = 'block'; tip.textContent = msg; tip.style.color = '#c0392b'; }

      var mtype = (form.querySelector('input[name="mtype"]:checked') || {}).value || 'insight';
      function val(n) { var el = form.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ''; }
      var name = val('name');
      var company = val('company');
      var email = val('email');
      var phone = val('phone');
      var req = val('req');

      if (!selDate) return fail(t.needDate);
      if (!selSlot) return fail(t.needSlot);
      if (!name) return fail(t.needName);
      if (!validEmail(email)) return fail(t.needEmail);
      if (!phone) return fail(t.needPhone);

      var dateStr = ymd(selDate);
      var booking = {
        no: confirmationNo(dateStr),
        mtype: mtype,
        date: dateStr + ' (' + t.weekdays[selDate.getDay()] + ')',
        slot: selSlot + ' (UTC+8)',
        name: name, company: company, email: email, phone: phone,
        req: req, createdAt: new Date().toISOString()
      };
      var list = loadBookings();
      list.push(booking);
      saveBookings(list);

      // 确认面板
      var c = document.getElementById('booking-confirm');
      document.getElementById('confirm-no').textContent = booking.no;
      document.getElementById('confirm-detail').innerHTML =
        '<div><span>' + t.typeNames[mtype] + '</span><span>' + escapeHtml(booking.date) + ' ' + escapeHtml(booking.slot) + '</span></div>' +
        '<div><span>' + escapeHtml(name) + (company ? ' · ' + escapeHtml(company) : '') + '</span><span>' + escapeHtml(email) + '</span></div>';
      form.style.display = 'none';
      c.style.display = 'block';
      var ok = document.getElementById('confirm-ok');
      if (ok) ok.textContent = t.bookedOk;
      renderMyBookings();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    var again = document.getElementById('book-again');
    if (again) again.addEventListener('click', function () {
      document.getElementById('booking-confirm').style.display = 'none';
      form.style.display = 'block';
      form.reset();
      selDate = null; selSlot = null;
      renderDates(); renderSlots();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
})();
