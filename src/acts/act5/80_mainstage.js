/* Act 5 — a5_mainstage: the Harbor Lights main stage (scrolling, 960 wide), seen from the field.
   Two looks: the afternoon SOUNDCHECK (work lights, empty field, soundCheck mini-game) and the night SHOW (LED wall, beams, a sea of crowd).
   The headline set is a chain: playlistOrder -> crowdRead -> Lou comes on for "NYC 93" -> beatMatch finale -> Kosmo says your name right. */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u, PK = RP.PK, A5 = RP.a5, art = A5.art;
const { R, P, ell, line, poly, bayer, mulberry, mix, txt, txtC, txtW, clamp } = U;
const K = U.ramp;
const HL = (c, x, y, w, col) => R(c, x, y, w, 1, col), VL = (c, x, y, h, col) => R(c, x, y, 1, h, col);
const W = 960;
const show = S => (S.f.a5_phase || 0) >= 3;
const LED = { x: 270, y: 40, w: 420, h: 108 };
const BOOTH = { x: 360, y: 98, w: 240 };
const HOLES = [[84, 60, 66, 122], [818, 60, 66, 122], [94, 20, 20, 160], [846, 20, 20, 160], [150, 24, 56, 110], [756, 24, 56, 110]];

let ledFrames = null, ledKey = "";
function makeLedFrames(S) {
  const key = A5.pName(S);
  if (ledFrames && ledKey === key) return ledFrames;
  const pats = [["sunburst", 3, "name"], ["equalizer", 11, null], ["waves", 5, null], ["rings", 7, "name"], ["equalizer", 23, null], ["plasma", 9, "hl"]];
  ledFrames = pats.map(([pattern, seed, ov]) => {
    const cv = U.mk(LED.w + 4, LED.h + 4), cc = cv.getContext("2d");
    PK.ledWall(cc, 2, 2, LED.w, LED.h, { pattern, seed, palette: ["#ff3fa4", "#39d0ff", "#a05cff", "#ffd23f"] });
    if (ov === "name") {
      const nm = A5.pName(S).toUpperCase(), sc = txtW(nm, 4, 2) <= LED.w - 40 ? 4 : 3;
      R(cc, 2 + 20, 2 + 36, LED.w - 40, sc * 5 + 16, "#0c0818"); R(cc, 2 + 20, 2 + 36, LED.w - 40, 1, "#ff3fa4");
      txtC(cc, nm, 2 + LED.w / 2 + 1, 2 + 44, "#0c0818", sc, 2); txtC(cc, nm, 2 + LED.w / 2, 2 + 43, "#ffffff", sc, 2); R(cc, 2 + 20, 2 + 36 + sc * 5 + 15, LED.w - 40, 1, "#39d0ff");
    } else if (ov === "hl") {
      R(cc, 2 + 40, 2 + 38, LED.w - 80, 34, "#0c0818"); txtC(cc, "HARBOR LIGHTS", 2 + LED.w / 2, 2 + 44, "#ff3fa4", 3, 2); txtC(cc, "FESTIVAL", 2 + LED.w / 2, 2 + 62, "#39d0ff", 1, 3);
    }
    return cv;
  });
  ledKey = key;
  return ledFrames;
}

/* the booth is painted once into its own canvas, drawn as a depth-sorted sprite so the kid can stand behind it */
let boothCache = {};
function boothCanvas(S) {
  const key = A5.pName(S) + "|" + (S.gear && S.gear.mixer);
  if (boothCache[key]) return boothCache[key];
  const cv = U.mk(BOOTH.w + 10, 86), bc = cv.getContext("2d");
  const em = PK.djBooth(bc, 4, 4, BOOTH.w, { gear: "turntable", mixer: "rotary", lights: true, logo: A5.pName(S).slice(0, 14), model: "technics" }) || [];
  boothCache = {}; boothCache[key] = { cv, em: em.map(r => [r[0] - 4 + BOOTH.x, r[1] - 4 + BOOTH.y, r[2], r[3]]) };
  return boothCache[key];
}

