/* Act 1 — a1_deepcuts: Deep Cuts Records, East Village. Ray points you at the dollar bins; go.Digging buys the
   closer (CeCe Peniston, "Finally", $2, or another affordable record). Ray gives you the flyer with your name
   spelled wrong. Flags: a1_rayMet, a1_dug, a1_closer (record id), a1_flyer, a1_rayJob. */
(function () {
"use strict";
const RP = window.RP;
const A1 = RP.a1, PK = RP.PK;
const { R, P, ell, line, poly, bayer, mulberry, clamp, txt, txtW, txtC, mix, ramp, mk } = RP.u;
const U = PK.util;
const W = 640, FY = 164;
const CLOSER_DEFAULT = "cece_peniston_finally";
const DOLLAR = ["cece_peniston_finally", "black_box_ride_on_time", "snap_rhythm_is_a_dancer", "cc_music_factory_gonna_make_you_sweat", "crystal_waters_gypsy_woman", "reel_2_real_i_like_to_move_it"];
const HOUSE = ["inner_city_good_life", "ultra_nate_free", "robin_s_show_me_love", "frankie_knuckles_the_whistle_song", "roger_sanchez_another_chance"];
const DISCO = ["chic_good_times", "cheryl_lynn_cheryl_lynn", "donna_summer_i_feel_love", "sylvester_you_make_me_feel_mighty_real"];

/* ---- the closer as an inventory item (same look as the bedroom records) ---- */
RP.item("a1_closer", { name: S => { const r = RP.rec(S.f.a1_closer || CLOSER_DEFAULT); return "\"" + r.title + "\" (" + r.artist + ")"; }, short: "Closer",
  icon: (c, S) => RP.icons.fromRecord(c, S.f.a1_closer || CLOSER_DEFAULT), iconKey: S => S.f.a1_closer || "x",
  look: S => { const r = RP.rec(S.f.a1_closer || CLOSER_DEFAULT); return r.artist + ", \"" + r.title + ".\" " + r.label + ", " + r.year + ". " + (r.fact || "") + " From the dollar bin. My closer."; },
  use: "Saturday. Last record of the vinyl hour. On real turntables." });

function neonReversed(c, text, x, y, color) {
  const w = text.length * 8 + 14, h = 24, tmp = mk(w + 40, h + 40), t = tmp.getContext("2d");
  const em = PK.neon(t, text, 20, 20, color, { scale: 2, tube: 2, spacing: 2, strength: 0.9, glowR: 8 });
  c.save(); c.translate(x + w, y); c.scale(-1, 1); c.drawImage(tmp, -20, -20); c.restore();
  return em.map(r => [x + w - (r[0] - 20 + r[2]) - 0, y + (r[1] - 20), r[2], r[3]]);
}

const B = {
  bins: (key, x) => A1.memo("dc_bins" + key, 140, 70, c => { PK.recordBins(c, 4, 6, 132, 58, { seed: 301 + x, wood: key === "a" ? "#a06a46" : "#8a5a3a" }); }),
  dollar: () => A1.memo("dc_dollar", 100, 58, c => {
    /* battered cardboard bins on a milk-crate stand, hand-lettered */
    for (let i = 0; i < 2; i++) {
      const bx = 4 + i * 48;
      R(c, bx, 22, 44, 30, "#a87a48"); R(c, bx, 22, 44, 2, "#d8a868"); R(c, bx, 50, 44, 2, "#5a3a1a"); R(c, bx + 43, 22, 1, 30, "#6a4a28");
      for (let k = 0; k < 11; k++) { const col = ["#c0302c", "#2f62b8", "#ffd23f", "#efeaf6", "#3fa66a", "#ff8a4c", "#a05cff", "#1d1622"][(k + i * 3) % 8]; R(c, bx + 3 + k * 3, 10 + (k % 3), 3, 14, col); R(c, bx + 3 + k * 3, 10 + (k % 3), 3, 1, mix(col, "#fff", 0.5)); }
      R(c, bx + 6, 38, 30, 8, "#efeaf6"); txt(c, i ? "$3" : "$1-2", bx + 12, 40, "#1d1622", 1);
      for (let k = 0; k < 4; k++) R(c, bx + 2 + k * 11, 52, 7, 4, "#2f62b8");
    }
    U.dshade(c, 0, 54, 100, 4, "#000", () => 0.8, 0.4);
  }),
  stack: () => A1.memo("dc_stack", 36, 30, c => { for (let i = 0; i < 4; i++) { const col = ["#c0302c", "#2f62b8", "#e8e4d0", "#ffd23f"][i]; R(c, 2 + (i % 2) * 2, 22 - i * 5, 30, 5, col); R(c, 2 + (i % 2) * 2, 22 - i * 5, 30, 1, mix(col, "#fff", 0.45)); } U.dshade(c, 0, 26, 34, 3, "#000", () => 0.8, 0.4); })
};

function paintDC(c, S) {
  const tod = A1.tod(S), night = tod === "night", dusk = tod === "dusk", em = [], rnd = mulberry(60);
  /* ---- walls ---- */
  PK.plaster(c, 0, 0, W, FY, { base: "#8a6a74", seed: 301, patches: 3, stains: 3, cracks: 2 });
  PK.brick(c, 0, 0, 160, FY, { base: "#7a3a34", mortar: "#8a7a80", worn: 0.5, seed: 302, bw: 13, bh: 5 });
  U.dshade(c, 0, 0, W, 24, "#140c24", (px, py) => 1 - py / 24, 0.5);
  R(c, 0, 0, W, 6, "#3a2a2a"); R(c, 0, 6, W, 1, "#6a5050");
  R(c, 0, FY - 10, W, 10, "#2a1c20"); R(c, 0, FY - 10, W, 1, "#5a4048");
  /* ---- floor ---- */
  PK.planks(c, 0, FY, W, 256 - FY, { base: "#8a5a3e", seed: 303, horizonY: 100 });
  /* rug in front of the counter */
  [[510, 226, 76, 12, "#5b2e8c"], [510, 226, 70, 10, "#7a3fb0"]].forEach(([px, py, rx, ry, col]) => ell(c, px, py, rx, ry, col)); ell(c, 510, 226, 40, 5, "#e0368f"); ell(c, 510, 226, 36, 4, "#5b2e8c");
  /* ---- front window + door (left) ---- */
  R(c, 70, 30, 84, 126, "#2a1c24"); R(c, 74, 34, 76, 118, night ? "#241a3a" : "#bcd8f0");
  U.gradient(c, 76, 36, 72, 114, night ? [[0, "#1a1236"], [1, "#5a3a58"]] : dusk ? [[0, "#7a5a8a"], [1, "#ffb878"]] : [[0, "#a8d0f8"], [1, "#f0e0c8"]], 1, true);
  /* the street outside: a brick wall across the road, a fire escape, a street lamp, passers-by */
  R(c, 76, 92, 72, 58, night ? "#2a1a30" : dusk ? "#7a4a50" : "#9a5a4a"); for (let yy = 92; yy < 150; yy += 5) for (let xx = 76 + ((yy / 5 | 0) % 2) * 6; xx < 148; xx += 12) R(c, xx, yy, 10, 4, night ? "#3a2440" : dusk ? "#8a5658" : "#ac6a58");
  for (let i = 0; i < 3; i++) { R(c, 82 + i * 22, 100, 12, 18, night ? "#ffd27a" : "#4a5a7a"); R(c, 82 + i * 22, 100, 12, 1, "#e8e4f0"); }
  R(c, 76, 142, 72, 8, night ? "#2a2434" : "#8a8698"); R(c, 76, 142, 72, 1, night ? "#4a4458" : "#c8c4d8");
  ell(c, 96, 134, 3, 3, "#e0a27a"); R(c, 94, 137, 5, 9, "#c0302c"); ell(c, 124, 134, 3, 3, "#8d5a3b"); R(c, 122, 137, 5, 9, "#2f62b8");
  if (night) em.push([84, 102, 8, 14]);
  U.dshade(c, 74, 34, 76, 118, "#ffffff", (px, py) => { const q = ((px - 74) * 0.9 + (py - 34) + 600) % 66; return q < 5 ? 1 : 0; }, 0.16);
  R(c, 74, 92, 76, 2, "#5a566c"); R(c, 111, 34, 3, 118, "#5a566c"); R(c, 74, 150, 76, 3, "#8a869c");
  em.push([76, 36, 72, 54]);
  em.push.apply(em, neonReversed(c, "DEEP CUTS", 82, 44, "#39d0ff"));
  /* door: glass w/ bell + OPEN */
  R(c, 10, 40, 56, 128, "#2a1c24"); R(c, 13, 44, 50, 122, "#c8c4d8"); U.gradient(c, 13, 44, 50, 122, [[0, night ? "#241a3a" : "#c8e4ff"], [1, night ? "#5a3a58" : "#fff0d0"]], 1, true);
  R(c, 36, 44, 3, 122, "#5a566c"); R(c, 13, 100, 50, 3, "#5a566c"); R(c, 13, 162, 50, 4, "#3a364a");
  em.push([15, 46, 46, 52]);
  R(c, 20, 76, 28, 10, "#c0302c"); txt(c, "OPEN", 25, 79, "#fff6dc"); R(c, 46, 56, 14, 10, "#ffd23f"); txt(c, "NO", 48, 57, "#2a1a10"); txt(c, "RAY", 47, 61, "#2a1a10");
  R(c, 62, 52, 4, 12, "#c8a050"); ell(c, 64, 66, 3, 3, "#e0c870");                                          /* bell */
  /* ---- back wall: record wall, signs ---- */
  PK.recordWall(c, 172, 26, 270, 100, { seed: 304, cell: 22, header: "STAFF PICKS: RAY'S ONLY" });
  R(c, 168, 22, 278, 3, "#6a4a30"); R(c, 168, 22, 278, 1, "#a07a52");
  R(c, 168, 128, 278, 4, "#6a4a30"); R(c, 168, 128, 278, 1, "#a07a52");
  /* hand-lettered signs */
  R(c, 176, 134, 100, 12, "#efeaf6"); txtC(c, "NO REFUNDS. NO REGRETS.", 226, 137, "#c0302c", 1); R(c, 280, 134, 60, 12, "#ffd23f"); txtC(c, "NO RAY.", 310, 137, "#2a1a10", 1);
  /* ---- right: counter back wall ---- */
  PK.poster(c, 458, 26, 40, 56, { palette: "neon", title: "NOWHERE", lines: ["SAT 10PM", "DJ ???"], seed: 305 });
  PK.poster(c, 504, 30, 36, 50, { palette: "sunset", title: "SUB FREQ", lines: ["12\" ONLY", "NO REFUNDS"], seed: 306 });
  PK.poster(c, 546, 26, 40, 56, { palette: "paper", title: "DEEP CUTS", lines: ["SINCE LONG AGO"], seed: 307 });
  R(c, 592, 28, 40, 54, "#1a1612"); R(c, 593, 29, 38, 52, "#26201a"); txt(c, "NOW", 600, 33, "#efeaf6"); txt(c, "PLAYING", 598, 40, "#efeaf6"); txt(c, "SOMETHING", 596, 50, "#ffd23f"); txt(c, "OLD", 604, 57, "#ffd23f"); txt(c, "(YOU WOULDN'T", 595, 66, "#8a869c"); txt(c, "KNOW IT)", 600, 72, "#8a869c");
  /* shelf of boxes + hanging lamps drawn in draw() */
  /* floor decor: skateboard, sticker clutter on the wall base */
  for (let i = 0; i < 30; i++) { R(c, 172 + rnd() * 270 | 0, 148 + rnd() * 10 | 0, 3 + rnd() * 5 | 0, 2, ["#c0302c", "#ffd23f", "#39d0ff", "#efeaf6"][i % 4]); }
  U.dshade(c, 0, FY - 14, W, 14, "#0c0618", (px, py) => (py - FY + 14) / 14, 0.35);
  /* window light on the floor */
  if (!night) U.dshade(c, 76, FY, 120, 60, dusk ? "#ffb070" : "#fff6dc", (px, py) => Math.max(0, 1 - (py - FY) / 60) * Math.max(0, 1 - Math.abs(px - 130) / 80), 0.2);
  return em;
}

function lightDC(S) {
  const night = A1.tod(S) === "night", dusk = A1.tod(S) === "dusk";
  return {
    ambient: dusk ? "#8a6a84" : night ? "#5a4c80" : "#9a8490",
    lights: [
      { box: [76, 36, 72, 114], r: 130, color: night ? "#9a8ad8" : dusk ? "#ff9a60" : "#fff4e0", steps: 4, power: night ? 0.5 : 0.95 },
      { x: 212, y: 18, r: 220, color: "#ffd89a", steps: 4, sy: 1.3 }, { x: 430, y: 18, r: 220, color: "#ffd89a", steps: 4, sy: 1.3 },
      { x: 540, y: 90, r: 190, color: "#ffc070", steps: 4, sy: 1.2 },
      { x: 110, y: 52, r: 100, color: "#39d0ff", steps: 3, power: 0.5, rim: true }
    ],
    halos: [{ x: 212, y: 18, r: 22, color: "#ffb860", strength: 0.9 }, { x: 430, y: 18, r: 22, color: "#ffb860", strength: 0.9 }, { x: 110, y: 52, r: 26, color: "#39d0ff", strength: 0.6 }],
    key: { x: 300, y: 18 }, shadow: 0.55
  };
}

function drawDC(c, S, t) {
  [212, 430].forEach(bx => { R(c, bx, 0, 1, 14, "#2a2020"); ell(c, bx, 17, 4, 4, "#fff4d6"); R(c, bx - 4, 12, 8, 3, "#3a2a2a"); });
  /* spinning record on the turntable */
  const a = t / 300;
  P(c, 528 + Math.cos(a) * 9, 129 + Math.sin(a) * 3, "#e8e4f0");
  P(c, 516, 118, Math.floor(t / 600) % 2 ? "#ff3a3a" : "#8a1a1a");
}

/* ---------- Ray, digging ---------- */
async function firstArrival(S) {
  S.f.a1_rayMet = true; RP.setClock("WED 11:30 AM");
  await RP.lines([
    "@ray Oh good. A customer. Or a lost tourist. Which is it.",
    "Dante sent me.",
    "@ray Dante. Of course. Dante sends everyone. Dante pays no one.",
    "@ray You're the opener at Nowhere. Saturday. Everybody's heard. Dante told the whole block, then forgot to tell you the details.",
    "I've got three records and a mystery white label.",
    "@ray Three records. That's not a set, that's a hobby.",
    "@ray A vinyl hour takes four. You need a closer. Something that makes grown adults sing in a bathroom.",
    "@ray The dollar bins. Where dreams go to get cheaper. Dig."
  ]);
}

async function addCloser(S, id) {
  RP.addRecord(id); S.f.a1_closer = id; S.f.a1_dug = true; RP.give("a1_closer"); RP.refreshInv();
}
async function finishDig(S) {
  const r = RP.rec(S.f.a1_closer);
  await RP.lines(["I walk out of the dollar bin with \"" + r.title + "\" by " + r.artist + ".", "@ray " + (S.f.a1_closer === CLOSER_DEFAULT ? "\"Finally.\" CeCe Peniston, A&M, 1991. Her debut single. You've sung it in a shower. Don't lie." : r.artist + ". " + r.year + ". " + r.label + ". Fine. It'll do. It might even work.")]);
  if (!S.f.a1_flyer) {
    S.f.a1_flyer = true; RP.give("a1_flyer");
    await RP.lines(["@ray Wait. Dante left a stack of flyers. This one's yours.", "(Ray hands me a flyer.) \"NOWHERE. SAT 10PM. OPENING: " + A1.mangle(S.name) + ".\"", "That's not my name.", "@ray It's close enough for Dante. He spells everything wrong. He spelled 'Tuesday' wrong once."]);
  }
  A1.setTime(S, "evening", "WED 5:48 PM");
  await RP.lines(["I look up. It's dark-ish orange outside. Hours went by in the dollar bin. That's how the dollar bin gets you.", "Right. Home. Load the tracks, sleep until Saturday."]);
  if (S.money < A1.fare && !S.f.a1_rayJob) await rayJob(S);
}
async function rayJob(S) {
  if (S.f.a1_rayJob) return;
  await RP.lines(["@ray You're short for the train? Everyone's short for the train.", "@ray There's a pile of milk crates in the back. Move them. Five bucks."]);
  const i = await RP.choose(["Sure. I'll carry crates.", "No thanks."]);
  if (i !== 0) { await RP.say("No thanks."); return; }
  S.f.a1_rayJob = true; RP.sfx("thump"); await RP.fadeTo(1, 400); await RP.say("Forty crates later...", "nar"); await RP.fadeTo(0, 400); RP.money(5);
  await RP.lines(["@ray Five bucks. Don't spend it all on candy.", "My back disagrees with my career path. But the fare's paid."]);
}
async function dig(S) {
  if (S.f.a1_closer && !S.f.a1_dig2) { S.f.a1_dig2 = true; await RP.lines(["@ray You've got your closer. The bins are open all day. Digging for more won't make you a better DJ.", "@ray It'll make you a poorer one."]); return; }
  if (S.f.a1_closer) { await RP.say("One closer is enough. Dante opens at ten, not on my dollar bin.", "ray"); return; }
  await RP.lines(["I roll up my sleeves. Literally. It's an ancient ritual.", "@ray Dollar bin's the cardboard one. Be gentle. And keep your fingers away from the Kenny G."]);
  const budget = Math.max(0, Math.min(S.money, 10));
  if (budget < 2) { await RP.lines(["@ray You're broke. ...Don't tell me. It's the dollar bin and you can't spend a dollar?", "@ray Take it. \"Finally.\" On the house. Don't tell anyone, I have a reputation. Of being mean."]); await addCloser(S, CLOSER_DEFAULT); await finishDig(S); return; }
  const res = await RP.mg.play("goDigging", {
    store: "Deep Cuts", budget,
    bins: [{ label: "DOLLAR BIN", records: DOLLAR }, { label: "HOUSE $5-$8", records: HOUSE }, { label: "DISCO", records: DISCO }],
    want: { vibe: "closer", genre: "house", maxPrice: 8 }, difficulty: 2
  });
  const bought = res && Array.isArray(res.bought) ? res.bought.filter(Boolean) : [];
  if (res && res.ok && bought.length) {
    const spent = res.spent != null ? res.spent : bought.reduce((s, id) => s + (RP.rec(id).price || 0), 0);
    const pick = bought.find(id => (RP.rec(id).vibe || []).includes("closer")) || bought[0];
    bought.forEach(id => RP.addRecord(id));
    if (spent > 0) RP.money(-Math.min(spent, S.money));
    await addCloser(S, pick);
    await finishDig(S);
    return;
  }
  /* missing game, gave up, or bought nothing: Ray hand-picks, never a dead end */
  await RP.lines([res && res.missing ? "@ray The crates are being reorganized. By me. Hold on." : "@ray You flipped through the whole bin and bought nothing. Impressive.", "@ray Here. I'll pick. Three closers. Pick one."]);
  const opts = [CLOSER_DEFAULT, "crystal_waters_gypsy_woman", "black_box_ride_on_time"].filter(id => RP.rec(id).price <= S.money + 1e-9 || id === CLOSER_DEFAULT);
  const i = await RP.choose(opts.map(id => RP.rec(id).artist + ", \"" + RP.rec(id).title + "\" ($" + RP.rec(id).price + ")"));
  const id = opts[i] || CLOSER_DEFAULT, price = RP.rec(id).price || 0;
  RP.money(-Math.min(price, S.money));
  await addCloser(S, id); await finishDig(S);
}

async function rayTalk(S) {
  await RP.convo([
    { text: "What makes a good closer?", once: true, run: () => RP.lines(["@ray Something everyone knows and nobody's ashamed to sing. A voice. A hook. Four-on-the-floor with a heart.", "@ray The kind of record you play when you want them to forgive the last three hours."]) },
    { text: "Tell me about \"Acid Tracks.\"", when: S => RP.hasRecord("phuture_acid_tracks"), once: true, run: () => RP.lines(["@ray Phuture. Trax Records, Chicago, 1987. Marshall Jefferson produced it. You warped it, didn't you.", "...In a hot car.", "@ray Of course you did. You sleep on it? Good. It's tradition. It's also the only thing that works."]) },
    { text: "What about \"Missing\"?", when: S => RP.hasRecord("everything_but_the_girl_missing"), once: true, run: () => RP.lines(["@ray Everything But The Girl. The Todd Terry mix. A 1995 Atlantic promo twelve-inch. People forget it's a promo. People forget a lot.", "@ray It's a warm-up. Don't open with a hit. A hit is a promise."]) },
    { text: "Ever seen this white label?", when: S => RP.has("white"), once: true, run: () => RP.lines(["@ray ...No label. No artist. 'NYC 93' in marker.", "@ray I've never seen it. Which means it's either garbage or the best record in your bag.", "@ray Keep it for after they've earned it."]) },
    { text: "Dante says hi.", once: true, run: () => RP.lines(["@ray Dante doesn't say hi. Dante says \"next week.\"", "@ray Whatever he's paying you, ask for it now. It's the only time he's honest. When he's asking."]) },
    { text: "Can I work off a train fare?", when: S => S.money < A1.fare && !S.f.a1_rayJob, run: async () => { await rayJob(S); } },
    { text: "Nice shop.", once: true, run: () => RP.lines(["@ray It's a record store. Nobody comes here for \"nice.\" They come for the thing they didn't know they needed.", "@ray And then they leave without it. And come back. It's a business model."]) },
    { text: "Later, Ray.", end: true }
  ]);
}

async function listen(S) {
  await RP.say("I slip on the headphones. A deep, dusty house groove spills out. It's a record I've never heard and already love.");
  try { const r = RP.rec("inner_city_good_life"); const lp = RP.audio.recordLoop(r, { volume: 0.5 }); lp.start(); await RP.wait(2200); lp.stop(0.4); } catch (e) { /* ignore */ }
  await RP.say("Ray, from across the store: \"Don't buy that. It's not for sale. It's mine.\"");
}

RP.room({
  id: "a1_deepcuts", act: 1, name: "Deep Cuts Records",
  paint: paintDC, draw: drawDC, light: lightDC,
  cacheKey: S => A1.tod(S), lightKey: S => A1.tod(S),
  ambience: "room",
  music: { genre: "house", bpm: 118, volume: 0.22, filter: ["lowpass", 1400] },
  walk: [[76, 208], [600, 208], [620, 250], [66, 250]],
  scale: [208, 0.96, 250, 1.04],
  start: { x: 78, y: 236, face: "right" },
  fx: [{ type: "dust", rect: [76, 36, 140, 130], count: 28, color: "#fff4d6" }, { type: "dust", rect: [440, 30, 190, 120], count: 10, color: "#ffd890" }],
  actors: [{ id: "ray", char: "ray", x: 578, y: 190, face: "front", act: "stand", name: "Ray" }],
  sprites: [
    { y: 232, draw: c => A1.blit(c, B.bins("a", 1), 176, 170) },
    { y: 232, draw: c => A1.blit(c, B.bins("b", 2), 330, 170) },
    { y: 246, draw: c => A1.blit(c, B.dollar(), 96, 196) },
    { y: 200, draw: (c, S, t) => {
      A1.blit(c, A1.memo("dc_counter", 200, 66, cc => { PK.counter(cc, 5, 12, 190, 50, { top: "#3a3040", front: "#5a3a4a", seed: 308 }); }), 440, 138);
      A1.blit(c, A1.memo("dc_tt", 70, 34, cc => { PK.turntable(cc, 2, 2, { model: "budget", label: "#39d0ff" }); }), 486, 114);
      A1.blit(c, A1.memo("dc_reg", 36, 40, cc => { PK.cashRegister(cc, 2, 12, {}); }), 598, 108);
      A1.blit(c, B.stack(), 446, 118);
      R(c, 562, 136, 10, 8, "#efeaf6"); R(c, 562, 134, 10, 3, "#c0302c"); R(c, 563, 133, 8, 1, "#c8c4d8");                 /* mug */
    } },
    { y: 244, draw: c => A1.blit(c, A1.memo("dc_stool", 28, 46, cc => { PK.chair(cc, 2, 2, { kind: "stool", color: "#6a2a3a" }); }), 454, 206) }
  ],
  enter: async (S, from) => {
    S.f.noTravel = false;
    if (!S.f.a1_rayMet) await firstArrival(S);
  },
  hotspots: [
    { id: "dcDoor", name: "door to the street", r: [8, 40, 60, 128], z: 30, walk: [78, 232, "left"], look: "The door to East Seventh. A bell on a string and a sign: NO RAY. I don't know what it means. I'm scared to find out.",
      exit: S => S.f.a1_closer ? A1.travelExit(S, true) : "I came for a closer, and I'm not leaving without one. Ray would never let me forget it. Or let me back in." },
    { id: "dcWindow", name: "shop window", r: [70, 30, 86, 126], z: 20, walk: [112, 224, "back"], look: "The window: a neon DEEP CUTS (backwards from in here) and a slice of East Village. A kid in a red shirt, a guy in blue, a street I'd love to live on if I had $2,000 in my pocket.", open: "It's a window. Ray likes the draft. It's part of his personality.", push: "I tap the glass. A pigeon outside looks offended.", pickup: "That's a window. It's not for sale. Not even in the dollar bin." },
    { id: "dollar", name: "dollar bins", r: [94, 196, 104, 58], z: 40, walk: [150, 238, "back"],
      look: "The dollar bins: two battered cardboard boxes on milk crates. A sign in Ray's handwriting: \"WHERE DREAMS GET CHEAPER.\" Under it, in smaller letters: \"SORRY.\"",
      use: S => dig(S), pickup: S => dig(S), open: S => dig(S), push: "I push the bin. Records slide. Ray's head turns, very slowly. I stop.", pull: S => dig(S), talk: "\"Come on, closer...\" The bin does not answer. Not yet." },
    { id: "binsA", name: "record bins (new arrivals)", r: [174, 168, 140, 66], z: 30, walk: [244, 240, "back"], look: "NEW ARRIVALS. Prices from $12 to \"if you have to ask.\" A tab marked FUNK. A tab marked JAZZ. A tab marked \"DON'T.\"",
      use: "These are not in my budget. They're not in my tax bracket. They're not even in my dream. The dollar bin, Ray says. The dollar bin.", pickup: "Ray's watching. These are $25. The dollar bin has my name on it.", open: "I flip through three records and see the prices. I close it. Ray smiles. He knows." },
    { id: "binsB", name: "record bins (house & disco)", r: [328, 168, 140, 66], z: 30, walk: [398, 240, "back"], look: "HOUSE & DISCO. I recognize half the sleeves. I own a quarter of them, in a dream where I have a job.", use: "I look but don't touch. These are $8, $12, $20. The dollar bin's where my money lives.", pickup: "Not these. These have price stickers with commas.", open: "I flip through a few. Everything's too good, too cheap for what it is, and too expensive for me." },
    { id: "recordWall", name: "staff picks wall", r: [168, 22, 280, 112], z: 12, walk: [310, 214, "back"], look: "STAFF PICKS: RAY'S ONLY. Every sleeve on this wall is a record that Ray's mad about. There are some real ones, and some of them are $200, and one is a Kenny G.", pickup: "Everything on that wall is Ray's opinion, and Ray is not for sale.", use: "I stare at the wall until it tells me something. It says \"dollar bin.\"", push: "A sleeve tilts. Ray looks up. I fix it. We never talk about it." },
    { id: "dcSigns", name: "signs", rects: [[174, 132, 104, 16], [278, 132, 64, 16]], z: 14, walk: [260, 220, "back"], look: "NO REFUNDS. NO REGRETS. NO RAY. Three rules, and the third one is a mystery." },
    { id: "dcPosters", name: "posters", rects: [[456, 24, 44, 60], [502, 28, 40, 54], [544, 24, 44, 60]], z: 14, walk: [500, 214, "back"], look: "A NOWHERE flyer: SAT 10PM, DJ ???. Somebody wrote \"WHO?\" in pen. A SUB FREQ poster. A DEEP CUTS poster that says \"SINCE LONG AGO.\" Ray doesn't remember when.", pickup: "Ray's watching. And that flyer's the only one he's got." },
    { id: "nowPlaying", name: "chalkboard", r: [590, 26, 44, 58], z: 14, walk: [600, 214, "back"], look: "NOW PLAYING: SOMETHING OLD (YOU WOULDN'T KNOW IT). A challenge. A threat. A fine welcome mat.", pickup: "It's Ray's, and it's his only joke.", use: "I add \"HI\" with the chalk. Ray erases it with a look." },
    { id: "dcCounter", name: "counter", r: [440, 140, 200, 60], z: 18, walk: [520, 226, "back"], look: "The counter: a turntable, a register, a stack of sleeves and a mug that says WORLD'S OKAYEST DJ. Ray bought it as a joke. It's not a joke.", use: "Ray's the guy to talk to.", pickup: "Ray's watching. And it's a counter.", open: "It doesn't open. It's where Ray keeps the real records.", push: "It's a counter. It's been here since the '90s. It's sturdier than I am." },
    { id: "dcTurntable", name: "turntable", r: [486, 112, 72, 34], z: 30, walk: [504, 224, "back"], look: "A budget turntable with a record spinning on it. The needle's in the groove. A deep house loop is quietly breathing. It's the best sound in the room.", use: "I'd touch the needle, but Ray would touch me. With a stick.", pickup: "That's the store's heartbeat. I'm not taking it. I'm not that desperate. Yet.", push: "I nudge the tonearm. A very small, very sad scratch. Ray's eyebrow rises. I put it back." },
    { id: "dcRegister", name: "cash register", r: [596, 106, 40, 40], z: 28, walk: [600, 224, "back"], look: "The register. It rings like an old phone. Ray's never made a sale he didn't resent.", use: "I have no money to give it. I have an excellent attitude.", open: "It opens for Ray. For me it says no.", pickup: "That's the one thing in here that isn't a record, and the one thing worth stealing. No.", push: "A \"cha-ching\" without a sale. Ray stares." },
    { id: "dcStool", name: "stool", r: [452, 204, 30, 44], z: 26, walk: [440, 244, "right"], look: "A bar stool, split vinyl, a record sleeve for a cushion. Everyone who sits here ends up buying something. It's a trap.", use: S => listen(S), pickup: "It's a stool. It's Ray's. I couldn't.", push: "It spins. Ray: \"You break it, you buy it. It's $60.\"" },
    { id: "dcStack", name: "stack of records", r: [444, 114, 40, 30], z: 32, walk: [460, 224, "back"], look: "A stack of records waiting to be priced. Ray prices them by mood. Right now the mood is \"insulted.\"", pickup: "Ray will see me. He sees everything. Even in the dark, even in the mirror.", use: "I flip through. The first record's priced at \"Make an offer.\" I don't." }
  ],
  combos: [
    ["a1_flyer", "ray", "\"I know,\" says Ray. \"I gave it to you. It's got a typo.\" \"It's got my name wrong.\" \"Same difference.\""],
    ["a1_slice", "ray", "Ray stares at the slice. \"Is that from Sal's? ...Put it away before I make you an offer.\""],
    ["usb_cat", "ray", "\"Nope,\" says Ray. \"No digital. This is a vinyl-only establishment. Also, I don't want to know what's on it.\""],
    ["a1_usb3", "ray", "\"No,\" says Ray. \"You can't sell me blister packs. This is a record store. Blister packs are for lesser stores.\""],
    ["a1_usb", "ray", "\"No,\" says Ray. \"You can't sell me blister packs. This is a record store. Blister packs are for lesser stores.\""],
    ["rec_first", "ray", "\"I know that one. You got it from me. Eleven years ago. Don't try to sell it back. I don't remember refunds.\""],
    ["rec_acid", "ray", () => RP.lines(["@ray It's flat. Good. It's Phuture. It's also on a shelf in my head. Don't try to sell it. I'd cry.", "I wasn't going to sell it."])],
    ["rec_mom", "ray", "Winelight went to Lou. It's a long story, and Ray doesn't want it."],
    ["white", "ray", () => RP.lines(["@ray That's the white label. I looked. It's not for sale. And it's not in my catalog.", "@ray Keep it. Play it last. Or first. Or never. It's a feeling."])],
    ["a1_closer", "ray", "\"That's yours now,\" Ray says. \"No returns. That's the best part of a dollar bin.\""],
    ["a1_package", "ray", "\"No,\" Ray says. \"Whatever it is, I don't have a shelf for it.\""]
  ]
});
RP.rooms.a1_deepcuts.hotspots.push({ id: "ray", name: "Ray", look: "Ray. Owner of Deep Cuts. Beard, glasses, an expression like he's heard it all, hated most of it, and has a favorite he'll never mention.",
  talk: S => rayTalk(S), use: "I can't use Ray. He's not a tool. He's a standard.", pickup: "Ray is not carried. He's consulted.", push: "I push Ray. He does not move. He's 14 inches of beard and a 40-year opinion.", open: "Ray doesn't open. Ray closes deals, and often doors.", give: "Ray doesn't take gifts. He takes cash, or silence." });
})();
