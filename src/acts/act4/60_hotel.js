/* Act 4 — a4_hotel: Hotel Zum Pfau, 4 a.m. Axl Vanta has checked into YOUR room (Room 12) as you.
   Show the clerk your passport, give Axl a postcard to autograph (he can't resist a pen), take the key, sleep.
   In the morning Ingrid calls with the Harbor Lights Festival offer. -> RP.completeAct.
   Flags: a4_hotelIntro a4_clerkOk a4_postcard a4_axlSigned a4_axlGone a4_key a4_offer a4_poster */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u, PK = RP.PK, A4 = RP.a4;
const { R, P, ell, poly, line, txt, txtW, mulberry, mix } = U;
const W = 640;

const sprDesk = A4.spr(190, 62, c => {
  PK.counter(c, 2, 6, 186, 50, { top: "#8a5a3a", front: "#4a2a2a", panelW: 30 });
  R(c, 20, 0, 4, 8, "#c8a030"); ell(c, 22, 1, 5, 3, "#c8a030"); R(c, 17, 0, 10, 1, "#fff0a0");                          // brass bell
  R(c, 70, 0, 26, 7, "#efe6d0"); R(c, 70, 0, 26, 1, "#ffffff"); R(c, 72, 2, 20, 1, "#8a8aa0"); R(c, 72, 4, 14, 1, "#8a8aa0");   // guest book
  R(c, 130, 2, 8, 6, "#17131f"); R(c, 131, 0, 1, 3, "#c0302c"); R(c, 134, 0, 1, 3, "#2f62b8");
});
const sprPostcards = A4.spr(22, 40, c => {
  R(c, 10, 14, 3, 24, "#8a6a30"); R(c, 6, 36, 11, 3, "#5a4220");
  for (let i = 0; i < 4; i++) { R(c, 3 + i * 3, 2 + (i % 2), 10, 14, "#efe6d0"); R(c, 4 + i * 3, 3 + (i % 2), 8, 8, ["#5a8ad8", "#ff9a5a", "#9be15d", "#c8a0e8"][i]); }
});
const sprKeyOnTable = A4.spr(18, 12, c => { ell(c, 5, 6, 4, 4, "#c8a030"); ell(c, 5, 6, 2, 2, "#8a6a10"); R(c, 8, 5, 8, 2, "#c8a030"); R(c, 13, 7, 2, 3, "#c8a030"); P(c, 3, 4, "#fff0a0"); });
const sprTable = A4.spr(76, 34, c => { PK.table(c, 2, 4, 72, 26, { color: "#4a3a2a", top: "#6a4a30", round: false }); R(c, 8, 2, 22, 4, "#efe6d0"); R(c, 36, 1, 8, 5, "#c0302c"); });
const sprRing = A4.spr(40, 100, c => {
  R(c, 19, 40, 2, 56, "#2a2838"); R(c, 10, 94, 20, 2, "#2a2838"); R(c, 14, 90, 4, 4, "#2a2838"); R(c, 24, 90, 4, 4, "#2a2838");
  ell(c, 20, 22, 17, 17, "#d8d8f0"); ell(c, 20, 22, 14, 14, "#2a2838"); ell(c, 20, 22, 15, 15, "#2a2838"); ell(c, 20, 22, 12, 12, "#00000000");
  for (let a = 0; a < 40; a++) { const ang = a / 40 * Math.PI * 2; ell(c, 20 + Math.round(Math.cos(ang) * 14), 22 + Math.round(Math.sin(ang) * 14), 1, 1, "#ffffff"); }
  c.clearRect(11, 13, 18, 18); R(c, 18, 20, 4, 4, "#14121c"); R(c, 19, 21, 2, 2, "#3a8aff");
});
const sprPlantH = A4.spr(78, 74, c => PK.plant(c, 2, 2, { size: 3, seed: 12 }));
const sprSuitcase = A4.spr(30, 50, c => { PK.suitcase(c, 2, 4, { color: "#ffd23f", w: 26, h: 36, seed: 4 }); R(c, 10, 20, 10, 2, "#17131f"); txt(c, "AV", 10, 24, "#17131f"); });

