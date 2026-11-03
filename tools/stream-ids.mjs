// Fills src/data/stream_ids.js with a YouTube video id per record, by scraping YouTube's search page (no API key).
// Run it from a machine that can reach youtube.com. It keeps ids already in the file, so re-runs only fill gaps;
// delete an entry to force a new lookup. The result is a starting point: check a few by ear and hand-fix bad matches.
//   node tools/stream-ids.mjs [--only id1,id2] [--delay 1200]
import fs from "fs";
import path from "path";
import vm from "vm";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i >= 0 ? args[i + 1] : d; };
const only = opt("only", "") ? opt("only").split(",") : null;
const delay = +opt("delay", 1200);

// the catalog, loaded the way the game does (plain scripts on window.RP)
const ctx = { window: { RP: { u: { mulberry: () => () => 0, hashStr: () => 0, clamp: a => a }, data: {} } } };
for (const f of fs.readdirSync(path.join(root, "src/data")).filter(f => f.startsWith("records") && f.endsWith(".js")).sort()) vm.runInNewContext(fs.readFileSync(path.join(root, "src/data", f), "utf8"), ctx);
const records = ctx.window.RP.data.records || [];
const file = path.join(root, "src/data/stream_ids.js");
const src = fs.readFileSync(file, "utf8");
const have = (() => { const m = /RP\.data\.streamIds = (\{[\s\S]*?\});/.exec(src); try { return m ? vm.runInNewContext("(" + m[1] + ")") : {}; } catch (e) { return {}; } })();

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function search(q) {
  const r = await fetch("https://www.youtube.com/results?search_query=" + encodeURIComponent(q) + "&sp=EgIQAQ%253D%253D", { headers: { "accept-language": "en-US,en;q=0.9", "user-agent": "Mozilla/5.0" } });
  if (!r.ok) throw new Error("http " + r.status);
  const html = await r.text();
  // the first videoRenderer in the embedded initial data is the top result
  const m = /"videoRenderer":\{"videoId":"([\w-]{11})"[\s\S]*?"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/.exec(html);
  return m ? { id: m[1], title: JSON.parse('"' + m[2] + '"') } : null;
}

let n = 0;
for (const rec of records) {
  if (only && !only.includes(rec.id)) continue;
  if (have[rec.id]) continue;
  const q = rec.artist + " " + rec.title.replace(/ \(.*\)$/, "");
  try {
    const hit = await search(q);
    if (hit) { have[rec.id] = hit.id; n++; console.log(rec.id.padEnd(44), hit.id, " ", hit.title); }
    else console.log(rec.id.padEnd(44), "(no result)");
  } catch (e) { console.log(rec.id.padEnd(44), "error:", e.message); }
  await sleep(delay);
}
const body = Object.keys(have).sort().map(k => `  ${JSON.stringify(k)}: ${JSON.stringify(have[k])}`).join(",\n");
fs.writeFileSync(file, src.replace(/RP\.data\.streamIds = \{[\s\S]*?\};/, "RP.data.streamIds = {\n" + body + "\n};"));
console.log(n + " new id(s); " + Object.keys(have).length + " of " + records.length + " records have one");