function paint(c, S) {
  const em = [], sh = show(S), time = sh ? "night" : "day";
  em.push.apply(em, art.harbor(c, { x: 0, w: W, horizon: 124, skyH: 62, time, seed: sh ? 41 : 40, bottom: 150, bridge: { x: 20, w: 300, h: 36 }, spire: true,
    sun: sh ? undefined : { x: 780, y: 90, r: 9 }, clouds: sh ? false : 5, moon: sh ? { x: 840, y: 24, r: 7 } : false, holes: HOLES,
    lights: sh ? [{ x: 120, color: "#ffd27a", a: 0.6, w: 2 }, { x: 860, color: "#ff9ad5", a: 0.6, w: 2 }] : null }));
  /* the rig: two truss towers, the top truss with lamps, line arrays and ground stacks */
  art.trussV(c, 96, 24, 156, 14); art.trussV(c, 848, 24, 156, 14);
  const lamps = sh ? ["#ff3fa4", "#39d0ff", "#ffd23f", "#a05cff", "#5cff9a", "#ff3fa4", "#39d0ff", "#ffd23f", "#a05cff", "#5cff9a", "#ff3fa4", "#39d0ff", "#ffd23f", "#a05cff"] : ["#e8e4f0", "#e8e4f0", "#e8e4f0", "#e8e4f0", "#e8e4f0", "#e8e4f0", "#e8e4f0"];
  const tr = PK.truss(c, 92, 10, 776, 14, { lights: lamps });
  em.push.apply(em, tr);
  if (sh) tr.lights.forEach((l, i) => { if (i % 2 === 0) em.push.apply(em, PK.lightCone(c, l.x, l.y, 5, 90 + (i % 3) * 28, 120, l.color, { alpha: 0.4 })); });
  PK.truss(c, 92, 36, 776, 8, { color: "#7a788c" });
  art.lineArray(c, 152, 28, 9, 22, { ch: 11, curve: 0.7 }); art.lineArray(c, 786, 28, 9, 22, { ch: 11, curve: -0.7 });
  PK.speakerStack(c, 84, 66, 66, 112); PK.speakerStack(c, 810, 66, 66, 112);
  /* LED walls: the big one (animated in draw()) plus two side screens. The frame is painted here. */
  R(c, LED.x - 5, LED.y - 5, LED.w + 10, LED.h + 10, "#14121c"); HL(c, LED.x - 5, LED.y - 5, LED.w + 10, "#5a566c"); VL(c, LED.x - 5, LED.y - 5, LED.h + 10, "#3a364a");
  if (!sh) { const fr = makeLedFrames(S)[5]; c.drawImage(fr, LED.x - 2, LED.y - 2); }
  em.push([LED.x, LED.y, LED.w, LED.h]);
  [[206, "#ff3fa4"], [698, "#39d0ff"]].forEach(([sx, col]) => { R(c, sx - 3, 44, 62, 96, "#14121c"); HL(c, sx - 3, 44, 62, "#5a566c"); R(c, sx, 48, 56, 88, "#1a0c3a"); em.push([sx, 48, 56, 88]); });
  /* the deck */
  PK.stage(c, 76, 146, 808, 84, { seed: 5, wedges: false });
  [[190, "#e8e4f0"], [304, "#e8e4f0"], [650, "#e8e4f0"], [764, "#e8e4f0"]].forEach(([wx]) => art.wedge(c, wx, 172));
  /* the barricade, the pit */
  PK.barricade(c, 0, 202, W, { panel: 40, sign: false });
  em.push.apply(em, boothCanvas(S).em);
  if (sh) {
    em.push.apply(em, PK.crowdSilhouettes(c, 0, 214, W, 46, { seed: 12, rim: ["#ff3fa4", "#39d0ff", "#ffd23f"], rows: 3, density: 0.96 }));
  } else {
    /* an empty field, the afternoon after the rain: pavement, painted lines, cable runs */
    art.pavement(c, 0, 226, W, 30, { base: "#a09cb0", seed: 7 });
    for (let x = 0; x < W; x += 70) R(c, x, 240, 36, 2, "#e8d040");
    for (let i = 0; i < 700; i++) P(c, 120 + i, 236 + Math.round(Math.sin(i / 15) * 4), "#17131f");
    art.cableRamp(c, 420, 244, 60); art.litter(c, 20, 228, 900, 26, 18);
    /* work lights on the truss: bright white fixtures */
    [140, 280, 420, 560, 700, 800].forEach(wx => { R(c, wx, 22, 8, 4, "#fff6d0"); em.push([wx, 22, 8, 4]); });
  }
  return em;
}

