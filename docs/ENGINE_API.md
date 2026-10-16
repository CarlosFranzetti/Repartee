# re:parteé — Engine API (for content authors)

Everything is plain browser JavaScript on one global, `window.RP`. Each source file is a classic
script wrapped in an IIFE:

```js
(function () {
"use strict";
const RP = window.RP;
const { R, P, ell, txt, bayer, mulberry } = RP.u;   // pixel helpers (src/core/util.js)
const PK = RP.PK;                                   // paint kit (src/core/paint.js, docs/PAINTKIT.md)
...
})();
```

The **reference implementation** of everything below is `src/acts/act1/10_bedroom.js` (a full
room with lighting, items, combos, off-screen voices, phone, a mini-game and a walkthrough) and
`src/minigames/beatmatch.js` (a full mini-game). Read them before writing content.

## Build & test

```
node tools/build.mjs --out /path/in/your/scratchpad/game.html   # build your own copy (safe in parallel)
node tests/run.mjs walk <key> --act N --page /path/game.html     # run RP.walkthroughs[key] headless, fast mode
node tests/run.mjs shot <roomId> out.png --act N --page /path/game.html [--state '{"f":{"a2_x":true}}'] [--x 300 --y 230 --face left]
node tests/run.mjs mg <miniGameId> out.png --page /path/game.html [--params '{"difficulty":2}'] [--wait 1500] [--eval "js"]
node tests/run.mjs smoke --page /path/game.html                    # start every act, list mini-games
```
Then **Read the PNG** to look at your work. A file with a syntax error is skipped by the build
(it prints `SYNTAX ERROR (file skipped)`), so always check the build output. Page errors are
printed by the test runner and make it exit non-zero.

Coordinates: the scene is **640×256 logical pixels**. The floor usually spans y≈205–252.
Characters are ~96 px tall, feet at their (x, y).

## State

`RP.state` (also passed as `S` to every handler):

| field | meaning |
|---|---|
| `S.f` | flags object. **Prefix every flag with your act**: `a2_metVic`, `a3_hunt` ... |
| `S.money` | dollars (float). Change with `RP.money(delta)` (shows a toast) |
| `S.followers` | fans. Change with `RP.followers(delta)` |
| `S.inv` | inventory item ids (order = display order) |
| `S.records` | ids of records in the player's crate (see catalog below) |
| `S.gear` | `{ decks, turntables, mixer, monitors, headphones, cartridge }` → gear ids from `RP.data.gear` |
| `S.clock` | HUD time label, e.g. `"WED 9:02 AM"`; set with `RP.setClock(s)` |
| `S.unlocked` | location ids visible on the subway map; add with `RP.unlock(id, ...)` |
| `S.msgs` | phone messages; add with `RP.text(from, text)` |
| `S.name` | the player's DJ name (uppercase string). Use it! Promoters misspell it. |
| `S.act`, `S.room` | current act number / room id |

## Acts

```js
RP.defineAct({
  n: 2, id: "act2", title: "UNDERGROUND HUSTLER", sub: "Bushwick, two weeks later",
  blurb: "One line for the chapter-select menu.",
  start: { room: "a2_couch", x: 300, y: 230, face: "front" },
  setup(S, carry) {           // carry=false: chapter select / fresh start. carry=true: continuing from act 1
    if (!carry) { S.money = 40; S.records = [...]; }       // sensible baseline for chapter select
    S.inv = ["phone", ...];   // usually reset inventory to what this act needs
    S.gear = Object.assign({ decks: "pioneer_cdj_350", mixer: "numark_m101usb", monitors: "krk_rokit_5_g4" }, S.gear);
    S.clock = "MON 2:10 PM";
    S.unlocked = ["a2_loc_couch", ...];
  },
  wardrobe: { top: {...}, acc: ["headphones"] },   // optional: restyle the kid for this act
  async intro(S) { await RP.lines([...]); },        // runs after the title card
  doneTitle: "...", doneText: S => "...",           // shown by RP.completeAct
  combos: [ ["itemA", "itemB", handler], ... ]      // optional act-wide item+item combos
});
```
End an act with `await RP.completeAct([[bool, "checklist line"], ...])`. It shows the summary card
and starts the next act with `carry: true`.

## Rooms

