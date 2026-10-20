/* digkit — shared helpers for the three record-digging mini-games
   (go.Digging, crate.Digging, record.Hunt). Everything hangs off RP.digkit and is only
   touched from inside each game's play() (this file loads after cratedigging.js).
   Contains: record-copy model (condition, sticker price), rich sleeve + vinyl painters
   (wear, scuffs, warp), price stickers, wooden bin painters, dust, typewriter text,
   integer-scale canvas fitting, shared CSS and catalog pickers. */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u;
const { R, P, ell, line, poly, bayer, mulberry, hashStr, mix, ramp, txt, txtW, txtC, clamp } = U;
const floor = Math.floor, round = Math.round, abs = Math.abs, min = Math.min, max = Math.max, sin = Math.sin, cos = Math.cos, PI = Math.PI;

const DK = RP.digkit = {};

/* ------------------------------------------------------------------ misc */
DK.reduced = () => { try { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) { return false; } };
DK.ascii = s => String(s == null ? "" : s).normalize("NFD").replace(/[̀-ͯ]/g, "");
DK.money = n => { const v = round(n * 100) / 100; return "$" + (v % 1 ? v.toFixed(2) : String(v)); };
DK.pick = (a, rnd) => a[floor((rnd || Math.random)() * a.length)];
DK.shuffle = (a, rnd) => { rnd = rnd || Math.random; const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = floor(rnd() * (i + 1)); const t = b[i]; b[i] = b[j]; b[j] = t; } return b; };
DK.cv = (w, h) => { const c = document.createElement("canvas"); c.width = max(1, w); c.height = max(1, h); const x = c.getContext("2d"); x.imageSmoothingEnabled = false; return c; };
DK.ease = t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
const A = (c, a) => { const p = c.globalAlpha; c.globalAlpha = a; return p; };
/* alpha pixel / rect */
const AP = (c, x, y, col, a) => { const p = A(c, a); P(c, x, y, col); c.globalAlpha = p; };
const AR = (c, x, y, w, h, col, a) => { const p = A(c, a); R(c, x, y, w, h, col); c.globalAlpha = p; };
DK.AP = AP; DK.AR = AR;
/* pixel text with a 1px outline */
function txtO(c, s, x, y, col, sc, out) {
  s = DK.ascii(s); sc = sc || 1;
  [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(d => txt(c, s, x + d[0], y + d[1], out || "#0c0618", sc, 1));
  txt(c, s, x, y, col, sc, 1);
}
DK.txtO = txtO;
/* word-wrap for the 3x5 font */
function wrap(str, maxW, sc, maxLines) {
  const words = DK.ascii(str).split(/\s+/).filter(Boolean), lines = []; let cur = "";
  words.forEach(w => {
    const t = cur ? cur + " " + w : w;
    if (txtW(t, sc, 1) <= maxW || !cur) cur = t; else { lines.push(cur); cur = w; }
  });
  if (cur) lines.push(cur);
  for (let i = 0; i < lines.length; i++) while (lines[i].length > 1 && txtW(lines[i], sc, 1) > maxW) lines[i] = lines[i].slice(0, -1);
  if (maxLines && lines.length > maxLines) { const keep = lines.slice(0, maxLines); keep[maxLines - 1] = keep[maxLines - 1].replace(/\s*\S*$/, "") + "."; return keep; }
  return lines;
}
DK.wrap = wrap;

/* ------------------------------------------------------------------ conditions */
const CONDS = [
  { id: "mint", name: "MINT", mult: 1.2, col: "#5cff9a", ord: 0 },
  { id: "vg+", name: "VG+", mult: 1, col: "#b6f05c", ord: 1 },
  { id: "vg", name: "VG", mult: 0.75, col: "#ffc44d", ord: 2 },
  { id: "beat", name: "BEAT", mult: 0.4, col: "#ff5a5a", ord: 3 }
];
DK.CONDS = CONDS;
DK.cond = id => CONDS.find(c => c.id === id) || CONDS[1];
const NOTES = {
  mint: { sleeve: ["still in the shrink", "crisp corners, no wear"], vinyl: ["glossy, looks unplayed", "no marks you can see"] },
  "vg+": { sleeve: ["light shelf wear", "one tiny corner ding"], vinyl: ["a few faint hairlines", "plays quiet"] },
  vg: { sleeve: ["ring wear on the front", "seam starting to split", "old sticker residue"], vinyl: ["light scuffs, some noise", "hairlines all over"] },
  beat: { sleeve: ["split seam and a water stain", "torn corner, taped", "chewed edges, marker scrawl"], vinyl: ["deep scratches. it skips.", "WARPED. it ripples."] }
};
/* weighted condition roll. mix = [mint, vg+, vg, beat] weights */
DK.rollCond = (rnd, mixW) => {
  const w = mixW || [10, 40, 35, 15]; let t = rnd() * (w[0] + w[1] + w[2] + w[3]);
  for (let i = 0; i < 4; i++) { t -= w[i]; if (t < 0) return CONDS[i]; }
  return CONDS[1];
};
/* a physical copy of a record: condition, notes, warp flag, deterministic wear seed */
DK.makeCopy = (rec, rnd, o) => {
  o = o || {};
  const cond = o.cond ? (typeof o.cond === "string" ? DK.cond(o.cond) : o.cond) : DK.rollCond(rnd, o.mix);
  const N = NOTES[cond.id], seed = floor(rnd() * 1e9);
  const warped = cond.id === "beat" && (o.warp != null ? !!o.warp : rnd() < 0.6);
  const vinylNote = cond.id === "beat" ? (warped ? N.vinyl[1] : N.vinyl[0]) : DK.pick(N.vinyl, rnd);
  return { rec, id: rec.id, cond, seed, warped, sleeveNote: DK.pick(N.sleeve, rnd), vinylNote, worth: rec.price * cond.mult };
};
DK.roundPrice = v => v < 10 ? max(0.5, round(v * 2) / 2) : v < 40 ? round(v) : round(v / 5) * 5;
/* sticker price for a copy; mult = bin multiplier; gem = mispriced treasure */
DK.stickerFor = (rec, cond, mult, gem) => {
  let v = rec.price * cond.mult * (mult || 1);
  if (gem) v = v * 0.16;
  return DK.roundPrice(max(v, 0.5));
};

/* ------------------------------------------------------------------ canvas fitting (integer scale) */
DK.fit = (cv, box, o) => {
  o = o || {};
  const sc = o.scale || 2;
  const avail = max(120, floor((box && box.clientWidth) || o.fallback || 328));
  const W = clamp(floor(avail / sc), o.minW || 160, o.maxW || 340);
  const H = typeof o.h === "function" ? o.h(W) : (o.h || 160);
  const changed = cv.width !== W || cv.height !== H;
  if (cv.width !== W) cv.width = W;
  if (cv.height !== H) cv.height = H;
  cv.style.width = W * sc + "px"; cv.style.height = H * sc + "px";
  const ctx = cv.getContext("2d"); ctx.imageSmoothingEnabled = false;
  return { W, H, sc, changed, ctx };
};

/* ------------------------------------------------------------------ sleeve painter */
const FAM = { disco: "warm", boogie: "warm", garage: "warm", soul: "warm", funk: "bold", "jazz-funk": "smooth", house: "typo", "deep house": "typo", "acid house": "typo", "chicago house": "typo",
  italo: "neon", "pop-dance": "neon", "smooth jazz": "smooth", "detroit techno": "grid", techno: "grid", minimal: "grid", electro: "synth", "hip-hop": "bold", breaks: "bold", ambient: "sky", novelty: "neon", eurodance: "neon" };
const PALS = {
  warm: [["#2a1448", "#ff8a3c", "#ffd23f", "#f4ead0"], ["#5a1a3c", "#ff5a8a", "#ffc44d", "#fff0d0"], ["#1c2a5a", "#ffc44d", "#ff6a3a", "#f4ead0"], ["#7a2a1a", "#ffb040", "#f4ead0", "#2a1a3a"]],
  typo: [["#101018", "#ffd23f", "#e8e4f0", "#ff3fa4"], ["#e8e4f0", "#c0302c", "#1d1622", "#2f62b8"], ["#2f62b8", "#f4ead0", "#ffd23f", "#1d1622"], ["#1b1440", "#39d0ff", "#ff3fa4", "#f4ead0"], ["#c0302c", "#f4ead0", "#1d1622", "#ffd23f"], ["#1d3a2a", "#9be15d", "#f4ead0", "#ffd23f"]],
  grid: [["#0a0a12", "#39d0ff", "#e8e4f0", "#ff3fa4"], ["#14161c", "#9be15d", "#e8e4f0", "#4a4658"], ["#1a1a22", "#e8e4f0", "#c0302c", "#8a86a0"]],
  synth: [["#140c34", "#ff3fa4", "#39d0ff", "#ffd23f"], ["#0e1a3a", "#39d0ff", "#ff8a4c", "#f4ead0"]],
  bold: [["#f4ead0", "#c0302c", "#1d1622", "#ffb03a"], ["#1d1622", "#ffd23f", "#f4ead0", "#c0302c"], ["#2f62b8", "#ffd23f", "#f4ead0", "#1d1622"], ["#3a6a3a", "#f4ead0", "#ffb03a", "#1d1622"]],
  sky: [["#1a2a5a", "#8ad0ff", "#ffd8a0", "#f4ead0"], ["#2a1a4a", "#ff9a8a", "#ffd8a0", "#f4ead0"]],
  neon: [["#2a0d4a", "#ff3fa4", "#39d0ff", "#ffd23f"], ["#0e2a4a", "#ff8a4c", "#ff3fa4", "#fff0d0"], ["#4a0d3a", "#39d0ff", "#ffd23f", "#f4ead0"]],
  smooth: [["#e8d8c0", "#2a5a7a", "#c0302c", "#1d1622"], ["#1a3a5a", "#e8c070", "#f4ead0", "#c0302c"]]
};
const inkOn = bg => { const v = U.hex(bg); return 0.3 * v[0] + 0.59 * v[1] + 0.11 * v[2] > 140 ? "#1d1622" : "#f4ead0"; };
function dither(c, x, y, w, h, col, fn, a) {
  const p = A(c, a == null ? 1 : a); c.fillStyle = col;
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if (fn(xx, yy) * 16 > bayer(xx, yy)) c.fillRect(xx, yy, 1, 1);
  c.globalAlpha = p;
}
function gradBand(c, x, y, w, h, c0, c1) {
  for (let yy = 0; yy < h; yy++) {
    const t = (yy + 0.5) / h;
    for (let xx = 0; xx < w; xx++) { c.fillStyle = (t > (bayer(x + xx, y + yy) + 0.5) / 16) ? c1 : c0; c.fillRect(x + xx, y + yy, 1, 1); }
  }
}
const MOTIF = {
  warm(c, x, y, s, pal, r, v) {
    const [bg, a, b] = pal, cx = x + s * 0.5, cy = y + s * (v ? 0.64 : 0.46);
    const N = 14 + floor(r() * 6), L = s * 1.7, rot = r() * 6.283;
    for (let i = 0; i < N; i += 2) {
      const a0 = rot + i / N * 6.283, a1 = rot + (i + 1) / N * 6.283;
      poly(c, [[cx, cy], [cx + cos(a0) * L, cy + sin(a0) * L], [cx + cos(a1) * L, cy + sin(a1) * L]], mix(bg, a, 0.5));
    }
    if (v) {
      for (let i = 4; i >= 0; i--) ell(c, cx, y + s * 0.8, s * (0.18 + i * 0.1), s * (0.18 + i * 0.1), [b, a, "#ff4a8a", "#7a3fb0", "#3a2a7a"][i]);
      R(c, x, y + s * 0.8, s, s * 0.3, bg);
    } else {
      const rr = s * 0.2; ell(c, cx, cy, rr, rr, ramp(b)[1]); ell(c, cx - 1, cy - 1, rr - 1, rr - 1, b);
      for (let yy = -rr; yy <= rr; yy++) for (let xx = -rr; xx <= rr; xx++) { if (xx * xx + yy * yy > rr * rr) continue; const px = round(cx + xx), py = round(cy + yy); if ((px + 2) % 4 === 0 || (py + 1) % 4 === 0) P(c, px, py, ramp(b)[1]); else if (xx + yy < -rr * 0.5) P(c, px, py, "#ffffff"); }
    }
    dither(c, x, y + s * 0.55, s, s * 0.45, bg, (px, py) => (py - y - s * 0.55) / (s * 0.45) * 0.9, 1);
  },
  typo(c, x, y, s, pal, r, v, rec) {
    const [bg, a, b, ink] = pal;
    const letter = (DK.ascii(rec.title).match(/[A-Za-z0-9]/) || ["R"])[0].toUpperCase();
    const k = max(2, floor(s * 0.5 / 5)), gw = 3 * k, gh = 5 * k, gx = x + floor((s - gw) / 2) + (v ? 6 : -4), gy = y + floor(s * 0.2);
    if (v) { ell(c, gx + gw / 2, gy + gh / 2, gh * 0.72, gh * 0.72, mix(bg, a, 0.5)); ell(c, gx + gw / 2, gy + gh / 2, gh * 0.55, gh * 0.55, bg); }
    else for (let i = -s; i < s * 2; i += 9) { line(c, x + i, y + s, x + i + s, y, mix(bg, b, 0.22)); line(c, x + i + 1, y + s, x + i + s + 1, y, mix(bg, b, 0.22)); }
    txt(c, letter, gx + k, gy + k, ramp(b)[1], k, 0);
    txt(c, letter, gx, gy, a, k, 0);
    for (let i = 0; i < 3; i++) R(c, x + 4, y + floor(s * 0.62) + i * 3, floor(s * (0.5 - i * 0.12)), 1, b);
    for (let yy = 0; yy < s * 0.3; yy += 2) for (let xx = 0; xx < s; xx += 2) if (((xx + yy) >> 1) % 2 === 0 && xx > s * 0.55 && yy < s * 0.22) P(c, x + xx, y + yy + floor(s * 0.62), mix(bg, b, 0.5));
  },
  grid(c, x, y, s, pal, r, v) {
    const [bg, a, b, ink] = pal, hy = y + floor(s * 0.52), cx = x + s * 0.5;
    for (let i = 0; i < floor(s * 0.25); i++) P(c, x + floor(r() * s), y + floor(r() * s * 0.5), r() < 0.5 ? b : mix(bg, b, 0.5));
    if (v) { ell(c, cx, y + s * 0.28, s * 0.16, s * 0.16, mix(bg, a, 0.35)); ell(c, cx - 2, y + s * 0.28 - 2, s * 0.1, s * 0.1, a); for (let yy = 0; yy < s * 0.36; yy += 3) R(c, x, y + s * 0.18 + yy, s, 1, bg); }
    else { for (let i = 0; i < 5; i++) { const q = s * (0.34 - i * 0.06); R(c, floor(cx - q), floor(y + s * 0.28 - q), floor(q * 2), 1, a); R(c, floor(cx - q), floor(y + s * 0.28 + q), floor(q * 2), 1, a); R(c, floor(cx - q), floor(y + s * 0.28 - q), 1, floor(q * 2), a); R(c, floor(cx + q), floor(y + s * 0.28 - q), 1, floor(q * 2) + 1, a); } }
    R(c, x, hy, s, s, mix(bg, a, 0.1)); R(c, x, hy, s, 1, a);
    for (let i = -8; i <= 8; i++) line(c, cx + i * s * 0.02, hy, cx + i * s * 0.22, y + s, mix(bg, a, 0.7));
    let yy = hy + 2, st = 2; while (yy < y + s) { R(c, x, yy, s, 1, mix(bg, a, 0.7)); yy += st; st += 1.4; }
  },
  synth(c, x, y, s, pal, r, v) {
    const [bg, a, b, ink] = pal, hy = y + floor(s * 0.58), cx = x + s * 0.5;
    gradBand(c, x, y, s, hy - y, bg, mix(bg, a, 0.55));
    for (let i = 0; i < floor(s * 0.2); i++) P(c, x + floor(r() * s), y + floor(r() * s * 0.4), "#ffffff");
    const rr = s * 0.24; ell(c, cx, hy - rr * 0.4, rr, rr, ink);
    for (let yy = 0; yy < rr * 1.6; yy += 3) R(c, floor(cx - rr), floor(hy - rr * 1.4 + yy), floor(rr * 2), 1 + floor(yy / 7), mix(bg, a, 0.5));
    R(c, x, hy, s, s, bg);
    for (let i = -9; i <= 9; i++) line(c, cx + i * s * 0.02, hy, cx + i * s * 0.28, y + s, b);
    let yy = hy + 1, st = 1.5; while (yy < y + s) { R(c, x, floor(yy), s, 1, b); yy += st; st *= 1.28; }
    R(c, x, hy, s, 1, a);
  },
  bold(c, x, y, s, pal, r, v) {
    const [bg, a, b, ink] = pal;
    if (v) { poly(c, [[x, y], [x + s, y], [x, y + s]], mix(bg, a, 0.85)); }
    const stp = s > 60 ? 4 : 3, cx = x + s * (0.35 + r() * 0.3), cy = y + s * 0.38;
    for (let gy = 0; gy < s * 0.78; gy += stp) for (let gx = 0; gx < s; gx += stp) {
      const d = Math.hypot(x + gx - cx, y + gy - cy) / (s * 0.7), rad = clamp(1.8 - d * 2.2, 0, 1.8);
      if (rad > 0.4) { ell(c, x + gx + 1, y + gy + 1, rad > 1.2 ? 1 : 0, rad > 1.2 ? 1 : 0, a); }
    }
    ell(c, cx, cy, s * 0.15, s * 0.15, b); ell(c, cx, cy, s * 0.05, s * 0.05, bg);
  },
  sky(c, x, y, s, pal, r, v) {
    const [bg, a, b] = pal, hy = y + floor(s * 0.6);
    gradBand(c, x, y, s, hy - y, bg, a); R(c, x, hy, s, s, mix(bg, "#000000", 0.35));
    ell(c, x + s * 0.5, hy - 1, s * 0.12, s * 0.12, b);
    for (let i = 0; i < 9; i++) R(c, floor(x + s * (0.4 + r() * 0.2) - (i % 3) * 2), hy + 2 + i * 2, floor(s * 0.1 + i), 1, mix(b, bg, 0.3 + i * 0.05));
    for (let i = 0; i < 18; i++) P(c, x + floor(r() * s), y + floor(r() * (hy - y) * 0.7), "#f4ead0");
  },
  neon(c, x, y, s, pal, r, v) {
    const [bg, a, b, ink] = pal, hy = y + floor(s * 0.62), cx = x + s * (v ? 0.62 : 0.4);
    gradBand(c, x, y, s, hy - y, bg, mix(bg, a, 0.6));
    ell(c, cx, hy - s * 0.2, s * 0.22, s * 0.22, ink); ell(c, cx - 1, hy - s * 0.2 - 1, s * 0.17, s * 0.17, mix(ink, a, 0.4));
    for (let yy = 0; yy < s * 0.2; yy += 3) R(c, floor(cx - s * 0.22), floor(hy - s * 0.2 + yy + 2), floor(s * 0.44), 1, mix(bg, a, 0.6));
    R(c, x, hy, s, s, mix(bg, "#000000", 0.25)); for (let i = 0; i < 5; i++) R(c, x, hy + 2 + i * 3, s, 1, mix(bg, b, 0.5));
    const px = x + s * (v ? 0.18 : 0.82);
    R(c, floor(px), floor(hy - s * 0.4), 2, floor(s * 0.4), "#140c24");
    for (let i = 0; i < 6; i++) { const ang = -0.5 + i * 0.4 + 3.1 * 0, dir = i < 3 ? -1 : 1; line(c, px + 1, hy - s * 0.4, px + 1 + dir * s * (0.08 + (i % 3) * 0.04), hy - s * 0.4 + 2 + (i % 3) * 3, "#140c24"); }
  },
  smooth(c, x, y, s, pal, r, v) {
    const [bg, a, b, ink] = pal;
    ell(c, x + s * 0.5, y + s * 0.4, s * 0.3, s * 0.3, a); ell(c, x + s * 0.58, y + s * 0.34, s * 0.2, s * 0.2, mix(a, bg, 0.5));
    for (let i = 0; i < 6; i++) { for (let xx = 0; xx < s; xx++) P(c, x + xx, y + floor(s * 0.62 + i * 3 + sin(xx * 0.25 + i) * 2), i % 2 ? b : ink); }
    R(c, floor(x + s * 0.12), floor(y + s * 0.08), floor(s * 0.1), floor(s * 0.45), ink);
  }
};
function wearSleeve(c, s, cond, r) {
  if (cond === "mint") {
    const p = A(c, 0.2); c.fillStyle = "#ffffff";
    const per = max(14, floor(s * 0.7));
    for (let py = 0; py < s; py++) for (let px = 0; px < s; px++) { const t = (px + py) % per; if (t < 3 && bayer(px, py) < 7) c.fillRect(px, py, 1, 1); }
    c.globalAlpha = p;
  } else if (cond === "vg+") {
    AR(c, 0, 0, 2, 1, "#ffffff", 0.55); AP(c, 0, 1, "#ffffff", 0.4);
    AR(c, 0, 0, 1, s, "#ffffff", 0.14);
    if (r() < 0.6) { const yy = floor(s * (0.3 + r() * 0.4)); AR(c, 0, yy, s, 1, "#ffffff", 0.07); }
  } else if (cond === "vg") {
    const cx = s / 2, cy = s / 2, rr = s * 0.4;
    for (let a = 0; a < 360; a += 3) { const px = round(cx + cos(a / 57.3) * rr), py = round(cy + sin(a / 57.3) * rr); if (bayer(px, py) < 11) AP(c, px, py, "#ffffff", 0.3); }
    AR(c, 0, s - 1, s, 1, "#d8cfa0", 0.5); AR(c, 0, 0, 3, 1, "#ffffff", 0.5); AR(c, 0, 0, 1, 3, "#ffffff", 0.5);
    for (let i = 0; i < s * 0.12; i++) AP(c, floor(r() * s), floor(r() * s), "#ffffff", 0.35);
    const px = floor(s * 0.1 + r() * s * 0.4), py = floor(s * 0.1 + r() * s * 0.6);
    for (let i = 0; i < 6; i++) AP(c, px + i, py + (i % 2), "#101018", 0.7);
  } else if (cond === "beat") {
    /* water stain */
    const sx = s * (r() < 0.5 ? 0.25 : 0.7), sy = s * 0.7, rad = s * 0.42;
    for (let py = 0; py < s; py++) for (let px = 0; px < s; px++) {
      const d = Math.hypot(px - sx, (py - sy) * 1.3) / rad;
      if (d < 1) { const edge = d > 0.82; if (edge && bayer(px, py) < 12) AP(c, px, py, "#4a2e1a", 0.55); else if (!edge && (1 - d) * 22 > bayer(px, py)) AP(c, px, py, "#8a6a3a", 0.5); }
    }
    /* split seam on the right + crease */
    for (let py = 0; py < s; py++) { if (r() < 0.7) { R(c, s - 1 - (py % 5 === 0 ? 2 : 1), py, 2, 1, "#0c0618"); } }
    for (let py = 0; py < s; py += 2) AP(c, s - 4, py, "#ffffff", 0.2);
    AR(c, 0, floor(s * 0.55), s, 1, "#ffffff", 0.14); AR(c, 0, floor(s * 0.55) + 1, s, 1, "#000000", 0.2);
    /* tape */
    poly(c, [[-2, floor(s * 0.2)], [floor(s * 0.3), -2], [floor(s * 0.3) + 7, -2], [-2, floor(s * 0.2) + 8]], "rgba(216,200,150,0.78)");
    /* torn corner */
    const tc = max(3, floor(s * 0.12));
    for (let i = 0; i < tc; i++) c.clearRect(s - (tc - i), s - 1 - i, tc - i, 1);
    if (s >= 56) { txt(c, "DJ COPY", 3, s - 8, "#0c0618", 1, 1); }
  }
}
/* returns an offscreen canvas holding the full sleeve (transparent where torn) */
const sleeveCache = new Map();
DK.sleeveCanvas = (rec, copy, s) => {
  const cond = copy ? copy.cond.id : "vg+", key = rec.id + "|" + cond + "|" + (copy ? copy.seed : 0) + "|" + s;
  let cv = sleeveCache.get(key); if (cv) return cv;
  if (sleeveCache.size > 400) sleeveCache.clear();
  cv = DK.cv(s, s);
  try { paintSleeve(cv.getContext("2d"), rec, s, copy); } catch (e) { const c = cv.getContext("2d"); R(c, 0, 0, s, s, "#2a1a3a"); }
  sleeveCache.set(key, cv);
  return cv;
};
function paintSleeve(c, rec, s, copy) {
  const r = mulberry(hashStr(rec.id)), fam = FAM[rec.genre] || "typo", pals = PALS[fam], pal = pals[floor(r() * pals.length)], v = r() < 0.5 ? 1 : 0;
  const bg = pal[0];
  R(c, 0, 0, s, s, bg);
  c.save(); c.beginPath(); c.rect(0, 0, s, s); c.clip();
  MOTIF[fam](c, 0, 0, s, pal, r, v, rec);
  c.restore();
  /* 7" company sleeve: paper with a die-cut hole and label peeking through */
  if (rec.format === "7\"") {
    R(c, 0, 0, s, s, "#d8c9a4"); for (let i = 0; i < s * s * 0.03; i++) P(c, floor(r() * s), floor(r() * s), r() < 0.5 ? "#c4b48c" : "#e6d9b8");
    const lab = labelColor(rec), hr = s * 0.3;
    ell(c, s / 2, s * 0.46, hr + 1, hr + 1, "#a89a74"); ell(c, s / 2, s * 0.46, hr, hr, "#0b0a12"); ell(c, s / 2, s * 0.46, hr * 0.55, hr * 0.55, lab); ell(c, s / 2, s * 0.46, 1, 1, "#d8c9a4");
    if (s >= 40) { txtC(c, DK.ascii(rec.artist).slice(0, floor((s - 4) / 4)), s / 2, floor(s * 0.86), "#3a2a1a", 1, 1); }
    c.globalAlpha = 1;
  } else if (s >= 40) {
    const ink = inkOn(bg), bar = s >= 64 ? 2 : 1, sc = s >= 70 ? 2 : 1;
    const art = DK.ascii(rec.artist).toUpperCase();
    const alines = wrap(art, s - 6, 1, 2);
    alines.forEach((L, i) => txtO(c, L, 3, 3 + i * 6, "#f4ead0", 1, "#0c0618"));
    const tl = wrap(rec.title, s - 6, 1, s >= 64 ? 3 : 2), th = tl.length * 6 + 3, bb = floor(s * 0.8);
    AR(c, 0, bb - th - 2, s, th + 2, "#0c0618", 0.86);
    R(c, 0, bb - th - 3, s, 1, pal[1]);
    tl.forEach((L, i) => txt(c, L, 3, bb - th + i * 6, "#f4ead0", 1, 1));
  }
  /* sleeve thickness: light top/left, shaded bottom/right */
  AR(c, 0, 0, s, 1, "#ffffff", 0.35); AR(c, 0, 0, 1, s, "#ffffff", 0.2); AR(c, 0, s - 1, s, 1, "#000000", 0.5); AR(c, s - 1, 0, 1, s, "#000000", 0.4);
  if (copy) wearSleeve(c, s, copy.cond.id, mulberry(copy.seed));
}
function labelColor(rec) {
  const L = ["#c0302c", "#2f62b8", "#ffd23f", "#e8e4f0", "#3fa66a", "#ff8a4c", "#7a3fb0", "#d8a030", "#39a0b8", "#1d1622"];
  return L[hashStr(rec.label || "x") % L.length];
}
DK.labelColor = labelColor;

/* ------------------------------------------------------------------ price stickers */
DK.sticker = (c, x, y, text, o) => {
  o = o || {}; text = DK.ascii(text);
  const w = txtW(text, 1, 1) + 5, h = 9;
  if (o.kind === "dot") {
    const rr = max(5, floor(w / 2)); ell(c, x + rr, y + rr, rr, rr, "#c0302c"); ell(c, x + rr - 1, y + rr - 1, rr - 1, rr - 1, "#ff5a4a");
    txtC(c, text, x + rr, y + rr - 2, "#ffffff", 1, 1); return rr * 2;
  }
  R(c, x + 1, y + 1, w, h, "rgba(0,0,0,0.35)");
  R(c, x, y, w, h, o.col || "#ffd23f"); R(c, x, y, w, 1, "#fff2a0"); R(c, x, y + h - 1, w, 1, "#c08a10"); R(c, x, y, 1, h, "#fff2a0"); R(c, x + w - 1, y, 1, h, "#c08a10");
  txt(c, text, x + 3, y + 2, "#1d1622", 1, 1);
  return w;
};
/* grade tag: small colored plaque */
DK.gradeTag = (c, x, y, cond) => {
  const t = cond.name, w = txtW(t, 1, 1) + 5;
  R(c, x, y, w, 9, "#0c0618"); R(c, x + 1, y + 1, w - 2, 7, cond.col); txt(c, t, x + 3, y + 2, "#0c0618", 1, 1); return w;
};

/* ------------------------------------------------------------------ vinyl painter */
const discCache = new Map();
/* static disc art (grooves, label, scuffs); the hole is transparent */
DK.discCanvas = (rec, copy, r) => {
  const key = rec.id + "|" + (copy ? copy.cond.id + copy.seed : "x") + "|" + r;
  let d = discCache.get(key); if (d) return d;
  if (discCache.size > 200) discCache.clear();
  const S = r * 2 + 1, cv = DK.cv(S, S), c = cv.getContext("2d"), rnd = mulberry(copy ? copy.seed + 7 : 99), cond = copy ? copy.cond.id : "vg+";
  const lab = labelColor(rec), lk = ramp(lab);
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const dd = Math.hypot(dx, dy); if (dd > r + 0.3) continue;
    const f = dd / r; let col;
    if (f > 0.985) col = "#05040a";
    else if (f > 0.95) col = "#1c1a28";
    else if (f < 0.07) continue;
    else if (f < 0.31) { col = lab; if (f > 0.27) col = lk[1]; else if (dx + dy < -r * 0.12) col = lk[3]; }
    else if (f < 0.36) col = "#06050c";
    else {
      const band = floor((f - 0.36) * r * 1.3), gap = abs(f - 0.62) < 0.012 || abs(f - 0.8) < 0.012 || abs(f - 0.9) < 0.012;
      col = gap ? "#222032" : (band % 3 === 0 ? "#171523" : band % 3 === 1 ? "#0e0c18" : "#0a0912");
    }
    c.fillStyle = col; c.fillRect(r + dx, r + dy, 1, 1);
  }
  /* label details */
  R(c, r - floor(r * 0.16), r - floor(r * 0.12), floor(r * 0.32), 1, lk[0]); R(c, r - floor(r * 0.12), r + floor(r * 0.1), floor(r * 0.24), 1, lk[0]);
  /* scuffs and scratches */
  const nS = { mint: 0, "vg+": 2, vg: 6, beat: 13 }[cond], polar = (rr, an) => [r + cos(an) * rr, r + sin(an) * rr];
  for (let i = 0; i < nS; i++) {
    const rr = r * (0.4 + rnd() * 0.55), a0 = rnd() * 6.283, len = (cond === "beat" ? 0.5 : 0.25) * (0.4 + rnd());
    for (let t = 0; t < len; t += 0.5 / rr) { const p = polar(rr + (rnd() - 0.5) * (cond === "beat" ? 0.8 : 0.3), a0 + t); AP(c, round(p[0]), round(p[1]), cond === "beat" ? "#cfcbe0" : "#8a86a0", cond === "beat" ? 0.75 : 0.45); }
  }
  if (cond === "vg" || cond === "beat") {
    const a0 = rnd() * 6.283, w = cond === "beat" ? 0.9 : 0.55;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const dd = Math.hypot(dx, dy) / r; if (dd < 0.4 || dd > 0.92) continue;
      let an = Math.atan2(dy, dx) - a0; an = Math.atan2(sin(an), cos(an));
      if (abs(an) < w && (1 - abs(an) / w) * 0.7 * (cond === "beat" ? 1.4 : 1) * 16 > bayer(dx + r, dy + r)) AP(c, r + dx, r + dy, "#6a668a", 0.5);
    }
  }
  if (cond === "beat") for (let i = 0; i < 3; i++) { const a = rnd() * 3.14, p0 = polar(r * 0.95, a), p1 = polar(r * 0.95, a + 3.14 + (rnd() - 0.5) * 0.8); line(c, p0[0], p0[1], p1[0], p1[1], "rgba(220,216,240,0.45)"); }
  d = { cv, r, S };
  discCache.set(key, d);
  return d;
};
/* draw the disc at center (cx,cy). o: {rot, warp (amp px), phase, sheen} */
DK.drawDisc = (c, cx, cy, d, o) => {
  o = o || {}; const r = d.r, x0 = round(cx - r), y0 = round(cy - r);
  c.imageSmoothingEnabled = false;
  /* shadow */
  AR(c, x0 + 2, y0 + r * 2 - 1, d.S - 4, 2, "#000000", 0.25);
  if (o.warp) {
    for (let row = 0; row < d.S; row++) {
      const off = round(sin(row * 0.32 + (o.phase || 0)) * o.warp);
      c.drawImage(d.cv, 0, row, d.S, 1, x0 + off, y0 + row, d.S, 1);
    }
  } else c.drawImage(d.cv, x0, y0);
  const rot = o.rot || 0;
  /* label notch */
  P(c, round(cx + cos(rot) * r * 0.2), round(cy + sin(rot) * r * 0.2), "#0c0618");
  /* sheen wedges */
  const pa = A(c, 0.1);
  for (let k = 0; k < 2; k++) {
    const a0 = (o.sheen != null ? o.sheen : rot * 0.0 + 0.9) + k * PI, w = 0.28;
    poly(c, [[cx, cy], [cx + cos(a0 - w) * r * 0.97, cy + sin(a0 - w) * r * 0.97], [cx + cos(a0) * r * 0.99, cy + sin(a0) * r * 0.99], [cx + cos(a0 + w) * r * 0.97, cy + sin(a0 + w) * r * 0.97]], "#ffffff");
  }
  c.globalAlpha = pa;
  if (o.warp) { /* bowed-record cue: faint diagonal band */ AR(c, x0 + floor(r * 0.5), y0 + 2, 2, d.S - 4, "#ffffff", 0.08); }
};