/* ---- sprites and per-frame draws ------------------------------------------------------------------ */
function drawBooth(c, S) { const b = boothCanvas(S); c.drawImage(b.cv, BOOTH.x - 4, BOOTH.y - 4); }
function drawFloor(c, S) {
  /* flight cases and a monitor desk at the sides of the deck; Mo's talkback cable snakes away */
  art.roadCase(c, 130, 156, 30, 22, { label: "MON", wheels: true }); art.roadCase(c, 780, 156, 30, 22, { label: "MON", wheels: true });
}
function draw(c, S, t) {
  t = Math.max(0, t || 0); /* the first frame can arrive with t < 0 */
  const sh = show(S);
  if (sh) {
    const fr = makeLedFrames(S), reduced = RP.fx && RP.fx.reduced, idx = reduced ? 0 : Math.floor(t / 520) % fr.length;
    c.drawImage(fr[idx], LED.x - 2, LED.y - 2);
    /* the IMAG screens: a camera on the DJ */
    [[206, "#ff3fa4"], [698, "#39d0ff"]].forEach(([sx, col]) => {
      c.save(); c.beginPath(); c.rect(sx, 48, 56, 88); c.clip();
      const g = ["#2a1058", "#4a1a78", "#7a2a98"]; for (let i = 0; i < 3; i++) { c.fillStyle = g[i]; c.fillRect(sx, 48 + i * 30, 56, 30); }
      RP.chars.draw(c, { id: "kid", x: sx + 28, y: 48 + 104, face: "front", act: "dj", frame: Math.floor(t / 480) % 4, scale: 1.25, noShadow: true }, { lx: -0.2, rim: { color: col, side: 1 }, shadow: 0 });
      c.fillStyle = col; c.globalAlpha = 0.18; for (let y = 48; y < 136; y += 2) c.fillRect(sx, y, 56, 1); c.globalAlpha = 1;
      c.restore();
    });
    /* pyro: columns of flame at the lip of the stage during the climax */
    if (S.f.a5_pyro && !(RP.fx && RP.fx.reduced)) {
      const k = (t % 900) / 900;
      [[140, 176], [250, 176], [710, 176], [820, 176]].forEach(([fx, fy], j) => { const h = 6 + 40 * Math.sin(k * Math.PI) * (j % 2 ? 0.8 : 1); for (let y = 0; y < h; y++) { const w = Math.max(1, 6 - y * 0.12); R(c, fx - w, fy - y, w * 2, 1, y < h * 0.4 ? "#fff0a0" : y < h * 0.75 ? "#ffb02a" : "#ff6a2a"); } });
    }
  }
}

function lightMap(S) {
  if (show(S)) return { ambient: "#3a2c6e", lights: [
    { x: 480, y: 50, r: 520, color: "#ff3fa4", steps: 4, power: 0.7, rim: true }, { x: 300, y: 90, r: 300, color: "#39d0ff", steps: 4, power: 0.7, rim: true },
    { x: 660, y: 90, r: 300, color: "#a05cff", steps: 4, power: 0.7, rim: true }, { x: 480, y: 130, r: 360, color: "#ffd890", steps: 3, power: 0.5 }],
    halos: [{ x: 480, y: 20, r: 40, color: "#ffffff", strength: 0.6 }], rims: [{ x: 300, y: 80, r: 300, color: "#39d0ff" }, { x: 660, y: 80, r: 300, color: "#ff3fa4" }], key: { x: 480, y: 40 }, shadow: 0.6 };
  return { ambient: "#dcd0dc", lights: [{ x: 780, y: 40, r: 900, color: "#fff0d0", steps: 3, power: 0.45 }, { x: 480, y: 20, r: 400, color: "#ffffff", steps: 3, power: 0.4 }], key: { x: 780, y: 40 }, shadow: 0.5 };
}

