/**
 * OUTREACH WINDOWS API ROUTE
 *
 * Returns computed outreach windows and signal overlaps.
 *
 * ETHICAL DESIGN DECISIONS:
 *
 * 1. EXPLAINABLE AGGREGATION
 *    Every window includes a plain-language explanation of why
 *    it's categorized that way. No black-box predictions.
 *
 * 2. CONSERVATIVE CONFIDENCE
 *    When aggregating signals, we use the lowest confidence level
 *    from contributing signals. This prevents overconfidence.
 *
 * 3. NON-PRESCRIPTIVE GUIDANCE
 *    Suggested approaches are framed as coordination aids,
 *    not enforcement guidance.
 *
 * 4. OVERLAP TRANSPARENCY
 *    When signals overlap, we explicitly explain why that matters
 *    for outreach planning.
 */

import { NextResponse } from "next/server";
import {
  mockTemporalSignals,
  TEMPORAL_DATA_DISCLAIMER,
} from "@/lib/temporal/mock";
import {
  computeOutreachWindows,
  findSignalOverlaps,
  type OutreachWindowsResponse,
} from "@/lib/temporal/aggregate";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

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

  // Compute windows and overlaps
  const windows = computeOutreachWindows(signals, horizonDays);
  const overlaps = findSignalOverlaps(signals);

  const response: OutreachWindowsResponse = {
    windows,
    overlaps,
    meta: {
      generatedAt: new Date().toISOString(),
      timeHorizon: {
        start: now.toISOString(),
        end: horizonEnd.toISOString(),
      },
      disclaimer: TEMPORAL_DATA_DISCLAIMER,
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
      "X-Data-Type": "outreach-windows",
    },
  });
}

