/* Act 5 — a5_wings: stage left, seen from the dark. Axl Vanta is still playing on the blazing stage beyond the masking curtains.
   Roz's calling desk, the clock, Lou's stool. The overrun: a short scene and a choice to get Axl off so the headline set can start. */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u, PK = RP.PK, A5 = RP.a5, art = A5.art;
const { R, P, ell, line, poly, bayer, mulberry, mix, txt, txtC, txtW, clamp } = U;
const K = U.ramp;
const HL = (c, x, y, w, col) => R(c, x, y, w, 1, col), VL = (c, x, y, h, col) => R(c, x, y, 1, h, col);
const ph = S => S.f.a5_phase || 0;
const axlOn = S => ph(S) >= 2 && !S.f.a5_overrunDone;
const mode = S => ph(S) < 2 ? "day" : (S.f.a5_overrunDone ? "ready" : "live");
/* the calling-desk clock follows the game clock ("SAT 5:20 PM" reads 5:20), and the cue lights follow the show */
const deskTime = S => (S.clock || "").replace(/^[A-Z]+ /, "").replace(/ [AP]M$/, "") || "3:58";
const overrunOn = S => ph(S) >= 2 && !!S.f.a5_louArrived && !S.f.a5_overrunDone;   /* the 11:52 problem, red lights and all */

