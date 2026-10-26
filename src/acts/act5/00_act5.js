/* Act 5 — SUPERSTAR DJ. Headline Harbor Lights Festival (fictional).
   Act definition, characters, voices, items, locations and shared helpers (window.RP.a5).

   Flags (S.f.a5_*):  day (1 Thu, 2 Fri, 3 Sat) · tod ("day"|"night") · calledMargo · gearMixer / gearMonitors / gearDecks / gearDone
   · boutiqueMet · interviewDone · interviewScore · danteOnAir · gateMet · guestDone · guestPick (0 all seven, 1 four, 2 none) · guestIn · louPass (have it) · louPassGiven · louComing
   · slept2 / slept3 · phase (Saturday: 0 arrive, 1 soundcheck done, 2 axl handled, 3 overrun handled, 4 on stage, 5 set done)
   · rayMet · sharpie · passFixed · gloriaOK · twinkieIntel · axlIntel · jessMet · smoothie · axlDone · louArrived · soundDone ·
   overrunDone · overrunHow · setOpener · setCloser · setCrowd · setFinale · kosmoName · pierDone */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u, I = RP.icons;
const { R, P, ell, txt, clamp } = U;
const A5 = RP.a5 = RP.a5 || {};

/* ---------------------------------------------------------------------------------------------------
   characters (all new ids are a5_*; recurring cast comes from src/data/cast.js)
   --------------------------------------------------------------------------------------------------- */
const def = (id, d) => RP.chars.define(id, d);

// Margo Quist: the manager. Phone permanently attached. Sees disasters coming and invoices them.
def("a5_margo", { name: "Margo", height: 94, figure: "curvy", skin: "#a8693f", hair: { style: "bun", color: "#1c1418" },
  top: { style: "suit", color: "#243b66", color2: "#efeaf6" }, bottom: { style: "pants", color: "#243b66" }, shoes: { style: "shoes", color: "#17131f" },
  acc: ["glasses", "clipboard"], glassesColor: "#c8a060", voice: "#6fd6ff" });
// Roz Kessler: stage manager. Headset, hi-vis vest, zero patience, secret softie.
def("a5_roz", { name: "Roz", height: 92, skin: "#c98a62", hair: { style: "ponytail", color: "#2e1d16" },
  top: { style: "vest", color: "#d8e83a", color2: "#17131f" }, bottom: { style: "cargo", color: "#1c1a24" }, shoes: { style: "boots", color: "#17131f" },
  acc: ["headphones", "lanyard", "clipboard"], headphonesOn: true, voice: "#ff7f66" });
// Whit (Preston Whitlock): festival promoter. Linen suit, shades on his head, says "synergy" unironically.
def("a5_whit", { name: "Whit", height: 98, build: "stocky", skin: "#f1c7a5", hair: { style: "slick", color: "#d8d0c0" },
  top: { style: "suit", color: "#d8c8a8", color2: "#f4f0e8" }, bottom: { style: "pants", color: "#d8c8a8" }, shoes: { style: "shoes", color: "#8a5a3a" },
  acc: ["lanyard", "clipboard", "watch"], voice: "#d9d27a" });
// Dana Okafor: radio host and journalist. Big glasses, bigger questions.
def("a5_dana", { name: "Dana", height: 92, figure: "curvy", skin: "#57331f", hair: { style: "afro", color: "#1c1418" },
  top: { style: "tee", color: "#c0302c", print: "text", text: "88.1", printColor: "#f4f0e8" }, bottom: { style: "jeans", color: "#2a3a5a" }, shoes: { style: "sneakers", color: "#ffd23f" },
  acc: ["glasses", "headphones"], headphonesOn: true, glassesColor: "#ff3fa4", voice: "#79e8c8" });
