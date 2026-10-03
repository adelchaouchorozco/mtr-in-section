// Sheet 02: the network plan, by year and by level.
import { el, frameLoop, prefersReducedMotion } from './draw.js';
import { STATIONS } from './stations-data.js';
import { POS, PATHS, HARBOUR_SCHEMATIC, PLACES } from './layout.js';
import { LINES, LINE_ORDER, STRUCTURE } from './data.js';

const yearOf = (d) => Number(String(d).slice(0, 4));
STATIONS.forEach((s) => { const p = POS[s.id]; if (!p) throw new Error(`No map position for ${s.id}`); [s.x, s.y, s.lab] = p; });
const byId = Object.fromEntries(STATIONS.map((s) => [s.id, s]));
const fmtDate = (d) => {
  const [y, m, day] = d.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(y, m - 1, day)));
};
const NOW = 2026;

// Segment opening years that the station dates alone get wrong.
const SEG_YEAR = {
  'TML:east-tsim-sha-tsui|hung-hom': 2004, // opened as the KCR's Tsim Sha Tsui extension
  'TKL:north-point|quarry-bay': 2002,      // the Kwun Tong Line ran it from 2001 (drawn below)
  // infill stations opened on track that was already running
  'TCL:nam-cheong|olympic': 1998, 'TCL:lai-king|nam-cheong': 1998,
  'TCL:sunny-bay|tsing-yi': 1998, 'TCL:sunny-bay|tung-chung': 1998,
  'ISL:heng-fa-chuen|shau-kei-wan': 1985, 'ISL:chai-wan|heng-fa-chuen': 1985,
  'ISL:hku|sai-ying-pun': 2014, 'ISL:sai-ying-pun|sheung-wan': 2014,
};
// East Rail north of Hung Hom dates from 1910, before the slider's range
const EAL_OLD = new Set(['mong-kok-east', 'kowloon-tong', 'tai-wai', 'sha-tin', 'fo-tan', 'university', 'tai-po-market', 'tai-wo', 'fanling', 'sheung-shui', 'lo-wu']);
// Track that has since been re-routed. Shown in today's colour of the line that used it.
const HISTORIC = [
  { line: 'KTL', a: 'mong-kok', b: 'shek-kip-mei', from: 1979, to: 1982, note: 'Before Prince Edward opened in 1982' },
  { line: 'KTL', a: 'lam-tin', b: 'quarry-bay', from: 1989, to: 2002, note: 'Kwun Tong Line through the Eastern Harbour Crossing' },
  { line: 'KTL', a: 'quarry-bay', b: 'north-point', from: 2001, to: 2002 },
];

function kindsAt(s, year) {
  const open = s.lines.filter((l) => yearOf(s.opened[l]) <= year);
  if (s.structure !== 'mixed') return [s.structure];
  const set = new Set();
  open.forEach((l) => {
    let k = s.byLine?.[l] ?? 'underground';
    if (s.id === 'hung-hom' && year < 2022) k = 'at-grade';
    if (k === 'mixed') { set.add('elevated'); set.add('underground'); } else set.add(k);
  });
  return [...set];
}

function buildSegments() {
  const segs = [];
  PATHS.forEach((path) => {
    let prev = null;
    let way = [];
    path.pts.forEach((pt) => {
      if (Array.isArray(pt)) { way.push(pt); return; }
      const st = byId[pt];
      if (prev) segs.push({ line: path.line, a: prev, b: st, way, dashed: !!path.dash });
      prev = st;
      way = [];
    });
  });
  segs.forEach((g) => {
    const key = `${g.line}:${[g.a.id, g.b.id].sort().join('|')}`;
    g.from = SEG_YEAR[key] ?? Math.max(yearOf(g.a.opened[g.line] ?? '0'), yearOf(g.b.opened[g.line] ?? '0'));
    if (g.line === 'EAL' && EAL_OLD.has(g.a.id) && EAL_OLD.has(g.b.id)) g.from = 1910;
    if (g.line === 'EAL' && [g.a.id, g.b.id].sort().join('|') === 'hung-hom|mong-kok-east') g.from = 1975;
    g.to = Infinity;
  });
  // the Airport Express runs alongside the Tung Chung Line without stopping
  segs.filter((g) => g.line === 'AEL').forEach((g) => {
    g.from = Math.max(1998, yearOf(g.a.opened.AEL ?? '1998'), yearOf(g.b.opened.AEL ?? '1998'));
  });
  HISTORIC.forEach((h) => segs.push({ line: h.line, a: byId[h.a], b: byId[h.b], way: [], from: h.from, to: h.to, historic: true }));
  const shared = {};
  segs.forEach((g) => { if (!g.way.length) { const k = [g.a.id, g.b.id].sort().join('|'); (shared[k] ||= []).push(g); } });
  Object.values(shared).forEach((list) => {
    const lines = [...new Set(list.map((g) => g.line))];
    list.forEach((g) => { g.off = (lines.indexOf(g.line) - (lines.length - 1) / 2) * 6; });
  });
  return segs;
}

