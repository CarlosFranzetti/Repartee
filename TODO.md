# TODO

## Next

- [x] **Blind playthroughs of Levels 3, 4 and 5.** Done 2026-10-26 (plus a story audit and room and mini-game sweeps). Run a fresh blind agent on each level page, like the Level 1 and 2 runs
      (`node tools/blindplay.mjs serve --level N --port 710N --out runs/levelN`; the agent plays through the
      `node tools/blindplay.mjs --port 710N ...` commands, with sound). Log every bug, confusing clue, unfair puzzle and
      text problem in [`docs/PLAYTEST_LOG.md`](docs/PLAYTEST_LOG.md), with the level, place and run.
- [x] **Then send a swarm of agents to fix everything in the log.** Done 2026-10-26 on the work branch (not merged yet);
      two small items remain open in the log. Split the open findings by area (one agent per level
      or mini-game, so no two edit the same file), have each run its level's walkthrough
      (`node tests/run.mjs walk actN --act N --page <scratch build>`), then integrate, run `node tests/full.mjs`,
      `node tests/perf.mjs` and `node tests/contrast.mjs`, and ship one pull request.

- [x] **Pause, sound switch, save slots, phone fit (2026-11-09).** PAUSE button (Pause key, Shift+P, auto on hidden
      tab) freezes loop, clock, speech, mini-games and the AudioContext; one mute state behind SND, M, the title and the
      pause overlay; three manual save slots with a picker (menu, pause overlay, LOAD on the title) next to the
      autosave. Browser QA (`tests/browser.mjs`), logic sweep (`tests/sweep.mjs`, 68,780 probes, 0 defects) and
      save/pause tests (`tests/saveload.mjs`) added; all mini-games fit phone landscape with 32px touch targets and
      follow the mute switch mid-game.

## Later

- [x] **Secret streaming patch.** Built 2026-11-03 (`src/core/stream.js`): tapping the title logo (3 on "re:", 2 on
      "parteé", 3 on "re:") flashes the screen and turns it on (a toggle then appears under HOW TO PLAY). The jukebox
      and the story's record plays then play the actual record: official 30-second previews from Apple's public
      iTunes Search API, straight from the browser (no server, no key, licensed), audio only, looping until stopped;
      anything that fails falls back to the built-in loop. Mini-games always keep the synthesized loops, so beat.Match
      is untouched. The owner chose previews over YouTube audio (which needs a server to resolve).
- [ ] **Full-length streaming (later).** `src/data/stream_ids.js` holds a YouTube video id per record (empty until
      `node tools/stream-ids.mjs` is run from a machine that reaches youtube.com; hand-fix bad matches). On top of it,
      add either an embedded player (video present, terms to check) or a serverless function on the game's own Vercel
      project that resolves a video id to audio (the stream repo's yt-dlp-audio, moved in-house). Not started.
