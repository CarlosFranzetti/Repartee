/* Act 5 — a5_axl: Axl Vanta's gold dressing-room trailer. Enter with the smoothie. club.Drama (scenario "ego") over the slot swap.
   Twinkie's intel (Alex / Staten Island / his mother's banner) lowers the difficulty. Winning makes him promise to end at 11:30 sharp. (He won't.) */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u, PK = RP.PK, A5 = RP.a5, art = A5.art;
const { R, P, ell, line, poly, bayer, mulberry, mix, txt, txtC, txtW, clamp } = U;
const K = U.ramp;
const HL = (c, x, y, w, col) => R(c, x, y, w, 1, col), VL = (c, x, y, h, col) => R(c, x, y, 1, h, col);

function paint(c, S) {
  const em = [];
  PK.carpet(c, 0, 0, 640, 168, { pattern: "hotel", base: "#5a2234", accent: "#d8b060" });
  /* crown molding + baseboard in gold */
  R(c, 0, 0, 640, 8, "#c8901c"); HL(c, 0, 0, 640, "#fff0b0"); HL(c, 0, 7, 640, "#6a4a10");
  R(c, 0, 163, 640, 8, "#c8901c"); HL(c, 0, 163, 640, "#fff0b0"); HL(c, 0, 170, 640, "#6a4a10");
  PK.planks(c, 0, 171, 640, 85, { base: "#3a1a24", seed: 11 });
  ell(c, 320, 238, 190, 14, "#8a1a2a"); ell(c, 320, 238, 184, 12, "#a02a3e"); ell(c, 320, 238, 150, 9, "#c04860"); ell(c, 320, 238, 146, 8, "#a02a3e");
  /* vanity mirror: a wall of bulbs */
  const mx = 34, my = 22, mw = 190, mh = 112;
  R(c, mx - 6, my - 6, mw + 12, mh + 12, "#2a1018"); R(c, mx, my, mw, mh, "#e0d0a8"); PK.gradV(c, mx, my, mw, mh, ["#fff0c8", "#e8d098", "#c8a468"], { dither: 1 });
  PK.util.dshade(c, mx, my, mw, mh, "#ffffff", (px, py) => ((px - mx) * 0.8 + (py - my) + 900) % 60 < 6 ? 1 : 0, 0.28);
  PK.util.dshade(c, mx, my, mw, mh, "#ffffff", (px, py) => ((px - mx) * 0.8 + (py - my) + 900 - 30) % 120 < 3 ? 1 : 0, 0.2);
  for (let i = 0; i < mw + 12; i += 9) { [my - 6, my + mh + 2].forEach(by => { R(c, mx - 6 + i, by, 4, 4, "#fff0b0"); P(c, mx - 6 + i, by, "#ffffff"); em.push([mx - 6 + i, by, 4, 4]); }); }
  for (let i = 9; i < mh + 12; i += 9) { [mx - 6, mx + mw + 2].forEach(bx => { R(c, bx, my - 6 + i, 4, 4, "#fff0b0"); P(c, bx, my - 6 + i, "#ffffff"); em.push([bx, my - 6 + i, 4, 4]); }); }
  /* a reflection of nothing: the room behind the camera */
  for (let i = 0; i < 8; i++) { R(c, mx + 14 + i * 22, my + 8, 3, 3, "#ffffff"); }
  R(c, mx + 120, my + 60, 56, 52, "#b89458"); ell(c, mx + 148, my + 50, 14, 18, "#c8a468"); PK.util.dshade(c, mx + 100, my + 30, 100, 82, "#8a6a34", (px, py) => 0.4, 0.2);
  em.push([mx, my, mw, mh]);
  /* a sign over the mirror */
  R(c, 90, 6, 80, 14, "#17131f"); txtC(c, "NO EYE CONTACT", 130, 10, "#ffd23f", 1, 1); em.push([90, 6, 80, 14]);
  /* vanity counter */
  R(c, 20, 136, 220, 8, "#e8d8a0"); HL(c, 20, 136, 220, "#ffffff"); HL(c, 20, 143, 220, "#8a6a2a"); R(c, 24, 144, 212, 26, "#3a1018"); for (let x = 24; x < 236; x += 24) { R(c, x + 2, 148, 20, 18, "#4a1a24"); HL(c, x + 2, 148, 20, "#7a3a44"); R(c, x + 9, 156, 6, 2, "#e0c870"); }
  /* things on the vanity: a thousand hairspray cans, a comb, a tiny gold trophy */
  for (let i = 0; i < 9; i++) { R(c, 30 + i * 6, 122, 5, 14, i % 3 ? "#f4f0e8" : "#c8c4d8"); R(c, 30 + i * 6, 122, 5, 2, "#c0302c"); HL(c, 30 + i * 6, 124, 5, "#ffffff"); }
  R(c, 104, 129, 20, 6, "#17131f"); for (let i = 0; i < 10; i++) VL(c, 105 + i * 2, 126, 4, "#17131f");
  R(c, 136, 124, 8, 12, "#e8c040"); ell(c, 140, 124, 5, 3, "#fff0a0"); R(c, 134, 134, 12, 2, "#8a6a2a");
  R(c, 160, 128, 30, 8, "#ffd23f"); R(c, 160, 128, 30, 2, "#fff0a0"); txt(c, "BILLION", 162, 130, "#c0302c", 1, 1);
  /* platinum + gold records on the wall */
  [[254, 30, "#e8e4f0"], [290, 30, "#e8c040"], [326, 30, "#e8c040"], [254, 66, "#e8c040"], [290, 66, "#e8e4f0"], [326, 66, "#e8e4f0"]].forEach(([fx, fy, rc]) => {
    PK.frame(c, fx, fy, 30, 32, { color: "#c8901c" }); ell(c, fx + 15, fy + 16, 9, 9, rc); ell(c, fx + 15, fy + 16, 3, 3, "#17131f"); P(c, fx + 10, fy + 11, "#ffffff");
  });
  txtC(c, "1,000,000,000 STREAMS", 310, 104, "#ffd23f", 1, 1);
  /* the rider table: right */
  PK.table(c, 392, 146, 130, 44, { color: "#8a5a3e", top: "#d8c8a0" });
  /* a rack of identical white tanks */
  R(c, 540, 40, 80, 3, "#c8c4d8"); R(c, 540, 40, 3, 126, "#c8c4d8"); R(c, 617, 40, 3, 126, "#c8c4d8"); HL(c, 540, 40, 80, "#ffffff");
  for (let i = 0; i < 9; i++) { const tx = 548 + i * 8; P(c, tx + 3, 44, "#8a86a0"); R(c, tx, 46, 8, 34, "#efeaf6"); HL(c, tx, 46, 8, "#ffffff"); VL(c, tx + 7, 46, 34, "#c8c4d8"); R(c, tx + 2, 46, 4, 6, "#8a86a0"); }
  /* door (right) */
  PK.door(c, 596, 54, 42, 112, { color: "#c8901c", panels: 4, seed: 21 });
  /* a window-less "sunlight" lamp */
  R(c, 330, 4, 36, 4, "#17131f"); [336, 346, 356].forEach(lx => { R(c, lx, 8, 6, 4, "#fff0c0"); em.push([lx, 8, 6, 4]); });
  return em;
}

