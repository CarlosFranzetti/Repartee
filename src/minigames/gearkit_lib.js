/* gearkit_lib.js — shared art + audio for buy.Gear: Eddie's van, the boutique showroom,
   pixel gear sprites, inspection close-ups (strobe dot!), receipts, and the test-tone synth.
   Loaded after buygear.js (alphabetical), so it is only ever touched inside play().
   Everything hangs off RP.gearkit (GK). All drawing is integer-pixel, ramps + Bayer dither.
     GK.vanBG() / GK.vanFG(c,t)            Eddie's van interior (cached 320x140 canvas) + animated bits
     GK.boutiqueBG() / GK.boutiqueFG(c,t)  the velvet showroom
     GK.item(c, vk, x, yBase, o)           gear sprite for the blanket / stand (returns bbox)
     GK.tag(c, x, y, text, o)              price tag
     GK.closeup(c, vk, o, fx, t)           160x120 inspection view (platter + strobe, jog, mixer, monitors, cans)
     GK.paper(c, o)                        serial plate + receipt card
     GK.tone(opts)                         wobbling / crackling / humming test tone (silent-safe)
     GK.vkind(gear), GK.nch(gear), GK.reduced() */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u;
const { R, P, ell, line, poly, bayer, mulberry, txt, txtC, txtW, mix, ramp, clamp, mk } = U;
const GK = RP.gearkit = {};
GK.W = 320; GK.H = 140; GK.CW = 160; GK.CH = 120;
GK.reduced = () => { try { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) { return false; } };

/* gear -> visual family */
GK.vkind = g => !g ? "box" : g.kind === "turntable" ? "turntable" : g.slot === "decks" ? "cdj" : g.slot === "mixer" ? "mixer" : g.slot === "monitors" ? "monitor" : g.slot === "headphones" ? "headphones" : "box";
GK.nch = g => !g ? 2 : g.kind === "mixer_4ch" ? 4 : g.kind === "mixer_2ch" ? 2 : /4/.test(g.model) ? 4 : 2;

/* ------------------------------------------------------------------ helpers */
const D = (c, x, y, w, h, col, dens) => {           // Bayer-dithered rect, dens 0..16
  c.fillStyle = col;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (bayer(x + i, y + j) < dens) c.fillRect(x + i, y + j, 1, 1);
};
function ring(c, cx, cy, rx, ry, col, a0 = 0, a1 = Math.PI * 2) {
  c.fillStyle = col;
  const n = Math.max(24, Math.ceil((rx + ry) * 5));
  for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; c.fillRect(Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry), 1, 1); }
}
function disc(c, cx, cy, r, base) {
  const q = ramp(base);
  ell(c, cx, cy, r, r, q[1]);
  ell(c, cx - 1, cy - 1, Math.max(1, r - 1), Math.max(1, r - 1), q[2]);
  if (r > 3) ell(c, cx - 1, cy - 2, Math.max(1, r - 3), Math.max(1, r - 3), q[3]);
  if (r > 5) P(c, cx - Math.round(r * 0.5), cy - Math.round(r * 0.55), q[4]);
}
function bevel(c, x, y, w, h, base) {
  const q = ramp(base);
  R(c, x, y, w, h, q[2]); R(c, x, y, w, 1, q[3]); R(c, x, y, 1, h, q[3]); R(c, x, y + h - 1, w, 1, q[1]); R(c, x + w - 1, y, 1, h, q[1]);
}
function shadow(c, cx, cy, rx, ry, dens = 9) {
  c.fillStyle = "#0a0410";
  for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1 && bayer(cx + x, cy + y) < dens) c.fillRect(cx + x, cy + y, 1, 1);
}
const lerp = (a, b, t) => a + (b - a) * t;
const hexA = h => U.hex(h);
const swapLetters = s => { const a = String(s).split(""); if (a.length > 3) { const i = Math.floor(a.length / 2); const t = a[i]; a[i] = a[i + 1]; a[i + 1] = t; } return a.join(""); };

/* radial light: dithered palette shift toward a violet dark, plus a warm glow, around (lx, ly) */
function lightPass(c, w, h, lx, ly, rad, o) {
  o = o || {};
  const dark = o.dark || [16, 8, 36], glow = o.glow || [255, 226, 160], str = o.strength == null ? 0.78 : o.strength, gr = o.glowR || 0.35, gs = o.glowS == null ? 0.4 : o.glowS;
  const id = c.getImageData(0, 0, w, h), d = id.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4, b = (bayer(x, y) + 0.5) / 16;
    const dist = Math.hypot((x - lx) * 0.8, (y - ly) * 1.15) / rad;
    const f = clamp(1 - (dist - 0.22) / 0.9, 0, 1);
    const q = clamp(Math.floor(f * 5 + b) / 5, 0, 1), k = (1 - q) * str;
    d[i] += (dark[0] - d[i]) * k; d[i + 1] += (dark[1] - d[i + 1]) * k; d[i + 2] += (dark[2] - d[i + 2]) * k;
    if (gs > 0) {
      const g = Math.pow(clamp(1 - dist / gr, 0, 1), 1.4), gq = Math.floor(g * 4 + b) / 4 * gs;
      if (gq > 0) { d[i] += (glow[0] - d[i]) * gq; d[i + 1] += (glow[1] - d[i + 1]) * gq; d[i + 2] += (glow[2] - d[i + 2]) * gq; }
    }
  }
  c.putImageData(id, 0, 0);
}

