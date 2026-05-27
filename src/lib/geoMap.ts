import { geoMercator, geoPath, type GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryObject, Objects, Topology } from "topojson-specification";
import countriesTopology from "world-atlas/countries-50m.json";

export type CountryFeature = GeoJSON.Feature<GeoJSON.Geometry, { name?: string }>;

const viewports: Record<string, [[number, number], [number, number]]> = {
  north: [
    [-0.7, 48.0],
    [7.1, 52.9]
  ],
  france: [
    [-1.2, 44.4],
    [6.2, 50.2]
  ],
  armistice: [
    [1.0, 47.8],
    [5.8, 50.4]
  ],
  easternOpening: [
    [11.0, 43.5],
    [42.0, 61.6]
  ],
  easternVolga: [
    [20.0, 42.0],
    [50.5, 61.4]
  ],
  easternSouth: [
    [29.0, 42.4],
    [49.5, 52.8]
  ],
  easternStalingrad: [
    [31.0, 43.2],
    [49.5, 52.4]
  ],
  easternCentral: [
    [16.0, 44.0],
    [36.5, 59.8]
  ],
  easternBerlin: [
    [10.0, 47.0],
    [24.0, 55.6]
  ],
  europeWide: [
    [-10.5, 35.0],
    [42.0, 60.5]
  ],
  europeCentral: [
    [-2.0, 40.0],
    [24.5, 57.0]
  ],
  europeRussia: [
    [10.0, 45.0],
    [42.0, 59.5]
  ],
  britainAirWide: [
    [-2.6, 49.4],
    [2.6, 52.2]
  ],
  britainAirLondon: [
    [-0.65, 50.98],
    [1.05, 51.78]
  ],
  britainAirLondonClose: [
    [-0.52, 51.18],
    [0.78, 51.72]
  ],
  bigWeekWide: [
    [-1.0, 48.2],
    [16.0, 53.8]
  ],
  bigWeekGermany: [
    [4.8, 48.6],
    [14.9, 53.3]
  ],
  bismarckSeaWide: [
    [145.2, -10.6],
    [154.1, -0.8]
  ],
  bismarckSeaBattle: [
    [146.0, -7.8],
    [149.9, -4.6]
  ],
  bismarckSeaLae: [
    [145.95, -7.55],
    [148.6, -4.9]
  ],
  atlanticConvoyWide: [
    [-56.0, 47.0],
    [-4.0, 64.5]
  ],
  atlanticConvoyContact: [
    [-45.2, 50.8],
    [-41.2, 52.55]
  ],
  atlanticConvoyBattle: [
    [-43.6, 50.65],
    [-36.4, 53.55]
  ],
  atlanticConvoyAirCover: [
    [-39.5, 51.55],
    [-31.2, 55.0]
  ],
  atlanticConvoyEastern: [
    [-29.5, 52.55],
    [-22.2, 55.25]
  ],
  mediterranean: [
    [-8.0, 30.0],
    [31.0, 47.0]
  ],
  westernMediterranean: [
    [-7.0, 35.0],
    [19.0, 45.5]
  ],
  centralMediterranean: [
    [5.0, 31.0],
    [23.5, 43.5]
  ],
  easternMediterranean: [
    [22.0, 29.0],
    [44.5, 43.5]
  ],
  crusadesFirstCall: [
    [-5.0, 35.0],
    [35.0, 48.0]
  ],
  levant: [
    [29.0, 30.0],
    [41.0, 38.8]
  ],
  caesarWide: [
    [-9.5, 28.0],
    [32.0, 53.5]
  ],
  caesarGaul: [
    [-6.0, 42.0],
    [9.0, 53.5]
  ],
  caesarBritain: [
    [-6.5, 48.0],
    [3.0, 55.0]
  ],
  caesarItaly: [
    [5.0, 39.0],
    [16.0, 47.5]
  ],
  caesarWesternMediterranean: [
    [-7.5, 35.0],
    [12.5, 44.8]
  ],
  caesarGreece: [
    [13.0, 35.0],
    [24.5, 43.0]
  ],
  caesarAfrica: [
    [6.0, 29.0],
    [18.0, 39.0]
  ],
  caesarSpain: [
    [-8.0, 35.0],
    [2.0, 43.5]
  ],
  alexanderWide: [
    [18.0, 22.0],
    [78.0, 44.5]
  ],
  alexanderAegean: [
    [18.0, 34.0],
    [38.5, 42.5]
  ],
  alexanderLevantEgypt: [
    [27.0, 25.0],
    [42.0, 37.5]
  ],
  alexanderEgypt: [
    [24.5, 26.0],
    [36.5, 33.5]
  ],
  alexanderMesopotamia: [
    [35.0, 28.0],
    [51.0, 38.5]
  ],
  alexanderPersia: [
    [45.0, 25.0],
    [65.0, 39.0]
  ],
  alexanderCentralAsia: [
    [47.0, 31.0],
    [71.0, 42.0]
  ],
  alexanderIndus: [
    [63.5, 24.0],
    [78.5, 38.5]
  ],
  alexanderReturn: [
    [41.5, 22.5],
    [76.5, 38.5]
  ],
  alexanderIndia: [
    [58.0, 27.0],
    [77.0, 39.0]
  ],
  gulfWide: [
    [35.0, 21.0],
    [58.5, 36.8]
  ],
  gulfKuwait: [
    [43.8, 27.0],
    [49.8, 31.6]
  ],
  gulfIraq: [
    [37.5, 28.0],
    [49.5, 37.8]
  ],
  gulfGround: [
    [43.0, 26.6],
    [50.2, 32.4]
  ],
  koreaPeninsula: [
    [123.4, 33.0],
    [131.5, 42.9]
  ],
  koreaSouth: [
    [125.0, 34.3],
    [130.4, 38.8]
  ],
  koreaWestCoast: [
    [124.0, 36.0],
    [128.8, 39.8]
  ],
  koreaNorth: [
    [123.7, 37.0],
    [130.7, 41.6]
  ],
  koreaYalu: [
    [123.5, 38.8],
    [130.0, 42.8]
  ],
  koreaCentral: [
    [125.0, 37.0],
    [129.5, 39.4]
  ],
  koreaAirSea: [
    [123.0, 34.5],
    [130.8, 41.3]
  ],
  tsushimaStrait: [
    [128.05, 33.0],
    [130.9, 35.35]
  ],
  tsushimaBattle: [
    [128.72, 34.12],
    [130.48, 35.48]
  ],
  tsushimaNorth: [
    [129.12, 34.82],
    [131.32, 36.48]
  ],
  trafalgarApproach: [
    [-7.12, 35.72],
    [-6.28, 36.36]
  ],
  trafalgarBattle: [
    [-6.94, 35.88],
    [-6.46, 36.18]
  ],
  trafalgarBreakthrough: [
    [-6.89, 35.905],
    [-6.47, 36.185]
  ],
  trafalgarMelee: [
    [-6.82, 35.98],
    [-6.55, 36.11]
  ],
  trafalgarDecision: [
    [-6.79, 36.01],
    [-6.54, 36.13]
  ],
  trafalgarAftermath: [
    [-6.76, 36.0],
    [-6.45, 36.17]
  ],
  guadalcanalIronbottom: [
    [159.28, -9.76],
    [160.42, -8.72]
  ],
  guadalcanalSavoNight: [
    [159.66, -9.48],
    [160.18, -8.98]
  ],
  guadalcanalRadarAction: [
    [159.58, -9.34],
    [159.96, -8.96]
  ],
  guadalcanalWithdrawal: [
    [159.28, -9.5],
    [160.16, -8.68]
  ],
  jutlandWide: [
    [-3.8, 55.35],
    [8.9, 59.2]
  ],
  jutlandRunSouth: [
    [4.8, 55.56],
    [6.35, 56.72]
  ],
  jutlandRunNorth: [
    [5.05, 55.82],
    [6.45, 56.86]
  ],
  jutlandMainBattle: [
    [5.35, 55.82],
    [6.55, 56.86]
  ],
  jutlandNightEscape: [
    [5.72, 55.62],
    [7.05, 56.42]
  ],
  midwayTactical: [
    [177.85, 29.72],
    [185.75, 32.55]
  ],
  mongolWide: [
    [28.0, 22.0],
    [134.0, 56.0]
  ],
  mongolCentralAsia: [
    [45.0, 30.0],
    [98.0, 52.0]
  ],
  mongolChina: [
    [95.0, 18.0],
    [126.0, 47.0]
  ],
  mongolSouthChina: [
    [104.0, 18.0],
    [123.0, 33.5]
  ],
  mongolWest: [
    [30.0, 32.0],
    [62.0, 52.0]
  ],
  chinaWarringStates: [
    [101.0, 21.0],
    [123.0, 42.5]
  ],
  chinaGuanzhong: [
    [103.0, 28.0],
    [116.0, 39.5]
  ],
  chinaGuanzhongExpanded: [
    [101.0, 26.2],
    [118.2, 40.8]
  ],
  chinaEast: [
    [112.0, 27.5],
    [122.5, 39.5]
  ],
  chinaEastExpanded: [
    [107.6, 25.8],
    [124.0, 41.0]
  ],
  gaixiaBattle: [
    [117.05, 32.94],
    [117.88, 33.64]
  ],
  pacificWide: [
    [105.0, -18.0],
    [210.0, 48.0]
  ],
  pacificPearl: [
    [135.0, 0.0],
    [205.0, 42.0]
  ],
  pacificCentral: [
    [155.0, -5.0],
    [205.0, 35.0]
  ],
  pacificGilberts: [
    [158.0, -10.0],
    [194.0, 20.0]
  ],
  pacificSouth: [
    [145.0, -24.0],
    [178.0, 6.0]
  ],
  pacificMarianas: [
    [135.0, 0.0],
    [175.0, 25.0]
  ],
  pacificIwo: [
    [128.0, 16.0],
    [148.0, 36.0]
  ],
  pacificRyukyus: [
    [122.0, 18.0],
    [144.0, 36.0]
  ],
  pacificPhilippines: [
    [118.0, -4.0],
    [150.0, 24.0]
  ],
  pacificJapan: [
    [122.0, 10.0],
    [146.0, 40.0]
  ]
};

