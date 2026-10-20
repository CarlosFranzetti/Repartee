/* Act 5 — shared painters (window.RP.a5.art). Built on the paint kit (RP.PK). Every helper is deterministic
   and returns an array of emissive rects (or nothing). Used by all act 5 rooms. */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u, PK = RP.PK, K = U.ramp;
const { R, P, ell, line, poly, bayer, mulberry, mix, txt, txtC, txtW, clamp } = U;
const A5 = RP.a5 = RP.a5 || {};
const art = A5.art = {};
const HL = (c, x, y, w, col) => R(c, x, y, w, 1, col), VL = (c, x, y, h, col) => R(c, x, y, 1, h, col);
const fl = Math.floor, rd = Math.round, sin = Math.sin, cos = Math.cos, PI = Math.PI;

/* ------------------------------------------------------------------------------------------ water */
art.water = function (c, x, y, w, h, o) {
  o = o || {};
  const pal = o.pal || ["#2a2a6a", "#22205a", "#181444", "#100c30"];
  const r = mulberry(o.seed || 9);
  PK.gradV(c, x, y, w, h, pal, { dither: 1 });
  if (o.reflect !== false) {
    const cv = c.canvas, a = o.reflectA == null ? 0.55 : o.reflectA, rh = o.reflectH || 90;
    for (let i = 0; i < h; i++) {
      const src = y - 1 - fl(i * (o.squash || 0.75));
      if (src < 0 || src < y - rh) break;
      const wob = rd(sin(i * 0.85 + (o.phase || 0)) * (0.6 + i * 0.05));
      c.globalAlpha = Math.max(0, a * (1 - i / (o.fade || h)));
      c.drawImage(cv, x, src, w, 1, x + wob, y + i, w, 1);
    }
    c.globalAlpha = 1;
  }
  /* ripple cuts and glints break up the mirror */
  const n = fl(w * h / 34), glint = o.glint || "#8a8aff";
  for (let i = 0; i < n; i++) {
    const yy = y + fl(r() * h), t = (yy - y) / h, len = 2 + fl(r() * (3 + t * 12)), xx = x + fl(r() * (w - len)), v = r();
    const base = pal[Math.min(pal.length - 1, fl(t * (pal.length - 1)))];
    R(c, xx, yy, len, 1, v < 0.58 ? mix(base, "#000000", 0.22) : v < 0.82 ? mix(base, glint, 0.2) : mix(pal[0], glint, 0.4));
  }
  (o.lights || []).forEach(L => {
    for (let yy = y; yy < y + h; yy++) {
      const t = (yy - y) / h, wob = rd(sin(yy * 0.9 + L.x * 0.3) * (1 + t * 3)), sp = rd((L.w || 2) * (1 + t * 2.2));
      if ((yy * 7 + L.x) % 3 === 0 && t > 0.04) continue;
      c.globalAlpha = Math.round(Math.min(1, (L.a == null ? 1 : L.a) * (1 - t * 0.8)) * 6) / 6;
      R(c, L.x + wob - (sp >> 1), yy, sp, 1, L.color);
    }
    c.globalAlpha = 1;
  });
  return o.emissive === false ? [] : [[x, y, w, h]];
};

/* sky + skyline + bridge + water: the waterfront backdrop. Returns one big emissive rect. */
art.harbor = function (c, o) {
  o = o || {};
  const x = o.x || 0, w = o.w || 640, top = o.top || 0, hz = o.horizon || 120, time = o.time || "night", seed = o.seed || 4;
  const night = time !== "day", skyH = o.skyH || 64;
  PK.sky(c, x, top, w, hz - top, { time, seed, sun: o.sun, moon: o.moon === undefined ? (time === "night" ? { x: x + rd(w * 0.8), y: top + 22, r: 7 } : false) : o.moon, clouds: o.clouds, stars: o.stars });
  const em = [];
  em.push.apply(em, PK.skyline(c, x, hz - skyH, w, skyH, { night, layers: 3, spire: o.spire !== false, spireX: o.spireX, seed: seed + 3 }));
  if (o.bridge) { const b = o.bridge; em.push.apply(em, PK.bridge(c, b.x, hz - (b.lift || 2), b.w, { night, h: b.h || 36 })); }
  const wh = (o.waterH != null ? o.waterH : (o.bottom || 160) - hz);
  const pals = { night: ["#3a2a78", "#2a2060", "#1c1648", "#120c30"], dusk: ["#9a4a8a", "#5a3a8a", "#2e2268", "#1a1448"], dawn: ["#e8a0a0", "#b080b8", "#5a58a0", "#2e3a78"], day: ["#8fb4f5", "#6a96e0", "#4a74c0", "#2e4e98"] };
  art.water(c, x, hz, w, wh, { pal: o.pal || pals[time], seed: seed + 5, lights: o.lights, glint: o.glint || (night ? "#ffb0e0" : "#ffffff"), reflectA: o.reflectA, phase: o.phase });
  return art.emissiveExcept(x, top, w, hz - top + wh, o.holes);
};

