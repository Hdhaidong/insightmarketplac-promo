(function () {
  var words = ['Automation', 'Content', 'Advertising', 'Research', 'Ops'];
  var role = document.querySelector('.hero-tagline .role');
  if (role) {
    var i = 0;
    setInterval(function () {
      role.classList.add('swap');
      setTimeout(function () {
        i = (i + 1) % words.length;
        role.textContent = words[i];
        role.classList.remove('swap');
      }, 620);
    }, 4200);
  }

  var sections = { 'nav-works': 'works', 'nav-explorations': 'explorations' };
  Object.keys(sections).forEach(function (btnId) {
    var btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', function () {
      var target = document.getElementById(sections[btnId]);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('on'); });
  }
})();
