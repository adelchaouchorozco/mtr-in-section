// Film scenes, chapters 1–4: the city, cut-and-cover, the first line, the harbour.
import {
  el, seg, ease, lerp, clamp, fillUrl, LC, paint, drawIn, show, txt, rng,
  yearStamp, strata, ruler, train, trainEnd, leader, animLeader, skyline, growSkyline,
} from './film-kit.js';

/* ---------- vehicles for street scenes ---------- */
function bus(parent) {
  const g = el('g', { class: 'f-veh' }, parent);
  el('rect', { x: 0, y: -62, width: 150, height: 56, rx: 5, class: 'f-train-body' }, g);
  for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) el('rect', { x: 10 + i * 23, y: -55 + r * 24, width: 17, height: 13, class: 'f-window' }, g);
  el('circle', { cx: 30, cy: -6, r: 8, class: 'f-wheel' }, g);
  el('circle', { cx: 118, cy: -6, r: 8, class: 'f-wheel' }, g);
  return g;
}
function car(parent) {
  const g = el('g', { class: 'f-veh' }, parent);
  el('path', { d: 'M0 -8v-16h14l12 -12h30l12 12h10v16z', class: 'f-train-body' }, g);
  el('circle', { cx: 16, cy: -6, r: 6, class: 'f-wheel' }, g);
  el('circle', { cx: 62, cy: -6, r: 6, class: 'f-wheel' }, g);
  return g;
}

/* =========================================================
   1 · 1970s — a crowded city
   ========================================================= */
function city(g, { W }) {
  const k = 10;
  const G = 640;
  const cam = el('g', {}, g);
  const hills = el('path', { d: 'M0 380 C 160 320 300 350 420 300 S 700 220 860 280 S 1150 320 1290 250 S 1500 270 1600 300', class: 'f-hill', pathLength: 1 }, cam);
  const blds = skyline(cam, 0, W, G, { seed: 11, hMin: 150, hMax: 340 });
  strata(cam, 0, G, W, [{ to: 5, kind: 'fill' }, { to: 12, kind: 'clay' }, { to: 30, kind: 'weathered' }, { to: 70, kind: 'rock' }], k);
  el('path', { d: `M0 ${G}H${W}`, class: 'f-ink', 'stroke-width': 3 }, cam);

  const R = rng(4);
  const veh = [];
  const traffic = el('g', {}, cam);
  for (let i = 0; i < 9; i++) {
    const isBus = i % 3 === 0;
    const node = isBus ? bus(traffic) : car(traffic);
    const dir = i % 2 ? 1 : -1;
    veh.push({ node, x0: R() * (W + 400), v: dir * lerp(40, 90, R()), w: isBus ? 150 : 80, flip: dir < 0 });
  }
  const people = el('g', {}, cam);
  const ppl = [];
  for (let i = 0; i < 46; i++) {
    const p = el('path', { d: 'M0 0v-14', class: 'f-person' }, people);
    ppl.push({ p, x0: R() * W, v: (R() - 0.5) * 24 });
  }

  const plan = el('g', {}, cam);
  el('rect', { x: 560, y: G + 8 * k, width: 480, height: 15 * k, class: 'f-dash' }, plan);
  txt(plan, 800, G + 16 * k + 8, 'Room for a railway?', 'f-anno', { 'text-anchor': 'middle' });
  const rul = ruler(cam, 1500, G, k, 50, 10);

  const stamp = yearStamp(g, '1971', 'Nearly 4 million people');

  return (t) => {
    drawIn(hills, seg(t, 0, 3));
    growSkyline(blds, seg(t, 0.2, 6.5), G);
    const span = W + 400;
    veh.forEach((v) => {
      let x = ((v.x0 + v.v * t) % span + span) % span - 200;
      v.node.setAttribute('transform', v.flip ? `translate(${x + v.w} ${G}) scale(-1 1)` : `translate(${x} ${G})`);
    });
    ppl.forEach((q) => {
      const x = ((q.x0 + q.v * t) % W + W) % W;
      q.p.setAttribute('transform', `translate(${x.toFixed(1)} ${G - 2})`);
    });
    show(traffic, seg(t, 2, 4));
    show(people, seg(t, 3, 5));
    const cy = -ease.inOut(seg(t, 14.5, 19.5)) * 330;
    cam.setAttribute('transform', `translate(0 ${cy.toFixed(1)})`);
    show(rul, seg(t, 17, 19));
    show(plan, seg(t, 19, 20.5));
    show(stamp, seg(t, 0.5, 2));
  };
}

