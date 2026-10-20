/* Act 1 — a1_subway: Jefferson St, the L platform. The turnstile opens the subway map (fare $3).
   A busker, a rat with a crust, a train that comes through every so often. */
(function () {
"use strict";
const RP = window.RP;
const A1 = RP.a1, PK = RP.PK;
const { R, P, ell, line, poly, bayer, mulberry, clamp, txt, txtW, txtC, mix, ramp } = RP.u;
const U = PK.util;
const W = 640;

const B = {
  car: () => A1.memo("sw_car", 300, 94, c => { PK.subwayCar(c, 0, 0, 300, { line: "L", lit: true, doorsOpen: false, stripe: "#8a8c9a" }); }),
  turn: () => A1.memo("sw_turn", 44, 52, c => { PK.turnstile(c, 2, 2, {}); }),
  bench: () => A1.memo("sw_bench", 96, 40, c => { PK.bench(c, 2, 2, 90, { back: true }); }),
  trash: () => A1.memo("sw_trash", 22, 34, c => {
    R(c, 3, 8, 16, 24, "#2a3a2e"); R(c, 3, 8, 16, 2, "#6a8a70"); R(c, 3, 8, 1, 24, "#4a6a50"); R(c, 18, 8, 1, 24, "#141e16");
    for (let i = 0; i < 4; i++) R(c, 5, 13 + i * 5, 12, 1, "#141e16");
    R(c, 2, 5, 18, 4, "#3a4a3e"); R(c, 2, 5, 18, 1, "#8aaa90"); R(c, 6, 1, 4, 5, "#d8d4c8"); R(c, 10, 2, 5, 3, "#c0302c"); P(c, 8, 0, "#efeaf6");
    U.dshade(c, 1, 31, 20, 3, "#000", () => 0.8, 0.4);
  }),
  bucket: () => A1.memo("sw_bucket", 26, 24, c => {
    R(c, 3, 6, 20, 16, "#c0302c"); R(c, 3, 6, 20, 2, "#ff7a6a"); R(c, 3, 20, 20, 2, "#6a1410"); R(c, 3, 6, 1, 16, "#e8503a"); R(c, 22, 6, 1, 16, "#7a1c18");
    ell(c, 13, 6, 10, 3, "#d8d4e0"); ell(c, 13, 6, 9, 2, "#f4f0fc");
    U.dshade(c, 1, 22, 24, 2, "#000", () => 0.8, 0.4);
  })
};

function vending(c, x, y) {
  const em = [];
  R(c, x, y, 52, 60, "#1a3a8a"); U.gradient(c, x, y, 52, 60, [[0, "#3a6ad8"], [0.1, "#2a52b8"], [1, "#142e70"]], 1, true);
  R(c, x, y, 52, 1, "#8ab0ff"); R(c, x, y, 1, 60, "#6a90f0"); R(c, x + 51, y, 1, 60, "#0a1a48");
  R(c, x + 4, y + 4, 44, 8, "#ffd23f"); txtC(c, "METROCARD", x + 26, y + 6, "#1a1a2a", 1);
  R(c, x + 6, y + 16, 28, 20, "#0a1a10"); R(c, x + 7, y + 17, 26, 18, "#1a5a30"); txt(c, "FARE $3", x + 10, y + 20, "#9fffb0"); txt(c, "GAME", x + 10, y + 27, "#ffd23f"); em.push([x + 7, y + 17, 26, 18]);
  for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) R(c, x + 38 + k * 4, y + 16 + r * 5, 3, 3, "#c8c4d8");
  R(c, x + 6, y + 40, 40, 6, "#10141c"); R(c, x + 8, y + 42, 36, 2, "#c8c4d8");
  R(c, x + 6, y + 50, 14, 6, "#c0302c"); R(c, x + 24, y + 50, 22, 6, "#10141c");
  U.dshade(c, x, y + 56, 52, 4, "#000", () => 0.8, 0.4);
  return em;
}
function subMap(c, x, y) {
  R(c, x, y, 70, 46, "#efeaf6"); R(c, x, y, 70, 1, "#fff"); R(c, x + 69, y, 1, 46, "#8a869c"); R(c, x, y + 45, 70, 1, "#8a869c");
  R(c, x + 3, y + 3, 64, 40, "#e8e0cc");
  [[6, 12, 64, 10, "#ff6319"], [6, 20, 64, 26, "#00933c"], [6, 8, 50, 38, "#2850ad"], [14, 36, 62, 8, "#996633"], [6, 30, 60, 14, "#ee352e"]].forEach(([x1, y1, x2, y2, col]) => { line(c, x + x1, y + y1, x + x2, y + y2, col); line(c, x + x1, y + y1 + 1, x + x2, y + y2 + 1, col); });
  [[16, 14], [30, 22], [44, 30], [24, 34], [52, 20]].forEach(([px, py]) => { ell(c, x + px, y + py, 2, 2, "#efeaf6"); P(c, x + px, y + py, "#1d1622"); });
  ell(c, x + 38, y + 27, 3, 3, "#c0302c"); P(c, x + 38, y + 27, "#fff");
  txt(c, "YOU ARE HERE", x + 6, y + 38, "#c0302c"); outlineRect(c, x, y, 70, 46, "#2a2a3a");
}
function outlineRect(c, x, y, w, h, col) { R(c, x, y, w, 1, col); R(c, x, y + h - 1, w, 1, col); R(c, x, y, 1, h, col); R(c, x + w - 1, y, 1, h, col); }
function ad(c, x, y, w, h, bg, fg, l1, l2, l3) {
  R(c, x, y, w, h, bg); outlineRect(c, x, y, w, h, mix(bg, "#000", 0.4));
  txtC(c, l1, x + w / 2, y + 4, fg, 1);
  if (l2) { const sc = w > 44 ? 2 : 1; txtC(c, l2, x + w / 2, y + 14, fg, sc); }
  if (l3) txtC(c, l3, x + w / 2, y + h - 9, mix(fg, bg, 0.2), 1);
}

function paintSubway(c, S) {
  const em = PK.subwayPlatform(c, 0, 0, W, 256, { name: "JEFFERSON ST", tile: "#d6d2de", stripe: "#7a8090", seed: 5 });
  /* the stairwell up (left) */
  R(c, 0, 14, 64, 156, "#0c0814"); U.gradient(c, 0, 14, 64, 156, [[0, "#1a1426"], [1, "#2a2038"]], 1, true);
  for (let i = 0; i < 12; i++) { const y = 150 - i * 11; R(c, 8 + i * 3, y, 56 - i * 3, 3, mix("#8a869c", "#14101c", i / 14)); R(c, 8 + i * 3, y, 56 - i * 3, 1, mix("#e8b830", "#14101c", i / 14)); R(c, 8 + i * 3, y + 3, 56 - i * 3, 5, "#1c1624"); }
  R(c, 0, 14, 6, 156, "#2f6a52"); R(c, 0, 14, 2, 156, "#4a9a7a"); R(c, 62, 14, 2, 156, "#14101c");
  U.dshade(c, 8, 14, 54, 60, "#fff0c0", (px, py) => (1 - (py - 14) / 60) * 0.7, 0.45);
  R(c, 6, 4, 54, 14, "#0a2a1a"); R(c, 6, 4, 54, 1, "#4a9a7a"); txtC(c, "EXIT", 33, 8, "#9fffc0", 1); txt(c, "TO", 12, 9, "#9fffc0"); em.push([6, 4, 54, 14]);
  PK.glow(c, 36, 12, 24, "#40e080", { strength: 0.7 }).forEach(r => em.push(r));
  /* posters + map + countdown board */
  subMap(c, 120, 52); ad(c, 200, 54, 38, 40, "#c0302c", "#fff6dc", "INJURED?", "CALL", "NOW 1-800"); ad(c, 256, 52, 44, 44, "#ffd23f", "#2a1a10", "DR. HAIR", "WOW", "SURE"); ad(c, 330, 54, 40, 40, "#1b1440", "#ff3fa4", "NOWHERE", "SAT", "10PM");
  ad(c, 420, 52, 50, 46, "#2f62b8", "#fff6dc", "FIND A", "ROOM", "BUSHWICK"); ad(c, 490, 54, 44, 40, "#efeaf6", "#c0302c", "SEE", "SOMETHING", "SAY IT");
  R(c, 262, 18, 82, 16, "#06060a"); R(c, 262, 18, 82, 1, "#4a4a5a"); txt(c, "L 8 AV", 266, 21, "#ffb030"); txt(c, "2 MIN", 320, 21, "#ffb030"); txt(c, "CANARSIE", 266, 28, "#ffb030"); txt(c, "6 MIN", 320, 28, "#ffb030"); em.push([262, 18, 82, 16]);
  /* graffiti on the tile + gum */
  [[440, 100, "#ff3fa4"], [150, 100, "#39d0ff"]].forEach(([x0, y0, col], k) => { let px = x0, py = y0; for (let i = 0; i < 30; i++) { P(c, px, py, col); P(c, px + 1, py, col); px += 1 + (i % 3 === 0 ? 1 : 0); py += ((i * 7 + k) % 5) - 2 > 0 ? 1 : -1 > 0 ? 1 : 0; } });
  /* vending machine (wall) */
  em.push.apply(em, vending(c, 80, 112));
  return em;
}

function lightSubway(S) {
  return {
    ambient: "#8c88a6",
    lights: [
      { x: 90, y: 10, r: 220, color: "#eaffff", steps: 4, sy: 1.1 }, { x: 250, y: 10, r: 220, color: "#eaffff", steps: 4, sy: 1.1 },
      { x: 410, y: 10, r: 220, color: "#eaffff", steps: 4, sy: 1.1 }, { x: 570, y: 10, r: 220, color: "#eaffff", steps: 4, sy: 1.1 },
      { x: 36, y: 40, r: 110, color: "#d8ffe0", steps: 3, power: 0.5 }
    ],
    key: { x: 320, y: 6 }, shadow: 0.5, rims: [{ x: 640, y: 120, r: 200, color: "#ffe2a0" }]
  };
}

/* ---------- train + rat ---------- */
const CYCLE = 38000, PASS = [9000, 16000];
let trainSfx = false;
function drawSubway(c, S, t) {
  const m = t % CYCLE;
  if (m >= PASS[0] && m < PASS[1]) {
    const k = (m - PASS[0]) / (PASS[1] - PASS[0]), x = -640 + k * 1500;
    for (let i = 0; i < 3; i++) A1.blit(c, B.car(), x + i * 302, 76);
    /* rushing air: streaks across the platform lip */
    U.dshade(c, 0, 112, W, 60, "#ffffff", (px, py) => ((px * 3 + Math.floor(t / 20) * 11) % 17 < 2 ? 0.4 : 0), 0.06);
  }
  /* rat on the track bed: scurries left to right every cycle, carrying a crust */
  const rm = (t + 12000) % 21000;
  if (rm < 7000 && !(m >= PASS[0] - 500 && m < PASS[1])) {
    const k = rm / 7000, rx = -20 + k * 700, ry = 156 + Math.round(Math.sin(k * 14) * 1);
    const leg = Math.floor(t / 80) % 2;
    ell(c, rx, ry, 5, 2, "#5a5668"); ell(c, rx + 5, ry - 1, 2, 2, "#6a667c"); P(c, rx + 7, ry - 1, "#e8a0a0"); P(c, rx + 5, ry - 3, "#8a869c"); P(c, rx + 6, ry - 2, "#f2f0e0");
    R(c, rx - 6, ry + 1, 4, 1, "#b88a8a"); P(c, rx - 9 + leg, ry, "#b88a8a");
    P(c, rx + 8, ry - 2, "#e8b840"); P(c, rx + 9, ry - 2, "#e8b840"); P(c, rx + 8, ry - 1, "#c8902a");
    P(c, rx - 2 + leg, ry + 2, "#3a364a"); P(c, rx + 2 - leg, ry + 2, "#3a364a");
  }
}
function sticks(c, S, t) {
  const hit = Math.floor(t / 170) % 4, up = hit % 2;
  R(c, 466, 214 + up * 6, 1, 9, "#d8c8a0"); R(c, 483, 214 + (1 - up) * 6, 1, 9, "#d8c8a0");
  P(c, 466, 213 + up * 6, "#fff"); P(c, 483, 213 + (1 - up) * 6, "#fff");
}
function updateSubway(dt, S, t, inst) {
  const m = t % CYCLE;
  if (m >= PASS[0] && m < PASS[0] + 120) { if (!trainSfx) { trainSfx = true; RP.sfx("train"); } } else trainSfx = false;
}

async function buskerTalk(S) {
  await RP.convo([
    { text: "Nice bucket work.", run: () => RP.lines(["@a1_busker Thank you. Eight years. Never lost a bucket.", "@a1_busker Lost a few sticks. Sticks are the real overhead."]) },
    { text: "Got a dollar for a request?", run: async () => {
      if (!RP.canAfford(1)) return RP.lines(["@a1_busker Sir. I'm busking. You're asking me for money?", "@a1_busker I'll play the 'broke' request for free. It's easy: it's every song."]);
      RP.money(-1); RP.sfx("coin");
      await RP.lines(["I drop a dollar in the bucket.", "@a1_busker Request?"]);
      const r = await RP.choose(["Something with a four-on-the-floor.", "Something to wake up a dead room."]);
      if (r === 0) {
        await RP.lines(["Something with a four-on-the-floor.", "@a1_busker Four-on-the-floor on a bucket. It's called 'a bucket.' ...Here."]);
        await RP.wait(800);
        await RP.say("It's actually kind of a groove. I could remix this. I shouldn't. I will, eventually.");
      } else {
        await RP.lines(["Something to wake up a dead room.", "@a1_busker Dead room? Easy. One thing at a time. Kick. Eight bars, add the hat. Eight more, the snare.", "@a1_busker Nobody dances to the first drum. They dance when they can guess the next one."]);
        await RP.wait(800);
        await RP.lines(["He builds it, layer by layer. A guy waiting for the L starts nodding. Then his friend. Then a woman with a cello case.", "One guy nods and it's a rumor. A build is just patience in a good outfit. Noted."]);
      }
    } },
    { text: "Anything I should know about Midtown?", once: true, run: () => RP.lines(["@a1_busker Midtown? The office towers do a fire drill every other month. Nobody ever takes it seriously.", "@a1_busker The second the alarm goes off, you could lead a parade out of there and nobody'd ask for ID. Not even the guard.", "@a1_busker Not that I'd know. I'm just a guy with a bucket."]) },
    { text: "How's the L today?", once: true, run: () => RP.lines(["@a1_busker It runs every six minutes. Except when it doesn't. Then it's every thirty. The schedule is a suggestion.", "@a1_busker I can tell you where the rat's going, though. Every day, same crust. Same route."]) },
    { text: "Later.", end: true }
  ]);
}

const BUSKER = { id: "a1_busker", char: "a1_busker", x: 475, y: 236, face: "front", act: "stand", name: "Busker" };
RP.room({
  id: "a1_subway", act: 1, name: "Jefferson St (L)",
  paint: paintSubway, draw: drawSubway, update: updateSubway, light: lightSubway,
  cacheKey: S => "x", lightKey: S => "x",
  ambience: "subway",
  walk: [[100, 210], [600, 210], [620, 250], [84, 250]],
  scale: [210, 0.96, 250, 1.04],
  start: { x: 312, y: 242, face: "front" },
  fx: [{ type: "dust", rect: [60, 20, 520, 150], count: 18, color: "#f4fff4" }],
  actors: [BUSKER],
  sprites: [
    { y: 234, draw: c => A1.blit(c, B.turn(), 100, 186) },
    { y: 234, draw: c => A1.blit(c, B.turn(), 136, 186) },
    { y: 214, draw: c => A1.blit(c, B.bench(), 232, 176) },
    { y: 214, draw: c => A1.blit(c, B.bench(), 340, 176) },
    { y: 243, draw: c => A1.blit(c, B.trash(), 568, 212) },
    { y: 248, draw: c => A1.blit(c, B.bucket(), 462, 226) },
    { y: 249, draw: (c, S, t) => sticks(c, S, t) }
  ],
  enter: async (S, from) => { S.f.noTravel = false; },
  hotspots: [
    { id: "swStairs", name: "stairs to the street", r: [0, 4, 66, 166], z: 30, walk: [74, 218, "left"], look: "The stairs up to Jefferson Street. Fresh air, in the sense that exhaust counts.",
      exit: S => ({ room: "a1_stoop", x: 826, y: 238, face: "front" }), push: "I push the railing. It's cold and sticky. It's New York.", pull: "I pull the railing. It's attached to the ground, and the ground to the planet." },
    { id: "turnstile", name: "turnstile (take the train)", r: [96, 184, 86, 56], z: 40, walk: [150, 232, "back"],
      look: "The turnstile. Three dollars to get on the L. That's the game fare. In real life, it's more. In the game's life, it's a lie told for balance.",
      exit: S => A1.travelExit(S, true),
      push: "I push. It clicks, rotates a quarter turn and stops. I tried.", pull: "It's a turnstile. It goes one way and so do I." },
    { id: "train", name: "the L train", r: [0, 76, 640, 94], z: 4, walk: [320, 232, "back"], noWalk: false, look: "The L tracks. A train comes through every so often with a roar that blows my hair back and my budget along with it.",
      exit: S => A1.travelExit(S, true), pickup: "I can't pick up a train. It's the opposite of a train.", push: "It doesn't budge. Neither does my rent." },
    { id: "metrocard", name: "MetroCard machine", r: [78, 110, 56, 66], z: 26, walk: [106, 226, "back"], look: "The MetroCard machine. A sticker reads FARE $3 (GAME FARE). A second sticker says: \"Please, God.\"", use: "I don't need a card. The turnstile reads my face. It's a futuristic thing and I'm not ready to think about it.", pickup: "It's bolted to the wall. It's the only reason the wall is standing.", push: "The screen flashes \"ERROR\" in a typeface I'd hire for a record label.", open: "The cash slot's jammed with a gum wrapper. A civic tradition." },
    { id: "swMap", name: "subway map", r: [118, 50, 74, 50], z: 14, walk: [156, 226, "back"], look: "The system map. A thousand colored lines and one tiny red dot that says YOU ARE HERE. The dot knows what I don't.", pickup: "It's laminated to the wall. It's the city's only honest promise." },
    { id: "swAds", name: "posters", rects: [[198, 52, 42, 44], [254, 50, 48, 48], [418, 50, 54, 50], [488, 52, 48, 44]], z: 12, walk: [320, 224, "back"], look: "INJURED? CALL NOW. A dermatologist with the world's most confident slogan. A room in Bushwick. See Something, Say It. New York's ad space has a theme: dread." },
    { id: "swNowhere", name: "Nowhere poster", r: [328, 52, 44, 44], z: 18, walk: [350, 226, "back"], look: "NOWHERE, SAT 10PM. Somebody taped it over a lawyer. Poetic. It's the only poster in the station that I'd go to.", pickup: "I'll leave it. Somebody else wants to know where Nowhere is." },
    { id: "swBoard", name: "arrival board", r: [260, 16, 86, 20], z: 14, walk: [320, 220, "back"], look: "L 8 AV: 2 MIN. L CANARSIE: 6 MIN. The boards are optimistic in the same way my mom is." },
    { id: "swBench1", name: "bench", r: [230, 176, 96, 40], z: 22, walk: [278, 224, "back"], look: "A bench with a wooden slat missing. Someone left a half-eaten pretzel on it. The pretzel is doing better than I am.", use: "I'd sit, but there's a pretzel and a story.", pickup: "It's bolted down. Also I have standards.", push: "It's bolted to the floor. Everything in the MTA is." },
    { id: "swBench2", name: "bench", r: [338, 176, 96, 40], z: 22, walk: [386, 224, "back"], look: "A bench, and a note scratched into it: \"MARCUS WAS HERE.\" Marcus is everywhere. It's a worry.", use: "No. I'm on the move.", pickup: "It's the MTA's. Everything that isn't nailed down gets stolen, so they nail down everything." },
    { id: "swTrash", name: "trash can", r: [566, 210, 26, 36], z: 26, walk: [556, 236, "left"], look: "A trash can with a bloom of newspapers. A pizza crust is balanced at the top. Rat-bait. Rat-bait that I admire.", pickup: "Eww. No. Even at my price point, no.", open: "It has a swinging lid. I'd rather not know.", push: "It rocks. A crust falls off. I'm sorry, rat." },
    { id: "bucket", name: "bucket", r: [460, 224, 30, 26], z: 34, walk: [440, 240, "right"], look: "An upside-down red bucket. The busker's drum and his rent. There's a dollar in it and a button.", pickup: "That's his livelihood. I'm not that desperate. Yet.", use: "I'd drum on it, but I'd miss the rhythm. And lose a hand.", push: "He glances over. I don't touch it. We have an understanding." },
    { id: "tracks", name: "the tracks", r: [0, 118, 640, 52], z: 6, walk: [320, 226, "back"], look: "The track bed. A rat, a half-eaten pizza crust, and the poetry of 600 volts. Don't jump. A New York rule.", pickup: "That's how you die in a very specific way.", use: "No. The third rail does not forgive.", push: "I'd push a rock. But nobody's here to be impressed." },
    { id: "swPillar", name: "column", rects: [[2, 14, 62, 156]], z: 3, walk: [74, 224, "back"], look: "A green steel column. Painted a thousand times, remembered never." }
  ],
  combos: [
    ["a1_slice", "a1_busker", "\"That's pizza,\" says the busker, glancing at the slice. \"Hold on to that. It's currency down here.\""],
    ["a1_slice", "tracks", "The rat would love that. But the rat doesn't need my slice. The slice has a destiny."],
    ["a1_slice", "train", "The slice is not for the train."],
    ["a1_package", "a1_busker", "\"No,\" says the busker. \"Whatever it is, I don't want it. I've got a bucket.\""]
  ]
});
RP.rooms.a1_subway.hotspots.push({ id: "a1_busker", name: "busker", look: "A bucket drummer. Locs, a red hoodie, sticks that blur. He plays for strangers and doesn't ask them to like it.",
  talk: S => buskerTalk(S), use: "I'd join in, but I'm not a drummer. I'm a person who yells at drummers to hold the tempo.", pickup: "I'm not picking up a musician. It violates a union rule.", push: "He taps my hand away with a stick. I've learned a lesson.", give: "He shakes his head. \"Dollars go in the bucket. That's the whole system.\"" });
})();
