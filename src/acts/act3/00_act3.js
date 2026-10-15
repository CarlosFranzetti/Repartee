/* Act 3 — CLUB DJ. Act definition, cast, shared items, voices, locations and helpers.
   Everything in src/acts/act3 prefixes its ids with "a3_" (recurring cast from src/data/cast.js keeps its ids).

   STORY SHAPE (flags, all S.f.a3_*)
     Night 1 (Thu)   a3_soundcheck (Gus + snack) -> a3_opener (set.Time "opener", paycheck)
     The week        a3_cdj (Eddie, buy.Gear) · a3_dj350 (Gus, 2nd snack) · a3_rayTip/a3_clue* -> a3_hunt (record.Hunt)
                     -> a3_estateDone (crate.Digging, Technics) · a3_promo (get.Followers) -> sleep -> Thursday
     Night 3 (Thu)   a3_kosmoIn · a3_swap (USB swapped) · a3_feudOver (two bartenders) · a3_footage · a3_brandonDone
                     (club.Drama) · a3_kosmoDone (set.Time "follow-legend") · a3_setDone (playlist.Order)
     Aftermath       a3_saturday · a3_train (last.Train) · a3_email -> RP.completeAct */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u;
const I = RP.icons;
const { R, P, ell, txt } = U;
const A3 = RP.A3 = RP.A3 || {};

/* -------- the white label lives in the act 1 file; make sure it exists if only act 3 loads -------- */
RP.data.extraRecords = Object.assign(RP.data.extraRecords || {}, {
  white_nyc93: (RP.data.extraRecords && RP.data.extraRecords.white_nyc93) || { id: "white_nyc93", artist: "Unknown", title: "\"NYC 93\" (white label)", label: "white label", year: 1993, format: "12\"", genre: "garage", bpm: 120, energy: 3, rarity: "grail", price: 0, vibe: ["weird", "builder"], fact: "No label, no artist. Just \"NYC 93\" in marker. Lou won't say where it came from." }
});

/* ======================================================================
   cast (fictional) — recurring characters live in src/data/cast.js
   ====================================================================== */
const def = (id, d) => RP.chars.define(id, d);
// Odessa Reyes, owner and promoter of the Halcyon Room. Clipboard, glasses, a cigarette she's not allowed to light.
def("a3_odessa", { name: "Odessa", height: 90, build: "average", figure: "curvy", skin: "#a8744f", hair: { style: "afro", color: "#c8c8d4" },
  top: { style: "jacket", color: "#6a2a5a", color2: "#efe6d0" }, bottom: { style: "pants", color: "#17131f" }, shoes: { style: "boots", color: "#3a2418" },
  acc: ["glasses", "chain", "clipboard"], glassesColor: "#c0302c", voice: "#ffc44d" });
// Gus, sound guy. Responds to snacks. Only snacks.
def("a3_gus", { name: "Gus", height: 94, build: "stocky", skin: "#e8b48f", hair: { style: "short", color: "#3a2014" }, facial: "beard", facialColor: "#4a2a1a",
  top: { style: "hoodie", color: "#2a3a48", color2: "#17131f", print: "text", text: "FOH", printColor: "#9be15d" }, bottom: { style: "cargo", color: "#3a3a42" }, shoes: { style: "sneakers", color: "#2a2836" },
  acc: ["headphones", "beanie"], hatColor: "#17131f", headphonesOn: false, voice: "#7fe3c0" });
// Nico and Bex: bartenders, not speaking since "the lemon incident".
def("a3_nico", { name: "Nico", height: 98, build: "thin", skin: "#c98a62", hair: { style: "slick", color: "#1c1418" }, facial: "mustache", facialColor: "#1c1418",
  top: { style: "vest", color: "#2a2836", color2: "#efeaf6" }, bottom: { style: "pants", color: "#17131f" }, shoes: { style: "shoes", color: "#17131f" }, acc: ["watch"], voice: "#6ad0ff" });
