/* Act 4 — TOURING DJ. Act definition, cast, items, voices, locations and shared helpers.

   Story (docs/STORY.md, level 4): an email from a booking agent in Berlin. Make a record with Lou,
   release it on your own label (Pipe Hole Records), let it spread, negotiate a booking, lose your
   record bag at JFK, find it again, fly, miss the airport train, talk your way past a Berlin door,
   play Halle Neun, get your hotel room back from Axl Vanta, and receive a festival offer.

   Rooms: a4_studio · a4_jfk · a4_baggage · a4_security · a4_plane · a4_ber_platform ·
          a4_berlin_street · a4_halle_door · a4_halle · a4_hotel

   Flags (S.f, all prefixed a4_):
     studio:   email, rayBox, passport, louCalled, louIn, sampled, track, trackScore, photo, released,
               viral, deal, dealScore, fee, packed, leaving
     airport:  checkedPass, bagChecked, claim, msgBag, formGot, formStamped, jerky, dogFed, bagBack,
               secDone, boarded
     plane:    kosmoBag, flown
     berlin:   ticket, validated, trainDone, late, tooLate, quizDone, band, setDone, played, fee paid
     hotel:    clerkOk, postcard, axlGone, key, offer                                              */
(function () {
"use strict";
const RP = window.RP;
const I = RP.icons;
const { R, P, ell, txt } = RP.u;
const A4 = RP.a4 = {};
const def = (id, d) => RP.chars.define(id, d);

/* ------------------------------------------------------------------ records */
/* ~16 records for a fresh start (chapter select): house/garage classics + Lou's white label.
   Ray's box (in the studio) adds six techno and minimal records for the Berlin crowd. */
A4.BASE_RECORDS = [
  "white_nyc93", "phuture_acid_tracks", "cece_peniston_finally", "everything_but_the_girl_missing",
  "mood_ii_swing_closer", "hardrive_deep_inside", "frankie_knuckles_your_love", "marshall_jefferson_move_your_body",
  "kerri_chandler_the_mood_ep", "inner_city_good_life", "todd_terry_project_weekend", "mr_fingers_washing_machine_can_you_feel_it",
  "armand_van_helden_you_dont_know_me", "crystal_waters_gypsy_woman", "robin_s_show_me_love", "black_box_ride_on_time"
];
A4.TECHNO = [
  "jeff_mills_kat_moda_ep", "robert_hood_minimal_nation", "basic_channel_phylyps_trak",
  "ben_klock_one", "marcel_dettmann_dettmann", "x_101_x_101"
];

/* ------------------------------------------------------------------ name jokes */
A4.misspell = name => {
  const n = String(name || "DJ NOBODY").trim() || "DJ NOBODY";
  const w = n.split(/\s+/), last = w[w.length - 1];
  w[w.length - 1] = last.length > 3 ? last.slice(0, 2) + last[3] + last[2] + last.slice(4) : last + last[last.length - 1];
  return w.join(" ");
};
A4.kosmoWrongName = () => "Brenton";
A4.dj = S => S.name || "DJ NOBODY";

/* ------------------------------------------------------------------ cast */
/* recurring characters (lou, kosmo, axl, marcus, dante) come from src/data/cast.js */
def("a4_ingrid", { name: "Ingrid Falk", height: 98, build: "thin", skin: "#f1c7a5", hair: { style: "bob", color: "#c8c8d8" },
  top: { style: "shirt", color: "#17131f", color2: "#39d0ff" }, bottom: { style: "pants", color: "#17131f" }, shoes: { style: "boots", color: "#17131f" },
  acc: ["glasses", "headphones"], headphonesOn: false, glassesColor: "#39d0ff", voice: "#7ad8f0" });
def("a4_dolores", { name: "Dolores", height: 90, build: "stocky", figure: "curvy", skin: "#8d5a3b", hair: { style: "bun", color: "#1c1418" },
  top: { style: "vest", color: "#2a4a8a", color2: "#efeaf6" }, bottom: { style: "pants", color: "#1c2a4a" }, shoes: { style: "shoes", color: "#17131f" },
  acc: ["lanyard"], voice: "#ffb0a0" });
def("a4_priya", { name: "Priya", height: 90, figure: "curvy", skin: "#b07650", hair: { style: "long", color: "#1c1418" },
  top: { style: "cardigan", color: "#c0502c", color2: "#efeaf6" }, bottom: { style: "pants", color: "#2a2836" }, shoes: { style: "shoes", color: "#5a3424" },
  acc: ["glasses", "lanyard"], voice: "#ffcf7a" });
def("a4_delgado", { name: "Officer Delgado", height: 102, build: "big", skin: "#c98a62", hair: { style: "buzz", color: "#1c1418" }, facial: "mustache", facialColor: "#1c1418",
  top: { style: "jacket", color: "#2a3a5a", color2: "#9aa0b8" }, bottom: { style: "pants", color: "#1c2236" }, shoes: { style: "boots", color: "#17131f" },
  acc: ["lanyard", "watch"], voice: "#9fc2ff" });
def("a4_marguerite", { name: "Marguerite", height: 92, build: "thin", skin: "#e8b48f", hair: { style: "bun", color: "#7a4a2a" },
  top: { style: "jacket", color: "#1f3a6a", color2: "#c0302c", print: "stripe", printColor: "#c0302c" }, bottom: { style: "skirt", color: "#1f3a6a" }, shoes: { style: "shoes", color: "#17131f" },
  acc: ["lanyard"], voice: "#ff9a9a" });
def("a4_kemal", { name: "Kemal", height: 90, build: "stocky", skin: "#c98a62", hair: { style: "short", color: "#2e2e36" }, facial: "mustache", facialColor: "#2e2e36",
  top: { style: "polo", color: "#8a2a2a", color2: "#efeaf6" }, bottom: { style: "pants", color: "#3a3a4a" }, shoes: { style: "sneakers", color: "#efeaf6" },
  acc: ["apron"], voice: "#ffa05a" });
def("a4_sven", { name: "Sven", height: 110, build: "big", skin: "#f1c7a5", hair: { style: "bald", color: "#9a9aa6" }, facial: "beard", facialColor: "#6a6a76",
  top: { style: "coat", color: "#14121a", color2: "#2a2836" }, bottom: { style: "pants", color: "#14121a" }, shoes: { style: "boots", color: "#0a080e" },
  acc: ["shades", "chain"], voice: "#c0c0d4" });
def("a4_katja", { name: "Katja", height: 100, build: "thin", skin: "#e8b48f", hair: { style: "ponytail", color: "#17131f" },
  top: { style: "jacket", color: "#14121a", color2: "#39d0ff" }, bottom: { style: "pants", color: "#14121a" }, shoes: { style: "boots", color: "#14121a" },
  acc: ["headphones", "clipboard", "lanyard"], headphonesOn: false, voice: "#39d0b8" });
def("a4_brandt", { name: "Herr Brandt", height: 96, build: "thin", skin: "#f1c7a5", hair: { style: "slick", color: "#9a9aa6" },
  top: { style: "vest", color: "#5a2a3a", color2: "#efeaf6", tie: true, tieColor: "#c8a030" }, bottom: { style: "pants", color: "#17131f" }, shoes: { style: "shoes", color: "#17131f" },
  acc: ["glasses"], voice: "#ffb8a0" });
def("a4_ent1", { name: "Brock", height: 108, build: "big", skin: "#6e4329", hair: { style: "bald", color: "#17131f" },
  top: { style: "tee", color: "#17131f" }, bottom: { style: "cargo", color: "#2a2836" }, shoes: { style: "boots", color: "#17131f" }, acc: ["shades", "earring"], voice: "#d0a070" });
def("a4_ent2", { name: "Tiff", height: 90, figure: "curvy", skin: "#e0a27a", hair: { style: "ponytail", color: "#ff6cbb" },
  top: { style: "jacket", color: "#efeaf6", color2: "#ffd23f" }, bottom: { style: "jeans", color: "#2f5a96" }, shoes: { style: "sneakers", color: "#ffd23f" }, acc: ["headphones", "clipboard"], voice: "#ffb0d0" });
/* the cameo: a respectful, generic figure in the booth (rule 2 — a nod, nothing invented) */
def("dj_jeff_mills", { name: "Jeff Mills", height: 100, build: "thin", skin: "#6e4329", hair: { style: "bald", color: "#17131f" },
  top: { style: "hoodie", color: "#1c1a24", color2: "#39d0ff" }, bottom: { style: "pants", color: "#14121a" }, shoes: { style: "sneakers", color: "#17131f" },
  acc: ["headphones"], voice: "#d8d0ff" });
/* background people */
["a4_stag1", "a4_stag2", "a4_stag3"].forEach((id, i) => def(id, Object.assign(RP.chars.random(410 + i * 7, { top: "vest", name: "stag party" }), { id, top: { style: "vest", color: ["#ffd23f", "#ff8a4c", "#9be15d"][i], color2: "#17131f" }, voice: "#ffe08a" })));
["a4_pax1", "a4_pax2", "a4_pax3", "a4_pax4", "a4_pax5", "a4_pax6"].forEach((id, i) => def(id, Object.assign(RP.chars.random(520 + i * 13, { name: "passenger" }), { id, voice: "#e0e0f0" })));

/* ------------------------------------------------------------------ voices */
RP.voice("a4_ingrid", { color: "#7ad8f0", anchor: S => A4.callAnchor(), prefix: "" });
RP.voice("a4_pipe", { color: "#9be15d", anchor: [336, 120] });                   /* Lou through the pipe hole */
RP.voice("a4_pa", { color: "#ffd27a", anchor: [320, 30], prefix: "PA: " });       /* airport announcements */
RP.voice("a4_pilot", { color: "#ffd27a", anchor: [320, 30], prefix: "CAPTAIN: " });
RP.voice("a4_axlphone", { color: "#ffd23f", anchor: [320, 60], prefix: "AXL (PHONE): " });

/* ------------------------------------------------------------------ video call window */
/* A small "video call" overlay drawn from drawTop() of rooms that need it. Set S.f.a4_callOn. */
A4.callBox = { x: 14, y: 8, w: 132, h: 100 };
A4.callAnchor = () => [A4.callBox.x + A4.callBox.w / 2, A4.callBox.y + A4.callBox.h + 36];
A4.callTalking = false;
A4.callWho = "a4_ingrid";
A4.drawCall = function (c, S, t) {
  if (!S.f.a4_callOn) return;
  const b = A4.callBox, { x, y, w, h } = b;
  R(c, x - 3, y - 3, w + 6, h + 14, "#0c0818"); R(c, x - 2, y - 2, w + 4, h + 12, "#2a2840"); R(c, x - 2, y - 2, w + 4, 1, "#5a5680");
  R(c, x, y, w, h, "#1a1230");
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  // Berlin loft behind her: window blocks and a lamp
  for (let i = 0; i < h; i++) { const k = i / h; R(c, x, y + i, w, 1, k < 0.5 ? "#3a2a5a" : k < 0.8 ? "#4a3466" : "#5a4470"); }
  R(c, x + 10, y + 14, 38, 50, "#0e1428"); for (let r = 0; r < 4; r++) for (let q = 0; q < 3; q++) R(c, x + 12 + q * 12, y + 16 + r * 12, 10, 10, (r + q) % 3 === 0 ? "#ffcf80" : "#1a2a4a");
  R(c, x + w - 34, y + 20, 3, 60, "#2a2238"); ell(c, x + w - 32, y + 18, 9, 5, "#ffd890"); ell(c, x + w - 32, y + 18, 5, 3, "#fff6d0");
  const lt = { lx: -0.4, rim: { color: "#39d0ff", side: 1 }, cast: false, shadow: 0 };
  const talk = A4.callTalking && Math.floor(t / 130) % 2 === 0;
  RP.chars.draw(c, { id: A4.callWho, x: x + w / 2, y: y + h + 112, face: "front", act: "stand", frame: 0, scale: 2.1, mouth: talk ? 1 : 0, blink: Math.floor(t / 2300) % 4 === 3 && (t % 2300) < 140, noShadow: true }, lt);
  // scanlines
  c.fillStyle = "rgba(0,0,0,0.16)"; for (let yy = y; yy < y + h; yy += 2) c.fillRect(x, yy, w, 1);
  c.restore();
  R(c, x, y + h + 1, w, 9, "#14102a");
  const name = A4.callWho === "a4_ingrid" ? "INGRID FALK - NACHTWERK" : "CALLING";
  txt(c, name, x + 4, y + h + 3, "#bfb8e8");
  R(c, x + w - 14, y + h + 3, 4, 4, "#3fd07a"); R(c, x + w - 8, y + h + 3, 4, 4, Math.floor(t / 500) % 2 ? "#ff4a4a" : "#a02828");
  R(c, x + 3, y + 3, 5, 5, Math.floor(t / 600) % 2 ? "#ff4a4a" : "#7a1818");
};
/* speak as Ingrid on the call, animating her mouth */
A4.ing = async function (text) { A4.callTalking = true; try { await RP.say(text, "a4_ingrid"); } finally { A4.callTalking = false; } };
A4.ingLines = async function (arr) { for (const l of arr) { if (typeof l === "function") await l(); else if (l.startsWith("@kid ")) await RP.say(l.slice(5)); else await A4.ing(l); } };
A4.callOn = S => { S.f.a4_callOn = true; A4.callWho = "a4_ingrid"; };
A4.callOff = S => { S.f.a4_callOn = false; A4.callTalking = false; };

/* ------------------------------------------------------------------ mini-game wrapper (never a dead end) */
/* Runs RP.mg.play and handles ok / !ok / missing. After `max` failed tries the scene moves on with a
   weak result (flag forced) so the player can never get stuck on a mini-game. */
A4.tryMg = async function (id, params, S, o) {
  o = o || {};
  const key = "a4_tries_" + (o.key || id);
  for (;;) {
    const n = S.f[key] || 0;
    const p = Object.assign({}, params);
    if (p.difficulty != null && n > 0) p.difficulty = Math.max(1, p.difficulty - Math.min(n, 2));
    let res;
    try { res = await RP.mg.play(id, p); } catch (e) { res = { ok: true, score: 50, missing: true }; }
    res = res || { ok: false };
    if (res.missing) { res = Object.assign({}, res, { ok: true, score: o.fallbackScore != null ? o.fallbackScore : 70 }); }
    if (res.ok) { S.f[key] = 0; return res; }
    S.f[key] = n + 1;
    if (S.f[key] >= (o.max || 3)) { S.f[key] = 0; return Object.assign({}, res, { ok: true, forced: true, score: Math.min(res.score || 0, 45) }); }
    if (o.onFail) await o.onFail(res, S.f[key]);
  }
};

/* ------------------------------------------------------------------ small art helpers shared by rooms */
/* the 3x5 font has no umlauts: draw them by hand above an A / O / U drawn with txt() */
A4.dots = (c, x, y, col) => { P(c, x, y, col); P(c, x + 2, y, col); };
A4.txtU = (c, s, x, y, col, sc, sp) => {            /* text where "Ä" "Ö" "Ü" get two dots */
  sc = sc || 1; sp = sp == null ? 1 : sp;
  let cx = x;
  for (const ch of String(s).toUpperCase()) {
    const base = ch === "Ä" ? "A" : ch === "Ö" ? "O" : ch === "Ü" ? "U" : ch;
    txt(c, base, cx, y, col, sc, sp);
    if (base !== ch) { R(c, cx, y - 2 * sc, sc, sc, col); R(c, cx + 2 * sc, y - 2 * sc, sc, sc, col); }
    cx += 3 * sc + sp;
  }
};
A4.sleeveIcon = (c, id, ox, oy) => {
  const cv = document.createElement("canvas"); cv.width = 20; cv.height = 20;
  RP.sleeve(cv.getContext("2d"), RP.rec(id), 0, 0, 20); c.drawImage(cv, ox || 6, oy || 2);
};

/* ------------------------------------------------------------------ the act */
RP.defineAct({
  n: 4, id: "act4", title: "TOURING DJ", sub: "Bushwick, then Berlin",
  blurb: "An email from Berlin. A track to release, a record bag to keep track of, and a door that doesn't like Americans.",
  start: { room: "a4_studio", x: 330, y: 232, face: "front" },
  setup(S, carry) {
    Object.keys(S.f).forEach(k => { if (k.indexOf("a4_") === 0) delete S.f[k]; });
    S.f.noTravel = false; S.f.time = "dusk";
    if (!carry) {
      S.money = 600; S.followers = 2500;
      S.records = A4.BASE_RECORDS.slice();
      S.gear = { decks: "pioneer_cdj_900", turntables: "technics_sl_1210mk2", mixer: "pioneer_djm_350", monitors: "dynaudio_bm5_mkiii" };
    } else {
      if (!S.records) S.records = [];
      if (!S.records.includes("white_nyc93")) S.records.push("white_nyc93");
      S.gear = Object.assign({ decks: "pioneer_cdj_900", turntables: "technics_sl_1210mk2", mixer: "pioneer_djm_350", monitors: "dynaudio_bm5_mkiii" }, S.gear);
    }
    if (!S.money || S.money < 200) S.money = Math.max(S.money || 0, 600);
    S.inv = ["phone", "a4_white"];
    S.clock = "THU 4:10 PM";
    S.unlocked = ["a4_loc_studio"];
  },
  wardrobe: { top: { style: "bomber", color: "#22304a", color2: "#ff3fa4", print: null, backText: "PIPE HOLE" }, acc: ["headphones"] },
  async intro(S) {
    RP.actor("kid").face = "front";
    await RP.lines([
      "Six months on. Saturday residency, a closet of Technics, and four rent checks that all cleared.",
      "Dante still owes me from Nowhere. He says it's in the mail. He's never owned a mailbox."
    ]);
    RP.setGear("turntables", "technics_sl_1210mk7");
    await RP.lines([
      "My own pair of Technics SL-1210MK7s, bought with Halcyon money. I pet them when nobody's looking.",
      "And an email I've read nine times. It's from Berlin. It's on the laptop."
    ]);
  },
  doneTitle: "FIRST TOUR",
  doneText: S => "Pipe Hole Records is open for business, your record bag made it to Berlin and back, and Halle Neun danced. Now a festival wants you to headline. In New York. Where your landlord lives."
});

/* ------------------------------------------------------------------ locations (NYC only) */
RP.location({ id: "a4_loc_studio", act: 4, label: "Studio 4C", area: "Bushwick", room: "a4_studio", x: 574, y: 228, face: "left", fare: 3, mx: 214, my: 120 });
RP.location({ id: "a4_loc_jfk", act: 4, label: "JFK Airport, Terminal 4", area: "Queens", room: "a4_jfk", x: 110, y: 234, face: "right", fare: 8, mx: 300, my: 175 });

/* ------------------------------------------------------------------ items */
const bagIcon = c => {
  R(c, 5, 8, 22, 14, "#1c1a24"); R(c, 5, 8, 22, 2, "#3a3850"); R(c, 5, 20, 22, 2, "#0a080e");
  R(c, 10, 3, 2, 6, "#55516a"); R(c, 20, 3, 2, 6, "#55516a"); R(c, 10, 2, 12, 2, "#8a86a0");
  R(c, 5, 8, 2, 14, "#55516a"); R(c, 25, 8, 2, 14, "#55516a");
  ell(c, 11, 15, 2, 2, "#ff3fa4"); R(c, 16, 12, 7, 4, "#39d0ff"); R(c, 16, 12, 7, 1, "#9fe8ff"); P(c, 9, 12, "#ffd23f"); P(c, 14, 19, "#9be15d");
};
RP.item("a4_white", { name: "white label \"NYC 93\"", short: "NYC 93",
  icon: c => { I.record(c, "#f4f0ea"); P(c, 15, 11, "#1d1622"); P(c, 17, 11, "#1d1622"); P(c, 16, 13, "#1d1622"); },
  look: "Lou's white label. Just \"NYC 93\" in marker. Twelve inches of a Saturday in 1993.",
  use: "It needs a turntable. Luckily I own two good ones now. Still can't believe that sentence." });
RP.item("a4_passport", { name: "passport", short: "Passport",
  icon: c => { R(c, 8, 3, 16, 20, "#1d2a5a"); R(c, 8, 3, 16, 1, "#3a4a8a"); R(c, 8, 22, 16, 1, "#0e1630"); ell(c, 16, 11, 4, 4, "#c8a030"); ell(c, 16, 11, 2, 2, "#1d2a5a"); R(c, 11, 18, 10, 1, "#c8a030"); },
  look: "My passport. The photo is from 2019. I had a plan back then and a haircut to match.",
  use: "It only does one thing, and it does it at borders." });
RP.item("a4_bag", { name: "record bag", short: "Rec. bag", icon: bagIcon,
  look: S => S.f.a4_bagBack ? "My record bag. Every record in my crate lives in here. I will never let go of it again. Probably." : "My record bag. Heavy, scuffed, covered in stickers from clubs that closed. It's my whole career in a strap.",
  use: "Not now. I'll open it when someone's paying me." });
RP.item("a4_boarding", { name: "boarding pass", short: "Boarding",
  icon: c => { R(c, 3, 6, 26, 14, "#efeaf6"); R(c, 3, 6, 26, 3, "#2f62b8"); R(c, 20, 9, 1, 11, "#9a96b0"); for (let y = 11; y < 19; y += 2) R(c, 5, y, 12, 1, "#55516a"); for (let x = 22; x < 28; x += 2) R(c, x, 11, 1, 8, "#17131f"); },
  look: "Boarding pass, JFK to Berlin. Seat 23A, a window. I'll be the one pressing my face against it.",
  use: "It only works at gates, and the gate agent hasn't seen mine yet." });
RP.item("a4_claim", { name: "baggage claim tag", short: "Claim tag",
  icon: c => { R(c, 9, 3, 14, 19, "#efe6d0"); R(c, 9, 3, 14, 3, "#c0302c"); ell(c, 16, 6, 2, 1, "#6a1a1a"); for (let x = 11; x < 21; x += 2) R(c, x, 11, 1, 7, "#17131f"); P(c, 12, 9, "#55516a"); P(c, 14, 9, "#55516a"); },
  look: S => "Claim tag BER-4471. It has my name on it, spelled \"" + A4.misspell(A4.dj(S)) + "\". I'm starting to think it's an industry standard.",
  use: "It's proof that I owned a bag once." });
RP.item("a4_form", { name: S => S.f.a4_formStamped ? "Form 7B (stamped)" : "Form 7B", short: "Form 7B",
  icon: (c, S) => { R(c, 8, 2, 16, 21, "#efe6d0"); for (let y = 6; y < 20; y += 3) R(c, 11, y, 10, 1, "#55516a"); R(c, 11, 5, 5, 2, "#c0302c"); if (S.f.a4_formStamped) { ell(c, 19, 17, 4, 4, "#2f62b8"); ell(c, 19, 17, 2, 2, "#efe6d0"); P(c, 19, 17, "#2f62b8"); } },
  iconKey: S => S.f.a4_formStamped ? 1 : 0,
  look: S => S.f.a4_formStamped ? "Form 7B, stamped by Baggage Services. It still needs a signature from Security, who need a stamp from us. Two out of two." : "Form 7B: Request for Release of a Detained Item. It needs a stamp from Baggage Services and a signature from Security. Each says the other goes first.",
  use: "It's a form. It doesn't do anything. It just waits to be stamped." });
RP.item("a4_jerky", { name: "beef jerky", short: "Jerky",
  icon: c => { R(c, 6, 4, 20, 17, "#c0302c"); R(c, 6, 4, 20, 2, "#e05a4a"); R(c, 6, 19, 20, 2, "#8a1a1a"); ell(c, 16, 12, 5, 4, "#7a3a1a"); ell(c, 15, 11, 3, 2, "#a8603a"); R(c, 9, 7, 14, 1, "#ffd23f"); },
  look: "\"Chewy Wowie\" beef jerky. The bag says \"Now with 22% real jerky.\" The other 78% is a secret.",
  use: "I'm not that hungry. I'm barely that curious." });
RP.item("a4_ticket", { name: S => S.f.a4_validated ? "train ticket (validated)" : "train ticket", short: "Ticket",
  icon: (c, S) => { R(c, 4, 6, 24, 13, "#efeaf6"); R(c, 4, 6, 24, 3, "#c0302c"); R(c, 7, 11, 12, 1, "#55516a"); R(c, 7, 14, 8, 1, "#55516a"); if (S.f.a4_validated) { R(c, 20, 11, 7, 6, "#3fa66a"); P(c, 22, 14, "#17131f"); P(c, 23, 15, "#17131f"); P(c, 24, 14, "#17131f"); } },
  iconKey: S => S.f.a4_validated ? 1 : 0,
  look: S => S.f.a4_validated ? "Airport train ticket, zones ABC, validated. In Germany a ticket that isn't stamped is just a nice piece of paper." : "A train ticket, zones ABC. It says it's valid once it's validated. I think that means stamped. By a machine. Somewhere.",
  use: "It needs the little red validator by the stairs." });
RP.item("a4_photo", { name: "photo of the hole", short: "Hole pic",
  icon: c => { R(c, 6, 3, 20, 18, "#efeaf6"); R(c, 8, 5, 16, 12, "#6a5a7a"); ell(c, 16, 11, 4, 3, "#0e0a14"); ell(c, 16, 11, 5, 4, "#9a8aa8"); ell(c, 16, 11, 3, 2, "#0e0a14"); R(c, 8, 18, 16, 2, "#efeaf6"); },
  look: "A photo of the hole in the wall between my place and Lou's. It's the cover. It's, honestly, a great hole.",
  use: "It goes on the laptop. That's where covers go." });
RP.item("a4_band", { name: "Halle Neun wristband", short: "Band",
  icon: c => { R(c, 4, 9, 24, 7, "#9be15d"); R(c, 4, 9, 24, 1, "#d8ff9a"); R(c, 4, 15, 24, 1, "#5a9a2a"); txt(c, "H9", 10, 10, "#17131f"); ell(c, 5, 12, 1, 2, "#17131f"); },
  look: "A neon green wristband. Halle Neun. If I lose it, I lose the club.",
  use: "It's on my wrist. It's holding me together." });
RP.item("a4_postcard", { name: "hotel postcard", short: "Postcard",
  icon: c => { R(c, 4, 4, 24, 16, "#efeaf6"); R(c, 5, 5, 22, 10, "#5a8ad8"); R(c, 5, 12, 22, 3, "#3a7a4a"); R(c, 17, 7, 3, 5, "#efe6d0"); R(c, 16, 7, 1, 5, "#c0302c"); R(c, 5, 16, 22, 1, "#9a96b0"); P(c, 7, 18, "#55516a"); },
  look: "A postcard of the hotel, with the TV tower photoshopped in so it looks closer. It's close enough to autograph.",
  use: "No pen. I could draw a hole on it." });
RP.item("a4_key", { name: "room key", short: "Key",
  icon: c => { ell(c, 9, 12, 6, 6, "#c8a030"); ell(c, 9, 12, 3, 3, "#00000000"); c.clearRect(8, 11, 3, 3); R(c, 14, 11, 12, 3, "#c8a030"); R(c, 22, 14, 2, 4, "#c8a030"); R(c, 25, 14, 2, 3, "#c8a030"); txt(c, "12", 6, 10, "#5a3a10"); },
  look: "Room 12, on a brass fob the size of a hockey puck. Nobody has stolen a key like this since 1962.",
  use: "It opens Room 12. Which is mine." });
})();
