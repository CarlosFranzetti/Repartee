/* Act 1 — a1_sals: Sal's Pizzeria. Deliver Smitty's "package" (it's oregano). Sal pays $20 and a slice.
   Flags: a1_delivered, a1_peeked (set by the package), a1_sliceBought. */
(function () {
"use strict";
const RP = window.RP;
const A1 = RP.a1, PK = RP.PK;
const { R, P, ell, line, poly, bayer, mulberry, clamp, txt, txtW, txtC, mix, ramp, mk } = RP.u;
const U = PK.util;
const W = 640, FY = 166;

function maskedEllipse(c, cx, cy, rx, ry, paintFn) {
  const tmp = mk(rx * 2 + 2, ry * 2 + 2), t = tmp.getContext("2d");
  paintFn(t, rx + 1, ry + 1);
  for (let dy = -ry; dy <= ry; dy++) { const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry)))); c.drawImage(tmp, rx + 1 - hw, ry + 1 + dy, 2 * hw + 1, 1, cx - hw, cy + dy, 2 * hw + 1, 1); }
}

function oven(c, x, y) {
  /* brick dome oven, x..x+160, y..y+110 ; mouth with fire */
  const em = [], cx = x + 80, cy = y + 66;
  R(c, x + 62, y - 30, 36, 50, "#7a3a2a"); R(c, x + 62, y - 30, 36, 2, "#b8604a"); R(c, x + 62, y - 30, 2, 50, "#a8503a"); R(c, x + 96, y - 30, 2, 50, "#3a1a14");     /* chimney */
  for (let i = 0; i < 5; i++) R(c, x + 62, y - 24 + i * 8, 36, 1, "#4a2018");
  ell(c, cx, cy, 83, 59, "#1c0c0a"); ell(c, cx, cy, 82, 58, "#4a2018");
  maskedEllipse(c, cx, cy, 80, 56, (t, ox, oy) => { PK.brick(t, ox - 82, oy - 58, 164, 118, { base: "#bc6044", mortar: "#d8c8b0", worn: 0.4, seed: 91, bw: 11, bh: 5 }); });
  /* dome shading */
  U.dshade(c, x, y + 8, 160, 116, "#0c0618", (px, py) => { const dx = (px - cx) / 80, dy = (py - cy) / 56, r = Math.sqrt(dx * dx + dy * dy); return clamp((r - 0.55) / 0.45, 0, 1) * 1.3; }, 0.5);
  U.dshade(c, x + 20, y + 14, 60, 34, "#ffd890", (px, py) => { const dx = (px - (x + 50)) / 30, dy = (py - (y + 30)) / 16; return Math.max(0, 1 - dx * dx - dy * dy) * 1.2; }, 0.22);
  R(c, x - 6, y + 112, 172, 12, "#8a5a38"); R(c, x - 6, y + 112, 172, 1, "#c8905a"); R(c, x - 6, y + 122, 172, 2, "#3a2218");     /* hearth shelf */
  R(c, x + 6, y + 124, 148, 44, "#6a3a2a"); for (let r = 0; r < 4; r++) for (let k = 0; k < 8; k++) R(c, x + 8 + k * 18 + (r % 2) * 9, y + 126 + r * 10, 16, 8, ["#8a4a38", "#7a4030", "#9a5640"][(k + r) % 3]);
  /* mouth */
  ell(c, cx, y + 94, 34, 26, "#1a0c0a"); R(c, cx - 34, y + 94, 69, 18, "#1a0c0a");
  maskedEllipse(c, cx, y + 94, 30, 22, (t, ox, oy) => { U.gradient(t, ox - 32, oy - 24, 64, 48, [[0, "#ff6a1a"], [0.5, "#ffb030"], [1, "#fff0a0"]], 1, true); });
  R(c, cx - 30, y + 94, 61, 16, "#ffd860"); U.gradient(c, cx - 30, y + 94, 61, 16, [[0, "#ff9a30"], [1, "#fff0a0"]], 1, true);
  em.push([cx - 30, y + 74, 61, 36]);
  [[cx - 28, y + 74], [cx + 22, y + 76]].forEach(([px, py]) => { R(c, px, py, 6, 22, "#7a3a2a"); R(c, px, py, 1, 22, "#c8905a"); });
  R(c, cx - 36, y + 70, 74, 4, "#c8b8a0"); R(c, cx - 36, y + 70, 74, 1, "#fff6dc");        /* mouth arch trim */
  /* peel leaning on the oven */
  R(c, x + 150, y + 30, 3, 90, "#a87a48"); R(c, x + 150, y + 30, 1, 90, "#d8a868"); ell(c, x + 151, y + 26, 9, 8, "#a87a48"); ell(c, x + 151, y + 25, 8, 7, "#c89a60");
  txt(c, "SAL'S 1959", x + 52, y + 48, "#efeaf6", 1, 1);
  return em;
}
function display(c, x, y, w) {
  /* glass case of pies on the counter */
  const em = [];
  R(c, x, y - 34, w, 34, "#3a2a2a"); R(c, x + 3, y - 31, w - 6, 28, "#f8d890"); U.gradient(c, x + 3, y - 31, w - 6, 28, [[0, "#fff0c0"], [1, "#e8a860"]], 1, true); em.push([x + 3, y - 31, w - 6, 28]);
  R(c, x + 3, y - 12, w - 6, 3, "#c8c4d4"); R(c, x + 3, y - 12, w - 6, 1, "#fff");
  for (let i = 0; i < Math.floor((w - 10) / 30); i++) {
    const px = x + 17 + i * 30;
    ell(c, px, y - 20, 13, 4, "#e8a830"); ell(c, px, y - 21, 12, 3, "#f2c84a"); [[-6, 0], [-2, 1], [3, -1], [7, 1], [0, -2]].forEach(([dx, dy]) => ell(c, px + dx, y - 21 + dy, 1, 1, "#c0302c"));
    R(c, px - 1, y - 24, 1, 4, "#6a3a1a"); R(c, px + 3, y - 23, 1, 3, "#6a3a1a");
    ell(c, px, y - 7, 13, 3, "#e8a830"); ell(c, px, y - 8, 12, 2, "#f2c84a"); [[-6, 0], [3, 0], [8, 0]].forEach(([dx, dy]) => P(c, px + dx, y - 8 + dy, "#9a2a22"));
  }
  R(c, x, y - 34, w, 2, "#c8c4d4"); R(c, x, y - 34, w, 1, "#ffffff"); R(c, x, y - 2, w, 2, "#8a869c");
  U.dshade(c, x + 3, y - 31, w - 6, 28, "#ffffff", (px, py) => { const q = ((px - x) * 0.9 + (py - y) + 800) % 60; return q < 5 ? 1 : 0; }, 0.3);
  return em;
}