function paint(c, S) {
  const em = [];
  const md = mode(S);
  PK.gradV(c, 0, 0, 640, 256, ["#06020e", "#0a0618", "#14082a"], { dither: 1 });
  if (md === "day") { PK.sky(c, 100, 0, 500, 148, { time: "day", seed: 4, clouds: 3 }); em.push([100, 0, 500, 148]); }
  /* the stage beyond: a blazing LED wall, truss and lamps, the deck, a DJ booth */
  if (md === "day") { R(c, 150, 18, 420, 100, "#14121c"); HL(c, 150, 18, 420, "#5a566c"); txtC(c, "HARBOR LIGHTS", 360, 58, "#ff3fa4", 3, 2); txtC(c, "FESTIVAL", 360, 82, "#39d0ff", 1, 3); em.push([150, 18, 420, 100]); }
  else em.push.apply(em, PK.ledWall(c, 150, 18, 420, 100, { pattern: "sunburst", palette: ["#ff3fa4", "#39d0ff", "#a05cff", "#ffd23f"], seed: 31 }));
  const tr = PK.truss(c, 120, 4, 480, 12, { lights: md === "day" ? ["#e8e4f0", "#e8e4f0", "#e8e4f0", "#e8e4f0", "#e8e4f0", "#e8e4f0"] : ["#ff3fa4", "#39d0ff", "#ffd23f", "#a05cff", "#5cff9a", "#ff3fa4", "#39d0ff", "#ffd23f"] });
  em.push.apply(em, tr);
  if (md !== "day") tr.lights.forEach((l, i) => em.push.apply(em, PK.lightCone(c, l.x, l.y, 6, 70 + (i % 3) * 20, 130, l.color, { alpha: md === "live" ? 0.5 : 0.2 })));
  PK.speakerStack(c, 568, 52, 40, 100);
  art.lineArray(c, 130, 18, 6, 18, { ch: 9 });
  PK.stage(c, 110, 146, 500, 44, { seed: 3, wedges: false, trim: true });
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
  R(c, 140, 160, 20, 16, "#17131f");
  const lg = S.f.a5_overrunDone ? "#3fd07a" : overrunOn(S) ? "#8a1a1a" : "#2a3a2e", lr = S.f.a5_overrunDone ? "#4a1a1a" : overrunOn(S) ? "#ff3a3a" : "#3a1a1a";   /* standby: both lights dim */
  R(c, 142, 162, 6, 6, lg); R(c, 150, 162, 6, 6, lr); R(c, 142, 170, 14, 3, "#6a667c");
  R(c, 100, 120, 56, 22, "#0a0810"); outline(c, 100, 120, 56, 22, "#4a4658");
  txtC(c, S.f.a5_overrunDone ? "12:30" : overrunOn(S) ? "11:52" : deskTime(S), 128, 125, overrunOn(S) ? "#ff3a3a" : "#3fd07a", 2, 1);
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
  if (mode(S) === "day") return { ambient: "#6a6088", lights: [{ x: 360, y: 40, r: 500, color: "#fff0d0", steps: 3, power: 0.7 }, { x: 120, y: 150, r: 70, color: "#9fe8ff", steps: 3, power: 0.7 }], key: { x: 360, y: 30 }, shadow: 0.5 };
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
    S.f.a5_axlWon ? "@a5_roz He promised you eleven-thirty. He owes me. Six more minutes, tops. I'll see to it." : "@a5_roz He says he's got \"a few more\". With Axl, a few is fourteen.",
    "@a5_roz You. Do the thing where you nicely take the room away from someone. Mo needs a few minutes to patch your rig in. I'll help. How do you want to do it?"
  ]);
  /* the overrun comes out of the first stretch of your slot (11:52 to the 12:28 changeover); winning the argument with Axl buys minutes back */
  const won = !!S.f.a5_axlWon;
  const how = await RP.choose(["Walk on, take the second channel and slide the room away from him, one record at a time.", "Ask Roz to pull his monitor mix.", "Wait it out. He promised."]);
  S.f.a5_overrunHow = how;
  const smooth = how === 0 || (how === 2 && won);
  if (how === 0) await RP.lines(["I walk on in the dark with a pair of headphones, and nod at his tech. His tech, who hates him, nods back.", "I find the key of his last record and bring mine in underneath. Eight bars. Then sixteen.", "@a5_roz " + (won ? "Six minutes of his time left, and he knows I'm counting. He kept half a promise. Keep going." : "He had fourteen more in him. You took them off him. Keep going.")]);
  else if (how === 2 && won) await RP.lines(["I stay put and watch the clock. Roz holds a fader and a very long look.", "@a5_roz He said eleven-thirty. It's eleven fifty-two. He gets six more minutes because I asked nicely. Watch the clock.", "On the stage the sun does an encore bow and is, almost gracefully, finished."]);
  else if (how === 2) await RP.lines(["I wait. Roz waits. The clock does not.", "@a5_roz Promised, he says. To who? Who did he promise?", "Nobody. At 12:06 he's still waving."]);
  S.f.a5_overrunDone = true; S.f.a5_overrunScore = smooth ? 85 : 55;
  RP.sfx(smooth ? "success" : "buzz");
  if (smooth) {
    await RP.lines([
      "@a5_roz That's how you take a room. He faded, you were in before the cheers died, and nobody in that field heard the seam.",
      "(Somewhere offstage, into a microphone nobody turned on:)",
      "@a5_axlPA THANK YOU, HARBOR LIGHTS! I LOVE YOU! I'M JUST A VESSEL!"
    ]);
  } else {
    await RP.lines([
      "@a5_roz Okay. Plan B. I pulled his monitor mix. Without his own sound, he was a guy waving at a crowd.",
      "(The music on stage dipped. Axl stopped mid-wave. Then he turned, hurt.)",
      "@a5_axlPA THAT'S... IT. THAT'S MY SET! IT'S A GIFT! GOOD NIGHT!"
    ]);
  }
  const ax = RP.actor("axl"); ax.vis = () => false;
  RP.shake(300); RP.flash("#ffffff", 200);
  await RP.lines([
    "@a5_roz Axl's off. He's mad, but he's mad quietly.",
    "@a5_roz Mo's got your rig patched in and a loop holding the room. Go up the stairs, to the booth. It's yours.",
    "@a5_roz And headliner? ...Don't peak early."
  ]);
  S.f.a5_phase = 3; RP.setClock("SUN 12:30 AM");
  RP.text("MARGO (MGR)", "Axl's off. You're on. Whatever happens, I'm proud, and I've invoiced.", true);
}

async function rozWings(S) {
  if (ph(S) === 0) { await RP.lines(["@a5_roz Stage is that way. Booth, center. Mo's on the talkback. Check it, then get out of my wings."]); return; }
  if (ph(S) === 1) { await RP.lines(["@a5_roz Soundcheck's done. Mo's pleased, so don't touch anything. Find out what Axl's people want, then come back."]); return; }
  if (S.f.a5_overrunDone) { await RP.lines(["@a5_roz Go. Up the stairs. Be good. Don't peak early."]); return; }
  if (!S.f.a5_louArrived) { await RP.lines(["@a5_roz It's not time. Axl's on at ten-fifteen. Come back when you've seen Lou."]); return; }
  await overrun(S);
}

