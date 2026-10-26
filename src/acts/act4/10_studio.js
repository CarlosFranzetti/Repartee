/* Act 4 — a4_studio: apartment 4C, upgraded. Technics MK7s, BM5 monitors, a sampler, Lou on the couch.
   Threads: email (laptop) -> Ray's box + passport (Gerald) -> Lou (pipe hole) -> sample (white label on the deck)
   -> mak.Tracks (sampler) -> emotional play -> cover photo (phone + hole) -> release (laptop) -> get.Followers
   -> promoter.Talk (Ingrid on video) -> pack the bag -> leave for JFK.
   Flags: a4_email a4_rayBox a4_passport a4_louCalled a4_louIn a4_louTold a4_louOK a4_sampled a4_track a4_trackScore
          a4_photo a4_released a4_viral a4_deal a4_dealScore a4_fee a4_packed a4_dim */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u, PK = RP.PK, A4 = RP.a4;
const { R, P, ell, txt, bayer, mulberry, mk } = U;
const W = 640;

/* ------------------------------------------------------------------ cached sprites */
const spr = (w, h, fn) => { let cv = null; return (c, x, y) => { if (!cv) { cv = mk(w, h); fn(cv.getContext("2d")); } c.drawImage(cv, Math.round(x), Math.round(y)); }; };
const sprBox = spr(30, 22, c => PK.cardboardBox(c, 1, 2, 28, 19, { color: "#c8925a" }));
const sprRayBox = spr(34, 26, c => { PK.cardboardBox(c, 2, 4, 30, 21, { color: "#c8925a" }); R(c, 8, 9, 18, 8, "#efe6d0"); txt(c, "BERLIN", 9, 11, "#c0302c"); R(c, 4, 18, 26, 1, "#a8743e"); });
const sprBag = spr(36, 30, c => {
  R(c, 4, 8, 28, 20, "#1c1a24"); R(c, 4, 8, 28, 2, "#4a4868"); R(c, 4, 26, 28, 2, "#0a080e"); R(c, 4, 8, 2, 20, "#55516a"); R(c, 30, 8, 2, 20, "#55516a");
  R(c, 10, 3, 3, 6, "#55516a"); R(c, 23, 3, 3, 6, "#55516a"); R(c, 10, 2, 16, 2, "#8a86a0");
  ell(c, 11, 17, 3, 3, "#ff3fa4"); ell(c, 10, 16, 1, 1, "#ffb0dc"); R(c, 17, 13, 9, 5, "#39d0ff"); R(c, 17, 13, 9, 1, "#9fe8ff"); R(c, 15, 20, 7, 3, "#ffd23f"); P(c, 27, 24, "#9be15d"); R(c, 6, 22, 4, 2, "#efeaf6");
  R(c, 4, 20, 28, 1, "#2a2838");
});
const sprGerald = spr(54, 52, c => PK.plant(c, 2, 2, { size: 2, seed: 4 }));
const sprChair = spr(26, 46, c => PK.chair(c, 2, 2, { kind: "office", color: "#2a2838" }));
const sprPizza = spr(46, 18, c => PK.pizzaBox(c, 2, 2, {}));

/* ------------------------------------------------------------------ state helpers */
let playing = false, platterAng = 0;
const dim = S => !!S.f.a4_dim;

/* ------------------------------------------------------------------ painting */
function foam(c, x, y, w, h, tone) {
  const base = tone || "#3a2e50", k = U.ramp(base);
  R(c, x, y, w, h, k[1]);
  for (let yy = 0; yy < h; yy += 4) for (let xx = 0; xx < w; xx += 4) {
    const a = ((xx / 4 + yy / 4) & 1) === 0;
    R(c, x + xx, y + yy, 4, 4, a ? k[2] : k[1]); P(c, x + xx, y + yy, k[3]); R(c, x + xx + 1, y + yy + 1, 2, 2, a ? k[3] : k[2]); P(c, x + xx + 3, y + yy + 3, k[0]);
  }
  R(c, x - 1, y - 1, w + 2, 1, k[4]); R(c, x - 1, y + h, w + 2, 1, k[0]); R(c, x - 1, y - 1, 1, h + 2, k[3]); R(c, x + w, y - 1, 1, h + 2, k[0]);
}
function fairyLights(c, em) {
  const pts = [];
  for (let seg = 0; seg < 4; seg++) { const x0 = 4 + seg * 52, x1 = x0 + 52; for (let x = x0; x <= x1; x++) { const t = (x - x0) / 52, y = 8 + Math.round(Math.sin(t * Math.PI) * 9); P(c, x, y, "#1a1220"); }
    for (let i = 1; i < 6; i++) { const t = i / 6, x = x0 + Math.round(t * 52), y = 8 + Math.round(Math.sin(t * Math.PI) * 9); pts.push([x, y + 2, ["#ffd890", "#ff9ad5", "#9fe8ff", "#ffd890"][i % 4]]); } }
  pts.forEach(([x, y, col]) => { R(c, x - 1, y - 1, 3, 3, col); P(c, x, y - 1, "#ffffff"); em.push([x - 1, y - 1, 3, 3]); PK.glow(c, x, y, 5, col, { strength: 0.6 }); });
}
function paintSampler(c, x, y) {
  R(c, x, y, 46, 18, "#2a2834"); R(c, x, y, 46, 1, "#6a667c"); R(c, x, y, 1, 18, "#4a4658"); R(c, x + 45, y, 1, 18, "#100e16"); R(c, x, y + 17, 46, 1, "#100e16");
  R(c, x + 3, y + 3, 15, 7, "#0a1e2a"); R(c, x + 4, y + 4, 9, 1, "#39d0ff"); R(c, x + 4, y + 6, 11, 1, "#39a8ff"); R(c, x + 4, y + 8, 5, 1, "#ff9a3f");
  for (let r = 0; r < 3; r++) for (let q = 0; q < 4; q++) { const on = (r * 4 + q) % 5 === 1; R(c, x + 21 + q * 6, y + 3 + r * 5, 5, 4, on ? ["#ff3fa4", "#39d0ff", "#ffd23f"][q % 3] : "#4a4660"); R(c, x + 21 + q * 6, y + 3 + r * 5, 5, 1, on ? "#ffffff66" : "#6a667c"); }
  for (let k = 0; k < 3; k++) { ell(c, x + 6 + k * 5, y + 14, 1, 1, "#9a96b0"); }
}
const emRects = []; // emissive rects collected by paint(), re-created each paint

