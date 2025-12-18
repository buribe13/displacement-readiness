/**
 * SCENARIO MODE API ROUTE
 *
 * Returns speculative windows adjusted for major event scenarios.
 *
 * ETHICAL DESIGN DECISIONS:
 *
 * 1. CLEARLY LABELED SPECULATIVE
 *    All outputs from this endpoint are marked as speculative.
 *    This is for "what if" planning, not prediction.
 *
 * 2. CONSERVATIVE ADJUSTMENTS
 *    Scenario adjustments compress safer windows and expand
 *    disruption windows. This encourages proactive planning.
 *
 * 3. EDUCATIONAL PURPOSE
 *    This helps organizations understand how major events
 *    might affect their outreach capacity, enabling advance
 *    preparation rather than reactive responses.
 *
 * IMPORTANT: This endpoint is for planning exercises only.
 * Actual event timing and impacts will differ.
 */

import { NextResponse } from "next/server";
import {
  mockTemporalSignals,
  TEMPORAL_DATA_DISCLAIMER,
} from "@/lib/temporal/mock";
import {
  computeOutreachWindows,
  findSignalOverlaps,
  applyScenarioMode,
  type OutreachWindowsResponse,
} from "@/lib/temporal/aggregate";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Scenario type (default: olympics)
  const scenarioType = (searchParams.get("scenario") || "olympics") as
    | "olympics"
    | "majorEvent";

  // Time horizon in days (default 14)
  const horizonDays = parseInt(searchParams.get("horizon") || "14", 10);

  // Calculate time horizon
  const now = new Date();
  const horizonEnd = new Date(
    now.getTime() + horizonDays * 24 * 60 * 60 * 1000
  );

  // Filter signals to horizon
  const signals = mockTemporalSignals.filter((signal) => {
    const signalStart = new Date(signal.timeRange.start);
    const signalEnd = new Date(signal.timeRange.end);
    return signalStart <= horizonEnd && signalEnd >= now;
  });

  // Compute base windows
  const baseWindows = computeOutreachWindows(signals, horizonDays);

  // Apply scenario adjustments
  const scenarioWindows = applyScenarioMode(baseWindows, scenarioType);

  // Overlaps remain the same but we add scenario context
  const overlaps = findSignalOverlaps(signals).map((overlap) => ({
    ...overlap,
    id: `scenario-${overlap.id}`,
    whyItMatters: `SPECULATIVE: ${overlap.whyItMatters} During major events, overlapping signals have compounded effects.`,
  }));

  const scenarioDescription =
    scenarioType === "olympics"
      ? "LA 2028 Olympics preparation period"
      : "Generic major event scenario";

  const response: OutreachWindowsResponse = {
    windows: scenarioWindows,
    overlaps,
    meta: {
      generatedAt: new Date().toISOString(),
      timeHorizon: {
        start: now.toISOString(),
        end: horizonEnd.toISOString(),
      },
      disclaimer: `
SPECULATIVE SCENARIO: ${scenarioDescription}

${TEMPORAL_DATA_DISCLAIMER}

ADDITIONAL SCENARIO DISCLAIMER:
This scenario mode shows HYPOTHETICAL adjustments to outreach windows.
Actual event timing, locations, and impacts will differ significantly.
Use only for long-range planning discussions and capacity exercises.
      `.trim(),
    },
  };

  return NextResponse.json(response);
}

/**
 * HEAD request for checking API availability.
 */
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "X-Data-Simulated": "true",
      "X-Data-Type": "scenario-windows",
      "X-Scenario-Mode": "true",
    },
  });
}

