/**
 * TEMPORAL SIGNAL AGGREGATION
 *
 * This module computes outreach windows and signal overlaps from raw temporal signals.
 *
 * DESIGN PHILOSOPHY:
 * We transform discrete signals into continuous time understanding:
 * - "Safer" windows: periods with low cumulative impact
 * - "Caution" windows: periods with moderate impact
 * - "High disruption" periods: times to avoid or approach differently
 *
 * The algorithm is intentionally simple and explainable. This is a planning
 * aid, not a predictive model. Every derived window includes plain-language
 * explanation of why it's categorized that way.
 *
 * ETHICAL NOTES:
 * - Aggregation never involves individual data
 * - "Safer" refers to outreach effectiveness, not personal safety predictions
 * - All outputs include confidence levels and source transparency
 */

import type { TemporalSignal, ImpactLevel, ConfidenceLevel } from "./types";

/**
 * Types of outreach windows derived from signal analysis.
 */
export type WindowType = "safer" | "caution" | "highDisruption";

/**
 * An outreach window represents a contiguous time period with
 * consistent outreach conditions.
 */
export interface OutreachWindow {
  /** Unique identifier */
  id: string;

  /** Category of this window */
  windowType: WindowType;

  /** Time range of this window */
  timeRange: {
    start: string;
    end: string;
  };

  /** Signals that contribute to this window's categorization */
  driverSignalIds: string[];

  /**
   * Plain-language explanation of why this window is categorized this way.
   * This is REQUIRED and should be human-readable.
   */
  plainLanguageWhy: string;

  /**
   * Summary of confidence levels from contributing signals.
   * Helps users understand reliability.
   */
  confidenceSummary: ConfidenceLevel;

  /**
   * Suggested approach for this window (non-prescriptive).
   * Framed as coordination guidance, not orders.
   */
  suggestedApproach: string;

  /** Computed impact score (internal, for sorting) */
  impactScore: number;
}

/**
 * Signal overlap represents a period where multiple disruptive signals coincide.
 */
export interface SignalOverlap {
  /** Unique identifier */
  id: string;

  /** Time range of the overlap */
  timeRange: {
    start: string;
    end: string;
  };

  /** IDs of overlapping signals */
  signalIds: string[];

  /** Plain-language explanation of why this overlap matters */
  whyItMatters: string;

  /** Combined impact level */
  combinedImpact: ImpactLevel;
}

/**
 * Response type for the windows API.
 */
export interface OutreachWindowsResponse {
  windows: OutreachWindow[];
  overlaps: SignalOverlap[];
  meta: {
    generatedAt: string;
    timeHorizon: {
      start: string;
      end: string;
    };
    disclaimer: string;
  };
}

/**
 * Impact weights for aggregation.
 * Higher weight = more consideration needed.
 */
const IMPACT_WEIGHTS: Record<ImpactLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

/**
 * Window thresholds (impact score per hour bucket).
 */
const WINDOW_THRESHOLDS = {
  safer: 1, // Score <= 1: safer window
  caution: 2, // Score <= 2: caution window
  // Score > 2: high disruption
};

/**
 * Compute the aggregate confidence level from a set of signals.
 * Uses the lowest confidence (most conservative).
 */
function aggregateConfidence(signals: TemporalSignal[]): ConfidenceLevel {
  if (signals.length === 0) return "low";

  const hasLow = signals.some((s) => s.confidenceLevel === "low");
  const hasMedium = signals.some((s) => s.confidenceLevel === "medium");

  if (hasLow) return "low";
  if (hasMedium) return "medium";
  return "high";
}

/**
 * Generate a plain-language explanation for a window.
 */
function generateWindowExplanation(
  windowType: WindowType,
  driverSignals: TemporalSignal[]
): string {
  if (driverSignals.length === 0) {
    return "No significant signals affecting this time period. Standard outreach conditions expected.";
  }

  const signalDescriptions = driverSignals
    .map((s) => s.description.toLowerCase())
    .slice(0, 3); // Limit to 3 for readability

  switch (windowType) {
    case "safer":
      if (driverSignals.length === 0) {
        return "No disruptive signals in this period. Good conditions for standard outreach activities.";
      }
      return `Low-impact signals (${signalDescriptions.join(
        "; "
      )}). Generally good conditions for outreach with minor considerations.`;

    case "caution":
      return `Moderate activity expected: ${signalDescriptions.join(
        "; "
      )}. Outreach is feasible but may require adjusted timing or approach.`;

    case "highDisruption":
      return `Multiple or high-impact signals: ${signalDescriptions.join(
        "; "
      )}. Consider alternative timing or proactive coordination before this period.`;
  }
}

/**
 * Generate suggested approach for a window type.
 */
function generateSuggestedApproach(
  windowType: WindowType,
  _driverSignals: TemporalSignal[] // Reserved for signal-specific guidance
): string {
  switch (windowType) {
    case "safer":
      return "Standard outreach approach. Good time for relationship-building, needs assessment, and service connections.";

    case "caution":
      return "Consider morning or late afternoon timing. Coordinate with partner organizations. Have alternative locations ready for conversations.";

    case "highDisruption":
      return "Focus on proactive outreach 24-48 hours before this period. Share information about what's coming. Connect people with services they may need.";
  }
}