const topology = countriesTopology as unknown as Topology<Objects<{ name?: string }>>;
const countriesObject = topology.objects.countries as GeometryObject<{ name?: string }>;

const countryCollection = feature(topology, countriesObject) as GeoJSON.FeatureCollection<
  GeoJSON.Geometry,
  { name?: string }
>;

const focusCountryNames = new Set([
  "France",
  "Germany",
  "Belgium",
  "Netherlands",
  "Luxembourg",
  "United Kingdom",
  "Switzerland",
  "Italy",
  "Spain"
]);

const coreCountryNames = new Set(["France", "Germany", "Belgium", "Netherlands", "Luxembourg"]);

const easternFrontCountryNames = new Set([
  "Armenia",
  "Austria",
  "Azerbaijan",
  "Belarus",
  "Bosnia and Herz.",
  "Bulgaria",
  "Croatia",
  "Czechia",
  "Estonia",
  "Finland",
  "Georgia",
  "Germany",
  "Hungary",
  "Latvia",
  "Lithuania",
  "Moldova",
  "Poland",
  "Romania",
  "Russia",
  "Serbia",
  "Slovakia",
  "Turkey",
  "Ukraine"
]);

const easternCoreCountryNames = new Set(["Russia", "Ukraine", "Belarus", "Poland", "Germany"]);