def("a3_bex", { name: "Bex", height: 90, build: "average", figure: "curvy", skin: "#6e4329", hair: { style: "bun", color: "#ff3fa4" },
  top: { style: "tank", color: "#17131f" }, bottom: { style: "jeans", color: "#2a2836" }, shoes: { style: "boots", color: "#17131f" }, acc: ["tattoo", "earring"], voice: "#ff8a5a" });
// DJ Brandon Shine (fictional). Sunglasses indoors. Gold vest. Saturdays are his.
def("a3_brandon", { name: "DJ Brandon Shine", height: 102, build: "thin", skin: "#e0a27a", hair: { style: "slick", color: "#f2e07a" },
  top: { style: "vest", color: "#e0b030", color2: "#efeaf6" }, bottom: { style: "pants", color: "#17131f" }, shoes: { style: "shoes", color: "#efeaf6" },
  acc: ["shades", "chain", "earring"], voice: "#ffe45c" });
// Tiny, the door.
def("a3_tiny", { name: "Tiny", height: 106, build: "big", skin: "#57331f", hair: { style: "bald", color: "#1c1418" },
  top: { style: "bomber", color: "#17131f", color2: "#c0302c" }, bottom: { style: "pants", color: "#17131f" }, shoes: { style: "boots", color: "#0e0a12" }, acc: ["watch"], voice: "#c8c4d8" });
// Tanya Pruitt, niece of the dead collector. Scrubs, lanyard, a train to catch.
def("a3_tanya", { name: "Tanya", height: 90, figure: "curvy", skin: "#e8b48f", hair: { style: "ponytail", color: "#7a4a2a" },
  top: { style: "tee", color: "#3a9a9a", print: "stripe", printColor: "#2a7a7a" }, bottom: { style: "pants", color: "#3a9a9a" }, shoes: { style: "sneakers", color: "#efeaf6" }, acc: ["lanyard", "clipboard"], voice: "#ff9ad5" });
// Mort, record-fair dealer. Cap, suspenders, opinions.
def("a3_mort", { name: "Mort", height: 90, build: "stocky", skin: "#f1c7a5", hair: { style: "bald", color: "#c8c8d0" }, facial: "beard", facialColor: "#d8d8e0",
  top: { style: "shirt", color: "#c8b890" }, bottom: { style: "pants", color: "#5a4a3a" }, shoes: { style: "shoes", color: "#3a2418" }, acc: ["cap", "glasses"], hatColor: "#2a3a5a", voice: "#d8a060" });
// Priya, rival digger. Headphones around her neck and a rucksack full of other people's finds.
def("a3_priya", { name: "Priya", height: 88, skin: "#b07650", hair: { style: "long", color: "#1c1418" },
  top: { style: "hoodie", color: "#8a5ac8" }, bottom: { style: "cargo", color: "#2a3a2a" }, shoes: { style: "sneakers", color: "#ffd23f" }, acc: ["headphones", "bag"], headphonesOn: false, bagColor: "#2a5a3a", voice: "#8ab8ff" });
// Fair vendor
def("a3_vendor", { name: "Vendor", height: 92, build: "average", skin: "#8d5a3b", hair: { style: "locs", color: "#1c1418" },
  top: { style: "tee", color: "#e07a2a", print: "logo" }, bottom: { style: "shorts", color: "#2a2836" }, shoes: { style: "sneakers", color: "#17131f" }, acc: ["bucket"], hatColor: "#d8c0a0", voice: "#ffb070" });
// PTA bake-sale lady, fair
def("a3_pta", { name: "PTA lady", height: 88, build: "stocky", figure: "curvy", skin: "#e8b48f", hair: { style: "bun", color: "#c8c8d0" },
  top: { style: "cardigan", color: "#c07a9a", color2: "#f4efe4" }, bottom: { style: "pants", color: "#4a4a5a" }, shoes: { style: "shoes", color: "#3a2418" }, acc: ["glasses", "chain"], voice: "#ffb8d8" });
