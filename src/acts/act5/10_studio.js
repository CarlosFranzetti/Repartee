/* Act 5 — a5_studio: the kid's home studio in 4C (Bushwick). Thursday morning to Friday night.
   Hub: phone/map, bed (days advance here), wardrobe rail, gear desk (changes as the rig is bought), Lou's pipe hole. */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u, PK = RP.PK, A5 = RP.a5, art = A5.art, I = RP.icons;
const { R, P, ell, line, poly, bayer, mulberry, mix, txt, txtC, txtW, clamp } = U;
const K = U.ramp;
const HL = (c, x, y, w, col) => R(c, x, y, w, 1, col), VL = (c, x, y, h, col) => R(c, x, y, 1, h, col);

const night = S => S.f.a5_tod === "night";
const hasTaula = S => S.gear && S.gear.mixer === "can_electric_taula_4_mr";
const hasCore = S => S.gear && S.gear.monitors === "dynaudio_core_47";
const hasCdj3 = S => S.gear && S.gear.decks === "pioneer_cdj_3000";
const hotOf = id => RP.curRoom().def.hotspots.find(h => h.id === id);

/* the festival poster: lighthouse, the bill, your name */
art.poster = function (c, x, y, w, h, S) {
  const em = [];
  R(c, x - 1, y - 1, w + 2, h + 2, "#0c0818"); R(c, x, y, w, h, "#14102e");
  PK.gradV(c, x, y, w, h, ["#14102e", "#2a1858", "#6a2a7a", "#c8507a"], { dither: 1 });
  PK.util.clip(c, x, y, w, h, () => art.hlLogo(c, x + Math.round(w / 2), y + 6, 2, { beam: "#ffd8a0", beamLen: 36 }));
  const cx = x + w / 2;
  txtC(c, "HARBOR LIGHTS", cx, y + 42, "#f4f0e8", 1, 1);
  txtC(c, "FESTIVAL", cx, y + 49, "#39d0ff", 1, 1);
  R(c, x + 4, y + 56, w - 8, 1, "#ff3fa4");
  const nm = A5.pName(S).toUpperCase(), sc = txtW(nm, 2, 1) <= w - 8 ? 2 : 1;
  txtC(c, nm, cx + 1, y + 60, "#0c0818", sc, 1); txtC(c, nm, cx, y + 59, "#ff3fa4", sc, 1);
  txtC(c, "SAT - MAIN STAGE", cx, y + 59 + sc * 5 + 3, "#ffd23f", 1, 1);
  ["LOUIE VEGA", "DANNY TENAGLIA", "FRANCOIS K", "DJ SPINNA"].forEach((t, i) => txtC(c, t, cx, y + 59 + sc * 5 + 12 + i * 6, "#d8d0f0", 1, 1));
  R(c, x, y, w, 1, "#ff8fcf"); VL(c, x, y, h, "#8a5ab8"); VL(c, x + w - 1, y, h, "#0c0818");
  R(c, x + Math.floor(w / 2) - 3, y - 2, 6, 3, "#d8cfa0");
  return em;
};
const fl2 = Math.floor;

function clothesRail(c, S) {
  /* floor-standing rail: two poles, a top bar, hangers, coats */
  R(c, 8, 118, 2, 96, "#8a86a0"); VL(c, 8, 118, 96, "#e8e4f4"); R(c, 62, 118, 2, 96, "#8a86a0"); VL(c, 62, 118, 96, "#5a566c");
  R(c, 6, 118, 60, 2, "#c8c4d8"); HL(c, 6, 118, 60, "#ffffff");
  R(c, 4, 212, 12, 2, "#3a364a"); R(c, 56, 212, 12, 2, "#3a364a");
  const coats = [["#2a3a5a", "#8a9ac0"], ["#c0302c", "#ffb0a0"], ["#17131f", "#ff3fa4"], ["#3a6a4a", "#a0d8b0"], ["#ff7a2a", "#ffd23f"], ["#5a3a7a", "#c0a0e8"]];
  coats.forEach(([col, lin], i) => {
    const hx = 14 + i * 8, k = K(col);
    P(c, hx + 2, 119, "#c8c4d8"); line(c, hx + 2, 119, hx - 1, 124, "#c8c4d8"); line(c, hx + 2, 119, hx + 5, 124, "#c8c4d8");
    R(c, hx - 2, 124, 9, 40 + (i % 3) * 6, col); VL(c, hx - 2, 124, 40 + (i % 3) * 6, k[3]); VL(c, hx + 6, 124, 40 + (i % 3) * 6, k[0]); HL(c, hx - 2, 124, 9, k[4]);
    R(c, hx + 1, 125, 3, 14, lin); poly(c, [[hx - 1, 124], [hx + 2, 132], [hx + 5, 124]], lin);
    P(c, hx + 2, 143, k[0]); P(c, hx + 2, 149, k[0]);
  });
  /* sneakers on the floor */
  for (let i = 0; i < 3; i++) { R(c, 14 + i * 14, 207, 11, 5, i === 1 ? "#ff3fa4" : "#efeaf6"); R(c, 14 + i * 14, 211, 11, 1, "#2a2833"); HL(c, 14 + i * 14, 207, 11, "#ffffff"); }
}

