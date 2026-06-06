# 战争动画会话接手交接文档（2026-06-06）

交接时间：2026-06-06 CST

项目路径：`/Users/asukarei/Desktop/war-animation-lab-oss`

接手动作：已阅读会话“战争动画”候选主线最后 100 条记录；只做状态接手和文档整理，不继续推进动画实现。

会话来源判定：当前 `session_index.jsonl` 中没有精确标题“战争动画”，但最近有效主线定位到 `/Users/asukarei/Desktop/war-animation-lab-oss` 的长会话文件：

```text
/Users/asukarei/.codex/sessions/2026/05/29/rollout-2026-05-29T14-02-16-019e7253-84ec-74a2-8b42-d4ebc801d262.jsonl
```

本次读取的最后 100 条有效记录大致对应该文件末段 `line 23442` 到 `line 23578`，时间集中在 `2026-06-05T15:42:09Z` 到 `2026-06-05T15:47:55Z`。该段最后一个任务已经完成，收口内容是垓下之战“东南伏骑截断退路”修正与验证。

## 0. 接手结论

- 原会话最后 100 条不是新功能启动，而是一个已完成的修正收口。
- 原会话最后的用户反馈核心是：垓下“截断退路”的骑兵队伍穿过楚军太远，阶段性阻断单位应配合、尾随并压迫楚军突围线，而不是独自跑完整条追击线。
- 原会话已经实现并验证：楚军东南突围正式路线从东口接触区起步，营内集结改放 `formationPrelude`；汉军截断骑兵贴楚军突围线外侧协同压迫；阴陵追击骑兵提前 5 分钟接力。
- 原会话最后验证已通过：`git diff --check`、`npm exec tsc -- -b`、`npm run build`、`campaign data quality gates`、`gaixia ambush uses terrain map ten-sided formations and pipa score`。
- 本次接手没有继续改动画逻辑，没有复跑测试，只新增本交接文档。

## 1. 当前仓库状态

当前分支：

```text
main...origin/main [ahead 30]
```

最近提交头：

```text
66eb1b3e 稳定本地常驻预览服务
737d35f9 强化碾庄圩3D战术视图与视觉门禁
02f0fbd2 修复碾庄镜头过渡与单位连续性
12851d41 修复碾庄战术地图标注拥挤
0ffca637 修复碾庄三维战术地图视觉回归
```

当前未提交 tracked 改动：

```text
M docs/sources/gaixia-ambush.md
M docs/war-animation-handoff-20260529.md
M src/components/GaixiaAmbushAnimation.tsx
M src/components/GaixiaTerrain3D.tsx
M src/components/NianzhuangBattleAnimation.tsx
M src/components/NianzhuangTerrain3D.tsx
M src/data/gaixiaAmbush.ts
M src/data/nianzhuangBattle.ts
M src/styles.css
M tests/battle-france-smoke.spec.ts
```

本文件新增后还会出现：

```text
?? docs/war-animation-handoff-20260606.md
```

改动规模在接手前为：

```text
10 files changed, 684 insertions(+), 136 deletions(-)
```

注意：当前工作区同时包含垓下修正和碾庄圩 3D 战术图修正，不要误以为所有未提交改动都来自原会话最后 100 条。最后 100 条只覆盖垓下收尾；碾庄改动是工作区中的既有未提交状态。

## 2. 原会话最后 100 条实际做了什么

### 2.1 重采 04:20 黎明节点

原会话先确认早前 `04:20` 的 zoom 旧值是因为采样等待时间太短。正式相机采样需要等约 `1250ms`，重采结果：

```json
{
  "zoom": "11.87",
  "center": "117.54100,33.24600",
  "cutoffToChu": 34.55861129277369,
  "routeCount": 17,
  "unitCount": 65,
  "blackBlocks": 0
}
```

结论：完整等待相机过渡后，黎明节点相机是预期近景；截断骑兵与楚骑距离约 35px；无黑块，无控制台错误。

### 2.2 数据门禁先失败，随后修正

