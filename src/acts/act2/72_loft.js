/* Act 2 — inside the Bushwick loft party. The PA is dead (the sound guy ghosted). Install Jess's borrowed amp, then
   run sound.Check. Kosmo Delacroix (fictional) calls you Dennis. Real-event flyers on the wall use only what the lore says
   (Body & Soul: begun 1996 at Club Vinyl with Francois K, Danny Krivit and Joe Claussell as residents; 718 Sessions:
   Danny Krivit's recurring New York party series). After the fix: Moxie pays the door money, Vic watches, Twinkie has a spot.
   Flags: a2_loftMoxie, a2_ampInstalled, a2_loftFixed, a2_vicMet, a2_kosmoMet, a2_loftPaid */
(function () {
"use strict";
const RP = window.RP, A2 = RP.a2, PK = RP.PK;
const { R, P, ell, txt, txtC } = RP.u;
const U = PK.util;
const W = 640;
const fixed = S => !!S.f.a2_loftFixed;

function paint(c, S) {
  const em = [], F = fixed(S);
  // exposed brick, timber beams, big windows over the booth
  PK.brick(c, 0, 0, W, 168, { base: "#6e3c3a", mortar: "#5a4a58", worn: 0.5, seed: 71 });
  U.dshade(c, 0, 0, W, 60, "#0c0618", (x, y) => 1 - y / 60, 0.35);
  PK.planks(c, 0, 168, W, 88, { base: "#5a4038", seed: 72 });
  PK.baseboard(c, 0, 160, W, { color: "#2a2030", h: 8 });
  [[0, 0, 640, 12]].forEach(([x, y, w, h]) => { R(c, x, y, w, h, "#2a1c22"); U.HL(c, x, y + h - 1, w, "#0c0610"); U.HL(c, x, y, w, "#5a4048"); });
  for (let x = 40; x < W; x += 120) { R(c, x, 0, 10, 16, "#3a2a30"); U.VL(c, x, 0, 16, "#6a5058"); }
  PK.pipe(c, 0, 20, W, { dir: "h", r: 4, joint: 140 });
  // entrance door (left)
  PK.door(c, 4, 52, 46, 112, { metal: true, window: false, color: "#5a6a7a", knob: false });
  R(c, 8, 44, 38, 7, "#14202a"); txtC(c, "EXIT", 27, 46, "#9bf0b0", 1, 1); em.push([8, 44, 38, 7]);
  // the bar: back shelf, mirror strip, neon
  R(c, 60, 44, 172, 92, "#1a1018"); PK.shelf(c, 62, 48, 168, 84, { items: "bottles", wood: "#6a3a2a", seed: 4 });
  R(c, 62, 130, 168, 2, "#ffe2a0"); em.push([62, 130, 168, 2]);
  em.push.apply(em, PK.neon(c, "BAR", 124, 22, "#39d0ff", { scale: 2, tube: 2 }));
  // WC door, flyers, rack, windows
  PK.door(c, 246, 54, 46, 110, { color: "#e8e0d0", frame: "#8a7a68", sign: "WC", panels: 2, knob: true, peephole: false, seed: 3 });
  // Body & Soul and 718 Sessions flyers (names and facts only as in the lore data)
  R(c, 300, 28, 40, 54, "#f4e8d0"); U.outline(c, 300, 28, 40, 54, "#a89878"); U.HL(c, 301, 29, 38, "#fffbe8");
  txtC(c, "BODY &", 320, 32, "#1d1622", 1, 0); txtC(c, "SOUL", 320, 38, "#c0302c", 2, 1); txtC(c, "SINCE 1996", 320, 52, "#1d1622", 1, 0); txtC(c, "FRANCOIS K", 320, 60, "#2f62b8", 1, 0); txtC(c, "D. KRIVIT", 320, 66, "#2f62b8", 1, 0); txtC(c, "J. CLAUSSELL", 320, 72, "#2f62b8", 1, 0);
  R(c, 348, 24, 40, 54, "#14102e"); U.outline(c, 348, 24, 40, 54, "#5a4a88"); em.push.apply(em, PK.neon(c, "718", 354, 30, "#ff3fa4", { scale: 2, tube: 2, glow: false })); txtC(c, "SESSIONS", 368, 50, "#39d0ff", 1, 0); txtC(c, "DANNY KRIVIT", 368, 60, "#e8e4f0", 1, 0); txtC(c, "RECURRING", 368, 67, "#ffd23f", 1, 0);
  em.push.apply(em, A2.window(c, 404, 24, 62, 70, { frame: "#7a6a90", cols: 1, t: 4, view: (cc, gx, gy, gw, gh) => { PK.sky(cc, gx, gy, gw, gh, { time: "night", seed: 74, stars: 30, moon: false }); return PK.skyline(cc, gx, gy + 14, gw, gh - 14, { night: true, layers: 2, seed: 75 }); } }));
  em.push.apply(em, A2.window(c, 490, 24, 62, 70, { frame: "#7a6a90", cols: 1, t: 4, view: (cc, gx, gy, gw, gh) => { PK.sky(cc, gx, gy, gw, gh, { time: "night", seed: 76, stars: 30, moon: { x: gx + 40, y: gy + 16, r: 4 } }); return PK.skyline(cc, gx, gy + 14, gw, gh - 14, { night: true, layers: 2, seed: 77 }); } }));
  // banner over the booth
  R(c, 402, 6, 156, 12, "#14102e"); txtC(c, "MESEROLE LOFT SESSIONS", 480, 10, "#ffd27a", 1, 1);
  // PA stacks and the booth
  PK.speakerStack(c, 350, 76, 44, 92, {}); PK.speakerStack(c, 592, 76, 44, 92, {});
  em.push.apply(em, PK.djBooth(c, 400, 104, 186, { gear: "cdj", mixer: "2ch", logo: false, lights: F, tier: 2, seed: 4 }));
  R(c, 440, 158, 100, 10, "#14102e"); txtC(c, "DJ GUS (OUT)", 490, 160, "#6a6680", 1, 1);
  // string lights over the dance floor
  for (let x = 6; x < W - 6; x += 3) { const y = 30 + Math.round(Math.sin(x / 40) * 6); P(c, x, y, "#2a2030"); }
  for (let x = 14; x < W - 6; x += 16) { const y = 31 + Math.round(Math.sin(x / 40) * 6); R(c, x, y, 3, 4, ["#ffd27a", "#ff6cbb", "#9fe8ff"][(x / 16) % 3 | 0]); em.push([x - 1, y - 1, 5, 6]); em.push.apply(em, PK.glow(c, x + 1, y + 2, 8, ["#ffd27a", "#ff6cbb", "#9fe8ff"][(x / 16) % 3 | 0], { strength: 0.5 })); }
  em.push.apply(em, PK.discoBall(c, 320, 76, 11, { string: 40 }));
  return em;
}

function drawRack(c, S) {
  // a roadie rack of gear: preamp, EQ, amp (dead or Jess's), power strip; cables snaking away
  const x = 304, y = 100, w = 40, h = 70, inst = !!S.f.a2_ampInstalled;
  R(c, x - 2, y - 2, w + 4, h + 4, "#14121a"); R(c, x, y, w, h, "#1e1c26"); U.outline(c, x, y, w, h, "#4a4658");
  for (let i = 0; i < 4; i++) {
    const uy = y + 4 + i * 16;
    if (i === 2) {
      if (!inst) { R(c, x + 3, uy, w - 6, 14, "#0a0810"); U.outline(c, x + 3, uy, w - 6, 14, "#2a2838"); P(c, x + 8, uy + 4, "#3a2a2a"); R(c, x + 10, uy + 6, 14, 3, "#2a1a1a"); R(c, x + 28, uy + 3, 6, 8, "#1a1a1a"); }
      else { R(c, x + 3, uy, w - 6, 14, "#c8c4d8"); U.HL(c, x + 3, uy, w - 6, "#ffffff"); U.outline(c, x + 3, uy, w - 6, 14, "#8a869c"); [8, 15, 22].forEach(kx => { ell(c, x + kx, uy + 7, 2, 2, "#2a2838"); P(c, x + kx - 1, uy + 6, "#8a869c"); }); R(c, x + 28, uy + 3, 6, 3, "#3fd07a"); R(c, x + 28, uy + 8, 6, 3, "#ff9a3f"); R(c, x + 4, uy + 12, 32, 2, "#f4e888"); txtC(c, "DO NOT BREAK -J", x + 20, uy + 11, "#c0302c", 1, 0); }
    } else { R(c, x + 3, uy, w - 6, 14, "#34303f"); U.HL(c, x + 3, uy, w - 6, "#5a566c"); for (let k = 0; k < 4; k++) P(c, x + 6 + k * 8, uy + 4, "#8a86a0"); R(c, x + 30, uy + 3, 4, 3, i === 0 ? "#3fd07a" : "#39d0ff"); }
  }
  for (let i = 0; i < 60; i++) P(c, x - i, y + h - 6 + Math.round(Math.sin(i / 5) * 3), i % 7 === 0 ? "#c0302c" : "#0a0810");
  for (let i = 0; i < 50; i++) P(c, x + w + i, y + h - 4 + Math.round(Math.sin(i / 6) * 2), "#0a0810");
}

function drawCounter(c, S) {
  PK.counter(c, 52, 134, 184, 36, { top: "#4a2a20", front: "#2a1c28", panelW: 30, rail: true, seed: 3 });
  // glasses, a tip jar, a beer tap
  R(c, 70, 124, 6, 10, "#cfe4ef"); R(c, 82, 126, 6, 8, "#cfe4ef"); R(c, 200, 120, 12, 14, "#cfe4ef"); U.outline(c, 200, 120, 12, 14, "#8a96a6"); R(c, 202, 128, 8, 4, "#3fa860"); R(c, 202, 124, 8, 1, "#f4f0e8");
  R(c, 146, 114, 4, 20, "#c8c4d8"); R(c, 142, 112, 12, 4, "#8a869c");
}
function drawStools(c) { [[96, 196], [150, 196], [204, 196]].forEach(([x, y]) => PK.chair(c, x, y - 20, { kind: "stool", color: "#6a2a3a" })); }
function drawCables(c, S) {
  // the ground wire everybody's tripped over
  for (let i = 0; i < 100; i++) P(c, 350 + i, 178 + Math.round(Math.sin(i / 7) * 3), i % 9 < 5 ? "#e8e030" : "#0a0810");
}

function light(S) {
  if (fixed(S)) return {
    ambient: "#2a2252",
    lights: [
      { x: 160, y: 90, r: 170, color: "#ffb070", steps: 4, power: 0.8 },
      { x: 320, y: 70, r: 260, color: "#ff3fa4", steps: 4, sy: 1.1, rim: true },
      { x: 470, y: 60, r: 250, color: "#39d0ff", steps: 4, sy: 1.1, rim: true },
      { x: 90, y: 40, r: 180, color: "#a05cff", steps: 3, power: 0.7, rim: true },
      { box: [404, 24, 62, 70], r: 40, color: "#6f66b8", steps: 2, power: 0.6 }
    ],
    halos: [{ x: 320, y: 76, r: 26, color: "#ff3fa4", strength: 1 }],
    key: { x: 320, y: 60 }, shadow: 0.6
  };
  return {
    ambient: "#34305c",
    lights: [
      { x: 160, y: 90, r: 190, color: "#ffb070", steps: 4, power: 0.9 },
      { x: 320, y: 20, r: 240, color: "#ffd8a0", steps: 4, power: 0.6, sy: 1.4 },
      { x: 470, y: 60, r: 200, color: "#8a80d0", steps: 3, power: 0.6 },
      { x: 324, y: 134, r: 70, color: "#ff5a30", steps: 2, power: 0.6 }
    ],
    key: { x: 300, y: 20 }, shadow: 0.55
  };
}

/* ------------------------------------------------------------------ scenes */
function crowdAct(act) { RP.curRoom().actors.filter(a => a.crowd).forEach(a => { a.act = act; a.baseAct = act; }); }

async function partyOn(S) {
  S.f.a2_loftFixed = true;
  RP.relight();
  crowdAct("dance");
  RP.setMusic({ genre: "house", bpm: 124, volume: 0.5, energy: 4 });
  RP.audio.setAmbience("crowd");
  RP.sfx("cheer");
}

async function installAmp(S) {
  if (S.f.a2_ampInstalled) { await RP.say("The amp's already in the rack with its little green light. It's the only thing in here that's behaving."); return; }
  if (!RP.has("a2_amp")) { await RP.say("The dead amp is a crispy brick. I need a replacement."); return; }
  await RP.walkTo(326, 210, "back");
  await RP.lines([
    "I slide Jess's amp into the rack and bolt it down. A strip of tape on top says \"DO NOT BREAK. - J.\"",
    "I swap the speaker cables. Left to left. Right to right. The universe is a rule.",
    "The little green light comes on. It looks at me like it expects things."
  ]);
  RP.take("a2_amp"); S.f.a2_ampInstalled = true; RP.relight(); RP.sfx("click");
  await RP.say("The amp's in. The room's still silent. Something else is wrong: this isn't one fault, it's a chain of them.");
}

async function fallbackSound() {
  const fixes = [["Swap the dead channel's cable", "The right speaker comes back with a pop. Half a sound is better than none."], ["Lift the ground wire from the booth", "The hum disappears. Everyone's shoulders drop an inch."], ["Turn the mic away from the monitor", "The squeal stops. A thousand small gods sigh."]];
  const done = [];
  while (done.length < 3) {
    const rest = fixes.filter((f, i) => !done.includes(i));
    const i = await RP.choose(rest.map(f => f[0]));
    const idx = fixes.indexOf(rest[i]); done.push(idx);
    await RP.say(fixes[idx][1]);
  }
  return { ok: true, score: 80, fixed: 3, fallback: true };
}

async function runSoundCheck(S) {
  if (fixed(S)) { await RP.say("It's working. I'm not touching anything. If I touch it, it'll break out of spite."); return; }
  if (!S.f.a2_ampInstalled) {
    await RP.lines(["I check the rack. The amp is a charred brick with a burnt smell and a story.", "I can't fix anything until it has an amp. I know someone with a spare."]);
    return;
  }
  await RP.walkTo(486, 214, "back");
  await RP.say("Okay. Chain of custody. Decks, mixer, amp, speakers. Find the fault. Maybe three.");
  let res;
  for (;;) {
    res = await A2.mg("soundCheck", { faults: ["ground-hum", "dead-channel", "feedback"], time: 90, stage: "loft", difficulty: 2 }, fallbackSound);
    if (res && res.ok) break;
    await RP.lines(["The crowd groans. Somebody starts a chant of \"MUSIC.\" It's a mantra now.", "@a2_moxie Try again! Please! I've got a hundred and fifty dollars of PA and no hope!"]);
    const i = await RP.choose(["Try again", "Take a breather"]);
    if (i === 1) { await RP.say("A breather. Fine. I'll breathe. The crowd chants \"MUSIC.\" I breathe."); return; }
  }
  await partyOn(S);
  await afterFix(S);
}

async function afterFix(S) {
  await RP.lines([
    "A hum. A thump. A bass line. The whole loft takes a breath and lets it out as a scream.",
    "@a2_moxie YOU DID IT. YOU ABSOLUTE MIRACLE.",
    "@a2_moxie Door money. Sixty bucks. It's what I've got. It's everything."
  ]);
  RP.money(40);
  RP.followers(25);
  S.f.a2_loftPaid = true;
  await RP.say("Moxie shoves forty bucks of damp fives into my hand. She says sixty. It's forty. I don't correct her. I'm not above a rounding error.");
  // Vic walks in
  RP.actor("a2_vic").vis = () => true;
  RP.place("a2_vic", 520, 232, "left");
  await RP.lines([
    "A man in sunglasses walks in. Indoors. At night. In a leather jacket. He stops at the door like he owns the air.",
    "@a2_vic Who fixed the PA?",
    "@a2_moxie THIS ONE. THE KID."
  ]);
  await RP.npcWalk("a2_vic", 410, 228, "left");
  RP.actor("kid").face = "right";
  const nm = S.name || "DJ NOBODY";
  await RP.lines([
    "@a2_vic Huh. You fixed a PA in a loft with two hundred drunk people screaming. You didn't panic, you didn't brag.",
    "@a2_vic What's your name again? " + nm.charAt(0) + nm.slice(1).toLowerCase() + "? " + nm + "? Doesn't matter. Vic. Basement Tapes.",
    "It's an honor, Vic. I'd love to talk about a slot.",
    "@a2_vic Slow down. Everyone wants a slot. Everyone's got a demo and a speech.",
    "@a2_vic A fixed PA is a start. A person who can keep a room at four in the morning is a different thing. Twinkie says she's got a spot. Show me.",
    "I'll show you.",
    "@a2_vic Don't tell me. Show me. And relax. You're sweating need."
  ]);
  S.f.a2_vicMet = true;
  // Twinkie shows up with her spot
  RP.actor("twinkie").vis = () => true;
  RP.place("twinkie", 300, 236, "right");
  await RP.lines([
    "@twinkie Ooh. Vic's got his sunglasses on. That's a good sign. Or a bad one. It's always sunglasses.",
    "Twinkie. You said you know a spot.",
    "@twinkie Big. Quiet. Empty on Saturdays. Slightly illegal. Bring your turntables and everybody you know.",
    "I know a handful of people.",
    "@twinkie You know a handful of people who know a handful of people. That's a pyramid. I'm a pyramid scheme with a heart."
  ]);
  if (!RP.has("a2_tts")) await RP.lines(["I just... forgot to say. I don't have my decks yet.", "@twinkie Then you're a DJ without decks. Eddie's under the BQE till three. Go. I'll text the address."]);
  else await RP.say("The turntables are in their boxes, bungee-corded to my back. I'm a walking record store.");
  RP.unlock("a2_loc_basement");
  RP.setClock("SUN 3:10 AM");
  RP.text("TWINKIE", "the spot: tri-state tape bldg, gowanus. basement. back door. bring everybody. dont tell vic its vics.");
  RP.toast("New place on the map: Basement Tapes (the spot)");
  await RP.say("Twinkie's text arrives: \"don't tell vic it's vic's.\" ...What?");
}

/* ------------------------------------------------------------------ people */
async function talkMoxie(S) {
  if (!S.f.a2_loftMoxie) {
    S.f.a2_loftMoxie = true;
    if (S.f.a2_sneaked) await RP.lines(["@a2_moxie You weren't on my list. I saw you come out of the bathroom window.", "@a2_moxie It's the only entrance I'm not mad at. Are you a sound guy?"]);
    else await RP.lines(["@a2_moxie Are you the sound guy? Please say you're the sound guy.", "I'm... a guy with an opinion about sound."]);
  }
  await RP.convo([
    { text: "What's wrong with the PA?", run: async () => { await RP.lines(["@a2_moxie It died at 10:15. A pop, a puff of smoke, a smell like burnt toast. The sound guy, Gus, left after a text from his ex.", "@a2_moxie There's two hundred and four people in a sixty-person room and they're chanting \"MUSIC.\" It's a cry for help."]); } },
    { text: "I've got a spare amp.", when: S2 => RP.has("a2_amp") && !S2.f.a2_ampInstalled, run: async () => { await RP.lines(["@a2_moxie A SPARE AMP. You beautiful, wild-eyed stranger.", "@a2_moxie The rack's by the bathroom. The dead one is the smoking one."]); } },
    { text: "Who's the guy in the leather jacket?", when: S2 => S2.f.a2_vicMet, run: async () => { await RP.lines(["@a2_moxie Vic. Basement Tapes. He's here every month and never says why. I think he's a ghost with a PA."]); } },
    { text: "Who's the legend at the bar?", run: async () => { await RP.lines(["@a2_moxie Kosmo Delacroix. He just showed up. He says it's \"for the energy.\" I don't ask."]); } },
    { text: "Later.", end: true }
  ]);
}

async function talkKosmo(S) {
  if (!S.f.a2_kosmoMet) {
    S.f.a2_kosmoMet = true;
    await RP.lines(["@kosmo Ah. The young man who looks at cables like they owe him money. Dennis, was it?", "It's " + (S.name || "DJ NOBODY") + ".", "@kosmo Of course, Dennis."]);
  }
  await RP.convo([
    { text: "Any advice, Mr. Delacroix?", run: async () => {
      if (fixed(S)) await RP.lines(["@kosmo A good room breathes, Dennis. This one just took a breath.", "@kosmo Nice work."]);
      else await RP.lines(["@kosmo Silence is just a song with the volume at zero, Dennis. But the hum? The hum is always the ground.", "@kosmo Follow the cable that nobody loves. It's the one."]);
    } },
    { text: "What are you doing here?", run: async () => { await RP.lines(["@kosmo Listening, Dennis. At my age, it's the only way to hear what the room wants. This one wants a bass line and a fire marshal."]); } },
    { text: "Never mind.", end: true }
  ]);
}

async function talkDani(S) { await RP.lines(["@a2_dani Fitz let you in? Did he cry? Tell me he cried.", S.f.a2_loftFixed ? "@a2_dani The PA works! You're my favorite person tonight. Drink?" : "@a2_dani I'd pour you something, but it's tap water and it's four dollars."]); }

RP.room({
  id: "a2_loft", act: 2, name: "The loft on Meserole",
  paint,
  cacheKey: S => (fixed(S) ? "f" : "d") + (S.f.a2_ampInstalled ? "a" : ""),
  lightKey: S => (fixed(S) ? "f" : "d") + (S.f.a2_ampInstalled ? "a" : ""),
  light,
  ambience: "crowd",
  music: S => fixed(S) ? { genre: "house", bpm: 124, volume: 0.5, energy: 4 } : null,
  walk: [[8, 206], [632, 206], [632, 252], [8, 252]],
  start: { x: 72, y: 232, face: "right" },
  update: A2.update,
  fx: [
    { type: "smoke", x: 324, y: 128, rise: 36, size: 7, drift: 4, color: "#4a4658", on: () => !RP.state.f.a2_ampInstalled },
    { type: "haze", rect: [40, 90, 560, 150], color: "#9a8ae0", density: 3, on: () => !!RP.state.f.a2_loftFixed },
    { type: "beams", origins: [[160, 14], [320, 14], [480, 14], [600, 14]], colors: ["#ff3fa4", "#39d0ff", "#a05cff", "#ffd23f"], base: Math.PI / 2, swing: 0.55, len: 230, width: 16, alpha: 0.14, period: 1300, on: () => !!RP.state.f.a2_loftFixed },
    { type: "strobe", period: 2600, flash: 50, alpha: 0.12, on: () => !!RP.state.f.a2_loftFixed },
    { type: "dust", rect: [60, 60, 540, 140], count: 28, color: "#ffe2c0", on: () => !RP.state.f.a2_loftFixed }
  ],
  actors: S => [
    { id: "a2_moxie", char: "a2_moxie", x: 236, y: 232, face: "right", act: "stand", name: "Moxie" },
    { id: "a2_dani", char: "a2_dani", x: 140, y: 176, face: "front", act: "stand", name: "Dani", noTurn: true, talkDist: 34 },
    { id: "kosmo", char: "kosmo", x: 262, y: 216, face: "left", act: "stand", name: "Kosmo Delacroix" },
    { id: "a2_vic", char: "a2_vic", x: 520, y: 232, face: "left", act: "stand", name: "Vic", vis: S2 => !!S2.f.a2_vicMet },
    { id: "twinkie", char: "twinkie", x: 300, y: 236, face: "right", act: "stand", name: "Twinkie", vis: S2 => !!S2.f.a2_vicMet },
    { crowd: { n: 9, rect: [360, 206, 200, 40], seed: 41, face: "front", act: fixed(S) ? "dance" : "stand", scale: 0.95 } },
    { crowd: { n: 5, rect: [90, 206, 110, 36], seed: 43, face: "front", act: fixed(S) ? "dance" : "stand", scale: 0.95 } },
    { crowd: { n: 4, rect: [280, 190, 70, 14], seed: 47, face: "front", act: fixed(S) ? "dance" : "stand", scale: 0.88 } }
  ],
  sprites: [
    { y: 182, draw: (c, S) => drawCounter(c, S) },
    { y: 175, draw: (c, S) => drawRack(c, S) },
    { y: 200, draw: c => drawStools(c) },
    { y: 184, draw: (c, S) => drawCables(c, S) }
  ],
  enter: async (S, from) => {
    if (!S.f.a2_loftSeen) { S.f.a2_loftSeen = true; RP.toast("The PA is dead. Moxie looks like she needs help."); }
  },
  hotspots: [
    { id: "a2_loftexit", name: "door (outside)", r: [2, 40, 52, 128], z: 30, walk: [64, 232, "left"], look: "The way back out to Meserole Street, the line and Fitz.", exit: { room: "a2_loftdoor", x: 364, y: 214, face: "front" } },
    { id: "a2_bar", name: "bar", r: [50, 40, 190, 134], z: 24, walk: [150, 212, "back"], look: S => fixed(S) ? "The bar: bottles, a tip jar, Dani pouring with her eyes closed. The line is four people deep and happy." : "A plank across two kegs with bottles on a shelf and a hand-lettered sign: \"BEER $5. WATER $4. SILENCE: FREE.\"", use: "I'd buy a drink. I'd also like to keep my money. It's a thing.", pickup: "Stealing from Dani isn't in the cards. Or the plan.", open: "I'd open a tab. I'm already open to a tab. It'd be a deficit tab." },
    { id: "a2_neon", name: "BAR neon", r: [122, 20, 36, 18], z: 26, walk: [140, 212, "back"], look: "A blue neon BAR. The R flickers. Somebody wired it at the last second and prayed.", use: "I can't flip it. It has no switch. It has a prayer." },
    { id: "a2_wc", name: "WC door", r: [244, 52, 50, 114], z: 22, walk: [270, 212, "back"], look: S => S.f.a2_sneaked ? "The WC door. The one I came out of, when I was somebody who climbed a fire escape. We don't talk about it." : "The WC door. A line of two people and a plant. A sign: \"ONE AT A TIME. NO EXCEPTIONS. NO EXPLANATIONS.\"", open: "Occupied. I can hear someone rehearsing a toast.", use: "Not now. I'm busy being a hero.", push: "I'd walk in on someone. I've done enough for one night." },
    { id: "a2_flyerbs", name: "Body & Soul flyer", r: [298, 26, 44, 58], z: 22, walk: [320, 212, "back"], look: "A flyer for BODY & SOUL. The party began in 1996 at Club Vinyl in Manhattan, with Francois K, Danny Krivit and Joe Claussell as residents. Somebody taped a piece of history to a brick wall, as if it were a takeout menu.", pickup: "It's taped on. It's been up here longer than the lease.", use: "I'd put a record on for them. But first I'd learn how to be them." },
    { id: "a2_flyer718", name: "718 Sessions flyer", r: [346, 22, 44, 58], z: 22, walk: [372, 212, "back"], look: "718 SESSIONS: Danny Krivit's recurring New York party series. A neon-pink 718 on dark purple. If I ever play in a room like that, I'd call my mother. She'd say \"did you eat.\"", pickup: "I'd peel it off, but the wall would peel back." },
    { id: "a2_rack", name: "amp rack", r: [300, 96, 46, 76], z: 36, walk: [322, 210, "back"], look: S => S.f.a2_ampInstalled ? "The rack with Jess's amp in it, its small green light burning like a tiny promise. It looks like the only professional thing in here." : "A roadie rack with an amp that's black with soot and smells like a campfire. A little smoke still comes out. It's been dead for forty minutes.",
      use: S => S.f.a2_ampInstalled ? runSoundCheck(S) : (RP.has("a2_amp") ? installAmp(S) : "A smoking amp. I need a replacement, and I can't make one out of spite."), pickup: "It's heavy. And smoking. I don't pick up smoking things as a rule.", open: "It's already open. A little smoke escapes." },
    { id: "a2_pa", name: "PA speakers", rects: [[348, 74, 48, 96], [590, 74, 48, 96]], z: 30, walk: [372, 212, "back"], look: S => fixed(S) ? "Two stacks of speakers, finally earning their keep. The sub shakes the ribs. A good sound system is a religion with bass." : "Two PA stacks, absolutely silent. They look like a couple who just had a fight and won't talk about it.", use: "I'd test them, but it'd be like pressing a button on a dead elevator.", push: "They weigh three hundred pounds. I weigh less.", pickup: "Not in a hundred years." },
    { id: "a2_booth", name: "DJ booth", r: [398, 100, 190, 76], z: 32, walk: [490, 212, "back"], look: S => fixed(S) ? "The DJ booth: two CDJs, a mixer, a banner that says \"MESEROLE LOFT SESSIONS.\" The sign that says \"DJ GUS (OUT)\" has gone from sad to funny." : "A plywood booth with two CDJs and a mixer. A sign: \"DJ GUS (OUT).\" Gus is out. Gus is out of the building and of his mind.",
      use: S => runSoundCheck(S), open: "There's nothing to open. It's a table. It's all there is.", push: "It's a table. A table with a lot of responsibility.", pickup: "I'm not picking up the booth. I'm picking up the pieces." },
    { id: "a2_cables", name: "tangle of cables", r: [350, 172, 100, 14], z: 12, floor: true, look: "A tangle of cables on the floor: speaker lines, an extension cord, a yellow-striped ground wire and a lot of tape. Somebody's life story, in black rubber.", pickup: "If I pick one up, I'll bring a hundred." },
    { id: "a2_window", name: "windows", rects: [[402, 22, 66, 74], [488, 22, 66, 74]], z: 14, walk: [470, 212, "back"], look: "Two tall factory windows with the night sky and a line of skyline. Bushwick is down there somewhere, trying to sleep.", open: "Painted shut. The party's sealed in. In a good way.", push: "Not through that glass." },
    { id: "a2_disco", name: "disco ball", r: [306, 64, 28, 36], z: 26, walk: [320, 212, "back"], look: "A disco ball, hung from a beam by a lot of optimism and one wire. It's got a small dent, probably from a bachelorette.", use: "I can't reach it. Disco balls aren't for people. They're for gods.", pickup: "That would end badly. For me and the ball." },
    { id: "a2_banner", name: "banner", r: [400, 4, 160, 16], z: 14, walk: [480, 212, "back"], look: "A hand-painted banner: MESEROLE LOFT SESSIONS. Somebody spelled \"Meserole\" with only one mistake. It's an accomplishment." },
    { id: "a2_moxie", name: "Moxie", z: 80, look: "Moxie: cyan buzz cut, a yellow vest with \"HOST\" on a lanyard and the expression of someone who's holding a building together with duct tape and nerves.", talk: S => talkMoxie(S),
      give: async (S, item) => { if (item === "a2_amp") return installAmp(S); return ["@a2_moxie I don't have time for gifts. I have a PA."]; } },
    { id: "kosmo", name: "Kosmo Delacroix", z: 80, look: "Kosmo Delacroix: long white hair, shades, a coat the color of a bruise and a drink he hasn't touched. He's nodding to a rhythm nobody else hears. He looks like a person who could tell you where your ear is.", talk: S => talkKosmo(S),
      give: async (S, item) => { if (item === "white") return ["@kosmo ...Interesting. A white label with no name. Play it for somebody who matters, Dennis."]; return ["@kosmo No, thank you, Dennis."]; } },
    { id: "a2_dani", name: "Dani", z: 80, look: "Dani, behind the bar: apron, braid, the unmistakable look of a woman who has told three men tonight to \"hang on.\"", talk: S => talkDani(S), give: async () => ["@a2_dani I don't need anything, DJ. Just don't break the PA."] },
    { id: "a2_vic", name: "Vic", z: 80, look: "Vic: ponytail, mustache, leather jacket and sunglasses worn indoors, at night, in a room with a disco ball. A man who has never explained himself and never will.", talk: async S => { await RP.lines(["@a2_vic Don't talk to me. Show me. The spot. Twinkie's got it."]); } },
    { id: "twinkie", name: "Twinkie", z: 80, look: "Twinkie: lavender bob, shades, mesh top. She's looking at the crowd like it's a map she's drawn herself.", talk: async S => { await RP.lines(["@twinkie Don't forget your decks. And your friends. And your nerve. The address is in your phone."]); } }
  ],
  combos: [
    ["a2_amp", "a2_rack", S => installAmp(RP.state)],
    ["a2_amp", "a2_booth", S => installAmp(RP.state)],
    ["a2_amp", "a2_pa", "The amp goes in the rack. The speakers are already plugged in, glaring at me."],
    ["a2_amp", "a2_moxie", S => installAmp(RP.state)],
    ["white", "a2_booth", "Not yet. Lou's record needs a real system and a room that listens. This one's still working on both."],
    ["white", "kosmo", ["@kosmo ...Interesting. A white label with no name. Play it for somebody who matters, Dennis."]],
    ["phone", "a2_moxie", "I'd text Moxie, but she's six feet away and screaming."],
    ["usb_cat", "a2_booth", "I'm not putting 4,000 cat photos on a DJ set. Though a slideshow of Mr. Whiskers would, honestly, kill."],
    ["a2_tts", "a2_booth", "These are the turntables for Basement Tapes. I'm not unboxing them in a place with a CDJ-only table."]
  ]
});
})();
