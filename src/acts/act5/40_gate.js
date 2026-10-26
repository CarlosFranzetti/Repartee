/* Act 5 — a5_gate: the Harbor Lights main gate on the waterfront.
   Friday dusk: artist check-in (Whit, the typo'd pass) and Marcus's "plus thirty" guest list (guest.List).
   Saturday afternoon: arrival, Margo in person, the queue, noTravel on. East exit leads into the grounds. */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u, PK = RP.PK, A5 = RP.a5, art = A5.art, I = RP.icons;
const { R, P, ell, line, poly, bayer, mulberry, mix, txt, txtC, txtW, clamp } = U;
const K = U.ramp;
const HL = (c, x, y, w, col) => R(c, x, y, w, 1, col), VL = (c, x, y, h, col) => R(c, x, y, 1, h, col);
const dusk = S => A5.day(S) !== 3;
const fri = S => A5.day(S) === 2;

const HOLES = [[128, 126, 168, 92], [10, 164, 86, 54]];   /* tent, camp: lit by the room lights, not by the sky */

function paint(c, S) {
  const em = [], dk = dusk(S), time = dk ? "dusk" : "day";
  /* sky, skyline across the water, a bridge, the water itself */
  em.push.apply(em, art.harbor(c, { horizon: 118, skyH: 60, time, seed: 11, bottom: 150, bridge: { x: -30, w: 330, h: 40 },
    sun: dk ? { x: 600, y: 112, r: 9 } : { x: 90, y: 34, r: 8 }, clouds: dk ? 5 : 4, holes: HOLES,
    lights: dk ? [{ x: 150, color: "#ffd27a", a: 0.7, w: 2 }, { x: 250, color: "#ff9ad5", a: 0.6, w: 2 }, { x: 430, color: "#9fe8ff", a: 0.7, w: 3 }, { x: 600, color: "#ffb070", a: 0.9, w: 4 }] : null }));
  /* the festival beyond the arch: tree line, a ferris wheel, far stage lights, big top roofs */
  art.treeLine(c, 300, 118, 340, { seed: 7, dark: dk ? "#1c1030" : "#2c5a3a", mid: dk ? "#271645" : "#3a7a4a" });
  art.ferrisBase(c, 620, 84, 34, dk ? "#241c44" : "#6a6490");
  [[400, 100, 40, "#ff3fa4"], [450, 96, 30, "#39d0ff"], [505, 102, 36, "#ffd23f"]].forEach(([tx, ty, tw, col]) => { poly(c, [[tx, ty + 20], [tx + tw / 2, ty], [tx + tw, ty + 20]], dk ? "#2a2050" : "#d8d0e8"); if (dk) { P(c, tx + tw / 2, ty - 1, col); em.push([tx + tw / 2, ty - 1, 1, 1]); } });
  /* the promenade: concrete, painted lines, a railing along the water */
  art.pavement(c, 0, 150, 640, 106, { base: dk ? "#5e5a7c" : "#8a86a0", seed: 6 });
  R(c, 0, 142, 640, 8, dk ? "#2a2644" : "#6a6684"); HL(c, 0, 142, 640, dk ? "#6a6690" : "#b8b4d0"); HL(c, 0, 149, 640, "#14101e");
  art.railing(c, 0, 128, 640, { gap: 24 });
  /* painted lanes */
  for (let x = 0; x < 640; x += 28) R(c, x, 232, 14, 2, dk ? "#c8b020" : "#e8d040");
  /* subway stairs (far left): the way back */
  em.push.apply(em, PK.subwayStairs(c, 4, 160, {}));
  /* the arch: truss columns, top truss with lamps, LED panel, flags */
  art.trussV(c, 346, 52, 158, 10); art.trussV(c, 564, 52, 158, 10);
  const tr = PK.truss(c, 340, 44, 240, 12, { lights: ["#ff3fa4", "#39d0ff", "#ffd23f", "#a05cff", "#ff3fa4", "#39d0ff"] });
  em.push.apply(em, tr);
  if (dk) tr.lights.forEach((l, i) => { if (i % 2 === 0) em.push.apply(em, PK.lightCone(c, l.x, l.y, 5, 56, 70, l.color, { alpha: 0.28 })); });
  em.push.apply(em, PK.ledWall(c, 360, 76, 200, 44, { pattern: "waves", palette: ["#ff3fa4", "#39d0ff", "#a05cff", "#ffd23f"], seed: 9 }));
  R(c, 366, 84, 188, 28, "#0c0818"); HL(c, 366, 84, 188, "#6a2a7a");
  txtC(c, "HARBOR LIGHTS", 461, 88, "#0c0818", 2, 1); txtC(c, "HARBOR LIGHTS", 460, 87, "#ff3fa4", 2, 1); txtC(c, "FESTIVAL", 460, 100, "#39d0ff", 1, 3);
  em.push([366, 84, 188, 28]);
  em.push.apply(em, art.hlLogo(c, 460, 12, 1, { beamLen: 40 }));
  art.bunting(c, 150, 56, 340, 50, { sag: 8 });
  /* entry barriers under the arch */
  PK.barricade(c, 350, 196, 90, { text: "GA", sign: true, panel: 30 }); PK.barricade(c, 480, 196, 90, { text: "GUEST", sign: true, panel: 30 });
  /* string lights from the tent to the arch */
  const sl = art.stringLights(c, 140, 120, 346, 60, { sag: 12, step: 5, colors: ["#ffd27a", "#ff9ad5", "#9fe8ff"] });
  if (dk) em.push.apply(em, sl);
  /* banners on poles */
  em.push.apply(em, art.banner(c, 316, 66, 54, [{ t: "HARBOR", sc: 1 }, { t: "LIGHTS", sc: 1, c: "#39d0ff" }, { t: "SAT", sc: 1, c: "#ffd23f" }], { w: 20, accent: "#39d0ff" }));
  em.push.apply(em, art.banner(c, 596, 66, 54, [{ t: "HARBOR", sc: 1 }, { t: "LIGHTS", sc: 1, c: "#39d0ff" }, { t: "SAT", sc: 1, c: "#ffd23f" }], { w: 20, accent: "#ff3fa4" }));
  /* the check-in tent and Marcus's camp are drawn here (static); depth props are sprites */
  art.popTent(c, 130, 128, 168, 90, { color: "#f4f0e8", stripe: "#39d0ff", panels: 8, inside: "#1c1426" });
  R(c, 164, 160, 100, 12, "#17131f"); txtC(c, "ARTIST CHECK-IN", 214, 163, "#39d0ff", 1, 1); PK.util.dshade(c, 164, 160, 100, 12, "#39d0ff", (px, py) => 0.3, 0.2);
  em.push([166, 161, 96, 10]);
  if (fri(S)) {
    art.domeTent(c, 14, 172, 72, 44, { color: "#3a8a5a" });
    R(c, 36, 186, 28, 14, "#c8925a"); txt(c, "PLUS 30", 38, 190, "#17131f", 1, 1); R(c, 36, 186, 28, 1, "#e0b078");
  }
  return em;
}

