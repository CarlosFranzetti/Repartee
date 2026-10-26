/* Act 5 — a5_backstage: the artist compound behind the main stage (scrolling, 960 wide).
   Catering (Axl's smoothie), your trailer (the star on the door says the wrong name), Axl's gold trailer, Roz and the running order,
   the artist lounge with three real-DJ cameos (nods only), and the stairs to the wings at the east end. */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u, PK = RP.PK, A5 = RP.a5, art = A5.art, I = RP.icons;
const { R, P, ell, line, poly, bayer, mulberry, mix, txt, txtC, txtW, clamp } = U;
const K = U.ramp;
const HL = (c, x, y, w, col) => R(c, x, y, w, 1, col), VL = (c, x, y, h, col) => R(c, x, y, 1, h, col);
const W = 960;
const night = S => (S.f.a5_phase || 0) >= 2;
const ph = S => S.f.a5_phase || 0;

const HOLES = [[28, 122, 150, 88], [196, 126, 140, 76], [352, 112, 214, 90], [588, 122, 108, 82], [706, 128, 118, 76], [800, 12, 160, 142]];

function paint(c, S) {
  const em = [], nt = night(S), time = nt ? "night" : "day";
  em.push.apply(em, art.harbor(c, { x: 0, w: W, horizon: 112, skyH: 56, time, seed: nt ? 25 : 24, bottom: 138, bridge: { x: 30, w: 300, h: 34 }, spire: true,
    sun: nt ? undefined : { x: 80, y: 70, r: 8 }, clouds: nt ? false : 4, moon: nt ? { x: 560, y: 28, r: 7 } : false, holes: HOLES,
    lights: nt ? [{ x: 120, color: "#ffd27a", a: 0.7, w: 2 }, { x: 300, color: "#ff9ad5", a: 0.7, w: 2 }, { x: 520, color: "#9fe8ff", a: 0.6, w: 3 }] : null }));
  /* the compound: asphalt, a chain-link fence with a windscreen along the water */
  PK.asphalt(c, 0, 138, W, 118, { base: nt ? "#2a2640" : "#4a4660", seed: 6 });
  PK.speckle(c, 0, 138, W, 118, [nt ? "#4a4668" : "#8a86a0", nt ? "#14101e" : "#2a2838"], 0.04, 33);
  R(c, 0, 128, 800, 12, nt ? "#14101e" : "#2a2640"); HL(c, 0, 128, 800, nt ? "#3a3658" : "#6a667c");
  for (let x = 0; x < 800; x += 3) VL(c, x, 128, 12, (x / 3) % 2 ? mix("#2a2640", "#6a667c", 0.2) : "#14101e");
  for (let x = 6; x < 800; x += 60) { R(c, x, 120, 3, 22, "#8a86a0"); VL(c, x, 120, 22, "#e8e4f4"); }
  R(c, 0, 120, 800, 2, "#8a86a0"); HL(c, 0, 120, 800, "#e8e4f4");
  /* painted lines + cable runs */
  for (let x = 0; x < W; x += 36) R(c, x, 246, 18, 2, nt ? "#8a7a20" : "#c8b020");
  for (let i = 0; i < 520; i++) P(c, 40 + i, 232 + Math.round(Math.sin(i / 20) * 4), "#17131f");
  art.cableRamp(c, 420, 238, 60); art.cableRamp(c, 600, 242, 44);
  /* the main stage, back view, filling the east end */
  em.push.apply(em, (function () {
    const x = 800, y = 12, w = 160, h = 142, cloth = nt ? "#0c0a14" : "#2a2838";
    R(c, x + 6, y + 22, w - 8, h - 22, cloth);
    for (let px = x + 6; px < x + w; px += 4) VL(c, px, y + 22, h - 22, (px / 4) % 2 ? mix(cloth, "#000000", 0.35) : mix(cloth, "#6a667c", 0.18));
    art.trussV(c, x + 2, y + 12, h - 12, 8);
    const tr = PK.truss(c, x - 6, y + 4, w + 8, 14, { color: "#8a889c" });
    art.lineArray(c, x + 18, y + 22, 8, 20, { color: "#1c1a24", ch: 8 }); art.lineArray(c, x + 110, y + 22, 8, 20, { color: "#1c1a24", ch: 8 });
    txtC(c, "MAIN STAGE", x + 82, y + 70, nt ? "#39d0ff" : "#c8c4d8", 2, 1);
    /* black steel steps up to the wings + a rail */
    for (let i = 0; i < 7; i++) { R(c, x + 10, y + h - 6 - i * 8, 56 - i * 4, 6, i % 2 ? "#2a2838" : "#34304a"); HL(c, x + 10, y + h - 6 - i * 8, 56 - i * 4, "#8a86a0"); }
    R(c, x + 6, y + h - 60, 2, 56, "#8a86a0"); R(c, x + 6, y + h - 60, 40, 2, "#8a86a0");
    R(c, x + 72, y + 98, 58, 20, "#c0302c"); txtC(c, "STAGE LEFT", x + 101, y + 102, "#ffffff", 1, 1); txtC(c, "CREW + ARTISTS", x + 101, y + 109, "#ffffff", 1, 1);
    return tr;
  })());
  /* catering tent */
  art.popTent(c, 28, 122, 150, 88, { color: "#f4f0e8", stripe: "#9be15d", panels: 8, inside: "#1c1426" });
  R(c, 50, 154, 106, 12, "#17131f"); txtC(c, "CATERING", 103, 157, "#9be15d", 1, 1);
  /* your trailer (white, a star on the door) */
  em.push.apply(em, art.trailer(c, 196, 130, 140, 76, { color: "#e8e4f0", stripe: "#ff3fa4", name: "ARTIST 1", doorX: 0.62, lit: nt, windows: [[0.1, 0.16, 28, 14]] }));
  ell(c, 273, 166, 9, 9, "#ffd23f"); poly(c, [[273, 157], [275, 163], [281, 163], [276, 167], [278, 173], [273, 169], [268, 173], [270, 167], [265, 163], [271, 163]], "#c8901c");
  /* Axl's gold trailer: bigger, ridiculous */
  em.push.apply(em, art.trailer(c, 354, 112, 212, 94, { color: "#d8b040", stripe: "#ff3fa4", name: "AXL VANTA", nameBg: "#17131f", nameColor: "#ffd23f", doorX: 0.5, lit: true, doorColor: "#f4e8b0", windows: [[0.07, 0.16, 36, 16], [0.7, 0.16, 36, 16]] }));
  em.push.apply(em, PK.neon(c, "AXL", 428, 102, "#ffd23f", { scale: 2, tube: 2 }));
  /* production office */
  em.push.apply(em, art.trailer(c, 588, 124, 108, 80, { color: "#e8e4f0", stripe: "#39d0ff", name: "PRODUCTION", doorX: 0.55, lit: true, windows: [[0.1, 0.18, 24, 14]] }));
  /* the artist lounge: a open-sided white tent, lit */
  art.popTent(c, 706, 128, 118, 76, { color: "#f4f0e8", stripe: "#a05cff", panels: 6, inside: "#241a34" });
  const sl = art.stringLights(c, 190, 96, 520, 82, { sag: 12, step: 6, colors: ["#ffd27a", "#ff9ad5", "#9fe8ff"] });
  if (nt) em.push.apply(em, sl);
  art.litter(c, 10, 216, 780, 32, 17);
  return em;
}