function paint(c, S) {
  const em = [], nt = night(S);
  PK.plaster(c, 0, 0, 640, 166, { base: "#8c7590", seed: 17, patches: 2, stains: 1, cracks: 1 });
  R(c, 0, 163, 640, 8, "#5a4058"); HL(c, 0, 163, 640, "#a48aa0"); HL(c, 0, 170, 640, "#3a2a3a");
  PK.planks(c, 0, 171, 640, 85, { base: "#8a5a3e", seed: 6 });
  /* rug under the desk */
  ell(c, 470, 232, 118, 13, "#4a2470"); ell(c, 470, 232, 114, 11, "#5b2e8c");
  for (let x = 372; x < 570; x += 8) { P(c, x, 232, "#7a3fb0"); P(c, x + 1, 231, "#7a3fb0"); P(c, x + 1, 233, "#7a3fb0"); }
  ell(c, 470, 232, 60, 5, "#7a3fb0"); ell(c, 470, 232, 56, 4, "#5b2e8c");
  /* foam panels + neon sign */
  art.foam(c, 362, 24, 240, 96);
  R(c, 361, 23, 242, 1, "#1c1230"); R(c, 361, 120, 242, 2, "#1c1230");
  em.push.apply(em, PK.neon(c, "PIPE HOLE", 427, 44, "#39d0ff", { scale: 2, tube: 2 }));
  em.push.apply(em, PK.neon(c, "RECORDS", 442, 62, "#ff3fa4", { scale: 1, tube: 1 }));
  /* window */
  em.push.apply(em, PK.window(c, 246, 28, 104, 92, { view: "city", time: nt ? "night" : "day", seed: 5 }));
  /* radiator, pipe, the hole to 4B */
  PK.radiator(c, 252, 132, 84, 32);
  R(c, 340, 126, 4, 12, "#8a869c"); VL(c, 340, 126, 12, "#c8c4d8"); VL(c, 343, 126, 12, "#4a4658");
  ell(c, 346, 143, 8, 6, "#5e4a5e"); ell(c, 346, 143, 6, 5, "#140c18"); ell(c, 346, 144, 4, 3, "#08040c");
  [[339, 138], [352, 139], [341, 148], [351, 148], [345, 137]].forEach(([x, y]) => P(c, x, y, "#5e4a5e"));
  /* poster + framed record */
  em.push.apply(em, art.poster(c, 112, 22, 76, 104, S));
  PK.frame(c, 204, 46, 30, 38, { color: "#c8a860" });
  ell(c, 219, 65, 10, 10, "#b8901c"); ell(c, 219, 65, 9, 9, "#e8c040"); ell(c, 219, 65, 3, 3, "#17131f"); P(c, 214, 60, "#fff6b0"); P(c, 215, 59, "#fff6b0");
  R(c, 207, 80, 24, 3, "#17131f"); R(c, 209, 81, 20, 1, "#e8c040");
  /* sticky notes */
  [[196, 92, "#ffe66a", ["CALL", "PRIYA"]], [214, 97, "#ff9ad5", ["NO", "AXL"]], [200, 107, "#9be15d", ["EAT", "FOOD"]]].forEach(([nx, ny, nc, tl], i) => {
    R(c, nx, ny, 17, 13, nc); HL(c, nx, ny, 17, "#ffffff55"); HL(c, nx, ny + 12, 17, mix(nc, "#140c24", 0.35)); R(c, nx + 5, ny - 1, 7, 2, "#d8cfa0" + "");
    txtC(c, tl[0], nx + 8, ny + 2, "#2a1c22", 1, 1); txtC(c, tl[1], nx + 8, ny + 8, "#2a1c22", 1, 1);
  });
  /* overflow shelf above the clothes rail */
  PK.shelf(c, 8, 40, 92, 62, { items: "records", seed: 12, wood: "#6a4a3a" });
  /* clothes rail + bed + laptop */
  clothesRail(c, S);
  PK.bed(c, 76, 122, 168, { h: 84, color: "#6b35a0" });
  PK.laptop(c, 188, 140, { on: true, seed: 4 });
  /* the desk and the gear */
  PK.desk(c, 352, 148, 250, 52, { wood: "#5a3a30", top: "#7a5040", seed: 3 });
  /* under the desk: a flight case, a power strip, cable spaghetti */
  art.roadCase(c, 372, 172, 66, 24, { label: "PIPE HOLE", wheels: true, sticker: "#ff3fa4" });
  R(c, 450, 188, 26, 4, "#e8e4f0"); HL(c, 450, 188, 26, "#ffffff"); for (let i = 0; i < 4; i++) R(c, 453 + i * 5, 189, 2, 2, "#1d1622");
  for (let i = 0; i < 26; i++) { P(c, 472 + i, 190 + Math.round(Math.sin(i / 3) * 2), "#17131f"); P(c, 440 + i, 194 + Math.round(Math.cos(i / 4) * 2), "#2a1c34"); }
  const mw = hasTaula(S) ? 66 : 40, total = 70 * 2 + mw + 8, gx = 477 - Math.round(total / 2);
  em.push.apply(em, PK.turntable(c, gx, 116, { model: "technics", label: "#e0368f", seed: 1 }));
  em.push.apply(em, PK.mixer(c, gx + 74, 118, { channels: hasTaula(S) ? 4 : 2, rotary: hasTaula(S), seed: 2 }));
  em.push.apply(em, PK.turntable(c, gx + 74 + mw + 4, 116, { model: "technics", label: "#39d0ff", seed: 2 }));
  /* monitors on wall shelves */
  const core = hasCore(S), mh = core ? 52 : 44, mww = core ? 30 : 26;
  [378, 570].forEach(mx => {
    R(c, mx - 3, 66 + mh, mww + 6, 3, "#2a2634"); HL(c, mx - 3, 66 + mh, mww + 6, "#6a667c");
    PK.monitors(c, mx, 66, { w: mww, h: mh });
    if (core) { ell(c, mx + mww / 2, 66 + 36, 11, 11, "#2a2634"); ell(c, mx + mww / 2, 66 + 36, 9, 9, "#4a4658"); ell(c, mx + mww / 2, 66 + 36, 4, 4, "#c8c4d8"); P(c, mx + mww / 2 - 3, 66 + 32, "#ffffff"); R(c, mx + 4, 66 + mh - 4, mww - 8, 1, "#c8a860"); }
  });
  /* door to the hallway */
  PK.door(c, 600, 36, 38, 130, { color: "#6a4a5e", number: "4C", seed: 2 });
  R(c, 604, 163, 32, 3, nt ? "#ffcf7a" : "#e8c880");
  if (nt) em.push([604, 163, 32, 3]);
  /* a cable run across the floor */
  for (let x = 336; x < 372; x++) P(c, x, 206 + Math.round(Math.sin(x / 5) * 2), "#17131f");
  return em;
}