const B = {
  boxes: () => A1.memo("sl_boxes", 40, 46, c => { for (let i = 0; i < 5; i++) { const by = 36 - i * 8; R(c, 2 + (i % 2), by, 34, 8, i % 2 ? "#e8d8b8" : "#efe4c8"); R(c, 2 + (i % 2), by, 34, 1, "#fffaf0"); R(c, 2 + (i % 2), by + 7, 34, 1, "#a89870"); R(c, 14 + (i % 2), by, 10, 8, "#c0302c"); txt(c, "SAL", 15 + (i % 2), by + 2, "#fff6dc"); } U.dshade(c, 0, 42, 40, 4, "#000", () => 0.7, 0.35); }),
  table: () => A1.memo("sl_table", 76, 58, c => {
    PK.table(c, 4, 6, 68, 50, { round: false, color: "#8a5a3e", top: "#c0302c" });
    for (let x = 4; x < 72; x += 6) for (let y = 6; y < 18; y += 6) { R(c, x, y, 3, 3, "#efeaf6"); R(c, x + 3, y + 3, 3, 3, "#efeaf6"); }
    R(c, 28, 2, 12, 5, "#efeaf6"); R(c, 29, 3, 10, 1, "#c0302c"); R(c, 44, 3, 6, 4, "#ffd23f");                    /* napkins + shaker */
    ell(c, 22, 10, 6, 2, "#f4ece0"); ell(c, 22, 9, 5, 1, "#e8c84a");                                                  /* plate */
  }),
  stool: () => A1.memo("sl_stool", 26, 46, c => { PK.chair(c, 2, 2, { kind: "stool", color: "#c0302c" }); })
};