function paint(c, S) {
  const em = []; const E = a => { if (a && a.length) for (const r of a) em.push(r); return a; };
  const released = !!S.f.a4_released;
  PK.plaster(c, 0, 0, W, 166, { base: "#76658f", seed: 17, patches: 2, stains: 1, cracks: 1 });
  // acoustic panels behind the DJ desk and a pair over the window side
  foam(c, 348, 22, 44, 46, "#3a2e50"); foam(c, 396, 22, 44, 46, "#4a3060"); foam(c, 552, 22, 40, 46, "#3a2e50");
  foam(c, 348, 72, 44, 14, "#4a3060");
  PK.baseboard(c, 0, 163, W);
  PK.planks(c, 0, 172, W, 84, { base: "#86563a", seed: 5 });
  PK.rug(c, 176, 214, 300, 36, { colors: ["#2e4a5a", "#e0a040", "#c0502c"] });
  // left wall: record shelf, couch, poster, framed IOU
  PK.shelf(c, 14, 18, 132, 78, { items: "records", seed: 3 });
  PK.couch(c, 12, 112, 138, { color: "#7a3fb0", h: 56 });
  PK.poster(c, 158, 24, 40, 56, { title: "HALCYON", titleLines: ["HALCYON", "ROOM"], lines: ["THURSDAYS"], palette: "neon", seed: 31 });
  R(c, 152, 88, 46, 32, "#6a4a30"); R(c, 152, 88, 46, 1, "#9a7050"); R(c, 152, 119, 46, 1, "#3a2418"); R(c, 154, 90, 42, 28, "#efe6d0");
  txt(c, "I.O.U.", 162, 93, "#2a2030"); txt(c, "NEXT WEEK", 156, 102, "#c0302c"); txt(c, "- DANTE", 162, 110, "#55516a"); R(c, 173, 87, 2, 2, "#c8c0b0");
  // fairy lights
  fairyLights(c, em);
  // window (dusk over Bushwick) + radiator + the pipe hole
  E(PK.window(c, 206, 26, 120, 92, { view: "city", time: "dusk", seed: 4, frame: "#d8d0e6" }));
  PK.radiator(c, 218, 134, 80, 32);
  PK.pipe(c, 334, 100, 64, { dir: "v", r: 3 });
  ell(c, 336, 146, 8, 6, "#5e4a5e"); ell(c, 336, 146, 6, 5, "#c0bccc"); ell(c, 336, 146, 5, 4, "#140c18"); P(c, 331, 141, "#fff2d0"); P(c, 341, 150, "#3a2e3a");
  [[329, 139], [343, 141], [331, 151], [341, 152], [337, 138]].forEach(([x, y]) => P(c, x, y, "#5e4a5e"));
  // production desk under the window
  PK.desk(c, 206, 142, 122, 52, { wood: "#6a4a38" });
  E(PK.laptop(c, 212, 120, { on: true, seed: 3 }));
  paintSampler(c, 250, 124);
  E(PK.lamp(c, 306, 108, { kind: "desk", on: true }));
  // DJ desk with the pair of Technics, DJM-350 and BM5s
  PK.desk(c, 346, 140, 242, 58, { wood: "#5a3a30" });
  PK.crate(c, 372, 160, { color: "#2f62b8" });
  PK.monitors(c, 348, 96, { pair: true, gap: 214 });
  E(PK.turntable(c, 376, 109, { model: "technics", label: "#e0368f" }));
  E(PK.mixer(c, 448, 110, { channels: 2 }));
  E(PK.turntable(c, 490, 109, { model: "technics", label: "#39d0ff", record: false }));
  // label board / neon
  if (released) {
    E(PK.neon(c, "PIPE HOLE", 416, 30, "#ff3fa4", { scale: 2, tube: 2 }));
    E(PK.neon(c, "RECORDS", 432, 50, "#39d0ff", { scale: 1, tube: 1 }));
    ell(c, 402, 36, 7, 7, "#ff3fa4"); ell(c, 402, 36, 5, 5, "#140c18"); ell(c, 402, 36, 2, 2, "#ff3fa4"); em.push([394, 28, 17, 17]);
  } else {
    R(c, 408, 32, 60, 32, "#efe6d0"); R(c, 408, 32, 60, 1, "#fff8e8"); R(c, 408, 63, 60, 1, "#c8c0b0"); R(c, 436, 30, 4, 3, "#c8c0b0");
    txt(c, "LABEL NAME?", 411, 36, "#2a2030"); txt(c, "WALL MUSIC (NO)", 411, 44, "#8a6a8a"); txt(c, "LOU & ME (NO)", 411, 51, "#8a6a8a"); txt(c, "HOLE (YES?)", 411, 58, "#c0302c");
  }
  // door
  PK.door(c, 600, 38, 38, 128, { color: "#4a3a5a", number: "4C", panels: 4, seed: 6 });
  R(c, 600, 163, 38, 3, "#ffcf7a"); em.push([600, 163, 38, 3]);
  emRects.length = 0; em.forEach(r => emRects.push(r));
  return em;
}

