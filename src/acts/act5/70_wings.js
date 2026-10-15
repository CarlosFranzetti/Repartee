/* Act 5 — a5_wings: stage left, seen from the dark. Axl Vanta is still playing on the blazing stage beyond the masking curtains.
   Roz's calling desk, the clock, Lou's stool. set.Time (scenario "overrun"): get Axl off so the headline set can start. */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u, PK = RP.PK, A5 = RP.a5, art = A5.art;
const { R, P, ell, line, poly, bayer, mulberry, mix, txt, txtC, txtW, clamp } = U;
const K = U.ramp;
const HL = (c, x, y, w, col) => R(c, x, y, w, 1, col), VL = (c, x, y, h, col) => R(c, x, y, 1, h, col);
const axlOn = S => !S.f.a5_overrunDone;

function paint(c, S) {
  const em = [];
  PK.gradV(c, 0, 0, 640, 256, ["#06020e", "#0a0618", "#14082a"], { dither: 1 });
  /* the stage beyond: a blazing LED wall, truss and lamps, the deck, a DJ booth, the sea of the crowd */
  em.push.apply(em, PK.ledWall(c, 150, 18, 420, 100, { pattern: "sunburst", palette: ["#ff3fa4", "#39d0ff", "#a05cff", "#ffd23f"], seed: 31 }));
  const tr = PK.truss(c, 120, 4, 480, 12, { lights: ["#ff3fa4", "#39d0ff", "#ffd23f", "#a05cff", "#5cff9a", "#ff3fa4", "#39d0ff", "#ffd23f"] });
  em.push.apply(em, tr);
  tr.lights.forEach((l, i) => em.push.apply(em, PK.lightCone(c, l.x, l.y, 6, 70 + (i % 3) * 20, 130, l.color, { alpha: 0.5 })));
  PK.speakerStack(c, 568, 52, 40, 100);
  art.lineArray(c, 130, 18, 6, 18, { ch: 9 });
  PK.stage(c, 110, 146, 500, 44, { seed: 3, wedges: false, trim: true });
  em.push.apply(em, PK.crowdSilhouettes(c, 220, 188, 420, 68, { seed: 8, rim: ["#ff3fa4", "#39d0ff"], rows: 3, density: 0.95 }));
  /* the dark foreground: masking curtains (legs) and a cable-strewn floor */
  for (let x = 0; x < 78; x++) { const f = Math.sin(x * 0.9) * 0.5 + 0.5; R(c, x, 0, 1, 256, f > 0.6 ? "#16101e" : f > 0.3 ? "#0c0814" : "#06040a"); }
  for (let x = 596; x < 640; x++) { const f = Math.sin(x * 0.9) * 0.5 + 0.5; R(c, x, 0, 1, 256, f > 0.6 ? "#16101e" : f > 0.3 ? "#0c0814" : "#06040a"); }
  R(c, 74, 0, 6, 256, "#050308");
  PK.util.dshade(c, 80, 0, 40, 256, "#000000", (px) => 1 - (px - 80) / 40, 0.6);
  PK.concrete(c, 0, 196, 80, 60, { base: "#1a1624", seed: 5 });
  R(c, 0, 190, 640, 4, "#0a0710");
  R(c, 80, 190, 520, 2, "#2a2634");                                             /* the lip where the wing meets the deck */
  for (let i = 0; i < 40; i++) P(c, 90 + i * 12, 200 + Math.round(Math.sin(i) * 2), "#2a2838");
  /* black floor with tape marks (the stage manager's spike marks) */
  PK.concrete(c, 0, 196, 640, 60, { base: "#1c1826", seed: 9 });
  R(c, 0, 194, 640, 2, "#0a0710");
  [[120, 226, "#ffd23f"], [150, 238, "#ff3fa4"], [520, 232, "#39d0ff"], [560, 222, "#ffd23f"]].forEach(([tx, ty, tc]) => { R(c, tx, ty, 12, 1, tc); R(c, tx + 5, ty - 5, 1, 11, tc); });
  return em;
}

