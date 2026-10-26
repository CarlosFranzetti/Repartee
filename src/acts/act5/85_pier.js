/* Act 5 — a5_pier: the end of the pier at sunrise. The afters Twinkie promised. Everyone from every level.
   Dante finally pays (in drink tickets). Lou: "Every Saturday, 1993." The kid's last line, then RP.completeAct -> the credits. */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u, PK = RP.PK, A5 = RP.a5, art = A5.art;
const { R, P, ell, line, poly, bayer, mulberry, mix, txt, txtC, txtW, clamp } = U;
const K = U.ramp;
const HL = (c, x, y, w, col) => R(c, x, y, w, 1, col), VL = (c, x, y, h, col) => R(c, x, y, 1, h, col);
const SUN = { x: 168, y: 120, r: 14 };

function paint(c, S) {
  const em = [];
  PK.sky(c, 0, 0, 640, 128, { time: "dawn", seed: 77, sun: { x: SUN.x, y: SUN.y, r: SUN.r }, clouds: 6, stars: 8 });
  /* the far shore: a low band, then the skyline on the right, a ferry crossing the sun's path */
  R(c, 0, 120, 640, 10, "#7a5a8a");
  em.push.apply(em, PK.skyline(c, 290, 52, 350, 76, { night: true, layers: 3, spire: true, spireX: 560, seed: 9 }));
  em.push.apply(em, PK.bridge(c, 330, 126, 310, { night: true, h: 34 }));
  art.water(c, 0, 128, 640, 52, { pal: ["#f4b8a0", "#c88ab8", "#6a5aa0", "#2e3a78"], seed: 11, glint: "#fff0c0", lights: [{ x: SUN.x, color: "#fff6d0", a: 1, w: 7 }, { x: SUN.x + 18, color: "#ffd8a0", a: 0.7, w: 3 }, { x: SUN.x - 20, color: "#ffd8a0", a: 0.7, w: 3 }], reflectA: 0.5 });
  em.push([0, 0, 640, 180]);
  /* a ferry crossing */
  R(c, 380, 118, 40, 5, "#241c44"); R(c, 388, 112, 24, 6, "#2e2658"); for (let i = 0; i < 6; i++) { P(c, 391 + i * 4, 114, "#ffd890"); em.push([391 + i * 4, 114, 1, 1]); } R(c, 400, 108, 3, 4, "#241c44");
  /* the pier: planks in perspective, a rope rail, posts, lamps (off at dawn), a life ring */
  PK.planks(c, 0, 178, 640, 78, { base: "#8a6444", seed: 21, plankH: 8 });
  R(c, 0, 168, 640, 12, "#4a3424"); HL(c, 0, 168, 640, "#a07a56"); HL(c, 0, 179, 640, "#14081e");
  for (let x = 6; x < 640; x += 46) { R(c, x, 138, 4, 34, "#5a4030"); VL(c, x, 138, 34, "#9a7a56"); R(c, x - 1, 136, 6, 3, "#7a5a40"); }
  for (let x = 6; x < 600; x += 46) for (let i = 0; i < 46; i++) P(c, x + 4 + i, 144 + Math.round(Math.sin(i / 46 * Math.PI) * 5), "#c8a870");
  ell(c, 466, 160, 7, 7, "#e8e4f0"); ell(c, 466, 160, 4, 4, "#14081e"); for (let i = 0; i < 4; i++) R(c, 460 + i * 4, 154, 2, 3, "#c0302c");
  PK.streetlamp(c, 40, 190, { h: 110, arm: 16, on: false });
  PK.streetlamp(c, 600, 190, { h: 110, arm: 16, on: false, flip: true });
  art.stringLights(c, 40, 82, 600, 82, { sag: 14, step: 6, colors: ["#ffd27a", "#ff9ad5", "#9fe8ff"] });
  /* the night's leftovers: confetti on the planks, cups, bunting */
  art.litter(c, 0, 186, 640, 66, 33, ["#ff3fa4", "#39d0ff", "#ffd23f", "#9be15d", "#ffffff", "#ff8a4c"]);
  /* a rolled-up Harbor Lights banner */
  R(c, 520, 232, 60, 8, "#14102e"); R(c, 520, 232, 60, 2, "#ff3fa4"); txt(c, "HARBOR LIGHTS", 524, 235, "#39d0ff", 1, 0);
  return em;
}