/* floor props (depth sorted) */
function drawCrate(c, S) {
  const x = 262, y = 218;
  [["#e0368f", 2], ["#ffd23f", 7], ["#efeaf8", 12], ["#39d0ff", 18], ["#ff8a4c", 24], ["#1d1622", 29]].forEach(([col, ox], i) => { R(c, x + ox, y - 13 + (i % 2), 4, 14, col); R(c, x + ox, y - 13 + (i % 2), 4, 1, "#ffffff"); });
  R(c, x, y, 36, 22, "#2f62b8"); R(c, x, y, 36, 2, "#4a80d8"); R(c, x, y + 20, 36, 2, "#1d3f7a");
  for (let yy = y + 5; yy < y + 18; yy += 6) for (let xx = x + 3; xx < x + 33; xx += 6) R(c, xx, yy, 4, 3, "#1d3f7a");
  R(c, x + 12, y + 4, 12, 3, "#1d3f7a");
  PK.contactShadow(c, x, y + 20, 36, 4, { alpha: 0.4 });
}
function drawBoxes(c, S) {
  const x = 528, y = 228;
  PK.contactShadow(c, x - 4, y - 2, 74, 6, { alpha: 0.5 });
  R(c, x, y - 28, 40, 28, "#c8925a"); R(c, x, y - 28, 40, 3, "#e0b078"); R(c, x, y - 2, 40, 2, "#8a5a30"); R(c, x + 17, y - 28, 6, 28, "#a8743e");
  txt(c, "PIONEER DJ", x + 4, y - 21, "#17131f"); txt(c, "CDJ-3000", x + 4, y - 14, "#c0302c"); R(c, x + 4, y - 9, 10, 4, "#f4f0e8");
  R(c, x + 30, y - 52, 38, 24, "#b07f4a"); R(c, x + 30, y - 52, 38, 3, "#d8a468"); R(c, x + 47, y - 52, 5, 24, "#8a5a30"); txt(c, "DYNAUDIO", x + 33, y - 44, "#17131f");
  R(c, x + 40, y - 28, 30, 28, "#c8925a"); R(c, x + 40, y - 28, 30, 3, "#e0b078"); txt(c, "TECHNICS", x + 43, y - 20, "#17131f"); R(c, x + 40, y - 2, 30, 2, "#8a5a30");
  if (hasTaula(S)) art.roadCase(c, x - 36, y - 24, 32, 24, { label: "CAN ELECTRIC", labelBg: "#e8e0cc", wheels: true });
}
function drawFloorLamp(c, S) {
  PK.lamp(c, 212, 148, { kind: "floor", on: night(S) });
}

