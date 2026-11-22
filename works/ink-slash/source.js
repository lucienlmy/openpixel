// SPDX-License-Identifier: MIT
// Copyright (c) 2026 喵老弟 / MarkMFFF

// ===== 像素动效馆 core: indexed palette, clean primitives, sprite grids, pixel fonts =====
const W = 160, H = 96;
// ramps are listed light -> dark; every colour knows its ramp so LIGHT/DARK steps stay in hue
const RAMPS = {
  fire: ['#fffbe6', '#ffe36e', '#ffb22e', '#f4701d', '#d23a1f', '#8f1d24', '#4e1228'],
  smoke: ['#e4ddd6', '#b4aaa6', '#857c84', '#5a5463', '#3a3546', '#26222f'],
  ice: ['#f4ffff', '#c2f3ff', '#82d9f6', '#4aa4e2', '#2c67b9', '#1c3b7c'],
  water: ['#f6ffff', '#b2f0ff', '#5ec9f0', '#2f90d6', '#1f5aa8', '#153870'],
  elec: ['#ffffff', '#e8deff', '#b79eff', '#7d62f0', '#4c3bb9', '#2a2370'],
  holy: ['#fffef2', '#fff3ad', '#ffd85e', '#f2aa3c', '#c4702b', '#7a3f22'],
  leaf: ['#f2ffd2', '#bbf07c', '#72d04f', '#35a147', '#1e6c46', '#13403a'],
  void: ['#ffd2ff', '#ff70d8', '#c43dd6', '#7b2ba9', '#461a6f', '#25103f', '#0c0716'],
  earth: ['#ead0a2', '#c99c6b', '#9c6e49', '#6d4b36', '#45312b', '#2b201f'],
  blood: ['#ffd0c8', '#ff7a66', '#e83b3b', '#a8202f', '#5e1426'],
  skin: ['#ffe2c4', '#f2b088', '#c87657', '#8a4a3f'],
  // stage neutrals (blue-violet night)
  night: ['#5b5f86', '#44476a', '#33355a', '#262640', '#1c1b2e', '#141320', '#0b0a12'],
  stone: ['#a7a3b4', '#7d7a90', '#5a586e', '#403f54', '#2d2c3e', '#1f1e2c'],
  grass: ['#9cc46b', '#6a9a4c', '#46723f', '#2e4f36', '#1e3329'],
  // style palettes (batch 5): Game Boy, 1-bit, ink wash, synthwave, NES-like, papercut
  gb: ['#e0f8d0', '#88c070', '#346856', '#081820'],
  bit: ['#f4f1ea', '#121014'],
  inkw: ['#f3eee2', '#ddd5c4', '#aaa190', '#686256', '#2e2a26', '#141110'],
  syn: ['#fff36b', '#ff9a3c', '#ff3fa4', '#33e7ff', '#7b2fff', '#2b0f3a', '#140720'],
  nes: ['#fcfcfc', '#fcd8a8', '#f8b800', '#f83800', '#a80020', '#3cbcfc', '#0058f8', '#000000'],
  paper: ['#ffe39a', '#f9b347', '#ee7a33', '#c9442e', '#8e2a2c', '#4f1d2b', '#efe2c6', '#d6c4a0', '#a8916a'],
  // batch 6: ukiyo-e, vector phosphor, stained glass (lit / unlit), chalkboard, CCTV
  uk: ['#f2e6c8', '#dccba0', '#9cc0cc', '#4f7f9c', '#24456e', '#162a45', '#c4452f', '#2a2320'],
  vec: ['#eaffea', '#a2ff9c', '#46dc5e', '#1f923e', '#0e5226', '#062612', '#020c06'],
  glass: ['#fff4cf', '#f6c94a', '#e0452c', '#3a7be0', '#33b372', '#9a4fd0'],
  glassd: ['#5c5546', '#5e4d22', '#5a2118', '#1b2f5a', '#18442f', '#3b2152'],
  chalk: ['#2f4a3c', '#3c5a4a', '#f2f2ea', '#b7c6bb', '#ffd36b', '#ff9a9a', '#8fd0ff', '#1f3328', '#9a7448', '#5e4630'],
  cctv: ['#e8f2e2', '#bccbb6', '#8e9f8b', '#647563', '#425043', '#283129', '#141a16'],
  // batch 7: Van Gogh night, blueprint, thermal camera, mosaic
  vg: ['#fff6b0', '#f4d24c', '#d99a22', '#a9d0ea', '#6a9ed0', '#3a69ad', '#24468a', '#182f62', '#0f1d3c', '#1c2a16', '#34482a'],
  bp: ['#eef6ff', '#b4d4f2', '#6d9ed6', '#3a6eab', '#22518f', '#173c72'],
  therm: ['#ffffff', '#fff27a', '#ffb02e', '#ff5a1e', '#d0204a', '#7a1a7a', '#2c1262', '#0b0524'],
  mos: ['#3a342c', '#f2e2b4', '#e2a63c', '#c4542c', '#7e2a26', '#2f6f86', '#1f3e64', '#ece4d2', '#5f8a4a', '#18202c', '#c9b48a'],
  ink: ['#0b0a12'],
  white: ['#ffffff'],
};
const PAL = [[0, 0, 0, 0]], C = {}, RAMP_OF = [null], POS_OF = [0];
for (const k in RAMPS) {
  RAMPS[k] = RAMPS[k].map((hx, i) => {
    const id = PAL.length;
    PAL.push([parseInt(hx.slice(1, 3), 16), parseInt(hx.slice(3, 5), 16), parseInt(hx.slice(5, 7), 16), 255]);
    RAMP_OF.push(k); POS_OF.push(i); C[k + i] = id; return id;
  });
}
C.ink = C.ink0; C.white = C.white0;
const R = RAMPS; // R.fire[0] = palette index of the brightest fire colour
// tinted copies of the stage neutrals: light pools and flashes stay in palette without dithering
const TINT_HEX = { warm: '#ff8a3a', cool: '#6cc4ff', violet: '#a184ff', gold: '#ffd36a', green: '#86f0a0', magenta: '#ff5ad2', red: '#ff3a3a' };
const TINT_K = [.17, .32, .48];
const TINT_BASE = ['night', 'stone', 'earth', 'grass', 'smoke', 'water'];
const TINTED = {}, TINT_INFO = []; // TINTED[name][base] = [id1,id2,id3]; TINT_INFO[id] = [name, base, lvl]
for (const nm in TINT_HEX) {
  TINTED[nm] = {}; const t = [1, 3, 5].map(i => parseInt(TINT_HEX[nm].slice(i, i + 2), 16));
  for (const rk of TINT_BASE) for (const base of RAMPS[rk]) {
    TINTED[nm][base] = TINT_K.map((k, lvl) => {
      const p = PAL[base], id = PAL.length;
      PAL.push([0, 1, 2].map(c => Math.round(255 - (255 - p[c]) * (255 - t[c] * k) / 255)).concat(255));
      RAMP_OF.push(rk); POS_OF.push(POS_OF[base]); TINT_INFO[id] = [nm, base, lvl]; return id;
    });
  }
}
// LIGHT/DARK step one colour along its own ramp
const LIGHT = new Uint16Array(1024), DARK = new Uint16Array(1024);
for (let i = 1; i < PAL.length; i++) {
  if (TINT_INFO[i]) { LIGHT[i] = i; DARK[i] = TINT_INFO[i][1]; continue }
  const r = RAMPS[RAMP_OF[i]], p = POS_OF[i];
  LIGHT[i] = r[Math.max(0, p - 1)]; DARK[i] = r[Math.min(r.length - 1, p + 1)];
}