function drawFrontProps(c, S) {
  /* registration table with laptop and boxes of wristbands */
  PK.table(c, 152, 176, 128, 40, { color: "#4a4658", top: "#8a86a0" });
  PK.laptop(c, 160, 156, { on: true, seed: 3 });
  for (let i = 0; i < 3; i++) { R(c, 200 + i * 16, 166 - i % 2 * 2, 14, 10 + i % 2 * 2, "#c8925a"); R(c, 200 + i * 16, 166 - i % 2 * 2, 14, 2, "#e0b078"); for (let j = 0; j < 4; j++) R(c, 202 + i * 16 + j * 3, 164 - i % 2 * 2, 2, 3, ["#ff3fa4", "#39d0ff", "#ffd23f", "#9be15d"][(i + j) % 4]); }
  R(c, 256, 166, 16, 8, "#efeaf6"); txt(c, "LIST", 258, 168, "#c0302c", 1, 1);
  /* traffic cones and a stack of water */
  [[470, 226], [570, 228]].forEach(([cx, cy]) => { poly(c, [[cx, cy - 12], [cx + 6, cy - 12], [cx + 9, cy], [cx - 3, cy]], "#ff8a2a"); R(c, cx - 1, cy - 7, 8, 2, "#f4f0e8"); R(c, cx - 4, cy, 14, 2, "#c85a10"); });
}
function drawCamp(c, S) {
  if (!fri(S)) return;
  /* a camp chair, a cooler, a thermos, a sign that says "PLUS 30" in capital letters */
  PK.contactShadow(c, 88, 224, 60, 5, { alpha: 0.4 });
  R(c, 92, 212, 22, 3, "#c0302c"); R(c, 92, 198, 3, 14, "#8a86a0"); R(c, 110, 198, 3, 14, "#8a86a0"); R(c, 92, 198, 22, 3, "#c0302c"); HL(c, 92, 198, 22, "#ff8a7a");
  R(c, 118, 210, 24, 14, "#2f62b8"); R(c, 118, 210, 24, 3, "#8aa8e8"); R(c, 118, 217, 24, 1, "#e8e4f4"); R(c, 128, 206, 6, 4, "#e8e4f4");
  R(c, 28, 220, 8, 6, "#e8e4f4"); R(c, 29, 215, 6, 5, "#c0302c");
}
function drawLamps(c, S) {
  /* a lamp post with a lit sodium head */
  PK.streetlamp(c, 112, 224, { h: 118, arm: 18, on: dusk(S) });
}

