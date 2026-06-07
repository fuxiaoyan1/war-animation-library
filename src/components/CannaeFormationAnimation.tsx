import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  cannaeCueEventIds,
  cannaeFormationBlocks,
  cannaeNarrationCues,
  cannaePhases,
  cannaeSources,
  cannaeTacticalClaims,
  musicSource,
  type CannaeBlockState,
  type CannaeFormationBlock,
  type CannaePhase,
  type CannaePhaseId
} from "../data/cannaeBattle";
import { WarScore } from "../lib/warScore";

const stageWidth = 1160;
const stageHeight = 820;
const playbackDurationSeconds = 300;
const phaseSpan = 1 / (cannaePhases.length - 1);

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function easeInOut(value: number) {
  return value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2;
}

function interpolateNumber(from: number, to: number, ratio: number) {
  return from + (to - from) * ratio;
}

function phaseIndexForProgress(progress: number) {
  return Math.min(cannaePhases.length - 1, Math.round(progress * (cannaePhases.length - 1)));
}

function segmentForProgress(progress: number) {
  const scaled = clamp(progress) * (cannaePhases.length - 1);
  const fromIndex = Math.min(cannaePhases.length - 2, Math.floor(scaled));
  const toIndex = fromIndex + 1;
  return {
    fromIndex,
    ratio: easeInOut(scaled - fromIndex),
    toIndex
  };
}

function interpolateState(from: CannaeBlockState, to: CannaeBlockState, ratio: number): CannaeBlockState {
  return {
    x: interpolateNumber(from.x, to.x, ratio),
    y: interpolateNumber(from.y, to.y, ratio),
    width: interpolateNumber(from.width, to.width, ratio),
    height: interpolateNumber(from.height, to.height, ratio),
    rotation: interpolateNumber(from.rotation ?? 0, to.rotation ?? 0, ratio),
    opacity: interpolateNumber(from.opacity ?? 1, to.opacity ?? 1, ratio),
    bend: ratio < 0.5 ? from.bend : to.bend
  };
}