/* =========================================================
   2 · 1975–79 — cut and cover
   ========================================================= */
function cutCover(g, { W }) {
  const k = 12;
  const G = 300;
  const L = 600, R = 1000;
  const wl = 618, wr = 982, wt = 14; // diaphragm walls (inner faces)
  const dWall = 28;

  // buildings with piled foundations either side
  const bl = el('g', {}, g);
  [[40, 290], [300, 560], [1040, 1300], [1310, 1560]].forEach(([a, b], i) => {
    el('rect', { x: a, y: -10, width: b - a, height: G + 10, class: 'f-bldg-body' }, bl);
    for (let y = 30; y < G - 20; y += 24) el('path', { d: `M${a + 14} ${y}H${b - 14}`, class: 'f-winline' }, bl);
  });
  strata(g, 0, G, W, [{ to: 4, kind: 'fill' }, { to: 10, kind: 'clay' }, { to: 25, kind: 'weathered' }, { to: 60, kind: 'rock' }], k);
  const piles = el('g', {}, g);
  [[40, 290], [300, 560], [1040, 1300], [1310, 1560]].forEach(([a, b]) => {
    el('rect', { x: a, y: G, width: b - a, height: 3 * k, class: 'f-concrete' }, piles);
    for (let x = a + 24; x < b - 10; x += 46) el('path', { d: `M${x} ${G + 3 * k}V${G + 21 * k}`, class: 'f-pile' }, piles);
  });
  txt(g, 1435, G + 24 * k, 'Piled foundations', 'f-label', { 'text-anchor': 'middle' });

  // the street
  const road = el('path', { d: `M0 ${G}H${W}`, class: 'f-ink', 'stroke-width': 3 }, g);

  // excavation void (drawn under the walls)
  const voidR = el('rect', { x: wl, y: G, width: wr - wl, height: 0, class: 'f-void' }, g);
  const struts = [6, 12, 18].map((d) => el('path', { d: `M${wl} ${G + d * k}H${wr}`, class: 'f-strut' }, g));

  // diaphragm walls
  const walls = [wl - wt, wr].map((x) => el('rect', { x, y: G, width: wt, height: 0, class: 'f-wall' }, g));

  // temporary deck with traffic
  const deck = el('g', {}, g);
  el('rect', { x: L - 10, y: G - 4, width: R - L + 20, height: 16, class: 'f-deck' }, deck);
  for (let x = L; x <= R; x += 28) el('path', { d: `M${x} ${G - 4}v16`, class: 'f-ink', 'stroke-width': 1 }, deck);
  const vehs = el('g', {}, g);
  [[660, 'bus'], [770, 'car'], [880, 'car']].forEach(([x, type]) => {
    if (type === 'bus') el('rect', { x, y: G - 70, width: 36, height: 64, rx: 4, class: 'f-train-body' }, vehs);
    else el('rect', { x, y: G - 34, width: 30, height: 28, rx: 4, class: 'f-train-body' }, vehs);
  });

  // the station box: ticket hall over two stacked platform levels
  const box = el('g', {}, g);
  const base = el('rect', { x: wl, y: G + 24 * k, width: wr - wl, height: 2 * k, class: 'f-concrete' }, box);
  const plat = el('g', {}, box);
  el('rect', { x: wl, y: G + 16 * k, width: wr - wl, height: 1.2 * k, class: 'f-concrete' }, plat);
  el('rect', { x: 840, y: G + 13.6 * k, width: wr - 840, height: 2.4 * k, class: 'f-concrete' }, plat);
  el('rect', { x: wl, y: G + 21.6 * k, width: 760 - wl, height: 2.4 * k, class: 'f-concrete' }, box);
  const conc = el('rect', { x: wl, y: G + 9 * k, width: wr - wl, height: 1.2 * k, class: 'f-concrete' }, box);
  const roof = el('rect', { x: wl, y: G + 2.5 * k, width: wr - wl, height: 1.5 * k, class: 'f-concrete' }, box);
  const trains = el('g', {}, box);
  const tA = trainEnd(trains, { color: LC.TWL }); tA.setAttribute('transform', `translate(${760} ${G + 16 * k})`);
  const tB = trainEnd(trains, { color: LC.TWL }); tB.setAttribute('transform', `translate(${840} ${G + 24 * k})`);
  const labels = el('g', {}, box);
  txt(labels, 800, G + 7 * k, 'Ticket hall', 'f-anno', { 'text-anchor': 'middle' });
  txt(labels, 690, G + 12 * k, 'Platform', 'f-anno', { 'text-anchor': 'middle' });
  txt(labels, 910, G + 20 * k, 'Platform', 'f-anno', { 'text-anchor': 'middle' });
  const backfill = el('rect', { x: wl, y: G, width: wr - wl, height: 2.5 * k, fill: fillUrl('f', 'fill') }, g);
  const roadNew = el('path', { d: `M${L} ${G}H${R}`, class: 'f-ink', 'stroke-width': 3 }, g);

  const rul = ruler(g, 1580, G, k, 40, 10, { side: 'left' });
  const stamp = yearStamp(g, '1975', 'Construction begins');
  // keep the stamp clear of the buildings: a dark plate behind it
  stamp.setAttribute('transform', 'translate(0 440)');

  const steps = el('g', {}, g);
  el('rect', { x: 0, y: 846, width: W, height: 54, class: 'f-void', opacity: 0.94 }, steps);
  el('path', { d: `M0 846H${W}`, class: 'f-rule' }, steps);
  const stepLabels = ['1  Walls', '2  Deck', '3  Dig', '4  Build', '5  Bury'].map((s) =>
    txt(steps, 0, 880, s, 'f-step', { 'text-anchor': 'start' }));
  // equal gaps between measured labels, group centred; re-run when the label size changes
  let laidOut = 0;
  const layoutSteps = () => {
    const lens = stepLabels.map((n) => n.getComputedTextLength());
    if (!lens[0] || lens[0] === laidOut) return;
    laidOut = lens[0];
    const gap = lens.reduce((a, b) => a + b, 0) / lens.length * 0.6;
    let x = (W - (lens.reduce((a, b) => a + b, 0) + gap * (lens.length - 1))) / 2;
    stepLabels.forEach((n, i) => { n.setAttribute('x', x.toFixed(1)); x += lens[i] + gap; });
  };

  return (t, p) => {
    const pWall = ease.inOut(seg(p, 0.16, 0.32));
    walls.forEach((w) => w.setAttribute('height', (dWall * k * pWall).toFixed(1)));
    const pDeck = seg(p, 0.33, 0.40);
    const pDig = ease.inOut(seg(p, 0.41, 0.6));
    const pBuild = seg(p, 0.62, 0.8);
    const pBury = seg(p, 0.8, 0.88);

    show(deck, pDeck * (1 - pBury));
    show(vehs, 1);
    voidR.setAttribute('height', (26 * k * pDig).toFixed(1));
    show(voidR, 1);
    struts.forEach((s, i) => show(s, (pDig * 26 > [6, 12, 18][i] ? 1 : 0) * (1 - seg(pBuild, 0.2 + i * 0.2, 0.4 + i * 0.2))));

    show(base, seg(pBuild, 0, 0.2));
    show(plat, seg(pBuild, 0.2, 0.4));
    show(conc, seg(pBuild, 0.4, 0.6));
    show(roof, seg(pBuild, 0.6, 0.8));
    show(labels, seg(pBuild, 0.8, 1));
    show(backfill, pBury);
    show(roadNew, pBury);
    show(trains, seg(p, 0.9, 0.96));
    const slide = (1 - ease.out(seg(p, 0.9, 0.98))) * 40;
    tA.setAttribute('transform', `translate(${760 - slide} ${G + 16 * k})`);
    tB.setAttribute('transform', `translate(${840 + slide} ${G + 24 * k})`);

    // excavated void shows "air" only between deck and box
    voidR.style.opacity = pBury >= 1 ? '0' : '1';
    if (pBury > 0) {
      // once buried, the void above the roof is filled; the box interior stays open
      voidR.setAttribute('y', (G + 2.5 * k * pBury).toFixed(1));
      voidR.setAttribute('height', (26 * k - 2.5 * k * pBury).toFixed(1));
      voidR.style.opacity = '1';
    } else {
      voidR.setAttribute('y', G);
    }

    const active = p < 0.16 ? -1 : p < 0.33 ? 0 : p < 0.41 ? 1 : p < 0.62 ? 2 : p < 0.8 ? 3 : 4;
    stepLabels.forEach((n, i) => n.classList.toggle('is-on', i === active));
    layoutSteps();
    show(steps, seg(p, 0.1, 0.16));
    show(rul, seg(p, 0.02, 0.1));
    show(stamp, seg(p, 0.0, 0.06));
  };
}

