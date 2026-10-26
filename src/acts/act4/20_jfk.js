/* Act 4 — a4_jfk: JFK Terminal 4 (check-in, forms rack, vending machine, exits to Baggage Services / Security).
   Flags: a4_checkedPass a4_bagChecked a4_msgBag a4_formGot a4_jerky a4_beltT a4_firstJfk */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u, PK = RP.PK, A4 = RP.a4;
const { R, P, ell, poly, line, txt, txtW, bayer, mulberry, mk, mix } = U;
const W = 640;

const sprCounter = A4.spr(176, 52, c => PK.counter(c, 2, 2, 172, 48, { top: "#d6d8e6", front: "#2f3a5a", panelW: 28 }));
const sprForms = A4.spr(46, 64, c => {
  R(c, 4, 6, 38, 52, "#8a8ca0"); R(c, 4, 6, 38, 2, "#c8cadc"); R(c, 4, 56, 38, 3, "#4a4c60"); R(c, 6, 59, 4, 5, "#4a4c60"); R(c, 36, 59, 4, 5, "#4a4c60");
  txt(c, "FORMS", 12, 10, "#17131f");
  [["7A", "#8aa8d8"], ["7B", "#efe6d0"], ["7C", "#d8a8a8"], ["7D", "#a8d8a8"]].forEach(([t, col], i) => { R(c, 7, 18 + i * 9, 32, 8, "#5a5c70"); R(c, 8, 19 + i * 9, 30, 6, col); txt(c, t, 10, 19 + i * 9, "#2a2030"); R(c, 22, 20 + i * 9, 14, 1, "#8a8aa0"); R(c, 22, 22 + i * 9, 10, 1, "#8a8aa0"); });
});
const sprCart = A4.spr(34, 40, c => {
  for (let i = 0; i < 6; i++) R(c, 4 + i * 4, 6, 1, 24, "#c8cadc"); R(c, 2, 6, 30, 2, "#9a9cb0"); R(c, 2, 30, 30, 2, "#9a9cb0"); R(c, 2, 6, 2, 26, "#c8cadc"); R(c, 30, 6, 2, 26, "#9a9cb0");
  R(c, 28, 0, 3, 8, "#5a5c70"); R(c, 24, 0, 8, 2, "#5a5c70"); ell(c, 8, 36, 2, 2, "#17131f"); ell(c, 26, 36, 2, 2, "#17131f");
  R(c, 3, 33, 28, 1, "#6a6c80"); txt(c, "$7", 12, 14, "#c0302c");
});
const sprPlantJfk = A4.spr(54, 52, c => PK.plant(c, 2, 2, { size: 2, seed: 9 }));
const sprBin = A4.spr(24, 34, c => PK.trashCan(c, 2, 4, { color: "#6a6c80" }));