/* ------------------------------------------------------------------ EDDIE'S VAN */
let vanCache = null;
GK.vanBG = function () {
  if (vanCache) return vanCache;
  const cv = mk(GK.W, GK.H), c = cv.getContext("2d", { willReadFrequently: true });
  const rnd = mulberry(1993);
  const metal = ramp("#4a4660"), wood = ramp("#8a6446"), floor = ramp("#7a5a42");
  // ceiling
  R(c, 0, 0, 320, 13, metal[0]); R(c, 0, 11, 320, 2, metal[1]);
  for (let x = 6; x < 320; x += 24) { R(c, x, 0, 2, 11, metal[1]); R(c, x + 2, 0, 1, 11, metal[2]); }
  // plywood wall, planks with grain
  for (let x = 0, i = 0; x < 320; x += 20, i++) {
    R(c, x, 13, 20, 74, wood[i % 2 ? 2 : 1]);
    R(c, x, 13, 1, 74, wood[0]); R(c, x + 1, 13, 1, 74, wood[3]);
  }
  for (let i = 0; i < 160; i++) P(c, rnd() * 320, 14 + rnd() * 72, wood[rnd() < 0.5 ? 1 : 2]);
  for (let i = 0; i < 40; i++) { const gx = rnd() * 320, gy = 16 + rnd() * 66; R(c, gx, gy, 1 + rnd() * 5, 1, wood[1]); }
  // steel rail + rivets
  R(c, 0, 50, 320, 3, metal[2]); R(c, 0, 50, 320, 1, metal[3]); R(c, 0, 53, 320, 1, metal[0]);
  for (let x = 8; x < 320; x += 24) P(c, x, 51, metal[4]);
  // wheel arch (left) + door frame (right)
  // shelf with stuff
  R(c, 6, 41, 82, 3, wood[3]); R(c, 6, 44, 82, 1, wood[0]); R(c, 12, 45, 2, 5, metal[0]); R(c, 80, 45, 2, 5, metal[0]);
  // blue milk crate with sleeves
  bevel(c, 10, 28, 26, 13, "#2f62b8");
  for (let x = 12; x < 34; x += 3) { R(c, x, 28, 2, 13, "#1d3f7a"); }
  const slv = ["#ff3fa4", "#efe6d0", "#ffd23f", "#39d0ff", "#9be15d", "#c0302c", "#efeaf6"];
  for (let i = 0; i < 7; i++) { const sh = 4 + (i * 5) % 6; R(c, 12 + i * 3, 28 - sh, 3, sh, slv[i % slv.length]); R(c, 12 + i * 3, 28 - sh, 3, 1, "#ffffff"); }
  // cable coils
  [[42, 36], [52, 37]].forEach(([cx, cy]) => { ring(c, cx, cy, 6, 4, "#14101c"); ring(c, cx, cy, 5, 3, "#2a2436"); ring(c, cx, cy, 3, 2, "#14101c"); P(c, cx - 5, cy - 1, "#e0a040"); });
  // boombox
  bevel(c, 62, 29, 24, 12, "#8a8698"); disc(c, 68, 36, 3, "#2a2634"); disc(c, 80, 36, 3, "#2a2634"); R(c, 71, 31, 6, 3, "#14101c"); R(c, 70, 28, 8, 1, metal[3]);
  // flyer
  R(c, 98, 18, 20, 26, "#1b1440"); R(c, 98, 18, 20, 1, "#3a2f78"); txtC(c, "NO", 108, 22, "#ff3fa4", 1); txtC(c, "WHERE", 108, 29, "#39d0ff", 1); R(c, 101, 37, 14, 1, "#ffd23f"); txtC(c, "SAT", 108, 39, "#efeaf6", 1);
  P(c, 98, 18, "#c0b0e0"); P(c, 117, 18, "#c0b0e0");
  // cardboard sign on strings
  line(c, 154, 13, 160, 18, "#2a1c14"); line(c, 226, 13, 220, 18, "#2a1c14");
  const card = ramp("#c8925a");
  R(c, 150, 18, 82, 29, card[2]); R(c, 150, 18, 82, 1, card[3]); R(c, 150, 46, 82, 1, card[1]); R(c, 150, 18, 1, 29, card[3]); R(c, 231, 18, 1, 29, card[1]);
  for (let i = 0; i < 30; i++) P(c, 152 + rnd() * 78, 20 + rnd() * 25, rnd() < 0.5 ? card[1] : card[3]);
  txtC(c, "EDDIE'S", 191, 21, "#2a1018", 2, 1); txtC(c, "AUDIO + THINGS", 191, 36, "#c0302c", 1); txtC(c, "NO REFUNDS", 191, 41, "#2a1018", 1);
  // outside (right): sodium night street through the open doors
  const ox = 262;
  for (let y = 13; y < 100; y++) for (let x = ox; x < 320; x++) {
    const t = (y - 13) / 86 + (bayer(x, y) / 16 - 0.5) * 0.2;
    const cols = ["#2a1450", "#4a1d66", "#8a3a6e", "#d8663e", "#ffb04a"];
    P(c, x, y, cols[clamp(Math.floor(t * 5), 0, 4)]);
  }
  for (let bx = ox, k = 0; bx < 320; k++) { const bw = 9 + (k * 7) % 9, bh = 20 + (k * 13) % 30; R(c, bx, 100 - bh, bw, bh, k % 2 ? "#2a1430" : "#3a1c3c"); for (let wy = 100 - bh + 3; wy < 96; wy += 6) for (let wx = bx + 2; wx < bx + bw - 2; wx += 4) if ((wx + wy + k) % 3) P(c, wx, wy, "#ffd27a"); bx += bw; }
  R(c, 306, 36, 2, 64, "#1a1020"); R(c, 300, 36, 9, 2, "#1a1020"); ell(c, 300, 40, 2, 1, "#ffe2a0");
  D(c, 286, 30, 30, 20, "#ffe2a0", 3);
  // door frame + swung door
  R(c, 256, 13, 6, 87, metal[1]); R(c, 256, 13, 1, 87, metal[3]); R(c, 261, 13, 1, 87, metal[0]);
  for (let y = 22; y < 96; y += 30) { R(c, 255, y, 8, 3, metal[0]); P(c, 258, y + 1, metal[4]); }
  R(c, 314, 13, 6, 87, metal[0]); R(c, 314, 13, 1, 87, metal[2]);
  // floor
  R(c, 0, 86, 320, 54, floor[1]);
  R(c, 0, 86, 320, 2, "#2a1c14"); R(c, 0, 88, 320, 1, floor[3]);
  [94, 103, 114, 127].forEach((y, i) => { R(c, 0, y, 320, 1, floor[0]); R(c, 0, y + 1, 320, 1, floor[2]); });
  for (let i = 0; i < 360; i++) P(c, rnd() * 320, 89 + rnd() * 50, rnd() < 0.5 ? floor[0] : floor[3]);
  for (let y = 89; y < 140; y += 1) for (let x = 0; x < 320; x++) if ((y > 100) && bayer(x, y) < (y - 100) / 8 && rnd() < 0.1) P(c, x, y, floor[2]);
  // blanket: tartan in perspective
  const T0 = 98, T1 = 137, XL0 = 18, XR0 = 242, XL1 = 3, XR1 = 256;
  const bl = ramp("#a8283a");
  poly(c, [[XL0, T0], [XR0, T0], [XR1, T1], [XL1, T1]], bl[2]);
  const bx = (k, y) => { const t = (y - T0) / (T1 - T0); return lerp(lerp(XL0, XR0, k), lerp(XL1, XR1, k), t); };
  const bands = [[0.10, 0.17, "#2a3a6a"], [0.46, 0.54, "#2a3a6a"], [0.83, 0.90, "#2a3a6a"], [0.27, 0.285, "#efe0b0"], [0.68, 0.695, "#efe0b0"], [0.035, 0.045, "#efe0b0"], [0.955, 0.965, "#efe0b0"]];
  for (let y = T0; y <= T1; y++) {
    bands.forEach(([ka, kb, col]) => { const x0 = Math.round(bx(ka, y)), x1 = Math.max(x0 + 1, Math.round(bx(kb, y))); c.fillStyle = col; c.fillRect(x0, y, x1 - x0, 1); });
  }
  [[T0 + 7, 3, "#2a3a6a"], [T0 + 17, 1, "#efe0b0"], [T0 + 27, 4, "#2a3a6a"], [T0 + 35, 1, "#efe0b0"]].forEach(([y, hh, col]) => { for (let j = 0; j < hh; j++) { const xa = Math.round(bx(0, y + j)), xb = Math.round(bx(1, y + j)); R(c, xa, y + j, xb - xa, 1, col); } });
  for (let y = T0; y <= T1; y++) { const xa = Math.round(bx(0, y)), xb = Math.round(bx(1, y)); for (let x = xa; x < xb; x++) if (bayer(x, y) < 3) { c.fillStyle = "#14081c"; c.fillRect(x, y, 1, 1); } P(c, xa, y, bl[0]); P(c, xb - 1, y, bl[0]); }
  for (let x = Math.round(bx(0, T1)); x < Math.round(bx(1, T1)); x += 2) { R(c, x, T1 + 1, 1, 2, "#efe0b0"); }
  // light: warm bulb at (125, 15)
  lightPass(c, 320, 140, 125, 30, 190, { glowR: 0.3, glowS: 0.34 });
  vanCache = cv;
  return cv;
};

const FAIRY = ["#ff3fa4", "#39d0ff", "#ffc44d", "#9be15d", "#c8b0ff"];
GK.vanFG = function (c, t, o = {}) {
  // fairy lights along the ceiling
  const red = o.reduced;
  for (let i = 0; i < 13; i++) {
    const x = 6 + i * 20, y = 14 + Math.round(Math.sin(i / 12 * Math.PI) * 0 + ((i % 2) ? 2 : 0));
    const on = red ? (i % 3 !== 0) : (Math.floor(t * 1.6 + i * 0.7) % 3 !== 0);
    const col = FAIRY[i % FAIRY.length];
    P(c, x, y - 1, "#14101c"); R(c, x - 1, y, 3, 3, on ? col : mix(col, "#14101c", 0.7));
    if (on) { D(c, x - 3, y - 2, 7, 7, col, 3); P(c, x, y, "#ffffff"); }
  }
  // bulb + cord
  R(c, 125, 12, 1, 3, "#14101c"); ell(c, 125, 17, 2, 3, "#fff4d6"); P(c, 124, 16, "#ffffff");
  const fl = red ? 0 : (Math.sin(t * 23) > 0.96 ? 1 : 0);
  D(c, 117, 9, 17, 17, "#ffe2a0", fl ? 2 : 4);
};

