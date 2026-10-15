/* Act 4 — a4_security: the checkpoint. Officer Delgado signs Form 7B; Biscuit the K9 sits on your record bag
   until she's offered a treat from a trusted source (a stranger with jerky).
   Flags: a4_formSigned a4_dogFed a4_bagBack a4_secIntro a4_boarded */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u, PK = RP.PK, A4 = RP.a4;
const { R, P, ell, poly, line, txt, mulberry, mix } = U;
const W = 640;

const sprInspectTable = A4.spr(120, 70, c => {
  R(c, 2, 20, 116, 6, "#c8ccd8"); R(c, 2, 20, 116, 1, "#ffffff"); R(c, 2, 25, 116, 1, "#7a7e94");
  R(c, 6, 26, 5, 38, "#8a8ea4"); R(c, 108, 26, 5, 38, "#8a8ea4"); R(c, 6, 26, 1, 38, "#c8ccd8"); R(c, 108, 26, 1, 38, "#c8ccd8");
  R(c, 4, 62, 112, 3, "#6a6e84"); R(c, 4, 62, 112, 1, "#a8acc0");
  R(c, 14, 28, 92, 12, "#5a5e74"); R(c, 14, 28, 92, 1, "#8a8ea4");
  txt(c, "INSPECTION", 36, 30, "#ffd23f");
});
const sprRecordBagOnTable = A4.spr(40, 30, c => {
  R(c, 4, 8, 32, 20, "#1c1a24"); R(c, 4, 8, 32, 2, "#4a4868"); R(c, 4, 26, 32, 2, "#0a080e"); R(c, 4, 8, 2, 20, "#55516a"); R(c, 34, 8, 2, 20, "#55516a");
  R(c, 11, 3, 3, 6, "#55516a"); R(c, 26, 3, 3, 6, "#55516a"); R(c, 11, 2, 18, 2, "#8a86a0");
  ell(c, 12, 17, 3, 3, "#ff3fa4"); R(c, 19, 13, 10, 5, "#39d0ff"); R(c, 19, 13, 10, 1, "#9fe8ff"); R(c, 16, 21, 8, 3, "#ffd23f"); P(c, 30, 24, "#9be15d");
  R(c, 4, 20, 32, 1, "#2a2838");
});
const sprBiscuit = A4.spr(46, 32, c => {          /* a beagle, sitting like a sentence */
  R(c, 6, 18, 28, 12, "#a8743e"); R(c, 6, 18, 28, 2, "#c8925a"); R(c, 10, 18, 14, 6, "#2a1c18"); R(c, 6, 28, 28, 2, "#7a4a2a");
  R(c, 28, 18, 10, 12, "#efe6d0"); R(c, 28, 18, 10, 1, "#ffffff");
  R(c, 30, 4, 14, 14, "#a8743e"); R(c, 30, 4, 14, 2, "#c8925a"); R(c, 36, 12, 8, 6, "#efe6d0"); R(c, 42, 11, 3, 3, "#17131f"); R(c, 38, 8, 2, 2, "#17131f"); P(c, 38, 8, "#ffffff");
  R(c, 26, 6, 5, 14, "#6a3a1a"); R(c, 26, 6, 5, 1, "#8a5a3a"); R(c, 41, 5, 2, 2, "#6a3a1a");
  R(c, 2, 14, 5, 8, "#a8743e"); R(c, 1, 12, 3, 3, "#efe6d0");
  R(c, 18, 28, 5, 4, "#efe6d0"); R(c, 30, 28, 5, 4, "#efe6d0");
  R(c, 28, 17, 10, 2, "#c0302c"); R(c, 31, 19, 4, 3, "#e8c020");      /* K9 vest tag */
});
const sprBiscuitFed = A4.spr(46, 26, c => {       /* on the floor, busy with jerky */
  R(c, 4, 10, 30, 12, "#a8743e"); R(c, 4, 10, 30, 2, "#c8925a"); R(c, 8, 10, 14, 6, "#2a1c18"); R(c, 4, 20, 30, 2, "#7a4a2a");
  R(c, 28, 8, 12, 14, "#efe6d0"); R(c, 28, 8, 12, 1, "#ffffff");
  R(c, 36, 12, 8, 10, "#a8743e"); R(c, 42, 17, 3, 3, "#17131f"); R(c, 38, 15, 2, 2, "#17131f"); R(c, 36, 20, 8, 2, "#7a3a1a"); R(c, 41, 21, 6, 2, "#7a3a1a");
  R(c, 33, 9, 5, 10, "#6a3a1a"); R(c, 0, 6, 5, 8, "#a8743e"); R(c, 0, 4, 3, 3, "#efe6d0");
  R(c, 12, 20, 5, 3, "#efe6d0"); R(c, 22, 20, 5, 3, "#efe6d0");
});
const sprBins = A4.spr(60, 40, c => {
  for (let i = 0; i < 4; i++) { const y = 28 - i * 6; R(c, 4, y, 52, 7, i % 2 ? "#6a6e84" : "#7a7e94"); R(c, 4, y, 52, 1, "#c8ccd8"); R(c, 4, y + 6, 52, 1, "#3a3c50"); }
  R(c, 12, 4, 36, 3, "#c8ccd8"); txt(c, "TRAY", 22, 11, "#17131f");
});

