/* Act 4 — a4_halle_door: the door of Halle Neun, an old power-station hall. Sven (strict door) quizzes you on your records.
   Flags: a4_svenIntro a4_q1 a4_q2 a4_q3 a4_quizDone a4_band */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u, PK = RP.PK, A4 = RP.a4;
const { R, P, ell, poly, line, txt, txtW, mulberry, mix } = U;
const W = 640;

const sprSignKeine = A4.spr(30, 34, c => {
  R(c, 0, 0, 30, 34, "#efe6d0"); R(c, 0, 0, 30, 1, "#ffffff"); R(c, 0, 33, 30, 1, "#a89e88");
  txt(c, "KEINE", 5, 3, "#17131f"); txt(c, "FOTOS", 5, 10, "#17131f");
  R(c, 8, 18, 14, 10, "#17131f"); R(c, 10, 16, 6, 3, "#17131f"); ell(c, 15, 23, 3, 3, "#efe6d0"); ell(c, 15, 23, 1, 1, "#17131f");
  for (let i = 0; i < 16; i++) { R(c, 5 + i, 28 - Math.round(i * 0.9), 2, 2, "#c0302c"); }
});
const sprBinDoor = A4.spr(30, 42, c => PK.trashCan(c, 3, 4, { color: "#4a4a5e", full: true, h: 34 }));
const sprAshtray = A4.spr(14, 36, c => { R(c, 6, 4, 3, 30, "#5a5a6c"); R(c, 2, 0, 11, 6, "#3a3a4c"); R(c, 2, 0, 11, 1, "#8a8aa0"); R(c, 3, 32, 9, 2, "#2a2a38"); P(c, 5, 1, "#ff9a3a"); P(c, 9, 2, "#ff9a3a"); });

