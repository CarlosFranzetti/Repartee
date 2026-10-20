/* Act 1 — Bedroom 4C. Ported from the original Bedroom Demo, now on the shared engine,
   with real records and gear. Flags used here (S.f): a1_charged, a1_texts, a1_drawer,
   a1_swabs, a1_vodka, a1_mixer, a1_c1, a1_louAngry, a1_louAsked, a1_louHappy, a1_pizza,
   a1_cans, a1_crate, a1_charger, a1_booked, a1_acidUnder, a1_acidFlat, a1_slept, a1_usbSeen,
   a1_win, lamp (inverse: a1_lampOff), time ("night" Tue | "morning" Wed | "evening" Wed dusk | "sat" Saturday night).
   Hooks implemented in 15_home.js: RP.act1DoorExit, RP.act1LaptopUse, RP.act1BedUse, RP.act1BedroomEnter. */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u;
const { R, P, ell, bayer, mulberry, clamp, txt, txtW } = U;
const I = RP.icons;
const W = 640;

/* ---- records the kid owns at the start (real releases) ---- */
const REC_FIRST = "everything_but_the_girl_missing";   // Todd Terry remix, Atlantic, 1995
const REC_ACID = "phuture_acid_tracks";                // Trax, 1987
const REC_MOM = "grover_washington_jr_winelight";      // Elektra, 1980
RP.data.extraRecords = Object.assign(RP.data.extraRecords || {}, {
  white_nyc93: { id: "white_nyc93", artist: "Unknown", title: "\"NYC 93\" (white label)", label: "white label", year: 1993, format: "12\"", genre: "garage", bpm: 120, energy: 3, rarity: "grail", price: 0, vibe: ["weird", "builder"], fact: "No label, no artist. Just \"NYC 93\" in marker. Lou won't say where it came from." }
});

const night = S => S.f.time === "night" || S.f.time === "sat";
const dusk = S => S.f.time === "evening";
const lampOn = S => (night(S) || dusk(S)) && !S.f.a1_lampOff;
const modeOf = S => night(S) ? "night" : dusk(S) ? "dusk" : "day";

const C = {
  wall: "#8c7590", wallL: "#9a83a0", wallD: "#7c6582", patch: "#a891a8", patchI: "#998199", ceil: "#6e5874",
  base: "#5a4058", baseL: "#a48aa0", fl1: "#8a5a3e", fl2: "#946446", flS: "#5e3a28", flG: "#a87452",
  rug: "#5b2e8c", rugP: "#7a3fb0", rugB: "#e0368f", metal: "#4a4658", metalL: "#6a6680", sheet: "#d8d2e8", sheetD: "#b9b2cc", pillow: "#efeaf8", pillowD: "#c9c2dc",
  blank: "#6b35a0", blankL: "#8a4fc4", blankD: "#4f2678", under: "#231c2a",
  wood: "#7a4a32", woodT: "#9a6244", woodL: "#b47a56", woodD: "#5a3424", apron: "#6a3e2a", knob: "#e0c870",
  mon: "#1d1a24", monE: "#2e2a38", cone: "#ffd23f", coneD: "#c99a14", dust: "#3a3420", tw: "#c0bccc",
  cdj: "#2b2834", cdjT: "#3d3a4a", plat: "#55516a", platR: "#8a86a0", scr: "#123040", mix: "#232030", fad: "#cfcbe0", kn: "#8a86a0",
  paper: "#eadcc0", ink: "#1d1622", yel: "#ffd23f", fly: "#1b1440", pink: "#ff3fa4", cyan: "#39d0ff",
  door: "#6a4a5e", doorP: "#5a3c50", doorL: "#7d5a70", doorF: "#3e2c3c",
  rad: "#c8c2d4", radF: "#a8a2b8", radD: "#8a849a", hole: "#140c18", holeE: "#5e4a5e", outlet: "#eae6f2", slotC: "#55506a",
  crate: "#2f62b8", crateD: "#1d3f7a", crateL: "#4a80d8", box: "#c8925a", boxD: "#a8743e", red: "#c0302c",
  lap: "#8a8698", lapD: "#5a5668", cord: "#1a1620", chain: "#c8c2d4", sock: "#4a4658", bulb: "#fff4d6",
  pot: "#c06a3a", leaf: "#5a9a4a", leafD: "#3e7a36", dead: "#8a6a3a", frame: "#d8d0e6", frameD: "#a89ec0", sill: "#e4dcef"
};
const WIN = { x: 216, y: 30, w: 120, h: 94 };
let litWindows = [];

function paintCity(c, mode) {
  const day = mode === "day", dusk = mode === "dusk";
  const rnd = mulberry(42);
  const { x: x0, y: y0, w, h } = WIN;
  const sky = day ? ["#8fb4f5", "#a5c3f7", "#c2d2f5", "#e7d9e8", "#ffd7b8"] : dusk ? ["#3a2a78", "#7a3a86", "#c8527a", "#ff8a5a", "#ffc47a"] : ["#140c34", "#1f1146", "#2e1558", "#4a1d66", "#6e2a6e"];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const t = y / (h - 1) + (bayer(x, y) / 16 - 0.5) * 0.16; P(c, x0 + x, y0 + y, sky[clamp(Math.floor(t * 5), 0, 4)]); }
  if (mode === "night") {
    for (let i = 0; i < 18; i++) P(c, x0 + rnd() * w, y0 + rnd() * h * 0.45, rnd() > 0.5 ? "#ffffff" : "#b9a8ff");
    ell(c, x0 + w - 24, y0 + 15, 6, 6, "#f2e7c4"); P(c, x0 + w - 26, y0 + 13, "#d8cca4"); P(c, x0 + w - 22, y0 + 17, "#d8cca4"); P(c, x0 + w - 21, y0 + 12, "#d8cca4");
  } else if (dusk) {
    for (let i = 0; i < 5; i++) P(c, x0 + rnd() * w, y0 + rnd() * h * 0.2, "#d8c8ff");
    ell(c, x0 + 26, y0 + h - 30, 9, 9, "#fff0c0"); ell(c, x0 + 26, y0 + h - 30, 6, 6, "#ffffff");
    for (let i = 0; i < 4; i++) R(c, x0 + 6 + i * 11, y0 + 24 + i * 6, 34 - i * 4, 1, i % 2 ? "#ffb878" : "#e0709a");
  } else ell(c, x0 + 18, y0 + 18, 8, 8, "#fff6dc");
  const by = y0 + h - 16, bc = day ? "#7d7598" : dusk ? "#5a3a6a" : "#2a1c48";
  R(c, x0, by, w * 0.62, 2, bc);
  [[x0 + 18, 22], [x0 + 58, 22]].forEach(([tx, th]) => { R(c, tx, by - th, 3, th, bc); R(c, tx - 1, by - th, 5, 2, bc); });
  for (let i = 0; i < 40; i++) { const t = i / 39, sag = Math.sin(t * Math.PI) * 10; P(c, x0 + 19 + t * 40, by - 22 + sag, bc); }
  if (!day) for (let x = 0; x < w * 0.62; x += 3) P(c, x0 + x, by - 1, (x / 3) % 2 ? "#ffd27a" : "#ff6cbb");
  litWindows = [];
  let bx = x0;
  while (bx < x0 + w) { const bw = 7 + rnd() * 12 | 0, bh = 22 + rnd() * 34 | 0; R(c, bx, y0 + h - bh, bw, bh, day ? "#a49cc0" : dusk ? "#4a3068" : "#22163e"); bx += bw; }
  bx = x0 - 3;
  const litCols = ["#ffd27a", "#ffb04a", "#ff9ad5", "#9fe8ff"];
  while (bx < x0 + w) {
    const bw = 9 + rnd() * 14 | 0, bh = 14 + rnd() * 30 | 0, top = y0 + h - bh;
    R(c, Math.max(bx, x0), top, bw - Math.max(0, x0 - bx), bh, day ? "#7d7598" : dusk ? "#2e1c48" : "#130c28");
    for (let wy = top + 3; wy < y0 + h - 2; wy += 3) for (let wx = bx + 2; wx < bx + bw - 1; wx += 3) {
      if (wx < x0 || wx >= x0 + w) continue;
      if (rnd() < (day ? 0.18 : dusk ? 0.26 : 0.33)) { const col = day ? "#5d567a" : litCols[rnd() * 4 | 0]; P(c, wx, wy, col); if (!day) litWindows.push([wx, wy, col]); }
    }
    bx += bw + 1;
  }
  const sx = x0 + 78, sb = y0 + h, tc = day ? "#8e86ab" : dusk ? "#3a2458" : "#1b1233";
  R(c, sx, sb - 58, 14, 58, tc); R(c, sx + 2, sb - 66, 10, 8, tc); R(c, sx + 4, sb - 72, 6, 6, tc); R(c, sx + 6, sb - 82, 2, 10, tc);
  if (!day) { for (let wy = sb - 56; wy < sb - 2; wy += 4) for (let wx = sx + 2; wx < sx + 13; wx += 3) if (rnd() < 0.5) P(c, wx, wy, "#ffe2a0"); P(c, sx + 6, sb - 83, "#ff4040"); }
  c.fillStyle = "rgba(255,255,255,0.10)";
  for (let i = 0; i < 26; i++) { c.fillRect(x0 + 8 + i, y0 + 30 - i, 1, 1); c.fillRect(x0 + 14 + i, y0 + 34 - i, 1, 1); c.fillRect(x0 + 70 + i, y0 + 76 - i, 1, 1); }
}
function paintWindowFrame(c, open) {
  const { x, y, w, h } = WIN;
  R(c, x - 5, y - 5, w + 10, 5, C.frame); R(c, x - 5, y + h, w + 10, 4, C.frame);
  R(c, x - 5, y - 5, 5, h + 9, C.frame); R(c, x + w, y - 5, 5, h + 9, C.frame);
  R(c, x - 5, y - 5, w + 10, 1, "#efe8f8"); R(c, x - 1, y - 1, w + 2, 1, C.frameD);
  R(c, x + w / 2 - 2, y, 4, h, C.frame); R(c, x + w / 2 + 1, y, 1, h, C.frameD);
  const sy = open ? y + 8 : y + h / 2 - 2;
  R(c, x, sy, w, 5, C.frame); R(c, x, sy + 4, w, 1, C.frameD);
  if (open) R(c, x, y + h / 2 - 2, w, 2, C.frame);
  R(c, x - 10, y + h + 4, w + 20, 6, C.sill); R(c, x - 10, y + h + 9, w + 20, 1, C.frameD); R(c, x - 10, y + h + 4, w + 20, 1, "#ffffff");
}