原会话复跑数据门禁时，`campaign data quality gates keep timelines routes and cues coherent` 曾失败：

```text
pursuit cavalry should be the unit taking over close contact by Xiang Yu's breakout event
Expected <= 0.03
Received 0.033...
```

原会话没有放松测试，而是计算不同追击启动时间下 05:30 的距离。结论是把阴陵追击骑兵开始时间从 `04:45` 提前到 `04:40`，距离可从约 `0.033` 压到约 `0.026`，仍保持“截断后接力追击”的叙事，不会在黎明节点抢戏。

### 2.3 垓下数据和渲染层的关键修改

本轮垓下相关核心改动：

- `src/data/gaixiaAmbush.ts`
  - `GaixiaRoute` 增加 `formationPrelude?: Array<[number, number]>`。
  - 多条关键路线增加 `formationPrelude`，用于阶段交接、编队后排拖尾和单位连续性。
  - `chu-breakout-southeast` 正式路线从东口接触区附近起步，不再从楚营中心一路穿出。
  - `han-dawn-cavalry-cutoff` 时间窗改为 `04:18` 到 `05:35`，路线向东南逃逸线外侧压迫。
  - `han-cavalry-pursuit-yinling` 开始时间改为 `04:40`，用于 05:30 追击接力。
- `src/components/GaixiaAmbushAnimation.tsx`
  - 增加 `encirclement-close` 和 `encirclement-close-dawn` 两个近景阶段。
  - 从 `songs-of-chu` 到 `farewell` 使用近景，`dawn-assault` 使用带平移的近景。
  - `xiangyu-breakout` 后恢复追击阶段视角。
- `src/components/GaixiaTerrain3D.tsx`
  - 增加 `cameraZoomBoost`，支持垓下第 10 小时到黎明的 2x 战术近景。
  - overlay 路线投影加入 `formationPreludePoints`。
  - 单位 placement 改为基于 `formationPrelude + visiblePoints` 的局部 offset，不再简单贴在当前 marker 点。
  - 阵型点阵由圆点改为短划 `formation-rank-mark`，降低被误读为无意义散点的风险。
- `src/styles.css`
  - 垓下与碾庄的阵型 rank 样式从圆点改为短划。
- `docs/sources/gaixia-ambush.md`
  - 补充 `formationPrelude` 的使用规则和短划队列表达说明。
- `tests/battle-france-smoke.spec.ts`
  - 数据门禁增加 `formationPrelude` 覆盖断言。
  - 增加 `han-dawn-cavalry-cutoff` 与 `chu-breakout-southeast`、`han-cavalry-pursuit-yinling` 的距离/方向/交接断言。
  - 垓下专项测试 timeout 从 `90_000` 调整到 `140_000`。
  - 相机门禁允许并检查第 10 小时到黎明的计划性近景，再在追击阶段恢复比例。

### 2.4 原会话最终验证

原会话最后明确记录以下验证已通过：

```bash
git diff --check
npm exec tsc -- -b
npm run build
FRONTEND_URL=http://127.0.0.1:5177 npm exec playwright -- test tests/battle-france-smoke.spec.ts -g "campaign data quality gates"
FRONTEND_URL=http://127.0.0.1:5177 npm exec playwright -- test tests/battle-france-smoke.spec.ts -g "gaixia ambush uses terrain map ten-sided formations and pipa score"
```

通过结果：

- 数据门禁：`1 passed`
- 垓下专项：`1 passed`
- 构建成功并发布到常驻预览：`http://127.0.0.1:5177/`

原会话还做了内部视觉采样：04:20 截断骑兵与楚骑距离从约 `234px` 收到约 `35px`，相机最终 `zoom=11.87`，无黑块、无控制台错误。

## 3. 当前工作区中额外存在的碾庄改动

这些改动没有出现在原会话最后 100 条的收尾说明里，但当前工作区确实存在，接手者必须一起处理。

### 3.1 碾庄镜头与 3D 战术图

