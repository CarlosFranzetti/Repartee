/* Act 5 — a5_boutique: Lacquer & Wire (Williamsburg hi-fi boutique). Thursday.
   The Can Electric Taula 4 MR on its velvet plinth, Dynaudio Core 47s, CDJ-3000s, Ines behind the counter, Eddie Two-Times leaning on it.
   Mini-games: buyGear (mixer via Eddie's two-time deal or direct from Ines; monitors from Ines). Decks + turntables are a counter package. */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u, PK = RP.PK, A5 = RP.a5, art = A5.art, I = RP.icons;
const { R, P, ell, line, poly, bayer, mulberry, mix, txt, txtC, txtW, clamp } = U;
const K = U.ramp;
const HL = (c, x, y, w, col) => R(c, x, y, w, 1, col), VL = (c, x, y, h, col) => R(c, x, y, 1, h, col);
const TAULA = "can_electric_taula_4_mr", CORE = "dynaudio_core_47", CDJ3 = "pioneer_cdj_3000", MK7 = "technics_sl_1210mk7";

/* ---------------------------------------------------------------------------------------- art */
/* the Taula 4 MR: four-channel analogue rotary mixer, walnut cheeks, brass knobs. Scales from ~66 to ~130 px wide. */
art.taula = function (c, x, y, W, H, o) {
  o = o || {};
  const em = [], wood = "#7a4a2e", kw = K(wood), body = "#1c1b22", kb = K(body), big = H >= 34;
  PK.contactShadow(c, x, y + H - 2, W, 5, { alpha: 0.45 });
  const cw = Math.max(3, Math.round(W * 0.05)), px = x + cw, pw = W - 2 * cw;
  R(c, x, y, cw, H, wood); VL(c, x, y, H, kw[4]); VL(c, x + cw - 1, y, H, kw[0]); HL(c, x, y, cw, kw[4]);
  R(c, x + W - cw, y, cw, H, wood); VL(c, x + W - cw, y, H, kw[3]); VL(c, x + W - 1, y, H, kw[0]); HL(c, x + W - cw, y, cw, kw[4]);
  for (let i = 0; i < H / 3; i++) { P(c, x + 1 + (i * 3) % (cw - 1), y + i * 3, kw[1]); P(c, x + W - cw + 1 + (i * 5) % (cw - 1), y + i * 3 + 1, kw[1]); }
  R(c, px, y, pw, H, body); PK.gradV(c, px, y, pw, H, [kb[4], kb[3], kb[2], kb[1]], { dither: 1 });
  HL(c, px, y, pw, "#6a667c"); HL(c, px, y + H - 1, pw, "#0a0810"); VL(c, px, y, H, "#3a364a");
  for (let i = 0; i < pw; i += 2) P(c, px + i, y + 1, "#2a2836");                                  /* brushed edge */
  const mw = Math.round(pw * 0.17), cwid = (pw - mw) / 4, rows = big ? 3 : 2, kr = big ? 2 : 1;
  for (let i = 0; i < 4; i++) {
    const cx = Math.round(px + cwid * (i + 0.5));
    if (i) VL(c, Math.round(px + cwid * i), y + 3, H - 5, "#0e0c14");
    R(c, cx - 1, y + 2, 3, 1, i < 2 ? "#3fd07a" : "#ffb03a"); em.push([cx - 1, y + 2, 3, 1]);
    for (let r = 0; r < rows; r++) {
      const ky = y + 6 + r * (big ? 7 : 5);
      ell(c, cx, ky, kr, kr, "#8a86a0"); ell(c, cx - (kr > 1 ? 1 : 0), ky - (kr > 1 ? 1 : 0), Math.max(0, kr - 1), Math.max(0, kr - 1), "#d8d4e8"); P(c, cx, ky - kr, "#17131f");
    }
    const gy = y + H - (big ? 8 : 6), gr = kr + 1;
    ell(c, cx, gy + 1, gr, gr, "#6a4a1a"); ell(c, cx, gy, gr, gr, "#d8b050"); ell(c, cx - 1, gy - 1, Math.max(0, gr - 1), Math.max(0, gr - 1), "#f4dc90"); P(c, cx, gy - gr, "#3a2410"); P(c, cx - 1, gy - 1, "#ffffff");
  }
  const mx = Math.round(px + cwid * 4 + mw / 2);
  VL(c, Math.round(px + cwid * 4), y + 3, H - 5, "#0e0c14");
  ell(c, mx, y + 7, kr + 1, kr + 1, "#c8c4d8"); P(c, mx, y + 7 - kr - 1, "#17131f");
  ell(c, mx, y + H - 8, kr + 1, kr + 1, "#d8b050"); P(c, mx - 1, y + H - 9, "#ffffff");
  for (let l = 0; l < 4; l++) { R(c, mx - 4, y + 12 + l * 2, 2, 1, l < 2 ? "#3fd07a" : "#ffb03a"); em.push([mx - 4, y + 12 + l * 2, 2, 1]); }
  if (W >= 100) txt(c, "TAULA 4 MR", px + 4, y + H - 5, "#8a86a0", 1, 1);
  return em;
};
/* a Dynaudio Core 47 on its stand (or without) */
art.core47 = function (c, x, y, o) {
  o = o || {};
  const W = 34, H = 62, body = "#1d1b24", kb = K(body);
  if (o.stand !== false) {
    const bx = x + W / 2;
    R(c, bx - 1, y + H, 3, o.stand || 36, "#8a86a0"); VL(c, bx - 1, y + H, o.stand || 36, "#e8e4f4");
    R(c, bx - 12, y + H + (o.stand || 36), 25, 3, "#3a364a"); HL(c, bx - 12, y + H + (o.stand || 36), 25, "#8a86a0");
    PK.contactShadow(c, bx - 14, y + H + (o.stand || 36) - 1, 29, 5, { alpha: 0.45 });
  }
  R(c, x, y, W, H, body); PK.gradV(c, x, y, W, H, [kb[4], kb[3], kb[2], kb[1]], { dither: 1 });
  HL(c, x, y, W, "#5a566c"); VL(c, x, y, H, "#4a4658"); VL(c, x + W - 1, y, H, "#0a0810"); HL(c, x, y + H - 1, W, "#0a0810");
  ell(c, x + W / 2, y + 11, 5, 5, "#2a2736"); ell(c, x + W / 2, y + 11, 4, 4, "#c8a860"); ell(c, x + W / 2, y + 11, 2, 2, "#e8d090"); P(c, x + W / 2 - 2, y + 9, "#ffffff");
  ell(c, x + W / 2, y + 27, 9, 9, "#0a0810"); ell(c, x + W / 2, y + 27, 8, 8, "#3a364a"); ell(c, x + W / 2, y + 27, 6, 6, "#8a86a0"); ell(c, x + W / 2 - 1, y + 26, 4, 4, "#c8c4d8"); ell(c, x + W / 2, y + 27, 2, 2, "#4a4658"); P(c, x + W / 2 - 3, y + 23, "#ffffff");
  ell(c, x + W / 2, y + 47, 12, 12, "#0a0810"); ell(c, x + W / 2, y + 47, 11, 11, "#3a364a"); ell(c, x + W / 2, y + 47, 9, 9, "#8a86a0"); ell(c, x + W / 2 - 1, y + 46, 7, 7, "#c8c4d8"); ell(c, x + W / 2, y + 47, 4, 4, "#4a4658"); ell(c, x + W / 2, y + 47, 2, 2, "#2a2736"); P(c, x + W / 2 - 5, y + 41, "#ffffff"); P(c, x + W / 2 - 6, y + 42, "#ffffff");
  txt(c, "DYNAUDIO", x + 3, y + H - 5, "#8a86a0", 1, 0); P(c, x + 4, y + 2, "#3fd07a");
};
art.miniPoster = function (c, x, y, w, h, S) {
  R(c, x - 1, y - 1, w + 2, h + 2, "#0c0818");
  PK.gradV(c, x, y, w, h, ["#14102e", "#2a1858", "#6a2a7a", "#c8507a"], { dither: 1 });
  PK.util.clip(c, x, y, w, h, () => art.hlLogo(c, x + Math.round(w / 2), y + 3, 1, { beamLen: Math.round(w / 2) }));
  txtC(c, "HARBOR", x + w / 2, y + 22, "#f4f0e8", 1, 1); txtC(c, "LIGHTS", x + w / 2, y + 28, "#39d0ff", 1, 1);
  const nm = A5.pName(S).toUpperCase(); txtC(c, nm.length > 8 ? nm.slice(0, 8) : nm, x + w / 2, y + 36, "#ff3fa4", 1, 1);
  R(c, x + Math.floor(w / 2) - 2, y - 2, 4, 2, "#d8cfa0");
};