function lightMap(S) {
  if (!night(S)) return { ambient: "#cdbfd8", lights: [{ box: [246, 28, 104, 92], r: 330, color: "#fff4e8", steps: 3, sy: 1 }, { x: 300, y: 70, r: 220, color: "#ffffff", steps: 2 }, { x: 480, y: 60, r: 90, color: "#7ad8ff", steps: 2, power: 0.5 }],
    key: { x: 300, y: 60 }, shadow: 0.45 };
  return { ambient: "#40386f", lights: [
    { x: 480, y: 56, r: 190, color: "#9ad8ff", steps: 4, sy: 1.1, power: 0.9 },
    { x: 468, y: 70, r: 120, color: "#ff3fa4", steps: 3, sy: 1.1, power: 0.7, rim: true },
    { x: 216, y: 150, r: 150, color: "#ffe2c0", steps: 4, sy: 1.1 },
    { box: [246, 28, 104, 92], r: 70, color: "#7a70c8", steps: 2 },
    { x: 620, y: 166, r: 60, color: "#ffcf7a", steps: 2, power: 0.6 }],
    halos: [{ x: 216, y: 150, r: 24, color: "#ffb060", strength: 1 }], rims: [{ x: 300, y: 80, r: 200, color: "#8f86e0" }], shadow: 0.55 };
}

/* ------------------------------------------------------------------------------------------ scripts */
const REMAIN = S => {
  const out = [];
  if (A5.day(S) === 1 && !S.f.a5_gearDone) out.push("the rig (Lacquer & Wire, Williamsburg)");
  if (A5.day(S) === 2) {
    if (!S.f.a5_interviewDone) out.push("the Radio Harbor interview (10 AM)");
    if (!S.f.a5_guestDone) out.push("wristbands and the guest list at the gate");
    if (S.f.a5_louPass && !S.f.a5_louPassGiven) out.push("Lou's pass through the pipe hole");
  }
  return out;
};