/* =========================================================
   3 · 1979 — underground and overhead (long section)
   ========================================================= */
function firstLine(g) {
  const names = ['Shek Kip Mei', 'Kowloon Tong', 'Lok Fu', 'Wong Tai Sin', 'Diamond Hill', 'Choi Hung', 'Kowloon Bay', 'Ngau Tau Kok', 'Kwun Tong'];
  const xs = [150, 300, 440, 580, 720, 860, 1100, 1260, 1430];
  const ground = (x) => {
    // gently rising foothills in the middle, flat reclaimed land at Kowloon Bay
    if (x < 380) return 520;
    if (x < 640) return lerp(520, 470, ease.inOut((x - 380) / 260));
    if (x < 900) return lerp(470, 520, ease.inOut((x - 640) / 260));
    if (x < 1000) return lerp(520, 545, (x - 900) / 100);
    return 545;
  };
  let gd = 'M0 520';
  for (let x = 0; x <= 1600; x += 20) gd += `L${x} ${ground(x).toFixed(1)}`;
  const groundLine = el('path', { d: gd, class: 'f-ink', 'stroke-width': 2.5, pathLength: 1 }, g);
  const below = el('path', { d: gd + 'L1600 900L0 900Z', fill: fillUrl('f', 'weathered'), opacity: 0.9 }, g);
  g.insertBefore(below, groundLine);

  const yT = 620; // tunnel track level
  const yV = 400; // viaduct track level
  const portal = 960, rampEnd = 1030;
  const trackD = `M${xs[0] - 60} ${yT}H${portal}L${rampEnd} ${yV}H1520`;
  const track = el('path', { d: trackD, class: 'f-track', pathLength: 1 }, g);
  paint(track, { stroke: LC.KTL });
  const cols = el('g', {}, g);
  for (let x = rampEnd + 20; x <= 1500; x += 50) el('path', { d: `M${x} ${yV + 8}V${ground(x)}`, class: 'f-col' }, cols);
  el('path', { d: `M${rampEnd} ${yV + 8}H1520`, class: 'f-ink', 'stroke-width': 4 }, cols);

  const stns = names.map((n, i) => {
    const x = xs[i];
    const elev = i >= 6;
    const y = elev ? yV : yT;
    const sg = el('g', {}, g);
    if (elev) {
      el('rect', { x: x - 50, y: y - 46, width: 100, height: 46, class: 'f-stn-box' }, sg);
      el('path', { d: `M${x - 60} ${y - 50}h120`, class: 'f-ink', 'stroke-width': 3 }, sg);
    } else {
      el('rect', { x: x - 50, y: y - 52, width: 100, height: 60, class: 'f-stn-box' }, sg);
      el('path', { d: `M${x} ${ground(x)}V${y - 52}`, class: 'f-shaft' }, sg);
    }
    const ly = i % 2 ? 780 : 820;
    el('path', { d: `M${x} ${elev ? ground(x) + 4 : y + 12}V${ly - 26}`, class: 'f-hair' }, sg);
    txt(sg, x, ly, n, 'f-name', { 'text-anchor': 'middle' });
    return sg;
  });

  const tr = train(g, { len: 150, h: 34, color: LC.KTL, cars: 3 });
  const pts = [[xs[0] - 60, yT], [portal, yT], [rampEnd, yV], [1520, yV]];
  const lens = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  const total = lens.reduce((a, b) => a + b, 0);
  const at = (d) => {
    let i = 0;
    while (i < lens.length - 1 && d > lens[i]) { d -= lens[i]; i++; }
    const f = clamp(d / lens[i]);
    const a = pts[i], b = pts[i + 1];
    return [lerp(a[0], b[0], f), lerp(a[1], b[1], f), Math.atan2(b[1] - a[1], b[0] - a[0])];
  };

  const lTun = leader(g, 520, yT - 20, 470, 700, ['Tunnel'], { anchor: 'end' });
  const lVia = leader(g, 1180, yV - 24, 1150, 300, ['Viaduct'], { anchor: 'end' });
  const stamp = yearStamp(g, '1979', '1 October');
  const note = txt(g, 1520, 880, 'Schematic: heights not to scale', 'f-label', { 'text-anchor': 'end' });

  return (t, p) => {
    drawIn(groundLine, seg(p, 0, 0.12));
    show(below, seg(p, 0.05, 0.15));
    const pTrack = ease.inOut(seg(p, 0.12, 0.5));
    drawIn(track, pTrack);
    show(cols, seg(p, 0.42, 0.5));
    stns.forEach((s, i) => show(s, seg(pTrack, (xs[i] - 100) / 1450, (xs[i] - 40) / 1450)));
    animLeader(lTun, seg(p, 0.5, 0.6));
    animLeader(lVia, seg(p, 0.56, 0.66));
    const pRun = seg(p, 0.6, 0.98);
    const [x, y, a] = at(pRun * total);
    tr.setAttribute('transform', `translate(${(x - 75 * Math.cos(a)).toFixed(1)} ${(y - 75 * Math.sin(a)).toFixed(1)}) rotate(${(a * 180 / Math.PI).toFixed(2)})`);
    show(tr, pRun > 0 && pRun < 1 ? 1 : 0);
    show(stamp, seg(p, 0, 0.05));
    show(note, seg(p, 0.1, 0.2));
  };
}