function drawBench(c, S) {
  PK.bench(c, 440, 188, 96, { back: true });
}
function drawCooler(c, S) {
  PK.contactShadow(c, 124, 236, 40, 5, { alpha: 0.4 });
  R(c, 130, 224, 28, 14, "#2f62b8"); R(c, 130, 224, 28, 3, "#8aa8e8"); R(c, 130, 231, 28, 1, "#e8e4f4");
  R(c, 136, 220, 10, 4, "#efeaf6"); R(c, 148, 220, 6, 4, "#c0302c");
}
function drawSign(c, S) {
  /* Marcus's sign, abandoned on the planks */
  R(c, 596, 224, 30, 16, "#c8925a"); R(c, 596, 224, 30, 1, "#e0b078"); txt(c, "+30", 602, 229, "#17131f", 1, 1); R(c, 610, 238, 2, 4, "#8a6a4a");
}

function lightMap(S) {
  return { ambient: "#c8a8c8", lights: [{ x: SUN.x, y: SUN.y, r: 600, color: "#ffc8a0", steps: 4, power: 0.7, rim: true }, { x: SUN.x, y: SUN.y, r: 240, color: "#fff0d0", steps: 3, power: 0.6 }],
    halos: [{ x: SUN.x, y: SUN.y, r: 60, color: "#ffb070", strength: 0.9 }], rims: [{ x: SUN.x, y: SUN.y, r: 700, color: "#ffc080" }], key: { x: SUN.x, y: SUN.y }, shadow: 0.55 };
}