/* ------------------------------------------------------------------ wooden bin painters */
/* front board with end posts and a label placard. returns nothing. x,y = top-left, w, h */
DK.drawBinFront = (c, x, y, w, h, label, o) => {
  o = o || {}; const wood = o.wood || "#a06a46", k = ramp(wood), r = mulberry(hashStr(label || "bin"));
  R(c, x, y, w, h, wood);
  for (let i = 0; i < w * h / 24; i++) R(c, x + 3 + floor(r() * (w - 6)), y + 3 + floor(r() * (h - 5)), 2 + floor(r() * 7), 1, r() < 0.6 ? k[1] : k[3]);
  R(c, x, y + floor(h / 2), w, 1, k[0]); R(c, x, y + floor(h / 2) + 1, w, 1, k[3]);
  R(c, x, y, w, 2, k[4]); R(c, x, y + 2, w, 1, k[3]); R(c, x, y + h - 2, w, 2, k[0]);
  R(c, x, y, 3, h, wood); R(c, x, y, 1, h, k[4]); R(c, x + 2, y, 1, h, k[1]); R(c, x + w - 3, y, 3, h, wood); R(c, x + w - 3, y, 1, h, k[3]); R(c, x + w - 1, y, 1, h, k[0]);
  for (const nx of [x + 6, x + w - 7]) for (const ny of [y + 5, y + h - 6]) { P(c, nx, ny, k[0]); P(c, nx + 1, ny, k[3]); }
  if (label) DK.labelPlate(c, x + floor(w / 2), y + floor((h - 11) / 2) + 1, label, o.ink);
};
/* paper label plate centered on cx, top at y */
DK.labelPlate = (c, cx, y, label, ink) => {
  const t = DK.ascii(label).toUpperCase(), tw = txtW(t, 1, 1) + 10, lx = cx - floor(tw / 2), ly = y;
  R(c, lx + 1, ly + 1, tw, 11, "rgba(0,0,0,0.35)"); R(c, lx, ly, tw, 11, "#f4ead0"); R(c, lx, ly, tw, 1, "#ffffff"); R(c, lx, ly + 10, tw, 1, "#bfb08c"); R(c, lx, ly, 1, 11, "#fff8e0"); R(c, lx + tw - 1, ly, 1, 11, "#bfb08c");
  txt(c, t, lx + 5, ly + 3, ink || "#c0302c", 1, 1);
  P(c, lx + 2, ly + 5, "#8a6a4a"); P(c, lx + tw - 3, ly + 5, "#8a6a4a");
};
DK.drawBinBack = (c, x, y, w, h) => {
  R(c, x, y, w, h, "#150d17");
  for (let i = 0; i < h; i += 3) R(c, x + 3, y + i, w - 6, 1, i % 6 ? "#1b1220" : "#120b14");
};