function lightMap(S) {
  if (dusk(S)) return { ambient: "#7a68a8", lights: [
    { x: 460, y: 56, r: 220, color: "#ff3fa4", steps: 4, power: 0.55, rim: true },
    { x: 460, y: 100, r: 190, color: "#39d0ff", steps: 4, power: 0.5 },
    { x: 230, y: 130, r: 150, color: "#9fe8ff", steps: 3, power: 0.7 },
    { x: 500, y: 112, r: 260, color: "#ffb070", steps: 4, power: 0.5, rim: true },
    { x: 120, y: 112, r: 130, color: "#ffd890", steps: 4, power: 0.9 }],
    halos: [{ x: 120, y: 112, r: 16, color: "#ffb060", strength: 1 }], key: { x: 540, y: 80 }, shadow: 0.6 };
  return { ambient: "#d2c8dc", lights: [{ x: 90, y: 20, r: 500, color: "#fff4e0", steps: 3, power: 0.45 }, { x: 460, y: 60, r: 160, color: "#ffffff", steps: 2, power: 0.3 }], key: { x: 90, y: 20 }, shadow: 0.5 };
}

/* ---------------------------------------------------------------------------------------- scripts */
async function whitTalk(S) {
  if (A5.day(S) === 3) {
    await RP.lines(["@a5_whit There he is! Headliner! Today's the day! I've got so much synergy I could fill a hot-air balloon!", "@a5_whit Go through the gate. East. Backstage is behind the big white fence. You'll find Gloria. Gloria is... Gloria."]);
    return;
  }
  if (!S.f.a5_gateMet) {
    S.f.a5_gateMet = true;
    RP.give("a5_pass"); S.f.a5_passName = A5.mangle(S.name);
    await RP.lines([
      "@a5_whit THERE he is! The headliner! Preston Whitlock. Whit. Harbor Lights. We're going to have so much synergy.",
      "Hi, Whit. I'm...",
      "@a5_whit I know EXACTLY who you are. I put you on every wall in Brooklyn. Your name's on a thousand posters!",
      "@a5_whit And here's your all-access pass. Hand-laminated. By an intern.",
      "It says \"DJ " + A5.mangle(A5.pName(S)).replace(/^DJ /, "") + "\".",
      "@a5_whit That's... a stylistic choice. It's our brand voice.",
      "It's wrong. It's close, but it's wrong.",
      "@a5_whit Close is collaboration! Look: twelve guest comps for artists. Names by eight tonight. Your friend with the tent says he needs thirty-one.",
      "He's not wrong. He's just... ambitious."
    ]);
    return;
  }
  await RP.convo([
    { text: "What's the running order?", once: true, run: async () => {
      await RP.lines(["@a5_whit Saturday. Soundcheck at four. Doors at six. Axl Vanta closes the main stage at... well, he plays at ten-fifteen.", "@a5_whit You're on at eleven forty-five. You close the whole festival. The sunrise slot, if you want to be poetic. Which I do.", "Eleven forty-five. Okay. And Axl?", "@a5_whit Axl's team is... flexible. About the word \"schedule.\" It's a living document."] );
    } },
    { text: "About the guest list...", when: S2 => !S2.f.a5_guestDone, run: async () => { await RP.say("Right. Marcus has the... situation. I'll go talk to him.", "kid"); return "end"; } },
    { text: "Thanks, Whit.", end: true, run: async () => { await RP.say("Don't thank me! Thank synergy!", "a5_whit"); } }
  ]);
}

