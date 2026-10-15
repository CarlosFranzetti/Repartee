/* Act 2 — Marcus's block, Bed-Stuy (day / dusk / night by the HUD clock). Stoop door back to Marcus's, subway stairs
   (travel), Mrs. Pearl on the stoop (plasma tips), the bodega ATM that turns the LifeDrop card into cash.
   Flags: a2_pearlMet, a2_pearlTips, a2_cashed, a2_flyerGot */
(function () {
"use strict";
const RP = window.RP, A2 = RP.a2, PK = RP.PK;
const { R, P, ell, txt, txtC } = RP.u;
const U = PK.util;
const W = 640;
const dark = S => A2.night(S);

function paint(c, S) {
  const N = dark(S), em = [];
  PK.sky(c, 0, 0, W, 190, { time: N ? "night" : "day", seed: 6, clouds: N ? 0 : 3, moon: N ? { x: 304, y: 34, r: 7 } : false });
  em.push.apply(em, PK.skyline(c, 200, 70, 230, 120, { night: N, layers: 2, seed: 11, spire: true, spireX: 330 }));
  // left: brownstone with the stoop
  PK.brick(c, 0, 0, 238, 186, { base: N ? "#6e3a3e" : "#7e4238", mortar: "#6a5868", worn: 0.45, seed: 3 });
  U.dshade(c, 0, 0, 238, 14, "#0c0618", (x, y) => 1 - y / 14, 0.4);
  [[14, 12, true], [150, 12, false]].forEach(([x, y, lit], i) => { em.push.apply(em, PK.window(c, x, y, 56, 60, { view: "interior", lit: N ? lit : true, seed: 20 + i, frame: "#9a8aa8", curtain: i ? "#5a8ab8" : "#c0555a" })); });
  em.push.apply(em, PK.window(c, 20, 96, 54, 40, { view: "interior", lit: N, seed: 24, frame: "#9a8aa8", bars: true }));
  PK.door(c, 112, 20, 44, 118, { color: "#3f2a4a", frame: "#8a6a50", panels: 4, seed: 4, number: "2" });
  PK.stoop(c, 108, 134, 118, 50, { steps: 7, seed: 5 });
  // right: the bodega building
  PK.brick(c, 382, 0, 258, 186, { base: N ? "#7a3a3a" : "#8a4a3a", mortar: "#8a7a78", worn: 0.5, seed: 8 });
  U.dshade(c, 382, 0, 258, 14, "#0c0618", (x, y) => 1 - y / 14, 0.4);
  em.push.apply(em, PK.window(c, 398, 8, 44, 44, { view: "interior", lit: N, seed: 26, frame: "#a89ab0", curtain: "#e0a030" }));
  em.push.apply(em, PK.window(c, 590, 8, 44, 44, { view: "interior", lit: N ? false : true, seed: 27, frame: "#a89ab0" }));
  PK.awning(c, 390, 60, 244, { text: "ROSA'S DELI GROCERY", colors: ["#1f7a4a", "#efe8d8"] });
  // bodega window (shelves) + neon
  U.clip(c, 398, 96, 112, 86, () => { R(c, 398, 96, 112, 86, N ? "#ffe2a0" : "#f8e8c0"); em.push.apply(em, PK.shelf(c, 400, 98, 108, 84, { items: "cans", wood: "#8a6a4a", seed: 5 }) || []); });
  U.outline(c, 397, 95, 114, 88, "#d8c8a0"); U.HL(c, 398, 96, 112, "#efe0b0");
  em.push.apply(em, PK.neon(c, "OPEN", 418, 102, "#ff3fa4", { scale: 2, seed: 1 }));
  em.push.apply(em, PK.neon(c, "COLD", 466, 102, "#39d0ff", { scale: 2, tube: 2 }));
  txt(c, "LOTTO", 402, 168, "#ffd23f", 1, 1); txt(c, "MONEY ORDER", 436, 168, "#e8e4f0", 1, 1);
  // the ATM, bolted to the wall by the door
  const ax = 524, ay = 118;
  R(c, ax, ay, 40, 64, "#2a3a6a"); U.HL(c, ax, ay, 40, "#5a7ac8"); U.VL(c, ax, ay, 64, "#4a62a8"); U.VL(c, ax + 39, ay, 64, "#1a2240"); U.HL(c, ax, ay + 63, 40, "#1a2240");
  R(c, ax + 4, ay + 4, 32, 4, "#e8e4f0"); txtC(c, "CASH NOW", ax + 20, ay + 5, "#2a3a6a", 1, 0);
  R(c, ax + 4, ay + 11, 32, 18, "#0e3a2a"); U.outline(c, ax + 4, ay + 11, 32, 18, "#8a869c");
  txtC(c, "NO FEE*", ax + 20, ay + 14, "#9bf0b0", 1, 0); txtC(c, "INSERT", ax + 20, ay + 21, "#5ad88a", 1, 0);
  em.push([ax + 5, ay + 12, 30, 16]);
  for (let i = 0; i < 12; i++) R(c, ax + 6 + (i % 3) * 8, ay + 33 + Math.floor(i / 3) * 5, 6, 3, "#c8c4d8");
  R(c, ax + 8, ay + 55, 24, 4, "#14121a"); em.push([ax + 8, ay + 53, 24, 2]); R(c, ax + 8, ay + 53, 24, 2, "#ffd23f");
  R(c, ax + 14, ay + 28, 12, 2, "#14121a");
  txt(c, "*SEE FEE", ax + 2, ay + 66, "#e8e4f0", 1, 0);
  PK.door(c, 576, 92, 50, 92, { metal: true, window: true, color: "#6a7a8a", knob: false });
  txtC(c, "24 HR", 601, 98, "#ffd23f", 1, 1);
  // sidewalk, street, manhole, markings
  PK.sidewalk(c, 0, 182, W, 40, { curbY: 208, seed: 2 });
  PK.asphalt(c, 0, 222, W, 34, { lines: ["double"], seed: 6 });
  PK.manhole(c, 470, 240, { steam: 60 });
  // flyer pole in front of the gap (right of the stairs)
  R(c, 256, 90, 5, 118, "#3a3448"); U.VL(c, 256, 90, 118, "#6a6680"); R(c, 252, 200, 13, 8, "#2a2638");
  R(c, 242, 108, 18, 22, "#f4e888"); R(c, 244, 111, 14, 2, "#c0302c"); txt(c, "DONATE", 244, 115, "#c0302c", 1, 0); txt(c, "PLASMA", 244, 120, "#1d1622", 1, 0); txt(c, "$100", 246, 125, "#c0302c", 1, 0);
  PK.poster(c, 262, 96, 22, 30, { title: "BASEMENT TAPES", titleLines: ["BSMT", "TAPES"], lines: ["VINYL"], palette: "neon", seed: 31, tape: false });
  R(c, 240, 140, 12, 8, "#ff6cbb"); R(c, 264, 140, 10, 10, "#39d0ff"); txt(c, "NEXT WK", 235, 152, "#8a869c", 1, 0);
  return em;
}

/* sprites (depth-sorted) */
function drawStairs(c, S) { const em = PK.subwayStairs(c, 296, 176); return em; }
function drawLamp(c, S) { PK.streetlamp(c, 372, 208, { on: dark(S), h: 120 }); }
function drawCar(c, S) {
  // a parked sedan, nose to the left, side view
  const x = 70, y = 206, k = RP.u.ramp("#3a6a8a");
  const N = dark(S);
  U.groundShadow(c, x + 60, y + 38, 66, 4, 0.5);
  R(c, x, y + 14, 120, 20, "#3a6a8a"); PK.gradV(c, x, y + 14, 120, 20, [k[3], "#3a6a8a", k[1]], { dither: 1 });
  U.HL(c, x, y + 14, 120, k[4]); U.HL(c, x, y + 33, 120, k[0]);
  RP.u.poly(c, [[x + 24, y + 14], [x + 38, y], [x + 86, y], [x + 100, y + 14]], "#3a6a8a");
  RP.u.poly(c, [[x + 28, y + 14], [x + 40, y + 3], [x + 62, y + 3], [x + 62, y + 14]], N ? "#1a2a44" : "#9ac8e8");
  RP.u.poly(c, [[x + 66, y + 14], [x + 66, y + 3], [x + 84, y + 3], [x + 96, y + 14]], N ? "#1a2a44" : "#9ac8e8");
  U.HL(c, x + 38, y, 48, k[4]); R(c, x + 62, y + 3, 2, 11, k[1]);
  [[x + 24, y + 33], [x + 90, y + 33]].forEach(([wx, wy]) => { ell(c, wx, wy, 9, 9, "#14121a"); ell(c, wx, wy, 6, 6, "#8a869c"); ell(c, wx - 1, wy - 1, 3, 3, "#c8c4d8"); });
  R(c, x - 2, y + 22, 4, 6, "#ffe090"); R(c, x + 118, y + 22, 3, 6, "#c0302c");
  R(c, x + 40, y + 21, 12, 2, k[1]); R(c, x + 74, y + 21, 12, 2, k[1]);
  // a parking ticket under the wiper and a dent
  R(c, x + 30, y + 10, 6, 4, "#ffd23f");
}

function light(S) {
  if (dark(S)) return {
    ambient: "#37316a",
    lights: [
      { x: 397, y: 100, r: 220, color: "#ffb060", steps: 5, sy: 1.0, rim: true },
      { x: 470, y: 120, r: 130, color: "#ff3fa4", steps: 3, power: 0.7, rim: true },
      { x: 330, y: 190, r: 90, color: "#40e080", steps: 3, power: 0.7 },
      { box: [398, 96, 112, 86], r: 60, color: "#ffe2a0", steps: 3 },
      { box: [576, 92, 50, 92], r: 50, color: "#ffe2a0", steps: 2, power: 0.7 }
    ],
    halos: [{ x: 397, y: 100, r: 22, color: "#ffb060", strength: 1 }],
    key: { x: 397, y: 80 }, shadow: 0.55
  };
  return { ambient: "#e3d8ea", lights: [{ x: 100, y: -30, r: 700, color: "#fff4e0", steps: 3, power: 0.45 }], key: { x: 100, y: -20 }, shadow: 0.42 };
}

/* ------------------------------------------------------------------ the ATM */
async function useAtm(S) {
  if (!RP.has("a2_card")) { await RP.lines(["WELCOME. PLEASE INSERT CARD.", "I'd love to. I have a wallet with $" + Math.round(S.money) + " and a smile."]); return; }
  if (S.f.a2_cashed) { await RP.say("The card is empty. The ATM and I are done. For now."); return; }
  await RP.say("Fine. Let's feed the machine my blood money.");
  RP.sfx("click");
  await RP.lines([
    "BALANCE: $" + (S.f.a2_cardBal || 100) + ".00",
    "CONVENIENCE FEE: $9.99. SURCHARGE FOR BEING A MACHINE: $0.01.",
    "That's ten dollars of my own plasma for a machine to touch it."
  ]);
  const i = await RP.choose(["Withdraw everything ($" + ((S.f.a2_cardBal || 100) - 10) + ")", "Not yet"]);
  if (i !== 0) { await RP.say("I'll make the ATM wait. It's got nowhere to be. It's bolted down."); return; }
  RP.sfx("cash"); await RP.wait(500);
  const net = (S.f.a2_cardBal || 100) - 10;
  S.f.a2_cashed = true; S.f.a2_cardBal = 0;
  RP.take("a2_card");
  RP.money(net);
  await RP.say("Real cash. It smells like cinnamon and regret. The bodega guy gives me a thumbs up through the glass.");
}

/* ------------------------------------------------------------------ Mrs. Pearl */
async function talkPearl(S) {
  if (!S.f.a2_pearlMet) {
    S.f.a2_pearlMet = true;
    await RP.lines(["@a2_pearl Young man. You look like a person who needs a hundred dollars.", "Is it that obvious?", "@a2_pearl It's the shoes. And that you're talking to an old lady on a stoop."]);
  }
  await RP.convo([
    { text: "How does the plasma thing work?", run: async () => {
      S.f.a2_pearlTips = true;
      await RP.lines([
        "@a2_pearl Platinum member. Two hundred twelve donations. Ask me about my mug.",
        "@a2_pearl LifeDrop, Atlantic Avenue. You need ID, proof of address and Form 27-B. Not a text message. Rhonda doesn't believe in texts.",
        "@a2_pearl The pen is chained to the desk. Don't fight the pen.",
        "@a2_pearl Nurse Bev does the needle. Look at the ceiling. Think about pizza. And eat the cookie after, it's terrible, but it's tradition."
      ]);
    } },
    { text: "I got locked out. What counts as proof of address?", when: S2 => S2.f.a2_pearlTips, run: async () => {
      await RP.lines(["@a2_pearl A bill. A lease. An envelope with your name on it and a real street. Not a screenshot.", "@a2_pearl Is somebody keeping your mail? Somebody always keeps the mail. There's always a Lou."]);
    } },
    { text: "What's a two-time deal?", run: async () => { await RP.lines(["@a2_pearl Eddie? Oh, honey. I bought a toaster from Eddie. Then I bought it again. Neither toasts."]); } },
    { text: "Where do I cash a prepaid card?", when: S2 => S2.f.a2_pearlTips, run: async () => { await RP.lines(["@a2_pearl The bodega machine on the corner. It says \"no fee.\" Look closer. There's an asterisk. There's always an asterisk."]); } },
    { text: "Thanks, Mrs. Pearl.", end: true }
  ]);
}

RP.room({
  id: "a2_street", act: 2, name: "Bed-Stuy",
  paint,
  cacheKey: S => dark(S) ? "n" : "d",
  lightKey: S => dark(S) ? "n" : "d",
  light,
  ambience: "street",
  walk: [[8, 200], [632, 200], [632, 250], [8, 250]],
  start: { x: 330, y: 232, face: "front" },
  update: A2.update,
  fx: [
    { type: "steam", x: 489, y: 238, rise: 40, size: 9, drift: 6, color: "#e8e4f0" },
    { type: "cars", y: 232, dir: 1, period: 9000, on: () => dark(RP.state) }
  ],
  actors: S => [
    { id: "a2_pearl", char: "a2_pearl", x: 196, y: 172, face: "left", act: "sit", name: "Mrs. Pearl", vis: S2 => !dark(S2), noTurn: true, talkDist: 30 }
  ],
  sprites: [
    { y: 207, draw: (c, S) => drawLamp(c, S) },
    { y: 236, draw: (c, S) => drawCar(c, S) },
    { y: 226, draw: c => { PK.hydrant(c, 32, 190); } },
    { y: 214, draw: c => { PK.mailbox(c, 70, 184); } },
    { y: 213, draw: c => { PK.trashBags(c, 232, 188, { seed: 3 }); } },
    { y: 218, draw: c => { PK.newspaperBox(c, 394, 192, { color: "#ffd23f" }); } },
    { y: 213, draw: c => { PK.bike(c, 456, 184, { color: "#2f62b8", seed: 2 }); } },
    { y: 215, draw: (c, S) => { PK.subwayStairs(c, 296, 176); } }
  ],
  enter: async (S, from) => {
    if (from === "a2_couch" && !S.f.a2_streetSeen) { S.f.a2_streetSeen = true; RP.toast("Click the subway stairs to travel."); }
  },
  hotspots: [
    { id: "a2_stoopdoor", name: "Marcus's door", r: [110, 18, 50, 120], z: 30, walk: [160, 202, "back"],
      look: "Marcus's building. Second-floor parlor, door number 2, a buzzer that says \"MARCUS + TOBY (NO SOLICITING, NO PLUS-THREES).\"",
      exit: { room: "a2_couch", x: 70, y: 232, face: "right" },
      push: "It's locked from the outside. The inside is where Marcus keeps the cereal." },
    { id: "a2_stoop", name: "stoop", r: [108, 140, 120, 46], z: 18, walk: [236, 204, "left"], look: "A brownstone stoop. Fourteen steps of stone, one railing and a century of people sitting on them saying \"nothing's open.\"", use: "I could sit. I've got nowhere to be until Friday. Eh. I'm busy.", pickup: "It's a stoop. It's part of the building. It's been stolen once, and they put it back." },
    { id: "a2_bodega", name: "Rosa's Deli Grocery", r: [396, 94, 118, 90], z: 20, walk: [450, 204, "back"], look: "Rosa's Deli Grocery. Open 24 hours, sells everything, has seen everything. A cat naps on the chips. The cat is management.",
      use: "I've got a few bucks. Rosa's has a $4 minimum for cards and a $0 minimum for judgment.", talk: "The guy at the counter nods without looking up. In Bed-Stuy, that's a conversation.", pickup: "Stealing from Rosa's is how people lose a decade." },
    { id: "a2_atm", name: "ATM", r: [522, 116, 44, 76], z: 40, walk: [544, 204, "back"],
      look: "A bodega ATM. \"NO FEE*.\" Underneath, in tiny print: \"*SEE FEE.\" It has seen things. It has charged for them.",
      use: S => useAtm(S), open: "It opens for the guy with the key. The guy with the key is the guy who owns the key.", push: "Kicking an ATM never gives money. It gives a court date.", talk: "The ATM says nothing. It says everything with a surcharge." },
    { id: "a2_bodegadoor", name: "bodega door", r: [576, 90, 52, 96], z: 25, walk: [598, 204, "back"], look: "A steel door with a bell that has a mind of its own. Inside: chopped cheese, lottery tickets and the finest bacon-egg-and-cheese in three zip codes.",
      use: "I'm not buying anything. I'm a plasma donor in training.", open: "It sticks. They want you to commit.", push: "The bell rings. Rosa's cat looks at me. I back away." },
    { id: "a2_subway", name: "subway stairs", r: [292, 180, 74, 62], z: 28, walk: [330, 232, "back"], exit: "travel",
      look: "The subway entrance: green globes, a railing and a smell I can only describe as \"the city's breath.\" Every adventure starts down there. Every bad one ends there.",
      push: "I'd rather not push the stairs. I'd rather ride." },
    { id: "a2_pole", name: "utility pole", r: [238, 88, 52, 66], z: 26, walk: [270, 206, "back"],
      look: "A pole covered in flyers. \"DONATE PLASMA. NEW DONORS $100.\" Next to it, a BASEMENT TAPES flyer, vinyl only. A third says \"NEXT WEEK\" and nothing else. Dante's marketing department.",
      pickup: async S => { if (S.f.a2_flyerGot) return "I already took a Basement Tapes flyer. One flyer's a dream. Two's a stalker."; S.f.a2_flyerGot = true; RP.give("a2_flyer"); RP.unlock("a2_loc_plasma"); await RP.say("I peel off the Basement Tapes flyer. And write down where LifeDrop is. Atlantic Avenue."); },
      use: "I can't use a pole. I can read it. I just did, and I feel worse.", push: "It's more stable than my career." },
    { id: "a2_lamp", name: "streetlamp", r: [366, 86, 40, 124], z: 22, walk: [376, 208, "back"], look: S => dark(S) ? "The sodium lamp buzzes orange. Every moth in Brooklyn is having a meeting under it." : "A streetlamp. Off. It's working harder at night, like me.", use: "I'd climb it for a better view, but I'd fall off and sue the city. And I'd lose.", pickup: "The city owns it. The city also owns me, indirectly." },
    { id: "a2_hydrant", name: "hydrant", r: [30, 188, 24, 24], z: 22, walk: [46, 214, "back"], look: "A fire hydrant. Painted red a long time ago and mostly by pigeons since.", use: "Open a hydrant in October? I'm broke, not suicidal.", pickup: "It's a hydrant. It's been there since Koch." },
    { id: "a2_mailbox", name: "mailbox", r: [68, 182, 24, 36], z: 22, walk: [80, 214, "back"], look: "A blue mailbox. Last pickup 5 PM. That's the only thing in Bed-Stuy that's on time.", open: "It's got a lock. And a federal agent. And a sticker of a cat.", use: "Mail what? I haven't got a stamp, a friend or an address." },
    { id: "a2_trash", name: "trash bags", r: [230, 182, 48, 36], z: 22, walk: [250, 208, "back"], look: "Black bags stacked like a modern sculpture. Titled: \"Tuesday.\"", pickup: "I'm not that desperate. Yet. Ask me Thursday.", use: "No.", open: "I've been in worse places for worse reasons. Not today." },
    { id: "a2_news", name: "newspaper box", r: [392, 188, 22, 34], z: 22, walk: [404, 214, "back"], look: "A newspaper box with no newspapers. Just a coupon for a gym and a sticker: \"WE'RE ALL BEING WATCHED.\"", use: "Empty. Like every other box in my life.", pickup: "It's bolted to the sidewalk. Everyone's bolted down except me." },
    { id: "a2_bike", name: "bike", r: [454, 184, 54, 34], z: 22, walk: [470, 214, "back"], look: "A bike locked up with a chain that costs more than the bike. The seat's gone. Someone took the seat and left the bike. A statement.", use: "No seat? That's called a unicycle with extra steps.", pickup: "It's locked. And it has no seat. It has no future." },
    { id: "a2_car", name: "parked car", r: [68, 204, 126, 44], z: 24, walk: [128, 250, "back"], look: "A sedan wearing a parking ticket like a medal. It's been here since the Obama administration. It won't be moving.", use: "I'm a DJ, not a car thief. I can't even afford the gas to steal one.", open: "Locked. And it smells like a decade of French fries.", push: "It doesn't budge. Neither does the ticket." },
    { id: "a2_gap", name: "skyline", r: [238, 60, 140, 118], z: 8, look: S => dark(S) ? "Between the buildings: the Manhattan skyline, glowing like a promise. A promise I've read the fine print on." : "A slice of the Manhattan skyline between two buildings. Everybody's rich over there. Allegedly.", walk: [300, 206, "back"], use: "I can't use the skyline. It uses me." },
    { id: "a2_pearl", name: "Mrs. Pearl", z: 80, look: "Mrs. Pearl, 81, in her good cardigan and her better opinions. She's got a folding chair and the best seat in the house.", talk: S => talkPearl(S),
      give: async (S, item) => { if (item === "a2_card") return ["@a2_pearl Honey, put that away. Cards are for people who didn't earn them."]; return ["@a2_pearl I'm not taking anything from you. You're thin."]; } }
  ],
  combos: [
    ["a2_card", "a2_atm", S => useAtm(RP.state)],
    ["a2_card", "a2_bodega", "Rosa's doesn't take cards under $10. This card's got a $100 in it, and a conscience."],
    ["a2_card", "a2_pearl", "Mrs. Pearl peers at the card. \"Platinum? No? Oh, honey. Go on. Spend it.\""],
    ["phone", "a2_pole", "I could text the number on the flyer, but the number is \"NEXT WEEK.\""],
    ["a2_flyer", "a2_pole", "I'd tape it back up, but that's littering with extra steps."],
    ["usb_cat", "a2_atm", "The ATM has a USB port. The ATM would love the cat photos. That's how they get you."]
  ]
});
})();
