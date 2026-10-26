/* Act 4 — a4_berlin_street (960 px, scrolling): a rainy Berlin night. U-Bahn stairs, a Späti (late-night kiosk, Kemal),
   a poster column, Hotel Zum Pfau, a railway viaduct, and the way to Halle Neun.
   Flags: a4_doorHint a4_bottles a4_pfand a4_streetIntro a4_setDone (hotel unlocked afterwards) */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u, PK = RP.PK, A4 = RP.a4;
const { R, P, ell, poly, line, txt, txtW, bayer, mulberry, mix } = U;
const W = 960;

const sprCrates = A4.spr(48, 40, c => {
  for (let i = 0; i < 2; i++) { const x = 2 + i * 22; R(c, x, 16, 22, 22, "#2f62b8"); R(c, x, 16, 22, 2, "#4a80d8"); R(c, x, 36, 22, 2, "#1d3f7a"); for (let yy = 20; yy < 34; yy += 5) for (let xx = x + 3; xx < x + 20; xx += 5) R(c, xx, yy, 3, 3, "#1d3f7a");
    for (let b = 0; b < 4; b++) { R(c, x + 3 + b * 5, 4, 4, 13, ["#3a8a4a", "#c8925a", "#3a8a4a", "#e8e0c0"][b]); R(c, x + 4 + b * 5, 2, 2, 3, "#c8c4d8"); R(c, x + 3 + b * 5, 4, 1, 12, "#ffffff55"); } }
});
const sprBench = A4.spr(60, 30, c => { R(c, 4, 10, 52, 5, "#6a4a30"); R(c, 4, 10, 52, 1, "#a8743e"); R(c, 4, 2, 52, 5, "#6a4a30"); R(c, 4, 2, 52, 1, "#a8743e"); R(c, 6, 15, 4, 14, "#2a2838"); R(c, 50, 15, 4, 14, "#2a2838");
  R(c, 14, 0, 4, 10, "#3a8a4a"); R(c, 15, 0, 2, 2, "#c8c4d8"); R(c, 28, 4, 4, 6, "#3a8a4a"); });
const sprBottle = A4.spr(8, 14, c => { R(c, 2, 4, 4, 9, "#3a7a3a"); R(c, 3, 1, 2, 4, "#3a7a3a"); R(c, 3, 0, 2, 1, "#c8c4d8"); R(c, 2, 4, 1, 8, "#8aca8a"); });
const sprColumn = A4.spr(40, 100, c => {
  R(c, 6, 4, 28, 6, "#2a3a30"); R(c, 6, 4, 28, 1, "#5a7a68"); ell(c, 20, 3, 14, 3, "#2a3a30"); ell(c, 20, 2, 12, 2, "#4a6a58");
  for (let y = 10; y < 86; y++) { for (let x = 6; x < 34; x++) { const d = (x - 20) / 14, shade = 0.45 + 0.55 * Math.sqrt(Math.max(0, 1 - d * d)) * (d < 0 ? 1.1 : 0.8); R(c, x, y, 1, 1, "#" + ["c8c0a8", "d8d0b8"][0]); } }
  PK.util.dshade(c, 6, 10, 28, 76, "#0c0618", (px, py) => ((px - 6) / 28) * 1.2, 0.45);
  const rnd = mulberry(5); [[8, 14, 12, 14, "#ff3fa4"], [22, 12, 10, 12, "#efe6d0"], [9, 32, 11, 12, "#39d0ff"], [22, 30, 11, 16, "#ffd23f"], [8, 48, 14, 14, "#17131f"], [24, 50, 9, 12, "#c0302c"], [8, 66, 10, 12, "#efe6d0"], [20, 66, 13, 14, "#9be15d"]].forEach(([x, y, w, h, col]) => { R(c, x, y, w, h, col); R(c, x, y, w, 1, "#ffffff44"); for (let i = 0; i < 3; i++) R(c, x + 1, y + 2 + i * 3, w - 3, 1, i % 2 ? "#17131f88" : "#ffffff55"); });
  txt(c, "HALLE", 9, 34, "#17131f"); txt(c, "NEUN", 11, 41, "#17131f");
  R(c, 4, 86, 32, 5, "#2a3a30"); R(c, 4, 86, 32, 1, "#5a7a68"); R(c, 8, 91, 24, 7, "#1a2a24"); R(c, 6, 98, 28, 2, "#0a1a14");
});
const sprBikeA = A4.spr(52, 34, c => PK.bike(c, 2, 2, { color: "#3a7a5a", seed: 3 }));
const sprBikeB = A4.spr(52, 34, c => PK.bike(c, 2, 2, { color: "#c0302c", seed: 9 }));
const sprTrash = A4.spr(24, 34, c => PK.trashCan(c, 2, 4, { color: "#2f6a3a", full: true }));
const sprLampPost = A4.spr(14, 120, c => { /* sticker-covered lamp post */
  R(c, 5, 0, 5, 118, "#3a3a46"); R(c, 5, 0, 1, 118, "#6a6a7a"); R(c, 4, 116, 7, 4, "#2a2a34");
  const cols = ["#ff3fa4", "#39d0ff", "#ffd23f", "#efe6d0", "#9be15d", "#c0302c", "#17131f"]; const rnd = mulberry(8);
  for (let i = 0; i < 28; i++) R(c, 4 + Math.floor(rnd() * 3), 34 + Math.floor(rnd() * 80), 2 + Math.floor(rnd() * 4), 2 + Math.floor(rnd() * 5), cols[Math.floor(rnd() * cols.length)]);
});