async function marcusTalk(S) {
  if (!fri(S)) { await RP.say("Marcus is in the guest line somewhere, being loudly himself.", "kid"); return; }
  if (S.f.a5_guestDone) { await RP.lines(["@marcus I'M ON THE LIST. I'M ON THE LIST. I'M ON THE LIST.", "Yes, Marcus. All of you."]); return; }
  if (!S.f.a5_gateMet) { await RP.lines(["@marcus There he is! The man! The legend!", "Hey, Marcus. Is that a tent?", "@marcus I got here at noon. Whit's the guy with the clipboard. Talk to him first. He's the gatekeeper."]); return; }
  await RP.lines([
    "@marcus You said I could bring a few people.",
    "I said \"a few,\" Marcus. A few is not thirty.",
    "@marcus I counted it. It's thirty-one. I'm very specific.",
    "That's thirty-one people. There's capacity for twelve.",
    "@marcus Okay, so we'll fit twelve. The rest of us will wait outside, like it's 1993. Lou would understand."
  ]);
  const res = await A5.play("guestList", { capacity: 12, requests: 31, vip: ["Lou", "Ray", "Twinkie", "Jess", "Eddie Two-Times"], difficulty: 2, venue: "Harbor Lights" }, { skipLabel: "Just hand over the list" });
  S.f.a5_guestDone = true;
  const admitted = res.admitted != null ? res.admitted : 12, angry = res.angry != null ? res.angry : 3;
  S.f.a5_guestAngry = angry;
  RP.sfx(res.ok && angry <= 3 ? "success" : "buzz");
  if (angry <= 3) await RP.lines(["@a5_whit Twelve in. Nineteen out. Four slightly grumpy. That's the best list we've seen all week.", "@marcus I'm not mad. I'm... I'm fine. I've been betrayed, but I'm fine."]);
  else await RP.lines(["@a5_whit Twelve in. A lot of people very, very loud about it. That was an experience.", "@marcus I WANT A RECOUNT. I WANT TO SPEAK TO A MANAGER.", "@a5_whit I'm the manager. The answer is no. But with synergy."]);
  S.f.a5_louPass = true; RP.give("a5_loupass"); RP.sfx("pickup");
  await RP.lines([
    "@a5_whit And one more thing: an envelope for \"Lou, 4B\"? A man phoned the office eighteen times. Each time he said, and I quote, \"Keep it DOWN.\"",
    "That's him. That's Lou.",
    "@a5_whit Okay, it's his. It's got a pass in it. No plus-one. He was very clear.",
    "He doesn't do plus-ones.",
    "Marcus, you have a spot. Twelve people. Jess, Ray, Twinkie, Eddie. And Lou's pass is going through the pipe hole."
  ]);
  RP.setClock("FRI 8:20 PM"); RP.followers(Math.max(0, 600 - angry * 100));
  A5.setDay(S, 2, "FRI 8:40 PM", "night");
  await RP.lines([
    "Done. The list's in. Time to go home and slide this under a pipe.",
    "@a5_margoT (text) Whit says the list is in. I said \"synergy\" and he said \"synergy.\" We're basically a family now. Sleep."
  ]);
}

