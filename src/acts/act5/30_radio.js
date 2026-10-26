/* Act 5 — a5_radio: Radio Harbor 88.1 (fictional), Midtown. Friday 10 AM. The interview with Dana Okafor.
   Four questions (score 0-8), call-ins from Ray, Marcus, Eddie and Dante ("next week" goes out live), then a record on air. */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u, PK = RP.PK, A5 = RP.a5, art = A5.art;
const { R, P, ell, line, poly, bayer, mulberry, mix, txt, txtC, txtW, clamp } = U;
const K = U.ramp;
const HL = (c, x, y, w, col) => R(c, x, y, w, 1, col), VL = (c, x, y, h, col) => R(c, x, y, 1, h, col);
const onAir = S => !!S.f.a5_onAir;

function paint(c, S) {
  const em = [], on = onAir(S);
  PK.plaster(c, 0, 0, 640, 170, { base: "#2a3248", seed: 41, patches: 0, stains: 0, cracks: 0 });
  /* acoustic foam bands: slate blue and burnt orange, 70s broadcast */
  art.foam(c, 0, 14, 640, 60, { a: "#2f4a6a", b: "#28405c", hi: "#4a6e98", hi2: "#3a5a82", lo: "#121c2c" });
  art.foam(c, 0, 74, 340, 48, { a: "#b2562a", b: "#9a4624", hi: "#d87a44", hi2: "#c0642e", lo: "#3a1a0e" });
  art.foam(c, 600, 74, 40, 48, { a: "#b2562a", b: "#9a4624", hi: "#d87a44", hi2: "#c0642e", lo: "#3a1a0e" });
  /* wood slat wainscot */
  R(c, 0, 122, 640, 48, "#5a3a28"); for (let x = 0; x < 640; x += 6) { VL(c, x, 122, 48, "#3a2418"); VL(c, x + 1, 122, 48, "#7a5038"); VL(c, x + 3, 122, 48, "#4a2e20"); }
  R(c, 0, 120, 640, 3, "#c8a860"); HL(c, 0, 120, 640, "#fff0b0"); HL(c, 0, 122, 640, "#6a4a1a");
  R(c, 0, 163, 640, 7, "#2a1a14"); HL(c, 0, 163, 640, "#7a5038");
  PK.carpet(c, 0, 170, 640, 86, { pattern: "plain", base: "#5a3428" });
  /* the big glass window into the control room */
  const wx = 384, wy = 30, ww = 212, wh = 86;
  R(c, wx - 5, wy - 5, ww + 10, wh + 10, "#3a2418"); HL(c, wx - 5, wy - 5, ww + 10, "#9a6a44"); VL(c, wx - 5, wy - 5, wh + 10, "#7a5038"); VL(c, wx + ww + 4, wy - 5, wh + 10, "#1c120c"); HL(c, wx - 5, wy + wh + 4, ww + 10, "#1c120c");
  R(c, wx, wy, ww, wh, "#0e2a34"); PK.gradV(c, wx, wy, ww, wh, ["#1a5a6a", "#12404e", "#0c2a34"], { dither: 1 });
  /* inside the booth: a lit console, the engineer's silhouette, a fader wall */
  R(c, wx, wy + wh - 22, ww, 22, "#1c1a24"); HL(c, wx, wy + wh - 22, ww, "#6a667c");
  for (let i = 0; i < 28; i++) { const fx = wx + 6 + i * 7, lv = 2 + ((i * 5) % 11); R(c, fx, wy + wh - 20, 3, 14, "#0a0810"); R(c, fx - 1, wy + wh - 18 + lv, 5, 3, "#cfcbe0"); P(c, fx + 1, wy + wh - 22, i % 5 === 0 ? "#ff3a3a" : "#3fd07a"); em.push([fx + 1, wy + wh - 22, 1, 1]); }
  PK.util.clip(c, wx, wy, ww, wh - 20, () => RP.chars.draw(c, { id: "a5_tech1", x: wx + 140, y: wy + wh - 8, face: "front", act: "sit", frame: 0, scale: 0.8, noShadow: true }, { lx: -0.4, rim: { color: "#39d0ff", side: 1 }, shadow: 0 }));
  R(c, wx + 14, wy + 16, 50, 24, "#0a1c24"); R(c, wx + 16, wy + 18, 46, 20, "#39d0ff"); PK.gradV(c, wx + 16, wy + 18, 46, 20, ["#7ae8ff", "#39a8d8"], { dither: 1 }); em.push([wx + 16, wy + 18, 46, 20]);       /* a screen with a waveform */
  for (let i = 0; i < 40; i++) { const hh = 1 + (Math.imul(i * 31 + 5, 2654435761) >>> 28) % 8; R(c, wx + 19 + i, wy + 28 - hh, 1, hh * 2, "#0e2a3a"); }
  em.push([wx, wy, ww, wh - 22]);
  PK.util.dshade(c, wx, wy, ww, wh, "#ffffff", (px, py) => { const q = ((px - wx) * 0.8 + (py - wy) + 800) % 64; return q < 6 ? 1 : 0; }, 0.2);
  PK.util.dshade(c, wx, wy, ww, wh, "#ffffff", (px, py) => { const q = ((px - wx) * 0.8 + (py - wy) + 800 - 26) % 128; return q < 3 ? 1 : 0; }, 0.16);
  VL(c, wx + 106, wy, wh, "#3a2418"); VL(c, wx + 107, wy, wh, "#7a5038");
  /* ON AIR light box + station neon + clock */
  R(c, 288, 20, 58, 20, on ? "#a01818" : "#3a0e12"); HL(c, 288, 20, 58, on ? "#ff7a6a" : "#6a2028"); HL(c, 288, 39, 58, "#1a0608"); VL(c, 288, 20, 20, "#1a0608"); VL(c, 345, 20, 20, "#1a0608");
  R(c, 291, 23, 52, 14, on ? "#e02828" : "#4a1218"); txtC(c, "ON AIR", 317, 27, on ? "#ffe8e0" : "#7a2a30", 1, 1);
  if (on) { em.push([288, 20, 58, 20]); }
  em.push.apply(em, PK.neon(c, "88.1", 52, 30, "#ff3fa4", { scale: 3, tube: 2 }));
  em.push.apply(em, PK.neon(c, "RADIO HARBOR", 40, 58, "#39d0ff", { scale: 1, tube: 1 }));
  PK.clock(c, 232, 26, { d: 22, hour: 10, min: 0, color: "#c8a860" });
  /* records + gold plaque */
  PK.shelf(c, 40, 78, 150, 40, { items: "records", seed: 14, wood: "#6a4a3a" });
  R(c, 226, 78, 50, 32, "#1c120c"); R(c, 227, 79, 48, 30, "#c8a860"); R(c, 229, 81, 44, 26, "#1a1428"); txtC(c, "BEST IN", 251, 85, "#e8c870", 1, 1); txtC(c, "BROOKLYN", 251, 92, "#e8c870", 1, 1); txtC(c, "2019", 251, 99, "#e8c870", 1, 1);
  /* door (left) */
  PK.door(c, 2, 36, 36, 128, { metal: true, window: true, color: "#6a7480" }); R(c, 8, 52, 24, 7, "#e8e0cc"); txtC(c, "STUDIO B", 20, 53, "#1d1622", 1, 1);
  /* guest couch, plant, a gig poster or two */
  PK.couch(c, 404, 132, 132, { color: "#2a4a6a", seed: 5 });
  PK.plant(c, 556, 142, { size: 2, seed: 3 });
  /* mic cable + a coffee ring on the baseboard */
  for (let i = 0; i < 40; i++) P(c, 120 + i, 232 + Math.round(Math.sin(i / 4) * 2), "#17131f");
  return em;
}