const LABEL = {
  r: [11, 4, 'start'], l: [-11, 4, 'end'], t: [0, -11, 'middle'], b: [0, 20, 'middle'],
  tr: [8, -8, 'start'], tl: [-8, -8, 'end'], br: [8, 17, 'start'], bl: [-8, 17, 'end'],
};

function shapePath(shape, r) {
  if (shape === 'up') return `M0 ${-r * 1.15}L${r * 1.05} ${r * 0.75}H${-r * 1.05}Z`;
  if (shape === 'down') return `M0 ${r * 1.15}L${r * 1.05} ${-r * 0.75}H${-r * 1.05}Z`;
  return `M${-r * 0.85} ${-r * 0.85}h${r * 1.7}v${r * 1.7}h${-r * 1.7}Z`;
}

export function initNetwork(root) {
  const svg = root.querySelector('.net-map svg');
  const yearIn = root.querySelector('#year');
  const yearOut = root.querySelector('#year-out');
  const legend = root.querySelector('.net-legend');
  const card = root.querySelector('.station-card');
  const select = root.querySelector('#station-select');
  const playBtn = root.querySelector('[data-net-play]');
  const stats = Object.fromEntries([...root.querySelectorAll('[data-stat]')].map((n) => [n.dataset.stat, n]));

  const segs = buildSegments();

  // ---- water & places ----
  const water = el('g', {}, svg);
  const hd = HARBOUR_SCHEMATIC.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join('') + 'Z';
  el('path', { d: hd, class: 'm-water' }, water);
  el('path', { d: hd, class: 'm-coast' }, water);
  PLACES.forEach(([x, y, t, anchor]) => el('text', { x, y, class: 'm-place', 'text-anchor': anchor, text: t }, water));

  // ---- lines ----
  const gCase = el('g', {}, svg);
  const gLine = el('g', {}, svg);
  segs.forEach((g) => {
    const dx = g.b.x - g.a.x, dy = g.b.y - g.a.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = (-dy / len) * (g.off || 0), ny = (dx / len) * (g.off || 0);
    const pts = [[g.a.x + nx, g.a.y + ny], ...g.way, [g.b.x + nx, g.b.y + ny]];
    const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
    g.case = el('path', { d, class: 'm-case', 'stroke-width': 6.6 }, gCase);
    g.path = el('path', { d, class: 'm-line', 'stroke-width': 4.2 }, gLine);
    g.path.style.stroke = LINES[g.line].color;
    if (g.dashed) { g.path.setAttribute('stroke-dasharray', '2 5'); g.case.setAttribute('stroke-dasharray', '2 5'); }
    if (g.historic) { g.path.setAttribute('stroke-dasharray', '7 5'); g.case.style.opacity = '0'; }
  });

  // ---- stations ----
  const gSt = el('g', {}, svg);
  const nodes = {};
  STATIONS.forEach((s) => {
    const x = s.lines.length > 1;
    const g = el('g', { class: `m-stn${x ? ' is-x' : ''}`, transform: `translate(${s.x} ${s.y})`, 'data-id': s.id }, gSt);
    el('circle', { r: 12, class: 'hit' }, g);
    el('circle', { r: x ? 11 : 9, class: 'ring' }, g);
    const dot = el('circle', { r: x ? 6.2 : 4.2, class: 'dot' }, g);
    const lvl = el('g', { class: 'lvl' }, g);
    const [code, ddx = 0, ddy = 0] = String(s.lab || 'r').split(':').map((v, i) => (i ? Number(v) : v));
    const [lx, ly, la] = LABEL[code];
    const grow = x ? 3 : 0;
    const gx = lx === 0 ? 0 : Math.sign(lx) * grow, gy = ly < 0 ? -grow : ly > 8 ? grow : 0;
    el('text', { x: lx + gx + ddx, y: ly + gy + ddy, 'text-anchor': la, text: s.name }, g);
    g.addEventListener('click', () => selectStation(s.id, true));
    nodes[s.id] = { g, dot, lvl, s };
  });

  // ---- legend ----
  let mode = 'line';
  function drawLegend() {
    legend.textContent = '';
    if (mode === 'line') {
      LINE_ORDER.forEach((l) => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="sw" style="--c:${LINES[l].color}"></span>${LINES[l].name}`;
        legend.appendChild(li);
      });
      const li = document.createElement('li');
      li.innerHTML = '<span class="sw" style="--c:transparent;border-style:dashed"></span>Dashed: earlier routes, and Racecourse (race days)';
      legend.appendChild(li);
    } else {
      ['elevated', 'at-grade', 'underground'].forEach((k) => {
        const li = document.createElement('li');
        li.innerHTML = `<svg width="16" height="16" viewBox="-8 -8 16 16" aria-hidden="true"><path d="${shapePath(STRUCTURE[k].shape, 5.6)}" style="fill:${STRUCTURE[k].color}" class="lv-shape"/></svg>${STRUCTURE[k].long}`;
        legend.appendChild(li);
      });
      const li = document.createElement('li');
      li.innerHTML = '<svg width="16" height="16" viewBox="-8 -8 16 16" aria-hidden="true"><path d="M0 -6A6 6 0 0 0 0 6Z" style="fill:var(--lv-up)" class="lv-shape"/><path d="M0 -6A6 6 0 0 1 0 6Z" style="fill:var(--lv-down)" class="lv-shape"/></svg>Different lines at different levels';
      legend.appendChild(li);
    }
  }

  // ---- render for a year ----
  let year = NOW;
  let selected = null;
  function render() {
    yearOut.textContent = String(year);
    segs.forEach((g) => {
      const on = year >= g.from && year < g.to;
      g.path.style.display = on ? '' : 'none';
      g.case.style.display = on ? '' : 'none';
    });
    let n = 0, under = 0, elev = 0, grade = 0, mixed = 0;
    STATIONS.forEach((s) => {
      const open = s.lines.some((l) => yearOf(s.opened[l]) <= year);
      const node = nodes[s.id];
      node.g.classList.toggle('is-off', !open);
      if (!open) return;
      n++;
      const kinds = kindsAt(s, year);
      if (kinds.length > 1) mixed++;
      else if (kinds[0] === 'underground') under++;
      else if (kinds[0] === 'elevated') elev++;
      else grade++;
      // level glyph
      node.lvl.textContent = '';
      if (mode === 'level') {
        const r = s.lines.length > 1 ? 7 : 5.4;
        if (kinds.length > 1) {
          el('path', { d: `M0 ${-r}A${r} ${r} 0 0 0 0 ${r}Z`, class: 'lv-shape', style: `fill:${STRUCTURE[kinds.includes('elevated') ? 'elevated' : 'at-grade'].color}` }, node.lvl);
          el('path', { d: `M0 ${-r}A${r} ${r} 0 0 1 0 ${r}Z`, class: 'lv-shape', style: `fill:${STRUCTURE[kinds.includes('underground') ? 'underground' : 'at-grade'].color}` }, node.lvl);
        } else {
          el('path', { d: shapePath(STRUCTURE[kinds[0]].shape, r), class: 'lv-shape', style: `fill:${STRUCTURE[kinds[0]].color}` }, node.lvl);
        }
      }
    });
    stats.stations.textContent = String(n);
    stats.under.textContent = String(under);
    stats.elevated.textContent = String(elev);
    stats.grade.textContent = String(grade);
    stats.mixed.textContent = String(mixed);
    if (selected) { renderCard(selected); if (call.childNodes.length) drawCallout(selected); }
  }

  function setMode(m) {
    mode = m;
    svg.classList.toggle('is-level', m === 'level');
    drawLegend();
    render();
  }

  // ---- station card ----
  // Relative depth of underground platforms at stations where MTR's layout
  // drawings give the order (see stacks.js); 0 is the shallowest.
  const RANK = {
    admiralty: { TWL: 0, ISL: 0, EAL: 1, SIL: 2 },
    'ho-man-tin': { TML: 0, KTL: 1 },
    'quarry-bay': { ISL: 0, TKL: 1 },
    'yau-ma-tei': { TWL: 0, KTL: 1 },
  };
  function levelGlyph(s) {
    const open = s.lines.filter((l) => yearOf(s.opened[l]) <= year);
    const rank = RANK[s.id] || {};
    const deepest = Math.max(0, ...open.map((l) => rank[l] ?? 0));
    const W = 300, G = 52, Hh = 104 + deepest * 22;
    const svgN = el('svg', { viewBox: `0 0 ${W} ${Hh}`, class: 'level-glyph', role: 'img', 'aria-label': 'Where the platforms sit relative to street level' });
    el('rect', { x: 0, y: G, width: W, height: Hh - G, class: 'stratum-weathered' }, svgN);
    el('path', { d: `M0 ${G}H${W}`, class: 'ink-line', 'stroke-width': 1.5 }, svgN);
    el('text', { x: W - 8, y: G - 6, class: 'svg-label svg-label--muted', 'text-anchor': 'end', text: 'Street level', 'font-size': 11 }, svgN);
    const slot = (W - 120) / Math.max(open.length, 1);
    open.forEach((l, i) => {
      let k = s.structure === 'mixed' ? (s.byLine?.[l] ?? 'underground') : s.structure;
      if (s.id === 'hung-hom' && year < 2022) k = 'at-grade';
      if (k === 'mixed') k = 'elevated';
      const y = k === 'elevated' ? 22 : k === 'at-grade' ? G - 7 : 78 + (rank[l] ?? 0) * 22;
      const x = 14 + i * slot;
      if (k === 'elevated') el('path', { d: `M${x + 10} ${y + 7}V${G}M${x + slot - 26} ${y + 7}V${G}`, class: 'ink-line', 'stroke-width': 1.5 }, svgN);
      if (k === 'underground') el('rect', { x: x - 4, y: y - 12, width: slot - 12, height: 22, class: 'paper-fill ink-line', 'stroke-width': 1 }, svgN);
      const bar = el('rect', { x, y, width: slot - 20, height: 7, class: 'ink-line', 'stroke-width': 1.2 }, svgN);
      bar.style.fill = LINES[l].color;
    });
    return svgN;
  }

  function renderCard(id) {
    const s = byId[id];
    const open = s.lines.filter((l) => yearOf(s.opened[l]) <= year);
    card.textContent = '';
    const A = document.createElement('div'); A.className = 'sc-a';
    const B = document.createElement('div'); B.className = 'sc-b';
    const h = document.createElement('h3');
    h.textContent = s.name;
    A.appendChild(h);
    const chips = document.createElement('div');
    chips.className = 'lines';
    s.lines.forEach((l) => {
      const c = document.createElement('span');
      c.className = 'chip';
      c.style.setProperty('--c', LINES[l].color);
      c.innerHTML = `<i></i>${LINES[l].name}`;
      chips.appendChild(c);
    });
    A.appendChild(chips);
    if (open.length) A.appendChild(levelGlyph(s));
    const dl = document.createElement('dl');
    const kindName = (k) => (k === 'mixed' ? 'partly elevated, partly underground (on a hillside)' : STRUCTURE[k].label.toLowerCase());
    const built = s.structure === 'mixed'
      ? s.lines.map((l) => `${LINES[l].short}: ${kindName(s.byLine?.[l] ?? 'underground')}`).join('; ')
      : STRUCTURE[s.structure].label;
    const rows = [['Built', built]];
    s.lines.forEach((l) => rows.push([`${LINES[l].short} opened`, fmtDate(s.opened[l])]));
    rows.forEach(([k, v]) => {
      const dt = document.createElement('dt'); dt.textContent = k;
      const dd = document.createElement('dd'); dd.textContent = v;
      dl.append(dt, dd);
    });
    B.appendChild(dl);
    if (s.note) {
      const p = document.createElement('p'); p.className = 'note'; p.textContent = s.note; B.appendChild(p);
    }
    const src = document.createElement('p');
    src.className = 'ref card-ref';
    src.innerHTML = (s.refs ? `Sources: ${s.refs.map((r) => `<a href="#src-${r}">${r}</a>`).join(', ')}. ` : '')
      + `Dates and structure: <a href="${s.src}" rel="noopener">station article</a>, checked against MTR open data [<a href="#src-S01">S01</a>, <a href="#src-S02">S02</a>].`;
    B.appendChild(src);
    if (!open.length) {
      const p = document.createElement('p'); p.className = 'empty';
      p.textContent = `Not yet open in ${year}.`;
      B.appendChild(p);
    }
    card.append(A, B);
  }

  // ---- callout on the map for the selected station ----
  const call = el('g', { class: 'm-call', 'aria-hidden': 'true' }, svg);
  function drawCallout(id) {
    call.textContent = '';
    if (!id) return;
    const s = byId[id];
    const kinds = kindsAt(s, Math.max(year, ...s.lines.map((l) => yearOf(s.opened[l]))));
    const first = Math.min(...s.lines.map((l) => yearOf(s.opened[l])));
    const line2 = `${kinds.length > 1 ? 'Mixed levels' : STRUCTURE[kinds[0]].label} · since ${first}`;
    const w = Math.max(s.name.length * 8.2, line2.length * 6.9) + 24;
    const h = 46;
    const right = s.x < 1000;
    const up = s.y > 120;
    const x = right ? s.x + 16 : s.x - 16 - w;
    const y = up ? s.y - 16 - h : s.y + 16;
    el('rect', { x, y, width: w, height: h, rx: 2 }, call);
    const tx = right ? x : x + w;
    const ty = up ? y + h : y;
    el('path', { d: `M${s.x + (right ? 7 : -7)} ${s.y + (up ? -7 : 7)}L${tx + (right ? 8 : -8)} ${ty}L${tx + (right ? 22 : -22)} ${ty}Z` }, call);
    el('text', { x: x + 12, y: y + 19, class: 't', text: s.name }, call);
    el('text', { x: x + 12, y: y + 37, text: line2 }, call);
  }

  function selectStation(id, fromMap, callout = true) {
    if (selected) nodes[selected].g.classList.remove('is-sel');
    selected = id || null;
    if (!selected) {
      card.innerHTML = '<p class="empty">Select a station on the map, or choose one from the list.</p>';
      drawCallout(null);
      return;
    }
    nodes[selected].g.classList.add('is-sel');
    renderCard(selected);
    drawCallout(callout ? selected : null);
    if (fromMap) select.value = selected;
  }

  // ---- controls ----
  [...STATIONS].sort((a, b) => a.name.localeCompare(b.name)).forEach((s) => {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.name;
    select.appendChild(o);
  });
  select.addEventListener('change', () => selectStation(select.value, false));

  yearIn.addEventListener('input', () => { stopPlay(); year = Number(yearIn.value); render(); });
  root.querySelectorAll('input[name="colour"]').forEach((r) => r.addEventListener('change', () => setMode(r.value)));

  let playing = false;
  let acc = 0;
  const loop = frameLoop((dt) => {
    acc += dt;
    const step = 0.22;
    while (acc >= step) {
      acc -= step;
      if (year >= NOW) { stopPlay(); return; }
      year += 1;
      yearIn.value = String(year);
      render();
    }
  });
  const playLabel = playBtn.querySelector('span');
  function stopPlay() {
    if (!playing) return;
    playing = false;
    loop.stop();
    playLabel.textContent = 'Play 1979 → 2026';
    playBtn.setAttribute('aria-pressed', 'false');
  }
  playBtn.setAttribute('aria-pressed', 'false');
  playBtn.addEventListener('click', () => {
    if (playing) return stopPlay();
    if (year >= NOW) { year = 1979; yearIn.value = '1979'; render(); }
    playing = true;
    acc = 0;
    playLabel.textContent = 'Pause';
    playBtn.setAttribute('aria-pressed', 'true');
    loop.start();
  });

  svg.appendChild(call);
  // on narrow screens the map pans inside its frame: start on the city centre
  const scroller = root.querySelector('.scroller');
  requestAnimationFrame(() => {
    if (scroller.scrollWidth > scroller.clientWidth) {
      const k = scroller.scrollWidth / 1300;
      scroller.scrollLeft = byId['admiralty'].x * k - scroller.clientWidth / 2;
      scroller.scrollTop = byId['mong-kok'].y * (scroller.scrollHeight / 940) - scroller.clientHeight / 2;
    }
  });
  drawLegend();
  render();
  selectStation('admiralty', true, false);
  void prefersReducedMotion;
}