async function margoTalk(S) {
  await RP.lines([
    "@a5_margoT Eleven forty-five. Soundcheck at four. Axl has a trailer the size of Delaware.",
    "@a5_margoT Your pass is wrong. The printer was run by an intern named Brian. Don't let Gloria see it.",
    "@a5_margoT If there's a problem, call me. If there's a disaster, text me. If there's a miracle, don't tell me. I'll jinx it."
  ]);
}
async function margoIntro(S) {
  S.f.a5_metMargo = true; S.f.noTravel = true;
  await RP.lines([
    "@a5_margoT You're two hours early. Good. Early people get hired. Late people get anecdotes.",
    "I didn't sleep. Is that good or bad?",
    "@a5_margoT It's content. Here's the day: soundcheck at four, main stage, Roz is the stage manager. Doors at six.",
    "@a5_margoT Axl plays ten-fifteen to eleven-thirty. You're eleven forty-five. Headline. Closer. The only slot that matters.",
    "@a5_margoT Backstage is east, past the lawn. Gloria guards the fence. Your pass has a typo. Brian did it.",
    "Brian?",
    "@a5_margoT The intern. It's a whole thing. Fix it before Gloria sees. Ray might have a Sharpie. Ray has everything."
  ]);
  RP.text("MARGO (MGR)", "SAT: you're in. Backstage via the east gate. Pass: fix the typo (Sharpie, Ray). 4 PM soundcheck, main stage. 11:45 PM you headline. Breathe.", true);
}