const europeCampaignCountryNames = new Set([
  "Austria",
  "Belarus",
  "Belgium",
  "Bosnia and Herz.",
  "Bulgaria",
  "Croatia",
  "Czechia",
  "Denmark",
  "Estonia",
  "France",
  "Germany",
  "Hungary",
  "Italy",
  "Latvia",
  "Lithuania",
  "Moldova",
  "Netherlands",
  "Poland",
  "Portugal",
  "Romania",
  "Russia",
  "Serbia",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Switzerland",
  "Turkey",
  "Ukraine",
  "United Kingdom"
]);

const mediterraneanCampaignCountryNames = new Set([
  "Albania",
  "Algeria",
  "Bosnia and Herz.",
  "Croatia",
  "France",
  "Greece",
  "Italy",
  "Malta",
  "Montenegro",
  "Morocco",
  "Portugal",
  "Serbia",
  "Spain",
  "Tunisia",
  "Turkey"
]);

const crusadesCampaignCountryNames = new Set([
  "Armenia",
  "Cyprus",
  "Egypt",
  "France",
  "Greece",
  "Iraq",
  "Israel",
  "Italy",
  "Jordan",
  "Lebanon",
  "Palestine",
  "Saudi Arabia",
  "Syria",
  "Turkey"
]);

const alexanderCampaignCountryNames = new Set([
  "Afghanistan",
  "Armenia",
  "Azerbaijan",
  "Cyprus",
  "Egypt",
  "Georgia",
  "Greece",
  "India",
  "Iran",
  "Iraq",
  "Israel",
  "Jordan",
  "Lebanon",
  "Macedonia",
  "Pakistan",
  "Saudi Arabia",
  "Syria",
  "Tajikistan",
  "Turkey",
  "Turkmenistan",
  "Uzbekistan"
]);