// Mo: front-of-house engineer. Beanie, headphones, a can of something.
def("a5_mo", { name: "Mo", height: 92, build: "thin", skin: "#e8b48f", hair: { style: "short", color: "#1c1418" },
  top: { style: "hoodie", color: "#3a3f58" }, bottom: { style: "cargo", color: "#2a2836" }, shoes: { style: "sneakers", color: "#efeaf6" },
  acc: ["beanie", "headphones", "lanyard"], hatColor: "#c0302c", headphonesOn: false, voice: "#8fb0ff" });
// Mercè Ferrer: runs Lacquer & Wire, Brooklyn hi-fi boutique. Sells things you cannot afford with great love.
def("a5_merce", { name: "Mercè", height: 90, figure: "curvy", skin: "#e0a27a", hair: { style: "bob", color: "#2e1d16" },
  top: { style: "apron", color: "#2a1c22", color2: "#efe6d0" }, bottom: { style: "pants", color: "#2a2836" }, shoes: { style: "shoes", color: "#5a3424" },
  acc: ["glasses"], glassesColor: "#b04a3a", voice: "#f2b8d8" });
// Gloria "Big G": security. Has seen every fake pass ever made. Is not impressed by yours.
def("a5_gloria", { name: "Gloria", height: 96, build: "big", figure: "curvy", skin: "#6e4329", hair: { style: "bald", color: "#1c1418" },
  top: { style: "vest", color: "#d8e83a", color2: "#17131f" }, bottom: { style: "cargo", color: "#17131f" }, shoes: { style: "boots", color: "#17131f" },
  acc: ["lanyard", "earring"], voice: "#b8e0ff" });
// Real-DJ cameos (cameoOk in lore). Deliberately generic: a nod, a kind word. No invented biography.
def("a5_dj_louie_vega", { name: "Louie Vega", height: 94, skin: "#c98a62", hair: { style: "short", color: "#1c1418" }, facial: "stubble",
  top: { style: "tee", color: "#2a2836" }, bottom: { style: "jeans", color: "#21416f" }, shoes: { style: "sneakers", color: "#efeaf6" }, acc: ["headphones"], headphonesOn: false, voice: "#e0e0f0" });
def("a5_dj_spinna", { name: "DJ Spinna", height: 96, skin: "#8d5a3b", hair: { style: "short", color: "#1c1418" },
  top: { style: "tee", color: "#c0302c" }, bottom: { style: "cargo", color: "#2a2836" }, shoes: { style: "sneakers", color: "#17131f" }, acc: ["cap", "headphones"], headphonesOn: false, voice: "#e0e0f0" });
def("a5_dj_francois_k", { name: "Francois K", height: 96, build: "thin", skin: "#e8b48f", hair: { style: "short", color: "#9a9aa6" },
  top: { style: "jacket", color: "#3a3f58", color2: "#8a86a0" }, bottom: { style: "pants", color: "#17131f" }, shoes: { style: "shoes", color: "#17131f" }, acc: ["glasses"], voice: "#e0e0f0" });
// Background people
def("a5_tech1", { name: "crew", height: 92, skin: "#e0a27a", hair: { style: "buzz", color: "#2e1d16" }, top: { style: "tee", color: "#17131f" }, bottom: { style: "cargo", color: "#2a2836" }, shoes: { style: "boots", color: "#17131f" }, acc: ["headphones", "lanyard"], headphonesOn: true, voice: "#ffffff" });
def("a5_tech2", { name: "crew", height: 90, figure: "curvy", skin: "#b07650", hair: { style: "bun", color: "#c0302c" }, top: { style: "tank", color: "#2a2836" }, bottom: { style: "cargo", color: "#3a3a4a" }, shoes: { style: "boots", color: "#17131f" }, acc: ["lanyard", "cap"], hatColor: "#17131f", voice: "#ffffff" });
def("a5_caterer", { name: "catering", height: 90, build: "stocky", skin: "#f1c7a5", hair: { style: "short", color: "#c8c8d0" }, facial: "mustache", facialColor: "#c8c8d0",
  top: { style: "apron", color: "#efeaf6", color2: "#c0302c" }, bottom: { style: "pants", color: "#2a2836" }, shoes: { style: "shoes", color: "#17131f" }, acc: ["cap"], hatColor: "#efeaf6", voice: "#ffd2a0" });