/**
 * Find overlaps between signals.
 */
export function findSignalOverlaps(signals: TemporalSignal[]): SignalOverlap[] {
  const overlaps: SignalOverlap[] = [];
  const processedPairs = new Set<string>();

  // Only consider medium and high impact signals for overlaps
  const impactfulSignals = signals.filter(
    (s) => s.impactLevel === "medium" || s.impactLevel === "high"
  );

  for (let i = 0; i < impactfulSignals.length; i++) {
    for (let j = i + 1; j < impactfulSignals.length; j++) {
      const a = impactfulSignals[i];
      const b = impactfulSignals[j];

      // Check for time overlap
      const aStart = new Date(a.timeRange.start);
      const aEnd = new Date(a.timeRange.end);
      const bStart = new Date(b.timeRange.start);
      const bEnd = new Date(b.timeRange.end);

      if (aStart < bEnd && aEnd > bStart) {
        // Overlaps!
        const pairKey = [a.id, b.id].sort().join("-");
        if (processedPairs.has(pairKey)) continue;
        processedPairs.add(pairKey);

        const overlapStart = new Date(
          Math.max(aStart.getTime(), bStart.getTime())
        );
        const overlapEnd = new Date(Math.min(aEnd.getTime(), bEnd.getTime()));

        // Calculate combined impact
        const combinedScore =
          IMPACT_WEIGHTS[a.impactLevel] + IMPACT_WEIGHTS[b.impactLevel];
        const combinedImpact: ImpactLevel =
          combinedScore >= 5 ? "high" : combinedScore >= 3 ? "medium" : "low";

        overlaps.push({
          id: `overlap-${a.id}-${b.id}`,
          timeRange: {
            start: overlapStart.toISOString(),
            end: overlapEnd.toISOString(),
          },
          signalIds: [a.id, b.id],
          whyItMatters: `Two significant signals overlap: "${a.description}" and "${b.description}". When multiple disruptive factors coincide, the combined effect on outreach effectiveness is greater than each alone. Consider proactive coordination.`,
          combinedImpact,
        });
      }
    }
  }

  return overlaps.sort(
    (a, b) =>
      new Date(a.timeRange.start).getTime() -
      new Date(b.timeRange.start).getTime()
  );
}

/**
 * Compute outreach windows from signals.
 *
 * Algorithm:
 * 1. Create hourly buckets for the time horizon
 * 2. For each bucket, sum impact weights of active signals
 * 3. Categorize buckets into window types
 * 4. Merge contiguous buckets of same type into windows
 */