// Platform sleeper
def("a3_sleeper", { name: "sleeping guy", height: 92, build: "average", skin: "#c98a62", hair: { style: "messy", color: "#2e1d16" },
  top: { style: "coat", color: "#4a4a58", color2: "#2a2836" }, bottom: { style: "pants", color: "#2a2a36" }, shoes: { style: "boots", color: "#3a2418" }, acc: ["beanie"], hatColor: "#6a2a3a", voice: "#aab0c0" });
// Cameos (real DJs, cameoOk in lore.js): brief, kind, generic. Ids follow cast.js convention, prefixed for this act.
def("a3_dj_danny_krivit", { name: "Danny Krivit", height: 94, skin: "#e0a27a", hair: { style: "short", color: "#9a9aa6" },
  top: { style: "tee", color: "#2a2836" }, bottom: { style: "jeans", color: "#2a2836" }, shoes: { style: "sneakers", color: "#17131f" }, acc: ["headphones"], headphonesOn: false, voice: "#e8e4f0" });
def("a3_dj_louie_vega", { name: "Louie Vega", height: 94, skin: "#c98a62", hair: { style: "short", color: "#1c1418" }, facial: "stubble",
  top: { style: "jacket", color: "#1c1a24", color2: "#c0302c" }, bottom: { style: "pants", color: "#17131f" }, shoes: { style: "sneakers", color: "#efeaf6" }, acc: ["headphones"], headphonesOn: false, voice: "#ffd8a0" });
// Marcus's plus-three (generic party people for the line outside)

/* recurring cast restyled for this act */
RP.chars.update("kosmo", { top: { style: "coat", color: "#2a1c3a", color2: "#c0302c" } });

/* ======================================================================
   voices (speakers with no sprite on screen)
   ====================================================================== */
RP.voice("a3_lou", { color: "#9be15d", prefix: "", anchor: [331, 118] });
RP.voice("a3_odph", { color: "#ffc44d", prefix: "ODESSA (TEXT): ", anchor: S => [RP.actor("kid") ? RP.actor("kid").x : 320, 40] });
RP.voice("a3_odoff", { color: "#ffc44d", prefix: "ODESSA (OFF): ", anchor: [320, 50] });
RP.voice("a3_pa", { color: "#e8e4f0", prefix: "PA: ", anchor: [320, 34] });
RP.voice("a3_mta", { color: "#ffd23f", prefix: "MTA: ", anchor: [320, 40] });
RP.voice("a3_cell", { color: "#ffffff", prefix: "", anchor: S => [RP.actor("kid") ? RP.actor("kid").x : 320, 60] });

/* ======================================================================
   helpers shared by all act 3 files
   ====================================================================== */
A3.KOSMO_NAME = "Wendell";
A3.misspell = function (name) {
  let n = String(name || "DJ NOBODY").replace(/^DJ\s+/i, "") || "NOBODY";
  const s = n.split("");
  if (s.length >= 4) { const i = Math.floor(s.length / 2); const t = s[i]; s[i] = s[i - 1]; s[i - 1] = t; } else s.push(s[s.length - 1] || "Y");
  return "DJ " + s.join("");
};
A3.billed = S => A3.misspell(S.name);
A3.djName = S => (String(S.name || "DJ NOBODY").toUpperCase().startsWith("DJ ") ? S.name : "DJ " + (S.name || "NOBODY"));

/* minutes-of-the-week clock labels (HUD text) */
A3.clock = RP.setClock;

/* run a mini-game and make sure the story can never dead-end on it:
   a missing module or a won game is ok; a lost game offers a retry and, after `tries` losses, a graceful assist. */
A3.mg = async function (id, params, opt = {}) {
  const tries = opt.tries || 2;
  for (let i = 0; ; i++) {
    const res = (await RP.mg.play(id, params)) || { ok: true, missing: true };
    if (res.missing || res.ok !== false) return Object.assign({ ok: true }, res);
    if (opt.onFail) await opt.onFail(i, res);
    if (i + 1 >= tries) { if (opt.assist) await opt.assist(); return Object.assign({}, res, { ok: true, assisted: true }); }
    const j = await RP.choose(["Again", opt.giveUp || "Not right now"]);
    if (j === 1) return Object.assign({}, res, { ok: false, giveUp: true });
  }
};

