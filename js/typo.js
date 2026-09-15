/* typo.js — «висячие предлоги»: короткое слово склеивается со следующим
   через неразрывный пробел. Не деструктивно: меняются только пробелы
   в текстовых узлах; область применения ограничена списком селекторов;
   отключение на элементе — data-typo="off". */
(function () {
  'use strict';

  var WORDS = 'и|в|во|не|что|он|а|но|с|со|к|ко|о|об|от|из|у|за|над|под|по|при|до|без|для|же|ли|бы|то|как|так|это|или|либо|она|они|оно|мы|вы|ты|я|её|ее|их|ей|ему|них|нем|нём|тем|чем';
  var RE = new RegExp('((?:^|\\s)(?:' + WORDS + '))\\s', 'gi');
  var SCOPE = 'h1, h2, h3, p, .m-hero__title, .m-hero__sub, .service-card__title, .fact-card__text, .lead-card__title, .case__info-title, .case__info-text, .case__tag, .tag, .switcher__btn, .contact-card__value';

  function fixNode(node) {
    var v = node.nodeValue;
    if (!v || v.indexOf(' ') === -1) return;
    var nv = v.replace(RE, '$1\u00A0');
    if (nv !== v) node.nodeValue = nv;
  }

  function fix(root) {
    var scope;
    if (root && root.matches && root.matches(SCOPE)) scope = [root];
    else if (root && root.querySelectorAll) scope = root.querySelectorAll(SCOPE);
    else scope = document.querySelectorAll(SCOPE);
    Array.prototype.forEach.call(scope, function (el) {
      if (el.closest && el.closest('[data-typo="off"]')) return;
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
      var n;
      while ((n = walker.nextNode())) fixNode(n);
    });
  }

  window.typoFix = fix;

  /* добираем до текста, который подставляется динамически (инфо кейсов и т.п.) */
  var t;
  function schedule() {
    clearTimeout(t);
    t = setTimeout(function () { fix(document); }, 250);
  }
  if ('MutationObserver' in window) {
    new MutationObserver(schedule).observe(document.body, { childList: true, characterData: true, subtree: true });
  }

  document.addEventListener('DOMContentLoaded', function () { fix(document); });
  window.addEventListener('load', function () { fix(document); });
})();