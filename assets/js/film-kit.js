// Drawing kit for the film scenes (1600 × 900 stage).
import { el, seg, ease, lerp, clamp, fillUrl } from './draw.js';

export const LC = {
  KTL: 'var(--ktl)', TWL: 'var(--twl)', ISL: 'var(--isl)', SIL: 'var(--sil)', TKL: 'var(--tkl)',
  TCL: 'var(--tcl)', AEL: 'var(--ael)', DRL: 'var(--drl)', EAL: 'var(--eal)', TML: 'var(--tml)',
};

export function paint(node, { fill, stroke, width, opacity } = {}) {
  if (fill) node.style.fill = fill;
  if (stroke) node.style.stroke = stroke;
  if (width) node.style.strokeWidth = width;
  if (opacity !== undefined) node.style.opacity = opacity;
  return node;
}

/** reveal a path drawn with pathLength=1 */
export function drawIn(node, p) {
  if (p >= 1) { node.style.strokeDasharray = ''; node.style.strokeDashoffset = ''; return; }
  node.style.strokeDasharray = '1 1';
  node.style.strokeDashoffset = String(1 - Math.max(0, p));
}

export const show = (node, p) => { node.style.opacity = String(clamp(p)); };

export function txt(parent, x, y, s, cls = 'f-label', attrs = {}) {
  return el('text', { x, y, class: cls, text: s, ...attrs }, parent);
}

/** deterministic pseudo-random */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** the year stamp used in the top-left of every scene */
export function yearStamp(parent, year, sub) {
  const g = el('g', { class: 'f-stamp' }, parent);
  txt(g, 80, 150, year, 'f-year');
  if (sub) txt(g, 84, 192, sub, 'f-label');
  el('path', { d: 'M80 214h160', class: 'f-ink', 'stroke-width': 2 }, g);
  return g;
}

/** ground layers below y0, using the film's hatch patterns */
export function strata(parent, x, y0, w, layers, k, prefix = 'f') {
  // layers: [{to: metres, kind: 'fill'|'clay'|'weathered'|'rock'}] cumulative from 0
  const g = el('g', { class: 'f-strata' }, parent);
  let from = 0;
  const rects = [];
  for (const L of layers) {
    const r = el('rect', { x, y: y0 + from * k, width: w, height: (L.to - from) * k, fill: fillUrl(prefix, L.kind) }, g);
    el('path', { d: `M${x} ${y0 + from * k}h${w}`, class: 'f-rule', 'stroke-width': 1 }, g);
    rects.push(r);
    from = L.to;
  }
  return g;
}

/** depth ruler: ticks every `step` metres from 0 to max */
export function ruler(parent, x, y0, k, max, step = 10, { side = 'right', unit = 'm' } = {}) {
  const g = el('g', { class: 'f-ruler' }, parent);
  el('path', { d: `M${x} ${y0}V${y0 + max * k}`, class: 'f-ink', 'stroke-width': 1.5 }, g);
  for (let d = 0; d <= max; d += step) {
    const y = y0 + d * k;
    el('path', { d: `M${x - 8} ${y}h16`, class: 'f-ink', 'stroke-width': 1.5 }, g);
    // the zero label sits just below the ground line, clear of street traffic
    txt(g, side === 'right' ? x + 16 : x - 16, d === 0 ? y + 24 : y + 7, d === 0 ? `0 ${unit}` : `−${d}`, 'f-tick', { 'text-anchor': side === 'right' ? 'start' : 'end' });
  }
  return g;
}

/** a train in elevation: body, window band, line-colour stripe */
export function train(parent, { len = 260, h = 40, color = LC.TWL, cars = 4 } = {}) {
  const g = el('g', { class: 'f-train' }, parent);
  const body = el('rect', { x: 0, y: -h, width: len, height: h, rx: 6, class: 'f-train-body' }, g);
  const stripe = el('rect', { x: 2, y: -h * 0.36, width: len - 4, height: h * 0.16, class: 'f-train-stripe' }, g);
  paint(stripe, { fill: color });
  const carLen = len / cars;
  for (let i = 0; i < cars; i++) {
    for (let w = 0; w < 3; w++) {
      el('rect', { x: i * carLen + 10 + w * (carLen - 20) / 3, y: -h * 0.82, width: (carLen - 20) / 3 - 6, height: h * 0.3, class: 'f-window' }, g);
    }
    if (i) el('path', { d: `M${i * carLen} ${-h}v${h}`, class: 'f-ink', 'stroke-width': 1 }, g);
  }
  return g;
}

