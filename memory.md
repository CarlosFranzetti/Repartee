# Memory

A hand-written dump of the working context, so a fresh session can pick up where the last one stopped. Newest state
first. It is a summary, not a transcript. `context.md` keeps the older timestamped entries.

## State on 2026-11-11

**Streaming patch rework (owner: "the actual tracks aren't working").** Diagnosed from the sandbox, which can now reach
Apple: the Search API sends `access-control-allow-origin: *` for an https origin but NOT for a `null` origin (an
offline `dist/index.html`), so fetch died there with a silent fallback; headless Chromium has no AAC decoder, so the
preview itself cannot be heard in the sandbox (real browsers decode it; previews are `.m4a` AAC served as
`audio/x-m4p`). `src/core/stream.js` now: JSONP script-tag search first (no CORS needed; gives up at onload if the
reply never calls back), fetch as fallback; the `<audio>` plays directly (no createMediaElementSource: a tainted or
interrupted context gave silence with no error), mute via `onMuteChange`, fades by JS ramp; a silent WAV is played
inside the click so iOS allows the later play(); every fallback toasts its reason ("STREAM: ... Playing the loop.")
and `RP.stream.log` keeps the last 40 steps. Verified end to end with the real search and an MP3 substituted for
the AAC; `tests/browser.mjs --only stream` mocks both forms. Rate limit: the iTunes API answered 403 once during a
burst; keep calls spaced. The owner should play a jukebox record in a real browser and read any STREAM toast.

## State on 2026-11-09

**Shipped on the work branch (2026-11-09, owner asked for pause, sound toggle, save/load and a QA pass).** Pause
(`RP.pause`, `setPaused` in engine.js: PAUSE button in the sentence bar and in every mini-game header, Pause key,
Shift+P, auto-pause on hidden tab; freezes the loop, `RP.gnow` clock, `ptimeout` speech/wait/toast timers, the
mini-game host's rAF/timers, suspends the AudioContext, pauses streamed `<audio>`). One mute state (`RP.setMute`,
SND, M key, SOUND on the title and the pause overlay). Three manual save slots at `SAVE_KEY + ".slotN"`
(`RP.saveSlot/loadSlot/slotUI`), picker from the phone menu, pause overlay and a LOAD button on the title; autosave
and CONTINUE unchanged. Audio fixes: no resume while paused/hidden, suspend on hidden tab, ambience skips while
suspended, long stall jumps to present, fade-stop cancels fade-in, stopAll stops loops, sfx ignored while paused.
All mini-games route through the sfx bus (mute reaches them mid-game) and fit 844x390 with 32px touch targets.
New tests: `tests/browser.mjs` (five viewports, layout/audio/stream), `tests/sweep.mjs` (every verb on every
hotspot/item after every walkthrough step; 68,780 probes, 0 defects), `tests/saveload.mjs` (slots, title load,
pause in a room and in beat.Match, shared mute). Known limits: raw setTimeout/performance.now inside mini-games
and room scripts keep running during pause (only host helpers and RP.wait freeze); iOS "interrupted" handling and
real-device audio unverified from the sandbox.

## State on 2026-10-26

**Project.** re:parteé, a pixel-art point-and-click DJ adventure in five levels. Plain JavaScript on `window.RP`, HTML
canvas and Web Audio (all sound synthesized, no audio files, no npm dependencies). `node tools/build.mjs` bundles `src/`
into single-file pages: `dist/index.html` (full game), `dist/level1..5.html`, `dist/artifact.html`. Vercel serves
`dist/` at https://repartee-umber.vercel.app; a merge to `main` deploys production (once it didn't, and the deploy had to
be triggered by hand from the Vercel project; check after every merge).

**Branches.** Work happens on `claude/repartee-dj-game-dev-8sfca1`. `main` is at PR #8 (jukebox fade + Vercel Web
Analytics), which is live. The work branch is ahead of `main` with everything below and is NOT merged or deployed.
After a PR merges, restart the branch from `origin/main`. The remote copy of the branch could not be deleted from here
(the git proxy cut the delete); the owner can delete it on GitHub.

**On the work branch, not yet on main**
- The Level 1 and Level 2 claude.ai artifacts were DELETED on 2026-11-09 at the owner's request ("useless"); the
  full-game artifact (`FULL_GAME_URL` in `tools/build.mjs`, `dist/artifact.html`) still exists. `LEVEL_ARTIFACTS` is
  now empty, so artifact builds link every level page to the Vercel site.
