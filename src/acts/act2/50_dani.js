/* Act 2 — Dani's apartment, Greenpoint (4th floor, no elevator). The shower mission: a date for the rain shower with
   seven settings, played for laughs and faded to black on a joke. Two ways in: the smooth way (which the kid regrets)
   or the honest way ("I just need a shower"). Both end with a clean kid and a name to drop at the loft door.
   Flags: a2_daniMet, a2_showered, a2_daniName (tell Fitz Dani sent you), a2_rhythmGot */
(function () {
"use strict";
const RP = window.RP, A2 = RP.a2, PK = RP.PK;
const { R, P, ell, txt, txtC } = RP.u;
const U = PK.util;
const W = 640;

function paint(c, S) {
  const em = [];
  // teal walls with a warm skirting, honey floor
  PK.plaster(c, 0, 0, W, 166, { base: "#5d928a", seed: 41, patches: 1, stains: 0, cracks: 1 });
  R(c, 0, 0, W, 8, "#e8dcc4"); U.HL(c, 0, 0, W, "#fff6e0"); U.HL(c, 0, 7, W, "#a89878");
  PK.baseboard(c, 0, 158, W, { color: "#e8dcc4", h: 9 });
  PK.planks(c, 0, 168, W, 88, { base: "#a87a50", seed: 9 });
  PK.rug(c, 296, 206, 220, 40, { colors: ["#7a3a5a", "#e8a050", "#3a6a7a"], shape: "oval" });
  // entrance door (left): 4F
  PK.door(c, 8, 34, 48, 128, { color: "#7a4a30", frame: "#d8c8a8", number: "4F", panels: 4, seed: 7 });
  R(c, 14, 140, 4, 2, "#c8c4d8"); R(c, 14, 146, 4, 2, "#c8c4d8");
  // window: Manhattan across the river at dusk
  em.push.apply(em, PK.window(c, 76, 28, 112, 96, { view: "city", time: "dusk", frame: "#f0e4d0", seed: 5, bridge: false }));
  // records, turntable on a credenza, little speakers
  PK.shelf(c, 202, 44, 108, 50, { items: "records", wood: "#7a4a32", seed: 11 });
  PK.desk(c, 202, 124, 112, 46, { wood: "#7a4a32", top: "#a0724a", seed: 3 });
  PK.turntable(c, 212, 96, { model: "budget", record: true, label: "#e8a050" });
  PK.monitors(c, 284, 90, { krk: false, w: 22, h: 34, pair: false });
  // hanging plants and a window plant
  [[236, 14, 20], [556, 12, 22]].forEach(([x, y, len], i) => { U.VL(c, x, 8, len, "#2a2030"); U.blob(c, x, y + len + 8, 12, 9, "#3f8a4a"); U.blob(c, x - 8, y + len + 16, 7, 8, "#4a9a55"); U.blob(c, x + 9, y + len + 18, 7, 9, "#3a7a44"); for (let k = 0; k < 14; k++) P(c, x - 10 + (k * 3) % 21, y + len + 24 + (k % 5), "#4a9a55"); R(c, x - 6, y + len + 3, 12, 4, "#c06a3a"); });
  PK.plant(c, 158, 94, { size: 1, seed: 6 });
  // futon couch, sunset throw pillow
  // kitchen: shelf, counter, stove
  PK.shelf(c, 446, 40, 112, 50, { items: "bottles", wood: "#a07a50", seed: 4 });
  PK.counter(c, 440, 128, 138, 40, { top: "#e8dcc4", front: "#3a5a6a", seed: 8 });
  [[462, "#2a2834"], [502, "#2a2834"]].forEach(([x, col]) => { R(c, x - 14, 122, 30, 6, col); U.HL(c, x - 14, 122, 30, "#5a5668"); ell(c, x - 6, 123, 5, 1, "#1a1822"); ell(c, x + 8, 123, 5, 1, "#1a1822"); });
  // the pierogi pot on the back burner
  R(c, 494, 108, 22, 14, "#8a96a6"); U.HL(c, 494, 108, 22, "#d8e0ec"); U.VL(c, 494, 108, 14, "#b8c4d4"); U.VL(c, 515, 108, 14, "#4a5666"); R(c, 492, 106, 26, 3, "#6a7686"); R(c, 490, 112, 3, 3, "#2a2834"); R(c, 517, 112, 3, 3, "#2a2834");
  // clock + frames
  PK.clock(c, 336, 30, { hour: 7, min: 45, d: 18 });
  PK.frame(c, 366, 36, 32, 38, { color: "#2a2a36", kind: "portrait", seed: 12 }); PK.frame(c, 408, 48, 26, 30, { color: "#e8dcc4", kind: "landscape", seed: 13 });
  // bathroom door ajar with warm light + sign
  PK.door(c, 586, 38, 48, 126, { color: "#e8e0d0", frame: "#b8a888", open: true, inside: "#6a4a30", peephole: false, knob: false, seed: 8 });
  U.dshade(c, 592, 50, 36, 110, "#ffd890", (x, y) => 0.5, 0.35); em.push([592, 50, 36, 110]);
  R(c, 584, 22, 52, 12, "#7a4a32"); U.outline(c, 584, 22, 52, 12, "#3a2418"); txtC(c, "RAIN SHOWER", 610, 25, "#ffe8b0", 1, 0); txtC(c, "7 SETTINGS", 610, 30, "#ffe8b0", 1, 0);
  // string lights over the window wall
  for (let x = 8; x < 420; x += 3) { const y = 11 + Math.round(Math.sin(x / 28) * 4); P(c, x, y, "#2a2030"); }
  for (let x = 14; x < 420; x += 15) { const y = 12 + Math.round(Math.sin(x / 28) * 4); R(c, x, y, 3, 3, "#ffd890"); em.push([x - 1, y - 1, 5, 5]); em.push.apply(em, PK.glow(c, x + 1, y + 1, 7, "#ffcf7a", { strength: 0.6 })); }
  return em;
}

function drawCouch(c) { PK.couch(c, 322, 130, 112, { color: "#d8a050", pillow: true, pillowColor: "#7a3a5a", seed: 5 }); R(c, 346, 160, 28, 8, "#e8e0d0"); }
function drawTable(c, S) {
  PK.table(c, 436, 188, 60, 30, { color: "#7a5a3a", top: "#c8a070", round: true, seed: 4 });
  // plates of pierogi, candles
  if (!S.f.a2_daniMeal) { ell(c, 456, 196, 6, 2, "#f4f0e8"); ell(c, 456, 195, 5, 2, "#e8c880"); ell(c, 474, 196, 6, 2, "#f4f0e8"); ell(c, 474, 195, 5, 2, "#e8c880"); }
  R(c, 463, 188, 3, 6, "#e8e0c8"); R(c, 464, 186, 1, 2, "#ffd27a"); P(c, 464, 185, "#fff6c0");
}
function drawChairs(c) { PK.chair(c, 408, 184, { kind: "wood", color: "#a07a50" }); PK.chair(c, 498, 184, { kind: "wood", color: "#a07a50", flip: true }); }

function light(S) {
  return {
    ambient: "#5a4c80",
    lights: [
      { box: [76, 28, 112, 96], r: 300, color: "#ff9a5a", steps: 5, sy: 1.0, rim: true },
      { x: 220, y: 20, r: 200, color: "#ffcf90", steps: 4, power: 0.8 },
      { x: 470, y: 90, r: 160, color: "#ffd890", steps: 4, power: 0.8 },
      { x: 464, y: 184, r: 70, color: "#ffd27a", steps: 3, power: 0.9 },
      { box: [592, 50, 36, 110], r: 90, color: "#ffd890", steps: 3 }
    ],
    halos: [{ x: 464, y: 184, r: 16, color: "#ffd27a", strength: 0.9 }],
    key: { x: 130, y: 70 }, shadow: 0.5
  };
}

/* ------------------------------------------------------------------ the shower */
async function showerSmooth(S) {
  await RP.lines([
    "I hear your shower has seven settings.",
    "@a2_dani It does. Do you want to count them?",
    "I would love to count them. Carefully. One by one. For science.",
    "@a2_dani You're ridiculous. Dinner first."
  ]);
  S.f.a2_daniMeal = true; RP.relight();
  await RP.lines([
    "Pierogi: potato and cheese, with caramelized onions. Candles. A record on low. It's lovely. It's actually really lovely.",
    "I eat eleven of them. She tells me about her dream of opening a bar called \"Last Call (Again).\" I nod. I'm listening.",
    "I'm listening with one ear. The other ear is on the bathroom door.",
    "@a2_dani You keep looking at the bathroom.",
    "Water pressure is a love language.",
    "@a2_dani ...Okay, DJ. Let's go."
  ]);
  await RP.fadeTo(1, 900);
  await RP.say("I'd tell you what happened next, but a gentleman never tells and a DJ never remembers.", "nar");
  RP.sfx("shower");
  await RP.wait(900);
  await RP.say("Settings used: seven. Pierogi consumed: eleven. Dignity remaining: not a lot.", "nar");
  await RP.wait(500);
  await afterShower(S, true);
}
async function showerHonest(S) {
  await RP.lines([
    "Dani. I'll be honest. I smell like a couch. A couch that lost a fight with a hot dog.",
    "I really, really need a shower.",
    "@a2_dani Oh my God. Yes. Obviously. End of the hall, towels on the rack. The seventh setting is called \"Existential.\"",
    "I... thought this was a date?",
    "@a2_dani It's also a date. You eat first. Pierogi. Then shower. Then we'll talk about your living situation."
  ]);
  S.f.a2_daniMeal = true; RP.relight();
  await RP.say("Eleven pierogi later, I walk into the best shower of my life.", "nar");
  await RP.fadeTo(1, 700); RP.sfx("shower"); await RP.wait(800);
  await afterShower(S, false);
}
async function afterShower(S, smooth) {
  S.f.a2_showered = true;
  A2.beat(S);
  await RP.fadeTo(0, 800);
  RP.sfx("success");
  if (smooth) await RP.lines([
    "Dani is on the futon in an oversized sweater, eating her twelfth pierogi. I smell like lavender and bad decisions.",
    "@a2_dani So. That was... fun.",
    "The pressure was incredible. A nine. A solid nine.",
    "@a2_dani ...The pressure?",
    "The water pressure. A-plus.",
    "@a2_dani You are the worst. You know you could've just asked to use the shower?",
    "...I could've just asked?",
    "@a2_dani Anyone with eyes can see you've been sleeping on a couch. I'd have said yes. Now I have to feel weird about the other thing.",
    "We don't have to feel weird. We could feel... clean."
  ]);
  else await RP.lines([
    "I come out smelling like lavender. Dani hands me a mug. I'm a new man. A new man with the same $" + Math.round(S.money) + ".",
    "@a2_dani Better?",
    "I'd forgotten what clean feels like. It's like a hug from a stranger.",
    "@a2_dani You're welcome. You could've just asked this morning, you know.",
    "I only found out you existed this morning.",
    "@a2_dani Then you could've asked this morning. Don't be weird about it. I like you. A little."
  ]);
  await RP.lines([
    "@a2_dani There's a loft party in Bushwick Saturday. The Meserole loft. I'm bartending. The door guy's Fitz. He owes me forty bucks.",
    "@a2_dani Tell him \"Dani says the tab is closed.\" He'll let you in.",
    "Dani. Thank you. For the shower. And the... dinner."
  ]);
  S.f.a2_daniName = true;
  RP.addRecord("snap_rhythm_is_a_dancer");
  await RP.lines([
    "@a2_dani Take this. My ex left it. He left a lot of things. Mostly his dignity.",
    "Snap!, \"Rhythm Is A Dancer.\" Logic Records, 1992. Thea Austin on the lead vocal. That is a banger.",
    "@a2_dani It's a banger and I don't have to see it anymore. We both win."
  ]);
  RP.followers(5);
  await A2.dayCheck(S);
}

async function talkDani(S) {
  if (S.f.a2_showered) {
    await RP.lines(["@a2_dani Leave some water for the rest of Brooklyn, DJ.", "@a2_dani Saturday. The loft. \"The tab is closed.\" Don't forget."]);
    return;
  }
  if (!S.f.a2_daniMet) {
    S.f.a2_daniMet = true;
    await RP.lines(["@a2_dani You made it! Four flights, no elevator, nobody has ever arrived here dignified.", "It smells like onions and hope.", "@a2_dani It's pierogi. And onions."]);
  }
  await RP.convo([
    { text: "The pierogi. Tell me everything.", run: async () => { await RP.lines(["@a2_dani Potato and cheese. My grandmother's recipe. She'd hate everything about my life and love everything about my pierogi."]); } },
    { text: "So... the shower. I hear it has seven settings.", run: async () => { await showerSmooth(S); return "end"; } },
    { text: "I'll be honest, I really just need a shower.", run: async () => { await showerHonest(S); return "end"; } },
    { text: "What's your bar night like?", run: async () => { await RP.lines(["@a2_dani I bartend at Nowhere on Saturdays. Dante pays in drink tickets. Don't tell him I told you. Actually, tell him. He never reads his texts."]); } },
    { text: "Maybe later.", end: true }
  ]);
}

RP.room({
  id: "a2_dani", act: 2, name: "Dani's apartment",
  paint,
  cacheKey: S => (S.f.a2_daniMeal ? "m" : "n"),
  light,
  ambience: "room",
  music: { genre: "soul", bpm: 96, volume: 0.28, filter: ["lowpass", 1400] },
  walk: [[8, 208], [630, 208], [630, 252], [8, 252]],
  start: { x: 70, y: 232, face: "right" },
  update: A2.update,
  fx: [
    { type: "steam", count: 4, x: 506, y: 122, rise: 36, size: 7, drift: 4, color: "#f4f0e8" },
    { type: "dust", rect: [76, 28, 220, 150], count: 13, color: "#ffd890" }
  ],
  actors: [{ id: "a2_dani", char: "a2_dani", x: 388, y: 222, face: "left", act: "stand", name: "Dani" }],
  sprites: [
    { y: 176, draw: A2.cs(drawCouch) },
    { y: 172, draw: A2.cs(c => { PK.bike(c, 74, 146, { color: "#39d0ff", seed: 3 }); }) },
    { y: 208, draw: A2.cs(drawTable, S => S.f.a2_daniMeal ? "m" : "n") },
    { y: 210, draw: A2.cs(drawChairs) }
  ],
  hotspots: [
    { id: "a2_exit", name: "front door (stairs)", r: [6, 32, 52, 132], z: 30, walk: [66, 232, "left"], exit: "travel",
      look: "The door to 4F. Four flights of stairs below it, a bike chained to every landing, and the smell of other people's dinners.", push: "It's a door. I pushed it open when I came in. Please let me retain some dignity." },
    { id: "a2_window", name: "window", r: [74, 26, 118, 104], z: 18, walk: [132, 212, "back"], look: "Greenpoint at dusk, with all of Manhattan across the East River looking like a stage set. It's the best view I've seen from a sleeping position.", open: "The window's painted shut. Brooklyn is full of windows that are only for looking.", push: "It doesn't budge." },
    { id: "a2_records", name: "record shelf", r: [200, 42, 112, 54], z: 22, walk: [256, 212, "back"], look: "A shelf of records: Chic, \"Good Times,\" on Atlantic, June 1979. Sylvester, \"You Make Me Feel (Mighty Real).\" Loleatta Holloway, \"Love Sensation,\" Dan Hartman producing, Tom Moulton mixing. Someone who knows what they like.", pickup: "I'd never. A person's records are their diary. A diary with a groove.", use: "I'd love to flip through. I'd also like to be invited back." },
    { id: "a2_player", name: "record player", r: [208, 90, 76, 36], z: 30, walk: [248, 212, "back"], look: "A budget turntable with a record on it. Soul, turned low. A good deck is one that gets played. This one's played.", use: "I'm tempted to put on \"Missing.\" But it's her place. Dani's already got a vibe going.", pickup: "Not mine. I'd lift a tonearm. I'd feel bad." },
    { id: "a2_couch", name: "futon couch", r: [320, 126, 118, 56], z: 24, walk: [376, 212, "back"], look: "A mustard futon with a velvet pillow. It looks at me like a rival. A better couch than Marcus's. I'm not saying that out loud.", use: "I'm not lying down on Dani's futon. We're not there yet.", pickup: "It's got legs. It's not mine." },
    { id: "a2_table", name: "dinner table", r: [434, 184, 66, 40], z: 26, walk: [468, 214, "back"], look: S => S.f.a2_daniMeal ? "A table with two empty plates and one candle, the sad little end of a lovely dinner." : "A small round table with two plates of pierogi, a candle and a lot of intention.", use: "I could eat. I should eat. I will eat.", pickup: "The pierogi aren't mine to take. Yet." },
    { id: "a2_stove", name: "kitchen", r: [440, 108, 140, 62], z: 24, walk: [508, 214, "back"], look: "A kitchen the size of a closet. Four burners, one pot, an unreasonable number of wooden spoons. The air is made of butter.", use: "I'd stir something, but then I'd have to take responsibility.", open: "The cabinets are full of mismatched mugs and spices from at least four continents." },
    { id: "a2_shelf", name: "spice shelf", r: [444, 38, 118, 56], z: 22, walk: [508, 214, "back"], look: "A shelf of bottles: hot sauce, vinegar, vodka for pierogi, a vodka for people, a vodka for people who've had a day.", pickup: "Stealing from a person who's feeding me is not good strategy." },
    { id: "a2_bath", name: "bathroom (rain shower)", r: [584, 22, 54, 144], z: 28, walk: [604, 214, "back"],
      look: "A bathroom with a sign: \"RAIN SHOWER, 7 SETTINGS.\" The settings, listed on a wooden spoon: Drizzle, Mist, Tropical, Monsoon, Waterfall, Pulse, Existential.",
      use: S => S.f.a2_showered ? "I'm clean. I'm not going back in. I'd end up living there." : (S.f.a2_daniMet ? talkDani(S) : "I can't just walk into a person's bathroom. I have to be asked. Or I have to talk to Dani first."),
      open: S => S.f.a2_showered ? "The bathroom's lovely. And I've already used it. For the sake of everyone, I'll stay out." : "I should talk to Dani first. I'm not a monster. I'm a person who smells like one.", push: "The door's open. It's an invitation. I should be invited." },
    { id: "a2_clock", name: "clock", r: [334, 28, 22, 22], z: 22, walk: [346, 212, "back"], look: "It's 7:45. Whatever time it is, it's the time Dani wants it to be." },
    { id: "a2_frames", name: "pictures", rects: [[364, 34, 36, 42], [406, 46, 30, 34]], z: 22, walk: [400, 212, "back"], look: "A black-and-white portrait of a woman laughing (Dani's grandmother, I'm told, who'd hate this) and a painting of a harbor at sunrise." },
    { id: "a2_bike", name: "bike", r: [72, 144, 52, 34], z: 26, walk: [98, 212, "back"], look: "Dani's bike, indoors. Every New Yorker owns a bike that lives in their apartment like a roommate with wheels.", use: "I'd ride it, but then I'd owe Dani a bike and a favor.", pickup: "I'd need a hand truck and a conscience." },
    { id: "a2_plants", name: "plants", rects: [[222, 12, 30, 50], [542, 10, 34, 52], [156, 90, 32, 36]], z: 20, walk: [200, 212, "back"], look: "Plants everywhere. Pothos, mostly, dangling from hooks like a sweet green jungle. Dani's plants are alive. That's a ringing endorsement.", pickup: "They're hanging. I can't reach. I'm also not a thief of plants.", talk: "Hi, plants. You look healthier than anyone I know." },
    { id: "a2_dani", name: "Dani", z: 80, look: "Dani: curly hair, mustard hoodie, a laugh that makes strangers pay attention. She's a bartender who can pour a drink with her eyes closed and hold a grudge with them open.", talk: S => talkDani(S),
      give: async (S, item) => { if (item === "a2_card") return ["@a2_dani Keep that. I know what that card cost you."]; return ["@a2_dani Aw. Thank you. But I don't need it."]; } }
  ],
  combos: [
    ["white", "a2_player", "I can't put Lou's record on someone else's deck without being asked. Rule of the road."],
    ["phone", "a2_dani", "Texting Dani from two feet away is a new low even for me."],
    ["a2_card", "a2_dani", ["@a2_dani Keep that. I know what that card cost you."]],
    ["usb_cat", "a2_dani", "Dani doesn't want 4,000 pictures of Jess's cat. Neither do I. But I'm keeping my promise."]
  ]
});
})();