/* the pool of records offered to the set mini-games: whatever is in the crate, padded so there are always enough */
A3.pool = function (S, min) {
  const pad = ["everything_but_the_girl_missing", "phuture_acid_tracks", "white_nyc93", "cece_peniston_finally", "mood_ii_swing_closer", "hardrive_deep_inside",
    "sylvester_you_make_me_feel_mighty_real", "inner_city_good_life", "crystal_waters_gypsy_woman", "mr_fingers_washing_machine_can_you_feel_it", "francois_k_fk_ep", "kerri_chandler_the_mood_ep"];
  const out = (S.records || []).filter(id => id !== "grover_washington_jr_winelight" || true);
  for (const id of pad) { if (out.length >= (min || 8)) break; if (!out.includes(id)) out.push(id); }
  return out;
};

/* the napkin: Odessa's conditions for the Saturday slot, with live check marks */
A3.tasks = function (S) {
  const f = S.f;
  return [
    [!!(f.a3_cdj && f.a3_dj350), "Gear that doesn't embarrass me. (Eddie knows a guy. Eddie is the guy.)"],
    [!!f.a3_estateDone, "A sound of my own. (Ray says: dig. Ray says it rudely.)"],
    [!!f.a3_promo, "A crowd. (Phone. Fingers. Hashtags.)"],
    [!!f.a3_saturday, "Anniversary Thursday. Don't embarrass ME."]
  ];
};
A3.todoLeft = function (S) {
  const f = S.f, left = [];
  if (!f.a3_cdj) left.push("buy decks from Eddie");
  if (!f.a3_dj350) left.push("see about a mixer (Gus has opinions and snacks)");
  if (!f.a3_hunt) left.push("find that grail (Ray, the record fair)");
  else if (!f.a3_estateDone) left.push("get out to the Queens estate sale");
  if (!f.a3_promo) left.push("promote (the laptop, a week of posting)");
  return left;
};
A3.sleepReady = S => !A3.todoLeft(S).length;

/* cached sprites: paint a prop once into an offscreen canvas, blit it every frame from a room's `sprites` list.
   fn(ctx) may return emissive rects (relative to the canvas); draw.em(ox, oy) gives them in room coordinates. */
A3.sprite = function (key, w, h, fn) {
  let cv = null, em = [];
  const get = () => {
    if (!cv) { cv = U.mk(w, h); try { const r = fn(cv.getContext("2d")); if (Array.isArray(r)) em = r; } catch (e) { console.error("sprite " + key, e); } }
    return cv;
  };
  const draw = function (c, x, y, sx, sy, sw, sh) {
    const k = get();
    if (sw != null) c.drawImage(k, sx, sy, sw, sh, Math.round(x), Math.round(y), sw, sh); else c.drawImage(k, Math.round(x), Math.round(y));
  };
  draw.em = (ox, oy) => { get(); return em.map(r => [r[0] + ox, r[1] + oy, r[2], r[3]]); };
  draw.canvas = get;
  return draw;
};
A3.hex = U.hex;
A3.pixelShadow = function (c, x, y, w, h, a) {
  c.save(); c.globalAlpha = a == null ? 0.35 : a; c.fillStyle = "#0c0618";
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) if (U.bayer(x + xx, y + yy) < (1 - yy / h) * 14) c.fillRect(x + xx, y + yy, 1, 1);
  c.restore();
};

/* ======================================================================
   items
   ====================================================================== */
RP.item("a3_bag", { name: "record bag", short: "Rec bag",
  icon: c => { I.bag(c, "#5a3a2a"); ell(c, 16, 12, 5, 5, "#141218"); ell(c, 16, 12, 2, 2, "#ff3fa4"); P(c, 16, 12, "#000"); },
  look: S => "My record bag. " + S.records.length + " records, a spare slipmat and the smell of every club I've ever sweated in.",
  use: "The records stay in the bag until the booth. That's the rule." });
