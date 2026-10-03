// Sheet 03: the network in three dimensions.
// A small canvas renderer in the site's drafting-line style: real geography,
// each line at its own level relative to sea level, depth stretched by a
// slider. No 3D library.
import { STATIONS, HARBOUR_LL } from './stations-data.js';
import { PATHS } from './layout.js';
import { LINES, LINE_ORDER } from './data.js';
import { frameLoop, prefersReducedMotion } from './draw.js';

const RAD = Math.PI / 180;
const byId = Object.fromEntries(STATIONS.map((s) => [s.id, s]));

// ---- geography → metres (east, north) around the network's centre ----
const lats = STATIONS.map((s) => s.lat), lons = STATIONS.map((s) => s.lon);
const LAT0 = (Math.min(...lats) + Math.max(...lats)) / 2;
const LON0 = (Math.min(...lons) + Math.max(...lons)) / 2;
const KX = 111320 * Math.cos(LAT0 * RAD), KY = 110570;
const geo = (lat, lon) => [(lon - LON0) * KX, (lat - LAT0) * KY];

// Bends between stations that matter in section, in metres relative to sea
// level: the four harbour tubes dip below the seabed (the 1980 tube's lowest
// point is −24.2 mPD [C01]; the others are approximate), and the airport
// railway rides the Tsing Ma and Kap Shui Mun bridge decks (approximate [C02]).
const BRIDGES = [[22.3525, 114.0860, 45], [22.3510, 114.0745, 65], [22.3495, 114.0640, 55], [22.3470, 114.0520, 47], [22.3440, 114.0440, 22]];
const WAY = {
  'TWL:tsim-sha-tsui>admiralty': [[22.2915, 114.1712, -24.2], [22.2850, 114.1690, -24.2]],
  'EAL:exhibition-centre>hung-hom': [[22.2880, 114.1780, -35], [22.2960, 114.1805, -35]],
  'TCL:hong-kong>kowloon': [[22.2900, 114.1590, -28], [22.2980, 114.1602, -28]],
  'AEL:hong-kong>kowloon': [[22.2900, 114.1590, -28], [22.2980, 114.1602, -28]],
  'TKL:quarry-bay>yau-tong': [[22.2905, 114.2220, -27], [22.2935, 114.2300, -27]],
  'TCL:tsing-yi>sunny-bay': BRIDGES,
  'AEL:tsing-yi>airport': [...BRIDGES, [22.3330, 114.0300, 5]],
  'SIL:wong-chuk-hang>lei-tung': [[22.2445, 114.1615, 20]],
};

const fmtZ = (z) => `${z > 0 ? '+' : z < 0 ? '−' : ''}${Math.abs(z)} m`;
function kindOf(s, line) {
  const k = (s.byLine && s.byLine[line]) || s.structure;
  return k === 'mixed' ? 'elevated' : k;
}
function levelText(s, line) {
  const [z, ref, kind, fig] = s.lv[line];
  const r = ref ? ` <span class="ref">[<a href="#src-${ref}">${ref}</a>]</span>` : '';
  const head = `<b>${fmtZ(z)}</b>`;
  switch (kind) {
    case 'mpd': return `${head}: platforms about ${fig} m below sea level${r}`;
    case 'street': return `${head}: about ${fig} m below the street${r}`;
    case 'dig': return `${head}: the station was dug about ${fig} m deep from the street${r}`;
    case 'tunnel': return `${head}: the tunnels meet about ${fig} m below the street${r}`;
    case 'grade': return `${head}: at street level`;
    case 'same': return `${head}: shares the Tsuen Wan Line\u2019s two levels, cross-platform${r}`;
    case 'order': return `${head} (estimated): placed in the order shown on MTR\u2019s layout drawing${r}; the level is not published.`;
    default: {
      const t = kindOf(s, line);
      if (t === 'elevated') return `${head} (estimated): elevated; height not published, drawn at a typical viaduct height.`;
      if (s.n3) return `${head} (estimated): underground; level not published, see the note below.`;
      return `${head} (estimated): underground; depth not published, drawn at a typical level.`;
    }
  }
}
const isEst = (s, line) => ['est', 'order'].includes(s.lv[line][2]);