/* per-frame details: screens, spinning label, the TV through the pipe hole */
function draw(c, S, t) {
  const bl = Math.floor(t / 420) % 2;
  R(c, 215, 123, 20, 12, "#0a1a2e"); R(c, 217, 125, 11, 1, "#39d0ff"); R(c, 217, 127, 15, 1, "#6a8ad8"); R(c, 217, 129, 7, 1, bl ? "#ff3fa4" : "#7a1a4a");
  if (S.f.a4_released) R(c, 226, 131, 6, 2, "#3fd07a");
  if (playing) {
    for (let i = 0; i < 12; i++) { const h = 2 + Math.round((Math.sin(t / 90 + i * 1.3) * 0.5 + 0.5) * 7); R(c, 217 + i, 134 - h, 1, h, i < 8 ? "#39d0ff" : "#ff3fa4"); }
    [361, 575].forEach(mx => { ell(c, mx, 125, 5 + (Math.floor(t / 110) % 2), 5 + (Math.floor(t / 110) % 2), "#34303f"); ell(c, mx, 125, 3, 3, "#14121a"); });
    platterAng = t / 180;
    const tx = 376 + 26, ty = 109 + 15;
    P(c, tx + Math.cos(platterAng) * 17, ty + Math.sin(platterAng) * 8, "#ffffff"); P(c, tx + Math.cos(platterAng + 3.14) * 17, ty + Math.sin(platterAng + 3.14) * 8, "#ffffff");
  }
  // Lou's TV, seen through the hole when he's home next door
  if (!S.f.a4_louIn) { const f = Math.floor(Math.max(0, t) / 600) % 3; P(c, 334, 145, ["#6a8ad8", "#ffd27a", "#39d0ff"][f]); P(c, 337, 147, ["#ffd27a", "#6a8ad8", "#ff9ad5"][f]); }
}

function light(S) {
  const d = dim(S), rel = !!S.f.a4_released;
  const L = { ambient: d ? "#4a3e6a" : "#8f7cae", lights: [], halos: [], rims: [], shadow: 0.6 };
  L.lights.push({ box: [206, 26, 120, 92], r: d ? 60 : 250, color: "#ffb070", steps: 4, sy: 1.1, power: d ? 0.5 : 1 });
  L.lights.push({ x: 306, y: 112, r: d ? 60 : 120, color: "#ffe6b8", steps: 4, sy: 1.1, power: d ? 0.5 : 0.95 });
  L.lights.push({ x: 470, y: 150, r: 190, color: d ? "#e040b0" : "#a050c8", steps: 3, sy: 1.5, power: d ? 0.9 : 0.5, rim: true });
  L.lights.push({ x: 80, y: 40, r: 130, color: "#ffcf90", steps: 3, power: d ? 0.35 : 0.5 });
  L.lights.push({ x: 614, y: 164, r: 46, color: "#ffcf7a", steps: 2, power: 0.6 });
  if (rel) L.lights.push({ x: 440, y: 44, r: 170, color: "#ff3fa4", steps: 3, power: d ? 0.9 : 0.55, rim: true });
  L.halos.push({ x: 306, y: 108, r: 20, color: "#ffc070", strength: 1 });
  L.rims.push({ x: 330, y: 90, r: 220, color: d ? "#ff3fa4" : "#ffb070" });
  L.key = { x: 266, y: 60 };
  return L;
}

/* ------------------------------------------------------------------ scenes */
const REPLY = S => ["Hi " + A4.dj(S) + ",", "Ingrid Falk again, Halle Neun. In the spring I said I would be in touch. This is me, in touch. In Berlin, six months is prompt.",
  "The offer: Saturday, two a.m., the main room, after our headliner. I won't say who. You would only get nervous.",
  "One problem: nobody books a DJ who has nothing out. Do you have a release?", "P.S. Bring your passport. You would be amazed how many don't.", "Grüße, Ingrid Falk, Nachtwerk Booking"];

async function readEmail(S) {
  await RP.card({ kicker: "EMAIL", title: "Re: Halle Neun", sub: "From: Ingrid Falk, Nachtwerk Booking (Berlin)", body: REPLY(S), button: "CLOSE" });
  if (S.f.a4_email) return;
  S.f.a4_email = true;
  RP.text("INGRID FALK", "Take your time. I'll wait. I'm German; waiting is a hobby.", true);
  await RP.lines([
    "Berlin. She said she'd be in touch, and then she was. Nobody in this business does that.",
    "She wants a release. I have a stack of other people's records and a drawer full of half-finished loops.",
    "...And a white label that sounds like 1993. Lou. I need to ask Lou."
  ]);
}

async function louPipe(S) {
  if (S.f.a4_louIn) return "Lou's in the room. The hole is just a hole again.";
  if (!S.f.a4_email) {
    await RP.say("Lou? You up?");
    await RP.lines(["@a4_pipe I'm watching my program. It's the one with the judge.", "@a4_pipe Whatever you're about to say, say it quieter.", "I'll come back when I have something to say."]);
    return;
  }
  if (!S.f.a4_louCalled) {
    S.f.a4_louCalled = true;
    await RP.say("Lou? It's me. I need to ask you something about NYC 93.");
    await RP.lines(["@a4_pipe ...", "@a4_pipe It's a good record. What about it?",
      "A booking agent in Berlin wants a release. I want to remix NYC 93. With you. And put it out.",
      "@a4_pipe ...", "@a4_pipe Give me five minutes. I need a better cardigan."]);
    await RP.fadeTo(1, 500);
    RP.place("a4_lou", 606, 230, "left");
    S.f.a4_louIn = true;
    RP.setClock("THU 4:44 PM");
    await RP.say("Five minutes later.", "nar");
    await RP.fadeTo(0, 500);
    await RP.say("*knock knock*", "nar");
    await RP.say("Lou. The door has a doorbell.", "kid");
    await RP.npcWalk("a4_lou", 410, 232, "left");
    await RP.npcWalk("a4_lou", 168, 228, "left");
    RP.actor("a4_lou").face = "front";
    await RP.lines(["@a4_lou It's a nice place. Where did you get all this equipment?", "Mostly from people who thought I was kidding.", "@a4_lou Hm. The couch is comfortable. I'll supervise from here.", "Lou's in my studio. This is the first time 4B and 4C have been in the same room."]);
    return;
  }
  return "Lou's not at the hole. He's behind me. I keep forgetting.";
}

