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