/* ------------------------------------------------------------------ paint */
function planeTail(c, x, y) {
  // a parked widebody seen through the glass: tail fin, rear fuselage, engine
  poly(c, [[x + 38, y - 66], [x + 62, y - 66], [x + 92, y + 6], [x + 20, y + 6]], "#e8e4f4"); poly(c, [[x + 44, y - 62], [x + 60, y - 62], [x + 86, y + 4], [x + 38, y + 4]], "#fafaff");
  poly(c, [[x + 56, y - 64], [x + 62, y - 64], [x + 92, y + 6], [x + 78, y + 6]], "#b8b4cc");
  ell(c, x + 58, y - 30, 11, 11, "#1a3a8a"); ell(c, x + 58, y - 30, 8, 8, "#2f62b8"); R(c, x + 53, y - 33, 11, 2, "#ffd23f"); R(c, x + 51, y - 28, 14, 2, "#ffd23f"); R(c, x + 55, y - 24, 6, 1, "#ffd23f");
  R(c, x - 70, y - 4, 150, 28, "#eae6f6"); R(c, x - 70, y - 4, 150, 3, "#ffffff"); R(c, x - 70, y + 20, 150, 4, "#b8b4cc"); R(c, x - 70, y + 14, 150, 2, "#1a3a8a");
  for (let i = 0; i < 9; i++) ell(c, x - 56 + i * 12, y + 6, 2, 2, "#3a4a7a");
  ell(c, x - 100, y + 14, 22, 12, "#cfcade"); R(c, x - 122, y + 6, 22, 14, "#cfcade");
}
function paint(c, S) {
  const em = []; const E = a => { if (a && a.length) for (const r of a) em.push(r); return a; };
  // upper wall and ceiling
  PK.plaster(c, 0, 0, W, 156, { base: "#8e8ca8", seed: 8, patches: 0, stains: 1, cracks: 0 });
  for (let x = 40; x < W; x += 58) { R(c, x, 0, 1, 156, "#7a789a"); R(c, x + 1, 0, 1, 156, "#a8a6c4"); }
  PK.gradV(c, 0, 0, W, 18, ["#1c1a28", "#2c2a3e", "#5a587a"], { dither: 1 });
  for (let x = 0; x < W; x += 70) { R(c, x, 0, 3, 20, "#2a283a"); R(c, x + 1, 0, 1, 20, "#5a587a"); }
  [100, 240, 380, 520].forEach(x => E(PK.fluorescent(c, x, 12, 76, { on: true })));
  // glass wall with the apron, a parked plane and a baggage tractor
  PK.sky(c, 330, 22, 310, 128, { time: "dawn", seed: 5, clouds: 3, sun: { x: 590, y: 126, r: 7 } });
  R(c, 330, 118, 310, 32, "#3a3648"); PK.gradV(c, 330, 118, 310, 32, ["#4a4660", "#2e2a3c"], { dither: 1 }); R(c, 330, 118, 310, 1, "#6a6688");
  for (let x = 340; x < 640; x += 34) R(c, x, 134, 18, 1, "#e8c020"); for (let x = 332; x < 640; x += 42) R(c, x, 144, 2, 4, "#ffcf7a");
  planeTail(c, 548, 112);
  for (let x = 330; x < 640; x += 62) { PK.util.cylV(c, x, 22, 5, 128, "#6a6888"); }
  R(c, 330, 22, 310, 3, "#3a384e"); R(c, 330, 21, 310, 1, "#8a88a8"); R(c, 330, 98, 310, 2, "#3a384e"); R(c, 330, 99, 310, 1, "#7a789a");
  PK.util.dshade(c, 332, 24, 308, 124, "#ffffff", (px, py) => (((px - 332) * 0.8 + (py - 24) + 2000) % 90 < 6 ? 1 : 0), 0.10);
  // floor
  PK.tiles(c, 0, 152, W, 104, { a: "#d4d2e2", b: "#bcbace", grout: "#8c8aa4", size: 62, checker: true, horizonY: 96, seed: 2 });
  PK.util.dshade(c, 330, 154, 310, 40, "#ffb080", (px, py) => 1 - (py - 154) / 40, 0.22);
  R(c, 0, 148, W, 5, "#4a4860"); R(c, 0, 148, W, 1, "#8a88a8"); R(c, 0, 152, W, 1, "#2a283a");
  // baggage services door (left)
  R(c, 2, 76, 46, 76, "#1c1a28"); R(c, 4, 78, 42, 72, "#3a5a7a"); PK.gradV(c, 4, 78, 42, 72, ["#8ab8d8", "#4a7a9a"], { dither: 1 });
  R(c, 24, 78, 2, 72, "#1c1a28"); R(c, 4, 112, 42, 2, "#1c1a28"); R(c, 20, 110, 2, 12, "#c8c4d8"); R(c, 28, 110, 2, 12, "#c8c4d8");
  PK.util.dshade(c, 4, 78, 42, 72, "#ffffff", (px, py) => (((px - 4) + (py - 78) + 400) % 30 < 5 ? 1 : 0), 0.22);
  E(A4.hangSign(c, 4, 56, 80, "BAGGAGE SERVICES", { arrow: "<", h: 14 }));
  // check-in: logo sign, desk back, screens, belt to the flap
  R(c, 92, 28, 188, 42, "#101a3a"); R(c, 92, 28, 188, 1, "#3a4a8a"); R(c, 92, 69, 188, 1, "#050a1a");
  R(c, 100, 36, 4, 24, "#2f62b8"); poly(c, [[100, 36], [118, 48], [100, 60]], "#2f62b8"); poly(c, [[104, 40], [114, 48], [104, 56]], "#ffd23f");
  txt(c, "TRANSATLANTIS", 122, 38, "#efeaf6", 2, 1); txt(c, "WE GET YOU THERE. EVENTUALLY.", 122, 54, "#9fb0ff"); em.push([92, 28, 188, 42]);
  for (let x = 94; x < 280; x += 62) { R(c, x, 78, 56, 28, "#2a2c40"); R(c, x + 2, 80, 52, 22, "#0a2a3a"); R(c, x + 4, 83, 30, 2, "#39d0ff"); R(c, x + 4, 87, 20, 1, "#6a8ad8"); R(c, x + 4, 91, 36, 1, "#ffb030"); em.push([x + 2, 80, 52, 22]); }
  R(c, 100, 108, 164, 40, "#2a2c40");
  R(c, 54, 112, 28, 38, "#0a080e"); for (let y = 114; y < 148; y += 3) R(c, 56, y, 24, 2, y % 6 ? "#1a1824" : "#2a2838"); R(c, 52, 110, 32, 3, "#6a6c80"); R(c, 52, 110, 32, 1, "#c8cadc");
  txt(c, "BAG DROP", 54, 100, "#ffd23f"); R(c, 56, 108, 24, 1, "#c0302c");
  R(c, 84, 143, 20, 6, "#14121a"); for (let x = 84; x < 104; x += 3) R(c, x, 144, 1, 4, "#3a384a");
  // departures board (hangs in front of the glass)
  E(PK.departuresBoard(c, 292, 14, 240, 72, { title: "DEPARTURES", seed: 11 }));
  const bx = 292, by = 14, bw = 240, ry = by + 10 + 10 + 7;   // row 1
  const cols = [0.0, 0.17, 0.52, 0.68, 0.78].map(f => bx + 5 + Math.round(f * (bw - 10)));
  R(c, bx + 3, ry - 1, bw - 6, 8, "#14306a");
  txt(c, "08:55", cols[0], ry, "#ffd23f"); txt(c, "BERLIN", cols[1], ry, "#ffffff"); txt(c, "TA718", cols[2], ry, "#ffffff"); txt(c, "B22", cols[3], ry, "#ffd23f"); txt(c, "ON TIME", cols[4], ry, "#5cff9a");
  R(c, 296, 6, 1, 8, "#2a2838"); R(c, 527, 6, 1, 8, "#2a2838");
  // pillar ad
  R(c, 290, 96, 36, 52, "#2a2c40"); R(c, 292, 98, 32, 40, "#c8325a"); txt(c, "NEW", 300, 102, "#ffffff"); txt(c, "YORK", 298, 110, "#ffd23f"); txt(c, "NOW", 300, 120, "#ffffff"); txt(c, "LEAVE", 296, 128, "#ffffff");
  R(c, 292, 138, 32, 8, "#f4f0e4"); txt(c, "TOURS $9", 294, 140, "#c0302c");
  // seats, vending machine, coffee kiosk
  PK.airportSeats(c, 396, 154, 144, { color: "#35508a" });
  E(PK.vendingMachine(c, 548, 86, { w: 44, h: 70, sign: "SNAX", color: "#2f62b8" }));
  // coffee kiosk
  R(c, 598, 108, 40, 46, "#4a2e22"); R(c, 598, 108, 40, 2, "#8a5a3a"); R(c, 600, 122, 36, 28, "#2a1c18"); R(c, 600, 122, 36, 2, "#c8925a");
  PK.awning(c, 596, 100, 44, { colors: ["#2a7a4a", "#efe8d8"], h: 16, stripe: 6 });
  txt(c, "$9", 612, 130, "#ffd23f"); R(c, 606, 138, 10, 8, "#efe6d0"); R(c, 618, 138, 8, 8, "#c8a070");
  E(A4.hangSign(c, 588, 54, 52, "GATES", { arrow: ">", h: 14 }));
  // baseboard and shine
  PK.baseboard(c, 0, 146, W, { h: 3, color: "#4a4860" });
  return em;
}