/* ------------------------------------------------------------------ paint */
function paint(c, S) {
  const em = []; const E = a => { if (a && a.length) for (const r of a) em.push(r); return a; };
  PK.plaster(c, 0, 0, W, 156, { base: "#8e98b0", seed: 22, patches: 0, stains: 1, cracks: 0 });
  PK.gradV(c, 0, 0, W, 18, ["#1c1a28", "#34344c"], { dither: 1 });
  [80, 230, 380, 530].forEach(x => E(PK.fluorescent(c, x, 10, 80, { on: true })));
  // frosted-glass partition panels
  for (let x = 6; x < W - 80; x += 104) { R(c, x, 30, 100, 100, "#a8c0d8"); PK.gradV(c, x, 30, 100, 100, ["#c8dcee", "#9ab4d0"], { dither: 1 }); R(c, x, 30, 100, 2, "#e8f4ff"); R(c, x, 128, 100, 2, "#5a6a88"); R(c, x + 99, 30, 1, 100, "#5a6a88"); PK.util.dshade(c, x, 30, 100, 100, "#ffffff", (px, py) => (((px - x) * 0.9 + (py - 30) + 2000) % 70 < 6 ? 1 : 0), 0.16); }
  PK.baseboard(c, 0, 146, W, { h: 5, color: "#4a4c60" });
  PK.tiles(c, 0, 152, W, 104, { a: "#8a8ea4", b: "#7a7e94", grout: "#5a5e74", size: 58, checker: true, horizonY: 96, seed: 6 });
  // footprints
  for (let i = 0; i < 6; i++) { R(c, 20 + i * 8, 226 - i * 2, 5, 3, "#e8c020"); R(c, 28 + i * 8, 229 - i * 2, 5, 3, "#e8c020"); }
  // banner
  R(c, 120, 14, 280, 20, "#101a3a"); R(c, 120, 14, 280, 1, "#3a4a8a"); txt(c, "SECURITY CHECKPOINT", 148, 20, "#ffd23f", 2, 1); R(c, 124, 14, 1, 1, "#000000"); em.push([120, 14, 280, 20]);
  R(c, 160, 4, 1, 10, "#2a2838"); R(c, 360, 4, 1, 10, "#2a2838");
  // signs: liquids, shoes, no photos
  PK.poster(c, 22, 42, 40, 54, { title: "LIQUIDS", titleLines: ["LIQUIDS", "100ML"], lines: ["IN A BAG", "NO EXCEPT"], palette: "paper", seed: 41 });
  R(c, 70, 46, 28, 38, "#efe6d0"); R(c, 70, 46, 28, 1, "#ffffff"); txt(c, "SHOES", 74, 50, "#17131f"); txt(c, "BELT", 76, 58, "#17131f"); txt(c, "JACKET", 73, 66, "#17131f"); txt(c, "DIGNITY", 71, 74, "#c0302c");
  // x-ray machine
  R(c, 168, 80, 94, 56, "#3a3e58"); R(c, 168, 80, 94, 2, "#8a8eac"); R(c, 168, 134, 94, 3, "#1a1c2c");
  R(c, 178, 92, 74, 36, "#0a0c18"); R(c, 178, 92, 74, 1, "#5a5e7a"); R(c, 178, 126, 74, 2, "#5a5e7a");
  for (let i = 0; i < 5; i++) R(c, 182 + i * 14, 94, 2, 32, "#1a1c2c");
  txt(c, "X-RAY", 200, 84, "#ffd23f");
  R(c, 262, 100, 70, 30, "#2a2c40"); R(c, 266, 104, 62, 22, "#0a1a1a"); em.push([266, 104, 62, 22]);
  R(c, 140, 124, 28, 8, "#4a4c60"); R(c, 140, 124, 28, 1, "#9a9cb4"); R(c, 140, 132, 4, 14, "#3a3c50"); R(c, 164, 132, 4, 14, "#3a3c50");
  // conveyor rollers
  R(c, 114, 136, 220, 10, "#1a1824"); R(c, 114, 136, 220, 1, "#6a6e84"); for (let x = 116; x < 334; x += 6) R(c, x, 138, 4, 6, x % 12 ? "#2a283a" : "#3a384a");
  R(c, 262, 130, 70, 8, "#4a4c60");
  // metal detector arch
  R(c, 380, 56, 10, 94, "#aab0c4"); R(c, 380, 56, 3, 94, "#e8ecf8"); R(c, 387, 56, 3, 94, "#6a6e88");
  R(c, 440, 56, 10, 94, "#aab0c4"); R(c, 440, 56, 3, 94, "#e8ecf8"); R(c, 447, 56, 3, 94, "#6a6e88");
  R(c, 376, 44, 78, 16, "#9aa0b8"); R(c, 376, 44, 78, 2, "#e8ecf8"); R(c, 376, 58, 78, 2, "#5a5e78");
  R(c, 432, 48, 10, 8, "#0a0810"); R(c, 433, 49, 3, 6, "#3fd07a"); R(c, 437, 49, 3, 6, "#7a1818"); em.push([433, 49, 3, 6]);
  txt(c, "WALK THRU", 384, 50, "#17131f");
  R(c, 376, 148, 78, 3, "#2a2838");
  // gate door (far right)
  R(c, 558, 56, 74, 94, "#2a2c40"); R(c, 560, 58, 70, 90, "#3a5a7a"); PK.gradV(c, 560, 58, 70, 90, ["#6a98b8", "#2a5a7a"], { dither: 1 });
  R(c, 594, 58, 2, 90, "#2a2c40"); R(c, 560, 98, 70, 2, "#2a2c40"); R(c, 586, 96, 2, 14, "#c8c4d8"); R(c, 600, 96, 2, 14, "#c8c4d8");
  PK.util.dshade(c, 560, 58, 70, 90, "#ffffff", (px, py) => (((px - 560) + (py - 58) + 400) % 34 < 5 ? 1 : 0), 0.22);
  E(A4.hangSign(c, 560, 38, 72, "GATES", { arrow: "^", h: 14 }));
  // queue stanchions
  A4.stanchions(c, 16, 128, 238, { n: 4 });
  A4.stanchions(c, 16, 100, 212, { n: 3 });
  return em;
}

