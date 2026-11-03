/* Act 2 — the 4th-floor hallway of my old building in Bushwick: the new lock on 4C, Lou's door (4B), the stairs down.
   Lou keeps everyone's mail (the Con Ed bill = proof of address for the plasma center) and finally admits that
   "NYC 93" is his own track, recorded in 1993 and never released. (Fictional.)
   Flags: a2_louMet, a2_billGot, a2_louSecret, a2_geraldAsked, a2_louTapes, a2_seamSeen, a2_louWindow, a2_loot4c,
   a2_kowMet, a2_kowSoft, a2_kowDone, a2_kowRef.
   Optional Tuesday: Kowalski's office hour (pierogi from Dani + $40 = key + a word to Vic), and the hall window (putty knife) out the
   airshaft fire escape into 4C: $35 and the demo tape. */
(function () {
"use strict";
const RP = window.RP, A2 = RP.a2, PK = RP.PK;
const { R, P, ell, txt, txtC } = RP.u;
const U = PK.util;
const W = 640;

function paint(c, S) {
  const em = [];
  // upper wall: cream plaster peeling to older green; lower wainscot in glossy hallway green
  PK.plaster(c, 0, 0, W, 92, { base: "#cdc4a4", seed: 51, patches: 2, stains: 3, cracks: 2 });
  PK.plaster(c, 0, 88, W, 78, { base: "#5b8a68", seed: 52, patches: 1, stains: 1, cracks: 2 });
  R(c, 0, 86, W, 4, "#2a4a38"); U.HL(c, 0, 86, W, "#7aa08a"); U.HL(c, 0, 89, W, "#1a2a20");
  U.dshade(c, 0, 90, W, 40, "#ffffff", (x, y) => ((x * 2 + y) % 60 < 6 ? 1 : 0), 0.08);
  for (let i = 0; i < 40; i++) { const x = 20 + (i * 53) % 600, y = 18 + (i * 29) % 60; R(c, x, y, 5 + (i % 4), 3, i % 2 ? "#6a8a6a" : "#b8ae8a"); } // peeled flakes revealing old layers
  PK.baseboard(c, 0, 158, W, { color: "#2a4a38", h: 8 });
  PK.tiles(c, 0, 166, W, 90, { a: "#c4bca4", b: "#948c78", grout: "#6a6454", size: 22, checker: true, seed: 3 });
  PK.carpet(c, 90, 204, 548, 40, { pattern: "stripes", base: "#6a3a3a", accent: "#8a5a4a", seed: 3 });
  R(c, 90, 204, 548, 2, "#3a2020"); R(c, 90, 242, 548, 2, "#3a2020");
  U.dshade(c, 0, 166, W, 14, "#0c0a08", (x, y) => 1 - (y - 166) / 14, 0.3);
  // ceiling pipe
  PK.pipe(c, 0, 10, W, { dir: "h", r: 5, joint: 120 });
  em.push.apply(em, PK.bulb(c, 196, 12, { len: 6, glowR: 40 })); em.push.apply(em, PK.bulb(c, 468, 12, { len: 6, glowR: 40 }));
  // stairwell down (left): banister, dark void, warm light from the landing below
  R(c, 0, 90, 82, 76, "#120c0c"); PK.gradV(c, 0, 90, 82, 76, ["#1a1210", "#2a1c14", "#4a3020"], { dither: 1 });
  for (let i = 0; i < 7; i++) { R(c, 4 + i * 11, 130 + i * 4, 40, 4, "#3a2a1a"); U.HL(c, 4 + i * 11, 130 + i * 4, 40, "#6a4a30"); }
  R(c, 0, 108, 82, 5, "#6a4a30"); U.HL(c, 0, 108, 82, "#a87a50"); for (let x = 4; x < 80; x += 8) { R(c, x, 113, 3, 46, "#4a3020"); U.VL(c, x, 113, 46, "#7a5a40"); }
  R(c, 0, 158, 82, 8, "#3a2a1a"); em.push([10, 120, 60, 38]);
  txt(c, "STAIRS", 22, 92, "#c8b890", 1, 1); R(c, 28, 100, 28, 6, "#2a1c14"); txt(c, "DOWN", 32, 101, "#c8b890", 1, 1);
  // 4A
  PK.door(c, 108, 40, 46, 124, { color: "#7a5a3a", frame: "#d8c8a8", number: "4A", panels: 4, seed: 11, peephole: true });
  R(c, 110, 160, 42, 5, "#4a2a1a"); // mat
  // 4B: Lou. TV glow under the door, a very firm sign
  PK.door(c, 226, 40, 46, 124, { color: "#6a4a2a", frame: "#d8c8a8", number: "4B", panels: 4, seed: 12, peephole: true });
  R(c, 232, 144, 34, 14, "#4a3020"); // mail slot area scuffs
  R(c, 232, 70, 34, 26, "#f4f0e4"); U.outline(c, 232, 70, 34, 26, "#a8a08c"); txtC(c, "NO", 249, 73, "#c0302c", 1, 0); txtC(c, "SOLICITING", 249, 79, "#1d1622", 1, 0); txtC(c, "NO MUSIC", 249, 85, "#c0302c", 1, 0); txtC(c, "NO TALKING", 249, 91, "#c0302c", 1, 0);
  R(c, 232, 158, 34, 4, "#2a5ad8"); em.push([232, 158, 34, 4]); U.dshade(c, 224, 148, 50, 14, "#5a8aff", (x, y) => (y - 148) / 14, 0.4); em.push([226, 150, 46, 10]);
  R(c, 224, 162, 50, 6, "#6a3a2a"); txtC(c, "GO AWAY", 249, 163, "#e8dcc4", 1, 0); // mat
  // 4C: mine. A new chrome deadbolt, an official notice, a lease-shaped silence
  PK.door(c, 360, 40, 46, 124, { color: "#6a4a5e", frame: "#d8c8a8", number: "4C", panels: 4, seed: 13, peephole: true });
  R(c, 392, 90, 10, 14, "#e8e4f0"); U.outline(c, 392, 90, 10, 14, "#8a869c"); ell(c, 397, 94, 3, 3, "#c8c4d8"); R(c, 395, 99, 4, 4, "#14121a"); P(c, 394, 92, "#ffffff"); em.push([392, 90, 10, 14]);
  R(c, 368, 54, 30, 24, "#fff6a8"); U.outline(c, 368, 54, 30, 24, "#a89858"); U.HL(c, 369, 55, 28, "#fffbe0");
  txtC(c, "NOTICE", 383, 56, "#c0302c", 1, 0); txtC(c, "LOCK CHANGE", 383, 62, "#1d1622", 1, 0); txtC(c, "(TEMPORARY)", 383, 68, "#1d1622", 1, 0); txtC(c, "OFFICE: TUE 2PM", 383, 74, "#8a869c", 1, 0);
  R(c, 362, 160, 42, 5, "#6a4a5e"); txtC(c, "WELCOME", 383, 160, "#e8dcc4", 1, 0);
  // 4D, ajar a tiny bit, a bike on the wall, a fire extinguisher, the end-of-hall window
  PK.door(c, 502, 40, 46, 124, { color: "#7a3a3a", frame: "#d8c8a8", number: "4D", panels: 4, seed: 14, peephole: true });
  PK.bike(c, 566, 108, { color: "#c0302c", seed: 5 });
  R(c, 606, 96, 10, 28, "#c0302c"); U.HL(c, 606, 96, 10, "#ff6a5a"); R(c, 608, 92, 6, 4, "#2a2834"); R(c, 616, 94, 4, 8, "#2a2834"); R(c, 607, 106, 8, 6, "#f4f0e4"); txtC(c, "FIRE", 611, 107, "#c0302c", 1, 0);
  em.push.apply(em, PK.window(c, 590, 14, 44, 56, { view: "airshaft", time: "day", frame: "#a8a090", seed: 3, bars: true }));
  // takeout menus, a stray left shoe, a pile of someone's junk mail
  [[168, 190], [180, 194], [140, 186]].forEach(([x, y]) => { R(c, x, y, 10, 7, "#e8dcc4"); U.outline(c, x, y, 10, 7, "#a89878"); P(c, x + 2, y + 2, "#c0302c"); });
  // radiator and a dead plant outside 4B
  PK.radiator(c, 296, 126, 50, 32, { color: "#cfc8b4" });
  return em;
}

function light(S) {
  return {
    ambient: "#4e4660",
    lights: [
      { x: 198, y: 24, r: 210, color: "#ffe0a0", steps: 4, sy: 1.1 },
      { x: 470, y: 24, r: 220, color: "#ffe0a0", steps: 4, sy: 1.1 },
      { box: [590, 14, 44, 56], r: 110, color: "#9aa8d0", steps: 3, power: 0.7 },
      { box: [226, 146, 46, 16], r: 50, color: "#5a8aff", steps: 2, power: 0.8, rim: true },
      { x: 40, y: 140, r: 100, color: "#ffb070", steps: 3, power: 0.7 }
    ],
    halos: [{ x: 198, y: 26, r: 18, color: "#ffcf80", strength: 0.9 }, { x: 470, y: 26, r: 18, color: "#ffcf80", strength: 0.9 }],
    key: { x: 330, y: 30 }, shadow: 0.55
  };
}

function draw(c, S, t) {
  // the bulbs flicker; the one over 4C sulks
  const f = (t % 5300) < 120 || ((t % 11000) > 10500 && Math.floor(t / 90) % 2);
  if (f) { R(c, 463, 12, 11, 17, "#2a2630"); }
}

/* ------------------------------------------------------------------ Lou */
async function louSecret(S) {
  await RP.lines([
    "Lou. The record you gave me. \"NYC 93.\" There's no artist, no title. Whose is it?",
    "@a2_lou ......",
    "@a2_lou ...The TV just went quiet. I'm going to say this once. Sit down.",
    "I'm standing in a hallway.",
    "@a2_lou Then lean. It's mine, kid.",
    "Yours?",
    "@a2_lou Nineteen ninety-three. A basement on Fulton Street. A borrowed sampler and a drum machine that smelled like burning toast. I made it in nine hours.",
    "@a2_lou I pressed ten copies. White label. Never released. I played it every Saturday till the guy who was gonna put it out went to Florida. Or jail. Same direction.",
    "Why didn't you ever tell me?",
    "@a2_lou Because nobody asked. And because it's easier to say you used to go out than say you used to make something.",
    "Why give it to me?",
    "@a2_lou Because I got tired of it being quiet. Records are made to be played. You're the only one in this building who plays anything."
  ]);
  S.f.a2_louSecret = true;
  RP.followers(3);
  await RP.lines([
    "I'm going to play it, Lou. Somewhere good. With a real system.",
    "@a2_lou Don't make me cry in a hallway. I'm wearing a cardigan, it's not water-resistant.",
    "@a2_lou ...If you play it for somebody who matters, you tell 'em it's by L.O.U. Lou's Only... Unreleased. It's a long story. It's a short name."
  ]);
  RP.toast("Lou's secret: \"NYC 93\" is his own track.");
}

/* ------------------------------------------------------------------ the optional Tuesday: 4C and Kowalski */
const kowOpen = S => !!S.f.a2_dayDone && (S.f.a2_ch || 1) === 1 && !S.f.a2_kowDone;

// 4C from the inside (via the airshaft window or with Kowalski's key): Gerald, $35 and the demo tape
async function enter4C(S, how) {
  if (S.f.a2_loot4c) { await RP.say("Nothing left in there but Gerald. He's thriving. I'm not disturbing a man in a good place."); return; }
  if (how === "key") {
    await RP.walkTo(382, 214, "back");
    RP.sfx("click");
    await RP.lines(["The new key turns like it was made for this door. Which it was, by a man who changed the lock to keep me out. Closure."]);
  }
  await RP.fadeTo(1, 500);
  await RP.lines([
    "4C. It smells like me before the hot dog. The lock crew tracked mud across the floor and moved nothing, with the care of professionals who bill by the hour.",
    "Gerald is on the windowsill, leaning at the light. Lou's turkey baster has left a small, loving puddle in his saucer."
  ]);
  await RP.fadeTo(0, 500);
  await RP.lines([
    "Under Gerald's saucer: an envelope. \"EMERGENCY. DO NOT SPEND ON RECORDS.\" In my own handwriting. I spend it on records, but at least now I feel bad about it.",
    "Thirty-five dollars. It's the nicest thing past-me ever did for present-me."
  ]);
  RP.money(35); RP.sfx("cash");
  await RP.lines([
    "On the shelf by the dead stereo, a cassette: \"BED-STUY MIX VOL. 2 (DON'T JUDGE).\" My demo. Forty minutes of me trying to sound like I'm not trying.",
    "I leave Gerald and his spare pot where they are. He's got a view and a baster. I'm the one with a couch."
  ]);
  RP.give("a2_tape"); S.f.a2_loot4c = true;
  if (how !== "key") await RP.lines(["Back out the window, past the clothesline, onto the hallway side. The pigeon doesn't say anything. I appreciate its discretion."]);
  await RP.walkTo(how === "key" ? 382 : 612, 214, how === "key" ? "back" : "back");
}

async function hallWindow(S) {
  if (S.f.a2_loot4c) { await RP.say("It's open now. I could climb out again, but there's nothing left in 4C but Gerald, and Gerald has made it clear he's staying."); return; }
  if (!RP.has("a2_knife")) {
    S.f.a2_seamSeen = true;
    await RP.lines(["The window is painted shut, from at least four administrations. I push. The paint pushes back.", "There's a seam where the paint meets the frame, thin as a rumor. Something flat and thin and stiff could crack it. My thumbnail is not that."]);
    return;
  }
  await RP.walkTo(612, 214, "back");
  RP.sfx("thump");
  await RP.lines(["I work the putty knife into the seam. It cracks along the frame like a dry riverbed. Four administrations of paint, gone.", "The window slides up. Airshaft air: cold, brick, somebody's onions."]);
  await RP.lines(["The fire escape. Rated for \"hopes.\" I step out onto it, then down a landing, then along, past a clothesline of someone's very large underwear, to my own kitchen window.", "It has never latched. I shoulder it. It opens like it's been waiting for me. The only door in this building that likes me is a window."]);
  await enter4C(S, "window");
}

async function settleKow(S) {
  if (!kowOpen(S)) return "Mr. Kowalski isn't here. Office hours are over.";
  if (!RP.has("a2_pierogi")) return "I have nothing to offer him but my side of the story.";
  if (!S.f.a2_kowSoft) {
    S.f.a2_kowSoft = true; RP.take("a2_pierogi");
    await RP.lines([
      "Dani's pierogi. It's a long shot, in a Tupperware.",
      "@a2_kow ...What's this?",
      "Potato and cheese. A friend in Greenpoint made them.",
      "@a2_kow Greenpoint. Manhattan Avenue? Next to the church? ...Her grandmother's recipe, I'll bet. Don't tell me. I'll cry in front of my own forms.",
      "@a2_kow Forty years I've collected rent in this building and not once has a tenant brought me something that wasn't a complaint or a postcard from Florida.",
      "@a2_kow Sit. Sit. I'm eating these. Fifteen minutes is fifteen minutes, but a man can eat in fourteen."
    ]);
    RP.sfx("success");
  }
  return payKow(S);
}

async function payKow(S) {
  await RP.lines([
    "@a2_kow Here's the thing. The rent's the rent. You're short. The lock is the lock. It's temporary because I wrote \"temporary\" on it, which is the only reason it's temporary.",
    "@a2_kow I'll cut the lock fee. Forty on account, the rest on the first, and you're a tenant again. Forty. That's a pierogi discount."
  ]);
  const i = await RP.choose(["Pay $40 on account", "Not yet"]);
  if (i !== 0) { await RP.say("I need a minute. Kowalski waves a hand: \"I'm here till you sleep, kid. Come back with forty. I'm saving you the second pierogi.\"", "nar"); return; }
  if (S.money < 40) { await RP.lines(["I have $" + Math.round(S.money) + ". It's a beginning.", "@a2_kow Forty is forty. The second pierogi is waiting. So am I."]); return; }
  RP.money(-40); RP.sfx("cash"); RP.give("a2_key");
  S.f.a2_kowDone = true; S.f.a2_kowRef = true;
  await RP.lines([
    "@a2_kow There. The key. Hot water: next week.",
    "I know. I know it's next week.",
    "@a2_kow You mentioned a flyer. The Basement Tapes, Gowanus. That's my building. I rent that basement to a man in sunglasses. Vic.",
    "@a2_kow Vic pays on time, which I find rude. If you ever have to stand in front of him, tell him Kowalski says you pay on time too. I'll say it back, if he asks. He won't ask. He'll just feel it.",
    "@a2_kow Now go. I have a second pierogi and a sentiment I don't have a form for."
  ]);
  RP.followers(2);
  RP.toast("Key to 4C. Kowalski will vouch for you with Vic.");
}

async function talkKow(S) {
  if (!S.f.a2_kowMet) {
    S.f.a2_kowMet = true;
    await RP.lines([
      "Mr. Kowalski. Folding table, a stack of forms, a ham sandwich on foil, and a mug: \"PIEROGI FEST 2009 — GREENPOINT.\"",
      "@a2_kow Name and unit. ...4C. The lockout. You're the DJ. The one with the noise.",
      "@a2_kow Fifteen minutes. Make it a good fourteen. Lunch."
    ]);
  }
  await RP.convo([
    { text: "I'd like the key to 4C.", when: S2 => !S2.f.a2_kowSoft, run: async () => {
      await RP.lines(["@a2_kow Key's a hundred and ninety. Arrears, the lock fee, and a little for my trouble. Cash or a miracle.", "I have $" + Math.round(S.money) + ".", "@a2_kow Then it's a miracle. Next week. I do miracles next week.", "@a2_kow I'd get you a better deal if I liked you. I don't know you. Nobody brings me anything. They bring complaints.", "My mother's pierogi, God rest her, used to end wars on this block. Greenpoint. Gone, the recipe. I think about it with my ham."]);
    } },
    { text: "I'm ready to pay the forty.", when: S2 => !!S2.f.a2_kowSoft && !S2.f.a2_kowDone, run: async () => { await payKow(S); } },
    { text: "Who else rents from you?", run: async () => { await RP.lines(["@a2_kow Half of Bushwick and a Gowanus basement. Nobody tells me anything. They tell me to fix the hot water.", "@a2_kow The basement's rented by a man in sunglasses who pays cash on the first. It's inhuman. I find it rude."]); } },
    { text: "What about the hot water?", run: async () => { await RP.lines(["@a2_kow Next week."]); } },
    { text: "Let me know when the lock stops being temporary.", end: true }
  ]);
}

async function talkLou(S) {
  if (!S.f.a2_louMet) {
    S.f.a2_louMet = true;
    RP.sfx("knock");
    await RP.lines(["@a2_lou WHAT.", "Lou, it's me.", "@a2_lou ......The kid. Hold on."]);
    RP.sfx("click");
    await RP.lines([
      "@a2_lou They changed your lock. I heard the drill. Seven in the morning. I told them it was a crime against sleep.",
      "Yeah. \"Temporary.\"",
      "@a2_lou Nothing in this building is temporary except the hot water."
    ]);
    A2.beat(S);
  }
  await RP.convo([
    { text: "Lou, do you have any mail for me?", when: S2 => !S2.f.a2_plasma && !RP.has("a2_bill"), run: async () => {
      await RP.lines([
        "@a2_lou Mail? The carrier puts everything in 4B. Last week I got a jury summons for a man who moved out in 2011.",
        "@a2_lou A catalog for a woman named Sheila. A postcard from Florida. And... yours. Con Ed. Overdue."
      ]);
      RP.give("a2_bill"); S.f.a2_billGot = true;
      await RP.say("Lou slides a Con Ed bill through the crack. Overdue, with my name and 4C in a window. It's a beautiful thing: proof I exist somewhere.");
    } },
    { text: "Lou... about \"NYC 93.\"", when: S2 => !S2.f.a2_louSecret && (RP.has("white") || RP.hasRecord("white_nyc93")), run: async () => louSecret(S) },
    { text: "How's Gerald?", run: async () => {
      S.f.a2_geraldAsked = true;
      await RP.lines(["@a2_lou Your plant? Gerald's thriving. I water him through the hole in the wall with a turkey baster.", "@a2_lou He's seen things. He asked about you. Okay, he didn't. He's a plant. But he'd ask.", "From behind Lou, through the crack, something small goes \"mrrp.\"", "Was that a cat?", "@a2_lou Radiator.", "The radiator is on the other side of the hall.", "@a2_lou It's a visitor. He likes my records. He's not on the lease. Neither of us is discussing it."]);
    } },
    { text: "Who painted the hall window shut?", when: S2 => !S2.f.a2_loot4c, run: async () => {
      S.f.a2_louWindow = true;
      await RP.lines(["@a2_lou I did. 1998. Pigeons. They'd come in and look at me.", "@a2_lou There's a seam where the paint meets the frame. Thin steel, flat, you work it along and it cracks like a dry riverbed. Don't use your face.", "@a2_lou The fire escape out there goes past your kitchen window, by the way. Never latched. I've told you for two years. You said \"it's fine.\"", "@a2_lou It was not fine. I watched a raccoon use it once. He knocked."]);
    } },
    { text: "Ever heard of Basement Tapes?", when: S2 => S2.f.a2_plan, run: async () => {
      S.f.a2_louTapes = true;
      await RP.lines(["@a2_lou Basement Tapes? That's the old Tri-State Tape place. Gowanus. I got my demos duplicated there in '93. Smelled like hot plastic and ambition.", "@a2_lou If it's the same basement, tell the ghost of the foreman Lou says hi."]);
    } },
    { text: "Anything from the landlord?", run: async () => { await RP.lines(["@a2_lou Kowalski? He says the hot water comes back Monday. He didn't say which Monday."]); } },
    { text: "Thanks, Lou.", end: true }
  ]);
}

RP.room({
  id: "a2_hall", act: 2, name: "4th floor",
  paint,
  cacheKey: S => "h",
  light,
  ambience: "room",
  walk: [[8, 208], [630, 208], [630, 252], [8, 252]],
  start: { x: 70, y: 232, face: "right" },
  update: A2.update,
  actors: [{ id: "a2_kow", char: "a2_kow", x: 176, y: 230, face: "right", act: "stand", name: "Mr. Kowalski", vis: S2 => kowOpen(S2) }],
  draw,
  fx: [{ type: "dust", rect: [140, 20, 140, 140], count: 8, color: "#ffe2a0" }, { type: "dust", rect: [420, 20, 120, 140], count: 8, color: "#ffe2a0" }],
  hotspots: [
    { id: "a2_stairs", name: "stairs down", r: [0, 90, 84, 78], z: 30, walk: [70, 224, "left"], exit: "travel", look: "The stairs: four flights of worn wood, a banister polished by a thousand hands and a smell of other people's cooking. The street's at the bottom, and so is Brooklyn.", push: "I'd rather walk than push stairs." },
    { id: "a2_4a", name: "door 4A", r: [106, 38, 50, 128], z: 20, walk: [130, 214, "back"], look: "4A. I've lived down the hall for two years and I've never seen anyone go in or out. I assume ghosts. Or finance.", use: "Knock? No. If 4A answers, I'll find out what's in 4A. I'm not ready.", open: "It's locked. Everything in this building is locked except my windows.", talk: "Silence. Maybe a faint hum. Finance, probably." },
    { id: "a2_lou4b", name: "Lou's door (4B)", r: [224, 38, 50, 130], z: 22, walk: [250, 214, "back"],
      look: "Lou's door: \"NO SOLICITING. NO MUSIC. NO TALKING.\" The TV glows blue under it. It's the loudest quiet sign in New York.",
      use: S => talkLou(S), talk: S => talkLou(S), open: "It's chained. Lou opens it when Lou opens it. Usually when I'm not looking.",
      give: async (S, item) => { if (item === "white") return louSecret(S).then(() => {}); return "Lou doesn't want that. He wants me to keep it down."; },
      push: "If I push, he'll push back. With a cardigan." },
    { id: "a2_4c", name: "my door (4C)", r: [358, 38, 50, 130], z: 22, walk: [382, 214, "back"],
      look: "4C. My door, my home, my security deposit's last resting place. A gleaming new deadbolt shines on it like a smug dentist. There's a notice taped under the peephole.",
      use: S => RP.has("a2_key") ? enter4C(S, "key") : S.f.a2_loot4c ? "Locked again, behind me. Nothing left in there except Gerald, who is thriving, and the smell of my own socks." : "Locked. The lock's new and it knows it.", open: S => RP.has("a2_key") ? enter4C(S, "key") : "Locked. I try the handle twice, in case the first time was a mistake.", push: "I throw my shoulder against it. The door doesn't care. My shoulder cares a lot.", pull: "Nothing. The deadbolt looks like a tiny smirk.",
      talk: async S => { await RP.lines(["Gerald? ...Gerald, it's me.", "No answer. He's a plant. He's got good instincts.", "I'll be back for you, buddy.", S.f.a2_billGot ? "My mail all goes to Lou anyway. Nothing in there needs me except Gerald." : "My mail goes to Lou, not to 4C. Nothing in there needs me except Gerald."]); } },
    { id: "a2_notice", name: "notice", r: [366, 52, 34, 28], z: 40, walk: [382, 214, "back"],
      look: S => "\"NOTICE: LOCK CHANGE (TEMPORARY). Tenants must contact Management to receive new key. Management office hours: Tuesdays, 2:00-2:15 PM.\" Fifteen minutes a week. They've thought of everything except help. " + (S.f.a2_kowDone ? "Kowalski's folding table is gone. The notice remains, like a ghost with a deadline." : S.f.a2_dayDone ? "It's Tuesday, a little before two. There's a folding table by the stairs and a man behind it eating a ham sandwich." : "Not rearranging my life for a quarter hour he'll spend saying \"next week.\" Marcus's couch is home for now. Tuesday, though, I'm free."),
      pickup: "It's taped on with the kind of tape that outlives civilization.", use: "I could read it again. It wouldn't get better." },
    { id: "a2_4d", name: "door 4D", r: [500, 38, 50, 128], z: 20, walk: [524, 214, "back"], look: "4D. The guy in 4D plays a trombone at 6 AM. We don't talk. We have an understanding. He has the trombone.", use: "I'm not knocking. If he answers, it'll be with a trombone.", open: "Locked. And I'd hate to see what's behind it.", talk: "...A faint trombone. We're both busy." },
    { id: "a2_light", name: "ceiling bulbs", rects: [[190, 10, 16, 30], [462, 10, 16, 30]], z: 14, walk: [330, 214, "back"], look: "Two bare bulbs that flicker like they're sending Morse code for \"fix me.\" The landlord has heard it and chosen silence.", use: "I'd change it but I don't have a bulb. Or a ladder. Or standing.", pickup: "Not without a ladder and a lawyer." },
    { id: "a2_radiator", name: "radiator", r: [294, 124, 54, 36], z: 24, walk: [322, 214, "back"], look: "A hallway radiator that clanks like a ghost. In December it's a sauna; in October it's a coat rack.", use: "It's off. Cold, like the landlord's heart.", push: "It doesn't budge. Nothing in this building does." },
    { id: "a2_window", name: "hallway window", r: [588, 12, 48, 62], z: 16, walk: [612, 214, "back"], look: S => S.f.a2_loot4c ? "The hall window, open and unpainted. A fire escape rattles outside, past a clothesline, to a kitchen window I've now officially broken into." : "A window onto an airshaft: brick, a clothesline, someone's cat looking at me like it knows my rent, and a fire escape zigzagging past. The third landing is outside my own kitchen window. The one I always leave unlatched.",
      open: S => hallWindow(S), use: S => hallWindow(S), push: S => hallWindow(S), pull: S => hallWindow(S), pickup: "It's a window. It's attached to the airshaft. I'm not strong enough to take the building's eyes." },
    { id: "a2_bike", name: "bike on the wall", r: [564, 106, 52, 36], z: 24, walk: [590, 214, "back"], look: "Someone's bike, hanging on a hook like a trophy. It's been there so long it's technically part of the building.", pickup: "Not mine. And it's up there for a reason. The reason is the 4D guy's trombone.", use: "No. I don't ride anything with a trombone owner's name on it." },
    { id: "a2_ext", name: "fire extinguisher", r: [604, 90, 14, 38], z: 24, walk: [612, 214, "back"], look: "A fire extinguisher, last inspected in 2014. It's a prop. It's also a mood.", pickup: "If I need it, it won't work. If it works, I won't need it. It's a koan.", use: "I'm not setting the building on fire. It's the only place I have mail." },
    { id: "a2_kow", name: "Mr. Kowalski", z: 80, look: S => "Mr. Kowalski, the landlord, at a folding table with a ham sandwich, a stack of forms and a mug: \"PIEROGI FEST 2009 — GREENPOINT.\" He looks like a man who has said \"next week\" so often it's lost its meaning, and kept the sentence.",
      talk: S => talkKow(S), give: async (S, item) => { if (item === "a2_pierogi") return settleKow(RP.state); if (item === "a2_card") return ["@a2_kow Plastic? In this building? You'll be paying with a body part next. ...Oh. You have. Sorry."]; if (item === "a2_flyer") return ["@a2_kow Basement Tapes? That's the old Tri-State Tape place on Gowanus. I rent it to a man in sunglasses. He pays on time, which I find rude. Is this about him?"]; return ["@a2_kow I'm not here to receive things. I'm here to say \"next week.\""]; } },
    { id: "a2_menus", name: "takeout menus", r: [136, 184, 56, 20], z: 12, floor: true, look: "A pile of takeout menus someone shoved under the door. Thai, pizza, Thai-pizza. Hope with a delivery charge.", pickup: "I'm not taking a menu. I'm taking a stand." }
  ],
  combos: [
    ["white", "a2_lou4b", S => louSecret(RP.state)],
    ["a2_bill", "a2_lou4b", "\"Lou, I've got the bill.\" He says nothing. He's already taken credit."],
    ["a2_pierogi", "a2_kow", S => settleKow(RP.state)],
    ["a2_pierogi", "a2_lou4b", "Lou would eat them and then deny it. He'd say they were already gone when they arrived."],
    ["a2_pierogi", "a2_4c", "Pierogi don't pick locks. They soften the man who holds the key."],
    ["a2_key", "a2_4c", S => enter4C(RP.state, "key")],
    ["a2_knife", "a2_window", S => hallWindow(RP.state)],
    ["a2_knife", "a2_4c", "A putty knife won't beat a chrome deadbolt. It might beat a window, though. Paint and plaster are its department."],
    ["a2_knife", "a2_notice", "I scrape. The notice stays. It's been taped by a man who plans for the apocalypse."],
    ["a2_sachet", "a2_kow", ["@a2_kow Lavender? I'm a landlord. I don't relax. It's in the lease."]],
    ["usb_cat", "a2_4c", "It's a USB. It's not a key. The lock thinks it's funnier than that."],
    ["phone", "a2_4c", "I'd call the landlord, but then I'd have to listen to the hold music and the hold music is \"Next Week.\""],
    ["a2_card", "a2_4c", "Cards don't open locks outside movies. And I don't have a movie. I have a card with plasma on it."]
  ]
});
})();