let cartX = 0;
function draw(c, S, t) {
  // baggage train crawling along the apron beyond the glass
  const x = 340 + ((t / 55) % 340) - 60;
  R(c, x, 128, 14, 7, "#e8c020"); R(c, x + 2, 124, 8, 4, "#c8a010"); ell(c, x + 3, 136, 2, 2, "#17131f"); ell(c, x + 11, 136, 2, 2, "#17131f");
  for (let i = 1; i <= 3; i++) { const cx = x - i * 17; R(c, cx, 128, 14, 6, "#3a3a4a"); R(c, cx + 1, 124, 6, 4, i % 2 ? "#c0302c" : "#2f62b8"); R(c, cx + 7, 125, 5, 3, "#1d1622"); R(c, cx + 14, 131, 3, 1, "#8a8aa0"); ell(c, cx + 3, 135, 2, 2, "#17131f"); ell(c, cx + 11, 135, 2, 2, "#17131f"); }
  // belt movement and the bag that rides it
  const bt = S.f.a4_beltT;
  if (bt && !S.f.a4_beltDone) {
    const k = Math.min(1, (performance.now() - bt) / 1800);
    const bx = Math.round(122 - k * 58);
    R(c, bx, 130, 24, 14, "#1c1a24"); R(c, bx, 130, 24, 2, "#4a4868"); R(c, bx + 7, 126, 2, 5, "#55516a"); R(c, bx + 15, 126, 2, 5, "#55516a"); R(c, bx + 7, 125, 10, 2, "#8a86a0"); ell(c, bx + 6, 138, 2, 2, "#ff3fa4"); R(c, bx + 11, 134, 6, 3, "#39d0ff");
    if (k >= 1) S.f.a4_beltDone = true;
  }
  // belt rollers shimmer
  for (let i = 0; i < 6; i++) P(c, 86 + ((i * 4 + Math.floor(t / 120)) % 20), 145, "#4a4868");
}