function draw(c, S, t) {
  // x-ray monitor: your bag... or someone else's. All records, no weapons.
  R(c, 266, 104, 62, 22, "#0a1a1a");
  const f = Math.floor(t / 300) % 2;
  R(c, 272, 108, 28, 14, "#1a3a4a"); R(c, 274, 110, 24, 10, f ? "#2a6a7a" : "#2a7a6a");
  for (let i = 0; i < 6; i++) R(c, 276 + i * 4, 111, 2, 8, "#ffd23f");
  R(c, 300, 110, 18, 12, "#1a3a4a"); R(c, 302, 112, 14, 8, "#2a7a6a"); R(c, 306, 114, 6, 4, "#ffd23f");
  txt(c, "CLEAR", 304, 106, "#5cff9a");
  // rollers shimmer
  R(c, 118 + ((Math.floor(t / 90)) % 10) * 2, 140, 2, 2, "#5a5e7a");
  // detector lights
  P(c, 434, 51, Math.floor(t / 600) % 2 ? "#3fd07a" : "#1a6a3a");
}

function light(S) {
  return {
    ambient: "#8e94b2",
    lights: [
      { x: 120, y: 12, r: 150, color: "#e0f0ff", steps: 3, power: 0.5 }, { x: 270, y: 12, r: 150, color: "#e8f4ff", steps: 3, power: 0.5 },
      { x: 420, y: 12, r: 150, color: "#e0f0ff", steps: 3, power: 0.5 }, { x: 570, y: 12, r: 150, color: "#e8f4ff", steps: 3, power: 0.45 },
      { box: [560, 58, 70, 90], r: 70, color: "#ffd090", steps: 3, power: 0.55 }, { x: 298, y: 116, r: 56, color: "#5cd0a0", steps: 2, power: 0.45 }
    ],
    halos: [{ x: 298, y: 116, r: 22, color: "#5cd0a0", strength: 0.6 }], key: { x: 270, y: 12 }, shadow: 0.55
  };
}

