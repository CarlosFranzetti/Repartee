// Full playthrough: start a new game at level 1 and run every level's walkthrough back to back
// in ONE session (state carries over between levels exactly as for a player), then report.
// Also runs each level on its own from chapter select.
// usage: node tests/full.mjs [--page dist/index.html]
import { createRequire } from "module";
import path from "path";
const require = createRequire(import.meta.url);
const { chromium } = require("/opt/node-tools/node_modules/playwright");
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i >= 0 ? args[i + 1] : d; };
const page = path.resolve(opt("page", path.join(root, "dist/index.html")));

const browser = await chromium.launch();
let failures = 0;

async function session(label, fn) {
  const p = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  p.on("pageerror", e => errors.push("pageerror: " + e.message));
  p.on("console", m => { if (m.type() === "error") errors.push("console: " + m.text()); });
  await p.goto("file://" + page);
  await p.waitForTimeout(300);
  const out = await fn(p);
  const loadErr = await p.evaluate(() => window.__loadErrors || []);
  if (loadErr.length) errors.push(...loadErr.map(e => "load: " + e));
  const ok = out.ok && !errors.length;
  if (!ok) failures++;
  console.log((ok ? "PASS " : "FAIL ") + label + (out.note ? " — " + out.note : ""));
  if (!out.ok && out.failed) console.log("   " + out.failed);
  if (errors.length) console.log("   errors:\n     " + errors.slice(0, 8).join("\n     "));
  if (!ok && out.log) console.log("   last log:\n     " + out.log.slice(-12).join("\n     "));
  await p.close();
  return out;
}

const acts = await (async () => {
  const p = await browser.newPage();
  await p.goto("file://" + page);
  await p.waitForTimeout(200);
  const a = await p.evaluate(() => Object.keys(window.RP.acts).map(Number).sort((x, y) => x - y));
  await p.close();
  return a;
})();
console.log("levels found: " + acts.join(", "));

// each level from chapter select
for (const n of acts) {
  await session("level " + n + " (chapter select)", p => p.evaluate(async n => {
    const RP = window.RP;
    RP.test.noSave = true; RP.test.setFast(true);
    document.querySelectorAll("#title").forEach(e => e.remove());
    RP.hideGame(false); RP.layout(); RP.reset(); RP.state.name = "DJ TEST";
    await RP.startAct(n, { noCard: true });
    const steps = RP.walkthroughs["act" + n];
    if (!steps) return { ok: false, failed: "no walkthrough act" + n };
    const r = await RP.test.run(steps);
    r.log = RP.test.log.slice(-20);
    r.note = "room " + RP.state.room + ", $" + RP.state.money + ", " + RP.state.records.length + " records, " + RP.state.followers + " fans";
    return r;
  }, n));
}

// the whole game in one session
await session("full game, levels " + acts.join("→") + " in one save", p => p.evaluate(async acts => {
  const RP = window.RP;
  RP.test.noSave = true; RP.test.setFast(true);
  document.querySelectorAll("#title").forEach(e => e.remove());
  RP.hideGame(false); RP.layout(); RP.reset(); RP.state.name = "DJ TEST";
  await RP.startAct(acts[0], { noCard: true });
  for (const n of acts) {
    if (RP.state.act !== n) return { ok: false, failed: "expected to be in level " + n + " but in " + RP.state.act, log: RP.test.log.slice(-20) };
    const r = await RP.test.run(RP.walkthroughs["act" + n] || []);
    if (!r.ok) { r.failed = "level " + n + ": " + r.failed; r.log = RP.test.log.slice(-20); return r; }
  }
  const S = RP.state;
  return { ok: S.done.length >= acts.length, failed: "done=" + JSON.stringify(S.done), note: "finished with $" + S.money + ", " + S.records.length + " records, " + S.followers + " fans, gear " + JSON.stringify(S.gear) };
}, acts));

await browser.close();
console.log(failures ? failures + " FAILURE(S)" : "ALL PASS");
process.exitCode = failures ? 1 : 0;
