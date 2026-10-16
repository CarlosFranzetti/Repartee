/* Act 1 — a1_stoop: Jefferson St, Bushwick. A 960px scrolling street: the bodega, the walk-up with the stoop
   (Smitty), Sal's Pizza, the laundromat, the L-train stairs and a sidewalk shed. Day / dusk / night variants
   (A1.tod). Flags: a1_smittyMet, a1_package, a1_delivered, a1_bags (extra can bags taken). */
(function () {
"use strict";
const RP = window.RP;
const A1 = RP.a1, PK = RP.PK;
const { R, P, ell, line, poly, bayer, mulberry, clamp, txt, txtW, txtC, mix, ramp } = RP.u;
const U = PK.util;
const W = 960, GY = 176, CURB = 236;

/* ---------- facade helpers ---------- */
function win(c, x, y, w, h, o) { return PK.window(c, x, y, w, h, Object.assign({ view: "interior", frameW: 3, frame: "#d0c4cc", sill: "#cfc4c8" }, o)); }
function acUnit(c, x, y) {
  R(c, x, y, 20, 13, "#b8b4c4"); R(c, x, y, 20, 1, "#eae6f4"); R(c, x, y + 12, 20, 1, "#6a667c"); R(c, x + 19, y, 1, 13, "#7a768c");
  for (let i = 0; i < 5; i++) R(c, x + 3, y + 3 + i * 2, 12, 1, "#5a566c");
  R(c, x + 2, y + 13, 2, 3, "#3a364a"); R(c, x + 16, y + 13, 2, 3, "#3a364a");
  U.dshade(c, x + 1, y + 16, 18, 5, "#0c0618", (px, py) => 1 - (py - y - 16) / 5, 0.4);
}
function cornice(c, x, y, w, col) {
  const k = ramp(col);
  R(c, x - 3, y, w + 6, 5, k[2]); R(c, x - 3, y, w + 6, 1, k[4]); R(c, x - 3, y + 4, w + 6, 1, k[0]);
  for (let px = x; px < x + w; px += 5) { R(c, px, y + 5, 3, 3, k[1]); R(c, px, y + 5, 3, 1, k[3]); }
  U.dshade(c, x - 3, y + 8, w + 6, 8, "#0c0618", (px, py) => 1 - (py - y - 8) / 8, 0.5);
}
function laundry(c, x1, y1, x2, y2, seed) {
  const r = mulberry(seed);
  for (let px = x1; px <= x2; px++) { const t = (px - x1) / (x2 - x1); P(c, px, y1 + (y2 - y1) * t + Math.sin(t * Math.PI) * 5, "#2a2434"); }
  for (let i = 0; i < (x2 - x1) / 14; i++) {
    const t = (i + 0.5) / ((x2 - x1) / 14), px = x1 + (x2 - x1) * t, py = y1 + (y2 - y1) * t + Math.sin(t * Math.PI) * 5;
    const col = ["#efeaf6", "#ff3fa4", "#39d0ff", "#ffd23f", "#c0302c", "#9be15d"][r() * 6 | 0];
    R(c, px, py + 1, 5 + r() * 3 | 0, 6 + r() * 5 | 0, col); R(c, px, py + 1, 2, 1, "#ffffff");
  }
}
function sign(c, x, y, w, h, bg, fg, text, sc) {
  R(c, x, y, w, h, bg); R(c, x, y, w, 1, mix(bg, "#ffffff", 0.35)); R(c, x, y + h - 1, w, 1, mix(bg, "#0c0618", 0.5));
  txtC(c, text, x + w / 2, y + Math.floor((h - 5 * (sc || 1)) / 2), fg, sc || 1);
}
function tag(c, x, y, col, seed) {   /* graffiti tag: loops and a crown */
  const r = mulberry(seed);
  let px = x, py = y;
  for (let i = 0; i < 26; i++) { P(c, px, py, col); P(c, px + 1, py, col); px += 1 + (r() * 2 | 0); py += (r() * 3 | 0) - 1; }
  [[0, -3], [2, -4], [4, -3]].forEach(([dx, dy]) => P(c, x + dx, y + dy, col));
}

/* ---------- baked props (depth-sorted sprites) ---------- */
const B = {
  hydrant: () => A1.memo("st_hydrant", 24, 26, c => { PK.hydrant(c, 4, 2, {}); }),
  mailbox: () => A1.memo("st_mailbox", 26, 36, c => { PK.mailbox(c, 3, 1, {}); }),
  news: () => A1.memo("st_news", 22, 32, c => { PK.newspaperBox(c, 2, 1, { color: "#d8a020" }); }),
  news2: () => A1.memo("st_news2", 22, 32, c => { PK.newspaperBox(c, 2, 1, { color: "#2f62b8" }); }),
  bike: () => A1.memo("st_bike", 56, 36, c => { PK.bike(c, 3, 2, { color: "#39d0ff" }); }),
  lampOn: () => A1.memo("st_lampOn", 70, 214, c => PK.streetlamp(c, 12, 212, { h: 200, arm: 24, on: true })),
  lampOff: () => A1.memo("st_lampOff", 70, 214, c => PK.streetlamp(c, 12, 212, { h: 200, arm: 24, on: false }))
};

function recyclingBags(c, x, y, left) {
  /* clear-ish recycling bags stuffed with cans; `left` = how many are still there (1..3 drawn) */
  const cols = ["#d83a3a", "#3ab8d8", "#e0a020", "#5ad85a", "#8a4ad8", "#e0e0e8"];
  for (let b = 0; b < left; b++) {
    const bx = x + b * 15, by = y + (b % 2) * 3;
    ell(c, bx + 8, by + 18, 9, 8, "#3a4a6a"); ell(c, bx + 8, by + 17, 8, 7, "#4a5e86"); ell(c, bx + 6, by + 14, 4, 3, "#6a80aa");
    for (let i = 0; i < 6; i++) R(c, bx + 3 + (i % 3) * 4, by + 12 + (i / 3 | 0) * 5, 3, 4, cols[(i + b * 2) % 6]);
    R(c, bx + 6, by + 6, 4, 3, "#4a5e86"); P(c, bx + 7, by + 5, "#4a5e86"); P(c, bx + 9, by + 5, "#4a5e86");
    U.dshade(c, bx - 1, by + 25, 20, 4, "#0c0618", (px, py) => 1 - (py - by - 25) / 4, 0.45);
  }
}

/* ---------- the street ---------- */
function paintStoop(c, S) {
  const tod = A1.tod(S), night = tod === "night", dusk = tod === "dusk", day = tod === "day", em = [];
  const rnd = mulberry(30);
  /* sky + skyline */
  PK.sky(c, 0, 0, W, 130, { time: tod, seed: 7, clouds: day ? 5 : dusk ? 3 : 0, moon: night ? { x: 612, y: 24, r: 7 } : false, sun: day ? { x: 120, y: 26, r: 8 } : dusk ? { x: 700, y: 88, r: 10 } : false });
  em.push.apply(em, PK.skyline(c, 0, 18, W, 112, { night: !day, layers: 3, spire: true, spireX: 560, seed: 9 }));

  /* ---- A: bodega building (x 0..248) ---- */
  PK.brick(c, 0, 36, 248, GY - 36, { base: "#8c4a3c", mortar: "#a09090", worn: 0.45, seed: 61, bw: 12, bh: 5 });
  cornice(c, 0, 32, 248, "#6a3a30");
  [[22, 44], [76, 44], [130, 44], [190, 44]].forEach(([wx, wy], i) => {
    em.push.apply(em, win(c, wx, wy, 26, 30, { time: tod, lit: night || dusk ? (i !== 2) : false, curtain: ["#c0555a", "#5a7ac0", "#d8b060", "#8a5ac0"][i], blinds: day && i % 2 === 1 ? 0.5 : false, seed: 70 + i }));
  });
  acUnit(c, 80, 78); acUnit(c, 194, 78);
  laundry(c, 4, 42, 70, 50, 5);
  tag(c, 14, 150, "#39d0ff", 8);
  /* storefront */
  R(c, 0, 90, 248, GY - 90, "#2a1c28");
  PK.awning(c, 4, 94, 240, { colors: ["#2f7a4a", "#efe8d8"], h: 28, text: "DELI & GROCERY", textColor: "#fff6dc", seed: 12 });
  /* window with shelves */
  R(c, 12, 124, 140, 52, "#150c1a");
  PK.shelf(c, 16, 128, 132, 44, { items: "cans", wood: "#5a4a38", seed: 13 });
  U.dshade(c, 16, 128, 132, 44, "#e8ffe8", (px, py) => 0.18, 0.18);
  U.dshade(c, 12, 124, 140, 52, "#ffffff", (px, py) => { const q = ((px - 12) * 0.9 + (py - 124) + 600) % 62; return q < 5 ? 1 : 0; }, 0.16);
  R(c, 10, 122, 144, 3, "#c8c4d4"); R(c, 10, 122, 144, 1, "#fff"); R(c, 10, 175, 144, 2, "#5a566c"); R(c, 10, 122, 3, 54, "#c8c4d4"); R(c, 151, 122, 3, 54, "#8a869c");
  sign(c, 24, 132, 22, 9, "#e8e4d0", "#c0302c", "LOTTO"); sign(c, 112, 140, 30, 9, "#c0302c", "#ffffff", "COLD BEER", 1);
  sign(c, 20, 150, 14, 8, "#ffd23f", "#2a1a10", "EBT");
  PK.neon(c, "OPEN", 58, 126, "#ff4a4a", { scale: 1, tube: 1, glow: true, strength: 0.8 }).forEach(r => em.push(r));
  /* produce stand on the sidewalk against the window */
  [[20, "#e8602c"], [44, "#d83a3a"], [68, "#e8d020"], [92, "#5ac85a"]].forEach(([px, col], i) => {
    R(c, px, 160, 22, 16, "#7a5a34"); R(c, px, 160, 22, 2, "#a8845a"); R(c, px, 174, 22, 2, "#3a2a18");
    for (let q = 0; q < 6; q++) ell(c, px + 4 + (q % 3) * 7, 160 - (q / 3 | 0) * 3 + 1, 3, 2, col), P(c, px + 3 + (q % 3) * 7, 158 - (q / 3 | 0) * 3, mix(col, "#ffffff", 0.55));
  });
  R(c, 118, 150, 26, 26, "#4a6a8a"); R(c, 118, 150, 26, 2, "#7aa0c8"); for (let q = 0; q < 6; q++) { R(c, 122 + q * 4, 138 + (q % 2) * 3, 2, 14, ["#ff3fa4", "#ffd23f", "#ffffff", "#ff8a4c", "#a05cff", "#ff3fa4"][q]); ell(c, 123 + q * 4, 137 + (q % 2) * 3, 2, 2, ["#ff7ac0", "#ffe270", "#ffffff", "#ffaa70", "#c08cff", "#ff7ac0"][q]); }
  /* door (steel + glass) */
  em.push.apply(em, PK.door(c, 160, 124, 46, 52, { metal: true, window: true, color: "#5a6a7a", seed: 14 }));
  R(c, 163, 128, 40, 40, "#f4ecc8"); U.gradient(c, 163, 128, 40, 40, [[0, "#fff6d8"], [1, "#e8d8a0"]], 1, true); em.push([163, 128, 40, 40]);
  for (let i = 0; i < 3; i++) R(c, 170 + i * 11, 132, 2, 32, "#c8a050");
  R(c, 160, 124, 46, 4, "#5a6a7a"); R(c, 160, 124, 46, 1, "#9ab0c8"); R(c, 160, 172, 46, 4, "#3a4452");
  sign(c, 176, 144, 18, 7, "#c0302c", "#fff6dc", "OPEN", 1);
  R(c, 212, 122, 30, 54, "#c8c4d4"); R(c, 214, 124, 26, 50, "#10182a");
  em.push.apply(em, [[216, 128, 22, 14]]); U.gradient(c, 216, 128, 22, 14, [[0, "#3a8ad8"], [1, "#1a4a98"]], 1, true); txt(c, "ATM", 220, 132, "#e8f4ff");
  R(c, 216, 148, 22, 22, "#2a2a3a"); txt(c, "$", 224, 154, "#3fe0a0");
  /* ---- B: the walk-up (x 252..470) ---- */
  PK.brick(c, 252, 8, 218, GY - 8, { base: "#6e3a36", mortar: "#8a7a7a", worn: 0.5, seed: 62, bw: 13, bh: 5 });
  cornice(c, 252, 4, 218, "#5a2e2c");
  const tw = [[262, 22], [304, 22], [404, 22], [444, 22]];
  tw.forEach(([wx], i) => em.push.apply(em, win(c, wx, 66, 26, 36, { time: tod, lit: (night || dusk) && i !== 1, curtain: ["#d8b060", "#c0555a", "#8a5ac0", "#5aa0c0"][i], blinds: day ? (i === 2 ? 0.5 : false) : false, seed: 80 + i })));
  [[262], [304], [350], [404]].forEach(([wx], i) => em.push.apply(em, win(c, wx, 18, 24, 32, { time: tod, lit: (night || dusk) && i !== 2, curtain: ["#c0555a", "#d8b060", "#5a7ac0", "#d8b060"][i], seed: 90 + i })));
  /* 4C: my window, upper right, bulb and poster glow */
  em.push.apply(em, win(c, 440, 18, 26, 32, { time: tod, lit: night || dusk, curtain: "#6a4a8a", seed: 99 }));
  if (night || dusk) { R(c, 451, 20, 2, 5, "#1c1626"); ell(c, 452, 27, 2, 2, "#fff4d6"); em.push([450, 25, 5, 5]); R(c, 444, 34, 6, 8, "#1b1440"); P(c, 446, 36, "#ff3fa4"); }
  em.push.apply(em, PK.fireEscape(c, 396, 40, 70, 62, { floors: 1, ladder: false, seed: 15 }));
  acUnit(c, 306, 108); acUnit(c, 444, 104);
  /* ground floor: stone base + areaway windows */
  R(c, 252, 142, 218, 34, "#4a2e30"); PK.speckle(c, 252, 142, 218, 34, ["#5a3c3e", "#3a2224"], 0.3, 4);
  R(c, 252, 140, 218, 3, "#7a5a58"); R(c, 252, 140, 218, 1, "#a8807c");
  [[318, 150], [346, 150], [374, 150]].forEach(([wx, wy]) => { R(c, wx, wy, 20, 16, "#0c0814"); for (let q = 0; q < 4; q++) R(c, wx + 2 + q * 5, wy, 1, 16, "#5a5272"); R(c, wx - 1, wy - 1, 22, 1, "#8a7a78"); });
  /* the stoop */
  PK.stoop(c, 252, 118, 190, 58, { steps: 7, stone: "#7a4a44", seed: 17 });
  /* front door at the landing */
  em.push.apply(em, PK.door(c, 258, 38, 34, 80, { color: "#4a3a52", frame: "#2a2030", panels: 4, number: "4", peephole: false, seed: 18 }));
  R(c, 256, 28, 38, 10, "#2a2030"); R(c, 258, 30, 34, 6, "#e8d8a0"); txt(c, "264", 262, 31, "#2a1a10", 1);     /* transom with the street number */
  R(c, 258, 34, 34, 1, "#8a7a70");
  R(c, 296, 62, 10, 18, "#b8a888"); R(c, 297, 64, 8, 4, "#1c1626"); for (let i = 0; i < 4; i++) R(c, 298, 70 + i * 3, 6, 1, "#5a4a3a");   /* buzzer panel */
  /* Smitty's milk crate */
  R(c, 370, 150, 36, 26, "#2f62b8"); R(c, 370, 150, 36, 2, "#4a80d8"); R(c, 370, 174, 36, 2, "#1d3f7a");
  for (let yy = 155; yy < 172; yy += 6) for (let xx = 373; xx < 403; xx += 6) R(c, xx, yy, 4, 3, "#1d3f7a");
  R(c, 366, 172, 6, 3, "#e8e4d0"); R(c, 367, 169, 4, 3, "#c0302c"); P(c, 368, 168, "#6a3a1a");       /* coffee cup */
  /* tags + wheatpaste on the stoop wall and the base */
  tag(c, 334, 128, "#ffd23f", 20); tag(c, 396, 158, "#39d0ff", 21);

  /* ---- C: Sal's (x 472..690) ---- */
  PK.plaster(c, 472, 68, 218, GY - 68, { base: "#c9ad8e", seed: 63, patches: 2, stains: 2, cracks: 1 });
  cornice(c, 472, 64, 218, "#8a3a30");
  [[486], [632]].forEach(([wx], i) => em.push.apply(em, win(c, wx, 76, 26, 24, { time: tod, lit: night || dusk, curtain: ["#ff9a5a", "#ffd23f"][i], seed: 110 + i })));
  acUnit(c, 654, 78);
  /* neon board */
  R(c, 524, 76, 100, 26, "#1a0e14"); R(c, 524, 76, 100, 1, "#5a3a40"); R(c, 524, 101, 100, 1, "#0a0408"); R(c, 524, 76, 1, 26, "#4a2a30"); R(c, 623, 76, 1, 26, "#0a0408");
  [[528, 80], [618, 80], [528, 96], [618, 96]].forEach(([bx, by]) => P(c, bx, by, "#c8c4d4"));
  PK.neon(c, "SAL'S", 548, 80, "#ff5a4a", { scale: 3, tube: 2, spacing: 3, strength: 1, glowR: 9 }).forEach(r => em.push(r));
  R(c, 472, 104, 218, GY - 104, "#2a1c24");
  R(c, 480, 134, 84, 42, "#14080c");                                                                         /* window recess */
  R(c, 572, 130, 46, 46, "#14080c");
  PK.awning(c, 474, 104, 214, { colors: ["#2f7a4a", "#efe8d8", "#c0302c"], h: 26, text: "PIZZERIA", textColor: "#fff6dc", stripe: 8, seed: 22 });
  /* window with pies */
  U.gradient(c, 484, 138, 76, 34, [[0, "#ffd890"], [1, "#e89048"]], 1, true); em.push([484, 138, 76, 34]);
  R(c, 484, 164, 76, 8, "#a8744a"); R(c, 484, 164, 76, 1, "#d8a468");
  for (let q = 0; q < 3; q++) { const px = 496 + q * 24; ell(c, px, 163, 10, 3, "#e8b040"); ell(c, px, 162, 9, 2, "#f2c84a"); [[-4, 0], [0, 1], [4, -1]].forEach(([dx, dy]) => ell(c, px + dx, 162 + dy, 1, 1, "#c0302c")); R(c, px - 1, 159, 2, 3, "#6a3a1a"); }
  U.dshade(c, 480, 134, 84, 42, "#ffffff", (px, py) => { const q = ((px - 480) * 0.8 + (py - 134) + 600) % 56; return q < 4 ? 1 : 0; }, 0.2);
  R(c, 478, 132, 88, 3, "#d8d4e4"); R(c, 478, 132, 88, 1, "#fff"); R(c, 478, 175, 88, 2, "#5a566c"); R(c, 478, 132, 3, 44, "#c8c4d4"); R(c, 563, 132, 3, 44, "#8a869c");
  PK.neon(c, "SLICE", 500, 140, "#ffd23f", { scale: 2, tube: 1, spacing: 2, strength: 0.9 }).forEach(r => em.push(r));
  /* door */
  em.push.apply(em, PK.door(c, 572, 130, 46, 46, { metal: true, window: true, color: "#a03a2a", seed: 23 }));
  R(c, 575, 134, 40, 34, "#fff0c8"); U.gradient(c, 575, 134, 40, 34, [[0, "#fff6d8"], [1, "#ffd890"]], 1, true); em.push([575, 134, 40, 34]);
  R(c, 572, 130, 46, 4, "#a03a2a"); R(c, 572, 172, 46, 4, "#5a1a14");
  sign(c, 578, 146, 34, 8, "#efeaf6", "#c0302c", "COME ON IN", 1);
  R(c, 626, 146, 58, 30, "#241012");
  R(c, 628, 148, 54, 26, "#efeaf6"); R(c, 628, 148, 54, 3, "#c0302c"); txt(c, "MENU", 645, 149, "#fff6dc");
  [["PLAIN", "1.50"], ["PEPP", "2.00"], ["WHITE", "2.50"]].forEach(([n, p], i) => { txt(c, n, 631, 154 + i * 6, "#3a2a2a"); txt(c, p, 664, 154 + i * 6, "#c0302c"); });
  R(c, 622, 144, 66, 2, "#c8c4d4");
  /* ---- D: laundromat (x 690..850) ---- */
  PK.brick(c, 690, 54, 160, GY - 54, { base: "#7a6a70", mortar: "#8a8090", worn: 0.5, seed: 64, bw: 12, bh: 5 });
  cornice(c, 690, 50, 160, "#5a4a50");
  [[702], [750], [798]].forEach(([wx], i) => em.push.apply(em, win(c, wx, 64, 30, 28, { time: tod, lit: (night || dusk) && i !== 0, curtain: ["#c0555a", "#5aa0c0", "#d8b060"][i], seed: 120 + i })));
  laundry(c, 690, 94, 760, 100, 8);
  R(c, 690, 112, 160, GY - 112, "#0e1822");
  sign(c, 706, 98, 128, 12, "#10304a", "#9fe8ff", "BUBBLE & SUDS");
  PK.neon(c, "24HR", 800, 116, "#39d0ff", { scale: 1, tube: 1, strength: 0.8 }).forEach(r => em.push(r));
  for (let i = 0; i < 4; i++) {
    const wx = 700 + i * 36, wy = 130;
    R(c, wx, wy, 30, 44, "#cfd4e0"); R(c, wx, wy, 30, 1, "#fff"); R(c, wx + 29, wy, 1, 44, "#7a8094"); R(c, wx, wy + 43, 30, 1, "#5a6074");
    ell(c, wx + 15, wy + 26, 10, 10, "#4a5a78"); ell(c, wx + 15, wy + 26, 8, 8, "#9fe8ff"); ell(c, wx + 12, wy + 23, 3, 3, "#e8fcff"); em.push([wx + 6, wy + 17, 18, 18]);
    R(c, wx + 3, wy + 4, 24, 6, "#2a2f40"); for (let q = 0; q < 4; q++) R(c, wx + 5 + q * 5, wy + 6, 3, 2, q % 2 ? "#ff3fa4" : "#39d0ff");
  }
  U.dshade(c, 690, 112, 160, GY - 112, "#9fe8ff", (px, py) => 0.15, 0.1);
  em.push([706, 98, 128, 12]);
  /* ---- E: sidewalk shed + building site (x 850..960) ---- */
  PK.brick(c, 850, 40, 110, GY - 40, { base: "#5a4a4c", mortar: "#7a7080", worn: 0.8, seed: 65, bw: 13, bh: 5 });
  for (let i = 0; i < 3; i++) { R(c, 858 + i * 32, 52, 24, 30, "#c8a068"); R(c, 858 + i * 32, 52, 24, 1, "#e8c088"); R(c, 858 + i * 32, 66, 24, 1, "#8a6a3a"); }
  PK.scaffold(c, 846, 88, 114, 90, { shed: true, levels: 2, seed: 24 });
  R(c, 850, 118, 106, 58, "#a8844e"); for (let q = 0; q < 6; q++) R(c, 850 + q * 18, 118, 1, 58, "#6a4a28"); R(c, 850, 118, 106, 1, "#d8b478");     /* plywood hoarding */
  R(c, 858, 124, 50, 40, "#1b1440"); ell(c, 883, 138, 8, 8, "#ff3fa4"); R(c, 862, 152, 42, 3, "#39d0ff"); txtC(c, "NOWHERE", 883, 128, "#ff3fa4", 1); txtC(c, "SAT 10PM", 883, 158, "#bfb8e8", 1);   /* wheat-pasted flyer */
  R(c, 912, 130, 30, 22, "#e8e0cc"); txt(c, "BASS", 916, 134, "#1d1622"); txt(c, "CITY", 916, 141, "#c0302c");
  tag(c, 872, 168, "#ff3fa4", 25); tag(c, 920, 160, "#ffd23f", 26);
  /* ---- ground ---- */
  PK.sidewalk(c, 0, GY, W, 70, { curbY: CURB, seed: 27 });
  PK.asphalt(c, 0, 246, W, 10, { seed: 28, lines: ["dashed"] });
  /* trash-bag + manhole decals on the sidewalk and street */
  PK.manhole(c, 740, 218, { w: 36, h: 10 });
  em.push.apply(em, PK.subwayStairs(c, 786, 186, {}));
  R(c, 790, 148, 2, 40, "#2a2438"); R(c, 790, 148, 1, 40, "#5a5272");
  R(c, 756, 142, 58, 16, "#10304a"); R(c, 756, 142, 58, 1, "#6a98c0"); R(c, 756, 157, 58, 1, "#06101c"); R(c, 756, 142, 1, 16, "#4a78a0");
  ell(c, 765, 150, 5, 5, "#9a9caa"); txtC(c, "L", 765, 148, "#ffffff", 1); txt(c, "JEFFERSON", 773, 145, "#e8f4ff"); txt(c, "ST. TRAIN", 773, 151, "#9fb0ff");
  /* puddles that catch the neon */
  [[600, 226, 22, 3], [330, 220, 16, 2], [520, 230, 14, 2], [830, 232, 18, 3]].forEach(([px, py, rx, ry]) => { ell(c, px, py, rx, ry, night ? "#2e2858" : dusk ? "#8a5a78" : "#9aa0c8"); ell(c, px - 2, py - 1, rx - 4, Math.max(0, ry - 1), night ? "#4a4a8a" : dusk ? "#c88a8a" : "#c8d0f0"); });
  if (night) { U.dshade(c, 584, 224, 40, 8, "#ff5a4a", (px, py) => 0.6, 0.35); U.dshade(c, 496, 228, 40, 6, "#ffb04a", (px, py) => 0.5, 0.28); }
  /* litter */
  [[560, 218, "#efeaf6"], [300, 226, "#d8c890"], [680, 214, "#c0302c"], [420, 230, "#e8e4d0"], [160, 224, "#3ab8d8"], [640, 232, "#efeaf6"]].forEach(([px, py, col]) => { R(c, px, py, 3, 2, col); P(c, px, py, mix(col, "#ffffff", 0.5)); });
  R(c, 590, 214, 11, 8, "#c8925a"); R(c, 590, 214, 11, 1, "#e0b078"); R(c, 593, 217, 5, 1, "#c0302c");        /* pizza box lid */
  PK.speckle(c, 0, GY, W, 4, ["#1c1424"], 0.4, 7);
  /* wall-base grime */
  U.dshade(c, 0, GY - 10, W, 10, "#0c0618", (px, py) => (py - GY + 10) / 10, 0.45);
  /* sodium glow on the street at night */
  return em;
}

function lightStoop(S) {
  const tod = A1.tod(S);
  if (tod === "day") return { ambient: "#d9cde0", lights: [{ x: 120, y: -70, r: 1100, color: "#fff0dc", steps: 3, sy: 0.7 }], key: { x: 100, y: -40 }, shadow: 0.5 };
  if (tod === "dusk") return { ambient: "#a47a92", lights: [{ x: 900, y: 60, r: 700, color: "#ffb078", steps: 4, sy: 0.9 }, { x: 468, y: 40, r: 170, color: "#ffc27a", steps: 4, power: 0.7 }, { box: [700, 112, 150, 62], r: 70, color: "#9fe8ff", steps: 3, power: 0.7 }],
    key: { x: 900, y: 60 }, shadow: 0.5, rims: [{ x: 900, y: 60, r: 900, color: "#ff9a60" }] };
  return {
    ambient: "#473c7c",
    lights: [
      { x: 264, y: 46, r: 200, color: "#ffb04a", steps: 5, sy: 1.05 },
      { x: 500, y: 46, r: 200, color: "#ffb04a", steps: 5, sy: 1.05 },
      { x: 736, y: 46, r: 200, color: "#ffb04a", steps: 5, sy: 1.05 },
      { box: [12, 124, 140, 52], r: 90, color: "#d8ffe0", steps: 3, power: 0.8 },
      { box: [160, 124, 46, 52], r: 90, color: "#fff0c0", steps: 3, power: 0.8 },
      { box: [480, 136, 82, 40], r: 80, color: "#ffb870", steps: 3, power: 0.8 },
      { box: [572, 130, 46, 46], r: 90, color: "#ffe2b0", steps: 3, power: 0.8 },
      { x: 574, y: 90, r: 150, color: "#ff5a4a", steps: 3, power: 0.6, rim: true },
      { box: [700, 120, 150, 54], r: 90, color: "#9fe8ff", steps: 3, power: 0.8 },
      { x: 790, y: 192, r: 70, color: "#40e080", steps: 3, power: 0.6 },
      { x: 850, y: 192, r: 60, color: "#40e080", steps: 3, power: 0.5 }
    ],
    halos: [{ x: 574, y: 90, r: 30, color: "#ff5a4a", strength: 0.8 }, { x: 264, y: 45, r: 30, color: "#ff9a3a", strength: 1 }, { x: 500, y: 45, r: 30, color: "#ff9a3a", strength: 1 }, { x: 736, y: 45, r: 30, color: "#ff9a3a", strength: 1 }],
    emissive: [[258, 40, 13, 3], [494, 40, 13, 3], [730, 40, 13, 3]],
    key: { x: 500, y: 46 }, shadow: 0.6, rims: [{ x: 500, y: 46, r: 200, color: "#ffa850" }, { x: 736, y: 46, r: 200, color: "#ffa850" }, { x: 264, y: 46, r: 190, color: "#ffa850" }]
  };
}

/* ---------- per-frame overlays ---------- */
const BLINK_PIGEONS = [[540, 238], [556, 232], [610, 240]];
function drawStoop(c, S, t) {
  const tod = A1.tod(S);
  /* window flicker (a TV in one window), steam from the manhole (fx), neon flutter on the L of SAL'S */
  if (tod !== "day") {
    const f = A1.flick(t, 110, 5);
    
    R(c, 310, 70 + 0, 18, 28, f < 40 ? "#5a7ac8" : f < 70 ? "#8ab0f0" : "#3a58a0"); R(c, 310, 70, 18, 1, "#2a2030"); R(c, 310, 97, 18, 1, "#2a2030");
  }
}
function pigeon(c, x, y, t, i) {
  const peck = Math.floor(t / 420 + i * 1.7) % 3 === 0;
  ell(c, x, y - 4, 4, 3, "#8a86a0"); ell(c, x + 3, y - 6 + (peck ? 3 : 0), 2, 2, "#5a5670"); P(c, x + 5, y - 5 + (peck ? 3 : 0), "#e8a040");
  R(c, x - 4, y - 5, 4, 2, "#6a6682"); P(c, x - 1, y - 3, "#c8c4d8"); P(c, x, y - 1, "#c88a50"); P(c, x + 2, y - 1, "#c88a50"); P(c, x + 3, y - 6 + (peck ? 3 : 0), "#ffffff");
}

/* ---------- Smitty ---------- */
async function givePackage(S) {
  RP.give("a1_package"); S.f.a1_package = true;
  await RP.lines(["@a1_smitty Sal's. Right there, the red-and-green awning. Tell him Smitty sent you.", "@a1_smitty And don't open it. No peeking.", "No peeking.", "@a1_smitty I mean it."]);
}
async function smittyOffer(S) {
  await RP.lines([
    "@a1_smitty Psst. Hey. You. Four-C.", "Me?",
    "@a1_smitty You're the bass through the wall. Whole block knows you. I know when it's ten PM. I know when it's midnight.",
    "Sorry about that.", "@a1_smitty Nah. It's like a clock. A very loud clock.",
    "@a1_smitty Listen. I got a thing needs dropping at Sal's. Pizza place. Right there.",
    "@a1_smitty Twenty bucks. And a slice. Sal pays in slice, it's a whole thing."
  ]);
  const i = await RP.choose(["What's in it?", "Sounds illegal.", "Twenty? I'm in."]);
  if (i === 0) await RP.lines(["What's in it?", "@a1_smitty Don't ask. Better yet: don't peek.", "It's a package. It looks like a package.", "@a1_smitty Exactly. It's a package."]);
  else if (i === 1) await RP.lines(["That sounds illegal.", "@a1_smitty It's not illegal. It's discreet. There's a difference.", "Is there?", "@a1_smitty About twenty bucks' worth."]);
  else await RP.lines(["Twenty? I'm in.", "@a1_smitty Beautiful. A professional."]);
  const j = await RP.choose(["Fine. Hand it over.", "Let me think about it."]);
  if (j === 0) { await RP.say("Fine. Hand it over."); await givePackage(S); }
  else await RP.lines(["Let me think about it.", "@a1_smitty Offer stands. I'm here. I'm always here. It's a lifestyle."]);
}
async function smittyTalk(S) {
  if (!S.f.a1_smittyMet) { S.f.a1_smittyMet = true; await smittyOffer(S); return; }
  await RP.convo([
    { text: "About that package...", when: S => !S.f.a1_package && !S.f.a1_delivered, run: async () => { await RP.say("@a1_smitty Sal's. Twenty bucks and a slice. Say yes."); const j = await RP.choose(["Fine. Hand it over.", "Not yet."]); if (j === 0) { await RP.say("Fine. Hand it over."); await givePackage(S); return "end"; } } },
    { text: "Where's Sal's again?", when: S => S.f.a1_package && !S.f.a1_delivered, run: () => RP.lines(["@a1_smitty The pizza place. Red awning. Smell. You'll find it. It's loud with cheese."]) },
    { text: "Sal says hi.", when: S => S.f.a1_delivered, once: true, run: () => RP.lines(["@a1_smitty He pays. That's a rare quality in a New Yorker. Cherish it.", "Did the oregano land okay?", "@a1_smitty What oregano. I don't know what you're talking about."]) },
    { text: "Know anything about the door at Nowhere?", when: S => S.f.a1_booked, once: true, run: () => RP.lines(["@a1_smitty Tank? Big guy. Hasn't smiled since 2014.", "@a1_smitty Knows nobody, trusts nobody, loves Sal's. Pepperoni. Never says why.", "@a1_smitty I'm just saying. Slices are a love language."]) },
    { text: "What do you actually do out here?", once: true, run: () => RP.lines(["@a1_smitty I observe. I deliver. I'm in logistics.", "@a1_smitty Rent-free. Best address in Bushwick."]) },
    { text: "Any tips for a broke DJ?", once: true, run: () => RP.lines(["@a1_smitty Cans. Five cents a pop. There's a bag on the curb by the scaffold every day. Canners leave 'em for the machine. Don't tell them I said.", "Thanks, I think."]) },
    { text: "Later, Smitty.", end: true }
  ]);
}

/* ---------- the room ---------- */
const SMITTY = { id: "a1_smitty", char: "a1_smitty", x: 388, y: 176, face: "front", act: "sit", name: "Smitty" };
RP.room({
  id: "a1_stoop", act: 1, name: "Jefferson St, Bushwick", width: W,
  paint: paintStoop, draw: drawStoop, light: lightStoop,
  cacheKey: S => A1.tod(S), lightKey: S => A1.tod(S),
  ambience: "street",
  walk: [[44, 208], [916, 208], [932, 236], [28, 236]],
  scale: [206, 0.96, 236, 1.04],
  start: { x: 350, y: 236, face: "front" },
  fx: [
    { type: "steam", x: 758, y: 222, rise: 56, size: 10, drift: 6, color: "#e8e4f0", count: 5, speed: 0.5 },
    { type: "cars", y: 250, dir: 1, period: 7400, width: W },
    { type: "cars", y: 252, dir: -1, period: 11000, width: W, color: "#ff6a5a" },
    { type: "dust", rect: [440, 20, 60, 140], count: 8, color: "#ffd890", on: () => A1.tod(RP.state) === "night" },
    { type: "blink", items: [{ r: [182, 146, 14, 3], color: "#c0302c", off: "#5a1a1a", rate: 700 }] }
  ],
  actors: [SMITTY],
  sprites: [
    { y: 238, draw: c => A1.blit(c, B.mailbox(), 515, 205) },
    { y: 233, draw: c => A1.blit(c, B.news(), 632, 206) },
    { y: 233, draw: c => A1.blit(c, B.news2(), 650, 206) },
    { y: 234, draw: c => A1.blit(c, B.hydrant(), 668, 212) },
    ...[224, 460, 696].map(lx => ({ y: 238, draw: (c, S) => A1.blit(c, A1.tod(S) === "day" ? B.lampOff() : B.lampOn(), lx, 26) })),
    { y: 232, draw: c => A1.blit(c, B.bike(), 872, 204) },
    { y: 236, vis: S => (S.f.a1_bags || 0) < 6, draw: (c, S) => recyclingBags(c, 884, 214, (S.f.a1_bags || 0) >= 4 ? 1 : (S.f.a1_bags || 0) >= 2 ? 2 : 3) },
    { y: 232, draw: (c, S, t) => BLINK_PIGEONS.forEach(([x, y], i) => pigeon(c, x, y, t, i)) }
  ],
  enter: async (S, from) => {
    S.f.noTravel = false;
    if (A1.tod(S) !== "day" || S.f.a1_slept) { /* clock beats on first morning arrival */ }
    if (S.f.time === "morning" && !S.f.a1_stoopAM && from === "a1_hall") { S.f.a1_stoopAM = true; RP.setClock("WED 8:20 AM"); }
    if (from === "a1_hall" && !S.f.a1_smittyMet) { S.f.noTravel = true; await smittyTalk(S); S.f.noTravel = false; }
    if (S.f.time === "evening" && !S.f.a1_stoopEve) { S.f.a1_stoopEve = true; await RP.lines(["Jefferson St, dusk. The block smells like oregano and exhaust. I'm sensitive to oregano now."]); }
  },
  leave: async (S, to) => { S.f.noTravel = false; },
  hotspots: [
    { id: "bodegaDoor", name: "bodega door", r: [158, 122, 50, 54], z: 30, walk: [182, 220, "back"], look: "Ali's Deli & Grocery. Open 24 hours, except when it isn't, and then it's open anyway.",
      exit: S => ({ room: "a1_bodega", x: 74, y: 236, face: "right" }), pull: "The door has a bell. It rings with a note that means \"customer.\"" },
    { id: "bodegaWin", name: "bodega window", r: [10, 120, 146, 58], z: 20, walk: [84, 220, "back"], look: "Cans, lottery, cold beer, EBT. In New York the bodega is a church, a bank and a pharmacy that sells tobacco.", open: "It's glass. The door's to the right. I'm optimistic about your abilities.", push: "I push the window. It pushes back with 25 years of dust." },
    { id: "atm", name: "ATM", r: [210, 120, 34, 58], z: 22, walk: [226, 220, "back"], look: "The ATM. $3 fee to take out my own money. I have to have money to be charged.", use: "My balance is a haiku. Zero in the first line.", pickup: "Bolted down. And judging by my account, there's nothing in it." },
    { id: "bodegaAwning", name: "awning", r: [4, 92, 240, 28], z: 10, walk: [120, 220, "back"], look: "DELI & GROCERY. The green is faded, the cat inside isn't." },
    { id: "produce", name: "produce stand", r: [14, 146, 140, 32], z: 16, walk: [84, 222, "back"], look: "Oranges, apples, bananas going brown, and flowers in a bucket. The flowers are the most expensive thing on the block.", pickup: "That's stealing from Ali. I'm only stealing from temp agencies.", use: "I'd buy an orange but I don't have enough dollars to rhyme with that sentence." },
    { id: "buildingDoor", name: "front door (264)", r: [254, 30, 44, 90], z: 30, walk: [420, 224, "left"], look: "264 Jefferson. My building. The front door's lock hasn't worked since I moved in, which is the one benefit of a bad landlord.",
      exit: S => ({ room: "a1_hall", x: 110, y: 232, face: "right" }) },
    { id: "stoopSteps", name: "stoop", r: [286, 118, 160, 58], z: 14, walk: [426, 222, "back"], look: "The stoop. Eight steps, one loose brick, and a permanent resident. It's the neighborhood's living room.", use: "I'd sit, but Smitty has the good step. There are rules.", push: "It's a staircase. It stays where it is. It has a lease.", pickup: "It's a stoop. It is New York." },
    { id: "fireEscape", name: "fire escape", r: [394, 38, 74, 62], z: 8, walk: [430, 222, "back"], look: "The fire escape. Somebody's grown tomatoes on it. Somebody else keeps stealing them. That's the building in one sentence." },
    { id: "myWindow", name: "my window (4C)", r: [438, 14, 30, 38], z: 18, walk: [440, 222, "back"],
      look: S => A1.tod(S) === "day" ? "Top floor, far right. 4C. Curtains closed. A crack in the glass I've named Kevin." : "Top floor, far right. The light's on. I left the light on. Rent isn't the only thing I don't pay for." },
    { id: "salsDoor", name: "Sal's door", r: [572, 128, 48, 48], z: 30, walk: [598, 220, "back"], look: "Sal's Pizzeria. The best slice in Bushwick, and I'm not just saying that because I'm hungry.",
      exit: S => ({ room: "a1_sals", x: 70, y: 236, face: "right" }), pull: "The door's heavy. It's weighed down by 40 years of grease." },
    { id: "salsWin", name: "pizza window", r: [478, 132, 90, 46], z: 20, walk: [524, 220, "back"], look: "Pies in the window. Plain, pepperoni, and one I'm pretty sure is just called \"white.\" Steam on the glass. My stomach has its own opinion.", open: "I can't open a pizza window. I'm not that kind of hungry. Yet.", pickup: "Through the glass? I'd have to be a raccoon." },
    { id: "salsSign", name: "neon sign", r: [524, 76, 100, 28], z: 12, walk: [586, 220, "back"], look: "SAL'S in red neon. The L flickers like it's trying to leave." },
    { id: "salsMenu", name: "menu board", r: [624, 144, 62, 32], z: 18, walk: [654, 220, "back"], look: "A slice is $1.50, a plain pie is $15. New York math: a pie is ten times a slice, and eight slices make a pie. Somebody's winning." },
    { id: "salsAwning", name: "awning", r: [474, 104, 214, 28], z: 10, walk: [524, 222, "back"], look: "The Italian flag in awning form. Faded, torn, hung with love." },
    { id: "laundromat", name: "laundromat", r: [692, 96, 156, 82], z: 14, walk: [724, 222, "back"], look: "BUBBLE & SUDS, open 24 hours. At 3 AM it's the only place on the block that feels like a bar.", open: "I don't have a quarter, let alone laundry.", talk: "Nobody answers. They're all thinking about their socks." },
    { id: "subwayStairs", name: "subway stairs (L train)", r: [786, 182, 70, 60], z: 30, walk: [824, 238, "back"], look: "The L at Jefferson Street. It goes to Manhattan, Canarsie and a number of bad decisions. Fare: three dollars. Game fare. Don't ask.",
      exit: S => { const g = A1.travelExit(S); return g === "travel" ? { room: "a1_subway", x: 312, y: 242, face: "front" } : g; } },
    { id: "lampL", name: "streetlamp", r: [230, 30, 18, 208], z: 6, walk: [252, 228, "back"], look: "A streetlamp. It's been orange since 1983. Everybody on the block is a shade of that orange." },
    { id: "lampM", name: "streetlamp", r: [466, 30, 18, 208], z: 6, walk: [488, 228, "back"], look: "A streetlamp. It buzzes. I hum to it sometimes." },
    { id: "lampR", name: "streetlamp", r: [702, 30, 18, 208], z: 6, walk: [724, 228, "back"], look: "A streetlamp, with a sticker for a party that happened in 2022." },
    { id: "mailbox", name: "mailbox", r: [516, 206, 22, 32], z: 24, walk: [504, 230, "back"], look: "A USPS mailbox. It eats my bills and spits them out in 3-5 business days.", use: "I have nothing to mail. Except a letter to the landlord that says \"ha.\"", open: "The slot's for letters, not for me.", pickup: "It's bolted down. It's the most stable thing in Bushwick." },
    { id: "news", name: "newspaper boxes", rects: [[632, 206, 40, 32]], z: 24, walk: [640, 228, "back"], look: "Two newspaper boxes. One is free and the other one's free to ignore.", pickup: "A free paper? Sure. ...It's all ads for personal injury lawyers. I'll leave it.", open: "I don't have the quarters. The paper's not worth a quarter." },
    { id: "hydrant", name: "fire hydrant", r: [666, 212, 20, 26], z: 24, walk: [690, 232, "back"], look: "A fire hydrant. The one thing in New York that's always ready.", open: "I'm not opening a fire hydrant. The city has a thing about that.", use: "No. The last person who did that got on the news.", pull: "The cap won't budge. Somebody wanted it that way." },
    { id: "bike", name: "chained bike", r: [872, 204, 56, 36], z: 24, walk: [900, 232, "back"], look: "A bike chained to a pole. Just the frame and a seat. The wheels left for a better life.", pickup: "It's chained. And it's missing its wheels. A metaphor for my financial life." },
    { id: "recycling", name: "recycling bags", r: [880, 212, 50, 28], z: 28, walk: [904, 232, "back"], vis: S => (S.f.a1_bags || 0) < 6,
      look: "Bags of recycling the canners haven't got to. Cans, in other words. Money, in other other words.",
      pickup: async S => {
        if (RP.has("cans2") || RP.has("cans")) return "I'm already carrying a bag. I'm not a camel.";
        S.f.a1_bags = (S.f.a1_bags || 0) + 1; RP.give("cans2");
        await RP.say(["I dig through the recycling and come out with a bag of clean cans. Somebody's party went well.", "Another one. The block never runs out.", "Gross, but profitable.", "More cans. Cans, cans, cans.", "That's about the last of them.", "I'm becoming a canner. I'm legally allowed to put that on a resume."][Math.min(5, (S.f.a1_bags || 1) - 1)]);
      },
      use: "I have to take it to the machine at the bodega. Picking it up is the first step." },
    { id: "shed", name: "sidewalk shed", r: [846, 88, 114, 120], z: 6, walk: [868, 222, "back"], look: "Scaffolding that's been up since before I was born. It exists to hold up itself. A perfect building.", push: "It's scaffolding. It's holding up the building. I'm the one who would fall." },
    { id: "wheatpaste", name: "wheat-pasted flyers", r: [856, 120, 90, 56], z: 18, walk: [884, 226, "back"], look: "NOWHERE, SAT 10PM, flyers pasted five deep. One of them is a promoter's first draft. One of these should have my name. Spelled right.", pickup: "It's wheat paste. You'd need a heat gun and an hour.", talk: "I'd do my pitch, but these guys have heard it." },
    { id: "manhole", name: "manhole", r: [738, 214, 40, 18], z: 8, floor: true, walk: [758, 234, "back"], look: "A manhole. Steam comes out of it. Somebody down there is working on a plot to ruin my commute.", pickup: "It weighs about as much as my rent. I'd throw out my back.", open: "Nope. That's where the rats and the sewer gators live.", pull: "Locked down by the city. Which has locked down my whole life." }
  ],
  combos: [
    ["a1_slice", "a1_smitty", "Smitty looks at the slice like it's an old friend. \"That's a Sal's. Keep it. It's spoken for.\""],
    ["a1_package", "a1_smitty", "Smitty waves it off. \"That's for Sal. Not me. I'm the middleman. I don't touch the thing.\""],
    ["a1_flyer", "a1_smitty", "\"That's you? DJ... that? Kid, I'd have spelled it right.\""],
    ["cans", "recycling", "I've got a bag already. Adding it to the pile is like pouring water on water."],
    ["cans", "hydrant", "A hydrant doesn't pay deposits. Too bad."],
    ["a1_package", "hydrant", "A hydrant doesn't get a package. It gets dogs."],
    ["a1_slice", "hydrant", "The hydrant would just waste it."],
    ["a1_popcorn", "salsDoor", "Sal's doesn't need popcorn. Sal's has no snacks that aren't pizza."]
  ]
});

RP.a1.smittyTalk = smittyTalk;
/* Smitty's room hotspot */
RP.rooms.a1_stoop.hotspots.push({ id: "a1_smitty", name: "Smitty", look: "Smitty. Beanie, shades, hoodie, and a perfect record of never having moved. A stoop is his habitat.",
  talk: S => smittyTalk(S), use: "I'm not using Smitty. Smitty uses the stoop.", pickup: "He's heavier than he looks. Also, a person.", push: "Smitty doesn't move. Smitty has never moved.", open: "He's not that kind of guy. Or box.",
  give: "Smitty shakes his head. \"I'm good. I don't take gifts. Only favors.\"" });
})();