/* ------------------------------------------------------------------ Delgado & Biscuit */
async function delgadoTalk(S) {
  if (!RP.has("a4_boarding") && !S.f.a4_bagBack) { await RP.say("Boarding pass, sir.", "a4_delgado"); return; }
  if (S.f.a4_bagBack) { await RP.lines(["@a4_delgado Got your bag? Good. Hold it like you love it.", "@a4_delgado Next time, buy a smaller dog. I mean bag."]); return; }
  if (S.f.a4_dogFed) { await RP.lines(["@a4_delgado Biscuit's on break. Take your bag. And if anyone asks, I didn't see a stranger give a federal employee beef jerky.", "That is a very specific denial."]); return; }
  if (S.f.a4_formSigned) { await RP.lines(["@a4_delgado Form's signed. Bag's on the table. The dog isn't moving. She's a professional.", "@a4_delgado I can't make her move. I can't give her treats on shift. But a stranger might, uh, accidentally have one."]); return; }
  if (S.f.a4_formStamped) { await RP.lines(["@a4_delgado You have a Form 7B? Let's see it.", "I have it right here. Stamped."]); return; }
  await RP.lines(["@a4_delgado Boarding pass. Fine.", "My bag's in Inspection, Officer. K9 flagged it. It's records.", "@a4_delgado I know which bag. It's got a hold on it. I can't release it without a Form 7B, stamped by Baggage Services, signed by me.",
    "Baggage Services says you have to sign first.", "@a4_delgado They say that to everybody. Go get the stamp. Priya'll do it eventually. She's on break."]);
}
async function giveToDelgado(S, item) {
  if (item === "a4_form") {
    if (S.f.a4_formSigned) return "He's already signed it. A signature from a man with a mustache like that is binding.";
    if (!S.f.a4_formStamped) { await RP.lines(["@a4_delgado No stamp. Baggage Services. They have to stamp it first.", "They told me you have to sign first.", "@a4_delgado Of course they did. Go back and get the stamp. Priya does it eventually."]); return; }
    S.f.a4_formSigned = true; RP.take("a4_form");
    await RP.lines(["@a4_delgado Stamped. By Priya? She NEVER stamps. Did she put a smiley on it?", "...She did.", "@a4_delgado Huh. Then it's real.", "(He signs it with a pen the size of a baton.)",
      "@a4_delgado Bag's on the inspection table. But Biscuit's on the bag. She's a professional. She won't leave for me. I'm not allowed to give her treats on shift.",
      "@a4_delgado A stranger, though... A stranger might accidentally have a treat. I'm going to look at that wall for a minute."]);
    RP.actor("a4_delgado").face = "right";
    return;
  }
  if (item === "a4_boarding") return "He glances at it. \"Seat 23A. Hope you like clouds.\" He hands it back with the tenderness of a man who's seen too many.";
  if (item === "a4_jerky") return "Giving jerky to the officer is bribery. And I'd have to bribe a dog next. Also bribery.";
  return "He doesn't want that. He wants a signed form and a peaceful lunch.";
}
async function biscuitFeed(S) {
  if (S.f.a4_dogFed) return "She's eating. She's the happiest federal employee in the building.";
  if (!S.f.a4_formSigned) { await RP.lines(["@a4_delgado Sir! Don't feed the K9.", "(Bribery's a crime. Also, I need the form signed first. I'm learning a lot about bureaucracy.)"]); return; }
  RP.take("a4_jerky");
  await RP.lines(["I offer Biscuit the jerky. She looks at it. She looks at me. She looks at Delgado.", "@a4_delgado (staring very hard at the wall)"]);
  RP.sfx("pickup"); await RP.wait(500);
  S.f.a4_dogFed = true;
  await RP.lines(["*CHOMP.* Biscuit hops off the bag and carries her prize under the table. 22% real jerky and 100% real happiness.", "The bag's free. The bag is... right there."]);
}
async function takeBag(S) {
  if (S.f.a4_bagBack) return "I've got the bag. I'm never putting it down again.";
  if (!S.f.a4_formSigned) { await RP.say("Hands off, sir. That's evidence.", "a4_delgado"); return; }
  if (!S.f.a4_dogFed) { await RP.lines(["I reach for the bag. Biscuit growls. It's a very small, very professional growl.", "I'll need to get her off it first. She's a beagle. Beagles like one thing."]); return; }
  S.f.a4_bagBack = true; RP.give("a4_bag");
  RP.sfx("pickup");
  await RP.lines(["Thirty-eight kilos of records, back in my arms. It's never been so heavy. Or so beautiful.", "Okay. Gates. Plane. Berlin. Nothing else goes wrong."]);
  RP.setClock("FRI 4:36 PM");
}
async function boardTheGate(S) {
  if (!S.f.a4_bagBack) { await RP.say("I can't board without my bag. Without records I'm just a guy with feelings and a window seat."); return; }
  await RP.lines(["Through the metal detector. Chain, belt, keys, coins, jacket, dignity: all in a tray.", "*BEEP*"]);
  RP.sfx("buzz");
  await RP.lines(["@a4_delgado Anything in your pockets?", "A hole. A metaphorical one.", "@a4_delgado Jacket.", "(I take off the bomber. It beeps again. The bomber is made of beeping.)",
    "@a4_delgado Go. Go before it beeps a third time. Have a nice flight, uh, \"" + A4.misspell(A4.dj(S)) + ".\""]);
  S.f.a4_boarded = true;
  await RP.goto("a4_plane", 70, 228, "right");
}

