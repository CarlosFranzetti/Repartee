/* Act 1 — a1_breakroom: the Synergex break room. Linda's popcorn lives in the cupboard. Put it in the
   microwave, press POPCORN twice, and the world's most sensitive smoke detector evacuates the floor.
   Flags: a1_cupOpen, a1_corn (taken), a1_cornIn, a1_burnt, a1_alarm. */
(function () {
"use strict";
const RP = window.RP;
const A1 = RP.a1, PK = RP.PK;
const { R, P, ell, line, poly, bayer, mulberry, clamp, txt, txtW, txtC, mix, ramp } = RP.u;
const U = PK.util;
const W = 640, FY = 168;
const MW = { x: 296, y: 111 };                       /* microwave on the counter */

function outlineR(c, x, y, w, h, col) { R(c, x, y, w, 1, col); R(c, x, y + h - 1, w, 1, col); R(c, x, y, 1, h, col); R(c, x + w - 1, y, 1, h, col); }
function note(c, x, y, w, h, col, l1, l2) { R(c, x, y, w, h, col); R(c, x, y, w, 1, mix(col, "#fff", 0.5)); R(c, x + w - 1, y + 1, 1, h - 1, mix(col, "#000", 0.25)); P(c, x + w / 2, y - 1, "#c0302c"); if (l1) txt(c, l1, x + 2, y + 3, "#2a2a3a"); if (l2) txt(c, l2, x + 2, y + 9, "#2a2a3a"); }

function paintBreak(c, S) {
  const em = [], rnd = mulberry(52);
  /* walls */
  PK.plaster(c, 0, 0, W, FY, { base: "#b6cdbc", seed: 221, patches: 1, stains: 2, cracks: 1 });
  R(c, 0, 108, W, 60, "#7a9a86"); PK.plaster(c, 0, 108, W, 60, { base: "#7a9a86", seed: 222, patches: 0, stains: 0, cracks: 0 });
  R(c, 0, 106, W, 3, "#e8f0e8"); R(c, 0, 106, W, 1, "#fff");
  R(c, 0, 0, W, 20, "#a8aeb8"); for (let x = 0; x < W; x += 40) R(c, x, 0, 1, 20, "#8a8e9c"); R(c, 0, 10, W, 1, "#8a8e9c");
  [[60, 4], [220, 4], [380, 4], [520, 4]].forEach(([px, py]) => { R(c, px, py, 70, 10, "#e8f4ff"); R(c, px, py, 70, 1, "#fff"); em.push([px, py, 70, 10]); });
  R(c, 0, FY - 5, W, 5, "#3a4a42"); R(c, 0, FY - 5, W, 1, "#6a7a72");
  PK.tiles(c, 0, FY, W, 256 - FY, { a: "#c8c4b4", b: "#9a9684", checker: true, size: 28, horizonY: 100, vx: 320, grout: "#7a7664", seed: 223 });
  U.dshade(c, 0, FY, W, 80, "#3a2a18", (px, py) => 0.3, 0.15);
  /* door to the office (left) */
  R(c, 4, 54, 50, 114, "#3a3c4a"); R(c, 6, 58, 46, 110, "#7a8498"); U.gradient(c, 6, 58, 46, 110, [[0, "#a8b2c4"], [1, "#586074"]], 1, true);
  R(c, 12, 64, 34, 30, "#10141c"); R(c, 13, 65, 32, 28, "#8ab0d8"); U.gradient(c, 13, 65, 32, 28, [[0, "#c8e0f8"], [1, "#6a8ab8"]], 1, true); em.push([13, 65, 32, 28]);
  R(c, 10, 116, 38, 4, "#c8c4d8"); R(c, 10, 116, 38, 1, "#fff");
  R(c, 6, 40, 46, 12, "#e8e0cc"); outlineR(c, 6, 40, 46, 12, "#6a5a40"); txtC(c, "TO OFFICE", 29, 43, "#3a1c1c", 1);
  /* bulletin board */
  R(c, 66, 34, 84, 68, "#6a4a30"); R(c, 68, 36, 80, 64, "#c89a68");
  for (let i = 0; i < 200; i++) P(c, 69 + rnd() * 78 | 0, 37 + rnd() * 62 | 0, i % 2 ? "#b88a58" : "#d8aa78");
  note(c, 72, 40, 28, 20, "#ffe860", "WHO TOOK", "MY YOGURT"); note(c, 104, 44, 28, 14, "#ff9ac0", "NO FISH", "");
  note(c, 74, 66, 24, 14, "#efeaf6", "MICROWAVE", "IS NOT A"); note(c, 102, 64, 30, 16, "#9fe0ff", "CAKE IN B", "(GONE)");
  note(c, 86, 84, 40, 12, "#ffd890", "CLEAN UP!!", ""); note(c, 130, 84, 14, 14, "#c0f0c0", "LOST", "");
  /* upper cupboards */
  for (let i = 0; i < 6; i++) {
    const x = 160 + i * 53, open = i === 2 && !!S.f.a1_cupOpen;
    R(c, x, 34, 52, 58, "#8a6a4a"); R(c, x, 34, 52, 1, "#c8a070"); R(c, x, 91, 52, 1, "#3a2a1a"); R(c, x, 34, 1, 58, "#b8905e"); R(c, x + 51, 34, 1, 58, "#3a2a1a");
    if (open) {
      R(c, x + 3, 37, 46, 52, "#1a1210"); R(c, x + 4, 38, 44, 50, "#2a201a"); R(c, x + 4, 62, 44, 2, "#6a5a48"); R(c, x + 4, 84, 44, 2, "#6a5a48");
      for (let k = 0; k < 4; k++) { R(c, x + 6 + k * 9, 46, 7, 16, ["#d8c890", "#c8c4d8", "#e8e0cc", "#a8946a"][k]); }
      if (!S.f.a1_corn) { R(c, x + 8, 68, 20, 16, "#d83a3a"); R(c, x + 8, 68, 20, 2, "#ff8a7a"); R(c, x + 12, 72, 12, 8, "#ffd23f"); txt(c, "LINDA", x + 10, 74, "#c0302c"); }
      poly(c, [[x, 34], [x + 14, 38], [x + 14, 90], [x, 92]], "#a07a58"); R(c, x, 34, 1, 58, "#c8a070");
    } else { R(c, x + 4, 38, 44, 50, "#9a7a56"); R(c, x + 4, 38, 44, 1, "#b8905e"); R(c, x + 4, 87, 44, 1, "#5a3a20"); R(c, x + 22, 80, 8, 3, "#e0c870"); }
  }
  U.dshade(c, 160, 92, 318, 6, "#0c0618", (px, py) => 1 - (py - 92) / 6, 0.4);
  /* counter run + sink */
  PK.counter(c, 150, 128, 340, 40, { top: "#d8d0c0", front: "#6a7a8a", panelW: 56, seed: 224 });
  PK.sink(c, 410, 98, { w: 36 }); R(c, 408, 126, 40, 3, "#8a869c");
  /* coffee machine */
  R(c, 190, 100, 26, 28, "#2a2a34"); R(c, 190, 100, 26, 1, "#6a6a7a"); R(c, 194, 106, 14, 6, "#c0302c"); em.push([194, 106, 14, 3]);
  R(c, 194, 116, 16, 12, "#8ab0c8"); R(c, 194, 116, 16, 3, "#3a2418"); R(c, 196, 122, 12, 5, "#5a3a22"); R(c, 190, 126, 26, 2, "#5a5a6a");
  /* microwave */
  em.push.apply(em, PK.microwave(c, MW.x, MW.y, { on: false }));
  /* toaster + paper towels + yogurt */
  R(c, 346, 114, 16, 14, "#c8c4d4"); R(c, 346, 114, 16, 1, "#fff"); R(c, 348, 112, 12, 2, "#2a2a3a"); R(c, 346, 126, 16, 2, "#5a5a6a");
  R(c, 366, 106, 10, 22, "#efeaf6"); R(c, 366, 106, 10, 2, "#fff"); R(c, 364, 104, 14, 3, "#c8c4d4");
  R(c, 456, 118, 8, 10, "#e0d0f0"); R(c, 456, 118, 8, 2, "#fff"); txt(c, "L", 459, 122, "#c0302c");
  /* fridge */
  R(c, 496, 44, 54, 124, "#d8dce4"); U.gradient(c, 496, 44, 54, 124, [[0, "#f0f4fa"], [0.1, "#d8dce4"], [1, "#9aa0b0"]], 1, false);
  R(c, 496, 44, 54, 1, "#fff"); R(c, 496, 44, 1, 124, "#fff"); R(c, 549, 44, 1, 124, "#6a7080"); R(c, 496, 94, 54, 3, "#7a8094");
  R(c, 540, 56, 3, 30, "#8a90a4"); R(c, 540, 104, 3, 40, "#8a90a4");
  R(c, 504, 56, 22, 14, "#fff6c0"); txt(c, "DO NOT", 506, 59, "#c0302c"); txt(c, "STEAL", 506, 64, "#c0302c"); R(c, 520, 76, 8, 8, "#ff3fa4"); R(c, 506, 110, 10, 10, "#39d0ff"); R(c, 520, 120, 12, 8, "#ffd23f"); R(c, 504, 80, 12, 10, "#ff8a4c");
  U.dshade(c, 496, 160, 54, 8, "#000", () => 0.7, 0.4);
  /* vending machine */
  em.push.apply(em, PK.vendingMachine(c, 560, 98, { w: 44, h: 70, sign: "SNACKS", color: "#2a6aa8", seed: 225 }));
  /* smoke detector + wall clock + extinguisher */
  ell(c, 318, 22, 7, 3, "#efeaf6"); ell(c, 318, 21, 6, 2, "#fff"); P(c, 322, 22, "#3fd07a");
  PK.clock(c, 480, 38, { d: 18, hour: 11, min: 40, color: "#3a4a42" });
  R(c, 612, 80, 14, 34, "#7a1a1a"); R(c, 614, 84, 10, 26, "#c0302c"); R(c, 614, 84, 10, 2, "#ff8a7a"); R(c, 616, 78, 6, 4, "#1c1626"); txt(c, "FIRE", 610, 70, "#c0302c");
  /* wall decor */
  R(c, 160, 12, 18, 14, "#efeaf6"); outlineR(c, 160, 12, 18, 14, "#3a8ad8"); txt(c, "WASH", 162, 15, "#3a8ad8"); txt(c, "HANDS", 162, 20, "#3a8ad8");
  U.dshade(c, 0, FY - 14, W, 14, "#0c0618", (px, py) => (py - FY + 14) / 14, 0.3);
  return em;
}

function lightBreak(S) {
  const a = !!(S.f && S.f.a1_alarm);
  return {
    ambient: "#a4b0aa",
    lights: [
      { x: 95, y: 8, r: 220, color: "#e8f4ff", steps: 4, sy: 1.1 }, { x: 255, y: 8, r: 220, color: "#e8f4ff", steps: 4, sy: 1.1 },
      { x: 415, y: 8, r: 220, color: "#e8f4ff", steps: 4, sy: 1.1 }, { x: 555, y: 8, r: 200, color: "#e8f4ff", steps: 4, sy: 1.1 },
      { x: 309, y: 118, r: 90, color: "#ffb860", steps: 3, power: a ? 0.8 : 0.0 }
    ],
    key: { x: 320, y: 8 }, shadow: 0.5
  };
}

function drawBreak(c, S, t) {
  /* microwave guts: bag inside, orange light, puffing */
  const x = MW.x, y = MW.y;
  if (S.f.a1_cornIn) {
    R(c, x + 3, y + 3, 13, 8, S.f.a1_cooking ? "#ffe2a0" : "#1a1c24");
    const puff = S.f.a1_cooking ? Math.floor(t / 120) % 3 : 0;
    R(c, x + 5, y + 5 - puff, 9, 5 + puff, S.f.a1_burnt ? "#3a2418" : "#d83a3a"); R(c, x + 6, y + 6 - puff, 7, 1, S.f.a1_burnt ? "#6a4a30" : "#ffd23f");
    if (S.f.a1_cooking) { R(c, x + 3, y + 3, 13, 8, "#ffb030"); R(c, x + 5, y + 5 - puff, 9, 5 + puff, S.f.a1_burnt ? "#2a1408" : "#d83a3a"); }
  }
  if (S.f.a1_cooking) { P(c, x + 20, y + 3, Math.floor(t / 250) % 2 ? "#ff3a3a" : "#1a0a0a"); }
  /* smoke detector LED: green, or red-flashing in an alarm */
  P(c, 322, 22, S.f.a1_alarm ? (Math.floor(t / 250) % 2 ? "#ff3a3a" : "#5a1a1a") : (Math.floor(t / 1500) % 2 ? "#3fd07a" : "#1a3a2a"));
  if (S.f.a1_alarm) U.dshade(c, 0, 0, W, 256, "#ff2a2a", (px, py) => 0.4, Math.floor(t / 450) % 2 ? 0.08 : 0.0);
}

/* ---------- scenes ---------- */
async function putIn(S) {
  RP.take("a1_popcorn"); S.f.a1_cornIn = true; RP.sfx("click");
  await RP.lines(["I open the microwave. It smells like fish and old decisions. I put Linda's popcorn in, her name facing out.", "Sorry, Linda. I'll make it up to you. I won't."]);
}
async function cook(S) {
  if (S.f.a1_burnt) return "It's done. It's very, very done.";
  if (!S.f.a1_cornIn) {
    if (RP.has("a1_popcorn")) { await putIn(S); } else { await RP.say("An empty microwave. I could heat up my regrets, but I think those are best served cold."); return; }
  }
  await RP.say("The door closes with a thunk. The buttons: START, DEFROST, REHEAT, POPCORN.");
  const a = await RP.choose(["Press POPCORN", "Back away"]);
  if (a !== 0) { await RP.say("Not yet. I've got a little more evil in me."); return; }
  RP.sfx("microwave"); S.f.a1_cooking = true;
  await RP.wait(900);
  await RP.lines(["POPCORN. 2:30. The bag swells. Popping starts. It smells like a movie theater at its best.", "The bag said PRESS ONCE. Written in English, in bold, with an exclamation mark.", "...But Linda isn't here. And the bag isn't the boss of me."]);
  const b = await RP.choose(["Press POPCORN again", "Take it out. Be normal."]);
  if (b !== 0) { S.f.a1_cooking = false; S.f.a1_cornIn = false; RP.give("a1_popcorn"); RP.sfx("click"); await RP.say("I pull it out. Perfectly good popcorn. I'll keep it. Maybe I'm not ready for this level of crime."); return; }
  RP.sfx("microwave");
  await RP.lines(["I press POPCORN again. The display flickers: 5:00.", "The popping stops. A pause. A long, bad pause."]);
  await RP.wait(700);
  S.f.a1_burnt = true; RP.shake(400);
  await RP.lines(["The smell changes. Movie theater. Fire department. Chernobyl, in a bag.", "Black smoke curls out of the door seam. Whatever I just cooked is no longer food."]);
  S.f.a1_alarm = true; RP.setClock("WED 9:41 AM"); RP.relight();
  RP.sfx("alarm");
  await RP.lines(["@pa Attention. A fire event has been detected on floor fourteen.", "And there it is. The most sensitive smoke detector in Midtown, doing its life's work."]);
  await RP.say("Let's see who's still at their desks.");
  await RP.walkTo(76, 232, "left");
  await RP.goto("a1_synergex", 76, 238, "right");
}

async function cupboardOpen(S) {
  if (S.f.a1_cupOpen) return "It's open. A few noodle cups, a tin of tea from 2011, and... " + (S.f.a1_corn ? "an empty spot where Linda's popcorn was." : "a bag labeled LINDA'S POPCORN.");
  S.f.a1_cupOpen = true; RP.relight(); RP.sfx("click");
  await RP.lines(["Instant noodles, a tin of tea from 2011, and a Sharpie'd bag: LINDA'S POPCORN.", "Extra butter. The kind of popcorn that makes an office smell like a crime."]);
}
async function takeCorn(S) {
  if (S.f.a1_corn) return "I already have it. Linda's going to be devastated.";
  if (!S.f.a1_cupOpen) { S.f.a1_cupOpen = true; RP.relight(); RP.sfx("click"); }
  S.f.a1_corn = true; RP.give("a1_popcorn"); RP.relight();
  await RP.lines(["I take Linda's popcorn. It has her name on it in marker, which makes it worse.", "She counts them. Greg said. She's going to know."]);
}

RP.room({
  id: "a1_breakroom", act: 1, name: "Synergex break room",
  paint: paintBreak, draw: drawBreak, light: lightBreak,
  cacheKey: S => (S.f.a1_cupOpen ? "o" : "c") + (S.f.a1_corn ? "t" : ""), lightKey: S => (S.f.a1_alarm ? "a" : "n"),
  ambience: "office",
  walk: [[64, 208], [600, 208], [616, 250], [56, 250]],
  scale: [208, 0.96, 250, 1.04],
  start: { x: 76, y: 238, face: "right" },
  fx: [
    { type: "dust", rect: [60, 30, 500, 130], count: 12, color: "#f4fff4" },
    { type: "smoke", x: 309, y: 112, rise: 90, size: 22, drift: 10, color: "#4a4650", count: 14, speed: 0.6, on: () => RP.state.f.a1_burnt },
    { type: "smoke", x: 309, y: 110, rise: 60, size: 14, drift: -8, color: "#8a8690", count: 8, speed: 0.4, on: () => RP.state.f.a1_cooking && !RP.state.f.a1_burnt },
    { type: "strobe", period: 900, flash: 150, alpha: 0.12, color: "#ff2a2a", on: () => RP.state.f.a1_alarm }
  ],
  update: (dt, S, t) => A1.alarmTick(S, t),
  sprites: [
    { y: 232, draw: c => A1.blit(c, A1.memo("br_table", 84, 56, cc => { PK.table(cc, 4, 6, 76, 44, { round: true, color: "#8a6a4a", top: "#e0d8c8" }); }), 236, 190) },
    { y: 240, draw: c => A1.blit(c, A1.memo("br_chair1", 28, 46, cc => { PK.chair(cc, 2, 2, { kind: "wood", color: "#6a4a30" }); }), 214, 194) },
    { y: 240, draw: c => A1.blit(c, A1.memo("br_chair2", 28, 46, cc => { PK.chair(cc, 2, 2, { kind: "wood", color: "#6a4a30", flip: true }); }), 322, 194) },
    { y: 245, draw: c => A1.blit(c, A1.memo("br_trash", 24, 34, cc => { R(cc, 3, 8, 18, 24, "#4a5a6a"); R(cc, 3, 8, 18, 2, "#9aaaba"); R(cc, 3, 8, 1, 24, "#7a8a9a"); for (let i = 0; i < 4; i++) R(cc, 5, 13 + i * 5, 14, 1, "#2a3a4a"); R(cc, 8, 4, 8, 5, "#efeaf6"); R(cc, 12, 3, 5, 4, "#e8a830"); U.dshade(cc, 1, 31, 22, 3, "#000", () => 0.8, 0.4); }), 540, 214) }
  ],
  enter: async (S, from) => {
    S.f.noTravel = false;
    if (!S.f.a1_breakSeen) { S.f.a1_breakSeen = true; await RP.lines(["The break room. A fridge, a vending machine, a microwave and a smell. The smell is the real manager."]); }
  },
  leave: async (S, to) => { if (S.f.a1_alarm && to !== "a1_synergex") { S.f.a1_alarm = false; S.f.a1_lockBroken = true; S.f.a1_workersGone = false; S.f.a1_brendaGone = false; S.f.a1_evacStarted = false; RP.relight(); } },
  hotspots: [
    { id: "brDoor", name: "door to the office", r: [0, 36, 58, 134], z: 30, walk: [72, 228, "left"], look: "The door back to the office floor. On this side it says TO OFFICE, in case someone forgets which way is work.", exit: S => ({ room: "a1_synergex", x: 76, y: 238, face: "right" }) },
    { id: "microwave", name: "microwave", r: [292, 108, 34, 22], z: 40, walk: [310, 214, "back"],
      look: S => S.f.a1_burnt ? "The microwave. What's in it is no longer a bag. It's a memory." : S.f.a1_cornIn ? "The microwave, with Linda's bag inside. The button says POPCORN. The bag says ONCE. My heart says ZERO." : "A microwave. A pull-down door, a button panel, and a dozen layers of splattered chili. The button that says POPCORN is worn smooth.",
      use: S => cook(S), open: S => S.f.a1_cornIn ? "It's in there, waiting. All I have to do is press the buttons." : "The door pops open. It smells like fish and old decisions. Empty.", push: S => cook(S), pull: "It's got a pull-down door. I pull it. It's empty. I close it. We've both learned something.", pickup: "It's bolted to the counter. For the same reason everything in an office is bolted down: temps.", close: "It's already closed." },
    { id: "cupboard", name: "cupboards", r: [160, 34, 318, 58], z: 20, walk: [262, 214, "back"], look: S => S.f.a1_corn ? "The cupboards. One is open, with a Linda-shaped hole." : "A row of cupboards. One is covered in a label: LINDA. Nobody else dares open it.",
      open: S => cupboardOpen(S), pickup: S => takeCorn(S), use: S => cupboardOpen(S), pull: S => cupboardOpen(S), push: "I push. A cupboard thunks shut. Somewhere, a noodle cup rolls." },
    { id: "popbag", name: "Linda's popcorn", r: [268, 66, 34, 26], z: 44, vis: S => !!S.f.a1_cupOpen && !S.f.a1_corn, walk: [286, 214, "back"], look: "A bag of microwave popcorn, extra butter. LINDA, in Sharpie. I'm going to feel terrible about this. For a minute.", pickup: S => takeCorn(S), use: S => takeCorn(S) },
    { id: "fridge", name: "fridge", r: [494, 42, 58, 128], z: 20, walk: [520, 218, "back"], look: "The office fridge. Fourteen yogurts labeled LINDA, a wilted salad, and a pizza from the Obama administration. A note: DO NOT STEAL.", open: async S => { await RP.lines(["The fridge: 14 yogurts (LINDA), a salad of uncertain origin, hot sauce, and an \"emergency\" birthday cake with a bite out of it.", "The light inside is the only warm thing here. I close the door out of shame."]); }, pickup: "I'm not stealing someone's yogurt. I'm stealing someone's popcorn. There's a hierarchy.", push: "It's heavy. It's Linda's, mostly. The fridge hums a disapproving note." },
    { id: "coffee", name: "coffee machine", r: [188, 98, 30, 32], z: 24, walk: [204, 214, "back"], look: "A drip machine. The carafe holds a half-inch of coffee that has been warm since Monday. It's the only warm thing for a mile.", use: "I pour a cup. It's the color of a bad idea and the taste of one, too. I drink it. It works.", pickup: "That's a communal object. Taking it would start a war.", push: "I push the button. It gurgles. It's the sound of a tired building." },
    { id: "sink", name: "sink", r: [406, 96, 44, 36], z: 24, walk: [430, 214, "back"], look: "A sink full of mugs. A sponge older than my laptop. A note: \"YOUR MOTHER DOES NOT WORK HERE.\" Poor Linda.", use: "I wash my hands. A sign says to. I'm a good boy.", open: "The faucet's on the right. The handle's on the left. Or vice versa. It's an office.", pickup: "It's plumbing. I can't." },
    { id: "vending", name: "vending machine", r: [558, 96, 48, 74], z: 24, walk: [580, 224, "back"], look: "A vending machine. Chips, candy bars, peanut butter crackers. Everything's $1.25 or an ethical dilemma.", use: "I'd get something, but a dollar twenty-five is a fare in cans. Not today.", pickup: "It's bolted down. A different kind of lock. A machine that's honest.", push: "I shake it. A bag of chips shivers. Nothing falls. Nobody's ever won this fight.", open: "The door's locked. Only the bag boy has the key." },
    { id: "table", name: "break room table", r: [236, 190, 80, 56], z: 26, walk: [276, 248, "back"], look: "A round table where people eat lunch alone together. A ring on it where a mug used to be. Someone carved \"HELP\" into the bottom. It's a small \"HELP.\"", use: "I'd sit. But I'm a temp. Temps don't sit in a break room. They loiter in one.", pickup: "It's a table. It's seen things. It doesn't want to move.", push: "It scoots. It scoots back. We're even." },
    { id: "chairs", name: "chairs", rects: [[212, 192, 30, 50], [320, 192, 30, 50]], z: 26, walk: [276, 248, "back"], look: "Two chairs. One wobbles. The other one wobbles in the opposite direction. A study in compromise.", use: "I sit. I wobble. I'm a temp. I belong here.", pickup: "They weigh a thousand years of workplace regret." },
    { id: "board", name: "bulletin board", r: [64, 32, 88, 72], z: 14, walk: [108, 214, "back"], look: "WHO TOOK MY YOGURT. NO FISH. THE MICROWAVE IS NOT A STOVE. CAKE IN CONF RM B (GONE). The cutting edge of workplace literature.", pickup: "I'm not taking a note. They're all signed by someone with a grudge.", talk: "\"Dear board...\" No." },
    { id: "detector", name: "smoke detector", r: [308, 14, 22, 16], z: 24, walk: [318, 212, "back"], look: S => S.f.a1_alarm ? "The smoke detector, blinking red like the heart it never had." : "A smoke detector, blinking green on the ceiling. If Dev's right, it goes off at toast. It watches the room like a hall monitor.", use: "It's on the ceiling. I'd need a ladder, and an idea.", pull: "Out of reach. It's a ceiling thing. It's a god thing.", pickup: "Ceilings: 2. Me: 0.", push: "I'd have to be a giraffe." },
    { id: "clockB", name: "clock", r: [478, 36, 22, 22], z: 14, walk: [490, 214, "back"], look: "It says 11:40. It's 9:30. That clock has never been right, and its confidence is inspiring.", pickup: "It's time, and it's a wall thing." },
    { id: "extinguisher", name: "fire extinguisher", r: [608, 68, 22, 50], z: 24, walk: [606, 218, "back"], look: "A fire extinguisher, tag dated last year. Look at that: the only responsible thing in the building. And I'm over here with a bag of popcorn.", pickup: "I'm a lot of things. A fire-fighter is not one. I'd rather not hold the thing that stops the fire. That's the thing that will stop the plan.", use: "No. The whole point of this plan is the opposite of that.", pull: "No pin to pull. And no heart to put it out." },
    { id: "washSign", name: "wash hands sign", r: [158, 10, 22, 18], z: 14, walk: [170, 214, "back"], look: "WASH HANDS. A sign for a sink nobody checks and a rule nobody follows." },
    { id: "brTrash", name: "trash can", r: [538, 212, 28, 36], z: 24, walk: [526, 236, "right"], look: "A trash can overflowing with paper plates and an upside-down birthday cake. Someone's career is in there.", open: "It's a swing lid. It swings. I don't look.", pickup: "Absolutely not. I draw the line at office trash.", push: "It wobbles. A plate falls. I look away." }
  ],
  combos: [
    ["a1_popcorn", "microwave", () => putIn(RP.state)],
    ["a1_popcorn", "cupboard", "I could put it back in the cupboard. I could also not be a coward. Not today."],
    ["a1_popcorn", "fridge", "Popcorn in the fridge? Not even Linda does that."],
    ["a1_popcorn", "vending", "The vending machine already thinks I'm a thief. Let's not feed it popcorn."],
    ["a1_popcorn", "coffee", "No. The coffee has been through enough."],
    ["a1_slice", "microwave", "A slice in a Synergex microwave? It would taste like office. No. It's for Tank."],
    ["a1_slice", "fridge", "The fridge is full of food nobody eats. My slice has a future."],
    ["usb_cat", "microwave", "Electronics in a microwave. A physics lesson I don't need."],
    ["a1_usb", "microwave", "Electronics in a microwave. A physics lesson I don't need."]
  ]
});
})();
