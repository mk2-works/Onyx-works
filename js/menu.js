/* menu.js — бургер-меню на мобильных */
(function () {
  'use strict';

  var burger = document.querySelector('.header__burger');
  var nav = document.querySelector('.header__nav');
  if (!burger || !nav) return;

  function close() {
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }

  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
  });

  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) close();
  });
})();