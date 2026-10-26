/* Act 3 — the Pruitt house, Woodside, Queens. Dead collector's estate sale: the whole collection (junk and gems),
   a pair of Technics SL-1210MK2s, and the grail on the platter. Flags: a3_estateSeen, a3_estatePaid, a3_estateDone,
   a3_grail (Loose Joints taken), a3_tt (Technics taken), a3_priyaAtEstate, a3_birdHeard. */
(function () {
"use strict";
const RP = window.RP;
const A3 = RP.A3;
const U = RP.u;
const PK = RP.PK;
const { R, P, ell, txt, txtC, txtW, bayer, mulberry, ramp, mix } = U;
const W = 640;

const GRAIL = "loose_joints_is_it_all_over_my_face";
// the dead collector's collection: gems from the real catalog, plus real dollar-bin junk
const COLLECTION = [
  "gwen_guthrie_padlock", "double_exposure_ten_percent", "dinosaur_l_go_bang", "peech_boys_dont_make_me_wait", "taana_gardner_heartbeat", "loleatta_holloway_love_sensation",
  "class_action_weekend", "strafe_set_it_off", "masters_at_work_blood_vibes_the_ha_dance", "donna_summer_i_feel_love", "chic_good_times",
  "snap_rhythm_is_a_dancer", "cc_music_factory_gonna_make_you_sweat", "black_box_ride_on_time", "reel_2_real_i_like_to_move_it", "grover_washington_jr_winelight"
];
const GEMS = ["gwen_guthrie_padlock", "double_exposure_ten_percent", "dinosaur_l_go_bang", "peech_boys_dont_make_me_wait", "taana_gardner_heartbeat", "loleatta_holloway_love_sensation", "class_action_weekend", "strafe_set_it_off"];

const stackSpr = A3.sprite("a3_est_stack", 60, 70, c => { PK.crate(c, 4, 16, { w: 36, h: 28, color: "#6a4a30", records: false, seed: 1001 }); PK.crate(c, 16, 0, { w: 36, h: 28, color: "#2f62b8", records: true, seed: 1002 }); [[8, 34], [30, 18], [40, 40]].forEach(([x, y]) => { R(c, x, y, 6, 4, "#ffd23f"); R(c, x, y, 6, 1, "#fff0a0"); }); });
const stackSpr2 = A3.sprite("a3_est_stack2", 60, 70, c => { PK.crate(c, 6, 20, { w: 36, h: 28, color: "#c0302c", records: true, seed: 1003 }); PK.crate(c, 6, 0, { w: 36, h: 28, color: "#4a4a5a", records: false, seed: 1004 }); [[12, 36], [26, 20]].forEach(([x, y]) => { R(c, x, y, 6, 4, "#ffd23f"); }); });
const boxSpr = A3.sprite("a3_est_box", 50, 40, c => { PK.cardboardBox(c, 4, 4, 34, 24, { seed: 1005 }); txt(c, "JAZZ", 10, 22, "#7a4a2a", 1, 0); R(c, 28, 24, 6, 4, "#ffd23f"); });
const armchair = A3.sprite("a3_est_chair", 90, 80, c => { // armchair under a dust sheet
  U.poly(c, [[6, 70], [8, 30], [20, 10], [70, 10], [82, 30], [84, 70]], "#d8d4c8"); U.poly(c, [[14, 66], [16, 34], [26, 18], [64, 18], [74, 34], [76, 66]], "#e8e4d8");
  for (let i = 0; i < 40; i++) { const x = 12 + (i * 17) % 66, y = 14 + (i * 11) % 52; R(c, x, y, 4, 1, i % 2 ? "#c0b8a8" : "#f4f0e4"); }
  R(c, 6, 68, 78, 3, "#a89c88"); R(c, 6, 70, 78, 1, "#6a5a48"); U.poly(c, [[8, 30], [20, 10], [24, 12], [14, 34]], "#c8c0b0");
  R(c, 70, 46, 8, 6, "#8a7a68"); // glasses on the arm? a hint of reading glasses
  R(c, 71, 47, 2, 2, "#17101e"); R(c, 75, 47, 2, 2, "#17101e"); R(c, 73, 48, 2, 1, "#17101e");
});
const cage = A3.sprite("a3_est_cage", 40, 66, c => {
  R(c, 4, 54, 32, 6, "#6a4a30"); R(c, 4, 54, 32, 1, "#a07850"); // stand base
  R(c, 18, 40, 4, 16, "#6a4a30");
  R(c, 6, 6, 28, 34, "#2a1c10"); for (let i = 0; i < 9; i++) R(c, 7 + i * 3, 6, 1, 34, "#c8c4d8"); R(c, 6, 6, 28, 1, "#e8e4f0"); R(c, 6, 38, 28, 2, "#8a7a50");
  R(c, 14, 0, 12, 7, "#c8c4d8"); R(c, 18, 0, 4, 2, "#8a86a0"); R(c, 6, 20, 28, 1, "#8a7a50");
  ell(c, 20, 28, 5, 5, "#5ad85a"); ell(c, 24, 25, 3, 3, "#ffd23f"); P(c, 25, 24, "#17101e"); R(c, 26, 26, 3, 1, "#e0802a"); R(c, 14, 31, 8, 2, "#2a8a2a"); R(c, 18, 33, 4, 4, "#e0a030");
});

function wallpaper(c, x, y, w, h) {
  R(c, x, y, w, h, "#b8c0a0");
  for (let yy = y; yy < y + h; yy += 12) for (let xx = x; xx < x + w; xx += 12) { const o = ((yy - y) / 12) % 2 ? 6 : 0; R(c, xx + o + 3, yy + 2, 4, 4, "#9aa888"); R(c, xx + o + 4, yy + 3, 2, 2, "#d8a0a8"); P(c, xx + o + 5, yy + 1, "#7a9068"); P(c, xx + o + 5, yy + 7, "#7a9068"); }
  for (let xx = x; xx < x + w; xx += 12) R(c, xx, y, 1, h, "#a8b090");
  PK.util.dshade(c, x, y, w, 34, "#1a1008", (px, py) => 1 - (py - y) / 34, 0.4);
  // water stain + peel
  PK.util.dshade(c, x + 300, y, 80, 80, "#6a5a3a", (px, py) => Math.max(0, 1 - Math.hypot((px - (x + 340)) / 36, (py - y) / 60)), 0.3);
}

function paint(c, S) {
  const em = [];
  wallpaper(c, 0, 0, W, 168);
  // wainscoting
  R(c, 0, 112, W, 52, "#6a4a38"); R(c, 0, 112, W, 3, "#a07850"); R(c, 0, 163, W, 1, "#2a1810");
  for (let x = 4; x < W; x += 36) { R(c, x, 118, 30, 40, "#7a5640"); R(c, x, 118, 30, 1, "#a07850"); R(c, x, 157, 30, 1, "#3a2418"); R(c, x, 118, 1, 40, "#9a6a50"); R(c, x + 29, 118, 1, 40, "#3a2418"); }
  PK.baseboard(c, 0, 158, W, { color: "#3a2418", h: 9, seed: 1010 });
  PK.planks(c, 0, 168, W, 88, { base: "#8a5a3e", seed: 1011 });
  // shelving units with records, floor to ceiling
  [62, 168, 274].forEach((x, i) => PK.shelf(c, x, 8, 100, 152, { items: "records", wood: "#6a4030", rowH: 36, seed: 1012 + i }));
  // door (left): wood, taped sign
  PK.door(c, 6, 40, 50, 126, { color: "#6a4a3a", panels: 4, knob: true, peephole: true, number: "", seed: 1020 });
  R(c, 12, 70, 38, 22, "#f4efe4"); R(c, 12, 70, 38, 1, "#fff"); txtC(c, "ESTATE", 31, 73, "#c0302c", 1, 1); txtC(c, "SALE", 31, 79, "#c0302c", 1, 1); txtC(c, "EVERYTHING", 31, 85, "#17101e", 1, 1);
  // Hal's listening corner: table, two Technics, speakers, lamp
  PK.table(c, 392, 128, 150, 46, { color: "#5a4a3a", top: "#8a7a62", seed: 1021 });
  const tt = S.f.a3_tt;
  if (!tt) { em.push.apply(em, PK.turntable(c, 396, 98, { model: "technics", label: "#c0302c", seed: 1022, record: false })); em.push.apply(em, PK.turntable(c, 468, 98, { model: "technics", label: "#2f62b8", seed: 1023, record: false })); }
  else { R(c, 396, 128, 144, 6, "#6a5a4a"); txt(c, "(NO TURNTABLES. BRING FRIENDS.)", 400, 120, "#a09078", 1, 1); }
  // dust sheet half over them
  if (!tt && !S.f.a3_estatePaid) { U.poly(c, [[394, 96], [470, 90], [476, 130], [394, 132]], "#d8d4c8"); for (let i = 0; i < 20; i++) R(c, 396 + (i * 7) % 76, 92 + (i * 5) % 36, 4, 1, i % 2 ? "#c0b8a8" : "#f4f0e4"); }
  R(c, 372, 92, 20, 40, "#2a2018"); R(c, 372, 92, 20, 1, "#6a5a48"); ell(c, 382, 106, 6, 6, "#4a3a28"); ell(c, 382, 106, 3, 3, "#1a1008"); ell(c, 382, 124, 4, 4, "#4a3a28");
  R(c, 542, 92, 20, 40, "#2a2018"); R(c, 542, 92, 20, 1, "#6a5a48"); ell(c, 552, 106, 6, 6, "#4a3a28"); ell(c, 552, 106, 3, 3, "#1a1008"); ell(c, 552, 124, 4, 4, "#4a3a28");
  em.push.apply(em, PK.lamp(c, 418, 62, { kind: "floor", on: true, color: "#e8d8a8" }));
  // window with blinds (right)
  em.push.apply(em, PK.window(c, 568, 30, 62, 70, { view: "brick", time: "day", blinds: 0.5, frame: "#e8dcc8", seed: 1024 }));
  // clock stopped at 3:15, photos of Hal
  PK.clock(c, 22, 14, { d: 18, hour: 3, min: 15 });
  [[580, 108, "#2a2a3a"], [602, 110, "#e8c8a0"]].forEach(([x, y, col], i) => PK.frame(c, x, y, 20, 26, { palette: [col, "#c8905a", "#f2d0a8", "#fff0d8"], kind: "portrait", seed: 1025 + i }));
  // rug
  PK.rug(c, 160, 222, 230, 30, { colors: ["#6a2a2a", "#c8a860", "#8a3a3a"] });
  // price stickers on shelves
  for (let i = 0; i < 40; i++) { const x = 66 + (i * 37) % 300, y = 14 + (i * 41) % 140; R(c, x, y, 4, 3, "#ffd23f"); }
  return em;
}

function light(S) {
  return { ambient: "#78685c", lights: [{ x: 418, y: 70, r: 210, color: "#ffe0a0", steps: 5, sy: 1.1 }, { x: 590, y: 64, r: 200, color: "#8aa8ff", steps: 4 }, { x: 220, y: 10, r: 260, color: "#ffd890", steps: 3, power: 0.6 }, { box: [6, 40, 50, 126], r: 80, color: "#ffe8c0", steps: 2, power: 0.5 }],
    halos: [{ x: 418, y: 64, r: 24, color: "#ffd890", strength: 0.9 }], rims: [{ x: 590, y: 70, r: 260, color: "#8aa8ff" }, { x: 418, y: 90, r: 200, color: "#ffd890" }], key: { x: 418, y: 40 }, shadow: 0.6 };
}

/* ---- scripts ---- */
async function priyaArgument(S) {
  S.f.a3_priyaAtEstate = true;
  await RP.lines(["@a3_priya I'll give you eighty for the best twenty. Cash. Right now.", "@a3_tanya Whole thing. One buyer. I'm not splitting it. I've got a train to catch and a cat to feed.", "@a3_priya That's ridiculous. I only want the good ones.",
    "@a3_tanya Then you can pay for the bad ones too. They're the same weight."]);
}
async function tanyaTalk(S) {
  if (S.f.a3_estateDone) { await RP.lines(["@a3_tanya Everything's yours. Lock up when you leave. Or don't. I won't know. I'll be on the train."]); return; }
  if (S.f.a3_estatePaid) { await RP.lines(["@a3_tanya It's all yours. Sort it, sell it, keep it, burn it. I'm done."]); return; }
  if (S.f.a3_priyaAtEstate) { await RP.lines(["@a3_priya Fine. YOU deal with her."]); }
  await RP.lines(["Hi. I'm here for the collection. Hal Pruitt's?", "@a3_tanya Oh. Thank God. Another one. Are you buying or are you a 'looky-loo'?",
    "@a3_tanya My uncle Hal had sixty years of records. I have a train at five and a cat at home. The whole house. All of it. Whole collection or nothing.",
    "@a3_tanya Ninety dollars. The turntables are in. So's the parakeet. He's free with purchase. No, he's NOT free. I mean he IS. Please."]);
  const price = Math.min(90, S.money);
  const opts = ["Pay $" + price + ". Done.", "Haggle: 'My name is on a flyer. Almost.'", "Let me look around first."];
  const i = await RP.choose(opts);
  if (i === 2) { await RP.say("Take your time. But time is money. And money is my train.", "a3_tanya"); return; }
  let pay = price;
  if (i === 1) {
    await RP.lines(["I'm a resident DJ. At the Halcyon Room. I will play your uncle's records for a hundred people.", "@a3_tanya ...He'd have liked that. He didn't like people, but he liked the idea of people. Eighty. Final."]);
    pay = Math.min(80, S.money);
  }
  if (S.money < 1) { await RP.lines(["@a3_tanya You have no money. I have no patience. Take it. Honestly. Just... take it.", "I will play every one of these in my uncle's honor. Starting with the bird."]); pay = 0; }
  if (pay) RP.money(-pay);
  S.f.a3_estatePaid = true;
  await RP.lines(["@a3_tanya Deal. It's yours. Good luck.", "Sixty years of one man's records. In a Queens living room. And I just bought it."]);
  await sortCollection(S, pay);
}
async function sortCollection(S, pay) {
  await RP.fadeTo(1, 700);
  RP.setClock("MON 1:20 PM");
  await RP.say("Hours later. Dust in my teeth, a crate in every direction, a pile of 'maybe' that's bigger than most people's collection.", "nar");
  await RP.fadeTo(0, 700);
  const res = await A3.mg("crateDigging", { records: COLLECTION, budget: pay, keepSlots: 8, difficulty: 2 }, { giveUp: "Later", tries: 1,
    onFail: async () => { await RP.lines(["I leave a lot of it in the crates. Some of it's good. I'll know later."]); } });
  const keep = (res.keep && res.keep.length ? res.keep : (res.missing || res.assisted || res.ok ? GEMS : [])).filter(id => RP.rec(id));
  const sold = (res.sold || []).filter(id => RP.rec(id));
  // crateDigging reports profit = cash from the dealer minus the lot price, so the dealer's cash is profit + what I paid
  const cash = Math.max(0, Math.round(res.cash != null ? res.cash : (res.profit != null ? res.profit + pay : (res.missing || res.assisted ? pay + 45 : 0))));
  keep.forEach(id => RP.addRecord(id));
  await RP.lines(["I keep " + keep.length + " records. The rest I stack in a box that says 'FOR THE NEXT SUCKER.'"]);
  if (S.f.a3_priyaAtEstate) {
    await RP.lines(["@a3_priya ...You keep the good ones. Fine. I'll take the rest off your hands. Fair price. Not a penny of it fair to ME."]);
    if (cash) { RP.money(cash); }
    await RP.lines(["@a3_priya Don't look at me like that. I get the junk. You get the glory. We both go home with something. Bye."]);
    S.f.a3_priyaAtEstate = false;
  } else if (cash) { RP.money(cash); await RP.say("A junk dealer takes the rest for $" + cash + ". It's an honest hustle."); }
  S.f.a3_dug = true;
  await RP.lines(["Now the turntables. And whatever's on that platter."]);
}
async function takeGrail(S) {
  if (!S.f.a3_estatePaid) { await RP.lines(["There's a record on the left platter, under the dust sheet. It's not mine yet. 'Everything must go' is a promise. Pay first."]); return; }
  if (!S.f.a3_dug) { await RP.say("I should sort the collection first. It's a lot. It's the whole house."); return; }
  if (S.f.a3_grail) { await RP.say("It's in the bag, flat and snug. I check on it every ten minutes."); return; }
  S.f.a3_grail = true;
  RP.addRecord(GRAIL);
  await RP.lines(["I lift the dust sheet. On the platter, where Hal left it: a record.", "Loose Joints. \"Is It All Over My Face?\" West End Records, 1980. Written and produced by Arthur Russell and Steve D'Acquisto.",
    "Larry Levan's remix is the one everybody knows. And this is a clean copy. The last thing Hal played.",
    "It's in a plain sleeve. In his handwriting: 'FOR COMPANY.'", "I'm not going to cry. I'm going to look at the bird, for a sec."]);
  RP.sfx("success");
  await maybeFinish(S);
}
async function takeTT(S) {
  if (!S.f.a3_estatePaid) { await RP.say("Two Technics SL-1210MK2s under a dust sheet. They're beautiful. They're not mine. Yet."); return; }
  if (!S.f.a3_dug) { await RP.say("First the records. The turntables are the dessert."); return; }
  if (S.f.a3_tt) { await RP.say("Already got them. My back says 'thanks,' in a very sarcastic voice."); return; }
  S.f.a3_tt = true;
  RP.setGear("turntables", "technics_sl_1210mk2");
  RP.relight();
  await RP.lines(["Technics SL-1210MK2. Satin black, quartz-locked. Same family as the SL-1200, the line Panasonic ended in 2010.", "I carry them out one at a time. Tanya helps with the second. 'These weigh a ton,' she says. 'My uncle called them his grandchildren.'",
    "Two turntables. A pair. The first pair I've ever owned that wasn't a compromise."]);
  RP.sfx("success");
  await maybeFinish(S);
}
async function maybeFinish(S) {
  if (S.f.a3_grail && S.f.a3_tt && !S.f.a3_estateDone) {
    S.f.a3_estateDone = true;
    await RP.lines(["A grail. Two turntables. A bird. Wait. Not the bird.", "@a3_tanya Take the bird. Please.", "...Maybe next time. Gerald would be jealous."]);
    RP.text("RAY", "Heard you got a house full of Hal Pruitt. Don't tell me about it. Come by. I'll pretend I'm not jealous. -R");
    RP.text("ODESSA", "Saw your socials. Estate sale? Technics?? Bring one, we're talking Saturday. -O", true);
  }
}
async function birdTalk(S) {
  S.f.a3_birdHeard = true;
  await RP.say("Hey, Bernard. Who's a good bird?");
  RP.sfx("blip");
  await RP.say("IS IT ALL OVER MY FACE? IS IT ALL OVER MY FACE?", "a3_bernard");
  await RP.lines(["...Hal taught the bird the record. Of course he did.", "So the grail's in this house. Or at least the bird's convinced it is."]);
}
RP.voice("a3_bernard", { color: "#5ad85a", prefix: "BERNARD: ", anchor: [32, 120] });

RP.room({
  id: "a3_estate", act: 3, name: "The Pruitt house",
  paint, light,
  cacheKey: S => [S.f.a3_tt ? "t" : "", S.f.a3_estatePaid ? "p" : ""].join(""),
  lightKey: S => "e",
  ambience: "room",
  music: null,
  walk: [[8, 206], [632, 206], [632, 252], [8, 252]],
  start: { x: 70, y: 232, face: "right" },
  fx: [{ type: "dust", rect: [40, 30, 580, 180], count: 44, color: "#fff4d6" }],
  sprites: [
    { y: 232, draw: c => stackSpr(c, 244, 176) },
    { y: 240, draw: c => stackSpr2(c, 340, 186) },
    { y: 226, draw: c => boxSpr(c, 120, 196) },
    { y: 198, draw: c => armchair(c, 520, 132) },
    { y: 212, draw: c => cage(c, 22, 150) }
  ],
  actors: [
    { id: "a3_tanya", char: "a3_tanya", x: 104, y: 226, face: "right", act: "stand", name: "Tanya" },
    { id: "a3_priya", char: "a3_priya", x: 142, y: 230, face: "right", act: "stand", name: "Priya", vis: S => !!S.f.a3_priyaAtEstate }
  ],
  enter: async (S, from) => {
    if (!S.f.a3_estateSeen) {
      S.f.a3_estateSeen = true; RP.setClock("MON 11:05 AM");
      S.f.a3_priyaAtEstate = true;
      await RP.lines(["The Pruitt house. A Queens row house the color of a cough drop, and every room is a record store without a roof.", "Sixty years of one man's life: floor to ceiling shelves, milk crates on the stairs, price stickers on everything. It smells like cardboard, pipe tobacco and time."]);
      await priyaArgument(S);
    }
  },
  hotspots: [
    { id: "a3_e_door", name: "front door", r: [4, 38, 54, 130], z: 20, walk: [66, 220, "left"], look: "The front door. A flyer taped to it says ESTATE SALE. EVERYTHING MUST GO. Hal's life, itemized, with a coupon.", exit: S => "travel" },
    { id: "a3_tanya", name: "Tanya", z: 80, look: "Tanya Pruitt: Hal's niece. Hospital scrubs, a lanyard, a clipboard, and an expression like someone who's discovered that grief is mostly logistics.",
      talk: S => tanyaTalk(S), give: "@a3_tanya I don't need a thing. I need a buyer and a taxi." },
    { id: "a3_priya", name: "Priya", z: 80, look: "Priya, still scowling. The scowl's so permanent I think it's part of her haircut.", talk: ["Priya, we could split it?", "@a3_priya No."] },
    { id: "a3_e_shelves", name: "record shelves", rects: [[60, 8, 100, 152], [166, 8, 100, 152], [272, 8, 100, 152]], z: 20, walk: [220, 214, "back"],
      look: S => S.f.a3_estatePaid ? "Floor-to-ceiling shelves. Hal had a system I don't understand: records by color, then by year, then by 'did it make him cry.' The last category has its own shelf." : "Floor-to-ceiling shelves of records, each marked with a yellow sticker. Hal priced everything in advance. In pencil. And then crossed out and then re-priced.",
      use: S => S.f.a3_estatePaid ? (S.f.a3_dug ? "I've gone through it all. My fingers have dust and my head has a lot of titles in it." : "Right. Time to sort the collection. I should talk to Tanya... or just start. She's... on her phone.") : "Tanya's watching me. It's not mine yet. Money first.",
      pickup: S => S.f.a3_estatePaid ? "They're mine now. And they weigh more than I do." : "The sticker says 'EVERYTHING MUST GO.' It doesn't say 'to you.'" },
    { id: "a3_e_stacks", name: "crates", rects: [[244, 176, 60, 70], [340, 186, 60, 56], [118, 196, 50, 40]], z: 40, walk: [300, 236, "back"], look: "Milk crates stacked like a fort. Every one is full, and every one has a yellow sticker. I do a quick count: eleven crates and one cat tree. No cat.", pickup: "They're heavy. Rough guess: a thousand records. It's a number that hurts to carry." },
    { id: "a3_e_tt", name: "Technics turntables", r: [392, 92, 154, 44], z: 35, vis: S => !S.f.a3_tt, walk: [468, 214, "back"],
      look: S => S.f.a3_estatePaid ? "Two Technics SL-1210MK2s on a card table. Satin black. The nicest thing in the house. The satin-black counterpart of the SL-1200MK2, built like a small tank." : "Two Technics under a dust sheet. SL-1210MK2. Even under cloth they look like they could win a staring contest.",
      pickup: S => takeTT(S), use: S => takeTT(S), open: S => takeTT(S) },
    { id: "a3_e_platter", name: "record on the platter", r: [396, 98, 70, 36], z: 45, vis: S => !S.f.a3_grail, walk: [430, 214, "back"],
      look: S => S.f.a3_dug ? "A record on the left platter, under the sheet. It's a plain white sleeve with 'FOR COMPANY' written in pencil." : "There's a shape on the left platter, under the dust sheet. A record. Probably the last one he played.",
      pickup: S => takeGrail(S), use: S => takeGrail(S), open: S => takeGrail(S) },
    { id: "a3_e_bird", name: "Bernard (parakeet)", r: [20, 150, 40, 60], z: 38, walk: [74, 216, "left"], look: "Bernard, a parakeet in a cage. He's looking at me with the stern expression of a bird who's seen everything and approved of none of it.", talk: S => birdTalk(S), pickup: "He's not mine. And he's looking at my hand like it's lunch.", use: S => birdTalk(S) },
    { id: "a3_e_chair", name: "armchair", r: [518, 130, 94, 80], z: 30, walk: [560, 220, "back"], look: "A recliner under a dust sheet. On the arm: reading glasses folded neatly. Somebody's sat here for fifty years, listening. You can see the shape.", use: "I'd sit, but it's Hal's chair. It still has his shape in it.", pickup: "It's an armchair. It's not leaving without a crew and a prayer." },
    { id: "a3_e_clock", name: "clock", r: [20, 12, 22, 22], z: 20, look: "A clock that stopped at 3:15. Somebody didn't want to wind it after. I don't blame them." },
    { id: "a3_e_photos", name: "photos of Hal", rects: [[578, 106, 24, 30], [600, 108, 24, 30]], z: 20, walk: [590, 216, "back"], look: "Hal in his thirties with a crate of records on each shoulder. Hal at eighty with a record in each hand. Same grin. Same pose. Sixty years in two frames." },
    { id: "a3_e_window", name: "window", r: [566, 28, 66, 74], z: 18, look: "A window onto the neighbor's brick wall. A sliver of pale blue sky and a clothesline. Woodside, Queens, on a weekday morning, in miniature." },
    { id: "a3_e_lamp", name: "floor lamp", r: [408, 60, 24, 76], z: 36, walk: [420, 214, "back"], look: "A floor lamp with a cream shade, burned brown at the top where Hal read for thirty years. The light's the same color as the nicest part of an afternoon.", pickup: "It's the only thing in the room not for sale. A note on the base says 'HAL'S. DON'T.'" },
    { id: "a3_e_speaker", name: "speakers", rects: [[370, 90, 24, 44], [540, 90, 24, 44]], z: 33, look: "A pair of walnut speakers the size of mini-fridges. The tweeter on one has a tiny dent. He probably hit it with a record sleeve in 1991 and never forgave himself." }
  ],
  combos: [
    ["a3_pickle", "a3_e_bird", "I hold up the pickle. Bernard looks at it like it's an insult. He says nothing. For once."],
    ["a3_chips", "a3_e_bird", "I offer Bernard a chip. He takes it out of my hand like he's collecting rent."],
    ["a3_bag", "a3_e_shelves", "My bag's already full. But it's about to get fuller. Money first."]
  ],
  self: { look: "Covered in dust, standing in a dead man's living room with a bag of records. Respectful, and a little scared.", talk: "I say 'thank you' out loud to the room. It feels like the thing to do." }
});
})();
