// Film scenes, chapters 5–9: Admiralty, crossings and the bridge, deep caverns
// and viaducts, the fourth crossing, and the closing "read the layers" chart.
import {
  el, seg, ease, lerp, clamp, fillUrl, LC, paint, drawIn, show, txt,
  yearStamp, strata, train, trainEnd, leader, animLeader,
} from './film-kit.js';

/* ---------- shared: big platform level with two trains end-on ---------- */
function levelBand(parent, { y, x0 = 360, x1 = 1240, label, left, right }) {
  const g = el('g', {}, parent);
  el('rect', { x: x0, y: y - 190, width: x1 - x0, height: 190, class: 'f-void' }, g);
  el('rect', { x: x0, y, width: x1 - x0, height: 14, class: 'f-slab' }, g);
  el('rect', { x: x0, y: y - 204, width: x1 - x0, height: 14, class: 'f-slab' }, g);
  el('rect', { x: 720, y: y - 44, width: 160, height: 44, class: 'f-concrete' }, g);
  const lt = trainEnd(g, { w: 120, h: 140, color: left.color });
  lt.setAttribute('transform', `translate(560 ${y})`);
  const rt = trainEnd(g, { w: 120, h: 140, color: right.color });
  rt.setAttribute('transform', `translate(1040 ${y})`);
  txt(g, x0 - 24, y - 90, label, 'f-level', { 'text-anchor': 'end' });
  const two = (x, label) => {
    const [line, dest] = label.split(' · ');
    const tg = el('g', {}, g);
    txt(tg, x, y + 46, line, 'f-name', { 'text-anchor': 'middle' });
    if (dest) txt(tg, x, y + 90, dest, 'f-name f-dest', { 'text-anchor': 'middle' });
    return tg;
  };
  const lName = two(560, left.name);
  const rName = two(1040, right.name);
  return { g, lt, rt, lName, rName };
}

/* =========================================================
   5 · 1985 — two lines, one station (Admiralty L2/L3)
   ========================================================= */