def("a5_fan1", { name: "fan", height: 90, skin: "#e8b48f", hair: { style: "mohawk", color: "#39d0ff" }, top: { style: "mesh", color: "#17131f" }, bottom: { style: "shorts", color: "#ff3fa4" }, shoes: { style: "boots", color: "#17131f" }, acc: ["shades"], voice: "#ffffff" });

/* the stage outfit: pink-lined coat, shades. Wardrobe options live in the studio. */
A5.outfits = {
  coat:  { label: "The pink-lined coat", patch: { top: { style: "coat", color: "#17131f", color2: "#ff3fa4" }, bottom: { style: "pants", color: "#17131f" }, shoes: { style: "sneakers", color: "#efeaf6" }, acc: ["shades"], hair: { style: "messy", color: "#5a3520" } } },
  shirt: { label: "The bold shirt", patch: { top: { style: "shirt", color: "#ff7a2a", color2: "#ffd23f", print: "stripe", printColor: "#ffd23f" }, bottom: { style: "jeans", color: "#2f5a96" }, shoes: { style: "sneakers", color: "#efeaf6" }, acc: ["shades"], hair: { style: "messy", color: "#5a3520" } } },
  tee:   { label: "The old smiley tee", patch: { top: { style: "tee", color: "#17131f", print: "circle" }, bottom: { style: "jeans", color: "#2f5a96" }, shoes: { style: "sneakers", color: "#efeaf6" }, acc: [], hair: { style: "messy", color: "#5a3520" } } }
};

/* ---------------------------------------------------------------------------------------------------
   voices: speakers that are not on screen
   --------------------------------------------------------------------------------------------------- */
const kidTop = () => { const k = RP.actor("kid"); return [k ? k.x : 320, 40]; };
RP.voice("a5_margo", { color: "#6fd6ff", prefix: "MARGO (PHONE): ", anchor: kidTop });
RP.voice("a5_margoT", { color: "#6fd6ff", prefix: "MARGO: ", anchor: kidTop });
RP.voice("a5_foh", { color: "#8fb0ff", prefix: "MO (TALKBACK): ", anchor: S => [RP.curRoom() ? RP.curRoom().camX + 320 : 320, 236] });
RP.voice("a5_pa", { color: "#ffd23f", prefix: "PA: ", anchor: S => [RP.curRoom() ? RP.curRoom().camX + 320 : 320, 30] });
RP.voice("a5_airRay", { color: "#ffd27a", prefix: "RAY (CALLER): ", anchor: kidTop });
RP.voice("a5_airMarcus", { color: "#ffd23f", prefix: "MARCUS (CALLER): ", anchor: kidTop });
RP.voice("a5_airDante", { color: "#ff8fcf", prefix: "DANTE (CALLER): ", anchor: kidTop });
RP.voice("a5_airEddie", { color: "#ff9a5a", prefix: "EDDIE (CALLER): ", anchor: kidTop });
RP.voice("a5_lou", { color: "#9be15d", anchor: S => { const a = RP.curRoom() && RP.curRoom().def.id === "a5_studio" ? [346, 128] : kidTop(); return a; } });
RP.voice("a5_axlDoor", { color: "#ffd23f", prefix: "AXL (THROUGH THE DOOR): ", anchor: [460, 120] });
RP.voice("a5_axlPA", { color: "#ffd23f", prefix: "AXL (OVER THE PA): ", anchor: S => [RP.curRoom() ? RP.curRoom().camX + 320 : 320, 30] });
RP.voice("a5_crowd", { color: "#ffffff", prefix: "CROWD: ", anchor: S => [RP.curRoom() ? RP.curRoom().camX + 320 : 320, 220] });