const caesarCampaignCountryNames = new Set([
  "Albania",
  "Algeria",
  "Austria",
  "Belgium",
  "Bosnia and Herz.",
  "Croatia",
  "Egypt",
  "France",
  "Germany",
  "Greece",
  "Ireland",
  "Italy",
  "Libya",
  "Malta",
  "Montenegro",
  "Morocco",
  "Netherlands",
  "Portugal",
  "Serbia",
  "Slovenia",
  "Spain",
  "Switzerland",
  "Tunisia",
  "Turkey",
  "United Kingdom"
]);

const europeCoreCountryNames = new Set(["France", "Germany", "Austria", "Italy", "Russia", "Spain"]);
const mediterraneanCoreCountryNames = new Set(["Italy", "Tunisia", "Spain", "Greece"]);
const crusadesCoreCountryNames = new Set(["Israel", "Palestine", "Lebanon", "Syria", "Turkey", "Egypt"]);
const alexanderCoreCountryNames = new Set(["Greece", "Macedonia", "Turkey", "Syria", "Iraq", "Iran", "Egypt", "Afghanistan", "Pakistan"]);
const caesarCoreCountryNames = new Set(["France", "Italy", "Belgium", "Switzerland", "United Kingdom", "Greece", "Egypt", "Tunisia", "Spain"]);

const mongolCampaignCountryNames = new Set([
  "Afghanistan",
  "Armenia",
  "Azerbaijan",
  "Belarus",
  "China",
  "Georgia",
  "India",
  "Iran",
  "Iraq",
  "Kazakhstan",
  "Kyrgyzstan",
  "Mongolia",
  "Myanmar",
  "North Korea",
  "Pakistan",
  "Russia",
  "South Korea",
  "Syria",
  "Tajikistan",
  "Turkey",
  "Turkmenistan",
  "Ukraine",
  "Uzbekistan"
]);

const qinCampaignCountryNames = new Set(["China", "Mongolia", "North Korea", "South Korea", "Taiwan", "Vietnam"]);

const pacificCampaignCountryNames = new Set([
  "Australia",
  "China",
  "Guam",
  "Japan",
  "Marshall Is.",
  "Micronesia",
  "N. Mariana Is.",
  "New Zealand",
  "Palau",
  "Papua New Guinea",
  "Philippines",
  "Russia",
  "Solomon Is.",
  "Taiwan",
  "United States of America"
]);

const gulfCampaignCountryNames = new Set([
  "Bahrain",
  "Iran",
  "Iraq",
  "Jordan",
  "Kuwait",
  "Oman",
  "Qatar",
  "Saudi Arabia",
  "Syria",
  "Turkey",
  "United Arab Emirates"
]);

const koreanWarCampaignCountryNames = new Set(["China", "Japan", "North Korea", "Russia", "South Korea"]);
const tsushimaCampaignCountryNames = new Set(["Japan", "North Korea", "Russia", "South Korea"]);
const trafalgarCampaignCountryNames = new Set(["Portugal", "Spain", "Morocco"]);
const guadalcanalCampaignCountryNames = new Set(["Papua New Guinea", "Solomon Is."]);
const jutlandCampaignCountryNames = new Set(["Denmark", "Germany", "Netherlands", "Norway", "United Kingdom"]);
const battleOfBritainCampaignCountryNames = new Set(["Belgium", "France", "Germany", "Netherlands", "United Kingdom"]);
const bigWeekCampaignCountryNames = new Set(["Belgium", "Czechia", "Denmark", "France", "Germany", "Netherlands", "Poland", "United Kingdom"]);
const bismarckSeaCampaignCountryNames = new Set(["Papua New Guinea", "Solomon Is."]);
const atlanticConvoyCampaignCountryNames = new Set([
  "Canada",
  "France",
  "Greenland",
  "Iceland",
  "Ireland",
  "Portugal",
  "Spain",
  "United Kingdom",
  "United States of America"
]);

