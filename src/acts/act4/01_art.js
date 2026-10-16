/* Act 4 — shared art helpers (loaded after 00_act4.js, before the rooms). Everything is pixel-snapped. */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u, PK = RP.PK, A4 = RP.a4;
const { R, P, ell, line, poly, txt, txtW, bayer, mulberry, mk, ramp, mix } = U;

/* cache a small sprite once; returns draw(c, x, y) */
A4.spr = (w, h, fn) => { let cv = null; return (c, x, y) => { if (!cv) { cv = mk(w, h); fn(cv.getContext("2d")); } c.drawImage(cv, Math.round(x), Math.round(y)); }; };

/* hanging airport-style sign: dark blue panel, yellow text, optional arrow ("<", ">", "^", "v") */
A4.hangSign = function (c, x, y, w, text, o) {
  o = o || {};
  const h = o.h || 15, bg = o.bg || "#14306a", fg = o.fg || "#ffd23f", em = [];
  R(c, x + 6, y - 14, 1, 14, "#2a2838"); R(c, x + w - 7, y - 14, 1, 14, "#2a2838");
  R(c, x - 1, y - 1, w + 2, h + 2, "#0a1230"); R(c, x, y, w, h, bg); R(c, x, y, w, 1, mix(bg, "#ffffff", 0.35)); R(c, x, y + h - 1, w, 1, mix(bg, "#000000", 0.35));
  const sc = o.scale || 1, tw = txtW(text, sc, 1), ax = o.arrow ? 9 : 0;
  const tx = Math.round(x + (w - tw - ax) / 2) + (o.arrow === "<" ? ax : 0), ty = y + Math.round((h - 5 * sc) / 2);
  txt(c, text, tx, ty, fg, sc, 1);
  if (o.arrow) {
    const cx = o.arrow === "<" ? x + 7 : x + w - 7, cy = y + Math.round(h / 2);
    if (o.arrow === "<") { R(c, cx - 3, cy, 7, 1, fg); P(c, cx - 2, cy - 1, fg); P(c, cx - 2, cy + 1, fg); P(c, cx - 1, cy - 2, fg); P(c, cx - 1, cy + 2, fg); }
    else if (o.arrow === ">") { R(c, cx - 3, cy, 7, 1, fg); P(c, cx + 2, cy - 1, fg); P(c, cx + 2, cy + 1, fg); P(c, cx + 1, cy - 2, fg); P(c, cx + 1, cy + 2, fg); }
    else if (o.arrow === "^") { R(c, cx, cy - 3, 1, 7, fg); P(c, cx - 1, cy - 2, fg); P(c, cx + 1, cy - 2, fg); P(c, cx - 2, cy - 1, fg); P(c, cx + 2, cy - 1, fg); }
  }
  em.push([x, y, w, h]);
  return em;
};

/* stanchion posts with a belt between them */
A4.stanchions = function (c, x0, x1, y, o) {
  o = o || {}; const n = o.n || Math.max(2, Math.round((x1 - x0) / 36)), belt = o.belt || "#c0302c";
  const xs = []; for (let i = 0; i < n; i++) xs.push(Math.round(x0 + i * (x1 - x0) / (n - 1)));
  for (let i = 0; i < n - 1; i++) { const a = xs[i], b = xs[i + 1]; for (let x = a; x <= b; x++) { const t = (x - a) / (b - a), sag = Math.round(Math.sin(t * Math.PI) * 2); R(c, x, y - 18 + sag, 1, 3, belt); P(c, x, y - 18 + sag, mix(belt, "#ffffff", 0.4)); } }
  xs.forEach(x => {
    PK.util.groundShadow(c, x, y + 1, 5, 1, 0.4);
    R(c, x - 1, y - 24, 3, 24, "#9a98ac"); R(c, x - 1, y - 24, 1, 24, "#e8e4f4"); R(c, x + 1, y - 24, 1, 24, "#5a566c");
    R(c, x - 4, y - 2, 9, 2, "#6a667c"); R(c, x - 4, y - 2, 9, 1, "#c8c4d8"); ell(c, x, y - 25, 2, 2, "#c8c4d8"); P(c, x - 1, y - 26, "#ffffff");
  });
};

