# 大周行动资料说明

## 主要资料

- National Museum of the United States Air Force, Big Week / Operation Argument fact material: <https://www.nationalmuseum.af.mil/>
- U.S. Air Force historical material on strategic bombing and long-range escort in 1944: <https://www.afhistory.af.mil/>
- National Museum of the United States Air Force, Schweinfurt-Regensburg mission background for the 1943 escort lesson: <https://www.nationalmuseum.af.mil/>

## 动画取舍

- 时间轴取 1944-02-20 至 1944-02-25，作为五分钟短片处理，不展开整个战略轰炸史。
- 组件启用 `timingMode="compressed"`，只压缩夜间和跨日非作战空白；事件、航线、特效和事件轨共用同一压缩时间线。
- 动画重点是“轰炸机流引出德国战斗机，再由远程护航机消耗德机”的制空权机制。
- 施韦因富特-雷根斯堡作为教训节点写入旁白和事件说明，但动画主线仍是 1944 年大周行动。
- 使用 B-17 编队、P-51/P-47 护航、Fw 190/Bf 109 截击的代表性图标，不按实际出动架次逐架绘制。
- 轰炸机、护航机和截击机都按出击波次处理：去程、接触/轰炸、返航或返场必须在同一条航迹中交代，不能抵达目标区后直接消失。
- “无护航深袭的代价”用损失带、掉队轰炸机返航线和 1944 年远程护航线做对照，避免只靠事件文字说明。
- 2月20日开场拆成“出动集结”和“目标区攻击”：`argument-sortie-begins` 不播放爆炸，`operation-argument-start` 在轰炸机流抵达莱比锡方向后触发目标区战斗节点。
- 2月24日补充 `feb-24-industrial-strike`、`feb-24-escort-cover`、`feb-24-luftwaffe-defense`，让 `aircraft-industry-targets` 发生时画面上有轰炸机、护航机和德机防空同窗活动。
- 轰炸效果只落在工业目标节点，使用 `big-week-industrial-bombing` / `big-week-brunswick-bombing`，并与点击事件的二战爆炸音效对齐。不能让飞机未到目标区时提前显示齐射/爆炸线。
- 航迹通过 `visibleUntil` 保留到片尾，飞机图标通过 `unitVisibleUntil` 在任务结束后退出，体现空战密集航迹而非飞机长期驻留。
