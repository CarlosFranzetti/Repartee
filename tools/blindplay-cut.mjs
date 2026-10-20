// Cuts a blindplay recording down to the moments the game was running (plus each caption's reading
// time), so the player's thinking time disappears from the video. Encodes H.264 MP4, with the game's
// sound (AAC) when the run captured it (audio.raw): the sound is laid onto the same cut timeline.
// usage: node tools/blindplay-cut.mjs <run dir> <out.mp4> [--intro 3] [--crf 24] [--audio-offset s] [--no-norm]
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
const [dir, out] = process.argv.slice(2);
const opt = (k, d) => { const i = process.argv.indexOf("--" + k); return i >= 0 ? process.argv[i + 1] : d; };
const { t0, segments } = JSON.parse(fs.readFileSync(path.join(dir, "segments.json"), "utf8"));
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

// sound: place each captured chunk at its wall-clock time on the recording's timeline, keep chunks that
// follow each other seamless (small timer jitter is ignored), and copy what falls inside a kept stretch
const audRaw = path.join(dir, "audio.raw");
let wav = null;
if (fs.existsSync(audRaw) && fs.statSync(audRaw).size > 16) {
  const buf = fs.readFileSync(audRaw), recs = [];
  for (let off = 0; off + 16 <= buf.length;) { const n = buf.readUInt32LE(off + 12); recs.push([buf.readDoubleLE(off), buf.readUInt32LE(off + 8), n, off + 16]); off += 16 + n * 4; }
  const sr = recs[0][1], shift = +opt("audio-offset", 0);
  const segOut = []; let acc = 0;
  for (const [a, b] of merged) { segOut.push([a, b, acc]); acc += b - a; }
  const total = Math.ceil(acc * sr), pcm = new Int16Array(total * 2);
  let ptr = null;
  for (const [t, , n, p] of recs) {
    const len = n / sr;
    let start = (t - t0) / 1000 - len + shift;
    if (ptr != null && Math.abs(start - ptr) < 0.25) start = ptr;
    ptr = start + len;
    for (const [a, b, o] of segOut) {
      if (b <= start || a >= start + len) continue;
      const from = Math.max(a, start), src = Math.round((from - start) * sr), dst = Math.round((o + from - a) * sr);
      const cnt = Math.min(Math.round((Math.min(b, start + len) - from) * sr), n - src, total - dst);
      for (let i = 0; i < cnt; i++) for (let ch = 0; ch < 2; ch++) {
        const k = (dst + i) * 2 + ch;
        pcm[k] = Math.max(-32768, Math.min(32767, pcm[k] + buf.readInt16LE(p + ((src + i) * 2 + ch) * 2)));
      }
    }
  }
  const head = Buffer.alloc(44);
  head.write("RIFF", 0); head.writeUInt32LE(36 + pcm.byteLength, 4); head.write("WAVEfmt ", 8); head.writeUInt32LE(16, 16);
  head.writeUInt16LE(1, 20); head.writeUInt16LE(2, 22); head.writeUInt32LE(sr, 24); head.writeUInt32LE(sr * 4, 28); head.writeUInt16LE(4, 32); head.writeUInt16LE(16, 34);
  head.write("data", 36); head.writeUInt32LE(pcm.byteLength, 40);
  wav = path.join(dir, "cut.wav");
  fs.writeFileSync(wav, Buffer.concat([head, Buffer.from(pcm.buffer)]));
  console.log(`sound: ${recs.length} chunks at ${sr} Hz -> ${(acc / 60).toFixed(1)} min`);
}
const inputs = ["-i", video].concat(wav ? ["-i", wav] : []);
// the game mixes quietly (room ambience sits around -40 dB), so the soundtrack is loudness-normalized for listening
const av = wav ? ["-map", "0:v", "-map", "1:a", "-af", process.argv.includes("--no-norm") ? "anull" : "loudnorm=I=-19:TP=-2.5:LRA=14", "-ar", "44100", "-c:a", "aac", "-b:a", "160k", "-shortest"] : ["-an"];
execFileSync("ffmpeg", ["-y", "-v", "error", ...inputs, "-filter_script:v", script, ...av, "-r", "25", "-c:v", "libx264", "-preset", "medium", "-crf", String(opt("crf", 24)), "-movflags", "+faststart", out], { stdio: "inherit" });
console.log("wrote " + out + " (" + (fs.statSync(out).size / 1048576).toFixed(1) + " MB)");
