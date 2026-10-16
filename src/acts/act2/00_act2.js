/* Act 2 — UNDERGROUND HUSTLER. Act definition, characters, items, locations, voices and shared helpers.
   Rooms: a2_couch (Marcus's place, also the party), a2_street (Bed-Stuy), a2_hall (old building, 4th floor),
   a2_plasma (LifeDrop plasma center), a2_dani (Dani's apartment), a2_van (Eddie's van), a2_loftdoor + a2_loft
   (Bushwick loft party), a2_warehouse (Basement Tapes, the afters).
   Flag map (S.f.*), all prefixed a2_:
     a2_ch           1 = the hustle week, 2 = Marcus's party (Friday), 3 = Saturday (turntables, loft, afters)
     a2_plasma       donated plasma (card received)       a2_cashed   card cashed out
     a2_showered     showered at Dani's                   a2_louSecret Lou admitted NYC 93 is his
     a2_turntables   bought turntables                    a2_partyDone guest list night over
     a2_ampGot       Jess lent the amp                    a2_loftFixed PA fixed, a2_vicMet, a2_afterDone, a2_slot (booked) */
(function () {
"use strict";
const RP = window.RP;
const { R, P, ell, txt } = RP.u;
const I = RP.icons;
const A2 = RP.a2 = {};

/* ---------------------------------------------------------------- characters (all a2_ ids) */
const def = (id, d) => RP.chars.define(id, d);
// Vic. Promoter of Basement Tapes. Sunglasses indoors. Counts cash with a rubber band.
def("a2_vic", { name: "Vic", height: 98, build: "stocky", skin: "#d39a74", hair: { style: "ponytail", color: "#2a2028" }, facial: "mustache", facialColor: "#2a2028",
  top: { style: "jacket", color: "#2b1d1a", color2: "#c8a060" }, bottom: { style: "jeans", color: "#17131f" }, shoes: { style: "boots", color: "#3a2418" },
  acc: ["shades", "chain", "watch"], voice: "#6fd8ff" });
// Toby. Marcus's roommate. Lives in the bathroom.
def("a2_toby", { name: "Toby", height: 96, build: "thin", skin: "#f1c7a5", hair: { style: "bun", color: "#d8b070" },
  top: { style: "tank", color: "#8affd8" }, bottom: { style: "shorts", color: "#efeaf6" }, shoes: { style: "sneakers", color: "#8affd8" }, acc: ["glasses"], voice: "#8affd8" });
// Dani. Bartender at Nowhere (one of the ones who danced). Has a rain shower.
def("a2_dani", { name: "Dani", height: 92, figure: "curvy", skin: "#8d5a3b", hair: { style: "curly", color: "#1c1418" },
  top: { style: "hoodie", color: "#e8a030" }, bottom: { style: "jeans", color: "#2a2836" }, shoes: { style: "sneakers", color: "#efeaf6" }, acc: ["earring"], voice: "#ffc9a0" });
// plasma center
def("a2_rhonda", { name: "Rhonda", height: 90, figure: "curvy", skin: "#c98a62", hair: { style: "bob", color: "#3a2014" },
  top: { style: "cardigan", color: "#8a6ab8", color2: "#efeaf6" }, bottom: { style: "pants", color: "#2a2836" }, shoes: { style: "shoes", color: "#3a2418" }, acc: ["glasses", "lanyard"], voice: "#ffe27a" });
def("a2_bev", { name: "Nurse Bev", height: 94, build: "stocky", skin: "#e0a27a", hair: { style: "bun", color: "#9a9aa6" },
  top: { style: "shirt", color: "#3aa8a0", color2: "#efeaf6" }, bottom: { style: "pants", color: "#3aa8a0" }, shoes: { style: "sneakers", color: "#efeaf6" }, acc: ["lanyard"], voice: "#7fe8d0" });
// loft
def("a2_fitz", { name: "Fitz", height: 98, build: "thin", skin: "#f1c7a5", hair: { style: "short", color: "#1c1418" }, facial: "stubble", facialColor: "#3a3038",
  top: { style: "hoodie", color: "#2a2836" }, bottom: { style: "pants", color: "#17131f" }, shoes: { style: "boots", color: "#17131f" }, acc: ["beanie", "clipboard"], hatColor: "#2a2836", voice: "#b0c8ff" });
def("a2_moxie", { name: "Moxie", height: 90, skin: "#e0a27a", hair: { style: "buzz", color: "#39d0ff" },
  top: { style: "vest", color: "#ffd23f", color2: "#17131f" }, bottom: { style: "pants", color: "#7a3fb0" }, shoes: { style: "boots", color: "#17131f" }, acc: ["lanyard", "earring"], voice: "#9affb0" });
// a couple of named partygoers at Marcus's party
// Mrs. Pearl, 81, on the stoop, platinum plasma donor
def("a2_pearl", { name: "Mrs. Pearl", height: 84, figure: "curvy", build: "stocky", skin: "#6e4329", hair: { style: "curly", color: "#e8e0d0" },
  top: { style: "cardigan", color: "#c8a0d8", color2: "#efeaf6" }, bottom: { style: "pants", color: "#4a4a5a" }, shoes: { style: "shoes", color: "#3a2418" }, acc: ["glasses"], voice: "#e8b0ff" });
def("a2_aunt", { name: "Aunt Denise", height: 88, figure: "curvy", build: "stocky", skin: "#6e4329", hair: { style: "curly", color: "#9a9aa6" },
  top: { style: "dress", color: "#c0302c" }, bottom: { style: "none", color: "#c0302c" }, shoes: { style: "shoes", color: "#17131f" }, acc: ["glasses", "chain"], voice: "#ff8a7a" });

/* ---------------------------------------------------------------- voices (off-screen speakers) */
RP.voice("a2_toby_door", { color: "#8affd8", prefix: "TOBY (BATHROOM): ", anchor: [540, 70] });
RP.voice("a2_lou", { color: "#9be15d", prefix: "", anchor: [118, 70] });
RP.voice("a2_dante", { color: "#ff8fcf", prefix: "DANTE (PHONE): ", anchor: () => [RP.actor("kid").x, 40] });
RP.voice("a2_vic_phone", { color: "#6fd8ff", prefix: "VIC (PHONE): ", anchor: () => [RP.actor("kid").x, 40] });
RP.voice("a2_radio", { color: "#ffd27a", prefix: "RADIO: ", anchor: [300, 80] });
RP.voice("a2_pa", { color: "#c8b0ff", prefix: "", anchor: [320, 60] });
RP.voice("a2_stranger", { color: "#efeaf6", prefix: "GUY AT THE SINK: ", anchor: () => [RP.actor("kid").x, 60] });
RP.voice("a2_crowd", { color: "#efeaf6", prefix: "CROWD: ", anchor: [320, 60] });

/* ---------------------------------------------------------------- items */
RP.item("a2_bill", { name: "Con Ed bill (4C)", short: "Bill",
  icon: c => { I.paper(c, "#f4efe0"); R(c, 9, 4, 14, 3, "#e0a020"); R(c, 11, 14, 10, 1, "#c0302c"); },
  look: "A Con Edison bill, addressed to me, at 4C. Proof I exist somewhere. Overdue, naturally.", use: "It's a bill. Nobody has ever wanted to use one." });
RP.item("a2_form", { name: S => S.f.a2_formDone ? "Form 27-B (filled out)" : "Form 27-B (blank)", short: "Form 27-B",
  icon: (c, S) => { I.paper(c, "#f4f0e4"); R(c, 12, 1, 8, 3, "#8a869c"); if (S.f.a2_formDone) { R(c, 11, 8, 10, 1, "#2f62b8"); R(c, 11, 11, 7, 1, "#2f62b8"); R(c, 11, 14, 9, 1, "#2f62b8"); R(c, 15, 18, 5, 2, "#c0302c"); } },
  iconKey: S => S.f.a2_formDone ? 1 : 0,
  look: S => S.f.a2_formDone ? "Form 27-B, completed in blue pen. My handwriting has never looked this legal." : "Form 27-B: Voluntary Acknowledgment of Voluntary Donation. Seven pages. Front and back.",
  use: S => S.f.a2_formDone ? "It's done. I'm not touching it. It's got my whole life on it." : "I'll need a pen. The pen is, I believe, chained to something." });
RP.item("a2_card", { name: S => "LifeDrop card ($" + (S.f.a2_cardBal || 0) + ")", short: "Card",
  icon: c => { I.card(c, "#c0302c", "LIFE"); },
  look: S => S.f.a2_cashed ? "An empty LifeDrop Rewards card. It has a drop of blood on it. Branding." : "A prepaid LifeDrop Rewards card. $" + (S.f.a2_cardBal || 0) + ", loaded with my own plasma. It spends like money and feels like a tiny betrayal.",
  use: "I need a machine that will turn this into actual cash. The corner bodega has seen worse." });
RP.item("a2_amp", { name: "borrowed power amp", short: "Amp",
  icon: c => { R(c, 3, 6, 26, 14, "#2a2834"); R(c, 3, 6, 26, 1, "#5a5668"); [8, 13, 18].forEach(x => { ell(c, x, 13, 2, 2, "#c8c4d8"); }); R(c, 22, 9, 5, 2, "#3fd07a"); R(c, 22, 13, 5, 2, "#ff9a3f"); R(c, 5, 20, 3, 2, "#14121a"); R(c, 24, 20, 3, 2, "#14121a"); },
  look: "Jess's spare power amp from the theater. A strip of tape on top says \"DO NOT BREAK. - J.\" It's heavy and it's mine until Monday.",
  use: "It needs a rack, some speakers and something to amplify." });
RP.item("a2_tts", { name: "turntables (boxed pair)", short: "Decks",
  icon: c => { I.box(c, "#c8925a"); R(c, 8, 9, 16, 2, "#2a2838"); txt(c, "LP120", 9, 14, "#2a2838"); },
  look: "Two Audio-Technica AT-LP120-USB turntables in their boxes, tied with a bungee cord. My first real turntables. I am carrying them like a baby.",
  use: "I'll need somewhere to set them up. Somewhere with a booth." });
RP.item("a2_flyer", { name: "Basement Tapes flyer", short: "Flyer",
  icon: c => I.flyer(c, "#14102e", "#39d0ff"),
  look: "BASEMENT TAPES. Last Saturday of the month. Vinyl only. Cash only. No cameras, no cover bands, no \"can you play something I know.\"",
  use: "I'll hold on to it. It reads like a dare." });

/* ---------------------------------------------------------------- locations (subway map) */
const LOC = (id, label, area, room, x, y, face, mx, my) => RP.location({ id, act: 2, label, area, room, x, y, face, fare: 3, mx, my });
LOC("a2_loc_couch", "Marcus's block", "Bed-Stuy", "a2_street", 330, 236, "front", 225, 128);
LOC("a2_loc_hall", "My old building (4C)", "Bushwick", "a2_hall", 70, 236, "right", 262, 112);
LOC("a2_loc_plasma", "LifeDrop Plasma Center", "Downtown Brooklyn", "a2_plasma", 70, 236, "right", 188, 122);
LOC("a2_loc_van", "Eddie's van", "Williamsburg", "a2_van", 70, 236, "right", 214, 92);
LOC("a2_loc_dani", "Dani's place", "Greenpoint", "a2_dani", 70, 236, "right", 226, 70);
LOC("a2_loc_loft", "The loft on Meserole", "Bushwick", "a2_loftdoor", 70, 236, "right", 246, 100);
LOC("a2_loc_basement", "Basement Tapes", "Gowanus", "a2_warehouse", 70, 236, "right", 190, 168);

/* ---------------------------------------------------------------- shared helpers */
A2.flag = k => RP.state.f[k];
// night / day from the HUD clock ("SAT 11:20 PM"); rooms that change with the hour use this
A2.night = S => { const m = /(\d+):(\d+)\s*(AM|PM)/.exec(S.clock || ""); if (!m) return false; let h = (+m[1]) % 12; if (m[3] === "PM") h += 12; return h >= 19 || h < 6; };
// pity swipe: if you're out of fare money the turnstile guy waves you through (never a dead end)
A2.fareGuard = S => { for (const k in RP.locations) { const l = RP.locations[k]; if (l.act === 2) l.fare = S.money >= 3 ? 3 : 0; } };
A2.update = (dt, S) => { A2.fareGuard(S); };
// cached sprite: depth-sorted props are painted once per state key into an offscreen canvas, then blitted each frame
A2.cs = (fn, keyFn) => {
  const cache = {};
  return (c, S) => {
    const k = keyFn ? String(keyFn(S)) : "";
    let e = cache[k];
    if (!e) {
      const full = RP.u.mk(640, 256), g = full.getContext("2d");
      fn(g, S);
      // crop to the painted bounds so the per-frame blit stays tiny
      const d = g.getImageData(0, 0, 640, 256).data;
      let x0 = 640, y0 = 256, x1 = -1, y1 = -1;
      for (let y = 0; y < 256; y++) for (let x = 0; x < 640; x++) if (d[(y * 640 + x) * 4 + 3] > 0) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 < 0) e = { cv: null };
      else { const cv = RP.u.mk(x1 - x0 + 1, y1 - y0 + 1); cv.getContext("2d").drawImage(full, x0, y0, cv.width, cv.height, 0, 0, cv.width, cv.height); e = { cv, x: x0, y: y0 }; }
      cache[k] = e;
    }
    if (e.cv) c.drawImage(e.cv, e.x, e.y);
  };
};
// story beats advance the HUD clock (time only moves on story beats)
A2.CLOCKS = ["MON 2:20 PM", "MON 5:10 PM", "MON 8:30 PM", "TUE 11:10 AM", "WED 3:25 PM", "THU 6:15 PM", "THU 9:40 PM"];
A2.beat = S => { const n = S.f.a2_beats || 0; if (n < A2.CLOCKS.length) RP.setClock(A2.CLOCKS[n]); S.f.a2_beats = n + 1; };

/* play a mini-game; when it isn't built yet (res.missing) run a small dialogue fallback so the story always advances */
A2.mg = async (id, params, fallback) => {
  const res = await RP.mg.play(id, params);
  if (res && res.missing) return fallback ? await fallback(params) : { ok: true, score: 70, fallback: true };
  return res || { ok: false };
};
A2.pay = (n, quiet) => { RP.money(-n, quiet); };
A2.setClock = s => RP.setClock(s);

/* walkthrough guard: is this hotspot/actor really clickable in the current room right now? */
A2.can = id => {
  const cur = RP.curRoom(), S = RP.state;
  if (!cur) return false;
  const h = (cur.def.hotspots || []).find(x => x.id === id);
  const a = cur.actors.find(x => x.id === id);
  if (!h && !a) return false;
  if (h && h.vis && !h.vis(S)) return false;
  if (a && a.vis && !a.vis(S)) return false;
  return true;
};
A2.here = room => RP.state.room === room;

/* a hotspot builder: every prop answers Look, most get a wrong-verb joke */
A2.hs = (id, name, r, look, extra) => Object.assign({ id, name, r, look, z: 20 }, extra || {});

/* custom window frame with a scene painted inside by view(c, gx, gy, gw, gh); returns emissive rect if emit */
A2.window = function (c, x, y, w, h, o) {
  o = o || {};
  const PK = RP.PK, U = PK.util, t = o.t || 4, fr = o.frame || "#d8d0e6", k = RP.u.ramp(fr);
  const gx = x + t, gy = y + t, gw = w - t * 2, gh = h - t * 2, em = [];
  U.dshade(c, x - 3, y + h + 3, w + 6, 6, "#0c0618", (px, py) => 1 - (py - (y + h + 3)) / 6, 0.4);
  R(c, x, y, w, h, k[2]);
  U.clip(c, gx, gy, gw, gh, () => {
    if (o.view) { const r = o.view(c, gx, gy, gw, gh); if (r) em.push.apply(em, r); }
    U.dshade(c, gx, gy, gw, gh, "#ffffff", (px, py) => { const d = ((px - gx) + (py - gy) + 4000) % 70; const e = ((px - gx) + (py - gy) + 4000 - 22) % 140; return (d < 6 ? 0.9 : 0) + (e < 3 ? 0.8 : 0); }, 0.14);
    U.AR(c, gx, gy, gw, 2, "#140c24", 0.42); U.AR(c, gx, gy + 2, 2, gh - 2, "#140c24", 0.3);
  });
  const bar = (bx, by, bw, bh) => { R(c, bx, by, bw, bh, k[2]); U.HL(c, bx, by, bw, k[4]); U.VL(c, bx, by, bh, k[3]); U.VL(c, bx + bw - 1, by, bh, k[1]); U.HL(c, bx, by + bh - 1, bw, k[1]); };
  R(c, x, y, w, t, k[2]); R(c, x, y + h - t, w, t, k[2]); R(c, x, y, t, h, k[2]); R(c, x + w - t, y, t, h, k[2]);
  U.HL(c, x, y, w, k[4]); U.HL(c, x, y + 1, w, k[3]); U.VL(c, x, y, h, k[3]); U.VL(c, x + w - 1, y, h, k[1]); U.HL(c, x, y + h - 1, w, k[1]);
  const cols = o.cols || (gw >= 90 ? 2 : 1);
  for (let i = 1; i < cols; i++) bar(gx + Math.floor(gw * i / cols) - 2, gy, 4, gh);
  bar(gx, gy + Math.floor(gh / 2) - 1, gw, 4);
  const ks = RP.u.ramp(o.sill || "#e4dcef");
  R(c, x - 4, y + h, w + 8, 4, ks[2]); U.HL(c, x - 4, y + h, w + 8, ks[4]); U.HL(c, x - 4, y + h + 3, w + 8, ks[1]);
  if (o.emit) em.push([gx, gy, gw, gh]);
  return em;
};

/* the Bed-Stuy block seen across the street: brownstone facades, trees, sky (used by the couch window) */
A2.streetView = function (c, x, y, w, h, o) {
  o = o || {};
  const PK = RP.PK, night = o.time === "night", em = [];
  PK.sky(c, x, y, w, h, { time: night ? "night" : "day", seed: 5, clouds: night ? 0 : 2, moon: night ? { x: x + w - 18, y: y + 12, r: 4 } : false });
  const bases = ["#8a4a3e", "#7a4038", "#9a5a44", "#6a3a3a", "#8a5238"];
  let bx = x - 6, i = 0;
  while (bx < x + w) {
    const bw = 40 + (i * 13 % 14), top = y + 12 + (i * 11 % 16);
    PK.brick(c, bx, top, bw, y + h - top, { base: bases[i % 5], seed: 40 + i, worn: 0.3 });
    RP.u.R(c, bx - 1, top - 3, bw + 2, 3, "#2a1c22"); RP.u.R(c, bx - 1, top - 3, bw + 2, 1, "#7a5a50");
    const wy = top + 8;
    em.push.apply(em, PK.window(c, bx + 6, wy, 14, 22, { view: "interior", lit: night && (i % 2 === 0), seed: i, frame: "#a89ab0", frameW: 2, curtain: i % 2 ? "#5a8ab8" : "#c0555a" }) || []);
    em.push.apply(em, PK.window(c, bx + bw - 20, wy + 24, 14, 22, { view: "interior", lit: night && (i % 3 !== 1), seed: i + 9, frame: "#a89ab0", frameW: 2, curtain: "#e0a030" }) || []);
    bx += bw + 1; i++;
  }
  // street trees
  [[x + 12, y + h - 4], [x + w - 30, y + h - 2]].forEach(([tx, ty], j) => {
    RP.u.R(c, tx, ty - 18, 3, 18, "#2a1c22");
    PK.util.blob(c, tx + 1, ty - 24, 11, 9, night ? "#1f3a2a" : "#3f8a3f"); PK.util.blob(c, tx - 5, ty - 18, 7, 6, night ? "#1a3224" : "#4a9a48");
  });
  // sidewalk strip + a parked car roof
  RP.u.R(c, x, y + h - 5, w, 5, night ? "#2a2438" : "#8c88a0");
  return em;
};

/* ---------------------------------------------------------------- the act */
RP.defineAct({
  n: 2, id: "act2", title: "UNDERGROUND HUSTLER", sub: "Bed-Stuy, two weeks later",
  blurb: "Dante hasn't paid. The landlord changed the lock. Land a monthly slot at Basement Tapes and buy your first turntables.",
  start: { room: "a2_couch", x: 300, y: 232, face: "front" },
  setup(S, carry) {
    if (!carry) {
      S.money = 30; S.followers = 40;
      S.records = ["everything_but_the_girl_missing", "phuture_acid_tracks", "white_nyc93", "cece_peniston_finally"];
      S.gear = { decks: "pioneer_cdj_350", mixer: "numark_m101usb", monitors: "krk_rokit_5_g4" };
    } else {
      S.gear = Object.assign({ decks: "pioneer_cdj_350", mixer: "numark_m101usb", monitors: "krk_rokit_5_g4" }, S.gear || {});
      if (!S.followers || S.followers < 20) S.followers = Math.max(S.followers || 0, 40);
      ["everything_but_the_girl_missing", "phuture_acid_tracks", "white_nyc93", "cece_peniston_finally"].forEach(id => { if (!S.records.includes(id)) S.records.push(id); });
    }
    S.inv = ["phone", "wallet", "usb_cat", "white"];
    S.clock = "MON 11:42 AM";
    S.unlocked = ["a2_loc_couch", "a2_loc_hall"];
    S.f.a2_ch = 1;
  },
  wardrobe: { top: { style: "tee", color: "#17131f", print: "circle" }, acc: ["headphones"] },
  async intro(S) {
    RP.actor("kid").face = "front";
    await RP.lines([
      "Two weeks since Nowhere. Dante still hasn't paid me.",
      "Last Tuesday the landlord changed the lock on 4C. \"Temporarily.\"",
      "So now I live on Marcus's couch in Bed-Stuy. It's a great couch. It's also the dining room, the guest room and my entire career."
    ]);
    await RP.phone([
      { from: "DANTE (NOWHERE)", text: "killer set!! i'll pay u next week", hot: true },
      { from: "MR. KOWALSKI (LANDLORD)", text: "Lock change is TEMPORARY. Rent due FRI. Hot water: next week." },
      { from: "MOM", text: "Did you eat. Is that couch clean" }
    ]);
    await RP.lines(["Everybody's paying me next week. Even the hot water.", "Okay. Think. I need cash, a shower, a gig, and a pair of turntables. In that order. Or any order."]);
    S.f.a2_intro = true;
  },
  doneTitle: "FIRST SLOT",
  doneText: S => "Basement Tapes, last Saturday of the month, vinyl only. Two AT-LP120-USB turntables wait in a booth that smells like a basement. Dante still says next week."
});
})();