function admiralty85(g, { W }) {
  strata(g, 0, 0, W, [{ to: 30, kind: 'weathered' }, { to: 90, kind: 'rock' }], 10);
  const L2 = levelBand(g, { y: 400, label: 'L2', left: { color: LC.TWL, name: 'Tsuen Wan Line · to Central' }, right: { color: LC.ISL, name: 'Island Line · to Chai Wan' } });
  const L3 = levelBand(g, { y: 720, label: 'L3', left: { color: LC.TWL, name: 'Tsuen Wan Line · to Tsuen Wan' }, right: { color: LC.ISL, name: 'Island Line · to Kennedy Town' } });

  const walkers = [];
  [[L2, 400, 1], [L3, 720, -1]].forEach(([, y, dir]) => {
    const w = el('g', {}, g);
    el('circle', { cx: 0, cy: -70, r: 12, class: 'f-person-head' }, w);
    el('path', { d: 'M0 -58v34M0 -24l-10 24M0 -24l10 24M-12 -48h24', class: 'f-ink', 'stroke-width': 4, 'stroke-linecap': 'round' }, w);
    const arrow = el('path', { d: `M${dir > 0 ? 660 : 940} ${y - 120}H${dir > 0 ? 940 : 660}`, class: 'f-arrow', 'marker-end': 'url(#f-arrowhead)', pathLength: 1 }, g);
    walkers.push({ w, y, dir, arrow });
  });
  const defs = g.ownerSVGElement.querySelector('defs');
  if (!defs.querySelector('#f-arrowhead')) {
    const m = el('marker', { id: 'f-arrowhead', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto' }, defs);
    el('path', { d: 'M0 1L9 5L0 9z', class: 'f-ink-fill' }, m);
  }
  const s80 = txt(g, 560, 120, '1980', 'f-year-sm', { 'text-anchor': 'middle' });
  const s85 = txt(g, 1040, 120, '1985', 'f-year-sm', { 'text-anchor': 'middle' });
  const note = txt(g, 1560, 880, 'Destinations as today', 'f-label', { 'text-anchor': 'end' });
  const title = txt(g, 80, 120, 'Admiralty', 'f-title');

  return (t, p) => {
    show(title, seg(p, 0, 0.05));
    [L2, L3].forEach((L) => { show(L.g, seg(p, 0.02, 0.1)); });
    [L2.lt, L3.lt, L2.lName, L3.lName, s80].forEach((n) => show(n, seg(p, 0.12, 0.2)));
    [L2.rt, L3.rt, L2.rName, L3.rName, s85].forEach((n) => show(n, seg(p, 0.3, 0.38)));
    walkers.forEach((wk, i) => {
      const q = ease.inOut(seg(p, 0.6 + i * 0.12, 0.72 + i * 0.12));
      const x = wk.dir > 0 ? lerp(640, 960, q) : lerp(960, 640, q);
      wk.w.setAttribute('transform', `translate(${x.toFixed(1)} ${wk.y - 44})`);
      show(wk.w, seg(p, 0.58 + i * 0.12, 0.6 + i * 0.12));
      drawIn(wk.arrow, q);
      show(wk.arrow, q > 0 ? 1 : 0);
    });
    show(note, seg(p, 0.4, 0.5));
  };
}

/* ---------- shared: the harbour in plan, with its rail crossings ---------- */
const CROSSINGS = [
  { year: 1980, x: 700, colors: [LC.TWL], label: '1980', sub: 'Tsuen Wan Line', short: 'Tsuen Wan' },
  { year: 1989, x: 1190, colors: [LC.TKL], label: '1989', sub: 'Road + rail tube', short: 'Road + rail' },
  { year: 1998, x: 440, colors: [LC.TCL, LC.AEL], label: '1998', sub: 'Airport Railway', short: 'Airport' },
  { year: 2022, x: 930, colors: [LC.EAL], label: '2022', sub: 'East Rail Line', short: 'East Rail' },
];
function harbourPlan(parent) {
  const g = el('g', {}, parent);
  const north = 'M0 390 C 120 380 220 410 330 396 S 520 372 640 386 S 860 404 980 380 S 1180 360 1300 384 S 1500 400 1600 380';
  const south = 'M0 560 C 140 572 260 548 380 560 S 600 584 720 566 S 940 548 1060 570 S 1300 590 1420 566 S 1560 556 1600 564';
  el('path', { d: `${north} L1600 564 ${south.replace('M0 560', '').split(' ').length ? '' : ''}`, class: 'f-none' }, g);
  const water = el('path', { d: `${north} L1600 564 L1600 564 C 1560 556 1420 566 1420 566 S 1300 590 1060 570 S 940 548 720 566 S 600 584 380 560 S 140 572 0 560 Z`, fill: fillUrl('f', 'water') }, g);
  el('path', { d: north, class: 'f-ink', 'stroke-width': 2.2, fill: 'none' }, g);
  el('path', { d: south, class: 'f-ink', 'stroke-width': 2.2, fill: 'none' }, g);
  txt(g, 60, 340, 'Kowloon', 'f-place');
  txt(g, 60, 630, 'Hong Kong Island', 'f-place');
  txt(g, 1540, 485, 'Victoria Harbour', 'f-place', { 'text-anchor': 'end' });
  const marks = CROSSINGS.map((c) => {
    const m = el('g', {}, g);
    c.colors.forEach((col, i) => {
      const x = c.x + (i - (c.colors.length - 1) / 2) * 20;
      el('path', { d: `M${x} 300V650`, class: 'f-case', pathLength: 1 }, m);
      const ln = el('path', { d: `M${x} 300V650`, class: 'f-xline', pathLength: 1 }, m);
      paint(ln, { stroke: col });
    });
    txt(m, c.x, 270, c.label, 'f-year-sm', { 'text-anchor': 'middle' });
    txt(m, c.x, 690, c.sub, 'f-label', { 'text-anchor': 'middle' });
    txt(m, c.x, 700, c.short, 'f-name sm', { 'text-anchor': 'middle' });
    return { m, c, paths: [...m.querySelectorAll('path')] };
  });
  const count = txt(g, 1540, 160, '', 'f-count', { 'text-anchor': 'end' });
  const countSub = txt(g, 1540, 200, 'rail crossings', 'f-label', { 'text-anchor': 'end' });
  txt(g, 1540, 214, 'crossings', 'f-name sm', { 'text-anchor': 'end' });
  return { g, marks, count, countSub };
}
function showCrossings(H, upto, p) {
  let n = 0;
  H.marks.forEach((mk, i) => {
    if (i >= upto) { show(mk.m, 0); return; }
    const q = typeof p === 'function' ? p(i) : 1;
    show(mk.m, q > 0 ? 1 : 0);
    mk.paths.forEach((path) => drawIn(path, ease.out(q)));
    if (q > 0.5) n++;
  });
  H.count.textContent = String(n);
}

/* =========================================================
   6 · 1989–98 — more crossings, and a bridge
   ========================================================= */
function bridge(g, { W }) {
  const A = el('g', {}, g);
  const H = harbourPlan(A);

  // Tsing Ma: elevation
  const B = el('g', {}, g);
  const deckY = 470, water = 640;
  el('rect', { x: 0, y: water, width: W, height: 260, fill: fillUrl('f', 'water') }, B);
  el('path', { d: `M0 ${water}H${W}`, class: 'f-ink', 'stroke-width': 1.5 }, B);
  const towers = [420, 1180];
  towers.forEach((x) => {
    el('path', { d: `M${x - 16} ${water + 20}V140M${x + 16} ${water + 20}V140M${x - 16} 200h32M${x - 16} 330h32`, class: 'f-ink', 'stroke-width': 4 }, B);
  });
  const cable = el('path', { d: `M0 330 Q 210 300 420 140 Q 800 610 1180 140 Q 1390 300 1600 330`, class: 'f-cable', pathLength: 1 }, B);
  const hangers = el('g', {}, B);
  for (let x = 460; x < 1150; x += 36) {
    const tq = (x - 420) / 760;
    const cy = (1 - tq) * (1 - tq) * 140 + 2 * (1 - tq) * tq * 610 + tq * tq * 140;
    el('path', { d: `M${x} ${cy.toFixed(1)}V${deckY}`, class: 'f-hair' }, hangers);
  }
  el('rect', { x: 0, y: deckY, width: W, height: 22, class: 'f-deck' }, B);
  const tB = train(B, { len: 180, h: 16, color: LC.TCL, cars: 4 });
  const span = leader(B, 800, deckY + 22, 860, 560, ['Main span 1,377 m'], { anchor: 'start' });

  // Tsing Ma: deck cross-section
  const S = el('g', {}, g);
  const sx0 = 240, sx1 = 1060, top = 300, mid = 420, bot = 610;
  el('path', { d: `M${sx0} ${top}H${sx1}L${sx1 - 60} ${bot}H${sx0 + 60}Z`, class: 'f-deck-box' }, S);
  el('path', { d: `M${sx0 + 30} ${mid}H${sx1 - 30}`, class: 'f-ink', 'stroke-width': 3 }, S);
  for (let i = 0; i < 8; i++) {
    const xa = lerp(sx0 + 10, sx0 + 60, i % 2 ? 1 : 0);
    // side trusses
  }
  [[sx0, sx0 + 60], [sx1, sx1 - 60]].forEach(([a, b]) => {
    el('path', { d: `M${a + (b - a) * 0.1} ${top + 20}L${a + (b - a) * 0.55} ${(top + bot) / 2}L${a + (b - a) * 0.9} ${bot - 20}`, class: 'f-ink', 'stroke-width': 1.5 }, S);
  });
  el('path', { d: `M${sx0 + 60} ${bot}H${sx1 - 60}`, class: 'f-ink', 'stroke-width': 3 }, S);
  // road deck: three lanes each way
  const cars = el('g', {}, S);
  [330, 440, 550, 760, 870, 980].forEach((x) => {
    el('rect', { x: x - 26, y: top - 30, width: 52, height: 30, rx: 5, class: 'f-train-body' }, cars);
  });
  el('path', { d: `M650 ${top - 12}V${top}`, class: 'f-ink', 'stroke-width': 4 }, S);
  // railway and emergency lanes
  const rail = el('g', {}, S);
  const ta = trainEnd(rail, { w: 96, h: 126, color: LC.TCL }); ta.setAttribute('transform', `translate(580 ${bot - 4})`);
  const tb = trainEnd(rail, { w: 96, h: 126, color: LC.AEL }); tb.setAttribute('transform', `translate(740 ${bot - 4})`);
  const lanes = el('g', {}, S);
  [370, 930].forEach((x) => el('rect', { x: x - 30, y: bot - 40, width: 60, height: 36, rx: 5, class: 'f-train-body' }, lanes));
  const lRoad = leader(S, 980, top - 18, 1110, 210, ['Upper deck', 'Six-lane expressway'], { anchor: 'start' });
  const lRail = leader(S, 660, bot - 70, 1110, 500, ['Lower deck, enclosed', 'Railway: two tracks'], { anchor: 'start' });
  const lLane = leader(S, 370, bot - 40, 420, 720, ['Two sheltered', 'emergency road lanes'], { anchor: 'start' });
  const stamp = yearStamp(g, '1998', 'Tsing Ma Bridge');

  return (t, p) => {
    // A: crossings 1980 → 1998
    const a = 1 - seg(t, 12.2, 13.2);
    show(A, a);
    showCrossings(H, 3, (i) => [1, seg(t, 1, 3), seg(t, 8, 10)][i]);
    show(H.countSub, 1);
    // B: elevation
    const b = seg(t, 13.2, 14.2) * (1 - seg(t, 19.2, 20.2));
    show(B, b);
    drawIn(cable, seg(t, 13.4, 16));
    show(hangers, seg(t, 15, 16.5));
    const pr = seg(t, 15.5, 19.5);
    tB.setAttribute('transform', `translate(${lerp(-200, W + 20, pr).toFixed(1)} ${deckY + 18})`);
    animLeader(span, seg(t, 16, 17.5));
    // C: section
    show(S, seg(t, 20.2, 21));
    show(cars, seg(t, 20.6, 21.4));
    show(rail, seg(t, 21.4, 22.2));
    show(lanes, seg(t, 23, 23.8));
    animLeader(lRoad, seg(t, 21.2, 22.4));
    animLeader(lRail, seg(t, 22.2, 23.4));
    animLeader(lLane, seg(t, 23.6, 24.8));
    show(stamp, seg(t, 13.2, 14.2));
  };
}

/* =========================================================
   7 · 2014–16 — deeper, and higher
   ========================================================= */
function deepHigh(g, { W }) {
  // --- A: HKU, a cavern under a hillside ---
  const A = el('g', {}, g);
  const k = 5.2;
  const cavTop = 690, cavBot = cavTop + 16 * k; // cavern about 16 m tall (CEDD)
  const shaftX = 1130;
  const shaftTop = cavBot - 65 * k; // 65 m shaft
  const towerTop = shaftTop - 33 * k; // 33 m lift tower
  const groundPts = [[0, 640], [300, 600], [600, 520], [900, 440], [shaftX - 30, shaftTop], [shaftX + 60, shaftTop], [shaftX + 80, towerTop], [W, towerTop]];
  const gd = 'M' + groundPts.map(([x, y]) => `${x} ${y.toFixed(1)}`).join('L');
  el('path', { d: `${gd}L${W} 900L0 900Z`, fill: fillUrl('f', 'rock') }, A);
  const gl = el('path', { d: gd, class: 'f-ink', 'stroke-width': 2.5, fill: 'none', pathLength: 1 }, A);
  // campus buildings on the upper terrace
  [[1270, 70], [1380, 100], [1500, 60]].forEach(([x, h]) => el('rect', { x, y: towerTop - h, width: 90, height: h, class: 'f-bldg-body' }, A));
  txt(A, 1420, towerTop - 130, 'University', 'f-place', { 'text-anchor': 'middle' });
  // cavern: arched roof
  const cav = el('path', { d: `M380 ${cavBot}V${cavTop + 30}Q380 ${cavTop - 10} 450 ${cavTop - 10}H950Q1020 ${cavTop - 10} 1020 ${cavTop + 30}V${cavBot}Z`, class: 'f-cavern' }, A);
  const tA = train(A, { len: 360, h: 40, color: LC.ISL, cars: 4 });
  tA.setAttribute('transform', `translate(520 ${cavBot - 8})`);
  el('rect', { x: 400, y: cavBot - 8, width: 600, height: 8, class: 'f-slab' }, A);
  // shaft + tower
  const shaft = el('g', {}, A);
  el('rect', { x: shaftX - 26, y: shaftTop, width: 52, height: cavBot - shaftTop - 20, class: 'f-shaft-box' }, shaft);
  el('rect', { x: shaftX - 26, y: towerTop, width: 52, height: shaftTop - towerTop, class: 'f-tower' }, shaft);
  el('path', { d: `M1020 ${cavBot - 30}H${shaftX - 26}`, class: 'f-ink', 'stroke-width': 3 }, shaft);
  const car = el('rect', { x: shaftX - 16, y: 0, width: 32, height: 34, class: 'f-lift' }, A);
  // dimensions
  const dim = el('g', {}, A);
  const dx = shaftX + 70;
  el('path', { d: `M${dx} ${cavBot - 20}V${shaftTop}M${dx - 10} ${cavBot - 20}h20M${dx - 10} ${shaftTop}h20`, class: 'f-ink', 'stroke-width': 1.5 }, dim);
  txt(dim, dx + 18, (cavBot + shaftTop) / 2, '65 m shaft', 'f-anno');
  el('path', { d: `M${dx + 140} ${shaftTop}V${towerTop}M${dx + 130} ${towerTop}h20`, class: 'f-ink', 'stroke-width': 1.5 }, dim);
  txt(dim, dx + 158, (shaftTop + towerTop) / 2 + 8, '33 m tower', 'f-anno');
  const cavL = leader(A, 600, cavTop + 6, 520, cavTop - 120, ['HKU station', 'a cavern in rock'], { anchor: 'end' });
  const sA = yearStamp(A, '2014', 'West Island Line');

  // --- B: the South Island Line long section ---
  const B = el('g', {}, g);
  const ground = [[0, 330], [180, 330], [320, 210], [520, 230], [640, 440], [1000, 470], [1040, 600], [1200, 600], [1240, 420], [1400, 380], [1600, 470]];
  const bd = 'M' + ground.map(([x, y]) => `${x} ${y}`).join('L');
  el('path', { d: `${bd}L1600 900L0 900Z`, fill: fillUrl('f', 'weathered') }, B);
  el('path', { d: 'M1040 600H1200V900H1040Z', fill: fillUrl('f', 'water') }, B);
  el('path', { d: bd, class: 'f-ink', 'stroke-width': 2.5, fill: 'none' }, B);
  const silPath = 'M100 560H560L660 380H1360L1400 400L1430 640H1560';
  // tunnel → portal → viaduct → bridge → back into the hill
  const silD = 'M100 560H560L660 380H1250L1300 600H1560';
  const sil = el('path', { d: silD, class: 'f-track', pathLength: 1 }, B);
  paint(sil, { stroke: LC.SIL });
  const cols = el('g', {}, B);
  for (let x = 700; x <= 1030; x += 46) el('path', { d: `M${x} 388V${x < 1000 ? 455 : 470}`, class: 'f-col' }, cols);
  el('path', { d: 'M1040 388V600M1200 388V600', class: 'f-ink', 'stroke-width': 6 }, cols);
  el('path', { d: 'M660 388H1250', class: 'f-ink', 'stroke-width': 4 }, cols);
  // label anchors keep neighbours apart even at the larger phone size
  const names = [['Admiralty', 120, 560, 'under', 'middle'], ['Ocean Park', 760, 380, 'over', 'end', 30], ['Wong Chuk Hang', 940, 380, 'over', 'start', -30],
    ['Lei Tung', 1330, 600, 'over', 'middle'], ['South Horizons', 1510, 600, 'under', 'end', 80]];
  const stns = names.map(([n, x, y, kind, anchor, dx = 0]) => {
    const sg = el('g', {}, B);
    el('rect', { x: x - 44, y: y - 40, width: 88, height: 40, class: 'f-stn-box' }, sg);
    txt(sg, x + dx, kind === 'over' ? y - 60 : y + 46, n, 'f-name', { 'text-anchor': anchor });
    return sg;
  });
  txt(B, 1120, 680, 'Aberdeen Channel', 'f-label', { 'text-anchor': 'middle' });
  const tS = train(B, { len: 120, h: 30, color: LC.SIL, cars: 3 });
  const sB = yearStamp(B, '2016', 'South Island Line');
  const lB = leader(B, 1120, 388, 1180, 250, ['Bridge'], { anchor: 'start' });
  const lLT = leader(B, 1330, 620, 1250, 780, ['Lei Tung: a cavern', 'about 38 m down'], { anchor: 'end' });

  const pts = [[100, 560], [560, 560], [660, 380], [1250, 380], [1300, 600], [1560, 600]];
  const segs = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  const tot = segs.reduce((a, b) => a + b, 0);
  const at = (d) => {
    let i = 0;
    while (i < segs.length - 1 && d > segs[i]) { d -= segs[i]; i++; }
    const f = clamp(d / segs[i]);
    const a = pts[i], b = pts[i + 1];
    return [lerp(a[0], b[0], f), lerp(a[1], b[1], f), Math.atan2(b[1] - a[1], b[0] - a[0])];
  };

  return (t) => {
    const a = 1 - seg(t, 15, 16);
    show(A, a);
    drawIn(gl, seg(t, 0, 2));
    const lift = ease.inOut(seg(t, 9, 14));
    car.setAttribute('y', lerp(cavBot - 60, towerTop + 6, lift).toFixed(1));
    show(car, seg(t, 8.5, 9));
    animLeader(cavL, seg(t, 2, 4));
    show(dim, seg(t, 8, 9));
    show(sA, seg(t, 0, 1));

    const b = seg(t, 16, 17);
    show(B, b);
    drawIn(sil, ease.inOut(seg(t, 16.5, 22)));
    show(cols, seg(t, 19, 20.5));
    stns.forEach((s, i) => show(s, seg(t, 17 + i * 1.1, 17.8 + i * 1.1)));
    animLeader(lB, seg(t, 21, 22.5));
    animLeader(lLT, seg(t, 24, 25.5));
    const pr = seg(t, 22, 29.5);
    const [x, y, ang] = at(pr * tot);
    tS.setAttribute('transform', `translate(${(x - 60 * Math.cos(ang)).toFixed(1)} ${(y - 60 * Math.sin(ang)).toFixed(1)}) rotate(${(ang * 180 / Math.PI).toFixed(2)})`);
    show(tS, pr > 0 && pr < 1 ? 1 : 0);
    show(sB, b);
  };
}

/* =========================================================
   8 · 2022 — the fourth crossing
   ========================================================= */
function fourth(g, { W }) {
  const A = el('g', {}, g);
  const H = harbourPlan(A);
  const stamp = yearStamp(g, '2022', '15 May');

  // Hung Hom: East Rail moves below the Tuen Ma Line
  const B = el('g', {}, g);
  strata(B, 0, 0, W, [{ to: 20, kind: 'fill' }, { to: 90, kind: 'clay' }], 10);
  const top = levelBand(B, { y: 420, label: 'G', left: { color: LC.TML, name: 'Tuen Ma Line · to Tuen Mun' }, right: { color: LC.TML, name: 'Tuen Ma Line · to Wu Kai Sha' } });
  const low = levelBand(B, { y: 740, label: 'L1', left: { color: LC.EAL, name: 'East Rail Line · to Admiralty' }, right: { color: LC.EAL, name: 'East Rail Line · to Lo Wu / Lok Ma Chau' } });
  const tB = txt(B, 80, 120, 'Hung Hom', 'f-title');

  // Admiralty: the full stack, schematic
  const C = el('g', {}, g);
  strata(C, 0, 0, W, [{ to: 90, kind: 'rock' }], 10);
  const rows = [
    ['L1', 'Concourse', []],
    ['L2', 'Tsuen Wan + Island', [LC.TWL, LC.ISL]],
    ['L3', 'Tsuen Wan + Island', [LC.TWL, LC.ISL]],
    ['L4', 'Transfer level', []],
    ['L5', 'East Rail', [LC.EAL, LC.EAL]],
    ['L6', 'South Island', [LC.SIL, LC.SIL]],
  ];
  const rowG = rows.map(([lv, name, cols], i) => {
    const y = 150 + i * 110;
    const rg = el('g', {}, C);
    el('rect', { x: 480, y, width: 640, height: 92, class: 'f-void' }, rg);
    el('rect', { x: 480, y: y + 92, width: 640, height: 10, class: 'f-slab' }, rg);
    txt(rg, 440, y + 60, lv, 'f-level', { 'text-anchor': 'end' });
    txt(rg, 1160, y + 58, name, 'f-name');
    cols.forEach((c, j) => {
      const te = trainEnd(rg, { w: 64, h: 74, color: c });
      te.setAttribute('transform', `translate(${640 + j * 320} ${y + 92})`);
    });
    if (cols.length) el('rect', { x: 740, y: y + 70, width: 120, height: 22, class: 'f-concrete' }, rg);
    return rg;
  });
  const tC = txt(C, 80, 120, 'Admiralty', 'f-title');
  const dim = leader(C, 1120, 150 + 5 * 110 + 92, 1160, 836, ['−33.6 mPD', 'MTR’s lowest station level'], { anchor: 'start' });

  return (t) => {
    const a = 1 - seg(t, 9, 10);
    show(A, a);
    showCrossings(H, 4, (i) => (i < 3 ? 1 : seg(t, 2.5, 5)));
    show(stamp, seg(t, 0, 1) * a);
    const b = seg(t, 10, 11) * (1 - seg(t, 18.5, 19.5));
    show(B, b);
    show(top.g, 1);
    show(low.g, seg(t, 12.5, 14));
    show(tB, 1);
    const c = seg(t, 19.5, 20.5);
    show(C, c);
    rowG.forEach((r, i) => {
      // build order: 1980/85 levels, then the 2016 levels, the East Rail level last
      const when = [20, 20.4, 20.4, 22.2, 25, 22.8][i];
      show(r, seg(t, when, when + 0.8));
    });
    show(tC, c);
    animLeader(dim, seg(t, 23.4, 24.6));
  };
}

/* =========================================================
   9 · Today — read the layers
   ========================================================= */
function layers(g, { W }) {
  const x0 = 300, x1 = 1520;
  const yr0 = 1975, yr1 = 2025;
  const X = (y) => x0 + ((y - yr0) / (yr1 - yr0)) * (x1 - x0);
  const bands = [
    ['Bridge deck', 'bridge'], ['Viaduct', 'viaduct'], ['Ground level', 'ground'],
    ['Under the street', 'shallow'], ['Under the harbour', 'harbour'], ['Deep in rock', 'deep'],
  ];
  const bandH = 94, yTop = 190;
  const Y = (key) => yTop + bands.findIndex((b) => b[1] === key) * bandH + bandH / 2;
  const frame = el('g', {}, g);
  const SHORT = { bridge: 'Bridge', viaduct: 'Viaduct', ground: 'Ground', shallow: 'Street', harbour: 'Harbour', deep: 'Rock' };
  bands.forEach(([name, key], i) => {
    const y = yTop + i * bandH;
    el('rect', { x: x0, y, width: x1 - x0, height: bandH, class: i % 2 ? 'f-band-a' : 'f-band-b' }, frame);
    txt(frame, x0 - 24, y + bandH / 2 + 8, name, 'f-band-label lg', { 'text-anchor': 'end' });
    txt(frame, x0 - 24, y + bandH / 2 + 12, SHORT[key], 'f-band-label sm', { 'text-anchor': 'end' });
  });
  el('path', { d: `M${x0} ${yTop + 3 * bandH}H${x1}`, class: 'f-ink', 'stroke-width': 3 }, frame);
  txt(frame, x1, yTop + 3 * bandH - 10, 'Street level', 'f-label', { 'text-anchor': 'end' });
  [1980, 1990, 2000, 2010, 2020].forEach((y) => {
    el('path', { d: `M${X(y)} ${yTop + 6 * bandH}v14`, class: 'f-ink', 'stroke-width': 1.5 }, frame);
    txt(frame, X(y), yTop + 6 * bandH + 44, String(y), 'f-tick', { 'text-anchor': 'middle' });
  });

  const items = [
    [1979, 'viaduct', LC.KTL, 'Kwun Tong', 'Kwun Tong', 0],
    [1979, 'shallow', LC.TWL, 'Nathan Road', 'Nathan Rd', 0],
    [1980, 'harbour', LC.TWL, '1st crossing', '1st', 0],
    [1985, 'deep', LC.ISL, 'Tai Koo cavern', 'Tai Koo', 0],
    [1989, 'harbour', LC.TKL, '2nd', '2nd', 0],
    [1998, 'bridge', LC.TCL, 'Tsing Ma', 'Tsing Ma', 0],
    [1998, 'harbour', LC.AEL, '3rd', '3rd', 0],
    [1998, 'shallow', LC.AEL, 'Hong Kong station', 'Hong Kong', 0],
    [2003, 'viaduct', LC.TML, 'West Rail', 'West Rail', 0],
    [2005, 'ground', LC.DRL, 'Sunny Bay', 'Sunny Bay', 0],
    [2014, 'deep', LC.ISL, 'HKU, about 70 m', 'HKU', -40],
    [2016, 'viaduct', LC.SIL, 'Wong Chuk Hang', 'W. Chuk Hang', 0],
    [2016, 'deep', LC.SIL, 'Admiralty L6', 'Admiralty', 0],
    [2016, 'deep', LC.KTL, 'Ho Man Tin', 'Ho Man Tin', 40],
    [2022, 'shallow', LC.EAL, 'Exhibition Centre', 'Exhibition', 0],
    [2022, 'harbour', LC.EAL, '4th', '4th', 0],
  ];
  const marks = items.map(([yr, key, col, label, short, dy]) => {
    const x = X(yr);
    const y = Y(key) + dy;
    const m = el('g', {}, g);
    const dot = el('circle', { cx: x, cy: y, r: 11, class: 'f-mark' }, m);
    paint(dot, { fill: col });
    const right = yr < 2019;
    const at = { 'text-anchor': right ? 'start' : 'end' };
    const tx = right ? x + 18 : x - 18;
    txt(m, tx, y + 7, label, 'f-mark-label lg', at);
    txt(m, tx, y + 7, short, 'f-mark-label sm', at);
    return { m, yr };
  });
  // the oldest railway sits off the left edge
  const er = el('g', {}, g);
  el('path', { d: `M${x0 + 40} ${Y('ground')}H${x0 + 8}`, class: 'f-ink', 'stroke-width': 2, 'marker-end': 'url(#f-arrowhead)' }, er);
  const erDot = el('circle', { cx: x0 + 58, cy: Y('ground'), r: 11, class: 'f-mark' }, er);
  paint(erDot, { fill: LC.EAL });
  txt(er, x0 + 76, Y('ground') + 7, 'East Rail, 1910', 'f-mark-label lg');
  txt(er, x0 + 76, Y('ground') + 12, '1910', 'f-mark-label sm');

  const sweep = el('path', { d: `M0 ${yTop - 20}V${yTop + 6 * bandH + 10}`, class: 'f-sweep' }, g);
  const title = txt(g, 80, 120, 'Read the layers', 'f-title');
  const end = el('g', {}, g);
  txt(end, 800, 866, 'Explore the network below', 'f-end', { 'text-anchor': 'middle' });

  return (t) => {
    show(title, seg(t, 0, 1));
    show(frame, seg(t, 0.3, 1.5));
    show(er, seg(t, 1.5, 2.5));
    const yrNow = lerp(yr0, yr1, ease.inOut(seg(t, 2, 14)));
    sweep.setAttribute('transform', `translate(${X(yrNow).toFixed(1)} 0)`);
    show(sweep, seg(t, 2, 2.5) * (1 - seg(t, 14, 15)));
    marks.forEach((mk) => show(mk.m, yrNow >= mk.yr ? 1 : 0));
    show(end, seg(t, 17, 18.5));
  };
}

export const LATE = [
  {
    id: 'adm85', when: '1985', title: 'Two lines, one station', dur: 24,
    setup: admiralty85,
    caps: [
      [0, 'The Island Line opened on 31 May 1985, running east along the north shore of Hong Kong Island. A year later it reached Sheung Wan.'],
      [8, 'It was designed to meet the Tsuen Wan Line at Admiralty. The two lines share two platform levels there, with one platform of each line on each level.'],
      [14, 'Travelling on in the same direction? You change trains by walking across the platform.'],
      [20, 'That only works when lines are planned together. Lines added later have to fit in wherever there is room.'],
    ],
  },
  {
    id: 'bridge', when: '1989–98', title: 'Crossings and a bridge', dur: 30,
    setup: bridge,
    caps: [
      [0, 'In August 1989 a second rail crossing opened, in the Eastern Harbour Crossing: one immersed tube that carries a road and a railway side by side.'],
      [8, 'In 1998 the Airport Railway added a third crossing, between new stations on reclaimed land in Central and West Kowloon.'],
      [13.5, 'On its way to the new airport the railway crosses the Tsing Ma Bridge, which has a main span of 1,377 metres.'],
      [20.5, 'The trains run inside the bridge, on an enclosed lower deck beneath a six-lane road. Two sheltered road lanes run beside the tracks for emergencies.'],
    ],
  },
  {
    id: 'deep', when: '2014–16', title: 'Deeper, and higher', dur: 30,
    setup: deepHigh,
    caps: [
      [0, 'In 2014 the Island Line was extended west to Kennedy Town. Under the steep hillside of Sai Ying Pun and the University of Hong Kong, the new stations are caverns dug in rock.'],
      [8, 'HKU station is about 70 metres underground. One entrance is a 65-metre lift shaft, topped by a 33-metre lift tower that reaches the campus.'],
      [16, 'In 2016 the South Island Line went the other way. It leaves Admiralty in a tunnel, then runs on a viaduct past Ocean Park and Wong Chuk Hang.'],
      [23, 'It crosses the Aberdeen Channel on a bridge, then goes back into the hill on Ap Lei Chau. Lei Tung station is a cavern about 38 metres below the surface.'],
    ],
  },
  {
    id: 'fourth', when: '2022', title: 'The fourth crossing', dur: 30,
    setup: fourth,
    caps: [
      [0, 'On 15 May 2022 the East Rail Line, whose first section opened in 1910, was extended under the harbour to Exhibition Centre and Admiralty.'],
      [5, 'It is the fourth railway under Victoria Harbour: 11 tube sections, cast in a dry dock made from a former quarry at Shek O, then sunk into a trench in the seabed.'],
      [10.5, 'To make the connection, the East Rail platforms at Hung Hom moved down a level, below the Tuen Ma Line.'],
      [19.5, 'At Admiralty the line arrives on Level 5. The South Island Line is on Level 6 below it. Both were dug beneath the station of 1980 while trains kept running above.'],
    ],
  },
  {
    id: 'layers', when: 'Today', title: 'Read the layers', dur: 22,
    setup: layers,
    caps: [
      [0, 'Today the heavy-rail network has 99 stations, counting the high-speed station at West Kowloon. On an average weekday in 2025 the domestic lines carried about 4.7 million trips.'],
      [9, 'From bridge decks above the sea to caverns deep in rock, the level of each line tells you what was in its way when it was built.'],
      [17, 'Explore the network, station by station, below.'],
    ],
  },
];
