// The film player: a deterministic timeline of SVG scenes.
// Every scene is a pure function of time, so scrubbing is exact and the
// reduced-motion path can show settled key frames instead of motion.
import { el, mmss, frameLoop, prefersReducedMotion, strataDefs, clamp } from './draw.js';
import { CHAPTERS } from './film-scenes.js';

const FADE = 0.7; // seconds of dip-to-stage between chapters

export function initFilm(root) {
  const svg = root.querySelector('.film-stage svg');
  const poster = root.querySelector('.film-poster');
  const capWhen = root.querySelector('.film-cap .when');
  const capTxt = root.querySelector('.film-cap .txt');
  const playBtn = root.querySelector('[data-film-play]');
  const restartBtn = root.querySelector('[data-film-restart]');
  const scrub = root.querySelector('.scrub input');
  const scrubWrap = root.querySelector('.scrub');
  const timeOut = root.querySelector('.film-time');
  const chapterList = root.querySelector('.film-chapters');
  const transcript = root.querySelector('.transcript-body');

  svg.textContent = '';
  strataDefs(svg, 'f');
  const W = 1600, H = 900;

  let acc = 0;
  const chapters = CHAPTERS.map((c, i) => {
    const g = el('g', { class: 'scene', 'data-scene': c.id }, svg);
    g.style.display = 'none';
    const render = c.setup(g, { W, H, prefix: 'f' });
    const ch = { ...c, index: i, start: acc, g, render };
    acc += c.dur;
    return ch;
  });
  const total = acc;
  scrub.max = String(Math.round(total));
  scrub.step = '1';

  // ---- chapter buttons, scrub ticks, transcript ----
  chapterList.textContent = '';
  chapters.forEach((c) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = `<span class="y">${c.when}</span><span class="n">${c.title}</span>`;
    b.addEventListener('click', () => {
      seek(c.start + 0.01);
      if (!playing && hasStarted && !reduced) play();
      if (!hasStarted) startFromPoster(!reduced); // a chapter chosen before starting plays from there
    });
    c.button = b;
    li.appendChild(b);
    chapterList.appendChild(li);

    if (c.start > 0) {
      const tick = document.createElement('span');
      tick.className = 'tick';
      tick.style.left = `${(c.start / total) * 100}%`;
      scrubWrap.appendChild(tick);
    }
  });

  if (transcript) {
    transcript.textContent = '';
    chapters.forEach((c) => {
      const s = document.createElement('section');
      s.innerHTML = `<h3><span class="y">${c.when}</span>${c.title}</h3>` +
        c.caps.map(([, txt]) => `<p>${txt}</p>`).join('');
      transcript.appendChild(s);
    });
    const refs = document.createElement('p');
    refs.className = 'ref';
    refs.innerHTML = 'Sources: ' + ['L01', 'L03', 'L04', 'L05', 'L10', 'C01', 'C02', 'C05', 'C07', 'C10', 'D02', 'D03', 'D06', 'D07'].map((r) => `<a href="#src-${r}">${r}</a>`).join(', ');
    transcript.appendChild(refs);
  }

  // ---- state ----
  let t = 0;
  let playing = false;
  let hasStarted = false;
  let reduced = prefersReducedMotion();
  let lastCap = '';
  let lastChapter = -1;

  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener?.('change', () => { reduced = mq.matches; render(); });

  const loop = frameLoop((dt) => {
    if (!playing) return;
    // In reduced-motion mode the film advances in held frames: time still
    // passes (so captions can be read), but each frame is a settled still.
    t += dt;
    if (t >= total) {
      t = total;
      pause();
      setPlayIcon('replay');
    }
    render();
  });

  function chapterAt(time) {
    let idx = 0;
    for (let i = 0; i < chapters.length; i++) if (time >= chapters[i].start) idx = i;
    return chapters[idx];
  }

  function captionIndex(c, local) {
    let k = 0;
    for (let i = 0; i < c.caps.length; i++) if (local >= c.caps[i][0]) k = i;
    return k;
  }

  function render() {
    const c = chapterAt(Math.min(t, total - 0.0001));
    let local = t - c.start;
    const k = captionIndex(c, local);

    let renderLocal = local;
    let opacity = 1;
    if (reduced) {
      // settle on the end state of the current caption's beat
      const next = c.caps[k + 1] ? c.caps[k + 1][0] : c.dur;
      renderLocal = Math.max(local, next - 0.05);
    } else if (playing) {
      // dip between chapters only while playing; a paused or scrubbed frame is always fully drawn
      opacity = Math.min(clamp(local / FADE), clamp((c.dur - local) / FADE));
      if (c.index === 0 && local < FADE) opacity = 1; // no fade-in from black on the very first frame
      if (c.index === chapters.length - 1 && local > c.dur - FADE) opacity = 1; // hold the final frame
    }

    if (c.index !== lastChapter) {
      chapters.forEach((x) => { x.g.style.display = x === c ? '' : 'none'; });
      chapters.forEach((x) => x.button.setAttribute('aria-current', x === c ? 'true' : 'false'));
      lastChapter = c.index;
    }
    c.g.style.opacity = opacity.toFixed(3);
    c.render(renderLocal, renderLocal / c.dur);

    const cap = c.caps[k][1];
    if (cap !== lastCap) {
      capTxt.innerHTML = cap;
      capWhen.textContent = c.when;
      lastCap = cap;
    }

    const pct = (t / total) * 100;
    scrubWrap.style.setProperty('--p', `${pct}%`);
    if (!dragging) scrub.value = String(Math.round(t));
    scrub.setAttribute('aria-valuetext', `${mmss(t)} of ${mmss(total)}, ${c.title}`);
    timeOut.innerHTML = `<b>${mmss(t)}</b> / ${mmss(total)}`;
  }

  function seek(time) {
    t = clamp(time, 0, total);
    if (t >= total && playing) pause();
    if (t >= total) setPlayIcon('replay');
    else if (playBtn.dataset.state === 'replay') setPlayIcon(playing ? 'pause' : 'play');
    render();
  }

  const ICONS = {
    play: '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M5 3.2v11.6L14.6 9z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M4.5 3h3v12h-3zM10.5 3h3v12h-3z" fill="currentColor"/></svg>',
    replay: '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M9 3.2a5.8 5.8 0 1 1-5.6 7.3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M2.4 2.6v4.6H7z" fill="currentColor"/></svg>',
  };
  function setPlayIcon(state) {
    playBtn.dataset.state = state;
    playBtn.innerHTML = ICONS[state];
    playBtn.setAttribute('aria-label', state === 'pause' ? 'Pause film' : state === 'replay' ? 'Play film again' : 'Play film');
  }

  function play() {
    if (t >= total) t = 0;
    playing = true;
    setPlayIcon('pause');
    loop.start();
  }
  function pause() {
    playing = false;
    loop.stop();
    if (t < total) setPlayIcon('play');
  }
  function toggle() { playing ? pause() : play(); }

  function startFromPoster(autoplay = true) {
    hasStarted = true;
    poster.hidden = true;
    if (autoplay) play();
    // bring the whole player (stage, caption, controls) into view
    root.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    playBtn.focus({ preventScroll: true });
  }

  poster.addEventListener('click', () => startFromPoster(true));
  // clicking the picture plays or pauses, and hands focus to the play button
  root.querySelector('.film-stage').addEventListener('click', (e) => {
    if (e.target.closest('.film-poster')) return;
    if (!hasStarted) return startFromPoster(true);
    toggle();
    playBtn.focus({ preventScroll: true });
  });
  playBtn.addEventListener('click', () => {
    if (!hasStarted) return startFromPoster(true);
    toggle();
  });
  restartBtn?.addEventListener('click', () => {
    if (!hasStarted) { hasStarted = true; poster.hidden = true; }
    seek(0);
    play();
  });

  let dragging = false;
  const stopDrag = () => { dragging = false; };
  scrub.addEventListener('pointerdown', () => { dragging = true; });
  ['pointerup', 'pointercancel'].forEach((ev) => window.addEventListener(ev, stopDrag));
  scrub.addEventListener('lostpointercapture', stopDrag);
  scrub.addEventListener('blur', stopDrag);
  scrub.addEventListener('input', () => {
    if (!hasStarted) { hasStarted = true; poster.hidden = true; }
    seek(Number(scrub.value));
  });

  // Keys work whenever focus is inside the player: Space/K play or pause,
  // arrows skip 5 s. Space on a focused button keeps its native meaning.
  root.addEventListener('keydown', (e) => {
    if (e.target.closest('select, textarea, summary, .transcript')) return;
    const onButton = !!e.target.closest('button');
    if (e.key === 'k' || e.key === 'K' || (e.key === ' ' && !onButton)) {
      e.preventDefault();
      if (!hasStarted) startFromPoster(true); else toggle();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      if (!hasStarted) {
        hasStarted = true;
        const hadFocus = document.activeElement === poster;
        poster.hidden = true;
        if (hadFocus) playBtn.focus({ preventScroll: true });
      }
      seek(t + (e.key === 'ArrowRight' ? 5 : -5));
    }
  });

  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) pause(); });

  if ('IntersectionObserver' in window) {
    // pause only when the stage goes from visible to hidden, so a late first
    // "not intersecting" record can't stop a film that has just started
    let wasVisible = false;
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (wasVisible && !en.isIntersecting && playing) pause();
        wasVisible = en.isIntersecting;
      }
    }, { threshold: 0.15 });
    io.observe(root.querySelector('.film-stage'));
  }

  setPlayIcon('play');
  // the poster frame: a settled moment from the first chapter
  t = 0;
  const posterAt = chapters[0].poster ?? chapters[0].dur * 0.5;
  const c0 = chapters[0];
  c0.g.style.display = '';
  chapters.forEach((x) => x.button.setAttribute('aria-current', x === c0 ? 'true' : 'false'));
  lastChapter = 0;
  c0.render(posterAt, posterAt / c0.dur);
  capWhen.textContent = c0.when;
  capTxt.innerHTML = c0.caps[0][1];
  lastCap = c0.caps[0][1];
  timeOut.innerHTML = `<b>${mmss(0)}</b> / ${mmss(total)}`;
  scrub.setAttribute('aria-valuetext', `0:00 of ${mmss(total)}`);

  root.dataset.ready = 'true';
  document.dispatchEvent(new CustomEvent('film:ready', { detail: { total } }));
  return { play, pause, seek, start: () => (hasStarted ? play() : startFromPoster(true)), get total() { return total; } };
}
