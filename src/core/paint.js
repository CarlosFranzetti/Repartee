/* =====================================================================================
   re:parteé -- PAINT KIT.  window.RP.PK
   Procedural pixel-art helpers for painting 640x256 rooms.  Classic script, needs util.js.
   Rules of the house: integer fillRects only, light from the upper left, hue-shifted ramps,
   gradients in clean in-between colour steps (no dot dithering), deterministic (opts.seed), lit "daytime-neutral" colors,
   emissive helpers RETURN [[x,y,w,h],...] so the engine can keep those pixels bright at night.
   Full reference: docs/PAINTKIT.md
   ===================================================================================== */
(function () {
"use strict";
const RP = window.RP = window.RP || {};
const U = RP.u;
if (!U) throw new Error("paint.js needs util.js (window.RP.u) loaded first");
const { R, P, ell, line, poly, bayer, mulberry, hashStr, mix, ramp, txtW, clamp, lerp } = U;
const txt = (c, s, x, y, col, sc, sp) => U.txt(c, s, Math.round(x), Math.round(y), col, sc, sp);
const txtC = (c, s, cx, y, col, sc, sp) => U.txtC(c, s, cx, Math.round(y), col, sc, sp);
const PK = RP.PK = {};
const floor = Math.floor, ceil = Math.ceil, round = Math.round, abs = Math.abs, min = Math.min, max = Math.max;
const sin = Math.sin, cos = Math.cos, sqrt = Math.sqrt, PI = Math.PI;

/* ---------- seeding -------------------------------------------------------------- */
function rng(o, x, y, salt) {
  let s;
  if (o && o.seed != null) s = typeof o.seed === "string" ? hashStr(o.seed) : (o.seed | 0);
  else s = Math.imul((x | 0) + 1013, 73856093) ^ Math.imul((y | 0) + 7919, 19349663);
  s = (s + Math.imul((salt | 0) + 1, 0x9E3779B1)) | 0;
  return mulberry(s >>> 0);
}
const ri = (r, a, b) => a + floor(r() * (b - a + 1));
const pk = (r, a) => a[floor(r() * a.length)];
const thr = (x, y) => (bayer(x, y) + 0.5) / 16;

/* ---------- colour ---------------------------------------------------------------- */
const DARKV = "#140c24", LITW = "#fff3d6";
const sh = (col, t) => mix(col, DARKV, t);    /* push toward deep violet */
const li = (col, t) => mix(col, LITW, t);     /* push toward warm white  */
const K = ramp;                               /* [deep, shadow, base, light, highlight] */
function hue(col, dh, ds, dl) {               /* quick hsl nudge */
  const v = U.hex(col), z = U.rgb2hsl(v[0], v[1], v[2]);
  let h = z[0] + dh; h -= floor(h);
  const o = U.hsl2rgb(h, clamp(z[1] + (ds || 0), 0, 1), clamp(z[2] + (dl || 0), 0, 1));
  return U.toHex(o[0], o[1], o[2]);
}

const lum = col => { const v = U.hex(col); return 0.3 * v[0] + 0.59 * v[1] + 0.11 * v[2]; };
function inkFor(bg, cands) { let best = cands[0], bd = -1; cands.forEach(cc => { const d = abs(lum(cc) - lum(bg)); if (d > bd) { bd = d; best = cc; } }); return best; }

/* ---------- drawing primitives ---------------------------------------------------- */
const HL = (c, x, y, w, col) => R(c, x, y, w, 1, col);
const VL = (c, x, y, h, col) => R(c, x, y, 1, h, col);
function AR(c, x, y, w, h, col, a) { const pa = c.globalAlpha; c.globalAlpha = a; R(c, x, y, w, h, col); c.globalAlpha = pa; }
function AP(c, x, y, col, a) { const pa = c.globalAlpha; c.globalAlpha = a; P(c, x, y, col); c.globalAlpha = pa; }
function clip(c, x, y, w, h, fn) {
  c.save(); c.beginPath(); c.rect(round(x), round(y), round(w), round(h)); c.clip();
  try { fn(); } finally { c.restore(); }
}
/* rounded-corner (chamfered) rect */
function rr(c, x, y, w, h, col, rad) {
  rad = rad == null ? 1 : rad; x = round(x); y = round(y); w = round(w); h = round(h);
  c.fillStyle = col;
  for (let j = 0; j < h; j++) {
    const ins = j < rad ? rad - j : (h - 1 - j) < rad ? rad - (h - 1 - j) : 0;
    c.fillRect(x + ins, y + j, w - ins * 2, 1);
  }
}
/* 1px outline rect */
function outline(c, x, y, w, h, col) { HL(c, x, y, w, col); HL(c, x, y + h - 1, w, col); VL(c, x, y, h, col); VL(c, x + w - 1, y, h, col); }
/* bevelled box: base + light top/left edge + shadow bottom/right edge */
function bev(c, x, y, w, h, col, o) {
  o = o || {}; const k = K(col);
  if (o.out) R(c, x - 1, y - 1, w + 2, h + 2, o.out === true ? k[0] : o.out);
  R(c, x, y, w, h, k[2]);
  if (h > 2) { HL(c, x, y, w, k[o.top == null ? 3 : o.top]); HL(c, x, y + h - 1, w, k[1]); }
  if (w > 2) { VL(c, x, y + 1, h - 2, k[o.left == null ? 3 : o.left]); VL(c, x + w - 1, y + 1, h - 2, k[1]); }
}
/* run-length painter: fn(px,py) -> colour or falsy */
function paintFn(c, x, y, w, h, fn) {
  x = round(x); y = round(y); w = round(w); h = round(h);
  for (let yy = y; yy < y + h; yy++) {
    let rc = null, rx = x;
    for (let xx = x; xx < x + w; xx++) {
      const col = fn(xx, yy);
      if (col !== rc) {
        if (rc) { c.fillStyle = rc; c.fillRect(rx, yy, xx - rx, 1); }
        rc = col; rx = xx;
      }
    }
    if (rc) { c.fillStyle = rc; c.fillRect(rx, yy, x + w - rx, 1); }
  }
}
/* soft alpha overlay. fn(px,py)->coverage 0..1, drawn in four clean opacity steps (no dot dither);
   returns merged runs [[x,y,w,h]] of the covered pixels when out is given */
const SHADE_STEPS = 4;
function dshade(c, x, y, w, h, col, fn, a, out) {
  x = round(x); y = round(y); w = round(w); h = round(h);
  const pa = c.globalAlpha, base = a == null ? 0.5 : a; c.fillStyle = col;
  for (let yy = y; yy < y + h; yy++) {
    let rx = -1, rl = 0;
    for (let xx = x; xx <= x + w; xx++) {
      const lv = xx < x + w ? clamp(round(fn(xx, yy) * SHADE_STEPS), 0, SHADE_STEPS) : 0;
      if (lv === rl) continue;
      if (rl > 0) { c.globalAlpha = base * rl / SHADE_STEPS; c.fillRect(rx, yy, xx - rx, 1); if (out) out.push([rx, yy, xx - rx, 1]); }
      rl = lv; rx = xx;
    }
  }
  c.globalAlpha = pa;
}
/* a constant blend between two colours (0..1 = share of B), painted as the blended colour itself */
function dmix(c, x, y, w, h, A, B, t) {
  R(c, round(x), round(y), round(w), round(h), HEX6.test(A) && HEX6.test(B) ? mix(A, B, clamp(t, 0, 1)) : (t >= 0.5 ? B : A));
}

/* value noise */
function noise2(seed) {
  const r = mulberry(seed >>> 0), g = new Float32Array(4096);
  for (let i = 0; i < 4096; i++) g[i] = r();
  const sm = t => t * t * (3 - 2 * t);
  return function (x, y) {
    const xi = floor(x), yi = floor(y), fx = sm(x - xi), fy = sm(y - yi);
    const x0 = xi & 63, x1 = (xi + 1) & 63, y0 = (yi & 63) << 6, y1 = ((yi + 1) & 63) << 6;
    const a = g[y0 | x0], b = g[y0 | x1], c2 = g[y1 | x0], d = g[y1 | x1];
    return (a + (b - a) * fx) * (1 - fy) + (c2 + (d - c2) * fx) * fy;
  };
}

/* ---------- gradients ------------------------------------------------------------- */
function gradient(c, x, y, w, h, colors, dith, vert) {
  x = round(x); y = round(y); w = round(w); h = round(h);
  if (w <= 0 || h <= 0 || !colors || !colors.length) return;
  const n = colors.length;
  if (n === 1) { R(c, x, y, w, h, Array.isArray(colors[0]) ? colors[0][1] : colors[0]); return; }
  let cols, pos;
  if (Array.isArray(colors[0])) { pos = colors.map(s => s[0]); cols = colors.map(s => s[1]); }
  else { cols = colors; pos = colors.map((_, i) => (i + 0.5) / n); }
  const z = dith == null ? 1 : dith;
  const len = vert ? h : w;
  for (let k = 0; k < len; k++) {
    const t = (k + 0.5) / len;
    let i = 0, f = 0;
    if (t <= pos[0]) i = 0;
    else if (t >= pos[n - 1]) i = n - 1;
    else { while (i < n - 2 && t > pos[i + 1]) i++; f = (t - pos[i]) / (pos[i + 1] - pos[i]); }
    const fp = z <= 0 ? (f >= 0.5 ? 1 : 0) : clamp((f - 0.5) / z + 0.5, 0, 1);
    const A = cols[i], B = cols[min(i + 1, n - 1)];
    // between two stops: clean in-between colour steps instead of a dithered mix
    const col = i >= n - 1 || fp <= 0 ? A : fp >= 1 ? B : mixStep(A, B, fp);
    if (vert) R(c, x, y + k, w, 1, col); else R(c, x + k, y, 1, h, col);
  }
}
const GRAD_STEPS = 4, mixCache = new Map(), HEX6 = /^#[0-9a-f]{6}$/i;
function mixStep(A, B, t) {
  const q = round(t * GRAD_STEPS) / GRAD_STEPS;
  if (q <= 0) return A; if (q >= 1) return B;
  if (!HEX6.test(A) || !HEX6.test(B)) return q >= 0.5 ? B : A;   // not plain #rrggbb: clean split
  const key = A + B + q;
  let v = mixCache.get(key);
  if (!v) { v = mix(A, B, q); mixCache.set(key, v); }
  return v;
}
PK.gradV = (c, x, y, w, h, colors, o) => gradient(c, x, y, w, h, colors, o && o.dither, true);
PK.gradH = (c, x, y, w, h, colors, o) => gradient(c, x, y, w, h, colors, o && o.dither, false);

/* shaded cylinders & spheres (used everywhere for round things) */
function cylV(c, x, y, w, h, col) { const k = K(col); gradient(c, x, y, w, h, [[0, k[3]], [0.2, k[4]], [0.48, k[2]], [0.8, k[1]], [1, k[0]]], 1, false); }
function cylH(c, x, y, w, h, col) { const k = K(col); gradient(c, x, y, w, h, [[0, k[3]], [0.22, k[4]], [0.5, k[2]], [0.82, k[1]], [1, k[0]]], 1, true); }
/* shaded ellipsoid (r = radius, or rx/ry); ball = blob with rx==ry */
function blob(c, cx, cy, rx, ry, col, o) {
  o = o || {}; const k = K(col);
  const L = [-0.45, -0.55, 0.7], ln = sqrt(L[0] * L[0] + L[1] * L[1] + L[2] * L[2]);
  const rz = (rx + ry) / 2;
  for (let dy = -ry; dy <= ry; dy++) {
    for (let dx = -rx; dx <= rx; dx++) {
      const e = (dx * dx) / (rx * rx + rx * 0.6) + (dy * dy) / (ry * ry + ry * 0.6);
      if (e > 1) continue;
      const nx = dx / (rx + 0.5), ny = dy / (ry + 0.5), nz = sqrt(max(0, 1 - nx * nx - ny * ny));
      const lam = (nx * L[0] + ny * L[1] + nz * L[2]) / ln;
      const t = clamp((lam + 0.15) / 1.0, 0, 1) * 4;
      let i = floor(t); const f = t - i;
      if (i >= 4) i = 3;
      const idx = (f > thr(cx + dx, cy + dy)) ? i + 1 : i;
      let colr = k[min(4, idx)];
      if (o.outline && e > 0.78) colr = k[0];
      P(c, cx + dx, cy + dy, colr);
    }
  }
}
const ball = (c, cx, cy, r, col, o) => blob(c, cx, cy, r, r, col, o);
/* 1px circle outline (midpoint) */
function ring(c, cx, cy, r, col) {
  c.fillStyle = col; let x = r, y = 0, err = 1 - r;
  while (x >= y) {
    [[x, y], [y, x], [-y, x], [-x, y], [-x, -y], [-y, -x], [y, -x], [x, -y]].forEach(p => c.fillRect(cx + p[0], cy + p[1], 1, 1));
    y++; if (err < 0) err += 2 * y + 1; else { x--; err += 2 * (y - x) + 1; }
  }
}
/* dithered soft contact shadow, centered on cx */
function groundShadow(c, cx, cy, rx, ry, a) {
  dshade(c, cx - rx, cy - ry, rx * 2 + 1, ry * 2 + 1, "#0c0618", (px, py) => {
    const dx = (px - cx) / rx, dy = (py - cy) / ry, d = dx * dx + dy * dy;
    return d > 1 ? 0 : (1 - d) * 1.4;
  }, a == null ? 0.55 : a);
}
PK.contactShadow = function (c, x, y, w, h, o) {
  o = o || {};
  groundShadow(c, x + w / 2, y + h / 2, w / 2, max(1, h / 2), o.alpha);
};

/* speckle */
PK.speckle = function (c, x, y, w, h, colors, density, seed) {
  if (typeof colors === "string") colors = [colors];
  const r = mulberry(seed == null ? ((x * 31 + y * 17) | 0) + 99 : (typeof seed === "string" ? hashStr(seed) : seed));
  const n = round(w * h * (density == null ? 0.05 : density));
  for (let i = 0; i < n; i++) P(c, x + floor(r() * w), y + floor(r() * h), colors[floor(r() * colors.length)]);
};
const speckle = PK.speckle;

/* generic spec helpers for glowing things -------------------------------------------- */
/* halo around a point; returns rects of drawn pixels (merged runs) */
function haloPts(c, cx, cy, r, col, strength, out, ry) {
  ry = ry == null ? r : ry;
  const st = strength == null ? 1 : strength;
  const x0 = floor(cx - r), y0 = floor(cy - ry);
  const w = ceil(r * 2) + 1, h = ceil(ry * 2) + 1;
  const LV = [0, 0.16, 0.30, 0.48];
  for (let lv = 1; lv <= 3; lv++) {
    const pa = c.globalAlpha; c.globalAlpha = LV[lv]; c.fillStyle = col;
    for (let yy = y0; yy < y0 + h; yy++) {
      let rx = -1;
      for (let xx = x0; xx <= x0 + w; xx++) {
        let on = false;
        if (xx < x0 + w) {
          const dx = (xx + 0.5 - cx) / r, dy = (yy + 0.5 - cy) / ry, d = sqrt(dx * dx + dy * dy);
          if (d < 1) {
            const I = Math.pow(1 - d, 1.7) * st * 3.2;      /* 0..3 */
            const base = floor(I), fr = I - base;
            const level = min(3, base + (fr > thr(xx, yy) ? 1 : 0));
            on = level === lv;
          }
        }
        if (on) { if (rx < 0) rx = xx; }
        else if (rx >= 0) { c.fillRect(rx, yy, xx - rx, 1); if (out) out.push([rx, yy, xx - rx, 1]); rx = -1; }
      }
    }
    c.globalAlpha = pa;
  }
}

/* text helper: fit text to width choosing the biggest integer scale */
function fitScale(s, maxW, maxSc, sp) {
  sp = sp == null ? 1 : sp;
  for (let sc = maxSc; sc >= 1; sc--) if (txtW(s, sc, sp) <= maxW) return sc;
  return 1;
}

/* record-cover / poster palettes (shared by recordWall, poster, flyers) */
const ART_PALS = [
  ["#1b1440", "#ff3fa4", "#39d0ff", "#f4ead0"], ["#f4ead0", "#c0302c", "#1d1622", "#ffb03a"],
  ["#0e3a4a", "#ffd23f", "#ff6a3a", "#f4ead0"], ["#2a1a3a", "#a05cff", "#5cff9a", "#f4ead0"],
  ["#c0302c", "#f4ead0", "#1d1622", "#ffd23f"], ["#1d1622", "#e8e4f0", "#ff3fa4", "#39d0ff"],
  ["#e8a030", "#1d1622", "#c0302c", "#f4ead0"], ["#2f62b8", "#f4ead0", "#ffd23f", "#1d1622"],
  ["#3a6a3a", "#f4ead0", "#ffb03a", "#1d1622"], ["#6a2a5a", "#ffb0d0", "#39d0ff", "#f4ead0"],
  ["#101018", "#39d0ff", "#e8e4f0", "#ff3fa4"], ["#d8c8a0", "#2a1a3a", "#c0302c", "#2f62b8"]
];

PK.util = { lum, inkFor, rng, ri, pk, thr, sh, li, hue, AR, AP, clip, rr, outline, bev, paintFn, dshade, dmix, noise2, gradient, cylV, cylH, ball, blob, ring, groundShadow, haloPts, fitScale, HL, VL };

/* =====================================================================================
   SURFACES
   ===================================================================================== */

/* ---- plaster: old painted wall -------------------------------------------------- */
function stainDrip(c, x0, y0, len, hw, col, r) {
  /* water stain: soft blob at the top, thin tide-marked drips below */
  dshade(c, x0 - hw * 2, y0 - 4, hw * 4 + 1, 9, col, (px, py) => {
    const dx = (px - x0) / (hw * 2), dy = (py - y0) / 4, d = dx * dx + dy * dy;
    return d > 1 ? 0 : (1 - d) * 1.5;
  }, 0.42);
  const drips = ri(r, 2, 4);
  for (let i = 0; i < drips; i++) {
    const dx = x0 + ri(r, -hw, hw), L = floor(len * (0.4 + r() * 0.6)), wd = ri(r, 1, 2);
    for (let j = 0; j < L; j++) {
      const a = 0.42 * (1 - j / L * 0.8);
      const wob = floor(sin(j * 0.25 + i) * 0.9 + 0.5);
      for (let k2 = 0; k2 < wd; k2++) if (thr(dx + k2, y0 + j) < 0.95 - j / L * 0.55) AP(c, dx + wob + k2, y0 + 3 + j, col, a);
    }
    AP(c, dx, y0 + 3 + L, col, 0.6); if (wd > 1) AP(c, dx + 1, y0 + 3 + L, col, 0.6);
  }
}
function crackPath(c, px, py, steps, dirx, r, k, bx0, by0, bx1, by1) {
  for (let i = 0; i < steps; i++) {
    if (px < bx0 || px >= bx1 || py < by0 || py >= by1) break;
    P(c, px, py, k[0]); if (r() < 0.55) P(c, px + 1, py, k[3]);
    const m = r();
    if (m < 0.5) py++; else if (m < 0.8) { px += dirx; } else { px += dirx; py++; }
    if (r() < 0.02) dirx = -dirx;
    if (r() < 0.025 && steps - i > 10) crackPath(c, px, py, floor((steps - i) * 0.5), -dirx, r, k, bx0, by0, bx1, by1);
  }
}
PK.plaster = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w == null ? 640 - x : w); h = round(h == null ? 256 - y : h);
  const base = o.base || "#8c7590", k = K(base), r = rng(o, x, y, 1);
  const nz = noise2(floor(r() * 4e9)), pl = mix(k[2], k[3], 0.5), pd = mix(k[2], k[1], 0.5);
  paintFn(c, x, y, w, h, (px, py) => {
    const n = nz(px / 34, py / 26) * 0.7 + nz(px / 7 + 31, py / 5 + 17) * 0.3;
    const v = (n - 0.5) * 2.4, a = abs(v) - 0.2;
    if (a > 0 && a * 1.8 > thr(px, py)) return v > 0 ? pl : pd;
    return k[2];
  });
  /* darker toward the ceiling */
  const ch = max(4, round(h * 0.16));
  dshade(c, x, y, w, ch, k[0], (px, py) => (1 - (py - y) / ch) * 0.9, 0.42);
  /* grain + pits */
  speckle(c, x, y, w, h, k[3], 0.012, floor(r() * 9e6));
  speckle(c, x, y, w, h, k[1], 0.009, floor(r() * 9e6));
  const pits = round(w * h / 1100);
  for (let i = 0; i < pits; i++) { const px = x + floor(r() * (w - 1)), py = y + floor(r() * (h - 1)); P(c, px, py, k[1]); P(c, px + 1, py + 1, k[4]); }
  /* repair patches (raised, slightly lighter) */
  const patches = o.patches == null ? 3 : o.patches;
  for (let i = 0; i < patches; i++) {
    const pw = ri(r, 14, 38), ph = ri(r, 8, 22), px = x + ri(r, 4, max(5, w - pw - 4)), py = y + ri(r, 4, max(5, h - ph - 4));
    const pc = mix(k[2], k[3], 0.32), pcl = mix(pc, k[3], 0.5), pcd = mix(pc, k[1], 0.5);
    rr(c, px, py, pw, ph, pc, 2);
    HL(c, px + 2, py, pw - 4, pcl); VL(c, px, py + 2, ph - 4, pcl);
    HL(c, px + 2, py + ph - 1, pw - 4, pcd); VL(c, px + pw - 1, py + 2, ph - 4, pcd);
    for (let j = 0; j < pw * ph / 22; j++) P(c, px + 2 + floor(r() * (pw - 4)), py + 2 + floor(r() * (ph - 4)), r() < 0.5 ? pcl : pcd);
    for (let j = 0; j < pw; j++) if (r() < 0.35) AP(c, px + 1 + j, py + ph, k[0], 0.22);   /* soft shadow under patch */
  }
  /* water stains */
  const stains = o.stains == null ? 2 : o.stains;
  const stCol = mix(base, "#5a3a22", 0.55);
  for (let i = 0; i < stains; i++) stainDrip(c, x + ri(r, 20, max(21, w - 20)), y + ri(r, 2, 12), ri(r, 18, min(70, max(19, h * 0.5))), ri(r, 4, 9), stCol, r);
  /* cracks */
  const cracks = o.cracks == null ? 2 : o.cracks;
  for (let i = 0; i < cracks; i++) crackPath(c, x + ri(r, 10, max(11, w - 10)), y + ri(r, 0, 6), ri(r, 24, min(80, max(25, floor(h * 0.7)))), r() < 0.5 ? -1 : 1, r, k, x, y, x + w, y + h);
};

/* ---- brick ----------------------------------------------------------------------- */
PK.brick = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w == null ? 640 - x : w); h = round(h == null ? 256 - y : h);
  const base = o.base || "#8a4a3e", k = K(base), mortar = o.mortar || "#a09090", mk = K(mortar);
  const bw = o.bw || 14, bh = o.bh || 6, worn = o.worn == null ? 0.25 : o.worn, r = rng(o, x, y, 2);
  paintFn(c, x, y, w, h, () => { const v = r(); return v < 0.14 ? mk[3] : v < 0.3 ? mk[1] : mk[2]; });
  const tint = [hue(base, 0.025, 0.04, 0.04), hue(base, -0.025, -0.05, -0.03), mix(base, "#b07040", 0.3), mix(base, "#5a3a54", 0.3)];
  const bwid = bw - 1, bhei = bh - 1;
  clip(c, x, y, w, h, () => {
    const rows = ceil(h / bh) + 1;
    for (let row = 0; row < rows; row++) {
      const by = y + row * bh, off = row % 2 ? -floor(bw / 2) : 0;
      for (let bx = x + off; bx < x + w; bx += bw) {
        let col = r() < 0.06 ? mix(k[1], k[0], 0.5) : mix(k[2], r() < 0.5 ? k[1] : k[3], r() * 0.6);
        if (r() < 0.22) col = mix(col, pk(r, tint), 0.5);
        R(c, bx, by, bwid, bhei, col);
        HL(c, bx, by, bwid, mix(col, k[4], 0.38));
        HL(c, bx, by + bhei - 1, bwid, mix(col, k[0], 0.42));
        VL(c, bx, by + 1, bhei - 2, mix(col, k[3], 0.2));
        VL(c, bx + bwid - 1, by + 1, bhei - 2, mix(col, k[1], 0.3));
        const n = 2 + floor(r() * 4);
        for (let i = 0; i < n; i++) P(c, bx + 1 + floor(r() * (bwid - 2)), by + 1 + floor(r() * max(1, bhei - 2)), r() < 0.5 ? mix(col, k[1], 0.45) : mix(col, k[3], 0.5));
        if (r() < worn * 0.9) {                                   /* chipped corner */
          const cx = bx + (r() < 0.5 ? 0 : bwid - 1), cy = by + (r() < 0.5 ? 0 : bhei - 1);
          P(c, cx, cy, mk[2]); if (r() < 0.4) P(c, cx + (cx === bx ? 1 : -1), cy, mk[2]);
        }
        if (r() < worn * 0.18) R(c, bx + ri(r, 1, max(1, bwid - 5)), by + 1, ri(r, 2, 4), ri(r, 1, 2), mk[1]);   /* spalled face */
      }
    }
    if (worn > 0.05) {
      const nzs = noise2(floor(r() * 4e9));
      dshade(c, x, y, w, h, k[0], (px, py) => max(0, nzs(px / 34, py / 22) - 0.58) * 2.6 * worn * 2.2, 0.32);
      const eff = round(worn * w * h / 700);
      for (let i = 0; i < eff; i++) { const ex = x + floor(r() * w), ey = y + floor(r() * h); P(c, ex, ey, "#d6cccc"); if (r() < 0.5) P(c, ex + 1, ey, "#b8aaaa"); }
    }
  });
};

/* ---- perspective helpers ----------------------------------------------------------- */
/* row boundaries (ascending) of a floor plane with a virtual horizon at hy, bottom row height rhB */
function perspRows(y, h, hy, rhB) {
  y = round(y); h = round(h);
  if (hy >= y) hy = y - 1;
  const db = y + h - hy, dn = db - rhB, out = [y + h];
  if (dn > 1) {
    const dl = 1 / dn - 1 / db; let inv = 1 / db;
    for (let n = 0; n < 300; n++) {
      inv += dl; const yy = round(hy + 1 / inv);
      if (yy <= y) break;
      if (yy < out[out.length - 1]) out.push(yy);
    }
  }
  out.push(y);
  return out.reverse();
}

/* ---- wooden floor ------------------------------------------------------------------ */
PK.planks = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w == null ? 640 - x : w); h = round(h == null ? 256 - y : h);
  const base = o.base || "#8a5a3e", k = K(base), seam = o.seam || k[0], r = rng(o, x, y, 3);
  const hy = o.horizonY != null ? o.horizonY : y - h * 0.9;
  const rhB = o.plankH || clamp(round(h / 7), 6, 18);
  const ys = perspRows(y, h, hy, rhB), db = y + h - max(hy, -9999) - 0;
  const dbase = y + h - min(hy, y - 1);
  const variants = [k[2], mix(k[2], k[3], 0.4), mix(k[2], k[1], 0.4), mix(k[2], k[3], 0.75), mix(k[2], k[1], 0.7)];
  for (let i = 0; i < ys.length - 1; i++) {
    const ya = ys[i], yb = ys[i + 1], rh = yb - ya;
    const s = ((ya + yb) / 2 - min(hy, y - 1)) / dbase;
    let px = x - floor(r() * 200 * s);
    while (px < x + w) {
      const len = max(14, round(ri(r, 110, 250) * max(0.4, s)));
      const x0 = max(px, x), x1 = min(px + len, x + w), pw = x1 - x0;
      if (pw > 0) {
        const col = pk(r, variants);
        R(c, x0, ya, pw, rh, col);
        if (rh > 4) HL(c, x0, ya + 1, pw, mix(col, k[4], 0.3));
        if (rh > 7) HL(c, x0, yb - 1, pw, mix(col, k[0], 0.28));
        HL(c, x0, ya, pw, seam);
        const ng = round(pw * rh / 70);
        for (let g = 0; g < ng; g++) {
          const gx = x0 + floor(r() * pw), gy = ya + 1 + floor(r() * max(1, rh - 2)), gl = max(2, round(ri(r, 3, 16) * max(0.5, s)));
          R(c, gx, gy, min(gl, x1 - gx), 1, r() < 0.55 ? mix(col, k[1], 0.5) : mix(col, k[3], 0.45));
        }
        if (rh >= 8 && r() < 0.14) {
          const kx = x0 + 3 + floor(r() * max(1, pw - 8)), ky = ya + floor(rh / 2);
          ell(c, kx, ky, 3, max(1, floor(rh / 5)), mix(col, k[1], 0.55)); ell(c, kx, ky, 1, 0, k[0]);
        }
        if (r() < 0.25) { const sx = x0 + floor(r() * pw); R(c, sx, ya + 1 + floor(r() * max(1, rh - 2)), ri(r, 2, 6), 1, mix(col, k[4], 0.5)); }
        if (px >= x) {                                                    /* butt joint */
          VL(c, px, ya, rh, seam);
          if (rh > 3 && px + 1 < x + w) VL(c, px + 1, ya + 1, rh - 1, mix(col, k[4], 0.3));
          if (rh > 5 && px + 3 < x + w) { P(c, px + 3, ya + floor(rh / 2), k[0]); P(c, px + 3, ya + floor(rh / 2) - 1, k[3]); }
        }
      }
      px += len;
    }
  }
  const fh = max(4, round(h * 0.22));
  dshade(c, x, y, w, fh, k[0], (px, py) => (1 - (py - y) / fh), 0.5);
};

/* ---- floor tiles in perspective ---------------------------------------------------- */
PK.tiles = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w == null ? 640 - x : w); h = round(h == null ? 256 - y : h);
  const A = o.a || "#c8c4d4", checker = o.checker != null ? !!o.checker : o.b != null;
  const B = o.b || mix(A, "#241838", 0.6), grout = o.grout || mix(A, "#241838", 0.35);
  const ka = K(A), kb = K(B), size = o.size || 36, r = rng(o, x, y, 4);
  const hy = o.horizonY != null ? o.horizonY : y - h * 0.9, vx = o.vx != null ? o.vx : x + w / 2;
  const persp = o.persp == null ? 1 : o.persp;
  const db = y + h - min(hy, y - 1);
  const ys = perspRows(y, h, hy, max(3, round(size * (o.squash || 0.34))));
  const tone = (i, m, kk) => { let v = (Math.imul(i * 7919 + m * 104729 + 13, 2654435761) >>> 0) % 7; return v === 0 ? mix(kk[2], kk[3], 0.18) : v === 1 ? mix(kk[2], kk[1], 0.16) : kk[2]; };
  for (let i = 0; i < ys.length - 1; i++) {
    const ya = ys[i], yb = ys[i + 1];
    for (let yy = ya; yy < yb; yy++) {
      const s = lerp(1, (yy + 0.5 - min(hy, y - 1)) / db, persp), cw = max(4, size * s);
      let m = floor((x - vx) / cw);
      for (;;) {
        const x0f = vx + m * cw, x1f = x0f + cw;
        if (x0f >= x + w) break;
        const sx0 = round(x0f), sx1 = round(x1f), cx0 = max(sx0, x), cx1 = min(sx1, x + w);
        if (cx1 > cx0) {
          const isB = checker && ((i + m) & 1);
          const kk = isB ? kb : ka, col = tone(i, m, kk);
          let line_ = col;
          if (yy === ya) line_ = grout;
          else if (yy === ya + 1) line_ = mix(col, kk[4], 0.36);
          else if (yy === yb - 1 && yb - ya > 4) line_ = mix(col, kk[0], 0.3);
          R(c, cx0, yy, cx1 - cx0, 1, line_);
          if (yy !== ya) {
            if (sx0 >= x && sx0 < x + w) P(c, sx0, yy, grout);
            if (sx0 + 1 >= x && sx0 + 1 < x + w && yy > ya + 1) P(c, sx0 + 1, yy, mix(col, kk[3], 0.4));
          }
        }
        m++;
      }
    }
  }
  speckle(c, x, y, w, h, [ka[1], kb[3]], 0.004, floor(r() * 9e6));
  const fh = max(4, round(h * 0.2));
  dshade(c, x, y, w, fh, "#140c24", (px, py) => (1 - (py - y) / fh) * 0.9, 0.4);
};

/* ---- glossy subway wall tiles -------------------------------------------------------- */
PK.wallTiles = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w == null ? 640 - x : w); h = round(h == null ? 256 - y : h);
  const base = o.base || "#d9d5df", grout = o.grout || mix(base, "#4a4058", 0.42), size = o.size || 12, th = max(3, round(size / 2));
  const k = K(base), r = rng(o, x, y, 5);
  R(c, x, y, w, h, grout);
  clip(c, x, y, w, h, () => {
    const rows = ceil(h / th) + 1;
    for (let row = 0; row < rows; row++) {
      const ty = y + row * th, off = row % 2 ? -floor(size / 2) : 0;
      for (let tx = x + off; tx < x + w; tx += size) {
        const v = r(), col = v < 0.12 ? mix(k[2], k[1], 0.12) : v < 0.26 ? mix(k[2], k[3], 0.25) : k[2];
        R(c, tx, ty, size - 1, th - 1, col);
        HL(c, tx, ty, size - 1, k[4]);
        HL(c, tx, ty + th - 2, size - 1, mix(col, k[1], 0.4));
        VL(c, tx, ty + 1, th - 3, mix(col, k[4], 0.5));
        if (r() < 0.05) P(c, tx + ri(r, 2, size - 4), ty + ri(r, 1, th - 3), k[1]);
      }
    }
    /* diagonal glaze sheen */
    dshade(c, x, y, w, h, "#ffffff", (px, py) => {
      const d = ((px + py * 1.6) % 96 + 96) % 96;
      return d < 7 ? (1 - abs(d - 3.5) / 3.5) * 0.9 : 0;
    }, 0.28);
    /* grime toward the floor and the ceiling */
    dshade(c, x, y + h - 14, w, 14, "#2a2038", (px, py) => (py - (y + h - 14)) / 14 * 0.9, 0.34);
    dshade(c, x, y, w, 8, "#2a2038", (px, py) => (1 - (py - y) / 8) * 0.8, 0.3);
  });
  if (o.band) {
    const b = o.band === true ? {} : o.band, bh = b.h || 9, by = y + (b.y != null ? b.y : round(h * 0.38));
    const ca = b.a || "#2f7a5c", cb = b.b || "#d8cfa0", style = b.style || "key";
    R(c, x, by - 1, w, bh + 2, grout);
    for (let py = 0; py < bh; py += 3) for (let px = 0; px < w; px += 3) {
      const gx = px / 3, gy = py / 3;
      let a;
      if (style === "check") a = (gx + gy) & 1;
      else if (style === "stripe") a = gy === 1 ? 1 : 0;
      else a = ((gx % 4 === 0) || (gy === 1 && gx % 4 !== 3) || (gy === 0 && gx % 4 === 0)) ? 1 : 0;
      const col = a ? cb : ca, kk = K(col);
      R(c, x + px, by + py, 2, 2, col); P(c, x + px, by + py, kk[3]);
      R(c, x + px + 2, by + py, 1, 3, grout); R(c, x + px, by + py + 2, 3, 1, grout);
    }
  }
};

/* ---- concrete -------------------------------------------------------------------------- */
PK.concrete = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w == null ? 640 - x : w); h = round(h == null ? 256 - y : h);
  const base = o.base || "#7a768a", k = K(base), r = rng(o, x, y, 6), nz = noise2(floor(r() * 4e9)), cl = mix(k[2], k[3], 0.55), cd = mix(k[2], k[1], 0.55);
  paintFn(c, x, y, w, h, (px, py) => {
    const n = nz(px / 40, py / 30) * 0.6 + nz(px / 6 + 11, py / 5 + 3) * 0.4, v = (n - 0.5) * 2.6, a = abs(v) - 0.22;
    if (a > 0 && a * 1.8 > thr(px, py)) return v > 0 ? cl : cd;
    return k[2];
  });
  /* formwork seams + tie holes */
  const sy = o.panelH || 36;
  for (let yy = y + sy; yy < y + h - 4; yy += sy) {
    HL(c, x, yy, w, k[1]); HL(c, x, yy + 1, w, k[3]);
    for (let xx = x + 20 + ((yy / sy) % 2) * 28; xx < x + w - 6; xx += 56) { ell(c, xx, yy + sy / 2, 1, 1, k[0]); P(c, xx - 1, yy + sy / 2 - 1, k[3]); AP(c, xx, yy + sy / 2 + 3, k[0], 0.35); }
  }
  for (let xx = x + 90; xx < x + w; xx += 90 + ri(r, 0, 40)) { VL(c, xx, y, h, k[1]); VL(c, xx + 1, y, h, k[3]); }
  speckle(c, x, y, w, h, [k[4], k[3]], 0.014, floor(r() * 9e6));
  speckle(c, x, y, w, h, [k[0], k[1]], 0.016, floor(r() * 9e6));
  const stains = round(w / 90);
  for (let i = 0; i < stains; i++) {
    const sx = x + ri(r, 4, max(5, w - 4)), sl = ri(r, 12, max(13, floor(h * 0.7)));
    for (let j = 0; j < sl; j++) if (thr(sx, y + j) < 0.8 - j / sl * 0.6) AP(c, sx, y + j, k[0], 0.28);
  }
  for (let i = 0; i < 2; i++) crackPath(c, x + ri(r, 6, max(7, w - 6)), y + ri(r, 0, 10), ri(r, 18, 46), r() < 0.5 ? -1 : 1, r, k, x, y, x + w, y + h);
};

