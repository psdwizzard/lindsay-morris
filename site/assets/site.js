// Lights toggle (remembered per browser) and the reading progress line. The site works without it.
(function () {
  var root = document.documentElement;
  document.querySelectorAll('.lights').forEach(function (b) {
    var sync = function () {
      var night = root.dataset.theme === 'night';
      b.setAttribute('aria-pressed', String(night));
    };
    b.hidden = false;
    sync();
    b.addEventListener('click', function () {
      if (root.dataset.theme === 'night') delete root.dataset.theme; else root.dataset.theme = 'night';
      try { localStorage.setItem('lm-theme', root.dataset.theme || 'paper'); } catch (e) {}
      document.querySelectorAll('.lights').forEach(function (o) { o.setAttribute('aria-pressed', String(root.dataset.theme === 'night')); });
    });
  });

  var bar = document.querySelector('.runbar .progress');
  var text = document.querySelector('.manuscript');
  if (!bar || !text) return;
  var ticking = false;
  var update = function () {
    var r = text.getBoundingClientRect();
    var span = r.height - window.innerHeight;
    var p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 1;
    bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    document.querySelector('.runbar').classList.toggle('is-on', r.top < -200);
    ticking = false;
  };
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