function paint(c, S) {
  const mode = modeOf(S), day = mode === "day", open = !!S.f.a1_win;
  const rnd = mulberry(7);
  R(c, 0, 0, W, 166, C.wall);
  for (let i = 0; i < 1100; i++) P(c, rnd() * W, rnd() * 162, C.wallL);
  for (let i = 0; i < 700; i++) P(c, rnd() * W, rnd() * 162, C.wallD);
  [[150, 22, 10, 5], [366, 26, 7, 5], [566, 150, 9, 4], [22, 136, 7, 5], [190, 70, 6, 4]].forEach(([x, y, rx, ry]) => { ell(c, x, y, rx, ry, C.patch); ell(c, x + 1, y + 1, rx - 2, ry - 2, C.patchI); });
  for (let y = 0; y < 12; y++) { c.globalAlpha = Math.min(1, Math.round((12 - y) * 1.4 / 16 * 8) / 8); R(c, 0, y, W, 1, C.ceil); }
  c.globalAlpha = 1;
  [[300, 4], [301, 5], [301, 6], [302, 7], [302, 8], [303, 9], [302, 10], [303, 11], [304, 12], [304, 13]].forEach(([x, y]) => P(c, x, y, C.wallD));
  R(c, 0, 163, W, 9, C.base); R(c, 0, 163, W, 1, C.baseL);
  const ys = [172, 176, 181, 187, 194, 202, 211, 221, 232, 244, 257];
  for (let i = 0; i < ys.length - 1; i++) {
    R(c, 0, ys[i], W, ys[i + 1] - ys[i], i % 2 ? C.fl1 : C.fl2);
    R(c, 0, ys[i], W, 1, C.flS);
    const step = 70 + i * 14, off = (i * 37) % step;
    for (let x = off; x < W; x += step) R(c, x, ys[i], 1, ys[i + 1] - ys[i], C.flS);
    for (let k = 0; k < 40; k++) R(c, rnd() * W, ys[i] + 1 + rnd() * (ys[i + 1] - ys[i] - 1), 2 + rnd() * 6, 1, C.flG);
  }
  ell(c, 300, 230, 58, 13, C.rugB); ell(c, 300, 230, 55, 11, C.rug);
  for (let x = 252; x < 350; x += 8) { P(c, x, 230, C.rugP); P(c, x + 1, 229, C.rugP); P(c, x + 1, 231, C.rugP); P(c, x + 2, 230, C.rugP); }
  ell(c, 300, 230, 30, 5, C.rugP); ell(c, 300, 230, 27, 4, C.rug);
  // poster: GOOD MUSIC BETTER PEOPLE
  R(c, 41, 37, 58, 84, "#b8ab90"); R(c, 42, 38, 56, 82, C.paper);
  ["GOOD", "MUSIC", "BETTER", "PEOPLE"].forEach((s, i) => txt(c, s, 70 - Math.floor(txtW(s, 2, 2) / 2), 43 + i * 13, C.ink, 2, 2));
  ell(c, 70, 106, 8, 8, C.ink); ell(c, 70, 106, 7, 7, C.yel); R(c, 67, 103, 1, 3, C.ink); R(c, 72, 103, 1, 3, C.ink);
  [[66, 108], [67, 109], [68, 110], [69, 110], [70, 110], [71, 110], [72, 109], [73, 108]].forEach(([x, y]) => P(c, x, y, C.ink));
  R(c, 69, 37, 2, 2, "#c8c0b0");
  // outlet
  R(c, 196, 149, 8, 11, C.outlet); R(c, 198, 151, 1, 3, C.slotC); R(c, 201, 151, 1, 3, C.slotC); R(c, 198, 155, 1, 3, C.slotC); R(c, 201, 155, 1, 3, C.slotC);
  // bed
  R(c, 12, 118, 3, 92, C.metal); R(c, 14, 118, 1, 92, C.metalL); R(c, 12, 118, 46, 3, C.metal); R(c, 12, 118, 46, 1, C.metalL);
  for (let x = 22; x < 58; x += 8) R(c, x, 121, 2, 44, C.metal);
  R(c, 56, 118, 3, 50, C.metal);
  R(c, 14, 165, 178, 8, C.sheet); R(c, 14, 172, 178, 4, C.sheetD);
  ell(c, 36, 163, 18, 6, C.pillowD); ell(c, 36, 162, 17, 5, C.pillow); R(c, 24, 160, 10, 1, "#ffffff");
  R(c, 62, 161, 130, 12, C.blank);
  for (let x = 66; x < 190; x += 14) { R(c, x, 162, 2, 11, C.blankL); R(c, x + 6, 163, 1, 10, C.blankD); }
  R(c, 62, 161, 130, 1, C.blankL); R(c, 60, 173, 134, 22, C.blank); R(c, 60, 173, 134, 2, C.blankL);
  for (let x = 68; x < 192; x += 16) { R(c, x, 175, 2, 20, C.blankD); R(c, x + 3, 175, 1, 18, C.blankL); }
  for (let x = 60; x < 194; x++) if ((x * 7) % 5 < 2) P(c, x, 195, C.blankD);
  R(c, 14, 176, 46, 8, C.metal); R(c, 14, 176, 46, 1, C.metalL); R(c, 14, 196, 178, 12, C.under);
  R(c, 14, 184, 3, 26, C.metal); R(c, 188, 190, 3, 20, C.metal);
  // laptop
  R(c, 132, 151, 22, 12, C.lapD); R(c, 133, 152, 20, 10, "#1a2840"); R(c, 128, 162, 30, 3, C.lap); R(c, 128, 164, 30, 1, C.lapD);
  R(c, 140, 156, 6, 1, "#9fc2ff"); R(c, 135, 158, 10, 1, "#6a8ad8"); R(c, 131, 154, 1, 6, "#c0b8a0"); R(c, 152, 153, 1, 7, "#c0b8a0");
  // window, radiator, pipe hole
  paintCity(c, mode); paintWindowFrame(c, open);
  R(c, 236, 136, 80, 30, C.radD); R(c, 236, 136, 80, 3, C.rad);
  for (let x = 238; x < 314; x += 5) { R(c, x, 139, 4, 26, C.rad); R(c, x + 3, 139, 1, 26, C.radF); }
  R(c, 234, 162, 84, 4, C.radD); R(c, 238, 166, 4, 4, C.radD); R(c, 310, 166, 4, 4, C.radD);
  R(c, 316, 158, 30, 3, C.radF); R(c, 316, 158, 30, 1, C.rad); R(c, 343, 146, 3, 15, C.radF); R(c, 343, 146, 1, 15, C.rad);
  ell(c, 345, 143, 7, 5, C.holeE); ell(c, 345, 143, 5, 4, C.hole);
  [[339, 139], [351, 140], [341, 147], [350, 147], [344, 138]].forEach(([x, y]) => P(c, x, y, C.holeE));
  // bulb cord
  R(c, 470, 0, 1, 22, C.cord); R(c, 467, 22, 7, 5, C.sock); R(c, 467, 22, 7, 1, "#6a6680"); R(c, 473, 27, 1, 16, C.chain); R(c, 472, 42, 3, 3, C.chain);
  // NOWHERE flyer
  R(c, 445, 37, 54, 62, "#0e0a24"); R(c, 446, 38, 52, 60, C.fly);
  for (let y = 0; y < 22; y++) for (let x = 0; x < 22; x++) { const dx = x - 11, dy = y - 11, d = dx * dx + dy * dy; if (d < 100 && (x % 4 === 0 || y % 4 === 0 || Math.abs(d - 90) < 12)) P(c, 461 + x, 42 + y, C.pink); }
  txt(c, "NOWHERE", 472 - Math.floor(txtW("NOWHERE") / 2), 69, C.pink);
  txt(c, "SAT 10PM", 472 - Math.floor(txtW("SAT 10PM") / 2), 77, C.cyan);
  txt(c, "DJ ???", 472 - Math.floor(txtW("DJ ???") / 2), 86, "#bfb8e8");
  R(c, 470, 36, 4, 3, "#c8c0b0");
  // graffiti crown
  const g = C.pink;
  [[524, 56], [525, 55], [526, 54], [527, 55], [528, 56], [529, 53], [530, 52], [531, 53], [532, 56], [533, 55], [534, 54], [535, 55], [536, 56]].forEach(([x, y]) => { P(c, x, y, g); P(c, x, y + 1, g); });
  R(c, 524, 58, 13, 2, g); txt(c, "NYC", 520, 64, g, 2, 2); txt(c, "4EVR", 516, 77, g, 2, 2);
  [[534, 92], [534, 93], [534, 95], [522, 75], [541, 74]].forEach(([x, y]) => P(c, x, y, g));
  // desk and gear
  R(c, 372, 134, 210, 6, C.woodT); R(c, 372, 134, 210, 1, C.woodL); R(c, 372, 140, 210, 7, C.apron); R(c, 372, 146, 210, 1, C.woodD);
  R(c, 375, 147, 5, 50, C.woodD); R(c, 576, 147, 5, 50, C.woodD); R(c, 376, 147, 1, 50, C.wood);
  R(c, 380, 147, 138, 49, "#2a1c22");
  for (let i = 0; i < 6; i++) { const x = 392 + i * 20; for (let y = 150; y < 194; y++) P(c, x + Math.round(Math.sin(y / 5 + i) * 2), y, "#0f0a10"); }
  R(c, 520, 147, 56, 26, C.wood); R(c, 520, 147, 56, 1, C.woodL); R(c, 520, 172, 56, 1, C.woodD);
  [376, 552].forEach(mx => {
    R(c, mx, 90, 26, 44, C.mon); R(c, mx, 90, 26, 1, C.monE); R(c, mx, 90, 1, 44, C.monE);
    ell(c, mx + 13, 99, 4, 4, "#55506a"); ell(c, mx + 13, 99, 2, 2, C.tw);
    ell(c, mx + 13, 119, 10, 10, C.coneD); ell(c, mx + 13, 119, 8, 8, C.cone); ell(c, mx + 13, 119, 3, 3, C.dust);
    P(c, mx + 10, 115, "#fff2a0"); P(c, mx + 9, 116, "#fff2a0");
    txt(c, "KRK", mx + 8, 127, "#8a86a0");
  });
  [406, 500].forEach(x => {
    R(c, x, 116, 48, 18, C.cdj); R(c, x, 116, 48, 2, C.cdjT); R(c, x, 132, 48, 2, "#18161e");
    ell(c, x + 26, 125, 11, 5, C.platR); ell(c, x + 26, 125, 9, 4, C.plat); ell(c, x + 26, 125, 2, 1, C.platR);
    R(c, x + 5, 119, 15, 4, C.scr); R(c, x + 4, 127, 3, 2, "#3fd07a"); R(c, x + 4, 130, 3, 2, "#ff9a3f");
    R(c, x + 41, 120, 3, 11, "#18161e"); R(c, x + 41, 124, 3, 2, C.fad);
  });
  R(c, 456, 112, 42, 22, C.mix); R(c, 456, 112, 42, 1, "#3a3650");
  [462, 486].forEach(x => { for (let k = 0; k < 3; k++) ell(c, x + 2, 116 + k * 4, 1, 1, C.kn); R(c, x + 1, 125, 3, 3, "#18161e"); R(c, x + 1, 126, 3, 1, C.fad); });
  R(c, 470, 115, 6, 9, "#18161e"); for (let k = 0; k < 4; k++) P(c, 472, 116 + k * 2, k < 2 ? "#3fd07a" : "#ff9a3f");
  R(c, 466, 130, 22, 2, "#18161e"); R(c, 468, 129, 4, 3, C.fad);
  for (let i = 0; i < 20; i++) P(c, 431 + i, 134 + Math.round(Math.sin(i / 3)), "#18161e");
  // door
  R(c, 588, 36, 50, 130, C.doorF); R(c, 592, 40, 42, 126, C.door);
  R(c, 597, 46, 32, 46, C.doorP); R(c, 597, 46, 32, 1, C.doorL); R(c, 597, 46, 1, 46, C.doorL);
  R(c, 597, 100, 32, 58, C.doorP); R(c, 597, 100, 32, 1, C.doorL); R(c, 597, 100, 1, 58, C.doorL);
  ell(c, 598, 108, 2, 2, C.knob); P(c, 597, 107, "#fff0b0"); ell(c, 613, 54, 1, 1, "#18101a");
  R(c, 600, 96, 8, 3, "#cfc8a0");
  ell(c, 619, 128, 5, 5, C.yel); P(c, 617, 127, C.ink); P(c, 621, 127, C.ink); R(c, 617, 130, 5, 1, C.ink);
  R(c, 592, 163, 42, 3, "#ffcf7a");
  // emissive: window glass, screens, hallway light
  const em = [[WIN.x, WIN.y, WIN.w, WIN.h], [411, 119, 15, 4], [505, 119, 15, 4], [470, 115, 6, 9], [410, 127, 3, 5], [504, 127, 3, 5]];
  if (!day) em.push([592, 163, 42, 3], [133, 152, 20, 10]);
  if (lampOn(S)) em.push([465, 26, 11, 11]);
  return em;
}

