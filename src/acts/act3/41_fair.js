/* Act 3 — Sunday Record Fair in a Brooklyn school gym (fictional fair). Clues for the grail:
   Ray (Deep Cuts) -> Mort (needs a coffee) -> the Pruitt flyer on the corkboard -> record.Hunt.
   Cameo: Danny Krivit, flipping through a bin. Flags: a3_fairSeen, a3_clue2 (Mort), a3_clue3 (flyer), a3_hunt, a3_dannyMet, a3_priyaMet. */
(function () {
"use strict";
const RP = window.RP;
const A3 = RP.A3;
const U = RP.u;
const PK = RP.PK;
const { R, P, ell, txt, txtC, txtW, bayer, mulberry, ramp, mix } = U;
const W = 640;

const tableSpr = A3.sprite("a3_fair_table", 150, 60, c => { PK.table(c, 4, 18, 140, 38, { color: "#7a7a8a", top: "#b8b4c4", seed: 901 }); [[14, "#2f62b8"], [54, "#c0302c"], [94, "#2a8a4a"]].forEach(([x, col], i) => PK.crate(c, x, -10, { w: 36, h: 28, color: col, seed: 902 + i })); });
const tableSpr2 = A3.sprite("a3_fair_table2", 150, 60, c => { PK.table(c, 4, 18, 140, 38, { color: "#8a7a6a", top: "#c8b8a0", seed: 906 }); [[14, "#e07a2a"], [54, "#5a3a8a"], [94, "#c0302c"]].forEach(([x, col], i) => PK.crate(c, x, -10, { w: 36, h: 28, color: col, seed: 907 + i })); });
const bakeTable = A3.sprite("a3_fair_bake", 140, 56, c => {
  PK.table(c, 4, 16, 130, 38, { color: "#c8c0d0", top: "#f4efe4", seed: 910 });
  // coffee urn, a plate of lemon bars, a donation jar
  R(c, 14, 0, 18, 26, "#8a8698"); R(c, 14, 0, 18, 2, "#d8d4e4"); R(c, 14, 24, 18, 2, "#4a4658"); R(c, 17, 8, 12, 6, "#2a2838"); R(c, 22, 26, 3, 2, "#c0302c");
  R(c, 42, 14, 34, 4, "#e0e0e8"); for (let i = 0; i < 5; i++) { R(c, 44 + i * 6, 8, 5, 6, "#f4d44a"); R(c, 44 + i * 6, 8, 5, 1, "#fff0a0"); }
  R(c, 90, 6, 14, 12, "#cfe4ef"); R(c, 90, 6, 14, 2, "#ffffff"); R(c, 92, 12, 10, 3, "#6a9a5a"); txt(c, "$", 94, 9, "#17101e", 1, 0);
  R(c, 108, 12, 14, 6, "#f4efe4"); txt(c, "$2", 111, 12, "#c0302c", 1, 0);
});
const cork = A3.sprite("a3_fair_cork", 90, 110, c => {
  R(c, 4, 4, 80, 64, "#8a6a40"); R(c, 6, 6, 76, 60, "#b08a58"); PK.speckle(c, 6, 6, 76, 60, ["#8a6a40", "#c8a068"], 0.25, 920);
  [[10, 10, 22, 26, "neon"], [36, 12, 20, 22, "mono"], [58, 10, 20, 28, "sunset"], [14, 40, 28, 20, "paper"]].forEach(([x, y, w, h, pal], i) => PK.poster(c, x, y, w, h, { palette: pal, title: ["SWAP", "WANTED", "$1 BINS", "LOST"][i], lines: ["", ""], seed: 921 + i, tape: false }));
  // the Pruitt flyer
  R(c, 46, 38, 32, 26, "#f4efe4"); R(c, 46, 38, 32, 1, "#fff"); R(c, 46, 63, 32, 1, "#a09888"); txtC(c, "ESTATE", 62, 41, "#c0302c", 1, 1); txtC(c, "SALE", 62, 47, "#c0302c", 1, 1); txtC(c, "PRUITT", 62, 53, "#17101e", 1, 1); txtC(c, "WOODSIDE", 62, 58, "#17101e", 1, 1);
  P(c, 62, 37, "#e0302c");
  R(c, 6, 68, 4, 38, "#4a3a2a"); R(c, 78, 68, 4, 38, "#4a3a2a"); R(c, 0, 104, 14, 4, "#3a2a1a"); R(c, 72, 104, 14, 4, "#3a2a1a"); R(c, 40, 68, 8, 30, "#4a3a2a");
});
const hoop = A3.sprite("a3_fair_hoop", 70, 60, c => {
  R(c, 6, 6, 56, 32, "#e8e4f0"); R(c, 6, 6, 56, 1, "#fff"); R(c, 6, 37, 56, 1, "#8a86a0"); R(c, 6, 6, 1, 32, "#fff"); R(c, 61, 6, 1, 32, "#8a86a0");
  R(c, 22, 20, 24, 16, "#c0302c"); R(c, 24, 22, 20, 12, "#e8e4f0");
  R(c, 20, 38, 28, 2, "#e07a2a"); R(c, 20, 38, 28, 1, "#ffb060"); for (let i = 0; i < 6; i++) { R(c, 22 + i * 4, 40, 1, 10 - Math.abs(i - 2.5), "#f4efe4"); }
  R(c, 30, 0, 8, 8, "#6a667c");
});

function paint(c, S) {
  const em = [];
  // painted cinder-block gym wall
  PK.brick(c, 0, 0, W, 152, { base: "#c8b87a", mortar: "#9a8a62", bw: 26, bh: 13, worn: 0.15, seed: 930 });
  PK.util.dshade(c, 0, 0, W, 40, "#2a2018", (px, py) => 1 - py / 40, 0.3);
  // high wired windows
  [[110, 12], [262, 12], [414, 12]].forEach(([x, y], i) => em.push.apply(em, PK.window(c, x, y, 60, 34, { view: "city", time: "day", bars: true, frame: "#d8d0b8", seed: 931 + i })));
  // lights
  [[40, 2, 80], [200, 2, 80], [360, 2, 80], [520, 2, 80]].forEach(([x, y, w]) => em.push.apply(em, PK.fluorescent(c, x, y, w, { on: true })));
  // floor: maple with court markings
  PK.planks(c, 0, 152, W, 104, { base: "#c89a5a", seam: "#8a6a3a", plankH: 12, seed: 940 });
  R(c, 0, 154, W, 2, "#f4efe4"); ell(c, 320, 256, 130, 52, "#c89a5a"); for (let a = 0; a < 360; a += 2) { const x = 320 + Math.cos(a * Math.PI / 180) * 130, y = 256 + Math.sin(a * Math.PI / 180) * 52; if (y > 154 && y < 256 && (a % 8) < 6) P(c, x, y, "#f4efe4"), P(c, x, y - 1, "#e8e0d0"); }
  PK.util.dshade(c, 0, 152, W, 104, "#ffffff", (px, py) => 0.35 * Math.max(0, 1 - Math.abs(py - 190) / 30), 0.12);
  // banners
  R(c, 120, 52, 400, 26, "#f4efe4"); R(c, 120, 52, 400, 1, "#fff"); R(c, 120, 77, 400, 1, "#a09888"); R(c, 122, 54, 396, 2, "#2f62b8"); R(c, 122, 74, 396, 2, "#2f62b8");
  txtC(c, "SUNDAY RECORD FAIR", 320, 58, "#17101e", 2, 1); txtC(c, "10 TO 4  /  $3 AT THE DOOR  /  CASH ONLY", 320, 69, "#c0302c", 1, 1);
  R(c, 118, 50, 4, 4, "#8a86a0"); R(c, 518, 50, 4, 4, "#8a86a0");
  // scoreboard
  R(c, 62, 60, 52, 36, "#17101e"); R(c, 63, 61, 50, 34, "#2a2a36"); txt(c, "HOME", 66, 65, "#ffd23f", 1, 1); txt(c, "GUEST", 90, 65, "#ffd23f", 1, 1); txt(c, "00", 68, 76, "#ff3a3a", 2, 1); txt(c, "00", 92, 76, "#ff3a3a", 2, 1); em.push([63, 61, 50, 34]);
  // exit sign + door
  PK.exitSign(c, 540, 12, {}).forEach(r => em.push(r));
  PK.door(c, 6, 40, 50, 112, { metal: true, color: "#8a7a5a", window: true, seed: 950 });
  R(c, 6, 40, 50, 1, "#d8c8a0");
  // folding chairs along the wall
  for (let i = 0; i < 6; i++) { const x = 70 + i * 16; R(c, x, 138, 12, 3, "#6a667c"); R(c, x, 128, 12, 10, "#7a7690"); R(c, x, 140, 1, 12, "#4a4658"); R(c, x + 11, 140, 1, 12, "#4a4658"); }
  // free-throw clock
  return em;
}

function light(S) {
  return { ambient: "#a09aa8", lights: [{ x: 80, y: 8, r: 260, color: "#f4fbff", steps: 3, sy: 0.9 }, { x: 240, y: 8, r: 260, color: "#f4fbff", steps: 3, sy: 0.9 }, { x: 400, y: 8, r: 260, color: "#f4fbff", steps: 3, sy: 0.9 }, { x: 560, y: 8, r: 260, color: "#f4fbff", steps: 3, sy: 0.9 }, { box: [6, 40, 50, 112], r: 100, color: "#ffe8b0", steps: 2, power: 0.6 }],
    key: { x: 320, y: 0 }, rims: [{ x: 320, y: 10, r: 600, color: "#d8e8ff" }], shadow: 0.5 };
}

/* ---- scripts ---- */
async function checkHunt(S) {
  if (S.f.a3_hunt || !S.f.a3_clue1 || !S.f.a3_clue2 || !S.f.a3_clue3) return;
  await RP.lines(["Okay. A tip from Ray. A name from Mort. A flyer off the corkboard.", "I spread them over a folding table. This is how detectives do it. On TV, there's string."]);
  const res = await A3.mg("recordHunt", {
    target: "loose_joints_is_it_all_over_my_face",
    clues: ["Ray: a clean copy of 'Is It All Over My Face?' has sat in a Queens collection for thirty years.", "Mort: the collector was Hal Pruitt. He passed in March. The family is emptying the house this week.", "A flyer: 'PRUITT ESTATE SALE. WOODSIDE. EVERYTHING MUST GO.'"],
    places: [{ id: "deepcuts", label: "Deep Cuts, East Village", hint: "Ray remembers the pressing, not the buyer." }, { id: "fair", label: "Sunday Record Fair, Williamsburg", hint: "Mort knows every collector." }, { id: "estate", label: "The Pruitt house, Woodside, Queens", hint: "An estate sale this week." }, { id: "flea", label: "Weekend flea market", hint: "Mostly lamps." }],
    difficulty: 2 }, { giveUp: "Not now", onFail: async () => { await RP.lines(["I lost the thread. Try again, deep breath, Ray's tip first."]); }, assist: async () => { await RP.say("It clicks, finally. It's in Queens. It's a house. It's Woodside."); } });
  if (res.giveUp) return;
  S.f.a3_hunt = true;
  RP.unlock("a3_loc_estate");
  RP.setClock("MON 9:00 AM");
  RP.toast("New place on the map: The Pruitt house");
  await RP.lines(["The Pruitt house, Woodside, Queens. An estate sale. Everything must go.", "Everything includes the Loose Joints. Everything includes whatever else Hal kept for sixty years."]);
}
async function mortTalk(S) {
  if (!S.f.a3_rayTip) { await RP.lines(["@a3_mort Three dollars a record, two for five, none for free. Move along if you're lost."]); return; }
  if (S.f.a3_clue2) { await RP.lines(["@a3_mort Pruitt. Woodside. Go. Don't bring a friend. Don't bring Priya. She'll be there. Everyone'll be there."]); return; }
  await RP.say("Mort? I'm looking for a record. Loose Joints. 'Is It All Over My Face?'");
  await RP.say("Mmph.", "a3_mort");
  await RP.say("Ray sent me.", "kid");
  await RP.say("Ray sends everybody. Ray sends people to the DMV. You got anything for me, or are you here to look sad?", "a3_mort");
  if (!RP.has("a3_coffee")) { await RP.lines(["I... have a charming smile?", "@a3_mort Smile's free. Everybody has one. Come back with something worth the walk.", "He's not a talker. He's a grunter. Ray said to bring something. A coffee, maybe?"]); return; }
  await mortCoffee(S);
}
async function mortCoffee(S) {
  RP.take("a3_coffee");
  await RP.lines(["Here. A coffee. It's from the PTA table.", "@a3_mort ...Black?", "It's black. Like my future.", "@a3_mort *sips* ...Terrible. Thank you. Sit down, you look nervous.",
    "@a3_mort Pruitt. Hal Pruitt. Sixty years of records in a house in Woodside. He had a clean West End copy of that one. Wouldn't sell. Said it was 'for company.'",
    "@a3_mort He passed in March. The niece is emptying the house this week. Whole collection. Everything. She just wants it gone.",
    "@a3_mort Priya's been bugging me for the address for a week. I told her I don't know it. I lied. Go. Quickly."]);
  S.f.a3_clue2 = true;
  await checkHunt(S);
}
async function priyaTalk(S) {
  if (!S.f.a3_priyaMet) {
    S.f.a3_priyaMet = true;
    await RP.lines(["Find anything?", "@a3_priya Obviously. I find things. It's the thing I do.", "@a3_priya You're the Halcyon guy. Thursday. You open for nobody. Cute.",
      "@a3_priya I'm looking for the same record you are. Loose Joints. Don't act surprised, Ray's a gossip.", "@a3_priya Good luck. I mean it, kind of. Mostly I mean get out of my way."]);
    return;
  }
  await RP.lines(["@a3_priya I've got a lead. You've got a lead. May the best digger win. Mine's a better lead."]);
}
async function dannyTalk(S) {
  if (!S.f.a3_dannyMet) {
    S.f.a3_dannyMet = true;
    await RP.lines(["Mr. Krivit? Sorry. I just... it's a thing.", "@a3_dj_danny_krivit Just Danny. Digging?", "Always.", "@a3_dj_danny_krivit Good bag. Take your time. The best ones are always at the back of the bin.",
      "I'll remember that. Thanks.", "Danny Krivit. Co-founded Body & Soul, hosts his own 718 Sessions. He's just a guy flipping through a bin. That's the whole point of the bin."]);
    return;
  }
  await RP.lines(["@a3_dj_danny_krivit Nice find. Go on, keep digging."]);
}
async function buyCoffee(S) {
  if (RP.has("a3_coffee")) { await RP.say("I already have one. Two coffees means I've made a bad decision."); return; }
  await RP.say("A coffee, please.", "kid");
  await RP.say("Two dollars, hon. Black, cream or 'surprise'?", "a3_pta");
  if (!RP.canAfford(2)) { await RP.say("I'm broke. Even PTA coffee wants cash."); return; }
  RP.money(-2); RP.give("a3_coffee");
  await RP.say("Black. A strong coffee. For a strong... customer.");
  await RP.say("Don't flatter me, you'll get a bigger lemon bar.", "a3_pta");
}
RP.item("a3_coffee", { name: "PTA coffee", short: "Coffee", icon: c => { U.R(c, 10, 8, 12, 13, "#efeaf6"); U.R(c, 10, 8, 12, 2, "#ffffff"); U.R(c, 11, 10, 10, 3, "#4a2a1a"); U.R(c, 22, 11, 4, 6, "#efeaf6"); U.R(c, 12, 4, 1, 3, "#c8c4d8"); U.R(c, 16, 3, 1, 4, "#c8c4d8"); },
  look: "A paper cup of PTA coffee. Strong, terrible, and the last thing standing between me and Mort's 'mmph.'", use: "I'd drink it, but I need it for Mort." });
RP.voice("a3_pta", { color: "#ffb8d8", prefix: "PTA LADY: ", anchor: [545, 112] });

RP.room({
  id: "a3_fair", act: 3, name: "Sunday Record Fair",
  paint, light,
  cacheKey: S => "fair",
  lightKey: S => "fair",
  ambience: "crowd",
  music: null,
  walk: [[8, 200], [632, 200], [632, 252], [8, 252]],
  start: { x: 80, y: 232, face: "right" },
  fx: [{ type: "dust", rect: [60, 40, 520, 140], count: 24, color: "#fff4d6" }],
  sprites: [
    { y: 196, draw: c => tableSpr(c, 70, 138) },
    { y: 196, draw: c => tableSpr2(c, 256, 138) },
    { y: 196, draw: c => bakeTable(c, 506, 142) },
    { y: 176, draw: c => hoop(c, 560, 30) },
    { y: 180, draw: c => cork(c, 414, 86) }
  ],
  actors: [
    { id: "a3_mort", char: "a3_mort", x: 140, y: 178, face: "front", act: "stand", name: "Mort" },
    { id: "a3_vendor", char: "a3_vendor", x: 330, y: 178, face: "front", act: "stand", name: "vendor" },
    { id: "a3_pta", char: "a3_pta", x: 572, y: 178, face: "front", act: "stand", name: "PTA lady", noTurn: true },
    { id: "a3_priya", char: "a3_priya", x: 330, y: 218, face: "back", act: "stand", name: "Priya", noTurn: true },
    { id: "a3_dj_danny_krivit", char: "a3_dj_danny_krivit", x: 238, y: 214, face: "back", act: "stand", name: "Danny Krivit", noTurn: true },
    { crowd: { n: 4, rect: [90, 208, 470, 12], seed: 41, face: "back", act: "stand", scale: 0.95 } }
  ],
  enter: async (S, from) => {
    if (!S.f.a3_fairSeen) { S.f.a3_fairSeen = true; RP.setClock("SUN 11:40 AM"); await RP.lines(["The Sunday record fair. A school gym, folding tables, and about two hundred people who have strong feelings about pressings.", "It smells like old cardboard and bad coffee. It's the best smell on earth."]); }
  },
  hotspots: [
    { id: "a3_f_door", name: "door", r: [4, 38, 54, 114], z: 20, walk: [66, 214, "left"], look: "The gym door. A hand-lettered sign says 'RECORD FAIR: $3, CASH ONLY.' A second sign says 'NO RUNNING.' Nobody's running. Everyone's walking quickly.", exit: S => "travel" },
    { id: "a3_mort", name: "Mort", z: 80, look: "Mort. Cap, suspenders, a gaze like a stylus coming down on a scratch. His table says 'MORT'S PLATTERS SINCE '79.'",
      talk: S => mortTalk(S), give: async (S, item) => { if (item === "a3_coffee") { if (!S.f.a3_rayTip) return "Mort doesn't know me yet. Coffee as a first impression? Weird."; if (S.f.a3_clue2) return "@a3_mort I've had one. It's enough."; await mortCoffee(S); return; } return "@a3_mort Nah."; } },
    { id: "a3_vendor", name: "vendor", z: 80, look: "A vendor behind the bargain bins. A sign: 'EVERYTHING $1. NOTHING IS A STEAL.'", talk: ["Hey. Anything good?", "@a3_vendor Everything's good. Some of it's also bad. That's what a dollar bin is.", "I like him."] },
    { id: "a3_pta", name: "PTA lady", z: 80, look: "The PTA lady, defender of the lemon bar and the coffee urn. She has the energy of a woman who has seen a cake sale turn ugly.", talk: S => buyCoffee(S) },
    { id: "a3_priya", name: "Priya", z: 80, look: "Priya. Hoodie, headphones round her neck, a rucksack with 'other people's finds' written all over it. She digs like it's a competitive sport.", talk: S => priyaTalk(S), give: "@a3_priya I don't take handouts. I take records." },
    { id: "a3_dj_danny_krivit", name: "Danny Krivit", z: 80, look: "Danny Krivit, flipping through a bin like everyone else. Co-founder of Body & Soul. He nods at the vinyl the way you nod at a friend.", talk: S => dannyTalk(S), give: "I wouldn't dare give Danny Krivit anything. It's not a handout, but it's weird." },
    { id: "a3_f_stall1", name: "Mort's table", r: [68, 128, 150, 70], z: 25, walk: [150, 214, "back"], look: "MORT'S PLATTERS SINCE '79. Crates of jazz, soul, funk, and an entire crate marked 'DON'T.' Every record's got a price in Mort's handwriting, and a note explaining why it's that price.", use: "I flip through a crate. Mort watches me flip. It's a surveillance flip.", pickup: "Mort would see me. Mort would end me." },
    { id: "a3_f_stall2", name: "bargain bins", r: [254, 128, 150, 70], z: 25, walk: [330, 214, "back"], look: "A table of dollar bins. A lot of K-tel, a lot of Kenny, a lot of gospel Christmas. It's a rich archaeology of bad decisions.", use: "I dig for a minute. I find a copy of a record I already own. It's a sign.", pickup: "I've got a bag full of records already. This is the bargain bin: you come for the bargains, you leave with regrets." },
    { id: "a3_f_bake", name: "PTA table", r: [504, 138, 134, 62], z: 25, walk: [570, 214, "back"], look: "The PTA bake sale table: a coffee urn, lemon bars, a donation jar. 'FOR THE NEW GYM FLOOR,' says the sign. The old one looks fine.", use: S => buyCoffee(S), pickup: S => buyCoffee(S) },
    { id: "a3_f_cork", name: "corkboard", r: [416, 88, 82, 68], z: 28, walk: [458, 212, "back"],
      look: S => { if (!S.f.a3_clue3) { S.f.a3_clue3 = true; return ["The corkboard: a rummage of flyers. 'SWAP,' 'WANTED,' 'LOST CAT, ANSWERS TO SHAME.'", "And one that reads: 'ESTATE SALE. PRUITT. WOODSIDE. EVERYTHING MUST GO.' The flyer's got a phone number and a photo of a basement full of crates.", "Pruitt. That's got to be Mort's collector.", async () => { await checkHunt(S); }]; } return "The corkboard's flyer: 'ESTATE SALE. PRUITT. WOODSIDE. EVERYTHING MUST GO.' And a crayon drawing of a cat that's, frankly, better than most album art."; },
      pickup: "I take a flyer. I'll find a use for it. Probably in my bag as a very expensive bookmark.", use: S => RP.runH(RP.curRoom().def.hotspots.find(h => h.id === "a3_f_cork").look) },
    { id: "a3_f_hoop", name: "basketball hoop", r: [564, 30, 62, 56], z: 10, look: "A basketball hoop, folded up against the wall like a very patient visitor.", use: "I'm in a gym. I'm not going to shoot. I've got a bag of vinyl on my shoulder; I could break something.", pickup: "It's bolted to the wall. And the wall is bolted to a school." },
    { id: "a3_f_banner", name: "banner", r: [118, 50, 404, 30], z: 18, look: "SUNDAY RECORD FAIR. 10 TO 4. $3 AT THE DOOR. CASH ONLY. The banner's been used for twenty Sundays and one wedding." },
    { id: "a3_f_score", name: "scoreboard", r: [60, 58, 56, 40], z: 18, look: "A scoreboard that reads HOME 00, GUEST 00. Tonight's game is between 'Sellers' and 'Buyers.' Nobody's winning.", pickup: "It's bolted to a gym wall. It's also a score I'd rather not keep." },
    { id: "a3_f_crowd", name: "browsers", r: [68, 200, 548, 28], z: 5, floor: true, look: "A gym full of people flipping through crates. The kind of crowd you only see in two places: a record fair and a funeral. The vibe is the same.", talk: "Hello, browsers. ...They're not looking up. They've got the same look on every face: 'I'm about to find something.'" }
  ],
  combos: [
    ["a3_coffee", "a3_mort", S => RP.state.f.a3_rayTip ? (RP.state.f.a3_clue2 ? "@a3_mort I've had one. It's enough." : mortCoffee(RP.state)) : "Mort doesn't know me yet. Coffee as a first impression? Weird."],
    ["a3_coffee", "a3_priya", "@a3_priya I don't take handouts from people I'm racing. It's a pride thing."],
    ["a3_coffee", "a3_dj_danny_krivit", "I'm not going to hand Danny Krivit a PTA coffee. He's got his own coffee. Probably better."],
    ["a3_bag", "a3_mort", "@a3_mort What's in the bag? ...No. Don't tell me. You'll ask me to buy it."]
  ],
  self: { look: "A DJ in a school gym, holding a bag of records and a PTA coffee. I'm either a visionary or a very good-looking mistake.", talk: "Hello, self. We're in a gym. It's Sunday. We're okay." }
});
})();
