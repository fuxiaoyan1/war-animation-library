import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BattleEvent, FrontLine, MapPoint } from "../data/battleOfFrance";
import { UnitIcon, type HorizontalFacing } from "./UnitIcon";
import type { UnitIconKind } from "../types/units";
import type { HistoricalRegion } from "../types/maps";
import type { CountryFeature } from "../lib/geoMap";
import {
  countryPathFactory,
  createCampaignProjection,
  projectPoint
} from "../lib/geoMap";
import { createCampaignTimeline } from "../lib/campaignTimeline";
import { publicPath } from "../lib/publicPath";
import { formatChineseDate, interpolatePoint } from "../lib/timeline";
import { useMapInteraction } from "../lib/useMapInteraction";
import { WarScore, type BattleCueKind } from "../lib/warScore";

type FocusStep = {
  fromProgress: number;
  focus: string;
};

type FocusTransitionState = {
  fromFocus: string;
  focus: string;
  ratio: number;
};

type GeoLine = {
  className?: string;
  id: string;
  label: string;
  points: Array<[number, number]>;
  revealAt?: string;
  testId?: string;
  visibleUntil?: string;
};

export type MapOverlayElement =
  | {
      className?: string;
      id: string;
      label: string;
      revealAt?: string;
      testId?: string;
      type: "wind";
      from: [number, number];
      to: [number, number];
    }
  | {
      className?: string;
      id: string;
      label: string;
      revealAt?: string;
      subtitle?: string;
      testId?: string;
      type: "marker";
      coordinates: [number, number];
    };

type SalvoBattleEffectElement = {
  className?: string;
  end: string;
  from: [number, number];
  fromRouteId?: string;
  id: string;
  impactOffsets?: Array<[number, number]>;
  label?: string;
  showShellTraces?: boolean;
  shellOffsets?: Array<[number, number]>;
  start: string;
  testId?: string;
  to: [number, number];
  toRouteId?: string;
  type: "salvo";
};

type DogfightBattleEffectElement = {
  center: [number, number];
  className?: string;
  end: string;
  id: string;
  intensity?: number;
  label?: string;
  radius?: number;
  routeIds?: string[];
  start: string;
  testId?: string;
  type: "dogfight";
};

export type BattleEffectElement = SalvoBattleEffectElement | DogfightBattleEffectElement;

export type OutcomeStat = {
  className?: string;
  label: string;
  value: string;
};

export type NarrationCue = {
  end: string;
  id: string;
  start: string;
  text: string;
  title?: string;
};

type CampaignMapAnimationProps = {
  activeSpans?: Array<{
    end: string;
    start: string;
  }>;
  ariaLabel: string;
  battleEvents: BattleEvent[];
  battleEffects?: BattleEffectElement[];
  campaignEnd: string;
  campaignStart: string;
  countries: CountryFeature[];
  countryClassName: (country: CountryFeature) => string;
  cueEvents: Set<string>;
  cueEventKinds?: Partial<Record<string, BattleCueKind>>;
  diveCueEvents?: Set<string>;
  eyebrow: string;
  frontLines: FrontLine[];
  focusSteps: FocusStep[];
  focusTransitionProgress?: number;
  fortifiedLines?: GeoLine[];
  gapScale?: number;
  gapOverrides?: Array<{
    displayDays: number;
    end: string;
    start: string;
  }>;
  historicalRegions?: HistoricalRegion[];
  inactiveGapDisplayDays?: number;
  legendAxis?: string;
  legendPrimary?: string;
  legendSecondary?: string;
  mapDimensions?: {
    height: number;
    width: number;
  };
  mapPoints: MapPoint[];
  mapOverlays?: MapOverlayElement[];
  maxGapDays?: number;
  musicSource?: string;
  cinematicMode?: boolean;
  narrationCues?: NarrationCue[];
  outcomeStats?: OutcomeStat[];
  playbackDurationSeconds: number;
  regionLabels: Array<{ label: string; coordinates: [number, number] }>;
  retainSeaUnitsAfterRouteEnd?: boolean;
  rivers?: GeoLine[];
  shellClassName?: string;
  sfxProfile?: "ancient" | "gunpowder" | "ww2";
  subtitle: string;
  tacticalRouteRetention?: boolean;
  terrainZones?: Array<{
    className?: string;
    coordinates: [number, number];
    label: string;
    labelCoordinates: [number, number];
    rx: number;
    ry: number;
  }>;
  testId: string;
  timeCounterLabel?: "天" | "小时" | "周";
  timeStepDays?: number;
  timingMode?: "calendar" | "compressed";
  timelineTitle: string;
  title: string;
  unitIcon?: UnitIconKind;
};

const defaultMapWidth = 1180;
const defaultMapHeight = 704;
const cuePulseThreshold = 0.82;

const cinematicSpecks = Array.from({ length: 34 }, (_, index) => ({
  delay: `${(index % 9) * 0.34}s`,
  id: `speck-${index}`,
  opacity: 0.16 + (index % 5) * 0.035,
  radius: 1.4 + (index % 4) * 0.62,
  x: 48 + ((index * 89) % 1080),
  y: 42 + ((index * 137) % 780)
}));

function factionClass(faction: string) {
  if (faction === "rome") {
    return "faction-allies faction-rome";
  }

  if (faction === "un") {
    return "faction-allies faction-un";
  }

  if (faction === "communist") {
    return "faction-germany faction-communist";
  }

  if (faction === "carthage") {
    return "faction-germany faction-carthage";
  }

  if (faction === "spain") {
    return "faction-germany faction-spain";
  }

  return `faction-${faction}`;
}

function buildRoutePath(from: [number, number], to: [number, number]) {
  return buildCurvedPath([from, to]);
}

function smoothStep(value: number) {
  const clamped = Math.min(1, Math.max(0, value));
  return clamped * clamped * (3 - 2 * clamped);
}

function focusTransitionState(
  focusSteps: FocusStep[],
  progress: number,
  transitionProgress: number
): FocusTransitionState {
  const sortedSteps = [...focusSteps].sort((a, b) => a.fromProgress - b.fromProgress);
  let activeIndex = 0;
  sortedSteps.forEach((step, index) => {
    if (progress >= step.fromProgress) {
      activeIndex = index;
    }
  });
  const activeStep = sortedSteps[activeIndex] ?? sortedSteps[0] ?? { focus: "north", fromProgress: 0 };
  const previousStep = sortedSteps[activeIndex - 1] ?? activeStep;
  const rawRatio =
    transitionProgress > 0 && previousStep.focus !== activeStep.focus
      ? (progress - activeStep.fromProgress) / transitionProgress
      : 1;

  return {
    focus: activeStep.focus,
    fromFocus: rawRatio < 1 ? previousStep.focus : activeStep.focus,
    ratio: smoothStep(rawRatio)
  };
}

function createFocusProjection(width: number, height: number, state: FocusTransitionState) {
  const targetProjection = createCampaignProjection(width, height, state.focus);
  if (state.ratio >= 0.999 || state.fromFocus === state.focus) {
    return targetProjection;
  }

  const sourceProjection = createCampaignProjection(width, height, state.fromFocus);
  const sourceRotate = sourceProjection.rotate();
  const targetRotate = targetProjection.rotate();
  const sameRotation = sourceRotate.every((value, index) => Math.abs(value - targetRotate[index]) < 0.001);
  if (!sameRotation) {
    return targetProjection;
  }

  const ratio = state.ratio;
  const sourceTranslate = sourceProjection.translate();
  const targetTranslate = targetProjection.translate();
  return targetProjection
    .scale(sourceProjection.scale() + (targetProjection.scale() - sourceProjection.scale()) * ratio)
    .translate([
      sourceTranslate[0] + (targetTranslate[0] - sourceTranslate[0]) * ratio,
      sourceTranslate[1] + (targetTranslate[1] - sourceTranslate[1]) * ratio
    ]);
}