const mongolCoreCountryNames = new Set(["Mongolia", "China", "Kazakhstan", "Uzbekistan", "Iran", "Russia"]);
const qinCoreCountryNames = new Set(["China"]);
const pacificCoreCountryNames = new Set(["Japan", "United States of America", "Philippines", "Papua New Guinea", "Solomon Is."]);
const gulfCoreCountryNames = new Set(["Iraq", "Kuwait", "Saudi Arabia"]);
const koreanWarCoreCountryNames = new Set(["China", "North Korea", "South Korea"]);
const tsushimaCoreCountryNames = new Set(["Japan", "South Korea"]);
const trafalgarCoreCountryNames = new Set(["Spain"]);
const guadalcanalCoreCountryNames = new Set(["Solomon Is."]);
const jutlandCoreCountryNames = new Set(["Denmark", "Germany", "United Kingdom"]);
const battleOfBritainCoreCountryNames = new Set(["France", "United Kingdom"]);
const bigWeekCoreCountryNames = new Set(["Germany", "United Kingdom"]);
const bismarckSeaCoreCountryNames = new Set(["Papua New Guinea"]);
const atlanticConvoyCoreCountryNames = new Set(["Canada", "Iceland", "Ireland", "United Kingdom"]);

export const westernEuropeCountries = countryCollection.features.filter((country) =>
  focusCountryNames.has(country.properties?.name ?? "")
) as CountryFeature[];

export const easternFrontCountries = countryCollection.features.filter((country) =>
  easternFrontCountryNames.has(country.properties?.name ?? "")
) as CountryFeature[];

export const europeCampaignCountries = countryCollection.features.filter((country) =>
  europeCampaignCountryNames.has(country.properties?.name ?? "")
) as CountryFeature[];

export const mediterraneanCampaignCountries = countryCollection.features.filter((country) =>
  mediterraneanCampaignCountryNames.has(country.properties?.name ?? "")
) as CountryFeature[];

export const crusadesCampaignCountries = countryCollection.features.filter((country) =>
  crusadesCampaignCountryNames.has(country.properties?.name ?? "")
) as CountryFeature[];

export const alexanderCampaignCountries = countryCollection.features.filter((country) =>
  alexanderCampaignCountryNames.has(country.properties?.name ?? "")
) as CountryFeature[];

export const caesarCampaignCountries = countryCollection.features.filter((country) =>
  caesarCampaignCountryNames.has(country.properties?.name ?? "")
) as CountryFeature[];

export const mongolCampaignCountries = countryCollection.features.filter((country) =>
  mongolCampaignCountryNames.has(country.properties?.name ?? "")
) as CountryFeature[];

export const qinCampaignCountries = countryCollection.features.filter((country) =>
  qinCampaignCountryNames.has(country.properties?.name ?? "")
) as CountryFeature[];

export const pacificCampaignCountries = countryCollection.features.filter((country) =>
  pacificCampaignCountryNames.has(country.properties?.name ?? "")
) as CountryFeature[];

export const gulfCampaignCountries = countryCollection.features.filter((country) =>
  gulfCampaignCountryNames.has(country.properties?.name ?? "")
) as CountryFeature[];

export const koreanWarCampaignCountries = countryCollection.features.filter((country) =>
  koreanWarCampaignCountryNames.has(country.properties?.name ?? "")
) as CountryFeature[];

export const tsushimaCampaignCountries = countryCollection.features.filter((country) =>
  tsushimaCampaignCountryNames.has(country.properties?.name ?? "")
) as CountryFeature[];