const TINTS = {};
// one light step of a tint: neutral -> level 1, level n -> n+1; effect colours are left alone
function tintStep(nm) {
  if (TINTS[nm]) return TINTS[nm];
  const t = new Uint16Array(1024); for (let i = 0; i < 1024; i++) t[i] = i;
  for (const b in TINTED[nm]) { const ids = TINTED[nm][b]; t[b] = ids[0]; t[ids[0]] = ids[1]; t[ids[1]] = ids[2]; t[ids[2]] = ids[2] }
  return TINTS[nm] = t;
}

// ---- maths ----
const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a) * t;
const seg = (f, a, b) => clamp((f - a) / (b - a), 0, 1); // progress of f through [a,b]
const eo = t => 1 - (1 - t) * (1 - t), eo3 = t => 1 - (1 - t) ** 3, ei = t => t * t, eio = t => t < .5 ? 2 * t * t : 1 - 2 * (1 - t) ** 2;
const pmod = (a, n) => ((a % n) + n) % n;
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296 } }
const TAU = Math.PI * 2;

// ---- surface ----
function Surface(w, h) {
  const g = { W: w, H: h, buf: new Uint16Array(w * h) };
  const B = g.buf;
  g.clear = c => B.fill(c || 0);
  g.get = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? 0 : B[y * w + x];
  g.px = (x, y, c) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < w && y < h) B[y * w + x] = c };
  g.rect = (x, y, rw, rh, c) => { x = Math.round(x); y = Math.round(y); const tb = c instanceof Uint16Array; for (let j = Math.max(0, y); j < Math.min(h, y + rh); j++)for (let i = Math.max(0, x); i < Math.min(w, x + rw); i++)B[j * w + i] = tb ? c[B[j * w + i]] : c };
  g.hline = (x0, x1, y, c) => { y = Math.round(y); if (y < 0 || y >= h) return; x0 = Math.max(0, Math.round(x0)); x1 = Math.min(w - 1, Math.round(x1)); const tb = c instanceof Uint16Array; for (let i = x0; i <= x1; i++)B[y * w + i] = tb ? c[B[y * w + i]] : c };
  // generic mask fill over bbox, sampling pixel centres
  g.mask = (x0, y0, x1, y1, fn, c) => {
    x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0)); x1 = Math.min(w - 1, Math.ceil(x1)); y1 = Math.min(h - 1, Math.ceil(y1));
    const tb = c instanceof Uint16Array;
    for (let y = y0; y <= y1; y++)for (let x = x0; x <= x1; x++) { const r = fn(x + .5, y + .5); if (r) { const j = y * w + x; B[j] = r === true ? (tb ? c[B[j]] : c) : r } }
  };
  g.disc = (cx, cy, r, c) => { if (r <= 0) return; if (r < .75) { g.px(cx, cy, c); return } const rr = r * r; g.mask(cx - r - 1, cy - r - 1, cx + r + 1, cy + r + 1, (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= rr, c) };
  g.ell = (cx, cy, rx, ry, c) => { if (rx <= 0 || ry <= 0) return; g.mask(cx - rx - 1, cy - ry - 1, cx + rx + 1, cy + ry + 1, (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1, c) };
  g.ring = (cx, cy, r, th, c) => { const a = r * r, b = Math.max(0, r - th) ** 2; g.mask(cx - r - 1, cy - r - 1, cx + r + 1, cy + r + 1, (x, y) => { const d = (x - cx) ** 2 + (y - cy) ** 2; return d <= a && d > b }, c) };
  // elliptical ring, optionally only between angles a0..a1 (radians, y down)
  // continuous 1px ellipse outline (optionally an arc a0..a1)
  g.ellLine = (cx, cy, rx, ry, c, a0 = 0, a1 = TAU) => {
    if (a1 < a0) a1 += TAU; const n = Math.max(12, Math.ceil((rx + ry) * (a1 - a0) * .9)); let px = null, py = null;
    for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n, x = Math.round(cx + Math.cos(a) * rx - .5), y = Math.round(cy + Math.sin(a) * ry - .5); if (px !== null && (x !== px || y !== py)) g.line(px, py, x, y, c); else if (px === null) g.px(x, y, c); px = x; py = y }
  };
  g.ellRing = (cx, cy, rx, ry, th, c, a0, a1) => {
    if (th <= 1.01) { g.ellLine(cx, cy, rx - .5, ry - .5, c, a0 === undefined ? 0 : a0, a1 === undefined ? TAU : a1); return }
    const ix = Math.max(.01, rx - th), iy = Math.max(.01, ry - th * ry / rx);
    g.mask(cx - rx - 1, cy - ry - 1, cx + rx + 1, cy + ry + 1, (x, y) => {
      const dx = x - cx, dy = y - cy;
      if ((dx / rx) ** 2 + (dy / ry) ** 2 > 1 || (dx / ix) ** 2 + (dy / iy) ** 2 <= 1) return false;
      if (a0 === undefined) return true;
      const a = pmod(Math.atan2(dy / ry, dx / rx) - a0, TAU); return a <= pmod(a1 - a0, TAU);
    }, c);
  };
  g.crescent = (cx, cy, r, hx, hy, hr, c) => { const rr = r * r, hh = hr * hr; g.mask(cx - r - 1, cy - r - 1, cx + r + 1, cy + r + 1, (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= rr && (x - hx) ** 2 + (y - hy) ** 2 > hh, c) };
  g.poly = (pts, c) => {
    let y0 = 1e9, y1 = -1e9; for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]) }
    y0 = Math.max(0, Math.floor(y0)); y1 = Math.min(h - 1, Math.ceil(y1));
    for (let y = y0; y <= y1; y++) {
      const yc = y + .5, xs = [];
      for (let i = 0, n = pts.length; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; if ((a[1] <= yc) !== (b[1] <= yc)) xs.push(a[0] + (yc - a[1]) / (b[1] - a[1]) * (b[0] - a[0])) }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) { const xa = Math.max(0, Math.round(xs[k])), xb = Math.min(w, Math.round(xs[k + 1])); if (c instanceof Uint16Array) for (let x = xa; x < xb; x++)B[y * w + x] = c[B[y * w + x]]; else for (let x = xa; x < xb; x++)B[y * w + x] = c }
    }
  };
  g.line = (x0, y0, x1, y1, c) => {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
    for (; ;) { g.px(x0, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx } if (e2 <= dx) { e += dx; y0 += sy } }
  };
  // capsule from a to b, radius r
  g.thick = (x0, y0, x1, y1, r, c) => {
    if (r < .6) { g.line(x0, y0, x1, y1, c); return }
    const vx = x1 - x0, vy = y1 - y0, L = vx * vx + vy * vy || 1e-6, rr = r * r;
    g.mask(Math.min(x0, x1) - r - 1, Math.min(y0, y1) - r - 1, Math.max(x0, x1) + r + 1, Math.max(y0, y1) + r + 1, (x, y) => { let t = ((x - x0) * vx + (y - y0) * vy) / L; t = t < 0 ? 0 : t > 1 ? 1 : t; return (x - x0 - vx * t) ** 2 + (y - y0 - vy * t) ** 2 <= rr }, c);
  };
  // polyline with width interpolated along length (tapered strokes): pts [[x,y],...], radius r(t) function or [r0,r1]
  g.taper = (pts, rf, c) => {
    if (Array.isArray(rf)) { const [a, b] = rf; rf = t => a + (b - a) * t }
    let L = 0; const acc = [0]; for (let i = 1; i < pts.length; i++) { L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); acc.push(L) }
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], ra = rf(acc[i - 1] / (L || 1)), rb = rf(acc[i] / (L || 1)), steps = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1])));
      for (let s = 0; s < steps; s++) { const t0 = s / steps, t1 = (s + 1) / steps; g.thick(lerp(a[0], b[0], t0), lerp(a[1], b[1], t0), lerp(a[0], b[0], t1), lerp(a[1], b[1], t1), Math.max(0, lerp(ra, rb, (t0 + t1) / 2)), c) }
    }
  };
  // teardrop / flame tongue: round head of radius r at (cx,cy), tail of length len pointing to angle ang, profile exponent p
  g.drop = (cx, cy, r, len, ang, c, p) => {
    p = p || 1; const ux = Math.cos(ang), uy = Math.sin(ang), rr = r * r, ext = r + len + 1;
    g.mask(cx - ext, cy - ext, cx + ext, cy + ext, (x, y) => {
      const dx = x - cx, dy = y - cy; if (dx * dx + dy * dy <= rr) return true;
      const u = dx * ux + dy * uy, v = -dx * uy + dy * ux; if (u < 0 || u > len) return false;
      return Math.abs(v) <= r * Math.pow(1 - u / len, p);
    }, c);
  };
  // banded sphere / puff: ramp is light->dark list of indices; light from (lx,ly) unit dir
  g.blob = (cx, cy, r, ramp, lx = -.6, ly = -.8, k = .2) => {
    const n = ramp.length;
    for (let i = 0; i < n; i++) { const rr = r * (1 - i * (k + .05)); if (rr <= .4) break; g.disc(cx + lx * r * i * k, cy + ly * r * i * k, rr, ramp[n - 1 - i]) }
  };
  // light pool: repeatedly applies a remap table inside nested ellipses (banded, no dither)
  g.glow = (cx, cy, rx, ry, tables) => {
    tables.forEach((t, i) => {
      const s = 1 - i / tables.length, ax = rx * s, ay = ry * s; if (ax < .5 || ay < .5) return;
      const x0 = Math.max(0, Math.floor(cx - ax)), x1 = Math.min(w - 1, Math.ceil(cx + ax)), y0 = Math.max(0, Math.floor(cy - ay)), y1 = Math.min(h - 1, Math.ceil(cy + ay));
      for (let y = y0; y <= y1; y++)for (let x = x0; x <= x1; x++) { const d = ((x + .5 - cx) / ax) ** 2 + ((y + .5 - cy) / ay) ** 2; if (d <= 1) { const j = y * w + x; B[j] = t[B[j]] } }
    });
  };
  g.remap = t => { for (let i = 0; i < B.length; i++)B[i] = t[B[i]] };
  g.remapRect = (x, y, rw, rh, t) => { for (let j = Math.max(0, y); j < Math.min(h, y + rh); j++)for (let i = Math.max(0, x); i < Math.min(w, x + rw); i++)B[j * w + i] = t[B[j * w + i]] };
  // sprite: {w,h,d:Uint8Array}; opts flip, flash (colour for every opaque pixel), map (remap table)
  g.spr = (s, x, y, o = {}) => {
    x = Math.round(x); y = Math.round(y);
    for (let j = 0; j < s.h; j++)for (let i = 0; i < s.w; i++) {
      const c = s.d[j * s.w + (o.flip ? s.w - 1 - i : i)]; if (!c) continue;
      g.px(x + i, y + j, o.flash || (o.map ? o.map[c] : c));
    }
  };
  // copy another surface (transparent 0)
  g.blit = (s, ox = 0, oy = 0, map) => { for (let y = 0; y < s.H; y++)for (let x = 0; x < s.W; x++) { const c = s.buf[y * s.W + x]; if (c) g.px(x + ox, y + oy, map ? map[c] : c) } };
  // tidy: remove orphan pixels and fill pin holes (keeps clusters clean)
  g.tidy = (x0 = 0, y0 = 0, x1 = w - 1, y1 = h - 1) => {
    const src = B.slice();
    for (let y = Math.max(1, y0); y <= Math.min(h - 2, y1); y++)for (let x = Math.max(1, x0); x <= Math.min(w - 2, x1); x++) {
      const j = y * w + x, c = src[j], n = [src[j - 1], src[j + 1], src[j - w], src[j + w]];
      let same = 0; for (const q of n) if (q === c) same++;
      if (same === 0) { // orphan: take most common neighbour
        let best = n[0], bc = 0; for (const q of n) { let k = 0; for (const r of n) if (r === q) k++; if (k > bc) { bc = k; best = q } }
        if (bc >= 2) B[j] = best;
      }
    }
  };
  return g;
}

