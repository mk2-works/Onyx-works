/* bubble.js — скруглённые «бабблы».
   Если --tail-h / --tail-w = 0 — рисуется просто скруглённый прямоугольник.
   Внутренняя обводка — SVG-контур, обрезанный тем же clip-path. */

(function () {
  'use strict';

  function num(n) { return Math.round(n * 100) / 100; }

  function rectD(ox, oy, W, H, r) {
    return 'M ' + num(ox + r) + ' ' + num(oy) + ' ' +
      'L ' + num(ox + W - r) + ' ' + num(oy) + ' Q ' + num(ox + W) + ' ' + num(oy) + ' ' + num(ox + W) + ' ' + num(oy + r) + ' ' +
      'L ' + num(ox + W) + ' ' + num(oy + H - r) + ' Q ' + num(ox + W) + ' ' + num(oy + H) + ' ' + num(ox + W - r) + ' ' + num(oy + H) + ' ' +
      'L ' + num(ox + r) + ' ' + num(oy + H) + ' Q ' + num(ox) + ' ' + num(oy + H) + ' ' + num(ox) + ' ' + num(oy + H - r) + ' ' +
      'L ' + num(ox) + ' ' + num(oy + r) + ' Q ' + num(ox) + ' ' + num(oy) + ' ' + num(ox + r) + ' ' + num(oy) + ' Z';
  }

  function leftTailD(ox, oy, W, H, o) {
    const Hb = oy + H - o.tailH;
    const y1 = oy + H;
    const x1 = ox + W;
    const L  = Math.hypot(o.tailW, o.tailH);
    const ux = o.tailW / L, uy = o.tailH / L;
    const r  = o.radius;

    return 'M ' + num(ox + r) + ' ' + num(oy) + ' ' +
      'L ' + num(x1 - r) + ' ' + num(oy) + ' Q ' + num(x1) + ' ' + num(oy) + ' ' + num(x1) + ' ' + num(oy + r) + ' ' +
      'L ' + num(x1) + ' ' + num(Hb - r) + ' Q ' + num(x1) + ' ' + num(Hb) + ' ' + num(x1 - r) + ' ' + num(Hb) + ' ' +
      'L ' + num(ox + o.tailW + o.concave) + ' ' + num(Hb) + ' ' +
      'Q ' + num(ox + o.tailW) + ' ' + num(Hb) + ' ' + num(ox + o.tailW - ux * o.concave) + ' ' + num(Hb + uy * o.concave) + ' ' +
      'L ' + num(ox + ux * o.tip) + ' ' + num(y1 - uy * o.tip) + ' ' +
      'Q ' + num(ox) + ' ' + num(y1) + ' ' + num(ox) + ' ' + num(y1 - o.tip) + ' ' +
      'L ' + num(ox) + ' ' + num(oy + r) + ' Q ' + num(ox) + ' ' + num(oy) + ' ' + num(ox + r) + ' ' + num(oy) + ' Z';
  }

  function rightTailD(ox, oy, W, H, o) {
    const Hb = oy + H - o.tailH;
    const y1 = oy + H;
    const x1 = ox + W;
    const L  = Math.hypot(o.tailW, o.tailH);
    const ux = o.tailW / L, uy = o.tailH / L;
    const r  = o.radius;
    const kx = ox + W - o.tailW;

    return 'M ' + num(ox + r) + ' ' + num(oy) + ' ' +
      'L ' + num(x1 - r) + ' ' + num(oy) + ' Q ' + num(x1) + ' ' + num(oy) + ' ' + num(x1) + ' ' + num(oy + r) + ' ' +
      'L ' + num(x1) + ' ' + num(y1 - o.tip) + ' ' +
      'Q ' + num(x1) + ' ' + num(y1) + ' ' + num(x1 - ux * o.tip) + ' ' + num(y1 - uy * o.tip) + ' ' +
      'L ' + num(kx + ux * o.concave) + ' ' + num(Hb + uy * o.concave) + ' ' +
      'Q ' + num(kx) + ' ' + num(Hb) + ' ' + num(kx - o.concave) + ' ' + num(Hb) + ' ' +
      'L ' + num(ox + r) + ' ' + num(Hb) + ' Q ' + num(ox) + ' ' + num(Hb) + ' ' + num(ox) + ' ' + num(Hb - r) + ' ' +
      'L ' + num(ox) + ' ' + num(oy + r) + ' Q ' + num(ox) + ' ' + num(oy) + ' ' + num(ox + r) + ' ' + num(oy) + ' Z';
  }

  const builders = { left: leftTailD, right: rightTailD };

  function readOptions(el) {
    const cs = getComputedStyle(el);
    function px(name, fb) {
      const v = parseFloat(cs.getPropertyValue(name));
      return isNaN(v) ? fb : v;
    }
    return {
      tailH:   px('--tail-h',        parseFloat(el.dataset.tailH)   || 40),
      tailW:   px('--tail-w',        parseFloat(el.dataset.tailW)   || 60),
      radius:  px('--bubble-radius', parseFloat(el.dataset.radius)  || 12),
      concave: px('--bubble-concave',parseFloat(el.dataset.concave) || 10),
      tip:     px('--bubble-tip',    parseFloat(el.dataset.tip)     || 10),
    };
  }

  function ensureStrokeSvg(el) {
    let svg = el.querySelector(':scope > svg.bubble-stroke');
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'bubble-stroke');
      svg.setAttribute('aria-hidden', 'true');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('fill', 'none');
      svg.appendChild(path);
      el.appendChild(svg);
    }
    return svg;
  }

  function applyBubble(el) {
    const o = readOptions(el);
    const stroke = parseFloat(el.dataset.stroke) || 0;

    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const W = rect.width, H = rect.height;

    /* хвост = 0 → просто скруглённый прямоугольник */
    const hasTail = o.tailH > 0 && o.tailW > 0;
    const build = builders[el.dataset.bubble];
    const dOuter = hasTail && build ? build(0, 0, W, H, o) : rectD(0, 0, W, H, o.radius);

    el.style.clipPath = 'path("' + dOuter + '")';

    if (stroke > 0) {
      const svg = ensureStrokeSvg(el);
      svg.setAttribute('viewBox', '0 0 ' + num(W) + ' ' + num(H));
      const path = svg.querySelector('path');
      path.setAttribute('d', dOuter);
      path.setAttribute('stroke', el.dataset.strokeColor || '#FFFFFF');
      path.setAttribute('stroke-width', String(stroke * 2));
      path.setAttribute('stroke-linejoin', 'round');
    }
  }

  function initBubbles() {
    const els = document.querySelectorAll('[data-bubble]');
    els.forEach(applyBubble);

    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(() => els.forEach(applyBubble));
      els.forEach((el) => ro.observe(el));
    }
    window.addEventListener('resize', () => els.forEach(applyBubble));
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => els.forEach(applyBubble));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBubbles);
  } else {
    initBubbles();
  }
})();