/* ------------------------------------------------------------------ paint */
function chandelier(c, x, y, em) {
  R(c, x, 0, 1, y, "#2a2020"); R(c, x - 3, y, 7, 4, "#c8a030"); R(c, x - 22, y + 4, 45, 3, "#c8a030"); R(c, x - 22, y + 4, 45, 1, "#fff0a0");
  [-18, -9, 0, 9, 18].forEach((dx, i) => { R(c, x + dx, y + 6, 1, 8, "#c8a030"); ell(c, x + dx, y + 16, 2, 3, "#fff2c0"); P(c, x + dx, y + 14, "#ffffff"); em.push([x + dx - 2, y + 13, 5, 6]); PK.glow(c, x + dx, y + 16, 12, "#ffd890", { strength: 0.8 }).forEach(r => em.push(r)); });
  line(c, x - 22, y + 6, x - 10, y + 26, "#c8a030"); line(c, x + 22, y + 6, x + 10, y + 26, "#c8a030"); R(c, x - 4, y + 24, 9, 3, "#c8a030");
}
function paint(c, S) {
  const em = []; const E = a => { if (a && a.length) for (const r of a) em.push(r); return a; };
  PK.plaster(c, 0, 0, W, 134, { base: "#7a3a44", seed: 41, patches: 0, stains: 1, cracks: 0 });
  // damask-ish vertical stripes, gold picture rail and dado
  for (let x = 4; x < W; x += 16) { R(c, x, 0, 6, 134, "#8a4452"); R(c, x + 1, 0, 1, 134, "#a85a68"); for (let y = 6; y < 130; y += 12) { P(c, x + 3, y, "#9a4a5a"); P(c, x + 2, y + 1, "#6a2a36"); P(c, x + 4, y + 1, "#6a2a36"); } }
  R(c, 0, 14, W, 3, "#c8a030"); R(c, 0, 14, W, 1, "#fff0a0"); R(c, 0, 17, W, 2, "#5a3a10");
  R(c, 0, 128, W, 4, "#c8a030"); R(c, 0, 128, W, 1, "#fff0a0");
  // wood paneling
  R(c, 0, 132, W, 40, "#4a2a22"); for (let x = 0; x < W; x += 40) { R(c, x + 3, 136, 34, 32, "#5a3428"); R(c, x + 3, 136, 34, 1, "#8a5a44"); R(c, x + 3, 167, 34, 1, "#2a1410"); R(c, x + 3, 136, 1, 32, "#7a4a38"); R(c, x + 36, 136, 1, 32, "#2a1410"); }
  R(c, 0, 168, W, 5, "#2a1410"); R(c, 0, 168, W, 1, "#8a5a44");
  // lobby couch (green velvet)
  PK.couch(c, 104, 124, 196, { color: "#2f6a4a", h: 64, pillowColor: "#c8a030" });
  // floor: hotel carpet with a runner
  PK.carpet(c, 0, 173, W, 83, { pattern: "hotel", base: "#6a2a3a", accent: "#d8b060", seed: 3 });
  PK.rug(c, 120, 200, 400, 46, { colors: ["#3a2a5a", "#c8a030", "#7a3a4a"], shape: "rect" });
  // entrance door (left) and window
  PK.door(c, 6, 54, 54, 118, { color: "#3a2a4a", metal: false, window: true, panels: 0, knob: true, seed: 5 });
  R(c, 10, 60, 46, 62, "#14101c"); R(c, 12, 62, 42, 58, "#2a3a6a"); PK.gradV(c, 12, 62, 42, 58, ["#3a4a8a", "#1a2a5a"], { dither: 1 }); R(c, 32, 62, 2, 58, "#14101c"); R(c, 12, 90, 42, 2, "#14101c"); E([[12, 62, 42, 58]]);
  for (let i = 0; i < 10; i++) PK.util.AR(c, 14 + (i * 13) % 38, 64 + (i * 17) % 52, 1, 5, "#bcd0ff", 0.5);
  txt(c, "AUSGANG", 10, 46, "#ffd23f");
  E(PK.window(c, 80, 30, 78, 86, { view: "city", time: "night", frame: "#6a4a3a", sill: "#8a6a4a", seed: 9, bridge: false }));
  // mirror, clock
  PK.frame(c, 172, 32, 50, 74, { mirror: true, color: "#c8a030", thick: 4 });
  R(c, 520, 50, 22, 82, "#4a2a1a"); R(c, 520, 50, 22, 2, "#8a5a3a"); R(c, 524, 56, 14, 14, "#efe6d0"); ell(c, 531, 63, 6, 6, "#efe6d0"); ell(c, 531, 63, 5, 5, "#c8c4b0"); R(c, 531, 59, 1, 5, "#17131f"); R(c, 531, 63, 4, 1, "#17131f");
  R(c, 524, 76, 14, 50, "#3a2014"); R(c, 529, 84, 4, 24, "#c8a030"); ell(c, 531, 112, 4, 4, "#c8a030");
  // key rack behind the desk
  R(c, 340, 38, 150, 90, "#3a2018"); R(c, 340, 38, 150, 2, "#8a5a3a"); R(c, 340, 126, 150, 2, "#1a0a08");
  for (let r = 0; r < 4; r++) for (let q = 0; q < 7; q++) { const x = 346 + q * 20, y = 44 + r * 20; R(c, x, y, 17, 17, "#14080a"); R(c, x, y, 17, 1, "#5a3a2a"); if ((r * 7 + q) % 9 !== 0 && !(r === 2 && q === 4)) { ell(c, x + 8, y + 9, 2, 2, "#c8a030"); R(c, x + 8, y + 3, 1, 5, "#c8a030"); } txt(c, String(r * 7 + q + 1 < 10 ? "0" + (r * 7 + q + 1) : r * 7 + q + 1), x + 3, y + 1, "#a8743e"); }
  R(c, 410, 44 + 2 * 20, 17, 17, "#14080a"); txt(c, "12", 413, 85, "#c0302c");
  R(c, 340, 22, 150, 14, "#2a1410"); txt(c, "HOTEL ZUM PFAU", 364, 26, "#ffd23f"); em.push([340, 22, 150, 14]);
  // pfau emblem
  ell(c, 351, 29, 4, 4, "#2a7a8a"); for (let a = -2; a <= 2; a++) { const ang = -Math.PI / 2 + a * 0.4; line(c, 351, 29, 351 + Math.round(Math.cos(ang) * 9), 29 + Math.round(Math.sin(ang) * 9), a % 2 ? "#39d0ff" : "#3a8a4a"); }
  // elevator
  R(c, 556, 62, 74, 114, "#2a1410"); R(c, 560, 66, 66, 106, "#c8a030"); PK.gradV(c, 560, 66, 66, 106, ["#e8c860", "#a8802a"], { dither: 1 }); R(c, 592, 66, 2, 106, "#5a3a10"); R(c, 560, 66, 66, 2, "#fff0a0");
  for (let y = 72; y < 170; y += 8) { P(c, 565, y, "#fff0a0"); P(c, 620, y + 3, "#fff0a0"); }
  R(c, 570, 54, 46, 8, "#0a0810"); txt(c, "E", 590, 55, "#ff4a4a"); R(c, 600, 56, 10, 4, "#ff4a4a"); em.push([570, 54, 46, 8]);
  R(c, 632, 110, 6, 14, "#c8a030"); ell(c, 635, 117, 2, 2, "#ff4a4a"); em.push([633, 115, 4, 4]);
  chandelier(c, 330, 30, em);
  return em;
}
function drawStatic() {}

