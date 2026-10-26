/* Act 4 — a4_ber_platform: Berlin airport station, 11:57 PM. The last express leaves at 12:07.
   Buy a ticket (zones ABC), validate it (a ticket that isn't stamped is just paper), board -> last.Train (airport mode).
   Flags: a4_ticket a4_validated a4_trainDone a4_trainFailed a4_late a4_platIntro */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u, PK = RP.PK, A4 = RP.a4;
const { R, P, ell, poly, line, txt, txtW, mulberry, mix } = U;
const W = 640;

const sprTrain = A4.spr(344, 108, c => {
  PK.subwayCar(c, 2, 2, 340, { doorsOpen: true, lit: true, line: "S", h: 100, stripe: "#c0302c", seed: 14 });
  R(c, 8, 11, 48, 6, "#08060c"); txt(c, "BERLIN HBF", 10, 12, "#ff9a3f", 1, 0); txt(c, "FEX", 52, 12, "#ffd23f", 1, 0);
  R(c, 322, 70, 18, 18, "#14111c"); ell(c, 331, 80, 8, 8, "#c0302c"); txt(c, "S", 329, 78, "#ffffff");
});
const sprTicketMachine = A4.spr(56, 84, c => {
  R(c, 2, 2, 52, 80, "#e8c020"); R(c, 2, 2, 52, 2, "#ffe870"); R(c, 2, 80, 52, 2, "#8a6a10"); R(c, 2, 2, 2, 80, "#ffe070"); R(c, 52, 2, 2, 80, "#a07a10");
  R(c, 6, 6, 44, 10, "#14306a"); txt(c, "FAHRKARTEN", 8, 9, "#ffd23f");
  R(c, 8, 20, 40, 24, "#0a1a2a"); R(c, 10, 22, 36, 20, "#1a3a5a"); R(c, 12, 25, 22, 2, "#39d0ff"); R(c, 12, 29, 28, 1, "#6a8ad8"); R(c, 12, 33, 18, 1, "#ffb030"); R(c, 12, 37, 24, 1, "#6a8ad8");
  for (let r = 0; r < 2; r++) for (let q = 0; q < 3; q++) R(c, 9 + q * 13, 48 + r * 9, 11, 7, "#c8c4d8");
  R(c, 8, 68, 22, 6, "#17131f"); R(c, 36, 66, 12, 10, "#3a384e"); R(c, 38, 70, 8, 2, "#17131f");
});
const sprValidator = A4.spr(20, 34, c => {
  R(c, 4, 24, 12, 10, "#5a5c70"); R(c, 2, 2, 16, 24, "#c0302c"); R(c, 2, 2, 16, 2, "#ff7a6a"); R(c, 2, 24, 16, 2, "#6a1a1a");
  R(c, 4, 6, 12, 5, "#efe6d0"); R(c, 5, 8, 10, 1, "#17131f"); txt(c, "STEMPEL", 0, 0, "#c0302c");
  R(c, 6, 13, 8, 3, "#17131f"); R(c, 8, 18, 4, 6, "#efe6d0");
});
const sprStagSign = A4.spr(40, 16, c => { R(c, 0, 0, 40, 16, "#efe6d0"); R(c, 0, 0, 40, 1, "#ffffff"); txt(c, "JUNGGE", 3, 3, "#c0302c"); txt(c, "SELLEN", 3, 9, "#c0302c"); });