function drawDesk(c, S) {
  /* Roz's calling position: a desk, a monitor with the stage cam, the big clock, cue lights */
  PK.table(c, 88, 184, 76, 36, { color: "#2a2838", top: "#4a4658" });
  R(c, 96, 150, 40, 26, "#0a0810"); R(c, 98, 152, 36, 22, "#16344a"); PK.gradV(c, 98, 152, 36, 22, ["#ff7ab8", "#6a3aa8", "#1a2a5a"], { dither: 1 });
  R(c, 110, 168, 12, 6, "#17131f"); ell(c, 116, 164, 3, 3, "#17131f");
  R(c, 140, 160, 20, 16, "#17131f"); R(c, 142, 162, 6, 6, S.f.a5_overrunDone ? "#3fd07a" : "#8a1a1a"); R(c, 150, 162, 6, 6, S.f.a5_overrunDone ? "#4a1a1a" : "#ff3a3a"); R(c, 142, 170, 14, 3, "#6a667c");
  R(c, 100, 120, 56, 22, "#0a0810"); outline(c, 100, 120, 56, 22, "#4a4658");
  txtC(c, S.f.a5_overrunDone ? "11:45" : "11:52", 128, 125, S.f.a5_overrunDone ? "#3fd07a" : "#ff3a3a", 2, 1);
  R(c, 90, 178, 8, 4, "#17131f"); R(c, 164, 176, 10, 6, "#c8c4d8");
}
const outline = (c, x, y, w, h, col) => { HL(c, x, y, w, col); HL(c, x, y + h - 1, w, col); VL(c, x, y, h, col); VL(c, x + w - 1, y, h, col); };
function drawStool(c, S) {
  /* a stool for Lou */
  PK.contactShadow(c, 528, 238, 28, 5, { alpha: 0.5 });
  ell(c, 540, 218, 12, 4, "#6a1a2a"); ell(c, 540, 217, 11, 3, "#a02a3e"); R(c, 528, 218, 24, 3, "#4a1020");
  R(c, 531, 221, 2, 20, "#8a86a0"); R(c, 547, 221, 2, 20, "#8a86a0"); R(c, 530, 232, 20, 1, "#6a667c");
}
function drawBooth(c, S) {
  PK.djBooth(c, 262, 112, 240, { gear: "cdj", mixer: "4ch", lights: true, logo: "AXL" });
}
function drawFoot(c, S) {
  /* wing cases in the foreground */
  art.roadCase(c, 6, 190, 46, 38, { label: "MON", wheels: true, sticker: "#ffd23f" }); art.roadCase(c, 6, 156, 40, 34, { label: "SPARE" });
  art.roadCase(c, 596, 204, 40, 36, { label: "DJ", wheels: true });
}

function lightMap(S) {
  return { ambient: "#2a2250", lights: [
    { x: 360, y: 70, r: 380, color: "#ff3fa4", steps: 4, power: 0.8, rim: true }, { x: 360, y: 110, r: 300, color: "#39d0ff", steps: 4, power: 0.5 },
    { x: 120, y: 150, r: 70, color: "#9fe8ff", steps: 3, power: 0.7 }, { x: 128, y: 130, r: 50, color: "#ff3a3a", steps: 2, power: 0.4 }],
    rims: [{ x: 360, y: 80, r: 460, color: "#ff3fa4" }, { x: 420, y: 100, r: 400, color: "#39d0ff" }], key: { x: 360, y: 70 }, shadow: 0.7 };
}

async function pyro(S) { RP.flash("#ffe0a0", 180); }

/* --------------------------------------------------------------------------------------- the overrun */
async function overrun(S) {
  RP.setClock("SAT 11:52 PM");
  await RP.lines([
    "@a5_roz It's eleven fifty-two. You were due at eleven forty-five.",
    "@a5_roz He's playing the fourth encore of a set that had no encores.",
    "@a5_roz And he's got the clock. He's always got the clock. Every clock backstage is HIS clock.",
    "Where's Whit?",
    "@a5_roz Whit's in the lighting booth saying \"synergy\" into a radio. Nobody's answering.",
    "@a5_roz You. Go. Do the thing where you nicely take the room away from someone. I'll help."
  ]);
  const recs = A5.DEFAULT_ORDER.slice(0, 6);
  const res = await A5.play("setTime", { scenario: "overrun", records: recs, followName: "Axl Vanta", minutes: S.f.a5_axlWon ? 12 : 22, difficulty: 3 }, { skipLabel: "Let Roz cut the power" });
  S.f.a5_overrunDone = true; S.f.a5_overrunScore = res.score || 0;
  RP.sfx(res.ok && !res.skipped ? "success" : "buzz");
  if (res.ok && !res.skipped) {
    await RP.lines([
      "@a5_roz Cue lights. Fade him down. Slow, slow... Now.",
      "(The music behind the curtain dissolves into a pulsing hum. A thousand people shout. Then they clap.)",
      "@axl (over the PA) THANK YOU, HARBOR LIGHTS! I LOVE YOU! I'M JUST A VESSEL!"
    ]);
  } else {
    await RP.lines([
      "@a5_roz Okay. Plan B. I'm pulling his monitor mix. Without his own sound, he's a guy waving at a crowd.",
      "(The music on stage dips. Axl stops mid-wave. Then he turns, hurt.)",
      "@axl (over the PA) THAT'S... IT. THAT'S MY SET! IT'S A GIFT! GOOD NIGHT!"
    ]);
  }
  const ax = RP.actor("axl"); ax.vis = () => false;
  RP.shake(300); RP.flash("#ffffff", 200);
  await RP.lines([
    "@a5_roz Axl's off. He's mad, but he's mad quietly.",
    "@a5_roz Four minutes to turn the stage. Your gear is in. Go up the stairs, to the booth. It's yours.",
    "@a5_roz And headliner? ...Don't peak early."
  ]);
  S.f.a5_phase = 3; RP.setClock("SAT 11:57 PM");
  RP.text("PRIYA (MGR)", "Axl's off. You're on. Whatever happens, I'm proud, and I've invoiced.", true);
}