async function sleepNow(S) {
  const day = A5.day(S);
  const rem = REMAIN(S);
  if (day === 1 && !S.f.a5_calledPriya) { await RP.say("It's ten in the morning. I just got up. ...Fine, I'm a person who naps. But no."); return; }
  if (rem.length) { await RP.say("Not yet. Still on the list: " + rem.join("; ") + "."); return; }
  if (day >= 3) { await RP.say("No sleeping. Tonight I sleep when it's over. Or never. Probably never."); return; }
  await RP.walkTo(150, 224, "back");
  if (day === 1) {
    await RP.say("The rig is on its way. The rest is tomorrow. Night, Gerald.");
    await RP.fadeTo(1, 900);
    A5.setDay(S, 2, "FRI 8:40 AM", "day"); S.f.a5_slept2 = true;
    await RP.say("Friday morning.", "nar");
    const k = RP.actor("kid"); k.x = 150; k.y = 226; k.face = "front";
    await RP.fadeTo(0, 900);
    await RP.lines([
      "My phone is going off like a smoke alarm.",
      "@a5_priya Radio Harbor wants you at ten. Midtown. Dana Okafor. She asks questions, she doesn't take answers.",
      "@a5_priya Seven tonight: wristbands and the guest list, at the gate. Whit needs the list by eight.",
      "@a5_priya Whatever you do, do not say the name Axl Vanta on the radio. His people listen.",
      "I'll be charming and unquotable. It's my best look."
    ]);
    RP.text("PRIYA (MGR)", "FRI: 10 AM Radio Harbor 88.1, Midtown. Be funny, not weird. After: gate at 7 for wristbands and the guest list.", false);
    RP.text("JESS", "heard ur headlining 😱 mr whiskers wants a shoutout. he has opinions. he's... a lot right now", false);
    return;
  }
  await RP.say("Big day tomorrow. Bigger than the last big day. Lights out.");
  await RP.fadeTo(1, 1000);
  A5.setDay(S, 3, "SAT 1:30 PM", "day"); S.f.a5_slept3 = true;
  await RP.say("Saturday. Harbor Lights.", "nar");
  const k = RP.actor("kid"); k.x = 150; k.y = 226; k.face = "front";
  await RP.fadeTo(0, 1000);
  await RP.lines([
    "@a5_priya Car's downstairs. It has water and a snack. Eat the snack.",
    "I can't eat. My stomach has become a subwoofer.",
    "@a5_priya Then take the water. Go. And remember: you're not on until 11:45. Don't peak at lunch."
  ]);
  RP.text("PRIYA (MGR)", "SAT: you're at the gate. Pass in your pocket. Soundcheck 4 PM main stage. Find Roz (stage manager). Do NOT find Axl.", false);
}

async function wardrobe(S) {
  await RP.walkTo(40, 224, "back");
  await RP.say("The rail. Everything I own that could survive a stage.");
  const opts = Object.keys(A5.outfits).map(k => A5.outfits[k].label).concat(["Leave it"]);
  const i = await RP.choose(opts);
  if (i >= Object.keys(A5.outfits).length) { await RP.say("It already looks right. Or at least, loud."); return; }
  const key = Object.keys(A5.outfits)[i];
  RP.chars.update("kid", A5.outfits[key].patch);
  S.f.a5_outfit = key;
  RP.sfx("zip");
  await RP.say(key === "coat" ? "The coat. Black outside, hot pink lining. Anybody can wear black. Not everyone can open it." : key === "shirt" ? "Orange and yellow stripes. I look like a traffic cone with a record deal." : "The old smiley tee. It got me here. It's coming with me, spiritually.");
}

async function labGear(S) {
  if (hasTaula(S)) { await RP.lines(["Can Electric Taula 4 MR. Four channels, 100% analogue, handwired in Barcelona. Rotary knobs, no screens, no sync.", "It's the most honest thing I own. It can't lie about my mix."]); }
  else await RP.say("My current mixer: a Pioneer DJM-350. It did great things for me. It's a bus ticket; I want a plane.");
}