function hifiShelf(c, x, y, w, h) {
  const wood = "#6a4030", kw = K(wood);
  R(c, x, y, w, h, "#1c1218");
  for (let i = 0; i < 2; i++) {
    const sy = y + Math.round((i + 1) * h / 2) - 4;
    R(c, x, sy, w, 4, wood); HL(c, x, sy, w, kw[4]); HL(c, x, sy + 3, w, kw[0]);
  }
  R(c, x, y, 3, h, wood); VL(c, x, y, h, kw[3]); R(c, x + w - 3, y, 3, h, wood); VL(c, x + w - 3, y, h, kw[3]); R(c, x, y, w, 2, wood); HL(c, x, y, w, kw[4]);
  /* upper shelf: a tube amp with glowing valves */
  const em = [], ay = y + Math.round(h / 2) - 4;
  R(c, x + 8, ay - 14, 44, 14, "#2a2832"); HL(c, x + 8, ay - 14, 44, "#6a667c"); R(c, x + 8, ay - 3, 44, 3, "#17131f");
  for (let i = 0; i < 4; i++) { const tx = x + 14 + i * 10; R(c, tx, ay - 24, 5, 10, "#4a3a28"); R(c, tx + 1, ay - 23, 3, 8, "#ffb04a"); ell(c, tx + 2, ay - 25, 2, 2, "#c88a3a"); em.push([tx + 1, ay - 23, 3, 8]); P(c, tx + 1, ay - 22, "#fff0b0"); }
  for (let i = 0; i < 4; i++) ell(c, x + 14 + i * 10, ay - 7, 2, 2, "#c8c4d8");
  R(c, x + 58, ay - 22, 8, 22, "#d8c8a0"); ell(c, x + 62, ay - 14, 3, 3, "#3a2c1c"); HL(c, x + 58, ay - 22, 8, "#fff0c8");               /* a speaker */
  /* lower shelf: a little reel-to-reel and a stack of records */
  const by = y + h - 4;
  R(c, x + 8, by - 18, 40, 18, "#3a3848"); HL(c, x + 8, by - 18, 40, "#8a86a0"); ell(c, x + 20, by - 10, 7, 7, "#c8c4d8"); ell(c, x + 20, by - 10, 3, 3, "#17131f"); ell(c, x + 36, by - 10, 7, 7, "#c8c4d8"); ell(c, x + 36, by - 10, 3, 3, "#17131f");
  for (let i = 0; i < 6; i++) R(c, x + 56 + i * 3, by - 20 + (i % 2), 3, 20 - (i % 2), ["#c0302c", "#efeaf6", "#2f62b8", "#ffd23f", "#17131f", "#ff3fa4"][i]);
  return em;
}