async function louTalk(S) {
  await RP.say("Lou?");
  await RP.convo([
    { text: "What's the story behind NYC 93?", when: S => !S.f.a4_louTold, run: async () => {
      S.f.a4_louTold = true; louFact(S);
      await RP.lines(["@a4_lou Nineteen ninety-three. I was twenty-nine. Days at the post office, nights out. Every Saturday.",
        "@a4_lou A buddy had a four-track and a drum machine he'd borrowed from his church's youth group.",
        "@a4_lou We made it in his basement in one night. A dishwasher was running the whole time.",
        "@a4_lou I pressed twenty copies. Gave nineteen away. One's yours. One's at the bottom of a laundromat.",
        "That is the most Lou story I've ever heard."]);
    } },
    { text: "Can I put it out? On my own label?", when: S => S.f.a4_louTold && !S.f.a4_louOK, run: async () => {
      await RP.lines(["@a4_lou Your own label.", "It's called Pipe Hole Records. Because of how we met.",
        "@a4_lou You named a record company after my wall.", "It's an upgrade.", "@a4_lou ...Fifty-fifty. And my name on it. Spelled right.", "Deal."]);
      S.f.a4_louOK = true;
      await RP.say("My first contract, with a retired postal worker. It's the best one I'll ever sign.");
    } },
    { text: "What did you do after 1993?", when: S => !S.f.a4_louAsked, run: async () => { S.f.a4_louAsked = true; await RP.lines(["@a4_lou Got older. Mostly I got older.", "@a4_lou I kept the record in my head. It was cheaper than rent."]); } },
    { text: "Nothing, Lou.", end: true }
  ]);
}

async function loadSample(S) {
  if (!S.f.a4_louIn) { await RP.say("This is Lou's record. I'm not touching it without Lou. He'd hear me through the wall. Probably through two."); return; }
  if (!S.f.a4_louOK) { await RP.say("Lou, what's the deal for the sample?"); await RP.say("Ask me first, kid. About everything. That's the deal.", "a4_lou"); return; }
  if (S.f.a4_track) { await RP.say("It's already a track. The white label goes back in its sleeve."); return; }
  if (S.f.a4_sampled) { await RP.say("The sample's cued. Try the sampler."); return; }
  await RP.walkTo(412, 214, "back");
  await RP.lines(["Needle down on Lou's white label. Here goes nothing.", "@a4_lou Not so close to the speaker. It's fragile."]);
  playing = true;
  const lp = RP.audio.loop({ genre: "garage", bpm: 120, seed: 93, energy: 2, volume: 0.55 }); lp.start(); lp.setFilter && lp.setFilter("lowpass", 1800);
  RP.sfx("needle"); await RP.wait(2800); lp.stop(0.4); playing = false;
  await RP.lines(["@a4_lou ...That's the demo. Sounds like a wet sock.", "It sounds like a hit. A wet sock hit.", "@a4_lou Chop it, then. But you chop it with me watching."]);
  S.f.a4_sampled = true;
}

async function makeTrack(S) {
  if (!S.f.a4_louIn) { await RP.say("I can't remix NYC 93 without Lou. It's his song. Also his basement."); return; }
  if (!S.f.a4_louOK) { await RP.say("Lou, are we doing this?"); await RP.say("Talk to me first, kid.", "a4_lou"); return; }
  if (!S.f.a4_sampled) { await RP.say("First I'll cue Lou's record on a deck. The sampler needs something to sample."); return; }
  if (S.f.a4_track) { await RP.say("NYC 93 (Pipe Hole Remix) is done. Don't touch it. It's perfect. It's also at 3 a.m. levels of tired."); return; }
  await RP.walkTo(272, 214, "back");
  await RP.lines(["Sampler on. Technics warm. Lou on the couch with his arms crossed.", "@a4_lou Don't chop my hi-hat."]);
  playing = true;
  const res = await A4.tryMg("makTracks", { sample: "white_nyc93", bpm: 122, genre: "garage", difficulty: 2, collab: "Lou" }, S, {
    fallbackScore: 78,
    onFail: async (r, n) => { playing = false; await RP.lines([n === 1 ? "@a4_lou That's not music. That's a car alarm with ambition." : "@a4_lou Again. Fewer cowbells. Maybe none.", "Okay. From the top."]); playing = true; }
  });
  playing = false;
  S.f.a4_track = true; S.f.a4_trackScore = res.score || 0; S.f.a4_trackName = String(res.title || (res.track && (res.track.title || res.track.name)) || "");
  if (res.forced) await RP.say("It's... a track. It's got a beat. I've heard worse at weddings.", "a4_lou");
  await RP.say("Okay. It's done. Lou, I want you to hear it properly.");
  await louHearsIt(S);
}

async function louHearsIt(S) {
  await RP.walkTo(330, 226, "front");
  RP.setClock("THU 6:30 PM");
  await RP.lines(["@a4_lou Not on the headphones.", "@a4_lou On the speakers. Loud. The way it was in my head."]);
  S.f.a4_dim = true; RP.relight();
  await RP.wait(500);
  playing = true;
  const bpm = (S.f.a4_trackScore > 0 && 122) || 122;
  const lp = RP.audio.loop({ genre: "garage", bpm, seed: 93, energy: 4, volume: 0.95 }); lp.start();
  RP.shake(300); RP.sfx("thump");
  await RP.wait(3200);
  const L = RP.actor("a4_lou"); L.face = "front";
  await RP.wait(1600);
  await RP.lines(["Lou doesn't say anything. He takes off his glasses.", "@a4_lou That's the bass line. I wrote that bass line on the 7 train.",
    "@a4_lou In my head it always sounded like this. In the basement it sounded like a dishwasher."]);
  await RP.wait(1400);
  lp.stop(1.2); playing = false;
  S.f.a4_dim = false; RP.relight();
  await RP.lines(["It sounds like you, Lou.", "@a4_lou ...Don't make it weird."]);
  await RP.wait(500);
  await RP.lines(["@a4_lou The hi-hat's too loud.", "Lou--", "@a4_lou It's perfect. Turn the hi-hat down.", "I'll put it in the credits. \"Lou: hi-hat consultant.\"", "@a4_lou Put \"Lou\" and spell it right."]);
  await RP.say("A track. A real one. Needs a cover and a label. Pipe Hole Records... I know exactly what the cover is.");
}

const coverOpen = S => !!S.f.a4_track && !RP.has("a4_photo") && !S.f.a4_released;
async function holeOffer(S) {
  const i = await RP.choose(["Photograph the hole with my phone", "Leave it"]);
  if (i === 0) await takePhoto(S);
}
const louFact = S => { const r = RP.rec("white_nyc93"); if (r && S.f.a4_louTold) r.fact = "No label, no artist. Just \"NYC 93\" in marker. Lou made it in a friend's basement in 1993, with a dishwasher running."; };

