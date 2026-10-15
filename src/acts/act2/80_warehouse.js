/* Act 2 — Basement Tapes, the old Tri-State Tape & Duplication basement in Gowanus. Twinkie's spot (it's Vic's).
   after.Party (people, a location, a sound system), set up the turntables, play "NYC 93" on a real system,
   Vic walks in furious, promoter.Talk, the monthly slot is booked, completeAct.
   Flags: a2_whIntro, a2_afterDone, a2_ttSet, a2_vicIn, a2_vicFails, a2_slot, a2_wFriends, a2_louPlayed */
(function () {
"use strict";
const RP = window.RP, A2 = RP.a2, PK = RP.PK;
const { R, P, ell, txt, txtC } = RP.u;
const U = PK.util;
const W = 640;
const lit = S => !!S.f.a2_whLights;
const crowdOn = S => !!S.f.a2_afterDone;

function paint(c, S) {
  const em = [], L = lit(S), tt = !!S.f.a2_ttSet;
  // vaulted brick basement: dark brick, concrete pillars, ceiling slab with pipes
  PK.brick(c, 0, 0, W, 170, { base: "#4e3036", mortar: "#4a4252", worn: 0.75, seed: 81, bw: 18, bh: 8 });
  U.dshade(c, 0, 0, W, 70, "#06020c", (x, y) => 1 - y / 70, 0.55);
  PK.concrete(c, 0, 0, W, 30, { base: "#3e3a50", panelH: 30, seed: 82 });
  R(c, 0, 26, W, 6, "#22202e"); U.HL(c, 0, 26, W, "#5a566c"); U.dshade(c, 0, 32, W, 10, "#06020c", (x, y) => 1 - (y - 32) / 10, 0.5);
  PK.pipe(c, 0, 12, W, { dir: "h", r: 5, joint: 100 }); PK.pipe(c, 0, 20, W, { dir: "h", r: 3, joint: 60, color: "#6a5a4a" });
  // pillars with painted numbers
  [[86, "1"], [232, "2"], [478, "3"], [610, "4"]].forEach(([x, n], i) => {
    PK.concrete(c, x, 30, 24, 140, { base: "#5a566c", panelH: 46, seed: 90 + i });
    R(c, x - 2, 30, 28, 6, "#3a3650"); U.HL(c, x - 2, 30, 28, "#7a7690");
    R(c, x + 6, 100, 12, 14, "#e8c820"); txtC(c, n, x + 12, 104, "#1d1622", 1, 0);
    U.dshade(c, x, 30, 24, 140, "#06020c", (xx, y) => (xx - x) / 24 * 0.5, 0.35);
  });
  // faded painted sign: TRI-STATE TAPE & DUPLICATION
  txtC(c, "TRI-STATE TAPE", 360, 40, "#c8c0b0", 2, 1); txtC(c, "& DUPLICATION", 360, 54, "#c8c0b0", 1, 1); txtC(c, "WE COPY ANYTHING (LEGALLY)", 360, 66, "#a8a090", 1, 1);
  U.dshade(c, 200, 34, 320, 44, "#4e3036", (x, y) => ((x * 3 + y * 5) % 7 < 3 ? 0.9 : 0.2), 0.45);
  // cassette wall (left): rows of tape boxes
  R(c, 8, 52, 70, 96, "#2a1c1c"); U.outline(c, 8, 52, 70, 96, "#5a4038");
  for (let r = 0; r < 6; r++) { const y = 56 + r * 15; R(c, 9, y + 12, 68, 2, "#7a5a40"); for (let k = 0; k < 8; k++) { const col = ["#ff3fa4", "#39d0ff", "#ffd23f", "#e8e4f0", "#9be15d", "#c0302c", "#a05cff", "#ff8a4c"][(r * 3 + k * 5) % 8]; R(c, 11 + k * 8, y + 1, 7, 11, col); R(c, 12 + k * 8, y + 3, 5, 4, "#f4f0e8"); P(c, 14 + k * 8, y + 5, "#1d1622"); } }
  txtC(c, "MASTERS", 43, 44, "#c8c0b0", 1, 1);
  // freight gate (right) with warning stripes
  R(c, 538, 56, 64, 114, "#2a2630"); U.outline(c, 538, 56, 64, 114, "#5a566c");
  for (let x = 541; x < 600; x += 5) { U.VL(c, x, 59, 108, "#6a667c"); U.VL(c, x + 1, 59, 108, "#1a1822"); }
  for (let y = 60; y < 166; y += 12) { U.HL(c, 540, y, 60, "#8a869c"); }
  R(c, 536, 44, 68, 10, "#e8c820"); txtC(c, "FREIGHT", 570, 46, "#1d1622", 1, 1);
  for (let i = 0; i < 4; i++) { RP.u.poly(c, [[538 + i * 17, 168], [546 + i * 17, 168], [538 + i * 17, 176]], "#e8c820"); }
  // house rules banner
  R(c, 130, 76, 78, 30, "#14102e"); U.outline(c, 130, 76, 78, 30, "#5a4a88"); txtC(c, "NO CAMERAS", 169, 79, "#ff3fa4", 1, 0); txtC(c, "NO COVER BANDS", 169, 86, "#e8e4f0", 1, 0); txtC(c, "NO \"CAN YOU", 169, 93, "#39d0ff", 1, 0); txtC(c, "PLAY SOMETHING", 169, 99, "#39d0ff", 1, 0);
  // concrete floor with safety lines, a drain and cables
  PK.concrete(c, 0, 168, W, 88, { base: "#4a4660", panelH: 60, seed: 83 });
  R(c, 0, 168, W, 3, "#3a3650"); U.dshade(c, 0, 171, W, 16, "#06020c", (x, y) => 1 - (y - 171) / 16, 0.45);
  for (let x = 0; x < W; x += 26) R(c, x, 196, 14, 2, "#c8a820");
  ell(c, 150, 238, 32, 4, "#2a2a44"); ell(c, 146, 237, 22, 2, "#5a5a8a"); R(c, 440, 232, 22, 8, "#2a2838"); for (let i = 0; i < 5; i++) U.VL(c, 442 + i * 4, 232, 8, "#14121a");
  // the stage and the booth
  PK.stage(c, 252, 148, 216, 44, { steps: false, wedges: true, deck: "#3a3248" });
  if (tt) em.push.apply(em, PK.djBooth(c, 264, 80, 192, { gear: "turntable", mixer: "2ch", logo: "BASEMENT", lights: L, model: "technics", seed: 7 }));
  else { PK.table(c, 276, 96, 168, 52, { color: "#6a5a4a", top: "#8a7a62", seed: 5 }); PK.cardboardBox(c, 296, 76, 40, 24, { color: "#c8925a", seed: 8 }); PK.cardboardBox(c, 384, 78, 44, 22, { color: "#b88248", seed: 9 }); }
  PK.speakerStack(c, 208, 66, 44, 92, {}); PK.speakerStack(c, 468, 66, 44, 92, {});
  // truss with par cans, and the neon sign (lit only when Twinkie flips the breaker)
  const tr = PK.truss(c, 196, 34, 328, 10, { lights: L ? ["#ff3fa4", "#39d0ff", "#ffd23f", "#a05cff", "#5cff9a"] : 5 }); if (L) em.push.apply(em, tr);
  if (L) { em.push.apply(em, PK.neon(c, "BASEMENT", 240, 108 - 24, "#39d0ff", { scale: 2, tube: 2 })); em.push.apply(em, PK.neon(c, "TAPES", 336, 108 - 24, "#ff3fa4", { scale: 2, tube: 2 })); }
  else { txtC(c, "BASEMENT TAPES", 360, 78, "#3a3648", 2, 1); }
  // a work bulb by the door when the lights are off
  if (!L) em.push.apply(em, PK.bulb(c, 62, 30, { len: 8, glowR: 40 }));
  return em;
}

function drawBar(c, S) {
  // oil-drum bar, plank top, a cash box with a sign
  [[30, 156], [88, 156]].forEach(([x, y]) => { R(c, x, y + 8, 32, 34, "#2f62b8"); PK.gradH(c, x, y + 8, 32, 34, ["#5a8ad8", "#2f62b8", "#1d3f7a"], { dither: 1 }); U.HL(c, x, y + 8, 32, "#8ab0f0"); U.HL(c, x, y + 41, 32, "#14284a"); U.HL(c, x, y + 20, 32, "#1d3f7a"); U.HL(c, x, y + 30, 32, "#1d3f7a"); });
  R(c, 24, 154, 102, 6, "#8a6a4a"); U.HL(c, 24, 154, 102, "#c8a070"); U.HL(c, 24, 159, 102, "#4a3420");
  R(c, 38, 140, 24, 14, "#c8c4d8"); U.outline(c, 38, 140, 24, 14, "#5a566c"); txtC(c, "CASH", 50, 143, "#c0302c", 1, 0); txtC(c, "ONLY", 50, 149, "#1d1622", 1, 0);
  [74, 86, 96].forEach((x, i) => { R(c, x, 144, 5, 10, ["#cfe4ef", "#c0782a", "#3a8a5a"][i]); R(c, x + 1, 141, 3, 3, ["#cfe4ef", "#c0782a", "#3a8a5a"][i]); });
}
function drawTapes(c, S) {
  // a mid-floor pile of cassette-duplicator gear: reels and a rack, left of the stage
  const x = 164, y = 150;
  R(c, x, y, 38, 24, "#6a6a7a"); PK.gradV(c, x, y, 38, 24, ["#8a8a9a", "#6a6a7a", "#4a4a5a"], { dither: 1 }); U.outline(c, x, y, 38, 24, "#2a2838");
  ell(c, x + 10, y + 11, 7, 7, "#14121a"); ell(c, x + 10, y + 11, 4, 4, "#8a869c"); ell(c, x + 28, y + 11, 7, 7, "#14121a"); ell(c, x + 28, y + 11, 4, 4, "#8a869c"); R(c, x + 12, y + 14, 14, 2, "#c8c4d8");
}

function light(S) {
  if (crowdOn(S)) return {
    ambient: "#241c4a",
    lights: [
      { x: 360, y: 40, r: 300, color: "#ff3fa4", steps: 4, sy: 1.1, rim: true },
      { x: 250, y: 40, r: 260, color: "#39d0ff", steps: 4, sy: 1.1, rim: true },
      { x: 470, y: 40, r: 260, color: "#a05cff", steps: 4, sy: 1.1, rim: true },
      { x: 570, y: 100, r: 120, color: "#ffd890", steps: 3, power: 0.7 },
      { x: 80, y: 120, r: 120, color: "#ffb070", steps: 3, power: 0.6 }
    ],
    halos: [{ x: 360, y: 90, r: 30, color: "#ff3fa4", strength: 0.9 }],
    key: { x: 360, y: 60 }, shadow: 0.6
  };
  if (lit(S)) return {
    ambient: "#2a2250",
    lights: [
      { x: 360, y: 60, r: 280, color: "#7a6ad8", steps: 4, sy: 1.1, rim: true },
      { x: 300, y: 90, r: 160, color: "#39d0ff", steps: 3, power: 0.8 },
      { x: 420, y: 90, r: 160, color: "#ff3fa4", steps: 3, power: 0.8 },
      { x: 80, y: 120, r: 120, color: "#ffb070", steps: 3, power: 0.6 }
    ],
    key: { x: 360, y: 60 }, shadow: 0.55
  };
  return {
    ambient: "#1c1832",
    lights: [
      { x: 62, y: 42, r: 190, color: "#ffd890", steps: 5, rim: true },
      { x: 330, y: 120, r: 150, color: "#7a8ab8", steps: 3, power: 0.4 }
    ],
    halos: [{ x: 62, y: 42, r: 20, color: "#ffcf80", strength: 0.9 }],
    key: { x: 62, y: 40 }, shadow: 0.6
  };
}

/* ------------------------------------------------------------------ scenes */
async function arrive(S) {
  S.f.a2_whIntro = true;
  await RP.lines([
    "A back door in Gowanus. A chain. A padlock. A smell of hot plastic and old ambition.",
    "@twinkie Shh. Don't say anything. Don't touch anything. And don't look surprised."
  ]);
  RP.sfx("unlock"); await RP.wait(500);
  await RP.lines([
    "Twinkie unlocks the padlock with a key she's had for a long time. We go down a staircase that has seen things.",
    "@twinkie Welcome to my spot. Empty on Saturdays. Big. Quiet. And it's got a sound system, a bar and a name.",
    "A name?"
  ]);
  S.f.a2_whLights = true; RP.relight();
  RP.sfx("click"); await RP.wait(400);
  await RP.lines([
    "She throws a breaker. A neon sign blinks on over the stage: BASEMENT TAPES.",
    "...",
    "Twinkie. This is Vic's.",
    "@twinkie It's nobody's. It's everybody's. It's Vic's on Saturdays. On Sundays at five a.m. it's mine.",
    "I'm going to die.",
    "@twinkie You're going to DJ. Same thing, with better lighting."
  ]);
  await RP.lines([
    "On the wall, in faded white paint: TRI-STATE TAPE & DUPLICATION. WE COPY ANYTHING (LEGALLY).",
    "Tri-State Tape. Lou said he got his demos duplicated here in 1993. He said it smelled like hot plastic and ambition. It still does."
  ]);
  await RP.lines([
    "@twinkie Okay. Here's what we need. People. A location, which we have. A sound system, which we kind of have. And a crowd by dawn.",
    "@twinkie Talk to me when you're ready. I'll be here being calm."
  ]);
  RP.toast("Talk to Twinkie to plan the afters.");
}

async function fallbackAfter() {
  await RP.say("I open my phone. Contacts. Names. Every one of them a possible yes.", "nar");
  const picks = [];
  const pool = [["Marcus", "\"Birthday boy. And he's got plus three.\""], ["Dani", "\"Closing the bar at five. She'll come.\""], ["Moxie", "\"Hosting a loft with a PA and a debt to me.\""], ["Jess", "\"Cat photo diplomat. And she works in sound.\""], ["Fitz", "\"Doorman. He owes me a favor. No he doesn't. He owes Dani.\""]];
  while (picks.length < 3) {
    const rest = pool.filter(p => !picks.includes(p[0]));
    const i = await RP.choose(rest.map(p => "Text " + p[0]));
    const who = rest[i];
    picks.push(who[0]);
    await RP.say("Text to " + who[0] + ": \"basement. now. bring everyone.\" " + who[1]);
  }
  await RP.say("Three texts. Three yeses. In New York, that's a stampede.");
  return { ok: true, score: 80, guests: 60, fallback: true };
}

async function planAfters(S) {
  if (S.f.a2_afterDone) { await RP.say("The afters are in full swing. I have a crowd and a pair of turntables. I should do something about the second."); return; }
  if (!S.f.a2_whIntro) { await arrive(S); return; }
  await RP.lines(["@twinkie Phone out. Contacts. Location: yes. Sound: whatever Moxie and Jess can lend. And a crowd before the sun comes up.", "@twinkie Go."]);
  let res;
  for (;;) {
    res = await A2.mg("afterParty", { needs: { people: 30, location: 1, sound: 1 }, contacts: ["Marcus", "Dani", "Jess", "Moxie", "Fitz", "Toby", "Kosmo"], time: 120, difficulty: 2 }, fallbackAfter);
    if (res && res.ok) break;
    await RP.lines(["@twinkie Close. But close doesn't fill a basement. The sun's coming up in an hour.", "@twinkie Again. Faster. Fewer apologies."]);
    const i = await RP.choose(["Try again", "Catch my breath"]);
    if (i === 1) { await RP.say("I catch my breath. Twinkie fans me with a flyer. It's Vic's flyer. We both ignore that."); return; }
  }
  S.f.a2_afterDone = true; S.f.a2_guests = res.guests != null ? res.guests : 50; S.f.a2_wFriends = true;
  RP.setClock("SUN 4:40 AM");
  RP.relight();
  RP.followers(30);
  RP.sfx("cheer");
  await RP.lines([
    "They come. Marcus and plus three (it's actually plus seven). Dani in her apron. Moxie with a van full of PA. Fitz in his beanie. Toby, who has brought a gong.",
    "@twinkie Look at that. A crowd. A sound system. A basement.",
    "I need turntables. Where are my turntables?"
  ]);
  RP.crowdOn && RP.crowdOn();
  await RP.say("Set up the decks: use the boxed turntables on the booth.", "nar");
}

async function setupDecks(S) {
  if (!S.f.a2_afterDone) { await RP.say("Not yet. I need a crowd before I need a booth. Twinkie can help with the crowd."); return; }
  if (S.f.a2_ttSet) { await RP.say("They're set up. Two AT-LP120-USB decks, a mixer, and a basement full of potential."); return; }
  if (!RP.has("a2_tts")) { await RP.lines(["No turntables. No decks. Nothing to play on.", "Eddie's van is under the BQE. He said he'd be there till three. It might be after three. It might be a two-time deal."]); return; }
  await RP.walkTo(360, 206, "back");
  await RP.lines([
    "I unbox the turntables. Each one gets a slipmat and a quiet moment of respect.",
    "I plug them into the mixer: left channel, right channel. Headphones around my neck, a record in each hand.",
    "The AT-LP120-USBs look small on a stage this big. They look like the beginning of something."
  ]);
  RP.take("a2_tts"); S.f.a2_ttSet = true; RP.relight();
  await playSet(S);
}

async function playSet(S) {
  RP.setClock("SUN 5:05 AM");
  await RP.lines([
    "First record: Everything But The Girl, \"Missing,\" the Todd Terry remix. Atlantic, 1995. The first record I ever bought.",
    "Then CeCe Peniston, \"Finally.\" A little A&M magic from 1991.",
    "Then, from the white label, the one I've been saving: \"NYC 93.\""
  ]);
  S.f.a2_louPlayed = true;
  const lp = RP.audio.loop({ genre: "garage", bpm: 120, seed: 93, energy: 3, volume: 0.8 }); lp.start();
  RP.sfx("needle");
  await RP.wait(1400);
  await RP.lines([
    "Four bars in, the whole basement turns around.",
    S.f.a2_louSecret ? "Lou, wherever you are, I hope your TV is on mute and your cardigan is dry." : "Whoever made this is somebody's neighbor."
  ]);
  lp.stop(0.6);
  // Vic arrives
  RP.actor("a2_vic").vis = () => true; S.f.a2_vicIn = true;
  RP.place("a2_vic", 590, 226, "left");
  RP.sfx("door");
  await RP.lines([
    "The freight gate rolls up. A silhouette in sunglasses. A leather jacket. A man who counts money with a rubber band.",
    "@a2_vic ...WHO. IS. IN. MY. BASEMENT."
  ]);
  await RP.npcWalk("a2_vic", 440, 226, "left");
  RP.actor("kid").face = "right";
  await RP.lines([
    "@twinkie Hi, Vic.",
    "@a2_vic Twinkie. TWINKIE. How did you get in?",
    "@twinkie You never asked for the key back.",
    "@a2_vic I specifically asked for the key back.",
    "@twinkie You specifically asked me while you were crying about Florida.",
    "@a2_vic ...That's different."
  ]);
  await RP.lines([
    "@a2_vic And you. The PA kid. In my basement. With two hundred people and a pair of AT-LPs.",
    "I can explain.",
    "@a2_vic Explain what? That you took a dead basement and made it better than I did?",
    "@a2_vic ...What was that record?",
    "\"NYC 93.\" A white label.",
    "@a2_vic Who's it by?"
  ]);
  if (S.f.a2_louSecret) await RP.lines(["A guy named Lou. L.O.U. He made it in 1993 on a borrowed sampler. Pressed ten copies. Never released.", "@a2_vic Ten copies. Nobody has it. Nobody. Hm."]);
  else await RP.lines(["I don't know. A neighbor gave it to me. No artist. Just a name in marker.", "@a2_vic Hm. A record nobody can find. I like that more than I want to."]);
  await RP.lines(["@a2_vic Okay. Come on. Sit down. Let's talk. And do NOT say \"please.\""]);
  await pitchVic(S);
}

async function fallbackTalk() {
  let score = 0;
  const rounds = [
    ["\"I need this slot so badly, Vic.\"", "\"I'm not in a rush. I'm just here to play records.\"", "\"Whatever you want. Anything. I'll sweep.\""],
    ["\"I know your party. Vinyl, cash, last Saturday. And I play the way you ask.\"", "\"Please. I'm begging. It's my only shot.\"", "\"I've got a crowd of fifty and I can get you five hundred.\""],
    ["\"If it's not for me, that's fine. There's a hundred basements in Brooklyn.\"", "\"Just say yes. I'll say anything you want.\"", "\"I've got a white label from 1993. Think about it.\""]
  ];
  const good = [1, 0, 0];
  for (let r = 0; r < 3; r++) {
    const opts = rounds[r].slice();
    const i = await RP.choose(opts);
    const ok = (r === 0 && i === 1) || (r === 1 && i === 0) || (r === 2 && (i === 0 || i === 2));
    if (ok) { score++; await RP.say(["...Huh. That's not desperate. I'm intrigued.", "You know my party. I like that.", "A record nobody has. Hm."][r], "a2_vic"); }
    else await RP.say(["You're sweating need.", "Stop saying please.", "Now it's a confession."][r], "a2_vic");
  }
  return { ok: score >= 2, score: 40 + score * 20, fallback: true };
}

async function pitchVic(S) {
  const patience = 3 + (S.f.a2_showered ? 1 : 0) + (S.f.a2_louSecret ? 1 : 0) + (S.f.a2_afterDone ? 1 : 0);
  let res = null;
  for (;;) {
    res = await A2.mg("promoterTalk", { promoter: "Vic", charId: "a2_vic", ask: "a monthly slot at Basement Tapes", patience, difficulty: 2 }, fallbackTalk);
    if (res && res.ok) break;
    S.f.a2_vicFails = (S.f.a2_vicFails || 0) + 1;
    if (S.f.a2_vicFails >= 3) {
      await RP.lines(["@a2_vic ...You know what? You sound desperate AND you made my basement better than I did.", "@a2_vic I'm too tired to argue. Fine. Fine."]);
      break;
    }
    await RP.lines(["@a2_vic Not buying it. You sound like a man selling a kidney. Which you've done, I can smell the cookie.", "@a2_vic Try again. Slower. And stop saying please."]);
    const i = await RP.choose(["Try again", "Take a breath"]);
    if (i === 1) { await RP.say("I breathe. Vic taps his watch. The watch has no hands. It's an attitude."); }
  }
  await bookSlot(S);
}

async function bookSlot(S) {
  S.f.a2_slot = true;
  RP.followers(60);
  RP.sfx("success");
  await RP.lines([
    "@a2_vic Last Saturday of the month. Eleven to twelve-thirty. Vinyl only. Bring your own decks.",
    "@a2_vic I pay cash at the end of the night. On time. Every time. I'm the only promoter in Brooklyn who does.",
    "I've met promoters who don't.",
    "@a2_vic Everyone has. That's my brand."
  ]);
  RP.addRecord("mr_fingers_washing_machine_can_you_feel_it");
  await RP.lines([
    "@a2_vic Welcome-to-the-basement present. Mr. Fingers. \"Can You Feel It.\"",
    "Trax Records, 1986. Larry Heard produced and wrote it. One of the first deep house records.",
    "@a2_vic Don't scratch it. Scratch anything else."
  ]);
  RP.text("VIC (BASEMENT TAPES)", "last sat of the month. 11pm. vinyl. dont be early. dont be late. dont say please.");
  RP.text("DANTE (NOWHERE)", "heard ur playing basement tapes!! that's my competition lol. i'll pay u next week");
  await RP.lines([
    "A text from Dante: \"I'll pay you next week.\" Some things never change. They just get a little more expensive.",
    "I have a monthly slot. I have turntables. I have a couch, a clean pair of jeans and a crowd that knows my name. Or my wrong name."
  ]);
  await RP.say("Sunday, 5:40 AM. The sun rises over Gowanus. I decide it's rising for me.", "nar");
  await finishAct(S);
}

async function finishAct(S) {
  await RP.completeAct([
    [true, "Landed on Marcus's couch (it has a roommate in the bathroom)"],
    [!!S.f.a2_showered, "Got clean (don't ask)"],
    [!!S.f.a2_plasma, "Sold plasma, ate the cookie"],
    [!!S.f.a2_inLoft, "Got into the Meserole loft"],
    [!!S.f.a2_loftFixed, "Fixed a dead PA"],
    [!!S.f.a2_louSecret, "Learned the secret of \"NYC 93\""],
    [!!S.f.a2_turntables, "Bought your first turntables"],
    [!!S.f.a2_slot, "Booked a monthly slot at Basement Tapes"]
  ]);
}

async function talkTwinkie(S) {
  if (S.f.a2_slot) { await RP.say("Look at us. A residency and a basement. I'm basically a venue.", "twinkie"); return; }
  if (!S.f.a2_whIntro) { await arrive(S); return; }
  if (!S.f.a2_afterDone) { await planAfters(S); return; }
  if (!S.f.a2_ttSet) { await RP.say(RP.has("a2_tts") ? "Decks. Booth. Now. Don't just stand there looking like a guy with a box." : "Decks. Where are your decks? Eddie's open till three. It might be after three. Hustle.", "twinkie"); return; }
  await RP.say("You're up, DJ. Don't look at Vic. He can smell it.", "twinkie");
}

async function talkVic(S) {
  if (!S.f.a2_vicIn) return ["Vic isn't here. The basement just thinks he is."];
  await RP.say("We're talking, right? You're going to say something I hate. Go.", "a2_vic");
  await pitchVic(S);
}

RP.room({
  id: "a2_warehouse", act: 2, name: "Basement Tapes",
  paint,
  cacheKey: S => (lit(S) ? "l" : "d") + (S.f.a2_ttSet ? "t" : ""),
  lightKey: S => (crowdOn(S) ? "c" : lit(S) ? "l" : "d"),
  light,
  ambience: S => crowdOn(S) ? "crowd" : "room",
  music: S => crowdOn(S) ? { genre: "house", bpm: 122, volume: 0.45, energy: 4 } : null,
  walk: [[8, 204], [632, 204], [632, 252], [8, 252]],
  start: { x: 70, y: 232, face: "right" },
  update: A2.update,
  fx: [
    { type: "haze", rect: [40, 90, 560, 110], color: "#b8a8ff", density: 2, on: () => crowdOn(RP.state) },
    { type: "beams", origins: [[240, 46], [300, 46], [360, 46], [420, 46], [480, 46]], colors: ["#ff3fa4", "#39d0ff", "#ffd23f", "#a05cff", "#5cff9a"], base: Math.PI / 2, swing: 0.5, len: 170, width: 14, alpha: 0.14, period: 1400, on: () => crowdOn(RP.state) },
    { type: "dust", rect: [40, 40, 540, 150], count: 26, color: "#fff4d6", on: () => !crowdOn(RP.state) },
    { type: "steam", x: 440, y: 236, rise: 30, size: 8, drift: 4, color: "#8a86a0" }
  ],
  actors: S => [
    { id: "twinkie", char: "twinkie", x: 300, y: 232, face: "right", act: "stand", name: "Twinkie" },
    { id: "a2_vic", char: "a2_vic", x: 590, y: 226, face: "left", act: "stand", name: "Vic", vis: S2 => !!S2.f.a2_vicIn },
    { id: "marcus", char: "marcus", x: 520, y: 238, face: "left", act: "dance", name: "Marcus", vis: S2 => !!S2.f.a2_afterDone },
    { id: "a2_dani", char: "a2_dani", x: 110, y: 214, face: "right", act: "stand", name: "Dani", vis: S2 => !!S2.f.a2_afterDone },
    { id: "a2_moxie", char: "a2_moxie", x: 200, y: 232, face: "right", act: "dance", name: "Moxie", vis: S2 => !!S2.f.a2_afterDone },
    { crowd: { n: 16, rect: [70, 204, 480, 46], seed: 91, face: "front", act: "dance", scale: 0.95, vis: S2 => !!S2.f.a2_afterDone } }
  ],
  sprites: [
    { y: 168, draw: (c, S) => drawBar(c, S) },
    { y: 176, draw: (c, S) => drawTapes(c, S) }
  ],
  enter: async (S, from) => {
    if (!S.f.a2_whIntro) await arrive(S);
  },
  hotspots: [
    { id: "a2_whdoor", name: "back door", r: [2, 40, 56, 132], z: 20, walk: [70, 232, "left"], exit: "travel", look: "The back door to the basement: a chain, a padlock Twinkie has the key to, and a smell of ambition. Beyond it: Gowanus, a canal and the sunrise.", push: "I'm already inside. This is the wrong direction for pushing." },
    { id: "a2_whsign", name: "painted sign", r: [196, 34, 330, 40], z: 14, walk: [360, 208, "back"], look: "A faded wall sign: TRI-STATE TAPE & DUPLICATION. WE COPY ANYTHING (LEGALLY). Lou said he got his demos duplicated here in 1993. This room has heard \"NYC 93\" before. It's the first place that might remember.", use: "I can't edit a wall sign. I can only read it and feel old." },
    { id: "a2_whneon", name: "BASEMENT TAPES neon", r: [238, 78, 160, 30], z: 22, walk: [360, 208, "back"], look: S => lit(S) ? "A neon: BASEMENT TAPES. Cyan and pink. Whoever installed it did it twice, so it would last." : "A dark sign over the stage that says BASEMENT TAPES in cold, unlit glass. It's waiting.", use: "It has no switch. It has a breaker. And a conscience." },
    { id: "a2_whrules", name: "house rules", r: [128, 74, 82, 34], z: 22, walk: [170, 208, "back"], look: "HOUSE RULES: NO CAMERAS. NO COVER BANDS. NO \"CAN YOU PLAY SOMETHING I KNOW.\" Underneath, in pencil: \"VINYL ONLY. BRING YOUR OWN TURNTABLES.\" That last rule is mine now.", pickup: "It's painted on. Vic would find me." },
    { id: "a2_whtapes", name: "cassette wall", r: [8, 44, 72, 108], z: 20, walk: [44, 214, "back"], look: "A wall of old cassettes, labeled MASTERS. Hundreds of copies of things that were important to somebody once. I can feel them all not being played.", pickup: "Hundreds of cassettes. I'd take one. But which? So many people's one chance.", use: "I don't have a cassette deck. I have regrets." },
    { id: "a2_whbar", name: "drum bar", r: [22, 138, 110, 62], z: 24, walk: [76, 212, "back"], look: "A bar made of two blue oil drums and a plank, with a cash box and a sign: \"CASH ONLY.\" The cash box has a rubber band around it. Vic's.", use: "I'd pour a drink, but it's Vic's. And he's the type to count the ice.", pickup: "Not touching Vic's cash box. Not even to look at it." },
    { id: "a2_whpa", name: "PA stacks", rects: [[206, 64, 48, 96], [466, 64, 48, 96]], z: 28, walk: [250, 212, "back"], look: S => crowdOn(S) ? "Two PA stacks, wired in by Moxie and Jess's amp. It sounds like the ground is shaking. The floor is." : "Two PA stacks, silent. They look like they've been waiting for a party.", pickup: "Not in a thousand years.", push: "They don't budge. They've seen a thousand parties." },
    { id: "a2_whbooth", name: "DJ booth", r: [262, 74, 198, 96], z: 30, walk: [360, 208, "back"], look: S => S.f.a2_ttSet ? "The booth, with my two turntables on it. The AT-LP120-USBs look small on a stage this big. They're mine." : "An empty trestle table with cables and two cardboard boxes. The booth is waiting for a pair of turntables.",
      use: S => S.f.a2_ttSet ? "My turntables. My basement. Vic's basement." : setupDecks(S), open: S => setupDecks(S), push: "It's a booth. A booth with a destiny." },
    { id: "a2_whfreight", name: "freight gate", r: [536, 42, 68, 134], z: 20, walk: [570, 212, "back"], look: "A steel freight gate, folded like an accordion, with a sign: FREIGHT. It rolls up with a sound like a train being born.", use: "It's locked from the inside. Possibly by Vic's pride.", open: "It rolls up when Vic wants it to." },
    { id: "a2_whtape", name: "tape duplicator", r: [162, 148, 42, 28], z: 24, walk: [186, 210, "back"], look: "A relic from the cassette-duplicating days: reels, a motor and a look of mild disappointment. It copied the nineties. Now it's furniture.", use: "I wouldn't know how to use it. And it wouldn't want me to.", pickup: "It's too heavy. And it's a ghost." },
    { id: "a2_whpillars", name: "concrete pillars", rects: [[84, 30, 28, 142], [230, 30, 28, 142], [476, 30, 28, 142], [608, 30, 28, 142]], z: 10, walk: [300, 208, "back"], look: "Concrete pillars, each painted with a yellow number: 1, 2, 3, 4. Somebody's counting down.", push: "It's holding up Gowanus. Not pushing it." },
    { id: "a2_whpipes", name: "pipes", r: [0, 8, 640, 26], z: 8, walk: [320, 208, "back"], look: "Pipes along the ceiling: steam, water, mystery. One of them drips on the dance floor every four seconds, in tempo.", use: "I can't reach the pipes. I couldn't fix them if I could." },
    { id: "twinkie", name: "Twinkie", z: 80, look: "Twinkie: lavender bob, shades, a coat of calm. Holds the key to a basement she doesn't technically own.", talk: S => talkTwinkie(S) },
    { id: "a2_vic", name: "Vic", z: 80, look: "Vic: leather jacket, ponytail, mustache, sunglasses at five in the morning. He's glaring at the room as if it owes him rent.", talk: S => talkVic(S), give: async (S, item) => { if (item === "a2_flyer") return ["@a2_vic That's my flyer. I know it's my flyer. I print them."]; if (item === "white") return ["@a2_vic Keep it. Play it. Don't show me. Show the room."]; return ["@a2_vic Don't hand me things. Hand me a reason."]; } },
    { id: "marcus", name: "Marcus", z: 80, look: "Marcus: dancing with two friends, plus three. They're all wearing party hats. At five in the morning. It's the best he's ever looked.", talk: async S => { await RP.lines(["@marcus I brought plus seven. I couldn't help it. It's a calling."]); } },
    { id: "a2_dani", name: "Dani", z: 80, look: "Dani, still in her apron, holding a stack of plastic cups she definitely stole from the loft.", talk: async S => { await RP.lines(["@a2_dani Don't thank me. Just tell Fitz I covered my tab. He doesn't believe in me."]); } },
    { id: "a2_moxie", name: "Moxie", z: 80, look: "Moxie, dancing hard, vest flapping. She brought a PA. She's the reason there is sound.", talk: async S => { await RP.lines(["@a2_moxie THE PA'S IN A VAN. THE VAN'S IN A BASEMENT. THE BASEMENT'S ILLEGAL. I LOVE THIS."]); } }
  ],
  combos: [
    ["a2_tts", "a2_whbooth", S => setupDecks(RP.state)],
    ["a2_tts", "a2_whpa", S => setupDecks(RP.state)],
    ["a2_tts", "twinkie", ["@twinkie Don't give those to me. Give them to the booth."]],
    ["white", "a2_whbooth", "Not yet. First the decks. Then the record. In that order, like a recipe."],
    ["a2_flyer", "a2_vic", ["@a2_vic That's my flyer. I know it's my flyer. I print them."]],
    ["usb_cat", "a2_whbooth", "A cat on a vinyl-only booth? That's a quick way to be asked to leave."],
    ["phone", "twinkie", "I could text Twinkie. She's four feet away. We'd both laugh."]
  ]
});
})();
