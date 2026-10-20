/* Act 1 — Bedroom DJ. Act definition, shared items, voices and subway-map locations.
   Level files (loaded in name order): 01_lib, 05_chars, 06_items, 10_bedroom, 20_hall, 30_stoop,
   32_bodega, 34_sals, 40_subway, 50_synergex, 52_breakroom, 60_deepcuts, 70_nowhere_door,
   72_nowhere, 90_walkthrough. Flags are all a1_*; time is S.f.time ("night" Tue, "morning" Wed,
   "evening" Wed dusk, "sat" Saturday night). */
(function () {
"use strict";
const RP = window.RP;
const I = RP.icons;

RP.defineAct({
  n: 1, id: "act1", title: "BEDROOM DJ", sub: "Tuesday night, Bushwick",
  blurb: "Three records in a milk crate, a crackling mixer, a phone at 1%. Land your first gig.",
  start: { room: "bedroom", x: 300, y: 228, face: "front" },
  setup(S, carry) {
    S.money = 0; S.followers = 0;
    S.inv = ["phone", "usb_cat", "wallet"];
    S.records = [];
    S.f.crateHint = "Nothing logged yet. My records are still in the milk crate by the bed.";
    S.gear = { decks: "pioneer_cdj_350", mixer: "numark_m101usb", monitors: "krk_rokit_5_g4" };
    S.f.time = "night";
    S.clock = "TUE 11:04 PM";
    S.unlocked = ["a1_loc_home"];
  },
  wardrobe: { top: { style: "tee", color: "#17131f", print: "circle" }, acc: [] },
  async intro() {
    RP.actor("kid").face = "front";
    await RP.lines(["Tuesday. Rent's due Friday, the fridge is empty, and my phone is at 1%.", "But I've got a feeling about tonight."]);
  },
  doneTitle: "FIRST GIG",
  doneText: S => "Nowhere, Saturday, 10 PM. The bartenders danced. Dante says he'll pay you next week."
});

/* voices that speak from off-screen */
RP.voice("lou", { color: "#9be15d", anchor: [346, 128] });
RP.voice("loudoor", { color: "#9be15d", anchor: [303, 62] });                   /* Lou through the 4B door */
RP.voice("dan", { color: "#ff8fcf", prefix: "DANTE (PHONE): ", anchor: S => [RP.actor("kid").x, 40] });
RP.voice("pa", { color: "#ffd23f", prefix: "PA: ", anchor: [320, 30] });         /* Synergex fire-alarm speaker */
RP.voice("mom", { color: "#ffb0c8", prefix: "MOM: ", anchor: [320, 40] });

/* ---------------- subway map ---------------- */
RP.location({ id: "a1_loc_home", act: 1, label: "Home (Jefferson St)", area: "Bushwick", room: "a1_stoop", x: 790, y: 238, face: "left", fare: 3, mx: 236, my: 124 });
RP.location({ id: "a1_loc_synergex", act: 1, label: "Synergex Solutions", area: "Midtown", room: "a1_synergex", x: 592, y: 238, face: "left", fare: 3, mx: 146, my: 66,
  open: S => !!(S.f.a1_texts && S.f.time === "morning" && !S.f.a1_gotUSB) });
RP.location({ id: "a1_loc_deepcuts", act: 1, label: "Deep Cuts Records", area: "East Village", room: "a1_deepcuts", x: 58, y: 236, face: "right", fare: 3, mx: 152, my: 108,
  open: S => !!(S.f.a1_gotUSB && !S.f.a1_sat) });
RP.location({ id: "a1_loc_nowhere", act: 1, label: "Nowhere", area: "Bushwick", room: "a1_nowhere_door", x: 76, y: 238, face: "right", fare: 3, mx: 266, my: 132,
  open: S => !!S.f.a1_sat });

/* ---------------- items carried across the act ---------------- */
RP.item("phone", {
  name: S => S.act > 1 ? "phone" : S.f.a1_charged ? "phone (" + (S.f.battery || "41%") + ")" : "phone (1%)", short: "Phone",
  icon: (c, S) => I.phone(c, !!(S.f.a1_charged || S.act > 1)), iconKey: S => (S.f.a1_charged || S.act > 1) ? 1 : 0,
  useAlone: true,
  look: S => S.f.a1_charged || S.act > 1 ? "My phone. Messages, the subway map, my record crate. My whole life, cracked screen and all." : "1% battery. It has the energy of a Monday.",
  use: async S => {
    if (S.act === 1 && !S.f.a1_charged) { await RP.lines(["Let's see if anybody texted.", "...It died the second I unlocked it. Where's my charger?"]); return; }
    if (RP.act1PhoneUse) { const r = await RP.act1PhoneUse(S); if (r !== false) return; }
    await RP.phoneMenu();
  }
});
RP.item("usb_cat", {
  name: "cat-photo USB stick", short: "USB",
  icon: c => { I.usb(c); RP.u.R(c, 8, 11, 5, 4, "#f2a0c8"); RP.u.P(c, 8, 10, "#f2a0c8"); RP.u.P(c, 12, 10, "#f2a0c8"); },
  look: S => S.f.a1_usbSeen ? "4,000 photos of Mr. Whiskers. I made a promise." : "My only USB stick. It's full. Don't ask.",
  use: S => S.f.a1_usbSeen ? "It's full of cat. I need a new one." : "It's full. Don't ask."
});
RP.item("wallet", {
  name: S => S.money > 0 ? "wallet (" + RP.u.fmtMoney(S.money) + ")" : "empty wallet", short: "Wallet",
  icon: c => { RP.u.R(c, 4, 7, 24, 13, "#7a4a2a"); RP.u.R(c, 4, 7, 24, 2, "#9a6440"); RP.u.R(c, 5, 13, 22, 1, "#5a3420"); RP.u.R(c, 22, 11, 4, 5, "#5a3420"); },
  look: S => S.money > 0 ? RP.u.fmtMoney(S.money) + ". A fortune, by my standards." : "Empty. It's mostly a receipt holder.",
  open: S => S.money > 0 ? RP.u.fmtMoney(S.money) + ", folded with love." : "Empty. Still empty. I checked twice."
});
})();