/* ---------------------------------------------------------------------------------------------------
   real records: the baseline crate (carry=false). All ids exist in the catalog (or extraRecords).
   --------------------------------------------------------------------------------------------------- */
A5.BASE_CRATE = [
  "white_nyc93", "cece_peniston_finally", "mood_ii_swing_closer", "phuture_acid_tracks", "everything_but_the_girl_missing",
  "hardrive_deep_inside", "frankie_knuckles_your_love", "marshall_jefferson_move_your_body", "masters_at_work_blood_vibes_the_ha_dance",
  "nuyorican_soul_runaway", "kerri_chandler_atmosphere_ep_vol_1", "black_riot_a_day_in_the_life", "robin_s_show_me_love",
  "david_morales_presents_the_face_needin_u", "bucketheads_the_bomb", "ultra_nate_free", "peech_boys_dont_make_me_wait",
  "loleatta_holloway_love_sensation", "donna_summer_i_feel_love", "sylvester_you_make_me_feel_mighty_real",
  "mr_fingers_washing_machine_can_you_feel_it", "rhythim_is_rhythim_strings_of_life", "barbara_tucker_beautiful_people",
  "inner_city_good_life", "armand_van_helden_you_dont_know_me"
];
/* the 12 the festival set draws its crate from (opener, middle and closer picks in 80_mainstage) */
A5.SET_POOL = [
  "mr_fingers_washing_machine_can_you_feel_it", "kerri_chandler_atmosphere_ep_vol_1", "frankie_knuckles_your_love", "peech_boys_dont_make_me_wait",
  "mood_ii_swing_closer", "nuyorican_soul_runaway", "marshall_jefferson_move_your_body", "masters_at_work_blood_vibes_the_ha_dance",
  "robin_s_show_me_love", "david_morales_presents_the_face_needin_u", "bucketheads_the_bomb", "donna_summer_i_feel_love"
];
A5.DEFAULT_ORDER = [
  "mr_fingers_washing_machine_can_you_feel_it", "frankie_knuckles_your_love", "mood_ii_swing_closer", "nuyorican_soul_runaway",
  "masters_at_work_blood_vibes_the_ha_dance", "robin_s_show_me_love", "david_morales_presents_the_face_needin_u", "donna_summer_i_feel_love"
];
/* make sure the crate always contains what the set needs, however we arrived here */
A5.ensureCrate = (S, quiet) => {
  const need = [].concat(A5.SET_POOL, ["white_nyc93", "cece_peniston_finally"]);
  need.forEach(id => { if (!S.records.includes(id)) S.records.push(id); });
};

/* ---------------------------------------------------------------------------------------------------
   helpers
   --------------------------------------------------------------------------------------------------- */
A5.day = S => S.f.a5_day || 1;
A5.pName = S => (S.name && S.name.trim()) || "DJ KID";
/* the festival misspells your name, as promoters do. Always differs from the real one.
   Returns "DJ " + the misspelled name part, so callers can strip /^DJ / and keep their own prefix. */
