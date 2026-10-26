# Context dump

Newest entry first. Each entry is a hand-written summary of the working session so a fresh context can pick up where
this one left off. It is not a verbatim copy of the conversation.

## 2026-10-26

See `memory.md` for the current full state. Since the entry below: PR #7 (title theme) and PR #8 (jukebox fade,
Vercel Web Analytics) are merged and live; Level 1 and 2 claude.ai artifacts were published; Levels 3-5 got blind
playtests, a story audit and room and mini-game sweeps, and the audit and sweep findings were fixed on the work branch
(not merged). The Level 3-5 blind-take findings are open in `docs/PLAYTEST_LOG.md`.

## 2026-10-20 17:44 UTC

**Project:** re:parteé, a pixel-art DJ adventure. Plain JavaScript on `window.RP`, HTML canvas and Web Audio (all sound is
synthesized, no audio files, no npm dependencies). `node tools/build.mjs` bundles `src/` into single-file pages in
`dist/` (`index.html` plus `level1..5.html`). Vercel serves `dist/` as a static site (`vercel.json`, `framework: null`) at
https://repartee-umber.vercel.app; every merge to `main` deploys to production.

**State of main:** PR #6 is merged and live. It contains the Level 1 and 2 playtest fixes, readable disabled controls, the
pixel arrow cursor, and the new title menu (split CONTINUE | NEW GAME, Chapter Select and level pages locked until the
level is finished, Jukebox of all 105 records, mini-game tiles with a PLAY card).

**Work branch:** `claude/repartee-dj-game-dev-8sfca1`. It was restarted from `main` after the merge. New since then:
the title theme (`src/core/titletheme.js`, wired in `src/game.js`; `audio.buses()` added to `src/core/audio.js`).

**Title theme (v5):** a 24-bar loop at 124 BPM in E minor, in the dark Detroit-electro vein the owner asked for ("like
Drexciya"). Bars 1 to 16 are the groove: a loud, deep, rolling bass with one darker offbeat note (a flat second above the
root), a broken electro kick, quiet low bleeps, sparse minor 9th/7th chords (one short stab a bar, a two-bar pad), random
low-mid plucks into a dark dotted-eighth echo, and percussion that alternates bar to bar (rim and shaker on even bars,
low toms on odd bars, a tom fill every fourth bar). Bars 17 to 24 are the breakdown: bass, bleeps, plucks, stabs, pad and
the extra percussion drop out, leaving kick, clap and hats plus two dark organ chords (Em, then F, a flat second up: the
"Halloween" step); a clap fill leads back into the loop. The owner's word was "oile"; I read it as "vibe" and used an
organ sound, so check that guess. The sung "Re Party" voice from v1 was removed at the owner's request. It starts on the
first click or key on the title, steps aside for jukebox previews and mini-games, and stops when a game starts. Checked
by recording it in headless Chromium (spectrogram shows the breakdown); the owner has not yet heard v5.

**Open items**
- Listen to the title theme and tune it (voice level, echo, pad, bleep density).
- Vercel Analytics: added to the hosted pages (`dist/*.html`) via `tools/build.mjs` (the same thing `@vercel/analytics` `inject()` does,
  without the npm package). It loads only over http(s), so offline copies and the claude.ai artifact build send nothing. Web Analytics must
  be enabled in the Vercel project (the owner was doing that). Counts only appear for visits to the live site.
- `TODO.md`: blind playthroughs of Levels 3 to 5, then an agent swarm to fix what they find. Not started.
- The full-game claude.ai artifact (https://claude.ai/artifact/8tvKcJw3WLVhBsno8Snk6N) is older than main.
- Level 2 money finding 2-19 (subway fare and ATM fee give no warning) is still open in `docs/PLAYTEST_LOG.md`.

**How to check work:** `node tools/build.mjs`, `node tests/full.mjs`, `node tests/run.mjs smoke`, `node tests/perf.mjs`,
`node tests/contrast.mjs`, and `node tests/run.mjs walk actN --act N --page dist/levelN.html` for each level page.