/* =========================================================
   4 · 1980 — under the harbour (immersed tube)
   ========================================================= */
function harbour(g, { W }) {
  const sea = 360;        // water surface
  const bed = 560;        // seabed
  const x0 = 330, x1 = 1270;
  const N = 7;
  const unitW = (x1 - x0) / N;
  const tubeH = 62;
  const tubeTop = bed + 14;

  // land either side
  const land = el('g', {}, g);
  const kowloon = `M0 330H250C290 330 300 ${bed - 20} ${x0 - 10} ${bed}`;
  const island = `M${x1 + 10} ${bed}C${1300} ${bed - 20} 1310 330 1350 330H${W}`;
  el('path', { d: `${kowloon}L${x1 + 10} ${bed}`, class: 'f-ink', 'stroke-width': 2.5, fill: 'none' }, land);
  el('path', { d: island, class: 'f-ink', 'stroke-width': 2.5, fill: 'none' }, land);
  // water body
  const water = el('path', { d: `M250 ${sea}H1350C1310 ${sea} 1300 ${bed - 20} ${x1 + 10} ${bed}H${x0 - 10}C300 ${bed - 20} 290 ${sea} 250 ${sea}Z`, fill: fillUrl('f', 'water') }, g);
  g.insertBefore(water, land);
  // seabed mud and rock below
  const ground = el('path', { d: `M0 330H250C290 330 300 ${bed - 20} ${x0 - 10} ${bed}H${x1 + 10}C1300 ${bed - 20} 1310 330 1350 330H${W}V900H0Z`, fill: fillUrl('f', 'clay') }, g);
  g.insertBefore(ground, water);
  const rock = el('rect', { x: 0, y: 690, width: W, height: 210, fill: fillUrl('f', 'rock') }, g);
  g.insertBefore(rock, water);
  el('path', { d: `M0 690H${W}`, class: 'f-rule' }, g);

  // skylines on each shore
  const sk1 = skyline(land, 0, 250, 330, { seed: 3, hMin: 60, hMax: 170, wMin: 36, wMax: 62, signs: false });
  const sk2 = skyline(land, 1350, W, 330, { seed: 5, hMin: 90, hMax: 230, wMin: 36, wMax: 66, signs: false });
  growSkyline(sk1, 1, 330); growSkyline(sk2, 1, 330);
  txt(g, 40, 650, 'Kowloon', 'f-place');
  txt(g, W - 40, 650, 'Hong Kong Island', 'f-place', { 'text-anchor': 'end' });
  txt(g, 800, sea + 60, 'Victoria Harbour', 'f-place', { 'text-anchor': 'middle' });

  // dredged trench
  const trench = el('path', { d: `M${x0} ${bed}L${x0 + 30} ${bed + 86}H${x1 - 30}L${x1} ${bed}Z`, class: 'f-void' }, g);
  const trenchClip = el('clipPath', { id: 'f-trench-clip' }, g);
  const clipRect = el('rect', { x: x0, y: bed - 10, width: 0, height: 120 }, trenchClip);
  trench.setAttribute('clip-path', 'url(#f-trench-clip)');

  // dredger
  const dredger = el('g', {}, g);
  el('path', { d: 'M-70 0h140l-16 22h-108z', class: 'f-train-body' }, dredger);
  el('path', { d: 'M-20 0v-60l60 30', class: 'f-ink', 'stroke-width': 3, fill: 'none' }, dredger);
  const grabLine = el('path', { d: 'M40 -30V0', class: 'f-ink', 'stroke-width': 1.5 }, dredger);

  // tube units
  const units = [];
  for (let i = 0; i < N; i++) {
    const u = el('g', {}, g);
    el('rect', { x: 0, y: 0, width: unitW - 4, height: tubeH, class: 'f-tube' }, u);
    el('path', { d: `M8 ${tubeH / 2}H${unitW - 12}`, class: 'f-hair' }, u);
    units.push(u);
  }
  const cover = el('rect', { x: x0 + 8, y: bed, width: x1 - x0 - 16, height: tubeTop - bed, fill: fillUrl('f', 'fill') }, g);

  // approach tunnels
  const appL = el('path', { d: `M60 470C200 470 250 ${tubeTop + 30} ${x0} ${tubeTop + tubeH / 2}`, class: 'f-approach', pathLength: 1 }, g);
  const appR = el('path', { d: `M${x1} ${tubeTop + tubeH / 2}C1350 ${tubeTop + 30} 1400 470 1540 470`, class: 'f-approach', pathLength: 1 }, g);
  paint(appL, { stroke: LC.TWL }); paint(appR, { stroke: LC.TWL });
  const stnL = el('rect', { x: 30, y: 440, width: 90, height: 42, class: 'f-stn-box' }, g);
  const stnR = el('rect', { x: 1480, y: 440, width: 90, height: 42, class: 'f-stn-box' }, g);
  const nL = txt(g, 26, 426, 'Tsim Sha Tsui', 'f-name', { 'text-anchor': 'start' });
  const nR = txt(g, 1574, 426, 'Admiralty', 'f-name', { 'text-anchor': 'end' });

  const tr = train(g, { len: 200, h: 36, color: LC.TWL, cars: 4 });
  const stamp = yearStamp(g, '1980', '12 February');
  const lTube = leader(g, 800, tubeTop + 10, 860, 820, ['Immersed tube'], { anchor: 'start' });

  return (t, p) => {
    show(stamp, seg(p, 0, 0.05));
    // dredging
    const pDr = seg(p, 0.1, 0.3);
    const dx = lerp(x0 - 60, x1 + 60, pDr);
    dredger.setAttribute('transform', `translate(${dx.toFixed(1)} ${sea - 4})`);
    show(dredger, pDr > 0 && pDr < 1 ? 1 : 0);
    const grab = Math.abs(Math.sin(t * 2.2)) * (bed - sea + 50);
    grabLine.setAttribute('d', `M40 -30V${grab.toFixed(1)}`);
    clipRect.setAttribute('width', Math.max(0, dx - x0).toFixed(1));

    // units: float in, then sink
    units.forEach((u, i) => {
      const a = 0.3 + i * 0.055;
      const q = seg(p, a, a + 0.09);
      const qx = ease.inOut(seg(q, 0, 0.55));
      const qy = ease.inOut(seg(q, 0.55, 1));
      const tx = x0 + i * unitW + 2;
      const x = lerp(-unitW - 20, tx, qx);
      const y = lerp(sea - tubeH * 0.55, tubeTop, qy);
      u.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      show(u, q > 0 ? 1 : 0);
    });
    show(cover, seg(p, 0.72, 0.8));
    drawIn(appL, seg(p, 0.78, 0.86));
    drawIn(appR, seg(p, 0.8, 0.88));
    show(stnL, seg(p, 0.78, 0.82)); show(stnR, seg(p, 0.84, 0.88));
    show(nL, seg(p, 0.78, 0.82)); show(nR, seg(p, 0.84, 0.88));
    animLeader(lTube, seg(p, 0.6, 0.7));

    // the first train under the harbour
    const pr = seg(p, 0.88, 1);
    const path = [[60, 470], [x0, tubeTop + tubeH / 2 + 18], [x1, tubeTop + tubeH / 2 + 18], [1540, 470]];
    const d = pr * 3;
    const i = Math.min(2, Math.floor(d));
    const f = ease.inOut(d - i);
    const a = path[i], b = path[i + 1];
    const x = lerp(a[0], b[0], d >= 3 ? 1 : f);
    const y = lerp(a[1], b[1], d >= 3 ? 1 : f);
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 0.6;
    tr.setAttribute('transform', `translate(${(x - 100).toFixed(1)} ${(y + 10).toFixed(1)}) rotate(${(ang * 180 / Math.PI).toFixed(2)} 100 0)`);
    show(tr, pr > 0 && pr < 1 ? 1 : 0);
  };
}

