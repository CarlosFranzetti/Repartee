# re:parteé — Mini-games

Sixteen mini-games, each a module in `src/minigames/<id>.js`. Acts call them with
`const res = await RP.mg.play(id, params)`. The Mini-Game Arcade (title screen) calls them with
`{ arcade: true, difficulty: 2 }`, so **every param is optional** and each game must invent
sensible defaults (usually real records picked from `RP.data.records`).

Reference implementation: `src/minigames/beatmatch.js`.

## Module contract

```js
RP.mg.register("crowdRead", {
  title: "crowd.Read",          // lowercase-dot-Camel name shown in the header and arcade
  order: 3,                     // arcade order
  desc: "One line for the arcade menu.",
  auto(params, S) { return { ok: true, score: 80, ... }; },   // instant result for headless tests
  async play(host, params) { ... return { ok, score, ... }; }
});
```
`host` (created by the engine; the overlay is cleaned up for you when `play` resolves):
- `host.root` — your container (inside a full-screen overlay styled with `.mg`); `host.ov` — the overlay
- `host.header(title, sub)` — standard title bar; `host.button(text, onClick, cls)`
- `host.el(tag, attrs, parent)` — element helper (`attrs.text`, `attrs.html`, `attrs.cls`, `onclick` ...)
- `host.raf(fn)` — animation loop until `fn` returns false or the game ends
- `host.timeout(fn, ms)`, `host.interval(fn, ms)`, `host.onKey(fn)`, `host.onKeyUp(fn)`, `host.cleanup(fn)` — all auto-removed
- `host.rec(id)` → record object; `host.sleeve(ctx, record, x, y, size)` → paints a record sleeve
- `host.sfx(name)`, `host.audio` (= `RP.audio`), `host.S` (game state, read it), `host.params`

Shared CSS classes (in `src/style.css`): `.mg-head .mg-logo .mg-sub .mg-panel .mg-msg .mg-say .row .spacer .big .ok .bad .btn .btn.primary .kbtn .blend`
and the color variables `--pink --cyan --lime --amber --fg --muted --line --ok`. Fonts: `var(--ui)` (VT323), `var(--logo)` (Press Start 2P).
Put game-specific CSS in a `<style>` you inject once (see beatmatch.js).

## Quality bar

- Looks like a 1990s pixel-art game screen: draw scenes/sprites on canvases at low resolution with
  `image-rendering: pixelated` (add class `px`), integer pixels, Bayer dithering (`RP.u.bayer`),
  hue-shifted ramps (`RP.u.ramp`). You may draw characters with `RP.chars.draw(ctx, {id|def, x, y, face, act, frame}, {lx, rim})`
  — crowds via `RP.chars.random(seed)`.
- Fun in 1–3 minutes, readable rules on screen, a clear win/lose state, a score 0–100.
- Real records: show artist – title (label, year) wherever a record appears. Use `record.bpm`,
  `record.energy` (1–5), `record.genre`, `record.vibe`, `record.rarity`, `record.price`.
- Sound via `RP.audio` (loops for music: `RP.audio.recordLoop(rec)`, `RP.audio.loop({...})`; stop
  them in `host.cleanup`). Must work silently when there's no AudioContext.
- Controls: mouse/touch AND keyboard. Works at phone width (≥ 340 px wide, portrait) and on desktop.
- `prefers-reduced-motion`: no flashing/strobe.
- Always offer a way out (a "LEAVE"/"GIVE UP" button) that resolves `{ ok: false }`.
- `difficulty` 1–5 scales time limits, tolerances and opponents.
- Never throw. Don't touch the DOM outside `host.root` (except a one-time `<style>` and transient
  `.blend` flashes on `document.body`).

## The sixteen (ids, params, results)