/* ------------------------------------------------------------------ BOUTIQUE SHOWROOM */
let botCache = null;
GK.boutiqueBG = function () {
  if (botCache) return botCache;
  const cv = mk(GK.W, GK.H), c = cv.getContext("2d", { willReadFrequently: true });
  const rnd = mulberry(1971);
  // back wall: deep teal, panelled
  const wl = ramp("#1f4a52");
  R(c, 0, 0, 320, 96, wl[1]);
  for (let x = 0; x < 320; x += 1) for (let y = 0; y < 96; y++) if (bayer(x, y) < 3 && (x + y) % 2 === 0) P(c, x, y, wl[2]);
  // wainscot panels
  R(c, 0, 64, 320, 32, wl[0]); R(c, 0, 64, 320, 1, wl[3]); R(c, 0, 65, 320, 1, wl[1]);
  for (let x = 14; x < 320; x += 52) { R(c, x, 70, 40, 22, wl[1]); R(c, x, 70, 40, 1, wl[2]); R(c, x, 91, 40, 1, wl[0]); R(c, x, 70, 1, 22, wl[0]); R(c, x + 39, 70, 1, 22, wl[2]); }
  // crown + gilt rail
  R(c, 0, 0, 320, 8, "#14202a"); R(c, 0, 8, 320, 2, "#c89a3a"); R(c, 0, 10, 320, 1, "#7a5a1e");
  // arch niche behind the stand
  const cx = 150;
  ell(c, cx, 50, 44, 40, "#10282e"); R(c, cx - 44, 50, 89, 46, "#10282e");
  ring(c, cx, 50, 44, 40, "#c89a3a", Math.PI, Math.PI * 2); ring(c, cx, 50, 45, 41, "#7a5a1e", Math.PI, Math.PI * 2);
  R(c, cx - 45, 50, 1, 46, "#c89a3a"); R(c, cx + 44, 50, 1, 46, "#c89a3a");
  // framed record on the wall
  R(c, 224, 22, 24, 24, "#c89a3a"); R(c, 226, 24, 20, 20, "#10282e"); ell(c, 236, 34, 8, 8, "#0e0c14"); ell(c, 236, 34, 3, 3, "#e0368f"); P(c, 236, 34, "#efeaf6");
  R(c, 82, 26, 18, 14, "#c89a3a"); R(c, 84, 28, 14, 10, "#efe0b0"); txtC(c, "BCN", 91, 30, "#1f4a52", 1); txtC(c, "MR", 91, 35, "#c0302c", 1);
  // velvet curtains with folds
  const vv = ramp("#7a1630");
  const curtain = (x0, x1, flip) => {
    for (let x = x0; x < x1; x++) {
      const k = (x - x0) % 9, fold = k < 2 ? 0 : k < 5 ? 2 : k < 7 ? 3 : 1;
      R(c, x, 0, 1, 100, vv[fold]);
      for (let y = 0; y < 100; y++) if (bayer(x, y) < 2 + fold) { c.fillStyle = vv[Math.max(0, fold - 1)]; c.fillRect(x, y, 1, 1); }
    }
    R(c, flip ? x0 : x1 - 1, 0, 1, 100, vv[0]);
  };
  curtain(0, 34, false); curtain(286, 320, true);
  R(c, 0, 0, 320, 7, vv[0]); R(c, 0, 7, 320, 1, vv[3]);
  for (let x = 0; x < 320; x += 12) { R(c, x, 6, 6, 3, "#c89a3a"); }
  // floor: perspective checker tile (teal / ochre)
  { let y = 98, r = 0; const cols = ["#1c3a40", "#5a4228"];
    while (y < 140) {
      const h = 4 + r * 2, tw = 20 + r * 14, off = (r % 2) * (tw / 2);
      for (let i = -2; i * tw < 340; i++) { const x0 = Math.round(i * tw + off); R(c, x0, y, tw, Math.min(h, 140 - y), cols[(((i + r) % 2) + 2) % 2]); R(c, x0, y, 1, Math.min(h, 140 - y), "#0e1a1e"); }
      R(c, 0, y, 320, 1, "#0e1a1e"); y += h; r++;
    }
  }
  for (let x = 0; x < 320; x++) { P(c, x, 96, "#c89a3a"); P(c, x, 97, "#7a5a1e"); }
  // stand: velvet-draped plinth
  const pv = ramp("#4a1230");
  R(c, cx - 38, 100, 76, 36, pv[2]); R(c, cx - 38, 100, 76, 3, pv[4]); R(c, cx - 38, 103, 76, 1, pv[3]);
  for (let x = cx - 38; x < cx + 38; x += 6) { R(c, x, 104, 2, 32, pv[1]); R(c, x + 2, 104, 1, 32, pv[3]); }
  R(c, cx - 38, 134, 76, 2, "#c89a3a"); R(c, cx - 38, 136, 76, 1, "#7a5a1e");
  for (let x = cx - 38; x < cx + 38; x += 3) { R(c, x, 137, 1, 3, "#c89a3a"); }
  // brass plaque
  R(c, cx - 14, 124, 28, 8, "#c89a3a"); R(c, cx - 13, 125, 26, 6, "#7a5a1e"); txtC(c, "HAND WIRED", cx, 126, "#ffe2a0", 1);
  // rope stanchions
  [[70], [232]].forEach(([sx]) => { R(c, sx, 108, 3, 26, "#c89a3a"); R(c, sx - 3, 133, 9, 2, "#7a5a1e"); ell(c, sx + 1, 107, 3, 3, "#ffe2a0"); });
  for (let i = 0; i < 40; i++) { const t = i / 39, sag = Math.sin(t * Math.PI) * 5; P(c, 71 + t * 77, 109 + sag, "#7a1630"); P(c, 71 + t * 77, 110 + sag, "#4a1230"); }
  for (let i = 0; i < 40; i++) { const t = i / 39, sag = Math.sin(t * Math.PI) * 5; P(c, 152 + t * 80, 109 + sag, "#7a1630"); P(c, 152 + t * 80, 110 + sag, "#4a1230"); }
  // spotlight cone from above the stand (dithered lighten)
  lightPass(c, 320, 140, cx, 70, 230, { strength: 0.7, glowS: 0 });
  { const id = c.getImageData(0, 0, 320, 140), d = id.data;
    for (let y = 11; y < 124; y++) { const w = 9 + (y - 11) * 0.5, t = (y - 11) / 113;
      for (let x = Math.round(cx - w); x <= Math.round(cx + w); x++) {
        if (x < 0 || x >= 320) continue;
        const e = Math.abs(x - cx) / w, g = Math.pow(1 - e, 1.1) * (0.5 - t * 0.22), q = Math.floor(g * 5 + (bayer(x, y) + 0.5) / 16) / 5;
        if (q > 0) { const i = (y * 320 + x) * 4; d[i] += (255 - d[i]) * q * 0.55; d[i + 1] += (236 - d[i + 1]) * q * 0.55; d[i + 2] += (176 - d[i + 2]) * q * 0.55; }
      } }
    c.putImageData(id, 0, 0); }
  R(c, cx - 7, 8, 14, 3, "#14101c"); R(c, cx - 5, 10, 10, 1, "#ffe2a0");
  botCache = cv;
  return cv;
};
GK.boutiqueFG = function (c, t, o = {}) {
  // dust motes in the spotlight
  if (o.reduced) return;
  for (let i = 0; i < 12; i++) {
    const x = 150 + Math.sin(t * 0.4 + i * 2.1) * (10 + i * 2.2), y = 20 + ((t * (4 + i % 4) * 2 + i * 17) % 96);
    P(c, x, y, i % 3 ? "#ffe2a0" : "#ffffff");
  }
};

/* ------------------------------------------------------------------ SPRITES (blanket / stand view) */
function brandAccent(g) {
  const b = (g && g.brand || "").toLowerCase();
  return /technics/.test(b) ? "#ff9a2a" : /numark/.test(b) ? "#39a8ff" : /audio-technica/.test(b) ? "#9be15d" : /pioneer/.test(b) ? "#39d0ff" : /krk/.test(b) ? "#ffd23f" : /dynaudio/.test(b) ? "#c8c8d8" : /sennheiser/.test(b) ? "#e8e8f0" : /can electric/.test(b) ? "#ffd27a" : "#ff3fa4";
}
GK.accent = brandAccent;