function drawCutout(c, S) {
  /* a life-size cardboard Axl, with a brown easel back */
  R(c, 310, 128, 3, 70, "#8a6a4a"); R(c, 358, 128, 3, 70, "#8a6a4a");
  RP.chars.draw(c, { id: "axl", x: 336, y: 206, face: "front", act: "stand", scale: 1.1 }, { lx: -0.3, rim: null, shadow: 0.2 });
  R(c, 320, 206, 32, 3, "#c8a870"); HL(c, 320, 206, 32, "#e8d098"); txt(c, "AXL!", 330, 208, "#c0302c", 1, 1);
}
function drawRider(c, S) {
  /* the rider: twelve identical bottles, a bowl of ONLY blue candies, a wheel of cheese, a blender */
  for (let i = 0; i < 12; i++) { R(c, 398 + i * 8, 118, 5, 12, "#cfe4ef"); R(c, 399 + i * 8, 116, 3, 3, "#efeaf6"); HL(c, 398 + i * 8, 118, 5, "#ffffff"); }
  ell(c, 482, 134, 14, 6, "#efeaf6"); ell(c, 482, 131, 12, 5, "#39a0e8"); for (let i = 0; i < 14; i++) P(c, 472 + (i * 5) % 20, 128 + (i % 4), "#8ad0ff");
  R(c, 498, 126, 22, 12, "#f0c040"); R(c, 498, 126, 22, 3, "#fff08a"); poly(c, [[498, 126], [520, 126], [520, 138], [514, 136]], "#d8a020");
  R(c, 378, 124, 14, 22, "#2a2838"); R(c, 380, 112, 10, 14, "#bfe8f4"); R(c, 381, 118, 8, 8, "#9be15d"); R(c, 376, 146, 18, 3, "#17131f");
  R(c, 402, 150, 118, 14, "#7a1a2a"); HL(c, 402, 150, 118, "#c04860"); txtC(c, "NO. NOT THAT ONE.", 461, 154, "#ffd23f", 1, 1);
}
function drawChair(c, S) {
  PK.chair(c, 118, 164, { kind: "wood", color: "#7a1a2a", flip: false });
}
function drawSofa(c, S) {
  PK.couch(c, 356, 188, 148, { color: "#2a1a4a", seed: 3 });
}
function drawSmoothieOnTable(c, S) {
  if (S.f.a5_axlSmoothieOn) { R(c, 410, 128, 8, 15, "#9be15d"); R(c, 410, 128, 8, 2, "#cfffa8"); R(c, 409, 126, 10, 2, "#efeaf6"); R(c, 414, 120, 2, 6, "#c0302c"); }
}

