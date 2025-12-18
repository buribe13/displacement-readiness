/**
 * MOCK TEMPORAL SIGNALS
 *
 * This file contains SIMULATED data shaped like real LA civic datasets.
 * All data here is fictional and intended for prototype demonstration only.
 *
 * DATA SOURCES SIMULATED:
 * - LA Sanitation cleanup schedules
 * - FilmLA / Special Events permits
 * - LAHSA shelter intake hours
 * - Metro service advisories
 * - Known service capacity patterns
 *
 * ETHICAL NOTES:
 * - All timestamps are relative to "now" for demo purposes
 * - All locations are generalized to neighborhood level
 * - No individual-level data is included
 * - All signals are marked as `isSimulated: true`
 *
 * TIME-FIRST DESIGN:
 * Unlike the previous geo-first signals, these are structured around
 * time ranges first, with geography as optional context.
 */

import type { TemporalSignal, TemporalSignalType, ImpactLevel } from "./types";

/**
 * Generate a date string offset from now.
 * Negative hours = past, positive = future.
 */
function offsetDate(hoursFromNow: number): string {
  const date = new Date();
  date.setHours(date.getHours() + hoursFromNow);
  return date.toISOString();
}

/**
 * Generate a time range from now.
 */
function timeRange(startHoursFromNow: number, durationHours: number) {
  return {
    start: offsetDate(startHoursFromNow),
    end: offsetDate(startHoursFromNow + durationHours),
    timezone: "America/Los_Angeles" as const,
  };
}

/**
 * MOCK SANITATION CYCLE SIGNALS
 * Regular cleanup schedules that affect area access.
 */
const sanitationSignals: TemporalSignal[] = [
  {
    id: "san-001",
    signalType: "sanitationCycle",
    source: "LA Sanitation (Simulated)",
    timeRange: timeRange(48, 4), // 2 days from now, 4 hours
    impactLevel: "high",
    confidenceLevel: "high",
    description: "Scheduled cleanup: Vermont Ave corridor, 6am-10am",
    interpretationNotes:
      "Cleanup periods typically see increased institutional activity. Consider conducting outreach 24-48 hours before to connect with individuals who may need to relocate temporarily. This is a coordination opportunity, not an emergency.",
    dataLatencyHours: 24,
    isSimulated: true,
    geographyHint: {
      neighborhood: "Koreatown",
      description: "Vermont Ave between Wilshire and 6th",
    },
  },
  {
    id: "san-002",
    signalType: "sanitationCycle",
    source: "LA Sanitation (Simulated)",
    timeRange: timeRange(72, 6), // 3 days from now, 6 hours
    impactLevel: "high",
    confidenceLevel: "high",
    description: "Scheduled cleanup: Wilshire Blvd corridor, 7am-1pm",
    interpretationNotes:
      "Major corridor cleanup. High-traffic commercial area typically sees coordination between multiple service providers. Good time for joint outreach the day before.",
    dataLatencyHours: 24,
    isSimulated: true,
    geographyHint: {
      neighborhood: "Koreatown",
      description: "Wilshire Blvd, Western to Vermont",
    },
  },
  {
    id: "san-003",
    signalType: "sanitationCycle",
    source: "LA Sanitation (Simulated)",
    timeRange: timeRange(120, 3), // 5 days from now, 3 hours
    impactLevel: "medium",
    confidenceLevel: "medium",
    description: "Scheduled cleanup: Normandie residential blocks",
    interpretationNotes:
      "Residential area cleanup. Lower intensity than commercial corridors. Standard outreach timing should work well.",
    dataLatencyHours: 48,
    isSimulated: true,
    geographyHint: {
      neighborhood: "Koreatown",
      description: "Normandie Ave residential area",
    },
  },
];

/**
 * MOCK PUBLIC EVENT SIGNALS
 * Permitted events that increase area activity.
 */
