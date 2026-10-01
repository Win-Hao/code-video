---
name: code-video
description: "Make short videos and animations with code. First asks what the user wants (where it is used, who watches, what to show, which look, size and length, what to avoid), then writes a block prompt for this request (role / context / task / specs / style / avoid / check — every block written for this user, not a fixed template), shows it to the user, writes the code, renders every frame to MP4, checks sampled frames, fixes and delivers. When the user can't name a look, recommends from seven tested reference styles (pixel art, retro arcade with a CRT screen, hand-drawn picture book, low-poly 3D, UI motion / product promo, history explainer, one-line free rein) and writes a fresh prompt modeled on them. Use when the user says 'make a video / animation with code', 'a pixel-art / hand-drawn / 3D animation', 'a promo animation for my app or product', 'a brief history / explainer animation of X', or 'a motion-graphics intro'. Chinese triggers: 用代码做视频、用代码做动画、像素风动画、手绘动画、3D 动画、产品宣传片、界面动效、简史动画、科普动画、片头动效."
---

# Code Video

**In one line**: ask first, then write the prompt, then build. Every block of the prompt is written for this request; the seven prompts in `references/examples/` are references, not fill-in templates.

## Language

Talk to the user in the language of their first message and keep it for the whole session. Write the prompt blocks in that language too; the tag names stay in English. The seven examples are the Chinese originals that were actually run: learn their structure and level of detail, don't translate them word for word.

## Why a block prompt

This follows Anthropic's prompting guidance ([Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices), [Prompting Claude Opus 5.5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5)): separate instructions, context and examples with XML tags so the model doesn't mix them up; explain why, and the model carries the reason to cases you didn't spell out; name what you don't want.

The seven tag names are this skill's own. The guide only says to use XML tags whose names are consistent and descriptive (its examples are `<instructions>`, `<context>`, `<input>`); there is no official fixed set.

## 1. Ask (one round)

- Don't ask what the user already said; use whatever the context already tells you
- If there is a question tool (e.g. AskUserQuestion), use it: 2–4 options per question, recommended option first. Otherwise list the questions in one message, each with a default; if the user replies "defaults", go with the defaults
- Ask at most these five:

| Ask | Decides | Example options |
|---|---|---|
| Where it's used, who watches | `<role>`, `<context>`, size | product promo / explainer / intro / B-roll for a talking-head video / a standalone post on a short-video platform |
| What to show, what viewers should remember | `<task>` | the main character, what happens, in what order; for knowledge pieces, which points to cover |
| Look | `<style>` | If the user can name it, use theirs. If not, recommend 2–3 of the seven examples below with one reason each, or "you decide". For broad types (explainers, intros), make the first option "pick per content (recommended)" |
| Specs | `<specs>` | landscape 1920×1080 / portrait 1080×1920; length; music or not |
| Anything to avoid | `<avoid>` | a color, an element, a cliché they've seen; skip if none |

- Whatever the user doesn't specify takes the default: landscape 1920×1080 (1080×1920 if they asked for portrait), 30 fps, 8–15 s, code-synthesized music for intros and promos and none otherwise. "Up to you" means all defaults. Either way, say in the prompt what was defaulted

## 2. Write the prompt for this request

Write all seven blocks for this request:

| Block | What goes in | How to decide |
|---|---|---|
| `<role>` | A concrete identity + what that identity cares about most, ending with "Draw every frame yourself in code." | Pick by video type, see the table below. The role decides where the effort goes: a motion designer cares about rhythm and transitions, an explainer writer about being clear and correct |
| `<context>` | Where it's used, who watches, and therefore what's needed | Write it as "because …, so …". Given the reason, the model fills in what you didn't write (in testing, "viewers should get what the app does at a glance" made it label every segment with the feature name on its own) |
| `<task>` | What to show, in what order, what viewers should remember | The user's own words first; for knowledge pieces, what each point says, where to verify it, and that anything unverifiable stays out |
| `<specs>` | Size, frame rate, length, whether the motion must never repeat or must loop, everything done in code, output with or without sound | From step 1; defaults for anything not said |
| `<style>` | What to draw with (technique) + the key tricks of this look + the user's own preferences, each with a one-line reason | Take the key tricks from the matching example's `<style>`, e.g. pixel art: "draw on a tiny canvas, scale up by an integer factor, turn smoothing off"; hand-drawn: "change the drawing only 12 times a second". **For broad types (explainers, intros), don't hard-code a tech stack**: say what has to come across and which palette and fonts stay consistent, and let the model pick the technique per point (see "Explainers: pick the technique per point"). If the user named a technique, use it |
| `<avoid>` | Specific things to stay away from, by name | What the user said + the usual defaults for this kind of video (the examples list them). Don't write "don't make it look AI-made": said vaguely, the model just swaps one default look for another |
| `<check>` | What to look at, item by item, in sampled frames after building | The defects this kind of video most often has: count colors in pixel art; holes and clipping in 3D; dates and sources in knowledge pieces; whether the cursor lines up with what it clicks in promos. Name the specific things: Anthropic notes that the newest models already check their own work, and a vague "double-check everything" can make them over-check and burn time |