const SPR = {};
SPR.turntable = (c, x, yb, o) => {
  const body = ramp(o.body || "#26222f"), pl = ramp("#aaa6bc"), acc = o.accent || "#ff3fa4";
  R(c, x - 27, yb - 26, 54, 18, body[2]); R(c, x - 27, yb - 26, 54, 1, body[4]); R(c, x - 27, yb - 26, 1, 18, body[3]); R(c, x + 26, yb - 26, 1, 18, body[1]);
  R(c, x - 27, yb - 8, 54, 8, body[1]); R(c, x - 27, yb - 8, 54, 1, body[3]); R(c, x - 27, yb - 1, 54, 1, body[0]);
  R(c, x - 26, yb, 5, 2, body[0]); R(c, x + 21, yb, 5, 2, body[0]);
  for (let i = 0; i < 5; i++) R(c, x - 22 + i * 4, yb - 5, 2, 1, body[0]);
  // platter
  const px = x - 7, py = yb - 17;
  ell(c, px + 1, py + 2, 20, 7, body[0]);
  ell(c, px, py, 20, 7, pl[1]); ell(c, px, py - 1, 20, 6, pl[3]); ell(c, px, py - 1, 19, 6, pl[2]);
  for (let a = 0; a < 40; a++) { const an = a / 40 * Math.PI * 2; P(c, px + Math.cos(an) * 19, py - 1 + Math.sin(an) * 6, a % 2 ? "#14121c" : pl[3]); }
  ell(c, px, py - 1, 17, 5, "#0e0c14"); ell(c, px, py - 1, 14, 4, "#181522");
  D(c, px - 14, py - 5, 14, 3, "#3a3550", 5);
  ell(c, px, py - 1, 5, 2, o.label || acc); P(c, px, py - 1, "#ffffff");
  // tonearm
  disc(c, x + 20, yb - 22, 2, "#d8d4e8"); line(c, x + 20, yb - 22, x + 4, yb - 16, "#e8e4f4"); line(c, x + 20, yb - 21, x + 4, yb - 15, "#8a86a0"); R(c, x + 1, yb - 17, 4, 3, "#14121c");
  if (o.noNeedle) P(c, x + 2, yb - 16, "#c8a050"); else { R(c, x + 1, yb - 17, 3, 2, "#c0c4d0"); P(c, x + 2, yb - 14, "#ffd23f"); }
  // pitch fader + start button
  R(c, x + 21, yb - 20, 4, 11, body[0]); R(c, x + 22, yb - 19, 2, 9, "#0a0810"); R(c, x + 20, yb - 15, 6, 2, "#e8e4f4"); R(c, x + 20, yb - 13, 6, 1, "#8a86a0");
  R(c, x - 25, yb - 13, 5, 4, "#c8c4d8"); R(c, x - 25, yb - 13, 5, 1, "#ffffff");
  if (o.on !== false) P(c, x - 24, yb - 15, acc);
  if (o.cover === false) { /* honest wear */ R(c, x - 26, yb - 24, 3, 1, body[4]); }
  return [x - 27, yb - 26, 54, 28];
};
SPR.cdj = (c, x, yb, o) => {
  const body = ramp("#2c2937"), acc = o.accent || "#39d0ff", big = (o.tier || 1) >= 2;
  const w = big ? 46 : 40;
  R(c, x - w / 2, yb - 31, w, 22, body[2]); R(c, x - w / 2, yb - 31, w, 1, body[4]); R(c, x - w / 2, yb - 31, 1, 22, body[3]); R(c, x + w / 2 - 1, yb - 31, 1, 22, body[1]);
  R(c, x - w / 2, yb - 9, w, 9, body[1]); R(c, x - w / 2, yb - 9, w, 1, body[3]); R(c, x - w / 2, yb - 1, w, 1, body[0]);
  R(c, x - w / 2 + 1, yb, 5, 2, body[0]); R(c, x + w / 2 - 6, yb, 5, 2, body[0]);
  // screen
  R(c, x - w / 2 + 3, yb - 29, w - 8 - (big ? 4 : 0), 8, "#0a1822"); R(c, x - w / 2 + 4, yb - 28, w - 10 - (big ? 4 : 0), 6, "#0d3048");
  for (let i = 0; i < w - 14; i += 2) R(c, x - w / 2 + 5 + i, yb - 25 - ((i * 7) % 3), 1, 2 + ((i * 7) % 3), big ? acc : "#39ff8a");
  // jog
  const jx = x - 4, jy = yb - 14;
  ell(c, jx, jy + 1, 15, 7, body[0]); ell(c, jx, jy, 15, 7, "#c8c4d8"); ell(c, jx, jy - 1, 14, 6, "#8a86a0"); ell(c, jx, jy - 1, 12, 5, "#1a1824"); ell(c, jx, jy - 1, 6, 3, "#3a3548");
  for (let a = 0; a < 16; a++) { const an = a / 16 * Math.PI * 2; P(c, jx + Math.cos(an) * 10, jy - 1 + Math.sin(an) * 4, acc); }
  P(c, jx, jy - 1, "#ffffff");
  // tempo slider
  R(c, x + w / 2 - 8, yb - 20, 3, 10, "#0a0810"); R(c, x + w / 2 - 9, yb - 16, 5, 2, "#e8e4f4");
  // transport buttons
  disc(c, x - w / 2 + 6, yb - 5, 2, "#ff9a2a"); disc(c, x - w / 2 + 14, yb - 5, 2, "#3fd07a");
  if (big) { R(c, x + w / 2 - 17, yb - 6, 9, 3, "#14121c"); }
  return [x - w / 2, yb - 31, w, 33];
};
SPR.mixer = (c, x, yb, o) => {
  const rot = !!o.rotary, nch = o.nch || 2;
  const body = ramp(rot ? "#9a96aa" : "#25222f"), cheek = ramp("#8a5a3a");
  R(c, x - 27, yb - 26, 54, 18, body[2]); R(c, x - 27, yb - 26, 54, 1, body[4]); R(c, x - 27, yb - 26, 1, 18, body[3]);
  R(c, x - 27, yb - 8, 54, 8, body[1]); R(c, x - 27, yb - 8, 54, 1, body[3]); R(c, x - 27, yb - 1, 54, 1, body[0]);
  if (rot) { R(c, x - 29, yb - 28, 4, 30, cheek[2]); R(c, x - 29, yb - 28, 1, 30, cheek[3]); R(c, x + 25, yb - 28, 4, 30, cheek[1]); R(c, x + 28, yb - 28, 1, 30, cheek[0]); for (let i = 0; i < 8; i++) { P(c, x - 28 + (i % 2), yb - 26 + i * 3, cheek[0]); P(c, x + 26 + (i % 2), yb - 26 + i * 3, cheek[3]); } }
  const cw = 48 / nch, kc = rot ? ["#1a1620", "#ffd27a", "#c0302c"] : ["#e8e4f4", "#39d0ff", "#ff3fa4", "#9be15d"];
  for (let i = 0; i < nch; i++) {
    const cx = Math.round(x - 24 + cw * i + cw / 2);
    if (rot) {
      [-22, -16, -10].forEach((dy, j) => { disc(c, cx, yb + dy + 1, nch > 2 ? 2 : 3, "#1a1620"); P(c, cx, yb + dy - 1 + (nch > 2 ? 0 : 0), "#ffd27a"); });
      R(c, cx - 3, yb - 6, 6, 1, body[0]);
    } else {
      for (let j = 0; j < 3; j++) { P(c, cx - 1, yb - 23 + j * 4, kc[(i + j) % 4]); P(c, cx, yb - 23 + j * 4, kc[(i + j) % 4]); P(c, cx - 1, yb - 22 + j * 4, "#14121c"); P(c, cx, yb - 22 + j * 4, "#14121c"); }
      R(c, cx - 1, yb - 12, 2, 4, "#0a0810"); R(c, cx - 2, yb - 10, 4, 1, "#e8e4f4");
    }
  }
  if (!rot) { R(c, x - 10, yb - 5, 20, 2, "#0a0810"); R(c, x - 2 + (o.seed % 7) - 3, yb - 6, 4, 4, "#e8e4f4"); }
  return [x - 27, yb - 28, 54, 30];
};
SPR.monitor = (c, x, yb, o) => {
  const cab = ramp("#242130"), yel = (o.accent === "#ffd23f");
  R(c, x - 13, yb - 44, 26, 44, cab[2]); R(c, x - 13, yb - 44, 26, 2, cab[4]); R(c, x - 13, yb - 44, 1, 44, cab[3]); R(c, x + 12, yb - 44, 1, 44, cab[1]); R(c, x - 13, yb - 1, 26, 1, cab[0]);
  R(c, x - 11, yb - 42, 22, 40, cab[1]); R(c, x - 11, yb - 42, 22, 1, cab[0]);
  disc(c, x, yb - 35, 4, "#c8c8d8"); disc(c, x, yb - 35, 2, o.blown ? "#0a0810" : "#14121c");
  disc(c, x, yb - 16, 10, yel ? "#c99a14" : "#8a86a0"); disc(c, x, yb - 16, 8, yel ? "#ffd23f" : "#2b2933"); ring(c, x, yb - 16, 4, 4, yel ? "#c99a14" : "#14121c"); disc(c, x, yb - 16, 3, yel ? "#ffe890" : "#48445a");
  R(c, x - 5, yb - 5, 10, 2, "#0a0810");
  P(c, x + 8, yb - 41, "#ff3fa4");
  return [x - 13, yb - 44, 26, 46];
};
SPR.headphones = (c, x, yb, o) => {
  const cup = ramp(o.cup || "#1c1a24"), band = "#aaa6bc";
  ring(c, x, yb - 10, 14, 15, "#0e0c14", Math.PI, Math.PI * 2); ring(c, x, yb - 11, 14, 15, band, Math.PI, Math.PI * 2); ring(c, x, yb - 12, 14, 15, "#e8e4f4", Math.PI * 1.1, Math.PI * 1.9); ring(c, x, yb - 11, 13, 14, "#6a667c", Math.PI, Math.PI * 2);
  [-15, 15].forEach(dx => { ell(c, x + dx, yb - 7, 6, 9, cup[1]); ell(c, x + dx - 1, yb - 8, 5, 8, cup[2]); ell(c, x + dx - 1, yb - 9, 3, 5, cup[3]); R(c, x + dx - 6, yb - 12, 12, 1, cup[0]); });
  R(c, x - 14, yb - 12, 2, 2, "#c0c4d0"); R(c, x + 12, yb - 12, 2, 2, "#c0c4d0");
  if (o.crack) { line(c, x - 4, yb - 25, x - 1, yb - 22, "#ff5a5a"); P(c, x - 2, yb - 24, "#14101c"); }
  // coiled cable
  for (let i = 0; i < 10; i++) P(c, x + 20 + i, yb - 1 + Math.round(Math.sin(i * 1.4) * 2), "#14101c");
  return [x - 22, yb - 27, 44, 28];
};
SPR.hero = (c, x, yb, o) => {
  // large rotary mixer (boutique stand): steel faceplate, brass-ringed knobs, wooden cheeks
  const nch = o.nch || 4, body = ramp("#9a96aa"), cheek = ramp("#8a5a3a");
  const hw = 46;
  R(c, x - hw, yb - 36, hw * 2, 26, body[2]); R(c, x - hw, yb - 36, hw * 2, 1, body[4]); R(c, x - hw, yb - 35, hw * 2, 1, body[3]);
  for (let i = 0; i < 70; i++) P(c, x - hw + 2 + (i * 29) % (hw * 2 - 4), yb - 34 + (i * 7) % 24, body[i % 2 ? 1 : 3]);
  R(c, x - hw, yb - 10, hw * 2, 10, body[1]); R(c, x - hw, yb - 10, hw * 2, 1, body[3]); R(c, x - hw, yb - 1, hw * 2, 1, body[0]);
  R(c, x - hw - 4, yb - 40, 5, 41, cheek[2]); R(c, x - hw - 4, yb - 40, 1, 41, cheek[3]); R(c, x - hw - 4, yb - 40, 5, 1, cheek[4]);
  R(c, x + hw - 1, yb - 40, 5, 41, cheek[1]); R(c, x + hw + 3, yb - 40, 1, 41, cheek[0]); R(c, x + hw - 1, yb - 40, 5, 1, cheek[3]);
  for (let i = 0; i < 9; i++) { P(c, x - hw - 3 + (i % 2) * 2, yb - 38 + i * 4, cheek[0]); P(c, x + hw + (i % 2) * 2, yb - 38 + i * 4, cheek[3]); }
  const cw = (hw * 2 - 4) / nch;
  for (let i = 0; i < nch; i++) {
    const cx = Math.round(x - hw + 2 + cw * i + cw / 2);
    if (i > 0) R(c, Math.round(x - hw + 2 + cw * i), yb - 34, 1, 23, body[1]);
    [-29, -22, -15].forEach((dy, j) => { ring(c, cx, yb + dy, 4, 4, "#c89a3a"); disc(c, cx, yb + dy, 3, "#16141c"); const a = -2.3 + ((i * 3 + j * 5) % 7) / 7 * 4.6; line(c, cx, yb + dy, cx + Math.cos(a) * 3, yb + dy + Math.sin(a) * 3, "#ffe2a0"); });
    R(c, cx - 3, yb - 8, 7, 2, "#0a0810"); R(c, cx - 1, yb - 8, 3, 2, "#c89a3a");
    txt(c, String(i + 1), cx - 1, yb - 5, "#14121c", 1);
  }
  return [x - hw - 4, yb - 40, hw * 2 + 8, 42];
};
SPR.box = (c, x, yb, o) => { bevel(c, x - 16, yb - 18, 32, 18, "#c8925a"); R(c, x - 16, yb - 12, 32, 2, "#a8743e"); txtC(c, "?", x, yb - 10, "#2a1018", 1); return [x - 16, yb - 18, 32, 18]; };
GK.item = function (c, vk, x, yb, o = {}) {
  shadow(c, x, yb + 1, vk === "monitor" ? 16 : vk === "headphones" ? 24 : vk === "hero" ? 52 : 30, 3, 10);
  const fn = SPR[vk] || SPR.box;
  return fn(c, Math.round(x), Math.round(yb), o);
};
GK.tag = function (c, x, y, text, o = {}) {
  const w = txtW(text) + 5;
  const col = o.sel ? "#ffd23f" : o.sold ? "#c0302c" : "#efe0b0";
  R(c, x - Math.floor(w / 2) + 1, y + 1, w, 9, "#0a0410");
  R(c, x - Math.floor(w / 2), y, w, 9, col); R(c, x - Math.floor(w / 2), y, w, 1, "#ffffff");
  P(c, x - Math.floor(w / 2) + 1, y + 1, "#14101c");
  txt(c, text, x - Math.floor(w / 2) + 3, y + 2, o.sold ? "#ffffff" : "#7a1020", 1);
};
GK.arrow = function (c, x, y, col) {
  R(c, x - 1, y, 3, 3, col); R(c, x - 3, y + 3, 7, 1, col); R(c, x - 2, y + 4, 5, 1, col); R(c, x - 1, y + 5, 3, 1, col); P(c, x, y + 6, col);
  R(c, x - 1, y - 1, 3, 1, "#14101c");
};