async function takePhoto(S) {
  if (RP.has("a4_photo")) { await RP.say("I already have the photo. The hole is photogenic, but it's not a model."); return; }
  if (S.f.a4_released) { await RP.say("The cover is already out. The hole has had its moment."); return; }
  await RP.walkTo(316, 214, "back");
  if (S.f.a4_louIn) await RP.say("Are you taking a picture of my wall?", "a4_lou");
  RP.sfx("camera"); RP.flash("#ffffff", 220);
  await RP.wait(300);
  RP.give("a4_photo");
  await RP.lines(S.f.a4_louIn ? ["It's the cover.", "@a4_lou It's a hole.", "It's YOUR hole, Lou. It's the whole company."] : ["A photo of a hole. Gritty. Honest. Slightly tragic."]);
}

async function release(S) {
  if (!S.f.a4_track) { await RP.say("Nothing to release yet. The record doesn't exist outside my head and a dishwasher in 1993."); return; }
  if (!RP.has("a4_photo")) { await RP.say("Track's done. A record needs a cover, and a cover needs a point. The hole. Phone out, point it at the wall."); return; }
  await RP.walkTo(238, 214, "back");
  await RP.lines(["Okay. Upload page. Title. Artwork. Label. Catalog number.", "PHR-001. Pipe Hole Records. Look at that. A company."]);
  let title = S.f.a4_trackName, reply = ["@a4_lou Fine. It's accurate."];
  if (!title) {
    const i = await RP.choose(["NYC 93 (Pipe Hole Remix)", "NYC 93 (Lou's Version)", "The Hole Thing"]);
    title = ["NYC 93 (Pipe Hole Remix)", "NYC 93 (Lou's Version)", "The Hole Thing"][i];
    reply = [["@a4_lou Fine. It's accurate."], ["@a4_lou ...That's the nicest thing a computer has ever shown me."], ["@a4_lou Absolutely not.", "...Fine. It's the working title."]][i];
  }
  await RP.lines(["Title: " + title, ...(S.f.a4_louIn ? reply : [])]);
  RP.take("a4_photo");
  RP.sfx("typing"); await RP.wait(700);
  S.f.a4_released = true; RP.relight(); RP.setClock("FRI 9:12 AM");
  RP.sfx("success");
  await RP.lines(["Upload. Publish. Done.", "My first release. On my own label. In my own apartment. Next to a pizza box. (Someone else's pizza box.)"]);
  // get.Followers: the week after
  await RP.fadeTo(1, 500);
  await RP.say("One week of promotion later.", "nar");
  await RP.fadeTo(0, 500);
  const before = S.followers;
  const res = await A4.tryMg("getFollowers", { days: 7, start: before, goal: before + 800, difficulty: 2 }, S, { max: 2, fallbackScore: 70, onFail: () => RP.say("Slow week. The algorithm woke up on the wrong side of the bed. Let's go again.") });
  const gained = res.gained != null ? Math.max(0, res.gained) : (800 + Math.round((res.score || 50) * 38));
  RP.followers(gained);
  S.f.a4_viral = true;
  await RP.lines(["It's... working?", "A clip of a cat falling off a couch, set to my remix. 4 million views.", "I don't even own a cat."]);
  await RP.phone([
    { from: "JESS", text: "is that MR WHISKERS in 40,000 videos. i want 10%. and the usb back", hot: true },
    { from: "MARCUS", text: "BRO. cat video. you're famous. berlin?? plus three?", hot: false },
    { from: "DANTE", text: "heard u r blowing up. proud of u. gonna pay u next week", hot: false },
    { from: "RAY (DEEP CUTS)", text: "Told you. Check the box. It's for Berlin. Don't thank me.", hot: false },
    { from: "INGRID FALK", text: "Call me. Now.", hot: true }
  ]);
  await ingridCall(S);
}

async function ingridCall(S) {
  RP.setClock("FRI 11:20 AM");
  RP.sfx("ring"); await RP.wait(900);
  await RP.say("It's Berlin calling. Let's try to sound like a professional.");
  A4.callOn(S);
  await A4.ingLines([
    "Hello, " + A4.dj(S) + ". Ingrid Falk. We should be glad the cat has so many followers.",
    "@kid That's my song.",
    "It is a very good cat song. Halle Neun, Saturday, two a.m., main room.",
    "We can offer exposure."
  ]);
  await RP.say("Exposure.");
  await A4.ing("You'd be playing to eight hundred of Berlin's most discerning, mostly sober people.");
  await A4.ing("Exposure is very valuable.");
  await RP.say("Exposure doesn't pay for flights.");
  await A4.ing("Everyone says that. And then they take the exposure.");
  const res = await A4.tryMg("promoterTalk", { promoter: "Ingrid Falk", charId: "a4_ingrid", promoterPronoun: "she", ask: "your fee, flights, hotel and rider", currency: "$", patience: 5, difficulty: 2 }, S, {
    max: 3, fallbackScore: 72,
    onFail: async (r, n) => { await A4.ing(n === 1 ? "I'm not hearing a number. I'm hearing a feeling." : "Let me give you one more try. Say the word 'fee'. F, E, E."); }
  });
  const sc = res.score != null ? res.score : 60;
  const deal = res.deal || {};
  const dfee = typeof deal.fee === "number" ? deal.fee : 0;
  const fee = res.forced || dfee <= 0 ? 350 : Math.max(350, Math.round(dfee));
  S.f.a4_dealScore = sc; S.f.a4_fee = fee; S.f.a4_deal = true;
  S.f.a4_cls = res.forced ? "" : String(deal.flights || "");
  const FLT = { none: "flights (she books them, you owe her one)", economy: "flights (economy)", "economy-direct": "flights (economy, direct)", business: "flights (business class)" };
  await A4.ingLines([res.forced ? "Fine. A fee of $" + fee + ". Flights. A hotel that is also a hotel." : "Fine. A fee of $" + fee + ", " + (FLT[S.f.a4_cls] || "flights") + ", the hotel and a rider.",
    "The rider: water, towels, and a vegetable that is not a pickle.",
    "@kid And no exposure?", "No exposure. We have an exposure budget. I'm saving it for the tourists."]);
  RP.text("INGRID FALK", "Confirmed. TA 718 JFK-BER, tomorrow 8:55 AM, Terminal 4. Lands 10:55 PM Berlin time. Hotel Zum Pfau, Room 12. Fee $" + fee + " in cash after your set. Passport!!", false);
  A4.callOff(S);
  RP.setClock("FRI 11:58 AM");
  RP.unlock("a4_loc_jfk");
  await RP.lines(["I'm going to Berlin. For money. On purpose.",
    "@a4_lou Berlin. In Germany. You'll be gone a weekend?",
    "@a4_lou I haven't left Brooklyn since the Gulf War.", "@a4_lou Go. Make a mess. Don't lose the bag."]);
  await RP.say("Don't lose the bag. Lou doesn't know it yet, but that's a curse.");
  await louLeaves(S);
  await RP.lines(["Checklist for Berlin: passport, the record bag, a cat I don't own.", !S.f.a4_passport ? (S.f.a4_rayBox ? "The passport is... somewhere in here." : "The box from Ray is by the door. The passport is... somewhere in here.") : !S.f.a4_rayBox ? "The passport is sorted. The box from Ray is by the door." : S.f.a4_packed ? "Passport, box, bag: all sorted. Only the cat is missing." : "Passport and Ray's box are sorted. The bag just needs packing."]);
}

