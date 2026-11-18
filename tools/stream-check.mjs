// Checks which catalog records the streaming patch can resolve to a preview, by running the game's own resolver
// (src/core/stream.js, unchanged) in Node against the live iTunes Search API. The browser's script-tag lookup is
// stood in for by curl. Apple throttles bursts, so calls are spaced (default 7 s); a full run takes about 15 minutes.
//   node tools/stream-check.mjs [recordId ...] [--delay 7000] [--misses file.json]   (--misses rechecks a saved miss list)
// Prints one line per record and writes the misses to stream-misses.json in the current directory.
import fs from "fs"; import path from "path"; import vm from "vm"; import { execFileSync } from "child_process";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i >= 0 ? args[i + 1] : d; };
const delay = +opt("delay", 7000);
const ids = args.filter((a, i) => !a.startsWith("--") && !(args[i - 1] || "").startsWith("--"));
const sleep = ms => new Promise(r => setTimeout(r, ms));

const win = { RP: { u: { mulberry: () => () => 0, hashStr: () => 0, clamp: a => a, store: { get: () => null, set() {} } }, data: {}, audio: { recordLoop() {}, onPauseChange() {}, onMuteChange() {} } } };
let last = 0;
const document = {
  hidden: false, addEventListener() {},
  createElement: () => ({ remove() {} }),
  head: { appendChild(sc) { // the JSONP script tag: fetch its src with curl and call the named callback
    (async () => {
      const wait = last + delay - Date.now(); if (wait > 0) await sleep(wait);
      last = Date.now();
      const cb = /[?&]callback=([\w$]+)/.exec(sc.src)[1];
      try { const t = execFileSync("curl", ["-sS", "-m", "25", sc.src.replace(/&callback=[\w$]+/, "")], { encoding: "utf8" }); if (!t.trim()) throw new Error("empty reply"); win[cb](JSON.parse(t)); }
      catch (e) { last = Date.now() + 8000; if (sc.onerror) sc.onerror(); }
    })();
  } }
};
const ctx = vm.createContext({ window: win, document, setTimeout, clearTimeout, setInterval, clearInterval, performance, btoa, AbortController, console, Audio: function () {}, fetch: () => Promise.reject(new Error("no fetch in the checker")) });
for (const f of fs.readdirSync(path.join(root, "src/data")).filter(f => f.endsWith(".js")).sort()) { try { vm.runInContext(fs.readFileSync(path.join(root, "src/data", f), "utf8"), ctx); } catch (e) { /* data files that need the full game */ } }
vm.runInContext(fs.readFileSync(path.join(root, "src/core/stream.js"), "utf8"), ctx);
const ST = win.RP.stream; let records = win.RP.data.records || [];
const missFile = opt("misses"); if (missFile) { const m = JSON.parse(fs.readFileSync(missFile, "utf8")).map(x => x.id); records = records.filter(r => m.includes(r.id)); }
if (ids.length) records = records.filter(r => ids.includes(r.id));
const misses = []; let ok = 0;
for (const rec of records) {
  const n0 = ST.log.length; const r = await ST.resolve(rec);
  if (r) ok++; else misses.push({ id: rec.id, artist: rec.artist, title: rec.title, why: ST.lastWhy });
  console.log((r ? "OK   " : "MISS ") + (rec.artist + " - " + rec.title).padEnd(62).slice(0, 62) + (r ? " => " + r.artist + " - " + r.title : " (" + ST.log.slice(n0).map(l => l.replace(rec.id + " ", "")).join("; ") + ")"));
}
fs.writeFileSync("stream-misses.json", JSON.stringify(misses, null, 1));
console.log(`\n${ok} of ${records.length} resolve; ${misses.length} miss (stream-misses.json)`);