// ---- sprite grids: rows of chars, key maps char -> palette index ----
function grid(rows, key) {
  if (typeof rows === 'string') rows = rows.replace(/^\n+|\s+$/g, '').split('\n').map(r => r.replace(/^\s*\|?/, '').replace(/\|.*$/, ''));
  const h = rows.length, w = Math.max(...rows.map(r => r.length)), d = new Uint8Array(w * h);
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const ch = r[i]; if (ch !== '.' && ch !== ' ' && key[ch]) d[j * w + i] = key[ch] } });
  return { w, h, d };
}
// add 1px outline around opaque pixels
function outline(s, col) {
  const w = s.w + 2, h = s.h + 2, d = new Uint8Array(w * h);
  for (let j = 0; j < s.h; j++)for (let i = 0; i < s.w; i++)d[(j + 1) * w + i + 1] = s.d[j * s.w + i];
  const o = d.slice();
  for (let j = 0; j < h; j++)for (let i = 0; i < w; i++)if (!d[j * w + i]) {
    if ((i > 0 && d[j * w + i - 1]) || (i < w - 1 && d[j * w + i + 1]) || (j > 0 && d[(j - 1) * w + i]) || (j < h - 1 && d[(j + 1) * w + i])) o[j * w + i] = col;
  }
  return { w, h, d: o };
}