async function louLeaves(S) {
  await RP.npcWalk("a4_lou", 520, 232, "right");
  await RP.npcWalk("a4_lou", 612, 230, "right");
  await RP.fadeTo(1, 300);
  S.f.a4_louIn = false;
  await RP.fadeTo(0, 300);
}

/* ------------------------------------------------------------------ the room */
const FIRST = {};
RP.room({
  id: "a4_studio", act: 4, name: "Studio 4C", paint, draw, light, drawTop: (c, S, t) => A4.drawCall(c, S, t),
  cacheKey: S => (S.f.a4_released ? "r" : ""),
  lightKey: S => (dim(S) ? "d" : "n") + (S.f.a4_released ? "r" : ""),
  ambience: "room",
  music: null,
  walk: [[12, 212], [200, 206], [596, 206], [628, 246], [12, 250]],
  start: { x: 330, y: 232, face: "front" },
  fx: [{ type: "dust", rect: [206, 30, 190, 130], count: 24, color: "#ffe0b8" }],
  self: { look: "Tour bomber, headphones around my neck, the nerves of a man holding a boarding pass he hasn't bought yet.", talk: "Pep talk. \"You got this.\" ...I don't believe me either." },
  actors: [{ id: "a4_lou", char: "lou", x: 606, y: 230, face: "left", act: "stand", name: "Lou", vis: S => !!S.f.a4_louIn }],
  sprites: [
    { y: 240, vis: S => !S.f.a4_rayBox, draw: c => sprRayBox(c, 520, 220) },
    { y: 222, draw: c => sprChair(c, 244, 178) },
    { y: 246, draw: c => sprPizza(c, 30, 232) },
    { y: 240, vis: S => !S.f.a4_packed, draw: c => sprBag(c, 92, 218) },
    { y: 200, draw: c => sprGerald(c, 154, 150) }
  ],
  hotspots: [
    { id: "a4_lou", name: "Lou", look: "Lou, in my studio, in a better cardigan. He's seen things. Mostly on his TV.",
      talk: S => louTalk(S), give: (S, item) => item === "a4_white" ? "He gave it to me. I'm not giving it back. I'm giving it a remix." : "Lou doesn't want that. Lou wants me to turn it down.",
      pickup: "He's got two hundred pounds of opinions. I'm not lifting him.", push: "Lou stands his ground. His ground is also a cardigan.", pull: "Lou is not a lever." },
    { id: "a4_window", name: "window", r: [200, 20, 132, 106], z: 20, walk: [266, 214, "back"],
      look: "Bushwick at golden hour. Somewhere over the roofs a promoter is saying \"next week\" to a DJ.",
      open: "It sticks. It's been stuck since 2019. The landlord calls that \"character.\"", close: "It's closed. Frankly, it's always been closed." },
    { id: "a4_hole", name: "hole", r: [326, 138, 20, 18], z: 40, walk: [322, 214, "back"],
      look: async S => { await RP.say(S.f.a4_louIn ? "The famous hole. Lou's TV flickers in there like a distant fireplace." : "The pipe hole to 4B. I can see Lou's TV flickering through it."); if (coverOpen(S)) { await RP.say("Phone in my pocket, track on the laptop. That hole is the cover."); await holeOffer(S); } },
      talk: S => louPipe(S), use: async S => { if (coverOpen(S)) { await RP.say("Phone out. The hole is the cover."); await holeOffer(S); return; } return "It's a hole. It's for talking to Lou and for nothing else."; },
      pickup: "It's attached to the building. So is Lou.", push: "Pushing a hole. Deep. I get it.",
      give: (S, item) => item === "a4_white" ? "He gave it to me for a reason." : "Lou doesn't want anything through the hole. Except noise complaints." },
    { id: "a4_radiator", name: "radiator", r: [216, 132, 84, 36], z: 15, walk: [266, 214, "back"], look: "It still clanks all winter. In October it only clanks to remind me it exists.", use: "It's on. Warmth is a social construct.", push: "It's bolted to the building. The building wins." },
    { id: "a4_laptop", name: "laptop", r: [210, 118, 32, 26], z: 50, walk: [232, 214, "back"],
      look: S => S.f.a4_email ? "Email from a booking agent in Berlin, open on the screen. I haven't been this nervous since I opened a Dante text." : "My laptop. One new email from Ingrid Falk, Berlin. It signs off with an umlaut. I've read it nine times.",
      use: S => !S.f.a4_email ? readEmail(S) : S.f.a4_released ? "TrackShack says 4,000,000 plays. Most of them are cats." : release(S), open: S => S.f.a4_released ? "It's open. It's always open. It's the cat video that's always playing." : (S.f.a4_email ? release(S) : readEmail(S)),
      pickup: "I'm not carrying a laptop to Berlin. They have laptops there." },
    { id: "a4_sampler", name: "sampler", r: [248, 122, 50, 22], z: 50, walk: [272, 214, "back"],
      look: "A pad sampler with a tiny screen and sixteen pads. Only four of them have ever hit a note I meant.", use: S => makeTrack(S), push: S => makeTrack(S), pickup: "Nope. It stays. It's attached to my ambitions." },
    { id: "a4_decks", name: "Technics", rects: [[374, 108, 74, 34], [488, 108, 74, 34]], z: 55, walk: [440, 214, "back"],
      look: "A pair of Technics SL-1210MK7s. Direct drive, the same decks every club on earth has. They're mine. I'm still getting used to that.",
      use: S => loadSample(S), push: "Don't push the Technics. They look at you.", pull: "Pitch fader's at zero. Where it belongs.", pickup: "Each weighs about as much as a toddler. A rich, important toddler." },
    { id: "a4_mixer", name: "mixer", r: [447, 108, 42, 34], z: 56, walk: [470, 214, "back"], look: "Pioneer DJM-350. Two channels, zero crackle. The crackle was a phase of my life.", use: "Faders up, faders down. I could do this for hours.", pickup: "It's wired into the whole studio. It's an organ. Of my studio." },
    { id: "a4_monitors", name: "monitors", rects: [[346, 94, 30, 48], [560, 94, 30, 48]], z: 54, walk: [470, 214, "back"], look: "Dynaudio BM5 mkIII studio monitors. They tell me the truth about my music. The truth is a lot.", use: "Quiet in here for now. Lou would like to keep it that way.", pickup: "They're heavy and they cost more than my first car. Which I didn't have." },
    { id: "a4_desk", name: "desk", rects: [[346, 140, 244, 60], [206, 142, 122, 52]], z: 10, walk: [470, 214, "back"], look: "Two desks, a lot of cables, and a glass of water I keep forgetting to drink." },
    { id: "a4_neon", name: "label neon", r: [388, 26, 108, 44], z: 30, walk: [440, 214, "back"], vis: S => !!S.f.a4_released,
      look: "PIPE HOLE RECORDS. Pink neon, one burnt tube from the factory. I'm choosing to call it \"vintage.\"", use: "It's already on. It's not a toaster." },
    { id: "a4_note", name: "label ideas", r: [406, 30, 64, 36], z: 30, walk: [440, 214, "back"], vis: S => !S.f.a4_released,
      look: "LABEL NAME? \"Wall Music (no)\", \"Lou & Me (no)\", \"Hole (yes?)\". I have a very small creative team.", pickup: "It's taped up with six layers of tape. It's staying." },
    { id: "a4_panels", name: "acoustic panels", rects: [[346, 20, 98, 50], [550, 20, 44, 50]], z: 12, walk: [470, 214, "back"], look: "Foam panels. Soundproofing. Lou says they don't work. Lou says that every time he hears me through them." },
    { id: "a4_shelf", name: "record shelf", r: [12, 16, 136, 82], z: 20, walk: [80, 218, "back"],
      look: "Every record that didn't fit in the crate. Alphabetized by how much I love them.", use: S => RP.crateView ? RP.crateView() : "A lot of vinyl.", open: S => RP.crateView ? RP.crateView() : "A lot of vinyl." },
    { id: "a4_couch", name: "couch", r: [10, 108, 142, 62], z: 25, walk: [90, 226, "back"], look: "My couch. It's also my guest room, my Sunday and Lou's seat for the remix.", use: "I sit. I stand. Sitting is a lot.", push: "Couches don't move. They arrive and they stay.", pull: "I've tried pulling out the couch bed. It pulls out like a ghost." },
    { id: "a4_poster", name: "Halcyon poster", r: [156, 22, 44, 60], z: 22, walk: [180, 218, "back"], look: "HALCYON ROOM, THURSDAYS. Odessa's flyer guy misspelled my name on the first printing. This is the corrected one. It's also wrong." },
    { id: "a4_iou", name: "framed IOU", r: [150, 86, 50, 36], z: 24, walk: [180, 218, "back"], look: "A framed IOU from Dante: \"Next week.\" It's the oldest document in the apartment. It's a better investment than most stocks.", pickup: "If I take it down, the wall will hold a grudge." },
    { id: "a4_plant", name: "Gerald", r: [152, 150, 52, 50], z: 52, walk: [186, 222, "right"],
      look: S => S.f.a4_passport ? "Gerald, the plant. He's been through a lot, including my passport. He's fine." : "Gerald, the plant. Something blue is poking out of the soil. Gerald's never been a sharer.",
      talk: "Gerald doesn't say a word. He's a plant of few words and many leaves.",
      use: S => grabPassport(S), pickup: S => grabPassport(S), open: S => grabPassport(S) },
    { id: "a4_rbox", name: "box from Ray", r: [520, 222, 36, 28], z: 62, walk: [504, 238, "right"], vis: S => !S.f.a4_rayBox,
      look: "A cardboard box taped shut, labeled BERLIN in Ray's handwriting. Underneath, in smaller print: \"Don't thank me.\"",
      pickup: S => openRayBox(S), open: S => openRayBox(S), use: S => openRayBox(S) },
    { id: "a4_bag", name: "record bag", r: [90, 220, 42, 32], z: 64, walk: [74, 238, "right"], vis: S => !S.f.a4_packed,
      look: S => S.f.a4_rayBox ? "My record bag, waiting by the couch. It's heavy even when empty. Mostly because of guilt." : "My record bag, empty. A record bag without records is just a very sad backpack.",
      pickup: S => packBag(S), use: S => packBag(S), open: S => packBag(S) },
    { id: "a4_door", name: "door", r: [598, 36, 42, 130], z: 20, walk: [598, 224, "right"],
      look: "The door to the hall, the stairs, the rest of the world. And Lou's door, next to mine, behind which a TV plays a courtroom drama.",
      exit: S => leaveCheck(S) },
    { id: "a4_rug", name: "rug", r: [190, 222, 270, 28], z: 8, floor: true, look: "A rug that ties the room together. The pizza box by the couch is a separate issue." }
  ],
  combos: [
    ["a4_white", "a4_decks", S => loadSample(RP.state)],
    ["a4_white", "a4_sampler", S => loadSample(RP.state)],
    ["a4_white", "a4_laptop", "It's vinyl. The laptop doesn't take vinyl. It takes feelings, and it has a license for exactly one."],
    ["a4_white", "a4_mixer", "A white label goes on the turntable, not the mixer. The mixer is for fading, not for feelings."],
    ["a4_white", "a4_lou", "He knows what it is. He's the one who made it."],
    ["a4_white", "a4_hole", "He gave it to me for a reason."],
    ["phone", "a4_hole", S => takePhoto(RP.state)],
    ["phone", "a4_lou", "Lou has a rotary phone, attached to a wall like a hostage. He'd look at mine the same way."],
    ["a4_photo", "a4_laptop", S => release(RP.state)],
    ["a4_photo", "a4_hole", "It's the photo OF the hole. Putting it back would be recursive."],
    ["a4_passport", "a4_plant", "The plant already had my passport. I've seen what it does with it."],
    ["a4_bag", "a4_couch", "I'm not putting my records on the couch. The couch has a sticky history."],
    ["a4_bag", "a4_decks", "I don't need to play anything right now. Also, it's a bag."]
  ],
  enter: async (S, from) => {
    louFact(S);
    if (S.f.a4_louIn && !RP.actor("a4_lou").vis) { /* ensure state is consistent */ }
    if (from && from !== "a4_studio" && S.f.a4_deal && !S.f.a4_enterNote) { S.f.a4_enterNote = true; }
  }
});