function paintSals(c, S) {
  const tod = A1.tod(S), night = tod === "night", em = [], rnd = mulberry(34);
  /* ---- walls ---- */
  PK.brick(c, 0, 0, W, 100, { base: "#823830", mortar: "#c8b8a8", worn: 0.35, seed: 92, bw: 14, bh: 6 });
  U.dshade(c, 0, 0, W, 24, "#140c24", (px, py) => 1 - py / 24, 0.5);
  PK.wallTiles(c, 0, 92, W, FY - 92, { base: "#efe6d0", grout: "#b8a890", size: 12, seed: 93 });
  R(c, 0, 90, W, 4, "#c0302c"); R(c, 0, 90, W, 1, "#ff6a5a"); R(c, 0, 93, W, 1, "#6a1410");
  R(c, 0, FY - 8, W, 8, "#2a1c20"); R(c, 0, FY - 8, W, 1, "#5a4048");
  /* ---- floor: black & white ---- */
  PK.tiles(c, 0, FY, W, 256 - FY, { a: "#e6e0d4", b: "#3a3440", checker: true, size: 32, horizonY: 96, vx: 320, grout: "#8a8480", seed: 94 });
  U.dshade(c, 0, FY, W, 90, "#3a2a18", (px, py) => 0.35, 0.2);
  /* ---- oven ---- */
  em.push.apply(em, oven(c, 250, 52));
  /* ---- left: door (exit) ---- */
  R(c, 0, 34, 62, 132, "#2a1c24"); R(c, 3, 38, 56, 128, night ? "#241a3a" : "#c8e8ff");
  U.gradient(c, 5, 40, 52, 124, night ? [[0, "#1a1236"], [1, "#5a3a58"]] : [[0, "#a8d0f8"], [1, "#fff0d0"]], 1, true);
  if (night) for (let i = 0; i < 3; i++) R(c, 10 + i * 16, 60 + (i % 2) * 14, 8, 10, ["#ffb04a", "#ff9ad5", "#ffd27a"][i]);
  else { R(c, 5, 100, 52, 64, "#8a8a98"); R(c, 10, 108, 18, 30, "#a85a44"); }
  R(c, 30, 38, 3, 128, "#c8c4d4"); R(c, 30, 38, 1, 128, "#fff"); R(c, 3, 94, 56, 3, "#c8c4d4"); R(c, 3, 162, 56, 4, "#8a869c");
  em.push([5, 40, 52, 54]);
  U.dshade(c, 3, 38, 56, 128, "#ffffff", (px, py) => { const q = ((px - 3) * 0.9 + (py - 38) + 600) % 70; return q < 5 ? 1 : 0; }, 0.14);
  R(c, 10, 70, 28, 9, "#c0302c"); txt(c, "OPEN", 15, 72, "#fff6dc");
  /* ---- wall decor ---- */
  [[78, 20, "#2a2a3a"], [100, 16, "#3a2a2a"]].forEach(([fx, fy, col], i) => { PK.frame(c, fx + i * 18, fy + 6 - i * 4, 22, 28, { color: "#6a4a30", kind: ["portrait", "landscape"][i], seed: 95 + i }); });
  PK.frame(c, 140, 22, 40, 30, { color: "#a07a48", kind: "landscape", seed: 98 });
  PK.clock(c, 196, 16, { d: 22, hour: 10, min: 10, color: "#3a2a2a" });
  R(c, 410, 16, 80, 56, "#1a1210"); R(c, 411, 17, 78, 54, "#2a1c18");
  txt(c, "SLICES", 428, 21, "#ffd23f", 1, 1);
  [["PLAIN", "1.50"], ["PEPPERONI", "2.00"], ["WHITE", "2.50"], ["SICILIAN", "3.00"]].forEach(([n, p], i) => { txt(c, n, 415, 31 + i * 8, "#efeaf6"); txt(c, p, 470, 31 + i * 8, "#ffd23f"); });
  R(c, 420, 56, 60, 10, "#c0302c"); txtC(c, "WHOLE PIE $15", 450, 59, "#fff6dc", 1);
  R(c, 220, 10, 6, 40, "#a87a48"); for (let i = 0; i < 5; i++) { ell(c, 223, 14 + i * 7, 4, 3, i % 2 ? "#c0302c" : "#e8a830"); }    /* hanging peppers/garlic */
  /* ---- right: counter back wall + fridge ---- */
  R(c, 520, 96, 110, 70, "#cfd4e0"); R(c, 520, 96, 110, 2, "#fff"); R(c, 628, 96, 2, 70, "#7a8094");
  R(c, 524, 102, 48, 60, "#1a2230"); U.gradient(c, 524, 102, 48, 60, [[0, "#cfe8ff"], [1, "#8ab8e0"]], 1, true); em.push([524, 102, 48, 60]);
  for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) { const col = ["#c0302c", "#3a8ad8", "#e8a020", "#3fa66a", "#efeaf6", "#8a4ad8"][(r + k) % 6]; R(c, 528 + k * 7, 108 + r * 18, 5, 12, col); R(c, 528 + k * 7, 108 + r * 18, 5, 1, mix(col, "#fff", 0.5)); }
  R(c, 576, 102, 48, 60, "#2a3040"); U.gradient(c, 576, 102, 48, 60, [[0, "#3a4258"], [1, "#1a2030"]], 1, true);
  R(c, 580, 106, 40, 10, "#c0302c"); txt(c, "DRINKS", 590, 109, "#fff6dc");
  em.push([580, 106, 40, 10]);
  /* sign over the door side */
  R(c, 70, 66, 120, 20, "#efeaf6"); txtC(c, "NO SLICE SHARING", 130, 68, "#c0302c", 1); txtC(c, "NO COMMENTS ON THE CRUST", 130, 76, "#3a3a4a", 1);
  return em;
}