/* ------------------------------------------------------------------ paint helpers */
function windowsRow(c, x, w, floors, top, rnd, opts, em) {
  const n = Math.max(1, Math.floor((w - 12) / 40)), gap = (w - 12) / n;
  floors.forEach(fy => {
    if (fy < top + 4) return;
    for (let i = 0; i < n; i++) {
      const wx = Math.round(x + 6 + i * gap + (gap - 28) / 2);
      const lit = rnd() < (opts.lit == null ? 0.45 : opts.lit);
      const cur = ["#c0555a", "#5a7ab0", "#d8a050", "#8a5a9a", "#5a9a7a"][Math.floor(rnd() * 5)];
      const e = PK.window(c, wx, fy, 28, 40, { view: "interior", lit, curtain: cur, frame: opts.frame || "#d8d0c0", frameW: 3, sill: opts.sill || "#c8c0b0", seed: Math.floor(rnd() * 1e6) });
      if (e && lit) e.forEach(r => em.push(r));
      PK.util.dshade(c, wx - 3, fy - 4, 34, 4, "#0c0618", (px, py) => 1 - (py - fy + 4) / 4, 0.3);
    }
  });
}
function facade(c, x, w, top, base, col, seed, floors, em, o) {
  o = o || {};
  PK.plaster(c, x, top, w, base - top, { base: col, seed, patches: 1, stains: 2, cracks: 1 });
  const k = U.ramp(col);
  // cornice and string courses
  R(c, x - 2, top, w + 4, 5, k[3]); R(c, x - 2, top, w + 4, 1, k[4]); R(c, x - 2, top + 5, w + 4, 2, k[0]);
  PK.util.dshade(c, x - 2, top + 7, w + 4, 6, "#0c0618", (px, py) => 1 - (py - top - 7) / 6, 0.38);
  floors.forEach(fy => { R(c, x, fy + 42, w, 3, k[3]); R(c, x, fy + 42, w, 1, k[4]); R(c, x, fy + 45, w, 1, k[0]); });
  R(c, x - 1, top, 3, base - top, k[1]); R(c, x + w - 2, top, 3, base - top, k[0]);
  const rnd = mulberry(seed + 7);
  windowsRow(c, x, w, floors, top, rnd, o, em);
  // tags / sticker clutter low on the wall
  const tags = ["#ff3fa4", "#39d0ff", "#ffd23f", "#9be15d"];
  for (let i = 0; i < 6; i++) { const tx = x + 6 + Math.floor(rnd() * (w - 20)), ty = base - 40 + Math.floor(rnd() * 34); R(c, tx, ty, 5 + Math.floor(rnd() * 8), 2, tags[i % 4]); R(c, tx + 1, ty - 2, 2, 2, tags[i % 4]); }
}