/* ------------------------------------------------------------------ the room */
RP.room({
  id: "a4_security", act: 4, name: "Security Checkpoint",
  paint, draw, light, ambience: "airport", music: null,
  walk: [[8, 206], [200, 202], [540, 202], [630, 250], [8, 250]],
  start: { x: 80, y: 232, face: "right" },
  actors: [
    { id: "a4_delgado", char: "a4_delgado", x: 354, y: 214, face: "front", act: "stand", name: "Officer Delgado" },
    { id: "a4_pax6", char: "a4_pax6", x: 90, y: 238, face: "right", act: "stand", clickable: false },
    { id: "a4_pax1", char: "a4_pax1", x: 52, y: 214, face: "right", act: "stand", clickable: false }
  ],
  sprites: [
    { y: 202, draw: c => sprInspectTable(c, 470, 142) },
    { y: 190, vis: S => !S.f.a4_bagBack, draw: c => sprRecordBagOnTable(c, 502, 134) },
    { y: 198, vis: S => !S.f.a4_dogFed && !S.f.a4_bagBack, draw: c => sprBiscuit(c, 508, 112) },
    { y: 236, vis: S => !!S.f.a4_dogFed, draw: c => sprBiscuitFed(c, 500, 214) },
    { y: 150, draw: c => sprBins(c, 116, 106) }
  ],
  self: { look: "Tour bomber, headphones, a belt buckle with ambition. I'm about to beep.", talk: "I'm talking to myself in a security line. It's the only conversation nobody will ask me to take outside." },
  hotspots: [
    { id: "a4_delgado", name: "Officer Delgado", look: "Officer Delgado: big, mustached, with a lanyard and the stillness of a man who's heard every excuse. He's holding a pen the size of a baton.",
      talk: S => delgadoTalk(S), give: (S, item) => giveToDelgado(S, item),
      pickup: "I'd like to keep my freedom. And my arms.", push: "I'd like to keep both arms, thanks." },
    { id: "a4_biscuit", name: "Biscuit", r: [504, 112, 46, 36], z: 70, vis: S => !S.f.a4_dogFed && !S.f.a4_bagBack, walk: [490, 226, "right"],
      look: "Biscuit, a beagle in a K9 vest, sitting on my record bag like it's her egg. She's looking at me like she's looked into my soul and found vinyl.",
      talk: "\"Who's a good girl?\" She doesn't blink. She's a professional.", pickup: "I'd like to keep both my hands. And my record bag, which she's sitting on.", push: "She's a federal employee. I'd rather not.",
      give: (S, item) => item === "a4_jerky" ? biscuitFeed(S) : "Biscuit's not interested. She wants something chewy and cured." },
    { id: "a4_biscuitfed", name: "Biscuit", r: [500, 214, 48, 28], z: 70, vis: S => !!S.f.a4_dogFed, walk: [480, 234, "right"], look: "Biscuit, under the table, chewing jerky with the quiet joy of a dog on her break.", talk: "She doesn't answer. She's busy.", pickup: "I wouldn't dare.", give: "She's got her jerky. She's good." },
    { id: "a4_inspect", name: "inspection table", r: [470, 142, 120, 66], z: 40, walk: [500, 224, "back"],
      look: S => S.f.a4_bagBack ? "The inspection table, now with no record bag. Just a faint smell of nostalgia." : "A steel inspection table. On it: my record bag, and on the bag: a beagle.",
      pickup: S => takeBag(S), use: S => takeBag(S), open: S => takeBag(S) },
    { id: "a4_bag_on_table", name: "my record bag", r: [500, 134, 44, 30], z: 66, vis: S => !S.f.a4_bagBack, walk: [500, 224, "back"],
      look: "My record bag, under a K9. It's got my whole career in it. Mostly Detroit and Berlin. Biscuit seems to approve.", pickup: S => takeBag(S), use: S => takeBag(S), open: S => takeBag(S) },
    { id: "a4_xray", name: "X-ray machine", r: [168, 80, 96, 66], z: 30, walk: [210, 218, "back"], look: "An X-ray machine for bags. The screen says CLEAR in bright green: it's one of the few honest things here.", use: "I'm not putting myself in it. I'd come out as a skeleton in a bomber.", push: "It's not that kind of machine." },
    { id: "a4_xrayscreen", name: "X-ray monitor", r: [264, 100, 68, 32], z: 40, walk: [296, 218, "back"], look: "An X-ray of somebody's bag: a tiny keyboard, forty pairs of socks, and a smiling something. All records, no weapons." },
    { id: "a4_arch", name: "metal detector", r: [376, 44, 80, 108], z: 25, walk: [414, 224, "back"],
      look: "A metal detector. It's got a green light and a red light and, through no fault of its own, an attitude.", use: S => boardTheGate(S), push: "It's an arch. You walk through arches. You don't push them." },
    { id: "a4_bins", name: "trays", r: [114, 106, 60, 44], z: 45, walk: [144, 218, "back"], look: "Gray plastic trays for your belt, shoes, jacket, watch, dignity. I'm putting in my dignity first. It's the lightest.", pickup: "I don't need a tray. I'm traveling with nothing in my pockets but disappointment.", use: "I put my shoes in the tray and my belt in my shoes. A tray's got its own life." },
    { id: "a4_signs", name: "signs", rects: [[22, 42, 42, 56], [68, 44, 32, 40]], z: 20, walk: [70, 218, "back"], look: "SHOES. BELT. JACKET. DIGNITY. LIQUIDS: 100ML. NO EXCEPT. The signs are polite about it, mostly." },
    { id: "a4_stanch", name: "stanchions", rects: [[14, 190, 116, 50]], z: 20, walk: [140, 232, "left"], look: "Red belt stanchions in a maze. A queue for humans, designed by someone who has never met one.", push: "I'm not knocking over the stanchions. That's a whole ordeal.", pickup: "They're sort of in the way. But they're doing their job." },
    { id: "a4_gates", name: "Gates", r: [558, 56, 76, 96], z: 22, walk: [596, 226, "right"],
      look: "The glass door to the gates. Past it, the plane, the flight, Berlin, and a future where I never see this checkpoint again.",
      use: S => boardTheGate(S), open: S => boardTheGate(S), walkTo: S => boardTheGate(S) },
    { id: "a4_back", name: "Main hall", r: [0, 150, 24, 100], z: 15, walk: [24, 232, "left"], look: "The way back to the main hall. Where bags get checked and never seen again.", exit: { room: "a4_jfk", x: 580, y: 226, face: "left" } },
    { id: "a4_banner", name: "Security sign", r: [120, 14, 280, 20], z: 20, walk: [260, 218, "back"], look: "SECURITY CHECKPOINT, in bright yellow. If it wanted to be friendly it would've said \"hello.\"" },
    { id: "a4_floor", name: "floor", r: [8, 204, 620, 46], z: 5, floor: true, look: "Scuffed security tile. There are footprints on it for people who don't know where to stand. Me." }
  ],
  combos: [
    ["a4_form", "a4_delgado", S => giveToDelgado(RP.state, "a4_form")],
    ["a4_jerky", "a4_biscuit", S => biscuitFeed(RP.state)],
    ["a4_jerky", "a4_inspect", S => biscuitFeed(RP.state)],
    ["a4_jerky", "a4_delgado", "Giving jerky to the officer is bribery. And I'd have to bribe a dog next. Also bribery."],
    ["a4_boarding", "a4_delgado", S => giveToDelgado(RP.state, "a4_boarding")],
    ["a4_claim", "a4_delgado", "He glances at the tag. \"That's Baggage Services' problem. I handle the detained part.\""],
    ["a4_form", "a4_biscuit", "She's a beagle. She can't sign. She also can't read. She CAN smell, though, and she smells the stamp."],
    ["a4_passport", "a4_delgado", "He doesn't need to see it. He needs to see a stamped form. He's quite particular."],
    ["a4_white", "a4_biscuit", "She sniffs the white label. She sneezes. A first review."]
  ],
  enter: async (S, from) => {
    if (!S.f.a4_secIntro) {
      S.f.a4_secIntro = true; RP.setClock("FRI 4:22 PM");
      await RP.lines(["Security. Trays, belts, a queue shaped like a lie. And over by the inspection table, a beagle in a vest, sitting on my record bag.", "Biscuit, a K9, is currently the most powerful being in the airport. Officer Delgado is next to her, signing nothing."]);
    }
  }
});
})();
