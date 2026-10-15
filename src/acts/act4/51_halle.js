/* Act 4 — a4_halle: inside Halle Neun. Concrete, haze, red and blue light. A cameo (Jeff Mills) is in the booth before you.
   Katja runs the room. The set: beat.Match (the handover, no sync, CDJ-3000s) then crowd.Read (techno floor).
   Flags: a4_katjaTalked a4_handover a4_set a4_setDone a4_strobe a4_haleIntro a4_paid */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u, PK = RP.PK, A4 = RP.a4;
const { R, P, ell, poly, line, txt, txtW, mulberry, mix } = U;
const W = 640;

const sprBoothFront = A4.spr(274, 92, c => { const em = PK.djBooth(c, 2, 2, 270, { gear: "cdj", mixer: "4ch", tier: 3, lights: true, logo: "H9" }); });
const sprTurntable = A4.spr(86, 72, c => { PK.turntable(c, 4, 4, { model: "technics", label: "#39d0ff", seed: 3 }); R(c, 4, 36, 74, 4, "#2a2838"); R(c, 4, 36, 74, 1, "#6a667c"); R(c, 10, 40, 5, 28, "#2a2838"); R(c, 66, 40, 5, 28, "#2a2838"); R(c, 6, 66, 66, 3, "#14121c"); });
const sprExit = A4.spr(40, 80, c => { R(c, 0, 8, 40, 72, "#2a2838"); R(c, 3, 11, 34, 69, "#4a4a62"); PK.gradV(c, 3, 11, 34, 69, ["#6a6a84", "#3a3a50"], { dither: 1 }); R(c, 19, 11, 2, 69, "#14121c"); R(c, 10, 44, 6, 3, "#c8c4d8"); R(c, 24, 44, 6, 3, "#c8c4d8"); R(c, 8, 0, 24, 8, "#0a2a1a"); txt(c, "EXIT", 12, 1, "#5cff9a"); });

/* ------------------------------------------------------------------ paint */
function paint(c, S) {
  const em = []; const E = a => { if (a && a.length) for (const r of a) em.push(r); return a; };
  // hall: dark concrete, tall, with trusses and bricked windows
  PK.concrete(c, 0, 0, W, 180, { base: "#3a3850", panelH: 50, seed: 4 });
  PK.util.dshade(c, 0, 0, W, 40, "#000000", (px, py) => 1 - py / 40, 0.5);
  [[34, 30], [586, 30]].forEach(([x, y]) => { R(c, x - 2, y - 2, 24, 92, "#2a2638"); R(c, x, y, 20, 88, "#0e0a1c"); ell(c, x + 10, y + 6, 10, 8, "#0e0a1c"); for (let yy = y + 6; yy < y + 86; yy += 6) R(c, x, yy, 20, 1, "#14101c"); });
  // LED wall behind the booth, dim
  E(PK.ledWall(c, 232, 18, 176, 70, { pattern: "rain", palette: ["#ff2a3a", "#3a6aff", "#a05cff", "#ffffff"], seed: 7, panel: 24 }));
  PK.util.dshade(c, 232, 18, 176, 70, "#000000", (px, py) => 0.6, 0.4);
  // speaker stacks
  PK.speakerStack(c, 28, 80, 56, 100, { color: "#1a1822" }); PK.speakerStack(c, 556, 80, 56, 100, { color: "#1a1822" });
  PK.speakerStack(c, 98, 108, 40, 72, { color: "#1a1822" }); PK.speakerStack(c, 502, 108, 40, 72, { color: "#1a1822" });
  // truss with red and blue lights
  const t = PK.truss(c, 40, 6, 560, 12, { lights: ["#ff2a3a", "#3a6aff", "#ff2a3a", "#3a6aff", "#ff2a3a", "#3a6aff", "#ff2a3a", "#3a6aff"] });
  E(t);
  t.lights.forEach((l, i) => E(PK.lightCone(c, l.x, l.y, 6, 70 + (i % 3) * 30, 140, l.color, { alpha: 0.34 })));
  PK.truss(c, 120, 44, 400, 10, { color: "#6a6880" });
  // pillars with pipes
  [[10, 0], [624, 0]].forEach(([x]) => { PK.util.cylV(c, x - 4, 0, 14, 178, "#5a5870"); });
  PK.pipe(c, 150, 20, 120, { dir: "h", r: 3 }); PK.pipe(c, 380, 28, 120, { dir: "h", r: 3 });
  // floor
  PK.concrete(c, 0, 176, W, 80, { base: "#3a384e", panelH: 70, seed: 5 });
  PK.util.dshade(c, 0, 176, W, 80, "#000000", (px, py) => 0.35, 0.3);
  // bar on the left
  E(PK.bar(c, 6, 90, 112, 84, { stools: 2 }));
  txt(c, "BAR", 18, 82, "#ff2a3a"); em.push([18, 82, 12, 5]);
  // plinth for the booth and a turntable stand
  R(c, 168, 168, 304, 8, "#4a4860"); R(c, 168, 168, 304, 1, "#8a88a8"); R(c, 168, 175, 304, 1, "#14121c");
  // crowd silhouettes behind the dancers
  E(PK.crowdSilhouettes(c, 0, 178, W, 78, { seed: 6, rim: ["#ff2a3a", "#3a6aff"], rows: 4, density: 0.82, colors: ["#241a3c", "#150e28", "#08040f"] }));
  return em;
}
function draw(c, S, t) {
  // CDJ-3000 jog rings pulse in time (132 bpm ~ 454 ms)
  const k = Math.floor(t / 227) % 2;
  P(c, 288 + k, 118, "#ffffff");
}
function light(S) {
  return {
    ambient: "#1a1030",
    lights: [
      { x: 80, y: 30, r: 300, color: "#ff2a3a", steps: 4, sy: 1.1, power: 0.85, rim: true },
      { x: 560, y: 30, r: 300, color: "#3a6aff", steps: 4, sy: 1.1, power: 0.85, rim: true },
      { x: 320, y: 96, r: 150, color: "#ffe0c0", steps: 4, power: 0.65 },
      { box: [232, 18, 176, 70], r: 90, color: "#a05cff", steps: 3, power: 0.55 },
      { x: 320, y: 230, r: 260, color: "#7a4ae0", steps: 3, sy: 2, power: 0.35 }
    ],
    rims: [{ x: 80, y: 90, r: 320, color: "#ff2a3a" }, { x: 560, y: 90, r: 320, color: "#3a6aff" }], key: { x: 320, y: 40 }, shadow: 0.6
  };
}

