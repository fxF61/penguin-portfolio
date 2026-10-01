// Generates the higanbana (Lycoris radiata) SVGs in src/assets/lilies/.
//
// Each flower is modelled in 3D — an umbel of florets, each with six
// recurved ribbon petals and seven long arching stamens — then projected
// orthographically and painted back-to-front. Output is plain static SVG
// with semantic classes (.stem .petal .stamen .anther) so colour, line
// style and animation are all controlled from CSS / GSAP, and the files
// port to Hugo as-is.
//
// Run:  node scripts/draw-lily.mjs   (deterministic: same seeds, same art)

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '../src/assets/lilies');

// ---------- tiny vector kit ----------
const v = (x, y, z) => ({ x, y, z });
const add = (a, b) => v(a.x + b.x, a.y + b.y, a.z + b.z);
const mul = (a, s) => v(a.x * s, a.y * s, a.z * s);
const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const cross = (a, b) => v(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
const len = (a) => Math.hypot(a.x, a.y, a.z);
const norm = (a) => mul(a, 1 / (len(a) || 1));
const UP = v(0, -1, 0); // SVG y grows downward

function rotate(p, axis, ang) {
  // Rodrigues rotation of vector p about unit axis
  const c = Math.cos(ang), s = Math.sin(ang);
  return add(add(mul(p, c), mul(cross(axis, p), s)), mul(axis, dot(axis, p) * (1 - c)));
}
function basis(a) {
  const ref = Math.abs(a.y) < 0.9 ? UP : v(1, 0, 0);
  const u = norm(cross(a, ref));
  return [u, cross(a, u)];
}
function rng(seed) {
  // mulberry32
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- path output ----------
const f = (n) => (Math.round(n * 10) / 10).toString();
function smooth(pts, closed = false) {
  // Catmull-Rom → relative cubic Béziers (compact output)
  const n = pts.length;
  const at = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${f(pts[0].x)} ${f(pts[0].y)}`;
  let cx = +f(pts[0].x), cy = +f(pts[0].y); // track rounded pen position so errors don't accumulate
  const r = (n) => f(n).replace(/^(-?)0\./, '$1.');
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
    const ex = +f(p2.x), ey = +f(p2.y);
    const seg = [c1x - cx, c1y - cy, c2x - cx, c2y - cy, ex - cx, ey - cy].map(r);
    d += 'c' + seg.join(' ').replace(/ -/g, '-');
    cx = ex; cy = ey;
  }
  return closed ? d + 'Z' : d;
}

// ---------- flower model ----------
function flower(o) {
  const R = rng(o.seed);
  const j = (s) => (R() - 0.5) * 2 * s; // jitter ±s
  const origin = o.at ?? v(0, 0, 0);
  const tilt = o.tilt ?? 0.35; // lean the umbel toward the viewer
  const items = [];

  // floret axes: spread over an upward cap, golden-angle spiral + jitter
  for (let k = 0; k < o.florets; k++) {
    const polar = (o.cap * (k + 0.5)) / o.florets + j(0.12);
    const az = k * 2.39996 + j(0.3) + (o.spin ?? 0);
    let a = norm(v(Math.sin(polar) * Math.cos(az), -Math.cos(polar), Math.sin(polar) * Math.sin(az)));
    a = rotate(a, v(1, 0, 0), tilt);
    const [u, w] = basis(a);
    const base = add(origin, mul(a, o.pedicel * (0.85 + R() * 0.3)));
    const depth = base.z;

    items.push({ z: depth - 0.5, kind: 'pedicel', pts: [origin, base], floret: k });

    // petals: narrow ribbons that open outward then curl back past the base
    for (let p = 0; p < 6; p++) {
      const phi = (p / 6) * Math.PI * 2 + j(0.25);
      const r = add(mul(u, Math.cos(phi)), mul(w, Math.sin(phi)));
      const planeN = norm(cross(a, r)); // curl happens in the (a, r) plane
      const L = o.petal * (0.85 + R() * 0.3);
      const a0 = o.open + j(0.15), curl = o.curl + j(0.5);
      const width = o.petalWidth * (0.8 + R() * 0.4);
      const ph = R() * 6;
      const center = [], edgeA = [], edgeB = [];
      let pos = base;
      const N = 14;
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        const alpha = a0 + curl * Math.pow(t, 1.7);
        const dir = add(mul(a, Math.cos(alpha)), mul(r, Math.sin(alpha)));
        if (i) pos = add(pos, mul(dir, L / N));
        // ribbon width: swells, ruffles, tapers to a point
        const wv = width * (0.3 + 0.7 * Math.sin(Math.PI * Math.min(1, t * 1.15))) * (1 - t * t * 0.85)
          * (1 + (o.ruffle ?? 0.28) * Math.sin(t * 17 + ph));
        const side = rotate(planeN, dir, 0.5 * t + 0.2); // slight twist
        center.push(pos);
        edgeA.push(add(pos, mul(side, wv / 2)));
        edgeB.push(add(pos, mul(side, -wv / 2)));
      }
      // split into two runs so the inside of the curl can take the darker tone
      const cut = Math.round(N * (0.5 + j(0.08)));
      const z = center.reduce((s, q) => s + q.z, 0) / center.length;
      items.push({ z, kind: 'petal', part: 'root', edgeA: edgeA.slice(0, cut + 2), edgeB: edgeB.slice(0, cut + 2), floret: k });
      items.push({ z: z + 0.01, kind: 'petal', part: 'curl', edgeA: edgeA.slice(cut), edgeB: edgeB.slice(cut), floret: k });
    }

    // stamens + style: long whiskers along the floret axis, arching skyward
    if (o.stamen) {
      for (let s = 0; s < 7; s++) {
        const phi = (s / 7) * Math.PI * 2 + j(0.3);
        const r = add(mul(u, Math.cos(phi)), mul(w, Math.sin(phi)));
        const d0 = norm(add(a, mul(r, 0.28 + R() * 0.2)));
        const axis = norm(cross(d0, UP));
        const L = o.stamen * (0.8 + R() * 0.35) * (s === 6 ? 1.08 : 1);
        const bend = (o.bend ?? 1.1) + j(0.35);
        const pts = [];
        let pos = base;
        const N = 10;
        for (let i = 0; i <= N; i++) {
          const t = i / N;
          const dir = len(axis) > 1e-3 ? rotate(d0, axis, bend * Math.pow(t, 1.5)) : d0;
          if (i) pos = add(pos, mul(dir, L / N));
          pts.push(pos);
        }
        const z = pts.reduce((sum, q) => sum + q.z, 0) / pts.length;
        items.push({ z: z + 0.02, kind: 'stamen', pts, floret: k, style: s === 6 });
      }
    }
  }
  return items;
}

// ---------- render ----------
// paint controls how colours are emitted:
//   null      → class-based (styled by CSS: .lily .petal { … })
//   'vars'    → inline `style="fill:var(--f-petal)"` etc, so each instance can
//               be recoloured (white⇄red) by custom properties it inherits —
//               used for the <use>-based field where document CSS can't reach.
//   {…}       → literal colours inlined as attributes (self-contained, static).
function render(groups, { pad = 8, stems = [], paint = null } = {}) {
  const all = groups.flatMap((g) => g.items);
  const xs = [], ys = [];
  for (const it of all) for (const p of it.pts ?? [...it.edgeA, ...it.edgeB]) { xs.push(p.x); ys.push(p.y); }
  for (const s of stems) for (const p of s.pts) { xs.push(p.x); ys.push(p.y); }
  const minX = Math.min(...xs) - pad, minY = Math.min(...ys) - pad;
  const W = Math.max(...xs) + pad - minX, H = Math.max(...ys) + pad - minY;
  // paint: null → CSS classes; {vars:'flp'} → themeable var() fills with that
  // prefix; {petal,back,…} → literal colours inlined.
  const vp = paint && typeof paint === 'object' && paint.vars ? paint.vars : (paint === 'vars' ? 'f' : null);
  const vars = !!vp;
  const co = paint && typeof paint === 'object' && !paint.vars ? paint : null;
  const hw = co?.hairW ?? 1;
  const V = (k) => `var(--${vp}-${k})`;
  // per-kind: extra attributes + a style declaration string (merged with --i)
  const A = {
    petal: { attr: vars ? '' : co ? ` fill="${co.petal}"` : ' class="petal"', css: vars ? `fill:${V('petal')}` : '' },
    back: { attr: vars ? '' : co ? ` fill="${co.back}"` : ' class="petal is-back"', css: vars ? `fill:${V('back')}` : '' },
    stamen: { attr: vars ? ' stroke-width="1" stroke-linecap="round" vector-effect="non-scaling-stroke"' : co ? ` fill="none" stroke="${co.hair}" stroke-width="${hw}" stroke-linecap="round" vector-effect="non-scaling-stroke"` : ' class="stamen"', css: vars ? `fill:none;stroke:${V('hair')}` : '' },
    anther: { attr: vars ? '' : co ? ` fill="${co.anther}"` : ' class="anther"', css: vars ? `fill:${V('anther')}` : '' },
    ped: { attr: vars ? ' stroke-width="1" vector-effect="non-scaling-stroke"' : co ? ` fill="none" stroke="${co.ped}" stroke-width="${hw}" vector-effect="non-scaling-stroke"` : ' class="pedicel"', css: vars ? `fill:none;stroke:${V('stem')}` : '' },
  };
  const sty = (a, i) => ` style="${a.css ? a.css + ';' : ''}--i:${i}"`;

  let body = '';
  for (const s of stems) body += `<path class="stem" d="${smooth(s.pts)}"/>`;
  for (const g of groups) {
    const sorted = [...g.items].sort((a, b) => a.z - b.z);
    let inner = '';
    let n = 0;
    for (const it of sorted) {
      if (it.kind === 'pedicel') inner += `<path${A.ped.attr}${vars ? ` style="${A.ped.css}"` : ''} d="${smooth(it.pts)}"/>`;
      else if (it.kind === 'petal') {
        const shape = [...it.edgeA, ...[...it.edgeB].reverse()];
        const back = (it.part === 'curl' && it.z < 4) || it.z < -12; // shadowed curls + far side take the deep tone
        const a = back ? A.back : A.petal;
        inner += `<path${a.attr} data-f="${it.floret}"${sty(a, n++)} d="${smooth(shape, true)}"/>`;
      } else if (it.kind === 'stamen') {
        const tip = it.pts.at(-1);
        const a = it.style && !paint ? { attr: ' class="stamen is-style"', css: '' } : A.stamen;
        inner += `<path${a.attr} pathLength="1"${sty(a, n++)} d="${smooth(it.pts)}"/>`;
        if (!it.style) inner += `<circle${A.anther.attr}${sty(A.anther, n - 1)} cx="${f(tip.x)}" cy="${f(tip.y)}" r=".8"/>`;
      }
    }
    body += `<g class="head${g.cls ? ' ' + g.cls : ''}">${inner}</g>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f(minX)} ${f(minY)} ${f(W)} ${f(H)}" class="lily-art" aria-hidden="true" focusable="false">${body}</svg>\n`;
}

function stem(from, length, sway, seed) {
  const R = rng(seed);
  const pts = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    pts.push(v(from.x + sway * Math.sin(t * 2.2 + R() * 0.1) * t, from.y + length * t, 0));
  }
  return { pts };
}