/* dynamic props */
function drawCrate(c, S) {
  const x = 330, y = 194;
  if (!S.f.a1_crate) [["#e0368f", 2], ["#ffd23f", 7], ["#efeaf8", 12], ["#39d0ff", 18], ["#ff8a4c", 24], ["#1d1622", 29]].forEach(([col, ox], i) => { R(c, x + ox, y - 11 + (i % 2), 4, 12, col); R(c, x + ox, y - 11 + (i % 2), 4, 1, "#ffffff"); });
  else R(c, x + 4, y - 4, 4, 5, "#e0368f");
  R(c, x, y, 36, 28, C.crate); R(c, x, y, 36, 2, C.crateL); R(c, x, y + 26, 36, 2, C.crateD);
  for (let yy = y + 5; yy < y + 24; yy += 6) for (let xx = x + 3; xx < x + 33; xx += 6) R(c, xx, yy, 4, 3, C.crateD);
  R(c, x + 12, y + 4, 12, 3, C.crateD);
}
function drawPizza(c) {
  const x = 196, y = 222;
  R(c, x + 2, y, 40, 9, C.box); R(c, x, y + 9, 42, 4, C.boxD);
  for (let i = 0; i < 9; i++) P(c, x + 2 + i * 0.25, y + i, C.boxD);
  txt(c, "PIZZA", x + 10, y + 2, C.red); ell(c, x + 34, y + 5, 3, 2, "#a8743e");
}
const CANS = [{ x: 238, y: 236, list: [[0, 0, "#d83a3a", 0], [6, 1, "#3ab8d8", 1]] }, { x: 402, y: 214, list: [[0, 0, "#e0e0e8", 0], [5, 1, "#5ad85a", 0], [10, 0, "#d83a3a", 1]] }, { x: 556, y: 232, list: [[0, 0, "#3ab8d8", 0]] }];
function drawCan(c, x, y, col, lying) {
  if (lying) { R(c, x, y - 4, 7, 4, col); R(c, x + 6, y - 4, 1, 4, "#c0c0cc"); R(c, x, y - 4, 7, 1, "#ffffff"); }
  else { R(c, x, y - 7, 4, 7, col); R(c, x, y - 7, 4, 1, "#c0c0cc"); R(c, x + 1, y - 6, 1, 5, "#ffffff"); }
}
function drawDrawer(c, S) {
  if (S.f.a1_drawer) {
    R(c, 518, 150, 60, 10, "#3a2418");
    if (!S.f.a1_swabs) for (let i = 0; i < 5; i++) { R(c, 524 + i * 3, 153, 1, 6, "#f4f0f8"); P(c, 524 + i * 3, 152, "#ffffff"); }
    if (!S.f.a1_vodka) { R(c, 546, 146, 6, 13, "#cfe4ef"); R(c, 547, 143, 4, 3, "#cfe4ef"); R(c, 547, 141, 4, 2, "#c0302c"); R(c, 546, 151, 6, 4, "#e8e0f0"); }
    R(c, 556, 154, 5, 3, "#7a7a7a"); R(c, 562, 154, 5, 3, "#7a7a7a");
    R(c, 516, 160, 64, 18, C.wood); R(c, 516, 160, 64, 1, C.woodL); R(c, 516, 177, 64, 1, C.woodD); R(c, 544, 166, 8, 3, C.knob);
  } else { R(c, 524, 151, 48, 18, C.wood); R(c, 524, 151, 48, 1, C.woodL); R(c, 524, 168, 48, 1, C.woodD); R(c, 544, 158, 8, 3, C.knob); }
}
function drawPlant(c) {
  const x = 208, y = 196;
  R(c, x, y, 14, 14, C.pot); R(c, x - 1, y, 16, 2, "#d8844e"); R(c, x + 1, y + 2, 12, 1, "#9a4a2a"); R(c, x + 10, y + 3, 2, 10, "#9a4a2a");
  [[x + 5, y - 16, 2, 16], [x + 9, y - 12, 2, 12], [x + 2, y - 9, 2, 9], [x + 12, y - 7, 2, 7]].forEach(([a, bb, w, h]) => R(c, a, bb, w, h, C.leaf));
  [[x - 2, y - 9], [x - 1, y - 8], [x, y - 7], [x + 14, y - 10], [x + 15, y - 9], [x + 16, y - 8], [x + 6, y - 18], [x + 9, y - 14], [x + 4, y - 12]].forEach(([a, bb]) => P(c, a, bb, C.leafD));
  P(c, x - 3, y - 10, C.dead); P(c, x + 17, y - 7, C.dead); P(c, x + 7, y - 19, C.dead);
}

