/* Act 2 — outside the Bushwick loft on Meserole Street, Saturday night. Two ways in:
   (1) talk Fitz into it: "Dani says the tab is closed" (guest list), or
   (2) sneak: push the dumpster under the fire escape's dangling ladder and climb into the bathroom window.
   Flags: a2_inLoft, a2_sneaked, a2_dumpster (moved), a2_fitzTries */
(function () {
"use strict";
const RP = window.RP, A2 = RP.a2, PK = RP.PK;
const { R, P, ell, txt, txtC } = RP.u;
const U = PK.util;
const W = 640;

function paint(c, S) {
  const em = [];
  PK.sky(c, 0, 0, W, 190, { time: "night", seed: 61, stars: 60, moon: { x: 590, y: 30, r: 7 } });
  em.push.apply(em, PK.skyline(c, 0, 60, W, 110, { night: true, layers: 2, seed: 62, spire: true, spireX: 90 }));
  // neighbors: a low brick building on the right, a dark gap and a graffiti wall on the left
  PK.brick(c, 568, 70, 72, 116, { base: "#5a3238", mortar: "#4a4050", worn: 0.6, seed: 63 });
  em.push.apply(em, PK.window(c, 580, 82, 28, 36, { view: "interior", lit: true, frame: "#6a6080", seed: 64, curtain: "#e0a030" }));
  PK.brick(c, 0, 50, 130, 136, { base: "#4a2e36", mortar: "#3a3446", worn: 0.7, seed: 65 });
  U.dshade(c, 0, 50, 130, 136, "#06020e", (x, y) => 0.45, 0.5);
  txt(c, "SKEET", 14, 78, "#39d0ff", 3, 1); txt(c, "NO ADS", 8, 110, "#ff3fa4", 1, 1); R(c, 20, 120, 60, 2, "#ffd23f");
  // the factory: a big brick building with a row of glowing windows
  PK.brick(c, 130, 16, 438, 170, { base: "#6c3a3c", mortar: "#4a4050", worn: 0.55, seed: 66 });
  R(c, 126, 12, 446, 8, "#2a1a22"); U.HL(c, 126, 12, 446, "#7a5a50"); U.HL(c, 126, 19, 446, "#0c0610");
  const WC = ["#ff3fa4", "#39d0ff", "#a05cff", "#ffd23f", "#ff3fa4", "#5cff9a"];
  for (let i = 0; i < 6; i++) {
    const wx = 146 + i * 66;
    em.push.apply(em, A2.window(c, wx, 30, 54, 62, { frame: "#7a6a90", cols: 1, t: 4, view: (cc, gx, gy, gw, gh) => {
      PK.gradV(cc, gx, gy, gw, gh, [WC[i], "#7a3fb0", "#1b1440"], { dither: 1 });
      PK.crowdSilhouettes(cc, gx, gy + gh - 28, gw, 30, { seed: 70 + i, rim: [WC[i], "#ffffff"], rows: 2, density: 0.95 });
      return [[gx, gy, gw, gh]];
    }, sill: "#8a7aa0" }));
  }
  // the door: a steel door with a bare bulb, a neon, a brass plate
  U.dshade(c, 316, 90, 96, 96, "#0c0618", (x, y) => 0.3, 0.3);
  PK.door(c, 330, 96, 66, 90, { metal: true, window: false, color: "#5a6a7a", knob: false });
  R(c, 336, 108, 54, 10, "#14121a"); txtC(c, "MESEROLE LOFT", 363, 110, "#ffd27a", 1, 1); em.push([336, 108, 54, 10]);
  em.push.apply(em, PK.neon(c, "LOFT", 336, 64, "#ff3fa4", { scale: 3, tube: 3 }));
  em.push.apply(em, PK.bulb(c, 363, 76, { len: 6, glowR: 40 }));
  PK.window(c, 150, 118, 50, 34, { view: "interior", lit: false, bars: true, frame: "#7a6a90", seed: 3 });
  // fire escape + the dangling drop ladder
  PK.fireEscape(c, 136, 20, 70, 118, { floors: 2, ladder: false, color: "#1c1626", seed: 7 });
  R(c, 190, 134, 2, 22, "#4a4460"); R(c, 199, 134, 2, 22, "#4a4460"); for (let y = 138; y < 156; y += 5) R(c, 190, y, 11, 1, "#4a4460");
  R(c, 195, 130, 1, 8, "#8a869c");
  // sidewalk, curb, street
  PK.sidewalk(c, 0, 182, W, 40, { curbY: 208, seed: 67 });
  PK.asphalt(c, 0, 222, W, 34, { lines: ["dashedY"], seed: 68 });
  // flyers pasted along the building base
  [[226, 120, "#f4ead0"], [250, 128, "#39d0ff"], [452, 124, "#ff6cbb"], [474, 130, "#ffd23f"]].forEach(([x, y, col]) => { R(c, x, y, 16, 20, col); R(c, x + 2, y + 3, 12, 2, "#1d1622"); R(c, x + 2, y + 8, 8, 1, "#1d1622"); });
  // rope stanchions for the line
  [[300, 190], [324, 190]].forEach(([x, y]) => { R(c, x, y, 3, 20, "#8a869c"); U.VL(c, x, y, 20, "#e8e4f4"); ell(c, x + 1, y - 1, 3, 3, "#d8b050"); });
  for (let i = 0; i < 20; i++) P(c, 303 + i, 194 + Math.round(Math.sin(i / 6) * 2), "#c0302c");
  return em;
}

function drawDumpster(c, S) {
  const x = S.f.a2_dumpster ? 164 : 38, y = 168, w = 70, h = 40, k = RP.u.ramp("#2a6a4a");
  U.groundShadow(c, x + w / 2, y + h + 2, w / 2 + 2, 3, 0.55);
  R(c, x, y + 8, w, h - 8, "#2a6a4a"); PK.gradV(c, x, y + 8, w, h - 8, [k[3], "#2a6a4a", k[1]], { dither: 1 }); U.HL(c, x, y + 8, w, k[4]); U.VL(c, x, y + 8, h - 8, k[3]); U.VL(c, x + w - 1, y + 8, h - 8, k[0]);
  RP.u.poly(c, [[x - 2, y + 8], [x + 6, y], [x + w - 6, y], [x + w + 2, y + 8]], "#1d4a34"); U.HL(c, x + 6, y, w - 12, k[4]);
  for (let i = 0; i < 4; i++) U.VL(c, x + 12 + i * 15, y + 12, h - 16, k[1]);
  R(c, x + 4, y + h, 5, 4, "#14121a"); R(c, x + w - 9, y + h, 5, 4, "#14121a");
  txt(c, "SKEET'S", x + 16, y + 22, "#e8e4f0", 1, 1);
  // trash spilling over the lip
  R(c, x + 10, y - 4, 18, 6, "#2a2434"); R(c, x + 38, y - 2, 14, 4, "#c8925a"); R(c, x + 28, y - 6, 8, 5, "#e8e4f0");
}
function drawLamp(c) { PK.streetlamp(c, 548, 208, { on: true, h: 120, flip: true }); }
function drawBags(c) { PK.trashBags(c, 586, 190, { seed: 9 }); }
function drawStairs(c) { PK.subwayStairs(c, 80, 178); }

function light(S) {
  return {
    ambient: "#2a2658",
    lights: [
      { x: 363, y: 54, r: 200, color: "#ff3fa4", steps: 4, sy: 1.0, rim: true },
      { x: 363, y: 82, r: 150, color: "#ffe0a0", steps: 4, power: 0.9 },
      { x: 200, y: 60, r: 210, color: "#a05cff", steps: 3, power: 0.7, rim: true },
      { x: 480, y: 60, r: 210, color: "#39d0ff", steps: 3, power: 0.7, rim: true },
      { x: 520, y: 100, r: 220, color: "#ffb060", steps: 5, rim: true },
      { x: 110, y: 190, r: 80, color: "#40e080", steps: 2, power: 0.6 }
    ],
    halos: [{ x: 363, y: 82, r: 18, color: "#ffcf80", strength: 0.9 }, { x: 520, y: 102, r: 20, color: "#ffb060", strength: 1 }],
    key: { x: 363, y: 70 }, shadow: 0.6
  };
}

/* ------------------------------------------------------------------ Fitz */
function enterLoft() { return RP.goto("a2_loft", 72, 232, "right"); }

async function letIn(S) {
  S.f.a2_inLoft = true;
  await RP.say("Fitz steps aside like a man who doesn't want to explain this to Dani later.", "nar");
  await enterLoft();
}

async function talkFitz(S) {
  if (!S.f.a2_fitzMet) {
    S.f.a2_fitzMet = true;
    await RP.lines(["@a2_fitz Name.", "(" + (S.name || "DJ NOBODY") + ").", "@a2_fitz ...I'm looking. I've got a Marcus plus forty. A Marcus plus three. A Marcus with a question mark. I don't have you."]);
  }
  await RP.convo([
    { text: "I'm on the list. Check again.", run: async () => { S.f.a2_fitzTries = (S.f.a2_fitzTries || 0) + 1; await RP.lines(["@a2_fitz Checking under \"D\" for \"dude.\" ...Nope. Under \"W\" for \"whoever.\" Nope.", "@a2_fitz There's no one here by that name. Or any name. The list is mostly Marcus."]); } },
    { text: "I'm Marcus's plus three.", run: async () => { await RP.lines(["@a2_fitz Marcus is already plus forty. The whole list is Marcus. At this point Marcus owns the building."]); } },
    { text: "I'm the DJ.", run: async () => { await RP.lines(["@a2_fitz The DJ's inside. Gus. He has a controller and an ego. You have... half of that.", "That's rude, and accurate."]); } },
    { text: "Dani says the tab is closed.", when: S2 => S2.f.a2_daniName, run: async () => {
      await RP.lines(["@a2_fitz ...Dani said that?", "That's what she said. The tab is closed.", "@a2_fitz She told me that would be a lie. Ten minutes ago she was calling me a ghost. Okay. Wow. In you go."]);
      await letIn(S);
      return "end";
    } },
    { text: "Never mind.", end: true }
  ]);
}

/* ------------------------------------------------------------------ the sneak */
// a third way in: the amp is a ticket ("you're the sound guy")
async function ampTicket() {
  await RP.lines(["I've got an amp. A power amp. For the PA.", "@a2_fitz An amp. For tonight? Moxie's been screaming about the PA for an hour.", "@a2_fitz Okay. In. Tell her I let you."]);
  await letIn(RP.state);
}

async function pushDumpster(S) {
  if (S.f.a2_dumpster) { await RP.say("It's under the ladder already. A dumpster, parked like a getaway car."); return; }
  RP.sfx("thump");
  await RP.lines([
    "I put my shoulder into the dumpster. It rolls on four squeaky wheels, like a very old shopping cart with a secret.",
    "I roll it right under the dangling fire-escape ladder."
  ]);
  S.f.a2_dumpster = true;
  RP.relight();
}
async function climbLadder(S) {
  if (!S.f.a2_dumpster) { await RP.say("The ladder dangles ten feet above my head. It's taunting me with a rung."); return; }
  await RP.walkTo(198, 206, "back");
  await RP.lines([
    "I climb onto the dumpster, then onto the lid, then onto the ladder.",
    "It groans. It's a sound I recognize. It's the sound of my knees."
  ]);
  await RP.fadeTo(1, 600);
  await RP.say("Up the fire escape. Through a window that's open the width of a hand. Into a bathroom.", "nar");
  S.f.a2_sneaked = true; S.f.a2_inLoft = true;
  await RP.goto("a2_loft", 600, 232, "left");
  await RP.lines(["@a2_stranger Bro. The line for this is outside.", "I'm leaving. I'm leaving through the door I'm supposed to be using."]);
}

RP.room({
  id: "a2_loftdoor", act: 2, name: "Meserole Street",
  paint,
  cacheKey: S => "n",
  light,
  ambience: "club_through_wall",
  walk: [[8, 204], [632, 204], [632, 252], [8, 252]],
  start: { x: 70, y: 232, face: "right" },
  update: A2.update,
  fx: [
    { type: "beams", origins: [[170, 60], [300, 60], [430, 60], [500, 60]], colors: ["#ff3fa4", "#39d0ff", "#a05cff", "#ffd23f"], base: Math.PI / 2, swing: 0.4, len: 120, width: 14, alpha: 0.1, period: 1200 },
    { type: "smoke", count: 4, x: 380, y: 196, rise: 34, size: 7, drift: 5, color: "#8a86a0" },
    { type: "cars", y: 232, dir: -1, period: 7600 }
  ],
  actors: [
    { id: "a2_fitz", char: "a2_fitz", x: 360, y: 206, face: "front", act: "stand", name: "Fitz", noTurn: false },
    { crowd: { n: 6, rect: [244, 214, 90, 28], seed: 31, face: "right", act: "stand", scale: 1 } },
    { crowd: { n: 4, rect: [420, 214, 90, 24], seed: 33, face: "left", act: "stand", scale: 1 } }
  ],
  sprites: [
    { y: 207, draw: A2.cs(drawDumpster, S => S.f.a2_dumpster ? "m" : "n") },
    { y: 206, draw: A2.cs(drawLamp) },
    { y: 212, draw: A2.cs(drawBags) },
    { y: 215, draw: A2.cs(drawStairs) }
  ],
  hotspots: [
    { id: "a2_loftstairs", name: "subway stairs", r: [76, 176, 74, 66], z: 28, walk: [112, 232, "back"], exit: "travel", look: "The Morgan Avenue station. The L train takes everyone who has somewhere to be and drops everybody who has a flyer.", push: "I don't push stairs." },
    { id: "a2_loftdoor", name: "loft door", r: [326, 92, 74, 98], z: 30, walk: [364, 210, "back"],
      look: "A steel door with a bulb, a neon \"LOFT\" and the sound of a party trying to happen. A sign: \"MESEROLE LOFT. NO PHOTOS. NO SHOES-OFF POLICY. NO DRAMA.\" I'm shoes-on and drama-adjacent.",
      use: S => S.f.a2_inLoft ? enterLoft() : talkFitz(S), open: S => S.f.a2_inLoft ? enterLoft() : talkFitz(S), push: S => S.f.a2_inLoft ? enterLoft() : talkFitz(S), talk: S => talkFitz(S),
      exit: S => S.f.a2_inLoft ? { room: "a2_loft", x: 72, y: 232, face: "right" } : "Fitz is standing in front of it with a clipboard. He is the door." },
    { id: "a2_loftwin", name: "glowing windows", r: [144, 28, 396, 68], z: 12, walk: [300, 208, "back"], look: "Six big factory windows full of pink and violet and silhouettes. The whole building thumps like a heart.", use: "I can't climb that. But the fire escape by the corner...", open: "They're painted shut. The party is trapped inside. Gloriously." },
    { id: "a2_neon", name: "LOFT sign", r: [334, 60, 52, 32], z: 20, walk: [362, 208, "back"], look: "A pink neon: LOFT. It buzzes. The \"T\" flickers. Somebody here has a hand-drawn logo and a cousin who does neon." },
    { id: "a2_fire", name: "fire escape", r: [134, 18, 76, 124], z: 18, walk: [196, 208, "back"], look: "A fire escape that goes up two floors, with a drop ladder that ends exactly ten feet above reach. The fire department thinks of everything except me.", use: S => climbLadder(S), pickup: "I can't reach it. Yet." },
    { id: "a2_ladder", name: "dangling ladder", r: [186, 130, 18, 28], z: 40, walk: [196, 208, "back"], look: "The drop ladder, dangling at the end of the fire escape. It ends a respectable ten feet above the sidewalk. A dare.", use: S => climbLadder(S), pickup: S => climbLadder(S), pull: S => climbLadder(S) },
    { id: "a2_dumpster", name: "dumpster", r: [34, 164, 78, 46], z: 24, walk: S => S.f.a2_dumpster ? [200, 210, "back"] : [74, 214, "back"], vis: S => !S.f.a2_dumpster,
      look: "A dumpster behind the building: green, dented, the size of a sedan, and wearing a sticker that says \"SKEET'S.\" It's on wheels.", push: S => pushDumpster(S), pull: S => pushDumpster(S), use: S => pushDumpster(S), open: "I peek in. I regret it. It's a banquet of bad decisions, five weeks old.", pickup: "It's a dumpster, not a backpack." },
    { id: "a2_dumpster2", name: "dumpster (under the ladder)", r: [160, 164, 78, 46], z: 24, walk: [210, 210, "back"], vis: S => !!S.f.a2_dumpster,
      look: "The dumpster, parked right under the dangling fire-escape ladder. It's a step, a stage and a mild health hazard.", use: S => climbLadder(S), push: "It's exactly where it should be. Don't tempt fate.", open: "No. I've been in it spiritually. That's enough.", pickup: "Not happening." },
    { id: "a2_wall", name: "graffiti wall", r: [0, 60, 130, 120], z: 14, walk: [60, 208, "back"], look: "A wall of tags: SKEET, NO ADS, and a flying toaster that has no business being here. Somebody in Brooklyn is working through something.", use: "I'd add a tag, but I only know how to write \"NEXT WEEK.\"" },
    { id: "a2_flyers", name: "flyers", rects: [[224, 118, 44, 34], [450, 122, 44, 38]], z: 20, walk: [300, 208, "back"], look: "Pasted-on flyers: \"MESEROLE LOFT SESSIONS,\" \"BASEMENT TAPES — LAST SAT — VINYL ONLY.\" Basement Tapes is on every wall in Brooklyn, like a rumor with a deposit.", pickup: "There are four. I can't take them all. Or any." },
    { id: "a2_lamp", name: "streetlamp", r: [528, 86, 40, 124], z: 20, walk: [552, 210, "back"], look: "A streetlamp, buzzing orange. It's lit the whole line of the party and has seen things.", use: "I'd climb it. Then I'd be sad on a streetlamp.", pickup: "It belongs to the city. The city has a long reach." },
    { id: "a2_bags", name: "trash bags", r: [584, 186, 48, 36], z: 20, walk: [608, 208, "back"], look: "A pile of trash bags with a disco ball inside one of them. I can see it sparkle. Somebody threw out a disco ball. New York is a deep place.", pickup: "I'm not taking the disco ball. I have standards. Low, but standards." },
    { id: "a2_fitz", name: "Fitz", z: 80, look: "Fitz: beanie, hoodie, clipboard, the zen calm of a man who's said \"no\" a thousand times and enjoyed each one.", talk: S => S.f.a2_inLoft ? "Fitz nods. I'm already in his head: \"Not on the list, but inside.\"" : talkFitz(S),
      give: async (S, item) => { if (item === "a2_flyer") return ["@a2_fitz Basement Tapes? Vic's party. I don't do vinyl. I do doors."]; if (item === "a2_card") return ["@a2_fitz I don't take cards. I take names."]; return ["@a2_fitz I'm on the clock. And I don't want that."]; } }
  ],
  combos: [
    ["a2_flyer", "a2_fitz", ["@a2_fitz Basement Tapes? Vic's party. I don't do vinyl. I do doors."]],
    ["phone", "a2_fitz", "I could text Dani and ask her to tell Fitz. But she's busy and Fitz can see me typing."],
    ["usb_cat", "a2_fitz", "Fitz looks at the USB, the cat on it and me. He says nothing. I put it away."],
    ["a2_amp", "a2_fitz", ampTicket],
    ["a2_amp", "a2_loftdoor", ampTicket]
  ]
});
})();