function paint(c, S) {
  const em = [];
  /* walls: deep teal with wainscot */
  PK.plaster(c, 0, 0, 640, 166, { base: "#34505a", seed: 23, patches: 0, stains: 0, cracks: 0 });
  R(c, 0, 118, 640, 48, "#1f3239"); for (let x = 0; x < 640; x += 38) { R(c, x + 3, 124, 32, 36, "#274049"); HL(c, x + 3, 124, 32, "#3a5864"); VL(c, x + 3, 124, 36, "#3a5864"); HL(c, x + 3, 159, 32, "#142226"); VL(c, x + 34, 124, 36, "#142226"); }
  R(c, 0, 116, 640, 3, "#c8a860"); HL(c, 0, 116, 640, "#fff0b0"); HL(c, 0, 118, 640, "#6a4a1a");
  R(c, 0, 163, 640, 8, "#14222a"); HL(c, 0, 163, 640, "#4a6874");
  /* picture rail */
  R(c, 0, 14, 640, 2, "#c8a860"); HL(c, 0, 14, 640, "#fff0b0");
  /* floor: dark walnut + a runner */
  PK.planks(c, 0, 171, 640, 85, { base: "#5a3a2a", seed: 31 });
  poly(c, [[170, 214], [470, 214], [496, 252], [144, 252]], "#5a1a24"); poly(c, [[176, 216], [464, 216], [488, 250], [152, 250]], "#8a2a3a");
  poly(c, [[190, 220], [450, 220], [468, 246], [172, 246]], "#c8a860"); poly(c, [[194, 222], [446, 222], [462, 244], [178, 244]], "#8a2a3a");
  for (let i = 0; i < 9; i++) { const rx = 220 + i * 28; ell(c, rx, 233, 6, 3, "#c8a860"); ell(c, rx, 233, 3, 1, "#5a1a24"); }
  /* storefront window (left) with vinyl lettering and a poster in the corner */
  em.push.apply(em, PK.window(c, 10, 22, 142, 126, { view: "city", time: "day", seed: 4, frame: "#2a2420", sill: "#8a6a4a" }));
  txtC(c, "LACQUER & WIRE", 81, 40, "#f4ead0", 1, 1); R(c, 28, 48, 106, 1, "#f4ead0"); txtC(c, "HI-FI  VINYL  WIRE", 81, 52, "#f4ead0", 1, 1);
  art.miniPoster(c, 112, 94, 26, 40, S);
  /* hi-fi wall shelf over the listening corner */
  em.push.apply(em, hifiShelf(c, 170, 26, 112, 84));
  /* sign over the plinth */
  R(c, 300, 22, 136, 30, "#2a1810"); PK.gradV(c, 300, 22, 136, 30, ["#4a2c1c", "#3a2014", "#2a1810"], { dither: 1 }); R(c, 299, 21, 138, 1, "#c8a860"); R(c, 299, 52, 138, 1, "#c8a860"); VL(c, 299, 21, 32, "#c8a860"); VL(c, 436, 21, 32, "#c8a860");
  txtC(c, "LACQUER & WIRE", 369, 28, "#0c0818", 2, 1); txtC(c, "LACQUER & WIRE", 368, 27, "#e8c870", 2, 1); txtC(c, "FINE AUDIO  EST. WILLIAMSBURG", 368, 43, "#c8a860", 1, 1);
  /* the spot on the Taula: a visible cone */
  em.push.apply(em, PK.lightCone(c, 368, 54, 6, 96, 98, "#ffe2a8", { alpha: 0.4 }));
  R(c, 361, 52, 14, 3, "#17131f"); R(c, 364, 55, 8, 2, "#fff0c8"); em.push([364, 55, 8, 2]);
  /* a framed print and a barcelona postcard */
  PK.frame(c, 458, 28, 34, 44, { color: "#c8a860" }); R(c, 463, 33, 24, 34, "#1b1440"); ell(c, 475, 46, 7, 7, "#ff8a4c"); R(c, 463, 52, 24, 15, "#2a1858"); txt(c, "BCN", 469, 58, "#ffd27a");
  R(c, 506, 30, 28, 20, "#f4ead0"); R(c, 507, 31, 26, 12, "#4a8ae0"); R(c, 507, 38, 26, 5, "#e8c070"); txt(c, "HOLA", 512, 44, "#c0302c"); R(c, 536, 28, 4, 5, "#c0302c");
  /* the door (right) */
  PK.door(c, 596, 36, 42, 130, { color: "#2a4a54", panels: 2, seed: 9 });
  R(c, 604, 56, 24, 22, "#bfe0ee"); PK.gradV(c, 604, 56, 24, 22, ["#e8f4fa", "#a8d0e0"], { dither: 1 }); R(c, 603, 55, 26, 1, "#14222a"); R(c, 603, 78, 26, 1, "#14222a");
  R(c, 611, 82, 12, 7, "#c0302c"); txtC(c, "OPEN", 617, 83, "#f4f0e8", 1, 1);
  /* track lights */
  R(c, 0, 8, 640, 3, "#14222a"); HL(c, 0, 8, 640, "#4a6874");
  [60, 170, 300, 368, 440, 540].forEach(tx => { R(c, tx, 11, 5, 3, "#17131f"); R(c, tx - 1, 14, 7, 5, "#2a2634"); R(c, tx, 18, 5, 1, "#fff0c8"); em.push([tx, 18, 5, 1]); });
  return em;
}

