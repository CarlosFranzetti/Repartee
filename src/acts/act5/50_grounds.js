/* Act 5 — a5_grounds: the Harbor Lights grounds (scrolling, 960 wide). Saturday.
   West: gate. Food trucks, Eddie's "water", the merch tent, Ray's pop-up Deep Cuts (Sharpie + hints), the bar (Twinkie), Jess + Mr. Whiskers,
   and at the east end the big white fence with Gloria guarding the artist gate (fix your pass!). The main stage towers beyond the fence. */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u, PK = RP.PK, A5 = RP.a5, art = A5.art, I = RP.icons;
const { R, P, ell, line, poly, bayer, mulberry, mix, txt, txtC, txtW, clamp } = U;
const K = U.ramp;
const HL = (c, x, y, w, col) => R(c, x, y, w, 1, col), VL = (c, x, y, h, col) => R(c, x, y, 1, h, col);
const W = 960;
const night = S => (S.f.a5_phase || 0) >= 2;

const HOLES = [[24, 118, 124, 100], [158, 118, 124, 100], [300, 126, 112, 92], [430, 122, 132, 96], [582, 118, 120, 100], [724, 108, 236, 66]];

/* the main stage, seen from behind: black cloth, scaffold, rig truss, speaker backs, flags */
function stageBack(c, x, y, w, h, nt) {
  const cloth = nt ? "#0c0a14" : "#2a2838";
  R(c, x + 10, y + 22, w - 20, h - 22, cloth);
  for (let px = x + 10; px < x + w - 10; px += 4) VL(c, px, y + 22, h - 22, (px / 4) % 2 ? mix(cloth, "#000000", 0.35) : mix(cloth, "#6a667c", 0.18));
  PK.util.dshade(c, x + 10, y + 22, w - 20, 14, "#000000", (px, py) => 1 - (py - y - 22) / 14, 0.4);
  /* scaffold frame + diagonal bracing */
  art.trussV(c, x + 8, y + 12, h - 12, 8); art.trussV(c, x + w - 16, y + 12, h - 12, 8);
  for (let py = y + 26; py < y + h - 20; py += 22) { HL(c, x + 12, py, w - 28, "#6a667c"); line(c, x + 14, py, x + w / 2, py + 22, "#4a4660"); line(c, x + w - 18, py, x + w / 2, py + 22, "#4a4660"); }
  /* roof truss + hanging speaker arrays (their backs) */
  const tr = PK.truss(c, x, y + 4, w, 14, { color: "#8a889c" });
  art.lineArray(c, x + 20, y + 22, 7, 20, { color: "#1c1a24", ch: 8 }); art.lineArray(c, x + w - 40, y + 22, 7, 20, { color: "#1c1a24", ch: 8 });
  /* lettering vinyl: HARBOR LIGHTS MAIN STAGE */
  txtC(c, "HARBOR LIGHTS", x + w / 2, y + 54, nt ? "#ff3fa4" : "#c8c4d8", 2, 1); txtC(c, "MAIN STAGE", x + w / 2, y + 68, nt ? "#39d0ff" : "#c8c4d8", 2, 1);
  /* flags on the roof */
  [x + 30, x + w / 2, x + w - 30].forEach((fx, i) => { VL(c, fx, y - 14, 18, "#8a86a0"); poly(c, [[fx + 1, y - 14], [fx + 14, y - 10], [fx + 1, y - 5]], ["#ff3fa4", "#39d0ff", "#ffd23f"][i]); });
  if (nt) { for (let i = 0; i < 6; i++) { const bx = x + 40 + i * 30; R(c, bx, y + 18, 6, 3, "#fff6d0"); } }
  return tr;
}

