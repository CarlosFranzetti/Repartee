/* Act 4 — a4_baggage: Baggage Services (Priya), carousel 7, shelves of unclaimed bags.
   Priya will stamp Form 7B only when she's off her "break" — which lasts as long as the cat video.
   Flags: a4_priyaTold a4_priyaCat a4_priyaProve a4_formStamped */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u, PK = RP.PK, A4 = RP.a4;
const { R, P, ell, poly, txt, mulberry, mix } = U;
const W = 640;

const sprDesk = A4.spr(300, 60, c => {
  PK.counter(c, 2, 14, 296, 44, { top: "#d6d8e6", front: "#34405e", panelW: 32 });
  // glass partition above the counter with a pass-through gap
  R(c, 6, 0, 2, 16, "#8ab8d8"); R(c, 290, 0, 2, 16, "#8ab8d8"); R(c, 6, 0, 286, 2, "#8ab8d8"); R(c, 6, 0, 286, 1, "#e8f4ff");
  // stamp pad, stamp, bell, pen cup
  R(c, 200, 8, 24, 5, "#c0302c"); R(c, 200, 8, 24, 1, "#ff7a6a"); R(c, 204, 2, 8, 6, "#6a4a30"); R(c, 204, 2, 8, 1, "#a8743e"); R(c, 206, 0, 4, 2, "#17131f");
  ell(c, 250, 11, 5, 3, "#c8a030"); R(c, 249, 6, 2, 3, "#c8a030"); P(c, 247, 10, "#fff0a0");
  R(c, 266, 5, 7, 9, "#c8c4d8"); R(c, 266, 5, 7, 1, "#ffffff"); R(c, 267, 0, 1, 6, "#c0302c"); R(c, 269, 1, 1, 5, "#2f62b8"); R(c, 271, 0, 1, 6, "#17131f");
});
const sprDispenser = A4.spr(24, 50, c => { R(c, 10, 18, 4, 30, "#6a6c80"); R(c, 6, 46, 12, 3, "#4a4c60"); R(c, 2, 2, 20, 18, "#c0302c"); R(c, 2, 2, 20, 2, "#ff7a6a"); R(c, 4, 6, 16, 8, "#efeaf6"); txt(c, "TAKE", 5, 7, "#17131f"); txt(c, "A #", 7, 14, "#17131f"); R(c, 6, 16, 12, 2, "#efe6d0"); });
const BAGS = [
  { id: "pink", w: 24, h: 30, col: "#ff6cbb", label: "pink unicorn hard-shell" },
  { id: "cello", w: 18, h: 40, col: "#7a4a2a", label: "cello case" },
  { id: "tartan", w: 34, h: 20, col: "#2f5a3a", label: "tartan duffel" },
  { id: "pizza", w: 28, h: 18, col: "#c0302c", label: "bag that's been going around since 2019" }
];
const sprBag = {};
BAGS.forEach(b => { sprBag[b.id] = A4.spr(b.w + 6, b.h + 10, c => {
  if (b.id === "cello") { ell(c, 12, 28, 9, 12, "#6a3a1a"); ell(c, 12, 28, 7, 10, "#8a5a2a"); ell(c, 12, 10, 6, 6, "#6a3a1a"); ell(c, 12, 10, 4, 4, "#8a5a2a"); R(c, 11, 2, 2, 12, "#3a2418"); P(c, 8, 26, "#c8925a"); P(c, 16, 26, "#c8925a"); R(c, 10, 22, 4, 1, "#17131f"); return; }
  PK.suitcase(c, 3, 8, { color: b.col, w: b.w, h: b.h, tag: b.id !== "pizza", seed: b.id.length * 7 });
  if (b.id === "pink") { ell(c, 15, 18, 5, 5, "#ffffff"); poly(c, [[15, 8], [18, 16], [12, 16]], "#ffd23f"); P(c, 14, 18, "#17131f"); }
  if (b.id === "tartan") for (let x = 6; x < 34; x += 4) { R(c, x, 12, 1, 14, "#17131f"); R(c, 4, 12 + (x % 8), 30, 1, "#c8c030"); }
  if (b.id === "pizza") { R(c, 5, 14, 20, 8, "#f2c84a"); ell(c, 12, 18, 2, 2, "#c0302c"); ell(c, 20, 17, 2, 2, "#c0302c"); }
}); });

function beltPos(i, t) { const total = 420; const k = ((t / 24 + i * (total / BAGS.length)) % total); return 348 + k * 1.0; }   /* x of bag i at time t */