function light(S) {
  return {
    ambient: "#a8a4c6",
    lights: [
      { box: [330, 22, 310, 128], r: 150, color: "#ffb48a", steps: 4, sy: 1.0, power: 0.85 },
      { x: 138, y: 14, r: 150, color: "#e8f0ff", steps: 3, power: 0.55 },
      { x: 278, y: 14, r: 150, color: "#e8f0ff", steps: 3, power: 0.5 },
      { x: 418, y: 40, r: 120, color: "#ffc060", steps: 3, power: 0.45 },
      { x: 558, y: 14, r: 160, color: "#e8f0ff", steps: 3, power: 0.55 }
    ],
    rims: [{ x: 560, y: 80, r: 260, color: "#ffb48a" }], key: { x: 420, y: 40 }, shadow: 0.55
  };
}

/* ------------------------------------------------------------------ check-in */
const tagName = S => A4.misspell(A4.dj(S));
async function checkInPassport(S) {
  if (S.f.a4_checkedPass) return "Dolores already inspected my passport. I could feel my soul being scanned.";
  S.f.a4_checkedPass = true;
  await RP.lines([
    "@a4_dolores Passport.", "@a4_dolores ...Berlin. Round trip. You look like a one-way.", "I'm a round trip with feelings.",
    "@a4_dolores The booking says \"" + tagName(S) + ".\" Passport says " + A4.dj(S) + ". I'll allow it. This once.",
    "@a4_dolores Window seat, 23A. Bring snacks. Your bag?"
  ]);
  RP.give("a4_boarding");
  RP.sfx("typing");
  await RP.say("Got a boarding pass. Seat 23A, a window. I'll be the one pressing my face against it.");
}
async function checkInBag(S) {
  if (!S.f.a4_checkedPass) { await RP.say("Passport first, hon. I can't tag a bag with no person attached.", "a4_dolores"); return; }
  if (S.f.a4_bagChecked) return "She's already got the bag. I could feel it go. Somewhere a conveyor is doing the thing it does.";
  await RP.lines(["@a4_dolores Up on the scale. ...Thirty-eight kilos.", "It's records.", "@a4_dolores It's thirty-eight kilos of records. Limit's twenty-three. Seventy-five dollars."]);
  if (S.money >= 75) { RP.money(-75); await RP.say("Seventy-five dollars. For the privilege of being separated from my career."); }
  else await RP.say("I... can't. I have a record. She sighs and waves me through. \"Because it's seven a.m. on a Saturday.\"", "a4_dolores");
  await RP.lines(["@a4_dolores Berlin. BER. Sticker on, tag on. Claim tag's yours. Don't lose it.", "@a4_dolores Name on the tag: \"" + tagName(S) + ".\" It's how it's always been."]);
  RP.take("a4_bag"); RP.give("a4_claim");
  S.f.a4_bagChecked = true; S.f.noTravel = true; S.f.a4_beltT = performance.now(); S.f.a4_beltDone = false;
  RP.sfx("zip");
  await RP.wait(1900);
  RP.setClock("SAT 7:48 AM");
  await RP.lines(["The bag rides the belt and vanishes behind rubber flaps.", "I feel like I just dropped a kid at a daycare run by strangers."]);
  await RP.say("Will passenger " + tagName(S) + " please report to Baggage Services, Level 1. Passenger " + tagName(S) + ".", "a4_pa");
  RP.text("TRANSATLANTIS", "Bag BER-4471 requires your attention. See Baggage Services, Level 1. Reply STOP to stop. You can't stop.", false);
  S.f.a4_msgBag = true;
  await RP.lines(["Of course. Of course the bag.", "I told Lou \"don't lose the bag\" in my head and now it's a prophecy.", "Baggage Services is the door on the far left. Let's go find out what an airline can do to a record bag."]);
}
async function doloresTalk(S) {
  if (!S.f.a4_checkedPass) { await RP.lines(["Hi. Berlin, please.", "@a4_dolores Passport."]); return; }
  if (!S.f.a4_bagChecked) { await RP.lines(["Do I have a bag?", "@a4_dolores Do you have a bag? You tell me, hon."]); return; }
  if (!S.f.a4_formGot) { await RP.lines(["About my bag--", "@a4_dolores Baggage Services. Far left. I don't do bags after they're gone. I do bags before they're gone."]); return; }
  await RP.lines(["@a4_dolores Still here, hon? Your flight's boarding.", "@a4_dolores Go find your dog. I mean your bag."]);
}