function paint(c, S) {
  const em = [], nt = night(S), time = nt ? "night" : "day";
  em.push.apply(em, art.harbor(c, { x: 0, w: W, horizon: 118, skyH: 60, time, seed: nt ? 15 : 14, bottom: 150, bridge: { x: 40, w: 350, h: 40 },
    sun: nt ? undefined : { x: 120, y: 80, r: 9 }, clouds: nt ? false : 5, moon: nt ? { x: 360, y: 26, r: 7 } : false, holes: HOLES,
    lights: nt ? [{ x: 100, color: "#ffd27a", a: 0.7, w: 2 }, { x: 320, color: "#ff9ad5", a: 0.7, w: 2 }, { x: 520, color: "#9fe8ff", a: 0.7, w: 3 }, { x: 700, color: "#ffb070", a: 0.9, w: 4 }] : null }));
  art.treeLine(c, 300, 118, 420, { seed: 9, dark: nt ? "#1c1030" : "#2c5a3a", mid: nt ? "#271645" : "#3a7a4a" });
  art.ferrisBase(c, 512, 86, 36, nt ? "#241c44" : "#6a6490");
  /* paving */
  art.pavement(c, 0, 150, W, 106, { base: nt ? "#58547a" : "#a09cb0", seed: 8 });
  R(c, 0, 142, 706, 8, nt ? "#2a2644" : "#7a7694"); HL(c, 0, 142, 706, nt ? "#6a6690" : "#c8c4d8"); HL(c, 0, 149, 706, "#14101e");
  art.railing(c, 0, 128, 706, { gap: 24 });
  /* the stage, far behind the fence */
  const tr = stageBack(c, 700, 16, 256, 138, nt);
  em.push.apply(em, tr);
  /* the white fence + the artist gate */
  const fy = 112, fh = 60;
  R(c, 724, fy, 236, fh, "#e8e4f0");
  for (let x = 724; x < 960; x += 6) { VL(c, x, fy, fh, "#c8c4d8"); VL(c, x + 1, fy, fh, "#f4f0ff"); VL(c, x + 5, fy, fh, "#a8a4b8"); }
  R(c, 724, fy, 236, 3, "#8a86a0"); HL(c, 724, fy, 236, "#ffffff"); R(c, 724, fy + fh - 4, 236, 4, "#8a86a0"); R(c, 724, fy + 24, 236, 2, "#b8b4c8");
  for (let x = 740; x < 960; x += 58) txtC(c, "HARBOR LIGHTS", x + 22, fy + 10, "#c0b8d8", 1, 1);
  PK.util.dshade(c, 724, fy, 236, fh, "#140c24", () => 0.35, nt ? 0.5 : 0.15);
  R(c, 796, fy - 2, 62, fh + 2, "#6a667c"); R(c, 798, fy, 28, fh, "#4a4658"); R(c, 828, fy, 28, fh, "#4a4658");
  for (let y = fy + 2; y < fy + fh; y += 5) { HL(c, 799, y, 26, "#2a2838"); HL(c, 829, y, 26, "#2a2838"); }
  VL(c, 826, fy, fh, "#c8c4d8"); VL(c, 827, fy, fh, "#2a2838");
  R(c, 818, fy + 26, 18, 5, "#8a86a0"); R(c, 824, fy + 30, 6, 8, "#c8a020"); HL(c, 824, fy + 30, 6, "#fff08a");        /* chain + padlock */
  R(c, 800, fy + 6, 54, 16, "#c0302c"); R(c, 800, fy + 6, 54, 1, "#ff7a6a"); txtC(c, "ARTISTS & STAFF", 827, fy + 9, "#ffffff", 1, 1); txtC(c, "ONLY", 827, fy + 15, "#ffffff", 1, 1);
  /* sponsor banners on the fence ends */
  em.push.apply(em, art.banner(c, 736, 88, 50, [{ t: "HARBOR", sc: 1 }, { t: "LIGHTS", sc: 1, c: "#39d0ff" }], { w: 20 }));
  /* trucks, tents */
  em.push.apply(em, art.foodTruck(c, 24, 214, 124, { name: "TACOS", color: "#e0a02a", awning: "#c0302c" }));
  em.push.apply(em, art.foodTruck(c, 158, 214, 124, { name: "DUMPLINGS", color: "#3aa8a8", awning: "#f4f0e8", nameColor: "#ffffff" }));
  /* merch tent */
  art.popTent(c, 300, 126, 112, 88, { color: "#f4f0e8", stripe: "#ff3fa4", panels: 6 });
  R(c, 312, 150, 88, 12, "#17131f"); txtC(c, "HARBOR LIGHTS MERCH", 356, 153, "#ff3fa4", 1, 1);
  R(c, 306, 164, 100, 2, "#8a86a0");
  [["#17131f", "#ff3fa4"], ["#f4f0e8", "#39d0ff"], ["#ff3fa4", "#ffd23f"], ["#2a3a6a", "#ffd23f"], ["#17131f", "#39d0ff"], ["#f4f0e8", "#ff3fa4"]].forEach(([tc, pc], i) => {
    const tx = 310 + i * 16; R(c, tx, 166, 12, 16, tc); R(c, tx - 2, 166, 3, 6, tc); R(c, tx + 11, 166, 3, 6, tc); R(c, tx + 3, 171, 6, 5, pc); P(c, tx + 5, 166, "#0c0818"); HL(c, tx, 166, 12, mix(tc, "#ffffff", 0.3));
  });
  /* Ray's pop-up */
  art.popTent(c, 430, 122, 132, 92, { color: "#17131f", stripe: "#ffd23f", panels: 6, inside: "#1c121c" });
  em.push.apply(em, PK.neon(c, "DEEP CUTS", 450, 152, "#ff3fa4", { scale: 2, tube: 2 }));
  /* the bar */
  art.popTent(c, 582, 118, 120, 100, { color: "#f4f0e8", stripe: "#39d0ff", panels: 6, inside: "#1c1426" });
  PK.shelf(c, 592, 146, 100, 30, { items: "bottles", seed: 4, wood: "#6a3a2a" });
  R(c, 596, 140, 92, 10, "#17131f"); txtC(c, "HARBOR BAR  1 TICKET", 642, 143, "#ffd23f", 1, 1);
  em.push.apply(em, PK.neon(c, "BAR", 608, 128, "#39d0ff", { scale: 1, tube: 1 }));
  /* sign post with arrows */
  R(c, 14, 130, 3, 84, "#6a667c"); VL(c, 14, 130, 84, "#a8a4b8");
  [["MAIN STAGE >", "#ff3fa4", 132], ["FOOD  <", "#ffd23f", 144], ["MERCH  >", "#39d0ff", 156]].forEach(([t, col, ty]) => { R(c, 6, ty, 50, 9, col); HL(c, 6, ty, 50, "#ffffff55"); txtC(c, t, 31, ty + 2, "#17131f", 1, 1); });
  /* string lights across the walkway and bunting */
  const sl1 = art.stringLights(c, 60, 52, 320, 66, { sag: 14, step: 5, colors: ["#ffd27a", "#ff9ad5", "#9fe8ff"] });
  const sl2 = art.stringLights(c, 320, 66, 600, 52, { sag: 14, step: 5, colors: ["#ffd27a", "#ff9ad5", "#9fe8ff"] });
  if (nt) { em.push.apply(em, sl1); em.push.apply(em, sl2); }
  art.bunting(c, 150, 44, 330, 62, { sag: 8 });
  art.bunting(c, 330, 62, 600, 40, { sag: 8 });
  /* cable ramps, litter, a drain */
  art.cableRamp(c, 660, 238, 60); art.cableRamp(c, 250, 244, 44);
  art.litter(c, 20, 214, 880, 36, 12);
  return em;
}

