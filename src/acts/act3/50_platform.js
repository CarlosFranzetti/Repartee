/* Act 3 — Delancey St platform, half past one. The way home after the anniversary night: a bag of records, rent money only,
   a phone at 3%. last.Train mini-game, then the last train pulls in. Flags: a3_trainTry, a3_train. */
(function () {
"use strict";
const RP = window.RP;
const A3 = RP.A3;
const U = RP.u;
const PK = RP.PK;
const { R, P, ell, txt, txtC, txtW, bayer, mulberry, ramp, mix } = U;
const W = 640;

let trainX = 700, trainState = 0, trainT = 0, doorsOpen = false;
const carClosed = A3.sprite("a3_p_car_c", 290, 100, c => PK.subwayCar(c, 4, 4, 280, { line: "J", doorsOpen: false, lit: true, stripe: "#996633" }));
const carOpen = A3.sprite("a3_p_car_o", 290, 100, c => PK.subwayCar(c, 4, 4, 280, { line: "J", doorsOpen: true, lit: true, stripe: "#996633" }));
const benchSpr = A3.sprite("a3_p_bench", 110, 44, c => PK.bench(c, 4, 4, 100, { back: true, seed: 1101 }));
const machineSpr = A3.sprite("a3_p_vend", 56, 80, c => { const em = PK.vendingMachine(c, 4, 4, { w: 40, h: 66, sign: "SNACKS" }); R(c, 8, 38, 32, 14, "#f4efe4"); txtC(c, "OUT OF", 24, 41, "#c0302c", 1, 1); txtC(c, "ORDER", 24, 47, "#c0302c", 1, 1); return em; });
const kiosk = A3.sprite("a3_p_kiosk", 54, 80, c => {
  R(c, 4, 6, 44, 68, "#2f62b8"); R(c, 4, 6, 44, 2, "#6a9aff"); R(c, 4, 72, 44, 2, "#143a7a"); R(c, 4, 6, 2, 68, "#4a7ad8"); R(c, 46, 6, 2, 68, "#143a7a");
  R(c, 8, 12, 36, 22, "#0a0e12"); R(c, 9, 13, 34, 20, "#123a2a"); txtC(c, "OUT OF", 26, 16, "#ff9a3f", 1, 1); txtC(c, "SERVICE", 26, 22, "#ff9a3f", 1, 1); txtC(c, "TRY NEXT", 26, 28, "#ff9a3f", 1, 1);
  R(c, 10, 40, 14, 10, "#c8c4d8"); R(c, 28, 40, 14, 10, "#c8c4d8"); R(c, 10, 54, 32, 4, "#17101e"); R(c, 12, 62, 28, 6, "#f4efe4"); txtC(c, "METROCARD", 26, 63, "#2f62b8", 1, 1);
});
const bin = A3.sprite("a3_p_bin", 30, 44, c => PK.trashCan(c, 4, 6, { full: true }));
const pizza = A3.sprite("a3_p_slice", 22, 10, c => { U.poly(c, [[2, 3], [18, 2], [10, 9]], "#f2c84a"); U.poly(c, [[2, 3], [18, 2], [18, 4], [2, 4]], "#c8925a"); ell(c, 8, 4, 1, 1, "#c0302c"); ell(c, 13, 4, 1, 1, "#c0302c"); });

function paint(c, S) {
  const em = PK.subwayPlatform(c, 0, 0, W, 256, { name: "DELANCEY ST", seed: 1100 }) || [];
  // subway map poster + wall clock + signs
  R(c, 168, 60, 52, 38, "#e8e4d8"); R(c, 168, 60, 52, 1, "#fff"); R(c, 168, 97, 52, 1, "#a09888");
  const lines = [["#ee352e", [[174, 90], [184, 72], [200, 70], [212, 66]]], ["#2850ad", [[174, 66], [188, 78], [198, 86], [214, 92]]], ["#996633", [[170, 80], [190, 80], [210, 78]]]];
  lines.forEach(([col, pts]) => { for (let i = 0; i + 1 < pts.length; i++) U.line(c, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], col); pts.forEach(p => P(c, p[0], p[1], "#17101e")); });
  txtC(c, "J", 194, 63, "#996633", 1, 1);
  PK.clock(c, 300, 18, { d: 20, hour: 1, min: 35 });
  // an LED "next train" board, drawn dynamically in draw()
  R(c, 420, 20, 96, 20, "#0a0a0e"); R(c, 420, 20, 96, 1, "#4a4658"); R(c, 420, 39, 96, 1, "#1a1822");
  // wet floor sign and chewing-gum constellations
  R(c, 90, 222, 18, 3, "#8a6a10"); U.poly(c, [[93, 222], [96, 212], [102, 212], [105, 222]], "#ffd23f"); txtC(c, "!", 99, 215, "#17101e", 1, 1);
  return em;
}
function light(S) {
  return { ambient: "#6a7686", lights: [{ x: 90, y: 8, r: 240, color: "#e8fff4", steps: 4, sy: 0.9 }, { x: 320, y: 8, r: 260, color: "#e8fff4", steps: 4, sy: 0.9, power: 0.8 }, { x: 540, y: 8, r: 240, color: "#e8fff4", steps: 4, sy: 0.9 }, { x: 460, y: 30, r: 100, color: "#ff9a3f", steps: 3, power: 0.5 }],
    key: { x: 320, y: 0 }, rims: [{ x: 320, y: 10, r: 600, color: "#a8ffe0" }], shadow: 0.55 };
}

function draw(c, S, t) {
  // next-train board
  const mins = trainState ? 0 : 11 - Math.floor((t / 9000) % 3);
  txt(c, "NIGHT SVC", 424, 24, "#ff9a3f", 1, 1);
  txt(c, trainState ? "ARRIVING" : mins + " MIN", 424, 32, "#ff9a3f", 1, 1);
  // a rat on the track bed
  const rx = ((t / 28) % 720) - 40;
  R(c, rx, 158, 7, 3, "#2a2430"); R(c, rx + 6, 157, 3, 2, "#2a2430"); P(c, rx + 8, 157, "#ff6a6a"); R(c, rx - 5, 160, 6, 1, "#3a3040");
  // train
  if (trainState) { (doorsOpen ? carOpen : carClosed)(c, trainX - 4, 62); (doorsOpen ? carOpen : carClosed)(c, trainX - 290, 62); }
}
function update(dt, S, t) {
  if (trainState === 1) {
    trainT += dt; const k = Math.min(1, trainT / 3.2), e = 1 - Math.pow(1 - k, 3);
    trainX = 700 - (700 - 330) * e;
    if (k >= 1) { trainState = 2; doorsOpen = true; RP.sfx("doorBuzz"); }
  }
}

async function runTrain(S) {
  const res = await A3.mg("lastTrain", { from: "Delancey St (Lower East Side)", to: "Bushwick (Apt 4C)", battery: 3, money: 0, carrying: "records", mode: "subway", difficulty: 2 }, {
    giveUp: "Wait on the bench", onFail: async () => { await RP.lines(["I missed it by four seconds. Four seconds, and the train takes my dignity with it.", "The next one's in eleven minutes."]); },
    assist: async () => { await RP.lines(["A stranger with oranges swipes me through at the turnstile. 'Pay it forward,' he says. 'In oranges.'"]); } });
  if (res.giveUp) { await RP.say("I'm not ready. Let me sit with it. Everything hurts."); return false; }
  S.f.a3_train = true;
  await RP.lines(["However I got through the turnstile, I got through. The rent money never left my pocket.", "Down the platform, the headlights come round the curve like a promise."]);
  trainState = 1; trainT = 0; doorsOpen = false;
  await RP.wait(3800);
  await RP.walkTo(330, 214, "back");
  await RP.lines(["I get on. The car's empty, except for a man asleep with a bag of oranges and a woman reading a paperback about a vampire.", "Phone: running on fumes. Bag: all records. Rent money: untouched. I made it.", "@nar The last train, Friday morning, over the Williamsburg Bridge. The river's black, and the bass is still going."]);
  await RP.fadeTo(1, 1200);
  trainState = 0; doorsOpen = false;
  await RP.goto("a3_apartment", 560, 232, "left");
  await RP.fadeTo(0, 600);
  return true;
}
A3.runTrain = runTrain;

RP.room({
  id: "a3_platform", act: 3, name: "Delancey St platform",
  paint, light, draw, update,
  cacheKey: S => "p",
  lightKey: S => "p",
  ambience: "subway",
  music: null,
  walk: [[8, 206], [632, 206], [632, 252], [8, 252]],
  start: { x: 540, y: 230, face: "left" },
  fx: [{ type: "dust", rect: [0, 60, 640, 120], count: 12, color: "#e8fff4" }],
  sprites: [
    { y: 212, draw: c => benchSpr(c, 232, 186) },
    { y: 232, draw: c => machineSpr(c, 540, 144) },
    { y: 232, draw: c => kiosk(c, 82, 146) },
    { y: 244, draw: c => pizza(c, 420, 236) },
    { y: 232, draw: c => bin(c, 440, 190) }
  ],
  actors: [
    { id: "a3_sleeper", char: "a3_sleeper", x: 284, y: 224, face: "front", act: "sit", name: "sleeping guy", noTurn: true }
  ],
  enter: async (S, from) => {
    if (S.f.a3_train) return;
    if (!S.f.a3_platSeen) {
      S.f.a3_platSeen = true; RP.setClock("FRI 1:35 AM");
      await RP.lines(["@nar Friday. Half past one. Delancey Street.", "A bag of records on my shoulder. My phone at 3%. " + (S.money > 0 ? "$" + Math.round(S.money) + " in my wallet, and every dollar of it belongs to my landlord." : "Zero dollars in my pocket."),
        "My MetroCard expired at midnight. The machine's out of service, and the turnstile doesn't take cash, or sympathy. Tonight's problem is the last train home."]);
    }
    await runTrain(S);
  },
  hotspots: [
    { id: "a3_p_edge", name: "platform edge", r: [0, 166, 640, 34], z: 4, floor: true, walk: [320, 210, "front"],
      look: "The platform edge, a yellow line and a lot of ambition. Don't stand behind it. Don't stand ON it. Stand wherever the train isn't.",
      use: S => runTrain(S), talk: "Hello, track. You're what's between me and bed." },
    { id: "a3_sleeper", name: "sleeping guy", z: 80, walk: [330, 220, "left"], look: "A man asleep on the bench with his coat pulled over his head. The universal posture of the last train.", talk: "Hey. ...He's out. Respect.", pickup: "Absolutely not." },
    { id: "a3_p_bench", name: "bench", r: [232, 186, 106, 44], z: 20, walk: [260, 236, "back"], look: "A wooden bench with a lot of carved initials and one very fresh 'JAY + KELLY 4EVR.' The 'EVR' is almost legible.", use: "I'm not sitting next to him. He's got the whole bench." },
    { id: "a3_p_vend", name: "vending machine", r: [540, 144, 50, 80], z: 25, walk: [564, 236, "back"], look: "A vending machine with a sign: OUT OF ORDER. In front of it, a half-eaten pretzel nobody's going to claim.", use: "Out of order. Which saves my rent money from a bag of chips at four in the morning.", pickup: "It's bolted down. By the same people who bolted down the sign." },
    { id: "a3_p_kiosk", name: "MetroCard machine", r: [82, 148, 54, 80], z: 25, walk: [112, 236, "back"], look: "A MetroCard machine: OUT OF SERVICE. TRY NEXT MACHINE. There's no next machine. There never is.", use: "It's out of service. It takes my hope instead. No, it doesn't even take that.", push: "Pushing it won't make it work. Yelling won't either. I try both." },
    { id: "a3_p_map", name: "subway map", r: [166, 58, 56, 42], z: 20, look: "The subway map: a bowl of colored spaghetti with a few dots called 'stations.' Somewhere on there is my bed." },
    { id: "a3_p_clock", name: "clock", r: [298, 16, 24, 24], z: 20, look: "1:35 AM. Every clock on the platform has a different time. This one at least looks sure of itself." },
    { id: "a3_p_board", name: "next-train board", r: [418, 18, 100, 24], z: 20, look: "Night service, eleven minutes. Which is what it said six minutes ago." },
    { id: "a3_p_slice", name: "pizza slice", r: [418, 232, 26, 14], z: 20, floor: true, look: "A slice of pizza on the platform floor. A tragedy and a metaphor.", pickup: "No. NO. I'm broke, not that broke." },
    { id: "a3_p_rat", name: "rat", r: [0, 150, 640, 16], z: 3, look: "A rat on the track bed, strolling like it's the mayor. New York's real landlord." }
  ],
  combos: [
    ["a3_bag", "a3_p_edge", "I take a breath. The bag's heavier than it was at midnight. So am I."],
    ["a3_chips", "a3_sleeper", "I leave the chips on the bench next to him. He can have them. It's the smallest thing I can do for the J-train brotherhood."]
  ],
  self: { look: "Tired, jacket askew, a bag of records and a phone at three percent. The classic last-train look.", talk: "Hello, subway. It's me. The one who always comes at four." }
});
})();