/* ------------------------------------------------------------------ paint */
function paint(c, S) {
  const em = []; const E = a => { if (a && a.length) for (const r of a) em.push(r); return a; };
  E(PK.subwayPlatform(c, 0, 0, W, 256, { name: "FLUGHAFEN BER", tile: "#c4c8cc", stripe: "#c0302c", floor: "#6c6a84", seed: 5 }));
  // Berlin-ify: concrete columns over the green ones, new plaques over BROOKLYN
  [8, 168, 328, 488].forEach(px => { PK.util.cylV(c, px, 9, 14, 116 - 4, "#7c7a92"); R(c, px - 2, 9, 18, 3, "#4a4860"); R(c, px - 3, 112, 20, 5, "#4a4860"); R(c, px, 96, 14, 4, "#c0302c"); R(c, px, 100, 14, 12, "#e8e4f0"); txt(c, "C", px + 5, 104, "#c0302c"); });
  [224, 384, 544].forEach(px => { R(c, px - 36, 26, 72, 18, "#101a3a"); R(c, px - 36, 26, 72, 18, "#101a3a"); R(c, px - 35, 27, 70, 16, "#14306a"); R(c, px - 36, 26, 72, 1, "#e8e4f0"); R(c, px - 36, 43, 72, 1, "#e8e4f0"); txt(c, "FLUGHAFEN", px - 18, 29, "#ffffff"); txt(c, "BER  T1-2", px - 17, 37, "#9fb0ff"); em.push([px - 36, 26, 72, 18]); });
  // departure board on the wall
  E(PK.departuresBoard(c, 214, 14, 216, 44, { title: "ABFAHRT / DEPARTURES", seed: 31, rows: 2 }));
  const bx = 214, by = 14, bw = 216, ry = by + 10 + 10;
  const cols = [0.0, 0.17, 0.52, 0.68, 0.78].map(f => bx + 5 + Math.round(f * (bw - 10)));
  R(c, bx + 3, ry - 1, bw - 6, 8, "#14306a"); txt(c, "00:07", cols[0], ry, "#ffd23f"); txt(c, "HAUPTBAHNHOF", cols[1], ry, "#ffffff"); txt(c, "FEX", cols[2], ry, "#ffffff"); txt(c, "GL.1", cols[3], ry, "#ffd23f"); txt(c, "PUNKTLICH", cols[4], ry, "#5cff9a");
  // poster: Halle Neun, kein small talk
  PK.poster(c, 40, 34, 56, 76, { title: "HALLE NEUN", titleLines: ["HALLE", "NEUN"], lines: ["SA - TECHNO", "KEIN SMALL TALK"], palette: "mono", seed: 61 });
  // network map
  R(c, 480, 52, 50, 56, "#efe6d0"); R(c, 480, 52, 50, 1, "#ffffff"); R(c, 480, 107, 50, 1, "#a89e88"); txt(c, "LINIENNETZ", 484, 55, "#14306a");
  line(c, 486, 70, 524, 70, "#c0302c"); line(c, 486, 88, 524, 80, "#2f62b8"); line(c, 504, 60, 504, 104, "#2a7a4a"); line(c, 486, 100, 524, 96, "#e8c020");
  [[504, 70], [504, 84], [494, 72], [514, 90]].forEach(([x, y]) => { ell(c, x, y, 2, 2, "#17131f"); ell(c, x, y, 1, 1, "#ffffff"); });
  txt(c, "YOU ARE", 486, 96, "#c0302c"); txt(c, "HERE (C)", 486, 102, "#c0302c");
  // sit on the track-side clutter: Berlin sticker tags
  [[20, 118, "#ff3fa4"], [60, 120, "#39d0ff"], [150, 124, "#ffd23f"], [330, 119, "#9be15d"], [570, 122, "#ff3fa4"]].forEach(([x, y, col]) => { R(c, x, y, 9, 4, col); R(c, x, y, 9, 1, "#ffffff55"); });
  // benches, bin, ticket machine, validator
  PK.bench(c, 520, 194, 90, { back: true });
  PK.trashCan(c, 596, 182, { color: "#c0302c" });
  return em;
}

function draw(c, S, t) {
  // the countdown over the track: 6, 5, 4... minutes (symbolic) and a flashing arrival light
  const f = Math.floor(t / 500) % 2;
  R(c, 600, 116, 3, 3, f ? "#ff4a4a" : "#7a1a1a"); R(c, 38, 116, 3, 3, f ? "#3fd07a" : "#1a6a3a");
  // the clock in the corner: 23:58, then ticking
  const mm = Math.min(59, 58 + Math.floor(t / 60000));
  R(c, 262, 112, 24, 8, "#0a0810"); txt(c, "23:" + mm, 264, 114, "#ff4a4a");
}

