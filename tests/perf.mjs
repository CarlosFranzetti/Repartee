// Frame-cost check: visit every room of every level and time simulated frames.
// usage: node tests/perf.mjs [--page dist/index.html] [--budget 8]
import { createRequire } from "module";
import path from "path";
const require = createRequire(import.meta.url);
const { chromium } = require("/opt/node-tools/node_modules/playwright");
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i >= 0 ? args[i + 1] : d; };
const page = path.resolve(opt("page", path.join(root, "dist/index.html")));
const budget = +opt("budget", 8);
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
p.on("pageerror", e => errors.push(e.message));
await p.goto("file://" + page);
await p.waitForTimeout(300);
const rows = await p.evaluate(async () => {
  const RP = window.RP, out = [];
  RP.test.noSave = true; RP.test.setFast(true);
  document.querySelectorAll("#title").forEach(e => e.remove());
  RP.hideGame(false); RP.layout();
  const byAct = {};
  Object.values(RP.rooms).forEach(r => { (byAct[r.act || 0] = byAct[r.act || 0] || []).push(r.id); });
  for (const act of Object.keys(byAct).map(Number).sort()) {
    if (RP.acts[act]) { RP.reset(); await RP.startAct(act, { noCard: true, noIntro: true }); }
    for (const id of byAct[act]) {
      const t0 = performance.now();
      try { await RP.goto(id, undefined, undefined, undefined, { instant: true }); } catch (e) { out.push({ id, act, err: String(e) }); continue; }
      RP.test.frameCost(3); // warm caches
      const first = performance.now() - t0;
      out.push({ id, act, enter: Math.round(first), frame: +RP.test.frameCost(60).toFixed(2), actors: RP.curRoom().actors.length });
    }
  }
  return out;
});
let slow = 0;
for (const r of rows) {
  if (r.err) { console.log("ERR  " + r.id + " " + r.err); slow++; continue; }
  const flag = r.frame > budget ? "SLOW" : "ok  ";
  if (r.frame > budget) slow++;
  console.log(`${flag} act${r.act} ${r.id.padEnd(22)} frame ${String(r.frame).padStart(6)} ms  enter ${String(r.enter).padStart(5)} ms  actors ${r.actors}`);
}
if (errors.length) console.log("PAGE ERRORS:\n  " + errors.slice(0, 10).join("\n  "));
console.log(rows.length + " rooms, " + slow + " over " + budget + " ms/frame");
await browser.close();
