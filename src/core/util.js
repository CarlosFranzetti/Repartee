/* re:parteé — shared low-level helpers.
   Everything hangs off one global namespace, window.RP, so the game runs as plain
   <script> tags from file:// and bundles into a single HTML file. */
(function () {
"use strict";
const RP = window.RP = window.RP || {};
RP.data = RP.data || {};

/* logical screen: the scene is 640x256, the full game frame 640x360 */
RP.W = 640; RP.SH = 256;

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
/* 4x4 ordered-dither threshold, 0..15. Dithering is OFF: every threshold collapses to the midpoint,
   so code written as "pixel on if bayer(x,y) < level" draws clean color steps instead of dot
   patterns. Set DITHER = true to bring the classic VGA stipple back. */
const DITHER = false;
const bayer = DITHER ? (x, y) => BAYER[((y & 3) << 2) | (x & 3)] : () => 7.5;
const mk = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

/* filled rectangle snapped to whole pixels */
function R(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
/* single pixel */
function P(c, x, y, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), 1, 1); }
/* filled pixel ellipse */
function ell(c, cx, cy, rx, ry, col) {
  c.fillStyle = col;
  if (ry <= 0) { c.fillRect(Math.round(cx - rx), Math.round(cy), Math.round(2 * rx + 1), 1); return; }
  for (let dy = -ry; dy <= ry; dy++) {
    const h = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry))));
    c.fillRect(Math.round(cx - h), Math.round(cy + dy), 2 * h + 1, 1);
  }
}
/* 1px line (Bresenham) */
function line(c, x0, y0, x1, y1, col) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  c.fillStyle = col;
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    c.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}
/* filled polygon, pixel-snapped scanlines */
function poly(c, pts, col) {
  c.fillStyle = col;
  let y0 = Infinity, y1 = -Infinity;
  pts.forEach(p => { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
  for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
    const xs = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      if ((a[1] <= y + 0.5 && b[1] > y + 0.5) || (b[1] <= y + 0.5 && a[1] > y + 0.5)) {
        xs.push(a[0] + (y + 0.5 - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
      }
    }
    xs.sort((p, q) => p - q);
    for (let i = 0; i + 1 < xs.length; i += 2) c.fillRect(Math.round(xs[i]), y, Math.round(xs[i + 1]) - Math.round(xs[i]), 1);
  }
}
/* deterministic RNG */
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
/* string -> 32-bit seed */
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

/* colors */
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const toHex = (r, g, b) => "#" + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("");
function mix(a, b, t) { const A = hex(a), B = hex(b); return toHex(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)); }
function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6;
  }
  return [h, s, l];
}
function hsl2rgb(h, s, l) {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const f = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  return [f(p, q, h + 1 / 3) * 255, f(p, q, h) * 255, f(p, q, h - 1 / 3) * 255];
}
/* Pixel-art ramp around a base color: [deep shadow, shadow, base, light, highlight].
   Shadows drift toward violet and lose a little saturation, lights drift warm,
   the classic hue-shifted ramp of early-90s VGA adventure art. */
const rampCache = new Map();
function ramp(base) {
  if (rampCache.has(base)) return rampCache.get(base);
  const [r, g, b] = hex(base);
  const [h, s, l] = rgb2hsl(r, g, b);
  const shift = (dh, ds, dl) => {
    let nh = h + dh; nh -= Math.floor(nh);
    return toHex(...hsl2rgb(nh, clamp(s + ds, 0, 1), clamp(l + dl, 0.02, 0.97)));
  };
  // move hue toward violet (0.75) for shadows, toward yellow (0.14) for lights
  const toward = (target, amt) => { let d = target - h; if (d > 0.5) d -= 1; if (d < -0.5) d += 1; return d * amt; };
  const out = [
    shift(toward(0.72, 0.14), -0.04, -Math.min(0.30, l * 0.55)),
    shift(toward(0.72, 0.12), -0.02, -Math.min(0.16, l * 0.32)),
    base,
    shift(toward(0.14, 0.08), 0.02, Math.min(0.11, (1 - l) * 0.35)),
    shift(toward(0.14, 0.14), 0.0, Math.min(0.22, (1 - l) * 0.6))
  ];
  rampCache.set(base, out);
  return out;
}

/* 3x5 pixel font for signs, posters, record labels */
const F3 = {
  A: "010101111101101", B: "110101110101110", C: "011100100100011", D: "110101101101110", E: "111100110100111",
  F: "111100110100100", G: "011100101101011", H: "101101111101101", I: "111010010010111", J: "001001001101010",
  K: "101101110101101", L: "100100100100111", M: "101111111101101", N: "110101101101101", O: "010101101101010",
  P: "110101110100100", Q: "010101101110011", R: "110101110101101", S: "011100010001110", T: "111010010010010",
  U: "101101101101111", V: "101101101101010", W: "101101111111101", X: "101101010101101", Y: "101101010010010",
  Z: "111001010100111", "0": "111101101101111", "1": "010110010010111", "2": "110001010100111", "3": "110001010001110",
  "4": "101101111001001", "5": "111100110001110", "6": "011100111101111", "7": "111001010010010", "8": "111101111101111",
  "9": "111101111001110", " ": "000000000000000", "!": "010010010000010", ".": "000000000000010", ":": "000010000010000",
  "$": "011110010011110", "-": "000000111000000", "'": "010010000000000", "?": "110001010000010", "/": "001001010100100",
  "&": "010101010101011", "+": "000010111010000", ",": "000000000010100", "#": "101111101111101", "%": "101001010100101",
  "(": "010100100100010", ")": "010001001001010", "*": "000101010101000", "=": "000111000111000", "\"": "101101000000000",
  "@": "010101111100011", "É": "001010111110111", "_": "000000000000111"
};
function txt(c, s, x, y, col, sc = 1, sp = 1) {
  c.fillStyle = col;
  let cx = x;
  for (const ch of String(s).toUpperCase()) {
    const g = F3[ch] || F3[" "];
    for (let i = 0; i < 15; i++) if (g[i] === "1") c.fillRect(cx + (i % 3) * sc, y + Math.floor(i / 3) * sc, sc, sc);
    cx += 3 * sc + sp;
  }
}
const txtW = (s, sc = 1, sp = 1) => String(s).length * (3 * sc + sp) - sp;
/* centered pixel text */
function txtC(c, s, cx, y, col, sc = 1, sp = 1) { txt(c, s, Math.round(cx - txtW(s, sc, sp) / 2), y, col, sc, sp); }

/* misc */
const pick = (a, rnd = Math.random) => a[Math.floor(rnd() * a.length)];
const $ = id => document.getElementById(id);
function el(tag, attrs, parent) {
  const e = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    if (k === "text") e.textContent = attrs[k];
    else if (k === "html") e.innerHTML = attrs[k];
    else if (k === "cls") e.className = attrs[k];
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), attrs[k]);
    else e.setAttribute(k, attrs[k]);
  }
  if (parent) parent.appendChild(e);
  return e;
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmtMoney = n => (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });

/* storage that never throws */
const store = {
  get(k) { try { const v = localStorage.getItem(k); return v == null ? null : JSON.parse(v); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
};

RP.u = { BAYER, bayer, mk, clamp, lerp, R, P, ell, line, poly, mulberry, hashStr, hex, toHex, mix, rgb2hsl, hsl2rgb, ramp,
  F3, txt, txtW, txtC, pick, $, el, esc, fmtMoney, store };
})();
