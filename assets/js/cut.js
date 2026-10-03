// Fig. 1 — the Admiralty cut. The section draws itself in construction order.
import { el, seg, ease, frameLoop, prefersReducedMotion, strataDefs, fillUrl } from './draw.js';

const C = { TWL: 'var(--twl)', ISL: 'var(--isl)', SIL: 'var(--sil)', EAL: 'var(--eal)' };

function trainEnd(parent, x, floorY, color, { w = 44, h = 50 } = {}) {
  const g = el('g', { class: 'c-train', transform: `translate(${x} ${floorY})` }, parent);
  const body = el('rect', { x: -w / 2, y: -h, width: w, height: h, rx: 6, class: 'c-train-body' }, g);
  body.style.fill = color;
  el('rect', { x: -w / 2 + 6, y: -h + 8, width: w - 12, height: h * 0.32, class: 'c-train-win' }, g);
  el('path', { d: `M${-w / 2 + 4} ${-h * 0.28}h${w - 8}`, class: 'ink-line', 'stroke-width': 1.2 }, g);
  return g;
}

export function initCut(root) {
  const svg = root.querySelector('svg');
  const legend = document.querySelector('[data-fill="cut-legend"]');
  strataDefs(svg, 'c');

  const W = 900;
  const ST = 120; // street level

  // ---- ground ----
  const ground = el('g', {}, svg);
  const layers = [[ST, 232, 'fill'], [232, 300, 'clay'], [300, 430, 'weathered'], [430, 760, 'rock']];
  layers.forEach(([a, b, k]) => {
    el('rect', { x: 0, y: a, width: W, height: b - a, fill: fillUrl('c', k) }, ground);
    el('path', { d: `M0 ${a}H${W}`, class: 'hair' }, ground);
  });
  const clip = el('clipPath', { id: 'c-ground-clip' }, svg);
  const clipR = el('rect', { x: 0, y: ST, width: W, height: 0 }, clip);
  ground.setAttribute('clip-path', 'url(#c-ground-clip)');

  const stratLabels = el('g', { class: 'c-strat-labels c-minor' }, svg);
  [['Reclaimed fill', 180], ['Marine deposits', 270], ['Weathered rock', 372], ['Rock', 466]].forEach(([s, y]) => {
    el('text', { x: W - 12, y, class: 'svg-label svg-label--muted', 'text-anchor': 'end', text: s }, stratLabels);
  });

  // ---- city above ----
  const city = el('g', { class: 'c-city' }, svg);
  [[60, 26, 150], [170, 8, 120], [300, 40, 110], [430, 0, 170], [620, 30, 130], [770, 14, 110]].forEach(([x, y, w]) => {
    el('rect', { x, y, width: w, height: ST - y, class: 'ink-line paper-fill', 'stroke-width': 1.2 }, city);
    for (let yy = y + 14; yy < ST - 10; yy += 14) el('path', { d: `M${x + 8} ${yy}h${w - 16}`, class: 'hair', 'stroke-dasharray': '6 5' }, city);
  });
  const street = el('path', { d: `M0 ${ST}H${W}`, class: 'ink-line', 'stroke-width': 2.5, pathLength: 1 }, svg);

  // ---- 1980 box: concourse + two platform levels ----
  const box80 = el('g', {}, svg);
  const bx0 = 60, bx1 = 440;
  const lv = { roof: 132, l1: 186, l2: 264, l3: 344 };
  const box80Outline = el('path', { d: `M${bx0} ${lv.roof}H${bx1}V${lv.l3 + 10}H${bx0}Z`, class: 'ink-line c-box', 'stroke-width': 2, pathLength: 1 }, box80);
  const slabs80 = el('g', {}, box80);
  [lv.l1, lv.l2].forEach((y) => el('rect', { x: bx0, y, width: bx1 - bx0, height: 7, class: 'ink-fill' }, slabs80));
  el('rect', { x: bx0, y: lv.l3, width: bx1 - bx0, height: 10, class: 'ink-fill' }, slabs80);
  [lv.l2, lv.l3].forEach((y) => el('rect', { x: 216, y: y - 22, width: 68, height: 22, class: 'ink-line paper-fill', 'stroke-width': 1.5 }, slabs80));
  const twl = el('g', {}, svg);
  trainEnd(twl, 160, lv.l2, C.TWL);
  trainEnd(twl, 160, lv.l3, C.TWL);
  const isl = el('g', {}, svg);
  trainEnd(isl, 340, lv.l2, C.ISL);
  trainEnd(isl, 340, lv.l3, C.ISL);
  const defs = svg.querySelector('defs');
  const mk = el('marker', { id: 'c-arrow', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
  el('path', { d: 'M0 1L9 5L0 9z', class: 'ink-fill' }, mk);
  const cross = el('g', { class: 'c-cross' }, svg);
  [lv.l2, lv.l3].forEach((y) => {
    el('path', { d: `M194 ${y - 32}h112`, class: 'ink-line', 'stroke-width': 1.4, 'marker-end': 'url(#c-arrow)', 'marker-start': 'url(#c-arrow)' }, cross);
  });

  // ---- 2016: an atrium beside the old box, three new levels beneath it ----
  const ext = el('g', {}, svg);
  const ex0 = 200, ex1 = 720;
  const lx = { top: 430, l4: 494, l5: 584, l6: 676 };
  const ax0 = bx1, ax1 = 520; // atrium
  const extOutline = el('path', {
    d: `M${ax0} ${lv.l1}H${ax1}V${lx.top}H${ex1}V${lx.l6 + 12}H${ex0}V${lx.top}H${ax0}`,
    class: 'ink-line c-box', 'stroke-width': 2, pathLength: 1,
  }, ext);
  const extSlabs = el('g', {}, ext);
  el('rect', { x: ex0, y: lx.l4, width: ex1 - ex0, height: 7, class: 'ink-fill' }, extSlabs);
  el('rect', { x: ex0, y: lx.l5, width: ex1 - ex0, height: 7, class: 'ink-fill' }, extSlabs);
  el('rect', { x: ex0, y: lx.l6, width: ex1 - ex0, height: 12, class: 'ink-fill' }, extSlabs);
  el('rect', { x: 426, y: lx.l5 - 22, width: 68, height: 22, class: 'ink-line paper-fill', 'stroke-width': 1.5 }, extSlabs);
  el('rect', { x: 426, y: lx.l6 - 22, width: 68, height: 22, class: 'ink-line paper-fill', 'stroke-width': 1.5 }, extSlabs);
  const atrium = el('g', {}, ext);
  // escalators zig-zag down the atrium, then on to the platform levels
  el('path', { d: `M${ax0 + 10} ${lv.l1 + 70}L${ax1 - 10} ${lv.l1 + 7}M${ax1 - 10} ${lv.l1 + 150}L${ax0 + 10} ${lv.l1 + 76}M${ax0 + 10} ${lv.l1 + 230}L${ax1 - 10} ${lv.l1 + 156}M${ax1 - 10} ${lx.l4}L${ax0 + 10} ${lv.l1 + 236}`, class: 'ink-line', 'stroke-width': 1.5 }, atrium);
  el('path', { d: `M236 ${lx.l5}L286 ${lx.l4 + 7}M236 ${lx.l6}L286 ${lx.l5 + 7}`, class: 'ink-line', 'stroke-width': 1.5 }, atrium);
  // underpinning: the old box was propped while it was dug beneath
  const pins = el('g', {}, ext);
  for (let x = 220; x <= 420; x += 40) el('path', { d: `M${x} ${lv.l3 + 10}V${lx.top}`, class: 'ink-line', 'stroke-width': 3 }, pins);
  el('text', { x: 72, y: lv.l3 + 52, class: 'svg-label svg-label--muted c-minor', text: 'Underpinned' }, pins);
  el('text', { x: 72, y: lv.l3 + 70, class: 'svg-label svg-label--muted c-minor', text: 'while trains ran' }, pins);
  const sil = el('g', {}, svg);
  trainEnd(sil, 370, lx.l6, C.SIL);
  trainEnd(sil, 550, lx.l6, C.SIL);
  const eal = el('g', {}, svg);
  trainEnd(eal, 370, lx.l5, C.EAL);
  trainEnd(eal, 550, lx.l5, C.EAL);
  const reserved = el('text', { x: 460, y: lx.l5 - 36, class: 'svg-label svg-label--muted c-key', 'text-anchor': 'middle', text: 'Reserved' }, svg);

  // ---- level markers (architectural datum triangles) ----
  const levels = el('g', { class: 'c-levels' }, svg);
  const lvMark = (y, s, x = 16) => {
    const g = el('g', {}, levels);
    el('path', { d: `M${x} ${y - 10}h14l-7 10z`, class: 'ink-fill' }, g);
    el('text', { x: x + 18, y: y - 1, class: 'svg-label c-key', text: s }, g);
    return g;
  };
  const lvs = [
    lvMark(lv.l1, 'L1'), lvMark(lv.l2, 'L2'), lvMark(lv.l3, 'L3'),
    lvMark(lx.l4, 'L4', 152), lvMark(lx.l5, 'L5', 152), lvMark(lx.l6, 'L6', 152),
  ];
  el('text', { x: 72, y: lv.l1 - 14, class: 'svg-label svg-label--muted c-minor', text: 'Concourse' }, levels);
  el('text', { x: 214, y: lx.l4 - 14, class: 'svg-label svg-label--muted c-minor', text: 'Transfer level' }, levels);

  // ---- year stamps ----
  const stamp = (x, y, yr, anchor = 'start') => el('text', { x, y, class: 'c-year', 'text-anchor': anchor, text: yr }, svg);
  const y80 = stamp(72, 210, '1980');
  const y85 = stamp(430, 210, '1985', 'end');
  const y16 = stamp(ex1 - 12, lx.l6 - 64, '2016', 'end');
  const y22 = stamp(ex1 - 12, lx.l5 - 64, '2022', 'end');

  // ---- the one hard number ----
  const dim = el('g', { class: 'c-dim' }, svg);
  el('path', { d: `M${ex1} ${lx.l6}h44M${ex1 + 30} ${lx.l6}v40`, class: 'ink-line', 'stroke-width': 1.2 }, dim);
  el('text', { x: ex1 + 20, y: lx.l6 + 36, class: 'svg-label c-key', 'text-anchor': 'end', text: '−33.6 mPD' }, dim);
  el('text', { x: ex1 + 20, y: lx.l6 + 56, class: 'svg-label svg-label--muted c-minor', 'text-anchor': 'end', text: 'MTR’s lowest station level' }, dim);

  const legendItems = legend ? [...legend.children] : [];

  const render = (p) => {
    const q = (a, b) => seg(p, a, b);
    clipR.setAttribute('height', (ease.inOut(q(0, 0.2)) * (760 - ST)).toFixed(1));
    street.style.strokeDasharray = p >= 0.15 ? '' : '1 1';
    street.style.strokeDashoffset = p >= 0.15 ? '' : String(1 - q(0, 0.15));
    city.style.opacity = String(q(0.05, 0.2));
    stratLabels.style.opacity = String(q(0.15, 0.25));

    const pBox = q(0.15, 0.33);
    box80Outline.style.strokeDasharray = pBox >= 1 ? '' : '1 1';
    box80Outline.style.strokeDashoffset = pBox >= 1 ? '' : String(1 - pBox);
    box80Outline.style.fillOpacity = String(q(0.22, 0.33));
    slabs80.style.opacity = String(q(0.25, 0.33));
    lvs.slice(0, 3).forEach((n) => (n.style.opacity = String(q(0.25, 0.33))));
    levels.lastElementChild.previousElementSibling.style.opacity = String(q(0.25, 0.33));

    twl.style.opacity = String(q(0.33, 0.4));
    y80.style.opacity = String(q(0.33, 0.4));
    isl.style.opacity = String(q(0.45, 0.52));
    y85.style.opacity = String(q(0.45, 0.52));
    cross.style.opacity = String(q(0.5, 0.56));

    const pExt = q(0.56, 0.74);
    extOutline.style.strokeDasharray = pExt >= 1 ? '' : '1 1';
    extOutline.style.strokeDashoffset = pExt >= 1 ? '' : String(1 - pExt);
    extOutline.style.fillOpacity = String(q(0.62, 0.74));
    extSlabs.style.opacity = String(q(0.66, 0.74));
    atrium.style.opacity = String(q(0.66, 0.74));
    pins.style.opacity = String(q(0.6, 0.68));
    lvs.slice(3).forEach((n) => (n.style.opacity = String(q(0.66, 0.74))));
    levels.lastElementChild.style.opacity = String(q(0.66, 0.74));
    sil.style.opacity = String(q(0.74, 0.8));
    y16.style.opacity = String(q(0.74, 0.8));
    dim.style.opacity = String(q(0.78, 0.86));
    reserved.style.opacity = String(q(0.74, 0.8) * (1 - q(0.88, 0.92)));
    eal.style.opacity = String(q(0.9, 0.96));
    y22.style.opacity = String(q(0.9, 0.96));

    const steps = [0.33, 0.45, 0.74, 0.9];
    legendItems.forEach((li, i) => li.classList.toggle('is-on', p >= steps[i]));
  };

  if (prefersReducedMotion()) {
    render(1);
    return;
  }
  render(0);
  const DUR = 4.2;
  let t = 0;
  const loop = frameLoop((dt) => {
    t += dt;
    render(Math.min(1, t / DUR));
    if (t >= DUR) loop.stop();
  });
  // start once the figure is (or becomes) visible; never block content on it
  const start = () => loop.start();
  if (document.visibilityState === 'visible') start();
  else document.addEventListener('visibilitychange', start, { once: true });
  setTimeout(() => { if (t < DUR) { loop.stop(); render(1); } }, 9000);
}
