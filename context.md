# Context dump

Newest entry first. Each entry is a hand-written summary of the working session so a fresh context can pick up where
this one left off. It is not a verbatim copy of the conversation.

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

**Title theme (v3):** a 16-bar loop at 124 BPM in E minor (Em7, Em7, Am7, Bm7), in the dark Detroit-electro vein the owner
asked for ("like Drexciya"). A loud, deep, rolling bass leads, with one darker offbeat note (a flat second above the root,
slightly flat in tuning); a broken electro kick; quieter, lower bleeps, pad and stabs (minor third and flat second only);
and random low-mid plucks ringing out through a darker dotted-eighth echo. The sung "Re Party" voice from v1 was removed
at the owner's request. It starts on the first click or key on the title, steps aside for jukebox previews and
mini-games, and stops when a game starts. Checked by recording it in headless Chromium: the bass sits about 1.6 dB
further above the rest than in v2 (the master compressor limits how far it can go). The owner has not yet heard v3.

**Open items**
- Listen to the title theme and tune it (voice level, echo, pad, bleep density).
- Vercel Analytics: add the snippet to the page head in `tools/build.mjs` for `dist/` pages (not the artifact build) and
  turn on Web Analytics in the Vercel project. Not done; waiting on the owner's go-ahead.
- `TODO.md`: blind playthroughs of Levels 3 to 5, then an agent swarm to fix what they find. Not started.
- The full-game claude.ai artifact (https://claude.ai/artifact/8tvKcJw3WLVhBsno8Snk6N) is older than main.
- Level 2 money finding 2-19 (subway fare and ATM fee give no warning) is still open in `docs/PLAYTEST_LOG.md`.

**How to check work:** `node tools/build.mjs`, `node tests/full.mjs`, `node tests/run.mjs smoke`, `node tests/perf.mjs`,
`node tests/contrast.mjs`, and `node tests/run.mjs walk actN --act N --page dist/levelN.html` for each level page.