/* ------------------------------------------------------------------------------------------ scripts */
const nm = S => A5.pName(S);
async function louTalk(S) {
  if (!S.f.a5_pLou) {
    S.f.a5_pLou = true;
    await RP.lines([
      "@lou ...I sat through the whole thing. Standing. On my feet. In the shoes.",
      "Lou, you were on stage.",
      "@lou Don't say that. I'll tell people. Then they'll ask me about it.",
      "@lou Every Saturday, 1993, I'd stand at the back of a club and hear that bar in my head. And now it's...",
      "@lou ...It's out there. It's in other people's heads. Kid. I can stop worrying about the drawer.",
      "Every Saturday. From now on, Lou.",
      "@lou Don't push it. Sundays are for sleeping."
    ]);
    return;
  }
  await RP.lines(["@lou Go watch the sun. I'm done. My knees are on strike.", "@lou ...Thank you, kid. I mean it. Don't tell anyone I said so."]);
}
async function danteTalk(S) {
  if (!S.f.a5_pDante) {
    S.f.a5_pDante = true;
    await RP.lines([
      "@dante There he is! The man! The legend! My guy! I told you.",
      "Dante. It's six in the morning.",
      "@dante It's SUNDAY. A new week. It's next week. Technically. I said next week. I'm a man of my word.",
      S.f.a5_danteOnAir ? "@dante And Dana texted me eleven times. She said \"the city heard you.\" The city heard me. So here." : "@dante So here.",
      "@dante It's all in tickets. Nowhere drink tickets. Four hundred of them. It's the whole payroll."
    ]);
    RP.give("a5_tickets"); S.f.a5_dantePaid = true; RP.sfx("cash");
    await RP.lines([
      "Four hundred drink tickets. Good for one drink each. At Nowhere. Until Nowhere closes.",
      "@dante It's a currency! It's a currency within the Nowhere economy! You drink on me for the rest of your life! Or until Tuesday.",
      "...It's the best paycheck I've ever gotten. And the worst. And the only one from you.",
      "@dante Great set, by the way. I'll book you again. Next week."
    ]);
    return;
  }
  await RP.lines(["@dante Four hundred tickets! Use them wisely! Preferably on me!"]);
}
async function simpleTalk(S, who) {
  const L = {
    marcus: ["@marcus I counted: twelve people got in. Twelve! And I got the rest of them to sing from outside. It counts.", "It counts, Marcus.", "@marcus PLUS THIRTY. It was a state of mind. It's always been a state of mind."],
    ray: ["@ray Not bad. You didn't peak early. You peaked right. That's the whole job.", "@ray The white label thing was good. Keep it for the book you're going to write.", "Is that praise, Ray?", "@ray It's a medical observation. Don't tell anyone."],
    twinkie: ["@twinkie Honey. You played it all. I remember everything, and I'm still going to remember that.", "@twinkie Sit. Watch the sun. It's the best part of the night. The rest is just the buildup."],
    eddie: ["@eddie Two-time deal! You pay once in the morning, once in the evening!", "Eddie, what's this?", "@eddie It's an invoice for introductions. Two-time. Don't worry about it. I'll take it in spirit."],
    jess: ["@jess Mr. Whiskers slept through the whole set. That's the highest compliment he gives.", S.f.a5_whiskersShout ? "@jess And you said his name. He heard. He blinked at me. Slowly." : "@jess He'd have loved a shout-out. Next time.", "@jess Thanks for letting me see this. You really did it."],
    margo: ["@a5_margoT The headline slot got four hundred thousand views before sunrise. I invoiced the sunrise.", "@a5_margoT I'm proud of you. I'm going to say it once. Then back to being a manager.", "Margo, you sound like a person."],
    kosmo: ["@kosmo " + nm(S) + ". I said it right. I'll say it right again. It's a good name. It's earned.", "Thanks, Kosmo.", "@kosmo Don't thank me. Thank the record you kept."]
  }[who];
  await RP.lines(L);
}
async function finale(S) {
  if (!S.f.a5_pLou || !S.f.a5_pDante) {
    await RP.say(!S.f.a5_pLou && !S.f.a5_pDante ? "Not yet. I should talk to Lou. And Dante. And everyone else who got me here." : !S.f.a5_pLou ? "Not yet. Lou's right there on the bench. I owe him a talk." : "Not yet. Dante's here. I have a sneaking suspicion he owes me something.");
    return;
  }
  await RP.walkTo(150, 224, "right");
  await RP.lines([
    "The sun's all the way up now. Gold across the harbor, the skyline lit from behind, the lighthouse on my poster doing its job at last.",
    "I think about the bedroom. The crackling channel two. The bag of oregano. The phone at one percent.",
    "I used to say: \"I don't own turntables. I own records. It's a whole thing.\"",
    "Now I own turntables. A mixer from Barcelona. A trailer, for about nine hours.",
    "It's still a whole thing.",
    "@lou ...Kid. Sit. You're blocking the sunrise."
  ]);
  const checks = [
    [!!S.f.a5_gearDone, "Bought the rig: Taula 4 MR, Core 47s, CDJ-3000s"],
    [!!S.f.a5_interviewDone, "Radio Harbor interview (Dante: \"next week\", live)"],
    [!!S.f.a5_guestDone, "Marcus's \"plus thirty\" handled (twelve got in)"],
    [!!S.f.a5_soundDone, "Soundcheck on the main stage"],
    [!!S.f.a5_axlDone, "Faced down Axl Vanta"],
    [!!S.f.a5_overrunDone, "Got Axl off the stage"],
    [!!S.f.a5_setDone, "Headlined Harbor Lights"],
    [!!S.f.a5_kosmoName, "Kosmo said your name right"],
    [!!S.f.a5_dantePaid, "Dante paid. In drink tickets."]
  ];
  S.f.a5_pierDone = true;
  RP.setClock("SUN 6:12 AM");
  await RP.completeAct(checks);
}