/* ---- asphalt -------------------------------------------------------------------------- */
PK.asphalt = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w == null ? 640 - x : w); h = round(h == null ? 256 - y : h);
  const base = o.base || "#363244", k = K(base), r = rng(o, x, y, 7), nz = noise2(floor(r() * 4e9));
  paintFn(c, x, y, w, h, (px, py) => {
    const n = nz(px / 36, py / 12) * 0.5 + nz(px / 9 + 5, py / 5 + 9) * 0.5, v = (n - 0.5) * 2.4, a = abs(v) - 0.14;
    if (a > 0 && a * 1.4 > thr(px, py)) return v > 0 ? k[3] : k[1];
    return k[2];
  });
  const stone = [k[3], k[4], k[1], k[0], mix(k[2], "#5a5a8a", 0.35), mix(k[2], "#8a6a5a", 0.3)];
  speckle(c, x, y, w, h, stone, 0.22, floor(r() * 9e6));
  /* repair patches */
  for (let i = 0; i < 2; i++) {
    const pw = ri(r, 24, 70), ph = ri(r, 8, max(9, floor(h * 0.4))), px = x + ri(r, 0, max(1, w - pw)), py = y + ri(r, 2, max(3, h - ph - 2));
    const pcol = mix(k[2], k[0], 0.35);
    R(c, px, py, pw, ph, pcol); speckle(c, px, py, pw, ph, [k[1], k[3], k[2]], 0.28, floor(r() * 9e6));
    HL(c, px, py, pw, mix(pcol, k[0], 0.5)); HL(c, px, py + ph - 1, pw, mix(pcol, k[3], 0.4)); VL(c, px, py, ph, mix(pcol, k[0], 0.4));
  }
  /* tar-filled cracks */
  for (let i = 0; i < 3; i++) {
    let px = x + ri(r, 0, w), py = y + ri(r, 0, h), dx = r() < 0.5 ? 1 : -1;
    const n = ri(r, 24, 70);
    for (let j = 0; j < n; j++) { if (px < x || px >= x + w || py < y || py >= y + h) break; P(c, px, py, k[0]); if (r() < 0.4) P(c, px, py + 1, mix(k[0], k[3], 0.4)); px += dx; if (r() < 0.45) py += r() < 0.5 ? 1 : -1; }
  }
  /* markings */
  const lines = o.lines ? (Array.isArray(o.lines) ? o.lines : [o.lines]) : [];
  lines.forEach(L => {
    if (L === "double") { const ly = y + round(h * 0.48); [0, 4].forEach(dy => { R(c, x, ly + dy, w, 2, "#e8b830"); HL(c, x, ly + dy, w, "#ffe070"); }); wornLine(c, x, ly - 1, w, 7, r); }
    else if (L === "dashed") { const ly = y + round(h * 0.5); for (let xx = x + 4; xx < x + w; xx += 44) { R(c, xx, ly, 26, 2, "#e8e4f0"); HL(c, xx, ly, 26, "#ffffff"); } }
    else if (L === "edge") { R(c, x, y + 3, w, 2, "#e8e4f0"); R(c, x, y + h - 5, w, 2, "#e8e4f0"); }
    else if (L === "dashedY") { const ly = y + round(h * 0.5); for (let xx = x + 4; xx < x + w; xx += 44) { R(c, xx, ly, 26, 2, "#e8b830"); HL(c, xx, ly, 26, "#ffe070"); } }
  });
  if (o.crosswalk) {
    const cw = o.crosswalk === true ? {} : o.crosswalk, cx0 = cw.x != null ? cw.x : x + floor(w / 2 - 40), cwd = cw.w || 80;
    for (let xx = cx0; xx < cx0 + cwd; xx += 12) { R(c, xx, y + 1, 7, h - 2, "#ddd8e8"); HL(c, xx, y + 1, 7, "#ffffff"); wornLine(c, xx, y + 1, 7, h - 2, r); }
  }
};
function wornLine(c, x, y, w, h, r) {
  const n = round(w * h * 0.1);
  for (let i = 0; i < n; i++) P(c, x + floor(r() * w), y + floor(r() * h), "#4a4658");
}

/* ---- sidewalk + curb ---------------------------------------------------------------- */
PK.sidewalk = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w == null ? 640 - x : w); h = round(h == null ? 256 - y : h);
  const base = o.base || "#8c88a0", k = K(base), r = rng(o, x, y, 8), nz = noise2(floor(r() * 4e9));
  const curbY = o.curbY != null ? round(o.curbY) : y + h - 12, sh_ = max(4, curbY - y);
  /* slabs */
  const rows = sh_ > 30 ? 2 : 1, rh = sh_ / rows;
  for (let ro = 0; ro < rows; ro++) {
    const ry = y + round(ro * rh), rh2 = round((ro + 1) * rh) - round(ro * rh);
    let sx = x - ri(r, 0, 50);
    while (sx < x + w) {
      const sw = ri(r, 56, 84), x0 = max(sx, x), x1 = min(sx + sw, x + w);
      const tone = mix(k[2], r() < 0.5 ? k[1] : k[3], r() * 0.28);
      paintFn(c, x0, ry, x1 - x0, rh2, (px, py) => {
        const n = nz(px / 24, py / 14) * 0.6 + nz(px / 6 + 7, py / 4 + 2) * 0.4, v = (n - 0.5) * 2.2, a = abs(v) - 0.14;
        if (a > 0 && a * 1.4 > thr(px, py)) return v > 0 ? mix(tone, k[4], 0.35) : mix(tone, k[0], 0.35);
        return tone;
      });
      HL(c, x0, ry, x1 - x0, k[1]); HL(c, x0, ry + 1, x1 - x0, mix(tone, k[4], 0.45));
      if (sx >= x) { VL(c, sx, ry, rh2, k[1]); VL(c, sx + 1, ry + 1, rh2 - 1, mix(tone, k[4], 0.35)); }
      /* hairline crack */
      if (r() < 0.55) crackPath(c, x0 + ri(r, 4, max(5, x1 - x0 - 4)), ry + 2, ri(r, 8, max(9, rh2 - 3)), r() < 0.5 ? 1 : -1, r, k, x0, ry, x1, ry + rh2);
      sx += sw;
    }
  }
  speckle(c, x, y, w, sh_, ["#e6e2f6", k[4]], 0.012, floor(r() * 9e6));     /* mica sparkle */
  speckle(c, x, y, w, sh_, k[1], 0.02, floor(r() * 9e6));
  /* stains + gum */
  for (let i = 0; i < w / 120; i++) {
    const sx = x + ri(r, 4, w - 4), sy = y + ri(r, 4, max(5, sh_ - 4)), rx = ri(r, 4, 10), ry2 = ri(r, 2, 4);
    dshade(c, sx - rx, sy - ry2, rx * 2 + 1, ry2 * 2 + 1, k[0], (px, py) => { const dx = (px - sx) / rx, dy = (py - sy) / ry2, d = dx * dx + dy * dy; return d > 1 ? 0 : (1 - d) * 1.3; }, 0.28);
  }
  const gum = o.gum == null ? round(w / 40) : o.gum;
  for (let i = 0; i < gum; i++) {
    const gx = x + ri(r, 2, w - 4), gy = y + ri(r, 3, max(4, sh_ - 3));
    const cc = r() < 0.5 ? "#4a4658" : "#2e2a3a";
    ell(c, gx, gy, 1, r() < 0.5 ? 1 : 0, cc); P(c, gx, gy - 1, mix(cc, "#9a96ac", 0.5));
  }
  /* curb: lit top, granite face, dark gutter lip */
  const cy = curbY, ch = y + h - cy;
  if (ch > 0) {
    const gr = "#7a7690", kg = K(gr);
    R(c, x, cy, w, min(3, ch), kg[4]); if (ch > 1) HL(c, x, cy, w, mix(kg[4], "#fff3d6", 0.3));
    if (ch > 3) {
      paintFn(c, x, cy + 3, w, ch - 3, (px, py) => { const v = r(); return v < 0.1 ? kg[3] : v < 0.2 ? kg[1] : kg[2]; });
      HL(c, x, cy + 3, w, kg[1]);
      if (ch > 6) dshade(c, x, cy + 3, w, ch - 3, kg[0], (px, py) => (py - cy - 3) / (ch - 3) * 1.1, 0.5);
      HL(c, x, y + h - 1, w, kg[0]);
      for (let xx = x + ri(r, 20, 60); xx < x + w; xx += ri(r, 80, 140)) { VL(c, xx, cy + 3, ch - 3, kg[0]); VL(c, xx + 1, cy + 3, ch - 4, kg[3]); }
      for (let i = 0; i < w / 30; i++) { const px = x + ri(r, 0, w - 3); R(c, px, cy + 3 + ri(r, 0, max(0, ch - 6)), ri(r, 1, 3), 1, kg[4]); }
    }
  }
};

/* ---- carpet --------------------------------------------------------------------------- */
PK.carpet = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w == null ? 640 - x : w); h = round(h == null ? 256 - y : h);
  const pattern = o.pattern || "club";
  const defaults = { club: "#241a3c", hotel: "#6a2a3a", stripes: "#3a2a5a", argyle: "#2a4a4a", stars: "#2a1a4a", plain: "#4a3a5a" };
  const base = o.base || defaults[pattern] || "#4a3a5a", k = K(base), r = rng(o, x, y, 9), nz = noise2(floor(r() * 4e9));
  const acc = o.accent || (pattern === "hotel" ? "#d8b060" : null);
  paintFn(c, x, y, w, h, (px, py) => {
    const n = nz(px / 20, py / 14), v = (n - 0.5) * 2.2, a = abs(v) - 0.3;
    if (a > 0 && a * 1.6 > thr(px, py)) return v > 0 ? k[3] : k[1];
    const f = (Math.imul(px * 73 + py * 179, 2654435761) >>> 0) % 100;
    return f < 9 ? k[3] : f < 19 ? k[1] : k[2];
  });
  clip(c, x, y, w, h, () => {
    if (pattern === "club") {
      const cols = o.colors || ["#ff3fa4", "#39d0ff", "#ffd23f", "#a05cff", "#5cff9a"];
      const n = round(w * h / 70);
      for (let i = 0; i < n; i++) {
        const px = x + floor(r() * w), py = y + floor(r() * h), col = mix(pk(r, cols), base, 0.25), kind = floor(r() * 5);
        if (kind === 0) { R(c, px, py, 3, 1, col); P(c, px + 2, py + 1, col); }
        else if (kind === 1) { R(c, px, py, 1, 3, col); P(c, px + 1, py + 2, col); }
        else if (kind === 2) { R(c, px, py, 2, 2, col); }
        else if (kind === 3) { P(c, px, py, col); P(c, px + 1, py + 1, col); P(c, px + 2, py, col); P(c, px + 3, py + 1, col); }
        else { P(c, px, py + 1, col); P(c, px + 1, py, col); P(c, px + 2, py + 1, col); }
      }
    } else if (pattern === "hotel") {
      const G = 24;
      for (let py = y; py < y + h; py++) for (let px = x; px < x + w; px++) {
        const yy = (py - y) * 2, u = (px - x + yy) % G, v = (px - x - yy + G * 100) % G;
        if (u === 0 || v === 0) P(c, px, py, mix(acc, base, 0.4));
        else if ((u === 1 && v !== 0) && false) P(c, px, py, acc);
      }
      for (let py = y; py < y + h; py++) for (let px = x; px < x + w; px++) {
        const yy = (py - y) * 2, u = (px - x + yy) % G, v = (px - x - yy + G * 100) % G;
        if (u === G / 2 && v === G / 2) { P(c, px, py, acc); P(c, px - 1, py, mix(acc, base, 0.35)); P(c, px + 1, py, mix(acc, base, 0.35)); P(c, px, py - 1, mix(acc, base, 0.35)); P(c, px, py + 1, mix(acc, base, 0.35)); }
      }
    } else if (pattern === "stripes") {
      const sw = o.stripe || 10, cb = o.accent || mix(base, "#d8b8ff", 0.25);
      for (let px = x; px < x + w; px += sw * 2) { R(c, px, y, sw, h, cb); for (let yy = y; yy < y + h; yy++) if ((yy + px) % 2 === 0) P(c, px, yy, K(cb)[3]); }
    } else if (pattern === "argyle") {
      const G = 28, cb = o.accent || mix(base, "#d8c070", 0.4);
      for (let py = y; py < y + h; py++) for (let px = x; px < x + w; px++) {
        const yy = (py - y) * 2, u = (px - x + yy) % G, v = (px - x - yy + G * 100) % G;
        if ((u < G / 2) !== (v < G / 2)) P(c, px, py, mix(base, cb, 0.35));
        if (u === 0 || v === 0) P(c, px, py, cb);
      }
    } else if (pattern === "stars") {
      const cb = o.accent || "#f4d870";
      for (let py = y + 4; py < y + h; py += 14) for (let px = x + ((((py - y) / 14) | 0) % 2 ? 11 : 4); px < x + w; px += 22) {
        P(c, px, py, cb); P(c, px - 1, py, mix(cb, base, 0.4)); P(c, px + 1, py, mix(cb, base, 0.4)); P(c, px, py - 1, mix(cb, base, 0.4)); P(c, px, py + 1, mix(cb, base, 0.4));
      }
    }
  });
  const fh = max(4, round(h * 0.2));
  dshade(c, x, y, w, fh, "#140c24", (px, py) => (1 - (py - y) / fh) * 0.9, 0.38);
};

/* =====================================================================================
   CITY & OUTSIDE
   ===================================================================================== */

/* ---- sky --------------------------------------------------------------------------- */
const SKY = {
  night: ["#0a0624", "#140c34", "#1f1146", "#2e1558", "#4a1d66", "#6e2a6e"],
  dusk: ["#1f1a5a", "#4a2a7a", "#8a3a8a", "#d8507a", "#ff8a5a", "#ffc47a"],
  dawn: ["#3a4a8a", "#7a6aa8", "#c88ab8", "#ffa8a0", "#ffd0a0", "#ffeac0"],
  day: ["#4a8ae0", "#6aa4f0", "#8fb4f5", "#b0cef8", "#d8e4f8", "#f4ead8"]
};
const CLOUD = { night: ["#3a2a5a", "#1a1038"], dusk: ["#ffb09a", "#7a3a7a"], dawn: ["#ffd8c0", "#b080b0"], day: ["#fbf8ff", "#a8b8e8"] };
function cloud(c, cx, cy, cw, cols, r) {
  const n = ri(r, 4, 7), lump = [];
  for (let i = 0; i < n; i++) lump.push([cx - cw / 2 + (i + 0.5) * cw / n + ri(r, -3, 3), cy - ri(r, 0, 4), ri(r, 5, 9) * cw / 70 + 3, ri(r, 2, 5)]);
  lump.forEach(l => ell(c, l[0], l[1] + 2, l[2], l[3], cols[1]));                 /* shadow layer */
  lump.forEach(l => ell(c, l[0], l[1], l[2], l[3], mix(cols[0], cols[1], 0.2)));
  lump.forEach(l => ell(c, l[0] - 1, l[1] - 1, max(1, l[2] - 2), max(1, l[3] - 1), cols[0]));
  dshade(c, cx - cw / 2 - 12, cy + 1, cw + 24, 7, cols[1], (px, py) => (py - cy - 1) / 6 * 0.9, 0.5);   /* dithered underside */
  lump.forEach(l => { if (r() < 0.7) HL(c, l[0] - 2, l[1] - l[3], 4, "#ffffff"); });
}
PK.sky = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w == null ? 640 - x : w); h = round(h == null ? 256 - y : h);
  const time = o.time || "night", r = rng(o, x, y, 20), cols = SKY[time] || SKY.night;
  clip(c, x, y, w, h, () => {
    gradient(c, x, y, w, h, o.colors || cols, 1, true);
    const stars = o.stars != null ? (o.stars === true ? round(w * h / 650) : o.stars) : (time === "night" ? round(w * h / 650) : time === "dusk" || time === "dawn" ? round(w * h / 3500) : 0);
    for (let i = 0; i < stars; i++) {
      const sx = x + floor(r() * w), sy = y + floor(r() * h * (time === "night" ? 0.72 : 0.4)), v = r();
      if (v < 0.07) { P(c, sx, sy, "#ffffff"); P(c, sx - 1, sy, "#8f84d8"); P(c, sx + 1, sy, "#8f84d8"); P(c, sx, sy - 1, "#8f84d8"); P(c, sx, sy + 1, "#8f84d8"); }
      else P(c, sx, sy, v < 0.5 ? "#ffffff" : v < 0.8 ? "#b9a8ff" : "#9fe8ff");
    }
    const moon = o.moon != null ? o.moon : time === "night";
    if (moon) {
      const m = moon === true ? {} : moon, mr = m.r || clamp(round(h * 0.07), 3, 10);
      const mx = m.x != null ? m.x : x + round(w * (0.55 + r() * 0.35)), my = m.y != null ? m.y : y + round(h * (0.12 + r() * 0.15));
      haloPts(c, mx, my, mr * 3.4, "#d8d0ff", 0.55);
      ball(c, mx, my, mr, "#f2e7c4");
      if (mr >= 5) { P(c, mx - 2, my - 1, "#cfc298"); P(c, mx + 1, my + 2, "#cfc298"); P(c, mx + 2, my - 2, "#d8cca4"); P(c, mx - 1, my + 2, "#d8cca4"); }
    }
    if (o.sun) {
      const s = o.sun === true ? {} : o.sun, sr = s.r || clamp(round(h * 0.09), 4, 12);
      const sx = s.x != null ? s.x : x + round(w * 0.25), sy = s.y != null ? s.y : y + round(h * 0.6);
      haloPts(c, sx, sy, sr * 4.5, time === "day" ? "#fff6c8" : "#ffb070", 0.9);
      ell(c, sx, sy, sr, sr, "#fff6dc"); ell(c, sx, sy, sr - 2, sr - 2, "#ffffff");
    }
    const clouds = o.clouds != null ? o.clouds : time !== "night";
    if (clouds) {
      const n = o.clouds > 1 ? o.clouds : max(1, round(w / 170));
      for (let i = 0; i < n; i++) cloud(c, x + floor((i + 0.2 + r() * 0.6) * w / n), y + round(h * (0.12 + r() * 0.4)), ri(r, 36, 86), CLOUD[time] || CLOUD.day, r);
    }
  });
};

/* ---- skyline ----------------------------------------------------------------------- */
function waterTower(c, x, y, col, k) {
  /* x = centre, y = base of legs ; ~9 wide x 13 tall */
  R(c, x - 3, y - 5, 1, 5, k[1]); R(c, x + 3, y - 5, 1, 5, k[1]); R(c, x - 3, y - 3, 7, 1, k[1]);
  R(c, x - 4, y - 11, 9, 6, mix(col, "#7a5a3a", 0.35)); HL(c, x - 4, y - 11, 9, mix(col, "#a07a50", 0.4));
  VL(c, x + 4, y - 10, 5, k[0]); HL(c, x - 4, y - 8, 9, k[0]); HL(c, x - 4, y - 6, 9, k[0]);
  poly(c, [[x - 5, y - 11], [x, y - 14], [x + 5, y - 11]], mix(col, "#6a4a30", 0.3));
}
PK.skyline = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w == null ? 640 - x : w); h = round(h == null ? 256 - y : h);
  const night = !!o.night, layers = o.layers == null ? 2 : o.layers, r = rng(o, x, y, 21), em = [];
  const bottom = y + h;
  const far = night ? "#2a1e4c" : "#a9a1c8", near = night ? "#120a26" : "#6a628c";
  const glow = night ? "#c0508a" : "#ffe0b8";
  clip(c, x, y, w, h, () => {
    for (let L = 0; L < layers; L++) {
      const t = layers === 1 ? 1 : L / (layers - 1), body = mix(far, near, t), kk = K(body);
      const hmin = lerp(0.3, 0.2, t), hmax = lerp(0.82, 0.58, t), bwMin = round(lerp(6, 11, t)), bwMax = round(lerp(14, 26, t));
      const ws = t > 0.5 ? 2 : 1, stepX = ws === 2 ? 4 : 3, stepY = ws === 2 ? 5 : 4;
      let bx = x - ri(r, 0, 6);
      const tops = new Int16Array(w + 16).fill(30000);
      const markTop = (a, b, tp) => { for (let q = max(a, x); q < min(b, x + w); q++) if (tp < tops[q - x]) tops[q - x] = tp; };
      const rim = night ? mix(body, "#8a70c0", 0.45) : mix(body, "#ffffff", 0.35);
      const nTall = layers > 1 ? 0.25 : 0.15;
      while (bx < x + w) {
        const bw = ri(r, bwMin, bwMax), bh = round(h * lerp(hmin, hmax, r() < nTall ? 0.7 + r() * 0.3 : r() * r() * 0.9 + 0.1));
        let top = bottom - bh;
        R(c, bx, top, bw, bh, body); markTop(bx, bx + bw, top);
        HL(c, bx, top, bw, rim); VL(c, bx, top, bh, mix(body, rim, 0.45)); VL(c, bx + bw - 1, top, bh, kk[1]);
        if (bw >= 12 && r() < 0.45) {                                  /* setback tier */
          const st = ri(r, 4, 9); R(c, bx + 3, top - st, bw - 6, st, body); HL(c, bx + 3, top - st, bw - 6, rim); VL(c, bx + 3, top - st, st, mix(body, rim, 0.4)); markTop(bx + 3, bx + bw - 3, top - st); top -= st;
          if (r() < 0.5) { R(c, bx + 6, top - 3, max(2, bw - 12), 3, body); markTop(bx + 6, bx + bw - 6, top - 3); top -= 3; }
        }
        if (t > 0.3 && bw >= 10 && r() < 0.22) waterTower(c, bx + ri(r, 5, bw - 5), top, body, kk);
        else if (r() < 0.28) { const ah = ri(r, 3, 9); VL(c, bx + ri(r, 2, bw - 3), top - ah, ah, kk[1]); if (night && t > 0.3 && r() < 0.7) { const ax = bx + 2; em.push([ax, top - ah - 1, 1, 1]); P(c, ax, top - ah - 1, "#ff4040"); } }
        else if (r() < 0.2) { R(c, bx + 2, top - 2, 3, 2, kk[1]); }
        /* windows */
        const wx0 = bx + 2, wx1 = bx + bw - 2, wy0 = top + 3;
        for (let wy = wy0; wy < bottom - 2; wy += stepY) {
          for (let wx = wx0; wx + ws <= wx1; wx += stepX) {
            if (wx < x || wx >= x + w) continue;
            if (night) {
              if (r() < lerp(0.1, 0.34, t)) {
                const col = r() < 0.72 ? pk(r, ["#ffd27a", "#ffe2a0", "#ffb04a"]) : r() < 0.7 ? "#9fe8ff" : "#ff9ad5";
                R(c, wx, wy, ws, ws, col); em.push([wx, wy, ws, ws]);
              } else if (r() < 0.45) P(c, wx, wy, mix(body, "#4a3a7a", 0.45));
            } else {
              const v = r();
              R(c, wx, wy, ws, ws, v < 0.2 ? mix(body, "#e8f0ff", 0.4) : v < 0.35 ? kk[4] : mix(body, "#2a3068", 0.5));
              if (ws === 2 && v < 0.2) P(c, wx, wy, "#ffffff");
            }
          }
        }
        bx += bw + (t < 0.5 ? 0 : ri(r, 0, 2));
      }
      /* spire sits between layers */
      if (o.spire && L === max(0, layers - 2)) {
        const sx = o.spireX != null ? o.spireX : x + round(w * 0.64), sb = bottom, sc = mix(far, near, min(1, t + 0.15)), sk = K(sc);
        const sw = clamp(round(w * 0.05), 12, 20), sH = round(h * 0.9);
        R(c, sx - sw / 2, sb - sH * 0.55, sw, sH * 0.55, sc);
        R(c, sx - sw / 2 + 2, sb - sH * 0.72, sw - 4, sH * 0.17, sc);
        R(c, sx - sw / 2 + 4, sb - sH * 0.84, sw - 8, sH * 0.12, sc);
        R(c, sx - 2, sb - sH * 0.94, 4, sH * 0.1, sc);
        VL(c, sx, sb - sH - 2, round(sH * 0.08) + 2, sk[1]);
        [[sx - sw / 2, sb - sH * 0.55], [sx - sw / 2 + 2, sb - sH * 0.72], [sx - sw / 2 + 4, sb - sH * 0.84], [sx - 2, sb - sH * 0.94]].forEach(p => VL(c, p[0], p[1], 5, mix(sc, night ? "#8a70c0" : "#ffffff", 0.4)));
        const tiers = [[sx - sw / 2, sb - sH * 0.55, sw, sH * 0.55], [sx - sw / 2 + 2, sb - sH * 0.72, sw - 4, sH * 0.17], [sx - sw / 2 + 4, sb - sH * 0.84, sw - 8, sH * 0.12]];
        tiers.forEach(tr => { for (let wy = round(tr[1]) + 4; wy < round(tr[1] + tr[3]) - 2 && wy < sb - 4; wy += 4) for (let wx = round(tr[0]) + 2; wx < round(tr[0] + tr[2]) - 2; wx += 3) {
          if (night) { if (r() < 0.38) { P(c, wx, wy, pk(r, ["#ffd27a", "#ffe2a0", "#ffb04a"])); em.push([wx, wy, 1, 1]); } else if (r() < 0.4) P(c, wx, wy, mix(sc, "#4a3a7a", 0.45)); }
          else P(c, wx, wy, r() < 0.2 ? mix(sc, "#e8f0ff", 0.4) : mix(sc, "#2a3068", 0.45));
        } });
        if (night) {
          const lc = o.spireColor || "#ffe2a0";
          [[sx - 2, sb - sH * 0.94, 4, sH * 0.1], [sx - sw / 2 + 4, sb - sH * 0.84, sw - 8, 3], [sx - sw / 2 + 2, sb - sH * 0.72, sw - 4, 2]].forEach(q => {
            dshade(c, round(q[0]), round(q[1]), round(q[2]), round(q[3]), lc, () => 0.7, 0.85);
            em.push([round(q[0]), round(q[1]), round(q[2]), round(q[3])]);
          });
          P(c, sx, round(sb - sH - 2), "#ff4040"); em.push([sx, round(sb - sH - 2), 1, 1]);
        }
      }
      /* atmospheric haze: strongest on far layers, warm city glow at night */
      if (t < 1) {
        const hz = 0.55 * (1 - t) + 0.12;
        dshade(c, x, y, w, h, glow, (px, py) => py < tops[px - x] ? 0 : clamp(1 - (py - y) / (h * 0.9), 0, 1) * 0.85, hz * (night ? 0.55 : 0.75));
      }
    }
    if (night) dshade(c, x, bottom - 14, w, 14, "#ff9a5a", (px, py) => (py - (bottom - 14)) / 14 * 0.7, 0.18);
  });
  return em;
};

/* ---- bridge ------------------------------------------------------------------------- */
PK.bridge = function (c, x, y, w, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 300);
  const night = !!o.night, H = o.h || round(w * 0.3), col = o.color || (night ? "#2a1f4a" : "#7a7298"), kk = K(col), em = [];
  const t1 = x + round(w * 0.22), t2 = x + round(w * 0.78), top = y - H, rimC = night ? "#6a58a0" : "#b8b0d4";
  /* deck + truss */
  R(c, x, y, w, 3, kk[2]); HL(c, x, y, w, rimC); HL(c, x, y + 2, w, kk[1]);
  for (let i = 0; i < w; i += 6) { line(c, x + i, y + 3, x + i + 3, y + 8, kk[1]); line(c, x + i + 3, y + 8, x + i + 6, y + 3, kk[1]); }
  HL(c, x, y + 8, w, kk[1]);
  /* towers */
  [t1, t2].forEach(tx => {
    [tx - 6, tx + 4].forEach(lx => { R(c, lx, top, 3, H + 8, kk[2]); VL(c, lx, top, H + 8, rimC); VL(c, lx + 2, top, H + 8, kk[1]); });
    for (let by = top + 8; by < y; by += 16) {
      R(c, tx - 6, by, 13, 2, kk[2]); HL(c, tx - 6, by, 13, rimC);
      line(c, tx - 3, by + 2, tx + 4, by + 14, kk[1]); line(c, tx + 4, by + 2, tx - 3, by + 14, kk[1]);
    }
    R(c, tx - 8, top - 3, 17, 4, kk[2]); HL(c, tx - 8, top - 3, 17, rimC); R(c, tx - 2, top - 7, 5, 4, kk[2]);
    if (night) { R(c, tx - 1, top - 9, 3, 2, "#ff4040"); em.push([tx - 1, top - 9, 3, 2]); for (let by = top + 4; by < y; by += 12) { P(c, tx - 7, by, "#ffd27a"); P(c, tx + 7, by, "#ffd27a"); em.push([tx - 7, by, 1, 1], [tx + 7, by, 1, 1]); } }
  });
  /* cables + hangers */
  const topY = top - 1, sagMax = H - 9;
  const cable = (xa, ya, xb, yb, par) => {
    for (let px = xa; px <= xb; px++) {
      const u = (px - xa) / max(1, xb - xa);
      const cy = round(lerp(ya, yb, u) + (par ? sagMax * 4 * u * (1 - u) : 0));
      P(c, px, cy, kk[3]); P(c, px, cy + 1, kk[1]);
      if ((px - xa) % 6 === 0 && cy + 2 < y) { VL(c, px, cy + 2, y - cy - 2, mix(kk[1], kk[2], 0.4)); }
      if (night && (px - xa) % 9 === 0) { P(c, px, cy - 1, "#fff0c8"); em.push([px, cy - 1, 1, 1]); }
    }
  };
  cable(x, y - round(H * 0.3), t1 - 5, topY, false);
  cable(t1 - 5, topY, t2 - 5, topY, true);
  cable(t2 - 5, topY, x + w - 1, y - round(H * 0.3), false);
  if (night) {
    for (let px = x + 2; px < x + w; px += 4) { P(c, px, y - 1, px % 8 === 2 ? "#ff6cbb" : "#ffd27a"); em.push([px, y - 1, 1, 1]); }
    for (let i = 0; i < 4; i++) { const px = x + 10 + i * round(w / 4.3) + (i * 7) % 11; R(c, px, y - 3, 2, 1, "#fff6dc"); em.push([px, y - 3, 2, 1]); }
  }
  return em;
};

/* ---- window --------------------------------------------------------------------------- */
PK.window = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 100); h = round(h || 90);
  const frame = o.frame || "#d8d0e6", kf = K(frame), view = o.view || "city", time = o.time || "night", r = rng(o, x, y, 22);
  const t = o.frameW || 4, gx = x + t, gy = y + t, gw = w - t * 2, gh = h - t * 2, em = [];
  const night = time === "night" || time === "dusk";
  /* depth cast on the wall around the window */
  dshade(c, x - 3, y + h + 3, w + 6, 6, "#0c0618", (px, py) => 1 - (py - (y + h + 3)) / 6, 0.4);
  R(c, x, y, w, h, kf[2]);
  const midY = gy + floor(gh / 2) - 1;
  const openAmt = o.open ? round(gh * 0.34) : 0;
  clip(c, gx, gy, gw, gh, () => {
    if (view === "city") {
      PK.sky(c, gx, gy, gw, gh, { time, seed: r() * 1e6 | 0, moon: night && time === "night" ? { x: gx + round(gw * 0.78), y: gy + round(gh * 0.18), r: clamp(round(gh * 0.07), 3, 6) } : false });
      if (o.bridge !== false && gw >= 80) { em.push.apply(em, PK.bridge(c, gx - 6, gy + gh - round(gh * 0.2), round(gw * 0.7), { night, h: round(gh * 0.2) })); }
      em.push.apply(em, PK.skyline(c, gx, gy + round(gh * 0.28), gw, round(gh * 0.72), { night, layers: gw >= 70 ? 3 : 2, spire: gw >= 90, seed: r() * 1e6 | 0, spireX: gx + round(gw * 0.7) }));
    } else if (view === "brick") {
      PK.brick(c, gx, gy, gw, gh, { base: night ? "#6a3a40" : "#8a4a3e", worn: 0.5, seed: r() * 1e6 | 0 });
      dshade(c, gx, gy, gw, gh, "#0c0618", (px, py) => 0.25 + (py - gy) / gh * 0.6, 0.45);
    } else if (view === "airshaft") {
      PK.brick(c, gx, gy, gw, gh, { base: night ? "#5a3038" : "#7a4440", worn: 0.7, seed: r() * 1e6 | 0, bw: 12, bh: 5 });
      dshade(c, gx, gy, gw, gh, "#06020e", (px, py) => 0.45 + (py - gy) / gh * 0.55, 0.62);
      const ww = max(8, round(gw * 0.3)), wx = gx + round(gw * 0.55), wy = gy + round(gh * 0.3), wh = round(ww * 1.3);
      R(c, wx - 1, wy - 1, ww + 2, wh + 2, "#2a2030"); R(c, wx, wy, ww, wh, night ? "#ffcf80" : "#4a5a7a");
      if (night) { VL(c, wx + floor(ww / 2), wy, wh, "#8a5a30"); HL(c, wx, wy + floor(wh / 2), ww, "#8a5a30"); em.push([wx, wy, ww, wh]); }
      R(c, gx + 3, gy, 2, gh, "#3a3040"); VL(c, gx + 3, gy, gh, "#6a6078");                /* drain pipe */
      for (let py = gy + 8; py < gy + gh; py += 22) R(c, gx + 2, py, 4, 2, "#4a4058");
      const lineY = gy + round(gh * 0.72);                                                  /* clothesline */
      for (let px = gx + 6; px < gx + gw - 2; px++) P(c, px, lineY + round(sin((px - gx) / (gw - 8) * PI) * 3), "#1c1424");
      R(c, gx + round(gw * 0.35), lineY + 2, 5, 7, "#d8d0e0"); R(c, gx + round(gw * 0.35) + 7, lineY + 3, 4, 6, "#c0302c");
    } else if (view === "interior") {
      const litI = o.lit !== false;
      if (litI) {
        gradient(c, gx, gy, gw, gh, ["#fff0c0", "#ffd890", "#e8a058"], 1, true);
        R(c, gx, gy + round(gh * 0.72), gw, ceil(gh * 0.28), "#b87a48"); HL(c, gx, gy + round(gh * 0.72), gw, "#8a5a30");        /* floor line */
        const lx = gx + floor(gw / 2); ell(c, lx, gy + 6, 5, 3, "#ffffff"); haloPts(c, lx, gy + 6, 14, "#fff6d0", 0.7);              /* ceiling light */
        const cc = o.curtain || "#c0555a", cw = max(4, round(gw * 0.22)), kcu = K(cc);
        [[gx, 1], [gx + gw - cw, -1]].forEach(([cx0]) => { R(c, cx0, gy, cw, gh, cc); for (let q = 0; q < cw; q += 3) VL(c, cx0 + q, gy, gh, q % 6 ? kcu[3] : kcu[1]); });
        if (r() < 0.6) { const px = gx + round(gw * 0.3); R(c, px, gy + round(gh * 0.52), 6, round(gh * 0.2), "#5a3a2a"); ell(c, px + 3, gy + round(gh * 0.5), 5, 4, "#3a7a3a"); }
        em.push([gx, gy, gw, gh]);
      } else {
        gradient(c, gx, gy, gw, gh, ["#1a2236", "#0e1220"], 1, true);
        R(c, gx, gy + round(gh * 0.72), gw, ceil(gh * 0.28), "#0a0c16");
        const cc = o.curtain || "#3a2a4a"; R(c, gx, gy, round(gw * 0.2), gh, cc); R(c, gx + gw - round(gw * 0.2), gy, round(gw * 0.2), gh, cc);
      }
    } else {
      gradient(c, gx, gy, gw, gh, ["#120c28", "#1c1238", "#0c0818"], 1, true);
    }
    /* blinds */
    if (o.blinds) {
      const frac = o.blinds === true ? 0.55 : o.blinds, bh = round(gh * frac), bc = o.blindColor || "#cfc4b0", bk = K(bc);
      for (let py = gy; py < gy + bh; py += 3) {
        R(c, gx, py, gw, 2, bk[3]); HL(c, gx, py, gw, bk[4]); HL(c, gx, py + 2, gw, bk[0]);
      }
      R(c, gx, gy + bh, gw, 3, bk[2]); HL(c, gx, gy + bh, gw, bk[4]); HL(c, gx, gy + bh + 2, gw, bk[1]);
      dshade(c, gx, gy, gw, bh + 3, bk[0], (px, py) => (py - gy) / (bh + 3) * 0.8, 0.4);
      VL(c, gx + gw - 5, gy + bh + 3, 8, "#a89c88"); R(c, gx + gw - 6, gy + bh + 10, 3, 3, "#d8ccb4");
    }
    /* glass sheen */
    dshade(c, gx, gy, gw, gh, "#ffffff", (px, py) => {
      const d = ((px - gx) + (py - gy) * 1.0 + 4000) % 70;
      const e = ((px - gx) + (py - gy) * 1.0 + 4000 - 22) % 140;
      return (d < 6 ? 0.9 : 0) + (e < 3 ? 0.8 : 0);
    }, 0.16);
    /* reveal shadow */
    AR(c, gx, gy, gw, 2, "#140c24", 0.42); AR(c, gx, gy + 2, 2, gh - 2, "#140c24", 0.3);
    if (o.bars) {
      const bc = "#1c1626";
      for (let px = gx + 3; px < gx + gw - 2; px += 8) { R(c, px, gy, 2, gh, bc); VL(c, px, gy, gh, "#4a4262"); }
      R(c, gx, gy + round(gh * 0.38), gw, 2, bc); HL(c, gx, gy + round(gh * 0.38), gw, "#4a4262");
    }
  });
  /* frame bars (top/bottom/left/right, rails) */
  const bar = (bx, by, bw, bh) => { R(c, bx, by, bw, bh, kf[2]); HL(c, bx, by, bw, kf[4]); VL(c, bx, by, bh, kf[3]); VL(c, bx + bw - 1, by, bh, kf[1]); HL(c, bx, by + bh - 1, bw, kf[1]); };
  R(c, x, y, w, t, kf[2]); R(c, x, y + h - t, w, t, kf[2]); R(c, x, y, t, h, kf[2]); R(c, x + w - t, y, t, h, kf[2]);
  HL(c, x, y, w, kf[4]); HL(c, x, y + 1, w, kf[3]); VL(c, x, y, h, kf[3]); VL(c, x + w - 1, y, h, kf[1]); HL(c, x, y + h - 1, w, kf[1]);
  HL(c, gx - 1, gy - 1, gw + 2, kf[1]); VL(c, gx - 1, gy - 1, gh + 2, kf[1]); HL(c, gx - 1, gy + gh, gw + 2, kf[3]); VL(c, gx + gw, gy - 1, gh + 2, kf[3]);
  if (gw >= 60) bar(gx + floor(gw / 2) - 2, gy, 4, gh);
  if (view !== "none" || true) {
    if (openAmt) {
      bar(gx, midY - openAmt, gw, 4);                               /* raised lower sash: meeting rail */
      bar(gx, gy + gh - openAmt - 3, gw, 4);
      bar(gx, midY - openAmt, 3, gh - floor(gh / 2) + 2 - 0 > 0 ? gy + gh - openAmt - (midY - openAmt) : 4);
      bar(gx + gw - 3, midY - openAmt, 3, gy + gh - openAmt - (midY - openAmt));
    } else bar(gx, midY, gw, 4);
  }
  /* sill */
  const ks = K(o.sill || "#e4dcef");
  R(c, x - 4, y + h, w + 8, 4, ks[2]); HL(c, x - 4, y + h, w + 8, ks[4]); HL(c, x - 4, y + h + 3, w + 8, ks[1]); VL(c, x - 4, y + h, 4, ks[3]); VL(c, x + w + 3, y + h, 4, ks[1]);
  return em;
};