涉及：

- `src/components/NianzhuangBattleAnimation.tsx`
- `src/components/NianzhuangTerrain3D.tsx`
- `tests/battle-france-smoke.spec.ts`
- `docs/war-animation-handoff-20260529.md`

当前意图：

- 增加 `nianzhuangSecondWall` 镜头阶段。
- `1948-11-19T22:30` 起切到第二道围墙/内圩攻坚近景。
- `1948-11-20T05:15` 起回到 `nianzhuangFinal`，避免 05:30 残点清剿还停在过近视角。
- 允许 2D `maxScale=3.35`，3D zoom 上限放到 `12.28`。
- 在 `nianzhuangSecondWall` 焦点下隐藏徐东阻援等外围 context routes，降低内圩近景拥挤。
- MapLibre `load` 后重新 jump 到最新 camera，避免初始加载使用旧镜头。

`docs/war-animation-handoff-20260529.md` 已追加这条镜头规则：

```text
1948-11-19T22:30 起第二道围墙/内圩攻坚使用独立 nianzhuangSecondWall 近镜头；
1948-11-20T05:15 起回缩到 nianzhuangFinal。
```

### 3.2 碾庄残部退守链

涉及：

- `src/data/nianzhuangBattle.ts`
- `tests/battle-france-smoke.spec.ts`

当前意图：

- `huang-remnant-fallback-east` 从 `final-east-core` 退到 `east-remnant-pocket`，只保留黄部与 64 军东撤。
- 新增 `huang-remnant-fallback-north`，表现 25 军、108 师向北侧尤家湖方向退守。
- 新增 `huang-remnant-fallback-south`，表现 44、100、159 等南侧残部向三里庄方向退守。
- `huang-east-remnant-defense` 延后到 `1948-11-21T08:00` 出现，避免在残部实际抵达前就形成固定残点。
- `pla-remnant-mop-up-east` 增加 `formationPrelude` 和更细 waypoints，与国民党东撤路线贴合。

测试中同步调整了：

- 国民党残部 fallback/defense 的窗口断言。
- 残部路线来源锚点断言。
- 残部 badge 断言。
- 国民党单位 handoff 图关系。

### 3.3 阵型点阵视觉改为短划

涉及：

- `src/components/GaixiaTerrain3D.tsx`
- `src/components/NianzhuangTerrain3D.tsx`
- `src/styles.css`
- `tests/battle-france-smoke.spec.ts`

当前意图：

- 去掉垓下 `.gaixia-formation-rank-dot` 圆点。
- 去掉碾庄 `.nianzhuang-formation-rank-dot` 圆点。
- 改为短划 `formation-rank-mark`，降低“蓝色散点/黑点/无意义圆点”的观感问题。
- 碾庄命令所图标底座从圆形改为小底座 path。
- 碾庄 route head circle 移除，测试增加 “route head dots removed / formation dots removed” 类检查。

## 4. 当前服务状态

常驻预览仍在运行：

```text
http://127.0.0.1:5177/
```

LaunchAgent：

```text
/Users/asukarei/Library/LaunchAgents/com.asukarei.war-animation-lab-5177.plist
```

当前监听：

```text
node ... TCP 127.0.0.1:5177 (LISTEN)
```

服务工作目录：

```text
/Users/asukarei/Library/Application Support/war-animation-lab-oss
```

发布目录：

```text
/Users/asukarei/Library/Application Support/war-animation-lab-oss/dist
```

注意：如果继续改源码，必须先 `npm run build`，再 `npm run preview:local -- --skip-build` 或 `npm run preview:local` 更新常驻预览；否则 Playwright 可能仍测旧的发布产物。

## 5. 不要继续推进时的接手边界

本次任务的边界是“接手他的工作，但不要继续推进”。因此下一步如果只是交接，不应做以下事情：

- 不新增或调整战役数据。
- 不重跑长耗时全量 smoke，除非用户明确要求验收当前工作区。
- 不截图、不展示图片、不贴 base64。
- 不提交代码，除非用户明确要求。
- 不删除或回滚当前未提交改动。
- 不把当前文档补写误解为动画质量验收。