function light(S) {
  return {
    ambient: "#8a90b2",
    lights: [
      { x: 60, y: 14, r: 150, color: "#e0f0ff", steps: 3, power: 0.55 }, { x: 220, y: 14, r: 150, color: "#e8f4ff", steps: 3, power: 0.5 },
      { x: 400, y: 14, r: 150, color: "#e0f0ff", steps: 3, power: 0.5 }, { x: 560, y: 14, r: 150, color: "#e8f4ff", steps: 3, power: 0.55 },
      { x: 320, y: 84, r: 90, color: "#ffb030", steps: 3, power: 0.35 }, { x: 120, y: 140, r: 90, color: "#ffd23f", steps: 2, power: 0.35 }
    ],
    rims: [{ x: 320, y: 40, r: 300, color: "#c0e0ff" }], key: { x: 320, y: 14 }, shadow: 0.55
  };
}

/* ------------------------------------------------------------------ puzzle */
async function buyTicket(S) {
  if (RP.has("a4_ticket")) { await RP.say("I've got a ticket. Now I just need to stamp it. In Germany, the stamp is the ticket."); return; }
  const i = await RP.choose(["Zones A and B ($3.50)", "Zones B and C ($3.50)", "Zones A, B and C ($4.90)", "Day pass, all zones ($9.00)", "Never mind"]);
  if (i === 4) return;
  const prices = [3.5, 3.5, 4.9, 9];
  if (!RP.canAfford(prices[i])) { await RP.say("Declined. A ticket machine just declined me. At an airport. In Germany."); return; }
  if (i === 2 || i === 3) {
    RP.money(-prices[i]); RP.sfx("coin"); RP.give("a4_ticket"); S.f.a4_ticket = true;
    await RP.lines([i === 2 ? "ABC. The airport's in zone C, so it's the one that gets me to the city." : "The day pass. It's overkill. But I'm not going to explain 'zones' to a ticket machine.", "The ticket prints. \"Gültig nach Entwertung\": valid after validation. That's German for \"it's not a ticket yet.\""]);
  } else {
    await RP.lines(["The machine thinks. And prints. And spits out: \"UNGÜLTIG FÜR DIESE ZONE.\" It gives me nothing and takes nothing. A fair deal.",
      "The airport's in zone C. I need the one that gets there."]);
  }
}
async function validate(S) {
  if (!RP.has("a4_ticket")) { await RP.say("The red box stamps tickets. I need one first. The yellow machine sells them."); return; }
  if (S.f.a4_validated) { await RP.say("It's stamped. It's valid. It's alive."); return; }
  S.f.a4_validated = true; RP.sfx("thump"); RP.refreshInv();
  await RP.lines(["*KA-CHUNK.* A little green stamp. It's the loudest thing I've done all day.", "In Germany there are no turnstiles. Just a promise and some very serious inspectors. That's a real system based on trust.", "Okay. The train's here. It leaves at 12:07."]);
}
async function boardTrain(S) {
  if (S.f.a4_trainDone) { await RP.say("I'm on my way. No going back. It's a platform, not a time machine."); return; }
  if (!RP.has("a4_ticket")) { await RP.lines(["The doors flash and beep at me. I'd better buy a ticket from the yellow machine first."]); return; }
  if (!S.f.a4_validated) { await RP.lines(["The train's doors are open. The ticket's not stamped. Inspectors in Germany are rumored to smell a fraud from the platform.", "The red box over there. The stamp."]); return; }
  await RP.walkTo(240, 224, "back");
  RP.setClock("SUN 12:07 AM");
  await RP.lines(["The doors close. The train hums. It's 12:07 exactly. The Germans are a precise people.", "@a4_pa FEX nach Berlin Hauptbahnhof. Nächster Halt: Ostkreuz. Next stop: Ostkreuz. Please mind the gap and your record bag."]);
  const res = await RP.mg.play("lastTrain", { from: "BER Airport", to: "Halle Neun, Berlin", battery: 18, money: Math.round(S.money), carrying: "records", mode: "airport", difficulty: 2 });
  const r = res || { ok: false };
  const ok = !!r.ok && !(r.minutesLate > 25);
  S.f.a4_trainDone = true; S.f.a4_late = Math.max(0, Math.round(r.minutesLate || (ok ? 0 : 40)));
  if (ok) {
    await RP.lines(["Door-to-door in an hour. A train, a tram, a night bus and a sprint. The city blurs past, a smear of neon and cranes.", "It's 12:58 AM. I'm in Berlin, I'm breathing, and my bag is still with me. Nothing has been lost."]);
    RP.setClock("SUN 12:58 AM");
    await RP.goto("a4_berlin_street", 40, 236, "right");
    return;
  }
  S.f.a4_trainFailed = true;
  await RP.lines(["The doors close on the wrong train. It's the one that goes to the right place at the wrong time.", "I end up at a dead-end station at one in the morning. An old man points. \"Taxi.\" He holds up two fingers. Sixty-five dollars.",
    "Taxi it is. It's late. It's expensive. It's Berlin. I'll get there. Late."]);
  if (S.money >= 65) { RP.money(-65); await RP.say("Sixty-five dollars. The meter runs like it's competing in a race. I pay in a state of shock."); }
  else await RP.say("The driver looks at my wallet. He looks at my record bag. \"Okay. For the bag.\" He drives. Germans are weird about records.");
  RP.setClock("SUN 1:42 AM");
  await RP.goto("a4_berlin_street", 40, 236, "right");
}

