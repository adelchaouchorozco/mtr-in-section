// Sheet 04: six ways to make room for a railway, each with a principle diagram.
import { el, strataDefs, fillUrl } from './draw.js';

const C = { TWL: 'var(--twl)', ISL: 'var(--isl)', KTL: 'var(--ktl)', TML: 'var(--tml)', TCL: 'var(--tcl)', EAL: 'var(--eal)', SIL: 'var(--sil)' };
const W = 480, H = 270;

function label(svg, x, y, s, anchor = 'start', muted = false) {
  return el('text', { x, y, class: `svg-label${muted ? ' svg-label--muted' : ''}`, 'text-anchor': anchor, text: s }, svg);
}
function lead(svg, x1, y1, x2, y2) {
  el('path', { d: `M${x1} ${y1}L${x2} ${y2}`, class: 'ink-line', 'stroke-width': 1 }, svg);
  el('circle', { cx: x1, cy: y1, r: 2.5, class: 'ink-fill' }, svg);
}
function trainEnd(svg, x, floor, color, w = 30, h = 36) {
  el('rect', { x: x - w / 2, y: floor - h, width: w, height: h, rx: 4, class: 'ink-line paper-fill', 'stroke-width': 1.4 }, svg);
  const s = el('rect', { x: x - w / 2 + 2, y: floor - h * 0.4, width: w - 4, height: 5 }, svg);
  s.style.fill = color;
}

