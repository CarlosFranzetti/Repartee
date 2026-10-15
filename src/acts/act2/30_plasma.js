/* Act 2 — LifeDrop Plasma Center, Downtown Brooklyn. Awkward paperwork comedy, a needle-phobic kid, cookie and juice.
   Needs: wallet (ID), a2_bill (proof of address, from Lou), a2_form filled with the chained pen.
   Flags: a2_formGot, a2_formDone, a2_cleared, a2_plasma, a2_woozy, a2_ate, a2_cardBal, a2_numTaken */
(function () {
"use strict";
const RP = window.RP, A2 = RP.a2, PK = RP.PK;
const { R, P, ell, txt, txtC } = RP.u;
const U = PK.util;
const W = 640;

let glassLayer = null;

function paint(c, S) {
  const em = [];
  // mint institutional walls, tiled dado, speckled linoleum
  PK.plaster(c, 0, 0, W, 168, { base: "#bcd2c6", seed: 31, patches: 1, stains: 2, cracks: 1 });
  PK.wallTiles(c, 0, 112, W, 52, { base: "#e2ece2", size: 12, grout: "#9db0a4", seed: 4, band: { y: 0, h: 6, a: "#3a8a7a", b: "#d8cfa0", style: "stripe" } });
  PK.baseboard(c, 0, 160, W, { color: "#4a6a60", h: 8 });
  PK.tiles(c, 0, 168, W, 88, { a: "#dad6c4", b: "#97b8a8", grout: "#7a8a80", size: 44, checker: true, seed: 2 });
  U.dshade(c, 0, 168, W, 12, "#0c1a18", (x, y) => 1 - (y - 168) / 12, 0.3);
  // ceiling fluorescents
  [[44, 3, 100], [244, 3, 100], [444, 3, 100]].forEach(([x, y, w]) => em.push.apply(em, PK.fluorescent(c, x, y, w)));
  // exit door (to the street)
  PK.door(c, 8, 36, 50, 128, { metal: true, window: true, color: "#6a8a84", knob: false });
  R(c, 12, 28, 42, 7, "#14202a"); txtC(c, "EXIT", 33, 30, "#9bf0b0", 1, 1); em.push([12, 28, 42, 7]);
  // aftercare corner: mascot poster + sign
  R(c, 76, 30, 52, 78, "#f4e8b8"); U.outline(c, 76, 30, 52, 78, "#a89858"); U.HL(c, 77, 31, 50, "#fffbe0");
  const dx = 102, dy = 70;
  RP.u.poly(c, [[dx, dy - 24], [dx - 12, dy - 2], [dx + 12, dy - 2]], "#c0302c"); U.blob(c, dx, dy + 2, 14, 14, "#c0302c", { outline: true });
  ell(c, dx - 5, dy - 1, 3, 3, "#ffffff"); ell(c, dx + 5, dy - 1, 3, 3, "#ffffff"); P(c, dx - 5, dy, "#1d1622"); P(c, dx + 5, dy, "#1d1622");
  R(c, dx - 4, dy + 6, 9, 1, "#1d1622"); P(c, dx - 5, dy + 5, "#1d1622"); P(c, dx + 5, dy + 5, "#1d1622");
  ell(c, dx - 7, dy + 3, 2, 1, "#ff8a7a"); ell(c, dx + 7, dy + 3, 2, 1, "#ff8a7a");
  txtC(c, "DROPPY SAYS", 102, 36, "#c0302c", 1, 1); txtC(c, "GIVE.GET.", 102, 90, "#1d1622", 1, 1); txtC(c, "REPEAT.", 102, 97, "#1d1622", 1, 1);
  // reception: frame, back office, window
  R(c, 160, 48, 204, 98, "#4a6a60"); U.HL(c, 160, 48, 204, "#7aa090"); U.VL(c, 160, 48, 98, "#6a8a80"); U.VL(c, 363, 48, 98, "#2a3a34");
  PK.gradV(c, 166, 54, 192, 88, ["#f0e8cc", "#d8cfa8", "#b8a880"], { dither: 1 });
  PK.shelf(c, 170, 58, 80, 56, { items: "books", wood: "#8a6a4a", seed: 12 });
  PK.plant(c, 316, 100, { size: 1, seed: 3, pot: "#a0502a" });
  R(c, 268, 62, 28, 22, "#fff6d0"); U.outline(c, 268, 62, 28, 22, "#a89858"); txtC(c, "HAPPY", 282, 66, "#c0302c", 1, 0); txtC(c, "HOUR", 282, 72, "#c0302c", 1, 0); txtC(c, "NEVER", 282, 78, "#1d1622", 1, 0);
  R(c, 330, 66, 16, 14, "#f4f0e8"); U.outline(c, 330, 66, 16, 14, "#8a869c"); txt(c, "OCT", 332, 68, "#c0302c", 1, 0); txt(c, "1", 337, 74, "#1d1622", 1, 0);
  em.push.apply(em, PK.glow(c, 262, 52, 70, "#fff6d8", { strength: 0.5, ry: 24 }));
  // LED "NOW SERVING" sign above the window
  R(c, 212, 28, 112, 16, "#1a0a0a"); U.outline(c, 212, 28, 112, 16, "#4a4658");
  txtC(c, "NOW SERVING 12", 268, 33, "#ff3a3a", 1, 1); em.push([214, 30, 108, 12]);
  PK.clock(c, 340, 22, { hour: 3, min: 15, d: 16 });
  // wall of fame: Donor of the Month
  PK.frame(c, 384, 48, 28, 36, { color: "#a07a40", kind: "portrait", seed: 5 }); PK.frame(c, 420, 48, 28, 36, { color: "#a07a40", kind: "portrait", seed: 8 });
  R(c, 384, 90, 64, 14, "#c8a850"); U.outline(c, 384, 90, 64, 14, "#7a6a30"); U.HL(c, 385, 91, 62, "#f4e090");
  txtC(c, "DONOR OF THE MONTH", 416, 93, "#3a2a10", 1, 0); txtC(c, "PEARL T. 212X", 416, 99, "#3a2a10", 1, 0);
  PK.poster(c, 466, 36, 30, 44, { title: "KNOW YOUR VEINS", titleLines: ["KNOW", "YOUR", "VEINS"], lines: [], palette: "paper", seed: 16 });
  // donation bay: curtain rail, curtains, back wall
  R(c, 510, 50, 130, 3, "#8a869c"); U.HL(c, 510, 50, 130, "#c8c4d8");
  R(c, 520, 54, 120, 112, "#e8e4d8"); PK.gradV(c, 520, 54, 120, 112, ["#f0ecdc", "#d0ccbc"], { dither: 1 });
  [[510, 28], [612, 28]].forEach(([cx, cw]) => { for (let x = cx; x < cx + cw; x++) { const f = (x - cx) % 6; R(c, x, 53, 1, 108, f < 2 ? "#5aa8a0" : f < 4 ? "#3a8a84" : "#2a6a66"); } R(c, cx, 53, cw, 2, "#2a6a66"); });
  // the recliner: padded vinyl in front of the machine
  const chairC = "#2f62b8", ck = RP.u.ramp(chairC);
  U.groundShadow(c, 566, 170, 40, 4, 0.5);
  R(c, 538, 100, 56, 52, chairC); PK.gradV(c, 538, 100, 56, 52, [ck[3], chairC, ck[1]], { dither: 1 }); U.HL(c, 538, 100, 56, ck[4]); U.VL(c, 538, 100, 52, ck[3]); U.VL(c, 593, 100, 52, ck[0]);
  for (let y = 108; y < 150; y += 9) U.HL(c, 540, y, 52, ck[1]);
  R(c, 534, 148, 66, 14, chairC); U.HL(c, 534, 148, 66, ck[4]); U.HL(c, 534, 160, 66, ck[0]); R(c, 528, 132, 12, 34, ck[2]); R(c, 594, 132, 12, 34, ck[2]); U.VL(c, 528, 132, 34, ck[3]); U.VL(c, 605, 132, 34, ck[0]);
  R(c, 544, 160, 4, 8, "#8a869c"); R(c, 586, 160, 4, 8, "#8a869c"); R(c, 520, 164, 100, 2, "#8a869c");
  // IV pole + plasma bag (the yellow of it all) and the machine
  R(c, 620, 62, 2, 100, "#c8c4d8"); U.VL(c, 620, 62, 100, "#ffffff"); R(c, 612, 60, 18, 2, "#c8c4d8");
  R(c, 614, 64, 12, 20, "#f2d048"); U.outline(c, 614, 64, 12, 20, "#a88a20"); U.HL(c, 615, 65, 10, "#fff0a0"); R(c, 618, 72, 4, 6, "#e8b820");
  R(c, 592, 94, 20, 48, "#cfcbd8"); PK.gradH(c, 592, 94, 20, 48, ["#e8e4f0", "#cfcbd8", "#8a869c"], { dither: 1 }); U.outline(c, 592, 94, 20, 48, "#5a566c");
  R(c, 596, 100, 12, 10, "#14202a"); R(c, 597, 101, 10, 8, "#0e3a2a"); R(c, 598, 103, 8, 1, "#3fe0a0"); R(c, 598, 106, 5, 1, "#3fe0a0"); em.push([597, 101, 10, 8]);
  ell(c, 602, 122, 5, 5, "#14121a"); ell(c, 602, 122, 3, 3, "#c8a020"); R(c, 600, 122, 4, 1, "#f2d048"); em.push([598, 118, 8, 8]);
  R(c, 596, 136, 3, 2, "#3fd07a"); R(c, 601, 136, 3, 2, "#ff3a3a"); em.push([596, 136, 3, 2], [601, 136, 3, 2]);
  for (let i = 0; i < 40; i++) P(c, 560 + i, 148 + Math.round(Math.sin(i / 4) * 2) - (i > 30 ? (i - 30) * 2 : 0), "#e8b820");
  txt(c, "BAY 3", 514, 60, "#8a869c", 1, 1);
  // sign: wet floor cone feel + hazard bin
  R(c, 506, 130, 10, 28, "#d83a3a"); U.outline(c, 506, 130, 10, 28, "#7a1a1a"); R(c, 508, 134, 6, 5, "#f4f0e8"); R(c, 509, 136, 4, 1, "#c0302c");
  return em;
}

function makeGlass() {
  const cv = RP.u.mk(W, 256), g = cv.getContext("2d");
  // slider glass over the reception window + papers taped to it + intercom grille
  U.dshade(g, 166, 54, 192, 88, "#ffffff", (x, y) => { const d = ((x - 166) + (y - 54) + 4000) % 74; const e = ((x - 166) + (y - 54) + 4000 - 28) % 150; return (d < 7 ? 0.9 : 0) + (e < 3 ? 0.8 : 0); }, 0.22);
  U.dshade(g, 166, 54, 192, 8, "#8aa8a0", (x, y) => 1 - (y - 54) / 8, 0.3);
  R(g, 262, 54, 2, 88, "#8aa8a0"); R(g, 261, 54, 1, 88, "#e8f6ff");
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; P(g, 226 + Math.round(Math.cos(a) * 5), 114 + Math.round(Math.sin(a) * 4), "#2a3a34"); } ell(g, 226, 114, 1, 1, "#2a3a34");
  R(g, 178, 66, 54, 20, "#f4f0e4"); U.outline(g, 178, 66, 54, 20, "#a8a08c"); txtC(g, "PLEASE HAVE", 205, 69, "#1d1622", 1, 0); txtC(g, "YOUR ID READY", 205, 75, "#1d1622", 1, 0); txtC(g, "NO NOT THAT ID", 205, 81, "#c0302c", 1, 0);
  R(g, 284, 112, 44, 18, "#fff6a8"); U.outline(g, 284, 112, 44, 18, "#a89858"); txtC(g, "RHONDA IS NOT", 306, 115, "#1d1622", 1, 0); txtC(g, "A MIND READER", 306, 121, "#1d1622", 1, 0);
  return cv;
}

function drawFront(c) { if (!glassLayer) glassLayer = makeGlass(); c.drawImage(glassLayer, 0, 0); }

function drawCounter(c, S) {
  PK.counter(c, 156, 142, 212, 32, { top: "#c8c0a8", front: "#4a6a60", seed: 6, panelW: 34 });
  // take-a-number dispenser, bell, stack of forms
  R(c, 168, 134, 14, 10, "#c0302c"); U.HL(c, 168, 134, 14, "#ff6a5a"); R(c, 171, 138, 8, 4, "#f4f0e8"); R(c, 174, 144, 8, 3, "#f4f0e8");
  ell(c, 320, 143, 5, 2, "#c8a850"); R(c, 319, 139, 2, 4, "#c8a850"); P(c, 319, 138, "#fff0b0");
  R(c, 330, 135, 20, 8, "#f4f0e4"); R(c, 330, 135, 20, 1, "#ffffff"); R(c, 331, 137, 18, 1, "#c8c4b4"); R(c, 331, 140, 18, 1, "#c8c4b4");
  // the pen on its chain
  R(c, 284, 140, 2, 3, "#8a869c"); for (let i = 0; i < 5; i++) P(c, 286 + i, 141 + (i % 2), "#c8c4d8"); R(c, 291, 140, 9, 2, "#2f62b8"); P(c, 300, 141, "#1d1622");
}
function drawTable(c, S) {
  PK.table(c, 68, 160, 84, 34, { color: "#b89a6a", seed: 3 });
  R(c, 82, 136, 56, 20, "#f4f0e4"); U.outline(c, 82, 136, 56, 20, "#a8a08c"); txtC(c, "AFTERCARE", 110, 139, "#1d1622", 1, 0); txtC(c, "SIT. EAT.", 110, 145, "#c0302c", 1, 0); txtC(c, "DON'T FAINT", 110, 150, "#c0302c", 1, 0);
  if (!RP.state.f.a2_ate) {
    ell(c, 86, 163, 11, 3, "#e8e4f0"); [[80, 160], [86, 159], [92, 160]].forEach(([x, y]) => { ell(c, x, y, 4, 2, "#c8a070"); P(c, x - 1, y - 1, "#5a3a20"); P(c, x + 1, y, "#5a3a20"); });
    [[108, "#f2a030"], [118, "#6ac060"], [128, "#f2a030"]].forEach(([x, col]) => { R(c, x, 154, 7, 10, col); U.HL(c, x, 154, 7, "#ffffff"); R(c, x + 3, 150, 1, 4, "#e8e4f0"); R(c, x + 1, 158, 5, 3, "#fff6d0"); });
  } else { P(c, 82, 163, "#c8a070"); P(c, 85, 163, "#c8a070"); R(c, 108, 160, 7, 4, "#f2a030"); }
}
function drawSeats(c) { PK.airportSeats(c, 372, 148, 96, { color: "#3a7a8a" }); R(c, 378, 134, 18, 2, "#d8d0b8"); R(c, 384, 132, 12, 3, "#c0302c"); R(c, 400, 134, 14, 2, "#5a8ad8"); }
function drawCooler(c) { PK.waterCooler(c, 478, 140, {}); }

function light(S) {
  return {
    ambient: "#c3ced4",
    lights: [
      { x: 94, y: 10, r: 200, color: "#e8f6ff", steps: 4, sy: 1.0 },
      { x: 294, y: 10, r: 210, color: "#e8f6ff", steps: 4, sy: 1.0 },
      { x: 494, y: 10, r: 200, color: "#e8f6ff", steps: 4, sy: 1.0 },
      { x: 266, y: 90, r: 120, color: "#fff2c8", steps: 3, power: 0.55 },
      { x: 602, y: 124, r: 70, color: "#ffd8a0", steps: 2, power: 0.5 }
    ],
    key: { x: 294, y: 4 }, shadow: 0.45
  };
}

/* ------------------------------------------------------------------ scenes */
async function fillForm(S) {
  if (S.f.a2_formDone) { await RP.say("It's done. I'm not touching that form again. It knows too much."); return; }
  await RP.walkTo(292, 210, "back");
  await RP.lines([
    "I bend over the counter. The pen's chain is six inches long. I look like a flamingo with a dream.",
    "NAME: " + (S.name || "DJ NOBODY") + ". I write it carefully. Rhonda will misspell it anyway.",
    "OCCUPATION: DJ. I cross it out. \"Aspiring DJ.\" I cross that out. \"Unemployed.\" That one stays.",
    "EMERGENCY CONTACT: Marcus. (Plus three.)",
    "HAVE YOU EVER FELT DREAD? Circle one: YES / YES.",
    "SEVEN pages, front and back. Fourteen pages of me describing a life choice."
  ]);
  S.f.a2_formDone = true; RP.refreshInv();
  await RP.say("Done. Hand-cramped, soul-stained, and legally binding.");
}

async function submitDocs(S) {
  if (S.f.a2_cleared) { await RP.say("You're in the system, hon. Go see Bev at bay three. Don't pass out near my plant.", "a2_rhonda"); return; }
  if (!S.f.a2_formGot) { await RP.say("Form? What form? You haven't even taken a number.", "a2_rhonda"); return; }
  const need = [];
  if (!RP.has("a2_form") || !S.f.a2_formDone) need.push(!RP.has("a2_form") ? "the form" : "a COMPLETED form");
  if (!RP.has("a2_bill")) need.push("proof of address");
  if (need.length) {
    await RP.say("I need " + need.join(" and ") + ". And your ID, which I see you have. Wallet's a start.", "a2_rhonda");
    if (!RP.has("a2_bill")) await RP.say("Proof of address. Not a vibe. An envelope.", "a2_rhonda");
    return;
  }
  await RP.say("Here. ID, bill and the form.");
  RP.sfx("click");
  await RP.lines([
    "@a2_rhonda This ID is you at nineteen. Who did this to you?",
    "It's me. I got a haircut. And a life.",
    "@a2_rhonda This bill is from 4C. Bushwick. Overdue. Good. That's a real address. ...Occupation: unemployed. Honest. I like that.",
    "@a2_rhonda Your emergency contact is Marcus Plus Three?",
    "It's a family name."
  ]);
  RP.take("a2_bill"); RP.take("a2_form");
  RP.sfx("success");
  S.f.a2_cleared = true;
  await RP.lines(["@a2_rhonda STAMP. You're cleared. Go see Bev, behind the curtain with the sad face.", "The curtain has a sad face?", "@a2_rhonda It was a joke. The sad face is mine. Bay three."]);
  RP.toast("Cleared! Talk to Nurse Bev at bay 3.");
}

async function talkRhonda(S) {
  if (!S.f.a2_numTaken) {
    S.f.a2_numTaken = true;
    await RP.lines(["@a2_rhonda Take a number.", "There's nobody here.", "@a2_rhonda Take a number anyway."]);
  }
  if (S.f.a2_cleared) { await RP.say("You're cleared, hon. Bev's at bay three. Don't pass out near my plant.", "a2_rhonda"); return; }
  await RP.convo([
    { text: "I'd like to donate plasma.", when: S2 => !S2.f.a2_formGot, once: true, run: async () => {
      await RP.lines([
        "@a2_rhonda New donor? Aren't you brave. Okay. ID, proof of address and Form 27-B.",
        "Form 27-B?",
        "@a2_rhonda Voluntary Acknowledgment of Voluntary Donation. It's the one where you say you volunteered voluntarily.",
        "@a2_rhonda Pen's on the chain. Don't ask about the chain."
      ]);
      RP.give("a2_form"); S.f.a2_formGot = true;
      await RP.say("Rhonda slides Form 27-B through the slot. It's seven pages. It's warm.");
    } },
    { text: "Where do I get proof of address? I got locked out.", when: S2 => S2.f.a2_formGot && !RP.has("a2_bill"), run: async () => {
      await RP.lines(["@a2_rhonda A bill. A lease. An envelope with your name and a real street. Does anybody keep your mail?", "My neighbor Lou. He keeps everybody's mail.", "@a2_rhonda Then you know what to do."]);
    } },
    { text: "How much does it pay?", run: async () => {
      await RP.lines(["@a2_rhonda New donors get a hundred dollars loaded on a LifeDrop Rewards card.", "A card? Not cash?", "@a2_rhonda Cash is for people with plans. The card is for people with plasma."]);
    } },
    { text: "Is it safe?", run: async () => { await RP.lines(["@a2_rhonda Safer than the subway. Don't tell the subway."]); } },
    { text: "What's in the cookie?", run: async () => { await RP.lines(["@a2_rhonda A cookie. That's all I'm legally allowed to say."]); } },
    { text: "Never mind.", end: true }
  ]);
}

async function talkBev(S) {
  if (S.f.a2_plasma) { await bevAfter(S); return; }
  if (!S.f.a2_cleared) { await RP.lines(["@a2_bev Not without Rhonda's stamp. I don't sneeze without Rhonda's stamp.", "Got it. Form. Bill. Pen on a chain."]); return; }
  await donate(S);
}
async function bevAfter(S) {
  if (S.f.a2_woozy) { await RP.say("Cookie. Juice. Table over there. Sit for five minutes. If you faint, faint toward the carpet.", "a2_bev"); return; }
  await RP.say("See you Thursday. Don't lift anything heavy. Don't DJ. ...You DJ? Don't DJ.", "a2_bev");
}
async function donate(S) {
  await RP.walkTo(500, 214, "right");
  await RP.lines([
    "@a2_bev You're a new donor? Wonderful. Finger prick first. Then the chair.",
    "I hold out my hand like I'm being knighted. A tiny sting. A drop of blood in a tiny test tube.",
    "@a2_bev Protein: good. Iron: acceptable. Mood: unclear. You're cleared. Hop in the chair."
  ]);
  const i = await RP.choose(["Look at the ceiling", "Think about pizza", "Watch the needle go in (don't)"]);
  await RP.say("I lie back. The chair says \"vinyl\" with a creak. Bev holds up a needle the length of a pencil.");
  if (i === 0) await RP.lines(["I count the ceiling tiles. Forty-eight. Forty-nine. Fifty.", "@a2_bev You're doing great.", "I'm on tile twelve. I have never been so far from tile twelve."]);
  else if (i === 1) await RP.lines(["Pizza. A slice of Sal's, extra cheese. Grease on a paper plate. The sound of the crust.", "@a2_bev You're drooling.", "I'm thinking about Sal's. I'm definitely thinking about Sal's."]);
  else await RP.lines(["I watch. I watch all of it. The room does a slow barrel roll.", "@a2_bev Everyone has to look once. Nobody ever looks twice."]);
  RP.sfx("zip");
  await RP.fadeTo(1, 700);
  await RP.say("A machine hums. Plasma is the yellow part of blood. It goes into a bag. The red part comes back. It's the most efficient thing I've ever seen.", "nar");
  await RP.say("Forty-five minutes later.", "nar");
  S.f.a2_plasma = true; S.f.a2_woozy = true; S.f.a2_cardBal = 100;
  RP.give("a2_card");
  A2.beat(S);
  await RP.fadeTo(0, 700);
  RP.sfx("success");
  await RP.lines([
    "@a2_bev Done. Here's your LifeDrop Rewards card. A hundred dollars loaded.",
    "A hundred dollars. For my plasma.",
    "@a2_bev Welcome to the family. Aftercare is the table on the left. Cookie, juice, five minutes. It's not optional.",
    "I sit up. The room moves a little after I do. Everything is slightly yellow."
  ]);
  RP.toast("Aftercare: the cookie and the juice.");
}

async function aftercare(S) {
  if (!S.f.a2_plasma) { await RP.say("It says \"AFTERCARE,\" and I haven't done any care yet. I should earn the cookie."); return; }
  if (S.f.a2_ate) { await RP.say("Crumbs and an empty juice box. It was a good cookie. It was the worst cookie. Both."); return; }
  await RP.walkTo(110, 212, "back");
  await RP.lines([
    "A cookie. Oatmeal raisin. It's been in this room since the Bush administration.",
    "I eat it. It's dry. It's sad. It tastes like a participation trophy.",
    "A juice box. Apple. A straw the size of a coffee stirrer. I drink it in one slurp.",
    "I feel... better? I feel like a person again. A person who just sold a part of himself for a hundred dollars."
  ]);
  S.f.a2_ate = true; S.f.a2_woozy = false;
  RP.relight();
  await RP.say("Good job. You're free to go. See you in a couple of days.", "a2_bev");
}

RP.room({
  id: "a2_plasma", act: 2, name: "LifeDrop Plasma Center",
  paint,
  cacheKey: S => (S.f.a2_ate ? "a" : "n"),
  light,
  ambience: "office",
  walk: [[8, 208], [632, 208], [632, 252], [8, 252]],
  start: { x: 70, y: 232, face: "right" },
  update: A2.update,
  fx: [
    { type: "dust", rect: [90, 20, 180, 140], count: 18, color: "#ffffff" },
    { type: "blink", items: [{ r: [602, 140, 2, 2], color: "#3fd07a", rate: 600, phase: 0 }, { r: [606, 140, 2, 2], color: "#ff3a3a", rate: 900, phase: 1 }] }
  ],
  drawFront,
  actors: [
    { id: "a2_rhonda", char: "a2_rhonda", x: 262, y: 176, face: "front", act: "stand", name: "Rhonda", noTurn: true, talkDist: 38 },
    { id: "a2_bev", char: "a2_bev", x: 504, y: 214, face: "right", act: "stand", name: "Nurse Bev" }
  ],
  sprites: [
    { y: 182, draw: (c, S) => drawCounter(c, S) },
    { y: 196, draw: (c, S) => drawTable(c, S) },
    { y: 196, draw: c => drawSeats(c) },
    { y: 190, draw: c => drawCooler(c) }
  ],
  hotspots: [
    { id: "a2_exit", name: "exit", r: [6, 28, 54, 136], z: 30, walk: [66, 232, "left"], look: "The exit. Beyond it: Atlantic Avenue, fresh air and the possibility of a better decision.",
      exit: S => S.f.a2_woozy ? "I stand up too fast and the room does a wave. Aftercare first: cookie, juice, five minutes." : "travel",
      push: "The door has a sign: \"PULL.\" I am a man who pulls." },
    { id: "a2_desk", name: "reception window", r: [160, 46, 206, 102], z: 20, walk: [262, 210, "back"], look: "A reception window with bulletproof-looking glass and a speaking grille. Everything behind it is beige. Everything in front of it is nervous.", use: "I'll talk to Rhonda. She's behind the glass. She's got a voice like a notary.", open: "The sliding glass opens exactly eight inches. Not a millimeter more." },
    { id: "a2_pen", name: "pen on a chain", r: [282, 136, 22, 12], z: 40, walk: [292, 210, "back"], look: "A blue pen, chained to the counter by six inches of steel. Whoever wrote the first form here has been holding it hostage ever since.",
      use: S => RP.has("a2_form") ? fillForm(S) : "I need a form to go with the pen. A pen without a form is just a chain with ambitions.", pickup: "The chain says no. The chain has said no to better people than me." },
    { id: "a2_number", name: "take-a-number machine", r: [166, 132, 18, 16], z: 40, walk: [176, 210, "back"], look: "A \"take a number\" dispenser. It says NOW SERVING 12. It has said that since 2019.",
      pickup: async S => { await RP.say("I pull a ticket: number 0. \"You are a statistic.\" It's a vibe."); }, use: "Number 0. I tear it off. It reads \"Next week.\"", push: "It dispenses a ticket that says \"nope.\"" },
    { id: "a2_sign", name: "NOW SERVING sign", r: [210, 26, 116, 20], z: 22, walk: [262, 210, "back"], look: "NOW SERVING 12. I've been here eleven minutes. Nobody's been served. The number is a dream.", use: "No buttons. Just hope." },
    { id: "a2_clock", name: "clock", r: [338, 20, 20, 20], z: 22, walk: [350, 210, "back"], look: "It's been 3:15 since 2019. Rhonda says it's \"not broken, just committed.\"" },
    { id: "a2_fame", name: "Donor of the Month", r: [382, 46, 70, 62], z: 22, walk: [418, 206, "back"], look: "DONOR OF THE MONTH: PEARL T. 212X. A woman with two hundred twelve donations and a smile you can't trust.", pickup: "It's on the wall. Pearl would hunt me down.", use: "I can't be donor of the month. I'm not even donor of the minute." },
    { id: "a2_vein", name: "poster", r: [464, 34, 34, 48], z: 22, walk: [480, 206, "back"], look: "\"KNOW YOUR VEINS.\" A diagram of an arm with a heart that looks like a candy. Mine are the shy kind.", pickup: "It's a poster. It's educational. I need no more education." },
    { id: "a2_droppy", name: "Droppy poster", r: [74, 28, 56, 82], z: 22, walk: [102, 208, "back"], look: "DROPPY the LifeDrop mascot: \"GIVE. GET. REPEAT.\" He's a drop of blood with a smile. I've never trusted a mascot with eyes. Or a drop.", talk: "Droppy doesn't answer. Droppy looks at me with his happy little eyes.", pickup: "Droppy's staying. He's a brand." },
    { id: "a2_seats", name: "waiting seats", r: [370, 128, 100, 66], z: 24, walk: [420, 208, "back"], look: "Three connected seats and a stack of magazines, including a \"Plasma Monthly\" with a smiling blood cell on the cover.", use: "Sit? No. If I sit down, I'll never get up. It's a one-way chair.", pickup: "They're bolted down. Everyone's bolted down." },
    { id: "a2_cooler", name: "water cooler", r: [476, 138, 22, 50], z: 24, walk: [486, 208, "back"], look: "A water cooler with a note: \"DRINK WATER. IT HELPS. -MGMT\" Someone wrote \"LIES\" under it.", use: S => RP.say("Cold water. Cold, wonderful water. I drink a tiny paper cone. It's gone. I want another. Dignity says no."), pickup: "It's the heaviest water cooler in Brooklyn." },
    { id: "a2_chair", name: "donation chair", r: [524, 94, 86, 76], z: 30, walk: [504, 214, "right"], look: "The donation chair: vinyl, reclining, with the faint outline of everyone who's ever sat there. A glow of nervous energy. And a coffee stain.",
      use: S => S.f.a2_plasma ? "I'm done here. For now." : (S.f.a2_cleared ? donate(S) : "I should be cleared first. Rhonda checks my paperwork like it's a passport."), open: "The chair doesn't open. It reclines. There's a difference." , push: "It reclines a little. That's all it can offer." },
    { id: "a2_machine", name: "plasma machine", r: [590, 92, 24, 52], z: 32, walk: [586, 210, "back"], look: "A plasma-separator machine with a little centrifuge and a lot of tubing. It's humming. It's making a sound like a very patient fridge.", use: "I'm not touching that. It's the closest thing here to a robot with opinions.", pickup: "It's bolted to the floor. Mostly because people ask." },
    { id: "a2_aftercare", name: "aftercare table", r: [66, 142, 88, 54], z: 30, walk: [112, 212, "back"],
      look: S => S.f.a2_ate ? "Crumbs and a crushed juice box. The sign says \"SIT. EAT. DON'T FAINT.\" I did two of the three." : "The aftercare table: oatmeal raisin cookies and apple juice boxes. The sign: \"SIT. EAT. DON'T FAINT.\"",
      use: S => aftercare(S), pickup: S => aftercare(S), open: S => aftercare(S) },
    { id: "a2_hazard", name: "sharps bin", r: [504, 128, 14, 32], z: 24, walk: [510, 206, "back"], look: "A red sharps bin. Very red. Very sharp. Very much not for putting your phone in.", use: "No.", open: "I don't need to see what's inside. I know what's inside. It's the wild west." },
    { id: "a2_rhonda", name: "Rhonda", z: 80, look: "Rhonda: glasses, lanyard, a smile like a clipboard. She's been behind that glass longer than the glass has.", talk: S => talkRhonda(S),
      give: async (S, item) => { if (item === "a2_form" || item === "a2_bill") return submitDocs(S); if (item === "wallet") return ["@a2_rhonda Keep your wallet, hon. I'm not allowed to touch it. It's too sad."]; return ["@a2_rhonda I'm not taking that."]; } },
    { id: "a2_bev", name: "Nurse Bev", z: 80, look: "Nurse Bev: gray bun, teal scrubs, the calmest hands in Brooklyn. She's seen everything. She's seen it twice.", talk: S => talkBev(S),
      give: async (S, item) => { if (item === "a2_card") return ["@a2_bev That's yours, hon. I only handle the ones I give out."]; return ["@a2_bev I can't take that. I'm on the clock."]; } }
  ],
  combos: [
    ["a2_form", "a2_pen", S => fillForm(RP.state)],
    ["a2_form", "a2_rhonda", S => submitDocs(RP.state)],
    ["a2_bill", "a2_rhonda", S => submitDocs(RP.state)],
    ["a2_form", "a2_desk", S => submitDocs(RP.state)],
    ["a2_bill", "a2_desk", S => submitDocs(RP.state)],
    ["wallet", "a2_rhonda", ["@a2_rhonda Keep your wallet, hon. I'm not allowed to touch it. It's too sad."]],
    ["usb_cat", "a2_rhonda", "Rhonda doesn't want 4,000 cat photos. Rhonda has a cat. Rhonda has opinions."],
    ["a2_card", "a2_aftercare", "I'm not spending the card on a juice box. They're free. That's the only free thing in this building."],
    ["phone", "a2_desk", "I'd text Rhonda, but she's four feet away and thinks texts are a form of cowardice."]
  ]
});
})();
