---
name: github-submit-assistant
description: Use when preparing a GitHub update for this war-animation repository: gather all dirty work, write bilingual release/update notes, keep README/NOTICE/DISCLAIMER/SOURCE_INDEX/source logs consistent, check copyright notes, run validation gates, commit locally, and push to GitHub.
---

# GitHub Submit Assistant

Use this skill before any GitHub-facing update of the war-animation repository, especially when a new animation is added or an existing animation changes history sources, media assets, route data, camera behavior, or narrative interpretation.

在战争动画仓库进行任何面向 GitHub 的更新前使用本 skill，尤其是新增动画，或旧动画变更历史来源、媒体素材、路线数据、镜头行为、叙事解释时。

## Required Workflow

## 必需流程

1. Inspect repository state:
   检查仓库状态：
   - `git status --short --branch`
   - `git remote -v`
   - `git log --oneline origin/main..HEAD`
   - `git diff --name-status origin/main`
2. Treat user instruction "submit all current project work" as permission to stage every tracked and untracked change with `git add -A`, including changes not made by the current agent.
   当用户要求“提交当前项目全部工作”时，视为允许用 `git add -A` 暂存所有已跟踪和未跟踪变更，包括当前智能体未亲自做的变更。
3. Write or update a dated bilingual file under `docs/updates/` that explains user-facing changes relative to GitHub `origin/main`.
   在 `docs/updates/` 下写入或更新带日期的双语说明文件，解释相对 GitHub `origin/main` 的用户可见变化。
4. Ensure the root `DISCLAIMER.md` and `SOURCE_INDEX.md` exist, and README/NOTICE link to them prominently.
   确保根目录 `DISCLAIMER.md` 和 `SOURCE_INDEX.md` 存在，并且 README/NOTICE 显著链接它们。
5. For every new animation or any changed information/media source:
   对每部新增动画，或任何信息/媒体来源变更：
   - update the relevant `docs/sources/*` file;
     更新相关 `docs/sources/*` 文件；
   - update `SOURCE_INDEX.md` when a source website is added, removed, or materially reclassified;
     当来源网站新增、移除或实质重新分类时，更新 `SOURCE_INDEX.md`；
   - confirm `DISCLAIMER.md` directly links the current source websites or the maintained source website index;
     确认 `DISCLAIMER.md` 直接链接当前来源网站，或链接维护中的来源网站索引；
   - mention source/licensing changes in the update note;
     在更新说明中提到来源/许可变化；
   - preserve the statement that the project is open-source, non-commercial in intent, loves peace, and opposes war.
     保留项目开源、维护者非商业意图、热爱和平、反对战争的声明。
6. Apply the bilingual documentation rule before commit:
   提交前应用双语说明文件规则：
   - public explanatory files should use Chinese and English wherever practical;
     公开说明文件应在可行时使用中英双语；
   - this includes `README.md`, `NOTICE.md`, `DISCLAIMER.md`, `docs/updates/*.md`, `agents/README.md`, and public agent/skill description files;
     范围包括 `README.md`、`NOTICE.md`、`DISCLAIMER.md`、`docs/updates/*.md`、`agents/README.md` 和公开 agent/skill 说明文件；
   - `SOURCE_INDEX.md` is exempt from the bilingual requirement because it is a compact website index;
     `SOURCE_INDEX.md` 是紧凑网站索引，豁免双语要求；
   - `docs/sources/*` may preserve source-log language, but any new summary/disclaimer text added there should be bilingual when practical.
     `docs/sources/*` 可保留来源日志原语言，但新增摘要/免责声明类文本时，应在可行时双语。
7. Run validation before commit:
   提交前运行验证：
   - `git diff --check`
   - `node agents/skills/github-submit-assistant/scripts/check-doc-governance.mjs .`
   - `npm exec tsc -- -b`
   - `npm run build`
   - targeted Playwright gates for affected animations;
   - data quality gate when campaign data changes.
8. Commit with a concise Chinese message that names the release scope.
   用简洁中文提交信息提交，并点明发布范围。
9. Push the current branch to `origin`.
   将当前分支推送到 `origin`。
10. Report commit hash, pushed branch, key changed docs, and verification results.
   汇报提交哈希、推送分支、关键变更文档和验证结果。

## Documentation Relationship Contract

Keep these files consistent as a single documentation system:

## 文档关系合同

将以下文件作为一套文档系统保持一致：

- `README.md`: repository front door. It must link `DISCLAIMER.md`, `SOURCE_INDEX.md`, `NOTICE.md`, relevant `docs/updates/*.md`, and source logs when reuse, licensing, or historical reliance is discussed.
  仓库入口页。讨论复用、许可或历史解释依赖时，必须链接 `DISCLAIMER.md`、`SOURCE_INDEX.md`、`NOTICE.md`、相关 `docs/updates/*.md` 和来源日志。
- `DISCLAIMER.md`: project-level ethical, historical-information, source-visibility, non-commercial, no-affiliation, and no-warranty statement. It must remain prominent and include either direct source website links or a clear route to `SOURCE_INDEX.md`.
  项目级伦理、历史信息、来源可见性、非商业、无关联和无保证声明。必须保持显著，并包含来源网站直接链接或通向 `SOURCE_INDEX.md` 的清晰路径。