export const EARLY = [
  {
    id: 'city', when: '1970s', title: 'A crowded city', dur: 24, poster: 14,
    setup: city,
    caps: [
      [0, 'In 1971 nearly four million people lived in Hong Kong, most of them on the narrow strips of flat land between steep hills and the harbour.'],
      [9, 'Buses and cars filled the streets, and buildings lined them on both sides. There was no room to widen them.'],
      [15, 'So the new railway would go underneath. The Mass Transit Railway Corporation was set up in 1975, and construction began that November.'],
    ],
  },
  {
    id: 'cut', when: '1975–79', title: 'Cut and cover', dur: 30,
    setup: cutCover,
    caps: [
      [0, 'Most stations on the first line were dug from the street down. First, walls were built deep into the ground along both sides of the site.'],
      [10, 'At some sites traffic ran over a temporary deck while the ground beneath was dug out, with steel struts holding the walls apart.'],
      [18.5, 'The station was cast in concrete inside the hole, with the ticket hall above the platforms. The excavations were 17 to 28 metres deep.'],
      [24, 'Then it was covered over and the road rebuilt. Under Nathan Road the two running tunnels were stacked one above the other, and so were the platforms.'],
    ],
  },
  {
    id: 'first', when: '1979', title: 'Under and over', dur: 22,
    setup: firstLine,
    caps: [
      [0, 'On <b>1 October 1979</b> the first trains ran, between Shek Kip Mei and Kwun Tong. About 285,000 passengers travelled on the first day.'],
      [9, 'Most of that first stretch was underground. At its eastern end it climbed onto a viaduct through Kowloon Bay, Ngau Tau Kok and Kwun Tong.'],
      [16, 'So from its first day the MTR ran on more than one level.'],
    ],
  },
  {
    id: 'harbour', when: '1980', title: 'Under the harbour', dur: 30,
    setup: harbour,
    caps: [
      [0, 'To reach Hong Kong Island, the railway had to cross Victoria Harbour.'],
      [3, 'Dredgers cut a trench in the seabed. Meanwhile 14 hollow tube sections, each about 100 metres long, were built on land.'],
      [9, 'One by one the sections were floated out, sunk into the trench and joined underwater. This is called an <b>immersed tube</b>. Its lowest point is about 24 metres below sea level.'],
      [21.5, 'Rock and fill were laid over the top, and tunnels on land linked it to the stations at each end.'],
      [26, 'On 12 February 1980 trains began running under the harbour to Chater, now Central. The first system was finished seven weeks early.'],
    ],
  },
];