// a lone petal drawn flat in 2D: one ribbon that opens then hooks back
function loosePetal(seed) {
  const R = rng(seed);
  const edgeA = [], edgeB = [];
  let x = 0, y = 0, ang = -1.2;
  const N = 16, L = 46, W = 8;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    if (i) { x += Math.cos(ang) * L / N; y += Math.sin(ang) * L / N; }
    ang += 0.05 + 0.42 * t * t; // tighter curl toward the tip
    const w = W * (0.3 + 0.7 * Math.sin(Math.PI * Math.min(1, t * 1.15))) * (1 - t * t * 0.85) * (1 + 0.22 * Math.sin(t * 15 + R() * 0.2));
    const nx = -Math.sin(ang), ny = Math.cos(ang);
    edgeA.push(v(x + nx * w / 2, y + ny * w / 2, 0));
    edgeB.push(v(x - nx * w / 2, y - ny * w / 2, 0));
  }
  const cut = 9;
  return [
    { z: 0, kind: 'petal', part: 'root', edgeA: edgeA.slice(0, cut + 2), edgeB: edgeB.slice(0, cut + 2), floret: 0 },
    { z: 0.1, kind: 'petal', part: 'curl', edgeA: edgeA.slice(cut), edgeB: edgeB.slice(cut), floret: 0 },
  ];
}