/* the counter: depth sorted so Ines stands behind it */
function drawCounter(c, S) {
  PK.counter(c, 446, 150, 190, 52, { top: "#6a4030", front: "#2a1c28", seed: 4 });
  PK.cashRegister(c, 528, 126);
  /* a CDJ-3000 on a little riser under a glass cloche (the pair is in the back) */
  R(c, 456, 144, 66, 6, "#2a1c28"); HL(c, 456, 144, 66, "#8a6a4a");
  PK.cdj(c, 460, 112, { tier: 3, seed: 7 });
  const gx = 452, gy = 100, gw = 74, gh = 46;
  R(c, gx, gy, gw, 1, "#bfe8f4"); VL(c, gx, gy, gh, "#bfe8f4"); VL(c, gx + gw - 1, gy, gh, "#7ab8d0");
  PK.util.dshade(c, gx, gy, gw, gh, "#ffffff", (px, py) => { const q = ((px - gx) * 0.9 + (py - gy) + 600) % 46; return q < 5 ? 1 : 0; }, 0.22);
  PK.util.dshade(c, gx, gy, gw, gh, "#9ad8f0", () => 0.4, 0.08);
  R(c, gx + 22, 146, 28, 5, "#e8c870"); txtC(c, "CDJ-3000", gx + 36, 147, "#2a1810", 1, 1);
}
function drawPlinth(c, S) {
  const x = 312, y = 160, w = 112, h = 48;
  PK.contactShadow(c, x - 6, y + h - 3, w + 12, 8, { alpha: 0.55 });
  R(c, x, y, w, h, "#6a1a2a"); PK.gradV(c, x, y, w, h, ["#a02a40", "#7a1c2e", "#4a1020"], { dither: 1 });
  for (let i = 0; i < w; i += 5) { const f = Math.sin(i * 0.9) * 0.5 + 0.5; VL(c, x + i, y, h, f > 0.55 ? "#9a2a3e" : f > 0.25 ? "#5a1626" : "#3a0c18"); }
  R(c, x - 3, y - 4, w + 6, 6, "#8a2234"); HL(c, x - 3, y - 4, w + 6, "#ff8aa0"); HL(c, x - 3, y + 1, w + 6, "#3a0c18"); HL(c, x - 3, y - 3, w + 6, "#c04860");
  R(c, x - 3, y + h - 3, w + 6, 3, "#c8a860"); HL(c, x - 3, y + h - 3, w + 6, "#fff0b0");
  for (let i = 0; i < w + 6; i += 6) P(c, x - 3 + i, y + h - 6, "#c8a860");
  const em = art.taula(c, x + 4, y - 48, 104, 44);
  /* tassels */
  [x - 2, x + w + 1].forEach(tx => { R(c, tx, y + 4, 2, 10, "#e8c870"); R(c, tx - 1, y + 13, 4, 4, "#c8a860"); });
  return em;
}
function drawCore(c, S) {
  art.core47(c, 184, 118, { stand: 38 });
  art.core47(c, 244, 118, { stand: 38 });
}