async function loTalk(S) {
  await RP.walkTo(316, 216, "back");
  if (S.f.a5_louComing) {
    await RP.lines(["Lou? You in there?", "@a5_lou I'm ironing the good cardigan. Don't talk to me, I'm concentrating."]);
    return;
  }
  const day = A5.day(S);
  await RP.say("Hey, Lou?");
  await RP.say(day === 1 ? "WHAT. I'm watching the weather." : "WHAT. Pipe hole's for emergencies.", "a5_lou");
  await RP.convo([
    { text: "I'm headlining a festival on Saturday, Lou.", once: true, run: async () => {
      await RP.lines(["@a5_lou I read it in the paper. Your name was spelled right and everything. Don't let it go to your head.", "@a5_lou Keep it DOWN. Some of us have a program."]);
    } },
    { text: "I want you to come, Lou.", when: S2 => !S2.f.a5_louAsked, once: true, run: async () => {
      S.f.a5_louAsked = true;
      await RP.lines([
        "@a5_lou Outdoors? With people? And the loud?",
        "@a5_lou Kid, I did Saturdays. Every Saturday, 1993. I had a long run. I retired.",
        "I'm playing \"NYC 93.\" On a real system. In front of a few thousand people.",
        "@a5_lou ...",
        "@a5_lou That's blackmail.",
        "It's an invitation. With sound.",
        "@a5_lou ...Slide it under the pipe. If there's an actual invitation, I'll consider it. I said CONSIDER."
      ]);
    } },
    { text: "Do you need anything for Saturday?", when: S2 => S2.f.a5_louAsked && !S2.f.a5_louPassGiven, run: async () => {
      await RP.lines(["@a5_lou Don't be cute. An invitation. With my name on it. Spelled right.", "Spelled right. Got it. Everybody asks for that."]);
    } },
    { text: "Here, Lou. Your pass.", when: S2 => S2.f.a5_louPass && !S2.f.a5_louPassGiven, run: async () => { await giveLouPass(S); return "end"; } },
    { text: "Never mind, Lou.", end: true, run: async () => { await RP.say("Then keep it DOWN.", "a5_lou"); } }
  ]);
}
async function giveLouPass(S) {
  if (!RP.has("a5_loupass")) { await RP.say("I need the actual pass first. Lou's a stickler. Lou is a stickler for everything."); return; }
  await RP.walkTo(316, 216, "back");
  RP.take("a5_loupass"); S.f.a5_louPassGiven = true; S.f.a5_louComing = true;
  RP.sfx("pickup");
  await RP.lines([
    "Lou. I'm sliding something through the pipe hole.",
    "@a5_lou ...",
    "@a5_lou It's got my name on it.",
    "@a5_lou LOU. 4B. Spelled right.",
    "@a5_lou ...I'll need the good cardigan. The navy one. And my shoes.",
    "Your shoes? Lou, it's a festival, not the Garage.",
    "@a5_lou It's not 1993. I know. But a man dresses for the occasion.",
    "@a5_lou Is it going to be loud?",
    "Very.",
    "@a5_lou Good."
  ]);
}

