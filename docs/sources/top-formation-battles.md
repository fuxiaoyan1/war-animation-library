# 十大战役阵法动画资料与质量要求 / Top Formation-Battle Sources And Quality Requirements

本文件只保留十大战役候选、资料入口和动画质量要求。它不再记录具体制作方法、阶段拆分、组件路线、渲染器类型或执行顺序。任何候选战役真正开工前，必须重新建立独立来源文档和制作方案。

This file keeps only candidate battles, source leads, and animation quality requirements. It no longer records implementation methods, phase breakdowns, component paths, renderer types, or execution order. Before any candidate starts, create a fresh source note and production plan.

## 候选清单 / Candidate List

| Battle | Date | Source confidence note |
| --- | --- | --- |
| Waterloo / 滑铁卢 | 1815-06-18 | Battlefield geography is comparatively well documented. |
| Gaugamela / 高加米拉 | BCE-0331-10-01 | Exact battlefield location remains debated. |
| Pharsalus / 法萨卢斯 | BCE-0048-08-09 | Battlefield location is debated around Pharsalus/Palaepharsalus and the Enipeus plain. |
| Raphia / 拉菲亚 | BCE-0217-06-22 | Tactical micro-terrain should be treated as schematic. |
| Hydaspes / 海达斯佩斯 | BCE-0326-05/06 | Crossing and battle sites are debated. |
| Leuctra / 留克特拉 | BCE-0371 | Formation geometry is better supported than detailed terrain. |
| Agincourt / 阿金库尔 | 1415-10-25 | Tactical layout and stake arrangement remain debated. |
| Jingxing / 井陉 | BCE-0204 | Use pass/river/camp-relative geography with uncertainty. |
| Fei River / 淝水 | 383 | River course and tactical positions need specialist review. |

## Source Leads / 资料入口

- Waterloo: National Army Museum, Encyclopaedia Britannica, Wikimedia Commons map category.
- Gaugamela: Arrian excerpt, Encyclopaedia Britannica, World History Encyclopedia, Cambridge Core, Wikimedia Commons map category.
- Pharsalus: Caesar, World History Encyclopedia, Encyclopaedia Britannica.
- Raphia: Polybius, Livius.
- Hydaspes: World History Encyclopedia, Encyclopaedia Britannica, Livius.
- Leuctra: Xenophon, World History Encyclopedia, Encyclopaedia Britannica.
- Agincourt: Encyclopaedia Britannica, Historical Association, Musee de l'Armee, Battlefields Trust, Wikimedia Commons map category.
- Jingxing: `Shiji`, `Zizhi Tongjian`, Chinese Text Project.
- Fei River: `Zizhi Tongjian`, Wikisource, Chinese Text Project.
- Shared geography references: Natural Earth and OpenStreetMap.

## Quality Requirements / 质量要求

- Do not treat modern diagrams as facts. Use them only as references and verify claims against primary, institutional, or reputable secondary sources.
- Every battle must state uncertainty clearly before implementation.
- The battlefield must be readable at first glance, with the active combat area near the visual core.
- Unit assets must be era-specific, faction-distinct, transparent, and readable at map scale.
- Movement must preserve continuity: no teleporting, no unsupported crossing through intact formations, no sudden disappearance without a battle reason.
- Combat must show collision, pressure, collapse, pursuit, or withdrawal as appropriate, not parade-like synchronized movement.
- A tilted tactical camera may be reused as a design principle, but it must not carry over any deleted failed battle implementation.
- End states must preserve battlefield logic: victorious forces remain present, defeated forces break, scatter, compress, withdraw, or are otherwise explicitly accounted for.
- Automated gates only prevent regression. Visual review, source logic, and user-reported screenshots remain decisive.