/* ---- fire escape ------------------------------------------------------------------------- */
PK.fireEscape = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 90); h = round(h || 112);
  const iron = o.color || "#231b30", edge = "#4e4468", dk = "#0e0818", r = rng(o, x, y, 23);
  const railH = 20, ladderH0 = o.ladder === false ? 0 : 22;
  const floors = o.floors || max(1, floor((h - ladderH0 - 2) / 34));
  const deck0 = y + railH + 2, deckL = floors > 1 ? y + h - ladderH0 - 3 : deck0, sp = floors > 1 ? (deckL - deck0) / (floors - 1) : 0;
  for (let f = 0; f < floors; f++) {
    const deckY = round(deck0 + f * sp);
    /* cast shadow on the wall */
    dshade(c, x + 2, deckY + 4, w, 9, "#0c0618", (px, py) => 1 - (py - deckY - 4) / 9, 0.38);
    /* railing */
    R(c, x, deckY - railH, w, 2, iron); HL(c, x, deckY - railH, w, edge);
    HL(c, x, deckY - 10, w, iron);
    for (let px = x; px < x + w; px += 4) { VL(c, px, deckY - railH + 2, railH - 2, iron); if (px % 8 === 0) P(c, px, deckY - railH + 3, edge); }
    [x, x + w - 2].forEach(px => { R(c, px, deckY - railH - 1, 2, railH + 1, iron); VL(c, px, deckY - railH - 1, railH + 1, edge); });
    /* deck + grating */
    R(c, x - 1, deckY, w + 2, 3, iron); HL(c, x - 1, deckY, w + 2, edge); HL(c, x - 1, deckY + 2, w + 2, dk);
    for (let px = x; px < x + w; px += 3) P(c, px, deckY + 3, dk);
    for (let px = x + 3; px < x + w; px += 7) P(c, px, deckY + 1, dk);
    /* stairs down to the next landing, alternating sides */
    if (f < floors - 1) {
      const left = f % 2 === 1, run = round(w * 0.5), rise = round(sp) - 3, sx0 = left ? x + 4 : x + w - 4, sx1 = left ? x + 4 + run : x + w - 4 - run;
      line(c, sx0, deckY + 3, sx1, deckY + 3 + rise, iron); line(c, sx0, deckY + 4, sx1, deckY + 4 + rise, iron); line(c, sx0, deckY + 2, sx1, deckY + 2 + rise, edge);
      const steps = 8;
      for (let s2 = 0; s2 <= steps; s2++) {
        const px = round(lerp(sx0, sx1, s2 / steps)), py = round(lerp(deckY + 3, deckY + 3 + rise, s2 / steps));
        R(c, px - (left ? 0 : 3), py - 1, 4, 2, iron); HL(c, px - (left ? 0 : 3), py - 1, 4, edge);
      }
      line(c, sx0, deckY - railH + 2, sx1, deckY + rise - railH + 2, iron); line(c, sx0, deckY - railH + 1, sx1, deckY + rise - railH + 1, edge);
      for (let s2 = 1; s2 < steps; s2++) { const px = round(lerp(sx0, sx1, s2 / steps)), py = round(lerp(deckY + 3, deckY + 3 + rise, s2 / steps)); VL(c, px, py - railH + 3, railH - 2, iron); }
    }
  }
  if (ladderH0) {
    const lx = x + (o.ladderSide === "left" ? 6 : w - 18), ly = deckL + 3, lh = y + h - ly;
    VL(c, lx, ly, lh, iron); VL(c, lx + 9, ly, lh, iron); VL(c, lx, ly, lh, edge);
    for (let py = ly + 3; py < y + h; py += 4) R(c, lx, py, 10, 1, iron);
  }
  /* rust + chipped paint */
  const n = round(w * h / 300);
  for (let i = 0; i < n; i++) if (r() < 0.5) AP(c, x + floor(r() * w), y + floor(r() * h), "#a0502a", 0.22);
};

/* ---- street furniture ------------------------------------------------------------------------ */
PK.streetlamp = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y);
  const H = o.h || 116, on = o.on !== false && o.on !== 0 && !!(o.on == null ? true : o.on), dir = o.flip ? -1 : 1, arm = o.arm || 24, em = [];
  const iron = o.color || "#2a2438";
  /* base */
  cylV(c, x - 4, y - 8, 9, 8, iron); HL(c, x - 4, y - 8, 9, "#5a5272"); R(c, x - 3, y - 12, 7, 4, iron); HL(c, x - 3, y - 12, 7, "#5a5272");
  /* pole */
  cylV(c, x - 1, y - H, 4, H - 12, iron);
  R(c, x - 2, y - 40, 6, 3, iron); HL(c, x - 2, y - 40, 6, "#5a5272");
  /* arm: quarter-curve out to the head */
  const ax = x + 1, ay = y - H;
  for (let i = 0; i <= arm; i++) {
    const t = i / arm, px = ax + dir * i, py = round(ay + 5 - sqrt(max(0, 1 - (1 - t) * (1 - t))) * 5 - 0);
    R(c, dir > 0 ? px : px - 0, py - 1, 1, 3, iron); P(c, px, py - 1, "#5a5272");
  }
  const hx = ax + dir * arm;
  /* cobra head */
  const hx0 = dir > 0 ? hx - 6 : hx - 12;
  R(c, hx0, ay - 3, 19, 5, iron); HL(c, hx0 + 1, ay - 4, 17, iron); HL(c, hx0 + 1, ay - 3, 17, "#5a5272"); HL(c, hx0 + 2, ay + 2, 15, "#120c1c");
  P(c, hx0, ay - 3, "#5a5272");
  const lens = on ? "#ffc060" : "#5a5470";
  R(c, hx0 + 3, ay + 2, 12, 2, lens);
  if (on) {
    HL(c, hx0 + 4, ay + 2, 10, "#fff2c0"); em.push([hx0 + 3, ay + 2, 12, 2]);
    haloPts(c, hx0 + 9, ay + 4, 34, "#ff9a3a", 1.0, em, 34);
    haloPts(c, hx0 + 9, ay + 4, 12, "#ffd890", 0.9, em, 12);
  }
  return em;
};

PK.hydrant = function (c, x, y, o) {
  o = o || {}; x = round(x) + 3; y = round(y);
  const col = o.color || "#c8322c", k = K(col);
  groundShadow(c, x + 7, y + 20, 9, 2, 0.45);
  cylV(c, x + 2, y + 6, 10, 12, col);                                   /* barrel */
  R(c, x, y + 17, 14, 3, k[2]); HL(c, x, y + 17, 14, k[3]); HL(c, x, y + 19, 14, k[0]);   /* base flange */
  R(c, x + 1, y + 16, 12, 1, k[1]);
  R(c, x + 1, y + 6, 12, 2, k[2]); HL(c, x + 1, y + 6, 12, k[4]); HL(c, x + 1, y + 7, 12, k[0]); /* bonnet band */
  ell(c, x + 7, y + 4, 4, 3, k[2]); ell(c, x + 6, y + 3, 2, 1, k[3]); P(c, x + 5, y + 2, k[4]); HL(c, x + 3, y + 6, 8, k[1]);   /* dome */
  R(c, x + 6, y, 3, 2, k[1]); HL(c, x + 6, y, 3, k[3]);                 /* nut */
  /* side nozzles */
  R(c, x - 2, y + 9, 4, 5, k[2]); VL(c, x - 2, y + 9, 5, k[3]); VL(c, x + 1, y + 9, 5, k[0]); HL(c, x - 2, y + 9, 4, k[4]);
  R(c, x + 12, y + 9, 4, 5, k[2]); VL(c, x + 12, y + 9, 5, k[3]); VL(c, x + 15, y + 9, 5, k[0]); HL(c, x + 12, y + 9, 4, k[4]);
  R(c, x - 3, y + 10, 1, 3, "#c8c4d4"); R(c, x + 16, y + 10, 1, 3, "#c8c4d4");     /* chrome caps */
  /* front nozzle */
  ell(c, x + 7, y + 12, 3, 3, k[1]); ell(c, x + 7, y + 12, 2, 2, k[2]); P(c, x + 6, y + 11, k[4]); P(c, x + 8, y + 13, k[0]);
  for (let i = 0; i < 4; i++) P(c, x + 5 + i, y + 15 + (i % 2), "#9a96ac");  /* chain */
};

PK.trashBags = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y); const r = rng(o, x, y, 24);
  const cols = o.colors || ["#2a2434", "#2a2434", "#1f3a2e", "#3a3448"];
  groundShadow(c, x + 22, y + 27, 24, 3, 0.5);
  const bag = (cx, cy, rx, ry, col) => {
    blob(c, cx, cy, rx, ry, col);
    ell(c, cx - 1, cy - ry - 1, 2, 1, K(col)[1]); P(c, cx - 2, cy - ry - 3, K(col)[1]); P(c, cx + 1, cy - ry - 3, K(col)[1]); P(c, cx, cy - ry - 2, K(col)[0]);   /* tied neck */
    for (let i = 0; i < 4; i++) { const px = cx - rx + 2 + floor(r() * (rx * 2 - 3)), py = cy - ry + 2 + floor(r() * (ry * 2 - 3)); R(c, px, py, ri(r, 1, 3), 1, K(col)[3]); }
  };
  bag(x + 9, y + 20, 9, 7, cols[0]);
  bag(x + 27, y + 21, 8, 6, cols[1]);
  bag(x + 18, y + 11, 8, 7, cols[2]);
  bag(x + 37, y + 22, 5, 4, cols[3]);
  /* junk */
  R(c, x + 29, y + 24, 9, 3, "#c8925a"); HL(c, x + 29, y + 24, 9, "#e0b078"); R(c, x + 31, y + 25, 4, 1, "#c0302c");
  P(c, x + 3, y + 26, "#ffd23f"); P(c, x + 4, y + 26, "#e0b020"); P(c, x + 12, y + 27, "#e8e4f0");
  R(c, x + 40, y + 25, 2, 3, "#3ab8d8"); P(c, x + 40, y + 24, "#9fe8ff");
  /* rip with spill */
  line(c, x + 7, y + 18, x + 11, y + 22, "#0e0a14"); P(c, x + 12, y + 23, "#e8e4f0"); P(c, x + 13, y + 24, "#ff8a4c");
};

PK.manhole = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y);
  const w = o.w || 36, h = o.h || 10, cx = x + floor(w / 2), cy = y + floor(h / 2), rx = floor(w / 2), ry = floor(h / 2), k = K("#3a3648");
  ell(c, cx, cy, rx + 1, ry + 1, k[0]); ell(c, cx, cy, rx, ry, k[2]); ell(c, cx, cy, rx - 2, ry - 1, k[1]);
  for (let i = -rx + 4; i < rx - 3; i += 3) for (let j = -ry + 1; j < ry; j += 2) if ((i / 3 + j / 2) % 2 === 0 || true) { const dx = i / (rx - 2), dy = j / (ry - 1); if (dx * dx + dy * dy < 1) P(c, cx + i, cy + j, (i + j) % 2 ? k[3] : k[0]); }
  HL(c, cx - rx + 2, cy - ry + 1, rx * 2 - 3, k[3]);
  if (o.steam) {
    const r = rng(o, x, y, 25), sh_ = typeof o.steam === "number" ? o.steam : 70;
    for (let i = 0; i < 20; i++) {
      const t = i / 19, py = cy - 3 - t * sh_, px = cx + sin(t * 4.2 + 1) * 7 * t + (r() - 0.5) * 8, prx = 6 + t * 20 + r() * 5, pry = 4 + t * 10 + r() * 3;
      const a = 0.4 * (1 - t * 0.72);
      dshade(c, round(px - prx), round(py - pry), round(prx * 2) + 1, round(pry * 2) + 1, "#e6e0f4", (qx, qy) => { const dx = (qx - px) / prx, dy = (qy - py) / pry, d = dx * dx + dy * dy; return d > 1 ? 0 : (1 - d) * 1.6; }, a + 0.1);
    }
  }
};

PK.stoop = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 120); h = round(h || 80);
  const n = o.steps || 8, flip = !!o.flip, stone = o.stone || "#7a4a44", k = K(stone), r = rng(o, x, y, 26);
  const irn = "#1c1626", ie = "#5a5274";
  const lw = round(w * 0.22), run = (w - lw) / n, rise = h / (n + 1);
  const X = u => flip ? x + w - 1 - u : x + u;                                   /* local u (0..w-1) -> screen x */
  const topAt = u => u < lw ? y : y + round((min(n - 1, floor((u - lw) / run)) + 1) * rise);
  const pat = new Int16Array(64); for (let i = 0; i < 64; i++) pat[i] = floor(r() * 5);
  for (let u = 0; u < w; u++) {
    const top = topAt(u), px = X(u);
    for (let yy = top; yy < y + h; yy++) {
      const course = floor((yy - y) / 9), joint = (yy - y) % 9 === 0, vj = ((u + course * 13) % 24) === 0;
      const tone = pat[(floor((u + course * 13) / 24) * 3 + course) & 63];
      let col = tone === 0 ? k[1] : tone === 1 ? mix(k[2], k[3], 0.3) : k[2];
      if (yy === top) col = k[4]; else if (yy === top + 1) col = k[3];
      else if (joint || vj) col = k[1];
      else if (!(u & 3) && !(yy & 3) && thr(u, yy) < 0.5) col = k[3];
      if (u > 0 && topAt(u - 1) !== top && yy < top + 9) col = k[1];                 /* riser shadow */
      P(c, px, yy, col);
    }
  }
  /* darker toward the street so the stone sits in shade at the base */
  dshade(c, x, y + h - 10, w, 10, "#0c0618", (px, py) => (py - (y + h - 10)) / 10, 0.4);
  /* areaway door under the landing */
  if (o.under !== false) {
    const dw = min(lw + 2, 26), dh = min(round(h * 0.62), 48), du = 5, dy = y + h - dh;
    const a0 = X(du), a1 = X(du + dw - 1), dx = min(a0, a1);
    R(c, dx - 2, dy - 3, dw + 4, dh + 3, k[0]); HL(c, dx - 2, dy - 3, dw + 4, k[3]);
    R(c, dx, dy, dw, dh, "#1a1020"); R(c, dx + 2, dy + 2, dw - 4, dh - 2, "#2a1c34");
    for (let bx = dx + 3; bx < dx + dw - 2; bx += 3) VL(c, bx, dy + 2, dh - 2, irn);
    HL(c, dx + 2, dy + 11, dw - 4, irn); HL(c, dx + 2, dy + dh - 8, dw - 4, irn);
    R(c, dx + dw - 6, dy + floor(dh * 0.5), 2, 3, "#c8b070");
  }
  /* iron railing parallel to the nosing line */
  const uA = lw + 1, uB = w - 8, slope = rise / run;
  const ry = u => (y - 24) + (u - lw) * slope;
  for (let t = 0; t < 2; t++) line(c, X(uA), round(ry(uA)) + t, X(uB), round(ry(uB)) + t, irn);
  line(c, X(uA), round(ry(uA)) - 1, X(uB), round(ry(uB)) - 1, ie);
  line(c, X(uA), round(ry(uA)) + 11, X(uB), round(ry(uB)) + 11, irn);
  for (let u = uA + 3; u < uB; u += 5) { const y0 = round(ry(u)) + 2, y1 = topAt(u); if (y1 > y0) VL(c, X(u), y0, y1 - y0, irn); }
  [[uA, y], [uB, topAt(uB)]].forEach(p => {
    const px = X(p[0]), top2 = p[1] - 28;
    R(c, px - 1, top2, 3, p[1] - top2, irn); VL(c, flip ? px + 1 : px - 1, top2, p[1] - top2, ie);
    ell(c, px, top2 - 2, 2, 2, irn); P(c, px - 1, top2 - 3, ie);
  });
};

PK.awning = function (c, x, y, w, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 120);
  const cols = o.colors || ["#c0302c", "#efe8d8"], h = o.h || 26, slope = round(h * 0.55), val = h - slope, sw = o.stripe || 9;
  const r = rng(o, x, y, 27);
  /* drop shadow on the wall below */
  dshade(c, x + 2, y + h, w - 4, 8, "#0c0618", (px, py) => 1 - (py - y - h) / 8, 0.5);
  /* brackets */
  [x + 6, x + w - 8].forEach(bx => { line(c, bx, y + slope, bx + 1, y, "#1c1626"); line(c, bx + 1, y + slope, bx, y, "#1c1626"); });
  /* sloped canvas */
  for (let px = 0; px < w; px++) {
    const si = floor(px / sw), col = cols[si % cols.length], k = K(col);
    gradient(c, x + px, y, 1, slope, [k[1], k[2], k[3]], 1, true);
  }
  for (let px = sw; px < w; px += sw) VL(c, x + px, y, slope, K(cols[(px / sw) % cols.length])[0]);
  HL(c, x, y, w, "#140c24");
  /* valance with scalloped edge */
  for (let px = 0; px < w; px++) {
    const si = floor(px / sw), col = cols[si % cols.length], k = K(col), loc = (px % sw) - sw / 2, sc = round(2.2 * (1 - (loc * loc) / (sw * sw / 4)));
    const vh = val - 3 + sc;
    R(c, x + px, y + slope, 1, vh, k[2]); P(c, x + px, y + slope + vh - 1, k[0]);
    P(c, x + px, y + slope, k[4]); if (vh > 3) P(c, x + px, y + slope + 1, k[3]);
    if (px % sw === 0) VL(c, x + px, y + slope, vh, k[1]);
  }
  if (o.text) {
    const sc = fitScale(o.text, w - 12, 2), tw = txtW(o.text, sc), tx = round(x + w / 2 - tw / 2), ty = y + slope + 1;
    const pl = sh(cols[0], 0.45), plh = sc * 5 + 3;
    R(c, tx - 4, ty - 1, tw + 8, plh, pl); HL(c, tx - 4, ty - 1, tw + 8, mix(pl, "#ffffff", 0.35)); outline(c, tx - 4, ty - 1, tw + 8, plh, sh(pl, 0.4)); HL(c, tx - 3, ty, tw + 6, mix(pl, "#ffffff", 0.18));
    txt(c, o.text, tx + 1, ty + 1, "#140c24", sc); txt(c, o.text, tx, ty, o.textColor || "#fff6dc", sc);
  }
};

PK.scaffold = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 160); h = round(h || 120);
  const r = rng(o, x, y, 28), tube = "#8e8aa2", tk = K(tube), wood = "#9a6a40", wk = K(wood);
  const levels = o.levels || max(1, floor(h / 38)), lh = h / levels, bay = o.bay || 52;
  /* top shed deck (plywood, green) */
  if (o.shed !== false) {
    R(c, x - 2, y, w + 4, 6, "#27553c"); HL(c, x - 2, y, w + 4, "#3a7a58"); HL(c, x - 2, y + 5, w + 4, "#123022");
    for (let px = x + 20; px < x + w; px += 44) VL(c, px, y + 1, 4, "#123022");
    txtC(c, "WATCH YOUR STEP", x + w / 2, y + 1, "#e8e4f0", 1, 1);
  }
  /* planks decks */
  for (let l = 1; l <= levels; l++) {
    const dy = y + round(l * lh) - 4 + (l === levels ? 3 : 0);
    if (l === levels) continue;
    R(c, x, dy, w, 3, wood); HL(c, x, dy, w, wk[4]); HL(c, x, dy + 2, w, wk[1]);
    for (let px = x + 12; px < x + w; px += 28) VL(c, px, dy, 3, wk[0]);
    HL(c, x, dy + 3, w, tube);  /* ledger tube */
    HL(c, x, dy + 4, w, tk[1]);
  }
  /* poles */
  for (let px = x; px <= x + w; px += bay) {
    const pxx = min(px, x + w - 2); R(c, pxx, y + 6, 2, h - 6, tube); VL(c, pxx, y + 6, h - 6, tk[4]); VL(c, pxx + 1, y + 6, h - 6, tk[1]);
    for (let py = y + 14; py < y + h; py += 18) R(c, pxx - 1, py, 4, 2, tk[3]);                 /* couplers */
  }
  /* diagonal braces */
  let bi = 0;
  for (let px = x; px + bay <= x + w + 1; px += bay, bi++) {
    for (let l = 0; l < levels; l++) {
      const ya = y + 6 + round(l * (h - 6) / levels), yb = y + round((l + 1) * (h - 6) / levels) + 6;
      if ((bi + l) % 2 === 0) { line(c, px + 2, ya + 2, px + bay - 1, yb - 3, tube); line(c, px + 3, ya + 2, px + bay, yb - 3, tk[1]); }
    }
  }
  /* cloth / netting + signage on the lowest level */
  if (o.net) dshade(c, x, y + 6, w, h - 6, "#2a6a46", () => 0.55, 0.5);
};

PK.subwayStairs = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y); const em = [];
  const w = 64, h = 52, k = K("#6e6a82");
  /* kerb + hole */
  R(c, x + 6, y + 8, 52, 4, k[3]); HL(c, x + 6, y + 8, 52, k[4]); HL(c, x + 6, y + 11, 52, k[1]);
  /* descending steps in perspective */
  for (let i = 0; i < 9; i++) {
    const py = y + 12 + i * 4, inset = i * 1.5, sx = round(x + 8 + inset), sw = round(48 - inset * 2);
    const dk = i / 9;
    R(c, sx, py, sw, 3, mix("#8a8698", "#140c24", dk * 0.85)); HL(c, sx, py, sw, mix("#cfcbe0", "#140c24", dk * 0.85));
    R(c, sx, py + 3, sw, 1, mix("#3a364a", "#06020e", dk));
  }
  R(c, x + 6, y + 12, 2, 40, k[1]); R(c, x + 56, y + 12, 2, 40, k[1]);
  dshade(c, x + 8, y + 40, 48, 12, "#06020e", (px, py) => (py - y - 40) / 12, 0.8);
  /* green railings + globe lamps */
  [[x + 3, 1], [x + 59, -1]].forEach(([px, side]) => {
    R(c, px, y + 14, 2, 38, "#16342a"); VL(c, px, y + 14, 38, "#2e6a52");
    R(c, px - 1, y + 22, 4, 2, "#16342a"); R(c, px - 1, y + 38, 4, 2, "#16342a");
    R(c, px - 1, y + 8, 4, 8, "#1a3a30"); VL(c, px - 1, y + 8, 8, "#3a7a5e");
    ball(c, px + 1, y + 5, 3, "#40e080"); P(c, px, y + 3, "#d8ffe8"); P(c, px + 1, y + 3, "#b8ffd0");
    em.push([px - 2, y + 2, 7, 7]);
    haloPts(c, px + 1, y + 5, 18, "#40e080", 0.9, em, 18);
  });
  return em;
};

PK.mailbox = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y);
  const col = o.color || "#2f5ab0", k = K(col);
  groundShadow(c, x + 10, y + 31, 11, 2, 0.45);
  R(c, x + 3, y + 25, 3, 7, "#2a2434"); R(c, x + 14, y + 25, 3, 7, "#2a2434"); VL(c, x + 3, y + 25, 7, "#5a5272");
  cylV(c, x + 1, y + 6, 18, 20, col);
  ell(c, x + 10, y + 7, 9, 5, k[2]); for (let i = 0; i < 5; i++) HL(c, x + 5 + i, y + 3 + (i > 2 ? 4 - i : i), 11 - i * 2 + (i > 2 ? 0 : 0), k[2]);
  ell(c, x + 10, y + 6, 8, 4, k[2]); ell(c, x + 8, y + 5, 4, 2, k[3]); HL(c, x + 6, y + 3, 5, k[4]);
  HL(c, x + 1, y + 10, 18, k[0]);
  R(c, x + 3, y + 11, 14, 3, k[0]); HL(c, x + 4, y + 12, 12, "#0a0614");    /* mail slot lip */
  txt(c, "MAIL", x + 3, y + 15, "#f4f0ff", 1, 0);
  R(c, x + 4, y + 21, 12, 5, k[1]); outline(c, x + 4, y + 21, 12, 5, k[0]); R(c, x + 8, y + 23, 4, 2, "#c8c4d8");  /* pull-down door + handle */
};

PK.newspaperBox = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y);
  const col = o.color || "#d8a020", k = K(col);
  groundShadow(c, x + 8, y + 27, 9, 2, 0.45);
  R(c, x + 2, y + 22, 3, 6, "#2a2434"); R(c, x + 11, y + 22, 3, 6, "#2a2434");
  R(c, x + 1, y + 6, 14, 17, col); HL(c, x + 1, y + 6, 14, k[4]); VL(c, x + 1, y + 6, 17, k[3]); VL(c, x + 14, y + 6, 17, k[1]); HL(c, x + 1, y + 22, 14, k[0]);
  poly(c, [[x, y + 7], [x + 2, y + 1], [x + 14, y + 1], [x + 16, y + 7]], k[3]); HL(c, x + 2, y + 1, 12, k[4]); HL(c, x, y + 7, 16, k[1]);
  R(c, x + 3, y + 9, 10, 8, "#1c1626"); R(c, x + 4, y + 10, 8, 6, "#d8d4c8"); HL(c, x + 4, y + 10, 8, "#9a96a8");  /* window + stack of papers */
  R(c, x + 5, y + 11, 6, 1, "#1c1626"); R(c, x + 5, y + 13, 3, 1, "#6a667a"); R(c, x + 9, y + 13, 2, 2, "#8a8698");
  HL(c, x + 3, y + 17, 10, "#fff2c0");
  R(c, x + 10, y + 18, 3, 3, "#6a667a"); P(c, x + 11, y + 19, "#1c1626");   /* coin slot */
  P(c, x + 4, y + 19, "#c0302c");
};

PK.bike = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y);
  const col = o.color || "#c0302c", k = K(col), tire = "#1c1626";
  const w1 = [x + 8, y + 21], w2 = [x + 38, y + 21], hub = [x + 22, y + 21];
  groundShadow(c, x + 23, y + 30, 25, 2, 0.4);
  [w1, w2].forEach(wc => {
    ring(c, wc[0], wc[1], 9, tire); ring(c, wc[0], wc[1], 8, "#3a3450"); ring(c, wc[0], wc[1], 7, "#8a869c");
    for (let a = 0; a < 8; a++) { const ang = a * PI / 4 + 0.2; AP(c, wc[0] + round(cos(ang) * 6), wc[1] + round(sin(ang) * 6), "#c8c4d8", 0.5); line(c, wc[0], wc[1], wc[0] + round(cos(ang) * 6), wc[1] + round(sin(ang) * 6), "#6a667c"); }
    ell(c, wc[0], wc[1], 1, 1, "#c8c4d8");
  });
  const seat = [x + 16, y + 8], head = [x + 33, y + 8], bb = [x + 21, y + 21], fork = [x + 38, y + 21];
  const tube_ = (a, b) => { line(c, a[0], a[1], b[0], b[1], col); line(c, a[0], a[1] + 1, b[0], b[1] + 1, k[1]); line(c, a[0], a[1] - 1, b[0], b[1] - 1, k[3]); };
  tube_(seat, head); tube_(seat, bb); tube_(head, bb); tube_(seat, [x + 8, y + 21]); tube_([x + 8, y + 21], bb); tube_(head, fork);
  VL(c, x + 33, y + 3, 5, "#2a2434"); R(c, x + 31, y + 2, 5, 2, "#2a2434");    /* handlebars */
  R(c, x + 13, y + 6, 8, 2, "#1c1626"); HL(c, x + 13, y + 6, 8, "#5a5272");     /* saddle */
  ring(c, bb[0], bb[1], 3, "#a8a4b8"); P(c, bb[0] + 3, bb[1] + 3, "#6a667c");
  /* U-lock around the rear wheel */
  R(c, x + 12, y + 12, 1, 6, "#8a869c"); R(c, x + 10, y + 12, 4, 1, "#8a869c");
};

/* =====================================================================================
   INTERIOR PROPS (A): doors, shelves, records, counters, coolers, bars
   ===================================================================================== */

/* ---- album-cover / flyer art ------------------------------------------------------------ */
function cover(c, x, y, sw, sh, r, pal) {
  pal = pal || pk(r, ART_PALS);
  const bg = pal[0], a = pal[1], b = pal[2], pp = pal[3], kind = floor(r() * 10), s = min(sw, sh), cx = x + sw / 2, cy = y + sh / 2;
  R(c, x, y, sw, sh, bg);
  switch (kind) {
    case 0: {                                                      /* retro sun + bars */
      gradient(c, x, y, sw, sh, [bg, mix(bg, a, 0.5), a], 1, true);
      ell(c, cx, y + sh * 0.45, s * 0.3, s * 0.3, b);
      for (let i = 0; i < 4; i++) R(c, x, y + sh * 0.5 + i * s * 0.1, sw, max(1, s * 0.05 + i * 0.4), mix(bg, a, 0.3));
      HL(c, x, y + sh * 0.88, sw, bg); R(c, x, y + sh * 0.9, sw, sh * 0.1, bg);
      break;
    }
    case 1: { const n = ri(r, 3, 5); for (let i = 0; i < n; i++) R(c, x, y + i * sh / n, sw, ceil(sh / n), i % 2 ? a : (i === 2 ? b : bg)); break; }
    case 2: {                                                      /* portrait */
      const skin = pk(r, ["#e0a27a", "#b8775a", "#8a5238", "#f2c8a0"]);
      R(c, x, y, sw, sh, a); ell(c, cx, y + sh * 0.9, s * 0.42, s * 0.3, pk(r, [b, pp, bg]));
      ell(c, cx, y + sh * 0.4, s * 0.2, s * 0.24, skin); ell(c, cx, y + sh * 0.3, s * 0.22, s * 0.16, "#1d1622");
      HL(c, cx - s * 0.1, y + sh * 0.4, s * 0.2, K(skin)[1]); R(c, cx - s * 0.1, y + sh * 0.4 - 1, 2, 1, "#1d1622"); R(c, cx + s * 0.06, y + sh * 0.4 - 1, 2, 1, "#1d1622");
      break;
    }
    case 3: { const g = 4, cs = s / g; for (let i = 0; i < g; i++) for (let j = 0; j < g; j++) { if ((i + j) & 1) R(c, x + i * cs, y + j * cs, ceil(cs), ceil(cs), r() < 0.3 ? b : a); } break; }
    case 4: { const t = pk(r, ["RE", "DJ", "NY", "XO", "808", "UK", "III", "ON"]), sc = max(1, floor((sw - 2) / (t.length * 4))); const tw = txtW(t, sc, 1); txt(c, t, round(cx - tw / 2), round(cy - 2 * sc), a, sc, 1); HL(c, x + 2, y + sh - 4, sw - 4, b); break; }
    case 5: { for (let i = floor(s * 0.45); i > 0; i -= 2) { ring(c, round(cx), round(cy), i, (i / 2) % 2 ? a : b); } ell(c, cx, cy, 1, 1, pp); break; }
    case 6: { poly(c, [[x, y], [x + sw, y], [x, y + sh]], a); poly(c, [[x + sw, y + sh], [x + sw, y + 3], [x + 3, y + sh]], b); break; }
    case 7: { speckle(c, x, y, sw, sh, [a, b, pp], 0.1, floor(r() * 99999)); const px = round(cx), py = round(cy); R(c, px - 3, py, 7, 1, pp); R(c, px, py - 3, 1, 7, pp); break; }
    case 8: {                                                      /* landscape */
      gradient(c, x, y, sw, sh * 0.6, [mix(bg, a, 0.3), a, b], 1, true); ell(c, x + sw * 0.7, y + sh * 0.32, s * 0.12, s * 0.12, pp);
      poly(c, [[x, y + sh * 0.7], [x + sw * 0.3, y + sh * 0.35], [x + sw * 0.55, y + sh * 0.7]], K(bg)[1]);
      poly(c, [[x + sw * 0.3, y + sh * 0.7], [x + sw * 0.65, y + sh * 0.42], [x + sw, y + sh * 0.7]], bg);
      R(c, x, y + sh * 0.7, sw, ceil(sh * 0.3), K(bg)[0]);
      break;
    }
    default: { for (let i = 0; i < 6; i++) ell(c, x + r() * sw, y + r() * sh, ri(r, 2, 4), ri(r, 2, 4), i % 2 ? a : b); }
  }
  /* sleeve edge, ring wear, shine */
  outline(c, x, y, sw, sh, mix(bg, "#0c0618", 0.45));
  HL(c, x + 1, y + 1, sw - 2, mix(bg, "#ffffff", 0.18));
  if (r() < 0.5 && s >= 14) { ring(c, round(cx), round(cy), round(s * 0.42), mix(bg, "#ffffff", 0.14)); }
}

/* ---- door -------------------------------------------------------------------------------- */
PK.door = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 48); h = round(h || 118);
  const col = o.color || "#6a4a5e", k = K(col), fr = o.frame ? K(o.frame) : K(sh(col, 0.25)), r = rng(o, x, y, 30), em = [];
  const t = 3;
  if (o.metal) {
    const mc = o.color || "#6a7480", mk = K(mc);
    R(c, x, y, w, h, mk[0]); R(c, x + 2, y + 2, w - 4, h - 4, mk[2]);
    gradient(c, x + 2, y + 2, w - 4, h - 4, [[0, mk[3]], [0.4, mk[2]], [1, mk[1]]], 1, true);
    VL(c, x + 2, y + 2, h - 4, mk[4]); VL(c, x + w - 3, y + 2, h - 4, mk[1]);
    for (let py = y + 8; py < y + h - 8; py += 14) { HL(c, x + 3, py, w - 6, mk[1]); HL(c, x + 3, py + 1, w - 6, mk[3]); }
    for (let py = y + 5; py < y + h - 4; py += 14) { P(c, x + 4, py, mk[4]); P(c, x + w - 5, py, mk[4]); }
    R(c, x + 2, y + h - 14, w - 4, 11, mk[1]); HL(c, x + 2, y + h - 14, w - 4, mk[4]);               /* kick plate */
    if (o.window) { R(c, x + 8, y + 10, w - 16, 22, "#1a2a3a"); R(c, x + 9, y + 11, w - 18, 20, "#3a5a78"); for (let i = 0; i < w - 18; i += 3) VL(c, x + 9 + i, y + 11, 20, "#5a8aa8"); for (let i = 0; i < 20; i += 3) HL(c, x + 9, y + 11 + i, w - 18, "#5a8aa8"); outline(c, x + 8, y + 10, w - 16, 22, mk[4]); }
    R(c, x + 6, y + round(h * 0.48), w - 12, 4, "#c8c4d8"); HL(c, x + 6, y + round(h * 0.48), w - 12, "#ffffff"); HL(c, x + 6, y + round(h * 0.48) + 3, w - 12, "#8a869c");   /* push bar */
  } else {
    R(c, x, y, w, h, fr[0]); R(c, x + 1, y + 1, w - 2, h - 2, fr[2]); VL(c, x + 1, y + 1, h - 2, fr[3]); HL(c, x + 1, y + 1, w - 2, fr[4]);
    const lx = x + t, ly = y + t, lw = w - t * 2, lh = h - t;
    R(c, lx, ly, lw, lh, k[2]);
    gradient(c, lx, ly, lw, lh, [[0, k[3]], [0.5, k[2]], [1, k[1]]], 0.8, true);
    VL(c, lx, ly, lh, k[3]); VL(c, lx + lw - 1, ly, lh, k[1]);
    const np = o.panels == null ? 4 : o.panels;
    if (np > 0) {
      const cols = np >= 4 ? 2 : 1, rows = np === 2 ? 2 : np === 4 ? 2 : np === 6 ? 3 : 1;
      const gap = 4, pw = floor((lw - gap * (cols + 1)) / cols);
      const rowsH = rows === 2 ? [round(lh * 0.36), 0] : rows === 3 ? [round(lh * 0.22), round(lh * 0.22), 0] : [0];
      let py = ly + gap + 2;
      const usable = lh - gap * (rows + 1) - 4;
      const fixed = rowsH.reduce((s, v) => s + v, 0), restH = usable - fixed;
      for (let ro = 0; ro < rows; ro++) {
        const ph = rowsH[ro] || restH;
        for (let co = 0; co < cols; co++) {
          const px = lx + gap + co * (pw + gap);
          R(c, px, py, pw, ph, k[1]); R(c, px + 1, py + 1, pw - 2, ph - 2, k[2]);
          HL(c, px, py, pw, k[0]); VL(c, px, py, ph, k[0]); HL(c, px + 1, py + ph - 1, pw - 1, k[4]); VL(c, px + pw - 1, py + 1, ph - 1, k[3]);
          HL(c, px + 1, py + 1, pw - 2, k[1]); VL(c, px + 1, py + 1, ph - 2, k[1]);
          if (r() < 0.3) { P(c, px + 3, py + ph - 3, k[3]); }
        }
        py += ph + gap;
      }
    }
    /* hinges */
    [ly + 6, ly + round(lh * 0.5), ly + lh - 12].forEach(hy => { R(c, o.hingeRight ? x + w - 3 : x + 1, hy, 2, 5, "#c8b070"); P(c, o.hingeRight ? x + w - 3 : x + 1, hy, "#fff0b0"); });
    if (o.peephole !== false && h > 90) { ell(c, x + floor(w / 2), y + round(h * 0.22), 1, 1, "#c8b070"); P(c, x + floor(w / 2), y + round(h * 0.22), "#0a0614"); }
  }
  /* knob + lock */
  if (o.knob !== false) {
    const kx = o.hingeRight ? x + t + 4 : x + w - t - 7, ky = y + round(h * 0.55);
    R(c, kx - 1, ky - 3, 5, 9, K("#c8b070")[1]); VL(c, kx - 1, ky - 3, 9, "#ffe8a0");
    ball(c, kx + 1, ky + 1, 2, "#e0c870"); P(c, kx, ky, "#fff6c0");
    R(c, kx, ky - 8, 3, 4, "#8a7a50"); P(c, kx + 1, ky - 7, "#2a2018"); R(c, kx, ky - 9, 3, 1, "#e0c870");
  }
  if (o.number) { R(c, x + floor(w / 2) - 5, y + 10, 11, 7, "#c8b070"); txtC(c, String(o.number), x + w / 2, y + 11, "#3a2a10", 1, 1); }
  if (o.sign) {
    const tw = txtW(o.sign, 1, 1) + 6, sx = x + floor(w / 2 - tw / 2), sy = y + (o.signY != null ? o.signY : round(h * 0.34));
    R(c, sx, sy, tw, 9, "#e8e0cc"); outline(c, sx, sy, tw, 9, "#6a5a40"); txtC(c, o.sign, sx + tw / 2, sy + 2, "#3a1c1c", 1, 1);
    P(c, sx + 1, sy + 1, "#6a5a40"); P(c, sx + tw - 2, sy + 1, "#6a5a40");
  }
  if (o.open) {
    /* ajar: dark room behind, door leaf foreshortened at the hinge side */
    R(c, x + 3, y + 3, w - 6, h - 3, o.inside || "#150d1c");
    gradient(c, x + 3, y + 3, w - 6, h - 3, [o.inside || "#2a1c34", "#150d1c", "#0c0814"], 1, true);
    dshade(c, x + 3, y + h - 24, w - 6, 20, "#ffcf7a", (px, py) => (py - (y + h - 24)) / 20 * 0.7, 0.35);
    const lw2 = round(w * 0.22);
    poly(c, [[x + 3, y + 3], [x + 3 + lw2, y + 9], [x + 3 + lw2, y + h - 6], [x + 3, y + h]], k[2]);
    poly(c, [[x + 3 + lw2 - 1, y + 9], [x + 3 + lw2, y + 9], [x + 3 + lw2, y + h - 6], [x + 3 + lw2 - 1, y + h - 6]], k[1]);
    line(c, x + 3, y + 3, x + 3 + lw2, y + 9, k[4]);
    R(c, x + 3 + lw2 - 4, y + round(h * 0.55), 2, 3, "#e0c870");
  }
  return em;
};

