/* soft-dock.js — «лесенка» как в macOS Dock для ряда «Софт».
   Если ряд не помещается и скроллится — анимация отключается (класс is-scrollable). */

(function () {
  'use strict';

  var row = document.querySelector('.directions__soft');
  if (!row) return;

  var items = Array.prototype.slice.call(row.querySelectorAll('.directions__soft-item'));

  function measure() {
    return items.map(function (el) {
      var r = el.getBoundingClientRect();
      return { el: el, x: r.left + r.width / 2 };
    });
  }

  var cache = measure();

  function isScrollable() {
    return row.classList.contains('is-scrollable');
  }

  function updateScrollState() {
    row.classList.toggle('is-scrollable', row.scrollWidth > row.clientWidth + 1);
  }

  function apply(mouseX) {
    if (isScrollable()) return;
    cache.forEach(function (c) {
      var d = Math.abs(mouseX - c.x);
      var t = Math.max(0, 1 - d / 160);
      var e = t * t * (3 - 2 * t);
      var lift = 16 * e;
      var scale = 1 + 0.15 * e;
      c.el.style.transform = 'translateY(' + (-lift).toFixed(2) + 'px) scale(' + scale.toFixed(3) + ')';
    });
  }

  function reset() {
    cache.forEach(function (c) { c.el.style.transform = ''; });
  }

  row.addEventListener('mousemove', function (e) { apply(e.clientX); });
  row.addEventListener('mouseleave', reset);

  window.addEventListener('resize', function () {
    cache = measure();
    updateScrollState();
    reset();
  });
  window.addEventListener('load', function () {
    cache = measure();
    updateScrollState();
  });
  updateScrollState();
})();