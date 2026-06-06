# 战争动画藏书馆

Data-driven interactive web animations for historical campaigns. The project combines structured campaign data, a reusable React/Vite map renderer, cinematic audio, source notes, and Playwright gates so each battle can be replayed as a compact, inspectable five-minute film.

面向历史战役的数据驱动交互式网页动画库。本项目结合结构化战役数据、可复用 React/Vite 地图渲染器、电影化音频、来源说明和 Playwright 门禁，让每场战斗都能作为紧凑、可检查的五分钟动画被回放。

## Live Demo

GitHub Pages demo: <https://fuxiaoyan1.github.io/war-animation-library/>

The demo opens on the library shelf. Each card launches an interactive animation with play/pause/replay, draggable timeline, event jumps, narration subtitles, map pan/zoom, retained operational tracks, and faction-specific unit markers.

演示页默认打开战争动画书架。每张卡片进入一部交互式动画，支持播放/暂停/回放、拖拽时间轴、事件跳转、旁白字幕、地图平移缩放、保留作战轨迹和阵营专属单位标记。

## Latest Update

The latest major update refines `韩信十面埋伏：垓下之战` and `淮海战役：碾庄圩围歼战` with real-terrain tactical maps, tighter camera framing, stronger route continuity, and visible contested combat at key breakthrough moments.

最近一次主要更新重点打磨 `韩信十面埋伏：垓下之战` 和 `淮海战役：碾庄圩围歼战`：加入真实地形战术地图，收紧镜头构图，强化路线连续性，并在关键突破时刻补出可见战斗接触。

Highlights:

更新要点：

- Gaixia now uses a real GIS/MapLibre terrain map with local imagery and elevation tiles, historical fieldworks, formations, route anchors, and multi-point melee contact effects.
  垓下现在使用真实 GIS/MapLibre 地形地图，包含本地影像和高程瓦片、历史工事、阵形、路线锚点和多点近战接触特效。
- Gaixia dawn assault no longer shows Han forces entering an empty camp: Chu inner rearguard, south-gate remnants, and east-gate covering cavalry are visible and tested.
  垓下黎明突击不再表现为汉军进入空营：楚军内营后卫、南门残阵和东门掩护骑兵都可见并有测试覆盖。
- Gaixia close camera stages keep the active battle surface centered during the tenth-hour songs, farewell, and dawn assault moments.
  垓下近景镜头在十小时楚歌、别姬和黎明合击阶段保持当前战斗面居中。
- Nianzhuang now uses a real-terrain tactical map with staged camera focus for Xin'anzhen withdrawal, Xuzhou relief, Daxujia blocking, Nianzhuang compression, final pocket, and Nizhuang endgame.
  碾庄现在使用真实地形战术地图，并为新安镇撤退、徐州东援、大许家阻援、碾庄压缩、最后内核和倪庄终局分别设置阶段镜头。
- Nianzhuang defense has layered village lines, corps-level Nationalist labels, PLA column assault axes, relief blocking, trench approaches, final compression, and remnant clean-up contact.
  碾庄防御包含分层村落防线、国军军级标签、华野纵队攻坚轴、阻援线、对壕近迫、最后压缩和残部清剿接触。
- Regression gates now verify source-route continuity, unit visibility windows, effect-to-route binding, tactical camera focus, map interaction, terrain rendering, and key late-stage combat density.
  回归门禁现在验证来源路线连续性、单位可见时间窗、特效与路线绑定、战术镜头焦点、地图交互、地形渲染和后期关键战斗密度。
- A repository-level [DISCLAIMER.md](DISCLAIMER.md) now documents the educational/non-commercial intent, source limits, third-party media terms, source website entry points, and the maintainers' peace-and-anti-war position.
  仓库级 [DISCLAIMER.md](DISCLAIMER.md) 现在记录教育/非商业意图、来源限制、第三方媒体条款、来源网站入口，以及维护者热爱和平、反对战争的立场。
- A repository-local GitHub submit skill records the future submission workflow so update notes, source notes, disclaimers, validation, commits, and pushes are handled consistently.
  仓库内 GitHub 提交助手 skill 记录后续提交流程，确保更新说明、来源说明、免责声明、验证、提交和推送保持一致。

Full update note: [docs/updates/war-animation-update-2026-06-06.md](docs/updates/war-animation-update-2026-06-06.md)

Previous major update note: [docs/updates/war-animation-update-2026-05-27.md](docs/updates/war-animation-update-2026-05-27.md)