/* ------------------------------------------------------------------ the room */
RP.room({
  id: "a4_ber_platform", act: 4, name: "Flughafen BER, platform",
  paint, draw, light, ambience: "subway", music: null,
  walk: [[8, 190], [630, 190], [630, 250], [8, 250]],
  start: { x: 52, y: 232, face: "right" },
  actors: [
    { id: "a4_stag1", char: "a4_stag1", x: 470, y: 232, face: "front", act: "dance", name: "stag party guy" },
    { id: "a4_stag3", char: "a4_stag3", x: 510, y: 238, face: "left", act: "dance", name: "stag party guy" },
    { id: "a4_stag2", char: "a4_stag2", x: 556, y: 230, face: "front", act: "stand", name: "stag party guy" }
  ],
  sprites: [
    { y: 196, draw: c => sprTicketMachine(c, 30, 132) },
    { y: 200, draw: c => sprValidator(c, 118, 138) },
    { y: 120, draw: c => sprTrain(c, 150, 62) }
  ],
  self: { look: "Tour bomber, headphones, a record bag that weighs more than my nerves. A bleary traveler in an underground station at midnight.", talk: "\"Okay. You've got this.\" The station echoes it back. Even the echo sounds doubtful." },
  hotspots: [
    { id: "a4_stag1", name: "stag party guy", look: "A guy in a hi-vis vest with a plastic crown. He's dancing like the ground is on fire, and he's happy about it.", talk: async () => { await RP.lines(["@a4_stag1 HALLO! AMERIKA! You want beer?", "I want a train.", "@a4_stag1 Same! Ha! We're ALSO trying to get to a club!", "@a4_stag1 It's called Halle Neun! We won't get in! Sven doesn't like our vests!"]); }, pickup: "He's dancing. I'd get a vest in the face.", push: "He's already doing a great job of that himself." },
    { id: "a4_stag3", name: "stag party guy", look: "Another vest. Another crown. He's singing something in German that sounds both beautiful and unforgivable.", talk: "He sings LA LA LAAA at me, in a key I don't recognize. No further information.", pickup: "He's mid-dance. I'm not getting involved." },
    { id: "a4_stag2", name: "stag party guy", look: "The third stag, in the vest of someone who lost the vote. He's watching his phone like it owes him money.", talk: async () => { await RP.lines(["@a4_stag2 Don't talk to Jürgen. He's engaged to a ghost.", "I wasn't going to.", "@a4_stag2 Smart. Take the FEX. The express. The last one is the fast one."]); }, pickup: "He'd smile at me. I don't know if I'm ready for that." },
    { id: "a4_tmachine", name: "ticket machine", r: [30, 132, 56, 82], z: 50, walk: [72, 222, "back"],
      look: "A yellow ticket machine with a touchscreen, a coin slot and a note: \"FLUGHAFEN: TARIF ABC.\" German efficiency has a color and it's yellow.", use: S => buyTicket(S), push: "It's got a very firm resolve. And no kicking.", pickup: "It's bolted to the platform. And probably the Bundesrepublik." },
    { id: "a4_validator", name: "ticket validator", r: [116, 136, 22, 40], z: 55, walk: [130, 222, "back"],
      look: "A little red box with a slot. In Germany, you stamp your own ticket. If you forget, a stern man in civilian clothes will make a point.", use: S => validate(S), push: "It's got one purpose. I won't push it from that.", pickup: "It's attached. To everything." },
    { id: "a4_train", name: "airport express", r: [150, 64, 344, 106], z: 20, walk: [300, 226, "back"],
      look: "The last airport express. Red stripe, lit windows, doors open. Its sign says BERLIN HBF and, I'm told, it doesn't wait.", use: S => boardTrain(S), open: S => boardTrain(S), walkTo: S => boardTrain(S), push: "It weighs about 200 tons. It'd leave anyway.", pickup: "It's a train, not a carry-on." },
    { id: "a4_board", name: "departures board", r: [214, 14, 216, 44], z: 25, walk: [320, 220, "back"],
      look: "00:07, FEX to Hauptbahnhof via Ostkreuz, platform 1, PÜNKTLICH. Everything else is also punctual. It's hard to hate them.", use: "The board doesn't take requests. It just takes the time.", pickup: "It's bolted to the wall. And to the Prussian worldview." },
    { id: "a4_map", name: "network map", r: [480, 52, 52, 58], z: 25, walk: [500, 220, "back"],
      look: "A map of colored lines, a bulb of overlapping zones. YOU ARE HERE (C). I suppose that's the first thing it got right.", use: "I'd study it, but the lines look like a bowl of spaghetti with ambitions." },
    { id: "a4_poster", name: "Halle Neun poster", r: [40, 34, 58, 78], z: 20, walk: [70, 220, "back"],
      look: "\"HALLE NEUN: SA - TECHNO. KEIN SMALL TALK.\" Black, white, one red dot. In Berlin even the posters don't smile.", pickup: "It's wheat-pasted. Pulling it would take the wall with it." },
    { id: "a4_bench", name: "bench", r: [520, 168, 92, 38], z: 15, walk: [560, 228, "back"], look: "A metal bench with a view of tracks. A man on it is asleep. Possibly dead. Probably German.", use: "If I sit, I'll miss the last train. And the first. And possibly the entire weekend.", pickup: "Bolted down. Germany bolts everything down." },
    { id: "a4_bin", name: "trash can", r: [594, 180, 24, 34], z: 45, walk: [580, 234, "right"], look: "A red recycling bin with five colors of slots. I put a ticket stub in the green one. Or the yellow. A man frowns." },
    { id: "a4_tracks", name: "tracks", r: [0, 128, 640, 42], z: 5, walk: [320, 226, "back"], look: "Two tracks, rails shining, an electrified third rail. There's a sign: \"NICHT BETRETEN.\" I assume that's \"don't be an idiot.\"", use: "I'm not going down there. They'd put me in a very serious German form.", pickup: "No. It's a track. And the thing on it is also a train." },
    { id: "a4_floor", name: "platform", r: [8, 190, 620, 62], z: 3, floor: true, look: "A concrete platform, yellow edge, a faint smell of ozone and decisions." }
  ],
  combos: [
    ["a4_ticket", "a4_validator", S => validate(RP.state)],
    ["a4_ticket", "a4_tmachine", "I've already got the ticket. The machine's a one-way street."],
    ["a4_ticket", "a4_train", S => boardTrain(RP.state)],
    ["phone", "a4_board", "The phone says 11:58 PM and 18% battery. The board says the same. Even my phone is German tonight."],
    ["a4_bag", "a4_bench", "No sitting. No dropping the bag. The bag and I are one."],
    ["a4_bag", "a4_train", S => boardTrain(RP.state)]
  ],
  enter: async (S, from) => {
    if (!S.f.a4_platIntro) {
      S.f.a4_platIntro = true;
      await RP.lines(["Berlin. 11:57 PM. It's cold, it's concrete, and it smells like new tunnels and old decisions.", "Last train's at 12:07. I need a ticket, a stamp, and no luck at all. Wait: that's backwards. I need luck."]);
    }
  }
});
})();
