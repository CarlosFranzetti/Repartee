# re:parteé

**A pixel-art DJ adventure game.** From broke-ass bedroom DJ to festival headliner. One bad decision at a time.

A point-and-click adventure in the spirit of *Maniac Mansion*, *Zak McKracken* and *The Secret of
Monkey Island*. You're a broke bedroom DJ in New York City with four records, a crackling mixer
and a phone at 1%. Hustle, dig, mix and talk your way from Bushwick to a festival headline set.

- **Five levels:** Bedroom DJ → Underground Hustler → Club DJ → Touring DJ → Superstar DJ
- **Sixteen mini-games:** beat.Match, crowd.Read, set.Time, playlist.Order, go.Digging, crate.Digging,
  record.Hunt, buy.Gear, mak.Tracks, get.Followers, promoter.Talk, guest.List, sound.Check,
  after.Party, club.Drama, last.Train
- **Real music culture:** a catalog of real records, labels and DJ gear (Pioneer CDJs, Technics
  SL-1210s, KRK and Dynaudio monitors, the Can Electric Taula 4 MR rotary mixer), with release
  details checked against Discogs and Wikipedia.
- **Everything is code:** all art is drawn procedurally in 1990s VGA style (hue-shifted ramps, Bayer
  dithering, banded light maps, shaded characters with rim light and cast shadows) and all sound is
  synthesized live with the Web Audio API. No image or audio files.

## Play

Open `dist/index.html` in a browser. It's a single self-contained file (works offline, from
`file://`, or hosted anywhere). On a phone, landscape gives the full screen; portrait puts the
controls under the scene.

Controls: pick a verb, then click something. Click the floor to walk. Right-click looks.
**H** or **Tab** labels everything clickable. **MENU** opens messages, the subway map, your
record crate, your setup and saving. Mini-games explain their own controls and can be replayed
from the title screen's Mini-Game Arcade. Chapter Select jumps to any level.

## Develop

```
node tools/build.mjs                 # writes index.html (dev, one <script> per file) and dist/index.html (single file)
node tests/full.mjs                  # plays every level's walkthrough, then the whole game in one save
node tests/run.mjs smoke             # boots every level
node tests/run.mjs walk act2 --act 2 # one level's walkthrough
node tests/run.mjs shot a2_couch out.png --act 2
node tests/run.mjs mg crowdRead out.png
```

Docs for contributors: [`docs/ENGINE_API.md`](docs/ENGINE_API.md), [`docs/STORY.md`](docs/STORY.md),
[`docs/STYLE.md`](docs/STYLE.md), [`docs/MINIGAMES.md`](docs/MINIGAMES.md), [`docs/PAINTKIT.md`](docs/PAINTKIT.md),
research notes in [`docs/research/`](docs/research/).

Layout: `src/core` (engine, characters, lighting/FX, audio, paint kit), `src/data` (records, gear,
lore, recurring cast), `src/minigames`, `src/acts/act1..act5`, `src/game.js` (title, menus, credits).

## A note on real people and places

Records, labels, artists, DJs, gear and historic venues are real and referenced as homage. BPMs
are approximate and in-game prices are game values, not market prices. Appearances and dialogue
by real DJs are brief, fictional cameos and imply no endorsement. Every other character, club,
store and company in the story is fictional.