/* ------------------------------------------------------------------ dust motes (in a light cone) */
DK.dust = (n, rect, rnd) => {
  const ps = []; rnd = rnd || Math.random;
  for (let i = 0; i < n; i++) ps.push({ x: rect[0] + rnd() * rect[2], y: rect[1] + rnd() * rect[3], vx: (rnd() - 0.5) * 3, vy: 1 + rnd() * 3, a: 0.3 + rnd() * 0.5, ph: rnd() * 6 });
  return {
    step(dt) { ps.forEach(p => { p.ph += dt; p.x += (p.vx + sin(p.ph * 0.9) * 2) * dt; p.y += p.vy * dt; if (p.y > rect[1] + rect[3]) { p.y = rect[1]; p.x = rect[0] + rnd() * rect[2]; } if (p.x < rect[0]) p.x = rect[0] + rect[2]; if (p.x > rect[0] + rect[2]) p.x = rect[0]; }); },
    draw(c) { ps.forEach(p => AP(c, round(p.x), round(p.y), "#fff6d8", p.a * (0.6 + 0.4 * sin(p.ph * 2)))); }
  };
};

/* ------------------------------------------------------------------ characters */
DK.chars = () => {
  const C = RP.chars; if (!C) return;
  if (!C.get("dk_mort")) C.define("dk_mort", { name: "Mort", height: 90, build: "stocky", skin: "#e8b48f", hair: { style: "bald", color: "#8a8a96" }, facial: "mustache", facialColor: "#9a9aa6",
    top: { style: "vest", color: "#6a4a2a", color2: "#efe6d0" }, bottom: { style: "pants", color: "#3a3a4a" }, shoes: { style: "shoes", color: "#2a1a14" }, acc: ["glasses", "cap"], hatColor: "#2a3a5a", voice: "#ffb870" });
  if (!C.get("dk_feld")) C.define("dk_feld", { name: "Mrs. Feld", height: 80, build: "thin", figure: "curvy", skin: "#f1c7a5", hair: { style: "bun", color: "#c8c8d4" },
    top: { style: "cardigan", color: "#8a5a7a", color2: "#efe6d0" }, bottom: { style: "skirt", color: "#4a3a5a" }, shoes: { style: "shoes", color: "#3a2a24" }, acc: ["glasses", "chain"], voice: "#e8b0ff" });
  if (!C.get("dk_ronnie")) C.define("dk_ronnie", { name: "Ronnie", height: 94, build: "big", skin: "#b07650", hair: { style: "buzz", color: "#1c1418" }, facial: "goatee", facialColor: "#1c1418",
    top: { style: "hoodie", color: "#c0302c", color2: "#17131f" }, bottom: { style: "cargo", color: "#4a4a3a" }, shoes: { style: "boots", color: "#2a1a14" }, acc: ["cap"], hatColor: "#17131f", voice: "#ff9a5a" });
  if (!C.get("dk_deacon")) C.define("dk_deacon", { name: "Deacon", height: 96, build: "thin", skin: "#6e4329", hair: { style: "short", color: "#c8c8d4" }, facial: "beard", facialColor: "#c8c8d4",
    top: { style: "cardigan", color: "#3a5a7a", color2: "#efe6d0", tie: true, tieColor: "#c0302c" }, bottom: { style: "pants", color: "#2a2a3a" }, shoes: { style: "shoes", color: "#2a1a14" }, acc: ["glasses"], voice: "#9be15d" });
  if (!C.get("dk_clerk")) C.define("dk_clerk", { name: "Clerk", height: 92, skin: "#e0a27a", hair: { style: "messy", color: "#3a2014" }, top: { style: "tee", color: "#7a3fb0", print: "logo" }, bottom: { style: "jeans", color: "#2f5a96" }, shoes: { style: "sneakers", color: "#efeaf6" }, acc: ["lanyard"], voice: "#d0a8ff" });
};
/* a small portrait canvas (32x32 logical) for dialogue boxes */
DK.portrait = id => {
  try { DK.chars(); const p = RP.chars.portrait(id, 32); p.className = "px dk-por"; return p; } catch (e) { return DK.cv(32, 32); }
};
/* typewriter into an element; returns a cancel function */
DK.typer = (host, elm, text, done, speed) => {
  if (DK.reduced() || !speed && speed !== 0) { /* instant when reduced or speed unset */ }
  if (DK.reduced() || speed === 0) { elm.textContent = text; if (done) done(); return () => {}; }
  let i = 0, dead = false;
  elm.textContent = "";
  const tick = () => { if (dead) return; i += 1; elm.textContent = text.slice(0, i); if (i < text.length) host.timeout(tick, speed || 18); else if (done) done(); };
  host.timeout(tick, speed || 18);
  return () => { dead = true; elm.textContent = text; };
};