## Current Library

The repository currently includes 23 animations.

当前仓库包含 23 部动画。

Ancient and pre-Napoleonic campaigns:

古代和拿破仑时代以前的战役：

- 亚历山大大帝征服史
- 罗马与迦太基：三次布匿战争史
- 大秦统一中国战史
- 韩信十面埋伏：垓下之战
- 凯撒大帝战争史
- 十字军东征
- 蒙古帝国征服史

Modern campaigns and tactical battles:

近现代战役和战术会战：

- 拿破仑争战史
- 特拉法尔加大海战
- 日俄对马海战
- 日德兰海战
- 1940 德法战役
- 伦敦上空的鹰
- 1941-1945 苏德战争全景
- 日美太平洋战争战史
- 中途岛海空战
- 俾斯麦海海空战
- HX 229 / SC 122：大西洋狼群战
- 第二次瓜岛海战
- 大周行动：欧洲昼间制空权争夺
- 淮海战役：碾庄圩围歼战
- 抗美援朝战争
- 1991年第一次海湾战争

## Recent Additions

The latest series work focused on naval and air-war animation quality:

最近的系列工作重点提升海战和空战动画质量：

- Added and refined tactical naval battles: Tsushima, Trafalgar, the Second Naval Battle of Guadalcanal, and Jutland.
- Added WWII air and sea-air studies: Battle of Britain Day as `伦敦上空的鹰`, Big Week, and the Battle of the Bismarck Sea.
- Added a WWII Atlantic submarine-war study: `HX 229 / SC 122：大西洋狼群战`, covering convoy movement, wolfpack convergence, torpedo attacks, escort ASW, VLR patrol aircraft, and U-384's loss.
- Improved aircraft lifecycle modeling: sorties now show departure, contact, attack, pursuit, return, or landing instead of disappearing or loitering at target points.
- Added dogfight effects for dense air combat, without using naval-style salvo lines for air battles.
- Tightened route quality gates: air routes keep trails after aircraft leave, but visible aircraft must still be moving along a valid route.
- Expanded realistic unit markers for warships, aircraft, carriers, tanks, infantry, cavalry, chariots, and artillery.

## Design Principles

设计原则：

- Campaign facts live in `src/data`, rendering logic lives in shared components and `src/lib`.
  战役事实放在 `src/data`，渲染逻辑放在共享组件和 `src/lib`。
- Routes are geographic and source-backed where possible; uncertain compression choices are documented in `docs/sources`.
  路线尽可能基于地理坐标和来源记录；不确定的压缩选择记录在 `docs/sources` 中。
- Long wars use compressed active spans; short tactical battles use hour-level timelines.
  长战争使用压缩后的有效作战段；短战术会战使用小时级时间轴。
- Air units use short sortie windows; land and sea units can persist when historically appropriate.
  空中单位使用短任务窗口；陆上和海上单位在历史语义合适时可以持续保留。
- Routes and tracks should remain visible as operational memory, while unit icons reflect the current live force.
  路线和轨迹作为作战记忆保留，单位图标反映当前仍在场的力量。
- Audio is event-typed: aircraft, air combat, bombing, cannon, melee, or silence depending on the event.
  音频按事件类型配置：飞机、空战、轰炸、火炮、近战或静音。
- Every animation must remain controllable and testable, not just visually impressive.
  每部动画都必须可控制、可测试，而不只是视觉上好看。

## Repository Layout

仓库结构：

- `src/data`: campaign events, routes, map points, effects, and cue metadata.
  战役事件、路线、地图点、特效和提示元数据。
- `src/components`: React animation views and shared renderers.
  React 动画视图和共享渲染器。
- `src/lib`: timeline math, projection helpers, map interaction, unit badge logic, and audio helpers.
  时间轴计算、投影辅助、地图交互、单位徽标逻辑和音频辅助。
- `public`: runtime media assets used by the demos.
  演示运行时使用的媒体素材。
- `SOURCE_INDEX.md`: website-level source index for historical references, maps, terrain, software, fonts, audio, and asset traceability.
  网站级来源索引，覆盖历史资料、地图、地形、软件、字体、音频和素材追溯。
- `docs/sources`: historical references, audio attribution, asset notes, and uncertainty records.
  历史参考、音频署名、素材说明和不确定性记录。
- `docs/war-animation-handoff.md`: detailed production handoff and accumulated animation rules.
  详细生产交接文档和累计动画规则。
