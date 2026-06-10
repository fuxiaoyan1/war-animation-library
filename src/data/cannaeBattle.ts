export const campaignStart = "BCE-0216-08-02T06:00";
export const campaignEnd = "BCE-0216-08-02T16:00";
export const playbackDurationSeconds = 300;

export type CannaeFaction = "roman" | "carthaginian" | "terrain";
export type CannaeUnitKind =
  | "roman-legion"
  | "roman-cavalry"
  | "carthaginian-infantry"
  | "african-infantry"
  | "carthaginian-cavalry"
  | "numidian-cavalry"
  | "hannibal-command"
  | "paullus-command";
export type CannaeConfidence = "certain" | "probable" | "schematic" | "contested";

export type CannaePoint = {
  id: string;
  label: string;
  coordinates: [number, number];
  kind: "river" | "village" | "plain" | "camp" | "command" | "route" | "result";
  confidence: CannaeConfidence;
  revealAt?: string;
};

export type CannaeRegion = {
  id: string;
  label: string;
  coordinates: Array<[number, number]>;
  labelCoordinates: [number, number];
  kind: "roman-field" | "carthaginian-field" | "river-corridor" | "killing-ground";
  confidence: CannaeConfidence;
  revealAt?: string;
};

export type CannaeTerrainFeature = {
  id: string;
  label: string;
  kind: "river-bank" | "plain-rise" | "dust-flat" | "camp-ground" | "compression-basin";
  coordinates: Array<[number, number]>;
  labelCoordinates: [number, number];
  confidence: CannaeConfidence;
  revealAt?: string;
};

export type CannaeFormation = {
  id: string;
  label: string;
  faction: Exclude<CannaeFaction, "terrain">;
  kind: "deep-infantry-block" | "convex-center" | "concave-center" | "heavy-infantry-wing" | "cavalry-wing" | "command-post" | "compressed-pocket";
  coordinates: Array<[number, number]>;
  labelCoordinates: [number, number];
  start: string;
  end?: string;
  confidence: CannaeConfidence;
};

export type CannaeTacticalGraphic = {
  id: string;
  label: string;
  kind: "axis" | "yield-zone" | "wing-turn" | "rear-seal" | "compression";
  points: Array<[number, number]>;
  labelCoordinates: [number, number];
  confidence: CannaeConfidence;
  revealAt?: string;
};

export type CannaeRoute = {
  id: string;
  label: string;
  faction: Exclude<CannaeFaction, "terrain">;
  unitKind: CannaeUnitKind;
  start: string;
  end: string;
  points: Array<[number, number]>;
  formationPrelude?: Array<[number, number]>;
  positionAnchor?: string;
  routeKind: "deploy" | "advance" | "yield" | "cavalry" | "wing-turn" | "rear-seal" | "compression" | "collapse" | "command";
  labelOffset?: [number, number];
  unitOffsets?: Array<[number, number]>;
  unitTracks?: CannaeUnitTrack[];
  unitVisibleFrom?: string;
  unitVisibleUntil?: string;
  visibleUntil?: string;
  confidence: CannaeConfidence;
};

export type CannaeEvent = {
  id: string;
  date: string;
  title: string;
  phase: string;
  location: string;
  coordinates: [number, number];
  summary: string;
  detail: string;
  significance: string;
  routeIds: string[];
  cue?: "melee";
  contactAnchors?: CannaeContactAnchor[];
  confidence: CannaeConfidence;
};

export type CannaeNarrationCue = {
  id: string;
  start: string;
  end: string;
  title: string;
  text: string;
};

export type CannaeContactAnchor = {
  carthaginianPoint: [number, number];
  carthaginianRouteId: string;
  distanceThreshold?: number;
  earliest?: string;
  point: [number, number];
  romanPoint: [number, number];
  romanRouteId: string;
};

export type CannaeUnitTrack = {
  id: string;
  from: [number, number];
  to: [number, number];
  control?: [number, number];
  startDelay?: number;
  endDelay?: number;
  facingX?: 1 | -1;
};

function normalizeVector(vector: [number, number]) {
  const length = Math.hypot(vector[0], vector[1]) || 1;
  return [vector[0] / length, vector[1] / length] as [number, number];
}

function addPoint(point: [number, number], vector: [number, number], distance: number) {
  return [point[0] + vector[0] * distance, point[1] + vector[1] * distance] as [number, number];
}

function formationGrid(center: [number, number], rows: number, files: number, advance: [number, number], depthStep: number, fileStep: number) {
  const advanceVector = normalizeVector(advance);
  const frontVector = normalizeVector([-advanceVector[1], advanceVector[0]]);
  return Array.from({ length: rows * files }, (_, index) => {
    const row = Math.floor(index / files);
    const file = index % files;
    const depth = (row - (rows - 1) / 2) * depthStep;
    const frontage = (file - (files - 1) / 2) * fileStep + (row % 2 === 0 ? 0 : fileStep * 0.16);
    return addPoint(addPoint(center, advanceVector, depth), frontVector, frontage);
  });
}

function orientedBox(center: [number, number], advance: [number, number], length: number, frontage: number) {
  const advanceVector = normalizeVector(advance);
  const frontVector = normalizeVector([-advanceVector[1], advanceVector[0]]);
  const front = addPoint(center, advanceVector, length / 2);
  const rear = addPoint(center, advanceVector, -length / 2);
  return [
    addPoint(front, frontVector, frontage / 2),
    addPoint(front, frontVector, -frontage / 2),
    addPoint(rear, frontVector, -frontage / 2),
    addPoint(rear, frontVector, frontage / 2)
  ] as Array<[number, number]>;
}

function tracksBetween(
  id: string,
  fromPoints: Array<[number, number]>,
  toPoints: Array<[number, number]>,
  options: { control?: [number, number] | ((from: [number, number], to: [number, number], index: number) => [number, number]); facingX?: 1 | -1; stagger?: number } = {}
) {
  const count = Math.min(fromPoints.length, toPoints.length);
  return Array.from({ length: count }, (_, index) => ({
    control: typeof options.control === "function" ? options.control(fromPoints[index], toPoints[index], index) : options.control,
    id: `${id}-${index + 1}`,
    from: fromPoints[index],
    to: toPoints[index],
    startDelay: options.stagger ? (index % 7) * options.stagger : undefined,
    endDelay: options.stagger ? ((index + 3) % 7) * options.stagger * 0.55 : undefined,
    facingX: options.facingX
  })) satisfies CannaeUnitTrack[];
}

function splitTrackGroups(...groups: CannaeUnitTrack[][]) {
  return groups.flat();
}

function romanBlockTracks(id: string, rows: number, files: number, fromCenter: [number, number], toCenter: [number, number], options: { depthStep?: number; fileStep?: number; stagger?: number } = {}) {
  const advance = [toCenter[0] - fromCenter[0], toCenter[1] - fromCenter[1]] as [number, number];
  const depthStep = options.depthStep ?? 0.00135;
  const fileStep = options.fileStep ?? 0.00185;
  return tracksBetween(
    id,
    formationGrid(fromCenter, rows, files, advance, depthStep, fileStep),
    formationGrid(toCenter, rows, files, advance, depthStep, fileStep),
    { facingX: 1, stagger: options.stagger ?? 0.012 }
  );
}

function carthaginianLineTracks(
  id: string,
  count: number,
  fromCenter: [number, number],
  toCenter: [number, number],
  options: { axis?: [number, number]; bowFrom?: number; bowTo?: number; facingX?: 1 | -1; fromWidth?: number; toWidth?: number; width?: number } = {}
) {
  const width = options.width ?? 0.018;
  const fromWidth = options.fromWidth ?? width;
  const toWidth = options.toWidth ?? width * 0.82;
  const bowFrom = options.bowFrom ?? -0.006;
  const bowTo = options.bowTo ?? 0.005;
  const advanceVector = normalizeVector(options.axis ?? [1, 0]);
  const frontVector = normalizeVector([-advanceVector[1], advanceVector[0]]);
  const fromPoints = Array.from({ length: count }, (_, index) => {
    const ratio = count === 1 ? 0.5 : index / (count - 1);
    const side = ratio - 0.5;
    const bow = Math.sin(ratio * Math.PI) * bowFrom;
    return addPoint(addPoint(fromCenter, advanceVector, bow), frontVector, side * fromWidth);
  });
  const toPoints = Array.from({ length: count }, (_, index) => {
    const ratio = count === 1 ? 0.5 : index / (count - 1);
    const side = ratio - 0.5;
    const bow = Math.sin(ratio * Math.PI) * bowTo;
    return addPoint(addPoint(toCenter, advanceVector, bow), frontVector, side * toWidth);
  });
  return tracksBetween(id, fromPoints, toPoints, { facingX: options.facingX ?? -1, stagger: 0.018 });
}

