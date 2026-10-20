# TODO

## Next

- [ ] **Blind playthroughs of Levels 3, 4 and 5.** Run a fresh blind agent on each level page, like the Level 1 and 2 runs
      (`node tools/blindplay.mjs serve --level N --port 710N --out runs/levelN`; the agent plays through the
      `node tools/blindplay.mjs --port 710N ...` commands, with sound). Log every bug, confusing clue, unfair puzzle and
      text problem in [`docs/PLAYTEST_LOG.md`](docs/PLAYTEST_LOG.md), with the level, place and run.
- [ ] **Then send a swarm of agents to fix everything in the log.** Split the open findings by area (one agent per level
      or mini-game, so no two edit the same file), have each run its level's walkthrough
      (`node tests/run.mjs walk actN --act N --page <scratch build>`), then integrate, run `node tests/full.mjs`,
      `node tests/perf.mjs` and `node tests/contrast.mjs`, and ship one pull request.

## Later

- [ ] **Desktop app (a binary).** Wrap the game's single HTML file (`dist/index.html`) in an Electron or Tauri window and
      build it for Windows, Mac and Linux. Things to know:
      - Vercel Web Analytics only runs on the hosted pages, so the app would not report to the dashboard. Counting app
        players would need a different kind of tracking.
      - Windows and Mac builds usually come from automated builds on GitHub (or from running the build on your own Mac or
        PC). Mac apps normally need Apple's paid developer program to open without a warning; Windows has a similar
        "unknown publisher" warning. Check Apple's and Microsoft's current requirements and costs before starting.
      - The offline `dist/index.html` already works by double-clicking it. A wrapper mainly adds an app icon, its own
        window and a possible store listing.