/* ------------------------------------------------------------------ catalog helpers */
DK.catalog = () => (RP.data && RP.data.records) || [];
DK.recs = () => DK.catalog().filter(r => r && r.id);
DK.vibeOf = r => (r.vibe || []);
/* does a record satisfy a "want"? want {id, vibe, genre, maxPrice}; paid = price paid */
DK.matchWant = (rec, want, paid) => {
  if (!want) return true;
  if (want.id && rec.id !== want.id) return false;
  if (want.vibe && !(rec.vibe || []).includes(want.vibe)) return false;
  if (want.genre && String(rec.genre).toLowerCase() !== String(want.genre).toLowerCase() && !String(rec.genre).toLowerCase().includes(String(want.genre).toLowerCase())) return false;
  if (want.maxPrice != null && paid != null && paid > want.maxPrice + 1e-9) return false;
  return true;
};
DK.wantText = (want, rec) => {
  if (!want) return "Find something good.";
  const bits = [];
  if (want.id) { const r = rec || RP.rec(want.id); bits.push(r.artist + " – " + r.title); }
  if (want.vibe) bits.push("a " + String(want.vibe).toUpperCase());
  if (want.genre) bits.push(want.genre);
  if (want.maxPrice != null) bits.push("under " + DK.money(want.maxPrice));
  return bits.length ? (want.id ? "" : "WANT: ") + bits.join(", ") : "Find something good.";
};
/* the four set roles a record can carry (rec.vibe), in plain words. Same names and colours as the tags in crowd.Read. */
DK.ROLES = {
  warmup: { name: "WARMUP", col: "#62e6ff", def: "an easy, low-key opener" },
  builder: { name: "BUILDER", col: "#9be15d", def: "a steady record that keeps the floor climbing" },
  peak: { name: "PEAK", col: "#ffc44d", def: "a big, high-energy record for the busiest hour" },
  closer: { name: "CLOSER", col: "#c8b0ff", def: "the big, warm, sing-along last record" }
};
DK.rolesOf = r => ["warmup", "builder", "peak", "closer"].filter(v => ((r && r.vibe) || []).includes(v));
/* one plain-words line that explains the role in a want (empty when the want has no role) */
DK.wantHelp = want => {
  const R = want && want.vibe && DK.ROLES[want.vibe];
  return R ? R.name + " = " + R.def + ". LISTEN shows a record's role tag." : "";
};