function carthaginianBandTracks(
  id: string,
  rows: number,
  files: number,
  fromCenter: [number, number],
  toCenter: [number, number],
  options: Parameters<typeof carthaginianLineTracks>[4] & { rowStep?: number } = {}
) {
  const advanceVector = normalizeVector(options.axis ?? [1, 0]);
  const rowStep = options.rowStep ?? 0.001;
  return splitTrackGroups(
    ...Array.from({ length: rows }, (_, row) => {
      const depthOffset = (row - (rows - 1) / 2) * rowStep;
      return carthaginianLineTracks(
        `${id}-rank${row + 1}`,
        files,
        addPoint(fromCenter, advanceVector, depthOffset),
        addPoint(toCenter, advanceVector, depthOffset),
        options
      );
    })
  );
}

function cavalryTracks(id: string, fromCenter: [number, number], toCenter: [number, number], files: number, rows: number, options: { facingX?: 1 | -1; depthStep?: number; fileStep?: number } = {}) {
  const advance = [toCenter[0] - fromCenter[0], toCenter[1] - fromCenter[1]] as [number, number];
  const from = formationGrid(fromCenter, rows, files, advance, options.depthStep ?? 0.00105, options.fileStep ?? 0.0023);
  const to = formationGrid(toCenter, rows, files, advance, options.depthStep ?? 0.00105, options.fileStep ?? 0.0023);
  return tracksBetween(id, from, to, { facingX: options.facingX, stagger: 0.02 });
}

function bentTracksBetween(
  id: string,
  fromPoints: Array<[number, number]>,
  toPoints: Array<[number, number]>,
  controlPointFor: (from: [number, number], to: [number, number], index: number) => [number, number],
  options: { facingX?: 1 | -1; stagger?: number } = {}
) {
  return tracksBetween(id, fromPoints, toPoints, {
    control: controlPointFor,
    facingX: options.facingX,
    stagger: options.stagger ?? 0.018
  });
}

function blockOffsets(ranks: number, files: number, alongStep: number, crossStep: number, centerCross = 0): Array<[number, number]> {
  return Array.from({ length: ranks * files }, (_, index) => {
    const rank = Math.floor(index / files);
    const file = index % files;
    const stagger = rank % 2 === 0 ? 0 : crossStep * 0.28;
    return [-rank * alongStep - (file % 2) * 2, (file - (files - 1) / 2) * crossStep + centerCross + stagger] as [number, number];
  });
}

function centeredBlockOffsets(ranks: number, files: number, alongStep: number, crossStep: number, centerAlong = 0, centerCross = 0): Array<[number, number]> {
  return Array.from({ length: ranks * files }, (_, index) => {
    const rank = Math.floor(index / files);
    const file = index % files;
    const stagger = rank % 2 === 0 ? 0 : crossStep * 0.22;
    return [
      (rank - (ranks - 1) / 2) * alongStep + centerAlong,
      (file - (files - 1) / 2) * crossStep + centerCross + stagger
    ] as [number, number];
  });
}

function screenOffsets(ranks: number, files: number, alongStep: number, crossStep: number, centerCross = 0): Array<[number, number]> {
  return blockOffsets(ranks, files, alongStep, crossStep, centerCross);
}

const romanRows = 15;
const romanFiles = 12;
const romanDeployOffsets = blockOffsets(romanRows, romanFiles, 21, 13);
const romanMassOffsets = blockOffsets(romanRows, romanFiles, 22, 13);
const romanCompressedOffsets = centeredBlockOffsets(romanRows, romanFiles, 8.2, 6.8);
const romanBrokenOffsets: Array<[number, number]> = centeredBlockOffsets(5, 6, 25, 24).map((point, index) => [
  point[0] + ((index * 7) % 11 - 5) * 4.6,
  point[1] + ((index * 13) % 9 - 4) * 5.2
]);
const centerArcOffsets = screenOffsets(4, 12, 30, 14);
const cavalryPressureOffsets = centeredBlockOffsets(3, 5, 18, 17);
const cavalryRearSealOffsets = centeredBlockOffsets(3, 6, 17, 15);
const africanWallOffsets = screenOffsets(4, 6, 22, 14);
const pocketTightenOffsets = screenOffsets(4, 10, 18, 12);
const commandOffsets: Array<[number, number]> = [[0, 0]];
const cannaeAdvanceAxis = [1, 0.06] as [number, number];
const carthaginianFacingAxis = [-1, -0.06] as [number, number];
const africanLeftPressureAxis = [0.12, -1] as [number, number];
const africanRightPressureAxis = [0.12, 1] as [number, number];
const romanDeployTracks = romanBlockTracks("roman-deploy", romanRows, romanFiles, [16.098, 41.2848], [16.126, 41.2862], {
  depthStep: 0.00078,
  fileStep: 0.00105
});
const romanMassTracks = romanBlockTracks("roman-mass", romanRows, romanFiles, [16.126, 41.2862], [16.164, 41.2876], {
  depthStep: 0.0008,
  fileStep: 0.00108
});
const romanCompressionStartPoints = formationGrid([16.164, 41.2876], romanRows, romanFiles, cannaeAdvanceAxis, 0.0008, 0.00108);
const romanCompressedBasePoints = formationGrid([16.1691, 41.28645], romanRows, romanFiles, cannaeAdvanceAxis, 0.00034, 0.0005);
const romanCompressedGridPoints = romanCompressedBasePoints.map((point, index) => {
  const row = Math.floor(index / romanFiles);
  const file = index % romanFiles;
  const edgePressure = Math.abs(file - (romanFiles - 1) / 2) / ((romanFiles - 1) / 2);
  const centerPressure = Math.abs(row - (romanRows - 1) / 2) / ((romanRows - 1) / 2);
  const disorder = ((row * 17 + file * 11) % 9 - 4) / 4;
  return [
    point[0] - edgePressure * 0.0001 + (0.5 - centerPressure) * 0.00008 + disorder * 0.00013,
    point[1] + disorder * 0.00011 - centerPressure * 0.00004
  ] as [number, number];
});
const romanCompressionTracks = tracksBetween("roman-compress", romanCompressionStartPoints, romanCompressedGridPoints, {
  control: (from, to, index) => {
    const row = Math.floor(index / romanFiles);
    const file = index % romanFiles;
    return [16.1744 - row * 0.000018, 41.2875 + (file - (romanFiles - 1) / 2) * 0.00013] as [number, number];
  },
  facingX: 1,
  stagger: 0.014
});
const romanBreakupStartPoints = romanCompressedGridPoints.filter((_, index) => {
  const row = Math.floor(index / romanFiles);
  const file = index % romanFiles;
  return (row + file * 2) % 3 === 0 || (row > 5 && row < 11 && file % 4 === 1);
}).slice(0, 30);
const romanFinalScatterPoints: Array<[number, number]> = romanBreakupStartPoints.map((_, index) => {
  const angle = index * 2.399963229728653;
  const ring = 0.38 + ((index * 37) % 100) / 100;
  const squash = 0.55 + ((index * 11) % 7) * 0.045;
  const lng = 16.1618 + Math.cos(angle) * ring * 0.0052 + (((index * 5) % 9) - 4) * 0.00022;
  const lat = 41.2861 + Math.sin(angle) * ring * 0.0064 * squash + (((index * 7) % 11) - 5) * 0.00014;
  return [
    Math.max(16.1547, Math.min(16.1692, lng)),
    Math.max(41.2814, Math.min(41.2912, lat))
  ] as [number, number];
});
const romanBreakupTracks = tracksBetween(
  "roman-break",
  romanBreakupStartPoints,
  romanFinalScatterPoints,
  { facingX: 1, stagger: 0.026 }
);
const carthaginianForwardTracks = carthaginianBandTracks("cart-center-forward", 4, 16, [16.204, 41.2885], [16.172, 41.2882], {
  axis: carthaginianFacingAxis,
  bowFrom: 0.001,
  bowTo: 0.003,
  facingX: -1,
  fromWidth: 0.006,
  rowStep: 0.00075,
  toWidth: 0.0195,
  width: 0.024
});
const carthaginianYieldTracks = carthaginianBandTracks("cart-center-yield", 4, 16, [16.172, 41.2882], [16.181, 41.2874], {
  axis: carthaginianFacingAxis,
  bowFrom: 0.003,
  bowTo: -0.010,
  facingX: -1,
  rowStep: 0.00072,
  width: 0.024
});
const carthaginianCenterHoldTracks = carthaginianBandTracks("cart-center-hold", 3, 16, [16.181, 41.2874], [16.1806, 41.2871], {
  axis: carthaginianFacingAxis,
  bowFrom: -0.010,
  bowTo: -0.008,
  facingX: -1,
  rowStep: 0.00062,
  width: 0.017
});
const africanLeftHoldTracks = tracksBetween(
  "african-left-hold",
  formationGrid([16.202, 41.3002], 4, 12, africanLeftPressureAxis, 0.00058, 0.00102),
  formationGrid([16.166, 41.2992], 4, 12, africanLeftPressureAxis, 0.00058, 0.00102),
  { facingX: -1, stagger: 0.016 }
);
const africanRightHoldTracks = tracksBetween(
  "african-right-hold",
  formationGrid([16.202, 41.2738], 4, 12, africanRightPressureAxis, 0.00058, 0.00102),
  formationGrid([16.166, 41.2748], 4, 12, africanRightPressureAxis, 0.00058, 0.00102),
  { facingX: -1, stagger: 0.016 }
);
const africanLeftTurnTracks = bentTracksBetween(
  "african-left-turn",
  formationGrid([16.166, 41.2992], 4, 12, africanLeftPressureAxis, 0.00058, 0.00102),
  formationGrid([16.1658, 41.29265], 4, 12, africanLeftPressureAxis, 0.00034, 0.00052),
  (from, to, index) => [Math.max(from[0], to[0]) + 0.0016, 41.296 - (index % 4) * 0.00008],
  { facingX: -1, stagger: 0.018 }
);
const africanRightTurnTracks = bentTracksBetween(
  "african-right-turn",
  formationGrid([16.166, 41.2748], 4, 12, africanRightPressureAxis, 0.00058, 0.00102),
  formationGrid([16.1658, 41.28015], 4, 12, africanRightPressureAxis, 0.00034, 0.00052),
  (from, to, index) => [Math.max(from[0], to[0]) + 0.0016, 41.2779 + (index % 4) * 0.00008],
  { facingX: -1, stagger: 0.018 }
);
const pocketTightenTracks = splitTrackGroups(
  tracksBetween(
    "pocket-left-press",
    formationGrid([16.1658, 41.29265], 4, 10, africanLeftPressureAxis, 0.0003, 0.00048),
    formationGrid([16.1668, 41.29225], 4, 10, africanLeftPressureAxis, 0.00026, 0.00042),
    { facingX: -1, stagger: 0.018 }
  ),
  tracksBetween(
    "pocket-right-press",
    formationGrid([16.1658, 41.28015], 4, 10, africanRightPressureAxis, 0.0003, 0.00048),
    formationGrid([16.1668, 41.28055], 4, 10, africanRightPressureAxis, 0.00026, 0.00042),
    { facingX: -1, stagger: 0.018 }
  )
);
const romanLeftCavalryTracks = cavalryTracks("roman-left-cav", [16.096, 41.2698], [16.132, 41.2705], 7, 1, { facingX: 1, fileStep: 0.00185 });
const romanRightCavalryTracks = cavalryTracks("roman-right-cav", [16.096, 41.309], [16.132, 41.309], 7, 1, { facingX: 1, fileStep: 0.00185 });
const carthaginianHeavyCavalryTracks = cavalryTracks("cart-heavy-cav", [16.202, 41.3138], [16.132, 41.309], 7, 3, { facingX: -1, fileStep: 0.00145 });
const numidianCavalryTracks = cavalryTracks("numidian-cav", [16.202, 41.2636], [16.132, 41.2705], 7, 3, { facingX: -1, fileStep: 0.00145 });
const heavyRearTracks = bentTracksBetween(
  "heavy-rear",
  formationGrid([16.132, 41.309], 3, 7, [-0.6, -1], 0.00082, 0.0012),
  formationGrid([16.1562, 41.292], 3, 7, [0.3, -1], 0.00034, 0.00048),
  (from, to) => [16.1175, Math.max(from[1], to[1]) + 0.0018],
  { facingX: 1, stagger: 0.02 }
);
const numidianRearTracks = bentTracksBetween(
  "numidian-rear",
  formationGrid([16.132, 41.2705], 3, 7, [-0.6, 1], 0.00082, 0.0012),
  formationGrid([16.1562, 41.2807], 3, 7, [0.3, 1], 0.00034, 0.00048),
  (from, to) => [16.1175, Math.min(from[1], to[1]) - 0.0018],
  { facingX: 1, stagger: 0.02 }
);