const DRAW = {
  cutcover(svg, p) {
    const G = 56;
    [[G, 96, 'fill'], [96, 150, 'clay'], [150, 270, 'weathered']].forEach(([a, b, k]) => el('rect', { x: 0, y: a, width: W, height: b - a, fill: fillUrl(p, k) }, svg));
    el('rect', { x: 0, y: 6, width: 100, height: G - 6, class: 'ink-line paper-fill', 'stroke-width': 1.2 }, svg);
    el('rect', { x: 380, y: 14, width: 100, height: G - 14, class: 'ink-line paper-fill', 'stroke-width': 1.2 }, svg);
    el('path', { d: `M0 ${G}H${W}`, class: 'ink-line', 'stroke-width': 2 }, svg);
    el('rect', { x: 140, y: G, width: 10, height: 190, class: 'ink-fill' }, svg);
    el('rect', { x: 330, y: G, width: 10, height: 190, class: 'ink-fill' }, svg);
    el('rect', { x: 150, y: G + 18, width: 180, height: 150, class: 'paper-fill' }, svg);
    el('rect', { x: 150, y: G + 18, width: 180, height: 8, class: 'ink-fill' }, svg);
    el('rect', { x: 150, y: G + 66, width: 180, height: 6, class: 'ink-fill' }, svg);
    el('rect', { x: 150, y: G + 116, width: 180, height: 6, class: 'ink-fill' }, svg);
    el('rect', { x: 150, y: G + 166, width: 180, height: 10, class: 'ink-fill' }, svg);
    trainEnd(svg, 205, G + 116, C.TWL);
    trainEnd(svg, 275, G + 166, C.TWL);
    label(svg, 240, G + 50, 'Ticket hall', 'middle');
    lead(svg, 145, 214, 112, 236); label(svg, 104, 241, 'Walls first', 'end');
    label(svg, 240, 36, 'Street rebuilt on top', 'middle');
  },
  tube(svg, p) {
    el('rect', { x: 0, y: 40, width: W, height: 110, fill: fillUrl(p, 'water') }, svg);
    el('path', { d: 'M0 40H480', class: 'ink-line', 'stroke-width': 1.5 }, svg);
    el('rect', { x: 0, y: 150, width: W, height: 120, fill: fillUrl(p, 'clay') }, svg);
    el('path', { d: 'M0 150H120L150 210H330L360 150H480', class: 'ink-line', 'stroke-width': 1.5, fill: 'none' }, svg);
    el('path', { d: 'M120 150L150 210H330L360 150Z', class: 'paper-fill' }, svg);
    for (let i = 0; i < 3; i++) el('rect', { x: 156 + i * 58, y: 172, width: 54, height: 34, class: 'ink-line', 'stroke-width': 1.6, style: 'fill:var(--paper-3)' }, svg);
    el('rect', { x: 330, y: 70, width: 54, height: 34, class: 'ink-line', 'stroke-width': 1.6, 'stroke-dasharray': '4 3', style: 'fill:var(--paper-2)' }, svg);
    el('path', { d: 'M357 108V160', class: 'ink-line', 'stroke-width': 1.4, 'marker-end': 'url(#' + p + '-arr)' }, svg);
    el('path', { d: 'M156 168C200 150 260 150 326 168', class: 'rule-line', 'stroke-dasharray': '3 3' }, svg);
    label(svg, 20, 28, 'Sea', 'start', true);
    lead(svg, 240, 208, 240, 240); label(svg, 240, 258, 'Dredged trench', 'middle');
    label(svg, 392, 92, 'Next unit', 'start');
  },
  shield(svg, p) {
    el('rect', { x: 0, y: 0, width: W, height: 70, fill: fillUrl(p, 'fill') }, svg);
    el('rect', { x: 0, y: 70, width: W, height: 200, fill: fillUrl(p, 'clay') }, svg);
    el('path', { d: 'M0 70H480', class: 'hair' }, svg);
    // tunnel in long section
    el('rect', { x: 20, y: 120, width: 360, height: 90, class: 'paper-fill' }, svg);
    for (let x = 30; x < 330; x += 22) el('path', { d: `M${x} 120V210`, class: 'rule-line' }, svg);
    el('path', { d: 'M20 120H380M20 210H380', class: 'ink-line', 'stroke-width': 2 }, svg);
    // the shield
    el('path', { d: 'M330 114H410L420 124V206L410 216H330Z', class: 'ink-line', 'stroke-width': 2, style: 'fill:var(--paper-3)' }, svg);
    el('path', { d: 'M420 124L430 165L420 206', class: 'ink-line', 'stroke-width': 1.5, fill: 'none' }, svg);
    // airlock bulkhead
    el('rect', { x: 92, y: 120, width: 12, height: 90, class: 'ink-fill' }, svg);
    el('rect', { x: 104, y: 170, width: 36, height: 30, class: 'ink-line paper-fill', 'stroke-width': 1.4 }, svg);
    for (let i = 0; i < 6; i++) el('path', { d: `M${160 + i * 34} 150l10 -6M${160 + i * 34} 180l10 -6`, class: 'rule-line' }, svg);
    label(svg, 375, 246, 'Steel shield', 'middle');
    lead(svg, 98, 200, 112, 238); label(svg, 118, 250, 'Air lock', 'start');
    label(svg, 250, 106, 'Raised air pressure keeps water out', 'middle');
  },
  blast(svg, p) {
    el('rect', { x: 0, y: 0, width: W, height: H, fill: fillUrl(p, 'rock') }, svg);
    // cavern: excavated top heading, bench still to come
    el('path', { d: 'M90 150V100Q90 40 240 40Q390 40 390 100V150Z', class: 'ink-line paper-fill', 'stroke-width': 2 }, svg);
    el('path', { d: 'M90 150V230H390V150', class: 'ink-line', 'stroke-width': 1.5, 'stroke-dasharray': '6 4', style: 'fill:color-mix(in oklab, var(--paper) 55%, transparent)' }, svg);
    // rock bolts
    for (let a = 200; a <= 340; a += 20) {
      const r = (a * Math.PI) / 180;
      const cx = 240, cy = 100;
      const x1 = cx + Math.cos(r) * 152, y1 = cy + Math.sin(r) * 62;
      const x2 = cx + Math.cos(r) * 190, y2 = cy + Math.sin(r) * 96;
      el('path', { d: `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`, class: 'ink-line', 'stroke-width': 2 }, svg);
    }
    // drill holes in the face of the bench
    for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) el('circle', { cx: 116 + c * 31, cy: 170 + r * 22, r: 3, class: 'ink-fill' }, svg);
    label(svg, 240, 120, 'Top heading, dug first', 'middle');
    label(svg, 240, 258, 'Drilled, charged, blasted, cleared', 'middle');
    label(svg, 476, 128, 'Rock bolts', 'end');
  },
  tbm(svg, p) {
    el('rect', { x: 0, y: 0, width: W, height: 110, fill: fillUrl(p, 'fill') }, svg);
    el('rect', { x: 0, y: 110, width: W, height: 160, fill: fillUrl(p, 'weathered') }, svg);
    // existing line above
    el('circle', { cx: 300, cy: 70, r: 30, class: 'ink-line paper-fill', 'stroke-width': 2 }, svg);
    trainEnd(svg, 300, 90, C.KTL, 26, 32);
    label(svg, 340, 44, 'Line in service', 'start');
    // the machine
    el('rect', { x: 40, y: 150, width: 300, height: 74, class: 'paper-fill' }, svg);
    for (let x = 48; x < 240; x += 18) el('path', { d: `M${x} 150V224`, class: 'rule-line' }, svg);
    el('path', { d: 'M40 150H340M40 224H340', class: 'ink-line', 'stroke-width': 1.5 }, svg);
    el('rect', { x: 240, y: 144, width: 150, height: 86, class: 'ink-line', 'stroke-width': 2, style: 'fill:var(--paper-3)' }, svg);
    el('rect', { x: 390, y: 138, width: 14, height: 98, class: 'ink-fill' }, svg);
    for (let y = 142; y < 234; y += 12) el('path', { d: `M404 ${y}h8`, class: 'ink-line', 'stroke-width': 2 }, svg);
    el('path', { d: 'M300 112V142', class: 'ink-line', 'stroke-width': 1, 'stroke-dasharray': '3 3' }, svg);
    label(svg, 306, 132, '5–6 m', 'start');
    label(svg, 397, 256, 'Cutterhead', 'middle');
    label(svg, 140, 250, 'Lining rings', 'middle');
  },
  viaduct(svg, p) {
    el('rect', { x: 0, y: 220, width: W, height: 50, fill: fillUrl(p, 'fill') }, svg);
    el('path', { d: 'M0 220H480', class: 'ink-line', 'stroke-width': 1.5 }, svg);
    for (let x = 40; x <= 440; x += 100) {
      el('rect', { x: x - 7, y: 120, width: 14, height: 100, class: 'ink-line paper-fill', 'stroke-width': 1.6 }, svg);
      el('path', { d: `M${x - 22} 120h44`, class: 'ink-line', 'stroke-width': 2 }, svg);
    }
    for (let x = 0; x < 480; x += 50) el('rect', { x, y: 100, width: 48, height: 20, class: 'ink-line', 'stroke-width': 1.2, style: 'fill:var(--paper-3)' }, svg);
    const tr = el('rect', { x: 120, y: 74, width: 200, height: 26, rx: 4, class: 'ink-line paper-fill', 'stroke-width': 1.4 }, svg);
    void tr;
    const s = el('rect', { x: 122, y: 88, width: 196, height: 5 }, svg); s.style.fill = C.TML;
    label(svg, 20, 60, 'Precast deck segments', 'start');
    lead(svg, 40, 180, 70, 160); label(svg, 76, 164, 'Pier', 'start');
  },
};