/* ------------------------------------------------------------------------------------------ room */
RP.room({
  id: "a5_studio", act: 5, name: "Studio 4C",
  paint, cacheKey: S => [night(S) ? "n" : "d", hasTaula(S) ? "t" : "", hasCore(S) ? "c" : "", S.f.a5_gearDone ? "g" : "", S.name].join("|"),
  light: lightMap, lightKey: S => (night(S) ? "n" : "d") + (hasCore(S) ? "c" : ""),
  ambience: "room",
  walk: [[10, 214], [630, 214], [630, 252], [10, 252]],
  start: { x: 300, y: 232, face: "front" },
  fx: [{ type: "dust", rect: [250, 40, 110, 130], count: 24, color: "#fff4d6", on: () => !night(RP.state) }],
  sprites: [
    { y: 224, draw: (c, S) => drawCrate(c, S) },
    { y: 214, draw: (c, S) => PK.plant(c, 304, 145, { size: 3, seed: 8 }) },
    { y: 223, vis: S => !!S.f.a5_gearDone, draw: (c, S) => drawBoxes(c, S) },
    { y: 212, draw: (c, S) => drawFloorLamp(c, S) }
  ],
  hotspots: [
    { id: "a5_door", name: "door", r: [598, 34, 42, 134], z: 20, walk: [612, 218, "right"], look: "The hallway, four flights of stairs, a stoop, the L train, and then the rest of New York.",
      exit: S => A5.day(S) === 3 ? { room: "a5_gate", x: 70, y: 232, face: "right", say: "Priya's car. It has a water and a snack and an opinion." } : (!S.f.a5_calledPriya ? "Priya hung up mid-sentence. I should check my phone first." : "travel") },
    { id: "a5_bed", name: "bed", r: [74, 118, 172, 92], z: 30, walk: [150, 222, "back"], look: S => A5.day(S) >= 3 ? "My bed. Saturday: I'm not allowed to use it until the set is over." : "My bed. It's also my couch, my desk-for-the-laptop and my cry-room.",
      use: S => sleepNow(S), open: "There's nothing to open. It's a bed.", pickup: "I tried that once. I got a hernia and a different bed.", push: "It's against the wall. I'm not that kind of DJ.", talk: "Not now. I'm saving my voice. And my emotions." },
    { id: "a5_rail", name: "clothes rail", r: [4, 116, 66, 100], z: 31, walk: [40, 222, "back"], look: "A rail of stage clothes. Black coat, hot-pink lining. Orange stripes. The old smiley tee. Wardrobe: one rack, three attitudes.",
      use: S => wardrobe(S), open: S => wardrobe(S), pickup: "I'd need a bigger bag. And a bigger personality.", pull: S => wardrobe(S) },
    { id: "a5_poster", name: "Harbor Lights poster", r: [110, 26, 80, 102], z: 20, walk: [150, 222, "back"],
      look: S => ["HARBOR LIGHTS FESTIVAL. A lighthouse, a bill, and my name in pink. " + A5.pName(S) + ". Spelled right.", "Louie Vega. Danny Tenaglia. Francois K. DJ Spinna. Carl Craig. I'm on the same poster. In the biggest letters."],
      pickup: "It took four tape rolls to get it up. It's staying up.", talk: "\"You look nice, poster.\" It does look nice. It's lit better than me." },
    { id: "a5_record", name: "gold record", r: [202, 44, 34, 44], z: 20, walk: [220, 222, "back"], look: "A \"gold record\" from Pipe Hole Records. It's spray-painted. The plaque says: AWARDED FOR SELLING ELEVEN COPIES. Eleven. I know all their names.", pickup: "It's glued on. Pipe Hole Records doesn't have a budget for nails." },
    { id: "a5_neon", name: "neon sign", r: [424, 38, 90, 40], z: 25, walk: [470, 214, "back"], look: "PIPE HOLE RECORDS. My label. Two releases, eleven fans, one neighbor who's technically the A&R.", use: "It has one switch. It's always on. Like me.", pull: "I'm not touching the neon. Last time it bit." },
    { id: "a5_window", name: "window", r: [240, 22, 116, 106], z: 20, walk: [300, 214, "back"],
      look: S => night(S) ? "Bushwick at night. Somewhere out there, Brooklyn is already unrolling a lawn for a festival." : "Bushwick in daylight. A cityscape you can't hear until you open it.",
      open: "It's stuck. It was painted shut in 2009. By a landlord. Of course.", close: "It's closed. Painted that way.", talk: "I'd say something, but Gerald's the one who's into windows." },
    { id: "a5_radiator", name: "radiator", r: [250, 130, 92, 36], z: 25, walk: [290, 214, "back"], look: "Still clanking. The landlord says he \"put in a ticket.\" I think the ticket got pregnant.", use: "It's October. It's still off. The landlord's calendar is its own country.", push: "It's bolted to the building. I tried." },
    { id: "a5_hole", name: "hole in the wall", r: [332, 130, 28, 26], z: 45, walk: [316, 216, "back"],
      look: S => S.f.a5_louComing ? "Faint sound of ironing. And humming. Lou is humming. In public. Well, through a hole." : "The pipe hole to 4B. Lou's intercom. Complaints in, miracles out.",
      talk: S => loTalk(S), use: "It's a hole. It's for talking to Lou and for nothing else.",
      give: async (S, item) => { if (item === "a5_loupass") return giveLouPass(S); return "Lou doesn't want that."; } },
    { id: "a5_gerald", name: "Gerald", r: [306, 158, 62, 58], z: 33, walk: [298, 220, "right"], look: S => hasTaula(S) ? "Gerald. He's two feet taller than in Act One. He gets the best light. He is the only one of us who has his life together." : "That's Gerald. He grew over the winter. I don't know what he's been through, but he's thriving.",
      talk: "Hang in there, Gerald. Wait. You're hanging in there better than I am.", use: "I water him when I remember. He forgives me. That's his superpower.", pickup: "Gerald stays where the light is. It's his whole thing." },
    { id: "a5_crate", name: "record crate", r: [260, 202, 40, 40], z: 28, walk: [280, 244, "back"], look: S => "My crate. " + S.records.length + " records. Every one is a decision. Some of them were very good decisions.", use: S => RP.crateView(), open: S => RP.crateView(), pickup: "It's got twenty-five records in it. I'm not carrying that to the subway. The festival has roadies. I have roadies now. Wow." },
    { id: "a5_bedlap", name: "laptop", r: [184, 138, 38, 28], z: 40, walk: [196, 220, "back"], look: "My laptop. Held together with gaffer tape and ambition. A spreadsheet of tonight's tracks: HARBOR_SET_v14_FINAL_FINAL.xlsx.",
      use: S => ["The set notes, v14. They say: START LOW. CLIMB. DON'T PEAK BEFORE MIDNIGHT. SAVE THE WHITE LABEL.", "Priya's note in red: \"Don't be a hero. Be a headliner.\""], pickup: "It's safer on the bed. Everything is safer on the bed." },
    { id: "a5_turn", name: "Technics SL-1210MK7s", z: 36, walk: [450, 216, "back"],
      rects: () => { const mw = hasTaula(RP.state) ? 66 : 40, total = 70 * 2 + mw + 8, gx = 477 - Math.round(total / 2); return [[gx, 112, 74, 40], [gx + 74 + mw + 4, 112, 74, 40]]; },
      look: "A pair of Technics SL-1210MK7. The first Technics deck aimed at DJs in nine years, announced at CES 2019. They've done thirty-seven airports with me. They're fine. I'm the one who's bent.",
      use: "Not now. If I start spinning, I'll never stop. And Lou has a program.", pickup: "Nine kilos each. I like my back." },
    { id: "a5_mixer", name: "mixer", r: () => { const mw = hasTaula(RP.state) ? 66 : 40, total = 70 * 2 + mw + 8, gx = 477 - Math.round(total / 2); return [gx + 74, 114, mw, 36]; }, z: 38, walk: [478, 216, "back"],
      look: S => hasTaula(S) ? "Can Electric Taula 4 MR. Handwired in Barcelona, four channels, all analogue, all knobs. I'm scared to touch it. I touched it twice." : "A Pioneer DJM-350. A great little mixer that carried me through a lot of bad rooms. This week it retires. With honors.",
      use: S => labGear(S), pickup: "It's bolted to the desk. Also, I like having fingers.", push: "Faders push. Knobs turn. Decisions, however, get made." },
    { id: "a5_monitors", name: "monitors", rects: [[374, 62, 34, 62], [566, 62, 34, 62]], z: 37, walk: [470, 216, "back"],
      look: S => hasCore(S) ? "Dynaudio Core 47s. Studio monitors that tell you the truth, even when you really want a lie." : "Dynaudio BM5 mkIIIs. I love these. They're like a friend who tells you your mix is muddy.",
      use: "I'll turn them up Saturday. Tonight, Lou's program.", pickup: "On a wall shelf, held by prayers and two screws." },
    { id: "a5_foam", name: "acoustic foam", r: [362, 24, 240, 40], z: 14, walk: [470, 214, "back"], look: "Acoustic foam. Lou says it makes my room sound \"like a dentist's office.\" It has a certain... clean silence." },
    { id: "a5_boxes", name: "delivery boxes", r: [510, 168, 78, 62], z: 41, vis: S => !!S.f.a5_gearDone, walk: [530, 236, "back"],
      look: "The rig, delivered: CDJ-3000s, Dynaudio, new Technics. Ines's boxes say LACQUER & WIRE in gold. Eddie's box says FRAGILE ARTIST. I'm hoping that's a joke.",
      open: "It's all unpacked. I stacked the boxes because I'm that kind of person.", pickup: "Too heavy. Also: I like a view." },
    { id: "a5_shelf", name: "record shelf", r: [6, 38, 96, 66], z: 14, walk: [60, 216, "back"], look: "The overflow shelf. Records that didn't make the crate, and one that made it and came back. I don't talk about that one.", pickup: "If I pull one, the whole shelf has a conversation with the floor." },
    { id: "a5_rug", name: "rug", r: [352, 220, 236, 26], z: 8, floor: true, look: "A purple rug. It ties the room together. Nothing else does." },
    { id: "a5_lamp", name: "floor lamp", r: [206, 138, 22, 76], z: 29, walk: [230, 220, "left"], look: "A floor lamp. It does one thing and it does it well. Aspirational." }
  ],
  combos: [
    ["a5_loupass", "a5_hole", S => giveLouPass(RP.state)],
    ["a5_loupass", "a5_door", "Lou won't take it at the door. Lou doesn't do doors. He does holes."],
    ["a5_marker", "a5_poster", "Drawing a mustache on my own face? Tempting. No."],
    ["a5_marker", "a5_gerald", "No. Gerald has been through enough."],
    ["a5_pass", "a5_hole", "Lou's not going to read my pass. Lou's going to read his own."],
    ["phone", "a5_hole", S => RP.say("Lou, I'm texting you: \"i love you.\" ... He doesn't have a phone. Hole it is.")]
  ],
  enter: async (S, from) => {
    if (!S.f.a5_gearDone) return;
    if (!S.f.a5_unpackedLine) { S.f.a5_unpackedLine = true; await RP.lines(["Everything arrived. The Taula is on the desk. It looks like it was born there.", "Nothing's connected. Everything's connected. I'll test it with my eyes."]); }
  },
  self: { look: "The headliner. Slept in a hoodie. Dreamt of mixers.", talk: "I'd answer, but I'm practicing being calm." }
});

/* the phone: studio hint */
A5.studioRemain = REMAIN;
})();
