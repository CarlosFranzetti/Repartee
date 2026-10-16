/* Act 1 — a1_synergex: Synergex Solutions, 14th floor, Midtown. Brenda guards the supply closet (Form 27-B
   has never existed). The fire alarm (burnt popcorn, see 52_breakroom.js) evacuates the floor; the closet
   maglock fails open; take the USB 3-pack.
   Flags: a1_brendaMet, a1_asked27, a1_alarm, a1_workersGone, a1_brendaGone, a1_lockBroken, a1_gotUSB. */
(function () {
"use strict";
const RP = window.RP;
const A1 = RP.a1, PK = RP.PK;
const { R, P, ell, line, poly, bayer, mulberry, clamp, txt, txtW, txtC, mix, ramp } = RP.u;
const U = PK.util;
const W = 640, FY = 168;

const CLOSET = { x: 528, y: 58, w: 52, h: 110 };
const ELEV = { x: 596, y: 52, w: 44, h: 116 };
const BREAK = { x: 4, y: 58, w: 48, h: 110 };

function whiteboard(c, x, y) {
  R(c, x - 2, y - 2, 72, 56, "#9a96a8"); R(c, x, y, 68, 52, "#f4f4f8"); R(c, x, y, 68, 1, "#fff"); R(c, x, y + 51, 68, 1, "#c8c4d0");
  txt(c, "Q3 SYNERGY", x + 4, y + 4, "#2a50c8"); R(c, x + 4, y + 11, 40, 1, "#2a50c8");
  [[6, 18, 18, 10], [30, 18, 18, 10], [18, 34, 18, 10]].forEach(([bx, by, bw, bh]) => { R(c, x + bx, y + by, bw, 1, "#c0302c"); R(c, x + bx, y + by + bh, bw, 1, "#c0302c"); R(c, x + bx, y + by, 1, bh, "#c0302c"); R(c, x + bx + bw, y + by, 1, bh + 1, "#c0302c"); });
  line(c, x + 24, y + 23, x + 30, y + 23, "#2a2a3a"); line(c, x + 27, y + 28, x + 27, y + 34, "#2a2a3a"); txt(c, "???", x + 24, y + 38, "#2a2a3a");
  txt(c, "LEVER", x + 46, y + 22, "#3a8a3a"); txt(c, "PIVOT", x + 46, y + 30, "#3a8a3a"); R(c, x + 4, y + 47, 60, 2, "#c8c4d0");
  R(c, x + 6, y + 44, 3, 6, "#c0302c"); R(c, x + 12, y + 44, 3, 6, "#2a50c8");
}
function poster(c, x, y, w, h, bg, fg, a, b, d) {
  R(c, x - 1, y - 1, w + 2, h + 2, "#2a2838"); R(c, x, y, w, h, bg); U.gradient(c, x, y, w, 14, [[0, mix(bg, "#fff", 0.2)], [1, bg]], 1, true);
  ell(c, x + w / 2, y + 22, 8, 6, mix(fg, bg, 0.5)); poly(c, [[x + w / 2 - 14, y + 34], [x + w / 2, y + 18], [x + w / 2 + 14, y + 34]], mix(fg, bg, 0.7));
  txtC(c, a, x + w / 2, y + h - 22, fg, 1); txtC(c, b, x + w / 2, y + h - 14, fg, 1); txtC(c, d, x + w / 2, y + h - 7, mix(fg, bg, 0.4), 1);
}
function elevator(c, x, y, w, h) {
  const em = [];
  R(c, x - 3, y - 3, w + 6, h + 3, "#6a6a7a"); R(c, x, y, w, h, "#b8bac8"); U.gradient(c, x, y, w, h, [[0, "#e8eaf4"], [0.5, "#a8aab8"], [1, "#7a7c8c"]], 1, false);
  R(c, x + w / 2 - 1, y, 2, h, "#3a3c48"); R(c, x + w / 2 - 1, y, 1, h, "#e8eaf4");
  for (let i = 0; i < 8; i++) { R(c, x + 3, y + 8 + i * 13, w / 2 - 6, 1, "#8a8c9c"); R(c, x + w / 2 + 3, y + 8 + i * 13, w / 2 - 6, 1, "#8a8c9c"); }
  R(c, x - 3, y - 14, w + 6, 12, "#14141c"); txtC(c, "14", x + w / 2, y - 11, "#ff9a3f", 2); em.push([x - 3, y - 14, w + 6, 12]);
  R(c, x - 8, y + 56, 6, 12, "#2a2a34"); ell(c, x - 5, y + 60, 2, 2, "#ffd23f"); ell(c, x - 5, y + 65, 2, 2, "#c8c4d8"); em.push([x - 7, y + 59, 4, 4]);
  U.dshade(c, x, y, w, h, "#ffffff", (px, py) => { const q = ((px - x) * 0.8 + (py - y) + 400) % 50; return q < 6 ? 1 : 0; }, 0.18);
  return em;
}
const closetOpen = S => !!(S.f.a1_alarm || S.f.a1_lockBroken);
function closetDoor(c, S) {
  const { x, y, w, h } = CLOSET, open = closetOpen(S), em = [];
  R(c, x - 3, y - 3, w + 6, h + 3, "#3a3c4a");
  if (!open) {
    R(c, x, y, w, h, "#7a8494"); U.gradient(c, x, y, w, h, [[0, "#a8b0c0"], [0.2, "#7a8494"], [1, "#4a5260"]], 1, true);
    R(c, x, y, 1, h, "#dce4f0"); R(c, x + w - 1, y, 1, h, "#2a303c");
    for (let py = y + 14; py < y + h - 10; py += 16) { R(c, x + 3, py, w - 6, 1, "#4a5260"); R(c, x + 3, py + 1, w - 6, 1, "#a8b0c0"); }
    R(c, x + 6, y + 70, w - 12, 4, "#c8c4d8"); R(c, x + 6, y + 70, w - 12, 1, "#fff");                      /* push bar */
    R(c, x + w - 12, y + 44, 8, 14, "#1a1a24"); R(c, x + w - 11, y + 45, 6, 3, "#c0302c"); em.push([x + w - 11, y + 45, 6, 3]);     /* keycard reader, red */
  } else {
    R(c, x, y, w, h, "#0c0a12"); U.gradient(c, x + 2, y + 2, w - 4, h - 2, [[0, "#2a2438"], [1, "#0c0a12"]], 1, true);
    for (let i = 0; i < 3; i++) { const sy = y + 24 + i * 28; R(c, x + 4, sy, w - 8, 3, "#6a5a48"); R(c, x + 4, sy, w - 8, 1, "#a8946a");
      for (let k = 0; k < 5; k++) R(c, x + 6 + k * 8, sy - 10, 6, 10, ["#c8c4d8", "#e8e0cc", "#a8b0c0", "#d8c890", "#8a96a8"][(k + i) % 5]); }
    /* the USB blister packs, sitting on the middle shelf, glowing a little */
    if (!S.f.a1_gotUSB) { for (let k = 0; k < 2; k++) { R(c, x + 10 + k * 18, y + 38, 14, 16, "#e8e4f0"); R(c, x + 10 + k * 18, y + 38, 14, 2, "#3a63c8"); R(c, x + 12 + k * 18, y + 43, 3, 7, "#2a2836"); R(c, x + 17 + k * 18, y + 43, 3, 7, "#2a2836"); em.push([x + 10 + k * 18, y + 38, 14, 16]); } }
    poly(c, [[x, y], [x + 14, y + 8], [x + 14, y + h - 6], [x, y + h]], "#7a8494"); R(c, x, y, 1, h, "#dce4f0");
    line(c, x, y, x + 14, y + 8, "#dce4f0"); R(c, x + 12, y + 8, 2, h - 14, "#2a303c");
    U.dshade(c, x + 14, y + h - 30, w - 14, 30, "#ffcf7a", (px, py) => (py - (y + h - 30)) / 30 * 0.8, 0.28);
  }
  R(c, x - 14, y + 18, 12, 18, "#f4f0e8"); R(c, x - 14, y + 18, 12, 18, "#f4f0e8"); outlineR(c, x - 14, y + 18, 12, 18, "#c0302c");
  txt(c, "FORM", x - 13, y + 20, "#c0302c"); txt(c, "27-B", x - 13, y + 26, "#3a3a4a"); txt(c, "REQ", x - 13, y + 32, "#c0302c");
  R(c, x + 4, y - 14, w - 8, 10, "#e8e0cc"); outlineR(c, x + 4, y - 14, w - 8, 10, "#6a5a40"); txtC(c, "SUPPLY", x + w / 2, y - 12, "#3a1c1c", 1); txtC(c, "CLOSET", x + w / 2, y - 6, "#3a1c1c", 1);
  return em;
}
function outlineR(c, x, y, w, h, col) { R(c, x, y, w, 1, col); R(c, x, y + h - 1, w, 1, col); R(c, x, y, 1, h, col); R(c, x + w - 1, y, 1, h, col); }

const B = {
  desk: () => A1.memo("sx_desk", 150, 70, c => {
    PK.counter(c, 6, 18, 138, 46, { top: "#d8d0c0", front: "#5a6a8a", panelW: 46, seed: 211 });
    /* items on top: forms tray, nameplate, phone, bell, candy jar, lanyard */
    R(c, 10, 8, 26, 12, "#c8c4d4"); R(c, 10, 8, 26, 1, "#fff"); R(c, 12, 4, 22, 6, "#f4f0e8"); R(c, 12, 4, 22, 1, "#fff"); txt(c, "27-B", 16, 6, "#c0302c"); R(c, 10, 17, 26, 3, "#8a869c");
    R(c, 44, 11, 32, 8, "#2a2a34"); R(c, 44, 11, 32, 1, "#5a5a6a"); txtC(c, "BRENDA", 60, 13, "#ffd23f", 1);
    R(c, 82, 8, 16, 11, "#2a2a34"); R(c, 82, 8, 16, 1, "#6a6a7a"); R(c, 85, 5, 10, 4, "#2a2a34"); R(c, 86, 11, 8, 2, "#8a8a9a");
    ell(c, 108, 16, 4, 2, "#c8c4d0"); R(c, 107, 10, 2, 5, "#c8c4d0"); R(c, 105, 9, 6, 2, "#ffd23f");
    R(c, 118, 6, 14, 14, "#c8e8f8"); R(c, 118, 6, 14, 2, "#e8f8ff"); for (let i = 0; i < 5; i++) ell(c, 121 + (i % 3) * 4, 12 + (i / 3 | 0) * 4, 1, 1, ["#c0302c", "#ffd23f", "#3a8ad8"][i % 3]);
    R(c, 102, 18, 14, 2, "#c0302c");
  })
};

function paintOffice(c, S) {
  const em = [], rnd = mulberry(50);
  /* ---- walls + ceiling + carpet ---- */
  PK.plaster(c, 0, 0, W, FY, { base: "#cbd0dc", seed: 201, patches: 0, stains: 1, cracks: 0 });
  R(c, 0, 0, W, 22, "#a8acb8"); for (let x = 0; x < W; x += 40) R(c, x, 0, 1, 22, "#8a8e9c"); for (let y = 11; y < 22; y += 11) R(c, 0, y, W, 1, "#8a8e9c");
  [[40, 4], [190, 4], [340, 4], [490, 4]].forEach(([px, py]) => { R(c, px, py, 70, 12, "#e8f4ff"); R(c, px, py, 70, 1, "#fff"); em.push([px, py, 70, 12]); R(c, px, py + 11, 70, 1, "#9aa8b8"); });
  U.dshade(c, 0, 22, W, 14, "#2a2a3a", (px, py) => 1 - (py - 22) / 14, 0.25);
  R(c, 0, FY - 6, W, 6, "#3a3e50"); R(c, 0, FY - 6, W, 1, "#6a6e80");
  PK.carpet(c, 0, FY, W, 256 - FY, { pattern: "plain", base: "#46557a", seed: 202 });
  PK.speckle(c, 0, FY, W, 88, ["#566690", "#3a4868"], 0.06, 77);
  /* ---- window + skyline ---- */
  em.push.apply(em, PK.window(c, 66, 28, 190, 92, { view: "city", time: "day", bridge: false, frame: "#b8bcc8", frameW: 4, sill: "#c8ccd8", seed: 203 }));
  /* ---- cubicles (back left) ---- */
  em.push.apply(em, PK.officeCubicle(c, 62, 70, 112, 92, { color: "#6a7a96", seed: 204 }));
  em.push.apply(em, PK.officeCubicle(c, 186, 70, 112, 92, { color: "#7a6a96", seed: 205 }));
  /* ---- right: whiteboard, copier, cooler ---- */
  whiteboard(c, 314, 32);
  em.push.apply(em, PK.copier(c, 336, 126, { seed: 206 }));
  PK.waterCooler(c, 306, 122, {});
  poster(c, 394, 40, 40, 52, "#1a3a6a", "#e8f0ff", "TEAMWORK", "SOMEONE", "ELSE DOES");
  poster(c, 440, 44, 40, 48, "#6a1a2a", "#ffe8d0", "SYNERGY", "IT IS A", "WORD");
  PK.clock(c, 488, 40, { d: 22, hour: 9, min: 2, color: "#3a3e50" });
  PK.frame(c, 486, 70, 28, 22, { color: "#8a8c9c", kind: "portrait", seed: 207 });
  txt(c, "EMPLOYEE", 484, 94, "#3a3e50"); txt(c, "OF THE MONTH", 480, 100, "#3a3e50");
  /* ---- break room + closet + elevator ---- */
  R(c, BREAK.x - 3, BREAK.y - 3, BREAK.w + 6, BREAK.h + 3, "#3a3c4a"); R(c, BREAK.x, BREAK.y, BREAK.w, BREAK.h, "#7a8498"); U.gradient(c, BREAK.x, BREAK.y, BREAK.w, BREAK.h, [[0, "#a8b2c4"], [1, "#586074"]], 1, true);
  R(c, BREAK.x + 6, BREAK.y + 6, BREAK.w - 12, 34, "#10141c"); R(c, BREAK.x + 7, BREAK.y + 7, BREAK.w - 14, 32, "#8ab0d8"); U.gradient(c, BREAK.x + 7, BREAK.y + 7, BREAK.w - 14, 32, [[0, "#c8e0f8"], [1, "#6a8ab8"]], 1, true);
  R(c, BREAK.x + 6, BREAK.y + 62, BREAK.w - 12, 4, "#c8c4d8");
  R(c, BREAK.x - 2, BREAK.y - 16, BREAK.w + 4, 12, "#e8e0cc"); outlineR(c, BREAK.x - 2, BREAK.y - 16, BREAK.w + 4, 12, "#6a5a40"); txtC(c, "BREAK ROOM", BREAK.x + BREAK.w / 2, BREAK.y - 13, "#3a1c1c", 1);
  R(c, BREAK.x + 4, BREAK.y + 44, BREAK.w - 8, 10, "#efeaf6"); txtC(c, "NO FISH", BREAK.x + BREAK.w / 2, BREAK.y + 47, "#c0302c", 1);
  em.push.apply(em, closetDoor(c, S));
  em.push.apply(em, elevator(c, ELEV.x, ELEV.y, ELEV.w, ELEV.h));
  /* alarm strobe box + PA speaker + exit sign */
  R(c, 304, 24, 18, 10, "#efeaf6"); R(c, 304, 24, 18, 1, "#fff"); R(c, 306, 26, 14, 5, "#c0302c"); txt(c, "FIRE", 307, 27, "#fff6dc");
  ell(c, 520, 28, 5, 5, "#2a2a34"); ell(c, 520, 28, 3, 3, "#5a5a6a");
  R(c, 556, 24, 24, 9, "#0a2a1a"); txtC(c, "EXIT", 568, 26, "#9fffc0", 1); em.push([556, 24, 24, 9]);
  /* fire-drill: wall-mounted plan */
  R(c, 288, 90, 12, 14, "#efeaf6"); outlineR(c, 288, 90, 12, 14, "#c0302c"); R(c, 291, 94, 6, 1, "#c0302c"); R(c, 291, 97, 4, 1, "#3a3a4a");
  /* baseboard shadows */
  U.dshade(c, 0, FY - 14, W, 14, "#0c0618", (px, py) => (py - FY + 14) / 14, 0.3);
  return em;
}

function lightOffice(S) {
  return {
    ambient: "#a6aac2",
    lights: [
      { x: 75, y: 8, r: 230, color: "#e8f4ff", steps: 4, sy: 1.1 }, { x: 225, y: 8, r: 230, color: "#e8f4ff", steps: 4, sy: 1.1 },
      { x: 375, y: 8, r: 230, color: "#e8f4ff", steps: 4, sy: 1.1 }, { x: 525, y: 8, r: 230, color: "#e8f4ff", steps: 4, sy: 1.1 },
      { box: [70, 32, 182, 84], r: 140, color: "#fff4e8", steps: 3, power: 0.8 },
      { x: 620, y: 70, r: 90, color: "#ffd890", steps: 3, power: 0.4 }
    ],
    key: { x: 160, y: 40 }, shadow: 0.5
  };
}

function drawOffice(c, S, t) {
  /* ceiling light flicker (the lights know) and alarm overlay */
  if (S.f.a1_alarm) {
    const k = Math.floor(t / 450) % 2;
    R(c, 304, 24, 18, 10, k ? "#ff3a3a" : "#8a1a1a"); if (k) { U.dshade(c, 0, 0, W, 256, "#ff2a2a", (px, py) => 0.4, 0.07); }
    R(c, 306, 26, 14, 5, k ? "#ffd0d0" : "#c0302c");
  }
  /* PC screens flicker */
  const f = A1.flick(t, 400, 2);
  R(c, 101, 81, 4, 1, f < 50 ? "#9fffd0" : "#5ad8a0");
}

/* ---------- scenes ---------- */
async function firstArrival(S) {
  S.f.a1_brendaMet = true; RP.setClock("WED 9:02 AM");
  await RP.lines([
    "Fourteenth floor. The elevator doors close on a version of me that still believed in mornings.",
    "@a1_brenda You're the Staffright temp.", "That's me.",
    "@a1_brenda Name?", "It's... " + (S.name || "DJ NOBODY") + ".",
    "@a1_brenda That's not a name. That's a brand. You're not on my list.",
    "The agency sent me. Shift's at nine.",
    "@a1_brenda The agency sends me twelve temps a week. I recognize none of them. Desk fourteen.",
    "@a1_brenda Don't touch anything with a plug. Lunch is noon. It's nine. Welcome to Synergex.",
    "I'm not here for desk fourteen. I'm here for a USB. ...I'm here for a USB, aren't I?"
  ]);
}

async function brendaTalk(S) {
  await RP.convo([
    { text: "I'm the new temp, from Staffright.", when: S => S.f.a1_brendaMet, once: true, run: () => RP.lines(["@a1_brenda I know. I've said that name six times today. It means nothing to me. Desk fourteen.", "@a1_brenda It has a stapler. The stapler is the only thing in this department with a pulse."]) },
    { text: "Is there a USB drive I could borrow?", once: true, run: async () => { S.f.a1_asked27 = true; await RP.lines(["@a1_brenda USB drives are controlled assets. You'll need a requisition. Form 27-B, in triplicate.", "Where do I get a 27-B?", "@a1_brenda The supply closet."]); } },
    { text: "Can you get me a Form 27-B?", when: S => S.f.a1_asked27, once: true, run: () => RP.lines(["@a1_brenda The forms are in the supply closet.", "And the closet is...?", "@a1_brenda Locked. It requires a Form 27-B to open.", "So I need the form to get the form.", "@a1_brenda Exactly. Welcome to compliance.", "Has anyone ever gotten one?", "@a1_brenda No. There has never been a form. That's how we keep the closet clean."]) },
    { text: "What if I just looked in the closet?", when: S => S.f.a1_asked27, once: true, run: () => RP.lines(["@a1_brenda Absolutely not. It's a controlled space. It has a magnetic lock. And me."]) },
    { text: "What happens if there's a fire?", when: S => S.f.a1_asked27, once: true, run: () => RP.lines(["@a1_brenda I'm the floor warden. I have a vest. In an alarm I evacuate EVERYONE. Nobody stays on my floor.", "@a1_brenda I take it very seriously. Last month there was a drill and I carried Greg down fourteen flights.", "@a1_brenda I don't want to talk about Greg."]) },
    { text: "Nice lanyard.", once: true, run: () => RP.lines(["@a1_brenda This lanyard has seen two mergers and a data breach. It's earned more respect than you.", "...Fair."]) },
    { text: "What's with the sign on your desk?", once: true, run: () => RP.lines(["@a1_brenda NO FORM, NO SERVICE. It's a mission statement. It's the only thing we've never had to revise."]) },
    { text: "Never mind.", end: true }
  ]);
}

async function evacuate(S) {
  S.f.a1_evacStarted = true;
  RP.sfx("alarm");
  await RP.lines(["@pa Attention. A fire event has been detected on floor fourteen.", "@pa Please proceed to the nearest exit. Do not use the elevators. This is not a drill."]);
  RP.actor("a1_brenda").expr = "angry";
  await RP.lines(["@a1_brenda EVERYBODY OUT! STAIRS! NOT THE ELEVATOR! LEAVE YOUR BELONGINGS!", "@a1_greg My sandwich--", "@a1_brenda LEAVE THE SANDWICH, GREG."]);
  const ids = ["a1_dev", "a1_marge", "a1_greg", "a1_yuki"];
  await Promise.all(ids.map((id, i) => RP.npcWalk(id, 626, 236 + (i % 2) * 5, "right")));
  S.f.a1_workersGone = true;
  RP.actor("a1_brenda").expr = null;
  await RP.npcWalk("a1_brenda", 520, 238, "right");
  await RP.say("@a1_brenda YOU. TEMP. OUT. NOW.", "a1_brenda");
  await RP.say("Right behind you!");
  await RP.npcWalk("a1_brenda", 626, 238, "right");
  S.f.a1_brendaGone = true;
  await RP.lines(["...I am not right behind her.", "An empty office. A siren. A closet door that is, per its own sign, supposed to release on a fire alarm."]);
}

async function takePack(S) {
  if (S.f.a1_gotUSB) return "I already took the pack. Let's not push it.";
  if (!closetOpen(S)) return "It's locked.";
  RP.give("a1_usb3"); S.f.a1_gotUSB = true; RP.setClock("WED 10:05 AM");
  await RP.lines(["The closet: shelves of toner, sticky notes, a lifetime supply of binder clips... and USB sticks. Whole racks of them.", "I take a 3-pack. Controlled assets, uncontrolled kid."]);
  RP.text("DANTE (NOWHERE)", "also ask ray at deep cuts (east village) 4 a closer. tell him i sent u. he'll insult u. thats how u know its working");
  if (S.f.a1_alarm) {
    S.f.a1_brendaGone = false; RP.place("a1_brenda", 624, 238, "left");
    await RP.lines(["@a1_brenda ALL CLEAR. ALL CLEAR! It was the microwave. WHO BURNT LINDA'S POPCORN?", "@a1_brenda ...Temp? Why are you in the closet?", "The alarm went off. I was looking for the exit. Got turned around.", "@a1_brenda The exit is the elevator. Which is closed. Because of the FIRE. Stairs. Left."]);
    S.f.a1_alarm = false; S.f.a1_lockBroken = true; S.f.a1_workersGone = false; RP.relight();
    ["a1_dev", "a1_marge", "a1_greg", "a1_yuki"].forEach((id, i) => RP.place(id, WORKERS[id].x, WORKERS[id].y, WORKERS[id].face));
    await RP.npcWalk("a1_brenda", 450, 188, "front");
    await RP.lines(["@a1_brenda I have to file Form 27-C. Incident report. Do you know how many forms that is?", "@a1_brenda I'm going to be filling this out until Friday. Don't talk to me."]);
    await RP.lines(["The all clear. The workers file back in. The microwave is somebody else's problem.", "Wednesday. 10:05 AM. I've committed a crime. I've also got a USB 3-pack. Time to go find Ray."]);
  } else {
    await RP.say("Wednesday. 10:05 AM. A USB 3-pack. A whole life of crime, if I wanted it. Time to find Ray.");
  }
}

const WORKERS = {
  a1_dev: { x: 96, y: 206, face: "front", act: "stand" },
  a1_marge: { x: 366, y: 200, face: "front", act: "stand" },
  a1_greg: { x: 310, y: 202, face: "right", act: "stand" },
  a1_yuki: { x: 232, y: 200, face: "front", act: "phone" }
};
const workerVis = S => !S.f.a1_workersGone;

RP.room({
  id: "a1_synergex", act: 1, name: "Synergex Solutions (14)",
  paint: paintOffice, draw: drawOffice, light: lightOffice,
  cacheKey: S => (closetOpen(S) ? "b" : "c") + (S.f.a1_gotUSB ? "u" : ""), lightKey: S => "x",
  ambience: "office",
  walk: [[64, 208], [590, 208], [606, 250], [56, 250]],
  scale: [208, 0.96, 250, 1.04],
  start: { x: 592, y: 238, face: "left" },
  fx: [
    { type: "dust", rect: [60, 30, 500, 130], count: 16, color: "#f4fff4" },
    { type: "smoke", x: 28, y: 160, rise: 90, size: 20, drift: 18, color: "#6a6670", count: 12, speed: 0.5, on: () => RP.state.f.a1_alarm },
    { type: "strobe", period: 900, flash: 150, alpha: 0.12, color: "#ff2a2a", on: () => RP.state.f.a1_alarm }
  ],
  update: (dt, S, t) => A1.alarmTick(S, t),
  actors: [
    Object.assign({ id: "a1_brenda", char: "a1_brenda", x: 456, y: 188, face: "front", act: "stand", name: "Brenda", vis: S => !S.f.a1_brendaGone }),
    Object.assign({ id: "a1_dev", char: "a1_dev", name: "Dev", vis: workerVis }, WORKERS.a1_dev),
    Object.assign({ id: "a1_marge", char: "a1_marge", name: "Marge", vis: workerVis }, WORKERS.a1_marge),
    Object.assign({ id: "a1_greg", char: "a1_greg", name: "Greg", vis: workerVis }, WORKERS.a1_greg),
    Object.assign({ id: "a1_yuki", char: "a1_yuki", name: "Yuki", vis: workerVis }, WORKERS.a1_yuki)
  ],
  sprites: [
    { y: 200, draw: c => A1.blit(c, B.desk(), 380, 122) },
    { y: 246, draw: c => A1.blit(c, A1.memo("sx_plant", 56, 80, cc => { PK.plant(cc, 2, 2, { size: 2 }); }), 560, 168) },
    { y: 236, draw: c => A1.blit(c, A1.memo("sx_trash", 22, 30, cc => { R(cc, 3, 6, 16, 22, "#3a3e50"); R(cc, 3, 6, 16, 2, "#8a8e9c"); R(cc, 3, 6, 1, 22, "#5a5e70"); for (let i = 0; i < 3; i++) R(cc, 5, 12 + i * 5, 12, 1, "#1c2030"); R(cc, 8, 3, 7, 4, "#efeaf6"); U.dshade(cc, 1, 27, 20, 3, "#000", () => 0.8, 0.4); }), 266, 212) }
  ],
  enter: async (S, from) => {
    S.f.noTravel = false;
    if (!S.f.a1_brendaMet) await firstArrival(S);
    else if (S.f.a1_alarm && !S.f.a1_evacStarted) await evacuate(S);
  },
  leave: async (S, to) => {
    if (S.f.a1_alarm && to !== "a1_breakroom") { S.f.a1_alarm = false; S.f.a1_lockBroken = true; S.f.a1_workersGone = false; S.f.a1_brendaGone = false; S.f.a1_evacStarted = false; RP.relight(); }
  },
  hotspots: [
    { id: "breakDoor", name: "break room", r: [0, 40, 56, 128], z: 30, walk: [72, 226, "left"], look: "The break room. A sign says NO FISH. The sign has been there so long it's become folklore.",
      exit: S => ({ room: "a1_breakroom", x: 76, y: 238, face: "right" }) },
    { id: "elevator", name: "elevator (to the street)", r: [588, 36, 52, 132], z: 30, walk: [596, 232, "back"], look: "The elevator. Fourteen floors of looking at your shoes. It goes to the lobby and the subway.",
      exit: S => S.f.a1_alarm ? "The sign says \"DO NOT USE ELEVATORS IN CASE OF FIRE.\" I'm a respecter of signs. Sometimes." : A1.travelExit(S, true), push: "I push the call button. It's already lit. It's always already lit." },
    { id: "closet", name: "supply closet", r: [524, 44, 60, 124], z: 28, walk: [548, 220, "back"],
      look: S => closetOpen(S) ? "The supply closet. The door's hanging open, the maglock released. A very civilized heist." : "SUPPLY CLOSET. A keycard reader, a Form 27-B holder that's empty, and in tiny print: MAGLOCK RELEASES ON FIRE ALARM (CODE 3.1). ...I'm listening, Code 3.1.",
      open: async S => { if (!closetOpen(S)) { await RP.lines(["I try the handle.", "@a1_brenda FORM 27-B!", "I... don't have one.", "@a1_brenda THEN YOU DON'T HAVE CLOSET ACCESS."]); return; } await takePack(S); },
      use: async S => { if (!closetOpen(S)) { await RP.lines(["I try the handle.", "@a1_brenda FORM 27-B!", "@a1_brenda THAT IS A CONTROLLED SPACE, TEMP."]); return; } await takePack(S); },
      push: S => RP.runH(RP.curRoom().def.hotspots.find(h => h.id === "closet").use, S), pull: "It's a maglock. It doesn't care how hard I pull. It's thinking about fire.", pickup: "It's a door. Doors aren't taken. They're gone through.", talk: "\"Knock knock?\" Nothing. It's a closet. It has no sense of humor." },
    { id: "usbpack", name: "USB drives", r: [540, 94, 40, 24], z: 40, vis: S => closetOpen(S) && !S.f.a1_gotUSB, walk: [550, 216, "back"], look: "A shelf of USB drives in blister packs. They glow a little from the red alarm light. Or from my conscience. Mostly the alarm.",
      pickup: S => takePack(S), use: S => takePack(S) },
    { id: "window", name: "window", r: [62, 24, 198, 100], z: 6, walk: [168, 216, "back"], look: "Midtown, fourteen floors down. Taxis the size of Skittles and a skyline that doesn't look back. The view is what they bill for.", open: "It doesn't open. In an office tower, windows are for looking and for lawsuits.", push: "I push the glass. It doesn't break, which is the first thing this building has done right.", pickup: "It's a window. I'd need a crane." },
    { id: "cubicle1", name: "cubicle", r: [56, 66, 124, 96], z: 14, walk: [116, 214, "back"], look: "Desk fourteen. A monitor, a stapler, a mug that says WORLD'S OKAYEST TEMP. Somebody made it just for me. I find that offensive and moving.", use: "I sit. I stare at the screen. Nothing happens. I've had worse mornings.", pickup: "Everything on that desk is bolted down or has Brenda's initials on it. Same thing.", open: "The drawer's locked. The staplers are, apparently, controlled assets.", push: "I push the cubicle wall. It wobbles. It's a fabric lie." },
    { id: "cubicle2", name: "cubicle", r: [180, 66, 124, 96], z: 14, walk: [240, 214, "back"], look: "Somebody's cubicle. A succulent, a tiny Jenga set, and a photo of a golden retriever. This person is loved.", pickup: "I'm not stealing a golden retriever's photo. I have limits.", use: "It's somebody's desk. They'd know. They'd always know." },
    { id: "whiteboard", name: "whiteboard", r: [312, 30, 74, 58], z: 16, walk: [350, 214, "back"], look: "Q3 SYNERGY ROADMAP. Three boxes, an arrow, three question marks, and the words LEVERAGE and PIVOT. It's the most honest corporate document I've ever read.", pickup: "Everything on it is already erased in spirit.", use: "I draw a little smiley. It looks back at me with an air of defeat." },
    { id: "copier", name: "copier", r: [334, 122, 60, 50], z: 24, walk: [366, 214, "back"], look: "A copier the size of a small car. The screen says: ERR 27: A FORM 27-B IS REQUIRED TO COPY. I think the building has a theme.", use: "I try to copy my hand. It says ERR 27. Even the copier wants a form.", open: "The lid lifts. Inside: a trapped sheet of paper from 2016. It's still warm. That's unsettling.", push: "It hums. It doesn't care.", pickup: "It weighs more than I do. And it has a sense of dignity." },
    { id: "cooler", name: "water cooler", r: [304, 120, 22, 50], z: 24, walk: [296, 214, "right"], look: "A water cooler. The cup dispenser is empty. Somebody is drinking from their hands. Somebody is Greg.", use: "I get a sip. It tastes like a pipe and someone else's cup.", pickup: "That's too heavy and too communal.", open: "The tap stays shut. Out of solidarity." },
    { id: "deskBrenda", name: "reception desk", r: [384, 124, 144, 78], z: 22, walk: [470, 226, "back"], look: "Brenda's desk. A tray of Form 27-Bs (empty), a nameplate, a bell, a candy jar and a sign: NO FORM, NO SERVICE. It's less a desk than a border crossing.", pickup: "Everything on that desk is Brenda's. Even the air.", use: "I ring the bell. A ding. Brenda's eye twitches. Nothing else happens.", open: "The drawers are locked. Of course they're locked.", push: "It's bolted to the floor. As is Brenda." },
    { id: "formtray", name: "Form 27-B tray", r: [386, 122, 30, 14], z: 34, walk: [412, 214, "back"], look: "A tray labeled FORM 27-B. Completely empty. Dust has settled. Dust has formed a small, dignified committee.", pickup: "There's nothing in it. A real artifact of a mythical form.", use: "Nothing in the tray to use." },
    { id: "clock", name: "clock", r: [486, 38, 26, 26], z: 14, walk: [500, 216, "back"], look: "9:02. It's been 9:02 for as long as I've been here. Probably it's actually 9:02. Meetings are about to start.", pickup: "That's time, and it's bolted down." },
    { id: "posters", name: "motivational posters", rects: [[394, 38, 40, 56], [438, 42, 40, 52]], z: 14, walk: [430, 216, "back"], look: "\"TEAMWORK (SOMEONE ELSE WILL DO IT).\" \"SYNERGY: IT'S A WORD WE USE.\" The artist is a hero and also unemployed." },
    { id: "eotm", name: "employee of the month", r: [482, 66, 36, 40], z: 14, walk: [500, 216, "back"], look: "A photo frame labeled EMPLOYEE OF THE MONTH. The frame is empty. The month is October. Nobody qualified.", pickup: "It's an empty frame. I could take it and hang it over my bed.", talk: "\"Congratulations on the lack of award.\" ...no answer." },
    { id: "plant", name: "ficus", r: [560, 150, 36, 80], z: 24, walk: [556, 232, "right"], look: "A ficus that's been dying since the Bloomberg administration. It's out of water, out of light, and out of options. Like me, but taller.", use: "I water it from the cooler. It thanks me with a leaf. No it doesn't.", pickup: "It's heavy and pot-bound and dying. Not unlike me.", talk: "\"Hang in there, buddy.\" The ficus doesn't answer. Gerald would've." },
    { id: "trash", name: "trash can", r: [264, 212, 26, 34], z: 24, walk: [250, 232, "right"], look: "A trash can full of printed emails and a single, impossible sandwich. Corporate waste.", pickup: "Nope. I'm not digging through an office bin. I'd find ties.", open: "It's a bin. Open and fully informed." },
    { id: "exitsign", name: "exit sign", r: [554, 22, 28, 14], z: 14, walk: [566, 218, "back"], look: "EXIT. Green, glowing, certain. Everything I want my life to be." },
    { id: "strobe", name: "fire alarm", r: [302, 22, 22, 14], z: 20, walk: [316, 214, "back"], look: S => S.f.a1_alarm ? "The alarm strobe. It's flashing red, and so is my conscience." : "A fire alarm strobe. White. Patient. Waiting for its moment.", pull: "There's no lever on this one. The pull stations are in the stairwells, under a camera. I'm not that stupid. Or that brave.", use: "A fire alarm. The lever's elsewhere. Ideas are forming." },
    { id: "firePlan", name: "evacuation plan", r: [286, 88, 16, 18], z: 14, walk: [300, 214, "back"], look: "A floor plan showing the exits. Stairwell A. Stairwell B. A tiny sticker says \"YOU ARE HERE.\" I am. Unfortunately." }
  ],
  combos: [
    ["usb_cat", "a1_brenda", () => RP.lines(["@a1_brenda A personal storage device! Corporate policy eleven! Hand it over!", "No. That's Mr. Whiskers.", "@a1_brenda ...Who?", "My ex's cat. Four thousand photos.", "@a1_brenda ...Keep it. I won't be on the wrong side of a cat."])],
    ["usb_cat", "copier", "I stick the cat USB into the copier. ERR 27. The copier is allergic to cats."],
    ["a1_flyer", "a1_brenda", "\"NOWHERE.\" Brenda reads the flyer with disdain. \"I don't know it. I go home at six.\""],
    ["a1_popcorn", "a1_brenda", "\"LINDA'S POPCORN!\" Brenda gasps. \"Where did you find that? Put that BACK!\" I do not put it back."],
    ["a1_popcorn", "copier", "Popcorn in a copier. That's not a recipe. That's a lawsuit."],
    ["a1_slice", "a1_brenda", "\"Food at my desk? There's a break room for that.\" Brenda sniffs. \"Is that pepperoni? ...Take it away, I'm on a cleanse.\""],
    ["a1_slice", "a1_greg", () => RP.lines(["Greg's eyes lock on the slice.", "@a1_greg Is that Sal's?", "It's spoken for.", "@a1_greg ...I understand.", "He does not."])],
    ["a1_slice", "a1_marge", "\"It's pizza,\" Marge says. \"At nine in the morning? Bold. Respect.\" It stays in my pocket."]
  ]
});
const sxHot = RP.rooms.a1_synergex.hotspots;
const people = {
  a1_brenda: { name: "Brenda", look: S => S.f.a1_lockBroken ? "Brenda, midway through Form 27-C. She's gone full flow state. Don't interrupt a person with a form." : "Brenda. Facilities & Compliance. A lanyard, a vest, a clipboard, and a look that says \"I have never once been wrong.\"", talk: S => S.f.a1_lockBroken ? RP.lines(["@a1_brenda Form. 27. C. I don't have time. Go away.", "I'm just... going."]) : brendaTalk(S), use: "I can't use Brenda. Nobody can. She's a unit.", pickup: "Brenda doesn't get picked up. Brenda gets obeyed.", push: "Brenda doesn't move. Brenda has never moved for anyone. She has moved for a fire drill.", give: "\"No gifts. Gifts are a compliance matter.\"" },
  a1_dev: { name: "Dev", look: "Dev. Headphones on, hoodie up, eyes on a spreadsheet. Everyone here has the same face: \"not now.\"", talk: async S => { await RP.lines(["Hey. First day.", "@a1_dev Hm? Oh. Don't ask me about the printer. Or the microwave. The break room smoke detector is so sensitive that somebody made toast in March and we evacuated for forty minutes.", "@a1_dev Brenda still talks about it. It was her best day."]); }, use: "I tap his shoulder. He looks at me like I've pulled a fire alarm. Close.", pickup: "He's a person. And he has a headset.", push: "I nudge him. He doesn't notice. Headphones: the new armor." },
  a1_marge: { name: "Marge", look: "Marge. She's worked here since the days of fax. She knows where all the bodies, and all the staplers, are.", talk: async S => { await RP.lines(["Morning.", "@a1_marge Brenda hasn't left that desk since the Obama administration. Except for fire drills.", "@a1_marge She LOVES a fire drill. The vest comes out. She's alive."]); }, use: "I'm not using Marge. Marge uses me, sometimes, for the stapler.", pickup: "That would be rude and also a workplace incident.", push: "I give her a nudge. She gives me a look. We both move on." },
  a1_greg: { name: "Greg", look: "Greg. Tie, mustache, a sandwich he's guarding like a state secret. A man who's never been late to lunch.", talk: async S => { await RP.lines(["Hey, Greg.", "@a1_greg Linda keeps her popcorn in the break room cupboard. Extra butter. Don't tell her I told you.", "@a1_greg I've been eyeing it since August. She counts the bags."]); }, use: "I'm not using Greg. He's in the middle of lunch. At nine.", pickup: "Greg is a lot of man. I'd need a spotter.", push: "Greg is a monument. He doesn't move." },
  a1_yuki: { name: "Yuki", look: "Yuki. Glasses, bob, a phone to the ear. She says \"mm-hm\" every four seconds. I'd bet she's not on a call.", talk: async S => { await RP.lines(["Excuse me, is that closet ever open?", "@a1_yuki Nobody's seen it open. The lock's a magnet thing. It's wired to the building. It's... Code 3-something.", "@a1_yuki Sorry, I'm on a call. Mm-hm. Mm-hm."]); }, use: "I wave my hand. Yuki holds up one finger. I wait. I've been waiting all my life.", pickup: "She's on a call. I'm not interrupting that. I'm a coward.", push: "I tap. She says \"mm-hm.\" Fair." }
};
Object.keys(people).forEach(id => sxHot.push(Object.assign({ id }, people[id])));
})();