function draw(c, S, t) {
  // elevator indicator
  const f = Math.floor(t / 1500) % 4;
  R(c, 600, 56, 10, 4, "#0a0810"); R(c, 600 + f * 2, 56, 2, 4, "#ff4a4a");
  // the ring light's flicker
  if (!S.f.a4_axlGone) { const g = Math.floor(t / 300) % 11 === 5; ell(c, 220, 122, 12, 12, g ? "#e8e8ff" : "#ffffff"); ell(c, 220, 122, 9, 9, "#2a2838"); }
}
function drawTop(c, S, t) {
  A4.drawCall(c, S, t);
  if (S.f.a4_poster) A4.drawPoster(c, S, t);
}
A4.drawPoster = function (c, S, t) {
  const x = 226, y = 10, w = 188, h = 236;
  R(c, x - 4, y - 4, w + 8, h + 8, "#0a0618"); R(c, x - 2, y - 2, w + 4, h + 4, "#c8a030"); R(c, x, y, w, h, "#1a0a3a");
  PK.gradV(c, x, y, w, h, ["#14082c", "#3a1a5a", "#a8406a", "#ff9a5a", "#ffd27a"], { dither: 1 });
  // waterfront skyline and the moon
  ell(c, x + 130, y + 70, 18, 18, "#fff4d0"); PK.glow(c, x + 130, y + 70, 28, "#ffd890", { strength: 0.8 });
  R(c, x, y + 150, w, h - 150, "#14082c"); const rnd = mulberry(11);
  for (let bx = x; bx < x + w; bx += 11) { const bh = 14 + Math.floor(rnd() * 34); R(c, bx, y + 150 - bh, 10, bh, "#241040"); for (let wy = y + 152 - bh; wy < y + 148; wy += 4) if (rnd() < 0.4) P(c, bx + 2 + Math.floor(rnd() * 6), wy, "#ffd27a"); }
  PK.gradV(c, x, y + 150, w, 24, ["#4a1a58", "#14082c"], { dither: 1 });
  for (let i = 0; i < 20; i++) R(c, x + 8 + (i * 9) % (w - 16), y + 152 + (i * 5) % 18, 3 + (i % 4), 1, i % 2 ? "#ffd27a" : "#ff6cbb");
  // type
  U.txtC(c, "HARBOR LIGHTS", x + w / 2, y + 12, "#ffd23f", 2, 1); U.txtC(c, "FESTIVAL", x + w / 2, y + 28, "#ff6cbb", 2, 1);
  U.txtC(c, "NYC WATERFRONT", x + w / 2, y + 46, "#9fe8ff", 1, 1);
  U.txtC(c, "AXL VANTA", x + w / 2, y + 96, "#ffd23f", 3, 2);
  U.txtC(c, "+", x + w / 2, y + 120, "#efeaf6", 2, 1);
  const nm = (S.name || "DJ NOBODY").toUpperCase();
  U.txtC(c, nm, x + w / 2, y + 134, "#ffffff", nm.length > 10 ? 2 : 3, 1);
  U.txtC(c, "HEADLINERS", x + w / 2, y + 160, "#ff6cbb", 1, 1);
  U.txtC(c, "SATURDAY NIGHT", x + w / 2, y + 196, "#efeaf6", 1, 1); U.txtC(c, "PIPE HOLE RECORDS PRESENTS", x + w / 2, y + 210, "#9fe8ff", 1, 1);
  R(c, x + 24, y + 222, w - 48, 1, "#ffd23f");
};