## 6. 下一位接手者的建议入口

如果用户要求继续垓下：

1. 先读本文件第 2 节。
2. 再读：

   ```text
   docs/sources/gaixia-ambush.md
   src/data/gaixiaAmbush.ts
   src/components/GaixiaAmbushAnimation.tsx
   src/components/GaixiaTerrain3D.tsx
   tests/battle-france-smoke.spec.ts
   ```

3. 先复跑：

   ```bash
   git diff --check
   npm run build
   FRONTEND_URL=http://127.0.0.1:5177 npm exec playwright -- test tests/battle-france-smoke.spec.ts -g "campaign data quality gates|gaixia ambush uses terrain map ten-sided formations and pipa score"
   ```

4. 重点看 `04:20`、`05:30`、`xiangyu-breakout` 三个节点：
   - 截断骑兵是否贴突围线外侧。
   - 追击骑兵是否在 05:30 接上楚军。
   - 追击阶段是否恢复到更广的战术比例。

如果用户要求继续碾庄：

1. 先读本文件第 3 节和旧文档：

   ```text
   docs/war-animation-handoff-20260529.md
   docs/sources/nianzhuang-battle.md
   src/data/nianzhuangBattle.ts
   src/components/NianzhuangBattleAnimation.tsx
   src/components/NianzhuangTerrain3D.tsx
   tests/battle-france-smoke.spec.ts
   ```

2. 先复跑：

   ```bash
   git diff --check
   npm run build
   FRONTEND_URL=http://127.0.0.1:5177 npm exec playwright -- test tests/battle-france-smoke.spec.ts -g "campaign data quality gates|nianzhuang battle shows"
   ```

3. 重点看：
   - `1948-11-19T22:30` 到 `1948-11-20T03:30` 第二道围墙近景是否确实放大但不拥挤。
   - `1948-11-20T05:30` 是否回到残点清剿比例。
   - 北、东、南三路国民党残部退守是否合理，是否没有凭空出现。
   - 圆点是否全部被短划替代，是否仍可读。

## 7. 提交前清单

如果后续用户要求提交当前工作区，至少执行：

```bash
git status --short
git diff --check
npm run build
FRONTEND_URL=http://127.0.0.1:5177 npm exec playwright -- test tests/battle-france-smoke.spec.ts -g "campaign data quality gates|gaixia ambush uses terrain map ten-sided formations and pipa score|nianzhuang battle shows"
```

确认无误后，建议提交这些文件：

```bash
git add \
  docs/sources/gaixia-ambush.md \
  docs/war-animation-handoff-20260529.md \
  docs/war-animation-handoff-20260606.md \
  src/components/GaixiaAmbushAnimation.tsx \
  src/components/GaixiaTerrain3D.tsx \
  src/components/NianzhuangBattleAnimation.tsx \
  src/components/NianzhuangTerrain3D.tsx \
  src/data/gaixiaAmbush.ts \
  src/data/nianzhuangBattle.ts \
  src/styles.css \
  tests/battle-france-smoke.spec.ts
```

不要提交运行产物、截图、`dist/`、`test-results/`、`logs/` 或 LaunchAgent 日志。

## 8. 已沉淀经验

原会话已向 mempalace 写入规则：

```text
drawer_animation-assistant_visual-rules_f9b9feb9db8c8965869987aa
```

规则含义：

```text
阶段性截击/阻断骑兵不能作为独立单位穿透敌军纵队或远离敌军。应沿敌军逃逸线近距压迫，用 formationPrelude 表示接触前集结或接力前置，用独立 pursuit route 表示后续长距离追击，并在关键事件时间和追击交接时间做回归采样。
```

该规则后续可推广到其他战争动画：任何“阻断、截击、封锁、伏击线”都应区分近距阻断与远距追击，不能让一个阶段性单位既负责截断又负责完整追击。
