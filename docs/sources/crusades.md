# 十字军东征资料与口径来源

本动画是教学型全景可视化，不复刻任何视频或地图素材。事件、路线和镜头范围写入 `src/data/crusades.ts`，地图由 `world-atlas` 国家边界和真实经纬度投影生成。

## 主要史料入口

- Encyclopaedia Britannica, `Crusades`：用于校准十字军运动的总体分期、第一次十字军、耶路撒冷、第三/第四次十字军和后期据点瓦解。<https://www.britannica.com/event/Crusades>
- Encyclopaedia Britannica, `Council of Clermont`：用于校准 `1095-11-27` 克莱蒙号召。<https://www.britannica.com/event/Council-of-Clermont>
- Encyclopaedia Britannica, `Siege of Jerusalem`：用于校准 `1099-07-15` 第一次十字军攻陷耶路撒冷。<https://www.britannica.com/event/Siege-of-Jerusalem-1099>
- Encyclopaedia Britannica, `Battle of Hattin`：用于校准 `1187-07-04` 哈丁会战和萨拉丁反攻。<https://www.britannica.com/event/Battle-of-Hattin>
- Encyclopaedia Britannica, `Fourth Crusade`：用于校准 `1204-04-13` 君士坦丁堡陷落与远征偏航。<https://www.britannica.com/event/Fourth-Crusade>

## 当前动画事件口径

- `1095-11-27` 克莱蒙号召。
- `1097-07-01` 尼西亚与多律莱乌姆。
- `1098-06-03` 安条克陷落。
- `1099-07-15` 耶路撒冷陷落。
- `1144-12-24` 埃德萨陷落。
- `1148-07-28` 第二次十字军大马士革失败。
- `1187-07-04` 哈丁会战。
- `1191-07-12` 第三次十字军夺取阿卡。
- `1204-04-13` 第四次十字军攻陷君士坦丁堡。
- `1250-04-06` 埃及作战受挫。
- `1291-05-18` 阿卡陷落。

## 可视化取舍

- 全片按 5 分钟设计，非作战间歇压缩到短过场，播放速度由 `CampaignMapAnimation.playbackDurationSeconds=300` 控制。
- 路线表达的是远征轴线和关键据点流向，不代表每日行军路线或完整围城序列。
- 古代/中世纪陆战使用骑兵图标与冷兵器音效；威尼斯至君士坦丁堡、阿卡至埃及使用海路和战船图标。
- 字幕采用半透明横向滚动 ticker，不接收鼠标事件，不遮挡地图主体。