```js
RP.room({
  id: "a2_couch", act: 2, name: "Marcus's couch",
  width: 640,                       // >640 makes a scrolling room; camera follows the kid
  paint(c, S, inst) { ...; return emissiveRects; },  // static background, cached
  cacheKey: S => S.f.a2_tvOn ? "tv" : "",           // repaint when this string changes
  draw(c, S, t, inst) {},           // per-frame, under actors (blinking lights, TV static)
  drawFront(c, S, t, inst) {},      // per-frame, over actors (foreground pillar, booth front)
  drawTop(c, S, t, inst) {},        // per-frame, after lighting (UI-ish overlays)
  light: S => ({ ... }),            // see Lighting; omit for full-bright
  lightKey: S => "...",             // recompute light map when this changes
  fx: [ { type: "dust", rect: [x,y,w,h] }, ... ],   // see Effects
  ambience: "street",               // "street"|"rain"|"crowd"|"club_through_wall"|"subway"|"office"|"festival"|"airport"|"room"|null
  music: { genre: "house", bpm: 124, volume: 0.45, filter: ["lowpass", 900] },  // background loop, null to stop
  walk: [[x,y], ...],               // CONVEX polygon the kid can walk in
  scale: [yFar, sFar, yNear, sNear],// optional perspective scaling of characters by y
  start: { x, y, face },            // default arrival point
  actors: [ ... ] | S => [ ... ],   // NPCs (see Actors)
  sprites: [ { y: 222, vis: S => !S.f.x, draw: (c, S, t) => {...} }, ... ],  // depth-sorted props
  hotspots: [ ... ],
  combos: [ ["itemId", "hotspotOrItemId", handler], ... ],
  enter: async (S, fromRoomId) => {},   // after fade-in (panel locked while it runs)
  leave: async (S, toRoomId) => {},
  update(dt, S, t, inst) {},        // per-frame logic
  self: { look: "...", talk: "..." } // override "yourself" responses in this room
});
```

### Hotspots

```js
{ id: "jukebox", name: "jukebox",          // name may be a function S => string
  r: [x, y, w, h] | rects: [[...],[...]] | poly: [[x,y],...],   // geometry (or functions of S)
  z: 30,                                    // higher wins when overlapping (default 10)
  vis: S => !S.f.a2_jukeboxGone,            // hide when false
  walk: [x, y, "back"],                     // where the kid stands to use it (or S => [...])
  floor: true,                              // floor decals: a plain click walks instead of acting
  noWalk: true,                             // act from where you stand
  exit: { room: "a2_street", x: 40, y: 232, face: "right" }   // doorway: plain click walks there and leaves
        | S => (S.f.a2_unlocked ? { room: ... } : "It's locked.")   // a string blocks with that line
        | "travel",                         // opens the subway map
  look, pickup, use, open, close, push, pull, talk,   // handlers
  give: (S, itemId) => ...,                 // fallback when an item is given and no combo matches
  walkTo: (S) => ...                        // runs after a plain click walks here
}
```

**Handlers** may be a string (the kid says it), an array of lines (see `RP.lines`), or a
function `(S, target) => ...` (may be async). A function may return a string/array to be said.

**Combos** `[a, b, handler]` match in either order, where `a`/`b` are item ids or hotspot/actor
ids. "Use X with Y" and "Give X to Y" both look up combos first.

Default responses exist for every verb, but **every hotspot should answer `look`** and the
important ones should have custom lines for the other plausible verbs. Funny wrong-verb lines
are a big part of the genre.

### Actors (NPCs)

```js
actors: [
  { id: "a2_vic", char: "a2_vic", x: 420, y: 228, face: "left", act: "stand",   // act: stand|dance|dj|sit|phone|point|crouch
    name: "Vic", vis: S => !S.f.a2_vicLeft, expr: "angry", scale: 1, z: 0, hotZ: 80, noTurn: false },
  { crowd: { n: 18, rect: [100, 200, 400, 40], seed: 4, face: "back", act: "dance", scale: 0.85, opts: {} } }
]
```
- `char` is a character id from `RP.chars.define` (defaults to `id`).
- Talking/looking uses the room hotspot with the same `id` (no geometry needed):
  `hotspots: [{ id: "a2_vic", look: "...", talk: async S => {...}, give: (S, item) => ... }]`.
- The kid walks next to an actor before talking; actors turn to face the kid.
- Script helpers: `RP.actor(id)` → instance (`.x .y .face .act .expr .vis .name`),
  `RP.npcWalk(id, x, y, face)` (await it), `RP.place(id, x, y, face)`.
  The kid is `RP.actor("kid")`.

### Characters