Pick `<role>` by video type (examples; make it specific to the request):

| Video | `<role>` could say |
|---|---|
| Product promo, UI motion | A senior motion designer who has made many app promos and cares most about rhythm and whether each feature comes across |
| Explainer, history | An explainer writer (for history, a historian) who cares most about factual accuracy and making complex things clear |
| Pixel art, game feel | A pixel artist who knows how old games were drawn and timed |
| Retro TV, arcade | A pixel artist who is also a technical artist and knows CRT effects |
| Picture book, hand-drawn, cozy | A picture-book illustrator who is good at gentle, handmade-looking images |
| 3D scenes, camera moves | A 3D environment artist who builds good-looking scenes and camera moves out of simple shapes |
| Data, charts, formulas | A data-visualization designer who cares most about correct numbers and instant readability |
| Intros, showpieces, mood pieces | A motion director who uses motion to give a theme impact |

### Explainers: pick the technique per point

One video can mix techniques, e.g. 3D to show a structure with flat labels for the text:

| What to explain | How to draw it |
|---|---|
| Chronology, how something developed | HTML / SVG layout: a timeline, page turns (the 07 history example) |
| Geography, routes, distribution | An SVG map; dots and lines appear with the narration |
| Spatial structure, planets, molecules, mechanisms | Three.js 3D; the camera orbits, cuts open, takes apart |
| Math, formulas, functions | Formulas transform step by step while the graph draws itself (the Manim approach) |
| Data, comparisons | Animated charts: numbers count up, bars grow |
| Abstract ideas, analogies | Hand-drawn or flat illustration that explains by analogy |

Then `<style>` becomes: "For each point, pick the technique that explains it best: 3D for spatial relations, a timeline for chronology …; keep [palette] and [fonts] across the whole video." The choice of technique goes to the model; consistency comes from palette and fonts. Which library to use for each technique and how to wire it in: `references/tech-stack.md`.

When the prompt is written, put the whole thing in one code block for the user, with one line per block on why it says what it says; build once the user says OK. If the user said "just make it", skip this. Then create the project folder (see "Set up the project folder" below) and save the final prompt in it as `prompt.md`.

## 3. When the user can't say what look they want: the examples

`references/examples/` holds seven prompts that were run and worked:

| Look | Example | Good for |
|---|---|---|
| One line, free rein | `01-one-line.md` | intros, showpieces, mood pieces |
| Pixel art | `02-pixel.md` | looping animations of small scenes and characters |
| Retro arcade | `03-retro-arcade.md` | openers, nostalgia, game feel (pixel art + an old TV screen) |
| Hand-drawn picture book | `04-hand-drawn.md` | gentle little stories, cozy pieces (the slowest: about an hour) |
| 3D | `05-3d.md` | scene showcases, camera moves |
| UI motion | `06-ui-motion.md` | promos for an app, a website, a small tool |
| History explainer | `07-history.md` | history, how something developed; knowledge pieces |

- Recommend 2–3 based on the use and the content, one reason each, and let the user pick
- Once one is picked, read that example (or two) to see how each block is written and how detailed it gets, then rewrite for this request: subject, numbers and colors all come from this request — don't copy
- Looks can be combined: retro arcade is "pixel art + an old-TV shader on top"
- The `<role>` lines in the examples were rewritten per video type after testing (during testing all seven used the same line, "a director of short animated videos"); the other blocks are the tested originals. Text in 【】 is the default used at the time; the notes under each prompt are what went wrong in testing

## 4. Build from the prompt