function drawTable(c, S) {
  PK.table(c, 148, 160, 180, 76, { round: true, color: "#6a4030", top: "#9a6a44" });
  /* two boom arms with pop filters, a pair of headphones, mugs, a paper stack */
  const arm = (bx, by, hx, hy) => { line(c, bx, by, bx + (hx - bx) * 0.4, by - 22, "#8a86a0"); line(c, bx + (hx - bx) * 0.4, by - 22, hx, hy, "#8a86a0"); line(c, bx + 1, by, bx + (hx - bx) * 0.4 + 1, by - 22, "#3a364a"); R(c, bx - 2, by, 5, 3, "#3a364a"); R(c, hx - 4, hy - 4, 8, 10, "#17131f"); HL(c, hx - 4, hy - 4, 8, "#6a667c"); ell(c, hx, hy + 8, 6, 6, "#17131f"); ell(c, hx, hy + 8, 5, 5, "#2a2634"); for (let a = 0; a < 8; a++) P(c, hx - 4 + a, hy + 4 + (a % 2), "#5a566c"); };
  arm(190, 186, 214, 146); arm(286, 186, 290, 148);
  R(c, 230, 184, 14, 3, "#17131f"); ell(c, 232, 186, 3, 3, "#17131f"); ell(c, 242, 186, 3, 3, "#17131f"); line(c, 232, 183, 242, 183, "#17131f");
  R(c, 252, 178, 8, 8, "#efeaf6"); R(c, 252, 178, 8, 2, "#c8c4d8"); R(c, 260, 180, 2, 4, "#efeaf6");
  R(c, 262, 188, 16, 4, "#efe6d0"); R(c, 263, 187, 16, 4, "#f4ead0");
}
function drawCart(c, S) {
  /* a rolling cart with a turntable for live-in-studio records */
  PK.contactShadow(c, 36, 226, 76, 5, { alpha: 0.5 });
  R(c, 40, 196, 66, 4, "#8a86a0"); HL(c, 40, 196, 66, "#e8e4f4"); R(c, 40, 224, 66, 3, "#6a667c");
  R(c, 42, 196, 3, 30, "#8a86a0"); R(c, 101, 196, 3, 30, "#6a667c");
  PK.turntable(c, 46, 168, { model: "budget" });
  for (let i = 0; i < 7; i++) R(c, 50 + i * 3, 204 + (i % 2), 3, 20 - (i % 2), ["#c0302c", "#efeaf6", "#2f62b8", "#ffd23f", "#17131f", "#ff3fa4", "#39d0ff"][i]);
  ell(c, 44, 229, 3, 3, "#0c0814"); ell(c, 102, 229, 3, 3, "#0c0814");
}
function lightMap(S) {
  const on = onAir(S);
  return { ambient: "#9088b8", lights: [
    { x: 150, y: 8, r: 150, color: "#ffd8a0", steps: 4, power: 0.8 },
    { x: 300, y: 8, r: 150, color: "#ffd8a0", steps: 4, power: 0.8 },
    { x: 490, y: 78, r: 180, color: "#4ad8f0", steps: 4, power: 0.9 },
    { x: 70, y: 44, r: 110, color: "#ff3fa4", steps: 3, power: 0.6, rim: true },
    { x: 317, y: 30, r: 90, color: on ? "#ff4040" : "#552030", steps: 3, power: on ? 0.9 : 0.3, rim: on }],
    halos: [{ x: 317, y: 30, r: on ? 30 : 12, color: on ? "#ff4040" : "#552030", strength: on ? 1 : 0.4 }, { x: 150, y: 10, r: 16, color: "#ffd8a0", strength: 0.8 }, { x: 300, y: 10, r: 16, color: "#ffd8a0", strength: 0.8 }],
    key: { x: 300, y: 8 }, shadow: 0.55 };
}

