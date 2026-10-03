// Entry point. The opening drawing runs at once; heavier sections load when
// they come near the viewport (with a timer backstop, since observers can stall
// in hidden windows).
import { initCut } from './cut.js';

document.documentElement.classList.add('js');

// ---- navigation: mobile toggle + current-section marker ----
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }
  });
  const closeNav = () => { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); };
  [nav, toggle].forEach((n) => n.addEventListener('focusout', (e) => {
    if (nav.classList.contains('is-open') && !e.relatedTarget?.closest?.('.nav, .nav-toggle')) closeNav();
  }));
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('is-open') && !e.target.closest('.nav, .nav-toggle')) {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      toggle.focus();
    }
  });
}

const links = [...document.querySelectorAll('.nav a')];
const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
const hero = document.querySelector('.hero');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      links.forEach((a) => a.setAttribute('aria-current', a.getAttribute('href') === `#${en.target.id}` ? 'true' : 'false'));
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => io.observe(s));
  if (hero) io.observe(hero); // back at the top: no section is current
}

// ---- the opening drawing ----
const cut = document.querySelector('[data-cut]');
if (cut) initCut(cut);

// ---- lazy sections ----
let filmApi = null;
const lazy = [
  ['[data-film]', () => import('./film.js').then((m) => { filmApi = m.initFilm(document.querySelector('[data-film]')); return filmApi; })],
  ['[data-net]', () => import('./network.js').then((m) => m.initNetwork(document.querySelector('[data-net]')))],
  ['[data-m3]', () => import('./net3d.js').then((m) => m.initNet3D(document.querySelector('[data-m3]')))],
  ['[data-stacks]', () => import('./stacks.js').then((m) => m.initStacks(document.querySelector('[data-stacks]')))],
  ['[data-methods]', () => import('./methods.js').then((m) => m.initMethods(document.querySelector('[data-methods]')))],
  ['[data-sources]', () => import('./sources.js').then((m) => m.initSources(document.querySelector('[data-sources]')))],
];

const started = new Set();
function boot(sel, fn) {
  if (started.has(sel)) return;
  started.add(sel);
  fn().catch((err) => {
    console.error(`Could not start ${sel}`, err);
  });
}

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      const item = lazy.find(([sel]) => en.target.matches(sel));
      if (item) boot(...item);
      io.unobserve(en.target);
    }
  }, { rootMargin: '600px 0px' });
  lazy.forEach(([sel]) => { const n = document.querySelector(sel); if (n) io.observe(n); });
}
// backstop: start everything after the page settles, and when a hash is followed
const bootAll = () => lazy.forEach((item) => boot(...item));
window.addEventListener('load', () => setTimeout(bootAll, 1500), { once: true });
window.addEventListener('hashchange', bootAll, { once: true });
if (location.hash) bootAll();

// "Watch the film" brings the whole player into view and starts it
document.querySelector('[data-watch]')?.addEventListener('click', async (e) => {
  e.preventDefault();
  const film = document.querySelector('[data-film]');
  film.scrollIntoView({ block: 'start' });
  history.replaceState(null, '', '#film');
  boot(...lazy[0]);
  // wait for the scroll to settle (and the player to load) before starting,
  // so the off-screen auto-pause doesn't stop it straight away
  await new Promise((r) => {
    const done = () => { window.removeEventListener('scrollend', done); r(); };
    window.addEventListener('scrollend', done);
    setTimeout(done, 900);
  });
  for (let i = 0; i < 40 && !filmApi; i++) await new Promise((r) => setTimeout(r, 50));
  filmApi?.start();
});

// the film's real length, once known, replaces the "about 4 min" placeholders
document.addEventListener('film:ready', (e) => {
  const mins = Math.round(e.detail.total / 60);
  document.querySelectorAll('[data-film-length]').forEach((n) => {
    if (n.closest('.film-poster')) n.textContent = `${mins} min · silent, with captions`;
    else if (n.closest('.sheet-meta')) n.textContent = `${Math.floor(e.detail.total / 60)} min ${Math.round(e.detail.total % 60)} s`;
    else n.textContent = `${mins} min`;
  });
});