/* ------------------------------------------------------------------------------------------------ scripts */
async function soundcheck(S) {
  if (S.f.a5_soundDone) { await RP.lines(["@a5_foh Done. Perfect. Don't touch anything. Seriously."]); return; }
  await RP.walkTo(480, 176, "back");
  RP.place("kid", 478, 166, "front");
  await RP.lines([
    "@a5_foh Okay, I'm Mo. Front of house. I'm three hundred feet behind you. Don't wave. I can see you.",
    "@a5_foh Four decks of faults on the sheet. Ground hum, a dead channel, feedback, and somebody patched a deck into the wrong input.",
    "@a5_foh Fix them. You have the sheet, the cables and one hand on the mixer. I'll be shouting suggestions. They're unhelpful."
  ]);
  const res = await A5.play("soundCheck", { faults: ["ground-hum", "dead-channel", "feedback", "wrong-input"], stage: "festival", difficulty: 3 }, { skipLabel: "Hand it to Mo" });
  S.f.a5_soundDone = true; S.f.a5_soundFixed = res.fixed != null ? res.fixed : (res.ok ? 4 : 2);
  const good = res.ok && !res.skipped;
  RP.sfx(good ? "success" : "buzz");
  RP.setClock("SAT 5:20 PM"); S.f.a5_phase = Math.max(S.f.a5_phase || 0, 1);
  if (good) await RP.lines(["@a5_foh ...That's clean. That's the cleanest check I've heard all weekend. I'm not smiling. It's a facial thing.", "@a5_foh You're good. The Taula goes to the mixer; the monitors are a dream. Go eat something. Doors at six."]);
  else await RP.lines(["@a5_foh It's... fine. There's a little hum on channel four. I'll hide it. Tonight we ride the faders.", "@a5_foh You're good enough. Go eat something. Doors at six."]);
  RP.relight();
  await RP.say("Doors at six. Axl at ten-fifteen. Me at eleven forty-five. Plenty of time to be quietly terrified.");
  RP.text("MARGO (MGR)", "Soundcheck: " + (good ? "great" : "ok") + ". Now: Axl wants your slot. Roz has the details. Backstage. Go.", true);
}

async function boothUse(S) {
  if (!show(S)) { await soundcheck(S); return; }
  if (S.f.a5_setDone) { await RP.say("The set's done. Mine. I played it. In front of all of them."); return; }
  await headlineSet(S);
}