/* --------------------------------------------------------------------------------------- the interview */
async function ask(S, q, opts) {
  await RP.say(q, "a5_dana");
  const i = await RP.choose(opts.map(o => o[0]));
  await RP.say(opts[i][0]);
  const r = opts[i][1];
  if (Array.isArray(r)) await RP.lines(r); else await RP.say(r, "a5_dana");
  if (opts[i][3]) opts[i][3](S);
  return opts[i][2];
}
async function interview(S) {
  if (S.f.a5_interviewDone) { await RP.say("We're off air, honey. Go be famous.", "a5_dana"); return; }
  await RP.walkTo(296, 228, "back");
  S.f.a5_onAir = true; RP.relight(); RP.sfx("click");
  await RP.lines([
    "@a5_dana Okay. Headphones. This is the mic. That's the red light. Don't touch the red button.",
    "@a5_dana We're live in five. Four. Three...",
    "@a5_dana Good morning, New York. This is Dana Okafor on Radio Harbor, 88.1. My guest is headlining Harbor Lights this Saturday night."
  ]);
  const name = A5.pName(S);
  await RP.say(name + ". Welcome. Say hi to New York.", "a5_dana");
  await RP.say("Hi, New York. I'm... " + name + ".");
  let score = 0;
  score += await ask(S, "So. A bedroom in Bushwick to the main stage at Harbor Lights. How did that happen?", [
    ["One bad decision at a time.", "That's the best answer this show has had all year. Put it on a shirt.", 2],
    ["Hard work, passion, and a dream.", "Wow. That's what the last six guests said. In the same order.", 1],
    ["A bag of oregano, mostly.", "...I'm going to pretend that's a metaphor.", 0]
  ]);
  score += await ask(S, "What do you remember about your first real crowd?", [
    ["The bartenders danced. That's how I knew.", "Bartenders never lie. They have to be nice to everyone.", 2],
    ["I forgot what a BPM was.", "Honesty. Keep that. Keep it forever.", 1],
    ["I blacked out. In a good way.", "That's not a good way. That's a way.", 0]
  ]);
  score += await ask(S, "What's in the crate for Saturday?", [
    ["A white label nobody's heard. It's my neighbor's.", ["@a5_dana A neighbor's record? Oh, that's a story. Who's the neighbor?", "Lou. 4B. If you're listening, Lou, you're on the radio.", "@a5_dana Lou in 4B: the whole of New York just heard your name. Please wave."], 2, S2 => { S2.f.a5_airLou = true; }],
    ["Classics. House, garage, disco. Stuff you feel in your ribs.", "A crate with taste. That's rare. Most crates have opinions.", 1],
    ["Dollar-bin finds and regret.", "Sell that on a tote bag.", 1]
  ]);
  score += await ask(S, "Word is Axl Vanta's camp wants your slot. Comment?", [
    ["No comment. But I'd like it noted: I have a Taula.", "Noted. In bold. With a smiley face.", 2],
    ["I respect everyone on the bill.", "Corporate. Fine. We'll allow it.", 1],
    ["Axl who?", "OH. That'll be a clip by lunch. Margo is going to scream.", 0, S2 => { S2.f.a5_axlAngry = true; }]
  ]);
  /* call-ins */
  await RP.lines(["@a5_dana We've got lines lighting up. Line two, you're on Radio Harbor."]);
  RP.sfx("ring");
  await RP.lines([
    "@a5_airRay Ray, Deep Cuts. The kid still can't beat-match without moving his lips. That's all.",
    "@a5_dana Ray, we're live. Do you want to say anything nice?",
    "@a5_airRay I said everything.",
    "(Ray hung up. That's a hint, and also an insult. I think the hint is: don't peak early.)"
  ]);
  RP.sfx("ring");
  await RP.lines([
    "@a5_airMarcus HEY. IT'S MARCUS. I'M HIS BEST FRIEND. PUT ME ON THE LIST. PLUS THIRTY.",
    "@a5_dana ...Plus thirty?",
    "He's... ambitious.",
    "@a5_airMarcus I'M ON THE LIST, RIGHT? DANA, AM I ON THE LIST?",
    "@a5_dana I'm a radio host, honey, I run a list of songs."
  ]);
  RP.sfx("ring");
  await RP.lines([
    "@a5_airEddie Eddie Two-Times! Gear! Deals! Two-time deal for every listener who calls in the next ten minutes!",
    "@a5_dana We don't do ads. Eddie. Eddie. EDDIE."
  ]);
  RP.sfx("ring");
  await RP.lines([
    "@a5_airDante Yo. It's Dante. From Nowhere. That kid's a star. First gig, bartenders danced. I'll pay him next week.",
    "@a5_dana Dante. It's Friday. \"Next week\" starts Sunday. We are live. The city heard you.",
    "@a5_airDante ...Sunday. Yeah. Sunday. I mean, a deal's a deal.",
    "@a5_dana Dante, you're on the record now."
  ]);
  S.f.a5_danteOnAir = true;
  await RP.lines(["@a5_dana Last thing. Put a record on the table. Anything you like. For the people who can't make it Saturday."]);
  const crate = ["mr_fingers_washing_machine_can_you_feel_it", "mood_ii_swing_closer", "cece_peniston_finally"].map(id => RP.rec(id));
  const ri = await RP.choose(crate.map(r => r.artist + " - " + r.title));
  const rec = crate[ri];
  S.f.a5_airRecord = rec.id;
  await RP.lines([
    "Let's do " + rec.artist + ". " + rec.title + ". " + (rec.label ? rec.label + ", " : "") + rec.year + ".",
    ri === 2 ? "@a5_dana CeCe. \"Finally.\" The title says it all. You earned that one." : ri === 1 ? "@a5_dana Mood II Swing. Garage like a warm hug." : "@a5_dana Mr. Fingers. Deep, patient, and a little sad. Lovely."
  ]);
  if (ri === 2) score = Math.min(8, score + 1);
  S.f.a5_interviewScore = score;
  S.f.a5_onAir = false; RP.relight(); RP.sfx("click");
  const gain = 1200 + score * 650;
  S.f.a5_interviewDone = true;
  RP.followers(gain);
  RP.setClock("FRI 11:10 AM");
  await RP.lines([
    "@a5_dana And we're clear. Wow. " + (score >= 6 ? "That was great radio. I'm going to cry in the booth." : score >= 3 ? "That was solid. Hair and everything." : "Well. That was... a radio segment."),
    "@a5_dana Harbor Lights, Saturday. Don't be late. I'll be in the front."
  ]);
  RP.text("MARGO (MGR)", "That was " + (score >= 6 ? "perfect" : score >= 3 ? "good" : "an experience") + ". Gate at 7 PM: wristbands + guest list. Whit wants the list by 8.", false);
  RP.unlock("a5_loc_gate");
  await RP.lines(["Gate at seven. Time for lunch. Or the subway, which is lunch for people with no time."]);
}