/** a train seen end-on inside a tunnel section */
export function trainEnd(parent, { w = 56, h = 64, color } = {}) {
  const g = el('g', { class: 'f-train-end' }, parent);
  el('rect', { x: -w / 2, y: -h, width: w, height: h, rx: 7, class: 'f-train-body' }, g);
  el('rect', { x: -w / 2 + 7, y: -h + 10, width: w - 14, height: h * 0.32, class: 'f-window' }, g);
  const s = el('rect', { x: -w / 2 + 2, y: -h * 0.36, width: w - 4, height: h * 0.12, class: 'f-train-stripe' }, g);
  paint(s, { fill: color });
  return g;
}

/** a tunnel bore in section (circle) with a coloured track bed */
export function boreF(parent, { cx, cy, r, color, label }) {
  const g = el('g', { transform: `translate(${cx} ${cy})` }, parent);
  const ring = el('circle', { r, class: 'f-bore' }, g);
  const lining = el('circle', { r: r - 6, class: 'f-lining' }, g);
  const bed = el('rect', { x: -r * 0.66, y: r * 0.42, width: r * 1.32, height: r * 0.14, class: 'f-ink-fill' }, g);
  const glow = el('circle', { r: r - 6, class: 'f-bore-tint' }, g);
  paint(glow, { fill: color });
  paint(ring, { stroke: color });
  return { g, ring, lining, bed, glow };
}

/** a leader-line annotation: dot at (x,y), elbow to (lx,ly), text */
export function leader(parent, x, y, lx, ly, lines, { anchor = 'start', cls = 'f-anno' } = {}) {
  const g = el('g', { class: 'f-leader' }, parent);
  el('circle', { cx: x, cy: y, r: 4, class: 'f-ink-fill' }, g);
  const path = el('path', { d: `M${x} ${y}L${lx} ${ly}h${anchor === 'start' ? 24 : -24}`, class: 'f-ink', 'stroke-width': 1.4, pathLength: 1 }, g);
  const tx = lx + (anchor === 'start' ? 34 : -34);
  const tg = el('g', {}, g);
  lines.forEach((s, i) => txt(tg, tx, ly + 7 + i * 30, s, i === 0 ? cls : 'f-label', { 'text-anchor': anchor }));
  return { g, path, tg };
}

export function animLeader(L, p) {
  drawIn(L.path, ease.out(seg(p, 0, 0.6)));
  show(L.tg, seg(p, 0.45, 1));
  show(L.g, p > 0 ? 1 : 0);
}

/** simple city block elevation for skylines */
export function skyline(parent, x0, x1, base, { seed = 7, hMin = 120, hMax = 320, wMin = 70, wMax = 150, signs = true } = {}) {
  const R = rng(seed);
  const items = [];
  let x = x0;
  while (x < x1) {
    const w = Math.round(lerp(wMin, wMax, R()));
    const h = Math.round(lerp(hMin, hMax, R()));
    const g = el('g', { class: 'f-bldg' }, parent);
    const rect = el('rect', { x, y: base - h, width: Math.min(w, x1 - x) - 6, height: h, class: 'f-bldg-body' }, g);
    const win = el('g', { class: 'f-windows' }, g);
    for (let y = base - h + 16; y < base - 26; y += 20) {
      el('path', { d: `M${x + 9} ${y}h${Math.min(w, x1 - x) - 24}`, class: 'f-winline' }, win);
    }
    let sign = null;
    if (signs && R() > 0.55 && h > 160) {
      const sy = base - h * lerp(0.35, 0.7, R());
      const sh = lerp(46, 90, R());
      sign = el('rect', { x: x + w - 12, y: sy, width: 22, height: sh, class: 'f-sign' }, g);
    }
    items.push({ g, rect, win, sign, x, w, h });
    x += w;
  }
  return items;
}

export function growSkyline(items, p, base) {
  const n = items.length;
  items.forEach((b, i) => {
    const q = ease.out(seg(p, (i / n) * 0.7, (i / n) * 0.7 + 0.3));
    b.rect.setAttribute('y', base - b.h * q);
    b.rect.setAttribute('height', b.h * q);
    b.win.style.opacity = String(seg(q, 0.8, 1));
    if (b.sign) b.sign.style.opacity = String(seg(q, 0.9, 1));
  });
}

export { el, seg, ease, lerp, clamp, fillUrl };