async function headlineSet(S) {
  const nm = A5.pName(S);
  await RP.walkTo(480, 176, "back");
  RP.place("kid", 480, 166, "front"); RP.actor("kid").act = "dj";
  RP.setMusic && RP.setMusic(null);
  await RP.lines([
    "@a5_foh Levels are perfect. You're hot in the monitors. Whenever you want.",
    "A thousand faces in the dark, and one white label in my coat.",
    "Okay. Let's build a set."
  ]);
  /* 1. playlist.Order: build the arc */
  const pl = await A5.play("playlistOrder", { records: A5.SET_POOL.slice(), slots: 8, arc: "peak", difficulty: 3 }, { skipLabel: "Trust my gut" });
  const order = (pl.order && pl.order.length ? pl.order : A5.DEFAULT_ORDER).filter(id => RP.rec(id));
  S.f.a5_setPlaylist = pl.score != null ? pl.score : 70;
  await RP.lines([
    pl.score >= 75 ? "The arc is there. Slow burn, a climb, a peak around the middle. It looks right on paper." : "The order's a little wonky. I'll make it up on the fly. That's what the crowd's for.",
    "@a5_foh (talkback) Nice. Start, whenever."
  ]);
  /* 2. crowd.Read: play the room */
  RP.audio && RP.audio.loop && RP.setMusic && RP.setMusic({ genre: "house", bpm: 122, volume: 0.32 });
  const cr = await A5.play("crowdRead", { records: order.slice(), crowd: "festival", rounds: 5, goal: 4, difficulty: 3, venue: "HARBOR LIGHTS" }, { skipLabel: "Ride it out" });
  S.f.a5_setCrowd = cr.score != null ? cr.score : 70;
  S.f.a5_pyro = true; RP.flash("#ffffff", 220); RP.sfx("cheer");
  await RP.lines([
    cr.ok && !cr.skipped ? "The field's moving like one animal. The whole crowd's one big pulse. This is it. This is the thing." : "It wasn't perfect. The crowd's a patient animal, and they forgave me. Mostly.",
    "@a5_crowd (roaring) " + nm + "! " + nm + "! " + nm + "!",
    "They know my name. They actually know my name."
  ]);
  /* 3. the moment: Lou comes on */
  await RP.lines([
    "Okay, Harbor Lights. One more. This one's not mine.",
    "I need somebody from the wings."
  ]);
  const lou = RP.actor("lou");
  lou.vis = () => true; RP.place("lou", 110, 176, "right");
  RP.chars.update("lou", { top: { style: "cardigan", color: "#2a3a6a", color2: "#efe6d0" } });
  S.f.a5_louOnStage = true;
  await RP.npcWalk("lou", 430, 177, "right");
  await RP.lines([
    "@lou ...It's a lot of people.",
    "It's a lot of people, Lou. They came to hear your song.",
    "@lou It's not a song. It's a bar of music I put in a drawer in 1993.",
    "It's NYC 93. You gave it to me through a hole in the wall.",
    "@lou ...I'd go out every Saturday, 1993. I'd stand at the back of a club and I'd think: somebody should put this on a record.",
    "Somebody did. Hold the sleeve, Lou.",
    "@lou Turn it up. No. Louder. ...A little louder than that."
  ]);
  RP.sfx("cheer");
  RP.addRecord("white_nyc93", true);
  /* 4. beat.Match finale: NYC 93 into "Finally" */
  const bm = await A5.play("beatMatch", { a: "white_nyc93", b: "cece_peniston_finally", difficulty: 3, story: true }, { skipLabel: "Hit the mix and pray" });
  S.f.a5_setFinale = bm.score != null ? bm.score : 70;
  S.f.a5_confetti = true; RP.flash("#ffffff", 300); RP.sfx("cheer"); RP.shake(250);
  await RP.lines([
    bm.ok && !bm.skipped ? "The blend lands. Lou's record goes into CeCe Peniston's \"Finally\" like they'd been waiting thirty years to meet." : "The blend wobbles, then holds. Lou's record rides into \"Finally\". It's a little rough. It's perfect.",
    "@a5_crowd (roaring, in pieces, forever)",
    "@lou ...I can hear every note. I can hear my whole song.",
    "@lou Kid. Thank you."
  ]);
  if (S.f.a5_whiskersShout) await RP.lines(["And Mr. Whiskers: this one's for you. Slow blink, buddy.", "(Somewhere in the crowd, a bubble carrier is lifted over the barricade. Mr. Whiskers blinks. Slowly.)"]);
  await RP.lines(["Thank you, Harbor Lights. I'm " + nm + ". I started in a bedroom. I'm still in a bedroom. It just got a lot of people."]);
  /* 5. Kosmo, finally */
  const kos = RP.actor("kosmo");
  kos.vis = () => true; RP.place("kosmo", 860, 176, "left");
  await RP.npcWalk("kosmo", 560, 177, "left");
  await RP.lines([
    "@kosmo ...Kid.",
    "@kosmo No. I've been doing that for years. ...",
    "@kosmo " + nm + ".",
    "Kosmo. You know my name.",
    "@kosmo I always knew it. The wrong names were a bit. A bit I committed to.",
    "@kosmo That was a good set, " + nm + ". Don't let anyone tell you the \"NYC 93\" blend was luck.",
    "@kosmo It was a little luck. But mostly it was a record you kept."
  ]);
  S.f.a5_kosmoName = true; S.f.a5_setDone = true; S.f.a5_phase = 5;
  RP.followers(25000);
  RP.setClock("SUN 1:40 AM");
  await RP.fadeTo(1, 1400);
  await RP.goto("a5_pier", 90, 236, "right");
}

async function lookStage(S) {
  if (!show(S)) return "The main stage. Truss, LED, a booth. Two giant stacks of speakers, a sea of empty field. And in four hours, a lot of people.";
  return "The main stage, lit up like a spaceship that has decided to love you. Beams, an LED wall, my name on a screen. I'm trying not to look at the crowd.";
}