/* ---- shelf --------------------------------------------------------------------------------- */
const GLASS = ["#3a8a5a", "#c0782a", "#cfe4ef", "#4a80d8", "#c0302c", "#7a4a9a", "#d8b020", "#2a6a4a"];
const BOOKC = ["#8a2a2a", "#2a4a7a", "#3a6a4a", "#7a5a2a", "#4a2a5a", "#c8a860", "#2a2a3a", "#a04a3a", "#5a7a8a", "#d8d0b8"];
const CANC = ["#d83a3a", "#3ab8d8", "#e8e4d0", "#5ad85a", "#e0a020", "#8a4ad8", "#e8602c", "#2a6ad8"];
function itemRow(c, type, x, yb, w, rowH, r) {
  /* yb = surface the items stand on ; items grow up to rowH */
  let px = x;
  const end = x + w;
  let group = pk(r, CANC), gleft = ri(r, 2, 5);
  while (px < end - 2) {
    if (type === "records") {
      const ww = ri(r, 1, 2), hh = rowH - 3 - (r() < 0.2 ? ri(r, 1, 2) : 0), col = pk(r, ["#1d1622", "#c0302c", "#e8e4f0", "#2f62b8", "#ffd23f", "#ff3fa4", "#39d0ff", "#3a6a3a", "#e8a030", "#6a2a5a"]);
      if (px + ww > end) break;
      R(c, px, yb - hh, ww, hh, col); if (ww > 1) VL(c, px, yb - hh, hh, mix(col, "#ffffff", 0.28)); VL(c, px + ww - 1, yb - hh, hh, mix(col, "#0c0618", 0.4));
      if (r() < 0.35) R(c, px, yb - hh + ri(r, 2, 5), ww, 1, "#f4ead0");
      if (r() < 0.08) { px += 1; line(c, px, yb, px + 3, yb - hh + 2, mix(col, "#ffffff", 0.2)); px += 3; }
      px += ww;
    } else if (type === "bottles") {
      const bw = ri(r, 4, 7), bh = ri(r, 8, max(9, rowH - 6)), nh = ri(r, 3, 6), col = pk(r, GLASS);
      if (px + bw > end) break;
      const nx = px + floor(bw / 2) - 1;
      R(c, px, yb - bh, bw, bh, col); VL(c, px + 1, yb - bh + 1, bh - 2, mix(col, "#ffffff", 0.45)); VL(c, px + bw - 1, yb - bh, bh, mix(col, "#0c0618", 0.5));
      HL(c, px, yb - bh, bw, mix(col, "#ffffff", 0.3));
      R(c, nx, yb - bh - nh, 2, nh, col); P(c, nx, yb - bh - nh + 1, mix(col, "#ffffff", 0.5)); R(c, nx, yb - bh - nh - 1, 2, 1, pk(r, ["#d8b020", "#c0302c", "#1d1622", "#e8e4f0"]));
      R(c, px, yb - floor(bh * 0.6), bw, max(2, floor(bh * 0.3)), r() < 0.5 ? "#f4ead0" : pk(r, ["#c0302c", "#1d1622", "#ffd23f"]));
      R(c, px + 1, yb - floor(bh * 0.6) + 1, max(1, bw - 3), 1, "#1d1622");
      px += bw + ri(r, 0, 1);
    } else if (type === "boxes") {
      const bw = ri(r, 9, 17), bh = ri(r, 8, max(9, rowH - 3)), cereal = r() < 0.5;
      if (px + bw > end) break;
      const col = cereal ? pk(r, ["#d83a3a", "#e8a020", "#3a8ad8", "#5ac85a", "#d84aa0", "#e8e4d0"]) : pk(r, ["#c8925a", "#b88248", "#d8a268"]), kk = K(col);
      R(c, px, yb - bh, bw, bh, col); HL(c, px, yb - bh, bw, kk[4]); VL(c, px, yb - bh, bh, kk[3]); VL(c, px + bw - 1, yb - bh, bh, kk[1]); HL(c, px, yb - 1, bw, kk[1]);
      if (cereal) { R(c, px + 2, yb - bh + 3, bw - 4, 4, "#f4ead0"); R(c, px + 3, yb - bh + 4, bw - 6, 1, kk[0]); ell(c, px + bw / 2, yb - 4, 2, 2, "#ffd23f"); }
      else { VL(c, px + floor(bw / 2), yb - bh, 3, "#a87a48"); R(c, px + 2, yb - 4, 4, 2, "#f4ead0"); }
      px += bw + ri(r, 0, 2);
    } else if (type === "books") {
      const bw = ri(r, 2, 5), bh = rowH - ri(r, 2, 8), col = pk(r, BOOKC), kk = K(col);
      if (px + bw > end) break;
      R(c, px, yb - bh, bw, bh, col); VL(c, px, yb - bh, bh, kk[3]); VL(c, px + bw - 1, yb - bh, bh, kk[0]);
      HL(c, px, yb - bh + 2, bw, "#e8d8a0"); if (bh > 10) HL(c, px, yb - 4, bw, "#e8d8a0");
      if (r() < 0.4 && bw >= 3) R(c, px + 1, yb - floor(bh * 0.6), bw - 2, 3, "#f4ead0");
      if (r() < 0.1) { line(c, px + bw, yb, px + bw + 3, yb - bh + 3, kk[2]); px += 3; }
      px += bw;
    } else {                                                          /* cans */
      if (gleft-- <= 0) { group = pk(r, CANC); gleft = ri(r, 2, 5); }
      const cw = 5, chh = 7, kk = K(group);
      if (px + cw > end) break;
      if (r() < 0.07 && rowH >= 14 && px + 9 < end) {                                  /* 2-liter bottle */
        const bh2 = rowH - 1, bc = pk(r, ["#c0302c", "#3a8a5a", "#e8a020", "#3a8ad8"]);
        R(c, px, yb - bh2, 6, bh2, bc); HL(c, px, yb - bh2 + 2, 6, mix(bc, "#ffffff", 0.35)); R(c, px + 2, yb - bh2 - 2, 2, 2, "#e8e4f0"); VL(c, px + 1, yb - bh2 + 3, bh2 - 4, mix(bc, "#ffffff", 0.45)); VL(c, px + 5, yb - bh2, bh2, mix(bc, "#0c0618", 0.4)); R(c, px + 1, yb - floor(bh2 / 2), 4, 3, "#f4f0e8");
        px += 7; continue;
      }
      for (let layer = 0; layer < (rowH >= 14 ? 2 : 1); layer++) {
        const cy = yb - chh * (layer + 1);
        R(c, px, cy, cw, chh, group); HL(c, px, cy, cw, "#d8d4e4"); HL(c, px, cy + chh - 1, cw, kk[1]);
        VL(c, px + 1, cy + 1, chh - 2, mix(group, "#ffffff", 0.5)); VL(c, px + cw - 1, cy + 1, chh - 1, kk[1]); R(c, px + 1, cy + 3, cw - 2, 2, "#f4f0e8"); P(c, px + 2, cy + 3, kk[1]);
      }
      px += cw;
    }
  }
}
PK.shelf = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 100); h = round(h || 80);
  const wood = o.wood || "#7a4a32", k = K(wood), r = rng(o, x, y, 31), items = o.items || "boxes";
  const rowH = o.rowH || (items === "records" ? 24 : items === "cans" ? 20 : items === "bottles" ? 26 : items === "books" ? 22 : 24);
  const rows = max(1, floor(h / rowH)), rh = h / rows;
  /* back panel */
  R(c, x, y, w, h, "#251a22"); for (let px = x + 8; px < x + w; px += 9) VL(c, px, y, h, "#1a1018");
  for (let i = 0; i < rows; i++) {
    const yb = y + round((i + 1) * rh) - 4;
    itemRow(c, items, x + 4, yb, w - 8, round(rh) - 6, r);
    /* shelf board */
    R(c, x, yb, w, 4, wood); HL(c, x, yb, w, k[4]); HL(c, x, yb + 1, w, k[3]); HL(c, x, yb + 3, w, k[0]);
    for (let g = 0; g < w / 8; g++) R(c, x + floor(r() * w), yb + 2, ri(r, 2, 6), 1, k[1]);
    dshade(c, x + 2, yb + 4, w - 4, 3, "#0c0618", (px, py) => 1 - (py - yb - 4) / 3, 0.35);
  }
  R(c, x, y, 3, h, wood); VL(c, x, y, h, k[3]); VL(c, x + 2, y, h, k[1]); R(c, x + w - 3, y, 3, h, wood); VL(c, x + w - 3, y, h, k[3]); VL(c, x + w - 1, y, h, k[0]);
  R(c, x, y, w, 2, wood); HL(c, x, y, w, k[4]);
};

/* ---- record bins + wall --------------------------------------------------------------------- */
PK.recordBins = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 132); h = round(h || 60);
  const r = rng(o, x, y, 32), wood = o.wood || "#a06a46", k = K(wood);
  const nb = max(1, round(w / 44)), bw = floor(w / nb);
  const legH = round(h * 0.3), boxH = h - legH, front = 10;
  groundShadow(c, x + w / 2, y + h, w / 2 + 3, 3, 0.4);
  for (let b = 0; b < nb; b++) {
    const bx = x + b * bw + 1, ww = bw - 2, top = y;
    /* dark interior */
    R(c, bx, top + 6, ww, boxH - 6, "#1c121c");
    /* receding rows of sleeve tops, back to front */
    const rows = 5;
    for (let ro = 0; ro < rows; ro++) {
      const ry = top + 8 + ro * 3, fade = ro / rows;
      let px = bx + 1;
      while (px < bx + ww - 1) {
        const sw = ri(r, 2, 5), col = mix(pk(r, ["#e8e4f0", "#c0302c", "#2f62b8", "#ffd23f", "#ff3fa4", "#39d0ff", "#f4ead0", "#e8a030", "#3a6a3a", "#1d1622"]), "#1c121c", 0.45 - fade * 0.35);
        R(c, px, ry, min(sw, bx + ww - 1 - px), 4, col); HL(c, px, ry, min(sw, bx + ww - 1 - px), mix(col, "#ffffff", 0.3));
        px += sw;
      }
    }
    /* dividers */
    for (let d = 0; d < 2; d++) {
      const dx = bx + 5 + d * floor(ww / 2) + ri(r, 0, 4), tab = pk(r, ["#ff3fa4", "#39d0ff", "#ffd23f", "#5cff9a", "#ff8a4c"]);
      R(c, dx, top + 1, 9, 9, "#f4ead0"); outline(c, dx, top + 1, 9, 9, "#bfb08c"); R(c, dx + 1, top + 1, 7, 3, tab); txt(c, String.fromCharCode(65 + ri(r, 0, 25)), dx + 3, top + 2, "#1d1622", 1);
    }
    /* featured covers leaning on the lip */
    const fc = ww >= 36 ? 2 : 1;
    for (let f = 0; f < fc; f++) cover(c, bx + 2 + f * (floor(ww / 2) - 1), top + boxH - front - 14, 15, 15, r);
    /* crate front + posts */
    R(c, bx, top + boxH - front, ww, front, wood); HL(c, bx, top + boxH - front, ww, k[4]); HL(c, bx, top + boxH - front + 1, ww, k[3]);
    HL(c, bx, top + boxH - 6, ww, k[1]); HL(c, bx, top + boxH - 1, ww, k[0]);
    for (let g = 0; g < ww / 6; g++) R(c, bx + ri(r, 1, ww - 3), top + boxH - front + ri(r, 2, 8), ri(r, 2, 6), 1, k[1]);
    R(c, bx, top + 5, 2, boxH - 5, wood); VL(c, bx, top + 5, boxH - 5, k[3]); R(c, bx + ww - 2, top + 5, 2, boxH - 5, wood); VL(c, bx + ww - 1, top + 5, boxH - 5, k[0]);
    /* sticker label on crate */
    R(c, bx + floor(ww / 2) - 6, top + boxH - 8, 12, 5, "#f4ead0"); txtC(c, pk(r, ["NEW", "JAZZ", "FUNK", "HOUSE", "$5", "SOUL"]), bx + ww / 2, top + boxH - 7, "#1d1622", 1);
  }
  /* stand legs */
  for (let b = 0; b <= nb; b++) { const lx = x + b * bw - (b === nb ? 3 : 0); R(c, lx, y + boxH, 4, legH, wood); VL(c, lx, y + boxH, legH, k[3]); VL(c, lx + 3, y + boxH, legH, k[0]); R(c, lx - 1, y + h - 1, 6, 1, k[0]); }
  R(c, x, y + boxH + floor(legH * 0.55), w, 3, wood); HL(c, x, y + boxH + floor(legH * 0.55), w, k[4]); HL(c, x, y + boxH + floor(legH * 0.55) + 2, w, k[0]);
};

PK.recordWall = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 160); h = round(h || 90);
  const r = rng(o, x, y, 33), cs = o.cell || 22, rows = max(1, floor(h / (cs + 5)));
  const cols = max(1, floor((w - 4) / cs));
  const pals = o.palette || ART_PALS;
  for (let ro = 0; ro < rows; ro++) {
    const by = y + ro * (cs + 5) + 3;
    for (let co = 0; co < cols; co++) {
      const bx = x + 3 + co * cs + floor((w - 4 - cols * cs) / 2);
      cover(c, bx, by, cs - 3, cs - 3, r, pals === ART_PALS ? null : pk(r, pals));
      if (r() < 0.12) R(c, bx + cs - 9, by + 1, 7, 4, "#ffd23f");                     /* PRICE sticker */
    }
    const sy = by + cs - 2;
    R(c, x, sy, w, 3, "#a06a46"); HL(c, x, sy, w, "#d09468"); HL(c, x, sy + 2, w, "#4e2e26");           /* ledge */
    dshade(c, x, sy + 3, w, 3, "#0c0618", (px, py) => 1 - (py - sy - 3) / 3, 0.4);
    if (ro === 0 && o.header) txtC(c, o.header, x + w / 2, y - 7, "#f4ead0", 1);
  }
};

/* ---- counter & register -------------------------------------------------------------------- */
PK.counter = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 120); h = round(h || 34);
  const topc = o.top || "#c8b090", frontc = o.front || "#7a4a32", kt = K(topc), kf = K(frontc), r = rng(o, x, y, 34);
  const th = 5;
  groundShadow(c, x + w / 2, y + h, w / 2 + 2, 2, 0.35);
  R(c, x - 2, y, w + 4, th, topc); HL(c, x - 2, y, w + 4, kt[4]); HL(c, x - 2, y + 1, w + 4, kt[3]); HL(c, x - 2, y + th - 1, w + 4, kt[1]);
  VL(c, x - 2, y, th, kt[4]); VL(c, x + w + 1, y, th, kt[1]);
  R(c, x, y + th, w, h - th, frontc);
  gradient(c, x, y + th, w, h - th, [[0, kf[1]], [0.12, kf[2]], [1, kf[2]]], 1, true);
  const pw = o.panelW || 26;
  for (let px = x; px < x + w; px += pw) {
    const ww = min(pw, x + w - px);
    VL(c, px, y + th, h - th, kf[0]); VL(c, px + 1, y + th + 1, h - th - 1, kf[3]);
    if (ww > 8 && h > 16) {
      R(c, px + 4, y + th + 4, ww - 8, h - th - 12, kf[2]); HL(c, px + 4, y + th + 4, ww - 8, kf[1]); VL(c, px + 4, y + th + 4, h - th - 12, kf[1]);
      HL(c, px + 4, y + h - 9, ww - 8, kf[4]); VL(c, px + ww - 5, y + th + 4, h - th - 12, kf[3]);
      for (let g = 0; g < 3; g++) R(c, px + 6 + ri(r, 0, max(0, ww - 14)), y + th + 6 + ri(r, 0, max(0, h - th - 16)), ri(r, 3, 7), 1, kf[1]);
    }
  }
  R(c, x, y + h - 4, w, 4, kf[0]); HL(c, x, y + h - 4, w, kf[1]);
  if (o.rail) { R(c, x + 2, y + h - 9, w - 4, 2, "#d8c070"); HL(c, x + 2, y + h - 9, w - 4, "#fff0b0"); }
  dshade(c, x - 2, y + th, w + 4, 3, "#0c0618", (px, py) => 1 - (py - y - th) / 3, 0.35);
};

PK.cashRegister = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y) + 5; const em = [];
  const body = "#cfc4a8", k = K(body);
  R(c, x + 12, y + 1, 7, 2, "#8a8698"); R(c, x + 14, y + 3, 3, 4, "#8a8698");            /* stalk */
  R(c, x + 6, y - 5, 19, 7, "#2a2832"); HL(c, x + 6, y - 5, 19, "#5a5668");
  R(c, x + 8, y - 4, 15, 4, "#0e2a2a"); R(c, x + 9, y - 3, 6, 2, "#3fe0a0"); R(c, x + 17, y - 3, 4, 2, "#3fe0a0"); em.push([x + 8, y - 4, 15, 4]);
  R(c, x + 1, y + 7, 29, 8, body); HL(c, x + 1, y + 7, 29, k[4]); HL(c, x + 1, y + 14, 29, k[1]);                    /* key deck */
  for (let ro = 0; ro < 2; ro++) for (let co = 0; co < 7; co++) { const kc = (ro === 0 && co === 6) ? "#c0302c" : (co === 0 ? "#3a8ad8" : "#f0ece0"); R(c, x + 3 + co * 4, y + 8 + ro * 3, 3, 2, kc); P(c, x + 3 + co * 4, y + 8 + ro * 3, "#ffffff"); }
  R(c, x, y + 15, 31, 9, k[2]); HL(c, x, y + 15, 31, k[3]); HL(c, x, y + 23, 31, k[0]); VL(c, x, y + 15, 9, k[3]); VL(c, x + 30, y + 15, 9, k[1]);
  R(c, x + 3, y + 17, 25, 4, k[1]); HL(c, x + 3, y + 20, 25, k[3]); R(c, x + 13, y + 18, 5, 2, "#8a8698");                 /* drawer */
  R(c, x + 23, y + 3, 5, 5, "#f4f0e8"); HL(c, x + 23, y + 3, 5, "#ffffff"); P(c, x + 25, y + 5, "#9a96a8");          /* receipt */
  return em;
};

/* ---- bodega cooler ----------------------------------------------------------------------------- */
PK.cooler = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 72); h = round(h || 98);
  const lit = o.lit !== false, r = rng(o, x, y, 35), em = [];
  const fr = o.frame || "#d4d0e0", kf = K(fr);
  const head = 9, foot = 9, doors = max(1, round(w / 34)), dw = floor((w - 6) / doors);
  /* cabinet */
  R(c, x, y, w, h, kf[2]); HL(c, x, y, w, kf[4]); VL(c, x, y, h, kf[3]); VL(c, x + w - 1, y, h, kf[1]); HL(c, x, y + h - 1, w, kf[0]);
  /* header (lit sign) */
  R(c, x + 2, y + 2, w - 4, head - 2, lit ? "#1a3a8a" : "#2a2a44"); if (o.sign !== false) txtC(c, o.sign || "COLD DRINKS", x + w / 2, y + 4, lit ? "#e8f4ff" : "#6a6a88", 1);
  if (lit) em.push([x + 2, y + 2, w - 4, head - 2]);
  /* doors */
  for (let d = 0; d < doors; d++) {
    const dx = x + 3 + d * dw, gx = dx + 2, gy = y + head + 2, gw = dw - 4, gh = h - head - foot - 4;
    R(c, dx, y + head, dw, h - head - foot, kf[1]); outline(c, dx, y + head, dw, h - head - foot, kf[0]);
    R(c, gx, gy, gw, gh, "#101820");
    if (lit) gradient(c, gx, gy, gw, gh, ["#f4fbff", "#cfe8ff", "#b0d4f4"], 1, true); else R(c, gx, gy, gw, gh, "#1c2430");
    const rows = max(2, floor(gh / 20)), rh = gh / rows;
    for (let ro = 0; ro < rows; ro++) {
      const sy = gy + round((ro + 1) * rh) - 2;
      let px = gx + 1;
      while (px < gx + gw - 3) {
        const col = pk(r, ["#d83a3a", "#e8a020", "#3a8ad8", "#4ab85a", "#e8e4d0", "#8a4ad8", "#ff8a4c", "#2a6a4a"]), bw = ri(r, 4, 6), bh = ri(r, 10, max(11, round(rh) - 5));
        if (px + bw > gx + gw - 1) break;
        const lc = lit ? col : mix(col, "#0c1018", 0.7);
        R(c, px, sy - bh, bw, bh, lc); VL(c, px + 1, sy - bh + 1, bh - 2, mix(lc, "#ffffff", 0.4)); VL(c, px + bw - 1, sy - bh, bh, mix(lc, "#0c0618", 0.4));
        R(c, px, sy - floor(bh * 0.65), bw, 3, lit ? "#f4f0e0" : "#4a5060"); R(c, px + floor(bw / 2) - 1, sy - bh - 3, 2, 3, lit ? mix(lc, "#ffffff", 0.2) : lc);
        px += bw + 1;
      }
      R(c, gx, sy, gw, 2, lit ? "#f0f4fc" : "#3a4458"); HL(c, gx, sy + 1, gw, "#8aa0c0");
    }
    if (lit) em.push([gx, gy, gw, gh]);
    dshade(c, gx, gy, gw, gh, "#ffffff", (px, py) => { const q = ((px - gx) + (py - gy) * 1 + 400) % 40; return q < 5 ? 1 : 0; }, 0.22);
    R(c, dx + dw - 5, y + head + 12, 2, round(gh * 0.5), "#8a86a0"); VL(c, dx + dw - 5, y + head + 12, round(gh * 0.5), "#e8e4f4");                  /* handle */
    dshade(c, gx, gy, gw, 3, "#0c0618", (px, py) => 1 - (py - gy) / 3, 0.35);
  }
  /* compressor grille */
  R(c, x + 3, y + h - foot, w - 6, foot - 2, "#1c1824");
  for (let px = x + 5; px < x + w - 5; px += 3) { VL(c, px, y + h - foot + 1, foot - 4, "#3a3448"); }
  return em;
};

/* ---- bar ---------------------------------------------------------------------------------------- */
PK.bar = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 260); h = round(h || 110);
  const r = rng(o, x, y, 36), em = [], wood = o.wood || "#6a3a2a", k = K(wood);
  const backH = round(h * 0.62), counterY = y + backH + 6, ch = h - backH - 6;
  /* back wall + mirror */
  R(c, x, y, w, backH, "#2a1822"); for (let px = x + 10; px < x + w; px += 14) VL(c, px, y, backH, "#20121a");
  const mx0 = x + 6, mw = w - 12, my0 = y + 4, mh = backH - 8;
  gradient(c, mx0, my0, mw, mh, ["#3a3a58", "#4a4a6a", "#2a2a44"], 1, true);
  dshade(c, mx0, my0, mw, mh, "#ffffff", (px, py) => { const q = ((px - mx0) * 0.7 + (py - my0) + 800) % 60; return q < 6 ? 1 : 0; }, 0.16);
  outline(c, mx0 - 1, my0 - 1, mw + 2, mh + 2, K("#c8a860")[2]); HL(c, mx0 - 1, my0 - 1, mw + 2, "#fff0b0");
  /* shelves with bottles */
  const tiers = max(2, floor(mh / 26)), th = mh / tiers;
  for (let t = 0; t < tiers; t++) {
    const sy = my0 + round((t + 1) * th) - 3;
    itemRow(c, "bottles", mx0 + 3, sy, mw - 6, round(th) - 5, r);
    R(c, mx0, sy, mw, 3, wood); HL(c, mx0, sy, mw, k[4]); HL(c, mx0, sy + 2, mw, k[0]);
    R(c, mx0 + 1, sy + 3, mw - 2, 1, "#ffe2a0"); em.push([mx0 + 1, sy + 3, mw - 2, 1]);                         /* LED strip under shelf */
    dshade(c, mx0, sy + 4, mw, 5, "#ffcf7a", (px, py) => 1 - (py - sy - 4) / 5, 0.3); em.push([mx0, sy + 4, mw, 5]);
  }
  /* back-bar cabinet */
  R(c, x, y + backH - 2, w, 8, wood); HL(c, x, y + backH - 2, w, k[4]); HL(c, x, y + backH + 5, w, k[0]);
  /* front bar */
  const topc = o.top || "#4a2a20", kt = K(topc);
  R(c, x - 3, counterY, w + 6, 6, topc); HL(c, x - 3, counterY, w + 6, kt[4]); HL(c, x - 3, counterY + 1, w + 6, kt[3]); HL(c, x - 3, counterY + 5, w + 6, kt[0]);
  R(c, x, counterY + 6, w, ch, wood);
  gradient(c, x, counterY + 6, w, ch, [[0, k[1]], [0.1, k[2]], [1, k[1]]], 1, true);
  for (let px = x; px < x + w; px += 20) { VL(c, px, counterY + 6, ch, k[0]); VL(c, px + 1, counterY + 6, ch, k[3]); R(c, px + 4, counterY + 10, 12, ch - 14, k[2]); HL(c, px + 4, counterY + 10, 12, k[1]); HL(c, px + 4, counterY + ch - 4, 12, k[4]); }
  R(c, x, y + h - 4, w, 4, k[0]);
  R(c, x + 2, y + h - 12, w - 4, 2, "#d8c070"); HL(c, x + 2, y + h - 12, w - 4, "#fff0b0");              /* brass foot rail */
  if (o.stools) for (let s = 0; s < (o.stools === true ? 3 : o.stools); s++) {
    const sx = x + round(w * (s + 0.5) / (o.stools === true ? 3 : o.stools)) - 6;
    ell(c, sx + 6, counterY + ch + 6, 6, 2, "#6a2a3a"); HL(c, sx + 1, counterY + ch + 5, 10, "#a04a5a"); VL(c, sx + 6, counterY + ch + 8, 14, "#8a869c"); R(c, sx + 1, y + h + 12, 10, 2, "#6a667c");
  }
  return em;
};

/* =====================================================================================
   INTERIOR PROPS (B): furniture, decor, office
   ===================================================================================== */

PK.table = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 64); h = round(h || 36);
  const col = o.color || "#8a5a3e", k = K(col), topc = o.top || mix(col, "#fff3d6", 0.18), kt = K(topc), r = rng(o, x, y, 40);
  groundShadow(c, x + w / 2, y + h, w / 2, 2, 0.4);
  if (o.round) {
    const ry = max(3, round(w * 0.14));
    R(c, x + floor(w / 2) - 2, y + ry * 2, 5, h - ry * 2, k[2]); VL(c, x + floor(w / 2) - 2, y + ry * 2, h - ry * 2, k[3]); VL(c, x + floor(w / 2) + 2, y + ry * 2, h - ry * 2, k[0]);
    ell(c, x + w / 2, y + h - 2, round(w * 0.25), 2, k[1]); ell(c, x + w / 2, y + h - 3, round(w * 0.25) - 1, 1, k[2]);
    ell(c, x + w / 2, y + ry + 2, floor(w / 2), ry, kt[1]); ell(c, x + w / 2, y + ry, floor(w / 2), ry, topc);
    ell(c, x + w / 2 - 3, y + ry - 1, floor(w / 2) - 6, max(1, ry - 2), kt[3]); HL(c, x + 6, y + ry - 2, w / 3, kt[4]);
    return;
  }
  const td = max(5, round(h * 0.22));
  R(c, x + 4, y + td + 3, 3, h - td - 3, k[1]); R(c, x + w - 7, y + td + 3, 3, h - td - 3, k[1]);            /* back legs */
  R(c, x, y, w, td, topc);
  gradient(c, x, y, w, td, [[0, kt[3]], [1, topc]], 1, true);
  HL(c, x, y, w, kt[4]); VL(c, x, y, td, kt[3]); VL(c, x + w - 1, y, td, kt[1]);
  for (let i = 0; i < w / 10; i++) R(c, x + 2 + floor(r() * (w - 6)), y + 1 + floor(r() * (td - 2)), ri(r, 3, 9), 1, kt[3]);
  R(c, x, y + td, w, 3, k[2]); HL(c, x, y + td, w, kt[4]); HL(c, x, y + td + 2, w, k[0]);                   /* front edge */
  R(c, x + 3, y + td + 3, w - 6, 3, k[1]); HL(c, x + 3, y + td + 3, w - 6, k[2]);                            /* apron */
  [x + 2, x + w - 6].forEach(lx => { R(c, lx, y + td + 3, 4, h - td - 3, k[2]); VL(c, lx, y + td + 3, h - td - 3, k[3]); VL(c, lx + 3, y + td + 3, h - td - 3, k[0]); });
  dshade(c, x + 6, y + td + 6, w - 12, 4, "#0c0618", (px, py) => 1 - (py - y - td - 6) / 4, 0.3);
};

PK.chair = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y);
  const kind = o.kind || "wood", col = o.color || "#8a5a3e", k = K(col), f = !!o.flip;
  const mx = (px, pw) => f ? x + (22 - (px - x) - pw) : px;
  const RF = (px, py, pw, ph, cc) => R(c, mx(px, pw), py, pw, ph, cc);
  const HF = (px, py, pw, cc) => RF(px, py, pw, 1, cc), VF = (px, py, ph, cc) => RF(px, py, 1, ph, cc);
  groundShadow(c, x + 11, y + 42, 12, 2, 0.4);
  if (kind === "office") {
    const cc = o.color || "#2a2838", ck = K(cc);
    RF(x + 2, y, 8, 20, cc); HF(x + 2, y, 8, ck[4]); VF(x + 2, y, 20, ck[3]); VF(x + 9, y, 20, ck[1]);                  /* backrest */
    RF(x + 2, y + 21, 17, 5, cc); HF(x + 2, y + 21, 17, ck[4]); HF(x + 2, y + 25, 17, ck[0]);                     /* seat */
    RF(x + 9, y + 26, 3, 10, "#8a869c"); VF(x + 9, y + 26, 10, "#c8c4d8");
    RF(x + 1, y + 36, 20, 2, "#3a364a"); HF(x + 1, y + 36, 20, "#6a667c");
    [2, 10, 18].forEach(wx => { RF(x + wx, y + 38, 3, 3, "#1c1626"); VF(x + wx, y + 38, 3, "#5a5272"); });
    RF(x + 14, y + 16, 7, 2, "#3a364a");                                                                          /* arm */
    return;
  }
  if (kind === "stool") {
    ell(c, x + 11, y + 14, 9, 3, k[1]); ell(c, x + 11, y + 12, 9, 3, k[2]); ell(c, x + 10, y + 11, 6, 1, k[4]);
    [x + 4, x + 17].forEach(lx => { R(c, lx, y + 15, 2, 27, "#8a869c"); VL(c, lx, y + 15, 27, "#e8e4f4"); });
    R(c, x + 10, y + 15, 2, 27, "#6a667c"); R(c, x + 3, y + 30, 17, 1, "#8a869c");
    return;
  }
  /* wooden side chair */
  RF(x + 2, y, 3, 42, col); VF(x + 2, y, 42, k[3]); VF(x + 4, y, 42, k[0]);                                       /* rear leg + back post */
  for (let i = 0; i < 4; i++) RF(x + 5, y + 3 + i * 5, 1 + 0, 3, k[2]);
  RF(x + 2, y + 2, 4, 3, k[2]); HF(x + 2, y + 2, 4, k[4]);
  for (let i = 0; i < 3; i++) { RF(x + 3, y + 4 + i * 6, 3, 1, k[1]); }
  RF(x + 1, y + 22, 20, 4, col); HF(x + 1, y + 22, 20, k[4]); HF(x + 1, y + 23, 20, k[3]); HF(x + 1, y + 25, 20, k[0]);   /* seat */
  RF(x + 17, y + 26, 3, 16, col); VF(x + 17, y + 26, 16, k[3]); VF(x + 19, y + 26, 16, k[0]);                          /* front leg */
  RF(x + 4, y + 32, 14, 1, k[1]);                                                                                    /* stretcher */
};

PK.couch = function (c, x, y, w, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 110);
  const col = o.color || "#7a3a5a", k = K(col), h = o.h || round(w * 0.42), r = rng(o, x, y, 41);
  const arm = 13, seatY = y + round(h * 0.5), backH = seatY - y;
  groundShadow(c, x + w / 2, y + h, w / 2, 2, 0.45);
  [x + 4, x + w - 8].forEach(lx => R(c, lx, y + h - 5, 4, 5, "#2a1c22"));
  /* back */
  rr(c, x + arm - 2, y, w - arm * 2 + 4, backH + 4, col, 3); gradient(c, x + arm, y + 1, w - arm * 2, backH, [[0, k[3]], [0.25, k[2]], [1, k[1]]], 0.5, true);
  HL(c, x + arm, y, w - arm * 2, k[4]);
  const cush = w > 100 ? 3 : 2, cw = (w - arm * 2) / cush;
  for (let i = 0; i < cush; i++) {
    const bx = x + arm + round(i * cw);
    VL(c, bx, y + 3, backH - 2, k[0]); VL(c, bx + 1, y + 3, backH - 3, k[3]);
    P(c, bx + round(cw / 2), y + round(backH * 0.45), k[0]); P(c, bx + round(cw / 2) - 1, y + round(backH * 0.45) - 1, k[4]);                    /* tufting button */
    for (let q = 0; q < 4; q++) { P(c, bx + round(cw / 2) - 3 + q * 2, y + round(backH * 0.45) + 2 - (q % 2) * 0, k[1]); }
  }
  /* seat cushions */
  const sh_ = h - round(h * 0.5) - 5;
  for (let i = 0; i < cush; i++) {
    const bx = x + arm + round(i * cw), ew = round((i + 1) * cw) - round(i * cw) - 0;
    R(c, bx, seatY, ew, sh_, k[2]); gradient(c, bx, seatY, ew, sh_, [[0, k[4]], [0.14, k[3]], [0.5, k[2]], [1, k[1]]], 0.6, true);
    HL(c, bx, seatY, ew, k[4]); HL(c, bx, seatY + sh_ - 1, ew, k[0]); VL(c, bx, seatY, sh_, k[0]); VL(c, bx + 1, seatY + 1, sh_ - 2, k[3]);
    for (let s = 0; s < ew; s += 2) P(c, bx + s, seatY + 4, k[1]);                                                                              /* piping stitch */
  }
  R(c, x + w - arm - 1, seatY, 1, sh_, k[0]);
  /* arms */
  [x, x + w - arm].forEach((ax, i) => {
    rr(c, ax, y + round(h * 0.3), arm, h - round(h * 0.3) - 4, col, 3);
    gradient(c, ax + 1, y + round(h * 0.3) + 1, arm - 2, h - round(h * 0.3) - 6, [[0, i ? k[3] : k[4]], [0.5, k[2]], [1, i ? k[0] : k[1]]], 1, false);
    HL(c, ax + 2, y + round(h * 0.3), arm - 4, k[4]); HL(c, ax + 1, y + h - 6, arm - 2, k[0]);
  });
  if (o.pillow !== false) {
    const pc = o.pillowColor || "#e0a030", pk_ = K(pc), px = x + arm + 3, py = y + round(h * 0.22);
    poly(c, [[px, py + 4], [px + 8, py], [px + 15, py + 8], [px + 7, py + 13]], pc);
    line(c, px, py + 4, px + 8, py, pk_[4]); line(c, px + 8, py, px + 15, py + 8, pk_[3]); line(c, px + 15, py + 8, px + 7, py + 13, pk_[1]); line(c, px, py + 4, px + 7, py + 13, pk_[2]);
    P(c, px + 8, py + 7, pk_[0]);
  }
};

PK.bed = function (c, x, y, w, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 176);
  const col = o.color || "#6b35a0", k = K(col), sheet = o.sheet || "#d8d2e8", ks = K(sheet), metal = o.frame === "wood" ? "#6a4030" : "#4a4658", km = K(metal), h = o.h || 62;
  const f = !!o.flip, r = rng(o, x, y, 42);
  const mx = (px, pw) => f ? x + w - (px - x) - pw : px;
  const RF = (px, py, pw, ph, cc) => R(c, mx(px, pw), py, pw, ph, cc);
  const HF = (px, py, pw, cc) => RF(px, py, pw, 1, cc), VF = (px, py, ph, cc) => RF(px, py, 1, ph, cc);
  const mt = y + round(h * 0.52);
  groundShadow(c, x + w / 2, y + h, w / 2, 3, 0.45);
  /* under-bed darkness */
  RF(x + 4, mt + 14, w - 8, h - round(h * 0.52) - 14, "#1a1220");
  /* headboard + posts */
  RF(x, y, 5, h, metal); VF(x, y, h, km[3]); VF(x + 4, y, h, km[0]);
  RF(x, y, 38, 3, metal); HF(x, y, 38, km[4]);
  for (let bx = x + 8; bx < x + 38; bx += 7) { RF(bx, y + 3, 2, mt - y - 6, metal); VF(bx, y + 3, mt - y - 6, km[3]); }
  RF(x, y + round(h * 0.28), 38, 2, metal); HF(x, y + round(h * 0.28), 38, km[3]);
  RF(x + w - 4, mt - 14, 4, h - (mt - y) + 14, metal); VF(x + w - 4, mt - 14, h - (mt - y) + 14, km[3]);               /* footboard */
  RF(x + w - 4, mt - 14, 4, 2, km[4]);
  /* mattress side + sheet */
  RF(x + 5, mt, w - 9, 12, sheet); HF(x + 5, mt, w - 9, ks[4]); HF(x + 5, mt + 11, w - 9, ks[1]);
  for (let px = x + 8; px < x + w - 8; px += 7) { RF(px, mt + 4, 3, 1, ks[1]); }
  /* blanket: top surface + hanging side */
  const bx0 = x + 40;
  RF(bx0, mt - 11, w - 44 - 3, 11, col); gradient(c, mx(bx0, w - 47), mt - 11, w - 47, 11, [[0, k[4]], [0.2, k[3]], [1, k[2]]], 1, true);
  for (let px = bx0 + 4; px < x + w - 8; px += 14) { RF(px, mt - 10, 2, 10, k[3]); RF(px + 6, mt - 9, 1, 9, k[1]); }
  RF(bx0, mt, w - 44 - 3, 20, col);
  gradient(c, mx(bx0, w - 47), mt, w - 47, 20, [[0, k[3]], [0.1, k[2]], [1, k[1]]], 1, true);
  HF(bx0, mt, w - 47, k[4]);
  for (let px = bx0 + 6; px < x + w - 10; px += 16) { RF(px, mt + 2, 2, 18, k[1]); RF(px + 3, mt + 2, 1, 16, k[3]); }
  for (let px = bx0; px < x + w - 7; px++) if ((px * 7) % 5 < 2) RF(px, mt + 20, 1, 1, k[0]);
  /* pillow */
  const px0 = x + 8, pw = 30;
  ell(c, mx(px0 + pw / 2, 1), mt - 6, 16, 6, ks[1]); ell(c, mx(px0 + pw / 2, 1), mt - 7, 15, 5, "#efeaf8"); HF(px0 + 8, mt - 11, 12, "#ffffff"); HF(px0 + 3, mt - 4, 24, ks[1]);
  /* legs */
  RF(x + 4, y + h - 3, 3, 3, "#2a2434"); RF(x + w - 8, y + h - 3, 3, 3, "#2a2434");
};

