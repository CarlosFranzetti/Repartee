/* Act 4 — a4_plane: TransAtlantis 718, JFK -> Berlin. Window seat 23A. The overhead bin is full and the flight
   attendant wants your record bag in the hold — which, after JFK, is not happening. Kosmo has an empty seat.
   Flags: a4_kosmoBag a4_flown a4_planeIntro a4_faTalked */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u, PK = RP.PK, A4 = RP.a4;
const { R, P, ell, poly, line, txt, mulberry, mix } = U;
const W = 640;

const SEAT = "#2f4a7a";
/* front-facing seats along the cabin wall (people sit facing us): backrest, headrest, armrests, cushion, legs */
function seat(c, x, y, col, o) {
  o = o || {};
  const k = U.ramp(col);
  R(c, x + 8, y, 44, 62, col); R(c, x + 8, y, 44, 2, k[4]); R(c, x + 8, y, 2, 62, k[3]); R(c, x + 50, y, 2, 62, k[0]);
  R(c, x + 6, y + 6, 4, 54, k[1]); R(c, x + 50, y + 6, 4, 54, k[0]);
  R(c, x + 14, y - 8, 32, 14, k[3]); R(c, x + 14, y - 8, 32, 2, k[4]); R(c, x + 14, y + 4, 32, 2, k[1]); R(c, x + 12, y - 4, 2, 10, k[2]); R(c, x + 46, y - 4, 2, 10, k[1]);
  R(c, x + 4, y + 44, 8, 22, "#3a384e"); R(c, x + 4, y + 44, 8, 2, "#8a88a8"); R(c, x + 48, y + 44, 8, 22, "#3a384e"); R(c, x + 48, y + 44, 8, 2, "#8a88a8");
  R(c, x + 6, y + 62, 48, 8, col); R(c, x + 6, y + 62, 48, 2, k[4]); R(c, x + 6, y + 68, 48, 2, k[0]);
  R(c, x + 12, y + 70, 5, 14, "#6a667c"); R(c, x + 43, y + 70, 5, 14, "#6a667c"); R(c, x + 8, y + 82, 12, 2, "#3a384e"); R(c, x + 40, y + 82, 12, 2, "#3a384e");
  PK.util.groundShadow(c, x + 30, y + 86, 26, 2, 0.4);
  if (o.tag) { R(c, x + 22, y + 14, 16, 5, "#efeaf6"); txt(c, o.tag, x + 25, y + 15, "#c0302c"); }
}
const sprSeat = A4.spr(64, 96, c => seat(c, 2, 10, SEAT));
const sprSeatKosmo = A4.spr(64, 96, c => seat(c, 2, 10, "#7a2a3a"));
const sprSeatMine = A4.spr(64, 96, c => seat(c, 2, 10, SEAT, { tag: "23A" }));
const sprBagOnSeat = A4.spr(34, 26, c => {
  R(c, 3, 6, 28, 18, "#1c1a24"); R(c, 3, 6, 28, 2, "#4a4868"); R(c, 3, 22, 28, 2, "#0a080e"); R(c, 3, 6, 2, 18, "#55516a"); R(c, 29, 6, 2, 18, "#55516a");
  R(c, 9, 2, 3, 5, "#55516a"); R(c, 22, 2, 3, 5, "#55516a"); R(c, 9, 1, 16, 2, "#8a86a0"); ell(c, 10, 15, 3, 3, "#ff3fa4"); R(c, 16, 11, 9, 4, "#39d0ff"); R(c, 14, 18, 8, 3, "#ffd23f");
});
const sprCart = A4.spr(60, 60, c => {
  R(c, 4, 4, 52, 50, "#c8ccd8"); R(c, 4, 4, 52, 2, "#ffffff"); R(c, 4, 52, 52, 2, "#6a6e84"); R(c, 4, 4, 2, 50, "#e8ecf8"); R(c, 54, 4, 2, 50, "#6a6e84");
  for (let y = 12; y < 50; y += 8) { R(c, 8, y, 44, 6, "#9aa0b8"); R(c, 8, y, 44, 1, "#e8ecf8"); }
  R(c, 10, 14, 12, 4, "#c0302c"); R(c, 26, 14, 10, 4, "#2f62b8"); R(c, 40, 14, 8, 4, "#ffd23f"); R(c, 12, 22, 18, 4, "#efeaf6"); R(c, 34, 22, 14, 4, "#c8925a");
  R(c, 6, 0, 50, 5, "#9aa0b8"); R(c, 6, 0, 50, 1, "#e8ecf8"); R(c, 14, 54, 4, 4, "#17131f"); R(c, 42, 54, 4, 4, "#17131f");
  R(c, 20, 40, 20, 8, "#2a2838"); txt(c, "TA", 26, 42, "#ffd23f");
});
const wins = [74, 164, 254, 344, 434, 524];

