# Typography sources

## Sunzi seal-script motto

- Asset path: `public/assets/fonts/chongxi/`
- Font: Chong Xi Small Seal / 崇羲篆體
- Source: ZeoSeven Fonts API item 820, `https://fonts.zeoseven.com/items/820/`
- API CSS used for subset generation: `https://fontsapi.zeoseven.com/820/main/result.css`
- Upstream metadata in the generated CSS identifies the typeface as Academia Sinica Chong Xi Small Seal, version 1.00.

The project uses only a small WOFF2 subset needed for the fixed Sunzi motto banner. The normal text remains in the DOM for accessibility and tests, while CSS applies `ChongXiSmallSealSubset` to render the motto as seal script.

The motto uses the traditional original wording `孫子曰：兵者，國之大事，死生之地，存亡之道，不可不察也。`. The subset includes extra WOFF2 slices for `孫`, `國`, `道`, `始`, and related title glyphs so the browser does not silently fall back to a non-seal font for missing characters.