export const mapPoints: CannaePoint[] = [
  { id: "ofanto-river", label: "奥凡托河 / Aufidus", coordinates: [16.145, 41.317], kind: "river", confidence: "certain" },
  { id: "cannae-plain", label: "坎尼平原", coordinates: [16.155, 41.288], kind: "plain", confidence: "probable" },
  { id: "cannae-site", label: "坎尼遗址方向", coordinates: [16.152, 41.296], kind: "village", confidence: "probable" },
  { id: "roman-camp-bank", label: "罗马营地方向", coordinates: [16.102, 41.287], kind: "camp", confidence: "schematic" },
  { id: "carthaginian-camp", label: "迦太基营地方向", coordinates: [16.214, 41.289], kind: "camp", confidence: "schematic" },
  { id: "center-pocket", label: "中军凹袋", coordinates: [16.164, 41.287], kind: "plain", confidence: "schematic", revealAt: "BCE-0216-08-02T10:45" },
  { id: "roman-core", label: "罗马纵深核心", coordinates: [16.163, 41.2865], kind: "command", confidence: "schematic", revealAt: "BCE-0216-08-02T13:10" },
  { id: "rear-seal", label: "后口封闭", coordinates: [16.152, 41.2864], kind: "route", confidence: "schematic", revealAt: "BCE-0216-08-02T12:20" },
  { id: "paullus-fall", label: "Paullus 终局", coordinates: [16.1598, 41.2849], kind: "command", confidence: "probable", revealAt: "BCE-0216-08-02T15:10" },
  { id: "roman-collapse-site", label: "罗马组织崩溃区", coordinates: [16.16, 41.286], kind: "result", confidence: "schematic", revealAt: "BCE-0216-08-02T15:35" }
];

export const historicalRegions: CannaeRegion[] = [
  {
    id: "river-corridor",
    label: "河岸限制带",
    kind: "river-corridor",
    confidence: "probable",
    labelCoordinates: [16.142, 41.302],
    coordinates: [
      [16.075, 41.322],
      [16.235, 41.321],
      [16.232, 41.309],
      [16.07, 41.309]
    ]
  },
  {
    id: "roman-approach-field",
    label: "罗马推进正面",
    kind: "roman-field",
    confidence: "schematic",
    labelCoordinates: [16.105, 41.279],
    coordinates: [
      [16.07, 41.277],
      [16.13, 41.303],
      [16.185, 41.3],
      [16.185, 41.274],
      [16.12, 41.269]
    ]
  },
  {
    id: "carthaginian-killing-ground",
    label: "双重包围压缩区",
    kind: "killing-ground",
    confidence: "schematic",
    revealAt: "BCE-0216-08-02T13:10",
    labelCoordinates: [16.156, 41.287],
    coordinates: [
      [16.11, 41.276],
      [16.123, 41.296],
      [16.154, 41.303],
      [16.19, 41.297],
      [16.202, 41.279],
      [16.167, 41.269],
      [16.13, 41.27]
    ]
  }
];

export const rivers: Array<{ id: string; label: string; points: Array<[number, number]> }> = [
  {
    id: "ofanto",
    label: "奥凡托河 / Aufidus",
    points: [
      [16.07, 41.322],
      [16.096, 41.32],
      [16.128, 41.321],
      [16.16, 41.318],
      [16.194, 41.319],
      [16.235, 41.316]
    ]
  }
];