/* ---------------------------------------------------------------------------------------- sprites */
function drawRayCounter(c, S) {
  PK.recordBins(c, 440, 160, 112, 56, { seed: 5 });
  /* hand-lettered price cards */
  R(c, 444, 196, 18, 8, "#f4ead0"); txt(c, "$5", 449, 198, "#c0302c", 1, 1);
  R(c, 530, 196, 18, 8, "#f4ead0"); txt(c, "$2", 535, 198, "#c0302c", 1, 1);
}
function drawBarCounter(c, S) {
  PK.counter(c, 590, 176, 104, 38, { top: "#6a4030", front: "#2a1c28", seed: 6 });
  /* a pile of drink tickets and a cup tower */
  for (let i = 0; i < 4; i++) { R(c, 604 + i * 2, 170 - i, 16, 8, i % 2 ? "#ff3fa4" : "#ffd23f"); R(c, 604 + i * 2, 170 - i, 16, 1, "#ffffff"); }
  for (let i = 0; i < 5; i++) { R(c, 672 + i * 2, 160 - i * 3, 8, 3, "#efeaf6"); HL(c, 672 + i * 2, 160 - i * 3, 8, "#ffffff"); }
}
function drawWaterSign(c, S) {
  /* Eddie's ice chest with a hand-lettered sign */
  PK.contactShadow(c, 270, 238, 36, 5, { alpha: 0.4 });
  R(c, 276, 226, 30, 14, "#2f62b8"); R(c, 276, 226, 30, 3, "#8aa8e8"); R(c, 276, 233, 30, 1, "#e8e4f4");
  R(c, 262, 212, 26, 16, "#f4ead0"); R(c, 262, 212, 26, 1, "#ffffff"); txt(c, "WATER", 265, 215, "#c0302c", 1, 1); txt(c, "$9", 275, 222, "#17131f", 1, 1); R(c, 273, 228, 3, 12, "#8a6a4a");
}
function drawCarrier(c, S) {
  /* Mr. Whiskers in a bubble backpack carrier at Jess's feet, with tiny festival shades */
  const x = 190, y = 244;
  PK.contactShadow(c, x - 2, y - 2, 30, 5, { alpha: 0.4 });
  R(c, x, y - 22, 26, 22, "#7a3fb0"); R(c, x, y - 22, 26, 2, "#a070e0"); R(c, x, y - 2, 26, 2, "#4a2470");
  ell(c, x + 13, y - 13, 9, 8, "#bfe8f4"); ell(c, x + 13, y - 13, 8, 7, "#14101e");
  /* the cat */
  ell(c, x + 13, y - 11, 6, 5, "#ff9a4a"); R(c, x + 8, y - 17, 3, 3, "#ff9a4a"); R(c, x + 16, y - 17, 3, 3, "#ff9a4a"); P(c, x + 9, y - 16, "#ffb0c0"); P(c, x + 17, y - 16, "#ffb0c0");
  R(c, x + 9, y - 13, 9, 2, "#17131f"); P(c, x + 13, y - 11, "#17131f"); R(c, x + 10, y - 10, 7, 1, "#ffe8d0"); HL(c, x + 9, y - 14, 4, "#ffffff");
  ell(c, x + 13, y - 13, 9, 8, "#bfe8f4"); PK.util.dshade(c, x + 4, y - 20, 18, 14, "#ffffff", (px, py) => ((px + py) % 9 < 2 ? 1 : 0), 0.25);
  R(c, x + 6, y - 24, 14, 2, "#17131f"); R(c, x + 22, y - 18, 2, 6, "#17131f");
}

