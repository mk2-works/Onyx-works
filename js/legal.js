/* legal.js — модальное окно с правовым дисклеймером портфолио */
(function () {
  'use strict';

  var modal = document.getElementById('legal-modal');
  var openBtn = document.getElementById('legal-open');
  var closeBtn = document.getElementById('legal-close');
  if (!modal || !openBtn) return;

  function show() { modal.hidden = false; document.body.classList.add('no-scroll'); }
  function hide() { modal.hidden = true; document.body.classList.remove('no-scroll'); }

  openBtn.addEventListener('click', show);
  if (closeBtn) closeBtn.addEventListener('click', hide);
  modal.addEventListener('click', function (e) { if (e.target === modal) hide(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) hide();
  });
})();