/* ------------------------------------------------------------------ CLOSE-UPS (160x120) */
const CU = {};
const FOCUS = { turntable: { wobble: [60, 60], scratchy: [142, 62], noPlay: [88, 46], dead: [14, 108], deadCh: [20, 108], fake: [22, 12], cosmetic: [132, 70], hum: [60, 60], ok: [88, 46] },
  cdj: { wobble: [46, 76], scratchy: [136, 78], noPlay: [102, 56], dead: [60, 22], deadCh: [60, 100], fake: [22, 12], cosmetic: [110, 100], ok: [60, 22] },
  mixer: { hum: [30, 20], scratchy: [80, 100], deadCh: [100, 40], dead: [80, 60], fake: [22, 12], cosmetic: [34, 60], ok: [40, 40] },
  monitor: { blown: [40, 24], deadCh: [112, 66], hum: [80, 100], dead: [80, 60], fake: [20, 12], cosmetic: [20, 100], ok: [40, 66] },
  headphones: { deadCh: [36, 92], scratchy: [100, 112], dead: [80, 60], fake: [22, 12], cosmetic: [60, 100], ok: [80, 28] } };
GK.focus = (vk, flaw) => { const f = FOCUS[vk] || FOCUS.turntable; return f[flaw] || f.ok; };

function led(c, x, y, on, col) { R(c, x, y, 3, 3, on ? col : "#2a2234"); if (on) { P(c, x, y, "#ffffff"); D(c, x - 2, y - 2, 7, 7, col, 3); } }
function badge(c, x, y, g, fake) {
  const b = (g && g.brand || "GEAR").toUpperCase(), m = (g && g.model || "").toUpperCase();
  txt(c, fake ? swapLetters(b) : b, x, y, fake ? "#ff8a5a" : "#c8c4d8", 1);
  txt(c, fake ? m.replace(/[0-9]/, "O") : m, x, y + 7, "#8a86a0", 1);
}

CU.turntable = (c, g, fx, t) => {
  const plinth = g && /numark/i.test(g.brand) ? "#1e2230" : g && /audio-technica/i.test(g.brand) ? "#2c2a30" : "#24202e";
  const body = ramp(plinth);
  bevel(c, 2, 2, 156, 116, plinth);
  for (let i = 0; i < 90; i++) P(c, 4 + (i * 37) % 152, 4 + (i * 53) % 112, body[1]);
  [[6, 6], [152, 6], [6, 112], [152, 112]].forEach(([x, y]) => { R(c, x - 1, y - 1, 3, 3, body[0]); P(c, x, y, "#8a86a0"); });
  badge(c, 10, 8, g, fx.fake);
  // platter
  const ox = Math.round(fx.wob || 0), cx = 62 + ox, cy = 68;
  ell(c, cx + 2, cy + 3, 43, 43, "#0a0810");
  disc(c, cx, cy, 42, "#9a96ac");
  ell(c, cx, cy, 41, 41, "#7a768c");
  const N = 48, ph = fx.phase || 0;
  for (let k = 0; k < N; k++) { const a = ph + k / N * Math.PI * 2; if (k % 2 === 0) { P(c, cx + Math.cos(a) * 40, cy + Math.sin(a) * 40, "#14121c"); P(c, cx + Math.cos(a) * 39, cy + Math.sin(a) * 39, "#14121c"); } else P(c, cx + Math.cos(a) * 40, cy + Math.sin(a) * 40, "#d8d4e8"); }
  ell(c, cx, cy, 36, 36, "#0f0d16");
  for (let r = 33; r > 16; r -= 4) ring(c, cx, cy, r, r, "#1c1926");
  D(c, cx - 32, cy - 32, 32, 18, "#34304a", 4);
  ring(c, cx, cy, 30, 30, "#2c2840", Math.PI * 1.1, Math.PI * 1.7);
  const lab = g && /technics/i.test(g.brand) ? ["#c0302c", "#e04a3c"] : g && /numark/i.test(g.brand) ? ["#2a62b8", "#39a8ff"] : g && /audio-technica/i.test(g.brand) ? ["#3a8a3a", "#9be15d"] : ["#e0368f", "#ff3fa4"];
  ell(c, cx, cy, 14, 14, lab[0]); ell(c, cx, cy, 13, 13, lab[1]);
  for (let k = 0; k < 3; k++) { const a = ph * 1 + k * 2.094; line(c, cx + Math.cos(a) * 4, cy + Math.sin(a) * 4, cx + Math.cos(a) * 11, cy + Math.sin(a) * 11, "#ffe8f4"); }
  disc(c, cx, cy, 2, "#c0c4d0");
  // tonearm
  const px = 136, py = 24;
  R(c, px + 8, py - 12, 8, 16, "#3a3648"); R(c, px + 8, py - 12, 8, 1, "#6a667c"); R(c, px + 9, py - 6, 6, 1, "#14121c");
  disc(c, px, py, 7, "#c8c4d8"); disc(c, px, py, 3, "#6a667c");
  line(c, px, py, 88, 46, "#e8e4f4"); line(c, px, py + 1, 88, 47, "#e8e4f4"); line(c, px, py + 2, 88, 48, "#8a86a0");
  R(c, 82, 44, 9, 5, "#14121c"); R(c, 82, 44, 9, 1, "#6a667c");
  if (fx.needle === false) { R(c, 83, 47, 2, 2, "#c8a050"); R(c, 87, 47, 2, 2, "#c8a050"); R(c, 85, 49, 2, 1, "#3a3548"); }
  else { R(c, 83, 46, 6, 4, "#c0c4d0"); R(c, 83, 46, 6, 1, "#ffffff"); P(c, 85, 51, "#ffd23f"); P(c, 85, 50, "#ffd23f"); }
  // pitch fader
  const jit = fx.jitter ? Math.round((Math.random() - 0.5) * 2 * fx.jitter) : 0;
  R(c, 140, 34, 6, 44, "#0a0810"); R(c, 141, 35, 4, 42, "#000000");
  for (let k = 0; k <= 6; k++) { R(c, 134, 36 + k * 7, k === 3 ? 5 : 3, 1, "#8a86a0"); }
  const cy2 = Math.round(35 + (fx.pitch == null ? 0.5 : fx.pitch) * 34) + jit;
  R(c, 137, cy2, 12, 8, "#e8e4f4"); R(c, 137, cy2, 12, 1, "#ffffff"); R(c, 137, cy2 + 7, 12, 1, "#8a86a0"); R(c, 137, cy2 + 3, 12, 1, "#14121c");
  if (fx.dusty) for (let i = 0; i < 14; i++) P(c, 135 + (i * 5) % 16, cy2 - 4 + (i * 3) % 14, "#6a4a2a");
  // controls
  R(c, 8, 104, 12, 8, "#c8c4d8"); R(c, 8, 104, 12, 1, "#ffffff"); R(c, 8, 111, 12, 1, "#6a667c"); led(c, 12, 99, fx.power, "#ff9a2a");
  R(c, 24, 106, 8, 6, "#3a3548"); R(c, 34, 106, 8, 6, "#3a3548"); txt(c, "33", 25, 107, "#c8c4d8", 1); txt(c, "45", 35, 107, "#8a86a0", 1);
  // strobe lamp
  ell(c, 56, 109, 3, 2, fx.power ? "#ffb04a" : "#3a2a20"); if (fx.power) D(c, 50, 104, 13, 10, "#ffb04a", 4);
  // strobe window: dots from the platter rim (top row) vs a fixed reference (bottom row)
  R(c, 82, 82, 72, 34, "#0a0810"); R(c, 83, 83, 70, 32, "#14101c"); R(c, 82, 82, 72, 1, "#3a3550"); R(c, 82, 82, 1, 34, "#3a3550"); R(c, 153, 82, 1, 34, "#6a667c"); R(c, 82, 115, 72, 1, "#6a667c");
  txt(c, "STROBE", 86, 85, "#8a86a0", 1);
  const per = 8, off = (fx.strobe || 0);
  const dots = (y, o2, col, dim) => { for (let k = -2; k < 12; k++) { const x = Math.round(86 + k * per + ((o2 % per) + per) % per); if (x >= 85 && x < 150) { R(c, x, y, 3, 6, dim ? mix(col, "#14101c", 0.6) : col); } } };
  dots(93, fx.power ? off : 0, "#ffb04a", !fx.power || !fx.spin);
  dots(104, 0, "#ffb04a", true);
  R(c, 118, 91, 1, 22, "#ffffff"); P(c, 117, 90, "#ffffff"); P(c, 119, 90, "#ffffff"); P(c, 116, 89, "#ffffff"); P(c, 120, 89, "#ffffff");
  // dust cover shadow
  if (fx.scuff) { for (let i = 0; i < 10; i++) { const sx = 20 + (i * 13) % 40, sy = 100 + (i * 7) % 12; line(c, sx, sy, sx + 5, sy - 1, "#8a86a0"); } }
};

