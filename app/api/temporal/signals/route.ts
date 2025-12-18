/**
 * TEMPORAL SIGNALS API ROUTE
 *
 * Returns normalized temporal signals for the Outreach Window Planner.
 *
 * ETHICAL DESIGN DECISIONS:
 *
 * 1. ALL DATA IS DELAYED OR SIMULATED
 *    This endpoint will never return real-time data.
 *    The minimumLatencyHours in the response confirms this.
 *
 * 2. MANDATORY DISCLAIMER
 *    Every response includes a disclaimer that must be
 *    displayed in the UI.
 *
 * 3. NO INDIVIDUAL DATA
 *    Signals represent institutional activity and environmental
 *    conditions, never individual people or their locations.
 *
 * 4. TIME-FIRST DESIGN
 *    Unlike geo-first APIs, this returns data structured around
 *    time ranges, with geography as optional context.
 */

import { NextResponse } from "next/server";
import type {
  TemporalSignalsResponse,
  TemporalSignalType,
  ImpactLevel,
} from "@/lib/temporal/types";
import {
  mockTemporalSignals,
  TEMPORAL_DATA_DISCLAIMER,
} from "@/lib/temporal/mock";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Optional filters
  const typeFilter = searchParams.get("type") as TemporalSignalType | null;
  const impactFilter = searchParams.get("impact") as ImpactLevel | null;
  const horizonDays = parseInt(searchParams.get("horizon") || "14", 10);

  // Calculate time horizon
  const now = new Date();
  const horizonEnd = new Date(
    now.getTime() + horizonDays * 24 * 60 * 60 * 1000
  );

  // Filter signals
  let signals = [...mockTemporalSignals];

  // Filter by type if specified
  if (typeFilter) {
    signals = signals.filter((s) => s.signalType === typeFilter);
  }

  // Filter by impact if specified
  if (impactFilter) {
    signals = signals.filter((s) => s.impactLevel === impactFilter);
  }

  // Filter by time horizon
  signals = signals.filter((signal) => {
    const signalStart = new Date(signal.timeRange.start);
    const signalEnd = new Date(signal.timeRange.end);
    // Signal overlaps with horizon if it starts before horizon ends AND ends after now
    return signalStart <= horizonEnd && signalEnd >= now;
  });

  // Sort by start time
  signals.sort(
    (a, b) =>
      new Date(a.timeRange.start).getTime() -
      new Date(b.timeRange.start).getTime()
  );

  // Calculate minimum latency across all signals
  const minimumLatencyHours =
    signals.length > 0
      ? Math.min(...signals.map((s) => s.dataLatencyHours))
      : 24; // Default to 24 if no signals

  // Check if any signals are simulated
  const containsSimulatedData = signals.some((s) => s.isSimulated);

  const response: TemporalSignalsResponse = {
    signals,
    meta: {
      generatedAt: new Date().toISOString(),
      count: signals.length,
      minimumLatencyHours,
      containsSimulatedData,
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
 * HEAD request for checking API availability without fetching data.
 */
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "X-Data-Simulated": "true",
      "X-Minimum-Latency-Hours": "24",
      "X-Data-Type": "temporal-signals",
    },
  });
}
