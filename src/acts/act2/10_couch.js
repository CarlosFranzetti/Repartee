/* Act 2 — Marcus's apartment (Bed-Stuy). The kid's couch by day (ch1), the birthday party at night (ch2:
   guest.List mini-game, Jess + the amp, Twinkie), and the Saturday morning after (ch3).
   Flags: a2_plan, a2_knock, a2_tvOn, a2_flyerGot, a2_daniText, a2_partyStarted, a2_partyDone, a2_ampGot, a2_usbBack,
   a2_twinkieMet, a2_jar, a2_envelope, a2_satBrief */
(function () {
"use strict";
const RP = window.RP, A2 = RP.a2, PK = RP.PK;
const { R, P, ell, txt, txtC, mulberry } = RP.u;
const U = PK.util;
const W = 640;

const ch = S => S.f.a2_ch || 1;
const party = S => ch(S) === 2;
const dark = S => A2.night(S);

/* ------------------------------------------------------------------ painting */
function paint(c, S) {
  const em = [], P2 = party(S), N = dark(S);
  // wall: sand plaster, crown molding, baseboard
  PK.plaster(c, 0, 0, W, 166, { base: "#c9a572", seed: 12, patches: 2, stains: 1, cracks: 1 });
  R(c, 0, 0, W, 9, "#eadfca"); U.HL(c, 0, 0, W, "#fffaf0"); U.HL(c, 0, 8, W, "#a89878"); U.dshade(c, 0, 9, W, 5, "#3a2a1a", (x, y) => 1 - (y - 9) / 5, 0.35);
  for (let x = 6; x < W; x += 14) R(c, x, 3, 6, 3, "#d8cbb2");
  PK.baseboard(c, 0, 159, W, { color: "#eadfca", h: 9 });
  PK.planks(c, 0, 168, W, 88, { base: "#8e5c3c", seed: 3 });
  // rug under the coffee table
  PK.rug(c, 196, 196, 232, 46, { colors: ["#2f5a6a", "#d8a040", "#a04a3a"] });
  // window light falling across the floor and the couch wall (daytime only)
  if (!N) {
    const pane = (a, b) => (x, y) => { const sx = (y - 168) * 1.05; return x >= a + sx && x < b + sx ? Math.max(0, 1.5 - (y - 168) / 64) : 0; };
    const p1 = pane(78, 128), p2 = pane(134, 186);
    U.dshade(c, 70, 169, 440, 86, "#fff0c0", (x, y) => Math.max(p1(x, y), p2(x, y)), 0.2);
    U.dshade(c, 196, 12, 150, 150, "#fff0c0", (x, y) => Math.max(0, 1 - Math.hypot((x - 150) / 190, (y - 60) / 150) * 1.15) * 0.9, 0.12);
  }

  // exit door (left)
  PK.door(c, 8, 33, 50, 128, { color: "#3f6a56", frame: "#d8c8a8", number: "2R", panels: 4, seed: 4 });
  R(c, 14, 150, 38, 3, "#c8b070"); // kick plate
  // window onto the block + radiator under it
  em.push.apply(em, A2.window(c, 74, 26, 118, 98, { frame: "#efe6d4", cols: 2, emit: !N, view: (cc, gx, gy, gw, gh) => A2.streetView(cc, gx, gy, gw, gh, { time: A2.night(S) ? "night" : "day" }) }));
  PK.radiator(c, 84, 134, 100, 26, { color: "#ece4d4" });
  // the kid's laundry, drying on the radiator
  R(c, 92, 126, 30, 9, "#17131f"); U.HL(c, 92, 126, 30, "#3a3648"); ell(c, 107, 130, 3, 2, "#efeaf6"); R(c, 124, 128, 7, 6, "#efeaf6"); R(c, 134, 129, 7, 5, "#8a86a0");
  // sneakers by the door
  [[64, 220], [78, 223]].forEach(([sx, sy], i) => { R(c, sx, sy, 12, 5, "#efeaf6"); U.HL(c, sx, sy, 12, "#ffffff"); R(c, sx, sy + 4, 12, 2, "#8a869c"); R(c, sx + 8, sy - 2, 4, 3, "#d8d4e4"); U.dshade(c, sx - 1, sy + 6, 14, 2, "#0c0618", () => 1, 0.4); });
  // wall art cluster over the couch + the Basement Tapes flyer
  PK.frame(c, 226, 38, 34, 42, { color: "#6a4a32", kind: "landscape", seed: 4 });
  PK.poster(c, 276, 32, 46, 62, { title: "BASEMENT TAPES", titleLines: ["BASEMENT", "TAPES"], lines: ["LAST SAT", "VINYL ONLY"], palette: "neon", seed: 77 });
  PK.frame(c, 334, 44, 22, 28, { color: "#2a2a36", kind: "abstract", seed: 8 });
  PK.clock(c, 428, 22, { hour: 11, min: 42, d: 18 });
  // bathroom door (steam under it) + the sign
  PK.door(c, 424, 44, 46, 118, { color: "#efe8d8", frame: "#bfb298", panels: 4, seed: 6, knob: true, peephole: false });
  R(c, 435, 76, 24, 20, "#f4f0e4"); U.outline(c, 435, 76, 24, 20, "#a8a08c");
  txtC(c, "RITUAL", 447, 79, "#3a2a2a", 1, 1); txtC(c, "IN", 447, 85, "#c0302c", 1, 1); txtC(c, "PROGRESS", 447, 91, "#3a2a2a", 1, 1);
  U.dshade(c, 424, 150, 46, 12, "#f4f4ff", (x, y) => (y - 150) / 12, 0.5);
  // kitchen: shelf of cereal, counter, fridge
  PK.shelf(c, 524, 34, 66, 56, { items: "boxes", wood: "#a07a50", seed: 9 });
  PK.counter(c, 524, 128, 66, 36, { top: "#d8c8a8", front: "#5a6a7a", seed: 5 });
  em.push.apply(em, PK.microwave(c, 530, 113, { on: false }));
  // coffee maker
  R(c, 566, 108, 14, 20, "#2a2834"); U.HL(c, 566, 108, 14, "#5a5668"); R(c, 568, 116, 10, 10, "#c8c4d8"); R(c, 569, 120, 8, 6, "#7a4a2a"); R(c, 567, 111, 3, 2, "#3fd07a");
  // fridge
  const fx = 594, fy = 62, fw = 42, fh = 100, fk = RP.u.ramp("#d8d4dc");
  R(c, fx, fy, fw, fh, "#d8d4dc"); PK.gradH(c, fx, fy, fw, fh, [[0, fk[4]], [0.2, fk[3]], [0.7, fk[2]], [1, fk[1]]], { dither: 1 });
  U.HL(c, fx, fy, fw, fk[4]); U.VL(c, fx, fy, fh, fk[3]); U.VL(c, fx + fw - 1, fy, fh, fk[0]); U.HL(c, fx, fy + fh - 1, fw, fk[0]);
  R(c, fx + 1, fy + 38, fw - 2, 2, fk[0]); R(c, fx + 6, fy + 6, 2, 26, "#8a869c"); R(c, fx + 6, fy + 46, 2, 36, "#8a869c");
  R(c, fx + 20, fy + 12, 16, 12, "#fff6a8"); R(c, fx + 22, fy + 14, 12, 1, "#c0302c"); txt(c, "LIFE", fx + 21, fy + 16, "#c0302c", 1, 0); txt(c, "DROP", fx + 21, fy + 20, "#c0302c", 1, 0); // plasma flyer magnet
  R(c, fx + 12, fy + 50, 10, 8, "#39d0ff"); R(c, fx + 26, fy + 58, 8, 10, "#ff3fa4"); R(c, fx + 14, fy + 66, 12, 8, "#ffd23f"); // magnets + sticky notes
  U.dshade(c, fx - 3, fy + fh, fw + 6, 4, "#0c0618", (x, y) => 1 - (y - fy - fh) / 4, 0.4);
  // string lights always hang over the window wall; party adds the banner and balloons
  for (let x = 12; x < W - 8; x += 3) { const y = 11 + Math.round(Math.sin(x / 34) * 4); P(c, x, y, "#2a2030"); }
  for (let x = 18; x < W - 8; x += 18) { const y = 12 + Math.round(Math.sin(x / 34) * 4); R(c, x, y, 3, 3, ["#ffd27a", "#ff6cbb", "#9fe8ff", "#b8ffb0"][(x / 18) % 4 | 0]); if (N) { em.push([x - 1, y - 1, 5, 5]); em.push.apply(em, PK.glow(c, x + 1, y + 1, 7, ["#ffd27a", "#ff6cbb", "#9fe8ff", "#b8ffb0"][(x / 18) % 4 | 0], { strength: 0.6 })); } }
  if (P2) {
    for (let i = 0; i < 14; i++) { const bx = 120 + i * 30, by = 22 + Math.round(Math.sin(i * 0.9) * 4); R(c, bx, by, 24, 14, i % 2 ? "#ff3fa4" : "#39d0ff"); U.outline(c, bx, by, 24, 14, "#14102e"); txt(c, "HAPPYBDAYMARCUS!".charAt(i) || "*", bx + 10, by + 4, "#fff6dc", 1, 0); em.push([bx, by, 24, 14]); }
    [[372, 52, "#ff3fa4"], [388, 62, "#39d0ff"], [380, 44, "#ffd23f"], [404, 56, "#9be15d"]].forEach(([bx, by, col]) => { U.blob(c, bx, by, 6, 8, col, { outline: true }); U.VL(c, bx, by + 8, 14, "#d8d0e0"); });
  }
  return em;
}

/* the couch (kid's bed), coffee table, TV and gear are depth-sorted sprites */
function drawCouch(c, S) {
  PK.couch(c, 208, 110, 150, { color: "#46698c", pillow: false, seed: 3 });
  // the sleeping bag draped over the seat + a lumpy pillow + socks
  if (!party(S)) {
    const sb = "#a8432c", k = RP.u.ramp(sb);
    c.save(); R(c, 226, 150, 112, 17, sb); R(c, 226, 150, 112, 2, k[4]); R(c, 226, 165, 112, 2, k[0]);
    for (let x = 230; x < 336; x += 10) { R(c, x, 152, 2, 14, k[1]); R(c, x + 3, 152, 1, 13, k[3]); }
    c.restore();
    ell(c, 244, 144, 17, 6, "#cfd6e4"); ell(c, 243, 142, 14, 4, "#eef2fa"); R(c, 234, 140, 8, 1, "#ffffff");
    R(c, 330, 168, 8, 3, "#efeaf6"); R(c, 340, 166, 8, 4, "#8a86a0"); // socks on the arm
  } else {
    ell(c, 244, 144, 15, 5, "#cfd6e4"); ell(c, 300, 146, 14, 5, "#e0368f"); // party cushions
  }
}
function drawTable(c, S) {
  PK.table(c, 226, 190, 96, 32, { color: "#7a5a40", seed: 2 });
  if (!party(S)) {
    // cereal bowl, phone charger, pizza box corner
    ell(c, 250, 192, 9, 3, "#e8e4f0"); ell(c, 250, 191, 7, 2, "#c8a070"); R(c, 244, 189, 3, 2, "#f4f0e4");
    PK.pizzaBox(c, 270, 189, { w: 40 });
    R(c, 296, 187, 18, 2, "#efeaf6");
  } else {
    // snacks and drinks
    R(c, 240, 188, 22, 3, "#e8e4f0"); ell(c, 251, 186, 9, 3, "#f2c84a");
    [[272, "#d83a3a"], [280, "#3ab8d8"], [288, "#5ad85a"], [296, "#e8e4d0"]].forEach(([x, col]) => { R(c, x, 180, 5, 9, col); R(c, x, 180, 5, 1, "#ffffff"); });
  }
}
function drawTv(c, S) {
  // stand
  R(c, 366, 150, 48, 5, "#5a4030"); U.HL(c, 366, 150, 48, "#a07a56"); R(c, 368, 155, 4, 16, "#5a4030"); R(c, 408, 155, 4, 16, "#5a4030");
  PK.tv(c, 368, 112, { on: false, w: 44, h: 38, seed: 3 });
}
function drawGear(c, S) {
  // CDJs on cardboard boxes, KRK monitor, mixer bag, milk crate of records
  PK.cardboardBox(c, 98, 164, 70, 24, { color: "#c8925a", seed: 4 });
  PK.cdj(c, 104, 148, { tier: 1, screenOn: false });
  PK.cdj(c, 120, 118, { tier: 1, screenOn: false });
  PK.monitors(c, 168, 126, { krk: true, pair: false });
  PK.crate(c, 172, 168, { color: "#2f62b8", seed: 4 });
  R(c, 140, 176, 28, 14, "#2a2834"); U.HL(c, 140, 176, 28, "#5a5668"); R(c, 144, 180, 20, 6, "#3a3848"); txt(c, "M101", 146, 181, "#8a86a0", 1, 0);
}

/* ------------------------------------------------------------------ light */
function light(S) {
  if (party(S)) return {
    ambient: "#3a2c5c",
    lights: [
      { x: 300, y: 26, r: 280, color: "#ff3fa4", steps: 4, sy: 1.2, rim: true },
      { x: 560, y: 36, r: 260, color: "#39d0ff", steps: 4, sy: 1.2, rim: true },
      { x: 120, y: 56, r: 150, color: "#ffb070", steps: 3, power: 0.7 },
      { box: [74, 26, 118, 98], r: 60, color: "#6f66b8", steps: 2 }
    ],
    halos: [{ x: 300, y: 28, r: 22, color: "#ff3fa4", strength: 1 }, { x: 560, y: 38, r: 20, color: "#39d0ff", strength: 1 }],
    key: { x: 300, y: 30 }, shadow: 0.55
  };
  if (dark(S)) return {
    ambient: "#403870",
    lights: [
      { x: 320, y: 14, r: 330, color: "#ffd8a0", steps: 4, sy: 1.5 },
      { box: [74, 26, 118, 98], r: 70, color: "#6f66b8", steps: 2 },
      { x: 566, y: 120, r: 120, color: "#ffe2b0", steps: 3, power: 0.7 },
      { x: 232, y: 150, r: 200, color: "#ff9a5a", steps: 2, power: 0.5, rim: true }
    ],
    key: { x: 320, y: 20 }, shadow: 0.55
  };
  return {
    ambient: "#d9cab8",
    lights: [
      { box: [74, 26, 118, 98], r: 250, color: "#fff2dc", steps: 4, sy: 1.1 },
      { x: 134, y: 60, r: 230, color: "#fff6e8", steps: 3, power: 0.6 },
      { x: 560, y: 70, r: 120, color: "#ffe8c0", steps: 2, power: 0.35 }
    ],
    key: { x: 134, y: 60 }, shadow: 0.4
  };
}

/* ------------------------------------------------------------------ hints */
function nextHint(S, voice) {
  const m = voice === "marcus";
  if (!S.f.a2_plan) return m ? "Ask me about the plan. I've been dying to tell you the plan." : "Marcus has been trying to tell me a plan since I woke up.";
  if (!S.f.a2_plasma) return m ? "Money first. LifeDrop on Atlantic Ave. They want ID, proof of address and a form. Lou in 4B has been collecting your mail." : "Money: the LifeDrop plasma center. They'll want ID, proof of address and a form. Lou in 4B has been collecting my mail.";
  if (!S.f.a2_showered) return m ? "You smell like a hot dog. Dani. Seven settings. Text her." : "I smell like a hot dog. Dani has a shower with seven settings.";
  if (!S.f.a2_cashed && RP.has("a2_card")) return m ? "That LifeDrop card isn't cash. The bodega ATM on the corner turns it into cash. With a fee. And an asterisk." : "The card isn't cash. The corner bodega's ATM turns it into cash, with a fee and an asterisk.";
  if (!S.f.a2_metEddie) return m ? "Go see Eddie before the party. Window-shop. Eddie loves a window-shopper." : "I should visit Eddie in Williamsburg before the party and see what the damage is.";
  return m ? "You're set. Sleep on the couch and I'll wake you for Friday. Birthday. Twenty-eight. Plus three." : "I think I'm ready. Rent's due Friday and so is Marcus's party. Sleep on it. Literally.";
}
A2.hint = nextHint;

function readyToSleep(S) { return S.f.a2_plasma && S.f.a2_showered; }

/* ------------------------------------------------------------------ cutscenes */
async function textDani(S) {
  RP.text("DANI (NOWHERE BAR)", "hey dj. marcus says ur homeless?? lol. come thru, im making pierogi. my shower has 7 settings.");
  await RP.say("Dani. Dani with the apron. She wanted a dance. She wanted ME to dance. That's... a lot of risk for one text.");
  const i = await RP.choose(["\"Hey! Pierogi sounds great.\"", "\"Seven settings? I'll need to see them in person.\"", "\"What's the water pressure on setting seven?\""]);
  const reply = [
    "hey! pierogi sounds great. what time?",
    "seven settings? i'll need to see them in person.",
    "what's the water pressure on setting seven?"
  ][i];
  await RP.say("Typing: " + reply);
  await RP.wait(500);
  if (i === 2) await RP.lines(["@a2_dani_phone ...it's a 9. come over."]);
  else await RP.lines(["@a2_dani_phone ha. come over whenever. 4th floor, no elevator, bring an appetite."]);
  S.f.a2_daniText = true;
  RP.unlock("a2_loc_dani");
  RP.toast("New place on the subway map: Dani's");
}
RP.voice("a2_dani_phone", { color: "#ffc9a0", prefix: "DANI (TEXT): ", anchor: () => [RP.actor("kid").x, 40] });

async function sleepToFriday(S) {
  await RP.fadeTo(1, 900);
  await RP.say("Tuesday. Wednesday. Thursday. A lot of cereal.", "nar");
  S.f.a2_ch = 2; S.f.noTravel = true;
  RP.setClock("FRI 8:55 PM");
  RP.relight();
  const k = RP.actor("kid"); k.x = 300; k.y = 232; k.face = "front";
  await RP.fadeTo(0, 900);
}

async function partyIntro(S) {
  RP.actor("kid").face = "front";
  await RP.lines([
    "Friday. 8:55 PM. Marcus's 28th birthday.",
    "@marcus There he is. The door guy. The DJ. The multi-hyphenate.",
    "@marcus Clipboard. List. Aunt Denise gets in no matter what, she brought a casserole and an attitude.",
    "@marcus Twinkie's VIP. Jess said \"maybe,\" so she's VIP. Everybody else is a vibe check.",
    "@marcus And please. They're going to say \"plus three.\"",
    "I know, Marcus. It's your line.",
    "@marcus I trademarked it."
  ]);
  S.f.a2_partyStarted = true;
  RP.toast("Use the door to work the list.");
}

async function workDoor(S) {
  if (S.f.a2_partyDone) { await RP.say("The door's done. The party's on. Plus three in every corner."); return; }
  if (!S.f.a2_partyStarted) { await RP.say("It's Marcus's door. I'm not working it until someone hands me a clipboard."); return; }
  await RP.walkTo(70, 226, "left");
  await RP.say("Okay. Clipboard. Pen. Resting face.");
  RP.sfx("knock");
  const res = await A2.mg("guestList", { capacity: 14, requests: 18, vip: ["Aunt Denise", "Twinkie", "Jess", "Marcus's boss"], difficulty: 2 }, async () => {
    const i = await RP.choose(["Let in everyone with a casserole", "Let in anyone who says \"plus three\"", "Stick to the list, with a tiny bit of mercy"]);
    return { ok: i === 2 || i === 0, score: i === 2 ? 85 : 60, admitted: i === 2 ? 12 : 16, angry: i === 1 ? 6 : 1, fallback: true };
  });
  const ok = res && res.ok !== false;
  const adm = res && res.admitted != null ? res.admitted : 12;
  S.f.a2_adm = adm;
  if (ok) await RP.lines(["The door's under control. The line is a mood, but it's moving.", "@marcus Nobody's mad? Nobody's mad. You're a natural. A tyrant, but a natural."]);
  else await RP.lines(["The door was chaos. Somebody's cousin got in by hitting somebody with a casserole.", "@marcus Eh. We'll call it \"cozy.\" Everyone's close tonight."]);
  const jar = Math.max(40, Math.min(110, 45 + adm * 4 + (ok ? 15 : 0)));
  S.f.a2_jar = jar;
  RP.followers(ok ? 18 : 8);
  RP.setClock("SAT 12:10 AM");
  await partyAfter(S);
}

async function partyAfter(S) {
  // the house is full: Jess and Twinkie show up
  S.f.a2_partyFull = true;
  RP.relight();
  await RP.lines([
    "The place is packed. Somebody's on the couch. Somebody's on Toby. Toby is thrilled.",
    "@marcus Cover jar. Four bucks a head, \"for the DJ.\" That's you. I counted it twice because I love you."
  ]);
  RP.money(S.f.a2_jar);
  await RP.say("Marcus's cover jar: " + RP.u.fmtMoney(S.f.a2_jar) + " in crumpled fives. I'd frame it, but I'd also rather spend it.");
  // Jess
  S.f.a2_jessHere = true;
  await RP.lines(["@jess So. You're alive.", "Hi, Jess.", "@jess I'm not here for you. I'm here for Mr. Whiskers. Do you have the USB?"]);
  S.f.a2_jessAsk = true;
  RP.toast("Give Jess the cat USB.");
}

async function giveUsbToJess(S) {
  if (!S.f.a2_jessHere) return "Not yet. I haven't even seen her.";
  RP.take("usb_cat");
  S.f.a2_usbBack = true;
  await RP.lines([
    "Here. 4,000 photos of Mr. Whiskers. I never deleted a single one.",
    "@jess ...You didn't even look at them?",
    "I looked at them. I looked at them a lot. He's a handsome cat.",
    "@jess He is. And you kept your promise. That's more than I expected.",
    "@jess Okay. I'm not going to hug you. But I do some sound for a theater in Williamsburg, and I heard you need gear."
  ]);
  RP.give("a2_amp"); S.f.a2_ampGot = true;
  await RP.lines([
    "@jess Marcus says the Meserole loft party tomorrow has a PA that dies if you look at it wrong. Here. My spare power amp.",
    "@jess Bring it back Monday. If anything happens to it, I will find you. Mr. Whiskers will find you.",
    "I accept those terms. Both of them."
  ]);
  RP.followers(6);
  await twinkieBeat(S);
}

async function twinkieBeat(S) {
  if (S.f.a2_twinkieMet) return;
  S.f.a2_twinkieMet = true;
  await RP.lines([
    "@twinkie Heyyy, door guy.",
    "Twinkie. You're on the list. You're VIP. Marcus told me.",
    "@twinkie I'm always VIP. I know a guy who knows a guy who owns the guy. You looking for a gig?",
    "Basement Tapes. Vic.",
    "@twinkie Vic. Of course. Vic doesn't book people, he adopts them. You have to show him you can survive a bad night.",
    "@twinkie Tomorrow's a bad night waiting to happen: the Meserole loft. The PA is cursed and Moxie's panicking. Fix that, and word gets around.",
    "@twinkie And after, when everyone's sad it's over? I know a spot. Big. Quiet. Slightly illegal. You're going to need turntables and a crowd.",
    "That's the most stressful offer I've ever received."
  ]);
  RP.addRecord("robin_s_show_me_love");
  await RP.lines([
    "@twinkie Take this. For luck. \"Show Me Love,\" the StoneBridge mix.",
    "A StoneBridge remix. The original was Champion Records, 1990. This is the Big Beat release.",
    "@twinkie See? You know things. Vic likes people who know things. Just don't sound like you need him."
  ]);
  S.f.a2_twinkieGift = true;
  await partyEnd(S);
}

async function partyEnd(S) {
  await RP.say("Marcus, standing on a chair: \"MAKE SOME NOISE FOR THE DJ!\"", "nar");
  await RP.lines(["The set goes fine. Plus-threes dance. Aunt Denise dances harder.", "It's the best Friday I've had in two weeks, and I'm on a couch."]);
  await RP.fadeTo(1, 900);
  S.f.a2_partyDone = true; S.f.a2_ch = 3; S.f.noTravel = false; S.f.a2_partyFull = false; S.f.a2_jessHere = false;
  RP.setClock("SAT 12:15 PM");
  RP.relight();
  const k = RP.actor("kid"); k.x = 300; k.y = 232; k.face = "front";
  RP.unlock("a2_loc_van");
  await RP.fadeTo(0, 900);
  await satBrief(S);
}

async function satBrief(S) {
  if (S.f.a2_satBrief) return;
  S.f.a2_satBrief = true;
  await RP.say("Saturday. Noon. The living room looks like a crime scene with balloons.", "nar");
  const have = S.money + (RP.has("a2_card") ? Math.round((S.f.a2_cardBal || 0) * 0.9) : 0);
  const need = 215 - Math.round(have);
  if (!S.f.a2_turntables && need > 0) {
    S.f.a2_envelope = true;
    await RP.lines([
      "@marcus Hey. Birthday cards. Aunt Denise gave me an envelope.",
      "@marcus Cash \"for a good time.\" I'm using it for a good time. A good time is you owning turntables.",
      "@marcus Take it. Don't spend it on plus-threes."
    ]);
    RP.money(Math.max(20, Math.ceil((need + 5) / 5) * 5));
    await RP.say("Marcus is a prince. A prince in boxers, but a prince.");
  }
  await RP.lines([
    "@marcus Eddie's at his van till four. The Meserole loft thing starts at ten.",
    "Plan: turntables, then the loft, then the spot Twinkie wouldn't tell me about.",
    "@marcus I'm calling that plan \"Wednesday.\" Because by Wednesday you'll either be famous or in a ditch."
  ]);
  RP.unlock("a2_loc_loft");
  RP.text("TWINKIE", "meserole loft 10pm. tell fitz dani sent u. i'll find u after. bring ur decks!!");
}

/* ------------------------------------------------------------------ Marcus talk */
async function talkMarcus(S) {
  if (ch(S) === 2) {
    if (!S.f.a2_partyDone) { await RP.lines(["@marcus The door awaits, my friend. Chop chop.", "@marcus And if someone says \"plus three,\" say \"plus three what?\" It confuses them."]); }
    return;
  }
  if (ch(S) === 3) {
    await RP.convo([
      { text: "Where's Eddie again?", run: async () => { await RP.say("Under the BQE in Williamsburg. Look for the van with the \"CASH ONLY (TWO-TIME DEAL)\" sign. And the van.", "marcus"); } },
      { text: "What's the plan?", run: async () => { await RP.say(S.f.a2_turntables ? "Loft at ten. Then Twinkie's spot. Then glory." : "Turntables first. Eddie's van, cash in hand. Then the loft at ten.", "marcus"); } },
      { text: "Thanks for the couch, man.", run: async () => { await RP.lines(["@marcus You've been here two weeks. You're like a cat. A cat that pays no rent.", "@marcus But yeah. Anytime. Just... shower."]); } },
      { text: "Later.", end: true }
    ]);
    return;
  }
  if (!S.f.a2_metMarcus) {
    S.f.a2_metMarcus = true;
    await RP.lines(["@marcus Morning, sunshine. It's noon.", "It's 11:42.", "@marcus In Bed-Stuy, that's noon."]);
  }
  await RP.convo([
    { text: "So what's the plan?", when: S2 => !S2.f.a2_plan, once: true, run: async () => {
      await RP.lines([
        "@marcus The plan is Basement Tapes.",
        "The warehouse party?",
        "@marcus Vic's. Last Saturday of the month, vinyl only, cash only. A monthly slot there is the dream. Everyone wants it. Vic gives it to nobody.",
        "What does Vic want?",
        "@marcus Real turntables. A real crowd. And for you not to want it. He can smell need from a block away.",
        "@marcus You've got CDJs. Vic would laugh, then charge you for the laughing."
      ]);
      await RP.lines([
        "I can't afford turntables. I can't afford a sandwich.",
        "@marcus LifeDrop on Atlantic Ave. Plasma. New donors get a hundred bucks on a card. Mrs. Pearl on the third floor is a platinum member.",
        "@marcus And Eddie Two-Times has turntables in a van under the BQE. Audio-Technica. A two-time deal.",
        "What's a two-time deal?",
        "@marcus Nobody knows. It's always a two-time deal.",
        "@marcus Also: Friday is my birthday. Twenty-eight. You're doing the door. And the music. It's a multi-hyphenate party."
      ]);
      S.f.a2_plan = true;
      RP.unlock("a2_loc_plasma", "a2_loc_van");
      RP.toast("New places on the subway map: plasma center, Eddie's van");
    } },
    { text: "Can I use your shower?", run: async () => {
      if (S.f.a2_showered) { await RP.lines(["@marcus You already smell like a person. Don't push it."]); return; }
      await RP.lines([
        "@marcus Toby's in there. Since Sunday.",
        "Is he okay?",
        "@marcus He's doing a \"ritual.\" It's twelve steps and a livestream. I think we're on step nine.",
        "That's the only bathroom?",
        "@marcus You could also try Dani.",
        "Who?",
        "@marcus Dani. From Nowhere. The bartender who danced. She asked about you. Twice. She said: \"Tell your DJ friend my shower has seven settings.\"",
        "That's a weird thing to say to a person.",
        "@marcus It's an invitation, dude. And you smell like a hot dog. Text her."
      ]);
      if (!S.f.a2_daniText) { await RP.say("...I'm not that desperate."); await RP.say("You smell like a hot dog. You're that desperate.", "marcus"); await RP.say("...Where's my phone."); await textDani(S); }
    } },
    { text: "Tell me about Vic.", when: S2 => S2.f.a2_plan, run: async () => {
      await RP.lines(["@marcus Vic. Tall. Sunglasses indoors. Counts money with a rubber band like it's a hobby.", "@marcus He pays cash, on time, which makes him the single most suspicious man in Brooklyn."]);
    } },
    { text: "Landlord says rent's due Friday.", run: async () => {
      await RP.lines(["@marcus Kowalski? He told me hot water was \"next week.\" In 2023.", "@marcus Your rent is a problem for future you. Future you has a hot shower and a monthly residency."]);
    } },
    { text: "What should I do next?", when: S2 => S2.f.a2_plan, run: async () => { await RP.say(A2.hint(S, "marcus"), "marcus"); } },
    { text: "Later.", end: true }
  ]);
}

/* ------------------------------------------------------------------ the couch / sleeping */
async function useCouch(S) {
  if (ch(S) === 3) { await RP.say("Saturday. I'm not lying down now. If I lie down I'll become furniture."); return; }
  if (ch(S) === 2) { await RP.say("It's full of party. Aunt Denise is on my pillow."); return; }
  if (!readyToSleep(S)) {
    const left = [];
    if (!S.f.a2_plasma) left.push("get some money");
    if (!S.f.a2_showered) left.push("clean myself up");
    await RP.lines(["I could lie down and skip to Friday.", "But first I should " + left.join(" and ") + ". Otherwise Friday's just a longer version of today, with a smell."]);
    return;
  }
  const i = await RP.choose(["Sleep until Friday (Marcus's party)", "Not yet"]);
  if (i === 0) await sleepToFriday(S).then(() => partyIntro(S));
}

/* ------------------------------------------------------------------ room */
const actorsFn = S => {
  const list = [];
  const c3 = ch(S);
  list.push({ id: "marcus", char: "marcus", x: c3 === 2 ? 416 : 498, y: c3 === 2 ? 230 : 226, face: "left", act: "stand", name: "Marcus" });
  list.push({ id: "jess", char: "jess", x: 214, y: 236, face: "right", act: "stand", name: "Jess", vis: S2 => !!S2.f.a2_jessHere });
  list.push({ id: "twinkie", char: "twinkie", x: 392, y: 238, face: "left", act: "stand", name: "Twinkie", vis: S2 => !!S2.f.a2_twinkieMet && ch(S2) === 2 });
  list.push({ id: "a2_aunt", char: "a2_aunt", x: 160, y: 242, face: "right", act: "stand", name: "Aunt Denise", vis: S2 => !!S2.f.a2_partyStarted && ch(S2) === 2 });
  list.push({ id: "a2_toby", char: "a2_toby", x: 470, y: 238, face: "left", act: "dance", name: "Toby", vis: S2 => !!S2.f.a2_partyFull && ch(S2) === 2 });
  if (c3 === 2) {
    list.push({ crowd: { n: 4, rect: [92, 206, 80, 12], seed: 21, face: "front", act: "dance", scale: 0.95, vis: S2 => !!S2.f.a2_partyFull } });
    list.push({ crowd: { n: 7, rect: [452, 206, 130, 40], seed: 23, face: "front", act: "dance", scale: 0.95, vis: S2 => !!S2.f.a2_partyFull } });
    list.push({ crowd: { n: 3, rect: [240, 200, 120, 6], seed: 27, face: "front", act: "dance", scale: 0.9, vis: S2 => !!S2.f.a2_partyFull } });
  }
  return list;
};

RP.room({
  id: "a2_couch", act: 2, name: "Marcus's place",
  paint,
  cacheKey: S => (party(S) ? "p" : dark(S) ? "n" : "d") + (S.f.a2_tvOn ? "t" : ""),
  lightKey: S => (party(S) ? "p" : dark(S) ? "n" : "d"),
  light,
  ambience: S => party(S) ? "crowd" : "room",
  music: S => party(S) ? { genre: "house", bpm: 122, volume: 0.35, filter: ["lowpass", 1500] } : null,
  walk: [[10, 206], [630, 206], [630, 252], [10, 252]],
  start: { x: 300, y: 232, face: "front" },
  fx: [
    { type: "dust", rect: [74, 26, 150, 150], count: 26, color: "#fff4d6", on: () => !party(RP.state) && !dark(RP.state) },
    { type: "steam", x: 446, y: 160, rise: 36, size: 8, drift: 6, color: "#f4f4ff", on: () => !party(RP.state) },
    { type: "beams", origins: [[300, 8], [560, 8]], colors: ["#ff3fa4", "#39d0ff"], base: Math.PI / 2, swing: 0.5, len: 220, width: 16, alpha: 0.12, period: 1500, on: () => party(RP.state) }
  ],
  update: A2.update,
  actors: actorsFn,
  sprites: [
    { y: 175, draw: (c, S) => drawGear(c, S) },
    { y: 172, draw: (c, S) => drawCouch(c, S) },
    { y: 172, draw: (c, S) => drawTv(c, S) },
    { y: 222, draw: (c, S) => drawTable(c, S) },
    { y: 200, draw: c => { PK.plant(c, 468, 118, { size: 2, seed: 5, pot: "#c06a3a" }); } }
  ],
  enter: async (S, from) => {
    if (S.f.a2_ch === 2 && !S.f.a2_partyStarted && !S.f.a2_partyDone) await partyIntro(S);
  },
  hotspots: [
    { id: "a2_door", name: "front door", r: [6, 30, 54, 134], z: 20, walk: [68, 230, "left"], vis: S => ch(S) !== 2,
      look: "Marcus's door. Two locks, one peephole, zero landlords. A fine door.",
      exit: { room: "a2_street", x: 330, y: 232, face: "front" },
      talk: "Marcus's door doesn't say much. It listens.", pickup: "It's attached to the building. That's the whole point of doors.", push: "It opens inward. I'm not that kind of person." },
    { id: "a2_listdoor", name: "the door (guest list)", r: [6, 30, 54, 134], z: 21, walk: [68, 230, "left"], vis: S => ch(S) === 2,
      look: "The front door. The line outside has its own weather system. I have a clipboard and the heart of a bouncer.",
      use: S => workDoor(S), open: S => workDoor(S), talk: S => workDoor(S), walkTo: S => workDoor(S),
      pickup: "It's attached to the building. That's the whole point of doors.", push: "I'm already doing the door. That's my job tonight." },
    { id: "a2_window", name: "window", r: [72, 24, 124, 104], z: 18, walk: [132, 214, "back"],
      look: S => party(S) ? "Bed-Stuy at night. Nobody out there knows how good this party is. They'll find out when the bass comes through the walls." : "Bed-Stuy, across the street: brownstones, a tree, and a guy double-parked with his hazards on for the fifth consecutive hour. Home.",
      open: "It sticks. Everything in this apartment sticks. It's a building with personality.", push: "It sticks.", use: "Fresh air? In this economy?" },
    { id: "a2_radiator", name: "radiator", r: [82, 132, 106, 30], z: 22, walk: [140, 214, "back"], look: "A radiator that clanks like it's got a secret. It's October. It's off. The landlord here turns it on at some point. Allegedly.", use: "It's off. It's warm in a spiritual sense.", push: "It's bolted down. Everything I try to push is bolted down." },
    { id: "a2_couch", name: "couch", r: [206, 104, 156, 74], z: 25, walk: [284, 214, "back"],
      look: S => ch(S) === 2 ? "Marcus's couch, a party couch now: two strangers, a cushion fort, and my pillow gone forever." : "My bed, my office, my entire career. It's a pull-out that doesn't pull out. I've been sleeping at an angle.",
      use: S => useCouch(S), open: S => useCouch(S), pickup: "It's heavier than it looks, and I've looked at it for two weeks.", push: "It's against the wall. The wall wins.", pull: "It doesn't pull out. I've tried. Twice. In the dark." },
    { id: "a2_table", name: "coffee table", r: [224, 184, 100, 38], z: 26, walk: [272, 226, "back"],
      look: S => party(S) ? "Chips, cups, and someone's wallet. I'm not touching the wallet." : "Cereal bowl, a pizza box with one crust, my charger. Breakfast, lunch and a lifestyle.",
      pickup: "The pizza crust is mine. It's also hardened into a building material.", use: "I'd eat it. The milk is a gamble, though." },
    { id: "a2_tv", name: "TV", r: [366, 108, 50, 62], z: 24, walk: [390, 214, "back"],
      look: S => S.f.a2_tvOn ? "A midnight infomercial: \"TWO PAYMENTS of $19.99! And ANOTHER two payments of $19.99!\" Eddie Two-Times's long-lost cousin." : "A CRT TV Marcus found on the curb. It's got a 20-year warranty because it's 20 years old.",
      use: async S => { S.f.a2_tvOn = !S.f.a2_tvOn; RP.relight(); RP.sfx("click"); await RP.say(S.f.a2_tvOn ? "Click. A man is selling knives that cut other knives." : "Click. Silence. A good time to doubt myself."); },
      pickup: "The TV and I are not in a relationship.", push: "Marcus would kill me. Marcus would cry first." },
    { id: "a2_gear", name: "my gear", rects: [[96, 114, 76, 76], [138, 174, 32, 16]], z: 30, walk: [150, 214, "back"],
      look: "Everything that survived the lock change: two CDJ-350s on a box, my KRK monitor, the M101 mixer in a gym bag, and a milk crate of records. I escaped at six AM down the fire escape. Don't ask.",
      use: "I'd set it up, but this is a living room with a roommate who's pro-silence. And Basement Tapes is vinyl only. CDJs don't impress Vic.",
      pickup: "I'm not carrying all of this around Bed-Stuy. It already took three trips and a prayer.", push: "I'd scratch the box. The box is all that's holding the CDJs up." },
    { id: "a2_crate", name: "milk crate of records", r: [170, 168, 40, 40], z: 40, walk: [196, 216, "back"],
      look: "My milk crate: all of my records. A few real ones, one warped one and one mystery white label.",
      use: async S => { await RP.say("Let's see what I've got."); await RP.crateView(); }, open: async S => { await RP.crateView(); },
      pickup: "It's heavy. I'm leaving it where it is. It's a milk crate; it's not going anywhere.", push: "I'd spill my records. Not like I have many." },
    { id: "a2_bath", name: "bathroom door", r: [422, 42, 50, 122], z: 28, walk: [446, 214, "back"],
      look: "The bathroom door. A sign: \"RITUAL IN PROGRESS.\" Steam slides out under it like a ghost with a skincare routine.",
      use: S => knockBath(S), talk: S => knockBath(S), open: "It's locked. From inside I can hear a podcast about cold plunges.", push: "I'm not breaking down a door to use a shower I can't use.", pull: "Locked. Toby locks it the way other people say prayers." },
    { id: "a2_poster", name: "Basement Tapes flyer", r: [274, 30, 50, 66], z: 24, walk: [300, 214, "back"],
      look: "BASEMENT TAPES. Last Saturday of the month, vinyl only. No cameras, no cover bands. Marcus taped it up there to \"manifest.\" He taped it crooked, which he says is \"vibes.\"",
      pickup: async S => { if (S.f.a2_flyerGot) return "I already have one in my pocket. Marcus has seventeen."; S.f.a2_flyerGot = true; RP.give("a2_flyer"); await RP.say("Marcus won't miss it. He has a box of them. He's a flyer hoarder with dreams."); } },
    { id: "a2_frame", name: "pictures", rects: [[224, 36, 38, 46], [332, 42, 26, 32]], z: 22, walk: [300, 214, "back"], look: "A framed landscape Marcus found on a stoop, and a modern-art thing that is either a painting or a dropped pizza." },
    { id: "a2_clock", name: "clock", r: [426, 20, 22, 22], z: 22, walk: [446, 214, "back"], look: "11:42. The clock is correct twice a day, and this is one of the times." },
    { id: "a2_plant", name: "plant", r: [466, 120, 52, 48], z: 24, walk: [496, 214, "back"], look: "Geraldine. Marcus says it's a ficus, a cousin of Gerald. I haven't had the heart to tell Gerald. Gerald is still in 4C with the lock.", talk: "Hang in there, Geraldine.", pickup: "Geraldine and I have a stable relationship. I won't mess with that.", use: "She's hydrated. A better-hydrated plant than any of us." },
    { id: "a2_fridge", name: "fridge", r: [592, 60, 46, 106], z: 28, walk: [572, 218, "right"],
      look: "Marcus's fridge. Magnets, sticky notes and a LifeDrop flyer: \"DONATE PLASMA. NEW DONORS: $100.\" Someone wrote \"worth it\" in pen. Someone else wrote \"is it?\"",
      open: async S => { await RP.say("Mustard, a lime, a jar labeled \"TOBY — DON'T,\" and one lonely egg. I close it gently, like a mortician."); },
      use: async S => { RP.unlock("a2_loc_plasma"); await RP.say("The flyer says LifeDrop is on Atlantic Ave, Downtown Brooklyn. $100 for new donors. And \"snacks.\""); },
      pickup: "The flyer or the fridge? Neither's coming with me.", push: "It hums at me. We have an understanding." },
    { id: "a2_counter", name: "kitchen counter", r: [522, 108, 72, 56], z: 26, walk: [550, 218, "back"], look: "A kitchen the size of a phone booth. A coffee maker, a microwave and thirty-one mismatched mugs. One mug says \"WORLD'S OKAYEST DJ.\" Marcus got it for me for Christmas. It's the best present I've gotten.",
      use: "Coffee needs a filter. Filters need money. Everything is money.", open: "The microwave. Not a chance; the last time, someone put foil in it and the apartment still smells like betrayal." },
    { id: "a2_shelf", name: "cereal shelf", r: [522, 32, 70, 60], z: 22, walk: [550, 218, "back"], look: "Four cereals and an unspoken peace treaty. Marcus and Toby label theirs.", pickup: "That's Toby's. It's labeled. It's... an act of war." },
    { id: "marcus", name: "Marcus", z: 80, hotZ: 80, look: S => ch(S) === 2 ? "Marcus in his birthday best: a yellow shirt with one extra button undone. Twenty-eight and ready." : "Marcus. My best friend, my landlord-by-default and the person who owns the only couch I currently have.",
      talk: S => talkMarcus(S), give: async (S, item) => { if (item === "a2_flyer") return ["@marcus You keep it, bro. It's for manifesting."]; return "Marcus doesn't want that. Marcus wants a plus three."; } },
    { id: "jess", name: "Jess", z: 80, look: "Jess. Ponytail, purple hoodie, that look she does when she's right. She's right.", talk: async S => { if (!S.f.a2_usbBack) { await RP.say("The USB. Mr. Whiskers. Hand it over.", "jess"); RP.toast("Give Jess the cat USB."); } else await RP.say("Bring the amp back Monday. I'm serious. I'm already telling the cat.", "jess"); },
      give: async (S, item) => { if (item === "usb_cat") return giveUsbToJess(S); return ["@jess I don't want that. I want my cat."]; } },
    { id: "twinkie", name: "Twinkie", z: 80, look: "Twinkie. Lavender bob, shades indoors. She looks like she's been awake since the Clinton administration.", talk: async S => { await RP.lines(["@twinkie Tomorrow night. The loft, then the spot. Bring decks. Don't be early, be \"fashionably alarming.\""]); } },
    { id: "a2_aunt", name: "Aunt Denise", z: 80, look: "Aunt Denise. Red dress, gold chain, casserole. She's the only person here who's never been on a list.", talk: async S => { await RP.say("Baby, are you eating? You look like a coat hanger with a haircut.", "a2_aunt"); } },
    { id: "a2_toby", name: "Toby", z: 80, look: "Toby. The ritual guy. He's actually out of the bathroom, which is a medical event. He's dancing. Badly. In a face mask.", talk: async S => { await RP.say("It's a charcoal mask. It's on step eleven. I'm celebrating by dancing.", "a2_toby"); } }
  ],
  combos: [
    ["usb_cat", "jess", S => giveUsbToJess(RP.state)],
    ["usb_cat", "marcus", "Marcus doesn't need 4,000 cat photos. Jess does. Wrong friend."],
    ["a2_flyer", "a2_door", "I'm not taping a flyer to Marcus's door. His door has a dignity."],
    ["white", "a2_gear", "The white label goes in the crate. Lou's record, in a milk crate, with the rest of me."],
    ["phone", "a2_bath", "Texting Toby from three feet away isn't going to help. He's a phone-silent person. He has screen-time rules."],
    ["a2_card", "a2_fridge", "The fridge doesn't take cards. Neither does the cereal. I checked."]
  ]
});

async function knockBath(S) {
  const n = S.f.a2_knock = (S.f.a2_knock || 0) + 1;
  RP.sfx("knock");
  const L = [
    ["Toby? Are you almost done?", "@a2_toby_door I'M IN THE MIDDLE OF STEP SEVEN."],
    ["How many steps are there?", "@a2_toby_door TWELVE. THEN THE SIX-MINUTE HAIR MEDITATION."],
    ["Toby, I'm covered in two weeks of couch.", "@a2_toby_door GOOD. A LAYER OF PROTECTION. LIKE A PRIMER."],
    ["Is that the livestream?", "@a2_toby_door SAY HI, FOLLOWERS. (THERE ARE FOUR.) (ONE IS MY MOM.)"],
    ["Toby!", "@a2_toby_door THE HOT WATER IS RESTING."]
  ];
  const l = L[(n - 1) % L.length];
  await RP.lines(l);
  if (n === 3) await RP.say("I need a plan B. A plan B that has a shower and doesn't have Toby in it.");
}
})();