/* ------------------------------------------------------------------ the set */
const techno = S => A4.TECHNO.filter(id => S.records.includes(id));
async function katjaTalk(S) {
  if (S.f.a4_setDone) { await RP.lines(["@a4_katja You played. They stayed. That's all I ask.", "@a4_katja Come back next year. Maybe sooner. I'll pretend I never said that."]); return; }
  S.f.a4_katjaTalked = true;
  if (!S.f.a4_katjaIntro) {
    S.f.a4_katjaIntro = true;
    await RP.lines(["@a4_katja You are the American. " + (S.f.a4_late > 0 ? "You are late. Forty minutes of tension." : "You are on time. Almost no one is on time."), "@a4_katja Katja. I run the room. Sven passed you. He passes nobody. I'm not sure whether to be impressed or worried.",
      "@a4_katja The CDJs are 3000s. There's one Technics for the vinyl people. No sync. Sven's rule.", "@a4_katja Jeff hands over to you in about six minutes."]);
  }
  await RP.convo([
    { text: "What's the crowd like?", when: S => !S.f.a4_katjaCrowd, run: async () => { S.f.a4_katjaCrowd = true; await RP.lines(["@a4_katja Four hours of mild suffering. They're standing, they're dressed in black, they're not here to hear a hit.", "@a4_katja Build. Don't peak early. Start low, climb, and when you drop the big one, make them forget they ever wanted it."]); } },
    { text: "Any rules?", when: S => !S.f.a4_katjaRules, run: async () => { S.f.a4_katjaRules = true; await RP.lines(["@a4_katja No phones. No sync. No smiling at the crowd. No \"Where's the bathroom?\" (it's on the left.)", "@a4_katja And if you play something they know, they'll hate it. If you play something they don't, they'll worship it. That's Berlin."]); } },
    { text: "I'm ready.", run: async () => { await startSet(S); return "end"; } },
    { text: "Give me a minute.", end: true }
  ]);
}
async function startSet(S) {
  if (S.f.a4_setDone) { await RP.say("I've done my set. If I go again, they'll find me and love me. It's a risk."); return; }
  if (!S.f.a4_katjaTalked) { await RP.lines(["Where do you think you're going?", "@a4_katja Stop. Talk to me first. Everything goes through me."]); return; }
  if (!RP.has("a4_bag")) { await RP.say("I can't play without my records. That's... the whole thing."); return; }
  RP.setClock("SUN 2:00 AM");
  await RP.walkTo(380, 206, "back");
  RP.place("kid", 384, 168, "front"); RP.actor("kid").act = "dj";
  RP.place("a4_jeff", 296, 168, "front"); RP.actor("a4_jeff").act = "dj";
  await RP.lines(["I step behind the booth. Two CDJ-3000s, a mixer the size of a dinner table, and a technician's hush.", "Jeff Mills nods at the right deck. I nod back. It's the entire conversation. It's perfect.",
    "(The CDJ-3000 has a nine-inch touchscreen and no CD slot. The CD jockey has no CDs. The J is doing a lot of the work.)"]);
  S.f.a4_strobe = true;
  RP.setMusic(null);
  // handover: beat.Match at higher difficulty, no sync
  const bm = await A4.tryMg("beatMatch", { a: "basic_channel_phylyps_trak", b: "ben_klock_one", difficulty: 3, story: true }, S, {
    fallbackScore: 70, onFail: async (r, n) => { await RP.lines(["@a4_katja (hissing) Again. They can hear it.", n === 1 ? "The beats clash like two elevator doors." : "Nope. Again. Breathe. Listen. Beat. Match."]); }
  });
  S.f.a4_handover = true;
  await RP.lines(["The two kicks lock. The room doesn't notice. That's the whole trick: nobody notices unless you get it wrong.",
    "Jeff Mills glances at the decks, one headphone cup lifted. A single nod.", "@a4_jeff Nice record.", "I'm going to have that tattooed. In a very small font. On the inside of my skull."]);
  RP.actor("a4_jeff").act = "stand"; await RP.npcWalk("a4_jeff", 238, 176, "right");
  // the techno floor
  S.f.a4_set = true;
  const pool = techno(S);
  const cr = await A4.tryMg("crowdRead", { crowd: "techno", records: pool.length ? pool : A4.TECHNO, rounds: 5, goal: 4, difficulty: 3, venue: "Halle Neun" }, S, {
    fallbackScore: 74, onFail: async (r, n) => { await RP.lines(["@a4_katja (low) They're drifting. Bring them back. Slower. Build.", "Okay. Breathe. From the top: low, then climb."]); }
  });
  S.f.a4_strobe = false;
  const sc = cr.score != null ? cr.score : 70;
  S.f.a4_setScore = sc; S.f.a4_played = cr.played || [];
  RP.sfx("cheer");
  await RP.lines([sc >= 70 ? "The room doesn't scream. It exhales. Eight hundred people in black let out one breath at the same time, and that's applause." : "It's... fine. The room nods. In Berlin, \"fine\" is a standing ovation with the sound off.",
    "@a4_katja (arms crossed, a tiny smile that she'll deny) Good.", "@a4_jeff (from the side of the booth, one nod)"]);
  RP.actor("kid").act = "stand"; RP.place("kid", 380, 214, "front"); RP.actor("a4_jeff").act = "stand";
  S.f.a4_setDone = true;
  RP.followers(sc >= 70 ? 4200 : 1800);
  const fee = Math.max(0, (S.f.a4_fee || 1800) - (S.f.a4_late > 0 ? 150 : 0));
  await RP.lines(["@a4_katja Your fee. Cash. Count it. We count everything here.", S.f.a4_late > 0 ? "(Minus $150 for being late. It's in a footnote. Germans love a footnote.)" : "It's all there. Every note. Crisp as a pretzel."]);
  RP.money(fee); S.f.a4_paid = true;
  RP.setClock("SUN 4:05 AM");
  A4.setHaleMusic(true);
  await RP.lines(["Set done, fee in, bag with me. Now: the hotel. Ingrid said it's near the arch. A real bed. A real pillow.", "I leave through the steel door at the right. It's raining. It's glorious."]);
}
A4.setHaleMusic = on => { try { RP.setMusic(on ? { genre: "techno", bpm: 132, energy: 3, volume: 0.35, filter: ["lowpass", 900] } : null); } catch (e) { /* ignore */ } };