let playing = false, sparkT = 0;
function draw(c, S, t) {
  if (night(S) || dusk(S)) {
    for (let i = 0; i < litWindows.length; i++) { const w = litWindows[i]; if (((i * 7919 + Math.floor(t / 900) * 31) % 97) === 0) P(c, w[0], w[1], "#130c28"); }
    if (Math.floor(t / 700) % 2) P(c, WIN.x + 84, WIN.y + WIN.h - 83, "#ff4040");
  }
  const scrCol = playing ? (Math.floor(t / 250) % 2 ? "#62e6ff" : "#39d0ff") : "#1f6f8f";
  R(c, 411, 119, 15, 4, scrCol); R(c, 505, 119, 15, 4, scrCol);
  if (playing) [432, 526].forEach((x, j) => { const a = t / 180 + j; P(c, x + Math.cos(a) * 9, 125 + Math.sin(a) * 4, "#62e6ff"); P(c, x + Math.cos(a + 3.14) * 9, 125 + Math.sin(a + 3.14) * 4, "#62e6ff"); });
  P(c, 488, 114, S.f.a1_mixer ? "#3fd07a" : (Math.floor(t / 400) % 2 ? "#ff3f3f" : "#5a1a1a"));
  if (sparkT > performance.now()) for (let i = 0; i < 6; i++) P(c, 484 + Math.random() * 10, 116 + Math.random() * 10, Math.random() > 0.5 ? "#fff6a0" : "#ffffff");
  if (lampOn(S)) { ell(c, 470, 31, 3, 4, C.bulb); P(c, 469, 29, "#ffffff"); } else { ell(c, 470, 31, 3, 4, "#cfc8b8"); P(c, 469, 29, "#efe8d8"); }
  if (night(S) || dusk(S)) R(c, 140, 156, 6, 1, "#9fc2ff");
  drawDrawer(c, S);
  if (S.f.a1_charged) { R(c, 198, 156, 4, 3, "#efeaf6"); for (let y = 159; y < 200; y++) P(c, 200 + Math.round(Math.sin(y / 4) * 2), y, "#efeaf6"); }
  if (!S.f.a1_charger) { R(c, 118, 202, 6, 4, "#efeaf6"); for (let i = 0; i < 14; i++) P(c, 124 + i, 204 + Math.round(Math.sin(i / 2)), "#efeaf6"); }
}

/* ---------------- light ---------------- */
function light(S) {
  if (dusk(S)) {
    const on = lampOn(S);
    const L = { ambient: on ? "#86688c" : "#7a5c84", lights: [{ box: [WIN.x, WIN.y, WIN.w, WIN.h], r: 300, color: "#ff9d66", steps: 4, sy: 1 }, { x: 276, y: 70, r: 210, color: "#ffb88a", steps: 3 }, { x: 612, y: 166, r: 40, color: "#ffcf7a", steps: 2, power: 0.6 }],
      key: { x: 276, y: 60 }, rims: [{ x: 276, y: 80, r: 220, color: "#ffa070" }], shadow: 0.5 };
    if (on) { L.lights.push({ x: 470, y: 32, r: 220, color: "#ffe2c0", steps: 4, sy: 1.25, power: 0.8 }); L.halos = [{ x: 470, y: 31, r: 20, color: "#ffb060", strength: 1 }]; }
    return L;
  }
  if (!night(S)) return { ambient: "#cdbfd8", lights: [{ box: [WIN.x, WIN.y, WIN.w, WIN.h], r: 300, color: "#fff4e8", steps: 3, sy: 1 }, { x: 276, y: 60, r: 200, color: "#ffffff", steps: 2 }], key: { x: 276, y: 60 }, shadow: 0.45 };
  if (lampOn(S)) return { ambient: "#5a4f98", lights: [{ x: 470, y: 32, r: 250, color: "#ffe2c0", steps: 5, sy: 1.25 }, { box: [WIN.x, WIN.y, WIN.w, WIN.h], r: 34, color: "#6f66b8", steps: 2 }, { x: 612, y: 166, r: 40, color: "#ffcf7a", steps: 2, power: 0.6 }],
    halos: [{ x: 470, y: 31, r: 20, color: "#ffb060", strength: 1 }], rims: [{ x: 276, y: 80, r: 170, color: "#8f86e0" }], shadow: 0.6 };
  return { ambient: "#3c3670", lights: [{ box: [WIN.x, WIN.y, WIN.w, WIN.h], r: 120, color: "#9a90e0", steps: 3 }, { x: 612, y: 166, r: 50, color: "#ffcf7a", steps: 2, power: 0.7 }], key: { x: 276, y: 70 }, rims: [{ x: 276, y: 80, r: 200, color: "#a8a0ff" }], shadow: 0.5 };
}