/* ------------------------------------------------------------------------------------------------ room */
RP.room({
  id: "a5_mainstage", act: 5, name: "Harbor Lights — Main Stage", width: W,
  paint, cacheKey: S => (show(S) ? "s" : "c") + A5.pName(S), draw, light: lightMap, lightKey: S => (show(S) ? "s" : "c"),
  ambience: S => (show(S) ? "crowd" : "festival"),
  music: S => (show(S) ? { genre: "house", bpm: 122, volume: 0.28, filter: ["lowpass", 1800] } : null),
  walk: [[100, 173], [860, 173], [860, 181], [100, 181]],
  start: { x: 110, y: 177, face: "right" },
  fx: [
    { type: "beams", origins: [[180, 38], [330, 38], [480, 38], [630, 38], [780, 38]], colors: ["#ff3fa4", "#39d0ff", "#ffd23f", "#a05cff", "#5cff9a"], base: Math.PI / 2, swing: 0.7, len: 240, width: 16, alpha: 0.18, period: 1100, on: () => show(RP.state) },
    { type: "haze", rect: [300, 140, 360, 34], color: "#b8a8ff", density: 3, on: () => show(RP.state) },
    { type: "strobe", period: 3200, flash: 60, alpha: 0.18, on: () => show(RP.state) && !!RP.state.f.a5_pyro },
    { type: "confetti", count: 90, width: 960, floor: 250, colors: ["#ff3fa4", "#39d0ff", "#ffd23f", "#9be15d", "#ffffff"], on: () => !!RP.state.f.a5_confetti }
  ],
  actors: S => [
    { id: "a5_tech1", char: "a5_tech1", x: 210, y: 177, face: "right", act: "stand", name: "Stagehand", vis: S2 => !show(S2) },
    { id: "a5_tech2", char: "a5_tech2", x: 740, y: 176, face: "left", act: "stand", name: "Stagehand", vis: S2 => !show(S2) },
    { id: "lou", char: "lou", x: 110, y: 176, face: "right", act: "stand", name: "Lou", vis: S2 => !!S2.f.a5_louOnStage && !S2.f.a5_setDone },
    { id: "kosmo", char: "kosmo", x: 860, y: 176, face: "left", act: "stand", name: "Kosmo Delacroix", vis: S2 => !!S2.f.a5_kosmoName && !S2.f.a5_setDone },
    { crowd: { n: 12, rect: [30, 236, 900, 14], seed: 91, face: "back", act: "dance", scale: 0.5, vis: S2 => show(S2) } },
    { id: "a5_mmarcus", char: "marcus", x: 330, y: 246, face: "back", act: "dance", scale: 0.55, name: "Marcus", clickable: false, vis: S2 => show(S2) },
    { id: "a5_mjess", char: "jess", x: 400, y: 248, face: "back", act: "dance", scale: 0.55, name: "Jess", clickable: false, vis: S2 => show(S2) },
    { id: "a5_mray", char: "ray", x: 560, y: 247, face: "back", act: "stand", scale: 0.55, name: "Ray", clickable: false, vis: S2 => show(S2) },
    { id: "a5_mtwinkie", char: "twinkie", x: 610, y: 249, face: "back", act: "dance", scale: 0.55, name: "Twinkie", clickable: false, vis: S2 => show(S2) },
    { id: "a5_meddie", char: "eddie", x: 690, y: 247, face: "back", act: "dance", scale: 0.55, name: "Eddie", clickable: false, vis: S2 => show(S2) }
  ],
  sprites: [
    { y: 172, draw: (c, S) => drawBooth(c, S) },
    { y: 160, draw: art.sprite((c, S) => drawFloor(c, S)) },
    { y: 252, vis: S => show(S), draw: (c, S) => { /* Marcus's sign: PLUS 30, held over the crowd */ R(c, 316, 214, 26, 14, "#c8925a"); R(c, 316, 214, 26, 1, "#e0b078"); txt(c, "+30", 321, 218, "#17131f", 1, 1); R(c, 328, 228, 2, 10, "#8a6a4a"); } }
  ],
  hotspots: [
    { id: "a5_mwings", name: "stage left", r: [60, 112, 44, 76], z: 28, walk: [108, 177, "left"], look: "Stage left, the wing. Roz in the dark, a headset and a clipboard. The best place to be nervous.", exit: S => (show(S) && !S.f.a5_setDone && S.f.a5_phase >= 3) ? "Not now. They're waiting for me. A thousand people don't like it when you leave." : { room: "a5_wings", x: 580, y: 236, face: "left" } },
    { id: "a5_mbooth", name: "DJ booth", r: [356, 92, 248, 84], z: 40, walk: [480, 176, "back"], noWalk: false,
      look: S => ["My booth: two Technics SL-1210MK7s on the sides and a Can Electric Taula 4 MR in the middle. The festival put a scrim on the front with my name. Spelled right, finally.", show(S) ? "A thousand people are waiting for the first note. I'm waiting for permission from my knees." : "The booth is waiting for a soundcheck."],
      use: S => boothUse(S), open: S => boothUse(S), pickup: "It's bolted to a stage. The stage is bolted to a harbor.", push: "Don't push the booth. It's a mood.", talk: "\"Hi, booth.\" It's very polite. Mostly it hums." },
    { id: "a5_mled", name: "LED wall", r: [270, 40, 420, 108], z: 18, walk: [480, 178, "back"], look: S => show(S) ? "A forty-foot LED wall that spells my name. In pink. It's the most flattering my name has ever looked." : "The LED wall in idle: HARBOR LIGHTS, in a screensaver font. It looks like the world's biggest Windows 95.", pickup: "It's a wall. It's got more pixels than my whole career.", talk: "\"You're beautiful.\" It flashes. It's not talking to me." },
    { id: "a5_mimag", name: "side screens", rects: [[204, 44, 62, 96], [696, 44, 62, 96]], z: 20, walk: [480, 178, "back"], look: S => show(S) ? "IMAG screens: a camera feed of me, enormous, in a pink-lined coat, looking like someone who's never been this afraid." : "Two side screens, off. I stare at my reflection. It's a dark screen. It's honest." },
    { id: "a5_mrig", name: "truss and lights", r: [90, 6, 780, 44], z: 14, walk: [300, 178, "back"], look: S => show(S) ? "A rig of lamps on a mile of truss, sweeping the crowd in pink, cyan and gold. I used to be afraid of the dark. Now I'm afraid of the light." : "The rig is in work-light mode: plain white bulbs on the truss. Somebody's changing a bulb with a pole. Not a bad job.", pickup: "Truss. Steel. Safety-pinned by a guy named Gordo.", push: "I push the truss. It's still. It is a better listener than me." },
    { id: "a5_mstacks", name: "speaker stacks", rects: [[82, 62, 70, 120], [808, 62, 70, 120]], z: 24, walk: [160, 178, "back"], look: "Two stacks of subs and tops twice my height. When these go, I'll feel it in my fillings. I can't wait. I'm so scared.", push: "They weigh more than my first apartment.", pickup: "I'd need three Gordos and a crane.", use: "It's the PA. It's Mo's. Don't touch Mo's PA." },
    { id: "a5_marrays", name: "line arrays", rects: [[150, 24, 56, 116], [756, 24, 56, 116]], z: 22, walk: [200, 178, "back"], look: "A line array: a curved column of speakers hanging from the truss like a metal waterfall. They aim the sound at the crowd's faces. The crowd won't mind." },
    { id: "a5_mwedge", name: "monitor wedges", rects: [[186, 170, 28, 12], [300, 170, 28, 12], [646, 170, 28, 12], [760, 170, 28, 12]], z: 26, walk: [250, 178, "back"], look: "Stage monitors: wedges that point at me so I can hear myself. Which, at the moment, is a mixed blessing.", pickup: "They're taped to the deck, and the tape is stronger than my arm." },
    { id: "a5_mcases", name: "road cases", rects: [[128, 154, 34, 26], [778, 154, 34, 26]], z: 28, walk: [160, 178, "back"], look: "Flight cases labeled MON. They hold monitors, cable and probably a sandwich. Every road case has a sandwich in it somewhere.", pickup: "Crew only." },
    { id: "a5_mbarricade", name: "barricade", r: [0, 200, 960, 26], z: 8, walk: [480, 180, "back"], look: S => show(S) ? "The barricade. Beyond it, the crowd. Raised hands, phones, glow sticks and a sign that says +30. Marcus found a way." : "A steel barricade across the whole front of the stage. In a few hours, a very large number of people will lean on it.", push: "I'm not pushing a barricade. That's what the crowd's for.", pickup: "No. It's not that kind of stage." },
    { id: "a5_mcrowd", name: "the crowd", r: [0, 214, 960, 42], z: 6, vis: S => show(S), walk: [480, 180, "back"], look: "A sea of people: heads, phones, raised hands, one cardboard sign that says +30. Thousands of them. Every one of them came to listen.", talk: "\"Hello, Brooklyn!\" is not for me. I'm in the sound; I'm not that person. I just raise a hand. They roar. That's enough." },
    { id: "a5_mfield", name: "the field", r: [0, 214, 960, 42], z: 6, vis: S => !show(S), walk: [480, 180, "back"], look: "An empty field, a long pavement, a line of barricades and a few cones. It's weird to see a place be this empty when it's about to be this full." },
    { id: "a5_mwater", name: "the harbor", r: [0, 60, 960, 66], z: 12, walk: [480, 180, "back"], look: S => show(S) ? "The harbor and the skyline behind the rig, from the stage. Ferries drift by with their lights on, like they're checking in." : "The harbor over the lip of the stage: a bridge, a ferry and the skyline. Someone's clearly picked the best seat in town for the sound guy.", talk: "I give the harbor a nod. A ferry honks. Is that a review?" },
    { id: "a5_tech1", name: "stagehand", talk: S => RP.lines(["@a5_tech1 Don't step on the tape. The tape knows.", "What does the tape know?", "@a5_tech1 Where everything goes. Including you."]), look: "A stagehand with a headset and a roll of gaffer tape, constantly adding more. If there's a heaven, it's made of gaffer.", give: "\"Not now. I'm busy being invisible.\"", pickup: "No." },
    { id: "a5_tech2", name: "stagehand", talk: S => RP.lines(["@a5_tech2 Mo's yelling. Don't listen to Mo. Listen to the sound.", "Is the sound yelling?", "@a5_tech2 Not yet. That's your job."]), look: "A stagehand in a black cap, checking a line. They're the ones who make the magic and never get thanked.", give: "No.", pickup: "No." },
    { id: "lou", name: "Lou", talk: S => RP.lines(["@lou Don't look at me. Look at the people. They're looking at you.", "I'm looking at you, Lou.", "@lou Don't."]), look: "Lou, in the good navy cardigan, on the biggest stage in Brooklyn, with the expression of a man who is going to complain about this for twenty years, with joy.", give: "He's holding the sleeve. Don't mess with that.", pickup: "Absolutely not." },
    { id: "kosmo", name: "Kosmo Delacroix", talk: S => RP.say("Say it again.", "kosmo"), look: "Kosmo Delacroix, coat and shades, walking onto the stage like it's a hotel lobby. The only man who could make me feel eight and eighty.", give: "I give nothing to Kosmo. He's in the middle of my favorite moment.", pickup: "I'm not carrying a legend." }
  ],
  combos: [
    ["a5_pass", "a5_mbooth", "My pass is for people who can't get in. I'm in."],
    ["a5_marker", "a5_mbooth", "I could write something on the scrim. Whit would call it \"a brand moment.\" I leave it clean."],
    ["phone", "a5_mbooth", "No phone while I'm playing. Margo would murder me and then invoice the murder."]
  ],
  enter: async (S, from) => {
    if (show(S)) {
      if (!S.f.a5_showIntro) {
        S.f.a5_showIntro = true;
        const nm = A5.pName(S);
        RP.sfx("cheer");
        await RP.lines([
          "@a5_pa Ladies and gentlemen, Harbor Lights, the headliner of the night, from Bushwick, Brooklyn: DJ " + A5.mangle(nm).replace(/^DJ /, "") + "!",
          "@a5_crowd (roaring) " + nm + "! " + nm + "! " + nm + "!",
          "@a5_pa ...Or, I'm told, " + nm + ". Sorry. Brian printed it.",
          "A thousand faces. A field of them. My knees are doing a jig.",
          "(Walk to the booth. Use the decks.)"
        ]);
      }
      return;
    }
    if (!S.f.a5_mainSeen) {
      S.f.a5_mainSeen = true;
      await RP.lines([
        "@a5_foh (talkback) Check, check. Is this on? It's on. Hi.",
        "The main stage. In daylight, without the crowd. The biggest thing I've ever stood on. It looks like a spaceship someone parked on a pier.",
        "(Soundcheck is at the booth. Click the decks.)"
      ]);
    }
  },
  self: { look: "A DJ in a pink-lined coat on the biggest stage in New York. Slightly smaller than the stage.", talk: "I'm talking to myself, in front of a stage. That's what stages are for." }
});
})();
