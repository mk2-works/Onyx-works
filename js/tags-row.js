/* tags-rows.js — теги: максимум две строки.
   Пока теги переносятся в 1–2 строки — обычный автоперенос.
   Появилась третья строка — контейнер становится «две строки + скролл»
   (палец и мышь). Стили режима скрипт инжектит сам, CSS-файл не нужен. */

(function () {
  'use strict';

  /* Стили режима — всегда в документе, независимо от style.css */
  var style = document.createElement('style');
  style.textContent =
    '.directions__tags.tags--two{' +
      'flex-flow:column wrap;' +
      'align-content:flex-start;' +
      'overflow-x:auto;' +
      'scrollbar-width:none;' +
      '-ms-overflow-style:none;' +
      'cursor:grab;' +
    '}' +
    '.directions__tags.tags--two::-webkit-scrollbar{display:none}' +
    '.directions__tags.tags--two.is-dragging{cursor:grabbing;user-select:none}';
  document.head.appendChild(style);

  var GAP = 12;
  var lists = document.querySelectorAll('.directions__tags');
  if (!lists.length) return;

  /* Первая половина тегов — в верхнюю строку, вторая — в нижнюю */
  function setOrder(el, interleave) {
    var items = el.__tagsOriginal || (el.__tagsOriginal = Array.prototype.slice.call(el.children));
    var order;
    if (!interleave) {
      order = items;
    } else {
      var half = Math.ceil(items.length / 2);
      order = [];
      for (var i = 0; i < half; i++) {
        order.push(items[i]);
        if (items[i + half]) order.push(items[i + half]);
      }
    }
    order.forEach(function (n) { el.appendChild(n); });
  }

  function update(el) {
    el.classList.remove('tags--two');
    el.style.height = '';
    setOrder(el, false);

    var tag = el.querySelector('.tag');
    if (!tag) return;

    var twoRowsH = tag.offsetHeight * 2 + GAP;

    /* автоперенос дал третью строку — включаем двухстрочный режим */
    if (el.scrollHeight > twoRowsH + 4) {
      setOrder(el, true);
      el.classList.add('tags--two');
      el.style.height = twoRowsH + 'px';
    }
  }

  function updateAll() {
    lists.forEach(update);
  }

  /* Драг мышью; палец скроллит нативно */
  lists.forEach(function (el) {
    var down = false, startX = 0, startScroll = 0;
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      if (!el.classList.contains('tags--two')) return;
      down = true;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      el.classList.add('is-dragging');
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', function (e) {
      if (!down) return;
      el.scrollLeft = startScroll - (e.clientX - startX);
    });
    function up() { down = false; el.classList.remove('is-dragging'); }
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('dragstart', function (e) { e.preventDefault(); });
  });

  window.addEventListener('resize', updateAll);
  window.addEventListener('load', updateAll);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateAll);
  }
  updateAll();
})();