A5.mangle = name => {
  const n = String(name || "DJ KID").toUpperCase().trim().replace(/\s+/g, " ");
  const body = n.replace(/^DJ(\s+|$)/, "") || "DJ";
  const parts = body.split(" ");
  let w = parts[0], out;
  if (w.length >= 4) out = w[0] + w[2] + w[1] + w.slice(3);
  else if (w.length === 3) out = w[0] + w[2] + w[1];
  else if (w.length === 2) out = w[1] + w[0];
  else out = w + "Y";
  if (out === w || out === "DJ") out = w.slice(0, -1) + (w.slice(-1) === "X" ? "Z" : "X");
  parts[0] = out;
  return "DJ " + parts.join(" ");
};
/* robust mini-game call: handles missing mini-games, failure (retry or wing it), never dead-ends */
A5.play = async function (id, params, o) {
  o = o || {};
  for (let tries = 0; ; tries++) {
    let res = null;
    try { res = await RP.mg.play(id, params); } catch (e) { console.error(e); }
    if (!res) res = { ok: true, missing: true };
    if (res.missing) return Object.assign({ score: o.fallbackScore == null ? 78 : o.fallbackScore }, res, { ok: true });
    if (res.ok) { if (res.score == null) res.score = 75; return res; }
    if (o.noRetry) return Object.assign({ score: 0 }, res);
    const i = await RP.choose(["Try again", o.skipLabel || "Wing it"]);
    if (i === 0 && tries < 6) continue;
    return Object.assign({ score: 40 }, res, { skipped: true });
  }
};
A5.tier = res => (res && res.score >= 80 ? 2 : res && res.score >= 50 ? 1 : 0);
A5.setDay = (S, day, clock, tod) => {
  S.f.a5_day = day; S.f.a5_tod = tod || "day";
  if (clock) RP.setClock(clock);
  RP.relight();
};
A5.line = (who, text) => RP.say(text, who);
/* Marcus's list, by what you chose at the gate (a5_guestPick 0 all seven / 1 four / 2 none): n in, angry outside, and his later lines */
A5.GUEST = [
  { n: 12, nw: "twelve", angry: 4,
    scene: ["@a5_whit Twelve on the list. That is every comp I have. If Francois K's plus-one turns up, I'm sending him to your tent.", "@marcus I'm not going to pick. I'm going to draw names out of a hat. ...The hat is a bucket.", "@a5_whit Nineteen people who weren't in the bucket are being very loud about it. That was an experience.", "@marcus I WANT A RECOUNT. I WANT TO SPEAK TO A MANAGER.", "@a5_whit I'm the manager. The answer is no. But with synergy."],
    again: ["@marcus Nineteen people are texting me in capital letters. I'M ON THE LIST. I'M ON THE LIST.", "Yes, Marcus. Twelve of you."],
    back: "@marcus I counted: twelve people came in. TWELVE. Nineteen are still texting me. Plus thirty is just a state of mind.",
    hot: ["@marcus I counted: TWELVE. Twelve in. And nineteen outside, shouting my name. I'm a hero.", "You're a hero, Marcus."],
    pier: "@marcus I counted: twelve people got in. Twelve! And the other nineteen sang from outside. It counts." },
  { n: 9, nw: "nine", angry: 1,
    scene: ["@marcus Four. I get four. ...Okay. That's Doreen, Big Phil, my cousin who can actually dance, and the guy with the generator.", "@a5_whit Nine in. Twenty-two out. One slightly grumpy. And three comps in my pocket for whoever turns up crying on Saturday. That's the best list we've seen all week.", "@marcus I'm fine. The tent has a ukulele. We'll have our own party."],
    again: ["@marcus Nine on the list. Doreen cried. In a good way. Then Big Phil cried, in the other way.", "Picking four is hard, Marcus.", "@marcus It's the hardest thing I've ever done. I want a medal."],
    back: "@marcus I counted: nine people came in. NINE. Doreen is already on the dance floor. Plus thirty is a state of mind.",
    hot: ["@marcus Nine in. Twenty-two outside, singing. Whit gave Doreen's sister one of the spare comps at the gate. I'm a hero.", "You're a hero, Marcus."],
    pier: "@marcus I counted: nine got in. Nine! And Whit's three spares went to Doreen's sister and two lost cousins. It counts." },
  { n: 5, nw: "five", angry: 3,
    scene: ["@marcus The five of us. Just the five. ...You're not going to make me pick? I'd have picked wrong.", "@a5_whit Five in. Twenty-six out. Nobody was chosen, so nobody's mad at Marcus. They're mad at me, in a calm and organized way. Three of them wrote letters.", "@marcus I'm fine. I'm a little hurt. The tent has a ukulele. We'll have our own party."],
    again: ["@marcus Five on the list. Twenty-six in the parking lot. I told them it was a lottery.", "Was it?", "@marcus It was a lottery where nobody won. That's called fair."],
    back: "@marcus I counted: five. FIVE. The twenty-six outside are all on my side. Plus thirty is a state of mind.",
    hot: ["@marcus I counted: five in. Twenty-six outside, loving me from the fence. I'm a hero.", "You're a hero, Marcus."],
    pier: "@marcus I counted: five got in. Five! And I got the other twenty-six to sing from the fence. It counts." }
];
A5.guest = S => A5.GUEST[S.f.a5_guestPick || 0];