/* ------------------------------------------------------------------ vending */
async function vend(S) {
  if (RP.has("a4_jerky")) { await RP.say("I've got my jerky. The machine and I are even."); return; }
  const i = await RP.choose(["Potato chips ($3)", "Beef jerky ($4)", "Gum ($2)", "Never mind"]);
  if (i === 3) return;
  const price = [3, 4, 2][i];
  if (!RP.canAfford(price)) { await RP.say("I can't afford it. A snack machine just rejected me. At an airport."); return; }
  RP.money(-price); RP.sfx("coin");
  if (i === 1) { RP.give("a4_jerky"); S.f.a4_jerky = true; await RP.lines(["Chewy Wowie jerky. It lands in the tray with a thud, the way a promise does.", "The bag says: \"Now with 22% real jerky.\""]); }
  else if (i === 0) await RP.lines(["I eat the chips in four seconds. They tasted like a loophole.", "That's $3 I'll never see again. The money, I mean."]);
  else await RP.lines(["Gum. It tastes like a pencil. I'm chewing it with confidence."]);
}

/* ------------------------------------------------------------------ the room */
RP.room({
  id: "a4_jfk", act: 4, name: "JFK, Terminal 4",
  paint, draw, light, ambience: "airport", music: null,
  walk: [[8, 206], [200, 202], [596, 202], [630, 250], [8, 250]],
  start: { x: 110, y: 234, face: "right" },
  actors: [
    { id: "a4_dolores", char: "a4_dolores", x: 188, y: 186, face: "front", act: "stand", name: "Dolores", noTurn: true },
    { id: "a4_pax1", char: "a4_pax1", x: 306, y: 214, face: "left", act: "stand", clickable: false },
    { id: "a4_pax2", char: "a4_pax2", x: 330, y: 220, face: "left", act: "stand", clickable: false },
    { id: "a4_pax3", char: "a4_pax3", x: 440, y: 208, face: "back", act: "stand", clickable: false }
  ],
  sprites: [
    { y: 200, draw: c => sprCounter(c, 92, 150) },
    { y: 150, draw: c => sprForms(c, 334, 100) },
    { y: 222, draw: c => A4.wetFloor(c, 372, 212) },
    { y: 200, draw: c => sprPlantJfk(c, 254, 126) },
    { y: 246, draw: c => sprCart(c, 40, 206) },
    { y: 190, draw: c => sprBin(c, 372, 170) }
  ],
  self: { look: "Tour bomber, headphones, a record bag that's about to be weighed and judged. Looking like someone's about to have a very long day.", talk: "I'm talking to myself in an airport. Nobody looks twice. It's the most normal thing here." },
  hotspots: [
    { id: "a4_dolores", name: "Dolores (check-in)", look: "Dolores, TransAtlantis check-in. Name tag, bun, and the quiet authority of someone who's heard every excuse for an overweight bag.",
      talk: S => doloresTalk(S),
      give: async (S, item) => {
        if (item === "a4_passport") return checkInPassport(S);
        if (item === "a4_bag") return checkInBag(S);
        if (item === "a4_boarding") return "She printed it. She's not keeping it. She says \"hon, that's yours.\"";
        if (item === "a4_claim") return "She gave me this. It's my ticket to getting my bag back. I'd better not give it back.";
        await RP.say("That's not a document, hon.", "a4_dolores");
      },
      pickup: "I'm not picking up Dolores. She has a lanyard and a union.", push: "Not the check-in agent. Never the check-in agent." },
    { id: "a4_counter", name: "check-in counter", r: [92, 150, 176, 52], z: 30, walk: [188, 218, "back"],
      look: "TransAtlantis check-in. The motto behind it says \"We Get You There. Eventually.\" At least they're honest.", use: S => doloresTalk(S), pickup: "Not without a forklift and a lawyer.",
      give: async (S, item) => item === "a4_passport" ? checkInPassport(S) : item === "a4_bag" ? checkInBag(S) : "Hand it to Dolores. The counter doesn't have hands." },
    { id: "a4_belt", name: "bag drop belt", r: [52, 108, 52, 44], z: 35, walk: [120, 220, "back"], look: "The bag drop. A black conveyor into a hole lined with rubber flaps. It leads to the airport's inner life. None of it good.", use: "Don't ride it. I saw a guy try once. He works in Baggage Services now.", push: "Pushing it wouldn't make anything faster. That's the whole point of a belt.", pickup: "You can't pick up a conveyor. I've tried with the one at the grocery store." },
    { id: "a4_board", name: "departures board", r: [292, 14, 240, 72], z: 25, walk: [410, 214, "back"],
      look: "BERLIN, TA 718, gate B22, 8:55 AM: ON TIME. Everything else is DELAYED. The board is very honest about its feelings.", use: "It's an electronic board. It doesn't take requests.", pickup: "It's bolted to the ceiling. The ceiling would have things to say." },
    { id: "a4_sign_bag", name: "Baggage Services sign", r: [4, 54, 82, 16], z: 40, walk: [34, 222, "back"], look: "BAGGAGE SERVICES, with an arrow pointing at the door next to it. Subtle." },
    { id: "a4_door_bag", name: "Baggage Services", r: [2, 76, 48, 76], z: 36, walk: [34, 222, "back"],
      look: "Frosted-glass door to Baggage Services. Where bags go to be reunited, or bureaucratized.",
      exit: S => S.f.a4_bagChecked ? { room: "a4_baggage", x: 560, y: 230, face: "left" } : "Why would I go to Baggage Services? I haven't lost anything. Yet." },
    { id: "a4_logo", name: "TransAtlantis sign", r: [92, 28, 188, 42], z: 30, walk: [188, 218, "back"], look: "\"We Get You There. Eventually.\" A branding department's most honest hour." },
    { id: "a4_forms", name: "forms rack", r: [334, 100, 44, 62], z: 45, walk: [356, 218, "back"],
      look: S => S.f.a4_msgBag ? "A rack of forms. 7A: Sorry. 7B: Request for Release of a Detained Item. 7C: Complaint About Form 7B. 7D: Complaint About 7C." : "A rack of airline forms. 7A through 7D. Forms are like cats: they appear when you stop looking.",
      pickup: async S => {
        if (RP.has("a4_form") || S.f.a4_formStamped) return "I've got my Form 7B. The rest are for other crises.";
        if (!S.f.a4_msgBag) return "I don't know which form I'd need. I'll wait until the airline tells me I'm in trouble.";
        S.f.a4_formGot = true; RP.give("a4_form");
        await RP.lines(["7A: Sorry. 7B: Request for Release of a Detained Item. 7C: Complaint About 7B.", "7B, it is. Hopefully the bag's detained, not arrested."]);
      },
      use: S => RP.runH(RP.curRoom().def.hotspots.find(h => h.id === "a4_forms").pickup) },
    { id: "a4_seats", name: "waiting seats", rects: [[396, 152, 146, 44]], z: 20, walk: [470, 212, "back"], look: "Chrome-and-vinyl airport seats. Built to be sat in for forty minutes and cursed afterwards.", use: "If I sit, I'll fall asleep and wake up in Baggage Services. There's a lesson there.", pickup: "Bolted down. Everything here is bolted down, except my bag." },
    { id: "a4_vend", name: "snack machine", r: [548, 86, 44, 72], z: 40, walk: [570, 212, "back"], look: "\"SNAX.\" Chips, gum, and something called Chewy Wowie beef jerky \"now with 22% real jerky.\"", use: S => vend(S), pickup: "It's more bolted than my sanity.", push: "Shaking a vending machine at an airport is how you meet a security officer. Not today." },
    { id: "a4_coffee", name: "coffee kiosk", r: [596, 98, 44, 56], z: 42, walk: [610, 212, "back"], look: "\"BEANS & REGRET.\" A $9 coffee, with a menu that doesn't mention the regret. It's in the price.", use: "Nine dollars for hot water that has met coffee once. No.", talk: "Nobody's there. Even the barista has given up on the barista." },
    { id: "a4_gates", name: "Security & Gates", r: [588, 54, 50, 100], z: 18, walk: [606, 224, "right"],
      look: "The entrance to security, past a stanchion maze built for patience I don't have.",
      exit: S => !RP.has("a4_boarding") ? "Security wants a boarding pass. Check-in first. Dolores is the one with the lanyard." : (!S.f.a4_bagChecked ? "Delgado would arrest this bag on sight. Thirty-eight kilos. Check it first." : { room: "a4_security", x: 80, y: 232, face: "right" }) },
    { id: "a4_window", name: "terminal windows", r: [330, 94, 214, 56], z: 10, walk: [440, 214, "back"], look: "A parked TransAtlantis plane out there, with its tail dreaming of Berlin. A baggage train is crawling past. Mine is not on it. I think.", open: "It's glass. The only openings are for planes and people." },
    { id: "a4_cart", name: "luggage cart", r: [36, 206, 42, 44], z: 60, walk: [88, 238, "left"], look: "Luggage carts, $7 a pop. They want a deposit. I put a $75 bag on a belt and they want $7 for a cart. It's a pyramid scheme.", pickup: "It's got a deposit lock. Seven dollars. For a cart. In 2026.", use: "I don't need a cart. I'm traveling light. Just 38 kilos, a career and a bad feeling." },
    { id: "a4_wet", name: "wet floor sign", r: [370, 210, 22, 26], z: 62, walk: [380, 240, "right"], look: "CAUTION: WET FLOOR. The floor is bone dry. The sign is just worried.", pickup: "I'm not taking the sign. It's the only one here that cares.", use: "Everyone here is slipping already. Metaphorically." },
    { id: "a4_plant", name: "plant", r: [254, 128, 52, 54], z: 38, walk: [280, 222, "back"], look: "A potted plant in an airport. Fake or real, it's the only thing here with roots.", talk: "It's an airport plant. It hears things. It's seen too much." },
    { id: "a4_pillar", name: "NYC ad", r: [288, 96, 40, 54], z: 30, walk: [306, 218, "back"], look: "\"NEW YORK NOW LEAVE.\" It's a tourism ad in reverse. The city has no more love for you." },
    { id: "a4_trash", name: "trash can", r: [370, 170, 28, 36], z: 45, walk: [384, 218, "back"], look: "A trash can in the departures hall. It has a sign: \"No Liquids.\" The cleanup crew didn't read it." },
    { id: "a4_floor", name: "floor", r: [8, 204, 620, 46], z: 5, floor: true, look: "Polished airport tile. People's dreams have been dragged across it." }
  ],
  combos: [
    ["a4_passport", "a4_dolores", S => checkInPassport(RP.state)],
    ["a4_passport", "a4_counter", S => checkInPassport(RP.state)],
    ["a4_bag", "a4_dolores", S => checkInBag(RP.state)],
    ["a4_bag", "a4_counter", S => checkInBag(RP.state)],
    ["a4_bag", "a4_belt", S => checkInBag(RP.state)],
    ["a4_boarding", "a4_dolores", "She printed it. She's not keeping it. \"Hon, that's yours.\""],
    ["a4_claim", "a4_belt", "The bag's gone. I'm giving the claim tag to a belt? Even I'm not that desperate."],
    ["a4_jerky", "a4_dolores", "She'd take it as a bribe. Dolores doesn't bend; she reports."],
    ["a4_form", "a4_dolores", "She doesn't stamp anything. She does bags before they're gone. Baggage Services does the rest."],
    ["a4_jerky", "a4_vend", "I already bought it. Putting it back is not how vending machines work."],
    ["a4_white", "a4_dolores", "A white label is not a document. But it IS my identity."]
  ],
  enter: async (S, from) => {
    if (!S.f.a4_firstJfk) {
      S.f.a4_firstJfk = true; RP.setClock("SAT 7:05 AM");
      await RP.lines(["JFK, Terminal 4, seven a.m. Saturday. It smells like stress, floor wax and cinnamon.", "Check-in's on the left. Dolores is waiting. Bag, passport. The plan is simple. That's how you know it won't go to plan."]);
    }
  }
});
})();