// ===== shared stages, sprites and effect helpers =====
// --- cached stages (drawn once, copied every frame) ---
function cached(fn) { let b = null; return g => { if (!b) { const s = Surface(W, H); fn(s); b = s.buf.slice() } g.buf.set(b) } }

// whole-screen flash: n light steps of a tint
function flash(g, nm, n) { const t = tintStep(nm); for (let i = 0; i < n; i++) g.remap(t) }

// deterministic particle set
function parts(seed, n, mk) { const r = rng(seed), a = []; for (let i = 0; i < n; i++)a.push(mk(r, i)); return a }

// ---- sprites ----
const SPR = {};
SPR.dummy = outline(grid(`
....4444....
...422214...
..42211124..
..42111224..
..42522524..
..42222234..
..42255234..
...423334...
....4444....
.....55.....
..44444444..
.4211112234.
.4rrrrrrrr4.
.4211222334.
.4222223334.
.4rrrrrrrr4.
.4222223334.
..42222334..
...444444...
.....55.....
.....55.....
.....55.....
.....55.....
.....55.....
...555555...`, { 1: C.earth0, 2: C.earth1, 3: C.earth2, 4: C.earth3, 5: C.earth4, r: C.blood3 }), C.ink);
// little hero: scarf swordsman, 3 poses (stand / dash / strike), drawn facing right
const HK = { o: C.ink, h: C.night3, H: C.night2, s: C.skin1, S: C.skin2, r: C.blood2, R: C.blood3, c: C.ice3, C: C.ice4, b: C.earth3, B: C.earth4, w: C.white, e: C.ink };
SPR.hero = {
  stand: grid(`
.....hhhh.....
....hHHHhh....
...hHhhhhhh...
...hhsssshh...
...hsssesh....
....sSssS.....
..rrRcccc.....
.rRRrcCccc....
..R.ccCcCcs...
....ccCCcCs...
....bbbbbb....
....cc..cC....
....cc..cC....
....CC..CC....
...BBB..BBB...`, HK),
  dash: grid(`
...........hhhh...
..........hHHHhh..
.........hHhhhhhh.
rrrRR....hhsssshh.
.RRrrrr..hsssesh..
......rrrcSssS....
........cccccc....
.......ccCCcccsss.
......ccCCCcc.....
.....bbbbbb.......
....cc....cC......
...cC......cC.....
..CC........CC....
.BBB.........BBB..`, HK),
  strike: grid(`
.....hhhh.........
....hHHHhh........
...hHhhhhhh.......
...hhsssshh.......
...hsssesh........
..r.sSssS.........
.rRrcccccsssss....
rRR.cCccc.........
....cCCcC.........
....ccCCc.........
....bbbbbb........
...cc....cC.......
..cC......cC......
..CC.......CC.....
.BBB.......BBB....`, HK),
};
for (const k in SPR.hero) SPR.hero[k] = outline(SPR.hero[k], C.ink);


const VFX=[];

// grids hold small key numbers (Uint8); a map table turns them into palette indices of any ramp
const kmap = cols => { const m = new Uint16Array(1024); cols.forEach((c, i) => m[i + 1] = c); return m };
const rampMap = (ramp, fn) => { const m = new Uint16Array(1024); for (let i = 0; i < 1024; i++)m[i] = i; ramp.forEach((c, i) => m[c] = fn(i)); return m };