/* ------------------------------------------------------------------------------------- lighthouse logo */
art.hlLogo = function (c, cx, y, s, o) {
  o = o || {};
  const tc = o.color || "#f4f0e8", kc = K(tc), red = o.stripe || "#e0368f", em = [];
  const bw = 7 * s, tw = 4 * s, th = 14 * s, lh = 4 * s;
  const bx = cx - bw / 2;
  /* beams first (wedges fading out in flat alpha steps, behind) */
  const BL = o.beamLen || 34 * s;
  c.fillStyle = o.beam || "#ffe9a0";
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 3 * s; i < BL; i++) {
      const half = (i - 3 * s) * 0.16 + 1, py = rd(y + 2 * s - half);
      c.globalAlpha = Math.round((1 - i / BL) * 6) / 6 * 0.55;
      c.fillRect(cx + side * i, py, 1, rd(y + 2 * s + half) - py + 1);
    }
  }
  c.globalAlpha = 1;
  poly(c, [[cx - tw / 2, y + lh], [cx + tw / 2, y + lh], [cx + bw / 2, y + lh + th], [cx - bw / 2, y + lh + th]], tc);
  for (let i = 0; i < 3; i++) {
    const t0 = (i * 2 + 1) / 7, t1 = (i * 2 + 2) / 7, y0 = y + lh + th * t0, y1 = y + lh + th * t1;
    const w0 = tw + (bw - tw) * t0, w1 = tw + (bw - tw) * t1;
    poly(c, [[cx - w0 / 2, y0], [cx + w0 / 2, y0], [cx + w1 / 2, y1], [cx - w1 / 2, y1]], red);
  }
  VL(c, rd(cx - bw / 2 + 1), y + lh, th, kc[4]);
  R(c, rd(cx - tw / 2 - 1), y + lh - 1, tw + 2, Math.max(1, s), kc[1]);
  R(c, rd(cx - tw / 2 + 0.5), y, Math.max(2, tw - 1), lh, "#ffe9a0"); em.push([rd(cx - tw / 2 + 0.5), y, Math.max(2, tw - 1), lh]);
  R(c, rd(cx - tw / 2), y - s, tw, s, red); P(c, cx, y - s - 1, red);
  return em;
};

/* -------------------------------------------------------------------------------------- string lights */
art.stringLights = function (c, x0, y0, x1, y1, o) {
  o = o || {};
  const sag = o.sag == null ? 8 : o.sag, step = o.step || 6, cols = o.colors || ["#ffd27a", "#ff9ad5", "#9fe8ff", "#ffe2a0"], em = [], pts = [];
  const n = Math.max(2, fl(Math.abs(x1 - x0) / 1));
  let last = null;
  for (let i = 0; i <= n; i++) {
    const t = i / n, px = rd(x0 + (x1 - x0) * t), py = rd(y0 + (y1 - y0) * t + sin(t * PI) * sag);
    P(c, px, py, o.wire || "#0c0818");
    if (i % step === 0) {
      const col = cols[(i / step) % cols.length | 0];
      R(c, px - 1, py + 1, 2, 2, col); P(c, px - 1, py + 1, mix(col, "#ffffff", 0.7)); em.push([px - 1, py + 1, 2, 2]); pts.push({ x: px, y: py + 2, color: col });
    }
  }
  em.pts = pts;
  return em;
};

/* flag bunting */
art.bunting = function (c, x0, y0, x1, y1, o) {
  o = o || {};
  const sag = o.sag == null ? 6 : o.sag, cols = o.colors || ["#ff3fa4", "#39d0ff", "#ffd23f", "#9be15d", "#ffffff"], n = Math.floor(Math.abs(x1 - x0) / (o.gap || 9));
  for (let i = 0; i <= n; i++) {
    const t = i / n, px = rd(x0 + (x1 - x0) * t), py = rd(y0 + (y1 - y0) * t + sin(t * PI) * sag), col = cols[i % cols.length];
    poly(c, [[px - 3, py], [px + 3, py], [px, py + 6]], col); HL(c, px - 3, py, 7, mix(col, "#ffffff", 0.4)); P(c, px - 1, py + 3, mix(col, "#14081e", 0.35));
  }
  for (let i = 0; i < Math.abs(x1 - x0); i++) { const t = i / Math.abs(x1 - x0); P(c, rd(x0 + (x1 - x0) * t), rd(y0 + (y1 - y0) * t + sin(t * PI) * sag), "#0c0818"); }
};