/* --------------------------------------------------------------------------------------- room */
RP.room({
  id: "a5_wings", act: 5, name: "Stage left", paint, cacheKey: S => "w", light: lightMap, ambience: "festival",
  walk: [[84, 214], [590, 214], [590, 250], [84, 250]],
  start: { x: 90, y: 232, face: "right" },
  fx: [
    { type: "beams", origins: [[240, 20], [330, 20], [420, 20], [510, 20]], colors: ["#ff3fa4", "#39d0ff", "#ffd23f", "#a05cff"], base: Math.PI / 2, swing: 0.9, len: 220, width: 16, alpha: 0.18, period: 900 },
    { type: "strobe", period: 2600, flash: 70, alpha: 0.2, on: () => axlOn(RP.state) },
    { type: "custom", draw: (c, dt, t) => { if (!axlOn(RP.state)) return; const k = (t % 3000) / 3000; if (k < 0.12) { for (let i = 0; i < 24; i++) { const fx = 150 + (i % 2) * 430, fy = 190 - k * 600 - (i * 7) % 50; U.R(c, fx + ((i * 13) % 20), fy, 2 + (i % 3), 4 + (i % 4), i % 3 ? "#ffb02a" : "#ff6a2a"); } } } }
  ],
  actors: S => [
    { id: "a5_roz", char: "a5_roz", x: 128, y: 224, face: "right", act: "stand", name: "Roz" },
    { id: "axl", char: "axl", x: 380, y: 150, face: "front", act: "dj", name: "Axl Vanta", z: 0, noTurn: true, vis: S2 => axlOn(S2), clickable: false },
    { id: "lou", char: "lou", x: 530, y: 236, face: "left", act: "stand", name: "Lou", vis: S2 => !!S2.f.a5_louArrived }
  ],
  sprites: [
    { y: 192, draw: (c, S) => drawBooth(c, S) },
    { y: 226, draw: (c, S) => drawDesk(c, S) },
    { y: 236, draw: (c, S) => drawStool(c, S) },
    { y: 240, draw: (c, S) => drawFoot(c, S) }
  ],
  hotspots: [
    { id: "a5_wback", name: "stairs down", r: [0, 150, 22, 104], z: 25, walk: [92, 236, "left"], look: "The stairs back to the compound. And to the people who'd like to hold my hand.", exit: { room: "a5_backstage", x: 880, y: 236, face: "left" } },
    { id: "a5_wstage", name: "the stage", r: [100, 10, 500, 180], z: 10, walk: [400, 232, "back"], look: S => axlOn(S) ? "The stage, blinding. A very large DJ in a white tank is waving his arms at a crowd the size of a small town. He's on his fourth encore. They're still clapping. Maybe out of politeness. Maybe out of fear." : "The stage, empty and still glowing. The booth is waiting.", talk: "I yell something. A tech tells me to be quiet. I stop. I'm in a wing.", push: "I'm not pushing a stage.", pickup: "I can't lift it. It's a stage." },
    { id: "a5_wexit", name: "to the stage", r: [570, 150, 70, 104], z: 28, walk: [586, 236, "right"], look: "A gap in the curtains. Past it, the stage. Past that, the crowd. I'm trying not to think about the crowd.",
      exit: S => !S.f.a5_overrunDone ? "Axl's still on. I'd step on his set. And probably his foot. Talk to Roz." : { room: "a5_mainstage", x: 110, y: 200, face: "right" } },
    { id: "a5_wdesk", name: "calling desk", r: [86, 112, 90, 110], z: 32, walk: [128, 238, "back"], look: S => ["Roz's calling desk: a monitor with the stage camera, a clock, cue lights and a radio. The big red clock says " + (S.f.a5_overrunDone ? "11:45. A lie, in a good way." : "11:52. It's seven minutes later than it should be."), "Two lights: green for go, red for hold. They're both red. They've been both red since 11:30."], pickup: "Roz would take my fingers. Politely.", use: "That's Roz's. It's all Roz's.", pull: "I'm not pulling the stage-manager cue. I'd start a war." },
    { id: "a5_wclock", name: "stage clock", r: [98, 118, 62, 28], z: 38, walk: [128, 238, "back"], look: S => S.f.a5_overrunDone ? "11:45. The clock says it's time. I'm six minutes late and ready." : "11:52. The clock is red. It's the color of Roz's face." },
    { id: "a5_wstool", name: "stool", r: [522, 202, 38, 40], z: 33, walk: [506, 238, "right"], look: "A stool in the wings. The best seat in the house for people who need to sit. Lou will take it.", use: "It's for Lou. I'm not sitting on Lou's throne." },
    { id: "a5_wcases", name: "road cases", rects: [[4, 154, 50, 78], [594, 202, 44, 38]], z: 36, walk: [96, 240, "back"], look: "Black flight cases stenciled MON and DJ. Everything's black. If the world ended, it'd be on a road case.", pickup: "Crew-only." },
    { id: "a5_wcurtain", name: "masking curtain", rects: [[0, 0, 80, 150], [596, 0, 44, 200]], z: 12, walk: [92, 238, "back"], look: "A black wing curtain. They hide the mess and stage hands. Right now I'm one of them.", pull: "I tug the curtain. Roz clears her throat. I let go.", pickup: "Not pickable. Black cloth is eternal." },
    { id: "axl", name: "Axl Vanta", r: [348, 60, 70, 100], z: 15, walk: [400, 232, "back"], look: "Axl, in a sea of light, white tank, shades, arms up. He looks like the sun if the sun were a brand.", talk: "I shout. It disappears into the bass. He does a leap.", give: "I'm not handing him anything mid-leap." },
    { id: "a5_roz", name: "Roz", talk: S => S.f.a5_overrunDone ? RP.lines(["@a5_roz Go. Up the stairs. Be good. Don't peak early."]) : overrun(S), look: "Roz, in the dark, with a headset and a clipboard and a stare that says \"nine minutes ago.\"", give: "Roz: \"I'm busy.\"", pickup: "No.", push: "I'm not pushing Roz. She's got a radio.", use: S => S.f.a5_overrunDone ? "Roz: \"It's done. Go. Just GO.\"" : overrun(S) },
    { id: "lou", name: "Lou", talk: S => RP.lines(["@lou It's loud. It's... it's the loudest thing I've heard. Since 1993.", "Are you okay?", "@lou I'm fine. My ears haven't felt this alive in years. Don't tell your mother."]), look: "Lou, in the good navy cardigan, on a stool, watching a stage with his arms crossed like he's reviewing it. His foot's tapping. He pretends it isn't.", give: "Lou's not taking anything from me. He's got what he came for.", pickup: "Lou would flatten me.", use: "No." }
  ],
  combos: [
    ["a5_pass", "a5_roz", "Roz: \"I know who you are. I do not need your pass. I need your face on that stage.\""],
    ["phone", "a5_wdesk", "Roz: \"No calls. No texts. No Priya, unless it's life or death.\""]
  ],
  enter: async (S, from) => {
    if (ph(S) === 2 && !S.f.a5_overrunDone && S.f.a5_louArrived) { await overrun(S); return; }
    if (S.f.a5_phase === 0 || S.f.a5_phase === 1) {
      if (!S.f.a5_wingsSeen) { S.f.a5_wingsSeen = true; await RP.lines(["The wings, in daylight: gaffer tape, road cases, a stage so big I have to sit down. I don't. I stay standing.", "The stage is out there. I'll go check my gear."]); }
    }
  },
  self: { look: "A headliner in the dark, in a pink-lined coat. Nobody can see me. It's my best look.", talk: "I'm mouthing the words to something. I don't know what." }
});
function ph(S) { return S.f.a5_phase || 0; }
})();