const METHODS = [
  {
    key: 'cutcover', refs: ['C01', 'D09', 'C06'], name: 'Cut-and-cover', thin: 'dig down from the street',
    body: [
      'Walls are built deep into the ground first. Then the ground between them is dug out, the station is cast in concrete inside the hole, and it is covered over and the street rebuilt. It is the simplest way to build a station, but it keeps the station close to the surface and disrupts the street above for years.',
      'The first line’s stations were dug 17 to 28 metres deep. Some were built from the bottom up, others from the top down, with the roof cast first so the road could reopen sooner.',
    ],
    used: [['1979', 'Stations under Nathan Road'], ['1998', 'Hong Kong station, with walls 30 to 70 m down to rock'], ['2016', 'Ho Man Tin, a deep open pit'], ['2021–22', 'To Kwa Wan, Sung Wong Toi, Exhibition Centre']],
  },
  {
    key: 'tube', refs: ['C01', 'C10', 'L03'], name: 'Immersed tube', thin: 'sink it into the seabed',
    body: [
      'Long concrete tube sections are built in a dry dock, floated out, and sunk one by one into a trench dredged in the seabed. They are joined underwater, and rock and fill are laid over the top.',
      'All four rail crossings of Victoria Harbour are immersed tubes. The first, from 1980, is 14 sections of about 100 metres each, and its lowest point is about 24 metres below sea level.',
    ],
    used: [['1980', 'Tsim Sha Tsui to Admiralty'], ['1989', 'Eastern Harbour Crossing, shared with a road'], ['1998', 'Airport Railway, Kowloon to Hong Kong'], ['2022', 'East Rail, 11 sections, cast in a former quarry']],
  },
  {
    key: 'shield', refs: ['C01'], name: 'Shield and compressed air', thin: 'tunnelling by hand in soft ground',
    body: [
      'No tunnel boring machines were used on the first line. In soft, wet ground, workers dug by hand or behind a steel shield, and the air in the tunnel was kept at higher pressure to hold back groundwater. They entered and left through air locks.',
      'On one contract under Nathan Road the air pressure reached up to 2.5 bar above normal. Legal limits on work in compressed air also capped how deep soft-ground tunnels could go.',
    ],
    used: [['1979', 'Running tunnels of the first line'], ['1985', 'Island Line, with platforms in 8 m bored tunnels'], ['1989', 'Eastern Harbour Crossing approaches']],
  },
  {
    key: 'blast', refs: ['D06', 'C04', 'C05'], name: 'Drill-and-blast', thin: 'caverns in solid rock',
    body: [
      'In hard rock, holes are drilled into the face, loaded with explosives and fired; the broken rock is cleared, and the new surface is secured with rock bolts and sprayed concrete. Large stations are dug as caverns, top first.',
      'Rock is what lets a station go deep. HKU station is a cavern about 240 m long and 22 m wide, about 70 m below its uphill entrance. Lei Tung took about 580 blasts.',
    ],
    used: [['1985', 'Tai Koo station, a cavern 250 m long'], ['2002', 'Tseung Kwan O Line, through Black Hill'], ['2014', 'Sai Ying Pun and HKU caverns'], ['2016', 'South Island Line tunnel, with up to 320 m of rock above it']],
  },
  {
    key: 'tbm', refs: ['C09', 'C08', 'C12', 'D07'], name: 'Tunnel boring machine', thin: 'a moving factory underground',
    body: [
      'A tunnel boring machine cuts the ground with a rotating head and lines the tunnel with concrete rings as it goes. It disturbs the ground far less than open digging, which matters where tunnels pass close to buildings or other railways.',
      'On the Shatin to Central Link, MTR’s machines passed about 5 to 6 metres beneath the Kwun Tong Line while it was running. In 2009, the Kowloon Southern Link was bored just above the Tsuen Wan Line’s tunnels.',
    ],
    used: [['2009', 'Kowloon Southern Link, above the Tsuen Wan Line'], ['2014', 'Sheung Wan to Sai Ying Pun'], ['2020–22', 'Shatin to Central Link, with machines named after women from history and legend']],
  },
  {
    key: 'viaduct', refs: ['C07', 'C02', 'C03', 'C05'], name: 'Viaducts and bridges', thin: 'going over instead',
    body: [
      'Where there is space, or water, a railway can run above ground. That is cheaper and quicker to build than a tunnel, but it is visible and noisy, and it needs a clear line through the city.',
      'West Rail runs on 13.4 km of viaduct, built from 607 precast spans. The Tsing Ma Bridge carries the airport trains on an enclosed lower deck, beneath a six-lane road.',
    ],
    used: [['1979', 'Kowloon Bay to Kwun Tong'], ['1998', 'Tsing Ma and Kap Shui Mun bridges'], ['2003', 'West Rail, 13.4 km of viaduct'], ['2016', 'South Island Line, Aberdeen Channel bridge']],
  },
];

export function initMethods(root) {
  root.textContent = '';
  METHODS.forEach((m, i) => {
    const li = document.createElement('li');
    li.className = 'method';
    li.innerHTML = `
      <span class="no" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
      <div>
        <h3>${m.name}<span class="thin">${m.thin}</span></h3>
        ${m.body.map((b) => `<p>${b}</p>`).join('')}
        <div class="used"><p class="label">Where it was used</p><ul>${m.used.map(([y, t]) => `<li><span class="y">${y}</span><span>${t}</span></li>`).join('')}</ul></div>
        <p class="refs">Sources: ${m.refs.map((r) => `<a href="#src-${r}">${r}</a>`).join(', ')}</p>
      </div>
      <figure class="method-fig"></figure>`;
    const fig = li.querySelector('figure');
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `Diagram: ${m.name.toLowerCase()}, ${m.thin}` });
    const p = `m${i}`;
    const defs = strataDefs(svg, p);
    const arr = el('marker', { id: `${p}-arr`, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, defs);
    el('path', { d: 'M0 1L9 5L0 9z', class: 'ink-fill' }, arr);
    DRAW[m.key](svg, p);
    fig.appendChild(svg);
    root.appendChild(li);
  });
}