/* ---------------------------------------------------------------------------------------- pop-up tent */
art.popTent = function (c, x, y, w, h, o) {
  o = o || {};
  const col = o.color || "#f4f0e8", stripe = o.stripe || "#ff3fa4", kc = K(col), roofH = o.roofH || rd(h * 0.3), em = [];
  PK.contactShadow(c, x - 2, y + h - 2, w + 4, 5, { alpha: 0.4 });
  R(c, x + 2, y + roofH, w - 4, h - roofH, o.inside || "#1c1426");
  if (o.inside !== false) U.R(c, x + 2, y + h - 12, w - 4, 12, o.floorShadow || "#120c1c");
  const peakL = x + w * 0.32, peakR = x + w * 0.68;
  poly(c, [[peakL, y], [peakR, y], [x + w + 4, y + roofH], [x - 4, y + roofH]], col);
  const n = o.panels || 6;
  for (let i = 0; i < n; i += 2) {
    const a0 = i / n, a1 = (i + 1) / n;
    const tL = peakL + (peakR - peakL) * a0, tR = peakL + (peakR - peakL) * a1, bL = x - 4 + (w + 8) * a0, bR = x - 4 + (w + 8) * a1;
    poly(c, [[tL, y], [tR, y], [bR, y + roofH], [bL, y + roofH]], stripe);
  }
  /* shading: lit from the upper left */
  PK.util.dshade(c, x - 4, y, w + 8, roofH, "#140c24", (px, py) => ((px - x) / w) * 0.55 + (py - y) / roofH * 0.25, 0.5);
  HL(c, rd(peakL), y, rd(peakR - peakL), mix(col, "#ffffff", 0.7));
  line(c, rd(peakL), y, x - 4, y + roofH, mix(col, "#ffffff", 0.5));
  /* valance scallops */
  for (let px = x - 4; px < x + w + 4; px += 6) {
    const idx = ((px - x + 4) / 6) | 0, vc = idx % 2 ? col : stripe;
    R(c, px, y + roofH, 6, 3, vc); P(c, px + 1, y + roofH + 3, vc); P(c, px + 2, y + roofH + 3, vc); P(c, px + 3, y + roofH + 3, vc); P(c, px + 4, y + roofH + 3, vc);
    HL(c, px, y + roofH, 6, mix(vc, "#ffffff", 0.35)); HL(c, px, y + roofH + 2, 6, mix(vc, "#14081e", 0.35));
  }
  /* poles */
  R(c, x, y + roofH + 3, 2, h - roofH - 3, "#a8a4b8"); VL(c, x, y + roofH + 3, h - roofH - 3, "#e8e4f4");
  R(c, x + w - 2, y + roofH + 3, 2, h - roofH - 3, "#a8a4b8"); VL(c, x + w - 1, y + roofH + 3, h - roofH - 3, "#5a566c");
  return em;
};

/* ---------------------------------------------------------------------------------------- food truck */
art.foodTruck = function (c, x, y, w, o) {
  o = o || {};
  const body = o.color || "#e0a02a", kb = K(body), h = o.h || 58, em = [], by = y - h, name = o.name || "TACOS";
  PK.contactShadow(c, x, y - 2, w, 6, { alpha: 0.5 });
  /* box */
  R(c, x, by, w - 22, h - 8, body);
  PK.gradV(c, x, by, w - 22, h - 8, [kb[4], kb[3], kb[2], kb[1]], { dither: 1 });
  HL(c, x, by, w - 22, kb[4]); VL(c, x, by, h - 8, kb[3]); HL(c, x, by + h - 9, w - 22, kb[0]);
  /* cab */
  poly(c, [[x + w - 22, by + 12], [x + w - 8, by + 12], [x + w, by + 30], [x + w, by + h - 8], [x + w - 22, by + h - 8]], mix(body, "#ffffff", 0.08));
  poly(c, [[x + w - 20, by + 15], [x + w - 10, by + 15], [x + w - 4, by + 28], [x + w - 20, by + 28]], "#2a3a5a"); line(c, x + w - 18, by + 17, x + w - 12, by + 17, "#8ab0e8");
  R(c, x + w - 22, by + 12, 1, h - 20, kb[1]);
  /* serving window */
  const wx = x + 10, wy = by + 12, ww = rd((w - 22) * 0.6), wh = 20;
  R(c, wx - 2, wy - 2, ww + 4, wh + 4, kb[0]);
  R(c, wx, wy, ww, wh, "#ffdca0"); PK.gradV(c, wx, wy, ww, wh, ["#fff0c0", "#ffc878", "#c07a38"], { dither: 1 });
  R(c, wx + 4, wy + 4, 6, 14, "#3a2418"); R(c, wx + ww - 12, wy + 8, 8, 10, "#c8c4d8");
  em.push([wx, wy, ww, wh]);
  R(c, wx - 3, wy + wh, ww + 6, 3, kb[3]); HL(c, wx - 3, wy + wh, ww + 6, kb[4]);
  /* awning */
  for (let i = 0; i < ww + 10; i += 5) { R(c, wx - 5 + i, wy - 7, 5, 6, (i / 5 | 0) % 2 ? "#f4f0e8" : (o.awning || "#c0302c")); HL(c, wx - 5 + i, wy - 7, 5, "#ffffff55"); }
  R(c, wx - 5, wy - 1, ww + 10, 1, "#14081e");
  /* menu board + name */
  const nw = txtW(name, 2, 1) + 6, nx = x + (w - 22) - nw - 6;
  R(c, nx, by + 3, nw, 12, "#17131f"); txt(c, name, nx + 3, by + 5, o.nameColor || "#ffd23f", 2, 1); em.push([nx, by + 3, nw, 12]);
  R(c, x + w - 56, by + 24, 14, 20, "#17131f"); for (let i = 0; i < 4; i++) HL(c, x + w - 54, by + 27 + i * 4, 10 - (i % 2) * 3, i ? "#e8e4f4" : "#ff3fa4");
  /* wheels */
  [x + 14, x + w - 22].forEach(wx2 => { ell(c, wx2 + 6, y - 6, 8, 8, "#0c0814"); ell(c, wx2 + 6, y - 6, 5, 5, "#3a364a"); ell(c, wx2 + 6, y - 6, 2, 2, "#8a86a0"); });
  R(c, x, y - 12, w, 4, "#2a2634"); HL(c, x, y - 12, w, "#5a566c");
  PK.util.dshade(c, x, by, w - 22, h - 8, "#0c0618", (px, py) => (py - by) / (h - 8) * 0.8, 0.28);
  return em;
};

