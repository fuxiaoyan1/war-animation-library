# Disclaimer / 免责声明

This project is an open-source historical animation library for learning, research, and technical experimentation. The maintainers love peace and oppose war. The animations are not intended to glorify violence, promote militarism, incite hatred, or endorse any political, military, ethnic, national, religious, or ideological position.

本项目是用于学习、研究和技术实验的开源历史动画项目。我们热爱和平，反对战争。本项目不美化战争，不宣扬军事扩张，不煽动仇恨，也不代表对任何政治、军事、民族、国家、宗教或意识形态立场的背书。

## Historical Information

- Each animation is based on public historical materials, secondary references, maps, audio notes, image notes, and project-specific source logs under `docs/sources/`.
- Dates, locations, routes, troop relationships, camera choices, and event sequencing are simplified and compressed for interactive visualization.
- Some ancient or contested events have uncertain chronology, geography, numbers, and interpretation. The project may include approximations or narrative reconstructions when sources disagree or are incomplete.
- The content is provided for educational and demonstration purposes only. It is not professional historical, academic, legal, political, military, or cartographic advice.
- Users should verify important facts against primary sources, academic publications, archives, and other authoritative references before relying on them.

## Source Websites / 信息来源网站

The external source websites currently recorded by the repository are listed below. Complete page-level links, attribution notes, uncertainty notes, and license caveats are maintained in [SOURCE_INDEX.md](SOURCE_INDEX.md), `NOTICE.md`, and `docs/sources/*`.

以下为当前仓库来源记录中已经挂出的外部来源网站入口。逐条页面链接、署名、资料不确定性和许可风险，以 [SOURCE_INDEX.md](SOURCE_INDEX.md)、`NOTICE.md` 和 `docs/sources/*` 为准。

Historical and institutional references:

- [中国哲学书电子化计划](https://ctext.org/), [固镇县人民政府](https://www.guzhen.gov.cn/), [中国军网](https://www.81.cn/), [华夏经纬网](https://www.huaxia.com/), [Berkshire Publishing](https://www.berkshirepublishing.com/)
- [Encyclopaedia Britannica](https://www.britannica.com/), [World History Encyclopedia](https://www.worldhistory.org/), [Livius](https://www.livius.org/), [United States Holocaust Memorial Museum Encyclopedia](https://encyclopedia.ushmm.org/), [Wikipedia](https://en.wikipedia.org/)
- [U.S. Army Center of Military History](https://history.army.mil/), [U.S. Naval History and Heritage Command](https://www.history.navy.mil/), [U.S. Department of Defense](https://www.defense.gov/), [Air Force Historical Support Division](https://www.afhistory.af.mil/), [U.S. Marine Corps](https://www.marines.mil/), [Army University Press](https://www.armyupress.army.mil/)
- [National WWII Museum](https://www.nationalww2museum.org/), [Imperial War Museums](https://www.iwm.org.uk/), [National Museum of the Royal Navy](https://www.nmrn.org.uk/), [Royal Museums Greenwich](https://www.rmg.co.uk/), [Royal Navy Museums](https://www.royalnavymuseums.org.uk/)
- [Royal Air Force](https://www.raf.mod.uk/), [RAF Museum](https://www.rafmuseum.org.uk/), [Australian War Memorial](https://www.awm.gov.au/), [Royal Australian Air Force](https://www.airforce.gov.au/), [National Museum of the U.S. Air Force](https://www.nationalmuseum.af.mil/)
- [Uboat.net](https://uboat.net/), [Society for Nautical Research](https://snr.org.uk/), [U.S. Naval Institute](https://www.usni.org/), [Mikasa Historic Memorial Warship](https://kinenkan-mikasa.or.jp/), [Harry S. Truman Library](https://www.trumanlibrary.gov/)
- [Newton](https://www.newton.com.tw/), [Line of Departure](https://www.lineofdeparture.army.mil/)

Maps, terrain, software, and fonts:

- [MapLibre](https://maplibre.org/), [AWS Terrain Tiles Registry](https://registry.opendata.aws/terrain-tiles/), [Esri World Imagery](https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer), [ZeoSeven Fonts](https://fonts.zeoseven.com/), [ZeoSeven Fonts API](https://fontsapi.zeoseven.com/)

Media, audio, and asset traceability:

- [Wikimedia Commons](https://commons.wikimedia.org/), [Wikimedia upload CDN](https://upload.wikimedia.org/), [Project Gutenberg](https://www.gutenberg.org/), [FiftySounds](https://www.fiftysounds.com/), [Directory.Audio](https://directory.audio/), [Chinese Music World](https://chinesemusicworld.com/), [PNGIMG](https://pngimg.com/), [PNG素材网](https://www.pngsucai.com/), [PurePNG](https://purepng.com/), [Baidu image host](https://img2.baidu.com/)

Inclusion here does not imply affiliation, endorsement, sponsorship, accuracy guarantee, or permission to redistribute linked third-party materials.

## Copyright and Third-Party Materials

- Source code in this repository is released under the MIT License unless a file states otherwise.
- Media assets, map tiles, audio recordings, images, fonts, and derived unit markers are not automatically MIT licensed. They may have different terms, including public domain, CC0, Creative Commons attribution, non-commercial restrictions, source-specific permissions, or unresolved redistribution status.
- Source and attribution notes are maintained on a best-effort basis in [SOURCE_INDEX.md](SOURCE_INDEX.md), `NOTICE.md`, and `docs/sources/*`.
- The maintainers do not claim ownership of third-party historical materials, source excerpts, map data, recordings, imagery, icons, or names referenced by the project.
- If any file, asset, attribution, or historical description appears to infringe rights or misstate source terms, please open an issue or contact the maintainers. We will review and, where appropriate, correct attribution, replace the material, or remove it.

## Non-Commercial Intent

The maintainers publish this project as an open-source, non-commercial educational and technical work. The repository is not built to sell historical media, monetize conflict, or commercially exploit third-party materials. This statement describes project intent and does not override the MIT License for code or the separate license terms of third-party assets.

## No Affiliation or Endorsement

The project is not affiliated with, endorsed by, sponsored by, or officially connected to any government, military organization, archive, museum, publisher, recording owner, map provider, software vendor, or historical institution unless explicitly stated in a source note.

## No Warranty

The project is provided "as is", without warranty of any kind. The maintainers make no guarantees about historical completeness, factual accuracy, geographic precision, asset licensing completeness, software availability, fitness for a particular purpose, or non-infringement. Use, redistribution, modification, and interpretation are at the user's own risk.

## Required Practice for Future Updates

For every new animation, and for every old animation whose information sources, media assets, or historical interpretation materially change:

- Update the relevant `docs/sources/*` file.
- Update [SOURCE_INDEX.md](SOURCE_INDEX.md) when a new source website is added or an old one is removed.
- Keep this disclaimer linked from the README and NOTICE.
- Mention source or licensing changes in the update note or release/PR description.
- Re-run the project validation gates before pushing.