/* ---------------------------------------------------------------------------------------- room */
RP.room({
  id: "a5_gate", act: 5, name: "Harbor Lights — Main Gate",
  paint, cacheKey: S => (dusk(S) ? "d" : "s") + (fri(S) ? "f" : "") + S.name, light: lightMap, lightKey: S => (dusk(S) ? "d" : "s"),
  ambience: "festival",
  walk: [[8, 222], [632, 222], [632, 252], [8, 252]],
  start: { x: 70, y: 232, face: "right" },
  fx: [
    { type: "beams", origins: [[380, 150], [540, 150], [450, 150]], colors: ["#ffd8a0", "#9fe8ff", "#ff9ad5"], base: -Math.PI / 2, swing: 0.5, len: 150, width: 7, alpha: 0.12, period: 2400, on: () => dusk(RP.state) },
    { type: "dust", rect: [340, 60, 230, 120], count: 22, color: "#ffe9d0", on: () => dusk(RP.state) },
    { type: "custom", draw: (c, dt, t) => art.ferrisDraw(c, 620, 84, 34, t, { color: dusk(RP.state) ? "#3a3068" : "#6a6490" }) }
  ],
  actors: S => [
    { id: "a5_whit", char: "a5_whit", x: 262, y: 207, face: "front", act: "stand", name: "Whit" },
    { id: "marcus", char: "marcus", x: 106, y: 232, face: "right", act: "stand", name: "Marcus", vis: S2 => fri(S2) },
    { id: "a5_margo", char: "a5_margo", x: 300, y: 232, face: "left", act: "stand", name: "Margo", vis: S2 => A5.day(S2) === 3 },
    { crowd: { n: 4, rect: [20, 232, 100, 16], seed: 21, face: "front", act: "stand", scale: 0.95, vis: S2 => fri(S2) } },
    { crowd: { n: 22, rect: [330, 232, 270, 18], seed: 33, face: "back", act: "dance", scale: 0.9, vis: S2 => A5.day(S2) === 3 } }
  ],
  sprites: [
    { y: 218, draw: art.sprite((c, S) => drawFrontProps(c, S)) },
    { y: 226, draw: art.sprite((c, S) => drawCamp(c, S), S => fri(S)) },
    { y: 222, draw: art.sprite((c, S) => drawLamps(c, S), S => dusk(S)) }
  ],
  hotspots: [
    { id: "a5_gsub", name: "subway stairs", r: [4, 160, 66, 54], z: 20, walk: [40, 232, "back"], look: "The subway stairs. It's where I come from and where I'll end up at 4 AM, probably.", exit: S => S.f.noTravel ? "Margo would murder me. The festival's all I've got today." : "travel" },
    { id: "a5_gexit", name: "to the festival grounds", r: [600, 150, 40, 102], z: 25, walk: [622, 232, "right"], look: "East. The grounds, the lawn, the stages, and way back, a very big white fence with a very big woman in front of it.",
      exit: S => A5.day(S) === 3 ? { room: "a5_grounds", x: 40, y: 232, face: "right" } : "The grounds are closed tonight. Tomorrow. Today is for wristbands, lists and nerves." },
    { id: "a5_garch", name: "Harbor Lights arch", rects: [[340, 40, 244, 170]], z: 10, walk: [460, 224, "back"], look: "The Harbor Lights arch. A truss tower on each side, a giant LED screen with my name... well, the festival's. A lighthouse on top. It's the best thing I've ever walked under.", use: "I walk under it. It feels like a pass to something. It is, technically.", pickup: "It's an arch. It's four tonnes. I stretch my back anyway." },
    { id: "a5_gled", name: "LED panel", r: [360, 76, 200, 44], z: 20, walk: [460, 224, "back"], look: "A giant LED panel scrolling HARBOR LIGHTS in pink. It plays a loop of waves. I'm told it can show anything. I'd show a cat.", talk: "It's an LED panel. It doesn't answer. It has screen presence.", push: "I don't push LED panels. They're expensive." },
    { id: "a5_gtent", name: "artist check-in tent", r: [128, 126, 172, 94], z: 18, walk: [210, 232, "back"], look: "ARTIST CHECK-IN: a pop-up tent, a table, a laptop and a box of wristbands.", pickup: "Four poles and a canopy. It's not mine to carry." },
    { id: "a5_gtable", name: "check-in table", r: [150, 150, 132, 66], z: 30, walk: [216, 232, "back"], look: "A table with a laptop, three boxes of wristbands and a sticky note saying LIST. Lists everywhere. Even the stationary stuff has anxiety.", pickup: "Whit's watching. Whit is always watching. Also humming.", use: "Whit says it's for authorized synergy only." },
    { id: "a5_gcamp", name: "Marcus's tent", r: [10, 168, 82, 52], z: 30, vis: S => fri(S), walk: [100, 232, "left"], look: "A green dome tent with a cardboard sign that says PLUS 30 in marker. Marcus has set up camp outside a festival that hasn't started. That's... commitment.", open: "I unzip it a little. Four lawn chairs, a ukulele, and a very flat air mattress. I zip it back.", use: "I'm not going in there. It smells like optimism and cold pizza.", pickup: "It's his tent. It has a mortgage's worth of lanyards." },
    { id: "a5_gcool", name: "cooler", r: [116, 206, 30, 22], z: 31, vis: S => fri(S), walk: [128, 232, "back"], look: "A blue cooler. Warm juice, a half-eaten sandwich, and a note that says \"FOR LOU.\" Marcus planned this.", open: "Warm juice, a sandwich with one bite out, and the note FOR LOU.", pickup: "It's heavy with 31 people's worth of snacks." },
    { id: "a5_gbar", name: "barricades", rects: [[350, 194, 90, 28], [480, 194, 90, 28]], z: 24, walk: [460, 230, "back"], look: "Crowd barriers, GA on the left and GUEST on the right. Tomorrow the line for GUEST is going to be very, very long.", push: "Barricades are designed so you can't. I can't.", pickup: "They're stacked three-high on a truck. This one's welded to my dignity." },
    { id: "a5_glamp", name: "street lamp", r: [100, 100, 40, 126], z: 26, walk: [120, 236, "back"], look: "A sodium lamp. The color of every bad decision I ever made at 3 AM.", use: "Nothing to use. It's lit already.", pickup: "It's bolted to the pavement. The pavement is bolted to Brooklyn." },
    { id: "a5_gwater", name: "the harbor", r: [0, 60, 330, 84], z: 12, walk: [160, 232, "back"], look: S => dusk(S) ? "The harbor at sunset. Manhattan on the other side, pink and gold and lit like a pinball machine. And a bridge. It's so beautiful it feels like a trap." : "The harbor in the sun. Manhattan's skyline across the water, a bridge, a tugboat. Somebody should put a stage here. Oh. They did.", talk: "The harbor doesn't answer. It's busy being gorgeous.", pickup: "I can't pick up a harbor. I've tried a lot of things in this game." },
    { id: "a5_gwheel", name: "Ferris wheel", r: [526, 40, 80, 90], z: 11, walk: [560, 232, "back"], look: "A Ferris wheel past the arch, spinning slowly in pink and yellow lights. Every festival has one. It's a rule. A beautiful, wobbly, overpriced rule.", use: "I'll ride it after the set. With one of the thousand people who'll hug me.", pickup: "Ferris wheel. Very big. No." },
    { id: "a5_whit", name: "Whit", talk: S => whitTalk(S), look: "Preston \"Whit\" Whitlock, Harbor Lights promoter. Linen suit, shades on his head, lanyard, a clipboard like a shield. The man who says \"synergy\" like other people breathe.", give: (S, item) => item === "a5_pass" ? "Whit: \"Don't give it back! It's authentic! Brian laminated it!\"" : "Whit: \"For me? A gift! I accept it on behalf of the synergy.\"", pickup: "I'm not carrying Whit. He'd see it as a networking opportunity." },
    { id: "marcus", name: "Marcus", talk: S => marcusTalk(S), look: "Marcus. My best friend. He has a tent, a cooler, thirty-one friends and no regrets.", give: (S, item) => "Marcus: \"For ME? Thanks! Wait, what is it? Okay, I'll hold on to it, and I'm also on the list.\"", pickup: "Not even a little. He'd bring thirty friends." },
    { id: "a5_margo", name: "Margo", talk: S => margoTalk(S), look: "Margo Quist. My manager. Navy blazer, glasses, phone in one hand, clipboard in the other, expression of a woman who's seen the invoice and it was beautiful.", give: "Margo: \"Don't give me anything. Send me a PDF.\"", pickup: "No. She'd bill me for the lift." }
  ],
  combos: [
    ["a5_pass", "a5_whit", "Whit: \"Beautiful, right? I'm so proud. Of the pass. Not of the spelling, but of the spirit.\""],
    ["a5_loupass", "a5_whit", "Whit: \"That's Lou's. Please. Lou wants it. Lou called eighteen times.\""],
    ["a5_loupass", "marcus", "Marcus: \"Is that Lou's pass? It's beautiful. Does he need a ride? I'll ride him. I mean, drive him.\""],
    ["a5_marker", "a5_whit", "Whit: \"Don't sign me! I'm not a pass!\""]
  ],
  enter: async (S, from) => {
    if (A5.day(S) === 3) {
      S.f.noTravel = true;
      if (!S.f.a5_metMargo) await margoIntro(S);
      return;
    }
    if (!S.f.a5_gateEnter) {
      S.f.a5_gateEnter = true; RP.setClock("FRI 7:05 PM");
      await RP.lines(["Harbor Lights at dusk. The arch, the lighthouse, the Ferris wheel and a thousand light bulbs.", "It's not even open yet. It looks like the inside of my head, on a good day."]);
    }
  },
  self: { look: "The headliner. Standing in front of an arch with my name on it. Well, the festival's name. My name's on the poster.", talk: "I'm rehearsing my humble face. Nobody's looking. It's good." }
});
})();