function buildCurvedPath(points: Array<[number, number]>) {
  if (points.length < 2) {
    return "";
  }

  if (points.length > 2) {
    return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point[0]} ${point[1]}`).join(" ");
  }

  const [from, to] = points;
  const distance = Math.hypot(to[0] - from[0], to[1] - from[1]);
  if (distance < 0.01) {
    return `M ${from[0]} ${from[1]} L ${to[0]} ${to[1]}`;
  }

  const curve = Math.min(92, Math.max(24, distance * 0.16));
  const controlX = (from[0] + to[0]) / 2;
  const controlY = (from[1] + to[1]) / 2 - curve;
  return `M ${from[0]} ${from[1]} Q ${controlX} ${controlY} ${to[0]} ${to[1]}`;
}

function frontStrokeWidth(faction: string) {
  if (["germany", "allies", "carthage", "rome"].includes(faction)) {
    return 3.5;
  }
  return 3.1;
}

function routeFacingX(from: [number, number], to: [number, number], fallbackTo?: [number, number]): HorizontalFacing {
  const dx = to[0] - from[0];
  if (Math.abs(dx) >= 0.01) {
    return dx > 0 ? 1 : -1;
  }

  const fallbackDx = fallbackTo ? fallbackTo[0] - from[0] : 0;
  return fallbackDx < 0 ? -1 : 1;
}

function routeDirectionVector(from: [number, number], to: [number, number], fallbackTo?: [number, number]) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const fallbackDx = fallbackTo ? fallbackTo[0] - from[0] : 1;
  const fallbackDy = fallbackTo ? fallbackTo[1] - from[1] : 0;
  const length = Math.hypot(dx, dy);
  const fallbackLength = Math.hypot(fallbackDx, fallbackDy);

  if (length >= 0.01) {
    return { x: dx / length, y: dy / length };
  }

  if (fallbackLength >= 0.01) {
    return { x: fallbackDx / fallbackLength, y: fallbackDy / fallbackLength };
  }

  return { x: 1, y: 0 };
}

function routeLocalOffset(
  point: [number, number],
  direction: { x: number; y: number },
  offset: [number, number]
): [number, number] {
  const [along, cross] = offset;
  return [point[0] + direction.x * along - direction.y * cross, point[1] + direction.y * along + direction.x * cross];
}

function routeLength(points: Array<[number, number]>) {
  return points
    .slice(0, -1)
    .reduce((sum, point, index) => sum + Math.hypot(points[index + 1][0] - point[0], points[index + 1][1] - point[1]), 0);
}

function formationUnitPlacement(
  points: Array<[number, number]>,
  progress: number,
  offset: [number, number],
  offsetScale = 1
) {
  const totalLength = Math.max(routeLength(points), 1);
  const [along, cross] = offset;
  const scaledAlong = along * offsetScale;
  const scaledCross = cross * offsetScale;
  const rawProgress = progress + scaledAlong / totalLength;
  const unitProgress = Math.min(1, Math.max(0, rawProgress));
  const pointOnRoute = interpolateRoute(points, unitProgress);
  const directionAnchor = interpolateRoute(points, Math.max(0, unitProgress - 0.018));
  const fallbackPoint = interpolateRoute(points, Math.min(1, unitProgress + 0.018));
  const direction = routeDirectionVector(directionAnchor, pointOnRoute, fallbackPoint);
  const clampedAlongOverflow = rawProgress < 0 ? rawProgress * totalLength : rawProgress > 1 ? (rawProgress - 1) * totalLength : 0;
  const markerPoint = routeLocalOffset(pointOnRoute, direction, [clampedAlongOverflow, scaledCross]);

  return {
    direction,
    facingX: routeFacingX(directionAnchor, pointOnRoute, fallbackPoint),
    point: markerPoint,
    routeProgress: unitProgress
  };
}

function historicalRegionFeature(region: HistoricalRegion): GeoJSON.Feature<GeoJSON.Polygon, { name: string }> {
  const first = region.coordinates[0];
  const last = region.coordinates.at(-1);
  const ring =
    first && last && (first[0] !== last[0] || first[1] !== last[1])
      ? [...region.coordinates, first]
      : region.coordinates;

  return {
    type: "Feature",
    properties: { name: region.label },
    geometry: {
      type: "Polygon",
      coordinates: [ring]
    }
  };
}

function interpolateRoute(points: Array<[number, number]>, progress: number) {
  if (points.length < 2) {
    return points[0] ?? [0, 0];
  }

  const segmentLengths = points.slice(0, -1).map((point, index) => Math.hypot(points[index + 1][0] - point[0], points[index + 1][1] - point[1]));
  const totalLength = segmentLengths.reduce((sum, length) => sum + length, 0);
  let remaining = totalLength * Math.min(1, Math.max(0, progress));

  for (let index = 0; index < segmentLengths.length; index += 1) {
    const length = segmentLengths[index];
    if (remaining <= length || index === segmentLengths.length - 1) {
      const ratio = length === 0 ? 0 : remaining / length;
      return interpolatePoint(points[index], points[index + 1], ratio);
    }
    remaining -= length;
  }

  return points.at(-1)!;
}

function routePointsUntil(points: Array<[number, number]>, progress: number) {
  if (points.length < 2) {
    return points;
  }

  const currentPoint = interpolateRoute(points, progress);
  const segmentLengths = points.slice(0, -1).map((point, index) => Math.hypot(points[index + 1][0] - point[0], points[index + 1][1] - point[1]));
  const totalLength = segmentLengths.reduce((sum, length) => sum + length, 0);
  let remaining = totalLength * Math.min(1, Math.max(0, progress));
  const visible = [points[0]];

  for (let index = 0; index < segmentLengths.length; index += 1) {
    const length = segmentLengths[index];
    if (remaining >= length) {
      visible.push(points[index + 1]);
      remaining -= length;
    } else {
      visible.push(currentPoint);
      break;
    }
  }

  return visible;
}

function ActiveEventEffect({
  kind,
  pulse,
  x,
  y
}: {
  kind: "airCombat" | "aircraft" | "ancient" | "gunpowder" | "ww2";
  pulse: number;
  x: number;
  y: number;
}) {
  if (kind === "airCombat") {
    const rotation = pulse * 92;
    return (
      <g className="dogfight-clash" data-testid="dogfight-clash" transform={`translate(${x} ${y}) rotate(${rotation})`}>
        <circle r={18 + pulse * 12} />
        <circle r={31 + pulse * 10} />
        <path className="dogfight-turn-arc" d="M -34 -8 C -18 -34 20 -33 36 -6" />
        <path className="dogfight-turn-arc dogfight-turn-arc-alt" d="M 32 10 C 12 34 -24 29 -37 4" />
        <path className="dogfight-tracer" d="M -26 -18 l 18 6" />
        <path className="dogfight-tracer dogfight-tracer-alt" d="M 18 18 l -19 -5" />
        <path className="dogfight-flash" d="M 0 -10 L 4 -2 L 13 -1 L 5 4 L 8 13 L 0 8 L -8 13 L -5 4 L -13 -1 L -4 -2 Z" />
      </g>
    );
  }

  if (kind === "aircraft") {
    return (
      <g className="aircraft-contact-pulse" data-testid="aircraft-contact-pulse" transform={`translate(${x} ${y})`}>
        <circle r={16 + pulse * 12} />
        <circle r={28 + pulse * 10} />
        <path d="M -24 2 C -8 -11 10 -11 24 2" />
        <path d="M -12 -9 L 0 -18 L 12 -9" />
      </g>
    );
  }

  if (kind === "ancient") {
    return (
      <g className="melee-clash" data-testid="melee-clash">
        <circle cx={x} cy={y} r={16 + pulse * 14} />
        <circle cx={x} cy={y} r={26 + pulse * 16} />
        <path d={`M ${x - 18} ${y - 18} L ${x + 18} ${y + 18}`} />
        <path d={`M ${x + 18} ${y - 18} L ${x - 18} ${y + 18}`} />
        <path d={`M ${x - 7} ${y - 24} L ${x + 7} ${y - 24} L ${x} ${y - 34} Z`} />
        <path d={`M ${x - 7} ${y + 24} L ${x + 7} ${y + 24} L ${x} ${y + 34} Z`} />
      </g>
    );
  }

  return (
    <g className="explosion-burst" data-testid="explosion-burst">
      <circle cx={x} cy={y} r={16 + pulse * 16} />
      <circle cx={x} cy={y} r={28 + pulse * 18} />
      <path
        d={`M ${x} ${y - 23} L ${x + 7} ${y - 8} L ${x + 23} ${y - 7} L ${x + 10} ${y + 3} L ${x + 15} ${y + 20} L ${x} ${y + 11} L ${x - 15} ${y + 20} L ${x - 10} ${y + 3} L ${x - 23} ${y - 7} L ${x - 7} ${y - 8} Z`}
      />
    </g>
  );
}

function SalvoBattleEffect({
  effect,
  progress,
  project
}: {
  effect: SalvoBattleEffectElement;
  progress: number;
  project: (coordinates: [number, number]) => [number, number];
}) {
  const shellOffsets = effect.shellOffsets ?? [
    [-8, -16],
    [10, -6],
    [-14, 10],
    [16, 16]
  ];
  const impactOffsets = effect.impactOffsets ?? [
    [-14, -10],
    [8, -16],
    [18, 2],
    [-6, 12],
    [10, 18]
  ];
  const from = project(effect.from);
  const to = project(effect.to);
  const easedProgress = smoothStep(progress);
  const showShellTraces = effect.showShellTraces ?? true;

  return (
    <g
      className={`battle-effect battle-salvo-effect ${effect.className ?? ""}`}
      data-effect-progress={progress.toFixed(3)}
      data-testid={effect.testId ?? `battle-effect-${effect.id}`}
    >
      {showShellTraces &&
        shellOffsets.map((offset, index) => {
          const start: [number, number] = [from[0] + offset[0], from[1] + offset[1]];
          const end: [number, number] = [to[0] + offset[0] * 0.22, to[1] + offset[1] * 0.18];
          const shellX = start[0] + (end[0] - start[0]) * easedProgress;
          const shellY = start[1] + (end[1] - start[1]) * easedProgress;
          return (
            <g key={`${effect.id}-shell-${index}`} className="salvo-shell">
              <path className="salvo-shell-trace" d={`M ${start[0]} ${start[1]} L ${end[0]} ${end[1]}`} />
              <circle className="salvo-shell-head" cx={shellX} cy={shellY} r={2.7} />
            </g>
          );
        })}
      {impactOffsets.map((offset, index) => (
        <g
          key={`${effect.id}-impact-${index}`}
          data-impact-x={(to[0] + offset[0]).toFixed(1)}
          data-impact-y={(to[1] + offset[1]).toFixed(1)}
          transform={`translate(${to[0] + offset[0]} ${to[1] + offset[1]})`}
        >
          <g className="salvo-impact" style={{ animationDelay: `${index * 0.14}s` }}>
            <circle r={7 + index * 1.6} />
            <path d="M 0 -15 L 4 -4 L 16 -3 L 6 3 L 10 14 L 0 7 L -10 14 L -6 3 L -16 -3 L -4 -4 Z" />
          </g>
        </g>
      ))}
      {effect.label && (
        <text className="salvo-label" x={to[0] + 22} y={to[1] - 24}>
          {effect.label}
        </text>
      )}
    </g>
  );
}

function DogfightBattleEffect({
  effect,
  progress,
  project
}: {
  effect: DogfightBattleEffectElement;
  progress: number;
  project: (coordinates: [number, number]) => [number, number];
}) {
  const [x, y] = project(effect.center);
  const radius = effect.radius ?? 42;
  const intensity = effect.intensity ?? 1;
  const rotation = progress * 118;
  const arcs = [
    { className: "dogfight-effect-arc", d: `M ${-radius} ${-radius * 0.15} C ${-radius * 0.45} ${-radius * 0.75} ${radius * 0.45} ${-radius * 0.72} ${radius} ${-radius * 0.12}` },
    { className: "dogfight-effect-arc dogfight-effect-arc-secondary", d: `M ${radius * 0.82} ${radius * 0.26} C ${radius * 0.18} ${radius * 0.82} ${-radius * 0.6} ${radius * 0.65} ${-radius * 0.98} ${radius * 0.05}` },
    { className: "dogfight-effect-arc dogfight-effect-arc-tertiary", d: `M ${-radius * 0.2} ${radius * 0.92} C ${radius * 0.2} ${radius * 0.3} ${radius * 0.16} ${-radius * 0.28} ${-radius * 0.18} ${-radius * 0.9}` }
  ];
  const flashes = [
    [-0.42, -0.28],
    [0.28, 0.12],
    [0.04, -0.54],
    [-0.16, 0.42]
  ];

  return (
    <g
      className={`battle-effect battle-dogfight-effect ${effect.className ?? ""}`}
      data-effect-progress={progress.toFixed(3)}
      data-testid={effect.testId ?? `battle-effect-${effect.id}`}
      transform={`translate(${x} ${y}) rotate(${rotation})`}
    >
      <circle className="dogfight-effect-zone" r={radius * (0.72 + intensity * 0.16)} />
      {arcs.map((arc, index) => (
        <path key={`${effect.id}-arc-${index}`} className={arc.className} d={arc.d} style={{ animationDelay: `${index * 0.14}s` }} />
      ))}
      {flashes.map(([offsetX, offsetY], index) => (
        <g
          key={`${effect.id}-flash-${index}`}
          className="dogfight-effect-flash"
          style={{ animationDelay: `${index * 0.18}s` }}
          transform={`translate(${offsetX * radius} ${offsetY * radius}) rotate(${-rotation + index * 22})`}
        >
          <path className="dogfight-effect-tracer" d={`M ${-12 - index * 2} ${-4 + index} l ${19 + index * 2} ${5 - index}`} />
          <path className="dogfight-effect-hit" d="M 0 -7 L 3 -2 L 9 -1 L 4 3 L 6 9 L 0 5 L -6 9 L -4 3 L -9 -1 L -3 -2 Z" />
        </g>
      ))}
      {effect.label && (
        <text className="dogfight-effect-label" x={radius + 12} y={-radius * 0.58} transform={`rotate(${-rotation})`}>
          {effect.label}
        </text>
      )}
    </g>
  );
}

function StaticEventIcon({
  kind,
  x,
  y
}: {
  kind: "ancient" | "gunpowder" | "ww2";
  x: number;
  y: number;
}) {
  if (kind === "ancient") {
    return (
      <g className="static-melee-icon">
        <path d={`M ${x - 10} ${y - 10} L ${x + 10} ${y + 10}`} />
        <path d={`M ${x + 10} ${y - 10} L ${x - 10} ${y + 10}`} />
      </g>
    );
  }

  return (
    <path
      className="static-battle-icon"
      d={`M ${x} ${y - 11} L ${x + 5} ${y - 3} L ${x + 14} ${y - 2} L ${x + 7} ${y + 4} L ${x + 9} ${y + 13} L ${x} ${y + 8} L ${x - 9} ${y + 13} L ${x - 7} ${y + 4} L ${x - 14} ${y - 2} L ${x - 5} ${y - 3} Z`}
    />
  );
}

export function CampaignMapAnimation({
  activeSpans,
  ariaLabel,
  battleEvents,
  battleEffects = [],
  campaignEnd,
  campaignStart,
  cinematicMode = false,
  countries,
  countryClassName,
  cueEvents,
  cueEventKinds = {},
  diveCueEvents = new Set(),
  eyebrow,
  frontLines,
  focusSteps,
  focusTransitionProgress = 0,
  fortifiedLines = [],
  gapScale,
  gapOverrides,
  historicalRegions = [],
  inactiveGapDisplayDays,
  legendAxis = "战役轴线",
  legendPrimary = "主攻推进",
  legendSecondary = "反击/联军行动",
  mapDimensions,
  mapPoints,
  mapOverlays = [],
  maxGapDays,
  musicSource,
  narrationCues = [],
  outcomeStats = [],
  playbackDurationSeconds,
  regionLabels,
  retainSeaUnitsAfterRouteEnd = false,
  rivers = [],
  shellClassName = "",
  sfxProfile = "ww2",
  subtitle,
  tacticalRouteRetention = false,
  terrainZones = [],
  testId,
  timeCounterLabel = "周",
  timeStepDays = 7,
  timingMode,
  timelineTitle,
  title,
  unitIcon = "tank"
}: CampaignMapAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScoreEnabled, setIsScoreEnabled] = useState(true);
  const [isScoreRunning, setIsScoreRunning] = useState(false);
  const lastFrameRef = useRef<number | null>(null);
  const scoreRef = useRef<WarScore | null>(null);
  const lastCueEventRef = useRef<string | null>(null);
  const playbackSpeed = 1 / playbackDurationSeconds;
  const mapWidth = mapDimensions?.width ?? defaultMapWidth;
  const mapHeight = mapDimensions?.height ?? defaultMapHeight;

  const timeline = useMemo(
    () =>
      createCampaignTimeline({
        campaignStart,
        campaignEnd,
        activeSpans,
        gapScale,
        gapOverrides,
        inactiveGapDisplayDays,
        maxGapDays,
        events: battleEvents,
        points: mapPoints,
        timingMode
      }),
    [
      activeSpans,
      battleEvents,
      campaignEnd,
      campaignStart,
      gapScale,
      gapOverrides,
      inactiveGapDisplayDays,
      mapPoints,
      maxGapDays,
      timingMode
    ]
  );

  const activeEvent = timeline.getActiveEvent(progress);
  const upcomingEvent = timeline.getUpcomingEvent(progress);
  const currentDate = timeline.progressToDate(progress, timeStepDays);
  const elapsedDisplayDays = timeline.displayDaysAtProgress(progress);
  const currentTimeCounter =
    timeCounterLabel === "小时"
      ? Math.max(1, Math.round(elapsedDisplayDays * 24) + 1)
      : timeCounterLabel === "天"
        ? Math.max(1, Math.round(elapsedDisplayDays) + 1)
        : Math.max(1, Math.round(elapsedDisplayDays / 7) + 1);
  const focusState = useMemo(
    () => focusTransitionState(focusSteps, progress, focusTransitionProgress),
    [focusSteps, focusTransitionProgress, progress]
  );
  const mapFocus = focusState.focus;
  const {
    canZoomIn,
    canZoomOut,
    isMapDragging,
    mapInteractionProps,
    mapTransform,
    resetMapView,
    stageRef,
    svgRef,
    zoomIn,
    zoomOut
  } = useMapInteraction(mapWidth, mapHeight, mapFocus);
  const projection = useMemo(() => createFocusProjection(mapWidth, mapHeight, focusState), [focusState]);
  const targetFocusProjection = useMemo(() => createCampaignProjection(mapWidth, mapHeight, mapFocus), [mapFocus]);
  const formationOffsetScale = useMemo(() => {
    const targetScale = targetFocusProjection.scale();
    const currentScale = projection.scale();
    if (!Number.isFinite(targetScale) || !Number.isFinite(currentScale) || targetScale <= 0) {
      return 1;
    }

    return Math.min(1.35, Math.max(0.35, currentScale / targetScale));
  }, [projection, targetFocusProjection]);
  const countryPath = useMemo(() => countryPathFactory(projection), [projection]);

  useEffect(() => {
    scoreRef.current = new WarScore(musicSource);
    return () => {
      void scoreRef.current?.stop();
      scoreRef.current = null;
    };
  }, [musicSource]);

  useEffect(() => {
    if (!isPlaying) {
      lastFrameRef.current = null;
      return;
    }

    let frameId = 0;

    const tick = (timestamp: number) => {
      if (lastFrameRef.current === null) {
        lastFrameRef.current = timestamp;
      }

      const delta = timestamp - lastFrameRef.current;
      lastFrameRef.current = timestamp;

      setProgress((current) => {
        const next = timeline.clampProgress(current + (delta / 1000) * playbackSpeed);
        if (next >= 1) {
          setIsPlaying(false);
          void scoreRef.current?.pause().then(() => setIsScoreRunning(false));
        }
        return next;
      });

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, playbackSpeed, timeline]);

  useEffect(() => {
    const isCueInWindow = timeline.eventProgress(activeEvent.date, progress) >= cuePulseThreshold;
    if (
      !isPlaying ||
      !isScoreEnabled ||
      !isCueInWindow ||
      lastCueEventRef.current === activeEvent.id ||
      !cueEvents.has(activeEvent.id)
    ) {
      return;
    }

    lastCueEventRef.current = activeEvent.id;
    void scoreRef.current?.playBattleCue(battleCueForEvent(activeEvent.id));
  }, [activeEvent.date, activeEvent.id, cueEvents, diveCueEvents, isPlaying, isScoreEnabled, progress, sfxProfile, timeline]);

  const visibleEvents = useMemo(
    () =>
      battleEvents.map((event) => ({
        ...event,
        weight: timeline.eventProgress(event.date, progress),
        passed: timeline.dateToProgress(event.date) <= progress
      })),
    [battleEvents, progress, timeline]
  );

  const projectedPoints = useMemo(
    () => new Map(mapPoints.map((point) => [point.id, projectPoint(projection, point.coordinates)] as const)),
    [mapPoints, projection]
  );

  const projectedBattleEvents = useMemo(
    () =>
      visibleEvents.map((event) => ({
        ...event,
        xy: projectPoint(projection, event.coordinates)
      })),
    [projection, visibleEvents]
  );

  const visibleBattleEffects = useMemo(
    () =>
      battleEffects
        .map((effect) => {
          const start = timeline.dateToProgress(effect.start);
          const end = timeline.dateToProgress(effect.end);
          if (progress < start || progress > end) {
            return null;
          }

          const effectProgress = end > start ? (progress - start) / (end - start) : 1;
          if (effect.type === "salvo" && (effect.fromRouteId || effect.toRouteId)) {
            const routePointAtCurrentTime = (routeId: string) => {
              const line = frontLines.find((frontLine) => frontLine.id === routeId);
              if (!line) {
                return undefined;
              }

              const routePoints = [
                timeline.findPoint(line.from).coordinates,
                ...(line.waypoints ?? []),
                timeline.findPoint(line.to).coordinates
              ];
              return interpolateRoute(routePoints, timeline.lineProgress(line.start, line.end, progress));
            };

            return {
              ...effect,
              from: effect.fromRouteId ? routePointAtCurrentTime(effect.fromRouteId) ?? effect.from : effect.from,
              progress: Math.min(1, Math.max(0, effectProgress)),
              to: effect.toRouteId ? routePointAtCurrentTime(effect.toRouteId) ?? effect.to : effect.to
            };
          }

          return {
            ...effect,
            progress: Math.min(1, Math.max(0, effectProgress))
          };
        })
        .filter((effect): effect is BattleEffectElement & { progress: number } => Boolean(effect)),
    [battleEffects, frontLines, progress, timeline]
  );

  const activeEventPoint = useMemo(() => projectPoint(projection, activeEvent.coordinates), [activeEvent.coordinates, projection]);
  const visibleRetainedSeaUnitGroups = useMemo(() => {
    if (!retainSeaUnitsAfterRouteEnd) {
      return new Set<string>();
    }

    const groups = new Map<
      string,
      {
        id: string;
        lineStart: number;
      }
    >();

    frontLines.forEach((line) => {
      if (line.routeKind !== "sea" || line.hideUnit || !line.unitGroupId || !line.retainUnitAfterRouteEnd) {
        return;
      }

      const lineStart = timeline.dateToProgress(line.start);
      const unitStart = line.unitVisibleFrom ? timeline.dateToProgress(line.unitVisibleFrom) : lineStart;
      const unitEnd = line.unitVisibleUntil ? timeline.dateToProgress(line.unitVisibleUntil) : Number.POSITIVE_INFINITY;
      if (progress < lineStart || progress < unitStart || progress > unitEnd) {
        return;
      }

      const groupId = line.unitGroupId;
      const existing = groups.get(groupId);
      if (!existing || lineStart >= existing.lineStart) {
        groups.set(groupId, {
          id: line.id,
          lineStart
        });
      }
    });

    return new Set([...groups.values()].map((group) => group.id));
  }, [frontLines, progress, retainSeaUnitsAfterRouteEnd, timeline]);

  const activeNarrationCue = useMemo(() => {
    if (narrationCues.length === 0) {
      return undefined;
    }

    return narrationCues.find((cue, index) => {
      const start = timeline.dateToProgress(cue.start);
      const end = timeline.dateToProgress(cue.end);
      const isLast = index === narrationCues.length - 1;
      return progress >= start && (progress < end || (isLast && progress <= end));
    });
  }, [narrationCues, progress, timeline]);

  const projectLine = (points: Array<[number, number]>) =>
    points
      .map((coordinates) => projectPoint(projection, coordinates))
      .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" ");

  const battleCueForEvent = (eventId: string): BattleCueKind => {
    const configuredKind = cueEventKinds[eventId];
    if (configuredKind) {
      return configuredKind;
    }

    if (sfxProfile === "ancient") {
      return "melee";
    }

    if (sfxProfile === "gunpowder") {
      return "cannon";
    }

    return diveCueEvents.has(eventId) ? "dive" : "combined";
  };

  const visualEffectKindForEvent = (eventId: string): "airCombat" | "aircraft" | "ancient" | "gunpowder" | "ww2" => {
    const cueKind = battleCueForEvent(eventId);
    if (cueKind === "airCombat" || cueKind === "strafing") {
      return "airCombat";
    }

    if (cueKind === "aircraft") {
      return "aircraft";
    }

    return sfxProfile;
  };

  const playEventCue = (eventId: string) => {
    scoreRef.current?.cancelPendingBattleCues();

    if (!isScoreEnabled || !cueEvents.has(eventId)) {
      return;
    }

    lastCueEventRef.current = eventId;
    void scoreRef.current?.playBattleCue(battleCueForEvent(eventId));
  };

  const handleRangeChange = (value: string) => {
    scoreRef.current?.cancelPendingAirCues();
    setProgress(Number(value) / 1000);
  };

  const startScore = async () => {
    if (!isScoreEnabled) {
      return;
    }

    await scoreRef.current?.start();
    setIsScoreRunning(true);
  };

  const pauseScore = async () => {
    await scoreRef.current?.pause();
    setIsScoreRunning(false);
  };

  const togglePlayback = async () => {
    const nextPlaying = !isPlaying;
    setIsPlaying(nextPlaying);

    if (nextPlaying) {
      await startScore();
    } else {
      await pauseScore();
    }
  };

  const toggleScore = async () => {
    const nextEnabled = !isScoreEnabled;
    setIsScoreEnabled(nextEnabled);

    if (nextEnabled) {
      await scoreRef.current?.start();
      setIsScoreRunning(true);
    } else {
      await pauseScore();
    }
  };

  const jumpToEvent = (event: BattleEvent) => {
    setProgress(timeline.dateToProgress(event.date));
    window.scrollTo({ left: 0, top: 0, behavior: "smooth" });
    playEventCue(event.id);
  };

  const shellClasses = ["app-shell", shellClassName, cinematicMode ? "cinematic-mode" : ""].filter(Boolean).join(" ");

  return (
    <main className={shellClasses} data-testid={testId}>
      <section className="control-deck" data-testid="control-deck">
        <div className="transport">
          <button
            type="button"
            data-testid="play-pause"
            onClick={() => {
              void togglePlayback();
            }}
            aria-label={isPlaying ? "暂停动画" : "播放动画"}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            {isPlaying ? "暂停" : "播放"}
          </button>
          <button
            type="button"
            data-testid="replay"
            onClick={() => {
              setIsPlaying(false);
              void pauseScore();
              lastCueEventRef.current = null;
              setProgress(0);
            }}
          >
            <RotateCcw size={18} />
            回放
          </button>
          <button
            type="button"
            data-testid="score-toggle"
            data-music-source={musicSource}
            onClick={() => {
              void toggleScore();
            }}
            aria-label={isScoreEnabled ? "关闭循环战争配乐" : "开启循环战争配乐"}
          >
            {isScoreEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            配乐{isScoreEnabled ? (isScoreRunning ? "循环中" : "待播放") : "关闭"}
          </button>
          <span className="clock" data-testid="current-date">
            {formatChineseDate(currentDate)}
          </span>
        </div>

        <div className="timeline-stack">
          <label className="timeline-range" htmlFor={`${testId}-timeline`}>
            <span>时间轴拖拽</span>
            <input
              id={`${testId}-timeline`}
              data-testid="timeline"
              type="range"
              min="0"
              max="1000"
              value={Math.round(progress * 1000)}
              onChange={(event) => handleRangeChange(event.target.value)}
            />
          </label>

          <div className="event-rail" data-testid="event-rail">
            {battleEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                className={event.id === activeEvent.id ? "active" : ""}
                style={{ left: `${timeline.dateToProgress(event.date) * 100}%` }}
                onClick={() => jumpToEvent(event)}
                aria-label={`跳到${event.title}`}
                title={`${event.date} ${event.title}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="cinema-grid">
        <article ref={stageRef} className="map-stage" data-testid="map-stage">
          <div className="map-topbar map-overlay">
            <div className="map-title-card" data-testid="map-title-card">
              <p className="map-eyebrow">{eyebrow}</p>
              <h1>{title}</h1>
            </div>
            <span className="day-counter">
              第 {currentTimeCounter} {timeCounterLabel}
            </span>
          </div>

          <svg
            ref={svgRef}
            className={`battle-map is-interactive-map ${isMapDragging ? "is-dragging" : ""}`}
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={ariaLabel}
            {...mapInteractionProps}
          >
            <defs>
              <linearGradient id="oceanGradient" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#263f47" />
                <stop offset="55%" stopColor="#1d3439" />
                <stop offset="100%" stopColor="#14282c" />
              </linearGradient>
              <linearGradient id="landGradient" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#e3d8ae" />
                <stop offset="52%" stopColor="#aebc91" />
                <stop offset="100%" stopColor="#718e76" />
              </linearGradient>
              <linearGradient id="frontGermanyGradient" x1="0" x2="1">
                <stop offset="0%" stopColor="#f6a34b" />
                <stop offset="60%" stopColor="#d84a36" />
                <stop offset="100%" stopColor="#8f2526" />
              </linearGradient>
              <linearGradient id="frontAlliesGradient" x1="0" x2="1">
                <stop offset="0%" stopColor="#bce8ff" />
                <stop offset="55%" stopColor="#4aa3d8" />
                <stop offset="100%" stopColor="#1f5f9d" />
              </linearGradient>
              <linearGradient id="frontBritainGradient" x1="0" x2="1">
                <stop offset="0%" stopColor="#fff1ad" />
                <stop offset="56%" stopColor="#d9a943" />
                <stop offset="100%" stopColor="#8f6b24" />
              </linearGradient>
              <radialGradient id="blast" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffef9a" stopOpacity="0.95" />
                <stop offset="65%" stopColor="#d34532" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#d34532" stopOpacity="0" />
              </radialGradient>
              <pattern id="mapTexture" width="36" height="36" patternUnits="userSpaceOnUse">
                <path d="M0 18H36M18 0V36" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <circle cx="18" cy="18" r="1.2" fill="rgba(255,255,255,0.08)" />
              </pattern>
              <linearGradient id="ancientPaperGradient" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#e7c98d" />
                <stop offset="46%" stopColor="#d8b36e" />
                <stop offset="100%" stopColor="#b9874d" />
              </linearGradient>
              <pattern id="ancientPaperTexture" width="92" height="92" patternUnits="userSpaceOnUse">
                <rect width="92" height="92" fill="rgba(79, 45, 18, 0.06)" />
                <path d="M0 18C18 8 31 26 46 16S78 9 92 20M0 62C21 51 34 72 52 60S76 51 92 64" stroke="rgba(88, 50, 22, 0.11)" strokeWidth="1.1" />
                <path d="M18 0V92M55 0V92" stroke="rgba(95, 52, 20, 0.07)" strokeWidth="1" />
                <circle cx="22" cy="26" r="1.1" fill="rgba(75, 42, 17, 0.14)" />
                <circle cx="68" cy="74" r="1.4" fill="rgba(75, 42, 17, 0.1)" />
              </pattern>
              <filter id="frontGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="cinematicSoftBlur" x="-35%" y="-35%" width="170%" height="170%">
                <feGaussianBlur stdDeviation="10" />
              </filter>
              <marker id="arrow-germany" markerHeight="8" markerWidth="10" orient="auto" refX="9" refY="4">
                <path d="M0 0L10 4L0 8L2 4Z" fill="#d84a36" />
              </marker>
              <marker id="arrow-allies" markerHeight="8" markerWidth="10" orient="auto" refX="9" refY="4">
                <path d="M0 0L10 4L0 8L2 4Z" fill="#4aa3d8" />
              </marker>
              <marker id="arrow-wind" markerHeight="12" markerWidth="16" orient="auto" refX="14" refY="6">
                <path d="M0 0L16 6L0 12L4 6Z" fill="#f3d27a" />
              </marker>
            </defs>

            <rect className="map-base" width={mapWidth} height={mapHeight} fill="url(#oceanGradient)" />
            <rect className="map-texture" width={mapWidth} height={mapHeight} fill="url(#mapTexture)" opacity="0.72" />
            <g
              className="camera-layer"
              data-focus-from={focusState.fromFocus}
              data-formation-offset-scale={formationOffsetScale.toFixed(3)}
              data-focus-transition-ratio={focusState.ratio.toFixed(3)}
              data-map-focus={mapFocus}
              data-testid="camera-layer"
              transform={mapTransform}
            >
              {historicalRegions.length === 0 && (
                <image
                  className="ancient-map-ornaments"
                  data-testid="ancient-map-ornaments"
                  href={publicPath("/assets/maps/qin-warring-states-map.svg")}
                  width={mapWidth}
                  height={mapHeight}
                  preserveAspectRatio="xMidYMid meet"
                  aria-hidden="true"
                />
              )}
              <g className="country-layer">
                {countries.map((country) => (
                  <path
                    key={country.properties?.name}
                    d={countryPath(country) ?? undefined}
                    className={countryClassName(country)}
                  />
                ))}
              </g>
              {historicalRegions.length > 0 && (
                <g className="historical-map-layer" data-testid="historical-map-layer">
                  <rect className="historical-paper-field" x={26} y={24} width={mapWidth - 52} height={mapHeight - 48} rx={28} />
                  {historicalRegions.map((region) => {
                    const [x, y] = projectPoint(projection, region.labelCoordinates ?? region.coordinates[0]);
                    return (
                      <g key={region.id} className="historical-region-group">
                        <path
                          className={`historical-region historical-region-${region.id} ${region.className ?? ""}`}
                          data-testid={`historical-region-${region.id}`}
                          d={countryPath(historicalRegionFeature(region)) ?? undefined}
                        />
                        <text
                          className={`historical-region-name historical-region-name-${region.id}`}
                          data-testid={`historical-region-label-${region.id}`}
                          x={x}
                          y={y}
                        >
                          {region.label}
                        </text>
                      </g>
                    );
                  })}
                  <g className="historical-control-layer" data-testid="historical-control-layer">
                    {historicalRegions.map((region) => {
                      if (!region.captureDate || timeline.dateToProgress(region.captureDate) > progress) {
                        return null;
                      }

                      return (
                        <path
                          key={region.id}
                          className={`historical-control historical-control-${region.id}`}
                          data-testid={`historical-control-${region.id}`}
                          d={countryPath(historicalRegionFeature(region)) ?? undefined}
                        />
                      );
                    })}
                  </g>
                </g>
              )}
              <g className="river-layer">
                {rivers.map((river) => (
                  <polyline key={river.id} points={projectLine(river.points)} className={`river river-${river.id}`} />
                ))}
              </g>
              {fortifiedLines.length > 0 && (
                <g className="fortified-line-layer" data-testid="fortified-line-layer">
                  {fortifiedLines.map((line) => {
                    if (line.revealAt && progress < timeline.dateToProgress(line.revealAt)) {
                      return null;
                    }

                    if (line.visibleUntil && progress > timeline.dateToProgress(line.visibleUntil)) {
                      return null;
                    }

                    const labelPoint = line.points[Math.max(0, Math.floor(line.points.length / 3))] ?? line.points[0];
                    const [x, y] = projectPoint(projection, labelPoint);
                    return (
                      <g
                        key={line.id}
                        className={`fortified-line fortified-line-${line.id} ${line.className ?? ""}`}
                        data-testid={line.testId ?? `fortified-line-${line.id}`}
                      >
                        <polyline points={projectLine(line.points)} />
                        <text x={x} y={y - 10}>
                          {line.label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}
              <g className="terrain-layer">
                {terrainZones.map((zone) => {
                  const [cx, cy] = projectPoint(projection, zone.coordinates);
                  const [x, y] = projectPoint(projection, zone.labelCoordinates);
                  return (
                    <g key={zone.label}>
                      <ellipse cx={cx} cy={cy} rx={zone.rx} ry={zone.ry} className={zone.className ?? "forest-zone"} />
                      <text x={x} y={y} className="terrain-label">
                        {zone.label}
                      </text>
                    </g>
                  );
                })}
              </g>
              <g className="region-labels">
                {regionLabels.map((label) => {
                  const [x, y] = projectPoint(projection, label.coordinates);
                  return (
                    <text key={label.label} x={x} y={y}>
                      {label.label}
                    </text>
                  );
                })}
              </g>

              {mapOverlays.length > 0 && (
                <g className="map-overlay-elements" data-testid="map-overlay-elements">
                  {mapOverlays.map((overlay) => {
                    if (overlay.revealAt && progress < timeline.dateToProgress(overlay.revealAt)) {
                      return null;
                    }

                    if (overlay.type === "wind") {
                      const [x1, y1] = projectPoint(projection, overlay.from);
                      const [x2, y2] = projectPoint(projection, overlay.to);
                      return (
                        <g
                          key={overlay.id}
                          className={`wind-overlay ${overlay.className ?? ""}`}
                          data-testid={overlay.testId ?? `wind-overlay-${overlay.id}`}
                        >
                          <path d={`M ${x1} ${y1} L ${x2} ${y2}`} markerEnd="url(#arrow-wind)" />
                          <text x={(x1 + x2) / 2 + 12} y={(y1 + y2) / 2 - 10}>
                            {overlay.label}
                          </text>
                        </g>
                      );
                    }

                    const [x, y] = projectPoint(projection, overlay.coordinates);
                    return (
                      <g
                        key={overlay.id}
                        className={`annotation-marker ${overlay.className ?? ""}`}
                        data-testid={overlay.testId ?? `annotation-marker-${overlay.id}`}
                        transform={`translate(${x} ${y})`}
                      >
                        <circle r="8" />
                        <path d="M -12 -12 L 12 12 M 12 -12 L -12 12" />
                        <text x="16" y="-4">
                          {overlay.label}
                        </text>
                        {overlay.subtitle && (
                          <text className="annotation-subtitle" x="16" y="14">
                            {overlay.subtitle}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              )}

              {frontLines.map((line) => {
                const startPoint = projectedPoints.get(line.from) ?? projectPoint(projection, timeline.findPoint(line.from).coordinates);
                const endPoint = projectedPoints.get(line.to) ?? projectPoint(projection, timeline.findPoint(line.to).coordinates);
                const projectedRoutePoints = [
                  startPoint,
                  ...(line.waypoints ?? []).map((coordinates) => projectPoint(projection, coordinates)),
                  endPoint
                ];
                const formationRoutePoints = [
                  ...(line.formationPrelude ?? []).map((coordinates) => projectPoint(projection, coordinates)),
                  ...projectedRoutePoints
                ];
                const formationPreludeLength = line.formationPrelude
                  ? routeLength((line.formationPrelude ?? []).map((coordinates) => projectPoint(projection, coordinates)).concat([startPoint]))
                  : 0;
                const formationRouteTotalLength = Math.max(routeLength(formationRoutePoints), 1);
                const projectedRouteLength = routeLength(projectedRoutePoints);
                const segmentProgress = timeline.lineProgress(line.start, line.end, progress);
                const formationSegmentProgress =
                  (formationPreludeLength + projectedRouteLength * segmentProgress) / formationRouteTotalLength;
                const lineStartProgress = timeline.dateToProgress(line.start);
                const lineEndProgress = timeline.dateToProgress(line.end);
                const isComplete = progress >= lineEndProgress;
                const drawnProgress = tacticalRouteRetention && isComplete ? 1 : segmentProgress;
                const visibleRoutePoints = routePointsUntil(projectedRoutePoints, drawnProgress);
                const movingPoint = interpolateRoute(projectedRoutePoints, segmentProgress);
                const currentPoint = tacticalRouteRetention && isComplete ? (visibleRoutePoints.at(-1) ?? startPoint) : movingPoint;
                const isActive = segmentProgress > 0 && segmentProgress < 1;
                const routeState = isActive ? "is-active" : isComplete ? "is-complete" : "is-forming";
                const hasRouteStarted = progress >= lineStartProgress;
                const isWithinRouteVisibleWindow = !line.visibleUntil || progress <= timeline.dateToProgress(line.visibleUntil);
                const isVisible = hasRouteStarted && isWithinRouteVisibleWindow;
                const participatesInRetainedSeaGroup =
                  retainSeaUnitsAfterRouteEnd &&
                  line.routeKind === "sea" &&
                  line.retainUnitAfterRouteEnd &&
                  Boolean(line.unitGroupId);
                const retainsSeaUnit =
                  participatesInRetainedSeaGroup && visibleRetainedSeaUnitGroups.has(line.id);
                const isUnitVisible =
                  !line.hideUnit &&
                  hasRouteStarted &&
                  (!line.unitVisibleFrom || progress >= timeline.dateToProgress(line.unitVisibleFrom)) &&
                  (!participatesInRetainedSeaGroup || retainsSeaUnit) &&
                  (retainsSeaUnit || !line.unitVisibleUntil || progress <= timeline.dateToProgress(line.unitVisibleUntil));
                const routePath = buildCurvedPath(visibleRoutePoints);
                const directionAnchorPoint = interpolateRoute(projectedRoutePoints, Math.max(0, segmentProgress - 0.018));
                const labelPoint =
                  tacticalRouteRetention && isComplete ? interpolateRoute(projectedRoutePoints, 0.58) : currentPoint;
                const icon = line.unitIcon ?? (line.routeKind === "sea" ? "ship" : line.routeKind === "air" ? "fighter" : unitIcon);
                const fallbackDirectionPoint = interpolateRoute(projectedRoutePoints, Math.min(1, segmentProgress + 0.018));
                const facingX = routeFacingX(directionAnchorPoint, movingPoint, fallbackDirectionPoint);
                const routeDirection = routeDirectionVector(directionAnchorPoint, movingPoint, fallbackDirectionPoint);
                const formationUnits =
                  line.formationUnits && line.formationUnits.length > 0
                    ? line.formationUnits
                    : [
                        {
                          badgeLabel: line.unitBadgeLabel,
                          faction: line.faction,
                          icon,
                          id: "unit",
                          label: "",
                          offset: [0, 0] as [number, number]
                        }
                      ];

                if (!isVisible) {
                  return null;
                }

                return (
                  <g
                    key={line.id}
                    className={`front-line route-${line.routeKind ?? "land"} ${factionClass(line.faction)} ${routeState}`}
                    data-route-from={line.from}
                    data-route-id={line.id}
                    data-route-label={line.label}
                    data-route-point-count={projectedRoutePoints.length}
                    data-route-state={routeState}
                    data-route-end={line.end}
                    data-route-start={line.start}
                    data-route-to={line.to}
                    data-route-visible-until={line.visibleUntil ?? ""}
                    data-unit-visible-until={line.unitVisibleUntil ?? ""}
                    data-unit-visible={isUnitVisible}
                  >
                    <path className="front-halo" d={routePath} strokeWidth={frontStrokeWidth(line.faction) + 7} />
                    <path
                      className="front-route"
                      d={routePath}
                      strokeWidth={frontStrokeWidth(line.faction)}
                    />
                    <path className="front-direction" d={routePath} strokeWidth={1.4} />
                    <circle cx={currentPoint[0]} cy={currentPoint[1]} r={isActive ? 4.6 : 3.2} />
                    {isUnitVisible && (
                      <g className="formation-units">
                        {formationUnits.map((formationUnit) => {
                          if (formationUnit.hiddenUntil && progress < timeline.dateToProgress(formationUnit.hiddenUntil)) {
                            return null;
                          }

                          if (formationUnit.hiddenFrom && progress >= timeline.dateToProgress(formationUnit.hiddenFrom)) {
                            return null;
                          }

                          const placement = formationUnit.coordinates
                            ? {
                                facingX: formationUnit.facingX ?? facingX,
                                point: routeLocalOffset(
                                  projectPoint(projection, formationUnit.coordinates),
                                  routeDirection,
                                  [0, (formationUnit.offset?.[1] ?? 0) * formationOffsetScale]
                                ),
                                routeProgress: segmentProgress
                              }
                            : formationUnitPlacement(
                                formationRoutePoints,
                                formationSegmentProgress,
                                formationUnit.offset ?? [0, 0],
                                formationOffsetScale
                              );
                          const [markerX, markerY] = placement.point;
                          const markerFaction = formationUnit.faction ?? line.faction;
                          const markerIcon = formationUnit.icon ?? icon;

                          return (
                            <g
                              key={formationUnit.id}
                              className={`unit-icon-orientation formation-unit ${formationUnit.className ?? ""}`}
                              data-facing-x={placement.facingX}
                              data-ship-label={formationUnit.label}
                              data-route-progress={segmentProgress.toFixed(4)}
                              data-unit-route-progress={placement.routeProgress.toFixed(4)}
                              data-unit-offset-along={(formationUnit.offset?.[0] ?? 0).toString()}
                              data-testid={`formation-unit-${line.id}-${formationUnit.id}`}
                              transform={`translate(${markerX} ${markerY})`}
                            >
                              <UnitIcon
                                badgeLabel={formationUnit.badgeLabel ?? line.unitBadgeLabel}
                                icon={markerIcon}
                                isActive={isActive}
                                facingX={placement.facingX}
                                faction={markerFaction}
                              />
                              {formationUnit.label && (
                                <text className="formation-unit-label" x={0} y={-38}>
                                  {formationUnit.label}
                                </text>
                              )}
                            </g>
                          );
                        })}
                      </g>
                    )}
                    {(isActive || (tacticalRouteRetention && isComplete)) && (
                      <text x={labelPoint[0] + 14} y={labelPoint[1] - 14} className="line-label">
                        {line.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {visibleBattleEffects.length > 0 && (
                <g className="battle-effect-layer" data-testid="battle-effect-layer">
                  {visibleBattleEffects.map((effect) =>
                    effect.type === "salvo" ? (
                      <SalvoBattleEffect
                        key={effect.id}
                        effect={effect}
                        progress={effect.progress}
                        project={(coordinates) => projectPoint(projection, coordinates)}
                      />
                    ) : (
                      <DogfightBattleEffect
                        key={effect.id}
                        effect={effect}
                        progress={effect.progress}
                        project={(coordinates) => projectPoint(projection, coordinates)}
                      />
                    )
                  )}
                </g>
              )}

              {projectedBattleEvents.map((event) => {
                const [x, y] = event.xy;
                const pulse = event.weight;
                const isCurrent = event.id === activeEvent.id;
                const isCurrentCuePulse = isCurrent && cueEvents.has(event.id) && pulse >= cuePulseThreshold;
                if (!event.passed && !isCurrent) {
                  return null;
                }

                return (
                  <g key={event.id} className={`event-pin ${event.passed ? "passed" : ""} ${isCurrent ? "is-current" : ""}`}>
                    {isCurrentCuePulse && <ActiveEventEffect kind={visualEffectKindForEvent(event.id)} pulse={pulse} x={x} y={y} />}
                    {!isCurrent && event.passed && <StaticEventIcon kind={sfxProfile} x={x} y={y} />}
                    <circle cx={x} cy={y} r={isCurrent ? 7 : 4.4} />
                    {isCurrent && (
                      <text x={x + 16} y={y + 5} className="active-event-label">
                        {event.title}
                      </text>
                    )}
                  </g>
                );
              })}

              {mapPoints.map((point) => {
                if (point.revealAt && progress < timeline.dateToProgress(point.revealAt)) {
                  return null;
                }

                const [x, y] = projectedPoints.get(point.id) ?? projectPoint(projection, point.coordinates);
                const isFocused = activeEvent.mapFocus.includes(point.id);
                return (
                  <g
                    key={point.id}
                    className={`map-point point-${point.kind} ${isFocused ? "focused" : ""}`}
                    data-testid={`map-point-${point.id}`}
                  >
                    <circle cx={x} cy={y} r={isFocused ? 5.2 : 3.2} />
                    <text x={x + 8} y={y + 4}>
                      {point.label}
                    </text>
                  </g>
                );
              })}
            </g>
            {cinematicMode && (
              <g className="cinematic-map-effects" data-testid="cinematic-map-effects" aria-hidden="true">
                <circle className="cinematic-focus-glow" cx={activeEventPoint[0]} cy={activeEventPoint[1]} r="148" />
                <path className="cinematic-front-haze" d="M40 688C218 594 314 688 482 616C662 538 810 616 1140 498V880H40Z" />
                {cinematicSpecks.map((speck) => (
                  <circle
                    key={speck.id}
                    cx={speck.x}
                    cy={speck.y}
                    r={speck.radius}
                    opacity={speck.opacity}
                    style={{ animationDelay: speck.delay }}
                  />
                ))}
              </g>
            )}
          </svg>

          <div className="map-zoom-controls" data-testid="map-zoom-controls" aria-label="地图缩放控制">
            <button type="button" data-testid="map-zoom-in" onClick={zoomIn} disabled={!canZoomIn} aria-label="放大地图">
              +
            </button>
            <button type="button" data-testid="map-zoom-out" onClick={zoomOut} disabled={!canZoomOut} aria-label="缩小地图">
              -
            </button>
            <button type="button" data-testid="map-reset" onClick={resetMapView} aria-label="复位地图">
              复位
            </button>
          </div>

          {cinematicMode && <div className="cinematic-vignette" aria-hidden="true" />}
          {activeNarrationCue && (
            <div className="narration-subtitle" data-testid="narration-subtitle" aria-live="polite">
              <span>{activeNarrationCue.title ?? activeEvent.phase}</span>
              <div className="narration-ticker">
                <p>{activeNarrationCue.text}</p>
              </div>
            </div>
          )}

          <div className="map-legend" aria-label="图例">
            <span className="legend-germany">{legendPrimary}</span>
            <span className="legend-allies">{legendSecondary}</span>
            <span className="legend-evacuation">{legendAxis}</span>
            <span className="legend-event">关键事件</span>
          </div>

          {outcomeStats.length > 0 && (
            <div className="outcome-panel" data-testid="outcome-panel">
              {outcomeStats.map((stat) => (
                <span key={stat.label} className={stat.className}>
                  <strong>{stat.value}</strong>
                  {stat.label}
                </span>
              ))}
            </div>
          )}
        </article>

        <aside className="story-panel">
          <div className="now-card story-card" data-testid="active-event-card">
            <span className="phase-pill">{activeEvent.phase}</span>
            <p className="date-line">{formatChineseDate(currentDate)}</p>
            <h2>{activeEvent.title}</h2>
            <p>{activeEvent.summary}</p>
          </div>

          <div className="story-card detail-card">
            <p className="label">当前章节</p>
            <h2>{activeEvent.title}</h2>
            <p>{activeEvent.detail}</p>
            {activeNarrationCue && (
              <div className="narration-card" data-testid="narration-card">
                <span>旁白字幕轨</span>
                <p>{activeNarrationCue.text}</p>
              </div>
            )}
            <div className="impact-box">
              <span>意义</span>
              <p>{activeEvent.significance}</p>
            </div>
          </div>

          <div className="story-card next-card">
            <p className="label">下一个节点</p>
            <h3>{upcomingEvent.title}</h3>
            <p>
              {formatChineseDate(upcomingEvent.date)} / {upcomingEvent.location}
            </p>
          </div>
        </aside>
      </section>

      <section className="timeline-list">
        <div className="section-heading">
          <p className="label">完整过程</p>
          <h2>{timelineTitle}</h2>
        </div>
        <div className="event-list" data-testid="event-list">
          {battleEvents.map((event) => (
            <button
              key={event.id}
              type="button"
              className={event.id === activeEvent.id ? "active" : ""}
              onClick={() => jumpToEvent(event)}
            >
              <span>{formatChineseDate(event.date)}</span>
              <strong>{event.title}</strong>
              <small>{event.summary}</small>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
