/* YouTube video ids for the records, for a future full-length path of the streaming patch (an embedded player, or a
   serverless function that resolves audio). Keyed by record id; an empty map means nothing resolved yet. Fill it in
   with `node tools/stream-ids.mjs` from a machine that can reach YouTube; hand-edit entries to correct a bad match. */
(function () {
"use strict";
const RP = window.RP;
RP.data = RP.data || {};
RP.data.streamIds = {
};
})();