RP.room({
  id: "a5_pier", act: 5, name: "The end of the pier", paint, cacheKey: S => nm(S), light: lightMap, ambience: "street",
  music: S => null,
  walk: [[16, 190], [624, 190], [624, 252], [16, 252]],
  start: { x: 90, y: 236, face: "right" },
  fx: [{ type: "dust", rect: [0, 100, 640, 100], count: 16, color: "#ffe0c0" }, { type: "confetti", count: 30, width: 640, floor: 250, on: () => true }],
  actors: S => [
    { id: "lou", char: "lou", x: 478, y: 224, face: "left", act: "stand", name: "Lou" },
    { id: "marcus", char: "marcus", x: 590, y: 244, face: "left", act: "stand", name: "Marcus" },
    { id: "ray", char: "ray", x: 360, y: 232, face: "front", act: "stand", name: "Ray" },
    { id: "twinkie", char: "twinkie", x: 290, y: 236, face: "right", act: "stand", name: "Twinkie" },
    { id: "jess", char: "jess", x: 196, y: 238, face: "right", act: "stand", name: "Jess" },
    { id: "eddie", char: "eddie", x: 400, y: 246, face: "left", act: "stand", name: "Eddie Two-Times" },
    { id: "dante", char: "dante", x: 540, y: 240, face: "left", act: "stand", name: "Dante" },
    { id: "a5_margo", char: "a5_margo", x: 140, y: 250, face: "right", act: "phone", name: "Margo" },
    { id: "kosmo", char: "kosmo", x: 250, y: 200, face: "right", act: "stand", name: "Kosmo Delacroix" }
  ],
  sprites: [
    { y: 192, draw: art.sprite((c, S) => drawBench(c, S)) }, { y: 238, draw: art.sprite((c, S) => drawCooler(c, S)) }, { y: 242, draw: art.sprite((c, S) => drawSign(c, S)) }
  ],
  hotspots: [
    { id: "a5_psun", name: "the sunrise", r: [0, 0, 400, 180], z: 6, walk: [170, 226, "right"],
      look: ["The sun, coming up over the harbor. Pink on the water, gold on the skyline, a ferry crossing the light. It's so beautiful it should be illegal.", "I stood on the biggest stage in New York and I'd trade it for this view. Almost."],
      use: S => finale(S), talk: S => finale(S), pickup: "I can't pick up a sunrise. I've tried a lot of things this level." },
    { id: "a5_pwater", name: "the harbor", r: [0, 128, 640, 44], z: 8, walk: [300, 226, "back"], look: "Water, light, a ferry. All the lights from last night are still in there, I think. Folded into the waves." },
    { id: "a5_pskyline", name: "the skyline", r: [290, 52, 350, 76], z: 8, walk: [450, 226, "back"], look: "Manhattan, from the other side of the water, lit from behind by the dawn. I used to look at it from my window and think I'd never be on this side of the glass." },
    { id: "a5_pring", name: "life ring", r: [456, 150, 22, 22], z: 12, walk: [466, 226, "back"], look: "A life ring on a post. It's red and white. It's there for people who fall in. I should have borrowed it for Act One.", pickup: "It's for emergencies. This is just emotional." },
    { id: "a5_pbench", name: "bench", r: [436, 170, 100, 56], z: 18, walk: [486, 238, "back"], look: "A pier bench, wood-slatted, salt-bitten. Lou's got the corner. It's his bench now.", use: "Lou's on it. It's his. I'll stand.", pickup: "It's bolted down. Salt air does that." },
    { id: "a5_pbanner", name: "banner", r: [518, 230, 64, 12], z: 20, walk: [550, 246, "back"], look: "A rolled-up Harbor Lights banner, left on the planks like a flag after a war. A good war.", pickup: "Free merch! No. It's the festival's. Brian would find out." },
    { id: "a5_pcooler", name: "cooler", r: [128, 218, 32, 22], z: 22, walk: [144, 244, "back"], look: "A cooler of warm juice, a half-sandwich and a note: FOR LOU. Marcus's.", open: "Juice. Sandwich. The note. I don't touch it. It's sacred.", pickup: "It's Marcus's. It's the last of the plus-thirty supplies." },
    { id: "a5_psign", name: "\"+30\" sign", r: [594, 222, 34, 20], z: 24, walk: [610, 246, "back"], look: "A cardboard sign: +30. Abandoned on the planks. It's the funniest piece of litter I've ever seen. And the most loved.", pickup: "I think Marcus wants it back for his wedding." },
    { id: "lou", name: "Lou", talk: S => louTalk(S), look: "Lou, on a bench, in his good navy cardigan and his dancing shoes, watching the sunrise as though it were a rerun he'd forgotten he liked.", give: "Lou's holding a sleeve of a record I'd like him to keep.", pickup: "No. Lou would punish me with a lecture.", use: "Not Lou. Lou's the user." },
    { id: "dante", name: "Dante", talk: S => danteTalk(S), look: "Dante. Bomber jacket, goatee, the confidence of a man who has never once paid anyone on time and has never once been sorry.", give: (S, item) => "Dante: \"For me? You shouldn't have. I'll pay you for it. Next week.\"", pickup: "I'd rather get paid.", use: "I'd like to use Dante for a payment. That'd be new." },
    { id: "marcus", name: "Marcus", talk: S => simpleTalk(S, "marcus"), look: "Marcus, wearing a lanyard like a medal, and a tote bag. The \"+30\" sign is next to him. The man is a legend of optimism.", give: "He'd take it, and also bring thirty friends.", pickup: "No." },
    { id: "ray", name: "Ray", talk: S => simpleTalk(S, "ray"), look: "Ray, at dawn, with his arms crossed and a very small, very hidden smile. It's the closest to praise I'll ever get from him.", give: "No.", pickup: "No." },
    { id: "twinkie", name: "Twinkie", talk: S => simpleTalk(S, "twinkie"), look: "Twinkie. Still awake. Of course. She's watching the sun come up like she was told it would and is relieved it did.", give: "No.", pickup: "No." },
    { id: "eddie", name: "Eddie Two-Times", talk: S => simpleTalk(S, "eddie"), look: "Eddie Two-Times, with a receipt book in one hand and a hot dog in the other. It's a two-time hot dog.", give: "No.", pickup: "No." },
    { id: "jess", name: "Jess", talk: S => simpleTalk(S, "jess"), look: "Jess, with the bubble backpack, and a very sleepy orange cat in it. Mr. Whiskers has his shades on. The sun's up. He does not care.", give: "No.", pickup: "No." },
    { id: "a5_margo", name: "Margo", talk: S => simpleTalk(S, "margo"), look: "Margo, on the phone, pacing in short lines like a metronome. She looks tired and happy. She's invoicing the sun.", give: "No.", pickup: "No." },
    { id: "kosmo", name: "Kosmo Delacroix", talk: S => simpleTalk(S, "kosmo"), look: "Kosmo Delacroix, at the end of the pier, in a long coat and shades, staring at the water. He said my name right. I'll never stop hearing it.", give: "No.", pickup: "No." }
  ],
  combos: [
    ["a5_tickets", "dante", "Dante: \"You're trying to give them BACK? They're a currency! You can't return a currency!\""],
    ["a5_tickets", "lou", "Lou: \"Drink tickets? I don't drink anymore. I haven't since 1993.\""],
    ["a5_tickets", "marcus", "Marcus: \"FOR ME? FOR THIRTY OF US? ...Wait, they're for you. Okay. But thanks.\""],
    ["a5_tickets", "eddie", "Eddie: \"A two-time deal! I'll take half! Twice!\" I keep them."]
  ],
  enter: async (S, from) => {
    if (S.f.a5_pierArrived) return;
    S.f.a5_pierArrived = true;
    await RP.fadeTo(0, 1200);
    await RP.lines([
      "@nar SUN 6:12 AM",
      "Twinkie's after-party. A pier at the end of the festival, the sun coming up behind the skyline and a dozen tired people who don't want to go home.",
      "@twinkie Honey. You came. I saved you the best spot. It's the one with the sun.",
      "(Talk to everyone. Then, watch the sunrise.)"
    ]);
  },
  self: { look: "A DJ in a pink-lined coat on a pier at dawn. Tired. Done. Happy. All three.", talk: "I'm smiling at nobody in particular. It's a nice feeling. I'll write it down." }
});
})();
