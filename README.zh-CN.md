<h1 align="center">code-video</h1>

<p align="center">
  <em>用代码做短视频：agent 先问清你要什么，按你的需求写提示词，一帧帧画出来，交给你一个 MP4。</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-111111?style=flat-square" alt="MIT">
  <img src="https://img.shields.io/badge/works%20with-any%20SKILL.md%20agent-111111?style=flat-square" alt="Agents">
  <img src="https://img.shields.io/badge/render-Playwright%20%2B%20FFmpeg-111111?style=flat-square" alt="Render">
  <img src="https://img.shields.io/badge/looks-7%20tested%20references-111111?style=flat-square" alt="Seven looks">
</p>

<p align="center">
  <sub><a href="README.md">English</a></sub>
</p>

---

<p align="center">
  <img src="docs/hero.gif" alt="code-video 做出的七段动画：像素风夜市小厨师、老电视屏幕里的复古街机街景、手绘雨天小镇、低多边形 3D 灯塔、音乐播放器界面宣传片、印刷排版风的简史、动态文字开场，以及七块提示词依次填满" width="900"><br>
  <sub>七段参考提示词做出来的 —— 上排：像素 · 复古街机 · 手绘绘本 · 低多边形 3D；下排：界面动效 · 简史解说 · 一句话随它发挥 · 七块提示词</sub>
</p>

一个 agent skill：不开剪辑软件，用代码做短视频、动画。Claude 不会直接生成视频，它写代码。这里的代码是一个网页，用 Canvas、WebGL、SVG、p5.js 或 Three.js 画出视频的第 *t* 秒；`render.mjs` 用无头浏览器一帧帧截图，交给 FFmpeg 拼成视频。所以换画风就是换一种画法：像素风是先画小画布、再放大并关掉平滑，老电视是在上面叠一层着色器，手绘是用笔刷库一秒重画 12 张。

这个 skill 的重点在写代码之前。agent **先问**，一轮问完，最多五样：用在哪、给谁看，画什么，什么画风，尺寸和时长，有没有不想要的。然后**按这次的需求写提示词**，分成七块，给你过目，你说行才开始做。做完按提示词里自己写的检查清单抽帧自查，把第一版冒出来的不想要的套路补进「不要」清单，再把整个文件夹交给你。

## 提示词：七块

| 块 | 写什么 | 为什么 |
|---|---|---|
| `role` | 一个具体的身份，和这个身份最在意什么 | 动效设计师往节奏和过渡上使劲，科普作者往准确上使劲；按片子类型挑 |
| `context` | 用在哪、谁在看，所以要什么 | 讲清为什么，它会推到你没写的地方 |
| `task` | 画什么、按什么顺序、看完要记住什么 | 用你自己的话 |
| `specs` | 尺寸、帧率、时长、要不要循环、带不带声音 | 写「每秒 30 帧」，别写「30 帧」：那会被当成一共 30 帧 |
| `style` | 用什么画、这种画风的关键做法，每条带一句为什么 | 像素风：小画布、整数倍放大、关掉平滑、不超过 16 种颜色 |
| `avoid` | 点名要避开的具体东西 | 只说「别像 AI 做的」，它只会从一种默认风格换成另一种 |
| `check` | 抽帧时逐条看什么 | 写具体：3D 看破洞，像素数颜色，简史核日期 |

七个标签名是这个 skill 自己起的。Anthropic 的[提示词指南](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)建议用名字前后一致的 XML 标签把要求、背景、例子分开，讲清为什么，点名不想要的东西；它没有规定一套固定的标签。

<details>
<summary>例子：像素风的提示词（除了 role，都是实测原文；【】里换成你的）</summary>

```
<role>
你是一名像素美术师，熟悉老游戏的画法和节奏，最在意每个像素干净、人物在做什么一眼看得清。所有画面都自己写代码画出来。
</role>

<context>
这段是【用在哪】，观众在手机上看，要一眼看出是老游戏那种像素风，人物在做什么要看得清。
</context>

<task>
【在哪里，谁在做什么，背景里还有什么在动】
</task>

<specs>
- 【横屏 1920×1080 / 竖屏 1080×1920】，每秒 30 帧，【8】秒
- 整段动作不重复，结尾能接回开头循环播放
- 全部用代码画，不用任何图片素材，最后渲染成 MP4
</specs>

<style>
用 Canvas 画。先画在很小的画布上（横屏 192×108，竖屏 108×192），再整数倍放大、关掉平滑，所有坐标取整，这样每个像素都是清楚的方格。颜色不超过 16 种。人物一秒只换 10 次左右姿势，火、烟、水这类每帧都动，这种一卡一动的节奏才像老游戏。
</style>

<avoid>
渐变、模糊、发光、半透明；画面里写字；已有的游戏角色和 Logo。
</avoid>

<check>
做完抽 5 帧拼成一张图，逐条看：人物的手脚和道具有没有断开或错位、缩到手机大小主角还认不认得出、颜色有没有超过 16 种、首尾接不接得上。有问题改完再交给我。
</check>
```

