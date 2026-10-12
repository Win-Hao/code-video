# Practice: what testing taught

References, not rules.

## Roles by video type (examples)

| Video | A role could be |
|---|---|
| Product promo, UI motion | senior motion designer who cares most about rhythm and whether each feature reads clearly |
| Explainer, history | science writer (a historian for history), cares most about accuracy and making hard things clear |
| Pixel art, game feel | pixel artist who knows how old games were drawn and paced |
| Retro TV, arcade | pixel artist plus a technical artist who knows CRT effects |
| Picture book, hand-drawn, cozy | picture-book illustrator with a gentle, handmade touch |
| 3D scene, camera moves | 3D environment artist who builds good-looking scenes and shots from simple geometry |
| Data, charts, formulas | data-visualization designer who cares most about accurate numbers read at a glance |
| Openers, showpieces, mood pieces | motion director who gives a theme impact through motion |

## Explainers: pick the technique per point

Mix them in one video (3D for a structure, flat type for labels); keep it unified through palette and fonts.

| What it explains | How to draw it |
|---|---|
| Order in time, a history | HTML / SVG layout, timelines, page turns |
| Geography, routes, distribution | SVG maps, dots and lines appearing with the explanation |
| Spatial structure, planets, molecules, mechanisms | Three.js 3D: orbit, cut open, take apart |
| Math, formulas, functions | formulas transforming step by step, graphs drawn along (the Manim approach) |
| Data, comparisons | animated charts, counting numbers, growing bars |
| Abstract ideas, analogies | hand-drawn or flat illustration, explained through a metaphor |

## Observed while writing prompts

- Write `<context>` as "because…, so…": in testing, "people should see at a glance what it can do" led the model to label each section with its feature name by itself
- Don't write "don't make it look AI-made": said vaguely, it only swaps one default look for another; name the specific thing
- Write `<check>` for this kind of video's typical defects: color count in pixel art, holes and clipping in 3D, dates and sources in explainers, whether the cursor matches what it clicks in promos

## Setting up the project folder

Write `package.json` by hand (`{"name":"video","private":true}`; `npm init` fails on non-ASCII folder names), `npm i playwright` (if the browser is missing, `npx playwright install chromium`); `video.json` holds size, fps and length, e.g. `{"width":1920,"height":1080,"fps":30,"duration":8}`. The check scripts need Python 3 with Pillow. Libraries like p5.brush or Manim go into the project folder only; ask before installing big software such as Blender or LaTeX. For hand-drawn at 12 drawings a second, have `render(t)` return the drawing index as a key so the same drawing isn't captured twice.

## Springs and easing

Don't improvise formulas (improvised "springs" often settle within 20% of the time and look like teleporting):

```js
// spring: u = seconds since the move started; goes 0 → 1, overshoots a little and comes back
function spring(u, zeta = 0.55, omega = 12) {
  if (u <= 0) return 0;
  const wd = omega * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * omega * u) * (Math.cos(wd * u) + (zeta * omega / wd) * Math.sin(wd * u));
}
// easing: use this, not the spring, for cursor moves (a spring overshoots and the cursor misses its target)
const ease = x => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
```

## Music

Synthesize `music-raw.wav` with numpy. "On the beat" defaults to the half beat (0.25 s per step at 120 BPM). Normalize with `ffmpeg -i music-raw.wav -af loudnorm=I=-16:TP=-1.5 -ar 48000 music.wav` (without `-ar` it comes out at 192 kHz) and render with `--audio music.wav`. You can't hear it, so plot the waveform and look for clipping.

## Which frames to check

- The video: `bash <this skill>/scripts/contact.sh video.mp4 check/contact-sheet.png`
- Transitions: write the first two frames of every transition to `check/transitions/` with `render.mjs --stills`, join them with contact.sh, and look for blank frames, things leaving the frame, parts flying off. In testing most real defects showed up at transitions, and even sampling misses them
- Colors in pixel art: `python3 <this skill>/scripts/check.py colors check/t1.000.png`; count a PNG, not the MP4 (compression always adds colors)
- Whether a loop closes: render the last frame (duration − 1/fps), the first frame and two ordinary neighboring frames, then `python3 <this skill>/scripts/check.py loop last.png first.png a.png b.png`

## Text

Don't assume a font is installed: list what's there (`fc-list :lang=zh family` for Chinese fonts) or put an open-licensed font file in the project folder and load it with `@font-face`. Keep text at least 5% from the edges; in portrait video leave another 15% at the bottom for the platform's captions and buttons.