/* ------------------------------------------------------------------ paint */
function paint(c, S) {
  const em = []; const E = a => { if (a && a.length) for (const r of a) em.push(r); return a; };
  // sky: overcast night with city glow low down
  PK.gradV(c, 0, 0, W, 180, ["#100c28", "#1c1238", "#341a48", "#5a2a58", "#8a4058"], { dither: 1 });
  PK.speckle(c, 0, 0, W, 60, ["#2a1c48", "#3a2858"], 0.05, 4);
  // TV tower in the distance
  const tx = 430;
  R(c, tx - 1, 28, 3, 130, "#221a38"); poly(c, [[tx - 4, 158], [tx + 5, 158], [tx + 2, 90], [tx - 1, 90]], "#221a38"); R(c, tx, 6, 1, 26, "#221a38");
  ell(c, tx, 52, 10, 9, "#2a2044"); ell(c, tx - 3, 49, 6, 5, "#3a2e5a"); ell(c, tx, 52, 11, 1, "#14102a"); R(c, tx - 8, 52, 17, 2, "#ffd890"); em.push([tx - 8, 52, 17, 2]);
  R(c, tx - 2, 62, 5, 7, "#221a38");
  // buildings
  facade(c, 120, 220, 18, 176, "#b09a78", 31, [76, 28], em, { lit: 0.5 });                       // Spaeti house
  facade(c, 340, 150, 62, 176, "#7a8a82", 33, [70], em, { lit: 0.4, sill: "#b8c0b8" });        // courtyard house (low, so the TV tower shows)
  facade(c, 490, 190, 16, 176, "#a87a78", 35, [76, 28], em, { lit: 0.55 });                        // hotel
  facade(c, -4, 124, 30, 176, "#8a7a98", 37, [74, 26], em, { lit: 0.4 });                          // by the U-Bahn
  // viaduct on the right
  PK.brick(c, 680, 0, 280, 180, { base: "#6a3a3e", mortar: "#6a5868", worn: 0.5, seed: 8, bw: 18, bh: 8 });
  R(c, 680, 0, 280, 28, "#2a2438"); R(c, 680, 28, 280, 3, "#4a4258"); R(c, 680, 0, 280, 2, "#6a6280");
  for (let x = 690; x < 960; x += 28) { R(c, x, 4, 2, 22, "#14101c"); R(c, x + 1, 4, 1, 22, "#3a3250"); }
  // the arch: a dark brick tunnel to Halle Neun
  ell(c, 820, 130, 74, 76, "#08060e"); R(c, 746, 130, 148, 50, "#08060e"); ell(c, 820, 130, 66, 68, "#100c1c"); R(c, 754, 130, 132, 50, "#100c1c");
  PK.util.dshade(c, 748, 62, 144, 118, "#000000", (px, py) => ((px - 748) / 144 < 0.5 ? (px - 748) / 144 : 1 - (px - 748) / 144) * 1.6, 0.5);
  for (let i = 0; i < 18; i++) { const a = -Math.PI * (0.05 + 0.9 * i / 17); const bx = 820 + Math.cos(a) * 78, by = 130 + Math.sin(a) * 80; R(c, bx - 3, by - 2, 8, 5, i % 2 ? "#8a5a50" : "#7a4a48"); }
  txt(c, "HALLE NEUN", 779, 90, "#ff3fa4", 2, 1); em.push([779, 90, 82, 12]);
  txt(c, "200M", 810, 108, "#39d0ff"); em.push([810, 108, 16, 5]);
  R(c, 880, 112, 22, 3, "#ff3fa4"); poly(c, [[902, 109], [910, 113.5], [902, 118]], "#ff3fa4"); em.push([880, 109, 30, 9]);
  // lamp under the arch + far glow
  PK.glow(c, 820, 150, 34, "#ff3fa4", { strength: 0.9 }).forEach(r => em.push(r));
  // sidewalk and street
  PK.sidewalk(c, 0, 176, W, 40, { curbY: 206, seed: 3 });
  A4.cobbles(c, 0, 214, W, 42, { base: "#4e4a62", seed: 4 });
  // tram tracks
  [232, 242].forEach(y => { R(c, 0, y, W, 2, "#6a667c"); R(c, 0, y, W, 1, "#b8b4cc"); R(c, 0, y + 2, W, 1, "#2a2638"); });
  for (let x = 6; x < W; x += 36) R(c, x, 232, 2, 12, "#2a2638");
  // reflective puddles
  A4.puddle(c, 210, 228, 30, 5, ["#ff3fa4", "#ffd890"], 1); A4.puddle(c, 420, 246, 26, 4, ["#ffb04a", "#39d0ff"], 2); A4.puddle(c, 720, 236, 34, 5, ["#ff3fa4", "#ffb04a"], 3); A4.puddle(c, 90, 222, 22, 4, ["#39d0ff", "#ffffff"], 4);
  // U-Bahn stairs (left)
  R(c, 16, 150, 64, 28, "#0a0810"); for (let i = 0; i < 6; i++) { R(c, 18 + i * 3, 152 + i * 4, 60 - i * 6, 3, i % 2 ? "#3a3650" : "#5a5670"); R(c, 18 + i * 3, 152 + i * 4, 60 - i * 6, 1, "#8a86a0"); }
  R(c, 12, 144, 4, 34, "#2a3a5a"); R(c, 80, 144, 4, 34, "#2a3a5a"); R(c, 12, 144, 72, 3, "#2a3a5a"); R(c, 12, 144, 72, 1, "#5a7aa8");
  R(c, 90, 96, 3, 82, "#2a3a5a"); R(c, 78, 80, 28, 22, "#2f62b8"); R(c, 78, 80, 28, 1, "#8ab8ff"); R(c, 80, 82, 24, 18, "#1f48a0"); txt(c, "U", 88, 86, "#ffffff", 2, 1); em.push([78, 80, 28, 22]);
  PK.glow(c, 92, 90, 30, "#39a8ff", { strength: 0.7 }).forEach(r => em.push(r));
  // Spaeti shopfront
  R(c, 124, 112, 212, 64, "#1a3a2a"); R(c, 124, 112, 212, 2, "#3a7a5a");
  R(c, 132, 124, 142, 50, "#0a1a14"); R(c, 134, 126, 138, 46, "#ffe2a0"); PK.gradV(c, 134, 126, 138, 46, ["#fff4c8", "#ffd890", "#e8a860"], { dither: 1 });
  for (let sx = 140; sx < 266; sx += 22) { for (let sy = 134; sy < 164; sy += 12) { R(c, sx, sy, 20, 10, "#8a5a3a"); R(c, sx, sy, 20, 1, "#c8925a"); for (let b = 0; b < 5; b++) R(c, sx + 2 + b * 4, sy - 7, 3, 7, ["#3a8a4a", "#c8925a", "#e8e0c0", "#2f62b8", "#c0302c"][(b + sx + sy) % 5]); } }
  em.push([134, 126, 138, 46]);
  R(c, 278, 124, 52, 50, "#0a1a14"); R(c, 280, 126, 48, 46, "#6a98b8"); PK.gradV(c, 280, 126, 48, 46, ["#ffe2a0", "#e8a860"], { dither: 1 }); R(c, 303, 126, 2, 46, "#0a1a14"); R(c, 290, 150, 3, 6, "#c8c4d8"); R(c, 316, 150, 3, 6, "#c8c4d8"); em.push([280, 126, 48, 46]);
  PK.awning(c, 128, 104, 204, { colors: ["#2a7a4a", "#efe8d8"], h: 20, stripe: 10 });
  // neon: SPÄTI (dots drawn by hand)
  R(c, 170, 80, 120, 24, "#0a1a14"); R(c, 171, 81, 118, 22, "#14302a");
  A4.txtU(c, "SPÄTI", 184, 88, "#ff3fa4", 3, 3); [[184, 86, 4], [232, 86, 4]].forEach(() => {}); em.push([170, 80, 120, 24]);
  PK.glow(c, 230, 92, 36, "#ff3fa4", { strength: 0.8 }).forEach(r => em.push(r));
  txt(c, "24H", 262, 94, "#39d0ff"); em.push([262, 94, 12, 5]);
  R(c, 140, 176, 60, 1, "#2a2438");
  R(c, 138, 164, 60, 9, "#efe8d8"); txt(c, "PFAND 0.25", 141, 166, "#c0302c");
  // courtyard gate
  R(c, 376, 118, 52, 58, "#2a1c14"); R(c, 378, 120, 48, 54, "#4a2e22"); for (let x = 382; x < 424; x += 7) R(c, x, 122, 3, 50, "#3a241a"); R(c, 378, 144, 48, 3, "#2a1c14"); R(c, 424, 154, 2, 5, "#e0c870");
  PK.util.dshade(c, 378, 120, 48, 54, "#0c0618", (px, py) => 0.35, 0.4);
  [[386, 124, "#ff3fa4"], [404, 134, "#39d0ff"], [392, 154, "#ffd23f"]].forEach(([x, y, col]) => { R(c, x, y, 12, 2, col); R(c, x + 2, y + 3, 8, 2, col); });
  // hotel Zum Pfau
  R(c, 540, 112, 112, 64, "#3a2a2a"); R(c, 540, 112, 112, 3, "#7a5a4a");
  R(c, 570, 138, 36, 38, "#14101c"); R(c, 572, 140, 32, 36, "#5a3a2a"); R(c, 586, 140, 2, 36, "#14101c"); R(c, 574, 142, 12, 32, "#ffe2a0"); R(c, 590, 142, 12, 32, "#ffe2a0"); em.push([574, 142, 12, 32], [590, 142, 12, 32]);
  R(c, 566, 130, 44, 8, "#2a1c14"); R(c, 566, 130, 44, 1, "#a8743e");
  R(c, 556, 134, 6, 12, "#2a1c14"); R(c, 614, 134, 6, 12, "#2a1c14"); ell(c, 559, 134, 3, 3, "#ffd890"); ell(c, 617, 134, 3, 3, "#ffd890"); em.push([556, 131, 6, 6], [614, 131, 6, 6]);
  PK.glow(c, 559, 134, 22, "#ffd890", { strength: 0.8 }).forEach(r => em.push(r)); PK.glow(c, 617, 134, 22, "#ffd890", { strength: 0.8 }).forEach(r => em.push(r));
  R(c, 552, 120, 100, 10, "#14101c"); R(c, 552, 120, 100, 1, "#c8a030"); txt(c, "HOTEL ZUM PFAU", 568, 123, "#ffd23f"); em.push([552, 120, 100, 10]);
  R(c, 560, 176, 52, 8, "#6a6678"); R(c, 566, 170, 40, 6, "#7a7688"); R(c, 560, 176, 52, 1, "#a8a4bc");
  // wires, lamps, props
  E(PK.streetlamp(c, 336, 208, { on: true, h: 118 }));
  E(PK.streetlamp(c, 676, 208, { on: true, h: 118, flip: true }));
  PK.manhole(c, 508, 234, { steam: 60 });
  return em;
}