/* ---------------------------------------------------------------------------------------- road case */
art.roadCase = function (c, x, y, w, h, o) {
  o = o || {};
  const col = o.color || "#2a2832", k = K(col);
  PK.contactShadow(c, x, y + h - 2, w, 4, { alpha: 0.45 });
  R(c, x, y, w, h, col);
  PK.gradV(c, x, y, w, h, [k[3], k[2], k[1]], { dither: 1 });
  HL(c, x, y, w, k[4]); VL(c, x, y, h, k[3]); VL(c, x + w - 1, y, h, k[0]); HL(c, x, y + h - 1, w, k[0]);
  /* aluminium extrusions, corner balls */
  R(c, x, y, w, 2, "#8a86a0"); HL(c, x, y, w, "#e8e4f4"); R(c, x, y + h - 2, w, 2, "#6a667c");
  [[x, y], [x + w - 3, y], [x, y + h - 3], [x + w - 3, y + h - 3]].forEach(p => { R(c, p[0], p[1], 3, 3, "#c8c4d8"); P(c, p[0], p[1], "#ffffff"); });
  /* latches */
  const nl = Math.max(1, fl(w / 22));
  for (let i = 0; i < nl; i++) { const lx = x + rd((i + 0.5) * w / nl) - 3, ly = y + fl(h * 0.4); R(c, lx, ly, 6, 4, "#8a86a0"); HL(c, lx, ly, 6, "#e8e4f4"); R(c, lx + 1, ly + 2, 4, 1, "#3a364a"); }
  if (o.label) { const tw = txtW(o.label, 1, 1) + 4; R(c, x + fl((w - tw) / 2), y + fl(h * 0.18), tw, 7, o.labelBg || "#e8e0cc"); txtC(c, o.label, x + w / 2, y + fl(h * 0.18) + 1, "#1d1622", 1); }
  if (o.sticker) R(c, x + 4, y + h - 9, 5, 5, o.sticker);
  if (o.wheels) { ell(c, x + 4, y + h + 1, 2, 2, "#0c0814"); ell(c, x + w - 5, y + h + 1, 2, 2, "#0c0814"); }
};

/* ---------------------------------------------------------------------------------------- line array */
art.lineArray = function (c, x, y, n, w, o) {
  o = o || {};
  const body = o.color || "#26232e", k = K(body), ch = o.ch || 11, cx = x + fl(w / 2);
  R(c, cx - 1, y - 9, 2, 9, "#8a86a0"); R(c, cx - 5, y - 11, 10, 3, "#3a364a"); HL(c, cx - 5, y - 11, 10, "#8a86a0");
  for (let i = 0; i < n; i++) {
    const cy = y + i * (ch + 1), skew = rd(i * (o.curve == null ? 0.5 : o.curve)), cw = w - rd(i * 0.3), px0 = x + skew;
    R(c, px0, cy, cw, ch, body);
    HL(c, px0, cy, cw, k[4]); VL(c, px0, cy, ch, k[3]); VL(c, px0 + cw - 1, cy, ch, k[0]); HL(c, px0, cy + ch - 1, cw, k[0]);
    for (let py = cy + 2; py < cy + ch - 2; py++) for (let px = px0 + 2; px < px0 + cw - 2; px++) P(c, px, py, (px + py) % 2 === 0 ? "#12101a" : "#34304a");
    R(c, px0 + 3, cy + fl(ch / 2) - 1, cw - 6, 2, "#0a0810"); HL(c, px0 + 3, cy + fl(ch / 2) - 1, cw - 6, "#5a566c");
    R(c, px0 - 1, cy + 1, 1, ch - 2, "#8a86a0"); R(c, px0 + cw, cy + 1, 1, ch - 2, "#6a667c");
  }
};

/* stage monitor wedge */
art.wedge = function (c, x, y, o) {
  o = o || {};
  poly(c, [[x, y + 8], [x + 24, y + 8], [x + 22, y + 3], [x + 4, y]], "#1c1a24");
  line(c, x + 4, y, x + 22, y + 3, "#5a566c"); HL(c, x, y + 8, 24, "#0a0810");
  poly(c, [[x + 4, y + 1], [x + 21, y + 4], [x + 22, y + 8], [x + 1, y + 8]], "#2a2736");
  ell(c, x + 11, y + 5, 4, 2, "#0e0c14"); ell(c, x + 11, y + 5, 2, 1, "#3a364a");
};