/* ------------------------------------------------------------------ paint */
function rackOfBags(c, x, y, w, h) {
  R(c, x, y, w, h, "#5a5c70"); R(c, x, y, w, 2, "#9a9cb4"); R(c, x, y + h - 3, w, 3, "#3a3c50");
  const rnd = mulberry(91), cols = ["#c0302c", "#2f62b8", "#17131f", "#3a8a5a", "#c8a030", "#7a4a9a", "#e07a2a", "#3a3a4a", "#ff6cbb"];
  const rows = 3, rh = Math.floor((h - 6) / rows);
  for (let r = 0; r < rows; r++) {
    const ry = y + 3 + r * rh;
    R(c, x + 2, ry + rh - 2, w - 4, 2, "#9a9cb4"); R(c, x + 2, ry + rh - 1, w - 4, 1, "#3a3c50");
    let bx = x + 5;
    while (bx < x + w - 24) {
      const bw = 16 + Math.floor(rnd() * 14), bh = Math.min(rh - 6, 18 + Math.floor(rnd() * 10));
      if (bx + bw > x + w - 4) break;
      const col = cols[Math.floor(rnd() * cols.length)], k = U.ramp(col);
      R(c, bx, ry + rh - 2 - bh, bw, bh, col); R(c, bx, ry + rh - 2 - bh, bw, 1, k[4]); R(c, bx, ry + rh - 2 - bh, 1, bh, k[3]); R(c, bx + bw - 1, ry + rh - 2 - bh, 1, bh, k[0]);
      R(c, bx + bw / 2 - 3, ry + rh - bh - 4, 7, 2, "#2a2838");
      R(c, bx + bw - 6, ry + rh - 2 - bh + 4, 5, 8, "#f4f0e4"); P(c, bx + bw - 5, ry + rh - 2 - bh + 5, "#c0302c");
      bx += bw + 3;
    }
  }
  [x + 1, x + w - 3].forEach(px => R(c, px, y, 3, h, "#8a8ca8"));
}
function paint(c, S) {
  const em = []; const E = a => { if (a && a.length) for (const r of a) em.push(r); return a; };
  PK.plaster(c, 0, 0, W, 112, { base: "#8e94ac", seed: 12, patches: 0, stains: 2, cracks: 1 });
  PK.wallTiles(c, 0, 108, W, 44, { base: "#c8ccd8", size: 12, grout: "#8a8ea4", seed: 3, band: { y: 6, h: 6, a: "#2f62b8", b: "#efe6d0" } });
  PK.baseboard(c, 0, 146, W, { h: 5, color: "#4a4c60" });
  PK.tiles(c, 0, 152, W, 104, { a: "#b4bacc", b: "#a0a6bc", grout: "#7a809a", size: 54, checker: true, horizonY: 96, seed: 4 });
  PK.gradV(c, 0, 0, W, 16, ["#1c1a28", "#34344c"], { dither: 1 });
  [70, 250, 430, 570].forEach(x => E(PK.fluorescent(c, x, 10, 80, { on: true })));
  // sign
  R(c, 196, 20, 250, 30, "#101a3a"); R(c, 196, 20, 250, 1, "#3a4a8a"); R(c, 196, 49, 250, 1, "#050a1a"); R(c, 192, 6, 1, 14, "#2a2838"); R(c, 449, 6, 1, 14, "#2a2838");
  txt(c, "BAGGAGE SERVICES", 214, 26, "#ffd23f", 2, 1); txt(c, "LOST AND FOUND  -  MON-SUN  -  WHEN WE FEEL LIKE IT", 211, 40, "#9fb0ff"); em.push([196, 20, 250, 30]);
  // the shelves behind the desk
  rackOfBags(c, 30, 48, 270, 92);
  // clock stuck at 4:20
  PK.clock(c, 322, 56, { d: 20, hour: 4, min: 20 }); txt(c, "TIME IS A SUGGESTION", 301, 80, "#4a4c60");
  // posters / signs
  PK.poster(c, 458, 58, 38, 52, { title: "HAVE YOU LOST", titleLines: ["HAVE", "YOU", "LOST"], lines: ["HOPE?", "DIGNITY?"], palette: "paper", seed: 71 });
  R(c, 500, 66, 50, 38, "#efe6d0"); R(c, 500, 66, 50, 1, "#ffffff"); R(c, 500, 103, 50, 1, "#a89e88"); txt(c, "NO FOOD", 508, 70, "#c0302c"); txt(c, "NO DRINK", 506, 78, "#c0302c"); txt(c, "NO HOPE", 508, 86, "#55516a"); txt(c, "(SORRY)", 508, 94, "#8a6a8a");
  // customer feedback terminal on the wall
  R(c, 560, 78, 30, 36, "#2a2c40"); R(c, 560, 78, 30, 1, "#6a6c88"); R(c, 563, 81, 24, 7, "#0a2a1a"); txt(c, "RATE US", 564, 83, "#5cff9a");
  [["#2a9a3a", 0], ["#8aaa2a", 1], ["#d8a020", 2], ["#c0302c", 3]].forEach(([col, i]) => { R(c, 563, 91 + i * 5, 24, 4, col); });
  R(c, 563, 106, 24, 5, "#8a1a1a"); txt(c, "4372", 566, 106, "#ffffff");
  // carousel and the belt opening in the wall
  R(c, 330, 94, 28, 42, "#0a080e"); for (let y = 96; y < 136; y += 3) R(c, 332, y, 24, 2, y % 6 ? "#1a1824" : "#2a2838");
  E(PK.luggageCarousel(c, 340, 128, 300, { bags: 0, label: "CAROUSEL 7" }));
  txt(c, "OUT OF ORDER?", 410, 163, "#c0302c");
  // exit to the terminal (right)
  R(c, 598, 76, 38, 78, "#1c1a28"); R(c, 600, 78, 34, 74, "#3a5a7a"); PK.gradV(c, 600, 78, 34, 74, ["#8ab8d8", "#4a7a9a"], { dither: 1 });
  R(c, 616, 78, 2, 74, "#1c1a28"); R(c, 600, 112, 34, 2, "#1c1a28"); R(c, 608, 110, 2, 12, "#c8c4d8"); R(c, 622, 110, 2, 12, "#c8c4d8");
  E(A4.hangSign(c, 584, 56, 56, "TERMINAL", { arrow: ">", h: 14 }));
  A4.stanchions(c, 20, 150, 238, { n: 5 });
  return em;
}

