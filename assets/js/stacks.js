// Sheet 03: interchanges as vertical stacks of levels.
// Level order and platform pairings follow MTR's station layout drawings
// (mtr.com.hk/archive/en/services/layouts/), read October 2026.
import { el } from './draw.js';
import { LINES } from './data.js';

const IX = [
  {
    id: 'admiralty', name: 'Admiralty', lines: ['TWL', 'ISL', 'SIL', 'EAL'], built: [['TWL', 1980], ['ISL', 1985], ['SIL', 2016], ['EAL', 2022]],
    text: 'The Tsuen Wan and Island lines were planned to meet here. They share two levels arranged by direction, so most changes between them are a walk across the platform. The South Island Line (2016) and the East Rail Line (2022) were dug in beneath the old station while it stayed open, and are reached through a 30-metre-tall atrium.',
    stacks: [{
      street: 0,
      levels: [
        { lv: 'L1', kind: 'hall', text: 'Concourse' },
        { lv: 'L2', tracks: [['TWL', 'Central'], ['ISL', 'Chai Wan']], cross: true },
        { lv: 'L3', tracks: [['TWL', 'Tsuen Wan'], ['ISL', 'Kennedy Town']], cross: true },
        { lv: 'L4', kind: 'hall', text: 'Transfer level' },
        { lv: 'L5', tracks: [['EAL', 'Lo Wu / Lok Ma Chau'], ['EAL', 'arrivals, end of line']] },
        { lv: 'L6', tracks: [['SIL', 'South Horizons'], ['SIL', 'South Horizons']], note: '−33.6 mPD' },
      ],
    }],
  },
  {
    id: 'mk-pe', name: 'Mong Kok + Prince Edward', lines: ['TWL', 'KTL'], built: [['KTL', 1979], ['TWL', 1982]],
    text: 'Under Nathan Road the Tsuen Wan and Kwun Tong lines run side by side through two neighbouring stations, each on two levels. Mong Kok pairs one set of directions on each level and Prince Edward the other, so every change between the two lines is a walk across the platform at one of them.',
    stacks: [
      { title: 'Mong Kok', street: 0, levels: [
        { lv: 'L1', kind: 'hall', text: 'Concourse' },
        { lv: 'Upper', tracks: [['TWL', 'Tsuen Wan'], ['KTL', 'Tiu Keng Leng']], cross: true },
        { lv: 'Lower', tracks: [['TWL', 'Central'], ['KTL', 'Whampoa']], cross: true },
      ] },
      { title: 'Prince Edward', street: 0, levels: [
        { lv: 'L1', kind: 'hall', text: 'Concourse' },
        { lv: 'Upper', tracks: [['TWL', 'Tsuen Wan'], ['KTL', 'Whampoa']], cross: true },
        { lv: 'Lower', tracks: [['TWL', 'Central'], ['KTL', 'Tiu Keng Leng']], cross: true },
      ] },
    ],
  },
  {
    id: 'lai-king', name: 'Lai King', lines: ['TWL', 'TCL'], built: [['TWL', 1982], ['TCL', 1998]],
    text: 'Cut into a hillside, with its upper level above the ground. Each level pairs a Tsuen Wan Line and a Tung Chung Line platform going the same way: outbound on top, towards the city below. To make the pairing work, the Tsuen Wan-bound platform was moved to a new upper level in 1997, a year before the Tung Chung Line opened.',
    stacks: [{
      levels: [
        { lv: 'Upper', tracks: [['TWL', 'Tsuen Wan'], ['TCL', 'Tung Chung']], cross: true },
        { lv: '', kind: 'hall', text: 'Concourse' },
        { lv: 'Lower', tracks: [['TWL', 'Central'], ['TCL', 'Hong Kong']], cross: true },
      ],
    }],
  },
  {
    id: 'yt-tkl', name: 'Yau Tong + Tiu Keng Leng', lines: ['KTL', 'TKL'], built: [['KTL', 2002], ['TKL', 2002]],
    text: 'Both opened in 2002, when the Kwun Tong Line was cut back to Tiu Keng Leng and the new Tseung Kwan O Line took over its harbour crossing. Like Mong Kok and Prince Edward, the two stations share out the directions between their two levels, so changes between the lines are cross-platform.',
    stacks: [
      { title: 'Yau Tong', levels: [
        { lv: '', kind: 'hall', text: 'Concourse' },
        { lv: 'Upper', tracks: [['KTL', 'Whampoa'], ['TKL', 'Po Lam / LOHAS Park']], cross: true },
        { lv: 'Lower', tracks: [['TKL', 'North Point'], ['KTL', 'Tiu Keng Leng']], cross: true },
      ] },
      { title: 'Tiu Keng Leng', levels: [
        { lv: '', kind: 'hall', text: 'Concourse' },
        { lv: 'Upper', tracks: [['KTL', 'Whampoa'], ['TKL', 'North Point']], cross: true },
        { lv: 'Lower', tracks: [['KTL', 'arrivals, end of line'], ['TKL', 'Po Lam / LOHAS Park']], cross: true },
      ] },
    ],
  },
  {
    id: 'hung-hom', name: 'Hung Hom', lines: ['EAL', 'TML'], built: [['EAL', 1975], ['TML', 2009]],
    text: 'Opened in 1975 as the Kowloon terminus of the Kowloon–Canton Railway. When East Rail was extended under the harbour in 2022, its trains moved to new platforms a level below the Tuen Ma Line’s. The oldest railway in Hong Kong now runs beneath one of its newest.',
    stacks: [{
      street: 1,
      levels: [
        { lv: 'U1–U3', kind: 'hall', text: 'Concourses' },
        { lv: 'G', tracks: [['TML', 'Tuen Mun'], ['TML', 'Wu Kai Sha']] },
        { lv: 'L1', tracks: [['EAL', 'Admiralty'], ['EAL', 'Lo Wu / Lok Ma Chau']] },
      ],
    }],
  },
  {
    id: 'ho-man-tin', name: 'Ho Man Tin', lines: ['KTL', 'TML'], built: [['KTL', 2016], ['TML', 2021]],
    text: 'Dug as one deep pit against a hillside, for two lines. Here the line that opened first is the deeper one: the Kwun Tong Line platforms (2016) are at the bottom, about 25 metres below datum, with the Tuen Ma Line (2021) on a level above. The top of the site is about 70 metres higher than the lowest platform.',
    stacks: [{
      levels: [
        { lv: 'L2', kind: 'hall', text: 'Concourse' },
        { lv: 'L4', tracks: [['TML', 'Tuen Mun'], ['TML', 'Wu Kai Sha']] },
        { lv: 'L6', kind: 'hall', text: 'Transfer level' },
        { lv: 'L7', tracks: [['KTL', 'Tiu Keng Leng'], ['KTL', 'Whampoa']], note: '−25 mPD' },
      ],
    }],
  },
  {
    id: 'quarry-bay', name: 'Quarry Bay', lines: ['ISL', 'TKL'], built: [['ISL', 1985], ['TKL', '1989 platforms']],
    text: 'The Island Line platforms (1985) are on one level. The platforms built for the 1989 harbour crossing, now used by the Tseung Kwan O Line, lie deeper. Changing between them means a long passage and two flights of escalators, about five minutes on foot.',
    stacks: [{
      street: 0,
      levels: [
        { lv: 'G / L1', kind: 'hall', text: 'Concourses' },
        { lv: 'L2', tracks: [['ISL', 'Chai Wan'], ['ISL', 'Kennedy Town']] },
        { lv: 'L3', tracks: [['TKL', 'Po Lam / LOHAS Park'], ['TKL', 'North Point']] },
      ],
    }],
  },
  {
    id: 'kowloon-tong', name: 'Kowloon Tong', lines: ['KTL', 'EAL'], built: [['KTL', 1979], ['EAL', 1982]],
    text: 'The East Rail platforms (1982) are close to ground level; the Kwun Tong Line platforms (1979) are underground beneath them. The two lines were built by different railway companies, and the change between them is a long walk.',
    stacks: [{
      levels: [
        { lv: 'Top', tracks: [['EAL', 'Lo Wu / Lok Ma Chau'], ['EAL', 'Admiralty']] },
        { lv: '', kind: 'hall', text: 'Concourses' },
        { lv: 'Lower', tracks: [['KTL', 'Tiu Keng Leng'], ['KTL', 'Whampoa']] },
      ],
    }],
  },
];

