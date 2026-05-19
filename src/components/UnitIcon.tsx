import type { UnitIconKind } from "../types/units";

type UnitIconProps = {
  badgeLabel?: string;
  facingX?: HorizontalFacing;
  faction?: string;
  icon: UnitIconKind;
  isActive: boolean;
};

export type HorizontalFacing = -1 | 1;

const iconConfig: Record<
  UnitIconKind,
  { className: string; defaultFacingX: HorizontalFacing; height: number; href: string; testId: string; width: number }
> = {
  cannon: {
    className: "cannon-marker",
    defaultFacingX: 1,
    height: 64,
    href: "/assets/unit-icons/cannon.webp",
    testId: "cannon-marker",
    width: 78
  },
  carrier: {
    className: "carrier-marker",
    defaultFacingX: 1,
    height: 50,
    href: "/assets/unit-icons/carrier.webp",
    testId: "carrier-marker",
    width: 136
  },
  carrierEssex: {
    className: "carrier-essex-marker",
    defaultFacingX: 1,
    height: 54,
    href: "/assets/unit-icons/carrier-essex.webp",
    testId: "carrier-essex-marker",
    width: 150
  },
  cavalry: {
    className: "cavalry-marker",
    defaultFacingX: -1,
    height: 72,
    href: "/assets/unit-icons/cavalry.webp",
    testId: "cavalry-marker",
    width: 90
  },
  chariot: {
    className: "chariot-marker",
    defaultFacingX: 1,
    height: 58,
    href: "/assets/unit-icons/chariot.webp",
    testId: "chariot-marker",
    width: 136
  },
  fighter: {
    className: "fighter-marker",
    defaultFacingX: 1,
    height: 58,
    href: "/assets/unit-icons/fighter.webp",
    testId: "fighter-marker",
    width: 136
  },
  infantry: {
    className: "infantry-marker",
    defaultFacingX: 1,
    height: 92,
    href: "/assets/unit-icons/infantry.webp",
    testId: "infantry-marker",
    width: 74
  },
  infantryPva: {
    className: "infantry-pva-marker",
    defaultFacingX: 1,
    height: 92,
    href: "/assets/unit-icons/infantry-pva.webp",
    testId: "infantry-pva-marker",
    width: 57
  },
  sabre: {
    className: "sabre-marker",
    defaultFacingX: 1,
    height: 58,
    href: "/assets/unit-icons/sabre.webp",
    testId: "sabre-marker",
    width: 138
  },
  ship: {
    className: "ship-marker",
    defaultFacingX: 1,
    height: 62,
    href: "/assets/unit-icons/ship.webp",
    testId: "ship-marker",
    width: 94
  },
  tank: {
    className: "tank-marker",
    defaultFacingX: -1,
    height: 66,
    href: "/assets/unit-icons/tank.webp",
    testId: "tank-marker",
    width: 92
  },
  tankKorean: {
    className: "tank-korean-marker",
    defaultFacingX: 1,
    height: 60,
    href: "/assets/unit-icons/tank-korean.webp",
    testId: "tank-korean-marker",
    width: 96
  },
  warship: {
    className: "warship-marker",
    defaultFacingX: 1,
    height: 56,
    href: "/assets/unit-icons/warship.webp",
    testId: "warship-marker",
    width: 168
  }
};

function getMirrorScaleX(icon: UnitIconKind, facingX: HorizontalFacing) {
  return iconConfig[icon].defaultFacingX === facingX ? 1 : -1;
}

function factionBadgeLabel(faction: string) {
  const labels: Record<string, string> = {
    allies: "盟",
    belgium: "比",
    britain: "英",
    carthage: "迦",
    france: "法",
    germany: "德",
    rome: "罗",
    un: "UN"
  };

  return labels[faction] ?? faction.slice(0, 2).toUpperCase();
}

export function UnitIcon({ badgeLabel, facingX, faction, icon, isActive }: UnitIconProps) {
  const config = iconConfig[icon];
  const desiredFacingX = facingX ?? config.defaultFacingX;
  const mirrorScaleX = getMirrorScaleX(icon, desiredFacingX);
  const x = -config.width / 2;
  const y = -config.height / 2;
  const badgeClass = faction ? `unit-faction-badge faction-badge-${faction}` : "unit-faction-badge";

  return (
    <g
      className={`unit-marker unit-marker-${faction ?? "neutral"} ${config.className} ${isActive ? "is-active" : ""}`}
      data-default-facing-x={config.defaultFacingX}
      data-facing-x={desiredFacingX}
      data-faction={faction}
      data-mirror-x={mirrorScaleX}
      data-testid={config.testId}
    >
      <ellipse className="unit-icon-shadow" cx="0" cy={config.height * 0.34} rx={config.width * 0.36} ry="6" />
      {faction && (
        <g className={badgeClass} data-badge-label={badgeLabel ?? factionBadgeLabel(faction)} data-testid={`unit-faction-badge-${faction}`}>
          <circle cx={-config.width * 0.34} cy={-config.height * 0.34} r="10" />
          {faction === "communist" ? (
            <path d={`M ${-config.width * 0.34} ${-config.height * 0.34 - 6} L ${-config.width * 0.37} ${-config.height * 0.34 - 1.5} L ${-config.width * 0.42} ${-config.height * 0.34 - 1.5} L ${-config.width * 0.38} ${-config.height * 0.34 + 1.8} L ${-config.width * 0.4} ${-config.height * 0.34 + 6} L ${-config.width * 0.34} ${-config.height * 0.34 + 3.5} L ${-config.width * 0.28} ${-config.height * 0.34 + 6} L ${-config.width * 0.3} ${-config.height * 0.34 + 1.8} L ${-config.width * 0.26} ${-config.height * 0.34 - 1.5} L ${-config.width * 0.31} ${-config.height * 0.34 - 1.5} Z`} />
          ) : (
            <text x={-config.width * 0.34} y={-config.height * 0.34 + 4}>
              {badgeLabel ?? factionBadgeLabel(faction)}
            </text>
          )}
        </g>
      )}
      <g className="unit-icon-facing" transform={`scale(${mirrorScaleX} 1)`}>
        <image
          className="unit-icon-image"
          data-asset-kind={icon}
          href={config.href}
          preserveAspectRatio="xMidYMid meet"
          x={x}
          y={y}
          width={config.width}
          height={config.height}
        />
      </g>
    </g>
  );
}
