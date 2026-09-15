/* main.js — главная ONYX WORKS:
   1) переключатель направлений;
   2) инфо-карточка меняется вместе со слайдом;
   3) тема (тёмная по умолчанию) с запоминанием;
   4) форма заявки через mailto;
   5) заглушки в полноэкранном просмотре, если фото ещё не загружены. */

(function () {
  'use strict';

  /* ---------- 1. Переключатель направлений ---------- */
  var btns = document.querySelectorAll('.switcher__btn');
  var cases = document.querySelectorAll('.portfolio-main .case');

  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      btns.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
      var dir = btn.dataset.dir;
      cases.forEach(function (c) {
        c.classList.toggle('is-hidden', c.dataset.dir !== dir);
      });
      window.dispatchEvent(new Event('resize'));
    });
  });

  /* ---------- 2. Инфо-карточка следует за слайдом ---------- */
  document.querySelectorAll('.portfolio-main .case').forEach(function (caseEl) {
    var slider = caseEl.querySelector('.case__slider');
    var info = caseEl.querySelector('.case__info');
    if (!slider || !info) return;

    var title = info.querySelector('.case__info-title');
    var tagsBox = info.querySelector('.case__info-tags');
    var textBox = info.querySelector('.case__info-text');

    function apply() {
      var i = Math.round(slider.scrollLeft / slider.clientWidth);
      var slide = slider.children[i];
      if (!slide || !slide.dataset || !slide.dataset.title) return;

      if (title) title.textContent = slide.dataset.title;
      if (tagsBox) {
        tagsBox.innerHTML = '';
        (slide.dataset.tags || '').split(',').forEach(function (t) {
          t = t.trim();
          if (!t) return;
          var s = document.createElement('span');
          s.className = 'case__tag';
          s.textContent = t;
          tagsBox.appendChild(s);
        });
      }
      if (textBox) {
        textBox.textContent = slide.dataset.text || '';
        textBox.style.display = slide.dataset.text ? '' : 'none';
      }
    }

    var t;
    slider.addEventListener('scroll', function () {
      clearTimeout(t);
      t = setTimeout(apply, 80);
    }, { passive: true });
    apply();
  });

  /* ---------- 3. Тема: тёмная — основная ---------- *//*
  var rootEl = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  var saved = null;
  try { saved = localStorage.getItem('onyx-theme'); } catch (e) {}
  if (saved === 'light') rootEl.setAttribute('data-theme', 'light');

  if (toggle) {
    toggle.addEventListener('click', function () {
      var isLight = rootEl.getAttribute('data-theme') === 'light';
      if (isLight) rootEl.removeAttribute('data-theme');
      else rootEl.setAttribute('data-theme', 'light');
      try { localStorage.setItem('onyx-theme', isLight ? 'dark' : 'light'); } catch (e) {}
    });
  }*/

  /* ---------- 4. Форма заявки ---------- */
  var form = document.getElementById('lead-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var phone = form.querySelector('input').value.trim();
      if (!phone) return;
      location.href = 'mailto:onyxworks.dev@gmail.com' +
        '?subject=' + encodeURIComponent('Заявка с onyx-works.ru') +
        '&body=' + encodeURIComponent('Телефон: ' + phone);
    });
  }

  /* ---------- 5. Просмотр: заглушка вместо битого фото ---------- */
  var viewer = document.querySelector('.case-viewer');
  if (viewer && 'MutationObserver' in window) {
    new MutationObserver(function () {
      if (viewer.hidden) return;
      viewer.querySelectorAll('img').forEach(function (im) {
        if (im.classList.contains('is-missing') || (im.complete && im.naturalWidth === 0)) {
          var ph = document.createElement('div');
          ph.className = 'case-viewer__slide-ph';
          ph.textContent = im.alt || '';
          im.replaceWith(ph);
        }
      });
    }).observe(viewer, { attributes: true, attributeFilter: ['hidden'] });
  }
})();


