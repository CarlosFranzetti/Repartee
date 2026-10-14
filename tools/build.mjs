// Builds two things from src/:
//  1. index.html      — dev page that loads every source file with <script src> (works from file://)
//  2. dist/index.html — single self-contained file (fonts, CSS, JS inlined) for sharing/publishing
// File order: core (fixed) → data → minigames → acts (act1..act5, files sorted by name) → game.js
// usage: node tools/build.mjs [--out file.html]
//   Every JS file is syntax-checked; a file that fails is left out of the build (with a loud warning)
//   so one half-written file never breaks everybody else's game. Each file is also wrapped in
//   try/catch in the bundle so a load-time exception only disables that file.
//   --out writes ONLY the single-file bundle to the given path (use this when several people build at once).
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const rel = p => path.relative(root, p).split(path.sep).join("/");
const walk = d => fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]) : [];
const sortJs = files => files.filter(f => f.endsWith(".js")).sort((a, b) => a.localeCompare(b));

const core = ["util", "chars", "fx", "audio", "icons", "paint", "engine"].map(n => path.join(root, "src/core", n + ".js")).filter(f => fs.existsSync(f));
const data = sortJs(walk(path.join(root, "src/data")));
const mgs = sortJs(walk(path.join(root, "src/minigames")));
const acts = [];
for (let i = 1; i <= 9; i++) acts.push(...sortJs(walk(path.join(root, "src/acts/act" + i))));
const game = [path.join(root, "src/game.js")].filter(f => fs.existsSync(f));
let files = [...core, ...data, ...mgs, ...acts, ...game];
const outIdx = process.argv.indexOf("--out");
const outFile = outIdx > 0 ? path.resolve(process.argv[outIdx + 1]) : null;

const broken = [];
for (const f of files) {
  try { execFileSync(process.execPath, ["--check", f], { stdio: "pipe" }); }
  catch (e) { broken.push(f); console.error("SYNTAX ERROR (file skipped) in " + rel(f) + "\n" + String(e.stderr || e).split("\n").slice(0, 6).join("\n")); }
}
files = files.filter(f => !broken.includes(f));
if (broken.length) process.exitCode = 1;

const head = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>re:parteé</title>
<meta name="description" content="A pixel-art point-and-click DJ adventure. From broke-ass bedroom DJ to festival headliner, one bad decision at a time.">
`;
const fonts = fs.readFileSync(path.join(root, "src/fonts.css"), "utf8");
const css = fs.readFileSync(path.join(root, "src/style.css"), "utf8");

// dev page
const dev = head + `<link rel="stylesheet" href="src/fonts.css">
<link rel="stylesheet" href="src/style.css">
</head>
<body>
${files.map(f => `<script src="${rel(f)}"></script>`).join("\n")}
</body>
</html>
`;
if (!outFile) fs.writeFileSync(path.join(root, "index.html"), dev);

// single file
const js = files.map(f => `/* ---- ${rel(f)} ---- */\ntry {\n` + fs.readFileSync(f, "utf8").replace(/<\/script/gi, "<\\/script") + `\n} catch (e) { console.error("load error in ${rel(f)}", e); (window.__loadErrors = window.__loadErrors || []).push("${rel(f)}: " + e); }`).join("\n");
const single = head + `<style>\n${fonts}\n${css}\n</style>
</head>
<body>
<script>
${js}
</script>
</body>
</html>
`;
const target = outFile || path.join(root, "dist/index.html");
fs.mkdirSync(path.dirname(target), { recursive: true });
const tmp = target + ".tmp" + process.pid;
fs.writeFileSync(tmp, single);
fs.renameSync(tmp, target);
console.log(`built ${outFile ? rel(target) : "index.html + dist/index.html"} (${files.length} scripts, ${(single.length / 1024).toFixed(0)} KB)${broken.length ? " — " + broken.length + " BROKEN FILE(S) SKIPPED" : ""}`);