export const trafalgarCampaignCountries = countryCollection.features.filter((country) =>
  trafalgarCampaignCountryNames.has(country.properties?.name ?? "")
) as CountryFeature[];

export const guadalcanalCampaignCountries = countryCollection.features.filter((country) =>
  guadalcanalCampaignCountryNames.has(country.properties?.name ?? "")
) as CountryFeature[];

export const jutlandCampaignCountries = countryCollection.features.filter((country) =>
  jutlandCampaignCountryNames.has(country.properties?.name ?? "")
) as CountryFeature[];

export const battleOfBritainCampaignCountries = countryCollection.features.filter((country) =>
  battleOfBritainCampaignCountryNames.has(country.properties?.name ?? "")
) as CountryFeature[];

export const bigWeekCampaignCountries = countryCollection.features.filter((country) =>
  bigWeekCampaignCountryNames.has(country.properties?.name ?? "")
) as CountryFeature[];

export const bismarckSeaCampaignCountries = countryCollection.features.filter((country) =>
  bismarckSeaCampaignCountryNames.has(country.properties?.name ?? "")
) as CountryFeature[];

export const atlanticConvoyCampaignCountries = countryCollection.features.filter((country) =>
  atlanticConvoyCampaignCountryNames.has(country.properties?.name ?? "")
) as CountryFeature[];

export function createCampaignProjection(width: number, height: number, focus: keyof typeof viewports = "north") {
  const isPacificFocus = focus.startsWith("pacific") || focus.startsWith("midway");
  const projection = geoMercator()
    .rotate(isPacificFocus ? [-180, 0] : [0, 0])
    .fitExtent(
    [
      [14, 16],
      [width - 14, height - 16]
    ],
    {
      type: "MultiPoint",
      coordinates: viewports[focus]
    }
  );

  return projection;
}

export function projectPoint(projection: GeoProjection, coordinates: [number, number]): [number, number] {
  const projected = projection(coordinates);
  if (!projected) {
    return [0, 0];
  }
  return projected as [number, number];
}

export function countryPathFactory(projection: GeoProjection) {
  return geoPath(projection);
}

export function countryClassName(country: CountryFeature) {
  const name = country.properties?.name ?? "unknown";
  const normalized = name.toLowerCase().replace(/[^a-z]+/g, "-");
  return `country country-${normalized} ${coreCountryNames.has(name) ? "country-core" : "country-context"}`;
}

export function easternCountryClassName(country: CountryFeature) {
  const name = country.properties?.name ?? "unknown";
  const normalized = name.toLowerCase().replace(/[^a-z]+/g, "-");
  return `country country-${normalized} ${easternCoreCountryNames.has(name) ? "country-core" : "country-context"}`;
}

export function europeCampaignCountryClassName(country: CountryFeature) {
  const name = country.properties?.name ?? "unknown";
  const normalized = name.toLowerCase().replace(/[^a-z]+/g, "-");
  return `country country-${normalized} ${europeCoreCountryNames.has(name) ? "country-core" : "country-context"}`;
}

export function mediterraneanCountryClassName(country: CountryFeature) {
  const name = country.properties?.name ?? "unknown";
  const normalized = name.toLowerCase().replace(/[^a-z]+/g, "-");
  return `country country-${normalized} ${mediterraneanCoreCountryNames.has(name) ? "country-core" : "country-context"}`;
}

export function crusadesCountryClassName(country: CountryFeature) {
  const name = country.properties?.name ?? "unknown";
  const normalized = name.toLowerCase().replace(/[^a-z]+/g, "-");
  return `country country-${normalized} ${crusadesCoreCountryNames.has(name) ? "country-core" : "country-context"}`;
}

export function alexanderCountryClassName(country: CountryFeature) {
  const name = country.properties?.name ?? "unknown";
  const normalized = name.toLowerCase().replace(/[^a-z]+/g, "-");
  return `country country-${normalized} ${alexanderCoreCountryNames.has(name) ? "country-core" : "country-context"}`;
}

export function caesarCountryClassName(country: CountryFeature) {
  const name = country.properties?.name ?? "unknown";
  const normalized = name.toLowerCase().replace(/[^a-z]+/g, "-");
  return `country country-${normalized} ${caesarCoreCountryNames.has(name) ? "country-core" : "country-context"}`;
}