/* pavement with painted festival markings, cable ramps and litter */
art.pavement = function (c, x, y, w, h, o) {
  o = o || {};
  PK.concrete(c, x, y, w, h, { base: o.base || "#6a6684", seed: o.seed || 5 });
  const r = mulberry((o.seed || 5) + 40);
  /* expansion joints in perspective */
  for (let i = 0; i < w; i += 70 + fl(r() * 40)) { R(c, x + i, y, 1, h, mix(o.base || "#6a6684", "#140c24", 0.35)); }
  for (let yy = y + 6; yy < y + h; yy += 12 + fl((yy - y) / 6)) HL(c, x, yy, w, mix(o.base || "#6a6684", "#140c24", 0.25));
  PK.speckle(c, x, y, w, h, [mix(o.base || "#6a6684", "#ffffff", 0.25), mix(o.base || "#6a6684", "#140c24", 0.4)], 0.02, 77);
};
art.cableRamp = function (c, x, y, w) {
  R(c, x, y, w, 5, "#e8c020"); HL(c, x, y, w, "#fff08a"); HL(c, x, y + 4, w, "#8a6a10");
  for (let i = 2; i < w - 2; i += 8) { R(c, x + i, y + 1, 4, 1, "#17131f"); }
  poly(c, [[x - 2, y + 5], [x, y], [x, y + 5]], "#8a6a10"); poly(c, [[x + w + 2, y + 5], [x + w, y], [x + w, y + 5]], "#8a6a10");
};
art.litter = function (c, x, y, w, h, seed, cols) {
  const r = mulberry(seed || 3), cc = cols || ["#ff3fa4", "#39d0ff", "#ffd23f", "#e8e4f0", "#9be15d"];
  for (let i = 0; i < w * h / 80; i++) { const px = x + fl(r() * w), py = y + fl(r() * h); R(c, px, py, 1 + fl(r() * 2), 1, cc[fl(r() * cc.length)]); }
  for (let i = 0; i < w / 90; i++) { const px = x + fl(r() * w), py = y + fl(r() * h); R(c, px, py, 3, 2, "#efeaf6"); HL(c, px, py, 3, "#ffffff"); R(c, px, py + 2, 3, 1, "#a8a4b8"); } // cups
};

/* tree line silhouette */
art.treeLine = function (c, x, y, w, o) {
  o = o || {};
  const r = mulberry(o.seed || 5), dark = o.dark || "#1c1030", mid = o.mid || "#271645";
  R(c, x, y + 4, w, 14, dark);
  for (let px = x - 10; px < x + w + 10; px += 9) { const hh = 10 + r() * 16, rx = 8 + r() * 8; ell(c, px, y - hh * 0.4 + 4, rx, hh * 0.9, dark); }
  for (let px = x - 10; px < x + w + 10; px += 14) { const hh = 6 + r() * 12; ell(c, px + 4, y - hh * 0.4, 6 + r() * 6, hh * 0.7, mid); }
  PK.speckle(c, x, y - 10, w, 24, [mix(dark, "#ffffff", 0.12), mix(dark, "#000000", 0.3)], 0.18, 3);
};

/* hanging fabric banner on a pole (vertical), with lines of text */
art.banner = function (c, x, y, h, lines, o) {
  o = o || {};
  const col = o.color || "#14102e", acc = o.accent || "#ff3fa4", w = o.w || 22, em = [];
  R(c, x - 1, y - 6, 2, h + 8, "#8a86a0"); R(c, x - w / 2 - 2, y - 6, w + 4, 3, "#8a86a0"); HL(c, x - w / 2 - 2, y - 6, w + 4, "#e8e4f4");
  const bx = x - w / 2;
  R(c, bx, y - 3, w, h, col); PK.gradV(c, bx, y - 3, w, h, [mix(col, "#ffffff", 0.08), col, mix(col, "#000000", 0.25)], { dither: 1 });
  for (let i = 0; i < w; i += 4) VL(c, bx + i, y - 3, h, mix(col, "#000000", 0.12));
  HL(c, bx, y - 3, w, acc); HL(c, bx, y - 2, w, mix(acc, "#14081e", 0.4));
  for (let i = 0; i < w; i += 3) P(c, bx + i, y - 3 + h - 1, acc);
  let ty = y + 2;
  lines.forEach(L => { const sc = (typeof L === "object" ? L.sc : 1) || 1, t = typeof L === "object" ? L.t : L, cc = (typeof L === "object" && L.c) || "#f4f0e8"; txtC(c, t, x, ty, cc, sc, 1); ty += sc * 5 + 3; });
  return em;
};