export function initNet3D(root) {
  const stage = root.querySelector('.m3-stage');
  const canvas = stage.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const exagIn = root.querySelector('#exag');
  const exagOut = root.querySelector('#exag-out');
  const planesIn = root.querySelector('#m3-planes');
  const labelsIn = root.querySelector('#m3-labels');
  const card = root.querySelector('.m3-card');
  const pick = root.querySelector('#m3-station');
  const linesUl = root.querySelector('.m3-lines');
  const hint = root.querySelector('.m3-hint');
  const loading = root.querySelector('.m3-loading');
  const countOut = root.querySelector('.m3-count');
  const viewBtns = [...root.querySelectorAll('[data-view]')];
  const reduced = prefersReducedMotion();

  // ---- scene ----
  let exag = Number(exagIn.value);
  const markers = [];
  STATIONS.forEach((s) => {
    const [x, y] = geo(s.lat, s.lon);
    s.gx = x; s.gy = y;
    const levels = {};
    s.lines.forEach((l) => { (levels[s.lv[l][0]] ||= []).push(l); });
    s.levels = Object.entries(levels).map(([z, ls]) => ({ z: Number(z), lines: ls }));
    s.levels.forEach((lv) => markers.push({ s, z: lv.z, lines: lv.lines, est: lv.lines.every((l) => isEst(s, l)) }));
  });

  const segs = [];
  PATHS.forEach((path) => {
    const stops = path.pts.filter((p) => typeof p === 'string');
    for (let i = 0; i < stops.length - 1; i++) {
      const a = byId[stops[i]], b = byId[stops[i + 1]];
      const pts = [[a.gx, a.gy, a.lv[path.line][0]]];
      let way = WAY[`${path.line}:${a.id}>${b.id}`];
      if (!way && WAY[`${path.line}:${b.id}>${a.id}`]) way = [...WAY[`${path.line}:${b.id}>${a.id}`]].reverse();
      (way || []).forEach(([la, lo, z]) => { const [x, y] = geo(la, lo); pts.push([x, y, z]); });
      pts.push([b.gx, b.gy, b.lv[path.line][0]]);
      for (let k = 0; k < pts.length - 1; k++) segs.push({ p: pts[k], q: pts[k + 1], line: path.line, dash: !!path.dash });
    }
  });

  const xs = STATIONS.map((s) => s.gx), ys = STATIONS.map((s) => s.gy);
  const BB = { x0: Math.min(...xs) - 2500, x1: Math.max(...xs) + 2500, y0: Math.min(...ys) - 2500, y1: Math.max(...ys) + 2500 };
  const harbour = HARBOUR_LL.map(([la, lo]) => geo(la, lo));
  const harbourMid = geo(22.2925, 114.1830);
  const TUBES = [
    ['TWL:tsim-sha-tsui>admiralty', '1980 tube · −24.2 m'],
    ['TKL:quarry-bay>yau-tong', '1989 tube · about −27 m'],
    ['TCL:hong-kong>kowloon', '1998 tube · about −28 m'],
    ['EAL:exhibition-centre>hung-hom', '2022 tube · about −35 m'],
  ].map(([k, label]) => { const [la, lo, z] = WAY[k][0]; const [x, y] = geo(la, lo); return { x, y, z, label }; });
  const KEY = new Set(STATIONS.filter((s) => s.lines.length > 1).map((s) => s.id));
  ['tuen-mun', 'lo-wu', 'lok-ma-chau', 'wu-kai-sha', 'po-lam', 'lohas-park', 'tung-chung', 'asiaworld-expo', 'airport', 'chai-wan', 'kennedy-town', 'south-horizons', 'whampoa', 'hku', 'sai-ying-pun', 'disneyland-resort'].forEach((id) => KEY.add(id));

  // ---- camera ----
  const CENTRE = geo(22.33, 114.15);
  const CORE = geo(22.302, 114.178);
  const cam = { tx: CORE[0], ty: CORE[1], tz: 0, yaw: -35 * RAD, pitch: 22 * RAD, dist: 21000 };
  const PRESETS = {
    overview: () => ({ tx: CORE[0], ty: CORE[1] + 1200, tz: -2 * exag, yaw: -35 * RAD, pitch: 18 * RAD, dist: 17500 }),
    network: () => ({ tx: CENTRE[0] + 1500, ty: CENTRE[1], tz: 0, yaw: -24 * RAD, pitch: 34 * RAD, dist: 43000 }),
    admiralty: () => { const s = byId.admiralty; return { tx: s.gx, ty: s.gy, tz: -12 * exag, yaw: 112 * RAD, pitch: 6 * RAD, dist: 3000 + 28 * exag }; },
    harbour: () => { const narrow = W < 600; const a = byId.admiralty, t = byId['tsim-sha-tsui']; return { tx: narrow ? (a.gx + t.gx) / 2 + 400 : harbourMid[0] + 1200, ty: narrow ? (a.gy + t.gy) / 2 : harbourMid[1], tz: -14 * exag, yaw: (narrow ? 14 : 30) * RAD, pitch: (narrow ? -7 : -3) * RAD, dist: (narrow ? 3600 : 7500) + (narrow ? 26 : 40) * exag }; },
    bridge: () => { const [x, y] = geo(22.3480, 114.0600); return { tx: x, ty: y, tz: 28 * exag, yaw: -58 * RAD, pitch: 7 * RAD, dist: 6500 + 40 * exag }; },
    west: () => { const s = byId.hku; const narrow = W < 600; return { tx: s.gx + 700, ty: s.gy - 200, tz: (narrow ? 34 : 38) * exag, yaw: 140 * RAD, pitch: 8 * RAD, dist: (narrow ? 6800 : 3200) + 115 * exag }; },
    side: () => ({ tx: CORE[0], ty: CORE[1] - 2000, tz: -6 * exag, yaw: 0, pitch: 1 * RAD, dist: 19000 }),
    plan: () => ({ tx: (BB.x0 + BB.x1) / 2, ty: (BB.y0 + BB.y1) / 2, tz: 0, yaw: 0, pitch: 88 * RAD, dist: Math.max(52000, ((BB.y1 - BB.y0) / 2 / Math.tan(22 * RAD)) * 1.08 * Math.max(1, (H * 1.0) / Math.max(W, 1) * 1.2)) }),
  };
  const PRESET_STATION = { admiralty: 'admiralty', west: 'hku' };

  let W = 0, H = 0, DPR = 1;
  let C = [0, 0, 0], R = [1, 0, 0], U = [0, 0, 1], F = [0, 1, 0], focal = 1;
  function updateBasis() {
    cam.pitch = Math.max(-80 * RAD, Math.min(88 * RAD, cam.pitch));
    cam.dist = Math.max(300, Math.min(120000, cam.dist));
    const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
    C = [cam.tx + cam.dist * Math.sin(cam.yaw) * cp, cam.ty - cam.dist * Math.cos(cam.yaw) * cp, cam.tz + cam.dist * sp];
    F = [cam.tx - C[0], cam.ty - C[1], cam.tz - C[2]];
    const fl = Math.hypot(...F); F = F.map((v) => v / fl);
    R = [F[1], -F[0], 0];
    const rl = Math.hypot(R[0], R[1]) || 1; R = [R[0] / rl, R[1] / rl, 0];
    U = [R[1] * F[2] - R[2] * F[1], R[2] * F[0] - R[0] * F[2], R[0] * F[1] - R[1] * F[0]];
    focal = H / (2 * Math.tan(22 * RAD));
  }
  const NEAR = 60;
  function toCam(x, y, z) {
    const v0 = x - C[0], v1 = y - C[1], v2 = z - C[2];
    return [v0 * R[0] + v1 * R[1] + v2 * R[2], v0 * U[0] + v1 * U[1] + v2 * U[2], v0 * F[0] + v1 * F[1] + v2 * F[2]];
  }
  const scr = (c) => [W / 2 + (focal * c[0]) / c[2], H / 2 - (focal * c[1]) / c[2]];
  function projSeg(a, b) {
    if (a[2] < NEAR && b[2] < NEAR) return null;
    if (a[2] < NEAR) { const t = (NEAR - a[2]) / (b[2] - a[2]); a = a.map((v, i) => v + (b[i] - v) * t); }
    else if (b[2] < NEAR) { const t = (NEAR - b[2]) / (a[2] - b[2]); b = b.map((v, i) => v + (a[i] - v) * t); }
    return [scr(a), scr(b), (a[2] + b[2]) / 2, Math.min(a[2], b[2])];
  }
  function projPoly(pts) {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const ain = a[2] >= NEAR, bin = b[2] >= NEAR;
      if (ain) out.push(a);
      if (ain !== bin) { const t = (NEAR - a[2]) / (b[2] - a[2]); out.push(a.map((v, k) => v + (b[k] - v) * t)); }
    }
    return out.map(scr);
  }

  // ---- colours from the page's tokens ----
  let COL = {};
  function readColours() {
    const cs = getComputedStyle(root);
    const v = (n) => cs.getPropertyValue(n).trim();
    COL = { paper: v('--paper'), ink: v('--ink'), graphite: v('--graphite'), rule: v('--rule'), ruleStrong: v('--rule-strong'), water: v('--water'), waterLine: v('--water-line') };
    LINE_ORDER.forEach((l) => { COL[l] = v(`--${l.toLowerCase()}`); });
  }

  // ---- state ----
  let selected = null, hovered = null;
  const isolate = new Set();
  let showPlanes = planesIn.checked, allLabels = labelsIn.checked;
  let hits = [];
  let harbourBox = 0;
  let dirty = true;

  // depth cues: distant geometry fades into the paper; geometry right in front
  // of the camera fades too, so it never smears across the frame
  const fog = (d) => Math.max(0.12, Math.min(1, 1 - (d - 1.6 * cam.dist) / (2.6 * cam.dist)));
  const nearFade = (d) => Math.max(0.08, Math.min(1, (d - NEAR) / (0.35 * cam.dist)));

  const FONT = '"Archivo", "Archivo Fallback", sans-serif';
  const MONO = '"Plex Mono", "Plex Mono Fallback", monospace';

  function draw() {
    updateBasis();
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = COL.paper;
    ctx.fillRect(0, 0, W, H);
    const above = C[2] >= 0;
    const lineItems = [], markItems = [];

    if (showPlanes) {
      [-20, -40, -60].forEach((d) => {
        const z = d * exag;
        const poly = projPoly([[BB.x0, BB.y0, z], [BB.x1, BB.y0, z], [BB.x1, BB.y1, z], [BB.x0, BB.y1, z]].map((p) => toCam(...p)));
        if (poly.length < 3) return;
        lineItems.push({ depth: Infinity, below: true, draw() {
          ctx.setLineDash([4, 6]); ctx.strokeStyle = COL.ruleStrong; ctx.lineWidth = 1; ctx.globalAlpha = 0.5;
          ctx.beginPath(); poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.stroke();
          ctx.setLineDash([]); ctx.globalAlpha = 1;
        } });
      });
    }
    segs.forEach((g) => {
      const pr = projSeg(toCam(g.p[0], g.p[1], g.p[2] * exag), toCam(g.q[0], g.q[1], g.q[2] * exag));
      if (!pr) return;
      const below = (g.p[2] + g.q[2]) / 2 < 0;
      const w = Math.max(1.6, Math.min(7, (130 * focal) / pr[2]));
      const faded = isolate.size ? !isolate.has(g.line) : !!selected && !selected.lines.includes(g.line);
      const f = fog(pr[2]) * nearFade(pr[3]);
      lineItems.push({ depth: pr[2], below, draw() {
        ctx.globalAlpha = faded ? (isolate.size ? 0.12 : 0.3) * f : f;
        ctx.lineCap = 'round';
        if (g.dash) ctx.setLineDash([2, 5]);
        ctx.strokeStyle = COL.ink; ctx.lineWidth = w + 2.2;
        ctx.beginPath(); ctx.moveTo(...pr[0]); ctx.lineTo(...pr[1]); ctx.stroke();
        ctx.strokeStyle = COL[g.line]; ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(...pr[0]); ctx.lineTo(...pr[1]); ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha = 1;
      } });
    });
    // shafts: each station's levels joined to sea level, and hillside entrances drawn at their height
    STATIONS.forEach((s) => {
      s.entScr = null;
      if (cam.pitch > 70 * RAD) return;
      const zs = s.levels.map((l) => l.z * exag);
      const top = s.ent ? s.ent[0] * exag : Math.max(0, ...zs);
      const lo = Math.min(0, ...zs), hi = Math.max(top, ...zs);
      if (hi - lo < 1) return;
      const pr = projSeg(toCam(s.gx, s.gy, lo), toCam(s.gx, s.gy, hi));
      if (!pr) return;
      const faded = isolate.size ? !s.lines.some((l) => isolate.has(l)) : !!selected && s !== selected;
      lineItems.push({ depth: pr[2] - 1, below: lo < 0, draw() {
        ctx.globalAlpha = (faded ? 0.15 : 0.9) * fog(pr[2]);
        ctx.setLineDash(s.ent ? [6, 3] : [3, 3]); ctx.strokeStyle = COL.graphite; ctx.lineWidth = s.ent ? 1.5 : 1;
        ctx.beginPath(); ctx.moveTo(...pr[0]); ctx.lineTo(...pr[1]); ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha = 1;
      } });
      if (s.ent) {
        const c = toCam(s.gx, s.gy, s.ent[0] * exag);
        if (c[2] > NEAR) {
          const [x, y] = scr(c);
          s.entScr = [x, y, c[2]];
          markItems.push({ depth: c[2], below: false, draw() {
            ctx.globalAlpha = (faded ? 0.2 : 1) * fog(c[2]);
            ctx.fillStyle = COL.paper; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.rect(x - 4.5, y - 4.5, 9, 9); ctx.fill(); ctx.stroke();
            ctx.globalAlpha = 1;
          } });
        }
      }
    });
    hits = [];
    markers.forEach((m) => {
      const c = toCam(m.s.gx, m.s.gy, m.z * exag);
      if (c[2] < NEAR) return;
      const [x, y] = scr(c);
      if (x < -40 || x > W + 40 || y < -40 || y > H + 40) return;
      const r = Math.max(3, Math.min(7.5, (150 * focal) / c[2])) * (m.s.lines.length > 1 ? 1.2 : 1);
      const faded = isolate.size ? !m.lines.some((l) => isolate.has(l)) : !!selected && m.s !== selected && !m.lines.some((l) => selected.lines.includes(l));
      const f = fog(c[2]) * nearFade(c[2]);
      hits.push({ s: m.s, x, y, r: Math.max(r, 9), rr: r, depth: c[2], z: m.z, est: m.est });
      markItems.push({ depth: c[2], below: m.z < 0, draw() {
        ctx.globalAlpha = faded ? (isolate.size ? 0.15 : 0.35) * f : f;
        // solid disc: the level has a source; open ring: drawn at a typical level
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = m.est ? COL.paper : COL.ink; ctx.fill();
        ctx.lineWidth = m.est ? 1.8 : 1.4; ctx.strokeStyle = m.est ? COL.ink : COL.paper; ctx.stroke();
        if (!m.est) { ctx.beginPath(); ctx.arc(x, y, r + 1.2, 0, Math.PI * 2); ctx.strokeStyle = COL.ink; ctx.lineWidth = 1; ctx.stroke(); }
        if (selected === m.s || hovered === m.s) {
          ctx.beginPath(); ctx.arc(x, y, r + 4.5, 0, Math.PI * 2);
          ctx.setLineDash(selected === m.s ? [3, 3] : []); ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);
        }
        ctx.globalAlpha = 1;
      } });
    });

    // painter's order: far half-space, the sea-level plane, the near half-space.
    // Within each half the lines go first and the markers on top, so a marker's
    // solid or open centre is never covered by its own line.
    const byDepth = (a, b) => b.depth - a.depth;
    const farHalf = (it) => it.below === above;
    lineItems.filter(farHalf).sort(byDepth).forEach((it) => it.draw());
    markItems.filter(farHalf).sort(byDepth).forEach((it) => it.draw());
    drawGround(above);
    lineItems.filter((it) => !farHalf(it)).sort(byDepth).forEach((it) => it.draw());
    markItems.filter((it) => !farHalf(it)).sort(byDepth).forEach((it) => it.draw());
    drawLabels();
    drawKey();
  }

  function drawGround(above) {
    const poly = projPoly([[BB.x0, BB.y0, 0], [BB.x1, BB.y0, 0], [BB.x1, BB.y1, 0], [BB.x0, BB.y1, 0]].map((p) => toCam(...p)));
    if (poly.length >= 3) {
      ctx.globalAlpha = above ? 0.16 : 0.12;
      ctx.fillStyle = COL.paper;
      ctx.beginPath(); poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = COL.rule; ctx.lineWidth = 1; ctx.globalAlpha = 0.7;
    ctx.beginPath();
    for (let x = Math.ceil(BB.x0 / 2000) * 2000; x <= BB.x1; x += 2000) {
      const pr = projSeg(toCam(x, BB.y0, 0), toCam(x, BB.y1, 0)); if (pr) { ctx.moveTo(...pr[0]); ctx.lineTo(...pr[1]); }
    }
    for (let y = Math.ceil(BB.y0 / 2000) * 2000; y <= BB.y1; y += 2000) {
      const pr = projSeg(toCam(BB.x0, y, 0), toCam(BB.x1, y, 0)); if (pr) { ctx.moveTo(...pr[0]); ctx.lineTo(...pr[1]); }
    }
    ctx.stroke(); ctx.globalAlpha = 1;
    const hp = projPoly(harbour.map(([x, y]) => toCam(x, y, 0)));
    harbourBox = hp.length >= 3 ? (Math.max(...hp.map((p) => p[0])) - Math.min(...hp.map((p) => p[0]))) * (Math.max(...hp.map((p) => p[1])) - Math.min(...hp.map((p) => p[1]))) : 0;
    if (hp.length >= 3) {
      ctx.globalAlpha = above ? 0.55 : 0.35;
      ctx.fillStyle = COL.water;
      ctx.beginPath(); hp.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1; ctx.strokeStyle = COL.waterLine; ctx.lineWidth = 1; ctx.stroke();
    }
  }

  function textOut(text, x, y, { mono = false, muted = false, bold = false, size, plate = mono } = {}) {
    ctx.font = `${bold ? 700 : 500} ${size || (mono ? 11 : 12.5)}px ${mono ? MONO : FONT}`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
    if (plate) {
      const w = ctx.measureText(text).width, h = size || (mono ? 11 : 12.5);
      ctx.globalAlpha = 0.88; ctx.fillStyle = COL.paper; ctx.fillRect(x - 3, y - h, w + 6, h + 4); ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = COL.paper; ctx.lineWidth = 4.5; ctx.strokeText(text, x, y);
    ctx.fillStyle = muted ? COL.graphite : COL.ink; ctx.fillText(text, x, y);
  }
  const measure = (text, font) => { ctx.font = font; return ctx.measureText(text).width; };

  // Every label goes through one placer that avoids everything already placed
  // and the UI on the canvas. Must-label stations may move out on a leader line.
  function placer() {
    const narrowKey = W < 480;
    const ui = [
      { x0: 0, x1: narrowKey ? 212 : 292, y0: H - (narrowKey ? 86 : 104), y1: H },
      W < 600 ? { x0: W - 164, x1: W, y0: 0, y1: 116 } : { x0: W - 164, x1: W, y0: H - 116, y1: H },
      cam.pitch > 70 * RAD ? { x0: 0, x1: 0, y0: 0, y1: 0 } : { x0: 0, x1: narrowKey ? 58 : 78, y0: 0, y1: H - 104 }, // the depth ruler's column
    ];
    if (crossBox) ui.push(crossBox);
    const boxes = [...ui];
    const inFrame = (b) => b.x0 >= 2 && b.x1 <= W - 2 && b.y0 >= 2 && b.y1 <= H - 2;
    const hitsAny = (b, list) => list.some((o) => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
    const distTo = (b, x, y) => Math.hypot(Math.max(b.x0, Math.min(x, b.x1)) - x, Math.max(b.y0, Math.min(y, b.y1)) - y);
    // other stations' markers are obstacles, and a name must sit nearer its own
    // station than any other one (levels of the same station never compete)
    const rivalBlocks = (b, owner) => hits.some((h) => h.s !== owner && distTo(b, h.x, h.y) < h.rr + 2);
    const nearerRival = (b, from, owner) => {
      if (!from || !owner) return false;
      const own = distTo(b, from[0], from[1]);
      return hits.some((h) => h.s !== owner && distTo(b, h.x, h.y) < own + 1.5);
    };
    const leaderBlocked = (p, q, owner) => {
      for (let t = 0.12; t < 1; t += 0.08) {
        const x = p[0] + (q[0] - p[0]) * t, y = p[1] + (q[1] - p[1]) * t;
        if (boxes.some((o) => x > o.x0 && x < o.x1 && y > o.y0 && y < o.y1)) return true;
      }
      return false;
    };
    return {
      place(text, cands, opts, force = false, from = null, owner = null) {
        const font = `${opts.bold ? 700 : 500} ${opts.size || (opts.mono ? 11 : 12.5)}px ${opts.mono ? MONO : FONT}`;
        const w = measure(text, font), h = opts.mono ? 11 : 12.5;
        const box = (x, y, anchor) => { const lx = anchor === 'r' ? x - w : anchor === 'c' ? x - w / 2 : x; return [lx, { x0: lx - 3, x1: lx + w + 3, y0: y - h - 1, y1: y + 4 }]; };
        const end = (b) => [Math.max(b.x0, Math.min(from[0], b.x1)), Math.max(b.y0, Math.min(from[1], b.y1))];
        const put = (lx, y, b, lead) => {
          boxes.push(b);
          if (lead && from) {
            const e = end(b);
            ctx.strokeStyle = COL.graphite; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(from[0], from[1]); ctx.lineTo(...e); ctx.stroke();
            for (let t = 0.2; t < 1; t += 0.2) { const x = from[0] + (e[0] - from[0]) * t, yy = from[1] + (e[1] - from[1]) * t; boxes.push({ x0: x - 2, x1: x + 2, y0: yy - 2, y1: yy + 2 }); }
          }
          textOut(text, lx, y, opts);
          return true;
        };
        for (const [x, y, anchor, lead] of cands) {
          const [lx, b] = box(x, y, anchor);
          // the selected station is always labelled (its leader shows which marker it belongs to);
          // every other name must sit nearer its own station than any other
          const mine = owner && owner === selected;
          if (!inFrame(b) || hitsAny(b, boxes) || rivalBlocks(b, owner) || (!mine && nearerRival(b, from, owner))) continue;
          if (lead && from && leaderBlocked(from, end(b), owner)) continue;
          return put(lx, y, b, lead);
        }
        if (force) {
          for (const [x, y, anchor, lead] of cands) {
            const [lx, b] = box(x, y, anchor);
            if (inFrame(b) && !hitsAny(b, ui) && (owner === selected || !nearerRival(b, from, owner))) return put(lx, y, b, lead);
          }
        }
        return false;
      },
    };
  }
  // the eight places around a marker, then rings further out on leader lines
  function around(x, y, d, rings = 1) {
    const out = [];
    for (let k = 0; k < rings; k++) {
      const e = d + k * 22, lead = k > 0;
      out.push([x + e, y + 4, 'l', lead], [x - e, y + 4, 'r', lead], [x, y - e - 3, 'c', lead], [x, y + e + 12, 'c', lead],
        [x + e - 2, y - e, 'l', lead], [x - e + 2, y - e, 'r', lead], [x + e - 2, y + e + 9, 'l', lead], [x - e + 2, y + e + 9, 'r', lead]);
    }
    return out;
  }
  const MUST = new Set(['admiralty', 'central', 'hong-kong', 'tsim-sha-tsui', 'kowloon', 'mong-kok', 'prince-edward', 'yau-ma-tei', 'kowloon-tong', 'hung-hom', 'north-point', 'quarry-bay', 'diamond-hill', 'tai-wai', 'lai-king', 'mei-foo', 'nam-cheong', 'tsing-yi', 'ho-man-tin', 'hku', 'yau-tong', 'tiu-keng-leng', 'sunny-bay', 'exhibition-centre', 'east-tsim-sha-tsui', 'wan-chai']);

  const TUBE_ENDS = new Set(['admiralty', 'tsim-sha-tsui', 'kowloon', 'hong-kong', 'east-tsim-sha-tsui', 'exhibition-centre', 'hung-hom', 'quarry-bay', 'yau-tong']);
  const BRIDGE_PEAK = (() => { const [la, lo, z] = BRIDGES[1]; const [x, y] = geo(la, lo); return { x, y, z, label: 'Tsing Ma Bridge · deck about +65 m' }; })();

  function drawLabels() {
    drawRuler();
    const P = placer();

    // 1. depth call-outs on the selected station come first
    if (selected) {
      hits.filter((h) => h.s === selected).forEach((h) => {
        const t = `${fmtZ(h.z)}${h.est ? ' (estimated)' : ''}`;
        P.place(t, [[h.x - h.rr - 8, h.y + 4, 'r'], [h.x + h.rr + 8, h.y + 16, 'l'], [h.x - h.rr - 8, h.y + 18, 'r'], [h.x + h.rr + 8, h.y - 8, 'l'], ...around(h.x, h.y, h.rr + 8, 3).slice(8)], { mono: true, muted: true }, true, [h.x, h.y], selected);
      });
      if (selected.ent && selected.entScr) {
        const [x, y] = selected.entScr;
        P.place(`entrance about ${fmtZ(selected.ent[0])}`, [[x + 10, y + 4, 'l'], [x - 10, y + 4, 'r'], ...around(x, y, 12, 3).slice(8)], { mono: true, muted: true }, true, [x, y], selected);
      }
    }
    // 2. names: the selected and hovered station, then the must-label tier
    //    (in the harbour view, the stations at each end of a tube), then later the rest
    const zoomedIn = cam.dist < 9000;
    const tops = {};
    hits.forEach((h) => { if (h.x < 0 || h.x > W || h.y < 0 || h.y > H) return; if (!tops[h.s.id] || h.z > tops[h.s.id].z) tops[h.s.id] = h; });
    const must = (id) => MUST.has(id) || (currentView === 'harbour' && TUBE_ENDS.has(id));
    const prio = (h) => (h.s === selected ? 0 : h.s === hovered ? 1 : must(h.s.id) ? 2 : KEY.has(h.s.id) ? 3 : 4);
    const list = Object.values(tops).filter((h) => {
      if (prio(h) <= 1) return true;
      if (isolate.size && !h.s.lines.some((l) => isolate.has(l))) return false;
      if (allLabels) return true;
      const nearEnough = cam.dist > 30000 || h.depth < cam.dist * 2.2;
      return nearEnough && (zoomedIn || prio(h) <= 3);
    });
    list.sort((a, b) => prio(a) - prio(b) || a.depth - b.depth);
    const wide = cam.dist > 30000 || cam.pitch > 70 * RAD;
    let shown = 0;
    const name = (h) => {
      const p = prio(h);
      const rings = p <= 1 ? 4 : p <= 2 ? (wide ? 2 : 4) : allLabels ? 3 : 1;
      if (P.place(h.s.name, around(h.x, h.y, h.rr + 5, rings), { bold: h.s.lines.length > 1 || h.s === selected }, p <= 1, [h.x, h.y], h.s)) shown++;
    };
    list.filter((h) => prio(h) <= 2).forEach(name);
    // 3. the harbour tubes at their lowest points, and the bridge deck
    [...TUBES, BRIDGE_PEAK].forEach((tb) => {
      const c = toCam(tb.x, tb.y, tb.z * exag);
      if (c[2] < NEAR || c[2] > cam.dist * 2.4) return;
      const [x, y] = scr(c);
      if (x < 0 || x > W || y < 0 || y > H) return;
      const first = tb === BRIDGE_PEAK ? [[x, y - 16, 'c'], [x, y - 30, 'c']] : [[x, y + 18, 'c'], [x, y + 32, 'c']];
      P.place(tb.label, [...first, [x + 12, y + 4, 'l'], [x - 12, y + 4, 'r'], ...around(x, y, 14, 3).slice(8)], { mono: true, muted: true }, false, [x, y]);
    });
    // 4. the rest of the names
    list.filter((h) => prio(h) > 2).forEach(name);
    if (countOut) {
      const total = Object.keys(tops).length;
      const more = shown < total ? (allLabels ? '; zoom in to see the rest' : '; zoom in, or turn on More names, to see the rest') : '';
      countOut.textContent = `${shown} of ${total} station names in view are shown${more}.`;
    }
    // 5. the harbour, when it is big enough on screen to be named
    const hm = toCam(harbourMid[0], harbourMid[1], 0);
    if (harbourBox > 9000) {
      const spots = [harbourMid, geo(22.2945, 114.1700), geo(22.2950, 114.2050), geo(22.2930, 114.1600), geo(22.3000, 114.2200)];
      const cands = [];
      spots.forEach(([gx, gy]) => { const c = toCam(gx, gy, 0); if (c[2] > NEAR) { const [x, y] = scr(c); cands.push([x, y + 4, 'c'], [x, y - 10, 'c']); } });
      if (cands.length) P.place('Victoria Harbour', cands, { mono: true, muted: true });
    }
  }

  // A depth ruler fixed inside the left edge. Its ticks are measured at the
  // view target, so they read true for whatever sits at the centre of the view.
  let crossBox = null;
  function drawRuler() {
    crossBox = null;
    if (cam.pitch > 70 * RAD) return; // meaningless from above
    const at = (step) => {
      const t = [];
      for (let d = 40; d >= -80; d -= step) {
        const c = toCam(cam.tx, cam.ty, d * exag);
        if (c[2] < NEAR) continue;
        const y = scr(c)[1];
        if (y > 10 && y < H - 112) t.push([d, y]);
      }
      return t;
    };
    let ticks = at(20);
    if (ticks.length < 3) ticks = at(10);
    if (ticks.length < 2 || Math.abs(ticks[1][1] - ticks[0][1]) < 12) return null;
    const narrow = W < 480;
    const x = narrow ? 40 : 52;
    const lab = (d) => (d === 0 ? 'sea' : narrow ? fmtZ(d).replace(' m', '') : fmtZ(d));
    ctx.globalAlpha = 0.9; ctx.fillStyle = COL.paper;
    ctx.fillRect(4, ticks[0][1] - 10, x + 20, ticks[ticks.length - 1][1] - ticks[0][1] + 20); ctx.globalAlpha = 1;
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x, ticks[0][1]); ctx.lineTo(x, ticks[ticks.length - 1][1]); ctx.stroke();
    ticks.forEach(([d, y]) => {
      ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y); ctx.stroke();
      textOut(lab(d), x - 9 - measure(lab(d), `500 11px ${MONO}`), y + 4, { mono: true, muted: d !== 0, plate: false });
    });
    // where the ruler reads true: a small cross at sea level under the view
    // centre, tied to the ruler's sea-level tick by a dotted line
    const c0 = toCam(cam.tx, cam.ty, 0);
    if (c0[2] > NEAR) {
      const [tx, ty] = scr(c0);
      const onSelected = selected && hits.some((h) => h.s === selected && Math.hypot(h.x - tx, h.y - ty) < h.rr + 6);
      if (tx > x + 20 && tx < W && ty > 0 && ty < H - 104 && !onSelected) {
        crossBox = { x0: tx - 7, x1: tx + 7, y0: ty - 7, y1: ty + 7 };
        ctx.globalAlpha = 0.55; ctx.setLineDash([1.5, 4]); ctx.strokeStyle = COL.graphite; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x + 6, ty); ctx.lineTo(tx - 7, ty); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
        ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(tx - 5, ty); ctx.lineTo(tx + 5, ty); ctx.moveTo(tx, ty - 5); ctx.lineTo(tx, ty + 5); ctx.stroke();
      }
    }
  }

  function drawKey() {
    // a paper plate behind the compass, key and scale, like a title block
    const narrow = W < 480;
    const pw = narrow ? 204 : 284, ph = narrow ? 80 : 96;
    ctx.globalAlpha = 0.92; ctx.fillStyle = COL.paper; ctx.fillRect(6, H - ph - 6, pw, ph); ctx.globalAlpha = 1;
    ctx.strokeStyle = COL.rule; ctx.lineWidth = 1; ctx.strokeRect(6.5, H - ph - 5.5, pw - 1, ph - 1);
    const cx = 34, cy = H - (narrow ? 34 : 40);
    ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.fillStyle = COL.paper; ctx.fill();
    ctx.strokeStyle = COL.ruleStrong; ctx.lineWidth = 1; ctx.stroke();
    const a = toCam(cam.tx, cam.ty, cam.tz), b = toCam(cam.tx, cam.ty + 1000, cam.tz);
    let ang = 0;
    if (a[2] > NEAR && b[2] > NEAR) { const [ax, ay] = scr(a), [bx, by] = scr(b); ang = Math.atan2(bx - ax, -(by - ay)); }
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
    ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(5.5, 6); ctx.lineTo(0, 2); ctx.lineTo(-5.5, 6); ctx.closePath();
    ctx.fillStyle = COL.ink; ctx.fill(); ctx.restore();
    textOut('N', cx + Math.sin(ang) * 26 - 3.5, cy - Math.cos(ang) * 26 + 4, { mono: true, size: 10 });
    // marker key
    const kx = 68, ky = H - (narrow ? 62 : 70);
    ctx.beginPath(); ctx.arc(kx + 5, ky - 4, 5, 0, Math.PI * 2); ctx.fillStyle = COL.ink; ctx.fill();
    ctx.beginPath(); ctx.arc(kx + 5, ky - 4, 6.4, 0, Math.PI * 2); ctx.strokeStyle = COL.ink; ctx.lineWidth = 1; ctx.stroke();
    textOut(narrow ? 'sourced or street' : 'sourced level, or street level', kx + 16, ky, { mono: true, muted: true, size: 10.5 });
    ctx.beginPath(); ctx.arc(kx + 5, ky + 14, 5, 0, Math.PI * 2); ctx.fillStyle = COL.paper; ctx.fill(); ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.8; ctx.stroke();
    textOut(narrow ? 'estimated' : 'typical level (estimated)', kx + 16, ky + 18, { mono: true, muted: true, size: 10.5 });
    ctx.fillStyle = COL.paper; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.rect(kx + 1, ky + 28, 8, 8); ctx.fill(); ctx.stroke();
    textOut(narrow ? 'entrance' : 'hillside entrance', kx + 16, ky + 36, { mono: true, muted: true, size: 10.5 });
    // scale bar, measured at the view target
    const p0 = toCam(cam.tx, cam.ty, cam.tz);
    const p1 = toCam(cam.tx + 1000 * Math.cos(cam.yaw), cam.ty + 1000 * Math.sin(cam.yaw), cam.tz);
    if (p0[2] > NEAR && p1[2] > NEAR) {
      let px = Math.hypot(scr(p1)[0] - scr(p0)[0], scr(p1)[1] - scr(p0)[1]), km = 1;
      if (px < 30) { px *= 5; km = 5; }
      if (px < 30) { px *= 2; km = 10; }
      if (px >= 30 && px < (narrow ? 90 : 200)) {
        const x0 = kx, y0 = H - 10;
        ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x0, y0 - 4); ctx.lineTo(x0, y0); ctx.lineTo(x0 + px, y0); ctx.lineTo(x0 + px, y0 - 4); ctx.stroke();
        textOut(`${km} km`, x0 + px + 6, y0 + 1, { mono: true, muted: true, size: 10 });
      }
    }
  }

  // ---- render loop: only while something changes ----
  let tween = null;
  let vel = { yaw: 0, pitch: 0 };
  const loop = frameLoop((dt) => {
    let busy = false;
    if (tween) {
      tween.t = Math.min(1, tween.t + dt / tween.dur);
      const e = tween.t < 0.5 ? 4 * tween.t ** 3 : 1 - Math.pow(-2 * tween.t + 2, 3) / 2;
      Object.keys(tween.to).forEach((k) => { cam[k] = tween.from[k] + (tween.to[k] - tween.from[k]) * e; });
      if (tween.t >= 1) tween = null;
      busy = true;
    } else if (Math.abs(vel.yaw) + Math.abs(vel.pitch) > 0.0005) {
      cam.yaw += vel.yaw; cam.pitch += vel.pitch;
      vel.yaw *= 0.9; vel.pitch *= 0.9;
      busy = true;
    }
    if (busy || dirty) { draw(); dirty = false; }
    if (!busy && !dirty) loop.stop();
  });
  const redraw = () => { dirty = true; loop.start(); };

  function flyTo(target, dur = 1.1) {
    vel = { yaw: 0, pitch: 0 };
    const to = { ...target };
    let dy = (to.yaw - cam.yaw) % (2 * Math.PI);
    if (dy > Math.PI) dy -= 2 * Math.PI; if (dy < -Math.PI) dy += 2 * Math.PI;
    to.yaw = cam.yaw + dy;
    if (reduced || dur === 0) { Object.assign(cam, to); tween = null; redraw(); return; }
    tween = { from: { ...cam }, to, t: 0, dur };
    loop.start();
  }
  let currentView = 'overview';
  function setPressed(view) { currentView = view; viewBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === view))); }
  // any hand-made camera move means no viewpoint is current any more
  function manual() { tween = null; setPressed(null); }

  function goView(view) {
    setPressed(view);
    flyTo(PRESETS[view]());
    select(PRESET_STATION[view] || null);
  }

  // ---- input: orbit, pan, zoom ----
  const pointers = new Map();
  let lastPinch = null;
  function pan(dx, dy) {
    const k = cam.dist / focal;
    const rx = Math.cos(cam.yaw), ry = Math.sin(cam.yaw);
    const fx = -Math.sin(cam.yaw), fy = Math.cos(cam.yaw);
    cam.tx += (-dx * rx + dy * fx) * k;
    cam.ty += (-dx * ry + dy * fy) * k;
  }
  stage.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    stage.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, button: e.button, shift: e.shiftKey, moved: false });
    vel = { yaw: 0, pitch: 0 };
    stage.focus({ preventScroll: true });
  });
  stage.addEventListener('pointermove', (e) => {
    const p = pointers.get(e.pointerId);
    if (!p) { hover(e); return; }
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    if (!p.moved && Math.hypot(e.clientX - p.x0, e.clientY - p.y0) > 4) { p.moved = true; manual(); }
    if (!p.moved) return;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (lastPinch) cam.dist *= lastPinch / d;
      lastPinch = d;
    } else if (p.button === 2 || p.shift || e.shiftKey) {
      pan(dx, dy);
    } else {
      cam.yaw -= dx * 0.006; cam.pitch += dy * 0.005;
      vel = { yaw: -dx * 0.006, pitch: dy * 0.005 };
    }
    redraw();
  });
  const end = (e) => {
    const p = pointers.get(e.pointerId);
    pointers.delete(e.pointerId);
    if (pointers.size < 2) lastPinch = null;
    if (p && !p.moved && e.type === 'pointerup') { click(e); vel = { yaw: 0, pitch: 0 }; return; }
    if (reduced) vel = { yaw: 0, pitch: 0 };
    loop.start();
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
  stage.addEventListener('contextmenu', (e) => e.preventDefault());
  stage.addEventListener('pointerleave', () => { if (hovered) { hovered = null; stage.style.cursor = ''; redraw(); } });

  let hintTimer = 0;
  stage.addEventListener('wheel', (e) => {
    if (!(e.ctrlKey || e.metaKey)) {
      hint.hidden = false; clearTimeout(hintTimer); hintTimer = setTimeout(() => { hint.hidden = true; }, 1600);
      return;
    }
    e.preventDefault();
    manual();
    cam.dist *= Math.exp(e.deltaY * 0.0025);
    redraw();
  }, { passive: false });

  function hitAt(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    let best = null, bd = Infinity;
    hits.forEach((h) => { const d = Math.hypot(h.x - x, h.y - y); if (d < h.r && d < bd) { bd = d; best = h; } });
    return best;
  }
  function hover(e) {
    const h = hitAt(e);
    const s = h ? h.s : null;
    stage.style.cursor = s ? 'pointer' : '';
    if (s !== hovered) { hovered = s; redraw(); }
  }
  function click(e) { const h = hitAt(e); select(h ? h.s.id : null); }

  // ---- keyboard ----
  function nudge(kind, sign) {
    manual();
    if (kind === 'turn') cam.yaw -= sign * 8 * RAD;
    if (kind === 'tilt') cam.pitch += sign * 6 * RAD;
    if (kind === 'zoom') cam.dist *= sign > 0 ? 0.75 : 1.33;
    redraw();
  }
  stage.addEventListener('keydown', (e) => {
    const k = e.key;
    if (k === 'Escape') {
      if (selected) { e.preventDefault(); select(null); }
      return;
    }
    if (k === '0') { e.preventDefault(); goView('overview'); return; }
    if (e.shiftKey && k.startsWith('Arrow')) {
      e.preventDefault(); manual();
      pan(k === 'ArrowLeft' ? 40 : k === 'ArrowRight' ? -40 : 0, k === 'ArrowUp' ? 40 : k === 'ArrowDown' ? -40 : 0);
      redraw(); return;
    }
    const map = { ArrowLeft: ['turn', -1], ArrowRight: ['turn', 1], ArrowUp: ['tilt', 1], ArrowDown: ['tilt', -1], '+': ['zoom', 1], '=': ['zoom', 1], '-': ['zoom', -1], _: ['zoom', -1] };
    if (map[k]) { e.preventDefault(); nudge(...map[k]); }
  });

  // ---- controls ----
  viewBtns.forEach((b) => b.addEventListener('click', () => goView(b.dataset.view)));
  root.querySelectorAll('[data-nudge]').forEach((b) => b.addEventListener('click', () => {
    const [kind, sign] = b.dataset.nudge.split(':');
    nudge(kind, Number(sign));
  }));
  exagIn.addEventListener('input', () => {
    const k = Number(exagIn.value) / exag;
    exag = Number(exagIn.value);
    cam.tz *= k;
    exagOut.textContent = exag === 1 ? 'true scale' : `×${exag}`;
    redraw();
  });
  planesIn.addEventListener('change', () => { showPlanes = planesIn.checked; redraw(); });
  labelsIn.addEventListener('change', () => { allLabels = labelsIn.checked; redraw(); });

  const allBtn = root.querySelector('[data-m3-all]');
  LINE_ORDER.forEach((l) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = `<span class="sw" style="--c:${LINES[l].color}"></span>${LINES[l].name}`;
    b.addEventListener('click', () => {
      if (isolate.has(l)) isolate.delete(l); else isolate.add(l);
      b.setAttribute('aria-pressed', String(isolate.has(l)));
      allBtn.disabled = !isolate.size;
      redraw();
    });
    li.appendChild(b);
    linesUl.appendChild(li);
  });
  allBtn.disabled = true;
  allBtn.addEventListener('click', () => {
    isolate.clear();
    linesUl.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    allBtn.disabled = true;
    redraw();
  });

  [...STATIONS].sort((a, b) => a.name.localeCompare(b.name)).forEach((s) => {
    const o = document.createElement('option'); o.value = s.id; o.textContent = s.name; pick.appendChild(o);
  });
  pick.addEventListener('change', () => {
    if (!pick.value) { select(null); return; }
    setPressed(null);
    select(pick.value);
    flyToStation(byId[pick.value]);
  });

  // frame the station's whole height (platforms to street, and any hillside entrance)
  function flyToStation(s) {
    const zs = s.levels.map((l) => l.z).concat(s.ent ? [s.ent[0]] : [], [0]);
    const lo = Math.min(...zs) * exag, hi = Math.max(...zs) * exag;
    const narrow = W < 600;
    const fit = ((hi - lo) / 2 / Math.tan(22 * RAD)) * (narrow ? 1.8 : 1.45);
    flyTo({ tx: s.gx, ty: s.gy, tz: narrow ? lo + 0.38 * (hi - lo) : (lo + hi) / 2, yaw: cam.yaw, pitch: 8 * RAD, dist: Math.max(2600, fit + 1200) });
  }

  function select(id) {
    selected = id ? byId[id] : null;
    pick.value = id || '';
    renderCard();
    redraw();
  }

  function renderCard() {
    card.classList.toggle('is-empty', !selected);
    if (!selected) {
      card.innerHTML = '<p class="empty">Select a station in the model, or choose one below, to see how deep each line runs there.</p>';
      return;
    }
    const s = selected;
    const rows = s.lines.map((l) => `<li><span class="chip" style="--c:${LINES[l].color}"><i></i>${LINES[l].short}</span><span>${levelText(s, l)}</span></li>`).join('');
    const ent = s.n3 ? `<p class="m3-ent">${s.n3.replace(/\[([A-Z]\d\d)\]/g, '<span class="ref">[<a href="#src-$1">$1</a>]</span>')}</p>` : '';
    card.innerHTML = `<h3>${s.name}</h3><ul class="m3-levels">${rows}</ul>${ent}
      <div class="m3-card-actions"><button type="button" class="btn btn--compact" data-fly>Fly to ${s.name}</button><button type="button" class="m3-clear" data-clear>Clear selection</button></div>`;
    card.querySelector('[data-fly]').addEventListener('click', () => { setPressed(null); flyToStation(s); });
    card.querySelector('[data-clear]').addEventListener('click', () => { select(null); stage.focus({ preventScroll: true }); });
  }

  // ---- size ----
  function resize() {
    const r = stage.getBoundingClientRect();
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
    redraw();
  }
  new ResizeObserver(resize).observe(stage);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { readColours(); redraw(); });

  readColours();
  renderCard();
  resize();
  loading.hidden = true;
  root.dataset.ready = 'true';
  document.fonts?.ready.then(redraw);
  setPressed('overview');

  // an opening move: from the plan down to the oblique view, once
  if (!reduced) {
    Object.assign(cam, PRESETS.plan());
    redraw();
    setTimeout(() => flyTo(PRESETS.overview(), 2.2), 250);
  } else {
    Object.assign(cam, PRESETS.overview());
    redraw();
  }
}