export const terrainFeatures: CannaeTerrainFeature[] = [
  {
    id: "ofanto-bank",
    label: "河岸侧翼限制",
    kind: "river-bank",
    confidence: "probable",
    labelCoordinates: [16.126, 41.3],
    coordinates: [
      [16.078, 41.307],
      [16.128, 41.308],
      [16.186, 41.305],
      [16.23, 41.303]
    ]
  },
  {
    id: "central-dust-flat",
    label: "平原接触带",
    kind: "dust-flat",
    confidence: "probable",
    labelCoordinates: [16.158, 41.287],
    coordinates: [
      [16.092, 41.278],
      [16.13, 41.299],
      [16.19, 41.298],
      [16.222, 41.281],
      [16.173, 41.269],
      [16.117, 41.27]
    ]
  },
  {
    id: "roman-depth-basin",
    label: "罗马纵深压缩盆",
    kind: "compression-basin",
    confidence: "schematic",
    revealAt: "BCE-0216-08-02T11:45",
    labelCoordinates: [16.145, 41.285],
    coordinates: [
      [16.116, 41.277],
      [16.134, 41.295],
      [16.162, 41.299],
      [16.188, 41.292],
      [16.192, 41.28],
      [16.166, 41.273],
      [16.134, 41.273]
    ]
  },
  {
    id: "carthaginian-start-rise",
    label: "汉尼拔中军前出线",
    kind: "plain-rise",
    confidence: "schematic",
    labelCoordinates: [16.195, 41.29],
    coordinates: [
      [16.172, 41.299],
      [16.208, 41.293],
      [16.213, 41.282],
      [16.173, 41.273]
    ]
  }
];

export const formations: CannaeFormation[] = [
  {
    id: "roman-deployment-columns",
    label: "罗马多列入场",
    faction: "roman",
    kind: "deep-infantry-block",
    confidence: "schematic",
    start: "BCE-0216-08-02T06:45",
    end: "BCE-0216-08-02T08:15",
    labelCoordinates: [16.104, 41.285],
    coordinates: orientedBox([16.11, 41.2853], cannaeAdvanceAxis, 0.049, 0.021)
  },
  {
    id: "roman-deep-mass",
    label: "罗马重步兵纵深集团",
    faction: "roman",
    kind: "deep-infantry-block",
    confidence: "probable",
    start: "BCE-0216-08-02T08:15",
    end: "BCE-0216-08-02T12:45",
    labelCoordinates: [16.147, 41.287],
    coordinates: orientedBox([16.148, 41.287], cannaeAdvanceAxis, 0.062, 0.026)
  },
  {
    id: "roman-compressed-core",
    label: "罗马核心被压缩",
    faction: "roman",
    kind: "compressed-pocket",
    confidence: "schematic",
    start: "BCE-0216-08-02T12:45",
    labelCoordinates: [16.164, 41.286],
    coordinates: [
      [16.1573, 41.29075],
      [16.1694, 41.2906],
      [16.1731, 41.28805],
      [16.1713, 41.2821],
      [16.1577, 41.2821],
      [16.1548, 41.286]
    ]
  },
  {
    id: "carthaginian-convex-center",
    label: "汉尼拔凸月形中军",
    faction: "carthaginian",
    kind: "convex-center",
    confidence: "probable",
    start: "BCE-0216-08-02T07:05",
    end: "BCE-0216-08-02T10:45",
    labelCoordinates: [16.186, 41.288],
    coordinates: [
      [16.166, 41.299],
      [16.184, 41.295],
      [16.172, 41.288],
      [16.184, 41.281],
      [16.166, 41.2768]
    ]
  },
  {
    id: "carthaginian-concave-center",
    label: "中军后退成凹袋",
    faction: "carthaginian",
    kind: "concave-center",
    confidence: "probable",
    start: "BCE-0216-08-02T10:10",
    end: "BCE-0216-08-02T15:35",
    labelCoordinates: [16.174, 41.287],
    coordinates: [
      [16.166, 41.298],
      [16.182, 41.294],
      [16.181, 41.287],
      [16.182, 41.281],
      [16.166, 41.277]
    ]
  },
  {
    id: "african-left-wing",
    label: "非洲重步兵左翼",
    faction: "carthaginian",
    kind: "heavy-infantry-wing",
    confidence: "probable",
    start: "BCE-0216-08-02T08:30",
    end: "BCE-0216-08-02T10:55",
    labelCoordinates: [16.171, 41.3004],
    coordinates: orientedBox([16.171, 41.2992], carthaginianFacingAxis, 0.034, 0.008)
  },
  {
    id: "african-right-wing",
    label: "非洲重步兵右翼",
    faction: "carthaginian",
    kind: "heavy-infantry-wing",
    confidence: "probable",
    start: "BCE-0216-08-02T08:30",
    end: "BCE-0216-08-02T10:55",
    labelCoordinates: [16.171, 41.2745],
    coordinates: orientedBox([16.171, 41.2748], carthaginianFacingAxis, 0.034, 0.008)
  },
  {
    id: "carthaginian-left-cavalry-wing",
    label: "迦太基重骑左翼",
    faction: "carthaginian",
    kind: "cavalry-wing",
    confidence: "probable",
    start: "BCE-0216-08-02T07:20",
    end: "BCE-0216-08-02T12:35",
    labelCoordinates: [16.165, 41.311],
    coordinates: [
      [16.13, 41.309],
      [16.202, 41.3138]
    ]
  },
  {
    id: "numidian-right-cavalry-wing",
    label: "努米底右翼骑兵",
    faction: "carthaginian",
    kind: "cavalry-wing",
    confidence: "probable",
    start: "BCE-0216-08-02T07:20",
    end: "BCE-0216-08-02T13:25",
    labelCoordinates: [16.165, 41.266],
    coordinates: [
      [16.13, 41.2705],
      [16.202, 41.2636]
    ]
  },
  {
    id: "hannibal-command-post",
    label: "汉尼拔中军指挥",
    faction: "carthaginian",
    kind: "command-post",
    confidence: "probable",
    start: "BCE-0216-08-02T06:00",
    labelCoordinates: [16.197, 41.287],
    coordinates: [
      [16.191, 41.29],
      [16.201, 41.289],
      [16.201, 41.284],
      [16.191, 41.284]
    ]
  },
  {
    id: "paullus-command-post",
    label: "罗马指挥核心",
    faction: "roman",
    kind: "command-post",
    confidence: "probable",
    start: "BCE-0216-08-02T08:15",
    labelCoordinates: [16.139, 41.284],
    coordinates: orientedBox([16.139, 41.2846], cannaeAdvanceAxis, 0.011, 0.0065)
  }
];

export const tacticalGraphics: CannaeTacticalGraphic[] = [
  {
    id: "roman-advance-axis",
    label: "AX 罗马纵深推进轴",
    kind: "axis",
    confidence: "probable",
    labelCoordinates: [16.125, 41.291],
    points: [
      [16.092, 41.2844],
      [16.129, 41.2866],
      [16.168, 41.289]
    ]
  },
  {
    id: "center-yield-zone",
    label: "YZ 中军后退诱入区",
    kind: "yield-zone",
    confidence: "probable",
    revealAt: "BCE-0216-08-02T10:45",
    labelCoordinates: [16.179, 41.291],
    points: [
      [16.166, 41.298],
      [16.182, 41.294],
      [16.181, 41.287],
      [16.182, 41.281],
      [16.166, 41.276]
    ]
  },
  {
    id: "african-wing-turn",
    label: "WT 两翼内折",
    kind: "wing-turn",
    confidence: "probable",
    revealAt: "BCE-0216-08-02T11:45",
    labelCoordinates: [16.161, 41.2985],
    points: [
      [16.166, 41.2992],
      [16.162, 41.296],
      [16.1658, 41.29265],
      [16.1658, 41.28015],
      [16.162, 41.2779],
      [16.166, 41.2748]
    ]
  },
  {
    id: "rear-cavalry-seal",
    label: "RS 骑兵后封口",
    kind: "rear-seal",
    confidence: "probable",
    revealAt: "BCE-0216-08-02T12:20",
    labelCoordinates: [16.145, 41.292],
    points: [
      [16.132, 41.309],
      [16.1175, 41.303],
      [16.125, 41.2965],
      [16.143, 41.2935],
      [16.1562, 41.292],
      [16.1562, 41.2807],
      [16.143, 41.2793],
      [16.125, 41.2768],
      [16.132, 41.2705]
    ]
  },
  {
    id: "roman-compression",
    label: "CP 罗马集团压缩",
    kind: "compression",
    confidence: "schematic",
    revealAt: "BCE-0216-08-02T13:10",
    labelCoordinates: [16.164, 41.286],
    points: [
      [16.1562, 41.292],
      [16.1668, 41.29225],
      [16.1806, 41.2871],
      [16.1668, 41.28055],
      [16.1562, 41.2807],
      [16.1691, 41.28645]
    ]
  }
];