/* ------------------------------------------------------------------ per-frame */
function draw(c, S, t) {
  // TV tower blink
  if (Math.floor(t / 900) % 2) { R(c, 430, 4, 1, 3, "#ff4a4a"); R(c, 429, 5, 3, 1, "#ff9a9a"); }
  // S-Bahn crossing the viaduct every 14 s
  const k = (t / 14000) % 1;
  if (k < 0.34) { const x = 960 - (k / 0.34) * 560; R(c, x, 8, 120, 14, "#c0302c"); R(c, x, 8, 120, 2, "#e86a5a"); R(c, x, 20, 120, 2, "#7a1a1a"); for (let i = 0; i < 9; i++) { R(c, x + 4 + i * 13, 11, 9, 6, "#ffe8a8"); } R(c, x + 118, 12, 4, 4, "#fff8c8"); }
  // neon flicker
  if (Math.floor(t / 2200) % 7 === 3 && (t % 2200) < 90) R(c, 184, 88, 74, 15, "#14302a");
  // quiet little detail: the hotel lanterns breathe
  if (Math.floor(t / 400) % 2) { P(c, 559, 134, "#fff2c0"); P(c, 617, 134, "#fff2c0"); }
}

function light(S) {
  return {
    ambient: "#3a3068",
    lights: [
      { box: [134, 126, 138, 46], r: 90, color: "#ffc070", steps: 4, sy: 1.1, power: 0.95 },
      { box: [280, 126, 48, 46], r: 50, color: "#ffc070", steps: 3, power: 0.7 },
      { x: 230, y: 90, r: 110, color: "#ff3fa4", steps: 3, power: 0.5, rim: true },
      { x: 336, y: 94, r: 150, color: "#ff9a3a", steps: 5, sy: 1.15, power: 0.95 },
      { x: 676, y: 94, r: 150, color: "#ff9a3a", steps: 5, sy: 1.15, power: 0.9 },
      { x: 588, y: 140, r: 90, color: "#ffd890", steps: 4, power: 0.9 },
      { x: 92, y: 110, r: 110, color: "#39a8ff", steps: 3, power: 0.7, rim: true },
      { x: 820, y: 130, r: 130, color: "#ff3fa4", steps: 3, power: 0.7, rim: true },
      { x: 840, y: 10, r: 150, color: "#8a9ae0", steps: 2, power: 0.35 }
    ],
    halos: [{ x: 336 + 30, y: 94, r: 26, color: "#ff9a3a", strength: 1 }, { x: 676 - 30, y: 94, r: 26, color: "#ff9a3a", strength: 1 }],
    rims: [{ x: 230, y: 100, r: 220, color: "#ff3fa4" }, { x: 330, y: 80, r: 200, color: "#ff9a3a" }, { x: 600, y: 120, r: 200, color: "#ffd890" }],
    shadow: 0.55
  };
}