/* ------------------------------------------------------------------ the room */
RP.room({
  id: "a4_halle", act: 4, name: "Halle Neun",
  paint, draw, light, ambience: null,
  music: { genre: "techno", bpm: 132, energy: 4, volume: 0.35, filter: ["lowpass", 1200] },
  walk: [[8, 214], [600, 214], [630, 250], [8, 250]],
  start: { x: 60, y: 238, face: "right" },
  fx: [
    { type: "haze", rect: [0, 150, 640, 70], color: "#b8a8ff", density: 4, slow: 70 },
    { type: "haze", rect: [0, 40, 640, 60], color: "#ff9ab8", density: 2, slow: 110 },
    { type: "beams", origins: [[120, 20], [260, 20], [380, 20], [520, 20]], colors: ["#ff2a3a", "#3a6aff"], base: Math.PI / 2, swing: 0.55, len: 230, width: 14, alpha: 0.13, period: 1800 },
    { type: "strobe", period: 2600, flash: 55, alpha: 0.16, color: "#ffffff", on: () => !!RP.state.f.a4_strobe }
  ],
  actors: [
    { id: "a4_jeff", char: "dj_jeff_mills", x: 296, y: 168, face: "front", act: "dj", name: "Jeff Mills" },
    { id: "a4_katja", char: "a4_katja", x: 494, y: 214, face: "left", act: "stand", name: "Katja" },
    { crowd: { n: 16, rect: [120, 196, 400, 40], seed: 21, face: "back", act: "dance", scale: 0.95, opts: { override: { top: { style: "tee", color: "#14121a" }, bottom: { style: "cargo", color: "#14121a" } } } } },
    { crowd: { n: 10, rect: [30, 204, 580, 36], seed: 52, face: "back", act: "dance", scale: 0.98, opts: { override: { top: { style: "jacket", color: "#1a1822", color2: "#2a2836" }, bottom: { style: "pants", color: "#17131f" } } } } }
  ],
  sprites: [
    { y: 176, draw: c => sprBoothFront(c, 183, 94) },
    { y: 150, draw: c => sprTurntable(c, 482, 100) },
    { y: 252, draw: c => sprExit(c, 592, 150) }
  ],
  self: { look: "Tour bomber, headphones, a wristband, and the quiet panic of someone who's about to follow a legend. At 2 a.m. In a power station.", talk: "\"You're doing great.\" Nope. The bass is too loud for that to count." },
  hotspots: [
    { id: "a4_jeff", name: "Jeff Mills", look: S => S.f.a4_setDone ? "Jeff Mills, a hooded figure with one headphone cup up, and one nod to me. It's all I needed." : "A DJ behind the left deck, hood up, headphones on one ear, completely locked in. Jeff Mills is playing before me, and I'm trying not to stare.",
      talk: S => S.f.a4_setDone ? "He nods once, eyes on the room. That's the whole conversation. I'm okay with it." : RP.lines(["I'm a big fan. I... really...", "(He glances over, nods once, and goes back to the decks.)", "That counts as a full conversation. I'm putting it on my résumé."]),
      give: "He's mid-set. Nobody hands a DJ a record mid-set. Unless it's love.", pickup: "I'd like to keep my arms. And his headphones.", push: "No. Never push a DJ mid-set." },
    { id: "a4_katja", name: "Katja", look: "Katja, who runs the room. Black jacket, ponytail, a clipboard and a headset she doesn't use. She looks at me like she's computing a very small, very exact number.",
      talk: S => katjaTalk(S), give: "She doesn't take things. She hands them out.", pickup: "She'd have me escorted out. By Sven.", push: "I'd rather push my luck. And I'm about to." },
    { id: "a4_booth", name: "DJ booth", r: [183, 94, 274, 92], z: 40, walk: [330, 218, "back"],
      look: "A raised booth: two Pioneer DJ CDJ-3000s and a four-channel mixer, a Technics for the vinyl people. A red scrim says H9. I'm about to stand behind that.",
      use: S => startSet(S), open: S => startSet(S), push: "I'd rather push a button than the booth.", pickup: "It's bolted to the concrete. Or the concrete's bolted to it." },
    { id: "a4_cdjs", name: "Pioneer DJ CDJ-3000", rects: [[196, 94, 64, 34], [380, 94, 64, 34]], z: 55, walk: [330, 218, "back"],
      look: "Pioneer DJ CDJ-3000s: nine-inch touchscreens and no CD slot. A CD jockey with no CDs. The J is doing a lot of work.", use: S => startSet(S), push: S => startSet(S), pickup: "Each costs more than my rent for a year. I'm not touching one until I'm allowed." },
    { id: "a4_turntable", name: "Technics turntable", r: [482, 100, 86, 66], z: 40, walk: [520, 220, "back"],
      look: "A matte-black Technics. Same kind as mine at home. The one familiar face in the room. It has a record on it from 1996.", use: "The vinyl heads' deck. It's a Technics. I play it later, if the night allows.", pickup: "It's a Technics. It weighs about as much as the club." },
    { id: "a4_ledwall", name: "LED wall", r: [232, 18, 176, 70], z: 15, walk: [330, 218, "back"], look: "A wall of red and blue light, patterned like rain falling upward. It's hypnotic. It's also eating my retinas.", pickup: "It's a wall of light. I'd need a very large pocket." },
    { id: "a4_stacks", name: "speakers", rects: [[28, 80, 58, 100], [96, 106, 44, 74], [500, 106, 44, 74], [554, 80, 58, 100]], z: 35, walk: [320, 230, "back"], look: "Black PA stacks, floor to ceiling. The bass comes out of them like weather. I can feel it in my molars.", use: "They don't have an off switch. Or a morality.", pickup: "Four tons. No." },
    { id: "a4_bar", name: "bar", r: [6, 90, 112, 84], z: 30, walk: [100, 230, "back"], look: "A little bar: beer, water, one cocktail and a sign: \"WE DON'T DO COCKTAILS.\" Everybody's got a bottle and a thousand-yard stare.", use: "I'll have water. ...They look at me as if I asked for a mojito.", talk: "The bartender nods without looking. In Berlin, that's a conversation." },
    { id: "a4_truss", name: "light rig", r: [40, 4, 560, 60], z: 10, walk: [320, 226, "back"], look: "A truss of lights over the dance floor, red and blue. They sweep in a slow hypnotic pattern. I'm pretty sure I'm being watched by every one of them." },
    { id: "a4_crowd", name: "crowd", r: [20, 190, 600, 56], z: 6, walk: [320, 246, "back"], look: "Eight hundred people in black clothing, dancing like it's a job and a joy. Nobody smiles. Everyone means it.", talk: "I try to talk to a dancer. He points at his ear. He points at the speaker. He goes back to dancing.", push: "I'm not shoving through a Berlin techno crowd. They'd absorb me." },
    { id: "a4_exit", name: "steel door", r: [592, 150, 44, 82], z: 20, walk: [580, 240, "right"],
      look: "The steel door back to the street, with a green EXIT sign. It's the only part of the room that's even slightly quiet.",
      exit: S => S.f.a4_setDone ? { room: "a4_berlin_street", x: 780, y: 232, face: "left" } : "Not yet. I haven't played. Leaving a club before your set is how you become a story. The wrong kind." },
    { id: "a4_floor", name: "floor", r: [8, 214, 620, 38], z: 3, floor: true, look: "Concrete, wet from smoke, patterned with red and blue. Every inch of it has been danced on." }
  ],
  combos: [
    ["a4_bag", "a4_booth", S => startSet(RP.state)],
    ["a4_bag", "a4_cdjs", S => startSet(RP.state)],
    ["a4_band", "a4_katja", "She's already seen it. She sees everything. It's in her job description."],
    ["a4_white", "a4_cdjs", "A white label on a CDJ-3000 is a crime against nine-inch touchscreens."],
    ["a4_white", "a4_turntable", "NYC 93, my own remix, on a Berlin Technics at 2 a.m.? ...Tempting. Not tonight. Tonight's about the records Sven approved."],
    ["a4_white", "a4_katja", "She looks at the white label. \"No title?\" It has a title. It's \"NYC 93.\" It's in marker. It's enough."]
  ],
  enter: async (S, from) => {
    if (!S.f.a4_haleIntro) {
      S.f.a4_haleIntro = true; RP.setClock("SUN 1:55 AM");
      await RP.lines(["Halle Neun. A power station, retired. A hall with a ceiling like a cathedral, and a floor full of people dancing like they're having a disagreement with gravity.",
        "Red on the left. Blue on the right. A kick drum so slow it sounds like the building is thinking. And Katja, striding toward me with a clipboard."]);
      await katjaTalk(S);
    }
  }
});
})();