/* ------------------------------------------------------------------ paint */
function paint(c, S) {
  const em = []; const E = a => { if (a && a.length) for (const r of a) em.push(r); return a; };
  // cabin wall: cream upper panel, darker lower panel, ceiling curve
  R(c, 0, 0, W, 256, "#cbc2b2"); PK.gradV(c, 0, 0, W, 256, ["#d8cfbf", "#cbc2b2", "#a8a0b0"], { dither: 1 });
  PK.speckle(c, 0, 56, W, 110, ["#d8cfbf", "#b8b0a2"], 0.03, 5);
  R(c, 0, 150, W, 70, "#8a8298"); PK.gradV(c, 0, 150, W, 70, ["#9a92a8", "#6a6480"], { dither: 1 });
  R(c, 0, 150, W, 2, "#b8b0c4"); R(c, 0, 151, W, 1, "#e8e0f0"); R(c, 0, 218, W, 4, "#3a3650"); R(c, 0, 218, W, 1, "#6a668a");
  // overhead bins: long rounded panel with service strips
  R(c, 0, 8, W, 50, "#e8e2d4"); R(c, 0, 8, W, 2, "#ffffff"); R(c, 0, 55, W, 3, "#8a8296"); R(c, 0, 52, W, 3, "#b8b0c0");
  PK.gradV(c, 0, 10, W, 42, ["#f0ead8", "#e0d8c8", "#c8c0b4"], { dither: 1 });
  for (let x = 90; x < W; x += 90) { R(c, x, 10, 2, 44, "#a8a094"); R(c, x + 2, 10, 1, 44, "#f8f4e8"); }
  for (let x = 20; x < W; x += 90) { R(c, x, 40, 34, 4, "#c8c0b4"); R(c, x, 40, 34, 1, "#fff8ec"); R(c, x, 43, 34, 1, "#8a8296"); }
  // service strip under the bins: reading lights, call buttons, seat-belt signs
  R(c, 0, 58, W, 10, "#2a2838"); R(c, 0, 58, W, 1, "#5a587a");
  for (let x = 40; x < W; x += 90) { ell(c, x, 63, 2, 2, "#ffe8b0"); em.push([x - 2, 61, 5, 5]); R(c, x + 12, 61, 4, 4, "#39d0ff"); R(c, x + 20, 61, 6, 4, "#ffd23f"); PK.glow(c, x, 63, 8, "#ffe8b0", { strength: 0.6 }); }
  R(c, 300, 60, 40, 6, "#0a2a3a"); txt(c, "FASTEN", 304, 61, "#5cff9a"); em.push([300, 60, 40, 6]);
  // windows aligned behind each seat row (night sky and wing)
  const nt = !!S.f.a4_flown;
  wins.forEach((x, i) => E(PK.planeWindow(c, x, 76, { view: i === 4 ? (nt ? "night" : "wing") : (nt ? "night" : (i % 2 ? "runway" : "clouds")), seed: i * 7, shade: i === 0 ? 0.4 : 0 })));
  // floor
  R(c, 0, 222, W, 34, "#1f3a4a"); PK.carpet(c, 0, 222, W, 34, { pattern: "stripes", base: "#26455a", seed: 3 });
  R(c, 0, 222, W, 2, "#14202c");
  PK.gradV(c, 0, 222, W, 34, ["#2a4a5e", "#162a38"], { dither: 1 });
  for (let x = 6; x < W; x += 22) { R(c, x, 232, 10, 1, "#c8c0b4"); R(c, x + 4, 246, 8, 1, "#c8c0b4"); }
  // exit door (left, where you board)
  R(c, 4, 70, 44, 148, "#8a8298"); R(c, 6, 72, 40, 144, "#b8b0c4"); R(c, 12, 80, 28, 50, "#2a4a6a"); PK.gradV(c, 12, 80, 28, 50, ["#6a98c8", "#2a4a7a"], { dither: 1 }); R(c, 10, 134, 32, 3, "#6a6480"); R(c, 36, 150, 4, 14, "#c8c0d8"); txt(c, "EXIT", 14, 64, "#5cff9a"); em.push([12, 62, 18, 7]);
  // seatback pockets etc handled in sprites
  return em;
}
let tvT = 0;
function draw(c, S, t) {
  // night motion through the windows: slow lights drifting by
  if (S.f.a4_flown) wins.forEach((x, i) => { const bx = x + 5 + ((t / 90 + i * 40) % 18), by = 76 + 28 + ((i * 5) % 7); P(c, bx % (x + 23) < x + 5 ? x + 5 : bx, by, "#ffd27a"); });
  // wing light blinking on the right window
  if (Math.floor(t / 700) % 2) { R(c, 434 + 21, 76 + 14, 2, 2, "#ff3a3a"); }
}
function light(S) {
  return {
    ambient: "#8a8aa8",
    lights: [
      { x: 90, y: 64, r: 150, color: "#ffe8b0", steps: 3, power: 0.45 }, { x: 330, y: 64, r: 190, color: "#e0e8ff", steps: 3, power: 0.45 },
      { x: 520, y: 64, r: 160, color: "#ffe8b0", steps: 3, power: 0.4 },
      { x: 90, y: 110, r: 60, color: "#4a6ac8", steps: 3, power: 0.45 }, { x: 330, y: 110, r: 60, color: "#4a6ac8", steps: 3, power: 0.45 }, { x: 510, y: 110, r: 60, color: "#4a6ac8", steps: 3, power: 0.45 }
    ],
    rims: [{ x: 330, y: 80, r: 300, color: "#6a8ae8" }], key: { x: 330, y: 62 }, shadow: 0.5
  };
}

