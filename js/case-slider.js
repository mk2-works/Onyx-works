/* case-slider.js — кейсы портфолио:
   1) слайдер: драг 1:1, доснап, ЦИКЛ (после последнего сразу первый и наоборот);
   2) кнопки «Подробнее» в опыте работы;
   3) карточка кейса: клик — кружок и обратно; ниже 1280px свёрнута по умолчанию;
   4) полный просмотр кейса по тапу (мобильные), header скрывается;
   5) плавный скролл по якорям. */

(function () {
  'use strict';

  var mqMobile = window.matchMedia('(max-width: 768px)');
  var mqNotDesktop = window.matchMedia('(max-width: 1279px)');
  var lastDrag = 0;

  /* ---------- 1. Слайдер кейсов ---------- */

  document.querySelectorAll('.case').forEach(function (caseEl) {
    var slider = caseEl.querySelector('.case__slider');
    var left = caseEl.querySelector('.case__arrow--left');
    var right = caseEl.querySelector('.case__arrow--right');
    if (!slider) return;

    slider.querySelectorAll('.is-clone').forEach(function (n) { n.remove(); });

    function slideW() { return slider.clientWidth; }
    function maxIndex() {
      return Math.max(0, Math.round((slider.scrollWidth - slider.clientWidth) / slideW()));
    }
    function currentIndex() { return Math.round(slider.scrollLeft / slideW()); }
    function wrap(i) {
      var m = maxIndex();
      if (m <= 0) return 0;
      if (i > m) return 0;
      if (i < 0) return m;
      return i;
    }
    function goTo(i, smooth) {
      i = Math.max(0, Math.min(maxIndex(), i));
      slider.scrollTo({ left: i * slideW(), behavior: smooth ? 'smooth' : 'auto' });
    }

    if (left) left.addEventListener('click', function () { goTo(wrap(currentIndex() - 1), true); });
    if (right) right.addEventListener('click', function () { goTo(wrap(currentIndex() + 1), true); });

    var down = false, startX = 0, startScroll = 0, downTime = 0;

    slider.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; startX = e.clientX; startScroll = slider.scrollLeft; downTime = e.timeStamp;
      slider.classList.add('is-dragging');
      slider.setPointerCapture(e.pointerId);
    });
    slider.addEventListener('pointermove', function (e) {
      if (!down) return;
      slider.scrollLeft = startScroll - (e.clientX - startX);
    });
    function release(e) {
      if (!down) return;
      down = false;
      slider.classList.remove('is-dragging');
      var w = slideW();
      var dx = e.clientX - startX;
      lastDrag = Math.abs(dx);
      var dt = Math.max(1, e.timeStamp - downTime);
      var v = Math.abs(dx) / dt;
      var threshold = w * 0.15;
      var current = currentIndex();
      var target = Math.round(slider.scrollLeft / w);
      if (target === current && Math.abs(dx) > 10) {
        if (dx < 0 && (Math.abs(dx) > threshold || v > 0.5)) target = current + 1;
        else if (dx > 0 && (Math.abs(dx) > threshold || v > 0.5)) target = current - 1;
      }
      target = Math.max(current - 1, Math.min(current + 1, target));
      goTo(wrap(target), true);
    }
    slider.addEventListener('pointerup', release);
    slider.addEventListener('pointercancel', release);
    slider.addEventListener('dragstart', function (e) { e.preventDefault(); });

    var idleTimer;
    slider.addEventListener('scroll', function () {
      if (down) return;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function () { goTo(currentIndex(), true); }, 120);
    }, { passive: true });

    window.addEventListener('resize', function () { goTo(currentIndex(), false); });

    /* ---------- 4. Полный просмотр по тапу (мобильные) ---------- */
    slider.addEventListener('click', function () {
      if (!mqMobile.matches) return;
      if (lastDrag > 10) { lastDrag = 0; return; }
      openViewer(slider);
    });
  });

  /* ---------- Полный просмотр ---------- */

  var viewer = document.querySelector('.case-viewer');
  var viewerSlider = viewer && viewer.querySelector('.case-viewer__slider');
  var viewerClose = viewer && viewer.querySelector('.case-viewer__close');

  function openViewer(sourceSlider) {
    if (!viewer || !viewerSlider) return;
    viewerSlider.innerHTML = '';
    sourceSlider.querySelectorAll('.case__slide img').forEach(function (img) {
      var slide = document.createElement('div');
      slide.className = 'case-viewer__slide';
      var im = document.createElement('img');
      im.src = img.src;
      im.alt = img.alt || '';
      slide.appendChild(im);
      viewerSlider.appendChild(slide);
    });
    viewer.hidden = false;
    document.body.classList.add('no-scroll', 'viewer-open');
    viewerSlider.scrollLeft = 0;
  }

  function closeViewer() {
    if (!viewer) return;
    viewer.hidden = true;
    document.body.classList.remove('no-scroll', 'viewer-open');
  }

  if (viewerClose) viewerClose.addEventListener('click', closeViewer);
  if (viewer) viewer.addEventListener('click', function (e) {
    if (e.target === viewer) closeViewer();
  });

  /* ---------- 2. «Подробнее» в опыте работы ---------- */

  document.querySelectorAll('.exp-card__toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.exp-card');
      var details = card.querySelector('.exp-card__details');
      var isOpen = card.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', isOpen);
      btn.textContent = isOpen ? 'Свернуть' : 'Подробнее';
      details.hidden = !isOpen;
    });
  });

  /* ---------- 3. Карточка кейса: кружок ---------- */

  function collapsedSize() {
    var v = getComputedStyle(document.documentElement).getPropertyValue('--info-collapsed');
    return (v && v.trim()) || '110px';
  }

  document.querySelectorAll('.case__info').forEach(function (info) {
    var D = 250;

    /* по умолчанию свёрнута на всём, что уже десктопа */
    if (mqNotDesktop.matches) info.classList.add('is-collapsed');

    function collapse() {
      info.style.width = info.offsetWidth + 'px';
      info.style.height = info.offsetHeight + 'px';
      info.getBoundingClientRect();
      info.classList.add('is-collapsed');
      var s = collapsedSize();
      info.style.width = s;
      info.style.height = s;
    }

    function expand() {
      info.classList.remove('is-collapsed');
      info.style.transition = 'none';
      info.style.width = '';
      info.style.height = '';
      var w = info.offsetWidth;
      var h = info.offsetHeight;
      var s = collapsedSize();
      info.style.width = s;
      info.style.height = s;
      info.getBoundingClientRect();
      info.style.transition = '';
      info.style.width = w + 'px';
      info.style.height = h + 'px';
      setTimeout(function () {
        if (!info.classList.contains('is-collapsed')) {
          info.style.width = '';
          info.style.height = '';
        }
      }, D + 50);
    }

    info.addEventListener('click', function () {
      if (info.classList.contains('is-collapsed')) expand();
      else collapse();
    });
  });

  /* ---------- 5. Якоря ---------- */

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var sel = a.getAttribute('href');
      if (sel.length < 2) return;
      var target = document.querySelector(sel);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();