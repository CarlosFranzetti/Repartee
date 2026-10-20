/* Act 3 — Apartment 4C, six months later. Your home base: the rig changes as the gear arrives.
   Flags used: a3_usbTaken, a3_bagTaken, a3_thu3 (it's Thursday again), a3_promo, a3_end, a3_aptSeen,
   a3_lampOff. Gear is read from S.gear (decks/turntables/mixer/monitors) so the room restyles itself. */
(function () {
"use strict";
const RP = window.RP;
const A3 = RP.A3;
const U = RP.u;
const PK = RP.PK;
const { R, P, ell, txt, txtC, txtW, bayer, mulberry } = U;
const W = 640;

/* ---- state helpers ---- */
const mood = S => S.f.a3_end ? "dawn" : (!S.f.a3_opener || S.f.a3_thu3) ? "dusk" : "night";
const gearSig = S => [S.gear.decks, S.gear.turntables, S.gear.mixer, S.gear.monitors].join("|");
const isCdj900 = S => S.gear.decks === "pioneer_cdj_900";
const deckName = S => { const g = RP.gearInfo(S.gear.decks); return g ? g.brand + " " + g.model + "s" : "decks"; };
const isTechnics = S => S.gear.turntables === "technics_sl_1210mk2";
const isDyn = S => S.gear.monitors === "dynaudio_bm5_mkiii";
const isDjm = S => S.gear.mixer === "pioneer_djm_350";
const gearName = id => { const g = RP.gearInfo(id); return g ? g.brand + " " + g.model : id; };

/* ---- paint ---- */
function paint(c, S) {
  const m = mood(S), em = [];
  const night = m !== "dusk";
  // wall + floor
  PK.plaster(c, 0, 0, W, 168, { base: night ? "#8a7290" : "#9a7e92", patches: 3, stains: 2, cracks: 1, seed: 301 });
  PK.planks(c, 0, 168, W, 88, { base: "#8a5a3e", seed: 302 });
  PK.baseboard(c, 0, 160, W, { color: "#5a4058", h: 9, seed: 303 });
  // door (left)
  PK.door(c, 6, 34, 46, 130, { color: "#6a4a5e", number: "4C", knob: true, peephole: true, seed: 304 });
  R(c, 6, 163, 46, 3, "#ffcf7a");           // hallway light under the door
  em.push([6, 163, 46, 3]);
  // bed with window above
  PK.bed(c, 60, 106, 156, { color: "#6b35a0", sheet: "#d8d2e8", seed: 305 });
  // record shelf above the bed
  PK.shelf(c, 70, 30, 112, 52, { items: "records", wood: "#7a4a32", seed: 306 });
  // flyer: Halcyon Thursday (name spelled wrong, naturally)
  PK.poster(c, 188, 34, 34, 50, { palette: "neon", title: "HALCYON", titleLines: ["HALCYON"], lines: ["THURS", A3.billed(S).slice(0, 9)], seed: 307 });
  // window, radiator, pipe hole
  em.push.apply(em, PK.window(c, 232, 28, 108, 94, { view: "city", time: m === "dawn" ? "dawn" : m === "dusk" ? "dusk" : "night", bridge: true, seed: 308 }));
  PK.radiator(c, 238, 134, 74, 30, { color: "#c8c2d4" });
  R(c, 318, 146, 14, 3, "#a8a2b8"); R(c, 318, 146, 14, 1, "#c8c2d4"); R(c, 329, 132, 3, 17, "#a8a2b8"); R(c, 329, 132, 1, 17, "#c8c2d4");
  ell(c, 331, 130, 6, 5, "#5e4a5e"); ell(c, 331, 130, 4, 4, "#140c18");
  [[326, 126], [336, 127], [327, 134], [335, 135], [331, 124]].forEach(([x, y]) => P(c, x, y, "#5e4a5e"));
  // monitor shelf above the rig
  R(c, 344, 96, 296, 4, "#7a4a32"); R(c, 344, 96, 296, 1, "#b47a56"); R(c, 344, 99, 296, 1, "#4a2a20");
  [358, 600].forEach(bx => { R(c, bx, 100, 3, 6, "#4a4658"); R(c, bx + 14, 100, 3, 6, "#4a4658"); });
  PK.monitors(c, 354, 52, { krk: !isDyn(S), w: 26, h: 44 });
  PK.monitors(c, 594, 52, { krk: !isDyn(S), w: 26, h: 44 });
  // LED strip under the shelf
  R(c, 380, 100, 212, 1, "#a05cff"); em.push([380, 100, 212, 1]);
  PK.neon(c, "NOWHERE", 436, 66, "#ff3fa4", { scale: 2, tube: 2, glow: true, strength: 0.9, off: [] }).forEach(r => em.push(r));
  // desk
  PK.desk(c, 340, 142, 300, 54, { wood: "#7a4a32", top: "#9a6244", seed: 309 });
  // the rig: 4 decks around the mixer
  const rigY = 142 - 31;
  em.push.apply(em, PK.turntable(c, 342, rigY, { model: isTechnics(S) ? "technics" : "budget", label: "#39d0ff", seed: 11 }));
  em.push.apply(em, PK.cdj(c, 415, rigY + 1, { tier: isCdj900(S) ? 2 : 1, seed: 12 }));
  em.push.apply(em, PK.mixer(c, 470, rigY + 1, { channels: 2, seed: 13 }));
  em.push.apply(em, PK.cdj(c, 513, rigY + 1, { tier: isCdj900(S) ? 2 : 1, seed: 14 }));
  em.push.apply(em, PK.turntable(c, 568, rigY, { model: isTechnics(S) ? "technics" : "budget", label: "#ff3fa4", seed: 15 }));
  txt(c, isDjm(S) ? "DJM-350" : "M101USB", 476, rigY + 26, "#8a86a0");
  // laptop on the bed + USB
  em.push.apply(em, PK.laptop(c, 156, 102, { on: true, w: 32, h: 22, seed: 16 }));
  if (!S.f.a3_usbTaken) { R(c, 190, 118, 8, 4, "#39d0ff"); R(c, 197, 119, 3, 2, "#c8c4d8"); R(c, 191, 119, 3, 2, "#efeaf6"); }
  // framed Mr. Whiskers on the wall by the door
  PK.frame(c, 60, 56, 24, 30, { palette: ["#e8c8a0", "#c8905a", "#f2a0c8", "#fff0d8"], kind: "portrait", seed: 317 });
  // clock: it is always something p.m. in here
  PK.clock(c, 202, 100, { d: 18, hour: 4, min: 10 });
  // rug
  PK.rug(c, 232, 224, 170, 26, { colors: ["#5b2e8c", "#e0368f", "#7a3fb0"] });
  // bulb on a cord
  em.push.apply(em, PK.bulb(c, 300, 0, { len: 24, on: night, glowR: 30 }));
  return em;
}

const crateSprite = A3.sprite("a3_apt_crate_a", 44, 56, c => PK.crate(c, 4, 4, { w: 36, h: 28, seed: 21 }));
const crateSprite2 = A3.sprite("a3_apt_crate_b", 44, 56, c => PK.crate(c, 4, 4, { w: 36, h: 28, color: "#c0302c", seed: 22 }));
const plantSprite = A3.sprite("a3_apt_plant", 60, 56, c => PK.plant(c, 6, 4, { size: 2, seed: 23 }));
const bagSprite = A3.sprite("a3_apt_bag", 40, 32, c => { R(c, 4, 8, 30, 20, "#5a3a2a"); R(c, 4, 8, 30, 2, "#8a5a3e"); R(c, 4, 26, 30, 2, "#2a1a12"); R(c, 6, 2, 3, 8, "#3a2418"); R(c, 28, 2, 3, 8, "#3a2418"); R(c, 6, 2, 25, 3, "#3a2418"); R(c, 12, 14, 14, 6, "#8a5a3e"); R(c, 14, 16, 10, 2, "#c0a070"); });

/* ---- light ---- */
function light(S) {
  const m = mood(S);
  if (m === "dusk") return { ambient: "#9a7a9e", lights: [{ box: [232, 28, 108, 94], r: 220, color: "#ffb078", steps: 4, sy: 1 }, { x: 300, y: 38, r: 200, color: "#ffe2c0", steps: 3, power: 0.55 }],
    key: { x: 286, y: 70 }, rims: [{ x: 286, y: 80, r: 220, color: "#ffb078" }], halos: [{ x: 300, y: 33, r: 22, color: "#ffb060", strength: 0.8 }], shadow: 0.5 };
  if (m === "dawn") return { ambient: "#5a6a9a", lights: [{ box: [232, 28, 108, 94], r: 160, color: "#8ac0ff", steps: 3, sy: 1 }, { box: [6, 163, 46, 4], r: 50, color: "#ffcf7a", steps: 2, power: 0.6 }],
    key: { x: 286, y: 70 }, rims: [{ x: 286, y: 80, r: 240, color: "#8ac0ff" }], shadow: 0.55 };
  const on = !S.f.a3_lampOff;
  return { ambient: on ? "#58488e" : "#403870",
    lights: [].concat(on ? [{ x: 300, y: 36, r: 260, color: "#ffe2c0", steps: 5, sy: 1.25 }] : [], [{ box: [232, 28, 108, 94], r: 70, color: "#6f66b8", steps: 2 }, { x: 490, y: 90, r: 170, color: "#a05cff", steps: 3, power: 0.55 }, { box: [6, 163, 46, 4], r: 40, color: "#ffcf7a", steps: 2, power: 0.6 }]),
    halos: on ? [{ x: 300, y: 33, r: 22, color: "#ffb060", strength: 1 }] : [], rims: [{ x: 300, y: 80, r: 200, color: "#8f86e0" }], shadow: 0.6 };
}

/* ---- little scenes ---- */
async function sleepNow(S) {
  if (S.f.a3_end) { await RP.say("I just got here. The bed and I are about to have a very serious conversation."); return; }
  if (!S.f.a3_opener) { await RP.say("It's four in the afternoon and I have a gig tonight. Naps are for people with Fridays."); return; }
  if (S.f.a3_thu3) { await RP.say("It's Thursday. Anniversary night. Sleeping now would be a very expensive nap."); return; }
  const left = A3.todoLeft(S);
  if (left.length) {
    await RP.say("Not yet. Odessa's napkin still says:");
    for (const l of left) await RP.say("- " + l + ".");
    return;
  }
  await RP.walkTo(120, 214, "back");
  await RP.say("Everything on the napkin has a check mark. Weird. I'm suspicious of how good this feels.");
  await RP.fadeTo(1, 900);
  S.f.a3_thu3 = true; S.f.noTravel = false;
  RP.setClock("THU 5:40 PM"); RP.relight();
  await RP.say("Thursday. Anniversary night.", "nar");
  RP.text("ODESSA", "Six months tonight. Kosmo's in. Doors 9. Do NOT be late. Do NOT make me regret the napkin.");
  RP.text("MARCUS", "plus 3 right??? it's your ANNIVERSARY");
  await RP.fadeTo(0, 900);
  await RP.lines(["Six months. Half a year of Thursdays.", "Bag. USB. Don't forget the USB. Lou will never let me live it down."]);
}

async function pickBag(S) {
  if (RP.has("a3_bag")) return "I'm wearing it. Basically. It weighs more than my phone and my dignity.";
  RP.give("a3_bag"); S.f.a3_bagTaken = true;
  await RP.lines(["Records in. Slipmat in. Spare needle... that's for the other kind of turntable. Out.", "A DJ with a bag. That's the whole outfit."]);
}

async function loulines(S) {
  if (!S.f.a3_opener) {
    await RP.lines(["Hey, Lou.", "@a3_lou KID. You're leaving. Where's the racket going this time?", "The Halcyon Room, Lou. It's a residency.", "@a3_lou A residency. In my day we just called that 'going out every Saturday, 1993.'", "@a3_lou Wear a jacket. Clubs are cold."]);
    return;
  }
  if (S.f.a3_thu3) {
    await RP.lines(["Lou? Anniversary night.", "@a3_lou Six months. I counted. Every Thursday through the pipe hole, like Christmas.", "@a3_lou Play my 1993, kid. On the wax. Computers lie.", "He's not wrong. He's never been wrong about computers. Or anything else computers-adjacent."]);
    return;
  }
  if (S.f.a3_estateDone) {
    await RP.lines(["Lou, I got a pair of Technics.", "@a3_lou Twelve-tens? Satin black? I carried a pair up four flights in '93.", "@a3_lou My back has a LOT to say about that story. Go on, play me something."]);
    return;
  }
  await RP.lines(["Lou, you there?", "@a3_lou Where else would I be. Your music's the only thing that happens in this building.", "@a3_lou Quiet week? Odessa's napkin? I heard that thing's got a deadline.", "He hears everything. The pipe hole works both ways."]);
}

async function endScene(S) {
  S.f.a3_end = true;
  RP.setClock("FRI 5:12 AM");
  RP.actor("kid").face = "front";
  await RP.lines([
    "@nar Friday, 5:12 AM.",
    "Home. Every record. Zero dollars. Phone at 3%. I'm counting that as a win.",
    "@a3_lou ...Kid? Is that you? It's five in the morning.",
    "I know, Lou.",
    "@a3_lou Did you play my 1993?",
    "I played your 1993, Lou.",
    "@a3_lou ...Good. Go to bed."
  ]);
  RP.sfx("ping");
  await RP.phone([
    { from: "ROSALIND AUBRY (EMAIL)", text: "Subject: Booking enquiry. Hello! A friend sent me a clip from the Halcyon Room. We're Aubry & Dahl Artists, in Amsterdam. We'd love to talk about a European run. Are you free for a call? Best, R. Aubry", hot: true },
    { from: "ODESSA", text: "Saturday. 11 PM. Main floor. Don't be late. -O", hot: true },
    { from: "MARCUS", text: "SATURDAY??? plus 3. plus 4. plus however many Amsterdam is" }
  ]);
  await RP.lines(["Amsterdam. An actual booking agent. In an actual other country.", "Saturday at the Halcyon Room. And now a continent.", "I'm going to sleep for a week. Right after I read that email four more times."]);
  S.f.a3_email = true;
  await RP.completeAct([
    [true, "Opened an empty floor on Thursday"], [!!S.f.a3_cdj, "Bought used " + deckName(S) + " from Eddie"], [!!S.f.a3_dj350, "Got the DJM-350 from Gus (for a pickle)"],
    [!!S.f.a3_estateDone, "Dug the Pruitt estate: Technics 1210s and a grail"], [!!S.f.a3_promo, "Built a following"], [!!S.f.a3_brandonDone, "Outmanoeuvred DJ Brandon Shine"],
    [!!S.f.a3_kosmoDone, "Followed Kosmo Delacroix (he called you " + A3.KOSMO_NAME + ")"], [!!S.f.a3_setDone, "Played the anniversary set"], [!!S.f.a3_train, "Got home on the last train"], [!!S.f.a3_saturday, "Earned the Saturday slot"]
  ]);
}

/* ---- room ---- */
RP.room({
  id: "a3_apartment", act: 3, name: "Apartment 4C",
  paint, light,
  cacheKey: S => [mood(S), gearSig(S), S.f.a3_usbTaken ? "u" : "", S.name].join("|"),
  lightKey: S => mood(S) + (S.f.a3_lampOff ? "off" : "on"),
  ambience: S => "room",
  music: null,
  walk: [[8, 204], [630, 204], [630, 252], [8, 252]],
  start: { x: 300, y: 230, face: "front" },
  fx: [{ type: "dust", rect: [232, 40, 120, 110], count: 20, color: "#ffe2c0", on: () => mood(RP.state) !== "night" || true },
    { type: "blink", items: [{ r: [498, 123, 2, 1], color: "#3fd07a", rate: 600 }, { r: [501, 123, 2, 1], color: "#ff4a4a", rate: 900, phase: 1 }, { r: [419, 115, 2, 1], color: "#ff9a3f", rate: 420 }, { r: [517, 115, 2, 1], color: "#ff9a3f", rate: 420, phase: 1 }] }],
  sprites: [
    { y: 228, draw: c => crateSprite(c, 246, 188) },
    { y: 238, draw: c => crateSprite2(c, 292, 200) },
    { y: 212, draw: c => plantSprite(c, 214, 166) },
    { y: 233, vis: S => !RP.has("a3_bag") && !S.f.a3_bagTaken, draw: c => bagSprite(c, 340, 214) }
  ],
  enter: async (S, from) => {
    if (S.f.a3_train && !S.f.a3_end) { await endScene(S); return; }
  },
  hotspots: [
    { id: "a3_door", name: "door", r: [4, 32, 50, 134], z: 20, walk: [64, 214, "left"],
      look: "4C. Kowalski's deadbolt from last fall. This time I have a key. It still feels like a privilege.",
      exit: S => {
        if (S.f.a3_end) return "It's five in the morning. The only place I'm going is horizontal.";
        if (!S.f.a3_opener || S.f.a3_thu3) {
          if (!RP.has("a3_bag")) return "I'm not walking into a club empty-handed. Where's my record bag?";
          if (!RP.has("a3_usb")) return "My tracks USB. I'd forget my head, so I keep a checklist. It says USB.";
        }
        return "travel";
      },
      pull: "It's not stuck. It's a pull door and a push door. The landlord knows which.", push: "I'll use the door like a normal person.", talk: "Door, you and me. Six months. We make a good team." },
    { id: "a3_bed", name: "bed", r: [58, 104, 158, 66], z: 30, walk: [118, 214, "back"],
      look: "Still the bed. Now with a bag of records under it instead of a warped one.",
      use: S => sleepNow(S), pull: S => sleepNow(S), pickup: "It's bolted to the building. In my head.", push: "It's against the wall. That's where beds go." },
    { id: "a3_laptop", name: "laptop", r: [152, 98, 38, 28], z: 47, walk: [168, 214, "back"],
      look: S => S.f.a3_promo ? "Posted, tagged, hashtagged. My thumbs have blisters and my ex has muted me." : "Every track I own, backed up twice. The other backup is a cloud I don't remember signing up for.",
      use: async S => {
        if (!S.f.a3_opener) return "No time to edit. The vinyl hour needs records, the second hour needs the USB. That's it.";
        if (S.f.a3_promo) return "I've posted enough this week. The algorithm needs a break from me.";
        await RP.say("Time to be a person on the internet. A week of posting, practicing and digging. How do I split it?");
        const res = await A3.mg("getFollowers", { days: 7, start: S.followers, goal: 900, difficulty: 2 }, {
          giveUp: "Not now", onFail: async () => { await RP.lines(["The algorithm ate my week.", "Marcus 'plus-three'd' a few friends into following. It's something."]); },
          assist: async () => { await RP.say("Fine. I'll take the pity follows."); } });
        if (res.giveUp) return;
        const gained = Math.max(60, Math.round(res.gained != null ? res.gained : (res.score || 60) * 5));
        S.f.a3_promo = true;
        RP.followers(gained);
        await RP.lines(["Week's up. The numbers say " + S.followers.toLocaleString("en-US") + " fans.", "Odessa will like that number. She likes numbers. She calls them 'bodies.'"]);
        RP.text("ODESSA", "Saw the numbers. Bodies, good. -O");
      },
      pickup: "It's safer on the bed. Everything is safer on the bed.", open: "It's already open. It doesn't close all the way anymore.", close: "If I close it, I'll never find the cursor again." },
    { id: "a3_usb", name: "USB stick", r: [186, 114, 18, 12], z: 60, vis: S => !S.f.a3_usbTaken, walk: [180, 214, "back"],
      look: "My tracks USB, plugged into the laptop. A brand-new one. Zero cat photos. Jess has the cat.",
      pickup: async S => { S.f.a3_usbTaken = true; RP.give("a3_usb"); RP.relight(); await RP.say("Got it. Sixteen gigs of tracks and zero cat."); } },
    { id: "a3_window", name: "window", r: [226, 24, 120, 106], z: 20, walk: [284, 214, "back"],
      look: S => mood(S) === "dawn" ? "Bushwick at dawn. A guy in a bathrobe is walking an enormous dog. Nobody has told him it's too early." : mood(S) === "dusk" ? "Bushwick at golden hour. A pigeon is giving another pigeon a very hard time." : "Bushwick at night. Somewhere out there, a promoter is lying to a DJ.",
      open: "It's stuck. It's been stuck since 2019, in a solid-state kind of way.", close: "It's already as closed as it gets." },
    { id: "a3_radiator", name: "radiator", r: [234, 132, 84, 36], z: 25, walk: [284, 214, "back"],
      look: "It clanks all winter and does nothing in spring. The pipe goes into Lou's place like a very loud telephone.", use: "It's April. The landlord will turn it on in December. Allegedly.", push: "It's bolted to the building. The building wins." },
    { id: "a3_hole", name: "hole in the wall", r: [320, 122, 22, 30], z: 32, walk: [330, 214, "back"],
      look: "A gap around the radiator pipe. It goes into 4B. I can hear Lou's TV, and Lou can hear everything.",
      talk: S => loulines(S), use: "It's a hole. It's for talking to Lou, and for nothing else.",
      give: async (S, item) => { if (item === "a3_chips") return "Lou doesn't need chips. Lou needs a better remote."; return "Lou doesn't want that. Lou wants quiet."; } },
    { id: "a3_cdjs", name: "CDJs", rects: [[414, 110, 54, 34], [512, 110, 54, 34]], z: 30, walk: [492, 214, "back"],
      look: S => isCdj900(S) ? "Pioneer CDJ-900s, used, from Eddie. Launched in 2009 next to the CDJ-2000. They read USBs and they've never once judged me." : S.f.a3_cdj ? "A pair of " + deckName(S) + ", used, from Eddie. Not the 900s, but they're mine and they play." : "A pair of " + deckName(S) + ". Entry-level, used, loyal. They've been with me since the bedroom.",
      use: S => S.f.a3_opener ? "Practice time. A few mixes, loud, and Lou stays quiet. Progress." : "I've got a gig. The decks can wait; the booth has better ones.",
      push: "Please don't touch the jog wheel. It's got feelings.", pickup: "I'm not carrying those up and down. The club has house gear." },
    { id: "a3_tt", name: "turntables", rects: [[340, 108, 72, 36], [566, 108, 72, 36]], z: 30, walk: [492, 214, "back"],
      look: S => isTechnics(S) ? "Technics SL-1210MK2. Satin black, quartz-locked, built like a tank. They belonged to Hal Pruitt, and now they belong to my bad habits." : (S.gear.turntables === "numark_tt1650" ? "Numark TT1650s. My first pair. Budget direct-drive, bought from a man who calls himself Two-Times. They hold pitch. Mostly." : "Audio-Technica AT-LP120-USB. My first pair. Introduced in 2009, aimed at people who couldn't afford the real thing. Me."),
      use: S => isTechnics(S) ? "I put a record on and tweak the pitch. The slider has a 'heft.' Lou's wall does a drumroll." : "I put a record on. It sounds fine. I just want the other ones.",
      push: "I'm not touching that. Platters get angry.", pickup: "Those weigh a lot, and I only carry things that are emotionally heavy." },
    { id: "a3_mixer", name: "mixer", r: [468, 110, 44, 34], z: 31, walk: [492, 214, "back"],
      look: S => isDjm(S) ? "Pioneer DJM-350. Budget two-channel, launched alongside the CDJ-350. Two channels, zero crackle, zero vodka." : "Numark M101 USB. Two channels. Channel 2 still smells faintly of vodka.",
      use: "I give the crossfader a little wiggle. It wiggles back.", push: "Pushing faders is how I got here.", pull: "Pulling faders is how I got here." },
    { id: "a3_monitors", name: "monitors", rects: [[352, 50, 30, 48], [592, 50, 30, 48]], z: 27, walk: [492, 214, "back"],
      look: S => isDyn(S) ? "Dynaudio BM5 mkIII. In production since 2014, says the company. They make my records sound like I paid more." : "KRK Rokits with the yellow cones. All treble, no rent money.",
      use: "Turn it up? Lou's pipe-hole and I have an agreement. It has a number, and the number is low.", pickup: "They're on the shelf. They're staying on the shelf." },
    { id: "a3_desk", name: "desk", r: [338, 140, 304, 58], z: 15, walk: [492, 214, "back"], look: "Flat-pack desk. Assembled with seven screws left over. Still holding four decks. Mostly." },
    { id: "a3_shelf", name: "record shelf", r: [68, 28, 116, 56], z: 20, walk: [118, 214, "back"],
      look: "My records, the ones that live at home: the rest are in the bag. The bag is the real collection. The shelf is the pretty one.", pickup: "They're in alphabetical order. By mood. It took me two years.", use: "I could reorganize it. I could also not do that." },
    { id: "a3_flyer", name: "Halcyon flyer", r: [186, 32, 38, 54], z: 21, walk: [200, 214, "back"],
      look: S => "\"HALCYON ROOM. THURSDAYS. " + A3.billed(S) + ".\" Odessa's flyer guy got my name wrong again. I think it's on purpose.", pickup: "It's the only decor I've paid for in blood." },
    { id: "a3_whiskers", name: "photo", r: [58, 54, 28, 34], z: 21, walk: [70, 214, "back"],
      look: "Mr. Whiskers, framed. Jess gave me the cat photos. I kept one. For legal reasons it's now called 'art.'", talk: "Hey, Mr. Whiskers. Jess says hi. No she doesn't." },
    { id: "a3_crate", name: "record crate", rects: [[244, 188, 42, 44], [290, 200, 42, 42]], z: 50, walk: [270, 244, "back"],
      look: "Two milk crates of records. The good stuff is in the bag. These are the ones I'd take if the building burned.",
      pickup: S => pickBag(S), open: S => pickBag(S), use: S => RP.has("a3_bag") ? "Already packed." : pickBag(S) },
    { id: "a3_bag", name: "record bag", r: [338, 212, 38, 28], z: 55, vis: S => !RP.has("a3_bag") && !S.f.a3_bagTaken, walk: [346, 244, "back"],
      look: "My record bag, canvas, unwashed since the bedroom. It smells like a cellar.", pickup: S => pickBag(S), open: S => pickBag(S) },
    { id: "a3_plant", name: "plant", r: [212, 164, 48, 50], z: 52, walk: [262, 214, "left"], look: "That's Gerald. He's seen things. Now he's seen a residency.", talk: "Gerald. You made it. We made it.", use: "I water him on holidays. Gerald loves holidays.", pickup: "Gerald stays where the light is. It's his whole thing." },
    { id: "a3_bulb", name: "light bulb", r: [292, 0, 18, 40], z: 26, walk: [300, 214, "back"], look: "A bare bulb on a pull chain. Mood lighting, landlord edition.",
      pull: async S => { if (mood(S) !== "night") return "It's still light out. The bulb is decoration."; S.f.a3_lampOff = !S.f.a3_lampOff; RP.sfx("click"); RP.relight(); await RP.say(S.f.a3_lampOff ? "Click. Very moody. Very underground." : "Click. Light."); },
      use: S => RP.runH(RP.curRoom().def.hotspots.find(h => h.id === "a3_bulb").pull), pickup: "It's hot and it's the only one I have." },
    { id: "a3_rug", name: "rug", r: [236, 222, 164, 28], z: 8, floor: true, look: "A rug. It ties the room together. Nothing else does." }
  ],
  combos: [
    ["a3_chips", "a3_hole", "Lou doesn't need chips. Lou needs a better remote."],
    ["a3_usb", "a3_laptop", () => RP.state.f.a3_swap ? "I'm not putting that back in. It's got a certain... Brandon smell." : "It's already synced. If I plug it in again, the laptop will cry."],
    ["a3_usb", "a3_cdjs", "I'll plug it in at the club. The house CDJs are nicer, and they don't owe me any money."],
    ["a3_bag", "a3_cdjs", "The records go on turntables, not CDJs. That's the whole bag's personality."],
    ["a3_bag", "a3_tt", () => RP.state.gear.turntables === "technics_sl_1210mk2" ? "I could play a few. But Lou's pipe has opinions after nine." : (() => { const g = RP.gearInfo(RP.state.gear.turntables); return (g ? "The " + g.brand + " " + g.model + "s" : "These turntables") + ". I can play records on them. The records deserve better."; })()],
    ["a3_list", "a3_hole", "Lou doesn't read lipstick. Lou reads the paper."]
  ],
  self: { look: "Jacket, headphones round the neck. A DJ. I got the outfit before the bank balance.", talk: "I'd answer, but I'm busy being somebody with a residency." }
});
})();
