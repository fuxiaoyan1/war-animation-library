import { battleEvents, campaignEnd, campaignStart, mapPoints } from "../data/battleOfFrance";
import { createCampaignTimeline, formatCampaignDate, toTime } from "./campaignTimeline";

export { toTime };

const battleOfFranceTimeline = createCampaignTimeline({
  campaignStart,
  campaignEnd,
  events: battleEvents,
  points: mapPoints
});

export const campaignStartTime = battleOfFranceTimeline.campaignStartTime;
export const campaignEndTime = battleOfFranceTimeline.campaignEndTime;
export const campaignDuration = battleOfFranceTimeline.campaignDuration;
export const dateToProgress = battleOfFranceTimeline.dateToProgress;
export const progressToDate = battleOfFranceTimeline.progressToDate;
export const clampProgress = battleOfFranceTimeline.clampProgress;
export const daysSinceStart = battleOfFranceTimeline.daysSinceStart;
export const getActiveEvent = battleOfFranceTimeline.getActiveEvent;
export const getUpcomingEvent = battleOfFranceTimeline.getUpcomingEvent;
export const eventProgress = battleOfFranceTimeline.eventProgress;
export const lineProgress = battleOfFranceTimeline.lineProgress;
export const findPoint = battleOfFranceTimeline.findPoint;

export function formatChineseDate(date: string) {
  return formatCampaignDate(date);
}

export function interpolatePoint(
  from: [number, number],
  to: [number, number],
  progress: number
): [number, number] {
  const eased = 1 - Math.pow(1 - clampProgress(progress), 3);
  return [from[0] + (to[0] - from[0]) * eased, from[1] + (to[1] - from[1]) * eased];
}
