/* Aliases for the streaming patch (src/core/stream.js): records the iTunes store files under another name, or
   releases (EPs, albums, compilations) where a named track has to stand in for the whole record. Keyed by record id;
   `artist` and/or `title` replace the catalog's for the lookup only. An alias is tried first and still has to pass
   the matcher, so a wrong one falls through to the normal lookup. Check with `node tools/stream-check.mjs <id>`.
   Checked against the store on 2026-11-18. Track-to-release pairings are from memory; hand-fix any that are wrong.
   Not in the store on that date, so they keep the built-in loop: Frankie Knuckles presents Satoshi Tomiie "Tears",
   Underground Resistance "Riot EP", Grandmaster Flash "...on the Wheels of Steel", Jeff Mills "Waveform Transmission
   Vol. 1". */
(function () {
"use strict";
const RP = window.RP;
RP.data = RP.data || {};
RP.data.streamAlias = {
  "francois_k_fk_ep": { title: "Hypnodelic" },
  "jeff_mills_kat_moda_ep": { title: "The Bells" },
  "drexciya_the_quest": { title: "Wavejumper" },
  "69_4_jazz_funk_classics": { title: "My Machines" },
  "marcel_dettmann_dettmann": { title: "Argon" },
  "ricardo_villalobos_alcachofa": { title: "Dexter" },
  "klein_mbo_dirty_talk": { artist: "Klein MBO" }
};
})();