/* ------------------------------------------------------------------ Kemal */
async function kemalTalk(S) {
  const late = S.f.a4_late > 0;
  if (!S.f.a4_metKemal) {
    S.f.a4_metKemal = true;
    await RP.lines(["Hi. Is this the way to Halle Neun?", "@a4_kemal (not looking up from his phone) Straight on. Under the bridge. " + (late ? "You're late. I can tell. The late ones walk faster." : "You have time. But not much. Everyone's in a hurry on a Saturday."),
      "@a4_kemal Sven is on the door. Don't smile. He doesn't like it."]);
  }
  await RP.convo([
    { text: "Tell me about Sven.", when: S => !S.f.a4_doorHint, run: async () => {
      S.f.a4_doorHint = true;
      await RP.lines(["@a4_kemal Sven? He's been on the door since the place was a power plant. Or since before. He likes records. Real ones.",
        "@a4_kemal He doesn't care if you're a DJ. He cares if you know the records. Labels. Years. The sleeve.", "@a4_kemal Read your sleeves, my friend. Read them in your bag, on the train, in the shower. He'll ask.",
        "(Note to self: the crate in the phone menu has a fact for every record. Read the facts.)"]);
    } },
    { text: "I have some empties for the Pfand.", when: S => RP.has("a4_bottles") && !S.f.a4_pfand, run: async () => {
      S.f.a4_pfand = true; RP.take("a4_bottles"); RP.money(0.48);
      await RP.lines(["@a4_kemal Pfand! Eight cents a bottle. Six bottles. Forty-eight cents. Don't spend it all at once.", "@a4_kemal You are a professional. You are going to do very well in Berlin."]);
    } },
    { text: "I'll take a mate drink. ($2)", when: S => !S.f.a4_mate, run: async () => {
      if (!RP.canAfford(2)) { await RP.say("I can't afford it. I'm about to play for money and I can't buy a drink. Typical."); return; }
      S.f.a4_mate = true; RP.money(-2);
      await RP.lines(["@a4_kemal Club-style. Mate and ice. It has 3x the caffeine and 2x the regret.", "I drink it standing up. My heart does a flip. I understand Berlin now."]);
    } },
    { text: "Just looking.", end: true }
  ]);
}
async function pickBottles(S) {
  if (S.f.a4_bottlesTaken) return "I've got them all. There's a bag of six empties on me. The rest of the city can wait.";
  S.f.a4_bottlesTaken = true; RP.give("a4_bottles");
  await RP.lines(["Six empty bottles on the curb. A nice gesture, in Berlin, to take them.", "Pfand: the Späti pays 8 cents a bottle. Capitalism, but green. And small."]);
}
RP.item("a4_bottles", { name: "empty bottles", short: "Bottles",
  icon: c => { for (let i = 0; i < 4; i++) { R(c, 6 + i * 6, 8, 4, 12, "#3a7a3a"); R(c, 7 + i * 6, 4, 2, 5, "#3a7a3a"); R(c, 7 + i * 6, 3, 2, 1, "#c8c4d8"); R(c, 6 + i * 6, 9, 1, 10, "#8aca8a"); } },
  look: "Six empty beer bottles. Eight cents each at the Späti. In Berlin, trash is currency. Loose change, but currency.", use: "I'll hand them to the Späti guy. Nobody drinks from a stranger's bottle." });