/* ---------------- items ---------------- */
RP.item("charger", { name: "phone charger", short: "Charger", icon: c => I.cable(c), look: "Phone charger. Works if you bend the cable just right." });
RP.item("cans", { name: "bag of cans", short: "Cans", icon: c => { R(c, 5, 6, 22, 17, "#cfd2de"); R(c, 5, 6, 22, 1, "#ffffff"); [[8, "#d83a3a"], [13, "#3ab8d8"], [18, "#5ad85a"], [22, "#e0e0e8"]].forEach(([x, col]) => { R(c, x, 11, 4, 9, col); R(c, x, 11, 4, 1, "#c0c0cc"); }); }, look: "A bag of empties. The bodega machine downstairs turns these into money." });
RP.item("rec_first", { name: "\"Missing\" (Todd Terry remix)", short: "Missing", icon: c => I.record(c, "#ff8a4c"), look: "Everything But The Girl, \"Missing,\" the Todd Terry remix. Atlantic, 1995. The first record I ever bought. It still smells like the store.", use: "No turntables at home. Someday." });
RP.item("rec_acid", { name: S => S.f.a1_acidFlat ? "\"Acid Tracks\"" : "\"Acid Tracks\" (warped)", short: "Acid Tracks", icon: (c, S) => I.record(c, "#d8ff3a", !S.f.a1_acidFlat), iconKey: S => S.f.a1_acidFlat ? 1 : 0,
  look: S => S.f.a1_acidFlat ? "Phuture, \"Acid Tracks.\" Trax Records, 1987. Flat as a subway seat now." : "Phuture, \"Acid Tracks.\" Trax Records, Chicago, 1987. Somebody left it in a hot car. That somebody was me. It's warped like a potato chip.",
  use: S => S.f.a1_acidFlat ? "Saturday. On real turntables." : "Not like this. It'd play like a waterbed. Something heavy and flat would fix that." });
RP.item("rec_mom", { name: "\"Winelight\" (Mom's)", short: "Winelight", icon: c => { const sky = ["#3a1d5c", "#8a2a6e", "#e0568a", "#ff9a5a", "#ffd27a"]; for (let i = 0; i < 5; i++) R(c, 5, 1 + i * 4, 22, 4, sky[i]); ell(c, 16, 17, 5, 3, "#ffe8a0"); R(c, 5, 19, 22, 3, "#1a0f22"); R(c, 10, 6, 2, 9, "#1a0f22"); R(c, 11, 14, 4, 2, "#1a0f22"); R(c, 9, 5, 4, 1, "#1a0f22"); },
  look: "Grover Washington Jr., \"Winelight.\" Elektra, 1980. Mom's. It has \"Just the Two of Us\" on it, with Bill Withers singing.", use: "I'm not that tired." });
RP.item("swabs", { name: "cotton swabs", short: "Swabs", icon: c => { for (let i = 0; i < 5; i++) { R(c, 7 + i * 4, 6, 1, 13, "#f4f0f8"); R(c, 6 + i * 4, 4, 3, 3, "#ffffff"); R(c, 6 + i * 4, 18, 3, 3, "#ffffff"); } }, look: "Cotton swabs. Dry. They won't cut through ten years of party on their own." });
RP.item("vodka", { name: "100-proof vodka", short: "Vodka", icon: c => I.bottle(c), look: "100-proof vodka. From my birthday. Mostly for cleaning now." });
RP.item("vswab", { name: "vodka swab", short: "Vodka swab", icon: c => { R(c, 6, 11, 20, 1, "#f4f0f8"); ell(c, 5, 11, 2, 2, "#9fd8ff"); ell(c, 27, 11, 2, 2, "#ffffff"); P(c, 4, 14, "#9fd8ff"); P(c, 6, 15, "#9fd8ff"); }, look: "A cotton swab soaked in vodka. Smells like a bad decision." });
RP.item("white", { name: "white label \"NYC 93\"", short: "NYC 93", icon: c => { I.record(c, "#f4f0ea"); P(c, 15, 11, "#1d1622"); P(c, 17, 11, "#1d1622"); P(c, 16, 13, "#1d1622"); }, look: "A dusty white label. No artist, no title. Just \"NYC 93\" in marker. Lou says he \"used to go out.\"", use: "Saturday. I want to hear this on a real system." });

/* ---------------- scenes ---------------- */
async function chargePhone(S) {
  await RP.walkTo(204, 220, "back");
  RP.take("charger");
  await RP.say("Plugging in.");
  await RP.fadeTo(1, 500);
  await RP.say("Twenty minutes of staring at the ceiling later...", "nar");
  S.f.a1_charged = true; S.f.battery = "41%"; RP.refreshInv();
  await RP.fadeTo(0, 500);
  await RP.say("41%. Let's see who texted.");
  await readTexts(S);
}
async function readTexts(S) {
  const first = !S.f.a1_texts;
  await RP.phone(first ? [
    { from: "DANTE (NOWHERE)", text: "yo its dante. heard u spun at mikes bday. call me tonite + play me something. 1 shot", hot: true },
    { from: "STAFFRIGHT TEMPS", text: "Shift tmrw 9AM. Synergex Solutions, Midtown. Collared shirt." },
    { from: "MOM", text: "Did you eat" }
  ] : null);
  if (first) {
    S.f.a1_texts = true;
    await RP.lines(["Dante. DANTE. Dante books Nowhere.", "One shot, over the phone. I can't call him on a broken setup."]);
  }
}
async function testDecks(S) {
  await RP.walkTo(476, 214, "back");
  if (!S.f.a1_mixer) {
    if (!S.f.a1_c1) await RP.say("Two burned CD-Rs in the decks: Mood II Swing and Hardrive. Let's warm up.");
    playing = true; RP.sfx("crackle"); sparkT = performance.now() + 800;
    await RP.wait(700); playing = false;
    S.f.a1_c1 = true;
    await RP.lines(["...and channel 2 still sounds like bacon frying.", "Nobody's mixing anything through that."]);
    return;
  }
  if (S.f.a1_louAngry && !S.f.a1_louHappy) { await RP.lines(["Not again. Lou's still on the pipe, and one more beat brings him through the wall.", "I can't play a track until he's sorted. The hole in the wall is right there."]); return; }
  if (!S.f.a1_louHappy) {
    await RP.say("Quick test. Just a few beats.");
    playing = true;
    const lp = RP.audio.loop({ genre: "house", bpm: 122, seed: 3, energy: 3, volume: 0.7 }); lp.start();
    await RP.wait(1500);
    RP.shake(500); RP.sfx("thump");
    await RP.wait(300);
    lp.stop(0.1); playing = false;
    S.f.a1_louAngry = true;
    await RP.lines(["@lou HEY! IT'S ELEVEN O'CLOCK!", "@lou SOME OF US WORK IN THE MORNING, KID!", "That's Lou from 4B. He talks through the pipe hole like it's an intercom."]);
    return;
  }
  if (!S.f.a1_booked) { await RP.say(S.f.a1_texts ? "Decks work, Lou's happy. Time to call Dante." : "Decks work, Lou's happy. I should check my phone."); return; }
  await RP.say(night(S) ? "No more tonight. Lou's patience has a time limit, and so does his record." : "Practice later. I've got places to be.");
}
async function louTalk(S) {
  await RP.walkTo(318, 214, "back");
  if (S.f.a1_louHappy) { await RP.lines(["Lou? You good?", "@lou Shh. It's \"Just the Two of Us.\""]); return; }
  await RP.say("Hey, Lou?");
  await RP.say(S.f.a1_louAngry ? "WHAT. I'm trying to sleep." : "WHAT. I'm watching my program.", "lou");
  await RP.convo([
    { text: "Sorry about the noise, Lou.", run: () => RP.lines(["@lou Sorry don't lower my blood pressure, kid."]) },
    { text: "It's called house music, Lou.", run: () => RP.lines(["@lou I KNOW what it's called. I used to go out, kid. Every Saturday, 1993.", "@lou That's WHY my ears hurt."]) },
    { text: "What would you rather hear?", run: async () => {
      S.f.a1_louAsked = true;
      await RP.lines(["@lou Something smooth. Something for grown-ups.", "@lou A saxophone. A sunset. You know.", "A saxophone. A sunset..."]);
      if (RP.has("rec_mom")) await RP.say("Wait. I might have exactly that.");
      else if (!S.f.a1_crate) await RP.say("Hm. What's actually in my record crate?");
    } },
    { text: "Never mind.", run: async () => { await RP.say("Then keep it DOWN.", "lou"); return "end"; } }
  ]);
}
async function giveJazz(S) {
  await RP.walkTo(318, 214, "back");
  if (!S.f.a1_louAngry && !S.f.a1_louAsked) { await RP.say("Lou's not even mad at me yet. Let's not waste the good stuff."); return; }
  RP.take("rec_mom"); RP.removeRecord(REC_MOM);
  await RP.lines(["Lou, I'm sliding something through the pipe hole.", "@lou ...Grover Washington Junior. \"Winelight.\"", "@lou This has \"Just the Two of Us\" on it. Bill Withers, kid. BILL WITHERS.", "@lou Alright. You got one hour. Then I want silence."]);
  await RP.wait(500);
  await RP.say("Here. Take this. I can't listen to it anymore. Brings back too much.", "lou");
  RP.give("white"); RP.addRecord("white_nyc93"); S.f.a1_louHappy = true;
  await RP.lines(["A white label. No artist. Just \"NYC 93\" in marker.", "Lou, what is this?", "@lou Nothing. Go play your music."]);
}
/* what stands between the kid and the Dante call, in order: [still blocked?, what he says when he tries to call, what he says at the door] */
const DANTE_GATES = [
  [S => !S.f.a1_mixer && !S.f.a1_c1, "Before I call, I should make sure the decks actually work.", "Dante first. But I should check the decks work before I call."],
  [S => !S.f.a1_mixer, "If I call now, I'm auditioning on a broken mixer. Channel 2 sounds like bacon.", "Dante first. But I can't audition on a mixer that fries bacon on channel 2."],
  [S => !S.f.a1_louAngry && !S.f.a1_louHappy, "Let me run a quick test on the decks before I call.", "Dante first. The mixer's fixed. One quick test on the decks, then the call."],
  [S => !S.f.a1_louHappy, "Not with Lou banging on the pipe. I can't take a call, or play a track, over that. Time to find out what Lou wants.", "Dante first. And I can't take a call with Lou banging on the pipe. Lou first."]
];
RP.act1DanteBlock = (S, door) => { const g = DANTE_GATES.find(g => g[0](S)); return g ? g[door ? 2 : 1] : (door ? "Dante first. The decks work and Lou's quiet. Time to make the call." : null); };
async function callDante(S) {
  if (!S.f.a1_texts) { await readTexts(S); return; }
  if (S.f.a1_booked) { await RP.say("I'm not calling Dante again. You don't call twice."); return; }
  const block = RP.act1DanteBlock(S);
  if (block) { await RP.say(block); return; }
  await RP.walkTo(476, 214, "back");
  await RP.say("Okay. One shot.");
  RP.sfx("ring"); await RP.wait(1100);
  await RP.lines(["@dan Yeah?", "Dante, hey, it's... from Mike's birthday?", "@dan Right, right. The kid. Play me something. I got ninety seconds."]);
  playing = true;
  const res = await RP.mg.play("beatMatch", { a: "mood_ii_swing_closer", b: "hardrive_deep_inside", caller: "DANTE", difficulty: 1, story: true });
  playing = false;
  if (!res || !res.ok) { await RP.lines(["I hung up on Dante.", "...He'll pick up again. Probably. Let me call back when I'm ready."]); return; }
  await RP.lines(["@dan ...Okay. OKAY.", "@dan Saturday. Ten o'clock. You open at Nowhere.", "@dan First hour is vinyl. House rule. After that, bring your tracks on a USB.", "@dan No CDs, no laptop, don't be late. I'll pay you next week."]);
  RP.sfx("success");
  S.f.a1_booked = true; RP.setClock("TUE 11:58 PM"); RP.followers(12);
  RP.actor("kid").face = "front";
  await RP.lines(["I got a GIG.", "At NOWHERE."]);
  RP.text("DANTE (NOWHERE)", "oh + vinyl hour = 4 records. u need a closer. ray at deep cuts (east village) can help. tell him i sent u");
  await RP.wait(400);
  await RP.lines(["Tracks on a USB. I have a USB.", "...Which holds 4,000 photos of my ex's cat, Mr. Whiskers. I promised her I'd never delete them."]);
  S.f.a1_usbSeen = true;
  await RP.lines(["And Dante's text says a vinyl hour is four records. I've got three, and one of them is warped. I need a closer. Ray, at Deep Cuts.", "Tomorrow: temp job in Midtown. Tonight: sleep. Or the bodega. Probably both."]);
}
RP.act1CallDante = callDante;
RP.act1PhoneUse = async S => { if (S.act === 1 && S.f.a1_charged && !S.f.a1_booked && S.f.a1_texts && S.room === "bedroom") { const i = await RP.choose(["Call Dante", "Open the phone menu"]); if (i === 0) { await callDante(S); return true; } } return false; };

