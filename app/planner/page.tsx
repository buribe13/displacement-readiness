/**
 * PLANNER PAGE
 *
 * Primary temporal planning interface for outreach organizations.
 *
 * DESIGN PHILOSOPHY:
 * Time is the dominant dimension. This page presents a timeline-first view
 * of outreach windows, with maps relegated to an optional secondary tab.
 *
 * The interface is designed to be:
 * - Calm: muted colors, no alarming visuals
 * - Operational: clear, actionable information
 * - Accessible: WCAG 2.1 AA compliant
 * - Trustworthy: transparent about data sources and limitations
 */

import { Suspense } from "react";
import { PlannerClient } from "./PlannerClient";
import type { TemporalSignalsResponse } from "@/lib/temporal/types";
import type { OutreachWindowsResponse } from "@/lib/temporal/aggregate";

async function getSignals(): Promise<TemporalSignalsResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/temporal/signals`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch temporal signals");
  return res.json();
}

async function getWindows(): Promise<OutreachWindowsResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/temporal/windows`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch outreach windows");
  return res.json();
}

async function PlannerContent() {
  const [signalsData, windowsData] = await Promise.all([
    getSignals(),
    getWindows(),
  ]);

  return (
    <PlannerClient
      initialSignals={signalsData.signals}
      initialWindows={windowsData.windows}
      initialOverlaps={windowsData.overlaps}
      meta={signalsData.meta}
    />
  );
}

export default function PlannerPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full flex items-center justify-center bg-muted/20">
          <div className="text-center p-8 rounded-lg border bg-background">
            <div className="text-sm font-medium">Loading planner...</div>
            <div className="text-xs text-muted-foreground mt-2">
              Computing outreach windows
            </div>
          </div>
        </div>
      }
    >
      <PlannerContent />
    </Suspense>
  );
}