export function mongolCountryClassName(country: CountryFeature) {
  const name = country.properties?.name ?? "unknown";
  const normalized = name.toLowerCase().replace(/[^a-z]+/g, "-");
  return `country country-${normalized} ${mongolCoreCountryNames.has(name) ? "country-core" : "country-context"}`;
}

export function qinCountryClassName(country: CountryFeature) {
  const name = country.properties?.name ?? "unknown";
  const normalized = name.toLowerCase().replace(/[^a-z]+/g, "-");
  return `country country-${normalized} ${qinCoreCountryNames.has(name) ? "country-core" : "country-context"}`;
}

export function pacificCountryClassName(country: CountryFeature) {
  const name = country.properties?.name ?? "unknown";
  const normalized = name.toLowerCase().replace(/[^a-z]+/g, "-");
  return `country country-${normalized} ${pacificCoreCountryNames.has(name) ? "country-core" : "country-context"}`;
}

export function gulfCountryClassName(country: CountryFeature) {
  const name = country.properties?.name ?? "unknown";
  const normalized = name.toLowerCase().replace(/[^a-z]+/g, "-");
  return `country country-${normalized} ${gulfCoreCountryNames.has(name) ? "country-core" : "country-context"}`;
}

export function koreanWarCountryClassName(country: CountryFeature) {
  const name = country.properties?.name ?? "unknown";
  const normalized = name.toLowerCase().replace(/[^a-z]+/g, "-");
  return `country country-${normalized} ${koreanWarCoreCountryNames.has(name) ? "country-core" : "country-context"}`;
}

export function tsushimaCountryClassName(country: CountryFeature) {
  const name = country.properties?.name ?? "unknown";
  const normalized = name.toLowerCase().replace(/[^a-z]+/g, "-");
  return `country country-${normalized} ${tsushimaCoreCountryNames.has(name) ? "country-core" : "country-context"}`;
}

export function trafalgarCountryClassName(country: CountryFeature) {
  const name = country.properties?.name ?? "unknown";
  const normalized = name.toLowerCase().replace(/[^a-z]+/g, "-");
  return `country country-${normalized} ${trafalgarCoreCountryNames.has(name) ? "country-core" : "country-context"}`;
}

export function guadalcanalCountryClassName(country: CountryFeature) {
  const name = country.properties?.name ?? "unknown";
  const normalized = name.toLowerCase().replace(/[^a-z]+/g, "-");
  return `country country-${normalized} ${guadalcanalCoreCountryNames.has(name) ? "country-core" : "country-context"}`;
}

export function jutlandCountryClassName(country: CountryFeature) {
  const name = country.properties?.name ?? "unknown";
  const normalized = name.toLowerCase().replace(/[^a-z]+/g, "-");
  return `country country-${normalized} ${jutlandCoreCountryNames.has(name) ? "country-core" : "country-context"}`;
}

export function battleOfBritainCountryClassName(country: CountryFeature) {
  const name = country.properties?.name ?? "unknown";
  const normalized = name.toLowerCase().replace(/[^a-z]+/g, "-");
  return `country country-${normalized} ${battleOfBritainCoreCountryNames.has(name) ? "country-core" : "country-context"}`;
}

export function bigWeekCountryClassName(country: CountryFeature) {
  const name = country.properties?.name ?? "unknown";
  const normalized = name.toLowerCase().replace(/[^a-z]+/g, "-");
  return `country country-${normalized} ${bigWeekCoreCountryNames.has(name) ? "country-core" : "country-context"}`;
}

export function bismarckSeaCountryClassName(country: CountryFeature) {
  const name = country.properties?.name ?? "unknown";
  const normalized = name.toLowerCase().replace(/[^a-z]+/g, "-");
  return `country country-${normalized} ${bismarckSeaCoreCountryNames.has(name) ? "country-core" : "country-context"}`;
}

export function atlanticConvoyCountryClassName(country: CountryFeature) {
  const name = country.properties?.name ?? "unknown";
  const normalized = name.toLowerCase().replace(/[^a-z]+/g, "-");
  return `country country-${normalized} ${atlanticConvoyCoreCountryNames.has(name) ? "country-core" : "country-context"}`;
}