async function sleepNow(S) {
  if (!night(S)) { await RP.say("I just woke up. ...Okay, fair, but no."); return; }
  if (!S.f.a1_booked) { await RP.say(S.f.a1_texts ? "Sleep? Dante said tonight. Call first, sleep after." : "Sleep? It's barely eleven. The night's young. I'm young."); return; }
  if (!S.f.a1_acidUnder && !S.f.a1_acidFlat) {
    if (RP.has("rec_acid")) { await RP.say("Wait. If I'm lying here for eight hours, Acid Tracks should be under the mattress. Free flattening."); return; }
    if (!S.f.a1_crate) { await RP.say("Before I sleep, I should check what records I'm working with."); return; }
  }
  if (RP.act1BeforeSleep) { const stop = await RP.act1BeforeSleep(S); if (stop) return; }
  await RP.walkTo(120, 222, "back");
  await RP.say("Big day tomorrow.");
  await RP.fadeTo(1, 900);
  S.f.time = "morning"; S.f.a1_slept = true; S.f.battery = "100%"; RP.refreshInv(); RP.setClock("WED 7:42 AM"); RP.relight();
  await RP.say("Wednesday morning.", "nar");
  const k = RP.actor("kid"); k.x = 120; k.y = 224; k.face = "front";
  await RP.fadeTo(0, 900);
  await RP.say(S.f.a1_acidUnder ? "Acid Tracks has been under there all night. Moment of truth. I just have to pick it up." : "Morning.");
}
async function retrieveAcid(S) {
  if (!S.f.a1_acidUnder) return false;
  if (night(S)) { await RP.say("Not yet. It needs the whole night."); return true; }
  await RP.walkTo(110, 222, "back");
  S.f.a1_acidUnder = false; S.f.a1_acidFlat = true; delete S.f["warped_" + REC_ACID]; RP.give("rec_acid"); RP.addRecord(REC_ACID, true); RP.refreshInv();
  await RP.lines(["Flat as a subway seat.", "Okay. Temp job in Midtown, then Deep Cuts. Let's go be a professional."]);
  return true;
}