CU.cdj = (c, g, fx, t) => {
  bevel(c, 2, 2, 156, 116, "#2c2937");
  badge(c, 10, 6, g, fx.fake);
  // screen
  R(c, 10, 22, 140, 36, "#06121a"); R(c, 11, 23, 138, 34, fx.power ? "#0d3048" : "#0a1218"); R(c, 10, 22, 140, 1, "#3a3550");
  if (fx.power) {
    for (let y = 24; y < 56; y += 2) R(c, 11, y, 138, 1, "#0f3a56");
    txt(c, fx.lcd || "TRACK 01", 14, 26, "#7ad8ff", 1); txt(c, fx.bpm || "120.0 BPM", 100, 26, "#ffd23f", 1);
    for (let i = 0; i < 130; i += 2) { const h = 3 + Math.round(Math.abs(Math.sin(i * 0.31 + (fx.phase || 0))) * 9); R(c, 14 + i, 50 - h, 1, h, i < 66 ? "#ff3fa4" : "#39d0ff"); }
  } else txt(c, "", 14, 26, "#000", 1);
  // jog
  const wob = Math.round(fx.wob || 0), jx = 46 + wob, jy = 86;
  ell(c, jx + 2, jy + 3, 28, 28, "#0a0810"); disc(c, jx, jy, 28, "#8a86a0"); ell(c, jx, jy, 26, 26, "#1a1824"); ell(c, jx, jy, 19, 19, "#2a2638");
  const ph = fx.phase || 0;
  for (let k = 0; k < 24; k++) { const a = ph + k / 24 * Math.PI * 2; P(c, jx + Math.cos(a) * 22, jy + Math.sin(a) * 22, k === 0 ? "#ffffff" : "#6a667c"); }
  ring(c, jx, jy, 27, 27, "#39d0ff"); disc(c, jx, jy, 8, "#3a3548"); line(c, jx, jy, jx + Math.cos(ph) * 16, jy + Math.sin(ph) * 16, "#ffffff");
  // slot
  R(c, 96, 62, 40, 9, "#0a0810"); R(c, 97, 63, 38, 7, "#000"); R(c, 96, 62, 40, 1, "#6a667c");
  if (fx.jam) { ell(c, 112, 67, 4, 2, "#ff6cbb"); ell(c, 117, 68, 3, 2, "#ff9ccf"); P(c, 110, 65, "#ffffff"); }
  led(c, 140, 64, fx.power, fx.jam ? "#ff5a5a" : "#3fd07a");
  txt(c, "USB", 100, 73, "#6a667c", 1);
  // tempo slider
  const jit = fx.jitter ? Math.round((Math.random() - 0.5) * 2 * fx.jitter) : 0;
  R(c, 140, 78, 6, 34, "#0a0810"); R(c, 141, 79, 4, 32, "#000"); const ty = Math.round(79 + (fx.pitch == null ? 0.5 : fx.pitch) * 22) + jit;
  R(c, 137, ty, 12, 8, "#e8e4f4"); R(c, 137, ty, 12, 1, "#ffffff"); R(c, 137, ty + 3, 12, 1, "#14101c"); R(c, 137, ty + 7, 12, 1, "#8a86a0");
  if (fx.dusty) for (let i = 0; i < 12; i++) P(c, 135 + (i * 5) % 16, ty - 4 + (i * 3) % 14, "#6a4a2a");
  disc(c, 104, 98, 6, "#ff9a2a"); disc(c, 122, 98, 6, "#3fd07a"); txt(c, "CUE", 99, 107, "#8a86a0", 1); txt(c, "PLAY", 114, 107, "#8a86a0", 1);
  if (fx.scuff) { for (let i = 0; i < 8; i++) { const sx = 100 + (i * 9) % 40, sy = 84 + (i * 5) % 8; line(c, sx, sy, sx + 4, sy + 1, "#6a667c"); } }
};

CU.mixer = (c, g, fx, t) => {
  const rot = g && g.kind === "rotary", nch = fx.nch || 2;
  bevel(c, 2, 2, 156, 116, rot ? "#8a869a" : "#25222f");
  const sh = ramp(rot ? "#8a869a" : "#25222f");
  if (rot) { R(c, 0, 0, 5, 120, "#8a5a3a"); R(c, 155, 0, 5, 120, "#6a4028"); R(c, 0, 0, 1, 120, "#b47a56"); }
  for (let i = 0; i < 80; i++) P(c, 8 + (i * 37) % 144, 4 + (i * 53) % 112, sh[1]);
  badge(c, 10, 6, g, fx.fake);
  const cw = 140 / nch;
  for (let i = 0; i < nch; i++) {
    const cx = Math.round(10 + cw * i + cw / 2);
    if (i > 0) R(c, Math.round(10 + cw * i), 24, 1, 70, sh[1]);
    txt(c, "CH" + (i + 1), cx - 5, 22, rot ? "#14121c" : "#8a86a0", 1);
    const kr = rot ? (nch > 2 ? 7 : 9) : 5;
    const rows = rot ? [38, 58, 78] : [36, 48, 60];
    rows.forEach((y, j) => {
      disc(c, cx, y, kr, rot ? "#1a1620" : ["#e8e4f4", "#39d0ff", "#ff3fa4"][j]);
      const a = -2.2 + ((i * 3 + j * 5) % 7) / 7 * 4.4; line(c, cx, y, cx + Math.cos(a) * (kr - 1), y + Math.sin(a) * (kr - 1), rot ? "#ffd27a" : "#14121c");
    });
    // fader + meter
    const lv = (fx.sig && fx.sig[i]) || 0;
    if (!rot) {
      R(c, cx - 1, 68, 3, 36, "#0a0810"); const fy = 70 + Math.round((1 - (fx.fader == null ? 0.7 : fx.fader)) * 24); R(c, cx - 5, fy, 11, 6, "#e8e4f4"); R(c, cx - 5, fy + 2, 11, 1, "#14121c");
      for (let k = 0; k < 10; k++) { const on = k < Math.round(lv * 10); R(c, cx + 8, 102 - k * 3, 3, 2, on ? (k > 7 ? "#ff5a5a" : k > 5 ? "#ffd23f" : "#3fd07a") : "#1a1624"); }
    } else {
      for (let k = 0; k < 10; k++) { const on = k < Math.round(lv * 10); R(c, cx - 7 + (k % 2) * 8, 92 + Math.floor(k / 2) * 2 - 0, 6, 1, on ? (k > 7 ? "#ff5a5a" : k > 5 ? "#ffd23f" : "#3fd07a") : "#3a3548"); }
      R(c, cx - 2, 102, 5, 1, "#14121c");
    }
  }
  // crossfader
  const jit = fx.jitter ? Math.round((Math.random() - 0.5) * 2 * fx.jitter) : 0;
  R(c, 50, 108, 60, 4, "#0a0810"); const xx = Math.round(52 + (fx.xf == null ? 0.5 : fx.xf) * 48) + jit;
  R(c, xx, 105, 10, 10, rot ? "#14121c" : "#e8e4f4"); R(c, xx + 4, 105, 2, 10, rot ? "#ffd27a" : "#14121c");
  led(c, 140, 10, fx.power, "#3fd07a");
  if (fx.dusty) for (let i = 0; i < 14; i++) P(c, 46 + (i * 5) % 70, 104 + (i * 3) % 10, "#6a4a2a");
  if (fx.scuff) { for (let i = 0; i < 8; i++) { const sx = 12 + (i * 17) % 50, sy = 84 + (i * 5) % 14; line(c, sx, sy, sx + 5, sy - 1, "#6a667c"); } }
};