/* props that characters pass in front of */
function drawCateringTable(c, S) {
  PK.table(c, 44, 178, 124, 38, { color: "#8a5a3e", top: "#e8e0cc" });
  /* trays of food, an urn, a stack of cups */
  [[54, "#c8925a"], [76, "#9a4a2a"], [98, "#6ab83a"], [120, "#e0a030"]].forEach(([tx, tc]) => { R(c, tx, 170, 18, 6, "#a8a4b8"); HL(c, tx, 170, 18, "#e8e4f4"); R(c, tx + 1, 166, 16, 5, tc); HL(c, tx + 1, 166, 16, mix(tc, "#ffffff", 0.35)); });
  R(c, 142, 156, 14, 20, "#8a86a0"); R(c, 142, 156, 14, 3, "#e8e4f4"); R(c, 154, 164, 5, 2, "#c0302c"); VL(c, 143, 158, 16, "#c8c4d8");
  /* the lone smoothie */
  if (!S.f.a5_smoothie) { R(c, 38, 160, 8, 15, "#9be15d"); R(c, 38, 160, 8, 2, "#cfffa8"); R(c, 37, 158, 10, 2, "#efeaf6"); R(c, 42, 152, 2, 6, "#c0302c"); R(c, 39, 166, 6, 4, "#f4f0e8"); }
}
function drawRedCarpet(c, S) {
  /* red carpet at Axl's door, velvet ropes, two potted palms */
  poly(c, [[444, 206], [490, 206], [504, 232], [430, 232]], "#8a1a2a"); poly(c, [[448, 208], [486, 208], [496, 230], [438, 230]], "#c0302c");
  [[420, 214], [506, 214]].forEach(([px, py]) => { R(c, px, py - 20, 3, 22, "#c8a860"); ell(c, px + 1, py - 21, 3, 3, "#ffd23f"); });
  for (let i = 0; i < 14; i++) { P(c, 424 + i * 6, 196 + Math.round(Math.sin(i / 2) * 3), "#c0302c"); P(c, 424 + i * 6, 197 + Math.round(Math.sin(i / 2) * 3), "#8a1a2a"); }
  PK.plant(c, 392, 182, { size: 2, color: "#3a8a4a", seed: 12 }); PK.plant(c, 522, 182, { size: 2, color: "#3a8a4a", seed: 13 });
}
function drawBoard(c, S) {
  /* the running order, on an easel by the production office */
  R(c, 702 - 52, 150, 2, 66, "#6a667c"); R(c, 700 - 4, 150, 2, 66, "#6a667c");
  R(c, 618, 136, 70, 64, "#e8e4e0"); R(c, 616, 134, 74, 68, "#8a86a0"); R(c, 618, 136, 70, 64, "#f4f0e8");
  txtC(c, "MAIN STAGE", 653, 140, "#c0302c", 1, 1); HL(c, 622, 147, 62, "#c0302c");
  const nm = A5.pName(S).toUpperCase();
  [["6:00 DOORS", "#1d1622"], ["7:00 THE BILL", "#1d1622"], ["(SEE POSTER)", "#6a667c"], ["10:15 AXL VANTA", "#c0302c"], ["11:45 " + (RP.has("a5_pass") && !S.f.a5_passFixed ? A5.mangle(nm).replace(/^DJ /, "") : nm.replace(/^DJ /, "")), "#2f62b8"], ["1:30 SUNRISE", "#6a667c"]].forEach(([t, col], i) => txt(c, t.length > 17 ? t.slice(0, 17) : t, 621, 151 + i * 7, col, 1, 1));
}
function drawCases(c, S) {
  art.roadCase(c, 340, 188, 28, 26, { label: "FOH", wheels: true }); art.roadCase(c, 342, 164, 24, 24, { label: "CABLES" }); art.roadCase(c, 334, 210, 30, 22, { label: "A-RIG", wheels: true, sticker: "#ffd23f" });
  art.roadCase(c, 570, 196, 30, 24, { label: "LIGHTS", wheels: true }); art.roadCase(c, 704, 200, 26, 22, { label: "BACKLINE", wheels: true, sticker: "#39d0ff" });
}
function drawLoungeFurniture(c, S) {
  PK.couch(c, 712, 168, 106, { color: "#4a2a7a", seed: 6 });
  R(c, 718, 154, 12, 10, "#ff3fa4"); R(c, 800, 154, 12, 10, "#39d0ff");
  PK.table(c, 756, 196, 30, 22, { color: "#5a3a2a", top: "#8a6a4a" }); R(c, 764, 192, 6, 6, "#efeaf6"); R(c, 774, 192, 6, 6, "#efeaf6");
}