function light(S) {
  return {
    ambient: "#5a4260",
    lights: [
      { x: 330, y: 46, r: 260, color: "#ffd890", steps: 5, sy: 1.15, power: 1 },
      { x: 220, y: 130, r: 110, color: "#f0f0ff", steps: 3, power: S.f.a4_axlGone ? 0 : 0.8, rim: true },
      { x: 590, y: 120, r: 90, color: "#ffd890", steps: 3, power: 0.7 },
      { x: 40, y: 80, r: 90, color: "#4a6ac8", steps: 3, power: 0.55 },
      { box: [80, 30, 78, 86], r: 40, color: "#6a7ad8", steps: 2, power: 0.5 }
    ],
    halos: [{ x: 330, y: 46, r: 40, color: "#ffd890", strength: 1 }], rims: [{ x: 330, y: 80, r: 240, color: "#ffd890" }], key: { x: 330, y: 46 }, shadow: 0.55
  };
}

/* ------------------------------------------------------------------ puzzle scenes */
async function brandtTalk(S) {
  if (S.f.a4_key) { await RP.lines(["@a4_brandt Room 12, mein Herr. The lift's on your right. Breakfast is served from seven. Don't come before eight.", "@a4_brandt And thank you for the autograph. I'm keeping it."]); return; }
  if (!S.f.a4_brandtMet) {
    S.f.a4_brandtMet = true;
    await RP.lines(["Hi. I have a reservation. Room 12.", "@a4_brandt Ah. " + A4.misspell(A4.dj(S)) + ". Yes. The room was ready. And then it wasn't.", "@a4_brandt Herr Vanta checked in at one a.m. He said he was you. He took the key and told me you would be his \"guest.\"",
      "He said he was ME?", "@a4_brandt He is very... luminous. He didn't leave a gap in which to ask questions."]);
  }
  await RP.convo([
    { text: "Can you give me another key?", when: S => !S.f.a4_clerkOk, run: async () => { await RP.lines(["@a4_brandt I could. But the room is occupied by a man who says it's his. I require proof of whose it is. A passport, perhaps."]); } },
    { text: "What's Axl doing here, anyway?", when: S => !S.f.a4_brandtAxl, run: async () => { S.f.a4_brandtAxl = true; await RP.lines(["@a4_brandt Herr Vanta wanted the biggest suite. We had a reservation for him: the Kaiserin Suite. But he arrived before the paperwork. And then he saw your room's view of the television tower.", "@a4_brandt He said it was \"symbolic.\" I do not understand the symbol.", "@a4_brandt If he knew his suite was ready, he'd leave in a second. But he won't listen to me. He doesn't listen to anyone but himself. And pens."]); } },
    { text: "Is there anything that makes him get up?", when: S => S.f.a4_brandtAxl && !S.f.a4_brandtPen, run: async () => { S.f.a4_brandtPen = true; await RP.lines(["@a4_brandt Herr Vanta cannot resist a pen. It's a medical condition. Anyone asks for an autograph, and he stops everything.", "@a4_brandt If someone were to... request one, I could then mention the Kaiserin Suite. He'd be out the door before the pen is dry.", "@a4_brandt The postcards are in the rack. They're free. Everyone says it's the best thing in the lobby."]); } },
    { text: "Never mind.", end: true }
  ]);
}
async function brandtGive(S, item) {
  if (item === "a4_passport") {
    if (S.f.a4_clerkOk) return "He's already looked at it. He returned it with the reverence of a man handling a communion wafer.";
    S.f.a4_clerkOk = true;
    await RP.lines(["@a4_brandt (peers at the passport, then at me, then at the passport) The photo is from a time of more hair.", "It's from 2019.", "@a4_brandt It is you. Barely. Room 12 is yours. The key, however, is with Herr Vanta.",
      "@a4_brandt If you could persuade him to leave... I cannot. I'm a hotel clerk. I'm trained only in the art of looking pained."]);
    return;
  }
  if (item === "a4_postcard") return "He raises an eyebrow. \"That's for Herr Vanta. I'm a clerk, not a fan.\"";
  if (item === "a4_key") return "He nods. \"Please keep it. I trust you. For now. This is a hotel, not a jewelry store.\"";
  return "He regards it with polite horror. It's not what he's here for.";
}
async function postcardsTake(S) {
  if (RP.has("a4_postcard") || S.f.a4_axlSigned) return "I've got a postcard. Nobody needs two. Except Axl, and he's asked for none.";
  RP.give("a4_postcard"); S.f.a4_postcard = true;
  await RP.lines(["A free postcard of the hotel, with the TV tower photoshopped to look closer. It's the best thing in the lobby.", "Now, someone who loves a pen..."]);
}
async function axlTalk(S) {
  if (S.f.a4_axlGone) return "He's gone. The suite got him. The lobby feels about forty percent less shiny.";
  if (!S.f.a4_axlMet) {
    S.f.a4_axlMet = true;
    await RP.lines(["Axl Vanta, under a ring light, at 4 a.m. He's wearing sunglasses. Indoors. At night.", "@a4_axl (not looking up) Do you know who I am?", "I do. I'm the one whose room you took.", "@a4_axl I'm sorry, you are...?",
      "I'm " + A4.dj(S) + ". Room 12. Reservation. Ingrid Falk.", "@a4_axl Never heard of you. Never heard of her. Room 12 has a view of the TV tower. It's symbolic. I need symbols.", "It's my room.", "@a4_axl It was your room. Now it's an experience."]);
  }
  await RP.convo([
    { text: "Can I have my key back?", run: async () => { await RP.lines(["@a4_axl No.", "Pretty please?", "@a4_axl Does a lion say \"please\" to a zebra?", "I think the lion probably does. It's a very polite lion.", "@a4_axl (sighs) Brock, remove the zebra."]); await RP.say("(Brock doesn't move. I'm not even sure he heard. I think he's asleep with his eyes open.)"); } },
    { text: "Can I get an autograph? For my mom.", when: S => !S.f.a4_axlAsked, run: async () => {
      S.f.a4_axlAsked = true;
      if (RP.has("a4_postcard")) { await axlSign(S); return; }
      await RP.lines(["@a4_axl An autograph. Of course. Obviously. Where is the paper? Tiff, paper.", "@a4_axl (Tiff pats her pockets, shrugs.) Nothing. Get me a postcard. A card. Anything.", "(I should grab a postcard from the rack on the desk.)"]);
      S.f.a4_axlAsked = false; // ask again once we have the card
    } },
    { text: "(Hold out the postcard.)", when: S => RP.has("a4_postcard"), run: async () => { await axlSign(S); return "end"; } },
    { text: "Never mind.", end: true }
  ]);
}
async function axlSign(S) {
  if (!RP.has("a4_postcard")) { await RP.say("I need something to sign. A card. A postcard. A body part. I'd take a body part."); return; }
  RP.take("a4_postcard"); S.f.a4_axlSigned = true;
  await RP.lines(["@a4_axl A postcard? For your... mother. How sweet. She's got excellent taste. Tiff: the pen. THE PEN.",
    "(He puts the key on the coffee table to use both hands. Writing is hard when you're a genius.)",
    "@a4_axl \"To Mom. You have a very talented... person in your life. Axl Vanta.\" With a flourish. And a star. And a second star. And a third."]);
  if (!S.f.a4_clerkOk) {
    await RP.lines(["@a4_axl There. Now run along.", "(He sweeps the key back into his pocket. Without the clerk on my side, there's nothing to stop him. I need to show Herr Brandt the passport first.)"]);
    S.f.a4_axlSigned = false; RP.give("a4_postcard");   // nothing lost: try again after the passport
    return;
  }
  await RP.lines(["@a4_brandt (leaning over the desk, clears his throat) Herr Vanta. Herr Vanta. A moment. Your suite is ready.", "@a4_axl My WHAT?", "@a4_brandt The Kaiserin Suite. The one you reserved. The standard double was an error. We apologize for the, uh, error.",
    "@a4_axl A SUITE? Why wasn't I TOLD? Brock. Bags. Tiff. Ring light. The suite! (He kisses the postcard.) Take this to Mom!"]);
  RP.sfx("success");
  RP.actor("a4_axl").act = "stand";
  await RP.npcWalk("a4_axl", 420, 236, "right");
  await RP.lines(["@a4_ent2 He's got a TV in the bathroom, I heard.", "@a4_ent1 (stands up very slowly) Bags."]);
  S.f.a4_ent1Gone = true;
  await RP.npcWalk("a4_axl", 590, 236, "right");
  S.f.a4_axlGone = true; RP.relight();
  await RP.say("The lobby sighs. The key sits on the coffee table. It's been a long day for a key.");
}
async function takeKey(S) {
  if (RP.has("a4_key") || S.f.a4_keyTaken) return "I've got the key. Room 12. Mine.";
  if (!S.f.a4_axlGone) { await RP.say(S.f.a4_axlSigned ? "Wait for him to leave." : "It's Axl's. He's literally using it as a coaster. I need him distracted."); return; }
  S.f.a4_keyTaken = true; RP.give("a4_key");
  await RP.lines(["Room 12. On a brass fob the size of a hockey puck. Nobody's stolen a key like this since 1962. It's mine.", "Okay. Bed. Elevator. Now."]);
}
async function goUp(S) {
  if (!RP.has("a4_key")) { await RP.say(S.f.a4_clerkOk ? "I don't have the key. Axl does. Or the table does." : "I don't have a key. I don't even have a room. The clerk's looking at me like a pending form."); return; }
  RP.setClock("SUN 4:40 AM");
  await RP.walkTo(560, 228, "back");
  await RP.fadeTo(1, 800);
  await RP.say("Room 12 is small, clean and smells like fresh towels and ambition. I sleep for eleven hours with my record bag in my arms.", "nar");
  RP.setClock("SUN 3:40 PM");
  RP.place("kid", 560, 232, "front");
  await RP.fadeTo(0, 800);
  await finale(S);
}
async function finale(S) {
  await RP.lines(["I wake up in Room 12, still hugging the bag. The Wi-Fi only works in the lobby, so: the lobby.", "The phone is buzzing like a trapped bee."]);
  await RP.phone([
    { from: "MARCUS", text: "BRO. i saw the clip. berlin. plus three for the next one?? i am NOT asking. i'm just saying", hot: true },
    { from: "DANTE", text: "heard about berlin!! proud. gonna pay u next week", hot: false },
    { from: "KOSMO DELACROIX", text: "Brenton. Heard it went well. Who is this? - K", hot: false },
    { from: "LOU (4B)", text: "Is it loud there? Tell them the hi-hat is too loud.", hot: false },
    { from: "RAY (DEEP CUTS)", text: "Told you. Don't tell anyone I said so.", hot: false },
    { from: "INGRID FALK", text: "Video call. Now. It's not a drill. It's even better.", hot: true }
  ]);
  A4.callOn(S);
  await A4.ingLines(["Good morning. Or what you Americans call morning at four p.m.", "Katja says it was a good night. Katja doesn't say that. She said it twice. I'm checking whether she's okay.",
    "I have another offer. New York. The waterfront. Harbor Lights Festival. Saturday night, main stage.", "@kid HARBOR LIGHTS?", "They want you to headline. They saw the cat video. And then Berlin. And then they saw the cat video again.",
    "There's one more thing. The poster."]);
  S.f.a4_poster = true;
  await RP.wait(900);
  await A4.ingLines(["Your name is on it. So is Axl Vanta's.", "@kid ...Axl Vanta's name is bigger.", "It is slightly bigger. We're working on it. He's... contractual."]);
  S.f.a4_poster = false;
  await RP.lines(["I'm headlining Harbor Lights. In New York. Where my landlord lives."]);
  RP.text("INGRID FALK", "Harbor Lights Festival, NYC waterfront. Headline slot. Poster attached (Axl is slightly bigger, sorry). Flights home are booked. Congratulations.", false);
  A4.callOff(S);
  S.f.a4_offer = true;
  await RP.lines(["Home. New York. A festival. A bag with a seatbelt. A key I never have to return.", "I don't know what to do next. But I know where I'm going."]);
  S.f.noTravel = false;
  await RP.fadeTo(1, 800);
  RP.setClock("MON 9:15 AM");
  await RP.say("New York. Home. A few days later.", "nar");
  await RP.fadeTo(0, 400);
  await RP.completeAct([
    [!!S.f.a4_track, "Remixed \"NYC 93\" with Lou"],
    [!!S.f.a4_released, "Released it on Pipe Hole Records"],
    [!!S.f.a4_viral, "The release spread (and so did the cat)"],
    [!!S.f.a4_deal, "Negotiated a booking (no exposure)"],
    [!!S.f.a4_bagBack, "Recovered the record bag at JFK"],
    [!!S.f.a4_quizDone, "Got past Sven at Halle Neun"],
    [!!S.f.a4_setDone, "Played the Halle Neun set"],
    [!!S.f.a4_axlGone, "Got your hotel room back from Axl Vanta"],
    [!!S.f.a4_offer, "Offered the Harbor Lights Festival headline slot"]
  ]);
}