</details>

## 七种参考画风

说不清要什么画风时，agent 从这七种里推荐两三种，再参考范例写一份这次专用的提示词。画风可以混：复古街机就是像素画上面叠一层老电视着色器。

| 画风 | 用什么画 | 关键做法 |
|---|---|---|
| 像素 | Canvas 2D | 192×108 的小画布放大 10 倍、关掉平滑，不超过 16 种颜色，人物一秒换 10 次左右姿势 |
| 复古街机 | Canvas 2D + WebGL 着色器 | 先画像素画，再给整个画面套一层老电视：弧形屏幕、扫描线、荧光点阵、泛光、暗角 |
| 手绘绘本 | p5.js + p5.brush | 纸纹底、铅笔勾线、水彩上色；一秒只换 12 张，每张线条轻轻抖一下 |
| 低多边形 3D | Three.js | 用方块、圆柱、球搭场景，柔和的光和影子，镜头慢慢绕着转 |
| 界面动效 / 产品宣传片 | HTML + CSS + SVG | 每个变化都用弹簧动画，由光标去点、去拖，卡在代码合成配乐的半拍上 |
| 简史解说 | HTML + CSS + SVG | 印刷排版风、衬线大号年份，翻页卡拍；每个日期都联网核实，核不到的不写 |
| 一句话随它发挥 | 它自己挑 | 「你是一个很厉害的动效设计师」，再加上主题、配色、场景数，每次跑出来才稳定 |

`references/examples/` 里的七段就是做出上面那些动画的提示词（只有 `role` 那一行是事后按片子类型改写的）；你用什么语言，agent 就用什么语言给你写。用 Claude Code 里的 Claude Opus 5.5 跑，从提示词到 MP4：像素循环动画约 37 分钟，界面宣传片 24–30 分钟，手绘绘本约一小时。

知识科普、片头这类宽泛的类型，提示词不写死技术栈：agent 按每个知识点挑画法（时间顺序用时间轴、结构用 3D、公式一步步变形、数字用图表），全片统一一套配色和字体。`references/tech-stack.md` 列了什么画面用什么库、每种怎么接进逐帧渲染，也列了没实测过的选择，比如 GSAP、PixiJS、Lottie、Manim、Remotion、Blender。

## 快速开始

在 Claude Code 里：

```
/code-video 做一段 8 秒的像素风循环动画：夜市小厨师颠锅
/code-video 给我的习惯打卡 App 做一条 10 秒的竖屏宣传片
/code-video 做一条 30 秒的晶体管简史
```

在其他 coding agent 里：

```
读一下这个仓库里 code-video 的 SKILL.md，做一段黄昏灯塔的低多边形 3D 动画
```

agent 会问它还需要知道的，给你看提示词，做完、自查完，交给你一个文件夹：

```
your-video/
  video.mp4                 成片
  prompt.md                 它照着做的提示词；改一块再让它重渲
  check/contact-sheet.png   它自查时抽的帧
  index.html, video.json    画画面的代码，和尺寸 / 帧率 / 时长
```

## 需要什么

- 能在你电脑上跑命令的 coding agent（Claude Code、Codex、Cursor……）
- Node.js 18+，FFmpeg 在 PATH 里
- Python 3 和 Pillow（自查脚本用）；要代码合成配乐的话再装 numpy
- Playwright：agent 会装进每个项目文件夹（`npm i playwright`，第一次再 `npx playwright install chromium`）
- 脚本用 bash：macOS、Linux 直接用；Windows 用 WSL 或 Git Bash

在 macOS（Apple Silicon）上开发和测试，WebGL 通过 Metal 走 GPU。Linux 应该也能用：没有可用的 GPU 时 Chromium 退回 SwiftShader，WebGL 多的片子会渲得慢一些。

## 安装

贴给任意 coding agent：

```
Install the code-video skill from https://github.com/Win-Hao/code-video
```