/* ------------------------------------------------------------------ the flight attendant */
async function faTalk(S) {
  if (S.f.a4_kosmoBag) { await RP.lines(["@a4_marguerite Seat 23A, sir. Seatbelt, tray table, seat back. In that order.", "@a4_marguerite And thank you for putting your bag with your... friend. I didn't see anything."]); return; }
  S.f.a4_faTalked = true;
  if (RP.has("a4_bag")) {
    await RP.lines(["@a4_marguerite Sir, that bag doesn't fit in the bin. It'll have to go in the hold.", "No. It goes nowhere I can't see. We've had a day.", "@a4_marguerite It weighs as much as a Labrador.", "It's an instrument. A heavy instrument.", "@a4_marguerite Then find it a seat that isn't in the aisle. You've got five minutes."]);
    await RP.say("Somewhere in here, there's an empty seat. Somebody has an empty seat. People with money always do.");
    return;
  }
  await RP.lines(["@a4_marguerite Welcome aboard. Your seat's 23A.", "My bag...", "@a4_marguerite You don't have a bag, sir.", "I do. It's... somewhere."]);
}
async function kosmoTalk(S) {
  if (S.f.a4_kosmoBag) { await RP.lines(["@a4_kosmo (muffled) Brenton. Your bag is perfectly fine. It's asleep, like me.", "Please don't wake it."]); return; }
  await RP.lines(["Kosmo? Kosmo Delacroix?", "(He lifts a silk eye mask. It's embroidered with his own initials.)", "@a4_kosmo Hm? Ah. Young... Brenton. Isn't it?", "It's " + A4.dj(S) + ".", "@a4_kosmo Of course it is, Brenton."]);
  await RP.convo([
    { text: "Can I put my bag on the empty seat?", when: S => RP.has("a4_bag"), run: async () => {
      await RP.lines(["@a4_kosmo The empty seat. Beside me. Yes, that's mine. I purchased it. Seats beside me are a luxury I invented.", "It's thirty-eight kilos of records.", "@a4_kosmo ...Records. Real ones? What's in there?",
        "Basic Channel. Ben Klock. Some Chicago. A little Detroit.", "@a4_kosmo ...Place it. Gently. Brenton: gently."]);
      await giveBag(S);
    } },
    { text: "Great set at the Halcyon, Kosmo.", when: S => !S.f.a4_kosmoPraise, run: async () => { S.f.a4_kosmoPraise = true; await RP.lines(["@a4_kosmo Of course it was. I remember it fondly. It was... last week? A basement? A large place. With... acoustics.", "Six months ago. I played after you.", "@a4_kosmo Yes. That. Wonderful people. Who are you, again?"]); } },
    { text: "Where are you headed?", run: () => RP.lines(["@a4_kosmo Berlin. They hold me in a different kind of reverence there. They're mostly quiet about it.", "@a4_kosmo And you, Brenton? What brings you?", "A booking. Halle Neun.", "@a4_kosmo (pause) I... don't know it. How lovely."]) },
    { text: "Never mind. Sleep well.", end: true }
  ]);
}
async function giveBag(S) {
  if (!RP.has("a4_bag")) return;
  await RP.walkTo(178, 232, "back");
  RP.take("a4_bag"); S.f.a4_kosmoBag = true;
  RP.sfx("drop");
  await RP.lines(["I place the bag on the empty seat. It sits there like a very quiet passenger.", "@a4_marguerite (passing) Is that bag... strapped in?", "It's got a seatbelt. It's a fragile instrument.", "@a4_marguerite ...Fine. 23A, sir."]);
}
async function takeSeat(S) {
  if (!RP.has("a4_bag") && !S.f.a4_kosmoBag) { await RP.say("Without the bag? No. Without the bag, I'm not even sure this is my seat."); return; }
  if (RP.has("a4_bag")) { await RP.lines(["I sit with the bag on my lap.", "@a4_marguerite Sir. The bag.", "It's on my lap.", "@a4_marguerite It doesn't fit under the seat. It doesn't fit anywhere. It goes in the hold or on a seat.", "A seat. I need a seat. Wait. Kosmo's got a free one."]); return; }
  await RP.walkTo(358, 226, "back");
  RP.place("kid", 358, 196, "front"); RP.actor("kid").act = "sit";
  S.f.a4_flown = true;
  await RP.say("23A. Window. A tiny oval of morning with a wing in it. I could cry. Or sleep. Probably both.");
  await RP.fadeTo(1, 700);
  RP.setClock("SAT 11:52 PM");
  await RP.say("Many hours, one chicken-or-pasta and a stranger's elbow later.", "nar");
  await RP.fadeTo(0, 700);
  await RP.lines(["@a4_pilot Ladies and gentlemen, this is your captain. Welcome to Berlin. Local time is eleven fifty-two p.m.",
    "@a4_pilot We're an hour late. We circled for an hour. A beagle was involved. I'm told. I don't know.",
    "I keep doing the math. Landed 11:52. Gate by midnight. Passport control. The airport train.",
    "The last airport train leaves at 12:07. And my set at Halle Neun is at two."]);
  RP.actor("kid").act = "stand"; RP.place("kid", 330, 228, "front");
  RP.say("@a4_pa Doors to manual. Please remain seated. Please don't take pictures of the pilot.".replace("@a4_pa ", ""), "a4_pa");
  await RP.wait(400);
  await RP.lines(["@a4_kosmo (waking) Brenton? Is this Berlin?", "It's Berlin.", "@a4_kosmo How... disappointing. Here. Your records. They were very well-behaved.", "(He hands me the bag like it's a baby he's relieved to return.)",
    "@a4_kosmo Goodbye, Brenton. Do play something... loud. They like that."]);
  RP.give("a4_bag");
  await RP.fadeTo(1, 500);
  RP.setClock("SAT 11:57 PM");
  S.f.a4_landed = true;
  await RP.goto("a4_ber_platform", 52, 232, "right");
}

