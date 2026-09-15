/* hero-slider.js — слайдер главного экрана: драг, свайп, точки,
   бесшовный фейд краёв + растворение слайдов с передачей на 65%,
   цикл, shimmer grid dots за курсором.
   Автоскролл временно выключен (restart() закомментирован внизу). */
(function () {
  'use strict';

  var slider = document.querySelector('.hero-slider');
  if (!slider) return;

  var track = slider.querySelector('.hero-slider__track');
  var slides = Array.prototype.slice.call(track.children);
  var dotsBox = document.querySelector('.hero-dots');
  var hero = document.querySelector('.m-hero');
  var AUTO = 20000;
  var FADE_MAX = 96;
  var HANDOFF = 0.65;
  var idx = 0, timer = null;
  var jumping = false;
  var lastPos = 0;
  var lastDir = 1;

  slides.forEach(function (_, i) {
    var d = document.createElement('button');
    d.type = 'button';
    d.className = 'hero-dot';
    d.setAttribute('aria-label', 'Слайд ' + (i + 1));
    d.addEventListener('click', function () { go(i, true); restart(); });
    dotsBox.appendChild(d);
  });
  var dots = Array.prototype.slice.call(dotsBox.children);

  function w() { return slider.clientWidth; }

  function ss(t) {
    t = Math.max(0, Math.min(1, t));
    return t * t * (3 - 2 * t);
  }

  function go(i, smooth) {
    /* переброска через несколько слайдов: растворение отключаем */
    if (Math.abs(i - idx) > 1) jumping = true;
    idx = (i + slides.length) % slides.length;
    slider.scrollTo({ left: idx * w(), behavior: smooth ? 'smooth' : 'auto' });
    applySlide();
  }

  function applySlide() {
    dots.forEach(function (d, i) { d.classList.toggle('is-active', i === idx); });
    slides.forEach(function (s, i) { s.classList.toggle('is-active', i === idx); });
    var acc = slides[idx].dataset.accent;
    if (acc && hero) hero.style.setProperty('--slide-accent', acc);
  }

  function restart() {
    clearInterval(timer);
    timer = setInterval(function () { go(idx + 1, true); }, AUTO);
  }

  var down = false, sx = 0, ss0 = 0;
  slider.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse') return;
    if (e.target.closest('a, button')) return;
    down = true; sx = e.clientX; ss0 = slider.scrollLeft;
    slider.classList.add('is-dragging');
    slider.setPointerCapture(e.pointerId);
    clearInterval(timer);
  });
  slider.addEventListener('pointermove', function (e) {
    if (down) slider.scrollLeft = ss0 - (e.clientX - sx);
  });
  function up(e) {
    if (!down) return;
    down = false;
    slider.classList.remove('is-dragging');
    var dx = e.clientX - sx;
    var cur = Math.round(ss0 / w());
    var t = cur;
    if (dx < -60) t = cur + 1;
    else if (dx > 60) t = cur - 1;
    else t = Math.round(slider.scrollLeft / w());
    if (t > slides.length - 1) t = 0;
    if (t < 0) t = slides.length - 1;
    go(t, true);
    restart();
  }
  slider.addEventListener('pointerup', up);
  slider.addEventListener('pointercancel', up);

  var rafFade = null;
  function updateFade() {
    if (rafFade) return;
    rafFade = requestAnimationFrame(function () {
      rafFade = null;
      var pos = slider.scrollLeft / w();
      var delta = pos - lastPos;
      if (Math.abs(delta) > 0.0005) lastDir = delta > 0 ? 1 : -1;
      lastPos = pos;

      var i;
      if (jumping) {
        /* длинная переброска: все полотна видимы, без растворения */
        for (i = 0; i < slides.length; i++) slides[i].style.opacity = '1';
      } else {
        var i0 = Math.floor(pos + 0.000001);
        var p = pos - i0;
        var outIdx, inIdx, prog;
        if (lastDir >= 0) { outIdx = i0; inIdx = i0 + 1; prog = p; }
        else { outIdx = i0 + 1; inIdx = i0; prog = 1 - p; }
        for (i = 0; i < slides.length; i++) {
          var o;
          if (i === outIdx) o = 1 - ss(prog / HANDOFF);
          else if (i === inIdx) o = ss((prog - HANDOFF) / (1 - HANDOFF));
          else o = 0;
          slides[i].style.opacity = o.toFixed(3);
        }
      }

      var f = Math.abs(pos - Math.round(pos));
      var k = Math.max(0, Math.min(1, Math.min(f, 1 - f) / 0.15));
      slider.style.setProperty('--hero-fade', (FADE_MAX * k).toFixed(1) + 'px');
    });
  }

  var idle;
  slider.addEventListener('scroll', function () {
    updateFade();
    clearTimeout(idle);
    idle = setTimeout(function () {
      jumping = false;
      var i = Math.round(slider.scrollLeft / w());
      if (i !== idx) { idx = i; applySlide(); }
      go(idx, true);
      /* жёсткая фиксация в покое: активный видим, остальные скрыты */
      for (var j = 0; j < slides.length; j++) {
        slides[j].style.opacity = (j === idx) ? '1' : '0';
      }
    }, 120);
  }, { passive: true });

  slider.addEventListener('pointerenter', function () { clearInterval(timer); });
  slider.addEventListener('pointerleave', function () { restart(); });

  window.addEventListener('resize', function () {
    slider.scrollLeft = idx * w();
    updateFade();
  });

  /* shimmer grid dots: подсветка за курсором, гаснет без курсора */
  if (hero) {
    hero.classList.add('hero-no-cursor');
    hero.addEventListener('pointerenter', function () { hero.classList.remove('hero-no-cursor'); });
    hero.addEventListener('pointerleave', function () { hero.classList.add('hero-no-cursor'); });

    var raf = null;
    hero.addEventListener('pointermove', function (e) {
      if (raf) return;
      var x = e.clientX, y = e.clientY;
      raf = requestAnimationFrame(function () {
        raf = null;
        var r = hero.getBoundingClientRect();
        hero.style.setProperty('--mx', (x - r.left) + 'px');
        hero.style.setProperty('--my', (y - r.top) + 'px');
      });
    });
  }

  applySlide();
  updateFade();
  // restart(); // автоскролл временно выключен
})();