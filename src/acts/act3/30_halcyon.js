/* Act 3 — The Halcyon Room: main floor. Bar (Nico and Bex, who are not speaking), the DJ stage, Gus's sound desk,
   the bathroom line, the staff door to Odessa's office, the way out to Ludlow Street.
   Open at night (Night 1, Night 3); closed in the afternoon during "the week" (work lights, no crowd).
   Scripts live in 35_nights.js (RP.A3.*). Flags: a3_week (night 1 is over), a3_thu3 (night 3), a3_floor ("full" crowd). */
(function () {
"use strict";
const RP = window.RP;
const A3 = RP.A3;
const U = RP.u;
const PK = RP.PK;
const { R, P, ell, txt, txtC, txtW, bayer, mulberry, ramp, mix } = U;
const W = 640;

const isOpen = S => !S.f.a3_week || !!S.f.a3_thu3;
const isFull = S => isOpen(S) && (S.f.a3_floor === "full" || !!S.f.a3_thu3);

/* ---------------------------------------------------------------- art */
// the booth up on the stage, painted once as a sprite so the DJ behind it is hidden from the waist down
const boothSprite = A3.sprite("a3_h_booth", 210, 70, c => PK.djBooth(c, 4, 4, 200, { gear: "cdj", mixer: "2ch", logo: "HALCYON", frontH: 22, tier: 3, seed: 501 }));
const barFront = A3.sprite("a3_h_barfront", 190, 56, c => { PK.bar(c, 4, -66, 180, 104, { stools: 0, seed: 502 }); });
const fohDesk = A3.sprite("a3_h_foh", 96, 40, c => {
  const em = [];
  R(c, 4, 20, 88, 4, "#3a3040"); R(c, 4, 20, 88, 1, "#6a5a78"); R(c, 6, 24, 84, 14, "#1c1624"); R(c, 6, 24, 84, 1, "#0c0812");
  R(c, 8, 26, 2, 12, "#3a3040"); R(c, 86, 26, 2, 12, "#3a3040");
  // console: lots of faders
  R(c, 8, 8, 52, 14, "#23202e"); R(c, 8, 8, 52, 1, "#4a4668"); R(c, 8, 21, 52, 1, "#0c0812");
  for (let i = 0; i < 12; i++) { R(c, 11 + i * 4, 11, 1, 8, "#0a0810"); R(c, 10 + i * 4, 14 + (i * 5) % 5, 3, 2, "#cfcbe0"); R(c, 11 + i * 4, 9, 1, 1, i % 3 ? "#3fd07a" : "#ff9a3f"); em.push([11 + i * 4, 9, 1, 1]); }
  R(c, 62, 8, 24, 12, "#1a2a3a"); R(c, 63, 9, 22, 10, "#0e2a3a"); R(c, 65, 11, 14, 1, "#39d0ff"); R(c, 65, 14, 18, 1, "#39a8ff"); R(c, 65, 16, 8, 1, "#ff9a3f"); em.push([63, 9, 22, 10]);
  // snack wrappers: the graveyard
  [[14, 18, "#3a8ad8"], [30, 19, "#e0802a"], [46, 18, "#c0302c"], [70, 21, "#ffd23f"], [78, 20, "#3a8ad8"]].forEach(([x, y, col]) => { R(c, x, y, 5, 2, col); P(c, x + 1, y - 1, col); });
  return em;
});

function paintBackWall(c, S, open, em) {
  PK.brick(c, 0, 0, W, 172, { base: "#3a2040", mortar: "#241a2c", worn: 0.35, bw: 16, bh: 7, seed: 510 });
  // black out the ceiling
  PK.util.dshade(c, 0, 0, W, 30, "#06020e", (px, py) => 1 - py / 30, 0.7);
  // ceiling pipes + ducts
  PK.pipe(c, 0, 12, 640, { dir: "h", r: 5, color: "#4a4658", joint: 70, seed: 511 });
  PK.pipe(c, 0, 24, 640, { dir: "h", r: 3, color: "#5a3a3a", joint: 90, seed: 512 });
}

function paint(c, S) {
  const open = isOpen(S), em = [];
  paintBackWall(c, S, open, em);
  /* ---- stage with LED wall ---- */
  PK.stage(c, 236, 100, 252, 72, { deck: "#2c2638", trim: true, steps: true, wedges: false, seed: 520 });
  em.push.apply(em, PK.ledWall(c, 258, 26, 208, 44, { pattern: "waves", palette: ["#ff3fa4", "#39d0ff", "#a05cff", "#ffd23f"], panel: 26, seed: 521 }));
  const truss = PK.truss(c, 236, 8, 252, 12, { color: "#8a889c", lights: 5, seed: 522 });
  em.push.apply(em, truss);
  if (open) (truss.lights || []).forEach(l => em.push.apply(em, PK.lightCone(c, l.x, l.y, 6, 46, 84, l.color, { alpha: 0.3 })));
  em.push.apply(em, boothSprite.em(258, 68)); em.push.apply(em, fohDesk.em(434, 184));
  // speaker stacks on both sides of the stage
  PK.speakerStack(c, 212, 64, 36, 108, { seed: 523 }); PK.speakerStack(c, 478, 64, 36, 108, { seed: 524 });
  em.push.apply(em, PK.discoBall(c, 362, 46, 11, { string: 16, seed: 525 }));
  /* ---- bar ---- */
  em.push.apply(em, PK.bar(c, 52, 66, 180, 104, { stools: 4, seed: 530 }));
  // the bar record player at the end of the counter
  R(c, 194, 128, 30, 9, "#6a3a2a"); R(c, 194, 128, 30, 1, "#a06a46"); R(c, 194, 136, 30, 1, "#2a1810"); ell(c, 206, 129, 10, 3, "#1a1822"); ell(c, 206, 129, 8, 2, "#2a2838"); ell(c, 206, 129, 2, 1, "#ff3fa4");
  R(c, 218, 121, 1, 8, "#c8c4d8"); R(c, 211, 121, 8, 1, "#c8c4d8"); R(c, 210, 122, 1, 5, "#c8c4d8");
  PK.neon(c, "BAR", 134, 44, "#ffc44d", { scale: 2, tube: 2, glow: true, strength: 1 }).forEach(r => em.push(r));
  /* ---- right wall: restrooms + staff door ---- */
  PK.door(c, 508, 62, 46, 108, { color: "#3a3048", panels: 2, number: "", knob: true, peephole: false, seed: 540 });
  R(c, 522, 74, 18, 10, "#e8e4f0"); txtC(c, "WC", 531, 77, "#17101e", 1, 1);
  PK.neon(c, "->", 516, 50, "#39d0ff", { scale: 2, tube: 2, glow: true, strength: 0.8 }).forEach(r => em.push(r));
  PK.door(c, 586, 62, 48, 108, { metal: true, color: "#4a4658", seed: 541 });
  R(c, 592, 72, 36, 12, "#c0302c"); R(c, 592, 72, 36, 1, "#ff8a7a"); txtC(c, "STAFF", 610, 74, "#ffffff", 1, 1); txtC(c, "ONLY", 610, 80, "#ffffff", 1, 1);
  PK.exitSign(c, 600, 44, {}).forEach(r => em.push(r));
  [[562, 70, 20, 28], [562, 106, 20, 26]].forEach(([x, y, w, h], i) => PK.poster(c, x, y, w, h, { palette: i ? "paper" : "neon", title: i ? "PIZZA" : "DISCO", lines: ["THU", ""], seed: 545 + i, tape: false }));
  /* ---- entrance (left) ---- */
  PK.door(c, 6, 62, 40, 108, { metal: true, color: "#2a2834", window: false, seed: 550 });
  PK.exitSign(c, 14, 44, {}).forEach(r => em.push(r));
  R(c, 2, 90, 4, 80, "#17101e");
  /* ---- floor ---- */
  PK.tiles(c, 0, 172, W, 84, { a: "#3a2a54", b: "#241838", checker: true, size: 44, horizonY: 96, grout: "#140c24", seed: 560 });
  // colored reflections on the dance floor
  if (open) {
    PK.util.dshade(c, 210, 176, 150, 80, "#ff3fa4", (px, py) => Math.max(0, 1 - Math.hypot((px - 280) / 90, (py - 214) / 34)) * 1.2, 0.4);
    PK.util.dshade(c, 360, 176, 160, 80, "#39d0ff", (px, py) => Math.max(0, 1 - Math.hypot((px - 440) / 90, (py - 212) / 34)) * 1.2, 0.4);
    PK.util.dshade(c, 30, 176, 150, 70, "#ffc44d", (px, py) => Math.max(0, 1 - Math.hypot((px - 110) / 80, (py - 190) / 26)) * 1.0, 0.3);
  } else {
    // closed: worklights, a mop-bucket, chairs on tables
    [[90, 4, 90], [300, 4, 90], [470, 4, 90]].forEach(([x, y, w]) => em.push.apply(em, PK.fluorescent(c, x, y, w, { on: true })));
    PK.pizzaBox(c, 410, 238, {});
  }
  // anniversary decor
  if (S.f.a3_thu3) {
    for (let x = 62; x < 226; x++) { const sag = Math.round(Math.sin((x - 62) / 164 * Math.PI) * 9); R(c, x, 36 + sag, 1, 2, "#4a3a60"); }
    ["6", "M", "O", "N", "T", "H", "S"].forEach((ch, i) => { const x = 74 + i * 22 + (i > 0 ? 10 : 0), sag = Math.round(Math.sin((x - 62) / 164 * Math.PI) * 9); R(c, x - 1, 38 + sag, 12, 15, i % 2 ? "#ff3fa4" : "#ffd23f"); R(c, x - 1, 38 + sag, 12, 1, "#ffffff"); txt(c, ch, x + 3, 42 + sag, "#17101e", 1, 1); });
    [[246, 100, "#ff3fa4"], [252, 108, "#39d0ff"], [240, 110, "#ffd23f"], [478, 100, "#ffd23f"], [484, 108, "#ff3fa4"], [472, 110, "#39d0ff"]].forEach(([x, y, col]) => { PK.util.ball(c, x, y, 5, col, {}); R(c, x, y + 5, 1, 30, "#c8c4d8"); });
  }
  return em;
}

/* ---------------------------------------------------------------- light */
function light(S) {
  if (!isOpen(S)) return { ambient: "#8a7a9c", lights: [{ x: 320, y: 10, r: 520, color: "#fff4e0", steps: 4, sy: 0.8 }, { x: 130, y: 90, r: 180, color: "#ffd890", steps: 3, power: 0.8 }],
    key: { x: 320, y: 0 }, shadow: 0.5, rims: [{ x: 330, y: 90, r: 360, color: "#9a90c8" }] };
  return { ambient: "#241640",
    lights: [{ x: 210, y: 40, r: 300, color: "#ff3fa4", steps: 5, sy: 1.1, rim: true }, { x: 520, y: 40, r: 280, color: "#39d0ff", steps: 5, sy: 1.1, rim: true }, { x: 362, y: 96, r: 150, color: "#ffe2c0", steps: 4, power: 0.8 },
      { x: 130, y: 100, r: 170, color: "#ff9a4a", steps: 4, power: 0.9 }, { x: 470, y: 188, r: 70, color: "#9be15d", steps: 3, power: 0.7 }, { x: 320, y: 200, r: 200, color: "#a05cff", steps: 3, power: 0.5 },
      { x: 570, y: 70, r: 110, color: "#39d0ff", steps: 3, power: 0.7 }, { x: 25, y: 70, r: 90, color: "#7a8aff", steps: 3, power: 0.6 }],
    halos: [{ x: 362, y: 52, r: 26, color: "#ffffff", strength: 0.9 }, { x: 134, y: 52, r: 24, color: "#ffc44d", strength: 0.9 }],
    rims: [{ x: 210, y: 80, r: 320, color: "#ff3fa4" }, { x: 520, y: 80, r: 300, color: "#39d0ff" }], shadow: 0.62 };
}

/* ---------------------------------------------------------------- animated bits */
function draw(c, S, t) {
  if (!isOpen(S)) return;
  // LED wall: sweeping equalizer bars
  c.save(); c.globalAlpha = 0.5;
  for (let i = 0; i < 26; i++) {
    const h = Math.round(6 + (Math.sin(t / 260 + i * 0.7) + Math.sin(t / 410 + i * 1.3) + 2) * 10);
    c.fillStyle = ["#ff3fa4", "#39d0ff", "#ffd23f", "#a05cff"][(i + Math.floor(t / 900)) % 4];
    c.fillRect(260 + i * 8, Math.min(68, 70 - h * 0.7), 6, Math.max(2, h * 0.7));
  }
  c.restore();
  // disco ball facets throwing light spots around the room
  for (let i = 0; i < 34; i++) {
    const a = t / 1700 + i * 2.1, rx = 140 + (i * 37 % 70), x = 362 + Math.cos(a) * rx * 1.5, y = 60 + Math.sin(a * 0.8 + i) * 44 + (i % 3) * 20;
    if (x < 0 || x > W || y < 0 || y > 170) continue;
    P(c, x, y, i % 3 === 0 ? "#ffffff" : i % 3 === 1 ? "#8ad8ff" : "#ff9ad5");
  }
}
function drawFront(c, S, t) {
  if (!isOpen(S)) return;
  // a little foreground silhouette in the corners for depth
  PK.crowdSilhouettes(c, 0, 232, 54, 28, { rows: 1, colors: ["#120a1e", "#0a0612", "#06020e"], density: 1, rim: ["#ff3fa4"], seed: 3 });
  PK.crowdSilhouettes(c, 590, 232, 50, 28, { rows: 1, colors: ["#120a1e", "#0a0612", "#06020e"], density: 1, rim: ["#39d0ff"], seed: 4 });
}

/* ---------------------------------------------------------------- room */
RP.room({
  id: "a3_halcyon", act: 3, name: "The Halcyon Room",
  paint, light, draw, drawFront,
  cacheKey: S => (isOpen(S) ? "o" : "c") + (S.f.a3_thu3 ? "3" : "") + "|" + S.name,
  lightKey: S => (isOpen(S) ? "o" : "c"),
  ambience: S => isOpen(S) ? "club_through_wall" : "room",
  music: S => isOpen(S) ? { genre: "house", bpm: 122, volume: 0.28, filter: ["lowpass", 1100], energy: 3 } : null,
  walk: [[8, 204], [632, 204], [632, 252], [8, 252]],
  scale: [170, 0.8, 252, 1.04],
  start: { x: 60, y: 232, face: "right" },
  fx: [
    { type: "haze", rect: [180, 70, 300, 120], color: "#a090ff", density: 3, slow: 120, on: () => isOpen(RP.state) },
    { type: "beams", origins: [[262, 30], [322, 30], [382, 30], [442, 30]], colors: ["#ff3fa4", "#39d0ff", "#ffd23f", "#a05cff"], base: Math.PI / 2, swing: 0.55, len: 190, width: 12, alpha: 0.13, period: 1700, on: () => isOpen(RP.state) },
    { type: "strobe", period: 6400, flash: 40, alpha: 0.1, color: "#e8e4ff", on: () => isOpen(RP.state) && RP.state.f.a3_floor === "full" },
    { type: "dust", rect: [30, 60, 570, 150], count: 26, color: "#fff4d6", on: () => !isOpen(RP.state) },
    { type: "blink", items: [{ r: [18, 41, 4, 2], color: "#ff4a4a", rate: 800 }] }
  ],
  sprites: [
    { y: 134, draw: c => boothSprite(c, 258, 68) },
    { y: 170, draw: c => barFront(c, 48, 132) },
    { y: 214, draw: c => fohDesk(c, 434, 184) }
  ],
  actors: S => {
    const L = [];
    // staff
    L.push({ id: "a3_nico", char: "a3_nico", x: 98, y: 168, face: "front", act: "stand", name: "Nico" });
    L.push({ id: "a3_bex", char: "a3_bex", x: 160, y: 168, face: "front", act: "stand", name: "Bex" });
    L.push({ id: "a3_gus", char: "a3_gus", x: 478, y: 206, face: "front", act: "stand", name: "Gus" });
    L.push({ id: "a3_odessa", char: "a3_odessa", x: isOpen(S) ? 130 : 280, y: 226, face: "right", act: "stand", name: "Odessa", vis: S2 => !S2.f.a3_odessaGone });
    // stage DJ
    L.push({ id: "a3_kosmo", char: "kosmo", x: 358, y: 122, face: "front", act: "dj", name: "Kosmo Delacroix", scale: 1, vis: S2 => !!S2.f.a3_thu3 && !S2.f.a3_kosmoDone });
    L.push({ id: "a3_dj_stage", char: "a3_brandon", x: 358, y: 122, face: "front", act: "dj", name: "DJ Brandon Shine", vis: S2 => false });
    // rival at the bar
    L.push({ id: "a3_brandon", char: "a3_brandon", x: 214, y: 222, face: "left", act: "stand", name: "DJ Brandon Shine", vis: S2 => isOpen(S2) && (!S2.f.a3_thu3 ? !!S2.f.a3_brandonSeen : !S2.f.a3_brandonGone) });
    L.push({ id: "a3_marcus", char: "marcus", x: 290, y: 214, face: "back", act: "dance", name: "Marcus", vis: S2 => isOpen(S2) && !!S2.f.a3_marcus3 });
    // crowd
    L.push({ crowd: { n: 5, rect: [270, 200, 140, 20], seed: 7, face: "back", act: "dance", scale: 0.85, vis: S2 => isOpen(S2) && !isFull(S2) } });
    L.push({ crowd: { n: 20, rect: [244, 196, 180, 26], seed: 8, face: "back", act: "dance", scale: 0.85, vis: S2 => isFull(S2) } });
    L.push({ crowd: { n: 4, rect: [518, 202, 44, 6], seed: 9, face: "back", act: "stand", scale: 1, vis: S2 => isOpen(S2) } });
    return L;
  },
  enter: async (S, from) => {
    if (A3.hallEnter) await A3.hallEnter(S, from);
  },
  hotspots: [
    { id: "a3_h_door", name: "door to Ludlow Street", r: [4, 60, 44, 112], z: 20, walk: [58, 226, "left"],
      look: "The door to Ludlow Street. The cold air comes in here, with a smell of bodega.",
      exit: S => ({ room: "a3_street", x: 322, y: 228, face: "front" }) },
    { id: "a3_h_bar", name: "bar", rects: [[52, 66, 180, 106]], z: 12, walk: [136, 214, "back"],
      look: "A long bar with a mirrored back-bar, a hundred bottles of the same four liquors, and a hand-written sign: 'NO, WE DON'T HAVE THAT.'",
      pickup: "I'd take a drink. Not the bar. I know my limits.", open: "It's open. That's the whole point.", use: "I'd order something, but the bartenders are busy not talking to each other." },
    { id: "a3_h_player", name: "bar record player", r: [192, 118, 34, 20], z: 40, walk: [206, 214, "back"],
      look: "A little record player on the bar. 'House rule: vinyl on the bar before doors,' says the card taped to it. Somebody's been choosing badly.",
      use: S => A3.barPlayer(S), give: (S, item) => "I give records the respect they deserve. Not by passing them across a bar." },
    { id: "a3_nico", name: "Nico", z: 80, look: "Nico, left side of the bar. Mustache, vest, a posture that says 'I will fix your drink and I will never forgive you.'",
      talk: S => A3.nicoTalk(S), give: (S, item) => A3.barGive(S, "nico", item) },
    { id: "a3_bex", name: "Bex", z: 80, look: "Bex, right side of the bar. Pink bun, tattoo sleeve, a smile that appears about four times a year. Today isn't one.",
      talk: S => A3.bexTalk(S), give: (S, item) => A3.barGive(S, "bex", item) },
    { id: "a3_gus", name: "Gus", z: 80, look: "Gus. Sound guy. Headphones permanently round the neck, beanie permanently on. I've never seen him eat. I've never seen him not eat.",
      talk: S => A3.gusTalk(S), give: (S, item) => A3.gusGive(S, item) },
    { id: "a3_odessa", name: "Odessa", z: 80, look: "Odessa Reyes. Owner, promoter, den mother. A clipboard, a chain, a cigarette behind her ear that's never been lit. She holds it like a promise.",
      talk: S => A3.odessaTalk(S), give: (S, item) => A3.odessaGive(S, item) },
    { id: "a3_kosmo", name: "Kosmo Delacroix", z: 80, look: "Kosmo Delacroix. A legend. Long silver hair, coat that costs more than my rent, sunglasses indoors at one in the morning. He nods at the music like it owes him money.",
      talk: S => A3.kosmoTalk(S), give: "I don't think Kosmo takes gifts from nobodies. Nobodies like me." },
    { id: "a3_brandon", name: "DJ Brandon Shine", z: 80, look: "DJ Brandon Shine. Gold vest, sunglasses indoors, a tan that's not from outdoors. His smile arrives half a second before the rest of him.",
      talk: S => A3.brandonTalk(S), give: (S, item) => A3.brandonGive(S, item) },
    { id: "a3_marcus", name: "Marcus", z: 80, look: "Marcus, plus three, dancing in a way that means he's been in the building forty seconds.",
      talk: ["Marcus! You came!", "@a3_marcus I came! My friend came! The guy from the cab came!", "He's very into the music. He's holding a drink he didn't pay for."] },
    { id: "a3_h_foh", name: "sound desk", r: [432, 188, 100, 28], z: 30, walk: [448, 220, "back"],
      look: "Gus's front-of-house desk: forty faders, a laptop, and a graveyard of snack wrappers. It looks like a spaceship that crashed into a vending machine.",
      use: "Gus looks at my hand. At the desk. At my hand. I withdraw it.", pickup: "Gus looks at me. I put it down." },
    { id: "a3_h_stage", name: "DJ booth", r: [236, 68, 252, 104], z: 15, walk: [454, 216, "back"],
      look: S => S.f.a3_thu3 ? "The booth up on the stage. Pioneer CDJs and a mixer that Gus keeps in a better mood than anyone in the building." : "The booth. House CDJs and a mixer; the monitors are asleep. Gus has to wake them. He doesn't wake easily.",
      use: S => RP.goto("a3_booth", 300, 152, "front"), open: S => RP.goto("a3_booth", 300, 152, "front"), talk: "Hello, booth. Be nice tonight." },
    { id: "a3_h_steps", name: "stage steps", r: [430, 140, 56, 32], z: 25, walk: [452, 210, "back"],
      look: "Three steps to the booth. Seventeen years of sneakers have worn a groove in the middle one.",
      exit: S => ({ room: "a3_booth", x: 300, y: 152, face: "front" }) },
    { id: "a3_h_led", name: "LED wall", r: [258, 26, 208, 44], z: 10, look: "A wall of LED panels playing the same wave for hours. After two hours you start to feel like the wave is playing you.", pickup: "Each panel weighs more than I do. And I weigh... a lot, after the pizza." },
    { id: "a3_h_ball", name: "disco ball", r: [346, 36, 32, 34], z: 14, look: "A disco ball the size of a beach ball. A hundred little mirrors, and every one of them is smiling.", pickup: "It's on a wire. A very high wire. Hard no." },
    { id: "a3_h_speakers", name: "speakers", rects: [[212, 64, 40, 108], [474, 64, 40, 108]], z: 22, look: "PA stacks, tall as a person and louder than my last argument. The cone on the bottom is a subwoofer. It's a feeling, not a sound.", use: "It's a PA. You don't 'use' it. It uses you.", push: "Pushing a stack of speakers: how to get a quick hospital visit." },
    { id: "a3_h_crowd", name: "dance floor", r: [236, 188, 252, 36], z: 5, floor: true,
      look: S => isFull(S) ? "The dance floor. A tide of bodies, phones held up like candles, and one guy who's definitely Marcus." : isOpen(S) ? "The dance floor. At ten o'clock, it's a gym with a disco ball. A few brave souls near the bar pretend they're not waiting." : "The dance floor, in work-light. A sticky epic of spilled drinks, gum, and one lonely glove." },
    { id: "a3_h_wc", name: "restrooms", r: [506, 60, 50, 112], z: 20, walk: [532, 214, "back"],
      look: "The restrooms. The line is eight people, three of whom are just there to talk. Somebody's 'taking a minute.' Everybody's taking a minute.",
      use: "I'm fine. Thanks. I'm... fine.", open: "No. The line has fought for this. I won't cut it.", talk: "Hey, who's in there? ...No answer. That's the saddest door in the building." },
    { id: "a3_h_staff", name: "staff door", r: [584, 60, 52, 112], z: 20, walk: [610, 214, "back"],
      look: "STAFF ONLY. Odessa's office is back there, along with the thermostat she won't let anyone touch.",
      exit: S => { if (S.f.a3_opener) return { room: "a3_office", x: 80, y: 232, face: "right" }; return "Staff only. Odessa hasn't given me the key. She hasn't given me anything but a deadline."; } },
    { id: "a3_h_banner", name: "banner", r: [58, 32, 172, 26], z: 18, vis: S => !!S.f.a3_thu3, look: "6 MONTHS. A hand-painted banner. Odessa's handwriting. There's a coffee ring on the 'S'. It adds a touch of class." },
    { id: "a3_h_neon", name: "neon sign", r: [128, 40, 40, 16], z: 18, look: "BAR, in amber tubes. It's the most reliable sign in the building." },
    { id: "a3_h_exit", name: "exit sign", r: [10, 40, 30, 14], z: 18, look: "EXIT. The most honest thing in the building." },
    { id: "a3_h_stools", name: "bar stools", rects: [[60, 176, 160, 26]], z: 4, floor: true, look: "Four bar stools, upholstered in a red nobody would pick. One has a lipstick 'X' on it. Another has a phone number." }
  ],
  combos: [
    ["a3_chips", "a3_gus", S => A3.gusGive(S, "a3_chips")],
    ["a3_pickle", "a3_gus", S => A3.gusGive(S, "a3_pickle")],
    ["a3_rinds", "a3_gus", S => A3.gusGive(S, "a3_rinds")],
    ["a3_chips", "a3_h_foh", S => A3.gusGive(S, "a3_chips")],
    ["a3_pickle", "a3_h_foh", S => A3.gusGive(S, "a3_pickle")],
    ["a3_chips", "a3_nico", "Nico looks at the chips. 'I can't eat on shift.' He eats one. 'I didn't eat that.'"],
    ["a3_chips", "a3_bex", "Bex takes the bag, looks at the label, hands it back. 'Salt and vinegar is for people who hate themselves.'"],
    ["a3_pickle", "a3_nico", "Nico takes a bite. 'Not bad. Don't tell Bex I said that.'"],
    ["a3_pickle", "a3_bex", "Bex takes a bite. 'Tell Nico I said it's okay. No. Don't tell him. Tell him I said nothing.'"],
    ["a3_usb", "a3_h_stage", S => RP.goto("a3_booth", 300, 152, "front")],
    ["a3_bag", "a3_h_stage", S => RP.goto("a3_booth", 300, 152, "front")],
    ["a3_usb", "a3_gus", "Gus sniffs the USB. It's not a snack. He gives it back, disappointed in me and the whole concept."],
    ["a3_bag", "a3_h_player", S => A3.barPlayer(S)],
    ["a3_footage", "a3_odessa", S => A3.footageToOdessa(S)],
    ["a3_footage", "a3_brandon", S => A3.confrontBrandon(S)]
  ],
  self: { look: "Jacket, headphones round the neck, a bag of records. I look like a person who's allowed to be here.", talk: "Talk to yourself in a club. It's quiet enough to be believable." }
});
})();