const publicEventSignals: TemporalSignal[] = [
  {
    id: "evt-001",
    signalType: "publicEvent",
    source: "FilmLA (Simulated)",
    timeRange: timeRange(96, 72), // 4 days from now, 3-day shoot
    impactLevel: "medium",
    confidenceLevel: "high",
    description: "Film production: 3-day permit, Wilshire commercial district",
    interpretationNotes:
      "Film productions typically request clear sidewalks in their permit area. Security presence increases. Consider outreach to nearby areas 48 hours before to help people prepare if needed. This is routine city activity.",
    dataLatencyHours: 48,
    isSimulated: true,
    geographyHint: {
      neighborhood: "Koreatown",
      description: "Wilshire Blvd commercial area",
    },
  },
  {
    id: "evt-002",
    signalType: "publicEvent",
    source: "LA Special Events (Simulated)",
    timeRange: timeRange(168, 12), // 7 days from now, 12-hour event
    impactLevel: "high",
    confidenceLevel: "medium",
    description: "Community festival: K-Town Night Market",
    interpretationNotes:
      "Large community event with security perimeter. Outreach in the immediate area will be difficult during event hours. However, event periphery can be a good opportunity for service visibility. Plan outreach for day before or morning after.",
    dataLatencyHours: 72,
    isSimulated: true,
    geographyHint: {
      neighborhood: "Koreatown",
      description: "6th St between Western and Normandie",
    },
  },
  {
    id: "evt-003",
    signalType: "publicEvent",
    source: "Olympics Planning (Simulated)",
    timeRange: timeRange(720, 336), // 30 days from now, 14-day event window
    impactLevel: "high",
    confidenceLevel: "low",
    description: "SPECULATIVE: Olympics-related activity period (2028 prep)",
    interpretationNotes:
      "SPECULATIVE SIGNAL: Based on historical patterns for major international events. Actual dates and areas TBD. Use for long-range planning discussions only. Monitor official announcements.",
    dataLatencyHours: 168,
    isSimulated: true,
    geographyHint: {
      neighborhood: "Koreatown",
      description: "General Koreatown area (speculative)",
    },
  },
];

/**
 * MOCK SHELTER INTAKE SIGNALS
 * Shelter availability windows for referrals.
 */
const shelterIntakeSignals: TemporalSignal[] = [
  {
    id: "shl-001",
    signalType: "shelterIntakeHours",
    source: "LAHSA (Simulated)",
    timeRange: timeRange(24, 4), // Tomorrow, 4-hour intake window
    impactLevel: "low", // Low impact = good time for outreach
    confidenceLevel: "high",
    description: "Shelter intake window: Downtown facility, 2pm-6pm",
    interpretationNotes:
      "POSITIVE SIGNAL: Shelter intake hours are a good time for outreach that includes referrals. Coordinate with case managers who can facilitate warm handoffs. Having this information helps time conversations appropriately.",
    dataLatencyHours: 24,
    isSimulated: true,
  },
  {
    id: "shl-002",
    signalType: "shelterIntakeHours",
    source: "LAHSA (Simulated)",
    timeRange: timeRange(48, 3), // 2 days from now, 3-hour window
    impactLevel: "low",
    confidenceLevel: "medium",
    description: "Shelter intake window: K-Town bridge housing, 3pm-6pm",
    interpretationNotes:
      "POSITIVE SIGNAL: Local bridge housing intake. Particularly useful for outreach in Koreatown as transport barriers are reduced. Confirm availability before making referrals.",
    dataLatencyHours: 24,
    isSimulated: true,
    geographyHint: {
      neighborhood: "Koreatown",
      description: "Bridge housing facility",
    },
  },
];

/**
 * MOCK TRANSIT DISRUPTION SIGNALS
 * Service changes affecting mobility.
 */
