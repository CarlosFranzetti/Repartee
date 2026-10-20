/* Act 2 — the 4th-floor hallway of my old building in Bushwick: the new lock on 4C, Lou's door (4B), the stairs down.
   Lou keeps everyone's mail (the Con Ed bill = proof of address for the plasma center) and finally admits that
   "NYC 93" is his own track, recorded in 1993 and never released. (Fictional.)
   Flags: a2_louMet, a2_billGot, a2_louSecret, a2_geraldAsked, a2_louTapes */
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
      await RP.lines(["@a2_lou Your plant? Gerald's thriving. I water him through the hole in the wall with a turkey baster.", "@a2_lou He's seen things. He asked about you. Okay, he didn't. He's a plant. But he'd ask."]);
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
      use: "Locked. The lock's new and it knows it.", open: "Locked. I try the handle twice, in case the first time was a mistake.", push: "I throw my shoulder against it. The door doesn't care. My shoulder cares a lot.", pull: "Nothing. The deadbolt looks like a tiny smirk.",
      talk: async S => { await RP.lines(["Gerald? ...Gerald, it's me.", "No answer. He's a plant. He's got good instincts.", "I'll be back for you, buddy."]); } },
    { id: "a2_notice", name: "notice", r: [366, 52, 34, 28], z: 40, walk: [382, 214, "back"],
      look: "\"NOTICE: LOCK CHANGE (TEMPORARY). Tenants must contact Management to receive new key. Management office hours: Tuesdays, 2:00-2:15 PM.\" Fifteen minutes a week. They've thought of everything except help. I'm not rearranging my life to beg Kowalski for a quarter hour he'll spend saying \"next week.\" Marcus's couch is home for now.",
      pickup: "It's taped on with the kind of tape that outlives civilization.", use: "I could read it again. It wouldn't get better." },
    { id: "a2_4d", name: "door 4D", r: [500, 38, 50, 128], z: 20, walk: [524, 214, "back"], look: "4D. The guy in 4D plays a trombone at 6 AM. We don't talk. We have an understanding. He has the trombone.", use: "I'm not knocking. If he answers, it'll be with a trombone.", open: "Locked. And I'd hate to see what's behind it.", talk: "...A faint trombone. We're both busy." },
    { id: "a2_light", name: "ceiling bulbs", rects: [[190, 10, 16, 30], [462, 10, 16, 30]], z: 14, walk: [330, 214, "back"], look: "Two bare bulbs that flicker like they're sending Morse code for \"fix me.\" The landlord has heard it and chosen silence.", use: "I'd change it but I don't have a bulb. Or a ladder. Or standing.", pickup: "Not without a ladder and a lawyer." },
    { id: "a2_radiator", name: "radiator", r: [294, 124, 54, 36], z: 24, walk: [322, 214, "back"], look: "A hallway radiator that clanks like a ghost. In December it's a sauna; in October it's a coat rack.", use: "It's off. Cold, like the landlord's heart.", push: "It doesn't budge. Nothing in this building does." },
    { id: "a2_window", name: "hallway window", r: [588, 12, 48, 62], z: 16, walk: [612, 214, "back"], look: "A window onto an airshaft: a wall of brick, a clothesline and someone's cat looking at me like it knows my rent.", open: "It's painted shut. Since the Dinkins administration.", push: "It's shut. Hard." },
    { id: "a2_bike", name: "bike on the wall", r: [564, 106, 52, 36], z: 24, walk: [590, 214, "back"], look: "Someone's bike, hanging on a hook like a trophy. It's been there so long it's technically part of the building.", pickup: "Not mine. And it's up there for a reason. The reason is the 4D guy's trombone.", use: "No. I don't ride anything with a trombone owner's name on it." },
    { id: "a2_ext", name: "fire extinguisher", r: [604, 90, 14, 38], z: 24, walk: [612, 214, "back"], look: "A fire extinguisher, last inspected in 2014. It's a prop. It's also a mood.", pickup: "If I need it, it won't work. If it works, I won't need it. It's a koan.", use: "I'm not setting the building on fire. It's the only place I have mail." },
    { id: "a2_menus", name: "takeout menus", r: [136, 184, 56, 20], z: 12, floor: true, look: "A pile of takeout menus someone shoved under the door. Thai, pizza, Thai-pizza. Hope with a delivery charge.", pickup: "I'm not taking a menu. I'm taking a stand." }
  ],
  combos: [
    ["white", "a2_lou4b", S => louSecret(RP.state)],
    ["a2_bill", "a2_lou4b", "\"Lou, I've got the bill.\" He says nothing. He's already taken credit."],
    ["usb_cat", "a2_4c", "It's a USB. It's not a key. The lock thinks it's funnier than that."],
    ["phone", "a2_4c", "I'd call the landlord, but then I'd have to listen to the hold music and the hold music is \"Next Week.\""],
    ["a2_card", "a2_4c", "Cards don't open locks outside movies. And I don't have a movie. I have a card with plasma on it."]
  ]
});
})();
