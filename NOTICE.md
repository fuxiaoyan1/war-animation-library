# Notices and Asset Terms

This repository mixes original software with third-party runtime media assets.

本仓库同时包含原创软件代码和第三方运行时媒体素材。

For the full project-level disclaimer, including historical-information limits, source website entry points, copyright handling, non-commercial intent, and the maintainers' peace-and-anti-war statement, read [DISCLAIMER.md](DISCLAIMER.md). For a website-level source index, read [SOURCE_INDEX.md](SOURCE_INDEX.md).

完整项目级免责声明，包括历史信息限制、来源网站入口、版权处理、非商业意图以及维护者热爱和平、反对战争的立场，请阅读 [DISCLAIMER.md](DISCLAIMER.md)。网站级来源索引见 [SOURCE_INDEX.md](SOURCE_INDEX.md)。

## Code

The application source code, tests, and agent workflow files are MIT licensed unless a file states otherwise.

除非具体文件另有说明，应用源代码、测试和智能体工作流文件按 MIT License 发布。

## Media Assets

Media files under `public/` are not automatically MIT licensed. They are included so the demo can run locally and so the animation data can be inspected with its visual/audio context.

`public/` 下的媒体文件不会自动适用 MIT License。它们被包含在仓库中，是为了让演示可以本地运行，并让动画数据能结合其视觉/音频上下文被检查。

The detailed source log is maintained in:

详细来源记录维护在：

- `SOURCE_INDEX.md`
- `docs/sources/audio.md`
- `docs/sources/unit-icons.md`
- `docs/sources/*`

Current asset categories include:

当前素材类别包括：

- Public-domain or U.S. government/Wikimedia/Project Gutenberg recordings and images.
  公有领域或美国政府/Wikimedia/Project Gutenberg 录音与图片。
- CC0 sound effects from Directory.Audio.
  来自 Directory.Audio 的 CC0 音效。
- Attribution-required music from FiftySounds. Attribution required by source notes:
  来自 FiftySounds 的需署名音乐。来源说明要求的署名包括：
  - `Track: Radetzky March` / `Music by https://www.fiftysounds.com`
  - `Track: Invincible` / `Music by https://www.fiftysounds.com`
  - `Track: False Flag` / `Music by https://www.fiftysounds.com`
  - `Track: Only the Braves` / `Music by https://www.fiftysounds.com`
- PNGIMG-derived markers documented as Creative Commons Attribution-NonCommercial 4.0. Do not treat those files as commercially reusable.
  PNGIMG 派生标记记录为 Creative Commons Attribution-NonCommercial 4.0；不要将这些文件视为可商业复用素材。
- Some local-demo assets with unresolved redistribution status, including selected Gaixia markers, Midway carrier marker derivations, and the Shi Mian Mai Fu pipa recording. These should be replaced with clearly licensed assets before broad public redistribution or any commercial use.
  部分本地演示素材的再分发状态尚未完全明确，包括部分垓下标记、中途岛航母标记派生素材和《十面埋伏》琵琶录音；在广泛公开再分发或任何商业使用前，应替换为许可明确的素材。

## Raw Sources

Raw source/reference folders such as `public/assets/unit-icons/source/` and `public/assets/maps/source/` are intentionally omitted from this standalone export. Documentation may still mention those paths because they existed in the original private working project for traceability.

`public/assets/unit-icons/source/`、`public/assets/maps/source/` 等原始来源/参考目录已从这个独立导出中有意省略。文档仍可能提到这些路径，因为它们曾存在于原始私有工作项目中，用于追溯来源。

## Runtime Assets And Local Toolchain

Runtime assets that the demo needs are committed when practical, including selected map tiles, unit icons, weather images, and audio under `public/`. For the current `伦敦上空的鹰` branch, the GitHub build can render the London animation from committed runtime assets plus npm dependencies.

演示运行所需素材会在可行时提交，包括 `public/` 下的部分地图瓦片、单位图标、天气图片和音频。当前 `伦敦上空的鹰` 分支中，GitHub 构建可以通过已提交运行资产和 npm 依赖渲染伦敦动画。

The full local production stack is not part of the Git runtime package. Local ComfyUI installations and model files, segmentation model caches under `engine-cache/`, QGIS/GDAL installations, Playwright browser caches, `node_modules`, generated `artifacts/`, and prototype `vendor/` or `tiles/` directories are intentionally excluded or ignored. They are needed to regenerate or improve assets, not to view the committed demo.

完整本机生产栈不是 Git 运行包的一部分。本机 ComfyUI 安装和模型文件、`engine-cache/` 下的分割模型缓存、QGIS/GDAL 安装、Playwright 浏览器缓存、`node_modules`、生成的 `artifacts/`，以及原型 `vendor/` 或 `tiles/` 目录都被有意排除或忽略。它们用于重新生成或改进资产，不用于观看已提交的演示。

See `docs/tools/london-air-map-weather-workflow.md`, `docs/tools/britain-air-comfyui-style-pass.md`, `docs/tools/unit-icon-production-workflow.md`, and `docs/tools/tactical-terrain-studio.md` for the documented production dependencies and boundaries.

生产依赖和边界说明见 `docs/tools/london-air-map-weather-workflow.md`、`docs/tools/britain-air-comfyui-style-pass.md`、`docs/tools/unit-icon-production-workflow.md` 和 `docs/tools/tactical-terrain-studio.md`。

## Practical Rule

Use the code freely under MIT. Audit or replace media assets before publishing derivative commercial work, redistributing asset packs, or claiming the whole repository is fully open-source under one license.

代码可按 MIT License 自由使用。发布商业衍生作品、再分发素材包，或声称整个仓库都按单一开源许可发布之前，请审计或替换媒体素材。

For every new animation, and for every old animation whose information sources or media assets materially change, update the relevant `docs/sources/*` file and keep the disclaimer visible in the repository.

每次新增动画，或旧动画的信息来源/媒体素材发生实质变更时，都必须更新相关 `docs/sources/*` 文件，并保持免责声明在仓库显著可见。