/* A-frame wet floor sign */
A4.wetFloor = function (c, x, y) {
  PK.util.groundShadow(c, x + 8, y + 22, 9, 2, 0.4);
  poly(c, [[x + 8, y], [x + 16, y + 22], [x, y + 22]], "#e8c020"); poly(c, [[x + 8, y + 2], [x + 14, y + 21], [x + 2, y + 21]], "#ffd23f");
  R(c, x + 6, y + 6, 4, 6, "#17131f"); P(c, x + 7, y + 14, "#17131f"); P(c, x + 8, y + 14, "#17131f"); P(c, x + 7, y + 15, "#17131f"); P(c, x + 8, y + 15, "#17131f");
  R(c, x, y + 21, 17, 1, "#8a6a10"); R(c, x + 8, y, 1, 22, "#c8a010");
};

/* Berlin cobblestones in rough perspective rows */
A4.cobbles = function (c, x, y, w, h, o) {
  o = o || {}; const base = o.base || "#5a566c", rnd = mulberry(o.seed || 7), k = ramp(base);
  R(c, x, y, w, h, k[0]);
  let yy = y, row = 0;
  while (yy < y + h) {
    const rh = Math.max(3, Math.round(3 + (yy - y) / h * 6)), sw = Math.max(5, Math.round(rh * 1.5));
    let xx = x - ((row * 3) % sw);
    while (xx < x + w) {
      const ww = sw + Math.round(rnd() * 3) - 1, v = rnd(), col = v < 0.2 ? k[3] : v < 0.5 ? k[2] : v < 0.8 ? mix(k[2], k[1], 0.5) : k[1];
      const x0 = Math.max(x, xx), x1 = Math.min(x + w, xx + ww - 1);
      if (x1 > x0) {
        R(c, x0, yy, x1 - x0, Math.min(rh - 1, y + h - yy), col);
        if (xx >= x) R(c, x0, yy, x1 - x0, 1, k[3]);
        R(c, x0, yy + Math.min(rh - 1, y + h - yy) - 1, x1 - x0, 1, k[1]);
        if (rnd() < 0.3) P(c, x0 + 1 + Math.floor(rnd() * Math.max(1, x1 - x0 - 2)), yy + 1 + Math.floor(rnd() * Math.max(1, rh - 3)), k[4]);
      }
      xx += ww;
    }
    yy += rh; row++;
  }
  PK.speckle(c, x, y, w, h, [k[0], k[1]], 0.03, o.seed || 7);
};

/* small round pixel clock/badge: filled circle with border */
A4.badge = function (c, cx, cy, r, bg, fg) { ell(c, cx, cy, r, r, fg); ell(c, cx, cy, r - 1, r - 1, bg); };

/* generic puddle: an elliptical dark patch with colored reflection streaks (rain nights) */
A4.puddle = function (c, cx, cy, rx, ry, cols, seed) {
  const rnd = mulberry(seed || 3);
  PK.util.dshade(c, cx - rx, cy - ry, rx * 2 + 1, ry * 2 + 1, "#0a0818", (px, py) => { const dx = (px - cx) / rx, dy = (py - cy) / ry, d = dx * dx + dy * dy; return d > 1 ? 0 : 1.2 - d * 0.5; }, 0.55);
  for (let i = 0; i < Math.max(3, rx / 3); i++) { const sx = Math.round(cx - rx * 0.7 + rnd() * rx * 1.4), sy = Math.round(cy - ry * 0.6 + rnd() * ry * 1.2), col = cols[i % cols.length]; const w = 3 + Math.floor(rnd() * 8); if (((sx - cx) / rx) ** 2 + ((sy - cy) / ry) ** 2 < 0.8) { PK.util.AR(c, sx, sy, w, 1, col, 0.55); } }
  [[-0.6, -0.5], [0.4, 0.3]].forEach(([a, b]) => PK.util.AP(c, Math.round(cx + a * rx), Math.round(cy + b * ry), "#ffffff", 0.35));
};
})();