function lightMap(S) {
  if (night(S)) return { ambient: "#54487e", lights: [
    { x: 460, y: 140, r: 200, color: "#ffd890", steps: 4, power: 0.95, rim: true }, { x: 260, y: 150, r: 130, color: "#ffd890", steps: 3, power: 0.6 },
    { x: 640, y: 150, r: 130, color: "#9fe8ff", steps: 4, power: 0.7 }, { x: 760, y: 140, r: 170, color: "#c8a0ff", steps: 4, power: 0.7 },
    { x: 100, y: 150, r: 140, color: "#cfffb0", steps: 3, power: 0.6 }, { x: 880, y: 70, r: 330, color: "#ff3fa4", steps: 4, power: 0.6, rim: true }],
    halos: [{ x: 460, y: 112, r: 26, color: "#ffd23f", strength: 1 }], key: { x: 880, y: 70 }, shadow: 0.6 };
  return { ambient: "#e0cab8", lights: [{ x: 80, y: 30, r: 900, color: "#fff0d0", steps: 3, power: 0.5 }], key: { x: 80, y: 30 }, shadow: 0.5 };
}

/* ---------------------------------------------------------------------------------------- scripts */
async function rozTalk(S) {
  const p = ph(S);
  if (!S.f.a5_rozMet) {
    S.f.a5_rozMet = true;
    RP.setClock("SAT 3:40 PM");
    await RP.lines([
      "@a5_roz You're the headliner. Roz. Stage manager. I run everything that isn't on fire. Don't make me add fire.",
      "@a5_roz Soundcheck's at four, main stage. Wings are east, past the steps. Mo's on the desk. He talks through the talkback. Don't be rude to Mo.",
      "@a5_roz And you're on my board as \"DJ " + A5.mangle(A5.pName(S)).replace(/^DJ /, "") + "\". Is that right?",
      "It's... close.",
      "@a5_roz Close. Fine. I'm calling you \"Headliner.\" It's easier."
    ]);
    return;
  }
  if (p === 0) { await RP.lines(["@a5_roz Four o'clock. Main stage. Through the wings. Don't touch anything that has a cable. Everything has a cable."]); return; }
  if (p === 1) {
    if (!S.f.a5_axlAsked) {
      S.f.a5_axlAsked = true;
      await RP.lines([
        "@a5_roz Soundcheck went fine. Mo's smiling, which is weather. Anyway.",
        "@a5_roz Axl's agent emailed. They want a swap: you at nine, him at midnight. \"Streaming numbers.\"",
        "@a5_roz I said it's not my call. Whit said \"synergy.\" That's the entire conversation we've had in the last hour.",
        "@a5_roz He's in the gold trailer. Don't go in empty-handed. He doesn't open the door without a green smoothie. It's in catering."
      ]);
      RP.text("MARGO (MGR)", "Axl wants to swap slots. DON'T agree. Go see him. Bring his smoothie (catering). Be kind, be firm, be fast.", false);
      return;
    }
    await RP.lines(["@a5_roz Gold trailer. Smoothie from catering. The door doesn't open without it. And it doesn't open twice."]); return;
  }
  if (p === 2) { await RP.lines(["@a5_roz Axl's on at ten-fifteen. You've got the wings at eleven-fifteen. Stay warm. Stay hydrated. Stay out of my way."]); return; }
  await RP.lines(["@a5_roz Wings. Now. I'll explain on the way."]);
}
async function catererTalk(S) {
  if (!S.f.a5_smoothie) {
    if (!S.f.a5_axlAsked) { await RP.lines(["@a5_caterer Help yourself. Pasta, sandwiches, fruit. Artists eat free. It's the one time in your life.", "(There's a green smoothie at the end with a label. I don't want to touch it. It's labeled AXL.)"]); return; }
    await RP.lines(["@a5_caterer That's his. Axl's. Green, no ice, no seeds. He's rung the bell nine times. Take it, please, and go.", "@a5_caterer Tell him it's \"fresh.\" It's not. It's from yesterday, but with a different label."]);
    RP.give("a5_smoothie"); S.f.a5_smoothie = true; RP.sfx("pickup"); RP.refreshInv();
    await RP.say("The caterer pushes the smoothie into my hands. It's cold. It's green. It's judging me.");
    return;
  }
  await RP.lines(["@a5_caterer Go! The door's the gold one. You can't miss it. You could see it from space."]);
}
async function axlDoor(S) {
  if (S.f.a5_axlDone) { await RP.say("The gold door's closed. Axl's in there, being himself in private."); return; }
  if (!S.f.a5_axlAsked) { await RP.lines(["A gold door with a plaque that says AXL VANTA — DO NOT KNOCK.", "(I should talk to Roz first. And bring something.)"]); return; }
  if (!RP.has("a5_smoothie")) {
    RP.sfx("knock");
    await RP.lines(["I knock.", "@a5_axlDoor IS THAT MY SMOOTHIE?", "Not yet.", "@a5_axlDoor THEN WHY ARE YOU KNOCKING?", "(Fair. I need the smoothie. Catering.)"]);
    return;
  }
  RP.sfx("knock");
  await RP.lines(["I knock, with the smoothie in view of the peephole.", "@a5_axlDoor ...Smoothie?", "Green. No ice, no seeds.", "@a5_axlDoor Enter. Don't make eye contact."]);
  await RP.goto("a5_axl", 120, 232, "right");
}
async function ownTrailer(S) {
  await RP.lines([
    "ARTIST 1. A white trailer with a gold star on the door. There's a laminated sign: \"DJ " + A5.mangle(A5.pName(S)).replace(/^DJ /, "") + ".\"",
    "Wrong. Of course it's wrong. But there's a star. And that's a first."
  ]);
}
async function cameo(S, who) {
  if (who === "vega") await RP.lines(["@a5_dj_louie_vega Have a great set.", "I nod back so hard my coat moves."]);
  else if (who === "spinna") await RP.lines(["@a5_dj_spinna Have a great set.", "I give him a thumbs up. It's the only gesture I know."]);
  else await RP.lines(["@a5_dj_francois_k Have a great set.", "I nod. I try to nod like a person, not like a bobblehead."]);
}
async function louArrives(S) {
  S.f.a5_louArrived = true;
  RP.setClock("SAT 10:30 PM");
  await RP.lines([
    "@marcus WE'RE HERE! I brought Lou! I brought the good cardigan!",
    "@a5_lou ...It's loud.",
    "Lou! You came.",
    "@a5_lou I said I'd consider. I considered. Here I am. Don't make it a thing.",
    "@a5_lou ...The cardigan's navy. Do you like it?",
    "It's perfect.",
    "@a5_lou Where do I sit? I don't stand. I'm sixty... some.",
    "@marcus Lou's with me. We got the best chair in the VIP lounge. It has a cushion. He asked for a cushion.",
    "@a5_roz Lou, you can watch from the wings. Stage left. There's a stool. It's the best seat in the house.",
    "@a5_lou In the wings. With a stool. All right.",
    "@marcus I counted: twelve people came in. TWELVE. Plus thirty is just a state of mind."
  ]);
  RP.text("MARGO (MGR)", "Lou's in. Marcus is a hero. Axl's still on stage. Roz will cue you in the wings. Breathe.", false);
}

