// SVG drawing helpers shared by the opening cut, the film, the map and the stacks.
export const NS = 'http://www.w3.org/2000/svg';

export function el(tag, attrs = {}, parent) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'text') node.textContent = v;
    else if (k === 'class') node.setAttribute('class', v);
    else node.setAttribute(k, v);
  }
  if (parent) parent.appendChild(node);
  return node;
}

export function set(node, attrs) {
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
/** progress of p through the window [a, b], clamped to 0..1 */
export const seg = (p, a, b) => clamp((p - a) / (b - a));

export const ease = {
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: (t) => 1 - Math.pow(1 - t, 3),
  outExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  in: (t) => t * t * t,
};

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Hatch patterns for the ground layers. Each SVG gets its own copy with a
 * prefix, so the colours follow whatever CSS variables are in scope
 * (the page theme, or the film's projection-room palette).
 */
export function strataDefs(svg, prefix) {
  const defs = el('defs', {}, svg);
  const pat = (id, w, h, build) => {
    const p = el('pattern', { id: `${prefix}-${id}`, width: w, height: h, patternUnits: 'userSpaceOnUse' }, defs);
    build(p);
    return p;
  };
  // reclaimed fill: stipple
  pat('fill', 14, 14, (p) => {
    el('rect', { width: 14, height: 14, class: 'stratum-fill' }, p);
    el('circle', { cx: 3, cy: 4, r: 0.9, class: 'pat-dot' }, p);
    el('circle', { cx: 10, cy: 9, r: 0.7, class: 'pat-dot' }, p);
    el('circle', { cx: 6, cy: 12, r: 0.6, class: 'pat-dot' }, p);
  });
  // marine deposits / clay: short horizontal dashes
  pat('clay', 18, 8, (p) => {
    el('rect', { width: 18, height: 8, class: 'stratum-clay' }, p);
    el('path', { d: 'M2 2.5h6M11 6.5h6', class: 'pat-line' }, p);
  });
  // weathered rock (decomposed granite): sparse cross-hatch
  pat('weathered', 16, 16, (p) => {
    el('rect', { width: 16, height: 16, class: 'stratum-weathered' }, p);
    el('path', { d: 'M0 16L16 0M-4 4L4 -4M12 20L20 12', class: 'pat-line' }, p);
    el('path', { d: 'M4 4l3 3M11 10l3 3', class: 'pat-line' }, p);
  });
  // rock: close diagonal hatch
  pat('rock', 9, 9, (p) => {
    el('rect', { width: 9, height: 9, class: 'stratum-rock' }, p);
    el('path', { d: 'M0 9L9 0M-2 2L2 -2M7 11L11 7', class: 'pat-line' }, p);
  });
  // water: ruled lines
  pat('water', 24, 7, (p) => {
    el('rect', { width: 24, height: 7, class: 'water-fill' }, p);
    el('path', { d: 'M0 3.5h24', class: 'pat-water' }, p);
  });
  // concrete: tiny aggregate
  pat('concrete', 12, 12, (p) => {
    el('rect', { width: 12, height: 12, class: 'paper-fill' }, p);
    el('path', { d: 'M3 3l1.4 .6-.8 1.2zM8.5 8l1.2 .3-.5 1z', class: 'pat-line' }, p);
  });
  return defs;
}

export const fillUrl = (prefix, id) => `url(#${prefix}-${id})`;

/** A tunnel bore in section: line-coloured disc, ink casing, a track slab. */
export function bore(parent, { cx, cy, r, color, cls = '' }) {
  const g = el('g', { class: `bore ${cls}`.trim(), transform: `translate(${cx} ${cy})` }, parent);
  el('circle', { r: r + 3, fill: 'none', class: 'ink-line', 'stroke-width': 1.2, opacity: 0.5 }, g);
  const ring = el('circle', { r, fill: color, class: 'ink-line', 'stroke-width': 2.2 }, g);
  ring.style.fill = color;
  el('rect', { x: -r * 0.62, y: r * 0.38, width: r * 1.24, height: r * 0.16, class: 'ink-fill', opacity: 0.85 }, g);
  return g;
}

/** A rectangular platform box (cut-and-cover or mined cavern) */
export function box(parent, { x, y, w, h, color, label }) {
  const g = el('g', { class: 'box' }, parent);
  el('rect', { x, y, width: w, height: h, class: 'ink-line paper-fill', 'stroke-width': 2 }, g);
  const band = el('rect', { x: x + 4, y: y + h - 12, width: w - 8, height: 6, class: 'ink-line', 'stroke-width': 1 }, g);
  band.style.fill = color;
  if (label) el('text', { x: x + 8, y: y + 18, class: 'svg-label', text: label }, g);
  return g;
}

/** Linear layout of depths on a vertical axis */
export function depthScale(top, bottom, d0, d1) {
  return (d) => top + ((d - d0) / (d1 - d0)) * (bottom - top);
}

/** Formats seconds as m:ss */
export const mmss = (s) => {
  s = Math.max(0, Math.round(s));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/**
 * A frame loop that keeps working when rAF is throttled: rAF drives frames
 * while the page is visible, and a timer backstop keeps the clock honest.
 */
export function frameLoop(step) {
  let running = false;
  let last = 0;
  let raf = 0;
  let timer = 0;
  const tick = () => {
    if (!running) return;
    const now = performance.now();
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    step(dt);
    cancelAnimationFrame(raf);
    clearTimeout(timer);
    raf = requestAnimationFrame(tick);
    timer = setTimeout(tick, 120);
  };
  return {
    start() {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
      timer = setTimeout(tick, 120);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    },
    get running() { return running; },
  };
}