/* ------------------------------------------------------------------ estate collection generator (crate.Digging) */
/* returns an array of record ids: a few gems, solid uncommons, cheesy commons, a couple of duplicates */
DK.estate = (rnd, diff, owned) => {
  owned = owned || new Set();
  const all = DK.recs(), N = [14, 16, 18, 20, 22][clamp(diff || 2, 1, 5) - 1];
  const used = new Set(), out = [];
  const take = (pred, n) => { const pool = DK.shuffle(all.filter(r => !used.has(r.id) && pred(r)), rnd).slice(0, max(0, n)); pool.forEach(r => { used.add(r.id); out.push(r.id); }); return pool; };
  const gems = diff >= 4 ? 3 : 2;
  take(r => r.rarity === "rare", gems);
  const unc = take(r => r.rarity === "uncommon", round(N * 0.42));
  const com = take(r => r.rarity === "common", N - out.length - 2);
  const dupSrc = DK.shuffle(unc.concat(com), rnd).slice(0, 2); dupSrc.forEach(r => out.push(r.id));
  return DK.shuffle(out, rnd);
};
/* dealer's offer for a copy (crate.Digging). mood 0.6..1, love: genre bonus */
DK.dealerOffer = (copy, mood, rate, love) => {
  if (copy.cond.id === "beat") return 0;
  const rare = copy.rec.rarity === "rare";
  let v = copy.worth * rate * (rare ? 0.62 : 1) * (mood == null ? 1 : mood) * (love && String(copy.rec.genre).includes(love) ? 1.3 : 1);
  return v < 1.6 ? 1 : round(v);
};