```js
RP.chars.define("a2_vic", {
  name: "Vic", height: 96, build: "thin"|"average"|"stocky"|"big", figure: "curvy"|null,
  skin: "#c98a62",
  hair: { style: "messy|short|slick|buzz|bald|curly|afro|long|bob|bun|ponytail|mohawk|locs", color },
  facial: null|"mustache"|"beard"|"goatee"|"stubble", facialColor,
  top: { style: "tee|tank|hoodie|jacket|bomber|suit|cardigan|shirt|polo|coat|dress|vest|mesh|apron",
         color, color2 /*inner/lining*/, print: null|"circle"|"stripe"|"logo"|"text", text: "STAFF", printColor, tie: false, tieColor, backText },
  bottom: { style: "jeans|pants|cargo|track|shorts|skirt|none", color, tights },
  shoes: { style: "sneakers|boots|shoes", color },
  acc: ["glasses","shades","cap","beanie","bucket","hood","headphones","chain","earring","lanyard","bag","clipboard","watch","tattoo","apron"],
  hatColor, headphonesOn: true, bagColor, glassesColor, blush: true,
  voice: "#ffd27a"   // speech text color
});
RP.chars.random(seed, { top, name, override: {...} })   // random NYC partygoer definition
```
Recurring characters are in `src/data/cast.js`: `lou, dante, ray, marcus, kosmo, eddie, twinkie, axl, jess`.
Restyle per act with `RP.chars.update("dante", { top: {...} })`. Characters are shaded
automatically from the room light (key light direction, rim light, cast shadow). You never
draw them by hand.

## Lighting

```js
light: S => ({
  ambient: "#463f80",                         // multiply color where no light reaches (dark rooms: deep violet/blue)
  lights: [
    { x: 470, y: 32, r: 250, color: "#ffe2c0", steps: 5, sy: 1.25, power: 1 },   // point light, banded + dithered
    { box: [216, 30, 120, 94], r: 40, color: "#6f66b8", steps: 2 },             // rectangular light (window, doorway)
    { x: 300, y: 60, r: 180, color: "#ff3fa4", rim: true }                      // colored light that also rim-lights characters
  ],
  emissive: [[x,y,w,h], ...],   // stays full-bright (screens, neon). paint() return value is added automatically
  halos: [{ x, y, r: 20, color: "#ffb060", strength: 1 }],  // additive dithered glow
  rims: [{ x, y, r, color }],    // extra rim-light sources for characters
  key: { x, y },                 // force the key-light direction for characters
  shadow: 0.6,                   // contact/cast shadow strength (0..1)
  cast: true                     // projected cast shadows on (default)
})
```
`RP.relight()` forces both background and light map to rebuild (after flags change what they depend on).

## Effects (`fx`)

`{type:"dust", rect, count, color, on: () => bool}` · `{type:"rain", width, floor, count}` ·
`{type:"steam"|"smoke", x, y, rise, size, drift, color}` · `{type:"haze", rect, color, density}` ·
`{type:"beams", origins:[[x,y],...], colors, base: angleRad, swing, len, width, alpha, period}` ·
`{type:"strobe", period, flash, alpha}` · `{type:"blink", items:[{r:[x,y,w,h], color, off, rate, phase, flicker}]}` ·
`{type:"confetti", count, colors, floor}` · `{type:"cars", y, dir, period}` · `{type:"custom", draw(c, dt, t, fx)}`.
Every fx accepts `on: () => bool`.

## Items

```js
RP.item("a2_towel", {
  name: "borrowed towel",   // or S => string
  short: "Towel",           // inventory label (≤ 9 chars)
  icon: (c, S) => RP.icons.towel(c, "#5a8ad8"),   // 32×24 canvas; see src/core/icons.js
  iconKey: S => "...",      // re-render icon when this changes
  look: "...", use: ..., open: ..., useAlone: true /* "Use" acts immediately instead of asking "with what?" */
});
RP.give(id) · RP.take(id) · RP.has(id) · RP.refreshInv()
```
Icon helpers (`RP.icons`): `record(c,labelColor,warped)`, `fromRecord(c, recId)`, `cd`, `usb`, `cash(c,"20")`, `coins`, `card`,
`key`, `paper`, `flyer`, `ticket`, `bag`, `bottle`, `can`, `slice`, `phone`, `headphones`, `cable`, `box`, `clothes`, `towel`, `letter(c,"A")`.

## Dialog & scripting (all async — always `await`)