function lightMap(S) {
  return { ambient: "#8c7a94", lights: [
    { box: [10, 22, 142, 126], r: 240, color: "#fff0d8", steps: 4, sy: 1, power: 0.85 },
    { x: 368, y: 60, r: 120, color: "#ffe2b0", steps: 5, sy: 1.1, power: 1.1 },
    { x: 230, y: 70, r: 120, color: "#ffc88a", steps: 3, power: 0.7 },
    { x: 520, y: 64, r: 150, color: "#ffd8a0", steps: 4, power: 0.85 }],
    halos: [{ x: 368, y: 56, r: 18, color: "#ffe2b0", strength: 1 }, { x: 62, y: 16, r: 14, color: "#ffe2b0", strength: 0.8 }, { x: 172, y: 16, r: 14, color: "#ffe2b0", strength: 0.8 }, { x: 442, y: 16, r: 14, color: "#ffe2b0", strength: 0.8 }, { x: 542, y: 16, r: 14, color: "#ffe2b0", strength: 0.8 }],
    rims: [{ x: 368, y: 60, r: 180, color: "#ffd890" }], key: { x: 300, y: 50 }, shadow: 0.55 };
}

/* ---------------------------------------------------------------------------------------- purchases */
const money = n => RP.u.fmtMoney(n);
async function payFor(S, gearId, res, slot, floorPct) {
  const g = RP.gearInfo(gearId) || { price: 1000 };
  let paid = res && typeof res.paid === "number" && res.paid > 0 ? res.paid : Math.round(g.price * (floorPct || 0.9));
  paid = clamp(Math.round(paid), Math.round(g.price * 0.5), Math.round(g.price * 1.25));
  paid = Math.min(paid, Math.max(0, Math.floor(S.money)));
  RP.money(-paid);
  RP.setGear(slot, gearId);
  return paid;
}
function checkDone(S) {
  if (S.f.a5_gearMixer && S.f.a5_gearMonitors && S.f.a5_gearDecks && !S.f.a5_gearDone) { S.f.a5_gearDone = true; RP.relight(); return true; }
  return false;
}
async function afterPurchase(S) {
  if (!checkDone(S)) return;
  await RP.wait(300);
  await RP.lines([
    "@a5_ines It all ships tonight to Bushwick. By courier. Not by Eddie.",
    "@eddie I'm a courier! I've got a van!",
    "@a5_ines You have a van with a mattress in it.",
    "That's everything. A hand-wired mixer from Barcelona, monitors that never lie, decks that don't take CDs.",
    "My studio is going to look like somebody else's studio."
  ]);
  RP.text("PRIYA (MGR)", "Gear done?! I'm told Eddie was involved. Please check your account balance and your dignity. Sleep. Tomorrow: radio.", false);
}