// ---------- variants ----------
const BLOOM = { florets: 6, cap: 2.0, pedicel: 14, petal: 42, petalWidth: 6.4, open: 0.95, curl: 2.7, stamen: 82, bend: 1.1 };
const BUD = { florets: 4, cap: 0.3, pedicel: 3, petal: 24, petalWidth: 3.4, open: 0.1, curl: 0.55, stamen: 0, ruffle: 0, tilt: 0.1 };

const bloom = (seed, stemLen, sway, extra = {}) => () =>
  render([{ items: flower({ ...BLOOM, seed, ...extra }) }], { stems: [stem(v(0, 0, 0), stemLen, sway, seed + 1)] });

const variants = {
  // single flower head, no stem — ornaments, cards, favicon source
  head: () => render([{ items: flower({ ...BLOOM, seed: 7 }) }]),
  // full blooms on tall bare scapes (higanbana flowers before its leaves).
  // Three seeds so the hero can layer them at different depths.
  'bloom-1': bloom(7, 320, 10),
  'bloom-2': bloom(44, 280, -8, { spin: 1 }),
  'bloom-3': bloom(91, 240, 6, { spin: 2.2, florets: 5 }),
  // closed bud — dividers, list markers, small accents
  bud: () => render([{ items: flower({ ...BUD, seed: 21 }) }], { stems: [stem(v(0, 0, 0), 60, 2, 5)], pad: 3 }),
  // a single fallen petal — scattered accents / drifting animation
  petal: () => render([{ items: loosePetal(12) }], { pad: 2 }),
};