/* --------------------------------------------------------------------------------------- the room */
RP.room({
  id: "a5_radio", act: 5, name: "Radio Harbor 88.1",
  paint, cacheKey: S => (onAir(S) ? "on" : "off"), light: lightMap, lightKey: S => (onAir(S) ? "on" : "off"), ambience: "office",
  walk: [[14, 214], [630, 214], [630, 252], [14, 252]],
  start: { x: 70, y: 228, face: "right" },
  actors: [
    { id: "a5_dana", char: "a5_dana", x: 220, y: 204, face: "front", act: "stand", name: "Dana Okafor" }
  ],
  sprites: [
    { y: 232, draw: art.sprite((c, S) => drawTable(c, S)) },
    { y: 228, draw: art.sprite((c, S) => drawCart(c, S)) }
  ],
  hotspots: [
    { id: "a5_rdoor", name: "door to the lobby", r: [0, 34, 40, 132], z: 20, walk: [34, 224, "left"], look: "STUDIO B. A heavy soundproof door with a little window. The hallway is the same beige as every radio station hallway in the world.", exit: "travel" },
    { id: "a5_rwin", name: "control room window", r: [376, 24, 228, 98], z: 20, walk: [490, 214, "back"], look: "The control room. An engineer in headphones watches faders and pretends not to eavesdrop. He gives me a thumbs up. It's the most affection I've had from radio.", talk: "He can't hear me. Soundproof glass. I mouth \"thank you.\" He mouths \"sorry, what?\"", push: "I tap on the glass. He waves, and doesn't stop what he's doing.", pickup: "It's glass. I'm not that kind of DJ." },
    { id: "a5_rair", name: "ON AIR sign", r: [286, 18, 62, 24], z: 22, walk: [318, 214, "back"], look: S => onAir(S) ? "ON AIR. Red as a stoplight. It is deeply stressful." : "ON AIR, currently off. When it's red, I'm broadcasting to all of New York.", pull: "I can't turn it on. It's the engineer's job. And his joy.", use: "It turns on when the interview starts. I don't want to start the interview just to see the light." },
    { id: "a5_rneon", name: "radio neon", r: [34, 24, 100, 46], z: 22, walk: [90, 214, "back"], look: "RADIO HARBOR 88.1. The neon buzzes. It's the station's heartbeat." },
    { id: "a5_rclock", name: "wall clock", r: [228, 22, 30, 30], z: 22, walk: [244, 214, "back"], look: "Ten o'clock. Every clock in a radio station is exactly ten o'clock. It's a rule. Or a conspiracy." },
    { id: "a5_rshelf", name: "record shelf", r: [38, 76, 154, 46], z: 18, walk: [110, 216, "back"], look: "The station's records. Most of them have a sticker that says DO NOT PLAY. That's the good ones.", pickup: "It's a station library. I could be arrested. Or worse, billed." },
    { id: "a5_rplaque", name: "plaque", r: [224, 76, 54, 36], z: 20, walk: [250, 216, "back"], look: "BEST IN BROOKLYN, 2019. Sponsored by a deli. It's dusty. It's perfect." },
    { id: "a5_rmic", name: "guest microphone", r: [270, 140, 36, 66], z: 32, walk: [296, 228, "back"], look: S => S.f.a5_interviewDone ? "The guest mic. I was on it. I said \"Axl who\" or I didn't, depending on how you scored." : "A big radio mic on a boom arm, with a pop filter. It's mine for the next hour. I'm going to be fine. I'm going to be fine.",
      use: S => interview(S), talk: S => interview(S), pickup: "It's on a boom arm and I like having an arm.", push: "It swings away from me. Even the mic is nervous." },
    { id: "a5_rcouch", name: "guest couch", r: [402, 130, 136, 62], z: 16, walk: [470, 214, "back"], look: "The guest couch. The cushions have sat a lot of nervous people. They've absorbed everything.", use: "I'd sit, but if I sit now, I'll be sitting for the interview. Standing is more respectful. And less comfortable.", pickup: "It's attached to the floor and to a lot of history." },
    { id: "a5_rcart", name: "turntable cart", r: [38, 164, 70, 66], z: 34, walk: [76, 236, "back"], look: "A rolling cart with a turntable and a crate of records. Radio stations still have turntables. They're the last stand of vinyl.", use: "Later. Dana asks for a live record after the interview.", pickup: "It's a cart. It has wheels. I have a conscience.", push: "I roll it two inches. Dana looks at me over the glasses. I roll it back." },
    { id: "a5_rtable", name: "interview table", r: [148, 160, 182, 76], z: 18, walk: [240, 232, "back"], look: "A round table with two mics, a stack of notes with coffee rings, and a pair of headphones that smell like previous guests. I don't want to think about it.", pickup: "It's a table. It's bigger than my ambitions." },
    { id: "a5_rhead", name: "headphones", r: [228, 180, 20, 10], z: 33, walk: [240, 232, "back"], look: "A pair of big studio headphones, in good shape. They're Dana's. She loves them more than most people.", pickup: "Dana's looking. Dana's always looking.", use: "I'll put them on for the interview. Don't make it weird." },
    { id: "a5_dana", name: "Dana Okafor", talk: S => interview(S), look: "Dana Okafor. Big pink glasses, bigger questions, a tee that says 88.1. She asks questions the way other people throw darts.", give: "Dana doesn't take gifts on air. Off air, she takes coffee.", pickup: "Not Dana. Dana picks YOU up.", use: "Dana: \"If you're gonna use me, use me for the interview.\"" }
  ],
  combos: [
    ["a5_pass", "a5_dana", "Dana: \"A pass? Honey, I'm the one who puts the names ON the passes. Mine's the one without the typo.\""],
    ["phone", "a5_rmic", "Dana: \"No phones on air. Unless it's Marcus. Marcus is always on the phone.\""]
  ],
  enter: async (S) => {
    if (S.f.a5_radioSeen) return;
    S.f.a5_radioSeen = true; RP.setClock("FRI 9:58 AM");
    await RP.lines(["@a5_dana You're my ten o'clock. Stand by the mic. I'll cue you.", "Mic, okay. Mic. I've talked into worse things. A pipe hole, mostly."]);
  },
  self: { look: "A guest on the radio. My hair says \"I've never done this.\" My coat says \"I'm trying.\"", talk: "I'm warming up. Mi-mi-mi. Don't tell the engineer." }
});
})();