const W = 640;
const ROW = 92;
const HALL = 46;

function drawStack(svg, stack, y0) {
  let y = y0;
  if (stack.title) {
    el('text', { x: 0, y: y + 18, class: 'stk-title', text: stack.title }, svg);
    y += 34;
  }
  stack.levels.forEach((L, i) => {
    if (stack.street === i) {
      el('path', { d: `M0 ${y + 2}H${W}`, class: 'stk-street' }, svg);
      el('text', { x: W, y: y - 6, class: 'svg-label svg-label--muted', 'text-anchor': 'end', text: 'Street level' }, svg);
      y += 10;
    }
    const h = L.kind === 'hall' ? HALL : ROW;
    el('text', { x: 0, y: y + h / 2 + 6, class: 'stk-lv', text: L.lv }, svg);
    if (L.kind === 'hall') {
      el('rect', { x: 78, y, width: W - 78, height: h - 8, class: 'stk-hall' }, svg);
      el('text', { x: 78 + (W - 78) / 2, y: y + h / 2 + 1, class: 'svg-label svg-label--muted', 'text-anchor': 'middle', text: L.text }, svg);
    } else {
      el('rect', { x: 78, y, width: W - 78, height: h - 8, class: 'stk-box' }, svg);
      const left = { x0: 96, x1: 316 }, right = { x0: 402, x1: 622 };
      [left, right].forEach((side, j) => {
        const [line, dest] = L.tracks[j];
        const bar = el('rect', { x: side.x0, y: y + 18, width: side.x1 - side.x0, height: 13, class: 'stk-track' }, svg);
        bar.style.fill = LINES[line].color;
        el('text', { x: side.x0, y: y + 52, class: 'stk-line', text: LINES[line].name }, svg);
        el('text', { x: side.x0, y: y + 70, class: 'stk-dest', text: `to ${dest}`.replace('to arrivals', 'Arrivals') }, svg);
      });
      if (L.cross) {
        el('rect', { x: 326, y: y + 10, width: 66, height: 30, class: 'stk-plat' }, svg);
        el('path', { d: `M334 ${y + 25}h50`, class: 'ink-line', 'stroke-width': 1.6, 'marker-start': 'url(#stk-arrow)', 'marker-end': 'url(#stk-arrow)' }, svg);
      }
      if (L.note) el('text', { x: W, y: y + h + 14, class: 'svg-label stk-note', 'text-anchor': 'end', text: L.note }, svg);
    }
    y += h + (L.note ? 22 : 0);
  });
  return y;
}