const transitSignals: TemporalSignal[] = [
  {
    id: "trn-001",
    signalType: "transitDisruption",
    source: "LA Metro (Simulated)",
    timeRange: timeRange(12, 48), // 12 hours from now, weekend maintenance
    impactLevel: "medium",
    confidenceLevel: "high",
    description:
      "Purple Line: Wilshire/Western station closure, weekend maintenance",
    interpretationNotes:
      "Station closure affects mobility for everyone in the area. People may need to travel further to access transit. Consider this when planning outreach timing—some individuals may be less mobile. Also affects your team's travel.",
    dataLatencyHours: 24,
    isSimulated: true,
    geographyHint: {
      neighborhood: "Koreatown",
      description: "Near Wilshire/Western Metro station",
    },
  },
  {
    id: "trn-002",
    signalType: "transitDisruption",
    source: "LA Metro (Simulated)",
    timeRange: timeRange(240, 72), // 10 days from now, 3-day disruption
    impactLevel: "low",
    confidenceLevel: "medium",
    description: "Bus route detour: Line 20 on Wilshire, construction-related",
    interpretationNotes:
      "Minor route change. May affect some individuals' routines. Generally not significant for outreach planning, but worth noting for comprehensive awareness.",
    dataLatencyHours: 48,
    isSimulated: true,
    geographyHint: {
      neighborhood: "Koreatown",
      description: "Wilshire corridor",
    },
  },
];

/**
 * MOCK SERVICE BOTTLENECK SIGNALS
 * Known capacity constraints at service points.
 */
const bottleneckSignals: TemporalSignal[] = [
  {
    id: "btl-001",
    signalType: "serviceBottleneck",
    source: "Coalition Partner Reports (Simulated)",
    timeRange: timeRange(0, 168), // Current week
    impactLevel: "medium",
    confidenceLevel: "low",
    description: "Elevated demand: Downtown service hub, morning hours",
    interpretationNotes:
      "PATTERN SIGNAL: Based on aggregated reports, morning hours (8am-11am) at downtown service hubs are seeing higher demand than capacity. Consider afternoon outreach or alternative service referrals during this period.",
    dataLatencyHours: 72,
    isSimulated: true,
  },
  {
    id: "btl-002",
    signalType: "serviceBottleneck",
    source: "Coalition Partner Reports (Simulated)",
    timeRange: timeRange(48, 24), // 2 days from now, 1 day
    impactLevel: "high",
    confidenceLevel: "medium",
    description: "Service gap: K-Town meal program closed for renovation",
    interpretationNotes:
      "A regular meal service in Koreatown will be temporarily unavailable. This may affect daily patterns for people who rely on this service. Coordinate with alternative meal programs and be prepared to share this information during outreach.",
    dataLatencyHours: 24,
    isSimulated: true,
    geographyHint: {
      neighborhood: "Koreatown",
      description: "Near Olympic/Vermont",
    },
  },
];

/**
 * All mock signals combined.
 * Export for use in API routes.
 */
export const mockTemporalSignals: TemporalSignal[] = [
  ...sanitationSignals,
  ...publicEventSignals,
  ...shelterIntakeSignals,
  ...transitSignals,
  ...bottleneckSignals,
];

/**
 * Get signals filtered by type.
 */
export function getSignalsByType(type: TemporalSignalType): TemporalSignal[] {
  return mockTemporalSignals.filter((signal) => signal.signalType === type);
}

/**
 * Get signals within a time range.
 */
export function getSignalsInRange(
  startDate: Date,
  endDate: Date
): TemporalSignal[] {
  return mockTemporalSignals.filter((signal) => {
    const signalStart = new Date(signal.timeRange.start);
    const signalEnd = new Date(signal.timeRange.end);
    // Signal overlaps with range if it starts before range ends AND ends after range starts
    return signalStart <= endDate && signalEnd >= startDate;
  });
}

/**
 * Get signals by impact level.
 */
export function getSignalsByImpact(level: ImpactLevel): TemporalSignal[] {
  return mockTemporalSignals.filter((signal) => signal.impactLevel === level);
}

/**
 * The standard disclaimer that MUST accompany all temporal signal data.
 */
export const TEMPORAL_DATA_DISCLAIMER = `
This planner displays SIMULATED and DELAYED data for demonstration purposes.
It is designed for temporal planning by housing/homelessness outreach organizations.

THIS TOOL DOES NOT:
• Track individuals or their locations
• Show real-time law enforcement activity
• Predict individual displacement events
• Provide enforcement guidance
• Replace direct community engagement

Data should inform coordination and planning, not drive reactive responses.
All signals are at least 24 hours delayed by design.
`.trim();
