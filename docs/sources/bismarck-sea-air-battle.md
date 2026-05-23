# 俾斯麦海海空战资料说明

## 主要资料

- Australian War Memorial, Battle of the Bismarck Sea background and skip-bombing accounts: <https://www.awm.gov.au/>
- Royal Australian Air Force historical material on the Battle of the Bismarck Sea: <https://www.airforce.gov.au/>
- National Museum of the United States Air Force / U.S. military historical material on low-level attack and skip bombing in March 1943: <https://www.nationalmuseum.af.mil/>

## 动画取舍

- 时间轴取 1943-03-01 08:00 至 1943-03-04 18:00，使用小时级时间轴。
- 组件启用 `timingMode="compressed"`，用于压缩夜间非作战空白；船队、侦察、攻击波和事件轨共用同一时间映射。
- 地图重点是拉包尔、俾斯麦海、维蒂亚兹海峡、莱城和新几内亚机场群。
- 船队用 3 个舰船图标表达运输船/护航舰的队形，盟军用高空轰炸机与低空攻击机波次表现高低空协同。
- 核心战术节点是侦察跟踪、高空轰炸迫使机动、B-25/A-20 低空扫射与跳弹轰炸、残余船队分散。
- 船队从 `rabaul-roadstead` 外海锚地出航，经新不列颠岛北侧和西侧外海 `waypoints` 绕行到 `convoy-breakup-sea`，不从拉包尔陆地点直接开出，也不穿越新不列颠岛或新几内亚陆地。侦察接触点发生时船队仍在海上移动，侦察机随后返航，不直接消失。
- 船队、高空轰炸和低空跳弹攻击必须在事件窗口同位：`coordinated-air-attack` 时高空机群从船队附近压过，`skip-bombing-breakup` 时低空攻击机群贴近船队瓦解海域，不能让两军态势线几乎对不上。
- 2026-05-23 复核后，`recon-contact` 的侦察接触区改为北侧船队实际插值位置，`coordinated-air-attack` 和 `skip-bombing-breakup` 的事件点改为船队与高空/低空机群同窗位置；`mopping-up` 改到 3月4日 11:30，让追击机群抵达残余船只后再返航。
- `bismarckSeaWide` 与 `bismarckSeaBattle` 视窗略微外扩，保证北侧侦察接触和 3月3日跳弹轰炸点都落在地图核心区，不因焦点切换把关键事件顶到画面边缘。
- 侦察机接触船队后沿航路返回 `dobodura`，高空轰炸机返回 `port-moresby`，低空攻击机和后续追击返回 `dobodura`；航空单位攻击后只退飞机图标，航迹保留到片尾。
- 高空轰炸和低空跳弹节点都不显示舰炮式跳弹/集火射击线。空战攻击用机群航迹同位、扫射/轰炸音效和船队瓦解路线表达；`skip-bombing-zone` 只作为战术位置点按 `revealAt` 延迟出现。
- 末段拆成 `mopping-up-strikes` 和 `mopping-up-return`，避免同一批飞机在地图上滞留过久，同时让15:00后的返航收束继续有动作。