/* ------------------------------------------------------------------ paint */
function paint(c, S) {
  const em = []; const E = a => { if (a && a.length) for (const r of a) em.push(r); return a; };
  PK.gradV(c, 0, 0, W, 40, ["#14102c", "#241a40", "#3a2250"], { dither: 1 });
  // chimney behind the hall, aircraft light
  R(c, 560, 0, 26, 40, "#1c1830"); R(c, 556, 0, 34, 3, "#2a2640"); R(c, 560, 0, 26, 1, "#4a4668");
  // the hall: concrete body with brick plinth, corrugated top
  R(c, 0, 36, W, 4, "#2a2638");
  PK.concrete(c, 0, 40, W, 140, { base: "#5c5a72", panelH: 46, seed: 12 });
  PK.brick(c, 0, 150, W, 30, { base: "#4a2e36", mortar: "#4a4458", worn: 0.7, seed: 2, bw: 20, bh: 8 });
  R(c, 0, 150, W, 2, "#2a2438");
  for (let x = 0; x < W; x += 5) { R(c, x, 28, 3, 12, x % 10 ? "#34304a" : "#443e60"); R(c, x, 28, 1, 12, "#5a5478"); }
  // tall arched windows, bricked up with a hint of red inside
  [[40, 62], [140, 62], [280, 62], [560, 62]].forEach(([x, y]) => { R(c, x - 2, y - 2, 40, 80, "#2a2438"); R(c, x, y + 14, 36, 62, "#0e0a1c"); ell(c, x + 18, y + 14, 18, 14, "#0e0a1c"); R(c, x + 4, y + 20, 28, 4, "#3a1a3a"); PK.util.dshade(c, x, y + 14, 36, 62, "#ff2a3a", (px, py) => 0.25, 0.25); for (let yy = y + 16; yy < y + 76; yy += 6) R(c, x, yy, 36, 1, "#14101c"); });
  // HALLE NEUN, stencilled huge in white, with drips
  txt(c, "HALLE", 60, 24, "#e8e4f4", 6, 3); txt(c, "NEUN", 262, 24, "#e8e4f4", 6, 3);
  const rnd = mulberry(3);
  for (let i = 0; i < 14; i++) { const x = 60 + Math.floor(rnd() * 440), y = 54 + Math.floor(rnd() * 3); PK.util.AR(c, x, y, 1, 6 + Math.floor(rnd() * 10), "#e8e4f4", 0.45); }
  R(c, 56, 20, 520, 1, "#8a86a8");
  // pipes and a vent
  PK.pipe(c, 14, 36, 140, { dir: "v", r: 4 }); PK.pipe(c, 600, 36, 120, { dir: "v", r: 4 }); PK.vent(c, 366, 118, 30, 18);
  // big steel door
  R(c, 430, 66, 120, 112, "#1a1824"); R(c, 434, 70, 112, 108, "#3a3a50"); PK.gradV(c, 434, 70, 112, 108, ["#5a5a72", "#3a3a50", "#2a2a3c"], { dither: 1 });
  R(c, 489, 70, 3, 108, "#14121c"); R(c, 490, 70, 1, 108, "#6a6a88");
  for (let y = 78; y < 176; y += 12) { for (let x of [440, 482, 498, 540]) { ell(c, x, y, 1, 1, "#14121c"); P(c, x - 1, y - 1, "#8a8aa8"); } }
  R(c, 478, 118, 10, 4, "#c8c4d8"); R(c, 494, 118, 10, 4, "#c8c4d8"); R(c, 476, 112, 2, 16, "#8a86a0"); R(c, 506, 112, 2, 16, "#8a86a0");
  R(c, 450, 82, 22, 12, "#c0302c"); txt(c, "H9", 456, 85, "#ffffff"); R(c, 450, 82, 22, 1, "#ff7a6a");
  R(c, 430, 66, 120, 3, "#6a6a88"); R(c, 430, 175, 120, 3, "#14121c");
  // red cage lamp above the door
  R(c, 480, 52, 12, 14, "#2a2438"); R(c, 482, 56, 8, 8, "#ff3030"); R(c, 484, 58, 4, 4, "#ffc0c0"); em.push([482, 56, 8, 8]);
  PK.glow(c, 486, 60, 30, "#ff2a3a", { strength: 1 }).forEach(r => em.push(r));
  // street
  PK.asphalt(c, 0, 178, W, 78, { seed: 9 });
  R(c, 0, 178, W, 2, "#2a2638"); R(c, 0, 180, W, 1, "#5a5878");
  A4.puddle(c, 100, 232, 40, 5, ["#ff3030", "#39a8ff"], 1); A4.puddle(c, 330, 244, 50, 5, ["#ff3030", "#ffd890"], 2); A4.puddle(c, 520, 222, 44, 5, ["#ff2a3a", "#ffffff"], 3); A4.puddle(c, 600, 246, 26, 4, ["#ff3030", "#a05cff"], 4);
  // red light spill on the ground by the door
  PK.util.dshade(c, 410, 178, 160, 70, "#ff2a3a", (px, py) => (1 - (py - 178) / 70) * (1 - Math.abs(px - 490) / 90), 0.3);
  // sodium floodlights
  E(PK.streetlamp(c, 126, 206, { on: true, h: 120 }));
  E(PK.streetlamp(c, 594, 206, { on: true, h: 120, flip: true }));
  // graffiti tags along the plinth
  [[220, 164, "#ff3fa4"], [250, 166, "#39d0ff"], [10, 160, "#ffd23f"], [330, 162, "#9be15d"]].forEach(([x, y, col]) => { R(c, x, y, 22, 3, col); R(c, x + 4, y + 4, 14, 2, col); R(c, x + 2, y - 3, 4, 3, col); });
  // stencilled arrow on the ground
  R(c, 20, 196, 60, 3, "#c8c4d8"); poly(c, [[80, 190], [96, 197.5], [80, 205]], "#c8c4d8"); txt(c, "SCHLANGE", 24, 202, "#c8c4d8");
  return em;
}

function draw(c, S, t) {
  if (Math.floor(t / 1100) % 2) { R(c, 568, 1, 2, 2, "#ff4a4a"); }
  // red light pulses with the kick drum through the wall
  const k = Math.floor(t / 454) % 2 === 0 && (t % 454) < 160;
  if (k) { R(c, 482, 56, 8, 8, "#ffb0b0"); }
  // smoke
  const sy = Math.floor(t / 60) % 12;
  P(c, 400, 224 - sy, "#8a86a8");
}
function light(S) {
  return {
    ambient: "#3a3262",
    lights: [
      { x: 486, y: 60, r: 220, color: "#ff2a3a", steps: 4, sy: 1.1, power: 0.9, rim: true },
      { x: 136, y: 90, r: 160, color: "#ff9a3a", steps: 4, sy: 1.15, power: 0.8 },
      { x: 584, y: 90, r: 160, color: "#ff9a3a", steps: 4, sy: 1.15, power: 0.75 },
      { x: 320, y: 30, r: 200, color: "#7a8ae0", steps: 2, power: 0.3 }
    ],
    halos: [{ x: 486, y: 60, r: 24, color: "#ff3a3a", strength: 1 }], rims: [{ x: 486, y: 90, r: 260, color: "#ff2a3a" }, { x: 130, y: 90, r: 200, color: "#ff9a3a" }], shadow: 0.55
  };
}