export const routes: CannaeRoute[] = [
  {
    id: "roman-infantry-deploy",
    label: "罗马重步兵展开",
    faction: "roman",
    unitKind: "roman-legion",
    routeKind: "deploy",
    start: "BCE-0216-08-02T06:00",
    end: "BCE-0216-08-02T08:15",
    visibleUntil: "BCE-0216-08-02T10:45",
    unitVisibleUntil: "BCE-0216-08-02T08:10",
    positionAnchor: "roman-deployment-columns",
    confidence: "schematic",
    points: [
      [16.09, 41.284],
      [16.102, 41.2847],
      [16.112, 41.2854],
      [16.126, 41.2862]
    ],
    unitTracks: romanDeployTracks,
    unitOffsets: romanDeployOffsets
  },
  {
    id: "roman-deep-advance",
    label: "纵深集团压入中军",
    faction: "roman",
    unitKind: "roman-legion",
    routeKind: "advance",
    start: "BCE-0216-08-02T08:10",
    end: "BCE-0216-08-02T10:05",
    visibleUntil: "BCE-0216-08-02T14:25",
    unitVisibleFrom: "BCE-0216-08-02T08:10",
    unitVisibleUntil: "BCE-0216-08-02T10:05",
    positionAnchor: "roman-deep-mass",
    confidence: "probable",
    formationPrelude: [
      [16.092, 41.2844],
      [16.108, 41.2854],
      [16.126, 41.2862]
    ],
    points: [
      [16.126, 41.2862],
      [16.136, 41.2869],
      [16.152, 41.2878],
      [16.164, 41.2876]
    ],
    unitTracks: romanMassTracks,
    unitOffsets: romanMassOffsets
  },
  {
    id: "roman-core-compression",
    label: "罗马核心被向内挤压",
    faction: "roman",
    unitKind: "roman-legion",
    routeKind: "compression",
    start: "BCE-0216-08-02T10:05",
    end: "BCE-0216-08-02T14:25",
    visibleUntil: "BCE-0216-08-02T16:00",
    unitVisibleUntil: "BCE-0216-08-02T14:35",
    positionAnchor: "roman-compressed-core",
    confidence: "schematic",
    formationPrelude: [
      [16.146, 41.287],
      [16.154, 41.2878],
      [16.164, 41.2876]
    ],
    points: [
      [16.164, 41.2876],
      [16.1718, 41.2873],
      [16.1694, 41.2868],
      [16.168, 41.28645]
    ],
    unitTracks: romanCompressionTracks,
    unitOffsets: romanCompressedOffsets
  },
  {
    id: "roman-core-breakup",
    label: "罗马核心破碎失序",
    faction: "roman",
    unitKind: "roman-legion",
    routeKind: "collapse",
    start: "BCE-0216-08-02T14:25",
    end: "BCE-0216-08-02T16:00",
    visibleUntil: "BCE-0216-08-02T16:00",
    unitVisibleUntil: "BCE-0216-08-02T15:42",
    positionAnchor: "roman-compressed-core",
    confidence: "schematic",
    formationPrelude: [
      [16.168, 41.287],
      [16.16, 41.286],
      [16.153, 41.286]
    ],
    points: [
      [16.166, 41.2864],
      [16.162, 41.2902],
      [16.1668, 41.2828],
      [16.158, 41.286],
      [16.1552, 41.2896],
      [16.156, 41.2824]
    ],
    unitTracks: romanBreakupTracks,
    unitOffsets: romanBrokenOffsets
  },
  {
    id: "roman-left-cavalry",
    label: "罗马左翼骑兵受压",
    faction: "roman",
    unitKind: "roman-cavalry",
    routeKind: "cavalry",
    start: "BCE-0216-08-02T06:00",
    end: "BCE-0216-08-02T10:10",
    visibleUntil: "BCE-0216-08-02T11:00",
    unitVisibleUntil: "BCE-0216-08-02T10:25",
    positionAnchor: "numidian-right-cavalry-wing",
    confidence: "probable",
    points: [
      [16.096, 41.2698],
      [16.112, 41.2699],
      [16.126, 41.2703],
      [16.132, 41.2705]
    ],
    unitTracks: romanLeftCavalryTracks,
    unitOffsets: screenOffsets(1, 5, 30, 20)
  },
  {
    id: "roman-right-cavalry",
    label: "罗马右翼骑兵贴河作战",
    faction: "roman",
    unitKind: "roman-cavalry",
    routeKind: "cavalry",
    start: "BCE-0216-08-02T06:00",
    end: "BCE-0216-08-02T10:00",
    visibleUntil: "BCE-0216-08-02T10:45",
    unitVisibleUntil: "BCE-0216-08-02T10:25",
    positionAnchor: "carthaginian-left-cavalry-wing",
    confidence: "probable",
    points: [
      [16.096, 41.309],
      [16.112, 41.309],
      [16.126, 41.309],
      [16.132, 41.309]
    ],
    unitTracks: romanRightCavalryTracks,
    unitOffsets: screenOffsets(1, 5, 30, 20)
  },
  {
    id: "carthaginian-center-forward",
    label: "凸月中军前出接敌",
    faction: "carthaginian",
    unitKind: "carthaginian-infantry",
    routeKind: "deploy",
    start: "BCE-0216-08-02T06:00",
    end: "BCE-0216-08-02T10:05",
    visibleUntil: "BCE-0216-08-02T10:45",
    unitVisibleUntil: "BCE-0216-08-02T10:05",
    positionAnchor: "carthaginian-convex-center",
    confidence: "probable",
    points: [
      [16.204, 41.2885],
      [16.191, 41.291],
      [16.177, 41.2901],
      [16.172, 41.2882]
    ],
    unitTracks: carthaginianForwardTracks,
    unitOffsets: centerArcOffsets
  },
  {
    id: "carthaginian-center-yield",
    label: "中军后退成凹袋",
    faction: "carthaginian",
    unitKind: "carthaginian-infantry",
    routeKind: "yield",
    start: "BCE-0216-08-02T10:05",
    end: "BCE-0216-08-02T12:35",
    unitVisibleFrom: "BCE-0216-08-02T10:05",
    unitVisibleUntil: "BCE-0216-08-02T13:20",
    visibleUntil: "BCE-0216-08-02T14:15",
    positionAnchor: "carthaginian-concave-center",
    confidence: "probable",
    formationPrelude: [
      [16.191, 41.291],
      [16.177, 41.2901],
      [16.172, 41.2882]
    ],
    points: [
      [16.172, 41.2882],
      [16.174, 41.288],
      [16.181, 41.2874],
      [16.179, 41.2866]
    ],
    unitTracks: carthaginianYieldTracks,
    unitOffsets: centerArcOffsets
  },
  {
    id: "carthaginian-center-hold",
    label: "迦太基中军保持正面压力",
    faction: "carthaginian",
    unitKind: "carthaginian-infantry",
    routeKind: "compression",
    start: "BCE-0216-08-02T12:35",
    end: "BCE-0216-08-02T15:35",
    unitVisibleFrom: "BCE-0216-08-02T12:35",
    unitVisibleUntil: "BCE-0216-08-02T15:45",
    visibleUntil: "BCE-0216-08-02T16:00",
    positionAnchor: "carthaginian-concave-center",
    confidence: "schematic",
    formationPrelude: [
      [16.182, 41.294],
      [16.181, 41.287],
      [16.182, 41.281]
    ],
    points: [
      [16.181, 41.2874],
      [16.1808, 41.2872],
      [16.1806, 41.2871]
    ],
    unitTracks: carthaginianCenterHoldTracks,
    unitOffsets: centerArcOffsets
  },
  {
    id: "african-left-hold",
    label: "非洲左翼拒止待机",
    faction: "carthaginian",
    unitKind: "african-infantry",
    routeKind: "deploy",
    start: "BCE-0216-08-02T06:00",
    end: "BCE-0216-08-02T09:30",
    visibleUntil: "BCE-0216-08-02T10:55",
    unitVisibleUntil: "BCE-0216-08-02T10:50",
    positionAnchor: "african-left-wing",
    confidence: "probable",
    points: [
      [16.196, 41.3002],
      [16.181, 41.2998],
      [16.166, 41.2992]
    ],
    unitTracks: africanLeftHoldTracks,
    unitOffsets: africanWallOffsets
  },
  {
    id: "african-right-hold",
    label: "非洲右翼拒止待机",
    faction: "carthaginian",
    unitKind: "african-infantry",
    routeKind: "deploy",
    start: "BCE-0216-08-02T06:00",
    end: "BCE-0216-08-02T09:30",
    visibleUntil: "BCE-0216-08-02T10:55",
    unitVisibleUntil: "BCE-0216-08-02T10:50",
    positionAnchor: "african-right-wing",
    confidence: "probable",
    points: [
      [16.195, 41.2738],
      [16.181, 41.2743],
      [16.166, 41.2748]
    ],
    unitTracks: africanRightHoldTracks,
    unitOffsets: africanWallOffsets
  },
  {
    id: "carthaginian-heavy-cavalry-clear",
    label: "重骑贴河击溃罗马右翼",
    faction: "carthaginian",
    unitKind: "carthaginian-cavalry",
    routeKind: "cavalry",
    start: "BCE-0216-08-02T06:00",
    end: "BCE-0216-08-02T10:25",
    visibleUntil: "BCE-0216-08-02T12:20",
    unitVisibleUntil: "BCE-0216-08-02T10:25",
    positionAnchor: "carthaginian-left-cavalry-wing",
    confidence: "probable",
    points: [
      [16.202, 41.3138],
      [16.176, 41.3125],
      [16.148, 41.31],
      [16.132, 41.309]
    ],
    unitTracks: carthaginianHeavyCavalryTracks,
    unitOffsets: cavalryPressureOffsets
  },
  {
    id: "numidian-fix-roman-left",
    label: "努米底骑兵牵制罗马左翼",
    faction: "carthaginian",
    unitKind: "numidian-cavalry",
    routeKind: "cavalry",
    start: "BCE-0216-08-02T06:00",
    end: "BCE-0216-08-02T10:50",
    visibleUntil: "BCE-0216-08-02T13:00",
    unitVisibleUntil: "BCE-0216-08-02T10:50",
    positionAnchor: "numidian-right-cavalry-wing",
    confidence: "probable",
    points: [
      [16.202, 41.2636],
      [16.176, 41.2654],
      [16.148, 41.268],
      [16.132, 41.2705]
    ],
    unitTracks: numidianCavalryTracks,
    unitOffsets: cavalryPressureOffsets
  },
  {
    id: "heavy-cavalry-rear-ride",
    label: "迦太基重骑封后",
    faction: "carthaginian",
    unitKind: "carthaginian-cavalry",
    routeKind: "rear-seal",
    start: "BCE-0216-08-02T10:25",
    end: "BCE-0216-08-02T12:20",
    visibleUntil: "BCE-0216-08-02T16:00",
    unitVisibleUntil: "BCE-0216-08-02T15:45",
    positionAnchor: "rear-cavalry-seal",
    confidence: "probable",
    formationPrelude: [
      [16.176, 41.3125],
      [16.148, 41.31],
      [16.132, 41.309]
    ],
    points: [
      [16.132, 41.309],
      [16.1175, 41.303],
      [16.125, 41.2965],
      [16.143, 41.2935],
      [16.1562, 41.292]
    ],
    unitTracks: heavyRearTracks,
    unitOffsets: cavalryRearSealOffsets
  },
  {
    id: "numidian-rear-pressure",
    label: "努米底骑兵从侧后压迫",
    faction: "carthaginian",
    unitKind: "numidian-cavalry",
    routeKind: "rear-seal",
    start: "BCE-0216-08-02T10:50",
    end: "BCE-0216-08-02T13:10",
    visibleUntil: "BCE-0216-08-02T16:00",
    unitVisibleUntil: "BCE-0216-08-02T15:45",
    positionAnchor: "rear-cavalry-seal",
    confidence: "probable",
    formationPrelude: [
      [16.176, 41.2654],
      [16.148, 41.268],
      [16.132, 41.2705]
    ],
    points: [
      [16.132, 41.2705],
      [16.1175, 41.2768],
      [16.125, 41.2793],
      [16.143, 41.2799],
      [16.1562, 41.2807]
    ],
    unitTracks: numidianRearTracks,
    unitOffsets: cavalryRearSealOffsets
  },
  {
    id: "african-left-inward-turn",
    label: "非洲左翼内折",
    faction: "carthaginian",
    unitKind: "african-infantry",
    routeKind: "wing-turn",
    start: "BCE-0216-08-02T10:50",
    end: "BCE-0216-08-02T13:45",
    visibleUntil: "BCE-0216-08-02T16:00",
    unitVisibleUntil: "BCE-0216-08-02T15:45",
    positionAnchor: "african-left-wing",
    confidence: "probable",
    formationPrelude: [
      [16.181, 41.2998],
      [16.166, 41.2992]
    ],
    points: [
      [16.166, 41.2992],
      [16.164, 41.2964],
      [16.1647, 41.2942],
      [16.1658, 41.29265]
    ],
    unitTracks: africanLeftTurnTracks,
    unitOffsets: africanWallOffsets
  },
  {
    id: "african-right-inward-turn",
    label: "非洲右翼内折",
    faction: "carthaginian",
    unitKind: "african-infantry",
    routeKind: "wing-turn",
    start: "BCE-0216-08-02T10:50",
    end: "BCE-0216-08-02T13:45",
    visibleUntil: "BCE-0216-08-02T16:00",
    unitVisibleUntil: "BCE-0216-08-02T15:45",
    positionAnchor: "african-right-wing",
    confidence: "probable",
    formationPrelude: [
      [16.181, 41.2743],
      [16.166, 41.2748]
    ],
    points: [
      [16.166, 41.2748],
      [16.164, 41.2772],
      [16.1647, 41.2789],
      [16.1658, 41.28015]
    ],
    unitTracks: africanRightTurnTracks,
    unitOffsets: africanWallOffsets
  },
  {
    id: "carthaginian-pocket-tighten",
    label: "包围圈向内压缩",
    faction: "carthaginian",
    unitKind: "african-infantry",
    routeKind: "compression",
    start: "BCE-0216-08-02T13:50",
    end: "BCE-0216-08-02T15:35",
    visibleUntil: "BCE-0216-08-02T16:00",
    unitVisibleUntil: "BCE-0216-08-02T15:45",
    positionAnchor: "roman-compressed-core",
    confidence: "schematic",
    formationPrelude: [
      [16.1658, 41.29265],
      [16.1658, 41.28015],
      [16.181, 41.2874],
      [16.1562, 41.292],
      [16.1562, 41.2807]
    ],
    points: [
      [16.1668, 41.29225],
      [16.1755, 41.2914],
      [16.1806, 41.2871],
      [16.1755, 41.2812],
      [16.1668, 41.28055]
    ],
    unitTracks: pocketTightenTracks,
    unitOffsets: pocketTightenOffsets
  },
  {
    id: "hannibal-command-observe",
    label: "汉尼拔保持中军调度",
    faction: "carthaginian",
    unitKind: "hannibal-command",
    routeKind: "command",
    start: "BCE-0216-08-02T06:00",
    end: "BCE-0216-08-02T15:10",
    visibleUntil: "BCE-0216-08-02T16:00",
    unitVisibleUntil: "BCE-0216-08-02T15:35",
    positionAnchor: "hannibal-command-post",
    confidence: "probable",
    points: [
      [16.199, 41.287],
      [16.194, 41.288],
      [16.187, 41.287],
      [16.181, 41.287]
    ],
    unitOffsets: commandOffsets
  },
  {
    id: "paullus-command-collapse",
    label: "Paullus 指挥核心",
    faction: "roman",
    unitKind: "paullus-command",
    routeKind: "collapse",
    start: "BCE-0216-08-02T14:45",
    end: "BCE-0216-08-02T15:10",
    unitVisibleFrom: "BCE-0216-08-02T15:02",
    unitVisibleUntil: "BCE-0216-08-02T15:18",
    visibleUntil: "BCE-0216-08-02T16:00",
    positionAnchor: "paullus-command-post",
    confidence: "probable",
    points: [
      [16.1618, 41.2851],
      [16.1608, 41.285],
      [16.1598, 41.2849]
    ],
    unitOffsets: commandOffsets
  }
];