/* ------------------------------------------------------------------ the room */
RP.room({
  id: "a4_berlin_street", act: 4, name: "Berlin, Friedrichstr.-ish",
  width: W, paint, draw, light, ambience: "rain", music: null,
  walk: [[8, 200], [940, 200], [940, 252], [8, 252]],
  start: { x: 40, y: 236, face: "right" },
  fx: [{ type: "rain", width: W, floor: 250, count: 130 }, { type: "steam", x: 520, y: 236, rise: 50, size: 10, drift: 8, color: "#c8c0e0", count: 8 }],
  actors: [
    { id: "a4_kemal", char: "a4_kemal", x: 292, y: 192, face: "left", act: "stand", name: "Kemal" },
    { id: "a4_pax3", char: "a4_pax3", x: 160, y: 202, face: "right", act: "stand", clickable: false }
  ],
  sprites: [
    { y: 190, draw: c => sprCrates(c, 134, 150) },
    { y: 196, draw: c => sprBench(c, 186, 168) },
    { y: 200, draw: c => sprColumn(c, 424, 104) },
    { y: 206, vis: S => !S.f.a4_bottlesTaken, draw: c => { [[100, 208], [258, 212], [372, 210], [452, 214], [588, 212], [632, 208]].forEach(([x, y]) => sprBottle(c, x, y)); } },
    { y: 212, draw: c => { sprBikeA(c, 214, 176); sprBikeB(c, 240, 178); } },
    { y: 202, draw: c => sprTrash(c, 662, 174) },
    { y: 200, draw: c => sprLampPost(c, 480, 86) }
  ],
  self: { look: "Tour bomber, headphones, a record bag, and the tangle of someone whose body thinks it's dinnertime in Brooklyn. In the rain. In Berlin. Dramatic.", talk: "\"Guten Abend.\" ...I've exhausted my German. I'm now a mime with luggage." },
  hotspots: [
    { id: "a4_kemal", name: "Kemal", look: "Kemal, the Späti guy: apron, mustache, steam-rising mug. He's been awake as long as the neon has.",
      talk: S => kemalTalk(S), give: (S, item) => item === "a4_bottles" ? kemalTalk(S) : "He's a Späti guy. He sells things. He doesn't take anything but money and bottles.", pickup: "He'd sell me back to myself at a markup.", push: "He's behind the counter. I'm on the street. We have an understanding." },
    { id: "a4_spaeti", name: "Späti", rects: [[124, 104, 212, 74]], z: 20, walk: [252, 206, "back"], look: "A Späti: Berlin's all-night kiosk. Beer, mate, chips, SIM cards and philosophy. It's open at 1 AM like it's open at noon.", open: "It's open. It's always open. That's the Späti way.", use: "I could browse. But I don't have a Berlin plan beyond \"get in the door.\"" },
    { id: "a4_neon", name: "SPÄTI sign", r: [168, 78, 124, 26], z: 40, walk: [250, 206, "back"], look: "SPÄTI, in pink neon, with the umlaut doing most of the lifting. It flickers every few seconds like it's thinking." },
    { id: "a4_crates", name: "bottle crates", r: [134, 150, 50, 28], z: 50, walk: [160, 210, "back"], look: "Crates of bottles outside the Späti. In Berlin, the street is a storage room.", pickup: "That's their inventory, not mine. I'm not getting anyone shot over beer.", push: "They're heavy. And someone's counting." },
    { id: "a4_bench", name: "bench", r: [186, 168, 62, 30], z: 40, walk: [216, 208, "back"], look: "A wooden bench with two beer bottles on it, a view of the rain and nobody's regrets.", use: "If I sit, I'll miss my slot. And the bench has seen things.", pickup: "It's bolted to the sidewalk. And apparently to the culture." },
    { id: "a4_bottles", name: "empty bottles", rects: [[98, 206, 12, 16], [256, 210, 12, 16], [370, 208, 12, 16], [450, 212, 12, 16], [586, 210, 12, 16], [630, 206, 12, 16]], z: 60, vis: S => !S.f.a4_bottlesTaken, walk: [300, 222, "back"],
      look: "Empty beer bottles on the curb. Six of them, in different postures. In Berlin they're worth 8 cents each.", pickup: S => pickBottles(S), use: S => pickBottles(S) },
    { id: "a4_ubahn", name: "U-Bahn stairs", r: [10, 76, 100, 106], z: 20, walk: [80, 208, "back"], look: "Stairs down to the U-Bahn, with a bright blue U on a pole. It's closed for the night, which is the most polite thing I've seen it do.", use: "I came from underground. I'm not going back. The Berlin underground is for later.", pickup: "It's a staircase. I'd need a bigger bag." },
    { id: "a4_column", name: "poster column", r: [424, 104, 40, 100], z: 45, walk: [452, 214, "back"],
      look: S => "A poster column covered in layers of gig flyers. One says HALLE NEUN, SA, TECHNO and below it, small: \"special guest: " + A4.billed(S) + " (USA).\" My name, with Berlin's spelling. I'm framing it.",
      pickup: "It's got six layers of paste on it. It's now part of the city.", push: "I'm a human against a column. The column's winning." },
    { id: "a4_gate", name: "courtyard gate", r: [374, 118, 56, 60], z: 20, walk: [400, 206, "back"], look: "A courtyard gate, covered in stickers and a scrawl that says \"BITTE LEISE.\" Please, quiet. Nobody has ever been quiet here.", open: "Locked. Berlin gates are polite but firm.", use: "It's locked. Everything in Berlin is open at night except what I need." },
    { id: "a4_hotel", name: "Hotel Zum Pfau", r: [540, 112, 112, 74], z: 25, walk: [588, 206, "back"],
      look: "HOTEL ZUM PFAU. Two lanterns, a revolving something, and a night clerk behind a glass door. My room's in there. Allegedly.",
      exit: S => S.f.a4_setDone ? { room: "a4_hotel", x: 60, y: 232, face: "right" } : "Check-in can wait. The set can't. Ingrid said the hotel's around the corner. In Berlin, corners are generous." },
    { id: "a4_lamp", name: "sticker lamp post", r: [478, 86, 14, 124], z: 40, walk: [506, 216, "back"], look: "A lamp post upholstered in stickers: bands, politics, a lost cat and a coupon. The city's scrapbook, one layer thick." },
    { id: "a4_bikes", name: "bikes", r: [212, 176, 56, 36], z: 40, walk: [240, 212, "back"], look: "Two bikes locked to a rail. In Berlin the bike is the car and the rail is the parking garage.", pickup: "I'm not stealing a bike on my first night in Germany. They'd extradite me.", use: "I'd ride one if I knew how to ride on the right. The right is correct here." },
    { id: "a4_tram", name: "tram tracks", r: [0, 230, 960, 16], z: 4, walk: [320, 242, "back"], look: "Tram rails, wet and shining, running off in both directions. No tram at this hour. Just the idea of one.", use: "I'm standing near them. That counts as \"waiting for a tram.\"" },
    { id: "a4_viaduct", name: "railway viaduct", r: [680, 0, 280, 90], z: 15, walk: [740, 210, "back"], look: "A brick railway viaduct above the street. Every few minutes a lit S-Bahn rumbles across it like a very long, very punctual caterpillar.", pickup: "It's the city's bone structure. I couldn't carry it.", use: "I wave at the train. Nobody waves back. It's Berlin." },
    { id: "a4_tower", name: "TV tower", r: [412, 0, 36, 70], z: 8, walk: [400, 214, "back"], look: "The TV tower, poking out over the roofs, red light blinking, a glittering golf ball on a stick. Even in the rain it's the most confident thing in Germany.", pickup: "It's 368 meters tall. I'm not carrying it. I'm barely carrying the bag.", use: "No. I'm saving the tower for tomorrow. Today is about the door." },
    { id: "a4_bin", name: "trash can", r: [660, 174, 28, 36], z: 40, walk: [676, 214, "back"], look: "A green public bin with a recycling symbol and a compartment for bottles. Germany has a compartment for everything.", use: "I throw nothing away. I'm saving my trash for Pfand." },
    { id: "a4_manhole", name: "manhole", r: [496, 228, 40, 14], z: 6, walk: [516, 242, "back"], look: "A steaming manhole. Berlin runs on steam. And bureaucracy. And beer." },
    { id: "a4_to_halle", name: "to Halle Neun", r: [746, 56, 190, 150], z: 30, walk: [860, 214, "right"],
      look: "The railway arch to Halle Neun. A pink arrow, the word NEUN, and the muffled thump of a kick drum. The bass is the only thing that's already inside.",
      exit: S => ({ room: "a4_halle_door", x: 60, y: 236, face: "right" }) },
    { id: "a4_floor", name: "street", r: [8, 200, 920, 52], z: 3, floor: true, look: "Wet cobbles, tram tracks, puddles in the shape of last night's regret." }
  ],
  combos: [
    ["a4_bottles", "a4_kemal", S => kemalTalk(RP.state)],
    ["a4_bottles", "a4_spaeti", S => kemalTalk(RP.state)],
    ["a4_bag", "a4_kemal", "Kemal eyes the bag. \"Vinyl? ... I hear the Basic Channel sounds nice. Don't tell Sven I said that.\""],
    ["a4_bag", "a4_bench", "I'm not putting the bag down. Not here. Not in the rain. Not after JFK."],
    ["phone", "a4_tower", "The photo's just a smear. The tower's a great date, a terrible photographer's subject."],
    ["phone", "a4_column", "I take a photo of my name on the poster. In Berlin, nobody blinks. They're used to it."]
  ],
  enter: async (S, from) => {
    if (!S.f.a4_streetIntro) {
      S.f.a4_streetIntro = true;
      await RP.lines(["Berlin. One a.m. It's raining. Of course it's raining. It's a European film.", "A blue U, a pink SPÄTI and a railway arch with HALLE NEUN over it. A bass drum pounds like a faraway heart.",
        "The door's down the arch. The hotel's on the left. Everything I need is within two hundred meters. Everything that can go wrong is, too."]);
    }
  }
});
})();
