/* theme.js — переключатель темы: тёмная по умолчанию,
   светлая через data-theme="light"; синхронно с главной через localStorage */
(function () {
  'use strict';

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

      /* на мобильном закрываем меню после переключения */
      var nav = document.querySelector('.header__nav');
      var burger = document.querySelector('.header__burger');
      if (nav && nav.classList.contains('is-open') && window.matchMedia('(max-width: 768px)').matches) {
        nav.classList.remove('is-open');
        if (burger) {
          burger.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
        }
      }
    });
  }
})();