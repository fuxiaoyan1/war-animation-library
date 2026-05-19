# 三次布匿战争资料与口径来源

本动画是教学型全景可视化，不复刻任何视频或地图素材。事件、路线和镜头范围写入 `src/data/punicWars.ts`，地图由 `world-atlas` 国家边界和真实经纬度投影生成。

## 主要史料入口

- Encyclopaedia Britannica, `Punic Wars`：用于校准三次布匿战争的总体分期、罗马与迦太基争霸和最终结果。<https://www.britannica.com/event/Punic-Wars>
- Encyclopaedia Britannica, `First Punic War`：用于校准西西里战场、罗马造舰、米莱与战争收束。<https://www.britannica.com/event/First-Punic-War>
- Encyclopaedia Britannica, `Second Punic War`：用于校准汉尼拔从伊比利亚、阿尔卑斯到意大利作战，以及罗马转入反攻。<https://www.britannica.com/event/Second-Punic-War>
- Encyclopaedia Britannica, `Battle of Cannae`：用于校准 `BCE-0216-08-01` 坎尼会战及双重包围的战术意义。<https://www.britannica.com/event/Battle-of-Cannae>
- Encyclopaedia Britannica, `Third Punic War`：用于校准 `BCE-0149` 至 `BCE-0146` 围攻迦太基和迦太基国家灭亡。<https://www.britannica.com/event/Third-Punic-War>

## 当前动画事件口径

- `BCE-0264-01-01` 第一次布匿战争：墨西拿危机。
- `BCE-0262-01-01` 西西里第2次作战：阿格里真托。
- `BCE-0260-01-01` 海上第1次作战：米莱。
- `BCE-0241-01-01` 第一次布匿战争结束。
- `BCE-0219-01-01` 第二次布匿战争：萨贡托。
- `BCE-0218-01-01` 汉尼拔越过阿尔卑斯。
- `BCE-0218-12-01` 意大利第1次作战：特雷比亚。
- `BCE-0217-06-01` 意大利第2次作战：特拉西梅诺。
- `BCE-0216-08-01` 意大利第3次作战：坎尼。
- `BCE-0211-01-01` 意大利第4次作战：罗马消耗反击。
- `BCE-0209-01-01` 伊比利亚第2次作战：新迦太基。
- `BCE-0207-01-01` 梅陶罗河阻援。
- `BCE-0202-01-01` 非洲第1次作战：扎马。
- `BCE-0149-01-01` 第三次布匿战争：围攻开始。
- `BCE-0146-01-01` 迦太基陷落。

## 可视化取舍

- 全片按 5 分钟设计，历史时间跨度约 118 年，播放速度由 `CampaignMapAnimation.playbackDurationSeconds=300` 控制。
- 项目内部使用 `BCE-YYYY-MM-DD` 表示公元前日期，避免浏览器 `Date` 对负年份和 0 年处理不一致。
- 罗马和迦太基两方使用独立阵营语义，样式上复用通用推进线、方向虚点、移动单位和战役爆炸效果。
- 西西里、意大利、伊比利亚和非洲都存在多轮作战，本动画统一用“区域 + 第N次作战”标注，避免同一区域拉锯路线堆叠成乱线。
- 海上作战路线使用近岸海域 waypoint，不直接用港口到港口的直线跨越陆地；米莱-埃克诺穆斯路线绕西西里北岸和西南近海绘制，船标在海上段移动，完成后不长期停在陆地港口上。
- 古代战斗节点统一使用刀剑/接舷格斗音效，覆盖西西里陆战、海战、汉尼拔意大利会战、伊比利亚反攻、扎马、第三次布匿战争围城与迦太基陷落。
