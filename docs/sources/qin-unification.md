# 大秦统一中国战史资料来源

## 采用口径

- 动画聚焦公元前 230-221 年秦灭六国的连续作战，而不是秦国长期崛起全史。
- 战国都城、战场和河流坐标按现代地名近似定位，主要服务于态势线和战区视窗。
- 使用 `BCE-YYYY-MM-DD` 内部日期，避免浏览器负年份日期问题。

## Sources

- Encyclopaedia Britannica, "Qin dynasty": https://www.britannica.com/topic/Qin-dynasty
- Encyclopaedia Britannica, "Qin Shi Huang": https://www.britannica.com/biography/Qin-Shi-Huang
- World History Encyclopedia, "Qin Dynasty": https://www.worldhistory.org/Qin_Dynasty/
- World History Encyclopedia, "Warring States Period": https://www.worldhistory.org/Warring_States_Period/
- Visual and topology reference for the seven-state historical map: Wikimedia Commons, "Warring States c. 250 BC.svg": https://commons.wikimedia.org/wiki/File:Warring_States_c._250_BC.svg

## Notes

- 关键锚点：前 230 灭韩、前 228 破赵、前 225 灭魏和李信伐楚受挫、前 223 灭楚、前 222 燕代终局、前 221 灭齐。
- 李信伐楚受挫作为反向态势线处理，避免把统一战争呈现成无阻力推进。
- 大秦背景不再使用独立装饰 SVG 贴图。七国边界参考 Wikimedia Commons 的战国约前 250 年地图形态后，重绘为 `historicalRegions` 经纬多边形，并与路线、城市点、河流共用 `createCampaignProjection`，防止城市/路线和底图错位。
- 七国区域必须是拓扑拼接：相邻国家复用同一组边界折线节点，不能用互相覆盖的透明色块模拟疆域。Playwright 回归用 `SVGGeometryElement.isPointInFill` 检查咸阳、阳翟、邯郸、大梁、寿春、蓟城、临淄等关键点只落入一个基础国家填充。
- 咸阳必须落在秦国填充区域内；后续韩、赵、魏等被秦攻灭后，要以 `captureDate` 叠加秦控制区，避免后续路线看起来从六国原境内“凭空出发”。
- 该区域层是历史动画用近似边界，不作为精密 GIS 边界；优先保证战国七国相对方位、都城位置、作战路线起点和视觉叙事一致。