PK.desk = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 108); h = round(h || 50);
  const wood = o.wood || "#7a4a32", k = K(wood), r = rng(o, x, y, 43);
  const kt = K(o.top || "#9a6244"), ped = round(w * 0.32);
  groundShadow(c, x + w / 2, y + h, w / 2, 2, 0.4);
  /* top */
  R(c, x - 1, y, w + 2, 6, kt[2]); HL(c, x - 1, y, w + 2, kt[4]); HL(c, x - 1, y + 1, w + 2, kt[3]); HL(c, x - 1, y + 5, w + 2, kt[0]);
  for (let i = 0; i < w / 8; i++) R(c, x + floor(r() * (w - 6)), y + 2 + floor(r() * 3), ri(r, 3, 10), 1, kt[3]);
  R(c, x, y + 6, w, 6, k[2]); HL(c, x, y + 6, w, k[1]); HL(c, x, y + 11, w, k[0]);
  /* leg panel (left) + pedestal (right) */
  R(c, x + 3, y + 12, 5, h - 12, k[1]); VL(c, x + 3, y + 12, h - 12, k[3]); VL(c, x + 7, y + 12, h - 12, k[0]);
  R(c, x + 9, y + 12, w - ped - 12, h - 12, "#1c121a"); dshade(c, x + 9, y + 12, w - ped - 12, h - 12, "#000000", (px, py) => 0.3, 0.3);
  R(c, x + w - ped, y + 12, ped - 2, h - 12, k[2]); VL(c, x + w - ped, y + 12, h - 12, k[3]); VL(c, x + w - 3, y + 12, h - 12, k[0]);
  const dh = floor((h - 16) / 3);
  for (let i = 0; i < 3; i++) {
    const dy = y + 14 + i * dh;
    R(c, x + w - ped + 2, dy, ped - 6, dh - 2, k[2]); outline(c, x + w - ped + 2, dy, ped - 6, dh - 2, k[1]); HL(c, x + w - ped + 3, dy + 1, ped - 8, k[3]);
    R(c, x + w - ped + 2 + floor((ped - 6) / 2) - 3, dy + floor(dh / 2) - 1, 6, 2, "#e0c870"); HL(c, x + w - ped + 2 + floor((ped - 6) / 2) - 3, dy + floor(dh / 2) - 1, 6, "#fff0b0");
  }
  R(c, x + 3, y + h - 2, 5, 2, k[0]); R(c, x + w - 8, y + h - 2, 5, 2, k[0]);
};

PK.lamp = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y); const em = [];
  const kind = o.kind || "table", on = o.on !== false, shade = o.color || "#f0dcb0", ksh = K(shade);
  const floorL = kind === "floor", H = floorL ? 74 : 34, sw = floorL ? 20 : 18, shh = floorL ? 18 : 14;
  const cx = x + floor(sw / 2);
  if (kind === "desk") {
    /* articulated desk lamp */
    R(c, x, y + 30, 14, 4, "#2a2838"); HL(c, x, y + 30, 14, "#6a667c");
    line(c, x + 7, y + 30, x + 12, y + 14, "#8a869c"); line(c, x + 12, y + 14, x + 4, y + 5, "#8a869c"); line(c, x + 8, y + 30, x + 13, y + 14, "#4a4658"); line(c, x + 13, y + 14, x + 5, y + 5, "#4a4658");
    poly(c, [[x + 1, y + 3], [x + 10, y], [x + 11, y + 8], [x + 1, y + 9]], "#3a364a"); line(c, x + 1, y + 3, x + 10, y, "#8a869c");
    if (on) { R(c, x + 1, y + 9, 10, 2, "#fff6d0"); em.push([x + 1, y + 9, 10, 2]); haloPts(c, x + 6, y + 14, 22, "#ffe2a0", 0.9, em); }
    return em;
  }
  groundShadow(c, cx, y + H, 9, 2, 0.4);
  if (floorL) { R(c, cx - 5, y + H - 3, 11, 3, "#2a2838"); HL(c, cx - 5, y + H - 3, 11, "#6a667c"); VL(c, cx, y + shh, H - shh - 3, "#8a869c"); VL(c, cx + 1, y + shh, H - shh - 3, "#4a4658"); }
  else { ell(c, cx, y + H - 7, 6, 7, "#4a6a8a"); ball(c, cx, y + H - 8, 6, "#4a7aa8"); R(c, cx - 4, y + H - 2, 9, 2, "#3a364a"); VL(c, cx, y + shh, H - shh - 8, "#8a869c"); }
  /* shade (trapezoid) */
  const top = y, bw = sw, tw = round(sw * 0.62);
  poly(c, [[cx - tw / 2, top], [cx + tw / 2, top], [cx + bw / 2, top + shh], [cx - bw / 2, top + shh]], on ? "#fff0c8" : shade);
  if (on) {
    gradient(c, cx - bw / 2, top, bw, shh, [[0, "#fff6d8"], [0.5, "#ffe4a0"], [1, "#ffc870"]], 1, true);
    em.push([cx - bw / 2, top, bw, shh]);
    HL(c, cx - tw / 2, top, tw, "#ffffff");
    haloPts(c, cx, top + shh * 0.7, 34, "#ffd890", 1.0, em, 30);
    R(c, cx - bw / 2 + 2, top + shh - 1, bw - 4, 1, "#ff9a4a");
  } else {
    gradient(c, cx - bw / 2 + 1, top + 1, bw - 2, shh - 1, [[0, ksh[3]], [0.5, ksh[2]], [1, ksh[1]]], 1, false);
    HL(c, cx - tw / 2, top, tw, ksh[4]); HL(c, cx - bw / 2, top + shh - 1, bw, ksh[0]);
  }
  P(c, cx + 2, top + shh + 1, "#ffcf7a");
  return em;
};

/* leaf as a two-tone tapered polygon */
function leaf(c, bx, by, ang, len, wd, col, droop) {
  const k = K(col);
  const dx = Math.sin(ang), dy = -Math.cos(ang), px = -dy, py = dx;
  const mx = bx + dx * len * 0.5, my = by + dy * len * 0.5;
  let tx = bx + dx * len, ty = by + dy * len + (droop || 0);
  const l = [mx + px * wd, my + py * wd], r_ = [mx - px * wd, my - py * wd];
  poly(c, [[bx, by], l, [tx, ty], r_], k[2]);
  poly(c, [[bx, by], r_, [tx, ty], [mx - px * wd * 0.1, my - py * wd * 0.1]], k[1]);
  line(c, bx, by, tx, ty, k[3]);
  P(c, round(mx + px * wd * 0.5), round(my + py * wd * 0.5 - 1), k[4]);
}
PK.plant = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y);
  const size = o.size || 2, dead = !!o.dead, r = rng(o, x, y, 44);
  const pw = [12, 16, 22][size - 1] || 16, ph = [10, 13, 17][size - 1] || 13, H = [28, 47, 69][size - 1] || 47, W = [30, 50, 76][size - 1] || 50;
  const potC = o.pot || "#c06a3a", kp = K(potC), cx = x + floor(W / 2);
  groundShadow(c, cx, y + H, pw / 2 + 4, 2, 0.4);
  const leafC = dead ? "#8a6a3a" : (o.color || "#4a9a4a");
  const n = [6, 9, 13][size - 1] || 9;
  const ly = y + H - ph;
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1), ang = (t - 0.5) * (dead ? 2.4 : 2.7) + (r() - 0.5) * 0.3, len = (H - ph + 5) * (0.55 + 0.45 * cos(ang) * (0.7 + r() * 0.3)), wd = [2, 3.2, 4.5][size - 1] * (0.8 + r() * 0.4);
    leaf(c, cx + (r() - 0.5) * 3, ly + 2, ang, len, wd, i % 3 === 0 ? mix(leafC, "#9ac86a", 0.2) : leafC, dead ? len * 0.35 : 0);
  }
  /* pot */
  poly(c, [[cx - pw / 2, ly], [cx + pw / 2, ly], [cx + pw / 2 - 2, y + H], [cx - pw / 2 + 2, y + H]], kp[2]);
  gradient(c, cx - pw / 2 + 1, ly + 3, pw - 2, ph - 3, [[0, kp[3]], [0.3, kp[2]], [1, kp[0]]], 1, false);
  R(c, cx - pw / 2 - 1, ly, pw + 2, 3, kp[3]); HL(c, cx - pw / 2 - 1, ly, pw + 2, kp[4]); HL(c, cx - pw / 2 - 1, ly + 2, pw + 2, kp[1]);
  R(c, cx - pw / 2 + 1, ly + 3, pw - 2, 1, "#2a1c14");
  if (dead) { for (let i = 0; i < 3; i++) P(c, cx - 3 + i * 3, ly + 1, "#4a3420"); }
};

PK.tv = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y) - 4;
  const on = !!o.on, w = o.w || 44, h = o.h || 38, body = o.color || "#3a364a", k = K(body), em = [], content = o.content || "static", r = rng(o, x, y, 45);
  groundShadow(c, x + w / 2, y + h, w / 2, 2, 0.4);
  if (o.ears) { line(c, x + w / 2, y + 3, x + 6, y - 14, "#c8c4d8"); line(c, x + w / 2, y + 3, x + w - 6, y - 14, "#c8c4d8"); }
  R(c, x, y + 4, w, h - 8, body); HL(c, x, y + 4, w, k[4]); VL(c, x, y + 4, h - 8, k[3]); VL(c, x + w - 1, y + 4, h - 8, k[0]); HL(c, x, y + h - 5, w, k[0]);
  R(c, x + 3, y + h - 5, 6, 5, k[0]); R(c, x + w - 9, y + h - 5, 6, 5, k[0]);
  const sx = x + 3, sy = y + 7, sw = w - 14, sh_ = h - 16;
  rr(c, sx - 1, sy - 1, sw + 2, sh_ + 2, "#0c0814", 3);
  if (on) {
    clip(c, sx, sy, sw, sh_, () => {
      if (content === "bars") { const cols = ["#e8e4f0", "#e8d020", "#20d8d8", "#20d820", "#d820d8", "#d82020", "#2020d8"]; cols.forEach((cc, i) => R(c, sx + floor(i * sw / 7), sy, ceil(sw / 7), floor(sh_ * 0.75), cc)); R(c, sx, sy + floor(sh_ * 0.75), sw, ceil(sh_ * 0.25), "#10102a"); }
      else if (content === "news") { gradient(c, sx, sy, sw, sh_, ["#1a3a7a", "#2a5aa8"], 1, true); R(c, sx + 3, sy + sh_ - 9, sw - 6, 6, "#c0302c"); R(c, sx + 3, sy + sh_ - 9, 10, 6, "#f4f0e8"); ell(c, sx + sw / 2, sy + 9, 4, 5, "#e0a27a"); R(c, sx + sw / 2 - 6, sy + 14, 12, 7, "#1d1622"); }
      else if (content === "blue") R(c, sx, sy, sw, sh_, "#2a50d8");
      else paintFn(c, sx, sy, sw, sh_, (px, py) => { const v = (Math.imul(px * 31 + py * 17 + (o.frame || 0) * 7, 2654435761) >>> 0) % 100; return v < 35 ? "#f0f0f8" : v < 60 ? "#a0a0b8" : v < 85 ? "#505068" : "#202030"; });
      dshade(c, sx, sy, sw, sh_, "#ffffff", (px, py) => { const q = ((px - sx) + (py - sy) + 800) % 34; return q < 5 ? 1 : 0; }, 0.16);
      dshade(c, sx, sy, sw, sh_, "#000000", (px, py) => { const dx = (px - sx - sw / 2) / (sw / 2), dy = (py - sy - sh_ / 2) / (sh_ / 2); return clamp(dx * dx + dy * dy - 0.5, 0, 1); }, 0.5);
    });
    em.push([sx, sy, sw, sh_]); haloPts(c, sx + sw / 2, sy + sh_ / 2, w * 0.9, content === "news" ? "#7aa8ff" : "#c8d8ff", 0.5, em, h * 0.8);
  } else {
    R(c, sx, sy, sw, sh_, "#141a20"); rr(c, sx, sy, sw, sh_, "#1c242c", 3);
    dshade(c, sx, sy, sw, sh_, "#ffffff", (px, py) => { const q = ((px - sx) + (py - sy) + 800) % 40; return q < 5 ? 1 : 0; }, 0.1); P(c, sx + 2, sy + 2, "#6a7a8a");
  }
  R(c, x + w - 9, y + 7, 7, sh_, k[1]); outline(c, x + w - 9, y + 7, 7, sh_, k[0]);
  ell(c, x + w - 6, y + 12, 2, 2, "#8a869c"); ell(c, x + w - 6, y + 19, 2, 2, "#8a869c"); for (let i = 0; i < 4; i++) HL(c, x + w - 8, y + 25 + i * 2, 5, k[0]);
  P(c, x + w - 4, y + h - 8, on ? "#ff3a3a" : "#4a1a1a");
  return em;
};

PK.laptop = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y);
  const on = !!o.on, w = o.w || 30, h = o.h || 22, body = o.color || "#8a8698", k = K(body), em = [];
  const sh_ = h - 5;
  R(c, x + 2, y, w - 4, sh_, "#2a2834"); HL(c, x + 2, y, w - 4, "#5a5668"); VL(c, x + 2, y, sh_, "#4a4658"); VL(c, x + w - 3, y, sh_, "#1a1822");
  const sx = x + 4, sy = y + 2, sw = w - 8, shh = sh_ - 4;
  if (on) {
    R(c, sx, sy, sw, shh, o.screen || "#1a2840");
    R(c, sx, sy, sw, 2, "#3a5a98"); R(c, sx + 2, sy + 4, round(sw * 0.4), 1, "#9fc2ff"); R(c, sx + 2, sy + 6, round(sw * 0.6), 1, "#6a8ad8"); R(c, sx + 2, sy + 8, round(sw * 0.3), 1, "#6a8ad8");
    R(c, sx + sw - 8, sy + 4, 6, 6, "#ff3fa4"); R(c, sx + sw - 7, sy + 5, 4, 1, "#ffd0e8");
    em.push([sx, sy, sw, shh]); haloPts(c, sx + sw / 2, sy + shh / 2, 26, "#9fc2ff", 0.45, em, 20);
  } else { R(c, sx, sy, sw, shh, "#12141c"); dshade(c, sx, sy, sw, shh, "#ffffff", (px, py) => { const q = ((px - sx) + (py - sy) + 800) % 24; return q < 4 ? 1 : 0; }, 0.1); }
  R(c, x + w - 9, y + 3, 3, 2, "#ffd23f");                                                    /* sticker */
  poly(c, [[x + 2, y + sh_], [x + w - 2, y + sh_], [x + w, y + h], [x, y + h]], body);
  HL(c, x + 2, y + sh_, w - 4, k[4]); HL(c, x, y + h - 1, w, k[0]);
  for (let ro = 0; ro < 2; ro++) for (let px = x + 4; px < x + w - 4; px += 2) P(c, px, y + sh_ + 1 + ro * 2, k[ro ? 1 : 3]);
  R(c, x + 12, y + h - 2, 6, 1, k[1]);
  return em;
};

/* ---- posters, frames, clock -------------------------------------------------------------------- */
PK.poster = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 40); h = round(h || 56);
  const r = rng(o, x, y, 46);
  let pal = o.palette;
  if (typeof pal === "string") pal = { neon: ["#14102e", "#ff3fa4", "#39d0ff", "#e8e4f0"], paper: ["#eadcc0", "#c0302c", "#1d1622", "#2f62b8"], mono: ["#e8e4f0", "#1d1622", "#6a667c", "#1d1622"], sunset: ["#2a1a3a", "#ff8a4c", "#ffd23f", "#f4ead0"] }[pal] || null;
  pal = pal || pk(r, ART_PALS);
  const bg = pal[0], a = pal[1], b = pal[2], ink = inkFor(bg, [pal[3], pal[1], pal[2]]);
  R(c, x, y, w, h, bg);
  if (r() < 0.5) gradient(c, x, y, w, h, [bg, mix(bg, a, 0.28)], 1, true);
  const titleH = h * 0.34, my = y + 2, mh = h - titleH - 12;
  const kind = floor(r() * 5), cx = x + w / 2;
  clip(c, x, y, w, h, () => {
    if (kind === 0) {                                                 /* wireframe orb (NOWHERE flyer style) */
      const rad = min(w, mh) * 0.38, ocy = my + mh * 0.5;
      for (let yy = -rad; yy <= rad; yy++) for (let xx = -rad; xx <= rad; xx++) { const d = xx * xx + yy * yy; if (d < rad * rad && (round(xx) % 4 === 0 || round(yy) % 4 === 0 || abs(d - rad * rad * 0.8) < rad)) P(c, cx + xx, ocy + yy, a); }
    } else if (kind === 1) {                                          /* sun + bars */
      ell(c, cx, my + mh * 0.5, min(w, mh) * 0.34, min(w, mh) * 0.34, a);
      for (let i = 0; i < 5; i++) R(c, x, my + mh * 0.5 + i * 3, w, 1 + (i >> 1), bg);
    } else if (kind === 2) {                                          /* diagonal stripes */
      for (let i = -h; i < w + h; i += 8) line(c, x + i, my, x + i + mh, my + mh, a), line(c, x + i + 1, my, x + i + mh + 1, my + mh, a);
      R(c, x + w * 0.25, my + mh * 0.3, w * 0.5, mh * 0.4, bg); outline(c, x + w * 0.25, my + mh * 0.3, w * 0.5, mh * 0.4, b);
    } else if (kind === 3) {                                          /* skyline */
      let px = x; while (px < x + w) { const bw = ri(r, 3, 7), bh = ri(r, 4, max(5, floor(mh * 0.7))); R(c, px, my + mh - bh, bw, bh, a); for (let q = 0; q < 3; q++) P(c, px + 1, my + mh - bh + 2 + q * 3, b); px += bw + 1; }
      ell(c, x + w * 0.7, my + mh * 0.25, 4, 4, b);
    } else {                                                          /* concentric rings */
      for (let i = floor(min(w, mh) * 0.42); i > 0; i -= 2) ring(c, round(cx), round(my + mh / 2), i, (i / 2) % 2 ? a : b);
    }
  });
  /* title */
  const title = o.title || pk(r, ["NOWHERE", "BASS CITY", "AFTER HRS", "ACID RAIN", "SUB FREQ", "LOW END", "DEEP CUTS", "SOLAR", "WAREHOUSE"]);
  const words = title.split(" "), lines = o.titleLines || (words.length > 1 && txtW(title, 1, 1) > w - 6 ? words : [title]);
  let ty = round(y + h - titleH - 6);
  lines.forEach(L => { const sc = fitScale(L, w - 6, 3, 1); const tw = txtW(L, sc, 1); txt(c, L, round(cx - tw / 2) + 1, ty + 1, mix(bg, "#000000", 0.5), sc, 1); txt(c, L, round(cx - tw / 2), ty, ink === bg ? a : (sc > 1 ? ink : ink), sc, 1); ty += sc * 5 + 2; });
  const ls = o.lines || ["SAT 10PM", "DJ ???"];
  ls.forEach((L, i) => { if (ty + 5 < y + h - 1) txtC(c, L, cx, ty + 1 + i * 6, i === 0 ? b : mix(ink, bg, 0.3), 1); });
  /* handling: border, creases, tape, torn corner */
  outline(c, x, y, w, h, mix(bg, "#0c0618", 0.4));
  if (o.border !== false) outline(c, x + 2, y + 2, w - 4, h - 4, mix(bg, a, 0.35));
  VL(c, x + floor(w / 2), y + 1, h - 2, mix(bg, "#ffffff", 0.14)); HL(c, x + 1, y + floor(h / 2), w - 2, mix(bg, "#000000", 0.12));
  if (o.tape !== false) { R(c, x - 2, y - 1, 6, 3, "#d8cfa0"); R(c, x + w - 4, y - 1, 6, 3, "#d8cfa0"); HL(c, x - 2, y - 1, 6, "#f4ecc0"); HL(c, x + w - 4, y - 1, 6, "#f4ecc0"); }
};

PK.frame = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 26); h = round(h || 32);
  const col = o.color || "#a06a46", k = K(col), r = rng(o, x, y, 47), t = o.thick || 3;
  R(c, x, y, w, h, col); HL(c, x, y, w, k[4]); VL(c, x, y, h, k[3]); VL(c, x + w - 1, y, h, k[0]); HL(c, x, y + h - 1, w, k[0]);
  HL(c, x + 1, y + 1, w - 2, k[3]); VL(c, x + w - 2, y + 1, h - 2, k[1]); HL(c, x + 1, y + h - 2, w - 2, k[1]);
  const ix = x + t, iy = y + t, iw = w - t * 2, ih = h - t * 2;
  R(c, ix, iy, iw, ih, "#e8e0cc"); HL(c, ix, iy, iw, "#b8b09c"); VL(c, ix, iy, ih, "#b8b09c");
  const px = ix + 2, py = iy + 2, pw = iw - 4, ph = ih - 4;
  if (o.mirror) {
    gradient(c, px, py, pw, ph, ["#6a7a98", "#a0b0c8", "#7a8aa8"], 1, true);
    dshade(c, px, py, pw, ph, "#ffffff", (qx, qy) => { const q = ((qx - px) + (qy - py) * 1 + 400) % 36; return q < 5 ? 1 : 0; }, 0.3);
  } else {
    const pal = o.palette || pk(r, ART_PALS), kind = o.kind || pk(r, ["landscape", "portrait", "abstract"]);
    if (kind === "landscape") { gradient(c, px, py, pw, ph, [pal[2], mix(pal[2], pal[1], 0.6), pal[1]], 1, true); ell(c, px + pw * 0.7, py + ph * 0.35, 2, 2, pal[3]); poly(c, [[px, py + ph], [px + pw * 0.35, py + ph * 0.45], [px + pw * 0.7, py + ph]], pal[0]); R(c, px, py + ph - 3, pw, 3, K(pal[0])[1]); }
    else if (kind === "portrait") { R(c, px, py, pw, ph, pal[1]); ell(c, px + pw / 2, py + ph * 0.45, pw * 0.26, ph * 0.26, "#e0a27a"); ell(c, px + pw / 2, py + ph * 1.0, pw * 0.4, ph * 0.28, pal[0]); ell(c, px + pw / 2, py + ph * 0.32, pw * 0.28, ph * 0.14, "#1d1622"); }
    else { R(c, px, py, pw, ph, pal[0]); for (let i = 0; i < 5; i++) R(c, px + ri(r, 0, max(1, pw - 4)), py + ri(r, 0, max(1, ph - 4)), ri(r, 2, 6), ri(r, 2, 6), pk(r, pal)); }
    dshade(c, px, py, pw, ph, "#ffffff", (qx, qy) => { const q = ((qx - px) + (qy - py) + 400) % 40; return q < 3 ? 1 : 0; }, 0.14);
  }
  AR(c, px, py, pw, 2, "#0c0618", 0.25); AR(c, px, py, 2, ph, "#0c0618", 0.2);
};

PK.clock = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y);
  const d = o.d || 18, rad = floor(d / 2), cx = x + rad, cy = y + rad, k = K(o.color || "#3a364a");
  const hh = o.hour != null ? o.hour : 10, mm = o.min != null ? o.min : 10;
  ell(c, cx, cy, rad, rad, k[1]); ell(c, cx, cy, rad - 1, rad - 1, k[3]); ell(c, cx, cy, rad - 2, rad - 2, "#f4f0e4");
  ell(c, cx - 1, cy - 1, max(1, rad - 5), max(1, rad - 5), "#fffaf0");
  for (let i = 0; i < 12; i++) { const a = i * PI / 6, rr_ = rad - 3; P(c, cx + round(Math.sin(a) * rr_), cy - round(Math.cos(a) * rr_), i % 3 === 0 ? "#1d1622" : "#6a667c"); }
  const ma = mm / 60 * 2 * PI, ha = (hh % 12 + mm / 60) / 12 * 2 * PI;
  line(c, cx, cy, cx + round(Math.sin(ha) * (rad - 5)), cy - round(Math.cos(ha) * (rad - 5)), "#1d1622");
  line(c, cx, cy, cx + round(Math.sin(ma) * (rad - 3)), cy - round(Math.cos(ma) * (rad - 3)), "#1d1622");
  P(c, cx, cy, "#c0302c"); P(c, cx - rad + 1, cy - rad + 2, k[4]); P(c, cx - rad + 2, cy - rad + 1, k[4]);
};

PK.radiator = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 80); h = round(h || 34);
  const col = o.color || "#c8c2d4", k = K(col);
  R(c, x, y, w, 3, k[3]); HL(c, x, y, w, k[4]); HL(c, x, y + 2, w, k[1]);
  for (let px = x + 2; px < x + w - 4; px += 5) {
    R(c, px, y + 3, 4, h - 7, col); VL(c, px, y + 3, h - 7, k[3]); VL(c, px + 2, y + 3, h - 7, k[1]); VL(c, px + 3, y + 3, h - 7, k[0]);
    P(c, px + 1, y + 4, k[4]);
  }
  R(c, x - 1, y + h - 5, w + 2, 3, k[1]); HL(c, x - 1, y + h - 5, w + 2, k[2]); HL(c, x - 1, y + h - 3, w + 2, k[0]);
  R(c, x + 3, y + h - 2, 4, 2, k[0]); R(c, x + w - 7, y + h - 2, 4, 2, k[0]);
  R(c, x + w, y + 4, 5, 3, k[2]); R(c, x + w + 2, y + 1, 3, 3, "#c8b070"); P(c, x + w + 2, y + 1, "#fff0b0");        /* valve */
  dshade(c, x + 2, y + 3, w - 4, 6, "#0c0618", (px, py) => 1 - (py - y - 3) / 6, 0.25);
};

PK.pipe = function (c, x, y, len, o) {
  o = o || {}; x = round(x); y = round(y); len = round(len || 60);
  const vert = o.dir !== "h", t = o.r || 4, col = o.color || "#8a869c", k = K(col), r = rng(o, x, y, 48);
  if (vert) cylV(c, x, y, t, len, col); else cylH(c, x, y, len, t, col);
  const step = o.joint || 44;
  for (let p = step / 2; p < len - 3; p += step) {
    if (vert) { R(c, x - 1, y + floor(p), t + 2, 3, k[2]); HL(c, x - 1, y + floor(p), t + 2, k[4]); HL(c, x - 1, y + floor(p) + 2, t + 2, k[0]); if (r() < 0.4) VL(c, x + 1, y + floor(p) + 3, ri(r, 3, 9), "#a0603a"); }
    else { R(c, x + floor(p), y - 1, 3, t + 2, k[2]); VL(c, x + floor(p), y - 1, t + 2, k[4]); VL(c, x + floor(p) + 2, y - 1, t + 2, k[0]); if (r() < 0.4) HL(c, x + floor(p) + 3, y + 1, ri(r, 3, 9), "#a0603a"); }
  }
  if (o.brackets !== false) for (let p = step; p < len; p += step * 2) { if (vert) R(c, x - 2, y + p, t + 4, 2, "#5a566c"); else R(c, x + p, y - 2, 2, t + 4, "#5a566c"); }
};

PK.vent = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x || 0); y = round(y || 0); w = round(w || 26); h = round(h || 16);
  const col = o.color || "#a8a4b8", k = K(col);
  R(c, x, y, w, h, k[2]); HL(c, x, y, w, k[4]); VL(c, x, y, h, k[3]); VL(c, x + w - 1, y, h, k[0]); HL(c, x, y + h - 1, w, k[0]);
  R(c, x + 2, y + 2, w - 4, h - 4, "#14101c");
  for (let py = y + 3; py < y + h - 3; py += 3) { R(c, x + 2, py, w - 4, 2, k[1]); HL(c, x + 2, py, w - 4, k[3]); }
  P(c, x + 1, y + 1, k[0]); P(c, x + w - 2, y + 1, k[0]); P(c, x + 1, y + h - 2, k[0]); P(c, x + w - 2, y + h - 2, k[0]);
  dshade(c, x + 2, y + 2, w - 4, 4, "#0c0618", (px, py) => 1 - (py - y - 2) / 4, 0.4);
};

PK.sink = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y);
  const w = o.w || 28, col = o.color || "#e8e4f0", k = K(col);
  /* faucet */
  R(c, x + floor(w / 2) - 1, y, 3, 5, "#c8c4d8"); VL(c, x + floor(w / 2) - 1, y, 5, "#ffffff"); R(c, x + floor(w / 2) - 1, y, 8, 2, "#c8c4d8"); HL(c, x + floor(w / 2) - 1, y, 8, "#ffffff"); R(c, x + floor(w / 2) + 5, y + 2, 2, 2, "#8a869c");
  R(c, x + 3, y + 3, 3, 3, "#c0302c"); R(c, x + w - 6, y + 3, 3, 3, "#3a8ad8");
  /* basin */
  poly(c, [[x, y + 6], [x + w, y + 6], [x + w - 3, y + 17], [x + 3, y + 17]], col);
  gradient(c, x + 1, y + 7, w - 2, 9, [[0, k[4]], [0.4, k[3]], [1, k[1]]], 1, true);
  HL(c, x, y + 6, w, k[4]); HL(c, x + 2, y + 7, w - 4, k[1]); HL(c, x + 3, y + 17, w - 6, k[0]);
  ell(c, x + w / 2, y + 12, 5, 1, k[0]);
  /* pedestal */
  R(c, x + floor(w / 2) - 4, y + 17, 9, 20, col); VL(c, x + floor(w / 2) - 4, y + 17, 20, k[3]); VL(c, x + floor(w / 2) + 4, y + 17, 20, k[1]); HL(c, x + floor(w / 2) - 4, y + 17, 9, k[1]);
  R(c, x + floor(w / 2) - 7, y + 36, 15, 3, col); HL(c, x + floor(w / 2) - 7, y + 36, 15, k[4]); HL(c, x + floor(w / 2) - 7, y + 38, 15, k[0]);
  dshade(c, x + 3, y + 18, w - 6, 4, "#0c0618", (px, py) => 1 - (py - y - 18) / 4, 0.3);
};

PK.toilet = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y);
  const col = o.color || "#e8e4f0", k = K(col), f = !!o.flip, W = 30;
  const mx = (px, pw) => f ? x + W - (px - x) - pw : px;
  const RF = (px, py, pw, ph, cc) => R(c, mx(px, pw), py, pw, ph, cc);
  const HF = (px, py, pw, cc) => RF(px, py, pw, 1, cc), VF = (px, py, ph, cc) => RF(px, py, 1, ph, cc);
  groundShadow(c, x + 15, y + 35, 16, 2, 0.4);
  RF(x, y, 10, 17, col); gradient(c, mx(x + 1, 8), y + 1, 8, 15, [[0, k[3]], [0.5, k[2]], [1, k[1]]], 1, false);
  HF(x - 1, y, 12, k[4]); RF(x - 1, y, 12, 2, k[3]); HF(x - 1, y, 12, k[4]); HF(x - 1, y + 2, 12, k[1]); VF(x + 9, y + 2, 15, k[0]);
  RF(x + 8, y + 3, 4, 2, "#c8c4d8"); HF(x + 8, y + 3, 4, "#ffffff");                                   /* flush lever */
  RF(x + 2, y + 17, 9, 12, col); VF(x + 2, y + 17, 12, k[3]);                                           /* neck */
  RF(x + 6, y + 15, 24, 3, k[3]); HF(x + 6, y + 15, 24, k[4]); HF(x + 6, y + 17, 24, "#d8c8a0");       /* seat */
  poly(c, [[mx(x + 8, 1), y + 18], [mx(x + 30, 1), y + 18], [mx(x + 26, 1), y + 28], [mx(x + 8, 1), y + 30]], col);
  RF(x + 10, y + 18, 20, 9, col); gradient(c, mx(x + 10, 20), y + 18, 20, 9, [[0, k[3]], [1, k[1]]], 1, true); HF(x + 10, y + 18, 20, k[4]);
  RF(x + 5, y + 29, 14, 7, col); VF(x + 5, y + 29, 7, k[3]); VF(x + 18, y + 29, 7, k[1]); HF(x + 5, y + 35, 14, k[0]);
  RF(x + 12, y + 20, 14, 2, "#8ab0d8");
};

/* ---- office ----------------------------------------------------------------------------------- */
PK.officeCubicle = function (c, x, y, w, h, o) {
  o = o || {}; w = round(w || 132); h = round(h || 88);
  x = round(x) + 12; y = round(y) + 2; w = w - 14; h = h - 2;                  /* footprint includes the 12px side panel and 2px cap */
  const col = o.color || "#6a7a96", k = K(col), r = rng(o, x, y, 49), em = [];
  /* back panel (fabric) */
  R(c, x, y, w, h - 28, col);
  paintFn(c, x, y, w, h - 28, (px, py) => { const v = (Math.imul(px * 73 + py * 179, 2654435761) >>> 0) % 100; return v < 12 ? k[3] : v < 22 ? k[1] : null; });
  dshade(c, x, y, w, h - 28, k[0], (px, py) => (py - y) / (h - 28) * 0.4, 0.3);
  R(c, x - 2, y - 2, w + 4, 4, "#2a2838"); HL(c, x - 2, y - 2, w + 4, "#5a5668"); R(c, x - 2, y + h - 30, w + 4, 3, "#2a2838");
  /* side panel with perspective */
  poly(c, [[x - 2, y - 2], [x - 12, y + 3], [x - 12, y + h - 22], [x - 2, y + h - 30]], k[1]);
  poly(c, [[x - 2, y - 2], [x - 12, y + 3], [x - 12, y + 5], [x - 2, y]], "#2a2838");
  /* desk surface */
  R(c, x - 6, y + h - 30, w + 12, 7, "#c8b090"); HL(c, x - 6, y + h - 30, w + 12, "#e8d8b8"); HL(c, x - 6, y + h - 24, w + 12, "#8a7a5a");
  R(c, x - 6, y + h - 23, w + 12, h - (h - 23), "#a89870");
  gradient(c, x - 4, y + h - 23, w + 8, 23, [[0, "#9a8a64"], [1, "#6a5a40"]], 1, true);
  /* monitor */
  const mx = x + round(w * 0.36), my = y + h - 56;
  R(c, mx, my, 34, 26, "#cfc4a8"); HL(c, mx, my, 34, "#fff0d0"); VL(c, mx, my, 26, "#e8dcc0"); VL(c, mx + 33, my, 26, "#8a7a5a"); HL(c, mx, my + 25, 34, "#8a7a5a");
  R(c, mx + 3, my + 3, 28, 19, "#12302a"); gradient(c, mx + 3, my + 3, 28, 19, ["#1a5a48", "#2a8a68"], 1, true);
  txt(c, "C:>_", mx + 5, my + 5, "#9fffd0", 1); HL(c, mx + 5, my + 12, 14, "#5ad8a0"); HL(c, mx + 5, my + 14, 20, "#5ad8a0"); HL(c, mx + 5, my + 16, 10, "#5ad8a0");
  em.push([mx + 3, my + 3, 28, 19]);
  R(c, mx + 10, my + 26, 14, 3, "#cfc4a8"); R(c, mx + 8, my + 29, 18, 3, "#a89870");
  /* keyboard, mouse, phone, papers, mug */
  R(c, mx + 2, y + h - 18, 28, 5, "#cfc4a8"); HL(c, mx + 2, y + h - 18, 28, "#fff0d0"); for (let kx = mx + 3; kx < mx + 29; kx += 2) { P(c, kx, y + h - 16, "#8a7a5a"); P(c, kx + 1, y + h - 14, "#8a7a5a"); }
  R(c, mx + 33, y + h - 16, 4, 3, "#cfc4a8");
  R(c, x + 8, y + h - 28, 18, 5, "#3a364a"); HL(c, x + 8, y + h - 28, 18, "#6a667c"); R(c, x + 10, y + h - 31, 8, 3, "#3a364a");
  R(c, x + w - 26, y + h - 22, 16, 5, "#f4f0e4"); HL(c, x + w - 26, y + h - 22, 16, "#ffffff"); R(c, x + w - 24, y + h - 24, 14, 3, "#e8e4d4"); HL(c, x + w - 24, y + h - 20, 10, "#8a869c");
  R(c, x + w - 34, y + h - 26, 5, 6, "#c0302c"); HL(c, x + w - 34, y + h - 26, 5, "#ff8a7a"); VL(c, x + w - 29, y + h - 24, 3, "#c0302c");
  /* pinned stuff on the panel */
  R(c, x + 10, y + 10, 14, 10, "#f4f0e4"); R(c, x + 12, y + 12, 10, 6, "#6a8ab8"); P(c, x + 16, y + 10, "#c0302c");
  R(c, x + w - 24, y + 12, 6, 6, "#ffe860"); R(c, x + w - 16, y + 18, 6, 6, "#ff9ac0"); P(c, x + w - 22, y + 14, "#b8a030");
  R(c, x + 30, y + 8, 22, 14, "#e8e4d4"); for (let i = 0; i < 4; i++) HL(c, x + 32, y + 11 + i * 3, 18 - i * 2, "#8a869c");
  return em;
};

PK.copier = function (c, x, y, o) {
  o = o || {}; x = round(x) + 1; y = round(y) + 2; const em = [];
  const col = o.color || "#d8d0bc", k = K(col), w = 56, h = 46;
  groundShadow(c, x + w / 2, y + h, w / 2, 2, 0.4);
  R(c, x, y + 8, w, h - 8, col); gradient(c, x, y + 8, w, h - 8, [[0, k[3]], [0.2, k[2]], [1, k[1]]], 1, true);
  HL(c, x, y + 8, w, k[4]); VL(c, x, y + 8, h - 8, k[3]); VL(c, x + w - 1, y + 8, h - 8, k[0]); HL(c, x, y + h - 1, w, k[0]);
  R(c, x - 1, y, w + 2, 9, "#8a8698"); gradient(c, x - 1, y, w + 2, 9, [[0, "#d8d4e4"], [1, "#6a667c"]], 1, true); HL(c, x - 1, y, w + 2, "#ffffff"); HL(c, x - 1, y + 8, w + 2, "#3a364a");   /* lid */
  R(c, x + 4, y - 2, 8, 3, "#3a364a");
  R(c, x + 4, y + 11, 24, 8, "#2a2838"); HL(c, x + 4, y + 11, 24, "#5a5668");                          /* panel */
  R(c, x + 6, y + 12, 12, 5, "#143a2a"); R(c, x + 7, y + 13, 8, 1, "#5affb0"); R(c, x + 7, y + 15, 5, 1, "#5affb0"); em.push([x + 6, y + 12, 12, 5]);
  for (let i = 0; i < 4; i++) P(c, x + 20 + i * 2, y + 14, i === 3 ? "#3fd07a" : "#8a869c");
  R(c, x + 32, y + 11, 18, 4, k[1]); HL(c, x + 32, y + 14, 18, k[0]);                                  /* output tray lip */
  R(c, x + 34, y + 9, 14, 3, "#f4f0e8");                                                                /* sheet */
  [0, 1].forEach(i => { const ty = y + 22 + i * 12; R(c, x + 4, ty, w - 8, 10, k[2]); outline(c, x + 4, ty, w - 8, 10, k[0]); HL(c, x + 5, ty + 1, w - 10, k[4]); R(c, x + w / 2 - 6, ty + 4, 12, 2, k[1]); });
  return em;
};

