/* Act 3 — Deep Cuts, Ray's record store (an act 3 version of the shop). Ray tips you about the grail:
   Loose Joints, "Is It All Over My Face?" (West End, 1980). Flags: a3_rayTip, a3_clue1, a3_dollar, a3_grailSeen. */
(function () {
"use strict";
const RP = window.RP;
const A3 = RP.A3;
const U = RP.u;
const PK = RP.PK;
const { R, P, ell, txt, txtC, txtW, bayer, mulberry, ramp, mix } = U;
const W = 640;

const counter = A3.sprite("a3_dc_counter", 200, 60, c => PK.counter(c, 4, 20, 190, 36, { top: "#c8b090", front: "#7a4a32", panelW: 28, seed: 801 }));
const registerSpr = A3.sprite("a3_dc_reg", 40, 40, c => PK.cashRegister(c, 2, 2, {}));
const binSprite = A3.sprite("a3_dc_bins", 290, 70, c => { PK.recordBins(c, 4, 4, 132, 60, { wood: "#a06a46", seed: 802 }); PK.recordBins(c, 148, 4, 132, 60, { wood: "#8a5a3e", seed: 803 }); });
const cratesSpr = A3.sprite("a3_dc_dollar", 100, 60, c => { PK.recordBins(c, 4, 6, 88, 50, { wood: "#c0302c", seed: 804 }); txtC(c, "$1", 48, 50, "#fff6dc", 1, 1); });

function paint(c, S) {
  const em = [];
  PK.plaster(c, 0, 0, W, 168, { base: "#7a6a62", patches: 3, stains: 3, cracks: 2, seed: 810 });
  PK.baseboard(c, 0, 160, W, { color: "#3a2a24", h: 9, seed: 811 });
  PK.planks(c, 0, 168, W, 88, { base: "#7a4e36", seed: 812 });
  // ceiling tubes
  [[60, 4, 100], [260, 4, 100], [460, 4, 100]].forEach(([x, y, w]) => em.push.apply(em, PK.fluorescent(c, x, y, w, { on: true })));
  // door to the street (left): glass, with OPEN sign
  PK.door(c, 6, 40, 48, 126, { metal: true, window: true, color: "#4a4658", seed: 813 });
  R(c, 12, 70, 30, 14, "#c0302c"); R(c, 12, 70, 30, 1, "#ff8a7a"); txtC(c, "OPEN", 27, 75, "#fff6dc", 1, 1);
  PK.neon(c, "DEEP", 4, 6, "#ff3fa4", { scale: 2, tube: 2, glow: true, strength: 0.9 }).forEach(r => em.push(r));
  PK.neon(c, "CUTS", 4, 20, "#39d0ff", { scale: 2, tube: 2, glow: true, strength: 0.9 }).forEach(r => em.push(r));
  // the record wall, centre
  PK.recordWall(c, 76, 20, 270, 106, { header: "WALL OF SHAME", seed: 814 });
  // the grail wall: one hook, empty, with a ghost outline
  R(c, 362, 22, 128, 104, "#2e2024"); R(c, 364, 24, 124, 100, "#3a2a2c"); PK.speckle(c, 364, 24, 124, 100, ["#2a1c20", "#4a3a3c"], 0.12, 815);
  txtC(c, "NOT FOR SALE", 426, 29, "#ffd23f", 1, 1); R(c, 372, 38, 108, 1, "#6a5a4a");
  [[372, 44], [402, 44], [432, 44], [462, 44], [372, 76], [402, 76], [462, 76]].forEach(([x, y], i) => PK.poster(c, x, y, 24, 28, { palette: ["neon", "paper", "mono", "sunset"][i % 4], title: ["TB", "LP", "12\"", "PROMO", "LIVE", "OOP", "EP"][i], lines: ["", ""], seed: 816 + i, tape: false, border: false }));
  R(c, 432, 76, 24, 28, "#2a1c20"); R(c, 432, 76, 24, 1, "#6a5a4a"); R(c, 432, 103, 24, 1, "#6a5a4a"); R(c, 432, 76, 1, 28, "#6a5a4a"); R(c, 455, 76, 1, 28, "#6a5a4a");
  for (let i = 0; i < 12; i++) P(c, 436 + (i * 5) % 16, 82 + (i * 7) % 18, "#4a3a3c");
  txt(c, "?", 441, 86, "#8a7a7a", 2, 1);
  // sign: no, i don't have that
  R(c, 500, 24, 70, 40, "#f4efe4"); R(c, 500, 24, 70, 1, "#fff"); R(c, 500, 63, 70, 1, "#a09888"); txtC(c, "NO, I DON'T", 535, 28, "#c0302c", 1, 1); txtC(c, "HAVE THAT.", 535, 34, "#c0302c", 1, 1);
  txtC(c, "YES, I KNOW", 535, 43, "#17101e", 1, 1); txtC(c, "WHAT IT IS.", 535, 49, "#17101e", 1, 1); txtC(c, "NO.", 535, 56, "#c0302c", 1, 1);
  // posters behind the counter
  [[580, 30, 28, 40], [610, 34, 24, 36]].forEach(([x, y, w, h], i) => PK.poster(c, x, y, w, h, { palette: i ? "neon" : "sunset", title: i ? "TRAX" : "SOUL", lines: ["", ""], seed: 830 + i, tape: false }));
  // listening post
  PK.table(c, 350, 164, 74, 36, { color: "#6a4a3a", seed: 835 });
  em.push.apply(em, PK.turntable(c, 354, 136, { model: "budget", seed: 836 }));
  // dust
  return em;
}

function light(S) {
  return { ambient: "#9a8aa0", lights: [{ x: 160, y: 8, r: 320, color: "#fff4e0", steps: 4, sy: 0.9 }, { x: 460, y: 8, r: 300, color: "#fff4e0", steps: 4, sy: 0.9 }, { box: [6, 40, 48, 126], r: 140, color: "#ffd8a0", steps: 3, power: 0.7 }, { x: 4, y: 20, r: 120, color: "#ff3fa4", steps: 3, power: 0.6 }],
    key: { x: 300, y: 0 }, rims: [{ x: 8, y: 30, r: 260, color: "#ff3fa4" }], shadow: 0.55 };
}

/* ---- Ray ---- */
async function rayTip(S) {
  await RP.lines([
    "@a3_ray You want to know what you're missing? Everything. But mostly one thing.",
    "@a3_ray Loose Joints. \"Is It All Over My Face?\" West End, 1980. Arthur Russell and Steve D'Acquisto wrote it.",
    "@a3_ray Larry Levan's remix became the one everybody knows. A clean copy walked out of here in '94 and I've regretted it since.",
    "Somebody's got a clean copy?",
    "@a3_ray A collector in Queens had one for thirty years. I never got his name. Mort at the Sunday record fair would.",
    "@a3_ray Williamsburg, a gym, folding tables, men who argue about pressings. Go. Be nice to Mort. Be NICER to Mort."
  ]);
  S.f.a3_rayTip = true; S.f.a3_clue1 = true;
  RP.unlock("a3_loc_fair");
  RP.toast("New place on the map: Sunday Record Fair");
}
async function rayAdvice(S) {
  await RP.lines([
    "@a3_ray Advice? You've got a Thursday. A Thursday is a rehearsal with a bar tab.",
    "@a3_ray Don't play what's popular. Play what's missing. Play the thing the room doesn't know it needs.",
    "@a3_ray And stop standing like that. It's a DJ booth, not a bus stop."
  ]);
}
async function rayDollar(S) {
  await RP.lines(["The dollar bins, Ray?", "@a3_ray The dollar bins. Where dreams go to get cheaper."]);
  if (!RP.canAfford(3)) { await RP.say("I'm broke. Even the dollar bins want a dollar."); return; }
  const res = await A3.mg("goDigging", { store: "Deep Cuts", budget: Math.min(S.money, 12), bins: null, want: { genre: "house", maxPrice: 6 }, difficulty: 1 }, { giveUp: "Never mind", tries: 1 });
  if (res.giveUp) return;
  const bought = (res.bought || []).filter(id => RP.rec(id));
  const spent = Math.min(S.money, Math.max(0, res.spent || 0));
  if (res.missing || !bought.length) { await RP.lines(["@a3_ray Nothing in the dollar bin today but Kenny G and regret.", "I'll come back when the bin's been fed."]); return; }
  bought.forEach(id => RP.addRecord(id));
  if (spent) RP.money(-spent);
  await RP.lines(["@a3_ray Not a total disgrace. I'd have said 'I'm proud,' but I'm Ray."]);
}
async function rayTalk(S) {
  if (S.f.a3_estateDone && !S.f.a3_grailSeen && RP.hasRecord("loose_joints_is_it_all_over_my_face")) {
    S.f.a3_grailSeen = true;
    await RP.lines(["Ray. Look what I found.", "@a3_ray ...", "@a3_ray That's the West End pressing. 1980. Is that a clean...", "@a3_ray Don't hand it to me. Don't. I'll cry in front of the customers.",
      "@a3_ray Play it LOUD. That's what it's for. A record's not a vase, it's a conversation. Go have it in public."]);
    return;
  }
  if (S.f.a3_hunt && !S.f.a3_estateDone) { await RP.lines(["@a3_ray The Pruitt house. Woodside. Go. Bring a cart. Bring cash. Bring your best 'I'm not desperate' face."]); return; }
  await RP.say(S.f.a3_rayTip ? "Ray. I'm back. Tell me something rude." : "Hey, Ray.");
  await RP.say(S.f.a3_rayTip ? "Tell you what? That you still have a lot to learn? Fine. You do." : "Well, well. The residency guy. Still wearing the jacket. How's the booth? Warm? Full of other people's fingerprints?", "a3_ray");
  await RP.convo([
    { text: "I heard you had something for me.", when: S2 => !S2.f.a3_rayTip, run: () => rayTip(S) },
    { text: "More on that Loose Joints record?", when: S2 => !!S2.f.a3_rayTip && !S2.f.a3_hunt, run: () => RP.lines(["@a3_ray Mort. Sunday fair. Williamsburg. Gym. Folding tables.", "@a3_ray And Mort's not a talker. He's a grunter. Bring something. A coffee. A compliment. An apology."]) },
    { text: "What should a resident be playing?", run: () => rayAdvice(S) },
    { text: "The dollar bins, Ray.", run: () => rayDollar(S) },
    { text: "Later.", end: true }
  ]);
}
A3.rayTalk = rayTalk;

RP.room({
  id: "a3_deepcuts", act: 3, name: "Deep Cuts",
  paint, light,
  cacheKey: S => "dc",
  lightKey: S => "dc",
  ambience: "room",
  music: { genre: "soul", bpm: 100, volume: 0.22, energy: 2 },
  walk: [[8, 210], [632, 210], [632, 252], [8, 252]],
  start: { x: 80, y: 232, face: "right" },
  fx: [{ type: "dust", rect: [70, 30, 520, 130], count: 28, color: "#fff4d6" }, { type: "blink", items: [{ r: [8, 13, 40, 2], color: "#ff3fa4", rate: 900, flicker: true }] }],
  sprites: [
    { y: 188, draw: c => binSprite(c, 76, 124) },
    { y: 186, draw: c => cratesSpr(c, 200, 140) },
    { y: 200, draw: c => counter(c, 436, 142) },
    { y: 170, draw: c => registerSpr(c, 592, 116) }
  ],
  actors: [
    { id: "a3_ray", char: "ray", x: 540, y: 176, face: "front", act: "stand", name: "Ray" },
    { id: "a3_dc_customer", char: "a3_vendor", x: 380, y: 224, face: "left", act: "stand", name: "customer", vis: S => false }
  ],
  enter: async (S, from) => {
    if (!S.f.a3_dcSeen) { S.f.a3_dcSeen = true; RP.setClock("FRI 2:15 PM"); await RP.lines(["Deep Cuts. It smells like cardboard and 'I told you so.'"]); }
  },
  hotspots: [
    { id: "a3_dc_door", name: "door to the street", r: [4, 38, 52, 130], z: 20, walk: [64, 220, "left"], look: "The door to the street. There's a bell on it that's been ringing since the nineties.", exit: S => "travel" },
    { id: "a3_ray", name: "Ray", z: 80, look: "Ray. Beard, glasses, boots, a face that says 'I've heard it.' He knows every record in the store and every excuse for not buying one.",
      talk: S => rayTalk(S), give: async (S, item) => { if (item === "a3_chips") return "@a3_ray Chips? In my store? Near the vinyl? Get them out of here before I charge you for the grease."; return "@a3_ray A gift? I don't take gifts. I take 'yes, you were right.'"; } },
    { id: "a3_dc_wall", name: "record wall", r: [74, 18, 274, 110], z: 18, walk: [210, 218, "back"],
      look: "The wall: a few hundred sleeves, two hundred of which Ray says no one's ever bought. The header says 'WALL OF SHAME.' He's proud of it. He shouldn't be.",
      pickup: "They're hung by a system only Ray understands. If I take one, the whole wall comes down and Ray with it.", talk: "I try the dollar bin voice on the wall. The wall doesn't care." },
    { id: "a3_dc_grails", name: "'NOT FOR SALE' wall", r: [360, 20, 134, 108], z: 18, walk: [420, 218, "back"],
      look: S => RP.hasRecord("loose_joints_is_it_all_over_my_face") ? ["Ray's NOT FOR SALE wall. One hook's still empty. A ghost outline where a certain record used to hang.", "Where it will go, one day. When I give it back. Or not. It's mine now."] : ["Ray's NOT FOR SALE wall: his personal collection. One hook is empty, with a ghost outline and a question mark. Don't ask Ray about the question mark.", "...I'm going to ask Ray about the question mark."],
      pickup: "Ray would find me. Ray would FIND me." },
    { id: "a3_dc_sign", name: "sign", r: [498, 22, 74, 44], z: 20, walk: [535, 218, "back"], look: "NO, I DON'T HAVE THAT. YES, I KNOW WHAT IT IS. NO. A sign that saves Ray a hundred conversations a day. Each of them ends 'okay.'", pickup: "It's Ray's mission statement. He'd want it back." },
    { id: "a3_dc_bins", name: "record bins", r: [74, 124, 290, 66], z: 30, walk: [210, 218, "back"],
      look: "Rows and rows of sleeves, alphabetized by a system only Ray understands. House, soul, disco, jazz, and a section marked 'REGRET.'",
      use: S => S.f.a3_rayTip ? "I could flip through, but the grail isn't in there. Ray says. And he never lies about records." : "I flip through for a minute. I find three things I can't afford and one I'd never buy. A normal Tuesday.", pickup: "I'd take the whole bin if I could afford the whole bin. I can't. Ray knows." },
    { id: "a3_dc_dollar", name: "dollar bin", r: [200, 140, 94, 50], z: 32, walk: [248, 218, "back"],
      look: "The dollar bin. Where dreams go to get cheaper. A sticker says 'ALL SALES FINAL. ALL OF THEM.'", use: S => rayDollar(S), pickup: S => rayDollar(S) },
    { id: "a3_dc_counter", name: "counter", r: [434, 140, 204, 56], z: 25, walk: [500, 218, "back"], look: "Ray's counter. A register, a stack of receipts, and a bell nobody needs to ring because Ray already knows you're here.", use: "I tap the bell. Ray doesn't look up. 'I know,' he says.", pickup: "It's a counter. It's attached to the floor and to Ray's opinions." },
    { id: "a3_dc_listen", name: "listening post", r: [348, 134, 80, 66], z: 28, walk: [388, 218, "back"], look: "A listening post: a budget turntable, a pair of headphones with a missing ear-pad, a 'PLEASE DON'T SCRATCH' sign. Of course I scratch.", use: "I put on a record. The headphones sound like a conversation through a wall. It's fine. I'm used to it.", pickup: "The headphones are older than I am. They stay." },
    { id: "a3_dc_neon", name: "neon sign", r: [2, 12, 40, 36], z: 20, look: "DEEP CUTS in neon, flickering on the 'C.' It's been flickering since before it was cool." }
  ],
  combos: [
    ["a3_chips", "a3_ray", "@a3_ray Chips? In my store? Near the vinyl? Get them out of here."],
    ["a3_bag", "a3_ray", "@a3_ray A record bag. Is that your first? ...It's your tenth. It looks like your first."]
  ],
  self: { look: "In a record store. My happy place, and also my financial planning problem.", talk: "I talk to a bin of records. It doesn't talk back. It's the best conversation I've had all week." }
});
})();
