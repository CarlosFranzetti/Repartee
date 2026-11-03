# Retired mini-games

The owner trimmed the story to eight mini-games (beat.Match, crowd.Read, go.Digging, after.Party, buy.Gear,
promoter.Talk, mak.Tracks, sound.Check). These eight were replaced in the story by short scenes and are left out of the
build (`tools/build.mjs` skips this folder), but the code is kept:

guest.List, set.Time, playlist.Order, club.Drama, get.Followers, last.Train, crate.Digging, record.Hunt.

To bring one back, move its file up to `src/minigames/`, add it to `MG_LEVELS` in `src/game.js`, and call it from an act
with `RP.mg.play(id, params)` (parameters are in `docs/MINIGAMES.md`). The shared helpers they use (`setkit_lib.js`,
`digkit_lib.js`, `nightkit_lib.js`, `socialkit_lib.js`) are still built, because kept games use them too.
