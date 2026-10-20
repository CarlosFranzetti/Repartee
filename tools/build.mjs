// Builds the game from src/:
//  1. index.html               — dev page that loads every source file with <script src> (works from file://)
//  2. dist/index.html          — the full game as one self-contained file (fonts, CSS, JS inlined)
//  3. dist/artifact.html       — the same, content only, for the claude.ai artifact host
//  4. dist/level1.html … dist/level5.html — each level on its own (plus the mini-game arcade), built with the
//     acts up to that level and started at it; finishing it links to the next level's page (Level 5 ends the game)
//  5. dist/level1.artifact.html — Level 1 for the claude.ai artifact host
// File order: core (fixed) → data → minigames → acts (act1..act5, files sorted by name) → game.js
// Every page gets window.RP_SITE (level pages and the full game, with links between them): relative links
// (level2.html, index.html) for dist/, which work from file:// and on Vercel; absolute ones for artifacts.
// usage: node tools/build.mjs [--out file.html] [--level N] [--artifact]
//   Every JS file is syntax-checked; a file that fails is left out of the build (with a loud warning)
//   so one half-written file never breaks everybody else's game. Each file is also wrapped in
//   try/catch in the bundle so a load-time exception only disables that file.
//   --out writes ONLY the single-file bundle to the given path (use this when several people build at once);
//   add --level N to make that bundle the Level N page, --artifact to also write <out>.artifact.html.
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const rel = p => path.relative(root, p).split(path.sep).join("/");
const walk = d => fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]) : [];
const sortJs = files => files.filter(f => f.endsWith(".js")).sort((a, b) => a.localeCompare(b));
const args = process.argv.slice(2);
const outIdx = args.indexOf("--out");
const outFile = outIdx >= 0 ? path.resolve(args[outIdx + 1]) : null;

// where artifact builds send players: the full game artifact, and the level pages on the Vercel site
const FULL_GAME_URL = "https://claude.ai/artifact/8tvKcJw3WLVhBsno8Snk6N";
const SITE_URL = "https://repartee-umber.vercel.app";
const LEVELS = ["Bedroom DJ", "Underground Hustler", "Club DJ", "Touring DJ", "Superstar DJ"];
const site = (level, artifact) => ({
  level: level || null, names: LEVELS, newTab: !!artifact,
  full: artifact ? FULL_GAME_URL : "index.html",
  pages: LEVELS.map((_, i) => artifact ? SITE_URL + "/level" + (i + 1) : "level" + (i + 1) + ".html")
});
const DESC = "A pixel-art point-and-click DJ adventure. From broke-ass bedroom DJ to festival headliner, one bad decision at a time.";

const core = ["util", "chars", "fx", "audio", "icons", "paint", "engine"].map(n => path.join(root, "src/core", n + ".js")).filter(f => fs.existsSync(f));
const data = sortJs(walk(path.join(root, "src/data")));
const mgs = sortJs(walk(path.join(root, "src/minigames")));
const actsUpTo = max => { const a = []; for (let i = 1; i <= max; i++) a.push(...sortJs(walk(path.join(root, "src/acts/act" + i)))); return a; };
const game = [path.join(root, "src/game.js")].filter(f => fs.existsSync(f));

const broken = new Set();
for (const f of [...core, ...data, ...mgs, ...actsUpTo(9), ...game]) {
  try { execFileSync(process.execPath, ["--check", f], { stdio: "pipe" }); }
  catch (e) { broken.add(f); console.error("SYNTAX ERROR (file skipped) in " + rel(f) + "\n" + String(e.stderr || e).split("\n").slice(0, 6).join("\n")); }
}
if (broken.size) process.exitCode = 1;

const fonts = fs.readFileSync(path.join(root, "src/fonts.css"), "utf8");
const css = fs.readFileSync(path.join(root, "src/style.css"), "utf8");

function bundle({ level }) {
  // a level page carries the earlier acts too: later acts reuse their items, voices and places (the wallet, the phone...)
  const acts = actsUpTo(level || 9);
  const files = [...core, ...data, ...mgs, ...acts, ...game].filter(f => !broken.has(f));
  const title = level ? "re:parteé Level " + level + ": " + LEVELS[level - 1] : "re:parteé";
  const head = artifact => `window.RP_SITE = ${JSON.stringify(site(level, artifact))};\n`;
  const body = files.map(f => `/* ---- ${rel(f)} ---- */\ntry {\n` + fs.readFileSync(f, "utf8").replace(/<\/script/gi, "<\\/script") + `\n} catch (e) { console.error("load error in ${rel(f)}", e); (window.__loadErrors = window.__loadErrors || []).push("${rel(f)}: " + e); }`).join("\n");
  const single = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${DESC}">
<style>\n${fonts}\n${css}\n</style>
</head>
<body>
<script>
${head(false) + body}
</script>
</body>
</html>
`;
  // artifact variant: the claude.ai artifact host supplies <!doctype>/<head>/<body>, so ship content only
  const art = `<title>${title}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="${DESC}">
<style>\n${fonts}\n${css}\n</style>
<script>
${head(true) + body}
</script>
`;
  return { files, single, art };
}
function write(target, text) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const tmp = target + ".tmp" + process.pid;
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, target);
}
const kb = s => (s.length / 1024).toFixed(0) + " KB";
const note = broken.size ? " — " + broken.size + " BROKEN FILE(S) SKIPPED" : "";

if (outFile) {
  const li = args.indexOf("--level"), b = bundle({ level: li >= 0 ? +args[li + 1] : 0 });
  write(outFile, b.single);
  if (args.includes("--artifact")) write(outFile.replace(/\.html$/, "") + ".artifact.html", b.art);
  console.log(`built ${rel(outFile)} (${b.files.length} scripts, ${kb(b.single)})${note}`);
} else {
  const full = bundle({ level: 0 });
  const dev = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>re:parteé</title>
<meta name="description" content="${DESC}">
<link rel="stylesheet" href="src/fonts.css">
<link rel="stylesheet" href="src/style.css">
</head>
<body>
<script>window.RP_SITE = ${JSON.stringify(site(0, false))};</script>
${full.files.map(f => `<script src="${rel(f)}"></script>`).join("\n")}
</body>
</html>
`;
  fs.writeFileSync(path.join(root, "index.html"), dev);
  write(path.join(root, "dist/index.html"), full.single);
  write(path.join(root, "dist/artifact.html"), full.art);
  const sizes = LEVELS.map((_, i) => {
    const b = bundle({ level: i + 1 });
    write(path.join(root, "dist/level" + (i + 1) + ".html"), b.single);
    if (i === 0) write(path.join(root, "dist/level1.artifact.html"), b.art);
    return kb(b.single);
  });
  console.log(`built index.html + dist/index.html (${full.files.length} scripts, ${kb(full.single)}) + dist/level1..5.html (${sizes.join(", ")})${note}`);
}
