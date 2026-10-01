# Tech stack

The pipeline: a web page draws one frame for a given time → a headless browser takes a screenshot → the frames are stitched into an MP4 (`scripts/render.mjs`). So whatever draws the picture has to run in a browser; Python is only for synthesizing music, or for tools like Manim that output video on their own.

## What you want to show → what to use

| Look | Use | Why | Tested example |
|---|---|---|---|
| Pixel art, old games | Canvas 2D | Draw on a tiny canvas, scale it up by an integer factor with smoothing off, and every pixel becomes a crisp square | `02-pixel` |
| Old TV, film, glow, chromatic aberration | WebGL2 fragment shader | Takes the finished frame as a texture and adds the effect per pixel without touching the content | `03-retro-arcade` |
| UI, cards, typography, infographics, timelines | HTML + CSS + SVG | Layout, fonts, rounded corners and shadows come for free | `06-ui-motion`, `07-history` |
| Vector illustration, icons, line drawing, shape morphing | SVG | Paths can be drawn stroke by stroke, and morphed | |
| Hand-drawn, watercolor, colored pencil, crayon | p5.js + p5.brush | Ready-made brushes and paper texture | `04-hand-drawn` |
| 3D scenes, objects, camera moves, spatial structure | Three.js | The most mature 3D library in the browser | `05-3d` |
| Particles, lots of small elements | Canvas 2D (up to a few thousand); beyond that, Three.js Points | | `01-one-line` |
| Data charts, counting numbers | D3.js or hand-written SVG | Scales, axes and shapes are ready-made | |
| Maps, routes | D3 (d3-geo) + GeoJSON / TopoJSON | Projections and paths are ready-made | |
| Math formulas | KaTeX to typeset, CSS / SVG for the transforms; for step-by-step derivations, Manim | KaTeX typesets fast in the page; Manim is built for derivations | |
| Falling, colliding, bouncing (2D physics) | Matter.js with a fixed time step | | |
| Music, sound effects | Python + numpy synthesis | No music files to hunt for; beats and visuals share one timeline | `01`, `06`, `07` |

One video can mix them: Three.js for the 3D with HTML labels on top; Canvas first, then a shader for texture.

## How to wire each one

**In general**: install the library in the project folder (`npm i three`) and reference it by relative path, `./node_modules/…`. The page exposes `window.render(t)` that draws second t and sets `window.__ready = true` when ready. Frames depend only on t: no requestAnimationFrame, CSS animations or transitions, setTimeout, Date.now or Math.random (use a seeded random).