function lightMap(S) {
  return { ambient: "#a87880", lights: [
    { x: 130, y: 70, r: 240, color: "#fff0c8", steps: 5, power: 1.0 }, { x: 330, y: 8, r: 220, color: "#ffe2b0", steps: 4, power: 0.8 },
    { x: 560, y: 90, r: 130, color: "#ffd890", steps: 3, power: 0.5 }],
    halos: [{ x: 130, y: 70, r: 40, color: "#ffe2b0", strength: 0.8 }, { x: 346, y: 8, r: 30, color: "#fff0c0", strength: 0.7 }],
    rims: [{ x: 130, y: 60, r: 260, color: "#ffe2b0" }], key: { x: 130, y: 50 }, shadow: 0.55 };
}

/* --------------------------------------------------------------------------------------- the duel */
async function axlScene(S) {
  if (S.f.a5_axlDone) { await RP.lines(["@axl Out. I've given you what you asked for. I want to be alone with my reflection."]); return; }
  if (RP.has("a5_smoothie")) { RP.take("a5_smoothie"); S.f.a5_axlSmoothieOn = true; }
  await RP.lines([
    "@axl Put it on the table. Don't speak. ...Is that no ice?",
    "No ice.",
    "@axl ...No seeds?",
    "No seeds.",
    "@axl And you're not looking at me.",
    "I'm looking at the ceiling. It's very nice.",
    "@axl Okay. You live. Who are you?",
    "I'm the headliner.",
    "@axl I'M the headliner.",
    "There are two headliners?",
    "@axl There's ONE. Look at the poster. My name's bigger. I've got a billion streams. A billion! Do you know what a billion is?",
    "It's a lot of lonely people with headphones.",
    "@axl ...That's very rude. Also correct. Keep going.",
    "Your agent emailed Roz. They want to move me to nine and you to midnight.",
    "@axl The algorithm says I close. The algorithm's rarely wrong. It's said so."
  ]);
  /* choose how to handle it */
  const opts = ["Hold the line: \"11:45 is in my contract.\"", "Flatter him: \"You're the reason I started.\""];
  if (S.f.a5_axlIntel) opts.push("\"Alex. Your mom's in the front row. With a banner.\"");
  opts.push("Back out of the trailer slowly");
  const i = await RP.choose(opts);
  let diff = S.f.a5_axlAngry ? 4 : 3, bonus = "";
  if (i === 0) await RP.lines(["@axl A contract. I have lawyers that eat contracts for lunch.", "I have Margo. Margo eats lawyers."]);
  else if (i === 1) { await RP.lines(["@axl Of course I'm the reason. Everyone says that. It gets old. It doesn't. Say it again.", "You... shaped a generation."]); diff = Math.max(2, diff - 1); }
  else if (S.f.a5_axlIntel && i === 2) {
    await RP.lines(["@axl ...What did you say?", "Alex. Your mother has a banner. It says \"MY ALEX.\"", "@axl ...Who told you about the banner?", "A woman who remembers everything.", "@axl Twinkie. Of course. Okay. Okay okay okay. Listen. That's between us."]);
    diff = 2; S.f.a5_axlLeverage = true;
  } else { await RP.lines(["I back out slowly.", "@axl Where do you think you're going? We're mid-argument."]); }
  const res = await A5.play("clubDrama", { scenario: "ego", rival: "Axl Vanta", venue: "Harbor Lights", slot: "11:45 PM", rivalSlot: "10:15 PM", difficulty: diff }, { skipLabel: "Let him have the last word" });
  S.f.a5_axlDone = true; S.f.a5_axlWon = !!(res.ok && !res.skipped);
  if (S.f.a5_axlWon) {
    RP.sfx("success");
    await RP.lines([
      "@axl FINE. Fine! You take eleven forty-five. I take ten-fifteen.",
      "@axl I'll be off by eleven-thirty. Sharp. Rough. Sort of. Within reason.",
      "Sharp.",
      "@axl Don't push it. You've made me emotional. I need to go stare at myself."
    ]);
    RP.followers(500);
  } else {
    await RP.lines([
      "@axl Here's the thing. You play at eleven forty-five. But the stage clock is MY clock. If I'm a bit over, you wait. That's the deal.",
      "That's not a deal. That's a hostage situation.",
      "@axl Same thing, with better lighting."
    ]);
  }
  S.f.a5_phase = 2; RP.setClock("SAT 9:40 PM"); RP.relight();
  await RP.lines(["@axl Out. And take the empty cup. I mean it."]);
  await RP.goto("a5_backstage", 462, 234, "back");
}

