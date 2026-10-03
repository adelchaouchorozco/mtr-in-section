// Line metadata. Colours are the values commonly used for MTR lines; MTR does
// not publish hex codes (see research/facts.md §1a).
export const LINES = {
  EAL: { name: 'East Rail Line', short: 'East Rail', color: 'var(--eal)', since: 1910, note: 'Built by the KCR; part of the MTR since 2007' },
  KTL: { name: 'Kwun Tong Line', short: 'Kwun Tong', color: 'var(--ktl)', since: 1979 },
  TWL: { name: 'Tsuen Wan Line', short: 'Tsuen Wan', color: 'var(--twl)', since: 1982 },
  ISL: { name: 'Island Line', short: 'Island', color: 'var(--isl)', since: 1985 },
  TCL: { name: 'Tung Chung Line', short: 'Tung Chung', color: 'var(--tcl)', since: 1998 },
  AEL: { name: 'Airport Express', short: 'Airport Express', color: 'var(--ael)', since: 1998 },
  TKL: { name: 'Tseung Kwan O Line', short: 'Tseung Kwan O', color: 'var(--tkl)', since: 2002 },
  TML: { name: 'Tuen Ma Line', short: 'Tuen Ma', color: 'var(--tml)', since: 2003, note: 'West Rail (2003) and Ma On Shan Rail (2004) were built by the KCR and joined as one line in 2021' },
  DRL: { name: 'Disneyland Resort Line', short: 'Disneyland', color: 'var(--drl)', since: 2005 },
  SIL: { name: 'South Island Line', short: 'South Island', color: 'var(--sil)', since: 2016 },
};
export const LINE_ORDER = ['EAL', 'KTL', 'TWL', 'ISL', 'TCL', 'AEL', 'TKL', 'TML', 'DRL', 'SIL'];

export const STRUCTURE = {
  elevated: { label: 'Elevated', long: 'Elevated, on a viaduct or above ground', color: 'var(--lv-up)', shape: 'up' },
  'at-grade': { label: 'At ground level', long: 'At ground level (including embankments and cuttings)', color: 'var(--lv-mid)', shape: 'square' },
  underground: { label: 'Underground', long: 'Underground', color: 'var(--lv-down)', shape: 'down' },
};