async function buyMixer(S, via) {
  if (S.f.a5_gearMixer) { await RP.say("The Taula's mine. It ships tonight. I keep saying it out loud to see if it sounds real."); return; }
  const taula = RP.gearInfo(TAULA) || { price: 1650 };
  if (via === "ines") {
    await RP.lines(["Ines. I'd like the Taula. From you.", "@a5_ines Straight. No Eddie. ...Good. I like you already.", "@a5_ines List price. I do not haggle. But I do... listen."]);
  } else {
    await RP.lines([
      "Eddie. Tell me about the two-time deal.",
      "@eddie Simple! I find you the mixer, I find you the price, and you pay me twice. Once now, once in spirit.",
      "@eddie I got a crate in the back: three rotaries. One's the Taula. One's a bargain. One's... a surprise.",
      "@eddie All of them work. Mostly. Hey, it was working this morning!"
    ]);
  }
  const res = await A5.play("buyGear", {
    slot: "mixer", options: [TAULA, "omnitronic_trm_202_mk3", "varia_rdm20"],
    seller: via === "ines" ? "Ines Ferrer (Lacquer & Wire)" : "Eddie Two-Times", budget: Math.floor(S.money), scams: via === "ines" ? 0 : 1, difficulty: via === "ines" ? 2 : 3
  }, { skipLabel: "Let Eddie ring it up" });
  const got = res.bought;
  if (got && got !== TAULA) {
    await RP.lines(["Hang on. That's not the one. I came for the Taula, not a stranger.", "@eddie A stranger! That's a real mixer, though! Two-time deal!", "I'll take a look at the others again."]);
    return;
  }
  const paid = await payFor(S, TAULA, res, "mixer", via === "ines" ? 1.0 : 0.88);
  S.f.a5_gearMixer = true; RP.sfx("success");
  await RP.lines([
    "@a5_ines " + money(paid) + ". For a Taula 4 MR. Handwired in Barcelona. Four channels, all analogue.",
    "@a5_ines The first Taula was built for a record store, Discos Paradiso. Now one is going to a headliner. I approve.",
    via === "ines" ? "@eddie I did the intro. I'm taking a percentage of the feelings." : "@eddie Two-time deal, kid! A good one. I'm only a little bit crying.",
    "I own a Taula. I own a TAULA."
  ]);
  await afterPurchase(S);
}
async function buyMonitors(S) {
  if (S.f.a5_gearMonitors) { await RP.say("The Core 47s. They ship tonight. My neighbors are going to hear the truth."); return; }
  await RP.lines([
    "@a5_ines The Core 47. Dynaudio's own history table puts it at 2019.",
    "@a5_ines Studio monitors do not flatter you. They tell you the truth about your mix. Some people cry.",
    "I cried at the BM5s. It was my kick drum."
  ]);
  const res = await A5.play("buyGear", {
    slot: "monitors", options: [CORE, "dynaudio_lyd_5", "krk_rokit_5_g4"], seller: "Ines Ferrer (Lacquer & Wire)", budget: Math.floor(S.money), scams: 0, difficulty: 2
  }, { skipLabel: "Take the Core 47s" });
  const got = res.bought;
  if (got && got !== CORE) { await RP.lines(["@a5_ines Those are fine monitors. They are not why you're here.", "Right. The Core 47s."]); return; }
  const paid = await payFor(S, CORE, res, "monitors", 0.92);
  S.f.a5_gearMonitors = true; RP.sfx("success");
  await RP.lines(["@a5_ines " + money(paid) + ". Core 47s, in pairs. Do not put them near a wall that lies.", "I'll put them near Lou's wall. It's the most honest wall I have."]);
  await afterPurchase(S);
}
async function buyDecks(S) {
  if (S.f.a5_gearDecks) { await RP.say("Decks and turntables are done. I'm slightly ashamed of how good that sounded."); return; }
  const cdj = RP.gearInfo(CDJ3) || { price: 3200 }, mk7 = RP.gearInfo(MK7) || { price: 1100 };
  await RP.lines([
    "@a5_ines The festival has a backline, but you want your own. The CDJ-3000. Nine-inch touchscreen. No disc drive.",
    "It's the first CDJ built around an MPU instead of the DSP. It also doesn't play CDs, which is a shame, I started on CD-Rs.",
    "@a5_ines And the turntables: a boxed pair of Technics SL-1210MK7s for the stage. Your tour pair has had a hard life.",
    "@eddie A hard life! I sold them to him! Two-time deal!"
  ]);
  const total = cdj.price + mk7.price;
  const i = await RP.choose(["Take the whole package (" + money(total) + ", Ines knocks something off)", "I'll think about it"]);
  if (i !== 0) { await RP.say("Let me think. A pair of CDJ-3000s. A pair of Technics. That's the price of a used car. A very, very musical car."); return; }
  const paid = Math.min(Math.max(0, Math.floor(S.money)), Math.round(total * 0.93));
  RP.money(-paid); RP.setGear("decks", CDJ3); RP.setGear("turntables", MK7);
  S.f.a5_gearDecks = true; RP.sfx("success");
  await RP.lines(["@a5_ines " + money(paid) + " for the lot. Boxed, matched, serial numbers in a row.", "@eddie A matched set! Like twins! Evil twins! Beautiful, rich twins!"]);
  await afterPurchase(S);
}

async function meetShop(S) {
  S.f.a5_boutiqueMet = true;
  RP.sfx("door");
  await RP.lines([
    "@a5_ines Welcome to Lacquer & Wire. If you are looking for headphones, the answer is no.",
    "@eddie THERE he is! The headliner! Eddie Two-Times. Remember me? I sold you a deal.",
    "Eddie? What are you doing in a hi-fi boutique?",
    "@eddie Networking. I'm the, uh, the independent facilitator. In this establishment. For gentlemen of music.",
    "@a5_ines He has been here since nine. He's rearranged my window. I am going to call someone.",
    "I'm told you have a Taula 4 MR.",
    "@a5_ines ...",
    "@a5_ines Yes. In the center. On the velvet. Please do not point at it. It gets shy."
  ]);
}