1. **Build**: write the code in the project folder (how: see "While building" below)
2. **Self-check**: go through `<check>` on a few stills first and fix; after the full render, go through it again on the contact sheet (frame 0, 5 evenly spaced frames and the last frame; see "Which frames to check") and fix until it's right
3. **Extend the avoid list**: look at which unwanted habits showed up in the first version (a palette, a transition, a font, colors that collide with a real brand), add them by name to `<avoid>` in `prompt.md`, then fix. Anything visible in stills gets fixed before the full render, so you don't render twice
4. **Deliver**: the project folder always keeps `video.mp4`, `check/contact-sheet.png` and `prompt.md`, plus `index.html`, `video.json` and `package.json` (change one thing, `npm i`, re-render); delete `node_modules` and intermediate frames. Report how long it took and what the self-check fixed

## While building (for the agent doing the work)

- **Set up the project folder**: write a `package.json` by hand (`{"name":"video","private":true}`; don't use `npm init`, it fails on folder names with non-ASCII characters), `npm i playwright` (if the browser is missing, `npx playwright install chromium`); then write a `video.json` with size, frame rate and length, e.g. `{"width":1920,"height":1080,"fps":30,"duration":8}` (width and height must be even for H.264). The check scripts need Python 3 with Pillow (`python3 -m pip install pillow` if `import PIL` fails)
- **What to draw with**: see `references/tech-stack.md` (which library for which look, how it plugs into this pipeline, where it tends to get stuck). Put the reason for the choice in `<style>`
- **Frames depend only on time**: the page exposes `window.render(t)` that draws second t; random numbers use a fixed seed; no requestAnimationFrame, CSS animations or Date.now. Once fonts are loaded and everything is ready, set `window.__ready = true`. The page must fill the viewport exactly (`html, body { margin: 0; overflow: hidden }`, the canvas or stage at the video size), or the screenshots get a white border or scrollbars
- **Render**: in the project folder run `node <this skill>/scripts/render.mjs index.html video.mp4`; the script doesn't need to be copied. Size, frame rate and length come from `video.json`, and stills (`--stills 0,0.5,2.5 --outdir check`) use the same size. For hand-drawn at 12 drawings a second, have `render(t)` return the drawing index as a key, so the same drawing isn't captured again
- **Springs and easing**: don't improvise formulas, use these two (improvised "springs" often settle within 20% of the time and look like teleporting):
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
- **Libraries like p5.brush or Manim** go into the project folder only; ask the user before installing big software such as Blender or LaTeX (see the end of `references/tech-stack.md`)
- **Music**: synthesize `music-raw.wav` with numpy. "On the beat" defaults to the half beat (0.25 s per step at 120 BPM); dense passages can go twice as fine. Then normalize loudness with `ffmpeg -i music-raw.wav -af loudnorm=I=-16:TP=-1.5 -ar 48000 music.wav` (without `-ar` it comes out at 192 kHz), and render with `--audio music.wav`. You can't hear it, so plot the waveform and look for clipping
- **Which frames to check**:
  - The video: `bash <this skill>/scripts/contact.sh video.mp4 check/contact-sheet.png` gives frame 0 + 5 evenly spaced frames + the last frame
  - Transitions: write the first two frames of every transition to `check/transitions/` with `render.mjs --stills`, join them with `bash <this skill>/scripts/contact.sh check/transitions/ check/transitions.png`, and look for blank frames, things leaving the frame, parts flying off. In testing, most real defects showed up at the moment of a transition, and even sampling misses them
  - Colors in pixel art: `python3 <this skill>/scripts/check.py colors check/t1.000.png`; count a rendered PNG, not the MP4 (compression always adds colors)
  - Whether a loop closes: render the last frame, the first frame and two ordinary neighboring frames as stills (the last frame is at duration − 1/fps; for 8 s at 30 fps: `--stills 7.967,0,0.033,0.067 --outdir check/loop`), then `python3 <this skill>/scripts/check.py loop check/loop/t7.967.png check/loop/t0.000.png check/loop/t0.033.png check/loop/t0.067.png`. It compares the seam (last → first) with an ordinary frame step and says whether the loop closes
- **Text**: don't assume a font is installed. List what's there (`fc-list :lang=zh family` for Chinese fonts, where fontconfig is available), or put an open-licensed font file (e.g. Noto Sans / Noto Serif) in the project folder and load it with `@font-face`. Keep text at least 5% away from the edges; in portrait video leave another 15% at the bottom for the platform's captions and buttons
- **Knowledge pieces**: verify every date and event at an official source, and list the sources in `sources.md` next to `prompt.md`

## When publishing

The video is AI-made imagery: turn on the platform's AI-generated content label when you publish it.