function lightSals(S) {
  const night = A1.tod(S) === "night";
  return {
    ambient: "#8c6a78",
    lights: [
      { x: 325, y: 150, r: 260, color: "#ff9a40", steps: 5, sy: 1.1, power: 0.9 },
      { x: 150, y: 20, r: 220, color: "#ffe2b0", steps: 4, sy: 1.2, power: 0.8 },
      { x: 520, y: 20, r: 240, color: "#ffe2b0", steps: 4, sy: 1.2, power: 0.8 },
      { box: [4, 40, 54, 122], r: 80, color: night ? "#ffb04a" : "#fff6e8", steps: 3, power: night ? 0.5 : 0.8 }
    ],
    halos: [{ x: 325, y: 142, r: 36, color: "#ff9a30", strength: 1 }],
    key: { x: 325, y: 120 }, shadow: 0.6, rims: [{ x: 325, y: 150, r: 220, color: "#ff9a40" }]
  };
}

function drawSals(c, S, t) {
  /* fire in the oven mouth */
  const cx = 330, y0 = 146;
  for (let i = 0; i < 22; i++) {
    const ph = t / 160 + i * 1.7, fx = cx - 26 + (i * 53 % 52), h = 8 + Math.round(Math.sin(ph) * 4 + 5), col = i % 3 === 0 ? "#fff0a0" : i % 3 === 1 ? "#ffb030" : "#ff6a1a";
    R(c, fx, y0 + 16 - h, 2, h, col);
  }
  /* pendant bulbs */
  [150, 520, 330].forEach((bx, i) => { const y = i === 2 ? 22 : 14; R(c, bx, 0, 1, y, "#2a2020"); ell(c, bx, y + 2, 3, 3, "#fff6d8"); });
}