/* a tall lit sign with text on a frame (on posts) */
art.signboard = function (c, x, y, w, h, text, o) {
  o = o || {};
  const col = o.color || "#17131f", kc = K(col), acc = o.accent || "#ffd23f", em = [];
  R(c, x, y, w, h, col); PK.gradV(c, x, y, w, h, [kc[3], kc[2], kc[1]], { dither: 1 });
  HL(c, x, y, w, kc[4]); VL(c, x, y, h, kc[3]); VL(c, x + w - 1, y, h, kc[0]); HL(c, x, y + h - 1, w, kc[0]);
  const sc = o.sc || 1;
  const lines = [].concat(text);
  const th = lines.length * (sc * 5 + 2) - 2, ty0 = y + fl((h - th) / 2) + 0;
  lines.forEach((L, i) => txtC(c, L, x + w / 2, ty0 + i * (sc * 5 + 2), i === 0 ? acc : (o.sub || "#e8e4f4"), sc, 1));
  if (o.lit) em.push([x + 1, y + 1, w - 2, h - 2]);
  return em;
};

/* the Harbor Lights wordmark used on banners and arches: two lines with a lighthouse */
art.hlWordmark = function (c, cx, y, sc, o) {
  o = o || {};
  const em = [];
  const t1 = "HARBOR", t2 = "LIGHTS";
  txtC(c, t1, cx + 1, y + 1, o.shadow || "#0c0818", sc, sc);
  txtC(c, t1, cx, y, o.c1 || "#ff3fa4", sc, sc);
  txtC(c, t2, cx + 1, y + sc * 6 + 1, o.shadow || "#0c0818", sc, sc);
  txtC(c, t2, cx, y + sc * 6, o.c2 || "#39d0ff", sc, sc);
  return em;
};

/* cache a (heavy) static prop into a trimmed canvas: painted once per key, blitted every frame.
   fn(ctx, S) paints at absolute room coordinates; keyFn(S) invalidates. Use for depth-sorted sprites. */
art.sprite = function (fn, keyFn) {
  let cv = null, ox = 0, oy = 0, key = null;
  return function (c, S) {
    const k = keyFn ? String(keyFn(S)) : "";
    if (!cv || k !== key) {
      const room = RP.curRoom(), W = (room && room.width) || 640;
      const tmp = U.mk(W, 256), tc = tmp.getContext("2d");
      try { fn(tc, S); } catch (e) { console.error(e); }
      const d = tc.getImageData(0, 0, W, 256).data;
      let x0 = W, y0 = 256, x1 = -1, y1 = -1;
      for (let y = 0; y < 256; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 < 0) { cv = U.mk(1, 1); ox = 0; oy = 0; }
      else { const w = x1 - x0 + 1, h = y1 - y0 + 1; cv = U.mk(w, h); cv.getContext("2d").drawImage(tmp, x0, y0, w, h, 0, 0, w, h); ox = x0; oy = y0; }
      key = k;
    }
    c.drawImage(cv, ox, oy);
  };
};

/* emissive rect minus holes (foreground structures that must still be lit by the room lights) */
art.emissiveExcept = function (x, y, w, h, holes) {
  const out = [];
  let prev = null;
  for (let yy = y; yy < y + h; yy++) {
    const spans = [[x, x + w]];
    (holes || []).forEach(hh => {
      if (yy < hh[1] || yy >= hh[1] + hh[3]) return;
      const a = hh[0], b = hh[0] + hh[2];
      for (let i = spans.length - 1; i >= 0; i--) {
        const s0 = spans[i];
        if (b <= s0[0] || a >= s0[1]) continue;
        const parts = [];
        if (a > s0[0]) parts.push([s0[0], a]);
        if (b < s0[1]) parts.push([b, s0[1]]);
        spans.splice(i, 1, ...parts);
      }
    });
    const key = JSON.stringify(spans);
    if (prev && prev.key === key) { prev.rects.forEach(r => r[3]++); }
    else { prev = { key, rects: spans.map(sp => [sp[0], yy, sp[1] - sp[0], 1]) }; prev.rects.forEach(r => out.push(r)); }
  }
  return out;
};

/* vertical truss column */
art.trussV = function (c, x, y, h, w) {
  w = w || 10;
  const col = "#9a98ac", k = K(col);
  R(c, x, y, 2, h, col); VL(c, x, y, h, k[4]); R(c, x + w - 2, y, 2, h, col); VL(c, x + w - 1, y, h, k[0]);
  for (let py = y; py < y + h - 8; py += 8) { line(c, x + 2, py, x + w - 3, py + 8, k[2]); line(c, x + w - 3, py + 8, x + 2, py + 16 > y + h ? y + h : py + 16, k[1]); }
  R(c, x - 3, y + h - 4, w + 6, 4, "#3a364a"); HL(c, x - 3, y + h - 4, w + 6, "#8a86a0");
  R(c, x - 6, y + h, w + 12, 6, "#6a667c"); HL(c, x - 6, y + h, w + 12, "#a8a4b8"); HL(c, x - 6, y + h + 5, w + 12, "#2a2838");
};

