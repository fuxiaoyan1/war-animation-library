# 日俄对马海战动画来源

## 采用口径

- 时间范围：1905-05-27 12:00 至 1905-05-28 12:00。清晨 04:45 的信浓丸接触作为开场背景写入事件说明，但不占用实际播放空档。
- 视窗：以对马海峡为主，重点展示俄舰队北上、日本联合舰队从佐世保方向截击、东乡转向、T字炮战、夜间雷击和残部投降。
- 时间粒度：短战争不用周粒度，数据使用 `YYYY-MM-DDTHH:mm`，组件以小时级进度显示。
- 图标：使用近代战列舰写实图标 `warship`，不复用古代帆船；主力舰按具名编队标注，日本侧显示三笠、敷岛、富士、朝日，俄方初期显示苏沃洛夫、奥斯利亚比亚、亚历山大三世、博罗季诺，前导崩溃后改为亚历山大三世、博罗季诺、鹰号、尼古拉一世领队序列，后段再改显示俄残部与夜战舰艇队。
- 战术走位：不把对马海战简化成“日军尾随俄军追击”。动画采用侦察接触、东乡回头转向、第一合战、俄前导/旗舰失控、第二合战、夜间鱼雷攻击、拂晓包围投降的分段模型。

## 主要参考

- Britannica, `Battle of Tsushima`, 用于确认海战日期为 1905 年 5 月 27-28 日，以及日俄战争中的决定性海军会战定位：<https://www.britannica.com/event/Battle-of-Tsushima>
- Society for Nautical Research / The Mariner's Mirror Podcast, `Great Sea Fights: The Battle of Tsushima, Part 1 - The Events`, 用于补充战术细节：信浓丸 04:45 发现并无线电报告、俄舰队两列北上、日舰从东北/东侧横切、东乡回头转向、日军利用约 16 节对俄约 9 节的速度优势两次横切、奥斯利亚比亚沉没/苏沃洛夫号失控、夜间鱼雷艇攻击、28 日近竹岛残部投降：<https://snr.org.uk/the-mariners-mirror-podcast/great-sea-fights-3-the-battle-of-tsushima-part-1/>
- U.S. Naval Institute, `The First Naval Battle of the 21st Century`, 用于核对对马海峡路线选择、日军侦察与无线电、东乡转向到俄舰队星board侧并 crossing the T、俄舰队因低速和载煤难以协同、夜间驱逐舰/鱼雷艇清理分散残部：<https://www.usni.org/magazines/naval-history-magazine/2022/february/first-naval-battle-21st-century>
- Wikipedia, `Battle of Tsushima`, 用于交叉核对俄国第二太平洋舰队、东乡平八郎、日本联合舰队、对马海峡、5 月 27-28 日战斗过程与结果概述：<https://en.wikipedia.org/wiki/Battle_of_Tsushima>
- Mikasa Historic Memorial Warship, `Battle of the Sea of Japan`, 用于核对日本侧纪念舰叙述中的东乡舰队与会战位置口径：<https://kinenkan-mikasa.or.jp/en/mikasa/battle_of_soj.html>

## 资产来源

- `public/assets/unit-icons/warship.webp` 源自 Wikimedia Commons 文件 `Japanese battleship Mikasa.jpg`，裁切为三笠舰航行态侧视图标：<https://commons.wikimedia.org/wiki/File:Japanese_battleship_Mikasa.jpg>
- `public/audio/wikimedia-hands-across-the-sea.ogg` 源自 Wikimedia Commons `Hands Across the Sea`，用于对马海战独立背景配乐，避免与其他动画重复。

## 建模说明

- 小时点位是动画叙事锚点，不做逐分钟航海模拟；路线用于表达战术几何关系。经用户指出“前奏太长、俄军似乎已经越过日舰航线、按态势图日军追不上俄军”后，播放轴改为 12:00 即显示舰队，路线重建为俄舰队仍在西南/南侧北上，日军从东侧抢到前导侧前方并多次横切，而非尾随追击。
- 编队偏移使用航向坐标而非屏幕上下坐标：`offset[0]` 表示沿航线前后，`offset[1]` 表示左右列距离。这样舰标会按实际航行队列展开，不随地图方向变成固定上下堆叠。
- 舰队编队不是整片平移：每艘舰使用自己的 `offset[0]` 折算为航线进度，沿同一航迹鱼贯行进；若落后量超过当前进度，舰仍保留在起点后方延伸线上，避免开场挤成一片。
- 航迹点位必须在水域中行进。日本舰队不再从佐世保陆地点直接画出，而从 `佐世保外海` 集合点进入海峡；回归测试会采样可见海上航迹，确认不落入日韩陆地填充。
- 舰队换段时旧航迹可作为态势保留，但旧航迹上的移动舰标必须在下一段开始前清除；回归测试按关键事件检查当前可见舰队段，避免同一舰队看起来分裂成两支。
- 黑色主战区椭圆会遮挡海峡战术走位，已删除 `sea-zone` 地形椭圆；以路线、节点和标签表达主战区。
- 俄舰队失败单位按韩战规则处理：白天前导崩溃后 `russian-night-approach`、`russian-column-north`、`russian-flagship-chaos`、`russian-breakout-scatter` 的移动单位逐步退场，残部在 1905-05-28 10:30 投降节点退场；路线可短暂保留作态势背景。
- 对马海战战术走位复杂，地图不扩展到旅顺、海参崴或整个东北亚，以免压缩海峡内的舰队机动。