/* ------------------------------------------------------------------ the room */
RP.room({
  id: "a4_hotel", act: 4, name: "Hotel Zum Pfau",
  paint, draw, drawTop, light, ambience: "room",
  music: null,
  walk: [[8, 210], [600, 210], [630, 250], [8, 250]],
  start: { x: 60, y: 232, face: "right" },
  actors: [
    { id: "a4_brandt", char: "a4_brandt", x: 414, y: 184, face: "front", act: "stand", name: "Herr Brandt", noTurn: true },
    { id: "a4_axl", char: "axl", x: 190, y: 180, face: "front", act: "sit", name: "Axl Vanta", noTurn: true, vis: S => !S.f.a4_axlGone },
    { id: "a4_ent1", char: "a4_ent1", x: 286, y: 200, face: "left", act: "stand", name: "Brock", vis: S => !S.f.a4_axlGone && !S.f.a4_ent1Gone },
    { id: "a4_ent2", char: "a4_ent2", x: 132, y: 214, face: "right", act: "stand", name: "Tiff", vis: S => !S.f.a4_axlGone }
  ],
  sprites: [
    { y: 204, draw: c => sprDesk(c, 330, 146) },
    { y: 188, draw: c => sprPostcards(c, 508, 150) },
    { y: 216, draw: c => sprTable(c, 160, 190) },
    { y: 218, vis: S => !S.f.a4_keyTaken, draw: c => sprKeyOnTable(c, 192, 196) },
    { y: 214, vis: S => !S.f.a4_axlGone, draw: c => sprRing(c, 204, 96) },
    { y: 230, draw: c => sprPlantH(c, 560, 168) },
    { y: 224, vis: S => !S.f.a4_axlGone, draw: c => sprSuitcase(c, 100, 190) }
  ],
  self: { look: "Tour bomber, wristband, a record bag and eyebags. I'd call it a look, but I'm too tired to be ironic.", talk: "\"I need a bed.\" Which is the only thing I've said out loud all night." },
  hotspots: [
    { id: "a4_brandt", name: "Herr Brandt (night clerk)", look: "Herr Brandt, night clerk. Waistcoat, glasses, a tie with a brass clasp, and the calm of a man who's seen three weddings and two divorces in the lobby.",
      talk: S => brandtTalk(S), give: (S, item) => brandtGive(S, item), pickup: "He's an institution. Institutions don't get picked up.", push: "I'd end up being asked to leave. Politely. In German." },
    { id: "a4_axl", name: "Axl Vanta", look: S => S.f.a4_axlGone ? "Axl was here. The cushion still has a very expensive dent." : "Axl Vanta, lounging under a ring light in sunglasses, a mohawk and a tank top that costs more than my Technics. His ego doesn't fit on the couch.",
      talk: S => axlTalk(S), give: async (S, item) => { if (item === "a4_postcard") return axlSign(S); if (item === "a4_key") return "He'd love the key. It's already his. Or it's mine. Depends who you ask. Axl asks only himself."; return "\"No,\" says Axl, \"I don't take things from people. People take things from me.\""; },
      pickup: "I'd get a lecture and a lawsuit. Probably in that order.", push: "I'd love to. Brock's six feet away, and he's the size of a vending machine." },
    { id: "a4_ent1", name: "Brock", look: "Brock, Axl's bodyguard. He's roughly the shape of a door. He's asleep with his sunglasses on. Or he's thinking. It's hard to tell with Brock.", talk: "\"Brock?\" ... No answer. I think he's recharging.", pickup: "Brock isn't portable.", push: "It's like pushing a building. Which, in Berlin, would be the wrong building." },
    { id: "a4_ent2", name: "Tiff", look: "Tiff, Axl's assistant. Ponytail, clipboard, headset and the thousand-yard stare of a person whose job is to say \"yes.\"", talk: async () => { await RP.lines(["@a4_ent2 He's not always like this.", "He's not?", "@a4_ent2 No. Sometimes he's worse. But he tips well."]); }, pickup: "She'd probably thank me. For something.", push: "Not Tiff. Tiff is the only one who keeps the whole operation running." },
    { id: "a4_desk", name: "reception desk", r: [330, 146, 190, 60], z: 30, walk: [440, 220, "back"], look: "A mahogany reception desk with a brass bell, a guest book and a clerk who's seen everything. It's the sturdiest thing in Berlin. Possibly the nation.", pickup: "It's a desk. It's attached to the floor and to centuries of tradition." },
    { id: "a4_bell", name: "brass bell", r: [346, 144, 14, 8], z: 60, walk: [352, 216, "back"], look: "A little brass bell for ringing for the clerk. The clerk is standing right there.", use: async () => { RP.sfx("ping"); await RP.say("Ding. (\"I'm right here,\" says Herr Brandt, with the weariness of a man who's been rung at while standing.)"); }, push: async () => { RP.sfx("ping"); await RP.say("Ding. (\"I'm right here.\")"); }, pickup: "He'd say \"Please don't.\" In German. Then, in English." },
    { id: "a4_keys", name: "key rack", r: [340, 38, 150, 90], z: 20, walk: [440, 220, "back"], look: "A rack of pigeonholes with brass keys. Room 12's slot is empty, with a tiny red 12 on it. The only empty slot in the building.", pickup: "Those aren't mine. I'd end up locked in the wrong room. With a stranger." },
    { id: "a4_postcards", name: "postcard rack", r: [506, 150, 24, 40], z: 62, walk: [500, 220, "right"], look: "A spinning rack of postcards. The hotel, with the TV tower photoshopped in to look closer. Free. Everyone says they're the best thing in the lobby.", pickup: S => postcardsTake(S), use: S => postcardsTake(S) },
    { id: "a4_couch", name: "lobby couch", r: [108, 126, 190, 80], z: 20, walk: [200, 226, "back"], look: S => S.f.a4_axlGone ? "A green velvet couch, abandoned. It still has a very expensive dent where a very expensive ego was." : "A green velvet couch. Axl and his entourage have colonized it, like a tiny, shiny country.", use: "I don't want to sit near Axl. He'd start speaking at me.", pickup: "It's furniture. I'm not carrying a couch through Berlin." },
    { id: "a4_keyspot", name: "room key", r: [190, 192, 24, 14], z: 80, vis: S => !S.f.a4_keyTaken, walk: [224, 228, "back"],
      look: S => S.f.a4_axlGone ? "My room key, abandoned on the coffee table. Axl left it like a pharaoh leaves a chair." : "A brass key with a big fob, on the coffee table. \"12.\" Axl is using it as a coaster.", pickup: S => takeKey(S), use: S => takeKey(S) },
    { id: "a4_table", name: "coffee table", r: [158, 192, 80, 30], z: 40, walk: [200, 228, "back"], look: "A low table with a magazine, a pen and a ridiculous glass of water, which Axl calls \"hydration.\"", pickup: "It's got a small key on it. And a big ego next to it." },
    { id: "a4_ring", name: "ring light", r: [200, 92, 44, 100], z: 45, vis: S => !S.f.a4_axlGone, walk: [250, 226, "right"], look: "A ring light on a tripod, pointed at Axl. Even at four a.m. he has a key light. He IS the key light.", push: "Tiff is guarding it like a flame. Gently, thoroughly.", pickup: "It's hers. I'd rather not be fired from her life." },
    { id: "a4_suitcase", name: "gold suitcase", r: [98, 190, 34, 52], z: 45, vis: S => !S.f.a4_axlGone, walk: [100, 246, "right"], look: "A gold suitcase with \"AV\" on it. It's got more stickers than my life. It's the only thing here with a better career than me." },
    { id: "a4_elevator", name: "elevator", r: [556, 54, 80, 124], z: 25, walk: [592, 226, "back"], look: "A brass elevator with a little arrow dial. Room 12 is up there. A bed is up there. A real, flat, horizontal bed.", use: S => goUp(S), open: S => goUp(S), walkTo: S => goUp(S), push: S => goUp(S) },
    { id: "a4_window", name: "window", r: [80, 30, 80, 94], z: 15, walk: [120, 222, "back"], look: "The street. Rain. A street lamp, a Späti sign and a night full of people with better sleep schedules than mine." },
    { id: "a4_mirror", name: "mirror", r: [172, 32, 52, 76], z: 20, walk: [200, 224, "back"], look: "A gilt-framed mirror. Axl has checked it eleven times in the last hour. It's the only thing in the lobby he's ever listened to." },
    { id: "a4_chandelier", name: "chandelier", r: [304, 0, 56, 60], z: 25, walk: [330, 222, "back"], look: "A brass chandelier with five bulbs, glowing like a very rich, very patient lighthouse." },
    { id: "a4_clock", name: "grandfather clock", r: [518, 48, 28, 88], z: 25, walk: [500, 226, "back"], look: "A grandfather clock that says it's quarter to five. It's been saying it for years. Germans admire consistency." },
    { id: "a4_plant", name: "palm", r: [556, 168, 80, 74], z: 40, walk: [540, 236, "right"], look: "A very large palm in a very small lobby. It's escaped from a better country." },
    { id: "a4_door", name: "street door", r: [4, 52, 58, 122], z: 20, walk: [64, 228, "left"], look: "The way back to the street. The rain, the Späti, a very long night. I'm not going back out. I need a bed.", exit: S => ({ room: "a4_berlin_street", x: 600, y: 232, face: "left" }) },
    { id: "a4_floor", name: "carpet", r: [8, 210, 620, 40], z: 3, floor: true, look: "A hotel carpet in burgundy and gold, so busy it's practically a seizure. Guests have been careful on it since 1974." }
  ],
  combos: [
    ["a4_passport", "a4_brandt", S => brandtGive(RP.state, "a4_passport")],
    ["a4_passport", "a4_desk", S => brandtGive(RP.state, "a4_passport")],
    ["a4_passport", "a4_axl", "Axl would put his own face on my passport if I let him. No."],
    ["a4_postcard", "a4_axl", S => axlSign(RP.state)],
    ["a4_postcard", "a4_brandt", S => brandtGive(RP.state, "a4_postcard")],
    ["a4_postcard", "a4_ent2", "Tiff takes the postcard, reads it, sighs and hands it back. \"For him. He's got to do it himself.\""],
    ["a4_postcard", "a4_couch", "I'd rather hand it to Axl directly. Furniture can't sign."],
    ["a4_key", "a4_elevator", S => goUp(RP.state)],
    ["a4_bag", "a4_couch", "Not near Axl. He'd sign it. Or try to sign my records."],
    ["a4_bag", "a4_desk", "The clerk says: \"We have a luggage room.\" No. This bag stays with me. We've both had a long weekend.",],
    ["phone", "a4_axl", "A selfie with Axl? He'd want approval. And a cut."]
  ],
  enter: async (S, from) => {
    if (!S.f.a4_hotelIntro) {
      S.f.a4_hotelIntro = true;
      await RP.lines(["Hotel Zum Pfau. Gold, wine-red, tall windows, a clock that says quarter to five.",
        "At the desk: Herr Brandt. On the couch under a ring light: Axl Vanta, in sunglasses, indoors, at four in the morning. Ah. That's not a good sign."]);
    }
  }
});
})();