/* ---------------------------------------------------------------------------------------------------
   items
   --------------------------------------------------------------------------------------------------- */
RP.item("a5_pass", {
  name: S => S.f.a5_passFixed ? "artist pass" : "artist pass (typo)", short: "Pass",
  icon: (c, S) => {
    R(c, 14, 0, 4, 6, "#ff3fa4"); R(c, 13, 5, 6, 2, "#9a9aa6");
    R(c, 6, 7, 20, 16, "#f4f0e8"); R(c, 6, 7, 20, 4, "#ff3fa4"); R(c, 6, 7, 20, 1, "#ffffff");
    txt(c, "ARTIST", 7, 8, "#ffffff"); R(c, 8, 14, 16, 1, "#1d1622");
    R(c, 8, 17, S.f.a5_passFixed ? 16 : 11, 2, S.f.a5_passFixed ? "#1d1622" : "#c0302c"); R(c, 8, 20, 9, 1, "#8a86a0");
  },
  iconKey: S => S.f.a5_passFixed ? 1 : 0,
  look: S => S.f.a5_passFixed ? ["ARTIST. ALL ACCESS. HARBOR LIGHTS.", "DJ " + A5.pName(S).replace(/^DJ /, "") + ", in Sharpie. Spelled right. A first for any laminate."] : ["ARTIST. ALL ACCESS. HARBOR LIGHTS.", "It says \"DJ " + A5.mangle(S.name).replace(/^DJ /, "") + "\". So close. So Dante."],
  use: "It's a pass. You show it to people who don't believe you."
});
RP.item("a5_marker", {
  name: "Sharpie", short: "Sharpie",
  icon: c => { R(c, 6, 10, 20, 6, "#17131f"); R(c, 6, 10, 20, 1, "#4a4658"); R(c, 22, 10, 6, 6, "#c0302c"); R(c, 26, 11, 3, 4, "#17131f"); R(c, 12, 11, 8, 4, "#f4f0e8"); txt(c, "FINE", 12, 11, "#17131f"); },
  look: "A black Sharpie. The fine art of fixing things. Every festival runs on tape, zip ties and these.",
  use: "Use it on something. Preferably not Gerald."
});
RP.item("a5_loupass", {
  name: "Lou's guest pass", short: "Lou pass",
  icon: c => { I.paper(c, "#efe6d0", "#c0302c"); R(c, 10, 6, 12, 3, "#ff3fa4"); txt(c, "LOU", 11, 12, "#17131f"); },
  look: "A guest envelope with one name on it: LOU, 4B. No plus-one. Lou doesn't do plus-ones. Lou doesn't do plus-anything.",
  use: "It should go through the pipe hole. That's how Lou and I exchange everything."
});
RP.item("a5_smoothie", {
  name: "Axl's smoothie", short: "Smoothie",
  icon: c => { R(c, 10, 8, 12, 14, "#9be15d"); R(c, 10, 8, 12, 2, "#cfffa8"); R(c, 9, 6, 14, 2, "#efeaf6"); R(c, 15, 1, 2, 6, "#c0302c"); R(c, 11, 14, 10, 3, "#6ab83a"); R(c, 12, 11, 3, 3, "#efeaf6"); },
  look: "A tall green smoothie with a handwritten label: AXL V. — NO ICE, NO SEEDS, NO EYE CONTACT. Smells like a lawn that gave up.",
  use: "I'm not drinking it. It looks at me like it knows."
});
RP.item("a5_tickets", {
  name: "drink tickets", short: "Tickets",
  icon: c => { for (let i = 0; i < 4; i++) { R(c, 4 + i * 2, 5 + i, 22, 11, i % 2 ? "#ff3fa4" : "#ffd23f"); R(c, 4 + i * 2, 5 + i, 22, 1, "#ffffff"); } txt(c, "NOWH", 8, 9, "#17131f"); },
  look: "A roll of 400 NOWHERE drink tickets. That's Dante's idea of a paycheck. They have a certain... street value. At Nowhere. On a Saturday.",
  use: "I'll spend them wisely. Meaning: not at once."
});

