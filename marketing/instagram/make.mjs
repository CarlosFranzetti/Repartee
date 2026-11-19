// Renders the Instagram kit from the game's own art and fonts:
//   marketing/instagram/story-1.png .. story-3.png   1080x1920 story slides
//   marketing/instagram/post.png                     1080x1350 feed post
//   src/site/og.png                                  1200x630 link-preview image (served as /og.png)
// usage: node marketing/instagram/make.mjs     (needs docs/screenshots/ and src/site/title-art.png)
import fs from "fs"; import path from "path"; import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require("/opt/node-tools/node_modules/playwright");
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const here = path.join(root, "marketing/instagram");
const f = p => "file://" + path.join(root, p);
const SITE = "repartee-umber.vercel.app", GH = "github.com/CarlosFranzetti/Repartee";
const fonts = fs.readFileSync(path.join(root, "src/fonts.css"), "utf8");
const logo = `<div class="logo">re<b>:</b>parte<b>é</b></div>`;
const css = `${fonts}
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 100%; height: 100%; }
body { font-family: "VT323", monospace; color: #efeaff; background: #05030a; overflow: hidden; }
.bg { position: absolute; inset: 0; background: url("${f("src/site/title-art.png")}") no-repeat; image-rendering: pixelated; }
.shade { position: absolute; inset: 0; }
.safe { position: absolute; left: 60px; right: 60px; display: flex; flex-direction: column; align-items: center; text-align: center; }
.logo { font-family: "Press Start 2P", monospace; color: #fff; letter-spacing: -.02em; line-height: 1; text-shadow: 0 8px 0 #2a0d3a, 0 0 48px rgba(255, 63, 164, .45); white-space: nowrap; }
.logo b { color: #ff3fa4; font-weight: 400; }
.tag { letter-spacing: .14em; color: #e9e2ff; text-shadow: 0 3px 0 #000; }
.by { color: #ffc44d; letter-spacing: .06em; }
.amber { color: #ffc44d; text-shadow: 0 3px 0 #000; }
.shot { border: 4px solid #2d2456; outline: 4px solid #05030a; box-shadow: 0 0 0 8px rgba(255, 63, 164, .18), 0 18px 40px rgba(0, 0, 0, .6); display: block; background: #05030a; }
.cap { font-family: "Press Start 2P", monospace; text-transform: uppercase; color: #62e6ff; text-shadow: 0 3px 0 #000; }
.pill { font-family: "Press Start 2P", monospace; display: inline-block; padding: 26px 30px; border: 4px solid #ff3fa4; background: #ff3fa4; color: #12061a; white-space: nowrap; }
.chip { display: inline-block; background: rgba(8, 5, 20, .9); border: 4px solid #2d2456; padding: 16px 34px 18px; }
.pill.ghost { background: rgba(5, 3, 10, .82); color: #62e6ff; border-color: #62e6ff; }
.k { font-family: "Press Start 2P", monospace; color: #ffc44d; text-shadow: 0 3px 0 #000; text-transform: uppercase; }
.panel { background: rgba(8, 5, 20, .86); border: 4px solid #2d2456; }
.stat { flex: 1; padding: 22px 6px 18px; } .stat b { display: block; font: 400 64px/1 "Press Start 2P", monospace; color: #ff3fa4; text-shadow: 0 5px 0 #2a0d3a; } .stat span { display: block; margin-top: 12px; font-size: 38px; letter-spacing: .08em; color: #e9e2ff; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px 20px; width: 100%; }
.cell { position: relative; } .cell img { width: 100%; height: 258px; object-fit: cover; object-position: top center; } .cell span { position: absolute; left: 12px; bottom: 12px; font: 400 22px/1 "Press Start 2P", monospace; background: #05030a; color: #62e6ff; padding: 8px 10px; border: 2px solid #2d2456; }
ul { list-style: none; text-align: left; width: 100%; background: rgba(8, 5, 20, .86); border: 4px solid #2d2456; padding: 22px 26px 14px; } li { font-size: 46px; line-height: 1.12; padding-left: 46px; position: relative; text-shadow: 0 3px 0 #000; margin-bottom: 8px; } li::before { content: "▸"; position: absolute; left: 0; color: #ff3fa4; }
`;
const page = (w, h, bgx, shade, inner, bgSize) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}
.bg { background-size: ${bgSize || "auto " + h + "px"}; background-position: ${bgx}px 0; }
.shade { background: ${shade}; }</style></head><body><div class="bg"></div><div class="shade"></div>${inner}</body></html>`;
// heavy at the top so the moon never fights the headline, light at the bottom so the water and the kid show
const dark = "linear-gradient(to bottom, rgba(5,3,10,.93) 0%, rgba(5,3,10,.86) 24%, rgba(5,3,10,.55) 42%, rgba(5,3,10,.5) 72%, rgba(5,3,10,.2) 100%)";
// stories: keep everything between y=230 and y=1610 (Instagram covers the top and bottom strips with its own UI)
const story = inner => page(1080, 1920, -2010, dark, `<div class="safe" style="top:230px;height:1380px;justify-content:space-between">${inner}</div>`);
const img = (p, w, h) => `<img class="shot" src="${f("docs/screenshots/" + p)}" width="${w}" height="${h}">`;

const jobs = [
  ["story-1.png", 1080, 1920, story(`
    <div><div class="logo" style="font-size:104px">re<b>:</b>parte<b>é</b></div>
      <div class="tag" style="font-size:44px;margin-top:30px">A PIXELART DJ ADVENTURE GAME</div><div class="by" style="font-size:44px;margin-top:4px">by Carlos Franzetti</div></div>
    <div><div class="cap" style="font-size:26px;margin-bottom:16px">From broke-ass bedroom DJ...</div>${img("level1-bedroom.png", 720, 405)}</div>
    <div><div class="cap" style="font-size:26px;margin-bottom:16px">...to festival headliner.</div>${img("level5-mainstage.png", 720, 405)}</div>
    <div class="amber" style="font-size:50px">One questionable decision at a time.</div>
    <div class="pill" style="font-size:30px">${SITE}</div>`)],
  ["story-2.png", 1080, 1920, story(`
    <div><div class="logo" style="font-size:64px">re<b>:</b>parte<b>é</b></div><div class="k" style="font-size:30px;margin-top:34px">Point and click, like it's 1990</div></div>
    <div class="panel" style="display:flex;width:100%"><div class="stat"><b>5</b><span>LEVELS</span></div><div class="stat"><b>8</b><span>MINI-GAMES</span></div><div class="stat"><b>105</b><span>REAL RECORDS</span></div></div>
    <div class="grid">${[["minigame-beatmatch.png", "beat.Match"], ["minigame-godigging.png", "go.Digging"], ["minigame-crowdread.png", "crowd.Read"], ["minigame-soundcheck.png", "sound.Check"]].map(([p, n]) => `<div class="cell"><img class="shot" src="${f("docs/screenshots/" + p)}"><span>${n}</span></div>`).join("")}</div>
    <ul><li>Fix the mixer. Dig the crates. Read the room.</li><li>Every sound is synthesized live.</li><li>Plays in your browser, phone or desktop.</li><li>Free. Nothing to install.</li></ul>
    <div class="pill" style="font-size:30px">${SITE}</div>`)],
  ["story-3.png", 1080, 1920, story(`
    <div><div class="logo" style="font-size:64px">re<b>:</b>parte<b>é</b></div><div class="k" style="font-size:54px;margin-top:44px;color:#fff">Play it now</div><div class="tag" style="font-size:44px;margin-top:18px">FREE IN YOUR BROWSER</div></div>
    <div class="pill" style="font-size:34px;padding:34px 30px">${SITE}</div>
    ${img("level1-nowhere.png", 880, 494)}
    <div><div class="k" style="font-size:28px;margin-bottom:22px">The code is on GitHub</div><div class="pill ghost" style="font-size:24px">${GH}</div></div>
    <div class="chip"><div class="amber" style="font-size:50px">Link in bio</div><div class="by" style="font-size:40px;margin-top:2px">A game by Carlos Franzetti</div></div>`)],
  ["post.png", 1080, 1350, page(1080, 1350, -1150, dark, `<div class="safe" style="top:70px;height:1210px;justify-content:space-between">
    <div><div class="logo" style="font-size:104px">re<b>:</b>parte<b>é</b></div>
      <div class="tag" style="font-size:44px;margin-top:28px">A PIXELART DJ ADVENTURE GAME</div><div class="by" style="font-size:44px;margin-top:4px">by Carlos Franzetti</div></div>
    ${img("level5-mainstage.png", 960, 539)}
    <div><div class="amber" style="font-size:50px;line-height:1.15">From broke-ass bedroom DJ to festival headliner.<br>One questionable decision at a time.</div></div>
    <div><div class="pill" style="font-size:32px">${SITE}</div><div class="tag" style="font-size:36px;margin-top:20px">${GH}</div></div></div>`)],
  ["../../src/site/og.png", 1200, 630, page(1200, 630, 0, "linear-gradient(to right, rgba(5,3,10,.82) 0%, rgba(5,3,10,.6) 55%, rgba(5,3,10,.15) 100%)", `<div class="safe" style="top:70px;height:490px;left:70px;right:auto;width:800px;align-items:flex-start;text-align:left;justify-content:space-between">
    <div class="logo" style="font-size:84px">re<b>:</b>parte<b>é</b></div>
    <div><div class="tag" style="font-size:38px">A PIXELART DJ ADVENTURE GAME</div><div class="by" style="font-size:38px">by Carlos Franzetti</div></div>
    <div class="amber" style="font-size:40px;line-height:1.15">From broke-ass bedroom DJ to festival headliner.<br>One questionable decision at a time.</div>
    <div class="pill" style="font-size:22px;padding:18px 20px">${SITE}</div></div>`, "1200px auto")]
];
const only = process.argv.slice(2);
const browser = await chromium.launch();
for (const [name, w, h, html] of jobs) {
  if (only.length && !only.some(o => name.includes(o))) continue;
  const p = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const tmp = path.join(here, ".tmp.html"); fs.writeFileSync(tmp, html);
  await p.goto("file://" + tmp); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
  const over = await p.evaluate(() => { const s = document.querySelector(".safe"); return { overflowY: s.scrollHeight - s.clientHeight, wide: [...s.querySelectorAll("*")].filter(e => e.getBoundingClientRect().right > innerWidth - 20 || e.getBoundingClientRect().left < 20).map(e => e.className || e.tagName).slice(0, 4) }; });
  const out = path.resolve(here, name); await p.screenshot({ path: out });
  console.log(name.padEnd(24), w + "x" + h, over.overflowY > 0 || over.wide.length ? "CHECK " + JSON.stringify(over) : "fits");
  await p.close(); fs.unlinkSync(tmp);
}
await browser.close();