function draw(c, S, t) {
  // moving bags on the carousel: draw back-to-front by x
  BAGS.forEach((b, i) => { const x = beltPos(i, t); if (x < 340 || x > 640) return; sprBag[b.id](c, x, 128 - b.h - 2 + (b.id === "cello" ? 4 : 0)); });
  // priya's monitor: a cat falls off a couch, forever
  const cx = 114, cy = 128;
  R(c, cx, cy, 36, 20, "#0a0818"); R(c, cx + 1, cy + 1, 34, 18, "#2a3a5a");
  R(c, cx + 2, cy + 12, 18, 6, "#7a3fb0"); R(c, cx + 2, cy + 12, 18, 1, "#a070d0");
  const k = (t / 1100) % 3;
  const catx = k < 1.2 ? 8 + k * 6 : 16 + (k - 1.2) * 14, caty = k < 1.2 ? 8 : 8 + Math.min(10, (k - 1.2) * (k - 1.2) * 14);
  ell(c, cx + catx, cy + caty, 4, 3, "#e0802a"); R(c, cx + catx - 4, cy + caty - 4, 2, 2, "#e0802a"); R(c, cx + catx + 2, cy + caty - 4, 2, 2, "#e0802a"); P(c, cx + catx - 2, cy + caty - 1, "#17131f"); P(c, cx + catx + 1, cy + caty - 1, "#17131f");
  if (Math.floor(t / 250) % 2) { P(c, cx + 29, cy + 4, "#ff3fa4"); P(c, cx + 30, cy + 3, "#ff3fa4"); P(c, cx + 30, cy + 5, "#39d0ff"); }
  // NOW SERVING 4
  R(c, 232, 118, 44, 12, "#0a0810"); R(c, 232, 118, 44, 1, "#4a4c60"); txt(c, "SERVING", 235, 121, "#ff9a3a"); txt(c, "4", 268, 121, Math.floor(t / 800) % 2 ? "#ff4a4a" : "#c02a2a");
}

