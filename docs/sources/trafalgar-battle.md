# 特拉法尔加大海战动画来源

## 采用口径

- 时间范围：1805-10-21 11:30 至 18:00。动画用小时级时间轴，不按周显示。
- 战场范围：加的斯以南、特拉法尔加角外海，镜头从接近阶段缩到中央混战区。
- 舰队规模：英军约27艘战列舰，法西联合舰队约33艘战列舰；动画按约1:5比例显示，保留胜利号、皇家主权号、布桑托尔号、可畏号、圣三位一体号、圣安娜号等关键舰，同时用普通同期战列舰侧影补足大舰队感。
- 阵营模型：英军普通舰、法国/西班牙普通舰使用同一套本地生成的船形侧视标记体系，以船体色、旗帜、徽标和标签区分；不再把博物馆照片块、局部模型照片或舰船图纸直接放进地图。
- 纳尔逊节点：约13:15 在胜利号上中弹，约16:30 死亡。动画把中弹位置与死亡时间分开标注。
- 损失口径：英军约449人阵亡、1241人受伤、无战列舰损失；法西约4400人阵亡、2500人受伤、约7000人被俘。舰船损失不同资料存在18艘、22艘等口径差异，动画面板采用“英0艘 / 法西约18艘”，并在事件正文说明口径差异。
- 风向：以轻风、西北偏西的态势提示来解释双方接近速度慢、队列变形；这是动画辅助层，不做逐分钟航海气象模拟。

## 主要参考

- Royal Museums Greenwich, `Battle of Trafalgar`：用于核对 1805-10-21 日期、英军27艘对法西33艘、纳尔逊受伤/死亡叙事，以及双方伤亡与被俘数字口径：<https://www.rmg.co.uk/stories/topics/battle-of-trafalgar>
- Royal Navy Museums, `Trafalgar Day: The Battle of Trafalgar`：用于交叉核对纳尔逊战法、英军两纵队突破和战斗纪念叙事：<https://www.royalnavymuseums.org.uk/news/trafalgar-day-battle-trafalgar>
- Royal Museums Greenwich collection, `Plan of the Battle of Trafalgar`：用于核对特拉法尔加外海战术图、舰队线列与风向/态势图口径：<https://www.rmg.co.uk/collections/objects/rmgc-object-112933>

## 建模说明

- 动画不是逐舰还原33对27全部战列舰，而是用具名旗舰和普通舰模型表达队列密度、突破方向和混战拥挤程度。
- 英军两纵队分为纳尔逊纵队与科林伍德纵队，各显示7艘左右；法西联合舰队分中央长列与后卫迟缓转向两段，共显示15艘左右。
- 12:10 皇家主权号单独突破，13:00 胜利号切入布桑托尔号与可畏号之间，13:15 纳尔逊中弹，14:30 后进入路线短促、交叉的混战表现。
- 视觉层用不同徽标、路线颜色、船体色和旗帜区分英国、法国、西班牙；旗舰靠具名标签和轻微放大高亮识别，避免照片式舰船图与统一地图标记混杂。

## 资产来源

- 地图标记：`scripts/generate-trafalgar-ship-assets.mjs` 生成六个 900 x 360 透明 WebP：`trafalgar-hms-victory.webp`、`trafalgar-royal-sovereign.webp`、`trafalgar-bucentaure.webp`、`trafalgar-santisima-trinidad.webp`、`trafalgar-british-line.webp`、`trafalgar-french-line.webp`。
- 视觉参考：Wikimedia Commons / RMG 的胜利号、皇家主权号、布桑托尔号、圣三位一体号、英国战列舰模型、法国74炮舰船体模型源文件仍保留在 `public/assets/unit-icons/source/trafalgar/`，但不再直接裁成地图图标。
- 资产授权：最终地图标记为本地 SVG 绘制后导出的透明 WebP；保留的参考图授权风险集中记录在 `docs/sources/unit-icons.md`。
- 背景配乐：`public/audio/wikimedia-rule-britannia.ogg`，来源见 `docs/sources/audio.md`。
