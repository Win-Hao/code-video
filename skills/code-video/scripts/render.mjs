#!/usr/bin/env node
// Renders a page that draws by time into an MP4, one frame at a time. Run it from inside the project folder: it serves the current folder.
// The page defines window.render(t) (may be async) that draws second t, and sets window.__ready = true when it's ready.
// render(t) may return a key: when it equals the previous frame's key, the frame isn't captured again (for hand-drawn at 12 drawings a second).
//
// Size, frame rate and length come from video.json in the current folder ({"width":1080,"height":1920,"fps":30,"duration":10}).
// The video and the stills share it, so stills can't come out landscape while the video is portrait; command-line flags override it.
// Usage:
//   node <skill>/scripts/render.mjs index.html video.mp4 [--audio music.wav]
//   node <skill>/scripts/render.mjs index.html --stills 0,0.5,2.5,4.5 --outdir check     look at a few frames first
// Needs: playwright installed in the current folder (npm i playwright; npx playwright install chromium if the browser is missing), and ffmpeg.
// Playwright is resolved from the project folder's node_modules, so the script itself never needs to be copied into the project.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const ROOT = process.cwd();
let chromium;
try { ({ chromium } = createRequire(path.join(ROOT, 'package.json'))('playwright')); }
catch { console.error('playwright not found in this folder: run `npm i playwright` here (and `npx playwright install chromium` if the browser is missing)'); process.exit(1); }
const cfg = fs.existsSync(path.join(ROOT, 'video.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'video.json'), 'utf8')) : {};
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const pos = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
const [page, out] = pos;
const FPS = +opt('fps', cfg.fps ?? 30), DUR = +opt('duration', cfg.duration ?? 8);
const W = +opt('width', cfg.width ?? 1920), H = +opt('height', cfg.height ?? 1080);
const stills = opt('stills', null), outdir = opt('outdir', 'check'), audio = opt('audio', null);
if (!page || (!out && !stills)) { console.error('usage: see the comment at the top of this file'); process.exit(1); }
if (out && (W % 2 || H % 2)) { console.error(`H.264 needs an even width and height, got ${W}x${H}: change video.json (stills don't have this limit)`); process.exit(1); }

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.otf': 'font/otf', '.woff': 'font/woff', '.wasm': 'application/wasm', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.txt': 'text/plain; charset=utf-8' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); res.end(d); });
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
// GPU WebGL through Metal on macOS; elsewhere let Chromium fall back to SwiftShader when there's no usable GPU
const gpu = process.platform === 'darwin' ? ['--use-angle=metal'] : ['--enable-unsafe-swiftshader'];
const browser = await chromium.launch({ args: [...gpu, '--enable-gpu', '--ignore-gpu-blocklist', '--force-color-profile=srgb', '--hide-scrollbars'] });
const tab = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
tab.on('pageerror', e => console.error('[page error]', e.message));
tab.on('response', r => { if (r.status() >= 400) console.error('[failed to load]', r.url()); });
await tab.goto(`http://127.0.0.1:${server.address().port}/${page}`);
await tab.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });
const at = t => tab.evaluate(async t => (await window.render(t)) ?? null, t);

if (stills) {
  fs.mkdirSync(outdir, { recursive: true });
  for (const s of stills.split(',').map(Number)) { await at(s); await tab.screenshot({ path: path.join(outdir, `t${s.toFixed(3)}.png`) }); }
  console.log('stills written to', outdir);
} else {
  const vf = ['-vf', 'scale=out_color_matrix=bt709:out_range=tv', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709'];
  const inAudio = audio ? ['-i', audio] : [];
  const mapAudio = audio ? ['-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '256k', '-shortest'] : [];
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-', ...inAudio,
    ...vf, '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', ...mapAudio, '-r', String(FPS), '-movflags', '+faststart', out],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  ff.on('error', e => { console.error('could not start ffmpeg (is it installed and on the PATH?):', e.message); process.exit(1); });
  ff.stdin.on('error', () => {}); // if ffmpeg stops early, its exit code below says why
  const write = b => new Promise(r => (ff.stdin.write(b) ? r() : ff.stdin.once('drain', r)));
  const N = Math.round(DUR * FPS); let lastKey = null, buf = null;
  for (let i = 0; i < N; i++) {
    const key = await at(i / FPS);
    if (key === null || key !== lastKey || !buf) buf = await tab.screenshot({ type: 'png' });
    lastKey = key; await write(buf);
    if (i % 30 === 0) process.stdout.write(`\r${i}/${N} frames`);
  }
  ff.stdin.end();
  const code = await new Promise(r => ff.on('close', r));
  if (code !== 0) { console.error(`\nffmpeg exited with code ${code}; ${out} was not written`); await browser.close(); server.close(); process.exit(1); }
  console.log(`\nwrote ${out} (${N} frames)`);
}
await browser.close(); server.close();
