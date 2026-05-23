# 日德兰海战资料口径

## 动画范围

- 时间范围：1916-05-31 14:20 至 1916-06-01 03:30。
- 空间范围：北海、日德兰半岛以西、英国大舰队与德国公海舰队接触海域。
- 动画目标：压缩呈现大舰队会战的决策链：侦察接触、南向追逐、北向引诱、Jellicoe 展开、Scheer 全舰队转向、夜间撤离。

## 主要来源

- Imperial War Museums, `Battle of Jutland Timeline`：<https://www.iwm.org.uk/history/battle-of-jutland-timeline>
- Imperial War Museums, `What Was The Battle Of Jutland?`：<https://www.iwm.org.uk/history/what-was-the-battle-of-jutland>
- National Museum of the Royal Navy, `The Battle of Jutland`：<https://www.nmrn.org.uk/exhibitions-projects/jutland-1916>

## 数据处理说明

- 舰队位置为面向动画的近似坐标，用来表达航向、展开与相对战术态势，不作为精确舰位图。
- `Queen Mary` 在 1916-05-31 16:26 后从英战列巡洋舰队列隐藏，表现战列巡洋舰损失和队形缺口。
- `Queen Mary` 爆炸点不作为 Beatty 全队北转点。按 IWM 时间线，Goodenough 在 16:38 报告发现德军战列舰队，Beatty 在 16:40 后开始 “Run to the North”；动画把单舰损失点和舰队北转点拆成两个节点，避免英舰从德舰后方突然穿越。
- 同理，`Queen Mary` 爆炸点不作为 Hipper 侦察群后续北返接续点。动画为德军侦察群单独设置 `hipper-south-turn`，让南向追逐和北返掩护从同一德军航列位置连续接续，爆炸点只作为英舰损失事件点。
- `cueEventIds` 只覆盖战斗/机动冲突节点，夜间撤离作为收束节点不再触发新的炮声。