PK.waterCooler = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y) + 2;
  const col = o.color || "#e0dce8", k = K(col), w = 18;
  groundShadow(c, x + w / 2, y + 46, 10, 2, 0.4);
  /* jug */
  rr(c, x + 3, y, 12, 17, "#7ab8e8", 3); gradient(c, x + 4, y + 2, 10, 14, [[0, "#d8f0ff"], [0.4, "#8ac8f0"], [1, "#4a88c8"]], 1, true);
  R(c, x + 6, y - 2, 6, 3, "#6aa8d8"); HL(c, x + 6, y - 2, 6, "#d8f0ff"); VL(c, x + 5, y + 3, 9, "#ffffff"); R(c, x + 4, y + 11, 10, 1, "#4a88c8");
  /* body */
  R(c, x, y + 17, w, 29, col); gradient(c, x, y + 17, w, 29, [[0, k[3]], [0.3, k[2]], [1, k[1]]], 1, false);
  HL(c, x, y + 17, w, k[4]); VL(c, x, y + 17, 29, k[3]); VL(c, x + w - 1, y + 17, 29, k[0]);
  R(c, x + 3, y + 20, 12, 12, k[1]); outline(c, x + 3, y + 20, 12, 12, k[0]);
  R(c, x + 4, y + 22, 3, 3, "#3a8ad8"); R(c, x + 10, y + 22, 3, 3, "#d83a3a"); P(c, x + 4, y + 22, "#9fd0ff"); P(c, x + 10, y + 22, "#ff9a9a");
  R(c, x + 4, y + 28, 10, 2, "#c8c4d8"); R(c, x + 4, y + 34, 10, 6, "#1c1826"); HL(c, x + 4, y + 39, 10, "#8a869c");
  R(c, x + 2, y + 44, 14, 2, k[0]);
};

PK.vendingMachine = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y); const em = [], r = rng(o, x, y, 50);
  const w = o.w || 40, h = o.h || 66, col = o.color || "#b02a3a", k = K(col);
  groundShadow(c, x + w / 2, y + h, w / 2 + 1, 2, 0.45);
  R(c, x, y, w, h, col); gradient(c, x, y, w, h, [[0, k[3]], [0.1, k[2]], [1, k[1]]], 1, true); VL(c, x, y, h, k[3]); VL(c, x + w - 1, y, h, k[0]); HL(c, x, y, w, k[4]);
  R(c, x + 2, y + 2, w - 4, 9, "#f4f0e4"); txtC(c, o.sign || "SNACKS", x + w / 2, y + 4, "#1d1622", 1); em.push([x + 2, y + 2, w - 4, 9]);
  const gx = x + 3, gy = y + 13, gw = w - 15, gh = h - 28;
  R(c, gx - 1, gy - 1, gw + 2, gh + 2, "#1a1018");
  gradient(c, gx, gy, gw, gh, ["#fff6d8", "#ffe4a0"], 1, true);
  const rows = 4, rh = gh / rows;
  for (let ro = 0; ro < rows; ro++) {
    const sy = gy + round((ro + 1) * rh) - 2;
    let px = gx + 1;
    while (px < gx + gw - 4) {
      const cc = pk(r, ["#d83a3a", "#3a8ad8", "#e8a020", "#4ab85a", "#d84aa0", "#8a4ad8", "#e8e4d0"]), bw = ri(r, 4, 6), bh = ri(r, 6, round(rh) - 4);
      if (px + bw > gx + gw - 1) break;
      R(c, px, sy - bh, bw, bh, cc); HL(c, px, sy - bh, bw, mix(cc, "#ffffff", 0.45)); VL(c, px + bw - 1, sy - bh, bh, mix(cc, "#0c0618", 0.4)); R(c, px + 1, sy - floor(bh / 2), bw - 2, 2, "#f4f0e4");
      px += bw + 1;
    }
    R(c, gx, sy, gw, 2, "#8a869c"); HL(c, gx, sy, gw, "#d8d4e4");
    for (let sp = gx + 2; sp < gx + gw - 3; sp += 6) P(c, sp, sy + 3 - 1, "#c0302c");
  }
  em.push([gx, gy, gw, gh]);
  dshade(c, gx, gy, gw, gh, "#ffffff", (px, py) => { const q = ((px - gx) + (py - gy) + 400) % 30; return q < 4 ? 1 : 0; }, 0.2);
  /* panel */
  R(c, x + w - 11, y + 13, 8, gh, "#2a2832"); outline(c, x + w - 11, y + 13, 8, gh, "#5a5668");
  for (let i = 0; i < 6; i++) R(c, x + w - 9, y + 15 + i * 4, 4, 2, i === 5 ? "#c0302c" : "#c8c4d8");
  R(c, x + w - 9, y + 41, 4, 5, "#0e2a1e"); R(c, x + w - 9, y + 41, 4, 2, "#3fe0a0"); em.push([x + w - 9, y + 41, 4, 5]);
  R(c, x + 4, y + h - 13, w - 8, 9, "#14101c"); outline(c, x + 4, y + h - 13, w - 8, 9, k[0]); HL(c, x + 5, y + h - 12, w - 10, "#5a5668");
  R(c, x + 2, y + h - 2, 6, 2, "#1a1018"); R(c, x + w - 8, y + h - 2, 6, 2, "#1a1018");
  return em;
};

PK.microwave = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y); const em = [];
  const col = o.color || "#cfcbd8", k = K(col), w = 26, h = 15;
  R(c, x, y, w, h, col); gradient(c, x, y, w, h, [[0, k[4]], [0.3, k[2]], [1, k[1]]], 1, true); HL(c, x, y, w, "#ffffff"); VL(c, x, y, h, k[3]); VL(c, x + w - 1, y, h, k[0]); HL(c, x, y + h - 1, w, k[0]);
  R(c, x + 2, y + 2, 15, h - 5, "#1a1c24"); HL(c, x + 2, y + 2, 15, "#4a4c58"); VL(c, x + 2, y + 2, h - 5, "#4a4c58");
  const lit = !!o.on; if (lit) { R(c, x + 3, y + 3, 13, h - 7, "#ffe2a0"); R(c, x + 6, y + 6, 6, 4, "#e8a050"); em.push([x + 3, y + 3, 13, h - 7]); }
  else dshade(c, x + 3, y + 3, 13, h - 7, "#ffffff", (px, py) => ((px + py) % 9 < 2 ? 1 : 0), 0.15);
  R(c, x + 19, y + 2, 5, 3, "#0e2a1e"); R(c, x + 20, y + 3, 3, 1, "#3fe0a0"); em.push([x + 19, y + 2, 5, 3]);
  for (let i = 0; i < 3; i++) R(c, x + 19 + (i % 2) * 3, y + 6 + floor(i / 2) * 3 + (i === 2 ? 0 : 0), 2, 2, "#8a869c");
  R(c, x + 4, y + h, 3, 1, "#2a2434"); R(c, x + w - 7, y + h, 3, 1, "#2a2434");
  return em;
};

/* =====================================================================================
   DJ GEAR, NIGHTCLUB & STAGE
   ===================================================================================== */

const NEON_CYCLE = ["#ff3fa4", "#39d0ff", "#a05cff", "#ffd23f", "#5cff9a", "#ff8a4c"];

/* ---- knobs / faders (tiny) ----------------------------------------------------------------- */
function knob(c, cx, cy, r, col) {
  const k = K(col || "#8a86a0");
  ell(c, cx, cy, r, r, k[0]); ell(c, cx, cy, max(0, r - 1), max(0, r - 1), k[2]); P(c, cx - 1, cy - 1, k[4]); if (r >= 2) P(c, cx, cy - r + 1, "#e8e4f0");
}
function fader(c, x, y, h, pos) {
  R(c, x + 1, y, 1, h, "#0a0810"); R(c, x, y + round((h - 4) * pos), 3, 4, "#cfcbe0"); HL(c, x, y + round((h - 4) * pos), 3, "#ffffff"); HL(c, x, y + round((h - 4) * pos) + 3, 3, "#6a667c"); P(c, x + 1, y + round((h - 4) * pos) + 1, "#c0302c");
}

/* ---- turntable ------------------------------------------------------------------------------- */
PK.turntable = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y); const em = [];
  const model = o.model || "technics", budget = model === "budget";
  const W = budget ? 62 : 70, H = budget ? 28 : 31, topH = H - 6;
  const body = budget ? "#2e2c38" : "#3a3848", topc = budget ? "#4a4858" : "#8c8a9c", kb = K(body), kt = K(topc);
  groundShadow(c, x + W / 2, y + H, W / 2, 2, 0.45);
  /* body */
  R(c, x, y + topH, W, 6, body); HL(c, x, y + topH, W, kb[3]); HL(c, x, y + H - 1, W, kb[0]); VL(c, x, y + topH, 6, kb[3]); VL(c, x + W - 1, y + topH, 6, kb[0]);
  R(c, x + 3, y + H, 5, 2, "#14121a"); R(c, x + W - 8, y + H, 5, 2, "#14121a");
  R(c, x, y, W, topH, topc); gradient(c, x, y, W, topH, [[0, kt[4]], [0.3, kt[3]], [1, kt[2]]], 1, true);
  HL(c, x, y, W, kt[4]); VL(c, x, y, topH, kt[3]); VL(c, x + W - 1, y, topH, kt[1]); HL(c, x, y + topH - 1, W, kt[1]);
  for (let px = x + 2; px < x + W - 2; px += 3) P(c, px, y + 1, kt[1]);                       /* brushed dither */
  /* platter */
  const pcx = x + (budget ? 24 : 26), pcy = y + round(topH * 0.5) + 1, prx = budget ? 20 : 23, pry = round(topH * 0.46);
  const plat = o.platterColor || (budget ? "#3a3848" : "#b4b0c4"), kp = K(plat);
  ell(c, pcx, pcy + 2, prx, pry, kt[0]);
  ell(c, pcx, pcy, prx, pry, plat); ell(c, pcx - 1, pcy - 1, prx - 2, pry - 1, kp[3]);
  if (!budget) for (let a = 0; a < 40; a++) { const ang = a / 40 * 2 * PI; if (sin(ang) > -0.1) P(c, pcx + round(cos(ang) * (prx - 1)), pcy + round(sin(ang) * (pry - 1)), a % 2 ? kp[0] : kp[4]); }
  ell(c, pcx, pcy, prx - 3, pry - 2, "#1a1822"); ell(c, pcx, pcy, prx - 4, pry - 2, o.mat || "#14121a");
  if (o.record !== false) {
    ell(c, pcx, pcy, prx - 4, pry - 2, "#0e0c14");
    for (let a = -prx + 8; a < prx - 4; a += 3) { const hh = round(pry * 0.6 * sqrt(max(0, 1 - (a * a) / ((prx - 4) * (prx - 4))))); P(c, pcx + a, pcy - hh, "#2a2838"); }
    dshade(c, pcx - prx, pcy - pry, prx * 2, pry * 2, "#ffffff", (px, py) => { const dx = (px - pcx) / (prx - 4), dy = (py - pcy) / (pry - 2); if (dx * dx + dy * dy > 1) return 0; const q = ((px - pcx) * 0.9 - (py - pcy) * 2.2 + 400) % 26; return q < 3 ? 1 : 0; }, 0.22);
    ell(c, pcx, pcy, 6, 2, o.label || "#e0368f"); ell(c, pcx - 1, pcy - 1, 3, 1, mix(o.label || "#e0368f", "#ffffff", 0.4)); P(c, pcx, pcy, "#e8e4f0");
  }
  /* strobe dot + target light */
  if (!budget) { P(c, x + 2, y + topH - 3, "#ff3a3a"); em.push([x + 2, y + topH - 3, 1, 1]); }
  /* tonearm */
  const ax = x + W - 9, ay = y + 6;
  ell(c, ax, ay, 4, 3, kt[1]); ell(c, ax, ay - 1, 3, 2, kt[3]); P(c, ax - 1, ay - 2, kt[4]);
  R(c, ax - 1, ay - 2, 3, 3, "#c8c4d8");
  line(c, ax, ay, ax - 15, ay + 11, "#e8e4f4"); line(c, ax, ay + 1, ax - 15, ay + 12, "#3a364a");
  R(c, ax - 18, ay + 10, 4, 3, "#2a2838"); P(c, ax - 18, ay + 10, "#c8c4d8");
  ell(c, ax + 3, ay - 3, 2, 2, "#2a2838"); P(c, ax + 2, ay - 4, "#8a869c");
  /* pitch slider + buttons */
  R(c, x + W - 5, y + 11, 3, 14, "#0a0810"); fader(c, x + W - 5, y + 11, 14, 0.45);
  if (!budget) for (let i = 0; i < 6; i++) P(c, x + W - 7, y + 12 + i * 2, kt[1]);
  R(c, x + 3, y + topH - 8, 6, 4, "#2a2838"); HL(c, x + 3, y + topH - 8, 6, "#6a667c"); R(c, x + 11, y + topH - 8, 6, 4, "#2a2838"); HL(c, x + 11, y + topH - 8, 6, "#6a667c");
  R(c, x + 3, y + 3, 4, 3, "#2a2838"); R(c, x + 9, y + 3, 4, 3, "#2a2838"); P(c, x + 4, y + 4, "#ff9a3f");
  return em;
};

/* ---- CDJ ---------------------------------------------------------------------------------------- */
PK.cdj = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y); const em = [];
  const tier = o.tier || 2, W = [46, 52, 58][tier - 1] || 52, H = [28, 30, 32][tier - 1] || 30, topH = H - 5;
  const body = tier === 1 ? "#34303c" : "#2b2834", kb = K(body), on = o.screenOn !== false, topc = tier === 3 ? "#34303f" : "#383442";
  groundShadow(c, x + W / 2, y + H, W / 2, 2, 0.45);
  R(c, x, y + topH, W, 5, "#1c1a24"); HL(c, x, y + topH, W, "#4a4658"); HL(c, x, y + H - 1, W, "#0a0810");
  R(c, x + 8, y + topH + 1, W - 16, 2, "#08060c");                                              /* disc slot */
  R(c, x, y, W, topH, topc); HL(c, x, y, W, "#5a566c"); HL(c, x, y + 1, W, "#4a4658"); VL(c, x, y, topH, "#4a4658"); VL(c, x + W - 1, y, topH, "#14121a"); HL(c, x, y + topH - 1, W, "#14121a");
  /* screen */
  if (tier === 1) { R(c, x + 4, y + 3, 14, 5, "#101410"); if (on) { txt(c, "00:00", x + 5, y + 3, "#ff9a3f", 1, 0); em.push([x + 4, y + 3, 14, 5]); } }
  else {
    const sw = tier === 3 ? 26 : 18, sh_ = tier === 3 ? 11 : 7, sx = x + 4, sy = y + 3;
    R(c, sx - 1, sy - 1, sw + 2, sh_ + 2, "#0a0810");
    if (on) {
      R(c, sx, sy, sw, sh_, "#0e2a3a");
      if (tier === 3) { for (let i = 0; i < sw; i++) { const hh = 1 + (Math.imul(i * 31 + 7, 2654435761) >>> 28) % 5; R(c, sx + i, sy + 6 - hh, 1, hh * 2, i < sw * 0.45 ? "#ff8a3a" : "#39a8ff"); } R(c, sx + round(sw * 0.45), sy, 1, sh_, "#ffffff"); HL(c, sx, sy, sw, "#3a5a78"); }
      else { R(c, sx + 1, sy + 1, 10, 1, "#39d0ff"); R(c, sx + 1, sy + 3, 14, 1, "#39a8ff"); R(c, sx + 1, sy + 5, 6, 1, "#ff9a3f"); }
      em.push([sx, sy, sw, sh_]);
    } else R(c, sx, sy, sw, sh_, "#0e1a22");
  }
  /* jog wheel */
  const jr = tier === 1 ? 9 : tier === 2 ? 11 : 13, jcx = x + W - jr - 6, jcy = y + round(topH * 0.58), jry = round(jr * 0.62);
  ell(c, jcx, jcy + 2, jr + 1, jry, "#0a0810"); ell(c, jcx, jcy, jr, jry, "#5a566c"); ell(c, jcx, jcy, jr - 1, jry - 1, "#8a86a0");
  ell(c, jcx, jcy, jr - 3, max(1, jry - 2), "#1a1822"); ell(c, jcx - 1, jcy - 1, jr - 4, max(1, jry - 3), "#26232e");
  if (tier >= 2) { for (let a = 0; a < 24; a++) { const ang = a / 24 * 2 * PI; P(c, jcx + round(cos(ang) * (jr - 2)), jcy + round(sin(ang) * (jry - 1)), tier === 3 ? "#39d0ff" : "#8a86a0"); if (tier === 3) em.push([jcx + round(cos(ang) * (jr - 2)), jcy + round(sin(ang) * (jry - 1)), 1, 1]); } }
  if (tier === 3) { ell(c, jcx, jcy, 4, 2, on ? "#0e2a3a" : "#14121a"); if (on) { P(c, jcx - 1, jcy, "#39d0ff"); P(c, jcx + 1, jcy, "#ff3fa4"); em.push([jcx - 3, jcy - 1, 7, 3]); } }
  ell(c, jcx - 2, jcy - jry + 1, 2, 0, "#c8c4d8");
  /* transport buttons + tempo slider */
  R(c, x + 4, y + topH - 9, 6, 5, "#c8a010"); HL(c, x + 4, y + topH - 9, 6, "#ffe070"); R(c, x + 12, y + topH - 9, 6, 5, "#3fa860"); HL(c, x + 12, y + topH - 9, 6, "#8affb0");
  if (on) { em.push([x + 4, y + topH - 9, 6, 1], [x + 12, y + topH - 9, 6, 1]); }
  R(c, x + 4, y + topH - 15, 4, 4, "#4a4658"); R(c, x + 10, y + topH - 15, 4, 4, "#4a4658");
  R(c, x + W - 4, y + 4, 2, topH - 8, "#0a0810");
  return em;
};

/* ---- mixer -------------------------------------------------------------------------------------- */
PK.mixer = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y); const em = [];
  const ch = o.channels || 2, rotary = !!o.rotary, W = ch * 13 + 14, H = 30, topH = H - 4;
  groundShadow(c, x + W / 2, y + H, W / 2, 2, 0.45);
  R(c, x, y + topH, W, 4, "#14121a"); HL(c, x, y + topH, W, "#3a364a");
  R(c, x, y, W, topH, "#232030"); gradient(c, x, y, W, topH, [[0, "#34304a"], [0.15, "#2a2640"], [1, "#1e1b2a"]], 1, true);
  HL(c, x, y, W, "#4a4668"); VL(c, x, y, topH, "#3a3650"); VL(c, x + W - 1, y, topH, "#100e18"); HL(c, x, y + topH - 1, W, "#100e18");
  const mid = x + floor(W / 2);
  for (let i = 0; i < ch; i++) {
    const cx = ch === 2 ? (i === 0 ? x + 8 : x + W - 12) : x + 7 + i * 13;
    ell(c, cx + 1, y + 4, 2, 2, "#c0302c"); P(c, cx, y + 3, "#ff8a7a");                           /* trim */
    for (let k2 = 0; k2 < 3; k2++) knob(c, cx + 1, y + 9 + k2 * 4, 1, k2 === 0 ? "#d8d4e8" : k2 === 1 ? "#8a86a0" : "#6a8ad8");
    if (rotary) { knob(c, cx + 1, y + 24, 3, "#c8c4d8"); P(c, cx + 1, y + 21, "#c0302c"); }
    else { fader(c, cx, y + 20, 11, 0.3 + (i * 0.37) % 0.5); }
    /* VU LEDs */
    const vx = cx + 5;
    for (let l = 0; l < 6; l++) { const lc = l < 3 ? "#3fd07a" : l < 5 ? "#ffb03a" : "#ff4a4a"; if (l >= 2 + (i % 3)) { R(c, vx, y + 20 - l * 2, 2, 1, mix(lc, "#14121a", 0.7)); } else { R(c, vx, y + 20 - l * 2, 2, 1, lc); em.push([vx, y + 20 - l * 2, 2, 1]); } }
  }
  /* master + crossfader */
  knob(c, mid, y + 5, 2, "#e8e4f4"); ell(c, mid, y + 9, 1, 1, "#ff3a3a");
  R(c, mid - 8, y + topH - 6, 17, 3, "#0a0810"); R(c, mid - 2 + (o.xf || 0), y + topH - 7, 4, 5, "#cfcbe0"); HL(c, mid - 2 + (o.xf || 0), y + topH - 7, 4, "#ffffff"); VL(c, mid + (o.xf || 0), y + topH - 6, 3, "#6a667c");
  return em;
};

/* ---- DJ booth ------------------------------------------------------------------------------------- */
PK.djBooth = function (c, x, y, w, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 230); const em = [];
  const gear = o.gear || "cdj", mixer = o.mixer || "2ch", lights = o.lights !== false, r = rng(o, x, y, 52);
  const gearH = 32, slab = 6, frontH = o.frontH || 36, H = gearH + slab + frontH;
  const dw = gear === "turntable" ? 70 : 58, mw = mixer === "4ch" ? 66 : mixer === "rotary" ? 40 : 40;
  const total = dw * 2 + mw + 10, ox = x + floor((w - total) / 2);
  /* table body first so gear sits on top */
  const ty = y + gearH;
  R(c, x, ty, w, slab, "#2a2636"); gradient(c, x, ty, w, slab, [[0, "#6a667c"], [0.3, "#3a364a"], [1, "#1a1822"]], 1, true); HL(c, x, ty, w, "#8a86a0");
  const fy = ty + slab;
  R(c, x + 2, fy, w - 4, frontH, "#14111c");
  /* stretched scrim cloth with vertical folds */
  for (let px = x + 2; px < x + w - 2; px++) { const f = sin(px * 0.9) * 0.5 + 0.5; R(c, px, fy, 1, frontH, f > 0.6 ? "#1e1a28" : f > 0.3 ? "#181422" : "#100c18"); }
  dshade(c, x + 2, fy, w - 4, 8, "#000000", (px, py) => 1 - (py - fy) / 8, 0.45);
  R(c, x, fy, 3, frontH, "#2a2636"); VL(c, x, fy, frontH, "#5a566c"); R(c, x + w - 3, fy, 3, frontH, "#2a2636"); VL(c, x + w - 3, fy, frontH, "#5a566c");
  R(c, x, fy + frontH - 3, w, 3, "#2a2636"); HL(c, x, fy + frontH - 3, w, "#5a566c");
  if (o.logo !== false) { const lg = o.logo || "RE:PARTEE"; const sc = 2, tw = txtW(lg, sc, 1); txt(c, lg, round(x + w / 2 - tw / 2) + 1, fy + 14 + 1, "#0c0818", sc, 1); txt(c, lg, round(x + w / 2 - tw / 2), fy + 14, "#c8c4d8", sc, 1); }
  if (lights) {
    const n = floor((w - 12) / 6);
    for (let i = 0; i < n; i++) { const col = NEON_CYCLE[(i >> 1) % 2 ? 1 : 0]; R(c, x + 6 + i * 6, fy + 5, 4, 2, col); em.push([x + 6 + i * 6, fy + 5, 4, 2]); }
    dshade(c, x + 4, fy + 7, w - 8, 6, "#ff3fa4", (px, py) => 1 - (py - fy - 7) / 6, 0.28); em.push([x + 4, fy + 7, w - 8, 6]);
  }
  /* gear */
  const dy = y + gearH - (gear === "turntable" ? 31 : 32), lx = ox, rx = ox + dw + mw + 10;
  const deck = (dx) => gear === "turntable" ? PK.turntable(c, dx, y + 1, { model: o.model || "technics", seed: dx }) : PK.cdj(c, dx + 3, y, { tier: o.tier || 3, seed: dx });
  em.push.apply(em, deck(lx)); em.push.apply(em, deck(rx));
  em.push.apply(em, PK.mixer(c, ox + dw + 5, y + 2, { channels: mixer === "4ch" ? 4 : 2, rotary: mixer === "rotary", seed: 1 }));
  /* laptop + headphones on spare table space */
  if (ox - x > 50) { em.push.apply(em, PK.laptop(c, x + 6, y + gearH - 22, { on: true, seed: 2 })); }
  if (x + w - (rx + dw) > 20) { R(c, x + w - 18, y + gearH - 6, 10, 6, "#1c1826"); HL(c, x + w - 18, y + gearH - 6, 10, "#5a566c"); R(c, x + w - 16, y + gearH - 10, 6, 5, "#1c1826"); }
  return em;
};

/* ---- PA / monitors --------------------------------------------------------------------------------- */
function cone(c, cx, cy, rx, ry, col) {
  const k = K(col);
  ell(c, cx, cy, rx + 1, ry + 1, "#0a0810"); ell(c, cx, cy, rx, ry, k[1]); ell(c, cx, cy, rx - 1, ry - 1, k[2]);
  ell(c, cx - 1, cy - 1, max(1, rx - 3), max(1, ry - 3), k[3]);
  ell(c, cx, cy, max(1, floor(rx / 3)), max(1, floor(ry / 3)), k[0]); P(c, cx - 1, cy - 1, k[4]);
  P(c, cx - rx + 1, cy - 2, k[4]);
}
PK.speakerStack = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 44); h = round(h || 92);
  const body = o.color || "#1e1c26", kb = K(body), r = rng(o, x, y, 53);
  groundShadow(c, x + w / 2, y + h, w / 2 + 2, 2, 0.5);
  const subH = round(h * 0.44), poleH = 6, topH = h - subH - poleH;
  const cab = (cx, cy, cw, ch, kind) => {
    R(c, cx, cy, cw, ch, body); gradient(c, cx, cy, cw, ch, [[0, kb[3]], [0.1, kb[2]], [1, kb[1]]], 1, true);
    HL(c, cx, cy, cw, "#4a4660"); VL(c, cx, cy, ch, "#3a3650"); VL(c, cx + cw - 1, cy, ch, "#0a0810"); HL(c, cx, cy + ch - 1, cw, "#0a0810");
    /* metal corners */
    [[cx, cy], [cx + cw - 3, cy], [cx, cy + ch - 3], [cx + cw - 3, cy + ch - 3]].forEach(p => { R(c, p[0], p[1], 3, 3, "#8a86a0"); P(c, p[0], p[1], "#e8e4f4"); P(c, p[0] + 1, p[1] + 1, "#3a364a"); });
    const gx = cx + 4, gy = cy + 4, gw = cw - 8, gh = ch - 8;
    R(c, gx, gy, gw, gh, "#100e16");
    for (let py = gy; py < gy + gh; py++) for (let px = gx; px < gx + gw; px++) if (((px + py) & 1) === 0 && (px & 1) === 0) P(c, px, py, "#2a2838");        /* perforated grille */
    if (kind === "sub") { cone(c, cx + cw / 2, cy + ch / 2, floor(cw * 0.34), floor(ch * 0.34), "#2a2834"); ring(c, round(cx + cw / 2), round(cy + ch / 2), floor(cw * 0.34) + 2, "#4a4658"); }
    else {
      cone(c, cx + cw / 2, cy + ch * 0.66, floor(cw * 0.3), floor(ch * 0.2), "#2a2834");
      R(c, cx + 5, cy + 5, cw - 10, floor(ch * 0.26), "#08060c"); HL(c, cx + 5, cy + 5, cw - 10, "#3a364a"); R(c, cx + 7, cy + 7, cw - 14, floor(ch * 0.26) - 4, "#1a1822"); ell(c, cx + cw / 2, cy + 5 + floor(ch * 0.13), 2, 1, "#6a667c");
    }
    R(c, cx + cw - 12, cy + ch - 8, 8, 3, "#8a86a0"); HL(c, cx + cw - 12, cy + ch - 8, 8, "#c8c4d8");                  /* logo plate */
  };
  cab(x, y + h - subH, w, subH, "sub");
  R(c, x + floor(w / 2) - 2, y + topH, 4, poleH, "#8a86a0"); VL(c, x + floor(w / 2) - 2, y + topH, poleH, "#e8e4f4");
  cab(x + 3, y, w - 6, topH, "top");
};

PK.monitors = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y);
  const krk = !!o.krk, W = o.w || 26, H = o.h || 44, n = o.pair ? 2 : 1, gap = o.gap || 120;
  for (let i = 0; i < n; i++) {
    const mx = x + i * gap;
    groundShadow(c, mx + W / 2, y + H, W / 2, 1, 0.3);
    const body = krk ? "#16141c" : "#222028", kb = K(body);
    R(c, mx, y, W, H, body); gradient(c, mx, y, W, H, [[0, kb[3]], [0.2, kb[2]], [1, kb[1]]], 1, true);
    HL(c, mx, y, W, "#4a4660"); VL(c, mx, y, H, "#3a3650"); VL(c, mx + W - 1, y, H, "#0a0810"); HL(c, mx, y + H - 1, W, "#0a0810");
    ell(c, mx + W / 2, y + 10, 4, 4, "#55506a"); ell(c, mx + W / 2, y + 10, 2, 2, "#c0bccc"); P(c, mx + W / 2 - 2, y + 8, "#ffffff");
    if (krk) { ell(c, mx + W / 2, y + 29, 10, 10, "#c99a14"); ell(c, mx + W / 2, y + 29, 8, 8, "#ffd23f"); for (let a = 0; a < 16; a++) { const ang = a / 16 * 2 * PI; P(c, mx + W / 2 + round(cos(ang) * 6), y + 29 + round(sin(ang) * 6), a % 2 ? "#ffe680" : "#e0b020"); } ell(c, mx + W / 2, y + 29, 3, 3, "#3a3420"); P(c, mx + W / 2 - 4, y + 25, "#fff2a0"); P(c, mx + W / 2 - 5, y + 26, "#fff2a0"); }
    else { cone(c, mx + W / 2, y + 29, 9, 9, "#34303f"); }
    R(c, mx + W / 2 - 4, y + H - 5, 8, 2, "#08060c"); P(c, mx + 3, y + H - 4, "#3fd07a");
  }
};

PK.studioDesk = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 250); h = round(h || 90); const em = [], r = rng(o, x, y, 54);
  const topY = y + h - 46, wood = "#5a3a30", k = K(wood);
  groundShadow(c, x + w / 2, y + h, w / 2, 2, 0.4);
  /* desk body */
  R(c, x, topY, w, 5, "#7a5040"); HL(c, x, topY, w, "#b07a58"); HL(c, x, topY + 4, w, k[0]);
  R(c, x + 2, topY + 5, w - 4, 4, k[2]); HL(c, x + 2, topY + 5, w - 4, k[1]);
  R(c, x + 3, topY + 9, 5, h - (topY - y) - 9, k[1]); VL(c, x + 3, topY + 9, h - (topY - y) - 9, k[3]); R(c, x + w - 8, topY + 9, 5, h - (topY - y) - 9, k[1]); VL(c, x + w - 8, topY + 9, h - (topY - y) - 9, k[3]);
  R(c, x + 8, topY + 9, w - 16, h - (topY - y) - 9, "#18121a");
  /* rack under the desk */
  const rx = x + w - 70, rh = h - (topY - y) - 14;
  R(c, rx, topY + 12, 54, rh, "#2a2832"); outline(c, rx, topY + 12, 54, rh, "#4a4658");
  for (let i = 0; i < floor(rh / 8); i++) { const ry = topY + 14 + i * 8; R(c, rx + 3, ry, 48, 6, "#1a1822"); HL(c, rx + 3, ry, 48, "#3a364a"); for (let l = 0; l < 6; l++) { const on = (Math.imul(i * 13 + l * 7, 2654435761) >>> 29) < 4; R(c, rx + 6 + l * 3, ry + 2, 2, 2, on ? (l % 3 === 0 ? "#3fd07a" : l % 3 === 1 ? "#ffb03a" : "#39d0ff") : "#2a2838"); if (on) em.push([rx + 6 + l * 3, ry + 2, 2, 2]); } for (let kn = 0; kn < 4; kn++) P(c, rx + 28 + kn * 5, ry + 2, "#8a86a0"); }
  /* lower shelf with outboard gear + a floor sub */
  const shY = topY + 25, deskBot = y + h;
  R(c, x + 9, shY, w - 90, 3, k[2]); HL(c, x + 9, shY, w - 90, "#9a6a4a"); HL(c, x + 9, shY + 2, w - 90, k[0]);
  const boxes = [[16, 38, 11, "#3a3848"], [58, 30, 9, "#4a2a3a"], [92, 44, 12, "#2a3a48"]];
  boxes.forEach((bx, bi) => { const bxx = x + bx[0], byy = shY - bx[2]; if (bxx + bx[1] < x + w - 80) { R(c, bxx, byy, bx[1], bx[2], bx[3]); HL(c, bxx, byy, bx[1], mix(bx[3], "#ffffff", 0.3)); VL(c, bxx, byy, bx[2], mix(bx[3], "#ffffff", 0.15)); R(c, bxx + bx[1] - 8, byy + 3, 5, 2, bi % 2 ? "#3fd07a" : "#ff9a3f"); em.push([bxx + bx[1] - 8, byy + 3, 5, 2]); for (let q = 0; q < 4; q++) knob(c, bxx + 4 + q * 5, byy + 5, 1, "#8a86a0"); } });
  const subW = 30, subX = x + 14, subY = deskBot - 29;
  R(c, subX, subY, subW, 28, "#1e1c26"); gradient(c, subX, subY, subW, 28, [[0, "#3a364a"], [0.1, "#2a2736"], [1, "#16141c"]], 1, true); HL(c, subX, subY, subW, "#5a566c"); cone(c, subX + subW / 2, subY + 14, 9, 9, "#2a2834"); ring(c, subX + 15, subY + 14, 11, "#4a4658");
  /* cables */
  for (let i = 0; i < 24; i++) P(c, x + 12 + i, topY + h * 0.4 + round(sin(i / 3)), "#0a0810");
  for (let i = 0; i < 18; i++) P(c, x + 70 + i, topY + 20 + round(sin(i / 4) * 2), "#2a1c34");
  /* monitors at the back left/right */
  PK.monitors(c, x + 10, topY - 44, { krk: true, w: 26, h: 44 }); PK.monitors(c, x + w - 36, topY - 44, { krk: true, w: 26, h: 44 });
  /* keyboard (synth) */
  const kx = x + 48, ky = topY - 20, kw = 96;
  R(c, kx, ky, kw, 18, "#26222e"); HL(c, kx, ky, kw, "#4a4658"); R(c, kx, ky, kw, 7, "#32303c"); HL(c, kx, ky, kw, "#5a566c");
  for (let i = 0; i < 8; i++) knob(c, kx + 5 + i * 5, ky + 3, 1, i % 3 === 0 ? "#ff3fa4" : i % 3 === 1 ? "#39d0ff" : "#c8c4d8");
  R(c, kx + 50, ky + 1, 14, 4, "#0e2a1e"); R(c, kx + 51, ky + 2, 8, 1, "#3fe0a0"); em.push([kx + 50, ky + 1, 14, 4]);
  for (let i = 0; i < 4; i++) R(c, kx + 72 + i * 5, ky + 1, 3, 4, "#14121a");
  R(c, kx, ky + 7, kw, 11, "#f0ece4");
  for (let px = kx; px < kx + kw; px += 4) VL(c, px, ky + 7, 11, "#a8a49c");
  HL(c, kx, ky + 17, kw, "#8a867c");
  for (let px = kx + 3; px < kx + kw - 3; px += 4) { const n = ((px - kx - 3) / 4) % 7; if (n !== 2 && n !== 6) R(c, px, ky + 7, 3, 7, "#14121a"); }
  /* sampler / drum pads */
  const sx = x + 154, sy = topY - 16;
  R(c, sx, sy, 38, 16, "#2a2834"); HL(c, sx, sy, 38, "#5a566c"); VL(c, sx, sy, 16, "#4a4658"); VL(c, sx + 37, sy, 16, "#14121a");
  R(c, sx + 2, sy + 2, 12, 5, "#0e2a3a"); R(c, sx + 3, sy + 3, 8, 1, "#39d0ff"); em.push([sx + 2, sy + 2, 12, 5]);
  for (let p = 0; p < 12; p++) { const px = sx + 16 + (p % 4) * 5, py = sy + 2 + floor(p / 4) * 4, on = (Math.imul(p * 7 + 3, 2654435761) >>> 30) < 2; R(c, px, py, 4, 3, on ? ["#ff3fa4", "#39d0ff", "#ffd23f"][p % 3] : "#3a3648"); if (on) em.push([px, py, 4, 3]); }
  /* laptop in the middle back */
  em.push.apply(em, PK.laptop(c, x + 96, topY - 38, { on: true, seed: 5 }));
  return em;
};

/* ---- neon -------------------------------------------------------------------------------------------- */
/* shared neon rasteriser: lit/dead are PWxPH bit masks (with a G px margin around the art) */
function neonRender(c, x, y, PW, PH, G, lit, dead, color, tube, glowOn, strength) {
  const em = [];
  const inM = (a, xx, yy) => xx >= 0 && yy >= 0 && xx < PW && yy < PH && a[yy * PW + xx] === 1;
  /* halo via chamfer distance */
  if (glowOn) {
    const d = new Float32Array(PW * PH).fill(999);
    for (let i = 0; i < PW * PH; i++) if (lit[i]) d[i] = 0;
    for (let yy = 0; yy < PH; yy++) for (let xx = 0; xx < PW; xx++) { const i = yy * PW + xx; let v = d[i]; if (xx > 0) v = min(v, d[i - 1] + 1); if (yy > 0) { v = min(v, d[i - PW] + 1); if (xx > 0) v = min(v, d[i - PW - 1] + 1.4); if (xx < PW - 1) v = min(v, d[i - PW + 1] + 1.4); } d[i] = v; }
    for (let yy = PH - 1; yy >= 0; yy--) for (let xx = PW - 1; xx >= 0; xx--) { const i = yy * PW + xx; let v = d[i]; if (xx < PW - 1) v = min(v, d[i + 1] + 1); if (yy < PH - 1) { v = min(v, d[i + PW] + 1); if (xx < PW - 1) v = min(v, d[i + PW + 1] + 1.4); if (xx > 0) v = min(v, d[i + PW - 1] + 1.4); } d[i] = v; }
    const LV = [0, 0.16, 0.3, 0.5], pa = c.globalAlpha;
    for (let lv = 1; lv <= 3; lv++) {
      c.globalAlpha = LV[lv]; c.fillStyle = color;
      for (let yy = 0; yy < PH; yy++) {
        let rx = -1;
        for (let xx = 0; xx <= PW; xx++) {
          let on = false;
          if (xx < PW && !lit[yy * PW + xx]) {
            const dd = d[yy * PW + xx];
            if (dd < G) { const I = Math.pow(1 - dd / G, 1.8) * strength * 3.4, b = floor(I), lvl = min(3, b + ((I - b) > thr(x + xx, y + yy) ? 1 : 0)); on = lvl === lv; }
          }
          if (on) { if (rx < 0) rx = xx; }
          else if (rx >= 0) { c.fillRect(x + rx - G, y + yy - G, xx - rx, 1); em.push([x + rx - G, y + yy - G, xx - rx, 1]); rx = -1; }
        }
      }
    }
    c.globalAlpha = pa;
  }
  /* unlit tubes (burnt-out letters) */
  const dc = mix(color, "#2a2438", 0.72);
  for (let yy = 0; yy < PH; yy++) for (let xx = 0; xx < PW; xx++) if (dead[yy * PW + xx]) P(c, x + xx - G, y + yy - G, dc);
  /* dark backing offset */
  const back = mix(color, "#0c0618", 0.78);
  for (let yy = 0; yy < PH; yy++) for (let xx = 0; xx < PW; xx++) if (lit[yy * PW + xx] && !inM(lit, xx + 1, yy + 1)) AP(c, x + xx - G + 1, y + yy - G + 1, back, 0.6);
  /* tubes */
  const core = mix(color, "#ffffff", 0.78), body = color, edge = mix(color, "#14081e", 0.18);
  for (let yy = 0; yy < PH; yy++) {
    let rs = -1, runCol = null;
    for (let xx = 0; xx <= PW; xx++) {
      let col = null;
      if (xx < PW && lit[yy * PW + xx]) {
        if (tube >= 3) { const inner = inM(lit, xx - 1, yy) && inM(lit, xx + 1, yy) && inM(lit, xx, yy - 1) && inM(lit, xx, yy + 1); col = inner ? core : (!inM(lit, xx + 1, yy) || !inM(lit, xx, yy + 1)) ? edge : body; }
        else col = (!inM(lit, xx, yy - 1) || !inM(lit, xx - 1, yy)) ? core : body;
      }
      if (col !== runCol) { if (runCol) { c.fillStyle = runCol; c.fillRect(x + rs - G, y + yy - G, xx - rs, 1); em.push([x + rs - G, y + yy - G, xx - rs, 1]); } runCol = col; rs = xx; }
    }
  }
  return em;
}