CU.monitor = (c, g, fx, t) => {
  const yel = g && /krk/i.test(g.brand);
  bevel(c, 2, 2, 156, 116, "#14121c");
  badge(c, 10, 6, g, fx.fake);
  [[6, "L"], [84, "R"]].forEach(([x0, nm], i) => {
    const cab = ramp("#242130");
    R(c, x0 + 2, 22, 66, 94, cab[2]); R(c, x0 + 2, 22, 66, 2, cab[4]); R(c, x0 + 2, 22, 2, 94, cab[3]); R(c, x0 + 66, 22, 2, 94, cab[1]); R(c, x0 + 2, 114, 66, 2, cab[0]);
    R(c, x0 + 6, 26, 58, 86, cab[1]);
    const sig = i === 0 ? (fx.sigL || 0) : (fx.sigR || 0), cx = x0 + 35;
    const shake = fx.power && sig > 0.05 ? Math.round(Math.sin(t * 40 + i) * 1.2 * sig) : 0;
    // tweeter
    disc(c, cx, 42, 9, "#c8c8d8"); disc(c, cx, 42, 7, "#1a1824");
    if (fx.blown === i || (fx.blown === true)) { ell(c, cx, 42, 3, 3, "#000"); P(c, cx - 2, 40, "#ffffff"); line(c, cx - 5, 38, cx - 2, 41, "#ff5a5a"); } else { disc(c, cx, 42, 4, "#48445a"); }
    // woofer
    disc(c, cx, 82, 24, yel ? "#c99a14" : "#8a86a0"); ell(c, cx, 82 + shake, 21, 21, yel ? "#ffd23f" : "#2b2933");
    for (let r = 18; r > 8; r -= 4) ring(c, cx, 82 + shake, r, r, yel ? "#c99a14" : "#14121c");
    disc(c, cx, 82 + shake, 7, yel ? "#ffe890" : "#48445a");
    R(c, cx - 8, 108, 16, 3, "#0a0810");
    led(c, x0 + 56, 28, fx.power && !(fx.dead), "#3fd07a");
    txt(c, nm, x0 + 9, 28, "#6a667c", 1);
  });
  if (fx.scuff) { for (let i = 0; i < 8; i++) { const sx = 10 + (i * 11) % 120, sy = 30 + (i * 17) % 80; line(c, sx, sy, sx + 3, sy + 5, "#5a566c"); } }
};

CU.headphones = (c, g, fx, t) => {
  bevel(c, 2, 2, 156, 116, "#16141e");
  badge(c, 10, 6, g, fx.fake);
  const flex = fx.flex || 0, ry = 56 - flex * 7;
  ring(c, 80, 74, 44, ry, "#0e0c14", Math.PI, Math.PI * 2); ring(c, 80, 73, 44, ry, "#aaa6bc", Math.PI, Math.PI * 2); ring(c, 80, 72, 44, ry, "#e8e4f4", Math.PI * 1.15, Math.PI * 1.85);
  ring(c, 80, 74, 43, ry - 1, "#6a667c", Math.PI, Math.PI * 2); ring(c, 80, 75, 42, ry - 2, "#c8c4d8", Math.PI * 1.08, Math.PI * 1.92); ring(c, 80, 76, 41, ry - 3, "#3a3548", Math.PI, Math.PI * 2);
  if (fx.crack) { line(c, 76, 20, 82, 26, "#ff5a5a"); line(c, 82, 26, 80, 30, "#ff5a5a"); P(c, 79, 23, "#14101c"); }
  [[36, "L", fx.sigL || 0], [124, "R", fx.sigR || 0]].forEach(([x, nm, sig]) => {
    const shake = fx.power && sig > 0.05 ? Math.round(Math.sin(t * 30) * sig) : 0;
    R(c, x - 3, 62, 6, 10, "#c0c4d0"); R(c, x - 3, 62, 6, 1, "#ffffff");
    ell(c, x + 1, 94, 22, 26, "#0a0810"); disc(c, x, 92, 22, "#1c1a24"); ell(c, x, 92, 18, 22, "#0e0c14"); ell(c, x, 92 + shake, 12, 16, "#2a2634"); ell(c, x, 92 + shake, 7, 10, "#14121c");
    ring(c, x, 92, 21, 25, "#3a3548"); led(c, x - 1, 110, sig > 0.05, "#3fd07a"); txt(c, nm, x - 1, 76, "#8a86a0", 1);
  });
  const wob = fx.cable || 0;
  for (let i = 0; i < 40; i++) P(c, 60 + i, 112 + Math.round(Math.sin(i * 0.5 + t * 3 * wob) * 2), "#14101c");
  if (fx.scuff) for (let i = 0; i < 6; i++) P(c, 22 + (i * 7) % 24, 84 + (i * 5) % 18, "#8a86a0");
};
GK.closeup = function (c, vk, o, fx, t) {
  c.clearRect(0, 0, 160, 120);
  R(c, 0, 0, 160, 120, "#0a0816");
  const f = CU[vk] || CU.mixer;
  fx = fx || {};
  try { f(c, o.gear, Object.assign({ nch: o.nch }, fx), t || 0); } catch (e) { /* never throw */ }
  // looking closer: a 2x pixel loupe
  if (fx.loupe) {
    const L = fx.loupe, r = L.r || 20, x = Math.round(L.x), y = Math.round(L.y);
    const src = mk(r, r); src.getContext("2d").drawImage(c.canvas, Math.round(x - r / 4), Math.round(y - r / 4), r / 2, r / 2, 0, 0, r / 2, r / 2);
    c.save(); c.beginPath(); c.arc(x, y, r / 2 + 0.5, 0, Math.PI * 2); c.clip(); c.imageSmoothingEnabled = false;
    c.fillStyle = "#0a0816"; c.fillRect(x - r, y - r, r * 2, r * 2);
    c.drawImage(src, 0, 0, r / 2, r / 2, x - r / 2, y - r / 2, r, r);
    c.restore();
    ring(c, x, y, r / 2 + 1, r / 2 + 1, "#ffd23f"); ring(c, x, y, r / 2 + 2, r / 2 + 2, "#14101c"); ring(c, x, y, r / 2, r / 2, "#fff4c0", Math.PI * 1.1, Math.PI * 1.45);
    line(c, x + Math.round(r / 2 * 0.7), y + Math.round(r / 2 * 0.7), x + r / 2 + 9, y + r / 2 + 9, "#ffd23f"); line(c, x + Math.round(r / 2 * 0.7) + 1, y + Math.round(r / 2 * 0.7), x + r / 2 + 10, y + r / 2 + 9, "#c8923a");
  }
};

/* ------------------------------------------------------------------ PAPER */
GK.paper = function (c, o) {
  R(c, 0, 0, 160, 120, "#2a1c14");
  const wood = ramp("#6a4a32");
  for (let y = 0; y < 120; y += 15) { R(c, 0, y, 160, 14, wood[(y / 15) % 2 ? 1 : 2]); R(c, 0, y + 14, 160, 1, wood[0]); }
  const rnd = mulberry(o.seed || 5);
  for (let i = 0; i < 260; i++) P(c, rnd() * 160, rnd() * 120, rnd() < 0.5 ? wood[0] : wood[3]);
  // serial plate
  bevel(c, 14, 6, 132, 26, "#9a96aa");
  R(c, 16, 8, 128, 22, "#c0bccc"); R(c, 16, 8, 128, 1, "#ffffff");
  [[18, 10], [141, 10], [18, 27], [141, 27]].forEach(([x, y]) => { P(c, x, y, "#6a667c"); P(c, x + 1, y, "#8a86a0"); });
  if (o.sanded) { for (let i = 0; i < 70; i++) { const x = 20 + rnd() * 120, y = 10 + rnd() * 18; line(c, x, y, x + 4 + rnd() * 6, y + 1, "#a8a4b8"); } txt(c, "SN  ?   ?   ?", 26, 14, "#a8a4b8", 1); txt(c, "(SANDED OFF)", 28, 22, "#7a768c", 1); }
  else if (o.marker) { txt(c, o.plate1 || "SN 12345", 26, 13, "#c0302c", 2, 1); txt(c, o.plate2 || "(TRUST ME)", 28, 24, "#c0302c", 1); }
  else { txt(c, o.plate1 || "MODEL", 22, 12, "#3a3548", 1); txt(c, o.plate2 || "SN 0000", 22, 20, "#14121c", 2, 1); }
  // receipt
  const px = 24, py = 38, pw = 112, ph = 76;
  R(c, px + 3, py + 3, pw, ph, "#0a0410");
  R(c, px, py, pw, ph, o.napkin ? "#efeaf6" : "#eadcc0");
  for (let x = 0; x < pw; x += 4) { R(c, px + x, py + ph, 2, 2, o.napkin ? "#efeaf6" : "#eadcc0"); R(c, px + x + 2, py + ph, 2, 1, o.napkin ? "#efeaf6" : "#eadcc0"); }
  R(c, px, py, pw, 1, "#ffffff");
  if (o.napkin) { for (let i = 0; i < 9; i++) { ring(c, px + 20 + i * 10, py + 6, 3, 2, "#d8d0e8"); } }
  const lines = o.lines || [];
  lines.forEach((l, i) => txt(c, l.t || l, px + 6, py + 8 + i * 8, l.c || (o.napkin ? "#2a2a8a" : "#2a1f2a"), 1));
  if (o.stamp) { const sx = px + pw - 34, sy = py + ph - 22; R(c, sx, sy, 30, 14, o.stampBg || "#c0302c"); R(c, sx + 1, sy + 1, 28, 12, "#eadcc0"); txtC(c, o.stamp, sx + 15, sy + 4, o.stampBg || "#c0302c", 1); }
  if (o.stain) { ring(c, px + 80, py + 52, 8, 6, "#9a6a3a"); ring(c, px + 80, py + 52, 7, 5, "#b08050"); }
};