- `SOURCE_INDEX.md`: website-level index of all external source domains currently present in `docs/sources/*.md`. Update it whenever source websites change. It is exempt from the bilingual rule, but it must stay complete.
  当前 `docs/sources/*.md` 中所有外部来源域名的网站级索引。来源网站变化时必须更新。它豁免双语要求，但必须保持完整。
- `NOTICE.md`: asset and licensing notice. It must point to `DISCLAIMER.md`, `SOURCE_INDEX.md`, and the detailed source logs; it must not imply that media assets are MIT licensed.
  素材和许可声明。必须指向 `DISCLAIMER.md`、`SOURCE_INDEX.md` 和详细来源日志；不得暗示媒体素材按 MIT 许可发布。
- `docs/sources/*`: page-level historical, media, map, font, audio, and asset source logs. These hold exact URLs, attribution notes, uncertainty notes, and source-specific license caveats.
  页面级历史、媒体、地图、字体、音频和素材来源日志。这里保存精确 URL、署名说明、不确定性说明和来源特定许可风险。
- `docs/updates/*.md`: release/update notes. These explain what changed since the compared GitHub baseline, call out changed animations, source/licensing/disclaimer changes, and record validation results.
  发布/更新说明。它们解释相对 GitHub 对比基准的变化，点明被修改动画、来源/许可/免责声明变化，并记录验证结果。
- `agents/skills/github-submit-assistant/SKILL.md`: the enforcement checklist. When any rule above changes, update this skill in the same commit.
  执行检查清单。以上任何规则变化时，必须在同一提交中更新本 skill。

If these files disagree, fix the relationship before pushing. Do not leave a new source in `docs/sources/*` without either an updated `SOURCE_INDEX.md` entry or an explicit note explaining why no website-level change is needed.

如果这些文件互相矛盾，推送前先修正文档关系。不要在 `docs/sources/*` 新增来源后既不更新 `SOURCE_INDEX.md`，也不说明为什么不需要网站级变化。

## Disclaimer Contract

The disclaimer must say, in substance:

## 免责声明合同

免责声明必须实质表达以下内容：

- The project is educational, technical, open-source, and non-commercial in maintainer intent.
  项目是教育性、技术性、开源的，维护者意图为非商业。
- The maintainers love peace and oppose war.
  维护者热爱和平，反对战争。
- Animations do not glorify violence or endorse political, military, ethnic, national, religious, or ideological positions.
  动画不美化暴力，也不背书任何政治、军事、民族、国家、宗教或意识形态立场。
- Historical data is source-backed but compressed, approximate, and not authoritative advice.
  历史数据有来源支撑，但经过压缩和近似处理，不是权威建议。
- External source websites are visible from the disclaimer and `SOURCE_INDEX.md`, not hidden only in per-animation source notes.
  外部来源网站必须能从免责声明和 `SOURCE_INDEX.md` 看到，不能只藏在单部动画来源说明里。
- Code is MIT unless otherwise stated.
  除非另有说明，代码按 MIT 发布。
- Media, maps, audio, fonts, and unit markers may carry separate terms and are not automatically MIT licensed.
  媒体、地图、音频、字体和单位标记可能有单独条款，不会自动按 MIT 发布。
- Rights concerns should be handled by correcting attribution, replacing material, or removing it.
  权利问题应通过修正署名、替换材料或移除内容处理。

## Bilingual Documentation Contract

For public explanatory documentation, prefer paired Chinese and English wording. A section does not need sentence-by-sentence translation, but a reader in either language should understand the file's purpose, duties, risk notices, update requirements, and validation status.

## 双语说明文件合同

公开说明文件优先采用中英配对写法。不要求每一句逐字翻译，但中文或英文读者都应能理解文件用途、职责、风险提示、更新要求和验证状态。

Use this default:

默认采用：

- Chinese heading plus English heading, or a bilingual heading separated by `/`.
  中文标题加英文标题，或用 `/` 分隔的双语标题。
- Chinese summary paragraph plus English summary paragraph for each major section.
  每个主要章节包含中文摘要段落和英文摘要段落。
- Bullets can be bilingual pairs or concise bilingual bullets.
  列表可以使用中英配对，也可以使用简洁双语 bullet。
- Keep source URLs and proper names unchanged.
  来源 URL 和专有名称保持不变。
- Do not force `SOURCE_INDEX.md` into full bilingual prose; its job is compact source-website coverage.
  不要强迫 `SOURCE_INDEX.md` 变成完整双语散文；它的职责是紧凑覆盖来源网站。

## Output Expectations

Keep the final user response short but include:

## 输出要求

最终回复保持简短，但包含：

- local commit hash;
  本地提交哈希；
- pushed remote and branch;
  已推送远端和分支；
- update note path;
  更新说明路径；
- disclaimer path;
  免责声明路径；
- source index path;
  来源索引路径；
- skill path;
  skill 路径；
- bilingual documentation updates performed;
  已执行的双语文档更新；
- verification commands that passed;
  已通过的验证命令；
- any command that could not be run or any push failure.
  任何未能运行的命令或推送失败。
