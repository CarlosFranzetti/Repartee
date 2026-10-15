/* Act 2 — Eddie Two-Times's van, under the BQE in Williamsburg. buy.Gear mini-game: the AT-LP120-USB pair, the Numark
   TT1650 and a scam listing. Cameo: a cassette of a Tony Humphries KISS FM mix on the boombox (lore: "known for his Club
   Zanzibar years and his mixes on New York's KISS FM").
   Flags: a2_metEddie, a2_turntables, a2_eddiePrice, a2_bought1 (Gypsy Woman), a2_goodLife (bonus record) */
(function () {
"use strict";
const RP = window.RP, A2 = RP.a2, PK = RP.PK;
const { R, P, ell, txt, txtC } = RP.u;
const U = PK.util;
const W = 640;
const dark = S => A2.night(S);
const PRICE = 180;   // the pair of AT-LP120-USB, after haggling ("two-time deal")

function paint(c, S) {
  const N = dark(S), em = [];
  // the gap on the right: East River, Manhattan across the water, the Williamsburg Bridge
  PK.sky(c, 0, 0, W, 150, { time: N ? "night" : "day", seed: 14, clouds: N ? 0 : 3, moon: N ? { x: 600, y: 30, r: 6 } : false });
  em.push.apply(em, PK.skyline(c, 440, 56, 200, 100, { night: N, layers: 3, seed: 15, spire: true, spireX: 560 }));
  em.push.apply(em, PK.bridge(c, 430, 136, 240, { night: N, h: 60 }));
  PK.gradV(c, 440, 140, 200, 22, N ? ["#1a1440", "#2a1c58"] : ["#6a8ab8", "#4a6a98"], { dither: 1 });
  U.dshade(c, 440, 140, 200, 22, N ? "#ff9a5a" : "#ffffff", (x, y) => ((x * 3 + y * 7) % 11 < 2 ? 0.7 : 0), 0.25);
  // the warehouse back wall (left), roll-up door with graffiti
  PK.brick(c, 0, 60, 442, 116, { base: N ? "#5a3a40" : "#7a4a40", mortar: "#5a5060", worn: 0.6, seed: 17 });
  R(c, 150, 90, 96, 86, "#6a7a8a"); PK.gradV(c, 150, 90, 96, 86, ["#8a96a6", "#6a7a8a", "#4a5666"], { dither: 1 });
  for (let y = 94; y < 176; y += 5) { U.HL(c, 150, y, 96, "#4a5666"); U.HL(c, 150, y + 1, 96, "#9aa6b6"); }
  R(c, 148, 88, 100, 3, "#3a4252"); R(c, 148, 88, 3, 88, "#3a4252"); R(c, 245, 88, 3, 88, "#3a4252");
  // graffiti on the roll-up door
  const g = "#ff3fa4", g2 = "#39d0ff";
  txt(c, "SOUND", 162, 112, g, 3, 1); txt(c, "SYSTEM", 160, 130, g2, 2, 1); R(c, 160, 146, 70, 2, "#ffd23f");
  [[158, 108], [236, 150]].forEach(([x, y]) => { for (let i = 0; i < 8; i++) P(c, x + i, y + (i % 3), "#ffd23f"); });
  // drainpipe + wall light
  PK.pipe(c, 118, 70, 106, { dir: "v", r: 4 });
  // concrete deck of the expressway across the top + big columns
  PK.concrete(c, 0, 0, W, 64, { base: N ? "#4a4660" : "#6a6680", panelH: 32, seed: 4 });
  [[0, 56, 640], [0, 40, 640]].forEach(([x, y, w]) => { R(c, x, y, w, 8, "#2a2638"); U.HL(c, x, y, w, "#5a5272"); U.HL(c, x, y + 7, w, "#0e0a18"); });
  for (let x = 6; x < W; x += 24) { R(c, x, 42, 3, 4, "#4a4260"); R(c, x, 58, 3, 4, "#4a4260"); }
  U.dshade(c, 0, 64, W, 18, "#0c0618", (x, y) => 1 - (y - 64) / 18, 0.45);
  // rust streaks and pigeon spikes
  for (let i = 0; i < 12; i++) { const x = 30 + i * 52 + (i * 17 % 13); for (let j = 0; j < 24 + (i * 5) % 18; j++) if ((j + i) % 3 < 2) RP.u.P(c, x, 64 + j, "#7a4a30"); }
  for (let x = 4; x < W; x += 6) U.VL(c, x, 38, 3, "#8a869c");
  [[90, 46], [436, 46]].forEach(([x], i) => {
    PK.concrete(c, x, 60, 48, 120, { base: N ? "#4e4a66" : "#7a768e", panelH: 40, seed: 20 + i });
    R(c, x - 3, 60, 54, 6, "#3a3650"); U.HL(c, x - 3, 60, 54, "#6a6688");
    for (let y = 150; y < 178; y += 8) { RP.u.poly(c, [[x, y], [x + 8, y], [x, y + 8]], "#e8c820"); RP.u.poly(c, [[x + 8, y], [x + 16, y], [x + 8, y + 8]], "#1d1622"); RP.u.poly(c, [[x + 16, y], [x + 24, y], [x + 16, y + 8]], "#e8c820"); RP.u.poly(c, [[x + 24, y], [x + 32, y], [x + 24, y + 8]], "#1d1622"); RP.u.poly(c, [[x + 32, y], [x + 40, y], [x + 32, y + 8]], "#e8c820"); RP.u.poly(c, [[x + 40, y], [x + 48, y], [x + 40, y + 8]], "#1d1622"); }
    U.dshade(c, x, 60, 48, 120, "#0c0618", (xx, y) => (xx - x) / 48 * 0.6, 0.35);
  });
  txt(c, "L TRAIN", 456, 84, "#ff3fa4", 1, 1); txt(c, "TKS", 100, 100, "#39d0ff", 2, 1); txt(c, "RIP", 454, 100, "#e8e4f0", 1, 1);
  // chain-link fence along the water
  for (let y = 120; y < 176; y += 3) for (let x = 484; x < 640; x += 3) if (((x + y) / 3) % 2 === 0) P(c, x, y, "#8a869c");
  R(c, 484, 116, 156, 2, "#8a869c"); for (let x = 484; x < 640; x += 52) R(c, x, 116, 2, 62, "#6a667c");
  // ground: cracked asphalt with puddles
  PK.asphalt(c, 0, 176, W, 80, { seed: 8, lines: ["edge"] });
  [[70, 232, 36, 4], [330, 240, 44, 5], [540, 224, 30, 3]].forEach(([x, y, rx, ry]) => { ell(c, x, y, rx, ry, N ? "#1a1a40" : "#4a5a7a"); ell(c, x - 3, y - 1, rx - 8, Math.max(1, ry - 2), N ? "#ff9a5a" : "#8ab0d0"); });
  return em;
}

/* sprites */
function drawTable(c, S) {
  // folding table with a pair of AT-LP120-USB-looking decks, a mixer, a boombox, a toaster, and a hand-lettered sign
  PK.table(c, 40, 170, 160, 40, { color: "#9a9aa6", top: "#b8b4a8", seed: 3 });
  PK.turntable(c, 48, 140, { model: "technics", record: true, label: "#39d0ff" });
  PK.turntable(c, 122, 140, { model: "technics", record: false });
  // boombox + cassette: the Tony Humphries mix
  R(c, 8, 150, 26, 18, "#2a2834"); U.HL(c, 8, 150, 26, "#5a5668"); ell(c, 15, 160, 4, 4, "#8a86a0"); ell(c, 27, 160, 4, 4, "#8a86a0"); R(c, 12, 154, 18, 4, "#c8c4d8"); R(c, 14, 155, 14, 2, "#d8a050");
  R(c, 14, 148, 2, 6, "#8a86a0"); P(c, 29, 151, "#ff3a3a");
  // handwritten sign on the table front
  R(c, 70, 190, 70, 12, "#f4f0e4"); U.outline(c, 70, 190, 70, 12, "#a8a08c"); txtC(c, "TWO-TIME DEAL!!", 105, 192, "#c0302c", 1, 0); txtC(c, "NO REFUNDS (X2)", 105, 197, "#1d1622", 1, 0);
}
function drawVan(c, S) {
  const N = dark(S), x = 236, y = 112, w = 204, h = 88;
  const body = "#d8d4dc", bk = RP.u.ramp(body);
  U.groundShadow(c, x + w / 2, y + h + 6, w / 2 + 4, 4, 0.5);
  // body + roof
  RP.u.poly(c, [[x + 4, y + 18], [x + 12, y + 2], [x + 150, y + 2], [x + 172, y + 22], [x + w - 2, y + 40], [x + w, y + h - 8], [x, y + h - 8]], body);
  PK.gradV(c, x, y + 22, w, h - 30, [bk[4], bk[3], body, bk[1]], { dither: 1 });
  U.HL(c, x + 12, y + 2, 138, bk[4]); U.HL(c, x + 12, y + 3, 138, "#ffffff"); U.HL(c, x, y + h - 9, w, bk[0]);
  // sliding door open (dark interior full of stock)
  R(c, x + 62, y + 20, 84, 52, "#1a1210"); U.outline(c, x + 61, y + 19, 86, 54, "#8a869c");
  PK.gradV(c, x + 63, y + 21, 82, 50, ["#6a4a28", "#2a1a10"], { dither: 1 });
  R(c, x + 66, y + 24, 30, 4, "#c8c0b0"); R(c, x + 100, y + 24, 40, 4, "#c8c0b0");
  PK.cardboardBox(c, x + 68, y + 30, 22, 18, { color: "#c8925a", seed: 3 }); PK.cardboardBox(c, x + 94, y + 34, 18, 16, { color: "#b88248", seed: 5 });
  R(c, x + 116, y + 36, 22, 14, "#2a2834"); R(c, x + 118, y + 38, 18, 4, "#8a86a0"); R(c, x + 120, y + 44, 3, 3, "#3fd07a");
  for (let i = 0; i < 6; i++) { U.VL(c, x + 70 + i * 4, y + 56, 12, ["#1d1622", "#c0302c", "#39d0ff", "#ffd23f", "#ff3fa4", "#e8e4f0"][i]); }
  R(c, x + 70, y + 66, 60, 3, "#3a2a1a");
  R(c, x + 104, y + 20, 2, 12, "#ffe090"); // hanging bulb in the cargo area
  U.dshade(c, x + 62, y + 20, 84, 20, "#ffe090", (xx, yy) => 1 - (yy - y - 20) / 20, 0.3);
  // rolled-back sliding door panel
  R(c, x + 40, y + 20, 22, 50, "#c8c4d0"); U.VL(c, x + 40, y + 20, 50, bk[4]); U.VL(c, x + 61, y + 20, 50, bk[0]); R(c, x + 44, y + 44, 8, 2, "#8a869c");
  // cab: windshield, window, headlight, grille
  RP.u.poly(c, [[x + 160, y + 8], [x + 172, y + 22], [x + 184, y + 38], [x + 150, y + 38], [x + 150, y + 8]], N ? "#1a2a44" : "#9ac8e8");
  U.HL(c, x + 150, y + 8, 12, "#ffffff"); R(c, x + 150, y + 8, 2, 30, bk[1]); R(c, x + 152, y + 40, 40, 2, bk[0]);
  R(c, x + w - 8, y + 56, 6, 8, "#ffe090"); R(c, x + w - 3, y + 54, 3, 16, "#6a667c"); R(c, x + w - 2, y + h - 22, 4, 14, "#4a465a");
  // lettering: EDDIE / TWO-TIMES / CASH ONLY
  txt(c, "EDDIE", x + 10, y + 26, "#c0302c", 2, 1); txt(c, "TWO-TIMES", x + 8, y + 42, "#2f62b8", 1, 1);
  R(c, x + 8, y + 52, 46, 12, "#f4e888"); U.outline(c, x + 8, y + 52, 46, 12, "#a88a20"); txt(c, "CASH ONLY", x + 11, y + 54, "#c0302c", 1, 0); txt(c, "(2X DEAL)", x + 11, y + 59, "#1d1622", 1, 0);
  // rust, dents, a parking ticket and a bumper sticker
  for (let i = 0; i < 40; i++) P(c, x + 4 + (i * 37) % (w - 8), y + 26 + (i * 13) % 44, i % 3 ? "#a0603a" : "#7a4a2a");
  R(c, x + 2, y + h - 14, 18, 5, "#9a7a5a"); R(c, x + 175, y + 12, 8, 6, "#ffd23f");
  // wheels
  [[x + 36, y + h - 4], [x + 162, y + h - 4]].forEach(([wx, wy]) => { ell(c, wx, wy, 14, 14, "#14121a"); ell(c, wx, wy, 11, 11, "#1c1a24"); ell(c, wx, wy, 7, 7, "#8a869c"); ell(c, wx - 1, wy - 1, 4, 4, "#c8c4d8"); for (let a = 0; a < 5; a++) P(c, wx + Math.round(Math.cos(a * 1.256) * 5), wy + Math.round(Math.sin(a * 1.256) * 5), "#5a566c"); });
  // front bumper + exhaust smoke ghost
  R(c, x + w - 4, y + h - 14, 8, 4, "#8a869c");
}
function drawJunk(c, S) {
  // the bargain blanket: a speaker, a mixer with a cracked faceplate, a toaster, cables
  R(c, 446, 210, 112, 32, "#6a3a3a"); U.HL(c, 446, 210, 112, "#a05a5a"); U.dshade(c, 446, 242, 112, 4, "#0c0618", (x, y) => 1 - (y - 242) / 4, 0.4);
  for (let x = 448; x < 556; x += 8) { U.VL(c, x, 212, 28, "#7a4a4a"); }
  PK.speakerStack(c, 450, 172, 32, 48, {});
  PK.mixer(c, 490, 198, { channels: 2, rotary: false }); R(c, 496, 200, 22, 1, "#14121a"); R(c, 502, 199, 1, 8, "#14121a"); R(c, 508, 202, 1, 6, "#14121a");
  R(c, 520, 226, 24, 12, "#c8c4d8"); U.HL(c, 520, 226, 24, "#ffffff"); R(c, 524, 220, 16, 6, "#8a869c"); R(c, 526, 222, 3, 3, "#14121a"); R(c, 534, 222, 3, 3, "#14121a");
  for (let i = 0; i < 36; i++) P(c, 484 + i, 234 + Math.round(Math.sin(i / 3) * 3), "#14121a");
}
function drawBulbs(c, S) {
  // a string of work bulbs between the table and the van (emissive handled via draw/light halos)
  for (let x = 200; x < 244; x++) P(c, x, 118 + Math.round(Math.sin((x - 200) / 44 * Math.PI) * 6), "#1a1620");
  [[212, 124], [224, 126], [236, 123]].forEach(([x, y]) => { R(c, x, y, 3, 3, "#ffe8a0"); P(c, x + 1, y + 1, "#ffffff"); });
}

function light(S) {
  if (dark(S)) return {
    ambient: "#2c2858",
    lights: [
      { x: 70, y: 70, r: 200, color: "#ffb060", steps: 4, sy: 1.1, rim: true },
      { x: 330, y: 70, r: 220, color: "#ffb060", steps: 4, sy: 1.1, rim: true },
      { x: 560, y: 70, r: 180, color: "#ffb060", steps: 3, sy: 1.1, power: 0.8 },
      { x: 330, y: 150, r: 120, color: "#ffe2a0", steps: 4, power: 0.8 },
      { x: 224, y: 128, r: 80, color: "#ffe8a0", steps: 3, power: 0.7 },
      { x: 560, y: 70, r: 200, color: "#7a70d0", steps: 3, power: 0.45 }
    ],
    halos: [{ x: 70, y: 70, r: 18, color: "#ffb060", strength: 1 }, { x: 330, y: 70, r: 18, color: "#ffb060", strength: 1 }, { x: 560, y: 70, r: 16, color: "#ffb060", strength: 0.9 }, { x: 224, y: 126, r: 20, color: "#ffe8a0", strength: 0.9 }],
    key: { x: 330, y: 60 }, shadow: 0.6
  };
  return {
    ambient: "#8f88a6",
    lights: [
      { x: 560, y: 60, r: 320, color: "#fff4e0", steps: 4, power: 0.8 },
      { x: 330, y: 150, r: 110, color: "#ffe2a0", steps: 3, power: 0.5 },
      { x: 224, y: 128, r: 70, color: "#ffe8a0", steps: 2, power: 0.5 }
    ],
    halos: [{ x: 224, y: 126, r: 16, color: "#ffe8a0", strength: 0.8 }],
    key: { x: 560, y: 60 }, shadow: 0.5
  };
}

/* ------------------------------------------------------------------ the deal */
// fallback when buy.Gear isn't installed: a small haggling dialogue with the same outcomes
async function fallbackBuy(params) {
  const S = RP.state, bud = Math.floor(S.money);
  await RP.say("Eddie spreads his hands over the table. \"Three listings. Choose carefully. Or choose fast. Both work.\"", "nar");
  for (;;) {
    const i = await RP.choose(["The AT-LP120-USB pair, $190 \"firm\"", "The Numark TT1650 pair, $120", "The \"bargain\" pair, $60 (\"it worked this morning\")", "Walk away"]);
    if (i === 3) return { ok: false, bought: null, paid: 0 };
    if (i === 2) { await RP.lines(["I put my hand on the platter. It wobbles like a drunk plate.", "@eddie It's vintage. It's a two-time deal: the second time it works.", "No. Absolutely not."]); continue; }
    let price = i === 0 ? 190 : 120;
    if (i === 0) {
      const h = await RP.choose(["Take it at $190", "Haggle: \"$150, cash, right now\"", "Walk away"]);
      if (h === 2) continue;
      if (h === 1) { await RP.lines(["@eddie $150? That insults my mother. And my other mother. ...$170. That's my floor.", "I count out the bills like a hostage negotiator."]); price = 170; }
    }
    if (bud < price) { await RP.say("You're short, kid. Come back when you're not.", "eddie"); await RP.say("I'm short by $" + (price - bud) + ". It's a rounding error with feelings."); continue; }
    return { ok: true, bought: i === 0 ? "at_lp120_usb" : "numark_tt1650", paid: price, fallback: true };
  }
}

async function buyDeck(S) {
  if (S.f.a2_turntables) { await RP.say("I already own turntables. I own turntables! Say it with me: I own turntables."); return; }
  if (S.money < 170) {
    await RP.lines(["@eddie Show me the money. I can't take promises. Everybody pays me next week, kid. It's the one thing I won't do.", "I have $" + Math.round(S.money) + ". It's a good start."]);
    if (RP.has("a2_card")) await RP.lines(["What about the LifeDrop card?", "@eddie I don't take cards. Cards have records. Cash. Paper. Dirty, green, folded paper."]);
    else await RP.say("Come back with about a hundred and eighty. I'll hold the AT-LP120s till then. Two of them. Because I'm that kind of guy.", "eddie");
    return;
  }
  await RP.lines(["Eddie, I want a pair of turntables. The AT-LP120-USBs.", "@eddie Oh, you want the good ones. Of course you do. It's a two-time deal! Look around. Poke around. Don't trust me."]);
  const res = await A2.mg("buyGear", { slot: "turntables", options: ["at_lp120_usb", "numark_tt1650", "technics_sl_1200mk2"], flaws: ["ok", "cosmetic", "wobble"], scams: 1, seller: "Eddie Two-Times", budget: Math.floor(S.money), difficulty: 2 }, fallbackBuy);
  const paid = res && res.paid > 0 ? Math.min(Math.round(res.paid), Math.floor(S.money)) : 0;
  if (res && res.lemon && paid > 0) {
    // bought a lemon: it "worked this morning". Never a dead end: the two-time refund.
    RP.money(-paid);
    await RP.lines(["The platter wobbles like a drunk plate. The pitch drifts. The \"bargain\" is a lemon with a power cord.", "Eddie. It doesn't work.", "@eddie It worked this morning!", "Eddie. Refund.", "@eddie No refunds. (x2.) Which, mathematically, means one refund. Here."]);
    RP.money(paid);
    await RP.say("Eddie counts it back with a look of physical pain. I keep my eyes on the AT-LP120s. Next time, I look closer.");
    return;
  }
  if (!(res && res.ok && res.bought)) {
    await RP.lines(["@eddie Nothing? Nobody bought anything? That's the saddest two-time deal I ever saw.", "@eddie Come back when you're ready, kid. I'm here. The van is here. We're all here."]);
    return;
  }
  const gid = RP.gearInfo(res.bought) ? res.bought : "at_lp120_usb";
  const spent = paid > 0 ? paid : Math.min(PRICE, Math.floor(S.money));
  RP.money(-spent);
  RP.setGear("turntables", gid);
  RP.give("a2_tts");
  S.f.a2_turntables = true; S.f.a2_paid = spent;
  RP.followers(10);
  RP.sfx("success");
  const g = RP.gearInfo(gid);
  await RP.lines([
    "@eddie Pleasure doing business! And because it's a two-time deal...",
    "@eddie ...here's a second record. Free. Not stolen. Possibly stolen."
  ]);
  RP.addRecord("inner_city_good_life");
  S.f.a2_goodLife = true;
  await RP.lines([
    "Inner City, \"Good Life.\" 10 Records, with vocals by Paris Grey. November 1988.",
    "@eddie Look at you. You know things. You're a scholar."
  ]);
  await RP.lines([
    "The " + (g ? g.brand + " " + g.model : "turntables") + ". Mine. I carry them away in a bungee-corded stack.",
    "I own turntables. I own turntables!"
  ]);
}

async function talkEddie(S) {
  if (!S.f.a2_metEddie) {
    S.f.a2_metEddie = true;
    A2.beat(S);
    await RP.lines(["@eddie A customer! I can smell it. Plasma? Plasma. It's a two-time deal. What do you need?", "Turntables. Real ones. For vinyl.", "@eddie Vinyl! The last honest medium. Look at me. I have turntables."]);
  }
  await RP.convo([
    { text: "I want the AT-LP120-USB pair.", run: async () => buyDeck(S) },
    { text: "What's a two-time deal?", run: async () => { await RP.lines(["@eddie A two-time deal is a deal that you do twice.", "Twice?", "@eddie Twice. Once now, and once... also now. That's the beauty. You save twice."]); } },
    { text: "How much for the AT-LP120-USBs?", run: async () => {
      S.f.a2_eddiePrice = true;
      await RP.lines([
        "@eddie Audio-Technica AT-LP120-USB. A direct-drive turntable with a built-in preamp and a USB output. Introduced 2009, built to be the successor when the SL-1200 line was winding down in 2010.",
        "@eddie Listed at two forty each. For you? Because I like your face and I hate my competition? One-eighty the pair.",
        "For the pair?",
        "@eddie It's a two-time deal. You pay once. I smile twice."
      ]);
    } },
    { text: "Got any records?", run: async () => {
      if (S.f.a2_bought1) { await RP.lines(["@eddie You bought the good one. Everything else in there is Barry Manilow's \"Greatest Hits\" in nine different covers."]); return; }
      await RP.lines(["@eddie Dollar crate. Well. Three-dollar crate. It's a two-time deal: one for three, or two for six.", "@eddie Crystal Waters. \"Gypsy Woman.\" Mercury Records, produced by The Basement Boys.", "The Basement Boys. Basement Tapes. That's an omen."]);
      if (S.money < 3) { await RP.say("I don't have three dollars. I have a smile and a bad idea."); return; }
      RP.money(-3); RP.addRecord("crystal_waters_gypsy_woman"); S.f.a2_bought1 = true;
      await RP.lines(["@eddie That's your first purchase from a two-time dealer. You're basically family.", "Released April 3, 1991. Written by Neal Conway and Crystal Waters. It's going in the crate right next to \"Missing.\""]);
    } },
    { text: "Know a guy called Vic?", run: async () => { await RP.lines(["@eddie Vic. Vic bought a PA from me in 2019. Paid in cash. Counted it twice. Then counted me.", "@eddie He wants real turntables from his residents. Vinyl only, last Saturday of the month. You want in, you need decks. I sell decks. See how it works?"]); } },
    { text: "What's on the boombox?", run: async () => { await RP.lines(["@eddie A cassette from the good old days. Tony Humphries on KISS FM. The Zanzibar years.", "@eddie I never play it loud. It's like church. I just leave it on."]); } },
    { text: "Later.", end: true }
  ]);
}

RP.room({
  id: "a2_van", act: 2, name: "Eddie's van",
  paint,
  cacheKey: S => dark(S) ? "n" : "d",
  lightKey: S => dark(S) ? "n" : "d",
  light,
  ambience: "street",
  walk: [[8, 206], [632, 206], [632, 252], [8, 252]],
  start: { x: 70, y: 236, face: "right" },
  update: A2.update,
  fx: [
    { type: "dust", rect: [200, 70, 260, 130], count: 22, color: "#ffe2a0", on: () => dark(RP.state) },
    { type: "cars", y: 28, dir: -1, period: 4200, width: 640, color: "#ffd890" }
  ],
  actors: [{ id: "eddie", char: "eddie", x: 222, y: 224, face: "right", act: "stand", name: "Eddie Two-Times" }],
  sprites: [
    { y: 206, draw: (c, S) => drawVan(c, S) },
    { y: 212, draw: (c, S) => drawTable(c, S) },
    { y: 244, draw: (c, S) => drawJunk(c, S) },
    { y: 226, draw: c => { PK.subwayStairs(c, 568, 176); } },
    { y: 150, draw: (c, S) => drawBulbs(c, S) }
  ],
  hotspots: [
    { id: "a2_vanstairs", name: "subway stairs", r: [566, 172, 70, 62], z: 28, walk: [600, 244, "back"], exit: "travel", look: "The Bedford Avenue station stairs, with the usual green globes. The L train rattles overhead every six minutes, like a very patient headache.", push: "The stairs are a stairs thing. I don't push them." },
    { id: "a2_vanbody", name: "Eddie's van", r: [236, 112, 204, 94], z: 20, walk: [340, 228, "back"], look: "A cargo van with a hand-painted sign: \"EDDIE TWO-TIMES — CASH ONLY (2X DEAL).\" The sliding door is open on a cave of cardboard, cables and one toaster. Always one toaster.",
      open: "The sliding door's already open. That's the business model.", push: "It's a van. I'd need a tow truck, a crowbar and a confession.", use: "The van's his. It's got a two-time lock: you need two keys, both of which he lost.", pickup: "The only thing I can pick up from the van is Eddie's attention." },
    { id: "a2_table", name: "turntables on the table", r: [40, 136, 160, 70], z: 28, walk: [120, 216, "back"],
      look: S => S.f.a2_turntables ? "The table's empty now. It used to have a pair of turntables I own. I own turntables." : "A folding table, two Audio-Technica turntables and a sign: \"TWO-TIME DEAL!! NO REFUNDS (X2).\" The platters are clean, the tonearms are straight and the price is a conversation.",
      use: S => talkEddie(S), pickup: "Not without paying. Eddie's eyes follow me like a security camera.", push: "I'd knock the turntables over. They'd forgive me. Eddie wouldn't." },
    { id: "a2_boombox", name: "boombox", r: [6, 146, 32, 24], z: 36, walk: [30, 214, "back"], look: "A boombox with a cassette: \"T. HUMPHRIES — KISS FM — ZANZIBAR YEARS.\" It's low. It's church. Tony Humphries is known for his Club Zanzibar years in New Jersey and his mixes on New York's KISS FM. Respect.",
      use: S => RP.say("Click. A mix drifts out, warm and careful. Tony Humphries on KISS FM, the Zanzibar years. I leave it on. It sounds like a thing a person should have to earn."), pickup: "It's Eddie's. He'd follow me to Queens." },
    { id: "a2_junk", name: "bargain blanket", r: [446, 170, 114, 76], z: 24, walk: [504, 246, "back"], look: "Eddie's bargain blanket: a speaker with foam, a mixer with a cracked face, a toaster and a coil of cables. A sign: \"IT WORKED THIS MORNING.\" It has never worked.",
      pickup: "I'm not that desperate. Everything here has a story, and the story is \"it worked this morning.\"", use: "Eddie says it works. Eddie says a lot of things." },
    { id: "a2_toaster", name: "toaster", r: [518, 218, 28, 22], z: 36, walk: [532, 246, "back"], look: "A toaster. Mrs. Pearl bought one. Then another. Neither toasts. I suspect it's the same toaster.", use: "Eddie: \"Put a slice in. It'll work the second time.\" It won't.", pickup: "No. Mrs. Pearl warned me." },
    { id: "a2_door", name: "roll-up door", r: [148, 88, 100, 88], z: 14, walk: [200, 210, "back"], look: "A steel roll-up door with a graffiti piece: SOUND SYSTEM in pink and cyan. Someone rolled it down in 2011 and never up.", open: "It's locked from the inside. Possibly by a cat.", push: "It rattles. I leave it alone." },
    { id: "a2_column", name: "concrete column", rects: [[90, 60, 48, 120], [436, 60, 48, 120]], z: 12, walk: [120, 210, "back"], look: "A BQE support column covered in decades of tags, stickers and yellow-black hazard stripes. It holds up a highway. It holds up my spirits. Slightly.", push: "It's holding up a highway. I'm not going to push it.", pickup: "It's the foundation of the borough." },
    { id: "a2_river", name: "East River", r: [484, 60, 156, 120], z: 6, walk: [580, 206, "back"], look: S => dark(S) ? "The East River, black and orange, with Manhattan glittering across it and the Williamsburg Bridge in the corner. The city says: \"come on over.\" The rent says: \"you can't.\"" : "The East River, sparkling in the sun, Manhattan on the other side, and the Williamsburg Bridge. If I ever get famous, I'm going to walk across that bridge slowly.", use: "I could jump in. Eh. It's October.", pickup: "I can't carry a river." },
    { id: "a2_fence", name: "chain-link fence", r: [484, 116, 156, 64], z: 10, walk: [560, 206, "back"], look: "A chain-link fence with a sign: \"NO TRESPASSING. NO FISHING. NO DREAMS.\" Someone crossed out the last one.", push: "It wobbles. It's been wobbling since 2008.", use: "I could climb it. I won't." },
    { id: "a2_deck", name: "expressway above", r: [0, 0, 640, 60], z: 4, walk: [320, 206, "back"], look: "The BQE, right above us. Every truck is a thunderclap with a muffler. Pigeons live in the spikes like tiny, angry landlords.", use: "I can't use a highway. I can hear it. It's enough." },
    { id: "eddie", name: "Eddie Two-Times", z: 80, look: "Eddie Two-Times: slick hair, stubble, a gold chain, a track jacket and the confidence of a man who's never given a refund. He's got two of everything he owns. It's a pattern.",
      talk: S => talkEddie(S), give: async (S, item) => { if (item === "a2_card") return ["@eddie I don't take cards. Cards have records. Cash. Paper. Folded paper."]; if (item === "usb_cat") return ["@eddie Four thousand cat photos? Two-time deal: I'll take them twice. ...No. Just kidding. I don't want your cat."]; return ["@eddie I don't accept gifts. I accept cash."]; } }
  ],
  combos: [
    ["a2_card", "eddie", ["@eddie I don't take cards. Cards have records. Cash. Paper. Folded paper."]],
    ["phone", "eddie", "I'd text Eddie, but he's six feet away and he'd hear it twice."],
    ["a2_flyer", "eddie", ["@eddie Basement Tapes? Vic's party. He pays cash and counts it twice. You want in, you need decks. I sell decks."]],
    ["usb_cat", "a2_table", "I can't plug a cat into a turntable. That's a different kind of USB."],
    ["white", "a2_table", "Not until I've paid. After that, I'll play it twice. It's a two-time deal."]
  ]
});
})();