export function computeOutreachWindows(
  signals: TemporalSignal[],
  horizonDays: number = 14
): OutreachWindow[] {
  const now = new Date();
  const endDate = new Date(now.getTime() + horizonDays * 24 * 60 * 60 * 1000);

  // Create hourly buckets
  interface Bucket {
    start: Date;
    end: Date;
    score: number;
    signals: TemporalSignal[];
  }

  const buckets: Bucket[] = [];
  const bucketDurationMs = 60 * 60 * 1000; // 1 hour

  for (
    let time = now.getTime();
    time < endDate.getTime();
    time += bucketDurationMs
  ) {
    const bucketStart = new Date(time);
    const bucketEnd = new Date(time + bucketDurationMs);

    // Find signals active during this bucket
    const activeSignals = signals.filter((signal) => {
      const signalStart = new Date(signal.timeRange.start);
      const signalEnd = new Date(signal.timeRange.end);
      return signalStart < bucketEnd && signalEnd > bucketStart;
    });

    // Calculate impact score
    const score = activeSignals.reduce(
      (sum, signal) => sum + IMPACT_WEIGHTS[signal.impactLevel],
      0
    );

    buckets.push({
      start: bucketStart,
      end: bucketEnd,
      score,
      signals: activeSignals,
    });
  }

  // Categorize buckets
  function getWindowType(score: number): WindowType {
    if (score <= WINDOW_THRESHOLDS.safer) return "safer";
    if (score <= WINDOW_THRESHOLDS.caution) return "caution";
    return "highDisruption";
  }

  // Merge contiguous buckets of same type
  const windows: OutreachWindow[] = [];
  let currentWindow: {
    type: WindowType;
    startBucket: Bucket;
    endBucket: Bucket;
    signals: Set<TemporalSignal>;
    maxScore: number;
  } | null = null;

  for (const bucket of buckets) {
    const bucketType = getWindowType(bucket.score);

    if (!currentWindow) {
      // Start new window
      currentWindow = {
        type: bucketType,
        startBucket: bucket,
        endBucket: bucket,
        signals: new Set(bucket.signals),
        maxScore: bucket.score,
      };
    } else if (currentWindow.type === bucketType) {
      // Extend current window
      currentWindow.endBucket = bucket;
      bucket.signals.forEach((s) => currentWindow!.signals.add(s));
      currentWindow.maxScore = Math.max(currentWindow.maxScore, bucket.score);
    } else {
      // Close current window and start new one
      const driverSignals = Array.from(currentWindow.signals);
      windows.push({
        id: `window-${windows.length + 1}`,
        windowType: currentWindow.type,
        timeRange: {
          start: currentWindow.startBucket.start.toISOString(),
          end: currentWindow.endBucket.end.toISOString(),
        },
        driverSignalIds: driverSignals.map((s) => s.id),
        plainLanguageWhy: generateWindowExplanation(
          currentWindow.type,
          driverSignals
        ),
        confidenceSummary: aggregateConfidence(driverSignals),
        suggestedApproach: generateSuggestedApproach(
          currentWindow.type,
          driverSignals
        ),
        impactScore: currentWindow.maxScore,
      });

      currentWindow = {
        type: bucketType,
        startBucket: bucket,
        endBucket: bucket,
        signals: new Set(bucket.signals),
        maxScore: bucket.score,
      };
    }
  }

  // Close final window
  if (currentWindow) {
    const finalDriverSignals = Array.from(currentWindow.signals);
    windows.push({
      id: `window-${windows.length + 1}`,
      windowType: currentWindow.type,
      timeRange: {
        start: currentWindow.startBucket.start.toISOString(),
        end: currentWindow.endBucket.end.toISOString(),
      },
      driverSignalIds: finalDriverSignals.map((s) => s.id),
      plainLanguageWhy: generateWindowExplanation(
        currentWindow.type,
        finalDriverSignals
      ),
      confidenceSummary: aggregateConfidence(finalDriverSignals),
      suggestedApproach: generateSuggestedApproach(
        currentWindow.type,
        finalDriverSignals
      ),
      impactScore: currentWindow.maxScore,
    });
  }

  // Merge very short windows (less than 2 hours) into neighbors
  // This prevents fragmented UI
  const mergedWindows: OutreachWindow[] = [];
  for (const window of windows) {
    const durationMs =
      new Date(window.timeRange.end).getTime() -
      new Date(window.timeRange.start).getTime();
    const durationHours = durationMs / (60 * 60 * 1000);

    if (durationHours < 2 && mergedWindows.length > 0) {
      // Merge into previous window
      const prev = mergedWindows[mergedWindows.length - 1];
      prev.timeRange.end = window.timeRange.end;
      // Keep the higher impact type
      if (
        IMPACT_WEIGHTS[window.windowType as ImpactLevel] >
        IMPACT_WEIGHTS[prev.windowType as ImpactLevel]
      ) {
        prev.windowType = window.windowType;
        prev.plainLanguageWhy = window.plainLanguageWhy;
        prev.suggestedApproach = window.suggestedApproach;
      }
      prev.driverSignalIds = [
        ...new Set([...prev.driverSignalIds, ...window.driverSignalIds]),
      ];
    } else {
      mergedWindows.push(window);
    }
  }

  return mergedWindows;
}

/**
 * Apply scenario mode adjustments (e.g., Olympics compression).
 *
 * ETHICAL NOTE: This is clearly labeled as SPECULATIVE.
 * It's for "what if" planning, not prediction.
 */
export function applyScenarioMode(
  windows: OutreachWindow[],
  scenarioType: "olympics" | "majorEvent"
): OutreachWindow[] {
  // scenarioType can be used to customize adjustments per scenario
  const compressionFactor = scenarioType === "olympics" ? 0.7 : 0.8;
  // In scenario mode, we compress safer windows and expand disruption windows
  // This simulates how major events reduce available outreach time

  return windows.map((window) => {
    if (window.windowType === "safer") {
      // Reduce safer windows based on scenario
      const start = new Date(window.timeRange.start);
      const end = new Date(window.timeRange.end);
      const duration = end.getTime() - start.getTime();
      const newDuration = duration * compressionFactor;
      const newEnd = new Date(start.getTime() + newDuration);

      return {
        ...window,
        id: `scenario-${window.id}`,
        timeRange: {
          start: window.timeRange.start,
          end: newEnd.toISOString(),
        },
        plainLanguageWhy: `SPECULATIVE: ${window.plainLanguageWhy} During major events, available windows compress due to increased institutional activity.`,
        suggestedApproach: `SPECULATIVE: ${window.suggestedApproach} Consider pre-event outreach to maximize available time.`,
      };
    } else if (window.windowType === "caution") {
      // Upgrade some caution to high disruption
      return {
        ...window,
        id: `scenario-${window.id}`,
        windowType: "highDisruption" as WindowType,
        plainLanguageWhy: `SPECULATIVE: ${window.plainLanguageWhy} Major events typically increase impact of existing signals.`,
        suggestedApproach: `SPECULATIVE: Focus resources on pre-event and post-event windows rather than during.`,
      };
    }

    return {
      ...window,
      id: `scenario-${window.id}`,
      plainLanguageWhy: `SPECULATIVE: ${window.plainLanguageWhy}`,
    };
  });
}