- **Canvas 2D (pixel art)**: draw on a small canvas whose size divides the output by a whole number (192×108 ×10 for 1920×1080, 160×90 ×4 for 640×360), set `imageSmoothingEnabled = false` on the big canvas and `drawImage` the small one onto it scaled by an integer factor; round every coordinate
- **WebGL shaders**: `getContext('webgl2', { preserveDrawingBuffer: true })` (without `preserveDrawingBuffer` the screenshots come out black); every frame, upload the drawn canvas as a texture with `texImage2D` and draw one full-screen quad; pass time in as a uniform
- **HTML / CSS / SVG**: compute positions, sizes and opacity in `render(t)` and set them directly; load fonts from local files with `@font-face` and set `__ready` after `document.fonts.ready`
- **p5.js + p5.brush**: `<script src="node_modules/p5/lib/p5.min.js">` plus `<script src="node_modules/p5.brush/dist/p5.brush.js">`; `createCanvas(W, H, WEBGL)` (p5.brush needs WEBGL mode) and `noLoop()`, and call `redraw()` inside `render`; before each drawing call `randomSeed(a fixed number + the drawing's index)` so the line jitter comes out the same on every render; at 12 drawings a second, have `render(t)` return the drawing index as a key so the same drawing isn't captured twice
- **Three.js**: use `<script type="module">` and `import * as THREE from './node_modules/three/build/three.module.js'`; `new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })`; in `render(t)`, place the camera and objects for t, then `renderer.render(scene, camera)`; no `THREE.Clock`, no `setAnimationLoop`. To use anything from `three/examples/jsm/` (post-processing, controls, loaders), add an importmap that maps `"three"` to `./node_modules/three/build/three.module.js`
- **D3**: `<script src="node_modules/d3/dist/d3.min.js">`; use only its scales, shapes and geo projections, not `d3.transition` (it runs on timers and won't line up with the screenshots)
- **Maps**: world map data can come from `world-atlas` (`node_modules/world-atlas/countries-110m.json`), converted to GeoJSON with `topojson-client`. **Borders can be a legal matter**: maps published in China, for example, must pass an official map review and must use the reviewed standard map for China's borders; a wrong border is a serious problem. If the video shows borders, use an officially approved map for the country it will be published in instead of assembling border data yourself
- **KaTeX**: include `node_modules/katex/dist/katex.min.js` and `katex.min.css`, then `katex.render(formula, element)`; animate transforms and opacity in `render(t)` as usual
- **Manim**: `pip install manim` (typesetting formulas also needs LaTeX). It renders the MP4 itself and doesn't go through `render.mjs`; set resolution and frame rate on the command line (see `manim render --help`); add music by muxing it in with ffmpeg
- **Matter.js**: `node_modules/matter-js/build/matter.min.js`; use a fixed step (e.g. 1/60 s) and in `render(t)` simulate from the start up to t (or record every step on the first pass), so the same starting conditions always give the same result
- **Music**: see "Music" under "While building" in SKILL.md

## Not sure which to pick

First think about what relationship the viewer has to understand: an order in time → a timeline (HTML / SVG); positions and structure in space → 3D; comparing quantities → charts; a derivation → formula animation; atmosphere and feeling → illustration, hand-drawn. Write the reason into `<style>` ("3D for the spatial relations, because …"); the model follows it, and the user can change it.

## Other options (not tested with this skill; render a few seconds as a sample the first time)

**Runs in the page** (still goes through `render.mjs`; what matters is that it can jump to second t):

| Tech | Good at | How to wire it |
|---|---|---|
| GSAP | Complex choreography: many things entering in sequence, staggered, eased | Build the timeline and `pause()` it; call `tl.seek(t)` in `render(t)` |
| PixiJS | Lots of 2D sprites, particles, filters; faster than Canvas 2D | Stop its built-in ticker; in `render(t)` set up the frame and call `app.renderer.render(app.stage)` yourself; enable `preserveDrawingBuffer` on the canvas |
| Lottie (lottie-web) | Playing After Effects animations made by a designer | `anim.goToAndStop(frame, true)` |
| anime.js, Motion | Lightweight tweens | Use only the seekable APIs, or compute the progress yourself |
| Theatre.js | A visual keyframe editor for Three.js and DOM animation | `sheet.sequence.position = t` |
| Babylon.js, react-three-fiber | 3D alternatives to Three.js | Same idea: turn off the built-in loop, set up the scene for t, then render |
| WebGPU | Massive particle counts, fluid simulation | Needs a browser with WebGPU; if WebGL can do it, use WebGL |
| Tone.js | Writing music in the page: synths, drum machines, chords | Render offline to a WAV with `Tone.Offline`, instead of numpy synthesis |

**Frameworks with their own renderer** (they output video themselves, not through `render.mjs`):

| Tech | Good at | Note |
|---|---|---|
| HyperFrames | HTML + GSAP timelines that can layer real footage, music and captions | For multi-scene pieces that mix in real video it's easier than `render.mjs`; see its docs |
| Remotion | Videos written in React: components, music, captions | Check the license before company use (free for individuals and very small companies; bigger companies need a paid license) |
| Motion Canvas / Revideo | Step-by-step explainer animations written in TypeScript | Come with their own editor and renderer |
| Manim | Math derivations | See above |

**Outside the browser**:

| Tech | Good at | What to install |
|---|---|---|
| Blender (Python scripts) | 3D with real materials, light and physics; far more realistic than Three.js, and far slower | **Install the Blender application first** (free, a few hundred MB); after that it runs headless from the command line, the UI never has to open. There is also `bpy` on pip, but it's picky about the Python version and large |
| Matplotlib / Plotly animation | Animated data charts, video straight from Python | pip; MP4 output needs ffmpeg |
| MoviePy, FFmpeg filters | Joining, cutting, overlaying text, transitions: for putting finished clips together, not for drawing | pip / your package manager |

**Three.js or Blender for 3D**: Three.js is real-time rendering (the game-engine approach): a few milliseconds per frame, leaning stylized; low-poly, camera moves and mixing with web layout are all easy, so it's the default. Blender's Cycles is a path tracer: soft shadows, bounced light, glass refraction, reflections on water and depth of field are actually computed, and it has cloth, fluid and smoke simulation; the result is close to CG films and product renders, at a cost of seconds to minutes per frame (its Eevee engine is much faster and sits in between). Pick Blender only when the user wants photoreal: product shots, glass and water, realistic scenes. Usage: `blender -b -P scene.py`, where `-b` runs it in the background without the UI; the script builds the models, assigns materials, lights the scene, places the camera, sets keyframes and renders. Save a `.blend` as well, so the user can open the UI to look at the scene or adjust it by hand.

**Installing new things**: small libraries that go into the project folder via npm or pip, just install. Big software such as Blender or LaTeX, or anything that changes the system environment: first tell the user what it is, how big, and why, and install only after they agree.

Start from the main table at the top, tested options first; come down here only for needs the main table doesn't cover, and if you pick something from here, say in `<style>` what and why.
