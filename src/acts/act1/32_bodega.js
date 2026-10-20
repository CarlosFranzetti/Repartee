/* Act 1 — a1_bodega: Ali's Deli & Grocery. The can-deposit machine ($2.40 for the first bag), the
   bodega cat, Ali at the counter. Flags: a1_cansDone, a1_ate, a1_scratched. */
(function () {
"use strict";
const RP = window.RP;
const A1 = RP.a1, PK = RP.PK;
const { R, P, ell, line, poly, bayer, mulberry, clamp, txt, txtW, txtC, mix, ramp } = RP.u;
const U = PK.util;
const W = 640, FY = 168;

/* ---------- the cat ---------- */
function drawCat(c, x, y, t) {
  /* x = center, y = counter surface. An orange loaf with opinions. */
  const blink = Math.floor(t / 3100) % 5 === 0 && (t % 3100) < 140;
  const flick = Math.floor(t / 900) % 3 === 0;
  const tail = Math.round(Math.sin(t / 520) * 2);
  const O = "#e08a3a", OL = "#f4aa5a", OD = "#a85a22", W2 = "#f4ece0";
  ell(c, x, y - 1, 11, 2, "#0c0618");                                                                  /* shadow on the counter */
  ell(c, x, y - 6, 9, 6, OD); ell(c, x, y - 7, 9, 6, O); ell(c, x - 2, y - 9, 5, 3, OL);                  /* loaf body */
  for (let i = 0; i < 4; i++) R(c, x - 6 + i * 4, y - 12, 1, 4, OD);                                     /* stripes */
  ell(c, x + 7, y - 4, 3, 2, W2);                                                                       /* paws */
  ell(c, x + 8, y - 12, 5, 4, O); ell(c, x + 7, y - 13, 3, 2, OL);                                      /* head */
  P(c, x + 4, y - 17, O); P(c, x + 5, y - 16, O); P(c, x + 5, y - 17, OD); P(c, x + 11, y - 17 + (flick ? 1 : 0), O); P(c, x + 12, y - 16, O);   /* ears */
  P(c, x + 5, y - 16, "#f2a0b8"); P(c, x + 11, y - 16, "#f2a0b8");
  if (blink) { R(c, x + 6, y - 13, 2, 1, "#1c1018"); R(c, x + 10, y - 13, 2, 1, "#1c1018"); }
  else { R(c, x + 6, y - 14, 2, 2, "#d8e84a"); R(c, x + 10, y - 14, 2, 2, "#d8e84a"); P(c, x + 7, y - 14, "#1c1018"); P(c, x + 11, y - 14, "#1c1018"); }
  P(c, x + 9, y - 11, "#f2a0b8"); R(c, x + 8, y - 10, 3, 1, W2);
  R(c, x + 12, y - 11, 4, 1, W2); R(c, x + 12, y - 10, 3, 1, "#c8c0b8");                                 /* whiskers */
  for (let i = 0; i < 9; i++) P(c, x - 9 - i, y - 4 + Math.round(Math.sin(i / 2 + t / 400) * 1.5) + (i > 5 ? tail : 0), i % 3 === 2 ? OD : O);   /* tail */
  P(c, x + 7, y - 7, "#d8a840"); P(c, x + 9, y - 7, "#d8a840");                                        /* collar bell */
}

/* ---------- props ---------- */
function canMachine(c, x, y) {
  const em = [];
  R(c, x, y, 58, 104, "#4a5a4e"); U.gradient(c, x, y, 58, 104, [[0, "#6a7a6c"], [0.1, "#4a5a4e"], [1, "#2e3a30"]], 1, true);
  R(c, x, y, 58, 1, "#9ab0a0"); R(c, x, y, 1, 104, "#8aa090"); R(c, x + 57, y, 1, 104, "#1a2220"); R(c, x, y + 103, 58, 1, "#1a2220");
  R(c, x + 4, y + 4, 50, 12, "#10301c"); R(c, x + 5, y + 5, 48, 10, "#1a5a30"); txt(c, "CANS 5C", x + 8, y + 7, "#9fffb0"); em.push([x + 5, y + 5, 48, 10]);
  R(c, x + 4, y + 20, 50, 6, "#0a1a10"); txt(c, "0.00", x + 38, y + 21, "#ff9a3f"); em.push([x + 38, y + 21, 14, 5]);
  R(c, x + 6, y + 32, 46, 34, "#0e1410"); R(c, x + 7, y + 33, 44, 32, "#1a2220");                       /* mouth */
  for (let i = 0; i < 8; i++) { R(c, x + 8 + i * 5, y + 34, 3, 30, "#2a3a2e"); R(c, x + 8 + i * 5, y + 34, 1, 30, "#4a5a4e"); }
  R(c, x + 5, y + 31, 48, 2, "#8aa090"); R(c, x + 5, y + 65, 48, 2, "#2a3a2e");
  R(c, x + 6, y + 72, 20, 8, "#c0302c"); txt(c, "BOTTLES", x + 7, y + 74, "#fff6dc"); R(c, x + 30, y + 72, 22, 8, "#2f62b8"); txt(c, "RECEIPT", x + 31, y + 74, "#fff6dc");
  R(c, x + 12, y + 86, 34, 9, "#1c1c24"); R(c, x + 14, y + 88, 30, 5, "#c8c4d4");                      /* receipt slot */
  U.dshade(c, x + 2, y + 98, 54, 6, "#000000", (px, py) => 0.6, 0.5);
  /* stickers */
  R(c, x + 40, y + 94, 10, 6, "#ffd23f"); txt(c, "5C", x + 42, y + 96, "#2a1a10");
  return em;
}
function menuBoard(c, x, y) {
  R(c, x, y, 160, 56, "#14100c"); R(c, x, y, 160, 1, "#5a4a3a"); R(c, x, y + 55, 160, 1, "#000"); R(c, x, y, 1, 56, "#4a3a2a"); R(c, x + 159, y, 1, 56, "#000");
  txt(c, "DELI", x + 6, y + 4, "#ffd23f", 2, 1);
  [["BACON EGG & CHEESE", "4.50"], ["COFFEE", "1.25"], ["CHOPPED CHEESE", "7.00"], ["SCRATCH-OFF", "1.00"]].forEach(([n, p], i) => { txt(c, n, x + 6, y + 18 + i * 8, "#efeaf6"); txt(c, p, x + 132, y + 18 + i * 8, "#ffd23f"); });
  U.dshade(c, x, y, 160, 56, "#ffffff", (px, py) => { const q = ((px - x) * 0.7 + (py - y) + 600) % 90; return q < 4 ? 1 : 0; }, 0.06);
}
function mirror(c, x, y) {
  ell(c, x, y, 17, 17, "#1c1626"); ell(c, x, y, 15, 15, "#8a869c"); ell(c, x, y, 14, 14, "#2a3a5a");
  U.gradient(c, x - 12, y - 12, 25, 25, [[0, "#6a80a8"], [1, "#1a2038"]], 1, true);
  ell(c, x, y, 14, 14, "#2a3a5a");
  ell(c, x + 2, y + 3, 8, 5, "#4a5a7a"); R(c, x - 3, y - 2, 8, 6, "#c8a050"); ell(c, x + 8, y - 6, 3, 3, "#e0a27a"); ell(c, x - 6, y + 4, 3, 5, "#3a3a5a");
  P(c, x - 8, y - 9, "#ffffff"); P(c, x - 7, y - 10, "#ffffff"); P(c, x - 9, y - 8, "#e8f4ff");
  R(c, x - 1, y + 17, 3, 12, "#5a566c"); R(c, x - 1, y - 28, 3, 11, "#5a566c");
}

/* baked foreground props (depth sorted) */
const B = {
  rack: () => A1.memo("bd_rack", 34, 66, c => {            /* chip rack */
    R(c, 3, 62, 28, 2, "#3a364a"); R(c, 5, 6, 2, 56, "#5a566c"); R(c, 27, 6, 2, 56, "#5a566c"); R(c, 5, 6, 24, 2, "#8a869c");
    for (let r = 0; r < 4; r++) { R(c, 5, 16 + r * 12, 24, 2, "#8a869c"); R(c, 5, 16 + r * 12, 24, 1, "#c8c4d4");
      for (let k = 0; k < 4; k++) { const col = ["#c0302c", "#ffd23f", "#2f62b8", "#3fa66a", "#ff8a4c", "#a05cff"][(r * 4 + k) % 6]; R(c, 6 + k * 6, 6 + r * 12 + 2, 5, 8, col); R(c, 6 + k * 6, 6 + r * 12 + 2, 5, 1, mix(col, "#ffffff", 0.5)); R(c, 7 + k * 6, 6 + r * 12 + 6, 3, 2, "#f4f0e8"); } }
    U.dshade(c, 3, 60, 28, 6, "#000000", (px, py) => 0.7, 0.35);
  }),
  water: () => A1.memo("bd_water", 44, 36, c => {          /* stacked water cases */
    for (let r = 0; r < 2; r++) for (let k = 0; k < 2; k++) { const bx = 2 + k * 20, by = 4 + r * 14; R(c, bx, by, 20, 14, "#a8d0e8"); R(c, bx, by, 20, 2, "#e8f8ff"); R(c, bx, by + 13, 20, 1, "#4a7898"); R(c, bx + 2, by + 4, 16, 6, "#2a78c8"); txt(c, "H2O", bx + 5, by + 5, "#e8f8ff"); }
    R(c, 2, 33, 40, 2, "#6a5a40");
  }),
  mop: () => A1.memo("bd_mop", 22, 40, c => {
    R(c, 2, 24, 16, 14, "#e8b830"); R(c, 2, 24, 16, 2, "#ffe070"); R(c, 2, 36, 16, 2, "#a07a10"); R(c, 4, 28, 12, 6, "#2a78c8");
    R(c, 9, 2, 2, 24, "#8a5a38"); for (let i = 0; i < 7; i++) R(c, 5 + i * 2, 22, 1, 5, i % 2 ? "#c8c4d4" : "#9a96ac");
    U.dshade(c, 0, 36, 20, 4, "#000", () => 0.7, 0.35);
  })
};

function paintBodega(c, S) {
  const tod = A1.tod(S), night = tod === "night", em = [], rnd = mulberry(32);
  /* ---- walls ---- */
  PK.plaster(c, 0, 0, W, FY, { base: "#cdbd8c", seed: 71, patches: 2, stains: 3, cracks: 1 });
  R(c, 0, 108, W, 60, "#3f6a58"); PK.plaster(c, 0, 108, W, 60, { base: "#3f6a58", seed: 72, patches: 0, stains: 1, cracks: 0 });
  R(c, 0, 106, W, 3, "#d8d0b0"); R(c, 0, 106, W, 1, "#fff6dc"); R(c, 0, 108, W, 1, "#8a8060");
  /* ceiling + fluorescent tubes */
  R(c, 0, 0, W, 16, "#8a8070"); for (let x = 0; x < W; x += 32) R(c, x, 0, 1, 16, "#6a604e"); R(c, 0, 14, W, 2, "#5a5040");
  U.dshade(c, 0, 0, W, 16, "#140c24", (px, py) => 0.4, 0.4);
  [[60, 6, 80], [260, 6, 80], [470, 6, 80]].forEach(([tx, ty, tw]) => { R(c, tx - 2, ty - 1, tw + 4, 6, "#c8c4b0"); R(c, tx, ty, tw, 4, "#f4fff4"); R(c, tx, ty, tw, 1, "#ffffff"); em.push([tx, ty, tw, 4]); });
  /* ---- floor ---- */
  PK.tiles(c, 0, FY, W, 256 - FY, { a: "#cfc5a8", b: "#a89a78", checker: true, size: 30, horizonY: 100, vx: 320, grout: "#a89c78", seed: 73 });
  U.dshade(c, 0, FY + 20, W, 60, "#3a2a18", (px, py) => 0.3 + Math.sin(px / 30 + py / 8) * 0.1, 0.12);
  /* ---- front door + window glass (left) ---- */
  R(c, 0, 30, 58, 138, "#2a2a38"); R(c, 2, 32, 54, 134, night ? "#241a3a" : "#c8e8ff");
  U.gradient(c, 4, 34, 50, 130, night ? [[0, "#1a1236"], [1, "#4a2a58"]] : [[0, "#a8d0f8"], [1, "#fff0d0"]], 1, true);
  if (night) { for (let i = 0; i < 4; i++) { R(c, 8 + i * 12, 48 + (i % 2) * 20, 6, 8, ["#ffb04a", "#ff9ad5", "#9fe8ff", "#ffd27a"][i]); } R(c, 4, 100, 50, 50, "#3a2a48"); U.dshade(c, 4, 120, 50, 40, "#ffb04a", (px, py) => 0.5, 0.25); }
  else { R(c, 4, 100, 50, 60, "#7a7a88"); R(c, 6, 110, 20, 26, "#a85a44"); R(c, 30, 104, 22, 30, "#8a5a50"); for (let i = 0; i < 3; i++) R(c, 8 + i * 6, 114 + i * 3, 3, 3, "#ffe2a0"); }
  R(c, 28, 30, 3, 138, "#5a566c"); R(c, 28, 30, 1, 138, "#9a96ac"); R(c, 2, 96, 54, 3, "#5a566c"); R(c, 2, 164, 54, 4, "#3a364a");
  em.push([4, 34, 50, 62]);
  U.dshade(c, 2, 32, 54, 134, "#ffffff", (px, py) => { const q = ((px - 2) * 0.9 + (py - 32) + 600) % 70; return q < 5 ? 1 : 0; }, 0.14);
  R(c, 8, 70, 24, 9, "#c0302c"); txt(c, "OPEN", 11, 72, "#fff6dc"); R(c, 34, 46, 20, 10, "#ffd23f"); txt(c, "THANK", 35, 47, "#2a1a10", 1, 0); txt(c, "YOU", 38, 51, "#2a1a10");
  R(c, 58, 14, 2, 154, "#8a8060");
  /* ---- can machine ---- */
  em.push.apply(em, canMachine(c, 66, 64));
  /* ---- coolers ---- */
  em.push.apply(em, PK.cooler(c, 134, 60, 76, 108, { sign: "COLD DRINKS", seed: 74 }));
  em.push.apply(em, PK.cooler(c, 214, 60, 76, 108, { sign: "BEER & SODA", seed: 75 }));
  /* ---- shelves ---- */
  PK.shelf(c, 300, 60, 124, 108, { items: "boxes", seed: 76 });
  R(c, 300, 52, 124, 7, "#c0302c"); txtC(c, "CHIPS  CANDY  CEREAL", 362, 54, "#fff6dc", 1);
  /* ---- right side: menu, lotto wall, counter ---- */
  menuBoard(c, 444, 26);
  R(c, 440, 100, 100, 68, "#241c1c"); R(c, 440, 98, 100, 3, "#5a4a3a");
  for (let r = 0; r < 3; r++) for (let k = 0; k < 8; k++) { const col = ["#c0302c", "#ffd23f", "#2f62b8", "#3fa66a", "#efeaf6", "#ff3fa4", "#39d0ff", "#ff8a4c"][(r * 3 + k) % 8]; R(c, 444 + k * 12, 104 + r * 18, 10, 14, col); R(c, 444 + k * 12, 104 + r * 18, 10, 1, mix(col, "#fff", 0.5)); }
  R(c, 440, 98, 100, 1, "#9a8a6a");
  R(c, 552, 100, 76, 52, "#12141c"); R(c, 553, 101, 74, 50, "#2a3a5a"); R(c, 556, 104, 68, 14, "#c0302c"); txt(c, "LOTTO", 574, 108, "#ffd23f", 1, 1); em.push([556, 104, 68, 14]);
  for (let i = 0; i < 5; i++) { R(c, 558 + i * 13, 122, 10, 12, ["#ffd23f", "#39d0ff", "#ff3fa4", "#9be15d", "#ff8a4c"][i]); R(c, 558 + i * 13, 122, 10, 1, "#fff"); }
  for (let i = 0; i < 5; i++) { R(c, 558 + i * 13, 138, 10, 8, "#efeaf6"); R(c, 560 + i * 13, 140, 6, 1, "#c0302c"); }
  /* signs */
  R(c, 310, 28, 70, 12, "#efeaf6"); outlineSign(c, 310, 28, 70, 12, "#c0302c"); txtC(c, "CAMERAS ON PREMISES", 345, 31, "#c0302c", 1);
  R(c, 390, 18, 40, 22, "#efeaf6"); txtC(c, "NO", 410, 22, "#c0302c", 2); txtC(c, "LOITERING", 410, 32, "#3a3a4a", 1);
  R(c, 140, 28, 60, 14, "#ffd23f"); txtC(c, "WE ACCEPT EBT", 170, 32, "#2a1a10", 1);
  R(c, 210, 32, 54, 14, "#2f62b8"); txtC(c, "ICE COLD", 237, 36, "#fff6dc", 1);
  /* convex mirror in the corner */
  mirror(c, 606, 62);
  /* radio on the shelf */
  R(c, 604, 118, 20, 12, "#2a2a32"); R(c, 604, 118, 20, 1, "#6a6a7a"); ell(c, 610, 124, 3, 3, "#8a86a0"); ell(c, 618, 124, 3, 3, "#8a86a0"); R(c, 612, 112, 1, 7, "#c8c4d8");
  /* baseboards and grime */
  R(c, 0, FY - 5, W, 5, "#2a2218"); R(c, 0, FY - 5, W, 1, "#6a5a40");
  U.dshade(c, 0, 140, W, 28, "#0c0618", (px, py) => (py - 140) / 28, 0.35);
  return em;
}

function outlineSign(c, x, y, w, h, col) { R(c, x, y, w, 1, col); R(c, x, y + h - 1, w, 1, col); R(c, x, y, 1, h, col); R(c, x + w - 1, y, 1, h, col); }

function lightBodega(S) {
  const night = A1.tod(S) === "night", dusk = A1.tod(S) === "dusk";
  return {
    ambient: "#8c8696",
    lights: [
      { x: 100, y: 8, r: 260, color: "#e8fff0", steps: 4, sy: 1.2 }, { x: 300, y: 8, r: 260, color: "#e8fff0", steps: 4, sy: 1.2 }, { x: 510, y: 8, r: 260, color: "#e8fff0", steps: 4, sy: 1.2 },
      { box: [4, 34, 50, 130], r: 100, color: night ? "#ffb04a" : dusk ? "#ffb078" : "#fff6e8", steps: 3, power: night ? 0.55 : 0.9 },
      { box: [134, 70, 156, 90], r: 70, color: "#d8eaff", steps: 3, power: 0.7 },
      { x: 590, y: 120, r: 120, color: "#ffd27a", steps: 3, power: 0.6, rim: true }
    ],
    key: { x: 320, y: 6 }, shadow: 0.5
  };
}

/* ---------- scenes ---------- */
async function depositCans(S, item) {
  const first = item === "cans";
  const val = first ? 2.40 : 1.50;
  RP.take(item);
  RP.sfx("crackle");
  await RP.lines(["I feed the bag into the machine, one can at a time.", "It chews them with a noise like a vacuum cleaner eating gum."]);
  await RP.wait(600);
  RP.money(val);
  if (first) {
    S.f.a1_cansDone = true;
    await RP.lines(["$2.40. That's forty-eight cans of other people's good time.", S.f.a1_pizza ? "Plus the five from the pizza box... that's rent money. Well. A rent-adjacent amount." : "It's not rent money. It's not even rent's lunch money."]);
    if (S.money < 11 && !S.f.a1_delivered) await RP.lines(["A subway to Midtown and back is six bucks. Then Deep Cuts. Then home. I need more than this.", "Smitty was looking for someone to drop a package at Sal's. Twenty bucks."]);
  } else await RP.say("Another $1.50. The block has an unlimited supply of cans and a limited supply of dignity.");
}

async function aliTalk(S) {
  await RP.convo([
    { text: "Coffee, please.", run: async () => {
      if (!RP.canAfford(1.25)) return RP.say("@a1_ali That's a dollar twenty-five. You have... " + RP.u.fmtMoney(S.money) + ". Come back when you're a customer.", "a1_ali");
      RP.money(-1.25);
      await RP.lines(["@a1_ali Light and sweet. The only way.", "Coffee. Reality is back."]);
    } },
    { text: "A bacon, egg and cheese.", when: S => !S.f.a1_ate, run: async () => {
      if (!RP.canAfford(4.50)) return RP.say("@a1_ali Four-fifty. For you? ...Four-fifty. I'm not Santa.");
      RP.money(-4.50); S.f.a1_ate = true;
      RP.text("MOM", "Did you eat", true);
      await RP.lines(["@a1_ali Salt, pepper, ketchup. It's a hug on a roll.", "Okay. Technically, yes, Mom. I ate."]);
    } },
    { text: "A scratch-off ticket.", when: S => !S.f.a1_scratched, run: async () => {
      if (!RP.canAfford(1)) return RP.say("@a1_ali A dollar. Come on. Even Smitty has a dollar.");
      RP.money(-1); S.f.a1_scratched = true;
      await RP.lines(["I scratch it with my house key. Lemon, cherry, cherry...", "...lemon. Of course. A dollar for a lesson in math.", "@a1_ali The lottery is a tax on people who can't do math. Welcome, friend."]);
    } },
    { text: "What's the deal with Smitty?", once: true, run: () => RP.lines(["@a1_ali Smitty? He sits on that stoop since before I bought the store.", "@a1_ali Always needs something delivered. I don't ask. Everybody on this block gets paid. That's all I know.", "@a1_ali Sal, he gets the good stuff. Sal doesn't complain."]) },
    { text: "Can I use your bathroom?", once: true, run: () => RP.lines(["@a1_ali Customers only.", "I'm a customer. I just bought... that thing.", "@a1_ali Then it's a customer's bathroom. Behind the milk. Don't touch the cat."]) },
    { text: "How do I make some money?", once: true, run: () => RP.lines(["@a1_ali Cans. The machine. A nickel apiece. The whole city's paying for its own recycling.", "@a1_ali There's bags on the curb by the scaffold. Take them. The canners are union but they're not that organized."]) },
    { text: "Never mind.", end: true }
  ]);
}

const ALI = { id: "a1_ali", char: "a1_ali", x: 530, y: 190, face: "front", act: "stand", name: "Ali" };
RP.room({
  id: "a1_bodega", act: 1, name: "Ali's Deli & Grocery",
  paint: paintBodega, light: lightBodega,
  cacheKey: S => A1.tod(S), lightKey: S => A1.tod(S),
  ambience: "room",
  walk: [[78, 212], [600, 212], [620, 250], [66, 250]],
  scale: [210, 0.97, 250, 1.03],
  start: { x: 78, y: 236, face: "right" },
  fx: [{ type: "dust", rect: [100, 20, 300, 140], count: 14, color: "#f4fff4" }],
  actors: [ALI],
  sprites: [
    { y: 200, draw: (c, S, t) => { /* the counter: top, front, register, cat (in front of Ali's legs) */
      A1.blit(c, A1.memo("bd_counter", 190, 62, cc => { PK.counter(cc, 5, 6, 180, 54, { top: "#b8a078", front: "#6a4a3a", seed: 77 }); }), 440, 138);
      A1.blit(c, A1.memo("bd_reg", 36, 40, cc => { PK.cashRegister(cc, 2, 12, {}); }), 480, 108);
      R(c, 540, 135, 22, 8, "#efeaf6"); R(c, 540, 135, 22, 1, "#fff"); txt(c, "TIPS", 544, 137, "#2f62b8");
      R(c, 566, 126, 14, 16, "#c8c4d8"); R(c, 566, 126, 14, 3, "#e8e4f4"); R(c, 568, 130, 10, 10, "#3a3a5a");
      R(c, 484, 140, 8, 3, "#ffd23f"); R(c, 495, 140, 8, 3, "#c0302c");
    } },
    { y: 201, draw: (c, S, t) => drawCat(c, 604, 144, t) },
    { y: 232, draw: c => A1.blit(c, B.rack(), 316, 184) },
    { y: 236, draw: c => A1.blit(c, B.water(), 132, 208) },
    { y: 245, draw: c => A1.blit(c, B.mop(), 604, 208) }
  ],
  enter: async (S, from) => { S.f.noTravel = false; },
  hotspots: [
    { id: "bdDoor", name: "door to the street", r: [0, 30, 60, 138], z: 30, walk: [74, 232, "left"], look: "The door to Jefferson Street. It has a bell. It's the most honest thing in here.",
      exit: S => ({ room: "a1_stoop", x: 182, y: 236, face: "front" }) },
    { id: "canmachine", name: "can-deposit machine", r: [64, 62, 62, 108], z: 30, walk: [96, 224, "back"],
      look: S => S.f.a1_cansDone ? "The reverse vending machine. Five cents a can. It's the only thing in New York that gives you money for garbage." : "A reverse vending machine. You feed it empties, it pays out five cents each. It's the best bank I know.",
      use: S => RP.has("cans") ? depositCans(S, "cans") : RP.has("cans2") ? depositCans(S, "cans2") : "It wants cans. All I'm holding is my breath and a bad feeling.",
      push: "I tap the machine. It says \"INSERT CANS.\" It's not a conversation.", pull: "It's bolted down. It's heavy with other people's regrets.", talk: "\"Thank you for recycling.\" It says that in a voice that's seen things.", open: "The hatch is locked. That's where they keep the money. And the smell." },
    { id: "coolers", name: "coolers", r: [132, 58, 160, 112], z: 20, walk: [212, 222, "back"], look: "Cold drinks. A bottle of water is $2. A can of beer is $1.50. The city is telling me which one I should be buying.", pickup: "Not without paying. Ali can see me in the mirror.", open: "The cooler door sticks. I'd need a dollar twenty-five, a coffee and a prayer.", use: "I'd buy something, but I've got $2.40 in cans, and the cans aren't mine.", push: "The glass is cold, and my wallet is colder." },
    { id: "shelves", name: "snack shelves", r: [298, 50, 128, 120], z: 20, walk: [362, 222, "back"], look: "Chips, candy, cereal, and something called \"Pickled Everything.\" Every bodega has one jar that no one has ever bought.", pickup: "Everything on this shelf costs more than the cans I came here with.", open: "They're shelves. They don't open. They hold.", push: "I resist the urge to topple the whole aisle." },
    { id: "menu", name: "deli menu", r: [442, 24, 164, 60], z: 12, walk: [520, 222, "back"], look: "BACON EGG & CHEESE, $4.50. COFFEE, $1.25. CHOPPED CHEESE, $7.00. The prices on this board haven't changed since 2019. Somebody's hiding a ghost price in the register." },
    { id: "lottoWall", name: "lotto wall", r: [440, 96, 190, 62], z: 14, walk: [560, 222, "back"], look: "Lottery tickets in every color. A wall of hope, priced to move.", pickup: "That's Ali's. I'd have to go through the cat first.", open: "The ticket case is locked. Hope is behind glass." },
    { id: "counter", name: "counter", r: [440, 142, 190, 58], z: 18, walk: [560, 226, "back"], look: "A deli counter. A register, a tip jar, a cat, and a man who knows all your business and none of your secrets.", use: "Ali's the guy to talk to.", pickup: "It's a counter. You don't pick up a counter. You lean on it and wait to be served.", open: "The counter doesn't open. The lottery wall does, with enough money.", push: "I lean. The counter holds. It's the city's bar." },
    { id: "register", name: "cash register", r: [480, 106, 34, 40], z: 28, walk: [500, 224, "back"], look: "The register's got a sticker: \"NO CREDIT UNDER $5.\" The universe has a floor, and so do I.", use: "I'd have to buy something, and I'd have to have something to buy it with.", open: "It's open for Ali. I'm just a customer.", pickup: "It's a cash register. It's the heart of the block.", push: "It dings. Not at me, but at the idea of me." },
    { id: "tipjar", name: "tip jar", r: [540, 132, 24, 12], z: 30, walk: [552, 224, "back"], look: "A tip jar labeled \"TIPS (FOR THE CAT).\" The cat does not appear to need money. The cat has everything.", pickup: "Stealing from a cat's jar. Wow. That's a new low, and it's only noon.", use: "I'd tip, but I'm broke. I have a nice thought, though. Does that count?" },
    { id: "mirror", name: "security mirror", r: [588, 44, 36, 36], z: 18, walk: [606, 222, "back"], look: "A convex security mirror. In it, I look like a very broke fish. I'm a very broke fish.", pickup: "It's bolted to the wall. And watching me.", push: "I nudge it. It reflects a slightly worse version of me.", talk: "\"Mirror, mirror...\" No. Nobody wants to hear that." },
    { id: "radio", name: "radio", r: [602, 108, 24, 24], z: 22, walk: [614, 222, "back"], look: "A little radio on a shelf. Salsa, softly. The kind of music that makes a bodega feel like a living room.", use: "I turn it up. Ali turns it down. We have an understanding.", pickup: "It's Ali's. Also I'd be tempted to remix it.", talk: "\"Testing, one two...\" Ali looks at me. I stop." },
    { id: "bdSigns", name: "signs", rects: [[308, 26, 74, 16], [388, 16, 44, 26], [138, 26, 64, 18], [208, 30, 58, 18]], z: 14, walk: [300, 222, "back"], look: "CAMERAS ON PREMISES. NO LOITERING. WE ACCEPT EBT. ICE COLD. A handful of signs that say \"we've seen you.\"" },
    { id: "rack", name: "chip rack", r: [314, 184, 38, 60], z: 26, walk: [366, 236, "left"], look: "A rack of chips in every color. Four dollars of salt per square inch.", pickup: "I'd rather not. Ali sees all. And so does the cat.", use: "A rack of chips? I only have cans, and those are tapped out.", push: "The rack wobbles. A bag of chips gives me a look. I steady it." },
    { id: "water", name: "water cases", r: [130, 206, 46, 36], z: 26, walk: [190, 238, "left"], look: "Cases of bottled water. A whole wall of refreshment at $5 a gallon. The city's got a river for free, for what it's worth.", pickup: "Those weigh forty pounds. I'm a DJ. My biggest lift is a milk crate of records.", push: "They're heavy. They're a pallet of dignity." },
    { id: "mop", name: "mop bucket", r: [602, 208, 24, 40], z: 26, walk: [588, 240, "right"], look: "A mop and a bucket. Together they say: someone cleans this floor. Sometimes.", pickup: "A mop in a bucket of old water. No thanks.", use: "I mop a little bit, to be helpful. Ali watches. Nothing changes. That's New York." },
    { id: "cat", name: "bodega cat", r: [588, 120, 40, 28], z: 40, walk: [588, 226, "back"],
      look: "The bodega cat. Her name's Cheese. She's the manager. She's been the manager since the last one left.",
      talk: "\"Hey, Cheese.\" She blinks very slowly. That's \"I accept your tribute.\"",
      pickup: "She watches me reach. I retract my hand. We don't have that kind of relationship.", use: S => RP.say("I pet the cat. She purrs like a mini-fridge and judges me like an aunt.", "kid"),
      push: "I nudge her. She stays where she is. She owns that counter.", open: "I'm not opening a cat. That's how you end up on the news.", pull: "I don't pull a cat's tail. Some things have consequences.",
      give: (S, item) => item === "a1_slice" ? "Cheese sniffs the slice, then gives me a look that says \"amateur.\" I keep it. It's for Tank." : "Cheese isn't interested. She's in a long-term relationship with the counter." }
  ],
  combos: [
    ["cans", "canmachine", async () => { const S = RP.state; await depositCans(S, "cans"); }],
    ["cans2", "canmachine", async () => { const S = RP.state; await depositCans(S, "cans2"); }],
    ["cans", "a1_ali", "\"No, no, no,\" Ali says. \"Machine. Machine's over there. I don't count cans.\""],
    ["cans2", "a1_ali", "\"No, no, no,\" Ali says. \"Machine. Machine's over there. I don't count cans.\""],
    ["a1_package", "a1_ali", "Ali looks at the package, then at me. \"That's not mine. Whatever it is, it's not mine.\""],
    ["a1_package", "canmachine", "The machine doesn't take packages. Only cans. And, I assume, grudges."],
    ["a1_slice", "a1_ali", "\"No pizza in my store,\" Ali says. \"That's disrespectful to my sandwiches.\""],
    ["a1_popcorn", "a1_ali", "Ali looks at the \"Linda\" bag. \"Not mine. That's an office bag. You're a long way from Midtown.\""],
    ["a1_slice", "canmachine", "The machine takes cans. It does not take pizza. It's stricter than the health department."],
    ["a1_flyer", "a1_ali", "Ali reads the flyer. \"DJ... what? Spelling is a skill, my friend.\""],
    ["a1_usb", "a1_ali", "\"No,\" Ali says. \"I'm not a computer store. I don't do USB.\""]
  ]
});
RP.rooms.a1_bodega.hotspots.push({ id: "a1_ali", name: "Ali", look: "Ali. He runs the bodega, the block, and most of the information on the block. Always a pencil behind the ear.",
  talk: S => aliTalk(S), use: "Ali's not a vending machine. Ali is better. He gives change.", pickup: "That's... a person. And he's busy.", push: "I push Ali. Ali does not move. He leans on the counter like it's a coworker.", open: "Ali doesn't open. Ali closes deals.", give: "Ali waves me off. \"I'm good. I'm working.\"" });
})();