async function inesTalk(S) {
  if (!S.f.a5_boutiqueMet) { await meetShop(S); return; }
  await RP.say("Ines? Got a minute?");
  await RP.say(S.f.a5_gearDone ? "For a headliner? I have all the minutes." : "I have all the time. It's a boutique. The only thing in a rush is the dust.", "a5_ines");
  await RP.convo([
    { text: "Tell me about the Taula.", once: true, run: async () => {
      await RP.lines([
        "@a5_ines Can Electric Audio. Barcelona. The Taula 4 MR is four channels, one hundred percent analogue, a rotary mixer. Handwired.",
        "@a5_ines The company began because a record store needed a custom mixer. Discos Paradiso. Then others asked.",
        "@a5_ines There is also a two-channel, the Taula 2 MR. But for a festival, you need the four.",
        "A knob mixer. No screens, no sync button, no safety net.",
        "@a5_ines Exactly. Your ears do the work. The mixer just gets out of the way."
      ]);
    } },
    { text: "I want the Taula. Directly. From you.", when: S2 => !S2.f.a5_gearMixer, run: async () => { await buyMixer(S, "ines"); } },
    { text: "Show me the monitors.", when: S2 => !S2.f.a5_gearMonitors, run: async () => { await buyMonitors(S); } },
    { text: "What about decks and turntables?", when: S2 => !S2.f.a5_gearDecks, run: async () => { await buyDecks(S); } },
    { text: "Why is Eddie in your shop?", once: true, run: async () => {
      await RP.lines(["@a5_ines He came in with a coupon for a store I do not own.", "@a5_ines I let him stay. It is easier. He is... like weather. You cannot argue with weather."]);
    } },
    { text: "Thanks, Ines.", end: true, run: async () => { await RP.say("Anytime. Mind the velvet.", "a5_ines"); } }
  ]);
}
async function eddieTalk(S) {
  if (!S.f.a5_boutiqueMet) { await meetShop(S); return; }
  await RP.say("Eddie.");
  await RP.say("Kid. Ready for a two-time deal?", "eddie");
  await RP.convo([
    { text: "I want the Taula. Do your thing.", when: S2 => !S2.f.a5_gearMixer, run: async () => { await buyMixer(S, "eddie"); } },
    { text: "What's in it for you?", once: true, run: async () => {
      await RP.lines(["@eddie Me? I'm a facilitator. I see a need, I fill the need, and I take a little off the top. Twice. That's the two-time part.", "That's not a deal, that's a tax with a smile.", "@eddie Same thing, kid. Same thing."]);
    } },
    { text: "Remember my first turntables?", once: true, run: async () => {
      await RP.lines(["@eddie The AT-LP120s! Beautiful! Do they still work?", "They do. I almost bought the broken pair next to them.", "@eddie Hey, it was working this morning! This one works NOW."]);
    } },
    { text: "Later, Eddie.", end: true }
  ]);
}