/* metal pipe railing with posts */
art.railing = function (c, x, y, w, o) {
  o = o || {};
  const col = o.color || "#8a86a0";
  for (let px = x; px <= x + w; px += o.gap || 22) { R(c, px, y, 2, 14, col); VL(c, px, y, 14, "#e8e4f4"); }
  R(c, x, y, w + 2, 2, col); HL(c, x, y, w + 2, "#e8e4f4"); R(c, x, y + 7, w + 2, 1, "#6a667c");
};

/* a Ferris wheel (static parts), plus a per-frame rotating part. Lit gondolas and rim bulbs. */
art.ferrisBase = function (c, cx, cy, r, col) {
  col = col || "#2a2448";
  R(c, cx - 1, cy, 3, r + 14, col);
  line(c, cx, cy, cx - r * 0.5, cy + r + 14, col); line(c, cx, cy, cx + r * 0.5, cy + r + 14, col);
  line(c, cx + 1, cy, cx - r * 0.5 + 1, cy + r + 14, col); line(c, cx + 1, cy, cx + r * 0.5 + 1, cy + r + 14, col);
  R(c, cx - r * 0.5 - 4, cy + r + 13, r + 8, 2, col);
};
art.ferrisDraw = function (c, cx, cy, r, t, o) {
  o = o || {};
  const col = o.color || "#3a3068", n = 12, rot = RP.fx && RP.fx.reduced ? 0 : t / 9000;
  PK.util.ring(c, rd(cx), rd(cy), r, col); PK.util.ring(c, rd(cx), rd(cy), r - 1, col);
  for (let i = 0; i < n; i++) {
    const a = rot + i * PI * 2 / n, ex = cx + cos(a) * r, ey = cy + sin(a) * r;
    line(c, cx, cy, ex, ey, col);
    const gcol = (o.cols || ["#ff3fa4", "#39d0ff", "#ffd23f", "#9be15d"])[i % 4];
    R(c, rd(ex) - 2, rd(ey), 5, 4, gcol); R(c, rd(ex) - 2, rd(ey), 5, 1, "#ffffff"); P(c, rd(ex), rd(ey) - 1, col);
  }
  for (let i = 0; i < 36; i++) {
    const a = rot * 1.0 + i * PI * 2 / 36, ex = cx + cos(a) * r, ey = cy + sin(a) * r, on = (i + Math.floor(t / 300)) % 3 !== 0;
    P(c, rd(ex), rd(ey), on ? (o.bulb || "#ffe9a0") : col);
  }
  ell(c, cx, cy, 2, 2, "#c8c4d8");
};

/* a dome camping tent */
art.domeTent = function (c, x, y, w, h, o) {
  o = o || {};
  const col = o.color || "#3a8a5a", k = K(col);
  PK.contactShadow(c, x - 4, y + h - 3, w + 8, 7, { alpha: 0.45 });
  for (let yy = 0; yy < h; yy++) {
    const t = yy / h, half = Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t))) * (w / 2);
    R(c, rd(x + w / 2 - half), y + yy, rd(half * 2), 1, yy < h * 0.15 ? k[3] : col);
  }
  PK.util.dshade(c, x, y, w, h, "#140c24", (px, py) => ((px - x) / w) * 0.7 + (py - y) / h * 0.2, 0.5);
  /* poles + door flap */
  line(c, x + 4, y + h - 2, x + w / 2, y + 1, k[4]); line(c, x + w - 4, y + h - 2, x + w / 2, y + 1, k[1]);
  poly(c, [[x + w * 0.38, y + h], [x + w * 0.62, y + h], [x + w * 0.56, y + h * 0.45], [x + w * 0.44, y + h * 0.45]], "#0c0818");
  line(c, rd(x + w * 0.44), rd(y + h * 0.45), rd(x + w * 0.38), y + h, k[3]); line(c, rd(x + w * 0.56), rd(y + h * 0.45), rd(x + w * 0.62), y + h, k[0]);
  HL(c, x + 2, y + h - 1, w - 4, k[0]);
};