/* ------------------------------------------------------------------ TEST TONE (Web Audio, silent-safe) */
let nbuf = null;
function noiseBuf(AC) { if (nbuf && nbuf.sampleRate === AC.sampleRate) return nbuf; nbuf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate); const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return nbuf; }
/* opts: { wobble: cents (0 = steady), rate: Hz, pan: -1..1, hum: bool, crackle: 0..1, silent: bool, thin: bool,
           distort: bool, vol, bend (cents, live via .bend), key (midi root), pulse }  -> { stop(), bend(cents), crackle(p) } */
GK.tone = function (o = {}) {
  const dead = { stop() {}, bend() {}, crackle() {}, silent: true };
  let AC = null;
  try { AC = RP.audio && RP.audio.ctx && RP.audio.ctx(); } catch (e) { AC = null; }
  if (!AC || (RP.audio && RP.audio.muted)) return dead;
  try {
    const out = AC.createGain(); out.gain.value = 0.0001;
    const comp = AC.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 5;
    let tail = out;
    if (o.distort) { const ws = AC.createWaveShaper(); const cur = new Float32Array(256); for (let i = 0; i < 256; i++) { const x = i / 128 - 1; cur[i] = Math.tanh(x * 6) * 0.7; } ws.curve = cur; out.connect(ws); tail = ws; }
    let pan = null; try { pan = AC.createStereoPanner(); pan.pan.value = o.pan || 0; tail.connect(pan); pan.connect(comp); } catch (e) { tail.connect(comp); }
    comp.connect(AC.destination);
    const t0 = AC.currentTime;
    out.gain.setValueAtTime(0.0001, t0); out.gain.linearRampToValueAtTime(o.vol == null ? 0.5 : o.vol, t0 + 0.05);
    // detune bus: LFO (wobble) + live bend
    const dsum = AC.createGain(); dsum.gain.value = 1;
    let lfo = null, bendSrc = null;
    if (o.wobble) { lfo = AC.createOscillator(); lfo.frequency.value = o.rate || 0.9; const lg = AC.createGain(); lg.gain.value = o.wobble; lfo.connect(lg); lg.connect(dsum); lfo.start(t0); }
    try { bendSrc = AC.createConstantSource(); bendSrc.offset.value = o.bend || 0; bendSrc.connect(dsum); bendSrc.start(t0); } catch (e) { bendSrc = null; }
    const nodes = [lfo, bendSrc];
    const midi = n => 440 * Math.pow(2, (n - 69) / 12);
    const key = o.key || 55;
    const arp = [0, 7, 12, 10, 7, 3, 7, 12];
    const step = 60 / (o.bpm || 112) / 2;
    let next = t0 + 0.06, i = 0, crack = o.crackle || 0;
    const burst = (t, v) => {
      const s = AC.createBufferSource(); s.buffer = noiseBuf(AC);
      const f = AC.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 2500 + Math.random() * 3000;
      const g = AC.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.012 + Math.random() * 0.02);
      s.connect(f); f.connect(g); g.connect(out); s.start(t, Math.random() * 0.5); s.stop(t + 0.05);
    };
    const note = (t, n) => {
      const o1 = AC.createOscillator(), o2 = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain();
      o1.type = "sawtooth"; o2.type = o.thin ? "sawtooth" : "square"; o1.frequency.value = midi(n); o2.frequency.value = midi(n - 12);
      dsum.connect(o1.detune); dsum.connect(o2.detune);
      f.type = o.thin ? "bandpass" : "lowpass"; f.frequency.value = o.thin ? 1500 : 1500; f.Q.value = o.thin ? 2.5 : 1.5;
      const g2 = AC.createGain(); g2.gain.value = o.thin ? 0.2 : 0.45;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.3, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + step * 1.9);
      o1.connect(f); o2.connect(g2); g2.connect(f); f.connect(g); g.connect(out);
      o1.start(t); o2.start(t); o1.stop(t + step * 2); o2.stop(t + step * 2);
    };
    let humNodes = null;
    if (o.hum) { const h = AC.createOscillator(), h2 = AC.createOscillator(), hg = AC.createGain(), hf = AC.createBiquadFilter(); h.type = "sawtooth"; h.frequency.value = 60; h2.type = "square"; h2.frequency.value = 120; hf.type = "lowpass"; hf.frequency.value = 500; hg.gain.value = 0.22; h.connect(hf); h2.connect(hf); hf.connect(hg); hg.connect(out); h.start(t0); h2.start(t0); humNodes = [h, h2]; }
    let motor = null;
    if (o.motor) { const m = AC.createOscillator(), mg = AC.createGain(); m.type = "triangle"; m.frequency.value = 50; mg.gain.value = 0.14; m.connect(mg); mg.connect(out); m.start(t0); motor = m; }
    if (o.silent) { const s = AC.createBufferSource(); s.buffer = noiseBuf(AC); s.loop = true; const f = AC.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 400; const g = AC.createGain(); g.gain.value = 0.03; s.connect(f); f.connect(g); g.connect(out); s.start(t0); nodes.push(s); }
    let alive = true;
    const iv = setInterval(() => {
      if (!alive) return;
      try {
        const ahead = AC.currentTime + 0.14;
        while (next < ahead) {
          if (!o.silent) note(next, key + arp[i % arp.length] + (Math.floor(i / 8) % 2 ? 5 : 0));
          if (crack > 0 && Math.random() < crack) burst(next + Math.random() * step, 0.25 + Math.random() * 0.3);
          next += step; i++;
        }
        if (crack > 0 && Math.random() < crack * 0.5) burst(AC.currentTime + 0.02, 0.2);
      } catch (e) { /* ignore */ }
    }, 25);
    return {
      stop() {
        if (!alive) return; alive = false; clearInterval(iv);
        try { const t = AC.currentTime; out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(out.gain.value, t); out.gain.linearRampToValueAtTime(0.0001, t + 0.12); } catch (e) { /* ignore */ }
        setTimeout(() => { nodes.concat(humNodes || [], motor ? [motor] : []).forEach(n => { try { n && n.stop(); } catch (e) { /* ignore */ } }); try { out.disconnect(); comp.disconnect(); } catch (e) { /* ignore */ } }, 220);
      },
      vol(v) { try { out.gain.setTargetAtTime(v, AC.currentTime, 0.03); } catch (e) { /* ignore */ } },
      bend(cents) { try { if (bendSrc) bendSrc.offset.setTargetAtTime(cents, AC.currentTime, 0.02); } catch (e) { /* ignore */ } },
      crackle(p) { crack = p; }
    };
  } catch (e) { return dead; }
};

/* ear-test loop for the boutique: low (kick + sub), mid (keys), high (hats). One band is rolled off. -> { stop() } */
GK.band = function (cutIdx) {
  const dead = { stop() {} };
  let AC = null;
  try { AC = RP.audio && RP.audio.ctx && RP.audio.ctx(); } catch (e) { AC = null; }
  if (!AC || (RP.audio && RP.audio.muted)) return dead;
  try {
    const comp = AC.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 6;
    const master = AC.createGain(); master.gain.value = 0.0001; master.connect(comp); comp.connect(AC.destination);
    master.gain.linearRampToValueAtTime(0.8, AC.currentTime + 0.1);
    const buses = [0, 1, 2].map(i => { const g = AC.createGain(); g.gain.value = i === cutIdx ? 0.03 : 1; g.connect(master); return g; });
    const nb = noiseBuf(AC), midi = n => 440 * Math.pow(2, (n - 69) / 12);
    const step = 60 / 118 / 4; let next = AC.currentTime + 0.08, i = 0;
    const kick = t => { const o = AC.createOscillator(), g = AC.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.12); g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35); o.connect(g); g.connect(buses[0]); o.start(t); o.stop(t + 0.4); };
    const sub = (t, n) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = "sine"; o.frequency.value = midi(n); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.6, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + step * 3); o.connect(g); g.connect(buses[0]); o.start(t); o.stop(t + step * 3 + 0.05); };
    const key = (t, n) => { [0, 7].forEach(d => { const o = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain(); o.type = "sawtooth"; o.frequency.value = midi(n + d); f.type = "bandpass"; f.frequency.value = 1400; f.Q.value = 0.7; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.22, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + step * 2.5); o.connect(f); f.connect(g); g.connect(buses[1]); o.start(t); o.stop(t + step * 2.6); }); };
    const hat = (t, v) => { const s = AC.createBufferSource(); s.buffer = nb; const f = AC.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 7200; const g = AC.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06); s.connect(f); f.connect(g); g.connect(buses[2]); s.start(t, Math.random() * 0.5); s.stop(t + 0.08); };
    let alive = true;
    const iv = setInterval(() => {
      if (!alive) return;
      try {
        const ahead = AC.currentTime + 0.14;
        while (next < ahead) {
          const s = i % 16;
          if (s % 4 === 0) kick(next);
          if (s === 2 || s === 6 || s === 10 || s === 14) sub(next, 31 + (s === 10 ? 5 : 0));
          if (s === 0 || s === 3 || s === 6 || s === 10 || s === 12) key(next, [57, 60, 64, 62, 60][[0, 3, 6, 10, 12].indexOf(s)] + 0);
          if (s % 2 === 1) hat(next, 0.3); else if (s % 4 === 2) hat(next, 0.14);
          next += step; i++;
        }
      } catch (e) { /* ignore */ }
    }, 25);
    return { stop() { if (!alive) return; alive = false; clearInterval(iv); try { const t = AC.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(0.0001, t + 0.15); } catch (e) { /* ignore */ } setTimeout(() => { try { master.disconnect(); comp.disconnect(); } catch (e) { /* ignore */ } }, 300); } };
  } catch (e) { return dead; }
};
})();
