/* Act 3 — the DJ booth, seen from the dance floor. You stand behind the table; the crowd is a sea of silhouettes
   in front of it. House gear: two Technics, two CDJs, one mixer. Gus's monitors have to be woken up with a snack.
   Flags used: a3_soundcheck, a3_swap, a3_usbBack (scripts in 35_nights.js: RP.A3.boothUse). */
(function () {
"use strict";
const RP = window.RP;
const A3 = RP.A3;
const U = RP.u;
const PK = RP.PK;
const { R, P, ell, txt, txtC, txtW, bayer, mulberry, ramp, mix } = U;
const W = 640;

const BX = 70, BY = 112, BW = 500;
const tableSprite = A3.sprite("a3_booth_table", 520, 90, c => {
  const em = [];
  em.push.apply(em, PK.djBooth(c, 10, 4, BW, { gear: "cdj", mixer: "2ch", logo: "HALCYON", frontH: 32, tier: 3, seed: 601 }));
  em.push.apply(em, PK.turntable(c, 10 + 30, 5, { model: "technics", label: "#ff3fa4", seed: 602 }));
  em.push.apply(em, PK.turntable(c, 10 + BW - 30 - 70, 5, { model: "technics", label: "#39d0ff", seed: 603 }));
  // laptop + headphones + drink on the left; records, a cup and a sign on the right
  em.push.apply(em, PK.laptop(c, 10 + 118, 14, { on: true, w: 32, h: 22, seed: 604 }));
  R(c, 10 + 160, 28, 14, 4, "#1c1a24"); R(c, 10 + 160, 28, 14, 1, "#5a566c"); ell(c, 10 + 162, 29, 3, 3, "#14121a"); ell(c, 10 + 172, 29, 3, 3, "#14121a");
  [[10 + 330, "#e0368f"], [10 + 334, "#ffd23f"], [10 + 338, "#39d0ff"], [10 + 342, "#efeaf8"]].forEach(([x, col], i) => { R(c, x, 20 + (i % 2), 3, 14 - (i % 2), col); R(c, x, 20 + (i % 2), 3, 1, "#ffffff"); });
  R(c, 10 + 372, 24, 8, 8, "#d8d0c0"); R(c, 10 + 372, 24, 8, 1, "#ffffff"); R(c, 10 + 374, 22, 4, 2, "#e0302c"); R(c, 10 + 373, 26, 6, 3, "#c0302c");
  R(c, 10 + 388, 14, 28, 18, "#f4efe4"); R(c, 10 + 388, 14, 28, 1, "#ffffff"); R(c, 10 + 388, 31, 28, 1, "#a09888"); txtC(c, "NO", 10 + 402, 16, "#c0302c", 1, 1); txtC(c, "REQUESTS", 10 + 402, 22, "#17101e", 1, 1); txtC(c, "NOT A JUKEBOX", 10 + 402, 28, "#17101e", 1, 1);
  return em;
});
const casesSprite = A3.sprite("a3_booth_cases", 100, 66, c => {
  R(c, 4, 20, 60, 36, "#2a2834"); R(c, 4, 20, 60, 2, "#5a566c"); R(c, 4, 54, 60, 2, "#0c0a12"); R(c, 6, 28, 56, 1, "#4a4658"); R(c, 28, 24, 12, 4, "#c8c4d8");
  R(c, 8, 34, 8, 8, "#c0302c"); R(c, 48, 34, 10, 6, "#ffd23f"); txt(c, "RETURN", 8, 46, "#8a86a0", 1, 1);
  R(c, 14, 2, 44, 20, "#34303f"); R(c, 14, 2, 44, 2, "#6a667c"); R(c, 14, 20, 44, 1, "#0c0a12"); txt(c, "KOSMO", 20, 9, "#c8b0ff", 1, 1); txt(c, "D.", 20, 15, "#c8b0ff", 1, 1);
  [[0, 0], [0, 0]].forEach(() => {});
});
const foamSprite = A3.sprite("a3_booth_foam", 120, 150, c => {
  for (let y = 0; y < 150; y += 10) for (let x = 0; x < 120; x += 10) { const o = (Math.floor(y / 10) % 2) * 5; R(c, x + o, y, 9, 9, "#17101e"); R(c, x + o, y, 9, 1, "#2e2440"); R(c, x + o, y + 8, 9, 1, "#08040c"); P(c, x + o + 4, y + 4, "#3a2e52"); }
});

function paint(c, S) {
  const em = [];
  // back wall: black acoustic foam and brick
  PK.brick(c, 0, 0, W, 170, { base: "#2e1a36", mortar: "#1c1224", worn: 0.3, bw: 16, bh: 7, seed: 610 });
  for (let x = 0; x < W; x += 120) { const fx = x; for (let y = 0; y < 170; y += 10) for (let xx = 0; xx < 120; xx += 10) { const o = (Math.floor(y / 10) % 2) * 5; R(c, fx + xx + o, y, 9, 9, "#17101e"); R(c, fx + xx + o, y, 9, 1, "#2e2440"); R(c, fx + xx + o, y + 8, 9, 1, "#08040c"); P(c, fx + xx + o + 4, y + 4, "#3a2e52"); } }
  // a big plasma panel in the middle: the wave again
  em.push.apply(em, PK.ledWall(c, 160, 22, 320, 56, { pattern: "waves", palette: ["#ff3fa4", "#39d0ff", "#a05cff", "#ffd23f"], panel: 32, seed: 611 }));
  // truss with lamps over the booth
  const truss = PK.truss(c, 0, 4, W, 12, { color: "#8a889c", lights: 9, seed: 612 });
  em.push.apply(em, truss);
  (truss.lights || []).forEach(l => em.push.apply(em, PK.lightCone(c, l.x, l.y, 6, 60, 110, l.color, { alpha: 0.24 })));
  // speaker stacks at the sides of the booth
  PK.speakerStack(c, 14, 44, 44, 118, { seed: 613 }); PK.speakerStack(c, 582, 44, 44, 118, { seed: 614 });
  // booth monitors (the two on the table ends)
  PK.monitors(c, 72, 100, { krk: false, w: 26, h: 44, seed: 615 }); PK.monitors(c, 542, 100, { krk: false, w: 26, h: 44, seed: 616 });
  // the DJ riser floor
  R(c, 0, 158, W, 22, "#17101e"); R(c, 0, 158, W, 1, "#3a2e52");
  for (let x = 0; x < W; x += 24) R(c, x, 159, 1, 21, "#241a30");
  PK.util.dshade(c, 0, 158, W, 22, "#ff3fa4", (px, py) => 0.2 + (py - 158) / 22 * 0.2, 0.18);
  // the crowd in front of the booth: silhouettes with arms in the air
  em.push.apply(em, PK.crowdSilhouettes(c, 0, 176, W, 80, { rows: 4, density: 0.92, rim: ["#ff3fa4", "#39d0ff", "#ffd23f"], colors: ["#3a2e5c", "#1c1436", "#0a0616"], seed: 617 }));
  PK.util.dshade(c, 0, 168, W, 88, "#a090ff", (px, py) => Math.max(0, 1 - (py - 168) / 60) * 0.8, 0.18);
  // steps down to the floor, left of the booth
  for (let i = 0; i < 3; i++) { R(c, 8 + i * 3, 150 + i * 6, 38 - i * 6, 6, i % 2 ? "#2c2840" : "#38334e"); R(c, 8 + i * 3, 150 + i * 6, 38 - i * 6, 1, "#6a668c"); }
  return em;
}

function light(S) {
  return { ambient: "#2a1c44",
    lights: [{ x: 320, y: 130, r: 210, color: "#ffe2c0", steps: 4, sy: 0.9, power: 0.85 }, { x: 90, y: 20, r: 300, color: "#ff3fa4", steps: 5, sy: 1, rim: true }, { x: 550, y: 20, r: 300, color: "#39d0ff", steps: 5, sy: 1, rim: true },
      { x: 320, y: 40, r: 170, color: "#a05cff", steps: 3, power: 0.7 }, { x: 320, y: 240, r: 260, color: "#7a5aff", steps: 3, power: 0.55 }],
    halos: [{ x: 320, y: 112, r: 28, color: "#ffe2c0", strength: 0.5 }],
    rims: [{ x: 90, y: 60, r: 320, color: "#ff3fa4" }, { x: 550, y: 60, r: 320, color: "#39d0ff" }], key: { x: 320, y: 20 }, shadow: 0.6 };
}

function draw(c, S, t) {
  // LED wall equalizer bars
  c.save(); c.globalAlpha = 0.5;
  for (let i = 0; i < 38; i++) {
    const h = Math.round(5 + (Math.sin(t / 240 + i * 0.7) + Math.sin(t / 380 + i * 1.3) + 2) * 9);
    c.fillStyle = ["#ff3fa4", "#39d0ff", "#ffd23f", "#a05cff"][(i + Math.floor(t / 900)) % 4];
    c.fillRect(162 + i * 8, 76 - h, 6, h);
  }
  c.restore();
  // phones held up in the crowd
  const r = mulberry(7);
  for (let i = 0; i < 18; i++) { const x = 20 + r() * 600, y = 176 + r() * 36; if (Math.sin(t / 300 + i * 2.1) > 0.15) { R(c, x, y, 2, 3, "#cfe8ff"); } }
  // monitors are awake once Gus has had a snack
  if (S.f.a3_soundcheck) { P(c, 76, 139, "#3fd07a"); P(c, 546, 139, "#3fd07a"); }
  // CDJ tempo LEDs
}

RP.room({
  id: "a3_booth", act: 3, name: "The booth",
  paint, light, draw,
  cacheKey: S => "booth",
  lightKey: S => "booth",
  ambience: "club_through_wall",
  music: { genre: "house", bpm: 122, volume: 0.34, filter: ["lowpass", 1800], energy: 3 },
  walk: [[60, 150], [540, 150], [540, 156], [60, 156]],
  start: { x: 300, y: 152, face: "front" },
  fx: [
    { type: "haze", rect: [0, 92, 640, 120], color: "#a090ff", density: 3, slow: 100 },
    { type: "beams", origins: [[60, 18], [160, 18], [260, 18], [380, 18], [480, 18], [580, 18]], colors: ["#ff3fa4", "#39d0ff", "#ffd23f", "#a05cff", "#5cff9a", "#ff8a4c"], base: Math.PI / 2, swing: 0.5, len: 220, width: 14, alpha: 0.12, period: 1500 },
    { type: "strobe", period: 7200, flash: 40, alpha: 0.1, color: "#e8e4ff" }
  ],
  sprites: [
    { y: 182, draw: c => tableSprite(c, BX - 10, BY - 4) },
    { y: 172, draw: c => casesSprite(c, 566, 118) }
  ],
  actors: S => [
    { id: "a3_kosmo", char: "kosmo", x: 262, y: 153, face: "front", act: "dj", name: "Kosmo Delacroix", vis: S2 => !!S2.f.a3_thu3 && !S2.f.a3_kosmoDone },
    { id: "a3_dj_louie_vega", char: "a3_dj_louie_vega", x: 520, y: 153, face: "front", act: "stand", name: "Louie Vega", vis: S2 => !!S2.f.a3_vegaHere }
  ],
  enter: async (S, from) => { if (A3.boothEnter) await A3.boothEnter(S, from); },
  hotspots: [
    { id: "a3_kosmo", name: "Kosmo Delacroix", z: 80, look: "Kosmo Delacroix, mid-set, headphones on one ear, nodding at a record the way you nod at a waiter who got your order right. Silver hair, coat, sunglasses at midnight.", talk: S => A3.kosmoTalk(S), give: "Kosmo Delacroix doesn't take gifts from someone whose name he's still working on." },
    { id: "a3_dj_louie_vega", name: "Louie Vega", z: 80, look: "Louie Vega. Masters At Work, with Kenny 'Dope' Gonzalez. He's nodding at the room like it just told him a good joke.", talk: ["Mr. Vega, I... thank you.", "@a3_dj_louie_vega Nice blend."] },
    { id: "a3_b_steps", name: "steps to the floor", r: [4, 146, 52, 26], z: 40, walk: [64, 153, "left"],
      look: "Three steps down to the dance floor. At the bottom, a hundred people who don't know I'm nervous.",
      exit: S => ({ room: "a3_halcyon", x: 450, y: 214, face: "front" }) },
    { id: "a3_b_cdjs", name: "CDJs", rects: [[236, 112, 60, 40], [344, 112, 60, 40]], z: 30, walk: [320, 153, "back"],
      look: S => S.f.a3_thu3 ? "House CDJs, the good kind. Network-linked, USB-ready, and not mine. I treat them like a rental car: carefully and with a little fear." : "House CDJs. Better than mine. Nobody lets me say that out loud.",
      use: S => A3.boothUse(S), open: S => A3.boothUse(S), push: S => A3.boothUse(S), pickup: "They're bolted to the table. And bolted to Odessa's insurance." },
    { id: "a3_b_tt", name: "turntables", rects: [[98, 114, 74, 38], [468, 114, 74, 38]], z: 30, walk: [320, 153, "back"],
      look: "Two Technics 1200-family turntables in matching satin black. Somebody's been taking care of these like they're in witness protection.",
      use: S => A3.boothUse(S), push: "I'm not nudging a platter in front of a crowd. Rookie mistake.", pickup: "Those weigh more than Eddie's whole van." },
    { id: "a3_b_mixer", name: "mixer", r: [296, 112, 48, 40], z: 31, walk: [320, 153, "back"],
      look: "A four-channel mixer with faders that feel like warm butter. Gus keeps it clean. Gus does not keep himself clean.",
      use: S => A3.boothUse(S), push: "Never push a fader you don't understand. Never.", pull: "Fader pulling is a gateway move." },
    { id: "a3_b_monitors", name: "booth monitors", rects: [[70, 98, 30, 50], [540, 98, 30, 50]], z: 27, walk: [320, 153, "back"],
      look: S => S.f.a3_soundcheck ? "The booth monitors, awake and pointed at me like two very polite bouncers." : "The booth monitors: two black boxes, asleep. Gus has to wake them. Gus responds to snacks.",
      use: S => S.f.a3_soundcheck ? "They're on. They sound like a conversation in the next room, but a very rich conversation." : "They're dead. The little LEDs are asleep. I need Gus.", pickup: "They're coming out over my dead body. Or Gus's." },
    { id: "a3_b_laptop", name: "laptop", r: [186, 118, 36, 26], z: 31, walk: [210, 153, "back"],
      look: S => S.f.a3_thu3 ? "Kosmo's laptop. A sticker says 'I TRUST NOBODY'. It's a good sticker. It's also a lot to put on a laptop." : "Odessa's booth laptop. Playlist from last Thursday: 'Do not touch this. -O'.", use: "I don't need a laptop. I need a plan.", pickup: "It's not mine and I don't want it." },
    { id: "a3_b_headphones", name: "headphones", r: [228, 134, 28, 12], z: 32, walk: [246, 153, "back"], look: "House headphones. Padded in the cheap way: foam peeling off like old paint. I'd rather wear my own.", pickup: "I've got my own, thanks. They're round my neck. That's what the neck is for.", use: "I'd rather use mine." },
    { id: "a3_b_sign", name: "sign", r: [456, 122, 32, 22], z: 33, walk: [470, 153, "back"], look: "NO REQUESTS. NOT A JUKEBOX. Handwritten, laminated, and ignored four times an hour by a guy named Rick.", pickup: "I'd keep it. It's practically my mission statement." },
    { id: "a3_b_cases", name: "Kosmo's flight cases", r: [568, 118, 70, 56], z: 35, walk: [540, 153, "right"], look: "A battered flight case. Stickers from fifty cities, one of which is 'Hoboken.' KOSMO D. in silver paint.", pickup: "If I move Kosmo's case, I'm going to be on a poster. As a warning.", open: "It's locked. And it's Kosmo's. I'm not touching it." },
    { id: "a3_b_crowd", name: "the crowd", r: [0, 176, 640, 80], z: 3, walk: [320, 153, "front"],
      look: S => S.f.a3_floor === "full" || S.f.a3_thu3 ? "The crowd. A sea of silhouettes with phones held up like candles. I've never been this far from the floor and this close to a hundred people." : "The floor, a few people deep. It's ten PM. 'Early' is a state of mind.", talk: "Hello, crowd! ...They can't hear me. Which is probably for the best." },
    { id: "a3_b_ball", name: "LED wall", r: [160, 22, 320, 56], z: 10, look: "The big wall behind me. A wave pattern that makes everyone look like they're underwater and delighted about it." },
    { id: "a3_b_speakers", name: "speaker stack", rects: [[12, 44, 46, 120], [580, 44, 46, 120]], z: 22, look: "PA stacks. They're where the bass is stored. The monitor mix is for me, the stack is for everyone else's chest cavity." },
    { id: "a3_b_truss", name: "lights", r: [0, 4, 640, 24], z: 8, look: "A truss of lights, all pointed at a spot that's currently occupied by me. That's a lot of pressure for a fixture." },
    { id: "a3_b_usb", name: "USB slot", r: [356, 114, 14, 8], z: 50, walk: [352, 153, "back"], look: S => S.f.a3_swap && !S.f.a3_usbBack ? "The USB slot on the right CDJ. My drive's in there. At least, something that looks like my drive." : "The USB slot on the CDJ. My tracks go in here. Everything I've made ends up in a rectangle the size of a stick of gum.",
      use: S => A3.boothUse(S) }
  ],
  combos: [
    ["a3_usb", "a3_b_cdjs", S => A3.usbIn(S)],
    ["a3_usb", "a3_b_usb", S => A3.usbIn(S)],
    ["a3_usb", "a3_b_mixer", "The USB goes in the CDJ, not the mixer. Obviously. I'm not Rick."],
    ["a3_bag", "a3_b_tt", S => A3.boothUse(S)],
    ["a3_bag", "a3_b_cdjs", "Records go on the Technics. The CDJs would just stare at them."],
    ["a3_chips", "a3_b_monitors", "Chips for the monitors? They won't eat. Gus will."],
    ["a3_footage", "a3_b_cdjs", "The clip's not a track. It's a... character reference."]
  ],
  self: { look: "Behind the decks, headphones round my neck, a hundred people waiting for me to be the DJ.", talk: "Deep breath. You've got this. You've got this. You haven't got this. You've got this." }
});
})();