RP.item("a5_water", {
  name: "Eddie's water", short: "Water",
  icon: c => I.bottle(c, "#cfe4ef", "#ffd23f"),
  look: "A bottle of water. Nine dollars. Eddie's label says SPIRIT WATER, and under it, smaller, WATER.",
  use: async S => { RP.take("a5_water"); RP.sfx("click"); await RP.lines(["I drink it. It's cold. It's water.", "Nine dollars, spent on hydration. Roz would approve."]); }
});

/* act-wide combos: usable in any act-5 room */
A5.fixPass = async S => {
  if (S.f.a5_passFixed) return "It's already fixed. I'm not making a second correction. That's how you get a third.";
  S.f.a5_passFixed = true; RP.sfx("click"); RP.refreshInv();
  await RP.lines(["Squeak squeak. I cross out the typo and write my name over it, in capitals.", "Now it says " + A5.pName(S) + ". In marker. A bit lopsided. But mine."]);
};

/* ---------------------------------------------------------------------------------------------------
   locations (subway map pins are on the 320x200 map)
   --------------------------------------------------------------------------------------------------- */
RP.location({ id: "a5_loc_studio", act: 5, label: "Your studio · 4C", area: "Bushwick", room: "a5_studio", x: 560, y: 226, face: "left", fare: 3, mx: 236, my: 138, open: S => true });
RP.location({ id: "a5_loc_boutique", act: 5, label: "Lacquer & Wire", area: "Williamsburg", room: "a5_boutique", x: 70, y: 226, face: "right", fare: 3, mx: 196, my: 92, open: S => A5.day(S) <= 2 });
RP.location({ id: "a5_loc_radio", act: 5, label: "Radio Harbor 88.1", area: "Midtown", room: "a5_radio", x: 70, y: 228, face: "right", fare: 3, mx: 144, my: 58, open: S => A5.day(S) === 2 && !S.f.a5_interviewDone });
RP.location({ id: "a5_loc_gate", act: 5, label: "Harbor Lights Festival", area: "Waterfront", room: "a5_gate", x: 70, y: 232, face: "right", fare: 3, mx: 168, my: 128, open: S => (A5.day(S) === 2 && !!S.f.a5_interviewDone) || A5.day(S) === 3 });

/* ---------------------------------------------------------------------------------------------------
   the act
   --------------------------------------------------------------------------------------------------- */