/* a trailer (production office, dressing rooms). (x,y) is the top-left; h includes the wheels. */
art.trailer = function (c, x, y, w, h, o) {
  o = o || {};
  const col = o.color || "#e8e4f0", k = K(col), em = [], bodyH = h - 10;
  PK.contactShadow(c, x - 4, y + h - 4, w + 8, 8, { alpha: 0.5 });
  /* hitch + steps */
  line(c, x - 14, y + h - 8, x + 2, y + h - 12, "#3a364a"); R(c, x - 16, y + h - 9, 4, 3, "#17131f");
  R(c, x, y, w, bodyH, col); PK.gradV(c, x, y, w, bodyH, [k[4], k[3], k[2], k[2], k[1]], { dither: 1 });
  HL(c, x, y, w, k[4]); HL(c, x + 1, y + 1, w - 2, mix(col, "#ffffff", 0.7)); VL(c, x, y, bodyH, k[3]); VL(c, x + w - 1, y, bodyH, k[0]); HL(c, x, y + bodyH - 1, w, k[0]);
  for (let px = x + 3; px < x + w - 2; px += 10) VL(c, px, y + 3, bodyH - 6, mix(col, "#14081e", 0.08));
  /* stripe + skirt */
  R(c, x, y + Math.round(bodyH * 0.62), w, 4, o.stripe || "#39d0ff"); HL(c, x, y + Math.round(bodyH * 0.62), w, mix(o.stripe || "#39d0ff", "#ffffff", 0.5));
  R(c, x, y + bodyH, w, 4, "#2a2838"); HL(c, x, y + bodyH, w, "#6a667c");
  /* AC unit */
  R(c, x + Math.round(w * 0.55), y - 5, 26, 6, "#a8a4b8"); HL(c, x + Math.round(w * 0.55), y - 5, 26, "#e8e4f4"); for (let i = 0; i < 5; i++) VL(c, x + Math.round(w * 0.55) + 3 + i * 4, y - 4, 4, "#6a667c");
  /* windows */
  (o.windows || [[0.12, 0.2, 22, 12], [0.66, 0.2, 22, 12]]).forEach(wd => {
    const wx = x + Math.round(w * wd[0]), wy = y + Math.round(bodyH * wd[1]), ww = wd[2], wh = wd[3];
    R(c, wx - 1, wy - 1, ww + 2, wh + 2, "#3a364a"); R(c, wx, wy, ww, wh, o.lit ? "#ffd890" : "#2a3a5a");
    if (o.lit) { PK.gradV(c, wx, wy, ww, wh, ["#fff0c0", "#ffc070"], { dither: 1 }); em.push([wx, wy, ww, wh]); } else { PK.gradV(c, wx, wy, ww, wh, ["#5a7aa0", "#2a3a5a"], { dither: 1 }); PK.util.dshade(c, wx, wy, ww, wh, "#ffffff", (px, py) => ((px - wx) + (py - wy) + 400) % 20 < 3 ? 1 : 0, 0.3); }
    for (let i = 2; i < wh; i += 3) HL(c, wx, wy + i, ww, o.lit ? "#c88a3a" : "#1c2a44");
  });
  /* door */
  const dx = x + Math.round(w * (o.doorX == null ? 0.38 : o.doorX)), dw = 14, dh = Math.round(bodyH * 0.8), dy = y + bodyH - dh;
  R(c, dx - 1, dy - 1, dw + 2, dh + 1, "#3a364a"); R(c, dx, dy, dw, dh, o.doorColor || "#c8c4d8"); VL(c, dx, dy, dh, "#fff"); VL(c, dx + dw - 1, dy, dh, "#6a667c");
  R(c, dx + 2, dy + 3, dw - 4, 8, o.lit ? "#ffd890" : "#2a3a5a"); if (o.lit) em.push([dx + 2, dy + 3, dw - 4, 8]);
  R(c, dx + dw - 4, dy + dh / 2, 2, 3, "#e0c870");
  for (let i = 0; i < 3; i++) { R(c, dx - 3 - i, y + bodyH - 2 + i * 0, dw + 6 + i * 2, 2, "#8a86a0"); }
  R(c, dx - 5, y + bodyH + 1, dw + 10, 3, "#6a667c"); HL(c, dx - 5, y + bodyH + 1, dw + 10, "#c8c4d8");
  /* wheels */
  [x + 18, x + w - 26].forEach(wx => { ell(c, wx + 4, y + h - 5, 7, 6, "#0c0814"); ell(c, wx + 4, y + h - 5, 4, 4, "#3a364a"); ell(c, wx + 4, y + h - 5, 1, 1, "#8a86a0"); });
  /* name plate */
  if (o.name) { const nw = txtW(o.name, 1, 1) + 6, nx = x + Math.round(w * 0.12), ny = y + Math.round(bodyH * 0.2) + 16; R(c, nx, ny, nw, 8, o.nameBg || "#17131f"); HL(c, nx, ny, nw, "#ffffff55"); txt(c, o.name, nx + 3, ny + 2, o.nameColor || "#ffd23f", 1, 1); }
  return em;
};

/* egg-crate acoustic foam tiles */
art.foam = function (c, x, y, w, h, o) {
  o = o || {};
  const A = o.a || "#3e2e62", B = o.b || "#34264f", Hi = o.hi || "#5a4690", Hi2 = o.hi2 || "#4a3a78", Lo = o.lo || "#1c1230", T = o.tile || 12;
  for (let ty = y; ty < y + h; ty += T) for (let tx = x; tx < x + w; tx += T) {
    const ww = Math.min(T, x + w - tx), hh = Math.min(T, y + h - ty), a = ((tx - x + ty - y) / T) % 2 === 0;
    R(c, tx, ty, ww, hh, a ? A : B);
    const m = (T - 1) / 2;
    for (let i = 0; i < hh; i++) for (let j = 0; j < ww; j++) {
      const dd = Math.abs(j - m) + Math.abs(i - m);
      if (dd < T / 2 && (dd + i) % 2 === 0) P(c, tx + j, ty + i, a ? Hi : Hi2);
      else if (dd > T * 0.75) P(c, tx + j, ty + i, Lo);
    }
    HL(c, tx, ty, ww, Lo); VL(c, tx, ty, hh, Lo);
  }
};

})();