/* --------------------------------------------------------------------------------------- room */
RP.room({
  id: "a5_wings", act: 5, name: "Stage left", paint, cacheKey: S => mode(S), light: lightMap, lightKey: S => mode(S), ambience: "festival",
  walk: [[84, 214], [590, 214], [590, 250], [84, 250]],
  start: { x: 90, y: 232, face: "right" },
  fx: [
    { type: "beams", origins: [[240, 20], [330, 20], [420, 20], [510, 20]], colors: ["#ff3fa4", "#39d0ff", "#ffd23f", "#a05cff"], base: Math.PI / 2, swing: 0.9, len: 220, width: 16, alpha: 0.18, period: 900, on: () => mode(RP.state) !== "day" },
    { type: "strobe", period: 2600, flash: 70, alpha: 0.2, on: () => axlOn(RP.state) },
    { type: "custom", draw: (c, dt, t) => { if (!axlOn(RP.state)) return; const k = (t % 3000) / 3000; if (k < 0.12) { for (let i = 0; i < 24; i++) { const fx = 150 + (i % 2) * 430, fy = 190 - k * 600 - (i * 7) % 50; U.R(c, fx + ((i * 13) % 20), fy, 2 + (i % 3), 4 + (i % 4), i % 3 ? "#ffb02a" : "#ff6a2a"); } } } }
  ],
  actors: S => [
    { id: "a5_roz", char: "a5_roz", x: 128, y: 224, face: "right", act: "stand", name: "Roz" },
    { id: "axl", char: "axl", x: 380, y: 150, face: "front", act: "dj", name: "Axl Vanta", z: 0, noTurn: true, vis: S2 => axlOn(S2), clickable: false },
    { id: "lou", char: "lou", x: 530, y: 236, face: "left", act: "stand", name: "Lou", vis: S2 => !!S2.f.a5_louArrived }
  ],
  sprites: [
    { y: 192, draw: art.sprite((c, S) => drawBooth(c, S)) },
    { y: 212, draw: art.sprite((c, S) => drawDesk(c, S), S => mode(S) + "|" + deskTime(S) + "|" + overrunOn(S)) },
    { y: 236, draw: art.sprite((c, S) => drawStool(c, S)) },
    { y: 240, draw: art.sprite((c, S) => drawFoot(c, S)) }
  ],
  hotspots: [
    { id: "a5_wback", name: "stairs down", r: [0, 150, 28, 104], z: 40, walk: [92, 236, "left"], look: "The stairs back to the compound. And to the people who'd like to hold my hand.", exit: { room: "a5_backstage", x: 880, y: 236, face: "left" } },
    { id: "a5_wstage", name: "the stage", r: [100, 10, 500, 180], z: 10, walk: [400, 232, "back"], look: S => mode(S) === "day" ? "The stage in daylight: a booth, a wall of dark screen, work lights and a stagehand arguing with a cable. It looks like a spaceship being repaired." : axlOn(S) ? "The stage, blinding. A very large DJ in a white tank is waving his arms at a crowd the size of a small town. He's on his fourth encore. They're still clapping. Maybe out of politeness. Maybe out of fear." : "The stage, empty and still glowing. The booth is waiting.", talk: "I yell something. A tech tells me to be quiet. I stop. I'm in a wing.", push: "I'm not pushing a stage.", pickup: "I can't lift it. It's a stage." },
    { id: "a5_wexit", name: "stage entrance", r: [570, 150, 70, 104], z: 40, walk: [586, 236, "right"], look: "A gap in the curtains. Past it, the stage. Past that, the crowd. I'm trying not to think about the crowd.",
      exit: S => (ph(S) >= 2 && !S.f.a5_overrunDone) ? "Axl's still on. I'd step on his set. And probably his foot. Talk to Roz." : { room: "a5_mainstage", x: 110, y: 177, face: "right" } },
    { id: "a5_wdesk", name: "calling desk", r: [86, 112, 90, 110], z: 32, walk: [128, 238, "back"], look: S => ["Roz's calling desk: a monitor with the stage camera, a clock, cue lights and a radio. The big red clock says " + (S.f.a5_overrunDone ? "12:30, in green. Finally a clock on my side." : overrunOn(S) ? "11:52. It's seven minutes later than it should be." : deskTime(S) + ". Nobody's late yet. Give it time."), S.f.a5_overrunDone ? "Two lights: green for go, red for hold. Green's on. Roz looks almost relaxed." : overrunOn(S) ? "Two lights: green for go, red for hold. They're both red. They've been both red since 11:30." : "Two lights: green for go, red for hold. Both dark. Nothing is going yet."], pickup: "Roz would take my fingers. Politely.", use: "That's Roz's. It's all Roz's.", pull: "I'm not pulling the stage-manager cue. I'd start a war." },
    { id: "a5_wclock", name: "stage clock", r: [98, 118, 62, 28], z: 38, walk: [128, 238, "back"], look: S => S.f.a5_overrunDone ? "12:30. Green. Roz's clock and mine finally agree." : overrunOn(S) ? "11:52. The clock is red. It's the color of Roz's face." : "The stage clock says " + deskTime(S) + ". It agrees with my phone, which is rare." },
    { id: "a5_wstool", name: "stool", r: [522, 202, 38, 40], z: 33, walk: [506, 238, "right"], look: "A stool in the wings. The best seat in the house for people who need to sit. Lou will take it.", use: "It's for Lou. I'm not sitting on Lou's throne." },
    { id: "a5_wcases", name: "road cases", rects: [[28, 154, 26, 78]], z: 36, walk: [96, 240, "back"], look: "Black flight cases stenciled MON and DJ. Everything's black. If the world ended, it'd be on a road case.", pickup: "Crew-only." },
    { id: "a5_wcurtain", name: "masking curtain", rects: [[0, 0, 80, 150], [596, 0, 44, 200]], z: 12, walk: [92, 238, "back"], look: "A black wing curtain. They hide the mess and stage hands. Right now I'm one of them.", pull: "I tug the curtain. Roz clears her throat. I let go.", pickup: "Not pickable. Black cloth is eternal." },
    { id: "axl", name: "Axl Vanta", r: [348, 60, 70, 100], z: 15, vis: S => axlOn(S), walk: [400, 232, "back"], look: "Axl, in a sea of light, white tank, shades, arms up. He looks like the sun if the sun were a brand.", talk: "I shout. It disappears into the bass. He does a leap.", give: "I'm not handing him anything mid-leap." },
    { id: "a5_roz", name: "Roz", talk: S => rozWings(S), look: "Roz, in the dark, with a headset and a clipboard and a stare that says \"nine minutes ago.\"", give: "Roz: \"I'm busy.\"", pickup: "No.", push: "I'm not pushing Roz. She's got a radio.", use: S => rozWings(S) },
    { id: "lou", name: "Lou", talk: S => RP.lines(["@lou It's loud. It's... it's the loudest thing I've heard. Since 1993.", "Are you okay?", "@lou I'm fine. My ears haven't felt this alive in years. Don't tell your mother."]), look: "Lou, in the good navy cardigan, on a stool, watching a stage with his arms crossed like he's reviewing it. His foot's tapping. He pretends it isn't.", give: "Lou's not taking anything from me. He's got what he came for.", pickup: "Lou would flatten me.", use: "No." }
  ],
  combos: [
    ["a5_pass", "a5_roz", "Roz: \"I know who you are. I do not need your pass. I need your face on that stage.\""],
    ["phone", "a5_wdesk", "Roz: \"No calls. No texts. No Margo, unless it's life or death.\""]
  ],
  enter: async (S, from) => {
    if (ph(S) === 2 && !S.f.a5_overrunDone && S.f.a5_louArrived) { await overrun(S); return; }
    if (S.f.a5_phase === 0 || S.f.a5_phase === 1) {
      if (!S.f.a5_wingsSeen) { S.f.a5_wingsSeen = true; await RP.lines(["The wings, in daylight: gaffer tape, road cases, a stage so big I have to sit down. I don't. I stay standing.", "The stage is out there. I'll go check my gear."]); }
    }
  },
  self: { look: "A headliner in the dark, in a pink-lined coat. Nobody can see me. It's my best look.", talk: "I'm mouthing the words to something. I don't know what." }
});
})();