/* ------------------------------------------------------------------ shared CSS */
let cssDone = false;
DK.css = () => {
  if (cssDone) return; cssDone = true;
  const st = document.createElement("style"); st.setAttribute("data-digkit", "1");
  st.textContent = `
.dk { display: flex; flex-direction: column; gap: 8px; }
.dk canvas.px { image-rendering: pixelated; image-rendering: crisp-edges; display: block; margin: 0 auto; max-width: 100%; background: #07050f; border: 1px solid var(--line); box-sizing: content-box; }
.dk-cols { display: grid; grid-template-columns: 1fr; gap: 8px; align-items: start; }
@media (min-width: 820px) { .dk-cols { grid-template-columns: auto minmax(270px, 1fr); } .dk-cols.rev { grid-template-columns: minmax(270px, 1fr) auto; } }
.dk-hud { display: flex; flex-wrap: wrap; gap: 6px 14px; align-items: baseline; font-size: 21px; color: var(--muted); }
.dk-hud b { color: var(--fg); font-weight: 400; font-variant-numeric: tabular-nums; }
.dk-hud .want { color: var(--amber); flex: 1 1 100%; font-size: 21px; line-height: 1; }
.dk-say { display: grid; grid-template-columns: 64px 1fr; gap: 10px; align-items: center; min-height: 66px; background: #120e24; border: 1px solid var(--line); border-radius: 4px; padding: 6px 10px; }
.dk-say canvas.dk-por { width: 64px; height: 64px; image-rendering: pixelated; background: #0a0816; border: 1px solid #2d2456; display: block; }
.dk-say .who { font-size: 16px; color: var(--muted); letter-spacing: .06em; }
.dk-say .txt { font-size: 21px; line-height: 1.02; color: #ffd9a0; min-height: 2.05em; }
.dk-info { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.dk-title { font-size: 23px; line-height: 1; color: #fff; }
.dk-title small { display: block; font-size: 20px; color: var(--cyan); margin-top: 2px; }
.dk-meta { font-size: 18px; color: var(--muted); line-height: 1.05; }
.dk-meta b { color: var(--fg); font-weight: 400; }
.dk-grade { display: inline-block; font-family: var(--logo); font-size: 11px; padding: 3px 6px 2px; color: #0c0618; margin-right: 6px; vertical-align: 2px; }
.dk-note { font-size: 18px; color: #d8d0f4; line-height: 1.05; }
.dk-fact { font-size: 16px; color: var(--cyan); line-height: 1.05; border-left: 2px solid #2a6a80; padding-left: 8px; }
.dk-price { font-size: 30px; color: var(--amber); font-variant-numeric: tabular-nums; line-height: 1; }
.dk-price s { color: var(--muted); font-size: 21px; margin-right: 6px; }
.dk-buyrow { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.dk-buyrow .dk-price { flex: 0 0 auto; min-width: 54px; }
.dk-buyrow .dk-actions { flex: 1 1 200px; }
.dk-actions { display: flex; flex-wrap: wrap; gap: 6px; }
.dk-actions .btn, .dk-actions .kbtn { flex: 1 1 auto; }
.btn.sm { font-size: 20px; padding: 5px 10px; }
.dk-tabs { display: flex; flex-wrap: wrap; gap: 6px; }
.dk-tabs .kbtn { flex: 1 1 auto; touch-action: manipulation; padding: 5px 8px; font-size: 18px; }
.dk-tabs .kbtn.on { border-color: var(--amber); color: var(--amber); background: #2a2010; }
.dk .kbtn { touch-action: manipulation; }
.dk-short { filter: saturate(.25) brightness(.75); }
.dk-keys { font-size: 16px; color: var(--muted); line-height: 1.05; }
.dk-keys kbd { font-family: var(--ui); color: var(--cyan); border: 1px solid #3a3070; border-radius: 2px; padding: 0 4px; background: #110d24; }
.dk-pips { display: inline-flex; gap: 3px; vertical-align: middle; margin-left: 4px; }
.dk-pips i { width: 9px; height: 9px; background: var(--pink); display: inline-block; border: 1px solid #12061a; }
.dk-pips i.off { background: #2a2050; }
.dk-bar { height: 12px; background: #1a1534; border: 1px solid #3a3070; position: relative; overflow: hidden; }
.dk-bar i { position: absolute; left: 0; top: 0; bottom: 0; background: var(--ok); }
.dk-bar.warn i { background: var(--amber); } .dk-bar.bad i { background: #ff5a5a; }
@media (max-width: 520px) {
  .dk { gap: 6px; }
  .dk-say { grid-template-columns: 44px 1fr; min-height: 52px; padding: 4px 8px; gap: 8px; }
  .dk-say canvas.dk-por { width: 44px; height: 44px; }
  .dk-say .txt { font-size: 19px; min-height: 2.04em; }
  .dk-keys { display: none; }
  .dk-title { font-size: 21px; } .dk-title small { font-size: 18px; }
  .dk-meta, .dk-note { font-size: 17px; }
  .dk-price { font-size: 26px; }
  .dk-hud { font-size: 19px; gap: 2px 12px; } .dk-hud .want { font-size: 19px; }
  .dk-actions .btn.sm { font-size: 19px; padding: 5px 8px; }
}
.dk-end { display: flex; flex-direction: column; gap: 10px; align-items: stretch; }
.dk-end h2 { font-family: var(--logo); font-weight: 400; font-size: clamp(16px, 3.4vw, 24px); margin: 0; color: #fff; line-height: 1.25; }
.dk-end h2.ok { color: var(--ok); } .dk-end h2.bad { color: #ff7a7a; }
.dk-score { font-family: var(--logo); font-size: 34px; color: var(--amber); }
.dk-score small { font-size: 12px; color: var(--muted); margin-left: 6px; }
.dk-bag { display: flex; flex-wrap: wrap; gap: 8px; }
.dk-bagitem { display: grid; grid-template-columns: 56px 1fr; gap: 8px; align-items: center; background: #0f0b20; border: 1px solid #241d48; padding: 4px; min-width: 0; flex: 1 1 240px; }
.dk-bagitem canvas { width: 56px; height: 56px; image-rendering: pixelated; }
.dk-bagitem div { font-size: 18px; line-height: 1.02; color: var(--fg); min-width: 0; }
.dk-bagitem div small { display: block; color: var(--muted); font-size: 16px; }
.dk-lines { font-size: 20px; line-height: 1.1; color: var(--fg); }
.dk-lines div { display: flex; justify-content: space-between; gap: 12px; border-bottom: 1px dashed #2d2456; padding: 2px 0; }
.dk-lines div span:last-child { color: var(--amber); font-variant-numeric: tabular-nums; text-align: right; }
.dk-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.dk .btn:focus-visible, .dk .kbtn:focus-visible, .dk canvas:focus-visible { outline: 2px solid var(--cyan); outline-offset: 1px; }
@keyframes dkpulse { 50% { opacity: .35; } }
.dk-blink { animation: dkpulse 1s steps(1) infinite; }
@media (prefers-reduced-motion: reduce) { .dk-blink { animation: none; } }
`;
  document.head.appendChild(st);
};
})();