RP.item("a3_usb", { name: "tracks USB", short: "USB", icon: c => { I.usb(c, "#39d0ff"); R(c, 8, 10, 6, 5, "#efeaf6"); R(c, 9, 12, 4, 1, "#1d1622"); },
  look: S => S.f.a3_swap && !S.f.a3_usbBack ? "My USB. It looks exactly the same. That's what worries me." : "My tracks USB. Sixteen gigs, zero cats. I'm a changed person.",
  use: S => (S.f.a3_swap && !S.f.a3_usbBack) ? "It plugs into the CDJs. I'd rather not find out what's on it again." : "It goes in the CDJ. Not in my ear. We've been over this." });
RP.item("a3_list", { name: "Odessa's napkin", short: "Napkin", icon: c => { R(c, 5, 4, 22, 17, "#f4efe4"); R(c, 5, 4, 22, 1, "#ffffff"); for (let y = 8; y < 19; y += 3) R(c, 8, y, 16, 1, "#c0302c"); P(c, 7, 8, "#c0302c"); },
  useAlone: true,
  look: S => ["Odessa's napkin. Lipstick on a bar napkin. \"THE DEAL.\""].concat(A3.tasks(S).map(([d, t], i) => (d ? "[x] " : "[ ] ") + (i + 1) + ". " + t)),
  use: S => ["Odessa's napkin. Lipstick on a bar napkin. \"THE DEAL.\""].concat(A3.tasks(S).map(([d, t], i) => (d ? "[x] " : "[ ] ") + (i + 1) + ". " + t)) });
RP.item("a3_chips", { name: "salt & vinegar chips", short: "Chips", icon: c => { R(c, 8, 3, 16, 19, "#3a8ad8"); R(c, 8, 3, 16, 2, "#9fd0ff"); R(c, 8, 20, 16, 2, "#1f4a96"); txt(c, "S&V", 10, 10, "#ffffff"); R(c, 10, 15, 12, 2, "#ffd23f"); },
  look: "Salt & vinegar chips, $2 from the bodega. The sort of thing you'd only buy for a man you're afraid of.", use: "They're not for me. I know. It hurts." });
RP.item("a3_rinds", { name: "pork rinds", short: "Rinds", icon: c => { R(c, 8, 3, 16, 19, "#e0802a"); R(c, 8, 3, 16, 2, "#ffc080"); txt(c, "RIND", 10, 10, "#fff6dc"); },
  look: "Pork rinds. Crunchy, loud, aggressively beige. Not for me.", use: "I'd eat them, but they're evidence of a bad idea." });
RP.item("a3_pickle", { name: "bodega pickle", short: "Pickle", icon: c => { ell(c, 16, 13, 4, 9, "#4a8a2a"); ell(c, 15, 12, 2, 7, "#6ab84a"); R(c, 15, 3, 3, 2, "#2a5a1a"); P(c, 14, 8, "#9be15d"); P(c, 17, 16, "#2a5a1a"); },
  look: "A pickle. In a bag. With some of the brine. This is what New York has instead of a minibar.", use: "I'm not hungry. I'm... something. It's a mood." });
RP.item("a3_key_nico", { name: "Nico's DVR key", short: "Nico key", icon: c => I.key(c, "#6ad0ff"), look: "A small brass key on a blue bar-towel tag. It says NICO, in a nervous hand." });
RP.item("a3_key_bex", { name: "Bex's DVR key", short: "Bex key", icon: c => I.key(c, "#ff8a5a"), look: "A small brass key with a pink guitar-pick tag. It says BEX. It says it loudly." });
RP.item("a3_footage", { name: "bar-cam clip", short: "Clip", icon: c => { I.usb(c, "#c0302c"); R(c, 8, 10, 6, 4, "#efeaf6"); P(c, 10, 11, "#c0302c"); },
  look: "A thumb drive with last hour of the bar camera. Brandon, the booth, my USB, a fake yawn. Cinema.", use: "I'm not watching it again. I'm going to make a certain someone watch it." });

/* ======================================================================
   locations (subway map pins on the 320x200 map)
   ====================================================================== */
