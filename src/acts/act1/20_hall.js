/* Act 1 — a1_hall: the 4th-floor hallway. Stairs down (left), 4A, Lou's door 4B, the airshaft
   window, the notice board, and the door to 4C (the bedroom). */
(function () {
"use strict";
const RP = window.RP;
const A1 = RP.a1, PK = RP.PK;
const { R, P, ell, line, poly, bayer, mulberry, clamp, txt, txtW, txtC, mix, ramp } = RP.u;
const U = PK.util;
const W = 640;

const FLOOR_Y = 168;
const DOOR_4A = { x: 164, y: 58, w: 50, h: 110 }, DOOR_4B = { x: 278, y: 58, w: 50, h: 110 }, DOOR_4C = { x: 556, y: 58, w: 50, h: 110 };
const WIN_H = { x: 362, y: 54, w: 70, h: 72 };

function peel(c, x, y, w, h, col, seed) {
  const r = mulberry(seed);
  for (let i = 0; i < w * h / 22; i++) {
    const px = x + r() * w | 0, py = y + r() * h | 0;
    if (((px - x) / w - 0.5) ** 2 + ((py - y) / h - 0.5) ** 2 > 0.25) continue;
    R(c, px, py, 1 + r() * 3 | 0, 1, col);
  }
}

function paintHall(c, S) {
  const tod = A1.tod(S), night = tod === "night", em = [], rnd = mulberry(20);
  /* ---- walls ---- */
  PK.plaster(c, 0, 0, W, 112, { base: "#a3b09a", seed: 11, patches: 3, stains: 3, cracks: 2 });
  PK.plaster(c, 0, 104, W, 66, { base: "#3d5c50", seed: 12, patches: 0, stains: 0, cracks: 1 });
  U.dshade(c, 0, 0, W, 30, "#140c24", (px, py) => (1 - py / 30) * 0.9, 0.55);                               /* ceiling gloom */
  R(c, 0, 0, W, 6, "#3a2c3a"); R(c, 0, 6, W, 1, "#5a4a5a"); R(c, 0, 7, W, 2, "#6a5a68");              /* crown */
  peel(c, 20, 60, 40, 30, "#d8a8a0", 3); peel(c, 520, 20, 60, 30, "#d8a8a0", 4); peel(c, 330, 130, 40, 22, "#8a9a7a", 5);
  /* chair rail + wainscot */
  R(c, 0, 102, W, 4, "#6a4a32"); R(c, 0, 102, W, 1, "#a07a52"); R(c, 0, 105, W, 1, "#2a1a14");
  R(c, 0, FLOOR_Y - 10, W, 10, "#2a1c20"); R(c, 0, FLOOR_Y - 10, W, 1, "#5a4048"); R(c, 0, FLOOR_Y - 1, W, 1, "#140c10");
  for (let x = 6; x < W; x += 30) R(c, x, 118, 1, 36, "#34504a");                                         /* beadboard */
  U.dshade(c, 0, 106, W, 50, "#0c0618", (px, py) => (py - 106) / 50 * 0.6, 0.35);
  /* ---- floor ---- */
  PK.tiles(c, 0, FLOOR_Y, W, 256 - FLOOR_Y, { a: "#b8ac92", b: "#8e7e74", checker: true, size: 26, horizonY: 96, vx: 320, grout: "#5a4a48", seed: 21 });
  /* worn path in the middle, a runner of old linoleum shine */
  U.dshade(c, 150, 190, 420, 54, "#ffffff", (px, py) => 0.2 + Math.sin(px / 40) * 0.06, 0.07);
  /* ---- stairwell opening (left) ---- */
  const sx0 = 6, sw = 148;
  R(c, sx0, 18, sw, FLOOR_Y - 18, "#150c1e");
  PK.brick(c, sx0 + 2, 20, sw - 4, FLOOR_Y - 22, { base: "#4a3040", mortar: "#4a4050", worn: 0.6, seed: 31 });
  U.dshade(c, sx0, 18, sw, FLOOR_Y - 18, "#0c0618", (px, py) => 0.35 + (py - 18) / 150 * 0.4, 0.62);
  /* the next flight: stringer, treads, underside */
  const sa = [sx0 + 10, FLOOR_Y - 4], sb = [sx0 + sw - 8, 54];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12, px = Math.round(sa[0] + (sb[0] - sa[0]) * t), py = Math.round(sa[1] + (sb[1] - sa[1]) * t);
    R(c, px - 14, py, 18, 3, "#6a5468"); R(c, px - 14, py, 18, 1, "#9a7a90"); R(c, px - 14, py + 3, 18, 4, "#1c1224");
  }
  line(c, sa[0] - 14, sa[1] + 8, sb[0] - 14, sb[1] + 8, "#2a1c34"); line(c, sa[0] - 14, sa[1] + 9, sb[0] - 14, sb[1] + 9, "#140c1c");
  /* light from the landing below */
  U.dshade(c, sx0, 100, sw, 70, "#ffb060", (px, py) => (py - 100) / 70 * (1 - Math.abs(px - 80) / 110), 0.34);
  /* floor number stencil */
  txt(c, "4", 61, 37, "#0c0618", 6, 6); txt(c, "4", 60, 36, "#d8d0c0", 6, 6);
  /* banister: rail, balusters, newel */
  R(c, sx0, 124, sw + 6, 4, "#8a5a38"); R(c, sx0, 124, sw + 6, 1, "#c8905a"); R(c, sx0, 127, sw + 6, 1, "#3a2218");
  for (let x = sx0 + 6; x < sx0 + sw; x += 7) { R(c, x, 128, 2, FLOOR_Y - 130, "#1c1626"); R(c, x, 128, 1, FLOOR_Y - 130, "#4a4262"); }
  R(c, sx0, FLOOR_Y - 4, sw + 6, 4, "#3a2a30"); R(c, sx0, FLOOR_Y - 4, sw + 6, 1, "#6a5058");
  R(c, sx0 + sw, 112, 8, FLOOR_Y - 106, "#6a4228"); R(c, sx0 + sw, 112, 8, 2, "#c8905a"); R(c, sx0 + sw, 112, 1, FLOOR_Y - 106, "#a8784a"); ell(c, sx0 + sw + 4, 109, 4, 3, "#8a5a38"); P(c, sx0 + sw + 2, 108, "#d8a070");
  /* ---- doors ---- */
  const d4a = PK.door(c, DOOR_4A.x, DOOR_4A.y, DOOR_4A.w, DOOR_4A.h, { color: "#6a5646", frame: "#4a3a30", panels: 4, number: "4A", seed: 41 });
  [66, 80].forEach(ly => { R(c, DOOR_4A.x + 38, DOOR_4A.y + ly, 7, 4, "#c8b070"); P(c, DOOR_4A.x + 39, DOOR_4A.y + ly, "#fff0b0"); });
  R(c, DOOR_4A.x + 10, DOOR_4A.y + 54, 28, 1, "#cfc8b8");                                                  /* police lock bar */
  R(c, DOOR_4A.x + 8, DOOR_4A.y + 92, 34, 10, "#d8b060"); txt(c, "NO FLYERS", DOOR_4A.x + 10, DOOR_4A.y + 95, "#3a2410");
  PK.door(c, DOOR_4B.x, DOOR_4B.y, DOOR_4B.w, DOOR_4B.h, { color: "#7a5a3c", frame: "#4a3626", panels: 4, number: "4B", seed: 42 });
  R(c, DOOR_4B.x + 38, DOOR_4B.y + 50, 6, 3, "#c8c8d0"); R(c, DOOR_4B.x + 38, DOOR_4B.y + 50, 6, 1, "#fff");                   /* chain */
  for (let i = 0; i < 5; i++) P(c, DOOR_4B.x + 34 - i * 2, DOOR_4B.y + 52 + (i % 2), "#8a8aa0");
  R(c, DOOR_4B.x + 12, DOOR_4B.y + 92, 26, 8, "#e8e0cc"); txt(c, "LOU", DOOR_4B.x + 18, DOOR_4B.y + 94, "#3a1c1c");       /* hand-lettered tag */
  PK.door(c, DOOR_4C.x, DOOR_4C.y, DOOR_4C.w, DOOR_4C.h, { color: "#6a4a5e", frame: "#3e2c3c", panels: 4, number: "4C", hingeRight: false, seed: 43 });
  ell(c, DOOR_4C.x + 36, DOOR_4C.y + 62, 5, 5, "#ffd23f"); P(c, DOOR_4C.x + 34, DOOR_4C.y + 61, "#1d1622"); P(c, DOOR_4C.x + 38, DOOR_4C.y + 61, "#1d1622"); R(c, DOOR_4C.x + 34, DOOR_4C.y + 64, 5, 1, "#1d1622");  /* smiley sticker, same as inside */
  /* door shadows on the floor + light seeping under 4B (TV) */
  [DOOR_4A, DOOR_4B, DOOR_4C].forEach(d => U.dshade(c, d.x - 4, FLOOR_Y, d.w + 8, 10, "#0c0618", (px, py) => 1 - (py - FLOOR_Y) / 10, 0.4));
  R(c, DOOR_4B.x + 3, FLOOR_Y - 2, DOOR_4B.w - 6, 2, "#9fc2ff"); em.push([DOOR_4B.x + 3, FLOOR_Y - 2, DOOR_4B.w - 6, 2]);
  U.dshade(c, DOOR_4B.x - 2, FLOOR_Y, DOOR_4B.w + 4, 22, "#7aa8ff", (px, py) => (1 - (py - FLOOR_Y) / 22) * 0.9, 0.35);
  /* doormats */
  R(c, DOOR_4B.x + 2, FLOOR_Y + 8, 46, 12, "#6a4a30"); R(c, DOOR_4B.x + 2, FLOOR_Y + 8, 46, 1, "#9a7448"); txtC(c, "WELCOME", DOOR_4B.x + 25, FLOOR_Y + 12, "#d8c090");
  R(c, DOOR_4C.x + 4, FLOOR_Y + 8, 42, 11, "#3a3a4a"); R(c, DOOR_4C.x + 4, FLOOR_Y + 8, 42, 1, "#5a5a6a"); txtC(c, "GO AWAY", DOOR_4C.x + 25, FLOOR_Y + 11, "#8a86a0");
  /* shoes outside 4A (the tenant has never been seen, but the shoes are real) */
  R(c, DOOR_4A.x + 6, FLOOR_Y + 6, 12, 5, "#3a2418"); R(c, DOOR_4A.x + 6, FLOOR_Y + 6, 12, 1, "#6a4a30"); R(c, DOOR_4A.x + 22, FLOOR_Y + 7, 12, 5, "#3a2418"); R(c, DOOR_4A.x + 22, FLOOR_Y + 7, 12, 1, "#6a4a30");
  /* packages that go in and never come out */
  [[170, 152, 22, 16, "#b8844e"], [194, 156, 18, 12, "#a8743e"], [176, 140, 16, 12, "#c8945e"]].forEach(([bx, by, bw, bh, col]) => {
    R(c, bx, by, bw, bh, col); R(c, bx, by, bw, 2, mix(col, "#ffffff", 0.3)); R(c, bx + bw - 2, by, 2, bh, mix(col, "#0c0618", 0.3)); R(c, bx, by + bh - 1, bw, 1, mix(col, "#0c0618", 0.45));
    R(c, bx + bw / 2 - 1, by, 2, bh, "#d8c8a0"); R(c, bx + 3, by + 4, 6, 4, "#f4f0e8");
  });
  /* ---- bike chained to the wall ---- */
  PK.bike(c, 222, 138, { color: "#c0302c" });
  R(c, 218, 140, 2, 24, "#5a566c"); P(c, 218, 140, "#9a96ac");                                          /* chain post */
  for (let i = 0; i < 7; i++) P(c, 220 + i * 2, 146 + (i % 2), "#8a869c");
  /* ---- airshaft window + radiator + pipe ---- */
  em.push.apply(em, PK.window(c, WIN_H.x, WIN_H.y, WIN_H.w, WIN_H.h, { view: "airshaft", time: night ? "night" : "day", frame: "#9a8e84", frameW: 3, seed: 51, sill: "#b8aca0" }));
  PK.radiator(c, 368, 132, 58, 32, { color: "#b4aeb8" });
  PK.pipe(c, 446, 9, 160, { dir: "v", r: 4, color: "#7a7288", joint: 52 });
  /* ---- fire extinguisher box, notice board, mail ---- */
  R(c, 462, 96, 30, 44, "#7a1a1a"); R(c, 462, 96, 30, 1, "#e85a4a"); R(c, 462, 139, 30, 1, "#3a0a0a"); R(c, 464, 98, 26, 40, "#2a0e12");
  U.gradient(c, 466, 100, 18, 36, [[0, "#a8c8d8"], [1, "#5a7a8a"]], 1, true);
  R(c, 470, 106, 10, 28, "#c0302c"); R(c, 470, 106, 10, 1, "#ff8a7a"); R(c, 472, 100, 6, 7, "#1c1626"); R(c, 466, 102, 3, 2, "#c8c4d8");
  txt(c, "FIRE", 474, 90, "#e8e4f0");
  R(c, 464, 126, 14, 7, "#efeaf6"); txt(c, "2009", 465, 127, "#3a2a2a");                                      /* inspection tag */
  R(c, 506, 56, 58, 46, "#6a4a30"); R(c, 507, 57, 56, 44, "#b88a5a");
  for (let i = 0; i < 160; i++) P(c, 508 + rnd() * 54 | 0, 58 + rnd() * 42 | 0, i % 2 ? "#a8784a" : "#c89a68");
  R(c, 511, 60, 24, 18, "#efeaf6"); txt(c, "NOTICE", 513, 62, "#c0302c"); txt(c, "HEAT: DEC", 512, 68, "#3a3a4a"); txt(c, "MAYBE", 512, 73, "#3a3a4a");
  R(c, 538, 62, 14, 20, "#ffd23f"); txt(c, "LOST", 540, 64, "#3a2a1a"); txt(c, "CAT", 541, 70, "#3a2a1a"); R(c, 540, 76, 10, 4, "#8a5a2a");
  R(c, 512, 82, 18, 14, "#1b1440"); ell(c, 521, 87, 3, 3, "#ff3fa4"); R(c, 514, 92, 14, 1, "#39d0ff");                 /* NOWHERE flyer */
  R(c, 534, 86, 20, 11, "#c0302c"); txt(c, "PIZZA", 536, 89, "#ffd23f");
  [[509, 58], [561, 58], [509, 99], [561, 99]].forEach(([px, py]) => P(c, px, py, "#c8c8d0"));
  U.dshade(c, 506, 102, 58, 6, "#0c0618", (px, py) => 1 - (py - 102) / 6, 0.4);
  /* mail for former tenants on the floor + takeout menus */
  R(c, 506, 212, 14, 8, "#e8e0cc"); R(c, 509, 214, 14, 8, "#efeaf6"); R(c, 506, 212, 14, 1, "#c8c0a8"); R(c, 511, 217, 8, 1, "#9a96a8");
  R(c, 120, 226, 11, 7, "#d8ccb0"); R(c, 124, 228, 6, 1, "#c0302c");
  /* ---- ceiling bulb, smoke detector ---- */
  R(c, 319, 9, 2, 12, "#1a1620"); R(c, 316, 20, 8, 4, "#4a4658"); R(c, 316, 20, 8, 1, "#8a869c");
  R(c, 372, 10, 14, 5, "#d8d4e4"); R(c, 372, 10, 14, 1, "#fff"); R(c, 372, 14, 14, 1, "#8a869c");
  /* wall details: outlet, wires, grime */
  R(c, 232, 148, 8, 11, "#e8e4f0"); R(c, 234, 150, 1, 3, "#55506a"); R(c, 237, 150, 1, 3, "#55506a"); R(c, 234, 154, 1, 3, "#55506a"); R(c, 237, 154, 1, 3, "#55506a");
  for (let i = 0; i < 60; i++) P(c, 236 + i, 41 + Math.round(Math.sin(i / 7) * 2), "#2a2434");
  for (let i = 0; i < 40; i++) P(c, 12 + rnd() * 600 | 0, 112 + rnd() * 50 | 0, "#1c2a28");
  return em;
}

function lightHall(S) {
  const tod = A1.tod(S), night = tod === "night";
  return {
    ambient: "#5d4c6a",
    lights: [
      { x: 320, y: 24, r: 290, color: "#ffe2b0", steps: 5, sy: 1.35 },
      { x: 78, y: 150, r: 130, color: "#ff9a50", steps: 3, power: 0.7 },
      { box: [WIN_H.x + 4, WIN_H.y + 4, WIN_H.w - 8, WIN_H.h - 8], r: 70, color: night ? "#6a5ca8" : "#a8c0ff", steps: 3 },
      { box: [DOOR_4B.x, FLOOR_Y - 4, DOOR_4B.w, 4], r: 50, color: "#7aa8ff", steps: 2, power: 0.6 }
    ],
    halos: [{ x: 320, y: 22, r: 22, color: "#ffb060", strength: 1 }],
    key: { x: 320, y: 30 }, shadow: 0.55
  };
}

function drawHall(c, S, t) {
  /* flickering bulb */
  const f = A1.flick(t, 90, 3), dim = f < 6;
  ell(c, 320, 27, 4, 5, dim ? "#c8a878" : "#fff4d6"); R(c, 318, 25, 1, 2, "#ffffff");
  /* smoke detector LED */
  if (Math.floor(t / 1000) % 3 === 0) R(c, 378, 12, 2, 1, "#ff3a3a");
  /* TV flicker under 4B */
  const g = A1.flick(t, 140, 9);
  R(c, DOOR_4B.x + 3, FLOOR_Y - 2, DOOR_4B.w - 6, 2, g < 30 ? "#cfe0ff" : g < 60 ? "#7a98e0" : "#9fc2ff");
}

function drawFrontHall(c) {
  /* newel post + handrail in the foreground (the kid walks behind it) */
  R(c, 0, 80, 20, 176, "#2a1a14"); R(c, 0, 80, 3, 176, "#5a3a28"); R(c, 17, 80, 3, 176, "#140a08");
  R(c, 0, 80, 20, 3, "#8a5a38"); R(c, 0, 80, 20, 1, "#c8905a"); ell(c, 10, 78, 8, 4, "#6a4228"); R(c, 6, 74, 4, 2, "#a8784a");
  U.dshade(c, 20, 80, 14, 176, "#0c0618", (px, py) => 1 - (px - 20) / 14, 0.5);
}

/* Lou, through the door of 4B */
async function louDoor(S) {
  RP.sfx("knock");
  await RP.wait(500);
  const t = S.f.time;
  if (t === "sat") {
    await RP.lines(["@loudoor WHO IS IT.", "Me. Heading out. Nowhere, tonight.", "@loudoor Go. Don't be late. Fashionably late is just late with a haircut.", "@loudoor And kid? Turn it UP for once."]);
    return;
  }
  if (!S.f.a1_louHall) {
    S.f.a1_louHall = true;
    await RP.lines([
      "@loudoor WHO IS IT.", "Me, Lou. 4C. I got a gig.",
      "@loudoor The saxophone kid. ...A gig where?",
      "Nowhere. Saturday, ten PM. I open.",
      "@loudoor Nowhere. In my day that was a laundromat. Same dryers, worse music.",
      "@loudoor Opener, huh? Nobody dances at ten. Not even in 1993. Start soft. Let the room come to you.",
      "@loudoor Then give 'em something to chew on. And keep the good stuff for after they've earned it."
    ]);
    return;
  }
  const lines = [
    ["@loudoor WHAT.", "Nothing, Lou. Just knocking.", "@loudoor Then stop. A man gets one saxophone a night, and you're burning mine."],
    ["@loudoor Bill Withers is on. Is this about Bill?", "No, Lou.", "@loudoor Then it's not important."],
    ["@loudoor I'm in the middle of the part with the sax solo.", "Sorry.", "@loudoor Sorry doesn't pay the rent. Ask me how I know."]
  ];
  await RP.lines(lines[(S.f.a1_louKnocks = (S.f.a1_louKnocks || 0) + 1) % 3]);
}

RP.room({
  id: "a1_hall", act: 1, name: "4th floor hallway",
  paint: paintHall, draw: drawHall, drawFront: drawFrontHall, light: lightHall,
  cacheKey: S => A1.tod(S), lightKey: S => A1.tod(S),
  ambience: "room",
  walk: [[34, 208], [610, 208], [622, 252], [26, 252]],
  scale: [206, 0.96, 252, 1.03],
  start: { x: 566, y: 232, face: "left" },
  fx: [{ type: "dust", rect: [250, 30, 150, 130], count: 26, color: "#fff4d6" }],
  enter: async (S, from) => {
    S.f.noTravel = true;
    if (from === "bedroom" && !S.f.a1_hallSeen) { S.f.a1_hallSeen = true; await RP.lines(["The hallway. Smells like six different dinners and one regret.", "Stairs on the left, Lou's door in the middle, the rest of the world downstairs."]); }
  },
  hotspots: [
    { id: "stairs", name: "stairs down", r: [8, 26, 146, 148], z: 20, walk: [104, 228, "left"],
      look: "The stairs down to the stoop. Four flights, one flickering light, and a smell I'd describe as \"old soup.\"",
      exit: S => ({ room: "a1_stoop", x: 350, y: 238, face: "front" }),
      push: "I push the railing. The railing says \"not today.\"", pull: "The banister wobbles. It's been wobbling since 2011. It's load-bearing, probably." },
    { id: "door4a", name: "door 4A", r: [160, 56, 58, 114], z: 20, walk: [190, 226, "back"],
      look: "4A. Two deadbolts, a police bar, a NO FLYERS sign. Nobody's ever seen the tenant. Packages go in. Nothing comes out.",
      open: "Locked. Locked-locked. Three kinds of locked.", push: "The door doesn't move. It's seen things.", pull: "I'd need a crowbar. And a lawyer.", talk: "Hello? ...It's fine. I didn't expect an answer.", pickup: "It's a door. I'd need a hand truck and a death wish." },
    { id: "door4b", name: "door 4B (Lou)", r: [274, 56, 58, 114], z: 20, walk: [304, 226, "back"],
      look: "4B. Lou's. A chain, a peephole and a smell of stew that's been simmering since the Clinton administration.",
      talk: S => louDoor(S), push: S => louDoor(S), use: S => louDoor(S), open: "It's locked. And with Lou behind it, I'd call that a favor.", pull: S => louDoor(S),
      give: (S, item) => item === "rec_mom" ? "Lou already has Winelight. He's not giving me any of it back." : "Lou didn't ask for that. Lou never asks for anything. Lou demands." },
    { id: "mat4b", name: "WELCOME mat", r: [278, 174, 54, 16], z: 12, floor: true, walk: [304, 232, "back"], look: "A WELCOME mat at Lou's door. It's a lie. It's the only lie Lou has ever told.", pickup: "It's nailed down. By the smell, so is everything in this hallway." },
    { id: "airshaft", name: "airshaft window", r: [356, 48, 82, 84], z: 20, walk: [396, 218, "back"],
      look: S => A1.tod(S) === "night" ? "The airshaft. Brick, a clothesline, and somebody else's lit kitchen. A national park of privacy violations." : "The airshaft window. A brick wall, a clothesline and somebody else's lit kitchen.",
      open: "It's painted shut. By someone who loved me, I assume, or hated drafts.", close: "It's already closed. It's always been closed.", push: "It won't budge. It's painted shut.", pickup: "That's not a thing you pick up. It's a hole with ideas." },
    { id: "hallrad", name: "radiator", r: [364, 130, 66, 36], z: 24, walk: [396, 222, "back"], look: "A radiator, painted eleven times, by eleven different landlords. It's off. It's always off. It's decorative now.", use: "It's October. Heat comes in December. Allegedly.", push: "It's bolted down. The building would literally have to fall down first." },
    { id: "pipe", name: "pipe", r: [442, 8, 12, 160], z: 12, walk: [446, 222, "back"], look: "A pipe. It carries the sound of everyone's showers to everyone else's bedroom.", pickup: "It's the building's spine. I'd rather not." },
    { id: "extinguisher", name: "fire extinguisher", r: [460, 90, 34, 52], z: 22, walk: [476, 222, "back"], look: "FIRE EXTINGUISHER. Inspected 2009. A decorative fire department.",
      pickup: "I'm not stealing the fire extinguisher. I only steal what I need. Right now I need less fire.", use: "No fires today. I'll let you know.", open: "The glass says \"break in case of emergency.\" My whole life is an emergency, but not that kind.", pull: "The pin's still in. Nobody's tested it since the Obama administration." },
    { id: "board", name: "notice board", r: [504, 54, 62, 52], z: 22, walk: [536, 222, "back"],
      look: "A cork board. Heat will be restored December 1st (maybe), a missing cat named Biscuit, a PIZZA coupon, and a flyer for Nowhere that says \"DJ ???\". One day it'll have my name. Spelled right.",
      pickup: "Taking the flyer feels like tempting fate. The coupon, maybe.", talk: "No one's pinned a response yet." },
    { id: "bike", name: "chained bike", r: [218, 136, 52, 36], z: 21, walk: [244, 224, "back"], look: "Somebody's bike, chained to the pipe. A flat front tire and a lock worth more than the bike. A New York love story.", pickup: "It's chained to the wall. It's more committed than I am.", use: "I can't ride. I took a bus to my own birthday once." },
    { id: "mail", name: "mail pile", r: [502, 208, 26, 18], z: 12, floor: true, walk: [520, 230, "back"], look: "Mail for people who moved out in 2019. The building keeps them like hostages.", pickup: "Nope. Federal offense. And boring." },
    { id: "hallbulb", name: "light bulb", r: [308, 6, 24, 30], z: 18, walk: [320, 222, "back"], look: "A bare bulb on a cord. It flickers whenever somebody upstairs runs a microwave. Somebody upstairs is always running a microwave.", pull: "It's on the ceiling. I'm tall, not ceiling-tall.", pickup: "Ceilings: 1. Me: 0." },
    { id: "door4c", name: "door 4C (home)", r: [552, 56, 58, 114], z: 20, walk: [578, 228, "right"],
      look: "4C. My door. The lock sticks. The rent sticks harder.",
      exit: S => ({ room: "bedroom", x: 585, y: 228, face: "left" }) }
  ],
  combos: [
    ["a1_flyer", "board", "I could pin the flyer up. I'd rather keep proof that I'm on one."],
    ["a1_package", "door4a", "4A's mail slot is sealed shut. Smitty's package isn't for them, either way."],
    ["a1_slice", "door4b", "Lou doesn't eat pizza at midnight. He says \"I'm 76, not a college kid.\""]
  ]
});
})();