function describe(L) {
  const [[l1, d1], [l2, d2]] = L.tracks;
  const say = (l, d) => `${LINES[l].name} ${d.startsWith('arrivals') ? `(${d})` : `to ${d}`}`;
  const txt = l1 === l2 && d1 === d2 ? `${LINES[l1].name}, both platforms to ${d1}` : `${say(l1, d1)}; ${say(l2, d2)}`;
  return txt + (L.cross ? '. <strong>Cross-platform.</strong>' : '');
}

export function initStacks(root) {
  const tabs = root.querySelector('.stack-tabs');
  const panel = root.querySelector('.stack-panel');
  panel.id = 'stack-panel';

  const buttons = IX.map((ix, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.id = `tab-${ix.id}`;
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-controls', 'stack-panel');
    b.tabIndex = i === 0 ? 0 : -1;
    b.innerHTML = `<span class="n">${ix.name}</span><span class="k" aria-hidden="true">${ix.lines.map((l) => `<i style="--c:${LINES[l].color}"></i>`).join('')}</span>`;
    b.addEventListener('click', () => show(i, false));
    tabs.appendChild(b);
    return b;
  });

  tabs.addEventListener('keydown', (e) => {
    const i = buttons.indexOf(document.activeElement);
    if (i < 0) return;
    let j = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') j = (i + 1) % buttons.length;
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') j = (i - 1 + buttons.length) % buttons.length;
    if (e.key === 'Home') j = 0;
    if (e.key === 'End') j = buttons.length - 1;
    if (j !== null) { e.preventDefault(); show(j, true); }
  });

  const mq = window.matchMedia('(max-width: 1100px)');
  const orient = () => tabs.setAttribute('aria-orientation', mq.matches ? 'horizontal' : 'vertical');
  mq.addEventListener?.('change', orient);
  orient();

  function show(i, focus) {
    const ix = IX[i];
    buttons.forEach((b, k) => {
      b.setAttribute('aria-selected', String(k === i));
      b.tabIndex = k === i ? 0 : -1;
    });
    if (focus) { buttons[i].focus(); buttons[i].scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
    panel.setAttribute('aria-labelledby', buttons[i].id);
    panel.textContent = '';

    const fig = document.createElement('figure');
    fig.className = 'stack-fig';
    const total = ix.stacks.reduce((h, st) => h + (st.title ? 34 : 0) + (st.street !== undefined ? 10 : 0)
      + st.levels.reduce((a, L) => a + (L.kind === 'hall' ? HALL : ROW) + (L.note ? 22 : 0), 0) + 24, 0);
    const svg = el('svg', { viewBox: `-2 -30 ${W + 4} ${total + 26}`, role: 'img', 'aria-label': `${ix.name}: platform levels from top to bottom` });
    const defs = el('defs', {}, svg);
    const m = el('marker', { id: 'stk-arrow', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' }, defs);
    el('path', { d: 'M0 1L9 5L0 9z', class: 'ink-fill' }, m);
    let y = 0;
    ix.stacks.forEach((st) => { y = drawStack(svg, st, y) + 24; });
    fig.appendChild(svg);
    const cap = document.createElement('figcaption');
    cap.innerHTML = '<span class="fig-no">Fig. 2</span><span>Levels in order, top to bottom; not to scale. Arrows mark cross-platform changes. After MTR station layout drawings [<a href="#src-D01">D01</a>].</span>';
    fig.appendChild(cap);
    panel.appendChild(fig);

    const text = document.createElement('div');
    text.className = 'stack-text';
    const levels = ix.stacks.flatMap((st) => st.levels.filter((L) => !L.kind).map((L) => ({ st, L })));
    text.innerHTML = `
      <h3>${ix.name}</h3>
      <p class="opened">${ix.built.map(([l, y]) => `<span class="chip" style="--c:${LINES[l].color}"><i></i>${LINES[l].short} ${y}</span>`).join(' ')}</p>
      <p class="lede">${ix.text}</p>
      <ol class="levels" aria-label="Platform levels">
        ${levels.map(({ st, L }) => `<li><span class="lv">${st.title ? `${st.title.split(' ')[0]} ` : ''}${L.lv}</span><span>${describe(L)}</span></li>`).join('')}
      </ol>
      <p>Source: MTR station layout drawings [<a href="#src-D01">D01</a>].</p>`;
    panel.appendChild(text);
  }

  show(0, false);
}