// Full-fidelity, stemless bloom-heads for the layered field — the SAME umbel as
// the tall lilies. Baked in two colourways (red foreground/mid, pale underlayer
// + hazy back) with colours inlined, so the field is a cheap <use> layer.
// Non-scaling stamens keep hairlines ~1px at any scale, matching the tall lilies.
// Themeable field heads: fills are CSS custom properties by tier prefix
//   flp = primary (light: crimson),  fld = deep (light: blood-red),
//   flw = pale bones (light: bone).  The colour values live in the component's
//   CSS per theme; light values equal the previous baked colours exactly.
const themedHead = (prefix, seed, extra = {}) => () =>
  render([{ items: flower({ ...BLOOM, seed, ...extra }) }], { pad: 6, paint: { vars: prefix } });
for (const [set, prefix] of [['p', 'flp'], ['d', 'fld'], ['w', 'flw']]) {
  Object.assign(variants, {
    [`head-${set}-a`]: themedHead(prefix, 7),
    [`head-${set}-b`]: themedHead(prefix, 44, { spin: 1 }),
    [`head-${set}-c`]: themedHead(prefix, 91, { spin: 2.2, florets: 5 }),
  });
}

mkdirSync(OUT, { recursive: true });
for (const [name, make] of Object.entries(variants)) {
  const svg = make();
  writeFileSync(join(OUT, `${name}.svg`), svg);
  console.log(`${name}.svg  ${(svg.length / 1024).toFixed(1)} KB`);
}