export const battleEvents: CannaeEvent[] = [
  {
    id: "deployment-begins",
    date: "BCE-0216-08-02T06:00",
    title: "清晨：双方进入坎尼平原",
    phase: "第一幕 / 部署入场",
    location: "奥凡托河平原",
    coordinates: [16.118, 41.287],
    summary: "罗马军团从营地方向进入平原，尚未完全列成最终纵深集团。",
    detail: "坎尼不是开场即完成列阵。罗马先以多列进入战场，再逐渐堆成厚实中军；汉尼拔保留较薄但有弹性的中军，两翼和骑兵等待发挥空间。",
    significance: "部署阶段说明双方作战意图：罗马依靠纵深和人数压迫中军，汉尼拔则把两翼与骑兵留作决定性力量。",
    routeIds: ["roman-infantry-deploy", "roman-left-cavalry", "roman-right-cavalry", "carthaginian-heavy-cavalry-clear", "numidian-fix-roman-left"],
    confidence: "schematic"
  },
  {
    id: "hannibal-convex-center",
    date: "BCE-0216-08-02T07:05",
    title: "汉尼拔凸月形中军前出",
    phase: "第一幕 / 凸阵诱入",
    location: "迦太基中军前线",
    coordinates: [16.187, 41.288],
    summary: "迦太基中军前凸，两端由非洲重步兵和骑兵支撑。",
    detail: "Polybius 叙述汉尼拔把中军做成向前突出的弧形。凸出的中军主动接敌，非洲重步兵置于两端，暂不提前内折。",
    significance: "观众先看到“为什么罗马会压进去”，后续凹袋才有因果。",
    routeIds: ["carthaginian-center-forward", "african-left-hold", "african-right-hold", "carthaginian-heavy-cavalry-clear", "numidian-fix-roman-left", "hannibal-command-observe"],
    confidence: "probable"
  },
  {
    id: "roman-deep-advance",
    date: "BCE-0216-08-02T09:45",
    title: "罗马纵深集团向中军压入",
    phase: "第二幕 / 正面接触",
    location: "中军接触带",
    coordinates: [16.158, 41.288],
    summary: "罗马步兵厚阵推进并真正压到迦太基中军，退让从接触后开始。",
    detail: "罗马优势在重步兵体量和纵深压力。罗马前沿先压住凸出的中军，两侧骑兵战同时展开；中军退让必须表现为接触后的弹性后撤，而不是未战先退。",
    significance: "这是包围前的关键诱入阶段：罗马越成功地挤压中军，越深入即将闭合的袋口。",
    routeIds: ["roman-deep-advance", "carthaginian-center-forward", "roman-left-cavalry", "roman-right-cavalry"],
    cue: "melee",
    contactAnchors: [
      {
        romanRouteId: "roman-deep-advance",
        carthaginianRouteId: "carthaginian-center-forward",
        earliest: "BCE-0216-08-02T09:45",
        romanPoint: [16.158, 41.2878],
        carthaginianPoint: [16.172, 41.2882],
        point: [16.166, 41.288],
        distanceThreshold: 0.03
      },
      {
        romanRouteId: "roman-right-cavalry",
        carthaginianRouteId: "carthaginian-heavy-cavalry-clear",
        earliest: "BCE-0216-08-02T09:45",
        romanPoint: [16.132, 41.309],
        carthaginianPoint: [16.148, 41.31],
        point: [16.14, 41.3095]
      },
      {
        romanRouteId: "roman-left-cavalry",
        carthaginianRouteId: "numidian-fix-roman-left",
        earliest: "BCE-0216-08-02T09:45",
        romanPoint: [16.132, 41.2705],
        carthaginianPoint: [16.148, 41.268],
        point: [16.14, 41.2693]
      }
    ],
    confidence: "probable"
  },
  {
    id: "cavalry-clearance",
    date: "BCE-0216-08-02T10:10",
    title: "迦太基骑兵清理两翼",
    phase: "第三幕 / 骑兵清场",
    location: "两翼骑兵战",
    coordinates: [16.12, 41.298],
    summary: "重骑贴河击败罗马右翼，努米底骑兵牵制并压迫罗马左翼。",
    detail: "骑兵清场是双重包围能成立的前置条件。重骑先沿河岸一侧击溃罗马骑兵，再转向罗马后方；努米底骑兵则牵制罗马左翼并从侧后施压。",
    significance: "如果骑兵段不清楚，后续封口就会像凭空出现。这里必须表现出路线交接和任务递进。",
    routeIds: ["carthaginian-heavy-cavalry-clear", "numidian-fix-roman-left", "roman-left-cavalry", "roman-right-cavalry"],
    cue: "melee",
    contactAnchors: [
      {
        romanRouteId: "roman-right-cavalry",
        carthaginianRouteId: "carthaginian-heavy-cavalry-clear",
        earliest: "BCE-0216-08-02T10:10",
        romanPoint: [16.132, 41.309],
        carthaginianPoint: [16.132, 41.309],
        point: [16.132, 41.309]
      },
      {
        romanRouteId: "roman-left-cavalry",
        carthaginianRouteId: "numidian-fix-roman-left",
        earliest: "BCE-0216-08-02T10:10",
        romanPoint: [16.132, 41.2705],
        carthaginianPoint: [16.132, 41.2705],
        point: [16.132, 41.2705]
      }
    ],
    confidence: "probable"
  },
  {
    id: "center-becomes-concave",
    date: "BCE-0216-08-02T10:45",
    title: "中军由凸转凹，罗马深入袋口",
    phase: "第四幕 / 凹袋形成",
    location: "中军凹袋",
    coordinates: [16.166, 41.287],
    summary: "迦太基中军在接触后后退，罗马纵深集团同步压入凹袋。",
    detail: "这不是中军自己退场，也不是罗马原地等口袋形成。罗马厚阵持续向前挤压，凸出的中军有控制地后移，罗马队列被拉长、变窄，两翼仍暂时不提前闭合。",
    significance: "坎尼的阵法表达核心就在这里：中心退让不是崩溃，而是为两翼内折制造空间。",
    routeIds: ["carthaginian-center-yield", "roman-core-compression", "hannibal-command-observe"],
    cue: "melee",
    contactAnchors: [
      {
        romanRouteId: "roman-core-compression",
        carthaginianRouteId: "carthaginian-center-yield",
        earliest: "BCE-0216-08-02T10:45",
        romanPoint: [16.1702, 41.2872],
        carthaginianPoint: [16.181, 41.2874],
        point: [16.175, 41.2873],
        distanceThreshold: 0.028
      }
    ],
    confidence: "probable"
  },
  {
    id: "african-wings-turn",
    date: "BCE-0216-08-02T12:45",
    title: "非洲重步兵从两翼内折",
    phase: "第五幕 / 两翼内折",
    location: "罗马集团两侧",
    coordinates: [16.163, 41.286],
    summary: "罗马步兵已压入凹袋后，非洲重步兵从两侧向内转身。",
    detail: "这一步晚于中军凹袋形成。非洲两翼从原先拒止位置转向，沿罗马纵深集团侧面推进，形成逐步收紧的侧压线。",
    significance: "两翼内折是“双重包围”的第一层闭合，它把罗马纵深集团从侧面锁住。",
    routeIds: ["african-left-inward-turn", "african-right-inward-turn", "roman-core-compression", "carthaginian-center-hold"],
    cue: "melee",
    contactAnchors: [
      {
        romanRouteId: "roman-core-compression",
        carthaginianRouteId: "african-left-inward-turn",
        earliest: "BCE-0216-08-02T12:45",
        romanPoint: [16.166, 41.2905],
        carthaginianPoint: [16.1658, 41.29265],
        point: [16.1656, 41.2915],
        distanceThreshold: 0.019
      },
      {
        romanRouteId: "roman-core-compression",
        carthaginianRouteId: "african-right-inward-turn",
        earliest: "BCE-0216-08-02T12:45",
        romanPoint: [16.166, 41.28225],
        carthaginianPoint: [16.1658, 41.28015],
        point: [16.1656, 41.2812],
        distanceThreshold: 0.019
      },
      {
        romanRouteId: "roman-core-compression",
        carthaginianRouteId: "carthaginian-center-hold",
        earliest: "BCE-0216-08-02T12:45",
        romanPoint: [16.168, 41.2866],
        carthaginianPoint: [16.1806, 41.2871],
        point: [16.1696, 41.2871],
        distanceThreshold: 0.032
      }
    ],
    confidence: "probable"
  },
  {
    id: "rear-seal",
    date: "BCE-0216-08-02T13:20",
    title: "骑兵绕后封闭罗马后口",
    phase: "第六幕 / 后口封闭",
    location: "罗马集团背后",
    coordinates: [16.154, 41.286],
    summary: "迦太基骑兵在两翼清场后贴近罗马背后，退路开始被封住。",
    detail: "重骑清场后从河岸侧折向罗马后口，努米底骑兵从另一侧后方接应，形成背后封闭。画面保持前一段骑兵轨迹，但不把步兵画成绕场环行。",
    significance: "后口封闭让“双重包围”完成：罗马不再只是被两翼夹击，而是被四面压缩。",
    routeIds: ["heavy-cavalry-rear-ride", "numidian-rear-pressure", "roman-core-compression", "carthaginian-center-hold"],
    cue: "melee",
    contactAnchors: [
      {
        romanRouteId: "roman-core-compression",
        carthaginianRouteId: "heavy-cavalry-rear-ride",
        earliest: "BCE-0216-08-02T13:20",
        romanPoint: [16.1588, 41.2902],
        carthaginianPoint: [16.1562, 41.292],
        point: [16.1572, 41.291],
        distanceThreshold: 0.026
      },
      {
        romanRouteId: "roman-core-compression",
        carthaginianRouteId: "numidian-rear-pressure",
        earliest: "BCE-0216-08-02T13:20",
        romanPoint: [16.1588, 41.2824],
        carthaginianPoint: [16.1562, 41.2807],
        point: [16.1572, 41.2817],
        distanceThreshold: 0.026
      }
    ],
    confidence: "probable"
  },
  {
    id: "encirclement-compression",
    date: "BCE-0216-08-02T14:05",
    title: "包围圈压缩，罗马集团失去展开空间",
    phase: "第七幕 / 压缩围歼",
    location: "坎尼核心战场",
    coordinates: [16.163, 41.286],
    summary: "罗马步兵集团被挤成狭窄核心，阵列开始失序破碎。",
    detail: "这段战斗集中在坎尼核心战场。罗马块体不是凭空缩小，而是在前方中军、两侧非洲重步兵和后方骑兵共同压力下逐步失去间隔，整齐纵深变成拥挤、断裂的核心。",
    significance: "观众应能在同一画面中看见：中军凹袋、非洲两翼、后方骑兵封口和罗马核心压缩。",
    routeIds: ["carthaginian-pocket-tighten", "carthaginian-center-hold", "roman-core-compression", "roman-core-breakup", "heavy-cavalry-rear-ride", "numidian-rear-pressure"],
    cue: "melee",
    contactAnchors: [
      {
        romanRouteId: "roman-core-compression",
        carthaginianRouteId: "carthaginian-center-hold",
        earliest: "BCE-0216-08-02T14:05",
        romanPoint: [16.168, 41.2866],
        carthaginianPoint: [16.1806, 41.2871],
        point: [16.1696, 41.287],
        distanceThreshold: 0.032
      },
      {
        romanRouteId: "roman-core-compression",
        carthaginianRouteId: "carthaginian-pocket-tighten",
        earliest: "BCE-0216-08-02T14:05",
        romanPoint: [16.166, 41.2902],
        carthaginianPoint: [16.1668, 41.29225],
        point: [16.1652, 41.2912],
        distanceThreshold: 0.02
      },
      {
        romanRouteId: "roman-core-breakup",
        carthaginianRouteId: "carthaginian-pocket-tighten",
        earliest: "BCE-0216-08-02T14:45",
        romanPoint: [16.1635, 41.2822],
        carthaginianPoint: [16.1668, 41.28055],
        point: [16.1652, 41.2814],
        distanceThreshold: 0.022
      },
      {
        romanRouteId: "roman-core-compression",
        carthaginianRouteId: "heavy-cavalry-rear-ride",
        earliest: "BCE-0216-08-02T14:05",
        romanPoint: [16.1588, 41.2898],
        carthaginianPoint: [16.1562, 41.292],
        point: [16.1572, 41.2909],
        distanceThreshold: 0.026
      }
    ],
    confidence: "schematic"
  },
  {
    id: "paullus-endgame",
    date: "BCE-0216-08-02T15:10",
    title: "Paullus 殉战，罗马指挥核心崩溃",
    phase: "终幕 / 指挥与崩溃",
    location: "罗马核心",
    coordinates: [16.1598, 41.2849],
    summary: "罗马指挥节点失去组织能力，坎尼会战进入终局。",
    detail: "Livy 记载执政官 Paullus 在战斗中阵亡。这里以指挥标识和压缩核心标注终局，不表现血腥细节，重点是组织崩溃和围歼结果。",
    significance: "把重点人物/指挥节点放在终局阶段标出，延续垓下/碾庄结尾对关键单位和结果的处理方法。",
    routeIds: ["paullus-command-collapse", "roman-core-breakup", "carthaginian-pocket-tighten", "carthaginian-center-hold"],
    cue: "melee",
    contactAnchors: [
      {
        romanRouteId: "paullus-command-collapse",
        carthaginianRouteId: "carthaginian-pocket-tighten",
        earliest: "BCE-0216-08-02T15:10",
        romanPoint: [16.1598, 41.2849],
        carthaginianPoint: [16.1668, 41.28055],
        point: [16.163, 41.2828],
        distanceThreshold: 0.022
      }
    ],
    confidence: "probable"
  },
  {
    id: "battle-result",
    date: "BCE-0216-08-02T16:00",
    title: "坎尼成为双重包围的惨烈范例",
    phase: "收束 / 战斗结果",
    location: "坎尼平原",
    coordinates: [16.16, 41.286],
    summary: "罗马集团在前、侧、后三面压力下失去组织，坎尼成为双重包围的经典但惨烈案例。",
    detail: "凸阵诱入、两翼内折、骑兵封后和核心压缩共同造成罗马军团崩溃。结果画面不再保留整齐部队，只保留战术痕迹、Paullus 终局点和组织崩溃区，强调战争代价而不是歌颂杀戮。",
    significance: "坎尼之所以长期被研究，是因为它展示了战场空间、兵种协同和时机控制如何改变人数优势。",
    routeIds: ["roman-core-breakup", "paullus-command-collapse", "carthaginian-pocket-tighten", "carthaginian-center-hold", "heavy-cavalry-rear-ride", "numidian-rear-pressure"],
    confidence: "certain"
  }
];