RP.location({ id: "a3_loc_apartment", act: 3, label: "Apartment 4C", area: "Bushwick", room: "a3_apartment", x: 560, y: 232, face: "left", fare: 0, mx: 238, my: 148 });
RP.location({ id: "a3_loc_halcyon", act: 3, label: "The Halcyon Room", area: "Lower East Side", room: "a3_street", x: 70, y: 238, face: "right", fare: 0, mx: 152, my: 124 });
RP.location({ id: "a3_loc_deepcuts", act: 3, label: "Deep Cuts", area: "East Village", room: "a3_deepcuts", x: 80, y: 232, face: "right", fare: 0, mx: 156, my: 104 });
RP.location({ id: "a3_loc_fair", act: 3, label: "Sunday Record Fair", area: "Williamsburg", room: "a3_fair", x: 70, y: 236, face: "right", fare: 0, mx: 196, my: 100 });
RP.location({ id: "a3_loc_estate", act: 3, label: "The Pruitt house", area: "Woodside, Queens", room: "a3_estate", x: 70, y: 236, face: "right", fare: 0, mx: 272, my: 82 });

/* ======================================================================
   the act
   ====================================================================== */
RP.defineAct({
  n: 3, id: "act3", title: "CLUB DJ", sub: "Lower East Side, six months later",
  blurb: "A Thursday residency at the Halcyon Room. Gear to buy, a grail to find, a rival to survive. Turn Thursday into Saturday.",
  start: { room: "a3_apartment", x: 300, y: 232, face: "front" },
  setup(S, carry) {
    const base = ["everything_but_the_girl_missing", "phuture_acid_tracks", "white_nyc93", "cece_peniston_finally", "mood_ii_swing_closer", "hardrive_deep_inside",
      "sylvester_you_make_me_feel_mighty_real", "inner_city_good_life", "crystal_waters_gypsy_woman", "mr_fingers_washing_machine_can_you_feel_it", "francois_k_fk_ep", "kerri_chandler_the_mood_ep"];
    if (!carry) { S.money = 120; S.followers = 400; S.records = base.slice(); }
    else { if (!Array.isArray(S.records)) S.records = []; ["everything_but_the_girl_missing", "phuture_acid_tracks", "white_nyc93", "cece_peniston_finally"].forEach(id => { if (!S.records.includes(id)) S.records.push(id); }); if (!S.records.includes("sylvester_you_make_me_feel_mighty_real")) S.records.push("sylvester_you_make_me_feel_mighty_real"); if (!(S.followers > 0)) S.followers = 400; if (!(S.money >= 0)) S.money = 120; }
    S.inv = ["phone", "wallet"];
    S.gear = Object.assign({ decks: "pioneer_cdj_350", turntables: "at_lp120_usb", mixer: "numark_m101usb", monitors: "krk_rokit_5_g4" }, carry ? S.gear : {});
    S.clock = "THU 4:10 PM";
    S.unlocked = ["a3_loc_apartment", "a3_loc_halcyon"];
    S.f.noTravel = false; S.f.__hideKid = false;
  },
  wardrobe: { top: { style: "jacket", color: "#2a2438", color2: "#17131f", print: null }, acc: ["headphones"], headphonesOn: false },
  async intro(S) {
    RP.actor("kid").face = "front";
    await RP.lines([
      "@nar Six months later.",
      "Thursday. I have a residency. I say that out loud sometimes, just to hear how it sounds.",
      "The Halcyon Room, Lower East Side. Ten to two. Nobody shows up before midnight.",
      "Odessa's three house rules: be early, stay sober, and bring Gus a snack. Nobody knows why the third one."
    ]);
  },
  doneTitle: "SATURDAY NIGHT",
  doneText: S => "The Halcyon Room. Anniversary Thursday. You followed Kosmo Delacroix (he called you " + A3.KOSMO_NAME + "), beat Brandon Shine's USB, and Odessa gave you Saturday. A booking agent in Europe just emailed.",
  combos: []
});
})();
