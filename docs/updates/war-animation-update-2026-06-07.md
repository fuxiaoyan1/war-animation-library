# 战争动画藏书馆更新说明

War Animation Library Update Notes

更新时间：2026-06-07

Updated: 2026-06-07

对比基准：本地 `main` 分支提交 `c15b5197 整理十大战役阵法动画资料计划`。本次更新按“十大战役阵法动画”长期计划先制作第一部生产版专题动画：`坎尼会战：双重合围`。

Baseline: local `main` commit `c15b5197 整理十大战役阵法动画资料计划`. This update builds the first production standalone animation for the long-running "top formation battles" plan: `Battle of Cannae: Double Envelopment`.

## 主要变化

## Main Changes

- 新增 `坎尼会战：双重合围` 首页入口，作为古代战争中的单战阵法专题，位置紧跟 `罗马与迦太基：三次布匿战争史`。
- 新增专用 `CannaeFormationAnimation`，不复用远距离行军地图，而是使用战术 SVG 沙盘表现阵形变形。
- 新增 `src/data/cannaeBattle.ts`，把阶段、阵形块、战术指标、来源和不确定性从渲染代码中拆出。
- 新增七个阵法阶段：部署、罗马推进、中军后退、骑兵清翼、非洲重步兵内折、双重合围、终局崩溃。
- 新增可测试战术指标：`romanCompression`、`centerCurvature`、`wingClosure`、`cavalrySweep`。
- 新增坎尼专项 Playwright 测试，验证罗马集团压缩、中军由凸转凹、非洲翼内折、合围环出现、手动跳阶段触发古代近战音效，以及移动端战斗画面居中。

English summary: this update adds a standalone Cannae tactical animation with a dedicated data model, seven phase states, testable tactical metrics, and regression tests for the double-envelopment geometry and mobile layout.

## 制作口径

## Production Scope

本次没有把坎尼硬塞入通用全景战役地图。坎尼的核心不是长距离路线，而是阵形结构：罗马密集纵深集团压入迦太基凸月中军，汉尼拔中军后退形成凹口，骑兵清理两翼，非洲重步兵内折，最后形成双重合围。

This update does not force Cannae into the generic campaign-map renderer. Cannae's core is formation structure rather than long-distance routing: the dense Roman infantry mass enters the Carthaginian convex center, Hannibal's center yields into a concave pocket, cavalry clears the wings, African infantry turns inward, and the double envelopment closes.

## 来源与免责声明

## Sources and Disclaimer

- 新增独立来源文档：`docs/sources/cannae-battle.md`。
- 更新 `SOURCE_INDEX.md`，把 `docs/sources/cannae-battle.md` 挂到 Britannica、World History Encyclopedia、LacusCurtius、Perseus Digital Library 和 Wikimedia Commons 等既有网站入口。
- `DISCLAIMER.md` 已包含本次新增来源涉及的网站入口；本次未新增免责声明中缺失的新域名。
- 本动画不复制第三方地图图片或视频；SVG 沙盘由项目代码绘制。Commons 地图类别仅作构图参考，不作为事实本身。
- 项目继续声明开源、非商业意图，热爱和平、反对战争；历史资料和地图表达均为教育和技术演示用途，存在压缩、近似和不确定性。

English summary: a standalone Cannae source log was added, the website-level source index now references it, and the project disclaimer already exposes all involved source websites. The animation uses project-drawn SVG and treats modern map diagrams as composition references only.

## 验证状态

## Verification Status

提交前应运行：

Before commit, run:

- `git diff --check`
- `node agents/skills/github-submit-assistant/scripts/check-doc-governance.mjs .`
- `npm exec tsc -- -b`
- `npm run build`
- `npm run test:smoke`

English note: the final commit report should record which commands passed and any command that could not be run.
