import type { FrontLine } from "../data/battleOfFrance";

type UnitBadgeResolver = Partial<Record<FrontLine["faction"], string>> | ((line: FrontLine) => string | undefined);

export function withUnitBadgeLabels(frontLines: FrontLine[], resolver: UnitBadgeResolver) {
  return frontLines.map((line) => {
    const unitBadgeLabel =
      typeof resolver === "function" ? resolver(line) : resolver[line.faction];

    return {
      ...line,
      unitBadgeLabel: line.unitBadgeLabel ?? unitBadgeLabel
    };
  });
}
