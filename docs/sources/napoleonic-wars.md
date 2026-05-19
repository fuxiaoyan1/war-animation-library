# 拿破仑争战史资料与口径来源

本动画是教学型全景可视化，不复刻任何视频或地图素材。事件、路线和镜头范围写入 `src/data/napoleonicWars.ts`，地图由 `world-atlas` 国家边界和真实经纬度投影生成。

## 主要史料入口

- Encyclopaedia Britannica, `Napoleonic Wars`：用于校准法国革命战争后期到 1815 年滑铁卢之间的大战争框架、反法联盟与欧洲秩序变化。<https://www.britannica.com/event/Napoleonic-Wars>
- Encyclopaedia Britannica, `Napoleon I`：用于校准拿破仑从意大利战役、埃及远征、雾月政变到帝国统治与最终失败的主线。<https://www.britannica.com/biography/Napoleon-I>
- Encyclopaedia Britannica, `Battle of Austerlitz`：用于校准 `1805-12-02` 奥斯特里茨会战和第三次反法联盟瓦解。<https://www.britannica.com/event/Battle-of-Austerlitz>
- Encyclopaedia Britannica, `Peninsular War`：用于校准 `1808` 起西班牙、葡萄牙和英国介入后对法国帝国的长期消耗。<https://www.britannica.com/event/Peninsular-War>
- Encyclopaedia Britannica, `Battle of Waterloo`：用于校准 `1815-06-18` 滑铁卢会战及拿破仑战争终局。<https://www.britannica.com/event/Battle-of-Waterloo>

## 当前动画事件口径

- `1796-03-27` 意大利第1次作战开始。
- `1797-01-14` 意大利第2次作战：里沃利。
- `1798-07-21` 埃及远征与金字塔战役。
- `1799-11-09` 雾月政变。
- `1805-12-02` 奥斯特里茨会战。
- `1806-10-14` 耶拿-奥尔施泰特。
- `1807-06-14` 波兰第1次作战：弗里德兰。
- `1808-05-02` 伊比利亚第1次作战爆发。
- `1809-07-06` 奥地利第2次作战：瓦格拉姆。
- `1812-09-14` 俄国作战：进入莫斯科。
- `1813-10-19` 德意志第1次作战：莱比锡。
- `1814-04-11` 首次退位与厄尔巴岛。
- `1815-06-18` 百日王朝与滑铁卢。

## 可视化取舍

- 全片按 5 分钟设计，历史时间跨度约 19 年，播放速度由 `CampaignMapAnimation.playbackDurationSeconds=300` 控制。
- 战区移动较大，动画采用中欧、地中海、俄国和滑铁卢终局四类镜头切换。
- 同一地区反复作战不重复画满拉锯线，而用“意大利第1次作战”“意大利第2次作战”“伊比利亚第1次作战”“伊比利亚第2次作战”等标签分层。
- 路线表达的是战略轴线，不代表每日阵地线或完整部队序列。