function lightMap(S) {
  if (night(S)) return { ambient: "#54487e", lights: [
    { x: 86, y: 150, r: 130, color: "#ffd890", steps: 4, power: 0.8 }, { x: 222, y: 150, r: 120, color: "#9fe8ff", steps: 4, power: 0.7 },
    { x: 356, y: 156, r: 130, color: "#ff9ad5", steps: 4, power: 0.7 }, { x: 496, y: 160, r: 130, color: "#ffd890", steps: 4, power: 0.8 },
    { x: 642, y: 150, r: 150, color: "#9fe8ff", steps: 4, power: 0.9 }, { x: 830, y: 60, r: 330, color: "#ff3fa4", steps: 4, power: 0.7, rim: true },
    { x: 520, y: 80, r: 260, color: "#9a78ff", steps: 3, power: 0.45 }],
    halos: [{ x: 86, y: 150, r: 20, color: "#ffd890", strength: 0.9 }, { x: 496, y: 150, r: 20, color: "#ff3fa4", strength: 0.9 }, { x: 642, y: 140, r: 20, color: "#39d0ff", strength: 0.9 }],
    key: { x: 830, y: 60 }, shadow: 0.6 };
  return { ambient: "#e4cdb8", lights: [{ x: 120, y: 30, r: 900, color: "#fff0d0", steps: 3, power: 0.5 }], key: { x: 120, y: 30 }, shadow: 0.5 };
}

