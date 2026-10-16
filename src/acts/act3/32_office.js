/* Act 3 — Odessa's back office. The wall calendar, the sacred thermostat, and the bar-cam DVR that needs two keys
   (Nico's and Bex's) turned at the same time. Flags used: a3_footageGot, a3_dvrNico, a3_dvrBex, a3_swap, a3_saturday. */
(function () {
"use strict";
const RP = window.RP;
const A3 = RP.A3;
const U = RP.u;
const PK = RP.PK;
const { R, P, ell, txt, txtC, txtW, bayer, mulberry, ramp, mix } = U;
const W = 640;

const cabinet = A3.sprite("a3_o_cab", 44, 70, c => {
  R(c, 2, 4, 40, 64, "#6a6a7a"); R(c, 2, 4, 40, 2, "#9a9aaa"); R(c, 2, 66, 40, 2, "#2a2a36"); R(c, 2, 4, 2, 64, "#8a8a9a"); R(c, 40, 4, 2, 64, "#4a4a5a");
  for (let i = 0; i < 3; i++) { R(c, 5, 8 + i * 20, 34, 17, "#7a7a8a"); R(c, 5, 8 + i * 20, 34, 1, "#aaaaba"); R(c, 5, 24 + i * 20, 34, 1, "#3a3a46"); R(c, 16, 14 + i * 20, 12, 3, "#c8c4d8"); R(c, 14, 10 + i * 20, 16, 4, "#f4efe4"); }
  R(c, 6, 0, 30, 5, "#6a6a7a"); R(c, 8, 1, 14, 3, "#e0302c");
});
const safe = A3.sprite("a3_o_safe", 56, 64, c => {
  R(c, 2, 6, 52, 56, "#2a5a3a"); R(c, 2, 6, 52, 2, "#5a9a6a"); R(c, 2, 60, 52, 2, "#0e2a1a"); R(c, 2, 6, 2, 56, "#4a8a5a"); R(c, 52, 6, 2, 56, "#1a3a28");
  R(c, 8, 12, 40, 44, "#34704a"); R(c, 8, 12, 40, 1, "#6aaa7a"); R(c, 8, 55, 40, 1, "#143a22");
  ell(c, 28, 34, 11, 11, "#c8c4d8"); ell(c, 28, 34, 9, 9, "#8a86a0"); ell(c, 28, 34, 3, 3, "#17101e"); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; P(c, 28 + Math.round(Math.cos(a) * 8), 34 + Math.round(Math.sin(a) * 8), "#e8e4f4"); }
  R(c, 42, 30, 2, 8, "#d8c070"); R(c, 10, 14, 4, 3, "#d8c070"); txt(c, "FIREPROOF", 9, 49, "#d8e8dc", 1, 0);
  R(c, 4, 62, 5, 2, "#17101e"); R(c, 47, 62, 5, 2, "#17101e");
});
const chair = A3.sprite("a3_o_chair", 40, 66, c => {
  R(c, 6, 2, 28, 28, "#7a2a3a"); R(c, 6, 2, 28, 2, "#b04a5a"); R(c, 6, 28, 28, 2, "#3a1020"); R(c, 6, 2, 2, 28, "#9a3a4a"); R(c, 32, 2, 2, 28, "#4a1a28");
  R(c, 4, 32, 32, 8, "#8a2a3a"); R(c, 4, 32, 32, 2, "#c05a6a"); R(c, 4, 38, 32, 2, "#3a1020");
  R(c, 18, 40, 4, 12, "#2a2830"); R(c, 6, 52, 28, 3, "#2a2830"); R(c, 6, 54, 4, 6, "#17101e"); R(c, 30, 54, 4, 6, "#17101e"); R(c, 18, 54, 4, 8, "#17101e");
  for (let i = 0; i < 6; i++) P(c, 10 + i * 4, 10 + (i % 2) * 4, "#c05a6a");
});

function paint(c, S) {
  const em = [];
  PK.plaster(c, 0, 0, W, 168, { base: "#6f8f86", patches: 3, stains: 3, cracks: 2, seed: 701 });
  PK.baseboard(c, 0, 160, W, { color: "#3a3a46", h: 9, seed: 702 });
  PK.carpet(c, 0, 168, W, 88, { pattern: "stripes", base: "#4a3a52", accent: "#5a4a64", stripe: 12, seed: 703 });
  // fluorescent, half-dead
  em.push.apply(em, PK.fluorescent(c, 230, 6, 120, { on: true }));
  // door to the club floor (left)
  PK.door(c, 6, 40, 46, 126, { color: "#4a4658", metal: true, seed: 704 });
  // wall calendar over the desk
  R(c, 262, 30, 92, 70, "#f4efe4"); R(c, 262, 30, 92, 12, "#c0302c"); R(c, 262, 30, 92, 1, "#ff8a7a"); txtC(c, "APRIL", 308, 34, "#fff6dc", 1, 1);
  for (let r = 0; r < 5; r++) for (let i = 0; i < 7; i++) {
    const x = 265 + i * 12.5, y = 46 + r * 10, thu = i === 4, sat = i === 6;
    R(c, x, y, 11, 9, thu ? "#ffe4f0" : sat ? "#e4f0ff" : "#ffffff"); R(c, x, y, 11, 1, "#d8d0c0");
    if (thu) txt(c, "YOU", x + 1, y + 3, "#c0302c", 1, 0); if (sat) { txt(c, "BS", x + 2, y + 3, "#2a5ad8", 1, 0); }
  }
  R(c, 307, 28, 4, 4, "#8a8698");
  // corkboard of flyers and notices
  R(c, 166, 28, 80, 62, "#8a6a40"); R(c, 168, 30, 76, 58, "#b08a58"); PK.speckle(c, 168, 30, 76, 58, ["#8a6a40", "#c8a068"], 0.25, 705);
  [[172, 34, 20, 26, "neon"], [196, 38, 20, 24, "paper"], [220, 34, 20, 28, "sunset"], [176, 64, 24, 20, "mono"], [206, 66, 30, 20, "neon"]].forEach(([x, y, w, h, pal], i) => PK.poster(c, x, y, w, h, { palette: pal, title: ["SOUL", "HOUSE", "DISCO", "TECH", "AFTERS"][i], lines: ["", ""], seed: 706 + i, tape: false }));
  P(c, 182, 33, "#e0302c"); P(c, 206, 37, "#39d0ff"); P(c, 230, 33, "#ffd23f");
  // framed photos
  [[70, 52], [100, 46], [130, 56]].forEach(([x, y], i) => PK.frame(c, x, y, 26, 32, { palette: i % 2 ? ["#2a2a3a", "#c8c8d8", "#e8e0d0", "#f4efe4"] : ["#e8c8a0", "#a05030", "#f2d0a8", "#fff0d8"], kind: i % 2 ? "landscape" : "portrait", seed: 710 + i }));
  // thermostat with the note
  R(c, 410, 62, 22, 30, "#e4dcc8"); R(c, 410, 62, 22, 2, "#fff6dc"); R(c, 410, 90, 22, 2, "#9a9280"); R(c, 413, 66, 16, 10, "#1a2a2a"); R(c, 414, 67, 14, 8, "#3a6a5a"); txt(c, "68", 416, 69, "#d8ffe8", 1, 1);
  ell(c, 421, 83, 3, 3, "#c8c4d8"); R(c, 404, 94, 34, 14, "#f4efe4"); R(c, 404, 94, 34, 1, "#fff"); txt(c, "DO NOT", 407, 96, "#c0302c", 1, 0); txt(c, "TOUCH. -O", 406, 102, "#17101e", 1, 0);
  // DVR rack on the right
  R(c, 478, 70, 96, 5, "#4a4658"); R(c, 478, 70, 96, 1, "#8a86a0"); R(c, 482, 75, 3, 52, "#3a364a"); R(c, 568, 75, 3, 52, "#3a364a"); R(c, 478, 110, 96, 4, "#4a4658"); R(c, 478, 110, 96, 1, "#8a86a0");
  // CRT
  R(c, 488, 26, 76, 46, "#d8d0b8"); R(c, 488, 26, 76, 2, "#fff6e0"); R(c, 488, 70, 76, 2, "#8a8268"); R(c, 492, 30, 56, 38, "#0a0e12"); R(c, 493, 31, 54, 36, "#0e1a1e"); R(c, 552, 36, 8, 4, "#c8c0a8"); R(c, 553, 44, 6, 6, "#a89c80"); ell(c, 556, 56, 3, 3, "#c0302c");
  em.push([493, 31, 54, 36]);
  // DVR box with two keyholes
  R(c, 492, 82, 70, 22, "#23202e"); R(c, 492, 82, 70, 1, "#5a566c"); R(c, 492, 103, 70, 1, "#0c0812"); R(c, 496, 88, 22, 6, "#0e2a1e"); R(c, 497, 89, 20, 4, "#1a3a2a"); em.push([497, 89, 20, 4]);
  txt(c, "NICO", 498, 96, "#6ad0ff", 1, 0); txt(c, "BEX", 538, 96, "#ff8a5a", 1, 0);
  [[512, 86], [546, 86]].forEach(([x, y]) => { ell(c, x + 6, y + 4, 5, 5, "#c8c4d8"); ell(c, x + 6, y + 4, 3, 3, "#8a86a0"); R(c, x + 5, y + 2, 2, 5, "#17101e"); });
  P(c, 556, 88, "#ff3a3a"); em.push([556, 88, 1, 1]);
  // pile of tapes, a spare mic, a rolled poster
  R(c, 480, 116, 40, 8, "#2a2a36"); R(c, 484, 112, 12, 4, "#e0302c"); R(c, 500, 112, 12, 4, "#e0a030"); R(c, 540, 116, 30, 8, "#34303f");
  // vent + clock
  PK.vent(c, 380, 20, 26, 16, { seed: 715 });
  PK.clock(c, 80, 20, { d: 18, hour: 2, min: 20 });
  chair(c, 274, 112);
  // the desk, with the lamp, phone, ashtray, ledger
  PK.desk(c, 232, 138, 176, 56, { wood: "#5a3a30", top: "#8a5a40", seed: 716 });
  em.push.apply(em, PK.lamp(c, 372, 108, { kind: "desk", on: true }));
  R(c, 250, 124, 28, 14, "#f4efe4"); R(c, 250, 124, 28, 1, "#fff"); R(c, 252, 128, 24, 1, "#a09888"); R(c, 252, 131, 20, 1, "#a09888"); R(c, 252, 134, 22, 1, "#a09888");
  R(c, 288, 128, 22, 10, "#6a4a30"); R(c, 288, 128, 22, 2, "#a07850"); R(c, 291, 124, 16, 4, "#17101e"); R(c, 295, 123, 8, 1, "#c8c4d8");
  R(c, 330, 130, 20, 8, "#c8c4d8"); ell(c, 340, 132, 8, 2, "#8a86a0"); R(c, 335, 128, 10, 1, "#f4efe4"); P(c, 344, 128, "#ff9a3f");
  R(c, 356, 124, 10, 14, "#e0d8c0"); R(c, 356, 124, 10, 2, "#fff"); R(c, 357, 128, 8, 2, "#5a8ad8");
  // couch on the left
  PK.couch(c, 62, 124, 116, { color: "#5a3a6a", pillowColor: "#e0a030", seed: 717 });
  // trash can
  PK.trashCan(c, 190, 150, { full: true });
  // rug
  PK.rug(c, 240, 224, 150, 24, { colors: ["#3a2a5a", "#c0302c", "#5a4a7a"] });
  return em;
}

function light(S) {
  return { ambient: "#6a5a78", lights: [{ x: 372, y: 118, r: 220, color: "#ffd8a0", steps: 5, sy: 1.1 }, { x: 290, y: 8, r: 260, color: "#e8f0ff", steps: 3, power: 0.6 }, { x: 526, y: 50, r: 120, color: "#7aa8a0", steps: 3, power: 0.8 }, { x: 28, y: 100, r: 70, color: "#ff9a4a", steps: 2, power: 0.5 }],
    halos: [{ x: 372, y: 118, r: 22, color: "#ffd890", strength: 0.7 }], rims: [{ x: 372, y: 110, r: 220, color: "#ffd8a0" }], key: { x: 372, y: 60 }, shadow: 0.55 };
}

function draw(c, S, t) {
  // four tiny camera feeds, black and white, mostly empty bar
  const feeds = [[493, 31], [520, 31], [493, 49], [520, 49]];
  feeds.forEach(([x, y], i) => {
    R(c, x, y, 26, 17, "#0c1418");
    const r = mulberry(Math.floor(t / 120) + i * 99);
    for (let k = 0; k < 14; k++) P(c, x + r() * 26, y + r() * 17, r() < 0.5 ? "#8a9aa0" : "#3a4a50");
    R(c, x + 2, y + 12, 10, 4, "#2a3a40"); if (i === 0 && S.f.a3_swap) R(c, x + 12 + Math.floor((t / 400) % 8), y + 6, 3, 8, "#c0b050");
    P(c, x + 1, y + 1, Math.floor(t / 500) % 2 ? "#ff3a3a" : "#3a0a0a");
  });
  R(c, 519, 31, 1, 36, "#2a3a40"); R(c, 493, 48, 54, 1, "#2a3a40");
  for (let y = 31; y < 67; y += 2) { c.save(); c.globalAlpha = 0.18; c.fillStyle = "#000"; c.fillRect(493, y, 54, 1); c.restore(); }
}

async function dvr(S, key) {
  if (!S.f.a3_swap) { await RP.lines(["Four camera feeds, mostly empty. The bar camera shows two bartenders not looking at each other at HD quality.", "Nothing worth watching. Yet."]); return; }
  if (S.f.a3_footageGot) { await RP.say("I have the clip. I'm not rewinding it again. I saw Brandon's hug. I'll never un-see it."); return; }
  if (!S.f.a3_feudOver) {
    await RP.lines(["A bar-cam DVR with two keyholes: NICO and BEX. 'Two-key rule,' says the sticker. 'Insurance.'",
      "Odessa's insurance requires both bartenders to unlock it at the same time. They haven't spoken in weeks. I might need some luck."]);
    return;
  }
  if (!RP.has("a3_key_nico") || !RP.has("a3_key_bex")) {
    await RP.say("I need both keys. Nico's and Bex's. Where's the other one?"); return;
  }
  await RP.say("Two keys, two locks. Turn them together. Like a very romantic missile silo.");
  RP.take("a3_key_nico"); RP.take("a3_key_bex");
  RP.sfx("unlock"); await RP.wait(600);
  S.f.a3_footageGot = true; RP.give("a3_footage");
  await RP.lines(["The DVR whirs. I scroll back to nine-fifty. Bar-cam, the booth in the corner of the shot...",
    "There. Brandon, with a friendly hug and a very unfriendly hand in my jacket. Then the USB. Then a blue USB back in. Then a fake yawn.",
    "He even checks the camera. He looks right at it. He THINKS the camera is the one by the register. Amazing.",
    "I burn the clip onto a thumb drive. A pink-sticker thumb drive. Evidence."]);
}
A3.dvr = dvr;

RP.room({
  id: "a3_office", act: 3, name: "Odessa's office",
  paint, light, draw,
  cacheKey: S => S.f.a3_saturday ? "s" : "x",
  lightKey: S => "x",
  ambience: "office",
  music: null,
  walk: [[8, 206], [630, 206], [630, 252], [8, 252]],
  start: { x: 80, y: 232, face: "right" },
  fx: [{ type: "dust", rect: [230, 40, 180, 110], count: 14, color: "#fff4d6" }, { type: "blink", items: [{ r: [556, 88, 1, 1], color: "#ff3a3a", rate: 600 }] }],
  sprites: [
    { y: 168, draw: c => cabinet(c, 436, 100) },
    { y: 190, draw: c => safe(c, 588, 112) }
  ],
  actors: [],
  enter: async (S, from) => { if (A3.officeEnter) await A3.officeEnter(S, from); },
  hotspots: [
    { id: "a3_o_door", name: "door to the club", r: [4, 38, 50, 130], z: 20, walk: [60, 214, "left"], look: "The door back to the club. The bass comes through the steel like a heartbeat.", exit: S => ({ room: "a3_halcyon", x: 604, y: 220, face: "front" }) },
    { id: "a3_o_calendar", name: "wall calendar", r: [260, 28, 96, 74], z: 20, walk: [310, 214, "back"],
      look: S => S.f.a3_saturday ? ["The wall calendar. Saturday has a new name written in on it, in lipstick. It's mine. It's spelled right.", "Odessa crossed out BS. 'BS.' ...I wonder if that stands for Brandon Shine or what it also stands for."] : ["The wall calendar: every Thursday says YOU. Every Saturday says BS.", "BS. Brandon Shine. Or what everyone calls him when he's not in the room."], pickup: "It's Odessa's. She'd notice. She notices a crooked pen." },
    { id: "a3_o_cork", name: "corkboard", r: [164, 26, 84, 66], z: 20, walk: [206, 214, "back"], look: "A corkboard of flyers from a decade of Thursdays. Fifty gigs, forty DJs, seven fire inspections.", pickup: "I'm not touching Odessa's corkboard. There are pins in it and a lot of history." },
    { id: "a3_o_photos", name: "framed photos", r: [66, 44, 96, 46], z: 20, walk: [116, 214, "back"], look: "Framed photos of old Thursdays. Everyone is sweaty and happy. Nobody is looking at their phone because it's twenty years ago. Okay, maybe not that many. Ten.", pickup: "They're nailed to the wall. By someone who doesn't want them moved." },
    { id: "a3_o_thermo", name: "thermostat", r: [404, 60, 36, 50], z: 22, walk: [422, 214, "back"],
      look: "A thermostat set to 68, with a note: 'DO NOT TOUCH. -O.' The note is laminated. The note is older than some of the DJs.",
      use: async S => { await RP.say("I reach for it. A klaxon goes off in my head."); await RP.say("I CAN HEAR THAT.", "a3_odoff"); }, push: "I will not push the thermostat. I like my fingers.", pull: "I will not pull the thermostat. I like my fingers.", pickup: "Never." },
    { id: "a3_o_desk", name: "desk", r: [230, 136, 180, 60], z: 15, walk: [320, 214, "back"],
      look: "Odessa's desk: a stack of invoices, a ledger, a rotary phone, a cigarette in an ashtray (never lit), and a sign that says 'THE MONEY IS IN THE SAFE.' It isn't.",
      open: "The drawers are locked. Odessa's got a lock on her lock.", use: "It's Odessa's desk. I'm not sitting at it. She'd know." },
    { id: "a3_o_phone", name: "phone", r: [286, 122, 26, 18], z: 31, walk: [300, 214, "back"], look: "A beige rotary phone. A relic. The cord goes right through the floor into the 1990s.", use: "I'd call Dante. But what for? He'd say 'next week.'", pickup: "It's attached to the desk by a cord and a lot of history." },
    { id: "a3_o_ashtray", name: "ashtray", r: [328, 126, 24, 12], z: 31, walk: [340, 214, "back"], look: "An ashtray with one unlit cigarette in it. It's been there since the smoking ban and Odessa won't throw it out. It's a relic. It's a promise." },
    { id: "a3_o_dvr", name: "bar-cam DVR", r: [490, 24, 84, 84], z: 30, walk: [532, 214, "back"],
      look: "A CRT with four camera feeds and a DVR box underneath, marked 'BAR-CAM / TWO-KEY RULE.' The tape's been recording since the Bush administration. One of them.",
      use: S => A3.dvr(S), open: S => A3.dvr(S), push: S => A3.dvr(S) },
    { id: "a3_o_safe", name: "safe", r: [586, 110, 54, 64], z: 30, walk: [610, 214, "back"], look: "A green safe, FIREPROOF in white letters. Odessa keeps the cash in there. And a spare key to the thermostat, probably.", open: "I don't know the combination. Nobody does. Odessa knows half and keeps the other half in her head and a lockbox.", use: "I'd rather not touch the safe. The safe's got more history than I do." },
    { id: "a3_o_cabinet", name: "filing cabinet", r: [434, 98, 48, 72], z: 28, walk: [458, 214, "back"], look: "A three-drawer filing cabinet labeled 'TAXES,' 'MORE TAXES,' and 'DON'T.'", open: "Locked. 'DON'T' means don't.", pickup: "It weighs as much as the bar." },
    { id: "a3_o_couch", name: "couch", r: [60, 122, 120, 50], z: 25, walk: [120, 216, "back"], look: "Odessa's couch. A duffel under it, a blanket on it, a lot of Friday nights in it.", use: "I'd nap, but the last time somebody did, Odessa made him pay rent.", pickup: "It's heavier than it looks, and it looks heavy." },
    { id: "a3_o_chair", name: "chair", r: [270, 112, 44, 36], z: 29, walk: [290, 216, "back"], look: "Odessa's chair. A red leather throne with a crack in the cushion in the shape of a crown.", use: "I'm not sitting there. It's a throne." },
    { id: "a3_o_trash", name: "trash can", r: [188, 148, 24, 32], z: 24, walk: [200, 216, "back"], look: "A trash can full of takeout containers and one crumpled flyer for a DJ whose name I will never say in this building.", pickup: "It's trash. I have standards. Low ones, but still." },
    { id: "a3_o_vent", name: "vent", r: [378, 18, 30, 20], z: 20, look: "A vent that hums in B-flat. I've come to like it. It's the best chord in the building." },
    { id: "a3_o_clock", name: "clock", r: [78, 18, 22, 22], z: 20, look: "A wall clock that's always twenty past two. It's right twice a day, which is better than most of the staff." }
  ],
  combos: [
    ["a3_key_nico", "a3_o_dvr", S => A3.dvr(S)],
    ["a3_key_bex", "a3_o_dvr", S => A3.dvr(S)],
    ["a3_footage", "a3_o_dvr", "I've got the clip already. No need to burn another one. It's evidence, not a mixtape."],
    ["a3_chips", "a3_o_desk", "Odessa doesn't take snacks. She takes receipts."]
  ],
  self: { look: "In Odessa's office. I feel like I'm about to be fired and get a raise at the same time.", talk: "It's quiet in here. I'm talking to myself, and the vent's listening." }
});
})();