/* ------------------------------------------------------------------ Sven's quiz */
const rec = id => RP.rec(id);
const QUIZ = [
  { flag: "a4_q1", q: id => "Basic Channel. \"" + rec(id).title + ".\" The catalog number.", rec: "basic_channel_phylyps_trak", opts: ["BC 11", "BC 02", "BC 20"], ok: 1,
    right: "@a4_sven BC 02. October 1993. Moritz von Oswald and Mark Ernestus. Hm.", wrong: "@a4_sven Nein. Basic Channel is the label of Moritz von Oswald and Mark Ernestus. Read the sleeve. Again." },
  { flag: "a4_q2", q: id => "Robert Hood. \"" + rec(id).title + ".\" 1994. Which label?", rec: "robert_hood_minimal_nation", opts: ["Tresor", "Planet E", "Axis"], ok: 2,
    right: "@a4_sven Axis. Jeff Mills' label. A double twelve-inch. Good.", wrong: "@a4_sven Nein. It's on Axis. Jeff Mills' label. Everyone knows." },
  { flag: "a4_q3", q: id => "Ben Klock. \"" + rec(id).title + ".\" 2009. Which label?", rec: "ben_klock_one", opts: ["Playhouse", "Mille Plateaux", "Ostgut Ton"], ok: 2,
    right: "@a4_sven Ostgut Ton. A double LP. Hm. You read.", wrong: "@a4_sven Nein. Ostgut Ton. Is it so hard? Read your sleeves." }
];
async function runQuiz(S) {
  for (const Q of QUIZ) {
    if (S[Q.flag] || S.f[Q.flag]) continue;
    for (;;) {
      const text = Q.q(Q.rec);
      await RP.say(text, "a4_sven");
      const i = await RP.choose(Q.opts);
      if (i === Q.ok) { S.f[Q.flag] = true; await RP.lines([Q.opts[i] + ".", Q.right]); break; }
      await RP.lines([Q.opts[i] + "?", Q.wrong]);
      S.f.a4_wrongs = (S.f.a4_wrongs || 0) + 1;
      if (S.f.a4_wrongs >= 3 && S.f.a4_wrongs % 3 === 0) await RP.say("(The crate in my phone has a fact for every record. I should read the sleeve.)");
    }
  }
}
async function svenTalk(S) {
  if (S.f.a4_quizDone) { await RP.lines(["@a4_sven (a single nod toward the door) Go.", "@a4_sven And you: don't smile. It scares the regulars."]); return; }
  if (!S.f.a4_svenIntro) {
    S.f.a4_svenIntro = true;
    await RP.lines(["Hi. I'm playing tonight. " + A4.dj(S) + ". From New York.", "@a4_sven (looks at the clipboard) \"" + A4.misspell(A4.dj(S)) + ".\" That is not what it says.", "It's what it means.",
      "@a4_sven Everyone is the DJ. Everyone is on the list. A man named Marcus has called this door eleven times. He says he is \"plus three.\" Plus three what?",
      "@a4_sven I told him: nothing. Not him, not the three.", "(Marcus: always plus three. Even from three thousand miles.)"]);
    if (S.f.a4_late > 0) await RP.lines(["@a4_sven And you are late. The DJ before you is almost done. Katja is not a patient woman.", "I know. The train..."]);
    await RP.lines(["@a4_sven Bag. Open. ...Records. Real ones.", "@a4_sven Fine. I'll ask three questions. If you know the records, you go in. If you don't, you stand here and think about it.", "@a4_sven Sticker on the phone."]);
    await RP.say("(He puts a sticker over my camera lens with the surgical calm of a man who's done it ten thousand times.)");
  } else {
    await RP.lines(["@a4_sven (he doesn't blink) Again?", "I'd like to try again."]);
  }
  await runQuiz(S);
  if (S.f.a4_q1 && S.f.a4_q2 && S.f.a4_q3) {
    S.f.a4_quizDone = true; RP.give("a4_band"); RP.sfx("success");
    await RP.lines(["@a4_sven ...Fine. You know records.", "@a4_sven Wristband. Left wrist. Not the right. The right is for people who ask for the bathroom.",
      "@a4_sven Don't smile in there. Don't take photos. Don't say \"amazing.\" Say nothing. Be a record.", "A record. Got it. Silent, round, and a little scratched."]);
    RP.setClock("SUN 1:46 AM");
  }
}

