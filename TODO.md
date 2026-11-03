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

## Later

- [x] **Secret streaming patch.** Built 2026-11-03 (`src/core/stream.js`): tapping the title logo (3 on "re:", 2 on "parteé",
      3 on "re:") flashes the screen and turns it on (a toggle then appears under HOW TO PLAY). The jukebox and the
      story's record plays stream the real track, audio only, through the public functions of the owner's
      discogs-stream project (youtube-search, then yt-dlp-audio, then invidious-audio), falling back to the built-in
      loop if anything fails. Mini-games always keep the synthesized loops, so beat.Match is untouched. Streams start a
      third of the way into the track. Not yet verified against the live functions (this sandbox cannot reach
      supabase.co); check in a browser.