/* ---------------- room ---------------- */
RP.room({
  id: "bedroom", act: 1, name: "Bedroom 4C",
  paint, draw, light,
  cacheKey: S => modeOf(S) + (S.f.a1_win ? "o" : "c") + (lampOn(S) ? "l" : ""),
  lightKey: S => modeOf(S) + (lampOn(S) ? "l" : ""),
  enter: async (S, from) => { S.f.noTravel = true; if (RP.act1BedroomEnter) await RP.act1BedroomEnter(S, from); },
  ambience: S => S.f.a1_win ? "street" : "room",
  walk: [[12, 218], [200, 210], [628, 210], [628, 250], [12, 250]],
  start: { x: 300, y: 228, face: "front" },
  fx: [{ type: "dust", rect: [430, 40, 90, 110], count: 22, color: "#fff4d6", on: () => lampOn(RP.state) }],
  sprites: [
    { y: 222, draw: (c, S) => drawCrate(c, S) },
    { y: 235, draw: c => drawPizza(c) },
    { y: 210, draw: c => drawPlant(c) },
    ...CANS.map(g => ({ y: g.y, vis: S => !S.f.a1_cans, draw: c => g.list.forEach(([dx, dy, col, ly]) => drawCan(c, g.x + dx, g.y + dy, col, ly)) }))
  ],
  hotspots: [
    { id: "cans", name: "empty cans", z: 60, vis: S => !S.f.a1_cans, rects: () => CANS.map(g => [g.x - 3, g.y - 11, 20, 14]),
      walk: () => { const k = RP.actor("kid"); const g = CANS.reduce((p, q) => Math.abs(q.x - k.x) < Math.abs(p.x - k.x) ? q : p); return [g.x + 4, g.y + 8, "front"]; },
      look: "Empties. The bodega machine downstairs turns these into money. Worth picking up.",
      pickup: async S => { S.f.a1_cans = true; RP.give("cans"); await RP.say("I gather every empty in the room. That is... a lot of empties."); } },
    { id: "pizza", name: "pizza box", r: [194, 220, 46, 16], z: 55, walk: [216, 242, "back"],
      look: S => S.f.a1_pizza ? "Just the crust left. The crust can stay." : "Sunday's pizza. Or Saturday's. There's one crust left, and something flat and green stuck to the cheese. I'd have to pick it up.",
      pickup: async S => { if (S.f.a1_pizza) return "Just the crust left. The crust can stay."; S.f.a1_pizza = true; RP.money(5); await RP.say("There's a $5 bill stuck to the cheese. Rent money, basically."); },
      open: S => RP.runH(RP.curRoom().def.hotspots.find(h => h.id === "pizza").pickup) },
    { id: "crate", name: "milk crate", r: [328, 180, 40, 44], z: 50, walk: [348, 234, "back"],
      look: S => S.f.a1_crate ? "An empty milk crate. Soon to be a full milk crate." : "My record collection. All three of it. They're no use in a crate. I'd have to pick them up.",
      open: S => RP.runH(RP.curRoom().def.hotspots.find(h => h.id === "crate").pickup),
      pickup: async S => {
        if (S.f.a1_crate) return "It's empty. The records are on me.";
        S.f.a1_crate = true; delete S.f.crateHint;
        RP.give("rec_first"); RP.give("rec_acid"); RP.give("rec_mom");
        [REC_FIRST, REC_ACID, REC_MOM].forEach(id => RP.addRecord(id, true));
        S.f["warped_" + REC_ACID] = true;
        await RP.lines(["Everything But The Girl, \"Missing,\" the Todd Terry remix. Phuture, \"Acid Tracks.\" And... Mom's Grover Washington Jr. record. How did that get in here?", "I don't own turntables. I own records. It's a whole thing."]);
      },
      use: "It's a milk crate. You put records in it. I'm way ahead of you." },
    { id: "underbed", name: "under the bed", r: [16, 196, 174, 14], z: 45, walk: [110, 224, "back"],
      look: S => S.f.a1_charger ? "Dust and one sock. The sock stays." : "Dust, one sock, and something cable-shaped way in the back. I'd have to reach for it.",
      pickup: async S => { if (S.f.a1_charger) return "Just dust and one sock. I'm leaving the sock."; S.f.a1_charger = true; RP.give("charger"); await RP.say("Got the charger."); } },
    { id: "laptop", name: "laptop", r: [126, 150, 34, 16], z: 47, walk: [142, 222, "back"],
      look: "A 2011 laptop held together with gaffer tape. Every track I own lives on it.",
      use: S => RP.act1LaptopUse ? RP.act1LaptopUse(S) : (S.f.a1_booked ? "Tracks onto a USB for Saturday. Which needs a USB with room on it." : "My whole music library is in there. The CD-Rs in the decks came out of this thing."),
      pickup: "It's safer on the bed. Everything is safer on the bed.", open: "It's already open. It doesn't close all the way anymore." },
    { id: "bed", name: "bed", r: [10, 116, 186, 80], z: 30, walk: [100, 222, "back"],
      look: S => S.f.a1_acidUnder ? (night(S) ? "Acid Tracks is under the mattress. It needs a night of dead weight." : "Acid Tracks has been under there all night. I'd have to pick it up.") : (RP.has("rec_acid") && !S.f.a1_acidFlat) ? "My bed. Also my couch, my office and my dining room. Thin mattress, eight hours of me: that's basically a record press." : "My bed. Also my couch, my office and my dining room.",
      use: async S => { if (!night(S) && S.f.a1_acidUnder) { await retrieveAcid(S); return; } if (RP.act1BedUse) { const r = await RP.act1BedUse(S); if (r !== false) return; } await sleepNow(S); },
      pull: async S => { if (await retrieveAcid(S)) return; return "I'm not making the bed. That's a whole lifestyle."; },
      pickup: async S => { if (await retrieveAcid(S)) return; return "I'll pick it up when I move out. Rent-wise, that could be Friday."; },
      push: "It's against the wall. That's where beds go." },
    { id: "outlet", name: "outlet", r: [193, 146, 14, 16], z: 44, walk: [204, 220, "back"], look: S => S.f.a1_charged ? "My phone charger lives here now." : "One outlet for the whole room. It powers my entire career." },
    { id: "poster", name: "poster", r: [40, 36, 60, 86], z: 20, walk: [70, 222, "back"], look: "GOOD MUSIC, BETTER PEOPLE. Bought it at a flea market from a guy who was neither.", pickup: "It's the only thing holding that wall together." },
    { id: "window", name: "window", r: [206, 24, 140, 112], z: 20, walk: [276, 214, "back"],
      look: S => dusk(S) ? "Bushwick at dusk. The whole block turns orange for ten minutes a day. It's the landlord's only free upgrade." : night(S) ? "Bushwick at night. Somewhere out there, a promoter is lying to a DJ." : "Bushwick in the morning. Somewhere out there, a DJ is going to bed.",
      open: async S => { if (S.f.a1_win) return "It's already open. The city is in here with me."; S.f.a1_win = true; RP.sfx("click"); RP.audio.setAmbience("street"); await RP.say("Some city comes in. A siren, a bass line, somebody yelling about parking."); },
      close: async S => { if (!S.f.a1_win) return "It's closed."; S.f.a1_win = false; RP.sfx("click"); RP.audio.setAmbience("room"); await RP.say("Okay, city. That's enough city."); } },
    { id: "plant", name: "plant", r: [204, 174, 24, 38], z: 52, walk: [232, 220, "left"], look: "That's Gerald. He's seen things.", talk: "Hang in there, Gerald.", use: "I water him on holidays. Gerald loves holidays.", pickup: "Gerald stays where the light is. It's his whole thing." },
    { id: "radiator", name: "radiator", r: [232, 134, 92, 36], z: 25, walk: [276, 214, "back"], look: "It clanks all winter and does nothing in summer. The pipe runs through a hole into Lou's place.", use: "It's October. The landlord turns the heat on in December. Allegedly.", push: "It's bolted to the building. The building wins." },
    { id: "hole", name: "hole in the wall", r: [334, 132, 24, 22], z: 32, walk: [318, 214, "back"],
      look: S => S.f.a1_louHappy ? "Faint saxophone. Lou is at peace." : "A gap around the radiator pipe. It goes straight into 4B. I can hear Lou's TV.",
      talk: S => louTalk(S), use: "It's a hole. It's for talking to Lou and for nothing else.",
      give: async (S, item) => { if (item === "rec_mom") return giveJazz(S); return "Lou doesn't want that."; } },
    { id: "bulb", name: "light bulb", r: [460, 14, 22, 34], z: 26, walk: [470, 214, "back"], look: "A bare bulb on a pull chain. Mood lighting, landlord edition.",
      pull: async S => { if (!night(S) && !dusk(S)) return "It's daytime. The bulb is decoration now."; S.f.a1_lampOff = !S.f.a1_lampOff; RP.sfx("click"); RP.relight(); await RP.say(lampOn(S) ? "Click. Light." : "Click. Very moody. Very underground."); },
      use: async S => RP.runH(RP.curRoom().def.hotspots.find(h => h.id === "bulb").pull), pickup: "It's hot and it's the only one I have." },
    { id: "flyer", name: "Nowhere flyer", r: [444, 36, 56, 64], z: 21, walk: [472, 214, "back"], look: S => S.f.a1_booked ? "Saturday, 10 PM. That's me now. Sort of." : "Nowhere. Every Saturday. Dante's party. One day my name goes on one of these.", pickup: "Leave it. It's motivational." },
    { id: "graffiti", name: "graffiti", r: [514, 48, 46, 46], z: 19, walk: [548, 214, "back"], look: "NYC 4EVR, with a crown. My old roommate did it. My security deposit did not survive." },
    { id: "monitors", name: "KRK monitors", rects: [[374, 88, 30, 48], [550, 88, 30, 48]], z: 27, walk: [470, 214, "back"], look: "KRK Rokits with the bright yellow cones. All treble, no rent money.", use: S => testDecks(S), pickup: "They stay. They're the most expensive thing I own." },
    { id: "cdjs", name: "CDJs", rects: [[404, 112, 51, 24], [499, 112, 51, 24]], z: 30, walk: [476, 214, "back"], look: "A pair of Pioneer CDJ-350s, bought used. They play CDs, they read USBs, and they hate me a little.",
      use: S => testDecks(S), open: "The CD trays have my burned CD-Rs in them. Mood II Swing and Hardrive, Sharpie on the label.", push: S => testDecks(S) },
    { id: "mixer", name: "mixer", r: [455, 110, 44, 26], z: 31, walk: [476, 214, "back"], look: S => S.f.a1_mixer ? "Two channels, both working. A personal best." : "A cheap Numark two-channel. One channel works. Channel 2 crackles like a campfire.",
      use: S => testDecks(S), push: S => testDecks(S), pull: "Pulling faders out of the mixer is how I got here." },
    { id: "desk", name: "desk", r: [370, 132, 214, 66], z: 15, walk: [470, 214, "back"], look: "Flat-pack desk. Assembled with seven screws left over. Still standing. Mostly." },
    { id: "drawer", name: "desk drawer", r: [516, 146, 64, 32], z: 40, walk: [548, 214, "back"],
      look: S => S.f.a1_drawer ? ((S.f.a1_swabs && S.f.a1_vodka) ? "Three dead batteries and a takeout menu." : "Cotton swabs, a bottle of 100-proof vodka, three dead batteries and a takeout menu. Some of it's worth picking up.") : "My junk drawer. Shut. I'd have to open it to see what's in there.",
      open: async S => { if (S.f.a1_drawer) return "It's open."; S.f.a1_drawer = true; await RP.say(S.f.a1_swabs && S.f.a1_vodka ? "Batteries and a menu. The good stuff's gone." : "Cotton swabs, a bottle of 100-proof vodka, three dead batteries and a takeout menu."); },
      close: async S => { if (!S.f.a1_drawer) return "It's closed."; S.f.a1_drawer = false; },
      pickup: async S => {
        if (!S.f.a1_drawer) return "It's closed.";
        const got = [];
        if (!S.f.a1_swabs) { S.f.a1_swabs = true; RP.give("swabs"); got.push("the cotton swabs"); }
        if (!S.f.a1_vodka) { S.f.a1_vodka = true; RP.give("vodka"); got.push("the vodka"); }
        return got.length ? "I take " + got.join(" and ") + ". The batteries have earned their rest." : "Just batteries and a menu. They stay.";
      } },
    { id: "swabs", name: "cotton swabs", r: [520, 148, 20, 12], z: 70, vis: S => S.f.a1_drawer && !S.f.a1_swabs, walk: [548, 214, "back"], look: "Cotton swabs. Clean ones, even.", pickup: async S => { S.f.a1_swabs = true; RP.give("swabs"); await RP.say("Cotton swabs."); } },
    { id: "vodka", name: "bottle of vodka", r: [543, 139, 13, 21], z: 71, vis: S => S.f.a1_drawer && !S.f.a1_vodka, walk: [548, 214, "back"], look: "100-proof vodka from my birthday. Mostly for cleaning now.", pickup: async S => { S.f.a1_vodka = true; RP.give("vodka"); await RP.say("Vodka. For cleaning. Mostly."); } },
    { id: "door", name: "door", r: [586, 34, 54, 134], z: 20, walk: [612, 216, "right"],
      look: "The hallway, Lou's door, the stairs, the stoop. The rest of New York.",
      exit: S => RP.act1DoorExit ? RP.act1DoorExit(S) : "The rest of the building isn't built yet. Tonight it's me and this room." },
    { id: "rug", name: "rug", r: [242, 216, 116, 28], z: 8, floor: true, look: "A rug. It ties the room together. Nothing else does." },
    { id: "wallTop", name: "ceiling crack", r: [292, 0, 20, 16], z: 9, look: "That crack has been getting longer. I've decided it's art." }
  ],
  combos: [
    ["charger", "phone", S => chargePhone(RP.state)],
    ["charger", "outlet", async () => { if (!RP.has("phone")) return "I need the phone too."; await chargePhone(RP.state); }],
    ["phone", "outlet", () => RP.has("charger") ? chargePhone(RP.state) : "I need the charger. It's around here somewhere."],
    ["swabs", "vodka", async () => { RP.take("swabs"); RP.take("vodka"); RP.give("vswab"); await RP.say("Soaked a swab in 100-proof vodka. It's a cleaning tool now. Technically."); }],
    ["vswab", "mixer", async () => { RP.take("vswab"); RP.state.f.a1_mixer = true; RP.sfx("click"); await RP.lines(["I run the vodka swab up and down channel 2...", "...and the crackle's gone. Cleanest thing in this apartment."]); }],
    ["vswab", "cdjs", async () => { RP.take("vswab"); RP.state.f.a1_mixer = true; RP.sfx("click"); await RP.lines(["The decks are fine. It's the mixer. I scrub channel 2 with the vodka swab...", "...and the crackle's gone."]); }],
    ["swabs", "mixer", "Dry swabs won't cut through ten years of party."],
    ["vodka", "mixer", "Pouring vodka straight onto electronics feels like a decision I'd regret."],
    ["vodka", "cdjs", "Pouring vodka straight onto electronics feels like a decision I'd regret."],
    ["rec_acid", "bed", async () => { const S = RP.state; if (S.f.a1_acidFlat) return "It's flat already."; RP.take("rec_acid"); S.f.a1_acidUnder = true; await RP.say("Slid it under the mattress. A night of dead weight should flatten it. I can provide dead weight."); }],
    ["rec_mom", "hole", () => giveJazz(RP.state)],
    ["rec_first", "hole", "Lou wants smooth. \"Missing\" is a lot of things. Smooth isn't one of them."],
    ["rec_acid", "hole", "Giving Lou anything called \"Acid Tracks\" is how I get evicted."],
    ["white", "hole", "He gave it to me for a reason."],
    ["usb_cat", "laptop", () => RP.state.f.a1_booked ? RP.lines(["Let me just clear some space on... oh.", "4,000 photos of Mr. Whiskers. I promised. I need a new USB."]) : "Nothing to copy yet."],
    ["a1_usb", "laptop", () => RP.act1LaptopUse(RP.state)],
    ["a1_usb3", "laptop", "Open the pack first. Then I'll have a USB to put things on."],
    ["a1_usb", "cdjs", "The CDJs read USBs. Saturday. Right now it's blank and so is my plan."],
    ["a1_usb", "self", "It goes in my pocket, not in my mouth. I have standards."],
    ["a1_flyer", "poster", "My name doesn't even fit on the same wall as that poster. Ironically."],
    ["usb_cat", "cdjs", "It's full of cat photos. The decks would just show Mr. Whiskers. ...Actually, that's kind of a set."],
    ["rec_first", "cdjs", "That's vinyl. Those are CDJs. That's not how any of this works."],
    ["rec_acid", "cdjs", "That's vinyl. Those are CDJs. That's not how any of this works."],
    ["rec_mom", "cdjs", "That's vinyl. And it's smooth jazz. Two reasons."],
    ["white", "cdjs", "That's vinyl. Saturday, on real turntables."],
    ["phone", "cdjs", () => callDante(RP.state)],
    ["cans", "bed", "I'm not sleeping with the cans. Not again."],
    ["vodka", "self", "It's a Tuesday. ...No."],
    ["vswab", "self", "I'm clean enough. The mixer isn't."]
  ]
});

/* walkthrough for the bedroom section (Tuesday night → booked → Wednesday morning) */
RP.walkthroughs.bedroom = [
  ["pickup", "hot:underbed"], ["use", "inv:phone", "charger"],
  ["expect", "S.f.a1_texts", "texts read"],
  ["pickup", "hot:pizza"], ["pickup", "hot:cans"],
  ["use", "hot:cdjs"], ["open", "hot:drawer"], ["pickup", "hot:drawer"],
  ["use", "inv:swabs", "vodka"], ["use", "hot:mixer", "vswab"],
  ["expect", "S.f.a1_mixer"],
  ["use", "hot:cdjs"], ["expect", "S.f.a1_louAngry"],
  ["pickup", "hot:crate"],
  ["give", "hot:hole", "rec_mom"], ["expect", "S.f.a1_louHappy && RP.has('white')"],
  ["mg", { ok: true, score: 90 }], ["answers", [0]], ["use", "inv:phone"],
  ["expect", "S.f.a1_booked", "booked"],
  ["use", "hot:bed", "rec_acid"], ["use", "hot:bed"],
  ["expect", "S.f.time === 'morning'"], ["pull", "hot:bed"], ["expect", "S.f.a1_acidFlat"]
];
})();