// ---------- 水墨斩 ----------
const IK = R.inkw; // 0 paper .. 5 deepest ink
const INK_ST = cached(g => {
  g.clear(IK[0]);
  // two misty ridges: a wash band that stops (mist below), no gradients
  for (let x = 0; x < W; x++) { const y = Math.round(40 + 7 * Math.sin(x * .045 + .6) + 3 * Math.sin(x * .13)); for (let k = 0; k < 7; k++) g.px(x, y + k, k < 2 ? IK[2] : IK[1]) }
  for (let x = 96; x < W; x++) { const y = Math.round(54 + 5 * Math.sin(x * .07 + 2) - (x - 96) * .08); for (let k = 0; k < 4; k++) g.px(x, y + k, k ? IK[2] : IK[3]) }
  // dry grass strokes along the ground
  for (const [x, y, h] of [[10, 92, 6], [16, 94, 9], [22, 93, 5], [128, 93, 7], [134, 94, 10], [150, 92, 6]]) g.taper([[x, y], [x + 2, y - h * .6], [x + 4, y - h]], [1, 0], IK[3]);
  g.hline(0, W - 1, 95, IK[2]);
});
function inkStalk(g, x, y0, y1, w, dark, mid, cutFn) {
  for (let y = Math.max(0, Math.floor(y0)); y < Math.min(H, y1); y++) {
    const node = pmod(y - 6, 15) === 0, ww = node ? w + 1 : w;
    for (let i = 0; i < ww; i++) { const px = Math.round(x - (node ? .5 : 0)) + i; if (cutFn && !cutFn(px, y)) continue; g.px(px, y, node ? dark : i === 0 ? mid : i === ww - 1 ? dark : mid === dark ? dark : (i === 1 ? mid : dark)) }
  }
}
function inkLeaves(g, x, y, dir, c, n = 3) { for (let k = 0; k < n; k++) { const a = dir > 0 ? .25 + k * .35 : Math.PI - .25 - k * .35; g.drop(x + Math.cos(a) * 1.5, y + k * 2, 1.6, 9 + k * 2, a, c, 1.3) } }
const INK_FIG = grid(`
.....aaaa.....
..aaaaaaaaaa..
aaaaaaaaaaaaaa
.....abba.....
.....aaaa.....
....aaaaaa....
...aaaaaaaa...
..aaaaaaaaaa..
.aaaaaaaaaaac.
aa.aaaaaaa..cc
....aaaaa....c
....aaaaa.....
...aaa.aaa....
..aaa...aaa...
.aaa.....aa...
aaa.......aa..`, { a: 1, b: 2, c: 3 });
const INK_FIGK = kmap([IK[5], IK[2], IK[3]]);
const INK_SEAL = grid(`
#.#.#..#
###.#.#.
#.#.###.
###.#.#.
.#..#.#.
###.###.
.#..#.#.
.#..#..#`, { '#': 1 });
const INK_P = [[14, 80], [60, 30], [156, 34]], inkAt = u => { const a = (1 - u) ** 2, b = 2 * u * (1 - u), c = u * u; return [a * INK_P[0][0] + b * INK_P[1][0] + c * INK_P[2][0], a * INK_P[0][1] + b * INK_P[1][1] + c * INK_P[2][1]] };
const INK_DRY = [.62, .3, .5, .86, .95, .58, .36, .46, .72];
const INK_SPL = parts(411, 12, r => ({ u: .6 + r() * .45, v: (r() - .5) * 26, r: .7 + r() * 1.8 }));
const INK_FADE = lv => rampMap(IK, i => IK[Math.max(0, i - lv)]);
const INK_FADES = [0, 1, 2, 3, 4, 5].map(INK_FADE);
const INK_ROT = Surface(W, H);
VFX.push({
  id: 'inkslash', cat: 'style', name: '水墨斩', n: 48, fps: 12, stage: INK_ST,
  brief: '宣纸上的水墨：远山只是一笔淡墨，斗笠刀客一闪而过，留下一道带飞白的浓墨刀痕，墨点甩出去，竹子沿斜口滑开倒下，最后盖一方朱印，整幅画再慢慢淡回纸色',
  desc: '只用六档墨色加一点朱红。刀痕是一笔沿弧线走的笔触，中间粗两头细；笔触横向分成九条“笔毛”，每条在不同的位置开始干，干掉以后断断续续，就是书法里的飞白。远山是带状的淡墨，下沿直接断开，留白当雾。竹子被斩断的上半截先沿斜切口滑三像素，再绕着底端倒下去。结尾整张画一档一档变淡，开头再一档一档洇出来，所以循环接缝看起来像墨在纸上出现又消失。',
  notes: ['刀客只出现两次：出刀前在左边，出刀后背身落在右边，中间那一帧只有墨痕', '墨点按笔触方向甩出，大小不一', '朱印用三帧盖下去：大、略大、原大'],
  fx(g, f, bg) {
    if (bg !== 'stage') INK_ST(g);
    const cut = f >= 12, cutY = x => 42 - (x - 80) * .32, slideT = f < 13 ? 0 : Math.min(3, (f - 12)), fallT = seg(f, 15, 29), ang = -1.35 * ei(fallT) - (f >= 29 && f < 31 ? [.06, 0][f - 29] : 0);
    // back stalks + leaves
    inkStalk(g, 58, -2, 96, 3, IK[2], IK[1]); inkLeaves(g, 59, 10, 1, IK[2]); inkLeaves(g, 58, 39, -1, IK[1]);
    inkStalk(g, 106, -2, 96, 3, IK[3], IK[2]); inkLeaves(g, 107, 22, 1, IK[3]); inkLeaves(g, 106, 52, -1, IK[2], 2);
    // main stalk: bottom part always, top part either attached or sliding/falling
    inkStalk(g, 82, -2, 96, 4, IK[5], IK[3], cut ? (x, y) => y >= cutY(x) : null);
    if (!cut) { inkLeaves(g, 84, 16, 1, IK[4]); inkLeaves(g, 82, 28, -1, IK[4], 2) }
    else {
      INK_ROT.clear(0); inkStalk(INK_ROT, 82, -2, 50, 4, IK[5], IK[3], (x, y) => y < cutY(x)); inkLeaves(INK_ROT, 84, 16, 1, IK[4]); inkLeaves(INK_ROT, 82, 28, -1, IK[4], 2);
      const sx = -slideT * .9, sy = slideT * .45, px = 80, py = 42, ca = Math.cos(ang), sa = Math.sin(ang);
      for (let y = 0; y < H; y++)for (let x = 0; x < W; x++) { const dx = x - px - sx, dy = y - py - sy, ux = ca * dx + sa * dy + px, uy = -sa * dx + ca * dy + py, c = INK_ROT.get(Math.round(ux), Math.round(uy)); if (c && y < 95) g.px(x, y, c) }
    }
    // swordsman: before at left, after at right (back turned)
    if (f < 11) g.spr(INK_FIG, 22, 78, { map: INK_FIGK, flip: true });
    else if (f >= 12) g.spr(INK_FIG, 126, 78, { map: INK_FIGK });
    // the stroke with dry-brush lanes
    const rev = f < 10 ? 0 : f === 10 ? .3 : f === 11 ? .78 : 1, ink = f < 30 ? 0 : Math.min(3, Math.floor((f - 30) / 4));
    if (rev > 0 && f < 44) {
      const P0 = INK_P[0], P1 = INK_P[1], P2 = INK_P[2];
      for (let u = 0; u <= rev; u += 1 / 260) {
        const a = (1 - u) ** 2, b = 2 * u * (1 - u), c = u * u, x = a * P0[0] + b * P1[0] + c * P2[0], y = a * P0[1] + b * P1[1] + c * P2[1];
        const tx = 2 * (1 - u) * (P1[0] - P0[0]) + 2 * u * (P2[0] - P1[0]), ty = 2 * (1 - u) * (P1[1] - P0[1]) + 2 * u * (P2[1] - P1[1]), tl = Math.hypot(tx, ty), nx = -ty / tl, ny = tx / tl;
        const w = (.6 + 4.4 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.05)), .9)) * (1 + .14 * Math.sin(u * 23) + .08 * Math.sin(u * 61)) + (u < .05 ? 2.4 * (1 - u / .05) : 0);
        for (let v = -w; v <= w; v += .5) {
          const lane = Math.min(8, Math.floor((v / w + 1) / 2 * 9)), dry = INK_DRY[lane];
          if (u > dry && pmod(Math.floor(u * 70 + lane * 5), 4) > 0) continue;
          const e = Math.abs(v) / w, col = IK[Math.max(0, (e > .75 ? 3 : e > .3 ? 4 : 5) - ink)];
          g.px(x + nx * v, y + ny * v, col);
        }
      }
      if (f >= 12) for (const s of INK_SPL) { const [bx, by] = inkAt(Math.min(1, s.u)), x = bx + (s.u - .6) * 34, y = by + s.v * .35 - (s.u - .6) * 6; g.disc(x, y, s.r, IK[Math.max(1, 5 - ink)]) }
    }
    // vermilion seal
    if (f >= 20 && f < 44) { const k = f === 20 ? 1.4 : f === 21 ? 1.12 : 1, w = 12 * k, h = 13 * k, x = 140 - w / 2, y = 74 - h / 2; g.rect(x, y, w, h, R.blood[f > 38 ? 1 : 2]); if (k === 1) g.spr(INK_SEAL, x + 2, y + 2, { map: kmap([IK[0]]) }) }
    // whole painting soaks in and fades away
    const lv = f < 4 ? 4 - f : f >= 43 ? Math.min(5, f - 42) : 0; if (lv) g.remap(INK_FADES[lv]);
  }
});