export const narrationCues: CannaeNarrationCue[] = [
  {
    id: "deployment",
    start: "BCE-0216-08-02T06:00",
    end: "BCE-0216-08-02T08:20",
    title: "第一幕 / 清晨部署",
    text: "罗马军团先进入平原，再逐渐堆成厚实中军；汉尼拔的薄中军前凸，两翼与骑兵保留空间。"
  },
  {
    id: "contact",
    start: "BCE-0216-08-02T08:20",
    end: "BCE-0216-08-02T10:45",
    title: "第二幕 / 罗马压入凸阵",
    text: "罗马纵深先压住凸出的中军，两翼骑兵战同时改变战场边界；中军在接触后才开始有控制地后退。"
  },
  {
    id: "yield",
    start: "BCE-0216-08-02T10:45",
    end: "BCE-0216-08-02T12:25",
    title: "第三幕 / 凹袋与内折",
    text: "凸月中军退成凹袋，罗马集团被拉长变窄；非洲重步兵从两端转向侧面，骑兵清场后准备封闭后口。"
  },
  {
    id: "encirclement",
    start: "BCE-0216-08-02T12:25",
    end: "BCE-0216-08-02T15:10",
    title: "第四幕 / 双重包围闭合",
    text: "罗马核心被前、侧、后三面压缩，队列从纵深集团变成拥挤断裂的核心；骑兵在背后封闭退路。"
  },
  {
    id: "endgame",
    start: "BCE-0216-08-02T15:10",
    end: "BCE-0216-08-02T16:00",
    title: "终幕 / 战斗结果",
    text: "Paullus 指挥节点崩溃后，罗马集团失去组织。坎尼留下的是双重包围的战术教训和战争代价。"
  }
];

