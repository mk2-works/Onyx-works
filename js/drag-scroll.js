/* drag-scroll.js — горизонтальный скролл перетаскиванием мышью.
   Тач-устройства скроллят нативно.
   Затухание по краям привязано к позиции скролла напрямую — без задержек.
   data-no-fade отключает затухание (используется, если нужны стрелки вместо фейдов). */

(function () {
  'use strict';

  var FADE = 56; /* максимальная ширина затухания, px */

  function updateFades(el) {
    if (el.hasAttribute('data-no-fade')) return;
    var max = el.scrollWidth - el.clientWidth;
    if (max <= 0) {
      el.style.setProperty('--fade-left', '0px');
      el.style.setProperty('--fade-right', '0px');
      return;
    }
    var left = Math.min(el.scrollLeft, FADE);
    var right = Math.min(max - el.scrollLeft, FADE);
    el.style.setProperty('--fade-left', left + 'px');
    el.style.setProperty('--fade-right', right + 'px');
  }

  document.querySelectorAll('[data-drag-scroll]').forEach(function (el) {
    var isDown = false;
    var startX = 0;
    var startScroll = 0;

    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      isDown = true;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      el.classList.add('is-dragging');
      el.setPointerCapture(e.pointerId);
    });

    el.addEventListener('pointermove', function (e) {
      if (!isDown) return;
      el.scrollLeft = startScroll - (e.clientX - startX);
    });

    function up() {
      isDown = false;
      el.classList.remove('is-dragging');
    }
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);

    el.addEventListener('dragstart', function (e) { e.preventDefault(); });

    el.addEventListener('scroll', function () { updateFades(el); }, { passive: true });
    window.addEventListener('resize', function () { updateFades(el); });
    updateFades(el);
  });

  /* после загрузки шрифтов ширины могут поменяться */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      document.querySelectorAll('[data-drag-scroll]').forEach(updateFades);
    });
  }
})();