PK.neon = function (c, text, x, y, color, o) {
  o = o || {}; x = round(x); y = round(y); text = String(text);
  const sc = o.scale || 2, tube = o.tube || sc, glowOn = o.glow !== false, strength = o.strength == null ? 1 : o.strength, em = [];
  const sp = o.spacing != null ? o.spacing : sc, adv = 3 * sc + sp, off = floor((sc - tube) / 2);
  const W = text.length * adv - sp + tube, H = 5 * sc + tube, G = o.glowR || (tube * 3 + 7);
  const PW = W + G * 2, PH = H + G * 2;
  const lit = new Uint8Array(PW * PH), dead = new Uint8Array(PW * PH);
  const offs = o.off || [];
  const setR = (arr, rx, ry, rw, rh) => { for (let yy = ry; yy < ry + rh; yy++) for (let xx = rx; xx < rx + rw; xx++) arr[(yy + G) * PW + xx + G] = 1; };
  const up = text.toUpperCase();
  for (let ci = 0; ci < up.length; ci++) {
    const gl = U.F3[up[ci]] || U.F3[" "], arr = offs.indexOf(ci) >= 0 ? dead : lit, bx = ci * adv;
    for (let i = 0; i < 15; i++) {
      if (gl[i] !== "1") continue;
      const gx = i % 3, gy = floor(i / 3), px = bx + gx * sc + off, py = gy * sc + off;
      setR(arr, px, py, tube, tube);
      if (gx < 2 && gl[i + 1] === "1") setR(arr, px, py, sc + tube, tube);
      if (gy < 4 && gl[i + 3] === "1") setR(arr, px, py, tube, sc + tube);
      /* bridge diagonal-only neighbours so curved letters read as one continuous tube */
      if (gy < 4 && sc > tube - 1) {
        if (gx < 2 && gl[i + 4] === "1" && gl[i + 1] !== "1" && gl[i + 3] !== "1") setR(arr, px + tube - 1, py + tube - 1, sc - tube + 2, sc - tube + 2);
        if (gx > 0 && gl[i + 2] === "1" && gl[i - 1] !== "1" && gl[i + 3] !== "1") setR(arr, px - (sc - tube) - 1, py + tube - 1, sc - tube + 2, sc - tube + 2);
      }
    }
  }
  return neonRender(c, x, y, PW, PH, G, lit, dead, color, tube, glowOn, strength);
};

PK.glow = function (c, x, y, r, color, o) {
  o = o || {}; const em = [];
  haloPts(c, round(x), round(y), r, color || "#ff3fa4", o.strength == null ? 1 : o.strength, em, o.ry == null ? r : o.ry);
  return em;
};

PK.lightCone = function (c, x, y, topW, botW, h, color, o) {
  o = o || {}; x = round(x); y = round(y); h = round(h); topW = round(topW); botW = round(botW); const em = [], al = o.alpha == null ? 0.5 : o.alpha;
  const LV = [0, 0.15, 0.28, 0.44], pa = c.globalAlpha;
  const lens = o.lens !== false;
  for (let lv = 1; lv <= 3; lv++) {
    c.globalAlpha = LV[lv] * (al / 0.5); c.fillStyle = color;
    for (let t = 0; t < h; t++) {
      const half = lerp(topW, botW, t / h) / 2, fade = Math.pow(1 - t / h, 0.75);
      let rs = -1;
      const x0 = floor(x - half), x1 = ceil(x + half);
      for (let xx = x0; xx <= x1 + 1; xx++) {
        let on = false;
        if (xx <= x1) {
          const dx = abs(xx + 0.5 - x) / max(0.5, half);
          if (dx <= 1) { const I = fade * Math.pow(1 - dx, 0.55) * 3.4 * (1 + (o.core || 0)), b = floor(I), lvl = min(3, b + ((I - b) > thr(xx, y + t) ? 1 : 0)); on = lvl === lv; }
        }
        if (on) { if (rs < 0) rs = xx; } else if (rs >= 0) { c.fillRect(rs, y + t, xx - rs, 1); em.push([rs, y + t, xx - rs, 1]); rs = -1; }
      }
    }
  }
  c.globalAlpha = pa;
  if (lens) { R(c, x - floor(topW / 2) - 1, y - 1, max(3, topW + 2), 2, mix(color, "#ffffff", 0.8)); em.push([x - floor(topW / 2) - 1, y - 1, max(3, topW + 2), 2]); }
  return em;
};

PK.discoBall = function (c, x, y, r, o) {
  o = o || {}; x = round(x); y = round(y); r = round(r || 14); const em = [], rg = rng(o, x, y, 55);
  const st = o.string == null ? 14 : o.string;
  if (st > 0) { VL(c, x, y - r - st, st, "#8a869c"); R(c, x - 1, y - r - st, 3, 2, "#c8c4d8"); }
  R(c, x - 2, y - r - 2, 5, 3, "#8a869c"); HL(c, x - 2, y - r - 2, 5, "#e8e4f4");
  const L = [-0.45, -0.55, 0.7], ln = sqrt(L[0] * L[0] + L[1] * L[1] + L[2] * L[2]), cs = 3;
  const sparkle = o.colors || ["#ffffff", "#ffffff", "#39d0ff", "#ff3fa4", "#ffd23f", "#a05cff"];
  for (let gy = -r; gy < r; gy += cs) for (let gx = -r; gx < r; gx += cs) {
    const dcx = gx + 1, dcy = gy + 1, d2 = dcx * dcx + dcy * dcy;
    if (d2 > r * r) continue;
    const nz = sqrt(max(0, r * r - d2)) / r, nx = dcx / r, ny = dcy / r, lam = clamp((nx * L[0] + ny * L[1] + nz * L[2]) / ln, 0, 1);
    let col;
    const v = rg();
    if (v < 0.2) { col = pk(rg, sparkle); em.push([x + gx, y + gy, cs - 1, cs - 1]); }
    else col = mix("#2a2640", "#d8d4ee", lam * 0.9 + (v - 0.5) * 0.25);
    R(c, x + gx, y + gy, cs - 1, cs - 1, col);
    P(c, x + gx, y + gy, mix(col, "#ffffff", 0.45));
  }
  P(c, x - round(r * 0.35), y - round(r * 0.4), "#ffffff"); P(c, x - round(r * 0.35) + 1, y - round(r * 0.4), "#ffffff");
  em.push([x - round(r * 0.35), y - round(r * 0.4), 2, 1]);
  /* glints */
  for (let i = 0; i < 4; i++) { const ang = rg() * 2 * PI, d = r + ri(rg, 3, 8), gx = x + round(cos(ang) * d), gy = y + round(sin(ang) * d); P(c, gx, gy, "#ffffff"); P(c, gx - 1, gy, "#c0b8ff"); P(c, gx + 1, gy, "#c0b8ff"); P(c, gx, gy - 1, "#c0b8ff"); P(c, gx, gy + 1, "#c0b8ff"); em.push([gx - 1, gy - 1, 3, 3]); }
  return em;
};

PK.truss = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 200); h = round(h || 12); const em = [];
  const col = o.color || "#9a98ac", k = K(col), hh = h - 4;
  cylH(c, x, y, w, 3, col); cylH(c, x, y + h - 3, w, 3, col);
  for (let px = x; px < x + w; px += hh + 2) { line(c, px, y + 3, px + (hh + 2) / 2, y + h - 3, k[2]); line(c, px + (hh + 2) / 2, y + h - 3, px + hh + 2, y + 3, k[1]); }
  R(c, x, y, 3, h, col); VL(c, x, y, h, k[4]); R(c, x + w - 3, y, 3, h, col); VL(c, x + w - 1, y, h, k[0]);
  for (let px = x + 20; px < x + w - 10; px += 40) { R(c, px, y - 1, 5, 2, "#2a2838"); R(c, px, y + h - 1, 5, 2, "#2a2838"); }
  const lampList = [];
  const nl = o.lights == null || o.lights === false ? 0 : (o.lights === true ? floor(w / 36) : typeof o.lights === "number" ? o.lights : o.lights.length);
  for (let i = 0; i < nl; i++) {
    const lc = Array.isArray(o.lights) ? o.lights[i] : NEON_CYCLE[i % NEON_CYCLE.length], lx = x + round((i + 0.5) * w / nl) - 4;
    R(c, lx + 3, y + h, 2, 3, "#2a2838"); R(c, lx, y + h + 3, 9, 8, "#1c1a24"); HL(c, lx, y + h + 3, 9, "#4a4658"); VL(c, lx, y + h + 3, 8, "#3a364a"); VL(c, lx + 8, y + h + 3, 8, "#0a0810");
    R(c, lx + 1, y + h + 9, 7, 2, lc); HL(c, lx + 1, y + h + 9, 7, mix(lc, "#ffffff", 0.7)); em.push([lx + 1, y + h + 9, 7, 2]);
    haloPts(c, lx + 4, y + h + 10, 9, lc, 0.9, em, 7);
    lampList.push({ x: lx + 4, y: y + h + 10, color: lc });
  }
  em.lights = lampList;                                    /* fixture positions: feed them to lightCone() */
  return em;
};

PK.stage = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 420); h = round(h || 64);
  const r = rng(o, x, y, 56), deckH = round(h * 0.4), frontH = h - deckH, deck = o.deck || "#2c2638", kd = K(deck);
  /* deck top (perspective boards) */
  R(c, x, y, w, deckH, deck); gradient(c, x, y, w, deckH, [[0, kd[1]], [1, kd[3]]], 1, true);
  for (let py = y + 4; py < y + deckH; py += 5 + round((py - y) / 8)) { HL(c, x, py, w, kd[0]); }
  let seamX = x; while (seamX < x + w) { seamX += ri(r, 50, 120); if (seamX < x + w) VL(c, seamX, y, deckH, kd[0]); }
  for (let i = 0; i < 40; i++) R(c, x + floor(r() * w), y + floor(r() * deckH), ri(r, 2, 8), 1, r() < 0.5 ? kd[3] : kd[0]);
  /* gaffer tape marks */
  for (let i = 0; i < 6; i++) { const tx = x + ri(r, 10, w - 20), ty2 = y + ri(r, 3, deckH - 4); R(c, tx, ty2, ri(r, 4, 8), 1, pk(r, ["#e8d020", "#ff3fa4", "#39d0ff", "#e8e4f0"])); R(c, tx + 2, ty2 - 1, 1, 3, "#e8e4f0"); }
  /* lip */
  R(c, x, y + deckH, w, 3, "#4a4660"); HL(c, x, y + deckH, w, "#8a86a8"); HL(c, x, y + deckH + 2, w, "#1a1822");
  /* front skirt with pleats */
  const fy = y + deckH + 3, fh = frontH - 3;
  for (let px = x; px < x + w; px++) { const f = floor(px / 3) % 2; R(c, px, fy, 1, fh, f ? "#14101c" : "#1c1828"); if (px % 6 === 0) VL(c, px, fy, fh, "#2c2840"); }
  dshade(c, x, fy, w, 8, "#000000", (px, py) => 1 - (py - fy) / 8, 0.4);
  HL(c, x, y + h - 1, w, "#0a0810");
  if (o.trim !== false) { for (let px = x + 2; px < x + w - 2; px += 4) { R(c, px, y + deckH + 1, 2, 1, "#39d0ff"); } }
  if (o.steps) { const sx = x + w - 54; for (let i = 0; i < 3; i++) { R(c, sx + i * 2, y + deckH + 3 + i * 6, 36 - i * 4, 6, i % 2 ? "#2c2840" : "#38334e"); HL(c, sx + i * 2, y + deckH + 3 + i * 6, 36 - i * 4, "#6a668c"); } }
  /* wedges + cables */
  if (o.wedges !== false) for (let i = 0; i < floor(w / 140); i++) { const wx = x + 40 + i * 130 + ri(r, 0, 30), wy = y + deckH - 8; poly(c, [[wx, wy + 8], [wx + 20, wy + 8], [wx + 20, wy + 5], [wx + 4, wy]], "#1a1822"); line(c, wx + 4, wy, wx + 20, wy + 5, "#5a566c"); ell(c, wx + 12, wy + 5, 3, 1, "#3a364a"); }
  for (let i = 0; i < 3; i++) { const cx0 = x + ri(r, 20, w - 60); for (let j = 0; j < 40; j++) P(c, cx0 + j, y + deckH - 3 + round(sin(j / 5 + i) * 2), "#0a0810"); }
};

PK.ledWall = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 200); h = round(h || 100);
  const r = rng(o, x, y, 57), pattern = o.pattern || pk(r, ["waves", "grid", "equalizer", "sunburst", "plasma", "rain", "stripes", "rings"]);
  const pal = o.palette || ["#ff3fa4", "#39d0ff", "#a05cff", "#ffd23f"], cell = 2, cw = floor(w / cell), ch = floor(h / cell);
  const nz = noise2(floor(r() * 4e9)), ph = r() * 6;
  const plasmaPal = []; { const stops = ["#14082c", pal[2], pal[0], pal[3], pal[1], pal[2], "#14082c"]; for (let i = 0; i < 16; i++) { const tt = i / 15 * (stops.length - 1), j = min(stops.length - 2, floor(tt)); plasmaPal.push(mix(stops[j], stops[j + 1], tt - j)); } }
  const col = (cx, cy) => {
    const u = cx / cw, v = cy / ch;
    switch (pattern) {
      case "grid": { const gx = cx % 10, gy = cy % 10; if (gx < 1 || gy < 1) return pal[(floor(cx / 10) + floor(cy / 10)) % pal.length]; return (floor(cx / 10) + floor(cy / 10)) % 3 === 0 ? mix(pal[1], "#06020e", 0.6) : "#0a0618"; }
      case "equalizer": { const bar = floor(cx / 4), hgt = 0.15 + 0.8 * ((Math.imul(bar * 977 + 13, 2654435761) >>> 24) / 255); if (cx % 4 === 3) return "#06020e"; if (v > 1 - hgt) { const t = (v - (1 - hgt)) / hgt; return t < 0.25 ? pal[3] : t < 0.6 ? pal[0] : pal[2]; } return "#0a0618"; }
      case "sunburst": { const dx = (u - 0.5) * 2 * (cw / ch), dy = v - 0.65, a = Math.atan2(dy, dx), d = sqrt(dx * dx + dy * dy); if (d < 0.32) return pal[3]; return (floor((a + PI) / (2 * PI) * 18) % 2) ? pal[0] : mix(pal[2], "#0a0618", 0.55); }
      case "plasma": { const dx = cx - cw * 0.5, dy = cy - ch * 0.5, v = (sin(cx * 0.13 + ph) + sin(cy * 0.2 + ph * 0.7) + sin((cx + cy) * 0.09 + ph) + sin(sqrt(dx * dx + dy * dy) * 0.16 - ph)) / 4, t = (v + 1) / 2; return plasmaPal[min(plasmaPal.length - 1, floor(t * plasmaPal.length))]; }
      case "rain": { const s = Math.imul(cx * 7919 + 17, 2654435761) >>> 24; const head = ((s / 255 * ch * 2 + ph * 9) % (ch * 1.4)); const dd = cy - head + 6; return dd > 0 && dd < 8 ? mix(pal[1], "#0a0618", dd / 8) : "#0a0618"; }
      case "stripes": { const k2 = floor((cx + cy * 0.6) / 6) % 4; return k2 === 0 ? pal[0] : k2 === 1 ? "#0a0618" : k2 === 2 ? pal[1] : mix(pal[2], "#0a0618", 0.5); }
      case "rings": { const dx = (u - 0.5) * 2 * (cw / ch), dy = v - 0.5, d = sqrt(dx * dx + dy * dy); return floor(d * 9) % 2 ? pal[floor(d * 9 / 2) % pal.length] : "#0a0618"; }
      default: { const y0 = 0.5 + sin(u * 11 + ph) * 0.14 + sin(u * 5 - ph) * 0.1; const dd = abs(v - y0); if (dd < 0.05) return pal[3]; if (dd < 0.16) return pal[floor(dd * 40) % 2 ? 0 : 2]; return v > y0 ? mix(pal[1], "#0a0618", 0.45 + (v - y0)) : "#0a0618"; }
    }
  };
  R(c, x - 2, y - 2, w + 4, h + 4, "#0e0c14"); R(c, x - 1, y - 1, w + 2, h + 2, "#2a2838");
  for (let cy = 0; cy < ch; cy++) for (let cx = 0; cx < cw; cx++) { const cc = col(cx, cy); R(c, x + cx * cell, y + cy * cell, cell, cell, cc); P(c, x + cx * cell + 1, y + cy * cell + 1, mix(cc, "#06020e", 0.45)); }
  const pw = o.panel || 32;
  for (let px = pw; px < w; px += pw) VL(c, x + px, y, h, "#06020e");
  for (let py = pw; py < h; py += pw) HL(c, x, y + py, w, "#06020e");
  dshade(c, x, y, w, h, "#ffffff", (px, py) => { const q = ((px - x) * 0.9 + (py - y) + 800) % 120; return q < 5 ? 1 : 0; }, 0.08);
  return [[x, y, w, h]];
};

PK.crowdSilhouettes = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 300); h = round(h || 70); const em = [], r = rng(o, x, y, 58);
  const cols = o.colors || ["#2e2452", "#1c1436", "#0e081c"], dens = o.density == null ? 0.88 : o.density, rim = o.rim || ["#ff3fa4", "#39d0ff"];
  const rows = o.rows || clamp(floor(h / 17), 2, 5);
  clip(c, x, y, w, h, () => {
    for (let ro = 0; ro < rows; ro++) {
      const t = rows === 1 ? 1 : ro / (rows - 1), col = t < 0.5 ? mix(cols[0], cols[1], t * 2) : mix(cols[1], cols[cols.length - 1], (t - 0.5) * 2);
      const hrBase = lerp(3, 6.6, t), base = y + lerp(h * 0.46, h * 1.04, t), rc = rim[ro % rim.length], kk = K(col);
      let px = x - ri(r, 0, 8);
      while (px < x + w + 12) {
        const hr = max(2, round(hrBase * (0.85 + r() * 0.32))), step = round(hr * 2 + r() * hr * 1.3);
        if (r() < dens) {
          const hx = px + ri(r, -2, 2), hy = round(base - hr * 2.4 - ri(r, 0, round(hr * 1.3))), sy2 = hy + hr * 2 + 1, kind = r();
          const sw = round(hr * (2.0 + r() * 0.6));
          ell(c, hx, sy2 + 1, sw, round(hr * 1.5), col);
          R(c, hx - sw, sy2 + 1, sw * 2 + 1, max(0, y + h - sy2 - 1), col);
          R(c, hx - 1, hy + hr - 1, 3, hr + 2, col);
          ell(c, hx, hy, hr, hr, col);
          if (kind < 0.16) ell(c, hx + ri(r, -1, 1), hy - 1, hr + 2, hr + 1, col);                       /* big hair */
          else if (kind < 0.30) { R(c, hx - hr, hy - hr, hr * 2 + 1, max(1, round(hr * 0.7)), col); R(c, hx + (r() < 0.5 ? 1 : -hr - 2), hy - round(hr * 0.5), hr + 2, 2, col); }       /* cap */
          else if (kind < 0.40) { R(c, hx + (r() < 0.5 ? hr : -hr - 1), hy + 1, 2, hr + 2, col); }       /* ponytail */
          else if (kind < 0.46) { ell(c, hx, hy - 1, hr + 1, hr + 1, col); R(c, hx - hr - 1, hy, hr * 2 + 3, 2, kk[1]); }       /* hood / headphones */
          /* rim light from the stage: tops of heads, a few shoulder runs */
          HL(c, hx - hr + 2, hy - hr, max(1, hr * 2 - 3), mix(rc, col, 0.4)); P(c, hx - hr + 1, hy - hr + 1, mix(rc, col, 0.5));
          if (r() < 0.3) HL(c, hx - sw + 1, sy2 - round(hr * 0.3), max(2, round(sw * 0.9)), mix(rc, col, 0.65));
          /* raised arms */
          if (r() < 0.2 + 0.2 * t) {
            const both = r() < 0.3;
            [-1, 1].forEach(side => {
              if (!both && side !== (r() < 0.5 ? -1 : 1)) return;
              const ah = ri(r, hr * 2, hr * 4), ax = hx + side * (sw - 1), lean = side * (0.12 + r() * 0.12);
              for (let i = 0; i < ah; i++) R(c, ax + round(i * lean), sy2 - 1 - i, 2, 1, col);
              const hx2 = ax + round(ah * lean), hy2 = sy2 - ah - 1;
              ell(c, hx2, hy2, 1, 1, col); P(c, hx2, hy2 - 2, mix(rc, col, 0.4)); P(c, hx2 - 1, hy2 - 1, mix(rc, col, 0.55));
              const q = r();
              if (q < 0.22) { R(c, hx2 - 1, hy2 - 5, 2, 3, "#cfe8ff"); em.push([hx2 - 1, hy2 - 5, 2, 3]); }                          /* phone */
              else if (q < 0.32) { R(c, hx2, hy2 - 5, 1, 4, pk(r, NEON_CYCLE)); em.push([hx2, hy2 - 5, 1, 4]); }                    /* glow stick */
            });
          }
        }
        px += step;
      }
      dshade(c, x, y, w, h, rc0(rim, ro), (qx, qy) => clamp(1 - (qy - y) / (h * 0.9), 0, 1) * 0.5, 0.08);     /* stage haze catching the crowd */
    }
  });
  return em;
};
function rc0(rim, ro) { return rim[ro % rim.length]; }

PK.barricade = function (c, x, y, w, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 120);
  const col = o.color || "#a8a4b8", k = K(col), H = 24, pw = o.panel || 40;
  groundShadow(c, x + w / 2, y + H + 2, w / 2, 2, 0.4);
  for (let px = x; px < x + w; px += pw) {
    const ww = min(pw, x + w - px);
    cylH(c, px, y, ww, 3, col); cylH(c, px, y + H - 3, ww, 3, col); cylH(c, px, y + 9, ww, 2, col);
    for (let bx = px + 2; bx < px + ww - 1; bx += 4) { R(c, bx, y + 3, 2, H - 6, col); VL(c, bx, y + 3, H - 6, k[4]); VL(c, bx + 1, y + 3, H - 6, k[1]); }
    R(c, px, y, 3, H, col); VL(c, px, y, H, k[4]);
    R(c, px + ww - 2, y + 2, 4, 4, k[1]); R(c, px + ww - 1, y + 3, 2, 2, "#14101c");                                     /* hook */
    R(c, px + 3, y + H, 12, 2, "#2a2838"); R(c, px + ww - 15, y + H, 12, 2, "#2a2838"); R(c, px + 4, y + H + 2, 3, 3, "#2a2838");
  }
  if (o.sign !== false) { const sx = x + floor(w / 2) - 12; R(c, sx, y + 4, 24, 7, "#f4f0e8"); outline(c, sx, y + 4, 24, 7, "#c0302c"); txtC(c, o.text || "STAGE", sx + 12, y + 5, "#c0302c", 1); }
};

/* =====================================================================================
   TRAVEL & TRANSIT
   ===================================================================================== */

PK.departuresBoard = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 200); h = round(h || 74);
  const r = rng(o, x, y, 60), rowH = 7, hdr = 10, rows = o.rows || max(1, floor((h - hdr - 14) / rowH));
  R(c, x, y, w, h, "#2a2838"); outline(c, x, y, w, h, "#5a566c"); HL(c, x + 1, y + 1, w - 2, "#4a4658");
  R(c, x + 2, y + 2, w - 4, h - 4, "#07050e");
  R(c, x + 2, y + 2, w - 4, hdr - 2, "#1a2a5a"); txt(c, o.title || "DEPARTURES", x + 5, y + 4, "#ffd23f", 1, 1);
  const cols = [0.0, 0.17, 0.52, 0.68, 0.78].map(f => x + 5 + round(f * (w - 10)));
  const chY = y + hdr + 1;
  ["TIME", "TO", "FLT", "GT", "STATUS"].forEach((t, i) => { if (cols[i] + txtW(t) < x + w - 3 && (w > 150 || i < 2)) txt(c, t, cols[i], chY, "#7a8ad8", 1, 1); });
  HL(c, x + 3, chY + 6, w - 6, "#2a3a7a");
  const dest = ["LONDON", "PARIS", "BERLIN", "TOKYO", "LAX", "MIAMI", "AMSTERDAM", "MEXICO CITY", "ROME", "CHICAGO", "ATLANTA", "IBIZA", "DUBLIN", "LISBON"];
  const air = ["AA", "DL", "UA", "BA", "AF", "LH", "B6", "KL"];
  const stat = [["ON TIME", "#5cff9a"], ["BOARDING", "#39d0ff"], ["DELAYED", "#ffb03a"], ["ON TIME", "#5cff9a"], ["GATE CHG", "#ffb03a"], ["CANCELED", "#ff4a4a"], ["FINAL CALL", "#ff8a4c"]];
  let hh = 6 + ri(r, 0, 10), mm = ri(r, 0, 5) * 10;
  for (let i = 0; i < rows; i++) {
    const ry = y + hdr + 10 + i * rowH;
    if (ry + 6 > y + h - 3) break;
    if (i % 2) R(c, x + 3, ry - 1, w - 6, rowH, "#0e0c1a");
    const t = String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0");
    txt(c, t, cols[0], ry, "#ffb030", 1, 1);
    txt(c, pk(r, dest), cols[1], ry, "#ffb030", 1, 1);
    if (w > 150) { txt(c, pk(r, air) + (100 + ri(r, 0, 899)), cols[2], ry, "#ffe8b0", 1, 1); txt(c, pk(r, "ABCDE".split("")) + ri(r, 1, 30), cols[3], ry, "#ffb030", 1, 1); const s = pk(r, stat); txt(c, s[0], cols[4], ry, s[1], 1, 1); }
    mm += ri(r, 1, 3) * 5; if (mm >= 60) { mm -= 60; hh++; }
  }
  dshade(c, x + 2, y + 2, w - 4, h - 4, "#000000", (px, py) => ((py & 1) ? 1 : 0), 0.22);
  dshade(c, x + 2, y + 2, w - 4, h - 4, "#ffffff", (px, py) => { const q = ((px - x) * 0.8 + (py - y) + 800) % 90; return q < 4 ? 1 : 0; }, 0.07);
  return [[x + 2, y + 2, w - 4, h - 4]];
};

PK.airportSeats = function (c, x, y, w, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 120);
  const n = max(1, round(w / 30)), sw = floor(w / n), col = o.color || "#35508a", k = K(col), H = 40;
  groundShadow(c, x + w / 2, y + H + 1, w / 2, 2, 0.45);
  /* legs + beam */
  [x + 6, x + w - 10].forEach(lx => { cylV(c, lx, y + 24, 4, H - 24, "#a8a8bc"); R(c, lx - 3, y + H - 2, 10, 2, "#3a364a"); });
  cylH(c, x + 2, y + 27, w - 4, 4, "#b8b8cc");
  for (let i = 0; i < n; i++) {
    const sx = x + i * sw + 2, cw = sw - 4;
    /* back cushion */
    rr(c, sx, y, cw, 18, col, 3); gradient(c, sx + 1, y + 1, cw - 2, 16, [[0, k[3]], [0.3, k[2]], [1, k[1]]], 1, true);
    HL(c, sx + 2, y, cw - 4, k[4]); VL(c, sx, y + 3, 12, k[3]); VL(c, sx + cw - 1, y + 3, 12, k[0]);
    HL(c, sx + 3, y + 9, cw - 6, k[1]);                                        /* seam */
    /* seat cushion */
    rr(c, sx, y + 19, cw, 8, col, 2); gradient(c, sx + 1, y + 19, cw - 2, 8, [[0, k[4]], [0.4, k[3]], [1, k[1]]], 1, true); HL(c, sx + 2, y + 19, cw - 4, k[4]); HL(c, sx + 1, y + 26, cw - 2, k[0]);
  }
  /* armrests between seats */
  for (let i = 0; i <= n; i++) { const ax = x + i * sw; R(c, ax - 1, y + 15, 3, 11, "#3a364a"); VL(c, ax - 1, y + 15, 11, "#6a667c"); R(c, ax - 2, y + 14, 5, 2, "#2a2838"); HL(c, ax - 2, y + 14, 5, "#6a667c"); }
};

PK.planeWindow = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y);
  const w = o.w || 28, h = o.h || 38, view = o.view || "sky", rg = rng(o, x, y, 61), rad = floor(w / 2), cx = x + rad;
  const shape = (inset, col) => { const rx = rad - inset, ty = y + inset; ell(c, cx, ty + rx, rx, rx, col); ell(c, cx, y + h - inset - rx - 1, rx, rx, col); R(c, cx - rx, ty + rx, rx * 2 + 1, h - inset * 2 - rx * 2 - 1, col); };
  /* cabin wall panel + bezel */
  const pc = o.panel || "#d8d0c0", kp = K(pc);
  shape(0, kp[1]); shape(1, pc);
  gradient(c, x + 2, y + 6, w - 4, h - 12, [[0, kp[4]], [0.5, kp[3]], [1, kp[2]]], 1, false);
  shape(4, kp[0]); shape(5, "#0e1420");
  /* view */
  const ix = x + 5, iy = y + 5, iw = w - 10, ih = h - 10;
  clip(c, ix, iy, iw, ih, () => {
    if (view === "night") { gradient(c, ix, iy, iw, ih, ["#0a0624", "#1f1146", "#4a1d66"], 1, true); PK.speckle(c, ix, iy, iw, ih, ["#ffffff", "#b9a8ff"], 0.04, floor(rg() * 99999)); for (let i = 0; i < 5; i++) P(c, ix + ri(rg, 0, iw - 1), iy + ih - ri(rg, 1, 8), pk(rg, ["#ffd27a", "#ffb04a"])); }
    else if (view === "runway") { gradient(c, ix, iy, iw, floor(ih * 0.55), ["#6aa4f0", "#b0cef8"], 1, true); R(c, ix, iy + floor(ih * 0.55), iw, ceil(ih * 0.45), "#5a566c"); for (let i = 0; i < 3; i++) R(c, ix + floor(iw / 2) - 1, iy + floor(ih * 0.62) + i * 5, 2, 3, "#e8e4f0"); }
    else {
      gradient(c, ix, iy, iw, ih, view === "clouds" ? ["#b8d0f0", "#e8f0fc", "#ffffff"] : ["#4a8ae0", "#8fb4f5", "#d8e4f8"], 1, true);
      if (view === "wing") { poly(c, [[ix, iy + ih * 0.7], [ix + iw, iy + ih * 0.45], [ix + iw, iy + ih * 0.62], [ix, iy + ih * 0.95]], "#b8b4c8"); line(c, ix, iy + ih * 0.7, ix + iw, iy + ih * 0.45, "#f4f0ff"); R(c, ix + iw - 5, iy + ih * 0.44, 3, 2, "#c0302c"); }
      else { ell(c, ix + iw * 0.3, iy + ih * 0.7, 8, 3, "#ffffff"); ell(c, ix + iw * 0.7, iy + ih * 0.82, 9, 3, "#f0f4ff"); }
    }
    dshade(c, ix, iy, iw, ih, "#ffffff", (px, py) => { const q = ((px - ix) + (py - iy) + 400) % 30; return q < 4 ? 1 : 0; }, 0.2);
    if (o.shade) { const sh_ = round(ih * o.shade); R(c, ix, iy, iw, sh_, "#e0d8c8"); for (let py = iy + 2; py < iy + sh_; py += 3) HL(c, ix, py, iw, "#c0b8a4"); HL(c, ix, iy + sh_ - 1, iw, "#8a826c"); R(c, ix + floor(iw / 2) - 2, iy + sh_, 4, 2, "#8a826c"); }
    AR(c, ix, iy, iw, 2, "#0c0618", 0.4); AR(c, ix, iy, 2, ih, "#0c0618", 0.3);
  });
  return o.shade >= 1 ? [] : [[ix, iy + (o.shade ? round(ih * o.shade) : 0), iw, ih - (o.shade ? round(ih * o.shade) : 0)]];
};

PK.suitcase = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y) + (o.handle === false ? 0 : 5);
  const w = o.w || 22, h = o.h || round(w * 1.4), col = o.color || "#c0302c", k = K(col), r = rng(o, x, y, 62);
  groundShadow(c, x + w / 2, y + h + 2, w / 2 + 1, 1, 0.4);
  if (o.handle !== false) { R(c, x + floor(w / 2) - 5, y - 4, 2, 4, "#6a667c"); R(c, x + floor(w / 2) + 4, y - 4, 2, 4, "#6a667c"); R(c, x + floor(w / 2) - 5, y - 5, 12, 2, "#2a2838"); HL(c, x + floor(w / 2) - 5, y - 5, 12, "#6a667c"); }
  rr(c, x, y, w, h - 3, col, 3);
  gradient(c, x + 1, y + 1, w - 2, h - 5, [[0, k[3]], [0.2, k[2]], [1, k[1]]], 1, false);
  VL(c, x + 1, y + 3, h - 10, k[4]); VL(c, x + w - 2, y + 3, h - 10, k[0]);
  for (let gx = x + 5; gx < x + w - 3; gx += 4) { VL(c, gx, y + 3, h - 9, k[1]); VL(c, gx + 1, y + 3, h - 9, k[3]); }
  R(c, x, y + floor(h * 0.45), w, 2, "#2a2838"); HL(c, x, y + floor(h * 0.45), w, "#6a667c");
  R(c, x + floor(w / 2) - 2, y + floor(h * 0.45) - 1, 4, 4, "#c8c4d8"); P(c, x + floor(w / 2) - 1, y + floor(h * 0.45), "#ffffff");
  [[x, y], [x + w - 3, y], [x, y + h - 6], [x + w - 3, y + h - 6]].forEach(p => R(c, p[0], p[1], 3, 3, "#2a2838"));
  if (o.tag !== false) { R(c, x + w - 4, y + floor(h * 0.45) + 3, 5, 7, "#f4f0e4"); P(c, x + w - 3, y + floor(h * 0.45) + 4, "#c0302c"); HL(c, x + w - 4, y + floor(h * 0.45) + 6, 4, "#8a869c"); }
  if (r() < 0.6) { R(c, x + 4, y + 6, 5, 5, pk(r, ["#ffd23f", "#39d0ff", "#ff3fa4"])); ell(c, x + 6, y + 8, 1, 1, "#1d1622"); }
  R(c, x + 3, y + h - 3, 3, 3, "#14121a"); R(c, x + w - 6, y + h - 3, 3, 3, "#14121a");
};

PK.luggageCarousel = function (c, x, y, w, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 220);
  const r = rng(o, x, y, 63), H = 44;
  /* bags on the belt */
  const bags = o.bags == null ? floor(w / 55) : o.bags;
  /* base wall */
  R(c, x, y + 20, w, H - 20, "#8a8c9c"); gradient(c, x, y + 20, w, H - 20, [[0, "#c8cadc"], [0.3, "#a0a2b4"], [1, "#6a6c80"]], 1, true);
  for (let px = x + 30; px < x + w; px += 60) { VL(c, px, y + 22, H - 22, "#5a5c70"); VL(c, px + 1, y + 22, H - 22, "#d8dae8"); }
  HL(c, x, y + 20, w, "#f4f4fc"); R(c, x, y + H - 3, w, 3, "#3a3c4c"); HL(c, x, y + H - 3, w, "#6a6c80");
  /* belt */
  R(c, x - 2, y + 12, w + 4, 8, "#24222c"); HL(c, x - 2, y + 12, w + 4, "#5a566c"); HL(c, x - 2, y + 19, w + 4, "#0a0810");
  for (let px = x; px < x + w; px += 5) VL(c, px, y + 13, 6, "#3a384a");
  /* bags */
  for (let i = 0; i < bags; i++) {
    const bx = x + round((i + 0.5) * w / bags) + ri(r, -8, 8), bw = ri(r, 16, 24);
    PK.suitcase(c, bx - floor(bw / 2), y + 12 - round(bw * 1.4) + 3, { w: bw, color: pk(r, ["#c0302c", "#2f62b8", "#1d1622", "#3a8a5a", "#c8a030", "#7a4a9a", "#3a3a4a"]), seed: i * 13 + 1, handle: r() < 0.5 });
  }
  /* rubber flaps */
  for (let px = x + 6; px < x + w; px += 10) { R(c, px, y + 20, 4, 5, "#14121a"); }
  /* signage */
  const sw = 44, sx = x + floor(w / 2) - sw / 2;
  R(c, sx, y + 27, sw, 11, "#101a3a"); outline(c, sx, y + 27, sw, 11, "#5a566c"); txtC(c, o.label || "CAROUSEL 3", sx + sw / 2, y + 30, "#ffd23f", 1);
  return [[sx + 1, y + 28, sw - 2, 9]];
};