- `agents/skills/animation-assistant`: reusable Codex skill, references, and project health-check script.
  可复用 Codex skill、参考资料和项目健康检查脚本。
- `tests`: Playwright smoke tests for data gates, layout, map interaction, route visibility, audio behavior, and representative animation states.
  Playwright 冒烟测试，覆盖数据门禁、布局、地图交互、路线可见性、音频行为和代表性动画状态。

## Run Locally

```bash
npm install
npm run dev
```

Open the Vite URL printed by the command, usually `http://127.0.0.1:5177/`.

打开命令输出的 Vite 地址，通常是 `http://127.0.0.1:5177/`。

## Verify

```bash
npm run build
npm run test:smoke
node agents/skills/animation-assistant/scripts/check-animation-project.mjs .
```

The smoke tests expect browser dependencies installed by Playwright. If needed:

冒烟测试需要 Playwright 浏览器依赖。如有需要：

```bash
npx playwright install chromium
```

## Publish Demo

Pushes to `main` trigger two GitHub Actions workflows:

推送到 `main` 会触发两个 GitHub Actions 工作流：

- `CI`: installs dependencies, builds the app, runs Playwright smoke tests, and runs the animation project health check.
  安装依赖、构建应用、运行 Playwright 冒烟测试，并运行动画项目健康检查。
- `Deploy GitHub Pages`: builds with `GITHUB_PAGES=true` and deploys `dist` to GitHub Pages.
  使用 `GITHUB_PAGES=true` 构建，并将 `dist` 部署到 GitHub Pages。

## Skill / Agent

The reusable animation workflow lives at:

```text
agents/skills/animation-assistant/
```

Use it as a portable Codex skill for building new campaign-map animations. It encodes the hard-earned rules around map projections, compressed timelines, realistic unit markers, audio assets, controls, source notes, and Playwright gates.

它可作为便携 Codex skill，用于构建新的战役地图动画；其中沉淀了地图投影、压缩时间轴、写实单位标记、音频素材、控制组件、来源说明和 Playwright 门禁等规则。

The GitHub submission workflow lives at:

```text
agents/skills/github-submit-assistant/
```

Use it before publishing repository updates. It enforces update notes, source/disclaimer checks, validation, local commits, and GitHub pushes.

发布仓库更新前使用它。它会约束更新说明、来源/免责声明检查、验证、本地提交和 GitHub 推送。

## Peace, Sources, and Disclaimer

This project is an educational, open-source, non-commercial historical animation library. We love peace and oppose war. The animations are source-backed but simplified visualizations, not authoritative historical, legal, political, military, or cartographic advice.

本项目是教育性、开源、非商业意图的历史动画库。我们热爱和平，反对战争。动画有来源支撑，但属于简化可视化，不是权威历史、法律、政治、军事或制图建议。

Read [DISCLAIMER.md](DISCLAIMER.md), [SOURCE_INDEX.md](SOURCE_INDEX.md), [NOTICE.md](NOTICE.md), and `docs/sources/*` before reusing the project, redistributing assets, or relying on any historical interpretation.

复用项目、再分发素材或依赖任何历史解释前，请阅读 [DISCLAIMER.md](DISCLAIMER.md)、[SOURCE_INDEX.md](SOURCE_INDEX.md)、[NOTICE.md](NOTICE.md) 和 `docs/sources/*`。

## Licensing

Code in this repository is released under the MIT License. Media assets are not automatically MIT licensed. They come from mixed public-domain, CC0, attribution-required, non-commercial, or not-yet-fully-verified sources.

本仓库代码按 MIT License 发布。媒体素材不会自动适用 MIT License；它们来自公有领域、CC0、需署名、非商业限制或尚未完全核验的混合来源。

Read [DISCLAIMER.md](DISCLAIMER.md), [SOURCE_INDEX.md](SOURCE_INDEX.md), [NOTICE.md](NOTICE.md), and `docs/sources/*` before redistributing assets or using them commercially. Treat the included media as demo/runtime assets with source-specific terms unless a file is explicitly documented as public domain or CC0.

再分发素材或商业使用前，请阅读 [DISCLAIMER.md](DISCLAIMER.md)、[SOURCE_INDEX.md](SOURCE_INDEX.md)、[NOTICE.md](NOTICE.md) 和 `docs/sources/*`。除非具体文件明确记录为公有领域或 CC0，应将随附媒体视为带有来源特定条款的演示/运行时素材。