export const cueEventIds = new Set(battleEvents.filter((event) => event.cue === "melee").map((event) => event.id));

export const sources = [
  {
    id: "polybius-book-3",
    title: "Polybius, Histories, Book 3",
    url: "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Polybius/3*.html",
    role: "primary"
  },
  {
    id: "livy-book-22",
    title: "Livy, Ab Urbe Condita, Book 22",
    url: "https://www.perseus.tufts.edu/hopper/text?doc=Liv.+22.44",
    role: "primary"
  },
  {
    id: "britannica-cannae",
    title: "Encyclopaedia Britannica, Battle of Cannae",
    url: "https://www.britannica.com/event/Battle-of-Cannae",
    role: "secondary"
  },
  {
    id: "world-history-cannae",
    title: "World History Encyclopedia, Battle of Cannae",
    url: "https://www.worldhistory.org/Battle_of_Cannae/",
    role: "secondary"
  },
  {
    id: "commons-cannae-maps",
    title: "Wikimedia Commons, Maps of the Battle of Cannae",
    url: "https://commons.wikimedia.org/wiki/Category:Maps_of_the_Battle_of_Cannae",
    role: "map-reference"
  },
  {
    id: "openstreetmap",
    title: "OpenStreetMap",
    url: "https://www.openstreetmap.org/",
    role: "geographic-reference"
  }
] as const;