/* ---------- Sal and the package ---------- */
async function deliver(S) {
  RP.take("a1_package"); S.f.a1_delivered = true;
  await RP.lines(["Smitty sent me. I've got a package.", "@a1_sal Finally! Smitty. That man's logistics make the MTA look good."]);
  RP.actor("a1_sal").expr = "worried";
  await RP.say("You didn't peek, did you?", "a1_sal");
  const i = await RP.choose(["Of course not.", "...A little."]);
  RP.actor("a1_sal").expr = null;
  if (i === 0 && S.f.a1_peeked) await RP.lines(["Of course not.", "@a1_sal Liar. The corner's torn. Everybody peeks. Nobody ever finds it interesting.", "@a1_sal Oregano. Two pounds. Smitty's cousin grows it in Queens. Don't ask me why Smitty's weird about it."]);
  else if (i === 0) await RP.lines(["Of course not.", "@a1_sal Good kid. It's just oregano. Smitty's cousin grows it in Queens.", "...Oregano.", "@a1_sal What did you think it was?", "...Oregano. Obviously."]);
  else await RP.lines(["...A little.", "@a1_sal Honest! I respect honest. Oregano. Two pounds. Smitty's cousin grows it in Queens.", "@a1_sal Smitty's got a thing about drama. It's a spice. It's a very dramatic spice."]);
  RP.give("a1_slice"); RP.money(20);
  await RP.lines(["@a1_sal Twenty bucks. And a slice. Pepperoni. On the house.", "@a1_sal Don't tell the other kids. I only do this for the quiet ones.", "I now have twenty dollars and a slice. For a Wednesday, that's a dream."]);
  S.f.a1_delivered = true;
  if (S.money < 14) await RP.say("That's real money. Fares, records, rent-ish. Let's go be useful.");
}
async function buySlice(S) {
  if (RP.has("a1_slice")) { await RP.say("@a1_sal You've got one in your hand, kid. Eat it or marry it.", "a1_sal"); return; }
  if (!RP.canAfford(1.5)) { await RP.say("@a1_sal A dollar fifty. That's the price. I don't make the rules, the rent does.", "a1_sal"); return; }
  RP.money(-1.5); RP.give("a1_slice"); S.f.a1_sliceBought = true;
  await RP.lines(["@a1_sal Pepperoni. Fold it. Don't hold it like a leaf.", "A hot slice for a dollar fifty. The last honest thing in New York."]);
}
async function salTalk(S) {
  await RP.convo([
    { text: "Smitty sent me.", when: S => RP.has("a1_package"), run: async () => { await deliver(S); return "end"; } },
    { text: "Can I get a slice?", when: S => !RP.has("a1_slice"), run: () => buySlice(S) },
    { text: "Got any work?", when: S => !S.f.a1_delivered && !RP.has("a1_package"), once: true, run: () => RP.lines(["@a1_sal Work? Ask Smitty. He's got a thing. He always has a thing.", "@a1_sal Tell him Sal says it's overdue."]) },
    { text: "How's business?", once: true, run: () => RP.lines(["@a1_sal It's pizza. Business is the same as it was in 1959. Good. Slow. Salty.", "@a1_sal Someone's always hungry. That's my retirement plan."]) },
    { text: "What's the secret to the crust?", once: true, run: () => RP.lines(["@a1_sal The water. The yeast. Three days in the fridge. And not talking to it, like those new places do.", "@a1_sal Also oregano. Always oregano. Never run out of oregano."]) },
    { text: "Do you know a guy called Tank?", when: S => S.f.a1_booked, once: true, run: () => RP.lines(["@a1_sal Tank? From Nowhere? Big guy. Shades.", "@a1_sal Grabs a pepperoni before every Saturday shift. Folds it perfect. Never says a word.", "@a1_sal I respect that. If you need him happy, you know where to find a slice."]) },
    { text: "Thanks, Sal.", end: true }
  ]);
}

