import { publicPath } from "../lib/publicPath";
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
    href: publicPath("/assets/unit-icons/cannon.webp"),
    testId: "cannon-marker",
    width: 78
  },
  carrier: {
    className: "carrier-marker",
    defaultFacingX: 1,
    height: 50,
    href: publicPath("/assets/unit-icons/carrier.webp"),
    testId: "carrier-marker",
    width: 136
  },
  carrierEssex: {
    className: "carrier-essex-marker",
    defaultFacingX: 1,
    height: 54,
    href: publicPath("/assets/unit-icons/carrier-essex.webp"),
    testId: "carrier-essex-marker",
    width: 150
  },
  cavalry: {
    className: "cavalry-marker",
    defaultFacingX: -1,
    height: 72,
    href: publicPath("/assets/unit-icons/cavalry.webp"),
    testId: "cavalry-marker",
    width: 90
  },
  cannaeAfricanInfantry: {
    className: "cannae-african-infantry-marker",
    defaultFacingX: 1,
    height: 82,
    href: publicPath("/assets/unit-icons/cannae-african-infantry.webp"),
    testId: "cannae-african-infantry-marker",
    width: 54
  },
  cannaeCarthaginianCavalry: {
    className: "cannae-carthaginian-cavalry-marker",
    defaultFacingX: -1,
    height: 62,
    href: publicPath("/assets/unit-icons/cannae-carthaginian-cavalry.webp"),
    testId: "cannae-carthaginian-cavalry-marker",
    width: 92
  },
  cannaeCarthaginianCommand: {
    className: "cannae-carthaginian-command-marker",
    defaultFacingX: 1,
    height: 86,
    href: publicPath("/assets/unit-icons/cannae-carthaginian-command.webp"),
    testId: "cannae-carthaginian-command-marker",
    width: 54
  },
  cannaeCarthaginianInfantry: {
    className: "cannae-carthaginian-infantry-marker",
    defaultFacingX: 1,
    height: 82,
    href: publicPath("/assets/unit-icons/cannae-carthaginian-infantry.webp"),
    testId: "cannae-carthaginian-infantry-marker",
    width: 54
  },
  cannaeIberianGaulInfantry: {
    className: "cannae-iberian-gaul-infantry-marker",
    defaultFacingX: 1,
    height: 82,
    href: publicPath("/assets/unit-icons/cannae-iberian-gaul-infantry.webp"),
    testId: "cannae-iberian-gaul-infantry-marker",
    width: 56
  },
  cannaeNumidianCavalry: {
    className: "cannae-numidian-cavalry-marker",
    defaultFacingX: -1,
    height: 60,
    href: publicPath("/assets/unit-icons/cannae-numidian-cavalry.webp"),
    testId: "cannae-numidian-cavalry-marker",
    width: 92
  },
  cannaeRomanCavalry: {
    className: "cannae-roman-cavalry-marker",
    defaultFacingX: 1,
    height: 62,
    href: publicPath("/assets/unit-icons/cannae-roman-cavalry.webp"),
    testId: "cannae-roman-cavalry-marker",
    width: 92
  },
  cannaeRomanCommand: {
    className: "cannae-roman-command-marker",
    defaultFacingX: -1,
    height: 86,
    href: publicPath("/assets/unit-icons/cannae-roman-command.webp"),
    testId: "cannae-roman-command-marker",
    width: 54
  },
  cannaeRomanLegion: {
    className: "cannae-roman-legion-marker",
    defaultFacingX: -1,
    height: 84,
    href: publicPath("/assets/unit-icons/cannae-roman-legion.webp"),
    testId: "cannae-roman-legion-marker",
    width: 56
  },
  chariot: {
    className: "chariot-marker",
    defaultFacingX: 1,
    height: 58,
    href: publicPath("/assets/unit-icons/chariot.webp"),
    testId: "chariot-marker",
    width: 136
  },
  fighter: {
    className: "fighter-marker",
    defaultFacingX: 1,
    height: 58,
    href: publicPath("/assets/unit-icons/fighter.webp"),
    testId: "fighter-marker",
    width: 136
  },
  infantry: {
    className: "infantry-marker",
    defaultFacingX: 1,
    height: 92,
    href: publicPath("/assets/unit-icons/infantry.webp"),
    testId: "infantry-marker",
    width: 74
  },
  infantryPva: {
    className: "infantry-pva-marker",
    defaultFacingX: 1,
    height: 92,
    href: publicPath("/assets/unit-icons/infantry-pva.webp"),
    testId: "infantry-pva-marker",
    width: 57
  },
  britainHurricane: {
    className: "ww2-aircraft-marker britain-aircraft-marker britain-hurricane-marker",
    defaultFacingX: 1,
    height: 51,
    href: publicPath("/assets/unit-icons/britain-hurricane.png"),
    testId: "britain-hurricane-marker",
    width: 58
  },
  britainSpitfire: {
    className: "ww2-aircraft-marker britain-aircraft-marker britain-spitfire-marker",
    defaultFacingX: 1,
    height: 50,
    href: publicPath("/assets/unit-icons/britain-spitfire.png"),
    testId: "britain-spitfire-marker",
    width: 57
  },
  luftwaffeBf109: {
    className: "ww2-aircraft-marker luftwaffe-aircraft-marker luftwaffe-bf109-marker",
    defaultFacingX: 1,
    height: 46,
    href: publicPath("/assets/unit-icons/luftwaffe-bf109.png"),
    testId: "luftwaffe-bf109-marker",
    width: 53
  },
  luftwaffeBf110: {
    className: "ww2-aircraft-marker luftwaffe-aircraft-marker luftwaffe-bf110-marker",
    defaultFacingX: 1,
    height: 59,
    href: publicPath("/assets/unit-icons/luftwaffe-bf110.png"),
    testId: "luftwaffe-bf110-marker",
    width: 70
  },
  luftwaffeDo17: {
    className: "ww2-aircraft-marker luftwaffe-aircraft-marker luftwaffe-do17-marker",
    defaultFacingX: 1,
    height: 62,
    href: publicPath("/assets/unit-icons/luftwaffe-do17.png"),
    testId: "luftwaffe-do17-marker",
    width: 76
  },
  luftwaffeHe111: {
    className: "ww2-aircraft-marker luftwaffe-aircraft-marker luftwaffe-he111-marker",
    defaultFacingX: 1,
    height: 67,
    href: publicPath("/assets/unit-icons/luftwaffe-he111.png"),
    testId: "luftwaffe-he111-marker",
    width: 79
  },
  sabre: {
    className: "sabre-marker",
    defaultFacingX: 1,
    height: 58,
    href: publicPath("/assets/unit-icons/sabre.webp"),
    testId: "sabre-marker",
    width: 138
  },
  ship: {
    className: "ship-marker",
    defaultFacingX: 1,
    height: 62,
    href: publicPath("/assets/unit-icons/ship.webp"),
    testId: "ship-marker",
    width: 94
  },
  tank: {
    className: "tank-marker",
    defaultFacingX: -1,
    height: 66,
    href: publicPath("/assets/unit-icons/tank.webp"),
    testId: "tank-marker",
    width: 92
  },
  tankKorean: {
    className: "tank-korean-marker",
    defaultFacingX: 1,
    height: 60,
    href: publicPath("/assets/unit-icons/tank-korean.webp"),
    testId: "tank-korean-marker",
    width: 96
  },
  trafalgarBritishLine: {
    className: "trafalgar-ship-marker trafalgar-british-line-marker",
    defaultFacingX: 1,
    height: 72,
    href: publicPath("/assets/unit-icons/trafalgar-british-line.webp"),
    testId: "trafalgar-british-line-marker",
    width: 180
  },
  trafalgarBucentaure: {
    className: "trafalgar-ship-marker trafalgar-bucentaure-marker",
    defaultFacingX: 1,
    height: 72,
    href: publicPath("/assets/unit-icons/trafalgar-bucentaure.webp"),
    testId: "trafalgar-bucentaure-marker",
    width: 180
  },
  trafalgarFrenchLine: {
    className: "trafalgar-ship-marker trafalgar-french-line-marker",
    defaultFacingX: -1,
    height: 72,
    href: publicPath("/assets/unit-icons/trafalgar-french-line.webp"),
    testId: "trafalgar-french-line-marker",
    width: 180
  },
  trafalgarHmsVictory: {
    className: "trafalgar-ship-marker trafalgar-hms-victory-marker",
    defaultFacingX: 1,
    height: 72,
    href: publicPath("/assets/unit-icons/trafalgar-hms-victory.webp"),
    testId: "trafalgar-hms-victory-marker",
    width: 180
  },
  trafalgarRoyalSovereign: {
    className: "trafalgar-ship-marker trafalgar-royal-sovereign-marker",
    defaultFacingX: 1,
    height: 72,
    href: publicPath("/assets/unit-icons/trafalgar-royal-sovereign.webp"),
    testId: "trafalgar-royal-sovereign-marker",
    width: 180
  },
  trafalgarSantisimaTrinidad: {
    className: "trafalgar-ship-marker trafalgar-santisima-trinidad-marker",
    defaultFacingX: 1,
    height: 72,
    href: publicPath("/assets/unit-icons/trafalgar-santisima-trinidad.webp"),
    testId: "trafalgar-santisima-trinidad-marker",
    width: 180
  },
  warship: {
    className: "warship-marker",
    defaultFacingX: 1,
    height: 56,
    href: publicPath("/assets/unit-icons/warship.webp"),
    testId: "warship-marker",
    width: 168
  },
  ww2AttackAircraft: {
    className: "ww2-aircraft-marker ww2-attack-aircraft-marker",
    defaultFacingX: 1,
    height: 27,
    href: publicPath("/assets/unit-icons/ww2-attack-aircraft.webp"),
    testId: "ww2-attack-aircraft-marker",
    width: 70
  },
  ww2Bomber: {
    className: "ww2-aircraft-marker ww2-bomber-marker",
    defaultFacingX: 1,
    height: 29,
    href: publicPath("/assets/unit-icons/ww2-bomber.webp"),
    testId: "ww2-bomber-marker",
    width: 75
  },
  ww2EscortShip: {
    className: "ww2-ship-marker ww2-escort-ship-marker",
    defaultFacingX: 1,
    height: 34,
    href: publicPath("/assets/unit-icons/ww2-escort-ship.webp"),
    testId: "ww2-escort-ship-marker",
    width: 92
  },
  ww2Fighter: {
    className: "ww2-aircraft-marker ww2-fighter-marker",
    defaultFacingX: 1,
    height: 25,
    href: publicPath("/assets/unit-icons/ww2-fighter.webp"),
    testId: "ww2-fighter-marker",
    width: 66
  },
  ww2Submarine: {
    className: "ww2-ship-marker ww2-submarine-marker",
    defaultFacingX: 1,
    height: 30,
    href: publicPath("/assets/unit-icons/ww2-submarine.webp"),
    testId: "ww2-submarine-marker",
    width: 102
  },
  ww2TransportShip: {
    className: "ww2-ship-marker ww2-transport-ship-marker",
    defaultFacingX: 1,
    height: 38,
    href: publicPath("/assets/unit-icons/ww2-transport-ship.webp"),
    testId: "ww2-transport-ship-marker",
    width: 104
  }
};

const britainAirAssetVersion = "20260614-reference-v1";
const britainAirIcons = new Set<UnitIconKind>([
  "britainHurricane",
  "britainSpitfire",
  "luftwaffeBf109",
  "luftwaffeBf110",
  "luftwaffeDo17",
  "luftwaffeHe111"
]);

function versionedIconHref(icon: UnitIconKind, href: string) {
  return britainAirIcons.has(icon) ? `${href}?v=${britainAirAssetVersion}` : href;
}

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
    nationalist: "國",
    rome: "罗",
    spain: "西",
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
          href={versionedIconHref(icon, config.href)}
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