/* --------------------------------------------------------------------------------------- room */
RP.room({
  id: "a5_axl", act: 5, name: "Axl's trailer", paint, cacheKey: S => "x", light: lightMap, ambience: "room",
  walk: [[10, 222], [560, 222], [560, 252], [10, 252]],
  start: { x: 120, y: 232, face: "right" },
  actors: [{ id: "axl", char: "axl", x: 214, y: 226, face: "right", act: "stand", name: "Axl Vanta", expr: "angry" }],
  sprites: [
    { y: 208, draw: art.sprite((c, S) => drawCutout(c, S)) },
    { y: 191, draw: art.sprite((c, S) => drawRider(c, S)) },
    { y: 198, draw: art.sprite((c, S) => drawSmoothieOnTable(c, S), S => !!S.f.a5_axlSmoothieOn) },
    { y: 234, draw: art.sprite((c, S) => drawChair(c, S)) },
    { y: 213, draw: art.sprite((c, S) => drawSofa(c, S)) }
  ],
  hotspots: [
    { id: "a5_xdoor", name: "door", r: [594, 52, 46, 116], z: 20, walk: [600, 226, "right"], look: "The way out. It's solid gold-colored. Probably it's just paint. I shouldn't scratch it.", exit: S => S.f.a5_axlDone ? { room: "a5_backstage", x: 462, y: 234, face: "back" } : "Not yet. We're mid-argument and he's got the high ground." },
    { id: "a5_xmirror", name: "vanity mirror", r: [28, 16, 202, 124], z: 20, walk: [130, 226, "back"], look: "A vanity mirror framed by sixty lights. Axl needs his reflection lit from every angle at once. That's a lot of watts for self-esteem.", talk: "I say \"hi\" to the mirror. Axl says \"don't talk to my mirror.\"", use: "Axl: \"DO NOT TOUCH. It has a relationship with my face.\"", pickup: "Absolutely not." },
    { id: "a5_xsign", name: "sign", r: [86, 4, 90, 18], z: 28, walk: [130, 226, "back"], look: "A sign above the mirror: NO EYE CONTACT. It's gold lettering. It's not a joke. It might be a rider clause." },
    { id: "a5_xvanity", name: "vanity table", r: [18, 118, 226, 56], z: 18, walk: [130, 228, "back"], look: "Hairspray cans lined up like soldiers, a comb for a mohawk, a gold trophy that says ONE BILLION in tiny letters. The cans outnumber the guests.", pickup: "Not touching Axl's hairspray. It's a flame hazard and a personality.", use: "Axl: \"That's my station. Touch it and I'll feel it.\"" },
    { id: "a5_xcutout", name: "Axl cardboard cutout", r: [306, 122, 60, 90], z: 22, walk: [336, 230, "back"], look: "A life-size cardboard Axl. He's pointing at me. The real Axl is pointing at me too. It's like having two of them.", talk: "\"Nice mohawk.\" The cutout doesn't answer. It's the better listener.", push: "I push the cutout. It wobbles. Axl gasps. I stop.", pickup: "It's his. Also it's taller than me." },
    { id: "a5_xrec", name: "platinum records", r: [252, 28, 112, 74], z: 20, walk: [300, 226, "back"], look: "Six framed records: three gold, three platinum. ONE BILLION STREAMS, in gold letters under them. Not one of them is vinyl. I respect the plaque, not the format.", pickup: "They're glued to the wall. The wall is glued to the trailer." },
    { id: "a5_xtable", name: "rider table", r: [376, 110, 148, 90], z: 30, walk: [450, 232, "back"], look: "A rider table with TWELVE identical bottles of water, a bowl of only blue candies, a wheel of cheese and a blender. A sign: NO. NOT THAT ONE. There's a story behind it. I don't want to know.", use: "I'm not touching the rider. The rider has teeth.", pickup: "The blue candies are tempting. The sign says no. I take nothing." },
    { id: "a5_xrack", name: "rack of white tanks", r: [538, 36, 84, 80], z: 20, walk: [575, 232, "back"], look: "A rack of identical white tank tops, nine of them. I can't tell them apart. Neither can his stylist. They're all \"the one.\"", pickup: "Not stealing a tank top. It would be too small. And too obvious.", use: "Axl: \"That's the TANK rack. Don't breathe near it.\"" },
    { id: "a5_xsofa", name: "sofa", r: [352, 168, 156, 54], z: 24, walk: [430, 236, "back"], look: "A purple velvet sofa the size of a small car. It's got that \"I've been sat on by a billion streams\" look.", use: "Axl: \"Don't sit. It's calibrated.\"", pickup: "I can't pick up a sofa. Not even a sad one." },
    { id: "axl", name: "Axl Vanta", talk: S => axlScene(S), look: "Axl Vanta. Yellow mohawk, white tank, shades indoors. A man who is a brand wearing a man.", give: (S, item) => item === "a5_smoothie" ? axlScene(S) : "Axl: \"For me? How dare you.\"", pickup: "I'd need a crane and a legal waiver.", use: S => axlScene(S), push: "I do not touch Axl. I'm not paid enough.", pull: "No. Not even if he asks." }
  ],
  combos: [
    ["a5_smoothie", "axl", S => axlScene(RP.state)],
    ["a5_marker", "axl", "Axl: \"Autograph? From ME? On YOU? Yes. Quick. Don't look at me.\" I'm not signing anything. I'm busy."],
    ["a5_pass", "axl", "Axl: \"Hmm. Your pass has a typo. I'll never understand how a person can be on a bill with a typo.\""]
  ],
  enter: async (S) => {
    if (!S.f.a5_axlDone) await axlScene(S);
  },
  self: { look: "A DJ with a pink-lined coat in a room of gold. I'm out-shined, but I have taste.", talk: "I've got nothing to say to myself in this room. The mirror's listening." }
});
})();