const GL_PAT = ['313', '424', '232', '141', '313', '424', '232', '111'];
const glIn = (x, y) => (y >= 36 && y < 66 && x >= 58 && x < 102) || (y < 36 && y >= 8 && (x - 84) ** 2 + (y - 36) ** 2 < 676 && (x - 76) ** 2 + (y - 36) ** 2 < 676);
// per-pixel pane info: id (0 = lead/stone), colour slot, pane centre y, local corner flag
const GL_ID = new Int16Array(W * H), GL_C = new Uint8Array(W * H), GL_CY = new Float32Array(W * H), GL_HI = new Uint8Array(W * H);
for (let y = 0; y < H; y++)for (let x = 0; x < W; x++) {
  if (!glIn(x + .5, y + .5)) continue; const j = y * W + x;
  if (y >= 36 && y < 40) continue; // transom
  if (y >= 40) { if (x >= 79 && x <= 80) continue; const L = x < 80 ? 0 : 1, x0 = L ? 82 : 60, c = Math.floor((x - x0) / 6), r = Math.floor((y - 40) / 7 * 1); if (x < x0 || c > 2) continue; const lx = x - x0 - c * 6, ly = y - 40 - r * 7; if (lx === 0 || ly === 0) continue; GL_ID[j] = 1 + L * 100 + r * 3 + c; GL_C[j] = +GL_PAT[Math.min(7, r)][c]; GL_CY[j] = 40 + r * 7 + 3.5; GL_HI[j] = lx <= 2 && ly <= 1 ? 1 : 0; continue }
  const d = Math.hypot(x + .5 - 80, y + .5 - 25), a = Math.atan2(y + .5 - 25, x + .5 - 80);
  if (Math.abs(d - 3.6) < .6 || Math.abs(d - 9.6) < .6) continue;
  if (d < 3.6) { GL_ID[j] = 300; GL_C[j] = 1; GL_CY[j] = 25; GL_HI[j] = x < 80 && y < 25 ? 1 : 0; continue }
  if (d < 9.6) { const sct = Math.floor(pmod(a + Math.PI / 8, TAU) / (TAU / 8)); if (Math.abs(pmod(a + Math.PI / 8, TAU / 8) - TAU / 16) > TAU / 16 - .14) continue; GL_ID[j] = 310 + sct; GL_C[j] = sct % 2 ? 3 : 2; GL_CY[j] = 25 + Math.sin(a) * 6; continue }
  if (pmod(x + y, 7) === 0 || pmod(x - y, 7) === 0) continue; GL_ID[j] = 330 + pmod(Math.floor((x + y) / 7), 9) * 9 + pmod(Math.floor((x - y) / 7), 9); GL_C[j] = (Math.floor((x + y) / 7) + Math.floor((x - y) / 7)) % 4 === 0 ? 3 : 5; GL_CY[j] = y < 18 ? 14 : 28;
}
// light shafts: every pane pixel swept along the light direction
const GL_DIR = [.55, 1], GL_BEAM = new Int8Array(W * H).fill(-1);
for (let y = 0; y < H; y++)for (let x = 0; x < W; x++) { const j = y * W + x; if (!GL_ID[j]) continue; for (let s = 3; s < 60; s++) { const px = Math.round(x + GL_DIR[0] * s), py = Math.round(y + GL_DIR[1] * s); if (px >= W || py >= H) break; if (!glIn(px + .5, py + .5)) GL_BEAM[py * W + px] = GL_C[j] } }



