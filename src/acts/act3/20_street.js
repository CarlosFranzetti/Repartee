/* Act 3 — Ludlow Street, Lower East Side, outside the Halcyon Room.
   Tiny works the door at night, Eddie's van is always parked in the loading bay, the bodega sells snacks.
   Flags used: a3_arrived, a3_tinyMet, a3_arr3, a3_night3in, a3_boughtChips, a3_eddieMet, a3_cdj, a3_twinkie3, a3_marcus3. */
(function () {
"use strict";
const RP = window.RP;
const A3 = RP.A3;
const U = RP.u;
const PK = RP.PK;
const { R, P, ell, txt, txtC, txtW, bayer, mulberry, ramp } = U;
const W = 640;

const mood = S => (S.f.a3_opener && !S.f.a3_thu3 && !S.f.a3_train) ? "dusk" : "night";

/* ------------------------------------------------------------------ paint */
function paint(c, S) {
  const m = mood(S), night = m === "night", em = [];
  const rnd = mulberry(404);
  // sky + far skyline
  PK.sky(c, 0, 0, W, 70, { time: night ? "night" : "dusk", stars: night ? 28 : 5, moon: night ? { x: 560, y: 16, r: 5 } : false, seed: 401 });
  em.push.apply(em, PK.skyline(c, 0, 6, W, 66, { night, layers: 2, seed: 402 }));
  /* ---- left: bodega building ---- */
  PK.brick(c, 0, 24, 166, 150, { base: night ? "#7a3a34" : "#9a4a3a", worn: 0.4, seed: 403 });
  R(c, 0, 20, 166, 5, "#4a2a30"); R(c, 0, 20, 166, 1, "#8a5a50"); R(c, 0, 24, 166, 1, "#2a1a20");                  // cornice
  [[10, 34], [48, 34]].forEach(([x, y]) => em.push.apply(em, PK.window(c, x, y, 28, 40, { view: "interior", lit: rnd() > 0.35, time: m, frame: "#d8d0e6", curtain: "#c0555a", seed: x })));
  PK.fireEscape(c, 92, 28, 70, 100, { floors: 2, ladder: false, seed: 405 });
  // bodega shopfront
  PK.awning(c, 6, 104, 154, { colors: ["#1f8a4c", "#efe8d8"], h: 24, stripe: 9, text: "SUNRISE DELI", textColor: "#fff6dc", seed: 406 });
  R(c, 6, 128, 154, 44, "#1a1620");                                                                                      // shopfront base
  em.push.apply(em, PK.cooler(c, 14, 134, 56, 36, { lit: true, sign: "ICE COLD", seed: 407 }));
  R(c, 12, 130, 86, 3, "#5a4a42"); R(c, 12, 133, 86, 1, "#2a1c1c");
  // shop window glow + grill shadow
  R(c, 74, 134, 28, 38, "#ffd890"); R(c, 74, 134, 28, 2, "#fff2c0");
  for (let y = 138; y < 170; y += 5) R(c, 76, y, 24, 2, "#e8b060");
  em.push([74, 134, 28, 38]);
  PK.door(c, 108, 130, 40, 42, { metal: true, color: "#6a7480", window: true, seed: 408 });
  PK.neon(c, "OPEN", 114, 108, "#ff4a4a", { scale: 1, tube: 1, glow: true, strength: 1 }).forEach(r => em.push(r));
  PK.neon(c, "LOTTO", 26, 110, "#39d0ff", { scale: 1, tube: 1, glow: true, strength: 0.9 }).forEach(r => em.push(r));
  /* ---- middle: the Halcyon Room ---- */
  PK.plaster(c, 166, 4, 314, 170, { base: "#2a1e3a", patches: 2, stains: 3, cracks: 3, seed: 410 });
  R(c, 166, 0, 314, 6, "#17101e"); R(c, 166, 5, 314, 1, "#4a3a5e");
  // wheat-pasted flyers all over the black front
  const pal = ["neon", "paper", "mono", "sunset"];
  [[172, 130, 16, 24], [428, 78, 24, 34], [452, 104, 22, 30], [408, 118, 18, 26]].forEach(([x, y, w, h], i) => PK.poster(c, x, y, w, h, { palette: pal[i % 4], title: ["SOUL", "CLAP", "HOUSE", "AFTERS", "DISCO"][i], lines: ["THU", "SAT"], seed: 411 + i, tape: false }));
  // brandon's poster: gold, huge, very shiny
  R(c, 362, 58, 52, 74, "#17101e"); R(c, 363, 59, 50, 72, "#e0b030");
  // two diagonal sheen streaks across the gold
  for (let y = 0; y < 72; y++) [[44, 4, "#f0c848"], [45, 2, "#ffe880"], [66, 3, "#f0c848"], [67, 1, "#ffe880"]].forEach(([o, w, col]) => { const x0 = 363 + o - ((y * 0.7) | 0); if (x0 >= 363 && x0 + w <= 413) R(c, x0, 59 + y, w, 1, col); });
  ell(c, 388, 90, 9, 9, "#2a1c10"); R(c, 381, 88, 14, 3, "#0b0712"); R(c, 386, 98, 5, 2, "#e0a27a"); ell(c, 388, 85, 8, 4, "#f2e07a");
  txtC(c, "SATURDAYS", 388, 64, "#17101e", 1, 1); txtC(c, "BRANDON", 388, 110, "#17101e", 1, 1); txtC(c, "SHINE", 388, 117, "#17101e", 1, 1); txtC(c, "ALL NIGHT", 388, 124, "#7a4a10", 1, 1);
  P(c, 365, 60, "#fff6c0"); P(c, 411, 129, "#fff6c0");
  // marquee lightbox, left of the door (above the heads of the line)
  R(c, 190, 70, 80, 50, "#0c0812"); R(c, 191, 71, 78, 48, "#1e1a2a"); R(c, 192, 72, 76, 46, "#2a2438");
  txtC(c, "THURSDAYS", 230, 76, "#ff3fa4", 1, 1); txtC(c, A3.billed(S).slice(0, 17), 230, 84, "#fff6dc", 1, 1);
  R(c, 196, 92, 68, 1, "#5a4a7a");
  txtC(c, "SATURDAYS", 230, 96, "#39d0ff", 1, 1); txtC(c, "DJ BRANDON SHINE", 230, 104, "#fff6dc", 1, 1); txtC(c, "NO SNEAKERS", 230, 111, "#ffd23f", 1, 1);
  R(c, 192, 72, 76, 1, "#6a5a8a"); R(c, 192, 117, 76, 1, "#0c0812");
  em.push([192, 72, 76, 46]);
  // main door: black steel, under a canopy
  PK.door(c, 292, 62, 52, 110, { metal: true, color: "#2a2834", seed: 414 });
  R(c, 292, 60, 52, 3, "#17101e"); R(c, 290, 60, 56, 1, "#6a5a8a");
  PK.awning(c, 278, 40, 80, { colors: ["#17131f", "#3a2a58"], h: 24, stripe: 8, seed: 415 });
  // neon: HALCYON / ROOM / thin tube border
  PK.neon(c, "HALCYON", 214, 8, "#ff3fa4", { scale: 4, tube: 3, glow: true, strength: night ? 1.1 : 0.4, off: night ? [] : [0, 1, 2, 3, 4, 5, 6] }).forEach(r => night && em.push(r));
  PK.neon(c, "ROOM", 296, 32, "#39d0ff", { scale: 2, tube: 2, glow: true, strength: night ? 1 : 0.3, off: night ? [] : [0, 1, 2, 3] }).forEach(r => night && em.push(r));
  PK.neonLine(c, [[287, 172], [287, 60], [349, 60], [349, 172]], 0, 0, "#39d0ff", { tube: 1, glowR: 7, strength: night ? 0.9 : 0.2 }).forEach(r => night && em.push(r));
  // a small red lamp over the door
  R(c, 313, 56, 6, 3, "#c0302c"); if (night) { em.push([313, 56, 6, 3]); PK.glow(c, 316, 58, 14, "#ff4a4a", { strength: 0.7 }).forEach(r => em.push(r)); }
  /* ---- right: loading bay + brick ---- */
  PK.brick(c, 480, 28, 160, 146, { base: "#5a3a4a", worn: 0.5, seed: 416 });
  R(c, 480, 24, 160, 5, "#3a2430"); R(c, 480, 24, 160, 1, "#7a5a6a");
  R(c, 494, 52, 100, 120, "#22182c"); R(c, 496, 54, 96, 116, "#2e2238");                                                // roll-up shutter
  for (let y = 56; y < 168; y += 4) { R(c, 496, y, 96, 1, "#1a1222"); R(c, 496, y + 1, 96, 1, "#3a2c48"); }
  PK.speckle(c, 496, 54, 96, 116, ["#4a3a5a", "#1a1222"], 0.04, 417);
  // graffiti on the shutter (a3 tag)
  txt(c, "SHINE", 520, 70, "#ffd23f", 2, 1); R(c, 520, 82, 40, 2, "#ffd23f"); txt(c, "WAS HERE", 524, 88, "#ff3fa4", 1, 1);
  txt(c, "SUCKS", 522, 96, "#39d0ff", 1, 1);
  em.push.apply(em, PK.window(c, 604, 40, 28, 40, { view: "interior", lit: true, time: m, frame: "#d8d0e6", curtain: "#5a8ad8", seed: 418 }));
  /* ---- sidewalk + street ---- */
  PK.sidewalk(c, 0, 172, W, 66, { base: "#8c88a0", curbY: 226, gum: 14, seed: 420 });
  PK.asphalt(c, 0, 238, W, 18, { base: "#363244", lines: "dashedY", seed: 421 });
  // wet pink reflections of the sign on the pavement
  PK.util.dshade(c, 200, 176, 150, 52, "#ff3fa4", (px, py) => (night ? 0.55 : 0) * Math.max(0, 1 - (py - 176) / 52) * (0.5 + 0.5 * Math.sin(px * 0.3)), 0.26);
  PK.util.dshade(c, 14, 176, 100, 50, "#ffd890", (px, py) => 0.4 * Math.max(0, 1 - (py - 176) / 50), 0.22);
  // streetlamp at the curb (static, behind the walkers)
  em.push.apply(em, PK.streetlamp(c, 470, 226, { h: 118, on: night, arm: 22, seed: 422 }));
  em.push.apply(em, PK.subwayStairs(c, 2, 168, {}));
  PK.hydrant(c, 150, 196, {}); PK.trashBags(c, 418, 188, {});
  PK.manhole(c, 232, 240, { w: 36, h: 10, steam: night ? 60 : 0, seed: 423 });
  return em;
}

/* van sprite (cached) */
const vanSprite = A3.sprite("a3_van", 170, 100, c => {
  const body = "#d8d0c0", kb = ramp(body), glass = "#2a3a5a";
  const x = 6, y = 8, w = 152, h = 72;
  R(c, x, y + 8, w, h - 8, body);
  U.poly(c, [[x, y + 8], [x + 8, y], [x + w - 46, y], [x + w - 34, y + 8]], kb[3]);
  R(c, x + w - 34, y + 8, 34, h - 8, body);
  U.poly(c, [[x + w - 46, y], [x + w - 12, y + 14], [x + w, y + 30], [x + w, y + 8], [x + w - 34, y + 8]], kb[3]);
  for (let yy = y + 8; yy < y + 40; yy++) R(c, x, yy, w, 1, U.mix(body, "#ffffff", 0.12 * (1 - (yy - y - 8) / 32)));
  R(c, x, y + h - 14, w, 14, kb[1]); R(c, x, y + h - 14, w, 1, kb[3]); R(c, x, y + h - 2, w, 2, "#2a2230");
  R(c, x, y + 42, w, 5, "#7a3a2a"); R(c, x, y + 42, w, 1, "#c0603a"); R(c, x, y + 46, w, 1, "#3a1a10");
  // cab window
  R(c, x + w - 42, y + 14, 34, 24, "#0c1220"); R(c, x + w - 41, y + 15, 32, 22, glass);
  for (let i = 0; i < 20; i++) R(c, x + w - 41 + i, y + 15 + (i % 3), 1, 20, i % 5 === 0 ? "#5a7aa8" : glass);
  R(c, x + w - 4, y + 36, 6, 4, "#ffe9a0"); R(c, x + w - 4, y + 36, 6, 1, "#ffffff");              // headlight
  R(c, x + w + 1, y + h - 8, 5, 8, "#8a8698");                                                          // bumper
  // side door open: warm cargo
  R(c, x + 18, y + 12, 78, 56, "#0c0812"); R(c, x + 19, y + 13, 76, 54, "#3a2a1c");
  for (let yy = 0; yy < 54; yy++) R(c, x + 19, y + 13 + yy, 76, 1, U.mix("#7a5a30", "#2a1c10", yy / 54));
  R(c, x + 19, y + 33, 76, 2, "#5a4a3a"); R(c, x + 19, y + 52, 76, 2, "#5a4a3a");
  // speakers, CDJ boxes, a turntable, a crate of cables
  [[24, 14, 16, 19], [42, 18, 14, 15], [58, 14, 18, 19]].forEach(([sx, sy, sw, sh_]) => { R(c, x + sx, y + sy, sw, sh_, "#1c1a24"); R(c, x + sx, y + sy, sw, 1, "#4a4658"); ell(c, x + sx + sw / 2, y + sy + sh_ / 2 + 2, Math.floor(sw / 3), Math.floor(sw / 3), "#34303f"); ell(c, x + sx + sw / 2, y + sy + sh_ / 2 + 2, 1, 1, "#0a0810"); });
  R(c, x + 78, y + 15, 15, 18, "#c8925a"); R(c, x + 78, y + 15, 15, 2, "#e0b078"); txt(c, "CDJ", x + 80, y + 22, "#7a4a2a");
  R(c, x + 24, y + 38, 22, 12, "#2e2c38"); R(c, x + 24, y + 38, 22, 1, "#6a667c"); ell(c, x + 33, y + 44, 6, 3, "#14121a");
  R(c, x + 50, y + 38, 18, 13, "#c8925a"); R(c, x + 50, y + 38, 18, 2, "#e0b078"); txt(c, "XLR", x + 52, y + 44, "#7a4a2a");
  R(c, x + 72, y + 37, 22, 14, "#c0302c"); R(c, x + 72, y + 37, 22, 1, "#ff8a7a"); for (let i = 0; i < 6; i++) R(c, x + 74 + i * 3, y + 41, 2, 7, "#1d1622");
  R(c, x + 18, y + 12, 4, 56, "#b0a898"); R(c, x + 92, y + 12, 4, 56, "#b0a898");
  // lettering
  txt(c, "EDDIE", x + 100, y + 20, "#7a2a1a", 2, 1); txt(c, "TWO-TIMES", x + 98, y + 34, "#7a2a1a", 1, 1);
  txt(c, "GEAR / 2X DEALS", x + 98, y + 52, "#3a2a2a", 1, 1);
  R(c, x + 98, y + 29, 26, 1, "#7a2a1a");
  // wheels
  [x + 32, x + 116].forEach(wx => { ell(c, wx, y + h + 1, 13, 13, "#17131f"); ell(c, wx, y + h + 1, 10, 10, "#2a2634"); ell(c, wx, y + h + 1, 5, 5, "#8a86a0"); ell(c, wx - 1, y + h, 2, 2, "#c8c4d8"); R(c, wx - 13, y + h - 11, 26, 2, "#a09888"); });
  R(c, x + 2, y + 52, 6, 3, "#c0302c");
});

const rope = A3.sprite("a3_rope", 70, 40, c => {
  [[6], [58]].forEach(([sx]) => { R(c, sx, 12, 3, 22, "#c8a860"); R(c, sx - 3, 32, 9, 3, "#8a7440"); ell(c, sx + 1, 11, 3, 3, "#f0d890"); P(c, sx, 10, "#ffffff"); });
  for (let i = 0; i <= 52; i++) { const sag = Math.round(Math.sin(i / 52 * Math.PI) * 6); R(c, 8 + i, 14 + sag, 1, 3, "#8a1c2a"); P(c, 8 + i, 14 + sag, "#e03a4a"); }
});
const flowers = A3.sprite("a3_flowers", 56, 40, c => {
  [[2, "#e0368f"], [20, "#ffd23f"], [38, "#efeaf8"]].forEach(([fx, col], i) => {
    R(c, fx, 24, 15, 14, "#3a6a8a"); R(c, fx, 24, 15, 1, "#6a9aba"); R(c, fx, 37, 15, 1, "#1a3a4a");
    for (let k = 0; k < 9; k++) { const px = fx + 1 + (k * 5) % 13, py = 10 + (k * 7) % 12; R(c, px, py, 1, 14, "#3a8a3a"); ell(c, px, py, 2, 2, col); P(c, px - 1, py - 1, U.mix(col, "#ffffff", 0.5)); }
  });
});
const cat = A3.sprite("a3_cat", 24, 14, c => { ell(c, 12, 9, 9, 4, "#e0a050"); ell(c, 5, 6, 4, 3, "#e0a050"); R(c, 3, 2, 2, 2, "#e0a050"); R(c, 7, 2, 2, 2, "#e0a050"); P(c, 4, 6, "#1d1622"); P(c, 7, 6, "#1d1622"); for (let i = 0; i < 5; i++) R(c, 8 + i * 2, 6 + (i % 2), 1, 3, "#c07830"); R(c, 18, 11, 6, 2, "#e0a050"); });

/* ------------------------------------------------------------------ light */
function light(S) {
  if (mood(S) === "dusk") return { ambient: "#9a7a98", lights: [{ x: 300, y: 60, r: 340, color: "#ffb078", steps: 4, sy: 0.9 }, { x: 70, y: 130, r: 150, color: "#ffd890", steps: 3, power: 0.8 }],
    key: { x: 140, y: 40 }, rims: [{ x: 120, y: 60, r: 400, color: "#ff9a5a" }], shadow: 0.5 };
  return { ambient: "#2c2050",
    lights: [{ x: 262, y: 22, r: 260, color: "#ff3fa4", steps: 5, sy: 1.1, rim: true }, { x: 320, y: 90, r: 130, color: "#39d0ff", steps: 3, power: 0.8 }, { x: 60, y: 130, r: 170, color: "#ffd890", steps: 4 },
      { x: 482, y: 60, r: 220, color: "#ffb04a", steps: 5, sy: 1.1 }, { x: 230, y: 130, r: 90, color: "#ffe2c0", steps: 3, power: 0.7 }, { x: 560, y: 150, r: 130, color: "#ffd890", steps: 3, power: 0.75 }],
    halos: [{ x: 482, y: 56, r: 30, color: "#ffb060", strength: 0.9 }, { x: 70, y: 150, r: 38, color: "#ffd890", strength: 0.6 }],
    rims: [{ x: 262, y: 70, r: 300, color: "#ff3fa4" }, { x: 482, y: 70, r: 180, color: "#ffb04a" }], shadow: 0.62 };
}

/* ------------------------------------------------------------------ scripts */
async function buySnack(S) {
  await RP.say("Hey. Just a snack.", "kid");
  await RP.say("Dollar menu. Two dollars. Inflation is for rich people.", "a3_clerk");
  const opts = ["Salt & vinegar chips ($2)", "Pork rinds ($2)", "A pickle, in a bag ($2)", "Never mind"];
  const i = await RP.choose(opts);
  const buy = async (id, line) => {
    if (RP.has(id)) { await RP.say("I already have one. Two would be showing off."); return; }
    if (!RP.canAfford(2)) { await RP.say("I have... " + U.fmtMoney(S.money) + ". It's the 'no' kind of money."); return; }
    RP.money(-2); RP.give(id); await RP.say(line);
  };
  if (i === 0) await buy("a3_chips", "Salt & vinegar. The color of a bruise. Gus will love them.");
  else if (i === 1) await buy("a3_rinds", "Pork rinds. I'm not sure what my plan is, but they look confident.");
  else if (i === 2) await buy("a3_pickle", "A pickle in a bag with a splash of brine. This is how you eat in the city.");
}

async function useEddie(S) {
  if (S.f.a3_cdj) { await RP.lines(["@a3_eddie Everything good with the " + (S.gear.decks === "pioneer_cdj_900" ? "900s" : "decks") + "? A two-time deal never breaks. It breaks twice.", "@a3_eddie Come back if you need speaker cable. I have cable. Cable I have."]); return; }
  if (!S.f.a3_eddieMet) {
    S.f.a3_eddieMet = true;
    await RP.lines(["@a3_eddie Hey, hey, the DJ with the residency! I heard. Everybody heard. I told them.",
      "@a3_eddie Two-time deal on a pair of CDJ-900s. Used. Barely. Previous owner: a wedding DJ.", "@a3_eddie Which is a good thing. They were only turned on twice."]);
  }
  if (!S.f.a3_opener) { await RP.lines(["@a3_eddie Come back when you've been paid. I know your type. The 'next week' type.", "I do know the type. I AM the type."]); return; }
  if (S.money < 120) { await RP.lines(["@a3_eddie Come back with a hundred and twenty. I'm not a charity, kid. I'm a van."]); return; }
  const i = await RP.choose(["Show me the CDJ-900s", "Haggle first", "Later"]);
  if (i === 2) return;
  if (i === 1) { await RP.lines(["What if I told you I'm a loyal customer?", "@a3_eddie A loyal customer is a customer who comes back. Hi. Let's do the deal."]); }
  await RP.say("Okay. Don't touch the one with the sticker. That's a different deal.", "a3_eddie");
  const res = await A3.mg("buyGear", { slot: "decks", options: ["pioneer_cdj_900", "gemini_cdj_700", "pioneer_cdj_400"], flaws: ["ok", "cosmetic", "wobble"], asks: { pioneer_cdj_900: 280 }, seller: "Eddie Two-Times", budget: Math.min(S.money, 260), scams: 1, difficulty: 2 },
    { giveUp: "Not today", onFail: async () => { await RP.lines(["@a3_eddie You were about to buy the one with the wobble. I saved you from yourself. Same price.", "@a3_eddie ...Okay, I charge for that. Try again."]); },
      assist: async () => { await RP.say("It's a good pair, kid. I'd tell you if it wasn't. I would. Probably.", "a3_eddie"); } });
  if (res.giveUp) return;
  const paid = Math.min(S.money, Math.max(60, Math.round(res.paid != null ? res.paid : 180)));
  RP.money(-paid);
  const gid = res.bought && RP.gearInfo(res.bought) ? res.bought : "pioneer_cdj_900"; // auto() / walkthrough / assisted results may omit it: the 900s
  RP.setGear("decks", gid);
  S.f.a3_cdj = true; RP.relight();
  if (gid === "pioneer_cdj_900") await RP.lines(["@a3_eddie Pioneer CDJ-900s. 2009, same press release as the CDJ-2000. They play USBs. They link. They're yours.", "@a3_eddie A two-time deal. I take the money, you take the decks. Twice if you count the handshake.", "Eddie hands me the decks. They're heavy and smell like a wedding. I love them."]);
  else { const g = RP.gearInfo(gid); await RP.lines(["@a3_eddie The " + g.brand + " " + g.model + "s? Not the 900s. Your call, kid. A two-time deal is a two-time deal.", "Eddie hands me the decks. They play. That's the whole review."]); }
  if (!S.f.a3_dj350) await RP.say("Gear: decks done. Still need a mixer that doesn't smell like vodka.");
}

async function twinkie3(S) {
  S.f.a3_twinkie3 = true;
  await RP.lines(["@a3_twinkie Look who it is. The Thursday kid. Hair's different. Same eyes. Tired.",
    "Hey, Twinkie. Know anything I should know?", "@a3_twinkie I know everything. It's the cost of not sleeping.",
    "@a3_twinkie Brandon was at the bodega at four. Bought a blue USB. Took the label off in the shop.", "@a3_twinkie Same shade as yours, honey. I notice shades. It's a gift. And a curse. Mostly a curse.",
    "That is... a lot of detail for a USB."]);
}

async function enterClub(S) {
  const hd = RP.curRoom().def.hotspots.find(h => h.id === "a3_club_door");
  const go = async () => { RP.sfx("doorBuzz"); await RP.goto("a3_halcyon", 60, 234, "right"); };
  const night = mood(S) === "night";
  if (!night) { await RP.say("The door's propped open with a bucket of mop water. The universal sign of 'come in, we're closed.'"); await go(); return; }
  if (S.f.a3_thu3 && !S.f.a3_night3in) {
    await RP.walkTo(330, 222, "left");
    if (!RP.has("a3_bag")) { await RP.lines(["@a3_tiny Where's the bag?", "I'm a DJ. The bag's... somewhere. Next to the other bag.", "@a3_tiny No bag, no booth. Go get the bag."]); return; }
    await RP.lines(["@a3_tiny Anniversary night. Odessa said to expect you. And to NOT expect Brandon. He's already in. Don't ask.",
      "@a3_marcus ANNIVERSARY!! Tiny! Big guy! It's me! Plus three!", "@a3_tiny ...Plus three.", "@a3_marcus Plus three. Tiny, meet my friends. This is Dee, Rico, and the guy from the cab.",
      "@a3_tiny I have a list. You are not on it. You are four of them.", "@a3_marcus It's a long story. The guy from the cab is a DJ.",
      "I'm sorry, Tiny. He's my best friend. He's also never been on a list.", "@a3_tiny ...Go in. All four. Don't touch anything."]);
    S.f.a3_night3in = true; S.f.a3_marcus3 = true;
    await go(); return;
  }
  if (!S.f.a3_tinyMet) {
    S.f.a3_tinyMet = true;
    await RP.walkTo(330, 222, "left");
    if (!RP.has("a3_bag")) { await RP.lines(["@a3_tiny Name?", "I'm the DJ.", "@a3_tiny You look like a customer. DJs have bags. You've got a phone.", "Fair. Bag."]); S.f.a3_tinyMet = false; return; }
    await RP.lines(["@a3_tiny Name?", "I'm the DJ. Thursdays.", "@a3_tiny That's what everybody says. Name.", "@a3_tiny ...Let me check the list. Billed as: " + A3.billed(S) + ".",
      "That's me. Different spelling.", "@a3_tiny Every DJ says that. Go in. Odessa's by the bar. Snack for Gus?", "Yes. Absolutely. I have a snack.", "@a3_tiny You don't. Go in anyway."]);
    await go(); return;
  }
  if (!RP.has("a3_bag") && !S.f.a3_opener) { await RP.walkTo(330, 222, "left"); await RP.say("Bag.", "a3_tiny"); return; }
  await RP.walkTo(330, 222, "left");
  await RP.say(S.f.a3_opener ? "Go in. Odessa's looking for you." : "Odessa's waiting. Go in.", "a3_tiny");
  await go();
}

/* ------------------------------------------------------------------ room */
RP.room({
  id: "a3_street", act: 3, name: "Ludlow Street",
  paint, light,
  cacheKey: S => mood(S) + "|" + S.name,
  lightKey: S => mood(S),
  ambience: "street",
  music: null,
  walk: [[8, 214], [632, 214], [632, 238], [8, 238]],
  start: { x: 70, y: 232, face: "right" },
  fx: [
    { type: "cars", y: 246, dir: 1, period: 6400, color: "#ffe9a0" },
    { type: "cars", y: 250, dir: -1, period: 9100, color: "#ff8a8a" },
    { type: "steam", x: 250, y: 242, rise: 60, size: 16, drift: 10, color: "#d8d4e8", count: 8, on: () => mood(RP.state) === "night" },
    { type: "blink", items: [{ r: [114, 109, 18, 5], color: "#ff4a4a", rate: 700, flicker: true }] }
  ],
  sprites: [
    { y: 220, draw: c => vanSprite(c, 476, 126) },
    { y: 216, vis: S => mood(S) === "night", draw: c => rope(c, 284, 188) },
    { y: 174, draw: c => flowers(c, 80, 140) },
    { y: 136, draw: c => cat(c, 22, 122) }
  ],
  actors: S => {
    const night = mood(S) === "night";
    const list = [
      { id: "a3_tiny", char: "a3_tiny", x: 372, y: 226, face: "left", act: "stand", name: "Tiny", vis: S2 => mood(S2) === "night" },
      { id: "a3_eddie", char: "eddie", x: 560, y: 228, face: "left", act: "stand", name: "Eddie Two-Times" },
      { id: "a3_twinkie", char: "twinkie", x: 150, y: 224, face: "right", act: "stand", name: "Twinkie", vis: S2 => S2.f.a3_thu3 && !S2.f.a3_night3in },
      { id: "a3_marcus", char: "marcus", x: 232, y: 218, face: "right", act: "stand", name: "Marcus", vis: S2 => S2.f.a3_thu3 && !S2.f.a3_night3in },
      { crowd: { n: 6, rect: [176, 206, 108, 8], seed: 31, face: "right", act: "stand", scale: 0.92, vis: S2 => mood(S2) === "night" } },
      { crowd: { n: 3, rect: [330, 206, 40, 6], seed: 32, face: "left", act: "stand", scale: 0.9, vis: S2 => mood(S2) === "night" && S2.f.a3_thu3 } }
    ];
    return list;
  },
  enter: async (S, from) => {
    if (S.f.a3_arrived !== true && !S.f.a3_opener) {
      S.f.a3_arrived = true; RP.setClock("THU 8:52 PM");
      await RP.lines(["The Halcyon Room. Ludlow Street, 8:52 PM. The line's already forming, and it's mostly people who think a DJ's name on a door means free drinks.", "Odessa says be early. Gus says bring a snack. Tiny says nothing, which is scarier."]);
    }
    if (S.f.a3_thu3 && !S.f.a3_arr3) {
      S.f.a3_arr3 = true; RP.setClock("THU 9:10 PM");
      await RP.lines(["@nar Anniversary night.", "The line goes around the corner. That's a thing I get to say now: 'the line goes around the corner.'"]);
    }
  },
  hotspots: [
    { id: "a3_club_door", name: "Halcyon Room door", r: [290, 60, 56, 114], z: 20, walk: [320, 224, "back"],
      look: S => mood(S) === "night" ? "A black steel door under a canopy. The sign says HALCYON. The sound says 'come in, if you can.'" : "A black steel door, propped open with a mop bucket. Even rock stars clean up.",
      walkTo: S => enterClub(S), use: S => enterClub(S), open: S => enterClub(S),
      push: S => enterClub(S), pull: S => enterClub(S), talk: "Door, you're a good door. Open up?" },
    { id: "a3_sign", name: "neon sign", r: [212, 6, 112, 38], z: 18, walk: [262, 222, "back"],
      look: S => mood(S) === "night" ? "HALCYON, in pink tubes. Halcyon means calm, peaceful, happy. The line outside does NOT feel that." : "The sign is off. It looks like a dead pink spider.",
      use: "I'd need a ladder. And a permit. And a death wish.", pickup: "It's bolted to a very expensive wall." },
    { id: "a3_marquee", name: "marquee", r: [190, 70, 80, 50], z: 19, walk: [230, 222, "back"],
      look: S => ["THURSDAYS: " + A3.billed(S) + ". That's me, if you squint, and I'm squinting.", "SATURDAYS: DJ BRANDON SHINE. NO SNEAKERS. That one's personal."], pickup: "It's bolted to the wall. Unlike my ambitions." },
    { id: "a3_brandonposter", name: "Brandon's poster", r: [360, 56, 56, 76], z: 21, walk: [388, 222, "back"],
      look: "SATURDAYS: BRANDON SHINE. ALL NIGHT. A poster with a lot of gold and zero humility. Sunglasses at night, on paper.", pickup: "I could take it. I could also not start a war with a poster.", use: "I'd draw a mustache on it, but that's what they WANT." },
    { id: "a3_flyers", name: "flyers", rects: [[170, 128, 20, 28], [426, 76, 28, 38], [450, 102, 26, 34], [406, 116, 22, 30]], z: 17, walk: [200, 222, "back"],
      look: "Wheat-pasted flyers three layers deep. A graveyard of Thursdays. One says 'SOUL CLAP' and one says 'HOUSE' and none of them say my name correctly.", pickup: "They've bonded to the wall. They live here now." },
    { id: "a3_bodega", name: "Sunrise Deli", rects: [[6, 104, 154, 70]], z: 12, walk: [90, 226, "back"],
      look: "Sunrise Deli & Grocery. Open 24 hours, one cat, zero judgment. Bodega: where you buy a lottery ticket, a sandwich, and a replacement for your will to live.",
      use: S => buySnack(S), talk: S => buySnack(S), open: S => buySnack(S), pickup: S => buySnack(S) },
    { id: "a3_cat", name: "bodega cat", r: [18, 118, 28, 22], z: 30, walk: [40, 226, "back"],
      look: "The bodega cat. Asleep on the shop crates like he's paying rent. He's the only resident on this street with a lease.", talk: "Pssst. Hey, boss. What's the good stuff? ...He's asleep.", pickup: "He bites. Everyone knows this. His name is Tuesday." },
    { id: "a3_bodega_window", name: "Lotto sign", r: [24, 106, 40, 12], z: 31, walk: [60, 226, "back"], look: "LOTTO. The most hopeful and least efficient business plan in New York." },
    { id: "a3_stairs", name: "subway stairs", r: [0, 168, 70, 52], z: 5, floor: true, walk: [38, 216, "back"],
      look: "The F train, a 4 AM friend and a 4 AM enemy. I know this staircase very well.",
      exit: S => S.f.noTravel ? "I'm in the middle of a night. The subway can wait." : "travel" },
    { id: "a3_van", name: "Eddie's van", r: [476, 124, 158, 98], z: 14, walk: [520, 230, "back"],
      look: "EDDIE TWO-TIMES — GEAR / 2X DEALS. A van with the side door open like a mouth with a sales pitch. I see CDJ boxes. I see speakers. I see a lot of cables with opinions.",
      use: S => useEddie(S), open: S => useEddie(S), pickup: "It's his van. His whole life is in there. Don't touch." },
    { id: "a3_eddie", name: "Eddie Two-Times", z: 80,
      look: "Eddie Two-Times. Gear dealer, van owner, philosophy: if it's good, say it twice.",
      talk: S => useEddie(S), give: async (S, item) => { if (item === "a3_chips") return "@a3_eddie Chips? I'm a man of the people. But no. Cash."; return "@a3_eddie A trade? A two-time deal? No. Cash."; } },
    { id: "a3_tiny", name: "Tiny", z: 80,
      look: "Tiny. Six-foot-six, black bomber, a smile like a locked door. The sign above him says HALCYON. The sign above his head says DO NOT.",
      talk: S => S.f.a3_opener ? RP.lines(["Hey, Tiny.", "@a3_tiny You're on the list. Go in. Stop talking to me."]) : RP.lines(["Hey, Tiny.", "@a3_tiny Name?", "Never mind, I'll just go in."]),
      give: "Tiny doesn't take gifts. He takes names." },
    { id: "a3_twinkie", name: "Twinkie", z: 80,
      look: "Twinkie. After-hours regular. Knows everyone, remembers everything, sleeps never. Today's boots: patent leather, killer.",
      talk: S => twinkie3(S) },
    { id: "a3_marcus", name: "Marcus", z: 80,
      look: "Marcus, my best friend. Currently standing in a line he is not in, with three people he's calling 'a vibe.'",
      talk: ["Marcus! You made it.", "@a3_marcus I'm on the list! Right? ...Right? Plus three?", "I'll talk to Tiny. Don't say anything. Please."] },
    { id: "a3_queue", name: "the line", r: [184, 198, 96, 20], z: 6,
      look: S => mood(S) === "night" ? "The line. A hundred people dressed to be seen and nobody over twenty-nine. I can say 'they're here for me' for exactly one second." : "No line. Just a pigeon staring at a French fry.", talk: "Hello, line. I'm the DJ. ...They don't care. It's the best part of the job." },
    { id: "a3_lamp", name: "streetlamp", r: [456, 108, 36, 120], z: 11, walk: [440, 226, "back"], look: "A sodium streetlamp. The orange glow makes everyone look like they're in a movie about a bad idea.", use: "I could climb it. I'm not going to climb it.", pickup: "It's not coming with me." },
    { id: "a3_manhole", name: "manhole", r: [232, 238, 36, 14], z: 6, floor: true, look: "A manhole cover breathing steam. New York exhales, and it smells like a subway sandwich." },
    { id: "a3_fire", name: "fire escape", r: [92, 28, 70, 100], z: 8, look: "A fire escape with a bicycle chained to it and a grill chained to it and, honestly, a lot of chains." }
  ],
  combos: [
    ["a3_chips", "a3_eddie", "@a3_eddie Chips? Cute. I only do cash. And handshakes."],
    ["a3_chips", "a3_tiny", "Tiny takes a chip, eats it in one bite and looks at me like I should apologize for the others."],
    ["a3_pickle", "a3_tiny", "Tiny eyes the pickle. Tiny is not a pickle guy. I don't think. I'm not asking."],
    ["a3_rinds", "a3_cat", "The cat sniffs the pork rinds. He turns his head. Even the bodega cat has standards."],
    ["a3_chips", "a3_cat", "The cat licks the salt. Then licks me. It's a business relationship."]
  ]
});
RP.voice("a3_clerk", { color: "#ffd27a", prefix: "CLERK: ", anchor: [90, 150] });
})();
