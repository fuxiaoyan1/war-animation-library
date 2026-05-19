import type { BattleEvent, MapPoint } from "../data/battleOfFrance";

const dayMs = 24 * 60 * 60 * 1000;
const hourMs = 60 * 60 * 1000;

type CampaignDateParts = {
  day: number;
  displayYear: number;
  hour: number;
  minute: number;
  isBce: boolean;
  month: number;
  year: number;
};

const bcePrefix = "BCE-";

function parseCampaignDate(date: string): CampaignDateParts {
  const isBce = date.startsWith(bcePrefix);
  const normalized = isBce ? date.slice(bcePrefix.length) : date;
  const match = normalized.match(/^(\d{1,6})-(\d{2})-(\d{2})(?:(?:T| )(\d{2}):(\d{2}))?$/);

  if (!match) {
    throw new Error(`Invalid campaign date: ${date}`);
  }

  const displayYear = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = match[4] ? Number(match[4]) : 0;
  const minute = match[5] ? Number(match[5]) : 0;

  if (displayYear < 1 || month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) {
    throw new Error(`Invalid campaign date: ${date}`);
  }

  return {
    day,
    displayYear,
    hour,
    minute,
    isBce,
    month,
    year: isBce ? 1 - displayYear : displayYear
  };
}

function daysFromCivil(year: number, month: number, day: number) {
  let y = year;
  y -= month <= 2 ? 1 : 0;
  const era = Math.floor(y / 400);
  const yoe = y - era * 400;
  const monthPrime = month + (month > 2 ? -3 : 9);
  const doy = Math.floor((153 * monthPrime + 2) / 5) + day - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

function civilFromDays(days: number) {
  let z = days + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  let year = yoe + era * 400;
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const monthPrime = Math.floor((5 * doy + 2) / 153);
  const day = doy - Math.floor((153 * monthPrime + 2) / 5) + 1;
  const month = monthPrime + (monthPrime < 10 ? 3 : -9);
  year += month <= 2 ? 1 : 0;
  z = 0;

  return { day, month, year };
}

function serializeCampaignDate(year: number, month: number, day: number, hour = 0, minute = 0) {
  const isBce = year <= 0;
  const displayYear = isBce ? 1 - year : year;
  const yearText = String(displayYear).padStart(4, "0");
  const monthText = String(month).padStart(2, "0");
  const dayText = String(day).padStart(2, "0");
  const dateText = `${isBce ? bcePrefix : ""}${yearText}-${monthText}-${dayText}`;

  if (hour === 0 && minute === 0) {
    return dateText;
  }

  return `${dateText}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function formatCampaignDate(date: string) {
  const parsed = parseCampaignDate(date);
  const eraPrefix = parsed.isBce ? "公元前" : "";
  const timeSuffix = parsed.hour || parsed.minute ? ` ${String(parsed.hour).padStart(2, "0")}:${String(parsed.minute).padStart(2, "0")}` : "";
  return `${eraPrefix}${parsed.displayYear}年${parsed.month}月${parsed.day}日${timeSuffix}`;
}

export const toTime = (date: string) => {
  const parsed = parseCampaignDate(date);
  return daysFromCivil(parsed.year, parsed.month, parsed.day) * dayMs + parsed.hour * hourMs + parsed.minute * 60 * 1000;
};

export type CampaignTimelineInput<TEvent extends Pick<BattleEvent, "date">, TPoint extends Pick<MapPoint, "id">> = {
  activeSpans?: Array<{
    end: string;
    start: string;
  }>;
  dateAnchors?: string[];
  campaignStart: string;
  campaignEnd: string;
  events: TEvent[];
  gapScale?: number;
  gapOverrides?: Array<{
    displayDays: number;
    end: string;
    start: string;
  }>;
  inactiveGapDisplayDays?: number;
  maxGapDays?: number;
  points: TPoint[];
  timingMode?: "calendar" | "compressed";
};

export function createCampaignTimeline<TEvent extends BattleEvent, TPoint extends MapPoint>({
  activeSpans = [],
  dateAnchors = [],
  campaignStart,
  campaignEnd,
  events,
  gapScale = 0.02,
  gapOverrides = [],
  inactiveGapDisplayDays = 0.001,
  maxGapDays = 90,
  timingMode = "calendar",
  points
}: CampaignTimelineInput<TEvent, TPoint>) {
  const campaignStartTime = toTime(campaignStart);
  const campaignEndTime = toTime(campaignEnd);
  const campaignDuration = campaignEndTime - campaignStartTime;
  const operationSpans = activeSpans.map((span) => ({
    endTime: toTime(span.end),
    startTime: toTime(span.start)
  }));
  const anchorTimes = Array.from(
    new Set(
      [
        campaignStart,
        campaignEnd,
        ...events.map((event) => event.date),
        ...dateAnchors,
        ...activeSpans.flatMap((span) => [span.start, span.end])
      ].map(toTime)
    )
  )
    .filter((time) => time >= campaignStartTime && time <= campaignEndTime)
    .sort((a, b) => a - b);
  const explicitGaps = gapOverrides.map((gap) => ({
    displayDays: Math.max(0.001, gap.displayDays),
    endTime: toTime(gap.end),
    startTime: toTime(gap.start)
  }));

  const compressedSegments = anchorTimes.slice(0, -1).map((startTime, index) => {
    const endTime = anchorTimes[index + 1];
    const rawDays = Math.max(0.001, (endTime - startTime) / dayMs);
    const explicitGap = explicitGaps.find((gap) => gap.startTime === startTime && gap.endTime === endTime);
    const hasActiveOperation =
      operationSpans.length === 0 ||
      operationSpans.some((span) => startTime < span.endTime && endTime > span.startTime);
    const displayDays =
      timingMode === "compressed" && explicitGap
        ? explicitGap.displayDays
        : timingMode === "compressed" && !hasActiveOperation
        ? Math.max(0.001, inactiveGapDisplayDays)
        : timingMode === "compressed" && rawDays > maxGapDays
        ? maxGapDays + (rawDays - maxGapDays) * gapScale
        : rawDays;
    return {
      displayDays,
      displayEnd: 0,
      displayStart: 0,
      endTime,
      rawDays,
      startTime
    };
  });

  let displayCursor = 0;
  for (const segment of compressedSegments) {
    segment.displayStart = displayCursor;
    displayCursor += segment.displayDays;
    segment.displayEnd = displayCursor;
  }
  const displayDuration = timingMode === "compressed" ? Math.max(0.001, displayCursor) : campaignDuration / dayMs;

  const timeToDisplayDays = (time: number) => {
    if (timingMode !== "compressed") {
      return (time - campaignStartTime) / dayMs;
    }

    const bounded = Math.min(campaignEndTime, Math.max(campaignStartTime, time));
    const segment =
      compressedSegments.find((item, index) =>
        bounded >= item.startTime && (bounded < item.endTime || index === compressedSegments.length - 1)
      ) ?? compressedSegments.at(-1);

    if (!segment) {
      return 0;
    }

    const ratio = (bounded - segment.startTime) / Math.max(1, segment.endTime - segment.startTime);
    return segment.displayStart + segment.displayDays * ratio;
  };

  const displayDaysToTime = (displayDays: number) => {
    if (timingMode !== "compressed") {
      return campaignStartTime + displayDays * dayMs;
    }

    const bounded = Math.min(displayDuration, Math.max(0, displayDays));
    const segment =
      compressedSegments.find((item, index) =>
        bounded >= item.displayStart && (bounded < item.displayEnd || index === compressedSegments.length - 1)
      ) ?? compressedSegments.at(-1);

    if (!segment) {
      return campaignStartTime;
    }

    const ratio = (bounded - segment.displayStart) / Math.max(0.001, segment.displayDays);
    return segment.startTime + (segment.endTime - segment.startTime) * ratio;
  };

  const dateToProgress = (date: string) => timeToDisplayDays(toTime(date)) / displayDuration;

  const displayDaysAtProgress = (progress: number) => displayDuration * clampProgress(progress);

  const progressToDate = (progress: number, stepDays = 1) => {
    const bounded = Math.min(1, Math.max(0, progress));
    const time = displayDaysToTime(displayDuration * bounded);
    const stepMs = stepDays >= 1 ? Math.max(1, stepDays) * dayMs : Math.max(1, stepDays * dayMs);
    const steppedOffset = Math.round((time - campaignStartTime) / stepMs) * stepMs;
    const steppedTime = campaignStartTime + steppedOffset;
    let wholeDays = Math.floor(steppedTime / dayMs);
    let timeWithinDay = Math.max(0, Math.round(steppedTime - wholeDays * dayMs));

    if (timeWithinDay >= dayMs) {
      wholeDays += 1;
      timeWithinDay -= dayMs;
    }

    const civil = civilFromDays(wholeDays);
    const hour = Math.floor(timeWithinDay / hourMs);
    const minute = Math.floor((timeWithinDay % hourMs) / (60 * 1000));
    return serializeCampaignDate(civil.year, civil.month, civil.day, hour, minute);
  };

  const clampProgress = (progress: number) => Math.min(1, Math.max(0, progress));

  const daysSinceStart = (date: string) => Math.round((toTime(date) - campaignStartTime) / dayMs) + 1;

  const getActiveEvent = (progress: number) => {
    const current = displayDaysToTime(displayDuration * clampProgress(progress));
    let active = events[0];

    for (const event of events) {
      if (toTime(event.date) <= current) {
        active = event;
      }
    }

    return active;
  };

  const getUpcomingEvent = (progress: number) => {
    const current = displayDaysToTime(displayDuration * clampProgress(progress));
    return events.find((event) => toTime(event.date) > current) ?? events.at(-1)!;
  };

  const eventProgress = (eventDate: string, progress: number) => {
    const eventStart = dateToProgress(eventDate);
    const distance = Math.abs(progress - eventStart);
    return Math.max(0, 1 - distance / 0.08);
  };

  const lineProgress = (start: string, end: string, progress: number) => {
    const startProgress = dateToProgress(start);
    const endProgress = dateToProgress(end);
    const span = Math.max(0.001, endProgress - startProgress);
    return clampProgress((progress - startProgress) / span);
  };

  const findPoint = (pointId: string) => {
    const point = points.find((item) => item.id === pointId);
    if (!point) {
      throw new Error(`Unknown map point: ${pointId}`);
    }
    return point;
  };

  return {
    campaignStartTime,
    campaignEndTime,
    campaignDuration,
    clampProgress,
    dateToProgress,
    daysSinceStart,
    displayDaysAtProgress,
    eventProgress,
    findPoint,
    getActiveEvent,
    getUpcomingEvent,
    lineProgress,
    progressToDate
  };
}