const SAL = { id: "a1_sal", char: "a1_sal", x: 614, y: 190, face: "front", act: "stand", name: "Sal" };
RP.room({
  id: "a1_sals", act: 1, name: "Sal's Pizzeria",
  paint: paintSals, draw: drawSals, light: lightSals,
  cacheKey: S => A1.tod(S), lightKey: S => A1.tod(S),
  ambience: "room",
  walk: [[78, 212], [600, 212], [620, 250], [66, 250]],
  scale: [210, 0.97, 250, 1.03],
  start: { x: 74, y: 236, face: "right" },
  fx: [{ type: "smoke", x: 330, y: 52, rise: 40, size: 12, drift: 4, color: "#8a7a78", count: 6, speed: 0.4 }, { type: "dust", rect: [200, 30, 260, 120], count: 14, color: "#ffd890" }],
  actors: [SAL],
  sprites: [
    { y: 200, draw: (c, S, t) => {
      A1.blit(c, A1.memo("sl_counter", 220, 66, cc => { PK.counter(cc, 5, 12, 210, 50, { top: "#d8c8a8", front: "#a03a2a", seed: 96 }); }), 420, 138);
      const dd = A1.memo("sl_display", 112, 40, cc => display(cc, 0, 38, 112)); A1.blit(c, dd, 478, 112);
      A1.blit(c, A1.memo("sl_reg", 36, 40, cc => { PK.cashRegister(cc, 2, 12, {}); }), 436, 114);
      R(c, 594, 140, 12, 10, "#c8c4d8"); R(c, 594, 140, 12, 2, "#e8e4f4"); R(c, 596, 143, 8, 6, "#3a3a5a"); R(c, 597, 144, 6, 1, "#ffd23f");
    } },
    { y: 236, draw: c => A1.blit(c, B.table(), 90, 188) },
    { y: 244, draw: c => A1.blit(c, B.table(), 190, 196) },
    { y: 246, draw: c => A1.blit(c, B.stool(), 410, 206) },
    { y: 246, draw: c => A1.blit(c, B.stool(), 440, 206) },
    { y: 244, draw: c => A1.blit(c, B.boxes(), 600, 210) }
  ],
  enter: async (S, from) => { S.f.noTravel = false; },
  hotspots: [
    { id: "slDoor", name: "door to the street", r: [0, 34, 62, 132], z: 30, walk: [74, 232, "left"], look: "The door to Jefferson Street. Behind it, the world. In here, cheese.", exit: S => ({ room: "a1_stoop", x: 596, y: 236, face: "front" }) },
    { id: "oven", name: "brick oven", r: [244, 22, 172, 150], z: 20, walk: [326, 224, "back"], look: "A brick oven older than my landlord's bad habits. Hot enough to make you forgive everything.", pickup: "I'd have to be a pizza. Or a lunatic.", use: "It's wood-fired and I'm not licensed. Sal might let me. Sal would not.", open: "It's open. It's always open. It's a mouth.", push: "I push the oven. The oven is unmoved. The oven is the one thing in New York that is not afraid of heat.", pull: "The door's already open. The fire's on the inside." },
    { id: "display", name: "pie display", r: [476, 112, 116, 40], z: 24, walk: [530, 224, "back"], look: "Pies under glass: plain, pepperoni, and a white pie with something green on it. The slices are the size of a New Yorker's expectations.", open: "I'd have to ask Sal. And pay.", pickup: "Through the glass? I'd fail the heist.", push: "I tap the glass. A pepperoni jiggles. I look like a toddler at an aquarium." },
    { id: "slCounter", name: "counter", r: [420, 142, 220, 56], z: 18, walk: [560, 226, "back"], look: "The counter: white tile, steel, and the grease of a thousand slices. The best seat in the house is on the other side.", pickup: "It's a counter.", use: "Sal's the guy to talk to.", push: "It's a counter. It doesn't push back, but the stool might." },
    { id: "slRegister", name: "cash register", r: [434, 112, 40, 40], z: 28, walk: [454, 224, "back"], look: "Sal's register. It's older than I am and has a better memory than I do. It rings like a bell in a church.", use: "I have no money to give it.", pickup: "It's a register. It's the pizza's heart.", open: "Sal opens it. I just watch.", push: "It dings. It's a good sound." },
    { id: "slTip", name: "tip jar", r: [592, 138, 16, 14], z: 30, walk: [584, 224, "back"], look: "A tip jar. The label says \"COLLEGE FUND.\" Sal's three kids are in their forties.", pickup: "I'm not stealing from a college fund. Especially a forty-year-old's.", use: "I'd tip, but I'm rich in only one resource: regret." },
    { id: "slMenu", name: "slice menu", r: [408, 14, 84, 58], z: 14, walk: [450, 222, "back"], look: "SLICES: PLAIN 1.50, PEPPERONI 2.00, WHITE 2.50, SICILIAN 3.00. WHOLE PIE $15. The math says a whole pie is cheaper than eight slices. The math is a trap and I've fallen." },
    { id: "slFridge", name: "drinks fridge", r: [518, 94, 114, 74], z: 14, walk: [570, 224, "back"], look: "A fridge of sodas. Every bodega and every pizzeria in New York has the same fridge. It's one fridge. It's a clone.", open: "I'd need a dollar and a half for a soda. I'm saving it for the slice.", pickup: "I'd need to be the same person who got that fridge into this room." },
    { id: "slTable1", name: "table", r: [90, 188, 70, 52], z: 24, walk: [124, 244, "back"], look: "A red-and-white checked table. A shaker of oregano, a stack of napkins and a stain I've decided is the shape of Italy.", use: "I'll sit when I have time. It's a Wednesday. I don't have time.", pickup: "It's bolted to the floor. As is everything in a pizzeria.", push: "It slides an inch. A shaker rattles. Sal glares from across the room." },
    { id: "slTable2", name: "table", r: [190, 196, 70, 52], z: 24, walk: [226, 246, "back"], look: "Another checked table. Someone left a crust on a plate. A holy relic.", use: "I'll sit when the world stops. It's not stopping.", pickup: "Bolted down. I have no more energy for fights with furniture." },
    { id: "stools", name: "counter stools", rects: [[408, 206, 28, 44], [438, 206, 28, 44]], z: 26, walk: [424, 248, "back"], look: "Counter stools. Red vinyl, split at the seam, held together with tape and loyalty.", use: "I'd sit, but I've got places to be.", pickup: "They're screwed to the floor. That's rule #1 of NYC furniture.", push: "It spins. It's a small ride. I have one second of joy." },
    { id: "slBoxes", name: "pizza boxes", r: [598, 210, 44, 46], z: 28, walk: [586, 240, "right"], look: "A tower of pizza boxes. It's like a skyscraper for hungry people.", pickup: "A pizza box? Without a pizza? That's cruelty.", open: "Empty. Cardboard. A sad thought.", push: "I push the tower. It leans. I stop. It's not worth the lawsuit." },
    { id: "slFrames", name: "photos", r: [76, 14, 110, 44], z: 14, walk: [130, 222, "back"], look: "Photos of the old neighborhood: a barber shop, a kid on a stoop, and a man in a paper hat who's definitely Sal's dad. The hat's a family heirloom." },
    { id: "slClock", name: "clock", r: [194, 14, 26, 26], z: 14, walk: [210, 222, "back"], look: "A clock stuck at ten past ten since 1994. Sal says it's right twice a day. Sal doesn't say which times.", pickup: "I'd lose the time. And my hand. Mostly the hand." },
    { id: "slSign", name: "sign", r: [68, 64, 124, 24], z: 14, walk: [130, 222, "back"], look: "NO SLICE SHARING. NO COMMENTS ON THE CRUST. The two commandments of a pizzeria." },
    { id: "slPeppers", name: "hanging peppers", r: [214, 10, 18, 44], z: 12, walk: [224, 222, "back"], look: "Dried peppers and garlic hanging from the ceiling. Hospitality, with a side of vampire repellent.", pickup: "Those are decorative. And expired. And Sal's grandmother's." },
    { id: "slPeel", name: "pizza peel", r: [398, 78, 12, 94], z: 22, walk: [388, 224, "back"], look: "A long wooden pizza peel. It's the only paddle I've ever respected.", pickup: "It's Sal's. He'd chase me out of the block with it.", use: "I'd flip a pie and put it all over the floor. I'm not qualified." }
  ],
  combos: [
    ["a1_package", "a1_sal", () => deliver(RP.state)],
    ["a1_slice", "a1_sal", "\"That's yours,\" Sal says. \"I gave it to you. It's not a returns policy.\""],
    ["cans", "a1_sal", "Sal sighs. \"Cans, kid? I don't do bottles. Go to the bodega.\""],
    ["cans2", "a1_sal", "Sal sighs. \"Cans, kid? I don't do bottles. Go to the bodega.\""],
    ["a1_popcorn", "a1_sal", "Sal looks at the popcorn. \"I make pizza. Not appetizers.\""],
    ["a1_slice", "oven", "I'm not feeding the oven. The oven's already well fed."],
    ["a1_package", "oven", "Oregano in a wood-fired oven? Sal would kill me, or worse, laugh."]
  ]
});
RP.rooms.a1_sals.hotspots.push({ id: "a1_sal", name: "Sal", look: "Sal. Apron, mustache, paper hat, and opinions about everything that happens within three blocks of his oven.",
  talk: S => salTalk(S), use: "Sal's not a vending machine. He's a pizzaiolo. He'd say it like that.", pickup: "Sal is not a thing you pick up. Sal is a thing that happens to you.", push: "Sal does not move. He is a fixed point in the Bushwick universe.", open: "Sal opens for business. That's all that opens.",
  give: "Sal waves it off. \"I got everything. Except patience.\"" });
})();