/* ---------------------------------------------------------------------------------------- scripts */
async function rayTalk(S) {
  if (!S.f.a5_rayMet) {
    S.f.a5_rayMet = true;
    await RP.lines([
      "@ray Well, well. The headliner. At my tent. Deep Cuts: pop-up edition. Rent's a nightmare, the walls are canvas.",
      "Ray! You came.",
      "@ray The festival gave me this tent for \"authenticity.\" I told them my authenticity costs extra.",
      "@ray You look like a man who's about to ask me for something."
    ]);
  } else await RP.say("Back again. What do you need? I'm busy being right.", "ray");
  await RP.convo([
    { text: "Got a Sharpie, Ray?", when: S2 => !S2.f.a5_sharpie, run: async () => {
      S.f.a5_sharpie = true; RP.give("a5_marker"); RP.sfx("pickup");
      await RP.lines(["@ray Obviously. Ray has everything. Here.", "@ray Autographs are for people with names. Yours is a work in progress.", "It's for my pass. The festival spelled my name wrong.", "@ray Of course they did. Fix it. In capital letters. Properly."]);
    } },
    { text: "Any advice for the set?", once: true, run: async () => {
      await RP.lines([
        "@ray You still can't read a room. Listen.",
        "@ray Start low. Climb. Don't peak before midnight. The crowd's a patient animal until it isn't.",
        "@ray Don't jump more than four BPM unless you mean it. And when you get to the white label, shut up and play it.",
        "@ray And if the room goes weird, play something they know. People trust what they know. Even when it's three bars of Robin S."
      ]);
    } },
    { text: "What did you think of the radio interview?", when: S2 => !!S2.f.a5_interviewDone, once: true, run: async () => {
      await RP.lines(["@ray I heard it. \"One bad decision at a time.\" That's not a motto, that's a tote bag.", "@ray You were fine. Don't let it go to your head. Let it go to your feet."]);
    } },
    { text: "Think my crate's okay?", once: true, run: async () => {
      A5.ensureCrate(S);
      await RP.lines(["@ray Let me see. ...Fine. It's got everything I'd tell you to bring, except my opinion. Which is free.", "@ray Take the white label to the stage. Lou's record. That's the one the whole thing's been about."]);
    } },
    { text: "See you later, Ray.", end: true, run: async () => { await RP.say("Don't die on stage. It's a mess for the crew.", "ray"); } }
  ]);
}
async function twinkieTalk(S) {
  if (!S.f.a5_twinkieMet) {
    S.f.a5_twinkieMet = true;
    await RP.lines(["@twinkie HONEY. You made it. Sit. I remember everything. Ask me anything.", "Twinkie. You're at the bar. Of course."]);
  } else await RP.say("What else do you want to know? I've got all night.", "twinkie");
  await RP.convo([
    { text: "What do you know about Axl Vanta?", when: S2 => !S2.f.a5_axlIntel, run: async () => {
      S.f.a5_axlIntel = true;
      await RP.lines([
        "@twinkie Axl Vanta? Born Alexander Vantuono. Staten Island. He has a rider with six pages and one actual need: a green smoothie.",
        "@twinkie His mother's here tonight. Front row. She has a banner: \"MY ALEX.\" He's terrified of her.",
        "@twinkie Don't ask me how I know. I know everyone. I even know the guy who knows."
      ]);
    } },
    { text: "Where's the after-party, Twinkie?", once: true, run: async () => {
      S.f.a5_twinkieAfter = true;
      await RP.lines(["@twinkie The pier. East end, past the Ferris wheel. The sun hits it first. I'll save you a spot.", "A sunrise afters. For after my set. That's the only afters I've ever wanted."]);
    } },
    { text: "Any news?", once: true, run: async () => {
      await RP.lines(["@twinkie Marcus is bringing twelve. Jess is bringing the cat. Eddie is bringing a bill.", "@twinkie Dante is \"on his way.\" Which means he's still in the parking lot, looking for his keys."]);
    } },
    { text: "Later, Twinkie.", end: true }
  ]);
}
async function jessTalk(S) {
  if (!S.f.a5_jessMet) {
    S.f.a5_jessMet = true;
    await RP.lines(["@jess Hey. You look... famous.", "I look like a person trying not to cry in a good coat.", "@jess That's famous."]);
  }
  await RP.convo([
    { text: "How's Mr. Whiskers?", once: true, run: async () => {
      await RP.lines(["@jess He's a star. Seriously. He's got three hundred thousand followers.", "I have forty thousand and a Taula.", "@jess Mr. Whiskers has his own line of pâté. His face is on a can. It's called \"Whiskers: Fit For A Headliner.\"", "That's... that's my slogan."]);
    } },
    { text: "Did you bring him?", once: true, run: async () => {
      await RP.lines(["@jess Of course.", "(She tips the carrier. Mr. Whiskers has a festival wristband and tiny cat shades.)", "@jess He asked for a shoutout. In his way.", "In his way, meaning he sleeps through the whole thing.", "@jess That's the highest compliment he gives."]);
    } },
    { text: "I'll give him a shout-out in the set.", when: S2 => !S2.f.a5_whiskersShout, run: async () => { S.f.a5_whiskersShout = true; await RP.lines(["@jess ...He'd love that. He won't say so. He'll just blink slowly.", "Slow blinks. The highest form of cat praise."]); } },
    { text: "See you inside, Jess.", end: true }
  ]);
}
async function eddieTalk(S) {
  await RP.lines(["@eddie WATER! Nine dollars! A two-time deal: you pay nine now, nine in spirit.", "Eddie, I've got a thousand-dollar mixer and I can't afford a water."]);
  const i = await RP.choose(["Buy a water ($9)", "No thanks"]);
  if (i === 0) {
    if (!RP.canAfford(9)) { await RP.say("I'm broke. Even now."); return; }
    RP.money(-9); await RP.lines(["@eddie A pleasure! Kid, I put a little spirit in it. The spirit is of water.", "It's... just water. It's cold, at least."]);
  } else await RP.say("@eddie Your loss! It was working this morning!", "eddie");
}
async function gloriaTalk(S) {
  const nm = A5.pName(S), bad = A5.mangle(nm);
  if (S.f.a5_gloriaOK) { await RP.lines(["@a5_gloria Go on in, headliner. Don't make me regret the marker."]); return; }
  if (S.f.a5_passFixed && RP.has("a5_pass")) { await showPass(S); return; }
  if (!S.f.a5_gloriaMet) {
    S.f.a5_gloriaMet = true;
    await RP.lines([
      "@a5_gloria Pass.",
      "Yes. Here. All-access.",
      "@a5_gloria This says DJ " + bad.replace(/^DJ /, "") + ". Your ID says " + nm + ".",
      "It's the same person.",
      "@a5_gloria Could be a twin. I've seen twins. Twins use the same pass. This is a different name.",
      "It's a typo. An intern named Brian...",
      "@a5_gloria I don't care if it's Brian or Gerald. A wrong pass is a prank. Fix it or beat it."
    ]);
    return;
  }
  await RP.lines(["@a5_gloria Still wrong. I'm not moving.", "Right. Fix the pass. I need something that writes."]);
}
async function showPass(S) {
  if (!RP.has("a5_pass")) { await RP.say("My pass. It's in my pocket. No, it's... never mind. I have it."); return; }
  if (!S.f.a5_passFixed) { await gloriaTalk(S); return; }
  await RP.walkTo(790, 236, "right");
  await RP.lines([
    "@a5_gloria ...",
    "@a5_gloria That's marker.",
    "It's my name. In capital letters.",
    "@a5_gloria It's a different handwriting from the printout. It's a handwriting I trust more.",
    "@a5_gloria You're on the poster. I stood under it all day. It looks like you."
  ]);
  S.f.a5_gloriaOK = true; RP.sfx("unlock");
  await RP.lines(["@a5_gloria Through the gate. East. Straight to the trailers. Mind the cables. Mind the trailers. Mind everything.", "Thanks, Gloria.", "@a5_gloria Don't thank me. Headline."]);
}