function light(S) {
  return {
    ambient: "#a0a6c0",
    lights: [
      { x: 110, y: 12, r: 150, color: "#e0f0ff", steps: 3, power: 0.55 }, { x: 290, y: 12, r: 170, color: "#e8f4ff", steps: 3, power: 0.5 },
      { x: 470, y: 12, r: 170, color: "#e0f0ff", steps: 3, power: 0.5 }, { x: 610, y: 12, r: 130, color: "#e8f4ff", steps: 3, power: 0.45 },
      { x: 130, y: 134, r: 70, color: "#6a8ad8", steps: 3, power: 0.55 }, { x: 460, y: 140, r: 130, color: "#ffd890", steps: 2, power: 0.35 }
    ],
    halos: [{ x: 132, y: 138, r: 24, color: "#6a8ad8", strength: 0.9 }], key: { x: 290, y: 12 }, shadow: 0.55
  };
}

/* ------------------------------------------------------------------ Priya */
const tagName = S => A4.misspell(A4.dj(S));
async function priyaTalk(S) {
  if (!S.f.a4_priyaTold && !S.f.a4_priyaOpen) {
    S.f.a4_priyaOpen = true;
    await RP.say("Hi, I think my bag's lost?");
    await RP.lines(["@a4_priya (doesn't look up) Take a number.", "There's nobody else here.", "@a4_priya I know. I love it. Take a number.", "The dispenser gave me a 5. The display says 4. This is not going to be quick."]);
  }
  await RP.convo([
    { text: "I'm here about a detained bag.", when: S => !S.f.a4_priyaTold, run: async () => {
      if (!RP.has("a4_claim")) { await RP.say("Claim tag, hon. No tag, no bag. That's the law.", "a4_priya"); return; }
      S.f.a4_priyaTold = true;
      await RP.lines(["@a4_priya (types) BER-4471. \"" + tagName(S) + ".\" ...Oh. Security's got it. K9 flagged it. Smelled \"suspicious nostalgia.\"",
        "It's records!", "@a4_priya I can release it with a Form 7B. Stamped by us, signed by them.", "Where's the form?", "@a4_priya The rack in the main hall. We're out. The rack's got some.",
        "@a4_priya I'll stamp it. But I'm on my break.", "You're on break? You're at a desk!", "@a4_priya My break is when the video ends. It's very long. It loops."]);
    } },
    { text: "What are you watching?", when: S => S.f.a4_priyaTold && !S.f.a4_priyaCat, run: async () => {
      S.f.a4_priyaCat = true;
      await RP.lines(["@a4_priya The cat video! The cat falls off the couch. Every time. I can't stop.", "@a4_priya It's got that song. That bouncy one. \"NYC 93.\"", "That's... that's my song.", "@a4_priya It's the cat song, hon."]);
    } },
    { text: "That's my remix. I made it.", when: S => S.f.a4_priyaCat && !S.f.a4_priyaProve, run: async () => {
      S.f.a4_priyaProve = true;
      await RP.lines(["@a4_priya Sure you did. And I'm the Queen of Queens.", "I did! Pipe Hole Records! It's on my label!", "@a4_priya ...Prove it."]);
    } },
    { text: "(Show her the Pipe Hole Records page on my phone.)", when: S => S.f.a4_priyaProve && !S.f.a4_formStamped, run: async () => {
      await stampScene(S);
    } },
    { text: "Never mind.", end: true }
  ]);
}
async function stampScene(S) {
  if (!RP.has("a4_form")) { await RP.lines(["@a4_priya (stares at the phone, then at the cover photo: a hole in a wall)", "@a4_priya ...THE HOLE. It's the HOLE. Oh my God.", "@a4_priya Okay. I'm going to stamp something. Do you have something to stamp?", "I should get a Form 7B. From the rack in the hall."]); return; }
  await RP.lines(["@a4_priya (stares at the phone, then at the cover photo: a hole in a wall)", "@a4_priya ...THE HOLE. It's the HOLE. Oh my GOD.", "@a4_priya My kid has this on repeat. Her name's Maddie. Say hi to Maddie!",
    "Hi, Maddie. (She films me for six seconds.)", "@a4_priya She's screaming. Give me that form. Break's over."]);
  RP.sfx("click"); await RP.wait(300); RP.sfx("thump");
  S.f.a4_formStamped = true; RP.refreshInv();
  await RP.lines(["*STAMP.* \"RECEIVED.\" She adds a smiley, which I'm fairly sure is a violation.", "@a4_priya Now Security. They'll sign it. Ask for Delgado. Tell him Priya says hi.", "@a4_priya And tell your friend the cat's doing great."]);
  await RP.say("The form says what it's always wanted to say. All it needs is a signature.");
}
async function giveToPriya(S, item) {
  if (item === "a4_claim") { if (S.f.a4_priyaTold) return "She's read it. She's got its number. She keeps looking at me, then at the claim, then at me."; return priyaTalk(S); }
  if (item === "a4_form") {
    if (S.f.a4_formStamped) return "It's already stamped. \"RECEIVED.\" With a smiley.";
    if (!S.f.a4_priyaTold) { await RP.say("Form 7B. For what, hon? Tell me about the bag first.", "a4_priya"); return; }
    if (S.f.a4_priyaProve) { await stampScene(S); return; }
    await RP.lines(["@a4_priya I'm on my break.", "You're at your desk!", "@a4_priya It's a working break. I'm watching a cat fall off a couch. It's the best thing on the internet."]);
    return;
  }
  if (item === "phone") { if (S.f.a4_priyaProve) { await stampScene(S); return; } await RP.say("She looks at my phone. \"Hon, that's a phone. I have one.\"", "a4_priya"); return; }
  return "She's not interested. She's busy, in a working-break kind of way.";
}

