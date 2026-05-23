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
- “无护航深袭的代价”用损失带、德机截击线、高炮阵地点、掉队轰炸机返航线和 1944 年远程护航线做对照，避免只靠事件文字说明。`deep-escort-lesson` 调整到 2月21日12:00，确保轰炸机、德机、高炮带和掉队返航线在同一窗口内对上。
- 2月20日开场拆成“出动集结”和“目标区攻击”：`argument-sortie-begins` 不播放爆炸，`operation-argument-start` 在轰炸机流抵达莱比锡方向后触发目标区战斗节点。
- 2026-05-23 复核后，`operation-argument-start` 调整到 `1944-02-20T12:05`，此时 `argument-first-wave` 插值位置贴近莱比锡；该节点加入 `cueEventIds`，并通过 `cueEventKinds["operation-argument-start"] = "bombing"` 触发轰炸音效。浏览器烟测点击该事件会校验爆炸音确实播放。
- 2月24日补充 `feb-24-industrial-strike`、`feb-24-escort-cover`、`feb-24-luftwaffe-defense`，让 `aircraft-industry-targets` 发生时画面上有轰炸机、护航机和德机防空同窗活动。
- 空战不再使用舰炮式集火/齐射线；`aircraft-industry-targets` 只通过目标区事件音效触发 `bombing` 爆炸+飞机声。不能让飞机未到目标区时提前显示攻击线，也不能把空中混战画成射击线。
- 2月25日 `berlin-feint-and-return` 不再飞到柏林边缘，也不触发 `argument-outcome` 爆炸音；终幕是远程返航分散和制空权结果展示，不是新一轮不明轰炸。
- 航迹通过 `visibleUntil` 保留到片尾，飞机图标通过 `unitVisibleUntil` 在任务结束后退出，体现空战密集航迹而非飞机长期驻留。