/* ---------------------------------------------------------------------------------------- room */
RP.room({
  id: "a5_backstage", act: 5, name: "Harbor Lights — Backstage", width: W,
  paint, cacheKey: S => (night(S) ? "n" : "d") + (RP.has("a5_pass") && !S.f.a5_passFixed ? "p" : "f"), light: lightMap, lightKey: S => (night(S) ? "n" : "d"), ambience: "festival",
  walk: [[8, 222], [952, 222], [952, 252], [8, 252]],
  start: { x: 40, y: 232, face: "right" },
  fx: [
    { type: "beams", origins: [[860, 150], [900, 150], [940, 150]], colors: ["#ff9ad5", "#9fe8ff", "#ffd8a0"], base: -Math.PI / 2, swing: 0.55, len: 150, width: 8, alpha: 0.13, period: 2000, on: () => night(RP.state) },
    { type: "dust", rect: [780, 60, 170, 100], count: 14, color: "#ffe9d0", on: () => night(RP.state) }
  ],
  actors: S => [
    { id: "a5_caterer", char: "a5_caterer", x: 100, y: 188, face: "front", act: "stand", name: "Catering" },
    { id: "a5_roz", char: "a5_roz", x: 672, y: 238, face: "left", act: "stand", name: "Roz" },
    { id: "a5_dj_louie_vega", char: "a5_dj_louie_vega", x: 738, y: 207, face: "right", act: "stand", name: "Louie Vega" },
    { id: "a5_dj_spinna", char: "a5_dj_spinna", x: 778, y: 212, face: "front", act: "stand", name: "DJ Spinna" },
    { id: "a5_dj_francois_k", char: "a5_dj_francois_k", x: 808, y: 207, face: "left", act: "stand", name: "Francois K" },
    { id: "a5_tech1", char: "a5_tech1", x: 300, y: 242, face: "right", act: "stand", name: "Roadie" },
    { id: "a5_tech2", char: "a5_tech2", x: 560, y: 240, face: "left", act: "stand", name: "Crew" },
    { id: "lou", char: "lou", x: 700, y: 232, face: "front", act: "stand", name: "Lou", vis: S2 => !!S2.f.a5_louArrived },
    { id: "marcus", char: "marcus", x: 626, y: 240, face: "left", act: "stand", name: "Marcus", vis: S2 => !!S2.f.a5_louArrived }
  ],
  sprites: [
    { y: 220, draw: art.sprite((c, S) => drawCateringTable(c, S), S => !!S.f.a5_smoothie) },
    { y: 232, draw: art.sprite((c, S) => drawRedCarpet(c, S)) },
    { y: 230, draw: art.sprite((c, S) => drawBoard(c, S), S => (RP.has("a5_pass") && !S.f.a5_passFixed ? "p" : "f") + A5.pName(S)) },
    { y: 233, draw: art.sprite((c, S) => drawCases(c, S)) },
    { y: 219, draw: art.sprite((c, S) => drawLoungeFurniture(c, S)) }
  ],
  hotspots: [
    { id: "a5_bwest", name: "back to the grounds", r: [0, 120, 24, 134], z: 25, walk: [12, 232, "left"], look: "West: the gate, Gloria, the lawn and the rest of the festival. I've got a stage to get to. And a pass I'd like to keep.", exit: { room: "a5_grounds", x: 800, y: 234, face: "left" } },
    { id: "a5_bcater", name: "catering tent", r: [26, 120, 154, 92], z: 15, walk: [100, 236, "back"], look: "CATERING. A tent with trays of pasta, sandwiches and a coffee urn the size of a person. Artists eat free. I intend to take advantage until it hurts.", pickup: "I load a plate in my head. In real life my hands are shaking.", use: "I can't eat. My stomach has become a subwoofer." },
    { id: "a5_btable", name: "catering table", r: [42, 150, 128, 66], z: 30, walk: [100, 232, "back"], look: S => S.f.a5_smoothie ? "A table full of trays and a coffee urn. One empty spot where Axl's smoothie used to be." : "A long table: pasta, wraps, fruit, a coffee urn. At the end, a lone green smoothie, labeled AXL. It seems to be glaring at me.", pickup: S => catererTalk(S), use: S => catererTalk(S) },
    { id: "a5_bsmoothie", name: "green smoothie", r: [36, 150, 14, 28], z: 50, vis: S => !S.f.a5_smoothie, walk: [60, 232, "back"], look: "A tall green smoothie labeled AXL V. — NO ICE, NO SEEDS, NO EYE CONTACT. It's the angriest beverage I've ever seen.", pickup: S => catererTalk(S), use: S => catererTalk(S) },
    { id: "a5_caterer", name: "caterer", talk: S => catererTalk(S), look: "The caterer, in an apron and a cap, with an expression that says \"I'm going to retire in March.\"", give: "\"I don't take anything. Everything's free.\"", pickup: "I'm not lifting the caterer." },
    { id: "a5_tech1", name: "roadie", talk: S => RP.lines(["@a5_tech1 Headliner? Cool. Mind the cable. Not that one. That one.", "There are four hundred cables.", "@a5_tech1 Then mind all of them."]), look: "A roadie in a headset, a roll of gaffer tape on his wrist like a bracelet. He hasn't sat down since Thursday.", give: "\"Hands full, boss. Hands are always full.\"", pickup: "He carries cable all day. He's not also carrying me." },
    { id: "a5_tech2", name: "crew", talk: S => RP.lines(["@a5_tech2 If Roz asks, I'm on lights.", "Are you on lights?", "@a5_tech2 I'm on a break that looks like lights."]), look: "A crew member in a black cap, a red bun out the back, a lanyard heavy with laminates. She has the calm of someone who's seen a stage fall down. Twice.", give: "\"Unless it's a fuse, I don't want it.\"", pickup: "No. She'd log it as an incident." },
    { id: "a5_btrailer", name: "your trailer", r: [196, 128, 142, 78], z: 20, walk: [262, 226, "back"], look: S => "A white trailer: ARTIST 1. A gold star on the door. The sign says \"DJ " + A5.mangle(A5.pName(S)).replace(/^DJ /, "") + ".\" It's my trailer. I'm someone who has a trailer.", open: S => ownTrailer(S), use: S => ownTrailer(S), push: "It weighs a lot. It's got a bathroom. Wow.", pickup: "It's got wheels, a hitch and a sense of occasion.", talk: "\"Hello, trailer.\" It says nothing. It's a trailer. It doesn't have to." },
    { id: "a5_baxl", name: "Axl's trailer", r: [352, 100, 216, 108], z: 20, walk: [470, 232, "back"], look: "A gold trailer the size of a house. AXL in a giant neon sign on the roof, a red carpet, velvet ropes, two potted palms. The plaque on the door: AXL VANTA — DO NOT KNOCK. It's the trailer of a man who's never been told no.", use: S => axlDoor(S), open: S => axlDoor(S), pickup: "It's a trailer. It's golden. It's not mine.", push: "It's very gold and very solid. I push. It pushes back by existing.", talk: S => axlDoor(S), give: (S, item) => item === "a5_smoothie" ? axlDoor(S) : "I'm not giving Axl's trailer anything. It already has everything." },
    { id: "a5_bcarpet", name: "red carpet", r: [428, 206, 82, 32], z: 8, floor: true, look: "A red carpet leading nowhere in particular. Straight from the trailer door to a tiny velvet rope. Axl's walk of fame." },
    { id: "a5_bpalm", name: "potted palms", rects: [[388, 150, 56, 70], [518, 150, 56, 70]], z: 25, walk: [455, 236, "back"], look: "Two enormous potted palms flank the red carpet. They're in black plastic pots with GOLD spray paint. Even Axl's plants have an entourage.", pickup: "The palms weigh more than my gear. Don't ask.", use: "I can't use plants. I can only compliment them. Nice palm." },
    { id: "a5_bprod", name: "production office", r: [586, 120, 112, 86], z: 18, walk: [642, 232, "back"], look: "PRODUCTION. A trailer full of radios, laptops and a person with a headset yelling \"copy.\" The beating heart of a festival.", open: "Locked. Roz has the key. Roz has all the keys.", use: "Roz's domain. I'm a visitor.", pickup: "No." },
    { id: "a5_bboard", name: "running order", r: [614, 130, 80, 74], z: 40, walk: [654, 234, "back"], look: S => ["MAIN STAGE running order, in marker: 6:00 DOORS. 7:00 THE BILL (see poster). 10:15 AXL VANTA. 11:45 ... and then my name.", RP.has("a5_pass") && !S.f.a5_passFixed ? "It's the typo'd version. Brian strikes again." : "It's right. Someone fixed it. Roz, I bet."], pickup: "The whiteboard stays. The running order stays. The kid is just passing through.", pull: "It's on an easel. Easels fall. Not today." },
    { id: "a5_roz", name: "Roz", talk: S => rozTalk(S), look: "Roz Kessler, stage manager. Headset, hi-vis vest, a ponytail that says \"I've had no time to sit down since February.\" She looks like she's holding up the festival by herself. Probably true.", give: (S, item) => "Roz: \"Not now. Hands full. Brain full. Headset full.\"", pickup: "No. I like having ankles.", push: "I'm not pushing Roz. Roz would push BACK, and she has a walkie-talkie." },
    { id: "a5_blounge", name: "artist lounge", r: [704, 126, 122, 94], z: 15, walk: [770, 236, "back"], look: "The artist lounge: a white tent, a couch, a coffee table with cups, a string of lights. The most civilized place I've ever been backstage.", use: "Sit on the couch? Not before my set. If I sit down, I'll be there till Tuesday.", pickup: "No." },
    { id: "a5_bcouch", name: "lounge couch", r: [710, 160, 110, 64], z: 29, walk: [770, 236, "back"], look: "A purple couch with two throw pillows, neon pink and cyan. It looks like it's seen things. Mostly sound check tantrums.", use: "I'd sit, but I'm afraid I'd never get up. And I need my dignity.", pickup: "I can't lift a couch. I'd throw out my back before the set." },
    { id: "a5_dj_louie_vega", name: "Louie Vega", talk: S => cameo(S, "vega"), look: "Louie Vega. Co-founded Masters At Work with Kenny \"Dope\" Gonzalez. Standing by the lounge, calm as a house record. He gives me a nod.", give: "I won't. That'd be weird.", pickup: "No. Absolutely not. He's a person.", use: "I'd like to use the opportunity to say hi.", push: "I'm not touching a legend." },
    { id: "a5_dj_spinna", name: "DJ Spinna", talk: S => cameo(S, "spinna"), look: "DJ Spinna. He runs the Spinnafest event, and he's on the bill. He's wearing a cap and a calm expression. He gives me a thumbs up.", give: "I won't.", pickup: "No.", use: "I'd like to say hi. I'm going to do it with a wave.", push: "Not touching a legend." },
    { id: "a5_dj_francois_k", name: "Francois K", talk: S => cameo(S, "k"), look: "Francois Kevorkian. Co-founded the Body & Soul party with Danny Krivit and Joe Claussell. He's reading the running order, and he glances up at me.", give: "I won't.", pickup: "No.", use: "I'd like to say hi. I'll mime it.", push: "Not touching a legend." },
    { id: "lou", name: "Lou", talk: S => RP.lines(["@lou It's loud. I like it. Don't tell anyone.", "I won't, Lou.", "@lou Don't touch the stool. It's mine."]), look: "Lou, in the good navy cardigan and his dancing shoes. He's sitting on a stool as if it were a throne. He looks about ten years younger and fifteen years more irritated.", give: "Lou doesn't take things. Lou gives them. Mostly pipe-hole advice.", pickup: "Lou would break me.", use: "Not Lou. Lou's the user." },
    { id: "marcus", name: "Marcus", talk: S => RP.lines(["@marcus I counted: TWELVE. Twelve in. And a hundred outside. I'm a hero.", "You're a hero, Marcus."]), look: "Marcus, wearing a Harbor Lights lanyard like a medal, a tote bag with a picture of himself on it, and an expression of pure triumph.", give: "He'd take it, and also thirty friends.", pickup: "No." },
    { id: "a5_bcases", name: "road cases", rects: [[332, 160, 40, 76], [568, 194, 34, 28], [702, 198, 30, 26]], z: 35, walk: [350, 240, "back"], look: "Flight cases stenciled FOH, CABLES, LIGHTS, BACKLINE. A festival is a pile of black boxes with wheels, held together by tape and Roz.", open: "Locked. These are all professional boxes. Professionals lock their boxes.", pickup: "Crew rule: if it's on wheels, it's theirs." },
    { id: "a5_bwings", name: "stairs to the stage", r: [804, 12, 156, 150], z: 20, walk: [880, 236, "back"], look: "A set of black steel steps up to the side of the stage, a sign: STAGE LEFT, CREW + ARTISTS. It's the beginning of the best day of my life. Or the most embarrassing.",
      exit: S => ({ room: "a5_wings", x: 60, y: 232, face: "right" }) },
    { id: "a5_bsky", name: "the harbor", r: [0, 60, 800, 62], z: 12, walk: [400, 232, "back"], look: S => night(S) ? "The harbor at night. The skyline, a bridge and a tug with a lantern. The most beautiful backdrop for a parking lot." : "The harbor, over a chain-link fence with a green windscreen. It makes the parking lot almost pretty." }
  ],
  combos: [
    ["a5_smoothie", "a5_baxl", S => axlDoor(RP.state)],
    ["a5_smoothie", "a5_dj_louie_vega", "Louie Vega raises a hand: \"Not mine.\" I withdraw. I'm sorry. I'm so sorry."],
    ["a5_smoothie", "a5_roz", "Roz: \"That's Axl's. I can smell it. Go. Go.\""],
    ["a5_pass", "a5_roz", "Roz: \"I don't need to see it. I know where you are. I always know where everyone is.\""],
    ["a5_marker", "a5_bboard", "I could correct the board in marker. But I'm a guest. A guest with a Sharpie. That's dangerous."]
  ],
  enter: async (S, from) => {
    if (night(S) && !S.f.a5_louArrived) { await louArrives(S); return; }
    if (!S.f.a5_backSeen) {
      S.f.a5_backSeen = true;
      await RP.lines(["Backstage. Trailers, flight cases, and a gold monstrosity at the end of the row. Everyone's rushing.", "Nobody looks at me. I'm a headliner. I'm invisible until eleven forty-five."]);
    }
  },
  self: { look: "A headliner, backstage, with an unfixed pass or a fixed pass and a Sharpie stain. Either way, I'm in.", talk: "I'm whispering to myself. Backstage rules." }
});
})();