async function grabPassport(S) {
  if (S.f.a4_passport) return "Gerald has nothing else on him. I checked. Twice.";
  S.f.a4_passport = true; RP.give("a4_passport");
  await RP.lines(["There's something blue under his leaves... My passport.", "Gerald has been hoarding it since I last went to Canada.", "(I went to Canada to get a better cheese. It worked.)"]);
}
async function openRayBox(S) {
  if (S.f.a4_rayBox) return "Empty box. Just cardboard and the memory of Ray's handwriting.";
  S.f.a4_rayBox = true;
  A4.TECHNO.forEach(id => RP.addRecord(id, true));
  RP.toast("Crate +6: techno & minimal from Ray");
  await RP.lines(["Six records and a note: \"Berlin people only respect records. Read the sleeves.\"",
    "Robert Hood, Jeff Mills, Basic Channel, Ben Klock, Marcel Dettmann, X-101. In my crate, on my back, on a plane.",
    "Ray gives hints as insults and gifts as threats. He's the best."]);
}
async function packBag(S) {
  if (S.f.a4_packed) return "I've got the bag.";
  if (!S.f.a4_rayBox) { await RP.say("It's empty. The Berlin records are in Ray's box, by the door."); return; }
  S.f.a4_packed = true; RP.give("a4_bag");
  await RP.lines(["Records in. Zipper up. It weighs about as much as a medium dog.", "Every record I own that matters is in here. If it gets lost, I'm done."]);
}
function leaveCheck(S) {
  if (!S.f.a4_deal) return S.f.a4_email ? "Ingrid hasn't confirmed anything yet. First the record, then the money, then the airport." : "I'm not going anywhere before I read that email. It's from Berlin. It has an umlaut. It could be important.";
  if (!S.f.a4_passport) return "Passport. I can't go anywhere without it. Last seen: here. Somewhere.";
  if (!S.f.a4_packed) return !S.f.a4_rayBox ? "The box from Ray, by the door. It's got my Berlin records in it." : "The record bag. By the couch. Don't leave without the bag.";
  S.f.a4_leaving = true;
  return "travel";
}