- `TODO.md`: a "Later" item for a desktop app (Electron or Tauri wrapper).
- `tools/blindplay.mjs serve ... --unlock`: marks every level finished so Levels 2-5 pages open for playtests.
- Levels 3-5 story/continuity fixes and renames, and the room-sweep and mini-game-sweep fixes (see
  `docs/PLAYTEST_LOG.md`, "Levels 3-5 ... fixed on 2026-10-26"). Every walkthrough, the full Level 1-5 run in one save
  and the contrast check passed on a scratch build after these.

**Mini-games trimmed (2026-10-26, owner's call).** The story keeps eight: beat.Match, crowd.Read, go.Digging,
after.Party, buy.Gear, promoter.Talk, mak.Tracks, sound.Check. The other eight (guest.List, set.Time, playlist.Order,
club.Drama, get.Followers, last.Train, crate.Digging, record.Hunt) were replaced by short scenes and moved to
`src/minigames/retired/`, which the build skips (code kept, out of the game and the arcade). Level 3's club nights use
crowd.Read instead of set.Time. Build went from about 3.0 MB to 2.6 MB.

**Whole-game analysis (2026-11-03).** `docs/GAME_ANALYSIS.md` compares the game with Maniac Mansion and Zak
McKracken: length is about right (roughly 4 to 5.5 hours), but later levels drift into corridors, menu choices and
mini-games. Phase 1 (story sense, all levels) is done. Owner's decisions: money tight but never a dead end; one hero;
Phase 2 (the plan's list) is done too: see `docs/GAME_ANALYSIS.md`, Progress. Walkthroughs now include `act3alt` and
`act5alt`. Phase 3 = fresh blind playtests and length check (not started).

**Streaming patch (2026-11-03, owner's call).** `src/core/stream.js`. Unlock on the title logo: 3 taps on "re:", 2 on
"parteé", 3 on "re:" (the screen flashes; a toggle then sits under HOW TO PLAY). With it on, the jukebox and story
record plays fetch a 30-second official preview from Apple's public iTunes Search API in the browser (no server, no
key; the owner rejected depending on the discogs-stream Supabase functions, and the game, a static site, cannot
resolve YouTube audio itself). The matcher prefers originals over remixes; failures fall back to the loop; mini-games
always get synth loops. For a full-length path later, `src/data/stream_ids.js` + `tools/stream-ids.mjs` give a
YouTube id per record (run from a machine that reaches YouTube; this sandbox cannot). itunes.apple.com is also blocked
from the sandbox, so the live call is unverified here; the owner should play a jukebox record in a browser.
Tagline is now "One questionable decision at a time."

**Open work (next).** All Level 3-5 findings from the blind takes, the story audit and the sweeps are fixed on the
work branch (see `docs/PLAYTEST_LOG.md`); two small items remain open there. Every walkthrough, the full Level 1-5 run,
smoke, perf (0 of 49 rooms over budget) and contrast pass on the rebuilt `dist/`. Next: open a PR, merge, deploy and
check the Vercel production deploy actually starts; optionally re-run a blind take on Levels 3-5 to confirm.

**How fixes are run.** Split by file ownership so no two agents edit the same file (act3, act4, act5, `src/core` +
`src/game.js` + `src/style.css`, and mini-game files). Each agent builds scratch copies with `--out` (never the plain
build while others work), must keep its level's walkthrough passing, and reports back; the coordinator commits. The
owner asked to be conservative with usage: prefer few agents.

**Tests.** `node tests/full.mjs [--page f]` (chapter select per level + Levels 1-5 in one save), `node tests/run.mjs walk
actN --act N --page dist/levelN.html` (also `act2alt`, `act4fail`), `node tests/run.mjs smoke`, `node tests/perf.mjs`,
`node tests/contrast.mjs [--page f]`. Sweep scripts from the audits lived in the session scratchpad and are gone with
it; recreate if needed.

**Decisions the owner made**
- Level pages and Chapter Select open only finished levels (Level 1 always open). Artifacts are exempt.
- Title theme: the v5 dark minor-key electro loop with an 8-bar breakdown (`src/core/titletheme.js`); it fades out while
  the jukebox is open and returns 2 s after it closes.
- Analytics: Vercel Web Analytics on hosted pages only (written out in `tools/build.mjs`, no npm package).
- Reused names: keep the first or most developed character; rename the others (list in `docs/STORY.md`, "Names in use").
- Prices stay in dollars everywhere (including Berlin).
- Commit footers name the model the session runs on and the session URL; PR bodies end with the Claude Code line and
  the session URL. Ask before opening PRs unless the owner asked; the owner usually says "PR, merge and deploy".

**Owner preferences.** Be honest about uncertainty; flag unverified facts and numbers; no invented sources or quotes.
Keep a timestamped context dump (`context.md`, and now this file) and update the docs when work lands.
