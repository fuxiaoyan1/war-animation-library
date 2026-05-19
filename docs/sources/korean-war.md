# 抗美援朝战争动画来源

## 结构化节点

- Britannica, `Korean War`: <https://www.britannica.com/event/Korean-War>
  - 用途：核对 1950 年 6 月 25 日战争爆发、仁川登陆、战线往返与 1953 年 7 月 27 日停战协定等主线时间。
- U.S. Army Center of Military History, Korean War campaign/history pages: <https://history.army.mil/html/bookshelves/resmat/korean-war/index.html>
  - 用途：核对美军/联合国军视角下的釜山防御圈、仁川、长津湖、1951 年春季攻防与阵地战脉络。
- National Museum of the U.S. Air Force, Korean War / MiG Alley references: <https://www.nationalmuseum.af.mil/>
  - 用途：核对 F-86 Sabre 与 MiG-15 相关喷气空战语境，动画飞机图标采用 1950 年代喷气机，不使用 F-16。
- Naval History and Heritage Command, Korean War naval aviation/carrier history pages: <https://www.history.navy.mil/>
  - 用途：核对朝鲜战争中美国海军航母航空兵和两栖支援语境；动画使用 Essex-class 风格航母，不使用现代 Nimitz。

## 动画建模取舍

- 本片标题沿用用户用语“抗美援朝战争”，叙事节点覆盖更广义 Korean War 主线：朝鲜人民军南进、联合国军介入、仁川登陆、中国人民志愿军入朝、长津湖、汉城拉锯、第五次战役、喷气空战、上甘岭与停战。
- 全片固定 `playbackDurationSeconds={300}`，并启用 `timingMode="compressed"`。1951 年 7 月谈判开始后的长空档通过 `gapOverrides` 压缩，避免停战谈判期占用大量无动作时间。
- 海上/空中路线必须显式设置 `routeKind`：
  - 仁川登陆：`routeKind="sea"` + `unitIcon="carrierEssex"`。
  - 米格走廊：`routeKind="air"` + `unitIcon="sabre"`。
  - 地面推进：步兵和 1950 年代坦克图标，不复用海湾战争 F-16 或现代主战坦克语义。

## 视觉与音频

- 专用图标来源与处理见 `docs/sources/unit-icons.md`。
- 背景配乐使用 `public/audio/wikimedia-holst-jupiter.ogg`，来源和本地校验见 `docs/sources/audio.md`。该曲未被其他战争动画使用，满足系列配乐不重复规则。
