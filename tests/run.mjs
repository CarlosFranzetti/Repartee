// Headless test runner for re:parteé.
// usage:
//   node tests/run.mjs walk <walkthroughKey> [--act N] [--dev]   run RP.walkthroughs[key] in fast mode from the start of act N
//   node tests/run.mjs shot <roomId> <out.png> [--act N] [--state '{"f":{...}}'] [--x 300 --y 230] [--dev]
//   node tests/run.mjs smoke [--dev]                              boot, open title, start every act, report errors
//   node tests/run.mjs mg <miniGameId> <out.png> [--params '{...}'] [--wait 1500] [--dev]
// --dev loads index.html (separate files) instead of dist/index.html; --page <file> loads any built bundle
// (build your own with: node tools/build.mjs --out /some/scratch/game.html).
import { createRequire } from "module";
import path from "path";
const require = createRequire(import.meta.url);
const { chromium } = require("/opt/node-tools/node_modules/playwright");
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i >= 0 ? args[i + 1] : d; };
const flag = k => args.includes("--" + k);
const mode = args[0];
const page = opt("page") ? path.resolve(opt("page")) : path.join(root, flag("dev") ? "index.html" : "dist/index.html");

const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const vp = { width: +opt("w", 1280), height: +opt("h", 720) };
const p = await browser.newPage({ viewport: vp });
const errors = [];
p.on("pageerror", e => errors.push("pageerror: " + e.message));
p.on("console", m => { if (m.type() === "error") errors.push("console: " + m.text()); });
await p.goto("file://" + page);
await p.waitForTimeout(300);
let code = 0;

async function startAct(n, fast = true) {
  await p.evaluate(async ({ n, fast }) => {
    const RP = window.RP;
    RP.test.noSave = true;
    RP.test.setFast(fast);
    document.querySelectorAll("#title").forEach(e => e.remove());
    RP.hideGame(false); RP.layout();
    RP.reset(); RP.state.name = "DJ TEST";
    await RP.startAct(n, { noCard: true });
  }, { n, fast });
}

if (mode === "walk") {
  const key = args[1];
  const act = +opt("act", 1);
  await startAct(act, true);
  const res = await p.evaluate(async (key) => {
    const RP = window.RP;
    const steps = RP.walkthroughs[key];
    if (!steps) return { ok: false, failed: "no walkthrough " + key };
    const r = await RP.test.run(steps);
    r.log = RP.test.log.slice(-25);
    r.room = RP.state.room; r.act = RP.state.act; r.flags = RP.state.f; r.inv = RP.state.inv; r.money = RP.state.money;
    return r;
  }, key);
  console.log(JSON.stringify({ ok: res.ok, failed: res.failed, step: res.step, room: res.room, act: res.act, money: res.money, inv: res.inv }, null, 1));
  if (!res.ok) { console.log("last log:\n  " + (res.log || []).join("\n  ")); code = 1; }
} else if (mode === "shot") {
  const room = args[1], out = args[2] || "shot.png";
  const act = +opt("act", 1);
  await startAct(act, true);
  const st = JSON.parse(opt("state", "{}"));
  await p.evaluate(async ({ room, st, x, y, face }) => {
    const RP = window.RP;
    const S = RP.state;
    if (st.f) Object.assign(S.f, st.f);
    for (const k in st) if (k !== "f") S[k] = st[k];
    await RP.goto(room, x, y, face, { instant: true });
    RP.relight();
    RP.test.setFast(false);
  }, { room, st, x: opt("x") ? +opt("x") : undefined, y: opt("y") ? +opt("y") : undefined, face: opt("face") });
  await p.waitForTimeout(+opt("wait", 900));
  if (opt("eval")) await p.evaluate(opt("eval"));
  const el = await p.$("#frame");
  await (flag("full") ? p.screenshot({ path: out }) : el.screenshot({ path: out }));
  console.log("saved " + out);
} else if (mode === "mg") {
  const id = args[1], out = args[2] || "mg.png";
  await p.evaluate(({ id, params }) => { document.querySelectorAll("#title").forEach(e => e.remove()); window.RP.mg.play(id, params).then(r => { window.__mgResult = r; }); }, { id, params: JSON.parse(opt("params", '{"arcade":true,"difficulty":2}')) });
  await p.waitForTimeout(+opt("wait", 1500));
  if (opt("eval")) { const r = await p.evaluate(opt("eval")); if (r !== undefined) console.log("eval:", JSON.stringify(r)); await p.waitForTimeout(+opt("wait2", 500)); }
  await p.screenshot({ path: out });
  console.log("saved " + out, JSON.stringify(await p.evaluate(() => window.__mgResult || null)));
} else if (mode === "smoke") {
  const acts = await p.evaluate(() => Object.keys(window.RP.acts).map(Number));
  for (const n of acts) {
    await startAct(n, true);
    const info = await p.evaluate(() => ({ room: window.RP.state.room, act: window.RP.state.act, errs: window.RP.test.errors.slice() }));
    console.log("act " + n + ": room " + info.room + (info.errs.length ? " ERR " + info.errs.join(" | ") : " ok"));
    await p.waitForTimeout(200);
  }
  const mgs = await p.evaluate(() => window.RP.mg.list().map(m => m.id));
  console.log("mini-games: " + mgs.join(", "));
}
if (errors.length) { console.log("PAGE ERRORS:\n  " + errors.slice(0, 20).join("\n  ")); code = 1; }
await browser.close();
process.exitCode = code;