/* ------------------------------------------------------------------ the room */
RP.room({
  id: "a4_plane", act: 4, name: "TransAtlantis 718",
  paint, draw, light, ambience: "airport", music: null, cacheKey: S => (S.f.a4_flown ? "n" : "d"),
  walk: [[8, 226], [630, 226], [630, 250], [8, 250]],
  start: { x: 70, y: 232, face: "right" },
  actors: [
    { id: "a4_marguerite", char: "a4_marguerite", x: 120, y: 232, face: "right", act: "stand", name: "Marguerite" },
    { id: "a4_kosmo", char: "kosmo", x: 268, y: 196, face: "front", act: "sit", name: "Kosmo Delacroix" },
    { id: "a4_pax2", char: "a4_pax2", x: 88, y: 196, face: "front", act: "sit", clickable: false },
    { id: "a4_stag2", char: "a4_stag2", x: 538, y: 196, face: "front", act: "sit", name: "snoring passenger" }
  ],
  sprites: [
    { y: 196, draw: c => sprSeat(c, 56, 108) },
    { y: 196, draw: c => sprSeat(c, 146, 108) },
    { y: 196, draw: c => sprSeatKosmo(c, 236, 108) },
    { y: 196, draw: c => sprSeatMine(c, 326, 108) },
    { y: 196, draw: c => sprSeat(c, 416, 108) },
    { y: 196, draw: c => sprSeat(c, 506, 108) },
    { y: 199, vis: S => !!S.f.a4_kosmoBag, draw: c => sprBagOnSeat(c, 163, 158) },
    { y: 236, draw: c => sprCart(c, 560, 192) }
  ],
  self: { look: "Tour bomber, headphones, a plane ticket and a slightly alarming smell of airport. The seat-back screen says it can see my soul.", talk: "I'd talk to myself, but I'm trying not to look like I'm already asleep." },
  hotspots: [
    { id: "a4_marguerite", name: "Marguerite (flight attendant)", look: "Marguerite, flight attendant. Neat bun, TransAtlantis scarf, the calm of someone who's seen a man cry into a pretzel.", talk: S => faTalk(S),
      give: (S, item) => item === "a4_bag" ? "She'd put it in the hold. And I'd put myself in the hold to follow it." : "She's got enough forms already.", pickup: "I'd be arrested. And then ten more forms.", push: "She's carrying the whole trip on her shoulders. I'm not adding a push." },
    { id: "a4_kosmo", name: "Kosmo Delacroix", look: "Kosmo Delacroix, legendary DJ, sleeping upright with a silk eye mask and a seat's worth of free space. He's got more legroom than most countries.",
      talk: S => kosmoTalk(S), give: async (S, item) => { if (item === "a4_bag") { await RP.lines(["@a4_kosmo You want to put your bag on my seat? Ask first, Brenton.", "Can I put my bag on your empty seat?", "@a4_kosmo ...Gently."]); await giveBag(S); return; } return "Kosmo's not interested. He's asleep, which is how he handles most requests."; },
      pickup: "I'm not carrying a legend. He'd be heavy with opinions.", push: "Gently. I'm not waking Kosmo. He'd call me Brenton for the rest of my life." },
    { id: "a4_stag2", name: "snoring passenger", look: "A passenger asleep in an orange vest, mouth open, snoring in a key that doesn't exist in Western music. He's got a plastic crown. I'm not asking.", talk: "I say \"excuse me.\" He snores a response. It's the most honest conversation I've had all week.", pickup: "He's a passenger. I'm not a baggage handler. Yet.", push: "He'd wake up. And then he'd have a story. I'd be in it." },
    { id: "a4_emptyseat", name: "empty seat", r: [146, 100, 64, 100], z: 40, walk: [178, 232, "back"], vis: S => !S.f.a4_kosmoBag,
      look: "An empty seat next to Kosmo. A luxury seat, without a person. It's bigger than my first apartment.", use: "Not mine. Kosmo bought it. I'd need to ask him.", pickup: "You can't pick up a seat. Not even a very nice one." },
    { id: "a4_bagseat", name: "my record bag", r: [163, 156, 36, 30], z: 66, vis: S => !!S.f.a4_kosmoBag, walk: [178, 232, "back"], look: "My record bag, buckled into Kosmo's spare seat like a VIP. It's got its own seatbelt.", pickup: "Not yet. It's settled in. It'll be mine when we land.", use: "Leave it be. It's asleep." },
    { id: "a4_myseat", name: "seat 23A", r: [326, 100, 64, 100], z: 40, walk: [358, 232, "back"], look: "23A. A window seat. My knees are about to have a very personal relationship with the seat in front.",
      use: S => takeSeat(S), open: S => takeSeat(S), pickup: "It's an airplane seat. They're attached to the plane. And the plane is attached to the sky." },
    { id: "a4_bin", name: "overhead bin", r: [270, 8, 180, 50], z: 20, walk: [358, 232, "back"], look: "The overhead bin above 23A. Stuffed with duty-free bags, a guitar, a pillow and someone's emotional baggage. It will not take my bag.", open: "Full. It opens, takes one look at me and slams shut.", pickup: "It's the bin. I'm not carrying the bin.", push: "It's wedged. It'd take a crowbar and a sense of shame." },
    { id: "a4_windows", name: "windows", rects: [[72, 74, 32, 42], [162, 74, 32, 42], [252, 74, 32, 42], [342, 74, 32, 42], [432, 74, 32, 42], [522, 74, 32, 42]], z: 20, walk: [358, 232, "back"], look: S => S.f.a4_flown ? "Oval windows full of night. And on the right, a wing, blinking red, like it knows something." : "Oval windows: tarmac, a morning sky, a man waving two orange sticks. On the right, a wing. It's blinking red, like it knows something.", open: "It doesn't open. In an hour, that will be a relief." },
    { id: "a4_cart", name: "service cart", r: [560, 190, 62, 64], z: 60, walk: [540, 238, "right"], look: "The drinks cart. A rolling bar of tiny bottles and tiny dreams. Marguerite pushes it like it owes her money.", use: "\"Tomato juice?\" Nobody asks for it on the ground. In the air, it's wine.", pickup: "It's the airline's. And I don't want those pretzels that badly." },
    { id: "a4_door", name: "exit door", r: [4, 62, 46, 156], z: 20, walk: [58, 232, "left"], look: "The cabin door. Through it, the jet bridge. Behind me, New York. Ahead of me, a bag with a seatbelt.", exit: "No going back. Not until Berlin. Possibly not even then." },
    { id: "a4_floor", name: "aisle", r: [8, 224, 620, 28], z: 5, floor: true, look: "The aisle. A strip of carpet with the dignity of a thousand rolling suitcases." }
  ],
  combos: [
    ["a4_bag", "a4_kosmo", S => RP.runH(RP.curRoom().def.hotspots.find(h => h.id === "a4_kosmo").give, "a4_bag")],
    ["a4_bag", "a4_emptyseat", S => giveBag(RP.state)],
    ["a4_bag", "a4_bin", "It won't fit. I've seen the bin. It's full of other people's emotions."],
    ["a4_bag", "a4_marguerite", "She'd put it in the hold. And I'd be the one who needs a hold."],
    ["a4_bag", "a4_myseat", "I'm not putting the bag in my seat. I'd have to sit on the floor. In a plane. That's a form of dedication."],
    ["a4_boarding", "a4_marguerite", "\"23A, sir. Sit.\" She's got the tone of a woman who's seen forty-one men cry in 14B."],
    ["a4_white", "a4_kosmo", "A white label with no name. He'd probably just ask me what it was. And call me Brenton."]
  ],
  enter: async (S, from) => {
    if (!S.f.a4_planeIntro) {
      S.f.a4_planeIntro = true; RP.setClock("SAT 8:55 AM");
      await RP.lines(["TransAtlantis 718. A window seat, a bag under my arm, and a nervous feeling that I've forgotten something.", "Okay. The bag goes in the bin. Everything's going to go in the bin. It's a simple plan. That's how you know."]);
    }
  }
});
})();