// ===== gallery app: card wall + workbench =====
const CATS = [['all', '全部'], ['elem', '元素'], ['magic', '法术'], ['hit', '打击'], ['ui', '界面'], ['text', '文字'], ['env', '环境'], ['view', '视角'], ['style', '风格']];
// group cards by category (stable: keeps authoring order inside each)
{ const ord = CATS.map(c => c[0]); VFX.sort((a, b) => ord.indexOf(a.cat) - ord.indexOf(b.cat)) }
const CATNAME = Object.fromEntries(CATS);
const SURF = Surface(W, H);
function checker(g) { for (let y = 0; y < H; y++)for (let x = 0; x < W; x++)g.buf[y * W + x] = ((x >> 3) + (y >> 3)) & 1 ? C.night3 : C.night4 }
function renderFrame(def, f, bg, g = SURF) {
  g.clear(0);
  if (bg === 'dark') g.clear(C.night6); else if (bg === 'check') checker(g); else if (def.stage) def.stage(g, f); else g.clear(C.night5);
  def.fx(g, f, bg);
  return g;
}
// indexed buffer -> ImageData
function toImage(g, img, alpha = 1) {
  const d = img.data, b = g.buf;
  for (let i = 0; i < b.length; i++) { const p = PAL[b[i]] || PAL[0], k = i * 4; d[k] = p[0]; d[k + 1] = p[1]; d[k + 2] = p[2]; d[k + 3] = b[i] ? 255 * alpha : 0 }
  return img;
}
const tmpC = document.createElement('canvas'); tmpC.width = W; tmpC.height = H; const tmpX = tmpC.getContext('2d'); const tmpI = tmpX.createImageData(W, H);
function paint(ctx, g, sc, alpha) { toImage(g, tmpI, 1); tmpX.putImageData(tmpI, 0, 0); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.drawImage(tmpC, 0, 0, W * sc, H * sc); ctx.globalAlpha = 1 }
const frameAt = (def, t) => Math.floor(t * def.fps) % def.n;

