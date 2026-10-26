# Memory

A hand-written dump of the working context, so a fresh session can pick up where the last one stopped. Newest state
first. It is a summary, not a transcript. `context.md` keeps the older timestamped entries.

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
- Level 1 and Level 2 claude.ai artifacts: https://claude.ai/artifact/4m4u3sHMgVhkqURBBfiFtY and
  https://claude.ai/artifact/QMwvpWyeeqKM3HgfgP4EhF (private). Built with `node tools/build.mjs --out <f> --level N
  --artifact` (writes `<f>.artifact.html`). Artifact builds set `RP_SITE.artifact`, so their level pages never lock
  (each artifact has its own storage), and link to each other via `LEVEL_ARTIFACTS` in `tools/build.mjs`.
- `TODO.md`: a "Later" item for a desktop app (Electron or Tauri wrapper).
- `tools/blindplay.mjs serve ... --unlock`: marks every level finished so Levels 2-5 pages open for playtests.
- Levels 3-5 story/continuity fixes and renames, and the room-sweep and mini-game-sweep fixes (see
  `docs/PLAYTEST_LOG.md`, "Levels 3-5 ... fixed on 2026-10-26"). Every walkthrough, the full Level 1-5 run in one save
  and the contrast check passed on a scratch build after these.

**Open work (next).** The Level 3-5 blind-take findings, listed as 3-1..3-11, 4-1..4-11, 5-1..5-10 under "Open" in
`docs/PLAYTEST_LOG.md`. Most important: 4-1 (Level 4 cover photo: Use phone on the hole opens the phone menu; a
blocker) and 5-1 (Level 5 stage-left stairs exit does nothing). A fix round with six agents was started and then paused
by the owner; two half-done edits (club.Drama, get.Followers) are in `git stash` as "round 3 partial ..." (untested;
safe to drop or use as a starting point). Also open: negative first-frame colour index in `act3/30_halcyon.js`,
`act3/31_booth.js`, `act4/10_studio.js`; beat.Match deck subtitles truncated; re-measure room speed on an idle machine.

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