RP.defineAct({
  n: 5, id: "act5", title: "SUPERSTAR DJ", sub: "Harbor Lights Festival · Thursday",
  blurb: "Three days, one main stage and a mixer hand-wired in Barcelona. Headline Harbor Lights.",
  start: { room: "a5_studio", x: 300, y: 232, face: "front" },
  setup(S, carry) {
    if (!carry) {
      S.money = 8000; S.followers = 40000;
      S.records = A5.BASE_CRATE.slice();
      S.gear = { decks: "pioneer_cdj_900", turntables: "technics_sl_1210mk7", mixer: "pioneer_djm_350", monitors: "dynaudio_bm5_mkiii" };
      if (!S.name) S.name = "DJ KID";
    } else {
      S.gear = Object.assign({ decks: "pioneer_cdj_900", turntables: "technics_sl_1210mk7", mixer: "pioneer_djm_350", monitors: "dynaudio_bm5_mkiii" }, S.gear);
      S.gear.turntables = "technics_sl_1210mk7"; /* bought with Halcyon money in Act 4 */
      S.money = Math.max(S.money || 0, 1500);
      S.followers = Math.max(S.followers || 0, 2000);
    }
    A5.ensureCrate(S);
    S.inv = ["phone", "wallet"];
    Object.keys(S.f).forEach(k => { if (k.indexOf("a5_") === 0) delete S.f[k]; });
    S.f.noTravel = false; S.f.__hideKid = false;
    S.f.a5_day = 1; S.f.a5_tod = "day"; S.f.a5_phase = 0;
    S.clock = "THU 10:12 AM";
    S.unlocked = ["a5_loc_studio", "a5_loc_boutique"];
  },
  wardrobe: A5.outfits.coat.patch,
  async intro(S) {
    const k = RP.actor("kid"); k.face = "front";
    S.f.a5_advance = Math.max(5000, Math.ceil((10000 - S.money) / 500) * 500);
    await RP.lines([
      "Thursday. Ten in the morning. Three days until I headline a festival.",
      "I'm not nervous. That's a lie. I've been up since five, alphabetizing my own records."
    ]);
    RP.sfx("ring"); await RP.wait(500);
    await RP.lines([
      "@a5_margo Good morning, headliner. It's Margo. Your manager. I'm calling at ten because I'm a person who calls at ten.",
      "Margo Quist. My manager since Berlin. She heard Halle Neun paid me in cash, from an envelope, and called to say \"never again.\"",
      "She meant the envelope. Margo only calls at ten with news.",
      "@a5_margo Harbor Lights wired your advance. " + RP.u.fmtMoney(S.f.a5_advance) + ", in your account. A wire. No envelope. Like a professional.",
      "I've never had that much at once. I have to sit down. I'm sitting down."
    ]);
    S.f.a5_calledMargo = true;
    RP.money(S.f.a5_advance);
    await RP.lines([
      "@a5_margo Here's the plan. You're not playing a festival on " + ((S.gear && RP.gearInfo(S.gear.decks) || { model: "CDJ-900" }).model) + "s and a mixer from a different decade.",
      "@a5_margo Lacquer & Wire in Williamsburg. They stock the mixer you keep describing in your sleep. Handwired, in Barcelona.",
      "The Taula. The Can Electric Taula 4 MR. I say its name like a prayer.",
      "@a5_margo Also a proper pair of monitors, and new decks. Eddie Two-Times will be there.",
      "@a5_margo I'm so sorry. It was the only way to get the mixer. Text me when it's done. Don't buy anything with a deal attached.",
      "Margo. It's Eddie. Every deal has a deal attached."
    ]);
    RP.text("MARGO (MGR)", "THU: gear at Lacquer & Wire (Williamsburg). FRI 10 AM: Radio Harbor interview. FRI 7 PM: wristbands + guest list at the gate. SAT: soundcheck 4 PM. Do NOT say anything about Axl.", true);
    RP.text("HARBOR LIGHTS", "Congratulations, " + A5.pName(S) + "! You are confirmed as Saturday night headliner, main stage, 11:45 PM. Please see attached rider. Please do not attach a rider.", true);
    await RP.lines([
      "Okay. Subway map, shop, spend a stranger's money on a mixer. My phone has the map. I should also check the messages.",
      "(Phone: Subway map. Then Lacquer & Wire. The advance is real. I checked twice.)"
    ]);
  },
  combos: [["a5_marker", "a5_pass", S => A5.fixPass(RP.state)]],
  doneTitle: "SUPERSTAR DJ",
  doneText: S => "Harbor Lights. Main stage. A rotary mixer, a white label, and a thousand people who stayed for the last bar. Dante's drink tickets: still unspent."
});

})();