// ---- state ----
const S = { cur: 0, t: 0, play: true, spd: 1, bg: 'stage', onion: false, cat: 'all', hold: -1 };
const big = document.getElementById('big'), bctx = big.getContext('2d');
const sheet = document.getElementById('sheet'), sctx = sheet.getContext('2d');
let bigSc = 4;
function fitBig() {
  const box = big.parentElement.clientWidth || 640; bigSc = Math.max(1, Math.min(5, Math.floor(box / W)));
  big.width = W * bigSc; big.height = H * bigSc; S.lastF = -1;
}
// ---- cards ----
const wall = document.getElementById('wall'), cards = [];
VFX.forEach((def, i) => {
  const b = document.createElement('button'); b.className = 'card'; b.dataset.cat = def.cat; b.id = 'c-' + def.id;
  b.innerHTML = `<div class="scr"><canvas width="${W * 2}" height="${H * 2}"></canvas></div><div class="t"><b>${def.name}</b><span>${CATNAME[def.cat]} · ${def.n}帧</span></div><i>${def.brief || ''}</i>`;
  b.onclick = () => { select(i); document.querySelector('.bench').scrollIntoView({ behavior: 'smooth', block: 'start' }) };
  wall.appendChild(b);
  const cv = b.querySelector('canvas');
  cards.push({ b, cv, ctx: cv.getContext('2d'), vis: false, last: -1, t0: Math.random() * 3 });
});
const io = new IntersectionObserver(es => es.forEach(e => { const c = cards.find(c => c.b === e.target); if (c) c.vis = e.isIntersecting }), { rootMargin: '100px' });
cards.forEach(c => io.observe(c.b));
// ---- chips ----
const chips = document.getElementById('chips');
CATS.forEach(([k, n]) => {
  if (k !== 'all' && !VFX.some(d => d.cat === k)) return;
  const b = document.createElement('button'); b.className = 'chip'; b.textContent = n + (k === 'all' ? ` ${VFX.length}` : ` ${VFX.filter(d => d.cat === k).length}`); b.setAttribute('aria-pressed', k === S.cat);
  b.onclick = () => { S.cat = k; chips.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', x === b)); cards.forEach(c => c.b.hidden = !(k === 'all' || c.b.dataset.cat === k)) };
  chips.appendChild(b);
});
// ---- workbench ----
function buildSheet() {
  const def = VFX[S.cur], cols = Math.min(def.n, 6), rows = Math.ceil(def.n / cols), sc = 1, pad = 2;
  sheet.width = cols * (W * sc + pad); sheet.height = rows * (H * sc + pad);
  const g = Surface(W, H);
  for (let f = 0; f < def.n; f++) {
    renderFrame(def, f, S.bg, g); toImage(g, tmpI); tmpX.putImageData(tmpI, 0, 0);
    sctx.drawImage(tmpC, (f % cols) * (W * sc + pad), Math.floor(f / cols) * (H * sc + pad));
  }
  S.sheetImg = sctx.getImageData(0, 0, sheet.width, sheet.height); S.cols = cols; S.pad = pad;
  sheet.style.width = sheet.width + 'px';
}
function markSheet(f) {
  if (!S.sheetImg) return; sctx.putImageData(S.sheetImg, 0, 0);
  sctx.strokeStyle = '#ffd85e'; sctx.lineWidth = 2; const x = (f % S.cols) * (W + S.pad), y = Math.floor(f / S.cols) * (H + S.pad); sctx.strokeRect(x + 1, y + 1, W - 2, H - 2);
}
sheet.onclick = e => {
  const r = sheet.getBoundingClientRect(), x = (e.clientX - r.left) * sheet.width / r.width, y = (e.clientY - r.top) * sheet.height / r.height;
  const f = Math.floor(y / (H + S.pad)) * S.cols + Math.floor(x / (W + S.pad)); const def = VFX[S.cur];
  if (f < def.n) { setPlay(false); S.t = (f + .5) / def.fps }
};
function select(i) {
  S.cur = i; S.t = 0; const def = VFX[i];
  cards.forEach((c, j) => c.b.setAttribute('aria-current', j === i));
  document.getElementById('itag').textContent = `${CATNAME[def.cat]} · ${def.n} 帧 · ${def.fps} fps · ${(def.n / def.fps).toFixed(1)} 秒一循环`;
  document.getElementById('iname').textContent = def.name;
  document.getElementById('idesc').textContent = def.desc;
  document.getElementById('inotes').innerHTML = (def.notes || []).map(s => `<li>${s}</li>`).join('');
  document.getElementById('ishape').textContent = `${W}×${H} 像素`;
  try { history.replaceState(null, '', '#' + def.id) } catch (e) { }
  buildSheet(); S.lastF = -1;
}
function setPlay(p) { S.play = p; const b = document.getElementById('play'); b.textContent = p ? '暂停' : '播放'; b.setAttribute('aria-pressed', p) }
document.getElementById('play').onclick = () => setPlay(!S.play);
const stepF = d => { setPlay(false); const def = VFX[S.cur]; const f = pmod(frameAt(def, S.t) + d, def.n); S.t = (f + .5) / def.fps };
document.getElementById('prev').onclick = () => stepF(-1);
document.getElementById('next').onclick = () => stepF(1);
document.getElementById('replay').onclick = () => { S.t = 0; setPlay(true) };
document.querySelectorAll('.spd').forEach(b => b.onclick = () => { S.spd = +b.dataset.s; document.querySelectorAll('.spd').forEach(x => x.setAttribute('aria-pressed', x === b)) });
document.querySelectorAll('.bgm').forEach(b => b.onclick = () => { S.bg = b.dataset.b; document.querySelectorAll('.bgm').forEach(x => x.setAttribute('aria-pressed', x === b)); buildSheet(); S.lastF = -1 });
const onionB = document.getElementById('onion'); onionB.onclick = () => { S.onion = !S.onion; onionB.setAttribute('aria-pressed', S.onion); S.lastF = -1 };
addEventListener('keydown', e => {
  if (e.target.closest && e.target.closest('input,textarea')) return;
  if (e.key === ' ') { e.preventDefault(); setPlay(!S.play) } else if (e.key === 'ArrowLeft') stepF(-1); else if (e.key === 'ArrowRight') stepF(1);
  else if (e.key === 'r' || e.key === 'R') { S.t = 0; setPlay(true) } else if (e.key === 'o' || e.key === 'O') onionB.click();
});
// ---- loop ----
let lastT = performance.now();
const gC = Surface(W, H);
function loop(now) {
  const dt = Math.min(.1, (now - lastT) / 1000); lastT = now;
  const def = VFX[S.cur];
  if (S.play) S.t += dt * S.spd;
  const f = frameAt(def, S.t);
  if (f !== S.lastF) {
    S.lastF = f;
    bctx.clearRect(0, 0, big.width, big.height);
    paint(bctx, renderFrame(def, f, S.bg), bigSc);
    if (S.onion) paint(bctx, onionSurf(def, f - 1), bigSc, .35);
    document.getElementById('fc').textContent = `帧 ${f + 1} / ${def.n}`;
    markSheet(f);
  }
  for (const c of cards) {
    if (!c.vis || c.b.hidden) continue;
    const d = VFX[cards.indexOf(c)]; const cf = frameAt(d, now / 1000 + c.t0);
    if (cf === c.last) continue; c.last = cf;
    paint(c.ctx, renderFrame(d, cf, 'stage', gC), 2);
  }
  requestAnimationFrame(loop);
}
// onion skin: previous frame's effect only (on empty background)
const oS = Surface(W, H);
function onionSurf(def, f) { oS.clear(0); def.fx(oS, pmod(f, def.n), 'onion'); return oS }
// poster frames so cards outside the viewport are never blank (drawn a few at a time after load)
let posterI = 0;
function posters() { const t0 = performance.now(); while (posterI < cards.length && performance.now() - t0 < 12) { const c = cards[posterI], d = VFX[posterI]; if (c.last < 0) paint(c.ctx, renderFrame(d, Math.floor(d.n * .45), 'stage', gC), 2); posterI++ } if (posterI < cards.length) setTimeout(posters, 30) }
setTimeout(posters, 200);
// ---- boot ----
document.getElementById('foot').textContent = `${VFX.length} 个动效 · 画布 ${W}×${H} · 全部逐帧绘制在 ${PAL.length - 1} 色调色板上 · 空格暂停 ←→ 逐帧 R 重播 O 洋葱皮`;
fitBig(); addEventListener('resize', () => { fitBig() });
const h0 = (location.hash || '').slice(1); const i0 = Math.max(0, VFX.findIndex(d => d.id === h0));
select(i0);
requestAnimationFrame(loop);
window.__VFX = {
  VFX, renderFrame, sheet(id, bg = 'stage', cols = 6, sc = 2) {
    const def = VFX.find(d => d.id === id), rows = Math.ceil(def.n / cols), cv = document.createElement('canvas'), pad = 2;
    cv.width = cols * (W * sc + pad); cv.height = rows * (H * sc + pad); const x = cv.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, cv.width, cv.height);
    const g = Surface(W, H);
    for (let f = 0; f < def.n; f++) { renderFrame(def, f, bg, g); toImage(g, tmpI); tmpX.putImageData(tmpI, 0, 0); x.imageSmoothingEnabled = false; x.drawImage(tmpC, (f % cols) * (W * sc + pad), Math.floor(f / cols) * (H * sc + pad), W * sc, H * sc) }
    return cv.toDataURL();
  },
  frame(id, f, sc = 5, bg = 'stage') { const def = VFX.find(d => d.id === id), cv = document.createElement('canvas'); cv.width = W * sc; cv.height = H * sc; const t0 = performance.now(); const g = renderFrame(def, f, bg, Surface(W, H)); const ms = performance.now() - t0; paint(cv.getContext('2d'), g, sc); return { url: cv.toDataURL(), ms } },
  time(id) { const def = VFX.find(d => d.id === id), g = Surface(W, H), t0 = performance.now(); for (let f = 0; f < def.n; f++)renderFrame(def, f, 'stage', g); return (performance.now() - t0) / def.n }
};