| id | title | used in | params (all optional) | result |
|---|---|---|---|---|
| `beatMatch` | beat.Match | 1, 4, 5 | `a, b` record ids; `caller` (phone framing); `difficulty`; `tolerance` | `{ok, score, time}` |
| `crowdRead` | crowd.Read | 1, 4, 5 | `records: [ids]` (the set you can play); `crowd: "empty-bar"|"house"|"techno"|"festival"|"loft"`; `rounds` (4); `goal` (energy target); `difficulty`; `venue` label | `{ok, score, played: [ids], peak}` |
| `setTime` | set.Time | 3, 5 | `scenario: "opener"|"follow-legend"|"overrun"|"closing"`; `records`; `followName` ("Kosmo Delacroix"); `minutes`; `difficulty` | `{ok, score}` |
| `playlistOrder` | playlist.Order | 3, 5 | `records: [ids]` (pool); `slots` (6–10); `arc: "warmup"|"peak"|"journey"|"closer"`; `difficulty` | `{ok, score, order: [ids]}` |
| `goDigging` | go.Digging | 1, 3 | `store` ("Deep Cuts"); `budget` ($); `bins: [{label, records:[ids]}]`; `want: {vibe?, genre?, maxPrice?, id?}`; `wallet` (total cash, shown beside the budget); `budgetNote` (what the rest is for); `difficulty` | `{ok, score, bought: [ids], spent}` |
| `crateDigging` | crate.Digging | 3 | `records: [ids]` (the collection; junk + gems); `budget`; `time`; `difficulty` | `{ok, score, keep: [ids], sold: [ids], profit}` |
| `recordHunt` | record.Hunt | 3 | `target` record id; `clues: [strings]`; `places: [{id,label,hint}]`; `difficulty` | `{ok, score, found: bool}` |
| `buyGear` | buy.Gear | 2, 3, 5 | `slot` ("turntables"…); `options: [gearIds]`; `seller` ("Eddie Two-Times"); `budget`; `scams` (# of broken listings); `asks: {gearId: $}` (fixed asking prices); `flaws: [per listing: "ok", "cosmetic" or a fault]` (scripted listings); `difficulty` | `{ok, score, bought: gearId|null, paid}` |
| `makTracks` | mak.Tracks | 4 | `sample` (record id to sample, e.g. "white_nyc93"); `bpm`; `genre`; `difficulty`; `collab` ("Lou") | `{ok, score, track: {name, bpm, pattern}}` |
| `getFollowers` | get.Followers | 3, 4 | `days` (time budget); `start` followers; `goal`; `difficulty` | `{ok, score, gained}` |
| `promoterTalk` | promoter.Talk | 2, 4 | `promoter` (name), `charId` (character id to draw), `ask` ("a monthly", "your fee"), `patience`, `difficulty` | `{ok, score, deal: {...}}` |
| `guestList` | guest.List | 2, 5 | `capacity`, `requests` (count), `vip` names, `difficulty` | `{ok, score, admitted, angry}` |
| `soundCheck` | sound.Check | 2, 5 | `faults: ["ground-hum","dead-channel","feedback","blown-tweeter","wrong-input"]`; `time`; `stage` ("loft"/"festival"); `difficulty` | `{ok, score, fixed: n}` |
| `afterParty` | after.Party | 2 | `needs: {people, location, sound}`; `contacts` (names); `time`; `difficulty` | `{ok, score, guests}` |
| `clubDrama` | club.Drama | 3, 5 | `scenario: "rival"|"promoter"|"friend"|"backstage"|"ego"`; `rival` (name); `difficulty` | `{ok, score, outcome}` |
| `lastTrain` | last.Train | 3, 4 | `from`, `to` (labels); `battery` (%); `money`; `carrying: "records"|"turntables"|"suitcase"`; `mode: "subway"|"airport"`; `difficulty` | `{ok, score, minutesLate}` |

### Design notes per game

- **crowd.Read** — the floor is a pixel crowd seen from the booth; their mood/energy shows in how
  many dance and how hard. Each round you pick the next record from `records` (sleeves with real
  info); fit = how well its energy/BPM/genre matches what the crowd needs next (build gradually;
  don't drop the peak too early; a weird record can win or lose the room). A short loop of the
  chosen record plays (`RP.audio.recordLoop`). Bartenders dancing = win in act 1.
- **set.Time** — a time-pressure management game: a clock, the floor, and events ("the headliner
  is late", "the legend is still playing 20 min past his slot", "the floor is empty at 10 PM").
  Choices + timing (fade out, ride the filter, play a longer record, talk to the promoter).
- **playlist.Order** — drag/tap to arrange N records into slots; a live energy curve graph shows
  the arc; BPM jumps and genre clashes are penalized; harmonic info is NOT available (we don't
  have verified keys), so judge on BPM/energy/genre/vibe.
- **go.Digging / crate.Digging / record.Hunt** — flip through crates sleeve by sleeve (real
  records, the junk is real too: cheesy dollar-bin records), inspect condition, haggle with a
  budget, spot the gem. Hunt = follow clues across NYC spots on a little map.
- **buy.Gear** — inspect listings (real models from `RP.data.gear`); spot the broken one
  (warped platter, scratchy pitch fader, missing needle, "it was working this morning"); haggle.
- **mak.Tracks** — a 16-step sequencer + sampler: kick/clap/hat/bass rows + a chopped sample of the
  white label; play it with `RP.audio`; goals like "make the drop hit" (energy curve) and a
  collaborator (Lou) reacting.
- **get.Followers** — a week planner: spend days on posting/practice/digging/networking; random
  events (a clip goes viral, a hater, an algorithm change); reach the goal without burning out.
- **promoter.Talk** — a dialogue duel: pick lines; promoter has patience and interest meters;
  don't sound desperate; know their party (clues).
- **guest.List** — at the door with a clipboard: people arrive with claims ("I'm with the DJ",
  "plus three"), capacity is limited, VIPs must get in, friends must not all get in.
- **sound.Check** — signal-flow puzzle: cables from decks → mixer → amp → speakers, find the fault
  (ground hum, dead channel, feedback, blown tweeter, wrong input) before doors open.
- **after.Party** — logistics puzzle: recruit people (contacts on your phone), find a location,
  borrow a sound system, before the sun comes up.
- **club.Drama** — choose-your-response social puzzles with escalating stakes and humor.
- **last.Train** — a route puzzle on a pixel subway/airport map: battery drains, trains come and
  go, money is limited, the gear is heavy.