/* ------------------------------------------------------------------ the room */
const flowing = (id, i) => ({ id, name: BAGS[i].label, rects: S => { const x = Math.round(beltPos(i, performance.now() - (RP.curRoom() ? RP.curRoom().t0 : 0))); return [[x, 128 - BAGS[i].h - 2, BAGS[i].w + 4, BAGS[i].h + 4]]; }, z: 50, walk: [500, 232, "back"] });
RP.room({
  id: "a4_baggage", act: 4, name: "Baggage Services",
  paint, draw, light, ambience: "airport", music: null,
  walk: [[8, 206], [200, 204], [570, 204], [630, 250], [8, 250]],
  start: { x: 560, y: 230, face: "left" },
  actors: [
    { id: "a4_priya", char: "a4_priya", x: 160, y: 168, face: "front", act: "stand", name: "Priya", noTurn: true },
    { id: "a4_pax4", char: "a4_pax4", x: 562, y: 206, face: "back", act: "stand", clickable: false }
  ],
  sprites: [
    { y: 200, draw: c => sprDesk(c, 24, 144) },
    { y: 196, draw: c => sprDispenser(c, 318, 156) }
  ],
  self: { look: "Tour bomber, headphones, and the posture of someone about to be told to \"take a number.\"", talk: "I'd say \"hi,\" but I'm saving my energy for a form." },
  hotspots: [
    { id: "a4_priya", name: "Priya", look: "Priya, Baggage Services. Cardigan, glasses, lanyard. She isn't looking at me. She's looking at a cat.",
      talk: S => priyaTalk(S), give: (S, item) => giveToPriya(S, item),
      pickup: "I'm not picking up Priya. She'd report me to herself.", push: "I'd say pushing a clerk is rude. And also a form 7C." },
    { id: "a4_desk", name: "service desk", r: [24, 144, 300, 56], z: 30, walk: [200, 218, "back"], look: "A counter with a glass partition and a sliding window that doesn't slide. Behind it, shelves of other people's trips." },
    { id: "a4_stamp", name: "stamp and pad", r: [222, 144, 34, 18], z: 60, walk: [236, 214, "back"],
      look: "A rubber stamp that says RECEIVED, next to a red pad. Priya guards it like a dragon with a very small hoard.",
      pickup: "Priya's got eyes on it. \"Hands off,\" she says. She hasn't looked up.", use: "I can't stamp my own form. I'm not an authority. I'm a DJ." },
    { id: "a4_numbers", name: "take-a-number", r: [316, 156, 26, 52], z: 50, walk: [330, 218, "back"], look: "TAKE A NUMBER. The display says NOW SERVING 4. My ticket says 5. There's only me here. Math, as practiced by an airline.", pickup: "Already took one. It says 5. I'm keeping it.", use: "I already have a number. It's 5. It's the loneliest number." },
    { id: "a4_screen", name: "Priya's monitor", r: [112, 124, 40, 26], z: 70, walk: [140, 214, "back"],
      look: "A video loops on Priya's screen: a cat falls off a couch, over and over, to a bouncy track. I know that bounce. I MADE that bounce. It's on loop. In an airport.",
      use: "It's her screen. She'd notice.", pickup: "It's a monitor. And it's Priya's. And I have a sense of self-preservation." },
    { id: "a4_shelves", name: "unclaimed bags", r: [30, 48, 270, 92], z: 15, walk: [180, 218, "back"], look: "Hundreds of bags, tagged and shelved. A suitcase that's been waiting since the last century. Mine joined its ranks this afternoon. Possibly." },
    { id: "a4_clock", name: "clock", r: [320, 54, 26, 36], z: 20, walk: [330, 216, "back"], look: "Stuck at 4:20. \"TIME IS A SUGGESTION,\" says a sign. It's the most honest sign in the airport." },
    { id: "a4_posters", name: "posters", rects: [[458, 58, 40, 54], [500, 66, 50, 38]], z: 20, walk: [490, 216, "back"], look: "\"HAVE YOU LOST: HOPE? DIGNITY?\" And a sign: NO FOOD, NO DRINK, NO HOPE (SORRY). I appreciate the apology." },
    { id: "a4_rate", name: "feedback terminal", r: [560, 78, 32, 40], z: 25, walk: [570, 218, "back"], look: "\"RATE US.\" Four buttons from green smiley to red angry. The red one is worn smooth and the counter says 4,372.", use: "I press red. For everyone who came before.", push: "I press red. A tradition." },
    { id: "a4_carousel", name: "carousel 7", r: [340, 108, 300, 56], z: 15, walk: [500, 218, "back"], look: "CAROUSEL 7: OUT OF ORDER? The question mark is the airline's way of being honest. It's going round anyway.", use: "I'm not stepping on the belt. I've seen what the belt takes.", push: "It doesn't stop. It never stops. That's the carousel's whole thing.", pickup: "I'm waiting for MY bag. Not any bag. That's the difference between a DJ and a thief." },
    Object.assign(flowing("a4_bagpink", 0), { look: "A pink unicorn hard-shell. It's gone around about a hundred times. Someone out there is without a unicorn.", pickup: "That's not mine. Mine's black, heavy and full of 12-inches. This one's pink and full of sparkles. Also an alarm.", use: "It's somebody's. The unicorn has a name tag: \"SPARKLES.\"" }),
    Object.assign(flowing("a4_bagcello", 1), { look: "A cello case on the carousel. A cellist is crying somewhere.", pickup: "Not mine. I've got records, not strings. Different kind of heavy.", use: "I'm not a cellist. I could pretend. It'd be a short career." }),
    Object.assign(flowing("a4_bagtartan", 2), { look: "A tartan duffel. A man in the queue wants it very much, I can tell.", pickup: "That's a stranger's duffel. I'm many things. A duffel thief isn't one of them." }),
    Object.assign(flowing("a4_bagpizza", 3), { look: "A bag that's been going around since 2019. It has a pizza sticker. It's lived a better life than me.", pickup: "That one's older than Gerald. I'll let it ride." }),
    { id: "a4_door_out", name: "Terminal", r: [596, 76, 44, 78], z: 20, walk: [606, 226, "right"], look: "The door back to the main hall, where my flight is still on the board.", exit: { room: "a4_jfk", x: 52, y: 226, face: "right" } },
    { id: "a4_floor", name: "floor", r: [8, 204, 620, 46], z: 5, floor: true, look: "Gray tile, scuffed by ten thousand rolling suitcases and one hopeful DJ." }
  ],
  combos: [
    ["a4_claim", "a4_priya", S => giveToPriya(RP.state, "a4_claim")],
    ["a4_claim", "a4_desk", S => priyaTalk(RP.state)],
    ["a4_form", "a4_priya", S => giveToPriya(RP.state, "a4_form")],
    ["a4_form", "a4_desk", S => giveToPriya(RP.state, "a4_form")],
    ["a4_form", "a4_stamp", "I'm not stamping it myself. I'd be \"unauthorized.\" That's a form of its own."],
    ["a4_form", "a4_screen", "I can't stamp a cat video. It's already approved."],
    ["phone", "a4_priya", S => giveToPriya(RP.state, "phone")],
    ["phone", "a4_screen", "I could just show her. I could ask her to look at me and not the cat. Ambitious."],
    ["a4_white", "a4_priya", "A white label. She'd think it's a Frisbee. It's got a hole in it, so it kind of qualifies."],
    ["a4_jerky", "a4_priya", "She's already eating. A smaller, daintier thing. I'm not offering jerky."],
    ["a4_boarding", "a4_priya", "She's not gate agent. She's baggage. Different kind of problem."]
  ],
  enter: async (S, from) => {
    if (!S.f.a4_firstBag) {
      S.f.a4_firstBag = true; RP.setClock("FRI 4:12 PM");
      await RP.lines(["Baggage Services. Gray tile, gray walls, gray souls. The carousel is the only thing moving.", "And there: Priya. She's watching her monitor. Her monitor is playing... a very familiar bounce."]);
    }
  }
});
})();
