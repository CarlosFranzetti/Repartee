// Screenshot any local HTML page with headless Chromium.
// usage: node tools/shot.mjs <page.html> <out.png> [width=1280] [height=720] [waitMs=500] [jsToEvalBeforeShot]
// Prints page console errors so a broken page is obvious.
import { createRequire } from "module";
import path from "path";
const require = createRequire(import.meta.url);
const { chromium } = require("/opt/node-tools/node_modules/playwright");

const [, , page = "index.html", out = "shot.png", w = "1280", h = "720", wait = "500", js = ""] = process.argv;
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: +w, height: +h } });
const errors = [];
p.on("pageerror", e => errors.push("pageerror: " + e.message));
p.on("console", m => { if (m.type() === "error") errors.push("console: " + m.text()); });
await p.goto("file://" + path.resolve(page));
await p.waitForTimeout(+wait);
if (js) { const r = await p.evaluate(js); if (r !== undefined) console.log("eval:", JSON.stringify(r)); await p.waitForTimeout(300); }
await p.screenshot({ path: out });
await browser.close();
if (errors.length) { console.log(errors.join("\n")); process.exitCode = 1; } else console.log("ok " + out);