/* ------------------------------------------------------------------ walkthrough for the studio part (assembled in 99_walkthrough.js) */
A4.wtStudio = [
  ["look", "hot:a4_window"], ["look", "hot:a4_iou"],
  ["use", "hot:a4_laptop"], ["expect", "S.f.a4_email", "email read"],
  ["pickup", "hot:a4_plant"], ["expect", "RP.has('a4_passport')", "passport from Gerald"],
  ["pickup", "hot:a4_rbox"], ["expect", "S.f.a4_rayBox && RP.hasRecord('basic_channel_phylyps_trak')", "Ray's box opened"],
  ["talk", "hot:a4_hole"], ["expect", "S.f.a4_louIn", "Lou came over"],
  ["talk", "hot:a4_lou"],
  ["use", "hot:a4_decks", "a4_white"], ["expect", "!S.f.a4_sampled", "no sample without a deal"],
  ["answers", [0, 0, 1]], ["talk", "hot:a4_lou"], ["expect", "S.f.a4_louOK", "Lou agreed to the label"],
  ["use", "hot:a4_decks", "a4_white"], ["expect", "S.f.a4_sampled", "sample cued"],
  ["mg", { ok: true, score: 82, track: { name: "NYC 93 (Pipe Hole Remix)", bpm: 122 } }],
  ["use", "hot:a4_sampler"], ["expect", "S.f.a4_track", "track made"],
  ["answers", [0]], ["use", "hot:a4_hole", "phone"], ["run", async (S, RP) => { RP.test.answers.length = 0; }], ["expect", "RP.has('a4_photo')", "cover photo"],
  ["mg", { ok: true, score: 80, gained: 6200 }], ["mg", { ok: true, score: 74, deal: { fee: 1800 } }],
  ["use", "hot:a4_laptop"], ["expect", "S.f.a4_released && S.f.a4_viral && S.f.a4_deal", "released, spread, booked"],
  ["use", "hot:a4_door"], ["expect", "S.room === 'a4_studio'", "not leaving without the bag"],
  ["pickup", "hot:a4_bag"], ["expect", "RP.has('a4_bag')", "bag packed"],
  ["run", async (S, RP) => { RP.test.travelQ.push("a4_loc_jfk"); }], ["use", "hot:a4_door"], ["expect", "S.room === 'a4_jfk'", "at JFK"]
];
})();
