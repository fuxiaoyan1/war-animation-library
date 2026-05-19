# 苏德战争资料与口径来源

本动画是教学型全景可视化，不复刻任何视频或地图素材。事件、路线和镜头范围写入 `src/data/easternFront.ts`，地图由 `world-atlas` 国家边界和真实经纬度投影生成。

## 主要史料入口

- Encyclopaedia Britannica, `Eastern Front`：用于校准东线主线分段。页面把东线界定为 `1941-06-22` 至 `1945-05-08`，并按巴巴罗萨、莫斯科、冬季反攻、高加索、斯大林格勒、库尔斯克、第聂伯、波兰/罗马尼亚、维斯瓦、匈牙利、奥得河和柏林组织叙事。<https://www.britannica.com/event/Eastern-Front-World-War-II>
- United States Holocaust Memorial Museum, `Operation Barbarossa`：用于校准德国入侵苏联的起始日期、规模和战争性质。<https://encyclopedia.ushmm.org/content/en/article/operation-barbarossa>
- Encyclopaedia Britannica, `Battle of Stalingrad`：用于校准斯大林格勒城市战、天王星行动和 `1943-02-02` 投降节点。<https://www.britannica.com/event/Battle-of-Stalingrad>
- Encyclopaedia Britannica, `Battle of Kursk`：用于校准 `1943-07` 库尔斯克会战及其作为德军战略攻势终点的表述。<https://www.britannica.com/event/Battle-of-Kursk>
- Encyclopaedia Britannica, `Battle of Berlin`：用于校准 `1945-04-16` 柏林战役开始、`1945-05-02` 柏林守军投降等终局节点。<https://www.britannica.com/event/Battle-of-Berlin>

## 当前动画事件口径

- `1941-06-22` 巴巴罗萨行动爆发。
- `1941-07-10` 明斯克至斯摩棱斯克合围阶段。
- `1941-09-08` 列宁格勒围困形成。
- `1941-09-26` 基辅大合围结束。
- `1941-12-05` 莫斯科城下苏军反攻。
- `1942-06-28` 蓝色方案启动。
- `1942-09-13` 斯大林格勒巷战白热化。
- `1942-11-19` 天王星行动合围第6集团军。
- `1943-02-02` 斯大林格勒德军投降。
- `1943-07-05` 库尔斯克会战。
- `1943-11-06` 第聂伯河与基辅解放。
- `1944-06-22` 巴格拉季昂行动。
- `1944-08-02` 苏军抵达华沙附近和维斯瓦河一线。
- `1944-08-23` 罗马尼亚转向与巴尔干震荡。
- `1945-01-12` 维斯瓦-奥得攻势。
- `1945-04-16` 柏林战役开始。
- `1945-05-02` 柏林守军投降。
- `1945-05-09` 德国无条件投降在莫斯科时间生效。本动画按中国语境常用的 5 月 9 日胜利日收束；若按西欧日期，可视为 `1945-05-08`。

## 可视化取舍

- 东线跨度很大，动画使用六段投影镜头：开战全局、南线、斯大林格勒、中段反攻、柏林终局。
- 路线表达的是战役轴线和阶段性方向，不代表每日前线或完整部队战斗序列。
- 德军进攻保留坦克引导图标；苏军反攻使用红金色细线和箭头，避免粗线遮挡城市标签。