function interpolatePhaseMetric<T extends number>(progress: number, selector: (phase: CannaePhase) => T) {
  const { fromIndex, ratio, toIndex } = segmentForProgress(progress);
  return interpolateNumber(selector(cannaePhases[fromIndex]), selector(cannaePhases[toIndex]), ratio);
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formationState(block: CannaeFormationBlock, progress: number) {
  const { fromIndex, ratio, toIndex } = segmentForProgress(progress);
  const fromPhase = cannaePhases[fromIndex].id;
  const toPhase = cannaePhases[toIndex].id;
  return interpolateState(block.keyframes[fromPhase], block.keyframes[toPhase], ratio);
}

function centerPath(state: CannaeBlockState) {
  const x = state.x;
  const y = state.y;
  const width = state.width;
  const height = state.height;
  const direction = state.bend === "concave" ? -1 : state.bend === "flat" ? 0 : 1;
  const curve = height * 0.92 * direction;
  const topY = y + height * 0.24;
  const bottomY = y + height * 0.78;
  const midY = y + height * 0.5 + curve * 0.18;

  return [
    `M ${x} ${midY}`,
    `C ${x + width * 0.23} ${topY + curve}, ${x + width * 0.77} ${topY + curve}, ${x + width} ${midY}`,
    `L ${x + width} ${bottomY}`,
    `C ${x + width * 0.77} ${bottomY + curve * 0.38}, ${x + width * 0.23} ${bottomY + curve * 0.38}, ${x} ${bottomY}`,
    "Z"
  ].join(" ");
}

function blockPath(state: CannaeBlockState) {
  return `M ${state.x} ${state.y} h ${state.width} v ${state.height} h ${-state.width} Z`;
}

function romanDepthLines(state: CannaeBlockState) {
  const count = 6;
  return Array.from({ length: count }, (_, index) => {
    const y = state.y + ((index + 1) / (count + 1)) * state.height;
    return { id: index, x1: state.x + 12, x2: state.x + state.width - 12, y };
  });
}

function cavalrySweepPath(progress: number, side: "left" | "right") {
  const sweep = interpolatePhaseMetric(progress, (phase) => phase.cavalrySweep);
  const xStart = side === "left" ? 236 : 924;
  const xMid = side === "left" ? 282 : 878;
  const xEnd = side === "left" ? interpolateNumber(338, 520, sweep) : interpolateNumber(822, 642, sweep);
  const yEnd = interpolateNumber(526, 576, sweep);
  return `M ${xStart} 428 C ${xMid} 522, ${xEnd} ${yEnd - 58}, ${xEnd} ${yEnd}`;
}

function wingPressurePath(progress: number, side: "left" | "right") {
  const closure = interpolatePhaseMetric(progress, (phase) => phase.wingClosure);
  const startX = side === "left" ? interpolateNumber(390, 472, closure) : interpolateNumber(770, 672, closure);
  const endX = side === "left" ? interpolateNumber(485, 536, closure) : interpolateNumber(675, 620, closure);
  const controlX = side === "left" ? interpolateNumber(430, 514, closure) : interpolateNumber(730, 650, closure);
  return `M ${startX} 438 C ${controlX} 468, ${controlX} 520, ${endX} 544`;
}

function encirclementRingPath(progress: number) {
  const closure = interpolatePhaseMetric(progress, (phase) => phase.wingClosure);
  const gap = Math.max(0, 1 - closure) * 118;
  const left = 444 + gap * 0.28;
  const right = 716 - gap * 0.28;
  const top = 344 + gap * 0.12;
  const bottom = 612 - gap * 0.2;
  const cx = (left + right) / 2;
  const cy = (top + bottom) / 2;
  const rx = (right - left) / 2;
  const ry = (bottom - top) / 2;

  return `M ${cx - rx} ${cy} C ${cx - rx} ${cy - ry}, ${cx + rx} ${cy - ry}, ${cx + rx} ${cy} C ${cx + rx} ${cy + ry}, ${cx - rx} ${cy + ry}, ${cx - rx} ${cy}`;
}

function formationClass(block: CannaeFormationBlock) {
  return [
    "cannae-formation-block",
    `cannae-faction-${block.faction}`,
    `cannae-role-${block.role}`,
    block.id === "roman-infantry-mass" ? "is-roman-mass" : "",
    block.id === "carthaginian-yielding-center" ? "is-yielding-center" : ""
  ]
    .filter(Boolean)
    .join(" ");
}

function FormationBlockShape({ block, progress }: { block: CannaeFormationBlock; progress: number }) {
  const shape = formationState(block, progress);
  const isCenter = block.id === "carthaginian-yielding-center";
  const isRomanMass = block.id === "roman-infantry-mass";
  const transform = `rotate(${shape.rotation ?? 0} ${shape.x + shape.width / 2} ${shape.y + shape.height / 2})`;
  const testId =
    block.id === "roman-infantry-mass"
      ? "roman-infantry-mass"
      : block.id === "carthaginian-yielding-center"
        ? "carthaginian-yielding-center"
        : block.id === "african-left-infantry" || block.id === "african-right-infantry"
          ? "african-infantry-wings"
          : block.id === "carthaginian-left-cavalry" || block.id === "numidian-right-cavalry"
            ? "carthaginian-cavalry-wings"
            : block.id;

  return (
    <g
      className={formationClass(block)}
      data-testid={testId}
      data-block-id={block.id}
      data-certainty={block.certainty}
      opacity={shape.opacity ?? 1}
      transform={transform}
    >
      <path d={isCenter ? centerPath(shape) : blockPath(shape)} />
      {isRomanMass &&
        romanDepthLines(shape).map((line) => (
          <line key={line.id} className="cannae-roman-depth-line" x1={line.x1} x2={line.x2} y1={line.y} y2={line.y} />
        ))}
      {!isCenter &&
        !isRomanMass &&
        Array.from({ length: block.role === "cavalry" ? 4 : 5 }, (_, index) => (
          <circle
            key={index}
            className="cannae-rank-dot"
            cx={shape.x + ((index + 1) / (block.role === "cavalry" ? 5 : 6)) * shape.width}
            cy={shape.y + shape.height * 0.52}
            r={block.role === "cavalry" ? 4.5 : 3.8}
          />
        ))}
      {block.role === "command" && (
        <g className="cannae-command-standard">
          <line x1={shape.x + shape.width * 0.5} x2={shape.x + shape.width * 0.5} y1={shape.y + 4} y2={shape.y + shape.height - 4} />
          <path d={`M ${shape.x + shape.width * 0.5} ${shape.y + 6} l 28 11 l -28 11 Z`} />
        </g>
      )}
      <text x={shape.x + shape.width / 2} y={shape.y + shape.height / 2 + 5}>
        {block.shortLabel}
      </text>
    </g>
  );
}

function CannaeMap({
  activePhase,
  progress
}: {
  activePhase: CannaePhase;
  progress: number;
}) {
  const romanCompression = interpolatePhaseMetric(progress, (phase) => phase.romanCompression);
  const wingClosure = interpolatePhaseMetric(progress, (phase) => phase.wingClosure);
  const centerCurvature = activePhase.centerCurvature;
  const focus = activePhase.focusBox;
  const viewBox = `${focus.x} ${focus.y} ${focus.width} ${focus.height}`;
  const ringOpacity = clamp((wingClosure - 0.44) / 0.5);
  const centerState = formationState(cannaeFormationBlocks.find((block) => block.id === "carthaginian-yielding-center")!, progress);

  return (
    <svg
      className="cannae-formation-map"
      data-testid="cannae-formation-map"
      data-phase={activePhase.id}
      data-roman-compression={romanCompression.toFixed(2)}
      data-center-curvature={centerCurvature}
      data-wing-closure={wingClosure.toFixed(2)}
      data-cavalry-sweep={interpolatePhaseMetric(progress, (phase) => phase.cavalrySweep).toFixed(2)}
      viewBox={viewBox}
      role="img"
      aria-label="坎尼会战双重合围战术沙盘"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="cannaeGround" x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#d7bd7c" />
          <stop offset="0.46" stopColor="#9d8d5b" />
          <stop offset="1" stopColor="#4d624e" />
        </linearGradient>
        <linearGradient id="cannaeRome" x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#6fa2d0" />
          <stop offset="1" stopColor="#244f73" />
        </linearGradient>
        <linearGradient id="cannaeCarthage" x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#e2b657" />
          <stop offset="1" stopColor="#8d2c23" />
        </linearGradient>
        <filter id="cannaeSoftShadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#140d08" floodOpacity="0.32" />
        </filter>
        <pattern id="cannaeDustPattern" width="42" height="42" patternUnits="userSpaceOnUse">
          <path d="M 0 21 H 42 M 21 0 V 42" stroke="rgba(61,45,28,0.09)" strokeWidth="1" />
          <circle cx="9" cy="12" r="1.1" fill="rgba(255,241,190,0.16)" />
          <circle cx="29" cy="31" r="1.4" fill="rgba(55,41,24,0.1)" />
        </pattern>
      </defs>

      <rect className="cannae-ground" x="0" y="0" width={stageWidth} height={stageHeight} />
      <rect className="cannae-dust" x="0" y="0" width={stageWidth} height={stageHeight} />
      <path className="cannae-river" d="M 56 96 C 236 116, 318 54, 470 86 S 812 148, 1104 66" />
      <path className="cannae-river-bank" d="M 40 132 C 246 162, 354 88, 496 122 S 818 184, 1132 104" />
      <text className="cannae-terrain-label" x="130" y="164">
        Aufidus / 奥菲杜斯河
      </text>
      <path className="cannae-camp cannae-camp-roman" d="M 438 710 l 310 0 l 32 60 l -378 0 Z" />
      <path className="cannae-camp cannae-camp-carthage" d="M 452 250 l 258 0 l 38 -54 l -332 0 Z" />
      <text className="cannae-terrain-label cannae-camp-label" x="594" y="742">
        罗马营地方向
      </text>
      <text className="cannae-terrain-label cannae-camp-label" x="580" y="238">
        迦太基营地方向
      </text>

      <g className="cannae-pressure-arrows" data-testid="cannae-cavalry-sweep">
        <path d={cavalrySweepPath(progress, "left")} />
        <path d={cavalrySweepPath(progress, "right")} />
      </g>
      <g className="cannae-wing-pressure" data-testid="cannae-wing-pressure">
        <path d={wingPressurePath(progress, "left")} />
        <path d={wingPressurePath(progress, "right")} />
      </g>

      <path
        className="cannae-center-bend-guide"
        data-testid="cannae-center-curvature-guide"
        data-center-curvature={centerCurvature}
        d={centerPath(centerState)}
      />

      <g data-testid="cannae-formation-blocks">
        {cannaeFormationBlocks.map((block) => (
          <FormationBlockShape key={block.id} block={block} progress={progress} />
        ))}
      </g>

      <path
        className="cannae-encirclement-ring"
        data-testid="cannae-encirclement-ring"
        d={encirclementRingPath(progress)}
        opacity={ringOpacity}
      />

      {wingClosure > 0.64 && (
        <g className="cannae-melee-sparks" data-testid="cannae-melee-sparks">
          {[
            [504, 438],
            [650, 440],
            [526, 540],
            [632, 542],
            [580, 386]
          ].map(([x, y], index) => (
            <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${index * 28})`}>
              <line x1="-13" x2="13" y1="0" y2="0" />
              <line x1="0" x2="0" y1="-13" y2="13" />
            </g>
          ))}
        </g>
      )}

      <g className="cannae-focus-frame" data-testid="cannae-focus-frame">
        <rect x={focus.x + 12} y={focus.y + 12} width={focus.width - 24} height={focus.height - 24} />
      </g>
    </svg>
  );
}

export function CannaeFormationAnimation() {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScoreEnabled, setIsScoreEnabled] = useState(true);
  const [isScoreRunning, setIsScoreRunning] = useState(false);
  const scoreRef = useRef<WarScore | null>(null);
  const lastCuePhaseRef = useRef<CannaePhaseId | null>(null);
  const stageRef = useRef<HTMLElement | null>(null);

  const activePhaseIndex = phaseIndexForProgress(progress);
  const activePhase = cannaePhases[activePhaseIndex];
  const narration = cannaeNarrationCues[activePhase.id];
  const romanCompression = interpolatePhaseMetric(progress, (phase) => phase.romanCompression);
  const wingClosure = interpolatePhaseMetric(progress, (phase) => phase.wingClosure);
  const cavalrySweep = interpolatePhaseMetric(progress, (phase) => phase.cavalrySweep);

  const phaseProgress = useMemo(
    () =>
      cannaePhases.map((phase, index) => ({
        left: `${index * phaseSpan * 100}%`,
        phase
      })),
    []
  );

  useEffect(() => {
    scoreRef.current = new WarScore(musicSource);
    return () => {
      void scoreRef.current?.stop();
      scoreRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }

    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      const delta = (now - previous) / 1000 / playbackDurationSeconds;
      previous = now;
      setProgress((value) => {
        const next = Math.min(1, value + delta);
        if (next >= 1) {
          setIsPlaying(false);
          void scoreRef.current?.pause();
          setIsScoreRunning(false);
        }
        return next;
      });
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || !isScoreEnabled || !cannaeCueEventIds.has(activePhase.id) || lastCuePhaseRef.current === activePhase.id) {
      return;
    }

    lastCuePhaseRef.current = activePhase.id;
    void scoreRef.current?.playBattleCue("melee");
  }, [activePhase.id, isPlaying, isScoreEnabled]);

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

  const jumpToPhase = (phase: CannaePhase, index: number) => {
    const nextProgress = index * phaseSpan;
    setProgress(nextProgress);
    stageRef.current?.scrollIntoView({ behavior: "auto", block: "start" });

    if (isScoreEnabled && cannaeCueEventIds.has(phase.id)) {
      lastCuePhaseRef.current = phase.id;
      void scoreRef.current?.playBattleCue("melee");
    }
  };

  const replay = async () => {
    setIsPlaying(false);
    await pauseScore();
    lastCuePhaseRef.current = null;
    setProgress(0);
  };

  return (
    <main className="app-shell cannae-formation-battle cinematic-mode" data-testid="cannae-app">
      <section className="control-deck cannae-control-deck" data-testid="control-deck">
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
              void replay();
            }}
            aria-label="回放坎尼会战动画"
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
            {activePhase.dateLabel}
          </span>
        </div>

        <div className="timeline-stack">
          <label className="timeline-range" htmlFor="cannae-timeline">
            <span>阵法阶段拖拽</span>
            <input
              id="cannae-timeline"
              data-testid="timeline"
              type="range"
              min="0"
              max="1000"
              value={Math.round(progress * 1000)}
              onChange={(event) => {
                scoreRef.current?.cancelPendingBattleCues();
                setProgress(Number(event.target.value) / 1000);
              }}
            />
          </label>

          <div className="event-rail" data-testid="event-rail">
            {phaseProgress.map(({ left, phase }, index) => (
              <button
                key={phase.id}
                type="button"
                className={phase.id === activePhase.id ? "active" : ""}
                data-event-id={phase.id}
                style={{ left }}
                onClick={() => jumpToPhase(phase, index)}
                aria-label={`跳到${phase.title}`}
                title={`${phase.dateLabel} ${phase.title}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="cannae-layout">
        <article ref={stageRef} className="map-stage cannae-stage" data-testid="cannae-map-stage" data-phase={activePhase.id}>
          <div className="map-topbar map-overlay cannae-map-overlay">
            <div className="map-title-card" data-testid="map-title-card">
              <p className="map-eyebrow">Top Formation Battle 01 / Ancient Tactical Renderer</p>
              <h1>坎尼会战：双重合围</h1>
            </div>
          </div>

          <div className="narration-subtitle cannae-subtitle" data-testid="narration-subtitle">
            <span>{narration.title}</span>
            <div className="narration-ticker">
              <p>{narration.text}</p>
            </div>
          </div>

          <CannaeMap activePhase={activePhase} progress={progress} />

          <div className="map-legend cannae-legend" aria-label="坎尼战术图例">
            <span data-side="rome">罗马军团</span>
            <span data-side="carthage">迦太基军</span>
            <span data-side="schematic">示意重建</span>
          </div>

          <div className="outcome-panel cannae-metrics" data-testid="cannae-tactical-metrics">
            <span>
              <strong>罗马压缩</strong>
              {formatPercent(1 - romanCompression)}
            </span>
            <span>
              <strong>合围闭合</strong>
              {formatPercent(wingClosure)}
            </span>
            <span>
              <strong>骑兵清场</strong>
              {formatPercent(cavalrySweep)}
            </span>
          </div>
        </article>

        <aside className="story-panel cannae-story-panel" data-testid="story-panel">
          <article className="story-card cannae-story-card" data-testid="active-event-card">
            <p className="phase-pill">{activePhase.meterLabel}</p>
            <p className="date-line">{activePhase.dateLabel}</p>
            <h2>{activePhase.title}</h2>
            <p>{activePhase.detail}</p>
          </article>

          <article className="story-card cannae-story-card cannae-evidence-card">
            <h3>战术证据与边界 / Evidence and Limits</h3>
            <ul>
              {cannaeTacticalClaims.map((item) => (
                <li key={item.claim} data-certainty={item.certainty}>
                  {item.claim}
                </li>
              ))}
            </ul>
          </article>
        </aside>
      </section>

      <section className="timeline-list cannae-timeline-list">
        <div className="section-heading">
          <div>
            <p className="label">Tactical Phases / 阵法阶段</p>
            <h2>从凸月诱陷到双重合围</h2>
          </div>
        </div>
        <div className="event-list" data-testid="event-list">
          {cannaePhases.map((phase, index) => (
            <button
              key={phase.id}
              type="button"
              className={phase.id === activePhase.id ? "active" : ""}
              data-phase-id={phase.id}
              onClick={() => jumpToPhase(phase, index)}
            >
              <span>{phase.dateLabel}</span>
              <strong>{phase.title}</strong>
              <small>{phase.summary}</small>
              <em>{phase.meterLabel}</em>
            </button>
          ))}
        </div>
      </section>

      <section className="timeline-list cannae-source-list">
        <div className="section-heading">
          <div>
            <p className="label">Sources / 来源</p>
            <h2>资料口径</h2>
          </div>
        </div>
        <div className="cannae-source-grid">
          {cannaeSources.map((source) => (
            <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
              <strong>{source.title}</strong>
              <span>{source.role}</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
