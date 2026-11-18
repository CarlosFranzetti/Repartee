// Builds docs/WALKTHROUGH.pdf from docs/WALKTHROUGH.md: pandoc turns the Markdown into HTML, this wraps it in a
// print stylesheet (the game's fonts, a dark cover with the title screenshot, one scene screenshot per level) and
// headless Chromium prints it to A4.   node tools/walkthrough-pdf.mjs [--out file.pdf] [--html file.html]
// Needs pandoc and pdfunite (poppler) on the PATH and the Playwright that the tests use.
import fs from "fs"; import path from "path"; import { execFileSync } from "child_process"; import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("/opt/node-tools/node_modules/playwright");
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2); const opt = (k, d) => { const i = args.indexOf("--" + k); return i >= 0 ? args[i + 1] : d; };
const out = path.resolve(opt("out", path.join(root, "docs/WALKTHROUGH.pdf")));
const md = fs.readFileSync(path.join(root, "docs/WALKTHROUGH.md"), "utf8");
// "$2)" must not be read as TeX maths, hence -tex_math_dollars
let body = execFileSync("pandoc", ["-f", "gfm-tex_math_dollars", "-t", "html5"], { input: md, encoding: "utf8", maxBuffer: 1 << 26 });
const img = f => "data:image/png;base64," + fs.readFileSync(path.join(root, "docs/screenshots", f)).toString("base64");
// drop the document's own title block (the cover replaces it) and put a scene under each level heading
body = body.replace(/<h1[^>]*>re:parte[\s\S]*?<hr \/>/, "");
const shots = { 1: "level1-bedroom.png", 2: "level2-loft.png", 3: "level3-halcyon.png", 4: "level4-berlin.png", 5: "level5-mainstage.png" };
body = body.replace(/(<h1[^>]*>Level (\d)[^<]*<\/h1>)/g, (m, h, n) => shots[n] ? `${h}<figure class="scene"><img src="${img(shots[n])}" alt=""></figure>` : h);
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>re:parteé Walkthrough</title><style>
${fs.readFileSync(path.join(root, "src/fonts.css"), "utf8")}
* { box-sizing: border-box; }
html { font: 10.5pt/1.5 "Helvetica Neue", Helvetica, Arial, sans-serif; color: #1b1826; }
body { margin: 0; }
.cover { height: 297mm; padding: 0 0 22mm; background: #0d0a1c; color: #efeaf6; display: flex; flex-direction: column; page-break-after: always; }
.cover img { width: 100%; display: block; image-rendering: pixelated; }
.cover .txt { padding: 14mm 15mm 0; }
.cover .k { font: 8pt "Press Start 2P", monospace; letter-spacing: .12em; color: #62e6ff; margin: 0 0 6mm; }
.cover h1 { font: 22pt/1.35 "Press Start 2P", monospace; margin: 0 0 8mm; padding: 0; color: #fff; text-transform: uppercase; border: 0; page-break-before: auto; }
.cover h1 b { color: #ff3fa4; font-weight: 400; }
.cover p { margin: 0 0 4mm; max-width: 150mm; color: #cfc8e6; }
.cover .warn { color: #ffd23f; }
h1, h2 { font-family: "Press Start 2P", monospace; font-weight: 400; text-transform: uppercase; letter-spacing: .04em; }
h1 { font-size: 15pt; line-height: 1.4; margin: 0 0 5mm; padding-top: 3mm; border-top: 2px solid #ff3fa4; page-break-before: always; }
body > h2:first-child { margin-top: 0; }
h2 { font-size: 10pt; line-height: 1.5; color: #d81b7f; margin: 9mm 0 3mm; padding-top: 2.5mm; border-top: 1px solid #ff3fa4; page-break-after: avoid; }
h3 { font-size: 11pt; margin: 6mm 0 2mm; page-break-after: avoid; }
p, li { orphans: 3; widows: 3; } li { margin: 0 0 1.4mm; } ol, ul { padding-left: 6mm; margin: 0 0 3mm; }
blockquote { margin: 3mm 0; padding: 2mm 4mm; background: #f3ecfb; border-left: 3px solid #b48ae8; } blockquote p { margin: 0; }
table { border-collapse: collapse; width: 100%; margin: 3mm 0 5mm; font-size: 9.5pt; } th { text-align: left; font: 6.5pt "Press Start 2P", monospace; text-transform: uppercase; color: #6a5f8a; padding: 2mm; border-bottom: 1px solid #b9b2cc; }
td { padding: 2mm; border-bottom: 1px solid #e3deee; vertical-align: top; } hr { border: 0; border-top: 1px solid #d9d2e8; margin: 6mm 0; }
code { font: 9.5pt ui-monospace, Menlo, monospace; background: #f1edf7; padding: 0 1mm; }
figure.scene { margin: 0 0 5mm; } figure.scene img { width: 100%; display: block; image-rendering: pixelated; border: 1px solid #0d0a1c; }
a { color: #b0126a; text-decoration: none; }
</style></head><body>
<section class="cover"><img src="${img("title.png")}" alt=""><div class="txt"><p class="k">PLAYER'S GUIDE</p><h1>re<b>:</b>parte<b>é</b><br>The Walkthrough</h1>
<p>Every puzzle in all five levels, from a crackling bedroom mixer to the Harbor Lights main stage, with the alternate routes and the money tips.</p>
<p class="warn">Spoiler warning: this guide gives away every puzzle and most of the jokes. For a nudge only, read the tips in section 3.</p>
<p>A game by Carlos Franzetti. github.com/CarlosFranzetti/Repartee. Play it at repartee-umber.vercel.app.</p></div></section>
${body}</body></html>`;
// the cover is printed on its own (no margins, no footer) and joined to the body with pdfunite, because Chromium
// applies one set of margins to every page of a print job
const cut = html.indexOf("</section>") + "</section>".length, head = html.slice(0, html.indexOf("<body>") + 6);
const coverHtml = html.slice(0, cut) + "</body></html>", bodyHtml = head + html.slice(cut);
const htmlOut = opt("html"); if (htmlOut) fs.writeFileSync(path.resolve(htmlOut), html);
const base = out.replace(/\.pdf$/, ""), tmp = [base + ".cover.html", base + ".body.html", base + ".cover.pdf", base + ".body.pdf"];
fs.writeFileSync(tmp[0], coverHtml); fs.writeFileSync(tmp[1], bodyHtml);
const browser = await chromium.launch(); const page = await browser.newPage();
await page.goto("file://" + tmp[0]); await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: tmp[2], format: "A4", printBackground: true, margin: { top: "0", bottom: "0", left: "0", right: "0" }, pageRanges: "1" });
await page.goto("file://" + tmp[1]); await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: tmp[3], format: "A4", printBackground: true, displayHeaderFooter: true, headerTemplate: "<span></span>",
  footerTemplate: `<div style="width:100%;text-align:center;font:7pt monospace;color:#8a84a0">re:parteé walkthrough · page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`,
  margin: { top: "16mm", bottom: "18mm", left: "15mm", right: "15mm" } });
await browser.close();
execFileSync("pdfunite", [tmp[2], tmp[3], out]); tmp.forEach(f => fs.unlinkSync(f));
console.log("wrote " + path.relative(root, out) + " (" + Math.round(fs.statSync(out).size / 1024) + " KB)");