PK.hotelBed = function (c, x, y, w, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 150);
  const h = o.h || 78, linen = o.linen || "#f0ecf6", kl = K(linen), runner = o.runner || "#8a2a3a", kr = K(runner), head = o.headboard || "#5a3a4a", kh = K(head), r = rng(o, x, y, 64);
  groundShadow(c, x + w / 2, y + h, w / 2, 3, 0.45);
  /* headboard */
  const hbH = round(h * 0.42);
  rr(c, x + 2, y, w - 4, hbH, head, 4); gradient(c, x + 3, y + 1, w - 6, hbH - 2, [[0, kh[3]], [0.3, kh[2]], [1, kh[1]]], 1, true);
  HL(c, x + 5, y, w - 10, kh[4]);
  for (let px = x + 12; px < x + w - 8; px += 14) { for (let py = y + 8; py < y + hbH - 4; py += 12) { P(c, px, py, kh[0]); P(c, px - 1, py - 1, kh[4]); line(c, px, py, px + 5, py + 5, kh[1]); line(c, px, py, px - 5, py + 5, kh[1]); } }
  /* pillows */
  const pw = floor((w - 24) / 2);
  [x + 8, x + 12 + pw].forEach((px, i) => {
    const py = y + hbH - 10; rr(c, px, py, pw, 16, linen, 5); gradient(c, px + 1, py + 1, pw - 2, 14, [[0, kl[4]], [0.4, kl[3]], [1, kl[1]]], 1, true); HL(c, px + 4, py, pw - 8, "#ffffff"); HL(c, px + 3, py + 15, pw - 6, kl[1]);
    VL(c, px + pw - 1, py + 3, 10, kl[1]);
  });
  /* duvet */
  const dy = y + hbH + 6, dh = h - hbH - 6 - 8;
  R(c, x, dy, w, dh, linen); gradient(c, x, dy, w, dh, [[0, kl[4]], [0.2, kl[3]], [0.6, kl[2]], [1, kl[1]]], 1, true);
  R(c, x, dy, w, 4, kl[3]); HL(c, x, dy, w, "#ffffff"); HL(c, x, dy + 3, w, kl[1]);                          /* fold-down sheet */
  VL(c, x, dy, dh, kl[3]); VL(c, x + w - 1, dy, dh, kl[0]);
  for (let i = 0; i < 6; i++) { const fx = x + ri(r, 4, w - 8), fy = dy + ri(r, 6, dh - 4); R(c, fx, fy, ri(r, 4, 14), 1, kl[1]); R(c, fx + 1, fy + 1, ri(r, 3, 9), 1, kl[4]); }
  /* runner */
  const ry = dy + round(dh * 0.62);
  R(c, x, ry, w, 10, runner); gradient(c, x, ry, w, 10, [[0, kr[3]], [1, kr[1]]], 1, true); HL(c, x, ry, w, kr[4]); HL(c, x, ry + 9, w, kr[0]);
  for (let px = x + 2; px < x + w; px += 4) P(c, px, ry + 5, kr[4]);
  /* skirt + legs */
  const sy = dy + dh;
  R(c, x + 1, sy, w - 2, 8, "#3a2a34"); gradient(c, x + 1, sy, w - 2, 8, [[0, "#4a3a44"], [1, "#1a121a"]], 1, true); HL(c, x + 1, sy, w - 2, "#6a5a64");
  for (let px = x + 4; px < x + w - 2; px += 5) VL(c, px, sy + 1, 7, "#2a1e26");
};

/* ---- subway ---------------------------------------------------------------------------------------- */
PK.subwayPlatform = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 640); h = round(h || 256);
  const r = rng(o, x, y, 65), em = [], name = o.name || "BEDFORD AV";
  const fy = y + round(h * 0.46), ty = y + round(h * 0.66);
  /* far wall */
  PK.wallTiles(c, x, y, w, fy - y, { base: o.tile || "#d6d2de", band: { y: round((fy - y) * 0.42), h: 9, a: o.stripe || "#2f7a5c", b: "#d8cfa0" }, seed: r() * 1e6 | 0 });
  /* ceiling + lights */
  R(c, x, y, w, 9, "#2a2636"); gradient(c, x, y, w, 9, [[0, "#14101c"], [1, "#3a364a"]], 1, true); HL(c, x, y + 9, w, "#6a667c");
  for (let px = x + 20; px < x + w - 36; px += 112) { R(c, px, y + 3, 40, 4, "#fff6d8"); HL(c, px, y + 3, 40, "#ffffff"); em.push([px, y + 3, 40, 4]); dshade(c, px - 10, y + 9, 60, 14, "#fff0c0", (qx, qy) => (1 - (qy - y - 9) / 14) * 0.7, 0.25); em.push([px - 10, y + 9, 60, 14]); }
  /* station name plaques + columns */
  for (let px = x + 64; px < x + w; px += 160) {
    if (px - 36 < x + 54 || px + 36 > x + w - 54) continue;
    R(c, px - 36, y + 26, 72, 18, "#101a3a"); outline(c, px - 36, y + 26, 72, 18, "#e8e4f0"); outline(c, px - 35, y + 27, 70, 16, "#2a3a7a");
    txtC(c, name, px, y + 31, "#ffffff", 1, 1); txtC(c, "BROOKLYN", px, y + 38, "#9fb0ff", 1, 1);
  }
  for (let px = x + 8; px < x + w; px += 160) {
    cylV(c, px, y + 9, 14, fy - y - 5, "#2f6a52");
    R(c, px - 2, y + 9, 18, 3, "#20483a"); HL(c, px - 2, y + 9, 18, "#4a9a7a"); R(c, px - 3, fy - 4, 20, 5, "#20483a"); HL(c, px - 3, fy - 4, 20, "#4a9a7a");
    for (let py = y + 18; py < fy - 8; py += 12) { P(c, px + 2, py, "#8ad8b0"); P(c, px + 11, py, "#143a2a"); }
    dshade(c, px, y + 9, 14, fy - y - 9, "#0c0618", (qx, qy) => 0.1, 0.1);
  }
  /* tunnel mouths at both ends */
  [x, x + w - 50].forEach((tx, i) => {
    R(c, tx, y + 12, 50, fy - y - 8, "#08060e"); rr(c, tx, y + 12, 50, fy - y - 8, "#08060e", 10);
    gradient(c, tx, y + 12, 50, fy - y - 8, [[0, "#1a1424"], [0.5, "#0a0810"], [1, "#050308"]], 1, i === 0 ? false : false);
    outline(c, tx - 1, y + 11, 52, fy - y - 7, "#4a4658");
    const sx = i === 0 ? tx + 40 : tx + 8; R(c, sx, y + 70, 2, 4, i === 0 ? "#3fd07a" : "#ff4a4a"); em.push([sx, y + 70, 2, 4]); haloPts(c, sx + 1, y + 72, 8, i === 0 ? "#3fd07a" : "#ff4a4a", 0.8, em, 8);
  });
  /* far platform lip + yellow line */
  R(c, x, fy, w, 4, "#6a667c"); HL(c, x, fy, w, "#a8a4bc"); R(c, x, fy + 2, w, 2, "#e8b830"); HL(c, x, fy + 2, w, "#ffe070");
  /* track-side wall + clutter */
  const wh = 10;
  R(c, x, fy + 4, w, wh, "#2a2636"); PK.speckle(c, x, fy + 4, w, wh, ["#3a364a", "#1a1624"], 0.2, floor(r() * 9999));
  HL(c, x, fy + 4, w, "#14101c"); for (let px = x + 30; px < x + w; px += 80 + ri(r, 0, 60)) { R(c, px, fy + 6, 22, 3, "#4a4658"); HL(c, px, fy + 6, 22, "#6a667c"); }
  dshade(c, x, fy + 4, w, wh, "#000000", (px, py) => (py - fy - 4) / wh, 0.5);
  /* track bed */
  const bedY = fy + 4 + wh;
  R(c, x, bedY, w, ty - bedY, "#18141e"); PK.speckle(c, x, bedY, w, ty - bedY, ["#2a2636", "#3a364a", "#0e0a14", "#4a4658"], 0.35, floor(r() * 9999));
  for (let px = x + 3; px < x + w; px += 11) { R(c, px, bedY + 4, 5, ty - bedY - 6, "#3a2a22"); VL(c, px, bedY + 4, ty - bedY - 6, "#5a4232"); HL(c, px, bedY + 4, 5, "#6a5238"); }
  const rail = (ry, thick) => { R(c, x, ry, w, thick, "#6a667c"); HL(c, x, ry, w, "#d8d4e4"); HL(c, x, ry + thick - 1, w, "#2a2636"); };
  rail(bedY + 6, 2); rail(ty - 12, 3);
  R(c, x, ty - 22, w, 3, "#6a4a2a"); HL(c, x, ty - 22, w, "#9a7040"); HL(c, x, ty - 20, w, "#2a1c10"); for (let px = x + 4; px < x + w; px += 20) R(c, px, ty - 22, 8, 1, "#e8b830");   /* third-rail cover */
  for (let i = 0; i < 6; i++) { const px = x + ri(r, 4, w - 20), py = bedY + ri(r, 12, ty - bedY - 6); R(c, px, py, ri(r, 3, 7), 2, pk(r, ["#c0302c", "#e8e4f0", "#3a8ad8", "#8a6a3a"])); }
  for (let i = 0; i < 3; i++) { const px = x + ri(r, 20, w - 60); ell(c, px, ty - 7, ri(r, 8, 18), 1, "#2a3a5a"); HL(c, px - 4, ty - 8, 8, "#5a7aa8"); }       /* puddles */
  dshade(c, x, bedY, w, 10, "#000000", (px, py) => 1 - (py - bedY) / 10, 0.5);
  /* near platform edge: tactile strip + floor */
  R(c, x, ty, w, 6, "#e8b830"); gradient(c, x, ty, w, 6, [[0, "#ffe070"], [1, "#c89a18"]], 1, true);
  for (let px = x + 1; px < x + w; px += 3) for (let py = ty + 1; py < ty + 6; py += 2) P(c, px, py, "#a07a10");
  HL(c, x, ty - 1, w, "#14101c"); HL(c, x, ty + 6, w, "#8a6a10");
  PK.concrete(c, x, ty + 7, w, y + h - ty - 7, { base: o.floor || "#76728a", panelH: 70, seed: r() * 1e6 | 0 });
  dshade(c, x, ty + 7, w, 8, "#000000", (px, py) => 1 - (py - ty - 7) / 8, 0.35);
  return em;
};

PK.subwayCar = function (c, x, y, w, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 280);
  const lit = o.lit !== false, open = !!o.doorsOpen, h = o.h || 92, em = [], r = rng(o, x, y, 66);
  const steel = o.color || "#aeb0c0", ks = K(steel), stripe = o.stripe || "#2f7ad8";
  const slot = 32, n = max(3, floor(w / slot)), sw = w / n;
  /* body */
  R(c, x, y, w, h - 10, steel); gradient(c, x, y + 8, w, 52, [[0, ks[4]], [0.25, ks[3]], [0.6, ks[2]], [1, ks[1]]], 1, true);
  /* roof line */
  R(c, x, y, w, 8, ks[1]); gradient(c, x, y, w, 8, [[0, "#d8dae8"], [0.5, ks[3]], [1, ks[1]]], 1, true); HL(c, x, y, w, "#ffffff"); HL(c, x, y + 7, w, ks[0]);
  /* corrugation lines */
  for (let px = x + 2; px < x + w; px += 4) { VL(c, px, y + 62, 14, ks[1]); VL(c, px + 1, y + 62, 14, ks[4]); }
  R(c, x, y + 60, w, 2, ks[1]); HL(c, x, y + 60, w, ks[4]);
  /* stripe */
  R(c, x, y + 56, w, 4, stripe); HL(c, x, y + 56, w, mix(stripe, "#ffffff", 0.5)); HL(c, x, y + 59, w, mix(stripe, "#0c0618", 0.5));
  /* lower body + skirt */
  R(c, x, y + 76, w, h - 86, ks[1]); HL(c, x, y + 76, w, ks[0]); gradient(c, x, y + 76, w, h - 86, [[0, ks[2]], [1, ks[0]]], 1, true);
  R(c, x, y + h - 10, w, 10, "#14111c"); HL(c, x, y + h - 10, w, "#3a364a");
  for (let i = 0; i < 2; i++) { const tx = x + round(w * (i ? 0.78 : 0.2)); R(c, tx - 18, y + h - 10, 36, 10, "#0c0a12"); [tx - 12, tx + 6].forEach(wx => { ell(c, wx + 3, y + h - 3, 7, 7, "#1c1a24"); ell(c, wx + 3, y + h - 3, 4, 4, "#3a364a"); }); }
  /* windows & doors */
  const wy = y + 14, wh = 38;
  for (let i = 0; i < n; i++) {
    const sx = x + round(i * sw), ex = x + round((i + 1) * sw), cw = ex - sx, isDoor = (i % 3 === 1);
    if (!isDoor) {
      const gx = sx + 4, gw = cw - 8;
      R(c, gx - 2, wy - 2, gw + 4, wh + 4, "#2a2838"); HL(c, gx - 2, wy - 2, gw + 4, "#5a566c");
      if (lit) {
        gradient(c, gx, wy, gw, wh, ["#fff4c8", "#ffe8a8", "#ffd890"], 1, true);
        R(c, gx, wy + 6, gw, 2, "#e8e4f0");                                                              /* ad strip */
        R(c, gx, wy + wh - 11, gw, 11, "#c46a2a"); HL(c, gx, wy + wh - 11, gw, "#e88a44");                /* seat */
        for (let q = 0; q < 3; q++) { const px = gx + 5 + q * floor(gw / 3); R(c, px, wy + 8, 1, 6, "#2a2838"); R(c, px - 1, wy + 14, 3, 2, "#2a2838"); }       /* straps */
        if (r() < 0.7) { const px = gx + ri(r, 4, gw - 8); ell(c, px, wy + wh - 18, 3, 3, pk(r, ["#8a5a3a", "#3a2a22", "#e0a27a"])); R(c, px - 4, wy + wh - 14, 9, 8, pk(r, ["#2f5a96", "#c0302c", "#2a2838", "#4a7a4a"])); }
        em.push([gx, wy, gw, wh]);
        dshade(c, gx, wy, gw, wh, "#ffffff", (px, py) => { const q = ((px - gx) + (py - wy) * 1 + 400) % 28; return q < 3 ? 1 : 0; }, 0.25);
      } else { gradient(c, gx, wy, gw, wh, ["#2a3a5a", "#141a2c"], 1, true); dshade(c, gx, wy, gw, wh, "#ffffff", (px, py) => { const q = ((px - gx) + (py - wy) + 400) % 30; return q < 4 ? 1 : 0; }, 0.22); }
      outline(c, gx - 1, wy - 1, gw + 2, wh + 2, "#5a566c");
    } else {
      const dx0 = sx + 3, dw = cw - 6, dy0 = y + 10, dh = 66;
      R(c, dx0 - 1, dy0 - 1, dw + 2, dh + 2, "#2a2838");
      if (open) {
        gradient(c, dx0, dy0, dw, dh, lit ? ["#fff4c8", "#ffe8a8", "#e8c880"] : ["#2a2a3a", "#14141e"], 1, true);
        R(c, dx0 + floor(dw / 2) - 1, dy0, 3, dh, "#c8c4d8"); VL(c, dx0 + floor(dw / 2) - 1, dy0, dh, "#ffffff");
        R(c, dx0, dy0 + dh - 12, dw, 12, lit ? "#8a7a6a" : "#2a2a34");
        if (lit) { em.push([dx0, dy0, dw, dh]); }
        R(c, dx0, dy0, 3, dh, steel); R(c, dx0 + dw - 3, dy0, 3, dh, steel); VL(c, dx0 + 2, dy0, dh, ks[1]); VL(c, dx0 + dw - 3, dy0, dh, ks[1]);
        R(c, dx0 - 1, dy0 + dh, dw + 2, 2, "#e8b830");
      } else {
        const half = floor(dw / 2);
        [dx0, dx0 + half + 1].forEach((lx, li) => {
          const lw = li ? dw - half - 1 : half;
          R(c, lx, dy0, lw, dh, steel); gradient(c, lx, dy0, lw, dh, [[0, ks[4]], [0.3, ks[3]], [1, ks[1]]], 1, true); outline(c, lx, dy0, lw, dh, ks[0]);
          R(c, lx + 3, dy0 + 4, lw - 6, 38, lit ? "#ffe8a8" : "#1a2236"); outline(c, lx + 3, dy0 + 4, lw - 6, 38, "#2a2838");
          if (lit) { gradient(c, lx + 3, dy0 + 4, lw - 6, 38, ["#fff4c8", "#ffd890"], 1, true); em.push([lx + 3, dy0 + 4, lw - 6, 38]); }
          dshade(c, lx + 3, dy0 + 4, lw - 6, 38, "#ffffff", (px, py) => { const q = ((px - lx) + (py - dy0) + 400) % 26; return q < 3 ? 1 : 0; }, 0.22);
          R(c, lx + (li ? 2 : lw - 4), dy0 + 48, 2, 9, "#2a2838");
        });
        R(c, dx0 + half - 1, dy0 + 2, 3, dh - 2, "#14111c");
      }
    }
    /* pillars between slots */
    R(c, sx, y + 8, 1, 50, ks[0]);
  }
  /* LED destination sign + line bullet */
  const ln = o.line || "L", bc = { L: "#9a9caa", "7": "#b933ad", A: "#2850ad", "4": "#00933c", G: "#6cbe45", J: "#996633", N: "#fccc0a", F: "#ff6319" }[ln] || "#9a9caa";
  R(c, x + 6, y + 9, 36, 6, "#08060c"); if (lit) { txt(c, "BROOKLYN", x + 8, y + 10, "#ff9a3f", 1, 0); em.push([x + 6, y + 9, 36, 6]); }
  ell(c, x + w - 18, y + 70, 8, 8, "#14111c"); ell(c, x + w - 18, y + 70, 7, 7, bc); txtC(c, ln, x + w - 18, y + 68, ln === "N" ? "#14111c" : "#ffffff", 1);
  for (let i = 0; i < 8; i++) R(c, x + ri(r, 0, w - 4), y + ri(r, 8, h - 20), ri(r, 3, 10), 1, "#6a667c");                 /* grime streaks */
  dshade(c, x, y + 60, w, 30, "#2a1c10", (px, py) => (py - y - 60) / 30 * 0.8, 0.25);
  return em;
};

PK.turnstile = function (c, x, y, o) {
  o = o || {}; x = round(x) + 2; y = round(y) - 6; const em = [];
  const col = o.color || "#a8aab8", k = K(col), H = 44, W = 28;
  groundShadow(c, x + W / 2, y + H, W / 2, 2, 0.4);
  R(c, x, y + 8, 14, H - 8, col); gradient(c, x, y + 8, 14, H - 8, [[0, k[4]], [0.3, k[3]], [1, k[1]]], 1, false); VL(c, x, y + 8, H - 8, k[4]); VL(c, x + 13, y + 8, H - 8, k[0]); HL(c, x, y + 8, 14, "#ffffff");
  R(c, x - 1, y + 6, 16, 4, k[2]); HL(c, x - 1, y + 6, 16, k[4]); HL(c, x - 1, y + 9, 16, k[0]);
  R(c, x + 3, y + 12, 8, 10, "#1a1a28"); outline(c, x + 3, y + 12, 8, 10, "#5a566c"); R(c, x + 5, y + 14, 4, 6, "#0a0a14");           /* swipe slot */
  R(c, x + 3, y + 25, 8, 3, "#0e2a1e"); R(c, x + 4, y + 26, 2, 1, "#3fe0a0"); R(c, x + 7, y + 26, 3, 1, "#ff4a4a"); em.push([x + 3, y + 25, 8, 3]);
  R(c, x + 5, y + 31, 4, 4, "#14121a");
  R(c, x - 2, y + H - 3, 18, 3, "#4a4658");
  /* rotor + three bars */
  cylV(c, x + 15, y + 14, 5, 22, col); R(c, x + 14, y + 12, 7, 3, k[2]); HL(c, x + 14, y + 12, 7, k[4]);
  cylH(c, x + 18, y + 18, 20, 3, "#c8c4d8"); line(c, x + 18, y + 20, x + 28, y + 30, "#c8c4d8"); line(c, x + 18, y + 21, x + 28, y + 31, "#5a566c"); R(c, x + 28, y + 30, 3, 3, "#c8c4d8");
  line(c, x + 18, y + 22, x + 30, y + 14, "#c8c4d8");
  return em;
};

PK.bench = function (c, x, y, w, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 90);
  const wood = o.wood || "#9a6a40", k = K(wood), metal = "#3a364a", r = rng(o, x, y, 67), back = o.back !== false, H = back ? 34 : 22;
  groundShadow(c, x + w / 2, y + H, w / 2, 2, 0.4);
  [x + 5, x + w - 9].forEach(lx => { R(c, lx, y + (back ? 14 : 4), 4, H - (back ? 14 : 4), metal); VL(c, lx, y + (back ? 14 : 4), H - (back ? 14 : 4), "#6a667c"); R(c, lx - 2, y + H - 2, 8, 2, "#1a1824"); if (back) { R(c, lx, y, 4, 22, metal); VL(c, lx, y, 22, "#6a667c"); } });
  for (let i = 0; i < 3; i++) { const sy = y + (back ? 14 : 4) + i * 3; R(c, x, sy, w, 3, wood); HL(c, x, sy, w, k[4]); HL(c, x, sy + 2, w, k[0]); for (let g = 0; g < w / 12; g++) R(c, x + floor(r() * (w - 5)), sy + 1, ri(r, 3, 8), 1, k[1]); }
  if (back) for (let i = 0; i < 2; i++) { const sy = y + 1 + i * 6; R(c, x, sy, w, 4, wood); HL(c, x, sy, w, k[4]); HL(c, x, sy + 3, w, k[0]); for (let g = 0; g < w / 12; g++) R(c, x + floor(r() * (w - 5)), sy + 1, ri(r, 3, 8), 1, k[1]); }
  dshade(c, x + 6, y + (back ? 23 : 13), w - 12, 4, "#0c0618", (px, py) => 1 - (py - y - (back ? 23 : 13)) / 4, 0.3);
  ell(c, x + ri(r, 10, w - 10), y + (back ? 15 : 5), 1, 0, "#2a2634");
};

/* =====================================================================================
   EXTRAS: small things every room ends up needing
   ===================================================================================== */

PK.neonLine = function (c, pts, x, y, color, o) {
  o = o || {}; x = round(x); y = round(y);
  const tube = o.tube || 2, G = o.glowR || (tube * 3 + 7);
  let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
  pts.forEach(p => { minX = min(minX, p[0]); minY = min(minY, p[1]); });
  const P2 = pts.map(p => [round(p[0] - minX), round(p[1] - minY)]); x += round(minX); y += round(minY);
  P2.forEach(p => { maxX = max(maxX, p[0]); maxY = max(maxY, p[1]); });
  const PW = maxX + tube + 1 + G * 2, PH = maxY + tube + 1 + G * 2, lit = new Uint8Array(PW * PH);
  const stamp = (px, py) => { for (let dy = 0; dy < tube; dy++) for (let dx = 0; dx < tube; dx++) { const xx = px + dx + G, yy = py + dy + G; if (xx >= 0 && yy >= 0 && xx < PW && yy < PH) lit[yy * PW + xx] = 1; } };
  const seg = (a, b) => {
    let x0 = a[0], y0 = a[1]; const x1 = b[0], y1 = b[1], dx = abs(x1 - x0), dy = -abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let err = dx + dy;
    for (;;) { stamp(x0, y0); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
  };
  for (let i = 0; i < P2.length - 1; i++) seg(P2[i], P2[i + 1]);
  if (o.closed) seg(P2[P2.length - 1], P2[0]);
  return neonRender(c, x, y, PW, PH, G, lit, new Uint8Array(PW * PH), color, tube, o.glow !== false, o.strength == null ? 1 : o.strength);
};

PK.baseboard = function (c, x, y, w, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 640);
  const h = o.h || 9, col = o.color || "#5a4058", k = K(col), r = rng(o, x, y, 70);
  R(c, x, y, w, h, col);
  gradient(c, x, y + 3, w, h - 4, [[0, k[2]], [1, k[1]]], 1, true);
  HL(c, x, y, w, k[4]); HL(c, x, y + 1, w, k[3]); HL(c, x, y + 2, w, k[1]); HL(c, x, y + h - 1, w, k[0]);
  for (let i = 0; i < w / 6; i++) { const px = x + floor(r() * w), py = y + 3 + floor(r() * max(1, h - 5)); P(c, px, py, r() < 0.5 ? k[3] : k[0]); }
  for (let px = x + 24; px < x + w; px += 48 + ri(r, 0, 20)) { P(c, px, y + 4, k[0]); P(c, px + 1, y + 4, k[3]); }
  dshade(c, x, y + h, w, 3, "#0c0618", (px, py) => 1 - (py - y - h) / 3, 0.4);
};

PK.rug = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 120); h = round(h || 30);
  const cols = o.colors || ["#5b2e8c", "#e0368f", "#7a3fb0"], kb = K(cols[0]), kr = K(cols[1]), ka = K(cols[2]);
  const shape = o.shape || "oval", cx = x + floor(w / 2), cy = y + floor(h / 2), rx = floor(w / 2), ry = floor(h / 2);
  if (shape === "oval") {
    ell(c, cx, cy + 1, rx, ry, kb[0]);
    ell(c, cx, cy, rx, ry, cols[1]); ell(c, cx - 1, cy - 1, rx - 2, ry - 1, kr[3]); ell(c, cx, cy, rx - 2, ry - 1, cols[1]);
    ell(c, cx, cy, rx - 4, ry - 2, kb[1]); ell(c, cx, cy, rx - 5, ry - 3, cols[0]);
    for (let i = 0; i < 4; i++) { const f = 1 - i * 0.2; if (rx * f - 6 > 3) { ell(c, cx, cy, round((rx - 6) * f), max(1, round((ry - 4) * f)), i % 2 ? cols[0] : cols[2]); } }
    for (let a = 0; a < 24; a++) { const ang = a / 24 * 2 * PI; P(c, cx + round(cos(ang) * (rx - 3)), cy + round(sin(ang) * (ry - 2)), kr[4]); }
    dshade(c, x, y, w, h, "#0c0618", (px, py) => { const dx = (px - cx) / rx, dy = (py - cy) / ry; return clamp(dx * dx + dy * dy - 0.55, 0, 1) * 0.6; }, 0.3);
  } else {
    const tw = round(w * 0.12);
    poly(c, [[x + tw, y], [x + w - tw, y], [x + w, y + h - 1], [x, y + h - 1]], kb[0]);
    poly(c, [[x + tw + 1, y + 1], [x + w - tw - 1, y + 1], [x + w - 1, y + h - 2], [x + 1, y + h - 2]], cols[1]);
    poly(c, [[x + tw + 3, y + 3], [x + w - tw - 3, y + 3], [x + w - 4, y + h - 4], [x + 4, y + h - 4]], cols[0]);
    for (let i = 0; i < 5; i++) { const t = (i + 0.5) / 5, px = round(lerp(x + w * 0.25, x + w * 0.75, t)); line(c, px, y + 4, round(lerp(x + 8, x + w - 8, t)), y + h - 5, i % 2 ? cols[2] : ka[3]); }
    for (let px = x + 2; px < x + w - 2; px += 2) { P(c, px, y + h, kr[3]); P(c, round(lerp(x + tw, x + w - tw, (px - x) / w)), y - 1, kr[3]); }
  }
};

PK.bulb = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y); const em = [], len = o.len == null ? 22 : o.len, on = o.on !== false;
  R(c, x, y, 1, len, "#1a1620");
  R(c, x - 3, y + len, 7, 4, "#4a4658"); HL(c, x - 3, y + len, 7, "#8a869c"); HL(c, x - 3, y + len + 3, 7, "#2a2838");
  if (on) { haloPts(c, x, y + len + 9, o.glowR || 34, "#ffd890", 0.85, em, o.glowR || 34); ball(c, x, y + len + 8, 3, "#fff4d6"); R(c, x - 1, y + len + 6, 2, 2, "#ffffff"); em.push([x - 3, y + len + 5, 7, 7]); }
  else ball(c, x, y + len + 8, 3, "#8a8698");
  return em;
};

PK.fluorescent = function (c, x, y, w, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 80); const em = [], on = o.on !== false;
  R(c, x, y, w, 5, "#9a96a8"); HL(c, x, y, w, "#d8d4e4"); HL(c, x, y + 4, w, "#4a4658");
  R(c, x + 2, y + 1, w - 4, 3, on ? "#f4fbff" : "#6a7080"); if (on) { HL(c, x + 2, y + 1, w - 4, "#ffffff"); em.push([x + 2, y + 1, w - 4, 3]); dshade(c, x - 6, y + 5, w + 12, 16, "#e8f4ff", (px, py) => (1 - (py - y - 5) / 16) * 0.8, 0.22); em.push([x - 6, y + 5, w + 12, 16]); }
  R(c, x - 1, y, 2, 5, "#4a4658"); R(c, x + w - 1, y, 2, 5, "#4a4658");
  return em;
};

PK.exitSign = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y); const em = [];
  R(c, x, y, 25, 11, "#1a2a20"); outline(c, x, y, 25, 11, "#5a566c"); R(c, x + 2, y + 2, 21, 7, "#18a050"); HL(c, x + 2, y + 2, 21, "#5affa0");
  txtC(c, "EXIT", x + 12.5, y + 3, "#ffffff", 1, 1); em.push([x + 2, y + 2, 21, 7]); haloPts(c, x + 12, y + 5, 16, "#40e080", 0.7, em, 10);
  return em;
};

PK.crate = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y); const r = rng(o, x, y, 71);
  const col = o.color || "#2f62b8", k = K(col), w = o.w || 36, h = o.h || 28, rec = o.records !== false;
  groundShadow(c, x + w / 2, y + 12 + h, w / 2, 2, 0.4);
  if (rec) [["#e0368f", 2], ["#ffd23f", 7], ["#efeaf8", 12], ["#39d0ff", 18], ["#ff8a4c", 24], ["#1d1622", 29]].forEach(([cc, ox], i) => { if (ox + 4 < w) { R(c, x + ox, y + 1 + (i % 2), 4, 12, cc); R(c, x + ox, y + 1 + (i % 2), 4, 1, "#ffffff"); VL(c, x + ox + 3, y + 2 + (i % 2), 11, mix(cc, "#0c0618", 0.4)); } });
  const by = y + 12;
  R(c, x, by, w, h, col); HL(c, x, by, w, k[4]); HL(c, x, by + 1, w, k[3]); VL(c, x, by, h, k[3]); VL(c, x + w - 1, by, h, k[1]); HL(c, x, by + h - 1, w, k[0]); HL(c, x, by + h - 2, w, k[1]);
  for (let yy = by + 5; yy < by + h - 5; yy += 6) for (let xx = x + 3; xx < x + w - 5; xx += 6) { R(c, xx, yy, 4, 3, k[0]); HL(c, xx, yy + 3, 4, k[3]); }
  R(c, x + 12, by + 4, 12, 3, k[0]);
};

PK.trashCan = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y); const w = o.w || 20, h = o.h || 28, col = o.color || "#8a8aa0", k = K(col), r = rng(o, x, y, 72);
  groundShadow(c, x + w / 2, y + h, w / 2 + 1, 2, 0.45);
  if (o.full) { ell(c, x + w / 2, y + 2, 8, 4, "#26222e"); ell(c, x + w / 2 - 2, y + 1, 4, 2, "#3a3448"); P(c, x + 4, y - 1, "#e8e4f0"); R(c, x + 13, y - 1, 3, 2, "#c8925a"); }
  R(c, x + 1, y + 6, w - 2, h - 6, col); gradient(c, x + 1, y + 6, w - 2, h - 6, [[0, k[3]], [0.2, k[4]], [0.5, k[2]], [0.85, k[1]], [1, k[0]]], 1, false);
  for (let px = x + 4; px < x + w - 3; px += 4) VL(c, px, y + 8, h - 10, k[1]);
  R(c, x, y + 4, w, 3, k[2]); HL(c, x, y + 4, w, k[4]); HL(c, x, y + 6, w, k[0]);
  R(c, x, y + h - 4, w, 3, k[2]); HL(c, x, y + h - 4, w, k[3]); HL(c, x, y + h - 2, w, k[0]);
  if (!o.full) { R(c, x + 2, y + 2, w - 4, 3, k[3]); HL(c, x + 2, y + 2, w - 4, k[4]); R(c, x + floor(w / 2) - 2, y, 5, 2, k[1]); }
  P(c, x + 5, y + 14, k[0]); P(c, x + 6, y + 15, k[3]);
};

PK.pizzaBox = function (c, x, y, o) {
  o = o || {}; x = round(x); y = round(y); const w = o.w || 42, bc = "#c8925a", kk = K(bc);
  R(c, x + 2, y, w - 2, 9, bc); HL(c, x + 2, y, w - 2, kk[4]); R(c, x, y + 9, w, 5, kk[1]); HL(c, x, y + 9, w, kk[3]); HL(c, x, y + 13, w, kk[0]);
  for (let i = 0; i < 9; i++) P(c, x + 2 - round(i * 0.25), y + i, kk[1]);
  txt(c, "PIZZA", x + floor((w - 19) / 2), y + 2, "#c0302c", 1, 0); ell(c, x + w - 8, y + 5, 3, 2, kk[2]); P(c, x + w - 9, y + 4, kk[0]);
};

PK.cardboardBox = function (c, x, y, w, h, o) {
  o = o || {}; x = round(x); y = round(y); w = round(w || 26); h = round(h || 20);
  const col = o.color || "#c8925a", k = K(col), r = rng(o, x, y, 73), td = 5;
  groundShadow(c, x + w / 2, y + h + td, w / 2 + 1, 2, 0.4);
  R(c, x, y + td, w, h, col); gradient(c, x, y + td, w, h, [[0, k[3]], [0.15, k[2]], [1, k[1]]], 1, true); VL(c, x, y + td, h, k[3]); VL(c, x + w - 1, y + td, h, k[0]); HL(c, x, y + td + h - 1, w, k[0]);
  poly(c, [[x, y + td], [x + 3, y], [x + w - 1, y], [x + w - 1, y + td]], k[3]); HL(c, x + 3, y, w - 4, k[4]); HL(c, x, y + td, w, k[1]);
  R(c, x + floor(w / 2) - 2, y + 1, 4, td + 6, "#d8c8a0"); HL(c, x + floor(w / 2) - 2, y + td + 6, 4, "#a8986a");                    /* packing tape */
  R(c, x + 3, y + td + h - 8, 8, 5, "#f4f0e4"); HL(c, x + 4, y + td + h - 6, 6, "#8a869c"); P(c, x + w - 6, y + td + h - 7, "#c0302c");
  for (let i = 0; i < 4; i++) P(c, x + 2 + floor(r() * (w - 4)), y + td + 2 + floor(r() * (h - 4)), k[1]);
};

/* =====================================================================================
   PALETTES
   ===================================================================================== */
PK.paletteNight = {
  name: "night",
  wall: "#6a5478", wallLight: "#8a70a0", wallDark: "#463858", ceiling: "#3a2e50", trim: "#a48aa0",
  plaster: "#7a6488", brick: "#8a3a2a", brickDark: "#52283a", mortar: "#7a6a78",
  floor: "#5a4048", wood: "#7a4a32", woodLight: "#a06a46", woodDark: "#4e2e26",
  metal: "#4a4658", metalLight: "#8a86a0", metalDark: "#2a2638", chrome: "#c8c4d8",
  concrete: "#5e5a70", asphalt: "#2a2636", sidewalk: "#6a6680", curb: "#7a7690", tile: "#aaa6bc", tileDark: "#36324a",
  carpet: "#241a3c", leather: "#4a2a3a", fabric: "#3a3a6a",
  sky: SKY.night, glass: "#1a2a44", ink: "#140c1e", paper: "#d8ccb8", white: "#e8e4f0",
  neonPink: "#ff3fa4", neonCyan: "#39d0ff", neonViolet: "#a05cff", neonGreen: "#9be15d", neonAmber: "#ffc44d",
  neonRed: "#ff4a4a", neonYellow: "#ffd23f", neonBlue: "#4a7aff", sodium: "#ffb04a", sodiumLight: "#ffd27a",
  lamp: "#ffe2a0", screen: "#123040", ledGreen: "#3fd07a", ledAmber: "#ff9a3f", ledRed: "#ff4a4a",
  skin: ["#f2c8a0", "#e0a27a", "#b8775a", "#8a5238", "#5a3424"], accent: ["#ff3fa4", "#39d0ff", "#ffd23f", "#a05cff", "#5cff9a", "#ff8a4c"]
};
PK.paletteDay = {
  name: "day",
  wall: "#b49cb8", wallLight: "#d0bcd0", wallDark: "#8a7494", ceiling: "#ddd4e0", trim: "#f0e8f4",
  plaster: "#c4b0c0", brick: "#a4543e", brickDark: "#74382e", mortar: "#b8aaa4",
  floor: "#a87a58", wood: "#9a6240", woodLight: "#c48a5c", woodDark: "#6a4030",
  metal: "#7a7690", metalLight: "#b8b4cc", metalDark: "#4a4660", chrome: "#e4e0f0",
  concrete: "#9a96a8", asphalt: "#4a4658", sidewalk: "#b0acc0", curb: "#aaa6bc", tile: "#e0dce8", tileDark: "#5a5670",
  carpet: "#5a3a5a", leather: "#8a4a4a", fabric: "#5a6aa0",
  sky: SKY.day, glass: "#8ab8e0", ink: "#241838", paper: "#f0e4cc", white: "#fbf8ff",
  neonPink: "#ff3fa4", neonCyan: "#39d0ff", neonViolet: "#a05cff", neonGreen: "#9be15d", neonAmber: "#ffc44d",
  neonRed: "#ff4a4a", neonYellow: "#ffd23f", neonBlue: "#4a7aff", sodium: "#ffb04a", sodiumLight: "#ffd27a",
  lamp: "#fff4d6", screen: "#2a5a70", ledGreen: "#3fd07a", ledAmber: "#ff9a3f", ledRed: "#ff4a4a",
  skin: ["#f2c8a0", "#e0a27a", "#b8775a", "#8a5238", "#5a3424"], accent: ["#e0368f", "#2a9ad8", "#f0b020", "#8a4cd8", "#3ab870", "#e86a30"]
};
PK.ramp = ramp;

/* Default footprints [w, h] of the solid artwork (glow/shadow excluded), x,y = top-left, measured from the real
   output with default arguments.  Handy for grounding props:  PK.hydrant(c, x, floorY - PK.sizes.hydrant[1]). */
PK.sizes = {
  hydrant: [20, 20], trashBags: [43, 28], manhole: [38, 12], mailbox: [20, 32], newspaperBox: [16, 28], bike: [48, 31], subwayStairs: [64, 52],
  door: [48, 118], cashRegister: [31, 29], table: [64, 36], chair: [22, 42], couch: [110, 46], bed: [176, 62], desk: [110, 50], lamp: [18, 35], lampFloor: [20, 74],
  plant1: [30, 28], plant2: [50, 47], plant3: [76, 69], tv: [44, 34], laptop: [30, 22], poster: [40, 56], frame: [26, 32], clock: [18, 18], radiator: [80, 34],
  vent: [26, 16], sink: [28, 39], toilet: [30, 36], officeCubicle: [136, 88], copier: [56, 46], waterCooler: [18, 46], vendingMachine: [40, 66], microwave: [26, 15],
  turntable: [70, 31], turntableBudget: [62, 28], cdj1: [46, 28], cdj2: [52, 30], cdj3: [58, 32], mixer2: [40, 30], mixer4: [66, 30], speakerStack: [44, 92], monitors: [26, 44],
  shelf: [100, 80], recordBins: [132, 60], recordWall: [160, 90], counter: [120, 34], cooler: [72, 98], bar: [260, 110], stoop: [120, 80], awning: [120, 26], scaffold: [160, 120],
  fireEscape: [90, 112], truss: [200, 12], stage: [420, 64], studioDesk: [250, 90], djBooth: [230, 74], barricade: [120, 24], departuresBoard: [200, 74], airportSeats: [120, 40],
  planeWindow: [28, 38], luggageCarousel: [220, 44], hotelBed: [150, 78], suitcase: [23, 36], subwayCar: [280, 96], turnstile: [38, 38], bench: [90, 34], baseboard: [640, 9],
  rug: [120, 30], bulb: [7, 34], fluorescent: [80, 5], exitSign: [25, 11], crate: [36, 40], trashCan: [20, 28], pizzaBox: [42, 14], cardboardBox: [26, 25]
};
PK.version = "1.0";

})();