或者用 [skills CLI](https://github.com/vercel-labs/skills)：

```bash
npx skills add Win-Hao/code-video -g
```

Claude Code 插件（跟着仓库走，发版自动更新）：

```
/plugin marketplace add Win-Hao/code-video
/plugin install code-video@code-video
```

手动（复制文件，固定在当前版本）：

```bash
git clone https://github.com/Win-Hao/code-video.git
cp -R code-video/skills/* ~/.claude/skills/   # Claude Code
cp -R code-video/skills/* ~/.codex/skills/    # Codex
```

## 更新

按你的安装方式：

```bash
claude plugin update code-video@code-video   # 插件（或者：/plugin marketplace update code-video）
npx skills add Win-Hao/code-video -g        # skills CLI：重新 add 一遍就是更新
```

手动复制的：pull（或重新 clone）仓库，再跑一遍 `cp -R`。

## 不用 agent，直接渲染

任何定义了 `window.render(t)` 的网页都行：

```html
<!-- index.html -->
<style>html, body { margin: 0; overflow: hidden }</style>
<canvas id="c" width="1920" height="1080"></canvas>
<script>
  const ctx = document.getElementById('c').getContext('2d');
  window.render = t => {
    ctx.fillStyle = '#F3EEE4'; ctx.fillRect(0, 0, 1920, 1080);
    ctx.fillStyle = '#D4542B'; ctx.fillRect(160 + t * 400, 480, 120, 120);
  };
  window.__ready = true;
</script>
```

```bash
echo '{"name":"video","private":true}' > package.json
echo '{"width":1920,"height":1080,"fps":30,"duration":4}' > video.json
npm i playwright && npx playwright install chromium
S=path/to/skills/code-video/scripts
node $S/render.mjs index.html --stills 0,2 --outdir check   # 先出几张静帧看
node $S/render.mjs index.html video.mp4                     # 要声音加 --audio music.wav
bash $S/contact.sh video.mp4 check/contact-sheet.png        # 第 0 帧 + 均匀 5 帧 + 最后一帧
```

`render.mjs` 把当前文件夹当网站，等 `window.__ready`，每一帧调一次 `render(t)`，截图交给 FFmpeg（H.264，BT.709）。`render(t)` 返回的 key 和上一帧一样时不重新截图，一秒 12 张的手绘因此快很多。

## 踩过的坑

- **先问，再按这次的需求写提示词。** 只说一句「随你发挥」，每次跑出来的画风都不一样；把主题、配色、场景数写进去，就稳了。
- **讲清为什么。** `context` 里写了「要让人一眼看懂它能干什么」，宣传片的每一段它自己就标上了功能名。
- **俗套要点名。** 「别像 AI 做的」只会让它从一种默认风格换成另一种（Anthropic 给 Opus 5.5 的前端设计建议也是这么说的）。点名才管用，这就是 `avoid` 的用处：不要紫色霓虹、不要渐变按钮、不要所有东西一起淡入。
- **画面只由时间决定。** 不用计时器、不用 requestAnimationFrame，随机数用固定种子：同一个 `t` 永远画出同一张，重渲一模一样，哪一帧都能单独拿出来查。
- **重点查转场。** 测试里真正的毛病（空白帧、出画、零件飞出去）多半出在转场那一瞬间，均匀抽帧会漏掉。所以 skill 会把每次转场的头两帧单独出成静帧。
- **用真的弹簧公式。** 自己凑的「弹簧」常常前 20% 的时间就到位了，看着像瞬移；skill 里给了阻尼弹簧，光标走位另用缓动曲线，因为弹簧会过冲，光标就偏出要点的按钮。
- **像素风的坐标要取整。** 坐标有一个小数，Canvas 就会抗锯齿，16 色的画面一下子变成几百种颜色。检查脚本数的是渲染出来的 PNG，不数压缩过的 MP4。

## 仓库结构

skill 本体在 `skills/code-video/`：

| 路径 | 是什么 |
|---|---|
| `SKILL.md` | 流程：先问 → 写提示词 → 做 → 自查 → 交付 |
| `references/tech-stack.md` | 什么画面用什么库、每种怎么接进逐帧渲染、没实测过的选择、什么时候要先问再装 |
| `references/examples/` | 七段实测过的提示词，附测试时踩过的坑 |
| `scripts/render.mjs` | 网页 → 逐帧 → MP4（Playwright + FFmpeg），或者只出静帧 |
| `scripts/contact.sh` | 从视频或一个文件夹的静帧拼检查图 |
| `scripts/check.py` | 数一张静帧用了几种颜色；比较循环动画的首尾两帧 |

## 许可

[MIT](LICENSE)
