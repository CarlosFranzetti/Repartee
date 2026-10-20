// Cuts a blindplay recording down to the moments the game was running (plus each caption's reading
// time), so the player's thinking time disappears from the video. Encodes H.264 MP4.
// usage: node tools/blindplay-cut.mjs <run dir> <out.mp4> [--intro 3] [--crf 24]
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
const [dir, out] = process.argv.slice(2);
const opt = (k, d) => { const i = process.argv.indexOf("--" + k); return i >= 0 ? process.argv[i + 1] : d; };
const { segments } = JSON.parse(fs.readFileSync(path.join(dir, "segments.json"), "utf8"));
const video = fs.readdirSync(dir).filter(f => f.endsWith(".webm")).map(f => path.join(dir, f))[0];
if (!video || !segments.length) throw new Error("no video or no segments in " + dir);
const dur = +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video]).toString().trim();
const intro = +opt("intro", 3);
// keep a short look at the title screen, every segment, and a beat after the last one
const keep = [[Math.max(0, segments[0][0] - intro), segments[0][0]]];
for (const [a, b] of segments) keep.push([a, Math.min(dur, b + 0.15)]);
keep[keep.length - 1][1] = Math.min(dur, keep[keep.length - 1][1] + 2);
const merged = [];
for (const [a, b] of keep.sort((p, q) => p[0] - q[0])) {
  const last = merged[merged.length - 1];
  if (last && a - last[1] < 0.25) last[1] = Math.max(last[1], b); else merged.push([a, b]);
}
const expr = merged.map(([a, b]) => `between(t,${a.toFixed(3)},${b.toFixed(3)})`).join("+");
const script = path.join(dir, "cut.filter");
fs.writeFileSync(script, `select='${expr}',setpts=N/(25*TB),format=yuv420p`);
const kept = merged.reduce((s, [a, b]) => s + b - a, 0);
console.log(`${segments.length} commands, ${merged.length} cuts, ${(dur / 60).toFixed(1)} min recorded -> ${(kept / 60).toFixed(1)} min`);
execFileSync("ffmpeg", ["-y", "-v", "error", "-i", video, "-filter_script:v", script, "-an", "-r", "25", "-c:v", "libx264", "-preset", "medium", "-crf", String(opt("crf", 24)), "-movflags", "+faststart", out], { stdio: "inherit" });
console.log("wrote " + out + " (" + (fs.statSync(out).size / 1048576).toFixed(1) + " MB)");