/* ------------------------------------------------------------------ the room */
RP.room({
  id: "a4_halle_door", act: 4, name: "Halle Neun, the door",
  paint, draw, light, ambience: "club_through_wall", music: null,
  walk: [[8, 204], [600, 204], [630, 250], [8, 250]],
  start: { x: 60, y: 236, face: "right" },
  fx: [{ type: "rain", width: W, floor: 252, count: 100 }, { type: "steam", x: 381, y: 120, rise: 40, size: 9, drift: 10, color: "#c8c0e0", count: 8 }],
  actors: [
    { id: "a4_sven", char: "a4_sven", x: 420, y: 214, face: "left", act: "stand", name: "Sven", noTurn: false },
    { crowd: { n: 9, rect: [150, 206, 230, 40], seed: 31, face: "right", act: "stand", scale: 0.96, opts: { override: { top: { style: "jacket", color: "#17131f", color2: "#2a2836" }, bottom: { style: "pants", color: "#17131f" } } } } },
    { crowd: { n: 5, rect: [30, 218, 110, 30], seed: 77, face: "right", act: "stand", scale: 0.98, opts: { override: { top: { style: "tee", color: "#17131f" }, bottom: { style: "cargo", color: "#2a2836" } } } } }
  ],
  sprites: [
    { y: 206, draw: c => sprSignKeine(c, 396, 130) },
    { y: 230, draw: c => sprBinDoor(c, 580, 190) },
    { y: 238, draw: c => sprAshtray(c, 372, 210) }
  ],
  self: { look: "Tour bomber, headphones, a record bag, and a face that screams \"tourist\" despite my best efforts. Black clothes would've been smarter.", talk: "I'm practicing my \"I belong here\" face. It looks like constipation." },
  hotspots: [
    { id: "a4_sven", name: "Sven", look: "Sven, the door. Shaved head, grey beard, long black coat, sunglasses at 2 a.m. He looks at you the way a cliff looks at the sea.",
      talk: S => svenTalk(S),
      give: (S, item) => item === "a4_bag" ? "Sven's eyes narrow at the bag. \"Open.\" Talking to him would be faster." : item === "a4_band" ? "He's the one who gave it. He'd know it if I wore it wrong." : "\"Nein,\" says Sven. He's said it so many times it's a state of being.",
      pickup: "I'd like to keep my arms. And my plans.", push: "He's roughly the size of the building. I'm roughly the size of the problem.", pull: "I'm not pulling Sven. Sven pulls you." },
    { id: "a4_door", name: "steel door", r: [430, 66, 120, 114], z: 25, walk: [490, 214, "back"],
      look: "A heavy steel door with a red cage lamp over it and a stenciled \"H9.\" Behind it, a bass drum so deep I feel it in my fillings.",
      exit: S => S.f.a4_quizDone ? { room: "a4_halle", x: 60, y: 238, face: "right" } : "Sven's in the way. He isn't opening it for me until he's heard a few things about records.",
      use: "I'd knock. Sven's looking at me like knocking is a form of speech.", push: "It's a steel door. And Sven's a steel Sven." },
    { id: "a4_queue", name: "queue", rects: [[28, 190, 360, 62]], z: 20, walk: [250, 244, "back"], look: "The line: about fifteen people in black, very quiet, extremely patient. A bearded man's been standing so still I think he's a statue.", talk: "They look at me, then back at the door. Nobody's here to chat. They're here to wait.", push: "Cutting the queue in Berlin isn't a crime. It's worse. It's a social death.", use: "I take my place at the back. Then I realize I'm DJing, and take it back." },
    { id: "a4_stencil", name: "stencilled sign", r: [56, 20, 480, 40], z: 15, walk: [260, 214, "back"], look: "HALLE NEUN, in giant white stencil, ten meters wide. The N is dripping. I assume it's intentional.", pickup: "It's the building. I'd need a different bag." },
    { id: "a4_signk", name: "no-photo sign", r: [396, 130, 30, 34], z: 35, walk: [400, 214, "back"], look: "KEINE FOTOS: no photos. A camera in a red cross. They put stickers on phones' lenses at the door. A whole nation of lenses taped shut.", pickup: "If I take it, Sven will notice. Sven notices everything." },
    { id: "a4_lamp", name: "red lamp", r: [478, 50, 16, 18], z: 40, walk: [490, 214, "back"], look: "A red cage lamp over the door. It's the color of the club. It's pulsing in time with the kick drum, like the building has a heartbeat." },
    { id: "a4_windows", name: "bricked windows", rects: [[38, 76, 40, 66], [138, 76, 40, 66], [278, 76, 40, 66], [558, 76, 40, 66]], z: 10, walk: [260, 214, "back"], look: "Tall arched windows, bricked in. Light leaks around the edges: red, blue, a pulse of white. The building's trying to say something." },
    { id: "a4_vent", name: "vent", r: [366, 116, 34, 22], z: 30, walk: [381, 214, "back"], look: "A rattling steel vent, steaming. Smells like warm cabbage and distant bass." },
    { id: "a4_arrow", name: "floor stencil", r: [14, 186, 90, 24], z: 8, floor: true, look: "\"SCHLANGE\" stenciled on the pavement with an arrow: the queue. In German, even the lines have a name." },
    { id: "a4_bin", name: "trash can", r: [578, 188, 34, 44], z: 40, walk: [596, 240, "left"], look: "A battered bin by the wall. A sticker says \"FIGHT DANCE. DANCE FIGHT.\" Nothing else in Berlin comes without a manifesto." },
    { id: "a4_ashtray", name: "ashtray pole", r: [370, 208, 14, 40], z: 45, walk: [356, 244, "right"], look: "An ashtray on a pole. Three smoldering butts, one proud stub and a lipstick-stained filter. A tiny city of regret." },
    { id: "a4_back", name: "back to the street", r: [0, 170, 22, 84], z: 12, walk: [20, 236, "left"], look: "The way back to the arch. The street. The Späti. The world of people who don't need a door.", exit: { room: "a4_berlin_street", x: 800, y: 232, face: "left" } },
    { id: "a4_floor", name: "ground", r: [8, 204, 620, 46], z: 3, floor: true, look: "Wet asphalt in the red glow. The puddles hold little red doors." }
  ],
  combos: [
    ["a4_bag", "a4_sven", "Sven's eyes narrow at the bag. \"Open.\" Talking to him would be faster."],
    ["a4_band", "a4_sven", "He gave me this. If I give it back, I lose the club. And a wrist."],
    ["a4_band", "a4_door", "The band's on my wrist. The door wants my feet."],
    ["phone", "a4_sven", "\"No phone,\" Sven says, in a tone that implies he's never owned one, and never will."],
    ["phone", "a4_door", "The sticker on my camera says it all. KEINE FOTOS. I can't even photograph my own shame."],
    ["a4_passport", "a4_sven", "\"I don't need a passport,\" Sven says. \"I need records.\""],
    ["a4_white", "a4_sven", "Sven stares at the white label. \"No label. No name. No.\" He's probably right. He's also a bouncer, not a critic."],
    ["a4_jerky", "a4_sven", "Sven looks at the jerky. Then at me. Nobody's ever tried to bribe him with jerky and lived to tell it."]
  ],
  enter: async (S, from) => {
    if (!S.f.a4_doorIntro) {
      S.f.a4_doorIntro = true;
      await RP.lines(["Halle Neun. A power station, a long time ago. A concrete cathedral with a door guarded by a man in sunglasses at 2 a.m.", "The queue is silent. Not a sound but rain and, through the wall, a kick drum slow enough to be a heartbeat."]);
    }
  }
});
})();