```js
await RP.say("text")                 // the kid speaks
await RP.say("text", "a2_vic")       // an actor in the room speaks (color = character voice)
await RP.say("text", "nar")          // narrator caption
await RP.lines(["kid line", "@a2_vic Vic's line", "@nar Later that night...", async () => {...}])
const i = await RP.choose(["Option A", "Option B", "Leave"])   // dialog choice → index
await RP.convo([                      // looping conversation menu; the kid says the chosen line
  { text: "Who's playing tonight?", run: async () => { await RP.say("...", "a2_vic"); } },
  { text: "Can I get on the list?", when: S => !S.f.a2_listed, once: true, run: async () => {...} },
  { text: "Later.", end: true }
]);
RP.voice("a2_radio", { color: "#ffd27a", anchor: [120, 80], prefix: "RADIO: " })   // off-screen speaker for "@a2_radio ..."
await RP.walkTo(x, y, face) · await RP.wait(ms) · await RP.fadeTo(1, ms) / RP.fadeTo(0)
RP.shake(ms) · RP.flash("#fff", ms) · RP.toast("text") · RP.sfx("cash")
await RP.goto(roomId, x, y, face)    // change room (fades)
await RP.travel()                    // subway map
await RP.phone([{ from: "VIC", text: "...", hot: true }, ...])   // show texts (and store them)
RP.text("VIC", "text")               // quietly add a message (toast "New message")
await RP.card({ kicker, title, sub, body: ["p1", "p2"], checks: [[true, "did x"]], button })
await RP.mg.play("crowdRead", { ... })   // mini-game → result object (see docs/MINIGAMES.md)
await RP.run(async () => {...})      // run a cutscene from a non-handler context with the panel locked
```
Sound: `RP.sfx(name)` — click, thump, crackle, ring, buzz, ping, door, doorBuzz, footstep, coin, cash,
pickup, drop, error, success, unlock, camera, typing, microwave, alarm, spray, scratch, needle, rewind,
cheer, boo, whoosh, train, siren, splash, zip, shower, knock, glass, horn, blip, select, fail.
Music loops: `RP.audio.loop({genre, bpm, seed, energy, volume})` → `{start, stop(fade), setBpm, setFilter, setEnergy, nudge, phase, onBeat}`;
`RP.audio.recordLoop(RP.rec(id))`; `RP.setMusic({...}|null)`; `RP.audio.setAmbience(kind|null)`; `RP.audio.mixer()`.

## Records, gear, lore (REAL data — use it)

- `RP.data.records` — verified real releases: `{ id, artist, title, label, year, format, genre, city, bpm, bpmEst, energy (1–5), rarity, price, vibe[], fact, src, pick? }`.
  Get one with `RP.rec(id)`. Add to the crate with `RP.addRecord(id)`, check `RP.hasRecord(id)`, remove `RP.removeRecord(id)`.
  **Only use ids that exist in the catalog** (`src/data/records_house.js`, `src/data/records_more.js`).
  Lou's white label is `white_nyc93` (fictional, in `RP.data.extraRecords`).
- `RP.data.gear` — real gear with ids like `pioneer_cdj_900`, `pioneer_cdj_3000`, `technics_sl_1210mk2`, `technics_sl_1210mk7`,
  `can_electric_taula_4_mr`, `dynaudio_bm5_mkiii`, `dynaudio_core_47`, `krk_rokit_5_g4`, `sennheiser_hd25`, `ortofon_concorde_club` ...
  `RP.setGear(slot, id)`, `RP.gearInfo(id)`.
- `RP.data.lore` — `{ djs, labels, venues, stores, events }` with verified one-liners. Only state facts that appear there
  (or in a record's `fact`). Entries marked `verified: false` are names only — don't state their details.

## Locations (subway map)

```js
RP.location({ id: "a2_loc_loft", act: 2, label: "The Loft on Meserole", area: "Bushwick", room: "a2_loft", x: 60, y: 232, face: "right",
  fare: 3, mx: 230, my: 150 /* pin on the 320×200 map */, open: S => S.f.a2_gotAddress });
RP.unlock("a2_loc_loft")
```
The map shows locations of the current act that are unlocked (or whose `open(S)` is true). A hotspot
with `exit: "travel"` (subway stairs, a street corner) opens it; so does MENU → Subway map.
Set `S.f.noTravel = true` while travel must be blocked (e.g., mid-shift).

## Walkthrough tests (required for every act)

Register the full solution so it can be verified headlessly:
```js
RP.walkthroughs.act2 = [
  ["look", "hot:a2_tv"],                       // [verb, "hot:<hotspot|actor id>" | "inv:<item id>", withItem?]
  ["use", "hot:a2_door", "a2_key"],            // use a2_key with door
  ["give", "hot:a2_vic", "a2_flyer"],
  ["answers", [1, "guest list"]],              // queue dialog answers for the next RP.choose calls (index or text fragment)
  ["mg", { ok: true, score: 80 }],             // queue a mini-game result for the next RP.mg.play
  ["travel", "a2_loc_loft"],                   // travel via the subway map
  ["goto", "a2_loft", 300, 230],               // teleport (only if the story would)
  ["expect", "S.f.a2_gotSlot", "got the slot"],// JS expression with S and RP in scope
  ["run", async (S, RP) => { ... }]            // arbitrary async step
];
```
In fast mode every wait, walk, line and fade is instant, `RP.choose` takes queued answers (or the
last option when the queue is empty), `RP.travel` takes queued travel, and mini-games return the
queued result (or their `auto()` result). The walkthrough must reach `RP.completeAct` — end it with
`["expect", "S.done.includes(2)", "act 2 complete"]` (completing an act also starts the next one if it exists).

Run: `node tests/run.mjs walk act2 --act 2 --page <your build>` → must print `"ok": true` with no PAGE ERRORS.