/* ---------------------------------------------------------------------------------------- room */
RP.room({
  id: "a5_grounds", act: 5, name: "Harbor Lights Grounds", width: W,
  paint, cacheKey: S => (night(S) ? "n" : "d"), light: lightMap, lightKey: S => (night(S) ? "n" : "d"), ambience: "festival",
  music: S => null,
  walk: [[8, 222], [952, 222], [952, 252], [8, 252]],
  start: { x: 40, y: 232, face: "right" },
  fx: [
    { type: "beams", origins: [[760, 154], [880, 154], [820, 154]], colors: ["#ff9ad5", "#9fe8ff", "#ffd8a0"], base: -Math.PI / 2, swing: 0.55, len: 180, width: 8, alpha: 0.13, period: 2200, on: () => night(RP.state) },
    { type: "dust", rect: [700, 60, 240, 100], count: 20, color: "#ffe9d0", on: () => night(RP.state) },
    { type: "custom", draw: (c, dt, t) => art.ferrisDraw(c, 512, 86, 36, t, { color: night(RP.state) ? "#3a3068" : "#6a6490" }) }
  ],
  actors: S => [
    { id: "ray", char: "ray", x: 496, y: 207, face: "front", act: "stand", name: "Ray" },
    { id: "twinkie", char: "twinkie", x: 640, y: 206, face: "front", act: "stand", name: "Twinkie" },
    { id: "jess", char: "jess", x: 232, y: 236, face: "left", act: "stand", name: "Jess" },
    { id: "eddie", char: "eddie", x: 302, y: 236, face: "left", act: "stand", name: "Eddie Two-Times" },
    { id: "a5_gloria", char: "a5_gloria", x: 830, y: 226, face: "front", act: "stand", name: "Gloria" },
    { crowd: { n: 2, rect: [70, 238, 50, 10], seed: 77, face: "front", act: "stand", scale: 0.95, vis: S2 => !night(S2) } },
    { crowd: { n: 1, rect: [368, 242, 40, 8], seed: 81, face: "front", act: "stand", scale: 0.95, vis: S2 => !night(S2) } },
    { crowd: { n: 2, rect: [704, 240, 90, 8], seed: 83, face: "left", act: "stand", scale: 0.95, vis: S2 => !night(S2) } },
    { crowd: { n: 6, rect: [60, 236, 260, 14], seed: 78, face: "back", act: "dance", scale: 0.95, vis: S2 => night(S2) } },
    { crowd: { n: 6, rect: [360, 238, 330, 12], seed: 79, face: "back", act: "dance", scale: 0.95, vis: S2 => night(S2) } }
  ],
  sprites: [
    { y: 216, draw: art.sprite((c, S) => drawRayCounter(c, S)) },
    { y: 215, draw: art.sprite((c, S) => drawBarCounter(c, S)) },
    { y: 243, draw: art.sprite((c, S) => drawWaterSign(c, S)) },
    { y: 245, draw: art.sprite((c, S) => drawCarrier(c, S)) }
  ],
  hotspots: [
    { id: "a5_wexit", name: "back to the gate", r: [0, 150, 22, 104], z: 25, walk: [12, 232, "left"], look: "West: the main gate, the subway and the rest of Brooklyn. I've got nothing there until after the set.", exit: S => ({ room: "a5_gate", x: 590, y: 232, face: "left" }) },
    { id: "a5_wsign", name: "directional sign", r: [4, 128, 56, 40], z: 20, walk: [34, 232, "back"], look: "MAIN STAGE, FOOD, MERCH. Somebody drew a tiny lighthouse next to MAIN STAGE. It's the best direction I've ever been given.", pickup: "It's bolted into the concrete. The concrete is the strong, silent type." },
    { id: "a5_wtruck1", name: "taco truck", r: [22, 118, 128, 100], z: 15, walk: [90, 236, "back"], look: "A taco truck with a serving window and a lot of confidence. The menu says TACOS. That's all it says. That's the whole brand. I respect it.", use: "I'm too nervous to eat. Also, I have no tickets. And the truck says cash only, and it's talking to someone else.", talk: "\"Hello?\" The window slides open an inch. A hand throws a napkin at me. That's a no." , pickup: "I can't take the truck. I don't have a license for anything bigger than a bike." },
    { id: "a5_wtruck2", name: "dumpling truck", r: [156, 118, 128, 100], z: 15, walk: [218, 238, "back"], look: "DUMPLINGS. Steam, a cheerful guy in an apron, and a queue that smells like heaven. I'd murder for a pork bun. I'm saving it for after the set.", use: "After the set. I need to be able to feel my hands.", talk: "The dumpling guy waves and gives me a thumbs-up. That's more affection than I've had in 24 hours.", pickup: "Absolutely not. Absolutely yes. After the set." },
    { id: "a5_wmerch", name: "merch tent", r: [298, 124, 116, 94], z: 15, walk: [356, 238, "back"], look: "HARBOR LIGHTS MERCH. Tees, hats, tote bags. There's a shirt with my face on it. I stand next to it. It's weirdly flattering. And a little bit horrifying.", use: "The shirt costs $45. I'm the headliner. I'm told it's retail.", pickup: "I'd need to pay for it. I'm still not used to being on both ends of the price tag.", talk: "The merch person says \"yes?\" I say \"nothing.\" We're both in agreement." },
    { id: "ray", name: "Ray", talk: S => rayTalk(S), look: "Ray, of Deep Cuts. Same beard, same glasses, same expression of pity for everything you've ever bought.", give: (S, item) => "Ray: \"I don't want it. I have everything I want. It's a curse.\"", pickup: "Ray's bigger than he looks. He's all opinions.", use: "I can't use Ray. Nobody's ever managed it." },
    { id: "a5_wray", name: "Deep Cuts pop-up", r: [428, 120, 136, 98], z: 15, walk: [496, 236, "back"], look: "Deep Cuts, pop-up edition: bins of records, price cards in Ray's handwriting, and a neon sign Ray says he \"didn't buy, it just arrived.\"", pickup: "Ray's watching. Ray's always watching. And he'll charge me for the look.", use: "I have a crate. I have a lot of records. I'm not allowed to buy any more. Priya has views.", open: "The bins are open. They've been open since 1993. I'll look through them after the set." },
    { id: "a5_wbar", name: "Harbor Bar", r: [580, 116, 124, 102], z: 15, walk: [650, 236, "back"], look: "HARBOR BAR: 1 TICKET. A shelf of bottles, a stack of tickets, a tower of cups, and a woman in mesh who knows everything.", use: "I'm not drinking before my set. I'm a professional. I'm a very nervous professional.", pickup: "The tickets are guarded by a woman who remembers everything. Hands off." },
    { id: "twinkie", name: "Twinkie", talk: S => twinkieTalk(S), look: "Twinkie. Mesh top, pink skirt, shades at night. The only person I know who's been at every after-party and still looks awake.", give: (S, item) => "Twinkie: \"I'll remember that you tried.\"", pickup: "Twinkie remembers. Twinkie will remember this too.", use: "I can't use Twinkie. I can only be used BY Twinkie." },
    { id: "jess", name: "Jess", talk: S => jessTalk(S), look: "Jess. Purple hoodie, ponytail, and a bubble backpack carrier at her feet. She looks great. Lucky for her, she's not looking at me.", give: (S, item) => "Jess: \"No, thanks. Mr. Whiskers has everything.\"", pickup: "No.", use: "Jess has opinions about being used." },
    { id: "a5_wcat", name: "Mr. Whiskers", r: [186, 218, 36, 32], z: 40, walk: [210, 244, "right"], look: "Mr. Whiskers, in a bubble carrier, wearing a festival wristband and tiny cat shades. He has more followers than I do and more sleep than I will ever have.", talk: "\"Mr. Whiskers.\" He blinks, slowly. In cat, that's \"I love you.\" In human, that's \"you're blocking my nap.\"", pickup: "Jess would end me. Also he'd scratch.", use: "I can't use a cat. A cat uses YOU.", push: "He wiggles. I stop." },
    { id: "eddie", name: "Eddie Two-Times", talk: S => eddieTalk(S), look: "Eddie Two-Times, behind an ice chest, selling water at nine dollars. His jacket's open. His sign says \"WATER $9.\" Under it, in tiny letters: \"(TWO-TIME PRICE).\"", give: (S, item) => "Eddie: \"Thanks! Where's the cash?\"", pickup: "The ice chest weighs thirty kilos. Eddie's weight in two-time deals.", use: "I can use Eddie. It's a mistake. I do it anyway." },
    { id: "a5_wchest", name: "ice chest", r: [264, 208, 44, 34], z: 36, walk: [290, 244, "back"], look: "An ice chest full of bottled water. The price is $9. It's a two-time price: you're not paying nine dollars, you're paying nine dollars twice.", open: "Ice, water, and a flyer for Eddie's other business. I close it before I'm asked a question.", pickup: "It's heavy. It's also Eddie's. In that order." },
    { id: "a5_wferris", name: "Ferris wheel", r: [466, 44, 92, 100], z: 11, walk: [500, 232, "back"], look: "A Ferris wheel in pink and gold lights. It turns so slowly it's more of a mood than a ride.", use: "After the set. At 2 AM. With a person I don't know yet.", pickup: "It's a Ferris wheel. It's got a perimeter." },
    { id: "a5_wfence", name: "backstage fence", r: [722, 108, 238, 66], z: 15, walk: [770, 232, "back"], look: "A tall white fence, HARBOR LIGHTS stenciled every few feet. Behind it: trailers, generators and the back of the main stage, a black wall with a rig on top. It looks like a mountain with a PA.", pickup: "It's a fence. It belongs to security. Specifically to Gloria.", push: "I push the fence. The fence pushes back. By way of Gloria." },
    { id: "a5_wgate", name: "artist gate", r: [796, 110, 64, 66], z: 30, walk: [828, 236, "back"], look: S => S.f.a5_gloriaOK ? "The artist gate. Gloria moved. It's open to me. I should say \"open sesame\" but I don't." : "A double gate, a chain, a padlock, and a sign: ARTISTS & STAFF ONLY. A very large woman stands in front of it, so I'll talk to her first.",
      open: S => S.f.a5_gloriaOK ? "It's open. Go on in." : "Gloria's in the way. Gloria's always in the way. It's her gift.", use: S => showPass(S),
      exit: S => S.f.a5_gloriaOK ? { room: "a5_backstage", x: 40, y: 232, face: "right" } : "Gloria steps into my path. \"Pass.\" I should probably talk to her first." },
    { id: "a5_gloria", name: "Gloria", talk: S => gloriaTalk(S), look: "Gloria, head of security. Hi-vis, a lanyard, no smile. I think she's tall because someone told her to be.", give: (S, item) => item === "a5_pass" ? showPass(S) : "Gloria: \"I don't take gifts. I take names.\"", pickup: "I'm not lifting Gloria. Gloria lifts YOU.", push: "No. Absolutely not. She'd push back, and then I'd be in the harbor.", use: S => showPass(S) },
    { id: "a5_wstage", name: "the main stage", r: [700, 12, 258, 100], z: 10, walk: [760, 232, "back"], look: "The main stage, from behind: a black wall of cloth, a monster rig, speaker towers like skyscrapers. It's the biggest thing I've ever stood on. Not yet. Later.", pickup: "A stage? I'd need a bigger bag.", talk: "I say something to the stage. A stagehand on the rigging tips his hat." },
    { id: "a5_wwater", name: "the harbor", r: [0, 60, 460, 82], z: 12, walk: [200, 232, "back"], look: "The harbor, the bridge, the skyline. A tugboat pushes a barge along the far bank. It's so pretty I forget to be afraid. For at least four seconds.", talk: "I say \"hi\" to Manhattan. Manhattan doesn't say it back. Typical.", pickup: "Water. Scoop. No." },
    { id: "a5_wlights", name: "string lights", r: [60, 36, 540, 36], z: 9, walk: [300, 232, "back"], look: "Two long strings of bulbs across the walkway. At night they make it feel like being inside a snow globe someone left on." }
  ],
  combos: [
    ["a5_pass", "a5_gloria", S => showPass(RP.state)],
    ["a5_pass", "a5_wgate", S => showPass(RP.state)],
    ["a5_marker", "a5_gloria", "Gloria: \"If you write on me, I write on you. With a larger marker.\""],
    ["a5_marker", "ray", "Ray: \"It's mine. You can't sign it. It's a Sharpie, not a diploma.\""],
    ["a5_marker", "jess", "\"No, I don't want you to sign Mr. Whiskers,\" Jess says. I agree."],
    ["a5_marker", "a5_wcat", "I'm not drawing on Mr. Whiskers. He'd file a complaint. In scratches."],
    ["a5_loupass", "ray", "Ray: \"Lou's in this? Good. Tell him I said hi. And that he owes me a Winelight.\""]
  ],
  enter: async (S, from) => {
    if (!S.f.a5_groundsSeen) {
      S.f.a5_groundsSeen = true;
      await RP.lines(["The grounds. The lawn's wet, the lights aren't on yet, and everything smells like grilled onions and ambition.", "Somewhere behind that fence, there's a stage with my name on a screen."]);
    }
  },
  self: { look: "The headliner, in a pink-lined coat, standing near a taco truck. My brand is intact.", talk: "I'm talking to myself. It's fine. It's festival season." }
});
})();