/* ---------------------------------------------------------------------------------------- room */
RP.room({
  id: "a5_boutique", act: 5, name: "Lacquer & Wire",
  paint, cacheKey: S => S.name || "", light: lightMap, ambience: "room",
  walk: [[10, 214], [590, 214], [590, 252], [10, 252]],
  start: { x: 70, y: 226, face: "right" },
  fx: [{ type: "dust", rect: [320, 56, 100, 100], count: 28, color: "#fff4d6" }, { type: "dust", rect: [12, 30, 138, 120], count: 14, color: "#fff4d6" }],
  actors: [
    { id: "a5_ines", char: "a5_ines", x: 578, y: 194, face: "left", act: "stand", name: "Ines" },
    { id: "eddie", char: "eddie", x: 438, y: 232, face: "right", act: "stand", name: "Eddie Two-Times" }
  ],
  sprites: [
    { y: 205, draw: (c, S) => drawCounter(c, S) },
    { y: 207, draw: (c, S) => drawPlinth(c, S) },
    { y: 216, draw: (c, S) => drawCore(c, S) }
  ],
  hotspots: [
    { id: "a5_bdoor", name: "door", r: [594, 34, 46, 134], z: 20, walk: [612, 222, "right"], look: "A door with a bell that sounds expensive. Outside is Williamsburg and a guy selling something in a tote bag.", exit: "travel" },
    { id: "a5_bwin", name: "shop window", r: [8, 20, 148, 130], z: 20, walk: [80, 216, "back"], look: "LACQUER & WIRE, in vinyl letters. In the corner, taped inside the glass: the Harbor Lights poster. With my name on it. Eddie's idea. Ines is not happy about the tape.", pickup: "Ines has a rule about the window.", open: "It's a shop window. It opens for approximately never." },
    { id: "a5_bposter", name: "poster in the window", r: [108, 92, 32, 46], z: 40, walk: [120, 216, "back"], look: S => "The Harbor Lights poster. Headliner: " + A5.pName(S) + ". It's the reason the Taula is for sale. A sign of the times. And of Eddie.", pickup: "Ines laminated it to the glass. I'd need a chisel." },
    { id: "a5_shelf", name: "hi-fi shelf", r: [168, 24, 116, 88], z: 22, walk: [220, 216, "back"], look: "Tube amps with orange valves glowing like little Christmas lights, a reel-to-reel, a stack of records. A museum that takes cards.", use: "Ines says: \"If you can afford it, you can touch it. If you can't, you can look.\" I can look.", pickup: "That's thirty years of Ines's life. No." },
    { id: "a5_monitors", name: "Dynaudio Core 47s", rects: [[182, 116, 38, 104], [242, 116, 38, 104]], z: 40, walk: [232, 224, "back"],
      look: S => S.f.a5_gearMonitors ? "Sold. To me. They look smug." : "Dynaudio Core 47s on stands. Studio monitors that tell you the truth. The truth costs money.",
      use: S => buyMonitors(S), talk: "\"Hello, monitors.\" They'd tell me I'm lying, if I were. I'm fine.", pickup: "They weigh more than my self-esteem.", push: "They wobble a bit. Ines clears her throat." },
    { id: "a5_taula", name: "Can Electric Taula 4 MR", r: [314, 108, 112, 52], z: 45, walk: [366, 226, "back"],
      look: S => S.f.a5_gearMixer ? "My Taula. Hand-wired in Barcelona. It's on the velvet for one more night. Then it goes home with me." : "Can Electric Taula 4 MR. Four channels. One hundred percent analogue. Wood cheeks, brass knobs, hand-soldered in Barcelona. On velvet, under a spotlight, like a saint.",
      use: S => S.f.a5_gearMixer ? "It's mine. I'm allowed to touch it. I'm not ready." : (RP.say("No hands, says Ines's face. ...I should talk to her. Or to Eddie. It depends how I feel about being cheated.")),
      pickup: S => S.f.a5_gearMixer ? "It ships tonight. Insured. By a woman with a vendetta against couriers." : "I reach. Ines inhales. I retract. Nobody speaks.",
      push: "Pushing a Taula? Nothing happens. It's too well-built, and also I'm a coward.", pull: "I pulled a knob. Ines says it's \"the volume.\" My heart stopped.", talk: "\"Hello, beautiful.\" ...I said that out loud to a mixer. In front of a stranger.",
      give: (S, item) => "I'm giving the Taula nothing. It's the Taula that gives." },
    { id: "a5_bplinth", name: "velvet plinth", r: [310, 156, 118, 56], z: 30, walk: [366, 226, "back"], look: "Red velvet on a pedestal, tassels at the corners. The most expensive tablecloth in Brooklyn.", pickup: "It's velvet and it's heavy. It's also bolted down, I'm told, by someone with trust issues." },
    { id: "a5_bsign", name: "shop sign", r: [298, 20, 140, 34], z: 20, walk: [366, 226, "back"], look: "LACQUER & WIRE. FINE AUDIO. EST. WILLIAMSBURG. Gold letters on dark wood. It says \"you can't afford this\" in a very polite font." },
    { id: "a5_bcdj", name: "CDJ-3000", r: [450, 98, 78, 54], z: 42, walk: [490, 222, "back"],
      look: S => S.f.a5_gearDecks ? "Sold: the CDJ-3000s. Under glass, until tonight." : "A pair of Pioneer DJ CDJ-3000s in a glass case. Nine-inch touchscreens. No disc drive. A decade ago I'd have made fun of that. Now I want one in each hand.",
      use: S => buyDecks(S), open: "The glass is locked. Ines has a key. Ines has all the keys. Ines has always had all the keys.", pickup: "Absolutely not." },
    { id: "a5_bcounter", name: "counter", r: [446, 148, 194, 56], z: 18, walk: [520, 224, "back"], look: "A counter that's older than my career. A register, a jar of tiny screwdrivers, and a bowl of mints Ines doesn't let anyone touch.", pickup: "The mints are for display. Don't ask me how I know." },
    { id: "a5_bart", name: "framed print", r: [456, 26, 38, 50], z: 20, walk: [470, 222, "back"], look: "A framed print of a sun over a hill. BCN in tiny letters. Barcelona, I assume. I've never been. I've been to Berlin, where the sun is a rumor." },
    { id: "a5_bcard", name: "postcard", r: [504, 28, 36, 24], z: 22, walk: [520, 222, "back"], look: "A postcard from Barcelona. HOLA, it says. That's the first word I've seen in this shop that isn't about money." },
    { id: "a5_brug", name: "rug", r: [150, 214, 340, 40], z: 8, floor: true, look: "A red runner with gold trim. It leads you gently from the door to the part where you spend money." },
    { id: "a5_ines", name: "Ines", talk: S => inesTalk(S), look: "Ines Ferrer. Runs Lacquer & Wire. Apron, red glasses, the expression of someone who's heard every joke about the word \"wire.\"", give: (S, item) => "Ines doesn't take presents. Ines takes payment.", pickup: "I'm not picking up Ines.", use: "I'd rather talk to her.", push: "I'm not pushing Ines." },
    { id: "eddie", name: "Eddie Two-Times", talk: S => eddieTalk(S), look: "Eddie Two-Times, in a shiny jacket with a sticker that says AUTHORIZED RESELLER, in Sharpie, in his own handwriting.", give: (S, item) => "\"Two-time deal!\" Eddie says. I think he'd take it in cash, in spirit, and in a favor.", pickup: "Eddie has weight and a lot of paperwork. No.", use: "Eddie is not a thing. Eddie is a situation." }
  ],
  combos: [
    ["a5_marker", "a5_taula", "Writing on the Taula? Ines would turn me into a mixer part."],
    ["a5_marker", "eddie", "Eddie says: \"Sign it! That'll be double.\""],
    ["phone", "a5_taula", "Photos aren't allowed, says Ines. Memories are. Memories are free."]
  ],
  enter: async (S, from) => {
    if (!S.f.a5_boutiqueMet) await meetShop(S);
  },
  self: { look: "A headliner with $13,000 and zero impulse control. Priya is watching my balance.", talk: "I'd say something clever, but I'm in front of a Taula." }
});
})();
